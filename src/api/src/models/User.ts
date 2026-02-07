/**
 * User Domain Model
 * 
 * Represents a user in the SkyNav system with authentication,
 * profile, and preferences information.
 */

/**
 * User role in the system
 */
export enum UserRole {
  USER = 'user',     // Standard registered user
  ADMIN = 'admin',   // Administrator with content management privileges
}

/**
 * User profile information
 */
export interface UserProfile {
  displayName?: string;
  firstName?: string;
  lastName?: string;
  avatarUrl?: string;
  bio?: string;
  homeDropzoneId?: string; // Reference to user's home DZ
  
  // Skydiving-specific profile
  uspaNumber?: string; // United States Parachute Association number
  jumpCount?: number;
  licenses?: string[]; // e.g., ["A", "B", "C", "D"]
  ratings?: string[]; // e.g., ["Tandem Instructor", "AFF Instructor"]
}

/**
 * User preferences and settings
 */
export interface UserPreferences {
  emailNotifications: boolean;
  travelModeEnabled: boolean;
  measurementUnit: 'imperial' | 'metric';
  theme?: 'light' | 'dark' | 'auto';
}

/**
 * Main User domain model
 * Partition key: /id
 */
export interface User {
  // Cosmos DB identifier (matches Azure AD B2C user ID)
  id: string; // Format: Azure AD B2C subject ID (sub claim from JWT)
  
  // Authentication
  email: string;
  emailVerified: boolean;
  roles: UserRole[];
  
  // Profile
  profile: UserProfile;
  
  // Preferences
  preferences: UserPreferences;
  
  // Favorites
  favoriteDropzoneIds: string[]; // List of DZ IDs
  
  // Account status
  isActive: boolean;
  isBanned: boolean;
  
  // Metadata
  createdAt: string; // ISO 8601 timestamp
  updatedAt: string; // ISO 8601 timestamp
  lastLoginAt?: string; // ISO 8601 timestamp
}

/**
 * Default user preferences for new users
 */
export const DEFAULT_USER_PREFERENCES: UserPreferences = {
  emailNotifications: true,
  travelModeEnabled: false,
  measurementUnit: 'imperial',
  theme: 'auto',
};

/**
 * Type guard to check if an object is a valid User
 */
export function isUser(obj: unknown): obj is User {
  const user = obj as User;
  return (
    typeof user === 'object' &&
    user !== null &&
    typeof user.id === 'string' &&
    user.id.length > 0 &&
    typeof user.email === 'string' &&
    user.email.includes('@') &&
    Array.isArray(user.roles) &&
    user.roles.length > 0 &&
    typeof user.profile === 'object' &&
    typeof user.preferences === 'object' &&
    Array.isArray(user.favoriteDropzoneIds) &&
    typeof user.isActive === 'boolean'
  );
}
