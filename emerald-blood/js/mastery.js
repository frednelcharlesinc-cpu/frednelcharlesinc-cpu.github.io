/* ================= MASTERY =================
   Every core ability grows by being USED. Each use is 1 mastery point (2 if you land a PERFECT during it).
   Ten levels, and the climb is steep: level 10 takes 300 points.
   Every level: +6% power for that ability. Milestone levels unlock new behaviour, Skill Points and titles.
   AZURE TIDE (blue) grows into CONTROL: longer, more swallows, swallowed attacks thrown back, the orb guards allies,
     heals the party, roams free and strikes on its own.
   CRIMSON TIDE (red) grows into DESTRUCTION: harder, the blast spreads, burns, shatters guards, chain-detonates,
     splits in two, and at the end levels the whole enemy line.
   Kess, Liora and Oren each have core abilities that grow the same way. */
const MASTERY_XP = [0, 4, 10, 20, 35, 55, 80, 115, 160, 220, 300];
const MASTERY = {
  /* who: [art key, display name, colour, milestones {level: text}] */
  CORE: {
    me: [
      ['azure', 'Azure Tide', '#5fd8ff', { 1: 'RECOIL — once the orb has swallowed an attack, Azure Recoil throws everything it holds back at the enemy line', 2: 'The orb holds 1 more turn', 3: 'The orb swallows 1 more attack', 4: 'REFLECT — swallowed attacks are thrown back at the attacker', 5: 'GUARDIAN — the orb throws itself in front of allies, even against blades', 6: 'TIDAL MEND — every swallow heals the whole party', 7: '+1 turn, +1 swallow', 8: 'FREE ORB — the orb roams the field and strikes on its own each turn', 9: 'UNDERTOW — the orb swallows ANY attack, on anyone (+2 swallows)', 10: 'BOUNDLESS TIDE — +1 turn, the free orb strikes twice, reflections hit 150%' }],
      ['crimson', 'Crimson Tide', '#ff5a4a', { 2: 'Crimson burns hotter (+6% per level)', 3: 'BLAST — the explosion splashes every other enemy for 40%', 4: 'SCORCH — the target burns for 3 turns', 5: 'SHATTER — the hit breaks guards and shields outright', 6: 'The blast splash grows to 70%', 7: 'CHAIN DETONATION — if it kills, it explodes again across the whole line', 8: 'Crimson costs 25% less MP', 9: 'OVERLOAD — the sphere splits; a second one hits another enemy', 10: 'CRIMSON CATACLYSM — the blast hits EVERY enemy at full power' }],
      ['recoil', 'Azure Recoil', '#9fe8ff', { 3: 'The recoil hits 20% harder', 6: 'The recoil also stuns — every enemy loses time', 10: 'TIDE TURNED — the orb survives the release' }],
      ['fang', 'Emerald Fang', '#46ff95', { 3: '−20% MP cost', 5: 'The cut also breaks guard twice as hard', 7: 'Every Fang heals you 6% HP', 10: 'FANG OF THE SEVEN — the cut strikes a second time for 60%' }],
      ['ward', 'Emerald Field', '#7dffb0', { 3: 'The field lasts 1 more turn', 5: 'The field covers the whole party', 7: 'While up, you regenerate 4% HP per turn', 10: 'BASTION — the field lasts 2 more turns' }],
      ['sight', 'Emerald Ascension', '#e8fff4', { 3: 'Ascension lasts 1 more turn', 5: 'Awakening costs 25% less', 7: 'Your first Art in Ascension is free', 10: 'OPEN EYES — Ascension lasts 2 more turns and you start it with full MP' }],
      ['horizon', 'Horizon Draw', '#cfe8ff', { 3: '−20% MP cost', 6: 'Every foe it cuts takes heavy guard damage', 10: 'HORIZON OF VANE — +30% damage' }],
      ['ghost', 'Ghost Stance', '#dfeeff', { 3: 'The stance lasts 1 more turn', 5: 'Your ghost strikes for 15% more', 7: 'Entering the stance costs no MP', 10: 'THE STUDENT SURPASSES — a second ghost follows you' }]],
    kess: [
      ['shadowfang', 'Shadow Fang Flurry', '#c9a6ff', { 3: '−20% MP cost', 5: 'The flurry tears through guards', 7: '+15% damage', 10: 'THOUSAND SHADOWS — the flurry also cuts a second, random enemy for 60%' }],
      ['umbra', 'Umbral Rain', '#9a7ad0', { 3: '−20% MP cost', 6: 'The rain shakes every enemy\'s nerve', 10: 'NIGHT STORM — +40% damage' }]],
    liora: [
      ['ghost', 'Ghost Stance', '#dfeeff', { 3: 'The stance lasts 1 more turn', 5: 'The ghost strikes for 15% more', 7: 'Entering the stance costs no MP', 10: 'TWO GHOSTS — a second ghost follows her too' }],
      ['eleven', 'The Eleventh Step', '#fff6c8', { 3: 'She starts every battle with 2 in the count', 5: 'The Step hits 20% harder', 7: 'She starts every battle with 4 in the count', 10: 'SEREN\'S LAST COUNT — her Ghost Stance from the Step lasts 5 turns' }],
      ['wyrm', 'Wyrmpiercer', '#ffd36a', { 3: '−20% MP cost', 6: 'The thrust leaves the target burning', 10: 'DRAGON-SLAYER — +30% damage' }]],
    oren: [
      ['cleave', 'Forge Cleave', '#ff9a3a', { 3: '−20% MP cost', 6: 'The cleave splits the guard in one blow', 10: 'MOUNTAIN SPLITTER — the cleave also hits every other enemy for 50%' }]]
  },
  st() { const S = G.S; S.mastery = S.mastery || {}; return S.mastery; },
  key(who, k) { return who + ':' + k; },
  pts(who, k) { return this.st()[this.key(who, k)] || 0; },
  lv(who, k) { const p = this.pts(who, k); let l = 0; while (l < 10 && p >= MASTERY_XP[l + 1]) l++; return l; },
  whoOf(a) { return a.isMe ? 'me' : a.id; },
  def(who, k) { return (this.CORE[who] || []).find(c => c[0] === k); },
  gain(who, k, n) {
    if (!this.def(who, k) || !G.S || G.S.kid) return;
    const before = this.lv(who, k); this.st()[this.key(who, k)] = this.pts(who, k) + n; const after = this.lv(who, k);
    if (after > before) this.levelUp(who, k, after);
  },
  levelUp(who, k, L) {
    const D = this.def(who, k), name = D[1], col = D[2], ms = D[3][L];
    const nm = who === 'me' ? G.S.name : (ALLY[who] && ALLY[who].name) || who;
    let gift = '';
    if (L % 3 === 0) { G.S.sp = G.S.sp || {}; G.S.sp[who] = (G.S.sp[who] || 0) + 1; gift = ' · +1 Skill Point'; }
    if (L === 10) { G.S.titles = G.S.titles || []; const t = `Master of the ${name}`; if (!G.S.titles.includes(t)) G.S.titles.push(t); gift += ` · Title: ${t}`; }
    toast(`<b style="color:${col}">${name} — MASTERY ${L}</b> (${nm})${ms ? `<br>${ms}` : ''}${gift}`, 5200); sfx('level');
    if (Battle.B) { const a = Battle.B.actors.find(x => this.whoOf(x) === who); if (a) Battle.text(a, `${name.toUpperCase()} MASTERY ${L}`, col, -88, true); }
  }
};

