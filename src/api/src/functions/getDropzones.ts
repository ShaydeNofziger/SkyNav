/**
 * Azure Function: List Dropzones
 * GET /api/dropzones
 * 
 * Returns a list of dropzones with optional filtering by region
 * This is a public endpoint that doesn't require authentication
 */

import { app, HttpRequest, HttpResponseInit, InvocationContext } from '@azure/functions';
import { createDropZoneService } from '../services/DropZoneService';
import { createLogger, TelemetryEvents, TelemetryMetrics } from '../utils/telemetry';

export async function getDropzones(request: HttpRequest, context: InvocationContext): Promise<HttpResponseInit> {
  const startTime = Date.now();
  const logger = createLogger(context, 'getDropzones');
  
  try {
    // Parse query parameters
    const url = new URL(request.url);
    const region = url.searchParams.get('region') || undefined;
    const country = url.searchParams.get('country') || undefined;
    const isActiveParam = url.searchParams.get('isActive');
    const pageParam = url.searchParams.get('page');
    const pageSizeParam = url.searchParams.get('pageSize');

    // Parse isActive as boolean
    let isActive: boolean | undefined = undefined;
    if (isActiveParam !== null) {
      isActive = isActiveParam.toLowerCase() === 'true';
    }

    // Parse pagination parameters
    const page = pageParam ? parseInt(pageParam, 10) : 1;
    const pageSize = pageSizeParam ? parseInt(pageSizeParam, 10) : 30;

    // Validate pagination parameters
    if (isNaN(page) || page < 1) {
      logger.warn('Invalid page parameter');
      const duration = Date.now() - startTime;
      logger.trackRequest('GET /api/dropzones', request.url, duration, 400, false);
      
      return {
        status: 400,
        jsonBody: {
          error: 'Invalid page parameter',
          message: 'Page must be a positive integer'
        }
      };
    }

    if (isNaN(pageSize) || pageSize < 1 || pageSize > 100) {
      logger.warn('Invalid pageSize parameter');
      const duration = Date.now() - startTime;
      logger.trackRequest('GET /api/dropzones', request.url, duration, 400, false);
      
      return {
        status: 400,
        jsonBody: {
          error: 'Invalid pageSize parameter',
          message: 'Page size must be between 1 and 100'
        }
      };
    }

    // Get dropzone service
    const dropzoneService = createDropZoneService();

    // Query dropzones
    const result = await dropzoneService.listDropZones({
      region,
      country,
      isActive,
      page,
      pageSize
    });

    logger.info(`Retrieved ${result.dropzones.length} dropzones (page ${page}, total ${result.totalCount})`);

    // Track success metrics
    const duration = Date.now() - startTime;
    logger.trackEvent(TelemetryEvents.DROPZONE_LIST_VIEWED, { 
      region: region || 'all',
      country: country || 'all',
      page: page.toString(),
      resultCount: result.dropzones.length.toString()
    });
    logger.trackMetric(TelemetryMetrics.ITEM_COUNT, result.dropzones.length, {
      endpoint: 'getDropzones'
    });
    logger.trackRequest('GET /api/dropzones', request.url, duration, 200, true);

    return {
      status: 200,
      jsonBody: result
    };
  } catch (error) {
    const duration = Date.now() - startTime;
    logger.error('Error listing dropzones', error instanceof Error ? error : undefined, {
      errorMessage: error instanceof Error ? error.message : 'Unknown error'
    });
    
    logger.trackEvent(TelemetryEvents.API_ERROR, { 
      endpoint: 'getDropzones',
      errorMessage: error instanceof Error ? error.message : 'Unknown error'
    });
    logger.trackRequest('GET /api/dropzones', request.url, duration, 500, false);

    return {
      status: 500,
      jsonBody: {
        error: 'Internal server error',
        message: error instanceof Error ? error.message : 'Unknown error'
      }
    };
  }
}

app.http('getDropzones', {
  methods: ['GET'],
  authLevel: 'anonymous',
  route: 'dropzones',
  handler: getDropzones
});
