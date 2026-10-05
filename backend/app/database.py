import sqlite3
import os
import json
from datetime import datetime

DB_PATH = os.path.abspath(os.path.join(os.path.dirname(__file__), "../ev_agent.db"))
SEED_DATA_PATH = os.path.abspath(os.path.join(os.path.dirname(__file__), "../../data/stations.json"))

def get_db():
    conn = sqlite3.connect(DB_PATH)
    conn.row_factory = sqlite3.Row
    return conn

def init_db():
    os.makedirs(os.path.dirname(DB_PATH), exist_ok=True)
    conn = get_db()
    cursor = conn.cursor()

    # 1. Normalized Stations Table
    cursor.execute("""
    CREATE TABLE IF NOT EXISTS stations (
        station_entity_id TEXT PRIMARY KEY,
        station_id TEXT UNIQUE,
        station_name TEXT NOT NULL,
        operator TEXT NOT NULL,
        address TEXT,
        city TEXT DEFAULT 'Chennai',
        area TEXT,
        latitude REAL,
        longitude REAL,
        phone TEXT,
        opening_time TEXT,
        closing_time TEXT,
        is_24_hours INTEGER DEFAULT 0,
        station_status TEXT DEFAULT 'OPERATIONAL',
        power_kw REAL,
        status TEXT DEFAULT 'AVAILABLE',
        price_per_kwh REAL,
        source TEXT NOT NULL,
        source_url TEXT,
        retrieved_at TEXT,
        last_verified_at TEXT,
        data_quality TEXT NOT NULL,
        confidence REAL DEFAULT 1.0,
        is_demo INTEGER DEFAULT 0
    )
    """)

    # 2. Chargers Table (1-to-many relationship)
    cursor.execute("""
    CREATE TABLE IF NOT EXISTS chargers (
        charger_id TEXT PRIMARY KEY,
        station_entity_id TEXT NOT NULL,
        connector_type TEXT NOT NULL,
        charger_type TEXT NOT NULL,
        power_kw REAL,
        status TEXT DEFAULT 'AVAILABLE',
        source TEXT,
        FOREIGN KEY (station_entity_id) REFERENCES stations (station_entity_id) ON DELETE CASCADE
    )
    """)

    # 3. Source Records Provenance Table
    cursor.execute("""
    CREATE TABLE IF NOT EXISTS station_sources (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        station_entity_id TEXT NOT NULL,
        source TEXT NOT NULL,
        source_record_id TEXT,
        raw_data_json TEXT,
        retrieved_at TEXT,
        FOREIGN KEY (station_entity_id) REFERENCES stations (station_entity_id) ON DELETE CASCADE
    )
    """)

    # 4. Data Conflicts Table
    cursor.execute("""
    CREATE TABLE IF NOT EXISTS data_conflicts (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        station_entity_id TEXT NOT NULL,
        field_name TEXT NOT NULL,
        source_a TEXT NOT NULL,
        value_a TEXT,
        source_b TEXT NOT NULL,
        value_b TEXT,
        detected_at TEXT NOT NULL,
        resolved INTEGER DEFAULT 0,
        FOREIGN KEY (station_entity_id) REFERENCES stations (station_entity_id) ON DELETE CASCADE
    )
    """)

    # 5. OSINT Synchronization Logs Table
    cursor.execute("""
    CREATE TABLE IF NOT EXISTS osint_sync_logs (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        source TEXT NOT NULL,
        started_at TEXT NOT NULL,
        completed_at TEXT,
        status TEXT NOT NULL,
        records_received INTEGER DEFAULT 0,
        records_accepted INTEGER DEFAULT 0,
        records_rejected INTEGER DEFAULT 0,
        duplicates_found INTEGER DEFAULT 0,
        conflicts_found INTEGER DEFAULT 0,
        error_message TEXT
    )
    """)

    # 6. High-Performance Caching Table
    cursor.execute("""
    CREATE TABLE IF NOT EXISTS cache_entries (
        cache_key TEXT PRIMARY KEY,
        category TEXT NOT NULL,
        data_json TEXT NOT NULL,
        created_at TEXT NOT NULL,
        expires_at TEXT NOT NULL,
        source TEXT NOT NULL
    )
    """)

    # Indexes for rapid geospatial querying and searching
    cursor.execute("CREATE INDEX IF NOT EXISTS idx_stations_coords ON stations(latitude, longitude)")
    cursor.execute("CREATE INDEX IF NOT EXISTS idx_stations_operator ON stations(operator)")
    cursor.execute("CREATE INDEX IF NOT EXISTS idx_stations_status ON stations(status)")
    cursor.execute("CREATE INDEX IF NOT EXISTS idx_stations_source ON stations(source)")
    cursor.execute("CREATE INDEX IF NOT EXISTS idx_chargers_station ON chargers(station_entity_id)")
    cursor.execute("CREATE INDEX IF NOT EXISTS idx_chargers_connector ON chargers(connector_type)")
    cursor.execute("CREATE INDEX IF NOT EXISTS idx_conflicts_entity ON data_conflicts(station_entity_id)")
    cursor.execute("CREATE INDEX IF NOT EXISTS idx_cache_expiry ON cache_entries(expires_at)")

    conn.commit()

    # Seed initial data if stations table is empty
    cursor.execute("SELECT COUNT(*) as count FROM stations")
    count = cursor.fetchone()["count"]
    if count == 0 and os.path.exists(SEED_DATA_PATH):
        seed_database(conn)

    conn.close()

