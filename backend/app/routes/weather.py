from flask import Blueprint, jsonify, request
from ..adapters.openmeteo import OpenMeteoAdapter

weather_bp = Blueprint("weather", __name__)
openmeteo = OpenMeteoAdapter()

@weather_bp.route("", methods=["GET"])
def get_weather():
    lat = request.args.get("lat", default=13.0827, type=float)
    lon = request.args.get("lon", default=80.2707, type=float)

    data = openmeteo.get_current_weather(lat, lon)
    return jsonify(data)
