'use strict';
/* ================= DUNGEONS, CHESTS & GATHERING =================
   Pickups (chests, herbs, ore, bones, cave mouths) are entities drawn from small runtime-painted sheets.
   Chest positions: assets/chests.json (overworld + interiors) and maps.json[dungeon].dungeon (dungeons). */

/* ---------- pixel painters ---------- */
const Pick = {
  cache: {},
  sheet(kind) {
    if (this.cache[kind]) return this.cache[kind];
    const one = document.createElement('canvas'); one.width = 64; one.height = 64; const x = one.getContext('2d'); x.imageSmoothingEnabled = false;
    const R = (c, a, b, w, h) => { x.fillStyle = c; x.fillRect(a, b, w, h); };
    const [type, tier, open] = kind.split('_');
    if (type === 'chest') {
      const T = { wood: ['#7a4a22', '#5a3416', '#c99a3a', '#3a2210'], iron: ['#5a6474', '#3e4652', '#d8dde6', '#1e232a'], gold: ['#8a2a2a', '#5e1a1a', '#ffd34a', '#2a0a0a'] }[tier];
      R('rgba(0,0,0,.28)', 18, 57, 28, 4);
      if (open === 'o') {
        R(T[3], 19, 38, 26, 18); R(T[0], 19, 44, 26, 14); R(T[1], 19, 54, 26, 3); R(T[2], 30, 44, 4, 6);
        R(T[0], 19, 30, 26, 8); R(T[1], 19, 30, 26, 2); R(T[2], 19, 34, 26, 2); // lid tipped back
        R('#fff3b0', 24, 40, 16, 3); R('#ffd34a', 26, 39, 4, 2); R('#ffd34a', 33, 40, 3, 2);
      } else {
        R(T[1], 18, 36, 28, 22); R(T[0], 19, 37, 26, 20); R(T[1], 19, 44, 26, 2);
        R(T[0], 19, 34, 26, 4); R(T[1], 18, 34, 28, 1);
        R(T[2], 22, 34, 3, 23); R(T[2], 39, 34, 3, 23); R(T[2], 30, 42, 4, 6); R(T[3], 31, 45, 2, 2);
        R('rgba(255,255,255,.25)', 20, 37, 24, 1);
      }
    } else if (type === 'herb') {
      R('rgba(0,0,0,.2)', 24, 56, 16, 3);
      for (const [a, b, h] of [[28, 44, 13], [33, 40, 17], [37, 46, 11], [25, 48, 9]]) { R('#2f7a3a', a, b, 2, h); R('#5fd06a', a - 3, b + 2, 4, 3); R('#5fd06a', a + 2, b + 5, 4, 3); }
      R('#d6f0ff', 32, 37, 4, 4); R('#9ad8ff', 27, 42, 3, 3); R('#9ad8ff', 37, 43, 3, 3);
    } else if (type === 'ore') {
      R('rgba(0,0,0,.25)', 20, 56, 24, 3); R('#4a4652', 20, 44, 24, 13); R('#5e5a68', 22, 42, 18, 6);
      x.fillStyle = '#7fe8ff'; x.beginPath(); x.moveTo(27, 46); x.lineTo(31, 30); x.lineTo(35, 46); x.fill(); x.beginPath(); x.moveTo(35, 47); x.lineTo(39, 37); x.lineTo(42, 47); x.fill();
      R('#e8fbff', 30, 34, 1, 9);
    } else if (type === 'bones') {
      R('rgba(0,0,0,.2)', 20, 56, 24, 3); R('#e8e2cc', 21, 52, 20, 3); R('#e8e2cc', 26, 48, 3, 8); R('#e8e2cc', 34, 49, 12, 2);
      R('#f2eedc', 28, 42, 9, 8); R('#1a1a1a', 30, 45, 2, 2); R('#1a1a1a', 34, 45, 2, 2); R('#cfc8b0', 30, 49, 5, 2);
    } else if (type === 'cave') {
      x.fillStyle = '#3a3430'; x.beginPath(); x.ellipse(32, 52, 30, 26, 0, Math.PI, 0); x.fill();
      x.fillStyle = '#4e4640'; for (const [a, b, w] of [[6, 40, 10], [48, 38, 12], [16, 28, 12], [36, 26, 14], [26, 24, 10]]) x.fillRect(a, b, w, 8);
      x.fillStyle = '#0a0806'; x.beginPath(); x.ellipse(32, 56, 17, 20, 0, Math.PI, 0); x.fill(); R('#0a0806', 15, 52, 34, 6);
      if (tier) { x.fillStyle = tier; x.globalAlpha = .55; x.beginPath(); x.ellipse(32, 52, 10, 12, 0, Math.PI, 0); x.fill(); x.globalAlpha = 1; }
    } else if (type === 'stairs') {
      for (let i = 0; i < 4; i++) { R('#2a2622', 18 + i * 2, 40 + i * 5, 28 - i * 4, 5); R('#5a524a', 18 + i * 2, 40 + i * 5, 28 - i * 4, 1); }
    }
    const S = document.createElement('canvas'); S.width = 64 * 9; S.height = 64 * 12; const sx = S.getContext('2d');
    for (let r = 0; r < 12; r++) for (let f = 0; f < 9; f++) sx.drawImage(one, f * 64, r * 64);
    return (this.cache[kind] = S);
  }
};

