import os
import uuid
import re
import logging
from werkzeug.utils import secure_filename
from bson.objectid import ObjectId
from flask import Blueprint, request, jsonify, current_app
from models.user import User
from utils.auth import generate_token, token_required, get_current_user
import requests as http_requests

logger = logging.getLogger(__name__)

auth_bp = Blueprint('auth', __name__, url_prefix='/api/auth')

EMAIL_REGEX = re.compile(r"^[a-zA-Z0-9_.+-]+@[a-zA-Z0-9-]+\.[a-zA-Z0-9-.]+$")

@auth_bp.route('/signup', methods=['POST'])
def signup():
    """
    Register a new user account.
    Expected JSON payload: { "name": "Full Name", "email": "user@example.com", "password": "securepassword" }
    """
    data = request.get_json(silent=True) or {}
    
    # Support flexible naming convention from UI forms (name, full_name, or fullName)
    name = data.get('name') or data.get('full_name') or data.get('fullName')
    email = data.get('email')
    password = data.get('password')
    
    # 1. Validate required fields
    if not name or not isinstance(name, str) or not name.strip():
        return jsonify({
            "success": False,
            "message": "Full Name is required."
        }), 400
        
    if not email or not isinstance(email, str) or not email.strip():
        return jsonify({
            "success": False,
            "message": "Email address is required."
        }), 400
        
    if not password or not isinstance(password, str) or not password.strip():
        return jsonify({
            "success": False,
            "message": "Password is required."
        }), 400
        
    if len(password) < 6:
        return jsonify({
            "success": False,
            "message": "Password must be at least 6 characters long."
        }), 400

    # 2. Validate email address syntax format
    if not EMAIL_REGEX.match(email.strip()):
        return jsonify({
            "success": False,
            "message": "Invalid email address format."
        }), 400

    # 3 & 4. Ensure uniqueness, hash password securely with bcrypt, & persist user in MongoDB
    created, result = User.create(name=name, email=email, password=password)
    
    if not created:
        status_code = 409 if "already exists" in str(result).lower() else 500
        return jsonify({
            "success": False,
            "message": result
        }), status_code

    # Generate initial authorization token for immediate login after registration
    token = generate_token(user_id=result['id'], email=result['email'])

    return jsonify({
        "success": True,
        "message": "User registered successfully",
        "data": {
            "token": token,
            "user": result
        }
    }), 201

@auth_bp.route('/login', methods=['POST'])
def login():
    """
    Authenticate an existing user account and issue a JWT bearer token.
    Expected JSON payload: { "email": "user@example.com", "password": "securepassword" }
    """
    data = request.get_json(silent=True) or {}
    
    email = data.get('email')
    password = data.get('password')
    
    if not email or not password:
        return jsonify({
            "success": False,
            "message": "Both email and password are required."
        }), 400

    # Find user document by email address
    user_doc = User.find_by_email(email)
    
    # Verify hashed password (using bcrypt checkpw) without revealing whether email or password failed
    if not user_doc or not User.verify_password(password, user_doc.get("password_hash", "")):
        return jsonify({
            "success": False,
            "message": "Invalid email or password"
        }), 401

    # Format user response cleanly without password exposure
    safe_user = User.to_json_safe(user_doc)
    
    # Generate JWT token
    token = generate_token(user_id=safe_user['id'], email=safe_user['email'])

    return jsonify({
        "success": True,
        "message": "Login successful",
        "data": {
            "token": token,
            "user": safe_user
        }
    }), 200

