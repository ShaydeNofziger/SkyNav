/**
 * Azure Function: Get Trip
 * GET /api/trips/{id}
 * 
 * Returns a specific trip by ID for the authenticated user
 */

import { app, HttpRequest, HttpResponseInit, InvocationContext } from '@azure/functions';
import { validateToken } from '../middleware/auth';
import { createTripService } from '../services/TripService';

export async function getTrip(request: HttpRequest, context: InvocationContext): Promise<HttpResponseInit> {
  try {
    // Validate JWT token
    const user = await validateToken(request, context);
    
    // Get trip ID from route parameter
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

    // Get trip from database
    const tripService = createTripService();
    const trip = await tripService.getTripDetail(tripId, user.userId);

    if (!trip) {
      return {
        status: 404,
        jsonBody: {
          error: 'Trip not found',
          message: `Trip with ID ${tripId} not found or does not belong to the authenticated user`
        }
      };
    }

    return {
      status: 200,
      jsonBody: trip
    };
  } catch (error) {
    context.error('Error getting trip', error);
    
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

app.http('getTrip', {
  methods: ['GET'],
  authLevel: 'anonymous',
  route: 'trips/{id}',
  handler: getTrip
});
