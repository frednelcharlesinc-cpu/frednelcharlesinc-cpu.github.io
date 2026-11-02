'use strict';
/* HD-2D LENS — makes the pixel world look like a lit diorama:
   - tilt-shift depth of field: the top and bottom of the screen soften, the middle (where Ren is) stays sharp
   - colour grade: warm sunlight by day, deep blue by night, soft contrast
   - bloom: every lamp, fire and window light blooms on top of the scene
   - drifting motes: dust and pollen by day, fireflies and embers at night
   - vignette
   It drops its most expensive part (the blur) on its own if a phone can't keep up. Settings → Diorama lens turns it off. */
const Lens = {
  sm: null, band: null, mask: null, mw: 0, mh: 0, slow: 0, noBlur: false, motes: [],
  on() { return !(G.settings && G.settings.noLens); },
  night() { return typeof Ambient !== 'undefined' && Ambient.night ? Ambient.night : 0; },
  build(W, H) {
    this.mw = W; this.mh = H;
    const s = 6, w = Math.max(2, W / s | 0), h = Math.max(2, H / s | 0);
    this.sm = document.createElement('canvas'); this.sm.width = w; this.sm.height = h;
    this.band = document.createElement('canvas'); this.band.width = W / 2 | 0; this.band.height = H / 2 | 0;
    this.mask = document.createElement('canvas'); this.mask.width = 1; this.mask.height = H / 2 | 0;
    const m = this.mask.getContext('2d'), g = m.createLinearGradient(0, 0, 0, this.mask.height);
    g.addColorStop(0, 'rgba(0,0,0,1)'); g.addColorStop(.26, 'rgba(0,0,0,0)'); g.addColorStop(.74, 'rgba(0,0,0,0)'); g.addColorStop(1, 'rgba(0,0,0,1)');
    m.fillStyle = g; m.fillRect(0, 0, 1, this.mask.height);
  },
  post(c, t, dt) {
    const cv = c.canvas, W = cv.width, H = cv.height;
    if (W !== this.mw || H !== this.mh) this.build(W, H);
    const n = this.night();
    c.save(); c.setTransform(1, 0, 0, 1, 0, 0);
    // 1) tilt-shift blur
    if (!this.noBlur) {
      const s = this.sm.getContext('2d'), b = this.band.getContext('2d');
      s.imageSmoothingEnabled = true; s.drawImage(cv, 0, 0, this.sm.width, this.sm.height);
      b.globalCompositeOperation = 'copy'; b.imageSmoothingEnabled = true; b.drawImage(this.sm, 0, 0, this.band.width, this.band.height);
      b.globalCompositeOperation = 'destination-in'; b.drawImage(this.mask, 0, 0, this.band.width, this.band.height);
      c.imageSmoothingEnabled = true; c.drawImage(this.band, 0, 0, W, H); c.imageSmoothingEnabled = false;
    }
    // 2) grade
    c.globalCompositeOperation = 'soft-light';
    c.fillStyle = n > .5 ? 'rgba(40,70,140,.35)' : 'rgba(255,196,120,.32)'; c.fillRect(0, 0, W, H);
    c.globalCompositeOperation = 'source-over';
    // 3) bloom on every light
    const L = World.lights || [], sc = G.view.scale, cx = World.cam.x, cy = World.cam.y;
    c.globalCompositeOperation = 'lighter';
    for (const l of L) {
      const x = (l.x - cx) * sc, y = (l.y - cy) * sc, r = (l.r || 60) * sc * (n > .3 ? 1.1 : .7);
      if (x < -r || y < -r || x > W + r || y > H + r) continue;
      const fl = .85 + .15 * Math.sin(t / 140 + l.x);
      const g = c.createRadialGradient(x, y, 0, x, y, r); g.addColorStop(0, `rgba(${l.c || '255,170,80'},${(.22 + n * .18) * fl})`); g.addColorStop(1, `rgba(${l.c || '255,170,80'},0)`);
      c.fillStyle = g; c.fillRect(x - r, y - r, r * 2, r * 2);
    }
    // 4) motes
    const want = 26;
    while (this.motes.length < want) this.motes.push({ x: Math.random() * W, y: Math.random() * H, vx: rnd(-.012, .012), vy: rnd(-.018, -.004), p: Math.random() * 7, s: rnd(.6, 1.6) });
    for (const m of this.motes) {
      m.x += m.vx * dt * W / 900; m.y += m.vy * dt * H / 900; if (m.y < -10) { m.y = H + 10; m.x = Math.random() * W; } if (m.x < -10) m.x = W + 10; if (m.x > W + 10) m.x = -10;
      const a = (.25 + .25 * Math.sin(t / 600 + m.p)) * (n > .5 ? 1.6 : 1), r = m.s * sc * (n > .5 ? 1.4 : 1);
      c.fillStyle = n > .5 ? `rgba(190,255,150,${a})` : `rgba(255,236,180,${a})`; c.beginPath(); c.arc(m.x, m.y, r, 0, 7); c.fill();
    }
    c.globalCompositeOperation = 'source-over';
    // 5) vignette
    const v = c.createRadialGradient(W / 2, H * .55, Math.min(W, H) * .35, W / 2, H * .55, Math.max(W, H) * .75);
    v.addColorStop(0, 'rgba(0,0,0,0)'); v.addColorStop(1, `rgba(10,6,2,${.45 + n * .15})`); c.fillStyle = v; c.fillRect(0, 0, W, H);
    c.restore();
    // a phone that can't keep up loses the blur first
    if (dt > 40) { if (++this.slow > 240) this.noBlur = true; } else this.slow = Math.max(0, this.slow - 1);
  }
};
(function () {
  if (typeof World === 'undefined') return;
  const _r = World.render.bind(World);
  let last = 0;
  World.render = function (c, t) {
    _r(c, t);
    const dt = Math.min(60, t - (last || t)); last = t;
    if (!Lens.on() || !this.map || this.loading || (G.S && G.S.kid && false)) return;
    try { Lens.post(c, t, dt); } catch (e) { console.warn(e); G.settings.noLens = true; }
  };
  // a Settings switch
  if (typeof UI !== 'undefined' && UI.settingsExtra === undefined) UI.settingsExtra = [];
})();
