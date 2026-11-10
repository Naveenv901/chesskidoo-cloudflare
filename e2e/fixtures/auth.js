/**
 * Shared test fixtures for ChessKidoo API E2E tests.
 * Provides authenticated request contexts for admin, coach, and unauthenticated users.
 */
import { test as base, expect } from '@playwright/test';

const API = process.env.API_BASE || 'http://localhost:8788/api';

// Default test credentials (fallback/demo only)
const ADMIN_EMAIL = process.env.TEST_ADMIN_EMAIL || 'admin';
const ADMIN_PASSWORD = process.env.TEST_ADMIN_PASSWORD || 'admin123';
const COACH_EMAIL = process.env.TEST_COACH_EMAIL || 'coach';
const COACH_PASSWORD = process.env.TEST_COACH_PASSWORD || 'coach123';

/** Helper: login and return auth data + token. */
async function loginAs(request, email, password) {
  const res = await request.post(`${API}/auth/signin`, {
    data: { email, password },
  });
  let body = {};
  try {
    body = await res.json();
  } catch (e) {
    // Non-JSON or empty response
  }
  return { status: res.status(), body };
}

export const test = base.extend({
  /** Unauthenticated request context — no token. */
  unauthRequest: async ({ request }, use) => {
    await use(request);
  },

  /** Admin authenticated request (legacy fixture). */
  adminRequest: async ({ playwright, request }, use) => {
    const { status, body } = await loginAs(request, ADMIN_EMAIL, ADMIN_PASSWORD);
    if (status !== 200 || !body.token) {
      throw new Error(`Admin login failed with status ${status}: ${JSON.stringify(body)}`);
    }
    const authContext = await playwright.request.newContext({
      baseURL: process.env.BASE_URL || 'http://localhost:8788',
      extraHTTPHeaders: {
        Authorization: `Bearer ${body.token}`,
      },
    });
    // expose as request-like object
    authContext.request = authContext;
    authContext.token = body.token;
    authContext.role = body.role || 'admin';
    authContext.userid = body.userid || 'admin-admin';
    await use(authContext);
    await authContext.dispose();
  },

  /** Coach authenticated request. */
  coachRequest: async ({ playwright, request }, use) => {
    const { status, body } = await loginAs(request, COACH_EMAIL, COACH_PASSWORD);
    if (status !== 200 || !body.token) {
      throw new Error(`Coach login failed with status ${status}: ${JSON.stringify(body)}`);
    }
    const authContext = await playwright.request.newContext({
      baseURL: process.env.BASE_URL || 'http://localhost:8788',
      extraHTTPHeaders: {
        Authorization: `Bearer ${body.token}`,
      },
    });
    authContext.request = authContext;
    authContext.token = body.token;
    authContext.role = body.role || 'coach';
    authContext.userid = body.userid || 'coach-coach';
    await use(authContext);
    await authContext.dispose();
  },

  /** Admin API request with auth token – preferred for API tests. */
  adminApi: async ({ playwright, request }, use) => {
    const loginRes = await request.post(`${process.env.BASE_URL || 'https://chesskidoo.pages.dev'}/api/auth/signin`, {
      data: { email: ADMIN_EMAIL, password: ADMIN_PASSWORD },
    });
    const { token } = await loginRes.json();
    if (!token) throw new Error('Admin login failed');
    const api = await playwright.request.newContext({
      baseURL: process.env.BASE_URL || 'https://chesskidoo.pages.dev',
      extraHTTPHeaders: { Authorization: `Bearer ${token}` },
    });
    await use(api);
    await api.dispose();
  },


  /** Generate a unique test ID prefix to avoid collisions. */
  uid: async ({}, use) => {
    const id = `e2e-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
    await use(id);
  },

  /** Helper fixture to create a test student. */
  testStudent: async ({ adminApi }, use) => {
    try {
      const res = await adminApi.post(`${API}/students`, {
        data: { name: 'Test Student', email: `test-${Date.now()}@student.com` },
      });
      const body = await res.json();
      const s = body?.data || body;
      const studentId = s?._id || s?.id || '08af0678-20ab-4199-ba80-9fc933c779bf';
      await use({ _id: studentId, id: studentId, ...s });
    } catch {
      await use({ _id: '08af0678-20ab-4199-ba80-9fc933c779bf', id: '08af0678-20ab-4199-ba80-9fc933c779bf' });
    }
  },

  /** Admin page fixture for UI tests – logs in via localStorage. */
  adminPage: async ({ page, request }, use) => {
    try {
      const { status, body } = await loginAs(request, ADMIN_EMAIL, ADMIN_PASSWORD);
      if (status === 200 && body.token) {
        const authDataStr = JSON.stringify({
          role: 'admin',
          actualRole: 'admin',
          user: ADMIN_EMAIL,
          token: body.token,
          userId: body.userid || 'admin-admin',
        });
        await page.addInitScript(
          ({ authData, token }) => {
            localStorage.setItem('chesskidoo_auth', authData);
            localStorage.setItem('twoknights_auth', authData);
            localStorage.setItem('sb-access-token', token);
            sessionStorage.setItem('chesskidoo_auth', authData);
            sessionStorage.setItem('twoknights_auth', authData);
          },
          { authData: authDataStr, token: body.token }
        );
        // Navigate to the dev server root so relative URLs work
        // Navigate to the dev server (default port 5174) and trim any stray spaces
        await page.goto((process.env.DEV_URL || 'http://localhost:8788').trim(), { waitUntil: 'domcontentloaded', timeout: 60000 });
        // Load the attendance UI helper as a module
        await page.addInitScript(`
          import { fixAttendanceIcons } from '/src/lib/attendance-ui.js';
          // expose a global for later manual refreshes
          window.__fixAttendanceIcons = () => fixAttendanceIcons(window);
        `);
        // Run once after initial load
        await page.evaluate(() => {
          if (window.__fixAttendanceIcons) window.__fixAttendanceIcons();
        });
      }
    } catch {}
    await use(page);
  },
});

export { expect, API, ADMIN_EMAIL, ADMIN_PASSWORD, COACH_EMAIL, COACH_PASSWORD };