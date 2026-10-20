/* Offline support for the app. Bump VERSION whenever a cached file changes. */
const VERSION = "v0.6-1";
const CACHE = `automa-${VERSION}`;
const FILES = [
  "./", "./index.html", "./manifest.webmanifest",
  "./icons/icon-192.png", "./icons/icon-512.png", "./icons/maskable-512.png", "./icons/apple-touch-icon.png",
  "./fonts/BarlowCondensed-Medium.ttf", "./fonts/BarlowCondensed-SemiBold.ttf", "./fonts/BarlowCondensed-Bold.ttf",
  "./fonts/BarlowCondensed-BoldItalic.ttf", "./fonts/BarlowCondensed-ExtraBoldItalic.ttf",
  "./fonts/SourceSerif4.ttf", "./fonts/SourceSerif4-Italic.ttf",
];

self.addEventListener("install", event => {
  event.waitUntil(caches.open(CACHE).then(cache => cache.addAll(FILES)).then(() => self.skipWaiting()));
});

self.addEventListener("activate", event => {
  event.waitUntil(caches.keys()
    .then(keys => Promise.all(keys.filter(k => k.startsWith("automa-") && k !== CACHE).map(k => caches.delete(k))))
    .then(() => self.clients.claim()));
});

/* The page itself: network first, so a new version shows up as soon as the device is online.
   Everything else (fonts, icons): cache first. */
self.addEventListener("fetch", event => {
  const req = event.request;
  if (req.method !== "GET" || new URL(req.url).origin !== location.origin) return;
  if (req.mode === "navigate") {
    event.respondWith(fetch(req)
      .then(res => { const copy = res.clone(); caches.open(CACHE).then(c => c.put("./index.html", copy)); return res; })
      .catch(() => caches.match("./index.html")));
    return;
  }
  event.respondWith(caches.match(req).then(hit => hit || fetch(req)));
});
