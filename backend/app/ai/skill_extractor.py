"""
Skill Extraction Module
- Uses spaCy NER + comprehensive keyword matching
- Extracts technical and soft skills from text
"""

import re
from typing import List, Set

# ─── Comprehensive Skills Database ───────────────────────

TECHNICAL_SKILLS = {
    # Programming Languages
    "python", "java", "javascript", "typescript", "c++", "c#", "c", "go", "golang",
    "rust", "ruby", "php", "swift", "kotlin", "scala", "r", "matlab", "perl",
    "objective-c", "dart", "lua", "haskell", "elixir", "clojure", "groovy",

    # Web Frontend
    "html", "css", "react", "reactjs", "react.js", "angular", "angularjs", "vue",
    "vuejs", "vue.js", "svelte", "next.js", "nextjs", "nuxt.js", "gatsby",
    "tailwind", "tailwindcss", "bootstrap", "sass", "scss", "less",
    "jquery", "webpack", "vite", "redux", "mobx", "graphql",

    # Web Backend
    "node.js", "nodejs", "express", "express.js", "fastapi", "flask", "django",
    "spring", "spring boot", "asp.net", ".net", "laravel", "rails",
    "ruby on rails", "gin", "fiber", "nestjs", "koa",

    # Databases
    "sql", "mysql", "postgresql", "postgres", "mongodb", "redis", "elasticsearch",
    "cassandra", "dynamodb", "firebase", "sqlite", "oracle", "mariadb",
    "neo4j", "couchdb", "influxdb", "memcached",

    # Cloud & DevOps
    "aws", "azure", "gcp", "google cloud", "docker", "kubernetes", "k8s",
    "terraform", "ansible", "jenkins", "ci/cd", "github actions",
    "circleci", "travis ci", "nginx", "apache", "linux", "unix",
    "serverless", "lambda", "cloudformation", "helm", "istio",

    # AI / ML / Data Science
    "machine learning", "deep learning", "artificial intelligence", "ai", "ml",
    "tensorflow", "pytorch", "keras", "scikit-learn", "sklearn",
    "pandas", "numpy", "scipy", "matplotlib", "seaborn", "plotly",
    "opencv", "nlp", "natural language processing", "computer vision",
    "reinforcement learning", "neural networks", "cnn", "rnn", "lstm",
    "transformer", "bert", "gpt", "langchain", "hugging face",
    "data science", "data analysis", "data engineering", "etl",
    "spark", "hadoop", "airflow", "kafka", "tableau", "power bi",
    "jupyter", "data visualization", "statistics", "spacy",

    # Business & Finance (NEW)
    "excel", "tally", "accounting", "finance", "banking", "taxation", "auditing",
    "gst", "sap", "business analysis", "market research", "investment banking",
    "risk management", "stock market", "financial modeling", "economics",

    # Marketing & Sales (NEW)
    "digital marketing", "seo", "sem", "social media marketing", "smm",
    "content marketing", "email marketing", "branding", "sales", "b2b", "b2c",
    "crm", "hubspot", "salesforce", "lead generation", "market analysis",
    "copywriting", "public relations", "pr", "event management",

    # HR & Management (NEW)
    "human resources", "hr", "recruitment", "talent acquisition", "payroll",
    "employee engagement", "operations management", "supply chain", "logistics",
    "customer relationship management", "office administration", "hiring",

    # Mobile
    "android", "ios", "react native", "flutter", "xamarin", "ionic",
    "swiftui", "jetpack compose",

    # Tools & Others
    "git", "github", "gitlab", "bitbucket", "jira", "confluence",
    "figma", "sketch", "adobe xd", "photoshop", "illustrator",
    "postman", "swagger", "rest api", "restful", "api design",
    "microservices", "monolith", "soa", "event-driven",
    "agile", "scrum", "kanban", "tdd", "bdd", "unit testing",
    "integration testing", "selenium", "cypress", "jest", "pytest",
    "mocha", "chai", "playwright",

    # Security
    "cybersecurity", "penetration testing", "owasp", "encryption",
    "ssl", "tls", "oauth", "jwt", "sso",

    # Blockchain
    "blockchain", "solidity", "ethereum", "smart contracts", "web3",

    # Data formats & protocols
    "json", "xml", "yaml", "protobuf", "grpc", "websocket", "mqtt",
    "rabbitmq", "celery",
}

SOFT_SKILLS = {
    "leadership", "communication", "teamwork", "problem solving",
    "critical thinking", "time management", "project management",
    "collaboration", "adaptability", "creativity", "analytical",
    "presentation", "negotiation", "decision making", "mentoring",
    "strategic planning", "conflict resolution", "customer service",
    "public speaking", "interpersonal skills", "emotional intelligence",
    "active listening", "self-motivation", "work ethic", "attention to detail",
    "organization", "multitasking", "customer relationship management",
}

# Map common aliases to canonical names
SKILL_ALIASES = {
    "react.js": "react", "reactjs": "react",
    "vue.js": "vue", "vuejs": "vue",
    "node.js": "nodejs", "express.js": "express",
    "next.js": "nextjs", "nuxt.js": "nuxtjs",
    "angular.js": "angular", "angularjs": "angular",
    "tailwindcss": "tailwind",
    "postgres": "postgresql",
    "k8s": "kubernetes",
    "golang": "go",
    "sklearn": "scikit-learn",
}

# spaCy model (loaded lazily)
_nlp = None


