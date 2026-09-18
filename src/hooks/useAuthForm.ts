import { useState, useCallback, ChangeEvent } from 'react';
import { z } from 'zod';
import { validateWithZod } from '../utils/validation';

interface UseAuthFormProps {
  schema: z.ZodObject<any>;
  initialValues?: Record<string, any>;
  onSubmit: (values: Record<string, any>) => Promise<any>;
}

export const useAuthForm = ({ schema, initialValues = {}, onSubmit }: UseAuthFormProps) => {
  const [values, setValues] = useState<Record<string, any>>(initialValues);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [touched, setTouched] = useState<Record<string, boolean>>({});
  const [loading, setLoading] = useState(false);

  const validate = useCallback(
    (data = values) => {
      const { isValid, errors: validationErrors } = validateWithZod(schema, data);
      setErrors(validationErrors);
      return isValid;
    },
    [values, schema]
  );

  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    const newValues = { ...values, [name]: value };
    setValues(newValues);

    if (touched[name]) {
      validate(newValues);
    }
  };

  const handleBlur = (e: ChangeEvent<HTMLInputElement>) => {
    const { name } = e.target;
    setTouched({ ...touched, [name]: true });
    validate();
  };

  const handleSubmit = async (e?: React.FormEvent<HTMLFormElement>) => {
    e?.preventDefault();

    const allTouched = Object.keys(values).reduce(
      (acc, key) => ({ ...acc, [key]: true }),
      {}
    );
    setTouched(allTouched);

    if (!validate()) return;

    setLoading(true);
    try {
      const result = await onSubmit(values);
      return result;
    } catch (err: any) {
      setErrors({ form: err.message });
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const reset = () => {
    setValues(initialValues);
    setErrors({});
    setTouched({});
  };

  const setFieldValue = (field: string, value: any) => {
    setValues({ ...values, [field]: value });
  };

  return {
    values,
    errors,
    touched,
    loading,
    handleChange,
    handleBlur,
    handleSubmit,
    reset,
    setFieldValue,
    validate
  };
};