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
  const TRAIL = new WeakMap(); let cur = null;
  function drawZone(c, o, now) {
    const { a, zc, H, x, feet, hh, S } = o, rgb = hex2rgb(zc), dir = H.faces === 'left' ? -1 : 1, ex = x + dir * hh * .07, ey = feet - hh * .8;
    let T = TRAIL.get(a); if (!T) TRAIL.set(a, T = []);
    T.push([ex, ey, now]); while (T.length && now - T[0][2] > 320) T.shift();
    c.save(); c.globalCompositeOperation = 'lighter'; c.lineCap = 'round'; c.lineJoin = 'round';
    // the streak: a jagged bolt flowing back from the eye, re-drawn every frame so it crackles
    const L = hh * .55, segs = 9, pts = [[ex, ey]];
    for (let i = 1; i <= segs; i++) { const k = i / segs, back = T[Math.max(0, T.length - 1 - Math.round(k * (T.length - 1)))] || [ex, ey];
      pts.push([back[0] - dir * L * k + (Math.random() - .5) * 5 * S * k, back[1] - hh * .05 * k + (Math.random() - .5) * 6 * S * k]); }
    for (const [w, al] of [[7, .18], [3.2, .55], [1.2, 1]]) {
      c.strokeStyle = al === 1 ? 'rgba(255,255,255,.95)' : `rgba(${rgb},${al})`; c.lineWidth = w * S;
      c.beginPath(); pts.forEach((p, i) => { const fade = 1 - i / pts.length; i ? c.lineTo(p[0], p[1]) : c.moveTo(p[0], p[1]); }); c.stroke();
    }
    if (Math.random() < .5) { const p = pts[2 + Math.floor(Math.random() * 5)]; c.strokeStyle = `rgba(${rgb},.7)`; c.lineWidth = 1.2 * S; c.beginPath(); c.moveTo(p[0], p[1]); c.lineTo(p[0] - dir * 8 * S, p[1] + (Math.random() - .5) * 14 * S); c.lineTo(p[0] - dir * 14 * S, p[1] + (Math.random() - .5) * 10 * S); c.stroke(); }
    const g = c.createRadialGradient(ex, ey, 0, ex, ey, 6 * S); g.addColorStop(0, 'rgba(255,255,255,1)'); g.addColorStop(.35, `rgba(${rgb},.9)`); g.addColorStop(1, `rgba(${rgb},0)`);
    c.fillStyle = g; c.beginPath(); c.arc(ex, ey, 6 * S, 0, 7); c.fill(); c.restore();
  }
  const LZ = [];

  const _blit = HD.blit.bind(HD);
  HD.blit = function (c, img, fr, x, y, h, extra) {
    _blit(c, img, fr, x, y, h, extra);
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
    let r;
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
    if (zc) LZ.push({ a, zc, H, x, feet, hh, S });   // drawn later, on top of the drained world (render pass below)
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
      // LINKED KAIGEN: a crackling tether between two fighters in it together
      const Z = B.actors.filter(a => a.side === 'p' && zoneCol(a));
      if (Z.length >= 2) { c.save(); c.globalCompositeOperation = 'lighter'; c.lineCap = 'round';
        for (let i = 1; i < Z.length; i++) { const A = Z[i - 1], C = Z[i], x0 = A.x, y0 = A.y - 40, x1 = C.x, y1 = C.y - 40, n = 10;
          for (const [wd, al] of [[6, .2], [2.4, .6], [1, 1]]) { c.strokeStyle = al === 1 ? 'rgba(255,255,255,.9)' : `rgba(160,225,255,${al})`; c.lineWidth = wd; c.beginPath(); c.moveTo(x0, y0);
            for (let j = 1; j < n; j++) { const k = j / n; c.lineTo(x0 + (x1 - x0) * k + (Math.random() - .5) * 8, y0 + (y1 - y0) * k + (Math.random() - .5) * 8 - Math.sin(k * Math.PI) * 18); } c.lineTo(x1, y1); c.stroke(); } }
        c.restore(); }
    } catch (e) { }
    return out;
  };
})();
