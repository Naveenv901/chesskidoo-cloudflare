// Temporary: extract SQL from API JS files and validate against real remote schema
const fs = require('fs');
const path = require('path');
const { DatabaseSync } = require('node:sqlite');

const ROOT = __dirname;
const db = new DatabaseSync(path.join(ROOT, '.tmp_remote.sqlite'));
db.exec('PRAGMA foreign_keys=OFF');

// ---- collect remote table/column info ----
const tables = new Map();
for (const r of db.prepare("SELECT name FROM sqlite_master WHERE type='table'").all()) {
  const cols = db.prepare(`PRAGMA table_info("${r.name}")`).all();
  tables.set(r.name, new Set(cols.map(c => c.name)));
}

const files = [
  'functions/api/[[path]].js',
  'functions/api/index.js',
  'functions/api/demo-sheet.js',
];

// ---- extract SQL-ish string literals ----
function extractLiterals(src) {
  const out = [];
  // template literals and single/double quoted strings
  const re = /`([^`\\]*(?:\\.[^`\\]*)*)`|'((?:[^'\\]|\\.)*)'|"((?:[^"\\]|\\.)*)"/g;
  let m;
  while ((m = re.exec(src))) {
    const raw = m[1] !== undefined ? m[1] : (m[2] !== undefined ? m[2] : m[3]);
    out.push({ raw, index: m.index, len: m[0].length });
  }
  return out;
}

const SQL_RE = /\b(SELECT|INSERT\s+INTO|UPDATE|DELETE\s+FROM|REPLACE\s+INTO|CREATE\s+(TABLE|INDEX)|ALTER\s+TABLE|DROP\s+(TABLE|INDEX))\b/i;

const findings = [];

for (const f of files) {
  const p = path.join(ROOT, f);
  if (!fs.existsSync(p)) { console.log('MISSING FILE', f); continue; }
  const src = fs.readFileSync(p, 'utf8');
  const lines = src.split(/\r?\n/);
  // line number for each index
  const lineOf = [];
  {
    let ln = 1;
    for (let i = 0; i < src.length; i++) { lineOf[i] = ln; if (src[i] === '\n') ln++; }
  }

  for (const lit of extractLiterals(src)) {
    const s = lit.raw;
    if (!SQL_RE.test(s)) continue;
    if (s.length < 12) continue;
    const line = lineOf[lit.index];
    // skip obvious non-SQL
    if (/^\s*(--|\/\*)/.test(s) && !SQL_RE.test(s.replace(/^[\s\S]*?\*\//, ''))) continue;

    findings.push({ file: f, line, sql: s });
  }
}

console.log('candidate SQL literals:', findings.length);

// ---- validate each ----
function substituteParams(sql) {
  // replace ? placeholders with NULL literal
  return sql.replace(/\?/g, 'NULL');
}

const errors = [];
const seen = new Set();
for (const f of findings) {
  const key = f.file + '|' + f.sql.replace(/\s+/g, ' ').trim();
  if (seen.has(key)) continue;
  seen.add(key);
  const sql = substituteParams(f.sql).replace(/\$\{[^}]*\}/g, 'NULL');
  try {
    db.prepare('EXPLAIN ' + sql).all();
  } catch (e) {
    errors.push({ file: f.file, line: f.line, msg: e.message, sql: f.sql.replace(/\s+/g, ' ').trim().slice(0, 300) });
  }
}

fs.writeFileSync('.tmp_sqlfindings.json', JSON.stringify({ findings, errors }, null, 2), 'utf8');
console.log('ERRORS:', errors.length);
for (const e of errors) console.log(`\n[${e.file}:${e.line}] ${e.msg}\n   ${e.sql}`);
db.close();
