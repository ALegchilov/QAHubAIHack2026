import { test as base, expect, Page } from '@playwright/test';

/**
 * UI test fixtures for InvenTree.
 *
 * Authentication is handled by the setup project (auth.setup.ts)
 * which saves storageState. All tests receive a pre-authenticated page.
 */

type UiFixtures = {
  /** A pre-authenticated browser page (via storageState from setup) */
  authenticatedPage: Page;
  /** Tracked part names created during the test */
  createdPartNames: string[];
};

export const test = base.extend<UiFixtures>({
  authenticatedPage: async ({ page }, use) => {
    // Page is already authenticated via storageState in the config
    await use(page);
  },

  createdPartNames: async ({}, use) => {
    const names: string[] = [];
    await use(names);
    // No automated cleanup — demo resets daily
  },
});

export { expect };
