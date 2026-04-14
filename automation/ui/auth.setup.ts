/**
 * Authentication setup — runs once before all UI tests.
 * Logs into InvenTree and saves browser storage state for reuse.
 */
import { test as setup, expect } from '@playwright/test';
import * as path from 'path';

const AUTH_FILE = path.resolve(__dirname, '../../.auth/allaccess-state.json');

setup('authenticate as allaccess', async ({ page }) => {
  // Navigate to login page
  await page.goto('/web/login');

  // Wait for login form to render
  await page.waitForTimeout(3000);

  // Use CSS selectors for reliability — the Mantine inputs have specific aria-labels
  const usernameInput = page.locator('input[aria-label="login-username"]');
  await usernameInput.waitFor({ state: 'visible', timeout: 30_000 });

  // Fill credentials with click-then-fill pattern to ensure focus
  await usernameInput.click();
  await usernameInput.fill('allaccess');

  // Password field — use CSS selector for type="password" input
  const passwordInput = page.locator('input[aria-label="login-password"]');
  await passwordInput.click();
  await passwordInput.fill('nolimits');

  // Brief pause to ensure fields are populated
  await page.waitForTimeout(500);

  // Click Log In button
  await page.getByRole('button', { name: 'Log In' }).click();

  // Wait for navigation away from login — be patient with demo server
  await page.waitForURL(/\/web\/(?!login)/, { timeout: 60_000, waitUntil: 'commit' });
  await page.waitForTimeout(3000);

  // Verify we're logged in by checking for user menu
  await expect(page.getByRole('button', { name: 'Ally Access' })).toBeVisible({ timeout: 15_000 });

  // Save storage state
  await page.context().storageState({ path: AUTH_FILE });
});
