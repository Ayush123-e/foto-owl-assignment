/**
 * validations.ts – Regex & logic schemas for inputs.
 */

export const validationRules = {
  fullName: {
    required: 'Full name is required',
    minLength: {
      value: 2,
      message: 'Full name must be at least 2 characters',
    },
  },
  email: {
    required: 'Email is required',
    pattern: {
      value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
      message: 'Please enter a valid email address',
    },
  },
  mobile: {
    required: 'Mobile number is required',
    pattern: {
      value: /^[0-9]{10}$/,
      message: 'Mobile number must be exactly 10 digits',
    },
  },
  address: {
    required: 'Address is required',
  },
  city: {
    required: 'Please select a city',
  },
  password: {
    required: 'Password is required',
    minLength: {
      value: 6,
      message: 'Password must be at least 6 characters',
    },
  },
};
