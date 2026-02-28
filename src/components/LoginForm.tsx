import React from 'react';
import { useAuthForm } from '../hooks/useAuthForm.ts';
import { isRequired, isValidEmail } from '../utils/validation.ts';
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
    return (
      <div key={field.name}>
        <label>
          {field.label}
          {field.required && <span>*</span>}
        </label>
        <div>
          <input
            name={field.name}
            type={field.type || 'text'}
            value={values[field.name] || ''}
            onChange={handleChange}
            onBlur={handleBlur}
            placeholder={field.placeholder}
          />
        </div>
        {errors[field.name] && (
          <small>
            {errors[field.name]}
          </small>
        )}
      </div>
    );
  };

  return (
    <form onSubmit={handleSubmit}>
      {fields.map(field => renderField ? renderField(field, { values, errors, handleChange, handleBlur }) : defaultField(field))}
      
      {errors.form && (
        <div>
          {errors.form}
        </div>
      )}
      
      <button type="submit" disabled={loading}>
        {loading ? 'Please wait...' : submitButtonText}
      </button>
    </form>
  );
};