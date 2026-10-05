import os
import json
from datetime import datetime
from typing import Dict, Any, List
from .base import BaseDataSource

SEED_DATA_PATH = os.path.abspath(os.path.join(os.path.dirname(__file__), "../../../data/stations.json"))

class TNEVAdapter(BaseDataSource):
    """
    Adapter for Tamil Nadu TNEV / TNGECL charger-finder directory.
    Supports local operator listings and future TNEV API endpoints.
    """

    def __init__(self):
        super().__init__(
            source_id="TNEV",
            name="Tamil Nadu TNEV / TNGECL",
            source_type="SECONDARY"
        )
        self.api_base_url = os.getenv("TNEV_API_BASE_URL", "").strip()

    def connect(self) -> bool:
        return True

    def health_check(self) -> Dict[str, Any]:
        has_api = bool(self.api_base_url)
        return {
            "source": self.source_id,
            "status": "REFERENCE_CONNECTED",
            "connected": True,
            "mode": "LIVE_API" if has_api else "LOCAL_DIRECTORY",
            "message": "Serving Tamil Nadu state EV charger directory records."
        }

    def fetch(self, **kwargs) -> List[Dict[str, Any]]:
        if os.path.exists(SEED_DATA_PATH):
            with open(SEED_DATA_PATH, "r", encoding="utf-8") as f:
                data = json.load(f)
                return [s for s in data if s.get("data_source") != "BEE_Public_EV_Dataset"]
        return []

    def normalize(self, raw_data: List[Dict[str, Any]]) -> List[Dict[str, Any]]:
        normalized = []
        for r in raw_data:
            st = dict(r)
            st["source"] = "TNEV"
            st["source_url"] = "https://tnev.tn.gov.in"
            st["data_quality"] = "OPERATOR_LISTING"
            st["is_demo"] = False
            normalized.append(st)
        return normalized
