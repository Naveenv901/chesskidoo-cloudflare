const s = await (await fetch('https://chesskidoo.pages.dev/lms/scripts.js')).text();
console.log('saveBatchAttendance has sync code:', s.includes('Sync window.allAttendance immediately'));
console.log('saveBatchAttendance calls renderMonthlyMatrix:', s.includes('window.renderMonthlyMatrix()'));
console.log('saveBatchAttendance calls renderAttendanceCalendar:', s.includes('window.renderAttendanceCalendar('));