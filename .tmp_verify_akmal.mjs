const base = 'https://chesskidoo.pages.dev';
const today = '2026-10-28';

(async () => {
  // 1. Find the student Akmal Kasim
  const studentsRes = await fetch(base + '/api/students');
  const studentsData = await studentsRes.json();
  const students = studentsData.data || [];
  
  // Search for Akmal Kasim by name
  const akmal = students.filter(s => {
    const name = String(s.name || s.full_name || '').toLowerCase();
    const fname = String(s.first_name || '').toLowerCase();
    const lname = String(s.last_name || '').toLowerCase();
    return name.includes('akmal') || name.includes('kasim') || fname.includes('akmal') || lname.includes('kasim');
  });
  
  console.log('=== Students matching Akmal Kasim ===');
  console.log('Count:', akmal.length);
  akmal.forEach(s => console.log('  id:', s.id, '| name:', s.name || s.full_name, '| first:', s.first_name, '| last:', s.last_name, '| status:', s.status));

  // 2. Get all attendance for today
  const attRes = await fetch(base + '/api/attendance');
  const attData = await attRes.json();
  const allAtt = attData.data || [];
  const todayAtt = allAtt.filter(a => String(a.date || '').slice(0, 10) === today);
  
  console.log('\n=== All attendance for', today, '===');
  console.log('Count:', todayAtt.length);
  todayAtt.forEach(a => console.log('  studentId:', a.studentId, '| status:', a.status, '| date:', a.date));

  // 3. Check if any of Akmal's IDs appear in today's attendance
  console.log('\n=== Akmal Kasim attendance for', today, '===');
  if (akmal.length === 0) {
    console.log('No student found matching "Akmal Kasim"');
  }
  akmal.forEach(s => {
    const record = todayAtt.find(a => String(a.studentId) === String(s.id));
    if (record) {
      console.log('FOUND:', s.name, '| student_id:', s.id, '| status:', record.status, '| date:', record.date);
    } else {
      console.log('NO RECORD:', s.name, '| student_id:', s.id, '| (no attendance record for today)');
    }
  });
})();