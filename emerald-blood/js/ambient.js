/* =====================================================================
   AMBIENT — the vale is alive.
   · Day & night: a clock that runs while you play (one day ≈ 18 minutes).
     Dusk turns orange, night turns blue; windows, lamps and lanterns glow.
   · Weather outdoors: clear, rain, fog, wind (falling leaves).
   · Life: chimney smoke, birds overhead, butterflies by day, fireflies by night,
     chickens and cats in town, dust kicked up when you run, splashes in the rain.
   Outdoors only — never in interiors, dungeons, the frozen realm, story scenes
   with their own lighting, or the childhood prologue.
   ===================================================================== */
const Ambient = {
  key: null, critters: [], smoke: [], fx: [], birds: [], bugs: [], rain: [], fogs: [], leaves: [],
  weather: 'clear', wNext: 0, wFade: 0, baseTint: undefined, baseLights: null, mapLights: [], houses: [], night: 0, lastMin: -1,
  on() { return !G.settings.noAmbient; },
  outdoors() {
    const W = World, sc = W.scene, M = W.map;
    return !!(M && sc && !M.interior && !M.dungeon && !sc.realm && !sc.dungeon && !sc.noAmbient && G.S && !G.S.kid);
  },
  // ---------------- the clock ----------------
  clock() { const S = G.S; if (S.clock === undefined) S.clock = 9 * 60; return S.clock; },
  hour() { return this.clock() / 60; },
  phase() { const h = this.hour(); return h < 5 ? 'Night' : h < 7 ? 'Dawn' : h < 12 ? 'Morning' : h < 17 ? 'Afternoon' : h < 20 ? 'Dusk' : 'Night'; },
  tintAt(h) {
    const K = [[0, [16, 22, 60], .52], [4, [16, 22, 60], .52], [5.5, [90, 70, 120], .3], [6.5, [255, 170, 120], .12], [7.5, [255, 230, 200], 0], [17, [255, 230, 200], 0],
      [18.3, [255, 140, 60], .17], [19.5, [120, 60, 100], .32], [20.6, [16, 22, 60], .5], [24, [16, 22, 60], .52]];
    let i = 0; while (i < K.length - 2 && h >= K[i + 1][0]) i++;
    const [h0, c0, a0] = K[i], [h1, c1, a1] = K[i + 1], u = Math.max(0, Math.min(1, (h - h0) / (h1 - h0)));
    return [c0.map((v, j) => Math.round(v + (c1[j] - v) * u)), a0 + (a1 - a0) * u];
  },
  tick(dt) {
    if (!G.S || G.mode !== 'world') return;
    if (!World.busy && !Dlg.open) { G.S.clock = (this.clock() + dt / 750) % 1440; }
    const m = Math.floor(this.clock()), h = m / 60;
    if (this.lastMin >= 0 && this.outdoors() && this.on()) {
      const was = this.lastMin / 60;
      if (was < 20 && h >= 20) toast('Night falls over the vale. Lamps flicker on.', 2400);
      if (was < 6 && h >= 6 && was > 3) toast('Dawn. The birds start up before you do.', 2400);
    }
    this.lastMin = m;
  },
  // ---------------- per-map setup ----------------
  setup() {
    const W = World, M = W.map; this.key = G.S.map; this.myTint = undefined; this.myLights = null;
    this.critters = []; this.smoke = []; this.fx = []; this.bugs = []; this.birds = []; this.mapLights = []; this.houses = [];
    if (!M) return;
    const P = G.props;
    for (const p of M.props) {
      const md = P[p.k]; if (!md) continue;
      if (md.door !== undefined) {
        const s = /^tav_/.test(p.k) ? 1.2 : 1, w = md.r[2], dx = p.x * 32 - md.ax, dy = p.y * 32 + 31 - md.ay;
        this.houses.push({ p, md, dx, dy, w, h: md.r[3], smoky: ((p.x * 7 + p.y * 13) % 3) !== 0 });
        const tw = (md.tw || 4) * 32 * s;
        for (const fx of [.28, .72]) this.mapLights.push({ x: dx + w * fx, y: p.y * 32 - 34, r: 44, c: '255,186,100' });
        if (/^tav_/.test(p.k)) for (const o of [-34, 34]) this.mapLights.push({ x: (p.x + md.door + .5) * 32 + o, y: p.y * 32 + 31 - 86, r: 60, c: '255,200,110' });
      } else if (p.k === 'lamp') this.mapLights.push({ x: p.x * 32 + 16, y: p.y * 32 - 40, r: 70, c: '255,214,140' });
      else if (/^fire|firepit/.test(p.k)) this.mapLights.push({ x: p.x * 32 + 16, y: p.y * 32 + 10, r: 80, c: '255,140,50' });
    }
    // chickens and cats in towns
    const town = ['thornvale', 'ashford', 'millbrook', 'kettlebrook'].includes(this.key);
    if (town && this.houses.length) {
      let seed = this.key.length * 97;
      const R = () => { seed = (seed * 9301 + 49297) % 233280; return seed / 233280; };
      const n = 4 + Math.floor(R() * 3);
      for (let i = 0; i < n * 6 && this.critters.length < n; i++) {
        const H = this.houses[Math.floor(R() * this.houses.length)], tx = H.p.x + Math.floor(R() * 8) - 2, ty = H.p.y + 1 + Math.floor(R() * 3);
        if (!this.free(tx, ty)) continue;
        const kind = this.critters.length % 4 === 3 ? 'cat' : 'hen';
        this.critters.push({ kind, x: tx * 32 + 16, y: ty * 32 + 24, tx: tx * 32 + 16, ty: ty * 32 + 24, wait: R() * 3000, dir: 1, peck: 0, col: kind === 'cat' ? pick(['#2a2420', '#d08a3a', '#8a8a92', '#efe6d6']) : pick(['#f4efe4', '#c8783a', '#e8d8b8']) });
      }
    }
  },
  free(tx, ty) { const C = World.col; return !!(C && C[ty] && C[ty][tx] === 0); },
  // ---------------- lighting (called right before the world tints) ----------------
  light(W, t) {
    if (this.key !== G.S.map) this.setup();
    // anything the story sets is respected: we only ever paint over our own tint
    if (W.tint !== this.myTint) this.baseTint = W.tint;
    if (W.lights !== this.myLights) this.baseLights = W.lights;
    let tint = this.baseTint, lights = this.baseLights || [];
    this.night = 0;
    if (this.on() && this.outdoors() && !this.baseTint) {
      const [c, a0] = this.tintAt(this.hour()); let a = a0;
      if (this.weather === 'rain') a = Math.max(a, .16 * this.wFade);
      this.night = Math.max(0, Math.min(1, (a0 - .12) / .38));
      if (a >= .02) { const col = this.weather === 'rain' && a0 < .16 ? [40, 50, 70] : c; tint = `rgba(${col[0]},${col[1]},${col[2]},${a.toFixed(3)})`; if (this.night > .25) lights = lights.concat(this.mapLights); }
      else tint = null;
    }
    W.tint = tint; W.lights = lights; this.myTint = tint; this.myLights = lights;
  },
  // ---------------- weather ----------------
  updWeather(dt) {
    if (!this.outdoors() || !this.on()) { this.weather = 'clear'; this.wFade = 0; return; }
    const now = G.t || performance.now();
    if (!this.wNext) this.wNext = now + rnd(90000, 160000);
    if (now > this.wNext && !World.busy) {
      const opts = [['clear', 5], ['rain', 3], ['fog', 2], ['wind', 2]], tot = opts.reduce((s, o) => s + o[1], 0); let r = Math.random() * tot, k = 'clear';
      for (const [n, w] of opts) { if ((r -= w) < 0) { k = n; break; } }
      if (k !== this.weather) { this.weather = k; this.wFade = 0; const msg = { rain: 'Rain rolls in over the vale.', fog: 'A grey fog creeps in off the river.', wind: 'The wind picks up. Leaves everywhere.', clear: 'The sky clears.' }[k]; if (G.mode === 'world') toast(msg, 2200); }
      this.wNext = now + rnd(100000, 200000);
    }
    this.wFade = Math.min(1, this.wFade + dt / 2500);
  },
  // ---------------- per-frame update ----------------
  update(dt) {
    this.tick(dt); this.updWeather(dt);
    if (!World.map || G.mode !== 'world' || !this.outdoors() || !this.on()) return;
    const now = performance.now(), W = G.view.w, H = G.view.h, cx = World.cam.x, cy = World.cam.y;
    // critters wander
    for (const k of this.critters) {
      k.wait -= dt;
      if (k.wait <= 0 && Math.abs(k.x - k.tx) < 1 && Math.abs(k.y - k.ty) < 1) {
        const ox = Math.round(rnd(-2, 2)), oy = Math.round(rnd(-1, 1)), tx = Math.floor(k.x / 32) + ox, ty = Math.floor(k.y / 32) + oy;
        if (this.free(tx, ty)) { k.tx = tx * 32 + 16 + rnd(-6, 6); k.ty = ty * 32 + 24 + rnd(-4, 4); }
        k.wait = rnd(1500, 5000); if (k.kind === 'hen' && Math.random() < .5) k.peck = 900;
      }
      const sp = (k.kind === 'cat' ? .035 : .028) * dt, dx = k.tx - k.x, dy = k.ty - k.y, d = Math.hypot(dx, dy);
      if (d > 1) { k.x += dx / d * Math.min(sp, d); k.y += dy / d * Math.min(sp, d); if (Math.abs(dx) > .5) k.dir = dx > 0 ? 1 : -1; k.moving = 1; } else k.moving = 0;
      if (k.peck > 0) k.peck -= dt;
      // scatter when you run past
      const p = World.player; if (p && k.kind === 'hen' && Math.hypot(p.px - k.x, p.py - k.y) < 40 && p.move && p.move.ms < 160 && !k.flee) { k.flee = 600; const a = Math.atan2(k.y - p.py, k.x - p.px), tx = Math.floor((k.x + Math.cos(a) * 64) / 32), ty = Math.floor((k.y + Math.sin(a) * 64) / 32); if (this.free(tx, ty)) { k.tx = tx * 32 + 16; k.ty = ty * 32 + 24; } }
      if (k.flee) k.flee = Math.max(0, k.flee - dt);
    }
    // chimney smoke
    for (const Hs of this.houses) if (Hs.smoky) {
      const sx = Hs.dx + Hs.w * .7, sy = Hs.dy + 26;
      if (sx < cx - 40 || sx > cx + W + 40 || sy < cy - 120 || sy > cy + H + 40) continue;
      if (Math.random() < dt / 260) this.smoke.push({ x: sx + rnd(-3, 3), y: sy, r: rnd(3, 5), t: 0, life: rnd(2400, 3600), vx: (this.weather === 'wind' ? .03 : .008) + rnd(0, .006) });
    }
    this.smoke = this.smoke.filter(s => (s.t += dt) < s.life); for (const s of this.smoke) { s.x += s.vx * dt; s.y -= .016 * dt; s.r += dt * .004; }
    // player dust / splashes
    const p = World.player;
    if (p && p.move && (p.move.ms < 160 || this.weather === 'rain') && Math.random() < dt / 90) this.fx.push({ k: this.weather === 'rain' ? 'splash' : 'dust', x: p.px + rnd(-5, 5), y: p.py + 2, t: 0, life: 420 });
    if (this.weather === 'rain' && Math.random() < dt / 30 * this.wFade) this.fx.push({ k: 'drop', x: cx + Math.random() * W, y: cy + Math.random() * H, t: 0, life: 300 });
    this.fx = this.fx.filter(f => (f.t += dt) < f.life);
    // butterflies by day, fireflies by night
    const want = this.night > .5 ? 22 : (this.weather === 'rain' ? 0 : 6), kind = this.night > .5 ? 'fly' : 'bfly';
    this.bugs = this.bugs.filter(b => b.kind === kind && b.x > cx - 80 && b.x < cx + W + 80 && b.y > cy - 80 && b.y < cy + H + 80);
    while (this.bugs.length < want) { const G2 = World.map.grass; let x, y; if (G2 && G2.length && Math.random() < .7) { const g = G2[Math.floor(Math.random() * G2.length)]; x = g[0] * 32 + 16; y = g[1] * 32 + 16; if (x < cx - 40 || x > cx + W + 40 || y < cy - 40 || y > cy + H + 40) { x = cx + Math.random() * W; y = cy + Math.random() * H; } } else { x = cx + Math.random() * W; y = cy + Math.random() * H; } this.bugs.push({ kind, x, y, ph: Math.random() * 6, col: pick(['#ffd34a', '#ff9ccc', '#9fd8ff', '#ffffff']) }); }
    for (const b of this.bugs) { b.ph += dt / 400; b.x += Math.cos(b.ph * .7) * dt * .02; b.y += Math.sin(b.ph) * dt * .012; }
    // birds
    if (this.night < .3 && this.weather !== 'rain' && Math.random() < dt / 22000 && this.birds.length === 0) {
      const dir = Math.random() < .5 ? 1 : -1, y0 = cy + rnd(30, H * .5), n = 3 + Math.floor(Math.random() * 4);
      for (let i = 0; i < n; i++) this.birds.push({ x: (dir > 0 ? cx - 40 : cx + W + 40) - dir * i * 18, y: y0 + Math.abs(i - n / 2) * 10, dir, ph: Math.random() * 6 });
    }
    for (const b of this.birds) { b.x += b.dir * dt * .09; b.ph += dt / 90; }
    this.birds = this.birds.filter(b => b.x > cx - 120 && b.x < cx + W + 120);
    // rain / leaves / fog in screen space
    if (this.weather === 'rain') { while (this.rain.length < 90 * this.wFade) this.rain.push({ x: Math.random() * W, y: Math.random() * H, s: rnd(.8, 1.3) }); for (const r of this.rain) { r.y += dt * .7 * r.s; r.x -= dt * .12 * r.s; if (r.y > H) { r.y = -10; r.x = Math.random() * (W + 60); } } } else this.rain = [];
    if (this.weather === 'wind') { while (this.leaves.length < 22 * this.wFade) this.leaves.push({ x: -20 - Math.random() * W, y: Math.random() * H, ph: Math.random() * 6, c: pick(['#c9862a', '#a8541e', '#d8b040', '#7a9a3a']) }); for (const l of this.leaves) { l.x += dt * .11; l.y += Math.sin(l.ph += dt / 300) * .6 + dt * .015; if (l.x > W + 20) { l.x = -20; l.y = Math.random() * H; } } } else this.leaves = [];
    if (this.weather === 'fog') { while (this.fogs.length < 7) this.fogs.push({ x: Math.random() * W, y: Math.random() * H, r: rnd(90, 180), v: rnd(.006, .014) }); for (const f of this.fogs) { f.x += f.v * dt; if (f.x - f.r > W) f.x = -f.r; } } else this.fogs = [];
  },
  // ---------------- drawing ----------------
  ground(c, cx, cy, t, w, h) { // on the ground, under people and buildings
    if (!this.on() || !this.outdoors()) return;
    for (const Hs of this.houses) { const x = Hs.dx - cx, y = Hs.p.y * 32 + 31 - cy; if (x > w || x + Hs.w < 0 || y < -20 || y > h + 40) continue; const g = c.createLinearGradient(0, y - 2, 0, y + 14); g.addColorStop(0, 'rgba(0,0,0,.28)'); g.addColorStop(1, 'rgba(0,0,0,0)'); c.fillStyle = g; c.fillRect(x + 6, y - 2, Hs.w - 12, 16); }
    for (const f of this.fx) {
      const x = f.x - cx, y = f.y - cy, u = f.t / f.life;
      if (f.k === 'dust') { c.fillStyle = `rgba(190,170,130,${.45 * (1 - u)})`; c.beginPath(); c.arc(x, y - u * 6, 2 + u * 5, 0, 7); c.fill(); }
      else { c.strokeStyle = `rgba(200,225,255,${.6 * (1 - u)})`; c.lineWidth = 1; c.beginPath(); c.ellipse(x, y, 2 + u * 6, 1 + u * 2.4, 0, 0, 7); c.stroke(); }
    }
    for (const k of this.critters) { const x = Math.round(k.x - cx), y = Math.round(k.y - cy); if (x < -20 || x > w + 20 || y < -20 || y > h + 20) continue; this.drawCritter(c, k, x, y, t); }
  },
  drawCritter(c, k, x, y, t) {
    c.save(); c.translate(x, y); c.scale(k.dir * 1.6, 1.6);
    c.fillStyle = 'rgba(0,0,0,.25)'; c.beginPath(); c.ellipse(0, 1, 6, 2, 0, 0, 7); c.fill();
    const hop = k.moving ? Math.abs(Math.sin(t / 70)) * 1.5 : 0;
    if (k.kind === 'hen') {
      const pk = k.peck > 0 && Math.sin(t / 60) > 0 ? 3 : 0;
      c.fillStyle = '#d8a030'; c.fillRect(-2, -2 - hop, 1, 3); c.fillRect(1, -2 - hop, 1, 3);
      c.fillStyle = k.col; c.beginPath(); c.ellipse(0, -6 - hop, 5.5, 4, 0, 0, 7); c.fill();
      c.beginPath(); c.moveTo(-5, -8 - hop); c.lineTo(-8, -12 - hop); c.lineTo(-4, -6 - hop); c.fill(); // tail
      c.beginPath(); c.arc(4, -10 - hop + pk, 2.6, 0, 7); c.fill(); // head
      c.fillStyle = '#d83a2a'; c.fillRect(3, -14 - hop + pk, 2, 2); c.fillStyle = '#e8a020'; c.fillRect(6, -10 - hop + pk, 2, 1.4);
      c.fillStyle = '#1a1a1a'; c.fillRect(4.5, -11 - hop + pk, 1, 1);
    } else {
      c.fillStyle = k.col; c.beginPath(); c.ellipse(0, -4 - hop, 6, 3, 0, 0, 7); c.fill();
      c.beginPath(); c.arc(5.5, -7 - hop, 2.8, 0, 7); c.fill();
      c.beginPath(); c.moveTo(4, -9 - hop); c.lineTo(4.6, -12 - hop); c.lineTo(5.8, -9 - hop); c.moveTo(6, -9 - hop); c.lineTo(7.4, -11.6 - hop); c.lineTo(7.8, -8 - hop); c.fill();
      c.strokeStyle = k.col; c.lineWidth = 1.6; c.lineCap = 'round'; c.beginPath(); c.moveTo(-5, -5 - hop); c.quadraticCurveTo(-9, -8 + Math.sin(t / 300) * 2, -8, -12 - hop); c.stroke();
      c.fillStyle = '#9fe060'; c.fillRect(6, -8 - hop, 1, 1);
    }
    c.restore();
  },
  air(c, cx, cy, t, w, h) { // above everyone, under the tint
    if (!this.on() || !this.outdoors()) return;
    for (const s of this.smoke) { const u = s.t / s.life, x = s.x - cx, y = s.y - cy; c.fillStyle = `rgba(200,200,205,${.38 * (1 - u) * Math.min(1, s.t / 300)})`; c.beginPath(); c.arc(x, y, s.r, 0, 7); c.fill(); }
    if (this.night < .5) for (const b of this.bugs) { const x = b.x - cx, y = b.y - cy, f = Math.abs(Math.sin(b.ph * 6)); c.fillStyle = b.col; c.fillRect(x - 1 - 2 * f, y - 1, 2 * f + 1, 2); c.fillRect(x + 1, y - 1, 2 * f + 1, 2); c.fillStyle = '#2a2a2a'; c.fillRect(x, y - 1, 1, 3); }
    for (const b of this.birds) { const x = b.x - cx, y = b.y - cy, f = Math.sin(b.ph) * 3; c.fillStyle = 'rgba(0,0,0,.12)'; c.beginPath(); c.ellipse(x, y + 90, 3, 1.4, 0, 0, 7); c.fill(); c.strokeStyle = '#2a2a30'; c.lineWidth = 1.4; c.beginPath(); c.moveTo(x - 5, y - f); c.lineTo(x, y); c.lineTo(x + 5, y - f); c.stroke(); }
  },
  sky(c, cx, cy, t, w, h) { // after the tint: things that glow, and weather
    if (!this.on() || !this.outdoors()) return;
    if (this.night > .5) { c.save(); c.globalCompositeOperation = 'lighter'; for (const b of this.bugs) { const x = b.x - cx, y = b.y - cy, a = .4 + .6 * Math.max(0, Math.sin(b.ph * 2.3)); const g = c.createRadialGradient(x, y, 0, x, y, 6); g.addColorStop(0, `rgba(200,255,140,${a})`); g.addColorStop(1, 'rgba(200,255,140,0)'); c.fillStyle = g; c.fillRect(x - 6, y - 6, 12, 12); } c.restore(); }
    // lit windows: a warm square at night where the glow comes from
    if (this.weather === 'fog') for (const f of this.fogs) { const g = c.createRadialGradient(f.x, f.y, 0, f.x, f.y, f.r); g.addColorStop(0, `rgba(210,215,220,${.32 * this.wFade})`); g.addColorStop(1, 'rgba(210,215,220,0)'); c.fillStyle = g; c.fillRect(f.x - f.r, f.y - f.r, f.r * 2, f.r * 2); }
    if (this.weather === 'rain') { c.strokeStyle = 'rgba(190,210,240,.45)'; c.lineWidth = 1; c.beginPath(); for (const r of this.rain) { c.moveTo(r.x, r.y); c.lineTo(r.x - 3 * r.s, r.y + 11 * r.s); } c.stroke(); for (const f of this.fx) if (f.k === 'drop') { const u = f.t / f.life; c.strokeStyle = `rgba(200,225,255,${.5 * (1 - u)})`; c.beginPath(); c.ellipse(f.x - cx, f.y - cy, 1 + u * 4, .6 + u * 1.6, 0, 0, 7); c.stroke(); } }
    if (this.weather === 'wind') for (const l of this.leaves) { c.save(); c.translate(l.x, l.y); c.rotate(Math.sin(l.ph) * 1.4); c.fillStyle = l.c; c.beginPath(); c.ellipse(0, 0, 4, 2, 0, 0, 7); c.fill(); c.restore(); }
  }
};
// hook into the world loop
(function () {
  const _u = World.update ? World.update.bind(World) : null;
  if (_u) World.update = function (dt) { const r = _u(dt); try { Ambient.update(dt); } catch (e) { } return r; };
  const _l = World.load.bind(World);
  World.load = async function (...a) { const r = await _l(...a); try { Ambient.setup(); } catch (e) { } return r; };
})();
// a small clock under the HUD
(function () {
  const el = document.createElement('div'); el.id = 'clk';
  el.style.cssText = 'position:fixed;z-index:12;left:max(12px,env(safe-area-inset-left));top:calc(max(6px,env(safe-area-inset-top)) + 66px);padding:2px 9px;border-radius:9px;background:rgba(9,13,11,.78);border:1px solid #2f6b43;font:800 12px Nunito,sans-serif;color:#d8e8dc;pointer-events:none;display:none';
  document.body.appendChild(el);
  setInterval(() => {
    const show = G.mode === 'world' && G.S && !G.S.kid && !$('#hud').classList.contains('hide') && Ambient.on();
    el.style.display = show ? 'block' : 'none'; if (!show) return;
    const m = Math.floor(Ambient.clock()), h = Math.floor(m / 60), ph = Ambient.phase();
    const icon = ph === 'Night' ? '☾' : ph === 'Dawn' || ph === 'Dusk' ? '◐' : '☀';
    const wx = Ambient.outdoors() ? { rain: ' · ☂ Rain', fog: ' · ≋ Fog', wind: ' · ⇝ Wind', clear: '' }[Ambient.weather] : '';
    el.textContent = `${icon} ${ph} ${((h + 11) % 12) + 1}:${String(m % 60).padStart(2, '0')} ${h < 12 ? 'AM' : 'PM'}${wx}`;
  }, 500);
})();
// ---------------- soundscape: birds by day, crickets at night, rain patter ----------------
(function () {
  let nextBird = 0, nextCricket = 0;
  setInterval(() => {
    try {
      if (!AC || !G.settings.sfx || G.mode !== 'world' || !G.S || !Ambient.on() || !Ambient.outdoors() || document.hidden) return;
      const now = performance.now();
      if (Ambient.weather === 'rain') { noise(.22, .012 * Ambient.wFade, 5000); if (Math.random() < .25) noise(.05, .02, 7000, Math.random() * .2); }
      if (Ambient.night > .6) {
        if (now > nextCricket) { const f = rnd(4200, 4800); for (let i = 0; i < 3; i++) tone(f, .035, 'sine', .006, null, i * .07); nextCricket = now + rnd(700, 2200); }
      } else if (Ambient.weather !== 'rain' && Ambient.night < .2 && now > nextBird) {
        const f = rnd(2200, 3400), n = 2 + Math.floor(Math.random() * 3);
        for (let i = 0; i < n; i++) tone(f * rnd(.9, 1.15), .08, 'sine', .008, f * rnd(1.2, 1.5), i * .12);
        nextBird = now + rnd(3500, 9000);
      }
    } catch (e) { }
  }, 220);
})();
