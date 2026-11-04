const att = await (await fetch('https://chesskidoo.pages.dev/lms/js/attendance_extension.js')).text();
// Check for absent/present icon patterns in deployed version
console.log('has absent red background:', att.includes('255, 118, 117') || att.includes('ff7675'));
console.log('has present green background:', att.includes('46, 204, 113') || att.includes('2ecc71'));
console.log('has checkmark char:', att.includes('✓'));
console.log('has X char:', att.includes('✕'));
// Check the status rendering logic
const i = att.indexOf('renderAttendanceCalendar');
const snippet = att.slice(i, i + 4000);
console.log('status === present:', snippet.includes("'present'"));
console.log('status === absent:', snippet.includes("'absent'"));