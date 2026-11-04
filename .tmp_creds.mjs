const base = 'https://chesskidoo.pages.dev';

(async () => {
  const creds = await (await fetch(base + '/api/query?table=credentials')).json();
  console.log('Credentials sample:', JSON.stringify((creds.data || []).slice(0, 3)));

  for (const pass of ['coach123', 'chess123', 'admin123', 'password', '123456']) {
    const r = await fetch(base + '/api/auth/signin', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username: 'rohith@gmail.com', password: pass })
    });
    const b = await r.json();
    console.log('Login rohith pass=' + pass + ':', r.status, b.success ? 'OK userid=' + b.userid : b.error);
  }
})();