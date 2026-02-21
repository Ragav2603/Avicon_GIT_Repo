import os
from typing import List
from langchain_core.documents import Document
from langchain_openai import OpenAIEmbeddings, ChatOpenAI
from langchain_pinecone import PineconeVectorStore
from langchain_text_splitters import MarkdownHeaderTextSplitter
from langchain_core.prompts import ChatPromptTemplate
from langchain_core.runnables import RunnablePassthrough
from langchain_core.output_parsers import StrOutputParser

def get_vectorstore():
    """Initializes the Pinecone Vector Store."""
    embeddings = OpenAIEmbeddings(model="text-embedding-3-small")
    index_name = os.environ.get("PINECONE_INDEX_NAME", "my-ai-agents")
    return PineconeVectorStore(index_name=index_name, embedding=embeddings)

def process_and_store_documents(documents: List[Document], customer_id: str):
    """
    Chunks the incoming LlamaParse markdown documents and pushes them to Pinecone.
    """
    # Use markdown chunking since LlamaParse returns markdown
    headers_to_split_on = [
        ("#", "Header 1"),
        ("##", "Header 2"),
        ("###", "Header 3"),
    ]
    markdown_splitter = MarkdownHeaderTextSplitter(headers_to_split_on=headers_to_split_on)
    
    chunked_docs = []
    for doc in documents:
        # Split each document by markdown headers
        splits = markdown_splitter.split_text(doc.page_content)
        for split in splits:
            # Reattach metadata (customer_id, source) + header metadata
            combined_metadata = {**doc.metadata, **split.metadata}
            chunked_docs.append(Document(page_content=split.page_content, metadata=combined_metadata))
            
    # Initialize VectorStore and insert documents
    if chunked_docs:
        vectorstore = get_vectorstore()
        vectorstore.add_documents(chunked_docs)
        
    return len(chunked_docs)

def format_docs(docs):
    return "\\n\\n".join(doc.page_content for doc in docs)

def get_customer_response(customer_id: str, query: str) -> str:
    """
    Retrieves information strictly for the given customer_id using Pinecone and GPT-4o.
    Uses pure LCEL to bypass broken langchain.chains imports on Azure.
    """
    vectorstore = get_vectorstore()
    
    # SECURE RETRIEVAL: Filter strictly by customer_id
    retriever = vectorstore.as_retriever(
        search_kwargs={
            "filter": {"customer_id": customer_id},
            "k": 5
        }
    )
    
    llm = ChatOpenAI(model="gpt-4o", temperature=0)
    
    # Pure LCEL Chain
    prompt = ChatPromptTemplate.from_template(
        "Answer the following question based only on the provided context:\\n\\n"
        "Context:\\n{context}\\n\\n"
        "Question: {question}\\n"
    )
    
    chain = (
        {"context": retriever | format_docs, "question": RunnablePassthrough()}
        | prompt
        | llm
        | StrOutputParser()
    )
    
    response = chain.invoke(query)
    return response
