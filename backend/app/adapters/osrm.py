import os
import requests
from typing import Dict, Any, List
from .base import BaseDataSource
from ..services.cache_service import CacheService
from ..services.rate_limiter import RateLimiter

class OSRMAdapter(BaseDataSource):
    """
    Adapter for OSRM (Open Source Routing Machine).
    Computes driving distance, transit duration, and route polyline geometry.
    Base server: https://router.project-osrm.org/
    """

    def __init__(self):
        super().__init__(
            source_id="OSRM",
            name="OSRM Routing Engine",
            source_type="GEO"
        )
        self.base_url = os.getenv("OSRM_BASE_URL", "https://router.project-osrm.org")
        self.mode = os.getenv("OSINT_MODE", "mock").lower()

    def connect(self) -> bool:
        return True

    def health_check(self) -> Dict[str, Any]:
        return {
            "source": self.source_id,
            "status": "READY",
            "connected": True
        }

    def fetch(self, **kwargs):
        return []

    def normalize(self, raw_data):
        return raw_data

    def calculate_route(
        self,
        start_lat: float,
        start_lon: float,
        end_lat: float,
        end_lon: float
    ) -> Dict[str, Any]:
        cache_key = f"osrm_{round(start_lat, 4)}_{round(start_lon, 4)}_{round(end_lat, 4)}_{round(end_lon, 4)}"
        cached = CacheService.get(cache_key)
        if cached:
            return cached

        if self.mode == "mock":
            # Direct euclidean approximation for mock mode
            import math
            lat1, lon1 = math.radians(start_lat), math.radians(start_lon)
            lat2, lon2 = math.radians(end_lat), math.radians(end_lon)
            dlat = lat2 - lat1
            dlon = lon2 - lon1
            a = math.sin(dlat / 2)**2 + math.cos(lat1) * math.cos(lat2) * math.sin(dlon / 2)**2
            c = 2 * math.atan2(math.sqrt(a), math.sqrt(1 - a))
            dist_km = round(6371.0 * c * 1.25, 1)  # 1.25 urban winding factor
            duration_min = round((dist_km / 28.0) * 60)  # average 28 km/h in Chennai city traffic

            # Interpolated route line
            mock_coords = [
                [start_lat, start_lon],
                [(start_lat + end_lat) / 2.0 + 0.005, (start_lon + end_lon) / 2.0 - 0.003],
                [end_lat, end_lon]
            ]

            result = {
                "distance_km": dist_km,
                "duration_minutes": max(5, duration_min),
                "geometry": mock_coords,
                "steps": [
                    {"instruction": "Depart along urban corridor", "distance_km": round(dist_km * 0.4, 1)},
                    {"instruction": "Merge onto primary arterial highway", "distance_km": round(dist_km * 0.6, 1)},
                    {"instruction": "Arrive at EV Charging Station", "distance_km": 0.0}
                ],
                "source": "OSRM_MOCK"
            }
            CacheService.set(cache_key, "route", result, source=self.source_id, ttl_seconds=86400)
            return result

        try:
            # OSRM coordinate syntax: {lon1},{lat1};{lon2},{lat2}
            coords = f"{start_lon},{start_lat};{end_lon},{end_lat}"
            url = f"{self.base_url}/route/v1/driving/{coords}?overview=full&geometries=geojson&steps=true"

            RateLimiter.wait_for("osrm", 0.5)
            res = requests.get(url, timeout=6.0)
            if res.ok:
                data = res.json()
                routes = data.get("routes", [])
                if routes:
                    primary = routes[0]
                    distance_km = round(primary.get("distance", 0.0) / 1000.0, 1)
                    duration_min = round(primary.get("duration", 0.0) / 60.0)
                    geo_pts = primary.get("geometry", {}).get("coordinates", [])

                    # GeoJSON is [lon, lat], convert to Leaflet standard [lat, lon]
                    leaflet_geo = [[pt[1], pt[0]] for pt in geo_pts]

                    steps = []
                    legs = primary.get("legs", [])
                    for leg in legs:
                        for s in leg.get("steps", []):
                            maneuver = s.get("maneuver", {})
                            steps.append({
                                "instruction": f"{maneuver.get('type', 'drive')} on {s.get('name', 'street')}",
                                "distance_km": round(s.get("distance", 0.0) / 1000.0, 2)
                            })

                    result = {
                        "distance_km": distance_km,
                        "duration_minutes": duration_min,
                        "geometry": leaflet_geo,
                        "steps": steps,
                        "source": "OSRM"
                    }
                    CacheService.set(cache_key, "route", result, source=self.source_id, ttl_seconds=86400)
                    return result
        except Exception:
            pass

        # Fallback return
        return {
            "distance_km": 8.5,
            "duration_minutes": 22,
            "geometry": [[start_lat, start_lon], [end_lat, end_lon]],
            "steps": [],
            "source": "OSRM_FALLBACK"
        }
