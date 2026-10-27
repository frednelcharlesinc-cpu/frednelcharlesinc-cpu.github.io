'use strict';
/* ============================================================================
   BREAKTHROUGHS & THE CALENDAR
   - A grade letter can't be reached by experience alone. Once the aura burns RED
     and the bar is full, experience stops counting (it's banked, not lost) until
     you make a BREAKTHROUGH: a feat, different for every grade, done while you're
     still in the grade below. Then the banked experience pours in.
   - The Guild Tournament, the Colosseum games and the Warcry Festival happen on
     fixed days of the calendar.
   ========================================================================== */
const BREAK = {
  D: { name: 'The First Wall', hint: 'Survive the old man\'s training.', who: 'Vane',
    lines: ['Five winters in the snow. You stopped counting the falls.', 'The wall was never in your arms. It was in the part of you that wanted to quit.'] },
  C: { name: 'Steel Nerves', hint: 'Land 6 PERFECT dodges or parries in a single battle, and win it.', who: 'Brom at the Guild',
    check: c => c.perfect >= 6,
    lines: ['Something in you goes very still. The blades you just turned aside replay behind your eyes — slower each time, until you can see the gap between one heartbeat and the next.', 'Vane\'s voice, five winters old: "The wall isn\'t in your arms, boy. It\'s in your nerve."', 'The wall cracks.'] },
  B: { name: 'The Great Beast', hint: 'Defeat a boss or a great beast (an alpha, a troll, a wyrm, a drake…) of C-grade or higher.', who: 'any hunter in a tavern',
    check: c => c.foes.some(e => (e.boss || e.beast) && e.ti >= 2),
    lines: ['You stand over the beast while its breath runs out. The crystal in its chest still glows.', 'The old Drag hunters said a great beast\'s last breath goes into whoever earned it.', 'You breathe in. Something wild and old settles into your blood — and stays.'] },
  A: { name: 'Read the Storm', hint: 'Read a boss\'s SIGNATURE combo flawlessly — defend every single hit.', who: 'Kess, or any veteran',
    check: c => c.sigFlawless,
    lines: ['Every blow, and you saw each one coming before the boss did.', 'You weren\'t reacting. You were reading.', 'The fight goes quiet around you, like a book closing — and a new one opening.'] },
  S: { name: 'Alone at the Summit', hint: 'Defeat an A-grade (or stronger) boss with no allies beside you.', who: 'Seraphine\'s Seven',
    check: c => c.solo && c.foes.some(e => e.boss && e.ti >= 4),
    lines: ['No one beside you. No one to catch you if you fall.', 'Nana\'s voice, from a valley no map remembers: "A Drag alone is a Drag who has stopped hiding."', 'You stop hiding.'] },
  SS: { name: 'Beyond the Wall', hint: 'Defeat an S-grade (or stronger) foe while taking 3 hits or fewer.', who: 'nobody — only legends',
    check: c => c.hurt <= 3 && c.foes.some(e => e.ti >= 5),
    lines: ['Your blood sings in a key you have never heard.', 'Somewhere far below the mountains, something old turns its head toward you.', 'Let it look.'] },
  SSS: { name: 'The Emerald Heart', hint: 'Defeat an SS-grade (or stronger) boss without taking a single hit.', who: 'nobody living',
    check: c => c.hurt === 0 && c.foes.some(e => e.boss && e.ti >= 6),
    lines: ['The green in your eyes stops being a colour and becomes a light.', 'Thirty people alive have stood here. Now thirty-one.'] }
};
const Break = {
  st() {
    const S = G.S; if (!S.bt) { S.bt = {}; const i = Power.of(Power.xp()).i; for (let k = 1; k <= i; k++) S.bt[GRADES[k]] = 1; }
    return S.bt;
  },
  has(g) { return !!this.st()[g]; },
  next() { const p = Power.of(Power.xp()); return GRADES[p.i + 1] || null; },
  grant(g) { this.st()[g] = 1; },
  // full bar, red aura, and the wall is still there
  atCap() { const p = Power.now(); return !!this.next() && Power.xp() >= GRADE_XP[p.i + 1] - 1; },
  walled() { const g = this.next(); return !!g && !this.has(g) && this.atCap(); },
  capped() {
    const g = this.next(), B = BREAK[g]; if (!g || !B) return;
    const f = G.S.f; if (f['wallSeen' + g]) return; f['wallSeen' + g] = 1;
    setTimeout(() => toast(`<b style="color:#ff5050">YOUR AURA IS RED — AND FULL.</b> Experience alone won't take you to ${g}-grade. You need a <b>breakthrough</b>: <b>${B.name}</b> — ${B.hint} (Menu → Skills)`, 7000), 3200);
  },
  pending: false,
  try() {
    const g = this.next(); if (!g || this.pending || !this.has(g) || !this.atCap()) return;
    this.pending = true;
    const go = () => {
      if (G.mode !== 'world' || World.busy || Dlg.open) { setTimeout(go, 600); return; }
      Story.run(() => this.scene(g));
    };
    setTimeout(go, 800);
  },
  async scene(g) {
    const B = BREAK[g];
    try {
      sfx('art'); await fadeOut(500);
      await narr(`— BREAKTHROUGH · ${B.name.toUpperCase()} —`);
      for (const l of B.lines) await narr(l);
      await fadeIn(500);
    } catch (e) { }
    this.pending = false;
    const bank = G.S.xpBank || 0; G.S.xpBank = 0;
    Story.gainXp(Math.max(1, bank));
    G.S.f.breaks = (G.S.f.breaks || 0) + 1;
  },
  html() {
    const g = this.next(), B = g && BREAK[g]; if (!B) return '';
    const done = this.has(g), wall = this.walled();
    return `<div class="stat" style="margin-bottom:6px;border:1px solid ${wall ? '#ff5050' : '#5a4a2a'}"><h3>Breakthrough to ${g}-grade · <span style="color:#ffd88a">${B.name}</span></h3>
      <p>${done ? '<b style="color:#46ff95">✔ Feat done.</b> The moment your aura burns red and full, you break through.' : `<b>${B.hint}</b><br><span class="muted">It must be done while you are ${GRADES[GRADES.indexOf(g) - 1]}-grade. Experience alone won't break the wall. (Ask ${B.who} if you're stuck.)</span>`}</p>
      ${wall && !done ? `<p style="color:#ff8a8a"><b>Your aura is red and full.</b> Experience you earn now is banked (${G.S.xpBank || 0} EXP) — it pours in the moment you break through.</p>` : ''}</div>`;
  }
};
// experience past the wall is banked, not lost
(function () {
  const _g = Story.gainXp;
  Story.gainXp = function (n) {
    const S = G.S, p = Power.now(), g = GRADES[p.i + 1];
    if (g && !Break.has(g)) {
      const cap = GRADE_XP[p.i + 1] - 1, tot = Power.xp() + n;
      if (tot > cap) { S.xpBank = (S.xpBank || 0) + (tot - cap); n = Math.max(0, cap - Power.xp()); Break.capped(); }
    }
    const r = n > 0 ? _g.call(this, n) : false;
    Break.try();
    return r;
  };
})();
// feats are judged at the end of every won battle
(function () {
  const TIERS = ['E', 'D', 'C', 'B', 'A', 'S', 'SS', 'SSS', 'SSSS'], BEAST = /alpha|troll|wyrm|drake|minotaur|wartotaur|tusker|lich|vampire|b_/;
  const _v = Battle.victory.bind(Battle);
  Battle.victory = async function () {
    const B = this.B; let ctx = null;
    try {
      if (B && !B.tutorial && !B.leafTrain && G.S && !G.S.kid) ctx = {
        perfect: (B.st.pp || 0) + (B.st.pd || 0), hurt: B.st.hurt || 0, sigFlawless: !!B.sigFlawless,
        solo: !B.actors.some(a => a.side === 'p' && !a.isMe),
        foes: B.actors.filter(a => a.side === 'e' && !a.fled && a.E && !a.E.fixed).map(a => ({ boss: !!(a.E.boss || (B.cfg.boss && a.maxHp === Math.max(...B.actors.filter(x => x.side === 'e').map(x => x.maxHp)))), beast: BEAST.test(a.key), ti: Math.max(0, TIERS.indexOf(TIER[a.key] || 'E')) }))
      };
    } catch (e) { }
    const r = await _v();
    try {
      const g = Break.next(), K = g && BREAK[g];
      if (ctx && K && K.check && !Break.has(g) && K.check(ctx)) {
        Break.grant(g); sfx('level');
        setTimeout(() => toast(`<b style="color:#ffd88a">FEAT — ${K.name.toUpperCase()}</b>. The wall to ${g}-grade cracks.${Break.atCap() ? '' : ' Fill your aura to red and you\'ll break through.'}`, 5000), 1800);
        Break.try();
      }
    } catch (e) { }
    return r;
  };
})();
// the five-year time skip IS the first wall
(function () { const _t = Story.timeSkip; if (_t) Story.timeSkip = async function () { Break.grant('D'); return _t.apply(this, arguments); }; })();
// show the breakthrough on the Skills page
(function () { const _h = skillsMenuHTML; skillsMenuHTML = function () { const h = _h(); const i = h.indexOf('<div class="tree">'); return i < 0 ? Break.html() + h : h.slice(0, i) + Break.html() + h.slice(i); }; })();

