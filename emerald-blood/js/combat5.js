/* =====================================================================
   COMBAT III
   · MP is precious: every Art costs more, and enemies have their own MP — their
     special techniques spend it, so they can run dry too. Tonics and Ethers matter.
   · Ren starts his adult life with the core Drag Arts: Fang, Field, Crimson, Azure.
   · TRANSFORM: Emerald Ascension is its own command now, not an Art.
   · BLACK FLASH: critical hits crack the screen with black lightning, hit far
     harder, and trigger an effect unique to whoever landed them.
   · D-STONES: bosses and elites crush a D-stone when they're losing — phase two:
       SURGE    — a green glow: health back and stronger stats
       OVERLOAD — last resort: huge power, but the stone eats the user every turn
       FAITH    — Inquisition stones: techniques full of faith, hard to dodge or parry
   ===================================================================== */

/* ---------------- MP costs ---------------- */
(function () {
  const COST = { fang: 7, ward: 5, ruin: 15, cleave: 7, needle: 7, wyrm: 8, moonstep: 5, sight: 0, azure: 10, crimson: 14, horizon: 11, mirage: 14, veil: 5, sever: 7 };
  for (const [k, v] of Object.entries(COST)) if (ARTS[k]) ARTS[k].mp = v;
  for (const L of Object.values(LINKS)) L.mp = L.mp.map(x => Math.round(x * 1.5));
})();

/* ---------------- Ren's core Arts ---------------- */
setInterval(() => { try { const S = G.S; if (!S || S.kid || !S.f || !S.f.vaneDone) return; for (const k of ['fang', 'ward', 'crimson', 'azure']) if (!S.arts.includes(k)) S.arts.push(k); } catch (e) { } }, 1500);

/* ---------------- Black Flash: the skill branch ---------------- */
TREES.me.branches['Black Flash'] = [
  { id: 'f1', name: 'Spark of Black', desc: 'Black Flash triggers more often (+6%).', cost: 1 },
  { id: 'f2', name: 'Emerald Return', desc: 'A Black Flash returns more MP and health to Ren.', cost: 1, req: 'f1' },
  { id: 'f3', name: 'Afterimage', desc: 'After a Black Flash, your next hit lands ×1.4 harder.', cost: 2, req: 'f2' }
];

