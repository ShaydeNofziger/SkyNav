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
import { handleAuthError, internalServerError } from '../utils/errorResponse';
import { createLogger, TelemetryEvents } from '../utils/telemetry';

export async function provisionUser(request: HttpRequest, context: InvocationContext): Promise<HttpResponseInit> {
  const startTime = Date.now();
  const logger = createLogger(context, 'provisionUser');
  
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

    logger.info(`User provisioned: ${user.userId}`, { 
      userId: user.userId,
      email: user.email || 'unknown'
    });

    // Track user provisioning
    const duration = Date.now() - startTime;
    logger.trackEvent(TelemetryEvents.USER_PROVISIONED, { 
      userId: user.userId,
      email: user.email || 'unknown'
    });
    logger.trackRequest('POST /api/users/provision', request.url, duration, 200, true);

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
    const duration = Date.now() - startTime;
    logger.error('Error provisioning user', error instanceof Error ? error : undefined, {
      errorMessage: error instanceof Error ? error.message : 'Unknown error'
    });
    
    if (error instanceof Error && error.message.includes('Token validation failed')) {
      logger.trackEvent(TelemetryEvents.AUTH_FAILED, { 
        endpoint: 'provisionUser',
        reason: error.message
      });
      logger.trackRequest('POST /api/users/provision', request.url, duration, 401, false);
      return handleAuthError(error);
    }

    logger.trackEvent(TelemetryEvents.API_ERROR, { 
      endpoint: 'provisionUser',
      errorMessage: error instanceof Error ? error.message : 'Unknown error'
    });
    logger.trackRequest('POST /api/users/provision', request.url, duration, 500, false);

    return internalServerError('Failed to provision user. Please try signing in again.');
  }
}

app.http('provisionUser', {
  methods: ['POST'],
  authLevel: 'anonymous',
  route: 'users/provision',
  handler: provisionUser
});
