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
      this.meta = m; if (this.wantImgs) this.lateLoad();
    }).catch(() => {});
  },
  /* the art sheets load after the title screen is up (small WebP files; PNG if the phone can't read WebP) */
  lateLoad() {
    this.wantImgs = 1; const m = this.meta; if (!m || this.started) return; this.started = 1;
    const first = ['ren', 'hood', 'npcs', 'kairo', 'veil'], order = [...first, ...Object.keys(m).filter(k => !first.includes(k))].filter(k => m[k] && m[k].img);
    for (const k of order) { const base = `assets/hd/${m[k].img.replace(/\.png$/, '')}`;
      loadImg(`${base}.webp?v=${m.v}`, !first.includes(k) && k !== 'asc').catch(() => loadImg(`${base}.png?v=${m.v}`, true)).then(i => { this.img[k] = i; }).catch(() => {}); }
  },
  stub() { if (!this._stub) { const c = document.createElement('canvas'); c.width = 64; c.height = 64; this._stub = c; } return this._stub; },
  on() { return !!this.meta && !(G.settings && G.settings.classicSprites); },
  playerSet() { return G.S && G.S.hood ? (typeof Veil !== 'undefined' && Veil.on() ? 'veil' : 'hood') : 'ren'; },
  npcName(e) { return String(e.sprite || e.spr || e.key || e.id || ''); },
  /* named characters with their own full sets */
  setOf(name, key) {
    if (/^kairo(_b|_h)?$/.test(name) || /^kairo_duel/.test(key || '')) return 'kairo';
    if (/_c?h$/.test(name)) return null;   // hooded disguises keep their hooded figure
    const b = String(name).replace(/^ge_/, '').replace(/_(bt|eyes|e|c|w|cw|r)$/, '').replace(/_(bt|eyes|e|c|w|cw|r)$/, '');
    return this.meta && this.meta['c_' + b] ? 'c_' + b : null;
  },
  npcFrame(name) { const m = this.meta && this.meta.npcs.frames; return m && m[name] || null; },
  /* a set's atlas, mirrored on request; the mirrored copy carries mirrored frame coordinates */
  sheet(set, mirror) {
    const im = this.img[set]; if (!im) return null; const M = this.meta[set];
    if (!mirror) { if (!im.__hd) im.__hd = { frames: M.frames, anims: M.anims, faces: M.faces, set }; return im; }
    if (this.flip[set]) return this.flip[set];
    const c = document.createElement('canvas'); c.width = im.width; c.height = im.height; const x = c.getContext('2d');
    x.translate(im.width, 0); x.scale(-1, 1); x.drawImage(im, 0, 0);
    c.__hd = { frames: M.frames.map(f => [im.width - f[0] - f[2], f[1], f[2], f[3], f[2] - f[4], f[5], f[6]]), anims: M.anims, faces: M.faces === 'left' ? 'right' : 'left', set };
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
    if (!fr) return;
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
    const A = H.me && this.act && now < this.act.end ? this.act : (!H.me && H.set && this.acts && this.acts[H.set] && now < this.acts[H.set].end ? this.acts[H.set] : null);
    if (A) {   // a reaction (parry clash, dodge, perfect dodge with afterimages) plays over whatever the battle code is doing
      list = H.anims[A.name] || list; i = list[Math.min(list.length - 1, Math.floor((now - A.t0) / (A.end - A.t0) * list.length))];
    } else {
      if (H.me && anim === 'slash' && this.meVar && H.anims[this.meVar]) list = H.anims[this.meVar];   // each strike of a combo gets its own swing
      if (anim === 'combat') i = list[Math.floor(now / 520) % list.length];
      else i = list[Math.min(list.length - 1, Math.floor(f * list.length / n))];
    }
    const fr = H.frames[i] || H.frames[list[0]] || H.frames[0];
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
        B.renBts = im; a.hdDone = 1; a.btsDone = 1;
        if (HD.meta[set].anims.land) { const n = performance.now(); HD.act = { name: 'land', t0: n, end: n + 900 }; }   // drops in: impact, skid, settle into the stance
        continue;
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
      HD.lastStrike = now; if (HD.forceVar) { HD.meVar = HD.forceVar; return _strike(a, t, hit, mult, opts); }
      HD.meVar = /thrust/.test(hit.anim || '') && Math.random() < .5 ? 'thr' : VARS[HD.combo];
    }
    return _strike(a, t, hit, mult, opts);
  };
  /* reactions: parries clash with sparks, dodges spin away, perfect dodges leave afterimages */
  const _text = Battle.text.bind(Battle);
  Battle.text = function (a, txt, ...r) {
    const own = a && !a.isMe && HD.on() ? HD.setOf(HD.npcName(a.spr ? a : { id: a.key || a.id }), a.key) : null;
    if (own && HD.meta[own].anims.parry) {
      const k = txt === 'PERFECT DODGE' ? ['pdodge', 560] : txt === 'DODGE' ? ['dodge', 380] : (txt === 'PERFECT PARRY' || txt === 'PARRY') ? ['parry', 420] : null;
      if (k) { const now = performance.now(); (HD.acts = HD.acts || {})[own] = { name: k[0], t0: now, end: now + k[1] }; if (k[0] === 'pdodge') a.afterimg = Math.max(a.afterimg || 0, 520); }
    }
    if (a && a.isMe && HD.on() && !G.S.kid) {
      const k = txt === 'PERFECT DODGE' ? [HD.meta && HD.meta[HD.playerSet()].anims.pd1 ? pick(['pd1', 'pd2', 'pd3', 'pd4']) : 'pdodge', 760] : txt === 'DODGE' ? ['dodge', 420] : txt === 'PARRY' ? ['parry', 380] : txt === 'PERFECT PARRY' ? [HD.meta && HD.meta[HD.playerSet()].anims.pp1 ? pick(['pp1', 'pp2', 'pp3']) : 'parry', 520] : null;
      if (k) { const now = performance.now(); HD.act = { name: k[0], t0: now, end: now + k[1] }; if (/^pd/.test(k[0])) a.afterimg = Math.max(a.afterimg || 0, 520); }
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
      const run = moving && this.move.ms < 160, lft = this.dir === 'left' && A.ow_left;
      const base = lft ? 'ow_left' : side ? 'ow_side' : this.dir === 'up' ? 'ow_up' : 'ow_down', list = moving && (run && A[base + '_run'] || A[base + '_walk']) || A[base];
      const i = moving ? list[Math.floor(this.walkT / (this.move.ms / (list.length >= 8 ? 4 : 2))) % list.length] : list[0];
      fr = img.__hd.frames[i];
      // drawn left/right views face their own way; front/back views never get mirrored when a left view exists
      faces = lft ? 'left' : side || !A.ow_left ? 'right' : (this.face || 'right');
    } else if (HD.setOf(HD.npcName(this)) && HD.img[HD.setOf(HD.npcName(this))]) {
      const own = HD.setOf(HD.npcName(this)); img = HD.sheet(own, false); const A = img.__hd.anims;
      const hood = /_h$/.test(HD.npcName(this)) && A.ow_hood, side = this.dir === 'left' || this.dir === 'right';
      const base = hood ? 'ow_hood' : side && A.ow_side ? 'ow_side' : 'ow_down', list = moving && A[base + '_walk'] || A[base];
      fr = img.__hd.frames[moving && list.length >= 8 ? list[Math.floor(this.walkT / (this.move.ms / 4)) % list.length] : list[st % list.length]]; faces = 'right';
    } else {
      const name = HD.npcName(this), L4 = HD.npcFrame(name); img = HD.img.npcs; fr = L4 && L4[moving ? st % 4 : 0];
      if (!fr || !img) return _draw.call(this, c, cx, cy, t);
      faces = 'right';
    }
    if (!fr || !img) return _draw.call(this, c, cx, cy, t);
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
      const set = who[0] === '@' ? who.slice(1) : HD.setOf(who), im = HD.img[set]; if (!im) return null; const A = HD.meta[set].anims;
      const base = set === 'kairo' && /_h$/.test(who) ? 'ow_hood' : dir === 'left' || dir === 'right' ? 'ow_side' : dir === 'up' ? 'ow_up' : 'ow_down';
      const list = walking && A[base + '_walk'] || A[base]; return [im, HD.meta[set].frames[list[f % list.length]]];
    }
    const L4 = HD.npcFrame(who); if (!L4 || !HD.img.npcs) return null;
    return [HD.img.npcs, L4[walking ? f % 4 : 0]];
  };
  const _ow = drawOW;
  drawOW = function (c, img, anim, dir, f, x, y, alpha, sz) {
    if (HD.on() && HD.OW && !(G.S && G.S.kid)) {
      const who = nameOf(img), r = who && owPick(who, anim, dir, f);
      if (r && r[1]) {
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
        else if (HD.setOf(who)) { if (HD.img[HD.setOf(who)]) sh = HD.sheet(HD.setOf(who), false); }
        else if (HD.npcFrame(who)) sh = HD.npcSheet(who, false);
        if (sh) return HD.bt(c, sh, anim, f, x, y, s);
      }
    }
    return _bt(c, img, anim, f, x, y, s);
  };
})();

