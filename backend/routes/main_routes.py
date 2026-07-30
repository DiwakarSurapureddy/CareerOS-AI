from flask import Blueprint, jsonify

main_bp = Blueprint('main', __name__)

@main_bp.route('/', methods=['GET'])
def index():
    """Root application endpoint returning basic metadata and documentation links in JSON format."""
    return jsonify({
        "status": "success",
        "project": "CareerOS AI - Student Career & Skill Gap Analyzer",
        "message": "Welcome to the CareerOS AI Backend API service.",
        "endpoints": {
            "root": "/",
            "health_check": "/api/health",
            "version": "/api/version"
        },
        "documentation": "Refer to README.md for complete system usage instructions."
    }), 200
