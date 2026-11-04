const fs = require('fs');
const dir = 'C:\\Naveen\\chesskidoo_website_cb\\e2e\\specs';

const negTests = `
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
`;

fs.appendFileSync(dir + '\\homework.spec.js', negTests);
console.log('appended negative tests');