/* fetch the faces of the people on a map as soon as you arrive, so their first line shows the right face straight away */
(function () {
  const _l = World.load.bind(World);
  World.load = async function (...a) {
    const r = await _l(...a);
    try { for (const e of this.ents) { if (e.isPlayer || /^folk_/.test(String(e.id))) continue; const id = artId(e.id); if (Art.port[id]) Art.prefetch(id, ['neutral', 'happy', 'anger']); }
      Art.prefetch(styled(G.S && G.S.hood && Art.port.ren_hood ? 'ren_hood' : 'ren')); } catch (e) { }
    return r;
  };
})();

/* Emerald Ascension: while it lasts Ren fights in his transformed form (silver dreads, teal aura).
   Going in plays the power-up (gathering light → burst → aura); coming out plays the fade and the exhausted breath. */
(function () {
  const _pi = playerImg;
  playerImg = function () {
    const B = Battle.B, base = _pi();
    if (G.mode !== 'battle' || !B || G.S.kid || !HD.on() || !HD.img.asc) return base;
    const me = B.actors.find(a => a.isMe); if (!me) return base;
    const on = (me.sight || 0) > 0, was = !!B.__ascOn, now = performance.now();
    if (on !== was) { B.__ascOn = on; HD.act = on ? { name: 'transform', t0: now, end: now + 1400 } : { name: 'revert', t0: now, end: now + 1100 }; HD.__actSet = 'asc'; }
    const useAsc = on || (HD.act && HD.act.name === 'revert' && now < HD.act.end);
    if (!useAsc) return base;
    const im = HD.sheet('asc', !!(base && base.__hd && base.__hd.faces !== 'right'));   // face the same way as his normal sheet
    im.__hd.me = 1; return im;
  };
})();