/* ---------- loot ---------- */
const LOOT = {
  wood: () => { const r = Math.random(); return r < .45 ? { gold: 15 + Math.floor(Math.random() * 30) } : r < .75 ? { tonic: 1 + (Math.random() < .3) } : r < .92 ? { ether: 1 } : { gold: 10, tonic: 1, ether: 1 }; },
  iron: () => { const r = Math.random(); const L = { gold: 50 + Math.floor(Math.random() * 70) }; if (r < .5) L.tonic = 2; else L.ether = 2; if (Math.random() < .5) L.crystal = 1; if (Math.random() < .2) L.stone = 1; return L; },
  gold: () => ({ gold: 200 + Math.floor(Math.random() * 200), tonic: 3, ether: 2, crystal: 2, stone: 1 })
};
const SPARE_STONES = ['echo', 'fang', 'scale', 'breath', 'still'];
async function grantLoot(L) {
  const S = G.S, parts = [];
  if (L.gold) { S.gold += L.gold; parts.push(`<b style="color:#ffd34a">${L.gold} gold</b>`); }
  if (L.tonic) { S.items.tonic += L.tonic; parts.push(`${L.tonic} Tonic${L.tonic > 1 ? 's' : ''}`); }
  if (L.ether) { S.items.ether += L.ether; parts.push(`${L.ether} Ether${L.ether > 1 ? 's' : ''}`); }
  if (L.crystal) { parts.push(`${L.crystal} Mana Crystal${L.crystal > 1 ? 's' : ''} (+${L.crystal * 60} EXP)`); }
  if (L.qitem) { Quests.addItem(L.qitem, L.n || 1); parts.push(`<b style="color:#9fd8ff">${QITEM[L.qitem].name}${(L.n || 1) > 1 ? ' ×' + L.n : ''}</b>`); }
  sfx('coin'); toast('Found ' + parts.join(' · '), 3200); UI.hud();
  if (L.crystal) Story.gainXp(L.crystal * 60);
  if (L.stone) { const id = SPARE_STONES.find(k => !Stones.has(k)); if (id) Stones.give(id); }
}

