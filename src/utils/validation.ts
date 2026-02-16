export const isRequired = (value: any): boolean => {
  if (value == null) return false;
  if (typeof value === 'string') return value.trim().length > 0;
  return true;
};


export const isValidEmail = (email: string): boolean => {
  if (!email) return false;
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
};

export const minLength = (value: string, min: number): boolean => {
  if(!value) return false;
  return String(value).length >= min;
}

export const maxLength = (value: string, max: number): boolean => {
  if(!value) return true;
  return String(value).length <= max;
}


export const validateForm = (values: Record<string, any>, rules: any): 
{
  isValid: boolean;
  errors: Record<string, string> 
} => {
  const errors: Record<string, string> = {};

  for(const [field, fieldRules] of Object.entries(rules)){
    for (const rule of fieldRules as any[]) {
      if(!rule.validate(values[field], values)){
        errors[field] = rule.message;
        break;
      }
    }
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors
  };
};