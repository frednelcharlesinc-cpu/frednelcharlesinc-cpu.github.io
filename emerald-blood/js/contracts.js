'use strict';
/* ============================================================================
   GUILD CONTRACTS — repeatable work for gold, fame and a town's good will.
   HUNTS (cull a number of monsters), BOUNTIES (one dire or ancient beast),
   HELP jobs (people who need a hand). New offers go up on the board every day.
   ========================================================================== */
const CT_HUNT = [
  { map: 'woods', where: 'the East Woods', town: 'ashford', who: 'the Ashford woodcutters', tgt: ['lupine'], name: 'Ashen Lupines', n: [3, 5] },
  { map: 'woods', where: 'the East Woods', town: 'kettlebrook', who: 'Kettlebrook\'s farmers', tgt: ['m_goblin', 'm_goblin_shaman'], name: 'goblins', n: [3, 6] },
  { map: 'woods', where: 'the East Woods', town: 'millbrook', who: 'the Millbrook herb-pickers', tgt: ['m_gourd'], name: 'Gourd Fiends', n: [2, 4] },
  { map: 'woods', where: 'the East Woods', town: 'kettlebrook', who: 'the granary', tgt: ['m_ratfolk'], name: 'Warren Rats', n: [3, 6] },
  { map: 'd_warren', where: 'the Goblin Warren', town: 'kettlebrook', who: 'shepherds who keep losing sheep', tgt: ['m_goblin', 'm_goblin_shaman', 'm_ratfolk'], name: 'warren goblins', n: [4, 7] },
  { map: 'd_crypt', where: 'the Sunken Crypt', town: 'ashford', who: 'the chapel sexton', tgt: ['m_skeleton', 'm_ghoul'], name: 'restless dead', n: [4, 6], min: 1 },
  { map: 'd_mire', where: 'the Drowned Mine', town: 'millbrook', who: 'the ferry guild', tgt: ['m_lizard', 'm_troll', 'm_tusker'], name: 'mine beasts', n: [3, 5], min: 2 }
];
const CT_BOUNTY = [
  { map: 'woods', where: 'the East Woods', town: 'ashford', key: 'lupine_alpha', title: 'Greymuzzle', text: 'An old alpha with a torn ear has killed six sheep and a dog. The woodcutters won\'t go out alone.' },
  { map: 'woods', where: 'the East Woods', town: 'kettlebrook', key: 'm_tusker', title: 'Old Tuskbreaker', text: 'A boar-brute the size of a cart flattened Pell\'s fence. Twice.', min: 1 },
  { map: 'd_warren', where: 'the Goblin Warren', town: 'kettlebrook', key: 'm_goblin_shaman', title: 'Snivelfang the Hex-Cutter', text: 'A goblin witch-doctor has been cursing the wells.' },
  { map: 'd_crypt', where: 'the Sunken Crypt', town: 'ashford', key: 'm_ghoul', title: 'The Gravedigger', text: 'Something keeps digging up the fresh graves. Something hungry.', min: 1 },
  { map: 'd_mire', where: 'the Drowned Mine', town: 'millbrook', key: 'm_troll', title: 'Gutwater', text: 'A bog troll has moved into the lower shafts and eats anyone who comes near the pumps.', min: 2 }
];
const CT_HELP = [
  { town: 'millbrook', map: 'millbrook', name: 'The ferryman\'s nets', text: 'Old Hobb\'s nets snagged on the weir. He can\'t swim any more.', lines: ['You wade out to the weir, cold to the waist, and work the nets free one knot at a time.', 'Hobb hauls them in, grinning with four teeth. "Bless you, stranger. Bless you twice."'] },
  { town: 'kettlebrook', map: 'kettlebrook', name: 'Rats in the granary', text: 'The reeve says something big is chewing through the winter grain.', fight: ['m_ratfolk', 'm_ratfolk', 'm_ratfolk'], lines: ['The granary is dark and smells of wet straw. Something squeaks — and something answers, much bigger.'], after: ['The reeve counts the sacks twice. "Every one. You\'ve saved the winter, friend."'] },
  { town: 'ashford', map: 'millbrook', name: 'Escort Maren\'s supplies', text: 'Maren needs bandages and tinctures carried to the Millbrook herbalist. Bandits have been watching the river road.', fight: ['bandit', 'bandit'], lines: ['Halfway down the river road, two men step out from behind a cart. "That\'s a nice box. Leave it."'], after: ['The herbalist unpacks the crate with shaking hands. "Maren\'s good stuff. This will keep the fever children alive."'] },
  { town: 'kettlebrook', map: 'woods', name: 'Pell\'s runaway goat', text: 'Pell\'s prize goat, Duchess, broke her tether and ran for the woods.', lines: ['You find Duchess on top of a mossy stone, chewing someone\'s abandoned hat. She refuses to come down.', 'It takes twenty minutes, a carrot and your dignity. Pell cries when you bring her home.'] },
  { town: 'millbrook', map: 'millbrook', name: 'Mend the chapel roof', text: 'The Millbrook chapel roof leaks on the sick who sleep there.', lines: ['A day of slate and tar and hammering in the wind. By dusk the rain runs off the roof instead of onto the sick.', 'The Sister brings you bread and soup and doesn\'t ask why you keep your hood up.'] },
  { town: 'ashford', map: 'woods', name: 'Walk the night road', text: 'Travellers keep vanishing on the woods road after dark. The Guild wants someone on it.', fight: ['bandit', 'tollman'], lines: ['The road is quiet. Too quiet — then a lantern goes out ahead of you and three shapes step onto the path.'], after: ['You drag the toll-thieves back to the Guild. The road will be safer for a while.'] },
  { town: 'kettlebrook', map: 'kettlebrook', name: 'Harvest hands', text: 'The Orla farm is short three pairs of hands before the rain.', lines: ['You swing a sickle until your shoulders burn. Orla\'s grandchildren race you down the rows — and win.', 'The harvest is in before the rain. Orla presses a jar of honey into your hands.'] }
];
const Ct = {
  st() { const S = G.S; S.ct = S.ct || { active: [], done: 0, taken: {} }; return S.ct; },
  pay(base) { const c = Power.now().cstep; return Math.round(base * (1 + c * .09)); },
  offers() {
    const d = typeof Cal !== 'undefined' ? Cal.day() : 1, gi = Power.now().i, st = this.st();
    let h = d * 9301 + 49297; const r = () => { h = (h * 9301 + 49297) % 233280; return h / 233280; };
    const out = [];
    const hunts = CT_HUNT.filter(x => (x.min || 0) <= gi), bnt = CT_BOUNTY.filter(x => (x.min || 0) <= gi);
    const H = hunts[Math.floor(r() * hunts.length)], n = H.n[0] + Math.floor(r() * (H.n[1] - H.n[0] + 1));
    out.push({ id: `h${d}`, type: 'hunt', map: H.map, where: H.where, town: H.town, tgt: H.tgt, n, got: 0, name: `Cull ${n} ${H.name}`, text: `${H.who} want ${n} ${H.name} gone from ${H.where}.`, gold: this.pay(28 + n * 9), fame: 2, rep: 2 });
    const Bt = bnt[Math.floor(r() * bnt.length)], kind = Power.now().cstep >= 16 && r() < .4 ? 'ancient' : 'dire';
    out.push({ id: `b${d}`, type: 'bounty', map: Bt.map, where: Bt.where, town: Bt.town, key: Bt.key, kind, name: `BOUNTY: ${Bt.title}`, title: Bt.title, text: `${Bt.text} (A ${kind} beast — it will find you in ${Bt.where}.)`, gold: this.pay(kind === 'ancient' ? 160 : 90), fame: kind === 'ancient' ? 6 : 4, rep: 3 });
    const Hp = CT_HELP[Math.floor(r() * CT_HELP.length)];
    out.push({ id: `p${d}`, type: 'help', map: Hp.map, town: Hp.town, name: Hp.name, text: Hp.text + ` (Go to ${Hp.map === 'woods' ? 'the East Woods' : TOWNS[Hp.map] || Hp.map}.)`, help: CT_HELP.indexOf(Hp), gold: this.pay(Hp.fight ? 45 : 25), fame: 2, rep: 4 });
    return out.filter(o => !st.taken[o.id]);
  },
  async board() {
    const st = this.st();
    while (true) {
      const offers = this.offers();
      const c = await ask(null, null, `Contracts — ${typeof Cal !== 'undefined' ? Cal.label() : ''}. New ones go up every morning. (${st.active.length}/3 taken · ${st.done} done)`,
        [...offers.map(o => `${o.type === 'hunt' ? '⚔' : o.type === 'bounty' ? '☠' : '✋'} ${o.name} — ${o.gold}g`), ...(st.active.length ? ['Your contracts'] : []), 'Step away']);
      if (c < 0) return;
      if (c < offers.length) {
        const o = offers[c];
        const k = await ask(null, null, `${o.name}. ${o.text} Pays ${o.gold}g · fame +${o.fame} · ${TOWNS[o.town]} will remember.`, ['Take it', 'Leave it']);
        if (k !== 0) continue;
        if (st.active.length >= 3) { await narr('The clerk taps the counter. "Three at a time. Finish one first."'); continue; }
        st.taken[o.id] = 1; st.active.push(o); sfx('blip'); toast(`Contract taken: <b>${o.name}</b>`, 2400); continue;
      }
      if (st.active.length && c === offers.length) { await narr(st.active.map(o => `• ${o.name}${o.type === 'hunt' ? ` (${o.got}/${o.n})` : ''} — ${o.text}`).join('\n')); continue; }
      return;
    }
  },
  async finish(o) {
    const st = this.st(); st.active = st.active.filter(x => x !== o); st.done++;
    G.S.gold += o.gold; sfx('coin'); UI.hud();
    banner('CONTRACT COMPLETE', `${o.name} · +${o.gold}g`, 2400);
    Rep.deed(o.rep, `${o.name}`, o.town, o.fame);
    Story.gainXp(Math.round(20 + Power.now().cstep * 4));
    save();
  },
  // hunts count kills; bounties ambush you; help jobs trigger when you arrive
  onWin(keys) {
    const st = this.st(); const map = G.S.map;
    for (const o of st.active.slice()) if (o.type === 'hunt' && o.map === map) {
      const k = keys.filter(x => o.tgt.includes(x.replace(/_(dire|ancient)$/, ''))).length; if (!k) continue;
      o.got = Math.min(o.n, o.got + k); toast(`${o.name}: ${o.got}/${o.n}`, 1800);
      if (o.got >= o.n) setTimeout(() => this.finish(o), 1500);
    }
  }
};
// the board: story bounties, contracts, and (when unlocked) the raid board
(function () {
  const _qb = questBoard;
  questBoard = async function () {
    if (!G.S.rank) return _qb();
    const L = ['The bounty board (story quests)', 'Contracts — hunts, bounties, help', ...(typeof Raid !== 'undefined' ? ['RAID board — monster lords'] : []), 'Step away'];
    const c = await ask(null, null, 'The Guild boards.', L);
    if (c === 0) return _qb();
    if (c === 1) return Ct.board();
    if (c === 2 && L.length === 4) return Raid.board();
  };
  const _v = Battle.victory.bind(Battle);
  Battle.victory = async function () {
    const B = this.B, keys = B ? B.actors.filter(a => a.side === 'e' && !a.fled).map(a => a.key) : [];
    const r = await _v(); try { if (!B.cfg.raid) Ct.onWin(keys); } catch (e) { } return r;
  };
  // bounties hunt you: the next encounter in their map is the beast
  const _st = World.onStep.bind(World);
  World.onStep = function (e) {
    const r = _st(e);
    try {
      if (e.isPlayer && !this.busy && G.mode === 'world' && G.S.ct && this.grass.has(e.x + ',' + e.y)) {
        const o = G.S.ct.active.find(x => x.type === 'bounty' && x.map === G.S.map);
        if (o && Math.random() < .07) {
          this.lastEnc = G.S.steps;
          Story.run(async () => {
            const k = Elite.make(o.key, o.kind); ENEMY[k].name = o.title; const E = ENEMY[k];
            banner('☠ BOUNTY', o.title.toUpperCase(), 2000); await wait(900);
            await narr(`The air goes still. Then ${o.title} steps out of the dark — bigger than the stories, and the stories were bad.`);
            const res = await Battle.start({ enemies: [k], noFlee: false, bd: (SCENES[G.S.map] && SCENES[G.S.map].bd) || 'forest', intro: `BOUNTY — ${o.title.toUpperCase()}`, noElite: 1 });
            if (res === 'lose') { await Story.defeat(); return; }
            if (res === 'win') { await narr(`You cut a trophy from ${o.title}. The Guild will pay on sight of it.`); await Ct.finish(o); }
          });
        }
      }
    } catch (err) { }
    return r;
  };
  // help jobs: arrive at the place and lend a hand
  const _ld = World.load.bind(World);
  World.load = async function (name, x, y, dir) {
    const r = await _ld(name, x, y, dir);
    try {
      const o = G.S && G.S.ct && G.S.ct.active.find(c => c.type === 'help' && c.map === name);
      if (o && !G.S.kid) setTimeout(() => {
        const go = () => { if (World.busy || Dlg.open || G.mode !== 'world') return setTimeout(go, 700); Story.run(async () => {
          const H = CT_HELP[o.help]; banner('CONTRACT', o.name.toUpperCase(), 1800); await wait(700);
          for (const l of H.lines) await narr(l);
          if (H.fight) { const res = await Battle.start({ enemies: H.fight, bd: (SCENES[name] && SCENES[name].bd) || 'town', intro: o.name.toUpperCase() }); if (res === 'lose') { await Story.defeat(); return; } if (res !== 'win') return; }
          for (const l of H.after || []) await narr(l);
          await Ct.finish(o);
        }); };
        go();
      }, 1200);
    } catch (e) { }
    return r;
  };
})();
