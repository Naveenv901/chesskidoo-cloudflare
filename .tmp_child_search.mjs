const s = await (await fetch('https://chesskidoo.pages.dev/lms/scripts.js')).text();
// Find all references to child attendance loading
const patterns = [
  'renderChildAttendance',
  'child-attendance',
  'childAttendance',
  'loadChildData',
  'childData',
  'child.*attendance',
];
for (const p of patterns) {
  let i = 0, n = 0;
  while ((i = s.indexOf(p, i + 1)) !== -1 && n < 3) {
    const ctx = s.slice(Math.max(0, i - 80), i + 150).replace(/\s+/g, ' ');
    console.log(p, ':', ctx);
    n++;
  }
}