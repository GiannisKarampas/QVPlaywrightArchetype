import { defineConfig, devices } from '@playwright/test';
import * as dotenv from 'dotenv';
import * as path from 'path';

const testEnv = process.env.TEST_ENV || 'dev';
const envFile = `.env.${testEnv}`;
dotenv.config({ path: path.resolve(process.cwd(), envFile) });

if (!process.env.BASE_URL) {
  dotenv.config({ path: path.resolve(process.cwd(), '.env.example') });
}

export default defineConfig({
  testDir: './tests',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: parseInt(process.env.RETRIES || '2', 10),
  workers: process.env.CI ? 2 : parseInt(process.env.WORKERS || '4', 10),

  // Global setup - runs once before all tests
  globalSetup: require.resolve('./global-setup'),

  reporter: [
    ['html', { outputFolder: 'playwright-report', open: 'never' }],
    ['list'],
    ['json', { outputFile: 'test-results/results.json' }],
    ['junit', { outputFile: 'test-results/junit.xml' }],
    [
      'allure-playwright',
      {
        outputFolder: 'allure-results',
        suiteTitle: true,
        categories: [
          {
            name: 'UI Tests',
            matchedStatuses: ['failed', 'broken'],
          },
          {
            name: 'API Tests',
            matchedStatuses: ['failed', 'broken'],
          },
        ],
      },
    ],
  ],

  use: {
    baseURL: process.env.BASE_URL || 'https://example.com',
    headless: process.env.HEADLESS === 'true',
    viewport: { width: 1920, height: 1080 },
    actionTimeout: parseInt(process.env.ACTION_TIMEOUT || '10000', 10),
    navigationTimeout: parseInt(process.env.NAVIGATION_TIMEOUT || '30000', 10),
    trace: process.env.TRACE_ON_RETRY === 'true' ? 'on-first-retry' : 'off',
    screenshot: process.env.SCREENSHOT_ON_FAILURE === 'true' ? 'only-on-failure' : 'off',
    video: process.env.VIDEO_ON_FAILURE === 'true' ? 'retain-on-failure' : 'off',
    locale: 'en-US',
    timezoneId: 'America/New_York',
    permissions: [],
    colorScheme: 'light',
    // Use authenticated state by default (created by global-setup)
    storageState: '.auth/user.json',
  },

  timeout: parseInt(process.env.TIMEOUT || '30000', 10),
  expect: {
    timeout: 10000,
    toHaveScreenshot: {
      maxDiffPixels: 100,
      threshold: parseFloat(process.env.VISUAL_THRESHOLD || '0.2'),
    },
  },

  projects: [
    // Setup project - runs authentication before tests
    {
      name: 'setup',
      testMatch: /global\.setup\.ts/,
      teardown: 'cleanup',
    },

    {
      name: 'cleanup',
      testMatch: /global\.teardown\.ts/,
    },

    {
      name: 'chromium',
      use: {
        ...devices['Desktop Chrome'],
        channel: 'chrome',
        storageState: '.auth/user.json',
      },
      testMatch: /.*\.spec\.ts/,
      testIgnore: [/.*\.api\.spec\.ts/, /.*admin.*\.spec\.ts/],
      dependencies: ['setup'],
    },

    {
      name: 'chromium-admin',
      use: {
        ...devices['Desktop Chrome'],
        channel: 'chrome',
        storageState: '.auth/admin.json',
      },
      testMatch: /.*admin.*\.spec\.ts/,
      dependencies: ['setup'],
    },

    {
      name: 'firefox',
      use: {
        ...devices['Desktop Firefox'],
        storageState: '.auth/user.json',
      },
      testMatch: /.*\.spec\.ts/,
      testIgnore: [/.*\.api\.spec\.ts/, /.*admin.*\.spec\.ts/],
      dependencies: ['setup'],
    },

    {
      name: 'webkit',
      use: {
        ...devices['Desktop Safari'],
        storageState: '.auth/user.json',
      },
      testMatch: /.*\.spec\.ts/,
      testIgnore: [/.*\.api\.spec\.ts/, /.*admin.*\.spec\.ts/],
      dependencies: ['setup'],
    },

    {
      name: 'mobile-chrome',
      use: {
        ...devices['Pixel 5'],
      },
      testMatch: /.*visual.*\.spec\.ts/,
    },

    {
      name: 'mobile-safari',
      use: {
        ...devices['iPhone 12'],
      },
      testMatch: /.*visual.*\.spec\.ts/,
    },

    {
      name: 'tablet',
      use: {
        ...devices['iPad Pro'],
      },
      testMatch: /.*visual.*\.spec\.ts/,
    },

    {
      name: 'api',
      use: {
        baseURL: process.env.API_BASE_URL || 'https://api.example.com',
      },
      testMatch: /.*\.api\.spec\.ts/,
    },
  ],

  outputDir: 'test-results/',

  webServer: process.env.START_LOCAL_SERVER === 'true'
    ? {
        command: 'npm run start:test',
        url: process.env.BASE_URL || 'http://localhost:3000',
        reuseExistingServer: !process.env.CI,
        timeout: 120000,
      }
    : undefined,
});
