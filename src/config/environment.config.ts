import * as dotenv from 'dotenv';
import * as path from 'path';
import {
  IEnvironmentConfig,
  Environment,
  BrowserType,
  LogLevel,
  ITestUser,
} from '../types/environment.types';

class EnvironmentConfig {
  private static instance: EnvironmentConfig;
  private config: IEnvironmentConfig;

  private constructor() {
    this.loadEnvironment();
    this.config = this.parseEnvironmentVariables();
  }

  public static getInstance(): EnvironmentConfig {
    if (!EnvironmentConfig.instance) {
      EnvironmentConfig.instance = new EnvironmentConfig();
    }
    return EnvironmentConfig.instance;
  }

  private loadEnvironment(): void {
    const testEnv = process.env.TEST_ENV || 'dev';
    const envFile = `.env.${testEnv}`;
    const envPath = path.resolve(process.cwd(), envFile);

    dotenv.config({ path: envPath });

    if (!process.env.BASE_URL) {
      dotenv.config({ path: path.resolve(process.cwd(), '.env.example') });
    }
  }

  private parseEnvironmentVariables(): IEnvironmentConfig {
    return {
      nodeEnv: process.env.NODE_ENV || 'development',
      testEnv: (process.env.TEST_ENV as Environment) || 'dev',
      baseUrl: process.env.BASE_URL || 'https://example.com',
      apiBaseUrl: process.env.API_BASE_URL || 'https://api.example.com',
      headless: process.env.HEADLESS === 'true',
      browser: (process.env.BROWSER as BrowserType) || 'chromium',
      timeout: parseInt(process.env.TIMEOUT || '30000', 10),
      navigationTimeout: parseInt(process.env.NAVIGATION_TIMEOUT || '30000', 10),
      actionTimeout: parseInt(process.env.ACTION_TIMEOUT || '10000', 10),
      workers: parseInt(process.env.WORKERS || '4', 10),
      retries: parseInt(process.env.RETRIES || '2', 10),
      screenshotOnFailure: process.env.SCREENSHOT_ON_FAILURE !== 'false',
      videoOnFailure: process.env.VIDEO_ON_FAILURE === 'true',
      traceOnRetry: process.env.TRACE_ON_RETRY !== 'false',
      logLevel: (process.env.LOG_LEVEL as LogLevel) || 'info',
      logToFile: process.env.LOG_TO_FILE !== 'false',
      apiTimeout: parseInt(process.env.API_TIMEOUT || '15000', 10),
      apiRetryAttempts: parseInt(process.env.API_RETRY_ATTEMPTS || '3', 10),
      apiRetryDelay: parseInt(process.env.API_RETRY_DELAY || '1000', 10),
      visualThreshold: parseFloat(process.env.VISUAL_THRESHOLD || '0.2'),
      visualUpdateSnapshots: process.env.VISUAL_UPDATE_SNAPSHOTS === 'true',
      ci: process.env.CI === 'true',
    };
  }

  public get<K extends keyof IEnvironmentConfig>(key: K): IEnvironmentConfig[K] {
    return this.config[key];
  }

  public getAll(): IEnvironmentConfig {
    return { ...this.config };
  }

  public getTestUser(): ITestUser {
    return {
      email: process.env.TEST_USER_EMAIL || 'test@example.com',
      password: process.env.TEST_USER_PASSWORD || 'Test123!',
      role: 'user',
    };
  }

  public getTestAdmin(): ITestUser {
    return {
      email: process.env.TEST_ADMIN_EMAIL || 'admin@example.com',
      password: process.env.TEST_ADMIN_PASSWORD || 'Admin123!',
      role: 'admin',
    };
  }

  public isCI(): boolean {
    return this.config.ci;
  }

  public isDevelopment(): boolean {
    return this.config.testEnv === 'dev';
  }

  public isStaging(): boolean {
    return this.config.testEnv === 'staging';
  }

  public isProduction(): boolean {
    return this.config.testEnv === 'prod';
  }
}

export const env = EnvironmentConfig.getInstance();
export default env;