/* ---------- comic cutscenes: your manga page, shown one panel at a time (tap to go on) ---------- */
const Comic = {
  PAGES: {
    // panel rectangles on the 1200x896 page: kneeling → the eyes → eruption → awakened → untouchable → the cut → the form holds
    // every transformation: the eyes open → the light erupts → he stands in the aura
    // like Ren's: the eye splits open → the fire erupts → the monster stands, crowned
    kairo: { src: 'assets/cutscenes/comic_kairo.webp', panels: [[608, 6, 1196, 328], [4, 344, 388, 892], [560, 344, 924, 892]], fx: ['flash', 'shake', 'glow'], hold: 1300 },
    kcrown: { src: 'assets/cutscenes/comic_kairo.webp', panels: [[932, 344, 1196, 570]], fx: ['flash'], hold: 650 },
    asc: { src: 'assets/cutscenes/comic_asc.webp', panels: [[602, 0, 1200, 316], [0, 318, 505, 642], [480, 318, 1010, 642]], fx: ['flash', 'shake', 'glow'], hold: 1300 }
  },
  async play(id) {
    const P = this.PAGES[id]; if (!P) return;
    const img = await loadImg(P.src + '?v=2').catch(() => null); if (!img) return;
    const ov = document.createElement('div'); ov.style.cssText = 'position:fixed;inset:0;z-index:80;background:#05080a;touch-action:none';
    const cv = document.createElement('canvas'), skip = document.createElement('button');
    cv.style.cssText = 'width:100%;height:100%;display:block'; skip.textContent = 'Skip ▶▶';
    skip.style.cssText = 'position:absolute;top:12px;right:12px;padding:8px 14px;border-radius:10px;border:2px solid #2f9a5a;background:#0b1a12;color:#cfe;font:600 14px system-ui';
    ov.append(cv, skip); document.body.append(ov);
    const dpr = Math.min(devicePixelRatio || 1, 2), W = cv.width = innerWidth * dpr, H = cv.height = innerHeight * dpr, x = cv.getContext('2d');
    let i = 0, t0 = performance.now(), done = false, next = null;
    const go = () => { if (done) return; i++; t0 = performance.now(); if (i >= P.panels.length) finish(); };
    const finish = () => { if (done) return; done = true; ov.remove(); next && next(); };
    ov.addEventListener('pointerdown', e => { if (e.target === skip) { finish(); return; } if (performance.now() - t0 > 350) go(); });
    const draw = now => {
      if (done) return;
      const [sx, sy, ex, ey] = P.panels[i], pw = ex - sx, ph = ey - sy, k = Math.min((now - t0) / 600, 1), ease = 1 - Math.pow(1 - k, 3);
      const fit = Math.min(W * .94 / pw, H * .9 / ph) * (1 + .04 * ((now - t0) / 4000)), dw = pw * fit, dh = ph * fit;
      let ox = (W - dw) / 2, oy = (H - dh) / 2; const fx = P.fx[i];
      if (fx === 'shake' && now - t0 < 900) { ox += (Math.random() - .5) * 14 * dpr; oy += (Math.random() - .5) * 10 * dpr; }
      x.fillStyle = '#05080a'; x.fillRect(0, 0, W, H);
      x.globalAlpha = ease; x.imageSmoothingEnabled = P.smooth !== false; x.drawImage(img, sx, sy, pw, ph, ox, oy + (1 - ease) * 18 * dpr, dw, dh); x.globalAlpha = 1;
      x.strokeStyle = '#e8f4ee'; x.lineWidth = 3 * dpr; x.strokeRect(ox, oy + (1 - ease) * 18 * dpr, dw, dh);
      if (fx === 'flash' && now - t0 < 260) { x.fillStyle = `rgba(200,255,235,${.8 * (1 - (now - t0) / 260)})`; x.fillRect(0, 0, W, H); }
      if (fx === 'glow') { const a = .12 + .08 * Math.sin(now / 300); x.fillStyle = `rgba(70,255,190,${a})`; x.globalCompositeOperation = 'lighter'; x.fillRect(ox, oy, dw, dh); x.globalCompositeOperation = 'source-over'; }
      if (fx === 'rain') { x.strokeStyle = 'rgba(200,220,240,.25)'; x.lineWidth = 1 * dpr; for (let r = 0; r < 60; r++) { const rx = ((r * 97 + now * .6) % dw) + ox, ry = ((r * 53 + now * 1.4) % dh) + oy; x.beginPath(); x.moveTo(rx, ry); x.lineTo(rx - 3 * dpr, ry + 12 * dpr); x.stroke(); } }
      if (now - t0 > (P.hold || 2600)) go();
      requestAnimationFrame(draw);
    };
    try { sfx(id === 'asc' ? 'art' : 'swing'); } catch (e) { }
    requestAnimationFrame(draw);
    return new Promise(r => { next = r; });
  }
};
(function () {
  const _ua = Battle.useArt.bind(Battle);
  Battle.useArt = async function (a, k) {
    // the first transformation plays the full page; after that it is just the power-up on the battlefield
    if (k === 'sight' && a && a.isMe && G.S && !G.S.kid && !a.sight) { try { await Comic.play('asc'); } catch (e) { } }
    return _ua(a, k);
  };
})();

