const fs = require('fs');
const s = fs.readFileSync('lms/scripts.js', 'utf8');
// Find saveBatchAttendance and its closing brace
const start = s.indexOf('saveBatchAttendance');
// Find the end of the function - look for the last closing brace before the next function
const nextFunc = s.indexOf('/* ════════════════ COMBINED CLASS SESSION', start);
if (nextFunc === -1) {
  // Find the next function definition
  const funcRegex = /function\s+\w+\s*\(/g;
  let m;
  while ((m = funcRegex.exec(s)) !== null) {
    if (m.index > start) {
      nextFunc = m.index;
      break;
    }
  }
}
console.log('saveBatchAttendance start:', start);
console.log('next function at:', nextFunc);
console.log('function length:', nextFunc - start);
// Show the last 500 chars before next function
console.log('\n=== End of saveBatchAttendance ===');
console.log(s.slice(nextFunc - 500, nextFunc));