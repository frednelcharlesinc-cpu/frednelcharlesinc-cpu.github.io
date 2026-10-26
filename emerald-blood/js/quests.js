'use strict';
/* ================= GUILD QUESTS: hunts, bounties, gathering, deliveries, dungeons, rescues, defences, investigations ================= */
const QITEM = {
  moonpetal: { name: 'Moonpetal', desc: 'A pale herb that glows faintly blue. Healers pay well for it.' },
  gravedust: { name: 'Grave Dust', desc: 'Bone-dust from the Sunken Crypt. Alchemists swear by it. Nobody asks what for.' },
  glowore: { name: 'Glow Ore', desc: 'Ore from the Goblin Warren with a warm light trapped inside.' },
  mireroot: { name: 'Mire Root', desc: 'A black, rubbery root from the Drowned Mine. Smells awful. Cures fever.' },
  skyshard: { name: 'Sky Shard', desc: 'A splinter of crystal from the Hollow. Rings like a bell when tapped.' },
  letter: { name: 'Sealed Letter', desc: 'Wax-sealed. Addressed to "Aldo, the last house on the mill road."' },
  parcel: { name: 'Medicine Parcel', desc: 'Maren\'s fever tonic, wrapped in oilcloth. For the Fenwick farm in the woods.' }
};
// bounty targets: named, tougher versions of ordinary monsters
Object.assign(ENEMY, {
  bq_redeye: Object.assign({}, ENEMY.lupine_alpha, { name: 'Red-Eye', img: 'lupine_alpha', hp: 170, atk: 16, size: 1.35, xp: 70, gold: 60, trait: 'BOUNTY — a lupine that has killed eleven hunters', howlKey: 'lupine' }),
  bq_gnasher: Object.assign({}, ENEMY.m_tusker, { name: 'Old Gnasher', img: 'm_tusker', hp: 260, atk: 19, def: 6, size: 1.45, xp: 110, gold: 90, trait: 'BOUNTY — one tusk, one eye, one bad mood' }),
  bq_count: Object.assign({}, ENEMY.m_vampire, { name: 'The Pale Count', img: 'm_vampire', hp: 300, atk: 21, size: 1.25, boss: 1, xp: 180, gold: 160, trait: 'BOUNTY — drinks Drag mana; Drag Arts HEAL him' }),
  bq_cinderwing: Object.assign({}, ENEMY.m_drake, { name: 'Cinderwing', img: 'm_drake', hp: 420, atk: 24, def: 8, size: 1.6, boss: 1, xp: 260, gold: 240, trait: 'BOUNTY — a drake old enough to remember the dragon' }),
  bq_highwayman: Object.assign({}, ENEMY.bandit, { name: 'Bandit Raider', hp: 55, atk: 12 })
});
Object.assign(TIER, { bq_redeye: 'D', bq_gnasher: 'C', bq_count: 'B', bq_cinderwing: 'A', bq_highwayman: 'D' });
// monsters sometimes drop gathering items
const DROPS = { m_ghoul: ['gravedust', .35], m_skeleton: ['gravedust', .25], m_goblin: ['glowore', .15], m_lizard: ['mireroot', .3], m_troll: ['mireroot', .4], m_drake: ['skyshard', .3], m_minotaur: ['skyshard', .25] };

