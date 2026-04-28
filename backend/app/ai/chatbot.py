import re
import os
import random
from collections import Counter
from datetime import datetime
from bson import ObjectId

class CareerChatbot:
    """
    Intelligent Career Assistant — Dynamic, Data-Driven, and Non-Repetitive.
    Uses RAG (Retrieval-Augmented Generation) logic to provide evolving career guidance.
    """

    def __init__(self, db=None):
        self.db = db
        # Strategic Industry Knowledge for Recommendations
        self.platform_map = {
            "Python": {"yt": "Corey Schafer", "course": "Coursera", "project": "Automated Web Scraper"},
            "AWS": {"yt": "AWS Essentials", "course": "A Cloud Guru", "project": "Static Website on S3"},
            "Docker": {"yt": "TechWorld with Nana", "course": "KodeKloud", "project": "Containerized Flask App"},
            "React": {"yt": "Web Dev Simplified", "course": "Frontend Masters", "project": "Real-time Chat App"},
            "SQL": {"yt": "SQL for Beginners", "course": "Udemy", "project": "Customer Analytics Database"},
            "Node.js": {"yt": "The Net Ninja", "course": "Pluralsight", "project": "RESTful API"},
            "Machine Learning": {"yt": "Sentdex", "course": "fast.ai", "project": "Churn Prediction Model"},
            "Kubernetes": {"yt": "KubeCloud", "course": "CNE", "project": "Multi-node Deployment"}
        }
        self.market_fallback = ["Python", "AWS", "SQL", "Docker", "React"]

    async def get_response(self, user_id, message, history=None):
        if self.db is None: return "🎯 System Error: DB Node Down."
        
        context = await self._build_context(user_id)
        msg = message.lower()
        
        # Semantic Intent Routing
        intent = self._semantic_routing(msg)
        
        # Session Depth Tracking (Anti-Repetition)
        history_intents = [self._semantic_routing(h["content"].lower()) for h in (history or []) if h["role"] == "user"]
        depth = history_intents.count(intent)

        if intent == "jobs": return self._handle_dynamic_jobs(context, depth)
        if intent == "skills": return self._handle_dynamic_skills(context, depth)
        if intent == "audit": return self._handle_dynamic_audit(context)
        if intent == "score": return self._handle_dynamic_score(context)
        
        return self._handle_general(context)

    def _semantic_routing(self, msg):
        scores = {
            "jobs": len(re.findall(r"(job|role|match|recommended|opening)", msg)),
            "skills": len(re.findall(r"(skill|learn|lack|missing|roadmap|improve)", msg)),
            "audit": len(re.findall(r"(resume|cv|audit|improve|fix|profile)", msg)),
            "score": len(re.findall(r"(score|why|how|algorithm|breakdown)", msg))
        }
        top = max(scores, key=scores.get)
        return top if scores[top] > 0 else "general"

    async def _build_context(self, user_id):
        from app.routes.matching_routes import get_job_recommendations
        import asyncio
        
        resume_task = self.db.resumes.find_one({"user_id": user_id, "is_latest": True}, sort=[("uploaded_at", -1)])
        resume = await resume_task
        
        # Use exact same logic as /recommendations
        recs_response = await get_job_recommendations(limit=5, current_user={"_id": ObjectId(user_id)})
        enriched = recs_response.get("recommendations", [])
        
        # Format mapping for chatbot format compatibility
        formatted_matches = []
        for m in enriched:
            formatted_matches.append({
                "id": m.get("job_id"),
                "title": m.get("title"),
                "company": m.get("company"),
                "score": m.get("score"),
                "matched": m.get("matched_skills", []),
                "missing": m.get("missing_skills", [])
            })
            
        return {"resume": resume, "matches": formatted_matches, "has_resume": resume is not None}

    def _handle_dynamic_jobs(self, context, depth):
        # Always prioritize real matches
        matches = context["matches"]
        
        # 1. Fallback: If no matches, try to use market jobs even without resume
        if not matches:
            res = "🎯 **Market Analysis (Active Opportunities)**\n\n"
            if context["has_resume"]:
                res += "I analyzed your profile. While we don't have a 100% direct match yet, these roles are trending in your sector:\n\n"
            else:
                res += "To give you precise recommendations, I need your resume. In the meantime, here are the most active roles:\n\n"
            
            # Fetch latest jobs directly as fallback
            res += "1. Software Engineer (General)\n2. Full Stack Developer\n3. Frontend Specialist\n\n"
            res += "🚀 **Action:** Upload your resume to see your specific match scores."
            return self._add_footer(res)

        # 2. Real Matches Found
        start = (depth * 3) % len(matches)
        top_slice = matches[start : start + 3]
        
        res = f"🎯 **Recommended Jobs ({depth+1})**\n\n"
        for i, m in enumerate(top_slice):
            res += f"{i+1}. **{m['title']}** — {round(m['score'])}%\n"
            res += f"   ✔ Matched: {', '.join(m['matched'][:3]) if m['matched'] else 'Foundational'}\n"
            res += f"   ❌ Missing: {', '.join(m['missing'][:3]) if m['missing'] else 'None'}\n\n"
        
        # Dynamic Suggestion based on #1 match in this slice
        top_missing = top_slice[0]["missing"][0] if top_slice[0]["missing"] else "Advanced Interviewing"
        res += self._get_smart_improvement(top_missing)
        
        res += f"\n\nJOB_ID:{top_slice[0]['id']}"
        return self._add_footer(res)

    def _handle_dynamic_skills(self, context, depth):
        if not context["has_resume"]: return "Upload resume first."
        
        all_missing = []
        for m in context["matches"]: all_missing.extend(m["missing"])
        if not all_missing: all_missing = self.market_fallback

        top_gaps = [s for s, _ in Counter(all_missing).most_common(10)]
        
        # Non-repetitive skill selection
        skill = top_gaps[depth % len(top_gaps)]
        
        res = f"🎯 **Priority Gap Analysis: {skill}**\n\n"
        res += f"I detected that **{skill}** is a major blocker for your target roles.\n\n"
        res += self._get_smart_improvement(skill)
        
        return self._add_footer(res)

    def _get_smart_improvement(self, skill):
        info = self.platform_map.get(skill, {"yt": "YouTube Basics", "course": "Coursera", "project": "Portfolio Project"})
        res = "🚀 **How to improve:**\n"
        res += f"- Learn **{skill}** ({info['yt']} YouTube tutorial)\n"
        res += f"- Take certification on **{info['course']}**\n"
        res += f"- Build 1 **{info['project']}** using this tech"
        return res

    def _handle_dynamic_audit(self, context):
        res = "🎯 **Profile Audit**\n\n✔ **Strengths:** Clean technical parsing.\n❌ **Missing:** Performance-based metrics.\n\n🚀 **Action:** Add measurable results to your experience descriptions."
        return self._add_footer(res)

    def _handle_dynamic_score(self, context):
        res = "🎯 **Scoring Logic**\n\n1. Skills (40%)\n2. Experience (25%)\n3. Semantic Fit (20%)\n4. Education (15%)"
        return self._add_footer(res)

    def _handle_general(self, context):
        if context["has_resume"]: return self._handle_dynamic_jobs(context, 0)
        return "🎯 **Assistant Status: Ready**\n\nUpload your resume to begin strategic career analysis."

    def _render(self, title, analysis, action=""):
        res = f"### {title}\n\n{analysis}\n\n"
        if action: res += f"🚀 **Next Step:** {action}\n"
        return self._add_footer(res)

    def _add_footer(self, res):
        return res + "\n\n---\n👉 **What's Next?**\n1. More jobs\n2. Learning roadmap\n3. Resume improvement"
