import { IMockResponse } from './ApiMock';

/**
 * Predefined mock responses for common scenarios
 *
 * Usage:
 * ```typescript
 * await apiMock.mockEndpoint('/api/users', MockPresets.emptyList);
 * await apiMock.mockEndpoint('/api/auth/login', MockPresets.unauthorized);
 * ```
 */
export class MockPresets {
  /**
   * Empty list response
   */
  static readonly emptyList: IMockResponse = {
    status: 200,
    body: {
      data: [],
      total: 0,
      page: 1,
      pageSize: 10,
    },
  };

  /**
   * Successful creation response
   */
  static readonly created: IMockResponse = {
    status: 201,
    statusText: 'Created',
    body: {
      id: 'mock-id',
      createdAt: new Date().toISOString(),
    },
  };

  /**
   * No content response (successful deletion)
   */
  static readonly noContent: IMockResponse = {
    status: 204,
    statusText: 'No Content',
  };

  /**
   * Bad request error
   */
  static readonly badRequest: IMockResponse = {
    status: 400,
    statusText: 'Bad Request',
    body: {
      error: 'Bad Request',
      message: 'Invalid request parameters',
    },
  };

  /**
   * Unauthorized error
   */
  static readonly unauthorized: IMockResponse = {
    status: 401,
    statusText: 'Unauthorized',
    body: {
      error: 'Unauthorized',
      message: 'Authentication required',
    },
  };

  /**
   * Forbidden error
   */
  static readonly forbidden: IMockResponse = {
    status: 403,
    statusText: 'Forbidden',
    body: {
      error: 'Forbidden',
      message: 'You do not have permission to access this resource',
    },
  };

  /**
   * Not found error
   */
  static readonly notFound: IMockResponse = {
    status: 404,
    statusText: 'Not Found',
    body: {
      error: 'Not Found',
      message: 'The requested resource was not found',
    },
  };

  /**
   * Validation error
   */
  static readonly validationError: IMockResponse = {
    status: 422,
    statusText: 'Unprocessable Entity',
    body: {
      error: 'Validation Error',
      message: 'Request validation failed',
      errors: [
        {
          field: 'email',
          message: 'Invalid email format',
        },
      ],
    },
  };

  /**
   * Internal server error
   */
  static readonly serverError: IMockResponse = {
    status: 500,
    statusText: 'Internal Server Error',
    body: {
      error: 'Internal Server Error',
      message: 'An unexpected error occurred',
    },
  };

  /**
   * Service unavailable error
   */
  static readonly serviceUnavailable: IMockResponse = {
    status: 503,
    statusText: 'Service Unavailable',
    body: {
      error: 'Service Unavailable',
      message: 'Service is temporarily unavailable',
    },
  };

  /**
   * Slow response (3 second delay)
   */
  static readonly slowResponse: IMockResponse = {
    status: 200,
    body: { message: 'Slow response' },
    delay: 3000,
  };

  /**
   * Create paginated response
   */
  static paginatedList(items: unknown[], page: number = 1, pageSize: number = 10): IMockResponse {
    return {
      status: 200,
      body: {
        data: items,
        total: items.length,
        page,
        pageSize,
        totalPages: Math.ceil(items.length / pageSize),
      },
    };
  }

  /**
   * Create custom error response
   */
  static customError(status: number, message: string, details?: unknown): IMockResponse {
    return {
      status,
      statusText: message,
      body: {
        error: message,
        message,
        details,
      },
    };
  }
}