/* ---------- Ascended combo: while transformed, Attack becomes a 7-hit chain — every strike a different move, one of them a ranged spirit wave ---------- */
(function () {
  const CHAIN = [
    { v: 'c1', m: .34, name: 'Crescent' }, { v: 'c2', m: .3, name: 'Palm' }, { v: 'c3', m: .34, name: 'Rush Cut', dash: 26 },
    { v: 'c4', m: .32, name: 'Blur Step' }, { v: 'c5', m: .42, name: 'SPIRIT WAVE', wave: 1 }, { v: 'c6', m: .3, name: 'Shield Bash' },
    { v: 'c7', m: .55, name: 'SILVER STORM', fin: 1 }];
  const _da = Battle.doAttack.bind(Battle);
  Battle.doAttack = async function (a, t) {
    if (!(a && a.isMe && (a.sight || 0) > 0 && HD.on() && HD.img.asc && !G.S.kid)) return _da(a, t);
    const B = this.B, close = t.x + (a.side === 'p' ? 52 : -52);
    await this.dash(a, close, t.y + 2, 200);
    let n = 0;
    try {
      for (const h of CHAIN) {
        if (t.ko || !this.B) break;
        if (h.wave) {   // hop back and fire a teal wave across the field
          await this.dash(a, close + (a.side === 'p' ? 70 : -70), t.y + 2, 130);
          HD.forceVar = h.v; const p = this.strike(a, t, { anim: 'slash', m: h.m }, 1, { src: 'attack' });
          await wait(90); if (this.B) { B.fx.push({ beam: 1, blue: 1, x1: a.x + (a.side === 'p' ? -18 : 18), y1: a.y - 34, x2: t.x, y2: t.y - 30, t: 0, life: 420 }); this.spark(t.x, t.y - 30, '#6dffd2', 20); }
          await p; await this.dash(a, close, t.y + 2, 120);
        } else {
          if (h.dash) a.x += a.side === 'p' ? -h.dash : h.dash;
          HD.forceVar = h.v; await this.strike(a, t, { anim: 'slash', m: h.m }, 1, { src: 'attack' });
          if (this.B) this.spark(t.x, t.y - 34, h.fin ? '#e8fff6' : '#6dffd2', h.fin ? 26 : 8);
          if (h.fin && this.B) { B.shake = 10; B.flash = .5; B.flashCol = '120,255,210'; }
        }
        n++;
        await wait(h.fin ? 200 : 90);
      }
    } finally { HD.forceVar = null; }
    if (this.B) await this.home(a);
  };
})();

