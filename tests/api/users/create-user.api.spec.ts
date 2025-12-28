import { test, expect } from '@core/fixtures/api.fixture';
import { UserService } from '@services/users/UserService';
import { UserFactory } from '@data/factories/user.factory';
import { UserResponseSchema, CreateUserRequestSchema } from '../../../src/types/api.schemas';
import { validate, validateAPIResponse } from '@core/utils/schema.utils';
import logger from '@core/helpers/logger';

test.describe('Create User API Tests', () => {
  let userService: UserService;

  test.beforeEach(async ({ apiContext, authToken }) => {
    userService = new UserService(apiContext);
    userService.setAuthToken(authToken);
  });

  test('should successfully create a new user @smoke @critical', async () => {
    const newUser = UserFactory.createRequest();

    await test.step('Validate request data', async () => {
      // Validate request before sending
      validate(CreateUserRequestSchema, newUser);
      logger.debug('Request schema validation passed');
    });

    await test.step('Create user', async () => {
      const response = await userService.createUser(newUser);

      await test.step('Verify response status', async () => {
        expect(response.status).toBe(201);
      });

      await test.step('Validate response schema', async () => {
        // Validate response structure
        const validatedData = validateAPIResponse(UserResponseSchema, response);

        expect(validatedData.id).toBeTruthy();
        expect(validatedData.email).toBe(newUser.email);
        expect(validatedData.firstName).toBe(newUser.firstName);
        expect(validatedData.lastName).toBe(newUser.lastName);

        logger.info(`User created: ${validatedData.id}`);
        logger.debug('Response schema validation passed');
      });
    });
  });

  test('should create multiple users', async () => {
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

  test('should fail to create user with duplicate email', async ({ apiContext }) => {
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
