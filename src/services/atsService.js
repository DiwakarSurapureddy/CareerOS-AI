import api from './api';

export const atsService = {
  /**
   * Perform ATS evaluation and keyword matching against target engineering role
   * @param {string} resumeId - ID of the stored user resume document
   * @param {string} [targetRole="Python Developer"] - Desired industry job title
   */
  analyzeATS: async (resumeId, targetRole = 'Python Developer') => {
    const response = await api.post('/ats/analyze', {
      resume_id: resumeId,
      target_role: targetRole,
    });
    return response.data;
  },

  /**
   * Fetch saved ATS analysis report by analysis ID
   * @param {string} analysisId
   */
  getATSAnalysis: async (analysisId) => {
    const response = await api.get(`/ats/${analysisId}`);
    return response.data;
  },

  /**
   * Get chronological ATS evaluations generated for a specific resume document
   * @param {string} resumeId
   */
  getATSByResume: async (resumeId) => {
    const response = await api.get(`/ats/resume/${resumeId}`);
    return response.data;
  }
};

export default atsService;
