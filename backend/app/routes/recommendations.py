from flask import Blueprint, jsonify, request
import os
import json

recommendations_bp = Blueprint("recommendations", __name__)

DATA_PATH = os.path.abspath(os.path.join(os.path.dirname(__file__), "../../../data/stations.json"))

def load_stations():
    if not os.path.exists(DATA_PATH):
        return []
    with open(DATA_PATH, "r", encoding="utf-8") as f:
        return json.load(f)

@recommendations_bp.route("", methods=["POST"])
def get_recommendation():
    data = request.get_json() or {}
    
    battery_soc = float(data.get("battery_soc", 62))
    battery_capacity_kwh = float(data.get("battery_capacity_kwh", 40.5))
    target_soc = float(data.get("target_soc", 80))
    destination = data.get("destination", "Chennai Airport")
    preferred_connector = data.get("preferred_connector", "CCS2")

    # Basic prototype calculations (rule-based heuristic placeholder)
    energy_available = battery_capacity_kwh * (battery_soc / 100.0)
    energy_required = max(0.0, battery_capacity_kwh * ((target_soc - battery_soc) / 100.0))
    
    # Range estimation (assuming 145 Wh/km consumption in Chennai traffic)
    estimated_range_km = round((energy_available / 0.145), 1)

    stations = load_stations()
    # Filter by connector compatibility or fallback to first available
    compatible = [s for s in stations if preferred_connector.lower() in s["connector_type"].lower()]
    candidate_station = compatible[0] if compatible else stations[0]

    charger_power = candidate_station.get("power_kw") or 30.0
    charging_time_hours = energy_required / charger_power if charger_power > 0 else 0.5
    charging_time_minutes = round(charging_time_hours * 60)
    
    price_kwh = candidate_station.get("price_per_kwh") or 18.0
    estimated_cost_inr = round(energy_required * price_kwh)

    # Health & recommendation category
    if battery_soc < 20:
        urgency = "HIGH"
        action = "Immediate Charge Required"
        reason = f"Battery level ({battery_soc}%) is critically low. Destination is at risk."
    elif battery_soc < 30:
        urgency = "MEDIUM"
        action = "Consider charging before travel"
        reason = f"Battery level ({battery_soc}%) is below the configured comfort threshold for transit to {destination}."
    elif battery_soc > 70:
        urgency = "LOW"
        action = "Battery Level Healthy"
        reason = f"Current battery level ({battery_soc}%) provides {estimated_range_km} km range, ample for Chennai corridor transit."
    else:
        urgency = "MODERATE"
        action = "Optimal Top-up Window"
        reason = f"Top-up recommended to reach {target_soc}% for unconstrained transit along OMR/GST corridor."

    return jsonify({
        "status": "success",
        "engine": "Rule-Based Heuristic Placeholder (Step 1 Foundation)",
        "note": "Agentic AI orchestrator and ML demand prediction will replace this logic in Step 2.",
        "input": {
            "battery_soc": battery_soc,
            "target_soc": target_soc,
            "destination": destination,
            "energy_available_kwh": round(energy_available, 2),
            "estimated_range_km": estimated_range_km
        },
        "recommendation": {
            "urgency": urgency,
            "recommended_action": action,
            "reason": reason,
            "recommended_station": {
                "station_id": candidate_station["station_id"],
                "station_name": candidate_station["station_name"],
                "operator": candidate_station["operator"],
                "area": candidate_station["area"],
                "power_kw": candidate_station["power_kw"],
                "connector_type": candidate_station["connector_type"],
                "price_per_kwh": candidate_station["price_per_kwh"],
                "status": candidate_station["status"]
            },
            "energy_needed_kwh": round(energy_required, 2),
            "estimated_cost_inr": estimated_cost_inr,
            "estimated_charging_time_minutes": charging_time_minutes,
            "confidence_score": 0.94
        }
    })
