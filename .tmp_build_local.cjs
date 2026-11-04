// Temporary: dump remote schema into a local sqlite file for offline SQL validation
const fs = require('fs');
const { DatabaseSync } = require('node:sqlite');

function readJson(p) {
  const buf = fs.readFileSync(p);
  let raw = (buf[0] === 0xff && buf[1] === 0xfe) ? buf.toString('utf16le') : buf.toString('utf8');
  raw = raw.replace(/^\uFEFF/, '');
  const i = raw.indexOf('[');
  return JSON.parse(raw.slice(i));
}

const schema = readJson('.tmp_remote_schema.json');
const idx = readJson('.tmp_remote_idx.json');
const migs = readJson('.tmp_remote_migs.json');

const db = new DatabaseSync('.tmp_remote.sqlite');
db.exec('PRAGMA foreign_keys=OFF');

for (const block of [schema, idx]) {
  for (const r of block[0].results) {
    if (!r.sql) continue;
    try { db.exec(r.sql); } catch (e) { console.log('SKIP', r.name, e.message); }
  }
}

// d1_migrations table
try { db.exec('DROP TABLE IF EXISTS d1_migrations'); } catch (e) {}
db.exec('CREATE TABLE d1_migrations (id INTEGER PRIMARY KEY, name TEXT, applied_at TIMESTAMP)');
const ins = db.prepare('INSERT INTO d1_migrations (id, name, applied_at) VALUES (?, ?, ?)');
for (const r of migs[0].results) ins.run(r.id, r.name, r.applied_at);

db.exec('CREATE TABLE IF NOT EXISTS _remote_tables (name TEXT)');
const t = db.prepare('INSERT INTO _remote_tables (name) VALUES (?)');
for (const r of schema[0].results) t.run(r.name);

console.log('tables:', db.prepare('SELECT count(*) c FROM _remote_tables').get().c);
console.log('migrations:', JSON.stringify(migs[0].results));
db.close();
