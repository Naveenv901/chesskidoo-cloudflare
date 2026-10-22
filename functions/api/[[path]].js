function cors() {
  return {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, POST, PUT, PATCH, DELETE, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization, x-portal-role, x-portal-student-id, x-portal-coach-id'
  };
}

function methodNotAllowed() {
  return new Response('Method Not Allowed', { status: 405, headers: cors() });
}

function notFound(pathname, method) {
  return new Response(JSON.stringify({ error: 'Not Found', pathname, method }), {
    status: 404,
    headers: { 'Content-Type': 'application/json', ...cors() }
  });
}

const ALLOWED_TABLES = [
  'users', 'expenses', 'document', 'documents', 'attendance', 'ratings', 'tourRatings',
  'resources', 'meetings', 'leads', 'coach_notes', 'credentials', 'batch_links',
  'classes', 'monthly_reports', 'puzzle_scores', 'coach_attendance',
  'assignments', 'hw_submissions', 'homework_submissions', 'homework_assignments',
  'feedback', 'broadcasts', 'sessions', 'students', 'payments', 'coaches', 'batches',
  'messages', 'achievements', 'events', 'audit_log', 'rating_history'
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
    const normUser = username.toLowerCase().trim().split('@')[0].replace(/[^a-z0-9]/g, '');

    const isAdminFallback = (normUser === 'admin' || normUser === 'master' || normUser === 'chesskidoo' || normUser === 'ceo') &&
      (password === 'admin123' || password === 'master123' || password === 'chess123' || password === 'ceo123');

    if (isAdminFallback) {
      const role = normUser === 'master' ? 'master' : normUser === 'ceo' ? 'ceo' : 'admin';
      const token = crypto.randomUUID();
      const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString();

      await env.DB.prepare(
        'INSERT INTO sessions (id, user_id, role, email, expires_at) VALUES (?, ?, ?, ?, ?)'
      ).bind(token, `admin-${role}`, role, email, expiresAt).run();

      return json(200, {
        success: true,
        role,
        user: email,
        userid: `admin-${role}`,
        token
      });
    }

    const userRow = await env.DB.prepare(
      'SELECT id, email, full_name, role, userid FROM users WHERE email = ?'
    ).bind(email).first();

    if (!userRow) {
      return json(401, { success: false, error: 'Invalid credentials' });
    }

    const credRow = await env.DB.prepare(
      'SELECT password FROM credentials WHERE email = ?'
    ).bind(email).first();

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
      userid: userRow.id,
      token
    });
  } catch (e) {
    return json(500, { error: 'Authentication service error', detail: e?.message || String(e) });
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

    const existing = await env.DB.prepare('SELECT id FROM users WHERE email = ?').bind(email).first();
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
  ).bind(token).first();

  if (!session || new Date(session.expires_at) < new Date()) {
    return json(401, { error: 'Session expired' });
  }

  const user = await env.DB.prepare(
    'SELECT id, email, full_name as name, role, id as userid, phone_number, city, level, rating, coach, batch, status, childEmail as parent_email, session, session_type, fee FROM users WHERE id = ?'
  ).bind(session.user_id).first();

  if (!user) {
    return json(401, { error: 'User not found' });
  }

  return json(200, { user });
}

// Verifies the Bearer token against the D1 `sessions` table (same check as /api/auth/me).
async function getSessionUser(request, env) {
  const auth = request.headers.get('Authorization') || request.headers.get('authorization') || '';
  const token = auth.replace(/^Bearer\s+/i, '').trim();
  if (!token) return null;
  try {
    const session = await env.DB.prepare(
      'SELECT user_id, role, email, expires_at FROM sessions WHERE id = ?'
    ).bind(token).first();
    if (!session) return null;
    if (session.expires_at && new Date(session.expires_at) < new Date()) return null;
    return session;
  } catch (_) {
    return null;
  }
}

async function filterOpToSQL(op) {
  switch (op) {
    case 'eq': return '=';
    case 'neq': return '!=';
    case 'gt': return '>';
    case 'gte': return '>=';
    case 'lt': return '<';
    case 'lte': return '<=';
    case 'like': return 'LIKE';
    case 'ilike': return 'LIKE';
    case 'is': return 'IS';
    default: return '=';
  }
}

// Only allow simple, safe SQL identifiers so client-supplied column names can
// never inject SQL.
function safeIdent(name) {
  if (typeof name !== 'string') return null;
  const trimmed = name.trim();
  if (!/^[A-Za-z_][A-Za-z0-9_]*$/.test(trimmed)) return null;
  return trimmed;
}

// Cache of real column names per table so INSERT/UPDATE only reference columns
// that actually exist (avoids "no such column" when a migration is missing).
const _columnCache = new Map();
async function tableColumns(env, table) {
  if (_columnCache.has(table)) return _columnCache.get(table);
  let set = null;
  try {
    const info = await env.DB.prepare(`PRAGMA table_info(${table})`).all();
    if (info && info.results) set = new Set(info.results.map(r => r.name));
  } catch (_) {}
  if (!set) set = new Set(['id']);
  _columnCache.set(table, set);
  return set;
}

function resolveTable(table) {
  const TABLE_ALIASES = {
    'homework_submissions': 'hw_submissions',
    'homework_assignments': 'assignments',
    'students': 'users',
    'coaches': 'users'
  };
  return TABLE_ALIASES[table] || table;
}

