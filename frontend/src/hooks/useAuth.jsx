import { useState, useEffect, useContext, createContext } from 'react';
import  authService from '../services/authService'


const AuthContext = createContext();

// Auth Provider Component
export const AuthProvider = ({ children }) => {
  const [state, setState] = useState({
    user: null,
    token: null,
    isAuthenticated: false,
    isLoading: true,
    error: null,
  });

  // Initialize auth state on app start
  useEffect(() => {
    const initializeAuth = async () => {
      try {
        const token = authService.getToken();
        const storedUser = authService.getUser();

        if (token && storedUser) {
          // Verify token by fetching user profile
          const response = await authService.getProfile();
          if (response.success) {
            setState({
              user: response.user,
              token,
              isAuthenticated: true,
              isLoading: false,
              error: null,
            });
          } else {
            throw new Error('Profile fetch failed');
          }
        } else {
          setState({
            user: null,
            token: null,
            isAuthenticated: false,
            isLoading: false,
            error: null,
          });
        }
      } catch (error) {
        console.error('Auth initialization error:', error);
        authService.clearAuthData();
        setState({
          user: null,
          token: null,
          isAuthenticated: false,
          isLoading: false,
          error: null,
        });
      }
    };

    initializeAuth();
  }, []);

  const login = async (credentials) => {
    try {
      setState(prev => ({ ...prev, isLoading: true, error: null }));
      
      const response = await authService.login(credentials);
      
      if (response.success) {
        const { token, user } = response;
        authService.setAuthData(token, user);
        
        setState({
          user,
          token,
          isAuthenticated: true,
          isLoading: false,
          error: null,
        });
        
        return response;
      } else {
        throw new Error(response.message || 'Login failed');
      }
    } catch (error) {
      setState(prev => ({ 
        ...prev, 
        isLoading: false, 
        error: error.response?.data?.message || error.message || 'Login failed' 
      }));
      throw error;
    }
  };

  const register = async (userData) => {
    try {
      setState(prev => ({ ...prev, isLoading: true, error: null }));
      
      const response = await authService.register(userData);
      
      if (response.success) {
        const { token, user } = response;
        authService.setAuthData(token, user);
        
        setState({
          user,
          token,
          isAuthenticated: true,
          isLoading: false,
          error: null,
        });
        
        return response;
      } else {
        throw new Error(response.message || 'Registration failed');
      }
    } catch (error) {
      setState(prev => ({ 
        ...prev, 
        isLoading: false, 
        error: error.response?.data?.message || error.message || 'Registration failed' 
      }));
      throw error;
    }
  };

  const logout = async () => {
    try {
      await authService.logout();
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      setState({
        user: null,
        token: null,
        isAuthenticated: false,
        isLoading: false,
        error: null,
      });
    }
  };

  const updateUser = (user) => {
    setState(prev => ({
      ...prev,
      user,
    }));
    localStorage.setItem('mailflow_user', JSON.stringify(user));
  };

  const clearError = () => {
    setState(prev => ({ ...prev, error: null }));
  };

  const value = {
    ...state,
    login,
    register,
    logout,
    updateUser,
    clearError,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

// Custom hook to use auth context
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};