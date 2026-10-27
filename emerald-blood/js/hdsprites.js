'use strict';
/* HD sprites — the art you made, cut from your sheets (built by hd/build_hd.py):
   Ren (black kimono, black locs), Ren in the hood / Red Veil (the shinobi with the green eye glow),
   and every townsperson / guard / adventurer drawn from your sprite pack.
   Atlases: assets/hd/{ren,hood,npcs}.png, frame table in assets/hd/hd.json: [x, y, w, h, anchorX, feetY, standingHeight]. */
const HD = {
  meta: null, img: {}, flip: {}, npcCv: {},
  OW_H: 52, BT_H: 70, OW: true,
  load() {
    fetch('assets/hd/hd.json?v=' + Date.now().toString(36).slice(0, 5), { cache: 'no-cache' }).then(r => r.json()).then(m => {
      this.meta = m;
      for (const k of ['ren', 'hood', 'veil', 'kairo', 'npcs']) loadImg(`assets/hd/${m[k].img}?v=${m.v}`).then(i => { this.img[k] = i; }).catch(() => {});
    }).catch(() => {});
  },
  on() { return !!this.meta && !(G.settings && G.settings.classicSprites); },
  playerSet() { return G.S && G.S.hood ? (typeof Veil !== 'undefined' && Veil.on() ? 'veil' : 'hood') : 'ren'; },
  npcName(e) { return String(e.sprite || e.spr || e.key || e.id || ''); },
  /* named characters with their own full sets */
  setOf(name, key) { return /^kairo(_b|_h)?$/.test(name) || /^kairo_duel/.test(key || '') ? 'kairo' : null; },
  npcFrame(name) { const m = this.meta && this.meta.npcs.frames; return m && m[name] || null; },
  /* a set's atlas, mirrored on request; the mirrored copy carries mirrored frame coordinates */
  sheet(set, mirror) {
    const im = this.img[set]; if (!im) return null; const M = this.meta[set];
    if (!mirror) { if (!im.__hd) im.__hd = { frames: M.frames, anims: M.anims, faces: M.faces }; return im; }
    if (this.flip[set]) return this.flip[set];
    const c = document.createElement('canvas'); c.width = im.width; c.height = im.height; const x = c.getContext('2d');
    x.translate(im.width, 0); x.scale(-1, 1); x.drawImage(im, 0, 0);
    c.__hd = { frames: M.frames.map(f => [im.width - f[0] - f[2], f[1], f[2], f[3], f[2] - f[4], f[5], f[6]]), anims: M.anims, faces: M.faces === 'left' ? 'right' : 'left' };
    return (this.flip[set] = c);
  },
  /* one townsperson as its own little canvas (battle use), facing the way asked */
  npcSheet(name, faceLeft) {
    const k = name + (faceLeft ? '<' : '>'); if (this.npcCv[k]) return this.npcCv[k];
    const f = (this.npcFrame(name) || [])[0], im = this.img.npcs; if (!f || !im) return null;
    const c = document.createElement('canvas'); c.width = f[2]; c.height = f[3]; const x = c.getContext('2d');
    if (faceLeft) { x.translate(f[2], 0); x.scale(-1, 1); }
    x.drawImage(im, f[0], f[1], f[2], f[3], 0, 0, f[2], f[3]);
    c.__hd = { frames: [[0, 0, f[2], f[3], faceLeft ? f[2] - f[4] : f[4], f[5], f[6]]], anims: {}, single: 1, faces: faceLeft ? 'left' : 'right' };
    return (this.npcCv[k] = c);
  },
  /* draw one frame with the feet at (x, y), standing height h */
  blit(c, img, fr, x, y, h, extra) {
    const k = h / fr[6];
    if (extra && (extra.rot || extra.sy)) {
      c.save(); c.translate(x, y); if (extra.rot) c.rotate(extra.rot); if (extra.sy) c.scale(1, extra.sy);
      c.drawImage(img, fr[0], fr[1], fr[2], fr[3], -fr[4] * k, -fr[5] * k, fr[2] * k, fr[3] * k); c.restore(); return;
    }
    c.drawImage(img, fr[0], fr[1], fr[2], fr[3], Math.round(x - fr[4] * k), Math.round(y - fr[5] * k), Math.round(fr[2] * k), Math.round(fr[3] * k));
  },
  NBT: { combat: 2, slash: 6, halfslash: 6, backslash: 13, spellcast: 7, thrust: 8, jump: 5, hurt: 6, walk: 9, run: 8 },
  bt(c, img, anim, f, x, y, s) {
    const H = img.__hd, h = this.BT_H * (s || 1), feet = y + 2 * (s || 1), now = performance.now();
    if (H.single) {   // one drawn pose: motion comes from moving the figure
      const fr = H.frames[0], n = this.NBT[anim] || 2, p = Math.min(1, f / Math.max(1, n - 1)), dir = H.faces === 'left' ? -1 : 1;
      let dx = 0, dy = 0, rot = 0, sy = 1;
      if (anim === 'combat') sy = 1 + Math.sin(now / 380) * .012;
      else if (/slash|thrust/.test(anim)) { const q = Math.sin(p * Math.PI); dx = dir * q * 10 * (s || 1); rot = dir * q * .14; }
      else if (anim === 'spellcast') { dy = -Math.sin(p * Math.PI) * 4 * (s || 1); sy = 1 + Math.sin(p * Math.PI) * .03; }
      else if (anim === 'jump') dy = -Math.sin(p * Math.PI) * 26 * (s || 1);
      else if (anim === 'hurt') rot = -dir * Math.min(1, f / 3) * 1.45;
      else if (anim === 'walk' || anim === 'run') dy = -Math.abs(Math.sin(now / 90)) * 3 * (s || 1);
      this.blit(c, img, fr, x + dx, feet + dy, h, { rot, sy }); return;
    }
    let list = H.anims[anim] || H.anims.combat, n = this.NBT[anim] || list.length, i;
    const A = H.me && this.act && now < this.act.end ? this.act : null;
    if (A) {   // a reaction (parry clash, dodge, perfect dodge with afterimages) plays over whatever the battle code is doing
      list = H.anims[A.name] || list; i = list[Math.min(list.length - 1, Math.floor((now - A.t0) / (A.end - A.t0) * list.length))];
    } else {
      if (H.me && anim === 'slash' && this.meVar && H.anims[this.meVar]) list = H.anims[this.meVar];   // each strike of a combo gets its own swing
      if (anim === 'combat') i = list[Math.floor(now / 520) % list.length];
      else i = list[Math.min(list.length - 1, Math.floor(f * list.length / n))];
    }
    const fr = H.frames[i];
    const sy = anim === 'combat' ? 1 + Math.sin(now / 380) * .012 : 1;
    this.blit(c, img, fr, x, feet, h, sy !== 1 ? { sy } : null);
  }
};
HD.load();

