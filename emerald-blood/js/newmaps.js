/* ================= THE USER'S PAINTED MAPS =================
   The East Woods, Gloamwood, the Realm of No Return, the Guild's Great Hall and the four floors of the Quarry Gate
   are the user's own paintings. Collision was traced tile by tile over each one, so what looks open is open.
   This file moves every person, door, exit and pickup onto the new paintings. */
(function () {
  const inR = (r, x, y) => x >= r[0] && x <= r[2] && y >= r[1] && y <= r[3];

  /* ---------- the East Woods ---------- */
  const W = SCENES.woods;
  W.exits = [{ x: 38, x2: 40, y: 40, to: 'ashford', tx: 58, ty: 20, dir: 'left', label: 'Ashford Hollow' }];
  W.tiles = {};
  for (const k of ['18,23', '19,23', '18,24', '19,24']) W.tiles[k] = () => shrine();
  for (const k of ['24,21', '25,21', '24,22', '25,22']) W.tiles[k] = () => crate();
  for (const k of ['8,22', '8,23', '8,24', '13,24', '13,25', '14,27', '15,27', '16,29', '17,30', '18,31', '20,33', '23,35']) W.tiles[k] = () => spring();
  const WP = { rook: [30, 18], bandit: [32, 19], dace: [18, 7], sefa: [15, 7], wren: [20, 8], corran: [13, 9], scout: [14, 10], alpha: [25, 30], liora: [24, 29],
    tam: [17, 22], convoy: [35, 16], wherald: [33, 20] };
  const _wn = W.npcs;
  W.npcs = function () { return _wn.call(this).map(n => WP[n.id] ? Object.assign(n, { x: WP[n.id][0], y: WP[n.id][1] }) : n); };
  if (typeof GATHER_SPOTS !== 'undefined') { GATHER_SPOTS.woods = [[16, 21], [27, 25], [6, 18], [35, 20], [30, 34]]; GATHER_SPOTS.realm = [[14, 27], [30, 29]]; }
  if (typeof DUNGEONS !== 'undefined' && DUNGEONS.d_warren) DUNGEONS.d_warren.from = Object.assign({}, DUNGEONS.d_warren.from, { at: [37, 12], back: [37, 14] });
  if (typeof MOUNTS !== 'undefined') { const C = MOUNTS; if (C.mare) C.mare.where = ['woods', 26, 26]; if (C.lupine) C.lupine.where = ['woods', 37, 15]; if (C.stag) C.stag.where = ['woods', 21, 7]; }
  if (typeof QNPC !== 'undefined') { if (QNPC.fenwick) QNPC.fenwick.at = [22, 31]; if (QNPC.merchant) QNPC.merchant.at = [37, 37]; }
  if (typeof QDEF !== 'undefined' && QDEF.q_caravan && QDEF.q_caravan.goal) QDEF.q_caravan.goal.at = [37, 37];
  if (typeof MAPLOC !== 'undefined') for (const L of MAPLOC) {
    if (L.id === 'woods') L.scene = ['woods', 39, 38, 'up'];
    if (L.id === 'dg_warren') L.scene = ['woods', 37, 14, 'down'];
  }
  // every way into the woods arrives at the footbridge road
  for (const k in SCENES) { const s = SCENES[k]; let ex; try { ex = Object.getOwnPropertyDescriptor(s, 'exits'); } catch (e) { continue; }
    if (!ex || !Array.isArray(ex.value)) continue;
    for (const e of ex.value) {
      if (e.to === 'woods') { e.tx = 39; e.ty = 38; e.dir = 'up'; }
      if (e.to === 'gloam') { e.tx = 14; e.ty = 41; e.dir = 'up'; }
      if (e.to === 'realm') { e.tx = 22; e.ty = 45; e.dir = 'up'; }
      if (e.to === 'hm_hall') { e.tx = 17; e.ty = 33; e.dir = 'up'; }
    } }

  /* ---------- Gloamwood ---------- */
  const GL = SCENES.gloam;
  GL.exits = [{ x: 14, x2: 15, y: 44, to: 'hm_city', tx: 2, ty: 23, dir: 'right', label: 'Highmark' }];
  const GP = { g_brask: [38, 10, 'down'], g_hound1: [36, 9, 'right'], g_briar: [7, 12, 'right'], g_cutter: [39, 29, 'up'], g_alpha: [20, 39, 'down'] };
  const _gn = GL.npcs;
  GL.npcs = function () { return _gn.call(this).map(n => GP[n.id] ? Object.assign(n, { x: GP[n.id][0], y: GP[n.id][1], dir: GP[n.id][2] }) : n); };
  GL.tiles = { '38,27': () => narr('The Humming Shrine: a broken ring of old stones around a cracked altar. Something under it buzzes, like a trapped bee.'),
    '37,27': () => narr('The Humming Shrine: a broken ring of old stones around a cracked altar. Something under it buzzes, like a trapped bee.'),
    '20,40': () => narr('A stone arch over black water. The den. It smells of old blood and wet fur.') };

  /* ---------- the Realm of No Return ---------- */
  const R = SCENES.realm;
  R.exits = [{ x: 19, x2: 26, y: 47, msg: 'The storm turns you around. Every path out of the Realm leads back to the hut.', when: () => !F().vaneDone },
    Object.assign({}, (R.exits.find(e => e.to === 'ashford') || {}), { x: 19, x2: 26, y: 47 })];
  R.tiles = {};
  for (const k of ['19,24', '19,25', '18,25', '19,29', '22,30', '21,31', '22,31']) R.tiles[k] = () => stoneTile();
  door('realm', 23, 17, 'r_hut');
  R.step = function (x, y) { const f = F(); if (!f.vaneMet && y <= 36) { Story.run(realmAmbush); return true; } };
  const _rn = R.npcs;
  R.npcs = function () { return _rn.call(this).map(n => n.id === 'vane' ? Object.assign(n, { x: 20, y: 26 }) : n); };

  /* ---------- the Guild's Great Hall (Highmark HQ) ---------- */
  const H = SCENES.hm_hall;
  H.exits = [{ x: 15, x2: 20, y: 35, to: 'hm_city', tx: 9, ty: 13, dir: 'down' }, { x: 26, x2: 27, y: 11, to: 'hm_office', tx: 15, ty: 15, dir: 'up', label: "Guild Master's office", door: 1 }];
  if (SCENES.hm_office && SCENES.hm_office.exits && SCENES.hm_office.exits[0]) Object.assign(SCENES.hm_office.exits[0], { to: 'hm_hall', tx: 26, ty: 13, dir: 'down' });
  H.title = 'The Great Hall'; H.subtitle = 'Guild Headquarters, Highmark';
  const clerk = H.tiles['5,12'];
  H.tiles = {};
  for (const k of ['13,11', '14,11', '15,11', '16,11', '17,11', '18,11', '19,11', '20,11', '21,11', '22,11'])
    H.tiles[k] = async () => narr('The Guild\'s banners: the anchor-and-sword of the first Guild, and beneath it, stitched in silver, the name of every Guild Master of Highmark. The newest, ALDRIC BRANDT, is the brightest.');
  const CROWD = [[6, 18, 'folk3'], [9, 18, 'dwarf_m1'], [12, 19, 'folk7'], [24, 19, 'folk11'], [27, 18, 'elf_f1'], [29, 20, 'folk15'], [7, 22, 'folk0'], [10, 21, 'folk16'],
    [13, 22, 'folk2'], [22, 22, 'folk19'], [25, 21, 'folk13'], [28, 23, 'folk10'], [8, 28, 'folk5'], [12, 29, 'folk9'], [23, 28, 'folk14'], [27, 29, 'folk12'],
    [9, 31, 'kid8'], [26, 31, 'dwarf_f1'], [14, 20, 'folk6'], [21, 20, 'elf_m1']];
  H.npcs = function () {
    const f = G.S.f;
    const L = [{ id: 'hm_clerk', sprite: 'folk6', x: 7, y: 20, dir: 'right', ai: 'turn', turns: ['right', 'down'], talk: () => clerk ? clerk() : null },
      { id: 'hm_adv1', sprite: 'hrok', x: 11, y: 30, dir: 'up', size: .8, talk: async () => say('hm_adv1', null, '"Third Trial for me. Third time\'s a licence, right? …Right?"') },
      { id: 'hm_adv2', sprite: 'dwarf_f1', x: 24, y: 20, dir: 'down', talk: async () => say('hm_adv2', null, '"Brenna Ironvein. Remember the name. You\'ll hear it shouted at the final."') },
      { id: 'hm_adv3', sprite: 'elf_m1', x: 28, y: 29, dir: 'left', talk: async () => say('hm_adv3', null, '"The Gate breathes. Did you notice? Every eleven seconds. I have been counting since dawn."') }];
    Object.assign(CHAR, { hm_adv1: { name: 'Big Adventurer', sprite: 'hrok' }, hm_adv2: { name: 'Dwarf Applicant', sprite: 'dwarf_f1' }, hm_adv3: { name: 'Elf Applicant', sprite: 'elf_m1' } });
    if (f.trial === 'open') CROWD.forEach(([x, y, sp], i) => { const id = 'hall_crowd' + i; CHAR[id] = { name: 'Applicant', sprite: sp };
      L.push({ id, sprite: sp, x, y, dir: 'up', folk: true, talk: async () => say(id, null, pick(['"Shh! He\'s about to start."', '"I came all the way from Kettlebrook for this."', '"My mother thinks I\'m at market."', '"Is that HER? Up there? No — it can\'t be."', '"Six hours in a Gate. Six hours. I can do six hours."'])) }); });
    return L;
  };

  /* the Announcement now happens in the Great Hall, under the banners, in front of every applicant */
  hmAnnouncement = async function () {
    const f = G.S.f; if (f.hmAnn || f.trial !== 'open') return; f.hmAnn = 1;
    await narr('The Great Hall is packed wall to wall. Farmhands, sellswords, a dwarf girl with a hammer bigger than she is, an elf boy who won\'t stop staring at the windows. Every face is turned toward the dais.');
    const A = [['Guild Master Aldric', 'Four hundred years ago, nine men and women walked up to the Gate and decided somebody had to stand in front of it. That was the first Guild. This is its hall.', '#9fc8ff'],
      ['Guild Master Aldric', 'Today the Guild opens a pocket through the Gate — the Quarry. C-rank. Six hours. Survive it, and you walk out licensed. That is the Trial.', '#9fc8ff'],
      ['Guild Master Aldric', 'Some of you will not walk out. I am not saying that to scare you. I am saying it because it is true every year.', '#9fc8ff']];
    const art = typeof Art !== 'undefined' && typeof paintShot === 'function' && Art.cut.hm_ceremony ? 'hm_ceremony' : (Art && Art.cut && Art.cut.hm_speech ? 'hm_speech' : null);
    if (art) await Cine.play([paintShot(art, 5200, A, { y: 330 })]);
    else for (const [, t] of A) await say('aldric', 'neutral', t);
    await say('aldric', 'shout', '"The Trial is open to every race, every village, every name. The Guild does not care what you are. Only what you DO."');
    if (typeof Paint !== 'undefined') await Paint.show('sera_storm', 'Seraphine Hale — the Unbroken Bell.', '#d6a8ff');
    await narr('Then every torch in the hall gutters at once. The air tastes like a storm. Lightning crawls up the pillars without a sound.');
    await narr('When it fades, a woman stands on the dais beside the Guild Master who was not there a heartbeat ago. Platinum hair tied high, pale violet coat, the eyes of someone much older than she looks.');
    await narr('Aldric Brandt — Guild Master of the mother city — goes down on one knee. So does every adventurer in the hall.');
    await say('seraphine', 'neutral', '"Seraphine Hale. Some of you know me as the Headmaster. The Guild Masters run the halls. I run the Guild — every hall, every licence, every rank from E to SSS."');
    await say('seraphine', 'happy', '"I don\'t usually come to Trials. This year I had a feeling. I have learned to listen to those."');
    if (f.seraphineMet) await narr('Across the whole crowd, her eyes find your hood. She gives you the smallest nod — the bell token in your pocket hums.');
    else await narr('Her eyes move across the crowd and stop on your hood. They stay there one breath too long.');
    await say('seraphine', 'neutral', '"Sign your waivers. And when you are in my Gate — protect each other. That is the only rule I will never forgive you for breaking."');
    await narr('A bell rings somewhere far away — not a sound so much as a feeling in your teeth. When the hall looks up again, she is gone.');
    f.seraphineSeenHM = 1;
    Story.quest('The Guild Trial: it begins now, in the Great Hall.');
    await Trial.run();
  };
  // the crier sends you to the hall; the plaza no longer stops you
  if (SCENES.hm_city) {
    SCENES.hm_city.step = () => false;
    const _cn = SCENES.hm_city.npcs;
    SCENES.hm_city.npcs = function () { return _cn.call(this).map(n => n.id === 'hm_crier' ? Object.assign(n, { talk: async () => say('hm_crier', null, '"Hear ye! The Guild Master speaks in the Great Hall — Guild Headquarters, west of the Gate! The Trial begins!"') }) : n); };
  }

  /* ---------- the four floors of the Quarry Gate ---------- */
  const FLOOR = (map, title, sub, tint) => ({ map, title, subtitle: sub, safe: true, music: 'boss', bd: 'crypt', tint, exits: [], tiles: {}, npcs: () => [],
    step(x, y) {
      const w = Trial.W; if (!w || w.map !== map) return false;
      for (const e of w.ev) if (!e.done && inR(e.at, x, y)) {
        e.done = 1; World.busy = true; UI.controls(false);
        Promise.resolve().then(e.fn).catch(err => console.error(err)).finally(() => { Dlg.close(); const p = World.player;
          if (Trial.W === w && p && inR(w.goal, p.x, p.y)) { Trial.W = null; w.res(); return; }
          World.busy = false; if (G.mode === 'world') UI.controls(true); UI.hud(); });
        return true; }
      if (inR(w.goal, x, y)) { Trial.W = null; World.busy = true; UI.controls(false); w.res(); return true; }
      return false;
    } });
  SCENES.gate1 = FLOOR('gate1', 'Floor One — The Quarry Steps', 'Inside the Gate', 'rgba(0,30,20,.18)');
  SCENES.gate2 = FLOOR('gate2', 'Floor Two — The Drowned Bells', 'Inside the Gate', 'rgba(0,20,40,.14)');
  SCENES.gate3 = FLOOR('gate3', 'Floor Three — The Weeping Hall', 'Inside the Gate', 'rgba(0,30,10,.2)');
  SCENES.gate4 = FLOOR('gate4', 'Floor Four — The Core Chamber', 'Inside the Gate', 'rgba(0,40,20,.2)');
  /* walk a floor: you have the controls until you reach the goal; story beats fire as you pass through them */
  Trial.floor = async function (map, x, y, dir, goal, ev, hint) {
    if (Dlg.open) Dlg.close();
    await fadeOut(400); await World.load(map, x, y, dir); await fadeIn(450);
    banner(SCENES[map].title, 'Inside the Gate', 1800);
    if (hint) Story.quest(hint);
    return new Promise(res => { Trial.W = { map, goal, ev: (ev || []).map(e => Object.assign({}, e)), res }; World.busy = false; UI.controls(true); UI.hud(); });
  };

  /* ---------- after a load: no one wakes up inside a wall, or inside a Gate ---------- */
  const _l = World.load.bind(World);
  World.load = async function (name, x, y, dir) {
    if (/^gate[1-4]$/.test(name) && !Trial.active) { name = 'hm_hall'; x = 17; y = 33; dir = 'up'; }
    const r = await _l(name, x, y, dir);
    try {
      const M = G.maps[(SCENES[name] || {}).map || name]; const p = World.player;
      if (M && M.col && p) {
        const solid = (X, Y) => X < 0 || Y < 0 || X >= M.w || Y >= M.h || M.col[Y][X] === '1';
        const near = (X, Y) => { if (!solid(X, Y)) return [X, Y]; for (let r = 1; r < 12; r++) for (let dy = -r; dy <= r; dy++) for (let dx = -r; dx <= r; dx++) if (Math.max(Math.abs(dx), Math.abs(dy)) === r && !solid(X + dx, Y + dy)) return [X + dx, Y + dy]; return [X, Y]; };
        for (const e of World.ents || []) { if (solid(e.x, e.y)) { const [nx, ny] = near(e.x, e.y); e.x = nx; e.y = ny; e.px = nx * 32 + 16; e.py = ny * 32 + 26; if (e === p) { G.S.x = nx; G.S.y = ny; } } }
      }
      // the Announcement waits in the Great Hall
      if (name === 'hm_hall' && G.S.f.trial === 'open' && !G.S.f.hmAnn) {
        let n = 0; const tk = setInterval(() => {
          if (G.S.f.hmAnn || ++n > 60 || G.S.map !== 'hm_hall') return clearInterval(tk);
          if (n > 2 && !World.busy && !World.loading && !Dlg.open && !Battle.B && G.mode === 'world') { clearInterval(tk); Story.run(hmAnnouncement); }
        }, 400);
      }
    } catch (e) { console.warn(e); }
    return r;
  };

  /* ---------- the carriage sign carries the coach emblem ---------- */
  const coachImg = new Image(); coachImg.src = 'assets/emblems/e08.png';
  const _r = World.render.bind(World);
  World.render = function (c, t) {
    _r(c, t);
    try { if (G.mode !== 'world' || this.loading || !coachImg.complete || !coachImg.naturalWidth) return;
      const e = (this.ents || []).find(n => n.id === 'hm_coachman'); if (!e) return;
      const h = 30, w = h * coachImg.naturalWidth / coachImg.naturalHeight;
      c.drawImage(coachImg, e.px - Math.round(this.cam.x) - w / 2, e.py - 62 - Math.round(this.cam.y) - 8 - h, w, h);
    } catch (x) { }
  };
})();
