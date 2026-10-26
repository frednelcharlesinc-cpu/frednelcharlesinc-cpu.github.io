/* =====================================================================
   BATTLE FX & FEEL
   Animation: knockback + white hit-flash, idle breathing (battle.js), slash marks
   and impact rings, enemies dissolving into embers, an opening camera sweep with
   letterbox bars, a glowing marker under whoever is acting, drifting motes/snow,
   a red heartbeat vignette when Ren is low, a victory flourish.
   Gameplay: CHAIN (perfect actions stack damage), BREAK FINISHER (a perfect hit on
   a broken foe), SECOND WIND (once per fight Ren survives at 1 HP), and enemy
   INTENT icons (what each enemy is about to do: melee, ranged or magic).
   ===================================================================== */
(function () {
  const BT = Battle;
  const B_ = () => BT.B;

  /* ---------------- CHAIN ---------------- */
  const Chain = {
    add(n, why) { const B = B_(); if (!B || B.cfg.leafTrain) return; B.chain = Math.min(10, (B.chain || 0) + (n || 1)); B.chainT = performance.now(); if (B.chain >= 3 && B.chain % 1 === 0) sfx('blip'); B.bestChain = Math.max(B.bestChain || 0, B.chain); G.S.f.bestChain = Math.max(G.S.f.bestChain || 0, B.chain); },
    reset() { const B = B_(); if (!B) return; if ((B.chain || 0) >= 3) { B.chainBroke = performance.now(); B.chainWas = B.chain; } B.chain = 0; },
    mult() { const B = B_(); return 1 + Math.min(10, (B && B.chain) || 0) * .04; }
  };
  window.Chain = Chain;
  const _rh = BT.resolveHit.bind(BT);
  BT.resolveHit = function (a, t, m, grade, opts) {
    const B = this.B; opts = opts || {};
    let finisher = false;
    if (a.side === 'p' && t.side === 'e') {
      if (grade === 'perfect') Chain.add(1); else if (grade === 'miss') Chain.reset();
      m *= Chain.mult();
      if (a.isMe && grade === 'perfect' && t.broken && !t.ko && !B.finisherOn) { finisher = true; m *= 1.25; }
    }
    if (finisher) { B.finisherOn = 1; B.letter = Math.max(B.letter || 0, 1); B.punch = .07; B.punchX = t.x; B.punchY = t.y - 30; B.hitstop = 180; B.flash = .5; B.flashCol = '255,240,200'; this.text(t, 'BREAK FINISHER', '#ffe36a', -70, true); sfx('crit'); setTimeout(() => { if (this.B) this.B.finisherOn = 0; }, 900); }
    const r = _rh(a, t, m, grade, opts);
    if (a.side === 'p' && (r === 'dodged' || r === 'parried')) Chain.reset();
    if (r === 'hit' && t.side === 'e') slashMark(t, a, grade === 'perfect' || finisher);
    return r;
  };
  const _def = BT.defend.bind(BT);
  BT.defend = function (e, t, h) {
    return _def(e, t, h).then(r => { try { if (t.side === 'p') { if (r === 'pparry' || r === 'pdodge') Chain.add(1); else if (r === 'parry' || r === 'dodge') { } else Chain.reset(); } } catch (x) { } return r; });
  };

  /* ---------------- hits: knockback, flash, slash marks, dissolves, SECOND WIND ---------------- */
  function slashMark(t, a, big) {
    const B = B_(); if (!B) return;
    const col = a && a.isMe ? (a.glow ? '120,255,170' : '235,255,245') : a && a.side === 'p' ? '255,235,200' : '255,200,190';
    B.fx.push({ slashm: 1, x: t.x, y: t.y - 32 * BT_SCALE * (t.size || 1) * .9, ang: rnd(-.9, -.35) * (Math.random() < .5 ? 1 : -1), col, big, t: 0, life: big ? 320 : 240 });
    B.fx.push({ ringfx: 1, x: t.x, y: t.y - 30 * BT_SCALE * (t.size || 1) * .9, col, t: 0, life: big ? 380 : 260, R: big ? 46 : 30 });
  }
  const _dmg = BT.damage.bind(BT);
  BT.damage = function (t, dmg, big) {
    const B = this.B;
    // Second Wind — once per fight, never in fights you're meant to lose
    if (B && t.isMe && dmg >= t.hp && t.hp > 1 && !B.secondWind && !B.cfg.tutorial && !B.cfg.leafTrain && !B.actors.some(x => x.side === 'e' && x.E && x.E.fixed)) {
      B.secondWind = 1; dmg = t.hp - 1; G.S.f.secondWind = 1;
      const r = _dmg(t, dmg, big);
      const heal = Math.round(t.maxHp * .15); t.hp = Math.min(t.maxHp, t.hp + heal);
      this.text(t, 'NOT YET!', '#7dffb0', -70, true); this.text(t, `SECOND WIND +${heal}`, '#7dffb0', -50);
      B.flash = .6; B.flashCol = '120,255,170'; B.letter = 1; sfx('art'); this.spark(t.x, t.y - 30, '#7dffb0', 28); this.facePop(t, ['anger', 'shout', 'power']);
      setTimeout(() => { if (this.B === B) B.letter = 0; }, 1200); this.hud(); Chain.reset();
      return r;
    }
    const wasAlive = t.hp > 0, r = _dmg(t, dmg, big);
    if (!B || dmg <= 0) return r;
    // knockback away from the hit, and a white flash
    t.flashT = big ? 120 : 80; t.kbv = (t.side === 'e' ? -1 : 1) * (big ? 16 : 9);
    if (t.side === 'p') { if (t.isMe) Chain.reset(); }
    if (wasAlive && t.hp <= 0) dissolve(t);
    return r;
  };
  function dissolve(t) {
    const B = B_(); if (!B) return;
    const drag = t.E && t.E.drag, col = t.side === 'p' ? ['#ff8080', '#ffffff'] : drag ? ['#7dffb0', '#46ff95', '#e8fff4'] : t.E && t.E.spectral ? [t.E.spectral, '#ffffff'] : ['#ffb070', '#ff6a3a', '#3a3030', '#8a8078'];
    const s = BT_SCALE * (t.size || 1);
    for (let i = 0; i < 46; i++) B.fx.push({ mote: 1, x: t.x + rnd(-14, 14) * s, y: t.y - rnd(4, 58) * s, vx: rnd(-.4, .4), vy: rnd(-1.6, -.4), t: -rnd(0, 500), life: rnd(700, 1300), col: pick(col), r: rnd(1, 2.6) });
    B.fx.push({ ringfx: 1, x: t.x, y: t.y - 4, col: drag ? '125,255,176' : '255,200,160', t: 0, life: 520, R: 54, flat: 1 });
  }

  /* ---------------- per-frame ---------------- */
  const _up = BT.update.bind(BT);
  BT.update = function (dt) {
    const B = this.B;
    if (B) {
      for (const a of B.actors) {
        if (a.flashT > 0) a.flashT -= dt;
        // spring the knockback back to zero
        if (a.kbv || a.kbx) { a.kbx = (a.kbx || 0) + (a.kbv || 0); a.kbv = (a.kbv || 0) * .45; a.kbx *= Math.pow(.82, dt / 16); if (Math.abs(a.kbx) < .2 && Math.abs(a.kbv) < .2) { a.kbx = 0; a.kbv = 0; } }
      }
      B.age = (B.age || 0) + dt;
      if (B.letter > 0 && !B.finisherOn) B.letter = Math.max(0, B.letter - dt / 1100);
      // drifting motes / snow
      B.amb = B.amb || [];
      const snow = B.bdKey === 'snow', W = G.view.w, H = G.view.h;
      while (B.amb.length < (snow ? 60 : 18)) B.amb.push({ x: Math.random() * W, y: Math.random() * H, s: rnd(.5, 1.4), ph: Math.random() * 6 });
      for (const m of B.amb) { m.ph += dt / 900; if (snow) { m.y += dt * .03 * m.s; m.x += Math.sin(m.ph) * .25 - dt * .008; } else { m.y -= dt * .006 * m.s; m.x += Math.sin(m.ph) * .15; } if (m.y > H + 5) { m.y = -5; m.x = Math.random() * W; } if (m.y < -5) { m.y = H + 5; m.x = Math.random() * W; } if (m.x < -5) m.x = W + 5; }
      // low-HP heartbeat
      const me = B.actors.find(a => a.isMe);
      if (me && !me.ko && me.hp <= me.maxHp * .25 && G.settings.sfx && AC) { const now = performance.now(); if (now > (B.beat || 0)) { tone(60, .12, 'sine', .07); tone(55, .12, 'sine', .05, null, .17); B.beat = now + 950; } }
    }
    return _up(dt);
  };

  /* ---------------- drawing (inside the camera, so it moves with punches) ---------------- */
  const _r = BT.render.bind(BT);
  BT.render = function (c, t) {
    const B = this.B; if (!B) return _r(c, t);
    const W = G.view.w, H = G.view.h, age = B.age || 0;
    // opening sweep: start wide-ish and settle in
    const intro = Math.max(0, 1 - age / 850), iz = 1 + .16 * intro * intro;
    c.save();
    if (iz > 1.001) { c.translate(W / 2, H * .55); c.scale(iz, iz); c.translate(-W / 2, -H * .55); }
    _r(c, t);
    // marker under whoever is acting
    const cur = B.cur;
    if (cur && !cur.ko && !B.clashOn) { const s = BT_SCALE * (cur.size || 1), p = .55 + .3 * Math.sin(t / 160); c.save(); c.globalCompositeOperation = 'lighter'; c.strokeStyle = cur.side === 'p' ? `rgba(90,255,150,${p})` : `rgba(255,120,100,${p})`; c.lineWidth = 2; c.beginPath(); c.ellipse(cur.x + (cur.kbx || 0), cur.y + 1, 18 * s * .8, 6 * s * .8, 0, 0, 7); c.stroke(); c.restore(); }
    // slash marks, rings, motes
    for (const p of B.fx) {
      const k = Math.max(0, p.t) / p.life;
      if (p.slashm) { c.save(); c.globalCompositeOperation = 'lighter'; c.translate(p.x, p.y); c.rotate(p.ang); const L = (p.big ? 58 : 42) * Math.min(1, k * 4), a = 1 - k; c.strokeStyle = `rgba(${p.col},${a})`; c.lineCap = 'round'; c.lineWidth = (p.big ? 5 : 3.2) * (1 - k * .6); c.beginPath(); c.moveTo(-L, 0); c.quadraticCurveTo(0, -5, L, 0); c.stroke(); c.strokeStyle = `rgba(255,255,255,${a})`; c.lineWidth = 1.2; c.beginPath(); c.moveTo(-L * .8, 0); c.quadraticCurveTo(0, -4, L * .8, 0); c.stroke(); c.restore(); }
      else if (p.ringfx) { c.save(); c.globalCompositeOperation = 'lighter'; c.strokeStyle = `rgba(${p.col},${(1 - k) * .8})`; c.lineWidth = 2.5 * (1 - k) + .5; c.beginPath(); if (p.flat) c.ellipse(p.x, p.y, p.R * k, p.R * k * .3, 0, 0, 7); else c.arc(p.x, p.y, 6 + p.R * k, 0, 7); c.stroke(); c.restore(); }
      else if (p.mote) { if (p.t < 0) continue; p.x += p.vx; p.y += p.vy; p.vy *= .995; c.save(); c.globalCompositeOperation = 'lighter'; c.globalAlpha = (1 - k) * .9; c.fillStyle = p.col; c.fillRect(p.x - p.r / 2, p.y - p.r / 2, p.r, p.r); c.restore(); }
    }
    c.save(); c.fillStyle = B.bdKey === 'snow' ? 'rgba(255,255,255,.85)' : 'rgba(255,240,200,.35)'; for (const m of B.amb || []) { c.fillRect(m.x, m.y, m.s * (B.bdKey === 'snow' ? 2 : 1.4), m.s * (B.bdKey === 'snow' ? 2 : 1.4)); } c.restore();
    // enemy intent icons
    for (const a of B.actors) if (a.side === 'e' && !a.ko && !B.clashOn && a.next && a.next.hits && !(this.me() && this.me().sight)) {
      const h = a.next.hits, proj = h.some(x => x.proj), mag = h.some(x => x.anim === 'spellcast'), unp = h.some(x => x.unp);
      const icon = unp ? '!!' : proj ? '➶' : mag ? '✦' : '⚔', col = unp ? '#ff6a6a' : proj ? '#ffcf7a' : mag ? '#9fd8ff' : '#e8e8e8';
      const x = a.x + 30, y = a.y - 84 - (a.size ? (a.size - 1) * 40 : 0);
      c.save(); c.fillStyle = 'rgba(0,0,0,.7)'; c.beginPath(); c.arc(x, y, 8, 0, 7); c.fill(); c.strokeStyle = col; c.lineWidth = 1.2; c.stroke();
      c.fillStyle = col; c.font = '900 10px "Nunito"'; c.textAlign = 'center'; c.textBaseline = 'middle'; c.fillText(icon, x, y + .5); if (h.length > 1) { c.font = '900 8px "Nunito"'; c.fillText('×' + h.length, x + 11, y + 6); } c.restore();
    }
    c.restore();
    // ---- screen-space overlays ----
    // letterbox bars: opening sweep, finishers, second wind
    const L = Math.max(intro, B.letter || 0); if (L > 0.01) { const bh = H * .1 * Math.min(1, L * 1.2); c.fillStyle = '#000'; c.fillRect(0, 0, W, bh); c.fillRect(0, H - bh, W, bh); }
    // low HP vignette heartbeat
    const me = B.actors.find(a => a.isMe);
    if (me && !me.ko && me.hp <= me.maxHp * .25) { const ph = (performance.now() % 950) / 950, pulse = ph < .15 ? ph / .15 : ph < .3 ? 1 - (ph - .15) / .15 : 0; const g = c.createRadialGradient(W / 2, H / 2, H * .35, W / 2, H / 2, W * .65); g.addColorStop(0, 'rgba(160,0,0,0)'); g.addColorStop(1, `rgba(160,0,0,${.28 + pulse * .22})`); c.fillStyle = g; c.fillRect(0, 0, W, H); }
    // CHAIN meter
    const ch = B.chain || 0, now = performance.now();
    if (ch >= 2 || (B.chainBroke && now - B.chainBroke < 700)) {
      const broke = ch < 2, n = broke ? B.chainWas : ch, pop = broke ? 1 : Math.max(0, 1 - (now - (B.chainT || 0)) / 220), gold = n >= 5;
      c.save(); c.translate(W / 2, 34); c.scale(1 + pop * .25, 1 + pop * .25); c.textAlign = 'center';
      c.globalAlpha = broke ? Math.max(0, 1 - (now - B.chainBroke) / 700) : 1;
      c.font = '900 20px "Nunito"'; c.lineWidth = 4; c.strokeStyle = '#000'; const txt = broke ? `CHAIN BROKEN` : `CHAIN ×${n}`; c.strokeText(txt, 0, 0); c.fillStyle = broke ? '#ff8a8a' : gold ? '#ffd34a' : '#c9ffd8'; c.fillText(txt, 0, 0);
      if (!broke) { c.font = '800 11px "Nunito"'; c.strokeText(`+${n * 4}% damage`, 0, 15); c.fillStyle = '#e8f0ea'; c.fillText(`+${n * 4}% damage`, 0, 15); }
      c.restore();
    }
  };

  /* ---------------- setup per fight, victory flourish ---------------- */
  const _st = BT.start.bind(BT);
  BT.start = async function (cfg) { const c2 = typeof cfg === 'string' ? { enemies: [cfg] } : cfg; window.__bdKey = (c2 && c2.bd) || null; return _st(cfg); };
  const _run = BT.run.bind(BT);
  BT.run = async function () { const B = this.B; if (B) { B.bdKey = window.__bdKey || (SCENES[G.S.map] && SCENES[G.S.map].bd) || 'field'; B.age = 0; B.chain = 0; } return _run(); };
  const _vic = BT.victory.bind(BT);
  BT.victory = async function () {
    const B = this.B;
    try {
      if (B && !B.cfg.leafTrain) {
        for (const a of B.actors) if (a.side === 'p' && !a.ko) { a.anim = 'jump'; a.frame = 0; a.fn = 5; a.fms = 90; a.once = true; a.at = 0; a.loopAnim = 'combat'; this.spark(a.x, a.y - 40, a.isMe ? '#7dffb0' : '#ffe36a', 10); }
        const me = B.actors.find(a => a.isMe); if (me && !me.ko) { B.fx.push({ ringfx: 1, x: me.x, y: me.y - 4, col: '125,255,176', t: 0, life: 600, R: 40, flat: 1 }); if (!G.S.kid) this.text(me, '— click —', '#cfe8ff', -50); }
        if ((B.bestChain || 0) >= 5) this.text(me || B.actors[0], `BEST CHAIN ×${B.bestChain}`, '#ffd34a', -80, true);
        await wait(450);
      }
    } catch (e) { }
    return _vic();
  };
})();
