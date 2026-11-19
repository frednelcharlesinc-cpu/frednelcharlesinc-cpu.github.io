/* SPECIAL-MOVE CUTSCENES (Chat C, 2026-11-18 - combat choreography phase 2, owner's MUGEN vision)
   Every attacking special art opens with a short cinematic before it lands:
   1. the screen darkens, black bars slide in, the camera pushes in on the fighter, who flares;
   2. a cut-in band slashes across the screen - their eyes, the art's name, their martial art;
   3. the art plays out; on the final blow - a white flash, a big shake and a beat of slow time.
   Entering the Zone (Kaigen) gets its own cut-in.  Visual only.  Off switch: G.settings.cineOff */
(function () {
  if (typeof Battle === 'undefined') return;
  const L = n => { const i = new Image(); i.src = 'assets/burst/' + n; return i; };
  const EYES = { me: L('ren_eyes.jpg'), kess: L('kess_eyes.jpg'), liora: L('liora_eyes.jpg') };
  const FIG = { kess: L('kess_fig.png'), liora: L('liora_fig.png') };
  const STYLE = { me: 'THE SHEATHED DRAW', kess: 'SHADOWSTEP KNIFE-DANCE', liora: 'MOONWATER SPEAR', oren: 'ANVIL BREAKER', dace: 'IRON VOW AXE', tamsin: 'WILDFIRE ARCHERY' };
  const COL = { me: '#46ff95', kess: '#b48aff', liora: '#9fe4ff', oren: '#ffb347', dace: '#c9d1d9', tamsin: '#ff7a3a' };
  const QUIET = ['buff', 'veil', 'sight', 'cast', 'azure'];
  const off = () => G.settings && G.settings.cineOff;
  const key = a => a.isMe ? 'me' : a.id;
  let CAM = null;   // { x, y, z0, z1, t0, dur }

  async function intro(a, title, sub, col, ms) {
    const B = Battle.B; if (!B) return;
    const k = key(a);
    // 1. push in
    B.letter = 1; B.dim = .7; B.dimCol = '0,0,0'; CAM = { x: a.x, y: a.y - 40, z0: 1, z1: 1.28, t0: performance.now(), dur: 320 };
    B.flash = .35; B.flashCol = '255,255,255'; B.shake = Math.max(B.shake || 0, 4);
    for (let i = 0; i < 22; i++) { const an = i / 22 * 6.28; B.fx.push({ x: a.x, y: a.y - 36, vx: Math.cos(an) * 4.5, vy: Math.sin(an) * 4.5, life: 420, t: 0, col, s: 3 }); }
    try { sfx('chant'); } catch (e) { }
    await wait(380);
    // 2. hard cut to the band
    CAM = null;
    B.cutin = { img: null, fig: FIG[k] && FIG[k].naturalWidth ? FIG[k] : null, ban: EYES[k] && EYES[k].naturalWidth ? EYES[k] : null, title, sub, col, t0: performance.now(), side: a.side === 'e' ? 'e' : 'p' };
    B.flash = 1; B.flashCol = '255,255,255'; try { sfx('art'); } catch (e) { } B.shake = 10;
    await wait(ms || 1050);
    if (B.cutin && B.cutin.title === title) B.cutin = null;
  }
  window.Cine2 = { intro };

  // the camera push (drawn under everything Battle.render draws)
  const _r = Battle.render.bind(Battle);
  Battle.render = function (c, t) {
    if (!CAM || !this.B) return _r(c, t);
    const k = Math.min(1, (performance.now() - CAM.t0) / CAM.dur), e = 1 - Math.pow(1 - k, 3), z = CAM.z0 + (CAM.z1 - CAM.z0) * e;
    c.save(); c.translate(CAM.x, CAM.y); c.scale(z, z); c.translate(-CAM.x, -CAM.y); try { _r(c, t); } finally { c.restore(); }
  };

  const _ua = Battle.useArt.bind(Battle);
  Battle.useArt = async function (a, k) {
    const A = typeof ARTS !== 'undefined' && ARTS[k];
    if (off() || !A || QUIET.includes(A.type) || !this.B || a.side !== 'p') return _ua(a, k);
    const ky = key(a), col = COL[ky] || '#ffffff';
    try { this.closeMenu(); await intro(a, A.name.toUpperCase(), STYLE[ky] || 'SPECIAL ART', col); } catch (e) { CAM = null; }
    a.__cineArt = 1;
    try { return await _ua(a, k); }
    finally {
      a.__cineArt = 0; const B = this.B;
      if (B) { B.letter = Math.max(B.letter || 0, .6); }
    }
  };

  // the final blow of a special lands BIG: flash, heavy shake, a beat of slow time
  const _rh = Battle.resolveHit.bind(Battle);
  Battle.resolveHit = function (a, t, m, grade, opts) {
    const r = _rh(a, t, m, grade, opts);
    try {
      const B = this.B;
      const big = res => { if (!B || !a || !a.__cineArt) return; if (res === 'ko' || (t && t.ko) || res === 'hit') { B.hitstop = Math.max(B.hitstop || 0, res === 'ko' || (t && t.ko) ? 320 : 120); if (res === 'ko' || (t && t.ko)) { B.flash = 1; B.flashCol = '255,255,255'; B.shake = 14; } } };
      if (r && typeof r.then === 'function') r.then(big); else big(r);
    } catch (e) { }
    return r;
  };

  // entering the Zone: a cut-in of the eyes
  if (window.Zone && Zone.enter) {
    const _en = Zone.enter;
    Zone.enter = async function (a, will) {
      const was = a && a.zone > 0, r = await _en(a, will);
      try {
        if (!off() && a && !was && a.zone > 0 && a.side === 'p' && Battle.B && !Battle.B.cutin) {
          const k = key(a); Battle.B.cutin = { img: null, fig: FIG[k] && FIG[k].naturalWidth ? FIG[k] : null, ban: EYES[k] && EYES[k].naturalWidth ? EYES[k] : null, title: 'KAIGEN', sub: 'THE ZONE', col: '#d8f4ff', t0: performance.now(), side: 'p' };
          setTimeout(() => { const B = Battle.B; if (B && B.cutin && B.cutin.title === 'KAIGEN') B.cutin = null; }, 1250);
        }
      } catch (e) { }
      return r;
    };
  }
})();
