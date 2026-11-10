/* ================= PAINTED BATTLE EFFECTS =================
   The user's VFX sheets (assets/fx/fx_<sheet>.png + fx.json, cut by art8/cut_fx.py) played over the battle:
   Emerald Fang / Field / Black Flash / hit sparks (ren) · Ghost Stance, echo, Eleventh Step, Wyrmpiercer (liora) ·
   Viper Needle, Shadow Fang, Smoke Veil, Umbral Rain (kess) · Forge Fire, Cleave, Ember Needle, burn (party) ·
   perfect parry, dodge dash (combat) · Eclipse Convergence (eclipse, kept for Chapter II). */
const FXS = {
  meta: null, img: {}, list: [], last: new Map(),
  load() {
    if (this.meta !== null) return; this.meta = 0;
    fetch('assets/fx/fx.json?v=2').then(r => r.json()).then(m => { this.meta = m; for (const k in m) loadImg(`assets/fx/fx_${k}.png?v=2`, true).then(im => { this.img[k] = im; }).catch(() => { }); }).catch(() => { });
  },
  ok(sh) { this.load(); return !!(this.meta && this.img[sh] && this.img[sh].width); },
  // play one row: dur ms for the whole row; frames: optional subset; flip mirrors (sheets face right)
  play(sh, an, x, y, o = {}) {
    if (!this.ok(sh) || !Battle.B) return; const A = this.meta[sh][an]; if (!A) return;
    this.list.push(Object.assign({ sh, an, A, x, y, t0: performance.now(), dur: 600, sc: .55, flip: false, frames: null, al: 1, add: false }, o));
  },
  // a single still frame that pops and fades (hit sparks)
  pop(sh, an, i, x, y, o = {}) { this.play(sh, an, x, y, Object.assign({ frames: [i], dur: 260, pop: 1 }, o)); },
  throttle(key, ms) { const n = performance.now(), l = this.last.get(key) || 0; if (n - l < ms) return false; this.last.set(key, n); return true; },
  draw(c) {
    const B = Battle.B; if (!B) { this.list.length = 0; return; } const now = performance.now();
    this.list = this.list.filter(f => now - f.t0 < f.dur);
    for (const f of this.list) {
      const k = (now - f.t0) / f.dur, fr = f.frames || [...Array(f.A.n).keys()], i = fr[Math.min(fr.length - 1, k * fr.length | 0)];
      const img = this.img[f.sh], A = f.A, sc = f.sc * (f.pop ? .8 + Math.min(1, k * 4) * .35 : 1);
      const x = f.follow ? f.follow.x + (f.dx || 0) : f.x, y = f.follow ? f.follow.y + (f.dy || 0) : f.y;
      c.save(); c.translate(x, y); if (f.flip) c.scale(-1, 1);
      c.globalAlpha = f.al * (f.pop ? 1 - Math.max(0, k - .5) * 2 : f.fadeOut ? 1 - Math.max(0, k - .75) * 4 : 1);
      if (f.add) c.globalCompositeOperation = 'lighter';
      c.imageSmoothingEnabled = true; c.imageSmoothingQuality = 'high';
      c.drawImage(img, i * A.w, A.y, A.w, A.h, -A.w * sc / 2, -A.h * sc * (f.anchor == null ? .5 : f.anchor), A.w * sc, A.h * sc);
      c.restore();
    }
    // burning enemies carry a small flame
    if (this.ok('party')) for (const a of B.actors) if (!a.ko && a.burn > 0) {
      const A = this.meta.party.burn, i = (now / 90 | 0) % A.n, s = .32;
      c.save(); c.globalAlpha = .95; c.drawImage(this.img.party, i * A.w, A.y, A.w, A.h, a.x + 14 - A.w * s / 2, a.y - 70 * (a.size || 1) - A.h * s / 2, A.w * s, A.h * s); c.restore();
    }
  }
};
(function () {
  FXS.load();
  const mid = t => ({ x: t.x, y: t.y - 32 * BT_SCALE * (t.size || 1) / 1.5 });
  // art → [sheet, row, ms, scale, kind] ; kind 'shot' = an arrow that flies into the target
  const ART = { fang: ['ren', 'fang', 520, .6], needle: ['kess', 'needle', 560, .55, 'shot'], shadowfang: ['kess', 'sfang', 620, .6], umbra: ['kess', 'umbra', 760, .6],
    wyrm: ['liora', 'wyrm', 640, .7, 'shot'], cleave: ['party', 'cleave', 560, .55], forgefire: ['party', 'forge', 700, .6], sever: ['ren', 'fang', 520, .6] };
  const _rh = Battle.resolveHit.bind(Battle);
  Battle.resolveHit = function (a, t, m, grade, opts) {
    const r = _rh(a, t, m, grade, opts);
    try {
      if (t && a && !(opts && opts.echo)) {
        const p = mid(t), src = opts && opts.src, D = ART[src] || ART[this.B && this.B.lastArtKey === src ? src : ''], flip = a.side === 'p';
        if (D && FXS.throttle('art' + src + t.id, D[1] === 'umbra' ? 900 : 260)) {
          if (D[4] === 'shot') FXS.play(D[0], D[1], p.x + (flip ? 1 : -1) * 34, p.y, { dur: D[2], sc: D[3], flip });
          else FXS.play(D[0], D[1], p.x, p.y + (D[1] === 'forge' ? 18 : 0), { dur: D[2], sc: D[3], flip });
        } else if (r === 'hit' || r === undefined) {
          const big = grade === 'perfect' || grade === 'crit';
          if (FXS.throttle('spark' + t.id, 90)) FXS.pop('ren', 'spark', t.side === 'p' ? 4 : big ? 1 : 0, p.x + (Math.random() - .5) * 14, p.y + (Math.random() - .5) * 14, { sc: big ? .62 : .45 });
        }
      }
    } catch (e) { }
    return r;
  };
  // timing feedback & Liora's arts, keyed off the battle's own call-outs
  const _tx = Battle.text.bind(Battle);
  Battle.text = function (a, s, ...rest) {
    try {
      if (a && typeof s === 'string') {
        const p = mid(a), flip = a.side === 'p';
        if (s === 'PERFECT PARRY') { FXS.play('combat', 'parry', p.x, p.y, { dur: 560, sc: .5 }); FXS.pop('ren', 'spark', 2, p.x + (flip ? -18 : 18), p.y, { sc: .55 }); }
        else if (s === 'PARRY') FXS.pop('ren', 'spark', 2, p.x + (flip ? -18 : 18), p.y, { sc: .45 });
        else if (s === 'PERFECT DODGE') FXS.play('combat', 'dash', p.x + (flip ? 30 : -30), p.y + 18, { dur: 520, sc: .5, flip: !flip });
        else if (s === 'DODGE') FXS.pop('ren', 'spark', 5, p.x, a.y - 6, { sc: .4 });
        else if (s === 'GHOST') FXS.play('liora', 'echo', p.x + 30, p.y, { dur: 420, sc: .5, flip: true });
        else if (/^GHOST STANCE/.test(s)) FXS.play('liora', 'ghost', a.x, a.y - 40, { dur: 900, sc: .55, follow: a, dx: 0, dy: -40 });
        else if (/^THE ELEVENTH STEP/.test(s)) FXS.play('liora', 'eleven', p.x, p.y, { dur: 900, sc: .7 });
        else if (/^BLACK FLASH/.test(s) && Battle.B && Battle.B.bflash) { const b = Battle.B.bflash; FXS.play('ren', 'bflash', b.x, b.y, { dur: 620, sc: .9 }); }
      }
    } catch (e) { }
    return _tx(a, s, ...rest);
  };
  // field and veil play over whoever they cover
  const _ua = Battle.useArt;
  Battle.useArt = async function (a, k) {
    try {
      if (k === 'ward') for (const p of this.alive(a.side)) FXS.play('ren', 'field', p.x, p.y + 6, { dur: 900, sc: .5, anchor: .85, frames: [0, 1, 1, 1], follow: p, dx: 0, dy: 6, fadeOut: 1 });
      if (k === 'veil') FXS.play('kess', 'veil', a.x, a.y - 30, { dur: 800, sc: .6 });
    } catch (e) { }
    return _ua.apply(this, arguments);
  };
  const _r = Battle.render.bind(Battle);
  Battle.render = function (c, t) { const out = _r(c, t); try { FXS.draw(c); } catch (e) { } return out; };
})();
