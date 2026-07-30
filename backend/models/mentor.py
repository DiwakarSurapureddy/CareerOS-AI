"""
AI Career Mentor MongoDB Data Access Layer for CareerOS AI Backend.
Manages persistent storage and structured query operations for AI conversation logs in 'mentor_chats'.
Enforces strict user ownership isolation across all conversational histories and message appends.
"""

from datetime import datetime, timezone
from bson.objectid import ObjectId
import logging
from database import db_manager

logger = logging.getLogger(__name__)

class MentorChat:
    """
    MongoDB Data Model and Repository layer for AI Career Mentor conversations.
    Collection: 'mentor_chats'
    Schema:
      - user_id: str
      - conversation_id: str (UUID or unique string identifier)
      - title: str
      - messages: list of dicts {"role": "user"|"assistant", "content": str, "timestamp": str}
      - created_at: datetime
      - updated_at: datetime
    """

    COLLECTION_NAME = 'mentor_chats'
    _indexes_created = False

    @classmethod
    def get_collection(cls):
        """Helper to obtain the active MongoDB collection handle and ensure indexes exist."""
        coll = db_manager.get_collection(cls.COLLECTION_NAME)
        if coll is not None and not cls._indexes_created:
            try:
                coll.create_index([("user_id", 1), ("updated_at", -1)])
                coll.create_index([("conversation_id", 1)], unique=True)
                cls._indexes_created = True
                logger.debug("Successfully verified MongoDB indexes for mentor_chats.")
            except Exception as e:
                logger.warning(f"Notice during index creation on mentor_chats: {e}")
        return coll

    @classmethod
    def to_json_safe(cls, doc: dict) -> dict:
        """Convert MongoDB document datetimes and ObjectIds into JSON-serializable structures."""
        if not doc or not isinstance(doc, dict):
            return doc
        safe_doc = dict(doc)
        if "_id" in safe_doc:
            safe_doc["_id"] = str(safe_doc["_id"])
        for dt_key in ["created_at", "updated_at"]:
            if isinstance(safe_doc.get(dt_key), datetime):
                safe_doc[dt_key] = safe_doc[dt_key].isoformat()
        return safe_doc

    @classmethod
    def create_conversation(cls, user_id: str, conversation_id: str, title: str, initial_messages: list = None) -> tuple[bool, dict | str]:
        """
        Create and persist a brand-new conversational log in MongoDB for an authenticated user.
        """
        try:
            coll = cls.get_collection()
            if coll is None:
                return False, "Database connection is currently unavailable."

            now = datetime.now(timezone.utc)
            doc = {
                "user_id": str(user_id),
                "conversation_id": str(conversation_id),
                "title": title or "New Career Conversation",
                "messages": initial_messages or [],
                "created_at": now,
                "updated_at": now
            }

            result = coll.insert_one(doc)
            doc["_id"] = str(result.inserted_id)
            logger.info(f"Created new AI Mentor conversation {conversation_id} for user {user_id}")
            return True, cls.to_json_safe(doc)
        except Exception as e:
            logger.error(f"Failed to create mentor conversation for user {user_id}: {type(e).__name__} - {e}")
            return False, f"Database insert failed: {str(e)}"

    @classmethod
    def add_message_pair(cls, conversation_id: str, user_id: str, user_msg: dict, assistant_msg: dict) -> tuple[bool, str]:
        """
        Append a user query and assistant reply pair to an existing conversation log.
        Enforces user ownership validation before making modification.
        """
        try:
            coll = cls.get_collection()
            if coll is None:
                return False, "Database connection unavailable."

            now = datetime.now(timezone.utc)
            query = {"conversation_id": str(conversation_id), "user_id": str(user_id)}
            update_payload = {
                "$push": {"messages": {"$each": [user_msg, assistant_msg]}},
                "$set": {"updated_at": now}
            }

            result = coll.update_one(query, update_payload)
            if result.matched_count == 0:
                logger.warning(f"Unauthorized or non-existent conversation modification attempt for ID {conversation_id} by user {user_id}")
                return False, "Conversation record not found or access denied."

            return True, "Messages appended successfully."
        except Exception as e:
            logger.error(f"Error appending message pair to conversation {conversation_id}: {e}")
            return False, f"Database update failed: {str(e)}"

    @classmethod
    def get_user_conversations(cls, user_id: str) -> list[dict]:
        """
        Retrieve summary listing of all AI mentor chat sessions owned by the authenticated user,
        ordered by most recently active (updated_at DESC).
        """
        try:
            coll = cls.get_collection()
            if coll is None:
                return []

            cursor = coll.find(
                {"user_id": str(user_id)},
                {"_id": 0, "conversation_id": 1, "title": 1, "created_at": 1, "updated_at": 1, "messages": {"$slice": 1}}
            ).sort("updated_at", -1)

            conversations = []
            for doc in cursor:
                safe = cls.to_json_safe(doc)
                # Fallback title if empty
                if not safe.get("title") and safe.get("messages"):
                    first_content = safe["messages"][0].get("content", "")
                    safe["title"] = (first_content[:40] + "...") if len(first_content) > 40 else first_content
                safe.pop("messages", None) # Do not return heavy message arrays in list preview
                conversations.append(safe)

            return conversations
        except Exception as e:
            logger.error(f"Error querying user conversations for user {user_id}: {e}")
            return []

    @classmethod
    def get_by_id_and_user(cls, conversation_id: str, user_id: str) -> tuple[bool, dict | str]:
        """
        Retrieve complete chat session with message history by conversation_id,
        strictly verified against authenticated JWT user ownership.
        """
        try:
            coll = cls.get_collection()
            if coll is None:
                return False, "Database connection unavailable."

            query = {"conversation_id": str(conversation_id), "user_id": str(user_id)}
            doc = coll.find_one(query)
            if not doc:
                logger.warning(f"Unauthorized read attempt or missing conversation {conversation_id} for user {user_id}")
                return False, "Conversation record not found or access denied."

            return True, cls.to_json_safe(doc)
        except Exception as e:
            logger.error(f"Error fetching conversation details for {conversation_id}: {e}")
            return False, f"Query execution error: {str(e)}"

    @classmethod
    def delete_conversation(cls, conversation_id: str, user_id: str) -> tuple[bool, str]:
        """
        Delete a stored conversation and all historical messages, enforcing user ownership.
        """
        try:
            coll = cls.get_collection()
            if coll is None:
                return False, "Database connection unavailable."

            query = {"conversation_id": str(conversation_id), "user_id": str(user_id)}
            result = coll.delete_one(query)

            if result.deleted_count == 0:
                logger.warning(f"Unauthorized deletion attempt or missing conversation {conversation_id} for user {user_id}")
                return False, "Conversation not found or access denied."

            logger.info(f"User {user_id} deleted conversation {conversation_id} cleanly.")
            return True, "Conversation deleted successfully."
        except Exception as e:
            logger.error(f"Error deleting conversation {conversation_id}: {e}")
            return False, f"Database deletion failed: {str(e)}"
