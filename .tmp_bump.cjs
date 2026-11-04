const fs = require('fs');
const s = fs.readFileSync('lms/index.html', 'utf8');
// Find the scripts.js tag
const i = s.indexOf('scripts.js?v=');
console.log('Current tag:', s.slice(Math.max(0, i - 20), i + 40));
// Bump the version
const newTag = s.replace('scripts.js?v=20261001a', 'scripts.js?v=20261028d');
fs.writeFileSync('lms/index.html', newTag);
console.log('Updated to scripts.js?v=20261028d');