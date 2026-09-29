export default {
  async fetch(request, env) {
    const url = new URL(request.url);

    if (request.method === 'OPTIONS') {
      return new Response(null, { status: 200, headers: cors() });
    }

    if (request.method === 'GET' && url.pathname === '/api/auth/me') {
      return handleMe(request, env);
    }

    if (request.method === 'POST' && url.pathname === '/api/auth/login') {
      return handleLogin(request, env);
    }

    if (request.method === 'POST' && url.pathname === '/api/auth/register') {
      return handleRegister(request, env);
    }

    if (request.method === 'POST' && url.pathname === '/api/auth/logout') {
      return handleLogout(request, env);
    }

    if (url.pathname === '/api/query') {
      return handleQuery(request, env);
    }

    if (url.pathname === '/api/mutate') {
      return handleMutate(request, env);
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

const ALLOWED_TABLES = [
  'users', 'expenses', 'document', 'attendance', 'ratings', 'tourRatings',
  'resources', 'meetings', 'leads', 'coach_notes', 'credentials', 'batch_links',
  'classes', 'monthly_reports', 'puzzle_scores', 'coach_attendance',
  'assignments', 'hw_submissions', 'feedback', 'broadcasts', 'sessions'
];

async function handleLogin(request, env) {
  try {
    const body = await request.json();
    const username = String(body.username || body.email || '').trim();
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

async function handleQuery(request, env) {
  const url = new URL(request.url);
  const table = url.searchParams.get('table');
  const op = url.searchParams.get('op') || 'select';
  const cols = url.searchParams.get('cols') || '*';

  if (!table || !ALLOWED_TABLES.includes(table)) {
    return json(400, { error: 'Invalid table' });
  }

  try {
    if (op === 'select') {
      let query = `SELECT ${cols} FROM ${table} WHERE 1=1`;
      const params = [];

      for (const [key, value] of url.searchParams) {
        if (key.startsWith('filter_')) {
          const parts = key.split('_');
          const filterOp = parts[1];
          const field = parts.slice(2).join('_');
          query += ` AND ${field} ${filterOpToSQL(filterOp)} ?`;
          params.push(value);
        }
      }

      const sortField = url.searchParams.get('sort');
      const sortOrder = url.searchParams.get('order') || 'asc';
      if (sortField) {
        query += ` ORDER BY ${sortField} ${sortOrder === 'desc' ? 'DESC' : 'ASC'}`;
      }

      const limit = url.searchParams.get('limit');
      if (limit) {
        query += ' LIMIT ?';
        params.push(parseInt(limit));
      }

      const { results } = await env.DB.prepare(query).bind(...params).all();
      return json(200, { data: results });
    }

    return json(400, { error: 'Unsupported operation' });
  } catch (e) {
    return json(500, { error: e.message });
  }
}

async function handleMutate(request, env) {
  try {
    const body = await request.json();
    const { table, op, data } = body;

    if (!table || !ALLOWED_TABLES.includes(table)) {
      return json(400, { error: 'Invalid table' });
    }

    if (op === 'insert' && data) {
      const keys = Object.keys(data);
      const placeholders = keys.map(() => '?').join(', ');
      const values = keys.map(k => {
        const v = data[k];
        if (typeof v === 'object' && v !== null) return JSON.stringify(v);
        return v;
      });

      const id = data.id || `${table.slice(0, 4)}-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
      keys.push('id');
      values.unshift(id);
      const allPlaceholders = keys.map(() => '?').join(', ');

      await env.DB.prepare(`INSERT INTO ${table} (${keys.join(', ')}) VALUES (${allPlaceholders})`).bind(...values).run();

      const row = await env.DB.prepare(`SELECT * FROM ${table} WHERE id = ?`).first(id);
      return json(201, { data: row });
    }

    if (op === 'update' && data) {
      const id = data.id;
      if (!id) return json(400, { error: 'ID required' });

      const fields = [];
      const values = [];
      for (const [key, value] of Object.entries(data)) {
        if (key === 'id') continue;
        fields.push(`${key} = ?`);
        values.push(typeof value === 'object' && value !== null ? JSON.stringify(value) : value);
      }
      values.push(id);

      await env.DB.prepare(`UPDATE ${table} SET ${fields.join(', ')} WHERE id = ?`).bind(...values).run();
      const row = await env.DB.prepare(`SELECT * FROM ${table} WHERE id = ?`).first(id);
      return json(200, { data: row });
    }

    if (op === 'delete' && data?.id) {
      await env.DB.prepare(`DELETE FROM ${table} WHERE id = ?`).bind(data.id).run();
      return json(200, { success: true });
    }

    if (op === 'upsert' && data) {
      const id = data.id || `${table.slice(0, 4)}-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
      const keys = Object.keys(data);
      const placeholders = keys.map(() => '?').join(', ');
      const values = keys.map(k => {
        const v = data[k];
        if (typeof v === 'object' && v !== null) return JSON.stringify(v);
        return v;
      });

      try {
        await env.DB.prepare(`INSERT INTO ${table} (${keys.join(', ')}) VALUES (${placeholders})`).bind(...values).run();
      } catch {
        const fields = keys.filter(k => k !== 'id').map(k => `${k} = ?`).join(', ');
        const updateValues = keys.filter(k => k !== 'id').map(k => {
          const v = data[k];
          return typeof v === 'object' && v !== null ? JSON.stringify(v) : v;
        });
        await env.DB.prepare(`UPDATE ${table} SET ${fields} WHERE id = ?`).bind(...updateValues, id).run();
      }

      const row = await env.DB.prepare(`SELECT * FROM ${table} WHERE id = ?`).first(id);
      return json(200, { data: row });
    }

    return json(400, { error: 'Unsupported operation' });
  } catch (e) {
    return json(500, { error: e.message });
  }
}

function filterOpToSQL(op) {
  switch (op) {
    case 'eq': return '=';
    case 'neq': return '!=';
    case 'ilike': return 'LIKE';
    case 'in': return 'IN';
    default: return '=';
  }
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
