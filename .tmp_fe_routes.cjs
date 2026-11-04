const fs = require('fs');
const files = [];
function walk(d) {
  for (const e of fs.readdirSync(d, { withFileTypes: true })) {
    const p = d + '/' + e.name;
    if (e.isDirectory()) {
      if (/node_modules|\.git|vendor|dist/.test(p)) continue;
      walk(p);
    } else if (/\.js$/.test(e.name) && !/\.min\./.test(e.name)) {
      files.push(p);
    }
  }
}
walk('lms');
const re = /['"`]\/api\/[a-zA-Z0-9_\-\/\.]*['"`]/g;
for (const f of files) {
  const s = fs.readFileSync(f, 'utf8');
  const m = s.match(re) || [];
  if (!m.length) continue;
  console.log('== ' + f);
  console.log([...new Set(m.map((x) => x.slice(1, -1)))].join('\n'));
}
