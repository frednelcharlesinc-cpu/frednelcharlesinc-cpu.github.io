'use strict';
/* ================= WORLD+ 3 (Chat B — World & Maps) =================
   1. MINI MAP MARKERS — found camps, grottos, lore stones, your treasure-map X, and a "Chests 2/5 · Caches 1/3" counter.
   2. GATE RIFTS — now and then a Gate tears open somewhere in the woods for a while. Step through: a pocket of another
      world with three rift-twisted guards and a rift chest. Clear it before it closes.
   3. SEASONS — every 7 days the woods turn: spring petals, summer haze, autumn leaves, winter frost.
   4. VINES — some cliffs are overgrown with vines. With the Climbing Hook (found in the first grotto you enter)
      Ren climbs straight up or down — shortcuts everywhere.
   5. FISHING — face any pond or river in the woods and press A. Wait for the bite, then reel it in.
   6. TREASURE MAPS — forest and grotto chests sometimes hold a torn map. The X shows on your mini map: dig there. */
(function () {
  const MK = { woods: 'fc_cross', woods_n: 'fc_north', woods_e: 'fc_east', woods_s: 'fc_south', woods_w: 'fc_west', woods_n2: 'fc_north2', woods_e2: 'fc_east2', woods_s2: 'fc_south2', woods_w2: 'fc_west2' };
  const S_ = () => G.S, F = () => G.S.f;
  const blank = (() => { let S; return () => { if (S) return S; S = document.createElement('canvas'); S.width = 64 * 9; S.height = 64 * 12; return S; }; })();
  const sleep = ms => new Promise(r => setTimeout(r, ms));
  const rngOf = seed => () => (seed = (seed * 1103515245 + 12345) >>> 0) / 4294967296;
  const reachFrom = (M, mk) => {
    const ex = (FCL[mk].exits.find(e => e.to) || FCL[mk].exits[0]), seen = new Set([ex.x + ',' + ex.y]), q = [[ex.x, ex.y]];
    while (q.length) { const [a, b] = q.shift(); for (const [dx, dy] of [[1, 0], [-1, 0], [0, 1], [0, -1]]) { const x = a + dx, y = b + dy, k = x + ',' + y; if (!seen.has(k) && M.col[y] && M.col[y][x] === '0') { seen.add(k); q.push([x, y]); } } }
    return seen;
  };
  const giveRare = () => { if (typeof PARTS === 'undefined' || typeof Gear === 'undefined') return ''; const r = Object.keys(PARTS).filter(p => PARTS[p].rare); const pk = r[Math.floor(Math.random() * r.length)]; if (!pk) return ''; Gear.give(pk, 1); return PARTS[pk].n; };

  /* ---------- 3. seasons ---------- */
  const SEASONS = ['spring', 'summer', 'autumn', 'winter'];
  const season = () => SEASONS[Math.floor(((typeof Cal !== 'undefined' ? Cal.day() : 1) - 1) / 7) % 4];
  const SEASON_TINT = { spring: ['rgba(255,190,220,.07)', 'source-over'], summer: ['rgba(255,230,140,.06)', 'source-over'], autumn: ['rgba(230,120,30,.16)', 'multiply'], winter: ['rgba(225,238,255,.30)', 'source-over'] };
  function applySeason() {
    if (!MK[G.S.map] || G.S.map === 'woods_n') return;   // Mistveil is always winter
    const s = season(), [col, op] = SEASON_TINT[s]; if (s === 'summer') return;
    const src = World.mapImg, cv = document.createElement('canvas'); cv.width = src.width; cv.height = src.height; cv.__dx = 1;
    const x = cv.getContext('2d'); x.drawImage(src, 0, 0); x.globalCompositeOperation = op; x.fillStyle = col; x.fillRect(0, 0, cv.width, cv.height);
    World.mapImg = cv;
  }
  let flakes = [];
  function drawSeason(c, t) {
    if (!MK[G.S.map] || G.S.map === 'woods_n' || G.S.map === 'woods_e') return;
    const s = season(), w = G.view.w, h = G.view.h; if (s === 'summer') return;
    while (flakes.length < 30) flakes.push({ x: Math.random() * w, y: Math.random() * h, p: Math.random() * 6, s: .5 + Math.random() });
    for (const f of flakes) {
      f.y += (s === 'winter' ? .45 : .3) * f.s; f.x += Math.sin(t / 800 + f.p) * .35; if (f.y > h + 4) { f.y = -4; f.x = Math.random() * w; }
      c.fillStyle = s === 'spring' ? 'rgba(255,190,215,.85)' : s === 'autumn' ? ['rgba(214,110,30,.85)', 'rgba(190,60,30,.85)', 'rgba(230,170,40,.85)'][(f.p * 10 | 0) % 3] : 'rgba(255,255,255,.85)';
      if (s === 'winter') c.fillRect(f.x, f.y, 2, 2); else { const r = Math.sin(t / 300 + f.p) > 0; c.fillRect(f.x, f.y, r ? 3 : 2, r ? 2 : 3); }
    }
  }

  /* ---------- 4. vines (climbing) ---------- */
  function vineSpots(scene) {
    const mk = MK[scene], M = G.maps[mk]; if (!M || !M.mm || scene === 'woods') return [];
    if (M.__vines) return M.__vines;
    const reach = reachFrom(M, mk), cand = [], walk = (x, y) => M.col[y] && M.col[y][x] === '0' && reach.has(x + ',' + y);
    for (let y = 2; y < M.h - 5; y++) for (let x = 3; x < M.w - 3; x++) {
      if (!(M.mm[y][x] === 'c' && M.mm[y + 1][x] === 'c' && M.mm[y + 2][x] === 'c')) continue;
      if (M.mm[y - 1][x] === 'c' || M.mm[y + 3][x] === 'c') continue;
      if (!walk(x, y - 1) || !walk(x, y + 3)) continue;
      if ([-2, -1, 1, 2].some(d => M.mm[y + 1][x + d] === 's')) continue;   // not right beside the stairs
      cand.push([x, y]);
    }
    const r = rngOf(mk.length * 53 + 11), out = [];
    for (let i = 0; i < 2 && cand.length; i++) { let best = null, bd = -1; for (let k = 0; k < 80; k++) { const c = cand[Math.floor(r() * cand.length)]; const d = out.length ? Math.abs(out[0][0] - c[0]) : 99; if (d > bd) { bd = d; best = c; } } out.push(best); }
    return (M.__vines = out);
  }
  async function climb(x, y, up) {
    if (!F().climbHook) { await narr('Thick old vines hang down the cliff. They\'d hold your weight — if you had something to grip the rock with.'); return; }
    sfx('blip'); await fadeOut(220);
    const p = World.player, ty = up ? y - 1 : y + 3; p.move = null; p.x = x; p.y = ty; p.px = x * TILE + 16; p.py = ty * TILE + 26; p.dir = up ? 'up' : 'down';
    for (const f of (World.followers || [])) { f.move = null; f.x = x; f.y = ty; f.px = p.px; f.py = p.py; }
    await fadeIn(220);
  }
  function drawVines(c, cx, cy, t) {
    for (const [x, y] of vineSpots(G.S.map)) {
      const X = x * TILE - cx, Y = y * TILE - cy; if (X < -40 || Y < -100 || X > G.view.w + 40 || Y > G.view.h + 40) continue;
      for (let i = 0; i < 4; i++) {
        c.strokeStyle = i % 2 ? '#3f7a2a' : '#2c5a1e'; c.lineWidth = 2; c.beginPath();
        for (let k = 0; k <= 12; k++) { const yy = Y - 4 + k * 8.5, xx = X + 5 + i * 7 + Math.sin(k * 1.3 + i) * 2.5; k ? c.lineTo(xx, yy) : c.moveTo(xx, yy); }
        c.stroke();
        c.fillStyle = '#58a83a'; for (let k = 1; k < 12; k += 2) c.fillRect(X + 3 + i * 7 + Math.sin(k + i) * 3, Y - 4 + k * 8.5, 3, 2);
      }
    }
  }

  /* ---------- 5. fishing ---------- */
  let fishing = false;
  async function fish() {
    if (fishing) return; fishing = true;
    try {
      await narr('You cut a line from your pack, bait it with a grub, and cast into the water…');
      await sleep(900 + Math.random() * 2600);
      const r = await ask(null, null, '*tug* — something bites!', ['Reel it in!', 'Let it go']);
      if (r !== 0) return;
      const S = S_(); S.fishCaught = S.fishCaught || 0;
      const roll = Math.random();
      const rain = (typeof Ambient !== 'undefined' && Ambient.weather === 'rain') || ((G.S.bait || 0) > 0 && G.S.bait-- > 0);   // fish bite in the rain
      if (roll < (rain ? .08 : .25)) { await narr('The line goes slack. Whatever it was, it\'s smarter than you.'); return; }
      S.fishCaught++;
      if (roll > (rain ? .86 : .93)) { const n = giveRare(); G.S.gold += 60; sfx('level'); await narr(`A huge old fish — and something glitters in its belly: <b style="color:#ffd36a">${n || 'a coin purse'}</b>! (+60 gold)`); }
      else { const g = 10 + Math.floor(Math.random() * 25), kind = ({ woods_n: 'an ice trout', woods_e: 'an ember perch', woods_s: 'a glowing mudfish', woods_w: 'a river bass', woods: 'a pond carp' })[G.S.map] || 'a fish'; G.S.gold += g; sfx('blip'); await narr(`You land ${kind}! A traveller would pay ${g} gold for that. (Fish caught: ${S.fishCaught})`); }
      UI.hud(); save();
    } finally { fishing = false; }
  }
  const _interact = World.interact.bind(World);
  World.interact = function () {
    try {
      const p = World.player, M = World.map;
      if (p && M && M.mm && MK[G.S.map] && !World.busy) {
        const d = DIRS[p.dir], x = p.x + d[0], y = p.y + d[1], T = World.scene.tiles || {};
        const ent = World.ents.some(e => e !== p && e.x === x && e.y === y);
        if (!ent && !T[x + ',' + y] && M.mm[y] && M.mm[y][x] === 'w') { Story.run(fish); return; }
      }
    } catch (e) { }
    return _interact();
  };

  /* ---------- 6. treasure maps ---------- */
  function treasureSpot(scene) {
    const mk = MK[scene], M = G.maps[mk]; if (!M || !M.mm) return null;
    if (M.__tx) return M.__tx;
    const reach = reachFrom(M, mk), r = rngOf(mk.length * 977 + 4049), caches = (window.WorldPlus && WorldPlus.cacheSpots(scene)) || [];
    const cand = [];
    for (let y = 5; y < M.h - 5; y++) for (let x = 5; x < M.w - 5; x++) if (M.mm[y][x] === 'g' && reach.has(x + ',' + y) && !caches.some(c => Math.abs(c[0] - x) + Math.abs(c[1] - y) < 6)) cand.push([x, y]);
    return (M.__tx = cand[Math.floor(r() * cand.length)] || null);
  }
  function maybeMap(scene) {
    const S = S_(); S.tmaps = S.tmaps || {};
    const targets = Object.keys(MK).filter(s => s !== 'woods' && !S.tmaps[s]);
    if (!targets.length || Math.random() > .35) return;
    const s = targets[Math.floor(Math.random() * targets.length)]; S.tmaps[s] = 'have';
    const name = SCENES[s].subtitle || s;
    toast(`<b style="color:#ffd34a">TORN MAP</b> — an X marked somewhere in ${name}. It'll show on your mini map there.`, 3600); save();
  }
  async function digTreasure(scene) {
    const S = S_(); if (S.tmaps[scene] !== 'have') return;
    await narr('This is the spot. You count the paces from the map one more time — and dig.');
    S.tmaps[scene] = 'dug'; World.ents = World.ents.filter(e => e.id !== 'tmap');
    const gold = 220 + Math.floor(Math.random() * 160); G.S.gold += gold; const n = giveRare(), n2 = giveRare();
    let gear = ''; if (typeof RECIPES !== 'undefined' && typeof Gear !== 'undefined') { const pool = ['scalevest', 'hidecoat', 'embercharm', 'alphatalisman', 'dustcharm'].filter(g => RECIPES[g]); const g = pool[Math.floor(Math.random() * pool.length)]; if (g) { const st = Gear.st(); st.gear.own[g] = (st.gear.own[g] || 0) + 1; gear = RECIPES[g].n; } }
    sfx('level'); UI.hud();
    await narr(`An iron-bound strongbox! ${gold} gold${n ? `, a <b style="color:#ffd36a">${n}</b>` : ''}${n2 ? `, a <b style="color:#ffd36a">${n2}</b>` : ''}${gear ? `, and <b style="color:#ffd36a">${gear}</b>` : ''}.`);
    save();
  }

  /* ---------- 2. gate rifts ---------- */
  const RIFT = () => FCL.fc_gate && FCL.fc_gate.rift;
  SCENES.gate_rift = { title: 'A Gate Rift', subtitle: 'The woods are gone. The sky is the wrong colour.', map: 'fc_gate', music: 'woods', noAmbient: 1, interior: 1, bd: 'd_vault',
    setup(W) { W.tint = 'rgba(30,6,50,.42)'; const R = RIFT(); W.lights.push({ x: R.chest[0] * TILE + 16, y: R.chest[1] * TILE, r: 140, c: '200,120,255' }); },
    npcs() { return []; }, get exits() { const g = G.S.gateEv || {}, R = RIFT(); return R ? [{ x: R.exit[0], y: R.exit[1], to: g.scene || 'woods', tx: g.x || 24, ty: (g.y || 20) + 1, dir: 'down' }] : []; } };
  function riftActive(scene) { const g = S_().gateEv; return g && !g.done && g.scene === scene && (S_().steps || 0) < g.until; }
  function maybeRift(scene) {
    const S = S_(); if (scene === 'woods' || riftActive(scene)) return;
    if (S.gateEv && !S.gateEv.done && (S.steps || 0) < S.gateEv.until) return;   // one at a time
    if ((S.steps || 0) - (S.gateLast || -9999) < 450 || Math.random() > .22) return;
    const M = World.map, reach = reachFrom(M, MK[scene]), p = World.player;
    const cand = (M.grass || []).filter(([x, y]) => reach.has(x + ',' + y) && Math.abs(x - p.x) + Math.abs(y - p.y) > 10 && M.col[y][x] === '0' && M.col[y + 1] && M.col[y + 1][x] === '0');
    if (!cand.length) return;
    const [x, y] = cand[Math.floor(Math.random() * cand.length)];
    S.gateEv = { scene, x, y, until: (S.steps || 0) + 320, done: 0 }; S.gateLast = S.steps || 0;
    toast('<b style="color:#c58aff">A GATE HAS TORN OPEN</b> somewhere in these woods. It won\'t stay open long.', 3800); save();
  }
  async function enterRift() {
    const c = await ask(null, null, 'A Gate hangs in the air, a wound of purple light. The air on the other side is wrong. Step through?', ['Step through', 'Not now']);
    if (c !== 0) return;
    const R = RIFT(); await World.go('gate_rift', R.start[0], R.start[1], 'up');
  }
  async function riftSetup(W) {
    const R = RIFT(), g = S_().gateEv || {}, src = SCENES[g.scene] || SCENES.woods_n;
    if (!g.cleared) for (let i = 0; i < R.guards.length; i++) {
      if ((g.beat || []).includes(i)) continue;
      let enc; try { enc = src.encounters(); } catch (e) { continue; } const lead = enc && enc.enemies && enc.enemies[0]; if (!lead || !ENEMY[lead]) continue;
      const key = 'rift_' + lead, B = ENEMY[lead];
      if (!ENEMY[key]) ENEMY[key] = Object.assign({}, B, { name: 'Rift-touched ' + B.name, img: B.img || lead, hp: Math.round(B.hp * 1.7), atk: Math.round(B.atk * 1.25), xp: Math.round((B.xp || 10) * 2.5), gold: Math.round((B.gold || 5) * 2.5), trait: 'Rift-touched · ' + ((B.trait || 'twisted by the Gate').split(/ — |\(/)[0].trim()) });
      let img; try { img = await npcImg(ENEMY[key].img); } catch (e) { continue; }
      const [x, y] = R.guards[i];
      W.ents.push(new Ent({ id: 'rg_' + i, x, y, dir: 'down', img, size: 1.25, name: ENEMY[key].name, ai: 'turn', turns: ['down', 'left', 'right'], talk: () => riftFight(i, [key, ...enc.enemies.slice(1)]) }));
    }
    if (!g.looted) W.ents.push(new Ent({ id: 'riftchest', x: R.chest[0], y: R.chest[1], dir: 'down', img: Pick.sheet('chest_gold_c'), pickup: 1, name: 'Rift chest', talk: riftChest }));
  }
  async function riftFight(i, enemies) {
    const r = await Battle.start({ enemies, noFlee: true, bd: 'd_vault', music: 'boss', intro: 'RIFT GUARDIAN' });
    if (r === 'lose') { await Story.defeat(); return; }
    if (r !== 'win') return;
    const g = S_().gateEv; g.beat = g.beat || []; g.beat.push(i); World.ents = World.ents.filter(e => e.id !== 'rg_' + i); save();
  }
  async function riftChest() {
    const g = S_().gateEv, R = RIFT();
    if ((g.beat || []).length < R.guards.length) { await narr('The chest is wrapped in chains of purple light. The rift\'s guardians are still holding it shut.'); return; }
    g.looted = 1; g.done = 1; const e = World.ents.find(n => n.id === 'riftchest'); if (e) e.img = Pick.sheet('chest_gold_o');
    const gold = 180 + Math.floor(Math.random() * 120); G.S.gold += gold; const n = giveRare(), n2 = giveRare();
    if (typeof grantLoot === 'function' && typeof LOOT !== 'undefined' && LOOT.iron) try { await grantLoot(LOOT.iron()); } catch (x) { }
    sfx('level'); UI.hud();
    await narr(`The chains shatter. ${gold} gold${n ? `, a <b style="color:#ffd36a">${n}</b>` : ''}${n2 ? ` and a <b style="color:#ffd36a">${n2}</b>` : ''}. Behind you, the rift begins to close — time to go.`);
    save();
  }
  function drawPortal(c, t) {
    const g = S_().gateEv; if (!riftActive(G.S.map)) return;
    const cx = Math.round(World.cam.x), cy = Math.round(World.cam.y), X = g.x * TILE + 16 - cx, Y = g.y * TILE + 6 - cy;
    for (let i = 5; i > 0; i--) { c.fillStyle = `rgba(${150 + i * 18},${60 + i * 10},255,${(.12 + .05 * Math.sin(t / 200 + i)).toFixed(2)})`; c.beginPath(); c.ellipse(X, Y, 10 + i * 4, 18 + i * 5, 0, 0, 7); c.fill(); }
    c.strokeStyle = 'rgba(230,200,255,.9)'; c.lineWidth = 2; c.beginPath(); c.ellipse(X, Y, 12, 22, Math.sin(t / 500) * .2, 0, 7); c.stroke();
    for (let k = 0; k < 6; k++) { const a = t / 400 + k; c.fillStyle = '#e6c8ff'; c.fillRect(X + Math.cos(a) * 18, Y + Math.sin(a) * 26, 2, 2); }
  }

  /* ---------- 1. mini map markers + counter ---------- */
  if (typeof MiniMap !== 'undefined') {
    const _draw = MiniMap.draw.bind(MiniMap);
    MiniMap.draw = function (c) {
      _draw(c);
      try {
        if (!this.on() || !this.box) return;
        const [X, Y, w, h] = this.box, M = World.map, s = w / M.w, S = S_(), sc = G.S.map;
        const mark = (x, y, col, sh) => { c.fillStyle = col; const px = X + x * s + s / 2, py = Y + y * s + s / 2; if (sh === 'sq') c.fillRect(px - 2, py - 2, 4, 4); else if (sh === 'x') { c.fillRect(px - 3, py - .5, 6, 1.5); c.fillRect(px - .5, py - 3, 1.5, 6); } else { c.beginPath(); c.arc(px, py, 2, 0, 7); c.fill(); } };
        if (window.WorldPlus) for (const cp of WorldPlus.CAMPS) if (cp.scene === sc && (S.camps || {})[sc]) mark(cp.at[0], cp.at[1], '#ff9a3a', 'sq');
        if (G.__grottoDoor && G.__grottoDoor[sc] && F()['grotto_' + sc]) { const d = G.__grottoDoor[sc]; mark(d.at[0], d.at[1], '#7ad8ff', 'sq'); }
        for (const e of World.ents) if (/^lore_/.test(e.id)) mark(e.x, e.y, '#46ff95');
        if ((S.tmaps || {})[sc] === 'have') { const t = treasureSpot(sc); if (t) mark(t[0], t[1], '#ff4a4a', 'x'); }
        if (riftActive(sc)) mark(S.gateEv.x, S.gateEv.y, '#c58aff', 'sq');
        // counter
        const ch = World.ents.filter(e => /^chest_/.test(e.id)), op = ch.filter(e => (S.chests || {})[e.id.slice(6)]).length;
        let txt = `Chests ${op}/${ch.length}`;
        if (MK[sc] && window.WorldPlus) { const cs = WorldPlus.cacheSpots(sc); txt += ` · Caches ${cs.filter((_, i) => F()[`cache_${sc}_${i}`]).length}/${cs.length}`; }
        c.font = `700 ${Math.max(5, 6.5 * (G.view.h / 336)).toFixed(1)}px Nunito, sans-serif`; c.textAlign = 'right';
        c.fillStyle = 'rgba(0,0,0,.55)'; c.fillText(txt, X + w + .6, Y + h + 8.6 * (G.view.h / 336)); c.fillStyle = '#e8f5ec'; c.fillText(txt, X + w, Y + h + 8 * (G.view.h / 336));
      } catch (e) { }
    };
  }

  /* ---------- wiring ---------- */
  const _load = World.load.bind(World);
  World.load = async function (name, ...a) {
    const r = await _load(name, ...a);
    try {
      if (MK[name]) {
        applySeason(); flakes = [];
        vineSpots(name).forEach(([x, y], i) => {
          for (const [ty, up] of [[y + 2, true], [y, false]]) World.ents.push(new Ent({ id: `vine_${i}_${up ? 'u' : 'd'}`, x, y: ty, dir: 'down', img: blank(), pickup: 1, name: '', talk: () => climb(x, y, up) }));
        });
        const S = S_(); S.tmaps = S.tmaps || {};
        if (S.tmaps[name] === 'have') { const t = treasureSpot(name); if (t && !World.ents.some(e => e.x === t[0] && e.y === t[1])) World.ents.push(new Ent({ id: 'tmap', x: t[0], y: t[1], dir: 'down', img: blank(), pickup: 1, name: '', talk: () => digTreasure(name) })); }
        maybeRift(name);
        if (riftActive(name)) { const g = S.gateEv; World.ents.push(new Ent({ id: 'rift', x: g.x, y: g.y, dir: 'down', img: blank(), pickup: 1, name: '', talk: enterRift })); }
      }
      if (/^grotto_/.test(name) && !F().climbHook) {
        F().climbHook = 1; save();
        setTimeout(() => Story.run(async () => { await narr('Wedged in a crack by the entrance: an old climber\'s hook on a knotted rope. Someone came this way before you.'); toast('<b style="color:#46ff95">CLIMBING HOOK</b> — you can climb the vine-covered cliffs in the woods now.', 3600); }), 900);
      }
      if (name === 'gate_rift') await riftSetup(World);
      // chests in the woods and grottos can hold a torn map
      if (MK[name] || /^grotto_/.test(name)) for (const e of World.ents) if (/^chest_/.test(e.id) && !e.__tm) {
        e.__tm = 1; const orig = e.talk, key = e.id.slice(6);
        e.talk = async ent => { const was = (S_().chests || {})[key]; await orig(ent); if (!was && (S_().chests || {})[key]) maybeMap(name); };
      }
    } catch (e) { console.warn('worldplus3', e); }
    return r;
  };
  if (typeof Ambient !== 'undefined' && Ambient.ground) {
    const _g = Ambient.ground.bind(Ambient);
    Ambient.ground = function (c, cx, cy, t, w, h) { const r = _g(c, cx, cy, t, w, h); try { if (MK[G.S.map]) drawVines(c, cx, cy, t); } catch (e) { } return r; };
  }
  const _render = World.render.bind(World);
  World.render = function (c, t) {
    _render(c, t);
    try { if (!World.player || World.loading) return; if (MK[G.S.map]) { drawPortal(c, t); drawSeason(c, t); } } catch (e) { }
  };
  window.WorldPlus3 = { season, vineSpots, treasureSpot, maybeRift };
})();
