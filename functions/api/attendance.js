export default {
  async fetch(request, env) {
    const url = new URL(request.url);

    if (request.method === 'OPTIONS') {
      return new Response(null, { status: 200, headers: cors() });
    }

    if (request.method === 'GET') {
      const userid = url.searchParams.get('userid');
      const date = url.searchParams.get('date');
      const classId = url.searchParams.get('classId');

      let query = 'SELECT * FROM attendance WHERE 1=1';
      const params = [];

      if (userid) { query += ' AND userid = ?'; params.push(userid); }
      if (date) { query += ' AND date = ?'; params.push(date); }
      if (classId) { query += ' AND classId = ?'; params.push(classId); }

      query += ' ORDER BY date DESC';
      const { results } = await env.DB.prepare(query).bind(...params).all();
      return json(200, { data: results });
    }

    if (request.method === 'POST') {
      const body = await request.json();
      const id = body.id || `att-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
      const now = new Date().toISOString();

      await env.DB.prepare(
        `INSERT OR REPLACE INTO attendance (id, userid, studentId, studentName, classId, className, coachId, coachName, markedAt, date, status, class_title, created_at)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`
      ).bind(
        id,
        body.userid || null,
        body.studentId || null,
        body.studentName || null,
        body.classId || null,
        body.className || null,
        body.coachId || null,
        body.coachName || null,
        body.markedAt || now,
        body.date || null,
        body.status || null,
        body.class_title || null,
        now
      ).run();

      const row = await env.DB.prepare('SELECT * FROM attendance WHERE id = ?').first(id);
      return json(201, row);
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

function json(status, body) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { 'Content-Type': application/json, ...cors() }
  });
}
