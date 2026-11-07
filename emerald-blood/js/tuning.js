/* Difficulty tuning — EXP is 4x harder to earn, every enemy and rival has 3x health */
const XP_RATE = 0.25, FOE_HP = 3;
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
