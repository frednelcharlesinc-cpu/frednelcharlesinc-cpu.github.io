/* ================= THE WILD BITES BACK =================
   · Monsters get more turns: every monster is quicker, and a lone monster or a boss acts more often still.
   · Rare roamers: any random encounter in the wild has a chance to be something else entirely — a stronger or rarer
     monster, never the same few, picked from everything at or just above your rank.
   · BERSERK (alphas, kings, mothers, lords, wardens and bosses only): below 35% health it goes berserk —
     harder, faster, reckless, and it often acts twice in a row. */
const WILD = {
  POOL: { E: ['m_goblin', 'm_ratfolk', 'm_gourd', 'lupine'], D: ['lupine_alpha', 'rime_lupine', 'm_goblin_shaman', 'm_skeleton', 'm_ghoul', 'm_tusker', 'sw_rat'],
    C: ['mana_wyrm', 'rime_alpha', 'm_lizard', 'm_orc', 'm_troll', 'sw_brute', 'sw_ooze', 'sw_ghoul'], B: ['m_minotaur', 'm_wartotaur', 'm_vampire', 'm_drake', 'reef_stalker', 'sw_spider', 'sw_gator'],
    A: ['reef_drake', 'm_minotaur', 'm_wartotaur'] },
  R: ['E', 'D', 'C', 'B', 'A', 'S'],
  roll(cfg) {
    const me = Math.min(4, Power.now().i), up = Math.random() < .35 ? 1 : 0, r = this.R[Math.min(4, me + up)];
    const pool = (this.POOL[r] || []).filter(k => ENEMY[k]); if (!pool.length) return null;
    const S = G.S; S.seenRare = S.seenRare || {}; const fresh = pool.filter(k => !(cfg.enemies || []).includes(k));
    const k = (fresh.length ? fresh : pool)[Math.random() * (fresh.length || pool.length) | 0];
    return { k, r };
  }
};
(function () {
  // 1) more turns
  const _mk = Battle.mk;
  Battle.mk = function (o) {
    if (o && o.side === 'e' && !o.wildSpd && G.S && !G.S.kid) { o.wildSpd = 1; try { const n = (Battle.B && Battle.B.cfg && Battle.B.cfg.enemies || []).length || 1, boss = o.E && o.E.boss;
      o.spd = Math.round((o.spd || 10) * (1.18 + (n === 1 ? .17 : 0) + (boss ? .1 : 0)) * 10) / 10; } catch (e) { } }
    return _mk.call(this, o);
  };
  // 2) rare roamers
  const _st = Battle.start.bind(Battle);
  Battle.start = function (cfg) {
    try {
      if (cfg && cfg.ambushRoll && !G.S.kid && !cfg.boss && Math.random() < .1) {
        const R = WILD.roll(cfg);
        if (R) { const tag = WILD.R.indexOf(R.r) > Power.now().i ? 'A dangerous' : 'A rare'; cfg.enemies = [R.k]; cfg.intro = `${tag} ${ENEMY[R.k].name} is roaming here!`;
          setTimeout(() => toast(`<b style="color:#ffb86a">${tag} monster:</b> ${ENEMY[R.k].name} (${R.r}-rank) — not from these parts.`, 3200), 200); }
      }
    } catch (e) { }
    return _st(cfg);
  };
  // 3) berserk — alphas only
  const apex = e => e && e.side === 'e' && (DIFF.isApex(e) || /alpha|king|mother|queen|lord|warden|wyrm/.test(e.key || '')) && !(e.E && e.E.fixed);
  const _rh = Battle.resolveHit.bind(Battle);
  Battle.resolveHit = function (a, t, m, grade, opts) {
    const r = _rh(a, t, m, grade, opts);
    try { if (t && apex(t) && !t.ko && !t.berserk && t.hp < t.maxHp * .35) t.pendBerserk = 1; } catch (e) { }
    return r;
  };
  const _et = Battle.enemyTurn.bind(Battle);
  Battle.enemyTurn = async function (e) {
    try {
      if (e.pendBerserk && !e.berserk && !e.ko) { e.pendBerserk = 0; e.berserk = 1; const B = this.B;
        B.dim = .55; B.dimCol = '60,0,0'; B.shake = 14; sfx('break');
        await this.msg(`${e.name} goes BERSERK!`, 1300); B.dim = 0; B.flash = 1; B.flashCol = '255,40,40';
        e.atk = Math.round(e.atk * 1.35); e.spd += 4; e.def = Math.max(0, (e.def || 0) - 3); e.brk = 0; e.brkMax = Math.round((e.brkMax || 60) * 1.5); e.size = (e.size || 1) * 1.08;
        this.text(e, 'BERSERK', '#ff3a3a', -60, true); this.spark(e.x, e.y - 30, '#ff3a3a', 30); }
    } catch (er) { }
    const r = await _et(e);
    try {
      if (e.berserk && !e.ko && this.B && this.alive('p').length && !this.B.over && Math.random() < .45 && !e.__again) {
        e.__again = 1; this.text(e, 'FRENZY', '#ff5a5a', -50); await wait(250); try { await _et(e); } finally { e.__again = 0; } }
    } catch (er) { }
    return r;
  };
  const _r = Battle.render.bind(Battle);
  Battle.render = function (c, t) { const out = _r(c, t); try { const B = this.B; if (B) for (const e of B.actors) if (e.berserk && !e.ko) { c.save(); c.globalCompositeOperation = 'lighter'; const g = c.createRadialGradient(e.x, e.y - 30, 4, e.x, e.y - 30, 60); g.addColorStop(0, `rgba(255,30,30,${.3 + Math.sin(t / 90) * .1})`); g.addColorStop(1, 'rgba(255,30,30,0)'); c.fillStyle = g; c.beginPath(); c.arc(e.x, e.y - 30, 62, 0, 7); c.fill(); c.restore(); } } catch (e) { } return out; };
})();
