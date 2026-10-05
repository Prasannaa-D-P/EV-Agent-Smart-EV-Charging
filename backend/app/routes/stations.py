import json
import math
from flask import Blueprint, jsonify, request
from ..database import get_db

stations_bp = Blueprint("stations", __name__)

def haversine_km(lat1, lon1, lat2, lon2):
    R = 6371.0
    dlat = math.radians(lat2 - lat1)
    dlon = math.radians(lon2 - lon1)
    a = math.sin(dlat / 2.0)**2 + math.cos(math.radians(lat1)) * math.cos(math.radians(lat2)) * math.sin(dlon / 2.0)**2
    return R * (2.0 * math.atan2(math.sqrt(a), math.sqrt(1.0 - a)))

def enrich_station_row(row, cursor):
    st = dict(row)
    entity_id = st["station_entity_id"]

    # Load chargers
    cursor.execute("SELECT * FROM chargers WHERE station_entity_id = ?", (entity_id,))
    st["chargers"] = [dict(c) for c in cursor.fetchall()]

    # Load linked sources
    cursor.execute("SELECT source, retrieved_at FROM station_sources WHERE station_entity_id = ?", (entity_id,))
    sources = cursor.fetchall()
    st["linked_sources"] = list(set([s["source"] for s in sources])) if sources else [st.get("data_source", "BEE_PORTAL")]

    # Load conflicts
    cursor.execute("SELECT * FROM data_conflicts WHERE station_entity_id = ? AND resolved = 0", (entity_id,))
    st["conflicts"] = [dict(c) for c in cursor.fetchall()]
    st["has_conflicts"] = len(st["conflicts"]) > 0

    # Connector type formatting
    if st["chargers"]:
        st["connector_type"] = ", ".join(list(set([c["connector_type"] for c in st["chargers"]])))
        st["charger_type"] = st["chargers"][0]["charger_type"]
    else:
        st["connector_type"] = "CCS2"
        st["charger_type"] = "DC"

    st["coordinates_verified"] = (st["latitude"] is not None and st["longitude"] is not None)
    st["is_demo"] = bool(st["is_demo"])
    st["is_24_hours"] = bool(st["is_24_hours"])
    return st

@stations_bp.route("", methods=["GET"])
def get_stations():
    operator = request.args.get("operator")
    connector = request.args.get("connector")
    area = request.args.get("area")
    has_coords = request.args.get("has_coords")
    status = request.args.get("status")
    data_quality = request.args.get("data_quality")

    conn = get_db()
    cursor = conn.cursor()

    query = "SELECT * FROM stations WHERE 1=1"
    params = []

    if operator and operator != "ALL":
        query += " AND LOWER(operator) LIKE ?"
        params.append(f"%{operator.lower()}%")

    if area:
        query += " AND LOWER(area) LIKE ?"
        params.append(f"%{area.lower()}%")

    if status and status != "ALL":
        query += " AND LOWER(status) = ?"
        params.append(status.lower())

    if data_quality and data_quality != "ALL":
        query += " AND data_quality = ?"
        params.append(data_quality)

    if has_coords is not None:
        if has_coords.lower() in ["true", "1", "yes"]:
            query += " AND latitude IS NOT NULL AND longitude IS NOT NULL"
        else:
            query += " AND (latitude IS NULL OR longitude IS NULL)"

    query += " ORDER BY station_name ASC"
    cursor.execute(query, params)
    rows = cursor.fetchall()

    stations = []
    for r in rows:
        st = enrich_station_row(r, cursor)
        # Filter by connector if requested
        if connector and connector != "ALL":
            if connector.lower() not in st["connector_type"].lower():
                continue
        stations.append(st)

    verified_count = len([s for s in stations if s["coordinates_verified"]])
    listing_count = len([s for s in stations if not s["coordinates_verified"]])

    conn.close()

    return jsonify({
        "total": len(stations),
        "data_classification": {
            "verified_coordinates_count": verified_count,
            "operator_listings_count": listing_count
        },
        "stations": stations
    })

@stations_bp.route("/nearby", methods=["GET"])
def get_nearby():
    lat = request.args.get("lat", default=13.0827, type=float)
    lon = request.args.get("lon", default=80.2707, type=float)
    radius_km = request.args.get("radius_km", default=15.0, type=float)

    conn = get_db()
    cursor = conn.cursor()
    cursor.execute("SELECT * FROM stations WHERE latitude IS NOT NULL AND longitude IS NOT NULL")
    rows = cursor.fetchall()

    nearby = []
    for r in rows:
        st = enrich_station_row(r, cursor)
        dist = haversine_km(lat, lon, st["latitude"], st["longitude"])
        if dist <= radius_km:
            st["distance_km"] = round(dist, 2)
            nearby.append(st)

    nearby.sort(key=lambda x: x["distance_km"])
    conn.close()

    return jsonify({
        "origin": {"latitude": lat, "longitude": lon},
        "radius_km": radius_km,
        "total": len(nearby),
        "stations": nearby
    })

@stations_bp.route("/<station_id>", methods=["GET"])
def get_station_detail(station_id):
    conn = get_db()
    cursor = conn.cursor()
    cursor.execute(
        "SELECT * FROM stations WHERE station_id = ? OR station_entity_id = ?",
        (station_id, station_id)
    )
    row = cursor.fetchone()
    if not row:
        conn.close()
        return jsonify({"error": "Station not found"}), 404

    station = enrich_station_row(row, cursor)
    conn.close()
    return jsonify(station)
