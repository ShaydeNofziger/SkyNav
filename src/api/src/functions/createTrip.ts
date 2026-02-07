/**
 * Azure Function: Create Trip
 * POST /api/trips
 * 
 * Creates a new trip for the authenticated user
 */

import { app, HttpRequest, HttpResponseInit, InvocationContext } from '@azure/functions';
import { validateToken } from '../middleware/auth';
import { createTripService } from '../services/TripService';
import { CreateTripDTO } from '../dtos/TripDTO';
import { toTripDetailDTO } from '../dtos/TripDTO';

/**
 * Validate create trip request body
 */
function validateCreateTripRequest(body: any): { valid: boolean; error?: string } {
  if (!body) {
    return { valid: false, error: 'Request body is required' };
  }

  if (!body.name || typeof body.name !== 'string' || body.name.trim().length === 0) {
    return { valid: false, error: 'Trip name is required' };
  }

  if (!body.startDate || typeof body.startDate !== 'string') {
    return { valid: false, error: 'Start date is required (ISO 8601 format: YYYY-MM-DD)' };
  }

  if (!body.endDate || typeof body.endDate !== 'string') {
    return { valid: false, error: 'End date is required (ISO 8601 format: YYYY-MM-DD)' };
  }

  // Validate date format (basic check)
  const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
  if (!dateRegex.test(body.startDate)) {
    return { valid: false, error: 'Invalid start date format (expected: YYYY-MM-DD)' };
  }

  if (!dateRegex.test(body.endDate)) {
    return { valid: false, error: 'Invalid end date format (expected: YYYY-MM-DD)' };
  }

  // Validate that end date is not before start date
  if (body.endDate < body.startDate) {
    return { valid: false, error: 'End date cannot be before start date' };
  }

  return { valid: true };
}

export async function createTrip(request: HttpRequest, context: InvocationContext): Promise<HttpResponseInit> {
  try {
    // Validate JWT token
    const user = await validateToken(request, context);
    
    // Parse and validate request body
    const body = await request.json() as CreateTripDTO;
    const validation = validateCreateTripRequest(body);
    
    if (!validation.valid) {
      return {
        status: 400,
        jsonBody: {
          error: 'Invalid request',
          message: validation.error
        }
      };
    }

    // Create trip
    const tripService = createTripService();
    const trip = await tripService.createTrip(user.userId, body);
    
    // Convert to DTO
    const tripDto = toTripDetailDTO(trip);

    return {
      status: 201,
      jsonBody: tripDto
    };
  } catch (error) {
    context.error('Error creating trip', error);
    
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

app.http('createTrip', {
  methods: ['POST'],
  authLevel: 'anonymous',
  route: 'trips',
  handler: createTrip
});
