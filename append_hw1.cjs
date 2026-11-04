const fs = require('fs');
const dir = 'C:\\Naveen\\chesskidoo_website_cb\\e2e\\specs';

const uploadPos = `
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
`;

fs.appendFileSync(dir + '\\homework.spec.js', uploadPos);
console.log('appended upload positive');