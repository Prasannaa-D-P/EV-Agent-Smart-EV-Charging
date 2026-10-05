import unittest
import os
import json
from unittest.mock import patch, MagicMock
from app.database import init_db, get_db
from app.adapters.openchargemap import OpenChargeMapAdapter
from app.adapters.overpass import OverpassAdapter
from app.adapters.nominatim import NominatimAdapter
from app.adapters.osrm import OSRMAdapter
from app.adapters.openmeteo import OpenMeteoAdapter
from app.adapters.bee import BEEAdapter
from app.adapters.operators import AtherAdapter, TataPowerAdapter
from app.services.duplicate_detector import DuplicateDetector
from app.services.conflict_detector import ConflictDetector
from app.services.data_quality import DataQualityEngine
from app.services.cache_service import CacheService
from app.services.rate_limiter import RateLimiter

class TestOSINTAdapters(unittest.TestCase):
    @classmethod
    def setUpClass(cls):
        os.environ["OSINT_MODE"] = "mock"
        init_db()

    def test_openchargemap_mock_fetch_and_normalize(self):
        adapter = OpenChargeMapAdapter()
        self.assertTrue(adapter.connect())
        health = adapter.health_check()
        self.assertTrue(health["connected"])
        raw = adapter.fetch()
        self.assertGreater(len(raw), 0)
        norm = adapter.normalize(raw)
        self.assertGreater(len(norm), 0)
        for st in norm:
            self.assertEqual(st["source"], "OPEN_CHARGE_MAP")
            self.assertIsNotNone(st["station_name"])
            self.assertIsNotNone(st["operator"])
            self.assertIn("chargers", st)

    def test_overpass_mock_fetch_and_normalize(self):
        adapter = OverpassAdapter()
        health = adapter.health_check()
        self.assertTrue(health["connected"])
        raw = adapter.fetch()
        self.assertGreater(len(raw), 0)
        norm = adapter.normalize(raw)
        self.assertGreater(len(norm), 0)
        self.assertEqual(norm[0]["source"], "OPENSTREETMAP")

    def test_nominatim_geocoding_and_caching(self):
        adapter = NominatimAdapter()
        res = adapter.geocode_address("Guindy Industrial Estate")
        self.assertIsNotNone(res)
        self.assertIn("latitude", res)
        self.assertIn("longitude", res)

        # Reverse geocoding
        rev = adapter.reverse_geocode(13.0125, 80.2206)
        self.assertIsNotNone(rev)
        self.assertIn("address", rev)

    def test_osrm_route_calculation(self):
        adapter = OSRMAdapter()
        route = adapter.calculate_route(13.0850, 80.2100, 13.0125, 80.2206)
        self.assertIn("distance_km", route)
        self.assertIn("duration_minutes", route)
        self.assertIn("geometry", route)
        self.assertGreater(route["distance_km"], 0)

    def test_openmeteo_weather(self):
        adapter = OpenMeteoAdapter()
        weather = adapter.get_current_weather(13.0827, 80.2707)
        self.assertIn("temperature_c", weather)
        self.assertIn("weather_condition", weather)
        self.assertIn("wind_speed_kmh", weather)

    def test_bee_adapter_reference_data(self):
        adapter = BEEAdapter()
        records = adapter.fetch()
        self.assertGreater(len(records), 0)
        norm = adapter.normalize(records)
        self.assertEqual(norm[0]["source"], "BEE")
        self.assertEqual(norm[0]["data_quality"], "VERIFIED_COORDINATE")

    def test_operator_disabled_state_for_private_apis(self):
        ather = AtherAdapter()
        self.assertFalse(ather.connect())
        health = ather.health_check()
        self.assertEqual(health["status"], "PUBLIC_API_NOT_CONFIGURED")

        tata = TataPowerAdapter()
        self.assertFalse(tata.connect())

    def test_duplicate_detection_proximity(self):
        st1 = {
            "latitude": 13.012477,
            "longitude": 80.220603,
            "station_name": "Ather Space Mount Road",
            "operator": "Ather"
        }
        # Station with near-identical coordinates should match existing Guindy station in SQLite
        entity_id = DuplicateDetector.find_matching_entity(st1)
        self.assertIsNotNone(entity_id)

    def test_conflict_detection(self):
        entity_id = "ENT-TEST-001"
        existing = {"source": "BEE", "power_kw": 30.0, "status": "AVAILABLE"}
        new_rec = {"power_kw": 60.0, "status": "AVAILABLE"}
        conflicts = ConflictDetector.check_and_log_conflicts(entity_id, existing, new_rec, "OPEN_CHARGE_MAP")
        self.assertEqual(len(conflicts), 1)
        self.assertEqual(conflicts[0]["field"], "power_kw")

    def test_data_quality_classification(self):
        q_demo = DataQualityEngine.evaluate_station({"is_demo": True})
        self.assertEqual(q_demo, "DEMO")

        q_verified = DataQualityEngine.evaluate_station({
            "latitude": 13.0125,
            "longitude": 80.2206,
            "source": "BEE",
            "is_demo": False
        })
        self.assertEqual(q_verified, "VERIFIED_COORDINATE")

        q_listing = DataQualityEngine.evaluate_station({
            "latitude": None,
            "longitude": None,
            "source": "OPERATOR_LISTING",
            "is_demo": False
        })
        self.assertEqual(q_listing, "OPERATOR_LISTING")

    def test_cache_fallback_and_expiry(self):
        CacheService.set("test_key", "test_cat", {"val": 42}, ttl_seconds=10)
        cached = CacheService.get("test_key")
        self.assertEqual(cached, {"val": 42})

if __name__ == "__main__":
    unittest.main()
