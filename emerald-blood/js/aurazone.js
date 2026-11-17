/* AURA FORCE + THE ZONE visuals (Chat C, 2026-11-17; revised: the Zone is now its own state, js/zone.js).
   AURA FORCE (burst.js stage-1 release): glow outline in their colour + heartbeat ring.
   THE ZONE (a.zone > 0): lightning streaming from the eye, the world dims at the edges.
   (old notes:) Mechanics stay in burst.js (Chat A).
   Lore: an Aura Burst is not a transformation. The body stays the same; what changes is the fighter. Every strong fighter,
   human or Drag, friend or foe, can reach it: the noise drops away, time slows, they move as their strongest self.
   Transcension goes further - the body itself changes (transform.js swaps the sprite).
   Shown on anyone in an Aura Burst (party stage-1 release, or an enemy's EBURST):
     · a pulsing outline of light in their colour, cut from their own silhouette
     · their eyes ignite - a glowing streak that trails behind the head as they move
     · a heartbeat: a ring of light pulses out from their feet
     · THE ZONE: the world dims and slows at the edges (vignette + drifting motes in their colour) while a party member is in it
   Off switch: G.settings.polishOff = { zone: true } */
(function () {
  if (typeof HD === 'undefined' || typeof Battle === 'undefined') return;
  const on = () => !(G.settings && (G.settings.polish === false || (G.settings.polishOff && G.settings.polishOff.zone)));
  const MAIN = () => document.getElementById('game');
  const hex2rgb = (h) => { h = String(h || '#9dffc8').replace('#', ''); if (h.length === 3) h = h.split('').map(c => c + c).join(''); const n = parseInt(h, 16); return [(n >> 16) & 255, (n >> 8) & 255, n & 255]; };
  function zoneOf(a) {
    try {
      if (!a || a.ko) return null;
      if (a.side === 'p' && a.burst > 0 && a.stage1 && typeof BURST !== 'undefined') { const D = BURST[Burst.key(a)]; return D && D.col; }
      if (a.side === 'e' && a.eburst > 0 && typeof EBURST !== 'undefined' && EBURST[a.key]) return EBURST[a.key][2];
    } catch (e) { }
    return null;
  }
  function zoneCol(a) { try { if (!a || a.ko || !(a.zone > 0)) return null; if (a.side === 'p' && typeof BURST !== 'undefined') { const D = BURST[Burst.key(a)]; if (D) return D.col; } if (typeof EBURST !== 'undefined' && EBURST[a.key]) return EBURST[a.key][2]; return a.side === 'e' ? '#ff6a6a' : '#7fd8ff'; } catch (e) { return null; } }
  const TRAIL = new WeakMap(); let cur = null, zcur = null;
  /* where the eye really is, found from the frame itself (cached per frame): glowing Drag-green pixels in the head if there are any,
     otherwise a point just inside the front of the face at eye height */
  const EYE = new WeakMap(), PREV = new WeakMap();
  function eyeOf(img, fr, faces) {
    let m = EYE.get(img); if (!m) EYE.set(img, m = new Map()); const key = fr[0] + ',' + fr[1]; if (m.has(key)) return m.get(key);
    let out = null;
    try {
      const w = fr[2], h = fr[3], cv = document.createElement('canvas'); cv.width = w; cv.height = h; const x = cv.getContext('2d', { willReadFrequently: true });
      x.drawImage(img, fr[0], fr[1], w, h, 0, 0, w, h); const d = x.getImageData(0, 0, w, h).data, A = (px, py) => d[(py * w + px) * 4 + 3];
      let top = -1, bot = -1;
      for (let py = 0; py < h && top < 0; py++) { let n = 0; for (let px = 0; px < w; px++) if (A(px, py) > 60) n++; if (n >= 3) top = py; }
      for (let py = h - 1; py >= 0 && bot < 0; py--) { for (let px = 0; px < w; px++) if (A(px, py) > 60) { bot = py; break; } }
      if (top >= 0 && bot > top) {
        const fh = bot - top, skin = (o) => d[o + 3] > 120 && d[o] > 120 && d[o] > d[o + 1] && d[o + 1] > d[o + 2] && d[o] - d[o + 2] > 30 && d[o] - d[o + 2] < 160;
        // 1) the FACE: the highest band of skin in the top third (a raised sword or hair can't fool it - blades aren't skin)
        let fy0 = -1; const yLim = top + Math.round(fh * .34);
        for (let py = top; py < yLim && fy0 < 0; py++) { let n = 0; for (let px = 0; px < w; px++) if (skin((py * w + px) * 4)) n++; if (n >= 2) fy0 = py; }
        if (fy0 >= 0) {
          const fy1 = Math.min(h - 1, fy0 + Math.round(fh * .09)); let l = w, r = -1;
          for (let py = fy0; py <= fy1; py++) for (let px = 0; px < w; px++) if (skin((py * w + px) * 4)) { if (px < l) l = px; if (px > r) r = px; }
          // 2) a glowing Drag-green eye INSIDE the face box wins
          let sx = 0, sy = 0, n = 0;
          for (let py = fy0; py <= fy1 + 2; py++) for (let px = Math.max(0, l - 2); px <= Math.min(w - 1, r + 2); px++) { const o = (py * w + px) * 4, R = d[o], G = d[o + 1], B = d[o + 2];
            if (d[o + 3] > 120 && G > 160 && G - R > 60 && G - B > 30) { sx += px; sy += py; n++; } }
          if (n >= 1) out = [sx / n, sy / n];
          else { const ey = fy0 + Math.round((fy1 - fy0) * .38), fw = Math.max(2, r - l); out = faces === 'left' ? [l + fw * .22, ey] : [r - fw * .22, ey]; }
        } else {   // no face (monsters): just inside the front of the head at eye height
          const ey = top + Math.round(fh * .09); let l = -1, r = -1; for (let px = 0; px < w; px++) if (A(px, ey) > 60) { if (l < 0) l = px; r = px; }
          if (l >= 0) { const hw = Math.min(r - l, fh * .16); out = faces === 'left' ? [l + hw * .3, ey] : [r - hw * .3, ey]; }
        }
      }
    } catch (e) { }
    m.set(key, out); return out;
  }
  function drawZone(c, o, now) {
    const { a, zc, H, x, feet, hh, S } = o, rgb = hex2rgb(zc), dir = H.faces === 'left' ? -1 : 1;
    let ex = o.ex != null ? o.ex : x + dir * hh * .06, ey = o.ey != null ? o.ey : feet - hh * .86; const u = hh / 100;   // u: 1% of body height
    const P = PREV.get(a); if (P && Math.hypot(P[0] - ex, P[1] - ey) < hh * .35) { ex = P[0] + (ex - P[0]) * .45; ey = P[1] + (ey - P[1]) * .45; } PREV.set(a, [ex, ey]);   // glide, don't jump
    let T = TRAIL.get(a); if (!T) TRAIL.set(a, T = []);
    T.push([ex, ey, now]); while (T.length && now - T[0][2] > 110) T.shift();
    c.save(); c.globalCompositeOperation = 'lighter'; c.lineCap = 'round'; c.lineJoin = 'round';
    // a faint lightning glow over the eye
    const fl = .75 + .25 * Math.sin(now / 45) * Math.sin(now / 17);
    let g = c.createRadialGradient(ex, ey, 0, ex, ey, 7 * u); g.addColorStop(0, `rgba(${rgb},${.42 * fl})`); g.addColorStop(1, `rgba(${rgb},0)`);
    c.fillStyle = g; c.beginPath(); c.arc(ex, ey, 7 * u, 0, 7); c.fill();
    // the streak: SHORT, born at the eye, flicking back and a little up; it bends with the last few moves so it trails when they move
    const L = 13 * u, segs = 5, old = T[0] || [ex, ey], pts = [[ex, ey]];
    for (let i = 1; i <= segs; i++) { const k = i / segs, bx = ex + (old[0] - ex) * k * .8, by = ey + (old[1] - ey) * k * .8;
      pts.push([bx - dir * L * k, by - L * .22 * k + (i < segs ? (Math.random() - .5) * 2.4 * u : 0)]); }
    for (const [wd, al] of [[2.6, .22], [1.3, .6], [.55, 1]]) {
      c.globalAlpha = fl; c.strokeStyle = al === 1 ? 'rgba(255,255,255,.95)' : `rgba(${rgb},${al})`; c.lineWidth = Math.max(.8, wd * u);
      c.beginPath(); pts.forEach((p, i) => i ? c.lineTo(p[0], p[1]) : c.moveTo(p[0], p[1])); c.stroke();
    }
    // now and then a hair-thin fork
    if (Math.random() < .3) { const p = pts[1 + Math.floor(Math.random() * 3)]; c.strokeStyle = `rgba(${rgb},.55)`; c.lineWidth = Math.max(.6, .5 * u);
      c.beginPath(); c.moveTo(p[0], p[1]); c.lineTo(p[0] - dir * 3 * u, p[1] + (Math.random() - .5) * 5 * u); c.stroke(); }
    // the eye itself: a hot white point
    c.globalAlpha = 1; g = c.createRadialGradient(ex, ey, 0, ex, ey, 2.2 * u); g.addColorStop(0, 'rgba(255,255,255,1)'); g.addColorStop(.5, `rgba(${rgb},.9)`); g.addColorStop(1, `rgba(${rgb},0)`);
    c.fillStyle = g; c.beginPath(); c.arc(ex, ey, 2.2 * u, 0, 7); c.fill(); c.restore();
  }
  const LZ = [];

  const _blit = HD.blit.bind(HD);
  HD.blit = function (c, img, fr, x, y, h, extra) {
    _blit(c, img, fr, x, y, h, extra);
    if (zcur && fr && !zcur.done) { try { const k = h / fr[6], e = eyeOf(img, fr, zcur.H.faces); if (e) { zcur.ex = x + (e[0] - fr[4]) * k; zcur.ey = y + (e[1] - fr[5]) * k * (extra && extra.sy || 1); } zcur.done = 1; } catch (e) { } }
    if (!cur || !fr || !window.SPolish) return;
    try {
      const k = h / fr[6], cv = window.SPolish.mask(img, fr[0], fr[1], fr[2], fr[3], 'glow:' + cur.hex), p = cv.__pad || 0, pul = .55 + .45 * Math.sin(performance.now() / 160);
      c.save(); c.globalCompositeOperation = 'lighter'; c.globalAlpha *= .55 + .35 * pul; c.imageSmoothingEnabled = true;
      c.translate(x, y); if (extra && extra.rot) c.rotate(extra.rot); if (extra && extra.sy) c.scale(1, extra.sy);
      c.drawImage(cv, -fr[4] * k - p * k, -fr[5] * k - p * k, cv.width * k, cv.height * k); c.restore();
    } catch (e) { }
  };
  const _bt = HD.bt.bind(HD);
  HD.bt = function (c, img, anim, f, x, y, s) {
    const H = img && img.__hd, B = Battle.B; if (!H || !B || !c || c.canvas !== MAIN() || !on()) return _bt(c, img, anim, f, x, y, s);
    let a = null; for (const q of B.actors) if (Math.abs(q.x - x) < 1.5 && Math.abs(q.y - y) < 1.5) { a = q; break; }
    const col = zoneOf(a), zc = zoneCol(a); if (!col && !zc) return _bt(c, img, anim, f, x, y, s);
    const now = performance.now(), S = s || 1, hh = (HD.BT_H || 80) * S * (a.size || 1), feet = y + 2 * S;
    let r; const zE = zc ? { a, zc, H, x, feet, hh, S } : null; zcur = zE;
    try {
    if (col) {   // AURA FORCE: outline of light + heartbeat
      const rgb = hex2rgb(col), hex = '#' + rgb.map(v => v.toString(16).padStart(2, '0')).join(''), beat = (now % 1200) / 1200;
      c.save(); c.globalCompositeOperation = 'lighter'; c.strokeStyle = `rgba(${rgb},${.55 * (1 - beat)})`; c.lineWidth = 2.5 * S;
      c.beginPath(); c.ellipse(x, feet, hh * (.2 + beat * .45), hh * (.05 + beat * .1), 0, 0, 7); c.stroke(); c.restore();
      // hot, loud, outward: flames licking up off the body
      c.save(); c.globalCompositeOperation = 'lighter';
      for (let i = 0; i < 7; i++) { const k = ((now / 520) + i / 7) % 1, fx = x + Math.sin(i * 2.3 + now / 400) * hh * .22, fy = feet - hh * (.15 + k * .95);
        c.fillStyle = `rgba(${rgb},${.55 * (1 - k)})`; c.beginPath(); c.moveTo(fx, fy - 9 * S * (1 - k)); c.quadraticCurveTo(fx + 4 * S, fy, fx, fy + 6 * S); c.quadraticCurveTo(fx - 4 * S, fy, fx, fy - 9 * S * (1 - k)); c.fill(); }
      c.restore();
      cur = { hex };
      try { r = _bt(c, img, anim, f, x, y, s); } finally { cur = null; }
    } else r = _bt(c, img, anim, f, x, y, s);
    } finally { zcur = null; }
    if (zE) LZ.push(zE);   // drawn later, on top of the drained world (render pass below)
    // TRANSCENSION: the ground itself answers - cracks of their colour under the feet, sparks pulled upward
    if (a && a.side === 'p' && a.burst > 0 && !a.stage1 && typeof BURST !== 'undefined') { try { const tc = hex2rgb(BURST[Burst.key(a)].col);
      c.save(); c.globalCompositeOperation = 'lighter'; c.strokeStyle = `rgba(${tc},.7)`; c.lineWidth = 1.6 * S;
      for (let i = 0; i < 6; i++) { const an = i * 1.05 + 0.3, l1 = hh * (.18 + (i % 3) * .07); c.beginPath(); c.moveTo(x, feet); c.lineTo(x + Math.cos(an) * l1 * .6, feet + Math.sin(an) * l1 * .12); c.lineTo(x + Math.cos(an + .3) * l1, feet + Math.sin(an + .3) * l1 * .2); c.stroke(); }
      for (let i = 0; i < 5; i++) { const k = ((now / 700) + i / 5) % 1; c.fillStyle = `rgba(${tc},${.8 * (1 - k)})`; c.fillRect(x + Math.sin(i * 7.3) * hh * .3, feet - k * hh * 1.1, 2.5 * S, 5 * S); }
      c.restore(); } catch (e) { } }
    return r;
  };
  // THE ZONE: the edges of the world dim while a party member is in it
  const _r = Battle.render.bind(Battle); let motes = [];
  Battle.render = function (c, t) {
    const out = _r(c, t);
    try {
      const B = this.B; if (!B || !on()) return out;
      const now = performance.now(), Q = LZ.splice(0); const z = B.actors.find(a => a.side === 'p' && zoneCol(a));
      if (!z) { motes = []; for (const o of Q) { c.save(); drawZone(c, o, now); c.restore(); } return out; }
      const rgb = hex2rgb(zoneCol(z)), w = G.view.w, h = G.view.h;
      c.save(); const v = c.createRadialGradient(w / 2, h / 2, Math.min(w, h) * .32, w / 2, h / 2, Math.max(w, h) * .7);
      if (!B.cutin) { c.globalCompositeOperation = 'saturation'; c.fillStyle = 'rgba(128,128,128,.55)'; c.fillRect(0, 0, w, h);    // the world loses its colour
        c.globalCompositeOperation = 'color'; c.fillStyle = 'rgba(70,110,150,.12)'; c.fillRect(0, 0, w, h); c.globalCompositeOperation = 'source-over'; }
      v.addColorStop(0, 'rgba(0,0,0,0)'); v.addColorStop(1, 'rgba(4,6,10,.6)'); c.fillStyle = v; c.fillRect(0, 0, w, h);
      if (motes.length < 40) motes.push({ x: Math.random() * w, y: h + 5, v: .2 + Math.random() * .5, r: 1 + Math.random() * 1.8 });
      c.globalCompositeOperation = 'lighter';
      for (const m of motes) { m.y -= m.v; m.x += Math.sin((m.y + m.r * 50) / 30) * .3; if (m.y < -5) { m.y = h + 5; m.x = Math.random() * w; } c.fillStyle = `rgba(${rgb},.35)`; c.fillRect(m.x, m.y, m.r, m.r); }
      c.restore();
      // the lightning burns through the grey
      c.save(); for (const o of Q) drawZone(c, o, now); c.restore();
      // LINKED KAIGEN: a faint thread of light between their hearts, and a spark that runs along it - their rhythm passing back and forth
      const Z = Q.filter(o => o.a.side === 'p');
      if (Z.length >= 2) { c.save(); c.globalCompositeOperation = 'lighter'; c.lineCap = 'round';
        for (let i = 1; i < Z.length; i++) { const A = Z[i - 1], C = Z[i], ax = A.x, ay = A.feet - A.hh * .55, cx2 = C.x, cy2 = C.feet - C.hh * .55, rise = 14 + Math.abs(ax - cx2) * .08;
          const P = k => [ax + (cx2 - ax) * k, ay + (cy2 - ay) * k - Math.sin(k * Math.PI) * rise];
          c.strokeStyle = 'rgba(200,240,255,.16)'; c.lineWidth = 1.4; c.beginPath(); for (let j = 0; j <= 16; j++) { const p = P(j / 16); j ? c.lineTo(p[0], p[1]) : c.moveTo(p[0], p[1]); } c.stroke();
          const t0 = (now / 700 + i * .37) % 2, k = t0 < 1 ? t0 : 2 - t0, p = P(k), g = c.createRadialGradient(p[0], p[1], 0, p[0], p[1], 6);
          g.addColorStop(0, 'rgba(255,255,255,.95)'); g.addColorStop(.4, 'rgba(180,235,255,.6)'); g.addColorStop(1, 'rgba(180,235,255,0)'); c.fillStyle = g; c.beginPath(); c.arc(p[0], p[1], 6, 0, 7); c.fill(); }
        c.restore(); }
    } catch (e) { }
    return out;
  };
})();