/* ------------------------------ THE CALENDAR ------------------------------ */
const MONTHS = ['Thawmoon', 'Seedmoon', 'Bloommoon', 'Sunmoon', 'Highsun', 'Embermoon', 'Harvestmoon', 'Leaffall', 'Mistmoon', 'Frostmoon', 'Deepwinter', 'Stillmoon'];
const SCHEDULE = {
  tourney: { name: 'Guild Tournament', days: [14], icon: '🏆', where: 'the Guild hall (Tournament Steward)' },
  colosseum: { name: 'Imperial Games — the Colosseum of Aurel', days: [7, 21], icon: '⚔', where: 'Aurel (the Imperial Crier in Ashford runs a carriage)' },
  warcry: { name: 'Warcry Festival', days: [26, 27, 28], icon: '🔥', where: 'Varro\'s camp in the woods (the Warcry Herald)' }
};
const Cal = {
  day() { const S = G.S; if (!S.day) S.day = 1; return S.day; },
  dom(d) { return ((d - 1) % 28) + 1; },
  month(d) { return MONTHS[Math.floor((d - 1) / 28) % 12]; },
  label(d) { d = d || this.day(); return `${this.dom(d)} ${this.month(d)}`; },
  isOn(kind, d) { d = d || this.day(); return SCHEDULE[kind].days.includes(this.dom(d)); },
  nextOn(kind) { let d = this.day(); for (let i = 0; i < 60; i++, d++) if (this.isOn(kind, d)) return d; return this.day(); },
  async waitUntil(d) {
    await fadeOut(500); G.S.day = d; G.S.clock = 8 * 60; Story.heal(true); save(); await fadeIn(500);
  },
  html() {
    const d = this.day(); let h = `<div class="stat" style="margin-bottom:6px"><h3>📅 Today: ${this.label(d)} <span class="muted">· day ${d} of your journey</span></h3><p class="muted">Every month has 28 days. Sleep at an inn to pass the night.</p></div>`;
    h += '<div class="stat" style="margin-bottom:6px"><h3>Upcoming events</h3>';
    for (const k in SCHEDULE) { const E = SCHEDULE[k], n = this.nextOn(k), dd = n - d; h += `<p>${E.icon} <b>${E.name}</b> — ${dd === 0 ? '<b style="color:#46ff95">TODAY</b>' : `${this.label(n)} (in ${dd} day${dd > 1 ? 's' : ''})`}<br><span class="muted">Days ${E.days.join(', ')} of every month · ${E.where}</span></p>`; }
    h += '</div>';
    // a month grid
    const m0 = d - this.dom(d) + 1; let g = '<div style="display:grid;grid-template-columns:repeat(7,1fr);gap:3px;text-align:center;font-size:12px">';
    for (let i = 0; i < 28; i++) {
      const dd = m0 + i, ev = Object.keys(SCHEDULE).filter(k => this.isOn(k, dd)).map(k => SCHEDULE[k].icon).join('');
      g += `<div style="padding:4px 0;border-radius:6px;background:${dd === d ? '#1f8a4c' : '#141b17'};border:1px solid #2a3a30">${i + 1}<br><span>${ev || '&nbsp;'}</span></div>`;
    }
    h += `<div class="stat"><h3>${this.month(d)}</h3>${g}</div></div>`;
    return h;
  }
};
// days turn over at midnight, and when you sleep at an inn
(function () {
  const _t = Ambient.tick.bind(Ambient);
  Ambient.tick = function (dt) { const before = G.S ? this.clock() : 0; const r = _t(dt); if (G.S && G.mode === 'world' && this.clock() < before - 600) { G.S.day = Cal.day() + 1; const t = Object.keys(SCHEDULE).find(k => Cal.isOn(k)); if (t && !G.S.kid) toast(`📅 ${Cal.label()} — ${SCHEDULE[t].icon} the ${SCHEDULE[t].name} is on today!`, 4200); } return r; };
})();
// events only run on their days — or you can wait for them
(function () {
  const _o = Events.open.bind(Events);
  Events.open = async function (kind, from) {
    if (!SCHEDULE[kind] || !G.S.rank || Cal.isOn(kind)) return _o(kind, from);
    const E = SCHEDULE[kind], n = Cal.nextOn(kind), dd = n - Cal.day();
    await narr(`The ${E.name} isn't on today. It's held on day${E.days.length > 1 ? 's' : ''} ${E.days.join(', ')} of every month. Today is ${Cal.label()} — the next one is ${Cal.label(n)}, in ${dd} day${dd > 1 ? 's' : ''}.`);
    const c = await ask(null, null, `Wait until ${Cal.label(n)}? (Rest and train until then — ${dd} day${dd > 1 ? 's' : ''})`, ['Wait for it', 'Not now']);
    if (c !== 0) return;
    await Cal.waitUntil(n);
    await narr(`${Cal.label(n)}. The banners are up.`);
    return _o(kind, from);
  };
})();
// Brom explains the wall to anyone who hits it
(function () {
  if (typeof talkBrom !== 'function') return;
  const _b = talkBrom;
  talkBrom = async function () {
    const g = Break.next(), K = g && BREAK[g];
    if (K && G.S.rank && !Break.has(g) && Break.atCap() && !G.S.f['bromWall' + g]) {
      G.S.f['bromWall' + g] = 1;
      await say('brom', 'neutral', "Hit the wall, have you? I can see it on you — red as a forge and going nowhere.");
      await say('brom', 'neutral', `Experience gets you TO the wall. It doesn't get you THROUGH it. For ${g}-grade you need a feat. Something that changes you.`);
      await say('brom', 'happy', `${K.hint} Do that while you're still ${GRADES[GRADES.indexOf(g) - 1]}-grade and the wall breaks on its own. And don't fret — nothing you earn in the meantime is wasted.`);
      return;
    }
    return _b.apply(this, arguments);
  };
})();
