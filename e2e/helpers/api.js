/**
 * API test helpers for ChessKidoo E2E tests.
 */
import { expect } from '@playwright/test';

const API = process.env.API_BASE || 'http://localhost:8788/api';

/**
 * Assert that a response has the expected JSON structure.
 */
async function expectJsonShape(response, expectedKeys) {
  const body = await response.json();
  for (const key of expectedKeys) {
    expect(body).toHaveProperty(key);
  }
  return body;
}

/**
 * Assert that response.data is always an array.
 */
async function expectDataArray(response) {
  const body = await response.json();
  expect(Array.isArray(body.data)).toBe(true);
  return body;
}

/**
 * Poll a GET endpoint until a condition is met or timeout.
 */
async function waitForCondition(request, url, conditionFn, timeout = 10000, interval = 500) {
  const start = Date.now();
  while (Date.now() - start < timeout) {
    const res = await request.get(`${API}${url}`);
    if (res.ok()) {
      const body = await res.json();
      if (conditionFn(body)) return body;
    }
    await new Promise(r => setTimeout(r, interval));
  }
  throw new Error(`Condition not met within ${timeout}ms for ${url}`);
}

/**
 * Generate a unique test identifier.
 */
function uid(prefix = 'test') {
  return `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}

/**
 * Create a unique test student via API (for attendance/homework tests).
 */
async function createTestStudent(request, token, overrides = {}) {
  const id = uid('student');
  const res = await request.post(`${API}/students`, {
    headers: { Authorization: `Bearer ${token}` },
    data: {
      id,
      name: `E2E Student ${id}`,
      email: `${id}@test.com`,
      level: 'Beginner',
      status: 'active',
      ...overrides,
    },
  });
  return { id, res };
}

/**
 * Create a unique test batch via API.
 */
async function createTestBatch(request, token, overrides = {}) {
  const id = uid('batch');
  const res = await request.post(`${API}/batches`, {
    headers: { Authorization: `Bearer ${token}` },
    data: {
      id,
      name: `E2E Batch ${id}`,
      status: 'active',
      ...overrides,
    },
  });
  return { id, res };
}

/**
 * Create a homework assignment via API.
 */
async function createTestHomework(request, token, overrides = {}) {
  const id = uid('asn');
  const res = await request.post(`${API}/homework`, {
    headers: { Authorization: `Bearer ${token}` },
    data: {
      id,
      title: `E2E Homework ${id}`,
      target_type: 'all',
      due_date: '2026-12-31',
      status: 'active',
      ...overrides,
    },
  });
  return { id, res };
}

/**
 * Create an attendance record via API.
 */
async function createTestAttendance(request, token, overrides = {}) {
  const id = uid('att');
  const res = await request.post(`${API}/attendance`, {
    headers: { Authorization: `Bearer ${token}` },
    data: {
      id,
      studentId: uid('student'),
      date: '2026-10-28',
      status: 'present',
      ...overrides,
    },
  });
  return { id, res };
}

/**
 * Upload a file to R2 via API.
 */
async function uploadTestFile(request, token, content, filename = 'test.txt', contentType = 'text/plain') {
  const buffer = Buffer.from(content, 'utf-8');
  const res = await request.post(`${API}/upload?key=${encodeURIComponent(filename)}`, {
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': contentType,
    },
    body: buffer,
  });
  return res;
}

/**
 * Assert error response shape.
 */
async function expectError(response, expectedStatus, expectedMessageFragment = null) {
  expect(response.status()).toBe(expectedStatus);
  const body = await response.json();
  expect(body).toHaveProperty('error');
  if (expectedMessageFragment) {
    expect(body.error).toContain(expectedMessageFragment);
  }
  return body;
}

/**
 * Assert success response shape.
 */
async function expectSuccess(response, expectedStatus = 200) {
  expect(response.status()).toBe(expectedStatus);
  const body = await response.json();
  expect(body.success).toBe(true);
  return body;
}

export {
  expectJsonShape,
  expectDataArray,
  waitForCondition,
  uid,
  createTestStudent,
  createTestBatch,
  createTestHomework,
  createTestAttendance,
  uploadTestFile,
  expectError,
  expectSuccess,
  API,
};