/* =====================================================================
   COMBAT II — round 3
   · DUEL MODE: when Ren stands alone against one rival or boss, a new option
     appears — ⚔ DUEL EXCHANGE. Read their tell, choose Strike / Feint / Guard
     (Strike beats Feint, Feint beats Guard, Guard beats Strike). Both of you meet
     in the middle; the winner of the exchange lands a punishing blow.
   · BLOODLINE AWAKENING: the first time Ren falls below 40% HP in a boss fight,
     a memory breaks through — Nana, Kairo, Vane, Ilya. Choose RAGE or CALM.
   ===================================================================== */
const DUEL_WEIGHTS = { kairo: [.5, .3, .2], vane: [.2, .3, .5], halvard: [.4, .2, .4], tamsin: [.3, .5, .2], dace: [.6, .2, .2], corran: [.2, .2, .6], wren: [.3, .45, .25], cael: [.45, .2, .35] };
const DUEL_TELLS = [["their grip tightens on the hilt", "their weight rolls onto the front foot"], ["their eyes flick to your left", "their shoulders drop, too casually"], ["they settle low, blade up", "they breathe in and wait"]];
const DUEL_NAMES = ['Strike', 'Feint', 'Guard'];
const CombatX3 = {
  duelOk() {
    const B = Battle.B; if (!B || B.cfg.leafTrain || B.cfg.tutorial) return null;
    const foes = Battle.alive('e'), mates = Battle.alive('p').filter(a => !a.isMe);
    if (foes.length !== 1 || mates.length) return null;
    const e = foes[0]; if (e.E.fixed || e.panic) return null;
    const rival = (typeof RIVAL_KEYS !== 'undefined' && RIVAL_KEYS.includes(e.key)) || e.E.boss;
    return rival ? e : null;
  },
  personality(e) { const k = (typeof GE_RIVAL !== 'undefined' && GE_RIVAL[e.key]) || (e.key || '').split('_')[0]; return DUEL_WEIGHTS[k] || [.34, .33, .33]; },
  async exchange(a, e, done) {
    const BT = Battle, B = BT.B; BT.closeMenu();
    B.used = B.used || [0, 0, 0];
    // the enemy decides, leaning on their nature — and on what you keep doing
    const w = this.personality(e).slice(); const fav = B.used.indexOf(Math.max(...B.used)); if (Math.max(...B.used) >= 2) w[(fav + 2) % 3] += .3; // they learn to beat your habit
    let r = Math.random() * w.reduce((s, x) => s + x, 0), ec = 0; for (let i = 0; i < 3; i++) { if ((r -= w[i]) < 0) { ec = i; break; } }
    const sight = !!a.sight, honest = sight || Math.random() < .65, shown = honest ? ec : (ec + 1 + Math.floor(Math.random() * 2)) % 3;
    B.letter = 1; B.duelZoom = 1; sfx('chant');
    await BT.msg(`${sight ? '◉ ' : ''}${e.name}: ${pick(DUEL_TELLS[shown])}…`, 1300, true);
    const pickP = await new Promise(res => BT.openMenu([
      ['Strike', 'Fast and direct. Beats a Feint. Loses to a Guard.', () => res(0)],
      ['Feint', 'Draw them out. Beats a Guard. Loses to a Strike.', () => res(1)],
      ['Guard', 'Wait for it. Beats a Strike. Loses to a Feint.', () => res(2)]
    ], false));
    BT.closeMenu(); B.used[pickP]++;
    // both meet in the middle
    const mx = (a.x + e.x) / 2;
    const p1 = BT.dash(a, mx + 26, a.y, 220), p2 = BT.dash(e, mx - 26, e.y, 220); await Promise.all([p1, p2]);
    a.anim = 'slash'; BT.play(a, 'slash', 6, 40); e.anim = 'slash'; e.frame = 3;
    sfx('pparry'); B.flash = .55; B.flashCol = '255,250,230'; B.hitstop = 220; B.punch = .08; B.punchX = mx; B.punchY = a.y - 30; B.shake = 10;
    BT.text({ x: mx, y: a.y + 40 }, 'CLASH', '#ffe36a', -40, true);
    BT.text(a, DUEL_NAMES[pickP].toUpperCase(), '#c9ffd8', -70); BT.text(e, DUEL_NAMES[ec].toUpperCase(), '#ffb4a8', -70);
    for (let i = 0; i < 3; i++) BT.spark(mx + rnd(-6, 6), a.y - 34 + rnd(-6, 6), i ? '#fff3a0' : '#fff', 18);
    await wait(650);
    const win = pickP === ec ? 0 : ((pickP + 1) % 3 === ec ? 1 : -1); // Strike(0)>Feint(1)>Guard(2)>Strike(0)
    if (win === 1) {
      await BT.msg(`You read ${e.name} perfectly!`, 700);
      const g = await BT.qte(e, 0, '#7dffb0', a);
      a.anim = 'slash'; BT.play(a, 'slash', 6, 40);
      BT.resolveHit(a, e, g === 'perfect' ? 2.1 : g === 'good' ? 1.6 : 1, g === 'miss' ? 'good' : g, { unblockable: 1, src: 'duel', brk: 25 });
      if (typeof Chain !== 'undefined') Chain.add(2); G.S.f.duelWins = (G.S.f.duelWins || 0) + 1;
    } else if (win === -1) {
      await BT.msg(`${e.name} saw it coming!`, 700);
      await BT.home(a);
      if (!e.ko) await BT.enemyStrike(e, a, { name: 'Punish', hits: [{ anim: 'slash', m: 1.3, w: 560 }] }, true);
    } else {
      await BT.msg('Blades lock — neither gives an inch!', 900);
      if (typeof Clash !== 'undefined') { B.letter = 0; B.duelZoom = 0; B.clashCd = 0; await Clash.run(a, e, 'blade'); done(); return; }
      for (const x of [a, e]) { const d = Math.max(1, Math.round(x.maxHp * .06)); BT.damage(x, d, false); }
    }
    await wait(250); B.letter = 0; B.duelZoom = 0;
    await Promise.all([BT.home(a), e.ko ? Promise.resolve() : BT.home(e)]);
    done();
  },
  // ---------------- memories ----------------
  memoryFor(B) {
    const keys = B.actors.filter(x => x.side === 'e').map(x => x.key || '');
    if (keys.some(k => k.startsWith('halvard'))) return { bg: 'villageFire', lines: ['Smoke. Screaming. The night Thornvale burned.', ['Nana', 'Hold the fire in your hand, child. Never in your heart.']] };
    if (keys.some(k => k.startsWith('kairo'))) return { bg: 'ridgeSunset', lines: ['Two boys on a ridge at sunset, keeping score in the dirt.', ['Kairo', "Forty-two to one, brother. You'll never catch me."]] };
    if (keys.some(k => k.startsWith('vane'))) return { bg: 'cliffAurora', lines: ['Aurora over the frozen forest. An old man who never once raised his voice.', ['Vane', 'Throwing is easy, pup. Learn to PULL first.']] };
    if (keys.some(k => typeof GE_RIVAL !== 'undefined' && GE_RIVAL[k])) return { bg: 'hut', lines: ["Nana's hut. Honey and smoke.", ['Nana', 'Our people have been hated before. Hate never once kept us alive, child. Each other did.']] };
    return { bg: 'hut', lines: ['A green ribbon, tied in a terrible knot.', ['Ilya', 'So you can always find me.']] };
  },
  async awaken(a) {
    const BT = Battle, B = BT.B; B.awakened = 1;
    const M = this.memoryFor(B);
    sfx('cutin'); B.flash = 1; B.flashCol = '255,255,255'; await wait(250);
    try { await Cine.play([{ bg: M.bg, fx: ['embers'], dur: 2600, tapEnds: true, fadeIn: 200, cam: [[0, 320, 200, 1.1], [5000, 330, 205, 1.2]], lines: M.lines }]); } catch (e) { }
    const c = await new Promise(res => BT.openMenu([
      ['RAGE', 'Let the blood answer. +40% ATK for the rest of the fight — but DEF −30% and your blood runs hot (Strain +30). Your eyes blaze.', () => res(0)],
      ['CALM', 'Breathe, like he taught you. Heal 30% HP, +6 MP, and your timing windows widen 25% for the rest of the fight.', () => res(1)]
    ], false));
    BT.closeMenu();
    if (c === 0) {
      a.atk = Math.round(a.atk * 1.4); a.def = Math.round(a.def * .7); a.strain = Math.min(a.strainMax, a.strain + 30); a.rage = 1;
      BT.text(a, 'RAGE — THE BLOOD ANSWERS', '#ff6a4a', -70, true); B.flash = .5; B.flashCol = '255,60,40'; sfx('crit'); BT.spark(a.x, a.y - 30, '#ff6a4a', 30);
      if (!G.S.hood || (typeof Veil !== 'undefined' && Veil.on())) BT.text(a, 'Green fire in your eyes', '#7dffb0', -50);
      for (const e of BT.alive('e')) if (typeof CombatX !== 'undefined') CombatX.shake(e, 40);
    } else {
      const h = Math.round(a.maxHp * .3); a.hp = Math.min(a.maxHp, a.hp + h); a.mp = Math.min(a.maxMp, a.mp + 6); a.calmAw = 1;
      BT.text(a, 'STILL WATER', '#9fe4ff', -70, true); BT.text(a, `+${h} HP · +6 MP`, '#9fe4ff', -50); sfx('heal'); B.flash = .4; B.flashCol = '160,230,255'; BT.spark(a.x, a.y - 30, '#9fe4ff', 24);
    }
    G.S.f.awakenings = (G.S.f.awakenings || 0) + 1; BT.hud();
  }
};

