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
import { createLogger, TelemetryEvents } from '../utils/telemetry';

export async function getTravelSegment(request: HttpRequest, context: InvocationContext): Promise<HttpResponseInit> {
  const startTime = Date.now();
  const logger = createLogger(context, 'getTravelSegment');
  
  try {
    // Validate JWT token
    const user = await validateToken(request, context);
    logger.info('User authenticated', { userId: user.userId });
    
    // Get route parameters
    const tripId = request.params.tripId;
    const segmentId = request.params.segmentId;
    
    if (!tripId) {
      logger.warn('Trip ID missing');
      const duration = Date.now() - startTime;
      logger.trackRequest('GET /api/trips/{tripId}/segments/{segmentId}', request.url, duration, 400, false);
      
      return {
        status: 400,
        jsonBody: {
          error: 'Invalid request',
          message: 'Trip ID is required'
        }
      };
    }

    if (!segmentId) {
      logger.warn('Segment ID missing');
      const duration = Date.now() - startTime;
      logger.trackRequest('GET /api/trips/{tripId}/segments/{segmentId}', request.url, duration, 400, false);
      
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
      logger.warn('Travel segment not found', { tripId, segmentId, userId: user.userId });
      const duration = Date.now() - startTime;
      logger.trackRequest('GET /api/trips/{tripId}/segments/{segmentId}', request.url, duration, 404, false);
      
      return {
        status: 404,
        jsonBody: {
          error: 'Not found',
          message: 'Travel segment not found or trip does not belong to the authenticated user'
        }
      };
    }

    const segmentDto = toTravelSegmentDetailDTO(segment);

    // Track success
    const duration = Date.now() - startTime;
    logger.trackEvent(TelemetryEvents.SEGMENT_VIEWED, { 
      userId: user.userId,
      tripId: tripId,
      segmentId: segment.id
    });
    logger.trackRequest('GET /api/trips/{tripId}/segments/{segmentId}', request.url, duration, 200, true, {
      userId: user.userId
    });

    return {
      status: 200,
      jsonBody: segmentDto
    };
  } catch (error) {
    const duration = Date.now() - startTime;
    logger.error('Error getting travel segment', error instanceof Error ? error : undefined, {
      errorMessage: error instanceof Error ? error.message : 'Unknown error'
    });
    
    if (error instanceof Error && error.message.includes('Token validation failed')) {
      logger.trackEvent(TelemetryEvents.AUTH_FAILED, { 
        endpoint: 'getTravelSegment'
      });
      logger.trackRequest('GET /api/trips/{tripId}/segments/{segmentId}', request.url, duration, 401, false);
      
      return {
        status: 401,
        jsonBody: {
          error: 'Unauthorized',
          message: error.message
        }
      };
    }

    logger.trackEvent(TelemetryEvents.API_ERROR, { 
      endpoint: 'getTravelSegment',
      errorMessage: error instanceof Error ? error.message : 'Unknown error'
    });
    logger.trackRequest('GET /api/trips/{tripId}/segments/{segmentId}', request.url, duration, 500, false);

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
