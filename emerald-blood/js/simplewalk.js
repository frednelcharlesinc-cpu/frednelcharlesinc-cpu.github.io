'use strict';
/* SIMPLE WALK — the overworld walk and run go back to the simple style the townsfolk use:
   the character's standing pose for that direction, alternating a small step (one leg bends, then the other)
   with a light bob. Running is the same step, just quicker, with a slight forward lean.
   Applies to Ren (all looks) and every named character with their own sprite set. Battle animations are untouched. */
(function () {
  if (typeof Ent === 'undefined' || typeof HD === 'undefined') return;
  const cache = new Map();
  // one leg's lower half squashed up toward the hip — the same trick the townsfolk walk uses
  function stepCanvas(img, fr, side) {
    const key = (img.__hd && img.__hd.set || '') + ':' + fr.join(',') + ':' + side;
    let c = cache.get(key); if (c) return c;
    const [sx, sy, w, h, ax] = fr, hip = Math.round(h * .64), split = Math.round(ax), amt = .8;
    c = document.createElement('canvas'); c.width = w; c.height = h; const x = c.getContext('2d');
    x.drawImage(img, sx, sy, w, hip, 0, 0, w, hip);                                  // everything above the hips
    const lx = side < 0 ? 0 : split, lw = side < 0 ? split : w - split, ox = side < 0 ? split : 0, ow = side < 0 ? w - split : split;
    x.drawImage(img, sx + ox, sy + hip, ow, h - hip, ox, hip, ow, h - hip);             // the planted leg
    if (lw > 0) x.drawImage(img, sx + lx, sy + hip, lw, h - hip, lx, hip, lw, Math.max(2, Math.round((h - hip) * amt)));   // the stepping leg, lifted
    cache.set(key, c); return c;
  }
  const _draw = Ent.prototype.draw;
  Ent.prototype.draw = function (c, cx, cy, t) {
    if (!this.move || !HD.on() || !HD.OW || (G.S && G.S.kid)) return _draw.call(this, c, cx, cy, t);
    let img, fr, faces;
    if (this.dir === 'left' || this.dir === 'right') this.face = this.dir;
    const side = this.dir === 'left' || this.dir === 'right';
    if (this.isPlayer) {
      const set = HD.playerSet(); img = HD.sheet(set, false); if (!img) return _draw.call(this, c, cx, cy, t);
      const A = img.__hd.anims, lft = this.dir === 'left' && A.ow_left;
      const base = lft ? 'ow_left' : side ? 'ow_side' : this.dir === 'up' ? 'ow_up' : 'ow_down';
      fr = img.__hd.frames[(A[base] || A.ow_down)[0]];
      faces = lft ? 'left' : side || !A.ow_left ? 'right' : (this.face || 'right');
    } else {
      const own = HD.setOf(HD.npcName(this)); if (!own || !HD.img[own] || HD.meta[own].seated) return _draw.call(this, c, cx, cy, t);
      img = HD.sheet(own, false); const A = img.__hd.anims, hood = /_h$/.test(HD.npcName(this)) && A.ow_hood;
      const base = hood ? 'ow_hood' : side && A.ow_side ? 'ow_side' : this.dir === 'up' && A.ow_up ? 'ow_up' : 'ow_down';
      fr = img.__hd.frames[A[base][0]]; faces = 'right';
    }
    if (!fr) return _draw.call(this, c, cx, cy, t);
    const run = this.move.ms < 160, st = Math.floor(this.walkT / (this.move.ms / 2)) % 4;   // stand, step, stand, other step
    let src = st === 1 ? stepCanvas(img, fr, -1) : st === 3 ? stepCanvas(img, fr, 1) : null;
    /* REAL CYCLES (Chat C, 2026-11-12): a set cut from a movement sheet (meta.cycle) plays its own walk / run frames */
    const M = img.__hd;
    if (M && M.cycle) {
      const d = this.dir === 'up' ? 'up' : this.dir === 'down' ? 'down' : 'side', L = M.anims['ow_' + d + (run ? '_run' : '_walk')] || M.anims['ow_' + d + '_walk'];
      if (L && L.length > 1) { fr = M.frames[L[Math.floor(this.walkT / (this.move.ms / L.length * (run ? 1.6 : 2))) % L.length]]; src = null; }
    }
    const x = this.px - cx, y = this.py - cy + 3, h = HD.OW_H * (this.size || 1), k = h / fr[6];
    if (x < -60 || y < -10 || x > G.view.w + 60 || y > G.view.h + 100) return;
    c.fillStyle = 'rgba(0,0,0,.24)'; c.beginPath(); c.ellipse(x, y - 1, 11, 4, 0, 0, 7); c.fill();
    const want = this.face || (this.isPlayer ? 'right' : 'left'), flip = want !== faces;
    /* REN'S STRIDE GROWS WITH RANK (Chat C): C dust · B steady 'heels light' walk · A afterimage · S eye wisps · SS+ emerald footfall */
    const R = this.isPlayer && typeof Power !== 'undefined' && Power.now ? (Power.now().i || 0) : -1;
    const calm = R >= 3 ? .45 : 1, cyc = M && M.cycle ? 0 : 1;
    const bob = (st % 2 ? 1.2 : 0) * (run ? 1.5 : 1) * calm * cyc, lean = run && side ? .07 * (R >= 3 ? .6 : 1) : 0;
    if (R >= 0) {
      const fx = this.__fx || (this.__fx = { p: [], trail: [], st: -1 }), now = performance.now();
      if (run && st !== fx.st && st % 2 && R >= 2) for (let i = 0; i < (R >= 6 ? 4 : 2); i++) fx.p.push({ x: this.px + (Math.random() - .5) * 10, y: this.py + 2, vx: (Math.random() - .5) * .5 - (this.dir === 'right' ? .4 : this.dir === 'left' ? -.4 : 0), vy: -Math.random() * .35, t0: now, life: 420, r: 2 + Math.random() * 2, col: R >= 6 ? '120,255,170' : '200,185,150' });
      if (run && R >= 5 && Math.random() < .5) fx.p.push({ x: this.px + (Math.random() - .5) * 4, y: this.py - h * .86, vx: (this.dir === 'right' ? -.6 : this.dir === 'left' ? .6 : 0) + (Math.random() - .5) * .2, vy: -.1 - Math.random() * .2, t0: now, life: 500, r: 1.3, col: '120,255,170', glow: 1 });
      fx.st = st;
      if (run && R >= 4) { fx.trail.unshift({ x: this.px, y: this.py, t: now }); fx.trail.length = Math.min(fx.trail.length, 8); } else fx.trail.length = 0;
      fx.p = fx.p.filter(q => now - q.t0 < q.life);
      for (const q of fx.p) { const a = 1 - (now - q.t0) / q.life, dt = (now - q.t0) / 16; c.fillStyle = `rgba(${q.col},${(q.glow ? .9 : .45) * a})`; c.beginPath(); c.arc(q.x + q.vx * dt - cx, q.y + q.vy * dt - cy + 3, q.r * (q.glow ? 1 : 1 + (1 - a)), 0, 7); c.fill(); }
      if (R >= 6) { const pul = .5 + .5 * Math.sin(now / 260); c.strokeStyle = `rgba(120,255,170,${.32 + .25 * pul})`; c.lineWidth = 2; c.beginPath(); c.ellipse(x, y - 1, 13 + pul * 2, 4.5 + pul * .6, 0, 0, 7); c.stroke(); }
      for (let i = 3; i < fx.trail.length; i += 2) {   // afterimages
        const g = fx.trail[i]; c.save(); c.globalAlpha = .16 * (1 - i / fx.trail.length) * (R >= 6 ? 1.5 : 1); c.translate(g.x - cx, g.y - cy + 3 - bob); if (flip) c.scale(-1, 1); if (lean) c.rotate(lean);
        c.filter = 'brightness(1.6) saturate(0)'; HD.dI(c, src || img, src ? 0 : fr[0], src ? 0 : fr[1], fr[2], fr[3], -fr[4] * k, -fr[5] * k, fr[2] * k, fr[3] * k); c.restore();
      }
    }
    c.save(); if (this.alpha != null) c.globalAlpha = this.alpha;
    c.translate(x, y - bob); if (flip) c.scale(-1, 1); if (lean) c.rotate(lean);
    if (src) HD.dI(c, src, 0, 0, fr[2], fr[3], -fr[4] * k, -fr[5] * k, fr[2] * k, fr[3] * k);
    else HD.dI(c, img, fr[0], fr[1], fr[2], fr[3], -fr[4] * k, -fr[5] * k, fr[2] * k, fr[3] * k);
    c.restore();
  };
})();
