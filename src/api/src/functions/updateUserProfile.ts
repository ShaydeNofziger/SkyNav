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
    
    // Parse request body with error handling
    const parseResult = await parseRequestBody<UpdateProfileRequest>(request);
    if (!parseResult.success) {
      return parseResult.response;
    }
    
    const body = parseResult.data;

    // Validate that at least one field is provided
    if (!body || Object.keys(body).length === 0) {
      return badRequest('At least one profile field must be provided for update');
    }

    // Validate profile fields
    const validation = validateUserProfile(body);
    if (!validation.valid) {
      return validationError('Invalid profile data', validation.errors);
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
      return handleAuthError(error);
    }

    if (error instanceof Error && error.message === 'User not found') {
      return notFound('User profile not found');
    }

    return internalServerError();
  }
}

app.http('updateUserProfile', {
  methods: ['PUT'],
  authLevel: 'anonymous',
  route: 'users/me',
  handler: updateUserProfile
});
