'use strict';
/* ================= WORLD+ (Chat B — World & Maps) =================
   1. SEE-THROUGH — tall props (trees, roofs, ruins, statues) fade when Ren walks behind them. Works on every map.
   2. HIDDEN CACHES — 3 buried caches in every forest (2 at the Crossroads), tucked into the trees. Invisible until you're
      close; then a faint glint. Dig for gold and crafting parts.
   3. NIGHT GLOW — at night the woods light up: glowing mushrooms, the giant trees, standing stones, waterfalls, cave mouths.
   4. WILDLIFE — birds that peck and scatter when Ren comes close, fish jumping in the ponds, butterflies by day, fireflies by night.
   5. CAMP FAST TRAVEL — find a forest camp (walk near it) and you can travel between every camp you've found from its campfire.
   6. MAP PINS — the four woods' dungeons on the world map. */
(function () {
  const MK = { woods: 'fc_cross', woods_n: 'fc_north', woods_e: 'fc_east', woods_s: 'fc_south', woods_w: 'fc_west' };
  const F = () => G.S.f;
  const night = () => (typeof Ambient !== 'undefined' && Ambient.night) || 0;
  const fc = () => World.map && World.map.fc && MK[G.S.map];
  const blank = (() => { let S; return () => { if (S) return S; S = document.createElement('canvas'); S.width = 64 * 9; S.height = 64 * 12; return S; }; })();
  const rng = seed => () => { seed = (seed * 1664525 + 1013904223) >>> 0; return seed / 4294967296; };

  /* ---------- 1. see-through tall props ---------- */
  function fades() {
    const p = World.player; if (!p || !World.propsDraw) return;
    for (const o of World.propsDraw) {
      const md = o.md; if (!md || !md.r) continue; const sw = md.r[2], sh = md.r[3];
      const behind = sh > 56 && o.by > p.py && p.py > o.dy + 10 && p.px > o.dx + 8 && p.px < o.dx + sw - 8 && p.py - 44 < o.by;
      const cur = o.fade || 1, want = behind ? .4 : 1, nx = cur + (want - cur) * .22;
      o.fade = Math.abs(nx - 1) < .02 ? undefined : nx;
    }
  }

  /* ---------- 2. hidden caches ---------- */
  function cacheSpots(scene) {
    const mk = MK[scene], M = G.maps[mk]; if (!M || !M.mm) return [];
    if (M.__caches) return M.__caches;
    const r = rng(mk.length * 977 + 31), cand = [];
    // only spots Ren can actually walk to (flood from the way in)
    const ex = (FCL[mk].exits.find(e => e.to) || FCL[mk].exits[0]), reach = new Set([ex.x + ',' + ex.y]), q = [[ex.x, ex.y]];
    while (q.length) { const [a, b] = q.shift(); for (const [dx, dy] of [[1, 0], [-1, 0], [0, 1], [0, -1]]) { const x = a + dx, y = b + dy, k = x + ',' + y;
      if (!reach.has(k) && M.col[y] && M.col[y][x] === '0') { reach.add(k); q.push([x, y]); } } }
    for (let y = 4; y < M.h - 4; y++) for (let x = 4; x < M.w - 4; x++) {
      if (M.mm[y][x] !== 'g' || M.col[y][x] !== '0' || !reach.has(x + ',' + y)) continue;
      let t = 0; for (let dy = -1; dy <= 1; dy++) for (let dx = -1; dx <= 1; dx++) if (M.mm[y + dy][x + dx] === 'T') t++;
      if (t >= 4) cand.push([x, y]);
    }
    const out = [], n = scene === 'woods' ? 2 : 3;
    for (let i = 0; i < n && cand.length; i++) {
      let best = null, bd = -1;
      for (let k = 0; k < 60; k++) { const c = cand[Math.floor(r() * cand.length)]; const d = out.length ? Math.min(...out.map(o => Math.abs(o[0] - c[0]) + Math.abs(o[1] - c[1]))) : 99; if (d > bd) { bd = d; best = c; } }
      out.push(best);
    }
    return (M.__caches = out);
  }
  async function dig(scene, i) {
    const k = `cache_${scene}_${i}`; if (F()[k]) return;
    await narr('Something glints between the roots. You dig with your hands — and hit the lid of an old buried box.');
    F()[k] = 1; World.ents = World.ents.filter(e => e.id !== 'cache_' + i);
    const r = Math.random(), gold = 40 + Math.floor(Math.random() * 80); G.S.gold += gold;
    let got = `${gold} gold`;
    if (typeof PARTS !== 'undefined' && typeof Gear !== 'undefined') {
      const keys = Object.keys(PARTS), rare = keys.filter(p => PARTS[p].rare), common = keys.filter(p => !PARTS[p].rare);
      const pick = (r < .3 && rare.length ? rare : common)[Math.floor(Math.random() * (r < .3 ? rare.length : common.length))];
      const n = r < .3 ? 1 : 2; Gear.give(pick, n); got += ` and ${n}× <b style="color:#ffd36a">${PARTS[pick].n}</b>`;
    }
    sfx('level'); UI.hud(); toast(`<b style="color:#ffd34a">HIDDEN CACHE</b> — ${got}`, 3200); save();
  }

  /* ---------- 3. night glow ---------- */
  const GLOW = [[/^fc_s_mush|^fc_s_moss/, '90,240,210', 46], [/^fc_swampking$/, '90,240,200', 150], [/^fc_emberking$/, '255,140,50', 160], [/^fc_ancient$/, '160,220,255', 150],
    [/^fc_n_rock1$/, '120,180,255', 70], [/^fc_w_rock3$/, '110,210,255', 60], [/^fc_[nesw]fall$/, '200,230,255', 110], [/^fc_[nesw]cave$/, '255,180,110', 90], [/^fc_lantern$/, '255,200,120', 80],
    [/^fc_w_mural$/, '110,255,160', 110], [/^fc_grandtree$/, '220,255,150', 120]];
  function addGlows(W) {
    for (const p of (W.map.props || [])) for (const [re, c, r] of GLOW) if (re.test(p.k)) { W.lights.push({ x: p.x * TILE + 16 + (p.ox || 0), y: p.y * TILE - 10, r, c }); break; }
  }

  /* ---------- 4. wildlife ---------- */
  let birds = [], fish = [], motes = [];
  function spawnLife() {
    birds = []; fish = []; motes = [];
    const M = World.map; if (!M || !M.mm) return;
    const r = rng(Date.now() & 0xffff), grass = [], water = [];
    for (let y = 2; y < M.h - 2; y++) for (let x = 2; x < M.w - 2; x++) { const c = M.mm[y][x]; if (c === 'g' || c === 'p') grass.push([x, y]); else if (c === 'w') water.push([x, y]); }
    const pal = { woods: ['#6b4a2a', '#c9a36a'], woods_n: ['#3a4a5a', '#e8eef4'], woods_e: ['#7a2e14', '#f0a830'], woods_s: ['#2a3a30', '#6af0d8'], woods_w: ['#4a3a1a', '#f2e070'] }[G.S.map] || ['#5a4030', '#d0b080'];
    for (let i = 0; i < 14 && grass.length; i++) { const [x, y] = grass[Math.floor(r() * grass.length)]; birds.push({ x: x * TILE + 16, y: y * TILE + 20, vx: 0, vy: 0, fly: 0, ph: r() * 6, c: pal }); }
    for (let i = 0; i < 6 && water.length; i++) { const [x, y] = water[Math.floor(r() * water.length)]; fish.push({ x: x * TILE + 16, y: y * TILE + 16, t: r() * 6000 }); }
    for (let i = 0; i < 26; i++) motes.push({ x: r(), y: r(), p: r() * 6 });
  }
  function drawLife(c, t) {
    const p = World.player, cx = Math.round(World.cam.x), cy = Math.round(World.cam.y), w = G.view.w, h = G.view.h, n = night();
    for (const b of birds) {
      const sx = b.x - cx, sy = b.y - cy;
      if (!b.fly && Math.hypot(b.x - p.px, b.y - p.py) < 70) { b.fly = 1; const a = Math.atan2(b.y - p.py, b.x - p.px); b.vx = Math.cos(a) * 2.2; b.vy = -2.4; }
      if (b.fly) { b.x += b.vx; b.y += b.vy; b.vy -= .03; if (b.y - cy < -40) { b.gone = 1; } }
      if (b.gone || sx < -20 || sy < -20 || sx > w + 20 || sy > h + 20 || n > .6) continue;
      c.fillStyle = 'rgba(0,0,0,.25)'; if (!b.fly) c.fillRect(sx - 2, sy + 2, 5, 1);
      c.fillStyle = b.c[0];
      if (b.fly) { const f = Math.sin(t / 50 + b.ph) > 0; c.fillRect(sx - 3, sy - (f ? 2 : 0), 3, 1); c.fillRect(sx + 1, sy - (f ? 2 : 0), 3, 1); c.fillRect(sx - 1, sy - 1, 3, 2); }
      else { const peck = Math.sin(t / 300 + b.ph) > .7 ? 1 : 0; c.fillRect(sx - 2, sy - 3 + peck, 4, 3); c.fillStyle = b.c[1]; c.fillRect(sx + 2, sy - 3 + peck * 2, 1, 1); }
    }
    for (const f of fish) {
      const ph = ((t + f.t) % 5200) / 5200, sx = f.x - cx, sy = f.y - cy;
      if (sx < -20 || sy < -20 || sx > w + 20 || sy > h + 20) continue;
      if (ph < .12) { const k = ph / .12, jx = sx - 8 + k * 16, jy = sy - Math.sin(k * Math.PI) * 12; c.fillStyle = 'rgba(200,220,235,.9)'; c.fillRect(jx - 2, jy - 1, 4, 2); }
      if (ph > .1 && ph < .3) { const k = (ph - .1) / .2; c.strokeStyle = `rgba(255,255,255,${(.6 * (1 - k)).toFixed(2)})`; c.lineWidth = 1; c.beginPath(); c.ellipse(sx + 8, sy, 3 + k * 9, 1.5 + k * 3, 0, 0, 7); c.stroke(); }
    }
    // butterflies by day, fireflies by night
    const fire = n > .35, col = fire ? (G.S.map === 'woods_s' ? '120,255,220' : '230,255,140') : ({ woods_n: '235,245,255', woods_e: '255,170,60' }[G.S.map] || '255,240,160');
    for (const m of motes) {
      const x = ((m.x * w + Math.sin(t / 1400 + m.p * 3) * 30) % w + w) % w, y = ((m.y * h + Math.cos(t / 1700 + m.p) * 22) % h + h) % h;
      const a = fire ? (.35 + .6 * Math.max(0, Math.sin(t / 380 + m.p * 9))) : .8;
      if (!fire && m.p > 2.5) continue;
      c.fillStyle = `rgba(${col},${a.toFixed(2)})`;
      if (fire) c.fillRect(x, y, 2, 2); else { const f = Math.sin(t / 90 + m.p * 7) > 0; c.fillRect(x - (f ? 2 : 1), y, f ? 2 : 1, 2); c.fillRect(x + 1, y, f ? 2 : 1, 2); }
    }
  }

  /* ---------- 5. camp fast travel ---------- */
  const CAMPS = (() => {
    const fire = mk => FCL[mk] && FCL[mk].fires && FCL[mk].fires[0];
    const sign = (FCL.fc_cross.look.find(l => l.text === 'sign_cross') || { t: [[20, 17]] }).t[0];
    return [
      { scene: 'woods', name: 'The Crossroads signpost', at: sign },
      { scene: 'woods_n', name: 'Mistveil — the Green Eclipse camp', at: fire('fc_north') },
      { scene: 'woods_e', name: 'Emberroot — the road camp', at: fire('fc_east') },
      { scene: 'woods_s', name: 'Glimmerfen — Old Wick\'s fire', at: fire('fc_south') },
      { scene: 'woods_w', name: 'The Old Grove — Ysolde\'s camp', at: fire('fc_west') }
    ].filter(c => c.at);
  })();
  const found = () => (G.S.camps = G.S.camps || {});
  async function campTalk(c, before) {
    if (before) await before();
    found()[c.scene] = 1;
    const list = CAMPS.filter(o => found()[o.scene] && o.scene !== c.scene);
    if (!list.length) { await narr('A good place to rest. (Find the other forest camps and you can travel between them from here.)'); return; }
    const ch = await ask(null, null, 'Travel to another camp?', [...list.map(o => o.name), 'Stay here']);
    const dest = list[ch]; if (!dest) return;
    sfx('blip'); await World.go(dest.scene, dest.at[0], dest.at[1] + 1, 'down');
  }
  function hookCamps() {
    for (const c of CAMPS) {
      const S = SCENES[c.scene]; if (!S) continue; const T = S.tiles; if (!T) continue;
      const key = c.at[0] + ',' + c.at[1], prev = T[key];
      T[key] = () => campTalk(c, prev);
    }
  }
  function discover() {
    const p = World.player; if (!p) return;
    for (const c of CAMPS) if (c.scene === G.S.map && !found()[c.scene] && Math.abs(p.x - c.at[0]) + Math.abs(p.y - c.at[1]) <= 5) {
      found()[c.scene] = 1; toast(`<b style="color:#ff9a3a">CAMP FOUND</b> — ${c.name}. Rest at its fire to travel between camps.`, 3400); save();
    }
  }

  /* ---------- 6. map pins ---------- */
  if (typeof MAPLOC !== 'undefined') {
    const W0 = MAPLOC.find(l => l.id === 'woods'), bx = W0 ? W0.x : .755, by = W0 ? W0.y : .735;
    const cv = (mk, d) => FCL[mk].caves[d];
    const pins = [
      ['dg_fang', 'Hollow Fang Den', 'Rank E dungeon under the cliffs of Mistveil Pines, north of the Crossroads.', 'woods_n', 'fc_north', 'd_fang', 0, -.03],
      ['dg_cinder', 'Cinder Hollow', 'Rank D dungeon in the Emberroot Wilds, east of the Crossroads.', 'woods_e', 'fc_east', 'd_cinder', .022, -.012],
      ['dg_shrine', 'The Sunken Shrine', 'Rank C dungeon under the cliff in Glimmerfen, south of the Crossroads.', 'woods_s', 'fc_south', 'd_shrine', .004, .028],
      ['dg_dragvault', 'The Drag Vault', 'Rank C dungeon in the north cliff of the Old Grove. Sealed from the inside.', 'woods_w', 'fc_west', 'd_vault', -.024, -.006]
    ];
    for (const [id, name, text, scene, mk, d, dx, dy] of pins) if (!MAPLOC.some(l => l.id === id)) {
      const c = cv(mk, d); MAPLOC.push({ id, name, kind: 'dungeon', x: bx + dx, y: by + dy, text, scene: [scene, c.back[0], c.back[1], 'down'], dungeon: d });
    }
    const wr = MAPLOC.find(l => l.id === 'dg_warren'); if (wr) wr.text = 'Rank E dungeon in the Old Grove, past the river bend.';
    if (W0) W0.text = 'The Crossroads, and the four woods around it: Mistveil Pines, Emberroot Wilds, Glimmerfen and the Old Grove. ' + W0.text;
  }

  /* ---------- wiring ---------- */
  const _load = World.load.bind(World);
  World.load = async function (name, ...a) {
    const r = await _load(name, ...a);
    try {
      if (MK[name]) {
        addGlows(World); spawnLife();
        cacheSpots(name).forEach(([x, y], i) => {
          if (F()[`cache_${name}_${i}`] || World.ents.some(e => e.x === x && e.y === y)) return;
          World.ents.push(new Ent({ id: 'cache_' + i, x, y, dir: 'down', img: blank(), pickup: 1, name: '', talk: () => dig(name, i) }));
        });
        discover();
      } else { birds = []; fish = []; motes = []; }
    } catch (e) { console.warn('worldplus', e); }
    return r;
  };
  const _step = World.onStep.bind(World);
  World.onStep = function (e) { const r = _step(e); try { if (e && e.isPlayer && MK[G.S.map]) discover(); } catch (x) { } return r; };
  const _render = World.render.bind(World);
  World.render = function (c, t) {
    try { fades(); } catch (e) { }
    _render(c, t);
    try {
      if (!World.player || World.loading || !MK[G.S.map]) return;
      drawLife(c, t);
      // a glint over any cache Ren is close to
      const p = World.player, cx = Math.round(World.cam.x), cy = Math.round(World.cam.y);
      for (const e of World.ents) if (/^cache_/.test(e.id) && Math.abs(e.x - p.x) + Math.abs(e.y - p.y) <= 3) {
        const k = .5 + .5 * Math.sin(t / 260 + e.x), x = e.x * TILE + 16 - cx, y = e.y * TILE + 20 - cy;
        c.fillStyle = `rgba(255,240,170,${(.35 + .6 * k).toFixed(2)})`; c.fillRect(x - 1, y - 3 - k * 2, 2, 6 + k * 4); c.fillRect(x - 3 - k * 2, y - 1, 6 + k * 4, 2);
      }
    } catch (e) { }
  };
  hookCamps();
  window.WorldPlus = { CAMPS, cacheSpots };
})();
