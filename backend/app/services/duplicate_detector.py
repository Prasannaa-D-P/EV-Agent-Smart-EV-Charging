import math
from typing import Dict, Any, Optional
from ..database import get_db

class DuplicateDetector:
    """
    Identifies duplicate physical stations across diverse OSINT sources
    using geospatial distance threshold (<150 meters) and token similarity.
    """

    DISTANCE_THRESHOLD_KM = 0.15  # 150 meters

    @staticmethod
    def haversine_distance_km(lat1: float, lon1: float, lat2: float, lon2: float) -> float:
        R = 6371.0  # Earth radius in kilometers
        d_lat = math.radians(lat2 - lat1)
        d_lon = math.radians(lon2 - lon1)
        a = (math.sin(d_lat / 2.0) ** 2 +
             math.cos(math.radians(lat1)) * math.cos(math.radians(lat2)) *
             math.sin(d_lon / 2.0) ** 2)
        c = 2.0 * math.atan2(math.sqrt(a), math.sqrt(1.0 - a))
        return R * c

    @staticmethod
    def token_similarity(name1: str, name2: str) -> float:
        if not name1 or not name2:
            return 0.0
        tokens1 = set(name1.lower().replace("-", " ").replace("/", " ").split())
        tokens2 = set(name2.lower().replace("-", " ").replace("/", " ").split())
        
        # Filter generic words
        stopwords = {"charging", "station", "ev", "point", "hub", "chennai", "tamil", "nadu"}
        tokens1 = {t for t in tokens1 if t not in stopwords}
        tokens2 = {t for t in tokens2 if t not in stopwords}

        if not tokens1 or not tokens2:
            return 0.5
        
        intersection = len(tokens1.intersection(tokens2))
        union = len(tokens1.union(tokens2))
        return intersection / union if union > 0 else 0.0

    @classmethod
    def find_matching_entity(cls, station: Dict[str, Any]) -> Optional[str]:
        """
        Searches existing database for a matching station entity.
        Returns station_entity_id if match is found, else None.
        """
        lat = station.get("latitude")
        lon = station.get("longitude")
        name = station.get("station_name", "")
        operator = station.get("operator", "")

        conn = get_db()
        cursor = conn.cursor()

        # 1. Coordinate-based proximity match
        if lat is not None and lon is not None:
            # Query bounding box candidate (+/- 0.005 deg ~= 500m)
            cursor.execute("""
            SELECT station_entity_id, station_name, operator, latitude, longitude
            FROM stations
            WHERE latitude BETWEEN ? AND ?
              AND longitude BETWEEN ? AND ?
            """, (lat - 0.005, lat + 0.005, lon - 0.005, lon + 0.005))

            candidates = cursor.fetchall()
            for cand in candidates:
                c_lat = cand["latitude"]
                c_lon = cand["longitude"]
                if c_lat is not None and c_lon is not None:
                    dist = cls.haversine_distance_km(lat, lon, c_lat, c_lon)
                    if dist <= cls.DISTANCE_THRESHOLD_KM:
                        # Close distance: verify operator or token overlap
                        sim = cls.token_similarity(name, cand["station_name"])
                        op_match = operator.lower() in cand["operator"].lower() or cand["operator"].lower() in operator.lower()
                        if dist <= 0.05 or sim >= 0.3 or op_match:
                            conn.close()
                            return cand["station_entity_id"]

        # 2. Name & Area Match (for unplotted/approximate stations)
        area = station.get("area")
        if area and name:
            cursor.execute("""
            SELECT station_entity_id, station_name, operator, area
            FROM stations
            WHERE area LIKE ?
            """, (f"%{area}%",))
            for cand in cursor.fetchall():
                sim = cls.token_similarity(name, cand["station_name"])
                if sim >= 0.5:
                    conn.close()
                    return cand["station_entity_id"]

        conn.close()
        return None
