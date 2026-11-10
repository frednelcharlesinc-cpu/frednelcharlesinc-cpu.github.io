/* ================= MAP BUILDER =================
   Menu → Settings → Map Builder. Tap to place pieces, erase them, mark tiles walkable / blocked, pan with a finger.
   Edits save on this device and apply every time the map loads; Export copies them so they can be baked into the game. */
const MapEdit = {
  on: false, tool: 'place', pick: 'n_oak', undo: [], cam: null,
  KEY: 'eb_mapedits',
  DECOR: /tallgrass|flowers|lily|mush|reeds|wheat|bridge|planter|rockS|bushXS/,
  all() { try { return JSON.parse(localStorage.getItem(this.KEY) || '{}'); } catch (e) { return {}; } },
  put(a) { try { localStorage.setItem(this.KEY, JSON.stringify(a)); } catch (e) { toast('Could not save edits on this device.'); } },
  mine() { const a = this.all(), k = this.key(); return a[k] || (a[k] = { add: [], del: [], col: {} }); },
  key() { return (World.scene && World.scene.map) || G.S.map; },
  store(E) { const a = this.all(); a[this.key()] = E; this.put(a); },
  pid(p) { return p.k + '@' + p.x + ',' + p.y; },
  // apply this device's edits to a freshly loaded map
  apply() {
    const E = this.all()[this.key()]; if (!E || !World.map) return;
    const del = new Set(E.del);
    World.map = Object.assign({}, World.map, { props: World.map.props.filter(p => !del.has(this.pid(p))).concat(E.add) });
    for (const k in E.col) { const [x, y] = k.split(',').map(Number); if (World.inMap(x, y)) World.col[y][x] = E.col[k]; }
    World.buildPropList();
  },
  blockOf(k) { const md = G.props[k]; if (!md || (k.startsWith('n_') && this.DECOR.test(k))) return []; return md.block || [[0, 0]]; },
  pieces() { const K = Object.keys(G.props), big = k => (G.props[k].r[2] || 0) >= 150;
    return K.filter(k => k.startsWith('t_') && big(k)).concat(K.filter(k => k.startsWith('t_') && !big(k)), K.filter(k => k.startsWith('n_') && !/^n_house/.test(k)), K.filter(k => /^n_house/.test(k))); },

  open() {
    if (G.mode !== 'world' || !World.map) return toast('Open the Map Builder while standing on a map.');
    UI.closeMenu(); this.on = true; World.busy = true; UI.controls(false);
    this.cam = { x: World.cam.x, y: World.cam.y }; this.undo = []; this.ui(); this.grid = 1;
    toast('<b>Map Builder</b> — pick a piece below, tap the map to place it. Drag with Pan to move around.', 4200);
  },
  close() { this.on = false; const el = $('#medit'); if (el) el.remove(); World.busy = false; UI.controls(true); },
  ui() {
    const old = $('#medit'); if (old) old.remove();
    const d = document.createElement('div'); d.id = 'medit';
    const tools = [['place', '✚ Place'], ['erase', '✖ Erase'], ['wall', '▦ Block'], ['walk', '◻ Walkable'], ['pan', '✥ Pan']];
    d.innerHTML = `<div class="me-top">${tools.map(([k, n]) => `<button data-t="${k}" class="${this.tool === k ? 'on' : ''}">${n}</button>`).join('')}
      <span class="me-gap"></span><button data-a="undo">↶ Undo</button><button data-a="grid">Grid</button><button data-a="export">Export</button><button data-a="reset">Reset map</button><button data-a="done" class="me-done">Done</button></div>
      <div class="me-pal">${this.pieces().map(k => `<button data-p="${k}" class="${this.pick === k ? 'on' : ''}"><canvas width="56" height="56" data-k="${k}"></canvas><span>${k.replace(/^[nt]_/, '').replace(/^house/, 'house ')}</span></button>`).join('')}</div>`;
    document.body.appendChild(d);
    const PI = G.img.props2;
    d.querySelectorAll('canvas[data-k]').forEach(cv => { const md = G.props[cv.dataset.k], x = cv.getContext('2d'), [sx, sy, sw, sh] = md.r, s = Math.min(52 / sw, 52 / sh); x.imageSmoothingQuality = 'high'; x.drawImage(G.img[md.img] || PI, sx, sy, sw, sh, (56 - sw * s) / 2, 56 - sh * s - 2, sw * s, sh * s); });
    d.querySelectorAll('[data-t]').forEach(b => bindTap(b, () => { this.tool = b.dataset.t; d.querySelectorAll('[data-t]').forEach(x => x.classList.toggle('on', x === b)); }));
    d.querySelectorAll('[data-p]').forEach(b => bindTap(b, () => { this.pick = b.dataset.p; this.tool = 'place'; d.querySelectorAll('[data-p]').forEach(x => x.classList.toggle('on', x === b)); d.querySelectorAll('[data-t]').forEach(x => x.classList.toggle('on', x.dataset.t === 'place')); }));
    d.querySelectorAll('[data-a]').forEach(b => bindTap(b, () => this.act(b.dataset.a)));
  },
  act(a) {
    if (a === 'done') return this.close();
    if (a === 'grid') { this.grid = !this.grid; return; }
    if (a === 'undo') { const u = this.undo.pop(); if (!u) return toast('Nothing to undo.'); this.store(u); World.map = G.maps[this.key()]; World.col = World.map.col.map(r => r.split('').map(Number)); this.apply(); return; }
    if (a === 'reset') { if (!this.armed || performance.now() - this.armed > 3000) { this.armed = performance.now(); return toast('Tap <b>Reset map</b> again to undo ALL your changes on this map.', 3000); } this.armed = 0; const all = this.all(); delete all[this.key()]; this.put(all); World.map = G.maps[this.key()]; World.col = World.map.col.map(r => r.split('').map(Number)); World.buildPropList(); toast('This map is back to the original.'); return; }
    if (a === 'export') {
      const E = this.all()[this.key()] || {}; const txt = JSON.stringify({ map: this.key(), add: E.add || [], del: E.del || [], col: E.col || {} });
      const done = () => toast(`<b>Copied!</b> ${(E.add || []).length} pieces added, ${(E.del || []).length} removed. Paste it to Claude to bake it into the game.`, 5000);
      try { navigator.clipboard.writeText(txt).then(done, () => this.showText(txt)); } catch (e) { this.showText(txt); }
    }
  },
  showText(txt) { const t = document.createElement('textarea'); t.value = txt; t.className = 'me-out'; document.body.appendChild(t); t.select(); bindTap(t, () => { }); setTimeout(() => t.remove(), 20000); toast('Select all and copy the box, then paste it to Claude.', 5000); },
  tileAt(ev) { const r = cv.getBoundingClientRect(), sx = (ev.clientX - r.left) * cv.width / r.width / G.view.scale, sy = (ev.clientY - r.top) * cv.height / r.height / G.view.scale; return [Math.floor((sx + Math.round(World.cam.x)) / TILE), Math.floor((sy + Math.round(World.cam.y)) / TILE)]; },
  edit(x, y) {
    if (!World.inMap(x, y)) return; const E = this.mine(); this.undo.push(JSON.parse(JSON.stringify(E))); if (this.undo.length > 40) this.undo.shift();
    if (this.tool === 'place') {
      const p = { k: this.pick, x, y }; if (G.props[this.pick].flat) p.flat = 1; E.add.push(p);
      for (const [bx, by] of this.blockOf(this.pick)) { const tx = x + bx, ty = y + by; if (World.inMap(tx, ty)) E.col[tx + ',' + ty] = 1; }
    } else if (this.tool === 'erase') {
      // the piece standing on (or covering) this tile, nearest first
      const hit = World.map.props.filter(p => p.x === x && p.y === y).concat(World.map.props.filter(p => (G.props[p.k] || {}).door !== undefined && x >= p.x && x < p.x + (G.props[p.k].tw || 4) && y <= p.y && y > p.y - (G.props[p.k].th || 3)));
      const p = hit[0]; if (!p) { this.undo.pop(); return toast('No piece on that tile.', 1200); }
      const i = E.add.findIndex(a => a.k === p.k && a.x === p.x && a.y === p.y);
      if (i >= 0) E.add.splice(i, 1); else E.del.push(this.pid(p));
      for (const [bx, by] of this.blockOf(p.k)) { const tx = p.x + bx, ty = p.y + by; if (World.inMap(tx, ty)) E.col[tx + ',' + ty] = 0; }
    } else if (this.tool === 'wall' || this.tool === 'walk') E.col[x + ',' + y] = this.tool === 'wall' ? 1 : 0;
    this.store(E); World.map = G.maps[this.key()]; World.col = World.map.col.map(r => r.split('').map(Number)); this.apply();
  },
  draw(c) {
    if (!this.on || !World.map) return;
    const cx = Math.round(World.cam.x), cy = Math.round(World.cam.y), w = G.view.w, h = G.view.h;
    const x0 = Math.floor(cx / TILE), y0 = Math.floor(cy / TILE), x1 = Math.ceil((cx + w) / TILE), y1 = Math.ceil((cy + h) / TILE);
    c.save(); c.lineWidth = 1;
    for (let y = y0; y <= y1; y++) for (let x = x0; x <= x1; x++) {
      if (!World.inMap(x, y)) continue; const px = x * TILE - cx, py = y * TILE - cy;
      if (World.col[y][x]) { c.fillStyle = 'rgba(255,60,60,.22)'; c.fillRect(px, py, TILE, TILE); }
      if (this.grid) { c.strokeStyle = 'rgba(255,255,255,.12)'; c.strokeRect(px + .5, py + .5, TILE - 1, TILE - 1); }
    }
    if (this.hover && this.tool === 'place') { const md = G.props[this.pick]; if (md) { const [hx, hy] = this.hover, house = md.door !== undefined, dx = house ? hx * TILE - md.ax : hx * TILE + 16 - md.ax, dy = house ? hy * TILE + 31 - md.ay : hy * TILE + 28 - md.ay;
      c.globalAlpha = .55; c.drawImage(G.img[md.img] || G.img.props, md.r[0], md.r[1], md.r[2], md.r[3], dx - cx, dy - cy, md.r[2], md.r[3]); c.globalAlpha = 1; } }
    c.restore();
  }
};
(function () {
  const _load = World.load.bind(World);
  World.load = async function () { const r = await _load.apply(this, arguments); try { MapEdit.apply(); } catch (e) { console.warn(e); } return r; };
  const _up = World.update.bind(World);
  World.update = function (dt) { const r = _up(dt); if (MapEdit.on && MapEdit.cam) { this.cam.x = MapEdit.cam.x; this.cam.y = MapEdit.cam.y; } return r; };
  const _r = World.render.bind(World);
  World.render = function (c, t) { const out = _r(c, t); try { MapEdit.draw(c); } catch (e) { } return out; };
  let drag = null;
  cv.addEventListener('pointerdown', ev => { if (!MapEdit.on) return; ev.preventDefault(); ev.stopPropagation(); drag = { x: ev.clientX, y: ev.clientY, cx: MapEdit.cam.x, cy: MapEdit.cam.y, moved: false }; MapEdit.hover = MapEdit.tileAt(ev); }, true);
  cv.addEventListener('pointermove', ev => {
    if (!MapEdit.on) return; MapEdit.hover = MapEdit.tileAt(ev); if (!drag) return;
    const r = cv.getBoundingClientRect(), k = cv.width / r.width / G.view.scale, dx = (ev.clientX - drag.x) * k, dy = (ev.clientY - drag.y) * k;
    if (Math.abs(dx) + Math.abs(dy) > 6) drag.moved = true;
    if (MapEdit.tool === 'pan' || drag.moved && (MapEdit.tool !== 'wall' && MapEdit.tool !== 'walk')) { const mw = World.map.w * TILE, mh = World.map.h * TILE; MapEdit.cam.x = clamp(drag.cx - dx, 0, Math.max(0, mw - G.view.w)); MapEdit.cam.y = clamp(drag.cy - dy, 0, Math.max(0, mh - G.view.h)); }
    else if (drag.moved) { const [x, y] = MapEdit.tileAt(ev), key = x + ',' + y; if (drag.last !== key) { drag.last = key; MapEdit.edit(x, y); } }
  }, true);
  cv.addEventListener('pointerup', ev => { if (!MapEdit.on || !drag) return; if (!drag.moved && MapEdit.tool !== 'pan') { const [x, y] = MapEdit.tileAt(ev); MapEdit.edit(x, y); } drag = null; }, true);
  // the Map Builder button in Settings
  const _om = UI.renderMenu.bind(UI);
  UI.renderMenu = function () {
    const r = _om.apply(this, arguments);
    try { if (this.menuTab === 'settings' && !$('#meOpen')) { const body = $('#menuCard .mbody') || $('#menuCard'); const box = document.createElement('div'); box.className = 'stat'; box.style.marginTop = '8px';
      box.innerHTML = '<h3>Map Builder</h3><p>Place trees, houses and props on the map you\'re standing on, and mark where people can walk. Edits save on this phone.</p><button class="btn" id="meOpen">Open Map Builder</button>';
      body.appendChild(box); bindTap($('#meOpen'), () => MapEdit.open()); } } catch (e) { }
    return r;
  };
})();
