# EV-Agent: OSINT / Open Data Integration Layer Architecture (Stage 2)

## 1. Overview
The **OSINT / Open Data Integration Layer** is Stage 2 in the development of **EV-Agent: Agentic AI Powered Smart EV Charging Platform**. It establishes an ethical, resilient, and multi-source ingestion pipeline for open geospatial, charging station, routing, and meteorological data across the **Chennai metropolitan corridor** (Tamil Nadu, India).

### Core Principles
1. **Isolated Adapters**: Each open data source communicates via an isolated adapter implementing `BaseDataSource`.
2. **Canonical Schema Normalization**: Diverse upstream payloads (OCM JSON, OSM Overpass XML/JSON, BEE tables) are normalized into a unified 22-field schema and related charger entities.
3. **No Silent Overwrites**: When sources disagree on station metadata (e.g. power rating, connector type, pricing), discrepancies are flagged and recorded in a dedicated `data_conflicts` log for transparent human and agent inspection.
4. **Ethical Open Data Compliance**: Respects upstream terms of service with built-in rate-limiting delay queues (Nominatim 1.0s, Overpass 2.0s, OSRM 0.5s) and intelligent TTL caching.
5. **No Fake Data / Honesty in Stubs**: Proprietary closed networks (Ather Grid, Tata Power EZ Charge, Zeon, Statiq, YoCharge, Jio-bp) without public developer keys are explicitly marked `PUBLIC_API_NOT_CONFIGURED` rather than simulated with fake live status.

---

## 2. Integrated Data Sources & Adapters

| Source ID | Name | Type | Coverage / Scope | Access / Terms Policy |
| :--- | :--- | :--- | :--- | :--- |
| `BEE_PORTAL` | Bureau of Energy Efficiency (BEE) | Public Directory | Chennai Metropolitan Area | Official verified ground truth |
| `OPEN_CHARGE_MAP` | Open Charge Map (OCM) | Global Open Registry | Chennai Bounding Box | Public API (mock fallback supported) |
| `OSM_OVERPASS` | OpenStreetMap Overpass API | Geospatial Crowdsourced | `amenity=charging_station` | 2.0s rate limit, bounding box query |
| `OSM_NOMINATIM` | Nominatim Geocoding | Reverse/Forward Geo | Chennai Corridors | 1.0s rate limit, custom User-Agent, 7-day cache |
| `OSRM` | Open Source Routing Machine | Routing Engine | Road network routing | Polyline geometry, distance & duration |
| `OPEN_METEO` | Open-Meteo Weather API | Meteorological | Chennai (`13.0827°N, 80.2707°E`) | Ambient temp, humidity, wind speed, 15-min cache |
| `TNEV_DIRECTORY` | Tamil Nadu EV Policy Directory | State Ground Truth | Tamil Nadu state hubs | Reference dataset |
| `DATA_GOV_IN` | India Open Government Data | National Registry | Ministry of Power / NITI Aayog | Public reference directory |
| `IEA_GLOBAL` | IEA Global EV Data Explorer | Macro Statistics | Indian EV infrastructure statistics | Research context |
| `ATHER_GRID` | Ather Grid | Proprietary Network | Two-wheeler fast chargers | `PUBLIC_API_NOT_CONFIGURED` |
| `TATA_POWER_EZ` | Tata Power EZ Charge | Proprietary Network | Multi-city commercial hubs | `PUBLIC_API_NOT_CONFIGURED` |
| `ZEON_CHARGING` | Zeon Charging | Proprietary Network | Highway corridors | `PUBLIC_API_NOT_CONFIGURED` |
| `STATIQ` | Statiq Network | Proprietary Network | Urban commercial chargers | `PUBLIC_API_NOT_CONFIGURED` |
| `YOCHARGE` | YoCharge Platform | Proprietary Network | Commercial EV fleet chargers | `PUBLIC_API_NOT_CONFIGURED` |
| `MAHINDRA_JIOBP` | Jio-bp Pulse / Mahindra | Proprietary Network | Dual-operator hubs | `PUBLIC_API_NOT_CONFIGURED` |

---

## 3. Data Schema & Normalization

### 3.1 Canonical Station Schema (22 Fields)
All incoming records are normalized by `Normalizer.normalize_station()` into this SQLite-backed structure:

1. `station_entity_id`: Globally unique deduplicated entity identifier (e.g. `ST-BEE-001`, `ST-OCM-245190`).
2. `station_id`: Primary human-readable identifier.
3. `station_name`: Formal station name.
4. `operator`: Operating entity (e.g. `Tata Power`, `BEE`, `Zeon`, `Ather`).
5. `address`: Complete street address.
6. `city`: City name (`Chennai`).
7. `area`: Sub-district / corridor (e.g. `Guindy`, `OMR`, `Anna Nagar`, `Adyar`).
8. `latitude`: WGS-84 coordinate float (or `NULL` if unverified).
9. `longitude`: WGS-84 coordinate float (or `NULL` if unverified).
10. `phone`: Contact telephone or support line.
11. `opening_time`: Daily opening timestamp (e.g. `06:00`).
12. `closing_time`: Daily closing timestamp (e.g. `23:00`).
13. `is_24_hours`: Boolean flag indicating 24/7 continuous operation.
14. `station_status`: Operating status (`OPERATIONAL`, `MAINTENANCE`, `TEMPORARILY_CLOSED`).
15. `connector_type`: Predominant connector standard (`CCS2`, `Type 2 AC`, `Bharat DC-001`).
16. `charger_type`: Electrical class (`AC` or `DC`).
17. `power_kw`: Primary hardware power rating in kilowatts.
18. `status`: Current operational availability (`AVAILABLE`, `LIMITED`, `OCCUPIED`).
19. `price_per_kwh`: Billing tariff in INR (₹).
20. `last_verified_at`: ISO-8601 audit timestamp.
21. `data_source`: Originating primary data source identifier.
22. `data_quality`: Provenance classification (`VERIFIED_COORDINATE`, `OPERATOR_LISTING`, `LIVE_STATUS`, `ESTIMATED`, `DEMO`).

