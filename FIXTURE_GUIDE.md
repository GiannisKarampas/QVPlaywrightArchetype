# Fixture Usage Guide - When to Use What

## 🎯 Quick Decision Tree

```
Do you need logging or test metadata?
├─ YES → Use base.fixture (test with logger)
└─ NO  → Use Playwright base test directly

Is authentication needed?
├─ YES → Already handled! Use any test (auth loaded from global-setup)
└─ NO  → Use Playwright base test with storageState: undefined

Do you need admin access?
├─ YES → Use chromium-admin project or test.use({ storageState: '.auth/admin.json' })
└─ NO  → Use default (user auth)
```

---

## 📚 Available Test Imports

### 1. **Base Playwright Test** (Most Common)

```typescript
import { test, expect } from '@playwright/test';
```

**When to use:**
- ✅ Simple tests that don't need extra functionality
- ✅ API tests (no browser needed)
- ✅ Visual tests (screenshots)
- ✅ **Most UI tests** - Auth is already handled by global-setup!

**Example:**
```typescript
import { test, expect } from '@playwright/test';
import { LoginPage } from '@pages/auth/LoginPage';
import { DashboardPage } from '@pages/dashboard/DashboardPage';

test.describe('Dashboard Tests', () => {
  test('should display dashboard', async ({ page }) => {
    // Page is already authenticated via global-setup!
    const dashboard = new DashboardPage(page);

    await dashboard.navigate();
    await expect(page).toHaveURL(/dashboard/);
  });
});
```

---

### 2. **Enhanced Test with Logger** (When You Need Debugging)

```typescript
import { test, expect } from '@core/fixtures/base.fixture';
```

**When to use:**
- ✅ Complex tests needing detailed logs
- ✅ Debugging flaky tests
- ✅ Tests with multiple steps
- ✅ When you want browser console captured

**What you get:**
- `logger` - Winston logger instance
- `testContext` - Test metadata (name, file, startTime)
- Browser console capturing (errors, warnings)
- Request failure logging
- Auto-log test start/end

**Example:**
```typescript
import { test, expect } from '@core/fixtures/base.fixture';
import { DashboardPage } from '@pages/dashboard/DashboardPage';

test('complex user workflow', async ({ page, logger, testContext }) => {
  logger.info('Starting complex workflow test');

  const dashboard = new DashboardPage(page);
  await dashboard.navigate();

  logger.debug('Dashboard loaded successfully');
  logger.info(`Test: ${testContext.testName}`);

  // Your test logic...

  logger.info('Workflow completed successfully');
});
```

---

### 3. **API Test Fixture** (API Testing Only)

```typescript
import { test, expect } from '@core/fixtures/api.fixture';
```

**When to use:**
- ✅ API-only tests
- ✅ Need authenticated API context
- ✅ Testing backend services

**What you get:**
- `apiContext` - Configured API request context
- `authToken` - Auto-obtained auth token

**Example:**
```typescript
import { test, expect } from '@core/fixtures/api.fixture';
import { UserService } from '@services/users/UserService';

test('should get current user', async ({ apiContext, authToken }) => {
  const userService = new UserService(apiContext);
  userService.setAuthToken(authToken);

  const response = await userService.getCurrentUser();

  expect(response.status).toBe(200);
  expect(response.data).toHaveProperty('email');
});
```

---

## 🔐 Authentication Handling

### **The New Way (Global Setup) ✅**

Authentication is now handled **once** before all tests via `global-setup.ts`:

```typescript
// global-setup.ts runs ONCE and creates:
// .auth/user.json    ← Regular user session
// .auth/admin.json   ← Admin user session

// playwright.config.ts automatically loads:
use: {
  storageState: '.auth/user.json',  // All tests authenticated by default!
}
```

**In your tests:**
```typescript
import { test } from '@playwright/test';

test('authenticated test', async ({ page }) => {
  // NO LOGIN NEEDED! Already authenticated
  await page.goto('/dashboard');
  // ✓ User is logged in
});
```

---

### **Admin Tests**

**Option 1: Use admin project**
```bash
npx playwright test --project=chromium-admin
```

**Option 2: Override in test file**
```typescript
import { test } from '@playwright/test';

test.use({ storageState: '.auth/admin.json' });

test('admin test', async ({ page }) => {
  // Logged in as admin
  await page.goto('/admin');
});
```

---

### **Unauthenticated Tests (Login Flow Testing)**

```typescript
import { test } from '@playwright/test';

// Override to disable auth for this file
test.use({ storageState: undefined });

test('login flow', async ({ page }) => {
  // Not authenticated - can test login
  const loginPage = new LoginPage(page);
  await loginPage.navigate();
  await loginPage.login('user@example.com', 'password');
});
```

---

## 📋 Comparison Table

