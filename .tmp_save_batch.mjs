const s = await (await fetch('https://chesskidoo.pages.dev/lms/scripts.js')).text();
// Find saveBatchAttendance - this is likely the form-based save
let i = s.indexOf('saveBatchAttendance');
if (i !== -1) {
  console.log('=== saveBatchAttendance ===');
  console.log(s.slice(i, i + 4000));
}