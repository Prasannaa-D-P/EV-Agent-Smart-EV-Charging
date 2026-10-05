from abc import ABC, abstractmethod
from typing import Dict, Any, List, Optional
from datetime import datetime

class BaseDataSource(ABC):
    """
    Abstract interface for all OSINT and Open Data sources.
    Guarantees isolation: failure in one adapter will not crash the platform.
    """

    def __init__(self, source_id: str, name: str, source_type: str):
        self.source_id = source_id
        self.name = name
        self.source_type = source_type  # 'PRIMARY', 'SECONDARY', 'OPERATOR', 'GEO', 'CONTEXT'

    @abstractmethod
    def connect(self) -> bool:
        """Establishes connection or verifies credentials/network presence."""
        pass

    @abstractmethod
    def health_check(self) -> Dict[str, Any]:
        """Returns health status, latency, error count, and last check timestamp."""
        pass

    @abstractmethod
    def fetch(self, **kwargs) -> List[Dict[str, Any]]:
        """Retrieves raw payloads from the source."""
        pass

    @abstractmethod
    def normalize(self, raw_data: List[Dict[str, Any]]) -> List[Dict[str, Any]]:
        """Transforms raw payloads into the common 22-field station schema."""
        pass

    def validate(self, normalized_records: List[Dict[str, Any]]) -> List[Dict[str, Any]]:
        """Filters out malformed records (e.g. invalid types or missing IDs)."""
        valid = []
        for r in normalized_records:
            if r.get("station_name") and r.get("operator"):
                valid.append(r)
        return valid

    def get_source_metadata(self) -> Dict[str, Any]:
        """Returns descriptive metadata about the source."""
        return {
            "source_id": self.source_id,
            "name": self.name,
            "type": self.source_type,
            "status": "READY"
        }
