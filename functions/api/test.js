export default {
  async fetch(request, env) {
    const url = new URL(request.url);
    const pathname = url.pathname;
    console.log('[TEST]', request.method, pathname);
    if (request.method === 'OPTIONS') {
      return new Response(null, { status: 200, headers: { 'Access-Control-Allow-Origin': '*', 'Access-Control-Allow-Methods': 'GET, POST, OPTIONS', 'Access-Control-Allow-Headers': 'Content-Type' } });
    }
    if (pathname === '/api/test' || pathname === '/test') {
      return new Response(JSON.stringify({ ok: true, method: request.method, pathname }), { status: 200, headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' } });
    }
    return new Response(JSON.stringify({ error: 'Not Found', pathname, method: request.method }), { status: 404, headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' } });
  }
};
