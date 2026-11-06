'use strict';
/* ================= HIGHMARK: GLOAMWOOD, CONTRACTS, THE BANDIT KINGS' MEN, THE CARRIAGE ROAD =================
   - Gloamwood: Highmark's monster forest, south of the Guild Quarter. Tall grass = monsters. Four places:
       the Gilded Hound toll camp (W) · the old Humming Shrine (E) · the Alpha's den (N) · the Briar Riders' thorn hollow (SW)
   - Four Highmark contracts on the great quest board (no licence needed: they're posted as open bounties)
   - The Eight Bandit Kings' men are everywhere in Highmark: Varro Kade's Gilded Hound toll-men on the roads,
     the Velvet Knife's cutters in the Whisper Ward, the Thornwall Twins' Briar Riders drinking on Lantern Row
   - The Crown Road between Ashford and Highmark: a paid carriage (40 gold), and on the way, THE INFORMANT —
     a logic puzzle: three passengers, one of them is a Crown Registry informant and lies. Find them.
   - Breakthroughs get a proper quest line on the HUD when your aura is walled, plus a Quests-page entry. */
Object.assign(CHAR, { hm_hound: { name: 'Gilded Hound Toll-Man', sprite: 'bandit' }, hm_cutter: { name: 'Velvet Cutter', sprite: 'elf_f1' },
  hm_briar: { name: 'Briar Rider', sprite: 'folk14' }, hm_coachman: { name: 'Coachman Pell', sprite: 'folk9' } });
const CL = (base, o) => Object.assign({}, ENEMY[base], { img: ENEMY[base].img || base }, o);
Object.assign(ENEMY, {
  hound_toll: CL('bandit', { name: 'Gilded Hound Toll-Man', hp: 58, atk: 12, def: 3, trait: 'Varro Kade\'s man — gilded collar, iron knuckles' }),
  hound_capt: CL('rook', { name: 'Toll-Captain Brask', hp: 150, atk: 15, def: 5, spd: 14, boss: 1, size: 1.12, xp: 70, gold: 60, trait: 'The Gilded Hound\'s collector — sand in your eyes, then the knuckles' }),
  briar_rider: CL('bandit', { name: 'Briar Rider', hp: 74, atk: 14, def: 4, spd: 15, dodge: .28, xp: 30, gold: 24, trait: 'The Thornwall Twins\' raider — thorn-whip and short bow' }),
  knife_cutter: CL('rook', { name: 'Velvet Cutter', hp: 80, atk: 15, def: 3, spd: 17, dodge: .35, parry: .2, xp: 34, gold: 30, trait: 'The Velvet Knife\'s agent — never fights fair, never fights long' }),
  gloam_alpha: CL('lupine_alpha', { name: 'The Gloam Alpha', hp: 280, atk: 17, def: 5, spd: 13, boss: 1, beast: 1, size: 1.45, brk: 130, xp: 160, gold: 90, trait: 'A great beast — the forest\'s oldest wolf. Howls up its pack' })
});
Object.assign(TIER, { hound_toll: 'D', hound_capt: 'C', briar_rider: 'C', knife_cutter: 'C', gloam_alpha: 'C' });

