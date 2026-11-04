const fs = require('fs');
const dir = 'C:\\Naveen\\chesskidoo_website_cb\\e2e\\specs';

const fileNegBoundary = `
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
      body: '------test\\r\\nContent-Disposition: form-data; name="field"\\r\\n\\r\\nvalue\\r\\n------test--\\r\\n',
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
    expect(keys.size).toBe(5);
  });
});
`;

fs.appendFileSync(dir + '\\homework.spec.js', fileNegBoundary);
console.log('appended file negative+boundary');