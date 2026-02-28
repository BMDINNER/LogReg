import axios from 'axios';
import type { AxiosInstance, AxiosError } from 'axios';
import type { LoginCredentials, RegisterData, AuthResponse } from '../types';

class AuthAPI {
  private api: AxiosInstance;
  private refreshEndpoint: string;

  constructor(baseURL: string, refreshEndpoint: string = '/auth/refresh') {
    this.refreshEndpoint = refreshEndpoint;
    
    this.api = axios.create({
      baseURL: baseURL,
      timeout: 10000,
      headers: { "Content-Type": 'application/json' }
    });

    this.api.interceptors.request.use((config) => {
      const token = localStorage.getItem('token');
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
      return config;
    });

    this.api.interceptors.response.use(
      (response) => response,
      async (error: AxiosError) => {
        const originalRequest: any = error.config;
        if (error.response?.status === 401 && !originalRequest._retry) {
          originalRequest._retry = true;
          try {
            const refreshToken = localStorage.getItem('refreshToken');
            const response = await this.api.post(this.refreshEndpoint, { refreshToken });
            const { token } = response.data;
            localStorage.setItem('token', token);
            originalRequest.headers.Authorization = `Bearer ${token}`;
            return this.api(originalRequest);
          } catch (refreshError) {
            localStorage.removeItem('token');
            localStorage.removeItem('refreshToken');
            window.location.href = '/login';
            return Promise.reject(refreshError);
          }
        }
        return Promise.reject(error);
      }
    );
  }

  private handleError(error: any): Error {
    if (error.response) {
      const message = error.response.data?.message || error.response.data?.error || `Server error: ${error.response.status}`;
      return new Error(message);
    }

    if (error.request) {
      return new Error('Unable to reach server');
    }

    return new Error(error.message || 'An error occurred');
  }

  async login(credentials: LoginCredentials, endpoint: string): Promise<AuthResponse> {
    try {
      const { data } = await this.api.post(endpoint, credentials);
      return data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  async register(userData: RegisterData, endpoint: string): Promise<AuthResponse> {
    try {
      const { data } = await this.api.post(endpoint, userData);
      return data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  async logout(endpoint: string): Promise<void> {
    try {
      const { data } = await this.api.get(endpoint);
      return data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  async verifyToken(endpoint: string): Promise<any> {
    try {
      const { data } = await this.api.get(endpoint);
      return data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  async refreshToken(endpoint: string, refreshToken: string): Promise<{ token: string }> {
    try {
      const { data } = await this.api.post(endpoint, { refreshToken });
      return data;
    } catch (error) {
      throw this.handleError(error);
    }
  }
}

export default AuthAPI;