const fs=require('fs');
const files=[];
for(const d of ['lms/js','assets/js','src']){
  for(const f of fs.readdirSync(d,{withFileTypes:true})){
    if(f.isFile()&&f.name.endsWith('.js')) files.push(d+'/'+f.name);
  }
}
files.push('lms/scripts.js');
const targets=['/api/events','/api/achievements','/api/batches','/api/payments','/api/rating_history','/api/audit','/api/messages','/api/resources','/api/coaches','/api/students'];
for(const f of files){
  const s=fs.readFileSync(f,'utf8');
  const lines=s.split(/\r?\n/);
  let out='';
  for(let i=0;i<lines.length;i++){
    for(const t of targets){
      if(lines[i].includes(t)){
        out+='\n--- '+f+':'+(i+1)+'  ['+t+'] ---\n'+lines.slice(Math.max(0,i-4),Math.min(lines.length,i+12)).join('\n')+'\n';
        break;
      }
    }
  }
  if(out) console.log('########## '+f+' ##########'+out);
}
