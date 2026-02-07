import { Page } from '@playwright/test';
import logger from '@core/helpers/logger';

/**
 * Performance metrics interface
 */
export interface IPerformanceMetrics {
  responseTime: number;
  startTime: number;
  endTime: number;
  operation: string;
  success: boolean;
  metadata?: Record<string, unknown>;
}

/**
 * Page performance metrics
 */
export interface IPagePerformanceMetrics {
  domContentLoaded: number;
  loadComplete: number;
  firstContentfulPaint?: number;
  largestContentfulPaint?: number;
  timeToInteractive?: number;
}

/**
 * Performance testing utilities
 *
 * Provides tools for measuring and asserting performance metrics
 */
export class PerformanceUtils {
  private static metrics: IPerformanceMetrics[] = [];

  /**
   * Measure execution time of an async operation
   * @param operation - Name/description of the operation
   * @param fn - Async function to measure
   * @returns Result of the function and performance metrics
   */
  static async measureOperation<T>(
    operation: string,
    fn: () => Promise<T>,
  ): Promise<{ result: T; metrics: IPerformanceMetrics }> {
    const startTime = Date.now();
    let success = false;
    let result: T;

    try {
      result = await fn();
      success = true;
      return { result, metrics: this.createMetrics(operation, startTime, success) };
    } catch (error) {
      const metrics = this.createMetrics(operation, startTime, success);
      logger.error(`Performance measurement failed for ${operation}`, { metrics, error });
      throw error;
    }
  }

  /**
   * Measure API response time
   * @param operation - API operation name
   * @param fn - API call function
   * @returns API response and timing metrics
   */
  static async measureAPICall<T>(
    operation: string,
    fn: () => Promise<T>,
  ): Promise<{ response: T; responseTime: number }> {
    const { result, metrics } = await this.measureOperation(operation, fn);

    logger.info(`API ${operation} - Response time: ${metrics.responseTime}ms`);

    return {
      response: result,
      responseTime: metrics.responseTime,
    };
  }

  /**
   * Measure page load performance
   * @param page - Playwright page object
   * @returns Page performance metrics
   */
  static async measurePageLoad(page: Page): Promise<IPagePerformanceMetrics> {
    const performanceTiming = await page.evaluate(() => {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const navigation = (performance as any).getEntriesByType('navigation')[0];

      return {
        domContentLoaded: navigation
          ? navigation.domContentLoadedEventEnd - navigation.startTime
          : 0,
        loadComplete: navigation ? navigation.loadEventEnd - navigation.startTime : 0,
        firstContentfulPaint: 0, // Would need Performance Observer API
      };
    });

    logger.info('Page performance metrics', performanceTiming);
    return performanceTiming;
  }

  /**
   * Assert response time is within threshold
   * @param actualTime - Actual response time in ms
   * @param maxTime - Maximum acceptable time in ms
   * @param operation - Operation name for error message
   */
  static assertResponseTime(actualTime: number, maxTime: number, operation: string): void {
    if (actualTime > maxTime) {
      const message = `Performance threshold exceeded for ${operation}: ${actualTime}ms > ${maxTime}ms`;
      logger.error(message);
      throw new Error(message);
    }
    logger.debug(`Performance OK for ${operation}: ${actualTime}ms <= ${maxTime}ms`);
  }

  /**
   * Create performance metrics object
   */
  private static createMetrics(
    operation: string,
    startTime: number,
    success: boolean,
  ): IPerformanceMetrics {
    const endTime = Date.now();
    const metrics: IPerformanceMetrics = {
      operation,
      startTime,
      endTime,
      responseTime: endTime - startTime,
      success,
    };

    this.metrics.push(metrics);
    return metrics;
  }

  /**
   * Get all recorded metrics
   */
  static getMetrics(): IPerformanceMetrics[] {
    return [...this.metrics];
  }

  /**
   * Get metrics for a specific operation
   */
  static getMetricsFor(operation: string): IPerformanceMetrics[] {
    return this.metrics.filter((m) => m.operation === operation);
  }

  /**
   * Calculate average response time for an operation
   */
  static getAverageResponseTime(operation: string): number {
    const operationMetrics = this.getMetricsFor(operation);
    if (operationMetrics.length === 0) return 0;

    const total = operationMetrics.reduce((sum, m) => sum + m.responseTime, 0);
    return total / operationMetrics.length;
  }

  /**
   * Get performance statistics
   */
  static getStatistics(operation?: string): {
    count: number;
    average: number;
    min: number;
    max: number;
    successRate: number;
  } {
    const relevantMetrics = operation ? this.getMetricsFor(operation) : this.metrics;

    if (relevantMetrics.length === 0) {
      return { count: 0, average: 0, min: 0, max: 0, successRate: 0 };
    }

    const responseTimes = relevantMetrics.map((m) => m.responseTime);
    const successCount = relevantMetrics.filter((m) => m.success).length;

    return {
      count: relevantMetrics.length,
      average: responseTimes.reduce((sum, time) => sum + time, 0) / responseTimes.length,
      min: Math.min(...responseTimes),
      max: Math.max(...responseTimes),
      successRate: (successCount / relevantMetrics.length) * 100,
    };
  }

  /**
   * Clear all recorded metrics
   */
  static clearMetrics(): void {
    this.metrics = [];
    logger.debug('Performance metrics cleared');
  }

  /**
   * Generate performance report
   */
  static generateReport(): string {
    const stats = this.getStatistics();
    const operations = [...new Set(this.metrics.map((m) => m.operation))];

    let report = `\n=== Performance Report ===\n`;
    report += `Total Operations: ${stats.count}\n`;
    report += `Success Rate: ${stats.successRate.toFixed(2)}%\n`;
    report += `Average Response Time: ${stats.average.toFixed(2)}ms\n`;
    report += `Min: ${stats.min}ms | Max: ${stats.max}ms\n\n`;

    report += `By Operation:\n`;
    operations.forEach((op) => {
      const opStats = this.getStatistics(op);
      report += `  ${op}:\n`;
      report += `    Count: ${opStats.count}, Avg: ${opStats.average.toFixed(2)}ms, `;
      report += `Min: ${opStats.min}ms, Max: ${opStats.max}ms\n`;
    });

    return report;
  }
}
