/* SPRITE POLISH (Chat C, 2026-11-16) - the finish that makes the sheets look alive, with no new art.
   Battle (every HD fighter, heroes and monsters):
     1 RIM LIGHT  - a thin warm edge of light on the side that faces the sky, cut from each frame's own outline (cached per frame).
     2 HIT FLASH  - the first instant of a hurt frame flashes white, and the body squashes on impact.
     3 WIND-UP    - every attack starts with a small crouch (anticipation) and snaps into a stretch as it lands.
   World:
     4 FOOTSTEP DUST - walking NPCs and monsters kick up small puffs (fliers don't).
   Turn it all off with  G.settings.polish = false  (or per part: rim / flash / squash / dust = false). */
(function () {
  if (typeof HD === 'undefined') return;
  const on = (k) => !(G.settings && (G.settings.polish === false || (G.settings.polishOff && G.settings.polishOff[k])));

  /* ---------- cached masks cut from a frame ---------- */
  const CACHE = new WeakMap();
  function mask(img, fr, kind) {
    let m = CACHE.get(img); if (!m) { m = new Map(); CACHE.set(img, m); }
    const key = kind + fr[0] + ',' + fr[1] + ',' + fr[2] + ',' + fr[3]; let cv = m.get(key); if (cv) return cv;
    if (m.size > 900) m.clear();
    const w = fr[2], h = fr[3]; cv = document.createElement('canvas'); cv.width = w; cv.height = h; const x = cv.getContext('2d');
    x.drawImage(img, fr[0], fr[1], w, h, 0, 0, w, h);
    if (kind === 'rim') {
      // keep only the pixels whose neighbour toward the light (up and a little behind) is empty
      const d = Math.max(2, Math.round(h / 95));
      x.globalCompositeOperation = 'destination-out'; x.drawImage(img, fr[0], fr[1], w, h, Math.round(d * .6), d, w, h);
      // move that edge one outline-width inward, so the dark outline stays dark and the light sits on the surface just inside it
      const e = document.createElement('canvas'); e.width = w; e.height = h; const y = e.getContext('2d'), o = Math.round(d * .6);
      y.drawImage(cv, o, o); y.globalCompositeOperation = 'destination-in'; y.drawImage(img, fr[0], fr[1], w, h, 0, 0, w, h);
      y.globalCompositeOperation = 'destination-out'; y.drawImage(cv, 0, 0);
      y.globalCompositeOperation = 'source-in'; y.fillStyle = '#ffd38a'; y.fillRect(0, 0, w, h); cv = e;
    } else { x.globalCompositeOperation = 'source-in'; x.fillStyle = '#ffffff'; x.fillRect(0, 0, w, h); }
    m.set(key, cv); return cv;
  }

  /* ---------- per-fighter timing (which anim, since when) ---------- */
  const ST = new Map();
  const ATK = /slash|thrust|spellcast|attack|strike|draw|art_|combo|fourdraw|heavy|special/;
  let cur = null;   // the fighter being drawn right now, for blit

  const _blit = HD.blit.bind(HD);
  HD.blit = function (c, img, fr, x, y, h, extra) {
    _blit(c, img, fr, x, y, h, extra);
    if (!cur || !fr || !c) return;
    const k = h / fr[6], dx = -fr[4] * k, dy = -fr[5] * k, dw = fr[2] * k, dh = fr[3] * k;
    const draw = (cv, a, op) => {
      c.save(); c.globalAlpha *= a; if (op) c.globalCompositeOperation = op; c.imageSmoothingEnabled = true;
      c.translate(x, y); if (extra && extra.rot) c.rotate(extra.rot); if (extra && extra.sy) c.scale(1, extra.sy);
      c.drawImage(cv, dx, dy, dw, dh); c.restore();
    };
    try {
      if (on('rim') && cur.rim) draw(mask(img, fr, 'rim'), cur.rim, 'lighter');
      if (on('flash') && cur.flash > 0) draw(mask(img, fr, 'white'), cur.flash);
    } catch (e) { }
  };

  const _bt = HD.bt.bind(HD);
  HD.bt = function (c, img, anim, f, x, y, s) {
    const H = img && img.__hd; if (!H) return _bt(c, img, anim, f, x, y, s);
    const now = performance.now(), id = (H.set || '?') + '|' + Math.round(y / 4) + (H.me ? '|me' : '');
    let st = ST.get(id); if (!st) { st = { anim: null, t0: now }; ST.set(id, st); }
    if (st.anim !== anim) { st.anim = anim; st.t0 = now; }
    const age = now - st.t0;
    let sx = 1, sy = 1;
    if (on('squash')) {
      if (anim === 'hurt' && age < 220) { const q = 1 - age / 220; sx = 1 + .08 * q; sy = 1 - .07 * q; }
      else if (ATK.test(anim) && age < 300) {
        if (age < 80) { const q = age / 80; sx = 1 + .05 * q; sy = 1 - .05 * q; }            // wind-up crouch
        else if (age < 170) { const q = (age - 80) / 90; sx = 1.05 - .08 * q; sy = .95 + .09 * q; }   // snap into the strike
        else { const q = (age - 170) / 130; sx = .97 + .03 * q; sy = 1.04 - .04 * q; }          // settle
      }
    }
    cur = { rim: H.single ? 0 : .3, flash: anim === 'hurt' && age < 130 ? .85 * (1 - age / 130) : 0 };
    const feet = y + 2 * (s || 1);
    try {
      if (sx !== 1 || sy !== 1) { c.save(); c.translate(x, feet); c.scale(sx, sy); c.translate(-x, -feet); _bt(c, img, anim, f, x, y, s); c.restore(); }
      else _bt(c, img, anim, f, x, y, s);
    } finally { cur = null; }
  };
  setInterval(() => { const t = performance.now(); for (const [k, v] of ST) if (t - v.t0 > 60000) ST.delete(k); }, 30000);

  /* ---------- world: footstep dust ---------- */
  if (typeof Ent === 'undefined') return;
  const PUFFS = []; let FR = 0; (function tick() { FR++; requestAnimationFrame(tick); })();
  const _draw = Ent.prototype.draw;
  Ent.prototype.draw = function (c, cx, cy, t) {
    try {
      if (on('dust') && !this.isPlayer && this.move && HD.on && HD.on()) {
        const set = HD.setOf && HD.setOf(HD.npcName(this)), fly = set && window.MonWalk && window.MonWalk.kind(set) === 'fly';
        if (!fly) {
          const now = performance.now(), gap = this.move.ms < 260 ? 170 : 260;
          if (!this._dust || now - this._dust > gap) { this._dust = now; PUFFS.push({ x: this.px + (Math.random() - .5) * 6, y: this.py + 2, t: now, s: (this.size || 1) * (set && window.MonWalk.kind(set) === 'quad' ? 1.3 : 1) }); if (PUFFS.length > 80) PUFFS.shift(); }
        }
      }
      if (PUFFS.length) {
        const now = performance.now();
        for (let i = PUFFS.length - 1; i >= 0; i--) {
          const p = PUFFS[i], a = (now - p.t) / 420; if (a >= 1) { PUFFS.splice(i, 1); continue; }
          if (Math.abs(p.x - this.px) > 40 || Math.abs(p.y - this.py) > 40) continue;   // each walker draws the puffs near it, under its own sprite
          if (p.drawn === FR) continue; p.drawn = FR;
          c.fillStyle = `rgba(196,178,140,${.28 * (1 - a)})`; c.beginPath();
          c.ellipse(p.x - cx, p.y - cy + 2 - a * 3, (2 + a * 5) * p.s, (1.2 + a * 2.2) * p.s, 0, 0, 7); c.fill();
        }
      }
    } catch (e) { }
    return _draw.call(this, c, cx, cy, t);
  };
})();
