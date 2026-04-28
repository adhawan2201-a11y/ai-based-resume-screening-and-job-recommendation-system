"""MongoDB connection manager using Motor (async driver)."""

import ssl
from motor.motor_asyncio import AsyncIOMotorClient, AsyncIOMotorDatabase
from app.config import get_settings

settings = get_settings()

client: AsyncIOMotorClient = None
db: AsyncIOMotorDatabase = None


async def connect_to_mongo():
    """Create MongoDB connection on application startup."""
    global client, db
    # tlsInsecure bypasses strict TLS verification — needed for Python 3.13 + Atlas
    client = AsyncIOMotorClient(
        settings.MONGODB_URL,
        tlsInsecure=True,
    )
    db = client[settings.DATABASE_NAME]

    # Create indexes for performance
    await db.users.create_index("email", unique=True)
    await db.resumes.create_index("user_id")
    await db.jobs.create_index("created_by")
    await db.matches.create_index([("resume_id", 1), ("job_id", 1)])

    print(f"✅ Connected to MongoDB: {settings.DATABASE_NAME}")


async def close_mongo_connection():
    """Close MongoDB connection on application shutdown."""
    global client
    if client:
        client.close()
        print("❌ MongoDB connection closed")


def get_database() -> AsyncIOMotorDatabase:
    """Return the database instance."""
    return db
