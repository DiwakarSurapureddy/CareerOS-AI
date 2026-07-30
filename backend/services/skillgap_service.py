import re
import logging
from typing import Dict, Any, List, Set, Tuple
from services.career_roles import get_role_competency_profile, TECH_SYNONYMS
from services.gemini_service import GeminiService
from models.ats import ATSAnalysis

logger = logging.getLogger(__name__)

class SkillGapService:
    """
    Skill-Gap Analysis Engine for CareerOS AI.
    Combines explainable deterministic competency matching with structured Google Gemini AI roadmaps.
    """

    @classmethod
    def analyze_skill_gap(cls, resume_doc: dict, target_role_input: str, user_id: str, test_simulation: str = None) -> Tuple[bool, dict]:
        """
        Execute deterministic skill comparison and generate AI personalized development roadmaps.
        Returns (True, analysis_dict) on success, or (False, error_str) on failure.
        """
        role_profile = get_role_competency_profile(target_role_input)
        target_role = role_profile.get("title", target_role_input)

        raw_text = (resume_doc.get("extracted_text", "") or "").lower()
        parsed = resume_doc.get("parsed_data", {}) or {}
        resume_id = str(resume_doc.get("_id", ""))

        # 1. Comprehensive Skill Extraction & Normalization
        extracted_skills_dict, candidate_skill_set = cls.extract_normalized_skills(parsed, raw_text)

        # 2. Deterministic Skill Gap Calculation
        required_target = role_profile.get("required_skills", [])
        preferred_target = role_profile.get("preferred_skills", []) + role_profile.get("tools", []) + role_profile.get("cloud_skills", [])
        preferred_target = sorted(list(set(preferred_target) - set(required_target)))

        matched_req, missing_req = cls._compare_skill_list(required_target, candidate_skill_set, raw_text)
        matched_pref, missing_pref = cls._compare_skill_list(preferred_target, candidate_skill_set, raw_text)

        all_matched = sorted(list(set(matched_req + matched_pref)))
        all_missing = sorted(list(set(missing_req + missing_pref)))
        
        req_pct = round((len(matched_req) / max(len(required_target), 1)) * 100)
        pref_pct = round((len(matched_pref) / max(len(preferred_target), 1)) * 100)
        
        total_target = len(required_target) + len(preferred_target)
        overall_pct = round((len(all_matched) / max(total_target, 1)) * 100)
        overall_pct = max(0, min(overall_pct, 100))

        # Retrieve latest ATS score if available in database
        latest_ats = ATSAnalysis.find_by_resume(resume_id, user_id=user_id)
        ats_score_val = str(latest_ats[0].get("overall_score", "N/A")) if latest_ats else "N/A"

        # 3. Build context and invoke Gemini AI integration
        ai_context = {
            "target_role": target_role,
            "current_skills": extracted_skills_dict,
            "matched_skills": all_matched,
            "missing_skills": all_missing,
            "skill_match_percentage": overall_pct,
            "summary": cls._extract_resume_summary(raw_text),
            "experience": parsed.get("experience", []),
            "projects": parsed.get("projects", []),
            "education": parsed.get("education", []),
            "certifications": parsed.get("certifications", []),
            "ats_score": ats_score_val
        }

        ai_success, ai_result = GeminiService.generate_skill_gap_analysis(ai_context, test_simulation=test_simulation)
        if not ai_success:
            logger.error(f"Gemini AI Skill Gap Analysis failed for resume {resume_id}: {ai_result}")
            return False, {"message": str(ai_result)}

        # Merge deterministic computation with AI structured roadmaps
        final_analysis = {
            "target_role": target_role,
            "skill_match_percentage": overall_pct,
            "required_skill_match_percentage": req_pct,
            "preferred_skill_match_percentage": pref_pct,
            "matched_skills": all_matched,
            "missing_skills": all_missing,
            "partially_matched_skills": [],
            "current_skills": extracted_skills_dict,
            "priority_skills": ai_result.get("priority_skills", []),
            "skill_gap_summary": ai_result.get("skill_gap_summary", ""),
            "learning_roadmap": ai_result.get("learning_roadmap", []),
            "recommended_projects": ai_result.get("recommended_projects", []),
            "recommended_resources": ai_result.get("recommended_resources", []),
            "career_readiness": ai_result.get("career_readiness", {})
        }

        return True, final_analysis

    @classmethod
    def extract_normalized_skills(cls, parsed: dict, raw_text_lower: str) -> Tuple[dict, Set[str]]:
        """
        Extract categorized candidate competencies from parsed resume items and full text scanning,
        normalizing synonyms (e.g., React.js -> React, Node.js -> Node.js, Mongo DB -> MongoDB).
        """
        categories = {
            "Programming Languages": ["python", "javascript", "typescript", "java", "sql", "c++", "c#", "go", "ruby", "rust", "php", "bash", "r"],
            "Frameworks & Libraries": ["react", "django", "flask", "fastapi", "node.js", "express.js", "angular", "vue.js", "next.js", "spring boot", "pandas", "numpy", "scikit-learn", "tensorflow", "pytorch"],
            "Databases": ["postgresql", "mongodb", "mysql", "redis", "sqlite", "oracle", "bigquery", "snowflake", "pinecone", "chromadb"],
            "Cloud Technologies": ["aws", "gcp", "azure", "docker", "kubernetes", "vercel", "netlify", "sagemaker"],
            "Developer Tools": ["git", "docker", "kubernetes", "postman", "jira", "linux", "jenkins", "webpack", "vite", "pytest", "junit"],
            "AI/ML & Data Science": ["machine learning", "artificial intelligence", "deep learning", "nlp", "computer vision", "transformers", "rag", "llms", "data visualization", "tableau", "power bi"],
            "Soft Skills": ["communication", "problem solving", "team leadership", "agile", "scrum", "time management", "critical thinking", "collaboration"],
            "Certifications": []
        }
        
        found_by_cat = {cat: [] for cat in categories.keys()}
        candidate_set = set()

        for cat_obj in parsed.get("skills", []):
            for sk in cat_obj.get("items", []):
                norm = cls._normalize_single(sk)
                candidate_set.add(norm.lower())
                
        for cert in parsed.get("certifications", []):
            clean_cert = cert.strip()
            if clean_cert and clean_cert not in found_by_cat["Certifications"]:
                found_by_cat["Certifications"].append(clean_cert)
                candidate_set.add(clean_cert.lower())

        for cat_name, keywords in categories.items():
            if cat_name == "Certifications":
                continue
            for kw in keywords:
                kw_norm = cls._normalize_single(kw)
                kw_lower = kw_norm.lower()
                if kw_lower in candidate_set or re.search(r'\b' + re.escape(kw_lower) + r'\b', raw_text_lower):
                    if kw_norm not in found_by_cat[cat_name]:
                        found_by_cat[cat_name].append(kw_norm)
                    candidate_set.add(kw_lower)

        return found_by_cat, candidate_set

    @classmethod
    def _normalize_single(cls, item: str) -> str:
        """Apply TECH_SYNONYMS normalization table."""
        clean = item.strip().lower()
        if clean in TECH_SYNONYMS:
            return TECH_SYNONYMS[clean]
        if len(clean) <= 3 and clean in ["api", "sql", "aws", "gcp", "ml", "ai", "llm", "rag", "pwa", "dom", "etl", "jwt"]:
            return clean.upper()
        return item.strip().title()

    @classmethod
    def _compare_skill_list(cls, target_skills: List[str], candidate_set: Set[str], text_lower: str) -> Tuple[List[str], List[str]]:
        matched = []
        missing = []
        for sk in target_skills:
            sk_clean = cls._normalize_single(sk)
            sk_lower = sk_clean.lower()
            orig_lower = sk.strip().lower()
            if orig_lower in candidate_set or sk_lower in candidate_set or re.search(r'\b' + re.escape(sk_lower) + r'\b', text_lower) or re.search(r'\b' + re.escape(orig_lower) + r'\b', text_lower):
                if sk_clean not in matched:
                    matched.append(sk_clean)
            else:
                if sk_clean not in missing:
                    missing.append(sk_clean)
        return matched, missing

    @staticmethod
    def _extract_resume_summary(text_lower: str) -> str:
        for heading in ["summary", "profile", "objective", "about me", "overview"]:
            if heading in text_lower:
                parts = text_lower.split(heading, 1)
                if len(parts) > 1:
                    return parts[1][:500].strip()
        return "Seasoned technologist with proven command of professional software systems and domain engineering practices."
