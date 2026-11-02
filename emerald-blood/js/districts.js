'use strict';
/* ASHFORD HOLLOW IN FIVE DISTRICTS — built from the user's town art. Walk off an edge to move between them.
     ashford    — Market Square (fountain, stalls, general store, blacksmith)            ← the hub, keeps the old scene key
     a_terrace  — Guild Terrace (Adventurers' Guild, training yard, forest road → East Woods)
     a_river    — Riverside (the Crooked Kettle, the bridge → the south roads)
     a_chapel   — Chapel Hill (Maren's clinic, Pip's house, the garden, the chapel, the North Gate → the Old Mill)
     a_lower    — Lower Ashford (the Midnight Exchange, the slums, the sewers)
   The rest of the game still talks about "ashford" with coordinates on the old single map. This file translates:
   anything placed on the old map (people, doors, signs, exits, dungeon mouths) lands in the matching district. */
const ASH2 = {
  raw: 0, ready: 0,
  D: { ashford: 'ash_market', a_terrace: 'ash_terrace', a_river: 'ash_river', a_chapel: 'ash_chapel', a_lower: 'ash_lower' },
  NAME: { ashford: ['Ashford Hollow', 'The Market Square'], a_terrace: ['Ashford Hollow', 'The Guild Terrace'], a_river: ['Ashford Hollow', 'Riverside'],
    a_chapel: ['Ashford Hollow', 'Chapel Hill'], a_lower: ['Ashford Hollow', 'Lower Ashford'] },
  // old-map spot (the town art the game used before) → district spot
  ANCHOR: [
    [[11, 6], 'a_chapel', [8, 18]], [[20, 6], 'a_chapel', [3, 18]], [[16, 3], 'a_chapel', [14, 13]], [[30, 3], 'a_chapel', [21, 10]], [[30, 0], 'a_chapel', [21, 6]],
    [[10, 37], 'a_chapel', [36, 16]],
    [[38, 10], 'a_river', [22, 13]], [[20, 30], 'a_river', [11, 13]], [[30, 41], 'a_river', [9, 22]], [[8, 22], 'a_river', [3, 14]], [[20, 18], 'a_river', [12, 8]],
    [[10, 18], 'a_terrace', [22, 13]], [[53, 11], 'a_terrace', [24, 13]], [[56, 20], 'a_terrace', [38, 18]], [[55, 3], 'a_terrace', [39, 2]], [[50, 6], 'a_terrace', [26, 6]],
    [[48, 16], 'ashford', [9, 17]], [[30, 22], 'ashford', [20, 15]], [[25, 18], 'ashford', [12, 18]], [[36, 21], 'ashford', [30, 18]], [[30, 30], 'ashford', [21, 19]],
    [[33, 26], 'ashford', [24, 18]], [[30, 12], 'ashford', [21, 4]], [[44, 19], 'ashford', [38, 18]],
    [[42, 29], 'a_lower', [6, 18]], [[7, 36], 'a_lower', [3, 18]], [[50, 33], 'a_lower', [36, 4]], [[36, 41], 'a_lower', [25, 18]], [[39, 29], 'a_lower', [11, 3]], [[45, 36], 'a_lower', [30, 18]]
  ],
  // doors on the old map (art coordinates) → the doors in the district art
  DOOR: { '11,5': ['a_chapel', '8,16'], '20,5': ['a_chapel', '1,16'], '48,16': ['ashford', '9,15'], '38,9': ['a_river', '22,11'], '39,9': ['a_river', '23,11'],
    '10,17': ['a_terrace', '22,11'], '11,17': ['a_terrace', '23,11'], '7,35': ['a_lower', '2,17'], '42,28': ['a_lower', '9,17'], '50,32': ['a_lower', '36,2'],
    '36,40': ['a_lower', '39,2'], '39,28': ['ashford', '14,2'] },
  // where the story's named people stand now
  PLACE: { voss: ['a_chapel', 20, 9], guard: ['a_chapel', 22, 9], maren: ['a_chapel', 9, 18], pip: ['a_chapel', 13, 18], pipmom: ['a_chapel', 4, 18], chapelDoor: ['a_chapel', 34, 13],
    kess: ['a_terrace', 26, 13], tobb: ['ashford', 17, 9], hoshi: ['ashford', 12, 18], cassel: ['ashford', 24, 18], crier: ['ashford', 30, 18], larkA: ['ashford', 21, 17],
    bram: ['a_river', 26, 13], patrol: ['ashford', 30, 4] },
  CROWD: { ashford: [[14, 3, 28, 4], [15, 18, 27, 19], [17, 14, 24, 17], [29, 15, 40, 17]], a_terrace: [[18, 12, 30, 15], [14, 3, 16, 17], [2, 18, 16, 19]],
    a_river: [[7, 3, 16, 14], [17, 12, 22, 13]], a_chapel: [[3, 17, 28, 18], [13, 8, 14, 15]], a_lower: [[0, 17, 12, 19], [19, 17, 42, 19], [32, 3, 42, 4], [10, 1, 12, 4]] },
  toD(ax, ay) {
    let best = null, bd = 1e9;
    for (const a of this.ANCHOR) { const d = (ax - a[0][0]) ** 2 + (ay - a[0][1]) ** 2; if (d < bd) { bd = d; best = a; } }
    return [best[1], Math.round(best[2][0] + (ax - best[0][0]) * .3), Math.round(best[2][1] + (ay - best[0][1]) * .3)];
  },
  fromOld(ox, oy) { const [ax, ay] = typeof ASH !== 'undefined' ? ASH.move(ox, oy, true) : [ox, oy]; return this.toD(ax, ay); },
  col(d) { return G.maps[this.D[d]].col; },
  reach(d) {
    this.R = this.R || {}; if (this.R[d]) return this.R[d];
    const c = this.col(d), H = c.length, W = c[0].length, R = new Set(); let start = null;
    const seeds = { ashford: [20, 16], a_terrace: [20, 13], a_river: [10, 8], a_chapel: [21, 17], a_lower: [14, 8] };
    start = seeds[d]; const q = [start]; R.add(start + '');
    while (q.length) { const [x, y] = q.shift(); for (const [dx, dy] of [[1, 0], [-1, 0], [0, 1], [0, -1]]) { const X = x + dx, Y = y + dy, k = X + ',' + Y; if (Y >= 0 && Y < H && X >= 0 && X < W && c[Y][X] === '0' && !R.has(k)) { R.add(k); q.push([X, Y]); } } }
    return (this.R[d] = R);
  },
  snap(d, x, y) {
    const c = this.col(d), W = c[0].length, H = c.length; x = Math.max(0, Math.min(W - 1, x)); y = Math.max(0, Math.min(H - 1, y));
    const R = this.reach(d); if (R.has(x + ',' + y)) return [x, y];
    for (let r = 1; r < 30; r++) for (let dy = -r; dy <= r; dy++) for (let dx = -r; dx <= r; dx++) { if (Math.max(Math.abs(dx), Math.abs(dy)) !== r) continue; if (R.has((x + dx) + ',' + (y + dy))) return [x + dx, y + dy]; }
    return [x, y];
  },
  isD(name) { return name in this.D; },

  /* build the district scenes from the old Ashford scene (once every script has loaded) */
  init() {
    if (this.ready) return; this.ready = 1;
    const S = SCENES.ashford; if (typeof ASH !== 'undefined') ASH.init();
    const SRC = { npcs: S.npcs.bind(S), tiles: S.tiles || {}, exits: S.exits || [], crowd: S.crowd, onEnter: S.onEnter };
    this.SRC = SRC;
    const base = { music: S.music, bd: S.bd, safe: S.safe };
    for (const d of Object.keys(this.D)) {
      const sc = d === 'ashford' ? S : (SCENES[d] = Object.assign({}, base));
      sc.map = this.D[d]; sc.title = this.NAME[d][0]; sc.subtitle = this.NAME[d][1]; sc.tiles = {}; sc.exits = [];
      sc.npcs = () => this.npcsFor(d);
      sc.crowd = SRC.crowd ? Object.assign({}, SRC.crowd, { count: d === 'ashford' ? 9 : d === 'a_lower' ? 7 : 4, areas: this.CROWD[d] }) : null;
      if (d !== 'ashford') sc.onEnter = null;
    }
    // signs, doors and other tiles
    for (const [k, fn] of Object.entries(SRC.tiles)) {
      let d, key;
      if (this.DOOR[k]) [d, key] = this.DOOR[k];
      else { const [ax, ay] = k.split(',').map(Number), r = this.toD(ax, ay); d = r[0]; key = r[1] + ',' + r[2]; }
      if (!SCENES[d].tiles[key]) SCENES[d].tiles[key] = fn;
    }
    // the old exits: north road → the North Gate, east road → the forest road, south road → over the bridge
    for (const e of SRC.exits) {
      let d, at;
      if (e.y === 0 || (e.y2 ?? e.y) <= 1) { d = 'a_chapel'; at = { x: 20, x2: 22, y: 4 }; }
      else if (e.x >= 58) { d = 'a_terrace'; at = { x: 38, x2: 40, y: 23, y2: 23 }; }
      else if (e.y >= 40) { d = 'a_river'; at = { x: 7, x2: 12, y: 23, y2: 23 };
        SCENES.a_river.exits.push(Object.assign({}, e, { x: 0, x2: 0, y: 13, y2: 15, label: 'River Road — Millbrook', dir: 'left' })); }
      else { const r = this.toD(e.x, e.y); d = r[0]; at = { x: r[1], y: r[2] }; }
      SCENES[d].exits.push(Object.assign({}, e, at, { x2: at.x2 ?? at.x, y2: at.y2 ?? at.y }));
    }
    SCENES.a_terrace.exits.push({ x: 38, x2: 40, y: 0, to: 'woods', tx: 2, ty: 17, dir: 'right' });
    // the walks between districts
    const L = (from, spec) => SCENES[from].exits.push(Object.assign({ raw: 1 }, spec));
    // every arrival is two steps inside the edge, facing away from it, right by the way back
    L('ashford', { x: 18, x2: 23, y: 0, to: 'a_chapel', tx: 21, ty: 21, dir: 'up' });
    L('a_chapel', { x: 19, x2: 23, y: 23, to: 'ashford', tx: 20, ty: 2, dir: 'down' });
    L('ashford', { x: 18, x2: 23, y: 23, to: 'a_lower', tx: 13, ty: 2, dir: 'down' });
    L('a_lower', { x: 10, x2: 16, y: 0, to: 'ashford', tx: 20, ty: 21, dir: 'up' });
    L('ashford', { x: 42, y: 3, y2: 5, to: 'a_terrace', tx: 2, ty: 4, dir: 'right' });
    L('ashford', { x: 42, y: 18, y2: 19, to: 'a_terrace', tx: 2, ty: 18, dir: 'right' });
    L('a_terrace', { x: 0, y: 3, y2: 5, to: 'ashford', tx: 40, ty: 4, dir: 'left' });
    L('a_terrace', { x: 0, y: 18, y2: 19, to: 'ashford', tx: 40, ty: 18, dir: 'left' });
    L('ashford', { x: 0, y: 3, y2: 5, to: 'a_river', tx: 33, ty: 13, dir: 'left' });
    L('ashford', { x: 0, y: 18, y2: 19, to: 'a_river', tx: 33, ty: 13, dir: 'left' });
    L('a_river', { x: 35, y: 13, y2: 14, to: 'ashford', tx: 2, ty: 18, dir: 'right' });
    L('a_terrace', { x: 18, x2: 23, y: 23, to: 'a_lower', tx: 39, ty: 3, dir: 'left' });
    L('a_lower', { x: 42, y: 3, y2: 4, to: 'a_terrace', tx: 20, ty: 21, dir: 'up' });
    // the new places
    const T = (d, keys, fn) => keys.forEach(k => { SCENES[d].tiles[k] = fn; });
    T('a_lower', ['23,10', '24,10', '25,10'], async () => {
      await narr('THE MIDNIGHT EXCHANGE. Black stone, gold trim, a brass clock that is never wrong. Two lanterns that never go out.');
      await narr('A doorman in a midnight-blue coat looks you over — your hood, your boots, your purse — and smiles politely. "Members and guests of members, friend. House Meridian thanks you for your interest."');
      if (typeof toast === 'function') toast('The Midnight Exchange — the intelligence house of House Meridian. (Opens later in the story.)', 3600);
    });
    T('a_lower', ['21,20', '22,20', '23,20'], async () => narr('The sewer grate. Rusted bars, a green glow far down the tunnel, and a smell that has its own weather. The lock is new.'));
    T('ashford', ['32,13', '33,13'], async () => narr('The blacksmith\'s door. Inside, a hammer rings on an anvil, slow and even, like a heartbeat.'));
    T('ashford', ['20,13', '21,13'], async () => narr('The fountain. Coins at the bottom — and one green pebble somebody was brave enough to throw in.'));
    T('a_chapel', ['34,12', '35,12'], async () => narr('The chapel. White Inquisition banners hang by the door. Someone has scratched a tiny dragon into the step, then tried to rub it out.'));
    T('a_chapel', ['29,12', '29,13', '29,14'], async () => narr('Maren\'s greenhouse. Moonpetal, feverfew, and one plant you don\'t know that turns its leaves toward you as you pass.'));
    // dungeon mouths and travel spots
    if (typeof DUNGEONS !== 'undefined') for (const d of Object.values(DUNGEONS)) if (d.from && d.from.map === 'ashford') {
      if (d.id === 'd_crypt' || d.from.at[0] < 20) { d.from = Object.assign({}, d.from, { map: 'a_chapel', at: [36, 13], back: [35, 13] }); }
      else { d.from = Object.assign({}, d.from, { map: 'a_terrace', at: [39, 1], back: [39, 2] }); }
    }
  },
  npcsFor(d) {
    const out = [];
    for (const n of this.SRC.npcs()) {
      let nd, x, y; const P = this.PLACE[n.id];
      if (P) [nd, x, y] = P; else [nd, x, y] = this.fromOld(n.x, n.y);
      if (nd !== d) continue;
      [x, y] = this.snap(d, x, y);
      const o = Object.assign({}, n, { x, y });
      if (o.route) { delete o.route; if (o.ai === 'patrol' || !o.ai) o.ai = 'turn'; }
      if (o.area) o.area = [Math.max(0, x - 3), Math.max(0, y - 1), x + 3, y + 1];
      out.push(o);
    }
    return out;
  }
};
(function () {
  if (typeof World === 'undefined' || !SCENES.ashford) return;
  // town.js steps aside: districts do the moving now
  window.ASH2_ON = 1;
  const _load = World.load.bind(World);
  World.load = async function (name, x, y, dir) {
    ASH2.init();
    if (ASH2.isD(name)) {
      const resume = name === G.S.map && x === G.S.x && y === G.S.y && G.S.ash2;
      if (!ASH2.raw && !resume && name === 'ashford') { const r = ASH2.toD(x, y); name = r[0]; x = r[1]; y = r[2]; }
      ASH2.raw = 0;
      [x, y] = ASH2.snap(name, x, y); G.S.ash2 = 1;
      const r = await _load(name, x, y, dir);
      // anything still standing somewhere it can't (quest people, late spawns) steps onto open ground
      for (const e of this.ents) { if (e.isPlayer || e.follower || /^(cave_|chest_)/.test(String(e.id))) continue;
        const [sx, sy] = ASH2.snap(name, e.x, e.y); if (sx !== e.x || sy !== e.y) { e.x = sx; e.y = sy; e.px = sx * TILE + 16; e.py = sy * TILE + 26; } }
      let k = 0;
      for (const e of this.ents) if (/^folk_/.test(String(e.id))) {
        if (k++ % 3) { e.ai = 'turn'; e.turns = ['down', 'left', 'right']; e.wait = rnd(800, 3000); }
        else e.area = [Math.max(0, e.x - 2), e.y, e.x + 2, e.y];   // the strollers keep to their own bit of street
      }
      this.snapCam(); this.grace = { x: this.player.x, y: this.player.y, map: name };
      return r;
    }
    ASH2.raw = 0;
    return _load(name, x, y, dir);
  };
  /* no bouncing: right after you arrive, the way you came is closed until you lift your thumb off the stick
     (or walk a few steps) — so a held direction can't throw you straight back where you came from.
     The same after saying "Stay in Ashford" at a road sign. */
  const _ex = World.exitAt.bind(World);
  World.exitAt = function (x, y) {
    const g = this.grace, p = this.player;
    if (g && p) {
      if (!Input.dir() || Math.abs(p.x - g.x) + Math.abs(p.y - g.y) >= 3 || g.map !== G.S.map) this.grace = null;
      else return null;
    }
    return _ex(x, y);
  };
  const _up = World.update.bind(World);
  World.update = function (dt) { if (this.grace && !Input.dir()) this.grace = null; return _up(dt); };
  const arm = () => { const p = World.player; if (p && ASH2.isD(G.S.map)) World.grace = { x: p.x, y: p.y, map: G.S.map }; };
  const _ue = World.useExit.bind(World);
  World.useExit = async function (ex) { if (ex && (ex.raw || ex.to === '__ret')) ASH2.raw = 1; const r = await _ue(ex); arm(); return r; };
  const _go = World.go.bind(World);
  World.go = function (to, x, y, d) { if (ASH2.isD(to) && to !== 'ashford') ASH2.raw = 1; return _go(to, x, y, d); };
  // leaving a building comes back to the district you were in, at the door
  if (typeof enter === 'function') {
    const _en = enter;
    enter = async function (key, rx, ry) { if (ASH2.isD(G.S.map) && World.player) { rx = World.player.x; ry = World.player.y; } return _en(key, rx, ry); };
  }
  // people added later by the story at old-map spots land in the right district (or wait there)
  const _add = World.addNpc.bind(World);
  World.addNpc = async function (o) {
    if (G.S && ASH2.isD(G.S.map) && o && o.x != null) { const P = ASH2.PLACE[o.id]; let [d, x, y] = P || ASH2.fromOld(o.x, o.y); [x, y] = ASH2.snap(G.S.map, d === G.S.map ? x : o.x, d === G.S.map ? y : o.y); o = Object.assign({}, o, { x, y }); }
    return _add(o);
  };
  // the world map and the town lists treat every district as Ashford
  if (typeof Travel !== 'undefined' && Travel.canFrom) { const _c = Travel.canFrom.bind(Travel); Travel.canFrom = function () { const m = G.S.map; if (ASH2.isD(m) && m !== 'ashford') { G.S.map = 'ashford'; try { return _c(); } finally { G.S.map = m; } } return _c(); }; }
})();

