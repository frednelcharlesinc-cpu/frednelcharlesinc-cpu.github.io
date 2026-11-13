'use strict';
/* =====================================================================================
   ENEMY AI — fairer turns, smarter attacks, real personalities  (Chat A)
   1  TURN ECONOMY   enemies get a fair share of actions, no free player head-start (unless you ambush),
                     delays / stuns / hastes are capped, SURGE after 3 party turns in a row, boss REACTIONS
   2  VARIETY        move memory (no same special twice), personality targeting, PINCER team attacks,
                     GRABS (mash to break free), BLEED / POISON / FEAR  (charged attacks live in charge.js)
   3  PERSONALITY    Coward · Brute · Duelist · Trickster · Zealot · Hunter · Protector · Glory-hound
                     → who they hit, how they fight, what they shout, when they run; group MORALE and SURRENDER
   ===================================================================================== */
const AI = {
  PERS: {
    coward:    { n: 'Coward',      col: '#c9d36a', d: 'Picks on the weak. Runs — or begs — when it\'s losing.' },
    brute:     { n: 'Brute',       col: '#ff8a5a', d: 'Goes for your strongest. Gets angrier the more it bleeds.' },
    duelist:   { n: 'Duelist',     col: '#9fd0ff', d: 'Answers whoever hit it last. Hates being ganged up on.' },
    trickster: { n: 'Trickster',   col: '#d79bff', d: 'Fast and cheap. Taunts, picks pockets.' },
    zealot:    { n: 'Zealot',      col: '#ffe08a', d: 'Will burn itself to make its allies stronger.' },
    hunter:    { n: 'Hunter',      col: '#9be37a', d: 'Always goes for whoever is closest to falling.' },
    protector: { n: 'Protector',   col: '#7ad8c8', d: 'Shields its allies. Kill one and it goes berserk.' },
    glory:     { n: 'Glory-hound', col: '#ffb3d1', d: 'Only wants the famous Drag. Comes straight for Ren.' }
  },
  BY_KEY: { halvard: 'zealot', verity: 'zealot', acolyte: 'zealot', pale_priest: 'zealot', ember_warden: 'protector', inq_clerk: 'coward', will_verdict: 'zealot',
    vane: 'duelist', voss: 'protector', glad_lion: 'duelist', hesk: 'trickster', hesk2: 'trickster', bertrand: 'hunter', corvin_e: 'trickster', nix_b: 'zealot',
    kairo_duel: 'glory', gt_liora: 'duelist', gt_tobias: 'duelist', gt_dax: 'glory', reg_captain: 'protector', reg_man: 'brute', rook: 'trickster',
    wc_champion: 'glory', knife_cutter: 'trickster', hound_capt: 'trickster', catcher: 'hunter', cleaner: 'brute', briar_rider: 'hunter', glad_net: 'trickster',
    glad_shield: 'protector', tollman: 'coward', hound_toll: 'brute', wc_brawler: 'brute', bq_highwayman: 'trickster', bandit: null },
  BY_IMG: { bandit: ['coward', 'brute', 'trickster'], rook: ['trickster'], guard: ['brute', 'protector', 'duelist'], hunter: ['hunter'], acolyte: ['zealot'],
    lupine: ['hunter'], lupine_alpha: ['hunter', 'brute'], rime_lupine: ['hunter'], rime_alpha: ['brute'], m_goblin: ['coward', 'trickster'], m_goblin_shaman: ['trickster', 'coward'],
    m_orc: ['brute', 'glory'], m_minotaur: ['brute'], m_ratfolk: ['coward', 'hunter'], m_skeleton: ['duelist', 'protector'], m_ghoul: ['hunter'], m_vampire: ['duelist', 'trickster'],
    m_troll: ['brute'], m_lizard: ['hunter', 'protector'], m_drake: ['brute', 'glory'], m_tusker: ['brute'], m_cavewyrm: ['brute'], m_wartotaur: ['brute', 'protector'],
    mana_wyrm: ['hunter'], m_gourd: ['trickster'] },
  BARK: {
    coward: { start: ['W-we outnumber them, right?', 'Somebody else go first!', 'I don\'t get paid enough for this…'], hurt: ['Not the face!', 'Ow! OW!', 'That\'s not fair!'],
      low: ['I yield! I YIELD!', 'Please — I\'ve got a family!', 'This wasn\'t my idea!'], ally: ['He\'s dead — he\'s DEAD—', 'I\'m not dying for this!'], parry: ['How did you—?!', 'Stop DOING that!'], kill: ['Hah! Got one!'] },
    brute: { start: ['Fresh meat.', 'I\'ll break you in half.', 'RAAAH!'], hurt: ['That all you got?', 'Heh. Now I\'m angry.', 'GRRAH!'],
      low: ['I\'LL TAKE YOU WITH ME!', 'NOT YET!'], ally: ['You\'ll pay for that!'], parry: ['Stop hiding behind that sword!'], kill: ['NEXT!', 'Who\'s next?!'] },
    duelist: { start: ['Draw.', 'Let\'s see your form.', 'One of you. Then the next.'], hurt: ['Clean cut. Again.', 'Good.', 'Hm. You\'re real.'],
      low: ['Finish it properly.', 'Not like this…'], ally: ['…Rest.'], parry: ['Ha! A reader!', 'Beautiful parry.'], kill: ['You were brave.'], gang: ['One at a time, cowards!', 'Is this how Drags duel?'] },
    trickster: { start: ['Ooh, a hero. Hold still.', 'Bet you can\'t catch me.', 'Pockets full, I hope?'], hurt: ['Lucky!', 'Rude.', 'Oh, you\'ll regret that.'],
      low: ['Truce? …No? Worth asking.', 'Time to go, time to go—'], ally: ['More for me!'], parry: ['Cheater!', 'Okay, okay, you\'re good.'], kill: ['Too slow!'], steal: ['Thanks for the tip!', 'Finders keepers!'] },
    zealot: { start: ['The light sees you.', 'Kneel, and it ends quickly.', 'For the Verdict!'], hurt: ['Pain is a prayer.', 'I feel nothing.'],
      low: ['Take my strength, brothers!', 'I go to the light!'], ally: ['Their sacrifice is holy!'], parry: ['Abomination!'], kill: ['Cleansed.'] },
    hunter: { start: ['I smell blood.', 'Which one is weakest…?', 'Easy prey.'], hurt: ['Hss!', 'You\'ll tire first.'],
      low: ['Not done hunting…'], ally: ['Fewer mouths.'], parry: ['Quick…'], kill: ['Down.', 'Next.'] },
    protector: { start: ['Behind me.', 'You won\'t touch them.', 'Hold the line!'], hurt: ['Is that all?', 'I hold.'],
      low: ['…Still standing.'], ally: ['NO! You\'ll PAY for that!', 'I swore to protect them!'], parry: ['Tch.'], kill: ['Stay down.'] },
    glory: { start: ['The famous Drag! You\'re MINE!', 'Imagine the bounty on your head…', 'Face me, Drag!'], hurt: ['Yes! Fight me!', 'Ha! THAT\'s the Drag I heard about!'],
      low: ['My name… they\'ll remember my name…'], ally: ['Out of my way anyway.'], parry: ['Show me more!'], kill: ['Where\'s the Drag?!'] },
    beast: { start: ['*low growl*', '*snarls*', '*bares its teeth*'], hurt: ['*yelps*', '*hisses*'], low: ['*whimpers*', '*backs away, snarling*'], ally: ['*howls*'], parry: ['*snaps at the air*'], kill: ['*howls in triumph*'] }
  },
  BEAST: /lupine|m_drake|m_cavewyrm|mana_wyrm|m_tusker|m_wartotaur|m_troll|m_ghoul|m_gourd|m_lizard|m_minotaur/,
  BLEED: /lupine|bandit|rook|m_drake|m_ratfolk|m_tusker|m_minotaur|m_goblin\b|hunter|m_lizard/,
  POISON: /m_ghoul|m_lizard|m_goblin_shaman|m_ratfolk|m_gourd|sw_spider|sw_ooze/,
  FEAR: /m_skeleton|m_vampire|m_troll|will_verdict|m_cavewyrm|lupine_alpha|m_drake|m_wartotaur/,
  GRAB: /m_orc|m_troll|m_minotaur|m_tusker|catcher|bertrand|m_lizard|lupine_alpha|m_cavewyrm|wc_brawler|glad_net/,
  off(B) { return !B || B.tutorial || B.leafTrain || (B.cfg && (B.cfg.noAI || B.cfg.tutorial)); },
  tierI(e) { return Math.max(0, ['E', 'D', 'C', 'B', 'A', 'S', 'SS', 'SSS', 'SSSS'].indexOf(TIER[e.key] || 'E')); },
  isBoss(e) { return !!(e.E && (e.E.boss || e.boss)) || this.tierI(e) >= 5; },
  img(e) { return (e.E && e.E.img) || e.key || ''; },
  persOf(e) {
    if (e.pers !== undefined) return e.pers;
    let p = (e.E && e.E.pers) || this.BY_KEY[e.key];
    if (p === undefined || p === null) { const L = this.BY_IMG[this.img(e)] || this.BY_IMG[e.key] || ['brute', 'hunter', 'coward', 'trickster']; p = L[Math.floor(Math.random() * L.length)]; }
    if (e.E && e.E.fixed) p = null;
    return (e.pers = p);
  },
  beast(e) { return this.BEAST.test(this.img(e)) || this.BEAST.test(e.key || ''); },
  // ---- barks: a speech bubble over the enemy's head ----
  bark(BT, e, kind, force) {
    const B = BT.B; if (!B || !e || e.ko || this.off(B)) return; const now = performance.now();
    if (!force && (now - (B.lastBark || 0) < 2600 || Math.random() < .35)) return;
    const p = this.persOf(e); if (!p) return; const set = this.beast(e) ? this.BARK.beast : this.BARK[p]; const L = set && set[kind]; if (!L) return;
    B.lastBark = now; (B.barks = B.barks || []).push({ a: e, s: pick(L), t0: now, life: 2300 });
  },
  drawBarks(c, B) {
    if (!B || !B.barks) return; const now = performance.now();
    B.barks = B.barks.filter(b => now - b.t0 < b.life && !b.a.ko);
    for (const b of B.barks) { const k = (now - b.t0) / b.life, al = k < .1 ? k / .1 : k > .85 ? (1 - k) / .15 : 1, a = b.a, s = (a.size || 1) * (typeof BT_SCALE !== 'undefined' ? BT_SCALE : 1);
      c.save(); c.globalAlpha = al; c.font = '800 13px Nunito, sans-serif'; const w = Math.min(230, c.measureText(b.s).width + 18), x = Math.max(6, Math.min(G.view.w - w - 6, a.x - w / 2)), y = a.y - 118 * s - 22;
      c.fillStyle = 'rgba(255,252,240,.95)'; c.strokeStyle = 'rgba(20,16,10,.85)'; c.lineWidth = 2;
      c.beginPath(); c.roundRect ? c.roundRect(x, y, w, 24, 9) : c.rect(x, y, w, 24); c.fill(); c.stroke();
      c.beginPath(); c.moveTo(a.x - 5, y + 24); c.lineTo(a.x, y + 31); c.lineTo(a.x + 5, y + 24); c.fill();
      c.fillStyle = '#1b140c'; c.textAlign = 'center'; c.textBaseline = 'middle'; c.fillText(b.s, x + w / 2, y + 12.5, w - 10); c.restore(); }
  },
  // ---- who to hit ----
  target(BT, e, t0) {
    const B = BT.B, P = BT.alive('p').filter(p => !p.veil); const pool = P.length ? P : BT.alive('p'); if (!pool.length) return t0;
    const p = this.persOf(e), hp = x => x.hp / x.maxHp, me = BT.me();
    if (pool.length === 1) return pool[0];
    if (p === 'glory' && me && !me.ko && !me.veil && Math.random() < .75) return me;
    if ((p === 'hunter' || p === 'coward') && Math.random() < .8) return pool.slice().sort((a, b) => hp(a) - hp(b))[0];
    if (p === 'brute' && Math.random() < .7) return pool.slice().sort((a, b) => b.atk - a.atk)[0];
    if (p === 'duelist' && e.lastHitBy && !e.lastHitBy.ko && pool.includes(e.lastHitBy) && Math.random() < .8) return e.lastHitBy;
    if (p === 'trickster' && Math.random() < .5) return pool.slice().sort((a, b) => a.def - b.def)[0];
    // everyone: finish off anyone nearly down, and break through a hero who keeps guarding
    const low = pool.filter(x => hp(x) < .25); if (low.length && Math.random() < .55) return pick(low);
    const g = pool.find(x => x.guard); if (g && Math.random() < .4) return g;
    return t0 && pool.includes(t0) ? t0 : pick(pool);
  },
  // ---- statuses on the party ----
  inflict(BT, e, t) {
    if (!t || t.ko || t.side !== 'p') return; const k = this.img(e) + ' ' + (e.key || ''), r = Math.random(), ti = this.tierI(e);
    if (this.BLEED.test(k) && r < .16 + ti * .02 && !t.bleed) { t.bleed = 3; t.bleedDmg = Math.max(2, Math.round(t.maxHp * .04)); BT.text(t, 'BLEEDING', '#ff4a4a', -36); }
    else if (this.POISON.test(k) && r < .2 + ti * .02 && !t.poison) { t.poison = 3; t.poisonDmg = Math.max(2, Math.round(t.maxHp * .035)); t.poisonAtk = Math.round(t.atk * .15); t.atk -= t.poisonAtk; BT.text(t, 'POISONED — ATK down', '#8ee05a', -36); }
    else if (this.FEAR.test(k) && r < .1 + ti * .02 && !t.fear) { t.fear = 2; BT.text(t, 'FEAR — timing shrinks', '#b48aff', -36); }
  },
  // ---- GRAB: mash to break free ----
  async grab(BT, e, t) {
    const B = BT.B; await BT.msg(`${e.name} lunges for a GRAB!`, 700); sfx('alarm');
    if (!(e.side === 'e')) return false;
    await BT.dash(e, t.x - 46, t.y + 2, 240);
    const need = 7 + Math.min(6, this.tierI(e)), ms = 1900; let n = 0; const ov = document.createElement('div');
    ov.style.cssText = 'position:fixed;inset:0;z-index:30;display:flex;align-items:center;justify-content:center;flex-direction:column;background:rgba(40,0,0,.25);touch-action:manipulation;user-select:none';
    ov.innerHTML = `<div style="font:900 34px Nunito,sans-serif;color:#fff;text-shadow:0 0 12px #f33,0 3px 0 #000">BREAK FREE!</div><div style="font:800 15px Nunito;color:#ffd0c0;margin-top:4px">tap anywhere — fast!</div><div style="width:240px;height:14px;border:2px solid #fff;border-radius:8px;margin-top:12px;overflow:hidden"><i style="display:block;height:100%;width:0;background:linear-gradient(90deg,#ff7a3a,#ffd36a)"></i></div>`;
    const bar = ov.querySelector('i'); const tap = ev => { ev.preventDefault(); n++; bar.style.width = Math.min(100, n / need * 100) + '%'; sfx('hit'); B.shake = 3; };
    ov.addEventListener('pointerdown', tap); document.body.appendChild(ov);
    const t0 = performance.now(); while (performance.now() - t0 < ms && n < need) await wait(30);
    ov.remove();
    if (n >= need) { BT.text(t, 'BROKE FREE!', '#9be37a', -40, true); sfx('parry'); e.wait += 100 / e.spd * .5; await BT.home(e); return true; }
    const d = Math.round(e.atk * 1.1 * (1 + Math.random() * .2)); BT.damage(t, d, true); BT.text(t, '-' + d + ' CRUSHED', '#ff6a5a', -20, true); t.broken = 1; BT.text(t, 'HELD — loses a turn', '#ffb08a', -50); B.shake = 12; sfx('hit');
    await wait(400); await BT.home(e); BT.hud(); return true;
  }
};

