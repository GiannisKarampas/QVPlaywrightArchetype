/**
 * Custom Error Classes for the Framework
 *
 * Provides specific error types for better error handling and debugging
 */

/**
 * Base custom error class
 */
export class BaseError extends Error {
  public readonly timestamp: Date;
  public readonly context?: Record<string, unknown>;

  constructor(message: string, context?: Record<string, unknown>) {
    super(message);
    this.name = this.constructor.name;
    this.timestamp = new Date();
    this.context = context;
    Error.captureStackTrace(this, this.constructor);
  }
}

/**
 * API related errors
 */
export class APIError extends BaseError {
  public readonly statusCode: number;
  public readonly endpoint: string;
  public readonly method: string;
  public readonly responseData?: unknown;

  constructor(
    message: string,
    statusCode: number,
    endpoint: string,
    method: string = 'GET',
    responseData?: unknown,
    context?: Record<string, unknown>,
  ) {
    super(message, context);
    this.statusCode = statusCode;
    this.endpoint = endpoint;
    this.method = method;
    this.responseData = responseData;
  }
}

/**
 * Validation errors
 */
export class ValidationError extends BaseError {
  public readonly field?: string;
  public readonly validationErrors?: Array<{ path: string; message: string }>;

  constructor(
    message: string,
    field?: string,
    validationErrors?: Array<{ path: string; message: string }>,
    context?: Record<string, unknown>,
  ) {
    super(message, context);
    this.field = field;
    this.validationErrors = validationErrors;
  }
}

/**
 * Authentication/Authorization errors
 */
export class AuthenticationError extends BaseError {
  public readonly reason: 'invalid_credentials' | 'token_expired' | 'unauthorized' | 'forbidden';

  constructor(
    message: string,
    reason: 'invalid_credentials' | 'token_expired' | 'unauthorized' | 'forbidden' = 'unauthorized',
    context?: Record<string, unknown>,
  ) {
    super(message, context);
    this.reason = reason;
  }
}

/**
 * Timeout errors
 */
export class TimeoutError extends BaseError {
  public readonly timeoutMs: number;
  public readonly operation: string;

  constructor(
    message: string,
    timeoutMs: number,
    operation: string,
    context?: Record<string, unknown>,
  ) {
    super(message, context);
    this.timeoutMs = timeoutMs;
    this.operation = operation;
  }
}

/**
 * Element not found errors
 */
export class ElementNotFoundError extends BaseError {
  public readonly selector: string;

  constructor(message: string, selector: string, context?: Record<string, unknown>) {
    super(message, context);
    this.selector = selector;
  }
}

/**
 * Test data errors
 */
export class TestDataError extends BaseError {
  public readonly dataType: string;

  constructor(message: string, dataType: string, context?: Record<string, unknown>) {
    super(message, context);
    this.dataType = dataType;
  }
}

/**
 * Configuration errors
 */
export class ConfigurationError extends BaseError {
  public readonly configKey?: string;

  constructor(message: string, configKey?: string, context?: Record<string, unknown>) {
    super(message, context);
    this.configKey = configKey;
  }
}

/**
 * File operation errors
 */
export class FileOperationError extends BaseError {
  public readonly filePath: string;
  public readonly operation: 'read' | 'write' | 'delete' | 'exists';

  constructor(
    message: string,
    filePath: string,
    operation: 'read' | 'write' | 'delete' | 'exists',
    context?: Record<string, unknown>,
  ) {
    super(message, context);
    this.filePath = filePath;
    this.operation = operation;
  }
}

/**
 * Network errors
 */
export class NetworkError extends BaseError {
  public readonly url: string;
  public readonly cause?: string;

  constructor(message: string, url: string, cause?: string, context?: Record<string, unknown>) {
    super(message, context);
    this.url = url;
    this.cause = cause;
  }
}

/**
 * Accessibility errors
 */
export class AccessibilityError extends BaseError {
  public readonly violationCount: number;
  public readonly wcagLevel: string;
  public readonly violations: Array<{
    id: string;
    impact: string;
    description: string;
    nodes: number;
  }>;

  constructor(
    message: string,
    violationCount: number,
    wcagLevel: string,
    violations: Array<{ id: string; impact: string; description: string; nodes: number }>,
    context?: Record<string, unknown>,
  ) {
    super(message, context);
    this.violationCount = violationCount;
    this.wcagLevel = wcagLevel;
    this.violations = violations;
  }
}
