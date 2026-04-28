"""Resume routes — upload, parse, list, get."""

import os
import uuid
from datetime import datetime
from fastapi import APIRouter, UploadFile, File, Depends, HTTPException, status
from bson import ObjectId

from app.database import get_database
from app.auth import get_current_user
from app.config import get_settings
from app.ai.resume_parser import (
    extract_text,
    extract_contact_info,
    extract_experience_years,
    extract_education,
)
from app.ai.skill_extractor import extract_skills, detect_category
from app.ai.embedding import generate_embedding
from app.ai.scoring import calculate_ats_score
from app.routes.seed_routes import seed_system_data

settings = get_settings()
router = APIRouter(prefix="/resumes", tags=["Resumes"])


@router.post("/upload")
async def upload_resume(
    file: UploadFile = File(...),
    current_user: dict = Depends(get_current_user),
):
    """Upload and parse a resume file (PDF, DOC, DOCX, TXT)."""
    # Validate file type
    allowed_extensions = {".pdf", ".doc", ".docx", ".txt"}
    ext = os.path.splitext(file.filename)[1].lower()
    if ext not in allowed_extensions:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"File type '{ext}' not supported. Use: {', '.join(allowed_extensions)}"
        )

    # Validate file size
    content = await file.read()
    if len(content) > settings.MAX_FILE_SIZE:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="File too large. Maximum size is 10 MB."
        )

    # Save file to disk
    os.makedirs(settings.UPLOAD_DIR, exist_ok=True)
    unique_name = f"{uuid.uuid4().hex}{ext}"
    file_path = os.path.join(settings.UPLOAD_DIR, unique_name)

    with open(file_path, "wb") as f:
        f.write(content)

    try:
        # 1. Extract text
        raw_text = extract_text(file_path)
        if not raw_text or len(raw_text.strip()) < 20:
            raise ValueError("Could not extract meaningful text from the file.")

        # 2. Extract structured information
        skills_dict = extract_skills(raw_text)
        technical_skills = skills_dict["technical_skills"]
        soft_skills = skills_dict["soft_skills"]
        all_skills = skills_dict["all_skills"]
        
        education_data = extract_education(raw_text)
        education = education_data["education"]
        highest_education = education_data["highest_education"]
        education_category = education_data["education_category"]
        
        experience_years = extract_experience_years(raw_text)
        contact_info = extract_contact_info(raw_text)
        
        # Determine overall category
        category = detect_category(raw_text, skills_dict)

        # 3. Generate BERT embedding
        embedding = generate_embedding(raw_text)

        # 4. Build resume summary
        summary_parts = []
        if all_skills:
            summary_parts.append(f"Skills: {', '.join(all_skills[:10])}")
        if education:
            degrees = [e.get("degree", "") for e in education]
            summary_parts.append(f"Education: {', '.join(degrees)}")
        if experience_years > 0:
            summary_parts.append(f"Experience: {experience_years:.1f} years")
        summary = ". ".join(summary_parts) if summary_parts else "Resume uploaded successfully."

        # 5. Store in MongoDB
        db = get_database()
        resume_doc = {
            "user_id": str(current_user["_id"]),
            "filename": file.filename,
            "stored_filename": unique_name,
            "parsed_data": {
                "raw_text": raw_text,
                "technical_skills": technical_skills,
                "soft_skills": soft_skills,
                "education": education,
                "highest_education": highest_education,
                "experience": [],
                "total_experience_years": experience_years,
                "contact_info": contact_info,
                "summary": summary,
                "category": category,
            },
            "embedding": embedding,
            "uploaded_at": datetime.utcnow(),
            "is_latest": True,
        }

        # Fallback for empty skills (Aggressive scan)
        if not technical_skills and not soft_skills:
            print("⚠️ Aggressive Fallback: No skills detected. Re-scanning text...")
            # This is already handled by our improved extract_skills, 
            # but we can add more logic here if needed.

        # Set previous resumes to is_latest = False
        await db.resumes.update_many(
            {"user_id": str(current_user["_id"])},
            {"$set": {"is_latest": False}}
        )
        result = await db.resumes.insert_one(resume_doc)
        resume_id_str = str(result.inserted_id)

        # AUTO-SYNC: Ensure jobs exist, then calculate scores
        job_count = await db.jobs.count_documents({})
        if job_count == 0:
            print("[ResumeUpload] No jobs found. Auto-seeding...")
            await seed_system_data()
            
        jobs_cursor = db.jobs.find({"is_active": True})
        match_docs = []
        print(f"[Debug] Matching Engine Started for Resume: {resume_id_str}")
        async for job in jobs_cursor:
            score_result = calculate_ats_score(
                resume_data=resume_doc["parsed_data"],
                resume_embedding=embedding,
                job_data=job,
            )
            match_docs.append({
                "resume_id": resume_id_str,
                "job_id": str(job["_id"]),
                "user_id": str(current_user["_id"]),
                "job_title": job["title"],
                "company": job["company"],
                "score_breakdown": score_result["score_breakdown"],
                "explanation": score_result["explanation"],
                "calculated_at": datetime.utcnow(),
            })

        if match_docs:
            # Clear all existing matches for this user to ensure uniqueness and "one match per user_id + job_id"
            await db.matches.delete_many({"user_id": str(current_user["_id"])})
            await db.matches.insert_many(match_docs)

        return {
            "id": str(result.inserted_id),
            "filename": file.filename,
            "parsed_data": {
                "technical_skills": technical_skills,
                "soft_skills": soft_skills,
                "education": education,
                "total_experience_years": experience_years,
                "contact_info": contact_info,
                "summary": summary,
                "category": category,
            },
            "message": "Resume uploaded and parsed successfully!",
        }


    except Exception as e:
        # Clean up file on error
        if os.path.exists(file_path):
            os.remove(file_path)
        print(f"Error processing resume: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error processing resume: {str(e)}"
        )


