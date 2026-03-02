import React from 'react';
import { useAuthForm } from '../hooks/useAuthForm';
import { isRequired, isValidEmail } from '../utils/validation';
import type { AuthFormProps, Field } from '../types';

export const LoginForm: React.FC<AuthFormProps> = ({
  fields = [
    { name: 'email', type: 'email', label: 'Email', required: true },
    { name: 'password', type: 'password', label: 'Password', required: true }
  ],
  validationRules = {},
  onSubmit,
  submitButtonText = 'Log In',
  renderField,
  onSuccess,
  onError,
  projectId,
  className = ''
}) => {
  const rules = {
    email: [
      { validate: isRequired, message: 'Email is required' },
      { validate: isValidEmail, message: 'Invalid email format' }
    ],
    password: [
      { validate: isRequired, message: 'Password is required' },
      { validate: (v: string) => v?.length >= 6, message: 'Password must be at least 6 characters' }
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
        const submitData = projectId ? { ...data, projectId } : data;
        const result = await onSubmit?.(submitData);
        onSuccess?.(result);
      } catch (err: any) {
        onError?.(err);
      }
    }
  });

  const defaultField = (field: Field) => {
    return (
      <div key={field.name} className="auth-form-field">
        <label htmlFor={field.name}>
          {field.label}
          {field.required && <span className="required">*</span>}
        </label>
        <div className="input-wrapper">
          <input
            id={field.name}
            name={field.name}
            type={field.type || 'text'}
            value={values[field.name] || ''}
            onChange={handleChange}
            onBlur={handleBlur}
            placeholder={field.placeholder}
            className={errors[field.name] ? 'error' : ''}
          />
        </div>
        {errors[field.name] && (
          <small className="error-message">
            {errors[field.name]}
          </small>
        )}
      </div>
    );
  };

  return (
    <form onSubmit={handleSubmit} className={`auth-form ${className}`}>
      {fields.map(field => renderField ? renderField(field, { values, errors, handleChange, handleBlur }) : defaultField(field))}
      
      {errors.form && (
        <div className="form-error">
          {errors.form}
        </div>
      )}
      
      <button type="submit" disabled={loading} className="auth-submit-btn">
        {loading ? 'Please wait...' : submitButtonText}
      </button>
    </form>
  );
};