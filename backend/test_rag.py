import asyncio
from dotenv import load_dotenv
load_dotenv()
from services.rag_engine import get_customer_response

async def main():
    try:
        response = await get_customer_response("dev-sandbox", "hello", False)
        print("SUCCESS:", response)
    except Exception as e:
        print("ERROR:", e)

if __name__ == "__main__":
    asyncio.run(main())
