import React from 'react';
import { useAuthForm } from '../hooks/useAuthForm.ts';
import { isRequired, isValidEmail } from '../utils/validation.ts';
import type { AuthFormProps, Field } from '../types';

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

  const passwordChecks = [
    { check: values.password?.length >= 8, text: 'At least 8 characters' },
    { check: /[A-Z]/.test(values.password || ''), text: 'One uppercase letter' },
    { check: /[0-9]/.test(values.password || ''), text: 'One number' }
  ];

  return (
    <form onSubmit={handleSubmit}>
      {fields.map(field => renderField ? renderField(field, { values, errors, handleChange, handleBlur }) : defaultField(field))}
      
      {values.password && (
        <div>
          <div>
            <span>Password Strength: </span>
            {passwordChecks.every(c => c.check) ? 'Strong' : 
             passwordChecks.filter(c => c.check).length >= 2 ? 'Medium' : 'Weak'}
          </div>
          
          <div>
            {passwordChecks.map((item, index) => (
              <div key={index}>
                <span>{item.check ? '✓' : '○'}</span>
                <span>{item.text}</span>
              </div>
            ))}
          </div>
        </div>
      )}
      
      {errors.form && (
        <div>
          {errors.form}
        </div>
      )}
      
      <button type="submit" disabled={loading}>
        {loading ? 'Creating account...' : submitButtonText}
      </button>
    </form>
  );
};