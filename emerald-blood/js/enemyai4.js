'use strict';
/* =====================================================================================
   ENEMY AI IV — fights with consequences  (Chat A)   · loads after enemyai3.js
   1 ELITE AFFIXES    Vampiric · Thorned · Swift · Volatile · Rallying · Unyielding · Venomous · Warded
   2 LAST WORDS       bosses and named enemies say something as they fall
   3 PARTY MORALE     big perfects INSPIRE your companions (+10% dmg); Ren getting hammered SHAKES them (-10%, worse timing)
   4 SURRENDER TERMS  a beaten gang offers its purse — or information — for its lives
   5 TRAPS            a snare hides on the field: BREAK an enemy and you knock it into the snare
   6 NESTS            a brood mother hatches young every few turns until you kill her
   7 BODYGUARDS       guards throw themselves in front of single attacks on their employer.
                      Killing a hired guard while the employer still stands costs REN's name in that town —
                      but the RED VEIL never kills: in the Veil, guards are only knocked out. Wear the scarf for this work.
                      Drop the employer and the guards give up.
   8 STYLE RANKS      boss fights are graded S / A / B / C (perfects, damage taken, turns). S pays.
   9 LIVING ARENAS    the fire spreads or the water rises every few turns — finish it before the field does
   10 SHARED FIGHTS   near a town that loves you, militia join on your side; near one that hates you, on theirs.
                      Green Eclipse fighters may show up too, once you've funded them (see underworld.js)
   ===================================================================================== */
