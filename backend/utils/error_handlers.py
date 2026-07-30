import logging
from flask import jsonify
from werkzeug.exceptions import HTTPException

logger = logging.getLogger(__name__)

def register_error_handlers(app):
    """Register global error handlers returning standardized JSON responses with 'success: false' format."""
    
    @app.errorhandler(400)
    def bad_request(error):
        return jsonify({
            "success": False,
            "status": "error",
            "code": 400,
            "error_type": "Bad Request",
            "message": getattr(error, 'description', "The request syntax was malformed or illegal.")
        }), 400

    @app.errorhandler(401)
    def unauthorized(error):
        return jsonify({
            "success": False,
            "status": "error",
            "code": 401,
            "error_type": "Unauthorized",
            "message": getattr(error, 'description', "Authentication credentials are required to access this resource.")
        }), 401

    @app.errorhandler(403)
    def forbidden(error):
        return jsonify({
            "success": False,
            "status": "error",
            "code": 403,
            "error_type": "Forbidden",
            "message": getattr(error, 'description', "You do not have authorization to perform this action.")
        }), 403

    @app.errorhandler(404)
    def not_found(error):
        return jsonify({
            "success": False,
            "status": "error",
            "code": 404,
            "error_type": "Not Found",
            "message": getattr(error, 'description', "The requested API endpoint or resource could not be found.")
        }), 404

    @app.errorhandler(405)
    def method_not_allowed(error):
        return jsonify({
            "success": False,
            "status": "error",
            "code": 405,
            "error_type": "Method Not Allowed",
            "message": "The HTTP method specified is not permitted for the requested endpoint."
        }), 405

    @app.errorhandler(413)
    def request_entity_too_large(error):
        return jsonify({
            "success": False,
            "status": "error",
            "code": 413,
            "error_type": "Payload Too Large",
            "message": "The uploaded file exceeds the maximum permitted file size of 16MB."
        }), 413

    @app.errorhandler(500)
    def internal_server_error(error):
        logger.error(f"Internal Server Error: {error}", exc_info=True)
        return jsonify({
            "success": False,
            "status": "error",
            "code": 500,
            "error_type": "Internal Server Error",
            "message": "An unexpected error occurred on the server."
        }), 500

    @app.errorhandler(Exception)
    def handle_unexpected_exception(error):
        if isinstance(error, HTTPException):
            return jsonify({
                "success": False,
                "status": "error",
                "code": error.code,
                "error_type": error.name,
                "message": error.description
            }), error.code
            
        logger.critical(f"Unhandled Exception encountered: {error}", exc_info=True)
        return jsonify({
            "success": False,
            "status": "error",
            "code": 500,
            "error_type": "Unhandled Exception",
            "message": "An unhandled server anomaly occurred while processing the request."
        }), 500
