"""Matching & Recommendation routes — score resumes, recommend jobs, skill gap analysis."""

from datetime import datetime
from fastapi import APIRouter, Depends, HTTPException, Query
from bson import ObjectId

from app.database import get_database
from app.auth import get_current_user
from app.ai.scoring import calculate_ats_score
from app.ai.skill_extractor import TECHNICAL_SKILLS

router = APIRouter(prefix="/matching", tags=["Matching & Recommendations"])


@router.post("/score/{job_id}")
async def score_resume_against_job(
    job_id: str,
    current_user: dict = Depends(get_current_user),
):
    """Calculate ATS score for current user's resume against a specific job."""
    db = get_database()

    # Get user's resume
    resume = await db.resumes.find_one(
        {"user_id": str(current_user["_id"])},
        sort=[("uploaded_at", -1)]
    )
    if not resume:
        raise HTTPException(status_code=404, detail="No resume found. Upload a resume first.")

    # Get job
    try:
        job = await db.jobs.find_one({"_id": ObjectId(job_id)})
    except Exception:
        raise HTTPException(status_code=400, detail="Invalid job ID")

    if not job:
        raise HTTPException(status_code=404, detail="Job not found")

    # Calculate score
    result = calculate_ats_score(
        resume_data=resume["parsed_data"],
        resume_embedding=resume.get("embedding", []),
        job_data=job,
    )

    # Store the match result
    match_doc = {
        "resume_id": str(resume["_id"]),
        "job_id": job_id,
        "user_id": str(current_user["_id"]),
        "job_title": job["title"],
        "company": job["company"],
        "score_breakdown": result["score_breakdown"],
        "explanation": result["explanation"],
        "calculated_at": datetime.utcnow(),
    }

    # Upsert (update if exists) — Ensuring one match per (user_id + job_id)
    await db.matches.update_one(
        {"user_id": str(current_user["_id"]), "job_id": job_id},
        {"$set": match_doc},
        upsert=True,
    )

    return {
        "job_id": job_id,
        "job_title": job["title"],
        "company": job["company"],
        "score_breakdown": result["score_breakdown"],
        "explanation": result["explanation"],
    }



@router.get("/recommendations")
async def get_job_recommendations(
    limit: int = Query(5, ge=1, le=50),
    current_user: dict = Depends(get_current_user),
):
    """Get top recommended jobs for the current candidate with robust fallback."""
    db = get_database()
    user_id = str(current_user["_id"])
    print(f"[Debug] Recommendations fetched for User: {user_id} with limit: {limit}")

    # 1. Try to get precomputed matches for active jobs
    cursor = db.matches.find({"user_id": user_id}).sort("score_breakdown.total_score", -1)
    scored_jobs = []
    seen_job_ids = set()
    
    async for match in cursor:
        job_id = str(match["job_id"])
        if job_id in seen_job_ids: continue
        if len(scored_jobs) >= limit: break
        
        # Ensure job is active
        job = await db.jobs.find_one({"_id": ObjectId(job_id), "is_active": True})
        if job:
            seen_job_ids.add(job_id)
            scored_jobs.append({
                "job_id": job_id,
                "title": job["title"],
                "company": job["company"],
                "category": job.get("category", "tech"),
                "score": match["score_breakdown"]["total_score"],
                "matched_skills": match.get("explanation", {}).get("matched_skills", []),
                "missing_skills": match.get("explanation", {}).get("missing_skills", []),
                "matched_soft_skills": match.get("explanation", {}).get("matched_soft_skills", []),
                "missing_soft_skills": match.get("explanation", {}).get("missing_soft_skills", []),
                "explanation": match.get("explanation", {}),
                "description": job.get("description", "")
            })

    # 2. Fallback: On-the-fly matching for active jobs
    if len(scored_jobs) < limit:
        resume = await db.resumes.find_one({"user_id": user_id}, sort=[("uploaded_at", -1)])
        if resume:
            jobs_cursor = db.jobs.find({
                "is_active": True,
                "_id": {"$nin": [ObjectId(jid) for jid in seen_job_ids]}
            }).sort("created_at", -1).limit(15)
            
            async for job in jobs_cursor:
                if len(scored_jobs) >= limit: break
                
                score_result = calculate_ats_score(
                    resume_data=resume["parsed_data"],
                    resume_embedding=resume.get("embedding", []),
                    job_data=job,
                )
                
                scored_jobs.append({
                    "job_id": str(job["_id"]),
                    "title": job["title"],
                    "company": job["company"],
                    "category": job.get("category", "tech"),
                    "score": score_result["score_breakdown"]["total_score"],
                    "matched_skills": score_result["explanation"]["matched_skills"],
                    "missing_skills": score_result["explanation"]["missing_skills"],
                    "matched_soft_skills": score_result["explanation"]["matched_soft_skills"],
                    "missing_soft_skills": score_result["explanation"]["missing_soft_skills"],
                    "explanation": score_result["explanation"],
                    "description": job.get("description", "")
                })
                seen_job_ids.add(str(job["_id"]))
            
            scored_jobs.sort(key=lambda x: x["score"], reverse=True)

    # 3. Last Resort: Latest Active Jobs
    if len(scored_jobs) < limit:
        jobs_cursor = db.jobs.find({
            "is_active": True,
            "_id": {"$nin": [ObjectId(jid) for jid in seen_job_ids]}
        }).sort("created_at", -1).limit(limit - len(scored_jobs))
        
        async for job in jobs_cursor:
            scored_jobs.append({
                "job_id": str(job["_id"]),
                "title": job["title"],
                "company": job["company"],
                "category": job.get("category", "tech"),
                "score": 0,
                "matched_skills": [],
                "missing_skills": job.get("skills_required", []),
                "description": job.get("description", "")
            })

    return {"recommendations": scored_jobs}



