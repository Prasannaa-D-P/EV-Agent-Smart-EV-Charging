import json
from datetime import datetime
from typing import Dict, Any, List
from ..database import get_db
from .duplicate_detector import DuplicateDetector
from .conflict_detector import ConflictDetector
from .data_quality import DataQualityEngine
from ..adapters.openchargemap import OpenChargeMapAdapter
from ..adapters.overpass import OverpassAdapter
from ..adapters.bee import BEEAdapter
from ..adapters.tnev import TNEVAdapter

class OSINTSyncService:
    """
    Central pipeline orchestrating fetching, normalization, deduplication,
    conflict detection, persistence, and audit logging.
    """

    ADAPTER_REGISTRY = {
        "OPEN_CHARGE_MAP": OpenChargeMapAdapter,
        "OPENSTREETMAP": OverpassAdapter,
        "BEE": BEEAdapter,
        "TNEV": TNEVAdapter
    }

    @classmethod
    def sync_sources(cls, sources_to_sync: List[str] = None) -> Dict[str, Any]:
        if not sources_to_sync:
            sources_to_sync = ["OPEN_CHARGE_MAP", "OPENSTREETMAP", "BEE"]

        conn = get_db()
        cursor = conn.cursor()
        total_stats = {
            "sources_synced": len(sources_to_sync),
            "records_received": 0,
            "records_accepted": 0,
            "records_rejected": 0,
            "duplicates_found": 0,
            "conflicts_found": 0,
            "details": []
        }

        for src_name in sources_to_sync:
            adapter_cls = cls.ADAPTER_REGISTRY.get(src_name)
            if not adapter_cls:
                continue

            adapter = adapter_cls()
            started_at = datetime.utcnow().isoformat() + "Z"
            records_received = 0
            records_accepted = 0
            records_rejected = 0
            duplicates = 0
            conflicts = 0
            err_msg = None

            try:
                raw_records = adapter.fetch()
                records_received = len(raw_records)
                normalized = adapter.normalize(raw_records)
                valid_records = adapter.validate(normalized)
                records_rejected = len(raw_records) - len(valid_records)

                for rec in valid_records:
                    rec["data_quality"] = DataQualityEngine.evaluate_station(rec)

                    # Check for duplicate against existing database entities
                    matching_entity_id = DuplicateDetector.find_matching_entity(rec)

                    if matching_entity_id:
                        duplicates += 1
                        # Load existing canonical record
                        cursor.execute("SELECT * FROM stations WHERE station_entity_id = ?", (matching_entity_id,))
                        existing_row = cursor.fetchone()
                        existing_dict = dict(existing_row) if existing_row else {}

                        # Detect field-level conflicts
                        field_conflicts = ConflictDetector.check_and_log_conflicts(
                            matching_entity_id,
                            existing_dict,
                            rec,
                            src_name
                        )
                        conflicts += len(field_conflicts)

                        # Record provenance link in station_sources
                        cursor.execute("""
                        INSERT INTO station_sources (station_entity_id, source, source_record_id, raw_data_json, retrieved_at)
                        VALUES (?, ?, ?, ?, ?)
                        """, (
                            matching_entity_id,
                            src_name,
                            rec.get("station_id"),
                            json.dumps(rec),
                            datetime.utcnow().isoformat() + "Z"
                        ))
                    else:
                        # New unique physical station entity
                        new_entity_id = f"ENT-{rec['station_id']}"
                        cursor.execute("""
                        INSERT OR REPLACE INTO stations (
                            station_entity_id, station_id, station_name, operator, address, city, area,
                            latitude, longitude, phone, opening_time, closing_time, is_24_hours,
                            station_status, power_kw, status, price_per_kwh, source, source_url,
                            retrieved_at, last_verified_at, data_quality, confidence, is_demo
                        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
                        """, (
                            new_entity_id,
                            rec["station_id"],
                            rec["station_name"],
                            rec["operator"],
                            rec.get("address"),
                            rec.get("city", "Chennai"),
                            rec.get("area"),
                            rec.get("latitude"),
                            rec.get("longitude"),
                            rec.get("phone"),
                            rec.get("opening_time", "06:00"),
                            rec.get("closing_time", "23:00"),
                            1 if rec.get("is_24_hours") else 0,
                            rec.get("station_status", "OPERATIONAL"),
                            rec.get("power_kw"),
                            rec.get("status", "AVAILABLE"),
                            rec.get("price_per_kwh", 18.0),
                            src_name,
                            rec.get("source_url"),
                            rec.get("retrieved_at"),
                            rec.get("last_verified_at"),
                            rec.get("data_quality"),
                            rec.get("confidence", 1.0),
                            1 if rec.get("is_demo") else 0
                        ))

                        # Save chargers
                        for ch in rec.get("chargers", []):
                            cursor.execute("""
                            INSERT OR REPLACE INTO chargers (
                                charger_id, station_entity_id, connector_type, charger_type, power_kw, status, source
                            ) VALUES (?, ?, ?, ?, ?, ?, ?)
                            """, (
                                ch["charger_id"],
                                new_entity_id,
                                ch["connector_type"],
                                ch["charger_type"],
                                ch.get("power_kw", 30.0),
                                ch.get("status", "AVAILABLE"),
                                src_name
                            ))

                        # Save provenance
                        cursor.execute("""
                        INSERT INTO station_sources (station_entity_id, source, source_record_id, raw_data_json, retrieved_at)
                        VALUES (?, ?, ?, ?, ?)
                        """, (
                            new_entity_id,
                            src_name,
                            rec.get("station_id"),
                            json.dumps(rec),
                            datetime.utcnow().isoformat() + "Z"
                        ))

                    records_accepted += 1

                conn.commit()
                status = "SUCCESS"
            except Exception as e:
                status = "FAILED"
                err_msg = str(e)

            completed_at = datetime.utcnow().isoformat() + "Z"

            # Log audit record
            cursor.execute("""
            INSERT INTO osint_sync_logs (
                source, started_at, completed_at, status, records_received, records_accepted,
                records_rejected, duplicates_found, conflicts_found, error_message
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
            """, (
                src_name,
                started_at,
                completed_at,
                status,
                records_received,
                records_accepted,
                records_rejected,
                duplicates,
                conflicts,
                err_msg
            ))
            conn.commit()

            total_stats["records_received"] += records_received
            total_stats["records_accepted"] += records_accepted
            total_stats["records_rejected"] += records_rejected
            total_stats["duplicates_found"] += duplicates
            total_stats["conflicts_found"] += conflicts
            total_stats["details"].append({
                "source": src_name,
                "status": status,
                "records_received": records_received,
                "duplicates": duplicates,
                "conflicts": conflicts
            })

        conn.close()
        return total_stats
