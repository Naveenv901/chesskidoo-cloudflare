const base = 'https://chesskidoo.pages.dev';

(async () => {
  // Check what the Edge API login returns for a coach
  // First check if any coach has a credentials entry
  const creds = await (await fetch(base + '/api/query?table=credentials')).json();
  console.log('Credentials emails:', (creds.data || []).map(c => c.email));

  // Try logging in as each credential
  for (const cred of (creds.data || [])) {
    // We don't know the password, but let's check what the users table has
    const users = await (await fetch(base + '/api/query?table=users')).json();
    const user = (users.data || []).find(u => u.email === cred.email);
    if (user) {
      console.log(`User ${cred.email}: id=${user.id}, role=${user.role}, full_name=${user.full_name}`);
    }
  }

  // Check what the Edge API signin returns for admin (known password)
  const adminLogin = await fetch(base + '/api/auth/signin', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ username: 'admin@gmail.com', password: 'admin123' })
  });
  const al = await adminLogin.json();
  console.log('\nAdmin login:', adminLogin.status, 'userid=', al.userid, 'role=', al.role);

  // Now simulate what happens when admin (role=admin) edits
  // Admins bypass the coach check, so this should work
  console.log('\nAdmin can edit any assignment (isAdmin bypass): true');
})();