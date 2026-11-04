const att = await (await fetch('https://chesskidoo.pages.dev/lms/js/attendance_extension.js')).text();
// Check the auto-wire at the end
const wireStart = att.indexOf('// Auto-wire renderChildAttendance');
if (wireStart !== -1) {
  console.log('=== Auto-wire ===');
  console.log(att.slice(wireStart, wireStart + 500));
}
// Check if renderChildHomework is called anywhere in the file
console.log('\nrenderChildHomework references:', (att.match(/renderChildHomework/g) || []).length);