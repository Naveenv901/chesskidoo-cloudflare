// Temporary route/handler comparison (delete after use)
const fs = require('fs');
const out = [];
const L = (s) => s.split(/\r?\n/);

function parse(f) {
  const src = fs.readFileSync(f, 'utf8');
  const lines = L(src);
  const handlers = {};
  const routes = [];
  let cur = null;
  lines.forEach((ln, i) => {
    const h = /^async function (handle[A-Za-z0-9_]+)/.exec(ln);
    if (h) { cur = { name: h[1], start: i + 1, body: [] }; handlers[h[1]] = cur; return; }
    if (/^export async function onRequest/.test(ln)) { cur = null; return; }
    if (cur) cur.body.push(ln);
    const r = /pathname === '([^']+)'/.exec(ln);
    if (r) routes.push({ path: r[1], handler: (lines[i + 2] || '').match(/handle[A-Za-z0-9_]+/)?.[0], line: i + 1 });
  });
  for (const k in handlers) {
    const b = handlers[k].body.join('\n');
    handlers[k].sql = [...b.matchAll(/prepare\(\s*[`'"]([^`'"]*)[`'"]/g)].map((m) => m[1]);
    handlers[k].end = handlers[k].start + handlers[k].body.length;
  }
  return { src, lines, handlers, routes };
}

const A = parse('functions/api/[[path]].js');
const B = parse('functions/api/index.js');

out.push('=== ROUTES in [[path]].js ===');
for (const r of A.routes) out.push('  ' + r.path + '  ->  ' + r.handler + '  (L' + r.line + ')');
out.push('');
out.push('=== ROUTES in index.js ===');
for (const r of B.routes) out.push('  ' + r.path + '  ->  ' + r.handler + '  (L' + r.line + ')');
out.push('');

const ah = Object.keys(A.handlers).sort();
const bh = Object.keys(B.handlers).sort();
out.push('=== HANDLERS only in [[path]].js ===');
for (const h of ah) if (!B.handlers[h]) out.push('  ' + h + ' (L' + A.handlers[h].start + '-' + A.handlers[h].end + ')');
out.push('=== HANDLERS only in index.js ===');
for (const h of bh) if (!A.handlers[h]) out.push('  ' + h + ' (L' + B.handlers[h].start + '-' + B.handlers[h].end + ')');
out.push('=== SHARED HANDLERS ===');
for (const h of ah) if (B.handlers[h]) {
  const a = A.handlers[h].body.join('\n').replace(/\s+/g, ' ').trim();
  const b = B.handlers[h].body.join('\n').replace(/\s+/g, ' ').trim();
  out.push('  ' + h + ': ' + (a === b ? 'IDENTICAL' : 'DIFFERENT') + '  (A L' + A.handlers[h].start + ', B L' + B.handlers[h].start + ')');
  if (a !== b) {
    out.push('      A sql: ' + JSON.stringify(A.handlers[h].sql));
    out.push('      B sql: ' + JSON.stringify(B.handlers[h].sql));
  }
}
out.push('');

out.push('=== ROUTES MISSING in index.js (present in [[path]].js) ===');
const bpaths = new Set(B.routes.map((r) => r.path));
for (const r of A.routes) if (!bpaths.has(r.path)) out.push('  ' + r.path + ' -> ' + r.handler);
out.push('=== ROUTES MISSING in [[path]].js (present in index.js) ===');
const apaths = new Set(A.routes.map((r) => r.path));
for (const r of B.routes) if (!apaths.has(r.path)) out.push('  ' + r.path + ' -> ' + r.handler);

fs.writeFileSync('.tmp_routes.txt', out.join('\n'), 'utf8');
console.log('ok');
