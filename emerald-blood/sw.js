// pages & scripts: network-first (updates arrive immediately). Images: served from the phone's cache,
// refreshed quietly in the background — so launching never waits on hundreds of image checks.
const C = 'emerald-blood-v73', IMG = 'emerald-blood-img-2';
self.addEventListener('install', e => self.skipWaiting());
self.addEventListener('activate', e => e.waitUntil(caches.keys().then(ks => Promise.all(ks.filter(k => k !== C && k !== IMG).map(k => caches.delete(k)))).then(() => clients.claim())));
self.addEventListener('fetch', e => {
  const u = new URL(e.request.url);
  if (e.request.method !== 'GET' || u.origin !== location.origin) return;
  if (/\.(png|webp|jpg)$/.test(u.pathname)) {
    const work = caches.open(IMG).then(c => c.match(e.request).then(hit => {
      const net = () => fetch(e.request).then(r => { if (r.ok) c.put(e.request, r.clone()).catch(() => {}); return r; });
      if (!hit) return net();
      if (!u.search) net().catch(() => {}); // unversioned images refresh quietly for next time; versioned (?v=) art never changes
      return hit;
    })).catch(() => fetch(e.request));
    e.respondWith(work);
    return;
  }
  e.respondWith(fetch(e.request.url, { cache: 'no-cache' }).then(r => { const cp = r.clone(); caches.open(C).then(c => c.put(e.request, cp)); return r; })
    .catch(() => caches.match(e.request)));
});
