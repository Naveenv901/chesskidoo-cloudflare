const fs=require('fs'),path=require('path');
const {DatabaseSync}=require('node:sqlite');
const dir=path.join('.wrangler','state','v3','d1','miniflare-D1DatabaseObject');
const f=fs.readdirSync(dir).filter(x=>x.endsWith('.sqlite')&&x!=='metadata.sqlite')[0];
const db=new DatabaseSync(path.join(dir,f),{readOnly:true});
console.log('d1_migrations:', JSON.stringify(db.prepare('SELECT * FROM d1_migrations').all(),null,1));
console.log('counts:', JSON.stringify(db.prepare("SELECT (SELECT COUNT(*) FROM users) u,(SELECT COUNT(*) FROM resources) r,(SELECT COUNT(*) FROM ratings) ra,(SELECT COUNT(*) FROM hw_submissions) h").all()));
db.close();
