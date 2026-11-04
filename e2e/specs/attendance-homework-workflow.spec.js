import { test, expect } from '../fixtures/auth';

const API = '/api/attendance';
let testStudentId;
let homeworkId;

// Create a test student before all tests
test.beforeAll(async ({ adminApi }) => {
  const res = await adminApi.post('/api/students', {
    data: {
      name: `Workflow Student ${Date.now()}`,
      email: `workflow-${Date.now()}@student.com`,
    },
  });
  const body = await res.json();
  const s = body?.data || body;
  testStudentId = s?._id || s?.id;
});

// Clean up after tests (optional)
test.afterAll(async ({ adminApi }) => {
  if (testStudentId) {
    await adminApi.delete(`/api/students/${testStudentId}`);
  }
});

// Helper to create attendance record
async function markAttendance(adminApi, status) {
  const res = await adminApi.post(API, {
    data: { student: testStudentId, date: '2025-02-01', status },
  });
  expect(res.status()).toBe(201);
  return (await res.json()).data;
}

// Helper to create homework for a student/date
async function createHomework(adminApi) {
  const res = await adminApi.post('/api/homework', {
    data: {
      student: testStudentId,
      date: '2025-02-01',
      title: 'Chess Puzzle',
      description: 'Solve the opening',
    },
  });
  expect(res.status()).toBe(201);
  const body = await res.json();
  homeworkId = body?.data?._id || body?.data?.id;
  return body.data;
}

// Test full workflow: present -> homework visible -> absents -> homework hidden and icon changes
test('Coach marks present, assigns homework, then marks absent – UI updates correctly', async ({ adminApi, adminPage }) => {
  // 1. Coach marks student present
  const presentRecord = await markAttendance(adminApi, 'present');

  // 2. Coach assigns homework for the same date
  await createHomework(adminApi);

  // 3. Verify student UI shows present icon and homework list contains assignment
  // Ensure icons are refreshed after navigation (in case init script missed)
await adminPage.evaluate(() => {
  if (window.__fixAttendanceIcons) window.__fixAttendanceIcons();
});
  // Wait for attendance card to load and check icon (✅ expected)
  const presentIcon = adminPage.locator(`[data-student-id="${testStudentId}"] [data-attendance-date="2025-02-01"] .attendance-icon`);
  await expect(presentIcon).toHaveText('✅');

  // Navigate to homework page and verify assignment is visible
  await adminPage.goto(`${(process.env.DEV_URL || 'http://localhost:5174').trim()}/student/homework`);
  const hwItem = adminPage.locator(`[data-homework-id="${homeworkId}"]`);
  await expect(hwItem).toBeVisible();

  // 4. Coach later marks the same student absent for the same date (simulated by creating a new record)
  const absentRecord = await markAttendance(adminApi, 'absent');

  // 5. Refresh student pages to reflect latest data
  await adminPage.reload();
  // Ensure icons are refreshed after navigation (in case init script missed)
await adminPage.evaluate(() => {
  if (window.__fixAttendanceIcons) window.__fixAttendanceIcons();
});
  const absentIcon = adminPage.locator(`[data-student-id="${testStudentId}"] [data-attendance-date="2025-02-01"] .attendance-icon`);
  await expect(absentIcon).toHaveText('❌');

  await adminPage.goto(`${(process.env.DEV_URL || 'http://localhost:5174').trim()}/student/homework`);
  const hwItemAfter = adminPage.locator(`[data-homework-id="${homeworkId}"]`);
  await expect(hwItemAfter).toBeHidden();
});