(function () {
  const BT = Battle;
  // add the duel option at the top of Ren's menu
  if (typeof CombatX !== 'undefined') {
    const _m = CombatX.menu.bind(CombatX);
    CombatX.menu = function (a, L, done, resolve, reopen) {
      _m(a, L, done, resolve, reopen);
      if (a.isMe) { const e = CombatX3.duelOk(); if (e) L.splice(1, 0, ['⚔ Duel Exchange', `One on one with ${e.name}. Read the tell, pick Strike / Feint / Guard. Win the exchange and land a punishing blow; lose it and they punish you.`, () => CombatX3.exchange(a, e, done)]); }
    };
  }
  // awakenings come at the start of Ren's turn
  const _pt = BT.playerTurn.bind(BT);
  BT.playerTurn = async function (a) {
    const B = this.B;
    try {
      if (a.isMe && !B.awakened && !G.S.kid && !B.cfg.leafTrain && !B.cfg.tutorial && a.hp > 0 && a.hp < a.maxHp * .4 &&
        (B.cfg.boss || B.actors.some(x => x.side === 'e' && (x.E.boss || (typeof GE_RIVAL !== 'undefined' && GE_RIVAL[x.key])))) && !B.actors.some(x => x.side === 'e' && x.E.fixed)) await CombatX3.awaken(a);
    } catch (e) { console.warn(e); }
    return _pt(a);
  };
  const _rf = BT.reflex.bind(BT);
  BT.reflex = function (a) { let k = _rf(a); if (a && a.calmAw) k *= 1.25; return k; };
  // duel close-up: the camera leans in during an exchange
  const _r = BT.render.bind(BT);
  BT.render = function (c, t) {
    const B = this.B; if (!B || !B.duelZoom) return _r(c, t);
    const me = this.me(), e = this.alive('e')[0]; if (!me || !e) return _r(c, t);
    const cx = (me.x + e.x) / 2, cy = me.y - 30, z = 1.18;
    c.save(); c.translate(G.view.w / 2, G.view.h * .55); c.scale(z, z); c.translate(-cx, -cy); _r(c, t); c.restore();
  };
})();
