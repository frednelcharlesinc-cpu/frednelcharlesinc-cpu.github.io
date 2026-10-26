'use strict';
/* ================= CINEMATICS: animated, letterboxed story cutscenes =================
   A cutscene is a list of shots. Each shot paints an animated backdrop, moves actors (game sprites,
   silhouettes or drawn portraits), drives a camera, fires effects, and plays captions. Tap advances. */
const VW = 640, VH = 360;
const ease = k => k < .5 ? 2 * k * k : 1 - (-2 * k + 2) ** 2 / 2;
const lerpK = (keys, t, i) => { // keys: [[t, v0, v1, ...]]
  if (!keys || !keys.length) return null;
  if (t <= keys[0][0]) return keys[0][i];
  for (let k = 1; k < keys.length; k++) if (t <= keys[k][0]) { const a = keys[k - 1], b = keys[k], u = ease((t - a[0]) / (b[0] - a[0] || 1)); return a[i] + (b[i] - a[i]) * u; }
  return keys[keys.length - 1][i];
};
function rng(seed) { let s = seed >>> 0 || 1; return () => (s = (s * 1664525 + 1013904223) >>> 0) / 4294967296; }

const Cine = {
  on: false, skipAll: false,
  el: null, cv: null, cx: null, cap: null,
  build() {
    if (this.el) return;
    const el = document.createElement('div'); el.className = 'ov'; el.id = 'cine'; el.style.cssText = 'z-index:70;background:#000;display:block';
    el.innerHTML = `<canvas id="cineCv" style="position:absolute;inset:0;width:100%;height:100%;image-rendering:pixelated"></canvas>
      <div class="cbar top"></div><div class="cbar bot"></div>
      <div id="cineCap"><b></b><span></span></div>
      <button id="cineSkip">Skip ▶▶</button>`;
    document.body.appendChild(el); this.el = el; this.cv = el.querySelector('canvas'); this.cx = this.cv.getContext('2d'); this.cap = el.querySelector('#cineCap');
    el.addEventListener('pointerdown', e => { if (e.target.id === 'cineSkip') return; e.preventDefault(); this.tap(); });
    el.querySelector('#cineSkip').addEventListener('pointerdown', e => { e.preventDefault(); e.stopPropagation(); this.skipAll = true; sfx('blip'); });
  },
  async play(shots, o) {
    o = o || {};
    if (!shots || !shots.length) return;
    const need = new Set(); shots.forEach(sh => (sh.actors || []).forEach(a => { if (a.spr && a.spr !== 'me' && !G.img[a.spr]) need.add(a.spr); }));
    await Promise.all([...need].map(n => npcImg(n).catch(() => null)));
    this.build(); this.on = true; this.skipAll = false; const el = this.el; el.classList.remove('hide'); el.style.display = 'block';
    const prevA = Input.handlers.a; Input.on('a', () => this.tap());
    if (o.music) Music.play(o.music);
    el.style.opacity = 0; el.style.transition = 'opacity .5s'; await wait(20); el.style.opacity = 1;
    this.loop();
    for (const s of shots) { if (this.skipAll) break; await this.runShot(s); }
    el.style.opacity = 0; await wait(500);
    this.on = false; el.style.display = 'none'; this.shot = null; this.cap.classList.remove('on');
    Input.on('a', prevA || UI.routeA);
    if (o.after) o.after();
  },
  tap() {
    const L = this.line; if (!L) { if (this.shot && this.shot.tapEnds) this.shot.__end = true; return; }
    if (L.typing) { L.i = L.text.length; L.typing = false; L.hold = performance.now(); this.renderCap(); }
    else L.done = true;
  },
  runShot(s) {
    return new Promise(res => {
      s.t0 = performance.now(); s.__res = res; s.parts = []; s.fired = new Set(); s.flash = 0; s.shake = 0;
      (s.fx || []).forEach(f => this.initFx(s, f));
      s.lines = (s.lines || []).map(l => typeof l === 'string' ? { who: null, text: l } : { who: l[0], text: l[1], col: l[2] });
      if (s.sceneId && typeof s.bg === 'string' && Art.cut[s.sceneId]) s.parts = s.parts.filter(p => p.k !== 'smoke');
      s.li = -1; this.shot = s; this.nextLine();
    });
  },
  nextLine() {
    const s = this.shot; s.li++;
    if (s.li >= s.lines.length) { this.line = null; this.cap.classList.remove('on'); return; }
    const l = s.lines[s.li]; l.text = Dlg.fmt(l.text);
    this.line = { ...l, i: 0, typing: true, start: performance.now() + (s.li === 0 ? (s.capDelay || 500) : 150), done: false };
    this.renderCap();
  },
  renderCap() {
    const L = this.line, c = this.cap; if (!L) return;
    const nm = L.who ? (L.who === 'me' ? G.S.name : (CHAR[L.who] ? CHAR[L.who].name : L.who)) : '';
    c.querySelector('b').textContent = nm; c.querySelector('b').style.display = nm ? '' : 'none';
    c.querySelector('b').style.color = L.col || (L.who === 'me' ? '#46ff95' : '#ffd88a');
    c.querySelector('span').textContent = L.text.slice(0, L.i); c.classList.toggle('on', L.i > 0 || !L.typing); c.classList.toggle('narr', !L.who);
  },
  loop() {
    const step = now => {
      if (!this.on) return;
      const s = this.shot;
      if (s) {
        const t = now - s.t0;
        // captions
        const L = this.line;
        if (L && now >= L.start) {
          if (L.typing) { const n = Math.min(L.text.length, Math.floor((now - L.start) / 24)); if (n !== L.i) { L.i = n; this.renderCap(); if (n % 3 === 0) sfx('blip'); } if (n >= L.text.length) { L.typing = false; L.hold = now; } }
          else if (L.done || now - L.hold > Math.max(1700, L.text.length * 42) * (s.slow || 1)) this.nextLine();
        }
        // timed events
        (s.ev || []).forEach(([et, fn], i) => { if (t >= et && !s.fired.has(i)) { s.fired.add(i); fn(s, this); } });
        this.draw(s, t);
        const linesDone = !this.line && s.li >= s.lines.length - 1;
        if ((linesDone && t >= (s.dur || 0)) || this.skipAll || s.__end) { const r = s.__res; this.shot = null; this.line = null; this.cap.classList.remove('on'); r(); }
      }
      requestAnimationFrame(step);
    };
    requestAnimationFrame(step);
  },
  draw(s, t) {
    const cv = this.cv, dpr = Math.min(2, devicePixelRatio || 1), W = innerWidth, H = innerHeight;
    if (cv.width !== Math.round(W * dpr) || cv.height !== Math.round(H * dpr)) { cv.width = Math.round(W * dpr); cv.height = Math.round(H * dpr); }
    const c = this.cx; c.setTransform(1, 0, 0, 1, 0, 0); c.fillStyle = '#000'; c.fillRect(0, 0, cv.width, cv.height);
    const k = Math.max(cv.width / VW, cv.height / VH);
    const hasArt = s.sceneId && typeof s.bg === 'string' && Art.cut[s.sceneId];
    const cam = (hasArt && (s.artCam || [[0, 320, 175, 1], [Math.max(4000, s.dur || 0) + 3000, 320, 165, 1.1]])) || s.cam || [[0, 320, 180, 1]], camX = lerpK(cam, t, 1), camY = lerpK(cam, t, 2), z = lerpK(cam, t, 3);
    let sx = 0, sy = 0; if (s.shake > 0) { sx = (Math.random() - .5) * s.shake; sy = (Math.random() - .5) * s.shake; s.shake *= .92; }
    c.setTransform(k * z, 0, 0, k * z, cv.width / 2 - (camX + sx) * k * z, cv.height / 2 - (camY + sy) * k * z);
    c.imageSmoothingEnabled = false;
    const art = s.sceneId && typeof s.bg === 'string' && Art.cut[s.sceneId];
    if (art) { c.imageSmoothingEnabled = true; const sc = Math.max(900 / art.width, 520 / art.height); c.drawImage(art, 320 - art.width * sc / 2, -10, art.width * sc, art.height * sc); c.imageSmoothingEnabled = false; }
    else { const bg = typeof s.bg === 'function' ? s.bg : BG[s.bg]; if (bg) bg(c, t, s); }
    // actors (y-sorted)
    const acts = (s.actors || []).map(a => ({ a, x: lerpK(a.path, t, 1) ?? a.x, y: lerpK(a.path, t, 2) ?? a.y })).sort((p, q) => (p.a.z || p.y) - (q.a.z || q.y));
    for (const { a, x, y } of acts) this.drawActor(c, a, x, y, t, s);
    if (s.fg) (typeof s.fg === 'function' ? s.fg : BG[s.fg])(c, t, s);
    this.updFx(c, s, t);
    // screen-space overlays
    c.setTransform(1, 0, 0, 1, 0, 0);
    if (s.vignette) { const g = c.createRadialGradient(cv.width / 2, cv.height / 2, cv.height * .3, cv.width / 2, cv.height / 2, cv.width * .7); g.addColorStop(0, 'rgba(0,0,0,0)'); g.addColorStop(1, s.vignette); c.fillStyle = g; c.fillRect(0, 0, cv.width, cv.height); }
    if (s.flash > 0) { c.fillStyle = `rgba(${s.flashCol || '255,255,255'},${Math.min(1, s.flash)})`; c.fillRect(0, 0, cv.width, cv.height); s.flash -= .03; }
    const fi = s.fadeIn ?? 500, fo = s.fadeOut ?? 0;
    if (t < fi) { c.fillStyle = `rgba(0,0,0,${1 - t / fi})`; c.fillRect(0, 0, cv.width, cv.height); }
    if (s.title) { const a = Math.min(1, t / 900) * (s.titleOut && t > s.titleOut ? Math.max(0, 1 - (t - s.titleOut) / 700) : 1); c.globalAlpha = a; c.textAlign = 'center'; c.fillStyle = '#e8fff0'; c.font = `${Math.round(cv.height * .06)}px "Press Start 2P"`; c.shadowColor = '#46ff95'; c.shadowBlur = 18; c.fillText(s.title, cv.width / 2, cv.height * .48); c.shadowBlur = 0; if (s.sub) { c.font = `${Math.round(cv.height * .045)}px "Pixelify Sans"`; c.fillStyle = '#c9d8cc'; c.fillText(s.sub, cv.width / 2, cv.height * .58); } c.globalAlpha = 1; }
    if (s.bigText) { const [bt, at] = s.bigText; if (t > at) { const u = Math.min(1, (t - at) / 250); c.globalAlpha = u; c.textAlign = 'center'; c.font = `${Math.round(cv.height * (.16 - .05 * u))}px "Press Start 2P"`; c.fillStyle = '#fff'; c.shadowColor = '#000'; c.shadowBlur = 20; c.fillText(bt, cv.width / 2 + (Math.random() - .5) * 6, cv.height * .5); c.shadowBlur = 0; c.globalAlpha = 1; } }
  },
  drawActor(c, a, x, y, t, s) {
    if (a.show && (t < a.show[0] || t > (a.show[1] ?? 1e9))) return;
    if (a.hideOnArt && s.sceneId && Art.cut[s.sceneId]) return;
    const alpha = a.fade ? Math.max(0, Math.min(1, lerpK(a.fade, t, 1))) : 1; if (alpha <= 0) return;
    c.globalAlpha = alpha;
    if (a.draw) { a.draw(c, x, y, t, s); c.globalAlpha = 1; return; }
    if (a.port) { // drawn bust portrait, for close-ups
      const key = a.port + a.expr + (a.facing || 1); a.__pc = a.__pc || {}; if (!a.__pc[key]) { const pc = document.createElement('canvas'); drawPortrait(pc, a.port, a.expr, a.facing || 1); a.__pc[key] = pc; }
      const sc = lerpK(a.scaleK, t, 1) ?? a.scale ?? 2, pc = a.__pc[key], k2 = PW / pc.width; c.imageSmoothingEnabled = pc.width > PW; c.drawImage(pc, x - PW * sc / 2, y - pc.height * k2 * sc, PW * sc, pc.height * k2 * sc); c.imageSmoothingEnabled = false; c.globalAlpha = 1; return;
    }
    let img = a.spr === 'me' ? playerImg() : G.img[a.spr]; if (!img) { c.globalAlpha = 1; return; }
    if (a.sil) img = tinted(img, a.sil === true ? '#07070b' : a.sil);
    const sc = a.scale || 3;
    const moving = a.path && a.path.length > 1 && t > a.path[0][0] && t < a.path[a.path.length - 1][0];
    let dir = a.dir || 'down';
    if (a.dirs) for (const [dt, d] of a.dirs) if (t >= dt) dir = d;
    if (a.bt) { const nF = { slash: 6, halfslash: 6, backslash: 13, spellcast: 7, thrust: 8, jump: 5, hurt: 6, combat: 2, walk: 9, run: 8 }[a.bt] || 6; const f = a.loop === false ? Math.min(nF - 1, Math.floor(Math.max(0, t - (a.btAt || 0)) / (a.fms || 90))) : Math.floor(t / (a.fms || 110)) % nF;
      if (a.flip) { c.save(); c.translate(x, 0); c.scale(-1, 1); drawBT(c, img, a.bt, f, 0, y, sc); c.restore(); } else drawBT(c, img, a.bt, f, x, y, sc); }
    else {
      const anim = a.anim || (moving ? (a.run ? 'run' : 'walk') : 'idle');
      const f = anim === 'idle' ? Math.floor(t / 500) % 2 : anim === 'run' ? Math.floor(t / 80) % 8 : 1 + Math.floor(t / 110) % 8;
      drawOW(c, img, anim, dir, f, x, y, undefined, sc);
    }
    if (a.greatsword) { const ang = a.greatsword === 'drag' ? .3 + Math.sin(t / 400) * .02 : a.greatsword, px = x + 3 * sc, py = y - 22 * sc, gs = sc * .95;
      paintGreatsword(c, px, py, ang, gs, t);
      if (a.greatsword === 'drag' && Math.random() < .6) s.parts.push({ k: 'ember', x: px + 74 * gs * Math.cos(ang), y: py + 74 * gs * Math.sin(ang), vx: Math.random() * 1.4, vy: -Math.random() * 1.4, s: 1.5, p: 0 }); }
    if (a.glowEyes) { c.save(); c.globalCompositeOperation = 'lighter'; const gx = x + (a.glowEyes[0] || 0) * sc, gy = y + (a.glowEyes[1] || -40) * sc; const gr = (a.glowR || 5) * sc, g = c.createRadialGradient(gx, gy, 0, gx, gy, gr); g.addColorStop(0, 'rgba(90,255,150,.85)'); g.addColorStop(1, 'rgba(90,255,150,0)'); c.fillStyle = g; c.fillRect(gx - gr, gy - gr, gr * 2, gr * 2); c.restore(); }
    c.globalAlpha = 1;
  },
  /* ---------- particles ---------- */
  initFx(s, f) {
    const R = Math.random;
    const add = (n, mk) => { for (let i = 0; i < n; i++) s.parts.push(mk(true)); };
    if (f === 'embers') add(60, () => ({ k: 'ember', x: R() * 760 - 60, y: R() * 400, vx: (R() - .3) * .3, vy: -.3 - R() * .8, s: 1 + R() * 1.5, p: R() * 6 }));
    if (f === 'snow') add(140, () => ({ k: 'snow', x: R() * 760 - 60, y: R() * 400, vx: .2 + R() * .3, vy: .4 + R() * .6, s: 1 + R() * 1.6, p: R() * 6 }));
    if (f === 'blizzard') add(320, () => ({ k: 'bliz', x: R() * 760 - 60, y: R() * 400, vx: -3 - R() * 3, vy: 1 + R() * 1.6, s: 1 + R() * 2 }));
    if (f === 'fireflies') add(26, () => ({ k: 'fly', x: R() * 640, y: 150 + R() * 200, p: R() * 6, s: 1.5 }));
    if (f === 'smoke') add(26, () => ({ k: 'smoke', x: R() * 760 - 60, y: 120 + R() * 260, vx: .15 + R() * .2, vy: -.12 - R() * .15, r: 30 + R() * 50, a: .1 + R() * .15 }));
    if (f === 'mana') add(50, () => ({ k: 'mana', x: R() * 640, y: R() * 360, vx: (R() - .5) * .3, vy: -.2 - R() * .3, s: 1 + R() * 1.4, p: R() * 6 }));
    if (f === 'petals') add(30, () => ({ k: 'petal', x: R() * 760 - 60, y: R() * 400, vx: .4 + R() * .4, vy: .3 + R() * .4, s: 1.5 + R(), p: R() * 6 }));
  },
  updFx(c, s, t) {
    for (const p of s.parts) {
      if (p.k === 'ember') { p.x += p.vx + Math.sin(t / 500 + p.p) * .2; p.y += p.vy; if (p.y < -10) { p.y = 370; p.x = Math.random() * 700 - 30; } c.fillStyle = `rgba(255,${150 + Math.sin(t / 120 + p.p) * 60 | 0},60,.9)`; c.fillRect(p.x, p.y, p.s, p.s); }
      else if (p.k === 'snow' || p.k === 'bliz') { p.x += p.vx + (p.k === 'snow' ? Math.sin(t / 700 + (p.p || 0)) * .3 : 0); p.y += p.vy; if (p.y > 370) { p.y = -10; p.x = Math.random() * 760 - 60; } if (p.x < -70) p.x = 700; if (p.x > 720) p.x = -60;
        c.fillStyle = 'rgba(255,255,255,.9)'; c.fillRect(p.x, p.y, p.k === 'bliz' ? p.s * 3 : p.s, p.s); }
      else if (p.k === 'fly') { const x = p.x + Math.sin(t / 900 + p.p) * 18, y = p.y + Math.cos(t / 1100 + p.p) * 10, a = .4 + Math.sin(t / 300 + p.p) * .4; c.fillStyle = `rgba(180,255,150,${a})`; c.fillRect(x, y, 2, 2); }
      else if (p.k === 'smoke') { p.x += p.vx; p.y += p.vy; if (p.y < -60) { p.y = 400; } c.fillStyle = `rgba(20,16,18,${p.a})`; c.beginPath(); c.arc(p.x, p.y, p.r, 0, 7); c.fill(); }
      else if (p.k === 'mana') { p.x += p.vx; p.y += p.vy; if (p.y < -10) p.y = 370; c.fillStyle = `rgba(110,255,170,${.4 + Math.sin(t / 200 + p.p) * .3})`; c.fillRect(p.x, p.y, p.s, p.s); }
      else if (p.k === 'petal') { p.x += p.vx; p.y += p.vy; if (p.y > 370) { p.y = -10; p.x = Math.random() * 700 - 30; } c.fillStyle = '#ffb8d0'; c.fillRect(p.x, p.y, p.s + Math.sin(t / 200 + p.p), p.s); }
    }
  }
};

