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
    headers: { 'Content-Type': 'application/json', ...cors() }
  });
}

function withBlogImage(row) {
  if (!row) return row;
  const image = row.image || row.img_url || '';
  return { ...row, image, img_url: row.img_url || image };
}

async function ensureTable(env) {
  await env.DB.prepare(`
    CREATE TABLE IF NOT EXISTS blogs (
      id TEXT PRIMARY KEY,
      title TEXT,
      excerpt TEXT,
      content TEXT,
      author TEXT,
      image TEXT,
      created_at TEXT,
      updated_at TEXT
    )
  `).run();
  try {
    await env.DB.prepare('ALTER TABLE blogs ADD COLUMN image TEXT').run();
  } catch (_) {}
  try {
    await env.DB.prepare('ALTER TABLE blogs ADD COLUMN excerpt TEXT').run();
  } catch (_) {}
}

async function handleBlogQuery(request, env) {
  // Ensure table exists first
  await ensureTable(env);

  const url = new URL(request.url);
  const op = url.searchParams.get('op') || 'select';
  const cols = url.searchParams.get('cols') || '*';

  if (op !== 'select') {
    return new Response(JSON.stringify({ error: 'Unsupported operation' }), { status: 400, headers: { 'Content-Type': 'application/json', ...cors() } });
  }

  try {
    const { results } = await env.DB.prepare(`SELECT ${cols} FROM blogs WHERE 1=1`).all();
    return new Response(JSON.stringify({ data: (results || []).map(withBlogImage) }), { status: 200, headers: { 'Content-Type': 'application/json', ...cors() } });
  } catch (e) {
    return new Response(JSON.stringify({ error: e.message }), { status: 500, headers: { 'Content-Type': 'application/json', ...cors() } });
  }
}

async function handleBlogMutate(request, env) {
  await ensureTable(env);
  const body = await request.json();
  const { op, data } = body;

  if (!['insert', 'update', 'delete', 'upsert'].includes(op) || !data) {
    return new Response(JSON.stringify({ error: 'Invalid operation' }), { status: 400, headers: { 'Content-Type': 'application/json', ...cors() } });
  }

  try {
    if (op === 'insert') {
      const id = data.id || `blog-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
      const now = new Date().toISOString();
      const values = [id, data.title, data.excerpt || '', data.content, data.author || 'admin', data.image || '', now, now];
      await env.DB.prepare(`INSERT INTO blogs (id, title, excerpt, content, author, image, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?)`).bind(...values).run();
      const row = await env.DB.prepare('SELECT * FROM blogs WHERE id = ?').bind(id).first();
      return json(201, { data: withBlogImage(row) });
    }

    if (op === 'update') {
      const { id, title, content } = data;
      if (!id) return json(400, { error: 'ID required' });
      const now = new Date().toISOString();
      await env.DB.prepare(`UPDATE blogs SET title = ?, excerpt = COALESCE(?, excerpt), content = ?, image = ?, updated_at = ? WHERE id = ?`).bind(title, data.excerpt ?? null, content, data.image || '', now, id).run();
      const row = await env.DB.prepare('SELECT * FROM blogs WHERE id = ?').bind(id).first();
      return json(200, { data: withBlogImage(row) });
    }

    if (op === 'delete') {
      await env.DB.prepare('DELETE FROM blogs WHERE id = ?').bind(data.id).run();
      return json(200, { success: true });
    }

    if (op === 'upsert') {
      const id = data.id || `blog-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
      const now = new Date().toISOString();
      const values = [id, data.title, data.excerpt || '', data.content, data.author || 'admin', data.image || '', now, now];
      try {
        await env.DB.prepare(`INSERT INTO blogs (id, title, excerpt, content, author, image, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?)`).bind(...values).run();
      } catch {
        await env.DB.prepare(`UPDATE blogs SET title = ?, excerpt = COALESCE(?, excerpt), content = ?, image = ?, updated_at = ? WHERE id = ?`).bind(data.title, data.excerpt ?? null, data.content, data.image || '', now, id).run();
      }
      const row = await env.DB.prepare('SELECT * FROM blogs WHERE id = ?').bind(id).first();
      return json(200, { data: withBlogImage(row) });
    }

    return json(400, { error: 'Unsupported operation' });
  } catch (e) {
    return json(500, { error: e.message });
  }
}

export { handleBlogQuery, handleBlogMutate };