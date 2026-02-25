import sys
import threading
import time
from unittest.mock import MagicMock

# Mock dependencies of services.rag_engine
mock_modules = [
    "langchain_core",
    "langchain_core.documents",
    "langchain_core.output_parsers",
    "langchain_core.prompts",
    "langchain_core.runnables",
    "langchain_openai",
    "langchain_pinecone",
    "langchain_text_splitters",
    "services.pii_masker",
]

for mod in mock_modules:
    sys.modules[mod] = MagicMock()

# Import QueryCache after mocking dependencies
from services.rag_engine import QueryCache  # noqa: E402


def test_query_cache_init():
    cache = QueryCache(max_size=10, ttl_seconds=60)
    assert cache._max_size == 10
    assert cache._ttl == 60
    assert len(cache._cache) == 0


def test_query_cache_make_key():
    cache = QueryCache()
    key1 = cache._make_key("cust1", "query1")
    key2 = cache._make_key("cust1", "query1 ")
    key3 = cache._make_key("cust1", "QUERY1")
    assert key1 == key2
    assert key1 == key3

    key4 = cache._make_key("cust2", "query1")
    assert key1 != key4


def test_query_cache_set_get():
    cache = QueryCache(ttl_seconds=60)
    cache.set("cust1", "q1", {"ans": "a1"})

    val = cache.get("cust1", "q1")
    assert val == {"ans": "a1"}

    assert cache.get("cust1", "q2") is None


def test_query_cache_lru_eviction():
    cache = QueryCache(max_size=2)
    cache.set("c", "q1", "a1")
    cache.set("c", "q2", "a2")

    # Access q1 to make it most recently used
    cache.get("c", "q1")

    cache.set("c", "q3", "a3")  # Should evict q2

    assert cache.get("c", "q2") is None
    assert cache.get("c", "q1") == "a1"
    assert cache.get("c", "q3") == "a3"


def test_query_cache_ttl_expiration():
    cache = QueryCache(ttl_seconds=0.1)
    cache.set("c", "q1", "a1")
    assert cache.get("c", "q1") == "a1"

    time.sleep(0.2)
    assert cache.get("c", "q1") is None


def test_query_cache_invalidate_customer():
    cache = QueryCache()
    cache.set("cust1", "q1", "a1")
    cache.set("cust1", "q2", "a2")
    cache.set("cust2", "q1", "a3")

    assert cache.get("cust1", "q1") == "a1"

    cache.invalidate_customer("cust1")

    assert cache.get("cust1", "q1") is None
    assert cache.get("cust1", "q2") is None
    assert cache.get("cust2", "q1") == "a3"


def test_query_cache_max_size_one():
    cache = QueryCache(max_size=1)
    cache.set("c", "q1", "a1")
    cache.set("c", "q2", "a2")

    assert cache.get("c", "q1") is None
    assert cache.get("c", "q2") == "a2"


def test_query_cache_update_existing_key():
    cache = QueryCache(max_size=2)
    cache.set("c", "q1", "a1")
    cache.set("c", "q2", "a2")

    # Update q1, should move it to end
    cache.set("c", "q1", "a1_new")

    cache.set("c", "q3", "a3")  # Should evict q2

    assert cache.get("c", "q2") is None
    assert cache.get("c", "q1") == "a1_new"
    assert cache.get("c", "q3") == "a3"


def test_query_cache_update_does_not_evict_other():
    cache = QueryCache(max_size=2)
    cache.set("c", "q1", "a1")
    cache.set("c", "q2", "a2")

    # Update q2. Should NOT evict q1.
    cache.set("c", "q2", "a2_new")

    assert cache.get("c", "q1") == "a1"
    assert cache.get("c", "q2") == "a2_new"


def test_query_cache_thread_safety_smoke_test():
    # Just a smoke test to ensure no crashes during concurrent access
    cache = QueryCache(max_size=100)

    def worker(worker_id):
        for i in range(50):
            cache.set(f"cust_{worker_id}", f"q_{i}", {"val": i})
            cache.get(f"cust_{worker_id}", f"q_{i}")
            if i % 10 == 0:
                cache.invalidate_customer(f"cust_{worker_id}")

    threads = []
    for i in range(5):
        t = threading.Thread(target=worker, args=(i,))
        threads.append(t)
        t.start()

    for t in threads:
        t.join()

    # If we reached here without crash, it's a good sign
    assert True
