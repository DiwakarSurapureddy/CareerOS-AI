import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 50000, // 50 second timeout to safely support deeper Gemini AI synthesis workflows
});

// Request Interceptor: Automatically attach stateless JWT Bearer token from storage
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response Interceptor: Centralized Global API Error Handling
api.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    let errorMessage = 'An unexpected error occurred. Please try again.';

    if (error.response) {
      const status = error.response.status;
      const serverData = error.response.data;
      const serverMessage = serverData?.message || serverData?.error;

      switch (status) {
        case 401:
          // Unauthorized or token expired/invalid
          errorMessage = serverMessage || 'Your session has expired or is invalid. Please log in again.';
          localStorage.removeItem('token');
          localStorage.removeItem('user');
          window.dispatchEvent(new Event('auth:unauthorized'));
          if (!window.location.hash.includes('login') && !window.location.hash.includes('signup')) {
            window.location.hash = '#/login';
          }
          break;

        case 403:
          errorMessage = serverMessage || 'You do not have permission to access this resource.';
          break;

        case 404:
          errorMessage = serverMessage || 'The requested resource or document could not be found.';
          break;

        case 400:
        case 422:
          errorMessage = serverMessage || 'Validation error. Please verify the details submitted.';
          break;

        case 429:
          errorMessage = serverMessage || 'Too many requests. Please wait a short while before retrying.';
          break;

        case 503:
          errorMessage = serverMessage || 'The AI service is temporarily unavailable. Please try again later.';
          break;

        case 500:
          errorMessage = serverMessage || 'An internal server error occurred in the application backend.';
          break;

        default:
          errorMessage = serverMessage || `Server returned error (${status}).`;
          break;
      }
    } else if (error.code === 'ECONNABORTED' || (error.message && error.message.toLowerCase().includes('timeout'))) {
      errorMessage = 'The AI analysis request timed out while evaluating your career metrics. Please retry shortly.';
    } else if (!error.response || error.message?.includes('Network Error')) {
      errorMessage = 'Unable to connect to the backend server. Please check your network connection or verify the backend service is running.';
    }

    // Attach sanitized user-facing message to error instance without leaking stack traces
    error.userMessage = errorMessage;
    return Promise.reject(error);
  }
);

export default api;
