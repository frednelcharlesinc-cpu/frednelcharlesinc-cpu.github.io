/* =====================================================================
   CLASHES & SOUND
   · New synthesized combat sounds: a crisp metallic "shing" for perfect parries,
     an airy whoosh-and-shimmer for perfect dodges, punchier hits, and a full clash kit.
   · CLASHES: in rival and boss fights (and now and then against strong foes), when
     both fighters charge each other the blades — or their energy — collide.
       1. a cut-in: both faces slide in with their lines
       2. the collision: flash, shockwave, sparks, the two colours pushing at each other
       3. the CLASH RING: a needle sweeps the circle and a window drifts around it.
          Tap when the needle is inside the window. Every hit pushes the struggle your
          way; misses push it back; the window shrinks and the needle speeds up.
       4. the winner blows the loser back across the field.
   ===================================================================== */

/* ---------------- sound ---------------- */
const SFX2 = {
  bus: null,
  out() { if (!AC) return null; if (!this.bus) { const c = AC.createDynamicsCompressor(); c.threshold.value = -14; c.knee.value = 10; c.ratio.value = 5; c.attack.value = .002; c.release.value = .18; const g = AC.createGain(); g.gain.value = .95; c.connect(g); g.connect(AC.destination); this.bus = c; } return this.bus; },
  osc(f, d, type, v, f2, dl, att) { const now = AC.currentTime + (dl || 0), o = AC.createOscillator(), g = AC.createGain(); o.type = type || 'sine'; o.frequency.setValueAtTime(f, now); if (f2) o.frequency.exponentialRampToValueAtTime(f2, now + d); g.gain.setValueAtTime(.0001, now); g.gain.exponentialRampToValueAtTime(v, now + (att || .004)); g.gain.exponentialRampToValueAtTime(.0001, now + d); o.connect(g); g.connect(this.out()); o.start(now); o.stop(now + d + .05); },
  nz(d, v, type, f0, f1, q, dl) { const now = AC.currentTime + (dl || 0), n = Math.floor(AC.sampleRate * d), b = AC.createBuffer(1, n, AC.sampleRate), ch = b.getChannelData(0); for (let i = 0; i < n; i++) ch[i] = Math.random() * 2 - 1; const s = AC.createBufferSource(), f = AC.createBiquadFilter(), g = AC.createGain(); f.type = type || 'bandpass'; f.Q.value = q || 1; f.frequency.setValueAtTime(f0, now); if (f1) f.frequency.exponentialRampToValueAtTime(f1, now + d); g.gain.setValueAtTime(v, now); g.gain.exponentialRampToValueAtTime(.0001, now + d); s.buffer = b; s.connect(f); f.connect(g); g.connect(this.out()); s.start(now); },
  ring(base, d, v, dl) { for (const [m, a] of [[1, 1], [2.76, .55], [5.4, .32], [8.9, .18]]) this.osc(base * m, d * (1 - m * .04), 'sine', v * a, null, dl, .002); },
  play(t) {
    switch (t) {
      case 'pparry': this.nz(.03, .5, 'highpass', 5500, null, .7); this.ring(1850, .55, .16); this.osc(2900, .3, 'triangle', .05, 3300, .01); this.osc(150, .12, 'sine', .22, 70); return true;
      case 'parry': this.nz(.025, .35, 'highpass', 4500); this.ring(1400, .22, .09); this.osc(130, .08, 'sine', .14, 80); return true;
      case 'pdodge': this.nz(.2, .35, 'bandpass', 700, 4200, 1.4); this.osc(1700, .26, 'sine', .07, 2600, .05); this.osc(2600, .22, 'sine', .04, 3600, .1); return true;
      case 'dodge': this.nz(.16, .25, 'bandpass', 600, 2600, 1.2); return true;
      case 'hit': this.osc(95, .14, 'sine', .38, 45); this.nz(.07, .32, 'bandpass', 900, 400, .8); this.nz(.03, .18, 'highpass', 3000); return true;
      case 'crit': this.osc(80, .25, 'sine', .45, 35); this.nz(.12, .4, 'bandpass', 1500, 300, .7); this.nz(.05, .3, 'highpass', 4000); this.ring(1200, .3, .06, .02); return true;
      case 'swing': this.nz(.14, .16, 'bandpass', 500, 2400, 1.1); return true;
      case 'clash': this.nz(.05, .6, 'highpass', 3500); this.ring(980, 1.4, .2); this.ring(1270, 1.2, .12, .01); this.osc(60, .5, 'sine', .55, 30); this.nz(.6, .3, 'lowpass', 1200, 200, .5); return true;
      case 'clashTick': this.ring(2200, .18, .12); this.nz(.02, .25, 'highpass', 6000); return true;
      case 'clashPerfect': this.ring(2600, .3, .15); this.osc(3900, .2, 'sine', .06, null, .03); this.nz(.03, .3, 'highpass', 6000); return true;
      case 'clashMiss': this.osc(220, .18, 'square', .06, 120); this.nz(.08, .2, 'lowpass', 800, 200); return true;
      case 'clashWin': for (const [f, d] of [[523, 0], [659, .07], [784, .14], [1047, .22]]) this.osc(f, .5, 'triangle', .09, null, d); this.nz(.7, .35, 'lowpass', 3000, 150, .6); this.osc(55, .6, 'sine', .5, 28); return true;
      case 'clashLose': for (const [f, d] of [[392, 0], [311, .1], [233, .2]]) this.osc(f, .45, 'sawtooth', .05, null, d); this.osc(70, .5, 'sine', .45, 30); return true;
      case 'charge': this.nz(.5, .25, 'bandpass', 300, 3000, 2); this.osc(110, .5, 'sawtooth', .05, 440); return true;
    }
    return false;
  },
  hum: null,
  humStart(col) { if (!AC || !G.settings.sfx) return; this.humStop(); const o = AC.createOscillator(), o2 = AC.createOscillator(), g = AC.createGain(); o.type = 'sawtooth'; o2.type = 'sine'; o.frequency.value = 90; o2.frequency.value = 181; g.gain.value = .0001; g.gain.exponentialRampToValueAtTime(.05, AC.currentTime + .3); const f = AC.createBiquadFilter(); f.type = 'lowpass'; f.frequency.value = 900; o.connect(f); o2.connect(f); f.connect(g); g.connect(this.out()); o.start(); o2.start(); this.hum = { o, o2, g, f }; },
  humSet(k) { if (this.hum) { const t = AC.currentTime; this.hum.o.frequency.setTargetAtTime(80 + k * 90, t, .05); this.hum.o2.frequency.setTargetAtTime(160 + k * 180, t, .05); this.hum.f.frequency.setTargetAtTime(600 + k * 1600, t, .05); } },
  humStop() { if (this.hum) { const h = this.hum; this.hum = null; try { h.g.gain.setTargetAtTime(.0001, AC.currentTime, .06); h.o.stop(AC.currentTime + .3); h.o2.stop(AC.currentTime + .3); } catch (e) { } } }
};
(function () { const _s = sfx; sfx = function (t) { if (!G.settings.sfx || !AC) return; try { if (SFX2.play(t)) return; } catch (e) { } return _s(t); }; })();

