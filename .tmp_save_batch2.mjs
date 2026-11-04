const s = await (await fetch('https://chesskidoo.pages.dev/lms/scripts.js')).text();
// Find saveBatchAttendance continuation - what happens after the POST
let i = s.indexOf('saveBatchAttendance');
// Find the POST call within this function
let postIdx = s.indexOf('apiCall("/api/attendance"', i);
if (postIdx !== -1) {
  console.log('=== POST call ===');
  console.log(s.slice(postIdx, postIdx + 2000));
}