'use strict';
/* ================= REALM OF NO RETURN: weather, mana sickness, cultivation ================= */
const Weather = {
  kind: null, next: 0, parts: [], fade: 0, forced: null,
  KINDS: { snow: 'Snow drifts down through the dead trees.', blizzard: 'A blizzard howls in out of nowhere.', clear: 'The sky tears open. Green light ripples overhead.', manastorm: 'The air thickens and glows. A mana storm.' },
  start(kind) { this.kind = kind || 'snow'; this.next = G.t + rnd(16000, 26000); this.parts = []; this.fade = 0; },
  stop() { this.kind = null; this.parts = []; },
  set(kind, quiet) { if (this.kind === kind) return; this.kind = kind; this.next = G.t + rnd(16000, 26000); this.fade = 0; if (!quiet && G.mode === 'world') toast(this.KINDS[kind], 2600); },
  update(dt) {
    if (!this.kind) return;
    if (!this.forced && G.t > this.next && G.mode === 'world' && !World.busy) {
      const opts = ['snow', 'blizzard', 'clear', 'manastorm'].filter(k => k !== this.kind); this.set(pick(opts));
    }
    if (this.forced && this.kind !== this.forced) this.set(this.forced, true);
    this.fade = Math.min(1, this.fade + dt / 1500);
    const W = G.view.w, H = G.view.h;
    const want = { snow: 70, blizzard: 220, clear: 12, manastorm: 60 }[this.kind];
    while (this.parts.length < want) this.parts.push({ x: Math.random() * W, y: Math.random() * H, s: rnd(.6, 1.6), p: Math.random() * 6 });
    if (this.parts.length > want) this.parts.length = want;
    const k = dt / 16;
    for (const p of this.parts) {
      if (this.kind === 'blizzard') { p.x -= 4.5 * p.s * k; p.y += 2.6 * p.s * k; }
      else if (this.kind === 'manastorm') { p.y -= .5 * p.s * k; p.x += Math.sin(G.t / 600 + p.p) * .4 * k; }
      else { p.y += .7 * p.s * k; p.x += Math.sin(G.t / 900 + p.p) * .3 * k; }
      if (p.y > H + 4) { p.y = -4; p.x = Math.random() * W; } if (p.y < -4) { p.y = H + 4; p.x = Math.random() * W; }
      if (p.x < -4) { p.x = W + 4; p.y = Math.random() * H; } if (p.x > W + 4) p.x = -4;
    }
  },
  render(c, t) {
    if (!this.kind) return;
    const W = G.view.w, H = G.view.h, a = this.fade;
    if (this.kind === 'blizzard') { c.fillStyle = `rgba(120,140,170,${.42 * a})`; c.fillRect(0, 0, W, H);
      const g = c.createRadialGradient(W / 2, H / 2, H * .25, W / 2, H / 2, W * .7); g.addColorStop(0, 'rgba(230,238,248,0)'); g.addColorStop(1, `rgba(230,238,248,${.55 * a})`); c.fillStyle = g; c.fillRect(0, 0, W, H); }
    if (this.kind === 'snow') { c.fillStyle = `rgba(90,110,140,${.12 * a})`; c.fillRect(0, 0, W, H); }
    if (this.kind === 'manastorm') { c.fillStyle = `rgba(40,200,120,${.16 * a})`; c.fillRect(0, 0, W, H); }
    if (this.kind === 'clear') {
      c.save(); c.globalCompositeOperation = 'lighter';
      for (let b = 0; b < 3; b++) {
        c.beginPath();
        for (let x = 0; x <= W; x += 12) { const y = 30 + b * 22 + Math.sin(x / 70 + t / 1400 + b) * 14; x ? c.lineTo(x, y) : c.moveTo(x, y); }
        c.strokeStyle = `rgba(${b === 1 ? '80,200,255' : '80,255,160'},${.18 * a})`; c.lineWidth = 16; c.stroke();
      }
      c.restore();
    }
    for (const p of this.parts) {
      if (this.kind === 'manastorm') { c.fillStyle = `rgba(110,255,170,${.6 * a})`; c.fillRect(p.x, p.y, 2 * p.s, 2 * p.s); }
      else {
        const w = this.kind === 'blizzard' ? 4 * p.s : 2 * p.s, h = this.kind === 'blizzard' ? 1.6 * p.s : 2 * p.s;
        c.fillStyle = `rgba(70,90,120,${.55 * a})`; c.fillRect(p.x + 1, p.y + 1, w, h);
        c.fillStyle = `rgba(255,255,255,${.95 * a})`; c.fillRect(p.x, p.y, w, h);
      }
    }
  }
};
const Realm = {
  warned: false,
  step() {
    const S = G.S, s = S.stats; if (!World.scene || !World.scene.realm) return;
    const heavy = Weather.kind === 'blizzard' || Weather.kind === 'manastorm';
    if (!S.f.cultivation) {
      if (S.steps % 2 === 0) { s.hp = Math.max(1, s.hp - (heavy ? 2 : 1)); UI.hud(); }
      if (!this.warned) { this.warned = true; toast('The air burns your lungs. <b style="color:#ff8a8a">Mana sickness</b> — every step drains your HP.', 3600); }
    } else if (S.steps % 2 === 0 && s.mp < s.maxMp) { s.mp = Math.min(s.maxMp, s.mp + (heavy ? 2 : 1)); UI.hud(); }
  }
};
/* breathing minigame: tap A as the pulse fills the circle */
function breathe(need) {
  Dlg.close();
  return new Promise(res => {
    const ov = document.createElement('div'); ov.className = 'ov'; ov.style.background = 'rgba(2,10,6,.82)'; ov.style.zIndex = 45; ov.style.flexDirection = 'column'; ov.style.gap = '10px';
    ov.innerHTML = `<div style="font-family:'Press Start 2P';color:#46ff95;font-size:13px">TOMB BREATH</div><canvas width="240" height="240" style="width:min(52vh,240px);height:min(52vh,240px)"></canvas>
      <div id="brTxt" style="font-size:16px;text-align:center;max-width:420px">Breathe in as the light swells. Tap <b>A</b> (or tap here) the moment it fills the ring.</div><div id="brCnt" style="color:#93ab9b"></div>`;
    document.body.appendChild(ov);
    const cv2 = ov.querySelector('canvas'), x = cv2.getContext('2d'); let ok = 0, t0 = performance.now(), period = 2200, done = false, lock = 0;
    const cnt = () => ov.querySelector('#brCnt').textContent = '●'.repeat(ok) + '○'.repeat(need - ok);
    cnt();
    const phase = () => ((performance.now() - t0) % period) / period; window.__brPhase = phase;
    const tap = e => {
      if (e) e.preventDefault(); if (done || performance.now() < lock) return;
      const p = phase(), d = Math.min(Math.abs(p - .5), 1);
      if (d < .07) { ok++; sfx('perfect'); ov.querySelector('#brTxt').textContent = ['Good. The air goes in green and comes out clean.', 'Again. Slower. Let it fill you.', 'There. Don\'t fight the poison. Drink it.'][Math.min(ok - 1, 2)]; period += 150; }
      else { sfx('miss'); ov.querySelector('#brTxt').textContent = p < .5 ? 'Too soon. You gulped it. Wait for it to fill.' : 'Too late. You held it too long — it burns.'; }
      lock = performance.now() + 350; cnt();
      if (ok >= need) { done = true; window.__brPhase = null; setTimeout(() => { ov.remove(); Input.on('a', UI.routeA); res(); }, 700); }
    };
    ov.addEventListener('pointerdown', tap); Input.on('a', () => tap());
    const draw = () => {
      if (done && !ov.isConnected) return;
      const p = phase(), r = 20 + 90 * Math.sin(p * Math.PI);
      x.clearRect(0, 0, 240, 240);
      x.strokeStyle = 'rgba(255,255,255,.55)'; x.lineWidth = 3; x.beginPath(); x.arc(120, 120, 104, 0, 7); x.stroke();
      const g = x.createRadialGradient(120, 120, 2, 120, 120, r); g.addColorStop(0, 'rgba(160,255,200,.9)'); g.addColorStop(1, 'rgba(40,200,110,.15)');
      x.fillStyle = g; x.beginPath(); x.arc(120, 120, r, 0, 7); x.fill();
      requestAnimationFrame(draw);
    };
    draw();
  });
}
