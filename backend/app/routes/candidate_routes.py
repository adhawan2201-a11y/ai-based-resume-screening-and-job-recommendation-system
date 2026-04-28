"""Candidate routes — API for fetching comprehensive dashboard data."""

from fastapi import APIRouter, Depends, HTTPException, status
from app.auth import get_current_user
from app.database import get_database
from bson import ObjectId

from app.routes.seed_routes import seed_system_data
from app.ai.scoring import calculate_ats_score
from datetime import datetime

router = APIRouter(prefix="/candidate", tags=["Candidate"])

@router.get("/dashboard")
async def get_dashboard(current_user: dict = Depends(get_current_user)):
    """Fetch all necessary data for the candidate dashboard in a single call."""
    db = get_database()
    user_id = str(current_user["_id"])
    
    # AUTO-SEED: Ensure jobs exist
    job_count = await db.jobs.count_documents({})
    if job_count == 0:
        print("[CandidateDashboard] No jobs found. Auto-seeding...")
        await seed_system_data()
    
    # Fetch the latest resume (strictly sorted by uploaded_at to prevent stale data)
    latest_resume = await db.resumes.find_one(
        {"user_id": user_id, "is_latest": True},
        sort=[("uploaded_at", -1)]
    )
    
    # If no resume explicitly marked as latest, fallback to absolute newest by date
    if not latest_resume:
        latest_resume = await db.resumes.find_one(
            {"user_id": user_id},
            sort=[("uploaded_at", -1)]
        )

    if not latest_resume:
        return {
            "latest_resume": None,
            "skills": [],
            "education": [],
            "experience": 0,
            "matches": []
        }

    # Fetch top precomputed matches for the LATEST resume only
    match_count = await db.matches.count_documents({
        "user_id": user_id, 
        "resume_id": str(latest_resume["_id"])
    })
    
    # PROACTIVE MATCH: If latest resume has no matches, trigger sync for ACTIVE jobs
    if match_count == 0 and latest_resume:
        print(f"[CandidateDashboard] No matches for resume {latest_resume['_id']}. Triggering proactive sync...")
        jobs_cursor = db.jobs.find({"is_active": True})
        match_docs = []
        async for job in jobs_cursor:
            score_result = calculate_ats_score(
                resume_data=latest_resume["parsed_data"],
                resume_embedding=latest_resume.get("embedding", []),
                job_data=job,
            )
            match_docs.append({
                "resume_id": str(latest_resume["_id"]),
                "job_id": str(job["_id"]),
                "user_id": user_id,
                "job_title": job["title"],
                "company": job["company"],
                "score_breakdown": score_result["score_breakdown"],
                "explanation": score_result["explanation"],
                "calculated_at": datetime.utcnow(),
            })
        if match_docs:
            await db.matches.insert_many(match_docs)

    cursor = db.matches.find({
        "user_id": user_id,
        "resume_id": str(latest_resume["_id"])
    }).sort("score_breakdown.total_score", -1).limit(10)
    matches = []
    async for match in cursor:
        job_id = match.get("job_id")
        try:
            job_id_obj = ObjectId(job_id) if isinstance(job_id, str) else job_id
            # Ensure we only show matches for jobs that are STILL active
            job = await db.jobs.find_one({"_id": job_id_obj, "is_active": True})
        except:
            job = None
            
        if job:
            matches.append({
                "job_id": str(job["_id"]),
                "title": job.get("title", ""),
                "company": job.get("company", ""),
                "location": job.get("location", ""),
                "category": job.get("category", "tech"),
                "experience_level": job.get("experience_level", ""),
                "skills_required": job.get("skills_required", []),
                "score_breakdown": match["score_breakdown"],
                "explanation": match.get("explanation", {})
            })

    # Prepare skill gap analysis (using latest resume vs all jobs or top job)
    parsed_data = latest_resume.get("parsed_data", {})
    tech_skills = parsed_data.get("technical_skills", [])
    soft_skills = parsed_data.get("soft_skills", [])
    all_current_skills = set(s.lower() for s in (tech_skills + soft_skills))
    
    # Analyze against top 5 matches
    skills_required_combined = set()
    for m in matches[:5]:
        skills_required_combined.update(s.lower() for s in m.get("skills_required", []))
    
    # Fallback to some defaults if no jobs/matches found
    if not skills_required_combined:
        skills_required_combined = {"python", "javascript", "sql", "git", "docker"}
        
    missing_skills = sorted(list(skills_required_combined - all_current_skills))
    matched_skills = sorted(list(all_current_skills & skills_required_combined))
    
    # Use the smart suggestion engine for the skill gap
    from app.ai.scoring import _generate_smart_suggestions
    smart_suggestions = _generate_smart_suggestions(missing_skills, parsed_data.get("category", "tech"))

    # Prepare final response payload
    return {
        "latest_resume": {
            "id": str(latest_resume["_id"]),
            "filename": latest_resume.get("filename", ""),
            "uploaded_at": latest_resume.get("uploaded_at", ""),
            "is_latest": latest_resume.get("is_latest", True),
            "parsed_data": parsed_data
        },
        "skills": tech_skills,
        "soft_skills": soft_skills,
        "education": parsed_data.get("education", []),
        "experience": parsed_data.get("total_experience_years", 0),
        "matches": matches,
        "skill_gap": {
            "current_skills": sorted(list(all_current_skills)),
            "matched_skills": matched_skills,
            "missing_skills": missing_skills,
            "skill_match_percentage": round(len(matched_skills) / max(len(skills_required_combined), 1) * 100, 1),
            "recommended_learning": smart_suggestions
        }
    }

