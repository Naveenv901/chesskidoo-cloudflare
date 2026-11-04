const { DatabaseSync } = require('node:sqlite');
const fs=require('fs'),path=require('path');
const dir=path.join('.wrangler','state','v3','d1','miniflare-D1DatabaseObject');
const file=path.join(dir, fs.readdirSync(dir).filter(f=>f.endsWith('.sqlite')&&f!=='metadata.sqlite')[0]);
const db=new DatabaseSync(file,{readOnly:true});
console.log('d1_migrations:', JSON.stringify(db.prepare('SELECT * FROM d1_migrations ORDER BY id').all(),null,1));
