const s = await (await fetch('https://chesskidoo.pages.dev/lms/scripts.js')).text();
// Find loadAllData function
let i = s.indexOf('loadAllData');
if (i !== -1) {
  console.log('=== loadAllData ===');
  console.log(s.slice(i, i + 3000));
}