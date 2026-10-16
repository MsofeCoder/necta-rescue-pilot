'use strict';
/* Bump this generation whenever any bundled file changes. */
const CACHE = 'necta-rescue-static-v8';
const ASSETS = ['./','./index.html','./paper-practice.html','./paper-practice.js','./learning.css','./learning-core.js','./learning.js','./civics-content.js','./manifest.webmanifest','./icon.svg','./icon-192.png','./icon-512.png'];
const ALLOWED = new Set(ASSETS.map(asset => new URL(asset, self.registration.scope).pathname));
self.addEventListener('install', event => event.waitUntil(
  caches.open(CACHE).then(cache => cache.addAll(ASSETS)).then(() => self.skipWaiting())
));
self.addEventListener('activate', event => event.waitUntil(
  caches.keys().then(keys => Promise.all(keys.filter(k => k.startsWith('necta-rescue-static-') && k !== CACHE).map(k => caches.delete(k))))
    .then(() => self.clients.claim())
));
self.addEventListener('message', event => {
  if (event.data && event.data.type === 'offline-ready' && event.ports[0]) {
    event.ports[0].postMessage({type:'offline-ready', cache:CACHE});
  }
});
self.addEventListener('fetch', event => {
  const request = event.request, url = new URL(request.url);
  if (request.method !== 'GET' || url.origin !== self.location.origin || !ALLOWED.has(url.pathname)) return;
  // Only the explicit public bundle is cached. Unknown/private paths get no shell fallback.
  const key = new URL(url.pathname, url.origin).href;
  // One complete version loads instantly, including on slow or unreliable networks.
  // The browser checks sw.js separately; activation atomically selects a new bundle.
  event.respondWith(caches.open(CACHE).then(cache => cache.match(key)).then(cached => cached || fetch(request)));
});
