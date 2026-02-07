import { Page, Route } from '@playwright/test';
import logger from '@core/helpers/logger';

/**
 * Mock response configuration
 */
export interface IMockResponse {
  status?: number;
  statusText?: string;
  headers?: Record<string, string>;
  body?: unknown;
  delay?: number;
}

/**
 * Mock configuration
 */
interface IMockConfig {
  url: string | RegExp;
  method?: string;
  response: IMockResponse;
  times?: number;
}

/**
 * API Mocking Framework
 *
 * Provides utilities for mocking API responses in tests
 *
 * Usage:
 * ```typescript
 * const apiMock = new ApiMock(page);
 *
 * // Mock successful response
 * await apiMock.mockEndpoint('/api/users', {
 *   status: 200,
 *   body: { users: [] }
 * });
 *
 * // Mock error
 * await apiMock.mockError('/api/users/123', 404);
 *
 * // Mock with delay
 * await apiMock.mockEndpoint('/api/slow', {
 *   status: 200,
 *   body: { data: 'slow response' },
 *   delay: 3000
 * });
 * ```
 */
export class ApiMock {
  private page: Page;
  private mocks: Map<string, IMockConfig> = new Map();
  private callCounts: Map<string, number> = new Map();

  constructor(page: Page) {
    this.page = page;
  }

  /**
   * Mock an API endpoint with custom response
   * @param url - URL or regex pattern to match
   * @param response - Mock response configuration
   * @param method - HTTP method (GET, POST, etc.)
   * @param times - Number of times to apply mock (undefined = infinite)
   */
  async mockEndpoint(
    url: string | RegExp,
    response: IMockResponse,
    method: string = 'GET',
    times?: number,
  ): Promise<void> {
    const mockId = this.getMockId(url, method);
    const mockConfig: IMockConfig = { url, method, response, times };

    this.mocks.set(mockId, mockConfig);
    this.callCounts.set(mockId, 0);

    await this.page.route(url, async (route: Route) => {
      if (method && route.request().method() !== method.toUpperCase()) {
        await route.continue();
        return;
      }

      const currentCount = this.callCounts.get(mockId) || 0;

      // Check if we've exceeded the times limit
      if (times !== undefined && currentCount >= times) {
        await route.continue();
        return;
      }

      this.callCounts.set(mockId, currentCount + 1);

      const { status = 200, headers = {}, body, delay } = response;

      logger.debug(`Mocking ${method} ${url} - Status: ${status}`, { callCount: currentCount + 1 });

      // Add delay if specified
      if (delay) {
        await new Promise((resolve) => setTimeout(resolve, delay));
      }

      await route.fulfill({
        status,
        headers: {
          'Content-Type': 'application/json',
          ...headers,
        },
        body: body ? JSON.stringify(body) : undefined,
      });
    });

    logger.info(`Mock registered: ${method} ${url}`);
  }

  /**
   * Mock an error response
   * @param url - URL or regex pattern to match
   * @param statusCode - HTTP error status code
   * @param errorMessage - Error message
   * @param method - HTTP method
   */
  async mockError(
    url: string | RegExp,
    statusCode: number = 500,
    errorMessage: string = 'Internal Server Error',
    method: string = 'GET',
  ): Promise<void> {
    await this.mockEndpoint(
      url,
      {
        status: statusCode,
        statusText: errorMessage,
        body: {
          error: errorMessage,
          status: statusCode,
        },
      },
      method,
    );
  }

  /**
   * Mock network failure (request abortion)
   * @param url - URL or regex pattern to match
   */
  async mockNetworkFailure(url: string | RegExp): Promise<void> {
    await this.page.route(url, async (route: Route) => {
      logger.debug(`Aborting network request: ${url}`);
      await route.abort('failed');
    });

    logger.info(`Network failure mock registered: ${url}`);
  }

  /**
   * Mock slow network (add delay to response)
   * @param url - URL or regex pattern to match
   * @param delayMs - Delay in milliseconds
   */
  async mockSlowNetwork(url: string | RegExp, delayMs: number = 5000): Promise<void> {
    await this.page.route(url, async (route: Route) => {
      logger.debug(`Adding ${delayMs}ms delay to ${url}`);
      await new Promise((resolve) => setTimeout(resolve, delayMs));
      await route.continue();
    });

    logger.info(`Slow network mock registered: ${url} (${delayMs}ms delay)`);
  }

  /**
   * Clear a specific mock
   * @param url - URL or regex pattern
   * @param method - HTTP method
   */
  async clearMock(url: string | RegExp, method: string = 'GET'): Promise<void> {
    const mockId = this.getMockId(url, method);
    this.mocks.delete(mockId);
    this.callCounts.delete(mockId);
    await this.page.unroute(url);
    logger.info(`Mock cleared: ${method} ${url}`);
  }

  /**
   * Clear all mocks
   */
  async clearAllMocks(): Promise<void> {
    for (const [_, config] of this.mocks) {
      await this.page.unroute(config.url);
    }
    this.mocks.clear();
    this.callCounts.clear();
    logger.info('All mocks cleared');
  }

  /**
   * Get number of times a mock was called
   * @param url - URL or regex pattern
   * @param method - HTTP method
   */
  getCallCount(url: string | RegExp, method: string = 'GET'): number {
    const mockId = this.getMockId(url, method);
    return this.callCounts.get(mockId) || 0;
  }

  /**
   * Verify a mock was called specific number of times
   * @param url - URL or regex pattern
   * @param expectedCalls - Expected number of calls
   * @param method - HTTP method
   */
  verifyCallCount(url: string | RegExp, expectedCalls: number, method: string = 'GET'): void {
    const actualCalls = this.getCallCount(url, method);
    if (actualCalls !== expectedCalls) {
      throw new Error(
        `Mock verification failed for ${method} ${url}: expected ${expectedCalls} calls, got ${actualCalls}`,
      );
    }
    logger.debug(`Mock verification passed: ${method} ${url} called ${actualCalls} times`);
  }

  /**
   * Generate unique mock ID
   */
  private getMockId(url: string | RegExp, method: string): string {
    const urlStr = url instanceof RegExp ? url.source : url;
    return `${method}:${urlStr}`;
  }

  /**
   * Get mock statistics
   */
  getStatistics(): Record<string, number> {
    const stats: Record<string, number> = {};
    for (const [mockId, count] of this.callCounts) {
      stats[mockId] = count;
    }
    return stats;
  }
}
