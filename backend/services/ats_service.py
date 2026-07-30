import re
import logging
from typing import Dict, Any, List, Set
from services.role_keywords import get_role_keywords, TECH_SYNONYMS

logger = logging.getLogger(__name__)

class ATSService:
    """
    Deterministic and explainable ATS (Applicant Tracking System) Analyzer.
    Evaluates resume parsing outputs and raw text against job roles across an 8-point weighted rubric.
    """

    @classmethod
    def analyze_resume(cls, resume_doc: dict, target_role_input: str) -> dict:
        """
        Execute deterministic ATS analysis against target role requirements.
        Returns dictionary containing scores, breakdowns, matched/missing keywords & skills,
        strengths, weaknesses, and actionable improvement suggestions.
        """
        role_def = get_role_keywords(target_role_input)
        target_role = role_def.get("title", target_role_input)
        
        raw_text = resume_doc.get("extracted_text", "") or ""
        parsed = resume_doc.get("parsed_data", {}) or {}
        text_lower = raw_text.lower()

        # Build set of explicit resume skills and vocabulary for matching
        resume_skill_items = set()
        for cat_obj in parsed.get("skills", []):
            for sk in cat_obj.get("items", []):
                resume_skill_items.add(sk.lower().strip())
                
        # Normalize text via synonym table for consistent matching
        normalized_text = cls._normalize_text(text_lower)

        # -------------------------------------------------------------------------
        # A. Keyword Match (30 points max)
        # -------------------------------------------------------------------------
        target_keywords = sorted(list(set(
            role_def.get("keywords", []) + 
            role_def.get("tools", []) + 
            role_def.get("frameworks", []) + 
            role_def.get("technologies", [])
        )))
        
        matched_kw, missing_kw = cls._match_items_against_text(target_keywords, normalized_text, resume_skill_items)
        kw_percentage = round((len(matched_kw) / max(len(target_keywords), 1)) * 100)
        kw_score = min(round((kw_percentage / 100.0) * 30), 30)

        # -------------------------------------------------------------------------
        # B. Skills Match (25 points max) - Required (17 pts) & Preferred (8 pts)
        # -------------------------------------------------------------------------
        req_skills = role_def.get("required_skills", [])
        pref_skills = role_def.get("preferred_skills", [])
        
        matched_req, missing_req = cls._match_items_against_text(req_skills, normalized_text, resume_skill_items)
        matched_pref, missing_pref = cls._match_items_against_text(pref_skills, normalized_text, resume_skill_items)

        total_target_skills = len(req_skills) + len(pref_skills)
        matched_skills_all = sorted(list(set(matched_req + matched_pref)))
        missing_skills_all = sorted(list(set(missing_req + missing_pref)))
        
        skills_percentage = round((len(matched_skills_all) / max(total_target_skills, 1)) * 100)
        
        req_score = round((len(matched_req) / max(len(req_skills), 1)) * 17.0)
        pref_score = round((len(matched_pref) / max(len(pref_skills), 1)) * 8.0)
        skills_score = min(req_score + pref_score, 25)

        # -------------------------------------------------------------------------
        # C. Resume Sections Completeness (15 points max)
        # -------------------------------------------------------------------------
        sections_score = 0
        has_contact = bool(parsed.get("email") or parsed.get("phone") or "email" in text_lower or "phone" in text_lower or "@" in raw_text)
        if has_contact:
            sections_score += 3
            
        has_summary = any(h in text_lower for h in ["summary", "profile", "objective", "about me", "executive summary", "overview"])
        if has_summary:
            sections_score += 2
            
        has_skills = len(parsed.get("skills", [])) > 0 or "skills" in text_lower or "technologies" in text_lower
        if has_skills:
            sections_score += 3
            
        has_edu = len(parsed.get("education", [])) > 0 or any(w in text_lower for w in ["education", "university", "college", "bachelor", "master", "degree", "b.s", "m.s"])
        if has_edu:
            sections_score += 3
            
        has_exp = len(parsed.get("experience", [])) > 0 or any(w in text_lower for w in ["experience", "work history", "employment", "intern", "developer", "engineer", "analyst"])
        if has_exp:
            sections_score += 2
            
        has_proj = len(parsed.get("projects", [])) > 0 or "projects" in text_lower
        if has_proj:
            sections_score += 1
            
        has_certs = len(parsed.get("certifications", [])) > 0 or any(w in text_lower for w in ["certifications", "certified", "certificate"])
        if has_certs:
            sections_score += 1
            
        sections_score = min(sections_score, 15)

        # -------------------------------------------------------------------------
        # D. Experience Relevance (10 points max)
        # -------------------------------------------------------------------------
        exp_items = parsed.get("experience", [])
        exp_score = 0
        if exp_items or has_exp:
            exp_score += 5  # Base points for professional experience presence
            exp_text = " ".join([f"{e.get('role', '')} {e.get('description', '')}" for e in exp_items]).lower()
            if not exp_text and "experience" in text_lower:
                parts = text_lower.split("experience", 1)
                exp_text = parts[1][:1200] if len(parts) > 1 else ""
                
            rel_matches = sum(1 for sk in (req_skills + target_keywords[:12]) if sk.lower() in (exp_text + text_lower))
            if rel_matches >= 3:
                exp_score += 5
            elif rel_matches >= 1:
                exp_score += 3
            else:
                exp_score += 1
        exp_score = min(exp_score, 10)

        # -------------------------------------------------------------------------
        # E. Education (5 points max)
        # -------------------------------------------------------------------------
        edu_items = parsed.get("education", [])
        edu_score = 0
        if edu_items or has_edu:
            edu_score += 3
            edu_text = " ".join([f"{ed.get('degree', '')} {ed.get('university', '')}" for ed in edu_items]).lower()
            if any(term in (edu_text + text_lower) for term in ["computer science", "engineering", "information technology", "data science", "mathematics", "physics", "bachelor", "master", "ph.d", "b.s", "m.s", "degree", "university", "college", "institute"]):
                edu_score += 2
        edu_score = min(edu_score, 5)

        # -------------------------------------------------------------------------
        # F. Projects (5 points max)
        # -------------------------------------------------------------------------
        proj_items = parsed.get("projects", [])
        proj_score = 0
        if proj_items or has_proj:
            proj_score += 3
            proj_text = " ".join([f"{p.get('title', '')} {p.get('description', '')}" for p in proj_items]).lower()
            if any(sk.lower() in (proj_text + text_lower) for sk in (req_skills + pref_skills + target_keywords[:10])):
                proj_score += 2
        proj_score = min(proj_score, 5)

        # -------------------------------------------------------------------------
        # G. Certifications (5 points max)
        # -------------------------------------------------------------------------
        cert_items = parsed.get("certifications", [])
        cert_score = 0
        if cert_items or has_certs:
            cert_score += 3
            cert_text = " ".join(cert_items).lower()
            if any(term in (cert_text + text_lower) for term in ["certified", "aws", "gcp", "azure", "google", "microsoft", "oracle", "kubernetes", "cisco", "professional", "associate", "practitioner"]):
                cert_score += 2
        cert_score = min(cert_score, 5)

        # -------------------------------------------------------------------------
        # H. Resume Formatting / Readability (5 points max)
        # -------------------------------------------------------------------------
        fmt_score = 0
        # 1. Reasonable text length (>100 chars)
        if len(raw_text.strip()) >= 100:
            fmt_score += 1
        # 2. No excessive special character clutter (<15% non-alphanumeric ratio)
        non_alphanumeric = re.sub(r'[A-Za-z0-9\s\.\,\:\;\-\(\)\|]', '', raw_text)
        if len(raw_text) > 0 and (len(non_alphanumeric) / len(raw_text)) < 0.15:
            fmt_score += 1
        # 3. Clear section headings presence
        headings_count = sum(1 for h in ["EDUCATION", "EXPERIENCE", "SKILLS", "PROJECTS", "CERTIFICATIONS", "SUMMARY", "Education", "Experience", "Skills", "Projects"] if h in raw_text)
        if headings_count >= 2:
            fmt_score += 1
        # 4. Readability: avoid excessively long unbroken paragraph blocks (<600 chars per line)
        lines = [line.strip() for line in raw_text.splitlines() if line.strip()]
        max_line_len = max([len(line) for line in lines]) if lines else 0
        if max_line_len < 600:
            fmt_score += 1
        # 5. Contact info and coherent layout detected
        if has_contact:
            fmt_score += 1
            
        fmt_score = min(fmt_score, 5)

        # -------------------------------------------------------------------------
        # Overall Score aggregation (100% deterministic & exact addition)
        # -------------------------------------------------------------------------
        score_breakdown = {
            "keyword_match": int(kw_score),
            "skills_match": int(skills_score),
            "section_completeness": int(sections_score),
            "experience_relevance": int(exp_score),
            "education": int(edu_score),
            "projects": int(proj_score),
            "certifications": int(cert_score),
            "formatting": int(fmt_score)
        }
        
        overall_score = sum(score_breakdown.values())
        overall_score = max(0, min(overall_score, 100))

        # -------------------------------------------------------------------------
        # Generate Actionable Strengths, Weaknesses, and Suggestions
        # -------------------------------------------------------------------------
        strengths = cls._generate_strengths(kw_percentage, matched_req, req_skills, exp_score, edu_score, proj_score, cert_score, fmt_score, target_role)
        weaknesses = cls._generate_weaknesses(kw_percentage, missing_req, missing_pref, has_summary, has_exp, has_proj, has_certs, sections_score, target_role)
        suggestions = cls._generate_suggestions(missing_req, missing_kw, has_summary, has_proj, has_certs, exp_items, fmt_score, target_role)

        return {
            "target_role": target_role,
            "overall_score": overall_score,
            "score_breakdown": score_breakdown,
            "matched_keywords": sorted(matched_kw),
            "missing_keywords": sorted(missing_kw),
            "keyword_match_percentage": int(kw_percentage),
            "matched_skills": matched_skills_all,
            "missing_skills": missing_skills_all,
            "skills_match_percentage": int(skills_percentage),
            "strengths": strengths,
            "weaknesses": weaknesses,
            "suggestions": suggestions
        }

    @classmethod
    def _normalize_text(cls, text: str) -> str:
        """Normalize common technology aliases and punctuation for accurate keyword evaluation."""
        normalized = text
        for variation, standard in TECH_SYNONYMS.items():
            pattern = re.compile(r'\b' + re.escape(variation) + r'\b', re.IGNORECASE)
            normalized = pattern.sub(standard, normalized)
        return normalized

    @classmethod
    def _match_items_against_text(cls, target_items: List[str], text_lower: str, resume_skills: Set[str]) -> tuple:
        matched = []
        missing = []
        for item in target_items:
            item_clean = item.strip().lower()
            norm_item = TECH_SYNONYMS.get(item_clean, item_clean)
            
            if (item_clean in resume_skills or norm_item in resume_skills or 
                re.search(r'\b' + re.escape(item_clean) + r'\b', text_lower) or 
                re.search(r'\b' + re.escape(norm_item) + r'\b', text_lower)):
                if item not in matched:
                    matched.append(item)
            else:
                if item not in missing:
                    missing.append(item)
        return matched, missing

    @staticmethod
    def _generate_strengths(kw_pct: int, matched_req: List[str], req_skills: List[str], exp_score: int, edu_score: int, proj_score: int, cert_score: int, fmt_score: int, role: str) -> List[str]:
        strengths = []
        if kw_pct >= 50:
            strengths.append(f"Strong keyword coverage ({kw_pct}%) aligning well with {role} requirements.")
        if len(matched_req) >= max(len(req_skills) - 1, 1):
            strengths.append(f"Possesses core required technical skills tailored for {role}.")
        if exp_score >= 8:
            strengths.append("Demonstrates relevant professional work experience containing target domain terminology.")
        if edu_score >= 4:
            strengths.append("Complete education section with academic degree qualifications verified.")
        if proj_score >= 4:
            strengths.append("Features technical projects showcasing real-world application of target technologies.")
        if cert_score >= 4:
            strengths.append("Includes recognized professional certifications or technical domain credentials.")
        if fmt_score >= 4:
            strengths.append("Clean, readable, and ATS-friendly resume formatting with accessible contact details.")
        if not strengths:
            strengths.append("Basic professional resume layout detected.")
        return strengths

    @staticmethod
    def _generate_weaknesses(kw_pct: int, missing_req: List[str], missing_pref: List[str], has_summary: bool, has_exp: bool, has_proj: bool, has_certs: bool, sec_score: int, role: str) -> List[str]:
        weaknesses = []
        if kw_pct < 50:
            weaknesses.append(f"Low keyword match percentage ({kw_pct}%) against {role} standards.")
        if missing_req:
            weaknesses.append(f"Missing essential required technical skills: {', '.join(missing_req[:4])}.")
        elif missing_pref and len(missing_pref) >= 3:
            weaknesses.append(f"Missing preferred technical competencies: {', '.join(missing_pref[:4])}.")
        if not has_summary:
            weaknesses.append("Missing an introductory Professional Summary or Executive Profile section.")
        if not has_exp:
            weaknesses.append("No detailed Work Experience or Employment History section detected.")
        if not has_proj:
            weaknesses.append("Lacks a dedicated Technical Projects portfolio section.")
        if not has_certs:
            weaknesses.append("No specialized certifications or professional learning credentials detected.")
        if sec_score < 10:
            weaknesses.append("Incomplete resume structure missing essential analytical sections.")
        return weaknesses

    @staticmethod
    def _generate_suggestions(missing_req: List[str], missing_kw: List[str], has_summary: bool, has_proj: bool, has_certs: bool, exp_items: list, fmt_score: int, role: str) -> List[str]:
        suggestions = []
        if missing_req:
            suggestions.append(f"If you genuinely possess proficiency in {', '.join(missing_req[:3])}, add these essential required technical skills explicitly to your Skills section.")
        if missing_kw and len(missing_kw) >= 3:
            suggestions.append(f"Integrate relevant target keywords naturally into your experience bullet points and project descriptions (e.g., {', '.join(missing_kw[:4])}).")
        if not has_summary:
            suggestions.append("Add a concise 3-4 line Professional Summary at the top of your resume highlighting your top technical expertise and career trajectory.")
        if exp_items and not any("%" in e.get("description", "") or "0" in e.get("description", "") for e in exp_items):
            suggestions.append("Enhance impact by quantifying your accomplishments with measurable metrics, percentages, and KPIs in your work experience bullet points.")
        if not has_proj:
            suggestions.append("Add a dedicated Projects section detailing technical solutions developed, tools utilized, and practical engineering outcomes.")
        if not has_certs:
            suggestions.append(f"Consider acquiring and listing recognized domain certifications relevant to {role}.")
        if fmt_score < 4:
            suggestions.append("Refine document layout by adopting clear section headings and keeping paragraph lengths concise for optimal ATS readability.")
        if not suggestions:
            suggestions.append("Continue maintaining clean formatting, routinely updating project portfolios, and tailoring keyword terminology directly to target job descriptions.")
        return suggestions
