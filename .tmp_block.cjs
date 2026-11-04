const fs = require('fs');
const s = fs.readFileSync('lms/scripts.js', 'utf8');
let i = s.indexOf('if (!window.allAttendance || window.allAttendance.length === 0)');
console.log('idx', i);
console.log(s.slice(Math.max(0, i - 100), i + 700));