// Temporary D1 migration-history inspector (delete after use)
const fs = require('fs');
const path = require('path');
const { DatabaseSync } = require('node:sqlite');

const dir = path.join('.wrangler', 'state', 'v3', 'd1', 'miniflare-D1DatabaseObject');
const file = path.join(dir, fs.readdirSync(dir).filter((f) => f.endsWith('.sqlite') && f !== 'metadata.sqlite')[0]);
const cp = '.tmp_insp2.sqlite';
fs.copyFileSync(file, cp);
const db = new DatabaseSync(cp);
const out = [];
out.push('FILE: ' + file);
out.push('--- d1_migrations ---');
try {
  const rows = db.prepare('SELECT * FROM d1_migrations ORDER BY id').all();
  out.push(JSON.stringify(rows, null, 1));
} catch (e) {
  out.push('no d1_migrations: ' + e.message);
}
out.push('--- objects ---');
const objs = db.prepare("SELECT name, type FROM sqlite_master WHERE type IN ('table','view') ORDER BY name").all();
out.push(objs.map((r) => r.name + ' (' + r.type + ')').join('\n'));
out.push('');
out.push('--- columns per table ---');
for (const o of objs) {
  if (o.type !== 'table') continue;
  const cols = db.prepare('PRAGMA table_info("' + o.name + '")').all();
  out.push(o.name + ': ' + cols.map((c) => c.name).join(', '));
}
fs.writeFileSync('.tmp_insp2.txt', out.join('\n'), 'utf8');
console.log('ok -> .tmp_insp2.txt');
