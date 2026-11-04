const base = 'https://chesskidoo.pages.dev';

async function test() {
  // Create homework as a coach
  const coachId = 'admin-admin';
  const hw = await fetch(base + '/api/homework', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      id: 'edit-test-1',
      title: 'Edit Test',
      target_type: 'all',
      description: 'original',
      coach_id: coachId,
      created_by: coachId,
      due_date: '2026-11-15'
    })
  });
  const hb = await hw.json();
  console.log('CREATE:', hw.status);
  console.log('ROW coach:', hb.data?.coach, 'coach_id:', hb.data?.coach_id, 'created_by:', hb.data?.created_by);

  // Simulate frontend ownership check
  const row = hb.data;
  const assignCoach = row.coach || row.coach_id || row.created_by;
  console.log('assignCoach (frontend check):', assignCoach);

  // Edit via API
  const edit = await fetch(base + '/api/homework?id=edit-test-1', {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ title: 'Edited Title', description: 'edited desc' })
  });
  console.log('EDIT:', edit.status, await edit.text());

  // Verify edit persisted
  const verify = await (await fetch(base + '/api/homework')).json();
  const found = (verify.data || []).find(h => String(h.id) === 'edit-test-1');
  console.log('VERIFY: title =', found?.title, 'desc =', found?.description);

  // Cleanup
  await fetch(base + '/api/homework?id=edit-test-1', { method: 'DELETE' });
}

test().catch(e => console.error('ERROR:', e.message));