import asyncio
import logging
from dotenv import load_dotenv

load_dotenv(".env")
logging.basicConfig(level=logging.INFO)

from services.rag_engine import process_and_store_documents, get_customer_response
from llama_index.core import Document

async def main():
    doc = Document(
        text="# Aviation Part 1\\nThis part needs to be ordered tomorrow.\\n## Detail A\\nThe supplier is Boeing.\\n# Aviation Part 2\\nWill require approval from the procurement lead.",
        metadata={"source": "upload_test.pdf"}
    )
    
    # Simulating the exact payload format passed from old Langchain parser
    class MockDoc:
        def __init__(self, page_content, metadata):
            self.page_content = page_content
            self.metadata = metadata
            
    docs = [MockDoc(doc.text, doc.metadata)]
    
    print("----- PROCESSING -----")
    count = process_and_store_documents(docs, "test_customer")
    print(f"Stored {count} nodes.")
    
    print("----- QUERYING -----")
    resp = await get_customer_response("test_customer", "What is the supplier for Part 1?", use_cache=False)
    
    print("SUCCESS:", resp)


if __name__ == "__main__":
    asyncio.run(main())
