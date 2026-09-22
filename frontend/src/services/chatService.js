import api from './api';

export const chatService = {
  /**
   * Send a conversational turn prompt to the AI Career Mentor via Gemini
   * @param {string} message - User query or coaching prompt
   * @param {string} [conversationId=null] - UUID of existing chat session if continuing discussion
   */
  sendMessage: async (message, conversationId = null, resumeId = null) => {
    const payload = { message: message.trim() };
    if (conversationId && String(conversationId).trim()) {
      payload.conversation_id = conversationId;
    }
    if (resumeId && String(resumeId).trim()) {
      payload.resume_id = resumeId;
    }
    const response = await api.post('/chat', payload);
    return response.data;
  },

  /**
   * Retrieve listing of all active chat sessions belonging to the logged in candidate
   */
  getConversations: async () => {
    const response = await api.get('/chat/conversations');
    return response.data;
  },

  /**
   * Fetch complete message transcript for a given conversational session
   * @param {string} conversationId
   */
  getConversation: async (conversationId) => {
    const response = await api.get(`/chat/conversations/${conversationId}`);
    return response.data;
  },

  /**
   * Permanently delete an existing conversational log and message history
   * @param {string} conversationId
   */
  deleteConversation: async (conversationId) => {
    const response = await api.delete(`/chat/conversations/${conversationId}`);
    return response.data;
  }
};

export default chatService;
