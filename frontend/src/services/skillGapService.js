import api from './api';

export const skillGapService = {
  /**
   * Run AI-powered skill gap analysis and generate learning roadmaps via Gemini AI
   * @param {string} resumeId - ID of uploaded candidate resume
   * @param {string} [targetRole="Python Developer"] - Desired technology domain role
   */
  analyzeSkillGap: async (resumeId, targetRole = 'Python Developer') => {
    const response = await api.post('/skill-gap/analyze', {
      resume_id: resumeId,
      target_role: targetRole,
    });
    return response.data;
  },

  /**
   * Get historical skill gap report by analysis ID
   * @param {string} analysisId
   */
  getSkillGapAnalysis: async (analysisId) => {
    const response = await api.get(`/skill-gap/${analysisId}`);
    return response.data;
  },

  /**
   * Get all skill gap evaluations generated for a specific candidate resume
   * @param {string} resumeId
   */
  getSkillGapByResume: async (resumeId) => {
    const response = await api.get(`/skill-gap/resume/${resumeId}`);
    return response.data;
  }
};

export default skillGapService;
