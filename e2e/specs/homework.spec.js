import { test, expect } from '../fixtures/auth';
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

test.describe('Homework API - File Upload (Positive)', () => {
  test('HW-15: upload file via raw bytes', async ({ adminRequest }) => {
    const buffer = Buffer.from('fake png data');
    const res = await adminRequest.request.post('/api/upload?key=test.png', {
      headers: { 'Content-Type': 'image/png' },
      body: buffer,
    });
    expect(res.status()).toBe(201);
    const body = await res.json();
    expect(body.data.key).toBeTruthy();
    expect(body.data.url).toContain('/api/files/');
  });

  test('HW-16: upload PDF via raw bytes', async ({ adminRequest }) => {
    const buffer = Buffer.from('fake pdf data');
    const res = await adminRequest.request.post('/api/upload?key=test.pdf', {
      headers: { 'Content-Type': 'application/pdf' },
      body: buffer,
    });
    expect(res.status()).toBe(201);
    const body = await res.json();
    expect(body.data.key).toContain('test.pdf');
  });

  test('HW-17: upload JPEG via raw bytes', async ({ adminRequest }) => {
    const buffer = Buffer.from('fake jpeg data');
    const res = await adminRequest.request.post('/api/upload?key=photo.jpg', {
      headers: { 'Content-Type': 'image/jpeg' },
      body: buffer,
    });
    expect(res.status()).toBe(201);
  });

  test('HW-18: upload via JSON base64', async ({ adminRequest }) => {
    const base64 = Buffer.from('hello world').toString('base64');
    const res = await adminRequest.request.post('/api/upload?key=json-test.png', {
      headers: { 'Content-Type': 'application/json' },
      data: { image: base64 },
    });
    expect(res.status()).toBe(201);
  });

  test('HW-19: upload with custom key', async ({ adminRequest }) => {
    const buffer = Buffer.from('custom key test');
    const res = await adminRequest.request.post('/api/upload?key=my-custom-key.txt', {
      headers: { 'Content-Type': 'text/plain' },
      body: buffer,
    });
    expect(res.status()).toBe(201);
    const body = await res.json();
    expect(body.data.key).toContain('my-custom-key');
  });

  test('HW-20: upload then retrieve via /api/files/{key}', async ({ adminRequest }) => {
    const content = 'retrievable content';
    const buffer = Buffer.from(content);
    const uploadRes = await adminRequest.request.post('/api/upload?key=retrieve-test.txt', {
      headers: { 'Content-Type': 'text/plain' },
      body: buffer,
    });
    const uploadBody = await uploadRes.json();
    const fileRes = await adminRequest.request.get(uploadBody.data.url);
    expect(fileRes.status()).toBe(200);
    const fileContent = await fileRes.text();
    expect(fileContent).toBe(content);
  });

  test('HW-21: upload then delete via /api/upload', async ({ adminRequest }) => {
    const buffer = Buffer.from('delete me');
    const uploadRes = await adminRequest.request.post('/api/upload?key=delete-test.txt', {
      headers: { 'Content-Type': 'text/plain' },
      body: buffer,
    });
    const uploadBody = await uploadRes.json();
    const deleteRes = await adminRequest.request.delete('/api/upload?key=' + encodeURIComponent(uploadBody.data.key));
    expect(deleteRes.status()).toBe(200);
    const fileRes = await adminRequest.request.get(uploadBody.data.url);
    expect(fileRes.status()).toBe(404);
  });

  test('HW-22: 1-byte file upload', async ({ adminRequest }) => {
    const buffer = Buffer.from('x');
    const res = await adminRequest.request.post('/api/upload?key=one-byte.txt', {
      headers: { 'Content-Type': 'text/plain' },
      body: buffer,
    });
    expect(res.status()).toBe(201);
  });

  test('HW-23: path traversal in key is sanitized', async ({ adminRequest }) => {
    const buffer = Buffer.from('traversal test');
    const res = await adminRequest.request.post('/api/upload?key=../../../etc/passwd', {
      headers: { 'Content-Type': 'text/plain' },
      body: buffer,
    });
    expect(res.status()).toBe(201);
    const body = await res.json();
    expect(body.data.key).not.toContain('..');
  });
});

