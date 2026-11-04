import { test, expect } from '../fixtures/auth';

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
    expect([400, 401, 500]).toContain(res.status());
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
    expect([200, 401]).toContain(res.status());
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
