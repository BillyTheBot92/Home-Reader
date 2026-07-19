var CACHE_NAME = 'home-reader-v1.3.0';
var ASSETS = ['home-reader.html', 'manifest.json'];

self.addEventListener('install', function(e) {
  e.waitUntil(caches.open(CACHE_NAME).then(function(c) { return c.addAll(ASSETS); }).then(function() { return self.skipWaiting(); }));
});

self.addEventListener('activate', function(e) {
  e.waitUntil(
    caches.keys().then(function(keys) {
      return Promise.all(keys.filter(function(k) { return k !== CACHE_NAME; }).map(function(k) { return caches.delete(k); }));
    }).then(function() { return self.clients.claim(); }).then(function() { return self.clients.matchAll(); }).then(function(clients) {
      clients.forEach(function(c) { c.postMessage({ type: 'SW_UPDATED', version: CACHE_NAME }); });
    })
  );
});

self.addEventListener('fetch', function(e) {
  if (e.request.url.includes('.html') || e.request.url.endsWith('/')) {
    e.respondWith(fetch(e.request).then(function(r) { var cl = r.clone(); caches.open(CACHE_NAME).then(function(c) { c.put(e.request, cl); }); return r; }).catch(function() { return caches.match(e.request); }));
  } else {
    e.respondWith(caches.match(e.request).then(function(c) { return c || fetch(e.request); }));
  }
});
