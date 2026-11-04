const { DatabaseSync } = require('node:sqlite');
const fs=require('fs'),path=require('path');
const dir=path.join('.wrangler','state','v3','d1','miniflare-D1DatabaseObject');
const file=path.join(dir, fs.readdirSync(dir).filter(f=>f.endsWith('.sqlite')&&f!=='metadata.sqlite')[0]);
const db=new DatabaseSync(file,{readOnly:true});
for(const t of ['ratings','resources','messages','hw_submissions','feedback','users','expenses','assignments','attendance','classes','credentials','leads']){
  const cols=db.prepare('PRAGMA table_info("'+t+'")').all().map(c=>c.name);
  console.log(t+': '+cols.join(', '));
}
