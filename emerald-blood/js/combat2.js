/* =====================================================================
   COMBAT II — round 1
   · STANCE (Ren): Sheathed ⇄ Drawn. Sheathed = Vane's way: wider defence windows,
     counters hit 50% harder, Empty Sleeve can't punish you. Drawn = +15% attack,
     perfect hits add 2 to your CHAIN, but tighter defence windows.
   · MORALE: ordinary foes lose nerve — allies falling, finishers, a blazing pair of
     green eyes. Shaken → PANIC: they beg or run. Spare them (Hope) or cut them
     down (Fear).
   · BATTLE CRIES: enemies shout before their moves; the cry tells you the rhythm.
   · TAG MOVES: after your Attack, a nearby ally can jump in — tap on the ring.
   · FORESIGHT: while Ascension's Sight is up, you see a ghost of each attack before
     it comes. Meeting a foreseen blow perfectly pays back MP and CHAIN.
   · BOSSES ADAPT: perfect parries/dodges against a boss teach it; it starts mixing
     feints and snap strikes. Vane mirrors your last Art back at you.
   ===================================================================== */
const HUMANOID = /^(bandit|rook|acolyte|reg_captain|inq_clerk|stone_hunter|tollman|guard_r|voss|m_ratfolk|bq_)/;
const BEAST = /^(lupine|rime_lupine|mana_wyrm|m_gourd)/;
const CombatX = {
  B() { return Battle.B; },
  // ---------------- the turn menu ----------------
  menu(a, L, done, resolve, reopen) {
    const B = this.B(), gi = L.findIndex(x => x[0] === 'Guard'), at = gi >= 0 ? gi : L.length;
    const add = (...it) => L.splice(at, 0, it);
    if (a.isMe && !G.S.kid && G.S.f.vaneDone) {
      const st = a.stance2 || 'sheathed';
      L.push([`Stance: ${st === 'sheathed' ? 'Sheathed ◐' : 'Drawn ◑'}  ⇄`, st === 'sheathed'
        ? "SHEATHED — Vane's way. Defence windows +15%, counters hit 50% harder, and the Empty Sleeve can't punish you. Switching is free and doesn't end your turn."
        : 'DRAWN — Blade out. Attacks +15%, perfect hits add 2 to your CHAIN, but defence windows -10%. Switching is free and doesn\'t end your turn.',
        () => { a.stance2 = st === 'sheathed' ? 'drawn' : 'sheathed'; sfx(a.stance2 === 'drawn' ? 'swing' : 'parry'); Battle.text(a, a.stance2 === 'drawn' ? 'BLADE DRAWN' : '— click — SHEATHED', a.stance2 === 'drawn' ? '#ffd36a' : '#cfe8ff', -40); reopen(); }]);
    }
    const panicked = Battle.alive('e').filter(e => e.panic);
    if (a.isMe && panicked.length) add('Spare them', `${panicked.length > 1 ? 'They are' : (panicked[0].name + ' is')} begging. Let ${panicked.length > 1 ? 'them' : 'them'} run. (The vale hears about mercy.)`, async () => { Battle.closeMenu(); await this.spare(panicked); done(); });
    if (typeof CombatX2 !== 'undefined') CombatX2.menu(a, L, done, resolve, reopen, add);
  },
  // ---------------- morale ----------------
  moraleOf(e) { return e.side === 'e' && !e.E.boss && !e.E.fixed && !e.E.drag && (HUMANOID.test(e.key) || BEAST.test(e.key)) && !(typeof GE_RIVAL !== 'undefined' && GE_RIVAL[e.key]); },
  shake(e, n, why) {
    if (!this.moraleOf(e) || e.ko || e.panic) return;
    e.morale = (e.morale ?? 100) - n;
    if (e.morale <= 40 && !e.shaken) { e.shaken = 1; Battle.text(e, 'SHAKEN', '#ffb87a', -46); }
    if (e.morale <= 0) { e.panic = 1; sfx('alarm'); Battle.text(e, BEAST.test(e.key) ? 'COWERS' : 'PANIC!', '#ff9a5a', -58, true); this.shout(e, BEAST.test(e.key) ? '*whimper*' : pick(['Please! I yield!', 'Not like this—!', "I've got children!", 'Gods, those EYES—', "It's not worth the silver!"]), 1800); }
  },
  async spare(list) {
    const B = this.B(), f = G.S.f;
    for (const e of list) { this.shout(e, BEAST.test(e.key) ? '*flees*' : pick(['Thank you… thank you—', 'I owe you my life.', "I'll tell them you let me go.", 'I won\'t forget this.']), 1600); }
    await wait(700);
    for (const e of list) await this.flee(e);
    if (!B.spared && list.some(e => HUMANOID.test(e.key))) { B.spared = 1; if (typeof Opinion !== 'undefined') Opinion.add('hope', .5); f.spared = (f.spared || 0) + list.length; }
  },
  async flee(e) {
    const x0 = e.x; e.panic = 2; e.flip = true; e.anim = 'run'; e.once = false; e.loopAnim = 'run';
    for (let k = 0; k <= 20; k++) { e.x = x0 - k * 18; e.alpha = 1 - k / 20; await wait(22); }
    e.ko = true; e.fled = 1; e.hp = 0; e.alpha = 0; Battle.hud();
  },
  // ---------------- battle cries ----------------
  shout(a, s, ms) { const B = this.B(); if (!B) return; B.shouts = (B.shouts || []).filter(x => x.a !== a); B.shouts.push({ a, s, t0: performance.now(), life: ms || 1500 }); },
  cry(e, sk) {
    const n = sk.hits.length, proj = sk.hits.some(h => h.proj), unp = sk.hits.some(h => h.unp), mag = sk.hits.some(h => h.anim === 'spellcast');
    const nm = (e.key || '').split('_')[0];
    const Lines = {
      bandit: ['Your purse or your—', 'Hold still!', 'Get him!'], rook: ['Sand in your eyes, friend!', 'Dance for me!'], acolyte: ['By the Lantern!', 'Burn, heretic!', 'Be cleansed!'],
      halvard: ['KNEEL.', 'The fire forgives.', 'Judgment!'], voss: ['Phalanx — FORM!', 'Hold the line!'], vane: ['Watch the snow, pup.', 'Too slow.', 'Breathe.'],
      kairo: ['Keep up, brother!', 'Forty-THREE!', "Don't blink."], ge: ['For the cages!', 'Green Eclipse!', 'No chains!'], reg: ['By order of the Registry!', 'In the name of the Crown!']
    };
    let L = Lines[nm] || (typeof GE_RIVAL !== 'undefined' && GE_RIVAL[e.key] ? Lines.ge : null);
    let s;
    if (unp) s = pick(['NOW!', "You can't stop THIS!", 'Take it!']);
    else if (n >= 3) s = ['One — two — THREE!', 'One, two, three, FOUR!', 'And — again — AND AGAIN!'][Math.min(2, n - 3)] || 'Again! Again!';
    else if (n === 2) s = pick(['One — two!', 'Left — RIGHT!', 'Twice!']);
    else if (proj) s = pick(['Loose!', 'Catch!', 'Duck, if you can!']);
    else if (mag) s = pick(['By the Lantern—', 'Burn!', 'Feel this!']);
    else if (L) s = pick(L);
    if (BEAST.test(e.key)) s = n >= 3 ? 'GRRAAH—RRAH—RAH!' : n === 2 ? 'Grr—RAH!' : '*snarl*';
    if (s && (Math.random() < .75 || n >= 3 || unp || e.E.boss)) this.shout(e, s, 1500);
  },
  // ---------------- tag moves ----------------
  TAGS: {
    dace: ['DOOR-BREAKER', 'Dace grabs you by the collar and THROWS you.', '#3f9a5a'], tamsin: ['EMBER EDGE', "Tamsin's blade catches fire against yours.", '#ff8a3a'],
    kess: ['NEEDLE STORM', 'Kess vanishes — needles from every shadow.', '#b08aff'], liora: ['MOON WALTZ', 'Liora spins past you, spear first.', '#ff9ccc'], oren: ['ANVIL DROP', "Oren's hammer comes down where you point.", '#c87a3a']
  },
  async tag(a, t) {
    const B = this.B(); if (!B || t.ko || B.cfg.leafTrain) return;
    const ally = Battle.alive('p').find(x => !x.isMe && this.TAGS[x.id] && !x.ko && !x.broken);
    if (!ally || (B.tagCd || 0) > B.turn) return;
    if (Math.random() > (B.chain >= 3 ? .85 : .55)) return;
    B.tagCd = B.turn + 4;
    const [nm, line, col] = this.TAGS[ally.id];
    this.shout(ally, pick(['NOW!', 'With you!', 'Together!', 'Behind you!']), 1200);
    await Battle.msg(`TAG — ${ally.name} jumps in! Tap on the ring!`, 700, true);
    const g = await Battle.qte(t, 0, col, a);
    if (g === 'miss') { Battle.text(ally, 'OUT OF SYNC', '#bbb', -40); return; }
    B.letter = 1; sfx('counter'); Battle.text(a, nm, col, -70, true);
    await Battle.dash(ally, t.x + 58, t.y + 2, 200);
    ally.anim = ally.atkAnim || 'slash'; Battle.play(ally, ally.anim, ally.anim === 'thrust' ? 8 : 6, 45);
    Battle.spark(t.x, t.y - 30, col, 26); B.flash = .3;
    Battle.resolveHit(ally, t, g === 'perfect' ? 1.6 : 1.15, 'good', { unblockable: 1, src: 'tag', brk: 18 });
    if (!t.ko) { await wait(140); a.anim = 'slash'; Battle.play(a, 'slash', 6, 40); Battle.resolveHit(a, t, g === 'perfect' ? 1.2 : .8, 'good', { unblockable: 1, src: 'tag' }); }
    if (typeof Chain !== 'undefined') Chain.add(g === 'perfect' ? 2 : 1);
    await wait(250); await Battle.home(ally);
  }
};

