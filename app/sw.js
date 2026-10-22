/* Offline support for the app.
   scripts/build-site.mjs fills VERSION (a hash of the app files) and FILES (every file of the
   app) when it builds the site: nothing to bump by hand. Not filled (VERSION "dev", when the
   app is served from app/ while working on it), the worker does nothing. */
const VERSION = "dev";
const FILES = ["./"];
const CACHE = `automa-${VERSION}`;

self.addEventListener("install", event => {
  if (VERSION === "dev") return;
  event.waitUntil(caches.open(CACHE).then(cache => cache.addAll(FILES)).then(() => self.skipWaiting()));
});

self.addEventListener("activate", event => {
  event.waitUntil(caches.keys()
    .then(keys => Promise.all(keys.filter(k => k.startsWith("automa-") && k !== CACHE).map(k => caches.delete(k))))
    .then(() => self.clients.claim()));
});

/* Network first, for every file: online, the page and its modules always come from the same
   version; offline, everything comes from the cache, refreshed at each visit. */
self.addEventListener("fetch", event => {
  const req = event.request;
  if (VERSION === "dev") return;
  if (req.method !== "GET" || new URL(req.url).origin !== location.origin) return;
  event.respondWith(fetch(req)
    .then(res => {
      if (res.ok) { const copy = res.clone(); caches.open(CACHE).then(c => c.put(req.mode === "navigate" ? "./" : req, copy)); }
      return res;
    })
    .catch(() => caches.match(req.mode === "navigate" ? "./" : req, { ignoreSearch: true })));
});
