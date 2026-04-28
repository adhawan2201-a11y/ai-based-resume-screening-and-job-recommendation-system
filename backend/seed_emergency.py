import asyncio
from motor.motor_asyncio import AsyncIOMotorClient
from datetime import datetime
from bson import ObjectId
from app.auth import hash_password

async def seed_emergency_data():
    client = AsyncIOMotorClient("mongodb://localhost:27017")
    db = client["resume_screening"]
    
    print("🚀 Starting Emergency Data Seeding...")
    
    # 1. Clear existing
    await db.users.delete_many({"email": "candidate@demo.com"})
    await db.jobs.delete_many({})
    await db.matches.delete_many({})
    
    # 2. Create Sample Candidate User
    user_doc = {
        "name": "Abhishek Dhawan",
        "email": "candidate@demo.com",
        "password": hash_password("demo123"), 
        "role": "candidate",
        "created_at": datetime.utcnow()
    }
    user_result = await db.users.insert_one(user_doc)
    user_id = str(user_result.inserted_id)
    print(f"👤 Created Demo Candidate: {user_id}")
    print(f"🔑 Credentials: candidate@demo.com / demo123")

    # 3. Create Sample Resume
    resume_doc = {
        "user_id": user_id,
        "filename": "demo_resume.pdf",
        "parsed_data": {
            "skills": ["python", "react", "sql", "javascript", "docker"],
            "education": [{"degree": "B.Tech Computer Science"}],
            "total_experience_years": 3.5,
            "summary": "Experienced Full Stack Developer"
        },
        "uploaded_at": datetime.utcnow(),
        "is_latest": True
    }
    resume_result = await db.resumes.insert_one(resume_doc)
    resume_id = str(resume_result.inserted_id)
    print(f"📄 Created Demo Resume: {resume_id}")

    # 4. Create Sample Recruiter Jobs
    jobs = [
        {
            "title": "Senior Frontend Developer",
            "company": "TechStream Solutions",
            "skills_required": ["react", "javascript", "css", "tailwind", "typescript"],
            "experience_level": "senior",
            "min_experience_years": 5,
            "is_active": True,
            "created_at": datetime.utcnow()
        },
        {
            "title": "Full Stack Developer",
            "company": "CloudBridge",
            "skills_required": ["python", "react", "sql", "docker", "javascript"],
            "experience_level": "mid",
            "min_experience_years": 2,
            "is_active": True,
            "created_at": datetime.utcnow()
        }
    ]
    
    job_result = await db.jobs.insert_many(jobs)
    print(f"✅ Inserted {len(job_result.inserted_ids)} active jobs.")
    
    # 5. Generate Matches
    print(f"🔄 Generating matches for Demo Candidate...")
    match_docs = []
    resume_skills = set(resume_doc["parsed_data"]["skills"])
    for j_id, job in zip(job_result.inserted_ids, jobs):
        job_skills = set(job["skills_required"])
        matched = list(resume_skills & job_skills)
        missing = list(job_skills - resume_skills)
        score = (len(matched) / max(len(job_skills), 1)) * 100
        
        match_docs.append({
            "resume_id": resume_id,
            "job_id": str(j_id),
            "user_id": user_id,
            "job_title": job["title"],
            "company": job["company"],
            "score_breakdown": {
                "total_score": round(score),
                "matched_skills": matched,
                "missing_skills": missing
            },
            "calculated_at": datetime.utcnow()
        })
    
    await db.matches.insert_many(match_docs)
    print(f"✅ Generated {len(match_docs)} matches.")
    print("🏁 Seeding Complete. Try logging in now!")

if __name__ == "__main__":
    asyncio.run(seed_emergency_data())

if __name__ == "__main__":
    asyncio.run(seed_emergency_data())
