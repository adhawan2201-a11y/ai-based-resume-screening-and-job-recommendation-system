"""Job routes — CRUD for job postings + candidate matching."""

from datetime import datetime
from typing import Optional
from fastapi import APIRouter, Depends, HTTPException, status, Query
from bson import ObjectId

from app.database import get_database
from app.auth import get_current_user
from app.models import JobCreate
from app.ai.skill_extractor import extract_skills_from_job, detect_category
from app.ai.embedding import generate_embedding
from app.ai.scoring import calculate_ats_score

router = APIRouter(prefix="/jobs", tags=["Jobs"])


@router.post("/", status_code=201)
async def create_job(
    job_data: JobCreate,
    current_user: dict = Depends(get_current_user),
):
    """Create a new job posting (recruiter only)."""
    if current_user.get("role") != "recruiter":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Only recruiters can post jobs"
        )

    db = get_database()

    # Auto-extract skills from description if not provided
    skills_dict = extract_skills_from_job(job_data.description)
    
    # Merge provided with extracted
    req_tech = list(set([s.lower() for s in job_data.skills_required] + skills_dict["technical_skills"]))
    req_soft = list(set([s.lower() for s in job_data.soft_skills_required] + skills_dict["soft_skills"]))
    
    # Auto-detect category if not manually provided or if it's default 'tech'
    detected_cat = detect_category(job_data.description, skills_dict)
    category = job_data.category if job_data.category != "tech" else detected_cat

    # Generate embedding from job description
    embedding = generate_embedding(
        f"{job_data.title} {job_data.description} {' '.join(req_tech)} {' '.join(req_soft)}"
    )

    job_doc = {
        "created_by": str(current_user["_id"]),
        "title": job_data.title,
        "company": job_data.company,
        "description": job_data.description,
        "skills_required": req_tech,
        "soft_skills_required": req_soft,
        "category": category,
        "experience_level": job_data.experience_level.value,
        "min_experience_years": job_data.min_experience_years,
        "location": job_data.location,
        "salary_range": job_data.salary_range,
        "job_type": job_data.job_type,
        "embedding": embedding,
        "created_at": datetime.utcnow(),
        "is_active": True,
    }

    result = await db.jobs.insert_one(job_doc)
    job_id_str = str(result.inserted_id)
    print(f"[Debug] Job created successfully: {job_id_str} | Category: {category}")

    # AUTO-SYNC: Calculate scores for all LATEST resumes against this new job
    resumes_cursor = db.resumes.find({"is_latest": True})
    match_docs = []
    async for resume in resumes_cursor:
        score_result = calculate_ats_score(
            resume_data=resume["parsed_data"],
            resume_embedding=resume.get("embedding", []),
            job_data=job_doc,
        )
        match_docs.append({
            "resume_id": str(resume["_id"]),
            "job_id": job_id_str,
            "user_id": resume["user_id"],
            "job_title": job_doc["title"],
            "company": job_doc["company"],
            "score_breakdown": score_result["score_breakdown"],
            "explanation": score_result["explanation"],
            "calculated_at": datetime.utcnow(),
        })

    if match_docs:
        await db.matches.insert_many(match_docs)

    return {
        "id": job_id_str,
        "title": job_data.title,
        "company": job_data.company,
        "category": category,
        "message": "Job posted successfully!",
    }



@router.get("/")
async def list_jobs(
    skip: int = Query(0, ge=0),
    limit: int = Query(20, ge=1, le=100),
    search: Optional[str] = None,
    experience_level: Optional[str] = None,
):
    """List all job postings with optional filters."""
    db = get_database()

    query = {"is_active": True}
    if search:
        query["$and"] = [
            {"is_active": True},
            {"$or": [
                {"title": {"$regex": search, "$options": "i"}},
                {"company": {"$regex": search, "$options": "i"}},
                {"skills_required": {"$regex": search, "$options": "i"}},
            ]}
        ]
    if experience_level:
        query["experience_level"] = experience_level

    cursor = db.jobs.find(query).sort("created_at", -1).skip(skip).limit(limit)
    total = await db.jobs.count_documents(query)

    jobs = []
    async for job in cursor:
        jobs.append({
            "id": str(job["_id"]),
            "created_by": job.get("created_by", ""),
            "title": job.get("title", ""),
            "company": job.get("company", ""),
            "description": job.get("description", "")[:300] + "..." if len(job.get("description", "")) > 300 else job.get("description", ""),
            "skills_required": job.get("skills_required", []),
            "preferred_skills": job.get("preferred_skills", []),
            "experience_level": job.get("experience_level", ""),
            "min_experience_years": job.get("min_experience_years", 0),
            "location": job.get("location", ""),
            "salary_range": job.get("salary_range", ""),
            "job_type": job.get("job_type", "full-time"),
            "created_at": job["created_at"].isoformat(),
        })

    return {"jobs": jobs, "total": total}


