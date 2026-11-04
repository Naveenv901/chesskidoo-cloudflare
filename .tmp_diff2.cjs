const fs=require('fs');
const a=fs.readFileSync('functions/api/index.js','utf8').replace(/\r\n/g,'\n').split('\n');
const b=fs.readFileSync('functions/api/[[path]].js','utf8').replace(/\r\n/g,'\n').split('\n');
console.log('index.js lines: '+a.length+'  path.js lines: '+b.length);
// find common prefix
let i=0; while(i<a.length&&i<b.length&&a[i]===b[i]) i++;
console.log('common prefix lines: '+i);
console.log('--- index.js line '+i+' ---'); console.log(a.slice(i,i+3).join('\n'));
console.log('--- path.js  line '+i+' ---'); console.log(b.slice(i,i+3).join('\n'));
// common suffix
let j=0; while(j<a.length&&j<b.length&&a[a.length-1-j]===b[b.length-1-j]) j++;
console.log('common suffix lines: '+j);
fs.writeFileSync('.tmp_idx_only.txt', a.slice(i, a.length-j).join('\n'));
fs.writeFileSync('.tmp_path_only.txt', b.slice(i, b.length-j).join('\n'));
console.log('index-only body lines: '+(a.length-j-i)+'  path-only body lines: '+(b.length-j-i));
