import React from 'react';
import { useAuthForm } from '../hooks/useAuthForm';
import { AuthFormProps, FieldConfig } from '../types';

export const RegisterForm: React.FC<AuthFormProps> = ({
  schema,
  onSubmit,
  submitButtonText = 'Sign Up',
  renderField,
  onSuccess,
  onError,
  className = ''
}) => {
  const shape = schema.shape;

  const fields: FieldConfig[] = Object.keys(shape).map((key) => {
    let type = 'text';
    if (key.toLowerCase().includes('password')) type = 'password';
    if (key.toLowerCase().includes('email')) type = 'email';

    return {
      name: key,
      type,
      label: key.charAt(0).toUpperCase() + key.slice(1),
      required: !(shape[key] as any).isOptional(),
      placeholder: `Enter your ${key}`
    };
  });

  const {
    values,
    errors,
    loading,
    handleChange,
    handleBlur,
    handleSubmit
  } = useAuthForm({
    schema,
    initialValues: fields.reduce((acc, f) => ({ ...acc, [f.name]: '' }), {}),
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

  const defaultField = (field: FieldConfig) => {
    return React.createElement(
      'div',
      { key: field.name, className: 'auth-form-field' },
      React.createElement(
        'label',
        { htmlFor: field.name },
        field.label,
        field.required && React.createElement('span', { className: 'required-star' }, '*')
      ),
      React.createElement(
        'div',
        { className: 'input-wrapper' },
        React.createElement('input', {
          id: field.name,
          name: field.name,
          type: field.type,
          value: values[field.name] || '',
          onChange: handleChange,
          onBlur: handleBlur,
          placeholder: field.placeholder,
          className: errors[field.name] ? 'error' : ''
        })
      ),
      errors[field.name] &&
        React.createElement('small', { className: 'error-message' }, errors[field.name])
    );
  };

  const passwordValue = values.password || '';
  const passwordChecks = [
    { check: passwordValue.length >= 8, text: 'At least 8 characters' },
    { check: /[A-Z]/.test(passwordValue), text: 'One uppercase letter' },
    { check: /[0-9]/.test(passwordValue), text: 'One number' }
  ];

  const getPasswordStrength = () => {
    const passedCount = passwordChecks.filter((c) => c.check).length;
    if (passedCount === 3) return 'Strong';
    if (passedCount >= 2) return 'Medium';
    return 'Weak';
  };

  return React.createElement(
    'form',
    { onSubmit: handleSubmit, className: `auth-form ${className}` },
    fields.map((field) =>
      renderField
        ? renderField(field, { values, errors, handleChange, handleBlur })
        : defaultField(field)
    ),
    values.password &&
      React.createElement(
        'div',
        { className: 'password-strength' },
        React.createElement(
          'div',
          { className: 'strength-label' },
          'Password Strength: ',
          React.createElement(
            'span',
            { className: `strength-${getPasswordStrength().toLowerCase()}` },
            getPasswordStrength()
          )
        ),
        React.createElement(
          'div',
          { className: 'password-checks' },
          passwordChecks.map((item, index) =>
            React.createElement(
              'div',
              { key: index, className: 'check-item' },
              React.createElement(
                'span',
                { className: item.check ? 'check-pass' : 'check-fail' },
                item.check ? '✓' : '○'
              ),
              React.createElement('span', { className: 'check-text' }, item.text)
            )
          )
        )
      ),
    errors.form && React.createElement('div', { className: 'form-error' }, errors.form),
    React.createElement(
      'button',
      { type: 'submit', disabled: loading, className: 'auth-submit-btn' },
      loading ? 'Creating account...' : submitButtonText
    )
  );
};