@router.get("/{job_id}")
async def get_job(job_id: str):
    """Get a specific job by ID."""
    db = get_database()
    try:
        job = await db.jobs.find_one({"_id": ObjectId(job_id)})
    except Exception:
        raise HTTPException(status_code=400, detail="Invalid job ID")

    if not job:
        raise HTTPException(status_code=404, detail="Job not found")

    return {
        "id": str(job["_id"]),
        "created_by": job["created_by"],
        "title": job["title"],
        "company": job["company"],
        "description": job["description"],
        "skills_required": job.get("skills_required", []),
        "preferred_skills": job.get("preferred_skills", []),
        "experience_level": job.get("experience_level", ""),
        "min_experience_years": job.get("min_experience_years", 0),
        "location": job.get("location", ""),
        "salary_range": job.get("salary_range", ""),
        "job_type": job.get("job_type", "full-time"),
        "created_at": job["created_at"].isoformat(),
    }


@router.delete("/{job_id}")
async def delete_job(
    job_id: str,
    current_user: dict = Depends(get_current_user),
):
    """Delete a job posting (owner only)."""
    db = get_database()
    try:
        job = await db.jobs.find_one({"_id": ObjectId(job_id)})
    except Exception:
        raise HTTPException(status_code=400, detail="Invalid job ID")

    if not job:
        raise HTTPException(status_code=404, detail="Job not found")

    if job["created_by"] != str(current_user["_id"]):
        raise HTTPException(status_code=403, detail="Not authorized to delete this job")

    await db.jobs.delete_one({"_id": ObjectId(job_id)})
    await db.matches.delete_many({"job_id": job_id})

    return {"message": "Job deleted successfully"}


@router.get("/my/postings")
async def get_my_jobs(current_user: dict = Depends(get_current_user)):
    """Get all jobs posted by the current recruiter."""
    if current_user.get("role") != "recruiter":
        raise HTTPException(status_code=403, detail="Only recruiters can view their postings")

    db = get_database()
    cursor = db.jobs.find(
        {"created_by": str(current_user["_id"])}
    ).sort("created_at", -1)

    jobs = []
    async for job in cursor:
        # Count matched candidates
        match_count = await db.matches.count_documents({"job_id": str(job["_id"])})
        jobs.append({
            "id": str(job["_id"]),
            "title": job["title"],
            "company": job["company"],
            "skills_required": job.get("skills_required", []),
            "experience_level": job.get("experience_level", ""),
            "location": job.get("location", ""),
            "created_at": job["created_at"].isoformat(),
            "candidate_count": match_count,
        })

    return {"jobs": jobs}


@router.get("/{job_id}/candidates")
async def get_job_candidates(
    job_id: str,
    min_score: float = Query(0, ge=0, le=100),
    current_user: dict = Depends(get_current_user),
):
    """Get all matched candidates for a job, sorted by score."""
    if current_user.get("role") != "recruiter":
        raise HTTPException(status_code=403, detail="Only recruiters can view candidates")

    db = get_database()

    # Get the job
    try:
        job = await db.jobs.find_one({"_id": ObjectId(job_id)})
    except Exception:
        raise HTTPException(status_code=400, detail="Invalid job ID")

    if not job:
        raise HTTPException(status_code=404, detail="Job not found")

    # Get precomputed matches for this job
    cursor = db.matches.find({"job_id": job_id}).sort("score_breakdown.total_score", -1)
    candidates = []
    
    async for match in cursor:
        total_score = match["score_breakdown"]["total_score"]
        if total_score >= min_score:
            user = await db.users.find_one({"_id": ObjectId(match["user_id"])})
            user_name = user["name"] if user else "Unknown"
            user_email = user["email"] if user else ""
            
            # Fetch resume to get skills and experience
            resume = await db.resumes.find_one({"_id": ObjectId(match["resume_id"])})
            skills = []
            if resume:
                tech = resume["parsed_data"].get("technical_skills", [])
                soft = resume["parsed_data"].get("soft_skills", [])
                skills = tech + soft
                
            exp = resume["parsed_data"].get("total_experience_years", 0) if resume else 0

            candidates.append({
                "resume_id": match["resume_id"],
                "candidate_name": user_name,
                "candidate_email": user_email,
                "score_breakdown": match["score_breakdown"],
                "explanation": match["explanation"],
                "skills": skills[:15],
                "experience_years": exp,
            })


    return {"job_title": job["title"], "candidates": candidates}
