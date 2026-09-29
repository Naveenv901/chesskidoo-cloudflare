export default {
  async fetch(request, env) {
    const url = new URL(request.url);
    const path = url.pathname.replace(/^\/api\/auth\/?/, '') || '';

    if (request.method === 'OPTIONS') {
      return new Response(null, { status: 200, headers: cors() });
    }

    if (request.method === 'POST' && (path === '' || path === 'login')) {
      return handleLogin(request, env);
    }

    if (request.method === 'POST' && path === 'register') {
      return handleRegister(request, env);
    }

    if (request.method === 'POST' && path === 'logout') {
      return handleLogout(request, env);
    }

    if (request.method === 'GET' && path === 'me') {
      return handleMe(request, env);
    }

    return new Response('Not Found', { status: 404, headers: cors() });
  }
};

function cors() {
  return {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, POST, PUT, PATCH, DELETE, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization'
  };
}

async function handleLogin(request, env) {
  try {
    const body = await request.json();
    const username = String(body.username || '').trim();
    const password = String(body.password || '').trim();

    if (!username || !password) {
      return json(400, { error: 'Username and password required' });
    }

    const email = username.includes('@') ? username.toLowerCase() : `${username.toLowerCase().replace(/[^a-z0-9]/g, '')}@gmail.com`;

    const userRow = await env.DB.prepare(
      'SELECT id, email, full_name, role, userid FROM users WHERE email = ?'
    ).first(email);

    if (!userRow) {
      return json(401, { success: false, error: 'Invalid credentials' });
    }

    const credRow = await env.DB.prepare(
      'SELECT password FROM credentials WHERE email = ?'
    ).first(email);

    if (!credRow) {
      return json(401, { success: false, error: 'Invalid credentials' });
    }

    const hash = await hashPassword(password);
    if (hash !== credRow.password) {
      return json(401, { success: false, error: 'Invalid credentials' });
    }

    const token = crypto.randomUUID();
    const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString();

    await env.DB.prepare(
      'INSERT INTO sessions (id, user_id, role, email, expires_at) VALUES (?, ?, ?, ?, ?)'
    ).bind(token, userRow.id, userRow.role, userRow.email, expiresAt).run();

    return json(200, {
      success: true,
      role: userRow.role,
      user: userRow.email,
      userid: userRow.userid,
      token
    });
  } catch (e) {
    return json(500, { error: 'Authentication service error' });
  }
}

async function handleRegister(request, env) {
  try {
    const body = await request.json();
    const email = String(body.email || '').trim().toLowerCase();
    const password = String(body.password || '').trim();
    const fullName = String(body.full_name || body.fullName || '').trim();
    const role = String(body.role || 'student').trim().toLowerCase();

    if (!email || !password || !fullName) {
      return json(400, { error: 'Email, password, and full name are required' });
    }

    const existing = await env.DB.prepare('SELECT id FROM users WHERE email = ?').first(email);
    if (existing) {
      return json(409, { error: 'User already exists' });
    }

    const id = crypto.randomUUID();
    const passwordHash = await hashPassword(password);

    await env.DB.prepare(
      'INSERT INTO users (id, email, full_name, role) VALUES (?, ?, ?, ?)'
    ).bind(id, email, fullName, role).run();

    await env.DB.prepare(
      'INSERT INTO credentials (email, password) VALUES (?, ?)'
    ).bind(email, passwordHash).run();

    return json(201, { success: true, user: { id, email, full_name: fullName, role } });
  } catch (e) {
    return json(500, { error: 'Registration failed' });
  }
}

async function handleLogout(request, env) {
  try {
    const auth = request.headers.get('Authorization');
    const token = auth?.replace('Bearer ', '');
    if (token) {
      await env.DB.prepare('DELETE FROM sessions WHERE id = ?').bind(token).run();
    }
    return json(200, { success: true });
  } catch {
    return json(200, { success: true });
  }
}

async function handleMe(request, env) {
  const auth = request.headers.get('Authorization');
  const token = auth?.replace('Bearer ', '');

  if (!token) {
    return json(401, { error: 'Unauthorized' });
  }

  const session = await env.DB.prepare(
    'SELECT user_id, role, email, expires_at FROM sessions WHERE id = ?'
  ).first(token);

  if (!session || new Date(session.expires_at) < new Date()) {
    return json(401, { error: 'Session expired' });
  }

  const user = await env.DB.prepare(
    'SELECT id, email, full_name, role, userid, phone_number, city, level, rating, coach, batch, status FROM users WHERE id = ?'
  ).first(session.user_id);

  if (!user) {
    return json(401, { error: 'User not found' });
  }

  return json(200, { user });
}

async function hashPassword(password) {
  const encoder = new TextEncoder();
  const data = encoder.encode(password + 'chesskidoo-salt');
  const hash = await crypto.subtle.digest('SHA-256', data);
  return Array.from(new Uint8Array(hash)).map(b => b.toString(16).padStart(2, '0')).join('');
}

function json(status, body) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { 'Content-Type': 'application/json', ...cors() }
  });
}
