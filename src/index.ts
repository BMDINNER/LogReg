export { AuthProvider, AuthContext } from './AuthProvider';
export { useAuth } from './hooks/useAuth';
export { useAuthForm } from './hooks/useAuthForm';
export { LoginForm } from './components/LoginForm';
export { RegisterForm } from './components/RegisterForm';
export { default as AuthAPI } from './AuthAPI';
export { tokenManager } from './utils/tokenManager';
export { AuthError, handleAuthError } from './utils/errorHandler';

export {
  isRequired,
  isValidEmail,
  minLength,
  maxLength,
  matches,
  hasUppercase,
  hasNumber,
  validateForm
} from './utils/validation';

export type {
  User,
  ProjectInfo,
  AuthResponse,
  LoginCredentials,
  RegisterData,
  ForgotPasswordRequest,
  ResetPasswordRequest,
  Field,
  ValidationRule,
  ValidationRules,
  AuthFormProps,
  AuthContextType,
  AuthProviderProps
} from './types';