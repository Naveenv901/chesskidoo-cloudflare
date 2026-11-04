const fs = require('fs');
const s = fs.readFileSync('lms/scripts.js', 'utf8');
// Find where coach session is set after login
const patterns = ['currentCoachId =', 'currentCoachId=', 'coachName =', 'coachName:', 'currentCoachName', 'coach_name:', 'name: d.', 'full_name: d.', 'role: d.role'];
for (const p of patterns) {
  let i = 0;
  let n = 0;
  while ((i = s.indexOf(p, i + 1)) !== -1 && n < 3) {
    console.log(p, 'at', i, ':', s.slice(Math.max(0, i - 80), i + 120).replace(/\s+/g, ' '));
    n++;
  }
}