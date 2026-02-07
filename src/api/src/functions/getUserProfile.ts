/**
 * Azure Function: Get User Profile
 * GET /api/users/me
 * 
 * Returns the authenticated user's profile
 */

import { app, HttpRequest, HttpResponseInit, InvocationContext } from '@azure/functions';
import { validateToken } from '../middleware/auth';
import { createUserService } from '../services/UserService';

export async function getUserProfile(request: HttpRequest, context: InvocationContext): Promise<HttpResponseInit> {
  try {
    // Validate JWT token
    const user = await validateToken(request, context);
    
    // Get user profile from database
    const userService = createUserService();
    const profile = await userService.getUserProfile(user.userId);

    if (!profile) {
      return {
        status: 404,
        jsonBody: {
          error: 'User profile not found'
        }
      };
    }

    return {
      status: 200,
      jsonBody: profile
    };
  } catch (error) {
    context.error('Error getting user profile', error);
    
    if (error instanceof Error && error.message.includes('Token validation failed')) {
      return {
        status: 401,
        jsonBody: {
          error: 'Unauthorized',
          message: error.message
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

app.http('getUserProfile', {
  methods: ['GET'],
  authLevel: 'anonymous',
  route: 'users/me',
  handler: getUserProfile
});
