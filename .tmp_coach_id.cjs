const fs = require('fs');
const s = fs.readFileSync('lms/scripts.js', 'utf8');
// Find where coach session/user is set
const patterns = ['coachId', 'currentCoachId', 'coach_id', 'coachId =', 'window.coachId'];
for (const p of patterns) {
  let i = 0;
  let n = 0;
  while ((i = s.indexOf(p, i + 1)) !== -1 && n < 3) {
    console.log(p, 'at', i, ':', s.slice(Math.max(0, i - 60), i + 80).replace(/\s+/g, ' '));
    n++;
  }
}