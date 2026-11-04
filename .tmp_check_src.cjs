const fs = require('fs');
const s = fs.readFileSync('lms/js/attendance_extension.js', 'utf8');
console.log('toggleCellAttendance sets window.allAttendance:', s.includes('window.allAttendance = attList'));
console.log('renderChildAttendanceAndHomework fetches:', s.includes("apiCall('/api/attendance?limit=1000'"));
console.log('renderChildAttendanceAndHomework is async:', s.includes('window.renderChildAttendanceAndHomework = async function'));