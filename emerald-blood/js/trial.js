'use strict';
/* ================= CHAPTER I · PART V — THE GUILD TRIAL =================
   After the mill and the roof: Greyspire's gate admits only Guild-licensed adventurers on Crown contract.
   The Trial: application → the Ledger Exam (+ the crystal) → the team lottery → the C-rank Quarry Gate
   (Guild Sigils, the Anomaly, the Hollow Warden, the Heartshard Core) → the ceremony → the 1-on-1 tournament → aftermath.
   Ranks: survivors are licensed (E); a quarterfinal win → D; reaching the final → C. The final is for the title.
   Deaths: Hobb and Corwin always; Mirel unless Ren saves her. Kairo stays away — only Dace ("Dax Merrin") reports to him. */
Object.assign(CHAR, {
  dax: { name: 'Dax Merrin', sprite: 'ge_dace' }, hobb: { name: 'Hobb Tanner', sprite: 'folk11' }, corwin: { name: 'Corwin', sprite: 'folk14' },
  mirel: { name: 'Mirel', sprite: 'folk5' }, eirik: { name: 'Eirik Stormborn', sprite: 'hrok' }, brenna: { name: 'Brenna Ironvein', sprite: 'dwarf_f1' },
  faelan: { name: 'Faelan', sprite: 'elf_m1' }, samira: { name: 'Samira of Solmere', sprite: 'asha' }, tobias: { name: 'Ser Tobias Wend', sprite: 'gideon' }
});
const TM = (name, img, hp, atk, def, spd, extra, skills) => Object.assign({ name, img, hp, atk, def, spd, dodge: .15, parry: .1, brk: Math.round(hp * .6), xp: Math.round(hp / 3), gold: Math.round(hp / 6), skills }, extra || {});
Object.assign(ENEMY, {
  gt_gloom: TM('Gloomling', 'm_goblin', 34, 10, 2, 14, { trait: 'Gate-spawn — quick and nasty' }, [{ name: 'Gloom Claw', hits: [{ anim: 'slash', m: 1, w: 480 }] }, { name: 'Double Rake', w: .4, hits: [{ anim: 'slash', m: .6, w: 420 }, { anim: 'halfslash', m: .6, w: 260 }] }]),
  gt_rat: TM('Hollow Rat', 'm_ratfolk', 28, 9, 1, 15, { dodge: .3 }, [{ name: 'Bite', hits: [{ anim: 'thrust', m: 1, w: 440 }] }]),
  gt_imp: TM('Cinder Imp', 'm_goblin_shaman', 36, 11, 2, 12, { trait: 'fire — throws cinders' }, [{ name: 'Cinder Toss', hits: [{ anim: 'spellcast', proj: 'fire', m: 1, w: 560 }] }]),
  gt_spawn: TM('Stonehide Spawn', 'm_tusker', 72, 13, 6, 8, { trait: 'Stone hide — break its guard' }, [{ name: 'Gore', hits: [{ anim: 'thrust', m: 1.1, w: 560 }] }, { name: 'Trample', w: .3, hits: [{ anim: 'slash', m: .7, w: 460 }, { anim: 'slash', m: .8, w: 300 }] }]),
  gt_brute: TM('Horned Brute', 'm_minotaur', 96, 15, 5, 10, { trait: 'Carries a Crimson Sigil' }, [{ name: 'Axe Swing', hits: [{ anim: 'slash', m: 1.1, w: 560 }] }, { name: 'Horn Charge', w: .3, hits: [{ anim: 'thrust', m: 1.5, w: 640, unp: 1 }] }]),
  gt_shade: TM('Mirror Shade', 'm_vampire', 70, 14, 3, 15, { dodge: .3, trait: 'Carries an Azure Sigil — wears your movements' }, [{ name: 'Mirror Cut', hits: [{ anim: 'slash', m: .8, w: 420 }, { anim: 'halfslash', m: .8, w: 260 }] }, { name: 'Blood Bats', w: .3, hits: [{ anim: 'spellcast', proj: 'shadow', m: 1, w: 560 }] }]),
  gt_stalker: TM('Pale Stalker', 'm_ghoul', 64, 14, 3, 16, { dodge: .25, trait: 'Hunts the weakest first' }, [{ name: 'Lunge', hits: [{ anim: 'thrust', m: 1.1, w: 420 }] }, { name: 'Frenzy', w: .35, hits: [{ anim: 'slash', m: .6, w: 360 }, { anim: 'slash', m: .6, w: 240 }, { anim: 'slash', m: .7, w: 260 }] }]),
  gt_warden: TM('The Hollow Warden', 'm_troll', 340, 18, 7, 9, { boss: 1, size: 1.35, brk: 160, trait: 'Stone and chain — the Gate jumped to B-rank around it' }, [{ name: 'Chain Sweep', hits: [{ anim: 'slash', m: 1, w: 560 }, { anim: 'halfslash', m: .8, w: 320 }] }, { name: 'Quarry Slam', w: .3, hits: [{ anim: 'jump', m: 1.6, w: 680, unp: 1 }] }, { name: 'Gate Pulse', w: .25, hits: [{ anim: 'spellcast', proj: 'mana', m: 1.2, w: 600 }] }]),
  gt_tobias: TM('Ser Tobias Wend', 'gideon', 120, 14, 6, 11, { parry: .35, trait: 'Crown squire — Creed: parries and counters' }, [{ name: 'Drill Thrust', hits: [{ anim: 'thrust', m: 1, w: 520 }] }, { name: 'Creed Counter', w: .35, hits: [{ anim: 'slash', m: .7, w: 380 }, { anim: 'slash', m: .9, w: 300 }] }]),
  gt_dax: TM('Dax Merrin', 'ge_dace', 160, 16, 5, 15, { drag: 1, parry: .2, dodge: .2, trait: 'Green Eclipse brawler — fights like he has something to prove' }, [{ name: 'Knuckle Rush', hits: [{ anim: 'slash', m: .6, w: 380 }, { anim: 'halfslash', m: .6, w: 240 }, { anim: 'slash', m: .7, w: 260 }] }, { name: 'Five Years', w: .3, hits: [{ anim: 'thrust', m: 1.6, w: 620 }] }]),
  gt_liora: TM('Liora', 'liora', 170, 17, 5, 18, { drag: 1, parry: .4, dodge: .2, trait: "Counter-fighter — Wolf's Parry deflects and strikes in one move" }, [{ name: 'Spear Line', hits: [{ anim: 'thrust', m: 1, w: 460 }, { anim: 'thrust', m: .8, w: 280 }] }, { name: 'Moon Waltz', w: .3, hits: [{ anim: 'backslash', m: .5, w: 360 }, { anim: 'slash', m: .5, w: 240 }, { anim: 'thrust', m: .9, w: 300 }] }, { name: "Wolf's Reply", w: .2, hits: [{ anim: 'thrust', m: 1.5, w: 560, unp: 1 }] }])
});
Object.assign(TIER, { gt_gloom: 'E', gt_rat: 'E', gt_imp: 'D', gt_spawn: 'C', gt_brute: 'C', gt_shade: 'C', gt_stalker: 'C', gt_warden: 'B', gt_tobias: 'D', gt_dax: 'C', gt_liora: 'B' });
if (typeof STONES !== 'undefined') { STONES.quarry = { name: 'Quarry Core', size: 'small', slot: 'armor', desc: 'The sealed Core of the Quarry Gate — a Heartshard someone planted under the quarry. Strain limit +20. Sometimes, very faintly, it whispers.', cap: 20 }; if (typeof STONE_RUNE !== 'undefined') STONE_RUNE.quarry = 'Anchor'; }

