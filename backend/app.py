import os
import sys
from flask import Flask
from flask_cors import CORS
from dotenv import load_dotenv

# Ensure backend directory is in system path for clean module resolution
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from config import config_by_name
from database import db_manager
from routes import register_routes
from utils.error_handlers import register_error_handlers
from utils.logger import configure_logging

# 1. Configure environment variables using python-dotenv
load_dotenv()

def create_app(config_name=None):
    """Application factory pattern to configure and initialize the Flask application."""
    if config_name is None:
        config_name = os.getenv('FLASK_ENV', 'development')

    # 2. Configure Flask application
    app = Flask(__name__, static_folder='static')
    
    # Load environment-specific configuration from config.py
    config_obj = config_by_name.get(config_name, config_by_name['default'])
    app.config.from_object(config_obj)

    # 3. Add proper logging configuration
    configure_logging(app)

    # 4. Configure upload & required working folders
    os.makedirs(app.config['UPLOAD_FOLDER'], exist_ok=True)
    os.makedirs(os.path.join(os.path.dirname(os.path.abspath(__file__)), 'logs'), exist_ok=True)
    os.makedirs(os.path.join(os.path.dirname(os.path.abspath(__file__)), 'static'), exist_ok=True)
    
    # 5. Enable Flask-CORS for secure cross-origin UI interaction
    CORS(app, resources={r"/*": {"origins": "*"}}, supports_credentials=True)
    app.logger.info("Flask-CORS enabled successfully across API resources.")

    # 6. Configure & initialize MongoDB connection using PyMongo
    db_manager.init_app(app)

    # 7. Register Blueprint structure for modular routing
    register_routes(app)
    app.logger.info("Routing blueprints registered successfully.")

    # 8. Add proper global JSON error handling
    register_error_handlers(app)
    app.logger.info("Standardized JSON error handlers initialized.")

    app.logger.info(f"CareerOS AI Backend Service booted successfully in '{config_name}' environment.")
    return app

# Initialize default app instance for WSGI server deployments / Gunicorn / development runtime
app = create_app()

if __name__ == '__main__':
    port = int(os.getenv('PORT', 5000))
    debug = os.getenv('FLASK_DEBUG', '1') == '1'
    app.run(host='0.0.0.0', port=port, debug=debug)