/* ---------------- contracts ---------------- */
const HMQ = {
  toll: { name: 'Toll-Men on the Gloam Road', who: 'Varro Kade, the Gilded Hound', desc: 'The Gilded Hound has built a toll camp in western Gloamwood and is robbing Guild couriers. Break the camp and its captain.', gold: 140, xp: 110, fame: 3 },
  briar: { name: 'The Briar Riders\' Cache', who: 'Sable & Sorrel, the Thornwall Twins', desc: 'Briar Riders stole a Guild supply cart and hid it in the thorn hollow, south-west Gloamwood. Take it back.', gold: 120, xp: 100, fame: 2 },
  shrine: { name: 'The Humming Shrine', who: 'Lysandra Voe, the Velvet Knife', desc: 'Something at the old shrine in eastern Gloamwood has started to hum. Find out what — and who else is looking.', gold: 110, xp: 100, fame: 2 },
  alpha: { name: 'The Gloam Alpha', who: '', desc: 'A great beast has taken the den at the north end of Gloamwood. Hunters call it the Gloam Alpha. Kill it. (A great beast of C-grade — it counts for the B-grade breakthrough.)', gold: 180, xp: 160, fame: 4 }
};
const HQ = {
  st() { const f = G.S.f; f.hmq = f.hmq || {}; return f.hmq; },
  on(id) { return this.st()[id] === 'on'; }, done(id) { return this.st()[id] === 'done'; },
  take(id) { if (this.st()[id]) return; this.st()[id] = 'on'; sfx('blip'); toast(`Contract taken: <b style="color:#ffd36a">${HMQ[id].name}</b> — ${HMQ[id].desc}`, 5200); },
  finish(id) { const q = HMQ[id]; this.st()[id] = 'done'; G.S.gold += q.gold; Story.gainXp(q.xp); UI.hud(); sfx('level');
    toast(`<b style="color:#46ff95">Contract complete</b> — ${q.name}. +${q.gold} gold, +${q.xp} XP.`, 4200);
    try { if (typeof Rep !== 'undefined') Rep.deed(q.fame, q.name, null, q.fame); } catch (e) { } },
  async board() {
    const ids = Object.keys(HMQ), open = ids.filter(id => !this.st()[id]);
    await narr('The great quest board. Bounties from six kingdoms are nailed three deep. Four of them are stamped HIGHMARK — OPEN BOUNTY, NO LICENCE REQUIRED.');
    if (!open.length) { await narr(ids.every(id => this.done(id)) ? 'Every Highmark bounty has your name scrawled across it in a clerk\'s hand: PAID.' : 'You\'ve taken every Highmark bounty. They\'re all in Gloamwood — south through the Guild Quarter.'); return; }
    const c = await ask(null, null, 'Take a bounty?', open.map(id => HMQ[id].name).concat(['Not now']));
    Dlg.close(); if (c < open.length) { this.take(open[c]); await narr(`${HMQ[open[c]].desc} Gloamwood is south of the Guild Quarter — down the road past the archery range.`); }
  }
};

/* ---------------- Gloamwood ---------------- */
SCENES.gloam = {
  map: 'gloam', title: 'Gloamwood', subtitle: 'Highmark\'s monster forest', music: 'woods', bd: 'forest', encRate: .12,
  encounters() { const r = Math.random(), hi = Power.now().i >= 2;
    const L = [['lupine'], ['lupine', 'lupine'], ['m_goblin', 'm_goblin'], ['m_tusker'], ['m_goblin_shaman', 'm_goblin'], ['hound_toll'], ['hound_toll', 'lupine']];
    if (hi) L.push(['m_orc'], ['briar_rider'], ['m_tusker', 'lupine'], ['knife_cutter']);
    return { enemies: L[Math.floor(r * L.length)], bd: 'forest' }; },
  exits: [{ x: 23, x2: 26, y: 33, to: 'hm_guild', tx: 21, ty: 21, dir: 'up', label: 'Highmark — Guild Quarter' }],
  tiles: {},
  npcs() {
    const L = [];
    if (!HQ.done('toll')) L.push({ id: 'g_brask', sprite: 'rook', x: 9, y: 14, dir: 'down', talk: () => gloamFight('toll'), qm: () => HQ.on('toll') ? '!' : null },
      { id: 'g_hound1', sprite: 'bandit', x: 7, y: 13, dir: 'right', talk: () => gloamFight('toll') });
    if (!HQ.done('briar')) L.push({ id: 'g_briar', sprite: 'folk14', x: 9, y: 26, dir: 'right', talk: () => gloamFight('briar'), qm: () => HQ.on('briar') ? '!' : null });
    if (!HQ.done('shrine')) L.push({ id: 'g_cutter', sprite: 'elf_f1', x: 41, y: 12, dir: 'down', talk: () => gloamFight('shrine'), qm: () => HQ.on('shrine') ? '!' : null });
    if (!HQ.done('alpha')) L.push({ id: 'g_alpha', sprite: 'lupine_alpha', x: 24, y: 5, dir: 'down', size: 1.3, talk: () => gloamFight('alpha'), qm: () => HQ.on('alpha') ? '!' : null });
    return L;
  }
};
async function gloamFight(id) {
  if (!HQ.st()[id]) HQ.take(id);
  const P = {
    toll: [['hm_hound', '"Road\'s closed, hood. Kade\'s road. Toll is everything in your pockets — and your boots, they look comfy."'], { enemies: ['hound_toll', 'hound_capt', 'hound_toll'], bd: 'forest', intro: 'The Gilded Hound toll camp!' },
      ['You kick the gilded toll-box over. Out spill Guild courier seals — dozens of them — and a letter: "Every Guild coach on the Crown Road. Every one. — V.K."']],
    briar: [['hm_briar', '"Thornwall says hello. Thornwall also says that cart\'s ours now. Thornwall\'s very generous like that."'], { enemies: ['briar_rider', 'briar_rider'], bd: 'forest', intro: 'Briar Riders in the thorn hollow!' },
      ['The stolen cart is still loaded: Guild healing tonics, and one crate stamped with the Twins\' briar — full of Crown Registry seals, all forged.']],
    shrine: [['hm_cutter', '"The Velvet Knife sends her regards. She\'d like whatever is humming in that shrine. You\'d like to keep breathing. Let\'s trade."'], { enemies: ['knife_cutter', 'knife_cutter'], bd: 'forest', intro: 'Velvet Cutters at the Humming Shrine!' },
      ['Under the shrine\'s cracked altar, a sliver of green stone is buzzing like a trapped bee. A Heartshard splinter — too small to hold a will. The Velvet Knife wanted it anyway.']],
    alpha: [[null, 'The den stinks of old blood. Something huge unfolds out of the dark — a wolf the size of a cart-horse, grey muzzle, one eye milky white.'], { enemies: ['gloam_alpha', 'lupine'], bd: 'forest', boss: true, music: 'boss', intro: 'THE GLOAM ALPHA — a great beast' },
      ['The Alpha falls. Its last breath goes out of it slowly — and, if the old Drag hunters were right, into you.']]
  }[id];
  if (P[0][0]) await say(P[0][0], null, P[0][1]); else await narr(P[0][1]);
  const r = await Battle.start(Object.assign({ noFlee: true }, P[1]));
  if (r !== 'win') { Story.heal(true); await narr('You stagger back down the path to the clearing. You\'ll be back.'); return; }
  for (const l of P[2]) await narr(l);
  if (id === 'shrine') { G.S.items = G.S.items || {}; G.S.items.ether = (G.S.items.ether || 0) + 2; toast('The splinter hums in your pocket. (+2 Ethers from the cutters\' packs.)', 3000); }
  if (id === 'briar') { G.S.items.tonic = (G.S.items.tonic || 0) + 3; }
  HQ.finish(id); await World.load('gloam', G.S.x, G.S.y, G.S.dir);
}

