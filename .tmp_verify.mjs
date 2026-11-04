const base = 'https://chesskidoo.pages.dev';
const lms = await (await fetch(base + '/lms/index.html')).text();
const marqueeCount = (lms.match(/badge-marquee/g) || []).length;
const cspMatch = lms.match(/<meta http-equiv="Content-Security-Policy" content="([^"]*)"/);
const csp = cspMatch ? cspMatch[1] : 'NOT FOUND';
const hasSentry = csp.includes('sentry.io');
console.log('LMS marquee count:', marqueeCount);
console.log('LMS CSP has sentry:', hasSentry);

const landing = await (await fetch(base + '/')).text();
const lm = (landing.match(/badge-marquee/g) || []).length;
const hc = (landing.match(/high-contrast/g) || []).length;
console.log('Landing marquee count:', lm);
console.log('Landing high-contrast count:', hc);