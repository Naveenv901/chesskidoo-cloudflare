const fs = require('fs');
const s = fs.readFileSync('lms/scripts.js', 'utf8');
// Find where cId is set in the edit function
const i = s.indexOf('You can only edit your own');
console.log(s.slice(i - 1500, i + 200));