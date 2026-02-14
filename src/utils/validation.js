export const isRequired = (value) => {
  if (value == null) return false;
  if (typeof value === 'string') return value.trim().length > 0;
  return true;
};

//Checking email format
export const isValidEmail = (email) => {
  if (!email) return false;
  //Email must have "@", ".", more than one chars other than space or @ 
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
};

export const minLength = (value, min) => {
  if (!value) return false;
  return String(value).length >= min;
};


export const maxLength = (value, max) => {
  if (!value) return true;
  return String(value).length <= max;
};


export const validateForm = (values, rules) => {
  const errors = {};

  for (const[field, fieldRules] of Object.entries(rules)) {
    for (const rule of fieldRules) {
      if (!rule.validate(values[field], values)) {
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