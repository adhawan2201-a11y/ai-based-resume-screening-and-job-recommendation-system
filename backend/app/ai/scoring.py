"""
ATS Scoring Module
- Weighted scoring: Skills (40%), Experience (25%), Semantic (20%), Education (15%)
- Provides detailed score breakdown and explainable AI output
"""

from typing import List, Dict
from app.ai.embedding import calculate_cosine_similarity


# ─── Weight Configuration ─────────────────────────────────

WEIGHTS = {
    "skills": 0.50,
    "semantic": 0.20,
    "experience": 0.20,
    "education": 0.10,
}

# Education level hierarchy for scoring
EDUCATION_HIERARCHY = {
    "phd": 5,
    "doctorate": 5,
    "master's": 4,
    "mba": 4,
    "m.tech": 4,
    "m.com": 4,
    "mca": 4,
    "m.sc": 4,
    "bachelor's": 3,
    "b.tech": 3,
    "b.e.": 3,
    "bba": 3,
    "b.com": 3,
    "bca": 3,
    "b.sc": 3,
    "ba": 3,
    "diploma": 2,
    "high school": 1,
}


def calculate_skills_score(
    resume_tech: List[str], 
    resume_soft: List[str], 
    job_tech: List[str], 
    job_soft: List[str],
    role_category: str = "tech"
) -> dict:
    """Calculate tech and soft skill match scores."""
    
    # 1. Tech Skills
    tech_set = {s.lower() for s in resume_tech}
    req_tech_set = {s.lower() for s in job_tech}
    matched_tech = tech_set & req_tech_set
    missing_tech = req_tech_set - tech_set
    
    tech_score = (len(matched_tech) / len(req_tech_set)) * 100 if req_tech_set else 80.0
    
    # 2. Soft Skills
    soft_set = {s.lower() for s in resume_soft}
    req_soft_set = {s.lower() for s in job_soft}
    
    # Fallback: if no soft skills required, look for common ones
    if not req_soft_set:
        req_soft_set = {"communication", "leadership", "teamwork", "problem solving"}
        
    matched_soft = soft_set & req_soft_set
    missing_soft = req_soft_set - soft_set
    
    soft_score = (len(matched_soft) / len(req_soft_set)) * 100 if req_soft_set else 80.0
    
    # Weighted skill score based on category
    if role_category == "tech":
        final_skill_score = (tech_score * 0.7) + (soft_score * 0.3)
    else:
        final_skill_score = (tech_score * 0.4) + (soft_score * 0.6)
        
    return {
        "score": round(final_skill_score, 2),
        "matched_tech": sorted(list(matched_tech)),
        "missing_tech": sorted(list(missing_tech)),
        "matched_soft": sorted(list(matched_soft)),
        "missing_soft": sorted(list(missing_soft)),
    }


def calculate_experience_score(candidate_years: float, required_years: float) -> dict:
    """Calculate experience score (0-100)."""
    if required_years <= 0:
        return {"score": 85.0, "analysis": "Experience matches the level."}

    if candidate_years >= required_years:
        bonus = min((candidate_years - required_years) * 5, 15)
        score = min(100.0, 85.0 + bonus)
        analysis = f"Excellent: {candidate_years} years exp (Required: {required_years})"
    else:
        ratio = candidate_years / required_years
        score = ratio * 80
        analysis = f"Lacks experience: {candidate_years}/{required_years} years"

    return {"score": round(score, 2), "analysis": analysis}


def calculate_semantic_score(resume_embedding: List[float], job_embedding: List[float]) -> dict:
    """Calculate semantic similarity score (0-100)."""
    if not resume_embedding or not job_embedding:
        return {"score": 50.0}
    similarity = calculate_cosine_similarity(resume_embedding, job_embedding)
    return {"score": round(similarity * 100, 2)}


