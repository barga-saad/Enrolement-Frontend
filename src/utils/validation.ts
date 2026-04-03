/**
 * Form Validation Utilities
 * Client-side validation rules and helpers
 */

export type ValidationRule = (value: any) => string | null;

export const validators = {
  required: (fieldName: string): ValidationRule => (value: any) => {
    if (!value || (typeof value === 'string' && value.trim() === '')) {
      return `${fieldName} is required`;
    }
    return null;
  },

  email: (): ValidationRule => (value: string) => {
    if (!value) return null;
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(value) ? null : 'Invalid email address';
  },

  minLength: (length: number): ValidationRule => (value: string) => {
    if (!value) return null;
    return value.length >= length ? null : `Minimum ${length} characters required`;
  },

  maxLength: (length: number): ValidationRule => (value: string) => {
    if (!value) return null;
    return value.length <= length ? null : `Maximum ${length} characters allowed`;
  },

  minValue: (min: number): ValidationRule => (value: number) => {
    if (!value && value !== 0) return null;
    return value >= min ? null : `Minimum value is ${min}`;
  },

  maxValue: (max: number): ValidationRule => (value: number) => {
    if (!value && value !== 0) return null;
    return value <= max ? null : `Maximum value is ${max}`;
  },

  pattern: (regex: RegExp, message: string): ValidationRule => (value: string) => {
    if (!value) return null;
    return regex.test(value) ? null : message;
  },

  phone: (): ValidationRule => (value: string) => {
    if (!value) return null;
    const phoneRegex = /^[\d\s\-\+\(\)]+$/;
    return phoneRegex.test(value) ? null : 'Invalid phone number';
  },

  bankAccount: (): ValidationRule => (value: string) => {
    if (!value) return null;
    // IBAN-like format: 2 letters, 2 digits, then alphanumeric
    const ibanRegex = /^[A-Z]{2}\d{2}[A-Z0-9]{1,30}$/;
    return ibanRegex.test(value.toUpperCase()) ? null : 'Invalid bank account number';
  },

  custom: (validator: (value: any) => boolean, message: string): ValidationRule => (value: any) => {
    return validator(value) ? null : message;
  },
};

// Validate a single field
export const validateField = (value: any, rules: ValidationRule[]): string | null => {
  for (const rule of rules) {
    const error = rule(value);
    if (error) return error;
  }
  return null;
};

// Validate entire form
export const validateForm = <T extends Record<string, any>>(
  data: T,
  validationRules: Partial<Record<keyof T, ValidationRule[]>>
): Record<keyof T, string | null> => {
  const errors: Record<string, string | null> = {};
  
  for (const [field, rules] of Object.entries(validationRules)) {
    if (rules) {
      errors[field] = validateField(data[field as keyof T], rules as ValidationRule[]);
    }
  }
  
  return errors as Record<keyof T, string | null>;
};

// Check if form has any errors
export const hasErrors = (errors: Record<string, string | null>): boolean => {
  return Object.values(errors).some((error) => error !== null);
};
