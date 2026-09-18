import { z } from 'zod';
import { ReactNode } from 'react';

export interface User {
  email: string;
  username?: string;
  provider: string;
  providerId?: string;
  createdAt: string;
  updatedAt: string;
}

export interface ProjectInfo {
  name: string;
  role: string;
}

export interface AuthResponse {
  user: User;
  project?: ProjectInfo;
  message?: string;
}

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface RegisterData {
  username: string;
  email: string;
  password: string;
  [key: string]: any;
}

export interface ForgotPasswordRequest {
  email: string;
}

export interface ResetPasswordRequest {
  token: string;
  newPassword: string;
}

export interface AuthContextType {
  user: User | null;
  project: ProjectInfo | null;
  loading: boolean;
  error: string | null;
  login: (credentials: LoginCredentials) => Promise<AuthResponse>;
  register: (data: RegisterData) => Promise<AuthResponse>;
  logout: () => Promise<void>;
  refreshToken: () => Promise<void>;
  forgotPassword: (email: string) => Promise<void>;
  resetPassword: (token: string, newPassword: string) => Promise<void>;
  isAuthenticated: boolean;
}

export interface AuthProviderProps {
  children: ReactNode;
  authUrl: string;
  loginEndpoint?: string;
  registerEndpoint?: string;
  logoutEndpoint?: string;
  refreshEndpoint?: string;
  verifyEndpoint?: string;
  forgotPasswordEndpoint?: string;
  resetPasswordEndpoint?: string;
  onError?: (error: Error) => void;
}

export interface AuthConfig {
  authUrl: string;
  endpoints: {
    login: string;
    register: string;
    logout: string;
    refresh: string;
    verify: string;
    forgotPassword: string;
    resetPassword: string;
  };
}

export interface FieldConfig {
  name: string;
  type: string;
  label: string;
  required?: boolean;
  placeholder?: string;
}

export interface AuthFormProps {
  schema: z.ZodObject<any>;
  onSubmit?: (data: any) => Promise<any>;
  submitButtonText?: string;
  className?: string;
  renderField?: (field: FieldConfig, formState: any) => ReactNode;
  onSuccess?: (result: AuthResponse) => void;
  onError?: (error: Error) => void;
}