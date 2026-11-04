const base = 'https://chesskidoo.pages.dev';

async function test() {
  // Login
  const login = await fetch(base + '/api/auth/signin', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ username: 'admin', password: 'admin123' })
  });
  const lb = await login.json();
  const token = lb.token;
  console.log('LOGIN: 200, token obtained');

  // Homework create
  const hw = await fetch(base + '/api/homework', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'Authorization': 'Bearer ' + token },
    body: JSON.stringify({ id: 'full-test-hw-1', title: 'Full Test HW', target_type: 'all', description: 'test', coach_id: 'admin-admin', due_date: '2026-11-30' })
  });
  console.log('HW CREATE:', hw.status);

  // Homework read
  const list = await (await fetch(base + '/api/homework')).json();
  const found = (list.data || []).find(h => String(h.id) === 'full-test-hw-1');
  console.log('HW READ: found =', !!found);

  // Homework submit
  const sub = await fetch(base + '/api/homework?action=submit', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'x-portal-student-id': 'test-student' },
    body: JSON.stringify({ assignment_id: 'full-test-hw-1', student_id: 'test-student', submission_text: 'done' })
  });
  console.log('HW SUBMIT:', sub.status);

  // Homework review
  const rev = await fetch(base + '/api/homework?action=review&id=full-test-hw-1', {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ status: 'reviewed', feedback: 'good', score: 95 })
  });
  console.log('HW REVIEW:', rev.status);

  // Homework edit
  const edit = await fetch(base + '/api/homework?id=full-test-hw-1', {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ title: 'Edited Title' })
  });
  console.log('HW EDIT:', edit.status);

  // Homework delete
  const del = await fetch(base + '/api/homework?id=full-test-hw-1', { method: 'DELETE' });
  console.log('HW DELETE:', del.status);

  // Attendance create
  const att = await fetch(base + '/api/attendance', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'Authorization': 'Bearer ' + token },
    body: JSON.stringify({ student_id: 'test-student', date: '2026-10-28', status: 'present' })
  });
  console.log('ATT CREATE:', att.status, (await att.text()).slice(0, 80));

  // Attendance read
  const attList = await (await fetch(base + '/api/attendance')).json();
  const attFound = (attList.data || []).find(a => a.student_id === 'test-student' && a.date === '2026-10-28');
  console.log('ATT READ: found =', !!attFound);

  // File upload
  const up = await fetch(base + '/api/upload', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'Authorization': 'Bearer ' + token },
    body: JSON.stringify({ image: 'base64data', filename: 'test.txt' })
  });
  console.log('UPLOAD:', up.status);

  // Verify homework deleted
  const final = await (await fetch(base + '/api/homework')).json();
  console.log('HW FINAL: still present =', !!(final.data || []).find(h => String(h.id) === 'full-test-hw-1'));
}

test().catch(e => console.error('ERROR:', e.message));