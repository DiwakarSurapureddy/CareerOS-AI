import api from './api';

export const skillGapService = {
  /**
   * Run AI-powered skill gap analysis and generate learning roadmaps via Gemini AI.
   * On the backend, this is now cache-first: if an analysis already exists for the
   * resume+role combo it is returned from MongoDB WITHOUT calling Gemini.
   * Pass forceRefresh=true only when the user explicitly clicks "Re-analyze".
   * @param {string} resumeId - ID of uploaded candidate resume
   * @param {string} [targetRole="Software Engineer"] - Desired technology domain role
   * @param {boolean} [forceRefresh=false] - Skip cache and re-run Gemini analysis
   */
  analyzeSkillGap: async (resumeId, targetRole = 'Software Engineer', forceRefresh = false) => {
    const response = await api.post('/skill-gap/analyze', {
      resume_id: resumeId,
      target_role: targetRole,
      force_refresh: forceRefresh,
    });
    return response.data;
  },

  /**
   * Get the latest/most recent skill gap analysis for a resume (any role).
   * This is the primary endpoint for page-load restoration after browser refresh.
   * Always returns 200 — data is null when no analysis exists yet.
   * @param {string} resumeId
   */
  getLatestAnalysis: async (resumeId) => {
    const response = await api.get(`/skill-gap/latest/${resumeId}`);
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
