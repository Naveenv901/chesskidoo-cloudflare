const fs = require('fs');
const s = fs.readFileSync('lms/js/attendance_extension.js', 'utf8');
const i = s.indexOf('window.renderAttendanceCalendar = function');
const full = s.slice(i, i + 2000);
console.log('Uses window.allAttendance:', full.includes('window.allAttendance'));
console.log('Uses window.allStudents:', full.includes('window.allStudents'));