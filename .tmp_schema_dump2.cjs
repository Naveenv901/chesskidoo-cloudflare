const { DatabaseSync } = require('node:sqlite');
const db = new DatabaseSync('.tmp_remote.sqlite');
const names = process.argv.slice(2);
const q = names.length
  ? `SELECT name, sql FROM sqlite_master WHERE type='table' AND name IN (${names.map(n => `'${n}'`).join(',')}) ORDER BY name`
  : `SELECT name FROM sqlite_master WHERE type IN ('table','view') ORDER BY type, name`;
const rows = db.prepare(q).all();
if (names.length) {
  for (const r of rows) {
    console.log('=== ' + r.name + ' ===');
    console.log(r.sql);
    console.log();
  }
} else {
  console.log(rows.map(r => r.name).join('\n'));
}
