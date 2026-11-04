const fs = require('fs');
const files = ['attendance_extension.js', 'coach.js', 'homework.js', 'ceo-dashboard.js', 'reporting.js'];
for (const f of files) {
  const path = 'lms/js/' + f;
  let s;
  try { s = fs.readFileSync(path, 'utf8'); } catch(e) { continue; }
  if (s.includes('saveBatchAttendance') || s.includes('openAttendanceMarking')) {
    console.log(f, 'contains saveBatchAttendance/openAttendanceMarking');
    const i = s.indexOf('saveBatchAttendance');
    if (i !== -1) console.log('  saveBatchAttendance at', i);
    const j = s.indexOf('openAttendanceMarking');
    if (j !== -1) console.log('  openAttendanceMarking at', j);
  }
}