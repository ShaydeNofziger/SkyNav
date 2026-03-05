import { describe, it, expect } from 'vitest';
import {
  isValidDateFormat,
  isValidDateRange,
  isValidEmail,
  isValidString,
  isPositiveNumber,
  validateFlightDetails,
  validateDriveDetails,
  validateLodgingDetails,
  validateUserProfile,
} from '../utils/validation';

describe('isValidDateFormat', () => {
  it('accepts valid YYYY-MM-DD dates', () => {
    expect(isValidDateFormat('2026-01-15')).toBe(true);
    expect(isValidDateFormat('2024-12-31')).toBe(true);
    expect(isValidDateFormat('2000-06-01')).toBe(true);
  });

  it('rejects invalid formats', () => {
    expect(isValidDateFormat('01-15-2026')).toBe(false);
    expect(isValidDateFormat('2026/01/15')).toBe(false);
    expect(isValidDateFormat('2026-1-5')).toBe(false);
    expect(isValidDateFormat('')).toBe(false);
    expect(isValidDateFormat('not-a-date')).toBe(false);
  });

  it('rejects invalid calendar dates', () => {
    expect(isValidDateFormat('2026-13-01')).toBe(false);
    expect(isValidDateFormat('2026-00-01')).toBe(false);
  });
});

describe('isValidDateRange', () => {
  it('accepts end date after start date', () => {
    expect(isValidDateRange('2026-01-01', '2026-01-15')).toBe(true);
    expect(isValidDateRange('2026-06-01', '2026-12-31')).toBe(true);
  });

  it('accepts same start and end date', () => {
    expect(isValidDateRange('2026-06-15', '2026-06-15')).toBe(true);
  });

  it('rejects end date before start date', () => {
    expect(isValidDateRange('2026-06-15', '2026-06-01')).toBe(false);
    expect(isValidDateRange('2026-12-31', '2026-01-01')).toBe(false);
  });
});

describe('isValidEmail', () => {
  it('accepts valid email addresses', () => {
    expect(isValidEmail('user@example.com')).toBe(true);
    expect(isValidEmail('user.name+tag@sub.domain.org')).toBe(true);
    expect(isValidEmail('a@b.co')).toBe(true);
  });

  it('rejects invalid email addresses', () => {
    expect(isValidEmail('not-an-email')).toBe(false);
    expect(isValidEmail('missing@')).toBe(false);
    expect(isValidEmail('@nodomain.com')).toBe(false);
    expect(isValidEmail('spaces in@email.com')).toBe(false);
    expect(isValidEmail('')).toBe(false);
  });
});

describe('isValidString', () => {
  it('accepts non-empty strings', () => {
    expect(isValidString('hello')).toBe(true);
    expect(isValidString('  padded  ')).toBe(true);
    expect(isValidString('a')).toBe(true);
  });

  it('rejects empty or whitespace-only strings', () => {
    expect(isValidString('')).toBe(false);
    expect(isValidString('   ')).toBe(false);
    expect(isValidString('\t\n')).toBe(false);
  });

  it('rejects non-string values', () => {
    expect(isValidString(null)).toBe(false);
    expect(isValidString(undefined)).toBe(false);
    expect(isValidString(42)).toBe(false);
    expect(isValidString([])).toBe(false);
  });
});

describe('isPositiveNumber', () => {
  it('accepts positive numbers', () => {
    expect(isPositiveNumber(1)).toBe(true);
    expect(isPositiveNumber(100)).toBe(true);
    expect(isPositiveNumber(0.5)).toBe(true);
  });

  it('rejects zero', () => {
    expect(isPositiveNumber(0)).toBe(false);
  });

  it('rejects negative numbers', () => {
    expect(isPositiveNumber(-1)).toBe(false);
    expect(isPositiveNumber(-100)).toBe(false);
  });

  it('rejects non-numbers', () => {
    expect(isPositiveNumber('5')).toBe(false);
    expect(isPositiveNumber(null)).toBe(false);
    expect(isPositiveNumber(NaN)).toBe(false);
    expect(isPositiveNumber(undefined)).toBe(false);
  });
});

