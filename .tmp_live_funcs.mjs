const s = await (await fetch('https://chesskidoo.pages.dev/lms/scripts.js')).text();
// Find all function names containing 'att' or 'status'
const funcRegex = /function\s+(\w*[Aa]tt\w*|\w*[Ss]tatus\w*|\w*[Mm]ark\w*)\s*\(/g;
let m;
const seen = new Set();
while ((m = funcRegex.exec(s)) !== null) {
  if (!seen.has(m[1])) {
    seen.add(m[1]);
    console.log('function:', m[1]);
  }
}
// Also find window.X = function patterns
const winRegex = /window\.(\w*[Aa]tt\w*|\w*[Ss]tatus\w*|\w*[Mm]ark\w*)\s*=\s*(async\s+)?function/g;
while ((m = winRegex.exec(s)) !== null) {
  if (!seen.has(m[1])) {
    seen.add(m[1]);
    console.log('window.', m[1]);
  }
}