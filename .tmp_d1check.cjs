// Temporary D1 gap inspector v2 (delete after use) - writes UTF-8 output
const fs = require('fs');
const path = require('path');
const { DatabaseSync } = require('node:sqlite');

const dir = path.join('.wrangler', 'state', 'v3', 'd1', 'miniflare-D1DatabaseObject');
const file = path.join(dir, fs.readdirSync(dir).filter((f) => f.endsWith('.sqlite') && f !== 'metadata.sqlite')[0]);

// Work on a copy so we never mutate the local D1 state
const copy = path.join('.tmp_d1_copy.sqlite');
fs.copyFileSync(file, copy);
const db = new DatabaseSync(copy);

const out = [];
const log = (s) => out.push(s);

const tables = db.prepare("SELECT name FROM sqlite_master WHERE type='table'").all().map((r) => r.name);
log('DB FILE: ' + file);
log('TABLES (' + tables.length + '): ' + tables.sort().join(', '));
log('');

log('=== SCHEMA ===');
for (const t of tables.sort()) {
  const cols = db.prepare('PRAGMA table_info("' + t + '")').all();
  log('  ' + t + ': ' + cols.map((c) => c.name + ' ' + (c.type || '') + (c.pk ? ' PK' : '') + (c.notnull ? ' NN' : '')).join(' | '));
}
log('');

const files = ['functions/api/[[path]].js', 'functions/api/index.js', 'functions/api/demo-sheet.js'];
const sqls = [];
for (const f of files) {
  if (!fs.existsSync(f)) continue;
  const src = fs.readFileSync(f, 'utf8');
  const re = /\.prepare\(\s*(`([^`]*)`|'([^']*)'|"([^"]*)")\s*\)/g;
  let m;
  while ((m = re.exec(src))) {
    let s = m[2] !== undefined ? m[2] : m[3] !== undefined ? m[3] : m[4];
    sqls.push({ f, s, idx: m.index });
  }
}
log('SQL statements captured: ' + sqls.length);
log('');

log('=== PREPARE ERRORS (statement fails against local D1) ===');
let errCount = 0;
for (const { f, s } of sqls) {
  // strip JS template interpolation -> bind placeholder
  const q = s.replace(/\$\{[^}]*\}/g, '?');
  if (!q.trim()) continue;
  let stmt;
  try {
    stmt = db.prepare(q);
  } catch (e) {
    errCount++;
    const line = srcLine(f, s);
    log('  [' + f + ':' + line + '] ' + e.message);
    log('      SQL: ' + q.replace(/\s+/g, ' ').slice(0, 300));
    continue;
  }
  // Column-level check: sqlite prepare does not always resolve columns in all contexts
  try {
    stmt.all();
  } catch (e) {
    const m2 = /no such column: ([\w.]+)/i.exec(e.message);
    const m3 = /no such table: ([\w.]+)/i.exec(e.message);
    if (m2 || m3) {
      errCount++;
      const line = srcLine(f, s);
      log('  [' + f + ':' + line + '] ' + e.message);
      log('      SQL: ' + q.replace(/\s+/g, ' ').slice(0, 300));
    }
  }
}
if (!errCount) log('  (none)');

function srcLine(f, s) {
  const src = fs.readFileSync(f, 'utf8');
  const i = src.indexOf(s);
  if (i < 0) return '?';
  return String(src.slice(0, i).split(/\r?\n/).length);
}

log('');
log('=== MIGRATION FILES ===');
const migDir = 'migrations';
if (fs.existsSync(migDir)) {
  for (const m of fs.readdirSync(migDir).sort()) log('  ' + m);
}

fs.writeFileSync('.tmp_d1_report.txt', out.join('\n'), 'utf8');
console.log('written .tmp_d1_report.txt (' + out.length + ' lines)');
