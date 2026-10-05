import json
import os
from flask import Blueprint, jsonify, request

telemetry_bp = Blueprint("telemetry", __name__)

PROFILES_PATH = os.path.abspath(os.path.join(os.path.dirname(__file__), "../../../data/demo/vehicleProfiles.json"))
SESSIONS_PATH = os.path.abspath(os.path.join(os.path.dirname(__file__), "../../../data/demo/sessions.json"))

def load_json(path):
    if not os.path.exists(path):
        return []
    with open(path, "r", encoding="utf-8") as f:
        return json.load(f)

@telemetry_bp.route("/vehicle", methods=["GET"])
def get_vehicle_profile():
    profiles = load_json(PROFILES_PATH)
    return jsonify(profiles[0] if profiles else {})

@telemetry_bp.route("/sessions", methods=["GET"])
def get_sessions():
    sessions = load_json(SESSIONS_PATH)
    return jsonify({
        "total": len(sessions),
        "sessions": sessions
    })
