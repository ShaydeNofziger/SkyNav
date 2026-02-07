/**
 * Azure Function: Update Travel Segment
 * PUT /api/trips/{tripId}/segments/{segmentId}
 * 
 * Updates an existing travel segment in a trip
 */

import { app, HttpRequest, HttpResponseInit, InvocationContext } from '@azure/functions';
import { validateToken } from '../middleware/auth';
import { createTripService } from '../services/TripService';
import { UpdateTravelSegmentDTO, toTravelSegmentDetailDTO } from '../dtos/TravelSegmentDTO';
import { createLogger, TelemetryEvents } from '../utils/telemetry';

/**
 * Validate update travel segment request body
 */
function validateUpdateSegmentRequest(body: any): { valid: boolean; error?: string } {
  if (!body) {
    return { valid: false, error: 'Request body is required' };
  }

  // At least one field should be provided for update
  const hasUpdates = body.startDate || body.endDate || body.flightDetails || 
                     body.driveDetails || body.lodgingDetails || body.dropzoneId ||
                     body.plannedJumpCount !== undefined || body.actualJumpCount !== undefined ||
                     body.jumpTypes || body.jumpGoals || body.notes || 
                     body.completed !== undefined;

  if (!hasUpdates) {
    return { valid: false, error: 'At least one field must be provided for update' };
  }

  // Validate dates if both are provided
  if (body.startDate && body.endDate) {
    const startDateObj = new Date(body.startDate);
    const endDateObj = new Date(body.endDate);
    
    if (endDateObj < startDateObj) {
      return { valid: false, error: 'End date cannot be before start date' };
    }
  }

  return { valid: true };
}

export async function updateTravelSegment(request: HttpRequest, context: InvocationContext): Promise<HttpResponseInit> {
  const startTime = Date.now();
  const logger = createLogger(context, 'updateTravelSegment');
  
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
      logger.trackRequest('PUT /api/trips/{tripId}/segments/{segmentId}', request.url, duration, 400, false);
      
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
      logger.trackRequest('PUT /api/trips/{tripId}/segments/{segmentId}', request.url, duration, 400, false);
      
      return {
        status: 400,
        jsonBody: {
          error: 'Invalid request',
          message: 'Segment ID is required'
        }
      };
    }

    // Parse and validate request body
    const body = await request.json() as UpdateTravelSegmentDTO;
    const validation = validateUpdateSegmentRequest(body);
    
    if (!validation.valid) {
      logger.warn('Validation failed', { error: validation.error || 'Unknown validation error' });
      logger.trackEvent(TelemetryEvents.VALIDATION_ERROR, { 
        endpoint: 'updateTravelSegment',
        error: validation.error || 'Unknown validation error'
      });
      const duration = Date.now() - startTime;
      logger.trackRequest('PUT /api/trips/{tripId}/segments/{segmentId}', request.url, duration, 400, false);
      
      return {
        status: 400,
        jsonBody: {
          error: 'Invalid request',
          message: validation.error
        }
      };
    }

    // Update travel segment
    const tripService = createTripService();
    const trip = await tripService.updateTravelSegment(tripId, user.userId, segmentId, body);
    
    // Find the updated segment
    const updatedSegment = trip.segments.find(s => s.id === segmentId);
    if (!updatedSegment) {
      logger.error('Segment not found after update', undefined, { segmentId, tripId });
      const duration = Date.now() - startTime;
      logger.trackEvent(TelemetryEvents.API_ERROR, { 
        endpoint: 'updateTravelSegment',
        errorMessage: 'Segment not found after update'
      });
      logger.trackRequest('PUT /api/trips/{tripId}/segments/{segmentId}', request.url, duration, 500, false);
      
      throw new Error('Segment not found after update');
    }

    const segmentDto = toTravelSegmentDetailDTO(updatedSegment);

    // Track success
    const duration = Date.now() - startTime;
    logger.trackEvent(TelemetryEvents.SEGMENT_UPDATED, { 
      userId: user.userId,
      tripId: trip.id,
      segmentId: updatedSegment.id
    });
    logger.trackRequest('PUT /api/trips/{tripId}/segments/{segmentId}', request.url, duration, 200, true, {
      userId: user.userId
    });

    return {
      status: 200,
      jsonBody: segmentDto
    };
  } catch (error) {
    const duration = Date.now() - startTime;
    logger.error('Error updating travel segment', error instanceof Error ? error : undefined, {
      errorMessage: error instanceof Error ? error.message : 'Unknown error'
    });
    
    if (error instanceof Error && error.message.includes('Token validation failed')) {
      logger.trackEvent(TelemetryEvents.AUTH_FAILED, { 
        endpoint: 'updateTravelSegment'
      });
      logger.trackRequest('PUT /api/trips/{tripId}/segments/{segmentId}', request.url, duration, 401, false);
      
      return {
        status: 401,
        jsonBody: {
          error: 'Unauthorized',
          message: error.message
        }
      };
    }

    if (error instanceof Error && (error.message === 'Trip not found' || error.message === 'Travel segment not found')) {
      logger.trackRequest('PUT /api/trips/{tripId}/segments/{segmentId}', request.url, duration, 404, false);
      
      return {
        status: 404,
        jsonBody: {
          error: 'Not found',
          message: error.message
        }
      };
    }

    logger.trackEvent(TelemetryEvents.API_ERROR, { 
      endpoint: 'updateTravelSegment',
      errorMessage: error instanceof Error ? error.message : 'Unknown error'
    });
    logger.trackRequest('PUT /api/trips/{tripId}/segments/{segmentId}', request.url, duration, 500, false);

    return {
      status: 500,
      jsonBody: {
        error: 'Internal server error',
        message: error instanceof Error ? error.message : 'Unknown error'
      }
    };
  }
}

app.http('updateTravelSegment', {
  methods: ['PUT'],
  authLevel: 'anonymous',
  route: 'trips/{tripId}/segments/{segmentId}',
  handler: updateTravelSegment
});
