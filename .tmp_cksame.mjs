const base = 'https://chesskidoo.pages.dev';

// Check what the frontend ownership check uses
// ckSameCoach is defined in lms/scripts.js - let's find it
const fs = require('fs');
const s = fs.readFileSync('lms/scripts.js', 'utf8');
const i = s.indexOf('function ckSameCoach');
console.log('ckSameCoach at', i);
if (i !== -1) console.log(s.slice(i, i + 500));

// Also check what the coach session stores
const j = s.indexOf('window.ckSameCoach');
console.log('window.ckSameCoach at', j);