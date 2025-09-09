import api from './api';

const authService = {
  // Register user
  register: async (userData) => {
    try {
      const response = await api.post('/auth/register', userData);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // Login user
  login: async (credentials) => {
    try {
      const response = await api.post('/auth/login', credentials);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // Get user profile
  getProfile: async () => {
    try {
      const response = await api.get('/auth/profile');
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // Update user profile
  updateProfile: async (userData) => {
    try {
      const response = await api.put('/auth/profile', userData);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // Logout user
  logout: async () => {
    try {
      await api.post('/auth/logout');
      localStorage.removeItem('mailflow_token');
      localStorage.removeItem('mailflow_user');
    } catch (error) {
      localStorage.removeItem('mailflow_token');
      localStorage.removeItem('mailflow_user');
      throw error;
    }
  },

  // Helpers
  isAuthenticated: () => {
    const token = localStorage.getItem('mailflow_token');
    return !!token;
  },

  getToken: () => localStorage.getItem('mailflow_token'),

  getUser: () => {
    const user = localStorage.getItem('mailflow_user');
    return user ? JSON.parse(user) : null;
  },

  setAuthData: (token, user) => {
    localStorage.setItem('mailflow_token', token);
    localStorage.setItem('mailflow_user', JSON.stringify(user));
  },

  clearAuthData: () => {
    localStorage.removeItem('mailflow_token');
    localStorage.removeItem('mailflow_user');
  },
};

export default authService;
