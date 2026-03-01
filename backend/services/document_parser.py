"""Document parsing service using LlamaParse.

Extracts complex tables and text from PDFs/DOCX/XLSX into markdown.
Injected with customer_id metadata for tenant isolation.
"""

import logging
import os
from typing import List

from langchain_core.documents import Document
from llama_parse import LlamaParse

from services.pii_masker import mask_pii

logger = logging.getLogger("avicon.parser")


async def parse_document(file_path: str, customer_id: str) -> List[Document]:
    """Parse a document file using LlamaParse.

    Args:
        file_path: Local path to the uploaded file
        customer_id: Tenant ID for metadata injection

    Returns:
        List of LangChain Documents with customer_id metadata
    """
    parser = LlamaParse(
        api_key=os.environ.get("LLAMA_CLOUD_API_KEY"),
        result_type="markdown",
        verbose=False,
    )

    logger.info(
        f"PARSE_START | customer={customer_id} | file={os.path.basename(file_path)}"
    )

    documents = await parser.aload_data(file_path)

    langchain_docs = []
    for doc in documents:
        # PII-mask document content before storage
        masked_content = mask_pii(doc.text)

        langchain_docs.append(
            Document(
                page_content=masked_content,
                metadata={
                    "customer_id": customer_id,
                    "source": os.path.basename(file_path),
                },
            )
        )

    logger.info(
        f"PARSE_DONE | customer={customer_id} | documents={len(langchain_docs)}"
    )
    return langchain_docs
