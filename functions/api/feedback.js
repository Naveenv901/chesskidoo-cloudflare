export default {
  async fetch(request, env) {
    if (request.method === 'OPTIONS') {
      return new Response(null, { status: 200, headers: cors() });
    }

    if (request.method === 'GET') {
      const url = new URL(request.url);
      const childId = url.searchParams.get('childId');
      const toId = url.searchParams.get('toId');
      const fromId = url.searchParams.get('fromId');

      let query = 'SELECT * FROM feedback WHERE 1=1';
      const params = [];
      if (childId) { query += ' AND childId = ?'; params.push(childId); }
      if (toId) { query += ' AND toId = ?'; params.push(toId); }
      if (fromId) { query += ' AND fromId = ?'; params.push(fromId); }

      query += ' ORDER BY created_at DESC';
      const { results } = await env.DB.prepare(query).bind(...params).all();
      return json(200, { data: results });
    }

    if (request.method === 'POST') {
      const body = await request.json();
      const id = body.id || `fb-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
      const now = new Date().toISOString();

      await env.DB.prepare(
        `INSERT INTO feedback (id, fromId, fromName, fromRole, childId, childName, toId, toName, message, rating, category, replied, reply, parent_name, parent_email, student_email, text, status, created_at)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`
      ).bind(
        id,
        body.fromId || null,
        body.fromName || null,
        body.fromRole || null,
        body.childId || null,
        body.childName || null,
        body.toId || null,
        body.toName || null,
        body.message || null,
        body.rating ?? null,
        body.category || null,
        body.replied ? 1 : 0,
        body.reply || null,
        body.parent_name || null,
        body.parent_email || null,
        body.student_email || null,
        body.text || null,
        body.status || null,
        now
      ).run();

      const row = await env.DB.prepare('SELECT * FROM feedback WHERE id = ?').first(id);
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
