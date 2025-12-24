import { FileUtils } from '@core/utils/file.utils';
import logger from '@core/helpers/logger';
import * as path from 'path';

export class TestDataManager {
  private static dataCache: Map<string, unknown> = new Map();

  static async loadFixture<T>(fixtureName: string): Promise<T> {
    logger.debug(`Loading fixture: ${fixtureName}`);

    if (this.dataCache.has(fixtureName)) {
      logger.debug(`Fixture found in cache: ${fixtureName}`);
      return this.dataCache.get(fixtureName) as T;
    }

    const fixturePath = path.join(
      process.cwd(),
      'src',
      'data',
      'fixtures',
      `${fixtureName}.json`,
    );

    const data = await FileUtils.readJSON<T>(fixturePath);
    this.dataCache.set(fixtureName, data);

    logger.info(`Fixture loaded: ${fixtureName}`);
    return data;
  }

  static async loadUsers(): Promise<unknown[]> {
    return await this.loadFixture('users');
  }

  static async loadProducts(): Promise<unknown[]> {
    return await this.loadFixture('products');
  }

  static clearCache(): void {
    logger.debug('Clearing test data cache');
    this.dataCache.clear();
  }

  static async saveFixture(fixtureName: string, data: unknown): Promise<void> {
    logger.debug(`Saving fixture: ${fixtureName}`);

    const fixturePath = path.join(
      process.cwd(),
      'src',
      'data',
      'fixtures',
      `${fixtureName}.json`,
    );

    await FileUtils.writeJSON(fixturePath, data);
    this.dataCache.set(fixtureName, data);

    logger.info(`Fixture saved: ${fixtureName}`);
  }
}
