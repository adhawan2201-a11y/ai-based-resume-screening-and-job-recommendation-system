"""Seed data route — populate database with sample jobs and users for demo."""

from datetime import datetime
from fastapi import APIRouter
from app.database import get_database
from app.auth import hash_password
from app.ai.embedding import generate_embedding
from app.ai.skill_extractor import extract_skills_from_job

router = APIRouter(prefix="/seed", tags=["Seed Data"])

SAMPLE_JOBS = [
    {
        "title": "Senior Python Developer",
        "company": "TechCorp Solutions",
        "description": "We are looking for an experienced Python developer to build scalable backend services. You will work with FastAPI, PostgreSQL, and Docker to develop microservices architecture. Experience with machine learning frameworks is a plus. The role involves designing REST APIs, writing unit tests, and collaborating with cross-functional teams.",
        "skills_required": ["python", "fastapi", "postgresql", "docker", "rest api", "git", "linux"],
        "preferred_skills": ["machine learning", "kubernetes", "redis", "ci/cd"],
        "experience_level": "senior",
        "min_experience_years": 5,
        "location": "Bangalore, India",
        "salary_range": "₹18L - ₹30L",
        "job_type": "full-time",
    },
    {
        "title": "Frontend React Developer",
        "company": "WebStar Digital",
        "description": "Join our team as a React developer to build modern, responsive web applications. You will use React.js, TypeScript, and Tailwind CSS to create beautiful user interfaces. Experience with Next.js and state management libraries like Redux is required. Must have strong understanding of web performance and accessibility.",
        "skills_required": ["react", "javascript", "typescript", "tailwind", "html", "css", "git"],
        "preferred_skills": ["nextjs", "redux", "graphql", "jest"],
        "experience_level": "mid",
        "min_experience_years": 3,
        "location": "Mumbai, India",
        "salary_range": "₹12L - ₹22L",
        "job_type": "full-time",
    },
    {
        "title": "Data Scientist",
        "company": "AI Analytics Corp",
        "description": "We need a data scientist to analyze large datasets and build predictive models. You will work with Python, TensorFlow, and scikit-learn to develop machine learning pipelines. Experience with NLP and computer vision is highly valued. The role requires strong statistical knowledge and the ability to communicate findings to stakeholders.",
        "skills_required": ["python", "machine learning", "tensorflow", "scikit-learn", "pandas", "numpy", "sql"],
        "preferred_skills": ["deep learning", "nlp", "pytorch", "spark", "tableau"],
        "experience_level": "mid",
        "min_experience_years": 2,
        "location": "Hyderabad, India",
        "salary_range": "₹15L - ₹25L",
        "job_type": "full-time",
    },
    {
        "title": "Full Stack Developer",
        "company": "InnovateTech",
        "description": "We are hiring a full stack developer proficient in both frontend and backend technologies. You will build end-to-end features using React, Node.js, and MongoDB. Experience with cloud deployment on AWS is a plus. The ideal candidate should be comfortable with agile methodologies and CI/CD pipelines.",
        "skills_required": ["javascript", "react", "nodejs", "mongodb", "html", "css", "git"],
        "preferred_skills": ["typescript", "aws", "docker", "redis", "ci/cd"],
        "experience_level": "mid",
        "min_experience_years": 3,
        "location": "Pune, India",
        "salary_range": "₹10L - ₹20L",
        "job_type": "full-time",
    },
    {
        "title": "DevOps Engineer",
        "company": "CloudScale Systems",
        "description": "Looking for a DevOps engineer to manage our cloud infrastructure and CI/CD pipelines. You will work with AWS, Docker, Kubernetes, and Terraform to ensure high availability and scalability. Experience with monitoring tools like Prometheus and Grafana is required. Strong Linux administration skills are essential.",
        "skills_required": ["docker", "kubernetes", "aws", "terraform", "linux", "ci/cd", "git"],
        "preferred_skills": ["ansible", "jenkins", "prometheus", "grafana", "python"],
        "experience_level": "senior",
        "min_experience_years": 4,
        "location": "Remote",
        "salary_range": "₹20L - ₹35L",
        "job_type": "full-time",
    },
    {
        "title": "Mobile App Developer",
        "company": "AppVentures",
        "description": "We need a mobile developer skilled in Flutter or React Native to build cross-platform applications. You will create performant mobile apps with beautiful UI/UX. Experience with Firebase, REST APIs, and state management is required. iOS and Android deployment experience is a must.",
        "skills_required": ["flutter", "dart", "firebase", "rest api", "git"],
        "preferred_skills": ["react native", "android", "ios", "graphql"],
        "experience_level": "mid",
        "min_experience_years": 2,
        "location": "Delhi, India",
        "salary_range": "₹8L - ₹18L",
        "job_type": "full-time",
    },
    {
        "title": "Machine Learning Engineer",
        "company": "DeepMind Labs India",
        "description": "Join our ML team to build and deploy machine learning models at scale. You will work with PyTorch, TensorFlow, and MLflow to develop NLP and computer vision solutions. Experience with distributed training and model optimization is required. Strong foundation in mathematics and statistics is essential.",
        "skills_required": ["python", "pytorch", "tensorflow", "machine learning", "deep learning", "docker"],
        "preferred_skills": ["nlp", "computer vision", "kubernetes", "spark", "mlflow"],
        "experience_level": "senior",
        "min_experience_years": 4,
        "location": "Bangalore, India",
        "salary_range": "₹25L - ₹45L",
        "job_type": "full-time",
    },
    {
        "title": "Junior Web Developer",
        "company": "StartupHub",
        "description": "Entry-level position for a web developer with knowledge of HTML, CSS, JavaScript, and basic React. You will assist in building and maintaining web applications under the guidance of senior developers. Good learning opportunity with mentorship provided. Knowledge of version control with Git is required.",
        "skills_required": ["html", "css", "javascript", "react", "git"],
        "preferred_skills": ["typescript", "tailwind", "nodejs", "mongodb"],
        "experience_level": "entry",
        "min_experience_years": 0,
        "location": "Chennai, India",
        "salary_range": "₹4L - ₹8L",
        "job_type": "full-time",
    },
    {
        "title": "Backend Java Developer",
        "company": "Enterprise Solutions Ltd",
        "description": "Looking for a Java developer to work on enterprise backend systems. You will use Spring Boot, microservices architecture, and relational databases. Experience with Kafka and RabbitMQ for message queuing is preferred. Must have strong object-oriented design skills and understanding of design patterns.",
        "skills_required": ["java", "spring boot", "microservices", "sql", "git", "rest api"],
        "preferred_skills": ["kafka", "rabbitmq", "docker", "kubernetes", "redis"],
        "experience_level": "mid",
        "min_experience_years": 3,
        "location": "Noida, India",
        "salary_range": "₹12L - ₹22L",
        "job_type": "full-time",
    },
    {
        "title": "Cybersecurity Analyst",
        "company": "SecureNet Technologies",
        "description": "We need a cybersecurity analyst to protect our organization's digital assets. You will conduct vulnerability assessments, penetration testing, and implement security policies. Experience with OWASP guidelines, network security, and encryption protocols is required. CISSP or CEH certification is preferred.",
        "skills_required": ["cybersecurity", "penetration testing", "owasp", "linux", "python", "encryption"],
        "preferred_skills": ["aws", "docker", "splunk", "wireshark"],
        "experience_level": "mid",
        "min_experience_years": 3,
        "location": "Gurgaon, India",
        "salary_range": "₹14L - ₹24L",
        "job_type": "full-time",
    },
]


