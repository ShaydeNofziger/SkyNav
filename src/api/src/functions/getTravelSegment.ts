/**
 * Azure Function: Get Travel Segment
 * GET /api/trips/{tripId}/segments/{segmentId}
 * 
 * Retrieves a specific travel segment from a trip
 */

import { app, HttpRequest, HttpResponseInit, InvocationContext } from '@azure/functions';
import { validateToken } from '../middleware/auth';
import { createTripService } from '../services/TripService';
import { toTravelSegmentDetailDTO } from '../dtos/TravelSegmentDTO';

export async function getTravelSegment(request: HttpRequest, context: InvocationContext): Promise<HttpResponseInit> {
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

    // Get travel segment
    const tripService = createTripService();
    const segment = await tripService.getTravelSegment(tripId, user.userId, segmentId);

    if (!segment) {
      return {
        status: 404,
        jsonBody: {
          error: 'Not found',
          message: 'Travel segment not found or trip does not belong to the authenticated user'
        }
      };
    }

    const segmentDto = toTravelSegmentDetailDTO(segment);

    return {
      status: 200,
      jsonBody: segmentDto
    };
  } catch (error) {
    context.error('Error getting travel segment', error);
    
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

app.http('getTravelSegment', {
  methods: ['GET'],
  authLevel: 'anonymous',
  route: 'trips/{tripId}/segments/{segmentId}',
  handler: getTravelSegment
});
