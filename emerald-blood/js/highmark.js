'use strict';
/* ================= HIGHMARK — MOTHER CITY OF THE ADVENTURERS' GUILD =================
   The first Guild was founded here, four hundred years ago, to hold the Gate: a colossal ring of black stone that opens
   onto other places. The Guild still holds it. Five areas you walk between, built from the user's art:
     hm_gate     Crown Road Gate — the south entrance (stables, travellers' market)          ↑ Gate Plaza   → Lantern Row
     hm_plaza    the Gate Plaza — the Gate, its fortress, the Announcement Platform           ↓ Crown Road   ← Guild Quarter  → Whisper Ward
     hm_guild    Guild Quarter — Guild Headquarters (Great Hall, Guild Master's office), yard, archery range, quest board
     hm_lantern  Lantern Row — the Wayfarer's Hearth inn, the smithy                          ← Crown Road   → Whisper Ward
     hm_ward     the Whisper Ward — the Midnight Exchange Grand House                          ← Gate Plaza   ↓ Lantern Row
   The Guild Master of Highmark, Aldric Brandt, runs the city's Guild. He answers to the one woman the whole Guild answers to:
   Seraphine Hale, the Headmaster — SSS, "the Unbroken Bell".
   The Guild Trial (Chapter I, Part V) is announced on the Platform and begins in the Great Hall. */
Object.assign(CHAR, {
  aldric: { name: 'Guild Master Aldric', sprite: 'gideon' }, hollis_v2: { name: 'Gate Warden Hollis', sprite: 'hollis' },
  hm_clerk: { name: 'Clerk Wynn', sprite: 'folk6' }, hm_marta: { name: 'Marta of the Hearth', sprite: 'marta' }, hm_broker: { name: 'Madame Corvelle', sprite: 'elf_f1' },
  hm_coach: { name: 'Guild Coachman', sprite: 'folk9' }, hm_crier: { name: 'Guild Herald', sprite: 'folk12' }
});
const HM = {
  NAME: { hm_gate: 'Crown Road Gate', hm_plaza: 'The Gate Plaza', hm_guild: 'Guild Quarter', hm_lantern: 'Lantern Row', hm_ward: 'The Whisper Ward',
    hm_hall: "Guild Headquarters", hm_office: "Guild Master's Office", hm_lobby: 'The Midnight Exchange', hm_room: "The Wayfarer's Hearth" },
  is(m) { return /^hm_/.test(m || ''); },
  lines: () => {
    const f = G.S.f, L = ['The Gate hums louder at night. My grandmother said it was snoring.', 'Four hundred years the Guild has held that ring. Four hundred years and it still eats somebody every spring.',
      'Mind your purse in the Whisper Ward. Mind your secrets more.', 'The Wayfarer\'s Hearth does a fish pie that could raise the dead. Don\'t tell the Inquisition.',
      'Every licence on the continent was first stamped in this city.', 'They say the Headmaster rang the bell once and an entire legion turned around and went home.',
      'Guild Master Aldric is fair. Hard, but fair. He lost an eye to the Gate when he was younger than you.', 'Crown men come through the Crown Road Gate every week, asking about green-eyed children. The Guild sends them back out.'];
    if (f.trial === 'open') L.push('The Trial! The Trial is this week! The Guild Master speaks on the Platform — the whole city will be there.', 'Applicants from every village in the vale. Half of them won\'t come back out of the Gate.');
    if (f.trial === 'done') L.push('Did you hear? The Quarry pocket jumped to B-rank in the middle of the Trial. Somebody put a Crown stone down there.');
    return L;
  },
  crowd(areas, n) { return { count: n, areas, talk: e => talkFolk(e), lines: HM.lines }; },
  street(map, title, o) {
    return Object.assign({ map, title: 'Highmark', subtitle: title, music: 'town', bd: 'town', safe: true, tiles: {}, exits: [], npcs: () => [] }, o || {});
  }
};

