const fs=require('fs'),path=require('path');
const {DatabaseSync}=require('node:sqlite');
const dbDir=path.join('.wrangler','state','v3','d1','miniflare-D1DatabaseObject');
if(!fs.existsSync(dbDir)){console.log('NO DB DIR');process.exit(0);}
const files=fs.readdirSync(dbDir).filter(f=>f.endsWith('.sqlite'));
console.log('sqlite files: '+files.join(', '));
const src=files.find(f=>f!=='metadata.sqlite');
const tmp='.tmp_state.sqlite';
fs.copyFileSync(path.join(dbDir,src),tmp);
const db=new DatabaseSync(tmp);
const tables=db.prepare("SELECT name FROM sqlite_master WHERE type='table' ORDER BY name").all().map(r=>r.name);
console.log('TABLES('+tables.length+'): '+tables.join(', '));
try{ console.log('d1_migrations: '+JSON.stringify(db.prepare('SELECT * FROM d1_migrations ORDER BY id').all(),null,1)); }catch(e){ console.log('no d1_migrations: '+e.message); }
for(const t of ['ratings','resources','hw_submissions','assignments']){
  if(tables.includes(t)){
    const cols=db.prepare('PRAGMA table_info('+t+')').all().map(r=>r.name);
    console.log(t+' cols: '+cols.join(', '));
  }
}
db.close();
