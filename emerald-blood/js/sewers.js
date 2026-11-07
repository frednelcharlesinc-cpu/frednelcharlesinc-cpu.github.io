/* ================= THE SEWERS =================
   Under every town, a maze of brick tunnels and sludge where the things nobody wants to see go to grow.
   Four sewers (Ashford, Highmark, Millbrook, Kettlebrook), each with its own monsters and a boss in the deepest chamber.
   The Guild board carries a long list of sewer work — culls, hunts and clearances — and the monsters down there hit hard. */
(function () {
  const MHx = typeof MH === 'function' ? MH : (anim, m, w, unp) => ({ anim, m, w, unp });

  /* ---------- monsters ---------- */
  Object.assign(ENEMY, {
    sw_rat: { name: 'Sewer Gnawer', img: 'm_ratfolk', hp: 70, atk: 14, def: 4, spd: 15, dodge: .25, parry: .1, brk: 45, xp: 34, gold: 14, trait: 'Fast, filthy, and never alone',
      skills: [{ name: 'Gnaw', hits: [MHx('slash', .7, 380), MHx('slash', .7, 240)] }, { name: 'Plague Bite', w: .3, hits: [MHx('thrust', 1.4, 620)] }] },
    sw_brute: { name: 'Ratfolk Bruiser', img: 'm_ratfolk', size: 1.3, hp: 140, atk: 18, def: 6, spd: 11, dodge: .08, parry: .2, brk: 80, xp: 58, gold: 26, trait: 'Swings a length of drain-pipe',
      skills: [{ name: 'Pipe Smash', hits: [MHx('slash', 1.3, 620)] }, { name: 'Rat Rush', w: .3, hits: [MHx('thrust', .8, 360), MHx('thrust', .8, 240), MHx('jump', 1.2, 700)] }] },
    sw_ooze: { name: 'Bile Ooze', img: 'm_ghoul', spectral: '#9cff6a', hp: 120, atk: 16, def: 9, spd: 8, dodge: 0, parry: 0, brk: 70, xp: 50, gold: 18, regen: .05, trait: 'Regenerates — and steel sinks into it (DEF 9)',
      skills: [{ name: 'Acid Splash', hits: [MHx('spellcast', 1.2, 700)] }, { name: 'Engulf', w: .3, hits: [MHx('thrust', 1.7, 900, 1)] }] },
    sw_gator: { name: 'Drain Lurker', img: 'm_lizard', size: 1.25, hp: 170, atk: 20, def: 7, spd: 12, dodge: .1, parry: .15, brk: 95, xp: 72, gold: 32, trait: 'water — waits under the sludge, then lunges',
      skills: [{ name: 'Death Roll', hits: [MHx('thrust', .9, 460), MHx('slash', .9, 300), MHx('slash', 1.1, 300)] }, { name: 'Ambush Lunge', w: .3, hits: [MHx('jump', 1.9, 820, 1)] }] },
    sw_ghoul: { name: 'Sump Ghoul', img: 'm_ghoul', hp: 150, atk: 19, def: 5, spd: 13, dodge: .15, parry: .1, brk: 80, xp: 64, gold: 28, hunger: 1, trait: 'Drinks Drag mana — Arts HEAL it',
      skills: [{ name: 'Rending Claws', hits: [MHx('slash', .9, 420), MHx('slash', .9, 260)] }, { name: 'Grave Howl', w: .25, hits: [MHx('spellcast', 1.6, 900)] }] },
    sw_spider: { name: 'Cistern Weaver', img: 'm_drake', spectral: '#c8b0ff', size: .95, hp: 160, atk: 21, def: 6, spd: 16, dodge: .3, parry: .05, brk: 85, xp: 70, gold: 30, trait: 'Fast and venomous — strikes twice before you blink',
      skills: [{ name: 'Venom Fangs', hits: [MHx('thrust', 1, 360), MHx('thrust', 1, 200)] }, { name: 'Web Snare', w: .3, hits: [MHx('spellcast', 1.5, 820)] }] },
    // bosses
    sb_ratking: { name: 'Grubb, the Rat King', img: 'm_ratfolk', boss: 1, size: 1.8, hp: 520, atk: 22, def: 7, spd: 12, dodge: .12, parry: .25, brk: 170, xp: 300, gold: 260,
      howl: 1, howlName: 'MY CHILDREN!', howlKey: 'sw_rat', howlText: 'POURS OUT OF THE PIPES', trait: 'Calls the swarm — kill him fast or drown in rats',
      skills: [{ name: 'Crown of Bones', hits: [MHx('slash', 1.3, 600), MHx('halfslash', 1, 340)] }, { name: 'Plague Breath', w: .3, hits: [MHx('spellcast', 1.7, 900)] }, { name: 'King\'s Leap', w: .2, hits: [MHx('jump', 2.2, 1100, 1)] }] },
    sb_mother: { name: 'The Mother of Drains', img: 'm_troll', boss: 1, size: 2, spectral: '#a8ff7a', hp: 820, atk: 27, def: 10, spd: 9, dodge: 0, parry: .1, brk: 230, xp: 520, gold: 450, regen: .05,
      howl: 1, howlName: 'FEED', howlKey: 'sw_ooze', howlText: 'BUDS OFF HER BODY', trait: 'A-RANK. Everything Highmark flushed away, grown into one body. Regenerates and spawns oozes.',
      skills: [{ name: 'Sludge Slam', hits: [MHx('slash', 1.4, 780)] }, { name: 'Tidal Bile', w: .3, hits: [MHx('spellcast', 1.9, 980)] }, { name: 'Swallow Whole', w: .2, hits: [MHx('thrust', 2.4, 1150, 1)] }] },
    sb_serpent: { name: 'The Silt Serpent', img: 'm_lizard', boss: 1, size: 1.9, hp: 600, atk: 24, def: 8, spd: 13, dodge: .15, parry: .15, brk: 190, xp: 360, gold: 300,
      trait: 'water — it has been eating the ferry\'s lost cargo for twenty years, and the ferry\'s lost men',
      skills: [{ name: 'Coil Crush', hits: [MHx('thrust', .9, 420), MHx('thrust', .9, 280), MHx('slash', 1.2, 300)] }, { name: 'Silt Wave', w: .3, hits: [MHx('spellcast', 1.7, 880)] }, { name: 'Undertow', w: .2, hits: [MHx('jump', 2.1, 1050, 1)] }] },
    sb_grainrot: { name: 'The Grainrot', img: 'm_ghoul', boss: 1, size: 1.7, spectral: '#e8d070', hp: 560, atk: 23, def: 7, spd: 12, dodge: .1, parry: .2, brk: 180, xp: 330, gold: 280, hunger: 1,
      howl: 1, howlName: 'ROT', howlKey: 'sw_ghoul', howlText: 'CRAWLS OUT OF THE GRAIN', trait: 'The thing the Inquisition\'s seized grain turned into. Drinks mana and raises the hungry dead.',
      skills: [{ name: 'Blight Claw', hits: [MHx('slash', 1.2, 560), MHx('slash', 1, 320)] }, { name: 'Spore Burst', w: .3, hits: [MHx('spellcast', 1.8, 920)] }] }
  });
  Object.assign(TIER, { sw_rat: 'D', sw_brute: 'C', sw_ooze: 'C', sw_gator: 'B', sw_ghoul: 'C', sw_spider: 'B', sb_ratking: 'B', sb_mother: 'A', sb_serpent: 'B', sb_grainrot: 'B' });
  if (typeof SKILL_EL !== 'undefined') Object.assign(SKILL_EL, { 'Acid Splash': 'water', 'Tidal Bile': 'water', 'Silt Wave': 'water', 'Undertow': 'water', 'Death Roll': 'water', 'Plague Breath': 'shadow', 'Spore Burst': 'shadow' });

  /* ---------- the four sewers ---------- */
  const E = (...L) => () => L[Math.floor(Math.random() * L.length)];
  const SEWERS = {
    s_ashford: { title: 'The Ashford Sewers', sub: 'Under the Hollow — rats, rot, and something wearing a crown', rank: 'C', boss: 'sb_ratking', from: { map: 'ashford', at: [12, 37], back: [13, 37] },
      enc: E(['sw_rat', 'sw_rat'], ['sw_rat', 'sw_rat', 'sw_rat'], ['sw_brute'], ['sw_brute', 'sw_rat'], ['sw_ooze'], ['sw_ooze', 'sw_rat']),
      intro: ['On a throne of cart-wheels and drain-grates sits a rat the size of a bear, wearing a crown made of finger-bones.', ['Grubb', 'Topside folk! Come down to see the KING? Kneel, and I\'ll only eat HALF of you.']] },
    s_highmark: { title: 'The Highmark Undercity Drains', sub: 'Everything the capital flushed away', rank: 'A', minGrade: 'C', boss: 'sb_mother', from: { map: 'hm_city', at: [44, 38], back: [44, 39] },
      enc: E(['sw_ooze', 'sw_ooze'], ['sw_ghoul', 'sw_ghoul'], ['sw_spider'], ['sw_gator', 'sw_ooze'], ['sw_spider', 'sw_ghoul'], ['sw_brute', 'sw_brute', 'sw_rat']),
      intro: ['The great cistern. The sludge in it rises — and keeps rising — into a shape with a mouth.', ['The Mother of Drains', 'MORE. You smell of the city above. Of everything they throw away. Come home to Mother.']] },
    s_millbrook: { title: 'The Millbrook Culverts', sub: 'Under the river town — the ferry\'s lost things end up here', rank: 'B', boss: 'sb_serpent', from: { map: 'millbrook', at: [12, 21], back: [12, 22] },
      enc: E(['sw_gator'], ['sw_rat', 'sw_rat', 'sw_rat'], ['sw_gator', 'sw_rat'], ['sw_ooze', 'sw_ooze'], ['sw_brute', 'sw_ooze']),
      intro: ['The culvert opens into a drowned chamber full of rotting barrels marked with the ferry\'s stamp. The water moves. Then all of it moves.', ['The Silt Serpent', '…sssso many boats… ssso many lost… and now, one more…']] },
    s_kettle: { title: 'The Kettlebrook Grain-Pits', sub: 'Under the sealed granary, the grain has gone bad', rank: 'B', boss: 'sb_grainrot', from: { map: 'kettlebrook', at: [14, 20], back: [14, 21] },
      enc: E(['sw_ghoul'], ['sw_ghoul', 'sw_rat'], ['sw_spider'], ['sw_ooze', 'sw_ghoul'], ['sw_rat', 'sw_rat', 'sw_ghoul']),
      intro: ['A mountain of black, sprouting grain heaves. Something stands up out of it, dripping seed and rot, wearing a scrap of Inquisition white.', ['The Grainrot', 'They sealed me in with the Crown\'s grain. I ate it. All of it. I am STILL HUNGRY.']] }
  };
  for (const [id, s] of Object.entries(SEWERS)) {
    DUNGEONS[id] = { id, title: s.title, sub: s.sub, rank: s.rank, minGrade: s.minGrade, boss: s.boss, bd: 'crypt', light: '170,255,120', glow: '#9cff6a', from: s.from, tint: 'rgba(4,10,4,.66)', enc: s.enc, show: () => false };
    SCENES[id] = { title: s.title, subtitle: s.sub, bd: 'crypt', music: 'woods', dungeon: 1, encRate: .1,
      setup(W) { W.tint = DUNGEONS[id].tint; }, encounters() { return { enemies: s.enc(), bd: 'crypt' }; }, npcs() { return []; }, get exits() { return []; } };
  }
  window.SEWERS = SEWERS;

  /* sewer bosses get their own entrance speech */
  const _db = dungeonBoss;
  dungeonBoss = async function (id) {
    const s = SEWERS[id]; if (!s) return _db(id);
    const d = DUNGEONS[id], B = ENEMY[d.boss];
    await narr(s.intro[0]); CHAR._boss = { name: s.intro[1][0], sprite: B.img || d.boss }; await say('_boss', null, s.intro[1][1]);
    const r = await Battle.start({ enemies: [d.boss], boss: true, noFlee: true, bd: d.bd, music: 'boss', intro: B.name.toUpperCase() });
    if (r === 'lose') { await Story.defeat(); return; }
    if (r !== 'win') return;
    G.S.f['clear_' + id] = 1; World.ents = World.ents.filter(e => e.id !== 'boss');
    await narr('The tunnels go quiet. Up above, for the first time in years, the town will sleep without hearing scratching under the floor.');
    Quests.event('dungeon', id); save();
  };

  /* the grates: tap them in town to go down */
  const grate = id => async () => enterDungeon(id);
  SCENES.ashford && (SCENES.ashford.tiles = SCENES.ashford.tiles || {}, SCENES.ashford.tiles['12,37'] = grate('s_ashford'));
  // the other towns get an iron grate set into the street (Ashford's is already painted into the map)
  for (const id of Object.keys(SEWERS)) if (id !== 's_ashford') DUNGEONS[id].show = () => true;
  const _ps = Pick.sheet.bind(Pick);
  Pick.sheet = function (kind) {
    if (kind !== 'cave_#9cff6a') return _ps(kind);
    if (this.cache[kind]) return this.cache[kind];
    const one = document.createElement('canvas'); one.width = 64; one.height = 64; const x = one.getContext('2d');
    const R = (c, a, b, w, h) => { x.fillStyle = c; x.fillRect(a, b, w, h); };
    R('rgba(0,0,0,.35)', 14, 36, 36, 24); R('#3a3f44', 14, 34, 36, 24); R('#0c120c', 17, 37, 30, 18);
    R('rgba(150,255,110,.28)', 19, 40, 26, 13);
    for (let i = 0; i < 6; i++) R('#5a6068', 18 + i * 5, 36, 3, 20);
    R('#6a7078', 14, 34, 36, 3); R('#2a2e32', 14, 56, 36, 2); R('#8a9098', 15, 34, 34, 1);
    const sh = document.createElement('canvas'); sh.width = 576; sh.height = 768; const sx = sh.getContext('2d');
    for (let r = 0; r < 12; r++) for (let f = 0; f < 9; f++) sx.drawImage(one, f * 64, r * 64);
    this.cache[kind] = sh; return sh;
  };

  /* ---------- the Guild's sewer work ---------- */
  const QK = (keys, n, label) => ({ kind: 'kill', keys, n, label });
  Object.assign(QDEF, {
    q_sw_rats:    { name: 'Teeth Under the Floor', rank: 'D', type: 'Hunt', rp: 70, gold: 60, xp: 80, desc: 'Ashford\'s cellars are being chewed hollow. The rats come up through the sewer grate in Lower Ashford. Kill 8 Sewer Gnawers.', goal: QK(['sw_rat'], 8, 'Sewer Gnawers') },
    q_sw_brutes:  { name: 'Pipe and Bone', rank: 'C', type: 'Hunt', rp: 110, gold: 90, xp: 120, desc: 'Ratfolk Bruisers have started dragging off the night-soil men. Put down 4 of them in the Ashford Sewers.', goal: QK(['sw_brute'], 4, 'Ratfolk Bruisers') },
    q_sw_ooze:    { name: 'What the Drains Grew', rank: 'C', type: 'Hunt', rp: 120, gold: 100, xp: 130, desc: 'Something green and alive is eating the sewer walls. Bile Oozes regenerate — hit them hard. Destroy 5.', goal: QK(['sw_ooze'], 5, 'Bile Oozes') },
    q_sw_king:    { name: 'Long Live the King (Not)', rank: 'C', type: 'Dungeon', rp: 220, gold: 200, xp: 260, desc: 'Every rat in Ashford answers to one rat. Go down the Lower Ashford grate, find the Rat King\'s throne, and end his reign.', goal: { kind: 'dungeon', id: 's_ashford' } },
    q_sw_gators:  { name: 'Lurkers in the Culverts', rank: 'B', type: 'Hunt', rp: 160, gold: 140, xp: 170, desc: 'Millbrook\'s ferrymen won\'t work the night crossings — things are dragging people off the landing. Kill 4 Drain Lurkers in the Millbrook Culverts.', goal: QK(['sw_gator'], 4, 'Drain Lurkers') },
    q_sw_serpent: { name: 'The Ferry\'s Twenty-Year Debt', rank: 'B', type: 'Dungeon', rp: 280, gold: 260, xp: 320, desc: 'Oswin swears his father lost a boat to "something in the culverts". So did his grandfather. Go under Millbrook and kill the Silt Serpent.', goal: { kind: 'dungeon', id: 's_millbrook' } },
    q_sw_ghouls:  { name: 'The Hungry Below', rank: 'C', type: 'Hunt', rp: 130, gold: 110, xp: 140, desc: 'Sump Ghouls drink Drag mana — Arts heal them. Use your blade. Kill 6 anywhere in the sewers.', goal: QK(['sw_ghoul'], 6, 'Sump Ghouls') },
    q_sw_grain:   { name: 'Bad Grain', rank: 'B', type: 'Dungeon', rp: 260, gold: 240, xp: 300, desc: 'The grain the Inquisition sealed under Kettlebrook has gone wrong. Very wrong. Go down into the Grain-Pits and destroy whatever it became.', goal: { kind: 'dungeon', id: 's_kettle' } },
    q_sw_weavers: { name: 'Webs in the Cistern', rank: 'B', type: 'Hunt', rp: 170, gold: 150, xp: 180, desc: 'Cistern Weavers are fast and venomous, and they\'re spreading. Kill 5 in the Kettlebrook or Highmark tunnels.', goal: QK(['sw_spider'], 5, 'Cistern Weavers') },
    q_sw_sweep:   { name: 'The Great Sweep', rank: 'B', type: 'Hunt', rp: 200, gold: 180, xp: 220, desc: 'The Bell Concord is paying every guild to clear the sewers before Sunhigh. Kill 20 sewer monsters of any kind.', goal: QK(['sw_rat', 'sw_brute', 'sw_ooze', 'sw_gator', 'sw_ghoul', 'sw_spider'], 20, 'sewer monsters') },
    q_sw_mother:  { name: 'The Mother of Drains', rank: 'A', type: 'Dungeon', rp: 420, gold: 420, xp: 520, desc: 'A-RANK. Under Highmark, everything the capital flushed away for three hundred years has grown into one body. The Bell Wardens have lost two teams. Go down the Highmark drain and kill it.', goal: { kind: 'dungeon', id: 's_highmark' } },
    q_sw_all:     { name: 'Rat-Catcher of the Realm', rank: 'A', type: 'Hunt', rp: 360, gold: 340, xp: 400, desc: 'For the truly stubborn: kill 50 sewer monsters across every town. The Guild will remember the name.', goal: QK(['sw_rat', 'sw_brute', 'sw_ooze', 'sw_gator', 'sw_ghoul', 'sw_spider'], 50, 'sewer monsters') }
  });
  if (typeof DROPS !== 'undefined') Object.assign(DROPS, { sw_ghoul: ['gravedust', .35], sw_gator: ['mireroot', .3], sw_ooze: ['mireroot', .25] });

  /* tavern talk */
  if (typeof GOSSIP !== 'undefined') GOSSIP.sewers = { label: 'What lives in the sewers', talks: [
    [['A', 'Rats in the cellar again. Big as dogs.'], ['B', 'They come up the grate in Lower Ashford. My cousin says there\'s a king down there.'], ['A', 'A rat king?'], ['B', 'With a CROWN.']],
    [['C', 'Millbrook ferrymen won\'t cross after dark. Something in the culverts.'], ['A', 'Oswin\'s grandfather lost a boat to it.'], ['C', 'Oswin\'s grandfather lost a boat to drink.'], ['A', 'That too.']],
    [['B', 'The Bell Wardens sent two teams into the Highmark drains. One came back.'], ['C', 'What did they say?'], ['B', 'Nothing. They just keep washing their hands.']],
    [['A', 'Kettlebrook\'s sealed granary started to SMELL. Then the smell started to MOVE.'], ['me', '(…The Inquisition\'s grain.)']]
  ] };
})();
