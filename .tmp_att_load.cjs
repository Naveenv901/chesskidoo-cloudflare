const fs = require('fs');
const s = fs.readFileSync('lms/scripts.js', 'utf8');
let i = s.indexOf('apiCall("/api/attendance"');
console.log('idx', i);
if (i !== -1) console.log(s.slice(Math.max(0, i - 500), i + 800));