/* ---------- battle: Ren / the hood, and every human fighter ---------- */
(function () {
  const _d = drawBT;
  drawBT = function (c, img, anim, f, x, y, s) { if (img && img.__hd) return HD.bt(c, img, anim, f, x, y, s); return _d(c, img, anim, f, x, y, s); };
  const _t = tinted;
  tinted = function (img, col) { const r = _t(img, col); if (img && img.__hd) r.__hd = img.__hd; return r; };
  const _pt = portraitTo;
  portraitTo = function (canvas, img, expr, kid) { return _pt(canvas, img && img.__orig ? img.__orig : img, expr, kid); };
  const assign = function (B) {
    if (!B || B.hdAll || !HD.on()) return;
    let all = 1;
    for (const a of B.actors) {
      if (a.hdDone) continue;
      if (a.isMe) {
        if (G.S.kid) { a.hdDone = 1; continue; }
        const set = HD.playerSet(); if (!HD.img[set]) { all = 0; continue; }
        const im = HD.sheet(set, HD.meta[set].faces !== 'left'); im.__hd.me = 1;
        B.renBts = im; a.hdDone = 1; a.btsDone = 1; continue;
      }
      const name = HD.npcName(a.spr ? a : { id: a.key || a.id }), own = HD.setOf(name, a.key);
      if (own) {
        if (!HD.img[own]) { all = 0; continue; }
        const left = a.side !== 'e', im = HD.sheet(own, (HD.meta[own].faces === 'left') !== left);
        im.__orig = a.img && (a.img.__orig || a.img); a.img = im; a.hdDone = 1; a.btsDone = 1; continue;
      }
      if (!HD.npcFrame(name)) { a.hdDone = 1; continue; }
      if (!a.img || !a.img.width) { all = 0; continue; }
      const cv = HD.npcSheet(name, a.side !== 'e'); if (!cv) { all = 0; continue; }
      cv.__orig = a.img.__orig || a.img; a.img = cv; a.hdDone = 1; a.btsDone = 1;
    }
    if (all) B.hdAll = 1;
  };
  /* combos: every strike in a chain swings differently (quick-draw, cross-cut, rising arc, leaping spin, palm strike) */
  const VARS = ['cmb1', 'cmb2', 'cmb3', 'cmb4', 'cmb5'];
  const _strike = Battle.strike.bind(Battle);
  Battle.strike = function (a, t, hit, mult, opts) {
    if (a && a.isMe && HD.on() && !G.S.kid) {
      const now = performance.now();
      if (now - (HD.lastStrike || 0) > 1600) { HD.combo = Math.floor(Math.random() * VARS.length); } else HD.combo = (HD.combo + 1) % VARS.length;
      HD.lastStrike = now; HD.meVar = /thrust/.test(hit.anim || '') && Math.random() < .5 ? 'thr' : VARS[HD.combo];
    }
    return _strike(a, t, hit, mult, opts);
  };
  /* reactions: parries clash with sparks, dodges spin away, perfect dodges leave afterimages */
  const _text = Battle.text.bind(Battle);
  Battle.text = function (a, txt, ...r) {
    if (a && a.isMe && HD.on() && !G.S.kid) {
      const k = txt === 'PERFECT DODGE' ? ['pdodge', 560] : txt === 'DODGE' ? ['dodge', 380] : (txt === 'PERFECT PARRY' || txt === 'PARRY') ? ['parry', txt === 'PARRY' ? 360 : 460] : null;
      if (k) { const now = performance.now(); HD.act = { name: k[0], t0: now, end: now + k[1] }; if (k[0] === 'pdodge') a.afterimg = Math.max(a.afterimg || 0, 520); }
    }
    return _text(a, txt, ...r);
  };
  const _ui = Battle.ui.bind(Battle); Battle.ui = function (on) { if (on) assign(this.B); return _ui(on); };
  const _hud = Battle.hud.bind(Battle); Battle.hud = function () { assign(this.B); return _hud(); };
})();

