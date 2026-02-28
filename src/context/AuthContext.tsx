import React, { createContext, useContext, useState, useEffect } from 'react';
import AuthAPI from '../services/api.ts';
import type { User, AuthResponse, LoginCredentials, RegisterData, AuthContextType, AuthProviderProps } from '../types';

export const AuthContext = createContext<AuthContextType | null>(null);

export const AuthProvider: React.FC<AuthProviderProps> = ({ 
  children, 
  baseURL,
  loginEndpoint = '/auth/login',
  registerEndpoint = '/auth/register',
  verifyEndpoint = '/auth/verify',
  logoutEndpoint = '/auth/logout',
  refreshEndpoint = '/auth/refresh',
  onError
}) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  const api = new AuthAPI(baseURL, refreshEndpoint);

  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        setLoading(false);
        return;
      }

      const userData = await api.verifyToken(verifyEndpoint);
      setUser(userData);
    } catch (err: any) {
      localStorage.removeItem('token');
      localStorage.removeItem('refreshToken');
      onError?.(err);
    } finally {
      setLoading(false);
    }
  };

  const login = async (credentials: LoginCredentials): Promise<AuthResponse> => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await api.login(credentials, loginEndpoint);
      
      if (response.token) {
        localStorage.setItem('token', response.token);
        if (response.refreshToken) {
          localStorage.setItem('refreshToken', response.refreshToken);
        }
        setUser(response.user);
      }
      
      return response;
    } catch (err: any) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const register = async (userData: RegisterData): Promise<AuthResponse> => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await api.register(userData, registerEndpoint);
      
      if (response.token) {
        localStorage.setItem('token', response.token);
        if (response.refreshToken) {
          localStorage.setItem('refreshToken', response.refreshToken);
        }
        setUser(response.user);
      }
      
      return response;
    } catch (err: any) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const logout = async (): Promise<void> => {
    setLoading(true);
    
    try {
      await api.logout(logoutEndpoint);
    } catch (err: any) {
      console.warn('Logout error:', err.message);
    } finally {
      localStorage.removeItem('token');
      localStorage.removeItem('refreshToken');
      setUser(null);
      setLoading(false);
    }
  };

  return (
    <AuthContext.Provider value={{
      user,
      loading,
      error,
      login,
      register,
      logout,
      isAuthenticated: !!user
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
};