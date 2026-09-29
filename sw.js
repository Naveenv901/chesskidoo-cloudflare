/* ChessKidoo service worker — offline app shell + installable PWA.
   Strategy: network-first for same-origin GET (so the app is always fresh
   when online), with a cached fallback so it still opens offline. Cross-origin
   requests (Supabase, CDNs, lichess, chess.com, Razorpay) are never touched. */

const isLocal = Boolean(
  self.location.hostname === 'localhost' ||
  self.location.hostname === '[::1]' ||
  self.location.hostname.match(/^127(?:\.(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)){3}$/)
);

// In development on localhost / Vite, immediately wipe all caches and unregister to prevent stale traps
if (isLocal) {
  self.addEventListener('install', () => {
    self.skipWaiting();
  });

  self.addEventListener('activate', (event) => {
    event.waitUntil(
      caches.keys()
        .then((keys) => Promise.all(keys.map((k) => caches.delete(k))))
        .then(() => self.registration.unregister())
        .then(() => self.clients.matchAll())
        .then((clients) => {
          clients.forEach((client) => client.navigate(client.url));
        })
    );
  });
} else {
  // Production PWA logic
  const CACHE = 'chesskidoo-v3';
  const SHELL = ['/', '/index.html', '/lms/index.html', '/manifest.json', '/icon.svg'];

  self.addEventListener('install', (event) => {
    event.waitUntil(
      caches.open(CACHE)
        .then((c) => c.addAll(SHELL).catch(() => {}))
        .then(() => self.skipWaiting())
    );
  });

  self.addEventListener('activate', (event) => {
    event.waitUntil(
      caches.keys()
        .then((keys) => Promise.all(keys.filter((k) => k !== CACHE).map((k) => caches.delete(k))))
        .then(() => self.clients.claim())
    );
  });

  self.addEventListener('message', (e) => {
    if (e.data && e.data.type === 'SKIP_WAITING') self.skipWaiting();
  });

  self.addEventListener('fetch', (event) => {
    const req = event.request;
    if (!req || req.method !== 'GET') return;

    const url = new URL(req.url);
    if (url.origin !== self.location.origin) return;
    if (url.pathname.endsWith('.mp4') || url.pathname.endsWith('.webm') || req.headers.get('range')) return;

    // Navigations: network-first, fall back to cached app shell when offline.
    if (req.mode === 'navigate') {
      event.respondWith(
        fetch(req)
          .then((res) => { _put(req, res.clone()); return res; })
          .catch(async () => {
            const isLms = url.pathname.startsWith('/lms');
            const fallbackPath = isLms ? '/lms/index.html' : '/index.html';
            const c = await caches.match(req) || await caches.match(fallbackPath) || await caches.match('/');
            if (c) return c;
            return new Response('Offline', { status: 503, statusText: 'Offline', headers: { 'Content-Type': 'text/plain' } });
          })
      );
      return;
    }

    // Other same-origin GETs (CSS/JS/images): network-first, cache as fallback.
    event.respondWith(
      fetch(req)
        .then((res) => {
          if (res && res.status === 200 && (res.type === 'basic' || res.type === 'default')) {
            _put(req, res.clone());
          }
          return res;
        })
        .catch(async () => {
          const cached = await caches.match(req);
          if (cached) return cached;
          return new Response('', { status: 404, statusText: 'Not Found' });
        })
    );
  });

  function _put(req, res) {
    caches.open(CACHE).then((c) => c.put(req, res)).catch(() => {});
  }
}
