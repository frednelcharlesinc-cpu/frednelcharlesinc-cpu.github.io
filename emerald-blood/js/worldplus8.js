'use strict';
/* ================= WORLD+ 8 (Chat B — World & Maps) — a living, layered wild =================
   EXPLORATION   fake trees → secret glades · lookout rocks (reveal the map) · stepping stones that rise at night,
                 rivers that freeze in winter, riverbeds that dry out in summer · wandering events (burning cart,
                 wounded traveller, lost child)
   LIVING WORLD  birds burst out of bushes · eyes in the dark that follow you · goblin–bandit skirmishes ·
                 the Drag waystones (a second fast-travel network) · weather shrines · the woods remember you
                 (clear enough monsters and traders, then settlers, move in) · the monthly Gate Surge
   PHOTO MODE    the 📷 button: hide the HUD, pick a filter.
   (All lines are B drafts — Chat A may rewrite.) */
(function () {
  const W4 = () => window.WorldPlus4;
  const MK = { woods: 'fc_cross', woods_n: 'fc_north', woods_e: 'fc_east', woods_s: 'fc_south', woods_w: 'fc_west', woods_n2: 'fc_north2', woods_e2: 'fc_east2', woods_s2: 'fc_south2', woods_w2: 'fc_west2' };
  const ZONES = ['woods_n', 'woods_e', 'woods_s', 'woods_w', 'woods_n2', 'woods_e2', 'woods_s2', 'woods_w2'].filter(z => FCL[MK[z]]);
  const BIO = z => z[6];   // n e s w
  const S_ = () => G.S, F = () => G.S.f;
  const day = () => (typeof Cal !== 'undefined' ? Cal.day() : 1), week = () => Math.floor((day() - 1) / 7);
  const night = () => (typeof Ambient !== 'undefined' && Ambient.night) || 0;
  const season = () => (window.WorldPlus3 && WorldPlus3.season && WorldPlus3.season()) || 'spring';
  const sheet = draw => { const one = document.createElement('canvas'); one.width = one.height = 64; const x = one.getContext('2d'); draw(x); const S = document.createElement('canvas'); S.width = 64 * 9; S.height = 64 * 12; const s = S.getContext('2d'); for (let r = 0; r < 12; r++) for (let f = 0; f < 9; f++) s.drawImage(one, f * 64, r * 64); return S; };
  const R = (x, c, a, b, w, h) => { x.fillStyle = c; x.fillRect(a, b, w, h); };
  const blank = (() => { let S; return () => S || (S = sheet(() => { })); })();
  const rare = () => W4().giveRare();
  const gold$ = n => `<b style="color:#ffd36a">${n}</b>`;
  const pick = L => L[Math.floor(Math.random() * L.length)];
  const cam = () => [Math.round(World.cam.x), Math.round(World.cam.y)];
  const D4 = [[0, 1], [1, 0], [-1, 0], [0, -1]];
  const hash = (s, n) => { let h = 2166136261; for (const c of s) h = Math.imul(h ^ c.charCodeAt(0), 16777619); return (h >>> 0) % Math.max(1, n); };
  const tileNear = (x, y) => { for (const [dx, dy] of D4) { const a = x + dx, b = y + dy; if (World.col[b] && World.col[b][a] === 0 && !World.ents.some(e => e.x === a && e.y === b)) return [a, b]; } return null; };
  const npc = async (id, sprite, x, y, name, talk, dir) => { let img; try { img = await npcImg(sprite); } catch (e) { return null; } const e = new Ent({ id, x, y, dir: dir || 'down', img, name, talk }); World.ents.push(e); if (World.col[y]) World.col[y][x] = 1; return e; };

  /* ---------- per-zone fixed features: fake tree, lookout rock, water crossings ---------- */
  function feats(z) {
    const mk = MK[z], M = G.maps[mk]; if (M.__f8) return M.__f8;
    const re = W4().reach(mk), ent = (FCL[mk].exits.find(e => e.to) || {}), ok = (x, y) => re.has(x + ',' + y);
    const front = (x, y) => { for (const [dx, dy] of D4) if (ok(x + dx, y + dy)) return [x + dx, y + dy]; return null; };
    const far = (x, y) => Math.abs(x - (ent.x || 0)) + Math.abs(y - (ent.y || 0)) > 18 && x > 4 && y > 4 && x < M.w - 5 && y < M.h - 5;
    const trees = M.props.filter(p => /tree[12]$/.test(p.k) && M.col[p.y][p.x] === '1' && front(p.x, p.y) && far(p.x, p.y));
    const rocks = M.props.filter(p => /rock[12]$/.test(p.k) && M.col[p.y][p.x] === '1' && front(p.x, p.y) && far(p.x, p.y));
    const ft = trees[hash(z + 'tree', trees.length)], lr = rocks[hash(z + 'rock', rocks.length)];
    // water runs (1–3 tiles) whose crossing saves a lot of walking
    const used = new Set(); try { const X = window.WorldPlus6 && WorldPlus6.crossings(mk).b; if (X) X.run.forEach(p => used.add(p + '')); } catch (e) { }
    const runs = [];
    const dist = (a, b) => { const seen = new Map([[a + '', 0]]), q = [a]; while (q.length) { const [x0, y0] = q.shift(), d = seen.get(x0 + ',' + y0); if (x0 === b[0] && y0 === b[1]) return d; if (d > 300) break; for (const [dx, dy] of D4) { const x = x0 + dx, y = y0 + dy, k = x + ',' + y; if (!seen.has(k) && M.col[y] && M.col[y][x] === '0') { seen.set(k, d + 1); q.push([x, y]); } } } return 1e9; };
    for (let y = 3; y < M.h - 3; y++) for (let x = 3; x < M.w - 3; x++) for (const [dx, dy] of [[1, 0], [0, 1]]) {
      if (!ok(x, y)) continue; const run = []; let cx = x + dx, cy = y + dy;
      while (run.length < 3 && M.mm[cy] && M.mm[cy][cx] === 'w' && M.col[cy][cx] === '1') { run.push([cx, cy]); cx += dx; cy += dy; }
      if (!run.length || !ok(cx, cy) || run.some(p => used.has(p + ''))) continue;
      const sv = dist([x, y], [cx, cy]) - run.length - 1; if (sv > 18) runs.push({ run, a: [x, y], b: [cx, cy], dx, dy, save: sv });
    }
    runs.sort((a, b) => b.save - a.save);
    const pickRun = skip => runs.find(r => !skip.some(s => s && r.run.some(p => s.run.some(q => Math.abs(q[0] - p[0]) + Math.abs(q[1] - p[1]) < 6))));
    const nightRun = pickRun([]), iceRun = pickRun([nightRun]);
    // a water tile right beside the bank, for summer's dry riverbed
    let dry = null; for (let y = 4; y < M.h - 4 && !dry; y++) for (let x = 4; x < M.w - 4 && !dry; x++) if (M.mm[y][x] === 'w' && front(x, y) && far(x, y) && hash(z + x + ',' + y, 9) === 0) dry = [x, y];
    return (M.__f8 = { tree: ft && [ft.x, ft.y], treeFront: ft && front(ft.x, ft.y), rock: lr && [lr.x, lr.y], night: nightRun, ice: iceRun, dry });
  }
  const crossOpen = (z, k) => k === 'night' ? night() > .5 : season() === 'winter' || z.startsWith('woods_n');
  // glade scenes (one per zone, sharing a map per biome)
  function makeGlade(z) {
    const id = 'glade_' + z; if (SCENES[id]) return; const gm = 'fc_glade_' + BIO(z), g = FCL[gm] && FCL[gm].glade, f = feats(z); if (!g || !f.treeFront) return;
    SCENES[id] = { title: 'A Hidden Glade', subtitle: SCENES[z].subtitle, map: gm, music: 'woods', bd: SCENES[z].bd, setup(W) { W.lights.push({ x: g.stash[0] * TILE + 16, y: g.stash[1] * TILE, r: 90, c: '255,240,190' }); },
      npcs() { return []; }, exits: [{ x: g.exit[0], y: g.exit[1], to: z, tx: f.treeFront[0], ty: f.treeFront[1], dir: 'down' }] };
  }
  async function enterGlade(z) {
    makeGlade(z); const g = FCL['fc_glade_' + BIO(z)].glade;
    if (!F()['gladeF_' + z]) { F()['gladeF_' + z] = 1; await narr('This tree is… wrong. The branches give when you push them — like a curtain. Behind them, a gap just wide enough for you.'); toast('<b style="color:#b8f0a0">SECRET GLADE</b>', 2400); save(); }
    await World.go('glade_' + z, g.start[0], g.start[1], 'up');
  }
  async function gladeStash(z) {
    if (F()['glade_' + z]) { await narr('A ring of mushrooms around a flat stone. It\'s peaceful here. Nobody else knows about this place.'); Story.heal(); return; }
    F()['glade_' + z] = 1; World.ents = World.ents.filter(e => e.id !== 'gstash'); const g = 140 + Math.floor(Math.random() * 120), a = rare(); G.S.gold += g; UI.hud(); sfx('level');
    await narr(`Under the flat stone in the middle of the glade: a hunter's cache wrapped in oilcloth. ${g} gold${a ? ` and a ${gold$(a)}` : ''}.`); save();
  }
  const stashImg = (() => { let S; return () => S || (S = sheet(x => { R(x, 'rgba(0,0,0,.25)', 16, 54, 32, 5); R(x, '#8a8a7a', 18, 44, 28, 12); R(x, '#a8a896', 18, 44, 28, 2); for (const [a, b] of [[12, 52], [48, 50], [22, 58], [40, 58], [14, 44], [50, 42]]) { R(x, '#e8e0d0', a, b - 3, 4, 3); R(x, '#c84030', a - 1, b - 5, 6, 2); } })); })();
  async function lookout(z) {
    const f = feats(z), mk = MK[z], M = G.maps[mk], [rx, ry] = f.rock;
    await narr('You scramble up the rock. From the top you can see a long way — every clearing, every path, every glint in the trees.');
    G.S.fcfog = G.S.fcfog || {}; let s = G.S.fcfog[mk]; if (!s || s.length !== M.w * M.h) s = '0'.repeat(M.w * M.h); const a = s.split('');
    for (let y = 0; y < M.h; y++) for (let x = 0; x < M.w; x++) if ((x - rx) ** 2 + (y - ry) ** 2 <= 18 * 18) a[y * M.w + x] = '1';
    G.S.fcfog[mk] = a.join(''); if (typeof MiniMap !== 'undefined') MiniMap.ckey = '';
    const left = (FCL[mk].chests || []).filter(([x, y]) => !(G.S.chests || {})[`${z}:${x},${y}`]).length;
    toast(`<b>LOOKOUT</b> — map revealed around you. ${left ? left + ' chest' + (left > 1 ? 's' : '') + ' still out there.' : 'Every chest here is opened.'}`, 3000);
    if (!F()['look_' + z]) { F()['look_' + z] = 1; save(); }
  }

  /* ---------- wandering events ---------- */
  let follower = null, ftrail = null;
  async function burningCart(e) {
    const c = await ask(null, null, 'A merchant\'s cart is on fire — the mule is gone, the driver is beating at the flames with his coat.', ['Help put it out', 'Grab what you can from the back', 'Walk on']);
    World.ents = World.ents.filter(n => n !== e); fire = null;
    if (c === 0) { const g = 120; G.S.gold += g; S_().goodDeeds = (S_().goodDeeds || 0) + 1; UI.hud(); sfx('heal'); await narr(`Between you, you smother it with dirt and coats. The driver shakes your hand for a long time. "Most would've robbed me." He pays you ${g} gold.`); }
    else if (c === 1) { const g = 200; G.S.gold += g; UI.hud(); sfx('coin'); await narr(`While he's busy with the flames, you pull a strongbox out of the back. ${g} gold. He doesn't see you. Probably.`); }
    save();
  }
  async function wounded(e) {
    const has = (G.S.items.tonic || 0) > 0;
    const c = await ask(null, null, 'A traveller sits against a tree, clutching a bloody leg. "Lupines… came out of nowhere. Got anything for this?"', [has ? 'Give a tonic' : 'You have no tonic', 'Leave them']);
    if (c === 0 && has) { G.S.items.tonic--; S_().goodDeeds = (S_().goodDeeds || 0) + 1; const n = rare(); sfx('heal');
      await narr(`You bind the leg and hand over the tonic. "I owe you. Here — it was my father's. Better it goes to someone who'll use it."${n ? ` They give you a ${gold$(n)}.` : ''}`);
      World.ents = World.ents.filter(n => n !== e); save(); }
  }
  async function lostChild(e) {
    if (follower === e) { await narr('"Are we nearly at the Crossroads? Mum will be there. I KNOW she will."'); return; }
    await narr('A little kid is crying under a tree. "I followed a butterfly and now everything looks the same. Mum\'s waiting at the Crossroads…"');
    const c = await ask(null, null, 'Take the kid back to the Crossroads?', ['"Come on. Stay close."', 'Not now']);
    if (c === 0) { follower = e; e.ai = null; S_().childEsc = 1; toast('The kid follows you. Head for the Crossroads.', 2600); }
  }
  let fire = null;
  async function wander(z) {
    if (Math.random() > .14) return; const at = W4().spot(z, 2000 + Math.floor(Math.random() * 40)); if (!at) return;
    const k = pick(['cart', 'wounded', 'child']);
    if (k === 'cart') { const e = new Ent({ id: 'wev', x: at[0], y: at[1], dir: 'down', img: cartImg(), size: 1.4, name: 'Burning cart', talk: () => burningCart(e) }); World.ents.push(e); World.col[at[1]][at[0]] = 1; fire = at; World.lights.push({ x: at[0] * TILE + 16, y: at[1] * TILE, r: 90, c: '255,130,40' }); }
    if (k === 'wounded') await npc('wev', pick(['folk3', 'folk12', 'hunter', 'folk20']), at[0], at[1], 'Traveller', () => wounded(World.ents.find(e => e.id === 'wev')));
    if (k === 'child') { const e = await npc('wev', pick(['kid8', 'kid17', 'dkid3']), at[0], at[1], 'Lost child', () => lostChild(World.ents.find(n => n.id === 'wev'))); if (e) World.col[at[1]][at[0]] = 0; }
  }
  const cartImg = (() => { let S; return () => S || (S = sheet(x => { R(x, 'rgba(0,0,0,.3)', 6, 56, 52, 5); R(x, '#3a2414', 8, 34, 46, 16); R(x, '#5a3a20', 8, 34, 46, 2); R(x, '#2a1a10', 10, 20, 42, 16); for (const cx of [16, 46]) { R(x, '#1a1008', cx - 6, 46, 12, 12); R(x, '#3a2414', cx - 4, 48, 8, 8); } })); })();

  /* ---------- skirmishes, waystones, weather shrines, settlers ---------- */
  async function skirmish(z) {
    if (!/woods_[ew]/.test(z) || Math.random() > .12 || !ENEMY.bandit || !ENEMY.m_goblin) return; const at = W4().spot(z, 1900); if (!at) return;
    const [x, y] = at, ids = [];
    for (const [dx, sp, nm] of [[-2, 'm_goblin', 'Goblin'], [-2, 'm_goblin', 'Goblin'], [2, 'bandit', 'Bandit'], [2, 'bandit', 'Bandit']]) {
      const yy = y + (ids.length % 2 ? 1 : -1), xx = x + dx; if (!World.col[yy] || World.col[yy][xx] !== 0) continue;
      const e = await npc('skirm', sp, xx, yy, nm, () => skirmTalk(), dx < 0 ? 'right' : 'left'); if (e) { e.ai = 'turn'; e.turns = [dx < 0 ? 'right' : 'left']; ids.push(e); } }
    if (ids.length >= 2) toast('Shouting in the trees — <b>goblins and bandits</b> are fighting over the road.', 2800);
  }
  async function skirmTalk() {
    const c = await ask(null, null, 'Goblins and bandits, blades out, screaming at each other over a stolen cart.', ['Help the bandits', 'Help the goblins', 'Wait for one side to win']);
    const clear = () => { World.ents.filter(e => e.id === 'skirm').forEach(e => { if (World.col[e.y]) World.col[e.y][e.x] = 0; }); World.ents = World.ents.filter(e => e.id !== 'skirm'); };
    let foes, msg;
    if (c === 0) { foes = ['m_goblin', 'm_goblin']; msg = 'The bandits cheer — then quietly vanish with the cart while you\'re busy. One leaves a coin pouch behind as thanks.'; }
    else if (c === 1) { foes = ['bandit', 'bandit']; msg = 'The goblins jabber happily and press a shiny thing into your hand before scampering off with the cart.'; }
    else { if (!ENEMY.skirm_victor) ENEMY.skirm_victor = Object.assign({}, ENEMY.bandit, { name: 'Bloodied Victor', img: ENEMY.bandit.img || 'bandit', hp: Math.round(ENEMY.bandit.hp * 1.1) }); foes = ['skirm_victor']; msg = 'You wait. The goblins break and run. The last bandit standing is bleeding and furious — and has both sides\' loot.'; await narr(msg); msg = 'You take the lot.'; }
    clear(); const r = await Battle.start({ enemies: foes, bd: SCENES[G.S.map].bd, intro: 'SKIRMISH' });
    if (r === 'lose') { await Story.defeat(); return; } if (r !== 'win') return;
    const g = c === 2 ? 180 : 90, n = Math.random() < (c === 2 ? .6 : .3) ? rare() : ''; G.S.gold += g; UI.hud(); await narr(`${msg} (${g} gold${n ? `, a ${gold$(n)}` : ''})`); save();
  }
  const WAYS = () => ['woods', ...ZONES];
  const wayAt = z => W4().spot(z, 1031);
  const ways = () => (S_().waystones = S_().waystones || {});
  const wayImg = on => sheet(x => { R(x, 'rgba(0,0,0,.3)', 18, 58, 28, 4); R(x, '#5a6a6a', 24, 10, 16, 48); R(x, '#788888', 24, 10, 16, 3); R(x, '#4a5858', 38, 12, 2, 46); R(x, '#5a6a6a', 20, 50, 24, 8);
    const c = on ? '#46ff95' : '#3a4a4a'; R(x, c, 30, 18, 4, 4); R(x, c, 28, 26, 8, 2); R(x, c, 31, 30, 2, 10); R(x, c, 28, 42, 3, 3); R(x, c, 33, 42, 3, 3); });
  async function wayTalk(z) {
    const W = ways();
    if (!W[z]) { await narr('A tall stone carved with Drag runes, cold and dead. You put your hand on it — and your eyes sting, and every rune lights up green at once.'); W[z] = 1; sfx('level'); toast(`<b style="color:#46ff95">DRAG WAYSTONE</b> awakened (${Object.keys(W).length}/${WAYS().length})`, 2600); save(); await World.go(z, World.player.x, World.player.y, World.player.dir); return; }
    const list = WAYS().filter(s => W[s] && s !== z);
    if (!list.length) { await narr('The runes glow, waiting. (Wake another waystone and you can step between them.)'); return; }
    const c = await ask(null, null, 'The runes hum. Where do you want to go?', [...list.map(s => SCENES[s].subtitle === 'Where the four woods meet' ? 'The Crossroads' : SCENES[s].subtitle), 'Stay']);
    const to = list[c]; if (!to) return; const at = wayAt(to); if (!at) return; sfx('blip');
    await World.go(to, at[0], at[1] + 1, 'down');
  }
  const shrineAt = z => W4().spot(z, 1129);
  const wsImg = (() => { let S; return () => S || (S = sheet(x => { R(x, 'rgba(0,0,0,.3)', 18, 58, 28, 4); R(x, '#7a6a5a', 22, 40, 20, 18); R(x, '#9a8a7a', 22, 40, 20, 2); R(x, '#5a4a3a', 26, 30, 12, 10); R(x, '#d8c890', 29, 33, 6, 4); R(x, '#a8d8ff', 30, 24, 4, 6); R(x, '#ffffff', 31, 25, 2, 2); })); })();
  async function weatherShrine() {
    if (G.S.gold < 10) { await narr('A little weather shrine. The offering bowl wants a coin or two. You have none.'); return; }
    const opts = [['clear', 'Clear skies'], ['rain', 'Rain (fish bite)'], ['fog', 'Fog (sneak, wisps)'], ['wind', 'Wind']];
    const c = await ask(null, null, 'A weather shrine, hung with little bells. Leave 10 gold and ask for…', [...opts.map(o => o[1]), 'Nothing']); const o = opts[c]; if (!o) return;
    G.S.gold -= 10; UI.hud(); Ambient.weather = o[0]; Ambient.wFade = 0; Ambient.wNext = (G.t || performance.now()) + 240000; sfx('blip'); await narr('The bells ring by themselves. The sky listens.');
  }
  const zk = () => (S_().zk = S_().zk || {});
  const tierOf = z => (zk()[z] || 0) >= 20 ? 2 : (zk()[z] || 0) >= 8 ? 1 : 0;
  const pedImg = (() => { let S; return () => S || (S = sheet(x => { R(x, 'rgba(0,0,0,.3)', 10, 58, 44, 4); R(x, '#6b4a2a', 10, 42, 44, 14); R(x, '#8a6038', 10, 42, 44, 2); R(x, '#4a3020', 12, 26, 3, 30); R(x, '#4a3020', 49, 26, 3, 30); for (let i = 0; i < 6; i++) R(x, i % 2 ? '#efe4c8' : '#4a7a3a', 8 + i * 8, 20, 8, 8); R(x, '#a03020', 18, 37, 5, 5); R(x, '#4a8ad8', 30, 37, 5, 5); R(x, '#d8a838', 42, 37, 5, 5); })); })();
  async function peddler() {
    const c = await ask(null, null, '"Woods are safe enough to trade in now — thanks to you, they say." A peddler\'s cart, set up by the fire.', ['Tonic — 35g', 'Ether — 50g', 'Nothing']);
    const it = [['tonic', 35], ['ether', 50]][c]; if (!it) return; if (G.S.gold < it[1]) { await narr('"Bit short, friend."'); return; }
    G.S.gold -= it[1]; G.S.items[it[0]] = (G.S.items[it[0]] || 0) + 1; UI.hud(); sfx('coin');
  }

  /* ---------- the Gate Surge (one week a month) ---------- */
  const surge = () => { const d = ((day() - 1) % 28) + 1; return d >= 8 && d <= 14; };
  let surgeToast = -1;
  function hookSurgeRoad() {
    const ex = SCENES.woods_e && (SCENES.woods_e.exits || []).find(e => e.to === 'woods_e2'); if (!ex || ex.__surge) return; ex.__surge = 1; const prev = ex.check;
    ex.check = async () => { if (surge()) { await narr('A Guild barricade across the road: SCORCHED ROAD CLOSED — GATE SURGE IN PROGRESS. A tired guard shakes his head. "A week, maybe. If we\'re lucky."'); return false; } return prev ? prev() : true; };
  }

  /* ---------- one Battle hook: count wins per zone ---------- */
  const _bs = Battle.start.bind(Battle);
  Battle.start = async function (cfg) {
    const z = G.S && G.S.map, r = await _bs(cfg);
    try { if (r === 'win' && ZONES.includes(z)) { const t0 = tierOf(z); zk()[z] = (zk()[z] || 0) + 1; const t1 = tierOf(z);
      if (t1 > t0) toast(t1 === 1 ? `<b>${SCENES[z].subtitle}</b> feels safer. A peddler has set up by the campfire.` : `<b>${SCENES[z].subtitle}</b> is tamed. Settlers have moved in — fewer monsters, a new camp.`, 3400); } } catch (e) { }
    return r;
  };

  /* ---------- animals: birds out of bushes, eyes in the dark ---------- */
  let birds = [], eyes = null, eyesToast = '';
  const bushes = () => (World.map.props || []).filter(p => /bush/.test(p.k));

  /* ---------- photo mode ---------- */
  const FILTERS = [['', ''], ['Clear', 'none'], ['Sepia', 'sepia(.7) contrast(1.1)'], ['Moonlight', 'saturate(.6) hue-rotate(180deg) brightness(.9)'], ['Noir', 'grayscale(1) contrast(1.3)'], ['Vivid', 'saturate(1.6) contrast(1.1)']];
  let photo = 0;
  function photoUI() {
    if (document.getElementById('photoBtn')) return;
    const st = document.createElement('style'); st.textContent = `body.photo>*:not(#game):not(#photoBtn){visibility:hidden!important}#photoBtn{position:fixed;right:14px;bottom:188px;z-index:60;width:38px;height:38px;border-radius:19px;border:1px solid rgba(255,220,140,.5);background:rgba(10,18,14,.6);color:#ffe7a8;font:600 17px system-ui;display:flex;align-items:center;justify-content:center;padding:0}#photoBtn small{position:absolute;top:42px;right:0;font:700 10px system-ui;white-space:nowrap;color:#ffe7a8;text-shadow:0 1px 2px #000}body:not(.inworld) #photoBtn{display:none}`;
    document.head.appendChild(st);
    const b = document.createElement('button'); b.id = 'photoBtn'; b.innerHTML = '📷<small></small>'; document.body.appendChild(b);
    b.addEventListener('click', ev => { ev.stopPropagation(); photo = (photo + 1) % FILTERS.length; document.body.classList.toggle('photo', photo > 0); const g = document.getElementById('game'); if (g) g.style.filter = photo ? FILTERS[photo][1] : ''; b.querySelector('small').textContent = photo ? FILTERS[photo][0] + ' · tap to change' : ''; });
  }

  /* ---------- wiring ---------- */
  let flips = {};
  const _load = World.load.bind(World);
  World.load = async function (name, ...a) {
    birds = []; eyes = null; fire = null; if (follower && !World.ents.includes(follower)) { /* re-spawned below */ }
    if (ZONES.includes(name) && G.maps) try { makeGlade(name); } catch (e) { }
    const r = await _load(name, ...a);
    try {
      const T = SCENES[name] && SCENES[name].tiles;
      if (ZONES.includes(name)) {
        const f = feats(name);
        if (f.tree && T) { const k = f.tree[0] + ',' + f.tree[1]; if (!T[k] || !T[k].__glade) { T[k] = () => enterGlade(name); T[k].__glade = 1; } }
        if (f.rock && T) { const k = f.rock[0] + ',' + f.rock[1]; if (!T[k] || !T[k].__look) { T[k] = () => lookout(name); T[k].__look = 1; } }
        if (f.dry && season() === 'summer' && !F()['dry_' + name + week()]) World.ents.push(new Ent({ id: 'drybed', x: f.dry[0], y: f.dry[1], dir: 'down', img: stashImg(), pickup: 1, name: '', talk: async () => { F()['dry_' + name + week()] = 1; World.ents = World.ents.filter(e => e.id !== 'drybed'); const g = 90 + Math.floor(Math.random() * 90), n = Math.random() < .4 ? rare() : ''; G.S.gold += g; UI.hud(); sfx('blip'); await narr(`The summer drought has pulled the water back from the bank. In the cracked mud: an old offering stone, and under it ${g} gold${n ? ` and a ${gold$(n)}` : ''}.`); save(); } }));
        flips = {};
        const w = wayAt(name); if (w) { World.col[w[1]][w[0]] = 1; World.ents.push(new Ent({ id: 'waystone', x: w[0], y: w[1], dir: 'down', img: wayImg(!!ways()[name]), size: 1.3, pickup: 1, name: '', talk: () => wayTalk(name) })); if (ways()[name]) World.lights.push({ x: w[0] * TILE + 16, y: w[1] * TILE - 10, r: 70, c: '70,255,150' }); }
        const s = shrineAt(name); if (s) { World.col[s[1]][s[0]] = 1; World.ents.push(new Ent({ id: 'wshrine', x: s[0], y: s[1], dir: 'down', img: wsImg(), pickup: 1, name: '', talk: weatherShrine })); }
        const t = tierOf(name), fire0 = (FCL[MK[name]].fires || [])[0];
        if (t >= 1 && fire0) { const p = tileNear(fire0[0] + 2, fire0[1]) || tileNear(fire0[0], fire0[1] + 2); if (p) { World.col[p[1]][p[0]] = 1; World.ents.push(new Ent({ id: 'peddler', x: p[0], y: p[1], dir: 'down', img: pedImg(), size: 1.3, pickup: 1, name: 'Peddler', talk: peddler })); } }
        if (t >= 2) { SCENES[name].encRate = (SCENES[name].__er = SCENES[name].__er || SCENES[name].encRate || .11) * .55; const p = W4().spot(name, 1777); if (p) { World.extraProps.push({ k: 'fc_w_tent', x: p[0], y: p[1] }); World.col[p[1]][p[0]] = 1; World.addFire(p[0] + 2, p[1] + 1); World.buildPropList(); } }
        await wander(name); await skirmish(name);
        if (surge() && window.WorldPlus3) for (let i = 0; i < 4; i++) { S_().gateLast = -9999; WorldPlus3.maybeRift(name); }
      }
      if (name === 'woods') { const w = wayAt('woods'); if (w) { World.col[w[1]][w[0]] = 1; World.ents.push(new Ent({ id: 'waystone', x: w[0], y: w[1], dir: 'down', img: wayImg(!!ways().woods), size: 1.3, pickup: 1, name: '', talk: () => wayTalk('woods') })); } hookSurgeRoad();
        if (surge()) { if (surgeToast !== week()) { surgeToast = week(); toast('<b style="color:#c8a0ff">GATE SURGE</b> — rifts are tearing open all over the woods this week. Refugees are camped at the Crossroads.', 4000); }
          for (const [i, sp] of [['folk13', 0], ['folk4', 1], ['dfolk2', 2]].entries()) { const p = W4().spot('woods', 1500 + i); if (p) await npc('refugee', sp[0], p[0], p[1], 'Refugee', () => narr(pick(['"We came from the Gate road. The sky went the wrong colour and the trees started screaming."', '"The Guild says a week. They always say a week."', '"My husband stayed to help the wardens. He\'ll be along. He will."']))); } }
        if (follower && S_().childEsc) { S_().childEsc = 0; follower = null; const g = 80; G.S.gold += g; S_().goodDeeds = (S_().goodDeeds || 0) + 1; UI.hud(); sfx('level'); setTimeout(() => Story.run(async () => narr(`A woman runs across the Crossroads and scoops the kid up, sobbing. "Thank you — thank you!" She presses ${g} gold on you and won't take it back.`)), 600); save(); }
      }
      if (follower && S_().childEsc && ZONES.includes(name)) { const p = World.player, q = tileNear(p.x, p.y); if (q) { follower.x = q[0]; follower.y = q[1]; follower.px = q[0] * TILE + 16; follower.py = q[1] * TILE + 26; follower.move = null; World.ents.push(follower); } ftrail = [p.x, p.y]; }
      if (/^glade_/.test(name)) { const z = name.slice(6), g = FCL['fc_glade_' + BIO(z)].glade; World.ents.push(new Ent({ id: 'gstash', x: g.stash[0], y: g.stash[1], dir: 'down', img: stashImg(), pickup: 1, name: '', talk: () => gladeStash(z) })); World.col[g.stash[1]][g.stash[0]] = 1; }
    } catch (e) { console.warn('worldplus8', e); }
    return r;
  };
  const _step = World.onStep.bind(World);
  World.onStep = function (e) {
    const before = ftrail; const r = _step(e);
    try { if (!e || !e.isPlayer) return r;
      if (follower && World.ents.includes(follower) && before && !follower.move) follower.startMove(before[0], before[1], 220); ftrail = [e.x, e.y];
      if (ZONES.includes(G.S.map) && Math.random() < .35) for (const b of bushes()) if (Math.abs(b.x - e.x) + Math.abs(b.y - e.y) <= 1 && Math.random() < .5) {
        for (let i = 0; i < 3 + Math.floor(Math.random() * 3); i++) birds.push({ x: b.x * TILE + 16 + Math.random() * 16 - 8, y: b.y * TILE + 4, vx: (Math.random() - .5) * 3, vy: -1.5 - Math.random() * 1.5, t: 0, c: pick(['#3a2a1a', '#6a5a4a', '#2a2a3a']) }); break; }
    } catch (x) { }
    return r;
  };
  if (typeof Ambient !== 'undefined' && Ambient.ground) {
    const _g = Ambient.ground.bind(Ambient);
    Ambient.ground = function (c, cx, cy, t, w, h) {
      const r = _g(c, cx, cy, t, w, h);
      try { const z = G.S.map; if (!ZONES.includes(z)) return r; const f = feats(z);
        for (const k of ['night', 'ice']) { const X = f[k]; if (!X) continue; const open = crossOpen(z, k);
          for (const [x, y] of X.run) { const sx = x * TILE - cx, sy = y * TILE - cy;
            if (k === 'night') { c.fillStyle = open ? 'rgba(150,160,170,.95)' : 'rgba(110,120,130,.25)'; for (const [ox, oy] of [[6, 8], [18, 14], [8, 22]]) { c.beginPath(); c.ellipse(sx + ox + 4, sy + oy + 3, 6, 4, 0, 0, 7); c.fill(); } if (open) { c.fillStyle = 'rgba(220,235,255,.6)'; c.fillRect(sx + 9, sy + 9, 2, 1); } }
            else if (open) { c.fillStyle = 'rgba(220,240,255,.78)'; c.fillRect(sx, sy, 32, 32); c.strokeStyle = 'rgba(160,200,230,.8)'; c.beginPath(); c.moveTo(sx + 4, sy + 6); c.lineTo(sx + 14, sy + 16); c.lineTo(sx + 26, sy + 12); c.stroke(); } } }
        if (f.dry && season() === 'summer') { const sx = f.dry[0] * TILE - cx, sy = f.dry[1] * TILE - cy; c.fillStyle = '#8a7050'; c.fillRect(sx, sy, 32, 32); c.strokeStyle = '#5a4630'; c.beginPath(); c.moveTo(sx + 3, sy + 8); c.lineTo(sx + 14, sy + 14); c.lineTo(sx + 28, sy + 6); c.moveTo(sx + 14, sy + 14); c.lineTo(sx + 12, sy + 28); c.stroke(); }
      } catch (e) { }
      return r;
    };
  }
  let tick = 0;
  const _render = World.render.bind(World);
  World.render = function (c, t) {
    _render(c, t);
    try {
      document.body.classList.toggle('inworld', G.mode === 'world'); if (G.mode !== 'world' || !World.player || World.loading) return;
      const z = G.S.map, [ox, oy] = cam(), now = performance.now();
      if (ZONES.includes(z) && now > tick) { tick = now + 500; const f = feats(z), p = World.player;
        for (const k of ['night', 'ice']) { const X = f[k]; if (!X) continue; const open = crossOpen(z, k);
          for (const [x, y] of X.run) { if (!open && p.x === x && p.y === y) continue; World.col[y][x] = open ? 0 : 1; } }
        if (f.dry && season() === 'summer' && World.col[f.dry[1]]) World.col[f.dry[1]][f.dry[0]] = 1; }
      // the fake tree shivers now and then
      if (ZONES.includes(z)) { const f = feats(z); if (f.tree && Math.sin(t / 900) > .96) { c.fillStyle = 'rgba(120,180,90,.7)'; for (let i = 0; i < 3; i++) c.fillRect(f.tree[0] * TILE + 6 + i * 9 - ox + Math.sin(t / 60 + i) * 2, f.tree[1] * TILE - 40 - oy + i * 5, 3, 2); } }
      if (fire) for (let i = 0; i < 6; i++) { const fx = fire[0] * TILE + 8 + i * 3 - ox, fy = fire[1] * TILE - 2 - oy - ((t / 4 + i * 13) % 22); c.fillStyle = `rgba(255,${140 + i * 15},40,${(.8 - ((t / 4 + i * 13) % 22) / 28).toFixed(2)})`; c.fillRect(fx, fy, 3, 4); }
      birds = birds.filter(b => (b.t += 1) < 60); for (const b of birds) { b.x += b.vx; b.y += b.vy; b.vy *= .99; const fl = Math.sin(b.t / 2) > 0; c.fillStyle = b.c; c.fillRect(b.x - ox - (fl ? 3 : 2), b.y - oy, fl ? 6 : 4, fl ? 1 : 2); c.fillRect(b.x - ox - 1, b.y - oy, 2, 2); }
      if (/woods_[nw]/.test(z) && night() > .6) { const p = World.player;
        if (!eyes || Math.abs(eyes.x - p.x) + Math.abs(eyes.y - p.y) > 11 || Math.random() < .002) { const a = Math.random() * 7; eyes = { x: Math.round(p.x + Math.cos(a) * 7), y: Math.round(p.y + Math.sin(a) * 5), t0: now }; }
        if (eyesToast !== z + day()) { eyesToast = z + day(); toast('Something is following you through the trees…', 2600); }
        const bl = Math.sin(now / 1300) > -.9 ? 1 : 0, ex = eyes.x * TILE + 16 - ox, ey = eyes.y * TILE - 6 - oy;
        if (bl) { c.fillStyle = 'rgba(255,200,80,.85)'; c.fillRect(ex - 5, ey, 3, 2); c.fillRect(ex + 2, ey, 3, 2); c.fillRect(ex + 13, ey + 3, 3, 2); c.fillRect(ex + 20, ey + 3, 3, 2); } }
      if (follower && World.ents.includes(follower) && !follower.move && Math.abs(follower.x - World.player.x) + Math.abs(follower.y - World.player.y) > 3 && ftrail) follower.startMove(ftrail[0], ftrail[1], 200);
      if (z === 'woods' && surge()) { c.fillStyle = 'rgba(90,40,140,.12)'; c.fillRect(0, 0, c.canvas.width, c.canvas.height); }
    } catch (e) { }
  };
  photoUI();
  window.WorldPlus8 = { feats, ZONES, surge, ways, tierOf, zk, makeGlade };
})();