@router.get("/skill-gap")
async def get_skill_gap_analysis(
    target_role: str = Query(None, description="Target job title to analyze against"),
    current_user: dict = Depends(get_current_user),
):
    """Analyze skill gaps for the candidate against target roles or top jobs."""
    db = get_database()

    # Get user's resume
    resume = await db.resumes.find_one(
        {"user_id": str(current_user["_id"])},
        sort=[("uploaded_at", -1)]
    )
    if not resume:
        raise HTTPException(status_code=404, detail="No resume found. Upload a resume first.")

    parsed_data = resume.get("parsed_data", {})
    tech_skills = parsed_data.get("technical_skills", [])
    soft_skills = parsed_data.get("soft_skills", [])
    all_current_skills = set(s.lower() for s in (tech_skills + soft_skills))

    # Find relevant jobs
    query = {"is_active": True}
    if target_role:
        query["title"] = {"$regex": target_role, "$options": "i"}

    jobs_cursor = db.jobs.find(query).limit(10)
    skills_required_combined = set()
    job_titles = []

    async for job in jobs_cursor:
        skills_required_combined.update(s.lower() for s in job.get("skills_required", []))
        job_titles.append(job["title"])

    if not skills_required_combined:
        # Default to common skills for the target role
        skills_required_combined = _get_default_skills_for_role(target_role or "software engineer")

    missing_skills = sorted(list(skills_required_combined - all_current_skills))
    matched_skills = sorted(list(all_current_skills & skills_required_combined))

    # Generate improvement areas
    improvement_areas = []
    skill_categories = _categorize_skills(missing_skills)
    for category, skills in skill_categories.items():
        if skills:
            improvement_areas.append({
                "category": category,
                "skills": skills,
                "priority": "high" if len(skills) > 2 else "medium",
            })

    # Use the smart suggestion engine
    from app.ai.scoring import _generate_smart_suggestions
    smart_suggestions = _generate_smart_suggestions(missing_skills, parsed_data.get("category", "tech"))

    return {
        "current_skills": sorted(list(all_current_skills)),
        "target_role": target_role or "General (based on available jobs)",
        "analyzed_jobs": job_titles,
        "matched_skills": matched_skills,
        "missing_skills": missing_skills,
        "skill_match_percentage": round(
            len(matched_skills) / max(len(skills_required_combined), 1) * 100, 1
        ),
        "improvement_areas": improvement_areas,
        "recommended_learning": smart_suggestions,
    }



