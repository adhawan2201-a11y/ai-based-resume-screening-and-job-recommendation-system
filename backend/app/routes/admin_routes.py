"""Admin routes — system management and analytics."""

from fastapi import APIRouter, Depends, HTTPException, status, Body
from app.auth import get_current_user
from app.database import get_database
from app.models import UserRole, JobCreate
from bson import ObjectId
from typing import List, Optional
from datetime import datetime

router = APIRouter(prefix="/admin", tags=["Admin"])

async def require_admin(current_user: dict = Depends(get_current_user)):
    """Dependency to ensure the user is an admin."""
    user_role = str(current_user.get("role", "")).lower()
    if user_role != "admin":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Access denied. Admin privileges required."
        )
    return current_user




# ─── User Management ──────────────────────────────────────

@router.get("/users")
async def list_users(role: Optional[str] = None, _: dict = Depends(require_admin)):
    """List all users with optional role filtering."""
    db = get_database()
    try:
        query = {}
        if role:
            query["role"] = role
            
        users_cursor = db.users.find(query).sort("created_at", -1)
        users = []
        async for user in users_cursor:
            users.append({
                "id": str(user["_id"]),
                "name": user.get("name", "Unknown"),
                "email": user.get("email", "N/A"),
                "role": user.get("role", "candidate"),
                "created_at": user.get("created_at"),
                "is_blocked": user.get("is_blocked", False)
            })
        return users
    except Exception as e:
        print(f"[Admin Users Error] {str(e)}")
        return []

@router.delete("/users/{user_id}")
async def delete_user(user_id: str, _: dict = Depends(require_admin)):
    """Delete a user and all their related data (cascading)."""
    db = get_database()
    try:
        obj_id = ObjectId(user_id)
    except:
        raise HTTPException(status_code=400, detail="Invalid user ID")
        
    user = await db.users.find_one({"_id": obj_id})
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
        
    # Cascading Deletions
    if user["role"] == UserRole.CANDIDATE:
        await db.resumes.delete_many({"user_id": user_id})
        await db.matches.delete_many({"user_id": user_id})
    elif user["role"] == UserRole.RECRUITER:
        # Delete jobs and their matches
        jobs_cursor = db.jobs.find({"created_by": user_id})
        async for job in jobs_cursor:
            await db.matches.delete_many({"job_id": str(job["_id"])})
        await db.jobs.delete_many({"created_by": user_id})
        
    await db.users.delete_one({"_id": obj_id})
    return {"message": "User and related data deleted successfully"}

@router.patch("/users/{user_id}/block")
async def toggle_user_block(user_id: str, is_blocked: bool = Body(..., embed=True), _: dict = Depends(require_admin)):
    """Block or unblock a user."""
    db = get_database()
    try:
        obj_id = ObjectId(user_id)
    except:
        raise HTTPException(status_code=400, detail="Invalid user ID")
        
    await db.users.update_one({"_id": obj_id}, {"$set": {"is_blocked": is_blocked}})
    return {"message": f"User {'blocked' if is_blocked else 'unblocked'} successfully"}

# ─── Job Management ───────────────────────────────────────

@router.get("/jobs")
async def list_all_jobs(_: dict = Depends(require_admin)):
    """List all job postings with recruiter info."""
    db = get_database()
    try:
        jobs_cursor = db.jobs.find().sort("created_at", -1)
        jobs = []
        async for job in jobs_cursor:
            recruiter = None
            created_by = job.get("created_by", "system")
            try:
                if created_by and created_by != "system":
                    recruiter = await db.users.find_one({"_id": ObjectId(created_by) if isinstance(created_by, str) else created_by})
            except:
                pass
                
            jobs.append({
                "id": str(job["_id"]),
                "title": job.get("title", "Untitled Job"),
                "company": job.get("company", "Unknown Company"),
                "recruiter": {
                    "id": str(created_by),
                    "name": recruiter.get("name") if recruiter else ("System" if created_by == "system" else "Unknown")
                },
                "created_at": job.get("created_at")
            })
        return jobs
    except Exception as e:
        print(f"[Admin Jobs Error] {str(e)}")
        return []

@router.delete("/jobs/{job_id}")
async def delete_job(job_id: str, _: dict = Depends(require_admin)):
    """Delete a job and its related matches."""
    db = get_database()
    try:
        obj_id = ObjectId(job_id)
    except:
        raise HTTPException(status_code=400, detail="Invalid job ID")
        
    await db.matches.delete_many({"job_id": job_id})
    await db.jobs.delete_one({"_id": obj_id})
    return {"message": "Job and related matches deleted successfully"}

# ─── Resume Management ────────────────────────────────────

