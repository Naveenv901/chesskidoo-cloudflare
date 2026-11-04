const s = await (await fetch('https://chesskidoo.pages.dev/lms/scripts.js')).text();
// Find markAllPresent
let i = s.indexOf('window.markAllPresent');
if (i !== -1) {
  console.log('=== markAllPresent ===');
  console.log(s.slice(i, i + 2500));
}