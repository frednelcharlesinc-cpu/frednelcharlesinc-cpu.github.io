'use strict';
/* ================= GRAND DUNGEONS: secrets, puzzles, relics =================
   The four woods' dungeons (layout in FCL[d_*].dx, built by tools/forestgen):
     · CRACKED WALLS — a draught whistles through them. Smash one open: a secret passage to a hidden room.
     · SECRET BOSSES wait in those hidden rooms — harder than the dungeon's lord, with the best loot in the place.
     · THE LEVER VAULT — three levers (sun, moon, star) in one room, a clue carved somewhere far away.
       Pull them in the right order and the vault gate rises: chests and a RELIC (a piece of real gear).
       Pull them wrong and the dungeon notices.
   Plus the Lieutenants (js/lieutenants.js) and plenty of ordinary chests in every room. */
(function () {
  const DX = id => (typeof FCL !== 'undefined' && FCL[id] && FCL[id].dx) || null;
  const F = () => G.S.f;
  const sheet = draw => { const one = document.createElement('canvas'); one.width = one.height = 64; const x = one.getContext('2d'); x.imageSmoothingEnabled = false; draw(x);
    const S = document.createElement('canvas'); S.width = 64 * 9; S.height = 64 * 12; const s = S.getContext('2d'); for (let r = 0; r < 12; r++) for (let f = 0; f < 9; f++) s.drawImage(one, f * 64, r * 64); return S; };
  const R = (x, c, a, b, w, h) => { x.fillStyle = c; x.fillRect(a, b, w, h); };
  const cache = {};
  const crackImg = () => cache.crack || (cache.crack = sheet(x => {
    R(x, 'rgba(0,0,0,.3)', 14, 56, 36, 5); R(x, '#3c3a38', 14, 22, 36, 36); R(x, '#575350', 14, 22, 36, 5);
    for (const [a, b] of [[16, 30], [30, 30], [22, 40], [36, 40], [16, 50], [30, 50]]) R(x, '#4a4744', a, b, 12, 8);
    x.strokeStyle = '#0c0a08'; x.lineWidth = 2; x.beginPath(); x.moveTo(32, 24); x.lineTo(28, 34); x.lineTo(35, 40); x.lineTo(29, 50); x.lineTo(33, 57); x.stroke();
    x.beginPath(); x.moveTo(28, 34); x.lineTo(20, 38); x.moveTo(35, 40); x.lineTo(44, 44); x.stroke();
    x.fillStyle = 'rgba(160,220,255,.35)'; x.fillRect(30, 36, 2, 2); x.fillRect(31, 46, 2, 2);
  }));
  const SYM = { sun: '#ffd34a', moon: '#cfe6ff', star: '#c58aff' };
  const glyph = (x, sym, cx, cy) => {
    x.fillStyle = SYM[sym];
    if (sym === 'sun') { x.beginPath(); x.arc(cx, cy, 4, 0, 7); x.fill(); for (let i = 0; i < 8; i++) { const a = i * Math.PI / 4; x.fillRect(cx + Math.cos(a) * 6 - 1, cy + Math.sin(a) * 6 - 1, 2, 2); } }
    else if (sym === 'moon') { x.beginPath(); x.arc(cx, cy, 5, 0, 7); x.fill(); x.fillStyle = '#2a2622'; x.beginPath(); x.arc(cx + 3, cy - 2, 4.5, 0, 7); x.fill(); }
    else { x.beginPath(); for (let i = 0; i < 10; i++) { const a = -Math.PI / 2 + i * Math.PI / 5, r = i % 2 ? 2.4 : 6; x.lineTo(cx + Math.cos(a) * r, cy + Math.sin(a) * r); } x.fill(); }
  };
  const leverImg = (sym, down) => { const k = sym + down; return cache[k] || (cache[k] = sheet(x => {
    R(x, 'rgba(0,0,0,.3)', 20, 56, 24, 4); R(x, '#2a2622', 20, 30, 24, 28); R(x, '#5a524a', 20, 30, 24, 3);
    glyph(x, sym, 32, 39);
    x.strokeStyle = '#8a7a6a'; x.lineWidth = 3; x.beginPath(); x.moveTo(32, 50); x.lineTo(down ? 42 : 22, down ? 56 : 22); x.stroke();
    R(x, '#c0392b', (down ? 42 : 22) - 3, (down ? 56 : 22) - 3, 6, 6);
  })); };
  const tabletImg = () => cache.tab || (cache.tab = sheet(x => {
    R(x, 'rgba(0,0,0,.3)', 18, 56, 28, 4); R(x, '#4e4a46', 18, 26, 28, 32); R(x, '#6a6560', 18, 26, 28, 4);
    for (let i = 0; i < 4; i++) R(x, 'rgba(110,255,170,.65)', 22, 34 + i * 5, 12 + (i * 7) % 9, 2);
  }));

  function mkSB(id, i) {
    const k = `sb_${id}_${i}`; if (ENEMY[k]) return ENEMY[k];
    const [base, name] = DX(id).sb[i], B = ENEMY[base] || ENEMY.m_skeleton;
    return (ENEMY[k] = Object.assign({}, B, { name, img: B.img || base, boss: 1, hp: Math.round(B.hp * 3.2), atk: Math.round(B.atk * 1.45), def: (B.def || 0) + 3, brk: Math.round((B.brk || 50) * 1.8),
      xp: Math.round((B.xp || 20) * 6), gold: Math.round((B.gold || 10) * 6), size: Math.max(1.45, B.size || 1), trait: 'SECRET BOSS — stronger than the lord of this place' + (B.trait ? ' · ' + B.trait : '') }));
  }
  const gearName = g => (typeof RECIPES !== 'undefined' && RECIPES[g] ? RECIPES[g].n : g);
  const partName = p => (typeof PARTS !== 'undefined' && PARTS[p] ? PARTS[p].n : p);
  function giveGear(g) { const S = Gear.st(); S.gear.own[g] = (S.gear.own[g] || 0) + 1; }

  async function crack(id, i) {
    const c = await ask(null, null, 'A cold draught whistles through cracks in this wall. Something is hollow behind it.', ['Smash it', 'Leave it']);
    if (c !== 0) return;
    const [x, y] = DX(id).cracks[i]; F()[`dx_${id}_crack${i}`] = 1;
    World.ents = World.ents.filter(e => e.id !== 'dxcrack_' + i); if (World.col[y]) World.col[y][x] = 0;
    World.shake = 300; sfx('hit'); toast('<b style="color:#9fd8ff">SECRET PASSAGE</b> — the wall caves in.', 2600); save();
  }
  let seq = [];
  async function pull(id, i) {
    const D = DX(id), L = D.levers[i], key = `dx_${id}_vault`;
    if (F()[key]) { await narr(`A lever marked with a ${L.sym.toUpperCase()}. It's rusted in place now — its work is done.`); return; }
    seq.push(L.sym); sfx('blip');
    const e = World.ents.find(n => n.id === 'dxlever_' + i); if (e) e.img = leverImg(L.sym, 1);
    const want = ['moon', 'star', 'sun'];
    if (seq.some((s, j) => s !== want[j])) {
      seq = []; for (const n of World.ents) if (/^dxlever_/.test(n.id)) n.img = leverImg(D.levers[+n.id.slice(8)].sym, 0);
      await narr(`You pull the ${L.sym.toUpperCase()} lever. Somewhere, a great weight drops — wrong — and every lever slams back up.`);
      if (Math.random() < .6 && SCENES[id].encounters) { await narr('Something heard that.'); const r = await Battle.start(SCENES[id].encounters()); if (r === 'lose') await Story.defeat(); }
      return;
    }
    if (seq.length < 3) { await narr(`You pull the ${L.sym.toUpperCase()} lever. It locks down with a heavy CLUNK.`); return; }
    seq = []; F()[key] = 1;
    const [gx, gy] = D.gate; World.ents = World.ents.filter(n => n.id !== 'dxgate'); if (World.col[gy]) World.col[gy][gx] = 0;
    World.shake = 400; sfx('level'); await narr('MOON. STAR. SUN. Stone grinds on stone, and far away a vault gate rises into the ceiling.'); toast('<b style="color:#ffd34a">THE VAULT IS OPEN</b>', 2600); save();
  }
  async function relic(id) {
    const D = DX(id), k = `dx_${id}_relic`; if (F()[k]) return;
    F()[k] = 1; const e = World.ents.find(n => n.id === 'dxrelic'); if (e) e.img = Pick.sheet('chest_gold_o');
    giveGear(D.gear); Gear.give(D.part, 1); G.S.gold += 150; sfx('level'); UI.hud();
    await narr(`Inside the relic chest, wrapped in old cloth: <b style="color:#ffd36a">${gearName(D.gear)}</b> — and a <b style="color:#ffd36a">${partName(D.part)}</b>, and 150 gold. (Menu → Gear to wear it.)`);
    save();
  }
  async function secretBoss(id, i) {
    const D = DX(id), E = mkSB(id, i), k = `dx_${id}_sb${i}`;
    await narr(D.sb[i][2]);
    const c = await ask(null, null, `SECRET BOSS — ${E.name}. This one is stronger than the lord of the dungeon. Fight?`, ['Fight', 'Back away']); if (c !== 0) return;
    const r = await Battle.start({ enemies: [`sb_${id}_${i}`], boss: true, noFlee: true, bd: DUNGEONS[id].bd, music: 'boss', intro: 'SECRET BOSS — ' + E.name.toUpperCase() });
    if (r === 'lose') { await Story.defeat(); return; }
    if (r !== 'win') return;
    F()[k] = 1; World.ents = World.ents.filter(n => n.id !== 'dxsb_' + i);
    Gear.give(D.part, 2); G.S.gold += 300; if (i === 1) giveGear(D.gear2);
    if (typeof SPARE_STONES !== 'undefined' && typeof Stones !== 'undefined') { const st = SPARE_STONES.find(s => !Stones.has(s)); if (st) Stones.give(st); }
    sfx('level'); UI.hud();
    await narr(`${E.name} falls. You take: 2× <b style="color:#ffd36a">${partName(D.part)}</b>, 300 gold${i === 1 ? `, and <b style="color:#ffd36a">${gearName(D.gear2)}</b>` : ''}.`);
    save();
  }

  async function setup(W, id) {
    const D = DX(id); if (!D) return; const f = F(); seq = [];
    D.cracks.forEach(([x, y], i) => {
      if (f[`dx_${id}_crack${i}`]) { if (W.col[y]) W.col[y][x] = 0; return; }
      if (W.col[y]) W.col[y][x] = 1;
      W.ents.push(new Ent({ id: 'dxcrack_' + i, x, y, dir: 'down', img: crackImg(), pickup: 1, name: 'Cracked wall', talk: () => crack(id, i) }));
    });
    const [gx, gy] = D.gate, solved = f[`dx_${id}_vault`];
    if (W.col[gy]) W.col[gy][gx] = solved ? 0 : 1;
    if (!solved) W.ents.push(new Ent({ id: 'dxgate', x: gx, y: gy, dir: 'down', img: Lieutenants.gateSheet(), pickup: 1, name: 'Vault gate',
      talk: () => narr('A vault gate of black iron. No keyhole — only three carved symbols: a sun, a moon, a star. Somewhere in this dungeon, levers move it.') }));
    D.levers.forEach((L, i) => W.ents.push(new Ent({ id: 'dxlever_' + i, x: L.x, y: L.y, dir: 'down', img: leverImg(L.sym, solved ? 1 : 0), pickup: 1, name: 'Lever', talk: () => pull(id, i) })));
    W.ents.push(new Ent({ id: 'dxclue', x: D.clue[0], y: D.clue[1] + 1, dir: 'down', img: tabletImg(), pickup: 1, name: 'Carving', talk: () => narr(D.cluetext) }));
    if (!f[`dx_${id}_relic`]) W.ents.push(new Ent({ id: 'dxrelic', x: D.relic[0], y: D.relic[1], dir: 'down', img: Pick.sheet('chest_gold_c'), pickup: 1, name: 'Relic chest', talk: () => relic(id) }));
    for (const s of D.secret) {
      if (f[`dx_${id}_sb${s.i}`]) continue; const E = mkSB(id, s.i); let img; try { img = await npcImg(E.img); } catch (e) { continue; }
      W.ents.push(new Ent({ id: 'dxsb_' + s.i, x: s.x, y: s.y, dir: 'down', img, size: 1.45, name: E.name, ai: 'turn', turns: ['down', 'left', 'right'], talk: () => secretBoss(id, s.i) }));
    }
  }
  const _load = World.load.bind(World);
  World.load = async function (name, ...a) {
    const r = await _load(name, ...a);
    try { if (DX(name)) await setup(World, name); } catch (e) { console.warn('dungeonx', e); }
    return r;
  };
  window.DungeonX = { setup };
})();
