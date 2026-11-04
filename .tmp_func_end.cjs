const fs = require('fs');
const s = fs.readFileSync('lms/scripts.js', 'utf8');
// Find saveBatchAttendance and locate its closing brace
const start = s.indexOf('saveBatchAttendance');
// Find the function body end - look for the pattern after the POST
const postIdx = s.indexOf('apiCall("/api/attendance"', start);
// Find the end of the try/catch after the POST
const catchIdx = s.indexOf('} catch (e)', postIdx);
// Find the closing of the function after the catch
const funcEnd = s.indexOf('}', catchIdx + 100);
// Show context around the end
console.log('Function end context:');
console.log(s.slice(funcEnd - 200, funcEnd + 100));