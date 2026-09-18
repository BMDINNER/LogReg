export { AuthProvider, AuthContext } from './AuthProvider';
export { useAuth } from './hooks/useAuth';
export { useAuthForm } from './hooks/useAuthForm';
export { LoginForm } from './components/LoginForm';
export { RegisterForm } from './components/RegisterForm';
export { default as AuthAPI } from './AuthAPI';
export { AuthError, handleAuthError } from './utils/errorHandler';
export { validateWithZod } from './utils/validation';

export type {
  User,
  ProjectInfo,
  AuthResponse,
  LoginCredentials,
  RegisterData,
  ForgotPasswordRequest,
  ResetPasswordRequest,
  FieldConfig,
  AuthFormProps,
  AuthContextType,
  AuthProviderProps
} from './types';