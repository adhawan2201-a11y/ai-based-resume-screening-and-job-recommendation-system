"""
Resume Parser Module
- Extracts text from PDF/DOC files using PyMuPDF
- Falls back to OCR (Tesseract) for scanned PDFs
"""

import re
import fitz  # PyMuPDF
from pathlib import Path
from typing import Optional

try:
    import pytesseract
    from PIL import Image
    import io
    OCR_AVAILABLE = True
except ImportError:
    OCR_AVAILABLE = False


def extract_text_from_pdf(file_path: str) -> str:
    """Extract text from a PDF file using PyMuPDF, with OCR fallback."""
    text = ""
    try:
        doc = fitz.open(file_path)
        for page in doc:
            page_text = page.get_text()
            if page_text.strip():
                text += page_text + "\n"
            elif OCR_AVAILABLE:
                # OCR fallback for scanned pages
                pix = page.get_pixmap(matrix=fitz.Matrix(2, 2))
                img = Image.open(io.BytesIO(pix.tobytes("png")))
                page_text = pytesseract.image_to_string(img)
                text += page_text + "\n"
        doc.close()
        
        # Robustness check
        if not text.strip():
             print(f"⚠️ Warning: PyMuPDF returned empty text for {file_path}. Trying fallback...")
    except Exception as e:
        print(f"Error parsing PDF: {e}")
        raise ValueError(f"Could not parse PDF file: {str(e)}")

    clean_text = text.strip()
    print("--- DEBUG: RESUME TEXT START (First 500 chars) ---")
    print(clean_text[:500])
    print("--- DEBUG: RESUME TEXT END ---")
    return clean_text


def extract_text_from_doc(file_path: str) -> str:
    """Extract text from a DOC/DOCX file."""
    try:
        import docx
        doc = docx.Document(file_path)
        text = "\n".join([para.text for para in doc.paragraphs])
        return text.strip()
    except ImportError:
        # Fallback: try reading as plain text
        with open(file_path, "r", errors="ignore") as f:
            return f.read().strip()


def extract_text(file_path: str) -> str:
    """Extract text based on file extension."""
    ext = Path(file_path).suffix.lower()
    if ext == ".pdf":
        return extract_text_from_pdf(file_path)
    elif ext in (".doc", ".docx"):
        return extract_text_from_doc(file_path)
    elif ext == ".txt":
        with open(file_path, "r") as f:
            return f.read().strip()
    else:
        raise ValueError(f"Unsupported file format: {ext}")


def extract_contact_info(text: str) -> dict:
    """Extract email and phone from resume text."""
    contact = {}

    # Email
    email_pattern = r"[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}"
    emails = re.findall(email_pattern, text)
    if emails:
        contact["email"] = emails[0]

    # Phone
    phone_pattern = r"(?:\+?\d{1,3}[-.\s]?)?\(?\d{3}\)?[-.\s]?\d{3}[-.\s]?\d{4}"
    phones = re.findall(phone_pattern, text)
    if phones:
        contact["phone"] = phones[0]

    # LinkedIn
    linkedin_pattern = r"linkedin\.com/in/[\w-]+"
    linkedin = re.findall(linkedin_pattern, text, re.IGNORECASE)
    if linkedin:
        contact["linkedin"] = linkedin[0]

    return contact


def extract_experience_years(text: str) -> float:
    """Estimate total years of experience from resume text."""
    patterns = [
        r"(\d+)\+?\s*years?\s*(?:of\s+)?(?:experience|exp)",
        r"(?:experience|exp)\s*[:.]?\s*(\d+)\+?\s*years?",
        r"(\d+)\+?\s*yrs?\s*(?:of\s+)?(?:experience|exp)",
    ]

    years = []
    for pattern in patterns:
        matches = re.findall(pattern, text, re.IGNORECASE)
        years.extend([float(m) for m in matches])

    if years:
        return max(years)

    # Fallback: count date ranges (e.g. "2018 - 2022")
    date_ranges = re.findall(r"(20\d{2})\s*[-–]\s*(20\d{2}|present|current)", text, re.IGNORECASE)
    total = 0.0
    from datetime import datetime
    current_year = datetime.now().year
    for start, end in date_ranges:
        end_year = current_year if end.lower() in ("present", "current") else int(end)
        total += max(0, end_year - int(start))

    return min(total, 40.0)  # Cap at 40 years


try:
    import spacy
    nlp = spacy.load("en_core_web_sm")
except Exception:
    nlp = None

