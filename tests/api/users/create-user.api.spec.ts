import { test, expect } from '@core/fixtures/api.fixture';
import { UserService } from '@services/users/UserService';
import { UserFactory } from '@data/factories/user.factory';

test.describe('Create User API Tests', () => {
  let userService: UserService;

  test.beforeEach(async ({ apiContext, authToken }) => {
    userService = new UserService(apiContext);
    userService.setAuthToken(authToken);
  });

  test('should successfully create a new user', async ({ logger }) => {
    const newUser = UserFactory.createRequest();

    await test.step('Create user', async () => {
      const response = await userService.createUser(newUser);

      await test.step('Verify response', async () => {
        expect(response.status).toBe(201);
        expect(response.data).toHaveProperty('id');
        expect(response.data.email).toBe(newUser.email);
        expect(response.data.firstName).toBe(newUser.firstName);
        expect(response.data.lastName).toBe(newUser.lastName);
        logger.info(`User created: ${response.data.id}`);
      });
    });
  });

  test('should create multiple users', async ({ logger }) => {
    const users = [
      UserFactory.createRequest(),
      UserFactory.createRequest(),
      UserFactory.createRequest(),
    ];

    await test.step('Create multiple users', async () => {
      for (const user of users) {
        const response = await userService.createUser(user);
        expect(response.status).toBe(201);
        expect(response.data).toHaveProperty('id');
        logger.info(`User created: ${response.data.email}`);
      }
    });
  });

  test('should fail to create user with duplicate email', async ({ apiContext, logger }) => {
    const userService = new UserService(apiContext);
    const userData = UserFactory.createRequest();

    await test.step('Create first user', async () => {
      await userService.createUser(userData);
    });

    await test.step('Attempt to create duplicate user', async () => {
      try {
        await userService.createUser(userData);
        throw new Error('Expected creation to fail with duplicate email');
      } catch (error) {
        logger.info('Duplicate user creation failed as expected');
        expect((error as Error).message).toContain('API request failed');
      }
    });
  });

  test('should create user with minimal data', async () => {
    const minimalUser = {
      email: UserFactory.createRequest().email,
      password: UserFactory.createRequest().password,
    };

    await test.step('Create user with minimal data', async () => {
      const response = await userService.createUser(minimalUser);

      expect(response.status).toBe(201);
      expect(response.data).toHaveProperty('id');
      expect(response.data.email).toBe(minimalUser.email);
    });
  });

  test('should validate email format', async ({ apiContext }) => {
    const userService = new UserService(apiContext);
    const invalidUser = UserFactory.createRequest({
      email: 'invalid-email-format',
    });

    await test.step('Attempt to create user with invalid email', async () => {
      try {
        await userService.createUser(invalidUser);
        throw new Error('Expected validation error');
      } catch (error) {
        expect((error as Error).message).toContain('API request failed');
      }
    });
  });
});
