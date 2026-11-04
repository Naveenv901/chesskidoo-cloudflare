const att = await (await fetch('https://chesskidoo.pages.dev/lms/js/attendance_extension.js')).text();

// Check 1: toggleCellAttendance mutates window.allAttendance (the source the calendar reads)
console.log('1. toggleCellAttendance mutates window.allAttendance:', att.includes('window.allAttendance = attList'));

// Check 2: renderMonthlyMatrix reads from window.allAttendance (not stale module var)
console.log('2. renderMonthlyMatrix reads window.allAttendance:', att.includes('window.allAttendance || []'));
console.log('3. renderMonthlyMatrix reads window.allStudents:', att.includes('window.allStudents || []'));

// Check 3: renderChildAttendanceAndHomework does a fresh fetch
console.log('4. renderChildAttendanceAndHomework fetches fresh:', att.includes("apiCall('/api/attendance?limit=1000'"));

// Check 4: renderAttendanceCalendar reads from window.allAttendance
const calStart = att.indexOf('window.renderAttendanceCalendar = function');
const calSnippet = att.slice(calStart, calStart + 600);
console.log('5. renderAttendanceCalendar reads window.allAttendance:', calSnippet.includes('window.allAttendance'));