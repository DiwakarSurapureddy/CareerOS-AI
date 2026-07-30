import logging
from datetime import datetime, timezone
from bson.objectid import ObjectId
from database import db_manager

logger = logging.getLogger(__name__)

class ATSAnalysis:
    """MongoDB ATS Analysis Model and Data Access Layer."""
    COLLECTION_NAME = 'ats_analyses'

    @classmethod
    def get_collection(cls):
        return db_manager.get_collection(cls.COLLECTION_NAME)

    @classmethod
    def create(cls, user_id: str, resume_id: str, analysis_results: dict):
        """Persist a new ATS analysis evaluation report in MongoDB."""
        collection = cls.get_collection()
        if collection is None:
            return False, "Database connection is not initialized"

        now = datetime.now(timezone.utc)
        doc = {
            "user_id": str(user_id),
            "resume_id": str(resume_id),
            "target_role": analysis_results.get("target_role", "Software Engineer"),
            "overall_score": int(analysis_results.get("overall_score", 0)),
            "score_breakdown": analysis_results.get("score_breakdown", {}),
            "matched_keywords": analysis_results.get("matched_keywords", []),
            "missing_keywords": analysis_results.get("missing_keywords", []),
            "matched_skills": analysis_results.get("matched_skills", []),
            "missing_skills": analysis_results.get("missing_skills", []),
            "keyword_match_percentage": int(analysis_results.get("keyword_match_percentage", 0)),
            "skills_match_percentage": int(analysis_results.get("skills_match_percentage", 0)),
            "strengths": analysis_results.get("strengths", []),
            "weaknesses": analysis_results.get("weaknesses", []),
            "suggestions": analysis_results.get("suggestions", []),
            "created_at": now,
            "updated_at": now
        }

        try:
            result = collection.insert_one(doc)
            doc["_id"] = result.inserted_id
            return True, cls.to_json_safe(doc)
        except Exception as e:
            logger.error(f"Error persisting ATS analysis record: {e}")
            return False, str(e)

    @classmethod
    def find_by_id(cls, analysis_id: str, user_id: str = None):
        """Retrieve a specific ATS analysis document, enforcing user ownership check."""
        collection = cls.get_collection()
        if collection is None:
            return None
        try:
            if not isinstance(analysis_id, ObjectId):
                analysis_id = ObjectId(analysis_id)
            query = {"_id": analysis_id}
            if user_id is not None:
                query["user_id"] = str(user_id)
            return collection.find_one(query)
        except Exception as e:
            logger.warning(f"Invalid analysis ID requested: {analysis_id} -> {e}")
            return None

    @classmethod
    def find_by_resume(cls, resume_id: str, user_id: str = None):
        """Retrieve all historical ATS analyses performed on a specific resume ID."""
        collection = cls.get_collection()
        if collection is None:
            return []
        try:
            query = {"resume_id": str(resume_id)}
            if user_id is not None:
                query["user_id"] = str(user_id)
            cursor = collection.find(query).sort("created_at", -1)
            return [cls.to_json_safe(doc) for doc in cursor]
        except Exception as e:
            logger.error(f"Error querying ATS history for resume {resume_id}: {e}")
            return []

    @staticmethod
    def to_json_safe(doc: dict) -> dict:
        """Convert MongoDB ATS analysis document into safe, JSON-serializable dictionary."""
        if not doc:
            return {}
        created_at_val = doc.get("created_at", "")
        updated_at_val = doc.get("updated_at", "")
        return {
            "id": str(doc["_id"]),
            "analysis_id": str(doc["_id"]),
            "user_id": str(doc.get("user_id", "")),
            "resume_id": str(doc.get("resume_id", "")),
            "target_role": doc.get("target_role", ""),
            "overall_score": int(doc.get("overall_score", 0)),
            "score_breakdown": doc.get("score_breakdown", {}),
            "matched_keywords": doc.get("matched_keywords", []),
            "missing_keywords": doc.get("missing_keywords", []),
            "matched_skills": doc.get("matched_skills", []),
            "missing_skills": doc.get("missing_skills", []),
            "keyword_match_percentage": int(doc.get("keyword_match_percentage", 0)),
            "skills_match_percentage": int(doc.get("skills_match_percentage", 0)),
            "strengths": doc.get("strengths", []),
            "weaknesses": doc.get("weaknesses", []),
            "suggestions": doc.get("suggestions", []),
            "created_at": created_at_val.isoformat() if hasattr(created_at_val, "isoformat") else str(created_at_val),
            "updated_at": updated_at_val.isoformat() if hasattr(updated_at_val, "isoformat") else str(updated_at_val)
        }
