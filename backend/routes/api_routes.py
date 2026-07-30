from datetime import datetime, timezone
from flask import Blueprint, jsonify
from database import db_manager

api_bp = Blueprint('api', __name__, url_prefix='/api')

@api_bp.route('/health', methods=['GET'])
def health_check():
    """Health diagnostic route to inspect core application and MongoDB database connectivity."""
    db_ok, db_status = db_manager.check_health()
    
    return jsonify({
        "status": "ok" if db_ok else "warning",
        "service": "CareerOS AI Backend Service",
        "database": {
            "engine": "MongoDB (PyMongo)",
            "connected": db_ok,
            "status": db_status
        },
        "timestamp": datetime.now(timezone.utc).isoformat()
    }), 200

@api_bp.route('/version', methods=['GET'])
def get_version():
    """Returns software semantic version and architectural state information."""
    return jsonify({
        "application": "CareerOS AI Backend",
        "version": "1.0.0",
        "module": "Module 1: Project Setup & Backend Structure",
        "framework": "Flask 3.0.3",
        "status": "Production Ready"
    }), 200
