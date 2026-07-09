import React, { createContext, useState, useEffect } from 'react';
import AuthAPI from './AuthAPI';
import { AuthContextType, AuthProviderProps, User, ProjectInfo, AuthResponse, LoginCredentials, RegisterData } from './types';
import { DEFAULT_ENDPOINTS } from './constants/endpoints';
import { tokenManager } from './utils/tokenManager';

export const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<AuthProviderProps> = ({
  children,
  authUrl,
  apiKey = '',
  projectId = '',
  loginEndpoint = DEFAULT_ENDPOINTS.login,
  registerEndpoint = DEFAULT_ENDPOINTS.register,
  logoutEndpoint = DEFAULT_ENDPOINTS.logout,
  refreshEndpoint = DEFAULT_ENDPOINTS.refresh,
  verifyEndpoint = DEFAULT_ENDPOINTS.verify,
  forgotPasswordEndpoint = DEFAULT_ENDPOINTS.forgotPassword,
  resetPasswordEndpoint = DEFAULT_ENDPOINTS.resetPassword,
  onError
}) => {
  const [user, setUser] = useState<User | null>(null);
  const [project, setProject] = useState<ProjectInfo | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const authAPI = new AuthAPI(authUrl, apiKey, projectId, {
    login: loginEndpoint,
    register: registerEndpoint,
    logout: logoutEndpoint,
    refresh: refreshEndpoint,
    verify: verifyEndpoint,
    forgotPassword: forgotPasswordEndpoint,
    resetPassword: resetPasswordEndpoint
  });

  useEffect(() => {
    const initAuth = async () => {
      try {
        const token = tokenManager.getToken();
        if (!token) {
          setLoading(false);
          return;
        }
        
        const verifiedUser = await authAPI.verifyToken();
        if (verifiedUser) {
          const storedData = localStorage.getItem('userData');
          let userData = verifiedUser;
          
          if (storedData) {
            try {
              const parsed = JSON.parse(storedData);
              userData = { ...verifiedUser, ...parsed };
            } catch (e) {
              // ignore
            }
          }
          
          if (!userData.username && userData.email) {
            userData.username = userData.email.split('@')[0];
          }
          
          setUser(userData);
          localStorage.setItem('userData', JSON.stringify(userData));
        } else {
          tokenManager.clearAll();
          localStorage.removeItem('userData');
          setUser(null);
        }
      } catch (err) {
        console.error('Auth initialization error:', err);
        tokenManager.clearAll();
        localStorage.removeItem('userData');
        setUser(null);
      } finally {
        setLoading(false);
      }
    };

    initAuth();
  }, []);

  const login = async (credentials: LoginCredentials): Promise<AuthResponse> => {
    try {
      setError(null);
      const response = await authAPI.login(credentials);
      
      if (response.user && !response.user.username && response.user.email) {
        response.user.username = response.user.email.split('@')[0];
      }
      
      setUser(response.user);
      if (response.project) {
        setProject(response.project);
      }
      
      if (response.user) {
        localStorage.setItem('userData', JSON.stringify(response.user));
      }
      
      return response;
    } catch (err: any) {
      const errorMessage = err.message || 'Login failed';
      setError(errorMessage);
      if (onError) onError(err);
      throw err;
    }
  };

  const register = async (data: RegisterData): Promise<AuthResponse> => {
    try {
      setError(null);
      const response = await authAPI.register(data);
      
      if (response.user && !response.user.username && response.user.email) {
        response.user.username = response.user.email.split('@')[0];
      }
      
      setUser(response.user);
      if (response.project) {
        setProject(response.project);
      }
      
      if (response.user) {
        localStorage.setItem('userData', JSON.stringify(response.user));
      }
      
      return response;
    } catch (err: any) {
      const errorMessage = err.message || 'Registration failed';
      setError(errorMessage);
      if (onError) onError(err);
      throw err;
    }
  };

  const forgotPassword = async (email: string): Promise<void> => {
    try {
      setError(null);
      await authAPI.forgotPassword(email);
    } catch (err: any) {
      const errorMessage = err.message || 'Password reset request failed';
      setError(errorMessage);
      if (onError) onError(err);
      throw err;
    }
  };

  const resetPassword = async (token: string, newPassword: string): Promise<void> => {
    try {
      setError(null);
      await authAPI.resetPassword(token, newPassword);
    } catch (err: any) {
      const errorMessage = err.message || 'Password reset failed';
      setError(errorMessage);
      if (onError) onError(err);
      throw err;
    }
  };

  const logout = async (): Promise<void> => {
    try {
      await authAPI.logout();
      setUser(null);
      setProject(null);
      setError(null);
      localStorage.removeItem('userData');
    } catch (err: any) {
      if (onError) onError(err);
      throw err;
    }
  };

  const refreshToken = async (): Promise<string | null> => {
    try {
      const newToken = await authAPI.refreshAccessToken();
      return newToken;
    } catch (err) {
      return null;
    }
  };

  const value: AuthContextType = {
    user,
    project,
    loading,
    error,
    login,
    register,
    forgotPassword,
    resetPassword,
    logout,
    refreshToken,
    isAuthenticated: !!user
  };

  return React.createElement(AuthContext.Provider, { value }, children);
};