const s = await (await fetch('https://chesskidoo.pages.dev/lms/scripts.js')).text();
// Find ALL assignments to window.allAttendance or allAttendance
const patterns = [
  'window.allAttendance =',
  'allAttendance =',
  'allAttendance.push',
  'allAttendance.splice',
  'allAttendance[',
];
for (const p of patterns) {
  let i = 0, n = 0;
  while ((i = s.indexOf(p, i + 1)) !== -1 && n < 5) {
    const ctx = s.slice(Math.max(0, i - 100), i + 150).replace(/\s+/g, ' ');
    console.log(p, ':', ctx);
    n++;
  }
}