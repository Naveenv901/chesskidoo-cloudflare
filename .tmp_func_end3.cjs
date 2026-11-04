const fs = require('fs');
const s = fs.readFileSync('lms/scripts.js', 'utf8');
// Find saveBatchAttendance and locate its closing brace
const start = s.indexOf('saveBatchAttendance');
// Find the end - look for the pattern right before the next function/comment
const endMarker = '/* ════════════════ COMBINED CLASS SESSION';
const endIdx = s.indexOf(endMarker, start);
if (endIdx === -1) {
  // Fallback: find the last } before the next function
  const funcRegex = /function\s+\w+\s*\(/g;
  let m, lastIdx = start;
  while ((m = funcRegex.exec(s)) !== null) {
    if (m.index > start) { lastIdx = m.index; break; }
  }
  console.log('Fallback next func at', lastIdx);
  // Find the last } before lastIdx
  const before = s.slice(start, lastIdx);
  const lastClose = before.lastIndexOf('}');
  console.log('Last } at offset', lastClose, 'from start');
  console.log('Context:', s.slice(start + lastClose - 200, start + lastClose + 50));
} else {
  console.log('End marker at', endIdx);
  const before = s.slice(start, endIdx);
  const lastClose = before.lastIndexOf('}');
  console.log('Last } at offset', lastClose, 'from start');
  console.log('Context:', s.slice(start + lastClose - 200, start + lastClose + 50));
}