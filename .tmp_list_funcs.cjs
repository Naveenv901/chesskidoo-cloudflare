const fs = require('fs');
const s = fs.readFileSync('lms/js/attendance_extension.js', 'utf8');
const funcRegex = /window\.(\w+)\s*=\s*(async\s+)?function/g;
let m;
while ((m = funcRegex.exec(s)) !== null) {
  console.log(m[1]);
}