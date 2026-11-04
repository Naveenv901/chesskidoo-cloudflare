# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: specs\attendance-homework-workflow.spec.js >> Coach marks present, assigns homework, then marks absent – UI updates correctly
- Location: e2e\specs\attendance-homework-workflow.spec.js:53:1

# Error details

```
Error: page.goto: Protocol error (Playwright.navigate): Cannot navigate to invalid URL
Call log:
  - navigating to "http://localhost:5174 /student/attendance", waiting until "load"

```

# Test source

```ts
  1  | import { test, expect } from '../fixtures/auth';
  2  | 
  3  | const API = '/api/attendance';
  4  | let testStudentId;
  5  | let homeworkId;
  6  | 
  7  | // Create a test student before all tests
  8  | test.beforeAll(async ({ adminApi }) => {
  9  |   const res = await adminApi.post('/api/students', {
  10 |     data: {
  11 |       name: `Workflow Student ${Date.now()}`,
  12 |       email: `workflow-${Date.now()}@student.com`,
  13 |     },
  14 |   });
  15 |   const body = await res.json();
  16 |   const s = body?.data || body;
  17 |   testStudentId = s?._id || s?.id;
  18 | });
  19 | 
  20 | // Clean up after tests (optional)
  21 | test.afterAll(async ({ adminApi }) => {
  22 |   if (testStudentId) {
  23 |     await adminApi.delete(`/api/students/${testStudentId}`);
  24 |   }
  25 | });
  26 | 
  27 | // Helper to create attendance record
  28 | async function markAttendance(adminApi, status) {
  29 |   const res = await adminApi.post(API, {
  30 |     data: { student: testStudentId, date: '2025-02-01', status },
  31 |   });
  32 |   expect(res.status()).toBe(201);
  33 |   return (await res.json()).data;
  34 | }
  35 | 
  36 | // Helper to create homework for a student/date
  37 | async function createHomework(adminApi) {
  38 |   const res = await adminApi.post('/api/homework', {
  39 |     data: {
  40 |       student: testStudentId,
  41 |       date: '2025-02-01',
  42 |       title: 'Chess Puzzle',
  43 |       description: 'Solve the opening',
  44 |     },
  45 |   });
  46 |   expect(res.status()).toBe(201);
  47 |   const body = await res.json();
  48 |   homeworkId = body?.data?._id || body?.data?.id;
  49 |   return body.data;
  50 | }
  51 | 
  52 | // Test full workflow: present -> homework visible -> absents -> homework hidden and icon changes
  53 | test('Coach marks present, assigns homework, then marks absent – UI updates correctly', async ({ adminApi, adminPage }) => {
  54 |   // 1. Coach marks student present
  55 |   const presentRecord = await markAttendance(adminApi, 'present');
  56 | 
  57 |   // 2. Coach assigns homework for the same date
  58 |   await createHomework(adminApi);
  59 | 
  60 |   // 3. Verify student UI shows present icon and homework list contains assignment
> 61 |   await adminPage.goto(`${process.env.DEV_URL || 'http://localhost:1573'}/student/attendance`);
     |                   ^ Error: page.goto: Protocol error (Playwright.navigate): Cannot navigate to invalid URL
  62 |   // Wait for attendance card to load and check icon (✅ expected)
  63 |   const presentIcon = adminPage.locator(`[data-student-id="${testStudentId}"] [data-attendance-date="2025-02-01"] .attendance-icon`);
  64 |   await expect(presentIcon).toHaveText('✅');
  65 | 
  66 |   // Navigate to homework page and verify assignment is visible
  67 |   await adminPage.goto(`${process.env.DEV_URL || 'http://localhost:1573'}/student/homework`);
  68 |   const hwItem = adminPage.locator(`[data-homework-id="${homeworkId}"]`);
  69 |   await expect(hwItem).toBeVisible();
  70 | 
  71 |   // 4. Coach later marks the same student absent for the same date (simulated by creating a new record)
  72 |   const absentRecord = await markAttendance(adminApi, 'absent');
  73 | 
  74 |   // 5. Refresh student pages to reflect latest data
  75 |   await adminPage.reload();
  76 |   await adminPage.goto(`${process.env.DEV_URL || 'http://localhost:1573'}/student/attendance`);
  77 |   const absentIcon = adminPage.locator(`[data-student-id="${testStudentId}"] [data-attendance-date="2025-02-01"] .attendance-icon`);
  78 |   await expect(absentIcon).toHaveText('❌');
  79 | 
  80 |   await adminPage.goto(`${process.env.DEV_URL || 'http://localhost:1573'}/student/homework`);
  81 |   const hwItemAfter = adminPage.locator(`[data-homework-id="${homeworkId}"]`);
  82 |   await expect(hwItemAfter).toBeHidden();
  83 | });
  84 | 
```