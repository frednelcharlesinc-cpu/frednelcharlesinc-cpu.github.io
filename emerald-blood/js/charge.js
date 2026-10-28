'use strict';
/* CHARGED ATTACKS — mostly an enemy thing. A strong foe stops and gathers power for a few rounds (a glowing aura and a countdown
   over its head), then unleashes one devastating rapid-fire barrage. The rings come fast: only constant parries, dodges and
   perfect dodges get you through it. Break the charger's guard before it finishes and the charge collapses. */
const Charge = {
  NAMES: { blade: ['Thousand Cuts', 'Storm of Steel', 'Execution Dance'], beast: ['Frenzy', 'Rending Storm', 'Blood Rush'], magic: ['Cataclysm', 'Starfall Barrage', 'Ruin Cascade'] },
  styleOf(e) {
    const sk = (e.E && e.E.skills) || [], an = sk.flatMap(s => (s.hits || []).map(h => h.anim));
    if (/lupine|wolf|drake|wyrm|troll|minotaur|tusker|rat/.test(e.key || '')) return 'beast';
    return an.includes('spellcast') ? 'magic' : 'blade';
  },
  eligible(e) {
    const B = Battle.B; if (!B || B.tutorial || e.side !== 'e' || e.ko || e.charge) return false;
    const ti = Math.max(0, ['E', 'D', 'C', 'B', 'A', 'S', 'SS', 'SSS', 'SSSS'].indexOf(TIER[e.key] || 'E'));
    const strong = ti >= 2 || (e.E && e.E.elite) || B.cfg.boss || /^(rb_|lt_|b_)/.test(e.key || '');
    if (!strong || (e.chargeCd || 0) > B.turn) return false;
    return Math.random() < (B.cfg.boss ? .22 : .16) + ti * .02;
  },
  begin(e) {
    const B = Battle.B, st = this.styleOf(e);
    e.charge = { left: 2 + (Math.random() < .4 ? 1 : 0), name: pick(this.NAMES[st]), style: st, t0: performance.now() };
    e.chargeCd = B.turn + 9;
    sfx('charge'); Battle.text(e, `CHARGING ${e.charge.name.toUpperCase()}`, '#ff9a3a', -70, true);
    return Battle.msg(`${e.name} is gathering power… ${e.charge.left} turns until ${e.charge.name}! Break its guard to stop it.`, 1500);
  },
  barrage(e) {
    // 7–10 quick hits; each window is tight, with snaps and feints mixed in, and a heavy final blow
    const n = 7 + Math.floor(Math.random() * 4), hits = [], A = Charge.styleOf(e) === 'magic' ? ['spellcast', 'slash'] : ['slash', 'halfslash', 'thrust'];
    for (let i = 0; i < n; i++) {
      const last = i === n - 1, r = Math.random();
      hits.push({ anim: last ? 'backslash' : A[i % A.length], m: last ? 1.5 : .62, w: last ? 380 : 300 + Math.floor(Math.random() * 60),
        style: last ? 'normal' : r < .22 ? 'snap' : r < .34 ? pick(typeof FEINTS !== 'undefined' ? FEINTS : ['feint']) : 'normal' });
    }
    return { name: e.charge.name, hits, charged: 1 };
  }
};
(function () {
  const BT = Battle;
  const _et = BT.enemyTurn.bind(BT);
  BT.enemyTurn = async function (e) {
    const B = this.B;
    if (e.charge) {
      if (e.broken) { e.charge = null; this.text(e, 'CHARGE BROKEN!', '#7dffb0', -70, true); sfx('break'); return; }
      e.charge.left--;
      if (e.charge.left > 0) {   // still gathering: nothing else happens this turn
        e.anim = 'spellcast'; e.frame = 2; e.once = true; e.fn = 99; e.fms = 1e9; sfx('charge');
        this.text(e, `${e.charge.left}…`, '#ff9a3a', -80, true);
        await this.msg(`${e.name}'s power keeps building — ${e.charge.left} turn${e.charge.left > 1 ? 's' : ''} left!`, 1100);
        e.anim = 'combat'; return;
      }
      const sk = Charge.barrage(e); e.charge = null;
      B.dim = .45; B.dimCol = '60,10,0'; B.shake = 12; sfx('art');
      await this.msg(`${e.name} unleashes ${sk.name}!`, 900);
      const targets = this.alive('p'), t = targets.find(a => a.isMe) || targets[0];
      if (t) { e.tempoSave = e.tempo; e.tempo = Math.min(e.tempo || 1, .92); await this.enemyStrike(e, t, sk, true); e.tempo = e.tempoSave; }
      B.dim = 0; return;
    }
    if (Charge.eligible(e)) { await Charge.begin(e); e.anim = 'spellcast'; e.frame = 2; e.once = true; e.fn = 99; e.fms = 1e9; await wait(300); e.anim = 'combat'; return; }
    return _et(e);
  };
  // the aura + countdown over a charging enemy
  const _r = BT.render.bind(BT);
  BT.render = function (c, t) {
    _r(c, t);
    const B = this.B; if (!B) return;
    for (const e of B.actors) {
      if (!e.charge || e.ko) continue;
      const k = Math.min(1, (performance.now() - e.charge.t0) / 600), pul = .5 + .5 * Math.sin(t / 110), s = (e.size || 1) * BT_SCALE;
      c.save(); c.globalCompositeOperation = 'lighter';
      const g = c.createRadialGradient(e.x, e.y - 30 * s, 4, e.x, e.y - 30 * s, (46 + pul * 10) * s);
      g.addColorStop(0, `rgba(255,150,60,${.35 * k})`); g.addColorStop(1, 'rgba(255,60,20,0)'); c.fillStyle = g; c.fillRect(e.x - 80 * s, e.y - 100 * s, 160 * s, 130 * s);
      for (let i = 0; i < 6; i++) { const a = t / 300 + i, rr = (30 + (t / 8 + i * 17) % 40) * s; c.fillStyle = `rgba(255,${120 + i * 15},40,${.5 * k})`; c.fillRect(e.x + Math.cos(a) * rr * .6, e.y - 10 * s - ((t / 6 + i * 23) % (70 * s)), 2.5, 2.5); }
      c.restore();
      c.save(); c.font = '900 20px "Nunito"'; c.textAlign = 'center'; c.lineWidth = 4; c.strokeStyle = '#000'; c.fillStyle = '#ffb04a';
      const y = e.y - 100 * s; c.strokeText(`⚡${e.charge.left}`, e.x, y); c.fillText(`⚡${e.charge.left}`, e.x, y);
      c.font = '800 9px "Nunito"'; c.lineWidth = 3; c.strokeText(e.charge.name.toUpperCase(), e.x, y + 13); c.fillStyle = '#ffd9a0'; c.fillText(e.charge.name.toUpperCase(), e.x, y + 13); c.restore();
    }
  };
})();
