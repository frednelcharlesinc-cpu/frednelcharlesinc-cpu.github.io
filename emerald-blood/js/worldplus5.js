'use strict';
/* ================= WORLD+ 5 (Chat B — World & Maps) =================
   1. HUNTING HORN — buy it at the wanted board. Blow it at a forest campfire and something big answers.
   2. TRACKS — in Mistveil's snow and Glimmerfen's mud, your bounty mark follows your footprints to you.
   3. THE SHRINE CHAIN — a broken shrine in each forest. Restore all four (and the Crossroads Wayshrine) and a stair
      opens under the Wayshrine: the Sunken Sanctum, its Keeper, and what it guards.
   4. DUNGEON MAPS — the board sells one map a week. A red X in one of the dungeons; dig there.
   5. FOG WISPS — only in fog. A small light that waits for you, then drifts off. Follow it.
   (Bounty ranks live in worldplus4 — Copper → Mithril, elder marks, the Hunter's Mantle.)
   (Homestead visitors are on hold until the player guild exists.) */
(function () {
  const W4 = () => window.WorldPlus4;
  const MK = { woods: 'fc_cross', woods_n: 'fc_north', woods_e: 'fc_east', woods_s: 'fc_south', woods_w: 'fc_west' };
  const FOREST = ['woods_n', 'woods_e', 'woods_s', 'woods_w'];
  const S_ = () => G.S, F = () => G.S.f;
  const week = () => Math.floor(((typeof Cal !== 'undefined' ? Cal.day() : 1) - 1) / 7);
  const sheet = draw => { const one = document.createElement('canvas'); one.width = one.height = 64; const x = one.getContext('2d'); draw(x); const S = document.createElement('canvas'); S.width = 64 * 9; S.height = 64 * 12; const s = S.getContext('2d'); for (let r = 0; r < 12; r++) for (let f = 0; f < 9; f++) s.drawImage(one, f * 64, r * 64); return S; };
  const R = (x, c, a, b, w, h) => { x.fillStyle = c; x.fillRect(a, b, w, h); };
  const blank = (() => { let S; return () => S || (S = sheet(() => { })); })();
  const rare = () => W4().giveRare();
  const gold$ = n => `<b style="color:#ffd36a">${n}</b>`;
  const tone = (f0, f1, dur, vol) => { try { if (!G.settings.sfx) return; const o = AC.createOscillator(), g = AC.createGain(), t = AC.currentTime; o.type = 'sawtooth'; o.frequency.setValueAtTime(f0, t); o.frequency.linearRampToValueAtTime(f1, t + dur * .7); g.gain.setValueAtTime(.0001, t); g.gain.exponentialRampToValueAtTime(vol, t + .15); g.gain.exponentialRampToValueAtTime(.0001, t + dur); const lp = AC.createBiquadFilter(); lp.type = 'lowpass'; lp.frequency.value = 900; o.connect(lp); lp.connect(g); g.connect(AC.destination); o.start(t); o.stop(t + dur); } catch (e) { } };
  // BFS distance map over the live collision grid
  function distFrom(tx, ty, maxD) {
    const C = World.col, D = new Map([[tx + ',' + ty, 0]]), q = [[tx, ty]];
    while (q.length) { const [a, b] = q.shift(), d = D.get(a + ',' + b); if (maxD && d >= maxD) continue;
      for (const [dx, dy] of [[1, 0], [-1, 0], [0, 1], [0, -1]]) { const x = a + dx, y = b + dy, k = x + ',' + y; if (!D.has(k) && C[y] && C[y][x] === 0) { D.set(k, d + 1); q.push([x, y]); } } }
    return D;
  }
  const stepDown = (D, x, y, fly) => { let best = null, bd = D.get(x + ',' + y); if (bd === undefined) bd = 1e9;
    for (const [dx, dy] of [[1, 0], [-1, 0], [0, 1], [0, -1]]) { const d = D.get((x + dx) + ',' + (y + dy)); if (d !== undefined && d < bd && (fly || !World.ents.some(e => e.x === x + dx && e.y === y + dy))) { bd = d; best = [x + dx, y + dy]; } }
    return best; };

  /* ---------- 1. hunting horn ---------- */
  const hasHorn = () => !!S_().horn;
  W4().boardExtras.push({ label: 'Buy a hunting horn — 150g', show: () => !hasHorn(), run: async () => {
    if (await W4().pay(150, 'A ram\'s-horn hunting horn')) { S_().horn = 1; await narr('A curled ram\'s horn bound in brass. "Blow it at a campfire in the woods," says the keeper. "Then don\'t be surprised by what comes."'); save(); }
  } });
  async function blowHorn(scene) {
    const S = S_(), since = (S.steps || 0) - (S.hornAt || -9999);
    if (since < 250) { await narr(`Your lungs are still burning from the last call. (Walk ${250 - since} more steps.)`); return; }
    S.hornAt = S.steps || 0; tone(150, 110, 1.6, .18); setTimeout(() => tone(150, 190, 1.2, .14), 900);
    await narr('You blow the horn. The note rolls out over the trees… and, far off, something answers.');
    let pool = []; try { pool = (SCENES[scene].encounters && SCENES[scene].encounters().enemies) || []; } catch (e) { }
    if (!pool.length) pool = ['lupine_alpha'];
    const keys = pool.slice(0, 3).filter(k => ENEMY[k]).map(k => { const B = ENEMY[k], key = 'horn_' + k; if (!ENEMY[key]) ENEMY[key] = Object.assign({}, B, { name: 'Horn-called ' + B.name, img: B.img || k, hp: Math.round(B.hp * 1.8), atk: Math.round(B.atk * 1.15), xp: Math.round((B.xp || 10) * 2.5), gold: Math.round((B.gold || 5) * 2), size: Math.max(1.15, B.size || 1) }); return key; });
    const r = await Battle.start({ enemies: keys, noFlee: true, bd: SCENES[scene].bd, intro: 'IT ANSWERS THE HORN' });
    if (r === 'lose') { await Story.defeat(); return; }
    if (r === 'win') { const n = Math.random() < .55 ? rare() : ''; if (n) { sfx('level'); await narr(`Among the bones: a ${gold$(n)}.`); } save(); }
  }
  function hookHorn() {
    if (!window.WorldPlus) return;
    for (const c of WorldPlus.CAMPS) {
      if (c.id || !FOREST.includes(c.scene)) continue;
      const T = SCENES[c.scene] && SCENES[c.scene].tiles; if (!T) continue;
      const key = c.at[0] + ',' + c.at[1], prev = T[key]; if (!prev) continue;
      T[key] = async () => {
        if (!hasHorn()) return prev();
        const ch = await ask(null, null, 'The campfire crackles.', ['Rest / travel', 'Blow the hunting horn', 'Leave']);
        if (ch === 0) return prev(); if (ch === 1) return blowHorn(c.scene);
      };
    }
  }

  /* ---------- 2. tracks in snow and mud ---------- */
  const TRACK = { woods_n: 'snow', woods_s: 'mud' };
  let trackT = 0, trackOn = false;
  function trackTick(now) {
    const h = W4().hunted, p = World.player;
    if (!h || !TRACK[G.S.map] || !World.ents.includes(h) || World.busy || G.mode !== 'world' || h.move) return;
    const d = Math.abs(h.x - p.x) + Math.abs(h.y - p.y);
    if (d <= 1) { if (!h.__fighting) { h.__fighting = 1; Story.run(async () => { try { await W4().huntFight(h.__b, h.__k); } finally { h.__fighting = 0; } }); } return; }
    if (d > 16) { if (trackOn) { h.ai = 'wander'; trackOn = false; } return; }
    if (!trackOn) { trackOn = true; h.ai = 'track'; toast(`<b style="color:#ff6a4a">${h.name.toUpperCase()}</b> has found your tracks in the ${TRACK[G.S.map]}…`, 2800); }
    if (now < trackT) return; trackT = now + 520;
    const nx = stepDown(distFrom(p.x, p.y, 20), h.x, h.y); if (nx) h.startMove(nx[0], nx[1], 320);
  }

  /* ---------- 3. the shrine chain & the Sunken Sanctum ---------- */
  const SHR = sc => W4().spot(sc, 909);
  const shrineImg = fixed => sheet(x => {
    R(x, 'rgba(0,0,0,.3)', 12, 58, 40, 4);
    if (fixed) { R(x, '#9a9a8a', 14, 50, 36, 8); R(x, '#b4b4a2', 14, 50, 36, 2); R(x, '#8a8a7a', 20, 22, 6, 28); R(x, '#8a8a7a', 38, 22, 6, 28); R(x, '#a8a896', 16, 16, 32, 7); R(x, '#c4c4b0', 16, 16, 32, 2);
      R(x, '#6a5040', 28, 38, 8, 12); R(x, '#ffd890', 30, 32, 4, 6); R(x, '#fff4c8', 31, 33, 2, 3); R(x, '#4a8ad8', 27, 44, 10, 3); }
    else { R(x, '#7a7a6a', 14, 52, 36, 6); R(x, '#6a6a5a', 20, 34, 6, 18); R(x, '#6a6a5a', 38, 42, 6, 10); R(x, '#5a5a4c', 26, 50, 10, 4); R(x, '#4a6a3a', 16, 50, 6, 3); R(x, '#4a6a3a', 40, 40, 4, 3); R(x, '#5a5a4c', 44, 54, 6, 3); }
  });
  const restored = () => FOREST.filter(sc => F()['shrine_' + sc]).length;
  const chainDone = () => restored() === 4 && F().ruin_woods;
  async function shrineTalk(sc) {
    if (F()['shrine_' + sc]) { Story.heal(); await narr(`The little shrine's lamp burns steady. You feel rested. (${restored()}/4 forest shrines restored.)`); return; }
    await narr('A wayside shrine, toppled and overgrown. The same carving as the Crossroads altar is cut into its base: four lines meeting in a circle.');
    if (!(await W4().pay(250, 'Restore the shrine'))) return;
    F()['shrine_' + sc] = 1; sfx('heal');
    await narr(`You set the stones straight and light the lamp. (${restored()}/4 forest shrines restored.)`);
    if (restored() === 4) { await narr('As the fourth lamp catches, the ground shivers. Far away — toward the Crossroads — stone grinds against stone.'); toast('<b style="color:#9fd8ff">Something opened at the Crossroads Wayshrine.</b>', 3200); }
    save(); await World.go(sc, World.player.x, World.player.y, World.player.dir);
  }
  // the stair under the Wayshrine
  function hookStair() {
    const T = SCENES.woods && SCENES.woods.tiles; if (!T) return;
    for (const k of Object.keys(T)) if (/ruined shrine, older than Ashford/.test(String(T[k]))) {
      const prev = T[k];
      T[k] = async () => {
        if (!chainDone()) return prev();
        const ch = await ask(null, null, 'The Wayshrine. Behind the altar, a stair you never saw before goes down into blue light.', ['Rest at the shrine', 'Take the stair down', 'Leave']);
        if (ch === 0) return prev(); if (ch === 1) { const g = FCL.fc_grotto_w.grotto; await World.go('sanctum', g.start[0], g.start[1], 'up'); banner('THE SUNKEN SANCTUM', 'Under the four roads', 2400); }
      };
      T[k].toString = () => String(prev);
    }
  }
  const SG = FCL.fc_grotto_w && FCL.fc_grotto_w.grotto;
  if (SG) SCENES.sanctum = { title: 'The Sunken Sanctum', subtitle: 'Under the four roads', map: 'fc_grotto_w', music: 'woods', noAmbient: 1, interior: 1, bd: 'd_shrine',
    setup(W) { W.tint = 'rgba(10,18,40,.55)'; W.lights.push({ x: SG.stone[0] * TILE + 16, y: SG.stone[1] * TILE, r: 150, c: '120,180,255' }, { x: SG.start[0] * TILE + 16, y: SG.start[1] * TILE, r: 90, c: '255,220,150' }); },
    npcs() { return []; }, exits: [{ x: SG.exit[0], y: SG.exit[1], to: 'woods', tx: 37, ty: 14, dir: 'down' }] };
  async function keeperFight() {
    const B = ENEMY.m_minotaur || ENEMY.m_troll; if (!B) return;
    if (!ENEMY.sanct_keeper) ENEMY.sanct_keeper = Object.assign({}, B, { name: 'The Wardstone Keeper', img: B.img || (ENEMY.m_minotaur ? 'm_minotaur' : 'm_troll'), boss: 1, hp: Math.round(B.hp * 3.4), atk: Math.round(B.atk * 1.25), def: (B.def || 0) + 3, brk: Math.round((B.brk || 60) * 1.8), xp: Math.round((B.xp || 40) * 5), gold: Math.round((B.gold || 20) * 4), size: 1.8, trait: 'Guardian of the four roads' });
    await narr('A shape of moss and old stone rises from the altar, a lamp burning in its chest. "FOUR ROADS. ONE KEEPER. PROVE YOU WALKED THEM."');
    const r = await Battle.start({ enemies: ['sanct_keeper'], boss: true, noFlee: true, bd: 'd_shrine', music: 'boss', intro: 'THE WARDSTONE KEEPER' });
    if (r === 'lose') { await Story.defeat(); return; }
    if (r !== 'win') return;
    F().sanctum = 1; World.ents = World.ents.filter(e => e.id !== 'keeper');
    const S = Gear.st(), pool = Object.values(FCL).filter(d => d.dx).flatMap(d => [d.dx.gear, d.dx.gear2]).filter(g => g && RECIPES[g] && !S.gear.own[g]);
    const gear = pool[Math.floor(Math.random() * pool.length)]; if (gear) S.gear.own[gear] = (S.gear.own[gear] || 0) + 1;
    G.S.gold += 600; const a = rare(), b = rare(), c = rare(); UI.hud(); sfx('level');
    await narr(`The Keeper crumbles. In the altar's hollow: 600 gold${a ? `, a ${gold$(a)}` : ''}${b ? `, a ${gold$(b)}` : ''}${c ? `, a ${gold$(c)}` : ''}${gear ? `, and ${gold$(RECIPES[gear].n)}` : ''}.`);
    await narr('Carved inside the hollow, newer than the rest: THE ROADS WERE MADE TO KEEP SOMETHING OUT. NOT IN.'); save();
  }

  /* ---------- 4. dungeon treasure maps ---------- */
  const DUN = () => Object.keys(typeof DUNGEONS !== 'undefined' ? DUNGEONS : {}).filter(id => G.maps[id] && G.maps[id].dungeon && G.maps[id].col);
  function dmapSpot(id, w) {
    const M = G.maps[id], D = M.dungeon, key = id + ':' + w; M.__dm = M.__dm || {}; if (M.__dm[key]) return M.__dm[key];
    const hidden = new Set(((FCL[id] && FCL[id].dx && FCL[id].dx.regions) || []).flat().map(p => p[0] + ',' + p[1]));
    const avoid = (D.chests || []).concat(D.start ? [D.start] : []);
    const seen = new Map([[D.start[0] + ',' + D.start[1], 0]]), q = [D.start], cand = [];
    while (q.length) { const [a, b] = q.shift(), d = seen.get(a + ',' + b); if (d > 25 && !hidden.has(a + ',' + b) && !avoid.some(p => Math.abs(p[0] - a) + Math.abs(p[1] - b) < 4)) cand.push([a, b]);
      for (const [dx, dy] of [[1, 0], [-1, 0], [0, 1], [0, -1]]) { const x = a + dx, y = b + dy, k = x + ',' + y; if (!seen.has(k) && M.col[y] && M.col[y][x] === '0' && !hidden.has(k)) { seen.set(k, d + 1); q.push([x, y]); } } }
    let s = (w + 1) * 2654435761 + id.length * 97; s = s >>> 0; return (M.__dm[key] = cand[s % Math.max(1, cand.length)] || null);
  }
  const dmap = () => { const S = S_(); return S.dmap && S.dmap.week === week() ? S.dmap : null; };
  W4().boardExtras.push({ label: () => 'Buy this week\'s dungeon map — 250g', show: () => !dmap() && DUN().length > 0, run: async () => {
    const L = DUN(), id = L[week() % L.length];
    if (!(await W4().pay(250, 'A scorched treasure map'))) return;
    S_().dmap = { week: week(), id, dug: 0 };
    await narr(`The map shows a passage in ${DUNGEONS[id].title}, with an X inked in red. A red X will show on your map once you're inside.`); save();
  } });
  async function digDungeon() {
    const m = dmap(); if (!m || m.dug) return; m.dug = 1; World.ents = World.ents.filter(e => e.id !== 'dmap');
    const g = 300 + Math.floor(Math.random() * 220); G.S.gold += g; const a = rare(), b = rare(); UI.hud(); sfx('level');
    await narr(`You pry up the loose flagstone. A rotted pack, and inside: ${g} gold${a ? `, a ${gold$(a)}` : ''}${b ? ` and a ${gold$(b)}` : ''}.`); save();
  }

  /* ---------- 5. fog wisps ---------- */
  let wisp = null;
  const wispKey = sc => 'wisp_' + sc + '_' + week();
  function wispTick(c, now) {
    const sc = G.S.map, p = World.player;
    const fog = typeof Ambient !== 'undefined' && Ambient.weather === 'fog';
    if (!FOREST.includes(sc) || F()[wispKey(sc)]) { wisp = null; return; }
    if (wisp && wisp.sc !== sc) wisp = null;
    if (!wisp) { if (!fog) return;   // wisps only appear in fog — but once one is leading you, it waits for you
      const t = W4().spot(sc, 551 + week() % 5); if (!t) return;
      const D = distFrom(t[0], t[1]); if (!D.has(p.x + ',' + p.y)) return;
      let st = [p.x, p.y]; for (let i = 0; i < 3; i++) { const n = stepDown(D, st[0], st[1], 1); if (n) st = n; }
      wisp = { sc, t, D, x: st[0], y: st[1], px: st[0] * TILE + 16, py: st[1] * TILE + 8, next: 0, arrived: false };
      toast('<b style="color:#bfe8ff">A small light</b> hovers in the fog, waiting.', 2600);
    }
    const w = wisp, d = Math.abs(w.x - p.x) + Math.abs(w.y - p.y);
    if (w.arrived && Math.abs(w.t[0] - p.x) + Math.abs(w.t[1] - p.y) <= 1 && !World.busy) { F()[wispKey(sc)] = 1; Story.run(wispReward); }
    if (!w.arrived && now > w.next && d <= 4) { const n = stepDown(w.D, w.x, w.y, 1); if (n) { w.x = n[0]; w.y = n[1]; } if (w.x === w.t[0] && w.y === w.t[1]) w.arrived = true; w.next = now + 380; }
    w.px += (w.x * TILE + 16 - w.px) * .12; w.py += (w.y * TILE + 8 - w.py) * .12;
    const cx = Math.round(World.cam.x), cy = Math.round(World.cam.y), k = .5 + .5 * Math.sin(now / 260), sx = w.px - cx, sy = w.py - cy - 6 + Math.sin(now / 400) * 4;
    const g = c.createRadialGradient(sx, sy, 0, sx, sy, 22 + k * 6); g.addColorStop(0, 'rgba(230,248,255,.95)'); g.addColorStop(.25, 'rgba(160,220,255,.55)'); g.addColorStop(1, 'rgba(120,200,255,0)');
    c.fillStyle = g; c.beginPath(); c.arc(sx, sy, 28, 0, 7); c.fill();
  }
  async function wispReward() {
    const w = wisp; wisp = null; const g = 120 + Math.floor(Math.random() * 120); G.S.gold += g; const n = rare(); UI.hud(); sfx('heal');
    await narr(`The light sinks into the ground and goes out. Where it vanished, the moss is pressed flat over a little hollow: ${g} gold${n ? ` and a ${gold$(n)}` : ''}.`); save();
  }

  /* ---------- wiring ---------- */
  const _load = World.load.bind(World);
  World.load = async function (name, ...a) {
    trackOn = false; if (wisp && wisp.sc !== name) wisp = null;
    const r = await _load(name, ...a);
    try {
      if (FOREST.includes(name)) { const s = SHR(name); if (s) { World.col[s[1]][s[0]] = 1; World.ents.push(new Ent({ id: 'fshrine', x: s[0], y: s[1], dir: 'down', img: shrineImg(!!F()['shrine_' + name]), size: 1.5, pickup: 1, name: '', talk: () => shrineTalk(name) })); if (F()['shrine_' + name]) World.lights.push({ x: s[0] * TILE + 16, y: s[1] * TILE, r: 80, c: '255,210,140' }); } }
      if (name === 'woods' && chainDone()) World.lights.push({ x: 37 * TILE + 16, y: 13 * TILE, r: 120, c: '120,180,255' });
      if (name === 'sanctum' && !F().sanctum && SG) { const B = ENEMY.m_minotaur ? 'm_minotaur' : 'm_troll'; let img; try { img = await npcImg(B); } catch (e) { } if (img) World.ents.push(new Ent({ id: 'keeper', x: SG.stone[0], y: SG.stone[1] + 1, dir: 'down', img, size: 1.8, name: 'The Wardstone Keeper', talk: keeperFight })); }
      const m = dmap(); if (m && !m.dug && name === m.id) { const t = dmapSpot(m.id, m.week); if (t) World.ents.push(new Ent({ id: 'dmap', x: t[0], y: t[1], dir: 'down', img: blank(), pickup: 1, name: '', talk: digDungeon })); }
    } catch (e) { console.warn('worldplus5', e); }
    return r;
  };
  const _step = World.onStep.bind(World);
  World.onStep = function (e) {
    const r = _step(e);
    try { if (e && e.isPlayer && !World.busy) { const m = dmap(); if (m && !m.dug && G.S.map === m.id) { const t = dmapSpot(m.id, m.week); if (t && t[0] === e.x && t[1] === e.y) Story.run(digDungeon); } } } catch (x) { }
    return r;
  };
  if (typeof MiniMap !== 'undefined') {
    const _draw = MiniMap.draw.bind(MiniMap);
    MiniMap.draw = function (c) {
      _draw(c);
      try {
        const m = dmap(); if (!this.on() || !this.box || !m || m.dug || G.S.map !== m.id) return;
        const t = dmapSpot(m.id, m.week); if (!t) return; const [X, Y, w] = this.box, s = w / World.map.w, px = X + t[0] * s + s / 2, py = Y + t[1] * s + s / 2;
        c.strokeStyle = '#ff3a3a'; c.lineWidth = 1.6; c.beginPath(); c.moveTo(px - 3, py - 3); c.lineTo(px + 3, py + 3); c.moveTo(px + 3, py - 3); c.lineTo(px - 3, py + 3); c.stroke();
      } catch (e) { }
    };
  }
  const _render = World.render.bind(World);
  World.render = function (c, t) {
    _render(c, t);
    try { if (!World.player || World.loading || G.mode !== 'world') return; const now = performance.now(); trackTick(now); wispTick(c, now); } catch (e) { }
  };
  hookHorn(); hookStair();
  window.WorldPlus5 = { SHR, dmapSpot, get wisp() { return wisp; }, chainDone, blowHorn };
})();
