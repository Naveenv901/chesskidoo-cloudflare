const fs = require('fs');
const s = fs.readFileSync('lms/scripts.js', 'utf8');
// Find all places that call renderAttendanceCalendar
let i = 0, n = 0;
while ((i = s.indexOf('renderAttendanceCalendar', i + 1)) !== -1 && n < 20) {
  const ctx = s.slice(Math.max(0, i - 200), i + 200).replace(/\s+/g, ' ');
  console.log(n, ':', ctx);
  n++;
}