const s = await (await fetch('https://chesskidoo.pages.dev/lms/scripts.js')).text();
// Find the actual loadAllData function definition
let i = s.indexOf('async function loadAllData');
if (i === -1) i = s.indexOf('function loadAllData');
if (i === -1) i = s.indexOf('loadAllData =');
if (i === -1) i = s.indexOf('loadAllData = async');
console.log('loadAllData def at', i);
if (i !== -1) console.log(s.slice(i, i + 3000));