/* ---------------- the Bandit Kings' men in the city ---------------- */
(function () {
  const add = (sc, f) => { const prev = SCENES[sc].npcs; SCENES[sc].npcs = () => prev().concat(f()); };
  add('hm_gate', () => G.S.f.hmTollPaid === G.S.day ? [] : [{ id: 'hm_hound', sprite: 'bandit', x: 19, y: 4, dir: 'right', talk: async () => {
    const c = await ask('hm_hound', null, '"Road tax, friend. Kade\'s tax. The Guild owns the Gate — the Gilded Hound owns the ROADS. Ten gold."', ['Pay 10 gold', 'Tell him where to put his tax', '(Walk away)']);
    Dlg.close();
    if (c === 0 && G.S.gold >= 10) { G.S.gold -= 10; G.S.f.hmTollPaid = G.S.day; UI.hud(); await say('hm_hound', null, '"Pleasure doing business. Tell your friends. Tell them to bring more."'); }
    else if (c === 1) { const r = await Battle.start({ enemies: ['hound_toll', 'hound_toll'], bd: 'town', intro: 'The Gilded Hound\'s road-tax men' }); if (r === 'win') { G.S.f.hmTollPaid = G.S.day; await narr('The Guild wardens on the wall pretend not to have seen. One of them gives you a very small thumbs up.'); } else Story.heal(true); } } }]);
  add('hm_ward', () => [{ id: 'hm_cutter', sprite: 'elf_f1', x: 3, y: 15, dir: 'right', talk: async () => {
    await say('hm_cutter', null, HQ.done('shrine') ? '"You took our little splinter. The Knife isn\'t angry. The Knife is INTERESTED. That\'s so much worse, darling."' : '"Lovely hood. The Velvet Knife collects lovely things. Mostly secrets. Sometimes people. There\'s a shrine in Gloamwood humming her name — stay away from it."'); } }]);
  add('hm_lantern', () => [{ id: 'hm_briar', sprite: 'folk14', x: 16, y: 14, dir: 'down', talk: async () => {
    await say('hm_briar', null, HQ.done('briar') ? '"…You\'re the one who took the cart. The Twins have a list, you know. You\'re near the top. Congratulations."' : '"Briar Riders drink free on Lantern Row. Don\'t ask why. The innkeepers don\'t."'); } }]);
  // the quest board and the way down to Gloamwood
  for (const k of ['23,18', '24,18', '25,18', '26,18', '27,18', '23,17', '25,17']) SCENES.hm_guild.tiles[k] = () => HQ.board();
  SCENES.hm_guild.exits.push({ x: 20, x2: 22, y: 23, to: 'gloam', tx: 24, ty: 31, dir: 'up', label: 'Gloamwood (monster forest)' });
  SCENES.hm_guild.tiles['21,21'] = async () => narr('A signpost: GLOAMWOOD — MONSTERS — TOLL-MEN — DO NOT FEED THE ALPHA.');
})();

