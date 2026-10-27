'use strict';
/* Detailed battle sprites (Craftpix "Shinobi" pack — free licence, craftpix.net/file-licenses):
   Ren fights as the Samurai, Kairo as the Shinobi, Dace as the Fighter. Sheets are laid out like the LPC battle rows,
   so every effect (afterimages, tints, Scar Bloom) works on them; an extra row holds a full 6-frame idle loop. */
const BTS = {
  img: {},
  load(k) { if (!this.img[k]) this.img[k] = loadImg('assets/bt/' + k + '.png').then(i => { i.__idle6 = 1; this.img[k] = i; return i; }).catch(() => (this.img[k] = null)); return this.img[k]; },
  ready(k) { const v = this.img[k]; return v && !(v instanceof Promise) ? v : null; },
  kind(a) {
    if (a.isMe) return G.S && !G.S.kid && !(G.settings && G.settings.classicBattle) ? 'samurai' : null;
    if (G.settings && G.settings.classicBattle) return null;
    const k = String(a.key || a.id || '');
    if (/^kairo(?!_spar|_kid)/.test(k)) return 'shinobi';
    if (/dace/.test(k)) return 'fighter';
    return null;
  }
};
['samurai_L', 'samurai_R', 'shinobi_L', 'shinobi_R', 'fighter_L', 'fighter_R', 'robe_L', 'robe_R'].forEach(k => BTS.load(k));
(function () {
  const assign = function (B) {
    try {
      if (B && !B.btsAll) {
        let all = 1;
        for (const a of B.actors) {
          if (a.btsDone) continue;
          const k = BTS.kind(a);
          if (!k) { if (a.isMe) { a.btsDone = 1; continue; } const c = BLD.battle(a); if (c === 0) continue; if (c) a.img = c; a.btsDone = 1; continue; }
          const img = BTS.ready(k + (a.side === 'e' ? '_R' : '_L')); if (!img) { all = 0; BTS.load(k + (a.side === 'e' ? '_R' : '_L')); continue; }
          if (a.isMe) B.renBts = img; else a.img = img; a.btsDone = 1;
        }
        if (all && B.actors.every(a => a.btsDone)) B.btsAll = 1;
      }
    } catch (e) { }
  };
  const _ui = Battle.ui.bind(Battle);
  Battle.ui = function (on) { if (on) assign(this.B); return _ui(on); };
  const _hud = Battle.hud.bind(Battle);
  Battle.hud = function () { assign(this.B); return _hud(); };
  const _pi = playerImg;
  playerImg = function () { const B = Battle.B; if (G.mode === 'battle' && B && B.renBts && !G.S.kid) return B.renBts; return _pi(); };
  const _d = drawBT;
  drawBT = function (c, img, anim, f, x, y, s) {
    if (img && img.__cbt) { s = s || 1; const row = anim === 'combat' ? 1280 : BT_ROW[anim] * 128, fr = anim === 'combat' ? Math.floor(performance.now() / 125) % 6 : f; c.drawImage(img, fr * 128, row, 128, 128, Math.round(x - 64 * s), Math.round(y - 92 * s), 128 * s, 128 * s); return; }
    if (img && img.__idle6 && anim === 'combat') { s = s || 1; const fr = Math.floor(performance.now() / 125) % 6; c.drawImage(img, fr * 128, 2048, 128, 128, Math.round(x - 64 * s), Math.round(y - 92 * s), 128 * s, 128 * s); return; }
    return _d(c, img, anim, f, x, y, s);
  };
})();

