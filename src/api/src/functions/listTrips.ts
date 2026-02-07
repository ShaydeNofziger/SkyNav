/**
 * Azure Function: List Trips
 * GET /api/trips
 * 
 * Lists all trips for the authenticated user
 */

import { app, HttpRequest, HttpResponseInit, InvocationContext } from '@azure/functions';
import { validateToken } from '../middleware/auth';
import { createTripService } from '../services/TripService';
import { TripStatus } from '../models/Trip';
import { createLogger, TelemetryEvents } from '../utils/telemetry';

export async function listTrips(request: HttpRequest, context: InvocationContext): Promise<HttpResponseInit> {
  const startTime = Date.now();
  const logger = createLogger(context, 'listTrips');
  
  try {
    // Validate JWT token
    const user = await validateToken(request, context);
    logger.info('User authenticated', { userId: user.userId });
    
    // Parse query parameters
    const status = request.query.get('status') as TripStatus | undefined;
    const page = parseInt(request.query.get('page') || '1', 10);
    const pageSize = parseInt(request.query.get('pageSize') || '30', 10);

    // Validate page parameters
    if (page < 1) {
      logger.warn('Invalid page parameter');
      const duration = Date.now() - startTime;
      logger.trackRequest('GET /api/trips', request.url, duration, 400, false);
      
      return {
        status: 400,
        jsonBody: {
          error: 'Invalid request',
          message: 'Page must be greater than 0'
        }
      };
    }

    if (pageSize < 1 || pageSize > 100) {
      logger.warn('Invalid pageSize parameter');
      const duration = Date.now() - startTime;
      logger.trackRequest('GET /api/trips', request.url, duration, 400, false);
      
      return {
        status: 400,
        jsonBody: {
          error: 'Invalid request',
          message: 'Page size must be between 1 and 100'
        }
      };
    }

    // List trips
    const tripService = createTripService();
    const result = await tripService.listTrips({
      userId: user.userId,
      status,
      page,
      pageSize
    });

    // Track success
    const duration = Date.now() - startTime;
    logger.trackEvent(TelemetryEvents.TRIP_LIST_VIEWED, { 
      userId: user.userId,
      resultCount: result.trips.length.toString(),
      page: page.toString()
    });
    logger.trackRequest('GET /api/trips', request.url, duration, 200, true, {
      userId: user.userId
    });

    return {
      status: 200,
      jsonBody: result
    };
  } catch (error) {
    const duration = Date.now() - startTime;
    logger.error('Error listing trips', error instanceof Error ? error : undefined, {
      errorMessage: error instanceof Error ? error.message : 'Unknown error'
    });
    
    if (error instanceof Error && error.message.includes('Token validation failed')) {
      logger.trackEvent(TelemetryEvents.AUTH_FAILED, { 
        endpoint: 'listTrips'
      });
      logger.trackRequest('GET /api/trips', request.url, duration, 401, false);
      
      return {
        status: 401,
        jsonBody: {
          error: 'Unauthorized',
          message: error.message
        }
      };
    }

    logger.trackEvent(TelemetryEvents.API_ERROR, { 
      endpoint: 'listTrips',
      errorMessage: error instanceof Error ? error.message : 'Unknown error'
    });
    logger.trackRequest('GET /api/trips', request.url, duration, 500, false);

    return {
      status: 500,
      jsonBody: {
        error: 'Internal server error',
        message: error instanceof Error ? error.message : 'Unknown error'
      }
    };
  }
}

app.http('listTrips', {
  methods: ['GET'],
  authLevel: 'anonymous',
  route: 'trips',
  handler: listTrips
});
