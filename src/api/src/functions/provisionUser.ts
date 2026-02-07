/**
 * Azure Function: User Provisioning
 * POST /api/users/provision
 * 
 * Creates user profile on first login after B2C authentication
 * This should be called by the frontend after successful B2C login
 */

import { app, HttpRequest, HttpResponseInit, InvocationContext } from '@azure/functions';
import { validateToken } from '../middleware/auth';
import { createUserService } from '../services/UserService';

export async function provisionUser(request: HttpRequest, context: InvocationContext): Promise<HttpResponseInit> {
  try {
    // Validate JWT token
    const user = await validateToken(request, context);
    
    // Create or get user profile
    const userService = createUserService();
    const userProfile = await userService.createUserOnFirstLogin(
      user.userId,
      user.email,
      user.name
    );

    // Update last login timestamp
    await userService.updateLastLogin(user.userId);

    context.log(`User provisioned: ${user.userId}`);

    return {
      status: 200,
      jsonBody: {
        id: userProfile.id,
        email: userProfile.email,
        profile: userProfile.profile,
        preferences: userProfile.preferences,
        createdAt: userProfile.createdAt,
        updatedAt: userProfile.updatedAt,
        lastLoginAt: userProfile.lastLoginAt
      }
    };
  } catch (error) {
    context.error('Error provisioning user', error);
    
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

app.http('provisionUser', {
  methods: ['POST'],
  authLevel: 'anonymous',
  route: 'users/provision',
  handler: provisionUser
});