/* ---------------- the scenes ---------------- */
SCENES.hm_gate = HM.street('hm_gate', HM.NAME.hm_gate, { crowd: HM.crowd([[20, 2, 22, 11], [8, 9, 16, 10], [26, 9, 32, 10]], 7) });
SCENES.hm_plaza = HM.street('hm_plaza', HM.NAME.hm_plaza, { crowd: HM.crowd([[8, 17, 18, 20], [24, 17, 34, 20], [7, 10, 11, 14], [31, 10, 35, 14]], 10) });
SCENES.hm_guild = HM.street('hm_guild', HM.NAME.hm_guild, { crowd: HM.crowd([[6, 18, 34, 19], [27, 11, 34, 11]], 6) });
SCENES.hm_lantern = HM.street('hm_lantern', HM.NAME.hm_lantern, { crowd: HM.crowd([[14, 15, 34, 16], [2, 11, 8, 12]], 7) });
SCENES.hm_ward = HM.street('hm_ward', HM.NAME.hm_ward, { crowd: HM.crowd([[1, 2, 3, 20], [29, 14, 34, 16], [6, 20, 30, 20]], 4) });
const HMI = (map, title, out, o) => Object.assign({ map, title: 'Highmark', subtitle: title, music: 'town', bd: 'town', safe: true, tiles: {}, npcs: () => [],
  exits: [out] }, o || {});
SCENES.hm_hall = HMI('hm_hall', HM.NAME.hm_hall, { x: 14, x2: 17, y: 17, to: 'hm_guild', tx: 15, ty: 10, dir: 'down' });
SCENES.hm_office = HMI('hm_office', HM.NAME.hm_office, { x: 14, x2: 17, y: 17, to: 'hm_hall', tx: 22, ty: 9, dir: 'down' });
SCENES.hm_lobby = HMI('hm_lobby', HM.NAME.hm_lobby, { x: 14, x2: 17, y: 17, to: 'hm_ward', tx: 21, ty: 16, dir: 'down' });
SCENES.hm_room = HMI('hm_room', HM.NAME.hm_room, { x: 14, x2: 16, y: 16, y2: 17, to: 'hm_lantern', tx: 22, ty: 14, dir: 'down' });
// the Great Hall's staircase goes up to the Guild Master's office
SCENES.hm_hall.exits.push({ x: 22, x2: 23, y: 8, to: 'hm_office', tx: 15, ty: 15, dir: 'up' });

