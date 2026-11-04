const fs = require('fs');
const dir = 'C:\\Naveen\\chesskidoo_website_cb\\e2e\\specs';

const authBoundary = `
test.describe('Authentication API - Boundary Value Analysis', () => {
  test('AUTH-23: single-char username', async ({ unauthRequest: request }) => {
    const res = await request.post('/api/auth/signin', {
      data: { email: 'a', password: 'admin123' },
    });
    expect(res.status()).toBe(401);
  });

  test('AUTH-24: very long username (1000 chars)', async ({ unauthRequest: request }) => {
    const res = await request.post('/api/auth/signin', {
      data: { email: 'a'.repeat(1000), password: 'admin123' },
    });
    expect(res.status()).toBe(401);
  });

  test('AUTH-25: very long password (5000 chars)', async ({ unauthRequest: request }) => {
    const res = await request.post('/api/auth/signin', {
      data: { email: 'admin', password: 'a'.repeat(5000) },
    });
    expect(res.status()).toBe(401);
  });

  test('AUTH-26: password with special characters', async ({ unauthRequest: request }) => {
    const res = await request.post('/api/auth/signin', {
      data: { email: 'admin', password: 'admin123!@#$%^&*()' },
    });
    expect(res.status()).toBe(401);
  });

  test('AUTH-27: unicode username', async ({ unauthRequest: request }) => {
    const res = await request.post('/api/auth/signin', {
      data: { email: '管理者', password: 'admin123' },
    });
    expect(res.status()).toBe(401);
  });

  test('AUTH-28: email with multiple @ signs', async ({ unauthRequest: request }) => {
    const res = await request.post('/api/auth/signin', {
      data: { email: 'admin@test@gmail.com', password: 'admin123' },
    });
    expect(res.status()).toBe(401);
  });

  test('AUTH-29: SQL injection in email', async ({ unauthRequest: request }) => {
    const res = await request.post('/api/auth/signin', {
      data: { email: "admin' OR '1'='1", password: 'admin123' },
    });
    expect(res.status()).toBe(401);
  });

  test('AUTH-30: SQL injection in password', async ({ unauthRequest: request }) => {
    const res = await request.post('/api/auth/signin', {
      data: { email: 'admin', password: "admin123' OR '1'='1" },
    });
    expect(res.status()).toBe(401);
  });
});
`;

fs.appendFileSync(dir + '\\auth.spec.js', authBoundary);
console.log('appended boundary tests');