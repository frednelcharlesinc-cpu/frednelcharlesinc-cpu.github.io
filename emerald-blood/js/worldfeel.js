/* ================= THE WORLD FEELS REAL =================
   · soft contact shadows that lean away from the sun (and pool straight down at night)
   · reflections: anyone standing at the water's edge shows upside-down in it, rippling
   · weather matters: rain halves Suspicion gains and makes ambushes on you rarer; fog trims Suspicion
     and lets you spot enemies first more often. */
const WorldFeel = {
  key: null, water: null, W: 0,
  // tiles whose painted colour is water (sampled once per map from the map picture)
  build() {
    const im = World.mapImg, M = World.map; if (!im || !M || !im.width) return;
    const key = (World.scene && World.scene.id) || G.S.map; if (this.key === key) return; this.key = key; this.water = null;
    try {
      const w = M.w || M.col[0].length, h = M.h || M.col.length, cv = document.createElement('canvas'); cv.width = w; cv.height = h;
      const x = cv.getContext('2d'); x.imageSmoothingEnabled = true; x.imageSmoothingQuality = 'high'; x.drawImage(im, 0, 0, w, h);
      const d = x.getImageData(0, 0, w, h).data, wat = new Uint8Array(w * h);
      for (let i = 0; i < w * h; i++) { const r = d[i * 4], g = d[i * 4 + 1], b = d[i * 4 + 2]; if (b > 110 && b > r + 30 && b > g - 10 && !(g > 170 && r > 150)) wat[i] = 1; }
      this.water = wat; this.W = w;
    } catch (e) { this.water = null; }
  },
  isWater(x, y) { return !!(this.water && x >= 0 && y >= 0 && x < this.W && this.water[y * this.W + x]); },
  wet(e) { try { this.build(); return this.isWater(e.x, e.y + 1) && !this.isWater(e.x, e.y); } catch (er) { return false; } },
  sun() { const m = ((G.S && G.S.clock) || 720) % 1440; const day = m >= 360 && m <= 1140; return { day, dx: day ? (m - 750) / 390 * 6 : 0 }; },
  shadow(c, x, y) {
    const s = this.sun(), ox = -s.dx, r = 13;
    c.save(); c.translate(x + ox, y - 1); c.scale(1 + Math.abs(s.dx) * .05, .34);
    const g = c.createRadialGradient(0, 0, 1, 0, 0, r * 1.3); g.addColorStop(0, `rgba(0,0,0,${s.day ? .34 : .26})`); g.addColorStop(.6, 'rgba(0,0,0,.16)'); g.addColorStop(1, 'rgba(0,0,0,0)');
    c.fillStyle = g; c.beginPath(); c.arc(0, 0, r * 1.3, 0, 7); c.fill(); c.restore();
  },
  reflect(c, img, fr, k, x, y, flip, t, al) {
    c.save(); c.globalAlpha = .26 * (al == null ? 1 : al);
    const top = y + 4; c.beginPath(); c.rect(x - 40, top, 80, fr[3] * k); c.clip();
    c.translate(x + Math.sin(t / 260) * 1.2, top); if (flip) c.scale(-1, 1); c.scale(1 + Math.sin(t / 340) * .03, -.82);
    c.drawImage(img, fr[0], fr[1], fr[2], fr[3], -fr[4] * k, -fr[5] * k, fr[2] * k, fr[3] * k);
    c.restore();
    c.save(); c.globalAlpha = .18; c.strokeStyle = '#dff6ff'; c.lineWidth = 1; for (let i = 0; i < 2; i++) { const yy = top + 10 + i * 9 + Math.sin(t / 300 + i) * 1.5; c.beginPath(); c.moveTo(x - 9 + i * 3, yy); c.lineTo(x + 9 - i * 3, yy); c.stroke(); } c.restore();
  },
  propShadow(c, x, y, r) {
    const s = this.sun(); c.save(); c.translate(x - s.dx * 1.5, y - 2); c.scale(1, .32);
    const g = c.createRadialGradient(0, 0, 1, 0, 0, r); g.addColorStop(0, `rgba(0,0,0,${s.day ? .32 : .22})`); g.addColorStop(.65, 'rgba(0,0,0,.14)'); g.addColorStop(1, 'rgba(0,0,0,0)');
    c.fillStyle = g; c.beginPath(); c.arc(0, 0, r, 0, 7); c.fill(); c.restore();
  },
  weather() { try { return typeof Ambient !== 'undefined' && Ambient.outdoors && Ambient.outdoors() ? Ambient.weather : 'clear'; } catch (e) { return 'clear'; } }
};
(function () {
  const _s = Story.addSus.bind(Story);
  Story.addSus = function (n, quiet) { const w = WorldFeel.weather(); if (n > 0 && G.mode === 'world') n *= w === 'rain' ? .5 : w === 'fog' ? .75 : 1; return _s(n, quiet); };
  const _st = Battle.start.bind(Battle);
  Battle.start = function (cfg) {
    try { const w = WorldFeel.weather(); if (cfg && cfg.ambushRoll && !cfg.ambush && !cfg.noFlee && w === 'fog' && Math.random() < .3) cfg.ambush = 1; } catch (e) { }
    return _st.apply(this, arguments);
  };
  const _os = World.onStep.bind(World);
  World.onStep = function (e) {
    const s = this.scene, w = WorldFeel.weather(); if (!s || w !== 'rain' || !e || !e.isPlayer) return _os(e);
    const had = Object.prototype.hasOwnProperty.call(s, 'encRate'), old = s.encRate; s.encRate = (old ?? .11) * .7;
    try { return _os(e); } finally { if (had) s.encRate = old; else delete s.encRate; }
  };
})();
/* ---------- grass that reacts: tall grass sways as you pass, and kicks up leaves when you run ---------- */
(function () {
  const bent = new Map();   // "x,y" -> time bent
  const bits = [];
  const _os = World.onStep.bind(World);
  World.onStep = function (e) {
    try {
      if (e && (e.isPlayer || e.follower) && this.grass && this.grass.has(e.x + ',' + e.y)) {
        bent.set(e.x + ',' + e.y, performance.now());
        const run = e.move && e.move.ms < 160, n = run ? 6 : 2;
        for (let i = 0; i < n; i++) bits.push({ x: e.x * 32 + 16 + rnd(-8, 8), y: e.y * 32 + 22, vx: rnd(-.6, .6), vy: rnd(-1.6, -.6), t0: performance.now(), life: rnd(450, 800), c: Math.random() < .5 ? '#5aa63a' : '#8acd4a' });
        if (typeof sfx === 'function' && Math.random() < .5) try { sfx('step'); } catch (er) { }
      }
    } catch (er) { }
    return _os(e);
  };
  const _r = World.render.bind(World);
  World.render = function (c, t) {
    const out = _r(c, t);
    try {
      if (!this.map || this.loading || G.mode !== 'world') return out;
      const cx = Math.round(this.cam.x), cy = Math.round(this.cam.y), now = performance.now();
      // the blades over the bent tile: a little tuft that leans and springs back
      for (const [k, t0] of bent) {
        const a = (now - t0) / 700; if (a > 1) { bent.delete(k); continue; }
        const [x, y] = k.split(',').map(Number), px = x * 32 + 16 - cx, py = y * 32 + 30 - cy, lean = Math.sin(a * Math.PI * 3) * (1 - a) * 5;
        c.save(); c.strokeStyle = 'rgba(70,140,45,.85)'; c.lineWidth = 2; c.lineCap = 'round';
        for (const o of [-9, -4, 2, 7, 11]) { c.beginPath(); c.moveTo(px + o, py); c.quadraticCurveTo(px + o + lean * .5, py - 6, px + o + lean, py - 11); c.stroke(); }
        c.restore();
      }
      for (let i = bits.length - 1; i >= 0; i--) {
        const b = bits[i], k = (now - b.t0) / b.life; if (k > 1) { bits.splice(i, 1); continue; }
        b.x += b.vx; b.y += b.vy; b.vy += .06;
        c.globalAlpha = 1 - k; c.fillStyle = b.c; c.fillRect(b.x - cx, b.y - cy, 2, 2); c.globalAlpha = 1;
      }
    } catch (er) { }
    return out;
  };
})();
