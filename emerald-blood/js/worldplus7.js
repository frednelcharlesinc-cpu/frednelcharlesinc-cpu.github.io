'use strict';
/* ================= WORLD+ 7 (Chat B — World & Maps) =================
   1. VESSA'S ARC — beat her twice and she comes to the Crossroads with an offer: hunt the elder marks together.
   2. STORMS & THE BLOOD MOON — rain can break into a thunderstorm (lightning drops crystals you can pick up); one
      night a week the moon goes red and everything in the woods is stronger — and richer.
   3. FIELD JOURNAL — every new kind of monster you beat gets sketched in. Rewards every 10 entries (wanted board).
   4. FALLS IN THE DUNGEONS — somewhere in each forest dungeon, water pours down a wall. There is a room behind it.
   5. ESCORT JOBS — the board posts a merchant who needs guarding to a forest camp. Expect ambushes.
   6. DUNGEON ECHOES — once a dungeon's lord is dead, a stone in its chamber shows how it fell.
   7. MOUNT STAMINA — mounts tire in the woods (and won't climb rope ladders). Walk a while and they recover.
   (Story lines for Vessa and the echoes are B's drafts — Chat A may rewrite them freely.) */
(function () {
  const W4 = () => window.WorldPlus4, W6 = () => window.WorldPlus6;
  const MK = { woods: 'fc_cross', woods_n: 'fc_north', woods_e: 'fc_east', woods_s: 'fc_south', woods_w: 'fc_west' };
  const FOREST = ['woods_n', 'woods_e', 'woods_s', 'woods_w'];
  const S_ = () => G.S, F = () => G.S.f;
  const week = () => Math.floor(((typeof Cal !== 'undefined' ? Cal.day() : 1) - 1) / 7);
  const night = () => (typeof Ambient !== 'undefined' && Ambient.night) || 0;
  const sheet = draw => { const one = document.createElement('canvas'); one.width = one.height = 64; const x = one.getContext('2d'); draw(x); const S = document.createElement('canvas'); S.width = 64 * 9; S.height = 64 * 12; const s = S.getContext('2d'); for (let r = 0; r < 12; r++) for (let f = 0; f < 9; f++) s.drawImage(one, f * 64, r * 64); return S; };
  const R = (x, c, a, b, w, h) => { x.fillStyle = c; x.fillRect(a, b, w, h); };
  const blank = (() => { let S; return () => S || (S = sheet(() => { })); })();
  const rare = () => W4().giveRare();
  const gold$ = n => `<b style="color:#ffd36a">${n}</b>`;
  const cam = () => [Math.round(World.cam.x), Math.round(World.cam.y)];
  const near = (a, b, d) => Math.abs(a[0] - b[0]) + Math.abs(a[1] - b[1]) <= d;
  const elite = (k, pre, nm, m) => { const B = ENEMY[k]; if (!B) return k; const key = pre + '_' + k; if (!ENEMY[key]) ENEMY[key] = Object.assign({}, B, { name: nm + ' ' + B.name, img: B.img || k, hp: Math.round(B.hp * m), atk: Math.round(B.atk * (1 + (m - 1) * .3)), xp: Math.round((B.xp || 10) * m * 1.2), gold: Math.round((B.gold || 5) * m * 1.2) }); return key; };
  const fpool = sc => { try { return (SCENES[sc].encounters && SCENES[sc].encounters().enemies) || []; } catch (e) { return []; } };

  /* ---------- 2a. blood moon ---------- */
  const bloodMoon = () => FOREST.includes(G.S.map) && night() > .6 && ((typeof Cal !== 'undefined' ? Cal.day() : 1) % 7) === 3;
  let bmToast = -1;

  /* ---------- 3. field journal (and the battle hook everything here shares) ---------- */
  const PREFIX = /^(horn|blood|rift)_(.+)$/;
  function baseOf(k) { const m = PREFIX.exec(k); if (m) return baseOf(m[2]); if (/^(bty|season|rival|sanct|lt|rh)_/.test(k)) { const e = ENEMY[k]; return e && ENEMY[e.img] ? e.img : null; } return ENEMY[k] ? k : null; }
  const journal = () => (S_().journal = S_().journal || {});
  function record(enemies) {
    const J = journal(); let added = [];
    for (const k of enemies || []) { const b = baseOf(k); if (b && !J[b] && !ENEMY[b].boss && !/^(kairo_spar|b_)/.test(b)) { J[b] = 1; added.push(ENEMY[b].name); } }
    if (added.length) toast(`<b style="color:#cfe6b0">FIELD JOURNAL</b> — sketched: ${added.join(', ')} (${Object.keys(J).length})`, 2600);
  }
  async function journalTalk() {
    const J = journal(), n = Object.keys(J).length, paid = S_().journalPaid || 0, names = Object.keys(J).map(k => ENEMY[k].name);
    await narr(`Your field journal: ${n} creatures sketched.${names.length ? ' ' + names.slice(-12).join(' · ') + (names.length > 12 ? ' …' : '') : ''}`);
    let tier = Math.floor(n / 10);
    while (paid + 0 < tier && (S_().journalPaid || 0) < tier) { S_().journalPaid = (S_().journalPaid || 0) + 1; const t = S_().journalPaid, g = 150 * t, r1 = rare(); G.S.gold += g; UI.hud(); sfx('level');
      await narr(`The Guild's naturalist buys a copy of page ${t}: ${g} gold${r1 ? ` and a ${gold$(r1)}` : ''}.`); }
    if (n % 10) await narr(`(${10 - n % 10} more to fill the next page.)`); save();
  }

  /* ---------- 1. Vessa's arc ---------- */
  const V = () => S_().vessa || 0;
  const vessaImg = async () => { try { return await npcImg(ENEMY.bandit && ENEMY.bandit.img || 'bandit'); } catch (e) { return null; } };
  async function vessaTalk() {
    const S = S_();
    if (V() === 0) {
      await narr('Vessa Crane is leaning on the wanted board, picking at a splinter. "Don\'t get excited. I\'m not here to fight."');
      await narr('"The elder marks. Too big for one hunter — I\'ve watched three Copper fools try. You and me, though…" She taps an elder notice. "Half the purse each. I take the trophy. You take the credit."');
      const c = await ask(null, null, 'Hunt the elder marks with Vessa?', ['Deal', 'Not yet']);
      if (c === 0) { S.vessa = 1; await narr('"Good. When you fight an elder, I\'ll be there. Don\'t make me carry you." (Vessa now joins your elder-mark fights: they go down much faster.)'); save(); }
      return;
    }
    if (V() === 1 && (S.elderWithV || 0) >= 1) {
      await narr('Vessa isn\'t smiling for once. "That elder. When it died it looked at you. Not me — you."');
      await narr('"My grandmother had eyes like yours. Green as bottle glass. She wore spectacles with smoked lenses every day of her life and told me never, ever to ask why." She holds your gaze. "I\'m not asking. I\'m telling you I noticed."');
      const r1 = rare(); S.vessa = 2; if (r1) await narr(`She tosses you something from her pack: a ${gold$(r1)}. "For the next one."`); save(); return;
    }
    await narr(pick(['"Elder this week is a big one. Try to keep up."', '"If the Inquisition asks, we\'ve never met."', '"You owe me a drink. Several, actually."', '"I keep a tally of who\'s ahead, you know. It\'s me."']));
  }
  const pick = L => L[Math.floor(Math.random() * L.length)];

  /* ---------- the one Battle.start wrapper: blood moon, Vessa on elders, field journal ---------- */
  const _bs = Battle.start.bind(Battle);
  Battle.start = async function (cfg) {
    cfg = cfg || {};
    try {
      if (bloodMoon() && cfg.enemies && !cfg.boss) cfg = Object.assign({}, cfg, { enemies: cfg.enemies.map(k => elite(k, 'blood', 'Blood-moon', 1.6)), intro: cfg.intro ? 'BLOOD MOON — ' + cfg.intro : 'BLOOD MOON' });
      const k0 = cfg.enemies && cfg.enemies[0], b = k0 && /^bty_/.test(k0) && W4().hunted && W4().hunted.__b;
      if (b && b.elder && V() >= 1 && ENEMY[k0]) { const vk = k0 + '_v'; if (!ENEMY[vk]) ENEMY[vk] = Object.assign({}, ENEMY[k0], { hp: Math.round(ENEMY[k0].hp * .55) }); cfg = Object.assign({}, cfg, { enemies: [vk, ...cfg.enemies.slice(1)], intro: (cfg.intro || '') + ' · WITH VESSA CRANE' }); cfg.__vessa = 1; }
    } catch (e) { }
    const r = await _bs(cfg);
    try {
      if (r === 'win') { record(cfg.enemies); if (cfg.__vessa) S_().elderWithV = (S_().elderWithV || 0) + 1;
        if (bloodMoon() && Math.random() < .3) { const n = rare(); if (n) toast(`Blood-moon spoils: ${gold$(n)}`, 2400); } }
    } catch (e) { }
    return r;
  };

  /* ---------- 2b. thunderstorms ---------- */
  let storm = false, nextBolt = 0, flash = 0, crystals = [];
  const crystalImg = (() => { let S; return () => S || (S = sheet(x => { R(x, 'rgba(0,0,0,.25)', 22, 56, 20, 4); R(x, '#8ad8ff', 28, 34, 8, 22); R(x, '#d8f4ff', 30, 36, 3, 16); R(x, '#5ab0ff', 22, 42, 6, 14); R(x, '#5ab0ff', 36, 40, 6, 16); R(x, '#b8e8ff', 23, 44, 2, 8); })); })();
  function thunder() { try { if (!G.settings.sfx) return; const n = AC.sampleRate * 1.6, b = AC.createBuffer(1, n, AC.sampleRate), d = b.getChannelData(0); let v = 0; for (let i = 0; i < n; i++) { v = v * .98 + (Math.random() * 2 - 1) * .02; d[i] = v * 6 * Math.pow(1 - i / n, 2); } const s = AC.createBufferSource(), g = AC.createGain(); s.buffer = b; g.gain.value = .5; s.connect(g); g.connect(AC.destination); s.start(); } catch (e) { } }
  function bolt() {
    flash = 1; setTimeout(thunder, 300 + Math.random() * 900);
    const p = World.player; for (let i = 0; i < 40; i++) { const x = p.x + Math.round(Math.random() * 16 - 8), y = p.y + Math.round(Math.random() * 12 - 6);
      if (World.col[y] && World.col[y][x] === 0 && !World.ents.some(e => e.x === x && e.y === y) && !near([x, y], [p.x, p.y], 2)) {
        const e = new Ent({ id: 'lcrystal', x, y, dir: 'down', img: crystalImg(), pickup: 1, name: '', talk: () => takeCrystal(e) }); World.ents.push(e); World.col[y][x] = 1; World.lights.push(e.__l = { x: x * TILE + 16, y: y * TILE + 10, r: 60, c: '140,210,255' }); crystals.push(e); break; } }
  }
  async function takeCrystal(e) {
    World.ents = World.ents.filter(n => n !== e); World.col[e.y][e.x] = 0; World.lights = World.lights.filter(l => l !== e.__l);
    S_().lcrystals = (S_().lcrystals || 0) + 1; const g = 40 + Math.floor(Math.random() * 40); G.S.gold += g; const n = Math.random() < .25 ? rare() : ''; UI.hud(); sfx('blip');
    await narr(`A lightning crystal, still humming. A collector in Ashford pays ${g} gold for these.${n ? ` Fused inside it: a ${gold$(n)}!` : ''} (Crystals found: ${S_().lcrystals})`); save();
  }

  /* ---------- 4. falls in the dungeons ---------- */
  const DX = () => Object.keys(FCL).filter(k => FCL[k].dx && G.maps[k] && G.maps[k].dungeon);
  function fallSpot(id) {
    const M = G.maps[id], D = M.dungeon; if (M.__fall !== undefined) return M.__fall;
    const hidden = new Set((FCL[id].dx.regions || []).flat().map(p => p[0] + ',' + p[1])), dx = FCL[id].dx, busy = [...(D.chests || []), ...(dx.cracks || []), dx.gate, dx.relic, dx.clue, ...(dx.levers || []).map(l => [l.x, l.y]), D.boss, D.start].filter(Boolean);
    const seen = new Map([[D.start[0] + ',' + D.start[1], 0]]), q = [D.start], cand = [];
    while (q.length) { const [a, b] = q.shift(), d = seen.get(a + ',' + b);
      if (d > 28 && M.col[b - 1] && M.col[b - 1][a] === '1' && M.col[b - 2] && M.col[b - 2][a] === '1' && !hidden.has(a + ',' + (b - 1)) && M.col[b][a - 1] === '0' && M.col[b][a + 1] === '0' && !busy.some(p => near(p, [a, b], 4))) cand.push([a, b]);
      for (const [ddx, ddy] of [[1, 0], [-1, 0], [0, 1], [0, -1]]) { const x = a + ddx, y = b + ddy, k = x + ',' + y; if (!seen.has(k) && M.col[y] && M.col[y][x] === '0' && !hidden.has(k)) { seen.set(k, d + 1); q.push([x, y]); } } }
    return (M.__fall = cand.length ? cand[(id.length * 7919) % cand.length] : null);
  }
  const GMAPS = ['fc_grotto_n', 'fc_grotto_e', 'fc_grotto_s', 'fc_grotto_w'];
  function makeFallScenes() {
    DX().forEach((id, i) => { const f = fallSpot(id); if (!f) return; const gm = GMAPS[i % 4], g = FCL[gm] && FCL[gm].grotto; if (!g) return;
      SCENES['dfall_' + id] = { title: 'Behind the Falls', subtitle: (DUNGEONS[id] || {}).title || '', map: gm, music: 'woods', noAmbient: 1, interior: 1, bd: (DUNGEONS[id] || {}).bd || 'd_shrine',
        setup(W) { W.tint = 'rgba(2,8,20,.62)'; W.lights.push({ x: g.stone[0] * TILE + 16, y: g.stone[1] * TILE, r: 120, c: '120,200,255' }); },
        npcs() { return []; }, exits: [{ x: g.exit[0], y: g.exit[1], to: id, tx: f[0], ty: f[1], dir: 'down' }] };
    });
  }
  async function enterFall(id) {
    const g = FCL[GMAPS[DX().indexOf(id) % 4]].grotto;
    if (!F()['dfall_' + id]) { F()['dfall_' + id] = 1; await narr('Water pours down the rock face in a thin, roaring sheet. Behind it — not rock. Darkness, and cold air moving.'); toast('<b style="color:#9fd8ff">HIDDEN FALLS</b> found.', 2400); save(); }
    await World.go('dfall_' + id, g.start[0], g.start[1], 'up');
  }
  async function fallRelic(id) {
    if (F()['dfallr_' + id]) return; F()['dfallr_' + id] = 1; World.ents = World.ents.filter(e => e.id !== 'dfallrelic');
    const g = 250 + Math.floor(Math.random() * 150), a = rare(), b = rare(); G.S.gold += g; UI.hud(); sfx('level');
    await narr(`On a ledge under the spray, a drowned adventurer's strongbox: ${g} gold${a ? `, a ${gold$(a)}` : ''}${b ? ` and a ${gold$(b)}` : ''}.`); save();
  }

  /* ---------- 5. escort jobs ---------- */
  const cartImg = (() => { let S; return () => S || (S = sheet(x => {
    R(x, 'rgba(0,0,0,.3)', 6, 56, 52, 5); R(x, '#6b4a2a', 8, 34, 46, 16); R(x, '#8a6038', 8, 34, 46, 2); R(x, '#d8c8a0', 10, 18, 42, 18); R(x, '#efe2c0', 10, 18, 42, 3); R(x, '#a89870', 10, 33, 42, 2);
    for (const cx of [16, 46]) { R(x, '#3a2414', cx - 6, 46, 12, 12); R(x, '#6b4a2a', cx - 4, 48, 8, 8); R(x, '#3a2414', cx - 1, 51, 2, 2); }
    R(x, '#5a3a20', 52, 42, 10, 2); })); })();
  const ESC = () => S_().escort;
  W4().boardExtras.push({ label: () => 'Escort job — guard a merchant cart (250g)', show: () => !ESC() && (S_().escortWeek !== week()), run: async () => {
    const to = FOREST[(week() + 1) % 4], c = window.WorldPlus && WorldPlus.CAMPS.find(c => c.scene === to && !c.id); if (!c) return;
    await narr(`A nervous merchant with a cart of salt and lamp oil: "I need to reach ${c.name}. Bandits have been hitting the road. 250 gold if I get there with my cart."`);
    const ch = await ask(null, null, 'Take the escort job?', ['Take it', 'Not now']); if (ch !== 0) return;
    S_().escort = { to, waves: 0, steps: 0 }; S_().escortWeek = week(); save(); await World.go('woods', World.player.x, World.player.y, World.player.dir);
    toast(`<b>ESCORT</b> — lead the cart to ${c.name}. Stay on the roads.`, 3200);
  } });
  let cart = null, trail = null;
  function spawnCart(name) {
    cart = null; const E = ESC(); if (!E || (name !== 'woods' && name !== E.to)) return; const p = World.player;
    for (const [dx, dy] of [[0, 1], [0, -1], [1, 0], [-1, 0], [1, 1], [-1, 1]]) { const x = p.x + dx, y = p.y + dy; if (World.col[y] && World.col[y][x] === 0 && !World.ents.some(e => e.x === x && e.y === y)) {
      cart = new Ent({ id: 'escortcart', x, y, dir: 'down', img: cartImg(), size: 1.4, name: 'Merchant cart', talk: async () => narr(pick(['"Are we nearly there?"', '"Did you hear that? In the trees?"', '"Mind the wheel — it squeaks when it\'s scared. So do I."'])) }); World.ents.push(cart); trail = [p.x, p.y]; return; } }
  }
  async function ambush() {
    const E = ESC(); E.waves++; const pool = fpool(E.to); const en = (ENEMY.bandit ? ['bandit', 'bandit'] : []).concat(pool.slice(0, E.waves));
    await narr(E.waves === 1 ? 'Figures step out of the trees in front of the cart. "That\'s a lot of salt for one merchant…"' : 'Another ambush! They\'ve been following the wheel-ruts.');
    const r = await Battle.start({ enemies: en.slice(0, 3), noFlee: true, bd: SCENES[E.to].bd, intro: 'AMBUSH — WAVE ' + E.waves });
    if (r === 'lose') { S_().escort = null; World.ents = World.ents.filter(e => e !== cart); cart = null; await Story.defeat(); return; }
    save();
  }
  async function arrive() {
    const S = S_(), g = 250; S.escort = null; World.ents = World.ents.filter(e => e !== cart); cart = null; G.S.gold += g; const n = Math.random() < .5 ? rare() : ''; UI.hud(); sfx('level');
    S.escortsDone = (S.escortsDone || 0) + 1;
    await narr(`The merchant nearly cries with relief. "Never again. Never." He pays you ${g} gold${n ? ` — and presses a ${gold$(n)} into your hand. "From the special crate."` : '.'}`); save();
  }

  /* ---------- 6. dungeon echoes ---------- */
  const DECHO = {
    d_fang: ['The den is full of light. A huge white lupine curls round a nest of pups, and a hunter in Accord grey lowers his bow — and walks away.', 'Years pass in a breath. Men come back with nets and fire. The white lupine runs, and the den learns to hate.'],
    d_cinder: ['A wyrmling sleeps in warm coals, small as a dog. A Drag warden sits beside it, humming, feeding it charcoal from his hand.', 'Then the warden is gone — taken in the night — and nobody feeds the fire. It grows hungry. Then it grows.'],
    d_shrine: ['The shrine is dry, full of candles. Guildmasters gather to sign the Accord on its altar.', 'One of them refuses. They hold him under the rising water until the signing is done. The shrine never dries again.'],
    d_vault: ['Drag families hurry through the door with children and books. A captain seals it behind them — from the inside.', '"Until it is safe," she says. The torches burn down. Nobody ever comes to say it is safe.'],
    d_warren: ['Goblin children play with a stolen ball in the tunnels, laughing. A shaman watches, worried.', 'A Guild patrol finds the warren. After that, the goblins only come out at night, and they only take.'],
    d_crypt: ['Inquisitors carry a plain coffin down, quickly, at night. Carved on its lid: a pair of eyes, scratched out.', 'The priest says the words for the dead — then, after the others leave, a different prayer. An older one.'],
    d_mire: ['Miners sing as they swing their picks. One strikes green crystal; it glows like an eye opening.', 'The water comes in through the crack all at once. Something in the deep had been waiting for that door.'],
    d_crystal: ['A quarry crew cuts into a wall of humming crystal. In the crystal, something long and coiled is sleeping.', 'The foreman orders them to cut deeper. The hum changes key.']
  };
  async function dEcho(id) {
    const L = DECHO[id] || ['The stone shows you the lord of this place when it was young — and afraid.', 'Then the dark finds it, and it stops being afraid.'];
    const t0 = World.tint; World.tint = 'rgba(80,140,220,.38)'; banner('ECHO', (DUNGEONS[id] || {}).title || '', 1800); sfx('blip');
    for (const l of L) await narr('<i style="color:#bfe0ff">' + l + '</i>');
    World.tint = t0;
    if (!F()['decho_' + id]) { F()['decho_' + id] = 1; const n = Object.keys(DECHO).filter(k => F()['decho_' + k]).length; toast(`<b style="color:#bfe0ff">DUNGEON ECHO ${n}/${Object.keys(DECHO).length}</b>`, 2200); save(); }
  }

  /* ---------- 7. mount stamina ---------- */
  const stam = () => (S_().mstam = S_().mstam === undefined ? 100 : S_().mstam);
  const riding = () => typeof Mounts !== 'undefined' && Mounts.cur && Mounts.cur() && !(Mounts.flying && Mounts.flying());
  const ladderAt = (sc, x, y) => { if (!W6() || !MK[sc] || !FOREST.includes(sc)) return false; const X = W6().crossings(MK[sc]).l; return !!(X && X.run.some(p => p[0] === x && p[1] === y)); };

  /* ---------- wiring ---------- */
  const _load = World.load.bind(World);
  let made = false;
  World.load = async function (name, ...a) {
    storm = false; crystals = []; cart = null;
    if (!made && G.maps) { made = true; try { makeFallScenes(); } catch (e) { } }
    const r = await _load(name, ...a);
    try {
      if (FOREST.includes(name) && typeof Ambient !== 'undefined' && Ambient.weather === 'rain' && Math.random() < .3) { storm = true; nextBolt = performance.now() + 3000; toast('<b style="color:#d8e8ff">THUNDERSTORM</b> — lightning leaves crystals where it strikes.', 2600); }
      if (name === 'woods' && (S_().rivalWins || 0) >= 2 && night() < .5) { const s = W4().spot('woods', 31); const img = s && await vessaImg(); if (img) { World.col[s[1]][s[0]] = 1; World.ents.push(new Ent({ id: 'vessa', x: s[0], y: s[1], dir: 'down', img, name: 'Vessa Crane', ai: 'turn', talk: vessaTalk, qm: () => V() === 0 || (V() === 1 && (S_().elderWithV || 0) >= 1) ? '!' : null })); } }
      if (DX().includes(name)) {
        const f = fallSpot(name); if (f && SCENES['dfall_' + name]) { World.ents.push(new Ent({ id: 'dfall', x: f[0], y: f[1] - 1, dir: 'down', img: blank(), pickup: 1, name: '', talk: () => enterFall(name) })); World.lights.push({ x: f[0] * TILE + 16, y: (f[1] - 1) * TILE + 16, r: 70, c: '120,200,255' }); }
        const D = G.maps[name].dungeon; if (F()['clear_' + name] && D.boss) { const b = D.boss; let at = null; for (const [dx, dy] of [[0, -2], [2, 0], [-2, 0], [0, 2], [1, -1]]) { const x = b[0] + dx, y = b[1] + dy; if (World.col[y] && World.col[y][x] === 0) { at = [x, y]; break; } }
          if (at) { World.col[at[1]][at[0]] = 1; World.extraProps.push({ k: 'fc_w_rock3', x: at[0], y: at[1] }); World.ents.push(new Ent({ id: 'decho', x: at[0], y: at[1], dir: 'down', img: blank(), pickup: 1, name: '', talk: () => dEcho(name) })); World.lights.push({ x: at[0] * TILE + 16, y: at[1] * TILE, r: 70, c: '110,180,255' }); World.buildPropList(); } }
      }
      if (/^dfall_/.test(name) && !F()['dfallr_' + name.slice(6)]) { const g = FCL[SCENES[name].map].grotto; World.ents.push(new Ent({ id: 'dfallrelic', x: g.stone[0], y: g.stone[1] + 1, dir: 'down', img: Pick.sheet('chest_gold_c'), pickup: 1, name: 'Strongbox', talk: () => fallRelic(name.slice(6)) })); }
      spawnCart(name);
      if (ESC() && name === ESC().to) ESC().steps = 0;
    } catch (e) { console.warn('worldplus7', e); }
    return r;
  };
  const _step = World.onStep.bind(World);
  World.onStep = function (e) {
    const before = trail; const r = _step(e);
    try { if (!e || !e.isPlayer) return r; const sc = G.S.map;
      if (cart && World.ents.includes(cart) && before && !cart.move) { cart.startMove(before[0], before[1], 240); } trail = [e.x, e.y];
      const E = ESC(); if (E && sc === E.to && !World.busy) { E.steps++;
        if ((E.waves === 0 && E.steps === 22) || (E.waves === 1 && E.steps === 55)) Story.run(ambush);
        const c = window.WorldPlus && WorldPlus.CAMPS.find(c => c.scene === E.to && !c.id); if (c && E.waves >= 2 && near([e.x, e.y], c.at, 3)) Story.run(arrive); }
      if (riding() && FOREST.includes(sc)) { const s = stam() - .7; S_().mstam = Math.max(0, s);
        if (ladderAt(sc, e.x, e.y)) { Mounts.ride(null); toast('No mount climbs a rope ladder — you hop off.', 2200); }
        else if (S_().mstam <= 0) { Mounts.ride(null); toast('Your mount is exhausted. Walk a while and let it rest.', 2600); } }
      else if (!riding()) S_().mstam = Math.min(100, stam() + 1.5);
    } catch (x) { }
    return r;
  };
  const _render = World.render.bind(World);
  World.render = function (c, t) {
    _render(c, t);
    try { if (!World.player || World.loading || G.mode !== 'world') return; const now = performance.now();
      if (bloodMoon()) { c.fillStyle = 'rgba(120,0,10,.22)'; c.fillRect(0, 0, c.canvas.width, c.canvas.height); if (bmToast !== Cal.day()) { bmToast = Cal.day(); toast('<b style="color:#ff4a4a">BLOOD MOON</b> — everything in the woods is stronger tonight. And richer.', 3200); } }
      if (storm && !World.busy) { if (now > nextBolt) { bolt(); nextBolt = now + 6000 + Math.random() * 9000; } if (flash > 0) { c.fillStyle = `rgba(235,245,255,${(flash * .7).toFixed(2)})`; c.fillRect(0, 0, c.canvas.width, c.canvas.height); flash = Math.max(0, flash - .08); } }
      const sc = G.S.map;
      if (DX().includes(sc)) { const f = fallSpot(sc); if (f) { const [ox, oy] = cam(), x = f[0] * TILE - ox, y = (f[1] - 2) * TILE - oy; for (let i = 0; i < 6; i++) { const yy = (t / 6 + i * 11) % 64; c.fillStyle = `rgba(180,225,255,${(.35 + .2 * Math.sin(i + t / 90)).toFixed(2)})`; c.fillRect(x + 6 + i * 3.5, y + yy, 2, 10); }
        c.fillStyle = 'rgba(200,235,255,.35)'; c.fillRect(x + 4, y, 24, 64); c.fillStyle = `rgba(230,245,255,${(.4 + .3 * Math.sin(t / 120)).toFixed(2)})`; c.beginPath(); c.ellipse(x + 16, y + 66, 16, 4, 0, 0, 7); c.fill(); } }
      if (riding() && FOREST.includes(sc) && stam() < 100) { const p = World.player, [ox, oy] = cam(), x = p.px - ox - 14, y = p.py - oy - 52; c.fillStyle = 'rgba(0,0,0,.55)'; c.fillRect(x - 1, y - 1, 30, 5); c.fillStyle = stam() > 30 ? '#7adf6a' : '#ff8a4a'; c.fillRect(x, y, 28 * stam() / 100, 3); }
    } catch (e) { }
  };
  W4().boardExtras.push({ label: () => `Field journal (${Object.keys(journal()).length})`, run: journalTalk });
  window.WorldPlus7 = { fallSpot, journal, bloodMoon, get storm() { return storm; }, set storm(v) { storm = v; }, bolt, get cart() { return cart; }, baseOf, DX };
})();