@router.get("/my-scores")
async def get_my_match_scores(current_user: dict = Depends(get_current_user)):
    """Get all match scores for the current user."""
    db = get_database()

    cursor = db.matches.find(
        {"user_id": str(current_user["_id"])}
    ).sort("calculated_at", -1)

    scores = []
    async for match in cursor:
        scores.append({
            "id": str(match["_id"]),
            "job_id": match["job_id"],
            "job_title": match.get("job_title", ""),
            "company": match.get("company", ""),
            "score_breakdown": match["score_breakdown"],
            "explanation": match["explanation"],
            "calculated_at": match["calculated_at"].isoformat(),
        })

    return {"scores": scores}


def _get_default_skills_for_role(role: str) -> set:
    """Get common skills for a target role."""
    role_skills = {
        "software engineer": {"python", "java", "javascript", "git", "sql", "docker", "rest api", "linux"},
        "frontend developer": {"javascript", "react", "html", "css", "typescript", "git", "tailwind", "redux"},
        "backend developer": {"python", "java", "nodejs", "sql", "mongodb", "docker", "rest api", "git"},
        "data scientist": {"python", "machine learning", "sql", "pandas", "numpy", "tensorflow", "statistics"},
        "devops engineer": {"docker", "kubernetes", "aws", "linux", "ci/cd", "terraform", "ansible", "git"},
        "full stack developer": {"javascript", "react", "nodejs", "python", "sql", "mongodb", "git", "docker"},
        "mobile developer": {"flutter", "react native", "android", "ios", "dart", "swift", "kotlin"},
    }

    role_lower = role.lower()
    for key, skills in role_skills.items():
        if key in role_lower or role_lower in key:
            return skills

    return {"python", "javascript", "sql", "git", "docker"}


def _categorize_skills(skills: list) -> dict:
    """Categorize skills into groups."""
    categories = {
        "Programming Languages": [],
        "Frameworks & Libraries": [],
        "Databases": [],
        "Cloud & DevOps": [],
        "AI & Data Science": [],
        "Other": [],
    }

    lang = {"python", "java", "javascript", "typescript", "c++", "c#", "go", "rust", "ruby", "php", "swift", "kotlin", "r", "dart"}
    frameworks = {"react", "angular", "vue", "django", "flask", "fastapi", "spring", "express", "nextjs", "nodejs", "flutter", "rails", "tailwind"}
    databases = {"sql", "mysql", "postgresql", "mongodb", "redis", "elasticsearch", "firebase", "dynamodb", "cassandra"}
    cloud = {"aws", "azure", "gcp", "docker", "kubernetes", "terraform", "ci/cd", "jenkins", "linux", "nginx"}
    ai_ds = {"machine learning", "deep learning", "tensorflow", "pytorch", "pandas", "numpy", "scikit-learn", "nlp", "computer vision", "statistics", "data analysis"}

    for skill in skills:
        sl = skill.lower()
        if sl in lang:
            categories["Programming Languages"].append(skill)
        elif sl in frameworks:
            categories["Frameworks & Libraries"].append(skill)
        elif sl in databases:
            categories["Databases"].append(skill)
        elif sl in cloud:
            categories["Cloud & DevOps"].append(skill)
        elif sl in ai_ds:
            categories["AI & Data Science"].append(skill)
        else:
            categories["Other"].append(skill)

    return {k: v for k, v in categories.items() if v}


def _generate_learning_recommendations(missing_skills: list) -> list:
    """Generate learning resource recommendations."""
    recs = []
    for skill in missing_skills[:6]:
        recs.append(
            f"Learn {skill} — Search for '{skill} tutorial' on platforms like "
            "Coursera, Udemy, or YouTube for structured learning paths."
        )
    return recs
