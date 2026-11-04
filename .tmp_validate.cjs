/*
 * Summarize the failing SQL into the precise set of missing tables & columns.
 */
const fs = require('fs');
const path = require('path');
const { DatabaseSync } = require('node:sqlite');

const dbDir = path.join('.wrangler', 'state', 'v3', 'd1', 'miniflare-D1DatabaseObject');
const src = fs.readdirSync(dbDir).find((f) => f.endsWith('.sqlite') && f !== 'metadata.sqlite');
const tmp = path.join('.tmp_verify2.sqlite');
fs.copyFileSync(path.join(dbDir, src), tmp);
const db = new DatabaseSync(tmp);

function extractSql(file) {
  const s = fs.readFileSync(file, 'utf8');
  const out = [];
  const re = /\.prepare\(\s*(`(?:[^`\\]|\\[\s\S])*`|'(?:[^'\\]|\\[\s\S])*'|"(?:[^"\\]|\\[\s\S])*")\s*\)/g;
  let m;
  while ((m = re.exec(s))) {
    const lit = m[1];
    const sql = lit[0] === '`' ? lit.slice(1, -1)
      : lit.slice(1, -1).replace(/\\n/g, '\n').replace(/\\'/g, "'").replace(/\\"/g, '"').replace(/\\\\/g, '\\');
    out.push({ file, line: s.slice(0, m.index).split('\n').length, sql });
  }
  return out;
}

const stmts = [...extractSql('functions/api/index.js'), ...extractSql('functions/api/[[path]].js')];
const missingTables = new Map(); // table -> [locations]
const missingCols = new Map();  // "table.col" -> [locations]
const other = [];

for (const st of stmts) {
  if (/\{\s*\}/.test(st.sql)) continue;
  const testSql = st.sql.replace(/\?/g, 'NULL');
  try {
    const p = db.prepare(testSql);
    if (/^\s*select/i.test(st.sql)) p.all(); else p.run();
  } catch (e) {
    const msg = e.message;
    let m = msg.match(/no such table:\s*(\w+)/i);
    if (m) {
      const t = m[1];
      if (!missingTables.has(t)) missingTables.set(t, []);
      missingTables.get(t).push(`${st.file}:${st.line}`);
      continue;
    }
    m = msg.match(/table (\w+) has no column named (\w+)/i);
    if (m) {
      const key = `${m[1]}.${m[2]}`;
      if (!missingCols.has(key)) missingCols.set(key, []);
      missingCols.get(key).push(`${st.file}:${st.line}`);
      continue;
    }
    other.push({ ...st, msg });
  }
}

const out = [];
out.push('MISSING TABLES (' + missingTables.size + ')');
for (const [t, locs] of [...missingTables].sort()) {
  out.push(`  ${t}  <- ${locs.join(', ')}`);
}
out.push('');
out.push('MISSING COLUMNS (' + missingCols.size + ')');
for (const [k, locs] of [...missingCols].sort()) {
  out.push(`  ${k}  <- ${locs.join(', ')}`);
}
out.push('');
out.push('OTHER ERRORS (' + other.length + ')');
const seenOther = new Set();
for (const o of other) {
  const key = o.msg;
  if (seenOther.has(key)) continue;
  seenOther.add(key);
  out.push(`  ${o.file}:${o.line}  ${o.msg}`);
  out.push(`      ${o.sql.replace(/\s+/g, ' ').trim().slice(0, 200)}`);
}
fs.writeFileSync('.tmp_summary.txt', out.join('\n'));
console.log(out.join('\n'));
db.close();