@router.get("/resumes")
async def list_all_resumes(_: dict = Depends(require_admin)):
    """List all uploaded resumes with parsed data snippets."""
    db = get_database()
    try:
        resumes_cursor = db.resumes.find().sort("uploaded_at", -1)
        resumes = []
        async for res in resumes_cursor:
            user = None
            uid = res.get("user_id")
            try:
                if uid:
                    user = await db.users.find_one({"_id": ObjectId(uid) if isinstance(uid, str) else uid})
            except:
                pass
                
            parsed_data = res.get("parsed_data")
            if not isinstance(parsed_data, dict):
                parsed_data = {}
                
            legacy_skills = parsed_data.get("skills", [])
            tech_skills = parsed_data.get("technical_skills", [])
            soft_skills = parsed_data.get("soft_skills", [])
            
            all_skills = list(set(tech_skills + soft_skills + legacy_skills))

            resumes.append({
                "id": str(res["_id"]),
                "filename": res.get("filename", "unknown_file"),
                "candidate": {
                    "id": str(uid) if uid else "unknown",
                    "name": user.get("name") if user else "Unknown"
                },
                "uploaded_at": res.get("uploaded_at"),
                "skills": all_skills[:5]
            })
        return resumes
    except Exception as e:
        print(f"[Admin Resumes Error] {str(e)}")
        return []

@router.delete("/resumes/{resume_id}")
async def delete_resume(resume_id: str, _: dict = Depends(require_admin)):
    """Delete a resume and its related matches."""
    db = get_database()
    try:
        obj_id = ObjectId(resume_id)
    except:
        raise HTTPException(status_code=400, detail="Invalid resume ID")
        
    await db.matches.delete_many({"resume_id": resume_id})
    await db.resumes.delete_one({"_id": obj_id})
    return {"message": "Resume and related matches deleted successfully"}

# ─── Analytics ────────────────────────────────────────────

@router.get("/analytics")
async def get_analytics(_: dict = Depends(require_admin)):
    """Get detailed match and skill analytics plus system-wide counts."""
    db = get_database()
    
    try:
        # 1. System Counts
        total_users = await db.users.count_documents({})
        total_candidates = await db.users.count_documents({"role": "candidate"})
        total_recruiters = await db.users.count_documents({"role": "recruiter"})
        total_jobs = await db.jobs.count_documents({})
        total_resumes = await db.resumes.count_documents({})
        total_matches = await db.matches.count_documents({})
        
        # 2. Average ATS Score
        avg_pipeline = [{"$group": {"_id": None, "avg_score": {"$avg": "$score_breakdown.total_score"}}}]
        avg_result = await db.matches.aggregate(avg_pipeline).to_list(1)
        avg_score = avg_result[0]["avg_score"] if avg_result else 0
        
        # 3. Top Performing Candidates (Average Score)
        top_candidates_pipeline = [
            {"$group": {"_id": "$user_id", "avg_score": {"$avg": "$score_breakdown.total_score"}}},
            {"$sort": {"avg_score": -1}},
            {"$limit": 5}
        ]
        top_candidates_raw = await db.matches.aggregate(top_candidates_pipeline).to_list(5)
        top_candidates = []
        for tc in top_candidates_raw:
            try:
                cid = tc.get("_id")
                if cid:
                    user = await db.users.find_one({"_id": ObjectId(cid) if isinstance(cid, str) else cid})
                    if user:
                        top_candidates.append({
                            "name": user["name"],
                            "score": tc["avg_score"]
                        })
            except:
                continue
            
        # 4. Most Demanded Skills
        jobs_cursor = db.jobs.find({}, {"skills_required": 1, "soft_skills_required": 1})
        skill_counts = {}
        async for job in jobs_cursor:
            for skill in job.get("skills_required", []):
                s_lower = skill.lower().strip()
                if s_lower:
                    skill_counts[s_lower] = skill_counts.get(s_lower, 0) + 1
            for skill in job.get("soft_skills_required", []):
                s_lower = skill.lower().strip()
                if s_lower:
                    skill_counts[s_lower] = skill_counts.get(s_lower, 0) + 1
        
        sorted_skills = sorted(skill_counts.items(), key=lambda x: x[1], reverse=True)[:10]
        top_skills = [{"skill": k, "count": v} for k, v in sorted_skills]
        
        return {
            "total_users": total_users,
            "total_candidates": total_candidates,
            "total_recruiters": total_recruiters,
            "total_jobs": total_jobs,
            "total_resumes": total_resumes,
            "total_matches": total_matches,
            "avg_ats_score": avg_score,
            "top_candidates": top_candidates,
            "top_skills": top_skills
        }
    except Exception as e:
        print(f"[Admin Analytics Error] {str(e)}")
        # Return a safe empty structure instead of crashing
        return {
            "total_users": 0, "total_candidates": 0, "total_recruiters": 0,
            "total_jobs": 0, "total_resumes": 0, "total_matches": 0,
            "avg_ats_score": 0, "top_candidates": [], "top_skills": []
        }
