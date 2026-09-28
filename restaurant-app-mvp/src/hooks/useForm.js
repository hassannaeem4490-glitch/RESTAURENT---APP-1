// src/hooks/useForm.js
import { useState } from 'react';

// Generic form-state hook: values, errors, handleChange, handleSubmit, reset, isValid.
export default function useForm(initialValues, validate) {
  const [values, setValues] = useState(initialValues);
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleChange = (field, value) => {
    setValues((prev) => ({ ...prev, [field]: value }));
    setErrors((prev) => {
      if (!prev[field]) return prev;
      const next = { ...prev };
      delete next[field];
      return next;
    });
  };

  const reset = () => {
    setValues(initialValues);
    setErrors({});
  };

  // onValid receives the current values once validation passes.
  const handleSubmit = async (onValid) => {
    const newErrors = validate ? validate(values) : {};
    setErrors(newErrors);
    if (Object.keys(newErrors).length > 0) return;

    setIsSubmitting(true);
    try {
      await onValid(values);
    } finally {
      setIsSubmitting(false);
    }
  };

  const isValid = Object.keys(errors).length === 0;

  return { values, errors, isSubmitting, handleChange, handleSubmit, reset, isValid };
}