def extract_education(text: str) -> dict:
    """Extract education entries from resume text using regex and keyword matching."""
    education = []

    # Improved patterns as requested
    degree_patterns = [
        (r"(?:Ph\.?D\.?|Doctor(?:ate)?)\s+(?:in\s+)?([A-Za-z\s&]+)?", "PhD", 4),
        (r"(?:M\.?S\.?|M\.?Sc\.?|Master(?:'s)?)\s+(?:in\s+|of\s+)?([A-Za-z\s&]+)?", "Master's", 3),
        (r"(?:M\.?B\.?A\.?)\s*(?:in\s+)?([A-Za-z\s&]*)?", "MBA", 3),
        (r"(?:M\.?\s*Tech\.?|M\.?Tech)\s*(?:in\s+)?([A-Za-z\s&]*)?", "M.Tech", 3),
        (r"(?:M\.?\s*Com\.?|M\.?Com)\s*(?:in\s+)?([A-Za-z\s&]*)?", "M.Com", 3),
        (r"(?:B\.?\s*Tech\.?|B\.?Tech|Bachelor\s+of\s+Technology)\s*(?:in\s+)?([A-Za-z\s&]*)?", "B.Tech", 2),
        (r"(?:B\.?E\.?|Bachelor\s+of\s+Engineering)\s*(?:in\s+)?([A-Za-z\s&]*)?", "B.Tech", 2),
        (r"(?:B\.?S\.?|B\.?Sc\.?|Bachelor(?:'s)?)\s+(?:in\s+|of\s+)?([A-Za-z\s&]+)?", "Bachelor's", 2),
        (r"(?:B\.?\s*Com\.?|B\.?Com|Bachelor\s+of\s+Commerce)\s*(?:in\s+)?([A-Za-z\s&]*)?", "B.Com", 2),
        (r"(?:B\.?B\.?A\.?|Bachelor\s+of\s+Business\s+Administration)\s*(?:in\s+)?([A-Za-z\s&]*)?", "BBA", 2),
        (r"(?:B\.?C\.?A\.?)\s*(?:in\s+)?([A-Za-z\s&]*)?", "BCA", 2),
        (r"(?:M\.?C\.?A\.?)\s*(?:in\s+)?([A-Za-z\s&]*)?", "MCA", 3),
        (r"(?:Diploma)\s+(?:in\s+)?([A-Za-z\s&]+)?", "Diploma", 1),
    ]


    lines = [line.strip() for line in text.split('\n') if line.strip()]
    
    for i, line in enumerate(lines):
        line_clean = line.strip()
        if len(line_clean) < 5: continue
        
        for pattern, degree_type, priority in degree_patterns:
            match = re.search(pattern, line_clean, re.IGNORECASE)
            if match:
                field = match.group(1).strip() if match.group(1) else ""
                # Clean up field if it caught too much
                field = re.split(r'[,|:-]', field)[0].strip()
                if not field or len(field) > 60 or len(field) < 2:
                    field = "" # Omit if garbage
                
                # Extract institute (Look for ORG in surrounding lines)
                context_lines = lines[max(0, i-2):min(len(lines), i+3)]
                institute = "Unknown Institute"
                
                if nlp:
                    context_text = " ".join(context_lines)
                    doc = nlp(context_text)
                    # Filter ORGs that sound like universities
                    org_keywords = ['university', 'college', 'institute', 'school', 'academy', 'technology', 'polytechnic', 'management', 'science', 'engineering']
                    orgs = [ent.text.strip() for ent in doc.ents if ent.label_ == "ORG" and any(w in ent.text.lower() for w in org_keywords)]
                    if orgs:
                        institute = orgs[0]
                
                if institute == "Unknown Institute":
                    for c_line in context_lines:
                        if any(w in c_line.lower() for w in ['university', 'college', 'institute', 'school', 'academy', 'technolog']):
                            # Use regex to clean the institute name from the line
                            clean_inst = re.split(r'[,|:-]', c_line)[0].strip()
                            if len(clean_inst) > 5 and len(clean_inst) < 100:
                                institute = clean_inst
                                break
                            
                # Extract year
                year = ""
                year_match = re.search(r'\b(20\d{2}|19\d{2})\b', line_clean)
                if year_match:
                    year = year_match.group(1)
                else:
                    # Look in surrounding lines
                    for c_line in context_lines:
                        ym = re.search(r'\b(20\d{2}|19\d{2})\b', c_line)
                        if ym:
                            year = ym.group(1)
                            break
                            
                education.append({
                    "degree": degree_type,
                    "field": field,
                    "institute": institute[:100],
                    "year": year,
                    "priority": priority
                })
                break

    # Deduplicate and sort (Keep highest priority and best institute for each degree type)
    seen = {}
    for edu in education:
        key = edu["degree"].upper()
        # Prefer entries with real field, institute, or year
        if key not in seen:
            seen[key] = edu
        else:
            if seen[key]["institute"] == "Unknown Institute" and edu["institute"] != "Unknown Institute":
                seen[key] = edu
            elif seen[key].get("year") == "" and edu.get("year") != "":
                seen[key] = edu
            elif seen[key]["field"] == "" and edu["field"] != "":
                seen[key] = edu

    unique_edu = list(seen.values())
    unique_edu.sort(key=lambda x: x["priority"], reverse=True)
    
    # Final filter: Omit if degree is Bachelor's but we have a B.Tech (more specific)
    final_edu = []
    has_specific_bachelor = any(d in ["B.Tech", "B.Com", "BBA", "BCA"] for d in [e["degree"] for e in unique_edu])
    for e in unique_edu:
        if e["degree"] == "Bachelor's" and has_specific_bachelor:
            continue
        final_edu.append(e)

    highest_education = final_edu[0]["degree"] if final_edu else None

    # Detect category
    category = "tech" if any(d in ["B.Tech", "M.Tech", "BCA", "MCA"] for d in [e["degree"] for e in final_edu]) else "business"
    if not any(d in ["B.Tech", "M.Tech", "BCA", "MCA", "MBA", "BBA", "B.Com"] for d in [e["degree"] for e in final_edu]):
        category = "arts"


    # Clean up results
    for edu in final_edu:
        if "priority" in edu: del edu["priority"]
        if edu["field"] == "": edu["field"] = "General"

    print(f"--- DEBUG: EDUCATION EXTRACTED: {len(final_edu)} items ---")
    
    return {
        "education": final_edu[:3], 
        "highest_education": highest_education,
        "education_category": category
    }