(function () {
  const BT = Battle;
  // ---------- 1. TURN ECONOMY: set up when the fight begins ----------
  const _run = BT.run.bind(BT);
  BT.run = async function () {
    const B = this.B;
    if (B && !B.aiInit && !AI.off(B)) {
      B.aiInit = 1; B.pStreak = 0; B.barks = [];
      const E = this.alive('e'), P = this.alive('p');
      // no free head start for the party — unless the fight was an ambush
      if (!(B.cfg && (B.cfg.ambush || B.cfg.playerFirst || B.cfg.preempt))) P.forEach(p => p.wait /= .7);
      // a fair share of actions for the enemy side
      if (E.length && P.length && !E.some(e => e.E && e.E.fixed)) {
        const ps = P.reduce((s, a) => s + a.spd, 0), es = E.reduce((s, a) => s + a.spd, 0);
        const boss = E.some(e => AI.isBoss(e)), elite = E.some(e => AI.tierI(e) >= 2 || e.tempered);
        const share = boss ? 1.0 : elite ? .85 : .7;
        if (es < ps * share) { const k = Math.min(2.2, ps * share / es); for (const e of E) { e.spd = Math.round(e.spd * k * 10) / 10; e.wait /= k; } B.econK = k; }
      }
      for (const e of E) AI.persOf(e);
      const lead = E.slice().sort((a, b) => (AI.isBoss(b) - AI.isBoss(a)) || (AI.tierI(b) - AI.tierI(a)) || (b.maxHp - a.maxHp))[0];
      if (E.length >= 3 && lead) B.leader = lead;
      setTimeout(() => { const e = pick(this.alive('e')); if (e) AI.bark(this, e, 'start', true); }, 900);
    }
    return _run();
  };
  // after every turn: nobody can be pushed back (or rushed forward) without limit
  const _at = BT.adaptTick.bind(BT);
  BT.adaptTick = async function () {
    const r = await _at(); const B = this.B; if (!B || AI.off(B)) return r;
    for (const e of this.alive('e')) { const mx = 100 / e.spd * (AI.isBoss(e) ? 1.35 : 1.7); if (e.wait > mx) { e.wait = mx; if (!e.resolveShown) { e.resolveShown = 1; this.text(e, 'RESOLVE — can\'t be held back', '#ffd36a', -70); } } }
    for (const p of this.alive('p')) { const mn = 100 / p.spd * .4; if (p.wait < mn && p.wait > 0) p.wait = mn; }
    return r;
  };
  // break-stuns: after one, the enemy steadies itself for 2 of its turns
  const _cb = BT.checkBreak.bind(BT);
  BT.checkBreak = function (t) {
    if (t && t.side === 'e' && t.stunImm > 0 && t.brk >= t.brkMax && !t.broken && !AI.off(this.B)) { t.brk = Math.round(t.brkMax * .6); this.text(t, 'STEADIES ITSELF', '#ffd36a', -24); return; }
    const was = t && t.broken; const r = _cb(t);
    if (t && t.side === 'e' && !was && t.broken) { t.stunImm = 2; t.brkMax = Math.round(t.brkMax * 1.15); }
    return r;
  };
  // ---------- statuses tick on the hero's turn ----------
  const _pt = BT.playerTurn.bind(BT);
  BT.playerTurn = async function (a) {
    const B = this.B;
    if (a && !a.ko && !AI.off(B)) {
      if (a.bleed > 0) { a.bleed--; const d = a.bleedDmg || 3; a.hp = Math.max(1, a.hp - d); this.text(a, 'BLEED -' + d, '#ff4a4a', -20); }
      if (a.poison > 0) { a.poison--; const d = a.poisonDmg || 3; a.hp = Math.max(1, a.hp - d); this.text(a, 'POISON -' + d, '#8ee05a', -20); if (!a.poison && a.poisonAtk) { a.atk += a.poisonAtk; a.poisonAtk = 0; } }
      if (a.fear > 0) a.fear--;
      this.hud();
    }
    const r = await _pt(a);
    if (B && !AI.off(B) && !r) {
      // SURGE: three party turns in a row and the fastest enemy moves next
      B.pStreak = (B.pStreak || 0) + 1;
      if (B.pStreak >= 3) { const E = this.alive('e').filter(e => !e.broken).sort((x, y) => x.wait - y.wait)[0];
        if (E) { B.pStreak = 0; E.wait = -1; this.text(E, 'SURGE!', '#ff9a5a', -70, true); sfx('alarm'); } }
      // boss REACTION: once between its own turns, a boss may punish what you just did
      const boss = this.alive('e').find(e => AI.isBoss(e) && !e.reacted && !e.broken && !(e.E && e.E.fixed));
      const usedArt = a && a.mp < (a.mpBefore ?? a.mp);
      if (boss && a && !a.ko && Math.random() < (usedArt ? .45 : .18)) {
        boss.reacted = 1; await this.msg(`${boss.name} REACTS!`, 650); const sk = (boss.E.skills || []).filter(s => s.hits)[0];
        if (sk) await this.enemyStrike(boss, a, { name: usedArt ? 'Punish' : 'Riposte', hits: [Object.assign({}, sk.hits[0], { m: (sk.hits[0].m || 1) * .85 })] }, false);
      }
    }
    return r;
  };
  // remember MP so a boss knows when you used an Art
  const _pt2 = BT.playerTurn; BT.playerTurn = async function (a) { if (a) a.mpBefore = a.mp; return _pt2.call(this, a); };
  // FEAR shrinks the timing windows
  const _rx = BT.reflex.bind(BT); BT.reflex = function (a) { const k = _rx(a); return a && a.fear > 0 ? k * .75 : k; };
  // ---------- 2. VARIETY: move memory ----------
  const _cs = BT.chooseSkill.bind(BT);
  BT.chooseSkill = function (e) {
    let sk = _cs(e); if (AI.off(this.B) || !e || !e.E) return sk;
    const basic = (e.E.skills || []).filter(s => s.hits)[0]; e.hist = e.hist || [];
    for (let i = 0; i < 3 && sk !== basic && e.hist.slice(-2).includes(sk); i++) sk = _cs(e);
    if (sk !== basic && e.hist[e.hist.length - 1] === sk) sk = basic || sk;
    e.hist.push(sk); if (e.hist.length > 4) e.hist.shift();
    return sk;
  };
  // ---------- enemy turn: charges, grabs, personality ----------
  const _et = BT.enemyTurn.bind(BT);
  BT.enemyTurn = async function (e) {
    const B = this.B; if (AI.off(B) || !e || e.side !== 'e' || (e.E && e.E.fixed)) return _et(e);
    B.pStreak = 0; e.reacted = 0; if (e.stunImm > 0) e.stunImm--;
    const p = AI.persOf(e), k = AI.img(e) + ' ' + e.key, hpk = e.hp / e.maxHp;
    e.grabCd = Math.max(0, (e.grabCd || 0) - 1);
    if (e.charge) return _et(e);
    // a GRAB (brutes and beasts)
    if (!e.grabCd && AI.GRAB.test(k) && Math.random() < .18 + (p === 'brute' ? .06 : 0)) {
      const t = AI.target(this, e, null); if (t) { e.grabCd = 4; await AI.grab(this, e, t); return; }
    }
    // ZEALOT: sacrifice to empower the others
    if (p === 'zealot' && hpk < .45 && !e.sacrificed && this.alive('e').length > 1 && Math.random() < .5) {
      e.sacrificed = 1; AI.bark(this, e, 'low', true); const cost = Math.round(e.maxHp * .15); e.hp = Math.max(1, e.hp - cost);
      for (const x of this.alive('e')) if (x !== e) { x.atk = Math.round(x.atk * 1.15); const h = Math.round(x.maxHp * .12); x.hp = Math.min(x.maxHp, x.hp + h); this.text(x, `+${h} · ATK UP`, '#ffe08a', -30); }
      await this.msg(`${e.name} burns its own life to strengthen the others!`, 1300); this.hud(); return;
    }
    // COWARD: run, or beg when alone
    if (p === 'coward' && hpk < .3 && !AI.isBoss(e)) {
      const others = this.alive('e').filter(x => x !== e);
      if (others.length && Math.random() < .45) { AI.bark(this, e, 'low', true); await this.msg(`${e.name} turns and RUNS!`, 900); await flee(this, e); return; }
      if (!others.length && !e.begged) { e.begged = 1; const r = await beg(this, e); if (r) return; }
    }
    // BRUTE rage, DUELIST honour
    if (p === 'brute' && !e.rage && hpk < .5) { e.rage = 1; e.atk = Math.round(e.atk * 1.2); this.text(e, 'ENRAGED +ATK', '#ff7a4a', -60); AI.bark(this, e, 'hurt', true); }
    if (p === 'duelist' && !e.ganged && this.alive('p').length >= 3) { e.ganged = 1; e.atk = Math.round(e.atk * 1.1); e.parry = Math.min(.7, (e.parry || 0) + .1); const s = AI.BARK.duelist.gang; (B.barks = B.barks || []).push({ a: e, s: pick(s), t0: performance.now(), life: 2300 }); }
    if (p === 'trickster') e.tempo = .88;
    return _et(e);
  };
  async function flee(BT, e) {
    e.fled = 1; await BT.dash(e, e.x - 340, e.y, 520); e.alpha = 0; e.ko = true; e.hp = 0;
    e.E = Object.assign({}, e.E, { xp: Math.round((e.E.xp || 0) * .5), gold: 0 }); BT.hud();
  }
  async function beg(BT, e) {
    AI.bark(BT, e, 'low', true); await wait(500);
    const c = await ask(null, null, `${e.name} drops its weapon and begs for its life.`, ['Spare it', 'Finish it']); Dlg.close();
    if (c === 0) {
      e.spared = 1; try { Opinion.add('hope', .15); } catch (x) { }
      const tip = pick(['"There\'s a cache under the old mill wheel — take it, it\'s yours!"', '"The Registry pays double for green eyes this month. Watch your back."', '"My boss keeps the good stuff in the back room. I never said that."', '"Don\'t take the south road at night. Trust me."']);
      await BT.msg(`${e.name}: ${tip}`, 2200); G.S.gold += 10 + AI.tierI(e) * 6; toast('<b style="color:#9be37a">Spared</b> — it ran, and left something behind (+gold).', 2600);
      await flee(BT, e); return true;
    }
    e.atk = Math.round(e.atk * 1.3); BT.text(e, 'DESPERATE!', '#ff7a4a', -60); return false;
  }
  // ---------- every enemy strike: smarter target, PINCER, statuses ----------
  const _es = BT.enemyStrike.bind(BT);
  BT.enemyStrike = async function (e, t, sk, isCounter) {
    const B = this.B; if (AI.off(B) || !e || e.side !== 'e' || isCounter || (e.E && e.E.fixed)) return _es(e, t, sk, isCounter);
    t = AI.target(this, e, t) || t;
    B.curAtk = e; let r;
    try { r = await _es(e, t, sk, isCounter); } finally { B.curAtk = null; }
    // PINCER: a second enemy of the pack piles on the same target
    const mates = this.alive('e').filter(x => x !== e && !x.broken && !x.charge && !(x.E && x.E.fixed) && !AI.isBoss(x));
    if (mates.length && t && !t.ko && !B.inPincer && Math.random() < (['hunter', 'trickster', 'brute'].includes(AI.persOf(e)) ? .16 : .08)) {
      const m = pick(mates); const bs = (m.E.skills || []).filter(s => s.hits)[0];
      if (bs) { B.inPincer = 1; await this.msg(`${m.name} joins in — PINCER!`, 650); try { await _es(m, t, { name: 'Pincer', hits: [Object.assign({}, bs.hits[0], { m: (bs.hits[0].m || 1) * .8 })] }, false); } finally { B.inPincer = 0; } m.wait += 100 / m.spd * .5; }
    }
    return r;
  };
  // damage: statuses, interrupts, barks, morale
  const _dm = BT.damage.bind(BT);
  BT.damage = function (t, dmg, big) {
    const B = this.B, r = _dm(t, dmg, big); if (AI.off(B) || !t || !(dmg > 0)) return r;
    if (t.side === 'p' && B.curAtk) { AI.inflict(this, B.curAtk, t); if (t.ko) AI.bark(this, B.curAtk, 'kill', true); else if (Math.random() < .25) AI.bark(this, B.curAtk, 'start'); }
    if (t.side === 'e') {
      if (B.cur && B.cur.side === 'p') t.lastHitBy = B.cur;
      if (t.ko) onDeath(this, t);
      else if (t.hp < t.maxHp * .3 && !t.lowBarked) { t.lowBarked = 1; AI.bark(this, t, 'low', true); }
      else if (big) AI.bark(this, t, 'hurt');
    }
    return r;
  };
  function onDeath(BT, dead) {
    const B = BT.B; if (dead.deathSeen) return; dead.deathSeen = 1;
    const rest = BT.alive('e'); if (!rest.length) return;
    // PROTECTORS avenge; everyone else notices
    for (const x of rest) { const p = AI.persOf(x);
      if (p === 'protector' && !x.avenge) { x.avenge = 1; x.atk = Math.round(x.atk * 1.25); x.spd += 2; BT.text(x, 'VENGEANCE', '#7ad8c8', -60, true); AI.bark(BT, x, 'ally', true); } }
    if (Math.random() < .5) AI.bark(BT, pick(rest), 'ally');
    // MORALE: the leader falls and the pack may break
    if (B.leader === dead && !B.moraleBroke) {
      B.moraleBroke = 1; setTimeout(async () => { if (!BT.B || BT.B !== B) return;
        await BT.msg(`${dead.name} has fallen — the others waver!`, 1200);
        for (const x of BT.alive('e')) { if (AI.isBoss(x)) continue; const p = AI.persOf(x);
          const ch = p === 'coward' ? .7 : p === 'zealot' || p === 'protector' || p === 'duelist' ? 0 : .25;
          if (Math.random() < ch) { await BT.msg(`${x.name} breaks and runs!`, 700); await flee(BT, x); }
          else if (ch > 0) { x.atk = Math.round(x.atk * .8); BT.text(x, 'FALTERS — ATK down', '#c9c9c9', -50); } }
        BT.hud(); }, 50);
    }
  }
  // the hero perfect-parries: the attacker reacts
  const _cl = BT.clash ? BT.clash.bind(BT) : null;
  if (_cl) BT.clash = async function (e, t, streak) { if (!AI.off(this.B) && e && e.side === 'e' && streak === 2) AI.bark(this, e, 'parry'); return _cl(e, t, streak); };
  // speech bubbles
  const _r = BT.render.bind(BT);
  BT.render = function (c, t) { const out = _r(c, t); try { AI.drawBarks(c, this.B); } catch (x) { } return out; };
})();
