/* ================= TRANSCENSION =================
   One ultimate per fighter, shouted aloud: the moment a fighter transcends what they were. Stage I (half-open) first,
   Stage II (full release + finisher) through the story. The only thing that cracks a monster's Dominion.
   Every strong human or Drag has one: the moment a fighter becomes everything they are.
   · Heroes: an AURA gauge fills from perfect hits, perfect parries/dodges and the hits you take. When it's full,
     "✦ TRANSCENSION" appears in the menu (a free action). A cut-in, then 3 turns of that fighter's own transformation —
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
  word(a) { return 'TRANSCENSION'; },
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
        if (C.ban && C.ban.naturalWidth) { const bw = C.ban.naturalWidth, bhh = C.ban.naturalHeight, sc = Math.max(w / bw, bh / bhh), dw = bw * sc, dh = bhh * sc;
          c.save(); c.beginPath(); c.rect(0, y, w, bh); c.clip(); c.globalAlpha = .9; c.drawImage(C.ban, (w - dw) / 2 + (1 - k) * 30 * dir, y + (bh - dh) / 2, dw, dh);
          const gr = c.createLinearGradient(0, 0, w, 0); gr.addColorStop(0, 'rgba(4,6,8,.75)'); gr.addColorStop(.32, 'rgba(4,6,8,.15)'); gr.addColorStop(.6, 'rgba(4,6,8,.15)'); gr.addColorStop(1, 'rgba(4,6,8,.8)'); c.globalAlpha = 1; c.fillStyle = gr; c.fillRect(0, y, w, bh); c.restore(); }
        if (C.fig && C.fig.naturalWidth) { const fw = C.fig.naturalWidth, fh = C.fig.naturalHeight, sh = fh * .62, dh = bh * 1.08, dw = fw * dh / sh;
          c.save(); c.beginPath(); c.rect(0, y, w, bh); c.clip(); c.drawImage(C.fig, 0, 0, fw, sh, w * .03, y + bh - dh * .98, dw, dh); c.restore(); }
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
/* ================= TRANSCENSION STAGES, FINISHERS, AND THE FIRST DOMINION =================
   · STAGE I (half-open): what every fighter starts with — 2 turns, weaker effects, SPENT for 1 turn after.
   · STAGE II (full release): unlocked by that fighter's story moment, or by mastering Stage I (8 uses).
     3 turns at full strength — and once during it, the fighter's FINISHER.
   · DOMINIONS: monsters, demons and Monarchs rewrite the battlefield. Only a Transcension cracks one:
     Stage I cracks it, perfect hits during a release crack it further, Stage II shatters it outright. */
