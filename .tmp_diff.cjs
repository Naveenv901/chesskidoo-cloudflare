const fs=require('fs');
const a=fs.readFileSync('functions/api/index.js','utf8').split(/\r?\n/);
const b=fs.readFileSync('functions/api/[[path]].js','utf8').split(/\r?\n/);
console.log('index.js lines: '+a.length+'  [[path]].js lines: '+b.length);