/* ---------- overworld ---------- */
(function () {
  const _draw = Ent.prototype.draw;
  Ent.prototype.draw = function (c, cx, cy, t) {
    if (!HD.on() || !HD.OW) return _draw.call(this, c, cx, cy, t);   // overworld keeps the stepping walkers until walk-cycle art arrives
    let img, fr, faces, h = HD.OW_H * (this.size || 1);
    const moving = !!this.move, ph = moving ? this.walkT / this.move.ms : 0, st = moving ? Math.floor(this.walkT / (this.move.ms / 2)) % 4 : 0;
    if (this.dir === 'left' || this.dir === 'right') this.face = this.dir;
    if (this.isPlayer) {
      if (G.S.kid) return _draw.call(this, c, cx, cy, t);
      const set = HD.playerSet(); img = HD.sheet(set, false); if (!img) return _draw.call(this, c, cx, cy, t);
      const A = img.__hd.anims, side = this.dir === 'left' || this.dir === 'right';
      const base = side ? 'ow_side' : this.dir === 'up' ? 'ow_up' : 'ow_down', list = moving && A[base + '_walk'] || A[base];
      const i = moving ? list[Math.floor(this.walkT / (this.move.ms / (list.length >= 8 ? 4 : 2))) % list.length] : list[0];
      fr = img.__hd.frames[i]; faces = 'right'; // the overworld views look to the right; battle frames look left
    } else if (HD.setOf(HD.npcName(this)) && HD.img.kairo) {
      img = HD.sheet('kairo', false); const A = img.__hd.anims;
      const hood = /_h$/.test(HD.npcName(this)), list = moving ? (hood ? A.ow_hood_walk : A.ow_down_walk) : (hood ? A.ow_hood : A.ow_down);
      fr = img.__hd.frames[list[st % list.length]]; faces = 'right';
    } else {
      const name = HD.npcName(this), L4 = HD.npcFrame(name); img = HD.img.npcs; fr = L4 && L4[moving ? st % 4 : 0];
      if (!fr || !img) return _draw.call(this, c, cx, cy, t);
      faces = 'right';
    }
    const x = this.px - cx, y = this.py - cy + 3;
    if (x < -60 || y < -10 || x > G.view.w + 60 || y > G.view.h + 100) return;
    c.fillStyle = 'rgba(0,0,0,.24)'; c.beginPath(); c.ellipse(x, y - 1, 11, 4, 0, 0, 7); c.fill();
    const want = this.face || (this.isPlayer ? 'right' : 'left'), flip = (this.dir === 'left' || this.dir === 'right' || moving) && want !== faces;
    const bob = moving ? Math.abs(Math.sin(ph * Math.PI * 2)) * .8 : 0;
    const sway = 0;
    const breathe = moving ? 1 : 1 + Math.sin((t + this.x * 211) / 420) * .012;
    c.save(); if (this.alpha != null) c.globalAlpha = this.alpha;
    c.translate(x, y - bob); if (sway) c.rotate(sway); if (flip) c.scale(-1, 1); c.scale(1, breathe);
    const k = h / fr[6];
    c.drawImage(img, fr[0], fr[1], fr[2], fr[3], -fr[4] * k, -fr[5] * k, fr[2] * k, fr[3] * k);
    c.restore();
  };
})();

