import logging
from flask import Blueprint, request, jsonify, g
from utils.auth import token_required
from models.resume import Resume
from models.ats import ATSAnalysis
from services.ats_service import ATSService

logger = logging.getLogger(__name__)

ats_bp = Blueprint('ats', __name__, url_prefix='/api/ats')

@ats_bp.route('/analyze', methods=['POST'])
@token_required
def analyze_resume():
    """
    Perform deterministic ATS scoring analysis on an uploaded resume against a target role.
    Requires header: Authorization: Bearer <JWT_TOKEN>
    Request JSON: {"resume_id": "<RESUME_ID>", "target_role": "Python Developer"}
    """
    data = request.get_json(silent=True) or {}
    resume_id = data.get('resume_id', '').strip()
    target_role = data.get('target_role', 'Software Engineer').strip()
    
    if not resume_id:
        return jsonify({
            "success": False,
            "message": "resume_id is a required parameter in the request body."
        }), 400
        
    user_id = g.current_user_id
    
    # Verify that the resume exists and belongs exclusively to the authenticated user
    resume_doc = Resume.find_by_id(resume_id, user_id=user_id)
    if not resume_doc:
        return jsonify({
            "success": False,
            "message": "Resume not found or access denied."
        }), 404

    try:
        # Execute deterministic ATS algorithm
        analysis_result = ATSService.analyze_resume(resume_doc, target_role)
        
        # Persist report in MongoDB
        created, db_res = ATSAnalysis.create(user_id, resume_id, analysis_result)
        if not created:
            return jsonify({
                "success": False,
                "message": f"Database persistence failed while recording ATS analysis: {db_res}"
            }), 500
            
        return jsonify({
            "success": True,
            "message": "ATS analysis completed successfully",
            "data": db_res
        }), 201
    except Exception as e:
        logger.error(f"Error executing ATS analysis on resume {resume_id}: {e}")
        return jsonify({
            "success": False,
            "message": f"An unexpected server error occurred during ATS evaluation: {str(e)}"
        }), 500

@ats_bp.route('/<analysis_id>', methods=['GET'])
@token_required
def get_analysis(analysis_id):
    """
    Retrieve an existing ATS analysis report by its unique analysis_id. Only owner allowed.
    Requires header: Authorization: Bearer <JWT_TOKEN>
    """
    user_id = g.current_user_id
    doc = ATSAnalysis.find_by_id(analysis_id, user_id=user_id)
    
    if not doc:
        return jsonify({
            "success": False,
            "message": "ATS analysis record not found or access denied."
        }), 404
        
    return jsonify({
        "success": True,
        "message": "ATS analysis report retrieved successfully",
        "data": ATSAnalysis.to_json_safe(doc)
    }), 200

@ats_bp.route('/resume/<resume_id>', methods=['GET'])
@token_required
def get_resume_history(resume_id):
    """
    Retrieve historical ATS analyses performed on a specific resume ID owned by the user.
    Requires header: Authorization: Bearer <JWT_TOKEN>
    """
    user_id = g.current_user_id
    
    # Validate ownership of parent resume document
    resume_doc = Resume.find_by_id(resume_id, user_id=user_id)
    if not resume_doc:
        return jsonify({
            "success": False,
            "message": "Resume not found or access denied."
        }), 404
        
    history = ATSAnalysis.find_by_resume(resume_id, user_id=user_id)
    
    return jsonify({
        "success": True,
        "message": "ATS analysis history retrieved successfully",
        "data": {
            "resume_id": resume_id,
            "history": history,
            "count": len(history)
        }
    }), 200
