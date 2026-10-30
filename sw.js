// Offline support: the app shell and courses are cached on install.
const CACHE = "mor-v12";
const SHELL = ["./", "index.html", "app.js", "manifest.webmanifest", "courses/index.json", "courses/punjabi.json",
  "icons/icon.svg", "icons/icon-192.png", "icons/icon-512.png", "icons/icon-180.png"];

self.addEventListener("install", e => {
  e.waitUntil(caches.open(CACHE).then(c => c.addAll(SHELL.map(u => new Request(u, { cache:"reload" })))).then(() => self.skipWaiting()));
});
self.addEventListener("activate", e => {
  e.waitUntil(caches.keys().then(keys => Promise.all(keys.filter(k => k !== CACHE).map(k => caches.delete(k)))).then(() => self.clients.claim()));
});
// Network first so updates show up straight away; the cache keeps it working offline.
self.addEventListener("fetch", e => {
  if (e.request.method !== "GET") return;
  e.respondWith(caches.open(CACHE).then(cache =>
    fetch(e.request, { cache:"no-cache" }).then(res => {
      if (res && (res.ok || res.type === "opaque")) cache.put(e.request, res.clone());
      return res;
    }).catch(() => cache.match(e.request, { ignoreSearch:true }).then(hit => hit || cache.match("index.html")))
  ));
});
