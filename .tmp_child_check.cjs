const fs = require('fs');
const s = fs.readFileSync('lms/js/attendance_extension.js', 'utf8');
// Find renderChildAttendanceAndHomework - check if it fetches fresh data
const i = s.indexOf('window.renderChildAttendanceAndHomework = async function');
if (i !== -1) {
  const body = s.slice(i, i + 2500);
  console.log('=== renderChildAttendanceAndHomework ===');
  console.log('fetches fresh:', body.includes("apiCall('/api/attendance?limit=1000'"));
  console.log('sets window.allAttendance:', body.includes('window.allAttendance ='));
  console.log('calls renderAttendanceCalendar:', body.includes('renderAttendanceCalendar'));
  console.log('calls renderChildHomework:', body.includes('renderChildHomework'));
}