const CRIT = {
  // [name, effect(actor, battle)] — chosen to strengthen what each fighter already does
  me: ['Emerald Return', (a, BT) => { const lv = Skills.has('me', 'f2') ? 2 : 1, mp = 2 + lv * 2, hp = Math.round(a.maxHp * (.03 + lv * .03)); a.mp = Math.min(a.maxMp, a.mp + mp); a.hp = Math.min(a.maxHp, a.hp + hp); BT.text(a, `+${mp} MP · +${hp} HP`, '#7dffb0', -84); if (Skills.has('me', 'f3')) a.afterimage = 1; }],
  kess: ['Shadow Slip', (a, BT) => { a.mp = Math.min(a.maxMp, a.mp + 3); a.veil = 1; a.alpha = .5; BT.text(a, 'VANISHES · +3 MP', '#c9a6ff', -84); }],
  dace: ['Door-Breaker', (a, BT) => { if ((a.critStack || 0) < 3) { a.critStack = (a.critStack || 0) + 1; a.atk += 3; } BT.text(a, 'ATK UP', '#8ad35a', -84); }],
  tamsin: ['Ember Heart', (a, BT) => { a.atk += 2; a.spd += 1; BT.text(a, 'ATK & SPD UP', '#ff8a3a', -84); }],
  oren: ['Anvil Stance', (a, BT) => { a.def += 2; const h = Math.round(a.maxHp * .06); a.hp = Math.min(a.maxHp, a.hp + h); BT.text(a, `DEF UP · +${h}`, '#c87a3a', -84); }],
  liora: ['Moon Rhythm', (a, BT) => { a.spd += 2; a.mp = Math.min(a.maxMp, a.mp + 2); BT.text(a, 'SPD UP · +2 MP', '#ff9ccc', -84); }],
  kairo: ['Scar Fuel', (a, BT) => { if ((a.critStack || 0) < 3) { a.critStack = (a.critStack || 0) + 1; a.atk = Math.round(a.atk * 1.12); } BT.text(a, 'THE SCARS BURN HOTTER', '#ff6a2a', -84); }],
  faith: ['Faith Ward', (a, BT) => { a.barrier = (a.barrier || 0) + Math.round(a.maxHp * .15); BT.text(a, `FAITH WARD ${a.barrier}`, '#fff3b0', -84); }],
  iron: ['Iron Resolve', (a, BT) => { a.def += 3; if (a.E && a.E.guard) a.guardCharge = 1; if (a.shield !== undefined && a.E && a.E.shield) a.shield = Math.min(a.E.shield, (a.shield || 0) + 1); BT.text(a, 'DEF UP', '#cfd8e8', -84); }],
  cutpurse: ['Quickened', (a, BT) => { a.wait *= .4; BT.text(a, 'MOVES AGAIN SOON', '#ffd36a', -84); }],
  beast: ['Blood Frenzy', (a, BT) => { const h = Math.round(a.maxHp * .08); a.hp = Math.min(a.maxHp, a.hp + h); a.spd += 1; BT.text(a, `FRENZY +${h}`, '#ff8a6a', -84); }],
  vane: ['Empty Sleeve', (a, BT) => { a.stance = 1; BT.text(a, 'STANCE', '#cfe8ff', -84); }],
  dread: ['Black Sun', (a, BT) => { const h = Math.round(a.maxHp * .1); a.hp = Math.min(a.maxHp, a.hp + h); BT.text(a, 'DRINKS THE LIGHT', '#46ff95', -84); }],
  hunter: ['Seal Bite', (a, BT, t) => { if (t) { const d = Math.min(t.mp, 3); t.mp -= d; BT.text(t, `−${d} MP`, '#c9a46a', -60); } }],
  wyrm: ['Mana Gorge', (a, BT) => { const h = Math.round(a.maxHp * .1); a.hp = Math.min(a.maxHp, a.hp + h); a.mp = (a.mp || 0) + 3; BT.text(a, `GORGES +${h}`, '#46ff95', -84); }],
  archer: ['Steady Aim', (a, BT) => { a.atk += 2; BT.text(a, 'ATK UP', '#d8f08a', -84); }],
  fury: ['Fury', (a, BT) => { a.atk = Math.round(a.atk * 1.1); BT.text(a, 'ATK UP', '#ff8a6a', -84); }]
};
function critKind(a) {
  if (a.isMe) return 'me';
  if (a.side === 'p') return CRIT[a.id] ? a.id : 'fury';
  const k = a.key || '', g = typeof GE_RIVAL !== 'undefined' && GE_RIVAL[k];
  if (g === 'dace' || g === 'tamsin') return g; if (g === 'wren') return 'archer'; if (g === 'corran') return 'iron';
  if (/^kairo/.test(k)) return 'kairo'; if (/^(halvard|verity|acolyte|pale_priest|inq_clerk|will_verdict)/.test(k)) return 'faith';
  if (/^(voss|reg_captain|ember_warden|guard)/.test(k)) return 'iron'; if (/^(bandit|rook|tollman)/.test(k)) return 'cutpurse';
  if (/^(lupine|rime|m_|b_)/.test(k)) return 'beast'; if (/^vane/.test(k)) return 'vane'; if (k === 'dread') return 'dread';
  if (k === 'stone_hunter') return 'hunter'; if (k === 'mana_wyrm') return 'wyrm';
  return 'fury';
}
const BlackFlash = {
  play(t, a) {
    const B = Battle.B; if (!B) return;
    B.bflash = { t0: performance.now(), x: t.x, y: t.y - 30 * BT_SCALE * (t.size || 1), bolts: Array.from({ length: 7 }, () => ({ a: Math.random() * Math.PI * 2, l: 80 + Math.random() * 160, seed: Math.random() * 99 })) };
    B.hitstop = Math.max(B.hitstop || 0, 200); B.shake = 16; B.punch = .09; B.punchX = t.x; B.punchY = t.y - 30;
    sfx('blackflash');
    const [nm, fn] = CRIT[critKind(a)] || CRIT.fury;
    Battle.text(a, `BLACK FLASH — ${nm}`, '#ff5a5a', -100, true);
    try { fn(a, Battle, t); } catch (e) { }
    if (a.isMe) G.S.f.blackFlashes = (G.S.f.blackFlashes || 0) + 1;
    Battle.hud();
  }
};

