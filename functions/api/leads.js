export default {
  async fetch(request, env) {
    if (request.method === 'OPTIONS') {
      return new Response(null, { status: 200, headers: cors() });
    }

    if (request.method === 'POST') {
      try {
        const body = await request.json();
        const id = `lead-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
        const now = new Date().toISOString();

        await env.DB.prepare(
          `INSERT INTO leads (id, name, phone, parent_name, child_age, city, status, email, message, source, full_name, age, created_at)
           VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`
        ).bind(
          id,
          body.name || body.parentName || null,
          body.phone || null,
          body.parent_name || body.parentName || null,
          body.child_age || body.childAge || null,
          body.city || 'Not specified',
          body.status || 'new',
          body.email || null,
          body.message || null,
          body.source || 'website',
          body.full_name || body.name || null,
          body.age || body.childAge || null,
          now
        ).run();

        return json(200, { success: true, id });
      } catch (e) {
        return json(500, { error: 'Failed to save lead' });
      }
    }

    if (request.method === 'GET') {
      const { results } = await env.DB.prepare('SELECT * FROM leads ORDER BY created_at DESC').all();
      return json(200, { data: results });
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
    headers: { 'Content-Type': application/json', ...cors() }
  });
}
