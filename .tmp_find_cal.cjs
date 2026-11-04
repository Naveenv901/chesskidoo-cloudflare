const fs = require('fs');
const files = ['attendance_extension.js', 'scripts.js', 'coach.js', 'homework.js', 'ceo-dashboard.js', 'reporting.js'];
for (const f of files) {
  const path = 'lms/js/' + f;
  let s;
  try { s = fs.readFileSync(path, 'utf8'); } catch(e) { continue; }
  // Find calendar rendering functions
  const patterns = ['renderCalendar', 'calendar', 'cal-day', 'checkmark', '✓', '✕'];
  for (const p of patterns) {
    let i = 0;
    while ((i = s.indexOf(p, i + 1)) !== -1) {
      const ctx = s.slice(Math.max(0, i - 50), i + 100).replace(/\s+/g, ' ');
      if (ctx.includes('innerHTML') || ctx.includes('function') || ctx.includes('=>')) {
        console.log(f, '->', p, ':', ctx);
      }
    }
  }
}