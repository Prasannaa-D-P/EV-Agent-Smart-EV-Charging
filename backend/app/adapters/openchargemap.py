import os
import requests
from datetime import datetime
from typing import Dict, Any, List
from .base import BaseDataSource
from ..services.normalizer import DataNormalizer
from ..services.cache_service import CacheService

class OpenChargeMapAdapter(BaseDataSource):
    """
    Adapter for Open Charge Map (OCM) public EV database.
    Base API: https://api.openchargemap.io/v3/poi/
    """

    BASE_URL = "https://api.openchargemap.io/v3/poi/"

    def __init__(self):
        super().__init__(
            source_id="OPEN_CHARGE_MAP",
            name="Open Charge Map",
            source_type="PRIMARY"
        )
        self.api_key = os.getenv("OPENCHARGEMAP_API_KEY", "").strip()
        self.mode = os.getenv("OSINT_MODE", "mock").lower()

    def connect(self) -> bool:
        if self.mode == "mock":
            return True
        return bool(self.api_key)

    def health_check(self) -> Dict[str, Any]:
        if self.mode == "mock":
            return {
                "source": self.source_id,
                "status": "MOCK_ACTIVE",
                "connected": True,
                "latency_ms": 12,
                "message": "Operating in local mock mode with seeded OCM Chennai records."
            }

        if not self.api_key:
            return {
                "source": self.source_id,
                "status": "KEY_REQUIRED",
                "connected": False,
                "latency_ms": 0,
                "message": "OPENCHARGEMAP_API_KEY not configured in .env."
            }

        try:
            res = requests.get(
                f"{self.BASE_URL}?maxresults=1&countrycode=IN&key={self.api_key}",
                timeout=3.0
            )
            return {
                "source": self.source_id,
                "status": "CONNECTED" if res.ok else "ERROR",
                "connected": res.ok,
                "status_code": res.status_code,
                "latency_ms": int(res.elapsed.total_seconds() * 1000)
            }
        except Exception as e:
            return {
                "source": self.source_id,
                "status": "UNAVAILABLE",
                "connected": False,
                "message": str(e)
            }

    def fetch(self, **kwargs) -> List[Dict[str, Any]]:
        cache_key = "ocm_chennai_poi"
        cached = CacheService.get(cache_key)
        if cached:
            return cached

        if self.mode == "mock" or not self.api_key:
            # Seeded OCM Chennai sample records for mock mode
            mock_data = [
                {
                    "ID": 289410,
                    "AddressInfo": {
                        "Title": "Zeon Charging - OMR Navalur",
                        "AddressLine1": "Vivira Mall, Navalur, OMR",
                        "Town": "Chennai",
                        "StateOrProvince": "Navalur",
                        "Latitude": 12.8465,
                        "Longitude": 80.2268,
                        "ContactTelephone1": "+91 44 4900 8822"
                    },
                    "OperatorInfo": {"Title": "Zeon"},
                    "Connections": [
                        {"ConnectionType": {"Title": "CCS2"}, "PowerKW": 60.0}
                    ],
                    "StatusType": {"IsOperational": True},
                    "DateLastStatusUpdate": datetime.utcnow().isoformat() + "Z"
                },
                {
                    "ID": 289411,
                    "AddressInfo": {
                        "Title": "Tata Power - Phoenix Marketcity",
                        "AddressLine1": "Velachery Main Road, Indira Gandhi Nagar",
                        "Town": "Chennai",
                        "StateOrProvince": "Velachery",
                        "Latitude": 12.9918,
                        "Longitude": 80.2173,
                        "ContactTelephone1": "+91 44 2852 4400"
                    },
                    "OperatorInfo": {"Title": "Tata Power"},
                    "Connections": [
                        {"ConnectionType": {"Title": "CCS2"}, "PowerKW": 30.0},
                        {"ConnectionType": {"Title": "Type 2"}, "PowerKW": 7.4}
                    ],
                    "StatusType": {"IsOperational": True},
                    "DateLastStatusUpdate": datetime.utcnow().isoformat() + "Z"
                }
            ]
            CacheService.set(cache_key, "stations", mock_data, source=self.source_id, ttl_seconds=3600)
            return mock_data

        try:
            # Live API fetch centered on Chennai coordinates
            url = f"{self.BASE_URL}?latitude=13.0827&longitude=80.2707&distance=35&distanceunit=KM&maxresults=25&key={self.api_key}"
            res = requests.get(url, timeout=5.0)
            if res.ok:
                data = res.json()
                CacheService.set(cache_key, "stations", data, source=self.source_id, ttl_seconds=3600)
                return data
        except Exception:
            pass

        return []

    def normalize(self, raw_data: List[Dict[str, Any]]) -> List[Dict[str, Any]]:
        return [DataNormalizer.normalize_openchargemap(r) for r in raw_data]
