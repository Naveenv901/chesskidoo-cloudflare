const fs = require('fs');
const s = fs.readFileSync('lms/index.html', 'utf8');
// Find all script tags
const regex = /<script[^>]*src="([^"]*)"[^>]*>/g;
let m;
while ((m = regex.exec(s)) !== null) {
  console.log(m[0]);
}