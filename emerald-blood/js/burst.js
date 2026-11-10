/* ================= KAIGEN (開眼, "opening the eyes") / KAKUSEI (覚醒, "awakening") =================
   One ultimate per fighter, shouted aloud. Drags call theirs KAIGEN — the moment they stop hiding their eyes and their
   war-bred blood wakes. Humans call theirs KAKUSEI — their will rising. Same system, two names, so you hear who's who.
   Every strong human or Drag has one: the moment a fighter becomes everything they are.
   · Heroes: an AURA gauge fills from perfect hits, perfect parries/dodges and the hits you take. When it's full,
     "✦ KAIGEN" (or "✦ KAKUSEI") appears in the menu (a free action). A cut-in, then 3 turns of that fighter's own transformation —
     and afterwards they're SPENT for 2 turns (slower, softer). Once per battle.
   · Rivals and strong humans/Drags you fight burst too, once, when pushed below half health.
   (Monsters, demons and Monarchs will get DOMINIONS — and an Aura Burst is how you crack one.) */
const BURST = {
  me:     { n: 'EMERALD SOVEREIGN', sub: 'Ascension, Azure and Crimson as one', col: '#9dffc8', d: 'Ascension opens for free; Azure and Crimson cost nothing and every Art hits 30% harder.' },
  kess:   { n: 'NIGHTFALL', sub: 'Living Shadow', col: '#b48aff', d: 'Her shadow strikes after every hit (60%), and she slips most blows.' },
  liora:  { n: 'GHOST UNBOUND', sub: 'The ghost walks beside her', col: '#dfeeff', d: 'Ghost Stance fully awake: the ghost hits for 100%, and +20% attack.' },
  oren:   { n: 'FORGEHEART', sub: 'The forge answers', col: '#ff7a3a', d: '+40% attack, +6 DEF, and every hit sets the foe burning.' },
  dace:   { n: 'IRON VOW', sub: 'He does not fall', col: '#3f9a5a', d: '+30% attack, +8 DEF, and he cannot drop below 1 HP.' },
  tamsin: { n: 'WILDFIRE', sub: 'Torchlight to firestorm', col: '#ff9a3a', d: '+3 speed, +25% attack, every hit burns.' }
};
const EBURST = {   // enemies: [name, line, colour]
  vane: ['FIRST SNOW', 'Vane: "Watch closely, pup. This is the last thing most men see."', '#e8f4ff'], vane_spar: ['FIRST SNOW', 'The old man\'s stillness becomes something else entirely.', '#e8f4ff'],
  halvard: ['PALE SAINT', 'Halvard: "Ember, make me your hand!" White fire pours from his eyes.', '#fff3b0'], halvard_pro: ['PALE SAINT', 'Halvard: "Ember, make me your hand!"', '#fff3b0'],
  voss: ['IRON WARDEN', 'Voss locks his shield and plants his feet. The ground cracks.', '#c8d0dc'],
  ge_corran_r: ['THE LAST RULE', 'Corran: "Rule one. Never let them see you bleed. …I\'m breaking it."', '#a8c8ff'],
  ge_dace_r: ['IRON VOW', 'Dace: "I swore I\'d never kneel again."', '#3f9a5a'], ge_tamsin_r: ['WILDFIRE', 'Tamsin\'s torch-blade roars into a pillar of fire.', '#ff9a3a'],
  ge_wren_r: ['FEATHERFALL', 'Wren vanishes into a storm of green feathers.', '#9fe8b0'], sylwen_t: ['TEMPEST', 'Sylwen: "Wind and water — together, now."', '#7fe3ff'],
  garrick_t: ['BULWARK', 'Garrick raises his shield and the air hums.', '#c8b48a'], tilda_t: ['FORGE TEMPER', 'Tilda\'s fists glow orange like metal from the coals.', '#ff9a3a'],
  liora: ['GHOST UNBOUND', 'Liora: "Fine. You want all of me?" A pale ghost steps out of her shadow.', '#dfeeff'], gt_liora: ['GHOST UNBOUND', 'Liora: "Fine. You want all of me?"', '#dfeeff'],
  rook: ['ROOK\'S GAMBIT', 'Rook grins and stops holding back.', '#ffd36a'], reg_captain: ['REGISTRY WRATH', 'The captain\'s badge burns white.', '#e8e8ff'],
  kairo_spar: ['SCAR SPARK', 'Kairo: "Heh. Just a taste."', '#ff7a3a']
};
const Burst = {
  word(a) { const drag = a.side === 'p' ? (a.isMe || (ALLY[a.id] && ALLY[a.id].drag)) : !!(a.E && a.E.drag); return drag ? 'KAIGEN' : 'KAKUSEI'; },
  gain(a, n) { if (!a || a.side !== 'p' || G.S.kid || a.burstUsed || !this.has(a)) return; const was = a.ab || 0; a.ab = Math.min(100, was + n); if (was < 100 && a.ab >= 100) { Battle.text(a, this.word(a) + ' READY', BURST[this.key(a)].col, -86, true); sfx('level'); } },
  key(a) { return a.isMe ? 'me' : a.id; },
  has(a) { const k = this.key(a); if (!BURST[k]) return false; if (k === 'me') return !G.S.kid; return true; },
  async cut(who, title, sub, col, side) {
    const B = Battle.B; if (!B) return; let img = null;
    try { const af = artFor(who, 'anger') || artFor(who, 'neutral'); if (af && af.img) { if (af.img.lazy) { await Promise.race([Art.fetch(af.img), wait(700)]); const a2 = artFor(who, 'anger') || artFor(who, 'neutral'); img = a2 && a2.img && !a2.img.lazy ? a2.img : null; } else img = af.img; } } catch (e) { }
    B.cutin = { img, title, sub, col, t0: performance.now(), side }; B.flash = 1; B.flashCol = '255,255,255'; sfx('art'); B.shake = 10;
    await wait(1250); if (B.cutin && B.cutin.title === title) B.cutin = null;
  },
  async fire(a) {
    const k = this.key(a), D = BURST[k], B = Battle.B; a.burstUsed = 1; a.ab = 0; a.burst = 3;
    await this.cut(k === 'me' ? 'me' : k === 'kess' ? 'kessE' : k, this.word(a) + ' — ' + D.n, D.sub, D.col, 'p');
    Battle.spark(a.x, a.y - 40, D.col, 40); Battle.text(a, D.n, D.col, -60, true);
    if (k === 'me') { if (!a.sight) { a.sightSpd = a.spd * .4; a.spd += a.sightSpd; a.sightAtk = Math.round(a.atk * .3); a.atk += a.sightAtk; } a.sight = Math.max(a.sight || 0, 3); a.eclipse = 3; }
    if (k === 'kess') { Ghost.start(a, 3, .6, true); a.bDodge = 1; }
    if (k === 'liora') { Ghost.start(a, 3, 1, true); a.bAtk = Math.round(a.atk * .2); a.atk += a.bAtk; }
    if (k === 'oren') { a.bAtk = Math.round(a.atk * .4); a.atk += a.bAtk; a.bDef = 6; a.def += 6; a.bBurn = 1; }
    if (k === 'dace') { a.bAtk = Math.round(a.atk * .3); a.atk += a.bAtk; a.bDef = 8; a.def += 8; a.bVow = 1; }
    if (k === 'tamsin') { a.bAtk = Math.round(a.atk * .25); a.atk += a.bAtk; a.bSpd = 3; a.spd += 3; a.bBurn = 1; }
    try { if (B.dominion) { B.dominion.hp = (B.dominion.hp || 3) - 1; Battle.text(a, 'THE DOMINION CRACKS', '#ffffff', -100, true); } } catch (e) { }
    Battle.hud();
  },
  end(a) {
    a.burst = 0; a.eclipse = 0; a.bDodge = 0; a.bBurn = 0; a.bVow = 0;
    if (a.bAtk) { a.atk -= a.bAtk; a.bAtk = 0; } if (a.bDef) { a.def -= a.bDef; a.bDef = 0; } if (a.bSpd) { a.spd -= a.bSpd; a.bSpd = 0; }
    a.spent = 2; a.spSpd = Math.min(3, Math.max(1, Math.round(a.spd * .15))); a.spd -= a.spSpd; a.def -= 2; Battle.text(a, 'SPENT', '#aaaaaa', -40, true);
  },
  async efire(e) {
    const D = EBURST[e.key]; e.eburst = 4; e.eburstUsed = 1;
    await Battle.msg(D[1], 1600);
    const who = /^vane/.test(e.key) ? 'vane' : /^halvard/.test(e.key) ? 'halvard' : /liora/.test(e.key) ? 'liora' : /kairo/.test(e.key) ? 'kairo' : e.key.replace(/_[a-z]+$/, '').replace(/^ge_/, '');
    await this.cut(who, this.word(e) + ' — ' + D[0], e.name, D[2], 'e');
    e.ebAtk = Math.round(e.atk * .3); e.atk += e.ebAtk; e.spd += 3; e.def = (e.def || 0) + 3; const h = Math.round(e.maxHp * .1); e.hp = Math.min(e.maxHp, e.hp + h);
    Battle.text(e, D[0], D[2], -60, true); Battle.spark(e.x, e.y - 40, D[2], 34); Battle.hud();
  }
};
(function () {
  // the gauge fills
  const _tx = Battle.text.bind(Battle);
  Battle.text = function (a, s, ...rest) { try { if (s === 'PERFECT PARRY' || s === 'PERFECT DODGE') Burst.gain(a, 14); } catch (e) { } return _tx(a, s, ...rest); };
  const _rh = Battle.resolveHit.bind(Battle);
  Battle.resolveHit = function (a, t, m, grade, opts) {
    try { if (a && a.side === 'p' && a.eclipse > 0) m *= 1.3; } catch (e) { }
    const hp0 = t ? t.hp : 0;
    const r = _rh(a, t, m, grade, opts);
    try {
      if (a && a.side === 'p' && !(opts && opts.echo)) Burst.gain(a, grade === 'perfect' ? 10 : grade === 'good' ? 4 : 1);
      if (a && a.bBurn && t && t.side === 'e' && !t.ko && t.hp < hp0) { t.burn = 3; t.burnDmg = Math.max(2, Math.round(a.atk * .3)); }
      if (t && t.side === 'e' && !t.ko && EBURST[t.key] && !t.eburstUsed && t.hp < t.maxHp * .5) t.pendBurst = 1;
    } catch (e) { }
    return r;
  };
  // hits taken: fill the gauge; Kess slips blows; Dace's vow holds
  const _dm = Battle.damage.bind(Battle);
  Battle.damage = function (t, dmg, big) {
    try { if (t && t.side === 'p') { if (t.bDodge && Math.random() < .5) { _tx(t, 'SHADOW-STEP', '#b48aff', -30); return; } if (t.bVow && dmg >= t.hp) dmg = Math.max(0, t.hp - 1); } } catch (e) { }
    const hp0 = t ? t.hp : 0, r = _dm(t, dmg, big);
    try { if (t && t.side === 'p' && t.hp < hp0) { Burst.gain(t, (hp0 - t.hp) / t.maxHp * 70); if (t.bVow && t.hp === 1) _tx(t, 'IRON VOW HOLDS', '#3f9a5a', -40, true); } } catch (e) { }
    return r;
  };
  // Azure and Crimson are free during Eclipse
  const _cost = Battle.artCost.bind(Battle);
  Battle.artCost = function (a, k) { const c = _cost(a, k); if (a && a.eclipse > 0 && /azure|crimson|recoil/.test(k)) return 0; return c; };
  // turns tick down
  const _pt = Battle.playerTurn.bind(Battle);
  Battle.playerTurn = async function (a) {
    try { if (a.burst > 0) { a.burst--; if (a.eclipse) a.eclipse--; if (!a.burst) Burst.end(a); } else if (a.spent > 0) { a.spent--; if (!a.spent) { a.spd += a.spSpd || 0; a.def += 2; a.spSpd = 0; } } } catch (e) { }
    return _pt(a);
  };
  const _et = Battle.enemyTurn.bind(Battle);
  Battle.enemyTurn = async function (e) {
    try {
      if (e.pendBurst && !e.eburstUsed && !e.ko) { e.pendBurst = 0; await Burst.efire(e); }
      else if (e.eburst > 0) { e.eburst--; if (!e.eburst) { e.atk -= e.ebAtk || 0; e.spd = Math.max(1, e.spd - 4); e.def = Math.max(0, (e.def || 0) - 3); Battle.text(e, 'BURNED OUT', '#ffb070', -30, true); } }
    } catch (er) { console.warn(er); }
    return _et(e);
  };
  // the menu
  if (typeof CombatX !== 'undefined') {
    const _m = CombatX.menu.bind(CombatX);
    CombatX.menu = function (a, L, done, resolve, reopen) {
      _m(a, L, done, resolve, reopen);
      try { if (a.side === 'p' && Burst.has(a) && !a.burstUsed && (a.ab || 0) >= 100) { const D = BURST[Burst.key(a)];
        L.unshift([`✦ ${Burst.word(a)} — ${D.n}`, `${D.d} Lasts 3 turns, then ${a.name} is SPENT for 2 (slower, softer). Free action — doesn't end your turn.`, async () => { Battle.closeMenu(); await Burst.fire(a); reopen(); }]);
        L[0].mart = 1; } } catch (e) { }
    };
  }
  // drawing: the gauge on each card, the cut-in, the aura
  const _hud = Battle.hud.bind(Battle);
  Battle.hud = function () { const r = _hud(); try { if (G.S.kid) return r; const cards = $$('#bparty .pcard'), P = this.B.actors.filter(a => a.side === 'p');
    cards.forEach((el, i) => { const a = P[i]; if (!a || !Burst.has(a)) return; let s = el.querySelector('.abar'); if (!s) { s = document.createElement('div'); s.className = 'abar'; el.appendChild(s); }
      const D = BURST[Burst.key(a)], f = a.burstUsed ? (a.burst > 0 ? 100 : 0) : (a.ab || 0);
      s.style.cssText = `height:3px;margin-top:2px;border-radius:2px;background:linear-gradient(90deg,${D.col} ${f}%,rgba(255,255,255,.1) 0);${f >= 100 && !a.burstUsed ? 'box-shadow:0 0 6px ' + D.col : ''}`; }); } catch (e) { } return r; };
  const _r = Battle.render.bind(Battle);
  Battle.render = function (c, t) {
    const out = _r(c, t);
    try {
      const B = this.B; if (!B) return out;
      for (const a of B.actors) if (!a.ko && ((a.burst > 0 && a.side === 'p') || a.eburst > 0)) { const col = a.side === 'p' ? BURST[Burst.key(a)].col : EBURST[a.key][2];
        c.save(); c.globalCompositeOperation = 'lighter'; for (let i = 0; i < 3; i++) { const yy = a.y - 20 - ((t / 6 + i * 30) % 90); c.globalAlpha = .5 * (1 - ((t / 6 + i * 30) % 90) / 90); c.strokeStyle = col; c.lineWidth = 2; c.beginPath(); c.ellipse(a.x, yy, 22 + i * 3, 6, 0, 0, 7); c.stroke(); } c.restore(); }
      const C = B.cutin; if (C) {
        const k = Math.min(1, (performance.now() - C.t0) / 1250), w = G.view.w, h = G.view.h, bh = h * .34, y = h * .33, slide = k < .15 ? 1 - k / .15 : k > .85 ? (k - .85) / .15 : 0, dir = C.side === 'p' ? 1 : -1;
        c.save(); c.translate(slide * w * dir, 0); c.fillStyle = 'rgba(4,6,8,.86)'; c.fillRect(0, y, w, bh);
        c.fillStyle = C.col; c.globalAlpha = .9; c.fillRect(0, y - 3, w, 3); c.fillRect(0, y + bh, w, 3); c.globalAlpha = 1;
        for (let i = 0; i < 14; i++) { c.globalAlpha = .18; c.fillStyle = C.col; const lx = ((i * 97 + performance.now() * .9 * dir) % (w + 200)) - 100; c.fillRect(lx, y + 6 + (i * 37) % (bh - 12), 120, 2); }
        c.globalAlpha = 1;
        if (C.img && C.img.width) { const iw = C.img.width, ih = C.img.height, sy = ih * .16, sh = ih * .3, dw = bh * (iw / sh) * .9, dx = C.side === 'p' ? w * .06 : w - w * .06 - dw;
          c.save(); c.beginPath(); c.rect(0, y, w, bh); c.clip(); c.drawImage(C.img, 0, sy, iw, sh, dx, y + bh * .05, dw, bh * .9); c.restore(); }
        c.textAlign = C.side === 'p' ? 'right' : 'left'; const tx = C.side === 'p' ? w * .86 : w * .05;
        c.font = `900 ${Math.round(bh * .22)}px Nunito, sans-serif`; c.fillStyle = '#ffffff'; c.shadowColor = C.col; c.shadowBlur = 16; c.fillText(C.title, tx, y + bh * .5);
        c.shadowBlur = 0; c.font = `700 ${Math.round(bh * .1)}px Nunito, sans-serif`; c.fillStyle = C.col; c.fillText(C.sub, tx, y + bh * .75); c.restore();
      }
    } catch (e) { }
    return out;
  };
  // fresh each battle
  const _st = Battle.start.bind(Battle);
  Battle.start = function (cfg) { return _st(cfg); };
})();
