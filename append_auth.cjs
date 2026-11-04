const fs = require('fs');
const dir = 'C:\\Naveen\\chesskidoo_website_cb\\e2e\\specs';

const authNegative = `
test.describe('Authentication API - Negative Tests', () => {
  test('AUTH-10: non-existent user', async ({ unauthRequest: request }) => {
    const res = await request.post('/api/auth/signin', {
      data: { email: 'nonexistent@test.com', password: 'any123' },
    });
    expect(res.status()).toBe(401);
    const body = await res.json();
    expect(body.success).toBe(false);
    expect(body.error).toBe('Invalid credentials');
  });

  test('AUTH-11: correct user, wrong password', async ({ unauthRequest: request }) => {
    const res = await request.post('/api/auth/signin', {
      data: { email: 'admin', password: 'wrongpassword' },
    });
    expect(res.status()).toBe(401);
    const body = await res.json();
    expect(body.error).toBe('Invalid credentials');
  });

  test('AUTH-12: correct password, wrong user', async ({ unauthRequest: request }) => {
    const res = await request.post('/api/auth/signin', {
      data: { email: 'nobody', password: 'admin123' },
    });
    expect(res.status()).toBe(401);
    const body = await res.json();
    expect(body.error).toBe('Invalid credentials');
  });

  test('AUTH-13: empty email', async ({ unauthRequest: request }) => {
    const res = await request.post('/api/auth/signin', {
      data: { email: '', password: 'admin123' },
    });
    expect(res.status()).toBe(400);
    const body = await res.json();
    expect(body.error).toContain('Username and password required');
  });

  test('AUTH-14: empty password', async ({ unauthRequest: request }) => {
    const res = await request.post('/api/auth/signin', {
      data: { email: 'admin', password: '' },
    });
    expect(res.status()).toBe(400);
    const body = await res.json();
    expect(body.error).toContain('Username and password required');
  });

  test('AUTH-15: both empty', async ({ unauthRequest: request }) => {
    const res = await request.post('/api/auth/signin', {
      data: { email: '', password: '' },
    });
    expect(res.status()).toBe(400);
    const body = await res.json();
    expect(body.error).toContain('Username and password required');
  });

  test('AUTH-16: missing email field', async ({ unauthRequest: request }) => {
    const res = await request.post('/api/auth/signin', {
      data: { password: 'admin123' },
    });
    expect(res.status()).toBe(400);
    const body = await res.json();
    expect(body.error).toContain('Username and password required');
  });

  test('AUTH-17: missing password field', async ({ unauthRequest: request }) => {
    const res = await request.post('/api/auth/signin', {
      data: { email: 'admin' },
    });
    expect(res.status()).toBe(400);
    const body = await res.json();
    expect(body.error).toContain('Username and password required');
  });

  test('AUTH-18: empty JSON body', async ({ unauthRequest: request }) => {
    const res = await request.post('/api/auth/signin', {
      data: {},
    });
    expect(res.status()).toBe(400);
    const body = await res.json();
    expect(body.error).toContain('Username and password required');
  });

  test('AUTH-19: null email', async ({ unauthRequest: request }) => {
    const res = await request.post('/api/auth/signin', {
      data: { email: null, password: 'admin123' },
    });
    expect(res.status()).toBe(400);
  });

  test('AUTH-20: null password', async ({ unauthRequest: request }) => {
    const res = await request.post('/api/auth/signin', {
      data: { email: 'admin', password: null },
    });
    expect(res.status()).toBe(400);
  });

  test('AUTH-21: non-string email (number)', async ({ unauthRequest: request }) => {
    const res = await request.post('/api/auth/signin', {
      data: { email: 12345, password: 'admin123' },
    });
    expect([400, 500]).toContain(res.status());
  });

  test('AUTH-22: extra fields ignored', async ({ unauthRequest: request }) => {
    const res = await request.post('/api/auth/signin', {
      data: { email: 'admin', password: 'admin123', extra: 'field' },
    });
    expect(res.status()).toBe(200);
    const body = await res.json();
    expect(body.success).toBe(true);
  });
});
`;

fs.appendFileSync(dir + '\\auth.spec.js', authNegative);
console.log('appended negative tests');