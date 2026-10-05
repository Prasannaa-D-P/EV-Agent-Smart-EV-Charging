from typing import Dict, Any, List
from .base import BaseDataSource

class OperatorBaseAdapter(BaseDataSource):
    """
    Base class for charging network operators.
    Respects terms of service: does not reverse engineer private mobile endpoints.
    If no public developer API key is provided, gracefully remains in standby.
    """

    def __init__(self, operator_id: str, operator_name: str, has_public_api: bool = False):
        super().__init__(
            source_id=f"OPERATOR_{operator_id.upper()}",
            name=operator_name,
            source_type="OPERATOR"
        )
        self.has_public_api = has_public_api

    def connect(self) -> bool:
        return self.has_public_api

    def health_check(self) -> Dict[str, Any]:
        if not self.has_public_api:
            return {
                "source": self.source_id,
                "operator": self.name,
                "status": "PUBLIC_API_NOT_CONFIGURED",
                "connected": False,
                "message": "Public API not configured. Proprietary operator APIs are not scraped."
            }
        return {
            "source": self.source_id,
            "operator": self.name,
            "status": "CONNECTED",
            "connected": True
        }

    def fetch(self, **kwargs) -> List[Dict[str, Any]]:
        return []

    def normalize(self, raw_data: List[Dict[str, Any]]) -> List[Dict[str, Any]]:
        return raw_data

class AtherAdapter(OperatorBaseAdapter):
    def __init__(self):
        super().__init__("ATHER", "Ather Grid", has_public_api=False)

class TataPowerAdapter(OperatorBaseAdapter):
    def __init__(self):
        super().__init__("TATAPOWER", "Tata Power EZ Charge", has_public_api=False)

class ZeonAdapter(OperatorBaseAdapter):
    def __init__(self):
        super().__init__("ZEON", "Zeon Charge", has_public_api=False)

class StatiqAdapter(OperatorBaseAdapter):
    def __init__(self):
        super().__init__("STATIQ", "Statiq EV", has_public_api=False)

class YoChargeAdapter(OperatorBaseAdapter):
    def __init__(self):
        super().__init__("YOCHARGE", "YoCharge Network", has_public_api=False)

class MahindraAdapter(OperatorBaseAdapter):
    def __init__(self):
        super().__init__("MAHINDRA", "Mahindra EV Fast Charge", has_public_api=False)
