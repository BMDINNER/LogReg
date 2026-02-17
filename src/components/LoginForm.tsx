import React from 'react';
import { useAuthForm } from '../hooks/useAuthForm';
import { isRequired, isValidEmail } from '../utils/validation';
import type { AuthFormProps, Field } from '../types';
import '@fortawesome/fontawesome-free/css/all.min.css';
import '../../styles/tailwind/login-form.css';

export const LoginForm: React.FC<AuthFormProps> = ({
  fields = [
    { name: 'email', type: 'email', label: 'Email', required: true },
    { name: 'password', type: 'password', label: 'Password', required: true }
  ],
  validationRules = {},
  onSubmit,
  submitButtonText = 'Log In',
  className = '',
  renderField,
  onSuccess,
  onError
}) => {
  const rules = {
    email: [
      { validate: isRequired, message: 'Email is required' },
      { validate: isValidEmail, message: 'Invalid email format' }
    ],
    password: [
      { validate: isRequired, message: 'Password is required' },
      { validate: (v: string) => v?.length >= 6, message: 'Password too short' }
    ],
    ...validationRules
  };

  const {
    values,
    errors,
    loading,
    handleChange,
    handleBlur,
    handleSubmit
  } = useAuthForm({
    initialValues: fields.reduce((acc, f) => ({ ...acc, [f.name]: '' }), {}),
    validationRules: rules,
    onSubmit: async (data) => {
      try {
        const result = await onSubmit?.(data);
        onSuccess?.(result);
      } catch (err: any) {
        onError?.(err);
      }
    }
  });

  const defaultField = (field: Field) => {
    const hasIcon = field.type === 'email' || field.type === 'password';
    
    return (
      <div key={field.name} className="login-form-field">
        <label className="login-form-label">
          {field.label}
          {field.required && <span className="login-form-required">*</span>}
        </label>
        <div className="login-form-input-wrapper">
          {field.type === 'email' && (
            <i className="fas fa-envelope login-form-input-icon"></i>
          )}
          {field.type === 'password' && (
            <i className="fas fa-lock login-form-input-icon"></i>
          )}
          <input
            name={field.name}
            type={field.type || 'text'}
            value={values[field.name] || ''}
            onChange={handleChange}
            onBlur={handleBlur}
            placeholder={field.placeholder}
            className={`login-form-input ${hasIcon ? 'login-form-input-with-icon' : ''} ${
              errors[field.name] ? 'login-form-input-error' : ''
            }`}
          />
        </div>
        {errors[field.name] && (
          <small className="login-form-error-message">
            <i className="fas fa-exclamation-circle login-form-error-icon"></i>
            {errors[field.name]}
          </small>
        )}
      </div>
    );
  };

  return (
    <form onSubmit={handleSubmit} className={`login-form-container ${className}`}>
      {fields.map(field => renderField ? renderField(field, { values, errors, handleChange, handleBlur }) : defaultField(field))}
      
      {errors.form && (
        <div className="login-form-global-error">
          <i className="fas fa-exclamation-triangle login-form-global-error-icon"></i>
          {errors.form}
        </div>
      )}
      
      <button 
        type="submit" 
        disabled={loading}
        className={`login-form-submit ${
          loading ? 'login-form-submit-disabled' : 'login-form-submit-enabled'
        }`}
      >
        {loading ? (
          <span className="login-form-submit-content">
            <i className="fas fa-circle-notch fa-spin login-form-spinner"></i>
            Please wait...
          </span>
        ) : (
          <span className="login-form-submit-content">
            <i className="fas fa-sign-in-alt login-form-submit-icon"></i>
            {submitButtonText}
          </span>
        )}
      </button>
    </form>
  );
};