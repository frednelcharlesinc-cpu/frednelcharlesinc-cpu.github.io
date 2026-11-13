'use strict';
/* ================= WORLD+ 2 (Chat B — World & Maps) =================
   1. WEATHER WITH A MOOD — each forest leans toward its own weather: rain & fog in Glimmerfen, wind & leaves in the
      Old Grove, falling ash in Emberroot (Mistveil keeps its snow & blizzards).
   2. FOOTPRINTS — Ren leaves tracks in Mistveil's snow and Glimmerfen's mud; they fade after a while.
   3. SOUND — waterfalls roar louder as you get close, wind hisses through the pines, frogs sing in the fen at night,
      campfires crackle. (All synthesized; follows the sound setting.)
   4. GROTTOS BEHIND THE FALLS — the cliff behind every waterfall hides a cave: chests and a lore stone.
   5. ROAMING MONSTERS — beasts you can SEE wander the woods. Close in and they come for you; slip past or fight.
      Beaten ones come back after a while.
   6. THE DRAG CHRONICLE — 12 lore stones across the four woods and their grottos. Every 4 found: a reward.
   (Lore text drafted by B; Chat A may rewrite it — it's in LORE below.) */
(function () {
  const MK = { woods: 'fc_cross', woods_n: 'fc_north', woods_e: 'fc_east', woods_s: 'fc_south', woods_w: 'fc_west' };
  const GROTTO = { woods_n: ['grotto_n', 'fc_grotto_n'], woods_e: ['grotto_e', 'fc_grotto_e'], woods_s: ['grotto_s', 'fc_grotto_s'], woods_w: ['grotto_w', 'fc_grotto_w'] };
  const F = () => G.S.f, S_ = () => G.S;
  const blank = (() => { let S; return () => { if (S) return S; S = document.createElement('canvas'); S.width = 64 * 9; S.height = 64 * 12; return S; }; })();
  const near = (a, b, d) => Math.abs(a.x - b.x) + Math.abs(a.y - b.y) <= d;

  /* ---------- 1. weather moods ---------- */
  const MOOD = { woods_s: [['rain', 5], ['fog', 3], ['clear', 2]], woods_w: [['wind', 5], ['clear', 3], ['fog', 1]], woods_e: [['clear', 4], ['wind', 2]], woods: [['clear', 4], ['wind', 1], ['rain', 1], ['fog', 1]] };
  function moodWeather(scene) {
    if (typeof Ambient === 'undefined' || !MOOD[scene] || !Ambient.outdoors || !Ambient.outdoors()) return;
    const o = MOOD[scene], tot = o.reduce((s, x) => s + x[1], 0); let r = Math.random() * tot, k = 'clear';
    for (const [n, w] of o) if ((r -= w) < 0) { k = n; break; }
    if (Ambient.weather !== k) { Ambient.weather = k; Ambient.wFade = 0; }
    Ambient.wNext = (G.t || performance.now()) + 120000 + Math.random() * 80000;
  }
  let ash = [];
  function drawAsh(c, t) {
    if (G.S.map !== 'woods_e') return;
    const w = G.view.w, h = G.view.h;
    while (ash.length < 46) ash.push({ x: Math.random() * w, y: Math.random() * h, s: .4 + Math.random() * .9, p: Math.random() * 6, hot: Math.random() < .3 });
    for (const a of ash) {
      a.y += .35 * a.s; a.x += Math.sin(t / 900 + a.p) * .3 + .15; if (a.y > h + 4) { a.y = -4; a.x = Math.random() * w; } if (a.x > w + 4) a.x = -4;
      c.fillStyle = a.hot ? `rgba(255,${140 + (a.p * 20 | 0)},60,${(.5 + .4 * Math.sin(t / 200 + a.p)).toFixed(2)})` : 'rgba(80,70,64,.55)';
      c.fillRect(a.x, a.y, a.hot ? 2 : 2, a.hot ? 2 : 1);
    }
  }

  /* ---------- 2. footprints ---------- */
  let prints = [];
  const PRINT = { woods_n: 'rgba(120,140,165,', woods_s: 'rgba(30,24,14,' };
  function stepPrint(p) {
    if (!PRINT[G.S.map]) return;
    const M = World.map; if (!M || !M.mm || !M.mm[p.y] || !'gtp'.includes(M.mm[p.y][p.x])) return;
    prints.push({ x: p.px, y: p.py - 2, d: p.dir, t: performance.now(), side: prints.length % 2 });
    if (prints.length > 60) prints.shift();
  }
  if (typeof Ambient !== 'undefined' && Ambient.ground) {
    const _g = Ambient.ground.bind(Ambient);
    Ambient.ground = function (c, cx, cy, t, w, h) {
      try {
        const base = PRINT[G.S.map];
        if (base) for (const f of prints) {
          const age = (performance.now() - f.t) / 1000; if (age > 40) continue;
          const a = .45 * (1 - age / 40), o = f.side ? 3 : -3, horiz = f.d === 'left' || f.d === 'right';
          c.fillStyle = base + a.toFixed(2) + ')';
          c.beginPath(); c.ellipse(f.x - cx + (horiz ? 0 : o), f.y - cy + (horiz ? o * .6 : 0), horiz ? 3 : 2, horiz ? 2 : 3, 0, 0, 7); c.fill();
        }
      } catch (e) { }
      return _g(c, cx, cy, t, w, h);
    };
  }

  /* ---------- 3. sound ---------- */
  const SND = { on: false };
  function noiseBuf(ac) { const b = ac.createBuffer(1, ac.sampleRate * 2, ac.sampleRate), d = b.getChannelData(0); let l = 0; for (let i = 0; i < d.length; i++) { l = (l + .02 * (Math.random() * 2 - 1)) / 1.02; d[i] = l * 3.5 + (Math.random() * 2 - 1) * .15; } return b; }
  function soundInit() {
    if (SND.on || typeof AC === 'undefined' || !AC) return;
    try {
      const nb = noiseBuf(AC), mk = (type, f, q) => { const s = AC.createBufferSource(); s.buffer = nb; s.loop = true; const fl = AC.createBiquadFilter(); fl.type = type; fl.frequency.value = f; if (q) fl.Q.value = q; const g = AC.createGain(); g.gain.value = 0; s.connect(fl).connect(g).connect(AC.destination); s.start(); return g; };
      SND.fall = mk('lowpass', 900); SND.wind = mk('bandpass', 420, .6); SND.on = true;
    } catch (e) { }
  }
  const FALLS = /^fc_[nesw]fall$/;
  let lastCroak = 0, lastCrack = 0;
  function soundTick(t) {
    if (!SND.on) { soundInit(); if (!SND.on) return; }
    const play = G.settings.sfx && G.mode === 'world' && MK[G.S.map] && World.player && !World.loading, p = World.player;
    let fall = 0;
    if (play) for (const pr of (World.map.props || [])) if (FALLS.test(pr.k)) { const d = Math.hypot(pr.x + .5 - p.x, pr.y - 2 - p.y); fall = Math.max(fall, Math.max(0, 1 - d / 13)); }
    const wind = play ? ({ woods_n: .05, woods_w: .02, woods: .015 }[G.S.map] || .008) * (typeof Ambient !== 'undefined' && Ambient.weather === 'wind' ? 2.2 : 1) * (typeof Weather !== 'undefined' && Weather.kind === 'blizzard' && G.S.map === 'woods_n' ? 3 : 1) : 0;
    SND.fall.gain.setTargetAtTime(play ? fall * fall * .16 : 0, AC.currentTime, .3);
    SND.wind.gain.setTargetAtTime(wind, AC.currentTime, .6);
    if (!play) return;
    const nt = typeof Ambient !== 'undefined' ? Ambient.night : 0;
    if (G.S.map === 'woods_s' && nt > .4 && t - lastCroak > 1400 + Math.random() * 2600) { lastCroak = t; blip(140 + Math.random() * 60, .09, 'square', .025, 4); }
    const fire = (World.lights || []).some(L => !L.follow && Math.hypot(L.x - p.px, L.y - p.py) < 90 && /255,1[0-9]{2}/.test(L.c));
    if (fire && t - lastCrack > 90 + Math.random() * 400) { lastCrack = t; crackle(); }
  }
  function blip(f, dur, type, vol, n) {
    try { for (let i = 0; i < (n || 1); i++) { const o = AC.createOscillator(), g = AC.createGain(), t0 = AC.currentTime + i * dur * .9; o.type = type; o.frequency.setValueAtTime(f * (i % 2 ? .82 : 1), t0); g.gain.setValueAtTime(vol, t0); g.gain.exponentialRampToValueAtTime(.0001, t0 + dur); o.connect(g).connect(AC.destination); o.start(t0); o.stop(t0 + dur); } } catch (e) { }
  }
  function crackle() {
    try { const b = AC.createBuffer(1, AC.sampleRate * .03, AC.sampleRate), d = b.getChannelData(0); for (let i = 0; i < d.length; i++) d[i] = (Math.random() * 2 - 1) * (1 - i / d.length); const s = AC.createBufferSource(), g = AC.createGain(); s.buffer = b; g.gain.value = .05 + Math.random() * .05; s.connect(g).connect(AC.destination); s.start(); } catch (e) { }
  }

  /* ---------- 4. grottos behind the falls ---------- */
  const GD = mk => FCL[mk] && FCL[mk].grotto;
  for (const [scene, [gs, gmk]] of Object.entries(GROTTO)) {
    const sec = FCL[MK[scene]].secret[0]; if (!sec) continue;
    const back = [sec[0] - 1, sec[1]];   // the ledge tile in front of the opening
    const g = GD(gmk);
    SCENES[gs] = { title: 'Behind the Falls', subtitle: SCENES[scene].subtitle, map: gmk, music: 'woods', noAmbient: 1, interior: 1,
      setup(W) { W.tint = 'rgba(4,10,16,.48)'; W.lights.push({ x: g.stone[0] * TILE + 16, y: g.stone[1] * TILE, r: 120, c: '110,255,170' }, { x: 11 * TILE + 16, y: 13 * TILE, r: 90, c: '200,230,255' }); },
      npcs() { return []; }, exits: [{ x: g.exit[0], y: g.exit[1], to: scene, tx: back[0], ty: back[1], dir: 'down' }] };
    G.__grottoDoor = G.__grottoDoor || {}; G.__grottoDoor[scene] = { at: [back[0], back[1] - 1], back, gs, start: g.start };
  }
  async function enterGrotto(scene) {
    const d = G.__grottoDoor[scene];
    if (!F()['grotto_' + scene]) { await narr('Behind the curtain of falling water, the cliff is hollow. A narrow crack leads into the dark — just wide enough to squeeze through.'); F()['grotto_' + scene] = 1; toast('<b style="color:#9fd8ff">HIDDEN GROTTO</b> found behind the falls.', 2600); save(); }
    await World.go(d.gs, d.start[0], d.start[1], 'up');
  }

  /* ---------- 5. roaming monsters ---------- */
  let roamT = 0;
  async function spawnRoamers(W, scene) {
    const M = W.map, S = S_(); S.roamKO = S.roamKO || {};
    const sc = SCENES[scene]; if (!sc || !sc.encounters || scene === 'woods') return;
    const spots = (M.grass || []).filter(([x, y]) => M.col[y] && M.col[y][x] === '0'); if (!spots.length) return;
    for (let i = 0; i < 3; i++) {
      const k = scene + i; if (S.roamKO[k] && (S.steps || 0) - S.roamKO[k] < 350) continue;
      let enc; try { enc = sc.encounters(); } catch (e) { continue; } const lead = enc && enc.enemies && enc.enemies[0]; if (!lead || !ENEMY[lead]) continue;
      const [x, y] = spots[Math.floor(((i + 1) * 7919 + (S.steps || 0)) % spots.length)];
      if (Math.abs(x - W.player.x) + Math.abs(y - W.player.y) < 8 || W.ents.some(e => e.x === x && e.y === y)) continue;
      let img; try { img = await npcImg(ENEMY[lead].img || lead); } catch (e) { continue; }
      W.ents.push(new Ent({ id: 'roam_' + i, x, y, dir: 'down', img, size: Math.min(1.4, (ENEMY[lead].size || 1) * .95), name: ENEMY[lead].name, ai: 'wander', area: [x - 5, y - 5, x + 5, y + 5], roam: { k, enc } }));
    }
  }
  function chase() {
    const p = World.player; if (!p || World.busy || G.mode !== 'world') return;
    for (const e of World.ents) {
      if (!e.roam || e.move) continue;
      const d = Math.abs(e.x - p.x) + Math.abs(e.y - p.y);
      if (d <= 1) { fight(e); return; }
      const sight = typeof Ambient !== 'undefined' && Ambient.weather === 'fog' ? 3 : (typeof Weather !== 'undefined' && Weather.kind === 'blizzard' && G.S.map === 'woods_n' ? 3 : 5);
      if (d <= sight) {   // it has your scent: one step closer (fog and blizzards blind them too)
        const opts = [[1, 0], [-1, 0], [0, 1], [0, -1]].map(([a, b]) => [e.x + a, e.y + b]).filter(([x, y]) => World.free(x, y, e))
          .sort((a, b) => (Math.abs(a[0] - p.x) + Math.abs(a[1] - p.y)) - (Math.abs(b[0] - p.x) + Math.abs(b[1] - p.y)));
        if (opts.length) { e.wait = 600; e.startMove(opts[0][0], opts[0][1], 230); if (!e.bubble && Math.random() < .3) e.say('!', 700); }
      }
    }
  }
  let fighting = false;
  function fight(e) {
    if (fighting) return; fighting = true;
    Story.run(async () => {
      try {
        const r = await Battle.start(Object.assign({}, e.roam.enc, { intro: 'IT SPOTTED YOU' }));
        if (r === 'lose') { await Story.defeat(); return; }
        if (r === 'win' || r === 'flee') { S_().roamKO = S_().roamKO || {}; S_().roamKO[e.roam.k] = S_().steps || 0; World.ents = World.ents.filter(n => n !== e); }
      } finally { fighting = false; }
    });
  }

  /* ---------- 6. the Drag Chronicle: 12 lore stones ---------- */
  const LORE = [
    'I. Before the empires, the Drags were not hunted. They were the shield. Green-eyed, sleepless, perfect in the body — the old kings bred them to stand at the front.',
    'II. A Drag does not learn to dodge. A Drag is born knowing where the blade will be. That is why they were feared, long before anyone said the word "demon".',
    'III. The scholars say Fratenaptor made the Drags. The Drags say they were here first, and Fratenaptor came to them hungry.',
    'IV. Even the dragons hated Fratenaptor. It ate its own kind. The great wyrms flew three hundred leagues to bury it — and failed.',
    'V. When Fratenaptor fell, its blood fell with it, green as spring leaves. The kings needed someone to blame. The Drags had green eyes.',
    'VI. The first law against the Drags was a kindness, said the kings: "for their protection", they were to live apart. The second law took their swords.',
    'VII. The warriors who would not kneel went into the woods. The Old Grove remembers their names even where the stones have been chiseled.',
    'VIII. A Drag pushed past the edge of death does not die. Something older wakes. Our fathers called it Transcension, and taught their children to fear it.',
    'IX. The first stage is the warrior. The second is the beast. Of the third, the carvings say only: "the sky burned, and we were not afraid."',
    'X. The guilds were built to hunt what lives in the Gates. The Accord that bound them was signed in a shrine now under water — and its second page named the Drags.',
    'XI. Green Eclipse is not the first name for a Drag who fights back. It will not be the last.',
    'XII. If you are reading this with green eyes, child: you are not what they say. You are what they were afraid you would remember.'
  ];
  function stoneSpots(scene) {
    const mk = MK[scene], M = G.maps[mk]; if (!M || !M.mm) return [];
    if (M.__stones) return M.__stones;
    const caches = (window.WorldPlus && WorldPlus.cacheSpots(scene)) || [], fcl = FCL[mk];
    const taken = new Set([...caches, ...Object.values(fcl.npc).map(p => [p[0], p[1]]), ...fcl.chests].map(p => p[0] + ',' + p[1]));
    const cand = [];
    for (let y = 5; y < M.h - 5; y++) for (let x = 5; x < M.w - 5; x++) {
      if (M.mm[y][x] !== 'g' || M.col[y][x] !== '0' || taken.has(x + ',' + y)) continue;
      const nearPath = [[1, 0], [-1, 0], [0, 1], [0, -1]].some(([a, b]) => M.mm[y + b] && 'p'.includes(M.mm[y + b][x + a]));
      const free = [[1, 0], [-1, 0], [0, 1], [0, -1]].filter(([a, b]) => M.col[y + b] && M.col[y + b][x + a] === '0').length;
      if (nearPath && free >= 3) cand.push([x, y]);
    }
    let seed = mk.length * 131 + 7; const r = () => (seed = (seed * 1103515245 + 12345) >>> 0) / 4294967296;
    const out = [];
    for (let i = 0; i < 2 && cand.length; i++) { let best = null, bd = -1; for (let k = 0; k < 80; k++) { const c = cand[Math.floor(r() * cand.length)]; const d = out.length ? Math.abs(out[0][0] - c[0]) + Math.abs(out[0][1] - c[1]) : 99; if (d > bd) { bd = d; best = c; } } out.push(best); }
    return (M.__stones = out);
  }
  const ORDER = ['woods_n', 'woods_e', 'woods_s', 'woods_w'];
  const loreIndex = (scene, i, grotto) => grotto ? 8 + ORDER.indexOf(scene) : ORDER.indexOf(scene) * 2 + i;
  async function readStone(idx) {
    const S = S_(); S.lore12 = S.lore12 || [];
    await narr(LORE[idx]);
    if (!S.lore12.includes(idx)) {
      S.lore12.push(idx); const n = S.lore12.length; sfx('level');
      toast(`<b style="color:#46ff95">THE DRAG CHRONICLE</b> — stone ${n}/12`, 2800);
      if (n % 4 === 0) {
        G.S.gold += 150 * (n / 4); let extra = '';
        if (typeof PARTS !== 'undefined' && typeof Gear !== 'undefined') { const rare = Object.keys(PARTS).filter(p => PARTS[p].rare); const pk = rare[Math.floor(Math.random() * rare.length)]; if (pk) { Gear.give(pk, 1); extra = ` and a <b style="color:#ffd36a">${PARTS[pk].n}</b>`; } }
        if (n === 12 && typeof Gear !== 'undefined') { const st = Gear.st(); st.gear.own.dustcharm = (st.gear.own.dustcharm || 0) + 1; extra += ', and the <b style="color:#ffd36a">Dust Charm</b>'; }
        UI.hud(); await narr(`${n === 12 ? 'The whole Chronicle is yours. ' : ''}Something in your blood answers the stones. You find ${150 * (n / 4)} gold${extra} tucked beneath the last one.`);
      }
      save();
    }
  }

  /* ---------- wiring ---------- */
  const _load = World.load.bind(World);
  World.load = async function (name, ...a) {
    prints = []; const r = await _load(name, ...a);
    try {
      if (MK[name]) {
        moodWeather(name);
        const door = G.__grottoDoor && G.__grottoDoor[name];
        if (door && !World.ents.some(e => e.id === 'grotto')) World.ents.push(new Ent({ id: 'grotto', x: door.at[0], y: door.at[1], dir: 'down', img: blank(), pickup: 1, name: '', talk: () => enterGrotto(name) }));
        if (ORDER.includes(name)) stoneSpots(name).forEach(([x, y], i) => {
          World.extraProps.push({ k: 'fc_w_rock3', x, y }); if (World.col[y]) World.col[y][x] = 1;
          World.ents.push(new Ent({ id: 'lore_' + i, x, y, dir: 'down', img: blank(), pickup: 1, name: '', talk: () => readStone(loreIndex(name, i)) }));
          World.lights.push({ x: x * TILE + 16, y: y * TILE, r: 60, c: '110,210,255' });
        });
        World.buildPropList();
        await spawnRoamers(World, name);
      }
      const gs = Object.entries(GROTTO).find(([, v]) => v[0] === name);
      if (gs) {
        const g = GD(gs[1][1]);
        World.extraProps.push({ k: 'fc_n_rock1', x: g.stone[0], y: g.stone[1] }); if (World.col[g.stone[1]]) World.col[g.stone[1]][g.stone[0]] = 1;
        World.ents.push(new Ent({ id: 'lore_g', x: g.stone[0], y: g.stone[1], dir: 'down', img: blank(), pickup: 1, name: '', talk: () => readStone(loreIndex(gs[0], 0, true)) }));
        World.buildPropList();
      }
    } catch (e) { console.warn('worldplus2', e); }
    return r;
  };
  const _step = World.onStep.bind(World);
  World.onStep = function (e) { const r = _step(e); try { if (e && e.isPlayer) { stepPrint(e); chase(); } } catch (x) { } return r; };
  const _render = World.render.bind(World);
  World.render = function (c, t) {
    _render(c, t);
    try {
      if (!World.player || World.loading) return;
      if (MK[G.S.map]) drawAsh(c, t);
      if (t - roamT > 250) { roamT = t; if (MK[G.S.map]) chase(); }
      soundTick(t);
    } catch (e) { }
  };
  window.WorldPlus2 = { LORE, stoneSpots, prints: () => prints };
})();
