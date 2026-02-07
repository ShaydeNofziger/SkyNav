/**
 * Validation utilities for API requests
 */

export interface ValidationResult {
  valid: boolean;
  errors?: Record<string, string>;
}

/**
 * Validate date format (YYYY-MM-DD)
 */
export function isValidDateFormat(dateString: string): boolean {
  const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
  if (!dateRegex.test(dateString)) {
    return false;
  }
  
  // Check if it's a valid date
  const date = new Date(dateString);
  return date instanceof Date && !isNaN(date.getTime());
}

/**
 * Validate date range (end date not before start date)
 */
export function isValidDateRange(startDate: string, endDate: string): boolean {
  const start = new Date(startDate);
  const end = new Date(endDate);
  return end >= start;
}

/**
 * Validate email format
 */
export function isValidEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

/**
 * Validate string field (non-empty after trimming)
 */
export function isValidString(value: any): boolean {
  return typeof value === 'string' && value.trim().length > 0;
}

/**
 * Validate number field (positive number)
 */
export function isPositiveNumber(value: any): boolean {
  return typeof value === 'number' && value > 0 && !isNaN(value);
}

/**
 * Validate flight details
 */
export function validateFlightDetails(details: any): ValidationResult {
  const errors: Record<string, string> = {};
  
  if (!details) {
    return { valid: true }; // Flight details are optional
  }
  
  if (details.departureAirport !== undefined && !isValidString(details.departureAirport)) {
    errors.departureAirport = 'Departure airport is required for flight segments';
  }
  
  if (details.arrivalAirport !== undefined && !isValidString(details.arrivalAirport)) {
    errors.arrivalAirport = 'Arrival airport is required for flight segments';
  }
  
  if (details.airline !== undefined && typeof details.airline !== 'string') {
    errors.airline = 'Airline must be a string';
  }
  
  if (details.flightNumber !== undefined && typeof details.flightNumber !== 'string') {
    errors.flightNumber = 'Flight number must be a string';
  }
  
  if (details.confirmationCode !== undefined && typeof details.confirmationCode !== 'string') {
    errors.confirmationCode = 'Confirmation code must be a string';
  }
  
  return {
    valid: Object.keys(errors).length === 0,
    errors: Object.keys(errors).length > 0 ? errors : undefined
  };
}

/**
 * Validate drive details
 */
export function validateDriveDetails(details: any): ValidationResult {
  const errors: Record<string, string> = {};
  
  if (!details) {
    return { valid: true }; // Drive details are optional
  }
  
  if (details.startLocation !== undefined && !isValidString(details.startLocation)) {
    errors.startLocation = 'Start location is required for drive segments';
  }
  
  if (details.endLocation !== undefined && !isValidString(details.endLocation)) {
    errors.endLocation = 'End location is required for drive segments';
  }
  
  if (details.estimatedDistance !== undefined && !isPositiveNumber(details.estimatedDistance)) {
    errors.estimatedDistance = 'Estimated distance must be a positive number';
  }
  
  if (details.estimatedDuration !== undefined && !isPositiveNumber(details.estimatedDuration)) {
    errors.estimatedDuration = 'Estimated duration must be a positive number';
  }
  
  return {
    valid: Object.keys(errors).length === 0,
    errors: Object.keys(errors).length > 0 ? errors : undefined
  };
}

/**
 * Validate lodging details
 */
export function validateLodgingDetails(details: any): ValidationResult {
  const errors: Record<string, string> = {};
  
  if (!details) {
    return { valid: true }; // Lodging details are optional
  }
  
  if (details.name !== undefined && !isValidString(details.name)) {
    errors.name = 'Lodging name is required for lodging segments';
  }
  
  if (details.address !== undefined && typeof details.address !== 'string') {
    errors.address = 'Address must be a string';
  }
  
  if (details.confirmationCode !== undefined && typeof details.confirmationCode !== 'string') {
    errors.confirmationCode = 'Confirmation code must be a string';
  }
  
  if (details.checkInTime !== undefined && typeof details.checkInTime !== 'string') {
    errors.checkInTime = 'Check-in time must be a string';
  }
  
  if (details.checkOutTime !== undefined && typeof details.checkOutTime !== 'string') {
    errors.checkOutTime = 'Check-out time must be a string';
  }
  
  return {
    valid: Object.keys(errors).length === 0,
    errors: Object.keys(errors).length > 0 ? errors : undefined
  };
}

/**
 * Validate user profile fields
 */
export function validateUserProfile(profile: any): ValidationResult {
  const errors: Record<string, string> = {};
  
  if (profile.displayName !== undefined && typeof profile.displayName !== 'string') {
    errors.displayName = 'Display name must be a string';
  }
  
  if (profile.firstName !== undefined && typeof profile.firstName !== 'string') {
    errors.firstName = 'First name must be a string';
  }
  
  if (profile.lastName !== undefined && typeof profile.lastName !== 'string') {
    errors.lastName = 'Last name must be a string';
  }
  
  if (profile.uspaNumber !== undefined && typeof profile.uspaNumber !== 'string') {
    errors.uspaNumber = 'USPA number must be a string';
  }
  
  if (profile.jumpCount !== undefined) {
    if (typeof profile.jumpCount !== 'number' || profile.jumpCount < 0) {
      errors.jumpCount = 'Jump count must be a non-negative number';
    }
  }
  
  if (profile.licenses !== undefined) {
    if (!Array.isArray(profile.licenses)) {
      errors.licenses = 'Licenses must be an array';
    } else if (profile.licenses.some((l: any) => typeof l !== 'string')) {
      errors.licenses = 'All license values must be strings';
    }
  }
  
  if (profile.ratings !== undefined) {
    if (!Array.isArray(profile.ratings)) {
      errors.ratings = 'Ratings must be an array';
    } else if (profile.ratings.some((r: any) => typeof r !== 'string')) {
      errors.ratings = 'All rating values must be strings';
    }
  }
  
  if (profile.homeDropzoneId !== undefined && profile.homeDropzoneId !== null) {
    if (typeof profile.homeDropzoneId !== 'string') {
      errors.homeDropzoneId = 'Home dropzone ID must be a string';
    }
  }
  
  return {
    valid: Object.keys(errors).length === 0,
    errors: Object.keys(errors).length > 0 ? errors : undefined
  };
}
