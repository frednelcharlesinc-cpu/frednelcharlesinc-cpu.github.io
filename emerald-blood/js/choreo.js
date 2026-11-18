/* CHOREOGRAPHY (Chat C, 2026-11-17) - owner's MUGEN vision, phase 1: every exchange reads like a fight scene.
   Visual only: never changes damage, hit chances or turn order (Chat A's rules); it reacts to what resolveHit decided.
   · EVERY SLASH VISIBLE: each hit of a combo plays its own animation (Ren: the sheathed draw, then his combo cuts in turn),
     with a short dash-step into the swing, hitstop on contact and the camera leaning in.
   · THE TARGET REACTS TO EVERY HIT: a flinch (hurt pose) and a knock-back, scaled by the blow.
   · REAL PARRIES: the defender snaps into its parry pose, the blades meet in a clash flash with sparks between them,
     time stops for a beat and the attacker is thrown back.
   · DODGES: the defender plays its dodge pose and slides out of the way.
   Off switch: G.settings.choreoOff = true */
(function () {
  if (typeof Battle === 'undefined') return;
  const off = () => G.settings && G.settings.choreoOff;
  const has = (a, an) => { try { const H = a.img && a.img.__hd || (a.isMe && Battle.B && Battle.B.renBts && Battle.B.renBts.__hd); return !!(H && H.anims && H.anims[an] && H.anims[an].length); } catch (e) { return false; } };
  const len = (a, an) => { try { const H = a.img && a.img.__hd || (a.isMe && Battle.B.renBts.__hd); return H.anims[an].length; } catch (e) { return 6; } };
  function pose(t, an, ms, holdBack) {
    if (!t || t.ko || !has(t, an)) return false;
    const n = len(t, an); t.anim = an; t.frame = 0; t.at = 0; t.fn = Math.min(n, 6); t.fms = ms; t.once = true; t.loopAnim = t.loopAnim || 'combat';
    return true;
  }

  /* 1) combos: each swing of Ren's attack is a different cut */
  const REN_COMBO = ['slash', 'cmb1', 'cmb2', 'cmb4'];
  /* BREAKTHROUGHS (owner, 2026-11-17): every rank a fighter climbs makes their attacks faster and their swings cleaner.
     Speed: animations play ~4.5% faster per rank (E 1.0 ... SSSS ~0.64). From C up their swings leave afterimages - more of them the higher they climb. */
  const rank = (a) => { try { return Math.max(0, Math.min(8, Battle.rankOf(a) | 0)); } catch (e) { return 2; } };
  const ATK = /slash|cmb|thr|thrust|cut|atk|attack|strike|bash|bite|claw|pd\d|pp|cast|spell|punch|kick|fist/;
  const _play = Battle.play.bind(Battle);
  Battle.play = function (a, anim, n, ms) {
    if (!off() && a && ms && ATK.test(anim)) { ms = Math.max(30, ms * Math.max(.64, 1 - .045 * rank(a))); a.__atkT = performance.now(); }
    const r = _play(a, anim, n, ms);
    try {
      if (!off() && a && a.isMe && !G.S.kid && a.anim === 'slash' && a.__combo != null) {
        const pick = REN_COMBO[a.__combo % REN_COMBO.length];
        if (pick !== 'slash' && has(a, pick)) { a.anim = pick; a.fn = Math.min(len(a, pick), 7); a.frame = Math.min(1, a.fn - 1); a.fms = 64; }
      }
    } catch (e) { }
    return r;
  };
  const _atk = Battle.doAttack.bind(Battle);
  Battle.doAttack = async function (a, t) { a.__combo = 0; try { return await _atk(a, t); } finally { a.__combo = null; } };

  /* 2) reactions to what each hit actually did */
  const _rh = Battle.resolveHit.bind(Battle);
  Battle.resolveHit = function (a, t, m, grade, opts) {
    const r = _rh(a, t, m, grade, opts);
    if (off() || !a || !t) return r;
    try {
      const B = this.B, S = BT_SCALE, dir = t.x > a.x ? 1 : -1, big = grade === 'perfect';
      if (a.__combo != null) a.__combo++;
      // S+ COATING FLASH: a fighter of S rank or higher has their aura on the skin - at the moment of impact it flares like steel
      const nowT = performance.now();
      if ((r === 'hit' || r === 'parried' || r === 'absorbed') && rank(t) >= 5) t.__coatT = nowT;
      if ((r === 'hit' || r === 'parried' || r === 'ko') && rank(a) >= 5) a.__coatT = nowT;
      if (r === 'hit' && !t.ko) {
        pose(t, 'hurt', big ? 70 : 55);                              // the flinch
        t.kbv = (t.kbv || 0) + dir * (big ? 10 : 5);                 // shoved along the line of the blow
        B.hitstop = Math.max(B.hitstop || 0, big ? 90 : 55);
        B.punch = Math.max(B.punch || 0, big ? .05 : .025); B.punchX = t.x; B.punchY = t.y - 30 * S;
        // the attacker's own body follows through a step
        a.kbv = (a.kbv || 0) + dir * 4;
      } else if (r === 'parried') {
        pose(t, has(t, 'parry') ? 'parry' : 'guard', 70);           // the defender's real parry pose
        const mx = (a.x + t.x) / 2, my = Math.min(a.y, t.y) - 34 * S * Math.max(a.size || 1, t.size || 1);
        B.fx.push({ clashC: 1, x: mx, y: my, t: 0, life: 420, s: 0, vx: 0, vy: 0 });
        for (let i = 0; i < 16; i++) { const an = Math.random() * 6.283, v = 2 + Math.random() * 4; B.fx.push({ clashS: 1, s: 0, x: mx, y: my, vx: Math.cos(an) * v, vy: Math.sin(an) * v - 1, t: 0, life: 300 + Math.random() * 200 }); }
        B.hitstop = Math.max(B.hitstop || 0, 130); B.shake = Math.max(B.shake || 0, 5);
        B.punch = Math.max(B.punch || 0, .04); B.punchX = mx; B.punchY = my;
        a.kbv = (a.kbv || 0) - dir * 14;                               // the attacker is thrown back off the guard
        if (has(a, 'hurt') && !a.isMe) pose(a, 'hurt', 50);
      } else if (r === 'dodged') {
        pose(t, has(t, 'dodge') ? 'dodge' : 'pdodge', 60);
      }
    } catch (e) { }
    return r;
  };

  /* 3) draw the clash: a white star where the blades meet, sparks thrown off it */
  const _render = Battle.render.bind(Battle);
  Battle.render = function (c, t) {
    const out = _render(c, t);
    try {
      const B = this.B; if (!B || !B.fx) return out;
      const now = performance.now();
      for (const f of B.fx) {
        if (!f.clashC && !f.clashS) continue;
        if (f.__t0 == null) f.__t0 = now; const k = (now - f.__t0) / f.life; if (k >= 1) { f.__dead = 1; continue; }
        c.save(); c.globalCompositeOperation = 'lighter';
        if (f.clashC) {
          const R = 34 * (1 - Math.pow(1 - k, 3)) + 8, a = 1 - k;
          const g = c.createRadialGradient(f.x, f.y, 0, f.x, f.y, R); g.addColorStop(0, `rgba(255,255,255,${a})`); g.addColorStop(.35, `rgba(255,236,170,${.8 * a})`); g.addColorStop(1, 'rgba(255,200,120,0)');
          c.fillStyle = g; c.beginPath(); c.arc(f.x, f.y, R, 0, 7); c.fill();
          c.strokeStyle = `rgba(255,255,255,${a})`; c.lineWidth = 2.5 * (1 - k) + .5;     // the star: four long points and four short
          for (let i = 0; i < 8; i++) { const an = i * Math.PI / 4 + .2, L = (i % 2 ? .5 : 1.25) * R; c.beginPath(); c.moveTo(f.x, f.y); c.lineTo(f.x + Math.cos(an) * L, f.y + Math.sin(an) * L); c.stroke(); }
        } else {
          const dt = (now - f.__t0) / 16, x = f.x + f.vx * dt, y = f.y + f.vy * dt + .08 * dt * dt;
          c.strokeStyle = `rgba(255,235,160,${1 - k})`; c.lineWidth = 1.6; c.beginPath(); c.moveTo(x, y); c.lineTo(x - f.vx * 1.6, y - (f.vy + .16 * dt) * 1.6); c.stroke();
        }
        c.restore();
      }
      if (B.fx.some(f => f.__dead)) B.fx = B.fx.filter(f => !f.__dead);
    } catch (e) { }
    return out;
  };

  /* afterimages: the last frames of a swing, left behind in a fading line */
  if (typeof HD !== 'undefined') {
    const _bt = HD.bt.bind(HD), MAIN = () => document.getElementById('game');
    const hex2 = (h) => { h = String(h || '').replace('#', ''); if (h.length === 3) h = h.split('').map(c => c + c).join(''); return h.length === 6 ? '#' + h : null; };
    const coatCol = (a) => { try { if (a.side === 'p' && typeof BURST !== 'undefined') { const D = BURST[Burst.key(a)]; if (D && D.col) return hex2(D.col); } if (typeof EBURST !== 'undefined' && EBURST[a.key]) return hex2(EBURST[a.key][2]); } catch (e) { } return '#e6f4ff'; };
    let FL = null;
    const _blit = HD.blit.bind(HD);
    HD.blit = function (c, img, fr, x, y, h, extra) {
      const r = _blit(c, img, fr, x, y, h, extra);
      if (FL && fr && window.SPolish) { const f0 = FL; FL = null; try {
        const k = h / fr[6], draw = (kind, al) => { const cv = window.SPolish.mask(img, fr[0], fr[1], fr[2], fr[3], kind + f0.col), p = cv.__pad || 0;
          c.save(); c.globalCompositeOperation = 'lighter'; c.globalAlpha *= al; c.imageSmoothingEnabled = true; c.translate(x, y);
          if (extra && extra.rot) c.rotate(extra.rot); if (extra && extra.sy) c.scale(1, extra.sy);
          c.drawImage(cv, -fr[4] * k - p * k, -fr[5] * k - p * k, cv.width * k, cv.height * k); c.restore(); };
        draw('fill:', .35 * f0.al); draw('rim:', f0.al); draw('rim:', f0.al); draw('glow:', .8 * f0.al);
      } catch (e) { } }
      return r;
    };
    HD.bt = function (c, img, anim, f, x, y, s) {
      let fl = null;
      try {
        const B0 = Battle.B;
        if (!off() && B0 && c && c.canvas === MAIN()) for (const q of B0.actors) if (q.__coatT && Math.abs(q.x - x) < 1.5 && Math.abs(q.y - y) < 1.5) {
          const dt = performance.now() - q.__coatT; if (dt < 260) fl = { col: coatCol(q), al: 1 - dt / 260 }; else q.__coatT = 0; break; }
      } catch (e) { }
      try {
        const B = Battle.B;
        if (!off() && B && c && c.canvas === MAIN() && ATK.test(String(anim))) {
          let a = null; for (const q of B.actors) if (Math.abs(q.x - x) < 1.5 && Math.abs(q.y - y) < 1.5) { a = q; break; }
          const rk = a ? rank(a) : 0;
          if (a && a.once && rk >= 2 && performance.now() - (a.__atkT || 0) < 900) {
            const n = rk >= 6 ? 3 : rk >= 4 ? 2 : 1, dir = a.side === 'p' ? 1 : -1, H = img && img.__hd, L = H && H.anims && H.anims[anim] ? H.anims[anim].length : 1;
            for (let i = n; i >= 1; i--) { const g = c.globalAlpha; c.globalAlpha = g * (.32 - i * .07);
              _bt(c, img, anim, Math.max(0, f - i), x + dir * i * 9 * (s || 1), y, s); c.globalAlpha = g; }
          }
        }
      } catch (e) { }
      FL = fl; try { return _bt(c, img, anim, f, x, y, s); } finally { FL = null; }
    };
  }

  /* DASH (owner, 2026-11-18): every dash into or out of a fight is a burst - dust kicked up at the start and the stop,
     a trail of afterimages behind the runner, and speed lines while they're moving. */
  if (Battle.dash) {
    const _dash = Battle.dash.bind(Battle);
    Battle.dash = async function (a, x, y, ms) {
      if (off() || !a || !this.B) return _dash(a, x, y, ms);
      const B = this.B, dir = Math.sign(x - a.x) || 1, dust = (px, py, n, push) => { for (let i = 0; i < n; i++) B.fx.push({ x: px + (Math.random() - .5) * 10, y: py - Math.random() * 4, vx: -dir * push * (.4 + Math.random()) + (Math.random() - .5), vy: -(.3 + Math.random() * 1.4), life: 280 + Math.random() * 260, t: 0, col: 'rgba(214,196,160,.85)', s: 2 + Math.random() * 2.5 }); };
      dust(a.x, a.y, 12, 3); a.__dashing = 1; a.__trail = [];
      try { return await _dash(a, x, y, ms); }
      finally { a.__dashing = 0; dust(a.x, a.y, 10, -2); B.shake = Math.max(B.shake || 0, 1.5); setTimeout(() => { a.__trail = null; }, 140); }
    };
  }
  if (typeof HD !== 'undefined') {
    const _bt2 = HD.bt.bind(HD), MAIN2 = () => document.getElementById('game');
    HD.bt = function (c, img, anim, f, x, y, s) {
      try {
        const B = Battle.B;
        if (!off() && B && c && c.canvas === MAIN2()) for (const a of B.actors) if (a.__trail && Math.abs(a.x - x) < 1.5 && Math.abs(a.y - y) < 1.5) {
          const T = a.__trail, now = performance.now(); if (a.__dashing) T.push([x, y, now]); while (T.length && now - T[0][2] > 130) T.shift();
          const n = T.length; for (let i = 0; i < n - 1; i += 2) { const k = (i + 1) / n, g = c.globalAlpha; c.globalAlpha = g * .3 * k; _bt2(c, img, anim, f, T[i][0], T[i][1], s); c.globalAlpha = g; }
          if (a.__dashing && n > 1) {   // speed lines along the run
            const S0 = s || 1; c.save(); c.globalCompositeOperation = 'lighter'; c.strokeStyle = 'rgba(255,255,255,.35)'; c.lineWidth = 1.2;
            for (let i = 0; i < 5; i++) { const ly = y - (8 + Math.random() * 60) * S0, len = (25 + Math.random() * 40) * S0, dx = Math.sign(x - T[0][0]) || 1; c.beginPath(); c.moveTo(x - dx * 10 * S0, ly); c.lineTo(x - dx * (10 * S0 + len), ly); c.stroke(); }
            c.restore(); }
          break; }
      } catch (e) { }
      return _bt2(c, img, anim, f, x, y, s);
    };
  }
})();
