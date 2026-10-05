from typing import Dict, Any, List
from datetime import datetime

class DataNormalizer:
    """
    Standardizes station and charger records from heterogeneous OSINT sources
    into the canonical EV-Agent common data model.
    """

    @staticmethod
    def create_empty_station() -> Dict[str, Any]:
        return {
            "station_id": None,
            "station_name": None,
            "operator": None,
            "address": None,
            "city": "Chennai",
            "area": None,
            "latitude": None,
            "longitude": None,
            "phone": None,
            "opening_time": None,
            "closing_time": None,
            "is_24_hours": False,
            "station_status": "OPERATIONAL",
            "chargers": [],
            "connector_type": [],
            "charger_type": [],
            "power_kw": None,
            "status": "AVAILABLE",
            "price_per_kwh": None,
            "source": None,
            "source_url": None,
            "retrieved_at": datetime.utcnow().isoformat() + "Z",
            "last_verified_at": None,
            "data_quality": "OPERATOR_LISTING",
            "confidence": 1.0,
            "is_demo": False
        }

    @staticmethod
    def create_charger(
        charger_id: str,
        station_id: str,
        connector_type: str,
        charger_type: str,
        power_kw: float = None,
        status: str = "AVAILABLE",
        source: str = ""
    ) -> Dict[str, Any]:
        return {
            "charger_id": charger_id,
            "station_id": station_id,
            "connector_type": connector_type,
            "charger_type": charger_type,
            "power_kw": power_kw,
            "status": status,
            "source": source
        }

    @classmethod
    def normalize_openchargemap(cls, raw: Dict[str, Any]) -> Dict[str, Any]:
        st = cls.create_empty_station()
        addr_info = raw.get("AddressInfo", {})
        poi_id = raw.get("ID")
        st["station_id"] = f"OCM-{poi_id}"
        st["station_name"] = addr_info.get("Title", f"OCM Station {poi_id}")
        
        op_info = raw.get("OperatorInfo") or {}
        st["operator"] = op_info.get("Title", "Independent Network")
        
        st["address"] = addr_info.get("AddressLine1") or addr_info.get("Title")
        st["city"] = addr_info.get("Town") or "Chennai"
        st["area"] = addr_info.get("StateOrProvince") or "Chennai Metro"
        
        lat = addr_info.get("Latitude")
        lon = addr_info.get("Longitude")
        if lat and lon:
            st["latitude"] = float(lat)
            st["longitude"] = float(lon)
            st["data_quality"] = "VERIFIED_COORDINATE"
        else:
            st["data_quality"] = "OPERATOR_LISTING"

        st["phone"] = addr_info.get("ContactTelephone1")
        st["source"] = "OPEN_CHARGE_MAP"
        st["source_url"] = f"https://openchargemap.org/site/poi/details/{poi_id}"
        st["is_demo"] = False

        # Extract connections
        conns = raw.get("Connections") or []
        chargers = []
        conn_types = set()
        charger_types = set()
        max_power = 0.0

        for idx, c in enumerate(conns, 1):
            conn_type_title = (c.get("ConnectionType") or {}).get("Title", "Unknown")
            power = c.get("PowerKW") or 22.0
            if power > max_power:
                max_power = power

            ch_type = "DC" if ("DC" in conn_type_title or "CCS" in conn_type_title or power >= 30) else "AC"
            conn_types.add(conn_type_title)
            charger_types.add(ch_type)

            charger = cls.create_charger(
                charger_id=f"CHG-OCM-{poi_id}-{idx:02d}",
                station_id=st["station_id"],
                connector_type=conn_type_title,
                charger_type=ch_type,
                power_kw=float(power),
                status="AVAILABLE",
                source="OPEN_CHARGE_MAP"
            )
            chargers.append(charger)

        st["chargers"] = chargers
        st["connector_type"] = list(conn_types) if conn_types else ["CCS2"]
        st["charger_type"] = list(charger_types) if charger_types else ["DC"]
        st["power_kw"] = max_power if max_power > 0 else 30.0
        st["price_per_kwh"] = 18.0 if "DC" in st["charger_type"] else 12.0
        st["status"] = "AVAILABLE" if raw.get("StatusType", {}).get("IsOperational", True) else "OFFLINE"
        st["last_verified_at"] = raw.get("DateLastStatusUpdate") or raw.get("DateLastVerified") or datetime.utcnow().isoformat() + "Z"

        return st

    @classmethod
    def normalize_overpass(cls, raw: Dict[str, Any]) -> Dict[str, Any]:
        st = cls.create_empty_station()
        osm_id = raw.get("id")
        osm_type = raw.get("type", "node")
        tags = raw.get("tags", {})

        st["station_id"] = f"OSM-{osm_type.upper()}-{osm_id}"
        st["station_name"] = tags.get("name") or tags.get("operator") or f"OSM EV Charging {osm_id}"
        st["operator"] = tags.get("operator") or tags.get("brand") or "OpenStreetMap Listing"
        
        street = tags.get("addr:street", "")
        city = tags.get("addr:city", "Chennai")
        st["address"] = f"{street}, {city}".strip(", ") or tags.get("description", "Chennai, Tamil Nadu")
        st["city"] = city
        st["area"] = tags.get("addr:suburb") or tags.get("addr:district") or "Chennai"

        lat = raw.get("lat") or (raw.get("center") or {}).get("lat")
        lon = raw.get("lon") or (raw.get("center") or {}).get("lon")

        if lat and lon:
            st["latitude"] = float(lat)
            st["longitude"] = float(lon)
            st["data_quality"] = "VERIFIED_COORDINATE"
        else:
            st["data_quality"] = "OPERATOR_LISTING"

        st["phone"] = tags.get("phone") or tags.get("contact:phone")
        st["opening_time"] = "00:00" if tags.get("opening_hours") == "24/7" else "06:00"
        st["closing_time"] = "24:00" if tags.get("opening_hours") == "24/7" else "23:00"
        st["is_24_hours"] = tags.get("opening_hours") == "24/7"
        st["source"] = "OPENSTREETMAP"
        st["source_url"] = f"https://www.openstreetmap.org/{osm_type}/{osm_id}"
        st["is_demo"] = False

        # Parse sockets
        conn_types = []
        if tags.get("socket:type2"):
            conn_types.append("Type 2")
        if tags.get("socket:type2_combo") or tags.get("socket:ccs"):
            conn_types.append("CCS2")
        if tags.get("socket:chademo"):
            conn_types.append("CHAdeMO")
        if not conn_types:
            conn_types = ["CCS2", "Type 2"]

        st["connector_type"] = conn_types
        st["charger_type"] = ["DC", "AC"] if "CCS2" in conn_types else ["AC"]
        st["power_kw"] = 50.0 if "CCS2" in conn_types else 22.0
        st["price_per_kwh"] = 18.0 if "DC" in st["charger_type"] else 12.0

        charger = cls.create_charger(
            charger_id=f"CHG-OSM-{osm_id}-01",
            station_id=st["station_id"],
            connector_type=conn_types[0],
            charger_type=st["charger_type"][0],
            power_kw=st["power_kw"],
            status="AVAILABLE",
            source="OPENSTREETMAP"
        )
        st["chargers"] = [charger]
        st["last_verified_at"] = datetime.utcnow().isoformat() + "Z"
        return st
