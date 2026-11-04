// Temporary schema dumper (delete after use)
const fs = require('fs');
const path = require('path');
const { DatabaseSync } = require('node:sqlite');

const dir = path.join('.wrangler', 'state', 'v3', 'd1', 'miniflare-D1DatabaseObject');
const file = fs.readdirSync(dir).filter((f) => f.endsWith('.sqlite') && f !== 'metadata.sqlite')[0];
const db = new DatabaseSync(path.join(dir, file), { readOnly: true });

const tables = db.prepare("SELECT name FROM sqlite_master WHERE type='table' ORDER BY name").all();
for (const r of tables) {
  const cols = db.prepare('PRAGMA table_info("' + r.name + '")').all()
    .map((c) => c.name + (c.pk ? '*' : '') + ':' + c.type).join(', ');
  console.log(r.name + '\n    ' + cols);
}
console.log('\n--- MIGRATIONS TABLE ---');
try {
  console.log(JSON.stringify(db.prepare('SELECT * FROM d1_migrations ORDER BY id').all(), null, 2));
} catch (e) {
  console.log('no d1_migrations: ' + e.message);
}
