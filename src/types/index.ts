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
  refreshToken: () => Promise<string | null>;
  forgotPassword: (email: string) => Promise<void>;
  resetPassword: (token: string, newPassword: string) => Promise<void>;
  isAuthenticated: boolean;
}

export interface AuthProviderProps {
  children: React.ReactNode;
  authUrl: string;
  apiKey: string;
  projectId: string;
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
  apiKey: string;
  projectId: string;
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
}