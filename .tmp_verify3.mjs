const att = await (await fetch('https://chesskidoo.pages.dev/lms/js/attendance_extension.js')).text();
const i = att.indexOf('window.renderAttendanceCalendar = function');
const full = att.slice(i, i + 3000);
console.log('renderAttendanceCalendar reads window.allAttendance:', full.includes('window.allAttendance'));
console.log('renderAttendanceCalendar reads window.allStudents:', full.includes('window.allStudents'));
console.log('absent icon present:', full.includes('✕'));
console.log('present icon present:', full.includes('✓'));