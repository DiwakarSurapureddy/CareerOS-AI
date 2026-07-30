"""
AI Career Mentor REST API Routing Layer for CareerOS AI Backend.
Defines endpoints for interactive Gemini conversational guidance and structured chat history management:
  - POST /api/chat : Send user prompt and generate intelligent AI coach reply
  - GET /api/chat/conversations : Retrieve user's active conversation summaries
  - GET /api/chat/conversations/<conversation_id> : Fetch complete conversational message transcript
  - DELETE /api/chat/conversations/<conversation_id> : Permanently remove a chat log and all historical turns
Enforces strict JWT token authentication and user ownership isolation across all endpoints.
"""

from flask import Blueprint, request, jsonify, g
import logging
from utils.auth import token_required
from services.mentor_service import MentorService
from models.mentor import MentorChat

logger = logging.getLogger(__name__)

mentor_bp = Blueprint('mentor', __name__, url_prefix='/api/chat')

@mentor_bp.route('', methods=['POST'], strict_slashes=False)
@mentor_bp.route('/', methods=['POST'], strict_slashes=False)
@token_required
def chat_with_mentor():
    """
    Handle incoming candidate chat prompts, enrich with CareerOS profile context,
    invoke Google Gemini conversational mentor, and persist message turn in MongoDB.
    """
    try:
        user_id = str(g.current_user_id)
        data = request.get_json(silent=True)

        if not data:
            return jsonify({"success": False, "message": "Invalid or missing JSON payload"}), 400

        message = data.get("message")
        conversation_id = data.get("conversation_id")
        test_simulation = data.get("test_simulation")  # Supported for automated integration verification

        ok, resp_payload, status_code = MentorService.process_user_message(
            user_id=user_id,
            message=message,
            conversation_id=conversation_id,
            test_simulation=test_simulation
        )

        return jsonify(resp_payload), status_code

    except Exception as e:
        logger.error(f"Unhandled server exception during POST /api/chat for user {g.get('current_user_id', 'unknown')}: {type(e).__name__} - {e}")
        return jsonify({
            "success": False,
            "message": "The AI mentor is temporarily unavailable. Please try again later."
        }), 500

@mentor_bp.route('/conversations', methods=['GET'])
@token_required
def list_conversations():
    """
    Retrieve summarized listing of active chat sessions belonging strictly to the authenticated candidate.
    Ordered chronologically by most recent activity.
    """
    try:
        user_id = str(g.current_user_id)
        conversations = MentorChat.get_user_conversations(user_id)

        return jsonify({
            "success": True,
            "data": {
                "conversations": conversations
            }
        }), 200

    except Exception as e:
        logger.error(f"Error retrieving conversation list for user {g.get('current_user_id', 'unknown')}: {type(e).__name__} - {e}")
        return jsonify({"success": False, "message": "Failed to retrieve conversation listing."}), 500

@mentor_bp.route('/conversations/<conversation_id>', methods=['GET'])
@token_required
def get_conversation_history(conversation_id):
    """
    Retrieve complete message transcript for a specific AI mentor conversation.
    Enforces user ownership validation against the authenticated JWT token.
    """
    try:
        user_id = str(g.current_user_id)
        ok, res = MentorChat.get_by_id_and_user(conversation_id, user_id)

        if not ok or not isinstance(res, dict):
            return jsonify({"success": False, "message": "Conversation record not found or access denied."}), 404

        # Return standardized JSON response matching API specs
        return jsonify({
            "success": True,
            "data": {
                "conversation_id": res.get("conversation_id", str(conversation_id)),
                "title": res.get("title", "Career Guidance"),
                "messages": res.get("messages", []),
                "created_at": res.get("created_at"),
                "updated_at": res.get("updated_at")
            }
        }), 200

    except Exception as e:
        logger.error(f"Error fetching conversation history {conversation_id}: {type(e).__name__} - {e}")
        return jsonify({"success": False, "message": "Failed to retrieve conversation history."}), 500

@mentor_bp.route('/conversations/<conversation_id>', methods=['DELETE'])
@token_required
def delete_conversation(conversation_id):
    """
    Permanently delete a stored conversational log and all associated message turns.
    Strictly restricted to the authenticated conversation owner.
    """
    try:
        user_id = str(g.current_user_id)
        ok, msg = MentorChat.delete_conversation(conversation_id, user_id)

        if not ok:
            return jsonify({"success": False, "message": "Conversation record not found or access denied."}), 404

        return jsonify({
            "success": True,
            "message": "Conversation deleted successfully."
        }), 200

    except Exception as e:
        logger.error(f"Error deleting conversation {conversation_id}: {type(e).__name__} - {e}")
        return jsonify({"success": False, "message": "Failed to delete conversation."}), 500
