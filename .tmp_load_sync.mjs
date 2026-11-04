const s = await (await fetch('https://chesskidoo.pages.dev/lms/scripts.js')).text();
// Check if loadAllData syncs window.allAttendance
let i = s.indexOf('async function loadAllData');
const body = s.slice(i, i + 8000);
console.log('loadAllData sets window.allAttendance:', body.includes('window.allAttendance ='));
console.log('loadAllData sets allAttendance = dataCache.attendance:', body.includes('allAttendance = dataCache.attendance'));
// Check if window.allAttendance is synced after the cache load
const syncIdx = body.indexOf('allAttendance = dataCache.attendance');
if (syncIdx !== -1) {
  console.log('\nAfter cache load:', body.slice(syncIdx, syncIdx + 500));
}