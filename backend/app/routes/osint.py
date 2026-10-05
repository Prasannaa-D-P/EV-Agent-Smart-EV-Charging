from flask import Blueprint, jsonify, request
from ..database import get_db
from ..services.sync_service import OSINTSyncService
from ..adapters.openchargemap import OpenChargeMapAdapter
from ..adapters.overpass import OverpassAdapter
from ..adapters.nominatim import NominatimAdapter
from ..adapters.osrm import OSRMAdapter
from ..adapters.openmeteo import OpenMeteoAdapter
from ..adapters.bee import BEEAdapter
from ..adapters.tnev import TNEVAdapter
from ..adapters.datagov import DataGovAdapter
from ..adapters.iea import IEAAdapter
from ..adapters.operators import (
    AtherAdapter, TataPowerAdapter, ZeonAdapter,
    StatiqAdapter, YoChargeAdapter, MahindraAdapter
)

osint_bp = Blueprint("osint", __name__)

ALL_ADAPTERS = [
    OpenChargeMapAdapter(),
    OverpassAdapter(),
    NominatimAdapter(),
    OSRMAdapter(),
    OpenMeteoAdapter(),
    BEEAdapter(),
    TNEVAdapter(),
    DataGovAdapter(),
    IEAAdapter(),
    AtherAdapter(),
    TataPowerAdapter(),
    ZeonAdapter(),
    StatiqAdapter(),
    YoChargeAdapter(),
    MahindraAdapter()
]

@osint_bp.route("/sources", methods=["GET"])
def get_sources():
    """Returns connection health, record count, and metadata for all OSINT adapters."""
    conn = get_db()
    cursor = conn.cursor()

    # Get record counts per source
    cursor.execute("""
    SELECT source, COUNT(*) as count FROM station_sources GROUP BY source
    """)
    source_counts = {row["source"]: row["count"] for row in cursor.fetchall()}
    conn.close()

    sources_info = []
    for adapter in ALL_ADAPTERS:
        health = adapter.health_check()
        rec_count = source_counts.get(adapter.source_id, 0)
        sources_info.append({
            "source_id": adapter.source_id,
            "name": adapter.name,
            "type": adapter.source_type,
            "health": health,
            "records_stored": rec_count,
            "connected": health.get("connected", False),
            "status": health.get("status", "STANDBY")
        })

    return jsonify({
        "total_sources": len(sources_info),
        "sources": sources_info
    })

@osint_bp.route("/status", methods=["GET"])
def get_status():
    """Returns aggregate summary of OSINT ingestion, duplicate resolution, and conflicts."""
    conn = get_db()
    cursor = conn.cursor()

    cursor.execute("SELECT COUNT(*) FROM stations")
    total_entities = cursor.fetchone()[0]

    cursor.execute("SELECT COUNT(*) FROM station_sources")
    total_source_records = cursor.fetchone()[0]

    cursor.execute("SELECT COUNT(*) FROM data_conflicts WHERE resolved = 0")
    active_conflicts = cursor.fetchone()[0]

    cursor.execute("SELECT COUNT(*) FROM osint_sync_logs")
    total_syncs = cursor.fetchone()[0]

    cursor.execute("SELECT * FROM osint_sync_logs ORDER BY id DESC LIMIT 1")
    last_log_row = cursor.fetchone()
    last_sync = dict(last_log_row) if last_log_row else None

    conn.close()

    return jsonify({
        "status": "OPERATIONAL",
        "station_entities_count": total_entities,
        "source_records_count": total_source_records,
        "active_conflicts_count": active_conflicts,
        "total_sync_runs": total_syncs,
        "last_sync": last_sync
    })

@osint_bp.route("/sync", methods=["POST"])
def trigger_sync():
    """Triggers on-demand ingestion synchronization across selected OSINT sources."""
    data = request.get_json() or {}
    sources = data.get("sources")
    result = OSINTSyncService.sync_sources(sources)
    return jsonify({
        "status": "COMPLETED",
        "result": result
    })

@osint_bp.route("/sync-logs", methods=["GET"])
def get_sync_logs():
    """Returns historical synchronization audit trail."""
    conn = get_db()
    cursor = conn.cursor()
    limit = int(request.args.get("limit", 20))
    cursor.execute("SELECT * FROM osint_sync_logs ORDER BY id DESC LIMIT ?", (limit,))
    logs = [dict(r) for r in cursor.fetchall()]
    conn.close()
    return jsonify({
        "total": len(logs),
        "logs": logs
    })

@osint_bp.route("/conflicts", methods=["GET"])
def get_conflicts():
    """Returns detected field discrepancies across divergent sources."""
    conn = get_db()
    cursor = conn.cursor()
    cursor.execute("""
    SELECT c.*, s.station_name, s.area
    FROM data_conflicts c
    LEFT JOIN stations s ON c.station_entity_id = s.station_entity_id
    ORDER BY c.id DESC
    """)
    conflicts = [dict(r) for r in cursor.fetchall()]
    conn.close()
    return jsonify({
        "total": len(conflicts),
        "conflicts": conflicts
    })
