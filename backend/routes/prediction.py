"""
Career Prediction API Blueprint for CareerOS AI Backend.
Defines secure RESTful routing endpoints for Module 6: Career Prediction,
Salary Benchmarking, Career Readiness rubrics, and 6-Phase Roadmaps.
Enforces stateless JWT authorization and complete database user isolation.
"""

from flask import Blueprint, request, jsonify, g
import logging
from utils.auth import token_required
from models.resume import Resume
from models.prediction import CareerPrediction
from services.prediction_service import PredictionService
from database import db_manager

logger = logging.getLogger(__name__)

prediction_bp = Blueprint('prediction', __name__, url_prefix='/api/career')

@prediction_bp.route('/predict', methods=['POST'])
@token_required
def predict_career():
    """
    Perform comprehensive career prediction, match scoring, salary range benchmarking,
    readiness ratings, and AI roadmap generation for an authenticated user's resume.
    """
    try:
        user_id = str(g.current_user_id)
        data = request.get_json(silent=True)
        if not data:
            return jsonify({"success": False, "message": "Invalid or missing JSON payload"}), 400

        resume_id = data.get("resume_id")
        target_role = data.get("target_role", "")
        test_simulation = data.get("test_simulation") # Supported for automated verification scenarios

        if not resume_id or not str(resume_id).strip():
            logger.warning(f"Career prediction failed for user {user_id}: resume_id missing from payload")
            return jsonify({"success": False, "message": "Missing required field: resume_id is strictly required."}), 400

        # Verify that the resume document exists and strictly belongs to authenticated user
        resume_doc = Resume.find_by_id(str(resume_id).strip(), user_id)
        if not resume_doc or not isinstance(resume_doc, dict):
            logger.warning(f"Unauthorized career prediction attempt for resume {resume_id} by user {user_id}")
            return jsonify({"success": False, "message": "Resume document not found or access denied."}), 404

        # Retrieve prior ATS analysis if available in database
        ats_doc = None
        skillgap_doc = None
        try:
            db = db_manager.get_db()
            if db is not None:
                ats_doc = db.ats_analyses.find_one(
                    {"resume_id": str(resume_id), "user_id": str(user_id)},
                    sort=[("created_at", -1)]
                )
                skillgap_doc = db.skillgap_analyses.find_one(
                    {"resume_id": str(resume_id), "user_id": str(user_id)},
                    sort=[("created_at", -1)]
                )
        except Exception as db_e:
            logger.warning(f"Non-fatal warning looking up historical analyses: {db_e}")

        # Execute comprehensive evaluation and AI prediction workflow
        prediction_result = PredictionService.predict_career_path(
            user_id=user_id,
            resume_id=str(resume_id).strip(),
            resume_data=resume_doc,
            target_role=target_role,
            ats_data=ats_doc,
            skillgap_data=skillgap_doc,
            test_simulation=test_simulation
        )

        # Persist complete prediction report in MongoDB
        save_ok, save_res = CareerPrediction.create(user_id, str(resume_id).strip(), prediction_result)
        if not save_ok:
            logger.error(f"Failed to persist career prediction report in MongoDB for user {user_id}: {save_res}")
            return jsonify({"success": False, "message": "Database persistence failed for career prediction report."}), 500

        # Assemble clean JSON response payload
        response_data = dict(prediction_result)
        response_data["prediction_id"] = str(save_res)

        return jsonify({
            "success": True,
            "message": "Career prediction completed successfully",
            "data": response_data
        }), 201

    except Exception as e:
        logger.error(f"Unhandled server exception during POST /api/career/predict: {type(e).__name__} - {e}")
        return jsonify({"success": False, "message": "Unable to generate career prediction"}), 500

def _map_prediction_keys(prediction_data):
    if not prediction_data or not isinstance(prediction_data, dict):
        return prediction_data
    
    # Handle both raw prediction result dict and DB wrapper document
    pred_doc = prediction_data
    recs = pred_doc.get("recommended_careers", [])
    if recs and isinstance(recs, list):
        for r in recs:
            if isinstance(r, dict):
                r["title"] = r.get("career", "")
                r["role"] = r.get("career", "")
                r["role_name"] = r.get("career", "")
                r["description"] = r.get("reason", "")
                r["desc"] = r.get("reason", "")
                r["reasoning"] = r.get("reason", "")
                
                if "skills" not in r:
                    skills_list = []
                    if "current_skills" in r:
                        skills_list.extend(r["current_skills"])
                    if "missing_skills" in r:
                        skills_list.extend([f"{s} (Missing)" for s in r["missing_skills"]])
                    r["skills"] = skills_list
                    r["required_skills"] = skills_list
                    r["key_skills"] = skills_list

        pred_doc["recommended_roles"] = recs
        pred_doc["careers"] = recs
        pred_doc["predictions"] = recs
        
    return prediction_data


@prediction_bp.route('/<prediction_id>', methods=['GET'])
@token_required
def get_prediction_report(prediction_id):
    """
    Retrieve a specific stored career prediction report by ID.
    Enforces strict ownership verification against the authenticated JWT token.
    """
    try:
        user_id = str(g.current_user_id)
        ok, res = CareerPrediction.get_by_id_and_user(prediction_id, user_id)
        
        if not ok:
            return jsonify({"success": False, "message": "Career prediction record not found or access denied."}), 404

        mapped_res = _map_prediction_keys(res)
        return jsonify({
            "success": True,
            "message": "Career prediction report retrieved successfully",
            "data": mapped_res
        }), 200

    except Exception as e:
        logger.error(f"Error handling GET /api/career/{prediction_id}: {type(e).__name__} - {e}")
        return jsonify({"success": False, "message": "Failed to retrieve career prediction record."}), 500


@prediction_bp.route('/resume/<resume_id>', methods=['GET'])
@token_required
def get_resume_prediction_history(resume_id):
    """
    Retrieve chronological career prediction evaluation history for a single uploaded resume document,
    scoped strictly to the authenticated user.
    """
    try:
        user_id = str(g.current_user_id)
        
        # Verify ownership of resume before returning analytical history
        resume_doc = Resume.find_by_id(str(resume_id).strip(), user_id)
        if not resume_doc:
            return jsonify({"success": False, "message": "Resume document not found or access denied."}), 404

        hist_ok, hist_res = CareerPrediction.get_by_resume_and_user(str(resume_id).strip(), user_id)
        if not hist_ok:
            return jsonify({"success": False, "message": "Failed to retrieve career prediction history from database."}), 500

        mapped_hist = []
        if isinstance(hist_res, list):
            mapped_hist = [_map_prediction_keys(doc) for doc in hist_res]
        elif isinstance(hist_res, dict):
            mapped_hist = _map_prediction_keys(hist_res)
        else:
            mapped_hist = hist_res

        return jsonify({
            "success": True,
            "message": "Career prediction history retrieved successfully",
            "data": mapped_hist
        }), 200

    except Exception as e:
        logger.error(f"Error handling GET /api/career/resume/{resume_id}: {type(e).__name__} - {e}")
        return jsonify({"success": False, "message": "Failed to fetch career prediction evaluation history."}), 500
