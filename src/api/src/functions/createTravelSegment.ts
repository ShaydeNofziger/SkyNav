/**
 * Azure Function: Create Travel Segment
 * POST /api/trips/{tripId}/segments
 * 
 * Adds a new travel segment to a trip for the authenticated user
 */

import { app, HttpRequest, HttpResponseInit, InvocationContext } from '@azure/functions';
import { validateToken } from '../middleware/auth';
import { createTripService } from '../services/TripService';
import { CreateTravelSegmentDTO, toTravelSegmentDetailDTO } from '../dtos/TravelSegmentDTO';
import { TravelSegmentType } from '../models/TravelSegment';

/**
 * Validate create travel segment request body
 */
function validateCreateSegmentRequest(body: any): { valid: boolean; error?: string } {
  if (!body) {
    return { valid: false, error: 'Request body is required' };
  }

  if (!body.type || !Object.values(TravelSegmentType).includes(body.type)) {
    return { valid: false, error: 'Valid segment type is required (flight, drive, lodging)' };
  }

  if (!body.startDate || typeof body.startDate !== 'string') {
    return { valid: false, error: 'Start date is required (ISO 8601 format)' };
  }

  if (!body.endDate || typeof body.endDate !== 'string') {
    return { valid: false, error: 'End date is required (ISO 8601 format)' };
  }

  // Validate that end date is not before start date
  const startDateObj = new Date(body.startDate);
  const endDateObj = new Date(body.endDate);
  
  if (endDateObj < startDateObj) {
    return { valid: false, error: 'End date cannot be before start date' };
  }

  // Type-specific validation
  if (body.type === TravelSegmentType.FLIGHT && body.flightDetails) {
    // Optional: validate flight details if provided
  }

  if (body.type === TravelSegmentType.DRIVE && body.driveDetails) {
    // Optional: validate drive details if provided
  }

  if (body.type === TravelSegmentType.LODGING && body.lodgingDetails) {
    // Optional: validate lodging details if provided
  }

  return { valid: true };
}

export async function createTravelSegment(request: HttpRequest, context: InvocationContext): Promise<HttpResponseInit> {
  try {
    // Validate JWT token
    const user = await validateToken(request, context);
    
    // Get trip ID from route parameter
    const tripId = request.params.tripId;
    
    if (!tripId) {
      return {
        status: 400,
        jsonBody: {
          error: 'Invalid request',
          message: 'Trip ID is required'
        }
      };
    }

    // Parse and validate request body
    const body = await request.json() as CreateTravelSegmentDTO;
    const validation = validateCreateSegmentRequest(body);
    
    if (!validation.valid) {
      return {
        status: 400,
        jsonBody: {
          error: 'Invalid request',
          message: validation.error
        }
      };
    }

    // Add travel segment to trip
    const tripService = createTripService();
    const trip = await tripService.addTravelSegment(tripId, user.userId, body);
    
    // Find the newly created segment (last one in the array)
    const newSegment = trip.segments[trip.segments.length - 1];
    const segmentDto = toTravelSegmentDetailDTO(newSegment);

    return {
      status: 201,
      jsonBody: segmentDto
    };
  } catch (error) {
    context.error('Error creating travel segment', error);
    
    if (error instanceof Error && error.message.includes('Token validation failed')) {
      return {
        status: 401,
        jsonBody: {
          error: 'Unauthorized',
          message: error.message
        }
      };
    }

    if (error instanceof Error && error.message === 'Trip not found') {
      return {
        status: 404,
        jsonBody: {
          error: 'Trip not found',
          message: 'The specified trip was not found or does not belong to the authenticated user'
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

app.http('createTravelSegment', {
  methods: ['POST'],
  authLevel: 'anonymous',
  route: 'trips/{tripId}/segments',
  handler: createTravelSegment
});