async def seed_system_data():
    """Logic to seed the database with sample data."""
    db = get_database()

    # Create sample recruiter if not exists
    recruiter = await db.users.find_one({"email": "recruiter@demo.com"})
    if not recruiter:
        recruiter_doc = {
            "name": "Abhinav Shukla",
            "email": "recruiter@demo.com",
            "password": hash_password("demo123"),
            "role": "recruiter",
            "created_at": datetime.utcnow(),
        }
        result = await db.users.insert_one(recruiter_doc)
        created_by = str(result.inserted_id)
    else:
        created_by = str(recruiter["_id"])

    # Create sample candidate if not exists
    candidate = await db.users.find_one({"email": "candidate@demo.com"})
    if not candidate:
        candidate_doc = {
            "name": "Abhishek Dhawan",
            "email": "candidate@demo.com",
            "password": hash_password("demo123"),
            "role": "candidate",
            "created_at": datetime.utcnow(),
        }
        await db.users.insert_one(candidate_doc)

    # Create default admin if not exists
    admin = await db.users.find_one({"email": "admin@system.com"})
    if not admin:
        admin_doc = {
            "name": "System Admin",
            "email": "admin@system.com",
            "password": hash_password("admin123"),
            "role": "admin",
            "created_at": datetime.utcnow(),
        }
        await db.users.insert_one(admin_doc)

    # Insert sample jobs
    from app.ai.skill_extractor import detect_category
    jobs_added = 0
    for job_data in SAMPLE_JOBS:
        # Check if job already exists
        existing = await db.jobs.find_one({
            "title": job_data["title"],
            "company": job_data["company"],
        })
        if existing:
            continue

        # Auto-extract additional skills from description
        extracted = extract_skills_from_job(job_data["description"])
        req_tech = list(set([s.lower() for s in job_data["skills_required"]] + extracted["technical_skills"]))
        req_soft = list(set([s.lower() for s in job_data.get("soft_skills_required", [])] + extracted["soft_skills"]))
        
        # Detect category
        category = detect_category(job_data["description"], extracted)

        # Generate embedding
        embed_text = f"{job_data['title']} {job_data['description']} {' '.join(req_tech)} {' '.join(req_soft)}"
        embedding = generate_embedding(embed_text)

        job_doc = {
            **job_data,
            "skills_required": req_tech,
            "soft_skills_required": req_soft,
            "category": category,
            "created_by": created_by,
            "embedding": embedding,
            "created_at": datetime.utcnow(),
            "is_active": True,
        }
        await db.jobs.insert_one(job_doc)
        jobs_added += 1
    
    return jobs_added



@router.post("/")
async def seed_database():
    """Seed the database with sample data for demo purposes."""
    jobs_added = await seed_system_data()
    return {
        "message": f"Database seeded successfully!",
        "jobs_added": jobs_added,
        "demo_credentials": {
            "admin": {"email": "admin@system.com", "password": "admin123"},
            "recruiter": {"email": "recruiter@demo.com", "password": "demo123"},
            "candidate": {"email": "candidate@demo.com", "password": "demo123"},
        },
    }
