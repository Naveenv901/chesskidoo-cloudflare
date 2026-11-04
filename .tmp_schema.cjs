const { DatabaseSync } = require('node:sqlite');
const fs=require('fs'),path=require('path');
const dir=path.join('.wrangler','state','v3','d1','miniflare-D1DatabaseObject');
const files=fs.readdirSync(dir);
for(const f of files){ console.log('FILE: '+f+' '+fs.statSync(path.join(dir,f)).size); }
const file=path.join(dir, files.filter(f=>f.endsWith('.sqlite')&&f!=='metadata.sqlite')[0]);
const db=new DatabaseSync(file,{readOnly:true});
const tables=db.prepare("SELECT name FROM sqlite_master WHERE type='table' ORDER BY name").all();
console.log('--- TABLES ---');
for(const t of tables){ const cols=db.prepare('PRAGMA table_info("'+t.name+'")').all().map(c=>c.name+':'+c.type).join(', '); console.log(t.name+' => '+cols); }
