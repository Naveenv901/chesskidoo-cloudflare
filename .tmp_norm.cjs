const fs = require('fs');
const s = fs.readFileSync('lms/scripts.js', 'utf8');
const i = s.indexOf('window.ckSameCoach = function');
console.log(s.slice(i, i + 1000));