/* ---------- spawning pickups into a scene ---------- */
const CHEST_TIER = name => name.startsWith('d_') ? 'iron' : 'wood';
let CHESTPOS = null;
async function spawnExtras(W, name) {
  if (!CHESTPOS) { try { CHESTPOS = await (await fetch('assets/chests.json')).json(); } catch (e) { CHESTPOS = {}; } }
  const S = G.S; S.chests = S.chests || {}; S.gathered = S.gathered || {};
  const mk = W.scene.map || name, D = W.map.dungeon;
  const occupied = (x, y) => W.ents.some(e => e.x === x && e.y === y) || (W.col[y] && W.col[y][x]);
  const free = (x, y) => { for (const [dx, dy] of [[0, 0], [1, 0], [-1, 0], [0, -1], [1, -1], [-1, -1]]) if (!occupied(x + dx, y + dy)) return [x + dx, y + dy]; return null; };
  const spots = D ? D.chests.map((p, i) => [...p, i === D.chests.length - 1 ? 'gold' : 'iron']) : (CHESTPOS[mk] || []).map(p => [...p, 'wood']);
  for (const [x0, y0, tier] of spots) {
    const p = free(x0, y0); if (!p) continue; const key = `${name}:${x0},${y0}`, opened = !!S.chests[key];
    const e = new Ent({ id: 'chest_' + key, x: p[0], y: p[1], dir: 'down', img: Pick.sheet(`chest_${tier}_${opened ? 'o' : 'c'}`), pickup: 1, talk: async ent => {
      if (S.chests[key]) { await narr('Empty. Someone — you — got here first.'); return; }
      if (tier === 'gold' && D && !S.f['clear_' + name]) { await narr('The great chest is sealed by a ward that pulses in time with something deeper in the dungeon. Defeat what guards it first.'); return; }
      S.chests[key] = 1; ent.img = Pick.sheet(`chest_${tier}_o`); sfx('blip');
      await grantLoot(LOOT[tier]()); Quests.event('chest', name);
      const pg = PAGE_AT[mk]; S.pages = S.pages || []; if (pg !== undefined && !S.pages.includes(pg) && (tier === 'gold' || !D)) { S.pages.push(pg); sfx('level'); setTimeout(() => toast(`Under the coins: a <b style="color:#c8a0ff">burned page</b> of an old chronicle. (${S.pages.length}/${PAGES.length} — Menu → World)`, 4200), 1400); }
      save();
    } });
    W.ents.push(e);
  }
  // gather spots (herbs / ore / bones) — respawn each visit until collected for this "day"
  const G8 = D ? D.gather : (GATHER_SPOTS[mk] || []);
  const kind = D ? { warren: 'ore', crypt: 'bones', mire: 'herb', crystal: 'ore' }[D.style] : 'herb';
  const item = D ? { warren: 'glowore', crypt: 'gravedust', mire: 'mireroot', crystal: 'skyshard' }[D.style] : 'moonpetal';
  for (const [x0, y0] of G8) {
    const p = free(x0, y0); if (!p) continue; const key = `${name}:${x0},${y0}`;
    if (key in S.gathered && S.gathered[key] > (S.steps || 0) - 400) continue; // regrows after a while
    const e = new Ent({ id: 'g_' + key, x: p[0], y: p[1], dir: 'down', img: Pick.sheet(kind), pickup: 1, talk: async ent => {
      S.gathered[key] = S.steps || 0; World.ents = World.ents.filter(z => z !== ent); sfx('heal');
      Quests.addItem(item, 1); toast(`Gathered <b style="color:#9fd8ff">${QITEM[item].name}</b> (${Quests.has(item)} carried)`, 2200);
    } });
    W.ents.push(e);
  }
  // dungeon entrances on the overworld
  for (const d of Object.values(DUNGEONS)) if (d.from.map === name && (!d.show || d.show())) {
    const [x, y] = d.from.at;
    W.ents.push(new Ent({ id: 'cave_' + d.id, x, y, dir: 'down', img: Pick.sheet('cave_' + d.glow), pickup: 1, name: d.title, talk: () => enterDungeon(d.id) }));
  }
  // dungeon: torches, exit stairs, the boss
  if (D) {
    for (const [tx, ty] of D.torches) W.lights.push({ x: tx * TILE + 16, y: ty * TILE + 24, r: 78, c: DUNGEONS[name].light }), W.extraProps.push({ k: 'fire0', x: tx, y: ty, anim: 'fire' });
    W.lights.push({ x: W.player.px, y: W.player.py, r: 95, c: '255,240,200', follow: 1 });
    W.ents.push(new Ent({ id: 'stairs', x: D.exit[0], y: D.exit[1] - 1, dir: 'down', img: Pick.sheet('stairs'), pickup: 1, talk: () => leaveDungeon(name) }));
    const dd = DUNGEONS[name];
    if (!S.f['clear_' + name]) {
      const B = ENEMY[dd.boss];
      W.ents.push(new Ent({ id: 'boss', x: D.boss[0], y: D.boss[1], dir: 'down', img: await npcImg(B.img || dd.boss), size: Math.min(1.6, B.size || 1), name: B.name, talk: () => dungeonBoss(name) }));
    }
    // map-wide light follows the player
    const fl = W.lights[W.lights.length - 1]; W.followLight = fl;
  }
}
// herbs on the overworld
const GATHER_SPOTS = { woods: [[20, 14], [27, 24], [5, 14], [36, 10], [31, 27]], mill: [[8, 20], [24, 21]], realm: [[10, 20], [34, 22]], thornvale: [] };

