/* ================= CORES FOR THE STRONG, AND DRAGS BRED FOR WAR =================
   ENEMY CORES: every rival (Kairo, the Green Eclipse, Vane, Halvard, Voss, Dread) and every A-rank-or-higher monster
   carries a core ability that is theirs alone: a passive that shapes the fight, and a CORE ULTIMATE they unleash once,
   when they're pushed (below 60% health) — with a banner, so you see it coming.
   Rivals' cores have a level too. They train while you do: their core level follows the mastery Ren has earned.
   (The Drag Eye / move-copying was removed, Nov 2026: Drags are a warrior race — bred for combat, in perfect control
   of their bodies — so their gift is defence and instinct, not theft. See BRED FOR WAR at the end of this file.) */
const MH2 = (anim, m, w, unp) => ({ anim, m, w, unp });
const ECORE = {
  // ---- rivals ----
  kairo_duel: { name: 'Scar Bloom — Cinder Rush', col: '#ff7a3a', rival: 1, passive: 'Bred for War: a Drag in perfect control — he gets faster every turn of the duel.',
    ult: { name: 'CINDER RUSH', hits: [MH2('slash', .8, 380), MH2('slash', .8, 220), MH2('thrust', .9, 220), MH2('slash', .9, 220), MH2('jump', 1.8, 900, 1)] }, quicken: 1 },
  ge_dace_r: { name: 'Iron Vow Cleave', col: '#3f9a5a', rival: 1, passive: 'Hits harder the lower his health.', ult: { name: 'IRON VOW', hits: [MH2('backslash', 2.2, 820, 1)] }, rage: 1 },
  ge_wren_r: { name: 'Wren\'s Feather Storm', col: '#9fe8b0', rival: 1, passive: 'Dodges more after every miss.', ult: { name: 'FEATHER STORM', hits: [MH2('thrust', .6, 300), MH2('thrust', .6, 180), MH2('thrust', .6, 180), MH2('thrust', .6, 180), MH2('thrust', .8, 260)] } },
  ge_tamsin_r: { name: 'Torchbearer', col: '#d8742a', rival: 1, passive: 'Her blade burns — her hits leave you scorched.', ult: { name: 'TORCHFALL', hits: [MH2('spellcast', 1.9, 900)] }, burns: 1 },
  ge_corran_r: { name: 'The Rules', col: '#a8c8ff', rival: 1, passive: 'Counters any attack that isn\'t a PERFECT.', ult: { name: 'BY THE BOOK', hits: [MH2('slash', 1.1, 520), MH2('halfslash', 1.3, 340)] } },
  vane: { name: 'Snowfall Iai', col: '#e8f4ff', rival: 1, passive: 'Sheathed stillness — he counters the first blow each turn.', ult: { name: 'SNOWFALL', hits: [MH2('slash', 1.2, 520), MH2('slash', 1.2, 200), MH2('slash', 1.6, 200, 1)] } },
  halvard: { name: 'Pale Litany', col: '#fff3b0', rival: 1, passive: 'His faith mends him a little every turn.', ult: { name: 'PALE LITANY', hits: [MH2('spellcast', 1.4, 720), MH2('spellcast', 1.6, 520)] }, regen: .03 },
  voss: { name: 'Phalanx', col: '#c8d0dc', rival: 1, passive: 'Shield wall — the first heavy hit each turn is halved.', ult: { name: 'PHALANX CHARGE', hits: [MH2('thrust', 1.4, 600), MH2('thrust', 1.4, 300)] } },
  // ---- A-rank and above ----
  b_crystal_wyrm: { name: 'Crystal Prison', col: '#b4e8ff', passive: 'Crystal armour regrows when broken.', ult: { name: 'CRYSTAL PRISON', hits: [MH2('spellcast', 1.5, 820), MH2('jump', 2, 900, 1)] } },
  reef_wyrm: { name: 'Abyssal Maelstrom', col: '#5ff0ff', passive: 'The deep pulls — your speed drops in its presence.', ult: { name: 'ABYSSAL MAELSTROM', hits: [MH2('spellcast', 1.3, 700), MH2('spellcast', 1.3, 400), MH2('spellcast', 1.6, 400)] }, slow: 1 },
  sb_mother: { name: 'The Great Flood', col: '#a8ff7a', passive: 'Everything she hits is weakened.', ult: { name: 'THE GREAT FLOOD', hits: [MH2('spellcast', 2.2, 1000)] }, weaken: 1 },
  bq_cinderwing: { name: 'Cinder Storm', col: '#ff9a3a', passive: 'Wings of fire — her hits burn.', ult: { name: 'CINDER STORM', hits: [MH2('spellcast', 1.2, 600), MH2('spellcast', 1.2, 360), MH2('spellcast', 1.5, 360)] }, burns: 1 },
  rb_vesh: { name: 'Crown of the Pale', col: '#9fe4ff', passive: 'Raises a dead servant when wounded.', ult: { name: 'PALE CROWN', hits: [MH2('spellcast', 2, 960)] } },
  rb_vharyx: { name: 'Brood Inferno', col: '#ff6a3a', passive: 'Mother of drakes — her fire hits the whole party.', ult: { name: 'BROOD INFERNO', hits: [MH2('spellcast', 1.6, 800), MH2('spellcast', 1.8, 600)] }, burns: 1 },
  dread: { name: 'Black Sun', col: '#2b2233', rival: 1, passive: 'Nothing you know works the way it should.', ult: { name: 'BLACK SUN', hits: [MH2('spellcast', 3, 1100, 1)] } }
};
(function () {
  const T = ['E', 'D', 'C', 'B', 'A', 'S', 'SS', 'SSS', 'SSSS'];
  const coreLv = () => { let s = 0; try { for (const k in (G.S.mastery || {})) if (k.startsWith('me:')) s += MASTERY.lv('me', k.slice(3)); } catch (e) { } return Math.max(1, Math.min(10, 1 + Math.floor(s / 6))); };
  const coreOf = e => { if (!e || !e.key || /_spar$|_leaf$|_pro$/.test(e.key) || (e.E && e.E.fixed && !ECORE[e.key])) return null; if (ECORE[e.key]) return ECORE[e.key]; const t = T.indexOf(TIER[e.key] || 'E');
    if (t >= 4) return { name: 'Apex Fury', col: '#ff5050', passive: 'An apex predator: wounded, it only gets stronger.', ult: { name: 'APEX FURY', hits: [MH2('slash', 1.4, 640), MH2('jump', 2, 900, 1)] }, rage: 1 }; return null; };
  window.ECORE = ECORE; window.coreOf = coreOf;

  /* ---------- attach cores ---------- */
  const _mk = Battle.mk;
  Battle.mk = function (o) {
    if (o && o.side === 'e' && !o.coreSet) { o.coreSet = 1; const c = coreOf(o); if (c && !(Battle.B && Battle.B.cfg && (Battle.B.cfg.tutorial || Battle.B.cfg.leafTrain))) { o.core = c; o.coreLv = c.rival ? coreLv() : Math.max(1, T.indexOf(TIER[o.key] || 'A') - 2); } }
    return _mk.call(this, o);
  };
  /* the passive's banner when the fight starts */
  const _start = Battle.start.bind(Battle);
  Battle.start = function (cfg) {
    const p = _start(cfg);
    setTimeout(() => { try { const B = Battle.B; if (!B) return; for (const e of B.actors) if (e.side === 'e' && e.core) Battle.text(e, `CORE · ${e.core.name}${e.core.rival ? ' · Lv ' + e.coreLv : ''}`, e.core.col, -110); } catch (err) { } }, 2200);
    return p;
  };
  /* the ultimate: once, when pushed below 60% */
  const _et = Battle.enemyTurn.bind(Battle);
  Battle.enemyTurn = async function (e) {
    const B = this.B, c = e && e.core;
    if (c) {
      if (c.regen && !e.ko) { const h = Math.round(e.maxHp * c.regen); e.hp = Math.min(e.maxHp, e.hp + h); this.text(e, '+' + h, '#fff3b0', -40); }
      if (c.rage && !e.raged && e.hp < e.maxHp * .5) { e.raged = 1; e.atk = Math.round(e.atk * 1.2); this.text(e, 'ENRAGED', c.col, -70, true); }
      if (!e.coreUsed && e.hp < e.maxHp * .6 && !e.ko) {
        e.coreUsed = 1; const t = pick(this.alive('p')); if (t) {
          B.flash = .7; B.flashCol = '255,255,255'; B.shake = 12; sfx('alarm');
          await this.msg(`${e.name} — CORE: ${c.ult.name}${c.rival ? ' (Lv ' + e.coreLv + ')' : ''}`, 1300);
          const m = 1 + (e.coreLv || 1) * .06, sk = { name: c.ult.name, hits: c.ult.hits.map(h => Object.assign({}, h, { m: h.m * m })) };
          await this.enemyStrike(e, t, sk);
          if (c.burns) for (const p of this.alive('p')) if (Math.random() < .5) { p.burn = 2; p.burnDmg = Math.max(2, Math.round(e.atk * .25)); this.text(p, 'BURNING', '#ff7a3a', -30); }
          if (c.weaken) for (const p of this.alive('p')) { p.atk = Math.max(1, Math.round(p.atk * .9)); this.text(p, 'WEAKENED', '#a8ff7a', -30); }
          if (c.slow) for (const p of this.alive('p')) { p.spd = Math.max(1, p.spd * .9); }
          return;
        }
      }
      if (c.quicken && !e.ko) { e.qk = (e.qk || 0) + 1; if (e.qk <= 6) { e.spd += 1; if (e.qk === 3) this.text(e, 'BRED FOR WAR', c.col, -70, true); } }
    }
    // party members burn too
    return _et(e);
  };
  const _pt = Battle.playerTurn.bind(Battle);
  Battle.playerTurn = function (a) { if (a && a.burn > 0 && !a.ko) { a.burn--; const d = a.burnDmg || 3; a.hp = Math.max(1, a.hp - d); this.text(a, 'BURN -' + d, '#ff7a3a', -20); this.hud(); } return _pt(a); };


  /* ---------- BRED FOR WAR: what makes a Drag a Drag ----------
     Drags were bred for combat. Perfect control of their own bodies: wider parry & dodge windows (Battle.reflex ×1.25),
     and WARRIOR'S INSTINCT — after a perfect parry or dodge, a Drag's next blow lands 15% harder. */
  const isDrag = a => a && a.side === 'p' && (a.isMe || (ALLY[a.id] && ALLY[a.id].drag));
  const _tx = Battle.text.bind(Battle);
  Battle.text = function (a, txt, ...rest) {
    try { if (isDrag(a) && !G.S.kid && (txt === 'PERFECT PARRY' || txt === 'PERFECT DODGE')) { a.instinct = 1; const B = this.B; if (B && a.isMe) { B.dragPerf = (B.dragPerf || 0) + 1; if (B.dragPerf >= 3 && !G.S.f.bredForWar) G.S.f.bredPending = 1; } } } catch (e) { }
    return _tx(a, txt, ...rest);
  };
  const _rh = Battle.resolveHit.bind(Battle);
  Battle.resolveHit = function (a, t, m, grade, opts) { if (a && a.instinct && t && t.side === 'e' && !(opts && opts.echo)) { a.instinct = 0; m *= 1.15; _tx(a, 'INSTINCT', '#46ff95', -70); } return _rh(a, t, m, grade, opts); };
  const _vic = Battle.victory.bind(Battle);
  Battle.victory = async function () {
    const r = await _vic(); const f = G.S.f;
    if (f.bredPending && !f.bredForWar) { f.bredForWar = 1; delete f.bredPending;
      setTimeout(() => Story.run(async () => {
        await me('shock', '…I didn\'t even think. My body just moved. Every blow — I knew where it would land before it left the sword.');
        if ((G.S.party || []).includes('kess')) {
          await say('kessE', 'neutral', 'That\'s the blood. They didn\'t breed us to farm, Ren. Drags were made for war — every muscle answers before you ask it to.');
          await say('kessE', 'sad', 'It\'s why the Crown fears us. Not our eyes. What the eyes mean. A Drag that\'s been trained is the most dangerous thing on a battlefield.');
        } else await narr('Vane\'s voice, from a snowy morning years ago: "Your people were bred for this, pup. You don\'t learn to parry. You remember how."');
        await narr('BRED FOR WAR — Drags have wider parry and dodge windows, and after a PERFECT parry or dodge their next blow lands 15% harder (Warrior\'s Instinct).');
        save();
      }), 600); }
    return r;
  };
  if (typeof LEGENDS !== 'undefined') LEGENDS.push({ name: 'Bred for War', need: 'bredForWar', text: 'The Drags were not born; they were made — bred over centuries as a warrior race, in perfect command of their own bodies. A trained Drag does not learn to parry. They remember. That is what the Crown truly fears.' });
  // saves from before the change: the copied moves are gone
  setTimeout(function clean() { try { if (G.S && G.S.copies) { delete G.S.copies; delete G.S.eyeSeen; if (G.S.arts) G.S.arts = G.S.arts.filter(k => !/^copy\d$/.test(k)); if (G.S.mastery) delete G.S.mastery['me:mimic']; } } catch (e) { } setTimeout(clean, 3000); }, 2000);
})();
