from fastapi import FastAPI, Request
from fastapi.testclient import TestClient
from middleware.rate_limiter import RateLimiterMiddleware

app = FastAPI()

app.add_middleware(
    RateLimiterMiddleware,
    requests_per_minute=20000,
    requests_per_hour=20000,
    burst_limit=20000,
)


@app.get("/cache_keys")
def get_cache_size(request: Request):
    middleware = None
    mw = request.app.middleware_stack
    while mw is not None:
        if isinstance(mw, RateLimiterMiddleware):
            middleware = mw
            break
        if hasattr(mw, "app"):
            mw = mw.app
        else:
            break

    if not middleware:
        return {"error": "Middleware not found"}

    return {
        "cache_keys": list(middleware._store.keys()),
        "cache_size": len(middleware._store),
    }


@app.get("/test")
def helper_test_route(request: Request):
    return {"status": "ok"}


def test_lru_eviction():
    client = TestClient(app)

    for i in range(10001):
        ip = f"192.168.{i // 256}.{i % 256}"
        response = client.get("/test", headers={"X-Forwarded-For": ip})
        assert response.status_code == 200, f"Failed at {ip}: {response.json()}"

    res = client.get("/cache_keys")
    assert res.status_code == 200
    data = res.json()

    assert data["cache_size"] == 10000
    assert "ip:192.168.0.0" not in data["cache_keys"]
    assert f"ip:192.168.{10000 // 256}.{10000 % 256}" in data["cache_keys"]
