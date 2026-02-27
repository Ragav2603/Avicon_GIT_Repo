"""PII masking / redaction service.

Masks personally identifiable information BEFORE sending data to LLMs.
This ensures compliance with GDPR and SOC2 data protection requirements.
"""
import logging
import re
from typing import List, Tuple

logger = logging.getLogger("avicon.pii")

# PII patterns with named groups
PII_PATTERNS: List[Tuple[str, str, str]] = [
    # (pattern_name, regex, replacement)
    ("email", r"\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b", "[EMAIL_REDACTED]"),
    ("phone_us", r"\b(?:\+?1[-.]?)?\(?\d{3}\)?[-.]?\d{3}[-.]?\d{4}\b", "[PHONE_REDACTED]"),
    ("phone_intl", r"\b\+?\d{1,3}[-.]?\d{6,14}\b", "[PHONE_REDACTED]"),
    ("ssn", r"\b\d{3}-\d{2}-\d{4}\b", "[SSN_REDACTED]"),
    ("credit_card", r"\b(?:\d{4}[-\s]?){3}\d{4}\b", "[CC_REDACTED]"),
    ("ip_address", r"\b\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3}\b", "[IP_REDACTED]"),
    ("passport", r"\b[A-Z]{1,2}\d{6,9}\b", "[PASSPORT_REDACTED]"),
    ("iban", r"\b[a-zA-Z]{2}[0-9]{2}[a-zA-Z0-9]{4}[0-9]{7}([a-zA-Z0-9]?){0,16}\b", "[IBAN_REDACTED]"),
    ("swift_bic", r"\b[A-Z]{6}[A-Z0-9]{2}([A-Z0-9]{3})?\b", "[SWIFT_REDACTED]"),
    ("routing_number", r"\b\d{9}\b", "[ROUTING_REDACTED]"),
]


def mask_pii(text: str, log_redactions: bool = True) -> str:
    """Apply PII masking to text before it reaches the LLM.

    Args:
        text: Raw text that may contain PII
        log_redactions: Whether to log what was redacted (without values)

    Returns:
        Text with PII patterns replaced with redaction tokens
    """
    redaction_count = 0
    redacted_types = []

    for pattern_name, pattern, replacement in PII_PATTERNS:
        matches = re.findall(pattern, text)
        if matches:
            redaction_count += len(matches)
            redacted_types.append(f"{pattern_name}:{len(matches)}")
            text = re.sub(pattern, replacement, text)

    if redaction_count > 0 and log_redactions:
        logger.info(f"PII_MASK | redacted {redaction_count} items: {', '.join(redacted_types)}")

    return text


def mask_documents(documents: list, log_redactions: bool = True) -> list:
    """Apply PII masking to a list of LangChain documents."""
    for doc in documents:
        doc.page_content = mask_pii(doc.page_content, log_redactions=log_redactions)
    return documents
