import axios from 'axios';
import {  AxiosInstance, InternalAxiosRequestConfig, AxiosError } from 'axios';
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
  private refreshSubscribers: Array<() => void> = [];

  constructor(authUrl: string, customEndpoints?: Partial<AuthConfig['endpoints']>) {
    this.config = {
      authUrl,
      endpoints: {
        ...DEFAULT_ENDPOINTS,
        ...customEndpoints
      }
    };

    this.api = axios.create({
      baseURL: authUrl,
      timeout: 15000,
      withCredentials: true,
      headers: {
        'Content-Type': 'application/json'
      }
    });

    this.setupInterceptors();
  }

  private setupInterceptors(): void {
    this.api.interceptors.request.use(
      (config: InternalAxiosRequestConfig) => config,
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
            return new Promise((resolve, reject) => {
              this.refreshSubscribers.push(() => {
                this.api(originalRequest).then(resolve).catch(reject);
              });
            });
          }

          originalRequest._retry = true;
          this.isRefreshing = true;

          try {
            await this.refreshAccessToken();
            this.onRefreshSuccess();
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

  private onRefreshSuccess(): void {
    this.refreshSubscribers.forEach((callback) => callback());
    this.refreshSubscribers = [];
  }

  private onRefreshFailure(): void {
    this.refreshSubscribers = [];
  }

  public async refreshAccessToken(): Promise<void> {
    await this.api.post(this.config.endpoints.refresh);
  }

  async login(credentials: LoginCredentials): Promise<AuthResponse> {
    try {
      const response = await this.api.post(this.config.endpoints.login, credentials);
      return response.data;
    } catch (error) {
      throw handleAuthError(error);
    }
  }

  async register(userData: RegisterData): Promise<AuthResponse> {
    try {
      const response = await this.api.post(this.config.endpoints.register, userData);
      return response.data;
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
      await this.api.post(this.config.endpoints.logout);
    } catch (error) {
      console.error('Logout error:', error);
    }
  }

  async verifyToken(): Promise<User | null> {
    try {
      const response = await this.api.get(this.config.endpoints.verify);
      const userData = response.data.user || response.data;
      return userData;
    } catch (error) {
      return null;
    }
  }
}

export default AuthAPI;