/* ---------------- walking between the areas ---------------- */
(function () {
  const L = (from, spec) => SCENES[from].exits.push(spec);
  L('hm_gate', { x: 19, x2: 23, y: 0, to: 'hm_plaza', tx: 21, ty: 21, dir: 'up', label: 'Gate Plaza' });
  L('hm_plaza', { x: 20, x2: 22, y: 23, to: 'hm_gate', tx: 21, ty: 2, dir: 'down', label: 'Crown Road Gate' });
  L('hm_plaza', { x: 0, y: 10, y2: 12, to: 'hm_guild', tx: 40, ty: 11, dir: 'left', label: 'Guild Quarter' });
  L('hm_guild', { x: 42, y: 10, y2: 12, to: 'hm_plaza', tx: 2, ty: 11, dir: 'right', label: 'Gate Plaza' });
  L('hm_plaza', { x: 42, y: 10, y2: 12, to: 'hm_ward', tx: 2, ty: 11, dir: 'right', label: 'Whisper Ward' });
  L('hm_ward', { x: 0, y: 9, y2: 13, to: 'hm_plaza', tx: 40, ty: 11, dir: 'left', label: 'Gate Plaza' });
  L('hm_gate', { x: 42, y: 10, y2: 11, to: 'hm_lantern', tx: 2, ty: 12, dir: 'right', label: 'Lantern Row' });
  L('hm_lantern', { x: 0, y: 11, y2: 13, to: 'hm_gate', tx: 40, ty: 10, dir: 'left', label: 'Crown Road Gate' });
  L('hm_lantern', { x: 39, x2: 41, y: 0, to: 'hm_ward', tx: 21, ty: 21, dir: 'up', label: 'Whisper Ward' });
  L('hm_ward', { x: 19, x2: 23, y: 23, to: 'hm_lantern', tx: 40, ty: 2, dir: 'down', label: 'Lantern Row' });
  // the Crown Road south: the Guild coach back to Ashford
  L('hm_gate', { x: 20, x2: 22, y: 23, label: 'Crown Road — coach to Ashford', check: async () => {
    const c = await ask('hm_coach', null, '"Coach to Ashford Hollow, friend? Half a day down the Crown Road. Guild members ride free."', ['Ride to Ashford', 'Stay in Highmark']);
    Dlg.close(); if (c !== 0) return false;
    if (typeof ASH2 !== 'undefined') ASH2.raw = 1; await World.go('ashford', 21, 4, 'down'); return false; } });

  /* ---- doors and things to look at ---- */
  const T = (d, keys, fn) => keys.forEach(k => { SCENES[d].tiles[k] = fn; });
  T('hm_guild', ['14,9', '15,9', '16,9'], () => World.go('hm_hall', 15, 15, 'up'));
  T('hm_guild', ['23,18', '24,18', '25,18', '26,18', '27,18', '23,17', '25,17'], async () => {
    await narr('The great quest board. Bounties from six kingdoms: BEAST IN THE GRAIN STORES (D). ESCORT — SALT CARAVAN TO SALTREACH (C). MISSING: SURVEYOR, LAST SEEN AT THE QUARRY POCKET (B).');
    if (typeof Guild !== 'undefined' && Guild.open) { const c = await ask(null, null, 'Look through the Guild contracts?', ['Open the board', 'Not now']); if (c === 0) { Dlg.close(); Guild.open(); } } });
  T('hm_guild', ['27,11', '28,11', '29,11', '30,11', '31,11', '32,11', '33,11', '34,11'], async () => narr('The training yard. Straw dummies with fresh sword marks, and a chalk ring where two E-ranks are arguing about whose turn it is.'));
  T('hm_guild', ['31,19', '32,19', '33,19', '34,19'], async () => narr('The archery range. Every target has one arrow dead centre, and somebody has carved a tiny bell next to each of them.'));
  T('hm_lantern', ['21,12', '22,12', '23,12', '21,13', '22,13'], () => World.go('hm_room', 15, 15, 'up'));
  T('hm_lantern', ['30,12', '31,12', '32,12', '33,12', '34,13', '35,13'], async () => narr('The smithy. A dwarf with a beard braided round her neck is beating a glowing blade flat. She doesn\'t look up. "Ask after the Trial. Swords are cheaper then."'));
  T('hm_lantern', ['12,10', '13,10'], async () => narr('The Gilded Tankard. Somebody inside is singing a song about the Sword Saint. Badly. Everyone joins in on the chorus anyway.'));
  T('hm_ward', ['21,15', '22,15', '20,15', '23,15'], () => World.go('hm_lobby', 15, 15, 'up'));
  T('hm_ward', ['20,16', '21,16', '22,16', '23,16'], () => World.go('hm_lobby', 15, 15, 'up'));
  T('hm_plaza', ['21,14', '21,16'], async () => narr('The speaker\'s podium. Four hundred years of Guild Masters have stood here. The stone is worn into two shallow footprints.'));
  T('hm_plaza', ['20,13', '21,13', '22,13'], async () => {
    if (G.S.f.trial === 'open' && !G.S.f.hmAnn) { await narr('The Gate\'s iron door. Two wardens stand in front of it with halberds crossed.'); return; }
    await say('hollis_v2', 'neutral', G.S.f.trial === 'done' ? '"Licensed, are you? Good. The Gate\'s still closed to you, hood. When the Guild opens a pocket, you\'ll hear the bell."' : '"Nobody goes through without a Guild contract. Not you, not the Crown, not the Headmaster\'s cat."'); });
  T('hm_gate', ['17,6', '18,6', '17,11', '18,11'], async () => narr('A stable hut. The horses here wear the Guild\'s blue. One of them tries to eat your hood.'));
  T('hm_gate', ['26,8', '27,8', '28,8', '31,8', '32,8', '28,13', '29,13', '33,13', '34,13'], async () => narr(pick(['Travellers\' market: maps of the Gate pockets, "guaranteed accurate". None of them agree.', 'A stall selling lucky charms for Trial applicants. A sign says NO REFUNDS IF YOU DIE.', 'Dried fish, hot bread, cheap knives, and a man selling "genuine dragon scales" that are painted roof tiles.'])));
  // inside
  T('hm_hall', ['5,12', '6,12', '7,11', '8,10', '6,13', '7,12'], async () => {
    await say('hm_clerk', null, G.S.f.trial === 'open' ? (G.S.f.hmAnn ? '"Trial applicants, this way! Sign the waiver, take a seat, try not to be sick on the floor."' : '"The Trial? The Guild Master announces it on the Platform first. Gate Plaza — follow the crowd."') : '"Welcome to Highmark Headquarters. Contracts on the board outside, licences at this desk, complaints in the canal."'); });
  T('hm_hall', ['14,4', '15,4', '16,4', '17,4', '14,7', '15,7', '16,7', '17,7'], async () => narr('The Founders\' board: the names of every Guild Master of Highmark since the Gate was first held. The newest name, ALDRIC BRANDT, is carved deeper than the others.'));
  T('hm_office', ['12,7', '13,7', '14,7', '15,7', '16,7', '17,7', '11,7'], async () => narr('A map of the whole continent, stuck with pins. Blue for Guild halls. Red for Crown forts. And around Greyspire, a ring of black pins so dense the paper has torn.'));
  T('hm_office', ['8,10', '9,10', '7,10', '10,10'], async () => narr('Under glass: the Guild\'s first charter, signed four hundred years ago in what is very obviously blood. The last signature is fresh. S. HALE.'));
  T('hm_office', ['24,8', '24,9', '24,10', '24,11'], async () => narr('The stairs climb to a balcony. From up there the Gate fills half the sky, turning slowly, green and black.'));
  T('hm_room', ['24,8', '25,8', '26,8', '27,8', '22,8', '22,7', '20,8', '21,8'], async () => {
    const c = await ask(null, null, 'Your bed at the Wayfarer\'s Hearth. Sleep until morning? (Restores HP & MP.)', ['Sleep', 'Not now']); if (c !== 0) return;
    await fadeOut(600); Story.heal(true); if (typeof Cal !== 'undefined') G.S.day = (G.S.day || 1) + 1; save(); await fadeIn(600); await narr('You sleep without dreaming. Through the window, the Gate keeps turning.'); });
  T('hm_room', ['14,7', '15,7', '16,7'], async () => narr('From the window you can see the Gate over the rooftops, glowing green above the whole city. It never stops turning.'));
  T('hm_lobby', ['5,10', '6,10', '7,10', '8,10', '9,10', '9,11'], () => talkBroker());
})();

