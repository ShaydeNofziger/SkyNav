/**
 * Core Domain Models
 * 
 * This module exports all core domain models for the SkyNav API.
 * 
 * Model Overview:
 * - DropZone: Represents a skydiving dropzone with location and facility data
 * - User: Represents a user with authentication, profile, and preferences
 * - Trip: Represents a travel plan with multiple dropzone visits
 * - TravelSegment: Represents a single visit to a dropzone within a trip
 */

// DropZone model
export {
  DropZone,
  GeoLocation,
  Address,
  Facilities,
  OperatingHours,
  isDropZone,
} from './DropZone';

// User model
export {
  User,
  UserRole,
  UserProfile,
  UserPreferences,
  DEFAULT_USER_PREFERENCES,
  isUser,
} from './User';

// Trip model
export {
  Trip,
  TripStatus,
  ChecklistItem,
  DEFAULT_TRIP_CHECKLIST,
  isTrip,
} from './Trip';

// TravelSegment model
export {
  TravelSegment,
  JumpType,
  Accommodation,
  isTravelSegment,
} from './TravelSegment';
