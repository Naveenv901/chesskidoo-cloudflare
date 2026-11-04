const att = await (await fetch('https://chesskidoo.pages.dev/lms/js/attendance_extension.js')).text();

// Check status comparison logic in deployed version
console.log("has 'present' comparison:", att.includes("'present'"));
console.log("has 'absent' comparison:", att.includes("'absent'"));
console.log("has 'late' comparison:", att.includes("'late'"));
// Check the renderAttendanceCalendar function specifically
const i = att.indexOf('window.renderAttendanceCalendar = function');
const snippet = att.slice(i, i + 5000);
console.log("calendar has status present:", snippet.includes("'present'"));
console.log("calendar has status absent:", snippet.includes("'absent'"));
console.log("calendar has checkmark:", snippet.includes('✓'));
console.log("calendar has X:", snippet.includes('✕'));