/* ---------- PHANTOM STRIKE (transformed only, once per transformation): Ren vanishes, appears behind every enemy in turn
   with one precise cut each, reappears at his post — then every cut lands at once. One timing ring decides how clean it is. ---------- */
(function () {
  if (typeof CombatX === 'undefined') return;
  const PHANTOM = async function (a) {
    const B = Battle.B, es = Battle.alive('e'); if (!es.length) return;
    a.phantomUsed = 1; a.mp -= a.__phCost || 0; Battle.hud();
    const x0 = a.x, y0 = a.y, side = a.side === 'p' ? 1 : -1, img = playerImg();
    Battle.text(a, 'PHANTOM STRIKE', '#e8fff6', -70, true); sfx('art'); B.dim = .55; B.dimCol = '0,20,18';
    a.anim = 'combat'; await wait(420);
    const g = await Battle.qte(es[0], 0, '#9fffe0', a);
    // vanish
    B.fx.push({ ghost: 1, x: x0, y: y0, t: 0, life: 420, img, anim: 'combat', fr: 0, s: BT_SCALE, col: '#9fffe0', a0: .7 }); Battle.spark(x0, y0 - 30, '#9fffe0', 24); a.alpha = 0; sfx('pdodge'); await wait(260);
    for (const t of es) {   // blink behind each enemy, cut, gone
      const bx = t.x - side * 46; a.x = bx; a.y = t.y + 2; a.alpha = 1; a.flip = side > 0;
      HD.forceVar = 'c7'; a.anim = 'slash'; a.frame = 3; a.once = true; a.fn = 99; a.fms = 1e9; sfx('swing');
      B.fx.push({ hline: 1, x1: bx + side * 30, x2: t.x - side * 50, y: t.y - 34, t: 0, life: 700 });
      Battle.spark(t.x, t.y - 34, '#e8fff6', 10); await wait(150);
      B.fx.push({ ghost: 1, x: a.x, y: a.y, t: 0, life: 300, img: playerImg(), anim: 'slash', fr: 3, s: BT_SCALE, col: '#9fffe0', a0: .5 }); a.alpha = 0; await wait(110);
    }
    HD.forceVar = null; a.x = x0; a.y = y0; a.flip = false; a.anim = 'combat'; a.alpha = 1; Battle.spark(x0, y0 - 30, '#9fffe0', 16);
    Battle.text(a, '— click —', '#cfe8ff', -50); await wait(420); B.dim = 0;
    const m = g === 'perfect' ? 2.6 : g === 'good' ? 2.1 : 1.5;
    for (const t of es) { if (t.ko) continue; B.flash = .45; B.flashCol = '200,255,235'; Battle.spark(t.x, t.y - 34, '#ffffff', 26); Battle.resolveHit(a, t, m, g, { unblockable: 1, brk: 30, src: 'phantom' }); await wait(90); }
    B.shake = 12; await wait(500);
  };
  const _m = CombatX.menu.bind(CombatX);
  CombatX.menu = function (a, L, done, resolve, reopen) {
    _m(a, L, done, resolve, reopen);
    if (!a.isMe) return;
    if (!a.sight) { a.phantomUsed = 0; return; }
    const cost = a.__phCost = Math.max(4, Math.round(a.maxMp * .3)), ok = !a.phantomUsed && a.mp >= cost && !a.fever && Battle.alive('e').length;
    const i = Math.max(0, L.findIndex(x => /^Ascended/.test(x[0])));
    L.splice(i + 1, 0, ['Phantom Strike',
      a.phantomUsed ? 'PHANTOM STRIKE — already used this transformation.' : `PHANTOM STRIKE — vanish and cut every enemy with one precise slash each; all the cuts land at once and can't be blocked. One timing ring: hit it clean for a deadlier cut. Once per transformation. Costs ${cost} MP.${a.mp < cost ? ' — not enough MP!' : ''}`,
      () => { if (!ok) return; Battle.closeMenu(); PHANTOM(a).then(done); }, !ok, cost]);
  };
})();

