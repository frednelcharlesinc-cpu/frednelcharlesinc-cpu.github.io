'use strict';
/* ================= RIVAL POWER, BLOODLUST =================
   Kairo always stands exactly where you stand — and one full rank higher in Scar Bloom.
   The Green Eclipse founders sit one or two colour-bands below him.
   Bloodlust (unlocked at power grade A): weaker monsters flee from you — but now and then something much stronger answers. */
const R8 = ['E', 'D', 'C', 'B', 'A', 'S', 'SS', 'SSS', 'SSSS'];
const stepOf = () => { const p = Power.now(); return p.i * 3 + p.band; };          // E-green = 0 … SSS-red = 23
const stepGrade = st => { st = Math.max(0, Math.min(26, st)); return { i: Math.floor(st / 3), band: st % 3, grade: R8[Math.floor(st / 3)] }; };
const stepBadge = st => { const g = stepGrade(st); return `<span class="grade" style="--gc:${BAND_COL[g.band]}">${g.grade}</span> <span class="muted">${BAND_NAME[g.band]}</span>`; };
const GE_GAP = { tamsin: 1, dace: 1, corran: 1, sefa: 2, bo: 2, lark: 2, wren: 2 };
const Rivals = {
  kairo(morphed) { return stepOf() + (morphed ? 3 : 0); },
  ge(id) { return this.kairo() - (GE_GAP[id] || 2); }
};
// Kairo's tier in battle follows you
Object.defineProperty(TIER, 'kairo_duel', { configurable: true, enumerable: true,
  get() { const m = Battle.B && Battle.B.actors.some(a => a.key === 'kairo_duel' && a.morphed); return stepGrade(Rivals.kairo(m)).grade; } });
// ...and so do his stats: scale him to your power at the start of the fight
(function () {
  const _run = Battle.run.bind(Battle);
  Battle.run = function () {
    const B = this.B;
    if (B) for (const a of B.actors) if (a.key === 'kairo_duel' && !a.scaled) {
      a.scaled = 1; const k = 1 + Math.max(0, Power.now().i - 2) * .22;
      a.maxHp = Math.round(a.maxHp * k); a.hp = a.maxHp; a.atk = Math.round(a.atk * k); a.def = Math.round(a.def * (1 + (k - 1) * .6));
    }
    return _run();
  };
})();

/* ---------- Bloodlust ---------- */
const Bloodlust = {
  unlocked() { return !!(G.S && !G.S.kid && Power.now().i >= 4); },
  on() { return this.unlocked() && !!G.S.bloodlust; },
  toggle() {
    if (!this.unlocked()) { toast('Bloodlust awakens at power grade A.'); return; }
    G.S.bloodlust = !G.S.bloodlust; sfx(G.S.bloodlust ? 'alarm' : 'blip');
    toast(G.S.bloodlust ? '<b style="color:#ff5a4a">BLOODLUST</b> — your killing intent pours out. Weak monsters will flee… and strong ones may come looking.' : 'You draw your killing intent back in.', 3400); UI.hud(); save();
  },
  strongPool() {
    const me8 = Power.now().i;
    return Object.keys(ENEMY).filter(k => /^(m_|bq_)/.test(k) && !/bq_(highwayman|redeye|gnasher)/.test(k) && R8.indexOf(TIER[k] || 'E') >= Math.min(me8, 5));
  },
  filter(enc) {
    if (!enc || !this.on()) return enc;
    const me8 = Power.now().i, top = Math.max(0, ...enc.enemies.map(k => R8.indexOf(TIER[k] || 'E')));
    if (Math.random() < .12) { // something stronger answers the call
      const P = this.strongPool(); if (P.length) { const k = P[Math.floor(Math.random() * P.length)]; setTimeout(() => toast('<b style="color:#ff5a4a">Your bloodlust drew something out of the dark…</b>', 2600), 50);
        return Object.assign({}, enc, { enemies: Math.random() < .35 && P.length > 1 ? [k, P[Math.floor(Math.random() * P.length)]] : [k], intro: 'IT HUNTS YOU BACK' }); }
    }
    if (top < me8 - 1) { const msgs = ['Something in the grass takes one look at you and bolts.', 'Eyes in the dark… and then they\'re gone. They felt you coming.', 'A pack starts toward you — then scatters, whimpering.'];
      toast(msgs[Math.floor(Math.random() * msgs.length)], 2200); return null; }
    return enc;
  }
};
// tell the player the moment it awakens
(function () {
  const _g = Story.gainXp;
  Story.gainXp = function (n) { const was = Bloodlust.unlocked(); const r = _g.call(this, n); if (!was && Bloodlust.unlocked()) setTimeout(() => toast('<b style="color:#ff5a4a">BLOODLUST UNLOCKED</b> — at power grade A your killing intent can be felt. Toggle it with the Bloodlust button.', 5200), 2800); return r; };
})();
