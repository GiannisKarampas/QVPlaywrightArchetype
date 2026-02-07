import { APIResponse } from '@playwright/test';
import {
  RequestInterceptor,
  ResponseInterceptor,
  ErrorInterceptor,
  IInterceptorManager,
} from '../types/interceptor.types';

/**
 * Manages request, response, and error interceptors for API calls
 *
 * Usage:
 * ```typescript
 * const interceptorManager = new InterceptorManager();
 *
 * // Add request interceptor
 * interceptorManager.request.use(async (url, options) => {
 *   console.log(`Request to ${url}`);
 * });
 *
 * // Add response interceptor
 * interceptorManager.response.use(async (response) => {
 *   console.log(`Response status: ${response.status()}`);
 *   return response;
 * });
 * ```
 */
export class InterceptorManager implements IInterceptorManager {
  private requestInterceptors: Map<number, RequestInterceptor> = new Map();
  private responseInterceptors: Map<number, ResponseInterceptor> = new Map();
  private errorInterceptors: Map<number, ErrorInterceptor> = new Map();
  private nextId = 0;

  public request = {
    /**
     * Register a request interceptor
     * @param interceptor - Function to execute before request
     * @returns Interceptor ID for removal
     */
    use: (interceptor: RequestInterceptor): number => {
      const id = this.nextId++;
      this.requestInterceptors.set(id, interceptor);
      return id;
    },

    /**
     * Remove a request interceptor
     * @param id - Interceptor ID to remove
     */
    eject: (id: number): void => {
      this.requestInterceptors.delete(id);
    },
  };

  public response = {
    /**
     * Register a response interceptor
     * @param interceptor - Function to execute after response
     * @returns Interceptor ID for removal
     */
    use: (interceptor: ResponseInterceptor): number => {
      const id = this.nextId++;
      this.responseInterceptors.set(id, interceptor);
      return id;
    },

    /**
     * Remove a response interceptor
     * @param id - Interceptor ID to remove
     */
    eject: (id: number): void => {
      this.responseInterceptors.delete(id);
    },
  };

  public error = {
    /**
     * Register an error interceptor
     * @param interceptor - Function to execute on error
     * @returns Interceptor ID for removal
     */
    use: (interceptor: ErrorInterceptor): number => {
      const id = this.nextId++;
      this.errorInterceptors.set(id, interceptor);
      return id;
    },

    /**
     * Remove an error interceptor
     * @param id - Interceptor ID to remove
     */
    eject: (id: number): void => {
      this.errorInterceptors.delete(id);
    },
  };

  /**
   * Execute all request interceptors
   */
  async executeRequestInterceptors(
    url: string,
    options: {
      method: string;
      headers?: Record<string, string>;
      data?: unknown;
      params?: Record<string, string>;
    },
  ): Promise<void> {
    for (const interceptor of this.requestInterceptors.values()) {
      await interceptor(url, options);
    }
  }

  /**
   * Execute all response interceptors
   */
  async executeResponseInterceptors(
    response: APIResponse,
    request: { url: string; method: string },
  ): Promise<APIResponse> {
    let currentResponse = response;
    for (const interceptor of this.responseInterceptors.values()) {
      currentResponse = await interceptor(currentResponse, request);
    }
    return currentResponse;
  }

  /**
   * Execute all error interceptors
   */
  async executeErrorInterceptors(
    error: Error,
    request: { url: string; method: string },
  ): Promise<Error | void> {
    let currentError: Error | void = error;
    for (const interceptor of this.errorInterceptors.values()) {
      const result = await interceptor(currentError || error, request);
      if (result !== undefined) {
        currentError = result;
      }
    }
    return currentError;
  }

  /**
   * Clear all interceptors
   */
  clear(): void {
    this.requestInterceptors.clear();
    this.responseInterceptors.clear();
    this.errorInterceptors.clear();
  }
}
