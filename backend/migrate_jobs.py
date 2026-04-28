import asyncio
from motor.motor_asyncio import AsyncIOMotorClient
import os
import sys

# Add parent directory to path so we can import app modules
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

async def migrate_jobs():
    print("🚀 Starting Job Schema Migration...")
    
    # Connection details - usually from env but using defaults for script
    mongo_url = "mongodb://localhost:27017"
    db_name = "resume_screening"
    
    client = AsyncIOMotorClient(mongo_url)
    db = client[db_name]
    
    # 1. Fix missing created_by
    print("Checking for jobs missing 'created_by' field...")
    result = await db.jobs.update_many(
        {"created_by": {"$exists": False}},
        {"$set": {"created_by": "system"}}
    )
    print(f"✅ Fixed {result.modified_count} jobs missing 'created_by'.")
    
    # 2. Fix missing source
    print("Checking for jobs missing 'source' field...")
    result = await db.jobs.update_many(
        {"source": {"$exists": False}},
        {"$set": {"source": "api"}}
    )
    print(f"✅ Fixed {result.modified_count} jobs missing 'source'.")
    
    # 3. Ensure skills are lists
    print("Ensuring skills_required is a list...")
    result = await db.jobs.update_many(
        {"skills_required": {"$exists": False}},
        {"$set": {"skills_required": []}}
    )
    print(f"✅ Ensured {result.modified_count} jobs have 'skills_required' list.")

    print("🏁 Migration complete!")
    client.close()

if __name__ == "__main__":
    asyncio.run(migrate_jobs())
