import { describe, it, expect } from 'vitest';
import { isUser, UserRole, DEFAULT_USER_PREFERENCES } from '../models/User';
import { isTrip, TripStatus, DEFAULT_TRIP_CHECKLIST } from '../models/Trip';
import { isTravelSegment, TravelSegmentType } from '../models/TravelSegment';

// ── User model ────────────────────────────────────────────────────────────────

describe('isUser', () => {
  const validUser = {
    id: 'b2c-object-id-123',
    email: 'jumper@skydive.com',
    emailVerified: true,
    roles: [UserRole.USER],
    profile: { displayName: 'Sky Jumper' },
    preferences: DEFAULT_USER_PREFERENCES,
    favoriteDropzoneIds: [],
    isActive: true,
    isBanned: false,
    createdAt: '2026-01-01T00:00:00Z',
    updatedAt: '2026-01-01T00:00:00Z',
  };

  it('returns true for a valid user object', () => {
    expect(isUser(validUser)).toBe(true);
  });

  it('returns false for null', () => {
    expect(isUser(null)).toBe(false);
  });

  it('returns false for undefined', () => {
    expect(isUser(undefined)).toBe(false);
  });

  it('returns false when id is missing', () => {
    expect(isUser({ ...validUser, id: '' })).toBe(false);
  });

  it('returns false when email is missing @', () => {
    expect(isUser({ ...validUser, email: 'noemail' })).toBe(false);
  });

  it('returns false when roles is not an array', () => {
    expect(isUser({ ...validUser, roles: 'user' })).toBe(false);
  });

  it('returns false when roles is empty', () => {
    expect(isUser({ ...validUser, roles: [] })).toBe(false);
  });

  it('returns false when profile is missing', () => {
    expect(isUser({ ...validUser, profile: undefined })).toBe(false);
  });

  it('returns false when preferences is not an object', () => {
    // The type guard checks typeof preferences === 'object'; passing a string fails
    expect(isUser({ ...validUser, preferences: 'default' })).toBe(false);
  });

  it('returns false when favoriteDropzoneIds is not an array', () => {
    expect(isUser({ ...validUser, favoriteDropzoneIds: null })).toBe(false);
  });

  it('returns false when isActive is not a boolean', () => {
    expect(isUser({ ...validUser, isActive: 'true' })).toBe(false);
  });
});

describe('DEFAULT_USER_PREFERENCES', () => {
  it('has emailNotifications enabled', () => {
    expect(DEFAULT_USER_PREFERENCES.emailNotifications).toBe(true);
  });

  it('has travelModeEnabled disabled', () => {
    expect(DEFAULT_USER_PREFERENCES.travelModeEnabled).toBe(false);
  });

  it('defaults to imperial units', () => {
    expect(DEFAULT_USER_PREFERENCES.measurementUnit).toBe('imperial');
  });

  it('defaults to auto theme', () => {
    expect(DEFAULT_USER_PREFERENCES.theme).toBe('auto');
  });
});

// ── Trip model ────────────────────────────────────────────────────────────────

describe('isTrip', () => {
  const validTrip = {
    id: 'trip-abc-123',
    userId: 'user-456',
    name: 'Arizona Boogie 2026',
    status: TripStatus.PLANNED,
    startDate: '2026-03-01',
    endDate: '2026-03-10',
    segments: [],
    checklist: [],
    createdAt: '2025-12-01T00:00:00Z',
    updatedAt: '2025-12-01T00:00:00Z',
  };

  it('returns true for a valid trip', () => {
    expect(isTrip(validTrip)).toBe(true);
  });

  it('returns false for null', () => {
    expect(isTrip(null)).toBe(false);
  });

  it('returns false when id does not start with "trip-"', () => {
    expect(isTrip({ ...validTrip, id: 'abc-123' })).toBe(false);
  });

  it('returns false when userId is empty', () => {
    expect(isTrip({ ...validTrip, userId: '' })).toBe(false);
  });

  it('returns false when name is empty', () => {
    expect(isTrip({ ...validTrip, name: '' })).toBe(false);
  });

  it('returns false for invalid status', () => {
    expect(isTrip({ ...validTrip, status: 'unknown' })).toBe(false);
  });

  it('accepts all valid TripStatus values', () => {
    Object.values(TripStatus).forEach(status => {
      expect(isTrip({ ...validTrip, status })).toBe(true);
    });
  });

  it('returns false when segments is not an array', () => {
    expect(isTrip({ ...validTrip, segments: null })).toBe(false);
  });

  it('returns false when checklist is not an array', () => {
    expect(isTrip({ ...validTrip, checklist: {} })).toBe(false);
  });
});

describe('DEFAULT_TRIP_CHECKLIST', () => {
  it('has 6 items', () => {
    expect(DEFAULT_TRIP_CHECKLIST.length).toBe(6);
  });

  it('all items start uncompleted', () => {
    DEFAULT_TRIP_CHECKLIST.forEach(item => {
      expect(item.completed).toBe(false);
    });
  });

  it('all items have labels', () => {
    DEFAULT_TRIP_CHECKLIST.forEach(item => {
      expect(typeof item.label).toBe('string');
      expect(item.label.length).toBeGreaterThan(0);
    });
  });

  it('items have sequential order values starting at 1', () => {
    const orders = DEFAULT_TRIP_CHECKLIST.map(i => i.order).sort((a, b) => a - b);
    orders.forEach((order, index) => {
      expect(order).toBe(index + 1);
    });
  });
});

// ── TravelSegment model ───────────────────────────────────────────────────────

describe('isTravelSegment', () => {
  const validSegment = {
    id: 'seg-xyz-789',
    type: TravelSegmentType.FLIGHT,
    startDate: '2026-03-01',
    endDate: '2026-03-01',
    completed: false,
    createdAt: '2025-12-01T00:00:00Z',
    updatedAt: '2025-12-01T00:00:00Z',
  };

  it('returns true for a valid segment', () => {
    expect(isTravelSegment(validSegment)).toBe(true);
  });

  it('returns false for null', () => {
    expect(isTravelSegment(null)).toBe(false);
  });

  it('returns false when id does not start with "seg-"', () => {
    expect(isTravelSegment({ ...validSegment, id: 'flight-123' })).toBe(false);
  });

  it('accepts all valid TravelSegmentType values', () => {
    Object.values(TravelSegmentType).forEach(type => {
      expect(isTravelSegment({ ...validSegment, type })).toBe(true);
    });
  });

  it('returns false for invalid type', () => {
    expect(isTravelSegment({ ...validSegment, type: 'teleport' })).toBe(false);
  });

  it('returns false when completed is not a boolean', () => {
    expect(isTravelSegment({ ...validSegment, completed: 'no' })).toBe(false);
  });
});
