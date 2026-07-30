import logging
from datetime import datetime, timezone
import bcrypt
from bson.objectid import ObjectId
from pymongo.errors import DuplicateKeyError
from database import db_manager

logger = logging.getLogger(__name__)

class User:
    """MongoDB User Model and Data Access Layer."""
    COLLECTION_NAME = 'users'

    @classmethod
    def get_collection(cls):
        """Retrieve users MongoDB collection and enforce unique indexing on email."""
        collection = db_manager.get_collection(cls.COLLECTION_NAME)
        if collection is not None:
            try:
                collection.create_index("email", unique=True)
            except Exception as e:
                logger.warning(f"Could not verify email unique index on users collection: {e}")
        return collection

    @staticmethod
    def hash_password(password: str) -> str:
        """Securely hash a plaintext password using bcrypt with salt."""
        salt = bcrypt.gensalt()
        hashed = bcrypt.hashpw(password.encode('utf-8'), salt)
        return hashed.decode('utf-8')

    @staticmethod
    def verify_password(plain_password: str, password_hash: str) -> bool:
        """Verify a plaintext password against a stored bcrypt hash."""
        try:
            return bcrypt.checkpw(plain_password.encode('utf-8'), password_hash.encode('utf-8'))
        except Exception as e:
            logger.error(f"Error during bcrypt password verification: {e}")
            return False

    @classmethod
    def create(cls, name: str, email: str, password: str):
        """
        Create and persist a new user document in MongoDB.
        Returns (True, safe_user_dict) on success, or (False, error_msg) on failure.
        """
        collection = cls.get_collection()
        if collection is None:
            return False, "Database connection not active or initialized"

        clean_email = email.strip().lower()
        clean_name = name.strip()

        # Check if user already exists
        if cls.find_by_email(clean_email):
            return False, "An account with this email address already exists"

        now = datetime.now(timezone.utc)
        user_doc = {
            "name": clean_name,
            "email": clean_email,
            "password_hash": cls.hash_password(password),
            "created_at": now,
            "updated_at": now
        }

        try:
            result = collection.insert_one(user_doc)
            user_doc["_id"] = result.inserted_id
            return True, cls.to_json_safe(user_doc)
        except DuplicateKeyError:
            return False, "An account with this email address already exists"
        except Exception as e:
            logger.error(f"MongoDB insert failed during user creation: {e}")
            return False, "Failed to create account due to an internal server error"

    @classmethod
    def find_by_email(cls, email: str):
        """Find user document by email address (includes password_hash for authentication verification)."""
        collection = cls.get_collection()
        if collection is None:
            return None
        return collection.find_one({"email": email.strip().lower()})

    @classmethod
    def find_by_id(cls, user_id: str):
        """Find user document by string or ObjectId identifier."""
        collection = cls.get_collection()
        if collection is None:
            return None
        try:
            if not isinstance(user_id, ObjectId):
                user_id = ObjectId(user_id)
            return collection.find_one({"_id": user_id})
        except Exception as e:
            logger.warning(f"Invalid user ObjectId format requested: {user_id} -> {e}")
            return None

    @staticmethod
    def to_json_safe(user_doc: dict) -> dict:
        """Convert a MongoDB user document into a safe API response dictionary, stripping password_hash."""
        if not user_doc:
            return {}
        return {
            "id": str(user_doc["_id"]),
            "name": user_doc.get("name", ""),
            "email": user_doc.get("email", ""),
            "profile_image": user_doc.get("profile_image", "")
        }
