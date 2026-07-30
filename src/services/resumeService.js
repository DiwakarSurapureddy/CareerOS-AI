import api from './api';

export const resumeService = {
  /**
   * Upload and extract resume document via multipart/form-data
   * @param {File} file - PDF, DOCX, or TXT file object
   * @param {Function} [onProgress] - Optional upload progress callback
   */
  uploadResume: async (file, onProgress = null) => {
    const formData = new FormData();
    formData.append('file', file);

    const response = await api.post('/resume/upload', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
      onUploadProgress: (progressEvent) => {
        if (onProgress && progressEvent.total) {
          const percentCompleted = Math.round((progressEvent.loaded * 100) / progressEvent.total);
          onProgress(percentCompleted);
        }
      }
    });
    return response.data;
  },

  /**
   * Fetch listing of all resumes owned by the authenticated user
   */
  getResumes: async () => {
    const response = await api.get('/resume');
    return response.data;
  },

  /**
   * Get detailed parsed data for a specific resume by ID
   * @param {string} resumeId
   */
  getResume: async (resumeId) => {
    const response = await api.get(`/resume/${resumeId}`);
    return response.data;
  },

  /**
   * Permanently delete a stored resume and its associated storage file
   * @param {string} resumeId
   */
  deleteResume: async (resumeId) => {
    const response = await api.delete(`/resume/${resumeId}`);
    return response.data;
  }
};

export default resumeService;