Object.assign(ENEMY, {
  ug_mark: { name: 'Tax-Farmer Brisk', img: 'ug_noble', isMark: 1, trait: 'Bought the right to squeeze the vale — hides behind paid steel', hp: 90, atk: 9, def: 3, spd: 9, dodge: .05, parry: .05, brk: 40, xp: 45, gold: 70,
    lastWords: 'The Registry… will hear of this…', skills: [{ name: 'Cane Swipe', hits: [{ anim: 'slash', m: .8, w: 560 }] }] },
  ug_guard: { name: 'Hired Blade', img: 'guard', isGuard: 1, trait: 'Paid by the day. Not paid enough to die.', hp: 70, atk: 11, def: 5, spd: 11, dodge: .08, parry: .25, brk: 50, xp: 18, gold: 6,
    skills: [{ name: 'Halberd Cut', hits: [{ anim: 'slash', m: 1, w: 560 }] }, { name: 'Shove', w: .3, hits: [{ anim: 'thrust', m: .7, w: 420 }] }] },
  ug_duelist: { name: 'Gilt Duelist', img: 'duelist', isGuard: 1, trait: 'A noble\'s sword-for-hire — fast, proud, expensive', hp: 95, atk: 14, def: 5, spd: 14, dodge: .2, parry: .35, brk: 60, xp: 30, gold: 14, pers: 'duelist',
    skills: [{ name: 'Rapier Lunge', hits: [{ anim: 'thrust', m: 1, w: 460 }] }, { name: 'Flourish', w: .35, hits: [{ anim: 'thrust', m: .6, w: 320 }, { anim: 'thrust', m: .6, w: 280 }, { anim: 'slash', m: .9, w: 420 }] }] },
  ug_fence: { name: 'Fence Marlo', img: 'ug_fence', isMark: 1, trait: 'Sells stolen D-stones to the Registry AND the Gloves', hp: 85, atk: 10, def: 3, spd: 12, dodge: .15, parry: .05, brk: 40, xp: 45, gold: 80,
    lastWords: 'You think I\'m the worst in this town? Ha…', skills: [{ name: 'Dirty Knife', hits: [{ anim: 'thrust', m: .9, w: 420 }] }] }
});
const AI4 = {
  AFFIX: {
    vampiric: ['Vampiric', '#ff4a6a', 'heals from the damage it deals'], thorned: ['Thorned', '#9be37a', 'hitting it cuts you back'], swift: ['Swift', '#7ad8ff', 'acts much more often'],
    volatile: ['Volatile', '#ff9a3a', 'explodes when it dies'], rallying: ['Rallying', '#ffd36a', 'its allies hit harder while it lives'], unyielding: ['Unyielding', '#d0d0ff', 'survives one killing blow'],
    venomous: ['Venomous', '#8ee05a', 'every hit poisons'], warded: ['Warded', '#b9a6ff', 'ignores the first Art that hits it'] },
  LAST: { coward: ['I just… wanted to go home…'], brute: ['Heh… good… hit…'], duelist: ['A fine… blade…'], trickster: ['Didn\'t see… that one coming…'], zealot: ['The light… is… cold…'],
    hunter: ['The prey… bites…'], protector: ['Forgive me… I couldn\'t hold…'], glory: ['Remember… my… name…'], beast: ['*a long, final breath*'] },
  redirect(a, t) {
    const B = Battle.B; if (!B || AI.off(B) || !a || a.side !== 'p' || !t || !t.isMark || t.ko) return t;
    const G2 = Battle.alive('e').filter(g => g.guardOf === t && !g.broken && !g.panic && !g.ko); if (!G2.length || Math.random() > .75) return t;
    const g = pick(G2); Battle.text(g, 'BODYGUARD!', '#ffd36a', -60, true); sfx('parry');
    if (!(G.S.f.ai2tip || {}).guard) { G.S.f.ai2tip = G.S.f.ai2tip || {}; G.S.f.ai2tip.guard = 1; setTimeout(() => toast('<b style="color:#ffd36a">BODYGUARDS</b> — they jump in front of attacks on their employer. BREAK them or use area attacks. Killing hired guards hurts your name — unless you wear the <b style="color:#ff5a5a">Red Veil</b>, who only knocks them out.', 6000), 300); }
    return g;
  },
  town() { try { return townOf(G.S.map) || G.S.f.lastTown || 'ashford'; } catch (e) { return 'ashford'; } },
  draw(c, BT) {
    const B = BT.B; if (!B || AI.off(B)) return; const now = performance.now(), W = G.view.w, FH = G.view.fullH || G.view.h, S = typeof BT_SCALE !== 'undefined' ? BT_SCALE : 1;
    c.save();
    // living arena
    if (B.arena) { const A = B.arena, k = A.stage / 3;
      if (A.k === 'fire' && k > 0) { const g = c.createLinearGradient(0, 0, W * k * .6, 0); g.addColorStop(0, `rgba(255,90,20,${.35})`); g.addColorStop(1, 'rgba(255,90,20,0)'); c.globalCompositeOperation = 'lighter'; c.fillStyle = g; c.fillRect(0, FH * .3, W * k * .6, FH * .7); c.globalCompositeOperation = 'source-over'; }
      if (A.k === 'water' && k > 0) { const h = FH * .06 * A.stage; c.fillStyle = `rgba(60,120,190,${.22 + Math.sin(now / 400) * .03})`; c.fillRect(0, FH - h, W, h); }
      c.font = '900 12px Nunito, sans-serif'; c.textAlign = 'left'; const t = A.k === 'fire' ? `🔥 THE FIRE SPREADS ${A.stage}/3` : `🌊 THE WATER RISES ${A.stage}/3`; c.fillStyle = 'rgba(15,10,6,.75)'; c.fillRect(8, 54, c.measureText(t).width + 16, 20); c.fillStyle = A.k === 'fire' ? '#ffb070' : '#9fd0ff'; c.fillText(t, 16, 69); }
    // morale
    if (B.mor >= 2 || B.mor <= -2) { const ins = B.mor >= 2, t = ins ? '✦ PARTY INSPIRED' : '✖ PARTY SHAKEN'; c.font = '900 12px Nunito, sans-serif'; c.textAlign = 'right'; const w = c.measureText(t).width + 16;
      c.fillStyle = 'rgba(15,10,6,.75)'; c.fillRect(W - w - 92, 122, w, 20); c.fillStyle = ins ? '#9be37a' : '#ff8a6a'; c.fillText(t, W - 100, 137); }
    // trap
    if (B.trap) { const T = B.trap; c.strokeStyle = T.used ? 'rgba(140,110,70,.5)' : 'rgba(170,140,90,.75)'; c.lineWidth = 2; c.beginPath(); c.ellipse(T.x, T.y, 16, 6, 0, 0, 7); c.stroke(); c.beginPath(); c.moveTo(T.x + 16, T.y); c.lineTo(T.x + 34, T.y - 22); c.stroke(); }
    // helpers
    if (B.help && B.help.img) { const H = B.help; try { c.save(); c.translate(H.x, H.y); if (H.side === 'p') c.scale(-1, 1); drawBT(c, H.img, 'combat', 0, 0, 0, S * .85); c.restore(); } catch (x) { }
      c.font = '800 11px Nunito, sans-serif'; c.textAlign = 'center'; c.fillStyle = H.side === 'p' ? '#9be37a' : '#ff8a6a'; c.fillText(H.name, H.x, H.y + 15); }
    // labels
    c.font = '800 10px Nunito, sans-serif'; c.textAlign = 'center';
    for (const e of BT.alive('e')) {
      if (e.affix) { const A = this.AFFIX[e.affix]; c.fillStyle = A[1]; c.fillText('◆ ' + A[0].toUpperCase(), e.x, e.y - 92 * S * (e.size || 1)); }
      if (e.guardOf && !e.guardOf.ko) { c.fillStyle = '#ffd36a'; c.fillText('🛡 GUARDING ' + e.guardOf.name.toUpperCase(), e.x, e.y + 30); }
      if (e.isMark) { c.fillStyle = '#ffd36a'; c.fillText('★ THE MARK', e.x, e.y + 30); }
      if (e.brood) { c.fillStyle = '#e0a0ff'; c.fillText('BROOD MOTHER', e.x, e.y + 30); }
    }
    c.restore();
  }
};