/* signposts: every way out of a district is labelled where you walk off, so you always know where it leads */
(function () {
  const NM = { ashford: 'Market Square', a_terrace: 'Guild Terrace', a_river: 'Riverside', a_chapel: 'Chapel Hill', a_lower: 'Lower Ashford', woods: 'East Woods', mill: 'North Road — Old Mill', millbrook: 'Millbrook', kettlebrook: 'Kettlebrook' };
  const _r = World.render.bind(World);
  World.render = function (c, t) {
    _r(c, t);
    try {
      if (!G.S || !ASH2.isD(G.S.map) || this.loading || G.mode !== 'world') return;
      const cx = Math.round(this.cam.x), cy = Math.round(this.cam.y), seen = new Set();
      c.save(); c.font = '800 9px Nunito, system-ui'; c.textAlign = 'center'; c.textBaseline = 'middle';
      for (const e of this.scene.exits || []) {
        if (e.when && !e.when()) continue;
        let nm = e.label || NM[e.to] || (e.y === 4 && G.S.map === 'a_chapel' ? NM.mill : e.check ? 'South Roads — Millbrook · Kettlebrook' : null); if (!nm) continue;
        const x0 = e.x, x1 = e.x2 ?? e.x, y0 = e.y, y1 = e.y2 ?? e.y, mx = (x0 + x1 + 1) / 2 * TILE, my = (y0 + y1 + 1) / 2 * TILE;
        const W = this.map.w * TILE, H = this.map.h * TILE;
        const ar = y1 <= 0 || (G.S.map === 'a_chapel' && y0 === 4) ? '↑' : y0 >= this.map.h - 1 ? '↓' : x0 <= 0 ? '←' : x1 >= this.map.w - 1 || e.to === 'ashford' && G.S.map === 'a_river' ? '→' : '•';
        const key = nm + ar; if (seen.has(key)) continue; seen.add(key);
        const lx = Math.max(60, Math.min(W - 60, mx)) - cx, ly = Math.max(16, Math.min(H - 16, my + (ar === '↑' ? 14 : ar === '↓' ? -14 : 0))) - cy;
        const txt = ar === '→' ? nm + ' →' : ar === '←' ? '← ' + nm : ar + ' ' + nm, w = c.measureText(txt).width + 12;
        c.fillStyle = 'rgba(10,18,14,.72)'; c.beginPath(); c.roundRect ? c.roundRect(lx - w / 2, ly - 8, w, 16, 7) : c.rect(lx - w / 2, ly - 8, w, 16); c.fill();
        c.strokeStyle = 'rgba(255,220,140,.6)'; c.lineWidth = 1; c.stroke();
        c.fillStyle = '#ffe7a8'; c.fillText(txt, lx, ly + .5);
      }
      c.restore();
    } catch (e) { }
  };
})();
