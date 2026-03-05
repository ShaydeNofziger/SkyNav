import { describe, it, expect } from 'vitest';
import {
  badRequest,
  unauthorized,
  forbidden,
  notFound,
  validationError,
  internalServerError,
  handleAuthError,
  parseRequestBody,
} from '../utils/errorResponse';

describe('badRequest', () => {
  it('returns 400 status with error body', () => {
    const response = badRequest('Invalid input');
    expect(response.status).toBe(400);
    expect((response.jsonBody as any).error).toBe('Bad Request');
    expect((response.jsonBody as any).message).toBe('Invalid input');
  });

  it('includes details when provided', () => {
    const response = badRequest('Validation failed', { field: 'Name is required' });
    expect((response.jsonBody as any).details).toEqual({ field: 'Name is required' });
  });

  it('omits details when not provided', () => {
    const response = badRequest('Simple error');
    expect((response.jsonBody as any).details).toBeUndefined();
  });
});

describe('unauthorized', () => {
  it('returns 401 status', () => {
    const response = unauthorized();
    expect(response.status).toBe(401);
    expect((response.jsonBody as any).error).toBe('Unauthorized');
  });

  it('uses default message', () => {
    const response = unauthorized();
    expect((response.jsonBody as any).message).toContain('Authentication required');
  });

  it('uses custom message', () => {
    const response = unauthorized('Token expired');
    expect((response.jsonBody as any).message).toBe('Token expired');
  });
});

describe('forbidden', () => {
  it('returns 403 status', () => {
    const response = forbidden();
    expect(response.status).toBe(403);
    expect((response.jsonBody as any).error).toBe('Forbidden');
  });

  it('uses default message', () => {
    const response = forbidden();
    expect((response.jsonBody as any).message).toContain('permission');
  });

  it('uses custom message', () => {
    const response = forbidden('Admin only');
    expect((response.jsonBody as any).message).toBe('Admin only');
  });
});

describe('notFound', () => {
  it('returns 404 status', () => {
    const response = notFound();
    expect(response.status).toBe(404);
    expect((response.jsonBody as any).error).toBe('Not Found');
  });

  it('uses default message', () => {
    const response = notFound();
    expect((response.jsonBody as any).message).toContain('not found');
  });

  it('uses custom message', () => {
    const response = notFound('Trip not found');
    expect((response.jsonBody as any).message).toBe('Trip not found');
  });
});

describe('validationError', () => {
  it('returns 422 status', () => {
    const response = validationError('Invalid data');
    expect(response.status).toBe(422);
    expect((response.jsonBody as any).error).toBe('Validation Error');
  });

  it('includes details when provided', () => {
    const details = { name: 'Required', date: 'Invalid format' };
    const response = validationError('Fix errors', details);
    expect((response.jsonBody as any).details).toEqual(details);
  });
});

describe('internalServerError', () => {
  it('returns 500 status', () => {
    const response = internalServerError();
    expect(response.status).toBe(500);
    expect((response.jsonBody as any).error).toBe('Internal Server Error');
  });

  it('uses default message', () => {
    const response = internalServerError();
    expect((response.jsonBody as any).message).toContain('unexpected error');
  });

  it('uses custom message', () => {
    const response = internalServerError('Database connection failed');
    expect((response.jsonBody as any).message).toBe('Database connection failed');
  });
});

describe('handleAuthError', () => {
  it('returns 401 for missing token errors', () => {
    const response = handleAuthError(new Error('Authorization header is missing'));
    expect(response.status).toBe(401);
  });

  it('returns 401 for invalid format errors', () => {
    const response = handleAuthError(new Error('invalid format token'));
    expect(response.status).toBe(401);
  });

  it('returns 401 with expiry message for expired tokens', () => {
    const response = handleAuthError(new Error('Token has expired'));
    expect(response.status).toBe(401);
    expect((response.jsonBody as any).message).toContain('expired');
  });

  it('returns 500 for configuration errors', () => {
    // Note: message must not also contain 'missing'/'invalid format' since those are checked first
    const response = handleAuthError(new Error('Authentication configuration error'));
    expect(response.status).toBe(500);
  });

  it('returns 401 for generic auth failures', () => {
    const response = handleAuthError(new Error('Some unknown auth error'));
    expect(response.status).toBe(401);
  });
});

describe('parseRequestBody', () => {
  it('returns parsed body on success', async () => {
    const mockRequest = {
      json: async () => ({ name: 'Test Trip', startDate: '2026-06-01' }),
    };

    const result = await parseRequestBody(mockRequest);
    expect(result.success).toBe(true);
    if (result.success) {
      expect((result.data as any).name).toBe('Test Trip');
    }
  });

  it('returns error response when JSON parsing fails', async () => {
    const mockRequest = {
      json: async () => { throw new SyntaxError('Unexpected token'); },
    };

    const result = await parseRequestBody(mockRequest);
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.response.status).toBe(400);
      expect((result.response.jsonBody as any).message).toContain('Invalid JSON');
    }
  });

  it('returns error when body is null', async () => {
    const mockRequest = {
      json: async () => null,
    };

    const result = await parseRequestBody(mockRequest);
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.response.status).toBe(400);
      expect((result.response.jsonBody as any).message).toContain('required');
    }
  });

  it('returns error when required fields are missing', async () => {
    const mockRequest = {
      json: async () => ({ name: 'Test Trip' }),
    };

    const result = await parseRequestBody(mockRequest, ['name', 'startDate', 'endDate']);
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.response.status).toBe(422);
      const body = result.response.jsonBody as any;
      expect(body.message).toContain('startDate');
      expect(body.message).toContain('endDate');
      expect(body.details?.startDate).toBeDefined();
      expect(body.details?.endDate).toBeDefined();
    }
  });

  it('succeeds when all required fields are present', async () => {
    const mockRequest = {
      json: async () => ({ name: 'Test', startDate: '2026-01-01', endDate: '2026-01-07' }),
    };

    const result = await parseRequestBody(mockRequest, ['name', 'startDate', 'endDate']);
    expect(result.success).toBe(true);
  });
});
