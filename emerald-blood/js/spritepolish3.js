/* SPRITE POLISH III (Chat C, 2026-11-16)
   · WEAPON TRAILS: every attack sweeps a short streak in the fighter's own colour (FightStyle colours: green Ren, violet Kess, ember Oren…).
   · WEATHER ON THE BODY: in snow every fighter's breath fogs; in rain water drips off them (battle), and Ren's breath fogs in snowy places in the world.
   · REN'S FACE IN BATTLE: his portrait flashes in the corner on the big moments - a PERFECT strike (grin), a perfect dodge or parry (focused),
     a heavy hit taken (shout), dropping low (glare) - using the dialogue faces we already have.
   · COUNTER FREEZE: a perfect parry freezes the fight for a beat with a lean-in zoom and a gold flash.
   · ENEMY TELLS: before a heavy hit the enemy crouches and glows orange (red = unparryable) - dodge it.
   · HITS BY SIZE: big monsters barely budge when struck, small ones get knocked back hard.
   Off switch: G.settings.polish = false (or polishOff: { trail, breath, drip, face, freeze, tell, weight }). */
(function () {
  if (typeof HD === 'undefined') return;
  const on = (k) => !(G.settings && (G.settings.polish === false || (G.settings.polishOff && G.settings.polishOff[k])));
  const MAIN = () => document.getElementById('game');
  const ATK = /slash|thrust|attack|strike|draw|art_|combo|fourdraw|heavy|special/;
  const ST = new Map(), FX = [];
  let FR = 0; (function tick() { FR++; requestAnimationFrame(tick); })();

  function snowy() {
    const B = typeof Battle !== 'undefined' && Battle.B;
    if (B) return /snow|frost|rime|ice|peak|stone/.test(String(B.bdKey || '') + String((B.cfg && B.cfg.bd) || ''));
    const id = String((typeof World !== 'undefined' && World.scene && World.scene.id) || (G.S && G.S.map) || '');
    return /snow|frost|rime|peak|north|stones|summit|glacier/.test(id);
  }
  function rainy() { const B = typeof Battle !== 'undefined' && Battle.B; if (B && B.wx) return B.wx === 'rain'; try { return WorldFeel.weather() === 'rain'; } catch (e) { return false; } }

  const _bt = HD.bt.bind(HD);
  HD.bt = function (c, img, anim, f, x, y, s) {
    const H0 = img && img.__hd, B0 = typeof Battle !== 'undefined' && Battle.B;
    let pre = null;
    if (H0 && B0 && c && c.canvas === MAIN()) {
      let a = null; for (const q of B0.actors) if (Math.abs(q.x - x) < 1.5 && Math.abs(q.y - y) < 1.5) { a = q; break; }
      if (a && !a.ko) {
        const now = performance.now(), S = s || 1, feet = y + 2 * S, sz = a.size || 1;
        // HITS BY SIZE: the knockback the battle already applied, scaled - big monsters barely budge, small ones fly
        let kb = 0; if (on('weight') && a.kbx) kb = a.kbx * ((sz >= 1.3 ? .35 : sz <= .85 ? 1.6 : 1) - 1);
        // ENEMY TELLS: on its turn, before a heavy or unparryable skill lands, it crouches and glows
        let tell = 0; const sk = a.side === 'e' && a.next, heavy = sk && sk.hits && (sk.hits.some(h => h.unp || h.m >= 1.4) || sk.hits.reduce((t, h) => t + (h.m || 0), 0) >= 1.7);
        if (on('tell') && heavy && B0.cur === a && (anim === 'combat' || anim === 'idle')) tell = .5 + .5 * Math.sin(now / 90);
        if (kb || tell) pre = { kb, tell, feet, S, sz, unp: sk && sk.hits && sk.hits.some(h => h.unp) };
      }
    }
    let r;
    if (pre) {
      c.save(); c.translate(pre.kb, 0);
      if (pre.tell) {
        const h = (HD.BT_H || 80) * pre.S * pre.sz, col = pre.unp ? '255,60,60' : '255,170,60';
        c.save(); c.globalCompositeOperation = 'lighter'; const g = c.createRadialGradient(x, pre.feet - h * .45, h * .05, x, pre.feet - h * .45, h * .6);
        g.addColorStop(0, `rgba(${col},${.5 * pre.tell})`); g.addColorStop(1, `rgba(${col},0)`); c.fillStyle = g; c.beginPath(); c.ellipse(x, pre.feet - h * .45, h * .45, h * .62, 0, 0, 7); c.fill(); c.restore();
        c.translate(x, pre.feet); c.scale(1 + .04 * pre.tell, 1 - .05 * pre.tell); c.translate(-x, -pre.feet);
      }
      try { r = _bt(c, img, anim, f, x, y, s); } finally { c.restore(); }
    } else r = _bt(c, img, anim, f, x, y, s);
    const H = img && img.__hd; if (!H || !c || c.canvas !== MAIN()) return r;
    try {
      const B = typeof Battle !== 'undefined' && Battle.B, S = s || 1, now = performance.now(), h = (HD.BT_H || 80) * S;
      let a = null; if (B) for (const q of B.actors) if (Math.abs(q.x - x) < 1.5 && Math.abs(q.y - y) < 1.5) { a = q; break; }
      const id = (H.set || '?') + '|' + Math.round(y / 4) + (H.me ? '|me' : ''); let st = ST.get(id); if (!st) ST.set(id, st = { anim: null, t0: now, br: now + Math.random() * 1500 });
      if (st.anim !== anim) { st.anim = anim; st.t0 = now; }
      const dir = H.faces === 'left' ? -1 : 1, feet = y + 2 * S, age = now - st.t0;
      // weapon trail
      if (on('trail') && ATK.test(anim) && age > 40 && age < 260 && a && !a.ko) {
        let col = '200,255,220'; try { if (typeof FightStyle !== 'undefined') col = (FightStyle.of(a) || {}).col || col; } catch (e) { }
        const p = (age - 40) / 220, cx0 = x + dir * h * .12, cy0 = feet - h * .5, R = h * .52 * (a.size || 1) / Math.max(.6, (a.size || 1));
        const a1 = -1.9 + p * 2.8, a0 = a1 - .9, fade = 1 - p;
        c.save(); c.globalCompositeOperation = 'lighter'; c.lineCap = 'round';
        if (dir < 0) { c.translate(cx0, 0); c.scale(-1, 1); c.translate(-cx0, 0); }
        for (const [w, al] of [[h * .09, .16], [h * .045, .35], [h * .015, .8]]) {
          c.strokeStyle = `rgba(${col},${al * fade})`; c.lineWidth = w; c.beginPath(); c.arc(cx0, cy0, R, a0, a1); c.stroke();
        }
        c.restore();
      }
      // breath in the cold
      if (on('breath') && a && !a.ko && snowy() && now > st.br) {
        st.br = now + 1400 + Math.random() * 900;
        for (let i = 0; i < 5; i++) FX.push({ k: 'fog', x: x + dir * h * .13, y: feet - h * .84, vx: dir * (.25 + Math.random() * .25), vy: -.08 - Math.random() * .06, t: now + i * 60, life: 1100, r: h * .02 });
      }
      // water dripping off in the rain
      if (on('drip') && a && !a.ko && rainy() && Math.random() < .05)
        FX.push({ k: 'drip', x: x + (Math.random() - .5) * h * .3, y: feet - h * (.3 + Math.random() * .55), vx: 0, vy: 1.6, t: now, life: 380, r: Math.max(1, h * .01) });
      if (FX.length && c.__p3 !== FR) {
        c.__p3 = FR;
        for (let i = FX.length - 1; i >= 0; i--) {
          const p = FX[i], k = (now - p.t) / p.life; if (k >= 1) { FX.splice(i, 1); continue; } if (k < 0) continue;
          const dt = (now - p.t) / 16, px = p.x + p.vx * dt, py = p.y + p.vy * dt;
          if (p.k === 'fog') { c.fillStyle = `rgba(235,242,250,${.32 * (1 - k)})`; c.beginPath(); c.arc(px, py, p.r * (1 + k * 2.2), 0, 7); c.fill(); }
          else { c.fillStyle = `rgba(170,205,235,${.7 * (1 - k)})`; c.fillRect(px, py, p.r, p.r * 2.5); }
        }
        if (FX.length > 200) FX.splice(0, FX.length - 200);
      }
    } catch (e) { }
    return r;
  };

  /* ---------- world: Ren's breath in snowy places ---------- */
  if (typeof Ent !== 'undefined') {
    const _draw = Ent.prototype.draw;
    Ent.prototype.draw = function (c, cx, cy, t) {
      const r = _draw.call(this, c, cx, cy, t);
      try {
        if (this.isPlayer && on('breath') && snowy() && G.mode === 'world') {
          const now = performance.now(); if (!this.__br || now > this.__br) { this.__br = now + 1500 + Math.random() * 800; this.__brT = now; this.__brD = this.dir; }
          const k = (now - this.__brT) / 1000;
          if (k < 1 && this.__brD !== 'up') {
            const d = this.__brD === 'left' ? -1 : this.__brD === 'right' ? 1 : 0, h = HD.OW_H || 40, bx = this.px - cx + d * h * .18, by = this.py - cy + 3 - h * .78 + (this.__brD === 'down' ? h * .05 : 0);
            for (let i = 0; i < 3; i++) { const q = Math.max(0, k - i * .08); c.fillStyle = `rgba(235,242,250,${.3 * (1 - q)})`; c.beginPath(); c.arc(bx + d * q * 8 + i, by - q * 4, 1.2 + q * 3, 0, 7); c.fill(); }
          }
        }
      } catch (e) { }
      return r;
    };
  }

  /* ---------- Ren's face on the big moments ---------- */
  if (typeof Battle === 'undefined') return;
  let el = null, last = 0;
  function face(expr) {
    if (!on('face')) return; const now = performance.now(); if (now - last < 1600) return; last = now;
    const have = (typeof Art !== 'undefined' && Art.port && Art.port.ren) || []; if (have.length && !have.includes(expr)) expr = have.includes('focused') ? 'focused' : 'neutral';
    if (!el) {
      el = document.createElement('div');
      el.style.cssText = 'position:fixed;left:10px;top:46%;width:84px;height:88px;border-radius:12px;overflow:hidden;z-index:30;pointer-events:none;border:2px solid #4dffa0;box-shadow:0 0 14px rgba(77,255,160,.45);background:#152029 center/cover no-repeat;opacity:0;transform:translateX(-120%);transition:transform .16s ease-out,opacity .16s';
      document.body.appendChild(el);
    }
    el.style.backgroundImage = `url(assets/portraits/ren_${expr}.webp), url(assets/portraits/ren_${expr}.png)`;
    el.style.borderColor = expr === 'shout' || expr === 'glare' ? '#ff6a5a' : '#4dffa0';
    requestAnimationFrame(() => { el.style.opacity = '1'; el.style.transform = 'translateX(0)'; });
    clearTimeout(el.__t); el.__t = setTimeout(() => { el.style.opacity = '0'; el.style.transform = 'translateX(-120%)'; }, 1100);
  }
  const _tx = Battle.text.bind(Battle);
  Battle.text = function (a, s, col, dy, big) {
    try { if (a && a.isMe && !(G.S && G.S.kid)) { if (s === 'PERFECT!') face('grin'); else if (s === 'PERFECT DODGE' || s === 'PERFECT PARRY') face('focused'); } } catch (e) { }
    // COUNTER FREEZE: a perfect parry stops time for a beat and the camera leans in on the parrier
    try { const B = this.B; if (B && a && on('freeze') && s === 'PERFECT PARRY') { B.hitstop = Math.max(B.hitstop || 0, 170); B.punch = Math.max(B.punch || 0, .06); B.punchX = a.x; B.punchY = a.y - 34; B.flash = Math.max(B.flash || 0, .25); B.flashCol = '255,236,150'; } } catch (e) { }
    return _tx(a, s, col, dy, big);
  };
  const _dm = Battle.damage.bind(Battle);
  Battle.damage = function (t, dmg, big) {
    const before = t && t.hp, r = _dm(t, dmg, big);
    try { if (t && t.isMe && !(G.S && G.S.kid) && dmg > 0 && t.maxHp) { if (t.hp > 0 && t.hp / t.maxHp < .25 && before / t.maxHp >= .25) face('glare'); else if (dmg >= t.maxHp * .2) face('shout'); } } catch (e) { }
    return r;
  };
  // the face slides away when the battle ends
  const _end = Battle.end && Battle.end.bind(Battle);
  if (_end) Battle.end = function (...a) { if (el) { el.style.opacity = '0'; el.style.transform = 'translateX(-120%)'; } return _end(...a); };
})();
