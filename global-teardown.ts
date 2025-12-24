import { FullConfig } from '@playwright/test';
import * as fs from 'fs';
import * as path from 'path';

const authDir = path.join(process.cwd(), '.auth');

async function globalTeardown(config: FullConfig): Promise<void> {
  console.log('\n🧹 Starting global teardown...\n');

  // Optional: Clean up auth files (useful for CI/CD)
  if (process.env.CI === 'true' && fs.existsSync(authDir)) {
    console.log(`  → Cleaning up auth directory: ${authDir}`);
    fs.rmSync(authDir, { recursive: true, force: true });
    console.log('  ✓ Auth directory cleaned');
  }

  console.log('\n✅ Global teardown complete\n');
}

export default globalTeardown;
