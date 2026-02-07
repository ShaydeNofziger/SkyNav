/**
 * User API Service
 * 
 * Handles all user-related API calls
 */

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:7071/api';

export interface UserProfile {
  displayName?: string;
  firstName?: string;
  lastName?: string;
  homeDropzoneId?: string;
  uspaNumber?: string;
  jumpCount?: number;
  licenses?: string[];
  ratings?: string[];
}

export interface UserPreferences {
  emailNotifications: boolean;
  travelModeEnabled: boolean;
  measurementUnit: 'imperial' | 'metric';
  theme?: 'light' | 'dark' | 'auto';
}

export interface User {
  id: string;
  email: string;
  profile: UserProfile;
  preferences: UserPreferences;
  favoriteDropzoneIds: string[];
  createdAt: string;
  updatedAt: string;
  lastLoginAt?: string;
}

/**
 * Provision user on first login
 */
export async function provisionUser(accessToken: string): Promise<User> {
  const response = await fetch(`${API_BASE_URL}/users/provision`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${accessToken}`,
      'Content-Type': 'application/json',
    },
  });

  if (!response.ok) {
    throw new Error(`Failed to provision user: ${response.statusText}`);
  }

  return await response.json();
}

/**
 * Get current user profile
 */
export async function getUserProfile(accessToken: string): Promise<User> {
  const response = await fetch(`${API_BASE_URL}/users/me`, {
    method: 'GET',
    headers: {
      'Authorization': `Bearer ${accessToken}`,
      'Content-Type': 'application/json',
    },
  });

  if (!response.ok) {
    throw new Error(`Failed to get user profile: ${response.statusText}`);
  }

  return await response.json();
}

/**
 * Update user profile
 */
export async function updateUserProfile(
  accessToken: string,
  updates: Partial<UserProfile>
): Promise<User> {
  const response = await fetch(`${API_BASE_URL}/users/me`, {
    method: 'PUT',
    headers: {
      'Authorization': `Bearer ${accessToken}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(updates),
  });

  if (!response.ok) {
    throw new Error(`Failed to update user profile: ${response.statusText}`);
  }

  return await response.json();
}