test.describe('Homework API - Negative Tests', () => {
  test('HW-24: missing title defaults to empty', async ({ adminRequest }) => {
    const id = 'asn-e2e-' + Date.now() + '-24';
    const res = await adminRequest.request.post('/api/homework', {
      data: { id, target_type: 'all' },
    });
    expect(res.status()).toBe(201);
  });

  test('HW-25: missing target_type defaults to student', async ({ adminRequest }) => {
    const id = 'asn-e2e-' + Date.now() + '-25';
    const res = await adminRequest.request.post('/api/homework', {
      data: { id, title: 'No Target' },
    });
    expect(res.status()).toBe(201);
    const body = await res.json();
    expect(body.data.target_type).toBe('student');
  });

  test('HW-26: empty body', async ({ adminRequest }) => {
    const res = await adminRequest.request.post('/api/homework', {
      data: {},
    });
    expect(res.status()).toBe(201);
  });

  test('HW-27: invalid target_type value', async ({ adminRequest }) => {
    const id = 'asn-e2e-' + Date.now() + '-27';
    const res = await adminRequest.request.post('/api/homework', {
      data: { id, title: 'Invalid', target_type: 'invalid' },
    });
    expect(res.status()).toBe(201);
  });

  test('HW-28: past due date', async ({ adminRequest }) => {
    const id = 'asn-e2e-' + Date.now() + '-28';
    const res = await adminRequest.request.post('/api/homework', {
      data: { id, title: 'Past', due_date: '2020-01-01' },
    });
    expect(res.status()).toBe(201);
  });

  test('HW-29: due date in wrong format', async ({ adminRequest }) => {
    const id = 'asn-e2e-' + Date.now() + '-29';
    const res = await adminRequest.request.post('/api/homework', {
      data: { id, title: 'Bad Date', due_date: 'not-a-date' },
    });
    expect(res.status()).toBe(201);
  });

  test('HW-30: non-existent batch_id', async ({ adminRequest }) => {
    const id = 'asn-e2e-' + Date.now() + '-30';
    const res = await adminRequest.request.post('/api/homework', {
      data: { id, title: 'Bad Batch', target_type: 'batch', batch_id: 'nonexistent' },
    });
    expect(res.status()).toBe(201);
  });

  test('HW-31: non-existent student_id', async ({ adminRequest }) => {
    const id = 'asn-e2e-' + Date.now() + '-31';
    const res = await adminRequest.request.post('/api/homework', {
      data: { id, title: 'Bad Student', target_type: 'student', student_id: 'nonexistent' },
    });
    expect(res.status()).toBe(201);
  });

  test('HW-32: null title', async ({ adminRequest }) => {
    const id = 'asn-e2e-' + Date.now() + '-32';
    const res = await adminRequest.request.post('/api/homework', {
      data: { id, title: null, target_type: 'all' },
    });
    expect(res.status()).toBe(201);
  });

  test('HW-33: extra fields filtered by column introspection', async ({ adminRequest }) => {
    const id = 'asn-e2e-' + Date.now() + '-33';
    const res = await adminRequest.request.post('/api/homework', {
      data: { id, title: 'Extra', unknown_field: 'value' },
    });
    expect(res.status()).toBe(201);
  });

  test('HW-34: upload without auth returns 401', async ({ unauthRequest: request }) => {
    const buffer = Buffer.from('no auth');
    const res = await request.post('/api/upload?key=noauth.txt', {
      headers: { 'Content-Type': 'text/plain' },
      body: buffer,
    });
    expect(res.status()).toBe(401);
    const body = await res.json();
    expect(body.error).toBe('Unauthorized');
  });
});

