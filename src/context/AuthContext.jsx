import React, { createContext, useContext, useState, useEffect, useCallback, useMemo } from 'react';
import authService from '../services/authService';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [currentUser, setCurrentUser] = useState(() => {
    try {
      const storedUser = localStorage.getItem('user');
      return storedUser ? JSON.parse(storedUser) : null;
    } catch (e) {
      console.error('Failed to parse stored user data:', e);
      return null;
    }
  });

  const [loading, setLoading] = useState(true);
  const isAuthenticated = Boolean(currentUser && localStorage.getItem('token'));

  /**
   * Check token validity and restore current user profile from backend on app startup
   */
  const checkAuth = useCallback(async () => {
    const token = localStorage.getItem('token');
    if (!token) {
      setCurrentUser(null);
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      const res = await authService.getCurrentUser();
      if (res.success && res.data && res.data.user) {
        setCurrentUser(res.data.user);
        localStorage.setItem('user', JSON.stringify(res.data.user));
      } else {
        // Unexpected format or failure
        setCurrentUser(null);
        localStorage.removeItem('token');
        localStorage.removeItem('user');
      }
    } catch (error) {
      console.warn('Session restoration failed or token expired:', error.userMessage || error.message);
      setCurrentUser(null);
      localStorage.removeItem('token');
      localStorage.removeItem('user');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    checkAuth();

    // Listen for global unauthorized events dispatched by Axios response interceptor (401 status)
    const handleUnauthorized = () => {
      setCurrentUser(null);
      localStorage.removeItem('token');
      localStorage.removeItem('user');
    };

    window.addEventListener('auth:unauthorized', handleUnauthorized);
    return () => {
      window.removeEventListener('auth:unauthorized', handleUnauthorized);
    };
  }, [checkAuth]);

  /**
   * Register new user account and store session state
   */
  const signup = async (userData) => {
    setLoading(true);
    try {
      const res = await authService.signup(userData);
      if (res.success && res.data) {
        const { token, user } = res.data;
        localStorage.setItem('token', token);
        localStorage.setItem('user', JSON.stringify(user));
        setCurrentUser(user);
        return { success: true, data: res.data };
      }
      return { success: false, message: res.message || 'Signup failed' };
    } catch (error) {
      const msg = error.userMessage || error.response?.data?.message || error.message || 'Failed to create account.';
      return { success: false, message: msg };
    } finally {
      setLoading(false);
    }
  };

  /**
   * Authenticate existing user with email and password
   */
  const login = async (credentials) => {
    setLoading(true);
    try {
      const res = await authService.login(credentials);
      if (res.success && res.data) {
        const { token, user } = res.data;
        localStorage.setItem('token', token);
        localStorage.setItem('user', JSON.stringify(user));
        setCurrentUser(user);
        return { success: true, data: res.data };
      }
      return { success: false, message: res.message || 'Login failed' };
    } catch (error) {
      const msg = error.userMessage || error.response?.data?.message || error.message || 'Invalid email or password.';
      return { success: false, message: msg };
    } finally {
      setLoading(false);
    }
  };

  /**
   * Terminate active user session and clear storage
   */
  const logout = async () => {
    setLoading(true);
    try {
      await authService.logout();
    } finally {
      setCurrentUser(null);
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      setLoading(false);
    }
  };

  /**
   * Seamlessly authenticate or register using Google account
   */
  const loginWithGoogle = async (accessToken) => {
    setLoading(true);
    try {
      const res = await authService.loginWithGoogle(accessToken);
      if (res.success && res.data) {
        const { token, user } = res.data;
        localStorage.setItem('token', token);
        localStorage.setItem('user', JSON.stringify(user));
        setCurrentUser(user);
        return { success: true, data: res.data };
      }
      return { success: false, message: res.message || 'Google authentication failed.' };
    } catch (error) {
      const msg = error.userMessage || error.response?.data?.message || error.message || 'Failed to sign in with Google.';
      return { success: false, message: msg };
    } finally {
      setLoading(false);
    }
  };

  /**
   * Update the current user state locally (e.g. after profile edits/avatar upload)
   */
  const updateCurrentUser = (user) => {
    setCurrentUser(user);
    localStorage.setItem('user', JSON.stringify(user));
  };

  const value = useMemo(() => ({
    currentUser,
    isAuthenticated,
    loading,
    login,
    signup,
    logout,
    loginWithGoogle,
    checkAuth,
    updateCurrentUser
  }), [currentUser, isAuthenticated, loading, login, signup, logout, loginWithGoogle, checkAuth]);

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export default AuthContext;
