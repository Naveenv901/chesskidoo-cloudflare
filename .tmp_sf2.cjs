const fs=require('fs'),path=require('path');const {DatabaseSync}=require('node:sqlite');
const dir=path.join('.wrangler','state','v3','d1','miniflare-D1DatabaseObject');
const f=fs.readdirSync(dir).filter(x=>x.endsWith('.sqlite')&&x!=='metadata.sqlite')[0];
const db=new DatabaseSync(path.join(dir,f),{readOnly:true});
for(const t of ['coach_notes','document','ratings','credentials','sessions','leads','users']){
  const cols=db.prepare('PRAGMA table_info("'+t+'")').all().map(c=>c.name);
  console.log(t+': '+(cols.join(', ')||'MISSING'));
}
