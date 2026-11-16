'use strict';
/* ================= WORLD+ 11 (Chat B — World & Maps) =================
   MAP ROOM — a wall map at your homestead that fills in as you explore every zone.
   THE WANDERING COLOSSUS — one week a month a giant walks the woods, a different zone each day. The town board knows where.
   SMALL LIFE — rabbits by day, bats by night.
   THE CARTER — Ashford's cart takes you to any camp you've found (town services).
   THE DRAG VILLAGE — four ruined homes in the Vale of Echoes. Rebuild them and Drag families come home.
   THE CARTOGRAPHER — sell finished zone maps; map them all to earn the title Pathfinder (town services).
   SEASONS — autumn leaf piles hide things; spring hives drip honey.
   (Lines are B drafts.) */
(function () {
  const W4 = () => window.WorldPlus4;
  const S_ = () => G.S, F = () => G.S.f;
  const day = () => (typeof Cal !== 'undefined' ? Cal.day() : 1), week = () => Math.floor((day() - 1) / 7);
  const night = () => (typeof Ambient !== 'undefined' && Ambient.night) || 0;
  const season = () => (window.WorldPlus3 && WorldPlus3.season && WorldPlus3.season()) || 'spring';
  const rare = () => W4().giveRare();
  const gold$ = n => `<b style="color:#ffd36a">${n}</b>`;
  const pick = L => L[Math.floor(Math.random() * L.length)];
  const sheet = draw => { const one = document.createElement('canvas'); one.width = one.height = 64; const x = one.getContext('2d'); draw(x); const S = document.createElement('canvas'); S.width = 64 * 9; S.height = 64 * 12; const s = S.getContext('2d'); for (let r = 0; r < 12; r++) for (let f = 0; f < 9; f++) s.drawImage(one, f * 64, r * 64); return S; };
  const R = (x, c, a, b, w, h) => { x.fillStyle = c; x.fillRect(a, b, w, h); };
  const MK = { woods: 'fc_cross', woods_n: 'fc_north', woods_e: 'fc_east', woods_s: 'fc_south', woods_w: 'fc_west', woods_n2: 'fc_north2', woods_e2: 'fc_east2', woods_s2: 'fc_south2', woods_w2: 'fc_west2', vale: 'fc_vale' };
  const ZONES = Object.keys(MK).filter(z => SCENES[z]);
  const nm = z => z === 'woods' ? 'The Crossroads' : (SCENES[z] && SCENES[z].subtitle) || z;
  const fogPct = z => { const mk = MK[z], M = G.maps[mk], s = (G.S.fcfog || {})[mk]; if (!M || !s || s.length !== M.w * M.h) return 0; let n = 0, o = 0; for (let i = 0; i < s.length; i++) if (M.col[Math.floor(i / M.w)][i % M.w] === '0') { o++; if (s[i] === '1') n++; } return o ? Math.round(100 * n / o) : 0; };

  /* ---------- map room ---------- */
  async function mapRoom() {
    const L = ZONES.map(z => { const t = (W4().forestStats && z !== 'vale') ? W4().forestStats(z) : null; return [z, fogPct(z), t ? t.pct : null]; });
    await new Promise(res => {
      Food.overlay(`<h3>🗺️ The map room</h3><div class="muted">Pinned to the wall: every wood you've walked. Colour = how much you've mapped; ★ = secrets found.</div>
        <canvas id="mr" width="420" height="236" style="max-width:100%;background:#d8c8a0;border-radius:8px"></canvas><div style="text-align:right;margin-top:6px"><button id="mrx">Back</button></div>`);
      const c = document.querySelector('#foodOv #mr').getContext('2d'), POS0 = { woods: [210, 150], woods_n: [210, 85], woods_e: [305, 150], woods_s: [210, 215], woods_w: [115, 150], woods_n2: [210, 25], woods_e2: [395, 150], woods_s2: [210, 278], woods_w2: [25, 150], vale: [95, 45] }, POS = {}; for (const k in POS0) POS[k] = [POS0[k][0], Math.round(4 + POS0[k][1] * .78)];
      c.strokeStyle = '#8a7050'; c.lineWidth = 3; for (const [a, b] of [['woods', 'woods_n'], ['woods', 'woods_e'], ['woods', 'woods_s'], ['woods', 'woods_w'], ['woods_n', 'woods_n2'], ['woods_e', 'woods_e2'], ['woods_s', 'woods_s2'], ['woods_w', 'woods_w2']]) if (POS[a] && POS[b]) { c.beginPath(); c.moveTo(...POS[a]); c.lineTo(...POS[b]); c.stroke(); }
      for (const [z, pct, sec] of L) { const p = POS[z]; if (!p) continue; const seen = z === 'vale' ? F().valeSeen : pct > 0 || z === 'woods'; c.fillStyle = seen ? `hsl(${100 + pct * .4},${30 + pct * .4}%,${60 - pct * .2}%)` : '#a89878'; c.strokeStyle = '#5a4630'; c.lineWidth = 2; c.beginPath(); c.roundRect ? c.roundRect(p[0] - 40, p[1] - 15, 80, 30, 6) : c.rect(p[0] - 40, p[1] - 15, 80, 30); c.fill(); c.stroke();
        c.fillStyle = '#2a1a10'; c.font = 'bold 9px system-ui'; c.textAlign = 'center'; c.fillText(seen ? nm(z).replace(/^The /, '').slice(0, 15) : '???', p[0], p[1] - 3); c.font = '10px system-ui'; c.fillText(seen ? `${pct}%${sec !== null ? ` · ★${sec}%` : ''}` : '', p[0], p[1] + 10); }
      document.querySelector('#foodOv #mrx').addEventListener('click', e => { e.stopPropagation(); res(); });
    });
  }
  window.HomeX = window.HomeX || []; HomeX.push({ label: 'The map room', run: mapRoom });

  /* ---------- the wandering colossus ---------- */
  const colossusWeek = () => { const d = ((day() - 1) % 28) + 1; return d >= 15 && d <= 21; };
  const FOREST8 = ZONES.filter(z => /^woods_/.test(z));
  const colossusAt = () => FOREST8[hash('col' + day(), FOREST8.length)];
  function hash(s, n) { let h = 2166136261; for (const c of String(s)) h = Math.imul(h ^ c.charCodeAt(0), 16777619); return (h >>> 0) % Math.max(1, n); }
  async function colossusFight() {
    if (!ENEMY.colossus) { const B = ENEMY.m_wartotaur || ENEMY.m_minotaur || ENEMY.m_troll; ENEMY.colossus = Object.assign({}, B, { name: 'The Wandering Colossus', img: B.img || 'm_troll', boss: 1, hp: Math.round(B.hp * 5), atk: Math.round(B.atk * 1.45), def: (B.def || 0) + 5, brk: Math.round((B.brk || 90) * 2.4), xp: Math.round((B.xp || 60) * 8), gold: 400, size: 2.6, trait: 'World boss — walks a different wood each day' }); }
    await narr('The ground shakes before you see it: a moss-grown giant, older than the trees, walking somewhere only it knows.');
    const r = await Battle.start({ enemies: ['colossus'], boss: true, noFlee: true, bd: SCENES[G.S.map].bd, music: 'boss', intro: 'WORLD BOSS — THE WANDERING COLOSSUS' });
    if (r === 'lose') { await Story.defeat(); return; } if (r !== 'win') return;
    S_().colossus = Math.floor((day() - 1) / 28); World.ents = World.ents.filter(e => e.id !== 'colossus');
    const a = rare(), b = rare(), c = rare(); G.S.gold += 1200; UI.hud(); sfx('level'); await narr(`The Colossus sinks to its knees and becomes a hill of moss and stone. In the moss: 1,200 gold${a ? `, a ${gold$(a)}` : ''}${b ? `, a ${gold$(b)}` : ''}${c ? `, a ${gold$(c)}` : ''}.`); save();
  }
  const colossusDone = () => S_().colossus === Math.floor((day() - 1) / 28);
  if (window.WorldPlus4) WorldPlus4.boardExtras.push({ label: () => `Colossus sightings: ${nm(colossusAt())}`, show: () => colossusWeek() && !colossusDone(), run: () => narr(`Today's sightings put the Wandering Colossus in ${nm(colossusAt())}. It moves on at dawn.`) });

  /* ---------- small life ---------- */
  let critters = [];
  function spawnCritters(z) { critters = []; if (!MK[z]) return; const M = World.map, n = 3 + Math.floor(Math.random() * 3);
    for (let i = 0; i < 60 && critters.length < n; i++) { const x = 4 + Math.floor(Math.random() * (M.w - 8)), y = 4 + Math.floor(Math.random() * (M.h - 8)); if (World.col[y][x] === 0) critters.push({ x: x * 32 + 16, y: y * 32 + 24, vx: 0, vy: 0, t: Math.random() * 1000, hop: 0 }); } }
  function drawCritters(c, t) {
    const p = World.player, cx = Math.round(World.cam.x), cy = Math.round(World.cam.y), isN = night() > .55;
    for (const k of critters) {
      if (isN) { k.t += 1; const bx = k.x + Math.sin(k.t / 30) * 60, by = k.y - 60 + Math.sin(k.t / 17) * 20, fl = Math.sin(k.t / 3) > 0; c.fillStyle = '#1a1420'; c.fillRect(bx - cx - (fl ? 5 : 3), by - cy, fl ? 10 : 6, 2); c.fillRect(bx - cx - 1, by - cy - 1, 2, 3); continue; }
      const dx = k.x - p.px, dy = k.y - p.py, d = Math.hypot(dx, dy);
      if (d < 90 && !k.hop) { k.vx = dx / d * 3; k.vy = dy / d * 3; k.hop = 18; } else if (!k.hop && Math.random() < .01) { k.vx = (Math.random() - .5) * 2; k.vy = (Math.random() - .5) * 2; k.hop = 10; }
      if (k.hop) { const nx = k.x + k.vx, ny = k.y + k.vy, tx = Math.floor(nx / 32), ty = Math.floor((ny - 8) / 32); if (World.col[ty] && World.col[ty][tx] === 0) { k.x = nx; k.y = ny; } k.hop--; }
      const z = k.hop ? Math.abs(Math.sin(k.hop / 3)) * 4 : 0, x = k.x - cx, y = k.y - cy - z, f = k.vx < 0;
      c.fillStyle = 'rgba(0,0,0,.18)'; c.fillRect(x - 4, k.y - cy, 8, 2);
      c.fillStyle = '#b8a890'; c.fillRect(x - 4, y - 6, 8, 5); c.fillRect(f ? x - 6 : x + 2, y - 9, 4, 4); c.fillRect(f ? x - 5 : x + 3, y - 13, 1, 4); c.fillRect(f ? x - 3 : x + 5, y - 13, 1, 4); c.fillStyle = '#fff'; c.fillRect(f ? x + 3 : x - 5, y - 6, 2, 2);
    }
  }

  /* ---------- the carter ---------- */
  async function carter() {
    const found = S_().camps || {}, L = (window.WorldPlus ? WorldPlus.CAMPS : []).filter(c => found[c.id || c.scene] && (!c.show || c.show()));
    if (!L.length) { await narr('"Find a camp out in the woods first, friend — then I\'ll know where to take you."'); return; }
    const c = await ask(null, null, 'The carter taps his cart. "25 gold, anywhere you\'ve camped."', [...L.map(o => o.name), 'Not today']); const d = L[c]; if (!d) return;
    if (G.S.gold < 25) { await narr('"25 gold, friend."'); return; } G.S.gold -= 25; UI.hud(); sfx('blip'); await World.go(d.scene, d.at[0], d.at[1] + 1, 'down');
  }

  /* ---------- the Drag village in the Vale ---------- */
  const HOMES = [['The weaver\'s house', 'dfolk2', '"I wove the first banner this vale ever had. I\'ll weave the next one, too."'], ['The smith\'s house', 'dfolk4', '"Forty years I hid my eyes behind smoked glass. Here, I don\'t have to."'],
    ['The singer\'s house', 'dfolk1', '"The stones sing. I\'m only teaching the children the words."'], ['The children\'s house', 'dkid3', '"Is it true you came from OUTSIDE? What\'s it like? Are there really no green eyes out there?"']];
  const vil = () => (S_().village = S_().village || {});
  const ruinImg = (() => { let S; return () => S || (S = sheet(x => { R(x, 'rgba(0,0,0,.3)', 6, 56, 52, 6); R(x, '#6a6a5a', 8, 40, 14, 18); R(x, '#7a7a6a', 40, 46, 16, 12); R(x, '#5a5a4a', 24, 50, 14, 8); R(x, '#4a3020', 18, 36, 26, 3); R(x, '#4a6a3a', 10, 54, 8, 3); R(x, '#4a6a3a', 46, 44, 6, 3); })); })();
  const homeImg = (() => { let S; return () => S || (S = sheet(x => { R(x, 'rgba(0,0,0,.3)', 4, 58, 56, 5); R(x, '#d8c8a8', 8, 30, 48, 28); R(x, '#b8a888', 8, 54, 48, 4); R(x, '#4a7a4a', 4, 18, 56, 14); R(x, '#3a6a3a', 10, 10, 44, 10); R(x, '#2a5a2a', 18, 4, 28, 8);
    R(x, '#6b4a2a', 27, 40, 10, 18); R(x, '#46ff95', 31, 46, 2, 2); R(x, '#ffd890', 13, 38, 8, 8); R(x, '#ffd890', 43, 38, 8, 8); R(x, '#4a3020', 16, 38, 2, 8); R(x, '#4a3020', 46, 38, 2, 8); })); })();
  async function plot(i) {
    const V = vil(), [nmH, sp, line] = HOMES[i];
    if (V[i]) { await narr(line); return; }
    await narr(`${nmH} — or what's left: tumbled walls, a doorstep worn smooth by feet, a green glass bead in the moss.`);
    if (!(await W4().pay(400, `Rebuild ${nmH.toLowerCase()} (timber, stone and a carpenter from Ashford)`))) return;
    V[i] = day(); sfx('level'); await narr('The walls go up, the roof goes on. By evening there\'s smoke from the chimney — and someone is standing in the doorway, as if they\'d been waiting years for this.');
    const n = Object.keys(V).length; toast(`<b style="color:#46ff95">THE VALE VILLAGE</b> — ${n}/4 homes rebuilt`, 2600);
    if (n === 4) { const a = rare(), b = rare(); G.S.gold += 500; UI.hud(); await narr(`The whole village gathers at the Hall of First Light. The weaver hangs a new banner over the door — green, with a sword and a shield. "Welcome home, child." (500 gold${a ? `, a ${gold$(a)}` : ''}${b ? `, a ${gold$(b)}` : ''})`); }
    save(); await World.go('vale', World.player.x, World.player.y, World.player.dir);
  }

  /* ---------- the cartographer ---------- */
  async function cartographer() {
    const S = S_(); S.mapsSold = S.mapsSold || {}; const ready = ZONES.filter(z => !S.mapsSold[z] && fogPct(z) >= 90);
    if (!ready.length) { await narr(`The cartographer peers over her spectacles. "Bring me a wood you've mapped properly — nine parts in ten at least." (${Object.keys(S.mapsSold).length}/${ZONES.length} sold)`); return; }
    const c = await ask(null, null, '"Ooh. Let\'s see what you\'ve got."', [...ready.map(z => `${nm(z)} — 120g`), 'Not yet']); const z = ready[c]; if (!z) return;
    S.mapsSold[z] = 1; G.S.gold += 120; UI.hud(); sfx('coin'); await narr(`"Lovely work. Lovely." She pays 120 gold for your map of ${nm(z)}.`);
    if (Object.keys(S.mapsSold).length === ZONES.length) { S.title = 'Pathfinder'; G.S.gold += 300; UI.hud(); sfx('level'); toast('🧭 TITLE EARNED — <b>PATHFINDER</b>', 3400); await narr('"Every wood. EVERY wood. Nobody\'s done that in a hundred years." She hands you a brass compass and 300 gold. "Pathfinder. That\'s what they\'ll call you now."'); }
    save();
  }
  if (window.TownLife && TownLife.services) TownLife.services.push({ label: 'The carter (ride to a camp — 25g)', run: carter }, { label: 'The cartographer (sell your maps)', run: cartographer });

  /* ---------- seasons: leaf piles & hives ---------- */
  const leafImg = (() => { let S; return () => S || (S = sheet(x => { const C = ['#c8601a', '#e89a2a', '#a8401a', '#d8b040']; for (let i = 0; i < 60; i++) { const a = Math.random() * Math.PI, r = Math.random() * 16; R(x, C[i % 4], 32 + Math.cos(a) * r * 1.4 - 2, 56 - Math.sin(a) * r * .8 - 2, 4, 3); } })); })();
  const hiveImg = (() => { let S; return () => S || (S = sheet(x => { R(x, 'rgba(0,0,0,.25)', 22, 58, 20, 3); R(x, '#5a3a20', 30, 8, 4, 50); R(x, '#d8a838', 22, 18, 20, 18); R(x, '#b88828', 22, 22, 20, 2); R(x, '#b88828', 22, 28, 20, 2); R(x, '#3a2414', 30, 30, 4, 3); R(x, '#1a1a1a', 46, 16, 2, 2); R(x, '#1a1a1a', 16, 24, 2, 2); })); })();
  async function leafPile(z, i, e) {
    const k = `leaf_${z}_${i}_${week()}`; F()[k] = 1; World.ents = World.ents.filter(n => n !== e); World.col[e.y][e.x] = 0; sfx('blip');
    const r = Math.random();
    if (r < .35) { const g = 30 + Math.floor(Math.random() * 60); G.S.gold += g; UI.hud(); await narr(`You kick through the leaves — a dropped purse! ${g} gold.`); }
    else if (r < .75 && window.Food) { const id = pick(['glowcap', 'bread', 'honey', 'gourd']); Food.addIng(id); await narr(`Under the leaves: ${Food.img(Food.ingIcon(id), 22)} ${Food.ING[id][0]}.`); }
    else if (r < .85) { const n = rare(); await narr(n ? `Something glints under the leaves: a ${gold$(n)}!` : 'Just leaves. Lovely, crunchy leaves.'); }
    else await narr(pick(['A very offended hedgehog. You put the leaves back.', 'Just leaves. Lovely, crunchy leaves.']));
    save();
  }
  async function hive(z, e) { F()[`hive_${z}_${week()}`] = 1; World.ents = World.ents.filter(n => n !== e); World.col[e.y][e.x] = 0; if (window.Food) Food.addIng('honey', 2); sfx('blip'); await narr('A wild hive, heavy with spring honey. You smoke the bees sleepy and take two combs. (Wild Honey ×2)'); save(); }

  /* ---------- wiring ---------- */
  const _load = World.load.bind(World);
  World.load = async function (name, ...a) {
    critters = [];
    const r = await _load(name, ...a);
    try {
      if (MK[name]) spawnCritters(name);
      if (colossusWeek() && !colossusDone() && name === colossusAt()) { const at = W4().spot(name, 1888); let img; try { img = await npcImg(ENEMY.m_wartotaur ? 'm_wartotaur' : 'm_troll'); } catch (e) { } if (at && img) { World.ents.push(new Ent({ id: 'colossus', x: at[0], y: at[1], dir: 'down', img, size: 2.6, name: 'The Wandering Colossus', ai: 'turn', talk: colossusFight })); toast('<b style="color:#ffb050">THE WANDERING COLOSSUS</b> is in this wood today.', 3000); } }
      if (name === 'vale') for (let i = 0; i < 4; i++) { const at = W4().spot('vale', 2101 + i); if (!at) continue; World.col[at[1]][at[0]] = 1; const built = vil()[i];
        World.ents.push(new Ent({ id: 'plot' + i, x: at[0], y: at[1], dir: 'down', img: built ? homeImg() : ruinImg(), size: built ? 2 : 1.6, pickup: 1, name: built ? HOMES[i][0] : '', talk: () => plot(i) }));
        if (built) { const q = [[at[0], at[1] + 2], [at[0] + 2, at[1] + 1], [at[0] - 2, at[1] + 1]].find(([x, y]) => World.col[y] && World.col[y][x] === 0); if (q) { try { const im = await npcImg(HOMES[i][1]); const e = new Ent({ id: 'vfolk' + i, x: q[0], y: q[1], dir: 'down', img: im, name: HOMES[i][0].replace(/^The |'s house$/g, '').replace(/^./, c => c.toUpperCase()), ai: 'wander', area: [q[0] - 2, q[1] - 1, q[0] + 2, q[1] + 2], talk: () => narr(HOMES[i][2]) }); World.ents.push(e); } catch (e) { } } World.lights.push({ x: at[0] * 32 + 16, y: at[1] * 32, r: 80, c: '255,210,140' }); } }
      if (/^woods_/.test(name) && season() === 'autumn') for (let i = 0; i < 3; i++) { if (F()[`leaf_${name}_${i}_${week()}`]) continue; const at = W4().spot(name, 2201 + i); if (!at) continue; World.col[at[1]][at[0]] = 1; const e = new Ent({ id: 'leaf' + i, x: at[0], y: at[1], dir: 'down', img: leafImg(), pickup: 1, name: '', talk: () => leafPile(name, i, e) }); World.ents.push(e); }
      if (/^woods_/.test(name) && season() === 'spring' && !F()[`hive_${name}_${week()}`]) { const at = W4().spot(name, 2301); if (at) { World.col[at[1]][at[0]] = 1; const e = new Ent({ id: 'hive', x: at[0], y: at[1], dir: 'down', img: hiveImg(), pickup: 1, name: '', talk: () => hive(name, e) }); World.ents.push(e); } }
    } catch (e) { console.warn('worldplus11', e); }
    return r;
  };
  const _render = World.render.bind(World);
  World.render = function (c, t) { _render(c, t); try { if (G.mode === 'world' && World.player && !World.loading && critters.length) drawCritters(c, t); } catch (e) { } };
  window.WorldPlus11 = { mapRoom, fogPct, colossusAt, colossusWeek, carter, cartographer, plot, vil };
})();
