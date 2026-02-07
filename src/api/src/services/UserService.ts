/**
 * User service for managing user profiles in Cosmos DB
 */

import { CosmosClient, Container } from '@azure/cosmos';
import { User, UserRole } from '../models/User';
import { PrivateUserProfileDTO, PublicUserProfileDTO, toPrivateUserProfileDTO, toPublicUserProfileDTO } from '../dtos/UserDTO';

/**
 * User service for Cosmos DB operations
 */
export class UserService {
  private container: Container;

  constructor(cosmosClient: CosmosClient, databaseName: string) {
    const database = cosmosClient.database(databaseName);
    this.container = database.container('users');
  }

  /**
   * Get user by ID
   * 
   * @param userId - User ID (matches Azure AD B2C subject)
   * @returns User object or null if not found
   */
  async getUserById(userId: string): Promise<User | null> {
    try {
      const { resource } = await this.container.item(userId, userId).read<User>();
      return resource || null;
    } catch (error: any) {
      if (error.code === 404) {
        return null;
      }
      throw error;
    }
  }

  /**
   * Get user profile (private - includes all fields)
   * 
   * @param userId - User ID
   * @returns Private user profile DTO
   */
  async getUserProfile(userId: string): Promise<PrivateUserProfileDTO | null> {
    const user = await this.getUserById(userId);
    if (!user) {
      return null;
    }
    return toPrivateUserProfileDTO(user);
  }

  /**
   * Get public user profile
   * 
   * @param userId - User ID
   * @returns Public user profile DTO
   */
  async getPublicUserProfile(userId: string): Promise<PublicUserProfileDTO | null> {
    const user = await this.getUserById(userId);
    if (!user) {
      return null;
    }
    return toPublicUserProfileDTO(user);
  }

  /**
   * Create or update user profile (upsert)
   * 
   * @param user - User object
   * @returns Created/updated user
   */
  async upsertUser(user: User): Promise<User> {
    const { resource } = await this.container.items.upsert<User>(user);
    if (!resource) {
      throw new Error('Failed to upsert user');
    }
    return resource;
  }

  /**
   * Create user profile on first login
   * 
   * @param userId - User ID from B2C
   * @param email - User email
   * @param name - User name
   * @returns Created user
   */
  async createUserOnFirstLogin(userId: string, email?: string, name?: string): Promise<User> {
    // Check if user already exists
    const existingUser = await this.getUserById(userId);
    if (existingUser) {
      return existingUser;
    }

    // Create new user with default values
    const newUser: User = {
      id: userId,
      email: email || '',
      emailVerified: false,
      roles: [UserRole.USER],
      profile: {
        displayName: name || ''
      },
      preferences: {
        emailNotifications: true,
        travelModeEnabled: false,
        measurementUnit: 'imperial',
        theme: 'auto'
      },
      favoriteDropzoneIds: [],
      isActive: true,
      isBanned: false,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      lastLoginAt: new Date().toISOString()
    };

    return await this.upsertUser(newUser);
  }

  /**
   * Update user profile
   * 
   * @param userId - User ID
   * @param updates - Partial user profile updates
   * @returns Updated user
   */
  async updateUserProfile(
    userId: string,
    updates: {
      displayName?: string;
      firstName?: string;
      lastName?: string;
      homeDropzoneId?: string | null;
      uspaNumber?: string;
      jumpCount?: number;
      licenses?: string[];
      ratings?: string[];
    }
  ): Promise<User> {
    const user = await this.getUserById(userId);
    if (!user) {
      throw new Error('User not found');
    }

    // Update profile fields
    if (updates.displayName !== undefined) {
      user.profile.displayName = updates.displayName;
    }
    if (updates.firstName !== undefined) {
      user.profile.firstName = updates.firstName;
    }
    if (updates.lastName !== undefined) {
      user.profile.lastName = updates.lastName;
    }
    if (updates.homeDropzoneId !== undefined) {
      user.profile.homeDropzoneId = updates.homeDropzoneId || undefined;
    }
    if (updates.uspaNumber !== undefined) {
      user.profile.uspaNumber = updates.uspaNumber;
    }
    if (updates.jumpCount !== undefined) {
      user.profile.jumpCount = updates.jumpCount;
    }
    if (updates.licenses !== undefined) {
      user.profile.licenses = updates.licenses;
    }
    if (updates.ratings !== undefined) {
      user.profile.ratings = updates.ratings;
    }

    // Update metadata
    user.updatedAt = new Date().toISOString();

    return await this.upsertUser(user);
  }

