import { test, expect } from '@core/fixtures/api.fixture';
import { AuthService } from '@services/auth/AuthService';
import { env } from '@config/environment.config';
import { UserFactory } from '@data/factories/user.factory';

test.describe('Authentication API Tests', () => {
  let authService: AuthService;

  test.beforeEach(async ({ apiContext }) => {
    authService = new AuthService(apiContext);
  });

  test('should successfully login with valid credentials', async ({ logger }) => {
    const testUser = env.getTestUser();

    await test.step('Attempt login', async () => {
      const response = await authService.login({
        email: testUser.email,
        password: testUser.password,
      });

      logger.info('Login API response received');

      await test.step('Verify response structure', async () => {
        expect(response.status).toBe(200);
        expect(response.data).toHaveProperty('tokens');
        expect(response.data).toHaveProperty('user');
        expect(response.data.tokens).toHaveProperty('accessToken');
      });

      await test.step('Verify user data', async () => {
        expect(response.data.user.email).toBe(testUser.email);
      });
    });
  });

  test('should fail login with invalid credentials', async ({ apiContext, logger }) => {
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

  test('should successfully logout', async ({ authToken, logger }) => {
    authService.setAuthToken(authToken);

    await test.step('Logout user', async () => {
      const response = await authService.logout();
      expect(response.status).toBeLessThan(300);
      logger.info('Logout successful');
    });
  });

  test('should request password reset', async ({ logger }) => {
    const email = UserFactory.createRequest().email;

    await test.step('Request password reset', async () => {
      const response = await authService.forgotPassword(email);

      expect(response.status).toBe(200);
      expect(response.data).toHaveProperty('message');
      logger.info('Password reset requested');
    });
  });

  test('should verify valid token', async ({ authToken, logger }) => {
    await test.step('Verify token', async () => {
      const response = await authService.verifyToken(authToken);

      expect(response.status).toBe(200);
      expect(response.data.valid).toBe(true);
      logger.info('Token verified successfully');
    });
  });
});
