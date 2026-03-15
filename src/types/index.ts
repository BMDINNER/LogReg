import React from 'react';

export interface User {
  id: string;
  email: string;
  username?: string;
  provider: string;
  providerId?: string;
  createdAt: string;
  updatedAt: string;
}

export interface ProjectInfo {
  id: string;
  name: string;
  role: string;
}

export interface AuthResponse {
  token: string;
  refreshToken: string;
  user: User;
  project?: ProjectInfo;
}

export interface LoginCredentials {
  email: string;
  password: string;
  projectId?: string;
}

export interface RegisterData {
  username: string;
  email: string;
  password: string;
  projectId?: string;
}

export interface Field {
  name: string;
  type: string;
  label: string;
  required?: boolean;
  placeholder?: string;
}

export interface ValidationRule {
  validate: (value: any, allValues?: any) => boolean;
  message: string;
}

export interface ValidationRules {
  [key: string]: ValidationRule[];
}

export interface AuthFormProps {
  fields?: Field[];
  validationRules?: ValidationRules;
  onSubmit?: (data: any) => Promise<any>;
  submitButtonText?: string;
  className?: string;
  renderField?: (field: Field, formState: any) => React.ReactNode;
  onSuccess?: (result: AuthResponse) => void;
  onError?: (error: Error) => void;
  projectId?: string;
}

export interface AuthContextType {
  user: User | null;
  project: ProjectInfo | null;
  loading: boolean;
  error: string | null;
  login: (credentials: LoginCredentials) => Promise<AuthResponse>;
  register: (data: RegisterData) => Promise<AuthResponse>;
  logout: () => Promise<void>;
  isAuthenticated: boolean;
}

export interface AuthProviderProps {
  children: React.ReactNode;
  baseURL: string;
  apiKey: string;
  projectId: string;
  loginEndpoint?: string;
  registerEndpoint?: string;
  verifyEndpoint?: string;
  logoutEndpoint?: string;
  refreshEndpoint?: string;
  onError?: (error: Error) => void;
}