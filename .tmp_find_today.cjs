const base = 'https://chesskidoo.pages.dev';

(async () => {
  // 1. Find homework assigned today by Vishnu
  const hwRes = await fetch(base + '/api/homework');
  const hwData = await hwRes.json();
  const today = '2026-10-28';
  const vishnuHw = (hwData.data || []).filter(h => {
    const created = (h.created_at || '').slice(0, 10);
    const coach = String(h.coach || '').toLowerCase();
    return created === today && coach.includes('vishnu');
  });
  console.log('Vishnu homework today:', vishnuHw.length);
  vishnuHw.forEach(h => console.log('  ', h.id, h.title, h.coach, h.created_at));

  // 2. Find all homework assigned today (any coach)
  const allTodayHw = (hwData.data || []).filter(h => (h.created_at || '').slice(0, 10) === today);
  console.log('\nAll homework today:', allTodayHw.length);
  allTodayHw.forEach(h => console.log('  ', h.id, h.title, h.coach, h.created_at));

  // 3. Find attendance marked today
  const attRes = await fetch(base + '/api/attendance');
  const attData = await attRes.json();
  const todayAtt = (attData.data || []).filter(a => {
    const d = String(a.date || '').slice(0, 10);
    return d === today;
  });
  console.log('\nAttendance today:', todayAtt.length);
  todayAtt.forEach(a => console.log('  ', a.studentId, a.date, a.status));
})();