/* ---------- the dungeons ---------- */
const DUNGEONS = {
  d_warren: { id: 'd_warren', title: 'The Goblin Warren', sub: 'Something has been stealing sheep — and children\'s shoes', rank: 'E', boss: 'b_goblin_king', bd: 'warren', light: '255,170,90', glow: '#ff9a3a',
    from: { map: 'woods', at: [43, 7], back: [43, 8] }, tint: 'rgba(10,6,2,.62)',
    enc: () => pickEnc([['m_goblin'], ['m_goblin', 'm_goblin'], ['m_ratfolk', 'm_ratfolk'], ['m_goblin', 'm_goblin_shaman'], ['m_gourd', 'm_goblin'], ['m_ratfolk', 'm_goblin', 'm_ratfolk']]) },
  d_crypt: { id: 'd_crypt', title: 'The Sunken Crypt', sub: 'Beneath the chapel the Inquisition burned', rank: 'D', boss: 'b_lich', bd: 'crypt', light: '160,210,255', glow: '#9fd8ff',
    from: { map: 'ashford', at: [7, 2], back: [7, 3] }, tint: 'rgba(4,6,14,.66)',
    enc: () => pickEnc([['m_skeleton'], ['m_skeleton', 'm_skeleton'], ['m_ghoul'], ['m_ghoul', 'm_skeleton'], ['m_ratfolk', 'm_ghoul'], ['m_skeleton', 'm_skeleton', 'm_ghoul']]) },
  d_mire: { id: 'd_mire', title: 'The Drowned Mine', sub: 'Flooded, abandoned — and not empty', rank: 'C', boss: 'b_troll_mother', bd: 'mire', light: '150,255,150', glow: '#7dffb0',
    from: { map: 'mill', at: [5, 4], back: [5, 5] }, tint: 'rgba(2,10,4,.64)',
    enc: () => pickEnc([['m_lizard'], ['m_lizard', 'm_lizard'], ['m_troll'], ['m_tusker', 'm_lizard'], ['m_orc'], ['m_orc', 'm_goblin_shaman']]) },
  d_crystal: { id: 'd_crystal', title: 'The Crystal Hollow', sub: 'An old quarry that cut too deep', rank: 'B', boss: 'b_crystal_wyrm', bd: 'crystal', light: '150,220,255', glow: '#b48aff',
    from: { map: 'ashford', at: [51, 2], back: [51, 3] }, tint: 'rgba(6,4,16,.66)', minGrade: 'B',
    enc: () => pickEnc([['m_minotaur'], ['m_wartotaur'], ['m_vampire'], ['m_drake'], ['m_orc', 'm_drake'], ['m_vampire', 'm_skeleton', 'm_skeleton']]) }
};
const pickEnc = L => L[Math.floor(Math.random() * L.length)];
for (const d of Object.values(DUNGEONS)) {
  SCENES[d.id] = {
    title: d.title, subtitle: d.sub, bd: d.bd, music: 'woods', dungeon: 1, encRate: .085,
    setup(W) { W.tint = d.tint; },
    encounters() { return { enemies: d.enc(), bd: d.bd }; },
    npcs() { return []; },
    get exits() { return []; }
  };
}
async function enterDungeon(id) {
  const d = DUNGEONS[id], S = G.S;
  if (!S.rank) { await narr('A black mouth in the earth. Cold air breathes out of it. The Guild posts warnings about places like this — you should register before you go poking at them.'); return; }
  if (d.minGrade && GRADES.indexOf(Power.now().grade) < GRADES.indexOf(d.minGrade)) { await narr(`${d.title}. The air itself pushes back at you — whatever lives down there is far beyond you. (Needs power grade ${d.minGrade}.)`); return; }
  const c = await ask(null, null, `${d.title} — ${d.sub}. Recommended Guild rank: ${d.rank}.${S.f['clear_' + id] ? ' (Cleared — monsters still roam.)' : ''}`, ['Go in', 'Not yet']);
  if (c !== 0) return;
  const D = G.maps[id].dungeon; S.dret = { map: S.map, x: d.from.back[0], y: d.from.back[1] };
  await World.go(id, D.start[0], D.start[1], 'up'); banner(d.title.toUpperCase(), d.sub, 2400);
}
async function leaveDungeon(id) {
  const c = await ask(null, null, 'Climb back to the surface?', ['Leave', 'Stay']); if (c !== 0) return;
  const r = G.S.dret || { map: DUNGEONS[id].from.map, x: DUNGEONS[id].from.back[0], y: DUNGEONS[id].from.back[1] };
  await World.go(r.map, r.x, r.y, 'down');
}
async function dungeonBoss(id) {
  const d = DUNGEONS[id], B = ENEMY[d.boss];
  const intro = {
    d_warren: ['A goblin twice the size of the others sits on a throne of stolen cart wheels, wearing a bent copper pot as a crown.', ['Gutrot', 'MINE. All of it. The sheep, the shoes, the shiny. And now YOUR shiny. Get \'im, lads!']],
    d_crypt: ['In the deepest vault, a skeleton in burned priest\'s robes turns to face you. Pale fire flickers in its eye sockets.', ['Morvane', 'They burned my chapel for "harbouring Drags." They were right to. Now I harbour only the dead. Join them.']],
    d_mire: ['The water heaves. Something enormous, green and dripping rises out of the flooded shaft — and smiles.', ['Old Mother Bogg', 'Fresh meat walked into my larder all by itself. Such GOOD manners.']],
    d_crystal: ['The cavern ceiling moves. Crystal scales unfold from the rock — a wyrm, sleeping in the stone for a thousand years, opens one blue eye.', ['The Crystal Wyrm', '…Dragon… blood… in you. Not… HIS blood. Not the gold one\'s. …Good. Then I may kill you… cleanly.']]
  }[id];
  await narr(intro[0]); CHAR._boss = { name: intro[1][0], sprite: B.img || d.boss }; await say('_boss', null, intro[1][1]);
  const r = await Battle.start({ enemies: [d.boss], boss: true, noFlee: true, bd: d.bd, intro: B.name.toUpperCase() });
  if (r === 'lose') { await Story.defeat(); return; }
  if (r !== 'win') return;
  G.S.f['clear_' + id] = 1; World.ents = World.ents.filter(e => e.id !== 'boss');
  await narr('Silence settles over the deep. Somewhere, a ward breaks with a sound like a bell. The great chest is unsealed.');
  Quests.event('dungeon', id); save();
}
// the follow-light and encounter rate inside dungeons
(function () {
  const _step = World.onStep.bind(World);
  World.onStep = function (e) {
    if (e.isPlayer && this.followLight) { this.followLight.x = e.x * TILE + 16; this.followLight.y = e.y * TILE + 16; }
    return _step(e);
  };
})();
