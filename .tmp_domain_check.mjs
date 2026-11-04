// Check which domain serves what
const cf = await (await fetch('https://chesskidoo.pages.dev/lms/scripts.js?v=' + Date.now())).text();
const cfSync = cf.includes('Sync window.allAttendance immediately');

console.log('Cloudflare Pages (chesskidoo.pages.dev):');
console.log('  has sync code:', cfSync);
console.log('  length:', cf.length);

// Check chesskidoo.com
const resp = await fetch('https://chesskidoo.com/lms/scripts.js');
console.log('\nVercel (chesskidoo.com):');
console.log('  status:', resp.status);
console.log('  content-type:', resp.headers.get('content-type'));
const text = await resp.text();
console.log('  is HTML:', text.trim().startsWith('<'));
console.log('  has sync code:', text.includes('Sync window.allAttendance immediately'));