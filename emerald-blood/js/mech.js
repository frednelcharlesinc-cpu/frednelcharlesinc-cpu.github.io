'use strict';
/* ================= COMBAT MECHANICS (from the Combat Design file) =================
   6  OVERDRAW — hold DRAW in the Four Cuts: the first cut hits ×1.8, but an enemy can interrupt it.
   7  AMBUSH — walk (don't run) through tall grass and you may spot a pack before it spots you: your first strike is a guaranteed PERFECT and hits harder.
   8  STONE SKILLS — every equipped Heartshard gives one active skill, once per battle.
   12 FACTIONS — Inquisition fighters carry BRANDED SHIELDS (only Fall / Break moves or a guard BREAK crack them);
      beasts make you BLEED (Guard stops it); Gate-spawn wear DEMON HIDE (only Needle / Pierce goes straight through).
   15 GATE AFFIXES — every dungeon visit rolls one affix: no items, frenzied foes, thick hides, or a bounty. */
const MECH = {
  BRANDED: ['acolyte', 'ember_warden', 'pale_priest', 'verity', 'inq_clerk', 'stone_hunter', 'halvard'],
  BEAST: /^(lupine|lupine_alpha|rime_lupine|rime_alpha|m_ratfolk|m_tusker|m_drake|gt_rat|m_lizard)$/,
  DEMON: /^(gt_|m_ghoul$|m_skeleton$|m_vampire$|b_lich$|mana_wyrm$)/,
  SKILL: {
    fang: ['Fang Lunge', 'A lunging pierce that ignores parries and shields. ×1.6.'],
    scale: ['Scale Ward', 'Your skin hardens: the next two hits on you are cut to 40%.'],
    breath: ['Second Breath', 'Draw mana from the stone: +6 MP and cool your blood.'],
    still: ['Still Mind', 'Your next strike is a guaranteed PERFECT.'],
    echo: ['Echo Decoy', 'Leave an afterimage: the next attack aimed at you hits the echo instead.'],
    riverheart: ['River Mend', 'The stone sings: heal 25% HP.'],
    verdict: ['Pale Judgement', 'A ×2.2 strike — it costs 10% of your HP.'],
    quarry: ['Anchor Hold', 'Plant yourself: Guard, and break the enemy\'s next stance or charge.']
  },
  AFFIX: {
    noItems: ['No Mercy', 'Items cannot be used in this Gate.', '#ff8a8a'],
    frenzy: ['Frenzied', 'Monsters hit 15% harder.', '#ff9a5a'],
    thick: ['Thick Hides', 'Monsters have 25% more HP.', '#ffd36a'],
    bounty: ['Bounty', 'Monsters drop 50% more gold.', '#7dffb0']
  },
  inGate() { return G.S && /^(d_|r_)/.test(G.S.map || ''); }
};
(function () {
  if (typeof Battle === 'undefined') return;
  const BT = Battle;

  /* ---------- 15: gate affixes, rolled on entering a dungeon ---------- */
  const _l = World.load.bind(World);
  World.load = async function (name, x, y, dir) {
    const prev = G.S && G.S.map, r = await _l(name, x, y, dir);
    try { if (/^(d_|r_)/.test(name) && !/^(d_|r_)/.test(prev || '')) { const k = pick(Object.keys(MECH.AFFIX)); G.S.affix = k; const A = MECH.AFFIX[k]; setTimeout(() => toast(`Gate affix: <b style="color:${A[2]}">${A[0]}</b> — ${A[1]}`, 4200), 900); }
      else if (!/^(d_|r_)/.test(name)) G.S.affix = null; } catch (e) { }
    return r;
  };

  /* ---------- battle start: ambush, affixes, branded shields, once-per-battle skills ---------- */
  const _start = BT.start.bind(BT);
  BT.start = function (cfg) {
    const c = typeof cfg === 'string' ? { enemies: [cfg] } : cfg;
    try { if (c && c.ambushRoll && !c.noFlee && Math.random() < .35 && World.player && !(World.player.move && World.player.move.ms < 160)) c.ambush = 1; } catch (e) { }
    return _start(c);
  };
  const _run = BT.run.bind(BT);
  BT.run = async function () {
    const B = this.B;
    try {
      B.stoneUsed = {};
      const gate = MECH.inGate() && G.S.affix;
      for (const e of B.actors.filter(a => a.side === 'e')) {
        if (MECH.BRANDED.includes(e.key)) e.brand = 1;
        if (gate === 'thick') { e.maxHp = Math.round(e.maxHp * 1.25); e.hp = e.maxHp; }
        if (gate === 'frenzy') e.atk = Math.round(e.atk * 1.15);
      }
      if (B.cfg.ambush) {
        const me = B.actors.find(a => a.isMe); if (me) { me.focus = 1; me.ambush = 1; }
        setTimeout(() => { BT.text(me, 'AMBUSH!', '#7dffb0', -70, true); toast('You spotted them first — your first strike is a guaranteed <b>PERFECT</b> and hits harder.', 3200); }, 900);
      }
    } catch (e) { console.warn(e); }
    return _run();
  };
  // world grass encounters may roll an ambush
  const _onStep = World.onStep && World.onStep.bind(World);
  if (_onStep) {
    World.onStep = function (e) {
      const s = this.scene; if (s && s.encounters && !s.__ambushWrap) { s.__ambushWrap = 1; const enc = s.encounters.bind(s); s.encounters = function () { const r = enc(); if (r && typeof r === 'object' && !Array.isArray(r)) r.ambushRoll = 1; return r; }; }
      return _onStep(e);
    };
  }

  /* ---------- 12: branded shields, demon hide, ambush power ---------- */
  const _rh = BT.resolveHit.bind(BT);
  BT.resolveHit = function (a, t, m, grade, opts) {
    opts = opts || {};
    if (a && a.ambush && a.isMe) { a.ambush = 0; m *= 1.5; }
    if (t && t.side === 'e' && !t.ko) {
      if (t.brand) {
        if (opts.role === 'S' || t.broken) { t.brand = 0; this.text(t, 'BRAND CRACKED', '#ffd34a', -44, true); sfx('break'); }
        else { m *= .5; if (!t.__brandTip || performance.now() - t.__brandTip > 2500) { t.__brandTip = performance.now(); this.text(t, 'BRANDED SHIELD', '#ffb04a', -44); } }
      }
      if (MECH.DEMON.test(t.key || '') && !opts.pierce && opts.role !== 'P') { m *= .7; if (!t.__hideTip || performance.now() - t.__hideTip > 2500) { t.__hideTip = performance.now(); this.text(t, 'DEMON HIDE', '#c9a6ff', -44); } }
    }
    return _rh(a, t, m, grade, opts);
  };

  /* ---------- beasts make you bleed; the echo decoy takes a hit; scale ward softens ---------- */
  const _es = BT.enemyStrike.bind(BT);
  BT.enemyStrike = async function (e, t, sk, isCounter) {
    if (t && t.decoy) { t.decoy = 0; this.text(t, 'ECHO TAKES THE HIT', '#9fe4ff', -60, true); sfx('dodge'); t.afterimg = 600; await wait(500); return; }
    BT.__src = e; try { return await _es(e, t, sk, isCounter); } finally { BT.__src = null; }
  };
  const _dm = BT.damage.bind(BT);
  BT.damage = function (t, dmg, big) {
    if (t && t.side === 'p' && dmg > 0) {
      if (t.scaleWard) { t.scaleWard--; dmg = Math.ceil(dmg * .4); this.text(t, 'SCALE WARD', '#9fd8ff', -50); }
      const src = BT.__src; if (src && MECH.BEAST.test(src.key || '') && !t.guard && !t.ko) { if (!t.bleed) this.text(t, 'BLEEDING', '#ff5a5a', -60); t.bleed = 2; }
    }
    if (t && t.side === 'e' && dmg > 0 && MECH.inGate() && G.S.affix === 'bounty') t.bounty = 1;
    return _dm(t, dmg, big);
  };
  const _pt = BT.playerTurn.bind(BT);
  BT.playerTurn = function (a) {
    if (a.bleed && !a.ko) { a.bleed--; const d = Math.max(1, Math.round(a.maxHp * .04)); a.hp = Math.max(1, a.hp - d); this.text(a, 'BLEED -' + d, '#ff5a5a', -20); this.hud(); }
    return _pt(a);
  };
  // the bounty affix
  const _vic = BT.victory.bind(BT);
  BT.victory = async function () { try { if (MECH.inGate() && G.S.affix === 'bounty') { const g = this.B.actors.filter(a => a.side === 'e').reduce((s, a) => s + (a.E.gold || 0), 0); G.S.gold += Math.round(g * .5); } } catch (e) { } return _vic(); };

  /* ---------- 8: stone skills in the battle menu; 15: no items ---------- */
  if (typeof CombatX !== 'undefined') {
    const _m = CombatX.menu.bind(CombatX);
    CombatX.menu = function (a, L, done, resolve, reopen) {
      _m(a, L, done, resolve, reopen);
      const B = BT.B; if (!B) return;
      if (MECH.inGate() && G.S.affix === 'noItems') { const it = L.find(x => /^Items/.test(x[0])); if (it) { it[1] = 'No Mercy — items cannot be used in this Gate.'; it[3] = true; } }
      if (!a.isMe || G.S.kid || typeof Stones === 'undefined') return;
      const eq = Stones.equipped().filter(id => MECH.SKILL[id]);
      if (!eq.length) return;
      const gi = L.findIndex(x => /^Guard/.test(x[0]));
      L.splice(gi >= 0 ? gi : L.length, 0, ['Stone Skills', `Each equipped Heartshard gives one skill, once per battle: ${eq.map(id => MECH.SKILL[id][0]).join(', ')}.`, () => {
        const S = eq.map(id => { const used = B.stoneUsed[id]; return [MECH.SKILL[id][0], MECH.SKILL[id][1] + (used ? '  (used this battle)' : ''), () => useSkill(a, id, done), !!used]; });
        S.push(['◀ Back', 'Return.', reopen]); BT.openMenu(S, false);
      }]);
    };
  }
  async function useSkill(a, id, done) {
    const B = BT.B; B.stoneUsed[id] = 1; BT.closeMenu(); sfx('art');
    BT.text(a, MECH.SKILL[id][0].toUpperCase(), '#7dffb0', -70, true);
    const hit = (m, o) => new Promise(res => BT.pickTarget(a, async t => { await BT.dash(a, t.x + 52, t.y + 2, 220); await BT.strike(a, t, { anim: 'thrust', m }, 1, Object.assign({ src: 'stone' }, o || {})); await BT.home(a); res(); }));
    if (id === 'fang') await hit(1.6, { pierce: 1 });
    else if (id === 'verdict') { const d = Math.round(a.maxHp * .1); a.hp = Math.max(1, a.hp - d); BT.text(a, '-' + d, '#ff8080'); await hit(2.2); }
    else if (id === 'scale') a.scaleWard = 2;
    else if (id === 'breath') { a.mp = Math.min(a.maxMp, a.mp + 6); a.strain = Math.max(0, (a.strain || 0) - 30); BT.text(a, '+6 MP', '#9ad1ff'); }
    else if (id === 'still') a.focus = 1;
    else if (id === 'echo') { a.decoy = 1; a.afterimg = 700; }
    else if (id === 'riverheart') { const h = Math.round(a.maxHp * .25); a.hp = Math.min(a.maxHp, a.hp + h); BT.text(a, '+' + h, '#7dffb0'); sfx('heal'); }
    else if (id === 'quarry') { a.guard = true; for (const e of BT.alive('e')) { if (e.stance) e.stance = 0; if (e.charge) { e.charge = null; BT.text(e, 'CHARGE BROKEN!', '#7dffb0', -70, true); } } }
    BT.hud(); await wait(300); done();
  }
  if (typeof cmdIcon === 'function') { const _ci = cmdIcon; cmdIcon = function (l) { return /^Stone Skills/.test(String(l)) ? ['◆', '#2f8a5a', 'Stones'] : _ci(l); }; }
})();
