const s = await (await fetch('https://chesskidoo.pages.dev/lms/scripts.js')).text();
// Find saveBatchAttendance continuation - what happens after the POST
let i = s.indexOf('saveBatchAttendance');
let postIdx = s.indexOf('apiCall("/api/attendance"', i);
// Find the end of the .then() or after saved
let afterSaved = s.indexOf('if (saved)', postIdx);
if (afterSaved !== -1) {
  console.log('=== After saved ===');
  console.log(s.slice(afterSaved, afterSaved + 3000));
}