/* SPRITE POLISH (Chat C) - the finish that makes the sheets look alive, with no new art.
   2026-11-16 (1)  rim light · white hit-flash + impact squash · attack wind-up/stretch · footstep dust
   2026-11-16 (2)  LIGHT THAT MATCHES THE PLACE: every sprite takes a little of the colour of the map / battle backdrop it stands on,
                   and the rim light follows the sky (warm sun, orange dusk, cool moon, grey rain, pale fog).
                   BATTLE STATES ON THE BODY: elite ◆ affix = a glowing outline in the affix colour, wounded/limping = a red cast and a sag,
                   poisoned = a green pulse, bleeding = red drips, a SHAKEN party trembles, an INSPIRED party stands tall with a gold edge.
                   KAIRO'S BLOOM (story): ash and embers drift off Kairo; more the further the Bloom has spread (foreshadow flags bloom / ash),
                   and a storm of it while Scar Bloom is active.
                   WORLD: NPCs and monsters turn with a quick squash instead of snapping round; idle townsfolk breathe.
   Off switch: G.settings.polish = false, or G.settings.polishOff = { rim, flash, squash, dust, tint, states, ash, turn: true } */
(function () {
  if (typeof HD === 'undefined') return;
  const on = (k) => !(G.settings && (G.settings.polish === false || (G.settings.polishOff && G.settings.polishOff[k])));
  const MAIN = () => document.getElementById('game');
  let FR = 0; (function tick() { FR++; requestAnimationFrame(tick); })();

  /* ---------- cached masks cut from a frame (kind: rim:<col> | col:<col> | glow:<col>) ---------- */
  const CACHE = new WeakMap();
  function mask(img, sx, sy, w, h, kind) {
    let m = CACHE.get(img); if (!m) { m = new Map(); CACHE.set(img, m); }
    const key = kind + '@' + sx + ',' + sy + ',' + w + ',' + h; let cv = m.get(key); if (cv) return cv;
    if (m.size > 1400) m.clear();
    const i = kind.indexOf(':'), type = kind.slice(0, i), col = kind.slice(i + 1), pad = type === 'glow' ? Math.max(3, Math.round(h / 60)) : 0;
    cv = document.createElement('canvas'); cv.width = w + pad * 2; cv.height = h + pad * 2; const x = cv.getContext('2d');
    if (type === 'rim') {
      const d = Math.max(2, Math.round(h / 95)), o = Math.round(d * .6);
      const a = document.createElement('canvas'); a.width = w; a.height = h; const ax = a.getContext('2d');
      ax.drawImage(img, sx, sy, w, h, 0, 0, w, h); ax.globalCompositeOperation = 'destination-out'; ax.drawImage(img, sx, sy, w, h, o, d, w, h);
      // move that edge one outline-width inward: the dark outline stays dark, the light sits on the surface just inside it
      x.drawImage(a, o, o); x.globalCompositeOperation = 'destination-in'; x.drawImage(img, sx, sy, w, h, 0, 0, w, h);
      x.globalCompositeOperation = 'destination-out'; x.drawImage(a, 0, 0);
    } else if (type === 'glow') {
      for (let j = 0; j < 8; j++) { const an = j * Math.PI / 4; x.drawImage(img, sx, sy, w, h, pad + Math.round(Math.cos(an) * pad), pad + Math.round(Math.sin(an) * pad), w, h); }
      x.globalCompositeOperation = 'destination-out'; x.drawImage(img, sx, sy, w, h, pad, pad, w, h);
    } else x.drawImage(img, sx, sy, w, h, 0, 0, w, h);
    x.globalCompositeOperation = 'source-in'; x.fillStyle = col; x.fillRect(0, 0, cv.width, cv.height);
    cv.__pad = pad; m.set(key, cv); return cv;
  }
  const q8 = (v) => Math.max(0, Math.min(255, Math.round(v / 8) * 8));
  const hex = (r, g, b) => '#' + [r, g, b].map(v => q8(v).toString(16).padStart(2, '0')).join('');

  /* ---------- the colour of the place: average of the map picture / battle backdrop, mostly white ---------- */
  const AVG = new WeakMap();
  function avgOf(im) {
    if (!im || !im.width) return null; let a = AVG.get(im); if (a) return a;
    try { const c = document.createElement('canvas'); c.width = c.height = 8; const x = c.getContext('2d'); x.drawImage(im, 0, 0, 8, 8);
      const d = x.getImageData(0, 0, 8, 8).data; let r = 0, g = 0, b = 0; for (let j = 0; j < 256; j += 4) { r += d[j]; g += d[j + 1]; b += d[j + 2]; }
      r /= 64; g /= 64; b /= 64; const mx = Math.max(r, g, b, 1); a = [r / mx, g / mx, b / mx]; } catch (e) { a = [1, 1, 1]; }
    AVG.set(im, a); return a;
  }
  function placeTint() {
    let im = null, k = .16;
    if (G.mode === 'battle' && typeof Battle !== 'undefined' && Battle.B) { im = Battle.B.bd || (G.img && G.img['bd_' + Battle.B.bdKey]); k = .12; }
    else if (G.mode === 'world' && typeof World !== 'undefined') im = World.mapImg;
    const a = avgOf(im); if (!a) return null;
    const c = a.map(v => 255 * (1 - k + k * v)); if (c[0] > 247 && c[1] > 247 && c[2] > 247) return null; return hex(c[0], c[1], c[2]);
  }
  function skyRim() {
    let night = 0, wx = 'clear';
    try { night = typeof Ambient !== 'undefined' ? Ambient.night || 0 : 0; wx = (typeof WorldFeel !== 'undefined' && WorldFeel.weather()) || 'clear'; } catch (e) { }
    const B = typeof Battle !== 'undefined' && Battle.B; if (B) { if (B.night) night = Math.max(night, .7); if (B.wx) wx = B.wx; }
    if (wx === 'rain' || wx === 'storm') return ['#9fb4c8', .26];
    if (wx === 'fog') return ['#d8e0e4', .2];
    if (night > .5) return ['#8fb8ff', .3];
    if (night > .2) return ['#ffb070', .32];   // dusk
    return ['#ffd38a', .3];
  }

  /* ---------- every HD sprite drawn on the game screen takes the place's colour ---------- */
  const _dI = HD.dI.bind(HD); let TINT = null, TINT_T = 0;
  HD.dI = function (c, img, sx, sy, sw, sh, dx, dy, dw, dh) {
    _dI(c, img, sx, sy, sw, sh, dx, dy, dw, dh);
    if (!img || !img.__hd || !c || c.canvas !== MAIN() || !on('tint')) return;
    const now = performance.now(); if (now - TINT_T > 500) { TINT_T = now; try { TINT = placeTint(); } catch (e) { TINT = null; } }
    if (!TINT) return;
    try { const m = mask(img, sx, sy, sw, sh, 'col:' + TINT); c.save(); c.globalCompositeOperation = 'multiply'; c.imageSmoothingEnabled = true; c.drawImage(m, dx, dy, dw, dh); c.restore(); } catch (e) { }
  };

  /* ---------- particles (bleeding drips, Kairo's ash) ---------- */
  const PARTS = [];
  function drawParts(c, now, world, cx, cy) {
    for (let j = PARTS.length - 1; j >= 0; j--) {
      const p = PARTS[j]; if (!!p.world !== !!world) continue; const k = (now - p.t) / p.life; if (k >= 1) { PARTS.splice(j, 1); continue; }
      if (p.fr === FR) continue; p.fr = FR;
      const dt = (now - p.t) / 16; c.globalAlpha = (1 - k) * .8; c.fillStyle = p.col;
      c.fillRect(p.x - (cx || 0) + (p.vx || 0) * dt + Math.sin(dt / 9) * 1.5, p.y - (cy || 0) + p.vy * dt, p.r, p.r);
    }
    c.globalAlpha = 1; if (PARTS.length > 160) PARTS.splice(0, PARTS.length - 160);
  }
  const isKairo = (a, H) => (a && (a.id === 'kairo' || /^kairo/.test(a.key || ''))) || /kairo/.test((H && H.set) || '');
  function bloomLevel() { const f = G.S && G.S.f && G.S.f.fs || {}; return (f.bloom ? 1 : 0) + (f.ash ? 1 : 0); }

  /* ---------- battle: rim, flash, squash, states ---------- */
  const ST = new Map();
  const ATK = /slash|thrust|spellcast|attack|strike|draw|art_|combo|fourdraw|heavy|special/;
  let cur = null;   // the fighter being drawn right now, for blit

  const _blit = HD.blit.bind(HD);
  HD.blit = function (c, img, fr, x, y, h, extra) {
    _blit(c, img, fr, x, y, h, extra);
    if (!cur || !fr || !c) return;
    const k = h / fr[6];
    const draw = (cv, a, op) => {
      const p = cv.__pad || 0;
      c.save(); c.globalAlpha *= a; if (op) c.globalCompositeOperation = op; c.imageSmoothingEnabled = true;
      c.translate(x, y); if (extra && extra.rot) c.rotate(extra.rot); if (extra && extra.sy) c.scale(1, extra.sy);
      c.drawImage(cv, -fr[4] * k - p * k, -fr[5] * k - p * k, cv.width * k, cv.height * k); c.restore();
    };
    try {
      const M = (kind) => mask(img, fr[0], fr[1], fr[2], fr[3], kind);
      if (on('rim') && cur.rim) draw(M('rim:' + cur.rimCol), cur.rim, 'lighter');
      for (const [col, a, op] of cur.layers) draw(M((op === 'glow' ? 'glow:' : 'col:') + col), a, op === 'glow' ? 'lighter' : op);
      if (on('flash') && cur.flash > 0) draw(M('col:#ffffff'), cur.flash);
    } catch (e) { }
  };

  function actorAt(x, y) {
    const B = typeof Battle !== 'undefined' && Battle.B; if (!B) return null;
    for (const a of B.actors) if (Math.abs(a.x - x) < 1.5 && Math.abs(a.y - y) < 1.5) return a; return null;
  }

  const _bt = HD.bt.bind(HD);
  HD.bt = function (c, img, anim, f, x, y, s) {
    const H = img && img.__hd; if (!H) return _bt(c, img, anim, f, x, y, s);
    const now = performance.now(), id = (H.set || '?') + '|' + Math.round(y / 4) + (H.me ? '|me' : '');
    let st = ST.get(id); if (!st) { st = { anim: null, t0: now }; ST.set(id, st); }
    if (st.anim !== anim) { st.anim = anim; st.t0 = now; }
    const age = now - st.t0, main = c.canvas === MAIN(), a = main ? actorAt(x, y) : null, B = typeof Battle !== 'undefined' && Battle.B, S = s || 1;
    let sx = 1, sy = 1, rot = 0, jx = 0;
    if (on('squash')) {
      if (anim === 'hurt' && age < 220) { const q = 1 - age / 220; sx = 1 + .08 * q; sy = 1 - .07 * q; }
      else if (ATK.test(anim) && age < 300) {
        if (age < 80) { const q = age / 80; sx = 1 + .05 * q; sy = 1 - .05 * q; }            // wind-up crouch
        else if (age < 170) { const q = (age - 80) / 90; sx = 1.05 - .08 * q; sy = .95 + .09 * q; }   // snap into the strike
        else { const q = (age - 170) / 130; sx = .97 + .03 * q; sy = 1.04 - .04 * q; }          // settle
      }
    }
    const [rimCol, rimA] = skyRim(), layers = [];
    let rim = H.single || !main ? 0 : rimA, rc = rimCol;
    if (a && on('states') && !a.ko) {
      const pul = .5 + .5 * Math.sin(now / 260);
      if (a.affix && typeof AI4 !== 'undefined' && AI4.AFFIX && AI4.AFFIX[a.affix]) layers.push([AI4.AFFIX[a.affix][1], .35 + .3 * pul, 'glow']);
      if (a.limp) { layers.push(['#a01818', .16, 'source-over']); sy *= .97; rot += (a.side === 'e' ? 1 : -1) * .03; }
      if (a.poison > 0) layers.push(['#6fdc3a', .05 + .09 * pul, 'source-over']);
      if (a.side === 'p' && B) {
        if (B.mor <= -2) jx = Math.sin(now / 35) * .9;                                   // shaken: a small tremble
        if (B.mor >= 2) { sy *= 1.015; rc = '#ffe27a'; rim = Math.max(rim, .4); }        // inspired: stands tall, gold edge
      }
      if (a.bleed > 0 && Math.random() < .08) PARTS.push({ x: x + (Math.random() - .5) * 14, y: y - 30 * S * Math.random(), vy: .4, t: now, life: 700, col: '#b3121a', r: 1.4 });
    }
    if (a && on('ash') && isKairo(a, H) && !a.ko) {
      const L = bloomLevel() + (a.morph > 0 ? 3 : 0);
      if (L && Math.random() < .06 * L) PARTS.push({ x: x + 6 * S + (Math.random() - .5) * 10, y: y - (20 + Math.random() * 30) * S, vy: -.35, vx: .15, t: now, life: 1400, col: Math.random() < .25 ? '#ff7a3a' : '#5a5560', r: 1.3 + Math.random() });
    }
    // TORN-EAR (story, Chapter I): barely grown on the first hunt, bigger on the second, full-grown on the third
    if (a && a.key === 'rx_tornear' && typeof ENEMY !== 'undefined' && ENEMY.rx_tornear) { const n = Math.max(0, Math.min(2, Math.round(((ENEMY.rx_tornear.hp || 60) - 60) / 22))), g = [.78, .9, 1.04][n]; sx *= g; sy *= g; }
    cur = { rim, rimCol: rc, layers, flash: anim === 'hurt' && age < 130 ? .85 * (1 - age / 130) : 0 };
    const feet = y + 2 * S;
    try {
      if (sx !== 1 || sy !== 1 || rot || jx) { c.save(); c.translate(x + jx, feet); if (rot) c.rotate(rot); c.scale(sx, sy); c.translate(-x, -feet); _bt(c, img, anim, f, x, y, s); c.restore(); }
      else _bt(c, img, anim, f, x, y, s);
    } finally { cur = null; }
    if (PARTS.length && main) drawParts(c, now, false);
  };
  setInterval(() => { const t = performance.now(); for (const [k, v] of ST) if (t - v.t0 > 60000) ST.delete(k); }, 30000);

  /* ---------- world: footstep dust, turning, idle breath, Kairo's ash ---------- */
  if (typeof Ent === 'undefined') return;
  const PUFFS = [];
  const _draw = Ent.prototype.draw;
  Ent.prototype.draw = function (c, cx, cy, t) {
    let set = null, kind = null, sx = 1, sy = 1, kai = false;
    const now = performance.now();
    try {
      if (!this.isPlayer && HD.on && HD.on()) { set = HD.setOf && HD.setOf(HD.npcName(this)); kind = set && window.MonWalk ? window.MonWalk.kind(set) : null; }
      if (on('dust') && !this.isPlayer && this.move && set && kind !== 'fly') {
        const gap = this.move.ms < 260 ? 170 : 260;
        if (!this._dust || now - this._dust > gap) { this._dust = now; PUFFS.push({ x: this.px + (Math.random() - .5) * 6, y: this.py + 2, t: now, s: (this.size || 1) * (kind === 'quad' ? 1.3 : 1) }); if (PUFFS.length > 80) PUFFS.shift(); }
      }
      for (let j = PUFFS.length - 1; j >= 0; j--) {
        const p = PUFFS[j], a = (now - p.t) / 420; if (a >= 1) { PUFFS.splice(j, 1); continue; }
        if (Math.abs(p.x - this.px) > 40 || Math.abs(p.y - this.py) > 40) continue;   // each walker draws the puffs near it, under its own sprite
        if (p.drawn === FR) continue; p.drawn = FR;
        c.fillStyle = `rgba(196,178,140,${.28 * (1 - a)})`; c.beginPath();
        c.ellipse(p.x - cx, p.y - cy + 2 - a * 3, (2 + a * 5) * p.s, (1.2 + a * 2.2) * p.s, 0, 0, 7); c.fill();
      }
      kai = on('ash') && !this.isPlayer && (this.id === 'kairo' || /kairo/.test(String(set || ''))) && bloomLevel() > 0;
      if (kai && Math.random() < .05 * bloomLevel())
        PARTS.push({ x: this.px + 4 + (Math.random() - .5) * 8, y: this.py - 10 - Math.random() * 14, vy: -.25, vx: .1, t: now, life: 1300, col: Math.random() < .2 ? '#ff7a3a' : '#5a5560', r: 1 + Math.random() * .8, world: 1 });
      if (!this.isPlayer && on('turn')) {
        if (this._ld !== this.dir) { if (this._ld) this._turnT = now; this._ld = this.dir; }
        if (this._turnT && now - this._turnT < 140) sx = .8 + .2 * ((now - this._turnT) / 140);
        else if (!this.move && set && kind !== 'fly' && kind !== 'quad') sy = 1 + Math.sin(now / 700 + (this.px || 0) * .13) * .012;
      }
    } catch (e) { }
    let r;
    if (sx !== 1 || sy !== 1) {
      const fx = this.px - cx, fy = this.py - cy + 3; c.save(); c.translate(fx, fy); c.scale(sx, sy); c.translate(-fx, -fy);
      try { r = _draw.call(this, c, cx, cy, t); } finally { c.restore(); }
    } else r = _draw.call(this, c, cx, cy, t);
    if (kai) try { drawParts(c, now, true, cx, cy); } catch (e) { }
    return r;
  };
})();
