import React from 'react';
import { useAuthForm } from '../hooks/useAuthForm';
import { isRequired, isValidEmail } from '../utils/validation';
import type { AuthFormProps, Field } from '../types';
import '@fortawesome/fontawesome-free/css/all.min.css';
import '../../styles/tailwind/register-form.css';

export const RegisterForm: React.FC<AuthFormProps> = ({
  fields = [
    { name: 'username', type: 'text', label: 'Username', required: true },
    { name: 'email', type: 'email', label: 'Email', required: true },
    { name: 'password', type: 'password', label: 'Password', required: true },
    { name: 'confirmPassword', type: 'password', label: 'Confirm Password', required: true }
  ],
  validationRules = {},
  onSubmit,
  submitButtonText = 'Sign Up',
  className = '',
  renderField,
  onSuccess,
  onError
}) => {
  const rules = {
    username: [
      { validate: isRequired, message: 'Username is required' },
      { validate: (v: string) => v?.length >= 3, message: 'At least 3 characters' }
    ],
    email: [
      { validate: isRequired, message: 'Email is required' },
      { validate: isValidEmail, message: 'Invalid email' }
    ],
    password: [
      { validate: isRequired, message: 'Password is required' },
      { validate: (v: string) => v?.length >= 8, message: 'Minimum 8 characters' },
      { validate: (v: string) => /[A-Z]/.test(v), message: 'Need one uppercase letter' },
      { validate: (v: string) => /[0-9]/.test(v), message: 'Need one number' }
    ],
    confirmPassword: [
      { validate: isRequired, message: 'Please confirm your password' },
      { validate: (v: string, all: any) => v === all?.password, message: 'Passwords do not match' }
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
        const { confirmPassword, ...submitData } = data;
        const result = await onSubmit?.(submitData);
        onSuccess?.(result);
      } catch (err: any) {
        onError?.(err);
      }
    }
  });

  const getFieldIcon = (field: Field): string | null => {
    if (field.name === 'username') return 'fas fa-user';
    if (field.type === 'email') return 'fas fa-envelope';
    if (field.type === 'password') return 'fas fa-lock';
    return null;
  };

  const defaultField = (field: Field) => {
    const icon = getFieldIcon(field);
    
    return (
      <div key={field.name} className="register-form-field">
        <label className="register-form-label">
          {field.label}
          {field.required && <span className="register-form-required">*</span>}
        </label>
        <div className="register-form-input-wrapper">
          {icon && (
            <i className={`${icon} register-form-input-icon`}></i>
          )}
          <input
            name={field.name}
            type={field.type || 'text'}
            value={values[field.name] || ''}
            onChange={handleChange}
            onBlur={handleBlur}
            placeholder={field.placeholder}
            className={`register-form-input ${icon ? 'register-form-input-with-icon' : ''} ${
              errors[field.name] ? 'register-form-input-error' : ''
            }`}
          />
        </div>
        {errors[field.name] && (
          <small className="register-form-error-message">
            <i className="fas fa-exclamation-circle register-form-error-icon"></i>
            {errors[field.name]}
          </small>
        )}
      </div>
    );
  };

  // Password strength indicator
  const getPasswordStrength = (password: string) => {
    if (!password) return null;
    const checks = [
      password.length >= 8,
      /[A-Z]/.test(password),
      /[0-9]/.test(password)
    ];
    const strength = checks.filter(Boolean).length;
    
    if (strength === 3) return { 
      barClass: 'register-form-strength-bar-strong', 
      text: 'Strong', 
      icon: 'fas fa-shield-alt text-green-500' 
    };
    if (strength === 2) return { 
      barClass: 'register-form-strength-bar-medium', 
      text: 'Medium', 
      icon: 'fas fa-exclamation-triangle text-yellow-500' 
    };
    return { 
      barClass: 'register-form-strength-bar-weak', 
      text: 'Weak', 
      icon: 'fas fa-times-circle text-red-500' 
    };
  };

  const passwordStrength = values.password ? getPasswordStrength(values.password) : null;

  // Password requirements checklist
  const passwordChecks = [
    { check: values.password?.length >= 8, text: 'At least 8 characters' },
    { check: /[A-Z]/.test(values.password || ''), text: 'One uppercase letter' },
    { check: /[0-9]/.test(values.password || ''), text: 'One number' }
  ];

  return (
    <form onSubmit={handleSubmit} className={`register-form-container ${className}`}>
      {fields.map(field => renderField ? renderField(field, { values, errors, handleChange, handleBlur }) : defaultField(field))}
      
      {/* Password strength indicator */}
      {values.password && passwordStrength && (
        <div className="register-form-strength-container">
          <div className="register-form-strength-header">
            <i className={`${passwordStrength.icon} register-form-strength-icon`}></i>
            <span className="register-form-strength-text">
              Password Strength: {passwordStrength.text}
            </span>
          </div>
          <div className="register-form-strength-bar-bg">
            <div 
              className={`register-form-strength-bar ${passwordStrength.barClass}`}
              style={{ width: `${(passwordStrength.text === 'Strong' ? 100 : passwordStrength.text === 'Medium' ? 66 : 33)}%` }}
            />
          </div>
          
          {/* Password requirements checklist */}
          <div className="register-form-checklist">
            {passwordChecks.map((item, index) => (
              <div key={index} className="register-form-checklist-item">
                <i className={`fas fa-check-circle register-form-checklist-icon ${
                  item.check ? 'register-form-checklist-icon-valid' : 'register-form-checklist-icon-invalid'
                }`}></i>
                <span className={item.check ? 'register-form-checklist-text-valid' : 'register-form-checklist-text-invalid'}>
                  {item.text}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
      
      {errors.form && (
        <div className="register-form-global-error">
          <i className="fas fa-exclamation-triangle register-form-global-error-icon"></i>
          {errors.form}
        </div>
      )}
      
      <button 
        type="submit" 
        disabled={loading}
        className={`register-form-submit ${
          loading ? 'register-form-submit-disabled' : 'register-form-submit-enabled'
        }`}
      >
        {loading ? (
          <span className="register-form-submit-content">
            <i className="fas fa-circle-notch fa-spin register-form-spinner"></i>
            Creating account...
          </span>
        ) : (
          <span className="register-form-submit-content">
            <i className="fas fa-user-plus register-form-submit-icon"></i>
            {submitButtonText}
          </span>
        )}
      </button>
    </form>
  );
};