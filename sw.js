const CACHE_NAME = counseling-textbook-v1;
const ASSETS = [
  ./,
  ./index.html,
  ./style.css,
  ./app.js,
  ./data.js,
  ./manifest.json,
  ./icon-192.png,
  ./icon-512.png,
  ./apple-touch-icon.png
];

self.addEventListener(install, (e) => {
  e.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(ASSETS);
    })
  );
  self.skipWaiting();
});

self.addEventListener(activate, (e) => {
  e.waitUntil(
    caches.keys().then((keys) => {
      return Promise.all(
        keys.map((k) => {
          if (k !== CACHE_NAME) return caches.delete(k);
        })
      );
    })
  );
  self.clients.claim();
});

self.addEventListener(fetch, (e) => {
  e.respondWith(
    caches.match(e.request).then((res) => {
      return res || fetch(e.request).catch(() => {
        if (e.request.mode === navigate) {
          return caches.match(./index.html);
        }
      });
    })
  );
});
