const base = 'https://chesskidoo.pages.dev';

(async () => {
  let pass = 0, fail = 0;
  const check = (name, cond) => { if (cond) { pass++; } else { fail++; console.log('FAIL:', name); } };

  // 1. Login
  const login = await fetch(base + '/api/auth/signin', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ username: 'admin@gmail.com', password: 'admin123' })
  });
  const lb = await login.json();
  check('Login', login.status === 200 && lb.success);
  const token = lb.token;

  // 2. Homework create
  const hw = await fetch(base + '/api/homework', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'Authorization': 'Bearer ' + token },
    body: JSON.stringify({ id: 'regression-hw-1', title: 'Regression Test', target_type: 'all', description: 'test', coach_id: 'admin-admin', due_date: '2026-11-15' })
  });
  check('Homework create', hw.status === 201);

  // 3. Homework read
  const list = await (await fetch(base + '/api/homework')).json();
  check('Homework read', !!(list.data || []).find(h => String(h.id) === 'regression-hw-1'));

  // 4. Homework submit
  const sub = await fetch(base + '/api/homework?action=submit', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'x-portal-student-id': 'test-student' },
    body: JSON.stringify({ assignment_id: 'regression-hw-1', student_id: 'test-student', submission_text: 'done' })
  });
  check('Homework submit', sub.status === 201);

  // 5. Homework review
  const rev = await fetch(base + '/api/homework?action=review&id=regression-hw-1', {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ status: 'reviewed', feedback: 'good', score: 95 })
  });
  check('Homework review', rev.status === 200);

  // 6. Homework edit
  const edit = await fetch(base + '/api/homework?id=regression-hw-1', {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ title: 'Edited Regression' })
  });
  check('Homework edit', edit.status === 200);

  // 7. Homework delete
  const del = await fetch(base + '/api/homework?id=regression-hw-1', { method: 'DELETE' });
  check('Homework delete', del.status === 200);

  // 8. Verify deleted
  const final = await (await fetch(base + '/api/homework')).json();
  check('Homework gone after delete', !!(final.data || []).find(h => String(h.id) === 'regression-hw-1') === false);

  // 9. Attendance create
  const att = await fetch(base + '/api/attendance', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'Authorization': 'Bearer ' + token },
    body: JSON.stringify({ student_id: 'regression-student', date: '2026-10-28', status: 'present' })
  });
  check('Attendance create', att.status === 201);

  // 10. Attendance read
  const attList = await (await fetch(base + '/api/attendance')).json();
  check('Attendance read', !!(attList.data || []).find(a => a.studentId === 'regression-student' && a.date === '2026-10-28'));

  // 11. All LMS assets load
  const assets = ['/lms', '/lms/scripts.js', '/lms/js/homework.js', '/lms/js/attendance_extension.js', '/lms/js/cloudflare-client.js', '/lms/js/config.js', '/lms/js/coach.js'];
  for (const p of assets) {
    const r = await fetch(base + p);
    check('Asset ' + p, r.status === 200);
  }

  // 12. Landing page
  const land = await (await fetch(base + '/')).text();
  check('Landing loads', land.startsWith('<!DOCTYPE'));
  check('Landing has high-contrast', land.includes('high-contrast'));

  console.log('\n=== RESULTS ===');
  console.log('PASS:', pass, 'FAIL:', fail);
})();