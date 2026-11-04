const fs=require('fs');
const files=['lms/scripts.js','assets/js/db.js'];
for(const f of files){ if(!fs.existsSync(f)) { console.log('MISSING '+f); continue; } const s=fs.readFileSync(f,'utf8'); const lines=s.split(/\r?\n/);
const targets=['/api/events','/api/achievements','/api/batches','/api/payments','/api/rating_history','/api/audit','/api/messages','/api/resources','/api/coaches'];
console.log('########## '+f+' ##########');
for(const t of targets){ for(let i=0;i<lines.length;i++){ if(lines[i].includes(t)){ console.log('--- '+t+' @ line '+(i+1)+' ---'); console.log(lines.slice(Math.max(0,i-6),Math.min(lines.length,i+16)).join('\n')); break; } } }
}
