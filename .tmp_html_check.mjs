const html = await (await fetch('https://chesskidoo.pages.dev/lms/index.html')).text();
const m = html.match(/scripts\.js\?v=([^"]*)/);
console.log('Live LMS scripts.js version:', m ? m[1] : 'NOT FOUND');
console.log('Has sync code in HTML reference:', html.includes('20261028d'));