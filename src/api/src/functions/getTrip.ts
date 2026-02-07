/**
 * Azure Function: Get Trip
 * GET /api/trips/{id}
 * 
 * Returns a specific trip by ID for the authenticated user
 */

import { app, HttpRequest, HttpResponseInit, InvocationContext } from '@azure/functions';
import { validateToken } from '../middleware/auth';
import { createTripService } from '../services/TripService';
import { createLogger, TelemetryEvents } from '../utils/telemetry';

export async function getTrip(request: HttpRequest, context: InvocationContext): Promise<HttpResponseInit> {
  const startTime = Date.now();
  const logger = createLogger(context, 'getTrip');
  
  try {
    // Validate JWT token
    const user = await validateToken(request, context);
    
    // Get trip ID from route parameter
    const tripId = request.params.id;
    
    if (!tripId) {
      logger.warn('Trip ID missing');
      const duration = Date.now() - startTime;
      logger.trackRequest('GET /api/trips/{id}', request.url, duration, 400, false);
      
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
      logger.warn('Trip not found', { tripId, userId: user.userId });
      const duration = Date.now() - startTime;
      logger.trackRequest('GET /api/trips/{id}', request.url, duration, 404, false);
      
      return {
        status: 404,
        jsonBody: {
          error: 'Trip not found',
          message: `Trip with ID ${tripId} not found or does not belong to the authenticated user`
        }
      };
    }

    // Track success
    const duration = Date.now() - startTime;
    logger.trackEvent(TelemetryEvents.TRIP_VIEWED, { 
      userId: user.userId,
      tripId: trip.id
    });
    logger.trackRequest('GET /api/trips/{id}', request.url, duration, 200, true);

    return {
      status: 200,
      jsonBody: trip
    };
  } catch (error) {
    const duration = Date.now() - startTime;
    logger.error('Error getting trip', error instanceof Error ? error : undefined, {
      errorMessage: error instanceof Error ? error.message : 'Unknown error'
    });
    
    if (error instanceof Error && error.message.includes('Token validation failed')) {
      logger.trackEvent(TelemetryEvents.AUTH_FAILED, { 
        endpoint: 'getTrip'
      });
      logger.trackRequest('GET /api/trips/{id}', request.url, duration, 401, false);
      
      return {
        status: 401,
        jsonBody: {
          error: 'Unauthorized',
          message: error.message
        }
      };
    }

    logger.trackEvent(TelemetryEvents.API_ERROR, { 
      endpoint: 'getTrip',
      errorMessage: error instanceof Error ? error.message : 'Unknown error'
    });
    logger.trackRequest('GET /api/trips/{id}', request.url, duration, 500, false);

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
