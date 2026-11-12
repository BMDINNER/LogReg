import React from 'react';
import { useAuthForm } from '../hooks/useAuthForm';
import { AuthFormProps, FieldConfig } from '../types';

export const LoginForm: React.FC<AuthFormProps> = ({
  schema,
  onSubmit,
  submitButtonText = 'Sign In',
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

  return React.createElement(
    'form',
    { onSubmit: handleSubmit, className: `auth-form ${className}` },
    fields.map((field) =>
      renderField
        ? renderField(field, { values, errors, handleChange, handleBlur })
        : defaultField(field)
    ),
    errors.form && React.createElement('div', { className: 'form-error' }, errors.form),
    React.createElement(
      'button',
      { type: 'submit', disabled: loading, className: 'auth-submit-btn' },
      loading ? 'Please wait...' : submitButtonText
    )
  );
};