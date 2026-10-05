import json
from datetime import datetime, timedelta
from ..database import get_db

DEFAULT_TTL_SECONDS = 3600  # 1 hour default

class CacheService:
    @staticmethod
    def get(cache_key: str):
        conn = get_db()
        cursor = conn.cursor()
        now_iso = datetime.utcnow().isoformat() + "Z"

        cursor.execute(
            "SELECT data_json, expires_at FROM cache_entries WHERE cache_key = ? AND expires_at > ?",
            (cache_key, now_iso)
        )
        row = cursor.fetchone()
        conn.close()

        if row:
            try:
                return json.loads(row["data_json"])
            except Exception:
                return None
        return None

    @staticmethod
    def set(cache_key: str, category: str, data: any, source: str = "SYSTEM", ttl_seconds: int = DEFAULT_TTL_SECONDS):
        conn = get_db()
        cursor = conn.cursor()
        now = datetime.utcnow()
        created_at = now.isoformat() + "Z"
        expires_at = (now + timedelta(seconds=ttl_seconds)).isoformat() + "Z"

        data_json = json.dumps(data)
        cursor.execute("""
        INSERT OR REPLACE INTO cache_entries (cache_key, category, data_json, created_at, expires_at, source)
        VALUES (?, ?, ?, ?, ?, ?)
        """, (cache_key, category, data_json, created_at, expires_at, source))

        conn.commit()
        conn.close()

    @staticmethod
    def clear_expired():
        conn = get_db()
        cursor = conn.cursor()
        now_iso = datetime.utcnow().isoformat() + "Z"
        cursor.execute("DELETE FROM cache_entries WHERE expires_at <= ?", (now_iso,))
        deleted_count = cursor.rowcount
        conn.commit()
        conn.close()
        return deleted_count
