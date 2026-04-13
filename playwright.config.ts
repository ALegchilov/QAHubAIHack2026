import { defineConfig } from '@playwright/test';

/**
 * Playwright configuration for InvenTree API testing.
 *
 * No browser is launched — all tests use Playwright's APIRequestContext
 * to make HTTP calls directly against the InvenTree REST API.
 */
export default defineConfig({
  testDir: './tests/api',
  testMatch: '**/*.spec.ts',

  /* Fail the build on CI if test.only is left in source */
  forbidOnly: !!process.env.CI,

  /* Retry failed tests once on CI */
  retries: process.env.CI ? 1 : 0,

  /* Run tests in parallel — each file in its own worker */
  fullyParallel: true,
  workers: process.env.CI ? 2 : 4,

  /* Reporter configuration */
  reporter: [
    ['list'],
    ['html', { open: process.env.CI ? 'never' : 'on-failure' }],
  ],

  /* Global timeout per test */
  timeout: 30_000,

  /* Expect timeout for assertions */
  expect: {
    timeout: 10_000,
  },

  projects: [
    {
      name: 'api-tests',
      use: {
        /* Base URL for all API requests */
        baseURL: process.env.API_BASE_URL || 'https://demo.inventree.org',

        /* Extra HTTP headers applied to every request */
        extraHTTPHeaders: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
      },
    },
  ],
});