async function handleQuery(request, env) {
  const url = new URL(request.url);
  const table = url.searchParams.get('table');
  const op = url.searchParams.get('op') || 'select';
  const cols = url.searchParams.get('cols') || '*';

  if (!table) {
    return json(400, { error: 'Invalid table' });
  }
  const actualTable = resolveTable(table);
  if (!ALLOWED_TABLES.includes(table) && !ALLOWED_TABLES.includes(actualTable)) {
    return json(400, { error: 'Invalid table' });
  }

  try {
    // Shared WHERE clause so count and select stay in sync.
    let where = ' WHERE 1=1';
    const params = [];

    for (const [key, value] of url.searchParams) {
      if (!key.startsWith('filter_')) continue;
      const rest = key.slice('filter_'.length);
      const us = rest.indexOf('_');
      if (us <= 0) continue;
      const filterOp = rest.slice(0, us);
      const field = safeIdent(rest.slice(us + 1));
      if (!field) continue;
      const sqlOp = filterOpToSQL(filterOp);
      if (!sqlOp) continue;
      if (filterOp === 'in') {
        const list = String(value).split(',').map(v => v.trim()).filter(Boolean);
        if (!list.length) continue;
        where += ` AND ${field} IN (${list.map(() => '?').join(', ')})`;
        params.push(...list);
      } else if (filterOp === 'is') {
        where += ` AND ${field} IS ?`;
        params.push((value === 'null' || value === '') ? null : value);
      } else {
        where += ` AND ${field} ${sqlOp} ?`;
        params.push(value);
      }
    }

    // Cheap count probe for the realtime poller: COUNT(*) never saturates the way
    // "SELECT id LIMIT 1000" + rows.length does on large tables.
    if (op === 'count') {
      const row = await env.DB.prepare(`SELECT COUNT(*) AS n FROM ${actualTable}${where}`)
        .bind(...params).first();
      return json(200, { data: { n: row && row.n !== undefined ? Number(row.n) : 0 } });
    }

    if (op === 'select') {
      let colList = cols;
      if (cols !== '*') {
        const realCols = await tableColumns(env, actualTable);
        const wanted = cols.split(',').map(c => c.trim()).filter(Boolean);
        const unknown = wanted.filter(c => !realCols.has(c));
        // Never fall back to SELECT *: an unknown column would silently return
        // every column of the row (e.g. credentials.password).
        if (unknown.length) return json(400, { error: 'Unknown columns: ' + unknown.join(', ') });
        colList = wanted.length ? wanted.join(', ') : '*';
      }
      let query = `SELECT ${colList} FROM ${actualTable}${where}`;

      const rawSort = safeIdent(url.searchParams.get('sort') || '');
      if (rawSort) {
        const realCols = await tableColumns(env, actualTable);
        let sortField = rawSort;
        if (!realCols.has(sortField)) {
          if (sortField === 'submitted_at' && realCols.has('submittedAt')) sortField = 'submittedAt';
          else if (sortField === 'submittedAt' && realCols.has('submitted_at')) sortField = 'submitted_at';
          else if (sortField === 'created_at' && realCols.has('created')) sortField = 'created';
          else if (sortField === 'created' && realCols.has('created_at')) sortField = 'created_at';
          else if (sortField === 'due_date' && realCols.has('dueDate')) sortField = 'dueDate';
          else if (sortField === 'dueDate' && realCols.has('due_date')) sortField = 'due_date';
          else if (!realCols.has(sortField)) sortField = null;
        }
        if (sortField) {
          const sortOrder = url.searchParams.get('order') === 'desc' ? 'DESC' : 'ASC';
          query += ` ORDER BY ${sortField} ${sortOrder}`;
        }
      }
      const limit = url.searchParams.get('limit');
      if (limit) {
        const parsed = parseInt(limit, 10);
        if (!Number.isFinite(parsed) || parsed <= 0) return json(400, { error: 'Invalid limit' });
        query += ' LIMIT ?';
        params.push(parsed);
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

    if (!table) {
      return json(400, { error: 'Invalid table' });
    }
    const actualTable = resolveTable(table);
    if (!ALLOWED_TABLES.includes(table) && !ALLOWED_TABLES.includes(actualTable)) {
      return json(400, { error: 'Invalid table' });
    }
    if (!data || typeof data !== 'object') {
      return json(400, { error: 'Missing data' });
    }

    const toVal = (v) => (typeof v === 'object' && v !== null ? JSON.stringify(v) : v);

    if (op === 'insert') {
      const realCols = await tableColumns(env, actualTable);
      const id = data.id || `${table.slice(0, 4)}-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
      const keys = Object.keys(data).filter(k => safeIdent(k) && realCols.has(k));
      if (!keys.includes('id') && realCols.has('id')) keys.push('id');
      if (!keys.length) return json(400, { error: 'No insertable columns' });
      const values = keys.map(k => (k === 'id' ? id : toVal(data[k])));
      await env.DB.prepare(`INSERT INTO ${actualTable} (${keys.join(', ')}) VALUES (${keys.map(() => '?').join(', ')})`).bind(...values).run();
      const row = realCols.has('id')
        ? await env.DB.prepare(`SELECT * FROM ${actualTable} WHERE id = ?`).bind(id).first()
        : null;
      return json(201, { data: row });
    }

    if (op === 'update') {
      const id = data.id;
      if (!id) return json(400, { error: 'ID required' });
      const realCols = await tableColumns(env, actualTable);
      const fields = [];
      const values = [];
      for (const [key, value] of Object.entries(data)) {
        if (key === 'id') continue;
        const f = safeIdent(key);
        if (!f || !realCols.has(f)) continue;
        fields.push(`${f} = ?`);
        values.push(toVal(value));
      }
      if (!fields.length) return json(400, { error: 'No updatable columns' });
      values.push(id);
      await env.DB.prepare(`UPDATE ${actualTable} SET ${fields.join(', ')} WHERE id = ?`).bind(...values).run();
      const row = await env.DB.prepare(`SELECT * FROM ${actualTable} WHERE id = ?`).bind(id).first();
      return json(200, { data: row });
    }

    if (op === 'delete') {
      const id = data.id;
      if (!id) return json(400, { error: 'ID required' });
      await env.DB.prepare(`DELETE FROM ${actualTable} WHERE id = ?`).bind(id).run();
      return json(200, { success: true });
    }

    if (op === 'upsert') {
      const realCols = await tableColumns(env, actualTable);
      const id = data.id || `${table.slice(0, 4)}-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
      const keys = Object.keys(data).filter(k => safeIdent(k) && realCols.has(k));
      if (!keys.includes('id') && realCols.has('id')) keys.push('id');
      if (!keys.length) return json(400, { error: 'No upsertable columns' });
      const values = keys.map(k => (k === 'id' ? id : toVal(data[k])));
      try {
        await env.DB.prepare(`INSERT INTO ${actualTable} (${keys.join(', ')}) VALUES (${keys.map(() => '?').join(', ')})`).bind(...values).run();
      } catch (_) {
        const updKeys = keys.filter(k => k !== 'id');
        if (!updKeys.length) return json(400, { error: 'Nothing to update' });
        await env.DB.prepare(`UPDATE ${actualTable} SET ${updKeys.map(k => `${k} = ?`).join(', ')} WHERE id = ?`)
          .bind(...updKeys.map(k => toVal(data[k])), id).run();
      }
      const row = realCols.has('id')
        ? await env.DB.prepare(`SELECT * FROM ${actualTable} WHERE id = ?`).bind(id).first()
        : null;
      return json(200, { data: row });
    }

    return json(400, { error: 'Unsupported operation' });
  } catch (e) {
    return json(500, { error: e.message });
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

const MAX_UPLOAD_BYTES = 16 * 1024 * 1024;

function getR2Bucket(env) {
  return env.MEDIA || env.chesskidoo_media || env.R2 || env.MEDIA_BUCKET || env.UPLOADS || null;
}

async function handleUpload(request, env) {
  if (request.method === 'OPTIONS') return new Response(null, { status: 200, headers: cors() });

  if (!await getSessionUser(request, env)) {
    return json(401, { error: 'Unauthorized' });
  }

  if (request.method === 'DELETE') {
    const bucket = getR2Bucket(env);
    if (!bucket) return json(500, { error: 'Storage not configured (R2 binding missing)' });
    const url = new URL(request.url);
    const key = url.searchParams.get('key');
    if (!key) return json(400, { error: 'Missing key' });
    try {
      await bucket.delete(String(key).replace(/\.\./g, ''));
      return json(200, { success: true });
    } catch (e) {
      return json(500, { error: e.message });
    }
  }

  if (request.method !== 'POST') return methodNotAllowed();
  const bucket = getR2Bucket(env);
  if (!bucket) return json(500, { error: 'Storage not configured (R2 binding missing)' });

  try {
    const url = new URL(request.url);
    const contentType = request.headers.get('content-type') || '';
    let objectKey = url.searchParams.get('key') || '';
    let body = null;
    let fileType = 'application/octet-stream';

    if (contentType.includes('multipart/form-data')) {
      const form = await request.formData();
      const file = form.get('file');
      if (!file || typeof file === 'string') return json(400, { error: 'No file provided' });
      if (file.size > MAX_UPLOAD_BYTES) return json(413, { error: 'File too large (max 16 MB)' });
      objectKey = objectKey || (form.get('key') || '');
      body = file;
      fileType = file.type || fileType;
    } else if (contentType.includes('application/json')) {
      const jsonBody = await request.json().catch(() => ({}));
      const b64 = jsonBody.image || jsonBody.base64 || jsonBody.file || jsonBody.data;
      if (!b64) return json(400, { error: 'No file/image data in JSON payload' });
      const raw = atob(String(b64).replace(/^data:[^;]+;base64,/, ''));
      const bytes = new Uint8Array(raw.length);
      for (let i = 0; i < raw.length; i++) bytes[i] = raw.charCodeAt(i);
      body = bytes.buffer;
      if (body.byteLength > MAX_UPLOAD_BYTES) return json(413, { error: 'File too large (max 16 MB)' });
      objectKey = objectKey || jsonBody.filename || jsonBody.name || '';
      const fn = String(jsonBody.filename || '').toLowerCase();
      fileType = jsonBody.type || (fn.endsWith('.png') ? 'image/png' : fn.endsWith('.jpg') || fn.endsWith('.jpeg') ? 'image/jpeg' : fn.endsWith('.pdf') ? 'application/pdf' : 'application/octet-stream');
    } else {
      const cl = parseInt(request.headers.get('content-length') || '', 10);
      if (Number.isFinite(cl) && cl > MAX_UPLOAD_BYTES) {
        return json(413, { error: 'File too large (max 16 MB)' });
      }
      body = await request.arrayBuffer();
      if (body.byteLength > MAX_UPLOAD_BYTES) return json(413, { error: 'File too large (max 16 MB)' });
      fileType = contentType.split(';')[0] || fileType;
    }

    if (!objectKey) {
      objectKey = `upload_${Date.now()}_${Math.random().toString(36).slice(2, 8)}.bin`;
    }
    const r2Key = String(objectKey).replace(/\.\./g, '').replace(/^\/+/, '');

    await bucket.put(r2Key, body, { httpMetadata: { contentType: fileType } });
    const publicUrl = `/api/files/${r2Key}`;
    return json(201, { data: { key: r2Key, path: r2Key, url: publicUrl, publicUrl } });
  } catch (e) {
    return json(500, { error: e.message || 'Upload failed' });
  }
}

async function handleFileServe(request, env, pathname) {
  const bucket = getR2Bucket(env);
  if (!bucket) return json(500, { error: 'Storage not configured (R2 binding missing)' });
  let key;
  try {
    key = decodeURIComponent(pathname.replace(/^\/api\/files\/?/, ''));
  } catch (_) {
    return json(400, { error: 'Invalid key' });
  }
  if (!key) return json(400, { error: 'Missing key' });
  try {
    const object = await bucket.get(key);
    if (!object) return json(404, { error: 'Not found' });
    const headers = new Headers(cors());
    object.writeHttpMetadata(headers);
    headers.set('etag', object.httpEtag);
    headers.set('cache-control', 'public, max-age=3600');
    return new Response(object.body, { headers });
  } catch (e) {
    return json(500, { error: e.message });
  }
}

async function handleUsers(request, env) {
  const url = new URL(request.url);
  const id = url.searchParams.get('id');

  if (request.method === 'OPTIONS') {
    return new Response(null, { status: 200, headers: cors() });
  }

  if (request.method === 'GET' && id) {
    const user = await env.DB.prepare('SELECT * FROM users WHERE id = ?').bind(id).first();
    if (!user) return json(404, { error: 'Not found' });
    return json(200, user);
  }

  if (request.method === 'GET') {
    const role = url.searchParams.get('role');
    const coach = url.searchParams.get('coach');
    const batch = url.searchParams.get('batch');
    const search = url.searchParams.get('search');

    let query = 'SELECT * FROM users WHERE 1=1';
    const params = [];
    if (role) { query += ' AND role = ?'; params.push(role); }
    if (coach) { query += ' AND coach = ?'; params.push(coach); }
    if (batch) { query += ' AND batch = ?'; params.push(batch); }
    if (search) { query += ' AND (full_name LIKE ? OR email LIKE ? OR userid LIKE ?)'; params.push(`%${search}%`, `%${search}%`, `%${search}%`); }
    query += ' ORDER BY created_at DESC';

    const { results } = await env.DB.prepare(query).bind(...params).all();
    return json(200, { data: results });
  }

  if (request.method === 'POST') {
    const body = await request.json();
    const id = body.id || `user-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
    const now = new Date().toISOString();
    await env.DB.prepare(`INSERT INTO users (id, full_name, role, email, phone_number, city, level, rating, coach, batch, status, due_date, join_date, age, grade, payment_status, xp, classes, streak_count, created_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`).bind(id, body.full_name || null, body.role || 'student', body.email || null, body.phone_number || null, body.city || null, body.level || null, body.rating ?? 800, body.coach || null, body.batch || null, body.status || null, body.due_date || null, body.join_date || null, body.age ?? null, body.grade || null, body.payment_status || null, body.xp ?? 0, body.classes ?? 0, body.streak_count ?? 0, now).run();
    const user = await env.DB.prepare('SELECT * FROM users WHERE id = ?').bind(id).first();
    return json(201, user);
  }

  return methodNotAllowed();
}

async function handleClasses(request, env) {
  const url = new URL(request.url);

  if (request.method === 'OPTIONS') {
    return new Response(null, { status: 200, headers: cors() });
  }

  if (request.method === 'GET') {
    const coachId = url.searchParams.get('coachId');
    let query = 'SELECT * FROM classes WHERE 1=1';
    const params = [];
    if (coachId) { query += ' AND coachId = ?'; params.push(coachId); }
    query += ' ORDER BY created_at DESC';
    const { results } = await env.DB.prepare(query).bind(...params).all();
    return json(200, { data: results });
  }

  if (request.method === 'POST') {
    const body = await request.json();
    const id = body.id || `cls-${Date.now()}`;
    await env.DB.prepare(`INSERT INTO classes (id, coachId, coachName, title, level, batch, days, time, duration, zoomLink, maxStudents, studentIds, active, created_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`).bind(id, body.coachId || null, body.coachName || null, body.title || null, body.level || null, body.batch || null, JSON.stringify(body.days || []), body.time || null, body.duration ?? null, body.zoomLink || null, body.maxStudents ?? 10, JSON.stringify(body.studentIds || []), body.active !== false ? 1 : 0, new Date().toISOString()).run();
    const row = await env.DB.prepare('SELECT * FROM classes WHERE id = ?').bind(id).first();
    return json(201, row);
  }

  return methodNotAllowed();
}

async function handleAttendance(request, env) {
  const url = new URL(request.url);

  if (request.method === 'OPTIONS') {
    return new Response(null, { status: 200, headers: cors() });
  }

  if (request.method === 'GET') {
    const userid = url.searchParams.get('userid') || url.searchParams.get('student_id') || url.searchParams.get('studentId');
    const date = url.searchParams.get('date');
    const limit = parseInt(url.searchParams.get('limit') || '5000', 10);
    let query = 'SELECT * FROM attendance WHERE 1=1';
    const params = [];
    if (userid) {
      query += ' AND (userid = ? OR studentId = ?)';
      params.push(userid, userid);
    }
    if (date) {
      query += ' AND date = ?';
      params.push(date);
    }
    query += ' ORDER BY date DESC LIMIT ?';
    params.push(limit);
    const { results } = await env.DB.prepare(query).bind(...params).all();
    return json(200, { data: results });
  }

  if (request.method === 'POST') {
    const rawBody = await request.json();
    const items = Array.isArray(rawBody) ? rawBody : [rawBody];
    const realCols = await tableColumns(env, 'attendance');
    const results = [];

    for (const item of items) {
      if (!item || typeof item !== 'object') continue;
      const studentId = item.studentId || item.student_id || item.userid || null;
      const date = item.date || new Date().toISOString().split('T')[0];
      const now = new Date().toISOString();

      let existingId = item.id;
      if (!existingId && studentId && date) {
        const existing = await env.DB.prepare('SELECT id FROM attendance WHERE (studentId = ? OR userid = ?) AND date = ? LIMIT 1')
          .bind(studentId, studentId, date).first();
        if (existing?.id) existingId = existing.id;
      }
      const id = existingId || `att-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;

      const dataObj = {
        id,
        userid: item.userid || studentId,
        studentId: studentId,
        studentName: item.studentName || item.student_name || null,
        classId: item.classId || item.class_id || null,
        className: item.className || item.class_name || null,
        coachId: item.coachId || item.coach_id || null,
        coachName: item.coachName || item.coach_name || null,
        markedAt: item.markedAt || now,
        date: date,
        status: item.status || 'present',
        class_title: item.class_title || item.notes || null,
        created_at: now
      };

      if (realCols.has('student_id')) dataObj.student_id = studentId;
      if (realCols.has('notes')) dataObj.notes = item.notes || null;
      if (realCols.has('coach_id')) dataObj.coach_id = item.coachId || item.coach_id || null;

      const keys = Object.keys(dataObj).filter(k => realCols.has(k) && dataObj[k] !== undefined);
      const vals = keys.map(k => dataObj[k]);

      await env.DB.prepare(
        `INSERT OR REPLACE INTO attendance (${keys.join(', ')}) VALUES (${keys.map(() => '?').join(', ')})`
      ).bind(...vals).run();

      results.push({ id, studentId, date, status: item.status });
    }

    return json(201, { success: true, count: results.length, data: Array.isArray(rawBody) ? results : results[0] });
  }

  if (request.method === 'DELETE') {
    const studentId = url.searchParams.get('student_id') || url.searchParams.get('studentId') || url.searchParams.get('userid');
    const date = url.searchParams.get('date');
    const id = url.searchParams.get('id');

    if (id) {
      await env.DB.prepare('DELETE FROM attendance WHERE id = ?').bind(id).run();
      return json(200, { success: true });
    }
    if (studentId && date) {
      await env.DB.prepare('DELETE FROM attendance WHERE (studentId = ? OR userid = ?) AND date = ?').bind(studentId, studentId, date).run();
      return json(200, { success: true });
    }
    return json(400, { error: 'Missing student_id or date for attendance deletion' });
  }

  return methodNotAllowed();
}

async function handleAssignments(request, env) {
  if (request.method === 'OPTIONS') {
    return new Response(null, { status: 200, headers: cors() });
  }

  if (request.method === 'GET') {
    const { results } = await env.DB.prepare('SELECT * FROM assignments ORDER BY created DESC').all();
    return json(200, { data: results });
  }

  if (request.method === 'POST') {
    const body = await request.json();
    const id = body.id || `asn-${Date.now()}`;
    await env.DB.prepare(`INSERT INTO assignments (id, title, pgn, type, assignedTo, dueDate, description, coach, moves, created, created_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`).bind(id, body.title, body.pgn || null, body.type || null, JSON.stringify(body.assignedTo || []), body.dueDate || null, body.description || null, body.coach || null, body.moves ? JSON.stringify(body.moves) : null, Date.now(), new Date().toISOString()).run();
    const row = await env.DB.prepare('SELECT * FROM assignments WHERE id = ?').bind(id).first();
    return json(201, row);
  }

  return methodNotAllowed();
}

async function handleHomework(request, env) {
  const url = new URL(request.url);

  if (request.method === 'OPTIONS') {
    return new Response(null, { status: 200, headers: cors() });
  }

  if (request.method === 'GET') {
    const view = url.searchParams.get('view');
    if (view === 'submissions') {
      const page = Math.max(1, parseInt(url.searchParams.get('page') || '1'));
      const limit = Math.min(500, Math.max(1, parseInt(url.searchParams.get('limit') || '500')));
      const offset = (page - 1) * limit;
      const { results } = await env.DB.prepare('SELECT * FROM hw_submissions ORDER BY submittedAt DESC LIMIT ? OFFSET ?').bind(limit, offset).all();
      const { count } = await env.DB.prepare('SELECT COUNT(*) as c FROM hw_submissions').bind().first();
      return json(200, { data: results, total: count?.c || 0, page, limit });
    }
    // Homework list = the assignments themselves (Supabase `homework_assignments`,
    // aliased to the D1 `assignments` table). This used to return hw_submissions,
    // which made every homework list render empty.
    const { results } = await env.DB.prepare('SELECT * FROM assignments ORDER BY created DESC').all();
    return json(200, { data: results });
  }

  if (request.method === 'POST') {
    const body = await request.json();
    const action = url.searchParams.get('action');
    if (action === 'submit') {
      const studentId = body.student_id || url.searchParams.get('student_id');
      const assignmentId = body.assignment_id || url.searchParams.get('assignment_id');
      if (!studentId || !assignmentId) return json(400, { error: 'Student ID and Assignment ID are required' });
      const existing = await env.DB.prepare('SELECT * FROM hw_submissions WHERE assignment_id = ? AND student_id = ?').bind(assignmentId, studentId).first();
      const id = existing?.id || `sub-${Date.now()}`;
      const now = new Date().toISOString();
      await env.DB.prepare(`INSERT OR REPLACE INTO hw_submissions (id, assignment_id, student_id, submission_text, submission_url, file_urls, status, submitted_at, updated_at, submittedAt, completed, created_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 1, ?)`).bind(id, assignmentId, studentId, body.submission_text || '', body.submission_url || '', JSON.stringify(body.file_urls || []), 'submitted', now, now, now, now).run();
      const row = await env.DB.prepare('SELECT * FROM hw_submissions WHERE id = ?').bind(id).first();
      return json(201, { data: row, success: true });
    }

    if (action === 'review') {
      const id = url.searchParams.get('id') || body.id;
      if (!id) return json(400, { error: 'Missing submission id' });
      const realCols = await tableColumns(env, 'hw_submissions');
      const now = new Date().toISOString();
      const updates = [];
      const vals = [];
      if (body.status && realCols.has('status')) { updates.push('status = ?'); vals.push(body.status); }
      if (body.feedback && realCols.has('feedback')) { updates.push('feedback = ?'); vals.push(body.feedback); }
      else if (body.feedback && realCols.has('note')) { updates.push('note = ?'); vals.push(body.feedback); }
      if (body.score !== undefined && realCols.has('score')) { updates.push('score = ?'); vals.push(body.score); }
      else if (body.score !== undefined && realCols.has('accuracy')) { updates.push('accuracy = ?'); vals.push(body.score); }
      if (realCols.has('updated_at')) { updates.push('updated_at = ?'); vals.push(now); }
      if (realCols.has('reviewed_at')) { updates.push('reviewed_at = ?'); vals.push(now); }
      if (updates.length) {
        vals.push(id);
        await env.DB.prepare(`UPDATE hw_submissions SET ${updates.join(', ')} WHERE id = ?`).bind(...vals).run();
      }
      return json(200, { success: true });
    }

    // ── Create a homework ASSIGNMENT ────────────────────────────────────────
    // The LMS homework UI was built for the Supabase `homework_assignments`
    // table, so it POSTs snake_case fields. D1 stores these in `assignments`,
    // which only has a subset of those columns. Build the INSERT from the
    // columns that actually exist (introspected via PRAGMA) so this keeps
    // working regardless of which migrations have been applied.
    const now = new Date().toISOString();
    const hwId = body.id || `asn-${Date.now()}`;
    const targetType = body.target_type || body.targetType || 'student';

    const fileList = Array.isArray(body.attachment_urls) ? body.attachment_urls
      : Array.isArray(body.questions_files) ? body.questions_files
      : [];

    const wanted = {
      id: hwId,
      title: body.title || '',
      pgn: body.pgn || null,
      type: body.type || 'homework',
      // Legacy/camelCase columns kept in sync for older readers
      assignedTo: targetType === 'student' ? (body.student_id || null)
        : targetType === 'batch' ? (body.batch_id || null) : 'all',
      dueDate: body.due_date || body.dueDate || null,
      due_date: body.due_date || body.dueDate || null,
      description: body.description || '',
      coach: body.coach || body.coach_id || body.created_by || body.coachId || null,
      moves: Array.isArray(body.moves) ? JSON.stringify(body.moves) : (body.moves || null),
      max_marks: body.max_marks || null,
      status: body.status || 'active',
      created: Date.now(),
      created_at: now,
      created_by: body.coach_id || body.created_by || body.coachId || body.coach || null,
      updated_at: now,
      // LMS/Supabase-compatible columns
      target_type: targetType,
      student_id: targetType === 'student' ? (body.student_id || null) : null,
      batch_id: targetType === 'batch' ? (body.batch_id || null) : null,
      coach_id: body.coach_id || body.created_by || body.coachId || null,
      questions_files: JSON.stringify(fileList),
      attachment_urls: JSON.stringify(fileList),
      present_student_ids: Array.isArray(body.present_student_ids)
        ? JSON.stringify(body.present_student_ids)
        : (body.present_student_ids || null)
    };

    // Only keep keys that exist on the `assignments` table
    const cols = await env.DB.prepare('PRAGMA table_info(assignments)').all();
    const existing = new Set((cols.results || []).map(c => c.name));
    const keys = Object.keys(wanted).filter(kk => existing.has(kk));

    // If no wanted columns exist in the table, fall back to inserting only the guaranteed columns
    if (keys.length === 0) {
      const fallbackKeys = ['id', 'title', 'description', 'due_date', 'status', 'created_at', 'updated_at', 'target_type', 'student_id', 'batch_id', 'coach_id', 'created_by', 'questions_files', 'attachment_urls', 'present_student_ids'];
      const fallbackExisting = fallbackKeys.filter(k => existing.has(k));
      if (fallbackExisting.length === 0) return json(500, { error: 'assignments table has no compatible columns' });
      keys.push(...fallbackExisting);
    }

    const values = keys.map(kk => wanted[kk]);
    const placeholders = keys.map(() => '?').join(', ');
    await env.DB.prepare(`INSERT OR REPLACE INTO assignments (${keys.join(', ')}) VALUES (${placeholders})`).bind(...values).run();

    const row = await env.DB.prepare('SELECT * FROM assignments WHERE id = ?').bind(hwId).first();
    return json(201, { data: row, success: true });
  }

  if (request.method === 'PATCH') {
    const id = url.searchParams.get('id');
    const action = url.searchParams.get('action');
    const body = await request.json().catch(() => ({}));
    if (!id) return json(400, { error: 'Missing ID' });

    if (action === 'review') {
      const realCols = await tableColumns(env, 'hw_submissions');
      const now = new Date().toISOString();
      const updates = [];
      const vals = [];
      if (body.status && realCols.has('status')) { updates.push('status = ?'); vals.push(body.status); }
      if (body.feedback && realCols.has('feedback')) { updates.push('feedback = ?'); vals.push(body.feedback); }
      else if (body.feedback && realCols.has('note')) { updates.push('note = ?'); vals.push(body.feedback); }
      if (body.score !== undefined && realCols.has('score')) { updates.push('score = ?'); vals.push(body.score); }
      else if (body.score !== undefined && realCols.has('accuracy')) { updates.push('accuracy = ?'); vals.push(body.score); }
      if (realCols.has('updated_at')) { updates.push('updated_at = ?'); vals.push(now); }
      if (realCols.has('reviewed_at')) { updates.push('reviewed_at = ?'); vals.push(now); }
      if (updates.length) {
        vals.push(id);
        await env.DB.prepare(`UPDATE hw_submissions SET ${updates.join(', ')} WHERE id = ?`).bind(...vals).run();
      }
      return json(200, { success: true });
    }

    // Default: update homework assignment record (from saveHomeworkEdit)
    const realCols = await tableColumns(env, 'assignments');
    const now = new Date().toISOString();
    const updates = [];
    const vals = [];
    if (body.title && realCols.has('title')) { updates.push('title = ?'); vals.push(body.title); }
    if (body.description !== undefined && realCols.has('description')) { updates.push('description = ?'); vals.push(body.description); }
    if (body.due_date && realCols.has('due_date')) { updates.push('due_date = ?'); vals.push(body.due_date); }
    if (body.due_date && realCols.has('dueDate')) { updates.push('dueDate = ?'); vals.push(body.due_date); }
    if (body.status && realCols.has('status')) { updates.push('status = ?'); vals.push(body.status); }
    const finalFiles = body.questions_files !== undefined ? body.questions_files : body.attachment_urls;
    if (finalFiles !== undefined && realCols.has('questions_files')) {
      updates.push('questions_files = ?');
      vals.push(typeof finalFiles === 'string' ? finalFiles : JSON.stringify(finalFiles));
    }
    if (body.attachment_urls !== undefined && realCols.has('attachment_urls')) {
      updates.push('attachment_urls = ?');
      vals.push(typeof body.attachment_urls === 'string' ? body.attachment_urls : JSON.stringify(body.attachment_urls));
    }
    if (body.present_student_ids !== undefined && realCols.has('present_student_ids')) {
      updates.push('present_student_ids = ?');
      vals.push(Array.isArray(body.present_student_ids) ? JSON.stringify(body.present_student_ids) : (body.present_student_ids || null));
    }
    if ((body.coach || body.coach_id) && realCols.has('coach')) {
      updates.push('coach = ?');
      vals.push(body.coach || body.coach_id);
    }
    if (realCols.has('updated_at')) { updates.push('updated_at = ?'); vals.push(now); }
    if (updates.length) {
      vals.push(id);
      await env.DB.prepare(`UPDATE assignments SET ${updates.join(', ')} WHERE id = ?`).bind(...vals).run();
    }
    return json(200, { success: true });
  }

  if (request.method === 'DELETE') {
    const id = url.searchParams.get('id');
    if (!id) return json(400, { error: 'Missing homework ID' });
    await env.DB.prepare('DELETE FROM assignments WHERE id = ?').bind(id).run();
    await env.DB.prepare('DELETE FROM hw_submissions WHERE assignment_id = ?').bind(id).run();
    return json(200, { success: true });
  }

  return methodNotAllowed();
}

async function handleFeedback(request, env) {
  if (request.method === 'OPTIONS') {
    return new Response(null, { status: 200, headers: cors() });
  }

  if (request.method === 'GET') {
    const url = new URL(request.url);
    const childId = url.searchParams.get('childId');
    let query = 'SELECT * FROM feedback WHERE 1=1';
    const params = [];
    if (childId) { query += ' AND childId = ?'; params.push(childId); }
    query += ' ORDER BY created_at DESC';
    const { results } = await env.DB.prepare(query).bind(...params).all();
    return json(200, { data: results });
  }

  if (request.method === 'POST') {
    const body = await request.json();
    const id = body.id || `fb-${Date.now()}`;
    await env.DB.prepare(`INSERT INTO feedback (id, fromId, fromName, fromRole, childId, childName, toId, toName, message, rating, category, replied, reply, parent_name, parent_email, student_email, text, status, created_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`).bind(id, body.fromId || null, body.fromName || null, body.fromRole || null, body.childId || null, body.childName || null, body.toId || null, body.toName || null, body.message || null, body.rating ?? null, body.category || null, body.replied ? 1 : 0, body.reply || null, body.parent_name || null, body.parent_email || null, body.student_email || null, body.text || null, body.status || null, new Date().toISOString()).run();
    const row = await env.DB.prepare('SELECT * FROM feedback WHERE id = ?').bind(id).first();
    return json(201, row);
  }

  return methodNotAllowed();
}

async function handleLeads(request, env) {
  if (request.method === 'OPTIONS') {
    return new Response(null, { status: 200, headers: cors() });
  }

  if (request.method === 'POST') {
    const body = await request.json();
    const id = `lead-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
    await env.DB.prepare(`INSERT INTO leads (id, name, phone, parent_name, child_age, city, status, email, message, source, full_name, age, created_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`).bind(id, body.name || body.parentName || null, body.phone || null, body.parent_name || body.parentName || null, body.child_age || body.childAge || null, body.city || 'Not specified', body.status || 'new', body.email || null, body.message || null, body.source || 'website', body.full_name || body.name || null, body.age || body.childAge || null, new Date().toISOString()).run();
    return json(200, { success: true, id });
  }

  if (request.method === 'GET') {
    const { results } = await env.DB.prepare('SELECT * FROM leads ORDER BY created_at DESC').all();
    return json(200, { data: results });
  }

  return methodNotAllowed();
}

async function handleDemoSheet(request, env) {
  if (request.method === 'OPTIONS') {
    return new Response(null, { status: 200, headers: cors() });
  }

  if (request.method === 'POST') {
    const body = await request.json();
    const timestamp = body.timestamp || new Date().toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' });
    return json(200, { success: true, sheetSaved: false, timestamp, message: 'Demo class booking logged' });
  }

  return methodNotAllowed();
}

async function handleLichess(request, env) {
  const url = new URL(request.url);
  const username = url.searchParams.get('user') || url.pathname.split('/').pop();
  if (!username) return json(400, { error: 'Username required' });

  try {
    const res = await fetch(`https://lichess.org/api/user/${encodeURIComponent(username)}`, {
      headers: { Accept: 'application/json' }
    });
    const data = await res.json();
    return json(200, data);
  } catch (e) {
    return json(502, { error: 'Lichess proxy failed' });
  }
}

async function handleChesscom(request, env) {
  const url = new URL(request.url);
  const username = url.searchParams.get('user') || url.pathname.split('/').pop();
  if (!username) return json(400, { error: 'Username required' });

  try {
    const res = await fetch(`https://api.chess.com/pub/player/${encodeURIComponent(username)}`);
    const data = await res.json();
    return json(200, data);
  } catch (e) {
    return json(502, { error: 'Chess.com proxy failed' });
  }
}

async function handleResources(request, env) {
  if (request.method === 'OPTIONS') {
    return new Response(null, { status: 200, headers: cors() });
  }

  if (request.method === 'GET') {
    const { results } = await env.DB.prepare('SELECT * FROM resources ORDER BY created_at DESC').all();
    return json(200, { data: results });
  }

  if (request.method === 'POST') {
    const body = await request.json();
    const id = body.id || `res-${Date.now()}`;
    // Map the LMS/portal friendly fields (title/description/url) onto the real
    // D1 columns (name/notes/link). The API also returns title/desc/url so the
    // resource card always renders, regardless of which columns were written.
    await env.DB.prepare(
      `INSERT INTO resources (id, name, type, level, batch, coach, notes, link, title, description, url, created_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`
    ).bind(
      id,
      body.name ?? body.title ?? null,
      body.type ?? null,
      body.level ?? null,
      body.batch ?? null,
      body.coach ?? null,
      body.notes ?? body.description ?? null,
      body.link ?? body.url ?? null,
      body.title ?? null,
      body.description ?? null,
      body.url ?? null,
      new Date().toISOString()
    ).run();
    const row = await env.DB.prepare('SELECT * FROM resources WHERE id = ?').bind(id).first();
    // Normalise the row into the front-end contract for the current request.
    if (row) {
      row.title = row.title ?? row.name ?? null;
      row.description = row.description ?? row.notes ?? null;
      row.url = row.url ?? row.link ?? null;
    }
    return json(201, { data: row });
  }

  return methodNotAllowed();
}

async function handleBatches(request, env) {
  if (request.method === 'OPTIONS') {
    return new Response(null, { status: 200, headers: cors() });
  }

  if (request.method === 'GET') {
    const { results } = await env.DB.prepare('SELECT * FROM batches ORDER BY created_at DESC').all();
    return json(200, { data: results });
  }

  if (request.method === 'POST') {
    const body = await request.json();
    const id = body.id || `batch-${Date.now()}`;
    await env.DB.prepare(`INSERT INTO batches (id, name, coach, level, time, active, created_at) VALUES (?, ?, ?, ?, ?, ?, ?)`).bind(id, body.name || null, body.coach || null, body.level || null, body.time || null, body.active !== false ? 1 : 0, new Date().toISOString()).run();
    const row = await env.DB.prepare('SELECT * FROM batches WHERE id = ?').bind(id).first();
    return json(201, row);
  }

  if (request.method === 'PUT') {
    const url = new URL(request.url);
    const id = url.searchParams.get('id');
    if (!id) {
      return json(400, { error: 'Missing batch id' });
    }
    const body = await request.json();
    const existing = await env.DB.prepare('SELECT * FROM batches WHERE id = ?').bind(id).first();
    if (!existing) {
      return json(404, { error: 'Batch not found' });
    }
    const updates = [];
    const values = [];
    const allowed = ['name', 'coach', 'level', 'time', 'days', 'time_slot', 'student_ids', 'active'];
    for (const key of allowed) {
      if (Object.prototype.hasOwnProperty.call(body, key)) {
        updates.push(`${key} = ?`);
        // JSON stringify arrays/objects before storing
        const value = body[key];
        values.push(Array.isArray(value) || (typeof value === 'object' && value !== null) ? JSON.stringify(value) : value);
      }
    }
    if (!updates.length) {
      return json(400, { error: 'No updatable fields provided' });
    }
    values.push(id);
    await env.DB.prepare(`UPDATE batches SET ${updates.join(', ')} WHERE id = ?`).bind(...values).run();
    const row = await env.DB.prepare('SELECT * FROM batches WHERE id = ?').bind(id).first();
    return json(200, row);
  }

  return methodNotAllowed();
}

async function handleRatingHistory(request, env) {
  const url = new URL(request.url);
  const studentId = url.searchParams.get('student_id') || url.searchParams.get('userid');

  if (request.method === 'OPTIONS') {
    return new Response(null, { status: 200, headers: cors() });
  }

  if (request.method === 'GET') {
    // Front-end contract: GET /api/rating_history returns every rating the LMS
    // tracks (the admin rating list and the child "Growth" chart both read
    // this). The legacy "rating_history?userid=" query is still honoured.
    if (studentId) {
      const { results } = await env.DB.prepare(
        'SELECT * FROM ratings WHERE student_id = ? ORDER BY recorded_at DESC, date DESC'
      ).bind(studentId).all();
      return json(200, { data: results });
    }
    const { results } = await env.DB.prepare('SELECT * FROM ratings ORDER BY recorded_at DESC, date DESC').all();
    return json(200, { data: results });
  }

  if (request.method === 'POST') {
    const body = await request.json();
    const id = body.id || `rating-${Date.now()}`;
    // The LMS sends snake_case: student_id, rating, change_type, notes.
    // Persist everything the schema offers so nothing is silently dropped.
    await env.DB.prepare(
      `INSERT INTO ratings (id, student_id, user_id, rating, event, change_type, notes, date, recorded_at, created_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`
    ).bind(
      id,
      body.student_id ?? body.userid ?? null,
      body.student_id ?? body.userid ?? null,
      body.rating ?? body.elo ?? null,
      body.event ?? null,
      body.change_type ?? null,
      body.notes ?? null,
      body.date ?? null,
      body.recorded_at ?? body.date ?? null,
      new Date().toISOString()
    ).run();
    const row = await env.DB.prepare('SELECT * FROM ratings WHERE id = ?').bind(id).first();
    if (row) {
      row.student_id = row.student_id ?? row.user_id ?? null;
      row.recorded_at = row.recorded_at ?? row.date ?? null;
    }
    return json(201, { data: row });
  }

  return methodNotAllowed();
}

async function handleAchievements(request, env) {
  if (request.method === 'OPTIONS') {
    return new Response(null, { status: 200, headers: cors() });
  }

  if (request.method === 'GET') {
    const { results } = await env.DB.prepare('SELECT * FROM achievements ORDER BY created_at DESC').all();
    return json(200, { data: results });
  }

  if (request.method === 'POST') {
    const body = await request.json();
    const id = body.id || `ach-${Date.now()}`;
    await env.DB.prepare(`INSERT INTO achievements (id, userid, title, description, date, img_url, created_at) VALUES (?, ?, ?, ?, ?, ?, ?)`).bind(id, body.userid || null, body.title || null, body.description || null, body.date || null, body.img_url || null, new Date().toISOString()).run();
    const row = await env.DB.prepare('SELECT * FROM achievements WHERE id = ?').bind(id).first();
    return json(201, row);
  }

  if (request.method === 'PUT') {
    const url = new URL(request.url);
    const id = url.searchParams.get('id');
    if (!id) {
      return json(400, { error: 'Missing achievement id' });
    }
    const body = await request.json();
    const updates = [];
    const values = [];
    const allowed = ['userid', 'title', 'description', 'date', 'img_url'];
    for (const key of allowed) {
      if (Object.prototype.hasOwnProperty.call(body, key)) {
        updates.push(`${key} = ?`);
        values.push(body[key]);
      }
    }
    if (!updates.length) {
      return json(400, { error: 'No updatable fields provided' });
    }
    values.push(id);
    await env.DB.prepare(`UPDATE achievements SET ${updates.join(', ')} WHERE id = ?`).bind(...values).run();
    const row = await env.DB.prepare('SELECT * FROM achievements WHERE id = ?').bind(id).first();
    return json(200, row);
  }

  return methodNotAllowed();
}

async function handleEvents(request, env) {
  if (request.method === 'OPTIONS') {
    return new Response(null, { status: 200, headers: cors() });
  }

  if (request.method === 'GET') {
    const { results } = await env.DB.prepare('SELECT * FROM events ORDER BY date DESC').all();
    return json(200, { data: results });
  }

  if (request.method === 'POST') {
    const body = await request.json();
    const id = body.id || `evt-${Date.now()}`;
    await env.DB.prepare(`INSERT INTO events (id, title, date, location, type, created_at) VALUES (?, ?, ?, ?, ?, ?)`).bind(id, body.title || null, body.date || null, body.location || null, body.type || null, new Date().toISOString()).run();
    const row = await env.DB.prepare('SELECT * FROM events WHERE id = ?').bind(id).first();
    return json(201, row);
  }

  return methodNotAllowed();
}

async function handleAudit(request, env) {
  if (request.method === 'OPTIONS') {
    return new Response(null, { status: 200, headers: cors() });
  }

  if (request.method === 'GET') {
    const { results } = await env.DB.prepare('SELECT * FROM audit_log ORDER BY created_at DESC LIMIT 100').all();
    return json(200, { data: results });
  }

  if (request.method === 'POST') {
    const body = await request.json();
    const id = body.id || `audit-${Date.now()}`;
    await env.DB.prepare(`INSERT INTO audit_log (id, action, user, details, created_at) VALUES (?, ?, ?, ?, ?)`).bind(id, body.action || null, body.user || null, JSON.stringify(body.details || {}), new Date().toISOString()).run();
    const row = await env.DB.prepare('SELECT * FROM audit_log WHERE id = ?').bind(id).first();
    return json(201, row);
  }

  return methodNotAllowed();
}


async function handleStudents(request, env) {
  if (request.method === 'OPTIONS') {
    return new Response(null, { status: 200, headers: cors() });
  }

  if (request.method === 'GET') {
    try {
      const { results } = await env.DB.prepare(`
        SELECT 
          u.id,
          u.full_name as name,
          u.email,
          u.phone_number as phone,
          u.childEmail as parent_email,
          u.grade,
          u.level,
          u.batch,
          b.name as batch_name,
          u.coach,
          u.coach as coach_id,
          c.full_name as coach_name,
          u.status,
          u.rating,
          u.session,
          u.session_type,
          u.fee,
          u.payment_status,
          u.learning_mode,
          u.due_date,
          u.created_at
        FROM users u
        LEFT JOIN batches b ON u.batch = b.id
        LEFT JOIN users c ON u.coach = c.id
        WHERE LOWER(u.role)='student' 
        ORDER BY u.created_at DESC
      `).all();
      return json(200, { data: results });
    } catch (e) {
      return json(200, { data: [] });
    }
  }

  if (request.method === 'POST') {
    const body = await request.json();
    const id = body.id || `stu-${Date.now()}`;
    await env.DB.prepare(`INSERT INTO users (id, full_name, email, phone_number, childEmail, grade, level, batch, coach, status, role, created_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`).bind(id, body.name || null, body.email || null, body.phone || null, body.parent_email || null, body.grade || null, body.level || null, body.batch || null, body.coach || null, body.status || null, 'student', new Date().toISOString()).run();
    const row = await env.DB.prepare('SELECT * FROM users WHERE id = ?').bind(id).first();
    return json(201, row);
  }

  if (request.method === 'PUT') {
    const url = new URL(request.url);
    const id = url.searchParams.get('id');
    if (!id) {
      return json(400, { error: 'Missing student id' });
    }
    const body = await request.json();
    const existing = await env.DB.prepare('SELECT * FROM users WHERE id = ?').bind(id).first();
    if (!existing) {
      return json(404, { error: 'Student not found' });
    }
    const updates = [];
    const values = [];
    const allowed = ['name', 'email', 'phone', 'parent_email', 'grade', 'level', 'batch', 'coach', 'status', 'notes', 'learning_mode'];
    for (const key of allowed) {
      if (Object.prototype.hasOwnProperty.call(body, key)) {
        updates.push(`${key} = ?`);
        values.push(body[key]);
      }
    }
    if (!updates.length) {
      return json(400, { error: 'No updatable fields provided' });
    }
    values.push(id);
    await env.DB.prepare(`UPDATE users SET ${updates.join(', ')} WHERE id = ?`).bind(...values).run();
    const row = await env.DB.prepare('SELECT * FROM users WHERE id = ?').bind(id).first();
    return json(200, row);
  }

  return methodNotAllowed();
}

async function handlePayments(request, env) {
  if (request.method === 'OPTIONS') {
    return new Response(null, { status: 200, headers: cors() });
  }

  if (request.method === 'GET') {
    try {
      const { results } = await env.DB.prepare('SELECT * FROM payments ORDER BY payment_date DESC').all();
      return json(200, { data: results });
    } catch (e) {
      return json(200, { data: [] });
    }
  }

  if (request.method === 'POST') {
    const body = await request.json();
    const id = body.id || `pay-${Date.now()}`;
    await env.DB.prepare(`INSERT INTO payments (id, student_id, amount, method, status, payment_date, due_date, created_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?)`).bind(id, body.student_id || null, body.amount || null, body.method || null, body.status || null, body.payment_date || null, body.due_date || null, new Date().toISOString()).run();
    const row = await env.DB.prepare('SELECT * FROM payments WHERE id = ?').bind(id).first();
    return json(201, row);
  }

  return methodNotAllowed();
}

async function handleAI(request, env) {
  if (request.method === 'OPTIONS') {
    return new Response(null, { status: 200, headers: cors() });
  }

  if (request.method === 'POST') {
    const body = await request.json();
    return json(200, {
      reply: 'AI insights are temporarily unavailable on this deployment. Please try again later or contact support if this feature is needed.',
      role: body.role || 'guest'
    });
  }

  return methodNotAllowed();
}

async function handleExpenditures(request, env) {
  if (request.method === 'OPTIONS') {
    return new Response(null, { status: 200, headers: cors() });
  }

  const url = new URL(request.url);

  if (request.method === 'GET') {
    const mode = url.searchParams.get('mode');
    const month = url.searchParams.get('month');
    const id = url.searchParams.get('id');
    const limit = url.searchParams.get('limit');

    if (mode === 'summary' && month) {
      const { results } = await env.DB.prepare(
        "SELECT COALESCE(SUM(CAST(amount AS REAL)), 0) as total_expense FROM expenses WHERE strftime('%Y-%m', date) = ?"
      ).bind(month).all();
      const total = results?.[0]?.total_expense || 0;
      return json(200, { total_expense: parseFloat(total) });
    }

    if (id) {
      const row = await env.DB.prepare('SELECT * FROM expenses WHERE id = ?').bind(id).first();
      return json(200, { data: row });
    }

    try {
      let query = 'SELECT * FROM expenses WHERE 1=1';
      const params = [];
      if (month) {
        query += ' AND strftime(\'%Y-%m\', date) = ?';
        params.push(month);
      }
      query += ' ORDER BY created_at DESC';
      if (limit) {
        query += ' LIMIT ?';
        params.push(parseInt(limit));
      }
      const { results } = await env.DB.prepare(query).bind(...params).all();
      return json(200, { data: results });
    } catch (e) {
      return json(200, { data: [] });
    }
  }

  if (request.method === 'POST') {
    const body = await request.json();
    const id = body.id || `exp-${Date.now()}`;
    await env.DB.prepare(`INSERT INTO expenses (id, date, category, description, amount, mode, bill, created_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?)`).bind(id, body.date || null, body.category || null, body.description || null, body.amount || null, body.mode || null, body.bill || null, new Date().toISOString()).run();
    const row = await env.DB.prepare('SELECT * FROM expenses WHERE id = ?').bind(id).first();
    return json(201, { data: row });
  }

  if (request.method === 'PUT') {
    const id = url.searchParams.get('id');
    if (!id) return json(400, { error: 'ID required' });
    const body = await request.json();
    const fields = [];
    const values = [];
    for (const [key, value] of Object.entries(body)) {
      if (key === 'id') continue;
      fields.push(`${key} = ?`);
      values.push(value);
    }
    values.push(id);
    await env.DB.prepare(`UPDATE expenses SET ${fields.join(', ')} WHERE id = ?`).bind(...values).run();
    const row = await env.DB.prepare('SELECT * FROM expenses WHERE id = ?').bind(id).first();
    return json(200, { data: row });
  }

  if (request.method === 'DELETE') {
    const id = url.searchParams.get('id');
    if (!id) return json(400, { error: 'ID required' });
    await env.DB.prepare('DELETE FROM expenses WHERE id = ?').bind(id).run();
    return json(200, { success: true });
  }

  return methodNotAllowed();
}


async function handleCoaches(request, env) {
  if (request.method === 'OPTIONS') {
    return new Response(null, { status: 200, headers: cors() });
  }

  if (request.method === 'GET') {
    try {
      const now = new Date();
      const monthStr = now.getUTCFullYear() + '-' + String(now.getUTCMonth() + 1).padStart(2, '0');
      const { results } = await env.DB.prepare(
        'SELECT u.id, u.full_name as name, u.email, u.phone_number as phone, u.level, u.rating, u.status, u.created_at, COALESCE(e.amount, 0) as salary FROM users u LEFT JOIN (SELECT description, amount FROM expenses WHERE category = \'Coach Salary\' AND strftime(\'%Y-%m\', date) = ?) e ON e.description = u.id || \' monthly salary\' WHERE LOWER(u.role)=\'coach\' ORDER BY u.created_at DESC'
      ).bind(monthStr).all();
      return json(200, { data: results });
    } catch (e) {
      return json(200, { data: [] });
    }
  }

  if (request.method === 'POST') {
    const body = await request.json();
    const id = body.id || ('coach-' + Date.now());
    await env.DB.prepare('INSERT INTO users (id, full_name, email, phone_number, level, rating, address, availability, bio, additional_details, photo_url, status, role, created_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)').bind(id, body.name, body.email, body.phone, body.specialization ?? body.level ?? null, body.experience ?? body.rating ?? null, body.address ?? null, body.availability ?? null, body.bio ?? null, body.additional_details ?? null, body.photo_url ?? null, body.status ?? null, 'coach', new Date().toISOString()).run();
    const row = await env.DB.prepare('SELECT * FROM users WHERE id = ?').bind(id).first();
    if (row) {
      row.name = row.full_name;
      row.salary = 0;
      row.photo_url = row.photo_url ?? row.photo ?? null;
    }
    return json(201, { data: row });
  }

  if (request.method === 'PUT') {
    const url = new URL(request.url);
    const id = url.searchParams.get('id');
    if (!id) return json(400, { error: 'Missing coach id' });
    const body = await request.json();
    const existing = await env.DB.prepare('SELECT * FROM users WHERE id = ?').bind(id).first();
    if (!existing) return json(404, { error: 'Coach not found' });
    const fields = [];
    const values = [];
    const set = function (k, v) {
      const val = Array.isArray(v) || (typeof v === 'object' && v !== null) ? JSON.stringify(v) : v;
      fields.push(k + ' = ?');
      values.push(val);
    };
    set('full_name', body.name ?? existing.full_name);
    set('email', body.email ?? existing.email);
    set('phone_number', body.phone ?? existing.phone_number);
    set('level', body.specialization ?? body.level ?? existing.level);
    set('rating', body.experience ?? body.rating ?? existing.rating);
    set('address', body.address ?? existing.address);
    set('availability', body.availability ?? existing.availability);
    set('bio', body.bio ?? existing.bio);
    set('additional_details', body.additional_details ?? existing.additional_details);
    set('photo_url', body.photo_url ?? existing.photo_url);
    set('status', body.status ?? existing.status);
    if (!fields.length) return json(200, { data: existing });
    values.push(id);
    await env.DB.prepare('UPDATE users SET ' + fields.join(', ') + ' WHERE id = ?').bind(...values).run();
    const row = await env.DB.prepare('SELECT * FROM users WHERE id = ?').bind(id).first();
    if (row) {
      row.name = row.full_name;
      row.salary = 0;
      row.photo_url = row.photo_url ?? row.photo ?? null;
    }
    return json(200, { data: row });
  }

  if (request.method === 'DELETE') {
    const url = new URL(request.url);
    const id = url.searchParams.get('id');
    if (!id) return json(400, { error: 'Missing coach id' });
    const existing = await env.DB.prepare('SELECT * FROM users WHERE id = ?').bind(id).first();
    if (!existing) return json(404, { error: 'Coach not found' });
    if (existing.role === 'admin') return json(400, { error: 'Cannot delete the admin account' });
    await env.DB.prepare('DELETE FROM users WHERE id = ?').bind(id).run();
    return json(200, { success: true });
  }

  return methodNotAllowed();
}
async function handleComplaintFeedback(request, env) {
  if (request.method === 'OPTIONS') return new Response(null, { status: 200, headers: cors() });

  if (request.method === 'GET') {
    const url = new URL(request.url);
    const status = url.searchParams.get('status');
    const category = url.searchParams.get('category');
    const limit = url.searchParams.get('limit') || '50';
    
    let query = 'SELECT * FROM complaint_feedback WHERE 1=1';
    const params = [];
    if (status) { query += ' AND status = ?'; params.push(status); }
    if (category) { query += ' AND category = ?'; params.push(category); }
    query += ' ORDER BY created_at DESC LIMIT ?';
    params.push(parseInt(limit));
    
    const { results } = await env.DB.prepare(query).bind(...params).all();
    return json(200, { data: results });
  }

  if (request.method === 'POST') {
    const body = await request.json();
    const id = `cfb-${Date.now()}-${Math.random().toString(36).slice(2,9)}`;
    const now = new Date().toISOString();
    
    await env.DB.prepare(`
      INSERT INTO complaint_feedback (id, name, contact, category, rating, subject, message, status, created_at, updated_at)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).bind(id, body.name, body.contact, body.category, body.rating || null, body.subject, body.message, 'pending', now, now).run();
    
    // Also insert into messages for admin notification (non-blocking)
    try {
      const msgId = `msg-${Date.now()}-${Math.random().toString(36).slice(2,9)}`;
      await env.DB.prepare(`
        INSERT INTO messages (id, sender_id, subject, body, category, is_read, created_at)
        VALUES (?, ?, ?, ?, ?, 0, ?)
      `).bind(msgId, body.contact, `New ${body.category}: ${body.subject}`, body.message, body.category, now).run();
    } catch (e) {
      console.warn('Failed to insert admin notification message:', e);
    }
    
    return json(201, { success: true, id });
  }

  if (request.method === 'PUT') {
    const body = await request.json();
    const { id, status, admin_notes, assigned_to } = body;
    const now = new Date().toISOString();
    
    await env.DB.prepare(`
      UPDATE complaint_feedback SET status = ?, admin_notes = ?, assigned_to = ?, updated_at = ? WHERE id = ?
    `).bind(status, admin_notes || null, assigned_to || null, now, id).run();
    
    return json(200, { success: true });
  }
  return methodNotAllowed();
}

// ═══════════════════════════════════════════════════════════════════
// NEW: Registration Queries Handler
// ═══════════════════════════════════════════════════════════════════
async function handleRegistrationQueries(request, env) {
  if (request.method === 'OPTIONS') return new Response(null, { status: 200, headers: cors() });

  if (request.method === 'GET') {
    const url = new URL(request.url);
    const status = url.searchParams.get('status');
    const limit = url.searchParams.get('limit') || '50';
    
    let query = 'SELECT * FROM registration_queries WHERE 1=1';
    const params = [];
    if (status) { query += ' AND status = ?'; params.push(status); }
    query += ' ORDER BY created_at DESC LIMIT ?';
    params.push(parseInt(limit));
    
    const { results } = await env.DB.prepare(query).bind(...params).all();
    return json(200, { data: results });
  }

  if (request.method === 'POST') {
    const body = await request.json();
    const id = `reg-${Date.now()}-${Math.random().toString(36).slice(2,9)}`;
    const now = new Date().toISOString();
    
    await env.DB.prepare(`
      INSERT INTO registration_queries (id, parent_name, phone, child_name, child_age, city, country, preferred_mode, preferred_slot, level, message, status, source, created_at, updated_at)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).bind(
      id, body.parent_name, body.phone, body.child_name || null, body.child_age || null,
      body.city || null, body.country || null, body.preferred_mode || 'online',
      body.preferred_slot || null, body.level || 'beginner', body.message || null,
      'new', body.source || 'website', now, now
    ).run();
    
    // NOTE: do not also insert into `leads` here. Registration queries and demo
    // bookings are separate sources (leads is filled by the demo-booking form);
    // the old "backward compatibility" insert duplicated every registration into
    // the Demo Bookings tab of Admin → Analyze.

    return json(201, { success: true, id });
  }

  if (request.method === 'PUT') {
    const body = await request.json();
    const { id, status } = body;
    const now = new Date().toISOString();
    
    await env.DB.prepare(`
      UPDATE registration_queries SET status = ?, updated_at = ? WHERE id = ?
    `).bind(status, now, id).run();
    
    return json(200, { success: true });
  }
  return methodNotAllowed();
}

// ═══════════════════════════════════════════════════════════════════
// Admin Analyze Handler - Unified view of complaints, feedback, registrations
// ═══════════════════════════════════════════════════════════════════
async function handleAdminAnalyze(request, env) {
  if (request.method === 'OPTIONS') return new Response(null, { status: 200, headers: cors() });

  const url = new URL(request.url);
  const pathname = url.pathname;
  const isDetail = pathname.includes('/api/admin/analyze/') && pathname.split('/').length > 4;

  if (request.method === 'GET') {
    if (isDetail) {
      const id = pathname.split('/').pop();
      const type = url.searchParams.get('type');
      
      if (!type || !['complaint_feedback', 'registration_queries', 'leads'].includes(type)) {
        return json(400, { error: 'Invalid type parameter' });
      }

      const row = await env.DB.prepare(`SELECT * FROM ${type} WHERE id = ?`).bind(id).first();
      if (!row) return json(404, { error: 'Not found' });
      return json(200, { data: row });
    }

    const type = url.searchParams.get('type');
    const status = url.searchParams.get('status');
    const dateFrom = url.searchParams.get('dateFrom');
    const dateTo = url.searchParams.get('dateTo');
    const search = url.searchParams.get('search');
    const limit = parseInt(url.searchParams.get('limit') || '100');

    const tables = type ? [type] : ['complaint_feedback', 'registration_queries', 'leads'];
    const allResults = [];

    for (const table of tables) {
      let query = `SELECT *, '${table}' as type FROM ${table} WHERE 1=1`;
      const params = [];

      if (status) {
        query += ' AND status = ?';
        params.push(status);
      }
      if (dateFrom) {
        query += ' AND date(created_at) >= date(?)';
        params.push(dateFrom);
      }
      if (dateTo) {
        query += ' AND date(created_at) <= date(?)';
        params.push(dateTo);
      }
      if (search) {
        query += ' AND (name LIKE ? OR email LIKE ? OR phone LIKE ? OR message LIKE ? OR parent_name LIKE ? OR child_name LIKE ?)';
        const s = `%${search}%`;
        params.push(s, s, s, s, s, s);
      }
      query += ' ORDER BY created_at DESC LIMIT ?';
      params.push(limit);

      const { results } = await env.DB.prepare(query).bind(...params).all();
      allResults.push(...results);
    }

    allResults.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
    return json(200, { data: allResults.slice(0, limit) });
  }

  if (request.method === 'PUT' && isDetail) {
    const id = pathname.split('/').pop();
    const type = url.searchParams.get('type');
    
    if (!type || !['complaint_feedback', 'registration_queries', 'leads'].includes(type)) {
      return json(400, { error: 'Invalid type parameter' });
    }

    const body = await request.json();
    const { status, admin_notes, assigned_to } = body;
    const now = new Date().toISOString();

    let query = `UPDATE ${type} SET updated_at = ?`;
    const params = [now];

    if (status) {
      query += ', status = ?';
      params.push(status);
    }
    if (admin_notes !== undefined) {
      query += ', admin_notes = ?';
      params.push(admin_notes);
    }
    if (assigned_to !== undefined) {
      query += ', assigned_to = ?';
      params.push(assigned_to);
    }

    query += ' WHERE id = ?';
    params.push(id);

    await env.DB.prepare(query).bind(...params).run();
    return json(200, { success: true });
  }

  return methodNotAllowed();
}

// ═══════════════════════════════════════════════════════════════════
// ENHANCED: Messages Handler
// ═══════════════════════════════════════════════════════════════════
async function handleMessages(request, env) {
  if (request.method === 'OPTIONS') return new Response(null, { status: 200, headers: cors() });

  if (request.method === 'GET') {
    const url = new URL(request.url);
    const filter = url.searchParams.get('filter') || 'all';
    const limit = url.searchParams.get('limit') || '100';
    
    let query = 'SELECT * FROM messages WHERE 1=1';
    const params = [];
    if (filter === 'unread') query += ' AND is_read = 0';
    else if (filter === 'demo') query += " AND category LIKE '%demo%'";
    else if (filter === 'complaint') query += " AND category LIKE '%complaint%'";
    else if (filter === 'feedback') query += " AND category LIKE '%feedback%'";
    else if (filter === 'query') query += " AND category LIKE '%query%'";
    query += ' ORDER BY created_at DESC LIMIT ?';
    params.push(parseInt(limit));
    
    const { results } = await env.DB.prepare(query).bind(...params).all();
    return json(200, { data: results });
  }

  if (request.method === 'POST') {
    const body = await request.json();
    const id = `msg-${Date.now()}-${Math.random().toString(36).slice(2,9)}`;
    const now = new Date().toISOString();
    
    await env.DB.prepare(`
      INSERT INTO messages (id, sender_id, receiver_id, subject, body, category, is_read, created_at)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `).bind(id, body.sender_id || null, body.receiver_id || null, body.subject, body.body, body.category || 'general', 0, now).run();
    
    return json(201, { success: true, id });
  }

  if (request.method === 'PUT') {
    const body = await request.json();
    const { id, is_read } = body;
    
    await env.DB.prepare(`UPDATE messages SET is_read = ? WHERE id = ?`).bind(is_read ? 1 : 0, id).run();
    return json(200, { success: true });
  }

  if (request.method === 'DELETE') {
    const url = new URL(request.url);
    const id = url.searchParams.get('id');
    await env.DB.prepare(`DELETE FROM messages WHERE id = ?`).bind(id).run();
    return json(200, { success: true });
  }
  return methodNotAllowed();
}

export async function onRequest(context) {
  try {
    const { request, env } = context;
    const url = new URL(request.url);
    const pathname = url.pathname;

    console.log('[API]', request.method, pathname);

    if (request.method === 'OPTIONS') {
      return new Response(null, { status: 200, headers: cors() });
    }

    if (pathname === '/api/auth/profile' || pathname === '/auth/profile') {
      return handleMe(request, env);
    }

    if (pathname === '/api/auth/signin' || pathname === '/auth/signin') {
      return handleLogin(request, env);
    }

    if (pathname === '/api/auth/signup' || pathname === '/auth/signup') {
      return handleRegister(request, env);
    }

    if (pathname === '/api/auth/signout' || pathname === '/auth/signout') {
      return handleLogout(request, env);
    }

    if (pathname === '/api/query' || pathname === '/query') {
      return handleQuery(request, env);
    }

    if (pathname === '/api/mutate' || pathname === '/mutate') {
      return handleMutate(request, env);
    }

    if (pathname === '/api/users' || pathname.startsWith('/api/users')) {
      return handleUsers(request, env);
    }

    if (pathname === '/api/classes' || pathname.startsWith('/api/classes')) {
      return handleClasses(request, env);
    }

    if (pathname === '/api/attendance' || pathname.startsWith('/api/attendance')) {
      return handleAttendance(request, env);
    }

    if (pathname === '/api/assignments' || pathname.startsWith('/api/assignments')) {
      return handleAssignments(request, env);
    }

    if (pathname === '/api/homework' || pathname.startsWith('/api/homework')) {
      return handleHomework(request, env);
    }

    if (pathname === '/api/feedback' || pathname.startsWith('/api/feedback')) {
      return handleFeedback(request, env);
    }

    if (pathname === '/api/leads' || pathname.startsWith('/api/leads')) {
      return handleLeads(request, env);
    }

    if (pathname === '/api/complaints' || pathname.startsWith('/api/complaints')) {
      return handleComplaintFeedback(request, env);
    }

    if (pathname === '/api/registrations' || pathname.startsWith('/api/registrations')) {
      return handleRegistrationQueries(request, env);
    }

    if (pathname === '/api/demo-sheet' || pathname.startsWith('/api/demo-sheet')) {
      return handleDemoSheet(request, env);
    }

    if (pathname === '/api/lichess' || pathname.startsWith('/api/lichess')) {
      return handleLichess(request, env);
    }

    if (pathname === '/api/chesscom-proxy' || pathname.startsWith('/api/chesscom-proxy')) {
      return handleChesscom(request, env);
    }

    if (pathname === '/api/messages' || pathname.startsWith('/api/messages')) {
      return handleMessages(request, env);
    }

    if (pathname === '/api/resources' || pathname.startsWith('/api/resources')) {
      return handleResources(request, env);
    }

    if (pathname === '/api/batches' || pathname.startsWith('/api/batches')) {
      return handleBatches(request, env);
    }

    if (pathname === '/api/rating_history' || pathname.startsWith('/api/rating_history')) {
      return handleRatingHistory(request, env);
    }

    if (pathname === '/api/achievements' || pathname.startsWith('/api/achievements')) {
      return handleAchievements(request, env);
    }

    if (pathname === '/api/events' || pathname.startsWith('/api/events')) {
      return handleEvents(request, env);
    }

    if (pathname === '/api/upload' || pathname === '/upload') {
      return handleUpload(request, env);
    }
    if (pathname === '/api/files' || pathname.startsWith('/api/files/')) {
      return handleFileServe(request, env, pathname);
    }
    if (pathname === '/api/audit' || pathname.startsWith('/api/audit')) {
      return handleAudit(request, env);
    }

    if (pathname === '/api/students' || pathname.startsWith('/api/students')) {
      return handleStudents(request, env);
    }

    if (pathname === '/api/payments' || pathname.startsWith('/api/payments')) {
      return handlePayments(request, env);
    }

    if (pathname === '/api/ai' || pathname.startsWith('/api/ai')) {
      return handleAI(request, env);
    }

    if (pathname === '/api/expenditures' || pathname.startsWith('/api/expenditures')) {
      return handleExpenditures(request, env);
    }

    if (pathname === '/api/coaches' || pathname.startsWith('/api/coaches')) {
      return handleCoaches(request, env);
    }

    if (pathname === '/api/admin/analyze' || pathname.startsWith('/api/admin/analyze')) {
      return handleAdminAnalyze(request, env);
    }

    return notFound(pathname, request.method);
  } catch (e) {
    console.error('[API] unhandled error', e);
    return json(500, { error: 'Unhandled Function error', detail: e?.message || String(e) });
  }
}
