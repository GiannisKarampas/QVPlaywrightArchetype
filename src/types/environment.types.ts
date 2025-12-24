export type Environment = 'dev' | 'staging' | 'prod';
export type BrowserType = 'chromium' | 'firefox' | 'webkit';
export type LogLevel = 'error' | 'warn' | 'info' | 'debug';

export interface IEnvironmentConfig {
  nodeEnv: string;
  testEnv: Environment;
  baseUrl: string;
  apiBaseUrl: string;
  headless: boolean;
  browser: BrowserType;
  timeout: number;
  navigationTimeout: number;
  actionTimeout: number;
  workers: number;
  retries: number;
  screenshotOnFailure: boolean;
  videoOnFailure: boolean;
  traceOnRetry: boolean;
  logLevel: LogLevel;
  logToFile: boolean;
  apiTimeout: number;
  apiRetryAttempts: number;
  apiRetryDelay: number;
  visualThreshold: number;
  visualUpdateSnapshots: boolean;
  ci: boolean;
}

export interface ITestUser {
  email: string;
  password: string;
  role?: 'user' | 'admin';
}

export interface IDatabaseConfig {
  host: string;
  port: number;
  name: string;
  user: string;
  password: string;
}

export interface IReportingConfig {
  allureResultsDir: string;
  allureReportDir: string;
}
