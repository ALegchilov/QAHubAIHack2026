import { APIRequestContext } from '@playwright/test';
import { CONFIG, AccountName } from './config';

/** Cached tokens so we don't re-authenticate for every test */
const tokenCache = new Map<string, string>();

/**
 * Obtain a token for the given account.
 *
 * InvenTree uses GET /api/user/token/ with HTTP Basic Auth to issue tokens.
 * Tokens are cached per account name for the lifetime of the worker
 * process, avoiding repeated calls.
 */
export async function getToken(
  request: APIRequestContext,
  account: AccountName = 'allaccess',
): Promise<string> {
  const cached = tokenCache.get(account);
  if (cached) return cached;

  const creds = CONFIG.accounts[account];
  const basicAuth = Buffer.from(`${creds.username}:${creds.password}`).toString('base64');

  const response = await request.get(`${CONFIG.apiRoot}user/token/`, {
    headers: {
      Authorization: `Basic ${basicAuth}`,
    },
  });

  if (!response.ok()) {
    throw new Error(
      `Auth failed for ${account}: ${response.status()} ${await response.text()}`,
    );
  }

  const body = await response.json();
  const token: string = body.token;

  if (!token) {
    throw new Error(`No token in response for ${account}: ${JSON.stringify(body)}`);
  }

  tokenCache.set(account, token);
  return token;
}

/**
 * Build the Authorization header value for a given account.
 */
export async function authHeader(
  request: APIRequestContext,
  account: AccountName = 'allaccess',
): Promise<Record<string, string>> {
  const token = await getToken(request, account);
  return { Authorization: `Token ${token}` };
}

/**
 * Clear all cached tokens (useful between test suites if needed).
 */
export function clearTokenCache(): void {
  tokenCache.clear();
}
