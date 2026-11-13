'use strict';
/* RETIRE THE FOUR (owner's call, 2026-11-12, via Chat C): the Rise / Fall / Wind / Needle combo command is gone from the game —
   Ren's Four Cuts, Liora's Four Lines, Oren's Four Strikes, Kess's Four Shadows, and every named technique built from them
   (Heron Drop, Crescent, Four Seasons, Last Light…). Nothing is deleted: js/fourcuts.js still loads (other systems read it),
   this file only keeps it out of the battle menu, the move bar and Meditation. Remove this script tag to bring it all back. */
(function () {
  if (typeof FOUR === 'undefined') return;
  const isFour = n => /^Four (Cuts|Lines|Strikes|Shadows)\b/.test(String(n || ''));
  const recipeNames = () => {
    const S = new Set();
    for (const r of Object.values(FOUR.REC || {})) for (const n of r.slice(0, 4)) S.add(String(n).toLowerCase());
    try { for (const n of Object.values(FOUR.custom())) S.add(String(n).toLowerCase()); } catch (e) { }
    return S;
  };
  const gone = n => isFour(n) || recipeNames().has(String(n || '').toLowerCase());
  if (typeof CombatX !== 'undefined') {
    const _m = CombatX.menu.bind(CombatX);
    CombatX.menu = function (a, L, done, resolve, reopen) {
      _m(a, L, done, resolve, reopen);
      for (let i = L.length - 1; i >= 0; i--) if (L[i] && gone(L[i][0])) L.splice(i, 1);
    };
  }
  if (typeof MoveBar !== 'undefined') {
    const _mp = MoveBar.medPools.bind(MoveBar);
    MoveBar.medPools = function () {
      const P = _mp();
      for (const k of Object.keys(P)) if (Array.isArray(P[k])) P[k] = P[k].filter(n => !gone(n));
      try { const lo = this.lo(); for (const k of Object.keys(lo)) if (Array.isArray(lo[k])) lo[k] = lo[k].map(n => gone(n) ? '' : n); } catch (e) { }
      return P;
    };
  }
  // the Four's page under Last Light (Stones menu) goes too
  FOUR.menuHTML = function () { return ''; };
})();