/* ---------------- the Crown Road carriage and THE INFORMANT ---------------- */
const Coach = {
  FARE: 40,
  async ride(to) {
    const S = G.S, fare = this.FARE;
    const c = await ask('hm_coachman', null, `"${to === 'hm' ? 'Highmark, the mother city' : 'Ashford Hollow'} — half a day down the Crown Road. ${fare} gold a seat. Pay up front; the road\'s got opinions about people who pay later."`,
      [S.gold >= fare ? `Pay ${fare} gold` : `Pay what you have (${S.gold} gold)`, 'Not today']);
    Dlg.close(); if (c !== 0) return false;
    S.gold = Math.max(0, S.gold - fare); UI.hud(); sfx('coin');
    await fadeOut(500); await fadeIn(400);
    await narr('The carriage rattles out onto the Crown Road. Fields, then forest, then a long climb with the Gate\'s green glow growing on the horizon.');
    await this.informant();
    await fadeOut(500);
    if (typeof ASH2 !== 'undefined' && to !== 'hm') ASH2.raw = 1;
    if (to === 'hm') await World.load('hm_gate', 21, 21, 'up'); else await World.load('ashford', 21, 4, 'down');
    save(); UI.hud(); await fadeIn(500); banner(to === 'hm' ? 'Highmark' : 'Ashford Hollow', to === 'hm' ? 'Mother city of the Guild' : 'Market town of the eastern vale', 1600);
    if (typeof Cal !== 'undefined') S.day = (S.day || 1);
    return true;
  },
  // three passengers, exactly one is lying — find them from what they say
  puzzle() {
    const P = [['a wool merchant with ink-stained fingers', 'the merchant'], ['a grey-haired priestess of the Ember', 'the priestess'], ['a young soldier on leave', 'the soldier'], ['a halfling cheese-seller', 'the halfling'],
      ['a dwarf with a toolbag', 'the dwarf'], ['an elf poet', 'the poet'], ['a nervous clerk', 'the clerk'], ['a farm wife with a basket of eggs', 'the farm wife']];
    const pick3 = P.slice().sort(() => Math.random() - .5).slice(0, 3), pool = pick3.map(p => p[0]), names = pick3.map(p => p[1]);
    for (let tries = 0; tries < 400; tries++) {
      const liar = Math.floor(Math.random() * 3), st = [];
      for (let i = 0; i < 3; i++) { const j = (i + 1 + Math.floor(Math.random() * 2)) % 3, kind = Math.random() < .5 ? 'honest' : 'liar'; st.push({ i, j, kind }); }
      // a statement "j is honest" / "j is the informant" is TRUE when it matches reality; liars always lie, honest folk never do
      const ok = L => st.every(s => { const truth = s.kind === 'liar' ? s.j === L : s.j !== L; return s.i === L ? !truth : truth; });
      const sols = [0, 1, 2].filter(ok);
      if (sols.length === 1 && sols[0] === liar) return { pool, names, liar, st };
    }
    return null;
  },
  async informant() {
    const S = G.S, z = this.puzzle(); if (!z) return;
    await narr(`Three other passengers share the carriage: ${z.pool[0]}, ${z.pool[1]}, and ${z.pool[2]}.`);
    await say('hm_coachman', null, '"Word of warning, hood. The Registry pays one rider on every coach to listen. I don\'t know which. I\'d rather not have them on my roof."');
    await narr('You keep your eyes down and listen. Honest folk tell the truth. The informant will lie — about everyone.');
    const cap = s => s.charAt(0).toUpperCase() + s.slice(1);
    for (const s of z.st) await narr(`${cap(z.names[s.i])}: "${s.kind === 'liar' ? `${cap(z.names[s.j])} is the Registry\'s ear, I\'d bet my life on it.` : `${cap(z.names[s.j])}? Honest as bread. I\'ve known the type all my life.`}"`);
    const c = await ask('me', 'neutral', '(Exactly one of them is lying. Who is the informant?)', z.names.map(cap).concat(['(Say nothing.)']));
    Dlg.close();
    if (c === z.liar) {
      await narr(`You lean across and say it quietly: you know. ${cap(z.names[c])} goes pale — then pulls a Registry badge and a half-written report with "green eyes?" scrawled on it.`);
      await say('hm_coachman', 'happy', '"Off. OFF. Walk to the next milestone and tell the Registry the road was lovely." He hands you back half your fare.');
      S.gold += Math.round(this.FARE / 2); S.f.informants = (S.f.informants || 0) + 1; UI.hud();
      try { if (typeof Rep !== 'undefined') Rep.deed(1, 'unmasked a Registry informant on the Crown Road', null, 2); } catch (e) { }
    } else if (c === 3) {
      await narr('You say nothing. At the next milestone one of them gets out early and hurries off toward a Crown post. You never learn which one.');
      Story.addSus(.25);
    } else {
      await narr(`${cap(z.names[c])} stares at you, hurt. The real informant smiles into their collar — and at the next toll bridge, two Registry hunters are waiting.`);
      const r = await Battle.start({ enemies: ['stone_hunter', 'stone_hunter'], bd: 'field', intro: 'Registry hunters at the toll bridge!' });
      if (r !== 'win') { Story.heal(true); Story.addSus(.5); await narr('They take your purse instead of you. Barely.'); S.gold = Math.floor(S.gold / 2); UI.hud(); }
    }
    // the Gilded Hound owns the bridges
    if (Math.random() < .35) {
      await narr('Halfway across the Ashen River bridge, the carriage jerks to a stop. Gilded collars. Iron knuckles. "Bridge toll! Kade\'s bridge!"');
      const t = await ask('me', 'neutral', '(Varro Kade\'s toll-men want 15 gold from every passenger.)', ['Pay 15 gold', 'Get out and fight']);
      Dlg.close();
      if (t === 0) { S.gold = Math.max(0, S.gold - 15); UI.hud(); }
      else { const r = await Battle.start({ enemies: ['hound_toll', 'hound_toll'], bd: 'field', intro: 'Gilded Hound toll-men on the bridge' }); if (r !== 'win') Story.heal(true); }
    }
  }
};
(function () {
  // the carriage replaces the free coach in both directions
  const g = SCENES.hm_gate.exits.find(e => e.check); if (g) { g.label = 'Crown Road — carriage to Ashford (40g)'; g.check = async () => { await Coach.ride('ash'); return false; }; }
  const prevG = SCENES.hm_gate.npcs; SCENES.hm_gate.npcs = () => prevG().map(n => n.id === 'hm_coach' ? Object.assign(n, { id: 'hm_coachman', talk: () => Coach.ride('ash') }) : n);
  if (typeof ASH2 !== 'undefined') {
    const _n = ASH2.npcsFor.bind(ASH2);
    ASH2.npcsFor = function (d) { return _n(d).map(n => n.id === 'hm_coach' ? Object.assign(n, { id: 'hm_coachman', talk: () => Coach.ride('hm') }) : n); };
  }
  Object.assign(CHAR.hm_coachman, { name: 'Coachman Pell' });
})();

/* ---------------- breakthroughs: always say what the next one is, and how ---------------- */
(function () {
  const _h = UI.hud.bind(UI);
  UI.hud = function () { const r = _h.apply(this, arguments);
    try { if (typeof Break !== 'undefined' && G.S && !G.S.kid && Break.walled()) { const g = Break.next(), B = BREAK[g], o = $('#obj');
      if (B && o) { o.style.display = ''; o.innerHTML += `${G.S.quest ? '<br>' : ''}<b style="color:#ff6a5a">⚡</b> <span style="color:#ffb0a0">Breakthrough to ${g}: ${esc(B.name)} — ${esc(B.hint)}</span>`; } } } catch (e) { }
    return r; };
  if (typeof questsMenuHTML === 'function') {
    const _q = questsMenuHTML;
    questsMenuHTML = function () { let h = _q();
      try { const st = HQ.st(), ids = Object.keys(HMQ).filter(id => st[id]);
        if (ids.length) h += `<div class="stat" style="margin-top:6px"><h3 style="color:#9fc8ff">Highmark contracts</h3>${ids.map(id => `<p>${st[id] === 'done' ? '<b style="color:#46ff95">✓</b>' : '<b style="color:#ffd36a">○</b>'} <b>${HMQ[id].name}</b> <span class="muted">— ${HMQ[id].desc}${HMQ[id].who ? ' (' + HMQ[id].who + '\'s men)' : ''}</span></p>`).join('')}</div>`;
        if (typeof Break !== 'undefined' && !G.S.kid) { const g = Break.next(), B = g && BREAK[g];
          if (B) h += `<div class="stat" style="margin-top:6px;border:1px solid ${Break.walled() ? '#ff5050' : '#5a4a2a'}"><h3 style="color:#ffb0a0">⚡ Next breakthrough · ${g}-grade · ${B.name}</h3>
            <p>${B.hint}</p><p class="muted">${Break.walled() ? 'Your aura is RED and full — experience is being banked until you do this. Do it, and all of it pours in at once.' : 'Your aura isn\'t full yet. Keep fighting — when it burns red, this is the wall.'} Who can tell you more: ${B.who}.</p></div>`; } } catch (e) { }
      return h; };
  }
  // the people the hint names actually say it
  const tip = async () => { const g = Break.next(), B = g && BREAK[g]; if (!B) return false;
    await narr(`(About your aura — the ${g}-grade wall, "${B.name}": ${B.hint})`); return true; };
  if (typeof talkAldric === 'function') { const _a = talkAldric; talkAldric = async function () { await _a(); if (typeof Break !== 'undefined' && Break.walled()) { await say('aldric', 'neutral', '"Your aura\'s burning red, applicant. You\'ve hit a wall. Everyone does. Experience won\'t move it — only doing the thing will."'); await tip(); } }; SCENES.hm_office.npcs = () => [{ id: 'aldric', sprite: 'gideon', x: 14, y: 11, dir: 'down', talk: talkAldric }]; }
})();

/* the carriage stops are easy to find: a sign over each coachman, a quest pointer, and a button on the world map */
(function () {
  const _r = World.render.bind(World);
  World.render = function (c, t) {
    _r(c, t);
    try { if (G.mode !== 'world' || this.loading) return;
      const e = (this.ents || []).find(n => n.id === 'hm_coachman'); if (!e) return;
      const txt = G.S.map === 'ashford' ? '🐎 Carriage to Highmark · 40g' : '🐎 Carriage to Ashford · 40g';
      const x = e.px - Math.round(this.cam.x), y = e.py - 62 - Math.round(this.cam.y);
      c.save(); c.font = '800 9px Nunito, system-ui'; c.textAlign = 'center'; c.textBaseline = 'middle'; const w = c.measureText(txt).width + 12;
      c.fillStyle = 'rgba(60,30,8,.85)'; c.beginPath(); c.roundRect ? c.roundRect(x - w / 2, y - 8, w, 16, 7) : c.rect(x - w / 2, y - 8, w, 16); c.fill();
      c.strokeStyle = '#ffd36a'; c.lineWidth = 1; c.stroke(); c.fillStyle = '#ffe7a8'; c.fillText(txt, x, y + .5); c.restore();
    } catch (x) { }
  };
  // fast travel between the two cities = the carriage (from anywhere in either town)
  if (typeof mapMenuHTML === 'function') {
    const _h = mapMenuHTML; mapMenuHTML = function () { let h = _h();
      const here = G.S.map, inA = typeof ASH2 !== 'undefined' && ASH2.isD(here), inH = typeof HM !== 'undefined' && HM.is(here);
      if ((inA || inH) && G.S.f.vaneDone && !G.S.kid) h = `<div class="stat" style="margin-bottom:6px;border:1px solid #ffd36a"><h3 style="color:#ffd36a">🐎 Carriage</h3><p class="muted">The Crown Road coach runs between Ashford Hollow and Highmark. ${Coach.FARE} gold a seat. Coach stops: Ashford's Market Square (top of the square, by the road to Chapel Hill) · Highmark's Crown Road Gate.</p><div class="btnrow"><button class="btn" data-coach="${inA ? 'hm' : 'ash'}">Take the carriage to ${inA ? 'Highmark' : 'Ashford'}</button></div></div>` + h;
      return h; };
    document.addEventListener('pointerdown', e => { const b = e.target.closest && e.target.closest('[data-coach]'); if (!b) return; e.preventDefault(); UI.closeMenu(); Story.run(() => Coach.ride(b.dataset.coach)); }, true);
  }
})();
