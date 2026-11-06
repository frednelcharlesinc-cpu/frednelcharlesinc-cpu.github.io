'use strict';
/* Ashford Hollow, rebuilt on your town art (cherry blossoms, fountain plaza, river, cliffs, the Guild hall on the west bank).
   The old layout's coordinates live on all over the story code, so this file moves everything once, here:
   doors and signs to the new buildings, every NPC to the matching part of the new town, exits, dungeon mouths. */
const ASH = {
  // old spot -> new spot (each old position moves with its nearest landmark, then steps onto open ground)
  // Ashford is painted on the story's own coordinates now (towns/ashford.py): nothing needs to move
  LM: [[[0, 0], [0, 0]]],
  DOORS: {},
  // walkable AND reachable from the town square — so nobody (and no chest) ends up stranded behind a cliff
  reach() {
    const c = G.maps.ashford.col; if (this.R && this.Rc === c) return this.R;
    const R = new Set(['30,26']), q = [[30, 26]];
    while (q.length) { const [x, y] = q.shift(); for (const [dx, dy] of [[1, 0], [-1, 0], [0, 1], [0, -1]]) { const X = x + dx, Y = y + dy, k = X + ',' + Y; if (Y >= 0 && Y < c.length && X >= 0 && X < c[0].length && c[Y][X] === '0' && !R.has(k)) { R.add(k); q.push([X, Y]); } } }
    this.Rc = c; return (this.R = R);
  },
  free(x, y) { return this.reach().has(x + ',' + y); },
  snap(x, y) {
    if (this.free(x, y)) return [x, y];
    for (let r = 1; r < 12; r++) for (let dy = -r; dy <= r; dy++) for (let dx = -r; dx <= r; dx++) {
      if (Math.max(Math.abs(dx), Math.abs(dy)) !== r) continue; if (this.free(x + dx, y + dy)) return [x + dx, y + dy];
    }
    return [x, y];
  },
  move(x, y, raw) {
    let best = null, bd = 1e9;
    for (const [o, n] of this.LM) { const d = (x - o[0]) ** 2 + (y - o[1]) ** 2; if (d < bd) { bd = d; best = [o, n]; } }
    const nx = Math.round(x + best[1][0] - best[0][0]), ny = Math.round(y + best[1][1] - best[0][1]);
    return raw ? [nx, ny] : this.snap(nx, ny);
  },
  init() {
    const S = SCENES.ashford; if (!S || S.__ash) return; S.__ash = 1;
    // signs / interactables
    const old = S.tiles || {}, T = {};
    for (const k of Object.keys(old)) {
      const nk = this.DOORS[k] || [this.move(...k.split(',').map(Number), true).join(',')];
      for (const n of nk) if (!T[n]) T[n] = old[k];
    }
    S.tiles = T;
    // the market and plaza crowd
    if (S.crowd) { S.crowd.count = Math.min(S.crowd.count || 18, 18);   // townsfolk gather in the squares and gardens, off the main roads
      S.crowd.areas = [[22, 18, 27, 24], [33, 18, 38, 24], [4, 15, 25, 16], [34, 15, 56, 16], [4, 31, 25, 32], [34, 32, 56, 33], [2, 19, 20, 21], [40, 19, 57, 21]]; if (0) S.crowd.areas = [[23, 1, 28, 2], [24, 4, 27, 6], [10, 6, 24, 7], [9, 22, 12, 25], [6, 29, 12, 30], [22, 21, 28, 24], [33, 13, 40, 17], [32, 33, 44, 35], [48, 34, 52, 35], [44, 3, 44, 9], [34, 3, 34, 9]]; }
    // exits (the east road sits a row higher now)
    S.exits = (S.exits || []).map(e => e.x === 59 ? Object.assign({}, e, { y: 19, y2: 21 }) : e);
    // dungeon mouths: the crypt stairs below the west houses, the quarry path up the north-east cliffs
    if (typeof DUNGEONS !== 'undefined') {
      for (const d of Object.values(DUNGEONS)) if (d.from && d.from.map === 'ashford') {
        if (d.id === 'd_crypt' || (d.from.at[0] === 7 && d.from.at[1] === 2)) { d.from.at = [13, 9]; d.from.back = [13, 10]; }
        else if (d.from.at[0] === 51) { d.from.at = [46, 1]; d.from.back = [46, 2]; }
      }
    }
    if (typeof MAPLOC !== 'undefined') for (const m of MAPLOC) if (m.scene && m.scene[0] === 'ashford') {
      const [, x, y] = m.scene; m.scene = ['ashford', ...(x === 7 ? [13, 10] : x === 51 ? [46, 2] : [x, y]), m.scene[3]];
    }
  }
};
(function () {
  try { ASH.init(); } catch (e) { }
  const NEW_SPACE = /^(player|f_|folk_|cave_|g_)/;
  const _load = World.load.bind(World);
  World.load = async function (name, x, y, dir) {
    if (window.ASH2_ON) return _load(name, x, y, dir);
    if (name === 'ashford') { ASH.init(); [x, y] = ASH.snap(x, y); }
    const r = await _load(name, x, y, dir);
    if (name === 'ashford') {
      for (const e of this.ents) {
        if (e.isPlayer || e.follower || NEW_SPACE.test(String(e.id))) continue;
        const [nx, ny] = ASH.move(e.x, e.y); e.x = nx; e.y = ny; e.px = nx * TILE + 16; e.py = ny * TILE + 26;
        if (e.route) e.route = e.id === 'patrol' ? [[33, 19], [52, 19]] : e.route.map(p => ASH.move(p[0], p[1]));   // the watch walks the east road
        if (e.area && e.area.length === 4) { const a = ASH.move(e.area[0], e.area[1]), b = ASH.move(e.area[2], e.area[3]); e.area = [Math.min(a[0], b[0]), Math.min(a[1], b[1]), Math.max(a[0], b[0]), Math.max(a[1], b[1])]; }
      }
      this.snapCam();
    }
    return r;
  };
  const _add = World.addNpc.bind(World);
  World.addNpc = async function (o) {
    if (!window.ASH2_ON && G.S && G.S.map === 'ashford' && o && o.x != null) { const [x, y] = ASH.move(o.x, o.y); o = Object.assign({}, o, { x, y }); }
    return _add(o);
  };
})();
