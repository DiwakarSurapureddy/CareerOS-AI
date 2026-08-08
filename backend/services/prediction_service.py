"""
Career Prediction & Recommendation Service for CareerOS AI Backend.
Orchestrates deterministic weighted career competency scoring, career readiness evaluations,
market salary estimates, 6-phase developmental roadmaps, and Google Gemini AI enrichment.
"""

import math
import logging
from typing import Dict, Any, List
from services.career_roles import CAREER_ROLES, get_role_competency_profile, TECH_SYNONYMS
from services.salary_service import SalaryService
from services.career_roadmap_service import CareerRoadmapService
from services.gemini_service import GeminiService

logger = logging.getLogger(__name__)

class PredictionService:
    """
    Engine responsible for comprehensive career suitability evaluations, deterministic
    rubric scoring, salary predictions, readiness ratings, and AI recommendation blending.
    """

    @classmethod
    def _extract_candidate_skills(cls, resume_data: dict) -> list:
        """Extract and normalize candidate technical competencies using synonym tables."""
        parsed_skills = resume_data.get("skills") or []
        parsed_data = resume_data.get("parsed_data") or {}
        if not parsed_skills and isinstance(parsed_data, dict):
            parsed_skills = parsed_data.get("skills") or []
            
        raw_text = str(resume_data.get("extracted_text", "")).lower()
        
        # Build normalized candidate skills set
        candidate_skills = set()
        for item in parsed_skills:
            items_to_process = []
            if isinstance(item, dict):
                sub_items = item.get("items") or item.get("skills") or []
                if isinstance(sub_items, list):
                    items_to_process.extend([str(x) for x in sub_items if x])
            elif isinstance(item, str):
                items_to_process.append(item)

            for s_str in items_to_process:
                s_clean = s_str.strip()
                if not s_clean:
                    continue
                for k, aliases in TECH_SYNONYMS.items():
                    if any(s_clean.lower() == alias.lower() or alias.lower() in s_clean.lower() for alias in aliases):
                        candidate_skills.add(k)
                candidate_skills.add(s_clean)
            
        # Scan raw text against known TECH_SYNONYMS
        for canonical, aliases in TECH_SYNONYMS.items():
            for alias in aliases:
                # Add word boundary checking or simple substring check for significant aliases
                if len(alias) >= 3 and (f" {alias.lower()} " in f" {raw_text} " or f",{alias.lower()}," in f",{raw_text},"):
                    candidate_skills.add(canonical)
                    break
                    
        return list(candidate_skills)

    @classmethod
    def calculate_deterministic_match(cls, resume_data: dict, target_role: str, ats_data: dict = None, skillgap_data: dict = None) -> dict:
        """
        Calculate an explainable, transparent weighted scoring breakdown (0-100) based on:
        Required skills (30%), Preferred skills (15%), Projects (15%), Experience (15%),
        Education (10%), Certifications (5%), and ATS score (10%).
        """
        import re
        role_profile = get_role_competency_profile(target_role)
        cand_skills = [s.lower() for s in cls._extract_candidate_skills(resume_data)]
        raw_text = str(resume_data.get("extracted_text", "")).lower()
        parsed = resume_data.get("parsed_data") or {}
        
        # 1. Required Skills Match (0-100)
        req_list = role_profile.get("required_skills", [])
        matched_req = []
        for sk in req_list:
            sk_l = sk.lower()
            if sk_l in cand_skills or re.search(r'\b' + re.escape(sk_l) + r'\b', raw_text):
                matched_req.append(sk)
        req_match = int(round((len(matched_req) / max(len(req_list), 1)) * 100))
        req_match = min(max(req_match, 0), 100)
        
        # 2. Preferred Skills Match (0-100) - Matching any 5 preferred skills represents 100% benchmark proficiency
        pref_list = role_profile.get("preferred_skills", []) + role_profile.get("cloud_skills", []) + role_profile.get("tools", [])
        pref_list = list(set(pref_list) - set(req_list))
        matched_pref = []
        for sk in pref_list:
            sk_l = sk.lower()
            if sk_l in cand_skills or re.search(r'\b' + re.escape(sk_l) + r'\b', raw_text):
                matched_pref.append(sk)
        pref_target_cap = min(len(pref_list), 5)
        pref_match = int(round((len(matched_pref) / max(pref_target_cap, 1)) * 100))
        pref_match = min(max(pref_match, 0), 100)

        # 3. Project Relevance (0-100)
        projects = resume_data.get("projects") or (parsed.get("projects") if isinstance(parsed, dict) else []) or []
        num_proj = len(projects) if isinstance(projects, list) else 0
        keywords = role_profile.get("keywords", [])
        proj_hits = sum(1 for kw in keywords if re.search(r'\b' + re.escape(kw.lower()) + r'\b', raw_text))
        proj_rel = min(int(num_proj * 25 + (proj_hits * 10)), 100)
        if num_proj == 0 and proj_hits == 0:
            proj_rel = 15 if len(raw_text) < 300 else 40

        # 4. Experience Relevance (0-100)
        exp = resume_data.get("experience") or (parsed.get("experience") if isinstance(parsed, dict) else []) or []
        num_exp = len(exp) if isinstance(exp, list) else 0
        role_words = [w.lower() for w in role_profile.get("title", "").split() if len(w) > 2]
        exp_rel = min(int(num_exp * 35 + sum(25 for rw in role_words if re.search(r'\b' + re.escape(rw) + r'\b', raw_text))), 100)
        if num_exp == 0 and not any(rw in raw_text for rw in role_words):
            exp_rel = 20
        # Senior/Principal engineer indicators boost experience and compensate for unlisted academic toy projects
        if any(snr in raw_text[:600] for snr in ["senior", "principal", "lead", "architect", "5+ years", "8+ years", "10+ years", "12+ years"]):
            exp_rel = min(exp_rel + 30, 100)
            if proj_rel < 75:
                proj_rel = max(proj_rel, int(exp_rel * 0.85))

        # 5. Education Relevance (0-100)
        edu_str = str(parsed.get("education", "") if isinstance(parsed, dict) else "").lower() + " " + raw_text[:500]
        if any(deg in edu_str for deg in ["computer science", "software engineering", "data science", "informatics", "engineering", "b.s.", "bs", "master", "phd", "bachelor", "doctorate"]):
            edu_rel = 95
        elif any(deg in edu_str for deg in ["diploma", "associate", "bootcamp", "certificate", "college"]):
            edu_rel = 80
        else:
            edu_rel = 50

        # 6. Certification Relevance (0-100)
        cert_str = str(parsed.get("certifications", "") if isinstance(parsed, dict) else "").lower()
        if len(cert_str.strip()) > 5 and not any(none_val in cert_str for none_val in ["none", "null", "n/a"]):
            cert_rel = 90
        elif any(ck in raw_text for ck in ["certified", "aws certified", "gcp", "azure", "kubernetes", "ckad", "cissp", "scrum", "poker"]):
            cert_rel = 85
        else:
            cert_rel = 30

        # 7. ATS Score Alignment (0-100)
        if ats_data and isinstance(ats_data, dict) and "overall_score" in ats_data:
            ats_val = int(ats_data["overall_score"])
        elif skillgap_data and isinstance(skillgap_data, dict) and "skill_match_percentage" in skillgap_data:
            ats_val = int(skillgap_data["skill_match_percentage"])
        else:
            ats_val = int(round(max(req_match, (req_match * 0.7 + pref_match * 0.3))))
            ats_val = min(max(ats_val, 0), 100)

        # Weighted Formula Calculation
        overall_match = int(round(
            0.30 * req_match +
            0.15 * pref_match +
            0.15 * proj_rel +
            0.15 * exp_rel +
            0.10 * edu_rel +
            0.05 * cert_rel +
            0.10 * ats_val
        ))
        
        # Enforce 0 to 100 bounding
        overall_match = min(max(overall_match, 0), 100)
        
        return {
            "skill_match": req_match,
            "preferred_skill_match": pref_match,
            "project_relevance": proj_rel,
            "experience_relevance": exp_rel,
            "education_relevance": edu_rel,
            "certification_relevance": cert_rel,
            "ats_score": ats_val,
            "overall_match": overall_match,
            "matched_required_skills": matched_req,
            "missing_required_skills": [sk for sk in req_list if sk not in matched_req]
        }

    @classmethod
    def evaluate_career_readiness(cls, overall_match: int, req_match: int, proj_rel: int, exp_rel: int) -> dict:
        """
        Calculate career readiness percentage, classification level, strengths, and areas to improve
        without presenting results as guaranteed employment probability.
        """
        readiness_pct = int(round((overall_match * 0.6) + (req_match * 0.25) + (proj_rel * 0.15)))
        readiness_pct = min(max(readiness_pct, 0), 100)
        
        if readiness_pct >= 80:
            level = "Job Ready"
        elif readiness_pct >= 65:
            level = "Advanced"
        elif readiness_pct >= 50:
            level = "Intermediate"
        elif readiness_pct >= 35:
            level = "Developing"
        else:
            level = "Beginner"
            
        strengths = []
        if req_match >= 75:
            strengths.append("High alignment with core technical role competencies.")
        if proj_rel >= 70:
            strengths.append("Demonstrated relevance across engineering projects.")
        if exp_rel >= 70:
            strengths.append("Solid background in domain engineering responsibilities.")
        if not strengths:
            strengths.append("Foundational problem solving and technical motivation.")
            
        areas_to_improve = []
        if req_match < 70:
            areas_to_improve.append("Expand hands-on command of essential required domain frameworks.")
        if proj_rel < 65:
            areas_to_improve.append("Build complex, production-grade GitHub capstone projects.")
        if exp_rel < 60:
            areas_to_improve.append("Gain demonstrated containerization and cloud orchestration deployment practice.")
        if not areas_to_improve:
            areas_to_improve.append("Continue optimizing system scalability and interview system design proficiencies.")

        return {
            "percentage": readiness_pct,
            "level": level,
            "strengths": strengths,
            "areas_to_improve": areas_to_improve,
            "disclaimer": "Readiness level reflects documented technical skill alignment and does not constitute a guaranteed offer of employment or job placement."
        }

    @classmethod
    def generate_deterministic_recommendations(cls, resume_data: dict, target_role: str = None, ats_data: dict = None, skillgap_data: dict = None) -> List[dict]:
        """
        Evaluate candidate resume across all 13 supported career paths or the specified target role.
        Returns explainable career recommendation profiles complete with match % and next steps.
        """
        roles_to_eval = [target_role] if (target_role and target_role.strip()) else [k.title() for k in CAREER_ROLES.keys()]
        recs = []
        cand_skills_raw = cls._extract_candidate_skills(resume_data)
        cand_skills_lower = [s.lower() for s in cand_skills_raw]
        
        for role in roles_to_eval:
            role_title = role.strip().title()
            match_data = cls.calculate_deterministic_match(resume_data, role, ats_data, skillgap_data)
            score = match_data["overall_match"]
            
            profile = get_role_competency_profile(role)
            req_skills = profile.get("required_skills", [])
            pref_skills = profile.get("preferred_skills", [])
            all_target_skills = list(set(req_skills + pref_skills))
            
            curr_skills = [sk for sk in all_target_skills if sk.lower() in cand_skills_lower or sk.lower() in str(resume_data.get("extracted_text", "")).lower()]
            missing = [sk for sk in all_target_skills if sk not in curr_skills]
            
            if score >= 75:
                conf = "High"
                reason = f"Strong alignment ({score}%) across core {role_title} competencies and demonstrable engineering experience."
            elif score >= 55:
                conf = "Medium"
                reason = f"Solid foundational capabilities with moderate skill gaps in cloud/advanced tooling for {role_title}."
            else:
                conf = "Low"
                reason = f"Developing competency profile ({score}%); targeted study of required domain frameworks is recommended."
                
            next_steps = []
            for m_sk in missing[:2]:
                next_steps.append(f"Master {m_sk} through structured multi-stage practical implementation")
            if not next_steps:
                next_steps.append("Build scalable cloud production REST APIs")
            next_steps.append(f"Deploy an enterprise capstone project proving {role_title} readiness")
            if len(next_steps) < 3:
                next_steps.append("Optimize GitHub portfolio repository documentation and test coverage")
                
            recs.append({
                "career": profile.get("title", role_title),
                "match_percentage": score,
                "confidence": conf,
                "reason": reason,
                "current_skills": curr_skills[:6] if curr_skills else cand_skills_raw[:5] or ["Foundational Computing"],
                "missing_skills": missing[:6] if missing else ["Advanced Architecture / DevOps"],
                "required_skills": req_skills,
                "next_steps": next_steps[:4]
            })
            
        # Sort recommendations by match percentage descending
        recs.sort(key=lambda x: x["match_percentage"], reverse=True)
        return recs[:5] if not (target_role and target_role.strip()) else recs

    @classmethod
    def predict_career_path(cls, user_id: str, resume_id: str, resume_data: dict, target_role: str = None, ats_data: dict = None, skillgap_data: dict = None, test_simulation: str = None) -> dict:
        """
        Master integration pipeline executing deterministic career math, salary estimation,
        developmental roadmap construction, readiness evaluation, and optional Gemini AI synthesis.
        Guarantees fallback delivery if AI service encounters network or validation errors.
        """
        logger.info(f"Initiating Module 6 Career Prediction pipeline for user {user_id}, resume {resume_id}...")
        
        # 1. Deterministic Career Matching & Recommendation
        recs = cls.generate_deterministic_recommendations(resume_data, target_role, ats_data, skillgap_data)
        top_career = recs[0]["career"] if recs else "Software Engineer"
        top_match_pct = recs[0]["match_percentage"] if recs else 65
        top_curr_skills = recs[0]["current_skills"] if recs else []
        top_missing_skills = recs[0]["missing_skills"] if recs else []
        
        # Calculate full scoring rubric breakdown for top career
        match_scores = cls.calculate_deterministic_match(resume_data, top_career, ats_data, skillgap_data)
        
        # 2. Career Readiness Evaluation
        readiness = cls.evaluate_career_readiness(
            overall_match=match_scores["overall_match"],
            req_match=match_scores["skill_match"],
            proj_rel=match_scores["project_relevance"],
            exp_rel=match_scores["experience_relevance"]
        )
        
        # 3. Market Salary Predictions (Generate estimates for all recommended roles)
        salary_preds = []
        for r in recs:
            sal_est = SalaryService.predict_salary_range(
                target_role=r["career"],
                resume_data=resume_data,
                match_percentage=r["match_percentage"]
            )
            salary_preds.append(sal_est)
            
        # 4. Personalized 6-Phase Career Roadmap
        roadmap = CareerRoadmapService.generate_personalized_roadmap(
            target_role=top_career,
            matched_skills=top_curr_skills,
            missing_skills=top_missing_skills
        )

        # 5. Gemini AI Enrichment (Optional enrichment with seamless deterministic fallback)
        ai_context = {
            "target_role": target_role or top_career,
            "skills": cls._extract_candidate_skills(resume_data),
            "experience": resume_data.get("experience") or [],
            "education": str(resume_data.get("parsed_data", {}).get("education", "")),
            "projects": resume_data.get("projects") or [],
            "certifications": str(resume_data.get("parsed_data", {}).get("certifications", "")),
            "ats_score": ats_data.get("overall_score", match_scores["ats_score"]) if (ats_data and isinstance(ats_data, dict)) else match_scores["ats_score"],
            "skill_gap_summary": skillgap_data.get("skill_gap_summary", f"Candidate match for {top_career} is {top_match_pct}%.") if (skillgap_data and isinstance(skillgap_data, dict)) else f"Candidate match for {top_career} is {top_match_pct}%."
        }
        
        ai_success, ai_result = GeminiService.generate_career_predictions(ai_context, test_simulation)
        if ai_success and isinstance(ai_result, dict):
            logger.info("Integrating verified Google Gemini AI career insights into recommendation report...")
            ai_recs = ai_result.get("recommended_careers", [])
            if ai_recs and isinstance(ai_recs, list) and len(ai_recs) > 0:
                # Merge AI narratives while preserving deterministic mathematical boundaries
                for i, det_rec in enumerate(recs):
                    matching_ai = next((item for item in ai_recs if item.get("career", "").lower() == det_rec["career"].lower()), None)
                    if not matching_ai and i < len(ai_recs):
                        matching_ai = ai_recs[i]
                    if matching_ai and isinstance(matching_ai, dict):
                        det_rec["reason"] = matching_ai.get("reason", det_rec["reason"])
                        det_rec["transition_difficulty"] = matching_ai.get("transition_difficulty", "Moderate")
                        if matching_ai.get("next_steps") and isinstance(matching_ai.get("next_steps"), list):
                            det_rec["next_steps"] = matching_ai["next_steps"]
        else:
            logger.warning(f"Gemini AI Career Prediction unavailable or failed validation ({ai_result}). Serving clean deterministic predictions.")
            for r in recs:
                if "transition_difficulty" not in r:
                    r["transition_difficulty"] = "Low" if r["match_percentage"] >= 75 else ("Moderate" if r["match_percentage"] >= 55 else "High")

        # Enrich each recommendation item with frontend keys to avoid key mismatches
        for r in recs:
            r["title"] = r.get("career", "")
            r["role"] = r.get("career", "")
            r["role_name"] = r.get("career", "")
            r["description"] = r.get("reason", "")
            r["desc"] = r.get("reason", "")
            r["reasoning"] = r.get("reason", "")
            
            # Map skills
            skills_list = []
            if "current_skills" in r:
                skills_list.extend(r["current_skills"])
            if "missing_skills" in r:
                skills_list.extend([f"{s} (Missing)" for s in r["missing_skills"]])
            r["skills"] = skills_list
            r["required_skills"] = skills_list
            r["key_skills"] = skills_list
            
            # Lookup salary prediction
            matching_sal = next((s for s in salary_preds if s.get("target_role", "").lower() == r["career"].lower()), None)
            if matching_sal:
                r["salary_range"] = f"${matching_sal.get('min_salary', 0):,} - ${matching_sal.get('max_salary', 0):,}"
                r["salary"] = r["salary_range"]
                
        return {
            "user_id": str(user_id),
            "resume_id": str(resume_id),
            "target_role": target_role.strip() if target_role else "",
            "recommended_careers": recs,
            "recommended_roles": recs,
            "careers": recs,
            "predictions": recs,
            "career_match_scores": match_scores,
            "salary_predictions": salary_preds,
            "career_readiness": readiness,
            "career_roadmap": roadmap
        }
