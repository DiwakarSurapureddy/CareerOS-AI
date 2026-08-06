"""
AI Career Mentor Business Service and Context Aggregation Layer.
Orchestrates secure user context gathering from MongoDB (resumes, ATS scores, skill gaps, predictions),
enforces message limits, manages conversation histories, and invokes Google Gemini conversational AI.
Strictly isolates user credentials and guarantees zero password or secret token leakage.
"""

import uuid
import re
import logging
import time
from datetime import datetime, timezone
from bson.objectid import ObjectId
from concurrent.futures import ThreadPoolExecutor
from database import db_manager
from models.mentor import MentorChat
from services.gemini_service import GeminiService

logger = logging.getLogger(__name__)

class MentorService:
    """
    Service layer orchestrating conversational AI career mentor interactions.
    Handles personalized context extraction, message validation, title generation,
    and stateless chat history persistence in MongoDB.
    """

    MAX_MESSAGE_LENGTH = 2000
    MAX_HISTORY_TURNS = 5  # Cap memory to last 10 messages (5 turns)

    _context_cache = {}
    _gemini_cache = {}

    @classmethod
    def get_clean_user_context(cls, user_id: str, resume_id: str) -> dict:
        """
        Retrieve and aggregate relevant CareerOS profile information for the authenticated user and specific resume.
        Uses in-memory caching to avoid database queries if the data hasn't changed.
        """
        cache_key = f"{user_id}_{resume_id}"
        start_time = time.time()
        
        db = db_manager.get_db()
        if db is None:
            return {}

        try:
            # Quick check for last updated timestamp to invalidate cache
            resume_meta = db.resumes.find_one({"_id": ObjectId(resume_id), "user_id": str(user_id)}, {"updated_at": 1})
            if not resume_meta:
                return {}
            last_updated = resume_meta.get("updated_at")

            # Check cache validity
            if cache_key in cls._context_cache:
                cached_context, cached_updated = cls._context_cache[cache_key]
                if cached_updated == last_updated:
                    logger.info(f"[PERF] Context cache hit for key: {cache_key}")
                    return cached_context

            # If cache is stale or missing, concurrently query MongoDB collections
            clean_context = {
                "candidate_name": "",
                "target_role": "Software Engineer / Tech Professional",
                "current_skills": [],
                "missing_skills": [],
                "ats_score": None,
                "career_readiness": None,
                "recommended_careers": [],
                "career_roadmap_summary": [],
                "projects": [],
                "experience": [],
                "education": [],
                "certifications": []
            }

            def fetch_resume():
                return db.resumes.find_one({"_id": ObjectId(resume_id), "user_id": str(user_id)})
                
            def fetch_ats():
                return db.ats_analyses.find_one({"resume_id": str(resume_id), "user_id": str(user_id)}, sort=[("created_at", -1)])
                
            def fetch_skillgap():
                return db.skillgap_analyses.find_one({"resume_id": str(resume_id), "user_id": str(user_id)}, sort=[("created_at", -1)])
                
            def fetch_pred():
                return db.career_predictions.find_one({"resume_id": str(resume_id), "user_id": str(user_id)}, sort=[("created_at", -1)])

            with ThreadPoolExecutor(max_workers=4) as executor:
                f_resume = executor.submit(fetch_resume)
                f_ats = executor.submit(fetch_ats)
                f_skillgap = executor.submit(fetch_skillgap)
                f_pred = executor.submit(fetch_pred)
                
                resume_doc = f_resume.result()
                ats_doc = f_ats.result()
                skillgap_doc = f_skillgap.result()
                pred_doc = f_pred.result()

            mongo_time = time.time() - start_time
            logger.info(f"[PERF] MongoDB parallel fetch took {mongo_time:.4f}s")

            # Extract Resume details
            if resume_doc:
                clean_context["candidate_name"] = resume_doc.get("contact_info", {}).get("name", "")
                parsed = resume_doc.get("parsed_data", {})
                if isinstance(parsed, dict):
                    clean_context["experience"] = parsed.get("experience", [])
                    clean_context["projects"] = parsed.get("projects", [])
                    clean_context["education"] = parsed.get("education", [])
                    clean_context["certifications"] = parsed.get("certifications", [])
                    
                    skills_list = parsed.get("skills", [])
                    extracted_skills = set()
                    for sk in skills_list:
                        if isinstance(sk, dict):
                            for item in (sk.get("items", []) or []):
                                if item:
                                    extracted_skills.add(str(item).strip())
                        elif isinstance(sk, str) and sk.strip():
                            extracted_skills.add(sk.strip())
                    clean_context["current_skills"] = list(extracted_skills)[:20]

            # Extract ATS
            if ats_doc:
                clean_context["ats_score"] = ats_doc.get("overall_score", ats_doc.get("score"))
                if ats_doc.get("target_role"):
                    clean_context["target_role"] = ats_doc.get("target_role")

            # Extract Skill Gap
            if skillgap_doc:
                clean_context["missing_skills"] = skillgap_doc.get("missing_skills", [])[:15]
                if skillgap_doc.get("matched_skills") and not clean_context["current_skills"]:
                    clean_context["current_skills"] = skillgap_doc.get("matched_skills")[:20]
                if skillgap_doc.get("target_role") and clean_context["target_role"] == "Software Engineer / Tech Professional":
                    clean_context["target_role"] = skillgap_doc.get("target_role")

            # Extract Prediction
            if pred_doc:
                if pred_doc.get("target_role"):
                    clean_context["target_role"] = pred_doc.get("target_role")
                
                readiness_obj = pred_doc.get("career_readiness", {})
                if isinstance(readiness_obj, dict):
                    clean_context["career_readiness"] = readiness_obj.get("percentage", readiness_obj.get("level"))
                elif isinstance(readiness_obj, (int, str)):
                    clean_context["career_readiness"] = readiness_obj

                recs = pred_doc.get("recommended_careers", [])
                if isinstance(recs, list):
                    clean_context["recommended_careers"] = [r.get("career", str(r)) for r in recs if isinstance(r, dict)][:3]

                roadmap = pred_doc.get("career_roadmap", [])
                if isinstance(roadmap, list):
                    clean_context["career_roadmap_summary"] = [f"{p.get('phase', '')}: {p.get('title', '')}" for p in roadmap[:4] if isinstance(p, dict)]

            # Save to cache
            cls._context_cache[cache_key] = (clean_context, last_updated)
            context_build_time = time.time() - start_time - mongo_time
            logger.info(f"[PERF] Context build took {context_build_time:.4f}s")
            return clean_context

        except Exception as e:
            logger.warning(f"Error while aggregating AI mentor profile context: {e}")
            return clean_context

    @classmethod
    def generate_conversation_title(cls, first_message: str, target_role: str = None) -> str:
        """
        Generate a concise, human-readable conversation title.
        """
        clean = first_message.strip()
        prefixes = [r"^how (can|do|should) i\s+", r"^(what|which|where|when|why) (are|is|should|do)\s+", r"^can you (help|explain|tell)\s+", r"^tell me about\s+"]
        for p in prefixes:
            clean = re.sub(p, "", clean, flags=re.IGNORECASE)
        
        clean = re.sub(r"[\?\.\!]+$", "", clean).strip().title()
        if len(clean) < 4:
            return f"{target_role or 'Career'} Guidance Session" if target_role else "Career Guidance Session"
            
        return (clean[:38] + "...") if len(clean) > 38 else clean

    @classmethod
    def format_history_for_gemini(cls, all_messages: list) -> list:
        """
        Enforce safe token context window limits by selecting only the most recent conversational turns.
        """
        if not all_messages or not isinstance(all_messages, list):
            return []
        max_msgs = cls.MAX_HISTORY_TURNS * 2
        return all_messages[-max_msgs:] if len(all_messages) > max_msgs else all_messages

    @classmethod
    def process_user_message_stream(cls, user_id: str, message: str, conversation_id: str = None, resume_id: str = None, test_simulation: str = None):
        """
        Process user message in a streaming fashion.
        Measures database, context building, and Gemini generation times.
        """
        api_start_time = time.time()
        clean_msg = message.strip()
        msg_lower = clean_msg.lower()

        # Fast Greeting Short-Circuit (FAST MODE)
        GREETINGS = ["hi", "hello", "hey", "good morning", "good evening", "thanks", "thank you", "bye", "who are you?", "help"]
        if msg_lower in GREETINGS:
            if msg_lower in ["thanks", "thank you"]:
                ai_response = "You're welcome! Let me know if you need any more career guidance."
            elif msg_lower in ["bye"]:
                ai_response = "Goodbye! Best of luck with your career journey."
            else:
                ai_response = "Hello! I am your AI Career Mentor. I've loaded your selected resume and I'm ready to answer any questions about your career, skills, projects, or ATS optimization. How can I help you today?"
            
            now_iso = datetime.now(timezone.utc).isoformat()
            conv_id_str = str(conversation_id).strip() if conversation_id else str(uuid.uuid4())
            user_turn = {"role": "user", "content": clean_msg, "timestamp": now_iso}
            assistant_turn = {"role": "assistant", "content": ai_response, "timestamp": now_iso}
            
            if conversation_id and str(conversation_id).strip():
                MentorChat.add_message_pair(conv_id_str, user_id, user_turn, assistant_turn)
            else:
                MentorChat.create_conversation(user_id, conv_id_str, "Greeting Session", [user_turn, assistant_turn])

            yield ai_response
            total_time = time.time() - api_start_time
            logger.info(f"[PERF] FAST MODE Greeting. Total API Time: {total_time:.4f}s")
            return

        # Reply Cache Check
        cache_key = (str(resume_id), clean_msg.lower().strip())
        now_ts = time.time()
        if cache_key in cls._gemini_cache:
            reply_text, cached_ts = cls._gemini_cache[cache_key]
            if now_ts - cached_ts < 600:  # 10 minutes cache validity
                logger.info(f"[PERF] Serving cached response for question: {clean_msg}")
                yield reply_text
                
                # Persist messages in MongoDB
                now_iso = datetime.now(timezone.utc).isoformat()
                user_turn = {"role": "user", "content": clean_msg, "timestamp": now_iso}
                assistant_turn = {"role": "assistant", "content": reply_text, "timestamp": now_iso}
                conv_id_str = str(conversation_id).strip() if conversation_id else str(uuid.uuid4())
                if conversation_id and str(conversation_id).strip():
                    MentorChat.add_message_pair(conv_id_str, user_id, user_turn, assistant_turn)
                else:
                    MentorChat.create_conversation(user_id, conv_id_str, "Cached Session", [user_turn, assistant_turn])
                
                total_time = time.time() - api_start_time
                logger.info(f"[PERF] CACHE HIT. Total API Time: {total_time:.4f}s")
                return

        # Smart Intent Detection
        intent = "General Career Question"
        if any(w in msg_lower for w in ["ats", "score"]):
            intent = "ATS Question"
        elif any(w in msg_lower for w in ["skill", "gap", "missing", "weak", "strong"]):
            intent = "Skill Gap Question"
        elif any(w in msg_lower for w in ["project", "experience", "resume"]):
            intent = "Resume Question"
        elif any(w in msg_lower for w in ["predict", "ready", "role", "backend"]):
            intent = "Career Prediction"
        elif any(w in msg_lower for w in ["roadmap", "learn"]):
            intent = "Career Roadmap"

        # Fast Mode (No resume query) vs Smart Mode (Concurrent context query)
        context_start = time.time()
        if intent == "General Career Question":
            user_context = {}
            logger.info("[PERF] FAST MODE General Question: Bypassed resume context load.")
        else:
            user_context = cls.get_clean_user_context(user_id, resume_id) if resume_id else {}
            logger.info(f"[PERF] SMART MODE Question (Intent: {intent}): Loading resume context.")
        
        user_context["detected_intent"] = intent
        
        # Length Constraint Heuristics
        msg_len = len(clean_msg.split())
        if any(w in msg_lower for w in ["explain", "detail", "elaborate", "why", "how"]):
            length_instruction = "detailed"
        elif msg_len < 5:
            length_instruction = "concise"
        else:
            length_instruction = "advice"
        user_context["length_instruction"] = length_instruction
        
        context_time = time.time() - context_start

        # Conversation management and ownership validation
        is_new = False
        existing_messages = []
        conv_title = None

        if conversation_id and str(conversation_id).strip():
            conv_id_str = str(conversation_id).strip()
            ok, conv_doc = MentorChat.get_by_id_and_user(conv_id_str, user_id)
            if ok and isinstance(conv_doc, dict):
                existing_messages = conv_doc.get("messages", [])
                conv_title = conv_doc.get("title")
            else:
                is_new = True
        else:
            is_new = True
            conv_id_str = str(uuid.uuid4())

        if is_new:
            conv_title = cls.generate_conversation_title(clean_msg, user_context.get("target_role"))

        trimmed_history = cls.format_history_for_gemini(existing_messages)

        # Invoke Gemini AI mentor conversational streaming generation
        gemini_start = time.time()
        accumulated_reply = []
        
        try:
            for chunk in GeminiService.generate_mentor_reply_stream(
                user_message=clean_msg,
                history=trimmed_history,
                context=user_context,
                test_simulation=test_simulation
            ):
                accumulated_reply.append(chunk)
                yield chunk
        except Exception as e:
            logger.error(f"Gemini streaming exception: {e}")
            raise e

        gemini_time = time.time() - gemini_start
        full_reply = "".join(accumulated_reply)

        # Save Gemini reply to cache
        cls._gemini_cache[cache_key] = (full_reply, time.time())

        # Construct structured conversation turns
        now_iso = datetime.now(timezone.utc).isoformat()
        user_turn = {"role": "user", "content": clean_msg, "timestamp": now_iso}
        assistant_turn = {"role": "assistant", "content": full_reply, "timestamp": now_iso}

        # Persist messages in MongoDB
        if is_new:
            MentorChat.create_conversation(user_id, conv_id_str, conv_title, [user_turn, assistant_turn])
        else:
            MentorChat.add_message_pair(conv_id_str, user_id, user_turn, assistant_turn)

        total_time = time.time() - api_start_time
        # Log performance stats
        logger.info(
            f"[PERF] Message processed. Context Build Time: {context_time:.4f}s | "
            f"Gemini API Time: {gemini_time:.4f}s | Total API Time: {total_time:.4f}s"
        )
