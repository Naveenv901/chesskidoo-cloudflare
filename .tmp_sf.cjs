const fs = require('fs');
const path = require('path');
const dir = path.join(__dirname, 'assets', 'vendor', 'stockfish');
console.log('=== FILES ===');
for (const f of fs.readdirSync(dir)) {
  const st = fs.statSync(path.join(dir, f));
  console.log(f, st.size, 'bytes', st.isDirectory() ? '(dir)' : '');
}
const f = path.join(dir, 'stockfish-nnue-16-single.js');
const t = fs.readFileSync(f, 'utf8');
console.log('=== LENGTH ===', t.length);
console.log('=== HEAD 2000 ===');
console.log(t.slice(0, 2000));
console.log('=== TAIL 2500 ===');
console.log(t.slice(-2500));
