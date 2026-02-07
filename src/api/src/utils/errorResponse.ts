/**
 * Centralized error response utilities
 * Provides consistent error formatting across all API endpoints
 */

import { HttpResponseInit } from '@azure/functions';

/**
 * Standard error response format
 */
export interface ErrorResponse {
  error: string;
  message: string;
  details?: Record<string, string>;
}

/**
 * Create a 400 Bad Request response
 */
export function badRequest(message: string, details?: Record<string, string>): HttpResponseInit {
  return {
    status: 400,
    jsonBody: {
      error: 'Bad Request',
      message,
      ...(details && { details })
    } as ErrorResponse
  };
}

/**
 * Create a 401 Unauthorized response
 */
export function unauthorized(message: string = 'Authentication required. Please sign in to access this resource.'): HttpResponseInit {
  return {
    status: 401,
    jsonBody: {
      error: 'Unauthorized',
      message
    } as ErrorResponse
  };
}

/**
 * Create a 403 Forbidden response
 */
export function forbidden(message: string = 'You do not have permission to access this resource.'): HttpResponseInit {
  return {
    status: 403,
    jsonBody: {
      error: 'Forbidden',
      message
    } as ErrorResponse
  };
}

/**
 * Create a 404 Not Found response
 */
export function notFound(message: string = 'The requested resource was not found.'): HttpResponseInit {
  return {
    status: 404,
    jsonBody: {
      error: 'Not Found',
      message
    } as ErrorResponse
  };
}

/**
 * Create a 422 Unprocessable Entity response (validation errors)
 */
export function validationError(message: string, details?: Record<string, string>): HttpResponseInit {
  return {
    status: 422,
    jsonBody: {
      error: 'Validation Error',
      message,
      ...(details && { details })
    } as ErrorResponse
  };
}

/**
 * Create a 500 Internal Server Error response
 */
export function internalServerError(message: string = 'An unexpected error occurred. Please try again later.'): HttpResponseInit {
  return {
    status: 500,
    jsonBody: {
      error: 'Internal Server Error',
      message
    } as ErrorResponse
  };
}

/**
 * Handle authentication errors
 */
export function handleAuthError(error: Error): HttpResponseInit {
  const message = error.message.toLowerCase();
  
  if (message.includes('missing') || message.includes('invalid format')) {
    return unauthorized('Authentication token is missing or invalid. Please sign in again.');
  }
  
  if (message.includes('expired')) {
    return unauthorized('Your session has expired. Please sign in again.');
  }
  
  if (message.includes('configuration')) {
    return internalServerError('Authentication service is not properly configured.');
  }
  
  return unauthorized('Authentication failed. Please sign in again.');
}

/**
 * Parse request body with error handling
 */
export async function parseRequestBody<T>(
  request: any,
  requiredFields?: string[]
): Promise<{ success: true; data: T } | { success: false; response: HttpResponseInit }> {
  let body: any;
  
  try {
    body = await request.json();
  } catch (error) {
    return {
      success: false,
      response: badRequest('Invalid JSON in request body. Please check your request format.')
    };
  }
  
  if (!body) {
    return {
      success: false,
      response: badRequest('Request body is required.')
    };
  }
  
  // Check required fields if specified
  if (requiredFields && requiredFields.length > 0) {
    const missingFields: string[] = [];
    for (const field of requiredFields) {
      if (body[field] === undefined || body[field] === null) {
        missingFields.push(field);
      }
    }
    
    if (missingFields.length > 0) {
      return {
        success: false,
        response: validationError(
          `Missing required fields: ${missingFields.join(', ')}`,
          missingFields.reduce((acc, field) => ({ ...acc, [field]: 'This field is required' }), {})
        )
      };
    }
  }
  
  return { success: true, data: body as T };
}
