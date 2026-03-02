import os
import sys
from unittest.mock import MagicMock
import pytest

# Mock fastapi before importing the module
class MockBaseHTTPMiddleware:
    def __init__(self, app):
        self.app = app

sys.modules['fastapi'] = MagicMock()
sys.modules['starlette.middleware.base'] = MagicMock()
sys.modules['starlette.middleware.base'].BaseHTTPMiddleware = MockBaseHTTPMiddleware

from middleware.audit import AuditLoggingMiddleware

class MockClient:
    def __init__(self, host):
        self.host = host

class MockRequest:
    def __init__(self, host, headers=None):
        self.client = MockClient(host) if host else None
        self.headers = headers or {}
        self.url = MagicMock()
        self.url.path = "/api/test"
        self.method = "GET"
        self.state = MagicMock()

def create_middleware():
    return AuditLoggingMiddleware(app=MagicMock(), db=MagicMock())

def test_no_forwarded_for():
    middleware = create_middleware()
    req = MockRequest("192.168.1.10")
    assert middleware._get_client_ip(req) == "192.168.1.10"

def test_trust_all(monkeypatch):
    monkeypatch.setenv("TRUSTED_PROXIES", "*")
    middleware = create_middleware()
    req = MockRequest("127.0.0.1", {"X-Forwarded-For": "1.2.3.4, 5.6.7.8"})
    assert middleware._get_client_ip(req) == "1.2.3.4"

def test_untrusted_client_host(monkeypatch):
    monkeypatch.setenv("TRUSTED_PROXIES", "127.0.0.1")
    middleware = create_middleware()
    req = MockRequest("192.168.1.10", {"X-Forwarded-For": "1.2.3.4"})
    assert middleware._get_client_ip(req) == "192.168.1.10"

def test_trusted_client_host_untrusted_proxy(monkeypatch):
    monkeypatch.setenv("TRUSTED_PROXIES", "127.0.0.1")
    middleware = create_middleware()
    req = MockRequest("127.0.0.1", {"X-Forwarded-For": "1.2.3.4, 192.168.1.10, 127.0.0.1"})
    assert middleware._get_client_ip(req) == "192.168.1.10"

def test_all_proxies_trusted(monkeypatch):
    monkeypatch.setenv("TRUSTED_PROXIES", "127.0.0.1, 10.0.0.0/8")
    middleware = create_middleware()
    req = MockRequest("127.0.0.1", {"X-Forwarded-For": "1.2.3.4, 10.0.0.1, 127.0.0.1"})
    assert middleware._get_client_ip(req) == "1.2.3.4"

def test_malformed_ips(monkeypatch):
    monkeypatch.setenv("TRUSTED_PROXIES", "127.0.0.1")
    middleware = create_middleware()
    req = MockRequest("127.0.0.1", {"X-Forwarded-For": "invalid-ip, 127.0.0.1"})
    assert middleware._get_client_ip(req) == "invalid-ip"
