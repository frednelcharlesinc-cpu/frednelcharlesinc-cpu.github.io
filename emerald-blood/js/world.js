'use strict';
/* ================= WORLD: maps, entities, crowd AI, hood mechanic ================= */
const TILE = 32;
const World = {
  ents: [], player: null, map: null, mapImg: null, scene: null, cam: { x: 0, y: 0 }, propsDraw: [], flat: [],
  busy: false, lastEnc: 0, bubbleGate: 0, shake: 0, tint: null, lights: [], extraProps: [], followers: [],

  async load(name, x, y, dir) {
    this.loading = true;
    G.S.map = name; G.S.x = x; G.S.y = y; if (dir) G.S.dir = dir;
    this.scene = SCENES[name] || {}; const mk = this.scene.map || name;
    this.map = G.maps[mk];
    this.mapImg = G.img['map_' + mk] || (G.img['map_' + mk] = await loadImg('assets/map_' + mk + '.png' + (this.map.v ? '?v=' + this.map.v : '')).catch(() => loadImg('assets/map_' + mk + '.png?r=' + Date.now())));
    this.col = this.map.col.map(r => r.split('').map(Number));
    this.grass = new Set(this.map.grass.map(p => p[0] + ',' + p[1]));
    this.extraProps = []; this.lights = []; this.tint = null; this.followLight = null;
    this.ents = [];
    this.player = new Ent({ id: 'player', x, y, dir: dir || G.S.dir, isPlayer: true });
    this.ents.push(this.player);
    // party followers
    this.followers = [];
    for (const m of G.S.party) {
      const e = new Ent({ id: 'f_' + m, img: await npcImg(ALLY_SPRITE[m] || m), x, y, dir: this.player.dir, follower: true, ghost: true });
      this.ents.push(e); this.followers.push(e);
    }
    this.trail = [];
    if (this.scene.setup) await this.scene.setup(this);
    const npcs = this.scene.npcs ? this.scene.npcs() : [];
    for (const n of npcs) {
      if (n.show && !n.show()) continue;
      const e = new Ent(Object.assign({}, n, { img: await npcImg(n.sprite || n.id) }));
      this.ents.push(e);
    }
    if (typeof spawnExtras === 'function') { await spawnExtras(this, name); await Quests.spawn(this, name); }
    if (this.scene.crowd) await this.spawnCrowd(this.scene.crowd);
    this.buildPropList();
    this.snapCam(); this.loading = false;
    if (this.scene.weather) Weather.start(typeof this.scene.weather === 'string' ? this.scene.weather : 'snow'); else Weather.stop();
    Music.play(this.scene.music ? (typeof this.scene.music === 'function' ? this.scene.music() : this.scene.music) : null);
  },
  async spawnCrowd(cr) {
    const folk = (cr.pool ? cr.pool() : G.man.folk).slice(); const r = (a) => a[Math.floor(Math.random() * a.length)];
    for (let i = 0; i < cr.count; i++) {
      const area = r(cr.areas); let tries = 40, x, y;
      do { x = area[0] + Math.floor(Math.random() * (area[2] - area[0] + 1)); y = area[1] + Math.floor(Math.random() * (area[3] - area[1] + 1)); } while (tries-- > 0 && !this.free(x, y));
      if (tries <= 0) continue;
      const id = folk[i % folk.length];
      const e = new Ent({ id: 'folk_' + i, sprite: id, img: await npcImg(id), x, y, dir: r(['down', 'left', 'right', 'up']), folk: true, kid: id.startsWith('kid'), area,
        ai: 'wander', name: cr.names ? cr.names[i % cr.names.length] : 'Townsperson', talk: cr.talk, talkLines: cr.lines, witness: cr.witness });
      e.wait = rnd(500, 4000);
      this.ents.push(e);
    }
  },
  buildPropList() {
    const P = G.props; this.propsDraw = []; this.flat = [];
    for (const p of this.map.props.concat(this.extraProps)) {
      const md = P[p.k]; if (!md) continue;
      const house = md.door !== undefined;
      const dx = house ? p.x * TILE - md.ax : p.x * TILE + 16 + (p.ox || 0) - md.ax;
      const dy = house ? p.y * TILE + 31 - md.ay : p.y * TILE + 28 - md.ay;
      const o = { p, md, dx, dy, by: house ? p.y * TILE + 31 : p.y * TILE + 26, anim: p.anim };
      (p.flat ? this.flat : this.propsDraw).push(o);
    }
  },
  addFire(x, y, big) { this.extraProps.push({ k: 'fire0', x, y, anim: 'fire', ox: (Math.random() * 10 - 5) | 0 }); this.lights.push({ x: x * TILE + 16, y: y * TILE + 16, r: big ? 90 : 60, c: '255,140,40' }); },
  snapCam() {
    const p = this.player, w = G.view.w, h = G.view.h, mw = this.map.w * TILE, mh = this.map.h * TILE;
    this.cam.x = mw <= w ? (mw - w) / 2 : clamp(p.px - w / 2, 0, mw - w);
    this.cam.y = mh <= h ? (mh - h) / 2 : clamp(p.py - 20 - h / 2, 0, mh - h);
  },
  inMap(x, y) { return x >= 0 && y >= 0 && x < this.map.w && y < this.map.h; },
  entAt(x, y, except) {
    for (const e of this.ents) { if (e === except || e.ghost) continue; if ((e.x === x && e.y === y) || (e.move && e.move.tx === x && e.move.ty === y)) return e; }
    return null;
  },
  free(x, y, except) { return this.inMap(x, y) && !this.col[y][x] && !this.entAt(x, y, except); },
  exitAt(x, y) { return (this.scene.exits || []).find(e => (!e.when || e.when()) && x >= e.x && x <= (e.x2 ?? e.x) && y >= e.y && y <= (e.y2 ?? e.y)); },

  update(dt) {
    if (!this.map || !this.player || this.loading) return;
    const p = this.player;
    // player input
    if (G.mode === 'world' && !this.busy && !p.move) {
      const d = Input.dir();
      if (d) {
        p.dir = d;
        const nx = p.x + DIRS[d][0], ny = p.y + DIRS[d][1];
        const ex = this.exitAt(nx, ny) || (!this.inMap(nx, ny) && this.exitAt(p.x, p.y));
        if (ex && ex.msg) { if (G.t - (this.lastMsg || 0) > 2500) { this.lastMsg = G.t; toast(ex.msg); } }
        else if (this.free(nx, ny, p)) {
          const run = G.input.run || G.input.runToggle || G.input.mag > 0.92;
          p.startMove(nx, ny, Mounts.speed(run));
          this.trail.unshift([p.x, p.y, p.dir]); this.trail.length = Math.min(this.trail.length, 8);
          this.followers.forEach((f, i) => { const t = this.trail[i]; if (t) f.startMove(t[0], t[1], Mounts.speed(run), t[2]); });
        } else if (ex && !ex.msg) this.useExit(ex);
      }
    }
    for (const e of this.ents) e.update(dt, this);
    Weather.update(dt);
    // camera follow
    const w = G.view.w, h = G.view.h, mw = this.map.w * TILE, mh = this.map.h * TILE;
    const tx = mw <= w ? (mw - w) / 2 : clamp(p.px - w / 2, 0, mw - w);
    const ty = mh <= h ? (mh - h) / 2 : clamp(p.py - 20 - h / 2, 0, mh - h);
    this.cam.x = lerp(this.cam.x, tx, 0.18); this.cam.y = lerp(this.cam.y, ty, 0.18);
    if (G.mode === 'world' && !this.busy) this.crowdReact(dt);
  },
  onStep(e) {
    if (!e.isPlayer) return;
    G.S.x = e.x; G.S.y = e.y; G.S.dir = e.dir; G.S.steps++;
    Realm.step(); Stones.patrol();
    if (G.S.steps % 2 === 0) sfx('step');
    const ex = this.exitAt(e.x, e.y);
    if (ex && !ex.msg) { this.useExit(ex); return; }
    if (this.scene.step) { const r = this.scene.step(e.x, e.y); if (r) return; }
    // encounters
    if (this.scene.encounters && this.grass.has(e.x + ',' + e.y) && G.S.steps - this.lastEnc > 6 && Math.random() < (this.scene.encRate ?? 0.11)) {
      this.lastEnc = G.S.steps;
      const enc = typeof Bloodlust !== 'undefined' ? Bloodlust.filter(this.scene.encounters()) : this.scene.encounters();
      if (enc) Story.run(async () => { const r = await Battle.start(enc); if (r === 'lose') await Story.defeat(); });
    }
  },
  async go(to, x, y, dir) {
    await fadeOut(300);
    await this.load(to, x, y, dir);
    save(); UI.hud();
    await fadeIn(300);
    if (SCENES[to].title) banner(SCENES[to].title, SCENES[to].subtitle || '', 1300);
  },
  async useExit(ex) {
    if (this.busy) return; this.busy = true;
    if (ex.check && !(await ex.check())) { this.busy = false; return; }
    await fadeOut(350);
    if (ex.to === '__ret') { const r = G.S.ret || { map: 'ashford', x: 29, y: 30 }; ex = { to: r.map, tx: r.x, ty: r.y, dir: 'down' }; }
    await this.load(ex.to, ex.tx, ex.ty, ex.dir || this.player.dir);
    save(); UI.hud();
    await fadeIn(350);
    banner(SCENES[ex.to].title || '', SCENES[ex.to].subtitle || '');
    this.busy = false;
    if (SCENES[ex.to].onEnter) Story.run(SCENES[ex.to].onEnter);
  },
  facingTile() { const p = this.player; return [p.x + DIRS[p.dir][0], p.y + DIRS[p.dir][1]]; },
  interact() {
    if (this.busy || this.player.move || G.mode !== 'world') return;
    const [tx, ty] = this.facingTile();
    const e = this.ents.find(n => !n.isPlayer && !n.follower && n.x === tx && n.y === ty);
    if (e && e.talk) { e.dir = OPP[this.player.dir]; e.wait = 4000; Story.run(() => e.talk(e)); return; }
    const it = this.scene.tiles && (this.scene.tiles[tx + ',' + ty] || this.scene.tiles[this.player.x + ',' + this.player.y]);
    if (it) { Story.run(it); return; }
    // party member chat
    const f = this.followers[0]; if (f && Math.hypot(f.x - this.player.x, f.y - this.player.y) <= 1.5 && ALLY_TALK[G.S.party[0]]) Story.run(ALLY_TALK[G.S.party[0]]);
  },
  toggleHood() {
    if (G.mode !== 'world' || this.busy) return;
    if (!G.S.f.hoodGiven) { toast("You don't have a hood yet."); return; }
    G.S.hood = !G.S.hood; sfx('hood');
    toast(G.S.hood ? 'Hood up. Your eyes are hidden.' : 'Hood down. Your eyes burn green for anyone to see.');
    UI.hud(); save();
  },
  // ---- people reacting to your eyes ----
  crowdReact(dt) {
    const p = this.player; if (G.S.hood || !G.S.f.hoodGiven || this.scene.safe) return;
    for (const e of this.ents) {
      if (!(e.folk && e.witness !== false) && !e.witness) continue;
      const d = Math.abs(e.x - p.x) + Math.abs(e.y - p.y);
      if (d <= 4 && !e.alarmed && this.sees(e, p)) {
        e.alarmed = true; e.dir = this.dirTo(e, p); e.wait = 900;
        const lines = e.kid ? ['Whoa! Green eyes!', 'Mama, look! A Drag!', 'Are you a dragon?!', 'So cool!'] : ['Is that… green?', 'A Drag!', 'Gods preserve us.', 'Don\'t look at it.', 'Fetch the guard…', 'Disgusting.', 'Run!', 'Here? In town?'];
        e.say(pick(lines), 2200, '!'); sfx('alarm');
        e.ai = e.kid ? 'stare' : (Math.random() < 0.65 ? 'flee' : 'stare'); e.fleeFrom = [p.x, p.y]; e.alarmT = 9000;
        const key = this.map === G.maps.ashford ? 'ash_' + e.id : e.id;
        if (!G.S.seen[key]) { G.S.seen[key] = 1; Story.addSus(e.kid ? 0.1 : 0.25, true); }
      }
    }
  },
  sees(e, p) { const dx = p.x - e.x, dy = p.y - e.y; const f = DIRS[e.dir]; return dx * f[0] + dy * f[1] >= 0 || Math.abs(dx) + Math.abs(dy) <= 2; },
  dirTo(a, b) { const dx = b.x - a.x, dy = b.y - a.y; return Math.abs(dx) > Math.abs(dy) ? (dx > 0 ? 'right' : 'left') : (dy > 0 ? 'down' : 'up'); },

  // ---- scripted movement helpers ----
  async walk(ent, path, ms) {
    for (const [x, y] of path) {
      while (ent.x !== x || ent.y !== y) {
        const dx = Math.sign(x - ent.x), dy = Math.sign(y - ent.y);
        const nx = ent.x + (dx || 0), ny = ent.y + (dx ? 0 : dy);
        ent.dir = dx ? (dx > 0 ? 'right' : 'left') : (dy > 0 ? 'down' : 'up');
        ent.startMove(nx, ny, ms || 220);
        await new Promise(r => { const ck = () => ent.move ? setTimeout(ck, 16) : r(); ck(); });
      }
    }
  },
  ent(id) { return this.ents.find(e => e.id === id); },
  async addNpc(o) { const e = new Ent(Object.assign({}, o, { img: await npcImg(o.sprite || o.id) })); this.ents.push(e); return e; },
  remove(id) { this.ents = this.ents.filter(e => e.id !== id); },

  render(c, t) {
    const w = G.view.w, h = G.view.h;
    c.fillStyle = '#0c140e'; c.fillRect(0, 0, w, h);
    if (!this.map || !this.player || this.loading) return;
    let cx = Math.round(this.cam.x), cy = Math.round(this.cam.y);
    if (this.shake > 0) { cx += Math.round(rnd(-3, 3)); cy += Math.round(rnd(-3, 3)); this.shake -= 16; }
    c.drawImage(this.mapImg, cx, cy, w, h, 0, 0, w, h);
    if (cx < 0 || cy < 0) { c.drawImage(this.mapImg, 0, 0, this.mapImg.width, this.mapImg.height, -cx, -cy, this.mapImg.width, this.mapImg.height); }
    const PI = G.img.props, P = G.props;
    const drawProp = o => {
      let md = o.md;
      if (o.anim === 'fire') md = P['fire' + (Math.floor(t / 120 + o.p.x) % 4)];
      const [sx, sy, sw, sh] = md.r, x = o.dx - cx, y = o.dy - cy;
      if (x > w || y > h || x + sw < 0 || y + sh < 0) return;
      c.drawImage(PI, sx, sy, sw, sh, x, y, sw, sh);
    };
    this.flat.forEach(drawProp);
    if (typeof Ambient !== 'undefined') try { Ambient.ground(c, cx, cy, t, w, h); } catch (e) { }
    const list = [];
    for (const o of this.propsDraw) list.push([o.by, 0, o]);
    for (const e of this.ents) {
      if (!e.hidden) list.push([e.py, 1, e]);
      else if (e.peek && Math.abs(e.x - this.player.x) + Math.abs(e.y - this.player.y) <= 6) { e.alpha = .42 + .12 * Math.sin(t / 220); list.push([e.py, 1, e]); }
    }
    list.sort((a, b) => a[0] - b[0] || a[1] - b[1]);
    for (const [, k, o] of list) {
      if (k === 0) drawProp(o);
      else o.draw(c, cx, cy, t);
    }
    if (typeof Ambient !== 'undefined') try { Ambient.air(c, cx, cy, t, w, h); Ambient.light(this, t); } catch (e) { }
    // night / fire tint
    if (this.tint) {
      c.fillStyle = this.tint; c.fillRect(0, 0, w, h);
      if (this.lights.length) {
        c.save(); c.globalCompositeOperation = 'lighter';
        for (const L of this.lights) {
          const x = L.x - cx, y = L.y - cy; if (x < -120 || y < -120 || x > w + 120 || y > h + 120) continue;
          const r = L.r * (0.92 + 0.08 * Math.sin(t / 90 + L.x));
          const g = c.createRadialGradient(x, y, 2, x, y, r); g.addColorStop(0, `rgba(${L.c},.35)`); g.addColorStop(1, `rgba(${L.c},0)`);
          c.fillStyle = g; c.fillRect(x - r, y - r, r * 2, r * 2);
        }
        c.restore();
      }
    }
    Weather.render(c, t);
    if (typeof Ambient !== 'undefined') try { Ambient.sky(c, cx, cy, t, w, h); } catch (e) { }
    // player eye glow
    const p = this.player;
    if (!G.S.hood && G.S.f.dragAwake !== false && p.dir !== 'up' && !p.hidden) {
      const hd = typeof HD !== 'undefined' && HD.on() && HD.OW && !G.S.kid;   // the new sprites have the green eyes painted in: only a faint halo
      const gx = p.px - cx + (p.dir === 'left' ? -3 : p.dir === 'right' ? 3 : 0), gy = hd ? p.py - cy + 3 - HD.OW_H * .76 : p.py - cy - 33, a = (hd ? .22 : .5) + .15 * Math.sin(t / 260);
      c.save(); c.globalCompositeOperation = 'lighter';
      const g = c.createRadialGradient(gx, gy, 0, gx, gy, hd ? 5 : 7); g.addColorStop(0, `rgba(70,255,140,${a})`); g.addColorStop(1, 'rgba(70,255,140,0)');
      c.fillStyle = g; c.fillRect(gx - 7, gy - 7, 14, 14); c.restore();
    }
    // interaction hint
    if (G.mode === 'world' && !this.busy && !p.move) {
      const [tx, ty] = this.facingTile();
      const e = this.ents.find(n => !n.isPlayer && !n.follower && n.x === tx && n.y === ty && n.talk);
      const it = this.scene.tiles && this.scene.tiles[tx + ',' + ty];
      if (e || it) {
        const hx = (e ? e.px : tx * TILE + 16) - cx, hy = (e ? e.py - 62 : ty * TILE - 6) - cy + Math.sin(t / 200) * 2;
        c.fillStyle = 'rgba(0,0,0,.75)'; c.beginPath(); c.arc(hx, hy, 7, 0, 7); c.fill();
        c.fillStyle = '#46ff95'; c.font = '800 12px "Nunito"'; c.textAlign = 'center'; c.fillText(e ? '…' : '?', hx, hy + 3.5);
      }
    }
    // bubbles
    for (const e of this.ents) if (e.bubble) e.drawBubble(c, cx, cy);
  }
};