/* ---------- Kairo's SCAR BLOOM: the monster form. The crown above him turns a notch and lights a rune each time he adapts. ---------- */
(function () {
  const isK = e => e && /^kairo(_duel|_spar)?$/.test(e.key || '') || (e && e.key === 'kairo_duel');
  const _morph = Battle.morph.bind(Battle);
  Battle.morph = async function (e) {
    if (isK(e) && HD.on() && HD.img.kmon) { try { await Comic.play('kairo'); } catch (x) { } }
    await _morph(e);
    if (isK(e) && HD.on() && HD.img.kmon && this.B) {
      e.__preImg = e.img; const im = HD.sheet('kmon', e.side !== 'e'); e.img = im;
      const now = performance.now(); (HD.acts = HD.acts || {}).kmon = { name: 'transform', t0: now, end: now + 1500 };
    }
  };
  const _un = Battle.unmorph.bind(Battle);
  Battle.unmorph = async function (e) {
    if (e && e.__preImg && HD.img.kmon) { const now = performance.now(); (HD.acts = HD.acts || {}).kmon = { name: 'revert', t0: now, end: now + 1300 }; }
    await _un(e);
    if (e && e.__preImg) { await wait(900); e.img = e.__preImg; e.__preImg = null; }
  };
  const _at = Battle.adaptTick.bind(Battle);
  Battle.adaptTick = async function () {
    const B = this.B; const before = B ? B.actors.map(a => a.wheel || 0) : [];
    await _at();
    if (this.B) this.B.actors.forEach((a, i) => { if ((a.wheel || 0) > (before[i] || 0) && a.__preImg) { if (!this.__kc) { this.__kc = 1; Comic.play('kcrown').finally(() => { this.__kc = 0; }); } const now = performance.now(); (HD.acts = HD.acts || {}).kmon = { name: 'adapt', t0: now, end: now + 900 }; a.crownFlash = now; } });
  };
  // the crown: floats over his head, turns a notch per adaptation (a flash + a lit rune for each one)
  const _r = Battle.render.bind(Battle);
  Battle.render = function (c, t) {
    _r(c, t);
    const B = this.B; if (!B || !HD.img.kmon) return;
    for (const a of B.actors) {
      if (!a.__preImg || a.ko || !(a.morph > 0)) continue;
      const A = HD.acts && HD.acts.kmon; if (A && performance.now() < A.end && A.name !== 'adapt') continue;   // the transform frames draw their own crown
      const M = HD.meta.kmon, fr = M.frames[M.anims.crown[0]], s = BT_SCALE * (a.size || 1), w = 46 * s, k = w / fr[2], h = fr[3] * k;
      const fdir = a.img && a.img.__hd && a.img.__hd.faces === 'left' ? -1 : 1, cx = a.x + (a.kbx || 0) + fdir * 9 * s, cy = a.y - HD.BT_H * s * 1.22 + Math.sin(t / 400) * 2;
      const turn = Math.min(1, (performance.now() - (a.crownFlash || 0)) / 600), sq = turn < 1 ? .55 + .45 * Math.abs(Math.cos(turn * Math.PI)) : 1;
      c.save(); c.translate(cx, cy); c.scale(sq, 1);
      c.drawImage(HD.img.kmon, fr[0], fr[1], fr[2], fr[3], -w / 2, -h / 2, w, h);
      if (turn < 1) { c.globalCompositeOperation = 'lighter'; c.globalAlpha = 1 - turn; c.fillStyle = '#b0ffb0'; c.beginPath(); c.ellipse(0, 0, w * .6, h * .6, 0, 0, 7); c.fill(); }
      c.restore();
      const n = Math.min(8, a.wheel || 0);   // one lit rune per adaptation
      c.save(); c.globalCompositeOperation = 'lighter';
      for (let i = 0; i < 8; i++) { const px = cx - w * .42 + i * w * .12, py = cy + h * .45; c.fillStyle = i < n ? '#7dff7a' : 'rgba(120,160,120,.25)'; c.beginPath(); c.arc(px, py, i < n ? 2.4 : 1.6, 0, 7); c.fill(); }
      c.restore();
    }
  };
})();

