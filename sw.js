/* Basic service worker for caching core assets. Update ASSETS array to include files you want offline. */
const CACHE = 'adarsh-portfolio-v1';
const ASSETS = [
  '/',
  '/index.html',
  '/css/style.css',
  '/js/script.js',
  '/assets/profile-480.jpg',
  '/assets/favicon.png'
  // add more assets as needed
];

self.addEventListener('install', (e) => {
  e.waitUntil(
    caches.open(CACHE).then(cache => cache.addAll(ASSETS)).then(() => self.skipWaiting())
  );
});

self.addEventListener('activate', (e) => {
  e.waitUntil(self.clients.claim());
});

self.addEventListener('fetch', (e) => {
  e.respondWith(
    caches.match(e.request).then(cached => {
      if (cached) return cached;
      return fetch(e.request).then(resp => {
        // Optionally cache new requests here for runtime caching
        return resp;
      }).catch(() => {
        // fallback: optionally serve an offline page or placeholder image
      });
    })
  );
});