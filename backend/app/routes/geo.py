from flask import Blueprint, jsonify, request
from ..adapters.nominatim import NominatimAdapter
from ..adapters.osrm import OSRMAdapter

geo_bp = Blueprint("geo", __name__)

nominatim = NominatimAdapter()
osrm = OSRMAdapter()

@geo_bp.route("/geocode", methods=["GET"])
def geocode():
    q = request.args.get("q", "").strip()
    if not q:
        return jsonify({"error": "Query parameter 'q' is required"}), 400

    result = nominatim.geocode_address(q)
    if not result:
        return jsonify({"error": "Location not found"}), 404
    return jsonify(result)

@geo_bp.route("/reverse-geocode", methods=["GET"])
def reverse_geocode():
    lat = request.args.get("lat", type=float)
    lon = request.args.get("lon", type=float)
    if lat is None or lon is None:
        return jsonify({"error": "'lat' and 'lon' parameters are required"}), 400

    result = nominatim.reverse_geocode(lat, lon)
    if not result:
        return jsonify({"error": "Address not found"}), 404
    return jsonify(result)

@geo_bp.route("/route", methods=["GET"])
def calculate_route():
    start_lat = request.args.get("start_lat", type=float)
    start_lon = request.args.get("start_lon", type=float)
    end_lat = request.args.get("end_lat", type=float)
    end_lon = request.args.get("end_lon", type=float)

    if any(param is None for param in [start_lat, start_lon, end_lat, end_lon]):
        # Default route from Anna Nagar to Guindy SIDCO Hub
        start_lat = 13.0850
        start_lon = 80.2100
        end_lat = 13.0125
        end_lon = 80.2206

    route_res = osrm.calculate_route(start_lat, start_lon, end_lat, end_lon)
    return jsonify(route_res)
