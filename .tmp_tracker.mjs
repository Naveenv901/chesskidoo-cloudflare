const s = await (await fetch('https://chesskidoo.pages.dev/lms/scripts.js')).text();
// Find openAttendanceHomeworkTracker
let i = s.indexOf('window.openAttendanceHomeworkTracker');
if (i === -1) i = s.indexOf('openAttendanceHomeworkTracker');
console.log('openAttendanceHomeworkTracker at', i);
if (i !== -1) console.log(s.slice(i, i + 3000));