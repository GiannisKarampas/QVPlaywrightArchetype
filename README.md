# QV Playwright Archetype - Enterprise Test Automation Framework

A production-ready, enterprise-grade Playwright + TypeScript automation framework for UI and API testing, featuring 2025 best practices and latest Playwright 1.57.0.

## Features

- **Latest Playwright 1.57.0** with Chrome for Testing
- **TypeScript 5.7.x** with strict mode and path aliases
- **Multi-Project Setup** - Chromium, Firefox, WebKit, Mobile, API
- **Page Object Model** with custom fixtures
- **Allure Reporting** + Playwright HTML Reporter
- **Visual Regression Testing** with screenshot comparison
- **API Testing** with dedicated service layer
- **Docker Support** with multi-stage builds
- **CI/CD Ready** - GitHub Actions, GitLab CI, Jenkins
- **Test Data Management** with Faker.js factories
- **Environment Configuration** with .env files
- **Comprehensive Logging** with Winston
- **Code Quality** - ESLint, Prettier, pre-commit hooks

## Quick Start

### Prerequisites

- Node.js >= 20.0.0
- npm >= 10.0.0

### Installation

```bash
# Clone the repository
git clone <your-repo-url>
cd QVPlaywrightArchetype

# Install dependencies
npm install

# Install Playwright browsers
npm run install:browsers

# Copy environment file
cp .env.example .env.dev
```

### Configuration

Edit `.env.dev` with your application URLs:

```env
BASE_URL=https://your-app.com
API_BASE_URL=https://api.your-app.com
TEST_USER_EMAIL=your-test-user@example.com
TEST_USER_PASSWORD=your-password
```

### Run Tests

```bash
# Run all tests
npm test

# Run UI tests only
npm run test:ui

# Run API tests only
npm run test:api

# Run visual tests
npm run test:visual

# Run tests in headed mode
npm run test:headed

# Run tests in specific browser
npm run test:chrome
npm run test:firefox
npm run test:webkit

# Run tests in debug mode
npm run test:debug
```

### View Reports

```bash
# Open Playwright HTML report
npm run report

# Generate and open Allure report
npm run report:allure
```

## Project Structure

````
QVPlaywrightArchetype/
├── src/
│   ├── config/              # Environment configuration
│   ├── core/
│   │   ├── base/            # Base classes (BasePage, BaseAPI)
│   │   ├── fixtures/        # Custom Playwright fixtures
│   │   ├── helpers/         # Logger, retry, wait helpers
│   │   └── utils/           # File, crypto, faker, visual utils
│   ├── pages/               # Page Object Models
│   ├── services/            # API service layer
│   ├── data/
│   │   ├── factories/       # Test data factories
│   │   ├── fixtures/        # Static test data
│   │   └── testdata/        # Data management
│   └── types/               # TypeScript type definitions
├── tests/
│   ├── ui/                  # UI test specs
│   ├── api/                 # API test specs
│   └── visual/              # Visual regression tests
├── docker/                  # Docker configuration
├── .github/workflows/       # GitHub Actions CI/CD
├── .gitlab/                 # GitLab CI configuration
└── jenkins/                 # Jenkins pipeline

## Architecture

### Layered Architecture

1. **Core Layer** - Reusable utilities, base classes, helpers
2. **Business Layer** - Page Objects, API Services, Test Data
3. **Test Layer** - Spec files using fixtures and POM
4. **Configuration Layer** - Environment management

### Page Object Model Example

```typescript
import { test, expect } from '@core/fixtures/test.fixture';
import { LoginPage } from '@pages/auth/LoginPage';
import { env } from '@config/environment.config';

test('should login successfully', async ({ page }) => {
  const loginPage = new LoginPage(page);
  const testUser = env.getTestUser();

  await loginPage.navigate();
  await loginPage.login(testUser.email, testUser.password);

  await expect(page).toHaveURL(/dashboard/);
});
````

### API Testing Example

```typescript
import { test, expect } from '@core/fixtures/api.fixture';
import { AuthService } from '@services/auth/AuthService';

test('should authenticate user', async ({ apiContext }) => {
  const authService = new AuthService(apiContext);

  const response = await authService.login({
    email: 'test@example.com',
    password: 'password123',
  });

  expect(response.status).toBe(200);
  expect(response.data).toHaveProperty('tokens');
});
```

## Docker Usage

### Build and Run

```bash
# Build Docker image
npm run docker:build

# Run tests in Docker
npm run docker:run

# Stop containers
npm run docker:down
```

### Docker Compose

```bash
# Run all services
docker-compose -f docker/docker-compose.yml up

# Run specific service
docker-compose -f docker/docker-compose.yml up playwright-tests

