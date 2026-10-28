'use strict';
/* ================= LIORA — THE ELEVENTH STEP (Seren's Count) =================
   Every hit Liora lands, and every PERFECT PARRY anyone in the party makes, adds one mark to her count (max 11).
   The count shows as a dial of eleven pips over her head. At eleven: the ELEVENTH STEP command —
   her cutscene, then eleven beats to her mother's rhythm, then one strike that nothing can block, parry, dodge,
   shield, ward or adapt to. Afterwards she is drained and loses her next turn. Knocked down = the count resets. */
const Eleven = {
  /* her Seren's Vigil face pops in for the big moments */
  pop(a, e) {
    if (typeof ART_ID === 'undefined' || !Art.port.liora_vigil) return;
    const o = ART_ID.liora; ART_ID.liora = 'liora_vigil'; Battle.lastPop = 0; Battle.facePop(a, [e]);
    setTimeout(() => { if (o === undefined) delete ART_ID.liora; else ART_ID.liora = o; }, 1100);
  },
  isL(a) { return a && a.side === 'p' && !a.isMe && a.id === 'liora'; },
  liora() { const B = Battle.B; return B && B.actors.find(x => this.isL(x) && !x.ko); },
  add(n, why) {
    const L = this.liora(); if (!L) return;
    const before = L.count || 0; L.count = Math.min(11, before + n); if (L.count === before) return;
    L.countT = performance.now();
    if (L.count === 11) { Battle.text(L, 'THE COUNT IS COMPLETE', '#e8f0ff', -96, true); sfx('charge'); this.pop(L, 'determined'); }
    if (L.count >= 8 && Art.prefetch) Art.prefetch('liora_vigil');
  },
  /* eleven beats — tap as each moon closes on the ring */
  rhythm() {
    return new Promise(resolve => {
      const ov = document.createElement('div'); ov.style.cssText = 'position:fixed;inset:0;z-index:85;touch-action:none;background:rgba(4,8,12,.55)';
      const cv = document.createElement('canvas'); cv.style.cssText = 'width:100%;height:100%;display:block'; ov.append(cv); document.body.append(ov);
      const dpr = Math.min(devicePixelRatio || 1, 2), W = cv.width = innerWidth * dpr, H = cv.height = innerHeight * dpr, x = cv.getContext('2d');
      const BEAT = 520, LEAD = 900, t0 = performance.now() + 700, res = [], marks = [];
      for (let i = 0; i < 11; i++) res.push(null);
      const at = i => t0 + LEAD + i * BEAT;
      const tap = () => {
        const now = performance.now(); let best = -1, bd = 1e9;
        for (let i = 0; i < 11; i++) if (res[i] === null) { const d = Math.abs(now - at(i)); if (d < bd) { bd = d; best = i; } }
        if (best < 0 || bd > 260) return;
        res[best] = bd < 85 ? 'p' : bd < 170 ? 'g' : 'm'; marks.push([best, res[best], now]);
        sfx(res[best] === 'p' ? 'perfect' : res[best] === 'g' ? 'good' : 'miss');
      };
      ov.addEventListener('pointerdown', e => { e.preventDefault(); tap(); });
      const key = e => { if (e.key === ' ' || e.key === 'Enter' || e.key === 'z') { e.preventDefault(); tap(); } };
      addEventListener('keydown', key);
      const cx = W / 2, cy = H * .48, R = Math.min(W, H) * .2;
      const frame = now => {
        x.clearRect(0, 0, W, H);
        for (let i = 0; i < 11; i++) if (res[i] === null && now > at(i) + 260) res[i] = 'm';
        const done = res.every(r => r !== null);
        // the dial: eleven pips around a ring
        x.lineWidth = 3 * dpr; x.strokeStyle = 'rgba(220,230,255,.5)'; x.beginPath(); x.arc(cx, cy, R, 0, 7); x.stroke();
        for (let i = 0; i < 11; i++) {
          const a = -Math.PI / 2 + i * Math.PI * 2 / 11, px = cx + Math.cos(a) * R, py = cy + Math.sin(a) * R, r = res[i];
          x.fillStyle = r === 'p' ? '#fff6c8' : r === 'g' ? '#bfe8ff' : r === 'm' ? '#5a3a44' : 'rgba(200,210,230,.25)';
          x.beginPath(); x.moveTo(px + Math.cos(a) * 12 * dpr, py + Math.sin(a) * 12 * dpr); x.lineTo(px + Math.cos(a + 2.4) * 7 * dpr, py + Math.sin(a + 2.4) * 7 * dpr);
          x.lineTo(px + Math.cos(a - 2.4) * 7 * dpr, py + Math.sin(a - 2.4) * 7 * dpr); x.fill();
        }
        // the closing moon for the next beat
        const nxt = res.findIndex(r => r === null);
        if (nxt >= 0) {
          const k = (at(nxt) - now) / LEAD;
          if (k < 1.05) { const rr = R * .45 + Math.max(0, k) * R * 1.6; x.strokeStyle = `rgba(255,255,255,${Math.min(1, 1.2 - k)})`; x.lineWidth = 5 * dpr; x.beginPath(); x.arc(cx, cy, rr, 0, 7); x.stroke(); }
          x.strokeStyle = 'rgba(255,240,190,.9)'; x.setLineDash([8 * dpr, 6 * dpr]); x.lineWidth = 3 * dpr; x.beginPath(); x.arc(cx, cy, R * .45, 0, 7); x.stroke(); x.setLineDash([]);
        }
        const n = res.filter(r => r !== null).length;
        x.fillStyle = '#fff'; x.font = `800 ${46 * dpr}px Nunito, system-ui`; x.textAlign = 'center'; x.textBaseline = 'middle';
        x.fillText(n ? String(n) : '…', cx, cy);
        x.font = `700 ${15 * dpr}px Nunito, system-ui`; x.fillStyle = 'rgba(220,235,255,.85)';
        x.fillText(now < t0 ? 'Count with her. Tap as each ring closes.' : 'SEREN\'S COUNT', cx, cy + R + 34 * dpr);
        for (const [i, r, t] of marks) { const age = now - t; if (age > 500) continue; const a = -Math.PI / 2 + i * Math.PI * 2 / 11;
          x.globalAlpha = 1 - age / 500; x.fillStyle = r === 'p' ? '#ffe37a' : r === 'g' ? '#bfe8ff' : '#ff8a8a'; x.font = `800 ${16 * dpr}px Nunito`;
          x.fillText(r === 'p' ? 'PERFECT' : r === 'g' ? 'GOOD' : 'MISS', cx + Math.cos(a) * (R + 40 * dpr), cy + Math.sin(a) * (R + 40 * dpr) - age / 20); x.globalAlpha = 1; }
        if (done && now > at(10) + 420) { removeEventListener('keydown', key); ov.remove(); resolve({ p: res.filter(r => r === 'p').length, g: res.filter(r => r === 'g').length }); return; }
        requestAnimationFrame(frame);
      };
      requestAnimationFrame(frame);
    });
  },
  async step(a, t) {
    const B = Battle.B, S = G.S;
    a.count = 0; Battle.closeMenu && Battle.closeMenu();
    S.f.elevenSeen ? await Comic.play('eleventhShort') : (S.f.elevenSeen = 1, await Comic.play('eleventh'));
    this.pop(a, 'closed'); await Battle.msg('Liora closes her eyes and counts.', 900);
    const r = await this.rhythm();
    const m = 2.8 + r.p * .3 + r.g * .15;
    await Battle.dash(a, t.x + 70, t.y + 2, 140);
    a.anim = 'thrust'; a.frame = 0; a.once = true; a.fn = 99; a.fms = 1e9;
    B.flash = 1; B.flashCol = '235,245,255'; B.shake = 16; sfx('art');
    B.fx && B.fx.push({ beam: 1, x1: a.x - 20, y1: a.y - 34, x2: t.x - 220, y2: t.y - 34, t: 0, life: 520 });
    // nothing stops it: no defence, no parry, no shield, no ward, no faith, no adaptation
    if (t.shield) t.shield = 0; if (t.frostOn) { t.frostOn = false; t.def -= 8; } if (t.stance) t.stance = 0;
    const dmg = Math.max(1, Math.round(a.atk * m * rnd(.97, 1.03)));
    Battle.text(t, r.p === 11 ? 'THE ELEVENTH STEP — FLAWLESS' : 'THE ELEVENTH STEP', '#f4f8ff', -70, true);
    Battle.damage(t, dmg, true); this.pop(a, r.p >= 9 ? 'shout' : 'determined');
    if (!t.ko) { t.brk = t.brkMax; Battle.checkBreak(t); }
    Battle.spark(t.x, t.y - 30, '#ffffff', 40); Battle.spark(t.x, t.y - 30, '#9fffd0', 24);
    await wait(700); a.anim = 'combat';
    await Battle.home(a);
    a.drained = 1; Battle.text(a, 'DRAINED', '#b0b8c8', -40);
    Battle.hud();
  }
};