const Trial = {
  f() { return G.S.f; },
  rankUp(r) { const S = G.S, i = x => ['E', 'D', 'C', 'B', 'A', 'S', 'SS', 'SSS'].indexOf(x);
    if (!S.rank || i(S.rank) < i(r)) S.rank = r; if (!S.rankFloor || i(S.rankFloor) < i(r)) S.rankFloor = r; UI.hud(); },
  // a fight you can't afford to lose: get knocked down and you get back up (the Gate) — or it simply ends (the tournament)
  async must(cfg, onLose) {
    for (let k = 0; k < 4; k++) {
      const r = await Battle.start(Object.assign({ noFlee: true }, cfg)); Story.heal(true);
      if (r !== 'lose') return r;
      await narr(onLose || 'You hit the stone floor. The watch crystal on your wrist flickers red — then you get your knees under you again.');
    }
    return 'win';
  },
  duel(key, bd, intro, lines) {
    return Battle.start({ enemies: [key], allies: [], noFlee: true, bd, music: 'boss', intro,
      onTurn: async (B, Bt) => { const e = B.actors.find(a => a.key === key), me = Bt.me();
        if (e && lines && !e.t1 && e.hp < e.maxHp * .6) { e.t1 = 1; await Bt.msg(lines, 1700); }
        if (e && e.hp < e.maxHp * .25) { await Bt.msg(`${e.name} yields!`, 1200); return 'win'; }
        if (me.hp < me.maxHp * .2) { await Bt.msg('The referee steps in. The bout is over.', 1300); return 'lose'; } } });
  },

  /* ---- after the roof: the motive and the countdown ---- */
  async open() {
    const f = this.f(); if (f.trial) return; f.trial = 'open';
    await say('liora', 'neutral', "One more thing. Greyspire's gate only opens for Guild-licensed hunters on Crown contract. Escorts. Bounty men. Anyone else gets shot from the wall.");
    await say('liora', 'smirk', "The Guild Trial is in Highmark — the Guild's mother city, up the Crown Road. Three days. Miss it and the next is in a year. …I'm signing up. I hate guilds. I love loopholes.");
    await say('liora', 'neutral', "There's a Guild coach in the Market Square. Applicants ride free.");
    await say('liora', 'neutral', "Try not to die in the Gate before I get to beat you at something.");
    Story.quest('The Guild Trial: take the Guild coach from Ashford\'s Market Square to Highmark, and hear the announcement at the Gate Plaza.');
  },

  /* ---- the whole Trial, from the moment you walk into the Guild hall ---- */
  async run() {
    const f = this.f(), S = G.S; if (f.trial !== 'open' || this.active) return; f.trial = 'running'; this.active = 1;
    // STAGE 0 — application
    await narr('The Great Hall of Highmark is packed wall to wall. Up at the front, a familiar bald head — Brom of Ashford, proctoring the vale\'s applicants.');
    await say('brom', 'happy', 'You made it up the Crown Road! Good. The Guild Master gives the speeches. I do the shouting.');
    await say('brom', 'neutral', 'Three stages. The Ledger Exam. The Gate. The duels. Survive the Gate and you walk out a licensed adventurer — that\'s the whole prize, and it\'s a big one.');
    await say('brom', 'sad', 'And some of you won\'t walk out. I\'m not saying that to scare you. I\'m saying it because it\'s true every year.');
    if (S.rank || (S.q && Object.values(S.q).includes('done'))) await say('brom', 'happy', 'You — you\'ve done Guild work. Fee\'s waived. Sign the waiver.');
    else { await say('brom', 'neutral', 'Thirty gold. Sign the waiver.'); S.gold = Math.max(0, S.gold - 30); UI.hud(); }
    await narr('The waiver is one line long: THE GUILD IS NOT RESPONSIBLE FOR WHAT THE GATE DOES. You sign it.');
    await say('hobb', null, '"Hobb Tanner! Farmhand, forty-one, three kids. If I get a license, I get paid more to stab the same wolves. Ha!"');
    await say('corwin', null, '"Corwin. Team leader — well, I will be. Stick with the winners, hood."');
    await say('mirel', null, '"I\'m Mirel. I\'m… an apprentice healer. Maren says I\'m ready. I don\'t think Maren\'s ever wrong. I think she might be wrong."');
    await narr('Near the back wall, a young man with a headband low over a scar leans on a pillar with his arms crossed. He has been watching you since you walked in.');
    await say('dax', null, '"Dax Merrin. I work alone." He says it to the whole room — but he\'s looking at you.');
    await me('neutral', '(…Dace. Kairo\'s best fighter. Under a fake name, in a Guild hall.)');
    await narr('Three days go by: whetstones, bad sleep, Tobb selling "Trial tonics" at double price. Then it\'s dawn.');
    if (typeof Cal !== 'undefined') S.day = (S.day || 1) + 3;

    // STAGE 1 — the Ledger Exam
    await narr('The main room, rows of slate desks. Sylwen proctors. Garrick and Tilda patrol the aisles. Dax sits two desks away.');
    await say('sylwen', 'neutral', 'Three sections. Knowledge. Judgment. And one I won\'t tell you about. Begin.');
    let score = 0;
    const Q = [
      ['How many tiers does the Guild card list, E up to S?', ['Six', 'Five', 'Eight'], 0],
      ['A beast heals itself every turn. What do you do?', ['Hit it every single turn', 'Wait for it to tire', 'Guard and let it come'], 0],
      ['Captain Voss fights behind a shield wall. What breaks it?', ['Many small hits', 'One huge blow', 'Fire'], 0],
      ['A red attack ring means…', ['It can\'t be parried — dodge it', 'Parry it twice', 'It\'s harmless'], 0],
      ['Who must every D-stone be registered with?', ['The Crown Registry', 'The Guild', 'The Inquisition'], 0]];
    for (const [t, o, a] of Q) { const c = await ask(null, null, 'KNOWLEDGE — ' + t, o); if (c === a) score++; }
    const cheat = await ask(null, null, 'Your neighbour\'s slate is tilted toward you. Garrick has his back turned…', ['Keep your eyes on your own slate.', 'Glance at their answers.']);
    if (cheat === 1) { f.cheatWarnings = 1; score--; await say('garrick', 'anger', '"Eyes down, hood. That\'s one."'); }
    const J = [['A child runs into a gate you are clearing. Do you…', ['Pull the child out first.', 'Finish the gate first.', 'Call the Guild.']],
      ['A client pays you to deliver a locked box. Something inside is moving. Do you…', ['Open it.', 'Deliver it, as paid.', 'Ask the client what it is.']],
      ['A teammate is bleeding and slowing the team. Do you…', ['Carry him.', 'Leave a marker and come back.', 'Go on without him.']]];
    let trust = 0;
    for (let i = 0; i < J.length; i++) { const c = await ask(null, null, 'JUDGMENT — ' + J[i][0], J[i][1]); f['judg' + i] = c; if (c === 0 || (i === 1 && c === 2)) trust++; }
    f.guildTrust = trust;
    const ob = await ask(null, null, 'Last question, in small letters at the bottom: "How many examiners are in this room?"', ['Three', 'Two', 'Four']);
    if (ob === 0) score++;
    f.trialScore = score;
    await say('sylwen', trust >= 2 ? 'happy' : 'neutral', trust >= 2 ? 'Protect the weak. Keep your word. Tell the truth. …You\'d be surprised how few answer that way.' : 'Interesting answers. The Guild writes everything down, you know.');
    // the crystal — again, in front of everyone
    await narr('Then the crystal. One by one, every applicant puts a hand on it. Red. Blue. Brown. Pale gold. A murmur for every colour.');
    const cc = await ask('me', 'neutral', '(Your turn. Every eye in the room is on the stone.)', ['Put your hand on it.', 'Tomb Breath first — hold everything down.']);
    if (cc === 0) {
      await narr('GREEN. A flood of it. Every lantern in the hall leans toward you. Somebody drops a slate.');
      await say('brom', 'neutral', '…Cracked crystal. Old thing. Happens. NEXT.');
      await narr('Brom throws a cloth over it. The room goes very quiet. Two desks away, Dax Merrin isn\'t breathing. Then he smiles, like a man who just got told he was right.');
      f.crystalGreen = true; f.daxSaw = 1; Story.addSus(.5);
    } else {
      await narr('You breathe the way Vane taught you. The crystal stays a dull grey. Somebody laughs.');
      await narr('Dax Merrin doesn\'t laugh. He looks at the grey crystal, then at your hands — still, too still — and narrows his eyes.');
    }
    // STAGE 2 — the lottery
    await narr('Coloured tokens from a bag. Six teams of three. Corwin gets Hobb and two boys from Millbrook. Mirel ends up with three strangers who don\'t learn her name.');
    await say('brom', 'sad', 'You. Hood. You go in alone. I can\'t put your eyes in a team of strangers, and I can\'t put strangers\' lives next to your eyes. …Don\'t make that face. It\'s the kindest insult I\'ve got.');
    await say('dax', null, '"I don\'t take a team." / "I don\'t either," says a voice by the door — Liora, a spear across her back, already bored.');
    await narr('Everyone gets a plain grey Guild veil over the lower face — the Veil Rule: no names, no faces, only what you do. Eyes stay uncovered.');
    await say('brom', 'neutral', 'Each of you gets a watch crystal and a Recall Stone. Break the stone and you\'re pulled out — safe, and failed. Killing another applicant is forbidden. The Mirror sees everything.');
    await say('brom', 'neutral', 'The Quarry Gate. C-rank, stable two years. Objective: break the Core before the six-hour horn. Floor Two has a Sigil Door — one Guild Sigil of each colour opens it. Every team gets ONE sigil. Solos get two.');
    toast('You hold two Guild Sigils: <b style="color:#46ff95">Verdant</b> and <b style="color:#ff6a5a">Crimson</b>. The door also needs <b style="color:#5fb8ff">Azure</b>.', 4600);

    // STAGE 3 — THE QUARRY GATE
    await fadeOut(500); await fadeIn(500);
    await narr('FLOOR ONE — THE QUARRY STEPS. Ledges that crumble if you look at them wrong. Somewhere below, things that chitter.');
    await this.must({ enemies: ['gt_gloom', 'gt_rat', 'gt_gloom'], bd: 'warren', intro: 'The Quarry Steps — Gate-spawn!' });
    await narr('Hobb\'s team passes you on a ledge. He tips an imaginary hat. "See you at the bottom, hood!"');
    await narr('FLOOR TWO — THE HOLLOW MARKET. Rotten stalls, an old fountain full of dark water, and at the far end, a door of black stone with three empty sockets.');
    await this.must({ enemies: ['gt_spawn', 'gt_imp'], bd: 'crypt', intro: 'The Hollow Market' });
    await narr('A horn — not the Guild\'s. On the Watch Mirror a crystal goes dark. Later you will learn the name: Hobb Tanner. He held a Horned Brute off his team until they were through.');
    // the Sigil Door
    await narr('The Sigil Door. You set Verdant and Crimson into their sockets. The third socket waits, cold and blue.');
    await narr('Dax Merrin steps out of the dark on one side. Liora on the other. Dax has Azure and Crimson. Liora has Verdant and Azure.');
    const sd = await ask('me', 'neutral', '(You need an Azure.)', ['Ask Liora for her Azure.', 'Ask Dax for his Azure.', 'Fight the Mirror Shade that guards the spare Azure.']);
    if (sd === 0) {
      await say('liora', 'smirk', 'An Azure for a Crimson? You already put your Crimson in. …Fine. A favour, then. Owed. I\'ll collect at the worst possible moment.');
      f.lioraAlliance = 1; f.lioraAff = (f.lioraAff || 0) + 1; f.sigilTrades = 'liora';
    } else if (sd === 1) {
      await say('dax', null, '"Hold the door open after. If you shut it on me, I\'ll gut you." He slaps the Azure into your palm hard enough to hurt.');
      f.daxTrade = 1; f.sigilTrades = 'dax';
    } else {
      await this.must({ enemies: ['gt_shade'], bd: 'crypt', intro: 'The Mirror Shade — it carries a spare Azure Sigil' });
      f.sigilTrades = 'none';
    }
    await narr('The third socket takes the Azure. The black stone grinds open. Ten minutes, then it seals again.');
    await narr('Mirel\'s team comes running, white-faced, no sigils left. One of them is limping.');
    const hd = await ask('me', 'neutral', '(The door is already grinding shut.)', ['Hold it open for them.', 'Go through. Every second counts.']);
    if (hd === 0) { await narr('You put your shoulder under the stone. It is heavier than anything has a right to be. They make it through. Mirel says "thank you" four times.'); f.heldDoor = 1; if (typeof Opinion !== 'undefined') Opinion.add('hope', .5); }
    else await narr('You go through. Behind you, the door booms shut. You hear them hammering on it for a long time.');
    // FLOOR THREE
    await narr('FLOOR THREE — THE WEEPING HALL. Every sound comes back wrong: footsteps from the left when they\'re on the right, a voice you know calling from a wall.');
    await narr('Corwin\'s team is ahead of you. Corwin is laughing at the echoes. "It\'s a trick, idiots, it\'s just sound—"');
    await narr('Something pale peels itself off the ceiling. Corwin doesn\'t finish the sentence. On the Mirror, a second crystal goes dark.');
    const ms = await ask('me', 'shock', '(Another stalker drops toward Mirel\'s team. Mirel is closest.)', ['Run for Mirel.', 'Keep moving — you can\'t save everyone.']);
    if (ms === 0 || f.heldDoor) {
      await this.must({ enemies: ['gt_stalker', 'gt_stalker'], bd: 'crystal', intro: 'Pale Stalkers — they hunt the weakest first' });
      if (ms === 0) { f.mirelSaved = 1; await say('mirel', null, '"You came back. Nobody comes back. …I\'m going to be a very good healer. I\'m going to owe you forever."'); }
      else { await narr('You fight your own way through. By the time you look back, Mirel\'s team is gone — and on the Mirror, a third crystal has gone dark.'); }
    } else await narr('You keep moving. Behind you, a scream that the hall repeats nine times. On the Mirror, a third crystal goes dark.');
    // Dace in trouble
    await narr('Near the hall\'s end, Dax Merrin is backed against a pillar, two stalkers on him, his short sword gone.');
    const dd = await ask('me', 'neutral', '(He came here to spy on you. He hates you.)', ['Cut them off him.', 'Leave him. He made his choice.']);
    if (dd === 0) {
      await this.must({ enemies: ['gt_stalker', 'gt_stalker'], bd: 'crystal', intro: 'Pale Stalkers on Dax Merrin' });
      f.daceSaved = 1; await say('dax', null, '"…I didn\'t need that." He doesn\'t thank you. He also doesn\'t look away.');
    } else { await narr('You leave him. Later, you find out a stalker\'s claw caught his arm and he still made it through. When he sees you, his eyes say he knows exactly what you did.'); f.daceLeft = 1; }
    // FLOOR FOUR — the Anomaly
    await narr('FLOOR FOUR — THE CORE CHAMBER. A cavern under the quarry. In the middle, held up by chains as thick as a man, a pulsing green light.');
    await narr('Then the light SURGES. The floor bucks. Every watch crystal on every wrist turns black. Somewhere far above, a horn that is not the Guild\'s starts blowing and doesn\'t stop.');
    await narr('The Gate just jumped from C to B. The Mirror can\'t see you. Nobody is coming.');
    await narr('The chains move. They were never holding the light up. They were WRAPPED around something — and it\'s standing.');
    const withL = f.lioraAlliance || (f.lioraAff || 0) >= 2;
    if (withL) await say('liora', (f.lioraAff || 0) >= 4 ? 'happy' : 'neutral', (f.lioraAff || 0) >= 4 ? 'Hey. Hey — look at me. Eleven steps. We\'ve got this.' : 'That favour you owe me? I\'m collecting. Stand there and don\'t die.');
    if (typeof Art !== 'undefined' && Art.cut.hm_heart && typeof paintShot === 'function') await Cine.play([paintShot('hm_heart', 3000, [['', 'The heart of the pocket: a floating ring of broken stone, chained pillars — and the Core, beating like something alive.', '#9dffc8']], { y: 330 })]);
    await this.must({ enemies: ['gt_warden'], allies: withL ? ['liora'] : [], boss: true, bd: 'crypt', music: 'boss', intro: 'THE HOLLOW WARDEN — the Gate is B-rank now' }, 'The Warden\'s chain throws you into the wall. You taste blood and stone — and get up again.');
    f.anomalySurvived = 1;
    // the Core choice
    await narr('The Warden falls apart into gravel and chain. Behind it, the Core: a green stone the size of a fist, set in a Crown Registry bracket. Someone PUT it here.');
    await narr('You touch it — and for half a breath, under the hum, there is a second voice. Not Fratenaptor\'s. Older. Colder. Interested.');
    const core = await ask('me', 'shock', '(A Heartshard. Breaking it closes the Gate and destroys the shard. Sealing it closes the Gate and leaves the shard in your hand.)', ['Seal it — and keep it.', 'Break it.']);
    if (core === 0) { f.coreChoice = 'sealed'; Stones.give('quarry'); await narr('You press your sigil-hand to it and the Gate exhales. The shard goes quiet in your palm. Mostly quiet.'); }
    else { f.coreChoice = 'broke'; await narr('You break it. It screams — and then it is just green dust on the floor. The Gate starts to close around you.'); }
    f.gateObjectiveDone = 1;

    // STAGE 4 — the ceremony
    await fadeOut(600); await fadeIn(600);
    await narr('Daylight. The Gate Plaza is full again. The Gate turns overhead. Somebody is selling snacks. A little girl on her father\'s shoulders is waving a blue Guild flag.');
    const dead = f.mirelSaved ? ['Hobb Tanner', 'Corwin'] : ['Hobb Tanner', 'Corwin', 'Mirel'];
    await say('brom', 'sad', `${dead.length === 2 ? 'Two' : 'Three'} of ours did not walk out of the Quarry Gate. ${dead.join(', ')}. Remember their names.`);
    await narr('Brom hands out black ribbons. His hands aren\'t steady. Then he reads the survivors, one by one — and yours is one of them.');
    await say('brom', 'neutral', 'And the Quarry Gate was NOT C-rank. We rated it C. The Registry\'s surveyors were down there a month ago, and now there\'s a Crown bracket on the Core. When I find the Regent\'s man who signed that order…');
    f.licenseGranted = true; this.rankUp('E');
    sfx('level'); toast('You are a <b style="color:#46ff95">licensed adventurer</b>. Guild Card, Guild Crest — free travel, Guild lodges, and the Crown can\'t arrest you on suspicion alone. Suspicion gains are halved.', 6000);
    if (f.mirelSaved) await say('mirel', null, '"Maren\'s taking me on full-time. When you get hurt — and you WILL get hurt — come to me first."');

    // STAGE 5 — the tournament
    await say('brom', 'neutral', 'The eight best of you fight for rank. One on one, Guild yard, tomorrow. Win a bout, earn a letter. Reach the final, and you leave here C-rank.');
    await narr('The bracket goes up on the board: you against Ser Tobias Wend. Dax against Faelan. Liora against Brenna Ironvein. Samira of Solmere against Eirik Stormborn.');
    f.tournamentResult = 'qf';
    let r = await this.duel('gt_tobias', 'ashford', 'Quarterfinal — Ser Tobias Wend, the Crown squire', 'Tobias: "Creed is discipline! Discipline beats talent!"');
    if (r === 'win') {
      this.rankUp('D'); toast('Quarterfinal won — <b>D-RANK</b>.', 3000);
      await narr('Dax beats Faelan in under a minute. Liora disarms Brenna and hands the hammer back. Samira dances circles around Eirik until he laughs and yields.');
      f.tournamentResult = 'sf';
      await say('dax', null, '"Five years. Kairo waited five years for you, and you went off to learn sword tricks from an old man. Let\'s see if they were worth it."');
      r = await this.duel('gt_dax', 'ashford', 'Semifinal — Dax Merrin', 'Dax: "Five years! Do you know what we did for five YEARS?!"');
      if (r === 'win') {
        const m = await ask('me', 'neutral', '(Dax is on one knee, his headband gone, the Green Eclipse knot showing under his sleeve.)', ['Offer him a hand.', 'Walk away.']);
        if (m === 0) { f.daceFight = 'mercy'; await say('dax', null, '"…Don\'t." He doesn\'t take it. But he looks at your hand for a long time.'); }
        else { f.daceFight = 'nomercy'; f.kairoTrust = (f.kairoTrust || 0) - 1; await narr('You walk away. Behind you, Dax laughs once, ugly. "That\'s the one. That\'s the one Kairo remembers."'); }
        await narr('Liora wins her semifinal against Samira without taking a single hit.');
        this.rankUp('C'); toast('Into the final — <b style="color:#7fd8ff">C-RANK</b>.', 3200); f.tournamentResult = 'final';
        if (f.lioraPin) await narr('Before the final, you touch the hairpin in your pocket. Across the yard, Liora sees you do it. She looks away first.');
        await say('liora', (f.lioraAff || 0) >= 3 ? 'happy' : 'smirk', (f.lioraAff || 0) >= 3 ? 'Don\'t hold back. If you hold back I\'ll know, and I\'ll never forgive you.' : 'Sheathe slower. You\'re telegraphing it.');
        r = await this.duel('gt_liora', 'ashford', 'THE FINAL — Liora', 'Liora: "Eleven steps, Sword Saint\'s student. You\'re on three."');
        if (r === 'win') {
          f.lioraFinal = 'won'; f.tournamentResult = 'champion'; f.questTitle = 'Victor of the Quarry'; G.S.qitems = G.S.qitems || {}; G.S.qitems.runeVoucher = 1;
          await say('liora', 'happy', (f.lioraAff || 0) >= 3 ? '…Good. Now I don\'t have to carry you through Greyspire.' : 'Good. Now I don\'t have to carry you through Greyspire.');
          sfx('level'); toast('CHAMPION — title <b>Victor of the Quarry</b> and a rune-smith\'s commission voucher for Hammerdeep.', 5000);
        } else {
          f.lioraFinal = 'lost'; f.tournamentResult = 'runnerup'; G.S.qitems = G.S.qitems || {}; G.S.qitems.gearVoucher = 1;
          await say('liora', 'happy', 'Next time, sheathe slower.'); await narr('She offers you a hand up. Her grip is warm and very strong.');
          toast('Runner-up — a Guild gear voucher.', 3200);
        }
      } else { f.daceFight = 'lost'; await say('dax', null, '"…Huh. I won." He sounds more surprised than you are.'); await narr('From the stands you watch Liora take the final. Dax lasts longer than anyone expects.'); }
    } else await narr('You watch the rest from the stands. Liora wins it all. She doesn\'t look happy about it — she looks like someone counting.');
    Story.gainXp(160); G.S.gold += 120; UI.hud();

    // STAGE 6 — aftermath
    await narr('That evening a notice goes up on the board, Crown seal and all: HUNTERS WANTED — ESCORT PRISONERS TO GREYSPIRE CITADEL. LICENSED ADVENTURERS ONLY.');
    await me('determined', '(That\'s the way in.)');
    await narr('Outside the hall, Dax Merrin ties a green-edged knot to a crow\'s leg and lets it go north.');
    await narr('A day later, a crow comes back. One line, in a burned hand: "Tell her she\'s still not joining me. …And tell my brother I heard."');
    await say('liora', 'neutral', 'I\'ve got my license. You\'ve got yours. See you on the Greyspire road, Sword Saint\'s student.');
    f.trial = 'done'; this.active = 0;
    Story.trialEnd && await Story.trialEnd();
  }
};
/* licensed: Suspicion gains are halved */
(function () {
  const _as = Story.addSus.bind(Story);
  Story.addSus = function (n, quiet) { if (n > 0 && G.S && G.S.f && G.S.f.licenseGranted) n = n / 2; return _as(n, quiet); };
  // walking into the Guild hall starts the Trial
  const _l = World.load.bind(World);
  World.load = async function (name, x, y, dir) {
    const r = await _l(name, x, y, dir);
    try { if (G.S.f.trial === 'running' && !Trial.active) G.S.f.trial = 'open';   // a save made mid-Trial starts it over from the hall
      if (name === 'hm_hall' && G.S.f.trial === 'open' && G.S.f.hmAnn && G.mode === 'world') setTimeout(() => { if (G.S.f.trial === 'open' && !World.busy) Story.run(() => Trial.run()); }, 900); } catch (e) { }
    return r;
  };
  // the Guild ledger: Trial status on the Quests page
  if (typeof questsMenuHTML === 'function') {
    const _q = questsMenuHTML;
    questsMenuHTML = function () { const f = G.S.f; let h = _q(); if (!f.trial) return h;
      const st = (ok, t) => `<p>${ok ? '<b style="color:#46ff95">✓</b>' : '<b style="color:#ffd36a">○</b>'} ${t}</p>`;
      return h + `<div class="stat" style="margin-top:6px"><h3 style="color:#7fd8ff">The Guild Trial</h3>${st(f.trial === 'running' || f.trial === 'done', 'Report to the Great Hall in Highmark')}${st(f.gateObjectiveDone, 'Survive the Quarry Gate')}${st(f.trial === 'done', 'The duels')}</div>`; };
  }
})();
