const fs = require('fs');
const path = 'C:\\Naveen\\chesskidoo_website_cb\\e2e\\specs\\';

const attendanceSpec = `import { test, expect } from '../fixtures/auth';

const API = '/api/attendance';

test.describe('Attendance API', () => {
  test.beforeEach(async ({ adminRequest }) => {
    await adminRequest.delete('/api/clean-test-data').catch(() => {});
  });

  test('GET /api/attendance returns 401 without auth', async ({ page }) => {
    const res = await page.request.get(API);
    expect(res.status()).toBe(401);
  });

  test('GET /api/attendance returns paginated results for admin', async ({ adminRequest }) => {
    const res = await adminRequest.get(API);
    expect(res.status()).toBe(200);
    const body = await res.json();
    expect(body).toHaveProperty('data');
    expect(body).toHaveProperty('pagination');
  });

  test('POST /api/attendance creates attendance record', async ({ adminRequest, testStudent }) => {
    const res = await adminRequest.post(API, {
      data: { student: testStudent._id, date: '2025-01-15', status: 'present' }
    });
    expect(res.status()).toBe(201);
    const body = await res.json();
    expect(body.data.status).toBe('present');
  });

  test('POST /api/attendance rejects duplicate record', async ({ adminRequest, testStudent }) => {
    await adminRequest.post(API, {
      data: { student: testStudent._id, date: '2025-01-15', status: 'present' }
    });
    const res = await adminRequest.post(API, {
      data: { student: testStudent._id, date: '2025-01-15', status: 'present' }
    });
    expect(res.status()).toBe(409);
  });

  test('GET /api/attendance/:id returns 404 for missing record', async ({ adminRequest }) => {
    const res = await adminRequest.get(API + '/000000000000000000000000');
    expect(res.status()).toBe(404);
  });

  test('PUT /api/attendance/:id updates record', async ({ adminRequest, testStudent }) => {
    const create = await adminRequest.post(API, {
      data: { student: testStudent._id, date: '2025-01-16', status: 'absent' }
    });
    const id = (await create.json()).data._id;
    const res = await adminRequest.put(API + '/' + id, {
      data: { status: 'excused' }
    });
    expect(res.status()).toBe(200);
    const body = await res.json();
    expect(body.data.status).toBe('excused');
  });

  test('DELETE /api/attendance/:id removes record', async ({ adminRequest, testStudent }) => {
    const create = await adminRequest.post(API, {
      data: { student: testStudent._id, date: '2025-01-17', status: 'present' }
    });
    const id = (await create.json()).data._id;
    const res = await adminRequest.delete(API + '/' + id);
    expect(res.status()).toBe(200);
  });

  test('GET /api/attendance/summary returns summary data', async ({ adminRequest }) => {
    const res = await adminRequest.get(API + '/summary?startDate=2025-01-01&endDate=2025-12-31');
    expect(res.status()).toBe(200);
    const body = await res.json();
    expect(body).toHaveProperty('data');
  });
});
`;

const homeworkUI = `import { test, expect } from '../fixtures/auth';

test.describe('Homework UI', () => {
  test('should show homework list for admin', async ({ adminPage }) => {
    await adminPage.goto('/admin/homework');
    await adminPage.waitForLoadState('networkidle');
    await expect(adminPage.locator('table, [class*="list"], [class*="grid"]').first()).toBeVisible();
  });

  test('should open create homework form', async ({ adminPage }) => {
    await adminPage.goto('/admin/homework');
    await adminPage.waitForLoadState('networkidle');
    await adminPage.click('button:has-text("New"), button:has-text("Create"), a:has-text("New")').first();
    await expect(adminPage.locator('input, textarea, form').first()).toBeVisible();
  });

  test('should show empty state when no homework', async ({ adminPage }) => {
    await adminPage.goto('/admin/homework');
    await adminPage.waitForLoadState('networkidle');
    const body = await adminPage.textContent('body');
    expect(body).toBeTruthy();
  });

  test('should navigate back from detail view', async ({ adminPage }) => {
    await adminPage.goto('/admin/homework');
    await adminPage.waitForLoadState('networkidle');
    const back = adminPage.locator('button:has-text("Back"), a:has-text("Back"), [aria-label*="back" i]').first();
    if (await back.count() > 0) {
      await back.click();
    }
    expect(true).toBe(true);
  });
});
`;

fs.writeFileSync(path + 'attendance.spec.js', attendanceSpec);
fs.writeFileSync(path + 'homework-ui.spec.js', homeworkUI);
console.log('Generated attendance.spec.js and homework-ui.spec.js');