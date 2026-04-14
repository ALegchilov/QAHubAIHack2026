import { defineConfig, devices } from '@playwright/test';
import * as path from 'path';

const AUTH_FILE = path.resolve(__dirname, '.auth/allaccess-state.json');

/**
 * Playwright configuration for InvenTree UI testing.
 *
 * Uses a setup project to authenticate once, then all tests
 * reuse the saved browser storage state (cookies, localStorage).
 *
 * Run with: npx playwright test --config=playwright.ui.config.ts
 */
export default defineConfig({
  testDir: './tests/ui',

  /* Fail the build on CI if test.only is left in source */
  forbidOnly: !!process.env.CI,

  /* Retry failed tests once on CI */
  retries: process.env.CI ? 1 : 0,

  /* Run tests sequentially — UI tests interact with shared demo data */
  fullyParallel: false,
  workers: 1,

  /* Reporter configuration */
  reporter: [
    ['list'],
    ['html', { open: process.env.CI ? 'never' : 'on-failure' }],
  ],

  /* Global timeout per test — UI tests are slower */
  timeout: 60_000,

  /* Expect timeout for assertions */
  expect: {
    timeout: 15_000,
  },

  /* Shared settings for all projects */
  use: {
    baseURL: process.env.UI_BASE_URL || 'https://demo.inventree.org',
    screenshot: 'only-on-failure',
    trace: 'on-first-retry',
    actionTimeout: 15_000,
    navigationTimeout: 30_000,
  },

  projects: [
    /* Auth setup — logs in once and saves storage state */
    {
      name: 'setup',
      testMatch: 'auth.setup.ts',
    },
    /* UI tests — depend on setup for pre-authenticated state */
    {
      name: 'ui-chromium',
      testMatch: '**/*.spec.ts',
      use: {
        ...devices['Desktop Chrome'],
        storageState: AUTH_FILE,
      },
      dependencies: ['setup'],
    },
  ],
});