/* ---------- the same detailed sprites walk the overworld ---------- */
(function () {
  const OWK = .84, ROW = { walk: 768 + 8 * 128, run: 768 + 9 * 128, idle: 2048 };
  const kindOf = e => {
    if (G.settings && G.settings.classicBattle) return null;
    if (e.isPlayer) return G.S && !G.S.kid ? 'samurai' : null;
    const s = String(e.sprite || e.id || '');
    const town = typeof townOf === 'function' && townOf(G.S && G.S.map); // in towns Green Eclipse keep their green hoods
    if (/^kairo(_b)?$/.test(s)) return town ? null : 'shinobi';
    if (/^ge_dace(_w|_c|_cw)?$/.test(s) || e.id === 'dace') return town ? null : 'fighter';
    if (town && typeof GE_SPR !== 'undefined' && GE_SPR.some(g => s.startsWith(g))) return null;
    return BLD.human(s) ? 'custom' : null;
  };
  const _draw = Ent.prototype.draw;
  Ent.prototype.draw = function (c, cx, cy, t) {
    const k = kindOf(this);
    if (k) {
      if (this.dir === 'left' || this.dir === 'right') this.face = this.dir;
      const left = (this.face || (this.isPlayer ? 'right' : 'left')) === 'left';
      if (k === 'custom') {
        const cv = BLD.ow(this);
        if (cv) {
          const x = this.px - cx, y = this.py - cy;
          if (x < -60 || y < -10 || x > G.view.w + 60 || y > G.view.h + 90) return;
          c.fillStyle = 'rgba(0,0,0,.24)'; c.beginPath(); c.ellipse(x, y, 11, 4, 0, 0, 7); c.fill();
          let row, f;
          if (this.move && this.move.ms < 160) { row = 1; f = Math.floor(this.walkT / (this.move.ms / 3.4)) % 8; }
          else if (this.move) { row = 0; f = Math.floor(this.walkT / (this.move.ms / 3.2)) % 9; }
          else { row = 2; f = Math.floor((t + this.x * 97) / 140) % 6; }
          const s = OWK * (this.size || 1);
          c.save(); if (this.alpha != null) c.globalAlpha = this.alpha;
          if (left) { c.translate(x, 0); c.scale(-1, 1); c.translate(-x, 0); }
          c.drawImage(cv, f * 128, row * 128, 128, 128, Math.round(x - 64 * s), Math.round(y - 94 * s + 2), Math.round(128 * s), Math.round(128 * s));
          c.restore(); return;
        }
        return _draw.call(this, c, cx, cy, t);
      }
      const img = BTS.ready(k + (left ? '_L' : '_R'));
      if (img) {
        const x = this.px - cx, y = this.py - cy;
        if (x < -60 || y < -10 || x > G.view.w + 60 || y > G.view.h + 90) return;
        c.fillStyle = 'rgba(0,0,0,.24)'; c.beginPath(); c.ellipse(x, y, 11, 4, 0, 0, 7); c.fill();
        let row, f;
        if (this.move && this.move.ms < 160) { row = ROW.run; f = Math.floor(this.walkT / (this.move.ms / 3.4)) % 8; }
        else if (this.move) { row = ROW.walk; f = Math.floor(this.walkT / (this.move.ms / 3.2)) % 9; }
        else { row = ROW.idle; f = Math.floor((t + this.x * 97) / 140) % 6; }
        const s = OWK * (this.size || 1);
        c.save(); if (this.alpha != null) c.globalAlpha = this.alpha;
        c.drawImage(img, f * 128, row, 128, 128, Math.round(x - 64 * s), Math.round(y - 94 * s + 2), Math.round(128 * s), Math.round(128 * s));
        c.restore(); return;
      }
    }
    return _draw.call(this, c, cx, cy, t);
  };
})();

/* ---------- everyone gets the same build: every human NPC is a recoloured Craftpix body ----------
   Colours (hair, skin, top, trousers) are read from their old sprite, so each person stays recognisable. */
