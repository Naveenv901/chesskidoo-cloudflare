const fs = require('fs');
const s = fs.readFileSync('lms/scripts.js', 'utf8');
// Find all onclick handlers that reference attendance
const onclickRegex = /onclick\s*=\s*["']([^"']*att[^"']*)["']/gi;
let m;
while ((m = onclickRegex.exec(s)) !== null) {
  console.log('onclick:', m[1]);
}
// Find all function names containing 'att'
const funcRegex = /function\s+(\w*[Aa]tt\w*)\s*\(/g;
while ((m = funcRegex.exec(s)) !== null) {
  console.log('function:', m[1]);
}