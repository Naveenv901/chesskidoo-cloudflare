const s = await (await fetch('https://chesskidoo.pages.dev/lms/scripts.js')).text();
// Find all places where window.allAttendance is set
let i = 0, n = 0;
while ((i = s.indexOf('window.allAttendance', i + 1)) !== -1 && n < 20) {
  const ctx = s.slice(Math.max(0, i - 100), i + 150).replace(/\s+/g, ' ');
  console.log(n, ':', ctx);
  n++;
}