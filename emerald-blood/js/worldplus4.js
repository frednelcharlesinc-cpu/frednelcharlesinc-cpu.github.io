'use strict';
/* ================= WORLD+ 4 (Chat B — World & Maps) =================
   1. THE WANTED BOARD — at the Crossroads. Each week: one named elite beast per forest. Take a bounty, hunt it (a red X
      on that forest's mini map), come back and collect.
   2. RARE SPAWNS — now and then a golden deer or a spirit fox appears. They run. Corner one for a prize.
   3. WEATHER THAT MATTERS — fog and blizzards shrink what the mini map can see; monsters can't see far either
      (and fish bite better in the rain — in worldplus3/2).
   4. RUINS TO RESTORE — pay to rebuild the Crossroads shrine (a Wayshrine: rest & heal) and the old watchtowers in
      Mistveil and Emberroot (climb one and the whole forest is mapped for you).
   5. EXPLORER'S TALLY — at the wanted board: how much of each forest you've found, with a reward at 100%.
   6. MOONSTONES — one pale stone in each forest that only wakes at night. Come back after dark.
   7. YOUR HOMESTEAD — a clearing in the Old Grove. Buy the deed, then build it up: a tent to rest in, a garden that
      grows herbs while you're away, a trophy stand — and it becomes a camp you can fast-travel to. */
