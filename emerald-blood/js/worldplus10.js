'use strict';
/* ================= WORLD+ 10 (Chat B — World & Maps) =================
   THE VALE OF ECHOES — stand at all four World's Ends and a fifth road opens at the Crossroads: a hidden vale the maps
                        forgot, the Hall of First Light, and the Echo Warden.
   THE FOUR-FRAGMENT HUNT — each World's End holds a scrap of an old map. Join all four: the X is in the Vale.
   HERDS — deer and boar wander the woods in small herds, and scatter when you run at them.
   MEADOW RACES — the big open meadows have a racing flag. Ride from one end to the other against the clock.
   NIGHT LORDS — after dark, something big walks each deep wood. One per night.
   ASHFORD UPGRADES — fund lamps, the fountain, the market, a watch post and a bathhouse (town board).
   (Lines are B drafts — Chat A may rewrite.) */
(function () {
  const W4 = () => window.WorldPlus4;
  const S_ = () => G.S, F = () => G.S.f;
  const day = () => (typeof Cal !== 'undefined' ? Cal.day() : 1);
  const night = () => (typeof Ambient !== 'undefined' && Ambient.night) || 0;
  const rare = () => W4().giveRare();
  const gold$ = n => `<b style="color:#ffd36a">${n}</b>`;
  const pick = L => L[Math.floor(Math.random() * L.length)];
  const sheet = draw => { const one = document.createElement('canvas'); one.width = one.height = 64; const x = one.getContext('2d'); draw(x); const S = document.createElement('canvas'); S.width = 64 * 9; S.height = 64 * 12; const s = S.getContext('2d'); for (let r = 0; r < 12; r++) for (let f = 0; f < 9; f++) s.drawImage(one, f * 64, r * 64); return S; };
  const R = (x, c, a, b, w, h) => { x.fillStyle = c; x.fillRect(a, b, w, h); };
  const blank = (() => { let S; return () => S || (S = sheet(() => { })); })();
  const MK = { woods_n: 'fc_north', woods_e: 'fc_east', woods_s: 'fc_south', woods_w: 'fc_west', woods_n2: 'fc_north2', woods_e2: 'fc_east2', woods_s2: 'fc_south2', woods_w2: 'fc_west2', vale: 'fc_vale' };
  const DEEP = ['woods_n2', 'woods_e2', 'woods_s2', 'woods_w2'];
  const vistas = () => DEEP.filter(z => F()['vista_' + z]).length;
  const cam = () => [Math.round(World.cam.x), Math.round(World.cam.y)];

  /* ---------- the fifth road ---------- */
  const archImg = (() => { let S; return () => S || (S = sheet(x => { R(x, 'rgba(0,0,0,.3)', 10, 58, 44, 4); R(x, '#6a7a7a', 12, 14, 8, 46); R(x, '#6a7a7a', 44, 14, 8, 46); R(x, '#7a8a8a', 12, 8, 40, 8); R(x, '#46ff95', 22, 16, 20, 42); R(x, '#a8ffd0', 28, 20, 8, 36); R(x, '#2a3a3a', 30, 10, 4, 4); })); })();
  async function fifthRoad() {
    if (!F().valeOpen) { F().valeOpen = 1; await narr('Four views from four edges of the world — and now, between the Crossroads stones, the air bends. A doorway of green light stands where there was nothing.'); save(); }
    const c = await ask(null, null, 'The fifth road. It hums with the same note as the waystones.', ['Step through', 'Not yet']);
    if (c !== 0) return; const e = FCL.fc_vale.exits[0]; banner('THE VALE OF ECHOES', 'a place the maps forgot', 2600); await World.go('vale', e.x, e.y - 2, 'up');
  }
  async function warden() {
    if (!ENEMY.echo_warden) { const B = ENEMY.m_wartotaur || ENEMY.m_minotaur; ENEMY.echo_warden = Object.assign({}, B, { name: 'The Echo Warden', img: B.img || (ENEMY.m_wartotaur ? 'm_wartotaur' : 'm_minotaur'), boss: 1, hp: Math.round(B.hp * 3.6), atk: Math.round(B.atk * 1.3), def: (B.def || 0) + 4, brk: Math.round((B.brk || 80) * 2), xp: Math.round((B.xp || 60) * 6), gold: 300, size: 2.2, trait: 'Keeper of the Hall of First Light' }); }
    await narr('Something steps out of the mural — a Drag warden made of green light and old stone, sword raised. "THE HALL IS CLOSED TO THOSE WHO FORGOT. DID YOU FORGET, CHILD?"');
    const r = await Battle.start({ enemies: ['echo_warden'], boss: true, noFlee: true, bd: 'fc_west', music: 'boss', intro: 'THE ECHO WARDEN' });
    if (r === 'lose') { await Story.defeat(); return; } if (r !== 'win') return;
    F().warden = 1; World.ents = World.ents.filter(e => e.id !== 'warden');
    const a = rare(), b = rare(), c = rare(); G.S.gold += 800; UI.hud(); sfx('level');
    await narr(`The Warden lowers its sword and fades into the mural, smiling. "YOU REMEMBERED." Where it stood: 800 gold${a ? `, a ${gold$(a)}` : ''}${b ? `, a ${gold$(b)}` : ''}${c ? `, a ${gold$(c)}` : ''}.`); save();
  }

  /* ---------- the four-fragment hunt ---------- */
  const CLUE = { woods_n2: 'a scrap of map: the top corner of a valley, and a tree drawn bigger than any tree should be.', woods_e2: 'a scrap of map: a river running north to south, and a row of tiny standing stones.', woods_s2: 'a scrap of map: a meadow, and a ring of singing stones in the south-west.', woods_w2: 'a scrap of map: the bottom-left corner, and a red X beside a little drawing of a stone.' };
  async function huntDig() {
    if (F().huntDone) return; F().huntDone = 1; World.ents = World.ents.filter(e => e.id !== 'hunt');
    const g = 1000, a = rare(), b = rare(); G.S.gold += g; UI.hud(); sfx('level');
    await narr(`You dig where the four scraps say. Under a flat stone: a Drag chest, sealed with green wax. Inside — ${g} gold${a ? `, a ${gold$(a)}` : ''}${b ? `, a ${gold$(b)}` : ''}, and a letter in a hand you somehow know: "If you are reading this, you found the way home. — M."`);
    toast('<b style="color:#46ff95">THE FOUR-FRAGMENT HUNT</b> — complete!', 3200); save();
  }

  /* ---------- herds ---------- */
  let herd = [];
  function spawnHerd(z) {
    herd = []; if (!MK[z] || Math.random() < .35) return; const M = World.map, p = World.player, kind = /_e|_s/.test(z) ? 'boar' : 'deer';
    let c = null; for (let i = 0; i < 200 && !c; i++) { const x = 4 + Math.floor(Math.random() * (M.w - 8)), y = 4 + Math.floor(Math.random() * (M.h - 8)); if (World.col[y][x] === 0 && Math.abs(x - p.x) + Math.abs(y - p.y) > 12) c = [x, y]; }
    if (!c) return; for (let i = 0; i < 3 + Math.floor(Math.random() * 3); i++) { const x = c[0] + (i % 3) - 1, y = c[1] + Math.floor(i / 3); if (World.col[y] && World.col[y][x] === 0) herd.push({ k: kind, x, y, px: x * 32 + 16, py: y * 32 + 26, next: 0, flip: false, fear: 0 }); }
  }
  function herdTick(c, t, now) {
    const p = World.player, [ox, oy] = cam();
    for (const a of herd) {
      const d = Math.abs(a.x - p.x) + Math.abs(a.y - p.y);
      if (now > a.next) {
        let opts = [[1, 0], [-1, 0], [0, 1], [0, -1]].map(([dx, dy]) => [a.x + dx, a.y + dy]).filter(([x, y]) => World.col[y] && World.col[y][x] === 0 && !herd.some(b => b !== a && b.x === x && b.y === y) && !(x === p.x && y === p.y));
        if (d <= 4) { opts.sort((u, v) => (Math.abs(v[0] - p.x) + Math.abs(v[1] - p.y)) - (Math.abs(u[0] - p.x) + Math.abs(u[1] - p.y))); a.fear = 1; }
        else if (Math.random() < .6) opts = []; else { a.fear = 0; opts = [pick(opts.length ? opts : [[a.x, a.y]])]; }
        if (opts.length && opts[0]) { a.flip = opts[0][0] < a.x; a.x = opts[0][0]; a.y = opts[0][1]; }
        a.next = now + (a.fear ? 230 : 900 + Math.random() * 1600);
      }
      a.px += (a.x * 32 + 16 - a.px) * (a.fear ? .3 : .08); a.py += (a.y * 32 + 26 - a.py) * (a.fear ? .3 : .08);
      const x = Math.round(a.px - ox), y = Math.round(a.py - oy), f = a.flip ? -1 : 1, run = Math.sin(t / (a.fear ? 60 : 160)) > 0 ? 1 : 0;
      const d2 = (dx, dy, w, h, col) => { c.fillStyle = col; c.fillRect(a.flip ? x - dx - w : x + dx, y + dy, w, h); };
      c.fillStyle = 'rgba(0,0,0,.2)'; c.fillRect(x - 9, y - 2, 18, 3);
      if (a.k === 'deer') { d2(-8, -14, 14, 7, '#8a5a32'); d2(4, -20, 4, 8, '#8a5a32'); d2(6, -22, 4, 4, '#8a5a32'); d2(9, -21, 1, 1, '#000'); d2(-9, -13, 2, 3, '#f0e8d8'); d2(-7, -7, 2, 6 - run * 2, '#6a4224'); d2(-3, -7, 2, 6 - (1 - run) * 2, '#6a4224'); d2(1, -7, 2, 6 - run * 2, '#6a4224'); d2(4, -7, 2, 6 - (1 - run) * 2, '#6a4224'); d2(-6, -12, 10, 1, '#a87a4a'); }
      else { d2(-8, -11, 15, 8, '#4a3a2e'); d2(6, -10, 5, 6, '#4a3a2e'); d2(10, -7, 2, 2, '#e8dcc0'); d2(8, -9, 1, 1, '#000'); d2(-8, -12, 12, 2, '#6a5a4a'); d2(-6, -4, 2, 4 - run, '#3a2a1e'); d2(-2, -4, 2, 4 - (1 - run), '#3a2a1e'); d2(2, -4, 2, 4 - run, '#3a2a1e'); d2(5, -4, 2, 4 - (1 - run), '#3a2a1e'); }
    }
  }

  /* ---------- meadow races ---------- */
  let race = null;
  const flagImg = (() => { let S; return () => S || (S = sheet(x => { R(x, 'rgba(0,0,0,.3)', 26, 58, 12, 3); R(x, '#5a3a20', 30, 14, 3, 46); R(x, '#d83a2a', 33, 14, 18, 11); R(x, '#f0e0c0', 36, 17, 4, 4); R(x, '#f0e0c0', 44, 17, 4, 4); R(x, '#f0e0c0', 40, 21, 4, 4); })); })();
  const meadowOf = z => MK[z] && FCL[MK[z]].meadow && FCL[MK[z]].meadow[0];
  const ends = md => { const [x, y, rx] = md, l = [Math.round(x - rx + 1), Math.round(y)], r = [Math.round(x + rx - 1), Math.round(y)]; return [l, r]; };
  async function raceTalk(z) {
    const md = meadowOf(z); if (!md) return; const best = (S_().raceBest || {})[z];
    if (typeof Mounts === 'undefined' || !Mounts.cur()) { await narr(`A racing flag at the edge of an open meadow. Riders race to the far side and back here.${best ? ` Your best: ${(best / 1000).toFixed(1)}s.` : ''} (Come back on a mount.)`); return; }
    const c = await ask(null, null, `Race across the meadow to the far flag and back? ${best ? `Best: ${(best / 1000).toFixed(1)}s` : 'No record yet.'}`, ['Ready — go!', 'Not now']); if (c !== 0) return;
    const [l, r] = ends(md); race = { z, t0: performance.now(), turn: false, far: r, home: l }; toast('<b>GO!</b> Touch the far side of the meadow and ride back.', 2400);
  }
  function raceStep(e) {
    if (!race || G.S.map !== race.z) { race = null; return; }
    if (!race.turn && Math.abs(e.x - race.far[0]) <= 1 && Math.abs(e.y - race.far[1]) <= 2) { race.turn = true; sfx('blip'); toast('Turn! Back to the flag!', 1400); }
    else if (race.turn && Math.abs(e.x - race.home[0]) <= 1 && Math.abs(e.y - race.home[1]) <= 2) {
      const ms = performance.now() - race.t0, S = S_(); S.raceBest = S.raceBest || {}; const old = S.raceBest[race.z], rec = !old || ms < old; if (rec) S.raceBest[race.z] = ms;
      const first = !F()['race_' + race.z]; F()['race_' + race.z] = 1; const g = first ? 120 : rec ? 60 : 0; if (g) { G.S.gold += g; UI.hud(); }
      sfx('level'); toast(`<b>${(ms / 1000).toFixed(1)}s</b>${rec ? ' — NEW RECORD!' : ''}${g ? ` +${g} gold` : ''}`, 3000); race = null; save();
    }
  }

  /* ---------- night lords ---------- */
  const LORDS = { woods_n2: ['The Pale Stalker', 'm_ghoul'], woods_e2: ['The Ash Wyrm', 'm_drake'], woods_s2: ['The Marsh Count', 'm_vampire'], woods_w2: ['The Drowned Warlord', 'm_wartotaur'] };
  async function lordSpawn(z) {
    const L = LORDS[z]; if (!L || night() < .6 || F()['lord_' + z + '_' + day()] || !ENEMY[L[1]]) return;
    const key = 'nlord_' + z; if (!ENEMY[key]) { const B = ENEMY[L[1]]; ENEMY[key] = Object.assign({}, B, { name: L[0], img: B.img || L[1], boss: 1, hp: Math.round(B.hp * 3), atk: Math.round(B.atk * 1.3), def: (B.def || 0) + 3, xp: Math.round((B.xp || 30) * 5), gold: Math.round((B.gold || 20) * 4), size: 1.9, trait: 'Night lord — only walks after dark' }); }
    const at = W4().spot(z, 1601); if (!at) return; let img; try { img = await npcImg(ENEMY[key].img); } catch (e) { return; }
    World.ents.push(new Ent({ id: 'nlord', x: at[0], y: at[1], dir: 'down', img, size: 1.9, name: L[0], ai: 'turn', talk: () => lordFight(z, key) }));
    World.lights.push({ x: at[0] * 32 + 16, y: at[1] * 32, r: 80, c: '200,60,90' });
    toast(`<b style="color:#ff6a8a">${L[0].toUpperCase()}</b> walks these woods tonight.`, 3000);
  }
  async function lordFight(z, key) {
    const r = await Battle.start({ enemies: [key], boss: true, noFlee: true, bd: SCENES[z].bd, music: 'boss', intro: 'NIGHT LORD — ' + ENEMY[key].name.toUpperCase() });
    if (r === 'lose') { await Story.defeat(); return; } if (r !== 'win') return;
    F()['lord_' + z + '_' + day()] = 1; S_().lordKills = (S_().lordKills || 0) + 1; World.ents = World.ents.filter(e => e.id !== 'nlord');
    const a = rare(), b = rare(); G.S.gold += 350; UI.hud(); sfx('level'); await narr(`${ENEMY[key].name} crumbles into shadow as the moon goes behind a cloud. 350 gold${a ? `, a ${gold$(a)}` : ''}${b ? `, a ${gold$(b)}` : ''}.`); save();
  }

  /* ---------- Ashford upgrades ---------- */
  const UPS = [
    ['lamps', 'Street lamps', 300, 'Lamplighters go round every dusk now. Ashford glows at night.'],
    ['fountain', 'Restore the fountain', 200, 'Clean water, new stone, a lamp in the middle. People stop to talk there all day.'],
    ['market', 'Expand the market', 400, 'A second stall — two traders a week from now on.'],
    ['watch', 'A town watch post', 350, 'The watch knows your face. When the Inquisition sets up at the gate, the watch "accidentally" waves you through.'],
    ['bath', 'Build a bathhouse', 500, 'Hot water, cedar benches. A soak heals everything — the bath-keeper won\'t take your money.']];
  const ups = () => (S_().townUp = S_().townUp || {});
  async function fundMenu() {
    const U = ups(), open = UPS.filter(u => !U[u[0]]);
    const opts = [...open.map(u => `${u[1]} — ${u[2]}g`), ...(U.bath ? ['Visit the bathhouse'] : []), 'Back'];
    const c = await ask(null, null, `Fund Ashford (${Object.keys(U).length}/${UPS.length} done). Every coin goes on the board for everyone to see.`, opts); const pickd = opts[c];
    if (pickd === 'Visit the bathhouse') { Story.heal(); sfx('heal'); await narr('You soak until your fingers wrinkle. Every ache in your body lets go.'); return; }
    const u = open.find(u => pickd && pickd.startsWith(u[1])); if (!u) return;
    if (!(await W4().pay(u[2], u[1]))) return; U[u[0]] = 1; await narr(u[3]); toast(`<b>ASHFORD</b> — ${u[1]} funded!`, 2400); save();
    if (G.S.map === 'ashford') await World.go('ashford', World.player.x, World.player.y, World.player.dir);
  }
  async function moodsBoard() {
    const L = Object.keys(typeof DUNGEONS !== 'undefined' ? DUNGEONS : {}).filter(id => G.maps[id]).slice(0, 10).map(id => `${DUNGEONS[id].title}: ${window.WorldPlus9 ? WorldPlus9.modOf(id) : '—'}`);
    await narr('Dungeon reports this week — ' + L.join(' · '));
  }

  /* ---------- wiring ---------- */
  const _load = World.load.bind(World);
  World.load = async function (name, ...a) {
    race = null; herd = [];
    const r = await _load(name, ...a);
    try {
      if (name === 'woods' && vistas() >= 4) { const s = W4().spot('woods', 1037); if (s) { World.col[s[1]][s[0]] = 1; World.ents.push(new Ent({ id: 'fifth', x: s[0], y: s[1], dir: 'down', img: archImg(), size: 1.5, pickup: 1, name: 'The fifth road', talk: fifthRoad })); World.lights.push({ x: s[0] * 32 + 16, y: s[1] * 32 - 10, r: 100, c: '70,255,150' }); } }
      if (name === 'vale') {
        const A = FCL.fc_vale.arena; if (A && !F().warden) { let img; try { img = await npcImg(ENEMY.m_wartotaur ? 'm_wartotaur' : 'm_minotaur'); } catch (e) { } if (img) World.ents.push(new Ent({ id: 'warden', x: A[0], y: A[1], dir: 'down', img, size: 2.2, name: 'The Echo Warden', ai: 'turn', talk: warden })); }
        const H = FCL.fc_vale.hunt; if (H && vistas() >= 4 && !F().huntDone) World.ents.push(new Ent({ id: 'hunt', x: H[0], y: H[1], dir: 'down', img: blank(), pickup: 1, name: '', talk: huntDig }));
        F().valeSeen = 1;
      }
      if (MK[name]) { spawnHerd(name); const md = meadowOf(name); if (md) { const [l] = ends(md), p = [l[0] - 1, l[1] - 1]; if (World.col[p[1]] && World.col[p[1]][p[0]] === 0) { World.col[p[1]][p[0]] = 1; World.ents.push(new Ent({ id: 'raceflag', x: p[0], y: p[1], dir: 'down', img: flagImg(), pickup: 1, name: 'Racing flag', talk: () => raceTalk(name) })); } } }
      if (DEEP.includes(name)) await lordSpawn(name);
      if (name === 'ashford') { const U = ups();
        if (U.lamps && night() > .3) { let n = 0; for (let y = 6; y < World.map.h - 4 && n < 36; y += 5) for (let x = 6; x < World.map.w - 4 && n < 36; x += 6) if (World.col[y][x] === 0) { World.lights.push({ x: x * 32 + 16, y: y * 32, r: 70, c: '255,200,120' }); n++; } }
        if (U.fountain) World.lights.push({ x: 30 * 32 + 16, y: 21 * 32, r: 110, c: '160,220,255' });
      }
    } catch (e) { console.warn('worldplus10', e); }
    return r;
  };
  const _step = World.onStep.bind(World);
  World.onStep = function (e) {
    const r = _step(e);
    try { if (e && e.isPlayer) { if (race) raceStep(e);
      if (G.S.map === 'vale' && vistas() >= 4 && !F().huntDone && !World.busy) { const H = FCL.fc_vale.hunt; if (H && e.x === H[0] && e.y === H[1]) Story.run(huntDig); } } } catch (x) { }
    return r;
  };
  if (typeof MiniMap !== 'undefined') {
    const _draw = MiniMap.draw.bind(MiniMap);
    MiniMap.draw = function (c) {
      _draw(c);
      try { if (!this.on() || !this.box || G.S.map !== 'vale' || F().huntDone || vistas() < 4) return; const H = FCL.fc_vale.hunt, [X, Y, w] = this.box, s = w / World.map.w, px = X + H[0] * s + s / 2, py = Y + H[1] * s + s / 2;
        c.strokeStyle = '#ff3a3a'; c.lineWidth = 1.6; c.beginPath(); c.moveTo(px - 3, py - 3); c.lineTo(px + 3, py + 3); c.moveTo(px + 3, py - 3); c.lineTo(px - 3, py + 3); c.stroke(); } catch (e) { }
    };
  }
  const _render = World.render.bind(World);
  World.render = function (c, t) {
    _render(c, t);
    try { if (G.mode === 'world' && World.player && !World.loading && herd.length) herdTick(c, t, performance.now());
      if (race && G.mode === 'world') { const s = ((performance.now() - race.t0) / 1000).toFixed(1); c.fillStyle = 'rgba(0,0,0,.55)'; const VW = (G.view && G.view.w) || c.canvas.width; c.fillRect(VW / 2 - 34, 60, 68, 20); c.fillStyle = '#ffe7a8'; c.font = 'bold 13px system-ui'; c.textAlign = 'center'; c.fillText(s + 's' + (race.turn ? ' ↩' : ' →'), VW / 2, 75); c.textAlign = 'left'; } } catch (e) { }
  };
  window.WorldPlus10 = { CLUE, vistas, fundMenu, moodsBoard, ups, get herd() { return herd; }, get race() { return race; }, ends, meadowOf };
})();
