const fs=require('fs');
const files=['functions/api/[[path]].js','functions/api/index.js','functions/api/demo-sheet.js'];
for(const f of files){ console.log(f, fs.existsSync(f), fs.statSync(f).size); }
const t=fs.readFileSync('functions/api/[[path]].js','utf8');
console.log('prepare count:', (t.match(/\.prepare\(/g)||[]).length);
console.log('backtick prepare:', (t.match(/\.prepare\(\s*`/g)||[]).length);
console.log('quote prepare:', (t.match(/\.prepare\(\s*'/g)||[]).length);
