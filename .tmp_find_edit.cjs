const fs = require('fs');
const files = ['attendance_extension.js', 'scripts.js', 'coach.js', 'homework.js', 'ceo-dashboard.js', 'reporting.js'];
for (const f of files) {
  const path = 'lms/js/' + f;
  let s;
  try { s = fs.readFileSync(path, 'utf8'); } catch(e) { continue; }
  const patterns = [
    'function.*[Aa]ttendance',
    'function.*[Ss]tatus',
    'function.*[Mm]ark',
    'function.*[Ss]ave',
    'function.*[Uu]pdate.*[Aa]tt',
    'function.*[Ee]dit.*[Aa]tt',
    'attendance.*=.*function',
    'status.*=.*function',
  ];
  for (const p of patterns) {
    let i = 0;
    while ((i = s.indexOf(p, i + 1)) !== -1) {
      const ctx = s.slice(Math.max(0, i - 30), i + 200).replace(/\s+/g, ' ');
      console.log(f, ':', ctx);
    }
  }
}