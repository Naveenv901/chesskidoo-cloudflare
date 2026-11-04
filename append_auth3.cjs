const fs = require('fs');
const dir = 'C:\\Naveen\\chesskidoo_website_cb\\e2e\\specs';

const authSession = `
test.describe('Authentication API - Token and Session', () => {
  test('AUTH-31: valid token accesses profile', async ({ adminRequest }) => {
    const res = await adminRequest.request.get('/api/auth/profile');
    expect(res.status()).toBe(200);
    const body = await res.json();
    expect(body).toHaveProperty('user');
    expect(body.user).toHaveProperty('email');
  });

  test('AUTH-32: missing token on protected endpoint', async ({ unauthRequest: request }) => {
    const res = await request.get('/api/auth/profile');
    expect(res.status()).toBe(401);
    const body = await res.json();
    expect(body.error).toBe('Unauthorized');
  });

  test('AUTH-33: malformed token (no Bearer prefix)', async ({ unauthRequest: request }) => {
    const res = await request.get('/api/auth/profile', {
      headers: { Authorization: 'token123' },
    });
    expect(res.status()).toBe(401);
  });

  test('AUTH-34: invalid token format', async ({ unauthRequest: request }) => {
    const res = await request.get('/api/auth/profile', {
      headers: { Authorization: 'Bearer invalid-token-xyz' },
    });
    expect(res.status()).toBe(401);
  });

  test('AUTH-35: expired token returns session expired', async ({ unauthRequest: request }) => {
    const res = await request.get('/api/auth/profile', {
      headers: { Authorization: 'Bearer expired-fake-token-12345' },
    });
    expect(res.status()).toBe(401);
    const body = await res.json();
    expect(body.error).toBe('Session expired');
  });

  test('AUTH-36: logout invalidates token', async ({ unauthRequest: request }) => {
    const loginRes = await request.post('/api/auth/signin', {
      data: { email: 'admin', password: 'admin123' },
    });
    const loginBody = await loginRes.json();
    const token = loginBody.token;

    const logoutRes = await request.post('/api/auth/signout', {
      headers: { Authorization: 'Bearer ' + token },
    });
    expect(logoutRes.status()).toBe(200);

    const profileRes = await request.get('/api/auth/profile', {
      headers: { Authorization: 'Bearer ' + token },
    });
    expect(profileRes.status()).toBe(401);
  });

  test('AUTH-37: logout without token', async ({ unauthRequest: request }) => {
    const res = await request.post('/api/auth/signout');
    expect(res.status()).toBe(200);
    const body = await res.json();
    expect(body.success).toBe(true);
  });

  test('AUTH-38: logout with invalid token', async ({ unauthRequest: request }) => {
    const res = await request.post('/api/auth/signout', {
      headers: { Authorization: 'Bearer fake-token' },
    });
    expect(res.status()).toBe(200);
    const body = await res.json();
    expect(body.success).toBe(true);
  });

  test('AUTH-39: token uniqueness per login', async ({ unauthRequest: request }) => {
    const res1 = await request.post('/api/auth/signin', {
      data: { email: 'admin', password: 'admin123' },
    });
    const res2 = await request.post('/api/auth/signin', {
      data: { email: 'admin', password: 'admin123' },
    });
    const body1 = await res1.json();
    const body2 = await res2.json();
    expect(body1.token).not.toBe(body2.token);
  });

  test('AUTH-40: concurrent sessions', async ({ unauthRequest: request }) => {
    const tokens = [];
    for (let i = 0; i < 3; i++) {
      const res = await request.post('/api/auth/signin', {
        data: { email: 'admin', password: 'admin123' },
      });
      const body = await res.json();
      tokens.push(body.token);
    }
    expect(new Set(tokens).size).toBe(3);
    for (const token of tokens) {
      const res = await request.get('/api/auth/profile', {
        headers: { Authorization: 'Bearer ' + token },
      });
      expect(res.status()).toBe(200);
    }
  });
});
`;

fs.appendFileSync(dir + '\\auth.spec.js', authSession);
console.log('appended session tests');