describe('validateFlightDetails', () => {
  it('returns valid when details is null/undefined', () => {
    expect(validateFlightDetails(null)).toEqual({ valid: true });
    expect(validateFlightDetails(undefined)).toEqual({ valid: true });
  });

  it('accepts valid flight details', () => {
    const result = validateFlightDetails({
      departureAirport: 'DEN',
      arrivalAirport: 'PHX',
      airline: 'Southwest',
      flightNumber: 'WN1234',
      confirmationCode: 'ABC123',
    });
    expect(result.valid).toBe(true);
    expect(result.errors).toBeUndefined();
  });

  it('accepts partial flight details', () => {
    expect(validateFlightDetails({ airline: 'Delta' })).toEqual({ valid: true });
    expect(validateFlightDetails({})).toEqual({ valid: true });
  });

  it('rejects invalid departureAirport', () => {
    const result = validateFlightDetails({ departureAirport: '   ' });
    expect(result.valid).toBe(false);
    expect(result.errors?.departureAirport).toBeDefined();
  });

  it('rejects invalid arrivalAirport', () => {
    const result = validateFlightDetails({ arrivalAirport: '' });
    expect(result.valid).toBe(false);
    expect(result.errors?.arrivalAirport).toBeDefined();
  });

  it('rejects non-string airline', () => {
    const result = validateFlightDetails({ airline: 123 });
    expect(result.valid).toBe(false);
    expect(result.errors?.airline).toBeDefined();
  });

  it('rejects non-string flightNumber', () => {
    const result = validateFlightDetails({ flightNumber: true });
    expect(result.valid).toBe(false);
    expect(result.errors?.flightNumber).toBeDefined();
  });

  it('rejects non-string confirmationCode', () => {
    const result = validateFlightDetails({ confirmationCode: 999 });
    expect(result.valid).toBe(false);
    expect(result.errors?.confirmationCode).toBeDefined();
  });
});

describe('validateDriveDetails', () => {
  it('returns valid when details is null/undefined', () => {
    expect(validateDriveDetails(null)).toEqual({ valid: true });
    expect(validateDriveDetails(undefined)).toEqual({ valid: true });
  });

  it('accepts valid drive details', () => {
    const result = validateDriveDetails({
      startLocation: 'Denver, CO',
      endLocation: 'Eloy, AZ',
      estimatedDistance: 600,
      estimatedDuration: 8,
    });
    expect(result.valid).toBe(true);
  });

  it('rejects empty startLocation', () => {
    const result = validateDriveDetails({ startLocation: '' });
    expect(result.valid).toBe(false);
    expect(result.errors?.startLocation).toBeDefined();
  });

  it('rejects empty endLocation', () => {
    const result = validateDriveDetails({ endLocation: '  ' });
    expect(result.valid).toBe(false);
    expect(result.errors?.endLocation).toBeDefined();
  });

  it('rejects non-positive estimatedDistance', () => {
    expect(validateDriveDetails({ estimatedDistance: 0 }).valid).toBe(false);
    expect(validateDriveDetails({ estimatedDistance: -5 }).valid).toBe(false);
    expect(validateDriveDetails({ estimatedDistance: 'far' }).valid).toBe(false);
  });

  it('rejects non-positive estimatedDuration', () => {
    expect(validateDriveDetails({ estimatedDuration: 0 }).valid).toBe(false);
    expect(validateDriveDetails({ estimatedDuration: -1 }).valid).toBe(false);
  });
});

