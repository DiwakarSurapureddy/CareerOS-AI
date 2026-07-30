# Route blueprints package initialization
from .main_routes import main_bp
from .api_routes import api_bp
from .auth import auth_bp
from .resume import resume_bp
from .ats import ats_bp
from .skillgap import skillgap_bp
from .prediction import prediction_bp
from .mentor import mentor_bp

def register_routes(app):
    """Register application Blueprints with dedicated URL namespaces."""
    app.register_blueprint(main_bp)
    app.register_blueprint(api_bp)
    app.register_blueprint(auth_bp)
    app.register_blueprint(resume_bp)
    app.register_blueprint(ats_bp)
    app.register_blueprint(skillgap_bp)
    app.register_blueprint(prediction_bp)
    app.register_blueprint(mentor_bp)
