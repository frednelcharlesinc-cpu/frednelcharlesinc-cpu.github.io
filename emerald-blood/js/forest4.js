/* ================= THE FOUR WOODS =================
   The East Woods are now four painted maps around a crossroads:
   SOUTH (the hub, from Ashford) · NORTH (the ancient tree, the den, the Green Eclipse camp)
   EAST (the wagon road and Rook's bandit camp) · WEST (the river, the stag meadow, the Goblin Warren).
   The old 'woods' key is the South hub, so every road and story beat that sends you "to the woods" still lands at the crossroads. */
(function () {
  const H = SCENES.woods;
  const isWoods = m => /^woods(_[new])?$/.test(m || '');
  window.isWoods = isWoods;
  const ell = (cx, cy, rx, ry, fn, T) => { for (let y = Math.floor(cy - ry); y <= cy + ry; y++) for (let x = Math.floor(cx - rx); x <= cx + rx; x++) if (((x + .5 - cx) / rx) ** 2 + ((y + .5 - cy) / ry) ** 2 <= 1) T[x + ',' + y] = fn; };

  /* who lives where, and where they stand */
  const ZONE = {
    tam: ['woods', 26, 17, 'down'],
    rook: ['woods_e', 22, 20, 'left'], bandit: ['woods_e', 22, 22, 'up'], convoy: ['woods_e', 31, 19, 'left'], wherald: ['woods_e', 27, 20, 'down'],
    dace: ['woods_n', 30, 23, 'right'], sefa: ['woods_n', 33, 25, 'up'], wren: ['woods_n', 31, 26, 'up'], corran: ['woods_n', 34, 23, 'left'], scout: ['woods_n', 32, 27, 'down'],
    alpha: ['woods_n', 8, 24, 'down'], liora: ['woods_n', 10, 25, 'left']
  };
  const baseNpcs = H.npcs;
  const npcsFor = key => function () {
    return baseNpcs.call(H).filter(n => (ZONE[n.id] ? ZONE[n.id][0] : 'woods') === key).map(n => {
      const z = ZONE[n.id]; if (z) { n.x = z[1]; n.y = z[2]; if (!n.ai) n.dir = z[3]; } return n;
    });
  };

  /* ---- SOUTH: the crossroads hub ---- */
  H.title = 'The South Woods'; H.subtitle = 'The crossroads of the East Woods';
  H.npcs = npcsFor('woods');
  H.exits = [
    { x: 18, x2: 21, y: 39, to: 'ashford', tx: 58, ty: 20, dir: 'left', label: 'Ashford Hollow' },
    { x: 18, x2: 21, y: 0, to: 'woods_n', tx: 19, ty: 38, dir: 'up', label: 'North Woods' },
    { x: 0, y: 18, y2: 21, to: 'woods_w', tx: 38, ty: 19, dir: 'left', label: 'West Woods' },
    { x: 39, y: 18, y2: 21, to: 'woods_e', tx: 1, ty: 19, dir: 'right', label: 'East Woods' }
  ];
  H.tiles = {};
  for (let y = 17; y <= 21; y++) for (let x = 19; x <= 20; x++) H.tiles[x + ',' + y] = () => shrine();      // the old rune stone at the crossroads
  ell(10.2, 30.6, 5.6, 4.0, () => spring(), H.tiles);                                                 // the lily pond
  for (let x = 23; x <= 30; x++) H.tiles[x + ',16'] = () => narr('A ruined shrine, older than Ashford. Someone has swept the steps and left fresh flowers on the altar.');

  /* ---- NORTH: the ancient tree ---- */
  SCENES.woods_n = {
    title: 'The North Woods', subtitle: 'Where the old tree remembers', music: 'woods', bd: 'forest',
    encounters: H.encounters, npcs: npcsFor('woods_n'),
    exits: [
      { x: 18, x2: 21, y: 39, to: 'woods', tx: 19, ty: 1, dir: 'down', label: 'the Crossroads' },
      { x: 18, x2: 21, y: 0, msg: 'The old north road is swallowed by roots. Whatever it led to, the forest has taken back.' }
    ],
    tiles: {}
  };
  const N = SCENES.woods_n.tiles;
  ell(5.2, 19.8, 4.2, 3.4, () => narr('A den under the rocks. It reeks of wet fur and old bones. Claw marks score the stone at the height of your head.'), N);
  ell(20.2, 18.6, 4.8, 5.0, () => narr('The ancient tree. Its roots are thicker than houses. When you press your palm to the bark, it is warm — and, very faintly, it hums.'), N);
  for (const [x, y] of [[11, 15], [12, 15], [11, 16], [12, 16], [28, 15], [29, 15], [28, 16], [29, 16], [17, 28], [17, 27], [23, 29], [23, 28]])
    N[x + ',' + y] = () => narr('A standing stone with a blue light pulsing at its heart, slow as breathing. The light leans toward your eyes when you come close.');

  /* ---- EAST: the wagon road ---- */
  SCENES.woods_e = {
    title: 'The East Woods', subtitle: 'The wagon road', music: 'woods', bd: 'forest',
    encounters: H.encounters, npcs: npcsFor('woods_e'),
    exits: [
      { x: 0, y: 18, y2: 20, to: 'woods', tx: 38, ty: 19, dir: 'left', label: 'the Crossroads' },
      { x: 39, y: 18, y2: 20, msg: 'The wagon road runs on east for days, all the way to Highmark. Better to take the carriage from Ashford.' }
    ],
    tiles: {},
    async onEnter() { if (G.S.q && G.S.q.toll === 'active') await tollMen(); }
  };
  const E = SCENES.woods_e.tiles;
  for (const k of ['11,18', '12,18', '13,18', '14,18', '15,18']) E[k] = () => crate();
  ell(6.6, 5.8, 3.4, 2.4, () => spring(), E);

  /* ---- WEST: the river ---- */
  SCENES.woods_w = {
    title: 'The West Woods', subtitle: 'The river meadows', music: 'woods', bd: 'forest',
    encounters: H.encounters, npcs: () => [],
    exits: [
      { x: 39, y: 18, y2: 21, to: 'woods', tx: 1, ty: 19, dir: 'right', label: 'the Crossroads' },
      { x: 0, y: 19, y2: 20, msg: 'The river path winds west toward Millbrook, but the ford is too deep. Take the south gate road from Ashford.' }
    ],
    tiles: {}
  };
  const Wt = SCENES.woods_w.tiles;
  for (let y = 14; y <= 33; y++) for (const x of [19, 20]) if (y < 18 || y > 21) if (y < 29 || y > 32) Wt[x + ',' + y] = () => spring();
  for (const [x, y] of [[4, 7], [20, 7], [31, 7], [8, 11], [13, 32], [23, 29]]) Wt[x + ',' + y] = () => narr('A glowing blue stone, half sunk in the grass. The deer graze right up to it and never seem afraid.');

  /* ---- everything that pointed at the old woods ---- */
  if (typeof GATHER_SPOTS !== 'undefined') Object.assign(GATHER_SPOTS, {
    woods: [[8, 14], [30, 26], [13, 24]], woods_n: [[6, 9], [27, 31], [24, 27]],
    woods_e: [[6, 9], [33, 3], [36, 31]], woods_w: [[14, 21], [26, 20], [10, 26]]
  });
  if (typeof MOUNTS !== 'undefined') { const C = MOUNTS; if (C.mare) C.mare.where = ['woods', 30, 27]; if (C.lupine) C.lupine.where = ['woods_n', 25, 8]; if (C.stag) C.stag.where = ['woods_w', 26, 17]; }
  if (typeof DUNGEONS !== 'undefined' && DUNGEONS.d_warren) DUNGEONS.d_warren.from = Object.assign({}, DUNGEONS.d_warren.from, { map: 'woods_w', at: [4, 3], back: [4, 5] });
  if (typeof QNPC !== 'undefined') { if (QNPC.fenwick) Object.assign(QNPC.fenwick, { map: 'woods', at: [8, 23] }); if (QNPC.merchant) Object.assign(QNPC.merchant, { map: 'woods_e', at: [5, 19] }); }
  if (typeof QDEF !== 'undefined') {
    if (QDEF.q_caravan && QDEF.q_caravan.goal) Object.assign(QDEF.q_caravan.goal, { map: 'woods_e', at: [5, 19] });
    if (QDEF.q_redeye && QDEF.q_redeye.goal) { Object.assign(QDEF.q_redeye.goal, { map: 'woods_n', at: [16, 30] }); QDEF.q_redeye.desc = QDEF.q_redeye.desc.replace('south clearing of the East Woods', 'North Woods, near the old tree'); }
  }
  if (typeof MAPLOC !== 'undefined') for (const L of MAPLOC) {
    if (L.id === 'woods') L.scene = ['woods', 19, 38, 'up'];
    if (L.id === 'dg_warren') L.scene = ['woods_w', 4, 5, 'up'];
  }
  for (const k in SCENES) { const s = SCENES[k]; let ex; try { ex = Object.getOwnPropertyDescriptor(s, 'exits'); } catch (e) { continue; }
    if (!ex || !Array.isArray(ex.value) || isWoods(k)) continue;
    for (const e of ex.value) if (e.to === 'woods') { e.tx = 19; e.ty = 38; e.dir = 'up'; } }
  // Sister Verity's convoy waits on the wagon road
  if (typeof World !== 'undefined') {
    const _add = World.addNpc && World.addNpc.bind(World);
    if (_add) World.addNpc = function (o) { if (o && ZONE[o.id]) { if (G.S.map !== ZONE[o.id][0]) return; o.x = ZONE[o.id][1]; o.y = ZONE[o.id][2]; } return _add(o); };
  }
})();
