/**
 * Azure Function: Update Trip
 * PUT /api/trips/{id}
 * 
 * Updates an existing trip for the authenticated user
 */

import { app, HttpRequest, HttpResponseInit, InvocationContext } from '@azure/functions';
import { validateToken } from '../middleware/auth';
import { createTripService } from '../services/TripService';
import { UpdateTripDTO, toTripDetailDTO } from '../dtos/TripDTO';
import { TripStatus } from '../models/Trip';

/**
 * Validate update trip request body
 */
function validateUpdateTripRequest(body: any): { valid: boolean; error?: string } {
  if (!body) {
    return { valid: false, error: 'Request body is required' };
  }

  // At least one field must be provided
  const hasUpdate = body.name !== undefined || 
                    body.description !== undefined || 
                    body.status !== undefined || 
                    body.startDate !== undefined || 
                    body.endDate !== undefined || 
                    body.notes !== undefined;

  if (!hasUpdate) {
    return { valid: false, error: 'At least one field must be provided for update' };
  }

  // Validate date format if provided
  const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
  
  if (body.startDate !== undefined && !dateRegex.test(body.startDate)) {
    return { valid: false, error: 'Invalid start date format (expected: YYYY-MM-DD)' };
  }

  if (body.endDate !== undefined && !dateRegex.test(body.endDate)) {
    return { valid: false, error: 'Invalid end date format (expected: YYYY-MM-DD)' };
  }

  // Validate status if provided
  if (body.status !== undefined) {
    const validStatuses = Object.values(TripStatus);
    if (!validStatuses.includes(body.status)) {
      return { valid: false, error: `Invalid status. Must be one of: ${validStatuses.join(', ')}` };
    }
  }

  return { valid: true };
}

export async function updateTrip(request: HttpRequest, context: InvocationContext): Promise<HttpResponseInit> {
  try {
    // Validate JWT token
    const user = await validateToken(request, context);
    
    // Get trip ID from route
    const tripId = request.params.id;
    if (!tripId) {
      return {
        status: 400,
        jsonBody: {
          error: 'Invalid request',
          message: 'Trip ID is required'
        }
      };
    }

    // Parse and validate request body
    const body = await request.json() as UpdateTripDTO;
    const validation = validateUpdateTripRequest(body);
    
    if (!validation.valid) {
      return {
        status: 400,
        jsonBody: {
          error: 'Invalid request',
          message: validation.error
        }
      };
    }

    // Update trip
    const tripService = createTripService();
    const trip = await tripService.updateTrip(tripId, user.userId, body);
    
    // Convert to DTO
    const tripDto = toTripDetailDTO(trip);

    return {
      status: 200,
      jsonBody: tripDto
    };
  } catch (error) {
    context.error('Error updating trip', error);
    
    if (error instanceof Error && error.message.includes('Token validation failed')) {
      return {
        status: 401,
        jsonBody: {
          error: 'Unauthorized',
          message: error.message
        }
      };
    }

    if (error instanceof Error && error.message.includes('Trip not found')) {
      return {
        status: 404,
        jsonBody: {
          error: 'Not found',
          message: 'Trip not found'
        }
      };
    }

    if (error instanceof Error && error.message.includes('End date cannot be before start date')) {
      return {
        status: 400,
        jsonBody: {
          error: 'Invalid request',
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

app.http('updateTrip', {
  methods: ['PUT'],
  authLevel: 'anonymous',
  route: 'trips/{id}',
  handler: updateTrip
});
