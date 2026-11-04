const base = 'https://chesskidoo.pages.dev';

(async () => {
  // 1. Find homework assigned today (2026-10-28)
  const hwRes = await fetch(base + '/api/homework');
  const hwData = await hwRes.json();
  const today = '2026-10-28';
  const todayHw = (hwData.data || []).filter(h => (h.created_at || '').slice(0, 10) === today);
  console.log('Homework today:', todayHw.length);
  todayHw.forEach(h => console.log('  ', h.id, '|', h.title, '| coach:', h.coach, '| created:', h.created_at));

  // 2. Find attendance marked today
  const attRes = await fetch(base + '/api/attendance');
  const attData = await attRes.json();
  const todayAtt = (attData.data || []).filter(a => String(a.date || '').slice(0, 10) === today);
  console.log('\nAttendance today:', todayAtt.length);
  todayAtt.forEach(a => console.log('  ', a.studentId, '|', a.date, '|', a.status));

  // 3. Delete all today's homework
  console.log('\n--- DELETING HOMEWORK ---');
  for (const h of todayHw) {
    const r = await fetch(base + '/api/homework?id=' + encodeURIComponent(h.id), { method: 'DELETE' });
    const t = await r.text();
    console.log('DELETE', h.id, ':', r.status, t.slice(0, 80));
  }

  // 4. Delete all today's attendance
  console.log('\n--- DELETING ATTENDANCE ---');
  for (const a of todayAtt) {
    const r = await fetch(base + '/api/attendance?student_id=' + encodeURIComponent(a.studentId) + '&date=' + encodeURIComponent(a.date), { method: 'DELETE' });
    const t = await r.text();
    console.log('DELETE', a.studentId, a.date, ':', r.status, t.slice(0, 80));
  }

  // 5. Verify cleanup
  const finalHw = await (await fetch(base + '/api/homework')).json();
  const finalAtt = await (await fetch(base + '/api/attendance')).json();
  const remainingHw = (finalHw.data || []).filter(h => (h.created_at || '').slice(0, 10) === today);
  const remainingAtt = (finalAtt.data || []).filter(a => String(a.date || '').slice(0, 10) === today);
  console.log('\n--- VERIFICATION ---');
  console.log('Remaining homework today:', remainingHw.length);
  console.log('Remaining attendance today:', remainingAtt.length);
})();