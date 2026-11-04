const base = 'https://chesskidoo.pages.dev';

(async () => {
  const users = await (await fetch(base + '/api/query?table=users')).json();
  const coaches = (users.data || []).filter(u => u.role === 'coach');
  console.log('Coach sample:', JSON.stringify(coaches[0]));

  const login = await fetch(base + '/api/auth/signin', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ username: 'rohith@gmail.com', password: 'coach123' })
  });
  const lb = await login.json();
  console.log('Coach login:', login.status, JSON.stringify(lb).slice(0, 200));
})();