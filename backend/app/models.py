"""Pydantic models for request/response schemas."""

from pydantic import BaseModel, Field, EmailStr
from typing import Optional, List
from datetime import datetime
from enum import Enum


# ─── Enums ────────────────────────────────────────────────

class UserRole(str, Enum):
    CANDIDATE = "candidate"
    RECRUITER = "recruiter"
    ADMIN = "admin"


class ExperienceLevel(str, Enum):
    ENTRY = "entry"
    MID = "mid"
    SENIOR = "senior"
    LEAD = "lead"


# ─── Auth Schemas ─────────────────────────────────────────

class UserRegister(BaseModel):
    name: str = Field(..., min_length=2, max_length=100)
    email: str = Field(..., min_length=5)
    password: str = Field(..., min_length=6)
    role: UserRole = UserRole.CANDIDATE


class UserLogin(BaseModel):
    email: str
    password: str


class UserResponse(BaseModel):
    id: str
    name: str
    email: str
    role: UserRole
    created_at: datetime


class TokenResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"
    user: UserResponse


# ─── Resume Schemas ───────────────────────────────────────

class ParsedResume(BaseModel):
    raw_text: str = ""
    technical_skills: List[str] = []
    soft_skills: List[str] = []
    education: List[dict] = []
    experience: List[dict] = []
    total_experience_years: float = 0.0
    contact_info: dict = {}
    summary: str = ""
    category: str = "tech" # tech, business, arts, science


class ResumeResponse(BaseModel):
    id: str
    user_id: str
    filename: str
    parsed_data: ParsedResume
    embedding: Optional[List[float]] = None
    uploaded_at: datetime


# ─── Job Schemas ──────────────────────────────────────────

class JobCreate(BaseModel):
    title: str = Field(..., min_length=3, max_length=200)
    company: str = Field(..., min_length=2, max_length=100)
    description: str = Field(..., min_length=20)
    skills_required: List[str] = []
    soft_skills_required: List[str] = []
    category: str = "tech" # tech, business, marketing, finance, hr
    experience_level: ExperienceLevel = ExperienceLevel.MID
    min_experience_years: float = 0
    location: str = ""
    salary_range: str = ""
    job_type: str = "full-time"


class JobResponse(BaseModel):
    id: str
    created_by: str
    title: str
    company: str
    description: str
    skills_required: List[str]
    soft_skills_required: List[str] = []
    category: str
    experience_level: ExperienceLevel
    min_experience_years: float
    location: str
    salary_range: str
    job_type: str
    embedding: Optional[List[float]] = None
    created_at: datetime


# ─── Matching / Scoring Schemas ───────────────────────────

class ScoreBreakdown(BaseModel):
    skills_score: float = 0.0
    experience_score: float = 0.0
    semantic_score: float = 0.0
    education_score: float = 0.0
    total_score: float = 0.0


class MatchExplanation(BaseModel):
    matched_skills: List[str] = []
    missing_skills: List[str] = []
    matched_soft_skills: List[str] = []
    missing_soft_skills: List[str] = []
    experience_analysis: str = ""
    education_analysis: str = ""
    overall_assessment: str = ""
    improvement_suggestions: List[dict] = [] # [{"topic": str, "suggestion": str, "resources": list}]


class MatchResult(BaseModel):
    id: str
    resume_id: str
    job_id: str
    job_title: str
    company: str
    score_breakdown: ScoreBreakdown
    explanation: MatchExplanation
    calculated_at: datetime


class CandidateMatchResult(BaseModel):
    id: str
    resume_id: str
    job_id: str
    candidate_name: str
    candidate_email: str
    score_breakdown: ScoreBreakdown
    explanation: MatchExplanation
    calculated_at: datetime


# ─── Skill Gap Schemas ────────────────────────────────────

class SkillGapAnalysis(BaseModel):
    current_skills: List[str]
    target_role: str
    missing_skills: List[str]
    improvement_areas: List[dict]
    recommended_learning: List[str]


# ─── Chatbot Schemas ─────────────────────────────────────

class ChatMessage(BaseModel):
    message: str = Field(..., min_length=1, max_length=1000)
    history: Optional[List[dict]] = None


class ChatResponse(BaseModel):
    reply: str
    suggested_jobs: List[dict] = []
    intent: str = ""