def calculate_education_score(candidate_education: List[dict], required_level: str = "bachelor's") -> dict:
    """Calculate education score based on hierarchy."""
    if not candidate_education: return {"score": 30.0, "analysis": "Missing info"}
    
    max_level = 0
    highest_degree = "Unknown"
    for edu in candidate_education:
        degree = edu.get("degree", "").lower()
        for key, level in EDUCATION_HIERARCHY.items():
            if key in degree:
                if level > max_level:
                    max_level = level
                    highest_degree = edu.get("degree", degree)
                break
                
    req_level_num = EDUCATION_HIERARCHY.get(required_level.lower(), 3)
    if max_level >= req_level_num:
        score = 80 + min((max_level - req_level_num) * 10, 20)
    else:
        score = (max_level / req_level_num) * 70
        
    return {"score": round(score, 2), "analysis": f"Highest: {highest_degree}"}


def calculate_ats_score(
    resume_data: dict, # parsed_data
    resume_embedding: List[float],
    job_data: dict, # job doc
) -> dict:
    """Calculate the final weighted ATS score with non-tech support."""
    
    # 1. Skills
    skills_result = calculate_skills_score(
        resume_tech=resume_data.get("technical_skills", []),
        resume_soft=resume_data.get("soft_skills", []),
        job_tech=job_data.get("skills_required", []),
        job_soft=job_data.get("soft_skills_required", []),
        role_category=job_data.get("category", "tech")
    )
    
    # 2. Experience
    exp_result = calculate_experience_score(
        candidate_years=resume_data.get("total_experience_years", 0),
        required_years=job_data.get("min_experience_years", 0)
    )
    
    # 3. Semantic
    semantic_result = calculate_semantic_score(resume_embedding, job_data.get("embedding", []))
    
    # 4. Education
    edu_level_map = {"entry": "bachelor's", "mid": "bachelor's", "senior": "master's"}
    expected_edu = edu_level_map.get(job_data.get("experience_level", "mid"), "bachelor's")
    edu_result = calculate_education_score(resume_data.get("education", []), expected_edu)
    
    # Total
    total_score = (
        skills_result["score"] * WEIGHTS["skills"]
        + semantic_result["score"] * WEIGHTS["semantic"]
        + exp_result["score"] * WEIGHTS["experience"]
        + edu_result["score"] * WEIGHTS["education"]
    )
    
    suggestions = _generate_smart_suggestions(
        skills_result["missing_tech"], 
        skills_result["missing_soft"]
    )

    return {
        "score_breakdown": {
            "skills_score": skills_result["score"],
            "experience_score": exp_result["score"],
            "semantic_score": semantic_result["score"],
            "education_score": edu_result["score"],
            "total_score": round(total_score, 2),
        },
        "explanation": {
            "matched_skills": skills_result["matched_tech"],
            "missing_skills": skills_result["missing_tech"],
            "matched_soft_skills": skills_result["matched_soft"],
            "missing_soft_skills": skills_result["missing_soft"],
            "experience_analysis": exp_result["analysis"],
            "education_analysis": edu_result["analysis"],
            "overall_assessment": _generate_assessment(total_score),
            "improvement_suggestions": suggestions,
        },
    }


def _generate_smart_suggestions(missing_tech: List[str], missing_soft: List[str]) -> List[dict]:
    """Generate intelligent suggestions with learning resources."""
    suggestions = []
    
    # Tech Skills Suggestions
    for skill in missing_tech[:3]:
        suggestions.append({
            "topic": skill,
            "suggestion": f"Learn {skill} and build a small project.",
            "resources": [
                f"YouTube: {skill} full course",
                f"Udemy: {skill} for beginners",
                f"Project: Build a {skill}-based application"
            ]
        })
        
    # Soft Skills Suggestions
    for skill in missing_soft[:2]:
        suggestions.append({
            "topic": skill,
            "suggestion": f"Improve your {skill} through practice.",
            "resources": [
                f"Article: How to improve {skill} at work",
                "Practice: Join group discussions",
                "Course: Soft Skills Masterclass"
            ]
        })
        
    return suggestions


def _generate_assessment(total_score: float) -> str:
    if total_score >= 80: return "Strong candidate for this role."
    if total_score >= 60: return "Good candidate, some gaps to address."
    return "Consider upskilling to better fit this position."

