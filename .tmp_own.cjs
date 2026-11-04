const fs = require('fs');
const s = fs.readFileSync('lms/js/homework.js', 'utf8');
// Find all ownership-check blocks
const patterns = ['You can only edit', 'You can only delete', 'You can only submit', 'You can only review'];
for (const p of patterns) {
  let i = 0;
  while ((i = s.indexOf(p, i + 1)) !== -1) {
    console.log(p, 'at', i);
    i++;
  }
}