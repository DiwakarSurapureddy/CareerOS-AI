"""
AI Career Mentor Business Service and Context Aggregation Layer.
Orchestrates secure user context gathering from MongoDB (resumes, ATS scores, skill gaps, predictions),
enforces message limits, manages conversation histories, and invokes Google Gemini conversational AI.
Strictly isolates user credentials and guarantees zero password or secret token leakage.
"""

import uuid
import re
import logging
from datetime import datetime, timezone
from bson.objectid import ObjectId, InvalidId
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
    MAX_HISTORY_TURNS = 6  # Restrict Gemini context payload to most recent 6 conversational pairs (12 messages)

    @classmethod
    def get_clean_user_context(cls, user_id: str) -> dict:
        """
        Retrieve and aggregate relevant CareerOS profile information for the authenticated user.
        CRITICAL SECURITY COVENANT: Explicitly strips all sensitive authentication data
        (passwords, password hashes, JWT tokens, email addresses, and server API keys).
        """
        clean_context = {
            "target_role": "Software Engineer / Tech Professional",
            "current_skills": [],
            "missing_skills": [],
            "ats_score": None,
            "career_readiness": None,
            "recommended_careers": [],
            "career_roadmap_summary": []
        }

        try:
            db = db_manager.get_db()
            if db is None:
                return clean_context

            # 1. Fetch latest uploaded resume for skill and document insight
            resume_doc = db.resumes.find_one({"user_id": str(user_id)}, sort=[("created_at", -1)])
            if resume_doc:
                parsed = resume_doc.get("parsed_data", {})
                if isinstance(parsed, dict):
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

            # 2. Fetch latest ATS evaluation score
            ats_doc = db.ats_analyses.find_one({"user_id": str(user_id)}, sort=[("created_at", -1)])
            if ats_doc:
                clean_context["ats_score"] = ats_doc.get("overall_score", ats_doc.get("score"))
                if ats_doc.get("target_role"):
                    clean_context["target_role"] = ats_doc.get("target_role")

            # 3. Fetch latest Skill Gap evaluation
            skillgap_doc = db.skillgap_analyses.find_one({"user_id": str(user_id)}, sort=[("created_at", -1)])
            if skillgap_doc:
                clean_context["missing_skills"] = skillgap_doc.get("missing_skills", [])[:15]
                if skillgap_doc.get("matched_skills") and not clean_context["current_skills"]:
                    clean_context["current_skills"] = skillgap_doc.get("matched_skills")[:20]
                if skillgap_doc.get("target_role") and clean_context["target_role"] == "Software Engineer / Tech Professional":
                    clean_context["target_role"] = skillgap_doc.get("target_role")

            # 4. Fetch latest Career Prediction and Roadmap metrics
            pred_doc = db.career_predictions.find_one({"user_id": str(user_id)}, sort=[("created_at", -1)])
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

        except Exception as e:
            logger.warning(f"Non-fatal error while aggregating AI mentor profile context for user {user_id}: {e}")

        return clean_context

    @classmethod
    def generate_conversation_title(cls, first_message: str, target_role: str = None) -> str:
        """
        Generate a concise, human-readable conversation title without invoking unnecessary Gemini token calls.
        """
        clean = first_message.strip()
        # Remove interrogative prefixes for clean titles
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
        Preserves stored MongoDB records untouched while optimizing Gemini API transmission bandwidth.
        """
        if not all_messages or not isinstance(all_messages, list):
            return []
        # Return only the latest N messages (2 * MAX_HISTORY_TURNS)
        max_msgs = cls.MAX_HISTORY_TURNS * 2
        return all_messages[-max_msgs:] if len(all_messages) > max_msgs else all_messages

    @classmethod
    def process_user_message(cls, user_id: str, message: str, conversation_id: str = None, test_simulation: str = None) -> tuple[bool, dict, int]:
        """
        Process incoming user conversational turn:
        1. Validate message boundaries (empty check, max 2000 length limit).
        2. Validate or initialize conversation record.
        3. Aggregate clean, sanitized user CareerOS metrics.
        4. Transmit prompt and bounded history to Gemini AI service.
        5. Persist message turns cleanly in MongoDB without crashing on upstream failures.
        """
        # 1. Strict input validation
        if not message or not isinstance(message, str) or not message.strip():
            logger.warning(f"AI Mentor chat request rejected for user {user_id}: Empty message.")
            return False, {"success": False, "message": "Message cannot be empty."}, 400

        if len(message) > cls.MAX_MESSAGE_LENGTH:
            logger.warning(f"AI Mentor chat request rejected for user {user_id}: Message exceeds limit ({len(message)} chars).")
            return False, {"success": False, "message": f"Message exceeds the maximum permitted length of {cls.MAX_MESSAGE_LENGTH} characters."}, 400

        clean_msg = message.strip()

        # 2. Conversation management and ownership validation
        is_new = False
        existing_messages = []
        conv_title = None

        if conversation_id and str(conversation_id).strip():
            conv_id_str = str(conversation_id).strip()
            ok, conv_doc = MentorChat.get_by_id_and_user(conv_id_str, user_id)
            if not ok or not isinstance(conv_doc, dict):
                logger.warning(f"Unauthorized chat attempt or invalid conversation ID {conv_id_str} by user {user_id}")
                return False, {"success": False, "message": "Conversation record not found or access denied."}, 404
            existing_messages = conv_doc.get("messages", [])
            conv_title = conv_doc.get("title")
        else:
            is_new = True
            conv_id_str = str(uuid.uuid4())

        # 3. Aggregate user profile career context
        user_context = cls.get_clean_user_context(user_id)
        if is_new:
            conv_title = cls.generate_conversation_title(clean_msg, user_context.get("target_role"))

        # 4. Format trimmed conversational history for AI prompt
        trimmed_history = cls.format_history_for_gemini(existing_messages)

        # 5. Invoke Gemini AI mentor conversational generation
        ok_ai, ai_response = GeminiService.generate_mentor_reply(
            user_message=clean_msg,
            history=trimmed_history,
            context=user_context,
            test_simulation=test_simulation
        )

        if not ok_ai:
            logger.error(f"AI Mentor service failure during chat generation for user {user_id}: {ai_response}")
            return False, {"success": False, "message": str(ai_response)}, 503

        # 6. Construct structured conversation turns with ISO timestamps
        now_iso = datetime.now(timezone.utc).isoformat()
        user_turn = {"role": "user", "content": clean_msg, "timestamp": now_iso}
        assistant_turn = {"role": "assistant", "content": ai_response, "timestamp": now_iso}

        # 7. Persist messages in MongoDB mentor_chats collection
        if is_new:
            save_ok, save_res = MentorChat.create_conversation(user_id, conv_id_str, conv_title, [user_turn, assistant_turn])
        else:
            save_ok, save_res = MentorChat.add_message_pair(conv_id_str, user_id, user_turn, assistant_turn)

        if not save_ok:
            logger.error(f"Database persistence failure for conversation {conv_id_str}: {save_res}")
            return False, {"success": False, "message": "Failed to persist chat messages in database."}, 500

        logger.info(f"Successfully synthesized and saved AI mentor chat response for conversation {conv_id_str}")

        # 8. Assemble clean JSON response matching standard project formatting
        return True, {
            "success": True,
            "message": "AI response generated successfully",
            "data": {
                "conversation_id": conv_id_str,
                "user_message": clean_msg,
                "assistant_message": ai_response,
                "timestamp": now_iso
            }
        }, 201 if is_new else 200
