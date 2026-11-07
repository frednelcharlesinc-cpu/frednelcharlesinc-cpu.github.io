/* ================= HIGHMARK'S WILDS — the new Gloamwood, the Frostpine Hollow, the Emberleaf Vale =================
   Three painted forests around Highmark. Tall grass is walkable (and full of beasts); low ledges can be hopped down, never climbed.
   Gloamwood is the hub: its two caves lead north to the Frostpine Hollow and east to the Emberleaf Vale. */
(function () {
  const ell = (cx, cy, rx, ry, fn, T) => { for (let y = Math.floor(cy - ry); y <= cy + ry; y++) for (let x = Math.floor(cx - rx); x <= cx + rx; x++) if (((x + .5 - cx) / rx) ** 2 + ((y + .5 - cy) / ry) ** 2 <= 1) T[x + ',' + y] = fn; };

  /* ---- Gloamwood (the hub) ---- */
  const GL = SCENES.gloam;
  const GPOS = { g_brask: [32, 18, 'down'], g_hound1: [31, 17, 'right'], g_briar: [7, 31, 'right'], g_cutter: [20, 47, 'up'], g_alpha: [35, 40, 'down'] };
  const _gn = GL.npcs;
  GL.npcs = function () { return _gn.call(this).map(n => GPOS[n.id] ? Object.assign(n, { x: GPOS[n.id][0], y: GPOS[n.id][1], dir: GPOS[n.id][2] }) : n); };
  GL.exits = [
    { x: 21, x2: 26, y: 58, to: 'hm_city', tx: 2, ty: 23, dir: 'right', label: 'Highmark' },
    { x: 5, x2: 7, y: 2, y2: 3, to: 'frost', tx: 22, ty: 56, dir: 'up', label: 'Frostpine Hollow' },
    { x: 15, x2: 16, y: 2, y2: 3, to: 'amber', tx: 16, ty: 1, dir: 'down', label: 'Emberleaf Vale' }
  ];
  GL.tiles = {};
  ell(18.2, 41.6, 3.2, 2.6, () => narr('The Humming Shrine: a moss-eaten altar under a carved stone face. Something under it buzzes, like a trapped bee.'), GL.tiles);
  ell(20.6, 28.6, 2.4, 1.8, () => spring(), GL.tiles);

  /* ---- the Frostpine Hollow (north, through the left cave) ---- */
  SCENES.frost = {
    map: 'frost', title: 'Frostpine Hollow', subtitle: 'Where the snow never melts', music: 'woods', bd: 'forest', encRate: .1,
    encounters() { const L = [['lupine', 'lupine'], ['m_goblin', 'm_goblin_shaman'], ['hound_toll', 'lupine'], ['m_tusker']]; if (Power.now().i >= 2) L.push(['m_orc'], ['m_tusker', 'lupine']); return { enemies: L[Math.floor(Math.random() * L.length)], bd: 'forest' }; },
    exits: [
      { x: 21, x2: 24, y: 58, to: 'gloam', tx: 6, ty: 4, dir: 'down', label: 'Gloamwood' },
      { x: 5, x2: 7, y: 2, msg: 'An old ice-cave, sealed by a wall of blue ice as thick as a house. Something on the other side is breathing slowly.' }
    ],
    tiles: {},
    npcs: () => [{ id: 'fr_hermit', sprite: 'folk11', x: 30, y: 51, dir: 'down', name: 'Old Brannoc', talk: async () => {
      const f = G.S.f;
      if (!f.brannoc) { f.brannoc = 1;
        await say('fr_hermit', null, 'A visitor! In the Hollow! Sit, sit — the kettle\'s always on. Name\'s Brannoc. I watch the stones.');
        await say('fr_hermit', null, 'Seven of them in a ring, and they hum when the Gate in Highmark gets restless. They\'ve been humming all month.');
        await say('fr_hermit', null, 'Your eyes… hm. Green. Don\'t worry. Up here, nobody checks. Rest at my fire whenever you like.');
      } else await say('fr_hermit', null, ['The stones hummed again last night. Louder.', 'Ice-cave\'s sealed. Has been since my grandmother\'s day. Don\'t knock.', 'Warm yourself. The cold up here bites through Guild leather.'][Math.floor(Math.random() * 3)]);
      Story.heal(true); toast('Brannoc\'s fire: fully rested.', 2200);
    } }]
  };
  const FR = SCENES.frost.tiles;
  for (const [x, y] of [[16, 38], [18, 37], [20, 37], [22, 38], [16, 44], [18, 45], [22, 44]]) for (const dy of [0, 1]) FR[x + ',' + (y + dy)] = () => narr('A standing stone, rimed with frost. The carvings on it are Drag runes — the same ones on Nana\'s old cooking pot. They hum when you touch them.');

  /* ---- the Emberleaf Vale (east, through the right cave) ---- */
  SCENES.amber = {
    map: 'amber', title: 'Emberleaf Vale', subtitle: 'The Crown\'s hunting grounds', music: 'woods', bd: 'forest', encRate: .1,
    encounters() { const L = [['lupine', 'lupine'], ['m_tusker'], ['briar_rider'], ['m_goblin', 'm_goblin', 'm_goblin_shaman']]; if (Power.now().i >= 2) L.push(['m_orc', 'm_goblin'], ['knife_cutter']); return { enemies: L[Math.floor(Math.random() * L.length)], bd: 'forest' }; },
    exits: [
      { x: 15, x2: 17, y: 0, to: 'gloam', tx: 15, ty: 5, dir: 'down', label: 'Gloamwood' },
      { x: 30, x2: 32, y: 42, msg: 'The south road leads to the Crown\'s hunting lodge. Two Imperial guards wave you back. "Royal grounds. Move along."' },
      { x: 52, x2: 53, y: 5, msg: 'A bone-strewn cave. Something big sleeps inside — you can hear it. Not today.' }
    ],
    tiles: {},
    npcs: () => [{ id: 'am_scout', sprite: 'guard', x: 9, y: 23, dir: 'down', name: 'Imperial Scout', talk: async () => {
      await say('am_scout', null, ['The Crown\'s eagle flies over this camp. Prince-Regent\'s hunting party comes through every autumn.', 'Stay off the royal road, guildling. And keep that hood up near the tents.', 'Something big lives in the cave up north-east. The Prince wants its head for his wall.'][Math.floor(Math.random() * 3)]);
    } }]
  };
  const AM = SCENES.amber.tiles;
  for (const k of ['51,21', '52,21', '53,21', '54,21']) AM[k] = () => narr('An old Drag shrine, older than the Crown. Someone has carved the Imperial eagle over the dragon on its face — badly.');
  for (const [x, y] of [[8, 35], [9, 35], [10, 35], [8, 37], [10, 37]]) AM[x + ',' + y] = () => narr('An abandoned supply wagon, fenced in with thorns. The Crown seal on its side has been scratched off.');

  /* map-list and travel hooks */
  if (typeof GATHER_SPOTS !== 'undefined') Object.assign(GATHER_SPOTS, { gloam: [[8, 10], [30, 5], [10, 40]], frost: [[10, 31], [33, 25], [36, 52]], amber: [[17, 8], [33, 33], [45, 34]] });
  for (const k in SCENES) { const s = SCENES[k]; let ex; try { ex = Object.getOwnPropertyDescriptor(s, 'exits'); } catch (e) { continue; }
    if (!ex || !Array.isArray(ex.value) || k === 'gloam' || k === 'frost' || k === 'amber') continue;
    for (const e of ex.value) if (e.to === 'gloam') { e.tx = 23; e.ty = 56; e.dir = 'up'; } }

  /* ---- ledges: hop down, never climb up ---- */
  const _free = World.free.bind(World);
  World.free = function (x, y, except) {
    const M = this.map, L = M && M.ledge; const p = this.player;
    if (L && except === p && p && p.dir === 'down' && L.some(([lx, ly]) => lx === x && ly === y) && this.inMap(x, y + 1) && !this.col[y + 1][x]) return true;
    return _free(x, y, except);
  };
  const _step = World.onStep.bind(World);
  World.onStep = function (e) {
    const M = this.map, L = M && M.ledge;
    if (L && e === this.player && L.some(([lx, ly]) => lx === e.x && ly === e.y)) { e.startMove(e.x, e.y + 1, 150, 'down'); e.hop = 1; if (typeof sfx === 'function') try { sfx('step'); } catch (err) { } return; }
    e.hop = 0;
    return _step(e);
  };
})();
