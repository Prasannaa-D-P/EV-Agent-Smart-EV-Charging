from typing import Dict, Any

class DataQualityEngine:
    """
    Evaluates geospatial and operational provenance to classify station records:
    - VERIFIED_COORDINATE: Exact lat/long from trusted coordinate source (e.g. BEE exact coordinate)
    - OPERATOR_LISTING: From directory or operator without ground-truth verification
    - LIVE_STATUS: Real-time telemetry confirmed by active OCPP/API stream (strictly verified)
    - ESTIMATED: Derived by EV-Agent calculations
    - DEMO: Simulated development dataset
    """

    TRUSTED_COORDINATE_SOURCES = {"BEE", "BEE_Public_EV_Dataset", "OPEN_CHARGE_MAP", "OPENSTREETMAP"}

    @classmethod
    def evaluate_station(cls, station_data: Dict[str, Any]) -> str:
        # 1. Demo flag check
        if station_data.get("is_demo"):
            return "DEMO"

        # 2. Strict Live Status check: Only if source explicitly delivers live telemetry status
        has_live_stream = station_data.get("is_live_stream", False)
        if has_live_stream and station_data.get("source") in {"TNEV_LIVE", "OCPP_STREAM"}:
            return "LIVE_STATUS"

        # 3. Verified coordinate check
        lat = station_data.get("latitude")
        lon = station_data.get("longitude")
        source = station_data.get("source", "")

        if lat is not None and lon is not None:
            try:
                lat_f = float(lat)
                lon_f = float(lon)
                # Valid Chennai bounding box: Lat ~12.75 to 13.35, Lon ~79.95 to 80.40
                if 12.0 <= lat_f <= 14.0 and 79.5 <= lon_f <= 81.0:
                    if source in cls.TRUSTED_COORDINATE_SOURCES:
                        return "VERIFIED_COORDINATE"
            except (ValueError, TypeError):
                pass

        # 4. Default to operator directory listing
        return "OPERATOR_LISTING"

    @classmethod
    def get_display_badge(cls, data_quality: str, is_demo: bool = False) -> Dict[str, str]:
        if is_demo or data_quality == "DEMO":
            return {
                "label": "DEMO DATA",
                "category": "DEMO",
                "color": "amber",
                "description": "Simulated prototype data"
            }
        elif data_quality == "LIVE_STATUS":
            return {
                "label": "LIVE CONFIRMED",
                "category": "LIVE",
                "color": "emerald",
                "description": "Active real-time charger telemetry"
            }
        elif data_quality == "VERIFIED_COORDINATE":
            return {
                "label": "BEE VERIFIED COORDS",
                "category": "REFERENCE",
                "color": "teal",
                "description": "Exact coordinate confirmed by public dataset"
            }
        else:
            return {
                "label": "OPERATOR LISTING",
                "category": "REFERENCE",
                "color": "slate",
                "description": "Approximate location, coordinates pending ground truth"
            }
