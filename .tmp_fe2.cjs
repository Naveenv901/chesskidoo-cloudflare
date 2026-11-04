const fs=require('fs');
const s=fs.readFileSync('lms/scripts.js','utf8');
console.log('len',s.length,'lines',s.split('\n').length);
const idx=s.indexOf('/api/events');
console.log('first /api/events at',idx);
console.log(JSON.stringify(s.slice(Math.max(0,idx-1200), idx+1500)));