/* ---------------- enemy MP ---------------- */
const skillMp = (e, sk) => { const pool = e.E.skills.filter(s => s.hits); if (!sk || !sk.hits || sk === pool[0]) return 0; if (sk.faith) return 6; return sk.hits.some(h => h.unp) ? 8 : sk.hits.length >= 3 ? 5 : sk.hits.some(h => h.proj || h.anim === 'spellcast') ? 4 : 3; };

/* ---------------- D-stones ---------------- */
const STONE_KIND = k => {
  if (/^(halvard|verity|will_verdict|acolyte|pale_priest|inq_clerk)/.test(k)) return 'faith';
  if (/^(voss|reg_captain|stone_hunter|ember_warden|tollman|guard)/.test(k)) return 'overload';
  return 'surge';
};
const FAITH_SKILLS = [
  { name: 'Stone-Faith Lance', faith: 1, hits: [{ anim: 'spellcast', m: 1.5, w: 560, faith: 1 }] },
  { name: 'Litany of the Green Stone', faith: 1, hits: [{ anim: 'slash', m: .7, w: 460, faith: 1 }, { anim: 'thrust', m: .7, w: 300, faith: 1 }, { anim: 'spellcast', m: 1, w: 420, faith: 1 }] }
];
Object.assign(SKILL_EL, { 'Stone-Faith Lance': 'light', 'Litany of the Green Stone': 'light' });
function stoneEligible(e) {
  if (!e || e.side !== 'e' || e.E.fixed || e.E.drag || e.panic || e.stoned) return false;
  if (/^(kairo|vane|dread)/.test(e.key) || (typeof GE_RIVAL !== 'undefined' && GE_RIVAL[e.key])) return false;
  const ti = ['E', 'D', 'C', 'B', 'A', 'S', 'SS', 'SSS', 'SSSS'].indexOf(TIER[e.key] || 'E');
  return e.E.boss || ti >= 2;
}
async function crushStone(BT, e) {
  const B = BT.B, kind = STONE_KIND(e.key); e.stoned = kind;
  B.dim = .55; B.dimCol = '0,30,10'; sfx('chant');
  await BT.msg(`${e.name} crushes a D-stone against their chest!`, 1300);
  B.flash = 1; B.flashCol = '90,255,150'; sfx('crit'); B.shake = 14; BT.pillar && BT.pillar(e.x, e.y);
  for (let i = 0; i < 40; i++) BT.spark(e.x + rnd(-20, 20), e.y - rnd(0, 70), pick(['#46ff95', '#9dffc8', '#ffffff']), 1);
  if (kind === 'surge') { const h = Math.round(e.maxHp * .2); e.hp = Math.min(e.maxHp, e.hp + h); e.atk = Math.round(e.atk * 1.2); e.def += 3; e.brk = 0; e.broken = 0; BT.text(e, `D-STONE SURGE  +${h} HP · ATK & DEF UP`, '#46ff95', -70, true); await BT.msg('Green light pours out of the stone and into their wounds.', 1300); }
  else if (kind === 'overload') { const h = Math.round(e.maxHp * .1); e.hp = Math.min(e.maxHp, e.hp + h); e.atk = Math.round(e.atk * 1.5); e.spd += 3; e.brk = 0; e.broken = 0; BT.text(e, 'D-STONE OVERLOAD — ATK ×1.5 · SPD UP', '#46ff95', -70, true); await BT.msg('The stone is too much for a human body. It is burning them from the inside — every turn.', 1700); }
  else { const h = Math.round(e.maxHp * .15); e.hp = Math.min(e.maxHp, e.hp + h); e.mp = (e.maxMp || 20); e.faith = 1; BT.text(e, `D-STONE FAITH  +${h} HP`, '#fff3b0', -70, true); await BT.msg('Their prayers come back with a voice of their own. Their next techniques will be almost impossible to dodge or parry.', 1800); }
  B.dim = 0; BT.hud();
}

