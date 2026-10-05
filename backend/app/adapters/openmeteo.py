import os
import requests
from datetime import datetime
from typing import Dict, Any, Optional
from .base import BaseDataSource
from ..services.cache_service import CacheService

class OpenMeteoAdapter(BaseDataSource):
    """
    Adapter for Open-Meteo public meteorological API.
    Provides ambient temperature, wind, humidity, and precipitation for corridor context.
    Base API: https://api.open-meteo.com/v1/forecast
    """

    def __init__(self):
        super().__init__(
            source_id="OPEN_METEO",
            name="Open-Meteo Weather Service",
            source_type="CONTEXT"
        )
        self.base_url = os.getenv("OPENMETEO_BASE_URL", "https://api.open-meteo.com/v1")
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

    def get_current_weather(self, lat: float = 13.0827, lon: float = 80.2707) -> Dict[str, Any]:
        cache_key = f"weather_chennai_{round(lat, 2)}_{round(lon, 2)}"
        cached = CacheService.get(cache_key)
        if cached:
            return cached

        if self.mode == "mock":
            # Realistic Chennai weather profile (coastal tropical)
            mock_weather = {
                "location": "Chennai Corridor",
                "latitude": lat,
                "longitude": lon,
                "temperature_c": 31.5,
                "apparent_temperature_c": 36.2,
                "relative_humidity_percent": 74,
                "wind_speed_kmh": 14.5,
                "precipitation_mm": 0.0,
                "weather_condition": "Partly Cloudy",
                "weather_code": 2,
                "retrieved_at": datetime.utcnow().isoformat() + "Z",
                "source": "OPEN_METEO_MOCK"
            }
            CacheService.set(cache_key, "weather", mock_weather, source=self.source_id, ttl_seconds=1800)
            return mock_weather

        try:
            url = f"{self.base_url}/forecast?latitude={lat}&longitude={lon}&current=temperature_2m,relative_humidity_2m,apparent_temperature,precipitation,weather_code,wind_speed_10m&timezone=Asia/Kolkata"
            res = requests.get(url, timeout=5.0)
            if res.ok:
                current = res.json().get("current", {})
                w_code = current.get("weather_code", 0)
                condition = self._interpret_wmo_code(w_code)

                result = {
                    "location": "Chennai Corridor",
                    "latitude": lat,
                    "longitude": lon,
                    "temperature_c": current.get("temperature_2m", 30.0),
                    "apparent_temperature_c": current.get("apparent_temperature", 34.0),
                    "relative_humidity_percent": current.get("relative_humidity_2m", 70),
                    "wind_speed_kmh": current.get("wind_speed_10m", 12.0),
                    "precipitation_mm": current.get("precipitation", 0.0),
                    "weather_condition": condition,
                    "weather_code": w_code,
                    "retrieved_at": datetime.utcnow().isoformat() + "Z",
                    "source": "OPEN_METEO"
                }
                CacheService.set(cache_key, "weather", result, source=self.source_id, ttl_seconds=1800)
                return result
        except Exception:
            pass

        return {
            "location": "Chennai Corridor",
            "temperature_c": 31.0,
            "apparent_temperature_c": 35.0,
            "relative_humidity_percent": 72,
            "wind_speed_kmh": 13.0,
            "precipitation_mm": 0.0,
            "weather_condition": "Sunny",
            "retrieved_at": datetime.utcnow().isoformat() + "Z",
            "source": "OPEN_METEO_FALLBACK"
        }

    @staticmethod
    def _interpret_wmo_code(code: int) -> str:
        if code == 0:
            return "Clear Sky"
        elif code in (1, 2):
            return "Partly Cloudy"
        elif code == 3:
            return "Overcast"
        elif code in (51, 53, 55, 61, 63):
            return "Light Rain"
        elif code in (65, 80, 81, 82):
            return "Heavy Rain"
        elif code in (95, 96, 99):
            return "Thunderstorm"
        return "Fair"
