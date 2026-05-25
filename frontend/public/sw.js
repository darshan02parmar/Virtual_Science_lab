const CACHE_NAME = "vsl-app-cache-v1";
const STATIC_ASSETS = [
  "/",
  "/index.html",
  "/icon.svg",
  "/manifest.json"
];

// Install Phase: Pre-cache standard shell assets
self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(STATIC_ASSETS);
    }).then(() => self.skipWaiting())
  );
});

// Activate Phase: Clean up stale legacy caches
self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((name) => {
          if (name !== CACHE_NAME) {
            return caches.delete(name);
          }
        })
      );
    }).then(() => self.clients.claim())
  );
});

// Fetch Phase: Request interception
self.addEventListener("fetch", (event) => {
  const { request } = event;
  const url = new URL(request.url);

  // 1. Bypass Service Worker cache for dynamic mutating endpoints (POST, PUT, DELETE)
  if (request.method !== "GET") {
    return;
  }

  // 2. Network-First Strategy for static API requests (e.g. experiment lists)
  // Tries the network first, then caches the successful result, and falls back to cache if offline.
  if (url.pathname.includes("/api/")) {
    event.respondWith(
      fetch(request)
        .then((networkResponse) => {
          if (networkResponse.status === 200) {
            const responseClone = networkResponse.clone();
            caches.open(CACHE_NAME).then((cache) => {
              cache.put(request, responseClone);
            });
          }
          return networkResponse;
        })
        .catch(() => {
          return caches.match(request).then((cachedResponse) => {
            if (cachedResponse) return cachedResponse;
            // Always return a valid JSON response to avoid 'Failed to convert value to Response' error in respondWith
            return new Response(
              JSON.stringify({ error: "Offline mode. Cached data not found.", offline: true }),
              {
                status: 503,
                statusText: "Offline",
                headers: { "Content-Type": "application/json" }
              }
            );
          });
        })
    );
    return;
  }

  // 3. Stale-While-Revalidate Strategy for local frontend assets (scripts, styles, HTML)
  // Provides instant app shell loads offline and seamlessly fetches updates in the background.
  const isLocalAsset = url.origin === self.location.origin;
  if (isLocalAsset) {
    event.respondWith(
      caches.match(request).then((cachedResponse) => {
        const fetchPromise = fetch(request)
          .then((networkResponse) => {
            if (networkResponse.status === 200) {
              const responseClone = networkResponse.clone();
              caches.open(CACHE_NAME).then((cache) => {
                cache.put(request, responseClone);
              });
            }
            return networkResponse;
          })
          .catch(() => {
            if (cachedResponse) return cachedResponse;
            // Return safe fallback response if offline and asset not in cache
            return new Response("Offline Mode. Asset not cached.", {
              status: 503,
              statusText: "Offline"
            });
          });

        return cachedResponse || fetchPromise;
      })
    );
  }
});
