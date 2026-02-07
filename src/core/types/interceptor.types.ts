import { APIResponse } from '@playwright/test';

/**
 * Request interceptor function type
 */
export type RequestInterceptor = (
  url: string,
  options: {
    method: string;
    headers?: Record<string, string>;
    data?: unknown;
    params?: Record<string, string>;
  },
) => Promise<void> | void;

/**
 * Response interceptor function type
 */
export type ResponseInterceptor = (
  response: APIResponse,
  request: {
    url: string;
    method: string;
  },
) => Promise<APIResponse> | APIResponse;

/**
 * Error interceptor function type
 */
export type ErrorInterceptor = (
  error: Error,
  request: {
    url: string;
    method: string;
  },
) => Promise<Error | void> | Error | void;

/**
 * Interceptor manager interface
 */
export interface IInterceptorManager {
  request: {
    use: (interceptor: RequestInterceptor) => number;
    eject: (id: number) => void;
  };
  response: {
    use: (interceptor: ResponseInterceptor) => number;
    eject: (id: number) => void;
  };
  error: {
    use: (interceptor: ErrorInterceptor) => number;
    eject: (id: number) => void;
  };
}
