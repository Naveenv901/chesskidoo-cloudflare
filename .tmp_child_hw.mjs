const s = await (await fetch('https://chesskidoo.pages.dev/lms/scripts.js')).text();
// Find renderChildHomework - this is what the child portal uses
let i = s.indexOf('function renderChildHomework');
if (i === -1) i = s.indexOf('renderChildHomework =');
if (i === -1) i = s.indexOf('renderChildHomework = function');
if (i === -1) i = s.indexOf('renderChildHomework = async');
console.log('renderChildHomework at', i);
if (i !== -1) console.log(s.slice(i, i + 5000));