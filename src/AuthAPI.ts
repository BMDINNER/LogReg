import axios, { AxiosInstance, InternalAxiosRequestConfig, AxiosError } from 'axios';
import { tokenManager } from './utils/tokenManager';
import { handleAuthError } from './utils/errorHandler';
import { AuthConfig, LoginCredentials, RegisterData, AuthResponse, User } from './types';
import { DEFAULT_ENDPOINTS } from './constants/endpoints';

interface ExtendedAxiosRequestConfig extends InternalAxiosRequestConfig {
  _retry?: boolean;
}

export class AuthAPI {
  private api: AxiosInstance;
  private config: AuthConfig;
  private isRefreshing = false;
  private refreshSubscribers: ((token: string) => void)[] = [];

  constructor(
    authUrl: string,
    apiKey: string,
    projectId: string,
    customEndpoints?: Partial<AuthConfig['endpoints']>
  ) {
    this.config = {
      authUrl,
      apiKey,
      projectId,
      endpoints: {
        ...DEFAULT_ENDPOINTS,
        ...customEndpoints
      }
    };

    this.api = axios.create({
      baseURL: authUrl,
      timeout: 15000,
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': apiKey,
        'x-project-id': projectId
      }
    });

    this.setupInterceptors();
  }

  private setupInterceptors(): void {
    this.api.interceptors.request.use(
      (config: InternalAxiosRequestConfig) => {
        const token = tokenManager.getToken();
        if (token) {
          config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
      },
      (error) => Promise.reject(error)
    );

    this.api.interceptors.response.use(
      (response) => response,
      async (error: AxiosError) => {
        const originalRequest = error.config as ExtendedAxiosRequestConfig;
        
        if (!originalRequest || originalRequest.url?.includes(this.config.endpoints.refresh)) {
          return Promise.reject(error);
        }

        if (error.response?.status === 401 && !originalRequest._retry) {
          if (this.isRefreshing) {
            return new Promise((resolve) => {
              this.refreshSubscribers.push((token: string) => {
                originalRequest.headers.Authorization = `Bearer ${token}`;
                resolve(this.api(originalRequest));
              });
            });
          }

          originalRequest._retry = true;
          this.isRefreshing = true;

          try {
            const newToken = await this.refreshAccessToken();
            this.onRefreshSuccess(newToken);
            originalRequest.headers.Authorization = `Bearer ${newToken}`;
            return this.api(originalRequest);
          } catch (refreshError) {
            this.onRefreshFailure();
            return Promise.reject(refreshError);
          } finally {
            this.isRefreshing = false;
          }
        }

        return Promise.reject(error);
      }
    );
  }

  private onRefreshSuccess(token: string): void {
    this.refreshSubscribers.forEach(callback => callback(token));
    this.refreshSubscribers = [];
  }

  private onRefreshFailure(): void {
    tokenManager.clearAll();
    this.refreshSubscribers = [];
  }

  public async refreshAccessToken(): Promise<string> {
    const refreshToken = tokenManager.getRefreshToken();
    if (!refreshToken) {
      throw new Error('No refresh token available');
    }

    const response = await this.api.post(this.config.endpoints.refresh, {
      refreshToken
    });

    const { token } = response.data;
    tokenManager.setToken(token);
    return token;
  }

  async login(credentials: LoginCredentials): Promise<AuthResponse> {
    try {
      const response = await this.api.post(this.config.endpoints.login, {
        ...credentials,
        projectId: this.config.projectId
      });

      const data = response.data;
      
      if (data.token) {
        tokenManager.setToken(data.token);
        tokenManager.setRefreshToken(data.refreshToken);
      }
      
      return data;
    } catch (error) {
      throw handleAuthError(error);
    }
  }

  async register(userData: RegisterData): Promise<AuthResponse> {
    try {
      const response = await this.api.post(this.config.endpoints.register, {
        ...userData,
        projectId: this.config.projectId
      });

      const data = response.data;
      
      if (data.token) {
        tokenManager.setToken(data.token);
        tokenManager.setRefreshToken(data.refreshToken);
      }
      
      return data;
    } catch (error) {
      throw handleAuthError(error);
    }
  }

  async forgotPassword(email: string): Promise<void> {
    try {
      await this.api.post(this.config.endpoints.forgotPassword, { email });
    } catch (error) {
      throw handleAuthError(error);
    }
  }

  async resetPassword(token: string, newPassword: string): Promise<void> {
    try {
      await this.api.post(this.config.endpoints.resetPassword, { token, newPassword });
    } catch (error) {
      throw handleAuthError(error);
    }
  }

  async logout(): Promise<void> {
    try {
      const refreshToken = tokenManager.getRefreshToken();
      if (refreshToken) {
        await this.api.post(this.config.endpoints.logout, { refreshToken });
      }
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      tokenManager.clearAll();
    }
  }

  async verifyToken(): Promise<User | null> {
    try {
      const token = tokenManager.getToken();
      if (!token) return null;

      const response = await this.api.get(this.config.endpoints.verify);
      return response.data;
    } catch (error) {
      tokenManager.clearAll();
      return null;
    }
  }

  getToken(): string | null {
    return tokenManager.getToken();
  }

  isAuthenticated(): boolean {
    return tokenManager.hasTokens();
  }
}

export default AuthAPI;