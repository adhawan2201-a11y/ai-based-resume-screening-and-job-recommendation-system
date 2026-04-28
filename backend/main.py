"""
AI-Based Resume Screening and Job Recommendation System
Main FastAPI Application
"""

import os
from fastapi import FastAPI, Depends, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from contextlib import asynccontextmanager

from app.database import connect_to_mongo, close_mongo_connection, get_database
from app.auth import get_current_user, hash_password
from app.models import UserResponse, UserRole
from datetime import datetime
from app.routes import auth_routes, resume_routes, job_routes, matching_routes, chat_routes, seed_routes, candidate_routes, admin_routes, recruiter_routes


@asynccontextmanager
async def lifespan(app: FastAPI):
    """Application lifespan — connect/disconnect MongoDB."""
    await connect_to_mongo()
    
    # Ensure demo users exist
    db = get_database()
    
    # 1. Essential System Admin (Initial Setup)
    admin_exists = await db.users.find_one({"email": "admin@system.com"})
    if not admin_exists:
        print("[System] Initializing administrative access...")
        await db.users.insert_one({
            "name": "System Admin",
            "email": "admin@system.com",
            "password": hash_password("admin123"),
            "role": UserRole.ADMIN,
            "created_at": datetime.utcnow()
        })

    # Ensure indexes for performance
    await db.users.create_index("email", unique=True)
    await db.resumes.create_index("user_id")
    await db.matches.create_index("user_id")
    await db.matches.create_index([("user_id", 1), ("job_id", 1)])
    
    # Ensure uploads directory exists
    os.makedirs("uploads", exist_ok=True)
    yield
    await close_mongo_connection()


app = FastAPI(
    title="AI Resume Screening & Job Recommendation System",
    description=(
        "An intelligent system that uses BERT embeddings, NLP, and weighted ATS scoring "
        "to match resumes with job descriptions, recommend jobs, and analyze skill gaps."
    ),
    version="1.0.0",
    lifespan=lifespan,
)

# ─── CORS Middleware ──────────────────────────────────────
# NOTE: allow_credentials must be False when allow_origins=["*"]
# We use Bearer token auth (Authorization header), not cookies,
# so credentials=False is correct and safe here.
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=False,
    allow_methods=["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    allow_headers=["*"],
    expose_headers=["*"],
)


# ─── Explicit OPTIONS preflight handler (failsafe) ───────
@app.options("/{full_path:path}")
async def preflight_handler(request: Request, full_path: str):
    """Handle all CORS preflight OPTIONS requests explicitly."""
    return JSONResponse(
        content={"message": "OK"},
        headers={
            "Access-Control-Allow-Origin": "*",
            "Access-Control-Allow-Methods": "GET, POST, PUT, PATCH, DELETE, OPTIONS",
            "Access-Control-Allow-Headers": "*",
        },
    )


# ─── Register Routes ─────────────────────────────────────
app.include_router(auth_routes.router)
app.include_router(resume_routes.router)
app.include_router(job_routes.router)
app.include_router(matching_routes.router)
app.include_router(chat_routes.router)
app.include_router(seed_routes.router)
app.include_router(candidate_routes.router)
app.include_router(admin_routes.router)
app.include_router(recruiter_routes.router)


# ─── Protected /auth/me endpoint ─────────────────────────
@app.get("/auth/me", tags=["Authentication"])
async def get_current_user_profile(current_user: dict = Depends(get_current_user)):
    """Get the currently authenticated user's profile."""
    return UserResponse(
        id=str(current_user["_id"]),
        name=current_user["name"],
        email=current_user["email"],
        role=current_user["role"],
        created_at=current_user["created_at"],
    )


# ─── Health Check ─────────────────────────────────────────
@app.get("/", tags=["Health"])
async def root():
    return {
        "status": "running",
        "name": "AI-Based Resume Screening & Job Recommendation System",
        "version": "1.0.0",
        "docs": "/docs",
        "cors": "enabled for all origins",
    }


@app.get("/health", tags=["Health"])
async def health_check():
    from app.database import get_database
    db = get_database()
    try:
        await db.command("ping")
        db_status = "connected"
    except Exception:
        db_status = "disconnected"

    return {
        "status": "healthy",
        "database": db_status,
    }
