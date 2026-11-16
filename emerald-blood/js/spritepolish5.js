/* SPRITE POLISH V (Chat C, 2026-11-16)
   · NIGHT LIGHT ON SPRITES: after dusk, lamps, windows and fires light the side of anyone standing near them in the light's own colour
     (fires flicker). Uses Ambient.mapLights, so every lamp and fire B places already counts.
   · FIRESIDE: at a fire after dark, embers rise; anyone who stands still by the fire long enough starts to doze (a drifting "z").
   · BOSS ENTRANCES: a boss fight opens with the boss as a black silhouette with a red edge, then a flash reveal, then its name stamped across the screen.
   Off switch: G.settings.polish = false (or polishOff: { nightlight, fireside, bossintro }). */
(function () {
  const on = (k) => !(G.settings && (G.settings.polish === false || (G.settings.polishOff && G.settings.polishOff[k])));
  const MAIN = () => document.getElementById('game');
  const night = () => { try { return typeof Ambient !== 'undefined' ? Ambient.night || 0 : 0; } catch (e) { return 0; } };
  const lights = () => (typeof Ambient !== 'undefined' && Ambient.mapLights) || [];
  const rgbHex = (c) => '#' + c.split(',').map(v => Math.max(0, Math.min(255, Math.round(+v / 8) * 8)).toString(16).padStart(2, '0')).join('');

  /* ---------- night light on every world sprite ---------- */
  if (typeof HD !== 'undefined' && window.SPolish) {
    const _dI = HD.dI.bind(HD);
    HD.dI = function (c, img, sx, sy, sw, sh, dx, dy, dw, dh) {
      _dI(c, img, sx, sy, sw, sh, dx, dy, dw, dh);
      try {
        if (!img || !img.__hd || G.mode !== 'world' || !c || c.canvas !== MAIN() || !on('nightlight')) return;
        const n = night(); if (n < .2) return; const L = lights(); if (!L.length) return;
        const T = c.getTransform(), px = T.a * (dx + dw / 2) + T.c * (dy + dh) + T.e, py = T.b * (dx + dw / 2) + T.d * (dy + dh) + T.f;
        const S0 = MAIN().width / ((G.view && G.view.w) || MAIN().width), wx = px / S0 + World.cam.x, wy = py / S0 + World.cam.y;
        let best = null, bi = 0;
        for (const l of L) { const d = Math.hypot(l.x - wx, (l.y - wy) * 1.2), R = (l.r || 60) * 1.4; if (d < R) { const i = (1 - d / R); if (i > bi) { bi = i; best = l; } } }
        if (!best) return;
        const fire = /255,140,50/.test(best.c), fl = fire ? .8 + .2 * Math.sin(performance.now() / 70 + best.x) : 1;
        const m = window.SPolish.mask(img, sx, sy, sw, sh, 'col:' + rgbHex(best.c));
        c.save(); c.globalCompositeOperation = 'lighter'; c.globalAlpha *= Math.min(.55, bi * Math.min(1, (n - .2) / .4) * .55 * fl); c.drawImage(m, dx, dy, dw, dh); c.restore();
      } catch (e) { }
    };
  }

  /* ---------- fireside: embers and dozing ---------- */
  if (typeof Ent !== 'undefined') {
    const EMB = [];
    let embFr = -1, FR = 0; (function tick() { FR++; requestAnimationFrame(tick); })();
    const _draw = Ent.prototype.draw;
    Ent.prototype.draw = function (c, cx, cy, t) {
      const r = _draw.call(this, c, cx, cy, t);
      try {
        if (!on('fireside') || G.mode !== 'world' || night() < .35) return r;
        const now = performance.now(), fires = lights().filter(l => /255,140,50/.test(l.c));
        if (!fires.length) return r;
        // embers: drawn once a frame, by whoever is drawn first
        if (embFr !== FR) {
          embFr = FR;
          for (const f of fires) if (Math.abs(f.x - cx - G.view.w / 2) < G.view.w && Math.random() < .25) EMB.push({ x: f.x + (Math.random() - .5) * 12, y: f.y - 4, t: now, life: 900 + Math.random() * 700, vx: (Math.random() - .5) * .3 });
          for (let i = EMB.length - 1; i >= 0; i--) { const p = EMB[i], k = (now - p.t) / p.life; if (k >= 1) { EMB.splice(i, 1); continue; }
            const dt = (now - p.t) / 16; c.fillStyle = `rgba(255,${150 + Math.round(80 * (1 - k))},60,${.9 * (1 - k)})`; c.fillRect(p.x - cx + p.vx * dt + Math.sin(dt / 8) * 1.5, p.y - cy - dt * .7, 1.6, 1.6); }
          if (EMB.length > 120) EMB.splice(0, EMB.length - 120);
        }
        // dozing by the fire
        if (this.move) { this.__still = 0; return r; }
        const near = fires.some(f => Math.hypot(f.x - this.px, f.y - this.py) < 90);
        if (!near) { this.__still = 0; return r; }
        if (!this.__still) this.__still = now;
        if (now - this.__still > (this.isPlayer ? 9000 : 5000)) {
          const h = HD.OW_H || 40, x = this.px - cx + 6, y = this.py - cy - h * .95;
          c.save(); c.font = '800 9px Nunito, sans-serif'; c.textAlign = 'left';
          for (let i = 0; i < 3; i++) { const k = ((now / 1400) + i / 3) % 1; c.fillStyle = `rgba(220,235,255,${.85 * (1 - k)})`; c.font = `800 ${7 + i * 2}px Nunito, sans-serif`; c.fillText('z', x + k * 8 + i * 3, y - k * 14); }
          c.restore();
        }
      } catch (e) { }
      return r;
    };
  }

  /* ---------- boss entrances ---------- */
  if (typeof Battle === 'undefined') return;
  const isBoss = (a) => a && a.side === 'e' && ((a.E && (a.E.boss || a.E.raid)) || (a.size || 1) >= 1.6 || /^(rb_|rh_|boss_|lt_)/.test(a.key || ''));
  function silhouette(a) {
    try {
      const im = a.img, H = im && im.__hd; if (!H) return null; const L = H.anims.combat || H.anims.idle || [0], fr = H.frames[L[0]] || H.frames[0];
      const k = Math.min(1, 520 / fr[3]), c = document.createElement('canvas'); c.width = Math.round(fr[2] * k) + 16; c.height = Math.round(fr[3] * k) + 16; const x = c.getContext('2d');
      x.imageSmoothingEnabled = k < 1; x.drawImage(im, fr[0], fr[1], fr[2], fr[3], 8, 8, fr[2] * k, fr[3] * k);
      const col = document.createElement('canvas'); col.width = c.width; col.height = c.height; const y = col.getContext('2d');
      y.drawImage(c, 0, 0); y.globalCompositeOperation = 'source-in'; y.fillStyle = '#ff3a2a'; y.fillRect(0, 0, c.width, c.height);   // red edge
      const out = document.createElement('canvas'); out.width = c.width; out.height = c.height; const o = out.getContext('2d');
      for (const [ox, oy] of [[-3, 0], [3, 0], [0, -3], [0, 3]]) o.drawImage(col, ox, oy);
      o.drawImage(c, 0, 0); const sil = document.createElement('canvas'); sil.width = c.width; sil.height = c.height; const s2 = sil.getContext('2d');
      s2.drawImage(c, 0, 0); s2.globalCompositeOperation = 'source-in'; s2.fillStyle = '#050307'; s2.fillRect(0, 0, c.width, c.height);
      o.drawImage(sil, 0, 0);
      return { sil: out.toDataURL(), full: c.toDataURL() };
    } catch (e) { return null; }
  }
  async function intro(B) {
    const boss = B.actors.find(isBoss); if (!boss) return;
    for (let i = 0; i < 20 && !(boss.img && boss.img.__hd); i++) await new Promise(r => setTimeout(r, 50));
    const S = silhouette(boss); if (!S) return;
    const el = document.createElement('div');
    el.style.cssText = 'position:fixed;inset:0;z-index:60;background:rgba(4,2,6,.92);display:flex;align-items:center;justify-content:center;flex-direction:column;overflow:hidden;transition:opacity .35s';
    el.innerHTML = `<img style="max-height:62vh;max-width:70vw;image-rendering:pixelated;transform:scale(1.08);transition:transform 1.6s ease-out,filter .25s;filter:drop-shadow(0 0 18px rgba(255,40,30,.45))" src="${S.sil}">
      <div style="position:absolute;bottom:14%;left:0;right:0;text-align:center;font-family:'Press Start 2P',monospace;font-size:clamp(16px,4.2vw,34px);color:#ffe6d0;letter-spacing:3px;text-shadow:0 0 12px #ff3a2a,3px 3px 0 #300;opacity:0;transform:scale(2.4);transition:transform .22s cubic-bezier(.2,1.6,.4,1),opacity .15s">${(boss.name || '').toUpperCase()}</div>`;
    document.body.appendChild(el);
    const img = el.querySelector('img'), name = el.querySelector('div');
    requestAnimationFrame(() => { img.style.transform = 'scale(1)'; });
    await new Promise(r => setTimeout(r, 750));
    try { sfx('crit'); } catch (e) { }
    img.src = S.full; img.style.filter = 'brightness(3) drop-shadow(0 0 30px #fff)'; setTimeout(() => { img.style.filter = 'drop-shadow(0 0 14px rgba(255,80,60,.5))'; }, 120);
    try { document.body.animate([{ transform: 'translate(0,0)' }, { transform: 'translate(-6px,3px)' }, { transform: 'translate(5px,-4px)' }, { transform: 'translate(0,0)' }], { duration: 300 }); } catch (e) { }
    await new Promise(r => setTimeout(r, 180)); name.style.opacity = '1'; name.style.transform = 'scale(1)';
    await new Promise(r => setTimeout(r, 1100)); el.style.opacity = '0'; setTimeout(() => el.remove(), 380);
  }
  const _st = Battle.start.bind(Battle);
  Battle.start = function (cfg) {
    const p = _st(cfg);
    if (on('bossintro')) (async () => { for (let i = 0; i < 40; i++) { await new Promise(r => setTimeout(r, 50)); const B = Battle.B; if (B && B.actors.some(a => a.side === 'e')) { if (!B.__intro) { B.__intro = 1; await intro(B); } return; } } })().catch(() => { });
    return p;
  };
})();
