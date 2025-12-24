import { chromium, FullConfig } from '@playwright/test';
import { LoginPage } from '@pages/auth/LoginPage';
import { env } from '@config/environment.config';
import * as path from 'path';
import * as fs from 'fs';

const authDir = path.join(process.cwd(), '.auth');
const userAuthFile = path.join(authDir, 'user.json');
const adminAuthFile = path.join(authDir, 'admin.json');

async function globalSetup(config: FullConfig): Promise<void> {
  console.log('\n🔐 Starting global authentication setup...\n');

  // Ensure .auth directory exists
  if (!fs.existsSync(authDir)) {
    fs.mkdirSync(authDir, { recursive: true });
    console.log(`  📁 Created auth directory: ${authDir}`);
  }

  try {
    // Setup authentication in parallel for speed
    await Promise.all([setupUserAuth(), setupAdminAuth()]);

    console.log('\n✅ Global authentication setup complete\n');
  } catch (error) {
    console.error('\n❌ Global setup failed:', error);
    throw error;
  }
}

async function setupUserAuth(): Promise<void> {
  const browser = await chromium.launch({
    headless: env.get('headless'),
  });

  const context = await browser.newContext({
    viewport: { width: 1920, height: 1080 },
  });

  const page = await context.newPage();

  try {
    const loginPage = new LoginPage(page);
    const testUser = env.getTestUser();

    console.log(`  → Authenticating user: ${testUser.email}`);

    await loginPage.navigate();
    await loginPage.login(testUser.email, testUser.password);

    // Wait for successful login - adjust URL pattern to match your app
    await page.waitForURL(/dashboard|home|app/, {
      timeout: 30000,
      waitUntil: 'networkidle',
    });

    // Save authentication state
    await context.storageState({ path: userAuthFile });
    console.log(`  ✓ User auth saved: ${userAuthFile}`);
  } catch (error) {
    console.error(`  ✗ User authentication failed:`, error);
    // Take screenshot for debugging
    await page.screenshot({ path: 'global-setup-user-error.png' });
    throw error;
  } finally {
    await browser.close();
  }
}

async function setupAdminAuth(): Promise<void> {
  const browser = await chromium.launch({
    headless: env.get('headless'),
  });

  const context = await browser.newContext({
    viewport: { width: 1920, height: 1080 },
  });

  const page = await context.newPage();

  try {
    const loginPage = new LoginPage(page);
    const adminUser = env.getTestAdmin();

    console.log(`  → Authenticating admin: ${adminUser.email}`);

    await loginPage.navigate();
    await loginPage.login(adminUser.email, adminUser.password);

    // Wait for successful login - adjust URL pattern to match your app
    await page.waitForURL(/dashboard|admin|home/, {
      timeout: 30000,
      waitUntil: 'networkidle',
    });

    // Save authentication state
    await context.storageState({ path: adminAuthFile });
    console.log(`  ✓ Admin auth saved: ${adminAuthFile}`);
  } catch (error) {
    console.error(`  ✗ Admin authentication failed:`, error);
    // Take screenshot for debugging
    await page.screenshot({ path: 'global-setup-admin-error.png' });
    throw error;
  } finally {
    await browser.close();
  }
}

export default globalSetup;
