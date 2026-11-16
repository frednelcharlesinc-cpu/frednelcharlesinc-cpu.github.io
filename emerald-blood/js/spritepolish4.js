/* SPRITE POLISH IV (Chat C, 2026-11-16)
   · FINISHER CAMERA: the blow that ends a battle plays in slow motion, the camera pushes in on the last enemy, and the winner's colour washes the screen.
   · STATUS ICONS ON THE BODY: small animated icons bob over a fighter's head - poison (green skull), bleed (red drop), burn (flame),
     blind (crossed eye), shield (blue shield), broken guard (circling stars).
   · RANK-UP GLOW: when Ren's rank goes up, a pillar of green light and rising sparks burst off his world sprite.
   Off switch: G.settings.polish = false (or polishOff: { finisher, icons, rankup }). */
(function () {
  if (typeof HD === 'undefined') return;
  const on = (k) => !(G.settings && (G.settings.polish === false || (G.settings.polishOff && G.settings.polishOff[k])));
  const MAIN = () => document.getElementById('game');

  /* ---------- icons ---------- */
  function icon(c, k, x, y, r, t) {
    c.save(); c.translate(x, y); c.lineJoin = 'round';
    const ol = (f) => { c.strokeStyle = 'rgba(10,8,12,.85)'; c.lineWidth = r * .35; f(); c.stroke(); };
    if (k === 'poison') {   // skull
      c.beginPath(); c.arc(0, -r * .15, r * .8, Math.PI, 0); c.lineTo(r * .55, r * .55); c.lineTo(-r * .55, r * .55); c.closePath(); ol(() => 0); c.fillStyle = '#8ee05a'; c.fill();
      c.fillStyle = '#1b2a10'; c.beginPath(); c.arc(-r * .32, -r * .1, r * .2, 0, 7); c.arc(r * .32, -r * .1, r * .2, 0, 7); c.fill();
    } else if (k === 'bleed') {   // drop
      c.beginPath(); c.moveTo(0, -r); c.quadraticCurveTo(r * .9, r * .1, 0, r * .8); c.quadraticCurveTo(-r * .9, r * .1, 0, -r); ol(() => 0); c.fillStyle = '#e0283a'; c.fill();
      c.fillStyle = 'rgba(255,200,200,.8)'; c.fillRect(-r * .3, -r * .05, r * .18, r * .3);
    } else if (k === 'burn') {   // flame, flickering
      const f = Math.sin(t / 70) * r * .12;
      c.beginPath(); c.moveTo(0, -r - f); c.quadraticCurveTo(r * .9, -r * .1, r * .5, r * .6); c.quadraticCurveTo(0, r * .9, -r * .5, r * .6); c.quadraticCurveTo(-r * .9, -r * .1, 0, -r - f); ol(() => 0); c.fillStyle = '#ff8a2a'; c.fill();
      c.beginPath(); c.moveTo(0, -r * .35); c.quadraticCurveTo(r * .4, r * .2, 0, r * .55); c.quadraticCurveTo(-r * .4, r * .2, 0, -r * .35); c.fillStyle = '#ffe36a'; c.fill();
    } else if (k === 'blind') {   // crossed eye
      c.beginPath(); c.moveTo(-r, 0); c.quadraticCurveTo(0, -r * .9, r, 0); c.quadraticCurveTo(0, r * .9, -r, 0); ol(() => 0); c.fillStyle = '#d9d2c4'; c.fill();
      c.fillStyle = '#2a2430'; c.beginPath(); c.arc(0, 0, r * .3, 0, 7); c.fill(); c.strokeStyle = '#ff5a4a'; c.lineWidth = r * .25; c.beginPath(); c.moveTo(-r * .8, -r * .7); c.lineTo(r * .8, r * .7); c.stroke();
    } else if (k === 'shield') {
      c.beginPath(); c.moveTo(0, -r); c.lineTo(r * .85, -r * .6); c.quadraticCurveTo(r * .8, r * .5, 0, r); c.quadraticCurveTo(-r * .8, r * .5, -r * .85, -r * .6); c.closePath(); ol(() => 0); c.fillStyle = '#5ab4ff'; c.fill();
      c.fillStyle = 'rgba(220,240,255,.75)'; c.fillRect(-r * .1, -r * .6, r * .2, r * 1.1);
    } else if (k === 'broken') {   // stars circling
      for (let i = 0; i < 3; i++) { const an = t / 220 + i * 2.1, sx = Math.cos(an) * r * 1.3, sy = Math.sin(an) * r * .45; c.save(); c.translate(sx, sy); c.rotate(an * 2);
        c.beginPath(); for (let j = 0; j < 10; j++) { const rr = j % 2 ? r * .22 : r * .55, a = j * Math.PI / 5; c.lineTo(Math.cos(a) * rr, Math.sin(a) * rr); } c.closePath(); c.fillStyle = '#ffe36a'; c.fill(); c.restore(); }
    }
    c.restore();
  }
  const STATUS = [['poison', a => a.poison > 0], ['bleed', a => a.bleed > 0], ['burn', a => a.burn > 0], ['blind', a => a.blind > 0], ['shield', a => a.shield > 0], ['broken', a => a.broken]];

  let FIN = 0, FR = 0, ICONFR = new WeakMap(); (function tick() { FR++; requestAnimationFrame(tick); })();
  const _bt = HD.bt.bind(HD);
  HD.bt = function (c, img, anim, f, x, y, s) {
    const r = _bt(c, img, anim, f, x, y, s);
    try {
      const H = img && img.__hd, B = typeof Battle !== 'undefined' && Battle.B; if (!H || !B || !c || c.canvas !== MAIN()) return r;
      let a = null; for (const q of B.actors) if (Math.abs(q.x - x) < 1.5 && Math.abs(q.y - y) < 1.5) { a = q; break; }
      if (!a) return r;
      const now = performance.now(), S = s || 1, h = (HD.BT_H || 80) * S * (a.size || 1), feet = y + 2 * S;
      // status icons (once per fighter per frame)
      if (on('icons') && !a.ko && ICONFR.get(a) !== FR) {
        ICONFR.set(a, FR);
        const L = STATUS.filter(([, t]) => { try { return t(a); } catch (e) { return false; } }).map(([k]) => k);
        if (L.length) { const ir = Math.max(5, 6 * S), gap = ir * 2.6, x0 = x - (L.length - 1) * gap / 2, yy = feet - h * 1.02 - ir;
          L.forEach((k, i) => icon(c, k, x0 + i * gap, yy + Math.sin(now / 300 + i) * 1.5, ir, now)); }
      }
      // finisher camera: the moment the last enemy falls
      if (on('finisher') && a.side === 'e' && a.ko && B.__fin !== B) {
        const alive = B.actors.filter(q => q.side === 'e' && !q.ko).length;
        if (!alive) {
          B.__fin = B; FIN = now;
          B.punch = Math.max(B.punch || 0, .1); B.punchX = a.x; B.punchY = a.y - h * .4; B.hitstop = Math.max(B.hitstop || 0, 120);
          const ts = B.timeScale || 1; B.timeScale = .35; setTimeout(() => { if (Battle.B === B) B.timeScale = ts; }, 750);
          let col = '120,255,170'; try { const me = B.actors.find(q => q.isMe); if (typeof FightStyle !== 'undefined' && me) col = FightStyle.of(me).col || col; } catch (e) { }
          B.__finCol = col;
        }
      }
      if (B.__fin === B && now - FIN < 900 && c.__finFr !== FR) {
        c.__finFr = FR; const k = (now - FIN) / 900;
        c.save(); c.setTransform(1, 0, 0, 1, 0, 0); c.globalCompositeOperation = 'lighter'; c.fillStyle = `rgba(${B.__finCol},${.28 * (1 - k)})`; c.fillRect(0, 0, c.canvas.width, c.canvas.height);
        c.globalCompositeOperation = 'source-over'; const bar = c.canvas.height * .09 * Math.min(1, k * 4) * (1 - Math.max(0, k - .7) / .3);   // cinema bars
        c.fillStyle = 'rgba(0,0,0,.85)'; c.fillRect(0, 0, c.canvas.width, bar); c.fillRect(0, c.canvas.height - bar, c.canvas.width, bar); c.restore();
      }
    } catch (e) { }
    return r;
  };

  /* ---------- rank-up glow in the world ---------- */
  if (typeof Ent === 'undefined' || typeof Power === 'undefined') return;
  let lastRank = null, burst = 0; const SP = [];
  const _draw = Ent.prototype.draw;
  Ent.prototype.draw = function (c, cx, cy, t) {
    const r = _draw.call(this, c, cx, cy, t);
    try {
      if (!this.isPlayer || !on('rankup')) return r;
      const now = performance.now(); let i = null; try { i = Power.now().i; } catch (e) { }
      if (i != null) { if (lastRank != null && i > lastRank) { burst = now; for (let j = 0; j < 40; j++) SP.push({ dx: (Math.random() - .5) * 26, dy: -Math.random() * 10, vy: -.6 - Math.random() * 1.2, t: now + Math.random() * 600, life: 900 + Math.random() * 500 }); } lastRank = i; }
      const k = (now - burst) / 1600; if (!burst || k >= 1) return r;
      const x = this.px - cx, y = this.py - cy + 3, h = HD.OW_H || 40;
      c.save(); c.globalCompositeOperation = 'lighter';
      const g = c.createLinearGradient(0, y - h * 3, 0, y); g.addColorStop(0, 'rgba(80,255,150,0)'); g.addColorStop(1, `rgba(80,255,150,${.45 * (1 - k)})`);
      const w = h * (.35 + .25 * Math.sin(Math.min(1, k * 3) * Math.PI)); c.fillStyle = g; c.fillRect(x - w / 2, y - h * 3, w, h * 3);
      c.strokeStyle = `rgba(160,255,200,${.6 * (1 - k)})`; c.lineWidth = 2; c.beginPath(); c.ellipse(x, y, h * (.3 + k * .9), h * (.1 + k * .3), 0, 0, 7); c.stroke();
      for (let j = SP.length - 1; j >= 0; j--) { const p = SP[j], q = (now - p.t) / p.life; if (q >= 1) { SP.splice(j, 1); continue; } if (q < 0) continue;
        const dt = (now - p.t) / 16; c.fillStyle = `rgba(150,255,190,${.9 * (1 - q)})`; c.fillRect(x + p.dx + Math.sin(dt / 6) * 2, y + p.dy + p.vy * dt, 2, 2); }
      c.restore();
    } catch (e) { }
    return r;
  };
})();
