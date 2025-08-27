/**
 * Validation utilities for form fields
 */

/**
 * Formats a phone number to 555-555-5555 format
 * Handles +1 country code removal and rejects other country codes
 */
export const formatPhoneNumber = (value: string): string => {
  // Remove all non-numeric characters except +
  let cleanValue = value.replace(/[^\d+]/g, '');
  
  // Handle country codes
  if (cleanValue.startsWith('+')) {
    if (cleanValue.startsWith('+1')) {
      // Remove +1 country code for US
      cleanValue = cleanValue.substring(2);
    } else {
      // Reject other country codes - return error indicator
      return 'INVALID_COUNTRY_CODE';
    }
  }
  
  // Remove all non-numeric characters
  const numbers = cleanValue.replace(/\D/g, '');
  
  // If empty, return empty
  if (!numbers) return '';
  
  // If less than 4 digits, just return the numbers
  if (numbers.length <= 3) return numbers;
  
  // If less than 7 digits, format as 555-555
  if (numbers.length <= 6) {
    return `${numbers.slice(0, 3)}-${numbers.slice(3)}`;
  }
  
  // Format as 555-555-5555
  return `${numbers.slice(0, 3)}-${numbers.slice(3, 6)}-${numbers.slice(6, 10)}`;
};

/**
 * Validates if a phone number is valid US format
 */
export const isValidPhoneNumber = (phone: string): boolean => {
  // Remove all non-numeric characters
  const numbers = phone.replace(/\D/g, '');
  
  // Must be exactly 10 digits for US phone numbers
  return numbers.length === 10;
};

/**
 * Gets clean phone number with +1 prefix for US numbers
 */
export const getCleanPhoneNumber = (phone: string): string => {
  const digits = phone.replace(/\D/g, '');
  
  // If already has +1 prefix, return as is
  if (phone.startsWith('+1')) {
    return phone;
  }
  
  // Add +1 prefix for US numbers
  if (digits.length === 10) {
    return `+1${digits}`;
  }
  
  // If 11 digits starting with 1, format as +1XXXXXXXXXX
  if (digits.length === 11 && digits.startsWith('1')) {
    return `+${digits}`;
  }
  
  // For other cases, return with +1 prefix
  return `+1${digits}`;
};

/**
 * Validates email format using a comprehensive regex
 */
export const isValidEmail = (email: string): boolean => {
  const emailRegex = /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*$/;
  return emailRegex.test(email.toLowerCase());
};

/**
 * Validates name (must not be empty and reasonable length)
 */
export const isValidName = (name: string): boolean => {
  const trimmed = name.trim();
  return trimmed.length >= 2 && trimmed.length <= 100;
};

/**
 * Comprehensive form validation
 */
export interface ValidationResult {
  isValid: boolean;
  errors: {
    name?: string;
    email?: string;
    phone?: string;
  };
}

export const validateBookingForm = (data: {
  name: string;
  email: string;
  phone: string;
}): ValidationResult => {
  const errors: ValidationResult['errors'] = {};
  
  // Validate name
  if (!isValidName(data.name)) {
    errors.name = 'Please enter a valid name (2-100 characters)';
  }
  
  // Validate email
  if (!data.email.trim()) {
    errors.email = 'Email is required';
  } else if (!isValidEmail(data.email)) {
    errors.email = 'Please enter a valid email address';
  }
  
  // Validate phone
  if (!data.phone.trim()) {
    errors.phone = 'Phone number is required';
  } else if (!isValidPhoneNumber(data.phone)) {
    errors.phone = 'Please enter a valid 10-digit US phone number';
  }
  
  return {
    isValid: Object.keys(errors).length === 0,
    errors
  };
};