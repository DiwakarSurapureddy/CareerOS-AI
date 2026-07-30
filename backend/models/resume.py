import logging
from datetime import datetime, timezone
from bson.objectid import ObjectId
from database import db_manager

logger = logging.getLogger(__name__)

class Resume:
    """MongoDB Resume Model and Data Access Layer."""
    COLLECTION_NAME = 'resumes'

    @classmethod
    def get_collection(cls):
        return db_manager.get_collection(cls.COLLECTION_NAME)

    @classmethod
    def create(cls, user_id: str, original_filename: str, stored_filename: str, file_type: str, 
               file_path: str, extracted_text: str, parsed_data: dict):
        """Persist a newly uploaded and parsed resume document to MongoDB."""
        collection = cls.get_collection()
        if collection is None:
            return False, "Database connection is not initialized"

        now = datetime.now(timezone.utc)
        doc = {
            "user_id": str(user_id),
            "original_filename": original_filename,
            "stored_filename": stored_filename,
            "file_type": file_type.lower(),
            "file_path": file_path,
            "extracted_text": extracted_text,
            "parsed_data": parsed_data or {},
            "created_at": now,
            "updated_at": now
        }

        try:
            result = collection.insert_one(doc)
            doc["_id"] = result.inserted_id
            return True, cls.to_json_safe(doc)
        except Exception as e:
            logger.error(f"MongoDB insert error for resume: {e}")
            return False, str(e)

    @classmethod
    def find_by_user(cls, user_id: str):
        """Retrieve all resumes owned by a specific authenticated user."""
        collection = cls.get_collection()
        if collection is None:
            return []
        try:
            cursor = collection.find({"user_id": str(user_id)}).sort("created_at", -1)
            return [cls.to_json_safe(doc) for doc in cursor]
        except Exception as e:
            logger.error(f"Error querying user resumes: {e}")
            return []

    @classmethod
    def find_by_id(cls, resume_id: str, user_id: str = None):
        """Find a resume document by ID, optionally verifying user ownership."""
        collection = cls.get_collection()
        if collection is None:
            return None
        try:
            if not isinstance(resume_id, ObjectId):
                resume_id = ObjectId(resume_id)
            query = {"_id": resume_id}
            if user_id is not None:
                query["user_id"] = str(user_id)
            return collection.find_one(query)
        except Exception as e:
            logger.warning(f"Invalid resume ID format requested: {resume_id} -> {e}")
            return None

    @classmethod
    def delete(cls, resume_id: str, user_id: str = None) -> bool:
        """Delete a resume DB record, ensuring ownership."""
        collection = cls.get_collection()
        if collection is None:
            return False
        try:
            if not isinstance(resume_id, ObjectId):
                resume_id = ObjectId(resume_id)
            query = {"_id": resume_id}
            if user_id is not None:
                query["user_id"] = str(user_id)
            result = collection.delete_one(query)
            return result.deleted_count > 0
        except Exception as e:
            logger.error(f"Error deleting resume document: {e}")
            return False

    @staticmethod
    def to_json_safe(doc: dict) -> dict:
        """Convert MongoDB resume document to safe JSON dict, excluding internal storage paths."""
        if not doc:
            return {}
        created_at_val = doc.get("created_at", "")
        updated_at_val = doc.get("updated_at", "")
        return {
            "id": str(doc["_id"]),
            "resume_id": str(doc["_id"]),
            "user_id": str(doc.get("user_id", "")),
            "filename": doc.get("original_filename", ""),
            "file_type": doc.get("file_type", ""),
            "extracted_text_preview": (doc.get("extracted_text", "")[:350] + "...") if doc.get("extracted_text") else "",
            "parsed_data": doc.get("parsed_data", {}),
            "created_at": created_at_val.isoformat() if hasattr(created_at_val, "isoformat") else str(created_at_val),
            "updated_at": updated_at_val.isoformat() if hasattr(updated_at_val, "isoformat") else str(updated_at_val)
        }
