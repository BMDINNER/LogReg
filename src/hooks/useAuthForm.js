import {  useState, useCallback } from 'react';


export const useAuthForm = ({
  initialValues = {},
  validationRules = {},
  onSubmit
}) => {
  const [values, setValues] = useState(initialValues);
  const [errors, setErrors] = useState({});
  const [touched, setTouched] = useState({});
  const [loading, setLoading] = useState(false);


  const validate = useCallback((data = values) => {
    const newErrors = {};


    for (const [field, rules] of Object.entries(validationRules)) {
      for (const rule of rules) {
        if(!rule.validate(data[field], data)) {
          newErrors[field] = rule.message;
          break;
        }
      }
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }, 
  
  [values, validationRules]
);


const handleChange = (e) => {
  const { name, value} = e.target;
  const newValues = {...values, [name]: value };
  setValues(newValues);

  if(touched[name]){
    validate(newValues);
  }
};


const handleBlur = (e) => {
  const { name  } = e.target;
  setTouched({...touched, [name]: true});
  validate();
};


const handleSubmit = async (e) => {
  e?.preventDefault();

  //Marking as touched
  const allTouched = Object.keys(values).reduce((acc, key) => ({
    ...acc,
    [key]: true
  }), {});

  setTouched(allTouched);

  if(!validate()) return;


  setLoading(true);

  try{
    const result = await onSubmit?.(values);
    return result;
  } catch(error){
    setErrors({ form: error.message});
    throw error;
  }finally {
    setLoading(false);
  }
};


const reset = () => {
  setValues(initialValues);
  setErrors({});
  setTouched({});
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
  setFieldValue: (field, value) => setValues({...values, [field]: value})
};

};