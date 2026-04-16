// Service worker for meal-plan-site
// Strategy: network-first with cache fallback.
// - When online: always fetches fresh content and updates the cache.
// - When offline: serves the last cached version.
// - On activate: clears all old caches so stale HTML from previous weeks is removed.

const CACHE = 'meal-plan-v1';

self.addEventListener('install', event => {
  // Pre-cache the root page immediately on install
  event.waitUntil(
    caches.open(CACHE).then(c => c.add('./'))
  );
  // Activate immediately — don't wait for old tabs to close
  self.skipWaiting();
});

self.addEventListener('activate', event => {
  // Delete any caches from older SW versions, then take control of open pages
  event.waitUntil(
    caches.keys()
      .then(keys => Promise.all(
        keys.filter(k => k !== CACHE).map(k => caches.delete(k))
      ))
      .then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', event => {
  // Only handle GET requests to our own origin
  if (event.request.method !== 'GET') return;

  event.respondWith(
    fetch(event.request)
      .then(response => {
        // Cache a clone of every successful response
        const clone = response.clone();
        caches.open(CACHE).then(c => c.put(event.request, clone));
        return response;
      })
      .catch(() => caches.match(event.request))
  );
});
