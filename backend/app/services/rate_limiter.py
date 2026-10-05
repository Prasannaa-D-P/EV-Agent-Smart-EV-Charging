import time
import threading

class RateLimiter:
    """
    In-memory rate limiter per external service to respect public usage policies.
    Guarantees minimum delay between calls for services like Nominatim and Overpass.
    """
    _locks = {}
    _last_call_times = {}

    @classmethod
    def wait_for(cls, service_name: str, min_delay_seconds: float = 1.0):
        if service_name not in cls._locks:
            cls._locks[service_name] = threading.Lock()
            cls._last_call_times[service_name] = 0.0

        with cls._locks[service_name]:
            now = time.time()
            elapsed = now - cls._last_call_times[service_name]
            if elapsed < min_delay_seconds:
                sleep_time = min_delay_seconds - elapsed
                time.sleep(sleep_time)
            cls._last_call_times[service_name] = time.time()
