'use strict';
/* TRANSCENSION SPRITES (Chat C) — when a fighter transcends, they switch to their transformed sprite sheet, and switch back when it ends.
   Sets are found by name; a missing set simply means "no swap yet":
     Ren:     ren_t1 (Stage I), ren_t2 (Stage II, already wired by burst.js), ren_t3 (Stage III Dragonoid)
     Heroes:  c_<hero>_t1 / c_<hero>_t2 (falls back to the other stage, e.g. kess has only c_kess_t2 → used for both)
   Cut a Transcension sheet with:  pool_cut.py <sheet> <hero>_t2 battle12   (→ c_<hero>_t2)
   Mechanics (when, how long, stages) stay in Chat A's burst.js; this only changes how they look. */
(function () {
  if (typeof Burst === 'undefined' || typeof HD === 'undefined') return;
  const has = s => HD.meta && HD.meta[s] && HD.img[s];
  const heroOf = a => String(a.key || a.id || '').replace(/^(ge_|gt_)/, '').replace(/_(bt|w|e|r|t)$/, '');
  const pick = (a, st) => {
    if (a.isMe) { const s = 'ren_t' + st; return st !== 2 && has(s) ? s : null; }   // Stage II is burst.js's own swap
    const h = heroOf(a); for (const s of ['c_' + h + '_t' + st, 'c_' + h + '_t2', 'c_' + h + '_t1']) if (has(s)) return s; return null;
  };
  const lift = n => { HD.act = { name: 'land', t0: n, end: n + 900 }; };
  const _f = Burst.fire.bind(Burst);
  Burst.fire = async function (a) {
    let st = 1; try { st = this.stage(a) || 1; } catch (e) { }
    const r = await _f(a);
    try {
      // AURA BURST (stage 1) is a trance, not a transformation: the body stays, the Zone visuals (aurazone.js) carry it.
      if (st === 1) return r;
      const B = Battle.B, set = HD.on() && pick(a, st); if (!B || !set) return r;
      if (a.isMe) { const im = HD.sheet(set, HD.meta[set].faces !== 'left'); im.__hd.me = 1; B.renBts = im; if (HD.meta[set].anims.land) lift(performance.now()); }
      else { if (!a.__preT) a.__preT = a.img; const left = a.side !== 'e'; a.img = HD.sheet(set, (HD.meta[set].faces === 'left') !== left); }
    } catch (e) { }
    return r;
  };
  const _e = Burst.end.bind(Burst);
  Burst.end = function (a) { const r = _e(a); try { if (!a.isMe && a.__preT) { a.img = a.__preT; a.__preT = null; } } catch (e) { } return r; };
})();

/* Cut-in art for the party (Chat C, 2026-11-16): Liora's and Kess's own Transcension cut-ins
   (the glowing-eyes banner + the full figure in their aura), same layout as Ren's. */
(function () {
  if (typeof Burst === 'undefined') return;
  const L = n => { const i = new Image(); i.src = 'assets/burst/' + n; return i; };
  const ART = { liora: { fig: L('liora_fig.png'), ban: L('liora_eyes.jpg') }, kess: { fig: L('kess_fig.png'), ban: L('kess_eyes.jpg') } };
  ART.kessE = ART.kess;
  const _c = Burst.cut.bind(Burst);
  Burst.cut = async function (who, title, sub, col, side) {
    const A = side === 'p' && ART[who]; if (!A || !A.fig.naturalWidth) return _c(who, title, sub, col, side);
    const B = Battle.B; if (!B) return;
    B.cutin = { img: null, fig: A.fig, ban: A.ban, title, sub, col, t0: performance.now(), side }; B.flash = 1; B.flashCol = '255,255,255'; try { sfx('art'); } catch (e) { } B.shake = 10;
    await wait(1250); if (B.cutin && B.cutin.title === title) B.cutin = null;
  };
})();
