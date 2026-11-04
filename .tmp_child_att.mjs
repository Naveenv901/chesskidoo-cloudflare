const s = await (await fetch('https://chesskidoo.pages.dev/lms/scripts.js')).text();
// Check renderChildAttendance - the child portal's attendance renderer
let i = s.indexOf('function renderChildAttendance');
if (i === -1) i = s.indexOf('renderChildAttendance =');
if (i === -1) i = s.indexOf('renderChildAttendance = function');
console.log('renderChildAttendance at', i);
if (i !== -1) console.log(s.slice(i, i + 3000));