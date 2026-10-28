// pages & scripts: network-first (updates arrive immediately). Images: served from the phone's cache,
// refreshed quietly in the background — so launching never waits on hundreds of image checks.
const C = 'emerald-blood-v107', IMG = 'emerald-blood-img-2', JS = 'emerald-blood-js';
self.addEventListener('install', e => self.skipWaiting());
self.addEventListener('activate', e => e.waitUntil(caches.keys().then(ks => Promise.all(ks.filter(k => k !== C && k !== IMG && k !== JS).map(k => caches.delete(k)))).then(() => clients.claim())));
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
  // versioned scripts (…js?v=N) never change once published: serve them straight from the phone, fetch only the first time
  if (u.search && /\.js$/.test(u.pathname)) {
    e.respondWith(caches.open(JS).then(c => c.match(e.request).then(hit => hit || fetch(e.request).then(r => { if (r.ok) c.put(e.request, r.clone()); return r; }))).catch(() => fetch(e.request)));
    return;
  }
  // the page and data files: network first, but never wait more than 4 seconds — then use the copy on the phone
  const get = () => fetch(e.request.url, { cache: 'no-cache' }).then(r => { if (!r.ok) throw new Error(r.status); return r; });
  const cached = () => caches.match(e.request, { ignoreSearch: true });
  e.respondWith(new Promise(res => {
    let done = false; const fin = r => { if (!done && r) { done = true; res(r); } };
    get().then(r => { const cp = r.clone(); caches.open(C).then(c => c.put(e.request, cp)); fin(r); })
      .catch(() => cached().then(m => fin(m || fetch(e.request))));
    setTimeout(() => cached().then(m => fin(m)), 4000);
  }));
});