@router.get("/my-resume")
async def get_my_resume(current_user: dict = Depends(get_current_user)):
    """Get the current user's latest resume."""
    db = get_database()
    resume = await db.resumes.find_one(
        {"user_id": str(current_user["_id"])},
        sort=[("uploaded_at", -1)]
    )

    if not resume:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="No resume found. Please upload a resume first."
        )

    parsed = resume.get("parsed_data", {})
    return {
        "id": str(resume["_id"]),
        "user_id": resume["user_id"],
        "filename": resume["filename"],
        "parsed_data": {
            "technical_skills": parsed.get("technical_skills", []),
            "soft_skills": parsed.get("soft_skills", []),
            "education": parsed.get("education", []),
            "total_experience_years": parsed.get("total_experience_years", 0),
            "contact_info": parsed.get("contact_info", {}),
            "summary": parsed.get("summary", ""),
            "category": parsed.get("category", "tech")
        },
        "uploaded_at": resume["uploaded_at"].isoformat(),
    }


@router.get("/{resume_id}")
async def get_resume(resume_id: str, current_user: dict = Depends(get_current_user)):
    """Get a specific resume by ID."""
    db = get_database()
    try:
        resume = await db.resumes.find_one({"_id": ObjectId(resume_id)})
    except Exception:
        raise HTTPException(status_code=400, detail="Invalid resume ID")

    if not resume:
        raise HTTPException(status_code=404, detail="Resume not found")

    # Only allow owner or recruiters to view
    if (str(resume["user_id"]) != str(current_user["_id"])
            and current_user.get("role") != "recruiter"):
        raise HTTPException(status_code=403, detail="Access denied")

    parsed = resume.get("parsed_data", {})
    return {
        "id": str(resume["_id"]),
        "user_id": resume["user_id"],
        "filename": resume["filename"],
        "parsed_data": {
            "technical_skills": parsed.get("technical_skills", []),
            "soft_skills": parsed.get("soft_skills", []),
            "education": parsed.get("education", []),
            "total_experience_years": parsed.get("total_experience_years", 0),
            "contact_info": parsed.get("contact_info", {}),
            "summary": parsed.get("summary", ""),
            "category": parsed.get("category", "tech")
        },
        "uploaded_at": resume["uploaded_at"].isoformat(),
    }

