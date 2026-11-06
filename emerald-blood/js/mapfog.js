'use strict';
/* THE MAP YOU KNOW — the continent is drawn in full, but only what Ren actually knows is uncovered.
   Unknown land lies under old-parchment fog. Places you've walked to, places you've been told about, and the
   legends every child knows clear the fog around them; unknown places hide their pins. The roads you've
   travelled are inked in. */
const MapFog = {
  known(L) {
    const S = G.S, f = S.f || {}, V = S.visited || {};
    if (L.scene && V[L.scene[0]]) return 2;                                  // been there
    if (['aurel', 'cataclysm', 'tomb', 'thornvale', 'veylfields'].includes(L.id)) return 1;   // every Drag child knows these
    if (L.id === 'bellhaven' && (f.seraphineMet || f.seraphineSeenHM)) return 1;
    if (L.id === 'highmark' && f.trial) return 1;
    if (L.king && typeof WORLD !== 'undefined') { const k = WORLD.kings.people.find(p => p.id === L.king); if (k && (!k.need || f[k.need])) return 1; }
    if (L.id === 'realm' && f.vaneDone) return 2;
    if (L.kind === 'dungeon' && L.dungeon && V[L.dungeon]) return 2;
    if ((S.heard || {})[L.id]) return 1;
    return 0;
  },
  ROADS: [['thornvale', 'ashford'], ['ashford', 'woods'], ['ashford', 'mill'], ['ashford', 'highmark'], ['woods', 'realm']],
  draw(cv) {
    const img = cv.previousElementSibling; if (!img) return;
    const W = cv.width = img.naturalWidth || 1600, H = cv.height = img.naturalHeight || 1120, c = cv.getContext('2d');
    // parchment fog with a little texture
    c.fillStyle = '#cbb894'; c.fillRect(0, 0, W, H);
    for (let i = 0; i < 1600; i++) { c.fillStyle = `rgba(${Math.random() < .5 ? '120,96,60' : '240,228,200'},${Math.random() * .06})`; const r = 6 + Math.random() * 40; c.beginPath(); c.arc(Math.random() * W, Math.random() * H, r, 0, 7); c.fill(); }
    c.strokeStyle = 'rgba(110,84,50,.35)'; c.lineWidth = 2;
    for (let i = 0; i < 26; i++) { c.beginPath(); const x = Math.random() * W, y = Math.random() * H; c.arc(x, y, 30 + Math.random() * 60, Math.random() * 3, Math.random() * 3 + 2); c.stroke(); }
    c.fillStyle = 'rgba(90,66,36,.55)'; c.font = 'italic 700 44px Georgia, serif'; c.textAlign = 'center';
    c.fillText('— here be things you have not seen —', W / 2, H * .93);
    // clear the fog where Ren knows the land
    c.globalCompositeOperation = 'destination-out';
    for (const L of MAPLOC) {
      const k = this.known(L); if (!k) continue;
      const big = ['capital', 'city', 'territory', 'landmark', 'home'].includes(L.kind), r = (big ? .13 : .075) * W * (k === 2 ? 1.15 : .9);
      const g = c.createRadialGradient(L.x * W, L.y * H, r * .25, L.x * W, L.y * H, r); g.addColorStop(0, 'rgba(0,0,0,1)'); g.addColorStop(.7, 'rgba(0,0,0,.85)'); g.addColorStop(1, 'rgba(0,0,0,0)');
      c.fillStyle = g; c.fillRect(L.x * W - r, L.y * H - r, r * 2, r * 2);
    }
    c.globalCompositeOperation = 'source-over';
    // roads you have travelled
    const byId = id => MAPLOC.find(l => l.id === id);
    c.setLineDash([14, 10]); c.lineWidth = 5; c.strokeStyle = 'rgba(120,40,20,.8)'; c.lineCap = 'round';
    for (const [a, b] of this.ROADS) { const A = byId(a), B = byId(b); if (!A || !B || this.known(A) < 2 || this.known(B) < 2) continue;
      c.beginPath(); c.moveTo(A.x * W, A.y * H); c.quadraticCurveTo((A.x + B.x) / 2 * W + 18, (A.y + B.y) / 2 * H - 18, B.x * W, B.y * H); c.stroke(); }
    c.setLineDash([]);
  }
};
(function () {
  if (typeof mapMenuHTML !== 'function') return;
  const st = document.createElement('style');
  st.textContent = '.wmap canvas.fog{position:absolute;left:0;top:0;width:100%;height:100%;pointer-events:none}.wmap .pin.unk{display:none}';
  document.head.append(st);
  const _h = mapMenuHTML;
  mapMenuHTML = function () {
    let h = _h();
    h = h.replace(/(<img src="assets\/worldmap\.jpg"[^>]*>)/, '$1<canvas class="fog"></canvas>');
    // hide pins of places Ren doesn't know
    for (const L of MAPLOC) if (!MapFog.known(L)) h = h.replace(new RegExp(`class="pin([^"]*)" data-pin="${L.id}"`), `class="pin unk$1" data-pin="${L.id}"`);
    return h;
  };
  const _b = bindMapMenu;
  bindMapMenu = function () {
    _b();
    const cv = document.querySelector('#menuCard .wmap canvas.fog'); if (!cv) return;
    const img = cv.previousElementSibling, go = () => { try { MapFog.draw(cv); } catch (e) { console.warn(e); } };
    if (img.complete && img.naturalWidth) go(); else img.addEventListener('load', go, { once: true });
  };
})();
