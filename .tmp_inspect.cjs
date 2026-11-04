// Temporary D1 schema inspector (delete after use)
const fs = require('fs');
const path = require('path');
const { DatabaseSync } = require('node:sqlite');

const dir = path.join('.wrangler', 'state', 'v3', 'd1', 'miniflare-D1DatabaseObject');
const files = fs.readdirSync(dir).filter((f) => f.endsWith('.sqlite') && f !== 'metadata.sqlite');
console.log('DB FILES:', files.join(', '));
const file = path.join(dir, files[0]);

const db = new DatabaseSync(file, { readOnly: true });

const tables = db
  .prepare("SELECT name FROM sqlite_master WHERE type='table' ORDER BY name")
  .all()
  .map((r) => r.name);

console.log('\n=== TABLES (' + tables.length + ') ===');
console.log(tables.join(', '));

console.log('\n=== APPLIED MIGRATIONS ===');
try {
  const rows = db.prepare('SELECT * FROM d1_migrations ORDER BY id').all();
  rows.forEach((r) => console.log(JSON.stringify(r)));
} catch (e) {
  console.log('ERR: ' + e.message);
}

console.log('\n=== COLUMN DETAIL ===');
const watch = ['users','assignments','hw_submissions','ratings','resources','messages','complaint_feedback','registration_queries','achievements','audit_log','batches','coaches','events','payments','rating_history'];
for (const t of watch) {
  try {
    const cols = db.prepare('PRAGMA table_info("' + t + '")').all().map((c) => c.name);
    console.log((cols.length ? t : t + ' MISSING') + ': ' + (cols.join(', ') || '-'));
  } catch (e) {
    console.log(t + ': ERR ' + e.message);
  }
}
