'use strict';
/* THE PAINTED TOWNS (Nov 2026) — Ashford Hollow and Highmark are each ONE hand-painted map now (towns/ashford.py,
   towns/highmark.py). Every solid thing in the picture is solid in the game and nothing else is.
   - Ashford uses the story's own coordinates, so its scene is the original 'ashford' (no districts).
   - Highmark is one scene, 'hm_city'. Anything that still asks for an old Highmark area lands at that area's spot. */
(function () {
  if (typeof World === 'undefined') return;
  window.ASH2_ON = 0;
  if (typeof ASH2 !== 'undefined') { ASH2.D = {}; ASH2.init = () => {}; ASH2.ready = 1; }   // the five Ashford districts are retired
  /* ---------------- Ashford: the carriage stop ---------------- */
  const A = SCENES.ashford, prevA = A.npcs.bind(A);
  A.npcs = function () { const L = prevA();
    if (!G.S.kid && G.S.f.vaneDone) L.push({ id: 'hm_coachman', sprite: 'folk9', x: 33, y: 26, dir: 'left', talk: () => Coach.ride('hm'), qm: () => G.S.f.trial === 'open' && !(G.S.visited || {}).hm_city ? '!' : null });
    return L; };
  /* ---------------- Highmark: one city ---------------- */
  const SPOT = { hm_gate: [31, 43, 'up'], hm_plaza: [31, 22, 'up'], hm_guild: [9, 13, 'down'], hm_lantern: [47, 34, 'down'], hm_ward: [53, 13, 'down'] };
  const C = SCENES.hm_city = HM.street('hm_city', 'Mother city of the Adventurers\' Guild', { crowd: HM.crowd([[20, 20, 28, 24], [35, 20, 43, 24], [29, 27, 34, 42], [5, 22, 20, 24], [37, 34, 58, 35], [45, 13, 59, 14], [4, 34, 26, 35]], 16) });
  C.title = 'Highmark';
  C.exits = [
    { x: 30, x2: 33, y: 45, label: 'Crown Road — carriage to Ashford (40g)', check: async () => { await Coach.ride('ash'); return false; } },
    { x: 0, y: 22, y2: 24, to: 'gloam', tx: 24, ty: 31, dir: 'up', label: 'Gloamwood (monster forest)' },
    { x: 8, x2: 10, y: 12, to: 'hm_hall', tx: 15, ty: 15, dir: 'up', label: 'Guild Headquarters', door: 1 },
    { x: 47, y: 33, to: 'hm_room', tx: 15, ty: 15, dir: 'up', label: 'Wayfarer\'s Hearth (inn)', door: 1 },
    { x: 52, x2: 54, y: 12, to: 'hm_lobby', tx: 15, ty: 15, dir: 'up', label: 'Midnight Exchange', door: 1 }];
  const T = (keys, fn) => keys.forEach(k => { C.tiles[k] = fn; });
  T(['3,17', '4,17', '5,17', '6,17', '7,17'], () => HQ.board());
  T(['10,17', '11,17', '12,17', '13,17', '14,17', '15,17', '10,19', '15,19'], async () => narr('The training yard. Straw dummies with fresh sword marks, and a chalk ring where two E-ranks are arguing about whose turn it is.'));
  T(['30,16', '31,16', '32,16', '33,16'], async () => narr('The speaker\'s podium. Four hundred years of Guild Masters have stood here. The stone is worn into two shallow footprints.'));
  if (0) T(['39,32', '38,32', '40,32'], async () => narr('The smithy. A dwarf with a beard braided round her neck beats a glowing blade flat. "Ask after the Trial. Swords are cheaper then."'));
  if (0) T(['56,32', '55,32'], async () => narr('The Gilded Tankard. Somebody inside is singing a song about the Sword Saint. Badly. Everyone joins in on the chorus anyway.'));
  T(['12,31'], async () => narr('A potion shop. Everything in the window glows a little, including the cat.'));
  T(['20,39', '21,39', '23,41', '24,41', '25,38', '26,38'], async () => narr(pick(['Travellers\' market: maps of the Gate pockets, "guaranteed accurate". None of them agree.', 'A stall selling lucky charms for Trial applicants. A sign says NO REFUNDS IF YOU DIE.', 'Hot bread, cheap knives, and a man selling "genuine dragon scales" that are painted roof tiles.'])));
  T(['1,21'], async () => narr('A signpost: GLOAMWOOD — MONSTERS — TOLL-MEN — DO NOT FEED THE ALPHA.'));
  C.npcs = () => {
    const f = G.S.f, L = [
      { id: 'hollis_v2', sprite: 'hollis', x: 29, y: 19, dir: 'down', talk: async () => say('hollis_v2', 'neutral', f.trial === 'done' ? '"Licensed, are you? Good. The Gate\'s still closed to you, hood. When the Guild opens a pocket, you\'ll hear the bell."' : '"Nobody goes through that door without a Guild contract. Not you, not the Crown, not the Headmaster\'s cat."') },
      { id: 'hm_coachman', sprite: 'folk9', x: 32, y: 43, dir: 'up', talk: () => Coach.ride('ash') },
      { id: 'hm_cutter', sprite: 'elf_f1', x: 50, y: 15, dir: 'down', talk: async () => say('hm_cutter', null, HQ.done('shrine') ? '"You took our little splinter. The Knife isn\'t angry. The Knife is INTERESTED. That\'s so much worse, darling."' : '"Lovely hood. The Velvet Knife collects lovely things. Mostly secrets. There\'s a shrine in Gloamwood humming her name — stay away from it."') },
      { id: 'hm_briar', sprite: 'folk14', x: 49, y: 35, dir: 'down', talk: async () => say('hm_briar', null, HQ.done('briar') ? '"…You\'re the one who took the cart. The Twins have a list. You\'re near the top."' : '"Briar Riders drink free on Lantern Row. Don\'t ask why. The innkeepers don\'t."') }];
    if (f.hmTollPaid !== G.S.day) L.push({ id: 'hm_hound', sprite: 'bandit', x: 30, y: 40, dir: 'right', talk: async () => {
      const c = await ask('hm_hound', null, '"Road tax, friend. Kade\'s tax. The Guild owns the Gate — the Gilded Hound owns the ROADS. Ten gold."', ['Pay 10 gold', 'Tell him where to put his tax', '(Walk away)']); Dlg.close();
      if (c === 0 && G.S.gold >= 10) { G.S.gold -= 10; f.hmTollPaid = G.S.day; UI.hud(); }
      else if (c === 1) { const r = await Battle.start({ enemies: ['hound_toll', 'hound_toll'], bd: 'town', intro: 'The Gilded Hound\'s road-tax men' }); if (r === 'win') f.hmTollPaid = G.S.day; else Story.heal(true); } } });
    if (f.trial === 'open' && !f.hmAnn) L.push({ id: 'hm_crier', sprite: 'folk12', x: 31, y: 24, dir: 'down', talk: async () => say('hm_crier', null, '"Hear ye! The Guild Master speaks from the Platform! The Trial begins!"') });
    return L;
  };
  // the announcement happens as soon as you walk into the plaza
  const inPlaza = (x, y) => ((x + .5 - 31.5) / 13) ** 2 + ((y + .5 - 18.5) / 9.5) ** 2 <= 1;
  C.step = (x, y) => { if (G.S.f.trial === 'open' && !G.S.f.hmAnn && inPlaza(x, y)) { setTimeout(() => Story.run(hmAnnouncement), 50); return true; } return false; };
  // interiors come back out onto the one map
  SCENES.hm_hall.exits[0] = { x: 14, x2: 17, y: 17, to: 'hm_city', tx: 9, ty: 13, dir: 'down' };
  SCENES.hm_lobby.exits[0] = { x: 14, x2: 17, y: 17, to: 'hm_city', tx: 53, ty: 13, dir: 'down' };
  SCENES.hm_room.exits[0] = { x: 14, x2: 16, y: 16, y2: 17, to: 'hm_city', tx: 47, ty: 34, dir: 'down' };
  if (SCENES.gloam) SCENES.gloam.exits = [{ x: 23, x2: 26, y: 33, to: 'hm_city', tx: 2, ty: 23, dir: 'right', label: 'Highmark' }];
  if (typeof ARRIVE !== 'undefined') ARRIVE.hm_city = ARRIVE.hm_gate;
  const _l = World.load.bind(World);
  World.load = async function (name, x, y, dir) {
    if (SPOT[name]) { const s = SPOT[name]; name = 'hm_city'; x = s[0]; y = s[1]; dir = s[2]; }
    const OLD = { a_chapel: [8, 10], a_river: [30, 35], a_terrace: [53, 12], a_lower: [20, 32] };   // saves made in the old districts
    if (OLD[name]) { [x, y] = OLD[name]; name = 'ashford'; dir = 'down'; }
    const r = await _l(name, x, y, dir);
    try { if (name === 'hm_city') { G.S.visited = G.S.visited || {}; G.S.visited.hm_gate = G.S.visited.hm_city = 1;
        const p = this.player; if (p && C.step(p.x, p.y)) { } } } catch (e) { }
    return r;
  };
  // World.go uses SCENES[to].title for its banner — the old names still need to exist (they do), so nothing else to do.
  /* ---------------- the corner map: which part of town you're in ---------------- */
  if (typeof TOWNS_MAP !== 'undefined') {
    TOWNS_MAP.ashford = { name: 'Ashford Hollow', region: (x, y) => y < 17 ? (x < 26 ? 'nw' : x > 33 ? 'ne' : 'n') : y > 23 ? (x < 26 ? 'sw' : x > 33 ? 'se' : 's') : (x < 21 ? 'w' : x > 38 ? 'e' : 'c'),
      cells: { nw: [0, 0, 'Chapel & clinic', 'Chapel · Maren\'s clinic · Pip · smithy'], n: [1, 0, 'North Gate', '↑ the Old Mill'], ne: [2, 0, 'Guild & inn', 'Tobb\'s store · Crooked Kettle · Adventurers\' Guild'],
        w: [0, 1, 'West road', ''], c: [1, 1, 'Market Square', 'Fountain · stalls'], e: [2, 1, 'East Gate', '→ the East Woods'],
        sw: [0, 2, 'Lower town', 'Houses · sewer grate'], s: [1, 2, 'South bridge', '↓ Millbrook · Kettlebrook · carriage stop'], se: [2, 2, 'Lower town', 'Midnight Exchange'] } };
    TOWNS_MAP.highmark = { name: 'Highmark', region: (x, y) => y < 26 ? (x < 19 ? 'w' : x > 44 ? 'e' : 'c') : (x < 28 ? 'sw' : x > 35 ? 'se' : 's'),
      cells: { w: [0, 1, 'Guild Quarter', 'Guild HQ · quest board · ← Gloamwood'], c: [1, 1, 'Gate Plaza', 'The Gate · the Platform'], e: [2, 1, 'Whisper Ward', 'Midnight Exchange'],
        sw: [0, 2, 'Market lane', 'Potion shop · travellers\' market'], s: [1, 2, 'Crown Road Gate', '↓ carriage to Ashford'], se: [2, 2, 'Lantern Row', 'Wayfarer\'s Hearth inn · smithy · tavern'] } };
    for (const k of ['hm_gate', 'hm_plaza', 'hm_guild', 'hm_lantern', 'hm_ward', 'a_chapel', 'a_river', 'a_terrace', 'a_lower']) { delete TOWNS_MAP.ashford.cells[k]; }
    TownMap.town = m => m === 'ashford' ? 'ashford' : m === 'hm_city' ? 'highmark' : m === 'gloam' ? null : null;
    TownMap.render = function () {
      const m = G.S && G.S.map, t = G.mode === 'world' && !G.S.kid ? this.town(m) : null;
      if (!this.el) { const _r = Object.getPrototypeOf(this); }
      if (!this.el) { this.el = document.createElement('div'); this.el.id = 'tmap'; document.body.append(this.el);
        const st = document.createElement('style'); st.textContent = `#tmap{position:fixed;z-index:30;left:max(10px,env(safe-area-inset-left));top:calc(max(8px,env(safe-area-inset-top)) + 96px);padding:5px;border-radius:12px;background:rgba(8,16,12,.62);border:1px solid rgba(255,255,255,.16);font-family:Nunito,system-ui;-webkit-user-select:none;user-select:none}
          #tmap.hide{display:none}#tmap .g{display:grid;grid-template-columns:repeat(3,20px);grid-template-rows:repeat(3,14px);gap:3px}#tmap .c{border-radius:4px;background:rgba(255,255,255,.14)}#tmap .c.on{background:#46ff95;box-shadow:0 0 8px #46ff95}
          #tmap b{display:block;font:800 9px Nunito;color:#cfe3d6;text-align:center;margin-top:3px}#tmap.big{padding:10px}#tmap.big .g{grid-template-columns:repeat(3,112px);grid-template-rows:repeat(3,58px);gap:6px}
          #tmap.big .c{padding:4px 6px;font:800 11px/1.15 Nunito;color:#fff}#tmap.big .c small{display:block;font:600 9.5px/1.2 Nunito;color:#cfe3d6;margin-top:2px}#tmap.big .c.on small{color:#062}#tmap.big .c.on{color:#031}#tmap.big b{font-size:12px}`; document.head.append(st);
        this.el.addEventListener('pointerdown', e => { e.preventDefault(); e.stopPropagation(); this.big = !this.big; try { sfx('blip'); } catch (x) { } this.key = ''; this.render(); }); }
      if (!t || !World.player) { this.el.classList.add('hide'); this.key = ''; return; }
      const Tm = TOWNS_MAP[t], here = Tm.region(World.player.x, World.player.y), key = t + here + this.big;
      this.el.classList.remove('hide'); if (key === this.key) return; this.key = key;
      const grid = Array(9).fill('<i></i>');
      for (const [id, [x, y, nm, info]] of Object.entries(Tm.cells)) grid[y * 3 + x] = `<div class="c ${id === here ? 'on' : ''}">${this.big ? `${nm}<small>${info}</small>` : ''}</div>`;
      this.el.className = this.big ? 'big' : '';
      this.el.innerHTML = `<div class="g">${grid.join('')}</div><b>${this.big ? Tm.name + ' · tap to close' : Tm.cells[here][2]}</b>`;
    };
  }
  Object.assign(A.tiles, {
    '53,35': async () => { await narr('THE MIDNIGHT EXCHANGE. Black stone, gold trim, a brass clock that is never wrong.'); await narr('A doorman in a midnight-blue coat looks you over and smiles politely. "Members and guests of members, friend."'); },
    '12,37': async () => narr('The sewer grate. Rusted bars, a green glow far down the tunnel, and a smell that has its own weather. The lock is new.'),
    '30,23': async () => narr('The fountain. Coins at the bottom — and one green pebble somebody was brave enough to throw in.') });
  /* ---------------- Ashford signposts at the three gates ---------------- */
  const _r = World.render.bind(World);
  World.render = function (c, t) {
    _r(c, t);
    try { if (!G.S || G.S.map !== 'ashford' || this.loading || G.mode !== 'world') return;
      const cx = Math.round(this.cam.x), cy = Math.round(this.cam.y);
      const S = [[30, 1.2, '↑ North Gate — Old Mill'], [57.6, 20.5, 'East Woods →'], [30, 40.2, '↓ South roads — Millbrook · Kettlebrook']];
      c.save(); c.font = '800 9px Nunito, system-ui'; c.textAlign = 'center'; c.textBaseline = 'middle';
      for (const [x, y, txt] of S) { const lx = x * TILE - cx, ly = y * TILE - cy, w = c.measureText(txt).width + 12;
        c.fillStyle = 'rgba(10,18,14,.72)'; c.beginPath(); c.roundRect ? c.roundRect(lx - w / 2, ly - 8, w, 16, 7) : c.rect(lx - w / 2, ly - 8, w, 16); c.fill();
        c.strokeStyle = 'rgba(255,220,140,.6)'; c.lineWidth = 1; c.stroke(); c.fillStyle = '#ffe7a8'; c.fillText(txt, lx, ly + .5); }
      c.restore(); } catch (e) { }
  };
})();

