import { test, expect } from '@playwright/test';
import { LoginPage } from '@pages/auth/LoginPage';
import { DashboardPage } from '@pages/dashboard/DashboardPage';
import { env } from '@config/environment.config';

// Disable authentication for login flow testing
test.use({ storageState: undefined });

test.describe('Login Tests', () => {
  let loginPage: LoginPage;
  let dashboardPage: DashboardPage;

  test.beforeEach(async ({ page }) => {
    loginPage = new LoginPage(page);
    dashboardPage = new DashboardPage(page);
    await loginPage.navigate();
  });

  test('should successfully login with valid credentials', async () => {
    const testUser = env.getTestUser();

    await test.step('Fill in login credentials', async () => {
      await loginPage.fillEmail(testUser.email);
      await loginPage.fillPassword(testUser.password);
    });

    await test.step('Click login button', async () => {
      await loginPage.clickLogin();
    });

    await test.step('Verify successful login', async () => {
      await dashboardPage.expectDashboardPage();
    });
  });

  test('should show error with invalid credentials', async () => {
    await test.step('Attempt login with invalid credentials', async () => {
      await loginPage.fillEmail('invalid@example.com');
      await loginPage.fillPassword('WrongPassword123!');
      await loginPage.clickLogin();
    });

    await test.step('Verify error message is displayed', async () => {
      const isErrorVisible = await loginPage.isErrorDisplayed();
      expect(isErrorVisible).toBeTruthy();
    });
  });

  test('should disable login button with empty fields', async () => {
    await test.step('Check login button state with empty fields', async () => {
      const isEnabled = await loginPage.isLoginButtonEnabled();
      expect(isEnabled).toBeFalsy();
    });
  });

  test('should navigate to forgot password page', async () => {
    await test.step('Click forgot password link', async () => {
      await loginPage.clickForgotPassword();
    });

    await test.step('Verify navigation', async () => {
      const currentUrl = await loginPage.getCurrentUrl();
      expect(currentUrl).toContain('forgot');
    });
  });

  test('should navigate to register page', async () => {
    await test.step('Click register link', async () => {
      await loginPage.clickRegister();
    });

    await test.step('Verify navigation', async () => {
      const currentUrl = await loginPage.getCurrentUrl();
      expect(currentUrl).toContain('register');
    });
  });
});
