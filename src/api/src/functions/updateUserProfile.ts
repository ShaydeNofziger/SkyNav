/**
 * Azure Function: Update User Profile
 * PUT /api/users/me
 * 
 * Updates the authenticated user's profile
 */

import { app, HttpRequest, HttpResponseInit, InvocationContext } from '@azure/functions';
import { validateToken } from '../middleware/auth';
import { createUserService } from '../services/UserService';
import { 
  badRequest, 
  notFound, 
  internalServerError, 
  handleAuthError,
  validationError,
  parseRequestBody
} from '../utils/errorResponse';
import { validateUserProfile } from '../utils/validation';
import { createLogger, TelemetryEvents } from '../utils/telemetry';

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
  const startTime = Date.now();
  const logger = createLogger(context, 'updateUserProfile');
  
  try {
    // Validate JWT token
    const user = await validateToken(request, context);
    logger.info('User authenticated', { userId: user.userId });
    
    // Parse request body with error handling
    const parseResult = await parseRequestBody<UpdateProfileRequest>(request);
    if (!parseResult.success) {
      const duration = Date.now() - startTime;
      logger.trackRequest('PUT /api/users/me', request.url, duration, parseResult.response.status || 400, false);
      return parseResult.response;
    }
    
    const body = parseResult.data;

    // Validate that at least one field is provided
    if (!body || Object.keys(body).length === 0) {
      logger.warn('Validation failed: no profile fields provided');
      const duration = Date.now() - startTime;
      logger.trackRequest('PUT /api/users/me', request.url, duration, 400, false);
      return badRequest('At least one profile field must be provided for update');
    }

    // Validate profile fields
    const validation = validateUserProfile(body);
    if (!validation.valid) {
      logger.warn('Validation failed', { errors: validation.errors ? JSON.stringify(validation.errors) : 'Invalid profile data' });
      logger.trackEvent(TelemetryEvents.VALIDATION_ERROR, { 
        endpoint: 'updateUserProfile',
        error: validation.errors ? JSON.stringify(validation.errors) : 'Invalid profile data'
      });
      const duration = Date.now() - startTime;
      logger.trackRequest('PUT /api/users/me', request.url, duration, 400, false);
      return validationError('Invalid profile data', validation.errors);
    }

    // Update user profile
    const userService = createUserService();
    const updatedUser = await userService.updateUserProfile(user.userId, body);

    // Track success
    const duration = Date.now() - startTime;
    logger.trackEvent(TelemetryEvents.PROFILE_UPDATED, { 
      userId: user.userId
    });
    logger.trackRequest('PUT /api/users/me', request.url, duration, 200, true, {
      userId: user.userId
    });

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
    const duration = Date.now() - startTime;
    logger.error('Error updating user profile', error instanceof Error ? error : undefined, {
      errorMessage: error instanceof Error ? error.message : 'Unknown error'
    });
    
    if (error instanceof Error && error.message.includes('Token validation failed')) {
      logger.trackEvent(TelemetryEvents.AUTH_FAILED, { 
        endpoint: 'updateUserProfile'
      });
      logger.trackRequest('PUT /api/users/me', request.url, duration, 401, false);
      return handleAuthError(error);
    }

    if (error instanceof Error && error.message === 'User not found') {
      logger.trackRequest('PUT /api/users/me', request.url, duration, 404, false);
      return notFound('User profile not found');
    }

    logger.trackEvent(TelemetryEvents.API_ERROR, { 
      endpoint: 'updateUserProfile',
      errorMessage: error instanceof Error ? error.message : 'Unknown error'
    });
    logger.trackRequest('PUT /api/users/me', request.url, duration, 500, false);

    return internalServerError();
  }
}

app.http('updateUserProfile', {
  methods: ['PUT'],
  authLevel: 'anonymous',
  route: 'users/me',
  handler: updateUserProfile
});
