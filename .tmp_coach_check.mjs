const base = 'https://chesskidoo.pages.dev';
const studentId = '92486897-45ff-4fe0-a214-f0439789eb76';
const coachId = 'c0c0c0c0-0008-4000-8000-000000000008';

// Create with coach_id
const hw = await fetch(base + '/api/homework', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    id: 'coach-check-2',
    title: 'Coach Check 2',
    target_type: 'student',
    student_id: studentId,
    coach_id: coachId,
    created_by: coachId,
    description: 'test',
    due_date: '2026-11-15'
  })
});
const hb = await hw.json();
console.log('CREATE status:', hw.status);
console.log('CREATE response:', JSON.stringify(hb.data));

// Query via assignments endpoint
const q = await (await fetch(base + '/api/assignments')).json();
const found = (q.data || []).find(h => String(h.id) === 'coach-check-2');
console.log('ASSIGNMENTS endpoint found:', !!found);
if (found) console.log('  coach:', found.coach, 'coach_id:', found.coach_id, 'student_id:', found.student_id);

// Query via homework endpoint
const q2 = await (await fetch(base + '/api/homework')).json();
const found2 = (q2.data || []).find(h => String(h.id) === 'coach-check-2');
console.log('HOMEWORK endpoint found:', !!found2);
if (found2) console.log('  coach:', found2.coach, 'coach_id:', found2.coach_id, 'student_id:', found2.student_id);

// Cleanup
await fetch(base + '/api/homework?id=coach-check-2', { method: 'DELETE' });