/* ================= painted backdrops ================= */
function skyG(c, stops, y0 = -200, y1 = 360) { const g = c.createLinearGradient(0, y0, 0, y1); stops.forEach(([o, col]) => g.addColorStop(o, col)); c.fillStyle = g; c.fillRect(-400, -400, 1440, 1160); }
function ridge(c, seed, base, amp, col, step = 18, x0 = -300, x1 = 940) {
  const r = rng(seed); c.fillStyle = col; c.beginPath(); c.moveTo(x0, 800); let y = base;
  for (let x = x0; x <= x1; x += step) { y = base - r() * amp - (Math.sin(x / 97 + seed) * amp * .5); c.lineTo(x, y); }
  c.lineTo(x1, 800); c.closePath(); c.fill();
}
function peaks(c, seed, base, amp, col, snow) {
  const r = rng(seed); const pts = []; for (let x = -300; x <= 940; x += 40 + r() * 50) pts.push([x, base - amp * (.3 + r() * .7)]);
  c.fillStyle = col; c.beginPath(); c.moveTo(-300, 800); for (let i = 0; i < pts.length; i++) { const [x, y] = pts[i]; c.lineTo(x, y); if (i < pts.length - 1) { const nx = (x + pts[i + 1][0]) / 2; c.lineTo(nx, base - amp * .15 * r()); } } c.lineTo(940, 800); c.fill();
  if (snow) { c.fillStyle = snow; for (const [x, y] of pts) if (base - y > amp * .55) { c.beginPath(); c.moveTo(x, y); c.lineTo(x - 12, y + 16); c.lineTo(x - 3, y + 12); c.lineTo(x + 4, y + 18); c.lineTo(x + 13, y + 15); c.closePath(); c.fill(); } }
}
function stars(c, n, t, seed = 7, alpha = 1, h = 220) { const r = rng(seed); for (let i = 0; i < n; i++) { const x = r() * 900 - 130, y = r() * h - 120, tw = .5 + Math.sin(t / 400 + i) * .5; c.fillStyle = `rgba(255,255,240,${(.3 + tw * .7) * alpha})`; c.fillRect(x, y, r() < .1 ? 2 : 1, r() < .1 ? 2 : 1); } }
function orb(c, x, y, r, col, glow) { const g = c.createRadialGradient(x, y, r * .2, x, y, r * (glow || 3)); g.addColorStop(0, col); g.addColorStop(.3, col.replace(/[\d.]+\)$/, '.25)')); g.addColorStop(1, 'rgba(0,0,0,0)'); c.fillStyle = g; c.beginPath(); c.arc(x, y, r * (glow || 3), 0, 7); c.fill(); c.fillStyle = col; c.beginPath(); c.arc(x, y, r, 0, 7); c.fill(); }
function flame(c, x, y, w, h, t, seed = 0) {
  c.save(); c.globalCompositeOperation = 'lighter';
  const g = c.createRadialGradient(x, y - h * .3, 2, x, y - h * .3, h * 1.6); g.addColorStop(0, 'rgba(255,150,40,.45)'); g.addColorStop(1, 'rgba(255,80,20,0)'); c.fillStyle = g; c.fillRect(x - h * 1.6, y - h * 2, h * 3.2, h * 2.6);
  for (const [col, sc] of [['#ff4a1a', 1], ['#ff9a2a', .7], ['#ffe08a', .4]]) {
    c.fillStyle = col; c.beginPath(); c.moveTo(x - w * sc, y);
    for (let i = 0; i <= 6; i++) { const u = i / 6, fx = x - w * sc + u * 2 * w * sc, fl = Math.sin(t / 90 + i * 1.7 + seed) * .25 + Math.sin(t / 53 + i + seed) * .15; c.lineTo(fx, y - h * sc * (.55 + .45 * Math.sin(u * Math.PI)) * (1 + fl)); }
    c.lineTo(x + w * sc, y); c.closePath(); c.fill();
  }
  c.restore();
}
function house(c, x, y, w, h, col, roof, lit, t) {
  c.fillStyle = col; c.fillRect(x, y - h, w, h);
  c.fillStyle = roof; c.beginPath(); c.moveTo(x - 6, y - h); c.lineTo(x + w / 2, y - h - w * .45); c.lineTo(x + w + 6, y - h); c.closePath(); c.fill();
  if (lit) { c.fillStyle = `rgba(255,200,110,${.7 + Math.sin(t / 300 + x) * .15})`; c.fillRect(x + w * .2, y - h * .6, w * .18, h * .25); c.fillRect(x + w * .62, y - h * .6, w * .18, h * .25); }
}
function bridgeDraw(c, x0, x1, y, col) { c.fillStyle = col; c.fillRect(x0, y, x1 - x0, 7); for (let x = x0; x < x1; x += 18) c.fillRect(x, y - 16, 3, 16); c.fillRect(x0, y - 16, x1 - x0, 3); }
function tree(c, x, y, s, col) { c.fillStyle = col; c.fillRect(x - 2 * s, y - 14 * s, 4 * s, 14 * s); c.beginPath(); c.moveTo(x, y - 46 * s); c.lineTo(x - 13 * s, y - 14 * s); c.lineTo(x + 13 * s, y - 14 * s); c.fill(); c.beginPath(); c.moveTo(x, y - 56 * s); c.lineTo(x - 10 * s, y - 30 * s); c.lineTo(x + 10 * s, y - 30 * s); c.fill(); }
function deadTree(c, x, y, s, col) { c.strokeStyle = col; c.lineWidth = 3 * s; c.lineCap = 'round'; c.beginPath(); c.moveTo(x, y); c.lineTo(x, y - 50 * s); c.moveTo(x, y - 30 * s); c.lineTo(x - 14 * s, y - 46 * s); c.moveTo(x, y - 38 * s); c.lineTo(x + 12 * s, y - 54 * s); c.moveTo(x - 7 * s, y - 39 * s); c.lineTo(x - 9 * s, y - 52 * s); c.stroke(); c.lineCap = 'butt'; }
function wallDraw(c, y) { c.fillStyle = '#4a4440'; c.fillRect(-300, y, 1240, 40); c.fillStyle = '#5c5550'; for (let r = 0; r < 3; r++) for (let x = -300 + (r % 2) * 14; x < 940; x += 28) c.fillRect(x + 1, y + 1 + r * 13, 26, 11); c.fillStyle = '#6e6660'; c.fillRect(-300, y - 4, 1240, 5); }
function dragonSil(c, x, y, s, t, eye) {
  const flap = Math.sin(t / 700) * .25;
  c.save(); c.translate(x, y); c.scale(s, s); c.fillStyle = '#080202';
  for (const d of [-1, 1]) { c.save(); c.scale(d, 1); c.rotate(-flap); c.beginPath(); c.moveTo(10, -10); c.quadraticCurveTo(70, -90, 170, -70); c.lineTo(150, -50); c.lineTo(165, -30); c.lineTo(130, -25); c.lineTo(140, -2); c.lineTo(100, -5); c.quadraticCurveTo(60, 0, 10, 15); c.fill(); c.restore(); }
  c.beginPath(); c.ellipse(0, 10, 26, 44, 0, 0, 7); c.fill();
  c.beginPath(); c.moveTo(-10, -25); c.quadraticCurveTo(-8, -60, 0, -70); c.quadraticCurveTo(8, -60, 10, -25); c.fill();
  c.beginPath(); c.moveTo(-14, -78); c.lineTo(0, -66); c.lineTo(14, -78); c.lineTo(10, -60); c.lineTo(0, -52); c.lineTo(-10, -60); c.fill();
  c.beginPath(); c.moveTo(-12, -74); c.lineTo(-24, -98); c.lineTo(-6, -72); c.fill(); c.beginPath(); c.moveTo(12, -74); c.lineTo(24, -98); c.lineTo(6, -72); c.fill();
  c.beginPath(); c.moveTo(0, 50); c.quadraticCurveTo(30, 100, 80, 90); c.lineTo(78, 96); c.quadraticCurveTo(20, 110, -4, 52); c.fill();
  if (eye) { c.globalCompositeOperation = 'lighter'; orb(c, -5, -66, 1.6, 'rgba(90,255,150,.95)', 4); orb(c, 5, -66, 1.6, 'rgba(90,255,150,.95)', 4); }
  c.restore();
}
function chain(c, x0, y0, x1, y1, k, t) { const n = 26; c.strokeStyle = '#c9b78a'; c.lineWidth = 1.5; for (let i = 0; i < n * k; i++) { const u = i / n, x = x0 + (x1 - x0) * u, y = y0 + (y1 - y0) * u + Math.sin(u * Math.PI) * 18; c.beginPath(); c.ellipse(x, y, 3, 1.8, Math.atan2(y1 - y0, x1 - x0) + (i % 2) * 1.2, 0, 7); c.stroke(); } }
function citadel(c, x, y, s, col, lit, t) {
  c.fillStyle = col;
  c.beginPath(); c.moveTo(x - 160 * s, y); c.lineTo(x - 120 * s, y - 60 * s); c.lineTo(x - 60 * s, y - 70 * s); c.lineTo(x + 60 * s, y - 75 * s); c.lineTo(x + 140 * s, y - 50 * s); c.lineTo(x + 180 * s, y); c.fill();
  for (const [dx, w, h] of [[-80, 20, 120], [-40, 26, 170], [0, 34, 230], [44, 24, 150], [84, 18, 110]]) { c.fillRect(x + (dx - w / 2) * s, y - (70 + h) * s, w * s, (h + 10) * s); c.beginPath(); c.moveTo(x + (dx - w / 2 - 4) * s, y - (70 + h) * s); c.lineTo(x + dx * s, y - (70 + h + w * 1.4) * s); c.lineTo(x + (dx + w / 2 + 4) * s, y - (70 + h) * s); c.fill(); }
  if (lit) { for (let i = 0; i < 18; i++) { const r = rng(i + 3); c.fillStyle = `rgba(255,${200 + r() * 40 | 0},120,${.5 + Math.sin(t / 400 + i) * .3})`; c.fillRect(x + (r() * 200 - 100) * s, y - (90 + r() * 180) * s, 2, 3); } }
}

