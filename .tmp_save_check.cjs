const fs = require('fs');
const s = fs.readFileSync('lms/scripts.js', 'utf8');
// Find saveBatchAttendance and check if it updates window.allAttendance after saving
const i = s.indexOf('saveBatchAttendance');
const body = s.slice(i, i + 6000);
console.log('saveBatchAttendance updates window.allAttendance:', body.includes('window.allAttendance'));
console.log('saveBatchAttendance updates allAttendance:', /\ballAttendance\s*=/.test(body));
// Find what happens after the POST
const postIdx = body.indexOf('apiCall("/api/attendance"');
if (postIdx !== -1) {
  const afterPost = body.slice(postIdx, postIdx + 3000);
  console.log('\nAfter POST:');
  console.log('updates allAttendance:', /\ballAttendance\s*=/.test(afterPost));
  console.log('updates window.allAttendance:', afterPost.includes('window.allAttendance'));
  console.log('calls renderAttendanceCalendar:', afterPost.includes('renderAttendanceCalendar'));
  console.log('calls renderMonthlyMatrix:', afterPost.includes('renderMonthlyMatrix'));
  console.log('calls renderChildAttendance:', afterPost.includes('renderChildAttendance'));
}