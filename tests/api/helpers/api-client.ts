import { APIRequestContext, APIResponse } from '@playwright/test';
import { CONFIG, AccountName } from './config';
import { authHeader } from './auth';

/**
 * Typed wrapper around Playwright's APIRequestContext
 * that handles auth headers and URL construction automatically.
 */
export class ApiClient {
  constructor(
    private request: APIRequestContext,
    private account: AccountName = 'allaccess',
  ) {}

  // ---- Low-level HTTP methods ----

  async get(path: string, params?: Record<string, string | number | boolean>): Promise<APIResponse> {
    const headers = await authHeader(this.request, this.account);
    return this.request.get(`${CONFIG.apiRoot}${path}`, {
      headers,
      params: params as Record<string, string>,
    });
  }

  async post(path: string, data?: unknown): Promise<APIResponse> {
    const headers = await authHeader(this.request, this.account);
    return this.request.post(`${CONFIG.apiRoot}${path}`, {
      headers,
      data,
    });
  }

  async put(path: string, data?: unknown): Promise<APIResponse> {
    const headers = await authHeader(this.request, this.account);
    return this.request.put(`${CONFIG.apiRoot}${path}`, {
      headers,
      data,
    });
  }

  async patch(path: string, data?: unknown): Promise<APIResponse> {
    const headers = await authHeader(this.request, this.account);
    return this.request.patch(`${CONFIG.apiRoot}${path}`, {
      headers,
      data,
    });
  }

  async delete(path: string): Promise<APIResponse> {
    const headers = await authHeader(this.request, this.account);
    return this.request.delete(`${CONFIG.apiRoot}${path}`, {
      headers,
    });
  }

  // ---- Convenience: unauthenticated requests (for negative tests) ----

  async getNoAuth(path: string): Promise<APIResponse> {
    return this.request.get(`${CONFIG.apiRoot}${path}`);
  }

  async postNoAuth(path: string, data?: unknown): Promise<APIResponse> {
    return this.request.post(`${CONFIG.apiRoot}${path}`, { data });
  }

  // ---- High-level helpers ----

  /**
   * Create a part and return its response body (with pk).
   * Throws if the request doesn't return 201.
   */
  async createPart(data: Record<string, unknown>): Promise<Record<string, unknown>> {
    const res = await this.post('part/', data);
    if (res.status() !== 201) {
      const body = await res.text();
      throw new Error(`createPart failed: ${res.status()} — ${body}`);
    }
    return res.json();
  }

  /**
   * Create a part category and return its response body.
   */
  async createCategory(data: Record<string, unknown>): Promise<Record<string, unknown>> {
    const res = await this.post('part/category/', data);
    if (res.status() !== 201) {
      const body = await res.text();
      throw new Error(`createCategory failed: ${res.status()} — ${body}`);
    }
    return res.json();
  }

  /**
   * Delete a part by pk (best-effort cleanup — ignores 404).
   */
  async deletePart(pk: number): Promise<void> {
    await this.delete(`part/${pk}/`);
  }

  /**
   * Delete a category by pk (best-effort cleanup — ignores 404).
   */
  async deleteCategory(pk: number): Promise<void> {
    await this.delete(`part/category/${pk}/`);
  }

  /**
   * Fetch a single part by pk.
   */
  async getPart(pk: number): Promise<Record<string, unknown>> {
    const res = await this.get(`part/${pk}/`);
    return res.json();
  }

  /**
   * List parts with optional query parameters.
   */
  async listParts(params?: Record<string, string | number | boolean>): Promise<{
    count: number;
    next: string | null;
    previous: string | null;
    results: Record<string, unknown>[];
  }> {
    const res = await this.get('part/', params);
    return res.json();
  }
}
