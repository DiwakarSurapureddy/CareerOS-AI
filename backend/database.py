import logging
from pymongo import MongoClient
from pymongo.errors import ConnectionFailure, ConfigurationError

logger = logging.getLogger(__name__)

class Database:
    """MongoDB Database Connection Manager using PyMongo."""
    def __init__(self):
        self.client = None
        self.db = None

    def init_app(self, app):
        """Initialize MongoDB connection with settings from Flask app configuration."""
        mongo_uri = app.config.get('MONGO_URI', 'mongodb://localhost:27017/careeros_ai')
        try:
            # Set timeout to 3000ms so non-existent DB servers don't freeze application startup
            self.client = MongoClient(mongo_uri, serverSelectionTimeoutMS=3000)
            
            # Determine database name from the connection string or fall back to default
            try:
                db_name = self.client.get_database().name
            except (ConfigurationError, ValueError):
                db_name = "careeros_ai"
                
            self.db = self.client[db_name]
            
            # Perform a ping command to verify the connection is active
            self.client.admin.command('ping')
            logger.info(f"Successfully connected to MongoDB database: {db_name}")
        except ConnectionFailure as e:
            logger.warning(f"MongoDB ping check failed (Verify if MongoDB is running locally): {e}")
        except Exception as e:
            logger.error(f"Failed to initialize MongoDB client: {e}")

    def get_db(self):
        """Return the active MongoDB database instance."""
        return self.db

    def get_collection(self, collection_name):
        """Return a handle to the specified MongoDB collection."""
        if self.db is not None:
            return self.db[collection_name]
        logger.warning(f"Database not initialized when requesting collection: {collection_name}")
        return None

    def check_health(self):
        """Check connection status for health monitoring endpoints."""
        try:
            if self.client:
                self.client.admin.command('ping')
                return True, "Connected"
            return False, "Not Initialized"
        except Exception as e:
            return False, f"Disconnected: {str(e)}"

# Singleton database instance to be used across blueprints and services
db_manager = Database()
