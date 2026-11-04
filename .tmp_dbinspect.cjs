const { DatabaseSync } = require('node:sqlite');
const fs = require('fs');
const path = require('path');

const dbDir = path.join('.wrangler', 'state', 'v3', 'd1', 'miniflare-D1DatabaseObject');
const file = fs.readdirSync(dbDir).find((f) => f.endsWith('.sqlite') && f !== 'metadata.sqlite');
const db = new DatabaseSync(path.join(dbDir, file), { readOnly: true });

const out = { tables: {}, migrations: [] };
const tables = db.prepare("SELECT name FROM sqlite_master WHERE type='table' ORDER BY name").all();
for (const t of tables) {
  if (t.name.startsWith('_cf') || t.name === 'd1_migrations' || t.name === 'sqlite_sequence') continue;
  const cols = db.prepare(`PRAGMA table_info("${t.name}")`).all();
  out.tables[t.name] = cols.map((c) => c.name);
}
try {
  out.migrations = db.prepare('SELECT id,name,applied_at FROM d1_migrations ORDER BY id').all();
} catch (e) { out.migrations = []; }
fs.writeFileSync('.tmp_schema.json', JSON.stringify(out, null, 2));
console.log('wrote .tmp_schema.json tables=' + Object.keys(out.tables).length + ' migrations=' + out.migrations.length);
console.log('MIGRATIONS: ' + out.migrations.map((m) => m.id + ':' + m.name).join(', '));