/* ---------------- people ---------------- */
async function talkBroker() {
  const f = G.S.f;
  if (!f.hmBroker) { f.hmBroker = 1;
    await say('hm_broker', null, '"Welcome to the Midnight Exchange, Grand House. House Meridian buys and sells what people know — never what they are."');
    await say('hm_broker', null, '"You have the look of someone who\'s being looked for. How refreshing. Most of our clients are the ones doing the looking."'); }
  await say('hm_broker', null, pick(['"Information costs coin. Silence costs more. Come back when you have a question worth paying for."', '"The Crown pays very well for green eyes. The Guild pays better for keeping them closed. We are, as ever, neutral."', '"A word of free advice — the Trial Gate was surveyed last month. By the Registry. Do with that what you like."']));
}
SCENES.hm_hall.npcs = () => {
  const f = G.S.f, L = [
    { id: 'hm_clerk', sprite: 'folk6', x: 8, y: 12, dir: 'left', ai: 'turn', turns: ['left', 'down'], talk: () => SCENES.hm_hall.tiles['5,12']() },
    { id: 'hm_adv1', sprite: 'hrok', x: 13, y: 15, dir: 'up', size: .8, talk: async () => say('hm_adv1', null, '"Third Trial for me. Third time\'s a licence, right? …Right?"') },
    { id: 'hm_adv2', sprite: 'dwarf_f1', x: 20, y: 11, dir: 'down', talk: async () => say('hm_adv2', null, '"Brenna Ironvein. Remember the name. You\'ll hear it shouted at the final."') },
    { id: 'hm_adv3', sprite: 'elf_m1', x: 26, y: 15, dir: 'left', talk: async () => say('hm_adv3', null, '"The Gate breathes. Did you notice? Every eleven seconds. I have been counting since dawn."') }];
  Object.assign(CHAR, { hm_adv1: { name: 'Big Adventurer', sprite: 'hrok' }, hm_adv2: { name: 'Dwarf Applicant', sprite: 'dwarf_f1' }, hm_adv3: { name: 'Elf Applicant', sprite: 'elf_m1' } });
  return L;
};
SCENES.hm_office.npcs = () => [{ id: 'aldric', sprite: 'gideon', x: 14, y: 11, dir: 'down', talk: talkAldric }];
SCENES.hm_lobby.npcs = () => [{ id: 'hm_broker', sprite: 'elf_f1', x: 11, y: 11, dir: 'left', talk: talkBroker }];
SCENES.hm_room.npcs = () => [{ id: 'hm_marta', sprite: 'marta', x: 19, y: 12, dir: 'down', ai: 'turn', turns: ['down', 'left', 'right'],
  talk: async () => say('hm_marta', 'happy', pick(['"Room\'s yours as long as you need it, love. Bed\'s the warm one. Fish pie\'s at sundown."', '"Trial applicants eat free on my floor the night before. My son went in, years back. He came out. Most do. Eat."', '"Don\'t mind the green light in the window. You stop noticing it after a year or two."'])) }];
