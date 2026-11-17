/* AURA BURST = THE ZONE (Chat C, 2026-11-17) - how the trance LOOKS. Mechanics stay in burst.js (Chat A).
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
  const TRAIL = new WeakMap(); let cur = null;
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
    const col = zoneOf(a); if (!col) return _bt(c, img, anim, f, x, y, s);
    const rgb = hex2rgb(col), hex = '#' + rgb.map(v => v.toString(16).padStart(2, '0')).join(''), now = performance.now(), S = s || 1, hh = (HD.BT_H || 80) * S * (a.size || 1), feet = y + 2 * S;
    // heartbeat ring under the feet
    const beat = (now % 1200) / 1200;
    c.save(); c.globalCompositeOperation = 'lighter'; c.strokeStyle = `rgba(${rgb},${.55 * (1 - beat)})`; c.lineWidth = 2.5 * S;
    c.beginPath(); c.ellipse(x, feet, hh * (.2 + beat * .45), hh * (.05 + beat * .1), 0, 0, 7); c.stroke(); c.restore();
    cur = { hex };
    let r; try { r = _bt(c, img, anim, f, x, y, s); } finally { cur = null; }
    // eyes ignite: a streak trailing behind the head
    const dir = H.faces === 'left' ? -1 : 1, ex = x + dir * hh * .07, ey = feet - hh * .8;
    let T = TRAIL.get(a); if (!T) TRAIL.set(a, T = []);
    T.push([ex, ey, now]); while (T.length && now - T[0][2] > 260) T.shift();
    c.save(); c.globalCompositeOperation = 'lighter'; c.lineCap = 'round';
    for (let i = 1; i < T.length; i++) { const k = i / T.length; c.strokeStyle = `rgba(${rgb},${.8 * k})`; c.lineWidth = (1 + 3 * k) * S; c.beginPath(); c.moveTo(T[i - 1][0] - dir * (1 - k) * 10 * S, T[i - 1][1]); c.lineTo(T[i][0], T[i][1]); c.stroke(); }
    const g = c.createRadialGradient(ex, ey, 0, ex, ey, 5 * S); g.addColorStop(0, 'rgba(255,255,255,.95)'); g.addColorStop(.4, `rgba(${rgb},.8)`); g.addColorStop(1, `rgba(${rgb},0)`);
    c.fillStyle = g; c.beginPath(); c.arc(ex, ey, 5 * S, 0, 7); c.fill(); c.restore();
    return r;
  };
  // THE ZONE: the edges of the world dim while a party member is in it
  const _r = Battle.render.bind(Battle); let motes = [];
  Battle.render = function (c, t) {
    const out = _r(c, t);
    try {
      const B = this.B; if (!B || !on()) return out;
      const z = B.actors.find(a => a.side === 'p' && zoneOf(a)); if (!z) { motes = []; return out; }
      const rgb = hex2rgb(zoneOf(z)), w = G.view.w, h = G.view.h;
      c.save(); const v = c.createRadialGradient(w / 2, h / 2, Math.min(w, h) * .32, w / 2, h / 2, Math.max(w, h) * .7);
      v.addColorStop(0, 'rgba(0,0,0,0)'); v.addColorStop(1, 'rgba(4,6,10,.55)'); c.fillStyle = v; c.fillRect(0, 0, w, h);
      if (motes.length < 40) motes.push({ x: Math.random() * w, y: h + 5, v: .2 + Math.random() * .5, r: 1 + Math.random() * 1.8 });
      c.globalCompositeOperation = 'lighter';
      for (const m of motes) { m.y -= m.v; m.x += Math.sin((m.y + m.r * 50) / 30) * .3; if (m.y < -5) { m.y = h + 5; m.x = Math.random() * w; } c.fillStyle = `rgba(${rgb},.35)`; c.fillRect(m.x, m.y, m.r, m.r); }
      c.restore();
    } catch (e) { }
    return out;
  };
})();