const QK = (keys, n, label) => ({ kind: 'kill', keys, n, label });
const QDEF = {
  // ---------- E ----------
  q_rats: { name: 'Rats in the Cellar', rank: 'E', type: 'Hunt', rp: 35, gold: 25, xp: 40, desc: 'Warren rats the size of dogs are chewing through Ashford\'s grain. Kill 4.', goal: QK(['m_ratfolk'], 4, 'Warren Rats') },
  q_herbs: { name: 'Moonpetal for Maren', rank: 'E', type: 'Gathering', rp: 35, gold: 30, xp: 40, desc: 'Maren needs 5 Moonpetal for her fever tonic. It glows blue in the grass of the East Woods.', goal: { kind: 'item', item: 'moonpetal', n: 5 } },
  q_goblins: { name: 'Goblin Trouble', rank: 'E', type: 'Hunt', rp: 45, gold: 35, xp: 50, desc: 'Goblins are raiding the farms on the woods road. Thin them out — 6 should send a message.', goal: QK(['m_goblin', 'm_goblin_shaman'], 6, 'Goblins') },
  q_gourds: { name: 'The Pumpkin Problem', rank: 'E', type: 'Hunt', rp: 30, gold: 20, xp: 35, desc: 'The Hollow\'s pumpkin patch has… got up and walked off. Put down 4 Gourdlings. Do not ask the farmer how.', goal: QK(['m_gourd'], 4, 'Gourdlings') },
  q_letter: { name: 'A Letter for the Mill Road', rank: 'E', type: 'Delivery', rp: 30, gold: 20, xp: 30, desc: 'Deliver a sealed letter to old Aldo, who lives alone near the mill.', give: 'letter', goal: { kind: 'deliver', item: 'letter', npc: 'aldo' } },
  q_chests: { name: 'Treasure Hunter', rank: 'E', type: 'Exploration', rp: 40, gold: 30, xp: 40, desc: 'The Guild buys maps of where old caches are hidden. Find and open 5 chests anywhere in the vale.', goal: { kind: 'chest', n: 5 } },
  q_warren: { name: 'Clear the Goblin Warren', rank: 'E', type: 'Dungeon', rp: 90, gold: 80, xp: 120, desc: 'There is a cave in the north-east of the East Woods. Goblins come out of it. Make them stop. Their king is in the deepest chamber.', goal: { kind: 'dungeon', id: 'd_warren' } },
  // ---------- D ----------
  q_fenwick: { name: 'Fever at the Fenwick Farm', rank: 'D', type: 'Delivery', rp: 50, gold: 35, xp: 50, desc: 'Carry Maren\'s medicine to the Fenwick farmer camped by the spring in the woods. Quickly — the children are sick.', give: 'parcel', goal: { kind: 'deliver', item: 'parcel', npc: 'fenwick' } },
  q_bones: { name: 'Dust of the Dead', rank: 'D', type: 'Gathering', rp: 55, gold: 45, xp: 60, desc: 'An alchemist wants 4 Grave Dust from the Sunken Crypt. She pays double for not asking questions.', goal: { kind: 'item', item: 'gravedust', n: 4 } },
  q_crypt: { name: 'The Sunken Crypt', rank: 'D', type: 'Dungeon', rp: 140, gold: 120, xp: 180, desc: 'Under the ruined chapel north-west of Ashford, the dead have started walking. Find what is raising them.', goal: { kind: 'dungeon', id: 'd_crypt' } },
  q_redeye: { name: 'BOUNTY: Red-Eye', rank: 'D', type: 'Bounty', rp: 110, gold: 100, xp: 120, desc: 'A lupine with one red eye has killed eleven hunters. Last seen in the south clearing of the East Woods.', goal: { kind: 'bounty', enemy: 'bq_redeye', map: 'woods', at: [29, 27] } },
  q_caravan: { name: 'Hold the East Road', rank: 'D', type: 'Defence', rp: 100, gold: 90, xp: 110, desc: 'A merchant caravan is pinned at the woods entrance. Hold off three waves of raiders until it gets through.', goal: { kind: 'defend', map: 'woods', at: [3, 19], npc: 'merchant', waves: [['bq_highwayman', 'bq_highwayman'], ['lupine', 'lupine', 'lupine'], ['m_goblin', 'm_goblin_shaman', 'm_goblin']] } },
  q_anselm: { name: 'The Missing Brother', rank: 'D', type: 'Rescue', rp: 90, gold: 70, xp: 100, desc: 'Brother Anselm went into the Sunken Crypt to bless the dead. He did not come back. Find him.', goal: { kind: 'rescue', map: 'd_crypt', npc: 'anselm' } },
  q_ghouls: { name: 'Crypt Cleaning', rank: 'D', type: 'Hunt', rp: 60, gold: 50, xp: 70, desc: 'Kill 5 Crypt Ghouls. Burn the bodies twice.', goal: QK(['m_ghoul'], 5, 'Crypt Ghouls') },
  q_rumors: { name: 'Whispers of the Pale Count', rank: 'D', type: 'Investigation', rp: 60, gold: 40, xp: 70, desc: 'People in Ashford are waking up weak and pale. Talk to the three who saw "the tall man in red".', goal: { kind: 'talk', map: 'ashford', npcs: ['witness1', 'witness2', 'witness3'] } },
  // ---------- C ----------
  q_ore: { name: 'Ore for the Forge', rank: 'C', type: 'Gathering', rp: 70, gold: 60, xp: 80, desc: 'Brom wants 4 Glow Ore from the Goblin Warren for new Guild blades.', goal: { kind: 'item', item: 'glowore', n: 4 } },
  q_mire: { name: 'The Drowned Mine', rank: 'C', type: 'Dungeon', rp: 200, gold: 180, xp: 260, desc: 'The flooded mine west of the mill has started breeding lizardmen. Something big is the mother.', goal: { kind: 'dungeon', id: 'd_mire' } },
  q_lizards: { name: 'Scales and Spears', rank: 'C', type: 'Hunt', rp: 80, gold: 70, xp: 90, desc: 'Kill 6 Marsh Lizardmen before they reach the mill road.', goal: QK(['m_lizard'], 6, 'Lizardmen') },
  q_gnasher: { name: 'BOUNTY: Old Gnasher', rank: 'C', type: 'Bounty', rp: 160, gold: 150, xp: 170, desc: 'A one-tusked brute has flattened three fences and a tax collector near the mill. (The Guild is only paying for the fences.)', goal: { kind: 'bounty', enemy: 'bq_gnasher', map: 'mill', at: [22, 22] } },
  q_roots: { name: 'Root of the Matter', rank: 'C', type: 'Gathering', rp: 70, gold: 60, xp: 80, desc: 'Fever is spreading in the Hollow. Bring 3 Mire Root from the Drowned Mine.', goal: { kind: 'item', item: 'mireroot', n: 3 } },
  q_orcs: { name: 'Iron and Tusk', rank: 'C', type: 'Hunt', rp: 90, gold: 80, xp: 100, desc: 'An orc warband is camped in the Drowned Mine. Kill 4 Orc Raiders.', goal: QK(['m_orc'], 4, 'Orc Raiders') },
  // ---------- B ----------
  q_crystal: { name: 'The Crystal Hollow', rank: 'B', type: 'Dungeon', rp: 320, gold: 300, xp: 400, desc: 'The old quarry north-east of Ashford broke into something that should have stayed asleep.', goal: { kind: 'dungeon', id: 'd_crystal' } },
  q_count: { name: 'BOUNTY: The Pale Count', rank: 'B', type: 'Bounty', rp: 260, gold: 240, xp: 280, desc: 'The tall man in red sleeps in the Sunken Crypt by day. He drinks mana — Drag Arts will only feed him.', goal: { kind: 'bounty', enemy: 'bq_count', map: 'd_crypt', at: 'boss' } },
  q_minotaur: { name: 'Horns of the Hollow', rank: 'B', type: 'Hunt', rp: 180, gold: 160, xp: 200, desc: 'Kill 2 Labyrinth Minotaurs in the Crystal Hollow.', goal: QK(['m_minotaur'], 2, 'Minotaurs') },
  q_sky: { name: 'Bells of Crystal', rank: 'B', type: 'Gathering', rp: 150, gold: 140, xp: 160, desc: 'Seraphine\'s bell-wardens need 3 Sky Shards to tune the great bell.', goal: { kind: 'item', item: 'skyshard', n: 3 } },
  // ---------- A ----------
  q_cinderwing: { name: 'BOUNTY: Cinderwing', rank: 'A', type: 'Bounty', rp: 400, gold: 400, xp: 450, desc: 'An ancient drake nests in the deepest hall of the Crystal Hollow. It remembers the dragon.', goal: { kind: 'bounty', enemy: 'bq_cinderwing', map: 'd_crystal', at: 'boss' } },
  q_hunter: { name: 'Monster Hunter', rank: 'A', type: 'Hunt', rp: 300, gold: 250, xp: 300, desc: 'Prove you are the Guild\'s best. Defeat 40 monsters of any kind after accepting.', goal: QK(['*'], 40, 'monsters') }
};
// quest NPCs spawned only while their quest is running
const QNPC = {
  aldo: { name: 'Old Aldo', sprite: null, map: 'mill', at: [12, 22] },
  fenwick: { name: 'Farmer Fenwick', sprite: null, map: 'woods', at: [13, 26] },
  merchant: { name: 'Caravan Master', sprite: null, map: 'woods', at: [3, 19] },
  anselm: { name: 'Brother Anselm', sprite: 'acolyte', map: 'd_crypt', at: 'deep' },
  witness1: { name: 'Pale Baker', sprite: null, map: 'ashford', at: [24, 25] },
  witness2: { name: 'Night Watchman', sprite: 'guard', map: 'ashford', at: [38, 20] },
  witness3: { name: 'Sleepless Widow', sprite: null, map: 'ashford', at: [12, 21] }
};
const WITNESS = {
  witness1: 'A tall man in red bought bread at midnight. Paid in old coin — Imperial, two hundred years old. His hands were cold as a cellar.',
  witness2: 'I followed him to the ruined chapel. He walked through the rubble like it was a door. Then the candles in the crypt went out, all at once.',
  witness3: 'He stood under my window and asked to be invited in. Very polite. I said no. My husband said yes. …My husband sleeps all day now.'
};

