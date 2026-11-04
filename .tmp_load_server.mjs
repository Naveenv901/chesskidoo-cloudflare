const s = await (await fetch('https://chesskidoo.pages.dev/lms/scripts.js')).text();
// Find loadAllData and check the server fetch path
let i = s.indexOf('async function loadAllData');
const body = s.slice(i, i + 12000);
// Check if it fetches from server
console.log('has server fetch:', body.includes('apiCall(') || body.includes('fetch('));
console.log('has allAttendance = dataCache:', body.includes('allAttendance = dataCache.attendance'));
console.log('has window.allAttendance = allAttendance:', body.includes('window.allAttendance = allAttendance'));
// Find the server fetch section
const fetchIdx = body.indexOf('apiCall(');
if (fetchIdx !== -1) {
  console.log('\n=== Server fetch ===');
  console.log(body.slice(fetchIdx, fetchIdx + 2000));
}