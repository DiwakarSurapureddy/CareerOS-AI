import os
import logging
from logging.handlers import RotatingFileHandler

def configure_logging(app):
    """Configure enterprise-grade structured logging for console and log file."""
    log_level = logging.DEBUG if app.debug else logging.INFO
    
    # Ensure logs directory exists
    log_dir = os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))), 'logs')
    os.makedirs(log_dir, exist_ok=True)
    log_file = os.path.join(log_dir, 'careeros_api.log')

    # Detailed formatting for file and clean formatting for console
    formatter = logging.Formatter(
        '[%(asctime)s] %(levelname)s in %(module)s [%(pathname)s:%(lineno)d]: %(message)s'
    )
    console_formatter = logging.Formatter(
        '%(asctime)s - %(name)s - [%(levelname)s] - %(message)s'
    )

    # File Handler: Max 10MB per file with up to 5 rotating backups
    file_handler = RotatingFileHandler(log_file, maxBytes=10 * 1024 * 1024, backupCount=5, encoding='utf-8')
    file_handler.setLevel(log_level)
    file_handler.setFormatter(formatter)

    # Console Stream Handler
    console_handler = logging.StreamHandler()
    console_handler.setLevel(log_level)
    console_handler.setFormatter(console_formatter)

    # Configure root logger
    root_logger = logging.getLogger()
    root_logger.setLevel(log_level)

    # Silence excessively verbose third-party debug logs
    logging.getLogger('pymongo').setLevel(logging.INFO)
    logging.getLogger('urllib3').setLevel(logging.WARNING)
    
    # Clear existing handlers to prevent duplicate output upon reinstallation/reload
    if not root_logger.handlers:
        root_logger.addHandler(file_handler)
        root_logger.addHandler(console_handler)
    else:
        root_logger.handlers = [file_handler, console_handler]

    # Sync with Flask built-in app logger
    app.logger.setLevel(log_level)
    app.logger.info("Logging infrastructure successfully initialised.")
