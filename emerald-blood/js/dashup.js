/* ================= THE DASH GROWS WITH YOU =================
   Every aura colour: a minor upgrade — a little faster, a little higher, one more afterimage every two colours,
   a trail in your colour, and +1% damage on the strike that follows the dash.
   Every grade: a major upgrade — the dash crosses its next threshold (new shock rings, light-lines, flashes, arrival bursts)
   and the post-dash strike gains +5%. Kess dashes three colours ahead of Ren. */
(function () {
  const G8 = ['E', 'D', 'C', 'B', 'A', 'S', 'SS', 'SSS', 'SSSS'];
  const powerOf = a => {
    if (a.side === 'p') {
      if (a.id === 'kess' && typeof kessGrade === 'function') { const k = kessGrade(); return { i: GRADES.indexOf(k.grade), band: k.band }; }
      const p = Power.now(); return { i: p.i, band: p.band };                       // Ren, and every ally who fights beside him, grows with him
    }
    const key = a.key || '';
    if (typeof Rivals !== 'undefined' && typeof stepGrade === 'function') {        // rivals climb the colours right alongside Ren
      if (/^kairo/.test(key)) { const g = stepGrade(Rivals.kairo(!!a.morphed)); return { i: g.i, band: g.band }; }
      const m = key.match(/^ge_(\w+?)_r$/); if (m) { const g = stepGrade(Rivals.ge(m[1])); return { i: g.i, band: g.band }; }
    }
    const t = typeof TIER !== 'undefined' && TIER[key]; const i = Math.max(0, G8.indexOf(t || 'E'));
    return { i, band: (a.E && a.E.band) || (a.E && a.E.boss ? 4 : 1) };           // everyone else: their grade, bosses mid-aura
  };
  Battle.dashBand = function (a) { const p = powerOf(a); return p ? p.band : -1; };
  Battle.dashRank = function (a) { const p = powerOf(a); return p ? p.i + p.band * .05 : this.rankOf(a); };
  const _dash = Battle.dash.bind(Battle);
  Battle.dash = async function (a, x, y, ms) {
    const r = await _dash(a, x, y, ms);
    const p = powerOf(a); if (p && a.side === 'p' && !(a.x === a.hx && a.y === a.hy)) a.dashBuff = 1 + p.band * .01 + p.i * .05;
    return r;
  };
  const _strike = Battle.strike.bind(Battle);
  Battle.strike = function (a, t, hit, mult, opts) {
    if (a.dashBuff) { mult = (mult || 1) * a.dashBuff; a.dashBuff = 0; }
    return _strike(a, t, hit, mult, opts);
  };
})();
