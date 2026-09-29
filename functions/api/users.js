export default {
  async fetch(request, env) {
    const url = new URL(request.url);
    const id = url.searchParams.get('id');
    const method = request.method;

    if (request.method === 'OPTIONS') {
      return new Response(null, { status: 200, headers: cors() });
    }

    if (method === 'GET' && id) {
      return getOne(env, id);
    }

    if (method === 'GET') {
      return getAll(env, url);
    }

    if (method === 'POST') {
      return create(request, env);
    }

    if (method === 'PUT' || method === 'PATCH') {
      return update(request, env);
    }

    if (method === 'DELETE') {
      return remove(env, id);
    }

    return new Response('Method Not Allowed', { status: 405, headers: cors() });
  }
};

function cors() {
  return {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, POST, PUT, PATCH, DELETE, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization'
  };
}

function getUser(request, env) {
  const auth = request.headers.get('Authorization');
  const token = auth?.replace('Bearer ', '');
  if (!token) throw new Error('No token');

  return env.DB.prepare(
    'SELECT user_id, role FROM sessions WHERE id = ? AND expires_at > datetime("now")'
  ).first(token);
}

async function getAll(env, url) {
  const role = url.searchParams.get('role');
  const coach = url.searchParams.get('coach');
  const batch = url.searchParams.get('batch');
  const search = url.searchParams.get('search');

  let query = 'SELECT id, userid, email, full_name, role, phone_number, city, level, rating, coach, batch, session, status, due_date, join_date, age, grade, photo, payment_status, xp, classes, streak_count, created_at FROM users WHERE 1=1';
  const params = [];

  if (role) { query += ' AND role = ?'; params.push(role); }
  if (coach) { query += ' AND coach = ?'; params.push(coach); }
  if (batch) { query += ' AND batch = ?'; params.push(batch); }
  if (search) { query += ' AND (full_name LIKE ? OR email LIKE ? OR userid LIKE ?)'; params.push(`%${search}%`, `%${search}%`, `%${search}%`); }

  query += ' ORDER BY created_at DESC';

  const { results } = await env.DB.prepare(query).bind(...params).all();
  return json(200, { data: results });
}

async function getOne(env, id) {
  const user = await env.DB.prepare(
    'SELECT id, userid, email, full_name, role, phone_number, city, level, rating, coach, batch, session, status, due_date, join_date, age, grade, photo, certificate, payment_status, xp, classes, streak_count, created_at FROM users WHERE id = ?'
  ).first(id);

  if (!user) return json(404, { error: 'Not found' });
  return json(200, user);
}

async function create(request, env) {
  const body = await request.json();

  const id = body.id || `user-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
  const now = new Date().toISOString();

  const { data, error } = await env.DB.prepare(
    `INSERT INTO users (id, userid, email, full_name, role, phone_number, city, level, rating, coach, batch, session, status, due_date, join_date, age, grade, photo, certificate, payment_status, xp, classes, streak_count, created_at)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`
  ).bind(
    id,
    body.userid || null,
    body.email || null,
    body.full_name || null,
    body.role || 'student',
    body.phone_number || null,
    body.city || null,
    body.level || null,
    body.rating ?? 800,
    body.coach || null,
    body.batch || null,
    body.session || null,
    body.status || null,
    body.due_date || null,
    body.join_date || null,
    body.age ?? null,
    body.grade || null,
    body.photo || null,
    body.certificate || null,
    body.payment_status || null,
    body.xp ?? 0,
    body.classes ?? 0,
    body.streak_count ?? 0,
    now
  ).run();

  if (error) return json(500, { error: error.message });

  const user = await env.DB.prepare('SELECT * FROM users WHERE id = ?').first(id);
  return json(201, user);
}

async function update(request, env) {
  const body = await request.json();
  const id = body.id;
  if (!id) return json(400, { error: 'ID required' });

  const fields = [];
  const values = [];

  const allowed = ['userid', 'email', 'full_name', 'role', 'phone_number', 'city', 'level', 'rating', 'coach', 'batch', 'session', 'status', 'due_date', 'join_date', 'age', 'grade', 'photo', 'certificate', 'payment_status', 'xp', 'classes', 'streak_count', 'last_note', 'childEmail', 'childId', 'child_id', 'timetable', 'revenue', 'srs_data', 'auth_id', 'fide_rating', 'session_type', 'puzzle', 'game', 'star'];

  for (const key of allowed) {
    if (key in body) {
      fields.push(`${key} = ?`);
      values.push(body[key]);
    }
  }

  if (!fields.length) return json(400, { error: 'No fields to update' });

  values.push(id);
  await env.DB.prepare(`UPDATE users SET ${fields.join(', ')} WHERE id = ?`).bind(...values).run();

  const user = await env.DB.prepare('SELECT * FROM users WHERE id = ?').first(id);
  return json(200, user);
}

async function remove(env, id) {
  if (!id) return json(400, { error: 'ID required' });
  await env.DB.prepare('DELETE FROM users WHERE id = ?').bind(id).run();
  return json(200, { success: true });
}

function json(status, body) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { 'Content-Type': 'application/json', ...cors() }
  });
}
