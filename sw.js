var CACHE_NAME = 'home-reader-v1.6.1';
var ASSETS = [
  './',
  'home-reader.html',
  'manifest.json',
  'icon-192.png',
  'icon-512.png',
  'libarchive.js',
  'libarchive-worker.js',
  'libarchive.wasm'
];

self.addEventListener('install', function(e) {
  e.waitUntil(
    caches.open(CACHE_NAME).then(function(cache) {
      return cache.addAll(ASSETS);
    }).then(function() {
      return self.skipWaiting();
    })
  );
});

self.addEventListener('activate', function(e) {
  e.waitUntil(
    caches.keys().then(function(names) {
      return Promise.all(
        names.filter(function(n) { return n !== CACHE_NAME; })
          .map(function(n) { return caches.delete(n); })
      );
    }).then(function() {
      self.clients.matchAll().then(function(clients) {
        clients.forEach(function(client) {
          client.postMessage({ type: 'SW_UPDATED' });
        });
      });
      return self.clients.claim();
    })
  );
});

self.addEventListener('fetch', function(e) {
  e.respondWith(
    caches.match(e.request).then(function(r) {
      return r || fetch(e.request);
    })
  );
});
