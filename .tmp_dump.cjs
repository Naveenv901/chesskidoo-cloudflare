const fs=require('fs'),path=require('path');
const {DatabaseSync}=require('node:sqlite');
const dir=path.join('.wrangler','state','v3','d1','miniflare-D1DatabaseObject');
const f=fs.readdirSync(dir).filter(x=>x.endsWith('.sqlite')&&x!=='metadata.sqlite')[0];
const db=new DatabaseSync(path.join(dir,f),{readOnly:true});
const t=db.prepare("SELECT name FROM sqlite_master WHERE type='table' ORDER BY name").all().map(r=>r.name);
console.log('TABLES('+t.length+'): '+t.join(', '));
for(const tb of t){
  const cols=db.prepare('PRAGMA table_info("'+tb+'")').all().map(c=>c.name);
  console.log('  '+tb+': '+cols.join(','));
}
db.close();
