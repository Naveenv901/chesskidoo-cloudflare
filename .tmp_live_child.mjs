const att = await (await fetch('https://chesskidoo.pages.dev/lms/js/attendance_extension.js')).text();
// Find renderChildAttendanceAndHomework
const i = att.indexOf('window.renderChildAttendanceAndHomework');
if (i !== -1) {
  const body = att.slice(i, i + 3000);
  console.log('=== renderChildAttendanceAndHomework (live) ===');
  console.log('is async:', att.slice(i, i + 60).includes('async'));
  console.log('fetches fresh:', body.includes("apiCall('/api/attendance?limit=1000'"));
  console.log('sets window.allAttendance:', body.includes('window.allAttendance ='));
  console.log('calls renderAttendanceCalendar:', body.includes('renderAttendanceCalendar'));
  console.log('calls renderChildHomework:', body.includes('renderChildHomework'));
}