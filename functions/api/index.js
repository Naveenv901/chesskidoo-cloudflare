export default {
  async fetch(request, env) {
    const url = new URL(request.url);
    const pathname = url.pathname;

    console.log(`[API] ${request.method} ${pathname}`);

    if (request.method === 'OPTIONS') {
      return new Response(null, { status: 200, headers: cors() });
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

    if (pathname === '/api/auth/profile' || pathname === '/auth/profile') {
      return handleMe(request, env);
    }

    if (pathname.startsWith('/api/users')) {
      return handleUsers(request, env);
    }

    if (pathname.startsWith('/api/classes')) {
      return handleClasses(request, env);
    }

    if (pathname.startsWith('/api/attendance')) {
      return handleAttendance(request, env);
    }

    if (pathname.startsWith('/api/assignments')) {
      return handleAssignments(request, env);
    }

    if (pathname.startsWith('/api/homework')) {
      return handleHomework(request, env);
    }

    if (pathname.startsWith('/api/feedback')) {
      return handleFeedback(request, env);
    }

    if (pathname.startsWith('/api/leads')) {
      return handleLeads(request, env);
    }

    if (pathname.startsWith('/api/demo-sheet')) {
      return handleDemoSheet(request, env);
    }

    if (pathname.startsWith('/api/lichess')) {
      return handleLichess(request, env);
    }

    if (pathname.startsWith('/api/chesscom-proxy')) {
      return handleChesscom(request, env);
    }

    if (pathname === '/api/query') {
      return handleQuery(request, env);
    }

    if (pathname === '/api/mutate') {
      return handleMutate(request, env);
    }

    return new Response(JSON.stringify({ error: 'Not Found', pathname, method: request.method }), {
      status: 404,
      headers: { 'Content-Type': 'application/json', ...cors() }
    });
  }
};