(function () {
  const MK = { woods: 'fc_cross', woods_n: 'fc_north', woods_e: 'fc_east', woods_s: 'fc_south', woods_w: 'fc_west' };
  const FOREST = ['woods_n', 'woods_e', 'woods_s', 'woods_w'];
  const S_ = () => G.S, F = () => G.S.f;
  const sheet = draw => { const one = document.createElement('canvas'); one.width = one.height = 64; const x = one.getContext('2d'); draw(x); const S = document.createElement('canvas'); S.width = 64 * 9; S.height = 64 * 12; const s = S.getContext('2d'); for (let r = 0; r < 12; r++) for (let f = 0; f < 9; f++) s.drawImage(one, f * 64, r * 64); return S; };
  const R = (x, c, a, b, w, h) => { x.fillStyle = c; x.fillRect(a, b, w, h); };
  const blank = (() => { let S; return () => S || (S = sheet(() => { })); })();
  const rngOf = seed => () => (seed = (seed * 1103515245 + 12345) >>> 0) / 4294967296;
  const night = () => (typeof Ambient !== 'undefined' && Ambient.night) || 0;
  const giveRare = () => { if (typeof PARTS === 'undefined' || typeof Gear === 'undefined') return ''; const r = Object.keys(PARTS).filter(p => PARTS[p].rare); const pk = r[Math.floor(Math.random() * r.length)]; if (!pk) return ''; Gear.give(pk, 1); return PARTS[pk].n; };
  const pay = async (cost, what) => {
    if (G.S.gold < cost) { await narr(`${what} would cost ${cost} gold. You have ${G.S.gold}.`); return false; }
    const c = await ask(null, null, `${what} — ${cost} gold?`, ['Pay', 'Not now']); if (c !== 0) return false;
    G.S.gold -= cost; UI.hud(); sfx('level'); return true;
  };
  const reach = mk => { const M = G.maps[mk]; if (M.__reach) return M.__reach; const ex = (FCL[mk].exits.find(e => e.to) || FCL[mk].exits[0]), seen = new Set([ex.x + ',' + ex.y]), q = [[ex.x, ex.y]];
    while (q.length) { const [a, b] = q.shift(); for (const [dx, dy] of [[1, 0], [-1, 0], [0, 1], [0, -1]]) { const x = a + dx, y = b + dy, k = x + ',' + y; if (!seen.has(k) && M.col[y] && M.col[y][x] === '0') { seen.add(k); q.push([x, y]); } } }
    return (M.__reach = seen); };
  // tiles hidden under a tree canopy / statue / roof (so nothing we place ends up invisible behind art)
  const covered = mk => { const M = G.maps[mk]; if (M.__cov) return M.__cov; const S = new Set();
    for (const o of M.props || []) { const f = G.props[o.k]; if (!f || !f.r || f.r[3] < 100) continue; const w = f.r[2], h = f.r[3], ax = f.ax, ay = f.ay;
      const x0 = Math.floor((o.x * 32 + 16 - ax + w * .15) / 32), x1 = Math.floor((o.x * 32 + 16 - ax + w * .85) / 32), y0 = Math.floor((o.y * 32 + 28 - ay + h * .1) / 32);
      for (let y = Math.max(y0, o.y - 3); y < o.y; y++) for (let x = x0; x <= x1; x++) S.add(x + ',' + y); }
    return (M.__cov = S); };
  // a free open-ground spot (deterministic per map + salt), away from everything already placed
  const used = {};
  function spot(scene, salt, test) {
    const mk = MK[scene], M = G.maps[mk], key = scene + salt; if (used[key]) return used[key];
    const re = reach(mk), cov = covered(mk), r = rngOf(mk.length * 7919 + salt * 104729), fcl = FCL[mk];
    const avoid = [...Object.values(fcl.npc).map(p => [p[0], p[1]]), ...fcl.chests, ...((window.WorldPlus && WorldPlus.cacheSpots(scene)) || []), ...((window.WorldPlus2 && WorldPlus2.stoneSpots && FOREST.includes(scene)) ? WorldPlus2.stoneSpots(scene) : []), ...Object.values(used)];
    const cand = [];
    for (let y = 4; y < M.h - 4; y++) for (let x = 4; x < M.w - 4; x++) {
      if (M.mm[y][x] !== 'g' || !re.has(x + ',' + y) || cov.has(x + ',' + y) || cov.has(x + ',' + (y - 1)) || cov.has(x + ',' + (y + 1)) || avoid.some(a => a && Math.abs(a[0] - x) + Math.abs(a[1] - y) < 4)) continue;
      if (test && !test(M, x, y)) continue; cand.push([x, y]);
    }
    return (used[key] = cand[Math.floor(r() * cand.length)] || null);
  }

  /* ---------- 1. the wanted board ---------- */
  const QUARRY = {
    woods_n: [['Old One-Eye', 'lupine_alpha'], ['The Frost Widow', 'rime_lupine'], ['Whitefang', 'rime_alpha']],
    woods_e: [['Brandmaw', 'm_tusker'], ['Mother Hex', 'm_goblin_shaman'], ['Cinderback', 'lupine_alpha']],
    woods_s: [['The Bog Lurker', 'm_lizard'], ['Gutsack', 'm_gourd'], ['Wick-Eater', 'm_ratfolk']],
    woods_w: [['The Grove Butcher', 'm_goblin'], ['Gnasher', 'm_ratfolk'], ['Barkhide', 'm_tusker']]
  };
  // hunter ranks: every bounty paid counts. Higher rank = tougher marks, bigger purses.
  const RANKS = [['Copper', 0], ['Bronze', 2], ['Silver', 5], ['Gold', 9], ['Mithril', 14]];
  const rankIx = () => { const n = S_().bountiesPaid || 0; let i = 0; RANKS.forEach((r, k) => { if (n >= r[1]) i = k; }); return i; };
  const rankMul = () => 1 + .2 * rankIx();
  const ELDER = [['The Elder Stag-Wolf', 'rime_alpha', 'woods_n'], ['The Cinder Matriarch', 'm_drake', 'woods_e'], ['The Mire King', 'm_troll', 'woods_s'], ['The Horned Hermit', 'm_minotaur', 'woods_w']];
  const week = () => Math.floor(((typeof Cal !== 'undefined' ? Cal.day() : 1) - 1) / 7);
  function bounties() {
    const S = S_(), w = week();
    if (!S.bounty || S.bounty.week !== w) S.bounty = { week: w, list: FOREST.map((sc, i) => { const q = QUARRY[sc]; const [name, base] = q[(w + i) % q.length]; return { scene: sc, name, base: ENEMY[base] ? base : Object.keys(ENEMY).find(k => k === 'lupine') || base, state: 'open' }; }) };
    if (rankIx() >= 2 && !S.bounty.list.some(b => b.elder)) { const e = ELDER[w % ELDER.length]; if (ENEMY[e[1]]) S.bounty.list.push({ scene: e[2], name: e[0], base: e[1], state: 'open', elder: 1 }); }
    return S.bounty.list;
  }
  function bountyEnemy(b) {
    const m = rankMul() * (b.elder ? 1.5 : 1), key = 'bty_' + b.name.replace(/\W/g, '').toLowerCase() + '_' + rankIx(), B = ENEMY[b.base]; if (!B) return null;
    if (!ENEMY[key]) ENEMY[key] = Object.assign({}, B, { name: b.name, img: B.img || b.base, hp: Math.round(B.hp * 2.6 * m), atk: Math.round(B.atk * 1.3 * Math.sqrt(m)), def: (B.def || 0) + 2, brk: Math.round((B.brk || 40) * 1.6), xp: Math.round((B.xp || 10) * 4), gold: Math.round((B.gold || 5) * 3), size: Math.max(b.elder ? 1.6 : 1.35, B.size || 1), trait: (b.elder ? 'Elder mark' : 'Bounty mark') + (B.trait ? ' · ' + B.trait.split(/ — |\(/)[0].trim() : '') });
    return key;
  }
  const boardImg = (() => { let S; return () => S || (S = sheet(x => {
    R(x, 'rgba(0,0,0,.3)', 14, 58, 36, 4); R(x, '#4a3020', 18, 40, 4, 20); R(x, '#4a3020', 42, 40, 4, 20);
    R(x, '#6b4a2a', 12, 16, 40, 28); R(x, '#8a6038', 12, 16, 40, 3); R(x, '#3a2414', 12, 42, 40, 2);
    for (const [a, b, c] of [[15, 20, '#e8dcc0'], [27, 19, '#efe4c8'], [39, 21, '#e2d4b4']]) { R(x, c, a, b, 10, 13); R(x, '#a03020', a + 3, b + 2, 4, 4); R(x, '#5a4a3a', a + 2, b + 8, 6, 1); R(x, '#5a4a3a', a + 2, b + 10, 5, 1); }
  })); })();
  async function boardTalk() {
    const ex = boardExtras.filter(x => !x.show || x.show());
    const ch = await ask(null, null, `The Crossroads wanted board. Fresh notices are nailed over old ones. (Hunter rank: ${RANKS[rankIx()][0]})`, ['Bounties', "Explorer's tally", ...ex.map(x => typeof x.label === 'function' ? x.label() : x.label), 'Leave']);
    if (ch === 0) return bountyMenu(); if (ch === 1) return tally(); if (ex[ch - 2]) return ex[ch - 2].run();
  }
  async function bountyMenu() {
    const L = bounties(), st = b => ({ open: '', hunt: ' — hunting', done: ' — slain! collect', paid: ' — paid', lost: ' — claimed by a rival' })[b.state];
    const ch = await ask(null, null, `This week's marks (new notices every 7 days):`, [...L.map(b => `${b.name} · ${SCENES[b.scene].subtitle}${st(b)}`), 'Back']);
    const b = L[ch]; if (!b) return;
    if (b.state === 'open') { b.state = 'hunt'; await narr(`WANTED: ${b.name}. Last seen in ${SCENES[b.scene].subtitle}. A red X will show on your map there.`); save(); }
    else if (b.state === 'hunt') await narr(`${b.name} is still out there in ${SCENES[b.scene].subtitle}. Look for the red X on your map.`);
    else if (b.state === 'done') {
      b.state = 'paid'; const r0 = rankIx(), gold = Math.round((220 + Math.floor(Math.random() * 180)) * rankMul() * (b.elder ? 2 : 1)); G.S.gold += gold; const n = giveRare(), n2 = b.elder ? giveRare() : ''; UI.hud(); sfx('level');
      S_().bountiesPaid = (S_().bountiesPaid || 0) + 1;
      await narr(`The board-keeper's strongbox pays out: ${gold} gold${n ? ` and a <b style="color:#ffd36a">${n}</b>` : ''}${n2 ? ` and a <b style="color:#ffd36a">${n2}</b>` : ''}. "${b.name}? Good riddance."`);
      if (rankIx() > r0) await rankUp(rankIx());
      save();
    } else await narr(b.state === 'lost' ? `Someone has nailed a note over it: "TAKEN. — V.C."` : 'Already paid. Check back when the notices change.');
  }
  async function rankUp(i) {
    sfx('level'); toast(`<b style="color:#ffd36a">HUNTER RANK: ${RANKS[i][0].toUpperCase()}</b>`, 3200);
    const msg = { 1: 'The board-keeper nails a bronze tack beside your name. Your marks will be tougher now — and pay better.',
      2: 'Silver. The keeper unlocks a second strongbox: ELDER MARKS — old, huge, and very rarely seen. One will be posted each week.',
      3: 'Gold rank. The keeper hands you a folded cloak of stitched trophy-hides. "Hunters see that, they get out of your way."',
      4: 'Mithril. There are maybe three living hunters with that tack. Every purse on the board pays you nearly double what it pays anyone else.' }[i];
    if (msg) await narr(msg);
    if (i === 3 && typeof Gear !== 'undefined' && RECIPES.huntermantle) { const S = Gear.st(); S.gear.own.huntermantle = (S.gear.own.huntermantle || 0) + 1; await narr('<b style="color:#ffd36a">Hunter\'s Mantle</b> added to your gear. (Menu → Gear to wear it.)'); }
  }
  if (typeof RECIPES !== 'undefined' && !RECIPES.huntermantle) {
    if (typeof PARTS !== 'undefined' && !PARTS.huntermark) PARTS.huntermark = { n: "Hunter's Mark", v: 0, use: 'Given at Gold hunter rank.' };
    RECIPES.huntermantle = { n: "Hunter's Mantle", slot: 'armor', p: { huntermark: 1 }, g: 0, s: { hp: 18, def: 3, spd: 2 } };
  }
  const boardExtras = [];
  let hunted = null;
  async function spawnBounty(W, scene) {
    hunted = null; const b = bounties().find(x => x.scene === scene && x.state === 'hunt'); if (!b) return;
    const key = bountyEnemy(b); if (!key) return; const at = spot(scene, 71, (M, x, y) => (M.grass || []).length === 0 || M.mm[y][x] === 'g'); if (!at) return;
    let img; try { img = await npcImg(ENEMY[key].img); } catch (e) { return; }
    hunted = new Ent({ id: 'bounty', x: at[0], y: at[1], dir: 'down', img, size: ENEMY[key].size, name: b.name, ai: 'wander', area: [at[0] - 4, at[1] - 4, at[0] + 4, at[1] + 4], talk: () => huntFight(b, key) });
    hunted.__b = b; hunted.__k = key; W.ents.push(hunted);
  }
  let busyFight = false;
  async function huntFight(b, key) {
    if (busyFight) return; busyFight = true;
    try {
      const r = await Battle.start({ enemies: [key], boss: true, noFlee: true, bd: SCENES[b.scene].bd, music: 'boss', intro: 'BOUNTY — ' + b.name.toUpperCase() });
      if (r === 'lose') { await Story.defeat(); return; }
      if (r !== 'win') return;
      b.state = 'done'; World.ents = World.ents.filter(e => e.id !== 'bounty'); hunted = null;
      toast(`<b style="color:#ff6a4a">${b.name.toUpperCase()} SLAIN</b> — collect your bounty at the Crossroads board.`, 3400); save();
    } finally { busyFight = false; }
  }

  /* ---------- 2. rare spawns ---------- */
  let rare = null;
  function drawCritter(c, k, x, y, t, flip) {
    const d = (a, b, w, h, col) => { c.fillStyle = col; c.fillRect(flip ? x - a - w : x + a, y + b, w, h); };
    if (k === 'deer') {
      const g = '#e8b830', g2 = '#f8dc70', run = Math.sin(t / 70) > 0 ? 1 : 0;
      d(-9, -12, 16, 7, g); d(-9, -12, 16, 2, g2); d(5, -18, 5, 8, g); d(8, -20, 4, 4, g); d(11, -19, 2, 1, '#000');
      d(6, -25, 1, 6, '#c8a050'); d(4, -26, 3, 1, '#c8a050'); d(9, -25, 1, 5, '#c8a050'); d(9, -26, 3, 1, '#c8a050');
      d(-8, -5, 2, 6 - run * 2, g); d(-4, -5, 2, 6 - (1 - run) * 2, g); d(2, -5, 2, 6 - run * 2, g); d(5, -5, 2, 6 - (1 - run) * 2, g); d(-11, -12, 3, 3, '#fff');
    } else {
      const g = '#9af0ff', g2 = '#e6fbff', run = Math.sin(t / 60) > 0 ? 1 : 0;
      d(-7, -9, 12, 5, g); d(-7, -9, 12, 1, g2); d(4, -12, 5, 5, g); d(7, -14, 2, 3, g); d(4, -14, 2, 3, g); d(8, -10, 1, 1, '#023');
      d(-13, -11, 7, 3, g); d(-15, -12, 3, 3, g2); d(-6, -4, 2, 4 - run, g); d(-2, -4, 2, 4 - (1 - run), g); d(1, -4, 2, 4 - run, g); d(3, -4, 2, 4 - (1 - run), g);
      c.fillStyle = `rgba(154,240,255,${(.15 + .1 * Math.sin(t / 200)).toFixed(2)})`; c.beginPath(); c.arc(x, y - 8, 16, 0, 7); c.fill();
    }
  }
  function maybeRare(scene) {
    rare = null; if (!FOREST.includes(scene) || Math.random() > .12) return;
    const M = World.map, re = reach(MK[scene]), p = World.player, cand = [];
    for (let i = 0; i < 400; i++) { const x = 4 + Math.floor(Math.random() * (M.w - 8)), y = 4 + Math.floor(Math.random() * (M.h - 8)); if (re.has(x + ',' + y) && Math.abs(x - p.x) + Math.abs(y - p.y) > 9) { cand.push([x, y]); break; } }
    if (!cand.length) return;
    const k = Math.random() < .5 ? 'deer' : 'fox'; rare = { k, x: cand[0][0], y: cand[0][1], px: cand[0][0] * TILE + 16, py: cand[0][1] * TILE + 26, t0: performance.now(), next: 0, flip: false };
    toast(k === 'deer' ? '<b style="color:#ffd34a">A GOLDEN DEER</b> was seen in these woods…' : '<b style="color:#9af0ff">A SPIRIT FOX</b> flickers somewhere in the trees…', 3000);
  }
  function rareTick(c, t) {
    if (!rare || World.busy) return drawRare(c, t);
    const p = World.player, d = Math.abs(rare.x - p.x) + Math.abs(rare.y - p.y), now = performance.now();
    if (now - rare.t0 > 90000) { rare = null; return; }
    if (d <= 1) { const r = rare; rare = null; Story.run(() => caught(r.k)); return; }
    if (d <= 5 && now > rare.next) {
      const opts = [[1, 0], [-1, 0], [0, 1], [0, -1]].map(([a, b]) => [rare.x + a, rare.y + b]).filter(([x, y]) => World.col[y] && World.col[y][x] === 0 && !World.ents.some(e => e.x === x && e.y === y))
        .sort((a, b) => (Math.abs(b[0] - p.x) + Math.abs(b[1] - p.y)) - (Math.abs(a[0] - p.x) + Math.abs(a[1] - p.y)));
      if (opts.length) { rare.flip = opts[0][0] < rare.x; rare.x = opts[0][0]; rare.y = opts[0][1]; }
      rare.next = now + (rare.k === 'fox' ? 260 : 300);
    }
    drawRare(c, t);
  }
  function drawRare(c, t) {
    if (!rare) return; rare.px += (rare.x * TILE + 16 - rare.px) * .25; rare.py += (rare.y * TILE + 26 - rare.py) * .25;
    const cx = Math.round(World.cam.x), cy = Math.round(World.cam.y); drawCritter(c, rare.k, rare.px - cx, rare.py - cy, t, rare.flip);
  }
  async function caught(k) {
    sfx('level');
    if (k === 'deer') { G.S.gold += 200; const n = giveRare(); await narr(`The golden deer stops, looks right at you — and bows its head. Where it stood: 200 gold${n ? ` and a <b style="color:#ffd36a">${n}</b>` : ''}.`); }
    else { const a = giveRare(), b = giveRare(); await narr(`The spirit fox lets you touch its ear, then bursts into blue light. It leaves behind${a ? ` a <b style="color:#ffd36a">${a}</b>` : ''}${b ? ` and a <b style="color:#ffd36a">${b}</b>` : ''}.`); }
    S_().rareCaught = (S_().rareCaught || 0) + 1; UI.hud(); save();
  }

  /* ---------- 3. weather that matters (mini map sight) ---------- */
  if (typeof MiniMap !== 'undefined') {
    const _rev = MiniMap.reveal.bind(MiniMap);
    MiniMap.reveal = function () {
      const fog = typeof Ambient !== 'undefined' && Ambient.weather === 'fog', bl = typeof Weather !== 'undefined' && Weather.kind === 'blizzard' && G.S.map === 'woods_n';
      this.R = bl ? 3 : fog ? 4 : 7; return _rev();
    };
  }

  /* ---------- 4. ruins to restore ---------- */
  const RUINS = {
    woods: { match: /ruined shrine, older than Ashford/, name: 'the Wayshrine', cost: 500, done: 'The shrine stands whole again: fresh stone, a lit lamp, a basin of clear water. Rest here any time — it heals you.' },
    woods_n: { match: /watchtower, broken off/, name: 'the Mistveil watchtower', cost: 350, done: 'You climb the rebuilt tower. From the top, all of Mistveil spreads out below you — your map fills in.' },
    woods_e: { match: /Scorched pillars/, name: 'the Emberroot lookout', cost: 350, done: 'The pillars are braced and a lookout platform built between them. All of Emberroot is laid out below — your map fills in.' }
  };
  function hookRuins() {
    for (const [scene, Rr] of Object.entries(RUINS)) {
      const T = SCENES[scene] && SCENES[scene].tiles; if (!T) continue;
      for (const k of Object.keys(T)) if (Rr.match.test(String(T[k]))) {
        const prev = T[k];
        T[k] = async () => {
          const f = F(), key = 'ruin_' + scene;
          if (f[key]) { if (scene === 'woods') { Story.heal(); await narr('You rest at the Wayshrine. The water is cold and tastes of stone. You feel whole.'); save(); } else { mapAll(scene); await narr('From the tower you can see the whole forest.'); } return; }
          await prev();
          if (await pay(Rr.cost, `Hire masons from Ashford to restore ${Rr.name}`)) { f[key] = 1; if (scene !== 'woods') mapAll(scene); await narr(Rr.done); save(); World.lights.push(...ruinLight(scene)); }
        };
        T[k].toString = () => String(prev);
      }
    }
  }
  function ruinLight(scene) {
    const k = Object.keys(SCENES[scene].tiles).find(k => RUINS[scene].match.test(String(SCENES[scene].tiles[k]))); if (!k) return [];
    const [x, y] = k.split(',').map(Number); return [{ x: x * TILE + 16, y: y * TILE - 20, r: 110, c: '255,200,120' }];
  }
  function mapAll(scene) {
    const mk = MK[scene], M = G.maps[mk]; G.S.fcfog = G.S.fcfog || {}; G.S.fcfog[mk] = '1'.repeat(M.w * M.h); if (typeof MiniMap !== 'undefined') MiniMap.ckey = '';
  }

  /* ---------- 5. explorer's tally ---------- */
  function forestStats(scene) {
    const S = S_(), mk = MK[scene], fi = FOREST.indexOf(scene), g = { woods_n: 'fc_grotto_n', woods_e: 'fc_grotto_e', woods_s: 'fc_grotto_s', woods_w: 'fc_grotto_w' }[scene];
    const gs = { woods_n: 'grotto_n', woods_e: 'grotto_e', woods_s: 'grotto_s', woods_w: 'grotto_w' }[scene];
    const CP = (typeof CHESTPOS !== 'undefined' && CHESTPOS) || {};
    const chestKeys = (CP[mk] || []).map(([x, y]) => `${scene}:${x},${y}`).concat(g ? (CP[g] || []).map(([x, y]) => `${gs}:${x},${y}`) : []);
    const items = [];
    for (const k of chestKeys) items.push(!!(S.chests || {})[k]);
    if (window.WorldPlus) WorldPlus.cacheSpots(scene).forEach((_, i) => items.push(!!F()[`cache_${scene}_${i}`]));
    if (fi >= 0) { const L = S.lore12 || []; items.push(L.includes(fi * 2), L.includes(fi * 2 + 1), L.includes(8 + fi), !!F()['grotto_' + scene]); }
    items.push(!!(S.camps || {})[scene]);
    if (fi >= 0) items.push(!!F()['moon_' + scene]);
    const n = items.filter(Boolean).length; return { n, of: items.length, pct: Math.round(100 * n / items.length) };
  }
  async function tally() {
    const S = S_(); S.tallyPaid = S.tallyPaid || {};
    const rows = ['woods', ...FOREST].map(s => { const t = forestStats(s); return `${SCENES[s].subtitle === 'Where the four woods meet' ? 'The Crossroads' : SCENES[s].subtitle}: ${t.pct}% (${t.n}/${t.of})`; });
    await narr("Explorer's tally — " + rows.join(' · '));
    for (const s of ['woods', ...FOREST]) if (forestStats(s).pct >= 100 && !S.tallyPaid[s]) {
      S.tallyPaid[s] = 1; const n = giveRare(); G.S.gold += 300; UI.hud(); sfx('level');
      await narr(`You've uncovered every secret of ${s === 'woods' ? 'the Crossroads' : SCENES[s].subtitle}. The Adventurers' Guild pays explorers well: 300 gold${n ? ` and a <b style="color:#ffd36a">${n}</b>` : ''}.`); save();
    }
  }

  /* ---------- 6. moonstones ---------- */
  async function moonstone(scene) {
    const k = 'moon_' + scene;
    if (F()[k]) { await narr('A flat, pale stone. Its light has gone quiet.'); return; }
    if (night() < .5) { await narr('A flat, pale stone. In the right light it looks almost silver.'); return; }
    F()[k] = 1; const n = giveRare(), gold = 120 + Math.floor(Math.random() * 80); G.S.gold += gold; UI.hud(); sfx('level');
    await narr(`Under the moon the stone glows like water. When you touch it, it slides aside: a hollow beneath, and in it ${gold} gold${n ? ` and a <b style="color:#ffd36a">${n}</b>` : ''}.`);
    save();
  }

  /* ---------- 7. your homestead ---------- */
  const HOME_AT = () => spot('woods_w', 401, (M, x, y) => { const cov = covered('fc_west'); for (let dy = -1; dy <= 1; dy++) for (let dx = -2; dx <= 2; dx++) if (M.col[y + dy][x + dx] !== '0' || M.mm[y + dy][x + dx] !== 'g' || cov.has((x + dx) + ',' + (y + dy))) return false; return true; });
  const home = () => (S_().home = S_().home || { tier: 0 });
  async function homeTalk() {
    const H = home();
    if (H.tier === 0) {
      await narr('A sunny clearing in the Old Grove, sheltered by the big trees. A weathered stake reads: LAND FOR SETTLING — ENQUIRE AT THE GUILD.');
      if (await pay(400, 'Buy the deed and pitch a tent here')) { H.tier = 1; await narr('It\'s yours. A tent, a fire pit, a bedroll. Not much — but nobody can tell you to leave.'); save(); await World.go('woods_w', HOME_AT()[0], HOME_AT()[1] + 1, 'up'); }
      return;
    }
    const opts = ['Rest (full heal)'];
    if (H.tier === 1) opts.push('Build a garden — 300g'); if (H.tier === 2) opts.push('Build a trophy stand — 500g');
    opts.push('Travel to a camp', 'Leave');
    const ch = await ask(null, null, 'Your homestead.', opts), pick = opts[ch];
    if (pick === 'Rest (full heal)') { Story.heal(); await narr('You sleep by your own fire. It\'s the best sleep you\'ve had in years.'); save(); }
    else if (pick && pick.startsWith('Build a garden') && await pay(300, 'Dig and fence a herb garden')) { H.tier = 2; H.plant = S_().steps || 0; await narr('A little fenced garden. Moonpetals grow here while you\'re away.'); save(); await World.go('woods_w', HOME_AT()[0], HOME_AT()[1] + 1, 'up'); }
    else if (pick && pick.startsWith('Build a trophy') && await pay(500, 'Raise a trophy stand')) { H.tier = 3; await narr('A carved stand for your trophies. Your homestead is a camp now — you can fast-travel here from any campfire.'); save(); await World.go('woods_w', HOME_AT()[0], HOME_AT()[1] + 1, 'up'); }
    else if (pick === 'Travel to a camp' && window.WorldPlus) await WorldPlus.campTalk(HOME_CAMP);
  }
  async function garden() {
    const H = home(), grown = (S_().steps || 0) - (H.plant || 0);
    if (grown < 150) { await narr(`The moonpetals are still growing. (Come back after a good walk — ${150 - grown} more steps.)`); return; }
    H.plant = S_().steps || 0; const n = 2 + (Math.random() < .4 ? 1 : 0);
    if (typeof Quests !== 'undefined' && Quests.addItem) Quests.addItem('moonpetal', n);
    sfx('heal'); await narr(`You harvest ${n} moonpetals from your garden.`); save();
  }
  async function trophies() {
    const S = S_(), f = F(), bosses = Object.keys(f).filter(k => /^clear_d_/.test(k)).length, sb = Object.keys(f).filter(k => /^dx_.*_sb\d$/.test(k)).length;
    const bty = `${S.bountiesPaid || 0} (${RANKS[rankIx()][0]} rank)`;
    await narr(`Your trophy stand — dungeon lords beaten: ${bosses} · secret bosses: ${sb} · bounties: ${bty} · rare beasts befriended: ${S.rareCaught || 0} · fish caught: ${S.fishCaught || 0} · Chronicle stones: ${(S.lore12 || []).length}/12.`);
  }
  const HOME_CAMP = { id: 'home', scene: 'woods_w', name: 'Your homestead', get at() { return HOME_AT(); }, show: () => home().tier >= 3 };
  if (window.WorldPlus) WorldPlus.CAMPS.push(HOME_CAMP);
  function buildHome(W) {
    const at = HOME_AT(); if (!at) return; const [x, y] = at, H = home();
    if (H.tier === 0) { W.extraProps.push({ k: 'fc_w_sign', x, y }); W.col[y][x] = 1; W.ents.push(new Ent({ id: 'home', x, y, dir: 'down', img: blank(), pickup: 1, name: '', talk: homeTalk })); return; }
    W.extraProps.push({ k: 'fc_w_tent', x, y }); W.col[y][x] = 1; W.col[y][x - 1] = 1; W.col[y][x + 1] = 1;
    W.addFire(x + 2, y + 1); W.extraProps.push({ k: 'fc_w_roll', x: x - 2, y: y + 1 });
    W.ents.push(new Ent({ id: 'home', x, y, dir: 'down', img: blank(), pickup: 1, name: '', talk: homeTalk }));
    if (H.tier >= 2) { W.ents.push(new Ent({ id: 'home_garden', x: x - 2, y: y - 1, dir: 'down', img: gardenImg((S_().steps || 0) - (H.plant || 0) >= 150), pickup: 1, name: 'Garden', talk: garden })); }
    if (H.tier >= 3) { W.col[y - 1][x + 2] = 1; W.ents.push(new Ent({ id: 'home_trophy', x: x + 2, y: y - 1, dir: 'down', img: trophyImg(), pickup: 1, name: 'Trophies', talk: trophies })); found()['home'] = 1; }
  }
  const found = () => (G.S.camps = G.S.camps || {});
  const trophyImg = (() => { let S; return () => S || (S = sheet(x => {
    R(x, 'rgba(0,0,0,.3)', 14, 58, 36, 4); R(x, '#5a3a20', 16, 26, 4, 34); R(x, '#5a3a20', 44, 26, 4, 34); R(x, '#7a5030', 12, 24, 40, 5); R(x, '#9a6a40', 12, 24, 40, 1); R(x, '#6b4a2a', 18, 46, 28, 3);
    R(x, '#e8e0cc', 28, 12, 8, 9); R(x, '#2a2018', 30, 15, 2, 2); R(x, '#2a2018', 33, 15, 2, 2); R(x, '#e8e0cc', 22, 6, 2, 8); R(x, '#e8e0cc', 40, 6, 2, 8); R(x, '#e8e0cc', 20, 6, 4, 2); R(x, '#e8e0cc', 40, 6, 4, 2); R(x, '#e8e0cc', 25, 10, 3, 2); R(x, '#e8e0cc', 36, 10, 3, 2);
    R(x, '#c0c8d0', 20, 34, 2, 12); R(x, '#8a6038', 19, 44, 4, 3); R(x, '#d8a838', 38, 36, 6, 8); R(x, '#f0d060', 39, 37, 2, 2); R(x, '#4a8ad8', 29, 36, 6, 6); R(x, '#9fd0ff', 30, 37, 2, 2);
  })); })();
  const gardenImg = ripe => sheet(x => {
    R(x, '#5a3a20', 12, 40, 40, 18); R(x, '#6b4a2a', 12, 40, 40, 2); R(x, '#8a6038', 10, 36, 2, 24); R(x, '#8a6038', 52, 36, 2, 24); R(x, '#8a6038', 10, 36, 44, 2);
    for (let i = 0; i < 5; i++) { R(x, '#3f8a2e', 16 + i * 7, 44, 2, 8); if (ripe) { R(x, '#cfe6ff', 15 + i * 7, 41, 4, 4); R(x, '#9fd8ff', 16 + i * 7, 42, 2, 2); } }
  });

  /* ---------- wiring ---------- */
  const BOARD_AT = () => spot('woods', 11, (M, x, y) => Math.abs(x - 24) + Math.abs(y - 20) < 9 && [[1, 0], [-1, 0], [0, 1], [0, -1]].some(([a, b]) => M.mm[y + b][x + a] === 'p'));
  const MOON_AT = sc => spot(sc, 223);
  const _load = World.load.bind(World);
  World.load = async function (name, ...a) {
    const r = await _load(name, ...a);
    try {
      if (name === 'woods') { const b = BOARD_AT(); if (b) { World.col[b[1]][b[0]] = 1; World.ents.push(new Ent({ id: 'board', x: b[0], y: b[1], dir: 'down', img: boardImg(), pickup: 1, name: 'Wanted board', talk: boardTalk })); } }
      if (FOREST.includes(name)) {
        await spawnBounty(World, name); maybeRare(name);
        const m = MOON_AT(name); if (m) { World.extraProps.push({ k: 'fc_n_rock2', x: m[0], y: m[1] }); World.col[m[1]][m[0]] = 1; World.ents.push(new Ent({ id: 'moon', x: m[0], y: m[1], dir: 'down', img: blank(), pickup: 1, name: '', talk: () => moonstone(name) })); if (!F()['moon_' + name]) World.lights.push({ x: m[0] * TILE + 16, y: m[1] * TILE, r: 70, c: '200,220,255' }); }
      } else rare = null;
      if (name === 'woods_w') buildHome(World);
      for (const [sc] of Object.entries(RUINS)) if (sc === name && F()['ruin_' + sc]) World.lights.push(...ruinLight(sc));
      if (MK[name]) World.buildPropList();
    } catch (e) { console.warn('worldplus4', e); }
    return r;
  };
  const _step = World.onStep.bind(World);
  World.onStep = function (e) {
    const r = _step(e);
    try { if (e && e.isPlayer && hunted && !World.busy && Math.abs(hunted.x - e.x) + Math.abs(hunted.y - e.y) <= 1 && World.ents.includes(hunted)) { const h = hunted; Story.run(() => huntFight(h.__b, h.__k)); } } catch (x) { }
    return r;
  };
  if (typeof MiniMap !== 'undefined') {
    const _draw = MiniMap.draw.bind(MiniMap);
    MiniMap.draw = function (c) {
      _draw(c);
      try {
        if (!this.on() || !this.box || !hunted || !World.ents.includes(hunted)) return;
        const [X, Y, w] = this.box, s = w / World.map.w, px = X + hunted.x * s + s / 2, py = Y + hunted.y * s + s / 2;
        c.fillStyle = '#ff3a3a'; c.fillRect(px - 3, py - .7, 6, 1.6); c.fillRect(px - .7, py - 3, 1.6, 6);
      } catch (e) { }
    };
  }
  const _render = World.render.bind(World);
  World.render = function (c, t) {
    _render(c, t);
    try {
      if (!World.player || World.loading) return;
      if (FOREST.includes(G.S.map)) {
        rareTick(c, t);
        const m = MOON_AT(G.S.map);
        if (m && !F()['moon_' + G.S.map] && night() > .5) { const cx = Math.round(World.cam.x), cy = Math.round(World.cam.y), k = .5 + .5 * Math.sin(t / 500); c.fillStyle = `rgba(210,230,255,${(.25 + .35 * k).toFixed(2)})`; c.beginPath(); c.ellipse(m[0] * TILE + 16 - cx, m[1] * TILE + 18 - cy, 14 + k * 4, 6 + k * 2, 0, 0, 7); c.fill(); }
      }
    } catch (e) { }
  };
  hookRuins();
  window.WorldPlus4 = { get rare() { return rare; }, get hunted() { return hunted; }, huntFight, boardExtras, RANKS, rankIx, giveRare, pay, reach, covered, bounties, forestStats, spot, HOME_AT, BOARD_AT, MOON_AT };
})();
