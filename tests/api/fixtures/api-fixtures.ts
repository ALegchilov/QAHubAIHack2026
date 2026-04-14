import { test as base } from '@playwright/test';
import { ApiClient } from '../helpers/api-client';
import { AccountName } from '../helpers/config';

/**
 * Extended Playwright test fixtures providing pre-authenticated API clients
 * for each InvenTree account.
 *
 * Usage in tests:
 *   test('my test', async ({ api, readerApi }) => {
 *     const res = await api.get('part/');         // allaccess
 *     const res2 = await readerApi.get('part/');  // reader (read-only)
 *   });
 */
type ApiFixtures = {
  /** API client authenticated as `allaccess` (full CRUD) */
  api: ApiClient;
  /** API client authenticated as `reader` (read-only) */
  readerApi: ApiClient;
  /** API client authenticated as `engineer` (parts only) */
  engineerApi: ApiClient;
  /** API client authenticated as `admin` (superuser) */
  adminApi: ApiClient;
  /** Unauthenticated API client (for negative tests) */
  noAuthApi: ApiClient;
  /** Tracked part pks created during the test — auto-cleaned up */
  createdPartPks: number[];
  /** Tracked category pks created during the test — auto-cleaned up */
  createdCategoryPks: number[];
};

export const test = base.extend<ApiFixtures>({
  api: async ({ request }, use) => {
    await use(new ApiClient(request, 'allaccess'));
  },

  readerApi: async ({ request }, use) => {
    await use(new ApiClient(request, 'reader'));
  },

  engineerApi: async ({ request }, use) => {
    await use(new ApiClient(request, 'engineer'));
  },

  adminApi: async ({ request }, use) => {
    await use(new ApiClient(request, 'admin'));
  },

  noAuthApi: async ({ request }, use) => {
    // Uses allaccess internally but exposes *NoAuth methods
    await use(new ApiClient(request, 'allaccess'));
  },

  createdPartPks: async ({ api }, use) => {
    const pks: number[] = [];
    await use(pks);
    // Teardown: clean up any parts created during the test
    for (const pk of pks.reverse()) {
      try {
        await api.deletePart(pk);
      } catch {
        // Best-effort cleanup; demo resets daily anyway
      }
    }
  },

  createdCategoryPks: async ({ api }, use) => {
    const pks: number[] = [];
    await use(pks);
    // Teardown: clean up categories (children first = reverse order)
    for (const pk of pks.reverse()) {
      try {
        await api.deleteCategory(pk);
      } catch {
        // Best-effort
      }
    }
  },
});

export { expect } from '@playwright/test';
