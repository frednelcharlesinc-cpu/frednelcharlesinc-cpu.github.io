/* ================= KESS — the big sister, the spymaster, the best knife in the vale =================
   Kess grows with Ren but always burns three colours ahead of him (she's had twelve years of practice).
   Her kit: fast multi-hit knives, a shadow that hits every enemy, a smoke veil, and an execution strike. */
(function () {
  const K = ALLY.kess; if (!K) return;
  /* three colours above Ren */
  const kessStep = () => { const p = Power.now(); return Math.min(GRADES.length * 6 - 1, p.cstep + 3); };
  const kessGrade = () => { const c = kessStep(); return { grade: GRADES[Math.floor(c / 6)], band: c % 6 }; };
  window.kessGrade = kessGrade;
  Object.defineProperty(K, 'lvUp', { configurable: true, get: () => 2 });               // three colours ≈ a step and a half of stats
  K.badge = () => { const g = kessGrade(); return `<span class="grade" style="--gc:${BAND_COL[g.band]}">${g.grade}</span> <span class="muted" style="font-size:12px">${BAND_NAME[g.band]}</span>`; };
  Object.assign(K, { hp: 58, mp: 24, atk: 13, def: 4, spd: 17 });

  /* her arts */
  Object.assign(ARTS, {
    shadowfang: { name: 'Shadow Fang Flurry', strain: 40, mp: 6, desc: 'Kess blurs in and out of the enemy\'s shadow: five knife strikes, the last one ×1.6. Pierces parries.', type: 'hit',
      hits: [{ anim: 'slash', m: .7 }, { anim: 'halfslash', m: .7 }, { anim: 'slash', m: .7 }, { anim: 'halfslash', m: .7 }, { anim: 'backslash', m: 1.6 }], brk: 20, pierce: 1 },
    umbra: { name: 'Umbral Rain', strain: 50, mp: 8, desc: 'She throws a fan of shadow-knives into the air. They fall on EVERY enemy — three timed volleys.', type: 'all',
      hits: [{ anim: 'spellcast', m: .8 }, { anim: 'spellcast', m: .8 }, { anim: 'spellcast', m: 1.1 }], brk: 10 },
    nightfall: { name: 'Nightfall', strain: 60, mp: 10, desc: 'The killing blow from nowhere. One strike ×3.2 that ignores defence and parries. Twelve years of hiding, in one cut.', type: 'hit',
      hits: [{ anim: 'thrust', m: 3.2, glow: 1 }], brk: 30, pierce: 1 }
  });
  Object.defineProperty(K, 'arts', { configurable: true, get() {
    const f = (G.S && G.S.f) || {}; const L = ['needle', 'shadowfang', 'veil', 'umbra'];
    if (f.kessOath || f.millDone) L.push('nightfall');
    return L;
  } });
  /* her shadows always reach every enemy — no grade gate */
  const _aoe = Battle.aoeOk.bind(Battle);
  Battle.aoeOk = function (a) { if (a && a.id === 'kess') return true; return _aoe(a); };
})();