/* ---------- portraits: Ren's new busts (ren_v3) win over the older painted sets ---------- */
(function () {
  const _s = styled;
  styled = function (id) { if (!(G.settings && G.settings.artStyle === 'classic') && Art.port[id + '_v3']) return id + '_v3'; return _s(id); };
  PFIT.ren_v3 = 1;
})();

/* ---------- cutscenes draw with the old sheet helpers: send recognised characters to the new art ---------- */
(function () {
  const nameOf = img => {
    if (!img || !G.A) return null;
    if (img === G.A.pVeil) return '@veil'; if (img === G.A.pHood) return '@hood'; if (img === G.A.pHair) return '@ren';
    const m = /npc\/([a-z0-9_]+)\.png/.exec(img.src || ''); return m ? m[1] : null;
  };
  const owPick = (who, anim, dir, f) => {
    const walking = anim === 'walk' || anim === 'run';
    if (who[0] === '@' || HD.setOf(who)) {
      const set = who[0] === '@' ? who.slice(1) : 'kairo', im = HD.img[set]; if (!im) return null; const A = HD.meta[set].anims;
      const base = set === 'kairo' ? (/_h$/.test(who) ? 'ow_hood' : 'ow_down') : dir === 'left' || dir === 'right' ? 'ow_side' : dir === 'up' ? 'ow_up' : 'ow_down';
      const list = walking && A[base + '_walk'] || A[base]; return [im, HD.meta[set].frames[list[f % list.length]]];
    }
    const L4 = HD.npcFrame(who); if (!L4 || !HD.img.npcs) return null;
    return [HD.img.npcs, L4[walking ? f % 4 : 0]];
  };
  const _ow = drawOW;
  drawOW = function (c, img, anim, dir, f, x, y, alpha, sz) {
    if (HD.on() && HD.OW && !(G.S && G.S.kid)) {
      const who = nameOf(img), r = who && owPick(who, anim, dir, f);
      if (r) {
        sz = sz || 1; const [im, fr] = r, k = HD.OW_H * sz / fr[6];
        c.save(); if (alpha !== undefined) c.globalAlpha = alpha; c.translate(x, y + 2 * sz); if (dir === 'left') c.scale(-1, 1);
        c.drawImage(im, fr[0], fr[1], fr[2], fr[3], -fr[4] * k, -fr[5] * k, fr[2] * k, fr[3] * k); c.restore(); return;
      }
    }
    return _ow(c, img, anim, dir, f, x, y, alpha, sz);
  };
  const _bt = drawBT;
  drawBT = function (c, img, anim, f, x, y, s) {
    if (img && !img.__hd && HD.on() && !(G.S && G.S.kid)) {
      const who = nameOf(img);
      if (who) {
        let sh = null;
        if (who[0] === '@') { const set = who.slice(1); if (HD.img[set]) sh = HD.sheet(set, HD.meta[set].faces !== 'left'); }   // the hero's old sheets faced left
        else if (HD.setOf(who)) { if (HD.img.kairo) sh = HD.sheet('kairo', false); }
        else if (HD.npcFrame(who)) sh = HD.npcSheet(who, false);
        if (sh) return HD.bt(c, sh, anim, f, x, y, s);
      }
    }
    return _bt(c, img, anim, f, x, y, s);
  };
})();