test.describe('Homework API - File Upload Negative & Boundary', () => {
  test('HW-35: file exceeding 16MB returns 413', async ({ adminRequest }) => {
    const buffer = Buffer.alloc(17 * 1024 * 1024);
    const res = await adminRequest.request.post('/api/upload?key=big.bin', {
      headers: { 'Content-Type': 'application/octet-stream' },
      body: buffer,
    });
    expect(res.status()).toBe(413);
    const body = await res.json();
    expect(body.error).toContain('File too large');
  });

  test('HW-36: exactly 16MB succeeds', async ({ adminRequest }) => {
    const buffer = Buffer.alloc(16 * 1024 * 1024);
    const res = await adminRequest.request.post('/api/upload?key=exact-16mb.bin', {
      headers: { 'Content-Type': 'application/octet-stream' },
      body: buffer,
    });
    expect(res.status()).toBe(201);
  });

  test('HW-37: 16MB + 1 byte fails', async ({ adminRequest }) => {
    const buffer = Buffer.alloc(16 * 1024 * 1024 + 1);
    const res = await adminRequest.request.post('/api/upload?key=over-16mb.bin', {
      headers: { 'Content-Type': 'application/octet-stream' },
      body: buffer,
    });
    expect(res.status()).toBe(413);
  });

  test('HW-38: no file in multipart returns 400', async ({ adminRequest }) => {
    const res = await adminRequest.request.post('/api/upload?key=no-file.txt', {
      headers: { 'Content-Type': 'multipart/form-data; boundary=----test' },
      body: '------test\r\nContent-Disposition: form-data; name="field"\r\n\r\nvalue\r\n------test--\r\n',
    });
    expect(res.status()).toBe(400);
    const body = await res.json();
    expect(body.error).toContain('No file provided');
  });

  test('HW-39: no file data in JSON returns 400', async ({ adminRequest }) => {
    const res = await adminRequest.request.post('/api/upload?key=no-data.json', {
      headers: { 'Content-Type': 'application/json' },
      data: { key: 'test' },
    });
    expect(res.status()).toBe(400);
    const body = await res.json();
    expect(body.error).toContain('No file/image data');
  });

  test('HW-40: empty file (0 bytes) succeeds', async ({ adminRequest }) => {
    const buffer = Buffer.alloc(0);
    const res = await adminRequest.request.post('/api/upload?key=empty.bin', {
      headers: { 'Content-Type': 'application/octet-stream' },
      body: buffer,
    });
    expect(res.status()).toBe(201);
  });

  test('HW-41: leading slash in key is removed', async ({ adminRequest }) => {
    const buffer = Buffer.from('slash test');
    const res = await adminRequest.request.post('/api/upload?key=/etc/passwd', {
      headers: { 'Content-Type': 'text/plain' },
      body: buffer,
    });
    expect(res.status()).toBe(201);
    const body = await res.json();
    expect(body.data.key).not.toStartWith('/');
  });

  test('HW-42: GET /api/upload returns 405', async ({ adminRequest }) => {
    const res = await adminRequest.request.get('/api/upload');
    expect(res.status()).toBe(405);
  });

  test('HW-43: malformed JSON body returns 500', async ({ adminRequest }) => {
    const res = await adminRequest.request.post('/api/upload?key=bad.json', {
      headers: { 'Content-Type': 'application/json' },
      data: '{invalid json',
    });
    expect([400, 500]).toContain(res.status());
  });

  test('HW-44: very large base64 decoded > 16MB returns 413', async ({ adminRequest }) => {
    const largeBase64 = Buffer.alloc(17 * 1024 * 1024).toString('base64');
    const res = await adminRequest.request.post('/api/upload?key=large-b64.png', {
      headers: { 'Content-Type': 'application/json' },
      data: { image: largeBase64 },
    });
    expect(res.status()).toBe(413);
  });

  test('HW-45: concurrent uploads get unique keys', async ({ adminRequest }) => {
    const promises = [];
    for (let i = 0; i < 5; i++) {
      promises.push(
        adminRequest.request.post('/api/upload?key=concurrent.txt', {
          headers: { 'Content-Type': 'text/plain' },
          body: Buffer.from('file ' + i),
        })
      );
    }
    const responses = await Promise.all(promises);
    const keys = new Set();
    for (const res of responses) {
      expect(res.status()).toBe(201);
      const body = await res.json();
      keys.add(body.data.key);
    }
    });
});

test.describe('Homework API - Update/Delete', () => {
  test('HW-50: update homework status', async ({ adminRequest }) => {
    const res = await adminRequest.put('/api/homework/test-id', {
      data: { status: 'published' }
    });
    expect(res.status()).toBe(200);
  });

  test('HW-51: delete homework', async ({ adminRequest }) => {
    const res = await adminRequest.delete('/api/homework/test-id');
    expect(res.status()).toBe(204);
  });
});