# View Allure reports in browser
docker-compose -f docker/docker-compose.yml up allure-report-server
# Open http://localhost:5050
```

## CI/CD Integration

### GitHub Actions

Workflow runs automatically on push/PR to main/develop branches.

- Runs tests in parallel across browsers
- Generates Allure reports
- Deploys reports to GitHub Pages

### GitLab CI

Configure variables in GitLab CI/CD settings:

- `TEST_ENV` - dev/staging/prod
- `BASE_URL` - Application URL
- `API_BASE_URL` - API URL

### Jenkins

Pipeline supports parameters:

- Test Environment (dev/staging/prod)
- Browser selection
- Visual test toggle

## Test Data Management

### Using Factories

```typescript
import { UserFactory } from '@data/factories/user.factory';

// Generate random user
const user = UserFactory.create();

// Create with overrides
const admin = UserFactory.createAdmin({ email: 'admin@test.com' });

// Create multiple users
const users = UserFactory.createMultiple(5);
```

### Using Fixtures

```typescript
import { TestDataManager } from '@data/testdata/TestDataManager';

const users = await TestDataManager.loadUsers();
const products = await TestDataManager.loadProducts();
```

## Visual Testing

```typescript
import { VisualUtils } from '@core/utils/visual.utils';

// Compare full page screenshot
await VisualUtils.compareScreenshot(page, 'homepage');

// Compare specific element
await VisualUtils.compareElement(page, '.header', 'header-snapshot');

// Update snapshots
TEST_ENV=dev VISUAL_UPDATE_SNAPSHOTS=true npm run test:visual
```

## Environment Variables

| Variable       | Description                         | Default                 |
| -------------- | ----------------------------------- | ----------------------- |
| `TEST_ENV`     | Test environment (dev/staging/prod) | dev                     |
| `BASE_URL`     | Application base URL                | https://example.com     |
| `API_BASE_URL` | API base URL                        | https://api.example.com |
| `HEADLESS`     | Run in headless mode                | true                    |
| `BROWSER`      | Browser to use                      | chromium                |
| `WORKERS`      | Parallel workers                    | 4                       |
| `RETRIES`      | Test retries on failure             | 2                       |

See `.env.example` for complete list.

## Best Practices

1. **Test Isolation** - Each test runs in a fresh browser context
2. **Retry Mechanism** - Automatic retries for flaky tests
3. **Type Safety** - Strict TypeScript mode
4. **Code Quality** - ESLint + Prettier with pre-commit hooks
5. **Logging** - Comprehensive logging with Winston
6. **Error Handling** - Graceful error handling with screenshots
7. **Authentication** - StorageState reuse for faster tests

## Pre-commit Hooks

This project uses Husky to enforce code quality before commits and pushes.

### Automatic Setup

Pre-commit hooks are automatically installed when you run `npm install` (via the `prepare` script).

### What Gets Checked

**On `git commit` (.husky/pre-commit):**

1. TypeScript type checking (`npm run type-check`)
2. ESLint validation (`npm run lint`)
3. Prettier formatting check (`npm run format:check`)

**On `git push` (.husky/pre-push):**

1. Smoke tests execution (`npm run test:smoke`)

### Manual Hook Execution

```bash
# Test pre-commit hook
.husky/pre-commit

# Test pre-push hook
.husky/pre-push
```

### Bypassing Hooks (Not Recommended)

```bash
# Skip pre-commit hook
git commit --no-verify -m "message"

# Skip pre-push hook
git push --no-verify
```

### Fixing Common Issues

**Type Check Failures:**

```bash
npm run type-check
# Fix TypeScript errors, then commit again
```

**Linting Failures:**

```bash
npm run lint:fix
git add .
git commit -m "message"
```

**Formatting Failures:**

```bash
npm run format
git add .
git commit -m "message"
```

**Smoke Tests Failures:**

```bash
npm run test:smoke
# Fix failing tests, then push again
```

## Customization for Your Project

1. Update `package.json` name and description
2. Configure URLs in `.env.*` files
3. Update Page Objects in `src/pages/` to match your app
4. Update API Services in `src/services/` for your API
5. Modify selectors in Page Objects to match your HTML
6. Customize test data factories for your domain

## Troubleshooting

### Tests Failing Locally

```bash
# Clear cache and reinstall
rm -rf node_modules package-lock.json
npm install
npm run install:browsers
```

### Visual Tests Failing

```bash
# Update snapshots
VISUAL_UPDATE_SNAPSHOTS=true npm run test:visual
```

### Permission Errors

```bash
# Fix permissions
chmod -R 755 node_modules
```

## Contributing

See [CONTRIBUTING.md](CONTRIBUTING.md) for contribution guidelines.

## License

MIT

## Resources

- [Playwright Documentation](https://playwright.dev)
- [Allure Report](https://docs.qameta.io/allure/)
- [TypeScript Handbook](https://www.typescriptlang.org/docs/)

## Support

For issues and questions:

- Create an issue in this repository
- Contact the QA Automation team

---

**Built with Playwright 1.57.0 | 2025 Best Practices**
