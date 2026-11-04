const fs = require('fs');
const s = fs.readFileSync('dist/lms/js/attendance_extension.js', 'utf8');
console.log('dist has window.allAttendance = attList:', s.includes('window.allAttendance = attList'));
console.log('dist has fetch:', s.includes("apiCall('/api/attendance?limit=1000'"));