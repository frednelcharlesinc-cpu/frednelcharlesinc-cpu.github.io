/* ================= CORES FOR THE STRONG, AND THE DRAG EYE =================
   ENEMY CORES: every rival (Kairo, the Green Eclipse, Vane, Halvard, Voss, Dread) and every A-rank-or-higher monster
   carries a core ability that is theirs alone: a passive that shapes the fight, and a CORE ULTIMATE they unleash once,
   when they're pushed (below 60% health) — with a banner, so you see it coming.
   Rivals' cores have a level too. They train while you do: their core level follows the mastery Ren has earned.
   THE DRAG EYE: every Drag is born able to see a move once — truly see it — and make it theirs.
   Meet an enemy technique with a PERFECT parry or dodge twice and Ren copies it. Copied moves become his own Arts,
   and the Drag Eye itself has mastery (more slots, faster copying, stronger copies). */
const MH2 = (anim, m, w, unp) => ({ anim, m, w, unp });
const ECORE = {
  // ---- rivals ----
  kairo_duel: { name: 'Scar Bloom — Cinder Rush', col: '#ff7a3a', rival: 1, passive: 'Brother\'s Pace: he copies the last Art you used against him.',
    ult: { name: 'CINDER RUSH', hits: [MH2('slash', .8, 380), MH2('slash', .8, 220), MH2('thrust', .9, 220), MH2('slash', .9, 220), MH2('jump', 1.8, 900, 1)] }, mirror: 1 },
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
const DragEye = {
  st() { const S = G.S; S.copies = S.copies || []; S.eyeSeen = S.eyeSeen || {}; return S; },
  slots() { const l = MASTERY.lv('me', 'mimic'); return 2 + (l >= 3 ? 1 : 0) + (l >= 7 ? 1 : 0); },
  need() { return MASTERY.lv('me', 'mimic') >= 5 ? 1 : 2; },
  ANIM: { slash: 'slash', halfslash: 'slash', backslash: 'slash', thrust: 'thrust', jump: 'slash', spellcast: 'slash', run: 'slash' },
  makeArt(c, i) {
    const l = MASTERY.lv('me', 'mimic'), pw = (.9 + l * .05) * (l >= 5 ? 1.2 : 1);
    ARTS['copy' + i] = { name: '⟲ ' + c.name, strain: 25 + c.hits.length * 6, mp: 3 + c.hits.length, desc: `A move you saw ${c.from} use — and made yours. ${c.hits.length} hit${c.hits.length > 1 ? 's' : ''}.${l >= 10 ? ' Perfect mirror: it cannot be parried.' : ''}`,
      type: 'hit', hits: c.hits.slice(0, 5).map(h => ({ anim: this.ANIM[h.anim] || 'slash', m: Math.max(.5, Math.min(2.4, (h.m || 1) * pw)) })), brk: 8 + c.hits.length * 3, pierce: l >= 10 ? 1 : 0 };
  },
  refresh() { const S = this.st(); for (let i = 0; i < 4; i++) delete ARTS['copy' + i]; S.copies.forEach((c, i) => this.makeArt(c, i)); },
  keys() { return this.st().copies.map((_, i) => 'copy' + i); },
  async copy(e, sk) {
    const S = this.st(), name = sk.name; if (S.copies.some(c => c.name === name)) return;
    const c = { name, from: e.name, hits: (sk.hits || []).map(h => ({ anim: h.anim, m: h.m })) };
    if (S.copies.length >= this.slots()) { const old = S.copies.shift(); toast(`The Drag Eye lets go of <b>${old.name}</b> to make room.`, 2600); }
    S.copies.push(c); this.refresh(); MASTERY.gain('me', 'mimic', 2);
    const me = Battle.B && Battle.B.actors.find(a => a.isMe);
    if (me) { Battle.text(me, 'DRAG EYE — COPIED', '#46ff95', -96, true); Battle.spark(me.x, me.y - 50, '#46ff95', 26); }
    toast(`<b style="color:#46ff95">DRAG EYE</b> — Ren saw it, and now it's his: <b>⟲ ${name}</b> (${e.name}'s move). Use it from Drag Arts.`, 5200); sfx('level');
    if (!G.S.f.dragEyeKnown) G.S.f.dragEyePending = 1;
  }
};
(function () {
  MASTERY.CORE.me.push(['mimic', 'The Drag Eye', '#46ff95', { 1: 'See a move twice with a PERFECT and it\'s yours (2 slots)', 3: 'A third copy slot', 5: 'You copy after a single PERFECT, and copies hit 20% harder', 7: 'A fourth copy slot', 10: 'PERFECT MIRROR — copies cannot be parried' }]);
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
      // Kairo copies your last Art back at you
      if (c.mirror && B.lastArtBy && B.lastArtBy.isMe && B.lastArtKey && !e.mirrored && Math.random() < .5) {
        e.mirrored = 1; const A = ARTS[B.lastArtKey], t = this.alive('p').find(a => a.isMe) || pick(this.alive('p'));
        if (A && t) { await this.msg(`Kairo: "Saw that. Here's mine." — ${A.name}`, 1100); await this.enemyStrike(e, t, { name: A.name + ' (Kairo)', hits: (A.hits || [{ anim: 'slash', m: 1.4 }]).slice(0, 3).map(h => MH2(h.anim || 'slash', (h.m || 1) * .9, 420)) }); return; }
      }
    }
    // party members burn too
    return _et(e);
  };
  const _pt = Battle.playerTurn.bind(Battle);
  Battle.playerTurn = function (a) { if (a && a.burn > 0 && !a.ko) { a.burn--; const d = a.burnDmg || 3; a.hp = Math.max(1, a.hp - d); this.text(a, 'BURN -' + d, '#ff7a3a', -20); this.hud(); } return _pt(a); };

  /* ---------- THE DRAG EYE: perfect defence teaches you the move ---------- */
  const _es = Battle.enemyStrike.bind(Battle);
  Battle.enemyStrike = async function (e, t, sk, isCounter) { const B = this.B; if (B) B.curSkill = { e, sk }; try { return await _es(e, t, sk, isCounter); } finally { if (B) B.curSkill = null; } };
  const _tx = Battle.text.bind(Battle);
  Battle.text = function (a, txt, ...rest) {
    const r = _tx(a, txt, ...rest);
    try {
      const B = this.B;
      if (B && a && a.isMe && !G.S.kid && (txt === 'PERFECT PARRY' || txt === 'PERFECT DODGE') && B.curSkill && B.curSkill.sk && B.curSkill.sk.hits && !/\(Kairo\)$/.test(B.curSkill.sk.name)) {
        const { e, sk } = B.curSkill, S = DragEye.st(), key = sk.name;
        if (!S.copies.some(c => c.name === key) && !(B.eyeDone && B.eyeDone[key])) {
          B.eyeDone = B.eyeDone || {}; B.eyeHit = B.eyeHit || {}; if (B.eyeHit[key + '#' + B.turn]) return r; B.eyeHit[key + '#' + B.turn] = 1;
          S.eyeSeen[key] = (S.eyeSeen[key] || 0) + 1;
          if (S.eyeSeen[key] >= DragEye.need()) { B.eyeDone[key] = 1; setTimeout(() => DragEye.copy(e, sk), 300); }
          else _tx(a, 'THE DRAG EYE WATCHES…', '#46ff95', -78);
        }
      }
    } catch (err) { }
    return r;
  };
  /* copies live in Ren's Arts */
  const S0 = () => G.S;
  setInterval(() => { try { if (S0() && S0().copies && S0().copies.length && !ARTS.copy0) DragEye.refresh(); } catch (e) { } }, 1000);
  if (typeof CombatX !== 'undefined') {
    const _m = CombatX.menu.bind(CombatX);
    CombatX.menu = function (a, L, done, resolve, reopen) {
      _m(a, L, done, resolve, reopen);
      if (a.isMe && !G.S.kid) for (const k of DragEye.keys()) if (ARTS[k] && !a.arts.includes(k)) a.arts = a.arts.concat([k]);
    };
  }
  const _use = Battle.useArt;
  Battle.useArt = async function (a, k) { const r = await _use.call(this, a, k); if (a && a.isMe && /^copy\d$/.test(k)) MASTERY.gain('me', 'mimic', 1); return r; };

  /* ---------- the story: the first time the Eye opens ---------- */
  const _vic = Battle.victory.bind(Battle);
  Battle.victory = async function () {
    const r = await _vic();
    const f = G.S.f;
    if (f.dragEyePending && !f.dragEyeKnown) {
      f.dragEyeKnown = 1; delete f.dragEyePending;
      setTimeout(() => Story.run(async () => {
        await me('shock', '…That move. I only saw it twice. And my body just — did it. Like I\'d trained it for years.');
        if ((G.S.party || []).includes('kess')) {
          await say('kessE', 'neutral', 'Drag Eye. Every one of us has it. We see a move once — really see it — and it\'s ours. Nana never told you?');
          await say('kessE', 'sad', 'It\'s why the Crown says we\'re monsters. Fight a Drag long enough and he fights back with your own sword. They call it theft. We call it seeing.');
        } else {
          await narr('Vane\'s voice, from a snowy morning years ago: "You don\'t learn a move, pup. You SEE it. Your people always could. That is what they are afraid of."');
        }
        await narr('THE DRAG EYE — meet an enemy technique with a PERFECT parry or dodge, twice, and you copy it. Copied moves appear in your Drag Arts.');
        save();
      }), 600);
    }
    return r;
  };
  if (typeof LEGENDS !== 'undefined') LEGENDS.push({ name: 'The Drag Eye', need: 'dragEyeKnown', text: 'Every Drag is born able to see a technique once and make it their own. The old wardens called it "seeing true". The Crown calls it theft — and it is the real reason no Imperial duelist will cross blades with a green-eyed child twice. Kairo uses it like breathing. Ren is only beginning.' });
})();
