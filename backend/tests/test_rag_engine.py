import sys
from unittest.mock import MagicMock

# Mock dependencies of services.rag_engine to avoid loading heavy Azure or LlamaIndex models
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
    "llama_index",
    "llama_index.core",
    "llama_index.core.node_parser",
    "llama_index.llms.azure_openai",
    "llama_index.embeddings.azure_openai",
]

for mod in mock_modules:
    sys.modules[mod] = MagicMock()

# Import the specific function we are testing
from services.rag_engine import _extract_sources  # noqa: E402


class DummyNode:
    """Mock LlamaIndex Node"""
    def __init__(self, metadata=None):
        self.metadata = metadata or {}


class DummyNodeWithScore:
    """Mock LlamaIndex NodeWithScore"""
    def __init__(self, node=None):
        self.node = node


def test_extract_sources_happy_path():
    """Test extracting sources from well-formed nodes."""
    docs = [
        DummyNodeWithScore(node=DummyNode(metadata={
            "source": "doc1.pdf",
            "Header 1": "Introduction",
            "Header 2": "Background"
        })),
        DummyNodeWithScore(node=DummyNode(metadata={
            "source": "doc2.docx",
            "Header 1": "Methods",
            "Header 2": ""
        }))
    ]

    result = _extract_sources(docs)

    assert len(result) == 2
    assert result[0]["source"] == "doc1.pdf"
    assert result[0]["headers"] == ["Introduction", "Background"]

    assert result[1]["source"] == "doc2.docx"
    assert result[1]["headers"] == ["Methods", ""]


def test_extract_sources_deduplication():
    """Test that multiple nodes from the same source are deduplicated."""
    docs = [
        DummyNodeWithScore(node=DummyNode(metadata={
            "source": "doc1.pdf",
            "Header 1": "A"
        })),
        DummyNodeWithScore(node=DummyNode(metadata={
            "source": "doc1.pdf",
            "Header 1": "B"
        })),
        DummyNodeWithScore(node=DummyNode(metadata={
            "source": "doc2.pdf",
            "Header 1": "C"
        }))
    ]

    result = _extract_sources(docs)

    # Only doc1.pdf (first occurrence) and doc2.pdf should be present
    assert len(result) == 2
    assert result[0]["source"] == "doc1.pdf"
    assert result[0]["headers"] == ["A", ""]
    assert result[1]["source"] == "doc2.pdf"
    assert result[1]["headers"] == ["C", ""]


def test_extract_sources_missing_metadata():
    """Test nodes with missing source or header metadata."""
    docs = [
        DummyNodeWithScore(node=DummyNode(metadata={})),
        DummyNodeWithScore(node=DummyNode(metadata={"source": "doc1.pdf"}))
    ]

    result = _extract_sources(docs)

    assert len(result) == 2
    # Missing source defaults to "unknown"
    assert result[0]["source"] == "unknown"
    assert result[0]["headers"] == ["", ""]

    assert result[1]["source"] == "doc1.pdf"
    assert result[1]["headers"] == ["", ""]


def test_extract_sources_missing_node():
    """Test handling of items in the list that don't have a 'node' attribute."""
    # DummyNodeWithScore without a 'node', plus a raw dict, plus a valid node
    class NoNodeObj:
        pass

    docs = [
        DummyNodeWithScore(node=None),
        NoNodeObj(),
        DummyNodeWithScore(node=DummyNode(metadata={"source": "valid.pdf", "Header 1": "H1"}))
    ]

    result = _extract_sources(docs)

    # The first two should be skipped
    assert len(result) == 1
    assert result[0]["source"] == "valid.pdf"
    assert result[0]["headers"] == ["H1", ""]


def test_extract_sources_empty_list():
    """Test extracting from an empty list."""
    assert _extract_sources([]) == []
    assert _extract_sources(None) == []  # Should handle None gracefully if passed
