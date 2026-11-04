const fs = require('fs');
const files = ['attendance_extension.js', 'scripts.js', 'coach.js', 'homework.js', 'ceo-dashboard.js', 'reporting.js'];
for (const f of files) {
  const path = 'lms/js/' + f;
  let s;
  try { s = fs.readFileSync(path, 'utf8'); } catch(e) { continue; }
  const patterns = ['saveAttendance', 'markAttendance', 'attendance-form', 'att-save', 'save-attendance', 'att-status', 'status:'];
  for (const p of patterns) {
    let i = 0;
    while ((i = s.indexOf(p, i + 1)) !== -1) {
      console.log(f, '->', p, 'at', i, ':', s.slice(Math.max(0, i - 60), i + 120).replace(/\s+/g, ' '));
    }
  }
}