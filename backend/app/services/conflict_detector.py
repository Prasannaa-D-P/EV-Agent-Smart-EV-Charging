from datetime import datetime
from typing import Dict, Any, List
from ..database import get_db

class ConflictDetector:
    """
    Compares newly ingested source records against existing canonical records
    for the same station_entity_id. If critical operational fields (power, connector,
    status, pricing) differ significantly, logs the discrepancy in data_conflicts table.
    """

    CRITICAL_FIELDS = ["power_kw", "status", "price_per_kwh"]

    @classmethod
    def check_and_log_conflicts(
        cls,
        entity_id: str,
        existing_station: Dict[str, Any],
        new_source_record: Dict[str, Any],
        source_name: str
    ) -> List[Dict[str, Any]]:
        conflicts_found = []
        conn = get_db()
        cursor = conn.cursor()
        now_iso = datetime.utcnow().isoformat() + "Z"

        for field in cls.CRITICAL_FIELDS:
            val_existing = existing_station.get(field)
            val_new = new_source_record.get(field)

            if val_existing is not None and val_new is not None:
                # Check for numerical discrepancy (e.g. 30 kW vs 60 kW)
                if isinstance(val_existing, (int, float)) and isinstance(val_new, (int, float)):
                    if abs(float(val_existing) - float(val_new)) > 2.0:
                        cursor.execute("""
                        INSERT INTO data_conflicts (
                            station_entity_id, field_name, source_a, value_a, source_b, value_b, detected_at, resolved
                        ) VALUES (?, ?, ?, ?, ?, ?, ?, 0)
                        """, (
                            entity_id,
                            field,
                            existing_station.get("source", "EXISTING"),
                            str(val_existing),
                            source_name,
                            str(val_new),
                            now_iso
                        ))
                        conflicts_found.append({
                            "field": field,
                            "value_a": str(val_existing),
                            "source_a": existing_station.get("source"),
                            "value_b": str(val_new),
                            "source_b": source_name
                        })
                # Check for textual status discrepancy (e.g. AVAILABLE vs OFFLINE)
                elif str(val_existing).upper() != str(val_new).upper():
                    cursor.execute("""
                    INSERT INTO data_conflicts (
                        station_entity_id, field_name, source_a, value_a, source_b, value_b, detected_at, resolved
                    ) VALUES (?, ?, ?, ?, ?, ?, ?, 0)
                    """, (
                        entity_id,
                        field,
                        existing_station.get("source", "EXISTING"),
                        str(val_existing),
                        source_name,
                        str(val_new),
                        now_iso
                    ))
                    conflicts_found.append({
                        "field": field,
                        "value_a": str(val_existing),
                        "source_a": existing_station.get("source"),
                        "value_b": str(val_new),
                        "source_b": source_name
                    })

        conn.commit()
        conn.close()
        return conflicts_found