describe('validateLodgingDetails', () => {
  it('returns valid when details is null/undefined', () => {
    expect(validateLodgingDetails(null)).toEqual({ valid: true });
    expect(validateLodgingDetails(undefined)).toEqual({ valid: true });
  });

  it('accepts valid lodging details', () => {
    const result = validateLodgingDetails({
      name: 'Skydive Arizona Bunkhouse',
      address: '5600 N Toltec Rd, Eloy, AZ',
      confirmationCode: 'CONF456',
      checkInTime: '3:00 PM',
      checkOutTime: '11:00 AM',
    });
    expect(result.valid).toBe(true);
  });

  it('rejects empty name', () => {
    const result = validateLodgingDetails({ name: '' });
    expect(result.valid).toBe(false);
    expect(result.errors?.name).toBeDefined();
  });

  it('rejects non-string address', () => {
    const result = validateLodgingDetails({ address: 42 });
    expect(result.valid).toBe(false);
    expect(result.errors?.address).toBeDefined();
  });

  it('rejects non-string confirmationCode', () => {
    const result = validateLodgingDetails({ confirmationCode: [] });
    expect(result.valid).toBe(false);
    expect(result.errors?.confirmationCode).toBeDefined();
  });

  it('rejects non-string checkInTime', () => {
    const result = validateLodgingDetails({ checkInTime: 1500 });
    expect(result.valid).toBe(false);
    expect(result.errors?.checkInTime).toBeDefined();
  });

  it('rejects non-string checkOutTime', () => {
    const result = validateLodgingDetails({ checkOutTime: false });
    expect(result.valid).toBe(false);
    expect(result.errors?.checkOutTime).toBeDefined();
  });
});

describe('validateUserProfile', () => {
  it('accepts empty object (all fields optional)', () => {
    expect(validateUserProfile({})).toEqual({ valid: true });
  });

  it('accepts valid profile', () => {
    const result = validateUserProfile({
      displayName: 'Skydiver Joe',
      firstName: 'Joe',
      lastName: 'Jumper',
      uspaNumber: 'D-12345',
      jumpCount: 500,
      licenses: ['A', 'B', 'C'],
      ratings: ['AFF Instructor'],
      homeDropzoneId: 'dz-abc123',
    });
    expect(result.valid).toBe(true);
  });

  it('rejects non-string displayName', () => {
    const result = validateUserProfile({ displayName: 42 });
    expect(result.valid).toBe(false);
    expect(result.errors?.displayName).toBeDefined();
  });

  it('rejects non-string firstName', () => {
    const result = validateUserProfile({ firstName: true });
    expect(result.valid).toBe(false);
    expect(result.errors?.firstName).toBeDefined();
  });

  it('rejects non-string lastName', () => {
    const result = validateUserProfile({ lastName: {} });
    expect(result.valid).toBe(false);
    expect(result.errors?.lastName).toBeDefined();
  });

  it('rejects non-string uspaNumber', () => {
    const result = validateUserProfile({ uspaNumber: 12345 });
    expect(result.valid).toBe(false);
    expect(result.errors?.uspaNumber).toBeDefined();
  });

  it('rejects negative jumpCount', () => {
    const result = validateUserProfile({ jumpCount: -1 });
    expect(result.valid).toBe(false);
    expect(result.errors?.jumpCount).toBeDefined();
  });

  it('accepts zero jumpCount', () => {
    expect(validateUserProfile({ jumpCount: 0 }).valid).toBe(true);
  });

  it('rejects non-array licenses', () => {
    const result = validateUserProfile({ licenses: 'A' });
    expect(result.valid).toBe(false);
    expect(result.errors?.licenses).toBeDefined();
  });

  it('rejects licenses array with non-string values', () => {
    const result = validateUserProfile({ licenses: ['A', 123] });
    expect(result.valid).toBe(false);
    expect(result.errors?.licenses).toBeDefined();
  });

  it('rejects non-array ratings', () => {
    const result = validateUserProfile({ ratings: 'Coach' });
    expect(result.valid).toBe(false);
    expect(result.errors?.ratings).toBeDefined();
  });

  it('rejects non-string homeDropzoneId', () => {
    const result = validateUserProfile({ homeDropzoneId: 42 });
    expect(result.valid).toBe(false);
    expect(result.errors?.homeDropzoneId).toBeDefined();
  });

  it('accepts null homeDropzoneId (clearing home DZ)', () => {
    expect(validateUserProfile({ homeDropzoneId: null }).valid).toBe(true);
  });
});