SCENES.hm_plaza.npcs = () => {
  const f = G.S.f, L = [{ id: 'hollis_v2', sprite: 'hollis', x: 21, y: 13, dir: 'down', talk: () => SCENES.hm_plaza.tiles['21,13']() }];
  if (f.trial === 'open' && !f.hmAnn) L.push({ id: 'hm_crier', sprite: 'folk12', x: 21, y: 18, dir: 'down', talk: async () => say('hm_crier', null, '"Hear ye! The Guild Master speaks from the Platform! The Trial begins!"') });
  return L;
};
SCENES.hm_gate.npcs = () => [{ id: 'hm_coach', sprite: 'folk9', x: 22, y: 21, dir: 'up', talk: () => SCENES.hm_gate.exits.find(e => e.check).check() }];
async function talkAldric() {
  const f = G.S.f;
  if (f.trial === 'open' && f.hmAnn) { await say('aldric', 'neutral', '"The Great Hall, applicant. Downstairs. My clerk has your waiver. Go."'); return; }
  if (f.trial === 'done') { await say('aldric', 'neutral', `"${G.S.name || 'Hood'}. Licensed. I read your Gate report twice. The Registry bracket on that Core — I've sent it to the Headmaster with my own seal on it."`);
    await say('aldric', 'anger', '"Somebody in Aurel wanted dead applicants in my Gate. When I find out who, the Crown will learn what Guild neutrality costs."'); return; }
  await say('aldric', 'neutral', '"Aldric Brandt. Guild Master of Highmark. Not of the Guild — there is only one of those, and you\'d know if you\'d met her."');
}

/* ---------------- the Announcement on the Platform ---------------- */
async function hmAnnouncement() {
  const f = G.S.f; if (f.hmAnn || f.trial !== 'open') return; f.hmAnn = 1;
  await narr('The whole plaza is full. Farmhands, sellswords, a dwarf girl with a hammer bigger than she is, an elf boy who won\'t stop staring at the Gate. Everyone is facing the Platform.');
  const cine = typeof Cine !== 'undefined' && typeof paintShot === 'function' && Art.cut.hm_speech;
  const A = [['Guild Master Aldric', 'Four hundred years ago, nine men and women walked up to that ring and decided somebody had to stand in front of it. That was the first Guild. This is its city.', '#9fc8ff'],
    ['Guild Master Aldric', 'In three days, the Guild opens a pocket through the Gate — the Quarry. C-rank. Six hours. Survive it, and you walk out licensed. That is the Trial.', '#9fc8ff'],
    ['Guild Master Aldric', 'Some of you will not walk out. I am not saying that to scare you. I am saying it because it is true every year.', '#9fc8ff']];
  if (cine) await Cine.play([paintShot('hm_speech', 5200, A, { y: 330 })]);
  else for (const [, t] of A) await say('aldric', 'neutral', t);
  await say('aldric', 'shout', '"The Trial is open to every race, every village, every name. The Guild does not care what you are. Only what you DO."');
  // the true head of the Guild
  await narr('Then every lantern around the plaza flickers at once. The air tastes like a storm. Lightning crawls up the fortress wall without a sound.');
  const met = f.seraphineMet;
  await narr('When it fades, a woman stands at the podium beside the Guild Master who was not there a heartbeat ago. Platinum hair tied high, pale violet coat, the eyes of someone much older than she looks.');
  await narr('Aldric Brandt — Guild Master of the mother city — goes down on one knee. So does every adventurer in the plaza.');
  await say('seraphine', 'neutral', '"Seraphine Hale. Some of you know me as the Headmaster. The Guild Masters run the halls. I run the Guild — every hall, every licence, every rank from E to SSS."');
  await say('seraphine', 'happy', '"I don\'t usually come to Trials. This year I had a feeling. I have learned to listen to those."');
  if (met) await narr('Across the whole crowd, her eyes find your hood. She gives you the smallest nod — the bell token in your pocket hums.');
  else await narr('Her eyes move across the crowd and stop on your hood. They stay there one breath too long.');
  await say('seraphine', 'neutral', '"Go to the Great Hall. Sign your waivers. And when you are in my Gate — protect each other. That is the only rule I will never forgive you for breaking."');
  await narr('A bell rings somewhere far away — not a sound so much as a feeling in your teeth. When the plaza looks up again, she is gone.');
  f.seraphineSeenHM = 1;
  Story.quest('The Guild Trial: go to the Great Hall in Highmark\'s Guild Quarter (left of the Gate Plaza) and sign up.');
}