def _get_nlp():
    """Lazy-load spaCy model."""
    global _nlp
    if _nlp is None:
        try:
            import spacy
            try:
                _nlp = spacy.load("en_core_web_sm")
            except OSError:
                # Model not installed, use blank
                _nlp = spacy.blank("en")
                print("⚠️ spaCy model not found. Using blank model. Run: python -m spacy download en_core_web_sm")
        except ImportError:
            _nlp = None
            print("⚠️ spaCy not installed")
    return _nlp


def extract_skills_keyword(text: str) -> dict:
    """Extract skills using keyword matching, returning tech and soft skills separately."""
    text_lower = text.lower()
    found_tech: Set[str] = set()
    found_soft: Set[str] = set()

    # Extract Technical Skills
    for skill in TECHNICAL_SKILLS:
        skill_clean = skill.lower().strip()
        if len(skill_clean) <= 3: # Increased to 3 to cover 'C++', 'C#', 'PHP'
            # Use negative lookahead/lookbehind for more flexible boundaries
            # This allows 'C++', 'C#' which \b might struggle with
            pattern = r'(?i)(?<![a-zA-Z0-9])' + re.escape(skill_clean) + r'(?![a-zA-Z0-9])'
            if re.search(pattern, text_lower):
                # Context boost for short skills
                context_keywords = ['language', 'programming', 'develop', 'skill', 'knowledge', 'proficien', 'stack', 'tech', 'work', 'role', 'tool', 'technolog']
                # Check if any context keyword is in the text
                has_context = any(kw in text_lower for kw in context_keywords)
                
                # If length > 1 (C++, JS, C#), or if it has context, add it
                if len(skill_clean) > 1 or has_context:
                    found_tech.add(SKILL_ALIASES.get(skill_clean, skill_clean))
        else:
            # Multi-word or longer skills
            if " " in skill_clean:
                if skill_clean in text_lower:
                    found_tech.add(SKILL_ALIASES.get(skill_clean, skill_clean))
            else:
                pattern = r'(?i)(?<![a-zA-Z0-9])' + re.escape(skill_clean) + r'(?![a-zA-Z0-9])'
                if re.search(pattern, text_lower):
                    found_tech.add(SKILL_ALIASES.get(skill_clean, skill_clean))


    # Extract Soft Skills
    for skill in SOFT_SKILLS:
        skill_clean = skill.lower().strip()
        if " " in skill_clean:
            if skill_clean in text_lower:
                found_soft.add(skill_clean)
        else:
            pattern = r'\b' + re.escape(skill_clean) + r'\b'
            if re.search(pattern, text_lower):
                found_soft.add(skill_clean)

    return {
        "technical_skills": sorted(list(found_tech)),
        "soft_skills": sorted(list(found_soft))
    }


def extract_skills_spacy(text: str) -> List[str]:
    """Extract additional entities using spaCy NER."""
    nlp = _get_nlp()
    if nlp is None:
        return []

    # Process in chunks if extremely long, but typically resumes are short
    doc = nlp(text[:50000]) 
    entities = []
    for ent in doc.ents:
        if ent.label_ in ("ORG", "PRODUCT", "WORK_OF_ART"):
            skill = ent.text.lower().strip()
            if skill in TECHNICAL_SKILLS:
                entities.append(SKILL_ALIASES.get(skill, skill))

    return list(set(entities))


def extract_skills(text: str) -> dict:
    """Extract all skills and return technical and soft skills separately with debugging."""
    keyword_results = extract_skills_keyword(text)
    spacy_entities = extract_skills_spacy(text)

    # Combine and deduplicate
    all_tech = sorted(list(set(keyword_results["technical_skills"] + spacy_entities)))
    all_soft = sorted(list(set(keyword_results["soft_skills"])))
    
    print(f"--- DEBUG: SKILLS EXTRACTED ---")
    print(f"Technical ({len(all_tech)}): {', '.join(all_tech[:10])}...")
    print(f"Soft ({len(all_soft)}): {', '.join(all_soft[:10])}...")
    
    return {
        "technical_skills": all_tech,
        "soft_skills": all_soft,
        "all_skills": sorted(list(set(all_tech + all_soft)))
    }


def detect_category(text: str, skills: dict) -> str:
    """Detect if the resume/job is tech, business, arts, or science."""
    text_lower = text.lower()
    
    # Category Keywords
    categories = {
        "tech": ["software", "developer", "engineering", "coding", "programming", "it", "technical"],
        "business": ["marketing", "finance", "sales", "mba", "business", "accounting", "hr", "management"],
        "arts": ["design", "arts", "history", "social", "languages", "literature", "humanities"],
        "science": ["biology", "chemistry", "physics", "medical", "clinical", "research", "lab"],
    }
    
    scores = {cat: 0 for cat in categories}
    
    # 1. Check Keywords
    for cat, keywords in categories.items():
        for word in keywords:
            if word in text_lower:
                scores[cat] += 1
                
    # 2. Check Skills
    tech_skills_count = len(skills.get("technical_skills", []))
    soft_skills_count = len(skills.get("soft_skills", []))
    
    scores["tech"] += tech_skills_count * 0.5
    scores["business"] += soft_skills_count * 0.3
    
    # Return highest scoring category, default to "tech"
    best_cat = max(scores, key=scores.get)
    return best_cat if scores[best_cat] > 0 else "tech"


def extract_skills_from_job(description: str) -> dict:
    """Extract required skills from a job description."""
    return extract_skills(description)

