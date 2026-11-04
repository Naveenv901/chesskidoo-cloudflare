const att = await (await fetch('https://chesskidoo.pages.dev/lms/js/attendance_extension.js')).text();
const i = att.indexOf('window.renderAttendanceCalendar = function');
const snippet = att.slice(i, i + 8000);
console.log('calendar has status absent:', snippet.includes("'absent'"));
console.log('calendar has checkmark:', snippet.includes('✓'));
console.log('calendar has X:', snippet.includes('✕'));
// Find the absent rendering
const absIdx = snippet.indexOf("'absent'");
if (absIdx !== -1) console.log('absent context:', snippet.slice(absIdx - 100, absIdx + 200));