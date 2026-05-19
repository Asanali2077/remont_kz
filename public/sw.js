const CACHE = "remont-v3";
const STATIC = [
  "/",
  "/repair",
  "/manifest.json",
  "/icons/icon.svg",
  "/offline.html",
];

self.addEventListener("install", (e) => {
  e.waitUntil(
    caches.open(CACHE)
      .then((c) => c.addAll(STATIC.filter(url => !url.endsWith(".html") || url === "/offline.html")))
      .then(() => self.skipWaiting())
  );
});

self.addEventListener("activate", (e) => {
  e.waitUntil(
    caches.keys()
      .then((keys) => Promise.all(keys.filter((k) => k !== CACHE).map((k) => caches.delete(k))))
      .then(() => self.clients.claim())
  );
});

self.addEventListener("fetch", (e) => {
  if (e.request.method !== "GET") return;
  const url = new URL(e.request.url);

  // Never cache API routes or auth endpoints
  if (url.pathname.startsWith("/api/")) return;

  // For navigation requests: network-first with offline fallback
  if (e.request.mode === "navigate") {
    e.respondWith(
      fetch(e.request)
        .then((res) => {
          const clone = res.clone();
          caches.open(CACHE).then((c) => c.put(e.request, clone));
          return res;
        })
        .catch(() => caches.match(e.request).then(cached => cached ?? caches.match("/")))
    );
    return;
  }

  // For static assets: cache-first
  e.respondWith(
    caches.match(e.request).then((cached) => {
      const network = fetch(e.request).then((res) => {
        if (res.ok && url.origin === self.location.origin) {
          const clone = res.clone();
          caches.open(CACHE).then((c) => c.put(e.request, clone));
        }
        return res;
      });
      return cached ?? network;
    })
  );
});

// ── Push Notifications ──
self.addEventListener("push", (e) => {
  if (!e.data) return;
  let data = {};
  try { data = e.data.json(); } catch { data = { title: "Remont.kz", body: e.data.text() }; }
  const title = data.title ?? "Remont.kz";
  const options = {
    body: data.body ?? "",
    icon: "/icons/icon.svg",
    badge: "/icons/icon.svg",
    data: { url: data.url ?? "/" },
    vibrate: [200, 100, 200],
  };
  e.waitUntil(self.registration.showNotification(title, options));
});

self.addEventListener("notificationclick", (e) => {
  e.notification.close();
  const url = e.notification.data?.url ?? "/";
  e.waitUntil(
    self.clients.matchAll({ type: "window", includeUncontrolled: true }).then((wcs) => {
      for (const wc of wcs) {
        if (wc.url === url && "focus" in wc) return wc.focus();
      }
      return self.clients.openWindow(url);
    })
  );
});
