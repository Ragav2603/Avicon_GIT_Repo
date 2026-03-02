import logging
import pytest
from services.pii_masker import mask_pii, mask_documents

def test_mask_email():
    text = "Contact us at support@example.com for help."
    masked = mask_pii(text)
    assert masked == "Contact us at [EMAIL_REDACTED] for help."

def test_mask_phone_us():
    text = "Call 555-123-4567 or 1-555-123-4567."
    masked = mask_pii(text)
    assert masked == "Call [PHONE_REDACTED] or [PHONE_REDACTED]."

def test_mask_ssn():
    text = "My SSN is 123-45-6789."
    masked = mask_pii(text)
    assert masked == "My SSN is [SSN_REDACTED]."

def test_mask_credit_card():
    text = "Here is my card 1234-5678-9012-3456."
    masked = mask_pii(text)
    assert masked == "Here is my card [CC_REDACTED]."

def test_mask_ip_address():
    text = "Server IP is 192.168.1.100."
    masked = mask_pii(text)
    assert masked == "Server IP is [IP_REDACTED]."

def test_mask_multiple_types():
    text = "Name: John, Email: john@test.com, Phone: 800-555-1234"
    masked = mask_pii(text)
    assert "[EMAIL_REDACTED]" in masked
    assert "[PHONE_REDACTED]" in masked
    assert "john@test.com" not in masked
    assert "800-555-1234" not in masked

def test_no_pii_no_change():
    text = "This is a normal sentence without any sensitive info."
    masked = mask_pii(text)
    assert masked == text

def test_logging(caplog):
    with caplog.at_level(logging.INFO):
        text = "Test email@test.com"
        mask_pii(text)
        assert "PII_MASK | redacted" in caplog.text
        assert "email:1" in caplog.text

def test_no_logging_if_false(caplog):
    with caplog.at_level(logging.INFO):
        text = "Test email@test.com"
        mask_pii(text, log_redactions=False)
        assert "PII_MASK | redacted" not in caplog.text

class MockDocument:
    def __init__(self, page_content):
        self.page_content = page_content

def test_mask_documents():
    docs = [
        MockDocument("Text with test@example.com"),
        MockDocument("Another text 123-45-6789")
    ]
    masked_docs = mask_documents(docs)
    assert masked_docs[0].page_content == "Text with [EMAIL_REDACTED]"
    assert masked_docs[1].page_content == "Another text [SSN_REDACTED]"
