const att = await (await fetch('https://chesskidoo.pages.dev/lms/js/attendance_extension.js')).text();
console.log('toggleCellAttendance sets window.allAttendance:', att.includes('window.allAttendance = attList'));
console.log('renderChildAttendanceAndHomework fetches:', att.includes("apiCall('/api/attendance?limit=1000'"));
console.log('renderMonthlyMatrix uses window.allAttendance:', att.includes('window.allAttendance || []'));
console.log('renderMonthlyMatrix uses window.allStudents:', att.includes('window.allStudents || []'));