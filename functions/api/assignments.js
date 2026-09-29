export default {
  async fetch(request, env) {
    const url = new URL(request.url);
    const id = url.searchParams.get('id');

    if (request.method === 'OPTIONS') {
      return new Response(null, { status: 200, headers: cors() });
    }

    if (request.method === 'GET' && id) {
      const row = await env.DB.prepare('SELECT * FROM assignments WHERE id = ?').first(id);
      if (!row) return json(404, { error: 'Not found' });
      return json(200, row);
    }

    if (request.method === 'GET') {
      const { results } = await env.DB.prepare('SELECT * FROM assignments ORDER BY created DESC').all();
      return json(200, { data: results });
    }

    if (request.method === 'POST') {
      const body = await request.json();
      const id = body.id || `asn-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
      const now = Date.now();

      await env.DB.prepare(
        `INSERT INTO assignments (id, title, pgn, type, assignedTo, dueDate, description, coach, moves, created, created_at)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`
      ).bind(
        id,
        body.title,
        body.pgn || null,
        body.type || null,
        JSON.stringify(body.assignedTo || []),
        body.dueDate || null,
        body.description || null,
        body.coach || null,
        body.moves ? JSON.stringify(body.moves) : null,
        now,
        new Date().toISOString()
      ).run();

      const row = await env.DB.prepare('SELECT * FROM assignments WHERE id = ?').first(id);
      return json(201, row);
    }

    if (request.method === 'PUT' || request.method === 'PATCH') {
      const body = await request.json();
      const id = body.id;
      if (!id) return json(400, { error: 'ID required' });

      const fields = [];
      const values = [];
      const allowed = ['title', 'pgn', 'type', 'assignedTo', 'dueDate', 'description', 'coach', 'moves'];
      for (const key of allowed) {
        if (key in body) {
          let val = body[key];
          if (key === 'assignedTo' || key === 'moves') val = JSON.stringify(val);
          fields.push(`${key} = ?`);
          values.push(val);
        }
      }
      values.push(id);
      await env.DB.prepare(`UPDATE assignments SET ${fields.join(', ')} WHERE id = ?`).bind(...values).run();
      const row = await env.DB.prepare('SELECT * FROM assignments WHERE id = ?').first(id);
      return json(200, row);
    }

    if (request.method === 'DELETE') {
      const delId = id || (await request.json()).id;
      if (!delId) return json(400, { error: 'ID required' });
      await env.DB.prepare('DELETE FROM assignments WHERE id = ?').bind(delId).run();
      return json(200, { success: true });
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

function json(status, body) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { 'Content-Type': application/json, ...cors() }
  });
}

