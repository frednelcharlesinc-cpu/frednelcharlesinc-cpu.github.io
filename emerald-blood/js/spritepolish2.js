/* SPRITE POLISH II (Chat C, 2026-11-16) - story touches and more life, all in code.
   · FLASH-FORWARD LOOK: the cold open (rain, fire, the rooftop) plays drained of colour with film grain and a flicker, so it reads as "not yet".
   · VANE'S ONE CUT: when Vane draws Last Light at the black stones, a green cut tears across the whole screen and the picture cracks.
   · RIBBONS ON REN: Ilya's green ribbon on his belt once he has it; Isolde's gold ribbon beside it once he's won it (world + battle stance).
   · BODY LANGUAGE IN DIALOGUE: whoever is talking bobs while their line types; shock = a hop, anger = a shake, happy = a bounce, sad = a slump.
   · LOW HP: a fighter under a quarter of their health breathes hard and leans.
   · KO: beaten enemies crumble into ash that drifts up instead of only fading.
   Off switch: G.settings.polish = false (or polishOff: { ff, cut, ribbon, talk, lowhp, ko }). */
(function () {
  const on = (k) => !(G.settings && (G.settings.polish === false || (G.settings.polishOff && G.settings.polishOff[k])));

  /* ---------- film grain tile ---------- */
  let GRAIN = null;
  function grain() {
    if (GRAIN) return GRAIN; const c = document.createElement('canvas'); c.width = c.height = 128; const x = c.getContext('2d'), d = x.createImageData(128, 128);
    for (let i = 0; i < d.data.length; i += 4) { const v = Math.random() * 255; d.data[i] = d.data[i + 1] = d.data[i + 2] = v; d.data[i + 3] = 255; }
    x.putImageData(d, 0, 0); return (GRAIN = c);
  }

  /* ---------- cinematics: mark the cold open, decorate it; Vane's cut ---------- */
  if (typeof CINE !== 'undefined' && CINE.legend) {
    const _leg = CINE.legend;
    CINE.legend = function () {
      const shots = _leg.apply(this, arguments);
      for (const s of shots) { const l = (s.lines || [])[0], t = typeof l === 'string' ? l : (l && l.text) || ''; if (/^Rain that doesn|^Two young men on a rooftop/.test(t)) s.ff = 1; }
      return shots;
    };
  }
  if (typeof Cine !== 'undefined' && Cine.draw) {
    const _cd = Cine.draw.bind(Cine);
    Cine.draw = function (s, t) {
      const r = _cd(s, t);
      try {
        const cv = this.cv, c = this.cx, now = performance.now();
        const ff = on('ff') && s && s.ff;
        cv.style.filter = ff ? 'saturate(.3) contrast(1.18) sepia(.18) brightness(.95)' : '';
        if (ff) {
          c.save(); c.setTransform(1, 0, 0, 1, 0, 0);
          c.globalAlpha = .07; c.globalCompositeOperation = 'overlay'; const g = grain(), ox = Math.random() * 128, oy = Math.random() * 128;
          c.translate(-ox, -oy); c.fillStyle = c.createPattern(g, 'repeat'); c.fillRect(0, 0, cv.width + 128, cv.height + 128); c.translate(ox, oy);
          c.globalCompositeOperation = 'source-over'; c.globalAlpha = Math.random() < .06 ? .08 : 0; c.fillStyle = '#fff'; c.fillRect(0, 0, cv.width, cv.height);   // projector flicker
          c.globalAlpha = .1; c.fillStyle = '#000'; const sx = (now / 40) % cv.width; c.fillRect(sx, 0, 1.5, cv.height);                                         // a scratch on the film
          c.restore();
        }
        const l0 = s && s.lines && s.lines[0], first = typeof l0 === 'string' ? l0 : l0 && l0.text;
        if (on('cut') && first === 'One cut.' && s.t0) {
          const k = (now - s.t0) / 420, W = cv.width, H = cv.height, p = Math.min(1, k);
          c.save(); c.setTransform(1, 0, 0, 1, 0, 0); c.globalCompositeOperation = 'lighter';
          const x0 = -W * .05, y0 = H * .82, x1 = W * 1.05, y1 = H * .18, xe = x0 + (x1 - x0) * p, ye = y0 + (y1 - y0) * p, fade = k < 1 ? 1 : Math.max(0, 1 - (k - 1) / 3);
          for (const [w, a, col] of [[34, .18, '#2bff8a'], [14, .45, '#7dffb8'], [4, .95, '#f2fff8']]) { c.strokeStyle = col; c.globalAlpha = a * fade; c.lineWidth = w * (H / 700); c.lineCap = 'round'; c.beginPath(); c.moveTo(x0, y0); c.lineTo(xe, ye); c.stroke(); }
          if (k > 1) {   // the picture cracks along the cut
            c.globalCompositeOperation = 'source-over'; c.globalAlpha = .55 * fade; c.strokeStyle = '#d8ffe8'; c.lineWidth = Math.max(1, H / 600);
            for (let i = 0; i < 9; i++) { const q = (i + .5) / 9, bx = x0 + (x1 - x0) * q, by = y0 + (y1 - y0) * q, an = (i % 2 ? 1 : -1) * (1 + (i * 37 % 10) / 10);
              c.beginPath(); c.moveTo(bx, by); c.lineTo(bx + Math.cos(an) * H * .08, by + Math.sin(an) * H * .08); c.lineTo(bx + Math.cos(an + .4) * H * .13, by + Math.sin(an + .4) * H * .13); c.stroke(); }
          }
          if (k < .25) { c.globalCompositeOperation = 'source-over'; c.globalAlpha = (1 - k / .25) * .6; c.fillStyle = '#eafff2'; c.fillRect(0, 0, W, H); }
          c.restore();
        }
      } catch (e) { }
      return r;
    };
  }

  /* ---------- ribbons on Ren ---------- */
  function ribbons() { const f = G.S && G.S.f || {}, out = []; if (f.ribbon) out.push(['#2fcf6a', '#167a3a']); if (f.isoldeRibbon) out.push(['#ffcf3a', '#a87a12']); return out; }
  function drawRibbons(c, x, y, h, back, now, moving) {
    if (!(G.settings && G.settings.ribbons)) return;   // owner, 2026-11-17: removed (the green ribbon read as a stray string on Ren)
    const R = ribbons(); if (!R.length || !on('ribbon')) return;
    R.forEach(([col, dark], i) => {
      const bx = x + back * h * (.06 + i * .02), by = y - h * (.47 - i * .01), L = h * .13, sw = Math.sin(now / (moving ? 110 : 420) + i * 1.7) * h * (moving ? .035 : .015);
      c.save(); c.lineCap = 'round';
      for (const [d, w, cc] of [[0, h * .022, dark], [-.4, h * .014, col]]) {
        c.strokeStyle = cc; c.lineWidth = Math.max(1, w); c.beginPath(); c.moveTo(bx, by + d);
        c.quadraticCurveTo(bx + back * L * .5 + sw, by + L * .5 + d, bx + back * L * (moving ? .9 : .35) + sw * 1.6, by + L + d); c.stroke();
      }
      c.fillStyle = dark; c.fillRect(bx - h * .012, by - h * .012, h * .024, h * .024);   // the knot
      c.restore();
    });
  }

  /* ---------- dialogue: who is talking, with what face ---------- */
  const TALK = { who: null, expr: null, t0: 0 };
  if (typeof Dlg !== 'undefined' && Dlg.line) {
    const _ln = Dlg.line.bind(Dlg);
    Dlg.line = function (who, expr, text, choices) { TALK.who = who; TALK.expr = expr; TALK.t0 = performance.now(); return _ln(who, expr, text, choices); };
  }
  function talkPose(ent, now) {
    if (!on('talk') || typeof Dlg === 'undefined' || !Dlg.open || !TALK.who) return null;
    const id = String(ent.id || ''), w = TALK.who === 'me' ? (ent.isPlayer ? id : '\0') : TALK.who;
    if (!(id === w || id.split('_')[0] === w || (ent.isPlayer && TALK.who === 'me'))) return null;
    const age = now - TALK.t0; let dx = 0, dy = 0, sx = 1, sy = 1;
    if (Dlg.typing) sy = 1 + Math.abs(Math.sin(now / 95)) * .025;
    if (TALK.expr === 'shock' && age < 260) dy = -Math.sin(age / 260 * Math.PI) * 5;
    else if (TALK.expr === 'anger' && age < 400) dx = Math.sin(age / 22) * 1.4 * (1 - age / 400);
    else if (TALK.expr === 'happy' && age < 500) dy = -Math.abs(Math.sin(age / 500 * Math.PI * 2)) * 2.5;
    else if (TALK.expr === 'sad') { sy *= .975; dy = 1; }
    return { dx, dy, sx, sy };
  }

  /* ---------- world: talk poses + ribbons on Ren ---------- */
  if (typeof Ent !== 'undefined') {
    const _draw = Ent.prototype.draw;
    Ent.prototype.draw = function (c, cx, cy, t) {
      const now = performance.now(); let P = null;
      try { P = talkPose(this, now); } catch (e) { }
      let r;
      if (P && (P.dx || P.dy || P.sx !== 1 || P.sy !== 1)) {
        const fx = this.px - cx, fy = this.py - cy + 3; c.save(); c.translate(fx + P.dx, fy + P.dy); c.scale(P.sx, P.sy); c.translate(-fx, -fy);
        try { r = _draw.call(this, c, cx, cy, t); } finally { c.restore(); }
      } else r = _draw.call(this, c, cx, cy, t);
      try {
        if (this.isPlayer && !(G.S && G.S.kid) && HD.on && HD.on() && (this.dir === 'left' || this.dir === 'right' || this.dir === 'down')) {
          const h = HD.OW_H || 40, back = this.dir === 'right' ? -1 : this.dir === 'left' ? 1 : -.4;
          drawRibbons(c, this.px - cx + (P ? P.dx : 0), this.py - cy + 3 + (P ? P.dy : 0), h, back, now, !!this.move);
        }
      } catch (e) { }
      return r;
    };
  }

  /* ---------- battle: ribbons in Ren's stance, low-HP breathing, KO ash ---------- */
  if (typeof HD === 'undefined') return;
  const ASH = []; let FR = 0; (function tick() { FR++; requestAnimationFrame(tick); })();
  const _bt = HD.bt.bind(HD);
  HD.bt = function (c, img, anim, f, x, y, s) {
    const H = img && img.__hd, main = c && c.canvas === document.getElementById('game'); if (!H || !main) return _bt(c, img, anim, f, x, y, s);
    const B = typeof Battle !== 'undefined' && Battle.B, S = s || 1, now = performance.now();
    let a = null; if (B) for (const q of B.actors) if (Math.abs(q.x - x) < 1.5 && Math.abs(q.y - y) < 1.5) { a = q; break; }
    let r;
    if (a && on('lowhp') && !a.ko && a.maxHp && a.hp / a.maxHp < .25 && anim === 'combat') {
      const feet = y + 2 * S, br = Math.sin(now / 210), lean = (a.side === 'e' ? 1 : -1) * .035;
      c.save(); c.translate(x, feet); c.rotate(lean); c.scale(1 - br * .012, 1 + br * .03); c.translate(-x, -feet); r = _bt(c, img, anim, f, x, y, s); c.restore();
    } else r = _bt(c, img, anim, f, x, y, s);
    if (a && on('ko') && a.ko && a.side === 'e' && !a.__ash) {
      a.__ash = 1; const hh = (HD.BT_H || 80) * S * (a.size || 1);
      for (let i = 0; i < 34; i++) ASH.push({ x: x + (Math.random() - .5) * hh * .5, y: y - Math.random() * hh * .9, vx: (Math.random() - .3) * .5, vy: -.3 - Math.random() * .6, t: now + Math.random() * 300, life: 900 + Math.random() * 700, col: Math.random() < .3 ? '#8a8078' : Math.random() < .5 ? '#3a3430' : '#c9b8a0', r: 1.2 + Math.random() * 1.6 });
    }
    if (H.me && on('ribbon') && (anim === 'combat' || anim === 'guard')) {
      const hh = (HD.BT_H || 80) * S, back = H.faces === 'left' ? 1 : -1;
      try { drawRibbons(c, x, y + 2 * S, hh, back, now, false); } catch (e) { }
    }
    if (ASH.length && c.__ashFr !== FR) {
      c.__ashFr = FR;
      for (let i = ASH.length - 1; i >= 0; i--) { const p = ASH[i], k = (now - p.t) / p.life; if (k >= 1) { ASH.splice(i, 1); continue; } if (k < 0) continue;
        const dt = (now - p.t) / 16; c.globalAlpha = (1 - k) * .85; c.fillStyle = p.col; c.fillRect(p.x + p.vx * dt + Math.sin(dt / 7) * 2, p.y + p.vy * dt, p.r, p.r); }
      c.globalAlpha = 1;
    }
    return r;
  };
})();