(function () {
  const M = MASTERY, B_ = () => Battle.B;
  const L = (a, k) => a && a.side === 'p' ? M.lv(M.whoOf(a), k) : 0;

  /* ---------- earning mastery: use the ability ---------- */
  const _use = Battle.useArt.bind(Battle);
  Battle.useArt = async function (a, k) {
    const B = this.B, perf0 = B && B.st ? B.st.perf + B.st.pp : 0, who = M.whoOf(a);
    B.lastArtKey = k; B.lastArtBy = a; B.crimsonHit = null; B.artHit = null;
    const r = await _use(a, k);
    try {
      if (a.side === 'p') { const perfect = B.st && (B.st.perf + B.st.pp) > perf0; M.gain(who, k, perfect ? 2 : 1); }
      if (k === 'azure' && a.isMe) azureAfter(a);
      if (k === 'crimson' && a.isMe) await crimsonAfter(a);
      await otherAfter(a, k);
      if (k === 'fang' && a.isMe && L(a, k) >= 7) { const h = Math.round(a.maxHp * .06); a.hp = Math.min(a.maxHp, a.hp + h); this.text(a, '+' + h + ' HP', '#46ff95', -40); }
      if (k === 'ward' && a.isMe) { const l = L(a, k); if (l >= 3) a.ward = (a.ward || 0) + (l >= 10 ? 3 : 1); if (l >= 5) for (const p of this.alive('p')) if (p !== a) p.ward = Math.max(p.ward || 0, 2); }
      if (k === 'sight' && a.isMe) { const l = L(a, k); if (l >= 3) a.sight = (a.sight || 0) + (l >= 10 ? 3 : 1); if (l >= 10) a.mp = a.maxMp; if (l >= 7) a.freeArt = 1; }
      this.hud();
    } catch (e) { console.warn(e); }
    return r;
  };
  /* every level: +6% power, plus the capstone boosts */
  const CAP = { horizon: [10, 1.3], shadowfang: [7, 1.15], umbra: [10, 1.4], wyrm: [10, 1.3] };
  const _am = Skills.artMul.bind(Skills);
  Skills.artMul = function (who, k) { const l = M.def(who, k) ? M.lv(who, k) : 0; const c = CAP[k] && l >= CAP[k][0] ? CAP[k][1] : 1; return _am(who, k) * (1 + l * .06) * c; };
  async function otherAfter(a, k) {
    const B = B_(), h = B && B.artHit, l = L(a, k); if (!l) return;
    const brk = t => { if (t && !t.ko) { t.brk = Math.min(t.brkMax, t.brk + Math.round(t.brkMax * .3)); Battle.checkBreak(t); } };
    if (k === 'fang' && h) { if (l >= 5) brk(h.t); if (l >= 10 && !h.t.ko) { Battle.text(h.t, 'FANG OF THE SEVEN', '#46ff95', -70); _rh(a, h.t, h.m * .6, 'good', { unblockable: 1 }); } }
    if (k === 'horizon' && l >= 6) for (const e of Battle.alive('e')) brk(e);
    if (k === 'shadowfang' && h) { if (l >= 5) brk(h.t); if (l >= 10) { const o = Battle.alive('e').filter(e => e !== h.t); if (o.length) { const e = o[Math.floor(Math.random() * o.length)]; typeof Ghost !== 'undefined' && Ghost.echoFx(a, 0, 360, .5); Battle.text(e, 'THOUSAND SHADOWS', '#c9a6ff', -70); _rh(a, e, h.m * .6, 'good', { unblockable: 1 }); } } }
    if (k === 'umbra' && l >= 6 && typeof CombatX !== 'undefined') for (const e of Battle.alive('e')) CombatX.shake(e, 25, 'umbra');
    if (k === 'wyrm' && h && l >= 6 && !h.t.ko) { h.t.burn = 3; h.t.burnDmg = Math.max(2, Math.round(a.atk * .4)); Battle.text(h.t, 'BURNING', '#ff9a3a', -70); }
    if (k === 'cleave' && h) { if (l >= 6 && !h.t.ko) { h.t.brk = h.t.brkMax; Battle.checkBreak(h.t); } if (l >= 10) for (const e of Battle.alive('e').filter(e => e !== h.t)) { Battle.spark(e.x, e.y - 30, '#ff9a3a', 12); _rh(a, e, h.m * .5, 'good', { unblockable: 1 }); } }
  }
  /* cheaper with practice */
  const _ac = Battle.artCost.bind(Battle);
  Battle.artCost = function (a, k) {
    let c = _ac(a, k); if (!a || a.side !== 'p') return c;
    if (a.freeArt && k !== 'sight') return 0;
    const l = L(a, k);
    if (k === 'crimson' && l >= 8) c = Math.max(1, Math.round(c * .75));
    else if (k === 'sight' && l >= 5) c = Math.max(1, Math.round(c * .75));
    else if (['fang', 'horizon', 'shadowfang', 'umbra', 'wyrm', 'cleave'].includes(k) && l >= 3) c = Math.max(1, Math.round(c * .8));
    return c;
  };
  const _use2 = Battle.useArt;
  Battle.useArt = async function (a, k) { const free = a.freeArt && k !== 'sight'; const r = await _use2.call(this, a, k); if (free) a.freeArt = 0; return r; };

  /* ---------- AZURE: control ---------- */
  function azureAfter(a) {
    const B = B_(), l = L(a, 'azure'); if (!B || !B.orb || B.orb.owner !== a) return;
    a.azure += (l >= 2 ? 1 : 0) + (l >= 7 ? 1 : 0) + (l >= 10 ? 1 : 0);
    B.orb.charges += (l >= 3 ? 1 : 0) + (l >= 7 ? 1 : 0) + (l >= 9 ? 2 : 0);
    B.orb.lv = l;
    if (l >= 4) Battle.text(a, `AZURE · MASTERY ${l}`, '#9fe8ff', -64);
  }
  const swallow = async function (e, t, sk) {
    const B = B_(), o = B.orb, ow = o.owner, l = o.lv || 0;
    await Battle.msg(`${t !== ow ? 'The Azure orb throws itself in front of ' + t.name + ' — and ' : 'The Azure orb '}swallows ${sk.name}!`, 900);
    sfx('heal'); B.flash = .3; ow.mp = Math.min(ow.maxMp, ow.mp + 2);
    B.fx.push({ orb: 1, kind: 'draw', x: o.x, y: o.y, t: 0, life: 700 }); Battle.text(ow, 'ABSORBED +2 MP', '#5fd8ff', -40);
    await afterSwallow(e, sk, l);
    if (--o.charges <= 0) { B.orb = null; Battle.text(ow, 'The orb is full — it bursts', '#5fd8ff', -60); }
    Battle.hud();
  };
  async function afterSwallow(e, sk, l) {
    const B = B_(); if (!B) return;
    if (e) { const pw = (sk.hits || []).reduce((q, h) => q + (h.m || 1), 0); B.azStore = (B.azStore || 0) + Math.round(e.atk * pw * 1.1); }
    if (l >= 6) { for (const p of Battle.alive('p')) { const h = Math.round(p.maxHp * .08); p.hp = Math.min(p.maxHp, p.hp + h); Battle.text(p, '+' + h, '#7dffb0', -30); } }
    if (l >= 4 && e && !e.ko) {
      const pow = (sk.hits || []).reduce((s, h) => s + (h.m || 1), 0), dmg = Math.max(1, Math.round(e.atk * pow * 1.2 * (l >= 10 ? 1.5 : 1)));
      const o = B.orb || { x: e.x + 200, y: e.y - 60 };
      B.fx.push({ beam: 1, blue: 1, x1: o.x, y1: o.y, x2: e.x, y2: e.y - 30, t: 0, life: 420 }); sfx('art'); await wait(220);
      Battle.damage(e, dmg, true); Battle.spark(e.x, e.y - 30, '#5fd8ff', 22); Battle.text(e, 'REFLECTED', '#9fe8ff', -60, true);
      await wait(300);
    }
  }
  const _es = Battle.enemyStrike.bind(Battle);
  Battle.enemyStrike = async function (e, t, sk, isCounter) {
    const B = this.B, o = B && B.orb;
    if (o && t && t.side === 'p' && !isCounter) {
      const l = o.lv || 0, ranged = sk.hits[0].anim === 'spellcast' || sk.hits.every(h => h.proj), el = typeof elOf === 'function' && elOf(sk);
      // Guardian (allies, once per round) and Undertow (anyone, any attack): the orb takes blades too
      if (!ranged && !el && ((l >= 9) || (l >= 5 && t !== o.owner && !o.guarded))) { if (l < 9) o.guarded = 1; await this.msg(`${e.name}: ${sk.name}`, 650); await swallow(e, t, sk); return; }
      if (ranged || el) { const before = o.charges; const r = await _es(e, t, sk, isCounter); if (B.orb !== o || o.charges < before) await afterSwallow(e, sk, l); return r; }
    }
    return _es(e, t, sk, isCounter);
  };
  /* the free orb strikes on its own at the start of Ren's turn */
  const _pt = Battle.playerTurn.bind(Battle);
  Battle.playerTurn = function (a) {
    const B = this.B;
    if (a && a.isMe && a.ward > 0 && L(a, 'ward') >= 7) { const h = Math.round(a.maxHp * .04); a.hp = Math.min(a.maxHp, a.hp + h); this.text(a, '+' + h, '#7dffb0', -30); }
    if (a && a.isMe && B && B.orb && B.orb.owner === a) {
      B.orb.guarded = 0; const l = B.orb.lv || 0;
      if (l >= 8) {
        const n = l >= 10 ? 2 : 1;
        return (async () => {
          for (let i = 0; i < n; i++) {
            const es = this.alive('e'); if (!es.length || !B.orb) break; const t = es[Math.floor(Math.random() * es.length)];
            B.fx.push({ beam: 1, blue: 1, x1: B.orb.x, y1: B.orb.y, x2: t.x, y2: t.y - 30, t: 0, life: 380 }); sfx('art');
            this.spark(t.x, t.y - 30, '#5fd8ff', 16); this.text(t, 'FREE ORB', '#9fe8ff', -50);
            this.resolveHit(a, t, .7 * (1 + l * .06), 'good', { unblockable: 1, src: 'azure_orb' }); await wait(380);
          }
          return _pt(a);
        })();
      }
    }
    return _pt(a);
  };

  /* ---------- CRIMSON: destruction ---------- */
  const _rh = Battle.resolveHit.bind(Battle);
  Battle.resolveHit = function (a, t, m, grade, opts) {
    const B = this.B;
    if (B && opts && opts.src === 'crimson' && a && a.isMe) B.crimsonHit = { t, m, grade };
    if (B && opts && opts.src && B.lastArtKey === opts.src && a && a.side === 'p') B.artHit = { t, m };
    return _rh(a, t, m, grade, opts);
  };
  async function crimsonAfter(a) {
    const B = B_(), h = B && B.crimsonHit, l = L(a, 'crimson'); if (!h || !l) return;
    const t = h.t, others = () => Battle.alive('e').filter(e => e !== t);
    if (l >= 5 && !t.ko) { t.shield = 0; t.brk = t.brkMax; Battle.checkBreak(t); Battle.text(t, 'SHATTERED', '#ff8a6a', -70); }
    if (l >= 4 && !t.ko) { t.burn = 3; t.burnDmg = Math.max(2, Math.round(a.atk * .5)); Battle.text(t, 'SCORCHED', '#ff7a3a', -82); }
    const splash = l >= 10 ? 1 : l >= 6 ? .7 : l >= 3 ? .4 : 0;
    if (splash) {
      if (l >= 10) { B.flash = 1; B.flashCol = '255,90,60'; B.shake = 22; await Battle.msg('CRIMSON CATACLYSM', 800); }
      for (const e of others()) { B.fx.push({ burst: 1, red: 1, x: e.x, y: e.y - 30, t: 0, life: 600 }); Battle.spark(e.x, e.y - 30, '#ff5a4a', 18); _rh(a, e, h.m * splash, 'good', { unblockable: 1, pierce: 1, src: 'crimson_blast' }); await wait(110); }
    }
    if (l >= 9) {
      const pool = others(); if (pool.length) { const e = pool[Math.floor(Math.random() * pool.length)]; B.fx.push({ beam: 1, x1: a.x - 30, y1: a.y - 46, x2: e.x, y2: e.y - 30, t: 0, life: 360 }); await wait(200);
        B.fx.push({ burst: 1, red: 1, x: e.x, y: e.y - 30, t: 0, life: 700 }); Battle.text(e, 'OVERLOAD', '#ff6a5a', -70); _rh(a, e, h.m * .5, 'good', { unblockable: 1, pierce: 1, src: 'crimson_blast' }); await wait(200); }
    }
    if (l >= 7 && t.ko) {
      const es = Battle.alive('e'); if (es.length) { await Battle.msg('CHAIN DETONATION', 700); B.flash = .8; B.flashCol = '255,80,50'; B.shake = 16;
        for (const e of es) { B.fx.push({ burst: 1, red: 1, x: e.x, y: e.y - 30, t: 0, life: 700 }); _rh(a, e, h.m * .6, 'good', { unblockable: 1, pierce: 1, src: 'crimson_blast' }); await wait(120); } }
    }
    Battle.hud();
  }
  /* burns tick on the enemy's turn */
  const _et = Battle.enemyTurn.bind(Battle);
  Battle.enemyTurn = async function (e) {
    if (e && e.burn > 0 && !e.ko) { e.burn--; Battle.damage(e, e.burnDmg || 3, false); Battle.text(e, 'BURN -' + (e.burnDmg || 3), '#ff7a3a', -40); Battle.spark(e.x, e.y - 30, '#ff7a3a', 8); await wait(300); if (e.ko) return; }
    return _et(e);
  };

  /* ---------- the others' cores ---------- */
  if (typeof Ghost !== 'undefined') {
    const _gs = Ghost.start.bind(Ghost);
    Ghost.start = function (a, turns, mult, big) {
      const who = M.whoOf(a), l = M.lv(who, 'ghost');
      if (who === 'liora' || who === 'me') M.gain(who, 'ghost', 1);
      if (who === 'liora' || who === 'me') { if (l >= 3) turns++; if (l >= 5) mult *= 1.15; if (big && M.lv('liora', 'eleven') >= 10) turns = Math.max(turns, 5); if (l >= 7 && !big) a.mp += Ghost.MP[who] || 0; }
      _gs(a, turns, mult, big); a.ghost2 = (who === 'liora' || who === 'me') && l >= 10;
    };
  }
  if (typeof Eleven !== 'undefined') {
    const _st = Eleven.step.bind(Eleven);
    Eleven.step = async function (a, t) { const l = M.lv('liora', 'eleven'); if (l >= 5) a.atk = Math.round(a.atk * 1.2); const r = await _st(a, t); if (l >= 5) a.atk = Math.round(a.atk / 1.2); M.gain('liora', 'eleven', 2); return r; };
    // a head start on the count
    const _start = Battle.start.bind(Battle);
    Battle.start = function (cfg) {
      const p = _start(cfg);
      setTimeout(() => { try { const l = M.lv('liora', 'eleven'), Lr = Battle.B && Battle.B.actors.find(x => x.id === 'liora'); if (Lr && l >= 3) Lr.count = Math.max(Lr.count || 0, l >= 7 ? 4 : 2); } catch (e) { } }, 1500);
      return p;
    };
  }
  /* two ghosts at Ghost Stance mastery 10 */
  const _rh2 = Battle.resolveHit;
  Battle.resolveHit = function (a, t, m, grade, opts) {
    const r = _rh2.call(this, a, t, m, grade, opts);
    if (r === 'hit' && a && a.ghost2 && a.ghostT > 0 && t && t.side === 'e' && opts && opts.echo && !opts.echo2) {
      const B = this.B; setTimeout(() => { if (Battle.B !== B || t.ko) return; Ghost.echoFx(a, -34, 420, .5); _rh2.call(Battle, a, t, m, 'good', Object.assign({}, opts, { echo2: 1 })); Battle.text(t, 'GHOST ×2', '#dfeeff', -66); }, 190);
    }
    return r;
  };
})();

