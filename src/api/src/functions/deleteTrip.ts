/**
 * Azure Function: Delete Trip
 * DELETE /api/trips/{id}
 * 
 * Deletes a trip for the authenticated user
 */

import { app, HttpRequest, HttpResponseInit, InvocationContext } from '@azure/functions';
import { validateToken } from '../middleware/auth';
import { createTripService } from '../services/TripService';
import { createLogger, TelemetryEvents } from '../utils/telemetry';

export async function deleteTrip(request: HttpRequest, context: InvocationContext): Promise<HttpResponseInit> {
  const startTime = Date.now();
  const logger = createLogger(context, 'deleteTrip');
  
  try {
    // Validate JWT token
    const user = await validateToken(request, context);
    logger.info('User authenticated', { userId: user.userId });
    
    // Get trip ID from route
    const tripId = request.params.id;
    if (!tripId) {
      logger.warn('Trip ID missing');
      const duration = Date.now() - startTime;
      logger.trackRequest('DELETE /api/trips/{id}', request.url, duration, 400, false);
      
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
      logger.warn('Trip not found', { tripId, userId: user.userId });
      const duration = Date.now() - startTime;
      logger.trackRequest('DELETE /api/trips/{id}', request.url, duration, 404, false);
      
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

    // Track success
    const duration = Date.now() - startTime;
    logger.trackEvent(TelemetryEvents.TRIP_DELETED, { 
      userId: user.userId,
      tripId: trip.id
    });
    logger.trackRequest('DELETE /api/trips/{id}', request.url, duration, 204, true, {
      userId: user.userId
    });

    return {
      status: 204
    };
  } catch (error) {
    const duration = Date.now() - startTime;
    logger.error('Error deleting trip', error instanceof Error ? error : undefined, {
      errorMessage: error instanceof Error ? error.message : 'Unknown error'
    });
    
    if (error instanceof Error && error.message.includes('Token validation failed')) {
      logger.trackEvent(TelemetryEvents.AUTH_FAILED, { 
        endpoint: 'deleteTrip'
      });
      logger.trackRequest('DELETE /api/trips/{id}', request.url, duration, 401, false);
      
      return {
        status: 401,
        jsonBody: {
          error: 'Unauthorized',
          message: error.message
        }
      };
    }

    logger.trackEvent(TelemetryEvents.API_ERROR, { 
      endpoint: 'deleteTrip',
      errorMessage: error instanceof Error ? error.message : 'Unknown error'
    });
    logger.trackRequest('DELETE /api/trips/{id}', request.url, duration, 500, false);

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
