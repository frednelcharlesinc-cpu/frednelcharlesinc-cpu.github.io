/* ================= THE DASH GROWS WITH YOU =================
   Every aura colour: a minor upgrade — a little faster, a little higher, one more afterimage every two colours,
   a trail in your colour, and +1% damage on the strike that follows the dash.
   Every grade: a major upgrade — the dash crosses its next threshold (new shock rings, light-lines, flashes, arrival bursts)
   and the post-dash strike gains +5%. Kess dashes three colours ahead of Ren. */
(function () {
  const powerOf = a => {
    if (a.side !== 'p' || !(a.isMe || (G.S.party || []).includes(a.id))) return null;
    if (a.id === 'kess' && typeof kessGrade === 'function') { const k = kessGrade(); return { i: GRADES.indexOf(k.grade), band: k.band }; }
    const p = Power.now(); return { i: p.i, band: p.band };
  };
  Battle.dashBand = function (a) { const p = powerOf(a); return p ? p.band : -1; };
  Battle.dashRank = function (a) { const p = powerOf(a); return p ? p.i + p.band * .08 : this.rankOf(a); };
  const _dash = Battle.dash.bind(Battle);
  Battle.dash = async function (a, x, y, ms) {
    const r = await _dash(a, x, y, ms);
    const p = powerOf(a); if (p && !(a.x === a.hx && a.y === a.hy)) a.dashBuff = 1 + p.band * .01 + p.i * .05;
    return r;
  };
  const _strike = Battle.strike.bind(Battle);
  Battle.strike = function (a, t, hit, mult, opts) {
    if (a.dashBuff) { mult = (mult || 1) * a.dashBuff; a.dashBuff = 0; }
    return _strike(a, t, hit, mult, opts);
  };
})();
