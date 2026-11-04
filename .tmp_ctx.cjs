const fs=require('fs');
const s=fs.readFileSync('lms/scripts.js','utf8');
function ctx(re,label,before,after){ console.log('===== '+label+' ====='); let m,n=0; const r=new RegExp(re,'g'); while((m=r.exec(s))&&n<3){ n++; const st=Math.max(0,m.index-before), en=Math.min(s.length,m.index+after); console.log('--- @'+m.index+' ---'); console.log(s.slice(st,en).replace(/\r/g,'')); } }
ctx('/api/resources','RESOURCES',900,1200);
ctx('/api/rating_history','RATING_HISTORY',700,1500);
