/**
 * Azure Function: Update Trip Checklist
 * PUT /api/trips/{tripId}/checklist
 *
 * Persists checklist item state for the authenticated user's trip.
 */

import { app, HttpRequest, HttpResponseInit, InvocationContext } from '@azure/functions';
import { validateToken } from '../middleware/auth';
import { createTripService } from '../services/TripService';
import { ChecklistItem } from '../models/Trip';
import { toTripDetailDTO } from '../dtos/TripDTO';
import { createLogger, TelemetryEvents } from '../utils/telemetry';
import { handleAuthError, badRequest, notFound, internalServerError } from '../utils/errorResponse';

/**
 * Validate the checklist update request body
 */
function validateChecklistBody(body: any): { valid: boolean; error?: string } {
  if (!body) {
    return { valid: false, error: 'Request body is required' };
  }

  if (!Array.isArray(body.checklist)) {
    return { valid: false, error: 'checklist must be an array' };
  }

  for (const item of body.checklist) {
    if (typeof item.id !== 'string' || item.id.trim().length === 0) {
      return { valid: false, error: 'Each checklist item must have a non-empty string id' };
    }
    if (typeof item.completed !== 'boolean') {
      return { valid: false, error: `Checklist item "${item.id}" must have a boolean completed field` };
    }
    if (typeof item.label !== 'string') {
      return { valid: false, error: `Checklist item "${item.id}" must have a string label field` };
    }
    if (typeof item.order !== 'number') {
      return { valid: false, error: `Checklist item "${item.id}" must have a numeric order field` };
    }
  }

  return { valid: true };
}

export async function updateChecklist(
  request: HttpRequest,
  context: InvocationContext
): Promise<HttpResponseInit> {
  const startTime = Date.now();
  const logger = createLogger(context, 'updateChecklist');

  try {
    // Validate JWT token
    const user = await validateToken(request, context);
    logger.info('User authenticated', { userId: user.userId });

    const tripId = request.params.tripId;
    if (!tripId) {
      return badRequest('Trip ID is required');
    }

    // Parse and validate request body
    let body: any;
    try {
      body = await request.json();
    } catch {
      return badRequest('Invalid JSON in request body');
    }

    const validation = validateChecklistBody(body);
    if (!validation.valid) {
      logger.warn('Validation failed', { error: validation.error ?? 'Unknown' });
      logger.trackEvent(TelemetryEvents.VALIDATION_ERROR, {
        endpoint: 'updateChecklist',
        error: validation.error ?? 'Unknown',
      });
      return badRequest(validation.error ?? 'Invalid request body');
    }

    // Persist checklist
    const tripService = createTripService();
    let updatedTrip;
    try {
      updatedTrip = await tripService.updateChecklist(
        tripId,
        user.userId,
        body.checklist as ChecklistItem[]
      );
    } catch (svcError) {
      if (svcError instanceof Error && svcError.message === 'Trip not found') {
        return notFound(`Trip ${tripId} not found`);
      }
      throw svcError;
    }

    const tripDto = toTripDetailDTO(updatedTrip);

    const duration = Date.now() - startTime;
    logger.trackEvent(TelemetryEvents.TRIP_UPDATED, {
      userId: user.userId,
      tripId,
      action: 'checklistUpdate',
    });
    logger.trackRequest(
      `PUT /api/trips/${tripId}/checklist`,
      request.url,
      duration,
      200,
      true,
      { userId: user.userId }
    );

    return {
      status: 200,
      jsonBody: tripDto,
    };
  } catch (error) {
    const duration = Date.now() - startTime;
    logger.error('Error updating checklist', error instanceof Error ? error : undefined, {
      errorMessage: error instanceof Error ? error.message : 'Unknown error',
    });

    if (error instanceof Error && error.message.includes('Token')) {
      logger.trackEvent(TelemetryEvents.AUTH_FAILED, {
        endpoint: 'updateChecklist',
        reason: error.message,
      });
      logger.trackRequest(request.method, request.url, duration, 401, false);
      return handleAuthError(error);
    }

    logger.trackEvent(TelemetryEvents.API_ERROR, {
      endpoint: 'updateChecklist',
      errorMessage: error instanceof Error ? error.message : 'Unknown error',
    });
    logger.trackRequest(request.method, request.url, duration, 500, false);
    return internalServerError();
  }
}

app.http('updateChecklist', {
  methods: ['PUT'],
  authLevel: 'anonymous',
  route: 'trips/{tripId}/checklist',
  handler: updateChecklist,
});
