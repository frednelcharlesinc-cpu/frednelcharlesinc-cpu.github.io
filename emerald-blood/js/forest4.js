/* ================= THE CROSSROADS & THE FOUR WOODS =================
   The East Woods are built from tiles now (assets/map_fc_*.webp + props5 atlas), not flat paintings:
   trees, ruins and camps are real props, so Ren walks BEHIND them. Layout data: js/fc_data.js (FCL).
     woods   — THE CROSSROADS (from Ashford). A road to each forest.
     woods_n — MISTVEIL PINES     · the ancient tree, the Green Eclipse camp, Hollow Fang Den
     woods_e — EMBERROOT WILDS    · the wagon road, Rook's bandit camp, Cinder Hollow
     woods_s — GLIMMERFEN         · the boardwalk swamp, the guild founder, the Sunken Shrine
     woods_w — THE OLD GROVE      · the river, the stag meadow, the Drag mural, the Drag Vault & the Goblin Warren
   Every forest: a waterfall with something hidden behind it, a camp, a monument that knows more than it says,
   chests off the beaten path, a shortcut to open, and a mini map that fills in as you explore.
   The old 'woods' key is the Crossroads, so every road and story beat that sends you "to the woods" still works. */
(function () {
  const H = SCENES.woods;
  const isWoods = m => /^woods(_[news])?$/.test(m || '');
  window.isWoods = isWoods;
  const MK = { woods: 'fc_cross', woods_n: 'fc_north', woods_e: 'fc_east', woods_s: 'fc_south', woods_w: 'fc_west' };
  const D = k => FCL[MK[k] || k];
  const F_ = () => G.S.f;

  const SIGN = {
    sign_cross: 'THE CROSSROADS.  North — Mistveil Pines.  East — Emberroot Wilds and the wagon road.  South — Glimmerfen.  West — The Old Grove.  South-west — Ashford Hollow.',
    sign_north: 'MISTVEIL PINES.  Hollow Fang Den lies north-west, under the cliffs. Mind the ice by the falls.',
    sign_east: 'EMBERROOT WILDS.  Wagon road east to the Gate site. Cinder Hollow is NOT a shortcut. (Someone has scratched underneath: "ask Rook how he knows.")',
    sign_south: 'GLIMMERFEN.  Keep to the boardwalks. Whatever glows, do not eat it.',
    sign_west: 'THE OLD GROVE.  The Goblin Warren — south, past the river bend. Something older sleeps in the north cliffs.'
  };
  async function mural() {
    const f = F_();
    await narr('A wall of carved stone, half eaten by moss. Three panels, joined by arrows.');
    await narr('One: a warrior with a sword. Two: the same warrior — horned now, clawed, half a beast. Three: a dragon, wings spread over a burning sky.');
    await narr('The warrior\'s eyes are painted green. The paint is fresh. Someone still comes here to tend this wall.');
    if (!f.fcMural) { f.fcMural = 1; await narr('Your own eyes sting. For a moment, your shadow on the stone looks too big for you.'); save(); }
  }
  const lookFn = t => { const fn = t === 'shrine' ? () => shrine() : t === 'crate' ? () => crate() : t === 'mural' ? mural : () => narr(SIGN[t] || t); fn.toString = () => t; return fn; };   // toString = the text, so other files can find a tile by what it says

  /* ---- who stands where (story NPCs keep their ids; only their spots changed) ---- */
  const ZONE = {};
  for (const k of ['woods', 'woods_n', 'woods_e', 'woods_s', 'woods_w']) for (const [id, p] of Object.entries(D(k).npc)) ZONE[id] = [k, p[0], p[1], p[2]];
  const STORY_IDS = ['tam', 'rook', 'bandit', 'convoy', 'wherald', 'dace', 'sefa', 'wren', 'corran', 'scout', 'alpha', 'liora'];
  const baseNpcs = H.npcs;
  const npcsFor = key => function () {
    return baseNpcs.call(H).filter(n => (ZONE[n.id] ? ZONE[n.id][0] : 'woods') === key).map(n => {
      const z = ZONE[n.id]; if (z) { n.x = z[1]; n.y = z[2]; if (!n.ai) n.dir = z[3]; } return n;
    }).concat(EXTRA[key] ? EXTRA[key]() : []);
  };
  /* camp keepers — new faces who drop hints */
  const hint = (name, sprite, lines) => async () => { CHAR._fc = { name, sprite }; const f = F_(), k = 'fcHint_' + sprite; const i = (f[k] || 0) % lines.length; f[k] = (f[k] || 0) + 1; await say('_fc', null, lines[i]); };
  const EXTRA = {
    woods_s: () => { const p = ZONE.hermit; return [{ id: 'fc_hermit', sprite: 'folk2', name: 'Old Wick, the fen-hermit', x: p[1], y: p[2], dir: p[3], talk: hint('Old Wick', 'folk2', [
      'Sit, sit. The fire\'s warm and the spring\'s clean. Drink — it mends what the fen bites.',
      'Waterfalls in these woods never just fall, boy. They hide. Walk the ledge behind the one by the west cliff.',
      'That statue of Holle by the boardwalk? Read the second line. The one they tried to scrub off.',
      'The Shrine under the cliff drowned when the Accord was signed. Coincidence, the guilds say. Hm.']) }]; },
    woods_w: () => { const p = ZONE.ranger; return [{ id: 'fc_ranger', sprite: 'elf_f1', name: 'Ysolde, grove-warden', x: p[1], y: p[2], dir: p[3], talk: hint('Ysolde', 'elf_f1', [
      'You walk like a Drag. Quiet heels. Don\'t worry — the Grove doesn\'t tell tales.',
      'There\'s a carving on the plateau above the falls. Three pictures. Most people only see two.',
      'The Vault in the north cliff was sealed from the inside. Think about that.',
      'A log fell across the old path by the warren. If you\'re strong enough to shift it, there\'s a cache behind.']) }]; }
  };

  /* ---- scene tiles: monuments, signs, springs and shortcut logs ---- */
  function tilesFor(key) {
    const L = D(key), T = {};
    for (const l of L.look) { const fn = lookFn(l.text); for (const [x, y] of l.t) T[x + ',' + y] = T[x + ',' + y] || fn; }
    for (const sp of L.springs) for (const [x, y] of sp) T[x + ',' + y] = () => spring();
    for (const lg of L.logs) for (let i = 0; i < lg.w; i++) T[(lg.x + i) + ',' + lg.y] = () => pushLog(lg);
    return T;
  }
  async function pushLog(lg) {
    const f = F_(); if (f['fcLog_' + lg.id]) return;
    await narr('A fallen trunk blocks the way. You set your shoulder against it… and it rolls aside with a crash. A shortcut!');
    f['fcLog_' + lg.id] = 1; sfx('blip');
    World.extraProps = World.extraProps.filter(p => p.fcLog !== lg.id);
    for (let i = 0; i < lg.w; i++) if (World.col[lg.y]) World.col[lg.y][lg.x + i] = 0;
    World.buildPropList(); save();
  }
  const setup = key => function (W) {
    const L = D(key), f = F_();
    for (const [x, y] of L.fires) W.addFire(x, y);
    for (const lg of L.logs) if (!f['fcLog_' + lg.id]) {
      W.extraProps.push({ k: lg.k, x: lg.x, y: lg.y, ox: (lg.w - 1) * 16, fcLog: lg.id });
      for (let i = 0; i < lg.w; i++) if (W.col[lg.y]) W.col[lg.y][lg.x + i] = 1;
    }
  };
  const exitsOf = key => D(key).exits.map(e => Object.assign({}, e));

  /* ---- THE CROSSROADS ---- */
  Object.assign(H, { title: 'The Crossroads', subtitle: 'Where the four woods meet', map: 'fc_cross', npcs: npcsFor('woods'), exits: exitsOf('woods'), setup: setup('woods') });
  Object.defineProperty(H, 'tiles', { configurable: true, get() { return this._t || (this._t = tilesFor('woods')); } });

  const forest = (key, title, sub, more) => {
    const s = SCENES[key] = Object.assign({ title, subtitle: sub, music: 'woods', bd: 'forest', encounters: H.encounters, npcs: npcsFor(key), exits: exitsOf(key), map: MK[key], setup: setup(key) }, more || {});
    Object.defineProperty(s, 'tiles', { configurable: true, get() { return this._t || (this._t = tilesFor(key)); } });
    return s;
  };
  forest('woods_n', 'The North Woods', 'Mistveil Pines', { weather: 'snow', bd: 'snow' });
  forest('woods_e', 'The East Woods', 'Emberroot Wilds', { async onEnter() { if (G.S.q && G.S.q.toll === 'active') await tollMen(); } });
  forest('woods_s', 'The South Woods', 'Glimmerfen', { bd: 'mire' });
  forest('woods_w', 'The West Woods', 'The Old Grove');

  /* ---- dungeons: one under every forest ---- */
  if (typeof ENEMY !== 'undefined') Object.assign(ENEMY, {
    b_fang: { name: 'Hollowfang, the Den Mother', img: 'lupine_alpha', boss: 1, size: 1.5, hp: 230, atk: 15, def: 4, spd: 15, dodge: .25, parry: .05, brk: 100, xp: 110, gold: 110,
      howl: 1, howlName: 'BLOOD HOWL', howlKey: 'lupine', howlText: 'LEAPS IN', trait: 'Howls for her pack when wounded',
      skills: [{ name: 'Rending Claw', hits: [MH('slash', 1.1, 520), MH('halfslash', .9, 320)] }, { name: 'Frost Fang', w: .35, hits: [MH('thrust', 1.6, 700)] }, { name: 'Den Pounce', w: .25, hits: [MH('jump', 2, 900, 1)] }] },
    b_cinder: { name: 'Smoulder, the Cinder Wyrmling', img: 'm_drake', boss: 1, size: 1.35, hp: 300, atk: 17, def: 6, spd: 12, dodge: .1, parry: .05, brk: 120, xp: 150, gold: 150, trait: 'fire — its breath scorches the whole party',
      skills: [{ name: 'Tail Lash', hits: [MH('slash', 1.1, 560)] }, { name: 'Ember Breath', w: .35, hits: [MH('spellcast', 1.5, 900)] }, { name: 'Ash Storm', w: .25, hits: [MH('spellcast', .6, 420), MH('spellcast', .6, 260), MH('spellcast', .9, 380)] }] },
    b_shrine: { name: 'Ssarak, the Drowned Priest', img: 'm_lizard', boss: 1, size: 1.5, hp: 360, atk: 18, def: 6, spd: 13, dodge: .2, parry: .2, brk: 130, xp: 190, gold: 180, regen: .04, trait: 'water — the shrine\'s tide heals it every turn',
      skills: [{ name: 'Trident', hits: [MH('thrust', 1.1, 480)] }, { name: 'Undertow', w: .4, hits: [MH('thrust', .7, 420), MH('thrust', .7, 240), MH('thrust', 1, 300)] }, { name: 'Drowning Psalm', w: .2, hits: [MH('spellcast', 1.9, 1000, 1)] }] },
    b_vault: { name: 'The Vault Warden', img: 'm_skeleton', boss: 1, size: 1.6, hp: 420, atk: 19, def: 8, spd: 11, dodge: .05, parry: .35, brk: 150, xp: 230, gold: 220, trait: 'A Drag guardian of bone — parries everything, break its guard',
      skills: [{ name: 'Green Guard Cut', hits: [MH('slash', 1.1, 560)] }, { name: 'Oath of Bone', w: .35, hits: [MH('slash', .7, 420), MH('halfslash', .8, 300), MH('backslash', 1, 380)] }, { name: 'Last Verdict', w: .2, hits: [MH('thrust', 2.1, 1000, 1)] }] }
  });
  const NEW_D = {
    d_fang: { title: 'Hollow Fang Den', sub: 'Where the lupines drag what they kill', rank: 'E', boss: 'b_fang', bd: 'snow', light: '170,210,255', glow: '#9fd8ff', tint: 'rgba(4,8,16,.5)', map: 'woods_n',
      enc: () => pickEnc([['lupine'], ['lupine', 'lupine'], ['lupine', 'lupine', 'lupine'], ['lupine_alpha'], ['lupine', 'm_ratfolk']]),
      intro: ['Bones carpet the deepest cave. On a heap of them lies a grey she-wolf the size of a cart, one eye milky, one eye on you.', ['Hollowfang', '*A growl that you feel in your teeth. The pack goes silent. She stands.*']] },
    d_cinder: { title: 'Cinder Hollow', sub: 'A cave that is warm in winter — and getting warmer', rank: 'D', boss: 'b_cinder', bd: 'warren', light: '255,150,70', glow: '#ff7a2a', tint: 'rgba(14,6,2,.5)', map: 'woods_e',
      enc: () => pickEnc([['m_goblin_shaman'], ['m_tusker'], ['m_goblin', 'm_goblin_shaman'], ['bandit', 'bandit'], ['m_gourd', 'm_goblin_shaman']]),
      intro: ['Heat rolls out of the lair. Curled on a bed of glowing coals is a young drake — and around it, scratched in the rock, hundreds of claw marks in the shape of a great dragon\'s wing.', ['Smoulder', '*It opens one ember eye and breathes out a long, slow plume of fire. A warning. Then a second plume. Not a warning.*']] },
    d_shrine: { title: 'The Sunken Shrine', sub: 'It drowned the night the Guild Accord was signed', rank: 'C', boss: 'b_shrine', bd: 'mire', light: '110,255,220', glow: '#5af0d0', tint: 'rgba(2,12,10,.52)', map: 'woods_s',
      enc: () => pickEnc([['m_lizard'], ['m_lizard', 'm_lizard'], ['m_troll'], ['m_ghoul', 'm_lizard'], ['m_skeleton', 'm_skeleton']]),
      intro: ['Waist-deep black water fills the altar room. A lizardman in rotted priest\'s robes rises out of it, a guild seal hanging from its neck on a chain.', ['Ssarak', 'Sssealed… they sealed usss in with the tide… and you come wearing THEIR ssseal on your papers…']] },
    d_vault: { title: 'The Drag Vault', sub: 'Sealed from the inside', rank: 'C', boss: 'b_vault', bd: 'crypt', light: '110,255,150', glow: '#46ff95', tint: 'rgba(2,10,4,.54)', map: 'woods_w',
      enc: () => pickEnc([['m_skeleton'], ['m_skeleton', 'm_skeleton'], ['m_ghoul'], ['m_orc'], ['m_skeleton', 'm_ghoul']]),
      intro: ['In the last chamber a skeleton in green-lacquered armour stands guard before a sealed door. Two green sparks flare in its empty sockets — the same colour as yours.', ['The Vault Warden', '…Eyes of the blood. Then you know the oath. No? …Then you are not ready for what lies behind me. Prove it.']] }
  };
  if (typeof DUNGEONS !== 'undefined') {
    for (const [id, d] of Object.entries(NEW_D)) {
      const cv = D(d.map).caves[id];
      DUNGEONS[id] = Object.assign({ id, from: { map: d.map, at: cv.at, back: cv.back } }, d);
      SCENES[id] = { title: d.title, subtitle: d.sub, bd: d.bd, music: 'woods', dungeon: 1, encRate: .085, setup(W) { W.tint = d.tint; },
        encounters() { return { enemies: d.enc(), bd: d.bd }; }, npcs() { return []; }, get exits() { return []; } };
    }
    if (DUNGEONS.d_warren) { const cv = D('woods_w').caves.d_warren; DUNGEONS.d_warren.from = Object.assign({}, DUNGEONS.d_warren.from, { map: 'woods_w', at: cv.at, back: cv.back }); }
    const _boss = dungeonBoss;
    dungeonBoss = async function (id) {   // eslint-disable-line no-global-assign
      const d = NEW_D[id]; if (!d) return _boss(id);
      const B = ENEMY[d.boss];
      await narr(d.intro[0]); CHAR._boss = { name: d.intro[1][0], sprite: B.img }; await say('_boss', null, d.intro[1][1]);
      const r = await Battle.start({ enemies: [d.boss], boss: true, noFlee: true, bd: d.bd, intro: B.name.toUpperCase() });
      if (r === 'lose') { await Story.defeat(); return; }
      if (r !== 'win') return;
      G.S.f['clear_' + id] = 1; World.ents = World.ents.filter(e => e.id !== 'boss');
      await narr('Silence settles over the deep. Somewhere, a ward breaks with a sound like a bell. The great chest is unsealed.');
      Quests.event('dungeon', id); save();
    };
    // our caves are painted into the cliffs — hide the little stand-in cave sprite
    const BLANK = document.createElement('canvas'); BLANK.width = 64 * 9; BLANK.height = 64 * 12;
    const _spawn = spawnExtras;
    spawnExtras = async function (W, name) {   // eslint-disable-line no-global-assign
      await _spawn(W, name);
      if (isWoods(name)) for (const e of W.ents) if (/^cave_/.test(e.id)) e.img = BLANK;
      // dungeons painted from the user's sheets get their own wall torches
      const tk = { d_cinder: 'fc_dcinder_torch', d_fang: 'fc_dfang_torch' }[name];
      if (tk && G.props[tk]) for (const p of W.extraProps) if (p.k === 'fire0' && p.anim === 'fire') { p.k = tk; delete p.anim; }
    };
  }

  /* ---- everything that pointed at the old woods ---- */
  const at = id => [ZONE[id][1], ZONE[id][2]];
  if (typeof GATHER_SPOTS !== 'undefined') for (const k of Object.keys(MK)) GATHER_SPOTS[MK[k]] = D(k).gather;
  if (typeof MOUNTS !== 'undefined') { const C = MOUNTS; if (C.mare) C.mare.where = ['woods', ...at('mare')]; if (C.lupine) C.lupine.where = ['woods_n', ...at('lupine')]; if (C.stag) C.stag.where = ['woods_w', ...at('stag')]; }
  if (typeof QNPC !== 'undefined') { if (QNPC.fenwick) Object.assign(QNPC.fenwick, { map: 'woods', at: at('fenwick') }); if (QNPC.merchant) Object.assign(QNPC.merchant, { map: 'woods_e', at: at('merchant') }); }
  if (typeof QDEF !== 'undefined') {
    if (QDEF.q_caravan && QDEF.q_caravan.goal) Object.assign(QDEF.q_caravan.goal, { map: 'woods_e', at: at('merchant') });
    if (QDEF.q_redeye && QDEF.q_redeye.goal) { Object.assign(QDEF.q_redeye.goal, { map: 'woods_n', at: at('redeye') }); QDEF.q_redeye.desc = QDEF.q_redeye.desc.replace('south clearing of the East Woods', 'Mistveil Pines, in the tall grass west of the road'); }
  }
  const ashEnd = D('woods').exits.find(e => e.to === 'ashford');
  const arrive = [ashEnd.x + 1, ashEnd.y - 1];
  if (typeof MAPLOC !== 'undefined') for (const L of MAPLOC) {
    if (L.id === 'woods') L.scene = ['woods', arrive[0], arrive[1], 'up'];
    if (L.id === 'dg_warren') { const cv = D('woods_w').caves.d_warren; L.scene = ['woods_w', cv.back[0], cv.back[1], 'down']; }
  }
  if (typeof MapFog !== 'undefined' && !MapFog.ROADS.some(r => r[1] === 'woods_s')) MapFog.ROADS.push(['woods', 'woods_s']);
  for (const k in SCENES) { const s = SCENES[k]; let ex; try { ex = Object.getOwnPropertyDescriptor(s, 'exits'); } catch (e) { continue; }
    if (!ex || !Array.isArray(ex.value) || isWoods(k)) continue;
    for (const e of ex.value) if (e.to === 'woods') { e.tx = arrive[0]; e.ty = arrive[1]; e.dir = 'up'; } }
  if (typeof World !== 'undefined') {
    // Sister Verity's convoy waits on the wagon road; Tam at the crossroads stone
    const _add = World.addNpc && World.addNpc.bind(World);
    if (_add) World.addNpc = function (o) { if (o && ZONE[o.id] && STORY_IDS.includes(o.id)) { if (G.S.map !== ZONE[o.id][0]) return; o.x = ZONE[o.id][1]; o.y = ZONE[o.id][2]; } return _add(o); };
    // anyone sent to an old painted-map spot lands on the nearest open tile of the new maps
    const _load = World.load.bind(World);
    World.load = function (name, x, y, dir) {
      const M = G.maps[(SCENES[name] || {}).map || name];
      if (M && M.fc && M.col[y] && M.col[y][x] !== '0') {
        const seen = new Set([x + ',' + y]), q = [[x, y]];
        while (q.length) { const [a, b] = q.shift(); if (M.col[b] && M.col[b][a] === '0') { x = a; y = b; break; }
          for (const [dx, dy] of [[1, 0], [-1, 0], [0, 1], [0, -1]]) { const k = (a + dx) + ',' + (b + dy); if (!seen.has(k) && a + dx >= 0 && b + dy >= 0 && a + dx < M.w && b + dy < M.h) { seen.add(k); q.push([a + dx, b + dy]); } } }
      }
      return _load(name, x, y, dir);
    };
  }
})();

