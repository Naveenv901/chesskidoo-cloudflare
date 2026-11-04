const fs = require('fs');
const s = fs.readFileSync('lms/js/attendance_extension.js', 'utf8');
// Find all function definitions
const funcs = ['saveAttendance', 'markAttendance', 'updateAttendance', 'setAttendance', 'saveAtt', 'markAtt'];
for (const p of funcs) {
  let i = 0;
  while ((i = s.indexOf(p, i + 1)) !== -1) {
    console.log(p, 'at', i, ':', s.slice(Math.max(0, i - 80), i + 150).replace(/\s+/g, ' '));
  }
}