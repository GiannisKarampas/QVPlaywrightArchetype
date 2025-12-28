# Test Tags Strategy Guide

## 🏷️ Available Tags

### Priority Tags

- **`@smoke`** - Critical path tests (login, core features) - Run first in CI
- **`@critical`** - High-priority features (payment, checkout, auth)
- **`@regression`** - Full regression suite
- **`@slow`** - Long-running tests (run separately)

### Feature Tags

- **`@auth`** - Authentication-related tests
- **`@api`** - API tests
- **`@ui`** - UI tests
- **`@visual`** - Visual regression tests
- **`@e2e`** - End-to-end journeys

### Custom Tags (Add as needed)

- **`@wip`** - Work in progress (skip in CI)
- **`@bug-12345`** - Tests for specific bug fixes
- **`@feature-payment`** - Feature-specific tests

---

## 📋 Tag Strategy

### Test Pyramid

```
        @smoke (5-10 tests, ~2 min)
              ↓
       @critical (20-30 tests, ~5 min)
              ↓
       @regression (100+ tests, ~20 min)
              ↓
         @slow (edge cases, ~30+ min)
```

---

## 🚀 Running Tagged Tests

### Smoke Tests (Fastest)

```bash
npm run test:smoke
# Runs: ~10 critical path tests in ~2 minutes
```

### Critical Tests

```bash
npm run test:critical
# Runs: ~30 high-priority tests in ~5 minutes
```

### Regression Tests (Full Suite)

```bash
npm run test:regression
# Runs: All regression tests
```

### Slow Tests (Separate)

```bash
npm run test:slow
# Runs: Long-running tests with --workers=1
```

### Custom Tag

```bash
npm run test:tag -- @auth
npm run test:tag -- @feature-payment
```

### Combine Tags (AND)

```bash
npx playwright test --grep "(?=.*@smoke)(?=.*@api)"
# Runs: Tests tagged with BOTH @smoke AND @api
```

### Exclude Tags (NOT)

```bash
npx playwright test --grep-invert @slow
# Runs: All tests EXCEPT @slow
```

---

## 📝 How to Tag Tests

### Basic Tagging

```typescript
import { test } from '@playwright/test';

test('critical feature @smoke @critical', async ({ page }) => {
  // Test logic
});

// Or using describe
test.describe('Login Tests @auth', () => {
  test('should login @smoke', async ({ page }) => {
    // Test logic
  });
});
```

### Multiple Tags

```typescript
test('user registration @smoke @critical @auth', async ({ page }) => {
  // This test will run for: smoke, critical, and auth
});
```

### Skip Work in Progress

```typescript
test('new feature @wip', async ({ page }) => {
  // This test can be filtered out in CI
});
```

---

## 🎯 CI/CD Strategy

### GitHub Actions Example

```yaml
jobs:
  smoke-tests:
    name: Smoke Tests
    runs-on: ubuntu-latest
    steps:
      - run: npm run test:smoke
    # Fast feedback: ~2 minutes

  regression-tests:
    name: Regression Tests
    needs: smoke-tests # Only if smoke passes
    runs-on: ubuntu-latest
    steps:
      - run: npm run test:regression
    # Full coverage: ~20 minutes

  slow-tests:
    name: Slow Tests
    needs: regression-tests
    runs-on: ubuntu-latest
    if: github.event_name == 'schedule' # Only on nightly
    steps:
      - run: npm run test:slow
```

---

## 📊 Recommended Tagging

### Login Test

```typescript
test('should login successfully @smoke @critical @auth', async ({ page }) => {
  // Critical path - must always work
});
```

### API Test

```typescript
test('should create user @smoke @critical @api', async ({ apiContext }) => {
  // Core API functionality
});
```

### Visual Test

```typescript
test('homepage snapshot @visual @regression', async ({ page }) => {
  // Visual regression - not critical path
});
```

### Slow E2E Test

```typescript
test('complete checkout flow @slow @e2e @regression', async ({ page }) => {
  // Long test - run separately
});
```

### Bug Fix Test

```typescript
test('should handle edge case @bug-12345 @regression', async ({ page }) => {
  // Regression test for bug #12345
});
```

---

## 🎓 Best Practices

### ✅ DO

1. **Tag all smoke tests**

   ```typescript
   test('critical flow @smoke', async ({ page }) => { ... });
   ```

2. **Be specific with feature tags**

   ```typescript
   test('payment processing @smoke @critical @feature-payment', ...);
   ```

3. **Mark slow tests**

   ```typescript
   test('bulk data processing @slow @regression', ...);
   ```

4. **Use consistent naming**
   - Always lowercase
   - Use hyphens for multi-word tags: `@feature-checkout`

### ❌ DON'T

1. **Don't over-tag**

   ```typescript
   ❌ test('test @smoke @critical @regression @api @auth @feature-x @important', ...);
   ✅ test('test @smoke @critical @auth', ...);
   ```

2. **Don't forget smoke tests**

   ```typescript
   ❌ No smoke tests → CI takes forever
   ✅ 5-10 @smoke tests → Fast feedback
   ```

3. **Don't mix all tests in one suite**
   ```typescript
   ❌ All tests take 1 hour in CI
   ✅ Smoke (2min) → Critical (5min) → Full (20min) → Slow (30min)
   ```

---

## 📈 Tag Distribution Guidelines

| Tag           | % of Tests | Examples                        |
| ------------- | ---------- | ------------------------------- |
| `@smoke`      | 5-10%      | Login, API health, homepage     |
| `@critical`   | 20-30%     | Payment, checkout, user mgmt    |
| `@regression` | 60-80%     | All features, edge cases        |
| `@slow`       | 5-10%      | Bulk operations, large datasets |

---

## 🔍 Finding Tagged Tests

```bash
# List all tests with tag
npx playwright test --list --grep @smoke

# Count tests by tag
npx playwright test --list --grep @smoke | wc -l

# Dry run (see what would execute)
npx playwright test --grep @smoke --dry-run
```

---

## 📋 Example Test Suite

```typescript
// tests/ui/auth/login.spec.ts
import { test } from '@playwright/test';

test.describe('Login Tests @auth', () => {
  test('successful login @smoke @critical', async ({ page }) => {
    // Critical path - must work
  });

  test('invalid credentials error @regression', async ({ page }) => {
    // Full regression
  });

  test('password reset flow @regression', async ({ page }) => {
    // Full regression
  });

  test('concurrent logins @slow @regression', async ({ page }) => {
    // Slow test - edge case
  });
});
```

---

## 🎯 Quick Reference

```bash
# Development
npm run test:smoke       # Quick smoke test
npm run test:critical    # High-priority tests

# CI Pipeline
npm run test:smoke       # Stage 1: Fast feedback (2 min)
npm run test:regression  # Stage 2: Full coverage (20 min)
npm run test:slow        # Stage 3: Nightly (30+ min)

# Custom
npm run test:tag -- @auth           # Auth tests only
npm run test:tag -- @feature-payment # Payment feature
npx playwright test --grep-invert @slow # All except slow
```

---

## 🚀 Summary

**Tagging Strategy Benefits:**

- ⚡ **Faster CI** - Run smoke tests first
- 🎯 **Targeted testing** - Test specific features
- 📊 **Better organization** - Clear test categorization
- 🔄 **Flexible execution** - Run what you need
- 💰 **Cost savings** - Don't run everything always

**Golden Rule:**

- Every test should have at least 2 tags (priority + feature)
- Example: `@smoke @auth` or `@regression @api`

---

Start with **@smoke** tests (5-10 critical tests) and build from there! 🎉