(function () {
  if (typeof Battle === 'undefined') return;
  Object.assign(Comic.PAGES, {
    // the house at night → the count → the shards align → the step → the aftermath, her tear
    eleventh: { src: 'assets/cutscenes/comic_eleventh.webp', panels: [[20, 14, 828, 319], [20, 331, 418, 679], [430, 331, 828, 679], [20, 692, 828, 955], [20, 967, 600, 1248], [612, 967, 828, 1248]],
      fx: [null, 'glow', 'flash', 'shake', 'glow', null], hold: 1900 },
    eleventhShort: { src: 'assets/cutscenes/comic_eleventh.webp', panels: [[430, 331, 828, 679], [20, 692, 828, 955]], fx: ['flash', 'shake'], hold: 1000 }
  });
  // landed hits feed the count
  const _rh = Battle.resolveHit.bind(Battle);
  Battle.resolveHit = function (a, t, m, grade, opts) {
    const r = _rh(a, t, m, grade, opts);
    if (r === 'hit' && Eleven.isL(a) && t.side === 'e') Eleven.add(1);
    return r;
  };
  // perfect parries from anyone in the party feed it too
  const _tx = Battle.text.bind(Battle);
  Battle.text = function (a, txt, ...rest) {
    if (a && a.side === 'p' && txt === 'PERFECT PARRY') Eleven.add(1);
    return _tx(a, txt, ...rest);
  };
  // knocked down: the count is lost
  const _dm = Battle.damage.bind(Battle);
  Battle.damage = function (t, dmg, big) { _dm(t, dmg, big); if (Eleven.isL(t) && t.ko) t.count = 0; };
  // drained after the step: she sits out one turn
  const _pt = Battle.playerTurn.bind(Battle);
  Battle.playerTurn = function (a) {
    if (Eleven.isL(a) && a.drained) {
      a.drained = 0; a.mp = Math.max(0, a.mp - 6);
      return Battle.msg('Liora is still catching her breath. She can\'t move this turn.', 1100).then(() => null);
    }
    return _pt(a);
  };
  // the command
  if (typeof CombatX !== 'undefined') {
    const _m = CombatX.menu.bind(CombatX);
    CombatX.menu = function (a, L, done, resolve, reopen) {
      _m(a, L, done, resolve, reopen);
      if (Eleven.isL(a)) {
        const n = a.count || 0, ready = n >= 11;
        L.splice(1, 0, ['Eleventh Step', ready
          ? 'SEREN\'S COUNT IS COMPLETE. One strike that cannot be blocked, parried, dodged, shielded or adapted to. Count the eleven beats with her — every PERFECT makes it stronger. She is drained afterwards.'
          : `Seren's Count: ${n}/11. Liora's landed hits and the party's PERFECT PARRIES add to it. At 11, the strike that nothing can stop.`,
          () => ready && Battle.pickTarget(a, t => Eleven.step(a, t).then(done)), !ready]);
      }
    };
  }
  // the dial over her head
  const _r = Battle.render.bind(Battle);
  Battle.render = function (c, t) {
    _r(c, t);
    const B = this.B; if (!B) return;
    for (const a of B.actors) {
      if (!Eleven.isL(a) || a.ko || !(a.count > 0)) continue;
      const s = (a.size || 1) * (typeof BT_SCALE !== 'undefined' ? BT_SCALE : 1), cx = a.x, cy = a.y - 96 * s, R = 15 * s, full = a.count >= 11;
      const pop = Math.max(0, 1 - (performance.now() - (a.countT || 0)) / 400);
      c.save();
      if (full) { c.globalCompositeOperation = 'lighter'; const g = c.createRadialGradient(cx, cy, 2, cx, cy, R * 2.4); g.addColorStop(0, `rgba(230,240,255,${.35 + .15 * Math.sin(t / 140)})`); g.addColorStop(1, 'rgba(200,220,255,0)'); c.fillStyle = g; c.fillRect(cx - R * 3, cy - R * 3, R * 6, R * 6); c.globalCompositeOperation = 'source-over'; }
      c.strokeStyle = 'rgba(235,225,190,.75)'; c.lineWidth = 1.5; c.beginPath(); c.arc(cx, cy, R, 0, 7); c.stroke();
      const spin = full ? t / 600 : 0;
      for (let i = 0; i < 11; i++) {
        const an = -Math.PI / 2 + i * Math.PI * 2 / 11 + spin, on = i < a.count, px = cx + Math.cos(an) * R, py = cy + Math.sin(an) * R, sz = (on ? 4.2 : 3) * s * (on && i === a.count - 1 ? 1 + pop * .8 : 1);
        c.fillStyle = on ? (full ? '#ffffff' : '#f3e7b8') : 'rgba(120,120,140,.55)';
        c.beginPath(); c.moveTo(px + Math.cos(an) * sz, py + Math.sin(an) * sz); c.lineTo(px + Math.cos(an + 2.5) * sz * .7, py + Math.sin(an + 2.5) * sz * .7); c.lineTo(px + Math.cos(an - 2.5) * sz * .7, py + Math.sin(an - 2.5) * sz * .7); c.fill();
      }
      c.font = `800 ${10 * s}px Nunito`; c.textAlign = 'center'; c.lineWidth = 3; c.strokeStyle = '#000'; c.fillStyle = full ? '#fff' : '#f3e7b8';
      c.strokeText(String(a.count), cx, cy + 4 * s); c.fillText(String(a.count), cx, cy + 4 * s);
      c.restore();
    }
  };
})();
