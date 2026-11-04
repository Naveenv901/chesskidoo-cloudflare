const fs = require('fs');
const s = fs.readFileSync('lms/js/attendance_extension.js', 'utf8');
const i = s.indexOf('window.renderAttendanceCalendar = function');
console.log(s.slice(i, i + 1200));