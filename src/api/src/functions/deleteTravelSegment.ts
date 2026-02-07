/**
 * Azure Function: Delete Travel Segment
 * DELETE /api/trips/{tripId}/segments/{segmentId}
 * 
 * Deletes a travel segment from a trip
 */

import { app, HttpRequest, HttpResponseInit, InvocationContext } from '@azure/functions';
import { validateToken } from '../middleware/auth';
import { createTripService } from '../services/TripService';

export async function deleteTravelSegment(request: HttpRequest, context: InvocationContext): Promise<HttpResponseInit> {
  try {
    // Validate JWT token
    const user = await validateToken(request, context);
    
    // Get route parameters
    const tripId = request.params.tripId;
    const segmentId = request.params.segmentId;
    
    if (!tripId) {
      return {
        status: 400,
        jsonBody: {
          error: 'Invalid request',
          message: 'Trip ID is required'
        }
      };
    }

    if (!segmentId) {
      return {
        status: 400,
        jsonBody: {
          error: 'Invalid request',
          message: 'Segment ID is required'
        }
      };
    }

    // Delete travel segment
    const tripService = createTripService();
    await tripService.deleteTravelSegment(tripId, user.userId, segmentId);

    return {
      status: 204,
      body: ''
    };
  } catch (error) {
    context.error('Error deleting travel segment', error);
    
    if (error instanceof Error && error.message.includes('Token validation failed')) {
      return {
        status: 401,
        jsonBody: {
          error: 'Unauthorized',
          message: error.message
        }
      };
    }

    if (error instanceof Error && (error.message === 'Trip not found' || error.message === 'Travel segment not found')) {
      return {
        status: 404,
        jsonBody: {
          error: 'Not found',
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

app.http('deleteTravelSegment', {
  methods: ['DELETE'],
  authLevel: 'anonymous',
  route: 'trips/{tripId}/segments/{segmentId}',
  handler: deleteTravelSegment
});