const BLD = {
  ow_: {}, bt_: {}, col_: {},
  human(n) { return !!n && !/^(m_|b_|lupine|rime_|mana_|kid|dkid|cat|dog|chicken|horse|dread$|will_)|_kid|kidb?$|_h$|_ch$|^kairo|^ge_dace|^bt\//.test(n); },
  G: {
    fighter: { hair: ['#fa6a0a', '#f9a31b'], top: ['#477d85'], pants: ['#3a3f5e', '#1b2447', '#14121d'], skin: ['#e9b5a3', '#8f4d57', '#71413b'] },
    shinobi: { hair: ['#3b2027', '#7d3833'], top: ['#2f5753', '#283540', '#1b1f21'], pants: ['#2b2b45', '#404973', '#14182e', '#14121d'], skin: ['#e9b5a3', '#8f4d57'] },
    robe: { hair: ['#1b2447', '#14121d'], top: ['#242234', '#3a3f5e'], pants: [], skin: ['#e9b5a3', '#bd6a62', '#ba756a'] }
  },
  colors(name, img) {
    if (this.col_[name]) return this.col_[name];
    try {
      const cv = document.createElement('canvas'); cv.width = 64; cv.height = 64; const x = cv.getContext('2d');
      x.drawImage(img, 0, 640, 64, 64, 0, 0, 64, 64); const d = x.getImageData(0, 0, 64, 64).data;
      const mode = (x0, y0, x1, y1, skin) => { const m = {}; for (let y = y0; y < y1; y++) for (let xx = x0; xx < x1; xx++) { const i = (y * 64 + xx) * 4; if (d[i + 3] < 200) continue; const r = d[i], g = d[i + 1], b = d[i + 2], l = r * .3 + g * .59 + b * .11; if (l < 34) continue; if (skin && !(r > g && g >= b * .8)) continue; const k = (r >> 3) + ',' + (g >> 3) + ',' + (b >> 3); m[k] = (m[k] || 0) + 1; } let best = null, n = 0; for (const k in m) if (m[k] > n) { n = m[k]; best = k; } return best ? best.split(',').map(v => v * 8 + 4) : null; };
      const c = { hair: mode(20, 6, 44, 18), skin: mode(26, 20, 38, 30, true), top: mode(22, 33, 42, 43), pants: mode(24, 45, 40, 54) };
      let h = 0; for (const ch of name) h = (h * 31 + ch.charCodeAt(0)) >>> 0;
      const near = (a, b) => a && b && Math.abs(a[0] - b[0]) + Math.abs(a[1] - b[1]) + Math.abs(a[2] - b[2]) < 60;
      c.tmpl = near(c.top, c.pants) ? 'robe' : h % 2 ? 'fighter' : 'shinobi';
      return (this.col_[name] = c);
    } catch (e) { return null; }
  },
  lut(tmpl, c) {
    const L = {}, hx = s => [parseInt(s.slice(1, 3), 16), parseInt(s.slice(3, 5), 16), parseInt(s.slice(5, 7), 16)], lum = a => a[0] * .3 + a[1] * .59 + a[2] * .11 + 1;
    for (const [grp, list] of Object.entries(this.G[tmpl])) {
      const tgt = c[grp]; if (!tgt || !list.length) continue;
      const ref = Math.max(...list.map(s => lum(hx(s))));
      for (const s of list) { const k = lum(hx(s)) / ref; L[hx(s).join(',')] = tgt.map(v => Math.max(0, Math.min(255, Math.round(v * (.35 + .75 * k))))); }
    }
    return L;
  },
  paint(src, sx, sy, w, h, lut) {
    const cv = document.createElement('canvas'); cv.width = w; cv.height = h; const x = cv.getContext('2d');
    x.drawImage(src, sx, sy, w, h, 0, 0, w, h); const im = x.getImageData(0, 0, w, h), d = im.data;
    for (let i = 0; i < d.length; i += 4) { if (!d[i + 3]) continue; const n = lut[d[i] + ',' + d[i + 1] + ',' + d[i + 2]]; if (n) { d[i] = n[0]; d[i + 1] = n[1]; d[i + 2] = n[2]; } }
    x.putImageData(im, 0, 0); return cv;
  },
  ow(e) {
    const name = String(e.sprite || e.id), key = name;
    if (this.ow_[key] !== undefined) return this.ow_[key];
    const img = e.img; if (!img || !img.width) return null;
    const c = this.colors(name, img); if (!c) return (this.ow_[key] = null);
    const T = BTS.ready(c.tmpl + '_R'); if (!T) { BTS.load(c.tmpl + '_R'); return null; }
    const lut = this.lut(c.tmpl, c), cv = document.createElement('canvas'); cv.width = 9 * 128; cv.height = 3 * 128; const x = cv.getContext('2d');
    [[768 + 8 * 128, 0], [768 + 9 * 128, 1], [2048, 2]].forEach(([sy, r]) => x.drawImage(this.paint(T, 0, sy, 9 * 128, 128, lut), 0, r * 128));
    return (this.ow_[key] = cv);
  },
  battle(a) {
    const name = String(a.spr || a.key || a.id); if (!this.human(name) || !a.img || !a.img.width) return null;
    const side = a.side === 'e' ? '_R' : '_L', key = name + side;
    if (this.bt_[key]) return this.bt_[key];
    const c = this.colors(name, a.img); if (!c) return null;
    const T = BTS.ready(c.tmpl + side); if (!T) { BTS.load(c.tmpl + side); return 0; }
    const cv = this.paint(T, 0, 768, 13 * 128, 1408, this.lut(c.tmpl, c)); cv.__cbt = 1;
    const keys = Object.keys(this.bt_); if (keys.length > 6) delete this.bt_[keys[0]];
    return (this.bt_[key] = cv);
  }
};
// tinted copies (flashes, ghosts, Scar Bloom) keep the compact layout
(function () { const _t = tinted; tinted = function (img, col) { const r = _t(img, col); if (img && img.__cbt) r.__cbt = 1; if (img && img.__idle6) r.__idle6 = 1; return r; }; })();