(function () {
  const BT = Battle;
  const tip = (B, k, s) => { B.tips = B.tips || {}; if (B.tips[k] || (G.S.f.ai2tip || {})[k]) return; B.tips[k] = 1; G.S.f.ai2tip = G.S.f.ai2tip || {}; G.S.f.ai2tip[k] = 1; setTimeout(() => toast(s, 4600), 300); };
  const plain = BT => !BT.alive('e').some(e => AI.isBoss(e) || (e.E && (e.E.fixed || e.E.boss))) && !(BT.B.cfg || {}).boss;
  const veil = () => { try { return typeof Veil !== 'undefined' && Veil.on(); } catch (e) { return false; } };
  const mor = (BT, d) => { const B = BT.B, was = B.mor || 0; B.mor = Math.max(-3, Math.min(3, was + d));
    if (was < 2 && B.mor >= 2) { BT.text(BT.me() || BT.alive('p')[0], 'PARTY INSPIRED!', '#9be37a', -80, true); tip(B, 'mor', '<b>MORALE</b> — big perfects INSPIRE your companions (they hit harder). When Ren takes a beating they get SHAKEN.'); }
    if (was > -2 && B.mor <= -2) { BT.text(BT.me() || BT.alive('p')[0], 'PARTY SHAKEN', '#ff8a6a', -80, true); tip(B, 'mor', '<b>MORALE</b> — big perfects INSPIRE your companions (they hit harder). When Ren takes a beating they get SHAKEN.'); } };

  // remember the last town visited (shared fights)
  const _ld = World.load.bind(World);
  World.load = async function (name, x, y, dir) { const r = await _ld(name, x, y, dir); try { const t = townOf(name); if (t) G.S.f.lastTown = t; } catch (e) { } return r; };

  // placeholder sprites until Chat C draws the marks
  const _st = BT.start.bind(BT);
  BT.start = function (cfg) {
    try { for (const k of ['ug_mark', 'ug_fence', 'ug_duelist']) { const E = ENEMY[k], want = { ug_mark: 'ug_noble', ug_fence: 'ug_fence', ug_duelist: 'duelist' }[k];
      const ok = typeof HD !== 'undefined' && HD.meta && (HD.meta['c_' + want] || HD.meta[want]); E.img = ok ? want : (k === 'ug_duelist' ? 'guard' : k === 'ug_fence' ? 'bandit' : 'hesk'); } } catch (e) { }
    return _st(cfg);
  };

  // ---------------- setup ----------------
  const _run = BT.run.bind(BT);
  BT.run = async function () {
    const B = this.B;
    if (B && !B.ai4Init && !AI.off(B)) {
      B.ai4Init = 1; B.mor = 0; B.rk = { turns: 0, hits: 0, perf: 0, taken: 0 }; B.ai4free = AI2.free(this);
      const E = this.alive('e'), W = G.view.w, FH = G.view.fullH || G.view.h, out = AI3.outdoors(B);
      // BODYGUARDS: guards protect the mark
      const marks = E.filter(e => e.E && e.E.isMark); if (marks.length) { for (const e of marks) e.isMark = 1; for (const g of E.filter(e => e.E && e.E.isGuard)) g.guardOf = marks[0];
        await this.msg(veil() ? 'The Red Veil never kills. Hired guards will only be knocked out.' : 'Careful — killing hired guards will hurt your name. (The Red Veil only knocks them out.)', 1600); }
      // ELITE AFFIXES
      if (plain(this) && !(B.cfg || {}).noAffix) for (const e of E) {
        if (e.isMark || e.guardOf || (e.E && e.E.fixed) || e.affix) continue;
        if (Math.random() < (AI.tierI(e) >= 3 ? .3 : .1)) { const k = pick(Object.keys(AI4.AFFIX)); e.affix = k; e.name = AI4.AFFIX[k][0] + ' ' + e.name; e.maxHp = e.hp = Math.round(e.maxHp * 1.2); e.xpMul = 1.5;
          if (k === 'swift') e.spd = Math.round(e.spd * 1.35); if (k === 'unyielding') e.unyield = 1; if (k === 'warded') e.ward = 1;
          if (k === 'rallying') for (const x of E) if (x !== e) { x.atk = Math.round(x.atk * 1.1); x.rallied = (x.rallied || 0) + 1; }
          this.text(e, AI4.AFFIX[k][0].toUpperCase() + ' — ' + AI4.AFFIX[k][2], AI4.AFFIX[k][1], -70, true); }
      }
      if (E.some(e => e.affix)) tip(B, 'affix', '<b>ELITES</b> — enemies marked ◆ have a special power (Vampiric, Thorned, Volatile…). Tap them to read it.');
      if (B.ai4free) {
        // TRAP
        if (out && Math.random() < .15) { B.trap = { x: W * .44, y: FH * .7, used: 0 }; tip(B, 'trap', '<b>SNARE</b> — a hunter\'s snare is hidden on the field. BREAK an enemy and you knock it into the snare.'); }
        // NEST
        const beasts = E.filter(e => AI.beast(e)); if (beasts.length && Math.random() < .25) { const m = beasts.slice().sort((a, b) => b.maxHp - a.maxHp)[0]; m.brood = 1; m.maxHp = m.hp = Math.round(m.maxHp * 1.25);
          await this.msg(`${m.name} is a brood mother — her young will keep coming until she falls!`, 1400); }
        // SHARED FIGHTS
        const t = AI4.town(), rep = (() => { try { return Rep.town(t); } catch (e) { return 0; } })(), ug = G.S.ug || {};
        let H = null;
        if ((ug.funds || 0) >= 300 && Math.random() < .2) H = { name: pick(['Dace', 'Wren', 'Corran']) + ' (Green Eclipse)', spr: null, side: 'p' };
        else if (rep >= 14 && Math.random() < .25) H = { name: (TOWNS[t] || 'Town') + ' militia', spr: 'guard', side: 'p' };
        else if (rep <= -3 && Math.random() < .25) H = { name: (TOWNS[t] || 'Town') + ' militia', spr: 'guard', side: 'e' };
        if (H) { if (!H.spr) H.spr = H.name.startsWith('Dace') ? 'ge_dace' : H.name.startsWith('Wren') ? 'ge_wren' : 'ge_corran';
          try { H.img = HD.npcSheet(H.spr, false); } catch (x) { } H.x = H.side === 'p' ? W * .9 : W * .05; H.y = FH * (H.side === 'p' ? .52 : .46); B.help = H; B.hc = 0;
          await this.msg(H.side === 'p' ? `${H.name} ${H.name.includes('Eclipse') ? 'drops out of the trees' : 'comes running'} — "We've got your back!"` : `${H.name} — they've heard what you are. They're helping THEM.`, 1500); }
      }
      // LIVING ARENA
      const boss = E.find(e => AI2.bossy(this, e) && !(e.E && e.E.fixed));
      if ((boss && Math.random() < .45) || (B.ai4free && Math.random() < .06)) { const k = out && B.wx !== 'rain' ? 'fire' : 'water'; B.arena = { k, stage: 0, n: 0 };
        await this.msg(k === 'fire' ? 'Something is burning at the edge of the field… it\'s spreading.' : 'Water seeps in across the floor… it\'s rising.', 1300); }
    }
    const r = await _run();
    try {
      if (B && B.ai4Init) {
        // STYLE RANK
        const boss = B.actors.find(e => e.side === 'e' && AI2.bossy(this, e));
        if (boss && r === 'win') {
          const R = B.rk, pr = R.hits ? R.perf / R.hits : 0, hpTot = B.actors.filter(a => a.side === 'p').reduce((s, a) => s + a.maxHp, 0) || 1, tk = R.taken / hpTot;
          const rank = pr >= .55 && tk < .3 && R.turns <= 14 ? 'S' : pr >= .35 && tk < .55 ? 'A' : tk < .9 ? 'B' : 'C';
          const rk = G.S.ranks = G.S.ranks || {}, ord = 'CBAS', best = rk[boss.key]; if (!best || ord.indexOf(rank) > ord.indexOf(best)) rk[boss.key] = rank;
          const g = { S: 60, A: 25, B: 0, C: 0 }[rank]; if (g) G.S.gold += g;
          setTimeout(() => toast(`<b style="font-size:1.3em;color:${{ S: '#ffd36a', A: '#9be37a', B: '#9fd0ff', C: '#bbb' }[rank]}">RANK ${rank}</b> — perfects ${Math.round(pr * 100)}% · damage taken ${Math.round(tk * 100)}% · ${R.turns} turns${g ? ` · +${g}g style bonus` : ''}`, 4500), 900);
        }
      }
    } catch (x) { console.warn(x); }
    return r;
  };

  // ---------------- party turn: who is acting, MP at start ----------------
  const _pt = BT.playerTurn.bind(BT);
  BT.playerTurn = async function (a) {
    const B = this.B; if (!B || AI.off(B)) return _pt(a);
    B.ai4cur = a; B.ai4mp = a && a.mp; if (B.rk) B.rk.turns++;
    try { return await _pt(a); } finally { if (this.B) this.B.ai4cur = null; }
  };

  // ---------------- enemy turn: nests, arena clock ----------------
  const _et = BT.enemyTurn.bind(BT);
  BT.enemyTurn = async function (e) {
    const B = this.B; if (!B || AI.off(B) || !e || e.side !== 'e') return _et(e);
    await _et(e);
    if (!this.B) return;
    // NEST
    if (e.brood && !e.ko) { e.bn = (e.bn || 0) + 1;
      if (e.bn % 3 === 0 && this.alive('e').length < 4) { await this.summon(e.key, 'HATCHLING'); const h = B.actors[B.actors.length - 1];
        h.name = 'Hatchling'; h.maxHp = h.hp = Math.max(8, Math.round(h.maxHp * .35)); h.atk = Math.round(h.atk * .6); h.size = (h.size || 1) * .7; h.hatch = 1; h.wait = 100 / h.spd * .5; this.hud(); } }
    // LIVING ARENA
    if (B.arena && B.arena.stage < 3 && ++B.arena.n % 3 === 0) { const A = B.arena; A.stage++; sfx('alarm'); B.shake = 6;
      if (A.k === 'fire') { await this.msg(A.stage < 3 ? `The fire spreads (${A.stage}/3)…` : 'The fire reaches you — everyone burns every turn now!', 1100); if (A.stage === 3) B.fireT = 999; }
      else { for (const p of this.alive('p')) { p.spd = Math.round(p.spd * .92 * 10) / 10; this.text(p, 'SLOWED', '#9fd0ff', -30); } await this.msg(A.stage < 3 ? `The water rises (${A.stage}/3) — you\'re slowing down.` : 'The water is at your waist — finish this!', 1100); }
      tip(B, 'arena', '<b>LIVING ARENA</b> — the battlefield gets worse every few turns. Finish the fight fast.'); }
  };

  // ---------------- after each turn: helpers act, surrender offers ----------------
  const _at = BT.adaptTick.bind(BT);
  BT.adaptTick = async function () {
    const r = await _at(); const B = this.B; if (!B || AI.off(B)) return r;
    // SHARED FIGHTS
    if (B.help && ++B.hc % 3 === 0) { const H = B.help;
      if (H.side === 'p') { const t = pick(this.alive('e')); if (t) { const P = this.alive('p'), d = Math.max(2, Math.round((P.reduce((s, a) => s + a.atk, 0) / (P.length || 1)) * 1.1 - (t.def || 0) * .5));
        this.text(t, `${H.name.split(' ')[0]}! -${d}`, '#9be37a', -40, true); this.spark(t.x, t.y - 40, '#9be37a', 14); sfx('hit'); this.damage(t, d, false); } }
      else { const t = pick(this.alive('p')); if (t) { const Es = this.alive('e'), atk = Es.length ? Es.reduce((s, x) => s + x.atk, 0) / Es.length : 10;
        const dummy = { side: 'e', name: H.name, key: 'militia', atk, def: 0, x: t.x - 60, y: t.y, hx: t.x - 60, hy: t.y, E: { skills: [] }, anim: 'combat', frame: 0, size: 1, tempo: 1, img: null };
        await this.msg(`${H.name} throws a spear at ${t.name}!`, 600); $('#react').classList.remove('hide'); try { await this.defend(dummy, t, { m: .7, anim: 'thrust', w: 560 }); } finally { $('#react').classList.add('hide'); } } }
      this.hud(); }
    // SURRENDER TERMS
    if (B.ai4free && !B.surr) { const E = this.alive('e'), all = B.actors.filter(a => a.side === 'e');
      const hpK = E.reduce((s, e) => s + e.hp, 0) / (all.reduce((s, e) => s + e.maxHp, 0) || 1);
      if (E.length && all.length >= 2 && E.every(e => AI2.human(e) && !e.isMark) && hpK < .25 && Math.random() < .5) { B.surr = 1;
        const gold = Math.round(E.reduce((s, e) => s + ((e.E && e.E.gold) || 6), 0) * 1.5);
        const c = await ask(null, null, `${E[0].name} throws down their weapon. "Enough! Take the purse — ${gold} gold — and let us walk. Or… we know things. Your choice."`, [`Take the gold (+${gold}g)`, 'Take information instead', 'No deal — finish it']); Dlg.close();
        if (c === 2) { for (const e of E) { e.atk = Math.round(e.atk * 1.12); this.text(e, 'DESPERATE', '#ff6a5a', -30); } }
        else { for (const e of E) { e.ko = true; e.fled = 1; e.spared = 1; e.alpha = 0; }
          if (c === 0) { G.S.gold += gold; toast(`They empty their purses and run. (+${gold}g)`, 2600); }
          else { const ug = G.S.ug = G.S.ug || {}; ug.intel = (ug.intel || 0) + 1; G.S.gold += Math.round(gold * .3);
            toast(`"${pick(['The tithe-house changes guards at the second bell.', 'Lord Vellacourt keeps a second ledger. Nobody\'s supposed to know.', 'The Registry pays the Tallow Hand for runaway Drags. Not all of them get delivered.', 'The magistrate in Millbrook can be bought. Cheap.'])}" (+1 intel)`, 5200); }
          this.hud(); } } }
    return r;
  };

  // ---------------- defence: morale + rank stats ----------------
  const _df = BT.defend.bind(BT);
  BT.defend = async function (e, t, h) {
    const res = await _df(e, t, h); const B = this.B;
    try { if (B && !AI.off(B) && t && t.side === 'p' && B.rk) { B.rk.hits++; if (res === 'pparry' || res === 'pdodge') { B.rk.perf++; if (t.isMe) mor(this, .5); } } } catch (x) { }
    return res;
  };
  const _rx = BT.reflex.bind(BT);
  BT.reflex = function (a) { const k = _rx(a), B = this.B; return B && B.mor <= -2 && a && a.side === 'p' && !a.isMe ? k * .9 : k; };

  // ---------------- traps: a BREAK knocks the enemy into the snare ----------------
  const _cb = BT.checkBreak.bind(BT);
  BT.checkBreak = function (t) {
    const was = t && t.broken; const r = _cb(t); const B = this.B;
    if (B && B.trap && !B.trap.used && t && t.side === 'e' && !was && t.broken && !t.ko) { B.trap.used = 1; B.trap.x = t.x; B.trap.y = t.y; const d = Math.round(t.maxHp * .15);
      this.text(t, 'SNARED!', '#d9b070', -50, true); B.shake = 8; sfx('hit'); t.wait += 100 / t.spd; setTimeout(() => { if (this.B && !t.ko) this.damage(t, d, true); }, 250); }
    return r;
  };

  // ---------------- bodyguards: redirect single attacks ----------------
  const _da = BT.doAttack.bind(BT);
  BT.doAttack = function (a, t) { return _da(a, AI4.redirect(a, t)); };
  const _pk = BT.pickTarget.bind(BT);
  BT.pickTarget = function (a, cb) { return _pk(a, t => cb(AI4.redirect(a, t))); };

  // ---------------- damage ----------------
  const _dm = BT.damage.bind(BT);
  BT.damage = function (t, dmg, big) {
    const B = this.B; if (!B || AI.off(B) || !t || !(dmg > 0)) return _dm(t, dmg, big);
    const atk = B.curAtk, me = B.ai4cur, art = me && me.side === 'p' && me.mp < (B.ai4mp || 0);
    if (t.side === 'e') {
      if (t.ward && art) { t.ward = 0; this.text(t, 'WARDED', '#b9a6ff', -40, true); sfx('parry'); return; }
      if (me && me.side === 'p' && !me.isMe && (B.mor || 0) >= 2) dmg = Math.round(dmg * 1.1);
      if (me && me.side === 'p' && !me.isMe && (B.mor || 0) <= -2) dmg = Math.max(1, Math.round(dmg * .9));
      if (t.unyield && dmg >= t.hp) { t.unyield = 0; dmg = t.hp - 1; this.text(t, 'UNYIELDING!', '#d0d0ff', -50, true); }
    }
    const was = !t.ko, hp0 = t.hp, r = _dm(t, dmg, big), hit = hp0 - t.hp;
    if (!this.B) return r;
    if (t.side === 'p') {
      if (B.rk) B.rk.taken += Math.max(0, hit);
      if (atk && atk.affix === 'vampiric' && !atk.ko && hit > 0) { const h = Math.max(1, Math.round(hit * .3)); atk.hp = Math.min(atk.maxHp, atk.hp + h); this.text(atk, '+' + h, '#ff4a6a', -30); }
      if (atk && atk.affix === 'venomous' && !t.ko && !t.poison) { t.poison = 3; t.poisonDmg = Math.max(2, Math.round(t.maxHp * .035)); this.text(t, 'POISONED', '#8ee05a', -36); }
      if (t.isMe && hit >= t.maxHp * .2) mor(this, -1);
      if (was && t.ko) mor(this, t.isMe ? -2 : -1.5);
    } else {
      if (me && me.side === 'p' && t.affix === 'thorned' && hit > 0 && !me.ko) { const d = Math.max(1, Math.round(hit * .15)); me.hp = Math.max(1, me.hp - d); this.text(me, 'THORNS -' + d, '#9be37a', -30); }
      if (was && t.ko) {
        if (t.side === 'e' && me) mor(this, .5);
        // last words
        if (!t.fled && (t.E && t.E.lastWords || AI2.bossy(this, t))) { const L = (t.E && t.E.lastWords) || pick(AI4.LAST[AI.beast(t) ? 'beast' : (AI.persOf(t) || 'brute')] || AI4.LAST.brute); this.text(t, `"${L}"`, '#ffe0c0', -100, true); }
        if (t.affix === 'volatile') { sfx('hit'); B.shake = 14; B.flash = .5; this.text(t, 'BOOM!', '#ff9a3a', -40, true); for (const p of this.alive('p')) { const d = Math.max(1, Math.round(p.maxHp * .1)); p.hp = Math.max(1, p.hp - d); this.text(p, '-' + d, '#ff9a3a', -20); } }
        if (t.affix === 'rallying') for (const x of B.actors) if (x.side === 'e' && x.rallied) { x.atk = Math.round(x.atk / 1.1); x.rallied--; }
        if (t.brood) { const H = this.alive('e').filter(x => x.hatch); for (const x of H) { x.ko = true; x.fled = 1; x.spared = 1; x.alpha = 0; } if (H.length) this.text(t, 'THE BROOD SCATTERS', '#e0a0ff', -60, true); }
        // bodyguards
        if (t.guardOf && !t.guardOf.ko) {
          if (veil()) this.text(t, 'KNOCKED OUT', '#ff9a9a', -60, true);
          else { this.text(t, 'A HIRED GUARD — DEAD', '#ff6a6a', -60, true); try { Rep.deed(-2, 'cut down a hired guard doing his job', AI4.town(), -1); } catch (x) { } }
        }
        if (t.isMark) { const Gs = this.alive('e').filter(x => x.guardOf === t); for (const g of Gs) { g.ko = true; g.fled = 1; g.spared = 1; g.alpha = 0; }
          if (Gs.length) { AI2.say(this, Gs[0], 'We\'re not paid to die for him. We\'re done.'); this.text(Gs[0], 'THE GUARDS GIVE UP', '#ffd36a', -70, true); } }
      }
      this.hud();
    }
    return r;
  };

  const _r = BT.render.bind(BT);
  BT.render = function (c, t) { const out = _r(c, t); try { AI4.draw(c, this); } catch (x) { } return out; };
})();