  /**
   * Update user preferences
   * 
   * @param userId - User ID
   * @param preferences - Preference updates
   * @returns Updated user
   */
  async updateUserPreferences(
    userId: string,
    preferences: {
      emailNotifications?: boolean;
      travelModeEnabled?: boolean;
      measurementUnit?: 'imperial' | 'metric';
      theme?: 'light' | 'dark' | 'auto';
    }
  ): Promise<User> {
    const user = await this.getUserById(userId);
    if (!user) {
      throw new Error('User not found');
    }

    // Update preferences
    if (preferences.emailNotifications !== undefined) {
      user.preferences.emailNotifications = preferences.emailNotifications;
    }
    if (preferences.travelModeEnabled !== undefined) {
      user.preferences.travelModeEnabled = preferences.travelModeEnabled;
    }
    if (preferences.measurementUnit !== undefined) {
      user.preferences.measurementUnit = preferences.measurementUnit;
    }
    if (preferences.theme !== undefined) {
      user.preferences.theme = preferences.theme;
    }

    // Update metadata
    user.updatedAt = new Date().toISOString();

    return await this.upsertUser(user);
  }

  /**
   * Add dropzone to favorites
   * 
   * @param userId - User ID
   * @param dropzoneId - Dropzone ID to add
   * @returns Updated user
   */
  async addFavoriteDropzone(userId: string, dropzoneId: string): Promise<User> {
    const user = await this.getUserById(userId);
    if (!user) {
      throw new Error('User not found');
    }

    // Add to favorites if not already present
    if (!user.favoriteDropzoneIds.includes(dropzoneId)) {
      user.favoriteDropzoneIds.push(dropzoneId);
      user.updatedAt = new Date().toISOString();
      return await this.upsertUser(user);
    }

    return user;
  }

  /**
   * Remove dropzone from favorites
   * 
   * @param userId - User ID
   * @param dropzoneId - Dropzone ID to remove
   * @returns Updated user
   */
  async removeFavoriteDropzone(userId: string, dropzoneId: string): Promise<User> {
    const user = await this.getUserById(userId);
    if (!user) {
      throw new Error('User not found');
    }

    // Remove from favorites
    const index = user.favoriteDropzoneIds.indexOf(dropzoneId);
    if (index > -1) {
      user.favoriteDropzoneIds.splice(index, 1);
      user.updatedAt = new Date().toISOString();
      return await this.upsertUser(user);
    }

    return user;
  }

  /**
   * Update last login timestamp
   * 
   * @param userId - User ID
   */
  async updateLastLogin(userId: string): Promise<void> {
    const user = await this.getUserById(userId);
    if (user) {
      user.lastLoginAt = new Date().toISOString();
      await this.upsertUser(user);
    }
  }
}

/**
 * Create UserService instance from environment variables
 */
export const createUserService = (): UserService => {
  const endpoint = process.env.COSMOS_DB_ENDPOINT;
  const key = process.env.COSMOS_DB_KEY;
  const databaseName = process.env.COSMOS_DB_DATABASE_NAME || 'SkyNavDB';

  if (!endpoint || !key) {
    throw new Error('Cosmos DB configuration missing: COSMOS_DB_ENDPOINT and COSMOS_DB_KEY required');
  }

  const cosmosClient = new CosmosClient({ endpoint, key });
  return new UserService(cosmosClient, databaseName);
};