def seed_database(conn):
    with open(SEED_DATA_PATH, "r", encoding="utf-8") as f:
        stations = json.load(f)

    cursor = conn.cursor()
    now_iso = datetime.utcnow().isoformat() + "Z"

    for st in stations:
        entity_id = f"ENT-{st['station_id']}"
        source_name = "BEE" if st.get("data_source") == "BEE_Public_EV_Dataset" else "OPERATOR_LISTING"

        cursor.execute("""
        INSERT OR REPLACE INTO stations (
            station_entity_id, station_id, station_name, operator, address, city, area,
            latitude, longitude, phone, opening_time, closing_time, is_24_hours,
            station_status, power_kw, status, price_per_kwh, source, source_url,
            retrieved_at, last_verified_at, data_quality, confidence, is_demo
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        """, (
            entity_id,
            st["station_id"],
            st["station_name"],
            st["operator"],
            st.get("address"),
            st.get("city", "Chennai"),
            st.get("area"),
            st.get("latitude"),
            st.get("longitude"),
            st.get("phone"),
            st.get("opening_time", "06:00"),
            st.get("closing_time", "23:00"),
            1 if st.get("is_24_hours") else 0,
            st.get("station_status", "OPERATIONAL"),
            st.get("power_kw"),
            st.get("status", "AVAILABLE"),
            st.get("price_per_kwh", 18.0),
            source_name,
            "https://beeindia.gov.in" if source_name == "BEE" else None,
            now_iso,
            st.get("last_verified_at"),
            st.get("data_quality", "OPERATOR_LISTING"),
            1.0 if st.get("latitude") else 0.8,
            1 if st.get("is_demo") else 0
        ))

        # Insert charger record
        charger_id = st.get("charger_id") or f"CHG-{entity_id}-01"
        cursor.execute("""
        INSERT OR REPLACE INTO chargers (
            charger_id, station_entity_id, connector_type, charger_type, power_kw, status, source
        ) VALUES (?, ?, ?, ?, ?, ?, ?)
        """, (
            charger_id,
            entity_id,
            st.get("connector_type", "CCS2"),
            st.get("charger_type", "DC"),
            st.get("power_kw", 30.0),
            st.get("status", "AVAILABLE"),
            source_name
        ))

        # Record initial source provenance
        cursor.execute("""
        INSERT INTO station_sources (station_entity_id, source, source_record_id, raw_data_json, retrieved_at)
        VALUES (?, ?, ?, ?, ?)
        """, (
            entity_id,
            source_name,
            st["station_id"],
            json.dumps(st),
            now_iso
        ))

    # Log initial seed event in sync logs
    cursor.execute("""
    INSERT INTO osint_sync_logs (
        source, started_at, completed_at, status, records_received, records_accepted,
        records_rejected, duplicates_found, conflicts_found
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    """, (
        "SEED_INITIAL_DATASET",
        now_iso,
        now_iso,
        "SUCCESS",
        len(stations),
        len(stations),
        0,
        0,
        0
    ))

    # Add a sample demo data conflict for demonstration of the conflict engine
    # (e.g. OCM vs BEE power rating divergence on Guindy station)
    guindy_match = next((s for s in stations if "GUINDY" in s["station_id"]), stations[0])
    cursor.execute("""
    INSERT INTO data_conflicts (
        station_entity_id, field_name, source_a, value_a, source_b, value_b, detected_at, resolved
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    """, (
        f"ENT-{guindy_match['station_id']}",
        "power_kw",
        "BEE_REFERENCE",
        "3.3 kW",
        "OPEN_CHARGE_MAP",
        "22.0 kW",
        now_iso,
        0
    ))

    conn.commit()
