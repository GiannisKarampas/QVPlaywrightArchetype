import logger from '@core/helpers/logger';

/**
 * Manages test data cleanup to ensure test isolation
 *
 * Usage:
 * ```typescript
 * const cleanup = new CleanupHelper();
 *
 * test('create user', async () => {
 *   const user = await createUser();
 *   cleanup.addUser(user.id);
 *
 *   // Test logic...
 * });
 *
 * test.afterEach(async () => {
 *   await cleanup.cleanup();
 * });
 * ```
 */
export class CleanupHelper {
  private usersToDelete: string[] = [];
  private productsToDelete: string[] = [];
  private customCleanupFunctions: Array<() => Promise<void>> = [];

  /**
   * Register a user ID for cleanup
   * @param userId - User ID to delete after test
   */
  addUser(userId: string): void {
    this.usersToDelete.push(userId);
    logger.debug(`Registered user for cleanup: ${userId}`);
  }

  /**
   * Register multiple user IDs for cleanup
   * @param userIds - Array of user IDs to delete
   */
  addUsers(userIds: string[]): void {
    this.usersToDelete.push(...userIds);
    logger.debug(`Registered ${userIds.length} users for cleanup`);
  }

  /**
   * Register a product ID for cleanup
   * @param productId - Product ID to delete after test
   */
  addProduct(productId: string): void {
    this.productsToDelete.push(productId);
    logger.debug(`Registered product for cleanup: ${productId}`);
  }

  /**
   * Register multiple product IDs for cleanup
   * @param productIds - Array of product IDs to delete
   */
  addProducts(productIds: string[]): void {
    this.productsToDelete.push(...productIds);
    logger.debug(`Registered ${productIds.length} products for cleanup`);
  }

  /**
   * Register a custom cleanup function
   * @param cleanupFn - Async function to execute during cleanup
   */
  addCustomCleanup(cleanupFn: () => Promise<void>): void {
    this.customCleanupFunctions.push(cleanupFn);
    logger.debug('Registered custom cleanup function');
  }

  /**
   * Execute all registered cleanup operations
   * Should be called in test.afterEach() or similar hook
   */
  async cleanup(): Promise<void> {
    logger.info('Starting test data cleanup');

    try {
      // Execute custom cleanup functions first
      if (this.customCleanupFunctions.length > 0) {
        logger.debug(`Executing ${this.customCleanupFunctions.length} custom cleanup functions`);
        for (const cleanupFn of this.customCleanupFunctions) {
          try {
            await cleanupFn();
          } catch (error) {
            logger.warn('Custom cleanup function failed', { error });
          }
        }
      }

      // Note: Actual deletion would require service instances
      // This is a template - implement actual deletion in test fixtures
      if (this.usersToDelete.length > 0) {
        logger.debug(`Would delete ${this.usersToDelete.length} users`);
        // await userService.deleteUsers(this.usersToDelete);
      }

      if (this.productsToDelete.length > 0) {
        logger.debug(`Would delete ${this.productsToDelete.length} products`);
        // await productService.deleteProducts(this.productsToDelete);
      }

      logger.info('Test data cleanup completed');
    } catch (error) {
      logger.error('Cleanup failed', { error });
      // Don't throw - cleanup failures shouldn't fail tests
    } finally {
      this.reset();
    }
  }

  /**
   * Reset all cleanup registrations without executing them
   * Useful for clearing state between tests
   */
  reset(): void {
    this.usersToDelete = [];
    this.productsToDelete = [];
    this.customCleanupFunctions = [];
    logger.debug('Cleanup helper reset');
  }

  /**
   * Get summary of registered cleanups
   */
  getSummary(): {
    users: number;
    products: number;
    customFunctions: number;
  } {
    return {
      users: this.usersToDelete.length,
      products: this.productsToDelete.length,
      customFunctions: this.customCleanupFunctions.length,
    };
  }
}
