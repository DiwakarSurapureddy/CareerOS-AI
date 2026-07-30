import logging
from flask import Blueprint, request, jsonify, g
from utils.auth import token_required
from models.resume import Resume
from models.skillgap import SkillGapAnalysis
from services.skillgap_service import SkillGapService

logger = logging.getLogger(__name__)

skillgap_bp = Blueprint('skillgap', __name__, url_prefix='/api/skill-gap')

@skillgap_bp.route('/analyze', methods=['POST'])
@token_required
def analyze_skill_gap():
    """
    Perform deterministic competency comparison and Gemini AI career readiness roadmapping.
    Requires header: Authorization: Bearer <JWT_TOKEN>
    Request JSON: {"resume_id": "<RESUME_ID>", "target_role": "Python Developer"}
    """
    data = request.get_json(silent=True) or {}
    resume_id = data.get('resume_id', '').strip()
    target_role = data.get('target_role', 'Software Engineer').strip()
    test_simulation = data.get('test_simulation', None)
    
    if not resume_id:
        return jsonify({
            "success": False,
            "message": "resume_id is a required parameter in the request body."
        }), 400
        
    user_id = g.current_user_id
    
    # Verify resume exists and belongs strictly to the authenticated user
    resume_doc = Resume.find_by_id(resume_id, user_id=user_id)
    if not resume_doc:
        return jsonify({
            "success": False,
            "message": "Resume not found or access denied."
        }), 404

    try:
        # Execute combined deterministic and AI-powered skill gap analysis
        success, analysis_result = SkillGapService.analyze_skill_gap(resume_doc, target_role, user_id=user_id, test_simulation=test_simulation)
        if not success:
            err_msg = analysis_result.get("message", "Unable to generate skill gap analysis") if isinstance(analysis_result, dict) else str(analysis_result)
            status_code = 503 if ("timeout" in err_msg.lower() or "volume" in err_msg.lower() or "service" in err_msg.lower()) else 500
            if "key is not configured" in err_msg.lower() or "not configured" in err_msg.lower():
                status_code = 400
            return jsonify({
                "success": False,
                "message": err_msg
            }), status_code

        # Persist verified structured report in MongoDB
        created, db_res = SkillGapAnalysis.create(user_id, resume_id, analysis_result)
        if not created:
            return jsonify({
                "success": False,
                "message": f"Database persistence failed while recording Skill Gap analysis: {db_res}"
            }), 500
            
        return jsonify({
            "success": True,
            "message": "Skill gap analysis completed successfully",
            "data": db_res
        }), 201
    except Exception as e:
        logger.error(f"Error executing Skill Gap analysis on resume {resume_id}: {e}")
        return jsonify({
            "success": False,
            "message": "Unable to generate skill gap analysis"
        }), 500

@skillgap_bp.route('/<analysis_id>', methods=['GET'])
@token_required
def get_analysis(analysis_id):
    """
    Retrieve an existing Skill Gap report by unique analysis_id. Only allowed for owner.
    Requires header: Authorization: Bearer <JWT_TOKEN>
    """
    user_id = g.current_user_id
    doc = SkillGapAnalysis.find_by_id(analysis_id, user_id=user_id)
    
    if not doc:
        return jsonify({
            "success": False,
            "message": "Skill gap analysis record not found or access denied."
        }), 404
        
    return jsonify({
        "success": True,
        "message": "Skill gap analysis retrieved successfully",
        "data": SkillGapAnalysis.to_json_safe(doc)
    }), 200

@skillgap_bp.route('/resume/<resume_id>', methods=['GET'])
@token_required
def get_resume_history(resume_id):
    """
    Retrieve historical Skill Gap analyses performed on a specific resume ID owned by the user.
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
        
    history = SkillGapAnalysis.find_by_resume(resume_id, user_id=user_id)
    
    return jsonify({
        "success": True,
        "message": "Skill gap analysis history retrieved successfully",
        "data": {
            "resume_id": resume_id,
            "history": history,
            "count": len(history)
        }
    }), 200