const Quests = {
  st() { const S = G.S; S.qx = S.qx || {}; S.qitems = S.qitems || {}; S.kills = S.kills || {}; return S.qx; },
  has(it) { this.st(); return G.S.qitems[it] || 0; },
  addItem(it, n) { this.st(); G.S.qitems[it] = (G.S.qitems[it] || 0) + n; this.check(); },
  active() { const q = this.st(); return Object.keys(q).filter(k => QDEF[k] && q[k].s === 'on'); },
  state(id) { return (this.st()[id] || {}).s; },
  accept(id) {
    const Q = QDEF[id], q = this.st(); q[id] = { s: 'on', p: 0, t: G.S.steps || 0 };
    if (Q.give) this.addItem(Q.give, 1);
    sfx('blip'); toast(`Quest accepted: <b>${Q.name}</b>`, 2600); this.check();
  },
  progress(id) {
    const Q = QDEF[id], q = this.st()[id], g = Q.goal;
    if (!q) return '';
    if (g.kind === 'kill') return `${Math.min(q.p, g.n)}/${g.n} ${g.label}`;
    if (g.kind === 'item') return `${Math.min(this.has(g.item), g.n)}/${g.n} ${QITEM[g.item].name}`;
    if (g.kind === 'chest') return `${Math.min(q.p, g.n)}/${g.n} chests opened`;
    if (g.kind === 'talk') return `${(q.met || []).length}/${g.npcs.length} witnesses`;
    if (g.kind === 'deliver') return `Bring the ${QITEM[g.item].name} to ${QNPC[g.npc].name}`;
    if (g.kind === 'dungeon') return `Defeat the master of ${DUNGEONS[g.id].title}`;
    if (g.kind === 'bounty') return `Hunt ${ENEMY[g.enemy].name} (${g.map === 'woods' ? 'East Woods' : g.map === 'mill' ? 'near the mill' : DUNGEONS[g.map] ? DUNGEONS[g.map].title : g.map})`;
    if (g.kind === 'defend') return `Meet the caravan at the East Woods entrance`;
    if (g.kind === 'rescue') return `Find ${QNPC[g.npc].name} in ${DUNGEONS[g.map].title}`;
    return '';
  },
  done(id) {
    const Q = QDEF[id], q = this.st()[id]; if (!q || q.s === 'done') return; q.s = 'done';
    if (Q.goal.kind === 'item') G.S.qitems[Q.goal.item] -= Q.goal.n;
    Guild.award(Q.rp, Q.gold, 'Quest complete: ' + Q.name); if (Q.xp) setTimeout(() => Story.gainXp(Q.xp), 600);
    save();
  },
  check() {
    for (const id of this.active()) {
      const Q = QDEF[id], q = this.st()[id], g = Q.goal;
      if ((g.kind === 'kill' || g.kind === 'chest') && q.p >= g.n) this.done(id);
      else if (g.kind === 'item' && this.has(g.item) >= g.n) this.done(id);
      else if (g.kind === 'dungeon' && G.S.f['clear_' + g.id]) this.done(id);
    }
  },
  event(kind, a) {
    const q = this.st();
    for (const id of this.active()) {
      const g = QDEF[id].goal;
      if (kind === 'kill' && g.kind === 'kill' && (g.keys.includes('*') || g.keys.includes(a))) { q[id].p++; const n = Math.min(q[id].p, g.n); if (n < g.n && (n % 2 === 0 || g.n <= 5)) toast(`${QDEF[id].name}: ${n}/${g.n}`, 1600); }
      if (kind === 'chest' && g.kind === 'chest') { q[id].p++; toast(`${QDEF[id].name}: ${Math.min(q[id].p, g.n)}/${g.n}`, 1600); }
    }
    this.check();
  },
  // spawn quest NPCs / bounty monsters into the current scene
  async spawn(W, name) {
    const q = this.st(), D = W.map.dungeon;
    const spot = at => at === 'boss' ? [D.boss[0], D.boss[1] + 1] : at === 'deep' ? D.chests[0] : at;
    for (const id of this.active()) {
      const g = QDEF[id].goal;
      if (g.kind === 'bounty' && g.map === name && !q[id].won) {
        if (D && g.at === 'boss' && !G.S.f['clear_' + name]) continue; // the dungeon master comes first
        const E = ENEMY[g.enemy], [x, y] = spot(g.at);
        W.ents.push(new Ent({ id: 'bounty_' + id, x, y, dir: 'down', img: await npcImg(E.img), size: Math.min(1.5, E.size || 1), name: E.name, talk: () => this.bounty(id) }));
      }
      const npcs = g.kind === 'talk' ? g.npcs : g.npc ? [g.npc] : [];
      for (const nid of npcs) {
        const N = QNPC[nid]; if (N.map !== name) continue;
        if (g.kind === 'talk' && (q[id].met || []).includes(nid)) continue;
        if (g.kind === 'rescue' && q[id].freed) continue;
        let [x, y] = spot(N.at); while (W.ents.some(e => e.x === x && e.y === y) || (W.col[y] && W.col[y][x])) x++;
        const spr = N.sprite || (G.man.folk ? G.man.folk[(nid.length * 7) % G.man.folk.length] : 'farmer');
        CHAR[nid] = { name: N.name, sprite: spr };
        W.ents.push(new Ent({ id: 'qn_' + nid, x, y, dir: 'down', img: await npcImg(spr), name: N.name, talk: () => this.talkNpc(id, nid) }));
      }
    }
  },
  async bounty(id) {
    const g = QDEF[id].goal, E = ENEMY[g.enemy];
    await narr(`${E.name}. ${E.trait.replace('BOUNTY — ', '')}.`);
    const r = await Battle.start({ enemies: [g.enemy], boss: !!E.boss, noFlee: true, intro: 'BOUNTY: ' + E.name.toUpperCase() });
    if (r === 'lose') { await Story.defeat(); return; }
    if (r !== 'win') return;
    this.st()[id].won = 1; World.ents = World.ents.filter(e => e.id !== 'bounty_' + id); this.done(id);
  },
  async talkNpc(id, nid) {
    const Q = QDEF[id], g = Q.goal, q = this.st()[id];
    if (g.kind === 'deliver') {
      if (!this.has(g.item)) { await say(nid, null, 'Hm? Did the Guild send you? …You seem to have lost whatever you were carrying.'); return; }
      G.S.qitems[g.item]--; World.ents = World.ents.filter(e => e.id !== 'qn_' + nid);
      await say(nid, null, nid === 'aldo' ? '…From my daughter? Twelve years without a word, and now a letter. Sit. No — go. I want to read it alone. Thank you, stranger.' : 'Medicine! The little ones can keep it down if it\'s warm… thank you. Gods, thank you.');
      this.done(id); return;
    }
    if (g.kind === 'talk') {
      await say(nid, null, WITNESS[nid]); q.met = q.met || []; if (!q.met.includes(nid)) q.met.push(nid);
      World.ents = World.ents.filter(e => e.id !== 'qn_' + nid);
      if (q.met.length >= g.npcs.length) { await narr('Bread at midnight. A ruined chapel. An invitation. The "tall man in red" is real — and he sleeps in the Sunken Crypt.'); this.done(id); }
      else toast(`Witnesses: ${q.met.length}/${g.npcs.length}`, 1800);
      return;
    }
    if (g.kind === 'rescue') {
      await say(nid, null, 'You came… I hid in this tomb for four days. The dead walk past it every hour, singing. Get me OUT of here.');
      await narr('You give Anselm a tonic and point him back the way you came. He runs — faster than a monk should be able to.');
      q.freed = 1; World.ents = World.ents.filter(e => e.id !== 'qn_' + nid); this.done(id); return;
    }
    if (g.kind === 'defend') {
      const c = await ask(nid, null, 'You\'re from the Guild? Thank the gods. Raiders, beasts, goblins — they keep coming. Hold them off while we get the wagons through!', ['Hold the road', 'Not yet']);
      if (c !== 0) return;
      for (let i = 0; i < g.waves.length; i++) {
        banner(`WAVE ${i + 1} / ${g.waves.length}`, i === 2 ? 'The last of them!' : 'Here they come…', 1600); await wait(1200);
        const r = await Battle.start({ enemies: g.waves[i], noFlee: true, bd: 'forest', intro: `WAVE ${i + 1}` });
        if (r === 'lose') { await Story.defeat(); return; }
        if (r !== 'win') return;
      }
      await say(nid, null, 'The last wagon\'s through! I\'ll tell every merchant on the coast the Guild keeps its word.');
      World.ents = World.ents.filter(e => e.id !== 'qn_' + nid); this.done(id);
    }
  }
};
// kills and drops come from every won battle
(function () {
  const _v = Battle.victory.bind(Battle);
  Battle.victory = async function () {
    const B = this.B;
    if (B) for (const a of B.actors) if (a.side === 'e') {
      Quests.event('kill', a.key);
      const d = DROPS[a.key]; if (d && Math.random() < d[1]) { Quests.addItem(d[0], 1); setTimeout(() => toast(`Dropped: <b style="color:#9fd8ff">${QITEM[d[0]].name}</b>`, 1800), 900); }
    }
    return _v();
  };
})();