(function () {
  const BT = Battle;
  /* ---------- setup: enemy MP ---------- */
  const _run = BT.run.bind(BT);
  BT.run = async function () {
    const B = this.B;
    try {
      for (const e of B.actors.filter(a => a.side === 'e')) { const ti = Math.max(0, ['E', 'D', 'C', 'B', 'A', 'S', 'SS', 'SSS', 'SSSS'].indexOf(TIER[e.key] || 'E')); e.maxMp = 8 + ti * 4 + (e.E.boss ? 8 : 0); e.mp = Math.round(e.maxMp * .6); }
    } catch (x) { }
    return _run();
  };
  /* ---------- enemies choose what they can afford ---------- */
  const _cs = BT.chooseSkill.bind(BT);
  BT.chooseSkill = function (e) {
    if (e.faith && e.mp >= 6 && Math.random() < .6) return pick(FAITH_SKILLS);
    const sk = _cs(e); if (!e.E || e.maxMp === undefined) return sk;
    const c = skillMp(e, sk); if (c > (e.mp || 0)) return e.E.skills.filter(s => s.hits)[0] || sk;
    return sk;
  };
  const _es = BT.enemyStrike.bind(BT);
  BT.enemyStrike = async function (e, t, sk, isCounter) {
    if (e.side === 'e' && !isCounter && sk && e.maxMp !== undefined) { const c = skillMp(e, sk); if (c) { e.mp = Math.max(0, (e.mp || 0) - c); } }
    return _es(e, t, sk, isCounter);
  };
  const _et = BT.enemyTurn.bind(BT);
  BT.enemyTurn = async function (e) {
    const B = this.B;
    if (e.maxMp !== undefined) e.mp = Math.min(e.maxMp, (e.mp || 0) + 2);
    // phase two: the D-stone
    if (stoneEligible(e) && !e.ko) {
      const want = STONE_KIND(e.key) === 'overload' ? .3 : .5;
      if (e.hp <= e.maxHp * want) { await crushStone(this, e); return; }
    }
    if (e.stoned === 'overload' && !e.ko) { const d = Math.max(1, Math.round(e.maxHp * .07)); e.hp = Math.max(1, e.hp - d); this.text(e, `THE STONE BURNS −${d}`, '#46ff95', -40); this.hud(); }
    return _et(e);
  };
  /* ---------- faith attacks: hard to dodge or parry ---------- */
  const _def = BT.defend.bind(BT);
  BT.defend = function (e, t, h) {
    const B = this.B;
    if (h && h.faith) { B.faithNow = 1; h = Object.assign({}, h, { style: 'snap' }); }
    return _def(e, t, h).then(r => { B.faithNow = 0; return r; });
  };
  const _rf = BT.reflex.bind(BT);
  BT.reflex = function (a) { let k = _rf(a); if (this.B && this.B.faithNow && a && a.side === 'p') k *= .6; return k; };
  /* ---------- Black Flash: your hits ---------- */
  const _rh = BT.resolveHit.bind(BT);
  BT.resolveHit = function (a, t, m, grade, opts) {
    opts = opts || {};
    let crit = false;
    if (a.side === 'p' && t.side === 'e' && !t.ko && opts.src !== 'counter' && !(this.B && this.B.cfg.leafTrain)) {
      const p = (grade === 'perfect' ? .15 : grade === 'good' ? .05 : 0) + (a.isMe && Skills.has('me', 'f1') ? .06 : 0);
      if (Math.random() < p) { crit = true; m *= 1.75; }
    }
    if (a.afterimage && a.isMe && t.side === 'e') { a.afterimage = 0; m *= 1.4; this.text(a, 'AFTERIMAGE', '#ff8a8a', -64); }
    const r = _rh(a, t, m, grade, opts);
    if (crit && r === 'hit') BlackFlash.play(t, a);
    return r;
  };
  /* ---------- Black Flash: their hits ---------- */
  const _chip = BT.chip.bind(BT);
  BT.chip = function (e, t, m, full, el) {
    if (full && e.side === 'e' && t.side === 'p' && !(this.B && this.B.cfg.leafTrain) && Math.random() < (e.E && e.E.boss ? .1 : .07)) {
      const r = _chip(e, t, m * 1.6, full, el); BlackFlash.play(t, e); return r;
    }
    return _chip(e, t, m, full, el);
  };
  /* ---------- the transformation is its own command ---------- */
  if (typeof CombatX !== 'undefined') {
    const _m = CombatX.menu.bind(CombatX);
    CombatX.menu = function (a, L, done, resolve, reopen) {
      _m(a, L, done, resolve, reopen);
      if (a.isMe && a.arts && a.arts.includes('sight') && !this.B().cfg.noArts) {
        const cost = Battle.artCost(a, 'sight'), flow = Math.min(5, a.flow || 0), active = !!a.sight;
        const ok = !active && (a.mp >= cost) && !a.fever;
        L.splice(1, 0, [active ? `Ascended · ${a.sight}` : 'Transform', active ? `EMERALD ASCENSION is active — ${a.sight} turn${a.sight > 1 ? 's' : ''} left.` : `TRANSFORMATION — Emerald Ascension. Your eyes open all the way: effortless dodges and perfect parries, +40% speed, +30% attack. ${flow >= 5 ? 'FREE: you are in the flow.' : `Costs ${cost} MP — or free after 5 perfect dodges/parries in a row (flow ${flow}/5).`}`,
          () => { if (!ok) return; Battle.closeMenu(); Battle.useArt(a, 'sight').then(done); }, !ok, active ? undefined : cost]);
      }
    };
  }
  /* ---------- drawing: enemy MP, stone glow, black flash ---------- */
  const _r = BT.render.bind(BT);
  BT.render = function (c, t) {
    const B = this.B;
    if (B && !B.clashOn) {
      for (const a of B.actors) if (a.stoned && !a.ko) { c.save(); c.globalCompositeOperation = 'lighter'; const s = BT_SCALE * (a.size || 1), p = .35 + Math.sin(t / 140) * .15, g = c.createRadialGradient(a.x, a.y - 30 * s, 4, a.x, a.y - 30 * s, 60 * s); const col = a.stoned === 'faith' ? '255,240,170' : '70,255,140'; g.addColorStop(0, `rgba(${col},${p})`); g.addColorStop(1, `rgba(${col},0)`); c.fillStyle = g; c.fillRect(a.x - 70 * s, a.y - 100 * s, 140 * s, 130 * s); c.restore(); if (Math.random() < .4) B.fx.push({ x: a.x + rnd(-18, 18), y: a.y - rnd(0, 60), vx: rnd(-.3, .3), vy: rnd(-1.6, -.6), life: rnd(400, 800), t: 0, col: a.stoned === 'faith' ? '#fff3b0' : '#7dffb0', s: rnd(1.4, 2.6) }); }
    }
    _r(c, t);
    if (!B) return;
    if (!B.clashOn) for (const a of B.actors) if (a.side === 'e' && !a.ko && a.maxMp) { const bw = 44, x = a.x - bw / 2, y = a.y - 76 + 8; c.fillStyle = 'rgba(0,0,0,.7)'; c.fillRect(x - 1, y, bw + 2, 4); c.fillStyle = '#4aa8ff'; c.fillRect(x, y + 1, bw * Math.min(1, a.mp / a.maxMp), 2); }
    const F = B.bflash; if (F) {
      const k = (performance.now() - F.t0) / 420; if (k >= 1) { B.bflash = null; return; }
      const W = G.view.w, H = G.view.h;
      c.save();
      c.fillStyle = `rgba(0,0,0,${k < .15 ? .92 : .92 * (1 - (k - .15) / .85)})`; c.fillRect(0, 0, W, H);
      if (k < .08) { c.fillStyle = 'rgba(255,255,255,.9)'; c.fillRect(0, 0, W, H); }
      c.lineCap = 'round'; c.lineJoin = 'round';
      for (const b of F.bolts) {
        let x = F.x, y = F.y, ang = b.a; const pts = [[x, y]]; let r = b.seed;
        for (let i = 0; i < 9; i++) { r = (r * 9301 + 49297) % 233280; ang += (r / 233280 - .5) * 1.1; const step = b.l / 9 * (1 + k); x += Math.cos(ang) * step; y += Math.sin(ang) * step; pts.push([x, y]); }
        for (const [w, col] of [[7, `rgba(200,0,20,${1 - k})`], [3, `rgba(20,0,0,${1 - k})`], [1.2, `rgba(255,120,120,${1 - k})`]]) { c.strokeStyle = col; c.lineWidth = w; c.beginPath(); pts.forEach(([px, py], i) => i ? c.lineTo(px, py) : c.moveTo(px, py)); c.stroke(); }
      }
      c.globalCompositeOperation = 'lighter'; const g = c.createRadialGradient(F.x, F.y, 0, F.x, F.y, 60); g.addColorStop(0, `rgba(255,60,60,${1 - k})`); g.addColorStop(1, 'rgba(255,0,0,0)'); c.fillStyle = g; c.fillRect(F.x - 60, F.y - 60, 120, 120);
      c.globalCompositeOperation = 'source-over'; c.globalAlpha = Math.min(1, (1 - k) * 2); c.font = `900 ${Math.round(H * .09)}px "Nunito"`; c.textAlign = 'center'; c.lineWidth = 6; c.strokeStyle = '#000'; c.strokeText('BLACK FLASH', W / 2, H * .3); c.fillStyle = '#ff3a3a'; c.fillText('BLACK FLASH', W / 2, H * .3);
      c.restore();
    }
  };
})();
// the sound of a black flash: a crack, a low boom, a ringing tail
(function () { const _s = sfx; sfx = function (t) { if (t === 'blackflash' && G.settings.sfx && AC && typeof SFX2 !== 'undefined') { try { SFX2.nz(.04, .7, 'highpass', 4000); SFX2.osc(55, .6, 'sine', .6, 25); SFX2.nz(.5, .35, 'bandpass', 2400, 300, 2); SFX2.ring(620, .9, .14, .02); SFX2.osc(1900, .4, 'sawtooth', .04, 400, .01); } catch (e) { } return; } return _s(t); }; })();
// trophies for the new systems
if (typeof FEATS !== 'undefined') FEATS.push(['bflash1', '⚡', 'Black Flash', 'Land a Black Flash.', S => (S.f.blackFlashes || 0) >= 1], ['bflash10', '⚡', 'The Spark Between', 'Land 10 Black Flashes.', S => (S.f.blackFlashes || 0) >= 10]);

// the command row: keep the chosen button in view and show arrows when the row scrolls
(function () {
  const list = $('#cmdList'), box = $('#cmdBox');
  const upd = () => { if (!list || !box) return; box.classList.toggle('more', list.scrollLeft + list.clientWidth < list.scrollWidth - 4); box.classList.toggle('less', list.scrollLeft > 4); };
  if (list) list.addEventListener('scroll', upd, { passive: true });
  const _om = Battle.openMenu.bind(Battle); Battle.openMenu = function (L, c) { const r = _om(L, c); if (list) list.scrollLeft = 0; requestAnimationFrame(upd); return r; };
  const _sel = Battle.sel.bind(Battle); Battle.sel = function (i) { const r = _sel(i); const b = list && list.children[i]; if (b && b.scrollIntoView) b.scrollIntoView({ block: 'nearest', inline: 'nearest' }); requestAnimationFrame(upd); return r; };
})();
