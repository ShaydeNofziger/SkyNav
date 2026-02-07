/**
 * Azure Function: Delete Travel Segment
 * DELETE /api/trips/{tripId}/segments/{segmentId}
 * 
 * Deletes a travel segment from a trip
 */

import { app, HttpRequest, HttpResponseInit, InvocationContext } from '@azure/functions';
import { validateToken } from '../middleware/auth';
import { createTripService } from '../services/TripService';
import { createLogger, TelemetryEvents } from '../utils/telemetry';

export async function deleteTravelSegment(request: HttpRequest, context: InvocationContext): Promise<HttpResponseInit> {
  const startTime = Date.now();
  const logger = createLogger(context, 'deleteTravelSegment');
  
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
      logger.trackRequest('DELETE /api/trips/{tripId}/segments/{segmentId}', request.url, duration, 400, false);
      
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
      logger.trackRequest('DELETE /api/trips/{tripId}/segments/{segmentId}', request.url, duration, 400, false);
      
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

    // Track success
    const duration = Date.now() - startTime;
    logger.trackEvent(TelemetryEvents.SEGMENT_DELETED, { 
      userId: user.userId,
      tripId: tripId,
      segmentId: segmentId
    });
    logger.trackRequest('DELETE /api/trips/{tripId}/segments/{segmentId}', request.url, duration, 204, true, {
      userId: user.userId
    });

    return {
      status: 204,
      body: ''
    };
  } catch (error) {
    const duration = Date.now() - startTime;
    logger.error('Error deleting travel segment', error instanceof Error ? error : undefined, {
      errorMessage: error instanceof Error ? error.message : 'Unknown error'
    });
    
    if (error instanceof Error && error.message.includes('Token validation failed')) {
      logger.trackEvent(TelemetryEvents.AUTH_FAILED, { 
        endpoint: 'deleteTravelSegment'
      });
      logger.trackRequest('DELETE /api/trips/{tripId}/segments/{segmentId}', request.url, duration, 401, false);
      
      return {
        status: 401,
        jsonBody: {
          error: 'Unauthorized',
          message: error.message
        }
      };
    }

    if (error instanceof Error && (error.message === 'Trip not found' || error.message === 'Travel segment not found')) {
      logger.trackRequest('DELETE /api/trips/{tripId}/segments/{segmentId}', request.url, duration, 404, false);
      
      return {
        status: 404,
        jsonBody: {
          error: 'Not found',
          message: error.message
        }
      };
    }

    logger.trackEvent(TelemetryEvents.API_ERROR, { 
      endpoint: 'deleteTravelSegment',
      errorMessage: error instanceof Error ? error.message : 'Unknown error'
    });
    logger.trackRequest('DELETE /api/trips/{tripId}/segments/{segmentId}', request.url, duration, 500, false);

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
