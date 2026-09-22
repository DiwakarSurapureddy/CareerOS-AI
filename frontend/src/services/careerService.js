import api from './api';

export const careerService = {
  /**
   * Perform comprehensive multi-factor career trajectory prediction and estimated salary benchmarking
   * @param {string} resumeId - ID of analyzed resume document
   * @param {string} [targetRole=""] - Optional target role; if blank, evaluates top matching career trajectories
   */
  predictCareer: async (resumeId, targetRole = '') => {
    const payload = { resume_id: resumeId };
    if (targetRole && targetRole.trim()) {
      payload.target_role = targetRole.trim();
    }
    const response = await api.post('/career/predict', payload);
    return response.data;
  },

  /**
   * Fetch saved career prediction report by ID
   * @param {string} predictionId
   */
  getCareerPrediction: async (predictionId) => {
    const response = await api.get(`/career/${predictionId}`);
    return response.data;
  },

  /**
   * Get historical career prediction evaluation history for a resume document
   * @param {string} resumeId
   */
  getPredictionHistory: async (resumeId) => {
    const response = await api.get(`/career/resume/${resumeId}`);
    return response.data;
  }
};

export default careerService;
