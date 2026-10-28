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
    const src = st === 1 ? stepCanvas(img, fr, -1) : st === 3 ? stepCanvas(img, fr, 1) : null;
    const x = this.px - cx, y = this.py - cy + 3, h = HD.OW_H * (this.size || 1), k = h / fr[6];
    if (x < -60 || y < -10 || x > G.view.w + 60 || y > G.view.h + 100) return;
    c.fillStyle = 'rgba(0,0,0,.24)'; c.beginPath(); c.ellipse(x, y - 1, 11, 4, 0, 0, 7); c.fill();
    const want = this.face || (this.isPlayer ? 'right' : 'left'), flip = want !== faces;
    const bob = (st % 2 ? 1.2 : 0) * (run ? 1.5 : 1), lean = run && side ? .07 : 0;
    c.save(); if (this.alpha != null) c.globalAlpha = this.alpha;
    c.translate(x, y - bob); if (flip) c.scale(-1, 1); if (lean) c.rotate(lean);
    if (src) c.drawImage(src, 0, 0, fr[2], fr[3], -fr[4] * k, -fr[5] * k, fr[2] * k, fr[3] * k);
    else c.drawImage(img, fr[0], fr[1], fr[2], fr[3], -fr[4] * k, -fr[5] * k, fr[2] * k, fr[3] * k);
    c.restore();
  };
})();