function yearTag(c, n, season) { c.save(); c.textAlign = 'left'; c.font = '700 13px "Press Start 2P"'; c.fillStyle = 'rgba(0,0,0,.55)'; c.fillText('YEAR ' + n + ' · ' + season, 22, 44); c.fillStyle = '#e8fff0'; c.fillText('YEAR ' + n + ' · ' + season, 20, 42); c.restore(); }
const BG = {
  hut(c, t) {
    c.fillStyle = '#1a120c'; c.fillRect(-300, -300, 1240, 960);
    for (let x = -300; x < 940; x += 34) { c.fillStyle = x % 68 ? '#2a1c12' : '#24170f'; c.fillRect(x, -300, 32, 600); }
    c.fillStyle = '#3a2a1c'; c.fillRect(-300, 300, 1240, 200);
    c.fillStyle = '#4a3a30'; c.fillRect(110, 200, 120, 110); c.fillStyle = '#120a06'; c.fillRect(130, 230, 80, 80);
    flame(c, 170, 306, 22, 34, t, 2);
    c.save(); c.globalCompositeOperation = 'lighter'; const g = c.createRadialGradient(170, 280, 10, 170, 280, 260); g.addColorStop(0, 'rgba(255,150,60,.35)'); g.addColorStop(1, 'rgba(255,150,60,0)'); c.fillStyle = g; c.fillRect(-100, 0, 600, 400); c.restore();
    c.fillStyle = 'rgba(110,255,170,.12)'; c.fillRect(470, 90, 90, 120); c.fillStyle = '#120a06'; c.fillRect(512, 90, 6, 120); c.fillRect(470, 147, 90, 6);
    yearTag(c, 1, 'WINTER');
  },
  spring(c, t) {
    skyG(c, [[0, '#9ac8e8'], [1, '#e0f0f4']]); peaks(c, 61, 220, 130, '#6a7a90', '#ffffff');
    c.fillStyle = '#e8f0f0'; c.fillRect(-300, 290, 1240, 140); c.fillStyle = '#7aa86a'; for (let i = 0; i < 26; i++) { const r = rng(i); c.fillRect(r() * 700 - 30, 296 + r() * 60, 8 + r() * 14, 3); }
    for (let i = 0; i < 5; i++) deadTree(c, 40 + i * 140, 300, 1.1, '#5a6470');
    yearTag(c, 2, 'SPRING THAW');
  },
  summerStones(c, t) {
    skyG(c, [[0, '#5aa0e0'], [1, '#d8eef0']]); peaks(c, 63, 230, 120, '#5a7a8a', '#f4f8ff');
    c.fillStyle = '#7aa86a'; c.fillRect(-300, 290, 1240, 140);
    for (const x of [150, 210, 430, 490]) { c.fillStyle = '#5a5e66'; c.fillRect(x - 9, 226, 18, 66); c.fillStyle = '#787c84'; c.fillRect(x - 9, 226, 18, 5); }
    yearTag(c, 3, 'SUMMER');
  },
  autumnShrine(c, t) {
    skyG(c, [[0, '#e8a860'], [1, '#f4d8a8']]); peaks(c, 65, 240, 110, '#8a5a40', '#ffe8d0');
    c.fillStyle = '#b8742a'; c.fillRect(-300, 290, 1240, 140);
    c.fillStyle = '#6a5a50'; c.fillRect(420, 190, 16, 100); c.fillRect(520, 210, 16, 80); c.fillRect(410, 186, 140, 12); c.fillStyle = '#4a3e38'; c.beginPath(); c.arc(480, 270, 30, Math.PI, 0); c.fill();
    c.save(); c.globalCompositeOperation = 'lighter'; orb(c, 480, 252, 4, 'rgba(90,255,150,.9)', 5); c.restore();
    yearTag(c, 4, 'AUTUMN');
  },
  cliffAurora(c, t) {
    skyG(c, [[0, '#020614'], [.7, '#0c1830'], [1, '#18284a']]); stars(c, 140, t, 33, 1, 240);
    c.save(); c.globalCompositeOperation = 'lighter'; for (let b = 0; b < 3; b++) { c.beginPath(); for (let x = -100; x <= 740; x += 12) { const y = 60 + b * 26 + Math.sin(x / 80 + t / 1500 + b) * 18; x > -100 ? c.lineTo(x, y) : c.moveTo(x, y); } c.strokeStyle = `rgba(${b === 1 ? '80,200,255' : '80,255,160'},.22)`; c.lineWidth = 20; c.stroke(); } c.restore();
    for (let i = 0; i < 7; i++) { c.fillStyle = `rgba(220,230,250,${.25 + i * .05})`; c.beginPath(); c.ellipse(((i * 130 + t / 40) % 900) - 120, 290 + (i % 3) * 14, 140, 22, 0, 0, 7); c.fill(); }
    c.fillStyle = '#0a0c14'; c.beginPath(); c.moveTo(180, 400); c.lineTo(230, 300); c.lineTo(470, 296); c.lineTo(500, 400); c.fill();
    yearTag(c, 5, 'DEEP WINTER');
  },
  legend(c, t) {
    skyG(c, [[0, '#120203'], [.55, '#4a0c06'], [1, '#c8451a']]);
    orb(c, 320, 250, 46, 'rgba(255,120,40,.5)', 5);
    dragonSil(c, 320, 150 + Math.sin(t / 900) * 6, 1.25, t, true);
    peaks(c, 3, 300, 70, '#1a0604'); ridge(c, 9, 330, 22, '#0b0302', 14);
    for (let i = 0; i < 9; i++) flame(c, 30 + i * 75, 318 + (i % 2) * 8, 10, 26, t, i);
  },
  wardens(c, t, s) {
    BG.legend(c, t);
    const k = Math.min(1, t / 3500);
    for (let i = 0; i < 7; i++) { const x = 60 + i * 87, y = 330; chain(c, x, y - 34, 320 + (i - 3) * 18, 170, k, t); }
  },
  valleyDay(c, t) {
    skyG(c, [[0, '#5aa0e0'], [.7, '#bfe2f0'], [1, '#e8f4e0']]);
    peaks(c, 11, 210, 120, '#7a8ea8', '#eef4ff'); peaks(c, 5, 245, 80, '#56708a', '#dfe9f5'); ridge(c, 4, 280, 30, '#3d6b3a');
    for (let i = 0; i < 6; i++) house(c, 150 + i * 62, 300, 34, 22, '#6a4a34', '#8a3a2a', false, t);
    ridge(c, 8, 330, 10, '#2f5a2c', 12);
  },
  ridgeSunset(c, t, s) {
    const k = Math.min(1, t / 14000);
    skyG(c, [[0, mix('#3a2a6a', '#120a2a', k)], [.45, mix('#e0603a', '#6a2a4a', k)], [.8, mix('#ffc070', '#c06040', k)], [1, '#ffdca0']]);
    stars(c, 90, t, 9, k * 1.2, 160);
    orb(c, 470, 220 + k * 50, 22, 'rgba(255,214,140,.95)', 4);
    peaks(c, 21, 262, 95, '#5a3a5a', '#e8c0c8'); peaks(c, 13, 286, 62, '#3a2440', '#c89aa8');
    ridge(c, 6, 300, 18, '#24162a', 12);
    for (let i = 0; i < 7; i++) { const x = 120 + i * 58; c.fillStyle = `rgba(255,190,110,${.5 + Math.sin(t / 500 + i) * .2})`; c.fillRect(x, 312 + (i % 3) * 5, 2, 2); }
    wallDraw(c, 320);
  },
  hands(c, t, s) {
    skyG(c, [[0, '#1a1030'], [1, '#c06040']]); stars(c, 40, t, 4, .7, 140);
    c.fillStyle = '#5c5550'; c.fillRect(-300, 260, 1240, 200);
    const skins = (s.handSkins || ['#e4a47c']);
    for (let i = 0; i < skins.length; i++) {
      const at = 400 + i * 650; if (t < at) continue;
      const u = Math.min(1, (t - at) / 400), side = i % 2 ? 1 : -1, y = 250 - i * 14;
      const x = 320 + side * (1 - u) * 260;
      c.fillStyle = mix(skins[i], '#000000', .35); c.beginPath(); c.ellipse(x + side * 6, y + 4, 46, 16, 0, 0, 7); c.fill();
      c.fillStyle = skins[i]; c.beginPath(); c.ellipse(x, y, 44, 15, 0, 0, 7); c.fill();
      c.fillStyle = mix(skins[i], '#000000', .2); for (let f = 0; f < 4; f++) c.fillRect(x - side * 20 + side * f * 9 - 3, y - 10, 7, 4);
      c.fillRect(x + side * 30, y + 2, 14 * side, 6);
    }
    if (t > 400 + skins.length * 650) { c.save(); c.globalCompositeOperation = 'lighter'; orb(c, 320, 200, 8, 'rgba(90,255,150,.6)', 6); c.restore(); }
  },
  ridgeNight(c, t) {
    skyG(c, [[0, '#04050c'], [.7, '#121a2c'], [1, '#2a2030']]); stars(c, 120, t, 2, 1, 200);
    peaks(c, 31, 210, 130, '#0c1018', '#3a4458');
    // the road down the ridge, and torches pouring down it
    c.strokeStyle = '#1a1c22'; c.lineWidth = 6; c.beginPath(); c.moveTo(560, 110); c.quadraticCurveTo(420, 170, 470, 210); c.quadraticCurveTo(520, 250, 330, 290); c.stroke();
    ridge(c, 12, 300, 14, '#07090e', 10);
    for (let i = 0; i < 46; i++) { const u = ((t / 16000) + i / 46) % 1, k2 = Math.min(1, t / 6000) * 46 > i ? 1 : 0; if (!k2) continue;
      let x, y; if (u < .5) { const v = u / .5; x = 560 - 140 * v + 0 * v; y = 110 + 100 * v; } else { const v = (u - .5) / .5; x = 470 - 140 * v; y = 210 + 80 * v; }
      c.save(); c.globalCompositeOperation = 'lighter'; orb(c, x + Math.sin(i) * 3, y, 1.4, 'rgba(255,170,70,.95)', 4); c.restore(); }
    bridgeDraw(c, 280, 380, 300, '#0e0c0c');
  },
  villageFire(c, t) {
    skyG(c, [[0, '#0a0303'], [.6, '#3a0e06'], [1, '#a03a10']]);
    peaks(c, 41, 200, 120, '#120606');
    for (let i = 0; i < 6; i++) { const x = -40 + i * 120; house(c, x, 300, 70, 46, '#140808', '#1e0a08', false, t); flame(c, x + 35, 254, 26, 46, t, i); }
    ridge(c, 2, 330, 8, '#0a0404', 10);
  },
  bridgeSmoke(c, t) {
    skyG(c, [[0, '#0a0606'], [.6, '#2a0c08'], [1, '#6a2410']]);
    flame(c, 60, 300, 30, 60, t, 1); flame(c, 590, 300, 34, 70, t, 4); flame(c, 140, 304, 18, 34, t, 2);
    c.fillStyle = '#130b09'; c.fillRect(-300, 300, 1240, 120); bridgeDraw(c, 220, 640, 290, '#1a1210');
  },
  bridgeFg(c, t) { c.fillStyle = 'rgba(40,30,30,.0)'; },
  eyes(c, t, s) {
    c.fillStyle = '#000'; c.fillRect(-300, -300, 1240, 960);
    // green threads of mana radiate across the dark
    const r = rng(5), k = Math.min(1, t / 2500);
    c.save(); c.globalCompositeOperation = 'lighter';
    for (let i = 0; i < 40; i++) { const a = r() * Math.PI * 2, len = (120 + r() * 380) * k, x0 = 320 + Math.cos(a) * 40, y0 = 160 + Math.sin(a) * 20;
      c.strokeStyle = `rgba(90,255,150,${.18 + .2 * Math.sin(t / 300 + i)})`; c.lineWidth = 1; c.beginPath(); c.moveTo(x0, y0);
      c.quadraticCurveTo(x0 + Math.cos(a + 1) * len * .4, y0 + Math.sin(a + 1) * len * .4, x0 + Math.cos(a) * len, y0 + Math.sin(a) * len); c.stroke(); }
    c.restore();
  },
  caveDawn(c, t) {
    skyG(c, [[0, '#2a3048'], [.6, '#8a6a7a'], [1, '#e8b088']]);
    peaks(c, 51, 230, 160, '#3a3440', '#d8d0d8'); peaks(c, 17, 270, 110, '#2a2430');
    c.fillStyle = '#1c1820'; c.beginPath(); c.moveTo(380, 360); c.lineTo(420, 200); c.lineTo(560, 160); c.lineTo(700, 200); c.lineTo(700, 360); c.fill();
    c.fillStyle = '#050406'; c.beginPath(); c.ellipse(500, 250, 30, 44, 0, Math.PI, 0); c.lineTo(530, 300); c.lineTo(470, 300); c.fill();
    c.strokeStyle = '#3c3440'; c.lineWidth = 10; c.beginPath(); c.moveTo(-40, 340); c.quadraticCurveTo(250, 320, 480, 298); c.stroke();
  },
  blizzard(c, t) {
    skyG(c, [[0, '#8a9ab0'], [1, '#e8eef4']]);
    for (let i = 0; i < 9; i++) deadTree(c, -40 + i * 90 + (i % 2) * 30, 300 - (i % 3) * 8, 1 + (i % 3) * .2, `rgba(60,70,84,${.35 + (i % 3) * .2})`);
    c.fillStyle = '#f4f8fc'; c.fillRect(-300, 300, 1240, 120);
    c.fillStyle = 'rgba(255,255,255,.35)'; c.fillRect(-300, -300, 1240, 960);
  },
  seasons(c, t, s) {
    const year = Math.min(6, Math.floor(t / (s.yearMs || 2600))), q = (t % (s.yearMs || 2600)) / (s.yearMs || 2600);
    const SK = [['#9ac8e8', '#e8f0f4', '#f2f6f8'], ['#c8e0f0', '#cfe8c0', '#7aa86a'], ['#e8c890', '#f0b070', '#b8742a'], ['#7a8aa0', '#c8d0d8', '#eef2f6']];
    const sea = SK[Math.floor(t / ((s.yearMs || 2600) / 4)) % 4];
    skyG(c, [[0, sea[0]], [1, sea[1]]]);
    peaks(c, 61, 230, 130, mix(sea[0], '#2a3040', .6), '#ffffff');
    c.fillStyle = sea[2]; c.fillRect(-300, 290, 1240, 140);
    for (const x of [220, 270, 380, 430]) { c.fillStyle = '#5a5e66'; c.fillRect(x - 8, 240, 16, 52); c.fillStyle = '#787c84'; c.fillRect(x - 8, 240, 16, 5); }
    c.fillStyle = 'rgba(0,0,0,.5)'; c.font = '700 14px "Press Start 2P"'; c.textAlign = 'right'; c.fillText('YEAR ' + (year + 1), 620, 40); c.fillStyle = '#fff'; c.fillText('YEAR ' + (year + 1), 618, 38);
  },
  moonRoof(c, t) {
    skyG(c, [[0, '#04060e'], [.7, '#101a30'], [1, '#1a2238']]); stars(c, 150, t, 12, 1, 260);
    orb(c, 470, 90, 34, 'rgba(240,244,255,.95)', 3);
    tree(c, 40, 360, 2.2, '#05070c'); tree(c, 610, 360, 2.6, '#05070c'); tree(c, 560, 360, 1.8, '#070a10');
    c.fillStyle = '#0a0c14'; c.beginPath(); c.moveTo(130, 360); c.lineTo(130, 270); c.lineTo(320, 200); c.lineTo(510, 270); c.lineTo(510, 360); c.fill();
    c.fillStyle = '#141824'; c.fillRect(300, 196, 40, 6);
  },
  millNight(c, t) {
    skyG(c, [[0, '#02030a'], [1, '#121a24']]); stars(c, 60, t, 22, .6, 150);
    for (let i = 0; i < 12; i++) tree(c, -30 + i * 60, 330 + (i % 2) * 10, 1.6 + (i % 3) * .3, '#04060a');
    c.fillStyle = '#080a0e'; c.fillRect(-300, 320, 1240, 100);
  },
  citadel(c, t, s) {
    skyG(c, [[0, '#0a0c14'], [.6, '#2a2e40'], [1, '#4a3a40']]);
    const r = rng(9); for (let i = 0; i < 8; i++) { c.fillStyle = 'rgba(10,10,16,.6)'; c.beginPath(); c.ellipse((r() * 900 - 100 + t / 30) % 1000 - 150, 40 + r() * 100, 90 + r() * 60, 18 + r() * 10, 0, 0, 7); c.fill(); }
    peaks(c, 71, 300, 70, '#0a0b10');
    citadel(c, 320, 300, 1, '#07080c', true, t);
    if (Math.sin(t / 900) > .985) s.flash = .5;
  },
  woods(c, t) {
    skyG(c, [[0, '#5a8a6a'], [1, '#c8e0b0']]);
    for (let i = 0; i < 14; i++) tree(c, -40 + i * 52, 330 + (i % 3) * 6, 1.6 + (i % 4) * .25, ['#1f3a28', '#28472f', '#183022'][i % 3]);
    c.fillStyle = '#2a4026'; c.fillRect(-300, 320, 1240, 100);
  }
};

