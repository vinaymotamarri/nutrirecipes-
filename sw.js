const CACHE_NAME = "nutrirecipes-shell-v1";
const SHELL_FILES = [
  "/",
  "/index.html",
  "/manifest.json",
  "/icon-192.png",
  "/icon-512.png"
];

// On install, cache the basic app shell so it can load even with a flaky connection
self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(SHELL_FILES))
  );
  self.skipWaiting();
});

// Clean up old cache versions when a new service worker takes over
self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(keys.filter((k) => k !== CACHE_NAME).map((k) => caches.delete(k)))
    )
  );
  self.clients.claim();
});

// Only handle requests for the app shell itself (cache-first).
// Everything else (Supabase API calls, external images) goes straight to the network,
// so recipe/food data is always fresh, never served stale from cache.
self.addEventListener("fetch", (event) => {
  const url = new URL(event.request.url);
  const isShellRequest = url.origin === self.location.origin && SHELL_FILES.includes(url.pathname);

  if (isShellRequest) {
    event.respondWith(
      caches.match(event.request).then((cached) => cached || fetch(event.request))
    );
  }
  // else: do nothing special, browser handles it as a normal network request
});
