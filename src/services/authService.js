import api from './api';

export const authService = {
  /**
   * Register a new user account
   * @param {Object} userData - { name/full_name, email, password }
   */
  signup: async (userData) => {
    // Ensure compatibility whether component uses name or full_name
    const payload = {
      name: userData.name || userData.fullName || userData.full_name,
      full_name: userData.fullName || userData.full_name || userData.name,
      email: userData.email,
      password: userData.password,
    };
    const response = await api.post('/auth/signup', payload);
    return response.data;
  },

  /**
   * Authenticate existing user with credentials
   * @param {Object} credentials - { email, password }
   */
  login: async (credentials) => {
    const response = await api.post('/auth/login', credentials);
    return response.data;
  },

  /**
   * Retrieve active authenticated user profile
   */
  getCurrentUser: async () => {
    const response = await api.get('/auth/me');
    return response.data;
  },

  /**
   * Terminate current user session and invalidate tokens locally
   */
  logout: async () => {
    try {
      await api.post('/auth/logout');
    } catch (error) {
      // Ignore network failures during logout so client state always cleans up
      console.warn('Logout API error notice:', error.userMessage || error.message);
    } finally {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
    }
    return { success: true, message: 'Logged out successfully' };
  },

  /**
   * Upload a new profile avatar image
   * @param {File} file - Image file object
   */
  uploadAvatar: async (file) => {
    const formData = new FormData();
    formData.append('avatar', file);

    const response = await api.post('/auth/avatar', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      }
    });
    return response.data;
  }
};

export default authService;