class Ent {
  constructor(o) {
    Object.assign(this, { dir: 'down', move: null, frame: 0, walkT: 0, wait: 0, speed: 220, ai: null, bubble: null }, o);
    this.px = this.x * TILE + 16; this.py = this.y * TILE + 26;
  }
  startMove(nx, ny, ms, dir) {
    if (dir) this.dir = dir;
    else this.dir = nx > this.x ? 'right' : nx < this.x ? 'left' : ny > this.y ? 'down' : ny < this.y ? 'up' : this.dir;
    this.move = { fx: this.x, fy: this.y, tx: nx, ty: ny, t: 0, ms };
  }
  update(dt, W) {
    if (this.move) {
      const m = this.move; m.t += dt / m.ms;
      this.walkT += dt;
      if (m.t >= 1) { this.x = m.tx; this.y = m.ty; this.move = null; W.onStep(this); }
      const tt = Math.min(1, m.t);
      this.px = lerp(m.fx, m.tx, tt) * TILE + 16; this.py = lerp(m.fy, m.ty, tt) * TILE + 26;
      if (this.move === null) { this.px = this.x * TILE + 16; this.py = this.y * TILE + 26; }
    } else if (!this.isPlayer && !this.follower && this.ai && G.mode === 'world' && !W.busy) this.think(dt, W);
    if (this.bubble) { this.bubble.t -= dt; if (this.bubble.t <= 0) this.bubble = null; }
  }
  think(dt, W) {
    this.wait -= dt; if (this.wait > 0) return;
    if (this.alarmT) { this.alarmT -= dt; if (this.alarmT <= 0) { this.alarmT = 0; this.ai = 'wander'; this.alarmed = false; } }
    const p = W.player;
    if (this.ai === 'stare') { this.dir = W.dirTo(this, p); this.wait = 400; return; }
    if (this.ai === 'flee' && this.fleeFrom) {
      const opts = Object.keys(DIRS).map(d => [d, this.x + DIRS[d][0], this.y + DIRS[d][1]]).filter(o => W.free(o[1], o[2], this))
        .sort((a, b) => (Math.abs(b[1] - p.x) + Math.abs(b[2] - p.y)) - (Math.abs(a[1] - p.x) + Math.abs(a[2] - p.y)));
      if (opts.length && Math.abs(this.x - p.x) + Math.abs(this.y - p.y) < 8) { this.startMove(opts[0][1], opts[0][2], 170); this.wait = 0; }
      else { this.dir = W.dirTo(this, p); this.wait = 700; }
      return;
    }
    if (this.ai === 'wander') {
      if (Math.random() < 0.35) { this.dir = pick(['down', 'left', 'right', 'up']); this.wait = rnd(800, 2600); }
      else {
        const d = pick(Object.keys(DIRS)), nx = this.x + DIRS[d][0], ny = this.y + DIRS[d][1], a = this.area;
        if ((!a || (nx >= a[0] && nx <= a[2] && ny >= a[1] && ny <= a[3])) && W.free(nx, ny, this)) this.startMove(nx, ny, this.kid ? 160 : 260);
        this.wait = rnd(300, 2200);
      }
      // ambient chatter
      if (this.talkLines && Math.random() < 0.06 && G.t > W.bubbleGate && Math.abs(this.x - p.x) + Math.abs(this.y - p.y) < 7) { this.say(pick(this.talkLines()), 2600); W.bubbleGate = G.t + 2500; }
      return;
    }
    if (this.ai === 'patrol' && this.route) {
      this.ri = this.ri || 0; const [tx, ty] = this.route[this.ri];
      if (this.x === tx && this.y === ty) { this.ri = (this.ri + 1) % this.route.length; this.wait = rnd(600, 1600); return; }
      const dx = Math.sign(tx - this.x), dy = Math.sign(ty - this.y);
      const nx = this.x + (dx || 0), ny = this.y + (dx ? 0 : dy);
      if (W.free(nx, ny, this)) this.startMove(nx, ny, 260); else this.wait = 600;
      return;
    }
    if (this.ai === 'giggle') { if (this.hidden && Math.abs(this.x - p.x) + Math.abs(this.y - p.y) <= 8) this.say(pick(['hee hee!', '*giggle*', "you'll never find me!", 'shhh…', '*snort*']), 1800); this.wait = rnd(2600, 4200); return; }
    if (this.ai === 'turn') { this.dir = pick(this.turns || ['down', 'left', 'right']); this.wait = rnd(1500, 4000); }
    if (this.ai === 'bark' && this.barks && Math.abs(this.x - p.x) + Math.abs(this.y - p.y) < 9 && G.t > W.bubbleGate) {
      this.say(pick(this.barks()), 3000); W.bubbleGate = G.t + 2500; this.wait = rnd(5000, 9000);
    }
  }
  say(text, ms, icon) { this.bubble = { text, t: ms || 2500, icon }; }
  img_() { return this.isPlayer ? playerImg() : this.img; }
  draw(c, cx, cy, t) {
    const img = this.img_(); if (!img) return;
    const x = this.px - cx, y = this.py - cy;
    if (x < -40 || y < -10 || x > G.view.w + 40 || y > G.view.h + 70) return;
    c.fillStyle = 'rgba(0,0,0,.22)'; c.beginPath(); c.ellipse(x, y, 10, 4, 0, 0, 7); c.fill();
    if (this.move && this.move.ms < 160) { const f = Math.floor(this.walkT / (this.move.ms / 3.4)) % 8; drawOW(c, img, 'run', this.dir, f, x, y, this.alpha, this.size); }
    else if (this.move) { const f = 1 + Math.floor(this.walkT / (this.move.ms / 3.2)) % 8; drawOW(c, img, 'walk', this.dir, f, x, y, this.alpha, this.size); }
    else drawOW(c, img, 'idle', this.dir, Math.floor((t + (this.x * 97)) / 600) % 2, x, y, this.alpha, this.size);
  }
  drawBubble(c, cx, cy) {
    const b = this.bubble, x = Math.round(this.px - cx), y = Math.round(this.py - cy - 66 * (this.size || 1));
    c.font = '800 12px "Nunito"'; c.textAlign = 'center';
    const tw = Math.min(170, c.measureText(b.text).width + 12), a = Math.min(1, b.t / 300);
    c.globalAlpha = a;
    c.fillStyle = b.icon === '!' ? 'rgba(80,10,10,.9)' : 'rgba(250,248,236,.95)';
    c.beginPath(); c.roundRect ? c.roundRect(x - tw / 2, y - 12, tw, 16, 5) : c.rect(x - tw / 2, y - 12, tw, 16); c.fill();
    c.beginPath(); c.moveTo(x - 4, y + 4); c.lineTo(x + 4, y + 4); c.lineTo(x, y + 9); c.fill();
    c.fillStyle = b.icon === '!' ? '#ffd2d2' : '#1d1810'; c.fillText(b.text, x, y);
    c.globalAlpha = 1;
  }
}