/* the perfect-parry finisher: when every hit of a combo is parried, Ren's eyes flare in a cut-in, then the counter-slash */
(function () {
  let eyes = null; loadImg('assets/cutscenes/ren_parry_eyes.png?v=1').then(i => { eyes = i; }).catch(() => {});
  const _msg = Battle.msg.bind(Battle);
  Battle.msg = function (s, ms, hold) {
    if (s === 'COUNTERATTACK!' && HD.on() && G.S && !G.S.kid && HD.meta && HD.meta[HD.playerSet()].anims.ppfin) {
      const now = performance.now(); HD.act = { name: 'ppfin', t0: now, end: now + 900 }; HD.cutin = { t0: now, end: now + 650 };
    }
    return _msg(s, ms, hold);
  };
  const _r = Battle.render.bind(Battle);
  Battle.render = function (c, t) {
    _r(c, t);
    const C = HD.cutin, now = performance.now(); if (!C || now > C.end || !eyes || !this.B) return;
    const W = G.view.w, H = G.view.h, k = (now - C.t0) / (C.end - C.t0), a = k < .15 ? k / .15 : k > .75 ? (1 - k) / .25 : 1;
    const bh = H * .34, by = H * .22, sc = bh / eyes.height * 1.25, w = eyes.width * sc;
    c.save(); c.globalAlpha = a; c.fillStyle = 'rgba(0,0,0,.75)'; c.fillRect(0, by, W, bh);
    c.beginPath(); c.rect(0, by, W, bh); c.clip(); c.imageSmoothingEnabled = false;
    c.drawImage(eyes, W / 2 - w / 2 + (1 - k) * 30, by + bh / 2 - eyes.height * sc * .45, w, eyes.height * sc);
    c.strokeStyle = '#7dffb0'; c.lineWidth = 2; c.globalAlpha = a * .9; c.strokeRect(-2, by, W + 4, bh); c.restore();
  };
})();