/* ---------------- clashes ---------------- */
const CLASH_COL = { kairo: '#ff6a2a', vane: '#cfe8ff', halvard: '#ffe36a', tamsin: '#ff8a3a', dace: '#8ad35a', wren: '#d8f08a', corran: '#c8a878', cael: '#ffd0a0', will: '#fff3b0', dread: '#46ff95' };
const CLASH_LINES = {
  kairo: [["Forty-two to one, brother. Want to make it forty-three?", 'Not today.'], ["You've gotten FASTER!", "You've gotten louder."], ["Don't you DARE hold back!", "I never could with you."]],
  vane: [['Show me what the snow taught you, pup.', 'Everything you did.'], ['Breathe.', "I'm breathing."]],
  halvard: [['The fire forgives NOTHING!', 'Then it can start with you.'], ['Kneel before the Lantern!', 'Never again.']],
  tamsin: [['This is for Kairo!', "He'd want you to stop, Tamsin."], ['Stop holding back!', "I'm not."]],
  dace: [['Brace yourself, brother — I hit like a door!', 'Doors break.']],
  wren: [['Four years in a cage. You think I lose to YOU?', "I'm not your cage."]],
  corran: [["Old iron doesn't bend, boy.", "Then I'll go around it."]],
  cael: [['Another Drag for my list.', 'Your list ends here.']],
  any: [['Fall!', 'Not here.'], ['Kneel!', 'Never.'], ["You're finished!", 'Not yet.']]
};
const Clash = {
  key(e) { return (typeof GE_RIVAL !== 'undefined' && GE_RIVAL[e.key]) || (e.key || '').split('_')[0]; },
  eligible(e, chance) {
    const B = Battle.B; if (!B || !e || e.ko || e.side !== 'e' || B.cfg.leafTrain || B.cfg.tutorial || G.S.kid || B.clashOn) return false;
    if (e.E.fixed || e.panic) return false;
    if ((B.clashCd || 0) > B.turn) return false;
    const rival = (typeof RIVAL_KEYS !== 'undefined' && RIVAL_KEYS.includes(e.key)) || e.E.boss || (typeof GE_RIVAL !== 'undefined' && GE_RIVAL[e.key]);
    const tier = ['E', 'D', 'C', 'B', 'A', 'S', 'SS', 'SSS', 'SSSS'].indexOf(TIER[e.key] || 'E');
    const p = rival ? chance : tier >= 2 ? .08 : 0;
    return Math.random() < p;
  },
  async cutIn(a, e) {
    const B = Battle.B, k = this.key(e); B.clashLines = B.clashLines || {};
    const pool = CLASH_LINES[k] || CLASH_LINES.any, n = B.clashLines[k] || 0; B.clashLines[k] = n + 1;
    const [el, rl] = pool[n % pool.length], first = n === 0;
    let box = document.getElementById('clashCut');
    if (!box) {
      box = document.createElement('div'); box.id = 'clashCut';
      box.innerHTML = '<div class="cc-band"></div><div class="cc-side cc-l"><canvas width="296" height="320"></canvas><div class="cc-nm"></div><div class="cc-ln"></div></div><div class="cc-side cc-r"><canvas width="296" height="320"></canvas><div class="cc-nm"></div><div class="cc-ln"></div></div><div class="cc-title">CLASH</div>';
      document.body.appendChild(box);
      const st = document.createElement('style'); st.textContent = `
#clashCut{position:fixed;inset:0;z-index:45;pointer-events:none;display:none;overflow:hidden}
#clashCut.on{display:block}
#clashCut .cc-band{position:absolute;left:-10%;right:-10%;top:18%;height:58%;background:linear-gradient(100deg,var(--ce) 0 49.6%,#fff 49.6% 50.4%,var(--cr) 50.4% 100%);transform:skewY(-6deg) scaleY(0);opacity:.92;animation:ccBand .32s ease-out forwards;box-shadow:0 0 40px #000}
#clashCut .cc-side{position:absolute;top:14%;width:44%;height:64%;display:flex;flex-direction:column;align-items:center;justify-content:flex-end}
#clashCut .cc-l{left:0;animation:ccInL .35s cubic-bezier(.2,1.2,.4,1) .08s both}
#clashCut .cc-r{right:0;animation:ccInR .35s cubic-bezier(.2,1.2,.4,1) .08s both}
#clashCut canvas{height:86%;width:auto;filter:drop-shadow(0 0 14px rgba(0,0,0,.7))}
#clashCut .cc-nm{font:900 15px Nunito,sans-serif;color:#fff;letter-spacing:2px;text-shadow:0 2px 0 #000;margin-top:-26px}
#clashCut .cc-ln{font:800 14px Nunito,sans-serif;color:#fff;background:rgba(0,0,0,.8);border:2px solid rgba(255,255,255,.4);border-radius:8px;padding:4px 10px;max-width:92%;text-align:center;margin-top:4px;opacity:0;animation:ccFade .2s ease-out .3s forwards}
#clashCut .cc-r .cc-ln{animation-delay:.75s}
#clashCut .cc-title{position:absolute;left:50%;top:44%;transform:translate(-50%,-50%) scale(3);font:900 clamp(34px,8vw,64px) 'Press Start 2P',monospace;color:#fff;letter-spacing:4px;text-shadow:0 0 18px #fff,0 4px 0 #000,4px 0 0 #000,-4px 0 0 #000;opacity:0;animation:ccTitle .4s ease-out .1s forwards}
#clashCut.quick .cc-side{display:none}
@keyframes ccBand{to{transform:skewY(-6deg) scaleY(1)}}
@keyframes ccInL{from{transform:translateX(-110%)}to{transform:none}}
@keyframes ccInR{from{transform:translateX(110%)}to{transform:none}}
@keyframes ccFade{to{opacity:1}}
@keyframes ccTitle{0%{opacity:0;transform:translate(-50%,-50%) scale(3)}60%{opacity:1;transform:translate(-50%,-50%) scale(.92)}100%{opacity:1;transform:translate(-50%,-50%) scale(1)}}`;
      document.head.appendChild(st);
    }
    const ce = this.col(e), cr = this.myCol();
    box.style.setProperty('--ce', ce + '99'); box.style.setProperty('--cr', cr + '99');
    box.classList.toggle('quick', !first);
    const [cl, crv] = box.querySelectorAll('canvas'), [nl, nr] = box.querySelectorAll('.cc-nm'), [ll, lr] = box.querySelectorAll('.cc-ln');
    if (first) {
      const ew = Battle.faceOf(e);
      try { if (ew) { drawPortrait(cl, ew, artHas(ew, 'anger') ? 'anger' : 'neutral', 1); cl.style.visibility = 'visible'; } else cl.style.visibility = 'hidden'; } catch (x) { cl.style.visibility = 'hidden'; }
      try { drawPortrait(crv, 'me', 'anger', -1); } catch (x) { }
      nl.textContent = e.name.toUpperCase(); nr.textContent = (typeof Veil !== 'undefined' && Veil.on() ? 'RED VEIL' : G.S.name.toUpperCase());
      ll.textContent = el; lr.textContent = rl;
    }
    // restart animations
    box.classList.remove('on'); void box.offsetWidth; box.classList.add('on');
    sfx('charge'); await wait(first ? 1700 : 600);
    box.classList.remove('on');
  },
  col(e) { return CLASH_COL[this.key(e)] || (e.E && e.E.spectral) || '#ff5a4a'; },
  myCol() { return typeof Veil !== 'undefined' && Veil.on() ? '#ff4a4a' : '#46ff95'; },
  async run(a, e, kind) {
    const BT = Battle, B = BT.B; if (!B || !a || !e) return 'draw';
    B.clashCd = B.turn + 3; BT.closeMenu();
    kind = kind || (Math.random() < .35 ? 'energy' : 'blade');
    const tier = Math.max(0, ['E', 'D', 'C', 'B', 'A', 'S', 'SS', 'SSS', 'SSSS'].indexOf(TIER[e.key] || 'E'));
    const C = B.clashOn = { a, e, kind, ce: this.col(e), cr: this.myCol(), meter: .5, t0: performance.now(), phase: 'cut', sparks: [], z: 0, mx: (a.x + e.x) / 2, my: (a.y + e.y) / 2 - 30 };
    B.letter = 1;
    await this.cutIn(a, e);
    // both charge
    C.phase = 'charge'; sfx('swing');
    const mx = C.mx; await Promise.all([BT.dash(a, mx + 24, a.y, 200), BT.dash(e, mx - 24, e.y, 200)]);
    a.anim = 'slash'; a.frame = 3; a.once = true; a.fn = 99; a.fms = 1e9; e.anim = kind === 'energy' ? 'spellcast' : 'slash'; e.frame = 3; e.once = true; e.fn = 99; e.fms = 1e9;
    C.mx = (a.x + e.x) / 2; C.my = Math.min(a.y, e.y) - 34;
    // impact
    C.phase = 'impact'; C.impact = performance.now(); sfx('clash'); B.flash = .9; B.flashCol = '255,255,255'; B.shake = 16; B.hitstop = 120;
    for (let i = 0; i < 40; i++) this.spark(C, C.mx, C.my, i % 3 ? C.cr : C.ce, 1);
    await wait(380);
    // the struggle
    C.phase = 'ring'; SFX2.humStart();
    const res = await this.ring(C, tier);
    SFX2.humStop();
    // resolution
    C.phase = 'end'; C.result = res;
    const win = res === 'win', lose = res === 'lose';
    sfx(win ? 'clashWin' : lose ? 'clashLose' : 'clash'); B.flash = 1; B.flashCol = win ? '120,255,170' : lose ? '255,110,90' : '255,255,255'; B.shake = 18; B.punch = .09; B.punchX = C.mx; B.punchY = C.my;
    for (let i = 0; i < 70; i++) this.spark(C, C.mx, C.my, win ? C.cr : lose ? C.ce : '#ffffff', 1.6);
    if (win) {
      e.kbv = -40; BT.text(e, 'CLASH WON!', '#7dffb0', -80, true);
      BT.resolveHit(a, e, kind === 'energy' ? 3.6 : 3.2, 'perfect', { unblockable: 1, src: 'clash', brk: 45 });
      if (typeof Chain !== 'undefined') Chain.add(2);
      G.S.f.clashWins = (G.S.f.clashWins || 0) + 1;
      if (typeof CombatX !== 'undefined') { CombatX.shout(a, pick(['Mine.', 'Not this time!', 'Forty-three.']), 1300); for (const o of BT.alive('e')) CombatX.shake(o, 25); }
    } else if (lose) {
      a.kbv = 40; BT.text(a, 'OVERPOWERED', '#ff8a7a', -80, true);
      BT.chip(e, a, kind === 'energy' ? 1.9 : 1.6, true);
      if (typeof Chain !== 'undefined') Chain.reset();
      if (typeof CombatX !== 'undefined') CombatX.shout(e, pick(['Too weak!', 'Ha!', 'Kneel.']), 1300);
    } else {
      BT.text({ x: C.mx, y: C.my + 60 }, 'STALEMATE', '#ffffff', -20, true);
      for (const x of [a, e]) { x.kbv = (x === a ? 1 : -1) * 22; BT.damage(x, Math.max(1, Math.round(x.maxHp * .05)), false); }
    }
    await wait(700);
    B.clashOn = null; B.letter = 0;
    a.once = false; a.anim = 'combat'; e.once = false; if (!e.ko) e.anim = 'combat';
    await Promise.all([BT.home(a), e.ko ? Promise.resolve() : BT.home(e)]);
    BT.hud();
    return res;
  },
  spark(C, x, y, col, pow) { const a = Math.random() * Math.PI * 2, v = (1.5 + Math.random() * 4) * (pow || 1); C.sparks.push({ x, y, vx: Math.cos(a) * v, vy: Math.sin(a) * v - 1, life: 400 + Math.random() * 500, t: 0, col }); },
  ring(C, tier) {
    const B = Battle.B;
    return new Promise(resolve => {
      const R = { needle: Math.random() * Math.PI * 2, nSpeed: (2.4 + tier * .35) * Math.PI, win: Math.random() * Math.PI * 2, wSize: Math.max(.5, 1.25 - tier * .07), wDrift: (Math.random() < .5 ? -1 : 1) * (.5 + tier * .12), pressure: .07 + tier * .018, hits: 0, last: performance.now(), done: false, flash: 0, miss: 0 };
      C.R = R; R.t0 = performance.now();
      const inWin = () => { let d = ((R.needle - R.win) % (Math.PI * 2) + Math.PI * 3) % (Math.PI * 2) - Math.PI; return Math.abs(d) <= R.wSize / 2 ? Math.abs(d) / (R.wSize / 2) : -1; };
      C.inWin = () => { const d = inWin(); return d >= 0 && d < .45; };
      const tap = () => {
        if (R.done) return; const d = inWin();
        if (d >= 0) {
          const perfect = d < .35; C.meter = Math.min(1, C.meter + (perfect ? .3 : .2)); R.hits++; R.flash = 1; sfx(perfect ? 'clashPerfect' : 'clashTick');
          for (let i = 0; i < (perfect ? 16 : 9); i++) this.spark(C, C.mx, C.my, C.cr, perfect ? 1.3 : .9);
          if (perfect) Battle.text({ x: C.mx, y: C.my + 30 }, 'PERFECT', '#ffe36a', -40);
          R.win = R.needle + Math.PI * (.6 + Math.random() * .8) * (Math.random() < .5 ? 1 : -1); R.wSize = Math.max(.32, R.wSize * .88); R.nSpeed *= 1.1; R.wDrift *= -1.15;
          B.shake = 5;
        } else { C.meter = Math.max(0, C.meter - .2); R.miss = 1; sfx('clashMiss'); for (let i = 0; i < 8; i++) this.spark(C, C.mx, C.my, C.ce, .9); B.shake = 7; }
      };
      const prevA = Input.handlers.a, hit = $('#hitTap'), h = ev => { ev.preventDefault(); tap(); };
      Input.on('a', tap); hit.classList.remove('hide'); hit.addEventListener('pointerdown', h);
      const step = () => {
        if (R.done) return;
        const now = performance.now(), dt = Math.min(50, now - R.last) / 1000; R.last = now;
        R.needle += R.nSpeed * dt; R.win += R.wDrift * dt; C.meter = Math.max(0, C.meter - R.pressure * dt);
        R.flash = Math.max(0, R.flash - dt * 4); R.miss = Math.max(0, R.miss - dt * 4);
        SFX2.humSet(C.meter);
        if (Math.random() < .5) this.spark(C, C.mx + (C.meter - .5) * 40, C.my, Math.random() < C.meter ? C.cr : C.ce, .6);
        const el = now - R.t0;
        if (C.meter >= 1 || C.meter <= 0 || el > 7000) {
          R.done = true; Input.on('a', prevA); hit.removeEventListener('pointerdown', h); hit.classList.add('hide');
          resolve(C.meter >= 1 || (el > 7000 && C.meter > .62) ? 'win' : C.meter <= 0 || (el > 7000 && C.meter < .38) ? 'lose' : 'draw');
          return;
        }
        requestAnimationFrame(step);
      };
      requestAnimationFrame(step);
    });
  }
};