/* ---------- AZURE RECOIL: everything the orb swallowed, thrown back at once ---------- */
(function () {
  const M = MASTERY;
  async function recoil(a) {
    const B = Battle.B, l = M.lv('me', 'recoil'), store = B.azStore || 0, o = B.orb; if (!store) return;
    Battle.closeMenu && Battle.closeMenu(); a.mp -= 4; Battle.hud();
    const es = Battle.alive('e'); if (!es.length) return;
    const cx = es.reduce((q, t) => q + t.x, 0) / es.length, cy = es.reduce((q, t) => q + t.y, 0) / es.length - 70;
    await Battle.msg('AZURE RECOIL', 700); sfx('chant');
    const ox = o ? o.x : a.x - 30, oy = o ? o.y : a.y - 80;
    B.fx.push({ orb: 1, kind: 'draw', x: ox, y: oy, t: 0, life: 900 }); B.dim = .6; B.dimCol = '0,20,50';
    const fake = o || { x: ox, y: oy }; const t0 = performance.now();
    while (true) { const k = Math.min(1, (performance.now() - t0) / 420); fake.x = ox + (cx - ox) * k; fake.y = oy + (cy - oy) * k - Math.sin(k * Math.PI) * 30; if (k >= 1) break; await wait(16); }
    B.flash = .9; B.flashCol = '120,220,255'; B.shake = 18; sfx('crit');
    const dmg = Math.max(1, Math.round(store * .8 * (1 + l * .06) * (l >= 3 ? 1.2 : 1)));
    for (const t of es) { B.fx.push({ beam: 1, blue: 1, x1: cx, y1: cy, x2: t.x, y2: t.y - 30, t: 0, life: 420 }); B.fx.push({ burst: 1, x: t.x, y: t.y - 30, t: 0, life: 700 });
      Battle.damage(t, dmg, true); Battle.spark(t.x, t.y - 30, '#9fe8ff', 24); Battle.text(t, 'RECOIL', '#9fe8ff', -64, true); if (l >= 6 && !t.ko) t.wait += 30; await wait(120); }
    B.azStore = 0; B.dim = 0;
    if (o && l < 10) { B.orb = null; Battle.text(a, 'The orb is spent', '#5fd8ff', -50); }
    M.gain('me', 'recoil', 1); Battle.hud(); await wait(400);
  }
  if (typeof CombatX !== 'undefined') {
    const _m = CombatX.menu.bind(CombatX);
    CombatX.menu = function (a, L, done, resolve, reopen) {
      _m(a, L, done, resolve, reopen);
      const B = Battle.B;
      if (a.isMe && B && (G.S.arts || []).includes('azure') && (B.azStore || 0) > 0) {
        const it = ['Azure Recoil', `Throw back everything the orb has swallowed this battle (${B.azStore} power) at EVERY enemy.`, () => recoil(a).then(done), a.mp < 4, 4];
        it.mart = 1; L.splice(1, 0, it);
      }
    };
  }
})();
