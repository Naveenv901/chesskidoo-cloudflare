const base = 'https://chesskidoo.pages.dev';

async function test() {
  // Use a real coach ID from the coaches list
  const realCoachId = 'c0c0c0c0-0008-4000-8000-000000000008'; // ROHITH SELVARAJ

  // Create homework with the real coach ID
  const hw = await fetch(base + '/api/homework', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      id: 'edit-test-2',
      title: 'Edit Test 2',
      target_type: 'all',
      description: 'original',
      coach_id: realCoachId,
      created_by: realCoachId,
      due_date: '2026-11-15'
    })
  });
  const hb = await hw.json();
  console.log('CREATE:', hw.status);
  console.log('ROW coach:', hb.data?.coach);

  // Simulate the frontend ownership check exactly as homework.js does it
  const row = hb.data;
  const cId = realCoachId; // what the logged-in coach's session would have
  const assignCoach = row.coach || row.coach_id || row.created_by;
  const isOwner = (row.target_type === 'all' && (assignCoach ? true : true))
    || (assignCoach && assignCoach === cId)
    || (row.batch_id && false)
    || (row.target_type === 'batch' && false)
    || (row.student_id && false)
    || (row.target_type === 'student' && false)
    || (!row.coach && !row.coach_id && row.batch_id && false);
  console.log('assignCoach:', assignCoach);
  console.log('cId:', cId);
  console.log('isOwner:', isOwner);

  // Edit via API
  const edit = await fetch(base + '/api/homework?id=edit-test-2', {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ title: 'Edited Title 2' })
  });
  console.log('EDIT:', edit.status);

  // Cleanup
  await fetch(base + '/api/homework?id=edit-test-2', { method: 'DELETE' });
}

test().catch(e => console.error('ERROR:', e.message));