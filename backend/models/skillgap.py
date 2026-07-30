import logging
from datetime import datetime, timezone
from bson.objectid import ObjectId
from database import db_manager

logger = logging.getLogger(__name__)

class SkillGapAnalysis:
    """MongoDB Skill Gap Analysis Model and Data Access Layer."""
    COLLECTION_NAME = 'skillgap_analyses'

    @classmethod
    def get_collection(cls):
        return db_manager.get_collection(cls.COLLECTION_NAME)

    @classmethod
    def create(cls, user_id: str, resume_id: str, analysis_data: dict):
        """Persist combined deterministic and AI-generated skill gap evaluation in MongoDB."""
        collection = cls.get_collection()
        if collection is None:
            return False, "Database connection is not initialized"

        now = datetime.now(timezone.utc)
        doc = {
            "user_id": str(user_id),
            "resume_id": str(resume_id),
            "target_role": analysis_data.get("target_role", "Software Engineer"),
            "skill_match_percentage": int(analysis_data.get("skill_match_percentage", 0)),
            "required_skill_match_percentage": int(analysis_data.get("required_skill_match_percentage", 0)),
            "preferred_skill_match_percentage": int(analysis_data.get("preferred_skill_match_percentage", 0)),
            "matched_skills": analysis_data.get("matched_skills", []),
            "missing_skills": analysis_data.get("missing_skills", []),
            "partially_matched_skills": analysis_data.get("partially_matched_skills", []),
            "priority_skills": analysis_data.get("priority_skills", []),
            "skill_gap_summary": analysis_data.get("skill_gap_summary", ""),
            "learning_roadmap": analysis_data.get("learning_roadmap", []),
            "recommended_projects": analysis_data.get("recommended_projects", []),
            "recommended_resources": analysis_data.get("recommended_resources", []),
            "career_readiness": analysis_data.get("career_readiness", {}),
            "created_at": now,
            "updated_at": now
        }

        try:
            result = collection.insert_one(doc)
            doc["_id"] = result.inserted_id
            return True, cls.to_json_safe(doc)
        except Exception as e:
            logger.error(f"Error persisting Skill Gap analysis document: {e}")
            return False, str(e)

    @classmethod
    def find_by_id(cls, analysis_id: str, user_id: str = None):
        """Retrieve a specific Skill Gap analysis report, enforcing strict user ownership check."""
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
        """Retrieve all historical Skill Gap analyses performed on a specific resume ID."""
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
            logger.error(f"Error querying Skill Gap history for resume {resume_id}: {e}")
            return []

    @staticmethod
    def to_json_safe(doc: dict) -> dict:
        """Convert MongoDB document to safe serializable JSON representation."""
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
            "skill_match_percentage": int(doc.get("skill_match_percentage", 0)),
            "required_skill_match_percentage": int(doc.get("required_skill_match_percentage", 0)),
            "preferred_skill_match_percentage": int(doc.get("preferred_skill_match_percentage", 0)),
            "matched_skills": doc.get("matched_skills", []),
            "missing_skills": doc.get("missing_skills", []),
            "partially_matched_skills": doc.get("partially_matched_skills", []),
            "priority_skills": doc.get("priority_skills", []),
            "skill_gap_summary": doc.get("skill_gap_summary", ""),
            "learning_roadmap": doc.get("learning_roadmap", []),
            "recommended_projects": doc.get("recommended_projects", []),
            "recommended_resources": doc.get("recommended_resources", []),
            "career_readiness": doc.get("career_readiness", {}),
            "created_at": created_at_val.isoformat() if hasattr(created_at_val, "isoformat") else str(created_at_val),
            "updated_at": updated_at_val.isoformat() if hasattr(updated_at_val, "isoformat") else str(updated_at_val)
        }