/* ================= the scenes ================= */
const CINE = {
  legend: () => [
    { bg: 'legend', fx: ['embers', 'smoke'], dur: 2500, cam: [[0, 320, 200, 1.15], [9000, 320, 170, 1]], vignette: 'rgba(0,0,0,.7)', ev: [[600, () => sfx('break')]],
      lines: ['Four hundred years ago, the demon dragon Fratenaptor nearly ended the world. Even the dragons curse his name.'] },
    { bg: 'wardens', fx: ['embers'], dur: 3600, cam: [[0, 320, 220, 1.05], [6000, 320, 190, 1]], vignette: 'rgba(0,0,0,.7)',
      actors: [0, 1, 2, 3, 4, 5, 6].map(i => ({ spr: (G.man.dfolk || [])[i] || 'folk0', sil: true, x: 60 + i * 87, y: 334, dir: 'up', scale: 1.4, glowEyes: [0, -30], glowR: 3 })),
      lines: ['Seven with green eyes stood against him. History forgot what they did.', 'The people say the Drags worshipped him. That his fire lives in their blood. That you can always know a Drag by their eyes — green, and glowing.', 'They say a lot of things.'] },
    { bg: 'valleyDay', fx: ['petals'], dur: 3800, cam: [[0, 320, 120, 1.2], [5200, 320, 230, 1.1]], title: 'EMERALD BLOOD', sub: 'High in the hills, in a valley no map remembers…', titleOut: 3200,
      lines: ['High in the hills, in a valley no map remembers, the last free Drags still live in hiding.'] }
  ],
  ridgeDream: () => [
    { bg: 'ridgeSunset', dur: 2400, cam: [[0, 320, 150, 1], [4000, 320, 240, 1.25]], lines: ['Later. The two of you sit on the old wall at the edge of the village, legs dangling, looking east.'] },
    { bg: 'ridgeSunset', dur: 2000, cam: [[0, 320, 270, 1.6], [8000, 320, 255, 1.75]],
      actors: [{ spr: 'me', x: 300, y: 330, dir: 'up', scale: 1.6 }, { spr: 'kairo_kid', x: 340, y: 330, dir: 'up', scale: 1.6 }],
      lines: ['The mountains ring the valley like the walls of a bowl. Nobody climbs them. Nana — the Elder — forbids it.', ['kairo', "You ever wonder what's past them? Really past them?"],
        ['kairo', "The grown-ups say 'Hide. Stay small. The mountains keep us safe.' But I don't want to be safe, {name}."], ['kairo', 'I want to be FREE.']] },
    { dur: 600, bg: 'ridgeSunset', cam: [[0, 320, 180, 1], [3000, 320, 170, 1]], actors: [{ port: 'kairo', expr: 'happy', x: 200, y: 360, scale: 2.4, facing: 1, fade: [[0, 0], [500, 1]] }, { port: 'me', expr: 'neutral', x: 450, y: 360, scale: 2.4, facing: -1, fade: [[300, 0], [800, 1]] }] }
  ],
  oath: () => {
    const sk = h => ramp('body', h)[3];
    const C = G.S.cast ? G.S.cast.kairo.skin : 'light';
    return [
      { bg: 'ridgeSunset', dur: 3600, cam: [[0, 320, 262, 1.6], [7000, 300, 258, 1.5]],
        actors: [{ spr: 'me', x: 300, y: 330, dir: 'up', scale: 1.6 }, { spr: 'kairo_kid', x: 340, y: 330, dirs: [[0, 'up'], [600, 'left']], scale: 1.6 },
          { spr: 'tamsin_kid', path: [[0, 80, 330], [2600, 380, 330]], dirs: [[0, 'right'], [2700, 'up']], scale: 1.6 },
          { spr: 'bo_kid', path: [[300, 60, 330], [3000, 260, 330]], dirs: [[0, 'right'], [3100, 'up']], scale: 1.6 },
          { spr: 'lark_kid', path: [[600, 40, 330], [3100, 420, 330]], dirs: [[0, 'right'], [3200, 'up']], scale: 1.6, run: 1 },
          { spr: 'nix_kid', path: [[900, 20, 330], [3500, 230, 330]], dirs: [[0, 'right'], [3600, 'up']], scale: 1.6 }],
        lines: ['Footsteps on the wall. Tamsin, Bo, Lark and Nix climb up and squeeze in beside you.', ['tamsinK', 'Are you two talking about the mountains AGAIN?'], ['larkK', "Is it the climbing plan? I want in! I'm small, I can fit in cracks!"], ['nixK', 'If we climb, we climb together. All of us. Or nobody.']] },
      { bg: 'hands', handSkins: [sk(C), sk(G.S.look.skin), sk('light'), sk('black'), sk('amber'), sk('taupe')], dur: 4600, cam: [[0, 320, 210, 1.3], [4600, 320, 200, 1.4]], ev: [[4300, s => { s.flash = .6; s.flashCol = '120,255,170'; sfx('level'); }]],
        lines: [['kairo', 'Then swear it. Hands in. One day, all of us, over the top — and nobody ever makes us hide again.'], 'Six small hands stack on the old stone. Below you, the village bells start ringing for the festival.'] }
    ];
  },
  horns: () => [
    { bg: 'ridgeNight', fx: [], dur: 5200, cam: [[0, 470, 170, 1.6], [6000, 380, 220, 1.1]], vignette: 'rgba(0,0,0,.6)', ev: [[300, () => sfx('alarm')], [2600, () => sfx('alarm')]],
      lines: ['Far off, from the ridge road, a horn sounds. Then another. Then bells.', 'Torches. Hundreds of them, pouring down the ridge — straight toward the hidden bridge.'] }
  ],
  dread: () => [
    { bg: 'bridgeSmoke', fx: ['smoke', 'embers'], dur: 2400, cam: [[0, 330, 240, 1.3], [3000, 400, 230, 1.2]], artCam: [[0, 320, 170, 1], [4500, 320, 160, 1.04]], ev: [[200, s => { s.shake = 14; sfx('break'); }], [1600, s => { s.shake = 10; sfx('break'); }]],
      lines: ['The bridge groans. Something enormous walks out of the smoke.'] },
    { bg: 'bridgeSmoke', fx: ['smoke', 'embers'], dur: 4800, cam: [[0, 430, 210, 1], [5200, 480, 200, 1.15]], artCam: [[0, 250, 330, 1.05], [3800, 280, 320, 1.05], [9500, 420, 110, 1.5]], vignette: 'rgba(0,0,0,.75)',
      ev: [[900, s => { s.shake = 12; sfx('hit'); }], [2300, s => { s.shake = 12; sfx('hit'); }], [3700, s => { s.shake = 12; sfx('hit'); }]],
      actors: [{ spr: 'dread', path: [[0, 600, 300], [4600, 470, 300]], dir: 'left', scale: 3.4, glowEyes: [-2, -38], glowR: 4, greatsword: 'drag', hideOnArt: 1 }],
      lines: ['It is taller than the doorframes. Black armor, layered like the scales of something ancient. A torn cloak.', 'Behind it, a sword longer than a man is tall drags through the dirt, throwing sparks.', 'The fire bends away from it.'] },
    { bg: (c, t) => { c.fillStyle = '#050304'; c.fillRect(-300, -300, 1240, 960); }, fx: ['embers'], dur: 3800, cam: [[0, 320, 190, 1], [3800, 320, 175, 1.3]],
      actors: [{ port: 'dread', expr: 'anger', x: 320, y: 380, scale: 3.4 }], vignette: 'rgba(60,0,0,.55)',
      ev: [[2400, s => { s.shake = 30; s.flash = .4; s.flashCol = '255,40,40'; sfx('crit'); }]], bigText: ['KNEEL.', 2400],
      lines: [['dread', '…'], 'The voice doesn\'t come from a throat. It comes from the ground, the bones, the air in your lungs.'] }
  ],
  kairoSaves: () => [
    { bg: 'villageFire', fx: ['embers', 'smoke'], dur: 2000, cam: [[0, 200, 250, 1.4], [2600, 300, 250, 1.3]],
      actors: [{ spr: 'kairo_kid', path: [[0, 60, 320], [1800, 330, 320]], run: 1, dir: 'right', scale: 2.4 }],
      lines: [['kairo', 'GET AWAY FROM THEM!'], 'Kairo comes out of a burning house with his sleeves on fire. Something green blazes in his fist — the stone from the mountain.'] },
    { bg: (c, t) => { skyG(c, [[0, '#0a0303'], [1, '#3a0e06']]); }, dur: 2600, cam: [[0, 320, 180, 1.2], [2600, 320, 180, 1.05]],
      actors: [{ port: 'kairo', expr: 'anger', x: 180, y: 380, scale: 3, facing: 1 }, { port: 'dread', expr: 'anger', x: 500, y: 380, scale: 3, facing: -1 }],
      ev: [[1300, s => { s.flash = 1.2; s.flashCol = '120,255,170'; s.shake = 30; sfx('art'); }]],
      lines: ['He drives it into Dread\'s arm. The light is blinding. For the first time, the giant takes a step BACK.'] }
  ],
  awaken: () => [
    { bg: 'eyes', fx: ['mana'], dur: 3600, cam: [[0, 320, 200, .95], [4200, 320, 175, 1.5]],
      actors: [{ port: 'me', expr: artHas('me', 'sight') ? 'sight' : 'anger', x: 320, y: 400, scale: 3.6, facing: 1 }],
      ev: [[2600, s => { s.flash = 1; s.flashCol = '90,255,150'; sfx('art'); }]],
      lines: ['Something behind your eyes cracks open.', 'The world goes slow. You can SEE it — threads of green light in the air, in the stones, running through Halvard like veins.'] }
  ],
  leaving: () => [
    { bg: 'caveDawn', dur: 5600, cam: [[0, 200, 280, 1.3], [7000, 420, 260, 1.2]],
      actors: [['kairo_kidb', 0], ['tamsin_kid', 400], ['bo_kid', 800], ['lark_kid', 1200]].map(([sp, d], i) => ({ spr: sp, path: [[d, 40 - i * 20, 340], [5200 + d, 470, 300]], dir: 'right', dirs: sp === 'tamsin_kid' ? [[0, 'right'], [3600, 'left'], [4300, 'right']] : null, scale: 1.8, sil: '#1c1622' })),
      lines: ['He turns, and the children turn with him — up the forbidden slope, into the mountain.', 'Tamsin looks back once. Then she doesn\'t.', 'That is the last time you see Kairo for five years.'] }
  ],
  realmWalk: () => [
    { bg: 'blizzard', fx: ['blizzard'], dur: 5200, cam: [[0, 320, 260, 1.4], [6000, 360, 260, 1.5]],
      actors: [{ spr: 'me', path: [[0, 140, 312], [5600, 420, 312]], dir: 'right', scale: 2 }],
      lines: ['Snow. Endless snow. The wagon ruts vanished hours ago, and so did the path back.', 'The air tastes like metal. Every breath stings, like breathing in sparks.', ['me', "Ilya… I'm coming. I'm coming…"]] }
  ],
  vaneArrives: () => [
    { bg: 'blizzard', fx: ['blizzard'], dur: 3600, cam: [[0, 320, 260, 1.5], [3600, 380, 240, 1.7]],
      actors: [{ spr: 'vane', sil: '#2a3040', path: [[0, 520, 314], [3000, 420, 314]], dir: 'left', scale: 2.6 }, { spr: 'me', x: 330, y: 316, anim: 'idle', dir: 'right', scale: 2 }],
      ev: [[3100, s => { s.flash = 1; sfx('crit'); }]],
      lines: ['A shadow steps out of the storm. One sleeve, pinned and empty. One hand on a blade so clean the snow slides off it.'] }
  ],
  years1: () => [{ bg: 'hut', dur: 3000, cam: [[0, 320, 220, 1.1], [7000, 300, 230, 1.25]],
    actors: [{ spr: 'vane', x: 250, y: 330, dir: 'right', scale: 2.2 }, { spr: 'me', x: 330, y: 332, dir: 'left', scale: 2.2 }],
    lines: ['The first winter, you hate him.', 'He wakes you before dawn to breathe. He makes you carry water up the hill until your arms shake. He answers every question with another question.', ['vane', 'Why do you want to go back out there, pup?'], ['me', 'To find Ilya. And to make them pay.'], ['vane', '…Hm. Breathe first. Then we\'ll talk about paying.']] }],
  years2: () => [{ bg: 'spring', fx: ['petals'], dur: 2600, cam: [[0, 330, 250, 1.3], [6000, 320, 250, 1.45]],
    actors: [{ spr: 'rime_lupine', x: 260, y: 312, bt: 'hurt', loop: false, scale: 2.2, flip: false }, { spr: 'me', x: 380, y: 314, bt: 'combat', scale: 2.2 }, { spr: 'vane', sil: '#3a4050', x: 520, y: 300, dir: 'left', scale: 2 }],
    lines: ['The second year, in the thaw, you corner the beast that has been stealing your snares.', 'It is a mother. Two cubs shiver behind her. She is bleeding, and she would still tear your throat out to protect them.'] }],
  years3: () => [{ bg: 'summerStones', dur: 2400, cam: [[0, 320, 240, 1.15], [6000, 320, 250, 1.3]],
    actors: [{ spr: 'vane', x: 270, y: 302, bt: 'slash', fms: 140, scale: 2.2 }, { spr: 'me', x: 380, y: 302, bt: 'slash', fms: 125, scale: 2.2 }],
    lines: ['The third summer, you finally make him step back. One step. He laughs so hard he has to sit down.', 'That night he asks his worst question yet.'] }],
  years4: () => [{ bg: 'autumnShrine', fx: ['mana'], dur: 2400, cam: [[0, 400, 240, 1.2], [6000, 440, 240, 1.4]],
    actors: [{ spr: 'vane', x: 380, y: 300, dir: 'right', scale: 2.1 }, { spr: 'me', x: 450, y: 302, dir: 'left', scale: 2.2 }],
    lines: ['In the fourth autumn, he takes you to a ruined shrine and opens his hand. In his palm sits a small green stone, breathing light.'] }],
  years5: () => [{ bg: 'cliffAurora', fx: ['mana'], dur: 3000, cam: [[0, 330, 250, 1.2], [8000, 340, 240, 1.4]],
    actors: [{ spr: 'vane', x: 300, y: 300, dir: 'up', scale: 2.1 }, { spr: 'me', x: 360, y: 300, dir: 'up', scale: 2.2 }],
    lines: ['The fifth winter. The aurora is out, and the old man has not said a word all evening.', ['vane', 'Sit, pup. I have one more lesson, and it isn\'t about the sword.']] }],
  years: lines => [{ bg: 'seasons', yearMs: 2400, dur: 7 * 2400, cam: [[0, 320, 210, 1.15], [16800, 320, 230, 1.25]],
    actors: [{ spr: 'vane', x: 262, y: 300, bt: 'slash', fms: 140, scale: 2.2, flip: false }, { spr: 'me', x: 386, y: 300, bt: 'slash', fms: 130, scale: 2.2 }],
    slow: .9, lines }],
  liora: () => [
    { bg: 'woods', fx: ['petals'], dur: 2800, cam: [[0, 380, 250, 1.3], [3000, 330, 240, 1.45]],
      actors: [{ spr: 'lupine_alpha', sil: '#120e0e', x: 220, y: 330, bt: 'combat', scale: 3.2 }, { spr: 'liora', path: [[0, 560, 330], [900, 330, 300], [1300, 300, 330]], bt: 'thrust', scale: 2.6, fms: 70 }],
      ev: [[1100, s => { s.flash = .5; sfx('crit'); }]],
      lines: ['A huge black beast-man rears over a carcass — and between you and it stands a girl with a spear.'] },
    { bg: (c, t) => { skyG(c, [[0, '#2a1a2a'], [1, '#6a3a4a']]); }, fx: ['petals'], dur: 3400, cam: [[0, 320, 190, 1], [3400, 320, 180, 1.2]],
      actors: [{ port: 'liora', expr: 'neutral', x: 320, y: 380, scale: 3.2, facing: -1 }],
      lines: ['Long white hair, loose to her waist. A crimson cape. Eyes as green as yours — and not hidden at all.', 'She is, without any question, the most beautiful person you have ever seen.'] }
  ],
  millEyes: () => [
    { bg: 'millNight', dur: 4200, cam: [[0, 320, 260, 1.4], [4200, 320, 250, 1.2]],
      actors: Array.from({ length: 16 }, (_, i) => ({ draw: (c, x, y, t) => { if (t < i * 220) return; c.save(); c.globalCompositeOperation = 'lighter'; orb(c, x - 3, y, 1.2, 'rgba(90,255,150,.95)', 3); orb(c, x + 3, y, 1.2, 'rgba(90,255,150,.95)', 3); c.restore(); }, x: 40 + (i * 37) % 560 + (i % 3) * 7, y: 270 + (i * 13) % 60 })),
      lines: ['Footsteps. Many of them. Torches between the trees — and green eyes behind every one.'] },
    { bg: (c, t) => { skyG(c, [[0, '#050608'], [1, '#2a1a10']]); }, dur: 3000, cam: [[0, 320, 190, 1], [3000, 320, 180, 1.25]],
      actors: [{ port: 'kairoB', expr: 'neutral', x: 320, y: 380, scale: 3.2, facing: 1, fade: [[0, 0], [1200, 1]] }],
      lines: ['A tall figure steps into the lamplight. Long black hair in ragged strands across his face. Under it, a burn over one eye. Green eyes you would know anywhere.'] }
  ],
  roof: () => [
    { bg: 'moonRoof', fx: ['fireflies'], dur: 4200, cam: [[0, 320, 170, 1], [5000, 380, 170, 1.35]],
      actors: [{ spr: 'liora_e', x: 355, y: 222, dir: 'down', scale: 1.5, sil: '#0b0e18' }],
      lines: ['Later. Green Eclipse\'s fires burn low in the trees. Everyone who can sleep is asleep.', 'Liora is sitting on the ridge of the mill roof, moonlight caught in her white hair like frost.'] }
  ],
  greyspire: () => [
    { bg: 'citadel', dur: 5200, cam: [[0, 320, 120, 1.4], [6000, 320, 200, 1]], vignette: 'rgba(0,0,0,.7)', ev: [[400, () => sfx('alarm')]],
      lines: ['Nine days north, on a cliff above a black sea: Greyspire Citadel.', 'Somewhere inside, a girl with half a green ribbon is waiting.', 'And so is Dread.'] }
  ]
};

// tag every shot with its scene id so painted cutscene art can replace the backdrop
Object.keys(CINE).forEach(k => { const f = CINE[k]; CINE[k] = (...a) => { const sh = f(...a); sh.forEach(x => { if (!x.sceneId) x.sceneId = k; }); return sh; }; });
