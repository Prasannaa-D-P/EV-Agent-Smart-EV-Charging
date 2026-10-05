import os
import requests
from typing import Dict, Any, Optional
from .base import BaseDataSource
from ..services.cache_service import CacheService
from ..services.rate_limiter import RateLimiter

class NominatimAdapter(BaseDataSource):
    """
    Adapter for Nominatim OpenStreetMap geocoding.
    Strictly adheres to OSM Foundation Usage Policy:
    - Custom User-Agent header
    - Maximum 1 request/second rate-limiting
    - Persistent caching of geocoded results
    """

    USER_AGENT = "EV-Agent-Smart-Mobility-Platform/1.0 (academic-research-chennai)"

    def __init__(self):
        super().__init__(
            source_id="NOMINATIM",
            name="OpenStreetMap Nominatim Geocoder",
            source_type="GEO"
        )
        self.base_url = os.getenv("NOMINATIM_BASE_URL", "https://nominatim.openstreetmap.org")
        self.mode = os.getenv("OSINT_MODE", "mock").lower()

    def connect(self) -> bool:
        return True

    def health_check(self) -> Dict[str, Any]:
        return {
            "source": self.source_id,
            "status": "READY",
            "connected": True,
            "rate_limit_delay_s": 1.0
        }

    def fetch(self, **kwargs):
        # BaseDataSource required method; specialized methods below are used
        return []

    def normalize(self, raw_data):
        return raw_data

    def geocode_address(self, query: str) -> Optional[Dict[str, Any]]:
        """Forward geocoding: address to latitude/longitude."""
        clean_q = query.strip()
        cache_key = f"nominatim_fwd_{clean_q.lower()}"
        cached = CacheService.get(cache_key)
        if cached:
            return cached

        if self.mode == "mock":
            # Mock Chennai coordinates for known landmarks
            mock_coords = {
                "guindy": {"lat": 13.0125, "lon": 80.2206, "display_name": "Guindy, Chennai, Tamil Nadu"},
                "airport": {"lat": 12.9856, "lon": 80.1693, "display_name": "Chennai International Airport, Meenambakkam, Chennai"},
                "omr": {"lat": 12.9485, "lon": 80.2327, "display_name": "Old Mahabalipuram Road, Chennai"},
                "anna nagar": {"lat": 13.0850, "lon": 80.2100, "display_name": "Anna Nagar, Chennai, Tamil Nadu"},
                "adyar": {"lat": 12.9967, "lon": 80.2518, "display_name": "Adyar, Chennai, Tamil Nadu"}
            }
            for k, val in mock_coords.items():
                if k in clean_q.lower():
                    result = {
                        "latitude": val["lat"],
                        "longitude": val["lon"],
                        "display_name": val["display_name"],
                        "source": "NOMINATIM_MOCK"
                    }
                    CacheService.set(cache_key, "geocoding", result, source=self.source_id, ttl_seconds=86400)
                    return result

            # Default Chennai center fallback
            default_res = {
                "latitude": 13.0827,
                "longitude": 80.2707,
                "display_name": f"{clean_q}, Chennai, Tamil Nadu",
                "source": "NOMINATIM_MOCK"
            }
            CacheService.set(cache_key, "geocoding", default_res, source=self.source_id, ttl_seconds=86400)
            return default_res

        try:
            RateLimiter.wait_for("nominatim", 1.0)
            headers = {"User-Agent": self.USER_AGENT}
            params = {
                "q": f"{clean_q}, Chennai, India",
                "format": "json",
                "limit": 1
            }
            res = requests.get(f"{self.base_url}/search", headers=headers, params=params, timeout=5.0)
            if res.ok:
                items = res.json()
                if items:
                    top = items[0]
                    result = {
                        "latitude": float(top["lat"]),
                        "longitude": float(top["lon"]),
                        "display_name": top.get("display_name"),
                        "source": "NOMINATIM"
                    }
                    CacheService.set(cache_key, "geocoding", result, source=self.source_id, ttl_seconds=86400)
                    return result
        except Exception:
            pass

        return None

    def reverse_geocode(self, lat: float, lon: float) -> Optional[Dict[str, Any]]:
        """Reverse geocoding: coordinates to address."""
        cache_key = f"nominatim_rev_{round(lat, 4)}_{round(lon, 4)}"
        cached = CacheService.get(cache_key)
        if cached:
            return cached

        if self.mode == "mock":
            mock_addr = {
                "address": "SIDCO Industrial Estate, Guindy, Chennai, Tamil Nadu, 600032, India",
                "area": "Guindy",
                "city": "Chennai",
                "source": "NOMINATIM_MOCK"
            }
            CacheService.set(cache_key, "geocoding", mock_addr, source=self.source_id, ttl_seconds=86400)
            return mock_addr

        try:
            RateLimiter.wait_for("nominatim", 1.0)
            headers = {"User-Agent": self.USER_AGENT}
            params = {
                "lat": lat,
                "lon": lon,
                "format": "json"
            }
            res = requests.get(f"{self.base_url}/reverse", headers=headers, params=params, timeout=5.0)
            if res.ok:
                data = res.json()
                addr = data.get("address", {})
                result = {
                    "address": data.get("display_name"),
                    "area": addr.get("suburb") or addr.get("neighbourhood") or addr.get("city_district") or "Chennai",
                    "city": addr.get("city") or "Chennai",
                    "source": "NOMINATIM"
                }
                CacheService.set(cache_key, "geocoding", result, source=self.source_id, ttl_seconds=86400)
                return result
        except Exception:
            pass

        return None