/* ================= THE MINI MAP =================
   On the Crossroads, the four woods and their dungeons: a corner map that starts dark and fills in as Ren walks.
   Chests you've spotted show as gold dots, caves glow, campfires burn orange, exits are green. Tap it to make it bigger. */
const MiniMap = {
  big: false, cache: null, ckey: '', R: 7,
  C: { g: '#3e5a2c', t: '#2f4a22', T: '#1e3318', p: '#c9ad7a', w: '#3f7fc4', c: '#6b625a', s: '#a89a86', b: '#9a6e40', f: '#5c5a54', x: '#141414' },
  on() { const M = World.map; return M && M.mm && G.mode === 'world' && !World.loading; },
  fog() { const S = G.S, k = World.scene.map || G.S.map; S.fcfog = S.fcfog || {}; const M = World.map; let f = S.fcfog[k]; if (!f || f.length !== M.w * M.h) f = S.fcfog[k] = '0'.repeat(M.w * M.h); return [k, f]; },
  reveal() {
    if (!this.on()) return; const M = World.map, p = World.player; if (!p) return; let [k, f] = this.fog(); const a = f.split(''); let ch = 0;
    for (let y = p.y - this.R; y <= p.y + this.R; y++) for (let x = p.x - this.R; x <= p.x + this.R; x++) {
      if (x < 0 || y < 0 || x >= M.w || y >= M.h || (x - p.x) ** 2 + (y - p.y) ** 2 > this.R * this.R) continue;
      const i = y * M.w + x; if (a[i] !== '1') { a[i] = '1'; ch = 1; }
    }
    if (ch) { G.S.fcfog[k] = a.join(''); this.ckey = ''; }
  },
  draw(c) {
    if (!this.on()) return;
    const M = World.map, [k, f] = this.fog(), s = this.big ? 3 : 1, w = Math.round(M.w * s), h = Math.round(M.h * s);
    if (this.ckey !== k + s) {
      const cv = this.cache || (this.cache = document.createElement('canvas')); cv.width = w; cv.height = h; const x = cv.getContext('2d');
      x.clearRect(0, 0, w, h); x.fillStyle = 'rgba(6,10,8,.55)'; x.fillRect(0, 0, w, h);
      for (let yy = 0; yy < M.h; yy++) { const row = M.mm[yy]; for (let xx = 0; xx < M.w; xx++) if (f[yy * M.w + xx] === '1') { x.fillStyle = this.C[row[xx]] || '#333'; x.fillRect(xx * s, yy * s, s, s); } }
      this.ckey = k + s;
    }
    const vw = G.view.w, pad = 10, X = Math.round(vw - w - pad), Y = this.big ? Math.round(G.view.h * .5 - h / 2) : 40;
    this.box = [X, Y, w, h];
    c.save(); c.globalAlpha = this.big ? .95 : .8; c.drawImage(this.cache, X, Y); c.globalAlpha = 1;
    c.strokeStyle = 'rgba(70,255,149,.35)'; c.lineWidth = 1.5; c.strokeRect(X - .5, Y - .5, w + 1, h + 1);
    const seen = (tx, ty) => f[ty * M.w + tx] === '1';
    const dot = (tx, ty, col, r) => { c.fillStyle = col; c.beginPath(); c.arc(X + tx * s + s / 2, Y + ty * s + s / 2, r, 0, 7); c.fill(); };
    for (const e of World.ents) {
      if (/^chest_/.test(e.id) && seen(e.x, e.y) && !(G.S.chests || {})[e.id.slice(6)]) dot(e.x, e.y, '#ffd34a', s * .7 + .8);
      if (/^cave_|^stairs$/.test(e.id) && seen(e.x, e.y)) dot(e.x, e.y, '#c58aff', s + 1);
      if (/^(boss|lt_\d|dxsb_\d)$/.test(e.id) && seen(e.x, e.y)) dot(e.x, e.y, '#ff4a4a', s + 1);
    }
    for (const L of World.lights) { const tx = Math.floor(L.x / TILE), ty = Math.floor(L.y / TILE); if (!L.follow && seen(tx, ty) && World.map.dungeon === undefined) dot(tx, ty, '#ff9a3a', s * .8 + 1); }
    for (const e of (World.scene.exits || [])) if (seen(e.x, e.y)) { c.fillStyle = e.msg ? '#8a8a8a' : '#46ff95'; c.fillRect(X + e.x * s - 1, Y + e.y * s - 1, ((e.x2 || e.x) - e.x + 1) * s + 2, ((e.y2 || e.y) - e.y + 1) * s + 2); }
    const p = World.player, bl = .6 + .4 * Math.sin(performance.now() / 180);
    c.fillStyle = `rgba(70,255,149,${bl})`; c.beginPath(); c.arc(X + p.px / TILE * s, Y + (p.py - 8) / TILE * s, s + 1, 0, 7); c.fill();
    c.fillStyle = '#fff'; c.font = '700 7px Nunito, sans-serif'; c.textAlign = 'right'; c.fillText(this.big ? 'tap to shrink' : 'MAP', X + w - 2, Y - 3);
    c.restore();
  }
};
(function () {
  const _render = World.render.bind(World);
  World.render = function (c, t) { _render(c, t); try { MiniMap.draw(c); } catch (e) { } };
  const _step = World.onStep.bind(World);
  World.onStep = function (e) { const r = _step(e); if (e && e.isPlayer) MiniMap.reveal(); return r; };
  const _load = World.load.bind(World);
  World.load = async function (...a) { const r = await _load(...a); MiniMap.ckey = ''; MiniMap.reveal(); return r; };
  // tap the mini map to enlarge / shrink it (captured before the world sees the tap)
  addEventListener('pointerdown', ev => {
    const b = MiniMap.box; if (!b || !MiniMap.on()) return;
    const cv = document.getElementById('game'); if (!cv) return; const r = cv.getBoundingClientRect(), sx = G.view.w / r.width, sy = G.view.h / r.height;
    const x = (ev.clientX - r.left) * sx, y = (ev.clientY - r.top) * sy;
    if (x >= b[0] - 6 && x <= b[0] + b[2] + 6 && y >= b[1] - 14 && y <= b[1] + b[3] + 6) { MiniMap.big = !MiniMap.big; MiniMap.ckey = ''; ev.stopPropagation(); ev.preventDefault(); }
  }, true);
})();
