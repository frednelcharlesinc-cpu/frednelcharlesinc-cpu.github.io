'use strict';
/* ================= LIEUTENANTS & RIGHT-HANDS — every dungeon, every time =================
   A dungeon lord never sits alone:
     · FOUR LIEUTENANTS hold the four keys to the boss room. They wait in the far corners of the dungeon.
       Beat each one (a tough elite fight) to take its key. Until you hold all four, the boss door stays sealed.
     · A RIGHT-HAND — the lord's strongest servant — fights beside the boss in the final battle.
   Works on every dungeon that has a boss room (the woods' dungeons, the Warren, the Crypt, the Mine, the Hollow,
   the sewers). Raids/Gates keep their own rules. Add a new dungeon to PROFILE to give its people names. */
(function () {
  const PROFILE = {
    d_fang: { lt: ['lupine_alpha', 'rime_lupine', 'lupine_alpha', 'rime_lupine'], names: ['Greyjaw', 'Frostmaw', 'Ashpelt', 'Rimeclaw'], rh: ['rime_alpha', 'Skarn, the Den Mother\'s Right Fang'],
      lines: ['*Greyjaw bares a mouthful of broken teeth. A key hangs from a leather cord around his neck.*', '*Frost crackles off Frostmaw\'s fur as she rises from the snow.*', '*Ashpelt circles you once, twice. Testing.*', '*Rimeclaw doesn\'t growl. That\'s worse.*'] },
    d_cinder: { lt: ['m_goblin_shaman', 'm_tusker', 'm_goblin_shaman', 'm_tusker'], names: ['Kindlehex', 'Coalhorn', 'Smokewick', 'Brandtusk'], rh: ['m_drake', 'Scorch, the Wyrmling\'s Hatchmate'],
      lines: ['Kindlehex: "The key? It\'s warm. Like you\'ll be."', '*Coalhorn paws the cinders. Its tusks glow red at the tips.*', 'Smokewick: "Shh. Shh. The little dragon is sleeping. You\'ll wake it. I won\'t let you."', '*Brandtusk snorts sparks and lowers its head.*'] },
    d_shrine: { lt: ['m_lizard', 'm_ghoul', 'm_lizard', 'm_skeleton'], names: ['Tide-Acolyte Vass', 'The Drowned Choir', 'Reefjaw', 'Brother Silt'], rh: ['m_troll', 'Glub, the Shrine-Keeper'],
      lines: ['Vass: "Ssseal-bearer… you carry the Accord\'s stink."', '*Something under the water is singing. Then it stands up.*', '*Reefjaw clicks its teeth. A rusted key is wedged between them.*', 'Brother Silt: "I signed the Accord too, once. Look where it got me."'] },
    d_vault: { lt: ['m_skeleton', 'm_ghoul', 'm_skeleton', 'm_orc'], names: ['Warden of the First Door', 'The Hollow Oathkeeper', 'Ser Mossbone', 'The Gaoler'], rh: ['m_minotaur', 'Ironvow, the Warden\'s Shield'],
      lines: ['*A skeleton in green lacquer raises a sword in salute — then attacks.*', 'The Oathkeeper: "…speak the oath… …no? …then bleed for it."', '*Moss falls from Ser Mossbone\'s helm as it turns its head toward your eyes.*', 'The Gaoler: "Nobody leaves. Nobody GETS IN, either."'] },
    d_warren: { lt: ['m_goblin_shaman', 'm_goblin', 'm_ratfolk', 'm_gourd'], names: ['Snikk the Hexer', 'Grub, Keeper of Shoes', 'Ratking Nib', 'Big Squash'], rh: ['m_orc', 'Brakka, Gutrot\'s Muscle'],
      lines: ['Snikk: "Boss gave ME a key. Me! Not you. Mine!"', 'Grub: "You want shoes? I got SO many shoes. You can\'t have any."', '*Ratking Nib squeaks an order. Every rat in the room looks at you.*', '*Big Squash rolls toward you. It hates you. Nobody knows why.*'] },
    d_crypt: { lt: ['m_skeleton', 'm_ghoul', 'm_skeleton', 'm_ghoul'], names: ['Deacon Ash', 'The Weeping Sexton', 'Bellringer Bones', 'Grave-Sister Mott'], rh: ['m_vampire', 'Lady Vesper, Morvane\'s Hand'],
      lines: ['Deacon Ash: "The Inquisition burned me twice. You won\'t be the third fire."', '*The Sexton weeps black water and lifts a shovel.*', '*A bell tolls. Bones answer.*', 'Mott: "Morvane said you\'d come. He said you\'d have the eyes."'] },
    d_mire: { lt: ['m_lizard', 'm_tusker', 'm_lizard', 'm_troll'], names: ['Foreman Scale', 'Old Pickaxe', 'Mudtongue', 'Bogg\'s Eldest'], rh: ['m_troll', 'Bogg\'s Favourite Son'],
      lines: ['Foreman Scale: "Shift\'s not over. Back to work — in the GROUND."', '*Old Pickaxe still wears a miner\'s helmet. It doesn\'t belong to him.*', '*Mudtongue\'s tongue is very, very long.*', 'Bogg\'s Eldest: "Mother says you\'re dinner. Mother is always right."'] },
    d_crystal: { lt: ['m_minotaur', 'm_vampire', 'm_drake', 'm_wartotaur'], names: ['The Quarry-Master', 'Count Prism', 'Shardwing', 'Old Seam'], rh: ['m_drake', 'The Wyrm\'s Shadow'],
      lines: ['*The Quarry-Master drags a labrys through the crystal. It sings.*', 'Count Prism: "Such lovely eyes. I collect lovely things."', '*Shardwing shrieks, and the cave walls shriek back.*', '*Old Seam is less a beast than a piece of the mountain that got angry.*'] }
  };
  const GENERIC = { names: ['The First Lieutenant', 'The Second Lieutenant', 'The Third Lieutenant', 'The Fourth Lieutenant'],
    lines: ['"The boss\'s door has four locks. I\'m one of them."', '"Turn around. Last warning."', '"You took the others\' keys? Then you\'ve earned a real fight."', '"Last key. Last chance to run."'] };
  const SEWER_NAMES = ['The Rat Captain', 'Sludge-Warden', 'Pipe-Gnawer', 'The Grate Keeper'];

  const eligible = id => { const d = DUNGEONS[id], M = G.maps && G.maps[id]; return d && !d.raid && M && M.dungeon && M.dungeon.bossRoom && ENEMY[d.boss]; };
  const pool = id => { const d = DUNGEONS[id], seen = new Set(); for (let i = 0; i < 40; i++) { try { for (const e of d.enc()) if (ENEMY[e]) seen.add(e); } catch (x) { } } return [...seen]; };
  const prof = id => {
    if (PROFILE[id] && PROFILE[id]._ok) return PROFILE[id];
    let P = PROFILE[id];
    if (!P) {
      const pl = pool(id).sort((a, b) => ENEMY[b].hp - ENEMY[a].hp); if (!pl.length) return null;
      const sewer = typeof SEWERS !== 'undefined' && SEWERS[id];
      P = PROFILE[id] = { lt: [0, 1, 2, 3].map(i => pl[i % pl.length]), names: sewer ? SEWER_NAMES : GENERIC.names, rh: [pl[0], `${ENEMY[DUNGEONS[id].boss].name.split(',')[0]}'s Right Hand`], lines: GENERIC.lines };
    }
    P.lt = P.lt.map(b => ENEMY[b] ? b : pool(id)[0]);
    if (!ENEMY[P.rh[0]]) P.rh[0] = pool(id).sort((a, b) => ENEMY[b].hp - ENEMY[a].hp)[0];
    // the elites: lieutenants are a real fight; the right-hand is nearly a second boss
    const tag = (t, B) => t + (B.trait ? ' · ' + B.trait.split(/ — |\(/)[0].trim() : '');   // short captions: what it is, and its one trick
    P.lt.forEach((b, i) => { const B = ENEMY[b]; ENEMY[`lt_${id}_${i}`] = Object.assign({}, B, { name: P.names[i], img: B.img || b, hp: Math.round(B.hp * 2.2), atk: Math.round(B.atk * 1.2), def: (B.def || 0) + 1,
      brk: Math.round((B.brk || 40) * 1.5), xp: Math.round((B.xp || 10) * 3), gold: Math.round((B.gold || 5) * 3), size: Math.max(B.size || 1, 1.15), trait: tag('Lieutenant', B) }); });
    { const B = ENEMY[P.rh[0]]; ENEMY[`rh_${id}`] = Object.assign({}, B, { name: P.rh[1].split(',')[0], title: P.rh[1], img: B.img || P.rh[0], hp: Math.round(B.hp * 2.4), atk: Math.round(B.atk * 1.3), def: (B.def || 0) + 2,
      brk: Math.round((B.brk || 40) * 1.6), xp: Math.round((B.xp || 10) * 4), gold: Math.round((B.gold || 5) * 4), size: Math.max(B.size || 1, 1.3), trait: tag('Right Hand', B) }); }
    P._ok = 1; return P;
  };
  const keys = id => { const S = G.S; S.ltKeys = S.ltKeys || {}; return S.ltKeys[id] = S.ltKeys[id] || [0, 0, 0, 0]; };
  const nKeys = id => keys(id).reduce((a, b) => a + b, 0);
  const open = id => G.S.f['clear_' + id] || nKeys(id) >= 4;

  /* where the four wait: spread out across the dungeon, away from the entrance and the boss room */
  const SPOTS = {};
  function spots(id) {
    if (SPOTS[id]) return SPOTS[id];
    const M = G.maps[id], D = M.dungeon, [bx0, by0, bx1, by1] = D.bossRoom, inBoss = (x, y) => x >= bx0 && x <= bx1 && y >= by0 && y <= by1;
    const X = typeof FCL !== 'undefined' && FCL[id] && FCL[id].dx, extra = X ? [...X.levers.map(l => [l.x, l.y]), [X.clue[0], X.clue[1] + 1], X.relic, ...X.secret.map(s => [s.x, s.y])] : [];
    const busy = new Set([...(D.chests || []), ...(D.gather || []), ...(D.torches || []), D.start, D.exit, ...extra].map(p => p + ''));
    const ok = (x, y) => M.col[y] && M.col[y][x] === '0' && !inBoss(x, y);
    const dist = new Map([[D.start + '', 0]]), q = [D.start];
    while (q.length) { const [a, b] = q.shift(); for (const [dx, dy] of [[1, 0], [-1, 0], [0, 1], [0, -1]]) { const x = a + dx, y = b + dy, k = x + ',' + y; if (!dist.has(k) && ok(x, y)) { dist.set(k, dist.get(a + ',' + b) + 1); q.push([x, y]); } } }
    // only tiles with open space around them (rooms, not corridors), not on top of chests or torches
    const N8 = [[1, 0], [-1, 0], [0, 1], [0, -1], [1, 1], [-1, -1], [1, -1], [-1, 1]];
    // stand in open floor only: never next to a chest or torch, never in a doorway (they'd cork the way through)
    const cand = [...dist.keys()].map(k => k.split(',').map(Number)).filter(([x, y]) => !busy.has(x + ',' + y) && dist.get(x + ',' + y) > 6 &&
      N8.every(([dx, dy]) => ok(x + dx, y + dy) && !busy.has((x + dx) + ',' + (y + dy))));
    const pts = [D.start, [(bx0 + bx1) >> 1, (by0 + by1) >> 1]], out = [];
    for (let i = 0; i < 4 && cand.length; i++) {
      let best = null, bd = -1;
      for (const c of cand) { const d = Math.min(...pts.concat(out).map(p => Math.abs(p[0] - c[0]) + Math.abs(p[1] - c[1]))); if (d > bd) { bd = d; best = c; } }
      out.push(best);
    }
    return (SPOTS[id] = out);
  }
  /* the boss door: the tiles where the paths enter the boss room */
  function doors(id) {
    const M = G.maps[id], [bx0, by0, bx1, by1] = M.dungeon.bossRoom, inB = (x, y) => x >= bx0 && x <= bx1 && y >= by0 && y <= by1, fl = (x, y) => M.col[y] && M.col[y][x] === '0';
    const out = [];
    for (let y = by0; y <= by1; y++) for (let x = bx0; x <= bx1; x++) if (fl(x, y) && [[1, 0], [-1, 0], [0, 1], [0, -1]].some(([dx, dy]) => !inB(x + dx, y + dy) && fl(x + dx, y + dy))) out.push([x, y]);
    return out;
  }
  const gateSheet = (() => { let S; return () => {
    if (S) return S; const one = document.createElement('canvas'); one.width = one.height = 64; const x = one.getContext('2d');
    x.fillStyle = 'rgba(0,0,0,.3)'; x.fillRect(4, 56, 56, 6);
    x.fillStyle = '#2a2622'; x.fillRect(2, 6, 60, 52); x.fillStyle = '#5a5048'; x.fillRect(2, 6, 60, 6);
    for (let i = 0; i < 6; i++) { x.fillStyle = '#9aa0a8'; x.fillRect(7 + i * 9, 12, 4, 46); x.fillStyle = '#d8dde6'; x.fillRect(7 + i * 9, 12, 1, 46); }
    x.fillStyle = '#9aa0a8'; x.fillRect(2, 30, 60, 4);
    for (let i = 0; i < 4; i++) { x.fillStyle = '#ffd34a'; x.beginPath(); x.arc(14 + i * 12, 22, 3, 0, 7); x.fill(); x.fillStyle = '#000'; x.fillRect(13 + i * 12, 22, 2, 4); }
    S = document.createElement('canvas'); S.width = 64 * 9; S.height = 64 * 12; const s = S.getContext('2d');
    for (let r = 0; r < 12; r++) for (let f = 0; f < 9; f++) s.drawImage(one, f * 64, r * 64); return S; }; })();

  async function populate(W, id) {
    const P = prof(id); if (!P) return;
    const K = keys(id), sp = spots(id), cleared = G.S.f['clear_' + id];
    for (let i = 0; i < 4; i++) {
      if (K[i] || cleared || !sp[i]) continue;
      const E = ENEMY[`lt_${id}_${i}`]; let img = null; try { img = await npcImg(E.img); } catch (e) { continue; }
      W.ents.push(new Ent({ id: `lt_${i}`, x: sp[i][0], y: sp[i][1], dir: 'down', img, size: isDragon(E) ? 1.7 : 1.15, name: E.name, ai: 'turn', turns: ['down', 'left', 'right'], talk: () => fightLt(id, i) }));
    }
    if (!open(id)) for (const [x, y] of doors(id)) {
      if (W.col[y]) W.col[y][x] = 1;
      W.ents.push(new Ent({ id: `ltgate_${x}_${y}`, x, y, dir: 'down', img: gateSheet(), pickup: 1, name: 'Sealed door', talk: () => gateTalk(id) }));
    }
  }
  async function gateTalk(id) {
    const n = nKeys(id);
    await narr(`An iron door with FOUR keyholes. ${n ? `${n} of them ${n > 1 ? 'are' : 'is'} unlocked.` : 'Every one is locked.'} Behind it, something breathes slow and heavy.`);
    if (n < 4) await narr(`The lord of this place gave a key to each of its four lieutenants. Find them. (${n}/4 keys)`);
  }
  function unseal(id) {
    for (const e of World.ents.filter(e => /^ltgate_/.test(e.id))) if (World.col[e.y]) World.col[e.y][e.x] = 0;
    World.ents = World.ents.filter(e => !/^ltgate_/.test(e.id));
  }
  async function fightLt(id, i) {
    const P = prof(id), d = DUNGEONS[id], key = `lt_${id}_${i}`, E = ENEMY[key];
    CHAR._lt = { name: E.name, sprite: E.img }; await say('_lt', null, (P.lines || GENERIC.lines)[i] || GENERIC.lines[i]);
    const pl = pool(id); const guards = i >= 2 && pl.length ? [pl[Math.floor(Math.random() * pl.length)]] : [];   // the later two bring a guard
    const r = await Battle.start({ enemies: [key, ...guards], noFlee: true, bd: d.bd, music: 'boss', intro: 'LIEUTENANT — ' + E.name.toUpperCase() });
    if (r === 'lose') { await Story.defeat(); return; }
    if (r !== 'win') return;
    keys(id)[i] = 1; World.ents = World.ents.filter(e => e.id !== `lt_${i}`); sfx('level');
    const n = nKeys(id);
    toast(`<b style="color:#ffd34a">🗝 Boss key ${n}/4</b> — taken from ${E.name}`, 3200);
    if (n >= 4) { unseal(id); await narr('Somewhere deep in the dungeon, four locks turn at once. The way to the lord of this place is open.'); }
    save();
  }

  /* the right-hand steps in beside the boss */
  const _db = dungeonBoss;
  dungeonBoss = async function (id) {   // eslint-disable-line no-global-assign
    if (eligible(id) && prof(id)) {
      if (!open(id)) { await gateTalk(id); return; }
      const R = ENEMY['rh_' + id];
      if (R && !G.S.f['clear_' + id]) { window.__rhFor = id; await narr(`${R.title || R.name} steps out of the dark at the lord's side. Not a servant — a second blade.`); }
    }
    try { return await _db(id); } finally { window.__rhFor = null; }
  };
  /* every fight in the woods and their dungeons happens on that place's own battlefield (assets/bd_fc_*, bd_d_*) */
  const LOCAL_BD = { woods: 'fc_cross', woods_n: 'fc_north', woods_e: 'fc_east', woods_s: 'fc_south', woods_w: 'fc_west', d_fang: 'd_fang', d_cinder: 'd_cinder', d_shrine: 'd_shrine', d_vault: 'd_vault' };
  const GENERIC_BD = ['forest', 'field', 'snow', 'mire', 'warren', 'crypt', 'crystal'];
  if (typeof BTBD !== 'undefined') for (const k of Object.values(LOCAL_BD).concat(['d_fang_boss', 'd_cinder_boss'])) BTBD.GND[k] = .52;
  const _bs = Battle.start.bind(Battle);
  Battle.start = function (cfg) {
    try {
      if (typeof cfg === 'string') cfg = { enemies: [cfg] };
      const loc = G.S && LOCAL_BD[G.S.map];
      if (loc && cfg && typeof cfg === 'object' && (!cfg.bd || GENERIC_BD.includes(cfg.bd))) cfg = Object.assign({}, cfg, { bd: loc });
      const id = window.__rhFor;
      if (id && cfg && typeof cfg === 'object' && cfg.boss && Array.isArray(cfg.enemies) && cfg.enemies.includes(DUNGEONS[id].boss) && ENEMY['rh_' + id] && !cfg.enemies.includes('rh_' + id)) {
        window.__rhFor = null; cfg = Object.assign({}, cfg, { enemies: [...cfg.enemies, 'rh_' + id] });
      }
    } catch (e) { }
    return _bs(cfg);
  };

  /* spawn them whenever a dungeon loads */
  const _load = World.load.bind(World);
  World.load = async function (name, ...a) {
    const r = await _load(name, ...a);
    try { if (eligible(name)) { await populate(World, name); if (typeof MiniMap !== 'undefined') MiniMap.ckey = ''; } } catch (e) { console.warn('lieutenants', e); }
    return r;
  };
  /* DRAGON SCALE — drakes, wyrms and dragons are BIG: regular ones 1.7x, boss dragons 2.1x (battle), bigger in the world too */
  const isDragon = E => !!E && (/drake|wyrm|dragon|wyrmling/i.test(E.name || '') || /^m_(drake|cavewyrm)$/.test(E.img || ''));
  for (const k in ENEMY) { const E = ENEMY[k]; if (isDragon(E)) E.size = Math.max(E.size || 1, E.boss ? 2.1 : 1.7); }
  window.isDragon = isDragon;
  window.Lieutenants = { PROFILE, keys, nKeys, spots, doors, gateSheet };
})();
