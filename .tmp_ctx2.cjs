const fs = require('fs');
const handler = fs.readFileSync('functions/api/[[path]].coach-handler-new.js', 'utf8');
let a = fs.readFileSync('functions/api/[[path]].js', 'utf8');
let b = fs.readFileSync('functions/api/index.js', 'utf8');
a = a.replace(/\r\n/g, '\n');
b = b.replace(/\r\n/g, '\n');
function splice(src) {
  const i = src.indexOf('async function handleCoaches');
  const j = src.indexOf('function handleComplaintFeedback', i);
  return src.slice(0, i) + handler + src.slice(j);
}
fs.writeFileSync('functions/api/[[path]].js', splice(a));
fs.writeFileSync('functions/api/index.js', splice(b));
console.log('spliced into both files');
