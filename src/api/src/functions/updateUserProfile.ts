/**
 * Azure Function: Update User Profile
 * PUT /api/users/me
 * 
 * Updates the authenticated user's profile
 */

import { app, HttpRequest, HttpResponseInit, InvocationContext } from '@azure/functions';
import { validateToken } from '../middleware/auth';
import { createUserService } from '../services/UserService';

interface UpdateProfileRequest {
  displayName?: string;
  firstName?: string;
  lastName?: string;
  homeDropzoneId?: string | null;
  uspaNumber?: string;
  jumpCount?: number;
  licenses?: string[];
  ratings?: string[];
}

export async function updateUserProfile(request: HttpRequest, context: InvocationContext): Promise<HttpResponseInit> {
  try {
    // Validate JWT token
    const user = await validateToken(request, context);
    
    // Parse request body
    const body = await request.json() as UpdateProfileRequest;

    // Validate input
    if (!body || Object.keys(body).length === 0) {
      return {
        status: 400,
        jsonBody: {
          error: 'Bad request',
          message: 'At least one profile field must be provided'
        }
      };
    }

    // Update user profile
    const userService = createUserService();
    const updatedUser = await userService.updateUserProfile(user.userId, body);

    return {
      status: 200,
      jsonBody: {
        id: updatedUser.id,
        email: updatedUser.email,
        profile: updatedUser.profile,
        preferences: updatedUser.preferences,
        createdAt: updatedUser.createdAt,
        updatedAt: updatedUser.updatedAt,
        lastLoginAt: updatedUser.lastLoginAt
      }
    };
  } catch (error) {
    context.error('Error updating user profile', error);
    
    if (error instanceof Error && error.message.includes('Token validation failed')) {
      return {
        status: 401,
        jsonBody: {
          error: 'Unauthorized',
          message: error.message
        }
      };
    }

    if (error instanceof Error && error.message === 'User not found') {
      return {
        status: 404,
        jsonBody: {
          error: 'User not found'
        }
      };
    }

    return {
      status: 500,
      jsonBody: {
        error: 'Internal server error',
        message: error instanceof Error ? error.message : 'Unknown error'
      }
    };
  }
}

app.http('updateUserProfile', {
  methods: ['PUT'],
  authLevel: 'anonymous',
  route: 'users/me',
  handler: updateUserProfile
});
