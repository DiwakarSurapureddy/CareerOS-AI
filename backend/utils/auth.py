import logging
from datetime import datetime, timedelta, timezone
from functools import wraps
import jwt
from flask import request, jsonify, current_app, g
from models.user import User

logger = logging.getLogger(__name__)

def generate_token(user_id: str, email: str) -> str:
    """
    Generate an encrypted JSON Web Token encoding user identity and expiration.
    """
    secret = current_app.config.get("JWT_SECRET", "default_jwt_secret")
    exp_hours = current_app.config.get("JWT_EXPIRATION_HOURS", 24)
    
    now = datetime.now(timezone.utc)
    expiration = now + timedelta(hours=exp_hours)
    
    payload = {
        "sub": str(user_id),
        "email": email,
        "iat": now.timestamp(),
        "exp": expiration.timestamp()
    }
    
    token = jwt.encode(payload, secret, algorithm="HS256")
    if isinstance(token, bytes):
        token = token.decode('utf-8')
    return token

def verify_token(token: str):
    """
    Verify and decode a JWT token string.
    Returns (True, decoded_payload) on success, or (False, error_msg) on failure/expiration.
    """
    secret = current_app.config.get("JWT_SECRET", "default_jwt_secret")
    try:
        payload = jwt.decode(token, secret, algorithms=["HS256"])
        return True, payload
    except jwt.ExpiredSignatureError:
        return False, "Your session has expired. Please log in again."
    except jwt.InvalidTokenError as e:
        logger.warning(f"Invalid token signature submitted: {e}")
        return False, "Invalid authentication token."
    except Exception as e:
        logger.error(f"Token verification anomaly: {e}")
        return False, "Failed to verify authorization token."

def get_current_user():
    """
    Retrieve the current authenticated safe user dict from Flask runtime context.
    """
    return getattr(g, 'current_user', None)

def token_required(f):
    """
    Route decoration to secure endpoints requiring Bearer JWT authentication in the Authorization header.
    """
    @wraps(f)
    def decorated(*args, **kwargs):
        auth_header = request.headers.get("Authorization", None)
        
        if not auth_header:
            return jsonify({
                "success": False,
                "message": "Authorization header is missing. Expected: Bearer <JWT_TOKEN>"
            }), 401
            
        parts = auth_header.split()
        if len(parts) != 2 or parts[0].lower() != "bearer":
            return jsonify({
                "success": False,
                "message": "Invalid authorization header format. Expected: Bearer <JWT_TOKEN>"
            }), 401
            
        token = parts[1]
        is_valid, result = verify_token(token)
        if not is_valid:
            return jsonify({
                "success": False,
                "message": result
            }), 401
            
        user_id = result.get("sub")
        if not user_id:
            return jsonify({
                "success": False,
                "message": "Invalid token payload structure (missing subject identifier)."
            }), 401
            
        user_doc = User.find_by_id(user_id)
        if not user_doc:
            return jsonify({
                "success": False,
                "message": "The user associated with this authentication token no longer exists."
            }), 401
            
        # Store safe serialized user in request global scope
        g.current_user = User.to_json_safe(user_doc)
        g.current_user_id = str(user_doc["_id"])
        
        return f(*args, **kwargs)
    return decorated
