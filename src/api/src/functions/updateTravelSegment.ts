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

    // Parse and validate request body
    const body = await request.json() as UpdateTravelSegmentDTO;
    const validation = validateUpdateSegmentRequest(body);
    
    if (!validation.valid) {
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
      throw new Error('Segment not found after update');
    }

    const segmentDto = toTravelSegmentDetailDTO(updatedSegment);

    return {
      status: 200,
      jsonBody: segmentDto
    };
  } catch (error) {
    context.error('Error updating travel segment', error);
    
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

app.http('updateTravelSegment', {
  methods: ['PUT'],
  authLevel: 'anonymous',
  route: 'trips/{tripId}/segments/{segmentId}',
  handler: updateTravelSegment
});