/* ---------------- painted interiors for the buildings that had none ---------------- */
(function () {
  if (typeof room !== 'function' || typeof door !== 'function') return;
  const folk = (id, sprite, x, y, lines) => ({ id, sprite, x, y, dir: 'down', ai: 'turn', turns: ['down', 'left', 'right'], talk: async () => { CHAR[id] = CHAR[id] || { name: 'Resident', sprite }; await say(id, null, pick(lines)); } });
  // Ashford
  room('a_chapelin', 'in_chapel2', 'The Chapel', { safe: true, tiles: { '7,4': async () => narr('The altar. White Inquisition cloth over old stone — and under the cloth, if you lift the corner, seven figures with green eyes carved into the rock.'), '8,4': async () => narr('A collection box with a padlock. The lock is newer than the box.') },
    npcs: () => [folk('a_priest', 'acolyte', 12, 5, ['"The Ember keeps us. Mostly from asking questions."', '"Light a candle if you like. They\'re a copper each. Faith is free; wax isn\'t."'])] });
  room('a_smithy', 'in_smithy2', "Oren's Old Forge", { safe: true, tiles: { '6,5': async () => narr('The anvil. Somebody has hammered a tiny dragon into its side, then filed most of it away.'), '7,5': async () => narr('The anvil rings when you tap it, slow and even, like a heartbeat.') },
    npcs: () => [folk('a_smith', 'dwarf_f1', 10, 8, ['"Blades sharpened, ten copper. Questions about green eyes, the door\'s behind you."', '"Good steel doesn\'t care who holds it. People do."'])] });
  room('a_h6', 'in_home2', 'A House', { safe: true, npcs: () => [folk('a_res6', 'folk3', 7, 8, ['"Shoes off, please. We just swept."', '"The Trial\'s coming — my boy wants to sign up. I want to lock him in the cellar."'])] });
  room('a_h7', 'in_home3', 'A House', { safe: true, npcs: () => [folk('a_res7', 'folk7', 4, 7, ['"Mind the cat. She bites the Inquisition."', '"Grandmother used to tell stories about the Drag wardens. Nobody else does any more."'])] });
  room('a_h8', 'in_home4', 'A House', { safe: true, npcs: () => [folk('a_res8', 'folk16', 8, 8, ['"Sorry about the smell. Fish stew. It\'s ALWAYS fish stew."'])] });
  door('ashford', 8, 8, 'a_chapelin'); door('ashford', 22, 14, 'a_smithy'); door('ashford', 18, 5, 'a_h6'); door('ashford', 39, 6, 'a_h7'); door('ashford', 9, 36, 'a_h8');
  // Highmark
  room('hm_smithy', 'in_smithy2', 'Highmark Smithy', { safe: true, npcs: () => [folk('hm_smithd', 'dwarf_f1', 10, 8, ['"Ask after the Trial. Swords are cheaper then."', '"Guild steel, Guild price. Crown steel, Crown price — which is double, and it bends."'])] });
  room('hm_tavern', 'in_tavern2', 'The Gilded Tankard', { safe: true, npcs: () => [folk('hm_barkeep', 'folk9', 15, 6, ['"Sword Saint song again? Third time tonight. Fine. FINE."', '"Briar Riders drink free. Don\'t ask. I don\'t."']), folk('hm_drinker', 'hrok', 9, 9, ['"Three Trials. Three. This year I\'m bringing a bigger axe."'])] });
  const homes = [[5, 31], [6, 41], [14, 41], [47, 20], [56, 20], [48, 42], [56, 42], [12, 31]];
  homes.forEach(([x, y], i) => { const k = 'hm_home' + i;
    room(k, 'in_home' + (2 + i % 3), i === 7 ? 'Potion Shop' : 'A House', { safe: true, npcs: () => [folk(k + 'r', ['folk3', 'folk7', 'folk16', 'folk5', 'elf_f1', 'folk11', 'dwarf_m1', 'elf_m1'][i], 7, 8,
      i === 7 ? ['"Everything glows a little. That\'s how you know it\'s working. Mostly."'] : ['"A Guild city, and still the rent goes up every Trial."', '"My daughter passed the Trial last year. She writes from Saltreach. I don\'t ask what she does there."', '"Shut the door, the Gate draught gets in."'])] });
    door('hm_city', x, y, k); });
  SCENES.hm_city.exits.push({ x: 39, y: 32, to: 'hm_smithy', tx: 7, ty: 9, dir: 'up', label: 'Smithy', door: 1 }, { x: 56, y: 32, to: 'hm_tavern', tx: 10, ty: 11, dir: 'up', label: 'Gilded Tankard', door: 1 });
  Object.defineProperty(SCENES.hm_smithy, 'exits', { configurable: true, value: [{ x: 7, x2: 8, y: 10, to: 'hm_city', tx: 39, ty: 33, dir: 'down' }] });
  Object.defineProperty(SCENES.hm_tavern, 'exits', { configurable: true, value: [{ x: 10, x2: 11, y: 12, to: 'hm_city', tx: 56, ty: 33, dir: 'down' }] });
})();
