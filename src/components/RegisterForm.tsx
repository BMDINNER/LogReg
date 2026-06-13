import React from 'react';
import { useAuthForm } from '../hooks/useAuthForm';
import { isRequired, isValidEmail, minLength, hasUppercase, hasNumber, matches } from '../utils/validation';
import { AuthFormProps, Field } from '../types';

export const RegisterForm: React.FC<AuthFormProps> = ({
  fields = [
    { name: 'username', type: 'text', label: 'Username', required: true, placeholder: 'johndoe' },
    { name: 'email', type: 'email', label: 'Email', required: true, placeholder: 'you@example.com' },
    { name: 'password', type: 'password', label: 'Password', required: true, placeholder: 'password' },
    { name: 'confirmPassword', type: 'password', label: 'Confirm Password', required: true, placeholder: 'confirm password' }
  ],
  validationRules = {},
  onSubmit,
  submitButtonText = 'Sign Up',
  renderField,
  onSuccess,
  onError,
  className = ''
}) => {
  const rules = {
    username: [
      { validate: isRequired, message: 'Username is required' },
      { validate: (v: string) => v?.length >= 3, message: 'Username must be at least 3 characters' }
    ],
    email: [
      { validate: isRequired, message: 'Email is required' },
      { validate: isValidEmail, message: 'Invalid email format' }
    ],
    password: [
      { validate: isRequired, message: 'Password is required' },
      { validate: (v: string) => minLength(v, 8), message: 'Password must be at least 8 characters' },
      { validate: hasUppercase, message: 'Password must contain at least one uppercase letter' },
      { validate: hasNumber, message: 'Password must contain at least one number' }
    ],
    confirmPassword: [
      { validate: isRequired, message: 'Please confirm your password' },
      { validate: (v: string, all: any) => matches(v, all?.password), message: 'Passwords do not match' }
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

  const passwordChecks = [
    { check: values.password?.length >= 8, text: 'At least 8 characters' },
    { check: /[A-Z]/.test(values.password || ''), text: 'One uppercase letter' },
    { check: /[0-9]/.test(values.password || ''), text: 'One number' }
  ];

  const getPasswordStrength = () => {
    const passedCount = passwordChecks.filter(c => c.check).length;
    if (passedCount === 3) return 'Strong';
    if (passedCount >= 2) return 'Medium';
    return 'Weak';
  };

  return React.createElement('form', { onSubmit: handleSubmit, className: `auth-form ${className}` },
    fields.map(field => renderField ? renderField(field, { values, errors, handleChange, handleBlur }) : defaultField(field)),
    
    values.password && React.createElement('div', { className: 'password-strength' },
      React.createElement('div', { className: 'strength-label' },
        'Password Strength: ',
        React.createElement('span', { className: `strength-${getPasswordStrength().toLowerCase()}` }, getPasswordStrength())
      ),
      React.createElement('div', { className: 'password-checks' },
        passwordChecks.map((item, index) =>
          React.createElement('div', { key: index, className: 'check-item' },
            React.createElement('span', { className: item.check ? 'check-pass' : 'check-fail' }, item.check ? '✓' : '○'),
            React.createElement('span', { className: 'check-text' }, item.text)
          )
        )
      )
    ),
    
    errors.form && React.createElement('div', { className: 'form-error' }, errors.form),
    
    React.createElement('button', { type: 'submit', disabled: loading, className: 'auth-submit-btn' },
      loading ? 'Creating account...' : submitButtonText
    )
  );
};