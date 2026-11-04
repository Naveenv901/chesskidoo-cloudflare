// Temporary remote D1 schema parser (delete after use)
const fs = require('fs');
const buf = fs.readFileSync('.tmp_remote_schema.json');
let raw;
if (buf[0] === 0xff && buf[1] === 0xfe) raw = buf.toString('utf16le');
else raw = buf.toString('utf8');
raw = raw.replace(/^\uFEFF/, '');
const start = raw.indexOf('[');
const data = JSON.parse(raw.slice(start));
const rows = data[0].results;
const out = [];
for (const r of rows) {
  const sql = r.sql || '';
  const m = /CREATE TABLE (?:IF NOT EXISTS )?["'`[]?([A-Za-z_][A-Za-z0-9_]*)["'`\]]?\s*\(([\s\S]*)\)\s*$/i.exec(sql);
  out.push('TABLE ' + r.name);
  if (!m) { out.push('  (no parse) ' + sql.replace(/\s+/g, ' ').slice(0, 200)); continue; }
  // split top-level commas
  const body = m[2];
  const parts = [];
  let depth = 0, cur = '';
  for (const ch of body) {
    if (ch === '(') depth++;
    if (ch === ')') depth--;
    if (ch === ',' && depth === 0) { parts.push(cur.trim()); cur = ''; }
    else cur += ch;
  }
  if (cur.trim()) parts.push(cur.trim());
  for (const p of parts) {
    const col = /^["'`[]?([A-Za-z_][A-Za-z0-9_]*)["'`\]]?\s+([A-Za-z]+)/.exec(p);
    if (col) out.push('  ' + col[1] + ' ' + col[2]);
    else out.push('  -- ' + p.replace(/\s+/g, ' ').slice(0, 120));
  }
  out.push('');
}
fs.writeFileSync('.tmp_remote_schema.txt', out.join('\n'), 'utf8');
console.log('ok -> .tmp_remote_schema.txt');
