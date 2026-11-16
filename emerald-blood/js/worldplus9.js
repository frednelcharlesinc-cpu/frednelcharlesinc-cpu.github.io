'use strict';
/* ================= WORLD+ 9 (Chat B — World & Maps) =================
   WORLD'S END — walk to the far dead end of each deep zone: a view out over the land you can't reach yet, and the
                 last hidden lore stone of that wood.
   DUNGEON WEEKS — every week each dungeon has a mood: GILDED (more gold), DARKNESS (smaller light), SWARMING (more
                 fights, more XP), or QUIET (fewer fights). Shown when you walk in.
   (Lines are B drafts — Chat A may rewrite.) */
(function () {
  const S_ = () => G.S, F = () => G.S.f;
  const week = () => Math.floor(((typeof Cal !== 'undefined' ? Cal.day() : 1) - 1) / 7);
  const rare = () => window.WorldPlus4 ? WorldPlus4.giveRare() : '';
  const gold$ = n => `<b style="color:#ffd36a">${n}</b>`;
  const DEEP = { woods_n2: 'fc_north2', woods_e2: 'fc_east2', woods_s2: 'fc_south2', woods_w2: 'fc_west2' };
  const VISTA = {
    woods_n2: ['The trees end. Below you the whole north falls away — the Mountain Pass climbing into cloud, and beyond it, so faint you might be imagining it, a light burning on a peak where no one should live.', 'Half-buried in the snow at your feet, a lore stone: WE CLIMBED TO HIDE. WE DID NOT KNOW WHAT ELSE LIVED UP HERE.'],
    woods_e2: ['The road crests a rise and the east opens up: burnt hills, a grey river, and on the horizon a column of dark cloud that never moves. The Gate site.', 'Someone has set a stone at the edge of the road, facing east: THEY CALL IT A GATE BECAUSE A WOUND SOUNDS WORSE.'],
    woods_s2: ['The marsh gives way to sand, and then to the sea — grey, enormous, breathing. Far out, a ship with black sails sits motionless, as if waiting.', 'A tide-worn stone, barnacled: THE SEA KEEPS WHAT THE LAND FORGETS. ASK IT ABOUT US.'],
    woods_w2: ['Across the flooded ford the land rises into soft green hills, dotted with ruined walls. Smoke rises from one chimney. Just one.', 'A carved stone by the water, in Drag script you can somehow read: HOME IS STILL HOME. COME BACK WHEN THE RIVER LETS YOU.']
  };
  function deadEnd(z) { const f = FCL[DEEP[z]]; const e = f && f.exits.find(e => e.msg); return e ? [e.x, e.y] : null; }
  async function vista(z) {
    F()['vista_' + z] = 1; const t0 = World.tint; World.tint = 'rgba(255,230,180,.12)'; banner("WORLD'S END", SCENES[z].subtitle, 2200); sfx('level');
    for (const l of VISTA[z]) await narr(l);
    World.tint = t0; const n = rare(); G.S.gold += 150; UI.hud(); await narr(`Tucked behind the stone: 150 gold${n ? ` and a ${gold$(n)}` : ''}, left by the last traveller who stood here.`);
    const c = Object.keys(VISTA).filter(k => F()['vista_' + k]).length; toast(`<b>WORLD'S END ${c}/4</b>`, 2400); save();
  }

  /* ---------- dungeon weeks ---------- */
  const MODS = [['GILDED', 'Gold glitters in every crack this week — enemies drop more.'], ['DARKNESS', 'The torches are out this week. Stay close to the light.'], ['SWARMING', 'The dungeon is crawling this week. More fights — more XP.'], ['QUIET', 'Strangely quiet this week. Fewer monsters about.']];
  const modOf = id => MODS[(week() + id.length * 3 + id.charCodeAt(id.length - 1)) % MODS.length][0];
  const isDun = id => typeof DUNGEONS !== 'undefined' && !!DUNGEONS[id];
  let shownFor = '';
  const _bs = Battle.start.bind(Battle);
  Battle.start = async function (cfg) {
    const id = G.S && G.S.map, r = await _bs(cfg);
    try { if (r === 'win' && isDun(id) && modOf(id) === 'GILDED' && !(cfg && cfg.boss)) { const g = 20 + Math.floor(Math.random() * 30); G.S.gold += g; UI.hud(); toast(`<b style="color:#ffd36a">GILDED</b> +${g} gold`, 1600); } } catch (e) { }
    return r;
  };
  const _load = World.load.bind(World);
  World.load = async function (name, ...a) {
    const r = await _load(name, ...a);
    try {
      if (isDun(name)) { const m = modOf(name), sc = SCENES[name];
        if (sc) { sc.__er0 = sc.__er0 !== undefined ? sc.__er0 : (sc.encRate || 0); if (sc.__er0) sc.encRate = sc.__er0 * (m === 'SWARMING' ? 1.6 : m === 'QUIET' ? .45 : 1); }
        if (m === 'DARKNESS') { World.tint = 'rgba(0,0,8,.55)'; (World.lights || []).forEach(l => { l.r = Math.round(l.r * .7); }); }
        if (shownFor !== name + week()) { shownFor = name + week(); toast(`<b>THIS WEEK: ${m}</b> — ${MODS.find(x => x[0] === m)[1]}`, 3200); } }
    } catch (e) { console.warn('worldplus9', e); }
    return r;
  };
  const _step = World.onStep.bind(World);
  World.onStep = function (e) {
    const r = _step(e);
    try { if (e && e.isPlayer && DEEP[G.S.map] && !F()['vista_' + G.S.map] && !World.busy) { const d = deadEnd(G.S.map); if (d && Math.abs(d[0] - e.x) + Math.abs(d[1] - e.y) <= 3) Story.run(() => vista(G.S.map)); } } catch (x) { }
    return r;
  };
  window.WorldPlus9 = { modOf, deadEnd };
})();