### 3.2 Canonical Charger Entity Schema
Linked one-to-many to station entities:
- `charger_id`: Hardware port identifier.
- `station_entity_id`: Parent station foreign key.
- `connector_type`: Physical connector type (`CCS2`, `Type 2`, `CHAdeMO`, `GB/T`).
- `charger_type`: `AC` or `DC`.
- `power_kw`: Dedicated power output in kW.
- `status`: Individual bay status.
- `source`: Ingestion feed source.

---

## 4. Deduplication & Conflict Detection

### 4.1 Deduplication Algorithm
`DuplicateDetector.find_match(candidate, existing_stations)` evaluates records using:
1. **Haversine Distance**: Calculates spherical distance between candidate coordinates and registered stations. Matches within **150 meters** trigger similarity validation.
2. **Tokenized Name Similarity**: Computes token overlap between station names and sub-areas to avoid false positives in dense commercial clusters (e.g., distinguishing between two adjacent chargers in Phoenix Marketcity).

### 4.2 Conflict Logging
When an incoming record from Source B matches an existing station from Source A, `ConflictDetector.detect_conflicts()` checks critical attributes:
- `power_kw`
- `status`
- `price_per_kwh`

Discrepancies are inserted into the `data_conflicts` table without overwriting the verified record:
```sql
CREATE TABLE data_conflicts (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    station_entity_id TEXT NOT NULL,
    field_name TEXT NOT NULL,
    source_a TEXT NOT NULL,
    value_a TEXT NOT NULL,
    source_b TEXT NOT NULL,
    value_b TEXT NOT NULL,
    detected_at TEXT NOT NULL,
    resolved INTEGER DEFAULT 0
);
```

---

## 5. Rate Limiting & Caching Architecture

- **`RateLimiter`**: In-memory timestamp queue ensuring strict delays between upstream requests:
  - OpenStreetMap Nominatim: `1.0s` delay, custom `User-Agent: EV-Agent-Chennai/1.0`.
  - OpenStreetMap Overpass: `2.0s` delay.
  - OSRM Driving Router: `0.5s` delay.
- **`CacheService`**: SQLite `cache_entries` with configurable TTL:
  - Station Feeds: 1 hour.
  - Geocoding / Address Lookups: 7 days.
  - Driving Routes: 24 hours.
  - Meteorological Conditions: 15 minutes.

---

## 6. REST API Reference

### 6.1 OSINT Management
- `GET /api/osint/sources`: Returns all 15 configured sources, their connection status, records stored, and health latency.
- `GET /api/osint/status`: Overall ingestion health, active conflict count, entity count, and last sync timestamp.
- `POST /api/osint/sync`: Triggers multi-source sync pipeline across all connected open data feeds.
- `GET /api/osint/sync-logs`: Detailed audit logs of all historical synchronization runs.
- `GET /api/osint/conflicts`: All unresolved data discrepancies across ingested sources.

### 6.2 Geospatial & Weather
- `GET /api/weather?lat=13.0827&lon=80.2707`: Live ambient temperature, apparent temperature, humidity, and wind conditions from Open-Meteo.
- `GET /api/route?start_lat={lat}&start_lon={lon}&end_lat={lat}&end_lon={lon}`: Turn-by-turn driving route, distance (km), duration (mins), and Leaflet-compatible GeoJSON geometry polyline from OSRM.
- `GET /api/geocode?q={address}`: Forward geocoding via Nominatim.
- `GET /api/reverse-geocode?lat={lat}&lon={lon}`: Reverse geocoding via Nominatim.
- `GET /api/stations/nearby?lat={lat}&lon={lon}&radius_km={radius}`: Haversine distance-sorted station discovery.

---

## 7. Configuration & Environment Modes

In `backend/.env`:
```env
OSINT_MODE=mock      # 'mock' uses local golden payloads for reliable offline testing; 'live' performs outbound HTTP requests
OPEN_CHARGE_MAP_KEY= # Optional API key for Open Charge Map live queries
NOMINATIM_USER_AGENT=EV-Agent-Chennai/1.0
OVERPASS_RATE_LIMIT_DELAY=2.0
OSRM_BASE_URL=https://router.project-osrm.org
```

---

## 8. Verification & Test Suite

Unit tests in `backend/tests/test_osint.py`:
- `test_normalizer_ocm()`: Validates OCM payload normalization into 22-field schema.
- `test_normalizer_overpass()`: Validates OSM Overpass node normalization.
- `test_duplicate_detector()`: Validates <150m Haversine deduplication.
- `test_conflict_detector()`: Validates multi-source field discrepancy detection.
- `test_cache_service()`: Validates cache set, get, and expiration.
- `test_rate_limiter()`: Validates delay queue enforcement.
- `test_weather_adapter()`: Validates Open-Meteo response parser.
- `test_osrm_adapter()`: Validates OSRM driving distance and geometry extraction.
- `test_proprietary_operator_stubs()`: Validates honest `PUBLIC_API_NOT_CONFIGURED` responses.
- `test_osint_sources_endpoint()`: Validates REST blueprint output.
- `test_sync_pipeline()`: Validates end-to-end sync execution and audit log creation.
