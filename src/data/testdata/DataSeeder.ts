import { APIRequestContext } from '@playwright/test';
import { UserFactory } from '@data/factories/user.factory';
import { ProductFactory } from '@data/factories/product.factory';
import { UserService } from '@services/users/UserService';
import logger from '@core/helpers/logger';

export class DataSeeder {
  private userService: UserService;

  constructor(apiContext: APIRequestContext) {
    this.userService = new UserService(apiContext);
  }

  async seedUsers(count: number = 5): Promise<void> {
    logger.info(`Seeding ${count} users`);

    for (let i = 0; i < count; i++) {
      const userData = UserFactory.createRequest();

      try {
        await this.userService.createUser(userData);
        logger.debug(`User created: ${userData.email}`);
      } catch (error) {
        logger.error(`Failed to create user: ${userData.email}`, error);
      }
    }

    logger.info(`User seeding completed`);
  }

  async seedAdmins(count: number = 2): Promise<void> {
    logger.info(`Seeding ${count} admin users`);

    for (let i = 0; i < count; i++) {
      const userData = UserFactory.createRequest({ role: 'admin' });

      try {
        await this.userService.createUser(userData);
        logger.debug(`Admin created: ${userData.email}`);
      } catch (error) {
        logger.error(`Failed to create admin: ${userData.email}`, error);
      }
    }

    logger.info(`Admin seeding completed`);
  }

  async cleanupUsers(): Promise<void> {
    logger.info('Cleaning up test users');
    logger.warn('Cleanup implementation depends on your API cleanup strategy');
  }

  generateTestProducts(count: number = 10): unknown[] {
    logger.info(`Generating ${count} test products`);
    return ProductFactory.createMultiple(count);
  }
}
