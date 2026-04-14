/**
 * Central configuration for the InvenTree API test suite.
 *
 * Values come from environment variables with sensible defaults
 * pointing at the public demo instance.
 */
export const CONFIG = {
  /** Base URL of the InvenTree instance (no trailing slash) */
  baseUrl: process.env.API_BASE_URL || 'https://demo.inventree.org',

  /** API root path */
  apiRoot: '/api/',

  /** Available test accounts */
  accounts: {
    allaccess: { username: 'allaccess', password: 'nolimits' },
    reader: { username: 'reader', password: 'readonly' },
    engineer: { username: 'engineer', password: 'partsonly' },
    admin: { username: 'admin', password: 'inventree' },
  },

  /** Request defaults */
  defaults: {
    timeout: 15_000,
    retries: 1,
  },
} as const;

export type AccountName = keyof typeof CONFIG.accounts;
