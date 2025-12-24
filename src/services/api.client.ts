import { APIRequestContext } from '@playwright/test';
import { BaseAPI } from '@core/base/BaseAPI';
import logger from '@core/helpers/logger';

export class APIClient extends BaseAPI {
  constructor(apiContext: APIRequestContext) {
    super(apiContext);
    logger.info('API Client initialized');
  }

  setAuthorizationToken(token: string): void {
    this.setAuthToken(token);
  }

  clearAuthorizationToken(): void {
    this.removeAuthToken();
  }

  async healthCheck(): Promise<boolean> {
    try {
      const response = await this.get('/health');
      return response.status === 200;
    } catch (error) {
      logger.error('Health check failed', error);
      return false;
    }
  }
}
