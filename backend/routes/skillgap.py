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
    target_role = (data.get('target_role') or 'Software Engineer').strip()
    test_simulation = data.get('test_simulation', None)
    force_refresh = bool(data.get('force_refresh', False))

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

    # ── Cache-first: serve existing analysis unless force_refresh=true ──
    # This is the key fix for reload persistence: if an analysis already exists
    # in MongoDB for this resume + role, return it WITHOUT calling Gemini again.
    if not force_refresh:
        existing = SkillGapAnalysis.find_by_resume_and_role(resume_id, target_role, user_id=user_id)
        if existing:
            logger.info(f"Returning cached skill gap analysis for resume {resume_id}, role '{target_role}'")
            return jsonify({
                "success": True,
                "message": "Skill gap analysis retrieved from cache",
                "data": existing,
                "cached": True
            }), 200

    try:
        # Execute combined deterministic and AI-powered skill gap analysis
        success, analysis_result = SkillGapService.analyze_skill_gap(
            resume_doc, target_role, user_id=user_id, test_simulation=test_simulation
        )
        if not success:
            err_msg = (
                analysis_result.get("message", "Unable to generate skill gap analysis")
                if isinstance(analysis_result, dict)
                else str(analysis_result)
            )
            err_lower = err_msg.lower()
            if "rate" in err_lower or "volume" in err_lower or "quota" in err_lower or "exhausted" in err_lower:
                status_code = 503
            elif "timeout" in err_lower or "service" in err_lower:
                status_code = 503
            elif "key is not configured" in err_lower or "not configured" in err_lower:
                status_code = 400
            else:
                status_code = 500
            logger.error(f"Skill gap analysis failed [{status_code}] for resume {resume_id}: {err_msg}")
            return jsonify({
                "success": False,
                "message": err_msg
            }), status_code

        # Persist verified structured report in MongoDB
        created, db_res = SkillGapAnalysis.create(user_id, resume_id, analysis_result)
        if not created:
            logger.error(f"DB persistence failed for skill gap analysis: {db_res}")
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
        logger.error(f"Unhandled exception in skill gap analysis for resume {resume_id}: {type(e).__name__}: {e}", exc_info=True)
        return jsonify({
            "success": False,
            "message": "An internal error occurred while generating the skill gap analysis. Please try again."
        }), 500

@skillgap_bp.route('/<analysis_id>', methods=['GET'])
@token_required
def get_analysis(analysis_id):
    """
    Retrieve an existing Skill Gap report by unique analysis_id. Only allowed for owner.
    Requires header: Authorization: Bearer <JWT_TOKEN>
    """
    user_id = g.current_user_id
    try:
        doc = SkillGapAnalysis.find_by_id(analysis_id, user_id=user_id)
    except Exception as e:
        logger.error(f"Error fetching skill gap analysis {analysis_id}: {e}")
        return jsonify({"success": False, "message": "Invalid analysis ID format."}), 400

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


@skillgap_bp.route('/latest/<resume_id>', methods=['GET'])
@token_required
def get_latest_analysis(resume_id):
    """
    Return the most recent skill gap analysis for a resume (any role).
    This is the primary endpoint used on page load / refresh to restore saved analysis.
    Returns 200 with data=null if none exist yet (never 404 — that prevents unnecessary Gemini calls).
    Requires header: Authorization: Bearer <JWT_TOKEN>
    """
    user_id = g.current_user_id
    try:
        history = SkillGapAnalysis.find_by_resume(resume_id, user_id=user_id)
    except Exception as e:
        logger.error(f"Error fetching skill gap history for resume {resume_id}: {e}")
        return jsonify({"success": False, "message": "Failed to fetch analysis history."}), 500

    if not history:
        return jsonify({
            "success": True,
            "message": "No skill gap analysis found for this resume yet.",
            "data": None,
            "history": []
        }), 200

    return jsonify({
        "success": True,
        "message": "Latest skill gap analysis retrieved successfully",
        "data": history[0],   # Most recent first (sorted by created_at DESC in model)
        "history": history
    }), 200


@skillgap_bp.route('/resume/<resume_id>', methods=['GET'])
@token_required
def get_resume_history(resume_id):
    """
    Retrieve historical Skill Gap analyses performed on a specific resume ID owned by the user.
    Returns 200 with empty history list if no analyses exist (not 404).
    Requires header: Authorization: Bearer <JWT_TOKEN>
    """
    user_id = g.current_user_id
    try:
        history = SkillGapAnalysis.find_by_resume(resume_id, user_id=user_id)
    except Exception as e:
        logger.error(f"Error querying skill gap history for resume {resume_id}: {e}")
        return jsonify({"success": False, "message": "Failed to retrieve analysis history."}), 500

    return jsonify({
        "success": True,
        "message": "Skill gap analysis history retrieved successfully",
        "data": {
            "resume_id": resume_id,
            "history": history,
            "count": len(history)
        }
    }), 200