/* ---------------- hooks: arrival, the announcement, the hall, fast travel ---------------- */
(function () {
  const _l = World.load.bind(World);
  World.load = async function (name, x, y, dir) {
    const r = await _l(name, x, y, dir);
    try {
      if (name === 'hm_plaza' && G.S.f.trial === 'open' && !G.S.f.hmAnn && G.mode === 'world') {
        let n = 0; const tk = setInterval(() => { if (G.S.f.hmAnn || ++n > 40 || G.S.map !== 'hm_plaza') return clearInterval(tk);
          if (!World.busy && !World.loading && !Dlg.open && G.mode === 'world' && n > 2) { clearInterval(tk); Story.run(hmAnnouncement); } }, 400);
      }
      if (HM.is(name)) { G.S.visited = G.S.visited || {}; G.S.visited.hm_gate = 1; }
    } catch (e) { console.warn(e); }
    return r;
  };
  // fast travel: Highmark on the world map
  if (typeof MAPLOC !== 'undefined') MAPLOC.push({ id: 'highmark', name: 'Highmark, Mother City of the Guild', kind: 'city', x: .735, y: .655,
    text: 'Where the first Adventurers\' Guild was founded, four hundred years ago, to hold the Gate — a colossal ring of black stone that opens onto other places. Every licence on the continent was first stamped here. Guild Master: Aldric Brandt.', scene: ['hm_gate', 21, 21, 'up'] });
  if (typeof Travel !== 'undefined' && Travel.canFrom) { const _c = Travel.canFrom.bind(Travel); Travel.canFrom = function () { const m = G.S.map; if (HM.is(m)) { G.S.map = 'ashford'; try { return _c(); } finally { G.S.map = m; } } return _c(); }; }
  // the Guild coach in Ashford's Market Square
  if (typeof ASH2 !== 'undefined') {
    const _n = ASH2.npcsFor.bind(ASH2);
    ASH2.npcsFor = function (d) { const L = _n(d);
      if (d === 'ashford' && !G.S.kid && G.S.f.vaneDone) { const [x, y] = this.snap('ashford', 22, 3);
        L.push({ id: 'hm_coach', sprite: 'folk9', x, y, dir: 'down', qm: () => G.S.f.trial === 'open' && !G.S.visited?.hm_gate ? '!' : null,
          talk: async () => { const c = await ask('hm_coach', null, '"Guild coach to Highmark — the mother city! Up the Crown Road, half a day. Trial applicants ride free."', ['Ride to Highmark', 'Not yet']);
            Dlg.close(); if (c === 0) await World.go('hm_gate', 21, 21, 'up'); } }); }
      return L; };
  }
})();

