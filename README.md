# 🤖 AI-Based Resume Screening and Job & Skill Recommendation System

> B.Tech Final Year Project — A production-ready AI platform that uses **BERT embeddings**, **NLP**, and **weighted ATS scoring** to match resumes with job descriptions, recommend jobs, and analyze skill gaps.

---

## 📋 Table of Contents

- [Features](#-features)
- [Tech Stack](#-tech-stack)
- [Project Structure](#-project-structure)
- [Setup Instructions](#-setup-instructions)
- [Running Locally](#-running-locally)
- [Demo Credentials](#-demo-credentials)
- [API Documentation](#-api-documentation)
- [Sample Test Data](#-sample-test-data)
- [MongoDB Schema](#-mongodb-schema)

---

## ✨ Features

| # | Feature | Description |
|---|---------|-------------|
| 1 | **Resume Upload & Parsing** | Upload PDF/DOC/TXT resumes; text extracted via PyMuPDF with OCR fallback |
| 2 | **Skill Extraction** | NLP-powered extraction using spaCy + comprehensive keyword matching (150+ skills) |
| 3 | **Job Description Processing** | Auto-extract required skills from job postings |
| 4 | **AI Matching System** | BERT sentence-transformers generate embeddings; cosine similarity scoring |
| 5 | **Weighted ATS Scoring** | Skills (40%) + Semantic (30%) + Experience (20%) + Education (10%) |
| 6 | **Explainable AI** | Detailed breakdown of WHY scores are high/low with matched vs missing skill highlights |
| 7 | **Job Recommendations** | Top matching jobs for candidates; best candidates for recruiters |
| 8 | **Skill Gap Analysis** | Missing skills identification with improvement areas and learning recommendations |
| 9 | **Dual Dashboards** | Candidate Dashboard (upload, scores, recommendations) + Recruiter Dashboard (post jobs, view ranked candidates) |
| 10 | **AI Chatbot** | Career assistant that suggests jobs, gives skill advice, and resume tips |

---

## 🛠 Tech Stack

| Layer | Technology |
|-------|------------|
| **Frontend** | React.js, Tailwind CSS, Vite, React Router, Recharts, Framer Motion |
| **Backend** | FastAPI (Python), Uvicorn |
| **Database** | MongoDB (via Motor async driver) |
| **AI/NLP** | sentence-transformers (BERT `all-MiniLM-L6-v2`), spaCy, NumPy, scikit-learn |
| **Resume Parsing** | PyMuPDF, Tesseract OCR (optional) |
| **Auth** | JWT (python-jose), bcrypt |

---

## 📂 Project Structure

```
ai-based-resume-screening/
├── backend/
│   ├── app/
│   │   ├── __init__.py
│   │   ├── config.py          # Environment config (Pydantic Settings)
│   │   ├── database.py        # MongoDB async connection (Motor)
│   │   ├── models.py          # Pydantic schemas (request/response)
│   │   ├── auth.py            # JWT authentication utilities
│   │   ├── ai/
│   │   │   ├── __init__.py
│   │   │   ├── resume_parser.py   # PDF/DOC text extraction + OCR
│   │   │   ├── skill_extractor.py # spaCy NER + keyword matching
│   │   │   ├── embedding.py       # BERT sentence-transformers
│   │   │   ├── scoring.py         # Weighted ATS scoring engine
│   │   │   └── chatbot.py         # AI chatbot with intent detection
│   │   └── routes/
│   │       ├── __init__.py
│   │       ├── auth_routes.py     # Register, Login
│   │       ├── resume_routes.py   # Upload, Parse, Get resume
│   │       ├── job_routes.py      # CRUD jobs, Get candidates
│   │       ├── matching_routes.py # Score, Recommend, Skill gap
│   │       ├── chat_routes.py     # Chatbot endpoint
│   │       └── seed_routes.py     # Sample data seeder
│   ├── main.py                # FastAPI app entry point
│   ├── requirements.txt
│   ├── .env
│   └── venv/                  # Python virtual environment
│
├── frontend/
│   ├── public/
│   │   └── vite.svg
│   ├── src/
│   │   ├── main.jsx           # React entry point
│   │   ├── App.jsx            # Router + Auth guards
│   │   ├── index.css          # Global styles + Tailwind
│   │   ├── context/
│   │   │   └── AuthContext.jsx # Auth state management
│   │   ├── services/
│   │   │   └── api.js         # Axios API client
│   │   ├── components/
│   │   │   ├── Navbar.jsx
│   │   │   ├── ScoreRing.jsx
│   │   │   └── ResumeUploader.jsx
│   │   └── pages/
│   │       ├── LandingPage.jsx
│   │       ├── LoginPage.jsx
│   │       ├── RegisterPage.jsx
│   │       ├── CandidateDashboard.jsx
│   │       ├── RecruiterDashboard.jsx
│   │       ├── JobListPage.jsx
│   │       ├── JobDetailPage.jsx
│   │       └── ChatbotPage.jsx
│   ├── index.html
│   ├── package.json
│   ├── vite.config.js
│   ├── tailwind.config.js
│   └── postcss.config.js
│
├── sample_data/
│   ├── sample_resume.txt      # Test resume 1
│   └── sample_resume_2.txt    # Test resume 2
├── .gitignore
└── README.md
```

---

## 🚀 Setup Instructions

### Prerequisites

- **Python 3.10+** — [python.org](https://python.org)
- **Node.js 18+** — [nodejs.org](https://nodejs.org)
- **MongoDB** — [mongodb.com](https://www.mongodb.com/try/download/community) (running on `localhost:27017`)

### Step 1: Clone / Open the Project

```bash
cd "ai based resume screening and job recommendation system"
```

### Step 2: Backend Setup

```bash
# Navigate to backend
cd backend

# Create virtual environment (already created if you ran setup)
python3 -m venv venv

# Activate virtual environment
source venv/bin/activate        # macOS/Linux
# venv\Scripts\activate         # Windows

# Install dependencies
pip install -r requirements.txt

# Download spaCy language model
python -m spacy download en_core_web_sm
```

### Step 3: Frontend Setup

```bash
# Navigate to frontend
cd ../frontend

# Install npm packages
npm install
```

### Step 4: Start MongoDB

```bash
# If installed via Homebrew (macOS)
brew services start mongodb-community

# Or run directly
mongod --dbpath /path/to/data
```

---

## ▶️ Running Locally

### Terminal 1 — Start Backend (FastAPI)

```bash
cd backend
source venv/bin/activate
uvicorn main:app --reload --host 0.0.0.0 --port 8000
```

Backend runs at: **http://localhost:8000**  
API Docs (Swagger): **http://localhost:8000/docs**

### Terminal 2 — Start Frontend (React)

```bash
cd frontend
npm run dev
```

Frontend runs at: **http://localhost:5173**

### First-Time Setup

1. Open **http://localhost:5173** in your browser
2. Click **"Get Started"** to register, or use demo credentials
3. The system auto-seeds 10 sample jobs on first dashboard load

---

## 🔑 Demo Credentials

| Role | Email | Password |
|------|-------|----------|
| **Candidate** | `candidate@demo.com` | `demo123` |
| **Recruiter** | `recruiter@demo.com` | `demo123` |

> These accounts are auto-created when you first access any dashboard.

---

## 📡 API Documentation

### Authentication
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/auth/register` | Register new user |
| POST | `/auth/login` | Login |
| GET | `/auth/me` | Get current user profile |

### Resumes
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/resumes/upload` | Upload & parse resume (multipart) |
| GET | `/resumes/my-resume` | Get current user's resume |
| GET | `/resumes/{id}` | Get resume by ID |

### Jobs
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/jobs/` | List all jobs (with search & filter) |
| POST | `/jobs/` | Create job posting (recruiter only) |
| GET | `/jobs/{id}` | Get job details |
| DELETE | `/jobs/{id}` | Delete job (owner only) |
| GET | `/jobs/my/postings` | Get recruiter's own jobs |
| GET | `/jobs/{id}/candidates` | Get ranked candidates for a job |

### Matching & Recommendations
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/matching/score/{job_id}` | Calculate ATS score for resume vs job |
| GET | `/matching/recommendations` | Get top job recommendations |
| GET | `/matching/skill-gap` | Skill gap analysis |
| GET | `/matching/my-scores` | Get all match scores |

### Chatbot
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/chat/` | Send message to AI chatbot |

### Utilities
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/seed/` | Seed database with sample data |
| GET | `/health` | Health check |

---

## 🧪 Sample Test Data

### Test Flow — Candidate

1. Register as **candidate** or use demo credentials
2. Upload `sample_data/sample_resume.txt` (or a real PDF)
3. View extracted skills, education, experience on Dashboard
4. Browse **Recommendations** tab — see top matching jobs with scores
5. Click any job → **Calculate Match Score** → see detailed breakdown
6. Check **Skill Gap** tab for improvement suggestions
7. Visit **AI Chat** to ask about jobs or career advice

### Test Flow — Recruiter

1. Login as **recruiter** (`recruiter@demo.com` / `demo123`)
2. View dashboard with all posted jobs
3. Click **View Candidates** on any job to see ranked applicants
4. Expand a candidate to see full score breakdown
5. Click **Post New Job** to add a custom job posting

---

## 🗄 MongoDB Schema

### Users Collection
```json
{
  "_id": "ObjectId",
  "name": "string",
  "email": "string (unique)",
  "password": "string (bcrypt hashed)",
  "role": "candidate | recruiter",
  "created_at": "datetime"
}
```

### Resumes Collection
```json
{
  "_id": "ObjectId",
  "user_id": "string (ref: users)",
  "filename": "string",
  "stored_filename": "string",
  "parsed_data": {
    "raw_text": "string",
    "skills": ["python", "react", ...],
    "education": [{"degree": "B.Tech", "field": "CS"}],
    "experience": [],
    "total_experience_years": 3.0,
    "contact_info": {"email": "...", "phone": "..."},
    "summary": "string"
  },
  "embedding": [0.123, -0.456, ...],  // 384-dim BERT vector
  "uploaded_at": "datetime"
}
```

### Jobs Collection
```json
{
  "_id": "ObjectId",
  "created_by": "string (ref: users)",
  "title": "string",
  "company": "string",
  "description": "string",
  "skills_required": ["python", "docker", ...],
  "preferred_skills": ["kubernetes", ...],
  "experience_level": "entry | mid | senior | lead",
  "min_experience_years": 3,
  "location": "string",
  "salary_range": "string",
  "job_type": "full-time | part-time | contract | internship",
  "embedding": [0.123, -0.456, ...],  // 384-dim BERT vector
  "created_at": "datetime"
}
```

### Match Results Collection
```json
{
  "_id": "ObjectId",
  "resume_id": "string",
  "job_id": "string",
  "user_id": "string",
  "job_title": "string",
  "company": "string",
  "score_breakdown": {
    "skills_score": 75.0,
    "experience_score": 80.0,
    "semantic_score": 68.5,
    "education_score": 90.0,
    "total_score": 76.2
  },
  "explanation": {
    "matched_skills": ["python", "react"],
    "missing_skills": ["kubernetes"],
    "experience_analysis": "...",
    "education_analysis": "...",
    "overall_assessment": "...",
    "improvement_suggestions": ["..."]
  },
  "calculated_at": "datetime"
}
```

---

## 🧠 AI/ML Architecture

```
Resume (PDF/DOC/TXT)
    │
    ▼
┌─────────────────┐
│  PyMuPDF / OCR  │ ── Text Extraction
└────────┬────────┘
         │
    ▼         ▼
┌──────────┐  ┌──────────────┐
│  spaCy   │  │  Keyword DB  │ ── Skill Extraction (150+ skills)
│  NER     │  │  Matching    │
└────┬─────┘  └──────┬───────┘
     │               │
     └───────┬───────┘
             │
    ▼                 ▼
┌──────────────┐  ┌──────────────┐
│ BERT Model   │  │ Regex-based  │
│ (MiniLM-L6)  │  │ Parsers      │
│ → Embedding  │  │ → Edu, Exp   │
└──────┬───────┘  └──────┬───────┘
       │                 │
       └────────┬────────┘
                │
       ┌────────▼────────┐
       │  ATS Scoring    │
       │  Engine         │
       │                 │
       │  Skills:   40%  │
       │  Exp:      25%  │
       │  Semantic: 20%  │
       │  Edu:      15%  │
       └────────┬────────┘
                │
       ┌────────▼────────┐
       │  Explainable    │
       │  Results +      │
       │  Recommendations│
       └─────────────────┘
```

---

## 📝 License

This project is created as a B.Tech final year project for educational purposes.
