export default {
  async fetch(request, env) {
    const url = new URL(request.url);
    const id = url.searchParams.get('id');

    if (request.method === 'OPTIONS') {
      return new Response(null, { status: 200, headers: cors() });
    }

    if (request.method === 'GET' && id) {
      return getOne(env, id);
    }

    if (request.method === 'GET') {
      return getAll(env, url);
    }

    if (request.method === 'POST') {
      return create(request, env);
    }

    if (request.method === 'PUT' || request.method === 'PATCH') {
      return update(request, env);
    }

    if (request.method === 'DELETE') {
      return remove(env, id);
    }

    return new Response('Method Not Allowed', { status: 405, headers: cors() });
  }
};

function cors() {
  return {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, POST, PUT, PATCH, DELETE, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization, x-portal-role, x-portal-student-id, x-portal-coach-id'
  };
}

async function getAll(env, url) {
  const coachId = url.searchParams.get('coachId');
  const level = url.searchParams.get('level');
  const batch = url.searchParams.get('batch');
  const active = url.searchParams.get('active');

  let query = 'SELECT * FROM classes WHERE 1=1';
  const params = [];

  if (coachId) { query += ' AND coachId = ?'; params.push(coachId); }
  if (level) { query += ' AND level = ?'; params.push(level); }
  if (batch) { query += ' AND batch = ?'; params.push(batch); }
  if (active !== null) { query += ' AND active = ?'; params.push(active === 'true' ? 1 : 0); }

  query += ' ORDER BY created_at DESC';
  const { results } = await env.DB.prepare(query).bind(...params).all();
  return json(200, { data: results });
}

async function getOne(env, id) {
  const row = await env.DB.prepare('SELECT * FROM classes WHERE id = ?').first(id);
  if (!row) return json(404, { error: 'Not found' });
  return json(200, row);
}

async function create(request, env) {
  const body = await request.json();
  const id = body.id || `cls-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
  const now = new Date().toISOString();

  await env.DB.prepare(
    `INSERT INTO classes (id, coachId, coachName, title, level, batch, days, time, duration, zoomLink, maxStudents, studentIds, active, createdAt, created_at)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`
  ).bind(
    id,
    body.coachId || null,
    body.coachName || null,
    body.title || null,
    body.level || null,
    body.batch || null,
    JSON.stringify(body.days || []),
    body.time || null,
    body.duration ?? null,
    body.zoomLink || null,
    body.maxStudents ?? 10,
    JSON.stringify(body.studentIds || []),
    body.active !== false ? 1 : 0,
    body.createdAt || now,
    now
  ).run();

  const row = await env.DB.prepare('SELECT * FROM classes WHERE id = ?').first(id);
  return json(201, row);
}

async function update(request, env) {
  const body = await request.json();
  const id = body.id;
  if (!id) return json(400, { error: 'ID required' });

  const fields = [];
  const values = [];

  const allowed = ['coachId', 'coachName', 'title', 'level', 'batch', 'days', 'time', 'duration', 'zoomLink', 'maxStudents', 'studentIds', 'active', 'createdAt'];
  for (const key of allowed) {
    if (key in body) {
      let val = body[key];
      if (key === 'days' || key === 'studentIds') val = JSON.stringify(val);
      fields.push(`${key} = ?`);
      values.push(val);
    }
  }

  if (!fields.length) return json(400, { error: 'No fields to update' });
  values.push(id);

  await env.DB.prepare(`UPDATE classes SET ${fields.join(', ')} WHERE id = ?`).bind(...values).run();
  const row = await env.DB.prepare('SELECT * FROM classes WHERE id = ?').first(id);
  return json(200, row);
}

async function remove(env, id) {
  if (!id) return json(400, { error: 'ID required' });
  await env.DB.prepare('DELETE FROM classes WHERE id = ?').bind(id).run();
  return json(200, { success: true });
}

function json(status, body) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { 'Content-Type': application/json, ...cors() }
  });
}

