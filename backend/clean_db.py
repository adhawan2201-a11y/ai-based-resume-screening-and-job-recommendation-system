import asyncio
from motor.motor_asyncio import AsyncIOMotorClient
import certifi

async def clean():
    client = AsyncIOMotorClient('mongodb://localhost:27017', tlsCAFile=certifi.where())
    db = client.resume_screening
    await db.users.delete_many({})
    await db.jobs.delete_many({})
    print("Cleaned!")

asyncio.run(clean())