| Scenario | Import | Authentication | Logger | Use Case |
|----------|--------|---------------|---------|----------|
| **Simple UI test** | `@playwright/test` | ✅ Auto (user) | ❌ | Most common |
| **UI test with logging** | `@core/fixtures/base.fixture` | ✅ Auto (user) | ✅ | Debugging |
| **Admin UI test** | `@playwright/test` + override | ✅ Auto (admin) | ❌ | Admin features |
| **Login flow test** | `@playwright/test` + override | ❌ Disabled | ❌ | Auth testing |
| **API test** | `@core/fixtures/api.fixture` | ✅ Token | ❌ | Backend testing |
| **Visual test** | `@playwright/test` | ✅ Auto (user) | ❌ | Screenshots |

---

## 🎯 Real-World Examples

### Example 1: Simple Authenticated Test
```typescript
// tests/ui/dashboard/dashboard.spec.ts
import { test, expect } from '@playwright/test';
import { DashboardPage } from '@pages/dashboard/DashboardPage';

test('dashboard loads', async ({ page }) => {
  const dashboard = new DashboardPage(page);
  await dashboard.navigate();
  await expect(page).toHaveURL(/dashboard/);
});
```

### Example 2: Complex Test with Logging
```typescript
// tests/ui/complex-workflow.spec.ts
import { test, expect } from '@core/fixtures/base.fixture';
import { CheckoutPage } from '@pages/checkout/CheckoutPage';

test('complete checkout flow', async ({ page, logger }) => {
  logger.info('Starting checkout flow');

  const checkout = new CheckoutPage(page);
  await checkout.navigate();

  await test.step('Add items to cart', async () => {
    logger.debug('Adding items...');
    await checkout.addItem('Product 1');
    logger.debug('Item added');
  });

  await test.step('Complete payment', async () => {
    logger.debug('Processing payment...');
    await checkout.completePayment();
    logger.info('Payment successful');
  });

  logger.info('Checkout flow completed');
});
```

### Example 3: Admin Test
```typescript
// tests/ui/admin/admin-panel.spec.ts
import { test, expect } from '@playwright/test';

// Use admin auth for all tests in this file
test.use({ storageState: '.auth/admin.json' });

test('admin can access panel', async ({ page }) => {
  await page.goto('/admin');
  await expect(page.locator('.admin-header')).toBeVisible();
});
```

### Example 4: Login Test (No Auth)
```typescript
// tests/ui/auth/login.spec.ts
import { test, expect } from '@playwright/test';
import { LoginPage } from '@pages/auth/LoginPage';

// Disable auth to test login flow
test.use({ storageState: undefined });

test('should login successfully', async ({ page }) => {
  const loginPage = new LoginPage(page);

  await loginPage.navigate();
  await loginPage.login('test@example.com', 'password');

  await expect(page).toHaveURL(/dashboard/);
});
```

### Example 5: API Test
```typescript
// tests/api/users/users.api.spec.ts
import { test, expect } from '@core/fixtures/api.fixture';
import { UserService } from '@services/users/UserService';

test('should fetch user data', async ({ apiContext, authToken }) => {
  const userService = new UserService(apiContext);
  userService.setAuthToken(authToken);

  const response = await userService.getCurrentUser();

  expect(response.status).toBe(200);
});
```

---

## 🚀 Migration from Old Fixtures

**Before (page.fixture.ts):**
```typescript
import { test } from '@core/fixtures/page.fixture';

test('test', async ({ authenticatedPage }) => {
  // Had to use special fixture
});
```

**After (base Playwright test):**
```typescript
import { test } from '@playwright/test';

test('test', async ({ page }) => {
  // Auth already handled by global-setup!
  // Just use regular page
});
```

---

## 📊 Performance Impact

| Approach | Auth Time | Total Test Time (50 tests) |
|----------|-----------|---------------------------|
| **Old (Fixture per test)** | 3s × 50 = 150s | ~300s |
| **New (Global Setup)** | 3s × 1 = 3s | ~153s |
| **Savings** | | **~50% faster!** ⚡ |

---

## ✅ Best Practices

1. **Default to base Playwright test**
   ```typescript
   import { test } from '@playwright/test';
   ```

2. **Use logger fixture for complex/flaky tests**
   ```typescript
   import { test } from '@core/fixtures/base.fixture';
   ```

3. **Never import page.fixture.ts** - It's deprecated

4. **For admin tests** - Use project or override:
   ```typescript
   test.use({ storageState: '.auth/admin.json' });
   ```

5. **For login tests** - Disable auth:
   ```typescript
   test.use({ storageState: undefined });
   ```

---

## 🎓 Summary

- **90% of tests**: Use `import { test } from '@playwright/test'`
- **10% of tests**: Use `import { test } from '@core/fixtures/base.fixture'` (for logging)
- **Authentication**: Automatic via global-setup (no fixture needed!)
- **Admin tests**: Use `chromium-admin` project or override storageState
- **Login tests**: Override with `storageState: undefined`

The framework is now **simpler**, **faster**, and follows **Playwright best practices**! 🎉
