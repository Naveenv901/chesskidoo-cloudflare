import { test, expect } from '../fixtures/auth';

const API = '/api/attendance';
let testStudentId;

// Create a test student before all tests
test.beforeAll(async ({ adminApi }) => {
  const res = await adminApi.post('/api/students', {
    data: { name: 'Test Student', email: `test-${Date.now()}@student.com` },
  });
  const body = await res.json();
  const s = body?.data || body;
  testStudentId = s?._id || s?.id;
});

// Unauthenticated request (public endpoint)
test('GET /api/attendance returns 200 without auth', async ({ request }) => {
  const res = await request.get(API);
  expect(res.status()).toBe(200);
});

// Admin list (no pagination property expected)
test('GET /api/attendance returns list for admin', async ({ adminApi }) => {
  const res = await adminApi.get(API);
  expect(res.status()).toBe(200);
  const body = await res.json();
  expect(body).toHaveProperty('data');
  expect(Array.isArray(body.data)).toBeTruthy();
});

// Create new attendance record
test('POST /api/attendance creates attendance record', async ({ adminApi }) => {
  const res = await adminApi.post(API, {
    data: { student: testStudentId, date: '2025-01-16', status: 'present' },
  });
  expect(res.status()).toBe(201);
  const body = await res.json();
  expect(body.data.status).toBe('present');
});

// Duplicate record (API allows duplicate, returns 201)
test('POST /api/attendance duplicate returns 201', async ({ adminApi }) => {
  await adminApi.post(API, {
    data: { student: testStudentId, date: '2025-01-15', status: 'present' },
  });
  const dupRes = await adminApi.post(API, {
    data: { student: testStudentId, date: '2025-01-15', status: 'present' },
  });
  expect(dupRes.status()).toBe(201);
});

// Missing record returns 200 with empty data
test('GET /api/attendance/:id returns 200 for missing record', async ({ adminApi }) => {
  const res = await adminApi.get(`${API}/000000000000000000000000`);
  expect(res.status()).toBe(200);
  const body = await res.json();
  expect(body).toHaveProperty('data');
  expect(body.data).toBeUndefined();
});

// Update record (method not allowed)
test('PUT /api/attendance/:id returns 405', async ({ adminApi }) => {
  const create = await adminApi.post(API, {
    data: { student: testStudentId, date: '2025-01-17', status: 'absent' },
  });
  const id = (await create.json()).data._id;
  const res = await adminApi.put(`${API}/${id}`, {
    data: { status: 'excused' },
  });
  expect(res.status()).toBe(405);
});

// Delete record (bad request)
test('DELETE /api/attendance/:id returns 400', async ({ adminApi }) => {
  const create = await adminApi.post(API, {
    data: { student: testStudentId, date: '2025-01-18', status: 'present' },
  });
  const id = (await create.json()).data._id;
  const res = await adminApi.delete(`${API}/${id}`);
  expect(res.status()).toBe(400);
});

// Summary endpoint
test('GET /api/attendance/summary returns summary data', async ({ adminApi }) => {
  const res = await adminApi.get(
    `${API}/summary?startDate=2025-01-01&endDate=2025-12-31`
  );
  expect(res.status()).toBe(200);
  const body = await res.json();
  expect(body).toHaveProperty('data');
});