/* signposts on every way out, like Ashford's */
(function () {
  const _r = World.render.bind(World);
  World.render = function (c, t) {
    _r(c, t);
    try {
      if (!G.S || !HM.is(G.S.map) || this.loading || G.mode !== 'world' || G.maps[this.scene.map].interior) return;
      const cx = Math.round(this.cam.x), cy = Math.round(this.cam.y), W = this.map.w * TILE, H = this.map.h * TILE;
      c.save(); c.font = '800 9px Nunito, system-ui'; c.textAlign = 'center'; c.textBaseline = 'middle';
      for (const e of this.scene.exits || []) {
        if (!e.label) continue;
        const x0 = e.x, x1 = e.x2 ?? e.x, y0 = e.y, y1 = e.y2 ?? e.y, mx = (x0 + x1 + 1) / 2 * TILE, my = (y0 + y1 + 1) / 2 * TILE;
        const ar = e.door ? '▲' : y1 <= 0 ? '↑' : y0 >= this.map.h - 1 ? '↓' : x0 <= 0 ? '←' : '→';
        const lx = Math.max(60, Math.min(W - 60, mx)) - cx, ly = Math.max(16, Math.min(H - 16, my + (ar === '↑' ? 14 : ar === '↓' ? -14 : 0))) - cy;
        const txt = ar === '→' ? e.label + ' →' : ar === '←' ? '← ' + e.label : ar === '▲' ? e.label : ar + ' ' + e.label, w = c.measureText(txt).width + 12;
        c.fillStyle = 'rgba(10,18,14,.72)'; c.beginPath(); c.roundRect ? c.roundRect(lx - w / 2, ly - 8, w, 16, 7) : c.rect(lx - w / 2, ly - 8, w, 16); c.fill();
        c.strokeStyle = 'rgba(255,220,140,.6)'; c.lineWidth = 1; c.stroke(); c.fillStyle = '#ffe7a8'; c.fillText(txt, lx, ly + .5);
      }
      c.restore();
    } catch (e) { }
  };
})();

/* painted moments from the character sheets: a picture at the right beat of the story (once each) */
const Paint = {
  async show(id, line, col) {
    if (typeof Art === 'undefined' || !Art.cut[id] || typeof Cine === 'undefined' || typeof paintShot !== 'function') return;
    const f = G.S.f; f.seen = f.seen || {}; if (f.seen[id]) return; f.seen[id] = 1;
    try { await Cine.play([paintShot(id, 2600, [['', line, col || '#e8f4ee']], { y: 330 })]); } catch (e) { }
  }
};
(function () {
  // a line of dialogue at a known story beat shows its painting first
  const HOOK = [[/Lightning crawls up the fortress wall/, 'sera_storm', 'Seraphine Hale — the Unbroken Bell.', '#d6a8ff'],
    [/Dread's riders took the children at dawn/, 'dread_riders', 'Dawn. The riders, and the cages.', '#9dffc8'],
    [/Tonight we burn Halvard's granary/, 'halv_granary', 'Inquisitor Halvard.', '#ffd36a']];
  const _ln = Dlg.line.bind(Dlg);
  Dlg.line = async function (who, expr, text, choices) {
    const r = await _ln(who, expr, text, choices);
    try { for (const [re, cut, l, c] of HOOK) if (re.test(String(text))) { Dlg.close && Dlg.close(); await Paint.show(cut, l, c); } } catch (e) { }
    return r;
  };
  // Kess joins: the rooftop
  let kj = false; setInterval(() => { try { if (!kj && G.S && G.S.f && G.S.f.kessJoined && G.mode === 'world' && !World.busy && !Dlg.open) { kj = true; if (!(G.S.f.seen || {}).kess_roof) Story.run(() => Paint.show('kess_roof', 'Kess — and Smudge. Mostly Smudge.', '#d8a8ff')); } } catch (e) { } }, 1500);
})();
/* doors you walk into (no button needed), each with a little sign over it */
(function () {
  const D = (sc, spec) => SCENES[sc].exits.push(spec);
  D('hm_guild', { x: 14, x2: 16, y: 9, to: 'hm_hall', tx: 15, ty: 15, dir: 'up', label: 'Guild Headquarters', door: 1 });
  D('hm_lantern', { x: 21, x2: 23, y: 12, to: 'hm_room', tx: 15, ty: 15, dir: 'up', label: 'Wayfarer\'s Hearth (inn)', door: 1 });
  D('hm_ward', { x: 20, x2: 23, y: 15, to: 'hm_lobby', tx: 15, ty: 15, dir: 'up', label: 'Midnight Exchange', door: 1 });
})();
