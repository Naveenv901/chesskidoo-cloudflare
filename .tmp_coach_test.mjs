const base = 'https://chesskidoo.pages.dev';

async function test() {
  // Coach login
  const coachLogin = await fetch(base + '/api/auth/signin', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ username: 'rohith@gmail.com', password: 'admin123' })
  });
  const cl = await coachLogin.json();
  console.log('COACH LOGIN:', coachLogin.status, JSON.stringify(cl).slice(0, 120));

  // Coach creates homework assigned to a specific student
  const studentId = '92486897-45ff-4fe0-a214-f0439789eb76'; // TANVI
  const coachId = cl.userid || 'c0c0c0c0-0008-4000-8000-000000000008';
  const hw = await fetch(base + '/api/homework', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'Authorization': 'Bearer ' + (cl.token || '') },
    body: JSON.stringify({
      id: 'coach-hw-test-1',
      title: 'Coach Assigned Homework',
      target_type: 'student',
      student_id: studentId,
      coach_id: coachId,
      created_by: coachId,
      description: 'Practice tactics for 30 minutes',
      due_date: '2026-11-15',
      status: 'active'
    })
  });
  console.log('HW CREATE (coach):', hw.status, (await hw.text()).slice(0, 150));

  // Student-side: list homework
  const hwList = await (await fetch(base + '/api/homework')).json();
  const found = (hwList.data || []).find(h => String(h.id) === 'coach-hw-test-1');
  console.log('HW LIST contains coach-hw-test-1:', !!found);
  if (found) console.log('  assigned to student_id:', found.student_id, 'coach_id:', found.coach_id);

  // Coach marks attendance for that student
  const att = await fetch(base + '/api/attendance', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'Authorization': 'Bearer ' + (cl.token || '') },
    body: JSON.stringify({ student_id: studentId, date: '2026-10-28', status: 'present' })
  });
  console.log('ATT CREATE (coach):', att.status, (await att.text()).slice(0, 120));

  // Verify attendance is queryable
  const attList = await (await fetch(base + '/api/attendance')).json();
  const attFound = (attList.data || []).find(a => a.studentId === studentId && a.date === '2026-10-28');
  console.log('ATT found for student:', !!attFound, attFound ? attFound.status : '');

  // Cleanup
  await fetch(base + '/api/homework?id=coach-hw-test-1', { method: 'DELETE' });
  console.log('CLEANUP: homework deleted');
}

test().catch(e => console.error('ERROR:', e.message));