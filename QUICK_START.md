# Quick Start Guide

## 🚀 Get Started in 5 Minutes

### 1. Install Dependencies

```bash
npm install
npx playwright install --with-deps
```

### 2. Configure Environment

```bash
# Copy environment template
cp .env.example .env.dev

# Edit with your URLs and credentials
nano .env.dev
```

**Required settings:**

```env
BASE_URL=https://your-app.com
API_BASE_URL=https://api.your-app.com
TEST_USER_EMAIL=your-test-user@example.com
TEST_USER_PASSWORD=your-password
TEST_ADMIN_EMAIL=your-admin@example.com
TEST_ADMIN_PASSWORD=your-admin-password
```

### 3. Run Tests

```bash
# Run all tests (global-setup runs automatically)
npm test

# Run UI tests only
npm run test:ui

# Run API tests only
npm run test:api

# Run specific browser
npm run test:chrome
```

### 4. View Reports

```bash
# Playwright HTML report
npm run report

# Allure report
npm run report:allure
```

---

## 📝 Writing Your First Test

### Simple Test (Authenticated)

```typescript
// tests/ui/my-feature/my-test.spec.ts
import { test, expect } from '@playwright/test';
import { MyPage } from '@pages/my-feature/MyPage';

test('my feature works', async ({ page }) => {
  // Already authenticated! No login needed
  const myPage = new MyPage(page);

  await myPage.navigate();
  await expect(page).toHaveURL(/my-feature/);
});
```

### Test with Logging (Debugging)

```typescript
import { test, expect } from '@core/fixtures/base.fixture';

test('complex test', async ({ page, logger }) => {
  logger.info('Starting test');

  // Your test logic
  logger.debug('Step 1 complete');
  logger.info('Test complete');
});
```

---

## 🎯 Common Commands

```bash
# Development
npm test                # Run all tests
npm run test:ui         # UI tests only
npm run test:api        # API tests only
npm run test:visual     # Visual regression tests
npm run test:headed     # Run with browser visible
npm run test:debug      # Open Playwright Inspector

# Specific browser
npm run test:chrome     # Chromium only
npm run test:firefox    # Firefox only
npm run test:webkit     # WebKit only

# Reports
npm run report          # Open HTML report
npm run report:allure   # Generate & open Allure

# Code quality
npm run lint            # Run ESLint
npm run format          # Format with Prettier
npm run type-check      # TypeScript check

# Docker
npm run docker:build    # Build Docker image
npm run docker:run      # Run tests in Docker

# Setup
npm run install:browsers # Install Playwright browsers
```

---

## 📁 Project Structure

```
src/
├── pages/              # Page Object Models
│   └── auth/
│       └── LoginPage.ts
├── services/           # API Services
│   └── auth/
│       └── AuthService.ts
├── core/
│   ├── base/          # Base classes
│   ├── fixtures/      # Custom fixtures
│   └── helpers/       # Utilities
└── data/
    └── factories/     # Test data factories

tests/
├── ui/                # UI tests
├── api/               # API tests
└── visual/            # Visual tests
```

---

## 🔐 Authentication

### Regular Tests

```typescript
// Already authenticated by default!
test('test', async ({ page }) => {
  await page.goto('/dashboard');
});
```

### Admin Tests

```typescript
test.use({ storageState: '.auth/admin.json' });

test('admin test', async ({ page }) => {
  await page.goto('/admin');
});
```

### Login Tests (No Auth)

```typescript
test.use({ storageState: undefined });

test('login test', async ({ page }) => {
  await loginPage.login(email, password);
});
```

---

## 🎓 Next Steps

1. **Read the guides:**
   - `FIXTURE_GUIDE.md` - When to use what
   - `GLOBAL_SETUP_MIGRATION.md` - How auth works
   - `CONTRIBUTING.md` - Best practices

2. **Customize for your app:**
   - Update `global-setup.ts` with your login flow
   - Create Page Objects for your pages
   - Create API Services for your endpoints

3. **Run in CI/CD:**
   - GitHub Actions: `.github/workflows/playwright-ci.yml`
   - GitLab CI: `.gitlab/gitlab-ci.yml`
   - Jenkins: `jenkins/Jenkinsfile`

---

## 💡 Tips

- **Use TypeScript autocomplete** - Let the IDE help you!
- **Check logs** in `logs/` directory for debugging
- **Visual tests** - Update snapshots with `VISUAL_UPDATE_SNAPSHOTS=true`
- **Parallel execution** - Adjust `WORKERS` in .env
- **Docker** - Consistent environment across machines

---

## 🐛 Troubleshooting

### Tests failing?

```bash
# Check if auth files exist
ls -la .auth/

# Re-run global setup
npx playwright test --project=setup

# Run in headed mode
npm run test:headed
```

### TypeScript errors?

```bash
npm run type-check
```

### Need help?

- Check `README.md` for detailed info
- See `FIXTURE_GUIDE.md` for usage examples
- Review test examples in `tests/` directory

---

**Happy Testing!** 🎉
