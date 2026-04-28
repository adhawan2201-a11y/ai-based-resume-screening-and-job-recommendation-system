"""Recruiter routes — manage jobs and view applicants."""

from fastapi import APIRouter, Depends, HTTPException
from bson import ObjectId
from typing import List

from datetime import datetime
from app.database import get_database
from app.auth import get_current_user
from app.models import UserRole, CandidateMatchResult, ScoreBreakdown, MatchExplanation

router = APIRouter(prefix="/recruiter", tags=["Recruiter"])

@router.get("/my-jobs")
async def get_my_posted_jobs(current_user: dict = Depends(get_current_user)):
    """Get all jobs posted by the current recruiter."""
    if current_user.get("role") != UserRole.RECRUITER and current_user.get("role") != UserRole.ADMIN:
        raise HTTPException(status_code=403, detail="Only recruiters can access this resource")
    
    db = get_database()
    jobs = await db.jobs.find({"created_by": str(current_user["_id"])}).to_list(length=100)
    
    # Format jobs for display
    formatted_jobs = []
    for job in jobs:
        formatted_jobs.append({
            "id": str(job["_id"]),
            "title": job["title"],
            "company": job["company"],
            "location": job.get("location", ""),
            "created_at": job.get("created_at"),
            "is_active": job.get("is_active", True)
        })
    
    return {"jobs": formatted_jobs}

@router.get("/job-applicants/{job_id}")
async def get_job_applicants(job_id: str, current_user: dict = Depends(get_current_user)):
    """Get all applicants (matches) for a specific job, ranked by score."""
    if current_user.get("role") != UserRole.RECRUITER and current_user.get("role") != UserRole.ADMIN:
        raise HTTPException(status_code=403, detail="Only recruiters can access this resource")
    
    db = get_database()
    
    # Verify the job belongs to the recruiter
    job = await db.jobs.find_one({"_id": ObjectId(job_id)})
    if not job:
        raise HTTPException(status_code=404, detail="Job not found")
    
    if str(job.get("created_by")) != str(current_user["_id"]) and current_user.get("role") != UserRole.ADMIN:
        raise HTTPException(status_code=403, detail="Access denied to this job's applicants")

    # Find matches for this job
    matches_cursor = db.matches.find({"job_id": job_id}).sort("score_breakdown.total_score", -1)
    
    applicants = []
    async for match in matches_cursor:
        # Get candidate info
        user = await db.users.find_one({"_id": ObjectId(match["user_id"])})
        if user:
            applicants.append({
                "id": str(match["_id"]),
                "candidate_name": user["name"],
                "candidate_email": user["email"],
                "score": match["score_breakdown"]["total_score"],
                "score_breakdown": match["score_breakdown"],
                "explanation": match.get("explanation", {}),
                "calculated_at": match.get("calculated_at")
            })
            
    return {
        "job_title": job["title"],
        "applicants": applicants
    }

@router.get("/analytics")
async def get_recruiter_analytics(current_user: dict = Depends(get_current_user)):
    """Get advanced analytics for the recruiter's postings."""
    if current_user.get("role") != UserRole.RECRUITER and current_user.get("role") != UserRole.ADMIN:
        raise HTTPException(status_code=403, detail="Only recruiters can access this resource")
    
    db = get_database()
    user_id = str(current_user["_id"])
    
    # 1. Basic stats
    total_jobs = await db.jobs.count_documents({"created_by": user_id})
    total_applicants = await db.matches.count_documents({"job_id": {"$in": [str(j["_id"]) for j in await db.jobs.find({"created_by": user_id}).to_list(None)]}})
    
    # 2. Score distribution
    pipeline = [
        {"$match": {"job_id": {"$in": [str(j["_id"]) for j in await db.jobs.find({"created_by": user_id}).to_list(None)]}}},
        {"$group": {
            "_id": None,
            "avg_score": {"$avg": "$score_breakdown.total_score"},
            "max_score": {"$max": "$score_breakdown.total_score"},
            "min_score": {"$min": "$score_breakdown.total_score"}
        }}
    ]
    score_stats = await db.matches.aggregate(pipeline).to_list(1)
    
    # 3. Skills in demand (Top 5)
    jobs = await db.jobs.find({"created_by": user_id}).to_list(None)
    skill_counts = {}
    for job in jobs:
        for skill in job.get("skills_required", []):
            skill_counts[skill] = skill_counts.get(skill, 0) + 1
    
    top_skills = sorted(skill_counts.items(), key=lambda x: x[1], reverse=True)[:5]
    
    return {
        "total_jobs": total_jobs,
        "total_applicants": total_applicants,
        "score_stats": score_stats[0] if score_stats else {"avg_score": 0, "max_score": 0, "min_score": 0},
        "top_skills": [{"skill": s, "count": c} for s, c in top_skills]
    }

@router.patch("/match/{match_id}/status")
async def update_match_status(match_id: str, status: str, current_user: dict = Depends(get_current_user)):
    """Update the application status (shortlisted, rejected, pending)."""
    if current_user.get("role") != UserRole.RECRUITER and current_user.get("role") != UserRole.ADMIN:
        raise HTTPException(status_code=403, detail="Only recruiters can access this resource")
    
    db = get_database()
    
    # Verify the match exists and the job belongs to the recruiter
    match = await db.matches.find_one({"_id": ObjectId(match_id)})
    if not match:
        raise HTTPException(status_code=404, detail="Match not found")
        
    job = await db.jobs.find_one({"_id": ObjectId(match["job_id"])})
    if not job:
        raise HTTPException(status_code=404, detail="Associated job not found")
        
    if str(job.get("created_by")) != str(current_user["_id"]) and current_user.get("role") != UserRole.ADMIN:
        raise HTTPException(status_code=403, detail="Access denied")
        
    await db.matches.update_one(
        {"_id": ObjectId(match_id)},
        {"$set": {"status": status, "updated_at": datetime.utcnow()}}
    )
    
    return {"message": f"Status updated to {status}"}
