// Minimal service worker — its only job is to make the app installable as a PWA.
// It is intentionally network-first with NO offline document caching, so users
// never get served stale SSR HTML. Bump CACHE_VERSION if you ever add caching.
const CACHE_VERSION = "v1"

self.addEventListener("install", () => {
  // Activate immediately instead of waiting for old tabs to close.
  self.skipWaiting()
})

self.addEventListener("activate", (event) => {
  event.waitUntil(
    (async () => {
      // Clean up caches from previous versions.
      const keys = await caches.keys()
      await Promise.all(
        keys.filter((key) => key !== CACHE_VERSION).map((key) => caches.delete(key))
      )
      await self.clients.claim()
    })()
  )
})

// A real fetch handler is what marks the app installable. We only intercept page
// navigations and always go to the network — no offline fallback by design.
self.addEventListener("fetch", (event) => {
  if (event.request.method !== "GET") return
  if (event.request.mode === "navigate") {
    event.respondWith(fetch(event.request))
  }
})
