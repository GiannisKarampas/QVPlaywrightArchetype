import { IRetryOptions } from '../../types/test.types';
import logger from './logger';

export class RetryHelper {
  static async retry<T>(fn: () => Promise<T>, options: IRetryOptions): Promise<T> {
    const { maxAttempts, delay, backoff = 'exponential', maxDelay = 30000 } = options;
    let lastError: Error | undefined;

    for (let attempt = 1; attempt <= maxAttempts; attempt++) {
      try {
        logger.debug(`Attempt ${attempt}/${maxAttempts}`);
        return await fn();
      } catch (error) {
        lastError = error as Error;
        logger.warn(`Attempt ${attempt} failed: ${lastError.message}`);

        if (attempt === maxAttempts) {
          logger.error(`All ${maxAttempts} attempts failed`);
          break;
        }

        const waitTime = this.calculateDelay(attempt, delay, backoff, maxDelay);
        logger.debug(`Waiting ${waitTime}ms before retry...`);
        await this.sleep(waitTime);
      }
    }

    throw lastError || new Error('Retry failed with unknown error');
  }

  static async retryWithCondition<T>(
    fn: () => Promise<T>,
    condition: (result: T) => boolean,
    options: IRetryOptions,
  ): Promise<T> {
    const { maxAttempts, delay, backoff = 'exponential', maxDelay = 30000 } = options;
    let lastResult: T | undefined;

    for (let attempt = 1; attempt <= maxAttempts; attempt++) {
      try {
        logger.debug(`Attempt ${attempt}/${maxAttempts}`);
        lastResult = await fn();

        if (condition(lastResult)) {
          logger.debug('Condition met, returning result');
          return lastResult;
        }

        logger.warn(`Attempt ${attempt}: Condition not met`);

        if (attempt < maxAttempts) {
          const waitTime = this.calculateDelay(attempt, delay, backoff, maxDelay);
          logger.debug(`Waiting ${waitTime}ms before retry...`);
          await this.sleep(waitTime);
        }
      } catch (error) {
        logger.error(`Attempt ${attempt} failed: ${(error as Error).message}`);

        if (attempt === maxAttempts) {
          throw error;
        }

        const waitTime = this.calculateDelay(attempt, delay, backoff, maxDelay);
        await this.sleep(waitTime);
      }
    }

    throw new Error('Retry condition not met after all attempts');
  }

  private static calculateDelay(
    attempt: number,
    baseDelay: number,
    backoff: 'linear' | 'exponential',
    maxDelay: number,
  ): number {
    let delay: number;

    if (backoff === 'linear') {
      delay = baseDelay * attempt;
    } else {
      delay = baseDelay * Math.pow(2, attempt - 1);
    }

    return Math.min(delay, maxDelay);
  }

  private static sleep(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }
}

export const retry = RetryHelper.retry.bind(RetryHelper);
export const retryWithCondition = RetryHelper.retryWithCondition.bind(RetryHelper);
