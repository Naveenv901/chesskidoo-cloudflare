const fs = require('fs');
const s = fs.readFileSync('lms/scripts.js', 'utf8');
// Find the GET call that loads attendance
let i = s.indexOf('apiCall("/api/attendance?limit=1000"');
console.log('idx', i);
if (i !== -1) console.log(s.slice(Math.max(0, i - 800), i + 800));