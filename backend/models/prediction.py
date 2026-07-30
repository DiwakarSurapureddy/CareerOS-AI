"""
Career Prediction MongoDB Data Access Layer for CareerOS AI Backend.
Manages persistent storage, retrieval, and historical querying of career recommendations,
deterministic matching rubrics, salary estimates, and developmental roadmaps in 'career_predictions'.
Enforces strict user ownership isolation across all database operations.
"""

from datetime import datetime, timezone
from bson.objectid import ObjectId, InvalidId
from bson.errors import InvalidId as BsonInvalidId
import logging
from database import db_manager

logger = logging.getLogger(__name__)

class CareerPrediction:
    """
    Data model encapsulating AI-enriched career path predictions and deterministic metrics
    stored within the 'career_predictions' MongoDB collection.
    """

    COLLECTION_NAME = 'career_predictions'

    @classmethod
    def get_collection(cls):
        """Helper to obtain the active MongoDB collection handle."""
        return db_manager.get_collection(cls.COLLECTION_NAME)

    @classmethod
    def create(cls, user_id: str, resume_id: str, prediction_data: dict) -> tuple[bool, str]:
        """
        Persist a complete career prediction report in MongoDB.
        Stores AI recommendations alongside deterministic scores, salary ranges, and roadmaps.
        """
        try:
            coll = cls.get_collection()
            if coll is None:
                return False, "Database connection is currently unavailable."

            now = datetime.now(timezone.utc)
            doc = {
                "user_id": str(user_id),
                "resume_id": str(resume_id),
                "target_role": prediction_data.get("target_role", ""),
                "recommended_careers": prediction_data.get("recommended_careers", []),
                "career_match_scores": prediction_data.get("career_match_scores", {}),
                "salary_predictions": prediction_data.get("salary_predictions", []),
                "career_readiness": prediction_data.get("career_readiness", {}),
                "career_roadmap": prediction_data.get("career_roadmap", []),
                "created_at": now,
                "updated_at": now
            }
            
            res = coll.insert_one(doc)
            logger.info(f"Successfully inserted career prediction report {res.inserted_id} for user {user_id}")
            return True, str(res.inserted_id)

        except Exception as e:
            logger.error(f"MongoDB persistence failure during career prediction create: {type(e).__name__} - {e}")
            return False, "Database persistence failed for career prediction report."

    @classmethod
    def get_by_id_and_user(cls, prediction_id: str, user_id: str) -> tuple[bool, dict | str]:
        """
        Retrieve a specific career prediction report by ID, strictly verifying that
        the requesting user corresponds to the document owner.
        """
        try:
            coll = cls.get_collection()
            if coll is None:
                return False, "Database connection is currently unavailable."

            try:
                oid = ObjectId(prediction_id)
            except (InvalidId, BsonInvalidId, TypeError):
                return False, "Invalid career prediction ID format submitted."

            query = {"_id": oid, "user_id": str(user_id)}
            doc = coll.find_one(query)

            if not doc:
                logger.warning(f"Unauthorized or non-existent career prediction read attempt for ID {prediction_id} by user {user_id}")
                return False, "Career prediction record not found or access denied."

            return True, cls.to_json_safe(doc)

        except Exception as e:
            logger.error(f"Error retrieving career prediction {prediction_id}: {type(e).__name__} - {e}")
            return False, "Database retrieval error occurred while fetching career prediction."

    @classmethod
    def get_by_resume_and_user(cls, resume_id: str, user_id: str) -> tuple[bool, dict | str]:
        """
        Retrieve complete chronological prediction history associated with a specific uploaded resume,
        enforcing user ownership isolation.
        """
        try:
            coll = cls.get_collection()
            if coll is None:
                return False, "Database connection is currently unavailable."

            query = {"resume_id": str(resume_id), "user_id": str(user_id)}
            cursor = coll.find(query).sort("created_at", -1)
            
            results = [cls.to_json_safe(doc) for doc in cursor]
            return True, {
                "resume_id": str(resume_id),
                "history": results,
                "count": len(results)
            }

        except Exception as e:
            logger.error(f"Error retrieving career prediction history for resume {resume_id}: {type(e).__name__} - {e}")
            return False, "Database retrieval error occurred while fetching prediction history."

    @classmethod
    def to_json_safe(cls, doc: dict) -> dict:
        """Helper to format MongoDB ObjectId and UTC timestamps into serializable JSON representation."""
        if not doc:
            return {}
        result = dict(doc)
        if "_id" in result:
            result["prediction_id"] = str(result["_id"])
            del result["_id"]
        if "user_id" in result:
            result["user_id"] = str(result["user_id"])
        if "resume_id" in result:
            result["resume_id"] = str(result["resume_id"])
        if "created_at" in result and isinstance(result["created_at"], datetime):
            result["created_at"] = result["created_at"].isoformat()
        if "updated_at" in result and isinstance(result["updated_at"], datetime):
            result["updated_at"] = result["updated_at"].isoformat()
        return result
