/* Difficulty tuning — EXP at its normal rate (XP_RATE), every enemy and rival has 3x health (FOE_HP) */
const XP_RATE = 1, FOE_HP = 3;
(function () {
  const inner = Story.gainXp;
  // already-scaled amounts (battle wins, banked EXP released at a breakthrough) go straight through
  Story.gainXpRaw = function (n) { return inner.call(this, n); };
  Story.gainXp = function (n) {
    const S = G.S; const v = n * XP_RATE + (S.xpFrac || 0), w = Math.floor(v); S.xpFrac = v - w;
    return w > 0 ? inner.call(this, w) : false;
  };
  Story.xpShow = n => Math.max(1, Math.round(n * XP_RATE));
  const mk = Battle.mk;
  Battle.mk = function (o) {
    if (o && o.side === 'e' && o.maxHp > 0 && !o.hp3) { o.hp = Math.round(o.hp * FOE_HP); o.maxHp = Math.round(o.maxHp * FOE_HP); o.hp3 = 1; }
    return mk.call(this, o);
  };
})();