(function () {
  const BT = Battle;
  /* ---------- when do clashes happen ---------- */
  const _da = BT.doAttack.bind(BT);
  BT.doAttack = async function (a, t) {
    if (a.isMe && Clash.eligible(t, .4)) { await Clash.run(a, t, 'blade'); return; }
    return _da(a, t);
  };
  const _es = BT.enemyStrike.bind(BT);
  BT.enemyStrike = async function (e, t, sk, isCounter) {
    try {
      if (!isCounter && t && t.isMe && sk && sk.hits && !sk.hits.some(h => h.proj || h.unp) && Clash.eligible(e, .3)) {
        const energy = sk.hits.some(h => h.anim === 'spellcast');
        await this.msg(`${e.name}: ${sk.name}`, 600);
        if (typeof CombatX !== 'undefined') CombatX.shout(t, pick(['Not this time!', 'Meet it head-on!', "I'm not running!"]), 1200);
        await Clash.run(t, e, energy ? 'energy' : 'blade'); return;
      }
    } catch (x) { console.warn(x); }
    return _es(e, t, sk, isCounter);
  };
  // a Drag Art thrown at a rival or boss can be met with their own power
  const _ua = BT.useArt.bind(BT);
  BT.useArt = async function (a, k) {
    const A = ARTS[k], B = this.B;
    if (a.isMe && A && A.type !== 'buff' && A.type !== 'veil' && k !== 'sight' && k !== 'azure') {
      const e = this.alive('e').find(x => x.E.boss || (typeof GE_RIVAL !== 'undefined' && GE_RIVAL[x.key]) || (typeof RIVAL_KEYS !== 'undefined' && RIVAL_KEYS.includes(x.key)));
      if (e && Clash.eligible(e, .3)) { const cost = this.artCost(a, k); if (a.mp >= cost) { a.mp -= cost; a.strain = Math.min(a.strainMax, a.strain + this.artStrain(a, k)); this.hud(); await this.msg(`${e.name} answers your ${A.name} with power of their own!`, 900); await Clash.run(a, e, 'energy'); return; } }
    }
    return _ua(a, k);
  };
  // a tied duel exchange becomes a full clash

  /* ---------- drawing ---------- */
  const _up = BT.update.bind(BT);
  BT.update = function (dt) {
    const B = this.B, C = B && B.clashOn;
    if (C) { C.sparks = C.sparks.filter(s => (s.t += dt) < s.life); for (const s of C.sparks) { s.x += s.vx; s.y += s.vy; s.vy += .08; s.vx *= .97; } }
    return _up(dt);
  };
  const _r = BT.render.bind(BT);
  BT.render = function (c, t) {
    const B = this.B, C = B && B.clashOn;
    if (!C) return _r(c, t);
    const W = G.view.w, H = G.view.h, now = performance.now();
    // camera leans into the collision
    C.z += ((C.phase === 'cut' ? 1.05 : C.phase === 'charge' ? 1.2 : 1.42) - (C.z || 1)) * .12; if (!C.z || C.z < 1) C.z = 1;
    c.save(); c.translate(W / 2, H * .66); c.scale(C.z, C.z); c.translate(-C.mx, -C.my - 10);
    _r(c, t);
    // the collision itself
    if (C.phase !== 'cut' && C.phase !== 'charge') {
      const bx = C.mx + (C.meter - .5) * 50, by = C.my;
      c.save(); c.globalCompositeOperation = 'lighter';
      if (C.kind === 'energy') {
        for (const [x0, col, dir] of [[C.a.x, C.cr, 1], [C.e.x, C.ce, -1]]) {
          const g = c.createLinearGradient(x0, 0, bx, 0); g.addColorStop(0, col + '00'); g.addColorStop(.25, col + 'aa'); g.addColorStop(1, '#ffffffee');
          c.fillStyle = g; const th = 9 + Math.sin(now / 40 + dir) * 3; c.beginPath(); c.moveTo(x0, by - th); c.lineTo(bx, by - th * 1.6); c.lineTo(bx, by + th * 1.6); c.lineTo(x0, by + th); c.fill();
        }
      } else {
        c.strokeStyle = '#ffffff'; c.lineWidth = 2.5; c.lineCap = 'round';
        for (const s of [-1, 1]) { c.beginPath(); c.moveTo(bx - 22, by + s * 16); c.lineTo(bx + 22, by - s * 16); c.stroke(); }
      }
      const pul = 1 + Math.sin(now / 50) * .12, R0 = (C.phase === 'end' ? 60 : 26) * pul;
      for (const [col, r] of [[C.cr, R0 * (1.2 - (1 - C.meter) * .6)], [C.ce, R0 * (1.2 - C.meter * .6)], ['#ffffff', R0 * .55]]) { const g = c.createRadialGradient(bx, by, 0, bx, by, r); g.addColorStop(0, col + 'ee'); g.addColorStop(1, col + '00'); c.fillStyle = g; c.beginPath(); c.arc(bx, by, r, 0, 7); c.fill(); }
      // shockwave rings
      const ik = (now - (C.impact || now)) / 600; if (ik < 1) { c.strokeStyle = `rgba(255,255,255,${1 - ik})`; c.lineWidth = 3 * (1 - ik); c.beginPath(); c.ellipse(bx, by, 10 + ik * 120, 6 + ik * 50, 0, 0, 7); c.stroke(); }
      c.restore();
    }
    c.save(); c.globalCompositeOperation = 'lighter'; for (const s of C.sparks) { c.globalAlpha = 1 - s.t / s.life; c.fillStyle = s.col; c.fillRect(s.x - 1.5, s.y - 1.5, 3, 3); } c.restore();
    c.restore();
    // ---- the CLASH RING (screen space) ----
    if (C.phase === 'ring' && C.R) {
      const R = C.R, cx = W / 2, cy = H * .25, rad = Math.min(W, H) * .13;
      c.save();
      c.fillStyle = 'rgba(0,0,0,.55)'; c.beginPath(); c.arc(cx, cy, rad + 14, 0, 7); c.fill();
      c.lineWidth = 8; c.strokeStyle = 'rgba(255,255,255,.15)'; c.beginPath(); c.arc(cx, cy, rad, 0, 7); c.stroke();
      // the window
      c.lineWidth = 12; c.lineCap = 'round'; c.strokeStyle = R.flash > 0 ? '#ffffff' : C.cr; c.shadowColor = C.cr; c.shadowBlur = 14;
      c.beginPath(); c.arc(cx, cy, rad, R.win - R.wSize / 2, R.win + R.wSize / 2); c.stroke();
      c.lineWidth = 12; c.strokeStyle = '#ffe36a'; c.beginPath(); c.arc(cx, cy, rad, R.win - R.wSize * .175, R.win + R.wSize * .175); c.stroke(); c.shadowBlur = 0;
      // the needle
      const nx = cx + Math.cos(R.needle) * (rad + 8), ny = cy + Math.sin(R.needle) * (rad + 8);
      c.strokeStyle = R.miss > 0 ? '#ff6a6a' : '#ffffff'; c.lineWidth = 4; c.beginPath(); c.moveTo(cx + Math.cos(R.needle) * (rad - 18), cy + Math.sin(R.needle) * (rad - 18)); c.lineTo(nx, ny); c.stroke();
      c.fillStyle = '#ffffff'; c.beginPath(); c.arc(nx, ny, 5, 0, 7); c.fill();
      // centre: TAP
      c.fillStyle = '#fff'; c.font = '900 16px "Nunito"'; c.textAlign = 'center'; c.textBaseline = 'middle'; c.fillText('TAP!', cx, cy - 6); c.font = '800 10px "Nunito"'; c.fillStyle = '#cfe3d6'; c.fillText('in the window', cx, cy + 10);
      // the tug-of-war
      const bw = Math.min(W * .55, 360), bxl = cx - bw / 2, byy = H - 34;
      c.fillStyle = 'rgba(0,0,0,.7)'; c.fillRect(bxl - 3, byy - 3, bw + 6, 14);
      c.fillStyle = C.ce; c.fillRect(bxl, byy, bw * (1 - C.meter), 8); c.fillStyle = C.cr; c.fillRect(bxl + bw * (1 - C.meter), byy, bw * C.meter, 8);
      c.fillStyle = '#fff'; c.fillRect(bxl + bw * (1 - C.meter) - 2, byy - 4, 4, 16);
      c.font = '900 11px "Nunito"'; c.textAlign = 'left'; c.fillStyle = C.ce; c.fillText(C.e.name.toUpperCase(), bxl, byy + 22); c.textAlign = 'right'; c.fillStyle = C.cr; c.fillText(typeof Veil !== 'undefined' && Veil.on() ? 'RED VEIL' : G.S.name.toUpperCase(), bxl + bw, byy + 22);
      c.restore();
    }
  };
})();
