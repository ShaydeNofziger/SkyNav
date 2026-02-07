/**
 * Azure Function: Get User Profile
 * GET /api/users/me
 * 
 * Returns the authenticated user's profile
 */

import { app, HttpRequest, HttpResponseInit, InvocationContext } from '@azure/functions';
import { validateToken } from '../middleware/auth';
import { createUserService } from '../services/UserService';
import { createLogger, TelemetryEvents } from '../utils/telemetry';

export async function getUserProfile(request: HttpRequest, context: InvocationContext): Promise<HttpResponseInit> {
  const startTime = Date.now();
  const logger = createLogger(context, 'getUserProfile');
  
  try {
    // Validate JWT token
    const user = await validateToken(request, context);
    
    // Get user profile from database
    const userService = createUserService();
    const profile = await userService.getUserProfile(user.userId);

    if (!profile) {
      logger.warn('User profile not found', { userId: user.userId });
      const duration = Date.now() - startTime;
      logger.trackRequest('GET /api/users/me', request.url, duration, 404, false);
      
      return {
        status: 404,
        jsonBody: {
          error: 'User profile not found'
        }
      };
    }

    // Track success
    const duration = Date.now() - startTime;
    logger.trackEvent(TelemetryEvents.PROFILE_VIEWED, { 
      userId: user.userId
    });
    logger.trackRequest('GET /api/users/me', request.url, duration, 200, true);

    return {
      status: 200,
      jsonBody: profile
    };
  } catch (error) {
    const duration = Date.now() - startTime;
    logger.error('Error getting user profile', error instanceof Error ? error : undefined);
    
    if (error instanceof Error && error.message.includes('Token validation failed')) {
      logger.trackEvent(TelemetryEvents.AUTH_FAILED, { endpoint: 'getUserProfile' });
      logger.trackRequest('GET /api/users/me', request.url, duration, 401, false);
      
      return {
        status: 401,
        jsonBody: {
          error: 'Unauthorized',
          message: error.message
        }
      };
    }

    logger.trackEvent(TelemetryEvents.API_ERROR, { 
      endpoint: 'getUserProfile',
      errorMessage: error instanceof Error ? error.message : 'Unknown error'
    });
    logger.trackRequest('GET /api/users/me', request.url, duration, 500, false);

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
