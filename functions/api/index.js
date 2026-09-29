export default {
  async fetch(request, env) {
    const url = new URL(request.url);
    const pathname = url.pathname;
    console.log(`[API] ${request.method} ${pathname}`);

    if (request.method === 'OPTIONS') {
      return new Response(null, { status: 200, headers: cors() });
    }

    if (request.method === 'POST' && (pathname === '/api/auth/login' || pathname === '/auth/login')) {
      return handleLogin(request, env);
    }

    if (request.method === 'POST' && (pathname === '/api/auth/register' || pathname === '/auth/register')) {
      return handleRegister(request, env);
    }

    if (request.method === 'POST' && (pathname === '/api/auth/logout' || pathname === '/auth/logout')) {
      return handleLogout(request, env);
    }

    if (request.method === 'GET' && (pathname === '/api/auth/me' || pathname === '/auth/me')) {
      return handleMe(request, env);
    }

    if ((pathname === '/api/query' || pathname === '/query')) {
      return handleQuery(request, env);
    }

    if ((pathname === '/api/mutate' || pathname === '/mutate')) {
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

    if (pathname === '/api/demo-sheet' || pathname.startsWith('/api/demo-sheet')) {
      return handleDemoSheet(request, env);
    }

    if (pathname === '/api/lichess' || pathname.startsWith('/api/lichess')) {
      return handleLichess(request, env);
    }

    if (pathname === '/api/chesscom-proxy' || pathname.startsWith('/api/chesscom-proxy')) {
      return handleChesscom(request, env);
    }

    if (request.method === 'POST' && pathname.includes('login')) {
      return handleLogin(request, env);
    }

    return new Response('Not Found', { status: 404, headers: cors() });
  }
};

function cors() {
  return {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, POST, PUT, PATCH, DELETE, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization, x-portal-role, x-portal-student-id, x-portal-coach-id'
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

// ─── Users ──────────────────────────────────────────────────────────────────

async function handleUsers(request, env) {
  const url = new URL(request.url);
  const id = url.searchParams.get('id');

  if (request.method === 'OPTIONS') {
    return new Response(null, { status: 200, headers: cors() });
  }

  if (request.method === 'GET' && id) {
    const user = await env.DB.prepare('SELECT * FROM users WHERE id = ?').first(id);
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
    const user = await env.DB.prepare('SELECT * FROM users WHERE id = ?').first(id);
    return json(201, user);
  }

  return new Response('Method Not Allowed', { status: 405, headers: cors() });
}

// ─── Classes ────────────────────────────────────────────────────────────────

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
    const row = await env.DB.prepare('SELECT * FROM classes WHERE id = ?').first(id);
    return json(201, row);
  }

  return new Response('Method Not Allowed', { status: 405, headers: cors() });
}

// ─── Attendance ─────────────────────────────────────────────────────────────

async function handleAttendance(request, env) {
  const url = new URL(request.url);

  if (request.method === 'OPTIONS') {
    return new Response(null, { status: 200, headers: cors() });
  }

  if (request.method === 'GET') {
    const userid = url.searchParams.get('userid');
    const date = url.searchParams.get('date');
    let query = 'SELECT * FROM attendance WHERE 1=1';
    const params = [];
    if (userid) { query += ' AND userid = ?'; params.push(userid); }
    if (date) { query += ' AND date = ?'; params.push(date); }
    query += ' ORDER BY date DESC';
    const { results } = await env.DB.prepare(query).bind(...params).all();
    return json(200, { data: results });
  }

  if (request.method === 'POST') {
    const body = await request.json();
    const id = body.id || `att-${Date.now()}`;
    await env.DB.prepare(`INSERT OR REPLACE INTO attendance (id, userid, studentId, studentName, classId, className, coachId, coachName, markedAt, date, status, class_title, created_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`).bind(id, body.userid || null, body.studentId || null, body.studentName || null, body.classId || null, body.className || null, body.coachId || null, body.coachName || null, body.markedAt || new Date().toISOString(), body.date || null, body.status || null, body.class_title || null, new Date().toISOString()).run();
    const row = await env.DB.prepare('SELECT * FROM attendance WHERE id = ?').first(id);
    return json(201, row);
  }

  return new Response('Method Not Allowed', { status: 405, headers: cors() });
}

// ─── Assignments ────────────────────────────────────────────────────────────

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
    const row = await env.DB.prepare('SELECT * FROM assignments WHERE id = ?').first(id);
    return json(201, row);
  }

  return new Response('Method Not Allowed', { status: 405, headers: cors() });
}

// ─── Homework ───────────────────────────────────────────────────────────────

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
      const { count } = await env.DB.prepare('SELECT COUNT(*) as c FROM hw_submissions').first();
      return json(200, { data: results, total: count?.c || 0, page, limit });
    }
    const { results } = await env.DB.prepare('SELECT * FROM hw_submissions ORDER BY submittedAt DESC').all();
    return json(200, { data: results });
  }

  if (request.method === 'POST') {
    const body = await request.json();
    const action = url.searchParams.get('action');
    if (action === 'submit') {
      const studentId = body.student_id || url.searchParams.get('student_id');
      const assignmentId = body.assignment_id || url.searchParams.get('assignment_id');
      if (!studentId || !assignmentId) return json(400, { error: 'Student ID and Assignment ID are required' });
      const existing = await env.DB.prepare('SELECT * FROM hw_submissions WHERE assignment_id = ? AND student_id = ?').first(assignmentId, studentId);
      const id = existing?.id || `sub-${Date.now()}`;
      const now = new Date().toISOString();
      await env.DB.prepare(`INSERT OR REPLACE INTO hw_submissions (id, assignment_id, student_id, submission_text, submission_url, file_urls, status, submitted_at, updated_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`).bind(id, assignmentId, studentId, body.submission_text || '', body.submission_url || '', JSON.stringify(body.file_urls || []), 'submitted', now, now).run();
      const row = await env.DB.prepare('SELECT * FROM hw_submissions WHERE id = ?').first(id);
      return json(201, { data: row, success: true });
    }
    return json(400, { error: 'Unsupported action' });
  }

  return new Response('Method Not Allowed', { status: 405, headers: cors() });
}

// ─── Feedback ───────────────────────────────────────────────────────────────

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
    const row = await env.DB.prepare('SELECT * FROM feedback WHERE id = ?').first(id);
    return json(201, row);
  }

  return new Response('Method Not Allowed', { status: 405, headers: cors() });
}

// ─── Leads ──────────────────────────────────────────────────────────────────

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

  return new Response('Method Not Allowed', { status: 405, headers: cors() });
}

// ─── Demo Sheet ─────────────────────────────────────────────────────────────

async function handleDemoSheet(request, env) {
  if (request.method === 'OPTIONS') {
    return new Response(null, { status: 200, headers: cors() });
  }

  if (request.method === 'POST') {
    const body = await request.json();
    const timestamp = body.timestamp || new Date().toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' });
    return json(200, { success: true, sheetSaved: false, timestamp, message: 'Demo class booking logged' });
  }

  return new Response('Method Not Allowed', { status: 405, headers: cors() });
}

// ─── Lichess Proxy ──────────────────────────────────────────────────────────

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

// ─── Chess.com Proxy ────────────────────────────────────────────────────────

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