const FINISH = {
  me: { n: 'ECLIPSE CONVERGENCE', m: 3.2, all: 1, d: 'Azure and Crimson merge into one beam that tears through every enemy.' },
  kess: { n: 'THOUSAND SHADOWS', m: 2.4, all: 1, d: 'Every shadow on the field strikes at once.' },
  liora: { n: 'ELEVENTH GHOST', m: 3, d: 'Eleven ghosts, one spear, one target.' },
  oren: { n: 'WORLD ANVIL', m: 2.8, all: 1, d: 'The ground becomes the forge. Everything on it burns.' },
  dace: { n: 'VOW BREAKER', m: 3.4, d: 'A single cleave with everything he swore.' },
  tamsin: { n: 'FIRESTORM', m: 2.2, all: 1, d: 'A storm of torch-fire over the whole field.' }
};
const UNLOCK = { me: () => G.S.f.chapter1Done, kess: () => G.S.f.kessOath, liora: () => G.S.f.trialWalked };
Object.assign(Burst, {
  uses(k) { const S = G.S; S.kaigen = S.kaigen || {}; return S.kaigen[k] || 0; },
  stage(a) { const k = this.key(a); return (UNLOCK[k] && UNLOCK[k]()) || this.uses(k) >= 8 ? 2 : 1; }
});
(function () {
  const _fire = Burst.fire.bind(Burst);
  Burst.fire = async function (a) {
    const k = this.key(a), st = this.stage(a), B = Battle.B;
    const D = BURST[k], keepN = D.n, keepSub = D.sub;
    if (st === 1) { D.n = keepN + ' · I'; D.sub = 'Half-open — ' + keepSub; }
    try { await _fire(a); } finally { D.n = keepN; D.sub = keepSub; }
    G.S.kaigen = G.S.kaigen || {}; const before = this.uses(k); G.S.kaigen[k] = before + 1;
    if (st === 1) {   // weaker: 2 turns, softer numbers, a shorter crash
      a.burst = 2; a.stage1 = 1; if (a.bAtk) { const cut = Math.round(a.bAtk * .4); a.atk -= cut; a.bAtk -= cut; } if (a.bDef) { a.def -= 3; a.bDef -= 3; }
      if (k === 'me' && a.eclipse) a.eclipse = 2; if (typeof Ghost !== 'undefined' && a.ghostT) { a.ghostT = 2; a.ghostMult = (a.ghostMult || 1) * .7; }
      if (before + 1 === 8 && !(UNLOCK[k] && UNLOCK[k]())) setTimeout(() => toast(`<b style="color:${D.col}">${esc(a.name)} has mastered the half-open ${this.word(a)}.</b> The full release — Stage II — is unlocked.`, 5200), 1200);
    } else { a.stage1 = 0; a.finisher = 1; }
    if (B && B.dominion && !B.dominion.gone) { if (st === 2) Dom.shatter(); else Dom.crack(a, 1); }
  };
  const _end = Burst.end.bind(Burst);
  Burst.end = function (a) { _end(a); a.finisher = 0; if (a.stage1) { a.spent = 1; a.stage1 = 0; } };
  // the finisher, once, during a Stage II release
  const _m = CombatX.menu.bind(CombatX);
  CombatX.menu = function (a, L, done, resolve, reopen) {
    _m(a, L, done, resolve, reopen);
    try { const k = Burst.key(a), F = FINISH[k]; if (a.side === 'p' && a.burst > 0 && a.finisher && F) {
      const it = [`✦ ${F.n}`, `${F.d} Your ${Burst.word(a)} finisher — once per release. Ends your turn.`, async () => { Battle.closeMenu(); a.finisher = 0; await finisher(a, F); done(); }]; it.mart = 1; L.unshift(it); } } catch (e) { }
  };
  async function finisher(a, F) {
    const BT = Battle, B = BT.B, k = Burst.key(a), col = BURST[k].col;
    await Burst.cut(k === 'me' ? 'me' : k === 'kess' ? 'kessE' : k, F.n, BURST[k].n, col, 'p');
    const ts = F.all ? BT.alive('e') : [BT.alive('e').sort((x, y) => y.hp - x.hp)[0]];
    if (k === 'me' && typeof FXS !== 'undefined' && FXS.ok('eclipse')) { FXS.play('eclipse', 'merge', a.x - 40, a.y - 60, { dur: 700, sc: .6 }); await wait(700); FXS.play('eclipse', 'charged', a.x - 40, a.y - 60, { dur: 500, sc: .7 }); await wait(500);
      for (const t of ts) FXS.play('eclipse', 'beam', (a.x + t.x) / 2, t.y - 40, { dur: 600, sc: 1.4, flip: true }); await wait(450); for (const t of ts) FXS.play('eclipse', 'collapse', t.x, t.y - 40, { dur: 800, sc: 1 }); }
    B.flash = 1.4; B.flashCol = '255,255,255'; B.shake = 18; sfx('crit');
    for (const t of ts) { if (!t || t.ko) continue; BT.spark(t.x, t.y - 40, col, 30); BT.resolveHit(a, t, F.m, 'perfect', { unblockable: 1, src: 'finisher' }); await wait(160); }
    if (B.dominion && !B.dominion.gone) Dom.shatter();
    BT.hud();
  }
  // Stage II unlocked by story: tell the player once
  setInterval(() => { try { if (!G.S || G.S.kid) return; G.S.f.kgSeen = G.S.f.kgSeen || {}; for (const k in UNLOCK) if (UNLOCK[k]() && !G.S.f.kgSeen[k] && (k === 'me' || (G.S.party || []).includes(k))) { G.S.f.kgSeen[k] = 1; const nm = k === 'me' ? G.S.name : (ALLY[k] || {}).name; setTimeout(() => toast(`<b style="color:${BURST[k].col}">${esc(nm)}'s Transcension — full release unlocked.</b> Stage II: 3 turns, full power, and a finisher.`, 5200), 800); } } catch (e) { } }, 4000);
  // drowned perfect hits during a release crack a Dominion
  const _rh = Battle.resolveHit.bind(Battle);
  Battle.resolveHit = function (a, t, m, grade, opts) { const r = _rh(a, t, m, grade, opts); try { const B = this.B; if (B && B.dominion && !B.dominion.gone && a && a.side === 'p' && a.burst > 0 && grade === 'perfect' && !(opts && opts.echo)) Dom.crack(a, 1); } catch (e) { } return r; };
})();
/* ---------- DOMINIONS ---------- */
const DOMINION = {
  reef_wyrm: { n: 'DROWNED DOMINION', at: .7, col: '95,240,255', line: 'Thalassar: "Down here, the sea decides who breathes."',
    rule: 'The deep pulls: your party moves at half speed, and every turn the tide crushes everyone for 6% of their health. A TRANSCENSION is the only way to break it.' }
};
const Dom = {
  async open(e) {
    const D = DOMINION[e.key], B = Battle.B; e.domDone = 1;
    B.dim = .7; B.dimCol = '0,20,40'; B.shake = 16; sfx('break'); await Battle.msg(D.line, 1800);
    await Burst.cut(e.key === 'reef_wyrm' ? 'reef_wyrm' : e.key, D.n, e.name, `rgb(${D.col})`, 'e');
    B.dim = 0; B.dominion = { key: e.key, n: D.n, col: D.col, hp: 3, owner: e, t0: performance.now() };
    for (const p of Battle.alive('p')) { p.domSpd = p.spd * .5; p.spd -= p.domSpd; }
    await Battle.msg(D.n + ' — ' + D.rule, 3200); Battle.hud();
  },
  crack(a, n) { const d = Battle.B.dominion; d.hp -= n; Battle.text(a, d.hp > 0 ? `DOMINION CRACKS (${d.hp})` : 'DOMINION BREAKS', '#ffffff', -100, true); Battle.B.flash = .7; sfx('break'); if (d.hp <= 0) this.shatter(); },
  shatter() {
    const B = Battle.B, d = B.dominion; if (!d || d.gone) return; d.gone = 1; B.flash = 1.4; B.flashCol = '200,250,255'; B.shake = 20; sfx('crit');
    for (const p of B.actors) if (p.side === 'p' && p.domSpd) { p.spd += p.domSpd; p.domSpd = 0; }
    const o = d.owner; if (o && !o.ko) { o.broken = 2; o.brk = o.brkMax; Battle.text(o, 'DOMINION SHATTERED — STUNNED', '#ffffff', -70, true); }
    setTimeout(() => toast(`<b>${d.n} shattered.</b> The world is yours again.`, 3000), 300); Battle.hud();
  }
};
(function () {
  const _rh = Battle.resolveHit.bind(Battle);
  Battle.resolveHit = function (a, t, m, grade, opts) { const r = _rh(a, t, m, grade, opts); try { if (t && t.side === 'e' && DOMINION[t.key] && !t.domDone && !t.ko && t.hp < t.maxHp * DOMINION[t.key].at) t.pendDom = 1; } catch (e) { } return r; };
  const _et = Battle.enemyTurn.bind(Battle);
  Battle.enemyTurn = async function (e) {
    try {
      if (e.pendDom && !e.domDone && !e.ko) { e.pendDom = 0; await Dom.open(e); }
      const d = this.B && this.B.dominion; if (d && !d.gone && d.owner === e) { for (const p of this.alive('p')) { const h = Math.max(1, Math.round(p.maxHp * .06)); this.damage(p, h, false); this.text(p, 'THE TIDE -' + h, `rgb(${d.col})`, -20); } this.hud(); await wait(300); }
    } catch (er) { console.warn(er); }
    return _et(e);
  };
  const _r = Battle.render.bind(Battle);
  Battle.render = function (c, t) {
    const B = this.B, d = B && B.dominion;
    if (d && !d.gone) { const w = G.view.w, h = G.view.fullH || G.view.h; c.save(); c.fillStyle = `rgba(${d.col},.12)`; c.fillRect(0, 0, w, h); c.restore(); }
    const out = _r(c, t);
    try { if (d && !d.gone) { const w = G.view.w, h = G.view.fullH || G.view.h; c.save(); c.globalCompositeOperation = 'lighter'; c.strokeStyle = `rgba(${d.col},.25)`; c.lineWidth = 2;
      for (let i = 0; i < 9; i++) { const y = ((t / 18 + i * 60) % (h + 60)) - 30; c.beginPath(); for (let x = 0; x <= w; x += 20) c.lineTo(x, y + Math.sin(x / 50 + t / 400 + i) * 6); c.stroke(); }
      c.font = '800 12px Nunito, sans-serif'; c.fillStyle = `rgba(${d.col},.9)`; c.textAlign = 'center'; c.fillText(`${d.n} · cracks left: ${d.hp}`, w * .27, h * .34); c.restore(); } } catch (e) { }
    return out;
  };
})();
/* Ren's Stage II wears its own sprite sheet (assets/hd/ren_t2 — the user's Emerald Sovereign art) */
(function () {
  const swap = (B, set) => { try { if (!B || typeof HD === 'undefined' || !HD.on() || !HD.img[set]) return; const im = HD.sheet(set, HD.meta[set].faces !== 'left'); if (!im) return; im.__hd.me = 1; B.renBts = im; } catch (e) { } };
  const _f = Burst.fire.bind(Burst);
  Burst.fire = async function (a) { const st = this.stage(a); const r = await _f(a); if (a.isMe && st === 2) { swap(Battle.B, 'ren_t2'); if (HD.meta.ren_t2.anims.land) { const n = performance.now(); HD.act = { name: 'land', t0: n, end: n + 900 }; } } return r; };
  const _e = Burst.end.bind(Burst);
  Burst.end = function (a) { const r = _e(a); if (a.isMe) swap(Battle.B, HD.battleSet()); return r; };
})();

/* Ren's own Transcension cut-in art: robed Stage I / flame-aura Stage II, with the glowing-eyes banner behind */
(function () {
  const L = n => { const i = new Image(); i.src = 'assets/burst/' + n; return i; };
  const R = { p1: L('ren_p1.png'), p2: L('ren_p2.png'), eyes: L('ren_eyes.jpg') };
  const _c = Burst.cut.bind(Burst);
  Burst.cut = async function (who, title, sub, col, side) {
    if (who !== 'me') return _c(who, title, sub, col, side);
    const B = Battle.B; if (!B) return; let st = 1; try { const me = B.actors.find(a => a.isMe); if (me) st = this.stage(me); } catch (e) { }
    B.cutin = { img: null, fig: st === 2 ? R.p2 : R.p1, ban: R.eyes, title, sub, col, t0: performance.now(), side }; B.flash = 1; B.flashCol = '255,255,255'; sfx('art'); B.shake = 10;
    await wait(1250); if (B.cutin && B.cutin.title === title) B.cutin = null;
  };
})();
