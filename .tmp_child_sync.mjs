const s = await (await fetch('https://chesskidoo.pages.dev/lms/scripts.js')).text();
// Check renderChildAttendanceAndHomework - the child portal's data loader
const i = s.indexOf('window.renderChildAttendanceAndHomework = async function');
if (i !== -1) {
  console.log('=== renderChildAttendanceAndHomework (child portal) ===');
  console.log(s.slice(i, i + 3000));
}