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

export async function listTrips(request: HttpRequest, context: InvocationContext): Promise<HttpResponseInit> {
  try {
    // Validate JWT token
    const user = await validateToken(request, context);
    
    // Parse query parameters
    const status = request.query.get('status') as TripStatus | undefined;
    const page = parseInt(request.query.get('page') || '1', 10);
    const pageSize = parseInt(request.query.get('pageSize') || '30', 10);

    // Validate page parameters
    if (page < 1) {
      return {
        status: 400,
        jsonBody: {
          error: 'Invalid request',
          message: 'Page must be greater than 0'
        }
      };
    }

    if (pageSize < 1 || pageSize > 100) {
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

    return {
      status: 200,
      jsonBody: result
    };
  } catch (error) {
    context.error('Error listing trips', error);
    
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

app.http('listTrips', {
  methods: ['GET'],
  authLevel: 'anonymous',
  route: 'trips',
  handler: listTrips
});
