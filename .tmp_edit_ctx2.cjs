const fs = require('fs');
const s = fs.readFileSync('lms/scripts.js', 'utf8');
// Find the editHomework function and the cId variable
const i = s.indexOf('You can only edit your own');
console.log(s.slice(i - 2500, i + 200));