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
import { 
  badRequest, 
  notFound, 
  internalServerError,
  handleAuthError,
  validationError,
  parseRequestBody
} from '../utils/errorResponse';
import { 
  isValidDateFormat, 
  isValidDateRange,
  validateFlightDetails,
  validateDriveDetails,
  validateLodgingDetails
} from '../utils/validation';

/**
 * Validate create travel segment request body
 */
function validateCreateSegmentRequest(body: any): { valid: boolean; error?: string; details?: Record<string, string> } {
  if (!body) {
    return { valid: false, error: 'Request body is required' };
  }

  const errors: Record<string, string> = {};

  if (!body.type || !Object.values(TravelSegmentType).includes(body.type)) {
    errors.type = 'Valid segment type is required (flight, drive, lodging)';
  }

  if (!body.startDate || typeof body.startDate !== 'string') {
    errors.startDate = 'Start date is required (ISO 8601 format: YYYY-MM-DD)';
  } else if (!isValidDateFormat(body.startDate)) {
    errors.startDate = 'Invalid start date format (expected: YYYY-MM-DD)';
  }

  if (!body.endDate || typeof body.endDate !== 'string') {
    errors.endDate = 'End date is required (ISO 8601 format: YYYY-MM-DD)';
  } else if (!isValidDateFormat(body.endDate)) {
    errors.endDate = 'Invalid end date format (expected: YYYY-MM-DD)';
  }

  // Validate date range if both dates are valid
  if (body.startDate && body.endDate && isValidDateFormat(body.startDate) && isValidDateFormat(body.endDate)) {
    if (!isValidDateRange(body.startDate, body.endDate)) {
      errors.endDate = 'End date cannot be before start date';
    }
  }

  // Type-specific validation
  if (body.type === TravelSegmentType.FLIGHT && body.flightDetails) {
    const flightValidation = validateFlightDetails(body.flightDetails);
    if (!flightValidation.valid && flightValidation.errors) {
      Object.assign(errors, flightValidation.errors);
    }
  }

  if (body.type === TravelSegmentType.DRIVE && body.driveDetails) {
    const driveValidation = validateDriveDetails(body.driveDetails);
    if (!driveValidation.valid && driveValidation.errors) {
      Object.assign(errors, driveValidation.errors);
    }
  }

  if (body.type === TravelSegmentType.LODGING && body.lodgingDetails) {
    const lodgingValidation = validateLodgingDetails(body.lodgingDetails);
    if (!lodgingValidation.valid && lodgingValidation.errors) {
      Object.assign(errors, lodgingValidation.errors);
    }
  }

  if (Object.keys(errors).length > 0) {
    return {
      valid: false,
      error: 'Invalid segment data',
      details: errors
    };
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
      return badRequest('Trip ID is required');
    }

    // Parse and validate request body
    const parseResult = await parseRequestBody<CreateTravelSegmentDTO>(request);
    if (!parseResult.success) {
      return parseResult.response;
    }
    
    const body = parseResult.data;
    const validation = validateCreateSegmentRequest(body);
    
    if (!validation.valid) {
      if (validation.details) {
        return validationError(validation.error || 'Invalid segment data', validation.details);
      }
      return badRequest(validation.error || 'Invalid segment data');
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
      return handleAuthError(error);
    }

    if (error instanceof Error && error.message === 'Trip not found') {
      return notFound('The specified trip was not found or does not belong to you');
    }

    return internalServerError();
  }
}

app.http('createTravelSegment', {
  methods: ['POST'],
  authLevel: 'anonymous',
  route: 'trips/{tripId}/segments',
  handler: createTravelSegment
});
