const fs = require('fs');
const { DatabaseSync } = require('node:sqlite');
const path = require('path');

// ── 1. DB schema ──
const dbDir = path.join('.wrangler', 'state', 'v3', 'd1', 'miniflare-D1DatabaseObject');
const file = fs.readdirSync(dbDir).find((f) => f.endsWith('.sqlite') && f !== 'metadata.sqlite');
const db = new DatabaseSync(path.join(dbDir, file), { readOnly: true });

const dbTables = new Map();
for (const t of db.prepare("SELECT name FROM sqlite_master WHERE type='table'").all()) {
  if (t.name.startsWith('_cf') || t.name === 'd1_migrations' || t.name === 'sqlite_sequence') continue;
  const cols = db.prepare(`PRAGMA table_info("${t.name}")`).all().map((c) => c.name);
  dbTables.set(t.name, new Set(cols));
}

// ── 2. Handler SQL references ──
const handlerFiles = ['functions/api/index.js', 'functions/api/[[path]].js'];
const used = new Map(); // table -> Set(column)

const tableRe = /\b(?:FROM|INTO|UPDATE|JOIN|TABLE)\s+([a-zA-Z_][a-zA-Z0-9_]*)/gi;

function record(table, col) {
  if (!used.has(table)) used.set(table, new Set());
  if (col) used.get(table).add(col);
}

for (const hf of handlerFiles) {
  const src = fs.readFileSync(hf, 'utf8');
  let m;
  while ((m = tableRe.exec(src))) {
    const table = m[1];
    // find the statement body after this match to collect column names
    const stmt = src.slice(m.index, m.index + 600);
    const after = stmt.slice(m[0].length);
    const cols = after.match(/^[a-zA-Z_][a-zA-Z0-9_]*/);
    if (cols && !['SELECT', 'FROM', 'WHERE', 'SET', 'VALUES', 'ORDER', 'GROUP', 'LIMIT', 'LEFT', 'INNER', 'JOIN', 'ON', 'AS', 'AND', 'OR', 'NOT'].includes(cols[0].toUpperCase())) {
      record(table, cols[0]);
    }
    // collect explicit column lists in parens
    const paren = after.match(/^\s*\(([^)]*)\)/);
    if (paren) {
      paren[1].split(',').map((s) => s.trim()).filter(Boolean).forEach((c) => record(table, c));
    }
    // collect SET col = ?
    const setRe = /SET\s+([a-zA-Z_][a-zA-Z0-9_]*)\s*=/gi;
    let sm;
    while ((sm = setRe.exec(stmt))) record(table, sm[1]);
    // collect col aliases "x.col as y"
    const aliasRe = /\b([a-zA-Z_][a-zA-Z0-9_]*)\.([a-zA-Z_][a-zA-Z0-9_]*)/g;
    let am;
    while ((am = aliasRe.exec(stmt))) record(table, am[2]);
  }
}

console.log('════ MISSING TABLES (referenced by handlers but not in D1) ════\n');
const missing = [...used.keys()].filter((t) => !dbTables.has(t)).sort();
for (const t of missing) console.log('  ' + t + '  -> cols: ' + [...used.get(t)].sort().join(', '));

console.log('\n════ EXISTING TABLES WITH MISSING COLUMNS ════\n');
for (const [t, cols] of [...used.entries()].sort()) {
  if (!dbTables.has(t)) continue;
  const missingCols = [...cols].filter((c) => !dbTables.get(t).has(c) && !['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h', 'i', 'j', 'k', 'l', 'm', 'n', 'o', 'p', 'q', 'r', 's', 't', 'u', 'v', 'w', 'x', 'y', 'z'].includes(c) && c.length > 1);
  if (missingCols.length) {
    console.log('  ' + t + '  MISSING: ' + missingCols.sort().join(', '));
    console.log('      existing: ' + [...dbTables.get(t)].join(', '));
  }
}
