const fs=require('fs'),path=require('path');
const base='.wrangler/tmp';
const dirs=fs.readdirSync(base).filter(d=>fs.statSync(path.join(base,d)).isDirectory());
const latest=dirs.map(d=>({d,t:fs.statSync(path.join(base,d)).mtimeMs})).sort((a,b)=>b.t-a.t)[0];
console.log('latest: '+latest.d);
const f=fs.readdirSync(path.join(base,latest.d)).filter(x=>x.endsWith('.js'));
console.log(f.join('\n'));
