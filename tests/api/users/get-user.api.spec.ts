import { test, expect } from '@core/fixtures/api.fixture';
import { UserService } from '@services/users/UserService';
import { UserFactory } from '@data/factories/user.factory';

test.describe('Get User API Tests', () => {
  let userService: UserService;

  test.beforeEach(async ({ apiContext, authToken }) => {
    userService = new UserService(apiContext);
    userService.setAuthToken(authToken);
  });

  test('should get current user', async ({ logger }) => {
    await test.step('Get current user', async () => {
      const response = await userService.getCurrentUser();

      expect(response.status).toBe(200);
      expect(response.data).toHaveProperty('id');
      expect(response.data).toHaveProperty('email');
      logger.info(`Current user: ${response.data.email}`);
    });
  });

  test('should get user by ID', async ({ logger }) => {
    let userId: string;

    await test.step('Create test user', async () => {
      const newUser = UserFactory.createRequest();
      const createResponse = await userService.createUser(newUser);
      userId = createResponse.data.id;
    });

    await test.step('Get user by ID', async () => {
      const response = await userService.getUser(userId);

      expect(response.status).toBe(200);
      expect(response.data.id).toBe(userId);
      logger.info(`Retrieved user: ${response.data.email}`);
    });
  });

  test('should get list of users', async ({ logger }) => {
    await test.step('Get users list', async () => {
      const response = await userService.getUsers({ page: 1, pageSize: 10 });

      expect(response.status).toBe(200);
      expect(response.data).toHaveProperty('data');
      expect(response.data).toHaveProperty('total');
      expect(response.data).toHaveProperty('page');
      expect(Array.isArray(response.data.data)).toBeTruthy();
      logger.info(`Retrieved ${response.data.data.length} users`);
    });
  });

  test('should get users with pagination', async ({ logger }) => {
    await test.step('Get first page', async () => {
      const page1 = await userService.getUsers({ page: 1, pageSize: 5 });
      expect(page1.data.page).toBe(1);
      expect(page1.data.data.length).toBeLessThanOrEqual(5);
      logger.info(`Page 1: ${page1.data.data.length} users`);
    });

    await test.step('Get second page', async () => {
      const page2 = await userService.getUsers({ page: 2, pageSize: 5 });
      expect(page2.data.page).toBe(2);
      logger.info(`Page 2: ${page2.data.data.length} users`);
    });
  });

  test('should search users', async ({ logger }) => {
    const searchQuery = 'test';

    await test.step('Search users', async () => {
      const response = await userService.searchUsers(searchQuery);

      expect(response.status).toBe(200);
      expect(Array.isArray(response.data)).toBeTruthy();
      logger.info(`Found ${response.data.length} users matching "${searchQuery}"`);
    });
  });

  test('should return 404 for non-existent user', async ({ apiContext }) => {
    const userService = new UserService(apiContext);
    const fakeUserId = 'non-existent-id-12345';

    await test.step('Attempt to get non-existent user', async () => {
      try {
        await userService.getUser(fakeUserId);
        throw new Error('Expected 404 error');
      } catch (error) {
        expect((error as Error).message).toContain('API request failed');
      }
    });
  });
});
