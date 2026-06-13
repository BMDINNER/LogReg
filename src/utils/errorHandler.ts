import { tokenManager } from './tokenManager';

export class AuthError extends Error {
  public statusCode?: number;
  public originalError?: any;

  constructor(message: string, statusCode?: number, originalError?: any) {
    super(message);
    this.name = 'AuthError';
    this.statusCode = statusCode;
    this.originalError = originalError;
  }
}

export const handleAuthError = (error: any): AuthError => {
  if (error.response) {
    const statusCode = error.response.status;
    const message = error.response.data?.message || error.response.data?.error || `Authentication failed (${statusCode})`;
    
    if (statusCode === 401) {
      tokenManager.clearAll();
      return new AuthError('Session expired. Please login again.', statusCode, error);
    }
    
    return new AuthError(message, statusCode, error);
  }
  
  if (error.request) {
    return new AuthError('Unable to connect to authentication service', 503, error);
  }
  
  return new AuthError(error.message || 'An unknown error occurred', 500, error);
};