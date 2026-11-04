const fs = require('fs');
const s = fs.readFileSync('lms/scripts.js', 'utf8');
// Find my sync code in saveBatchAttendance
const i = s.indexOf('Sync window.allAttendance immediately');
if (i !== -1) {
  console.log(s.slice(i, i + 800));
}