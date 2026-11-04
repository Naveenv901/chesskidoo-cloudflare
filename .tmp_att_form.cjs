const fs = require('fs');
const s = fs.readFileSync('lms/scripts.js', 'utf8');
// Find the attendance form save logic
let i = 0, n = 0;
while ((i = s.indexOf('attendance', i + 1)) !== -1 && n < 30) {
  const ctx = s.slice(Math.max(0, i - 100), i + 150).replace(/\s+/g, ' ');
  if (ctx.includes('save') || ctx.includes('POST') || ctx.includes('status') || ctx.includes('render')) {
    console.log(n, ':', ctx);
    n++;
  }
}