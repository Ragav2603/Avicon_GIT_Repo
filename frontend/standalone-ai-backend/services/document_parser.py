import os
from llama_parse import LlamaParse
from langchain_core.documents import Document
import asyncio

async def parse_document(file_path: str, project_id: str) -> list[Document]:
    """
    Parses a PDF/DOCX using LlamaParse for complex table and text extraction.
    Returns LangChain Document objects with project_id metadata.
    """
    # LlamaParse initialization
    parser = LlamaParse(
        api_key=os.environ.get("LLAMA_CLOUD_API_KEY"),  # Fallbacks to env var
        result_type="markdown",  # Markdown works best for tables + RAG
        verbose=True
    )
    
    # Parse the document (aload_data is async)
    documents = await parser.aload_data(file_path)
    
    # Convert to LangChain documents and inject metadata
    langchain_docs = []
    for doc in documents:
        langchain_docs.append(Document(
            page_content=doc.text,
            metadata={
                "project_id": project_id,
                "source": os.path.basename(file_path)
            }
        ))
        
    return langchain_docs
