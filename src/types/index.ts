export interface User {
  id: string;
  email: string;
  username?: string;
  provider: string;
  providerId?: string;
  createdAt: string;
  updatedAt: string;
}

export interface AuthResponse {
  token: string;
  refreshToken: string;
  user: User;
}

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface RegisterData {
  username: string;
  email: string;
  password: string;
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
  onSuccess?: (result: any) => void;
  onError?: (error: Error) => void;
}

export interface AuthContextType {
  user: User | null;
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
  loginEndpoint?: string;
  registerEndpoint?: string;
  verifyEndpoint?: string;
  logoutEndpoint?: string;
  refreshEndpoint?: string;
  onError?: (error: Error) => void;
}