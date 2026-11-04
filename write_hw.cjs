const fs = require('fs');
const dir = 'C:\\Naveen\\chesskidoo_website_cb\\e2e\\specs';

const homeworkPos = `import { test, expect } from '../fixtures/auth';
import { uid, expectError, expectSuccess, expectDataArray } from '../helpers/api';

test.describe('Homework API - Assignment Creation (Positive)', () => {
  test('HW-01: create assignment targeting a batch', async ({ adminRequest }) => {
    const id = uid('asn');
    const res = await adminRequest.request.post('/api/homework', {
      data: { id, title: 'Tactics', target_type: 'batch', batch_id: 'batch-001', due_date: '2026-11-15' },
    });
    expect(res.status()).toBe(201);
    const body = await res.json();
    expect(body.success).toBe(true);
    expect(body.data.target_type).toBe('batch');
    expect(body.data.batch_id).toBe('batch-001');
  });

  test('HW-02: create assignment targeting a student', async ({ adminRequest }) => {
    const id = uid('asn');
    const res = await adminRequest.request.post('/api/homework', {
      data: { id, title: 'Endgame', target_type: 'student', student_id: 'student-001' },
    });
    expect(res.status()).toBe(201);
    const body = await res.json();
    expect(body.data.target_type).toBe('student');
    expect(body.data.student_id).toBe('student-001');
  });

  test('HW-03: create assignment targeting all students', async ({ adminRequest }) => {
    const id = uid('asn');
    const res = await adminRequest.request.post('/api/homework', {
      data: { id, title: 'General', target_type: 'all' },
    });
    expect(res.status()).toBe(201);
    const body = await res.json();
    expect(body.data.target_type).toBe('all');
  });

  test('HW-04: create with file attachments', async ({ adminRequest }) => {
    const id = uid('asn');
    const res = await adminRequest.request.post('/api/homework', {
      data: { id, title: 'PGN Study', attachment_urls: ['url1', 'url2'] },
    });
    expect(res.status()).toBe(201);
    const body = await res.json();
    const files = JSON.parse(body.data.questions_files || '[]');
    expect(files).toContain('url1');
    expect(files).toContain('url2');
  });

  test('HW-05: create with PGN data', async ({ adminRequest }) => {
    const id = uid('asn');
    const res = await adminRequest.request.post('/api/homework', {
      data: { id, title: 'Game Analysis', pgn: '1. e4 e5 2. Nf3' },
    });
    expect(res.status()).toBe(201);
    const body = await res.json();
    expect(body.data.pgn).toBe('1. e4 e5 2. Nf3');
  });

  test('HW-06: create with max_marks', async ({ adminRequest }) => {
    const id = uid('asn');
    const res = await adminRequest.request.post('/api/homework', {
      data: { id, title: 'Test', max_marks: 100 },
    });
    expect(res.status()).toBe(201);
    const body = await res.json();
    expect(body.data.max_marks).toBe(100);
  });

  test('HW-07: create with coach_id', async ({ adminRequest }) => {
    const id = uid('asn');
    const res = await adminRequest.request.post('/api/homework', {
      data: { id, title: 'Review', coach_id: 'coach-001' },
    });
    expect(res.status()).toBe(201);
    const body = await res.json();
    expect(body.data.coach_id).toBe('coach-001');
  });

  test('HW-08: create with future due date', async ({ adminRequest }) => {
    const id = uid('asn');
    const res = await adminRequest.request.post('/api/homework', {
      data: { id, title: 'Future HW', due_date: '2027-01-01' },
    });
    expect(res.status()).toBe(201);
    const body = await res.json();
    expect(body.data.due_date).toBe('2027-01-01');
  });

  test('HW-09: create with description', async ({ adminRequest }) => {
    const id = uid('asn');
    const res = await adminRequest.request.post('/api/homework', {
      data: { id, title: 'Desc Test', description: 'Solve chapter 5 problems' },
    });
    expect(res.status()).toBe(201);
    const body = await res.json();
    expect(body.data.description).toBe('Solve chapter 5 problems');
  });

  test('HW-10: create with status active', async ({ adminRequest }) => {
    const id = uid('asn');
    const res = await adminRequest.request.post('/api/homework', {
      data: { id, title: 'Active HW', status: 'active' },
    });
    expect(res.status()).toBe(201);
    const body = await res.json();
    expect(body.data.status).toBe('active');
  });

  test('HW-11: create with status archived', async ({ adminRequest }) => {
    const id = uid('asn');
    const res = await adminRequest.request.post('/api/homework', {
      data: { id, title: 'Archived HW', status: 'archived' },
    });
    expect(res.status()).toBe(201);
    const body = await res.json();
    expect(body.data.status).toBe('archived');
  });

  test('HW-12: create with created_by', async ({ adminRequest }) => {
    const id = uid('asn');
    const res = await adminRequest.request.post('/api/homework', {
      data: { id, title: 'By Admin', created_by: 'admin-001' },
    });
    expect(res.status()).toBe(201);
    const body = await res.json();
    expect(body.data.created_by).toBe('admin-001');
  });

  test('HW-13: assignment appears in GET list', async ({ adminRequest }) => {
    const id = uid('asn');
    await adminRequest.request.post('/api/homework', {
      data: { id, title: 'List Test HW', target_type: 'all' },
    });
    const res = await adminRequest.request.get('/api/homework');
    expect(res.status()).toBe(200);
    const body = await res.json();
    expect(Array.isArray(body.data)).toBe(true);
    const found = body.data.find(a => a.id === id);
    expect(found).toBeTruthy();
    expect(found.title).toBe('List Test HW');
  });

  test('HW-14: create with present_student_ids', async ({ adminRequest }) => {
    const id = uid('asn');
    const res = await adminRequest.request.post('/api/homework', {
      data: { id, title: 'Present IDs', target_type: 'all', present_student_ids: ['s1', 's2'] },
    });
    expect(res.status()).toBe(201);
    const body = await res.json();
    const ids = JSON.parse(body.data.present_student_ids || '[]');
    expect(ids).toContain('s1');
    expect(ids).toContain('s2');
  });
});
`;

fs.writeFileSync(dir + '\\homework.spec.js', homeworkPos);
console.log('homework.spec.js base written');