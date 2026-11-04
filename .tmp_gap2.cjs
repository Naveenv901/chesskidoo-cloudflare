// Temporary D1 gap inspector (delete after use)
const fs = require('fs');
const path = require('path');
const { DatabaseSync } = require('node:sqlite');

const dir = path.join('.wrangler', 'state', 'v3', 'd1', 'miniflare-D1DatabaseObject');
const file = path.join(dir, fs.readdirSync(dir).filter((f) => f.endsWith('.sqlite') && f !== 'metadata.sqlite')[0]);
const db = new DatabaseSync(file, { readOnly: true });

const tables = db.prepare("SELECT name FROM sqlite_master WHERE type='table'").all().map((r) => r.name);
const cols = {};
for (const t of tables) {
  cols[t] = db.prepare('PRAGMA table_info("' + t + '")').all().map((c) => c.name.toLowerCase());
}

const files = ['functions/api/[[path]].js', 'functions/api/index.js', 'functions/api/demo-sheet.js'];
const sqls = [];
for (const f of files) {
  const src = fs.readFileSync(f, 'utf8');
  const re = /\.prepare\(\s*(`[^`]*`|'[^']*'|"[^"]*")\s*\)/g;
  let m;
  while ((m = re.exec(src))) {
    let s = m[1];
    if ((s[0] === '`' && s.endsWith('`')) || (s[0] === "'" && s.endsWith("'")) || (s[0] === '"' && s.endsWith('"'))) {
      s = s.slice(1, -1);
    }
    sqls.push({ f, s });
  }
}
console.log('SQL statements captured: ' + sqls.length);

const SQL_KEYWORDS = new Set(['null','not','and','or','in','from','where','select','insert','into','values','order','by','group','having','limit','offset','set','update','delete','join','left','right','inner','outer','cross','on','as','distinct','case','when','then','else','end','count','sum','avg','min','max','coalesce','ifnull','nullif','like','glob','between','exists','union','all','any','asc','desc','default','primary','key','foreign','references','unique','check','constraint','collate','autoincrement','integer','text','real','blob','if','replace','ignore','row_number','json_extract','lower','upper','trim','substr','length','date','datetime','now','true','false','random','group_concat','printf','cast','iif','first','last','row']);

const missingTables = new Map();
const missingCols = new Map();

for (const { f, s } of sqls) {
  const tm = /\b(?:FROM|INTO|UPDATE|JOIN)\s+["`\[]?([A-Za-z_][A-Za-z0-9_]*)/gi;
  let m;
  const tblsInStmt = [];
  while ((m = tm.exec(s))) {
    const tb = m[1].toLowerCase();
    if (tb === 'select') continue;
    tblsInStmt.push(tb);
    if (!tables.includes(tb)) {
      if (!missingTables.has(tb)) missingTables.set(tb, new Set());
      missingTables.get(tb).add(f);
    }
  }
  for (const tb of new Set(tblsInStmt)) {
    if (!tables.includes(tb)) continue;
    const set = new Set(cols[tb]);
    const used = new Set();
    const cm = /`?([a-z_][a-z0-9_]*)`?/gi;
    let c;
    while ((c = cm.exec(s))) used.add(c[1].toLowerCase());
    for (const u of used) {
      if (set.has(u) || SQL_KEYWORDS.has(u)) continue;
      if (/^_cf_/.test(u)) continue;
      if (u.length < 2) continue;
      if (!missingCols.has(tb)) missingCols.set(tb, new Map());
      if (!missingCols.get(tb).has(u)) missingCols.get(tb).set(u, f);
    }
  }
}

console.log('\n=== MISSING TABLES (used in API, absent in D1) ===');
if (!missingTables.size) console.log('  (none)');
for (const [t, fs2] of [...missingTables].sort()) {
  console.log('  ' + t + '  <- ' + [...fs2].join(', '));
}

console.log('\n=== CANDIDATE MISSING COLUMNS ===');
if (!missingCols.size) console.log('  (none)');
for (const [t, map] of [...missingCols].sort()) {
  console.log('  ' + t + ':');
  for (const [c, f] of map) console.log('      - ' + c + '   (' + f + ')');
}