(function () {
  const BT = Battle;
  /* ---------- stance effects ---------- */
  const _rf = BT.reflex.bind(BT);
  BT.reflex = function (a) { let k = _rf(a); if (a && a.isMe && a.stance2) k *= a.stance2 === 'drawn' ? .9 : 1.15; if (a && a.side === 'p' && this.B && this.B.blindFoes > 0) k *= 1.3; return k; };
  const _rh = BT.resolveHit.bind(BT);
  BT.resolveHit = function (a, t, m, grade, opts) {
    opts = opts || {};
    if (a.isMe && a.stance2 === 'drawn' && opts.src !== 'counter') m *= 1.15;
    if (a.isMe && (a.stance2 || 'sheathed') === 'sheathed' && opts.src === 'counter') m *= 1.5;
    // Empty Sleeve can't read a blade that never leaves its sheath
    let restore = null; if (a.isMe && t.stance && opts.src === 'attack' && (a.stance2 || 'sheathed') === 'sheathed' && G.S.f.vaneDone) { restore = t.stance; t.stance = 0; }
    const wasAlive = !t.ko, panicked = t.panic;
    const r = _rh(a, t, m, grade, opts);
    if (restore) t.stance = restore;
    if (a.isMe && a.stance2 === 'drawn' && grade === 'perfect' && r === 'hit' && typeof Chain !== 'undefined') Chain.add(1);
    // morale
    if (t.side === 'e' && r === 'hit') { if (grade === 'perfect') CombatX.shake(t, 12); if (t.broken) CombatX.shake(t, 15); }
    if (wasAlive && t.ko && t.side === 'e') {
      for (const o of BT.alive('e')) CombatX.shake(o, t.E.boss ? 70 : 40);
      if (panicked && a.side === 'p' && HUMANOID.test(t.key) && !this.B.cutDown) { this.B.cutDown = 1; if (typeof Opinion !== 'undefined') Opinion.add('fear', .5); this.text(t, 'CUT DOWN BEGGING', '#ff6a5a', -70); }
    }
    return r;
  };
  /* ---------- enemy turns: panic, cries, adaptation, mirror ---------- */
  const _et = BT.enemyTurn.bind(BT);
  BT.enemyTurn = async function (e) {
    const B = this.B;
    if (e.panic === 1) {
      if (BEAST.test(e.key) || Math.random() < .5) { CombatX.shout(e, BEAST.test(e.key) ? '*bolts*' : pick(['I\'m done — I\'m DONE—', 'Run!', 'Not for any silver!']), 1300); await wait(500); await CombatX.flee(e); return; }
      CombatX.shout(e, pick(['Please…', 'Mercy, please—', "Don't— don't—"]), 1500); await this.msg(`${e.name} is too frightened to fight.`, 900); return;
    }
    // Vane answers your last Art with his own version of it
    if (e.key === 'vane' && B.lastArt && !B.mirrored && Math.random() < .6) {
      B.mirrored = 1; const A = ARTS[B.lastArt]; CombatX.shout(e, 'Like this, pup?', 1500);
      await this.msg(`Vane: Mirror Snow — ${A ? A.name : 'your own technique'}`, 1000);
      const me = this.me(); if (me && !me.ko) await this.enemyStrike(e, me, { name: 'Mirror Snow', hits: [{ anim: 'slash', m: .7, w: 520 }, { anim: 'slash', m: .9, w: 300 }] }, true);
      return;
    }
    return _et(e);
  };
  const _es = BT.enemyStrike.bind(BT);
  BT.enemyStrike = async function (e, t, sk, isCounter) {
    const B = this.B;
    if (e.side === 'e' && !isCounter && sk && sk.hits) CombatX.cry(e, sk);
    // foresight: a ghost of the attack runs ahead of it
    const me = this.me(); B.foreseen = !!(me && me.sight && t && t.side === 'p' && e.side === 'e');
    if (B.foreseen) {
      const img = e.img; if (img) { const s = BT_SCALE * (e.size || 1); for (let i = 0; i < 6; i++) B.fx.push({ ghost: 1, x: lerp(e.x, t.x - 54, i / 5), y: e.y, t: -i * 60, life: 520, img, anim: sk.hits[0].anim === 'spellcast' ? 'spellcast' : 'slash', fr: 3, s, flip: e.flip, col: '#7dffb0', a0: .45 }); }
      this.text(e, 'FORESEEN', '#7dffb0', -66); await wait(380);
    }
    const r = await _es(e, t, sk, isCounter); B.foreseen = false; return r;
  };
  const _def = BT.defend.bind(BT);
  BT.defend = function (e, t, h) {
    const B = this.B;
    // a boss that has felt your rhythm starts lying to it
    if (e.side === 'e' && e.adaptTiming && !B.tutorial && (h.style || 'normal') === 'normal' && Math.random() < .4) h = Object.assign({}, h, { style: Math.random() < .5 ? 'feint' : 'snap' });
    return _def(e, t, h).then(r => {
      try {
        if (t.isMe && e.side === 'e' && (r === 'pparry' || r === 'pdodge')) {
          if (B.foreseen) { t.mp = Math.min(t.maxMp, t.mp + 1); this.text(t, 'FORESIGHT +1 MP', '#7dffb0', -84); if (typeof Chain !== 'undefined') Chain.add(1); }
          if ((e.E.boss || (typeof GE_RIVAL !== 'undefined' && GE_RIVAL[e.key])) && !e.adaptTiming) { e.read = (e.read || 0) + 1; if (e.read >= 3) { e.adaptTiming = 1; this.text(e, 'READS YOUR RHYTHM', '#ff9a6a', -60, true); CombatX.shout(e, pick(['I see it now.', 'Predictable.', 'Again? Hah.']), 1600); } }
        }
      } catch (x) { }
      return r;
    });
  };
  /* ---------- tag moves after your Attack, remembering your last Art ---------- */
  const _da = BT.doAttack.bind(BT);
  BT.doAttack = async function (a, t) { await _da(a, t); try { if (a.isMe && !t.ko) await CombatX.tag(a, t); } catch (e) { } };
  const _ua = BT.useArt.bind(BT);
  BT.useArt = async function (a, k) { if (a.isMe && this.B) this.B.lastArt = k; return _ua(a, k); };
  /* ---------- the fight opens: eyes blazing shake the weak ---------- */
  const _run = BT.run.bind(BT);
  BT.run = async function () {
    const B = this.B;
    try {
      const me = B && B.actors.find(a => a.isMe);
      if (me && !G.S.kid) me.stance2 = G.S.f.lastStance || 'sheathed';
      if (B && G.S.f.hoodGiven && !G.S.hood && !(typeof Veil !== 'undefined' && Veil.on())) setTimeout(() => { for (const e of BT.alive('e')) CombatX.shake(e, 25); }, 900);
    } catch (e) { }
    const r = await _run();
    try { const me = B && B.actors.find(a => a.isMe); if (me && me.stance2) G.S.f.lastStance = me.stance2; } catch (e) { }
    return r;
  };
  /* ---------- draw: shouts, stance badge, morale ---------- */
  const _r = BT.render.bind(BT);
  BT.render = function (c, t) {
    _r(c, t);
    const B = this.B; if (!B) return;
    const now = performance.now();
    c.save();
    for (const a of B.actors) {
      if (a.ko && !a.fled) continue;
      if (a.isMe && a.stance2 && !G.S.kid) { c.font = '900 9px "Nunito"'; c.textAlign = 'center'; c.lineWidth = 3; c.strokeStyle = 'rgba(0,0,0,.8)'; const s = a.stance2 === 'drawn' ? '◑ DRAWN' : '◐ SHEATHED'; c.strokeText(s, a.x, a.y + 16); c.fillStyle = a.stance2 === 'drawn' ? '#ffd36a' : '#cfe8ff'; c.fillText(s, a.x, a.y + 16); }
      if (a.side === 'e' && (a.shaken || a.panic) && !a.ko) { c.font = '900 9px "Nunito"'; c.textAlign = 'center'; c.lineWidth = 3; c.strokeStyle = '#000'; const s = a.panic ? '😨 PANIC' : '😰 SHAKEN'; c.strokeText(s, a.x - 7, a.y + 30); c.fillStyle = a.panic ? '#ff9a5a' : '#ffcf9a'; c.fillText(s, a.x - 7, a.y + 30); }
    }
    B.shouts = (B.shouts || []).filter(x => now - x.t0 < x.life);
    for (const sh of B.shouts) {
      const a = sh.a, k = (now - sh.t0) / sh.life, x = a.x + (a.kbx || 0), y = a.y - 96 * (a.size || 1) - Math.min(1, (now - sh.t0) / 120) * 6;
      c.font = '900 13px "Nunito"'; c.textAlign = 'center'; const w = Math.min(190, c.measureText(sh.s).width + 16);
      c.globalAlpha = k > .8 ? (1 - k) / .2 : 1;
      c.fillStyle = a.side === 'e' ? 'rgba(40,8,6,.92)' : 'rgba(8,30,16,.92)'; c.strokeStyle = a.side === 'e' ? '#ff8a6a' : '#7dffb0'; c.lineWidth = 1.5;
      c.beginPath(); c.roundRect ? c.roundRect(x - w / 2, y - 16, w, 22, 6) : c.rect(x - w / 2, y - 16, w, 22); c.fill(); c.stroke();
      c.beginPath(); c.moveTo(x - 5, y + 6); c.lineTo(x + 5, y + 6); c.lineTo(x, y + 12); c.fill();
      c.fillStyle = '#fff'; c.fillText(sh.s, x, y + 0); c.globalAlpha = 1;
    }
    c.restore();
  };
})();
