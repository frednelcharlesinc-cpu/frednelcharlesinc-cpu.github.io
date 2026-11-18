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
  const REN_COMBO = ['slash', 'cmb2', 'cmb4', 'cmb1'];
  const _play = Battle.play.bind(Battle);
  Battle.play = function (a, anim, n, ms) {
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
})();
