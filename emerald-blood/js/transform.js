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
      const B = Battle.B, set = HD.on() && pick(a, st); if (!B || !set) return r;
      if (a.isMe) { const im = HD.sheet(set, HD.meta[set].faces !== 'left'); im.__hd.me = 1; B.renBts = im; if (HD.meta[set].anims.land) lift(performance.now()); }
      else { if (!a.__preT) a.__preT = a.img; const left = a.side !== 'e'; a.img = HD.sheet(set, (HD.meta[set].faces === 'left') !== left); }
    } catch (e) { }
    return r;
  };
  const _e = Burst.end.bind(Burst);
  Burst.end = function (a) { const r = _e(a); try { if (!a.isMe && a.__preT) { a.img = a.__preT; a.__preT = null; } } catch (e) { } return r; };
})();
