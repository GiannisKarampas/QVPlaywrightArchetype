import { test, expect } from '@core/fixtures/api.fixture';
import { AuthService } from '@services/auth/AuthService';
import { env } from '@config/environment.config';
import { UserFactory } from '@data/factories/user.factory';
import { LoginResponseSchema } from '../../../src/types/api.schemas';
import { validateAPIResponse } from '@core/utils/schema.utils';
import logger from '@core/helpers/logger';

test.describe('Authentication API Tests', () => {
  let authService: AuthService;

  test.beforeEach(async ({ apiContext }) => {
    authService = new AuthService(apiContext);
  });

  test('should successfully login with valid credentials @smoke @critical', async () => {
    const testUser = env.getTestUser();

    await test.step('Attempt login', async () => {
      const response = await authService.login({
        email: testUser.email,
        password: testUser.password,
      });

      logger.info('Login API response received');

      await test.step('Verify response status', async () => {
        expect(response.status).toBe(200);
      });

      await test.step('Validate response schema', async () => {
        // Schema validation - catches breaking API changes!
        const validatedData = validateAPIResponse(LoginResponseSchema, response);

        expect(validatedData).toHaveProperty('tokens');
        expect(validatedData).toHaveProperty('user');
        expect(validatedData.tokens.accessToken).toBeTruthy();

        logger.info('Response schema validation passed');
      });

      await test.step('Verify user data', async () => {
        expect(response.data.user.email).toBe(testUser.email);
      });
    });
  });

  test('should fail login with invalid credentials @regression', async ({ apiContext }) => {
    const authService = new AuthService(apiContext);

    await test.step('Attempt login with invalid credentials', async () => {
      try {
        await authService.login({
          email: 'invalid@example.com',
          password: 'WrongPassword123!',
        });
        throw new Error('Expected login to fail');
      } catch (error) {
        logger.info('Login failed as expected');
        expect((error as Error).message).toContain('API request failed');
      }
    });
  });

  test('should successfully logout', async ({ authToken }) => {
    authService.setAuthToken(authToken);

    await test.step('Logout user', async () => {
      const response = await authService.logout();
      expect(response.status).toBeLessThan(300);
      logger.info('Logout successful');
    });
  });

  test('should request password reset', async () => {
    const email = UserFactory.createRequest().email;

    await test.step('Request password reset', async () => {
      const response = await authService.forgotPassword(email);

      expect(response.status).toBe(200);
      expect(response.data).toHaveProperty('message');
      logger.info('Password reset requested');
    });
  });

  test('should verify valid token', async ({ authToken }) => {
    await test.step('Verify token', async () => {
      const response = await authService.verifyToken(authToken);

      expect(response.status).toBe(200);
      expect(response.data.valid).toBe(true);
      logger.info('Token verified successfully');
    });
  });
});
