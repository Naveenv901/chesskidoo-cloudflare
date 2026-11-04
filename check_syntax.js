const fs = require('fs');  
const code = fs.readFileSync('assets/js/cloudflare-client.js', 'utf8');  
try { new Function(code); console.log('Syntax OK'); } catch(e) { console.log('Syntax Error:', e.message); }  