/* ---------- the board (replaces the original) ---------- */
async function questBoard() {
  const S = G.S, q = Guild.q(), qx = Quests.st();
  if (!S.rank) { await narr('A board of bounties, nailed thick with notices. "Guild members only," says the brass plate. You\'ll need to register with Brom first.'); return; }
  await narr(`The Guild board. Your card says ${S.rank}-RANK. Your power: ${Power.now().grade}, ${BAND_NAME[Power.now().band]}.`);
  const ri = Guild.rankIdx(S.rank);
  while (true) {
    const c = await ask(null, null, 'The board is crowded with notices.', ['Notices for my rank', 'Quests in progress', 'Old notices (story & trials)', 'Completed', 'Read the tier chart', 'Step away']);
    if (c === 5 || c < 0) return;
    if (c === 4) { for (const [t, d] of TIERS) await narr(`${t} — ${d}`); continue; }
    if (c === 2) { await oldBoard(); continue; }
    let ids;
    if (c === 0) ids = Object.keys(QDEF).filter(id => !qx[id] && Guild.rankIdx(QDEF[id].rank) <= ri + 1);
    if (c === 1) ids = Quests.active();
    if (c === 3) ids = Object.keys(QDEF).filter(id => Quests.state(id) === 'done');
    if (!ids.length) { await narr(c === 1 ? 'You have no Guild quests in progress.' : c === 3 ? 'Nothing completed yet. Brom has a blank spot ready for your name.' : 'You\'ve taken every notice your rank allows. Rank up for more.'); continue; }
    const labels = ids.map(id => { const Q = QDEF[id], lock = Guild.rankIdx(Q.rank) > ri; return `${lock ? '🔒 ' : Quests.state(id) === 'done' ? '✔ ' : Quests.state(id) ? '▶ ' : ''}[${Q.rank}] ${Q.name} · ${Q.type}`; });
    labels.push('◀ Back');
    const k = await ask(null, null, ['Which notice?', 'Your quests:', '', 'Completed:'][c], labels);
    if (k < 0 || k >= ids.length) continue;
    const id = ids[k], Q = QDEF[id];
    if (Guild.rankIdx(Q.rank) > ri) { await narr(`"${Q.name}" — ${Q.rank}-rank or higher. Brom will tear your card in half if he catches you.`); continue; }
    if (Quests.state(id) === 'done') { await narr(`"${Q.name}" — stamped COMPLETE.`); continue; }
    if (Quests.state(id) === 'on') { await narr(`${Q.name}: ${Q.desc}  — Progress: ${Quests.progress(id)}`); const a = await ask(null, null, 'Keep this quest?', ['Keep it', 'Abandon it']); if (a === 1) { delete qx[id]; toast('Quest abandoned.'); } continue; }
    const a = await ask(null, null, `${Q.type.toUpperCase()} · ${Q.name}: ${Q.desc}  Reward: ${Q.rp} RP, ${Q.gold}g, ${Q.xp} EXP.`, ['Accept', 'Leave it']);
    if (a === 0) Quests.accept(id);
  }
}
async function oldBoard() {
  const S = G.S, q = Guild.q();
  const ids = Object.keys(QUESTS); const labels = ids.map(id => { const Q = QUESTS[id], st = q[id]; const lock = Guild.rankIdx(S.rank) < Guild.rankIdx(Q.rank); return `${st === 'done' ? '✔ ' : st ? '▶ ' : lock ? '🔒 ' : ''}${Q.name} [${Q.rank}]`; });
  labels.push('◀ Back');
  const c = await ask(null, null, 'Which notice?', labels);
  if (c < 0 || c >= ids.length) return;
  const id = ids[c], Q = QUESTS[id];
  if (q[id] === 'done') { await narr(`"${Q.name}" — stamped COMPLETE.`); return; }
  if (Guild.rankIdx(S.rank) < Guild.rankIdx(Q.rank)) { await narr(`"${Q.name}" — ${Q.rank}-rank or higher. Not yet.`); return; }
  await narr(`${Q.name}: ${Q.desc}  (Reward: ${Q.rp} RP, ${Q.gold}g)`);
  if (id === 'range') { const sc = await targetRange(); await narr(`You hit ${sc} of 10.`); if (sc >= 7) Guild.complete('range'); else await say('tilda', 'happy', 'Ha! Close. Come back when your hands stop shaking.'); return; }
  if (id === 'arm') { const w = await armWrestle('Tilda', 1.05); if (w) { await say('tilda', 'shock', '…You cheated. You must have. Nobody beats me. …Again tomorrow?'); Guild.complete('arm'); } else await say('tilda', 'happy', 'HA! Dwarf arms, human!'); return; }
  if (id === 'bouts') { await provingBouts(); return; }
  if (!q[id]) { q[id] = id === 'lupine' ? 0 : 'active'; sfx('blip'); toast(`Quest accepted: <b>${Q.name}</b>`, 2600); }
  else await narr(id === 'lupine' ? `Packs culled: ${q.lupine}/3.` : 'Already accepted.');
}
function questsMenuHTML() {
  const ids = Quests.active(); const S = G.S;
  let h = ids.length ? ids.map(id => `<div class="stat" style="margin-top:6px"><h3>${QDEF[id].name} <span class="muted">· ${QDEF[id].type} · ${QDEF[id].rank}</span></h3><p class="muted">${QDEF[id].desc}</p><p><b style="color:#7dffb0">▶ ${Quests.progress(id)}</b></p></div>`).join('') : '<div class="stat" style="margin-top:6px"><p class="muted">No Guild quests in progress. The board in the Guild hall has plenty.</p></div>';
  const it = Object.entries(S.qitems || {}).filter(([k, v]) => v > 0 && QITEM[k]);
  if (it.length) h += `<div class="stat" style="margin-top:6px"><h3>Quest items</h3>${it.map(([k, v]) => `<p><b>${QITEM[k].name} ×${v}</b> <span class="muted">— ${QITEM[k].desc}</span></p>`).join('')}</div>`;
  const done = Object.keys(QDEF).filter(id => Quests.state(id) === 'done').length;
  h += `<div class="stat" style="margin-top:6px"><p class="muted">Guild quests completed: ${done}/${Object.keys(QDEF).length} · Chests opened: ${Object.keys(S.chests || {}).length} · Dungeons cleared: ${Object.keys(DUNGEONS).filter(d => S.f['clear_' + d]).length}/${Object.keys(DUNGEONS).length}</p></div>`;
  return h;
}
