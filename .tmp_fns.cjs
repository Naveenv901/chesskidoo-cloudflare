const fs=require('fs');
const s=fs.readFileSync('functions/api/[[path]].js','utf8');
const lines=s.split(/\r?\n/);
console.log('TOTAL LINES: '+lines.length);
const re=/^(async )?function (\w+)/;
lines.forEach((l,i)=>{ const m=l.match(re); if(m) console.log((i+1)+': '+m[2]); });