@auth_bp.route('/google', methods=['POST'])
def google_login():
    """
    Authenticate a user via Google OAuth access token.
    Expected JSON payload: { "access_token": "<GOOGLE_ACCESS_TOKEN>" }
    """
    data = request.get_json(silent=True) or {}
    access_token = data.get('access_token')
    
    if not access_token:
        return jsonify({
            "success": False,
            "message": "Google access token is required."
        }), 400

    try:
        # Fetch user info from Google
        user_info_resp = http_requests.get(
            'https://www.googleapis.com/oauth2/v3/userinfo',
            headers={'Authorization': f'Bearer {access_token}'}
        )
        if not user_info_resp.ok:
            return jsonify({
                "success": False,
                "message": "Failed to fetch user profile from Google."
            }), 401
            
        idinfo = user_info_resp.json()
        email = idinfo.get('email')
        name = idinfo.get('name')
        
        if not email:
            return jsonify({
                "success": False,
                "message": "Google account does not have an email associated."
            }), 400
            
        # Find user document by email
        user_doc = User.find_by_email(email)
        
        if not user_doc:
            # Create a new user automatically
            # We will use a random secure password for Google users since they don't have one
            random_password = uuid.uuid4().hex + uuid.uuid4().hex
            created, result = User.create(name=name or "Google User", email=email, password=random_password)
            if not created:
                return jsonify({
                    "success": False,
                    "message": "Failed to create Google user account."
                }), 500
            user_doc = User.find_by_email(email)
            
        # Format user response securely
        safe_user = User.to_json_safe(user_doc)
        
        # Generate JWT token
        jwt_token = generate_token(user_id=safe_user['id'], email=safe_user['email'])

        return jsonify({
            "success": True,
            "message": "Google login successful",
            "data": {
                "token": jwt_token,
                "user": safe_user
            }
        }), 200

    except Exception as e:
        logger.error(f"Google login error: {e}")
        return jsonify({
            "success": False,
            "message": "Google authentication failed."
        }), 500

@auth_bp.route('/me', methods=['GET'])
@token_required
def get_current_user_profile():
    """
    Protected route returning currently authenticated user details.
    Requires header: Authorization: Bearer <JWT_TOKEN>
    """
    user_info = get_current_user()
    if not user_info:
        return jsonify({
            "success": False,
            "message": "User session profile could not be located."
        }), 404

    return jsonify({
        "success": True,
        "message": "User profile retrieved successfully",
        "data": {
            "user": user_info
        }
    }), 200

@auth_bp.route('/logout', methods=['POST'])
def logout():
    """
    Stateless JWT logout confirmation endpoint.
    Instructs React frontend to purge stored JWT bearer token from storage.
    """
    return jsonify({
        "success": True,
        "message": "Logout successful. Please remove the stored JWT token from client storage."
    }), 200

@auth_bp.route('/avatar', methods=['POST'])
@token_required
def upload_avatar():
    """
    Upload a profile image.
    Requires header: Authorization: Bearer <JWT_TOKEN>
    """
    if 'avatar' not in request.files:
        return jsonify({"success": False, "message": "No avatar file provided."}), 400
        
    file = request.files['avatar']
    if file.filename == '':
        return jsonify({"success": False, "message": "No selected file."}), 400
        
    ext = file.filename.rsplit('.', 1)[-1].lower() if '.' in file.filename else ''
    if ext not in {'jpg', 'jpeg', 'png', 'webp'}:
        return jsonify({"success": False, "message": "Unsupported file format. Please upload JPG, PNG, or WebP."}), 415

    # Enforce maximum avatar size directly by reading file to memory or just letting Flask handle it via MAX_CONTENT_LENGTH.
    # To be safe against extremely large images, save with uuid prefix.
    filename = secure_filename(file.filename)
    if not filename:
        filename = f"avatar.{ext}"
    
    unique_filename = f"{uuid.uuid4().hex}_{filename}"
    upload_dir = os.path.join(current_app.static_folder, 'avatars')
    os.makedirs(upload_dir, exist_ok=True)
    file_path = os.path.join(upload_dir, unique_filename)
    
    try:
        file.save(file_path)
    except Exception as e:
        logger.error(f"Failed to save avatar: {e}")
        return jsonify({"success": False, "message": "Failed to save the image."}), 500

    # The image will be served statically from /static/avatars/
    image_url = f"/static/avatars/{unique_filename}"
    
    # Update MongoDB
    user_info = get_current_user()
    try:
        User.get_collection().update_one(
            {"_id": ObjectId(user_info["id"])},
            {"$set": {"profile_image": image_url}}
        )
    except Exception as e:
        logger.error(f"Failed to update profile image in DB: {e}")
        return jsonify({"success": False, "message": "Database update failed."}), 500

    # Return updated user
    updated_user = User.find_by_id(user_info["id"])
    safe_user = User.to_json_safe(updated_user)

    return jsonify({
        "success": True,
        "message": "Avatar uploaded successfully.",
        "data": {
            "user": safe_user
        }
    }), 200
