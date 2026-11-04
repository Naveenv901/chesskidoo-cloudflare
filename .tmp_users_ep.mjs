const base = 'https://chesskidoo.pages.dev';

(async () => {
  // Test the users endpoint that auth.js uses
  const r = await fetch(base + '/api/users?role=coach');
  console.log('GET /api/users?role=coach:', r.status);
  const t = await r.text();
  console.log('  body:', t.slice(0, 300));

  // Also check if there's a /api/users endpoint at all
  const r2 = await fetch(base + '/api/users');
  console.log('GET /api/users:', r2.status);
})();