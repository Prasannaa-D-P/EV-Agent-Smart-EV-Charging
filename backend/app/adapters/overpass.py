import os
import requests
from datetime import datetime
from typing import Dict, Any, List
from .base import BaseDataSource
from ..services.normalizer import DataNormalizer
from ..services.cache_service import CacheService
from ..services.rate_limiter import RateLimiter

class OverpassAdapter(BaseDataSource):
    """
    Adapter for OpenStreetMap Overpass API queries (`amenity=charging_station`).
    Default Chennai Bounding Box: (12.80, 80.00, 13.20, 80.35)
    """

    DEFAULT_BBOX = (12.80, 80.00, 13.20, 80.35)

    def __init__(self):
        super().__init__(
            source_id="OPENSTREETMAP",
            name="OpenStreetMap / Overpass",
            source_type="PRIMARY"
        )
        self.endpoint = os.getenv("OVERPASS_BASE_URL", "https://overpass-api.de/api/interpreter")
        self.mode = os.getenv("OSINT_MODE", "mock").lower()

    def connect(self) -> bool:
        return True

    def health_check(self) -> Dict[str, Any]:
        if self.mode == "mock":
            return {
                "source": self.source_id,
                "status": "MOCK_ACTIVE",
                "connected": True,
                "latency_ms": 10,
                "message": "Serving seeded OSM Overpass Chennai stations."
            }

        try:
            # Minimal health ping
            RateLimiter.wait_for("overpass", 2.0)
            res = requests.get(f"{self.endpoint}?data=[out:json];node(13.0,80.2,13.01,80.21);out count;", timeout=4.0)
            return {
                "source": self.source_id,
                "status": "CONNECTED" if res.ok else "LIMITED",
                "connected": res.ok,
                "status_code": res.status_code
            }
        except Exception as e:
            return {
                "source": self.source_id,
                "status": "UNAVAILABLE",
                "connected": False,
                "message": str(e)
            }

    def fetch(self, bbox: tuple = DEFAULT_BBOX) -> List[Dict[str, Any]]:
        cache_key = f"osm_charging_{bbox[0]}_{bbox[1]}_{bbox[2]}_{bbox[3]}"
        cached = CacheService.get(cache_key)
        if cached:
            return cached

        if self.mode == "mock":
            # Mock OSM nodes in Chennai corridor
            mock_elements = [
                {
                    "type": "node",
                    "id": 992014521,
                    "lat": 13.0035,
                    "lon": 80.2450,
                    "tags": {
                        "amenity": "charging_station",
                        "name": "Tata Power EV Charger - Adyar Bridge",
                        "operator": "Tata Power",
                        "opening_hours": "24/7",
                        "socket:type2_combo": "2",
                        "socket:type2": "1",
                        "capacity": "3",
                        "fee": "yes",
                        "addr:city": "Chennai",
                        "addr:suburb": "Adyar"
                    }
                },
                {
                    "type": "node",
                    "id": 992014522,
                    "lat": 12.9812,
                    "lon": 80.2180,
                    "tags": {
                        "amenity": "charging_station",
                        "name": "Statiq EV Charging Point - Velachery",
                        "operator": "Statiq",
                        "opening_hours": "06:00-23:00",
                        "socket:type2_combo": "2",
                        "capacity": "2",
                        "fee": "yes",
                        "addr:city": "Chennai",
                        "addr:suburb": "Velachery"
                    }
                }
            ]
            CacheService.set(cache_key, "stations", mock_elements, source=self.source_id, ttl_seconds=7200)
            return mock_elements

        query = f"""
        [out:json][timeout:25];
        (
          node["amenity"="charging_station"]({bbox[0]},{bbox[1]},{bbox[2]},{bbox[3]});
          way["amenity"="charging_station"]({bbox[0]},{bbox[1]},{bbox[2]},{bbox[3]});
          relation["amenity"="charging_station"]({bbox[0]},{bbox[1]},{bbox[2]},{bbox[3]});
        );
        out center;
        """

        try:
            RateLimiter.wait_for("overpass", 2.0)
            res = requests.post(self.endpoint, data={"data": query}, timeout=15.0)
            if res.ok:
                data = res.json().get("elements", [])
                CacheService.set(cache_key, "stations", data, source=self.source_id, ttl_seconds=7200)
                return data
        except Exception:
            pass

        return []

    def normalize(self, raw_data: List[Dict[str, Any]]) -> List[Dict[str, Any]]:
        return [DataNormalizer.normalize_overpass(r) for r in raw_data]
