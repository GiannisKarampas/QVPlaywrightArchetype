import { test as base, APIRequestContext, request } from '@playwright/test';
import { env } from '@config/environment.config';
import { createLogger } from '@core/helpers/logger';

const logger = createLogger('APIFixture');

type APIFixtures = {
  apiContext: APIRequestContext;
  authToken: string;
};

export const test = base.extend<APIFixtures>({
  apiContext: async ({}, use) => {
    logger.info('Creating API request context');

    const apiContext = await request.newContext({
      baseURL: env.get('apiBaseUrl'),
      extraHTTPHeaders: {
        'Content-Type': 'application/json',
        Accept: 'application/json',
      },
      timeout: env.get('apiTimeout'),
    });

    await use(apiContext);

    await apiContext.dispose();
    logger.info('API context disposed');
  },

  authToken: async ({ apiContext }, use) => {
    logger.info('Obtaining auth token');

    try {
      const testUser = env.getTestUser();

      const response = await apiContext.post('/auth/login', {
        data: {
          email: testUser.email,
          password: testUser.password,
        },
      });

      if (!response.ok()) {
        throw new Error(`Failed to authenticate: ${response.status()} ${response.statusText()}`);
      }

      const data = await response.json();
      const token = data.tokens?.accessToken || data.token || data.access_token;

      if (!token) {
        throw new Error('No token found in authentication response');
      }

      logger.info('Auth token obtained successfully');
      await use(token);
    } catch (error) {
      logger.error('Failed to obtain auth token', error);
      await use('');
    }
  },
});

export { expect } from '@playwright/test';
