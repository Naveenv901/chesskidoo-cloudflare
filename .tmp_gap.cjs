const fs=require('fs'),path=require('path');
const {DatabaseSync}=require('node:sqlite');
const dir=path.join('.wrangler','state','v3','d1','miniflare-D1DatabaseObject');
const file=path.join(dir,fs.readdirSync(dir).filter(f=>f.endsWith('.sqlite')&&f!=='metadata.sqlite')[0]);
const db=new DatabaseSync(file,{readOnly:true});
const tables=db.prepare("SELECT name FROM sqlite_master WHERE type='table'").all().map(r=>r.name);
const cols={};
for(const t of tables){ try{ cols[t]=db.prepare('PRAGMA table_info("'+t+'")').all().map(c=>c.name);}catch(e){cols[t]=[];} }
const files=['functions/api/[[path]].js','functions/api/index.js','functions/api/demo-sheet.js'];
const sql=[];
for(const f of files){ const t=fs.readFileSync(f,'utf8');
  const re=/(?:prepare|exec)\(\s*[`'"]([\s\S]*?)[`'"]\s*\)/g; let m;
  while((m=re.exec(t))) sql.push({f,m:m[1]});
}
const missingTables=new Set(), missingCols=new Map();
for(const {f,s} of sql){
  const tm=/\b(?:FROM|INTO|UPDATE|JOIN)\s+["`\[]?([A-Za-z_][A-Za-z0-9_]*)/gi; let m;
  while((m=tm.exec(s))){
    const tb=m[1].toLowerCase();
    if(tb==='select') continue;
    if(!tables.includes(tb)){ missingTables.add(tb+'   <- '+f); continue; }
    // column check: find identifiers used that are not cols and not functions
    const used=new Set();
    const cm=/\b([a-z_][a-z0-9_]*)\b/gi; let c;
    while((c=cm.exec(s))){ used.add(c[1].toLowerCase()); }
    const set=new Set(cols[tb].map(x=>x.toLowerCase()));
    for(const u of used){
      if(set.has(u)) continue;
      if(['null','not','and','or','in','from','where','select','insert','into','values','order','by','group','having','limit','offset','set','update','delete','join','left','right','inner','outer','cross','on','as','distinct','case','when','then','else','end','count','sum','avg','min','max','coalesce','ifnull','nullif','like','glob','between','exists','union','all','any','asc','desc','default','primary','key','foreign','references','unique','check','constraint','collate','autoincrement','integer','text','real','blob','notnull','if','replace','ignore','first','last','row_number','json_extract','lower','upper','trim','substr','replace','length','date','datetime','now','true','false','random','group_concat','printf','printf','cast','iif'].includes(u)) continue;
      if(/^_cf_/.test(u)) continue;
      if(!missingCols.has(tb)) missingCols.set(tb,new Set());
      missingCols.get(tb).add(u);
    }
  }
}
console.log('=== MISSING TABLES ==='); [...missingTables].sort().forEach(x=>console.log('  '+x));
console.log('\n=== POSSIBLY MISSING COLUMNS ===');
for(const [t,set] of [...missingCols.entries()].sort()){
  const real=[...set].filter(u=>!['t','e','r','n','i','o','a','s','m','c','d','l','u','f','g','p','b','h','k','v','w','x','y','z','q','j','bt','id','ids','url','ids'].includes(u));
  if(real.length) console.log('  '+t+': '+real.join(', '));
}
