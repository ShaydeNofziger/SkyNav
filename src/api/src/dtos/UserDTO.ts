/**
 * User DTOs
 * 
 * Data Transfer Objects for User-related API endpoints.
 * User data is sensitive, so DTOs filter what information is exposed.
 */

import { User, UserProfile, UserPreferences, UserRole } from '../models/User';

/**
 * Public user profile (visible to other users)
 * Excludes sensitive information like email, roles, preferences
 */
export interface PublicUserProfileDTO {
  id: string;
  displayName?: string;
  avatarUrl?: string;
  bio?: string;
  homeDropzoneId?: string;
  uspaNumber?: string;
  licenses?: string[];
  ratings?: string[];
}

/**
 * Private user profile (visible only to the user themselves)
 * Includes full profile, preferences, and favorites
 */
export interface PrivateUserProfileDTO {
  id: string;
  email: string;
  emailVerified: boolean;
  roles: UserRole[];
  profile: UserProfile;
  preferences: UserPreferences;
  favoriteDropzoneIds: string[];
  isActive: boolean;
  createdAt: string;
  lastLoginAt?: string;
}

/**
 * Request DTO for updating user profile
 */
export interface UpdateUserProfileDTO {
  displayName?: string;
  firstName?: string;
  lastName?: string;
  avatarUrl?: string;
  bio?: string;
  homeDropzoneId?: string;
  uspaNumber?: string;
  jumpCount?: number;
  licenses?: string[];
  ratings?: string[];
}

/**
 * Request DTO for updating user preferences
 */
export interface UpdateUserPreferencesDTO {
  emailNotifications?: boolean;
  travelModeEnabled?: boolean;
  measurementUnit?: 'imperial' | 'metric';
  theme?: 'light' | 'dark' | 'auto';
}

/**
 * Response DTO for user favorites list
 */
export interface UserFavoritesResponseDTO {
  favoriteDropzoneIds: string[];
  count: number;
}

/**
 * Map a domain User model to a public profile DTO
 */
export function toPublicUserProfileDTO(user: User): PublicUserProfileDTO {
  return {
    id: user.id,
    displayName: user.profile.displayName,
    avatarUrl: user.profile.avatarUrl,
    bio: user.profile.bio,
    homeDropzoneId: user.profile.homeDropzoneId,
    uspaNumber: user.profile.uspaNumber,
    licenses: user.profile.licenses,
    ratings: user.profile.ratings,
  };
}

/**
 * Map a domain User model to a private profile DTO
 */
export function toPrivateUserProfileDTO(user: User): PrivateUserProfileDTO {
  return {
    id: user.id,
    email: user.email,
    emailVerified: user.emailVerified,
    roles: user.roles,
    profile: user.profile,
    preferences: user.preferences,
    favoriteDropzoneIds: user.favoriteDropzoneIds,
    isActive: user.isActive,
    createdAt: user.createdAt,
    lastLoginAt: user.lastLoginAt,
  };
}
