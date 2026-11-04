const fs = require('fs');
const dir = 'C:\\Naveen\\chesskidoo_website_cb\\e2e\\specs';

const authSpec = `import { test, expect } from '../fixtures/auth';

test.describe('Authentication API - Login Positive', () => {
  test('AUTH-01: valid admin login', async ({ unauthRequest: request }) => {
    const res = await request.post('/api/auth/signin', {
      data: { email: 'admin', password: 'admin123' },
    });
    expect(res.status()).toBe(200);
    const body = await res.json();
    expect(body.success).toBe(true);
    expect(body.role).toBe('admin');
    expect(body.token).toBeTruthy();
    expect(body.userid).toBe('admin-admin');
  });

  test('AUTH-02: valid master login', async ({ unauthRequest: request }) => {
    const res = await request.post('/api/auth/signin', {
      data: { email: 'master', password: 'master123' },
    });
    expect(res.status()).toBe(200);
    const body = await res.json();
    expect(body.success).toBe(true);
    expect(body.role).toBe('master');
    expect(body.userid).toBe('admin-master');
  });

  test('AUTH-03: valid CEO login', async ({ unauthRequest: request }) => {
    const res = await request.post('/api/auth/signin', {
      data: { email: 'ceo', password: 'ceo123' },
    });
    expect(res.status()).toBe(200);
    const body = await res.json();
    expect(body.success).toBe(true);
    expect(body.role).toBe('ceo');
    expect(body.userid).toBe('admin-ceo');
  });

  test('AUTH-04: login with @ in email', async ({ unauthRequest: request }) => {
    const res = await request.post('/api/auth/signin', {
      data: { email: 'admin@gmail.com', password: 'admin123' },
    });
    expect(res.status()).toBe(200);
    const body = await res.json();
    expect(body.success).toBe(true);
  });

  test('AUTH-05: login with username (no @)', async ({ unauthRequest: request }) => {
    const res = await request.post('/api/auth/signin', {
      data: { email: 'coach', password: 'coach123' },
    });
    expect(res.status()).toBe(200);
    const body = await res.json();
    expect(body.success).toBe(true);
  });

  test('AUTH-06: mixed-case username', async ({ unauthRequest: request }) => {
    const res = await request.post('/api/auth/signin', {
      data: { email: 'ADMIN', password: 'admin123' },
    });
    expect(res.status()).toBe(200);
    const body = await res.json();
    expect(body.success).toBe(true);
  });

  test('AUTH-07: special chars stripped from username', async ({ unauthRequest: request }) => {
    const res = await request.post('/api/auth/signin', {
      data: { email: 'coach@test', password: 'coach123' },
    });
    expect(res.status()).toBe(200);
    const body = await res.json();
    expect(body.success).toBe(true);
  });

  test('AUTH-08: token is UUID v4 format', async ({ unauthRequest: request }) => {
    const res = await request.post('/api/auth/signin', {
      data: { email: 'admin', password: 'admin123' },
    });
    const body = await res.json();
    expect(body.token).toMatch(/^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/);
  });

  test('AUTH-09: whitespace trimmed from credentials', async ({ unauthRequest: request }) => {
    const res = await request.post('/api/auth/signin', {
      data: { email: '  admin  ', password: '  admin123  ' },
    });
    expect(res.status()).toBe(200);
    const body = await res.json();
    expect(body.success).toBe(true);
  });
});
`;

fs.writeFileSync(dir + '\\auth.spec.js', authSpec);
console.log('auth.spec.js: ' + authSpec.split('\\n').length + ' lines');