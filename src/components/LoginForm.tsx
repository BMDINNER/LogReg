import React from 'react';
import { useAuthForm } from '../hooks/useAuthForm';
import { isRequired, isValidEmail } from '../utils/validation';
import { AuthFormProps, Field } from '../types';

export const LoginForm: React.FC<AuthFormProps> = ({
  fields = [
    { name: 'email', type: 'email', label: 'Email', required: true, placeholder: 'you@example.com' },
    { name: 'password', type: 'password', label: 'Password', required: true, placeholder: 'password' }
  ],
  validationRules = {},
  onSubmit,
  submitButtonText = 'Sign In',
  renderField,
  onSuccess,
  onError,
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
        const result = await onSubmit?.(data);
        onSuccess?.(result);
        return result;
      } catch (err: any) {
        onError?.(err);
        throw err;
      }
    }
  });

  const defaultField = (field: Field) => {
    return React.createElement('div', { key: field.name, className: 'auth-form-field' },
      React.createElement('label', { htmlFor: field.name },
        field.label,
        field.required && React.createElement('span', { className: 'required-star' }, '*')
      ),
      React.createElement('div', { className: 'input-wrapper' },
        React.createElement('input', {
          id: field.name,
          name: field.name,
          type: field.type || 'text',
          value: values[field.name] || '',
          onChange: handleChange,
          onBlur: handleBlur,
          placeholder: field.placeholder,
          className: errors[field.name] ? 'error' : ''
        })
      ),
      errors[field.name] && React.createElement('small', { className: 'error-message' }, errors[field.name])
    );
  };

  return React.createElement('form', { onSubmit: handleSubmit, className: `auth-form ${className}` },
    fields.map(field => renderField ? renderField(field, { values, errors, handleChange, handleBlur }) : defaultField(field)),
    errors.form && React.createElement('div', { className: 'form-error' }, errors.form),
    React.createElement('button', { type: 'submit', disabled: loading, className: 'auth-submit-btn' },
      loading ? 'Please wait...' : submitButtonText
    )
  );
};