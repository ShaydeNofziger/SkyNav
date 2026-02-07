/**
 * Azure Function: Delete Trip
 * DELETE /api/trips/{id}
 * 
 * Deletes a trip for the authenticated user
 */

import { app, HttpRequest, HttpResponseInit, InvocationContext } from '@azure/functions';
import { validateToken } from '../middleware/auth';
import { createTripService } from '../services/TripService';

export async function deleteTrip(request: HttpRequest, context: InvocationContext): Promise<HttpResponseInit> {
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

    // Check if trip exists first
    const tripService = createTripService();
    const trip = await tripService.getTripById(tripId, user.userId);
    
    if (!trip) {
      return {
        status: 404,
        jsonBody: {
          error: 'Not found',
          message: 'Trip not found'
        }
      };
    }

    // Delete trip
    await tripService.deleteTrip(tripId, user.userId);

    return {
      status: 204
    };
  } catch (error) {
    context.error('Error deleting trip', error);
    
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

app.http('deleteTrip', {
  methods: ['DELETE'],
  authLevel: 'anonymous',
  route: 'trips/{id}',
  handler: deleteTrip
});
