import os
import logging
from flask import Blueprint, request, jsonify, g, send_file
from utils.auth import token_required
from services.resume_service import ResumeService
from models.resume import Resume

logger = logging.getLogger(__name__)

resume_bp = Blueprint('resume', __name__, url_prefix='/api/resume')

@resume_bp.route('/upload', methods=['POST'])
@token_required
def upload_resume():
    """
    Upload and parse a resume document (PDF, DOCX, TXT) via multipart/form-data.
    Requires header: Authorization: Bearer <JWT_TOKEN>
    Form parameter: file: <document>
    """
    if 'file' not in request.files:
        return jsonify({
            "success": False,
            "message": "No file parameter found in multipart/form-data request."
        }), 400
        
    file_obj = request.files['file']
    # Authenticated user ID strictly extracted from JWT token (never trust frontend param)
    user_id = g.current_user_id
    
    success, result_data, status_code = ResumeService.process_upload(file_obj, user_id)
    
    if not success:
        return jsonify({
            "success": False,
            "message": result_data
        }), status_code
        
    return jsonify({
        "success": True,
        "message": "Resume uploaded and parsed successfully",
        "data": result_data
    }), status_code

@resume_bp.route('', methods=['GET'])
@resume_bp.route('/', methods=['GET'])
@token_required
def get_user_resumes():
    """
    Retrieve all resumes belonging exclusively to the currently authenticated user.
    Requires header: Authorization: Bearer <JWT_TOKEN>
    """
    user_id = g.current_user_id
    resumes = Resume.find_by_user(user_id)
    
    return jsonify({
        "success": True,
        "message": "User resumes retrieved successfully",
        "data": {
            "resumes": resumes,
            "count": len(resumes)
        }
    }), 200

@resume_bp.route('/<resume_id>', methods=['GET'])
@token_required
def get_resume_details(resume_id):
    """
    Retrieve details and parsed data for a specific resume owned by the user.
    Requires header: Authorization: Bearer <JWT_TOKEN>
    """
    user_id = g.current_user_id
    doc = Resume.find_by_id(resume_id, user_id=user_id)
    
    if not doc:
        return jsonify({
            "success": False,
            "message": "Resume not found or access denied."
        }), 404
        
    return jsonify({
        "success": True,
        "message": "Resume details retrieved successfully",
        "data": Resume.to_json_safe(doc)
    }), 200

@resume_bp.route('/<resume_id>/file', methods=['GET'])
@token_required
def get_resume_file(resume_id):
    """
    Serve the raw resume file (PDF, DOCX, TXT) for previewing.
    Requires header: Authorization: Bearer <JWT_TOKEN>
    """
    user_id = g.current_user_id
    doc = Resume.find_by_id(resume_id, user_id=user_id)
    
    if not doc:
        return jsonify({
            "success": False,
            "message": "Resume not found or access denied."
        }), 404
        
    file_path = doc.get('file_path')
    if not file_path or not os.path.exists(file_path):
        return jsonify({
            "success": False,
            "message": "File not found on server."
        }), 404
        
    return send_file(file_path)

@resume_bp.route('/<resume_id>', methods=['DELETE'])
@token_required
def delete_resume(resume_id):
    """
    Delete a resume record and remove its physical file from disk storage. Only owner permitted.
    Requires header: Authorization: Bearer <JWT_TOKEN>
    """
    user_id = g.current_user_id
    success, msg, status_code = ResumeService.delete_resume(resume_id, user_id)
    
    if not success:
        return jsonify({
            "success": False,
            "message": msg
        }), status_code
        
    return jsonify({
        "success": True,
        "message": msg
    }), 200
