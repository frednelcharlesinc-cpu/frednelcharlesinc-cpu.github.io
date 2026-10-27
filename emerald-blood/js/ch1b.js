/* =====================================================================
   CHAPTER I, EXPANDED — and the grind
   · Progression is a grind: every grade needs far more experience than before.
   · Enemies are built to outlast you: their HP scales above Ren's.
   · GUARDS step in front of their allies and take the blow (break the guard and it stops).
     PRIESTS raise barriers that soak damage. Kill or break the support first.
   · MASTERY: Ren's Emerald Ascension and Azure Tide last longer the higher his grade
     and the more he uses them; Kairo's Scar Bloom lasts longer and burns him out less
     as his rank climbs.
   · THE HALVARD ARC — three missions between the granary and the Old Mill:
       1. The Pyre in the Square  2. Brother Tam  3. The Supply Road (Sister Verity)
     The Mill's inner gate needs the Inquisitor's Seal from Sister Verity.
   ===================================================================== */

/* ---------------- the grind ---------------- */
(function () {
  const NEW = [0, 240, 700, 1500, 2700, 4400, 6800, 10000, 14500];
  for (let i = 0; i < NEW.length; i++) GRADE_XP[i] = NEW[i];
})();

/* ---------------- new foes ---------------- */
Object.assign(ENEMY, {
  ember_warden: { name: 'Ember Warden', img: 'acolyte', guard: 1, trait: 'GUARD — steps in front of allies and takes the blow', hp: 90, atk: 12, def: 5, spd: 9, dodge: .05, parry: .3, brk: 60, xp: 30, gold: 14,
    skills: [{ name: 'Brand Strike', hits: [{ anim: 'slash', m: 1.1, w: 600 }] }, { name: 'Shield Bash', w: .35, hits: [{ anim: 'thrust', m: .8, w: 460 }, { anim: 'slash', m: .9, w: 380 }] }] },
  pale_priest: { name: 'Pale Choir Priest', img: 'acolyte', priest: 1, trait: 'PRIEST — raises barriers on wounded allies', hp: 60, atk: 10, def: 3, spd: 10, dodge: .1, parry: .15, brk: 45, xp: 26, gold: 12,
    skills: [{ name: 'Lantern Bolt', hits: [{ anim: 'spellcast', m: 1, w: 640 }] }, { name: 'Censer Swing', w: .4, hits: [{ anim: 'slash', m: .9, w: 520 }] }] },
  verity: { name: 'Sister Verity', img: 'acolyte', spectral: '#ffe9b0', boss: 1, priest: 1, trait: "Halvard's right hand — barriers, and a lantern that never goes out", hp: 230, atk: 14, def: 5, spd: 12, dodge: .12, parry: .3, brk: 95, xp: 85, gold: 60,
    skills: [{ name: 'Ash Litany', hits: [{ anim: 'slash', m: .6, w: 480 }, { anim: 'slash', m: .6, w: 300 }, { anim: 'thrust', m: .8, w: 420 }] }, { name: 'Lantern Bolt', w: .35, hits: [{ anim: 'spellcast', m: 1.2, w: 640 }] },
      { name: 'Judgment of Ash', w: .2, hits: [{ anim: 'spellcast', m: 1.9, w: 1000, unp: 1 }] }] }
});
Object.assign(TIER, { ember_warden: 'C', pale_priest: 'D', verity: 'B' });
Object.assign(SKILL_EL, { 'Lantern Bolt': 'light', 'Judgment of Ash': 'fire', 'Brand Strike': 'fire' });
['voss', 'reg_captain', 'ge_corran_r'].forEach(k => { if (ENEMY[k]) ENEMY[k].guard = 1; });
['acolyte', 'inq_clerk'].forEach(k => { if (ENEMY[k]) ENEMY[k].priest = 1; });
Object.assign(CHAR, { verity: { name: 'Sister Verity', sprite: 'acolyte' }, tam: { name: 'Brother Tam', sprite: 'acolyte' }, edda: { name: 'Old Edda', sprite: 'dfolk4' }, crier: CHAR.crier || { name: 'Town Crier', sprite: 'folk7' } });

(function () {
  const BT = Battle;
  /* ---------- enemies outlast you ---------- */
  const _run = BT.run.bind(BT);
  BT.run = async function () {
    const B = this.B;
    try {
      const me = B && B.actors.find(a => a.isMe);
      if (B && me && !B.cfg.tutorial && !B.cfg.leafTrain && !G.S.kid) {
        const R8 = ['E', 'D', 'C', 'B', 'A', 'S', 'SS', 'SSS', 'SSSS'];
        for (const e of B.actors.filter(a => a.side === 'e')) {
          if (e.E.fixed) continue;
          const ti = Math.max(0, R8.indexOf(TIER[e.key] || 'E')), mine = Power.now().i;
          const k = e.E.boss ? 2.4 : ti > mine ? 1.6 : ti === mine ? 1.25 : 1.05;
          const want = Math.round(me.maxHp * k);
          if (e.maxHp < want) { e.maxHp = want; e.hp = want; }
          if (e.E.guard) e.guardCharge = 1;
        }
      }
    } catch (x) { console.warn(x); }
    return _run();
  };
  /* ---------- guards intercept, priests raise barriers ---------- */
  const _rh = BT.resolveHit.bind(BT);
  BT.resolveHit = function (a, t, m, grade, opts) {
    opts = opts || {};
    const B = this.B;
    const single = (opts.src === 'attack' || opts.src === 'link') && !opts.unblockable;
    if (B && single && a.side === 'p' && t.side === 'e' && !t.E.guard && !opts.redirected) {
      const g = this.alive('e').find(x => x !== t && x.E.guard && x.guardCharge > 0 && !x.broken && !x.panic);
      if (g) {
        g.guardCharge = 0;
        B.fx.push({ ringfx: 1, x: t.x, y: t.y - 34, col: '200,220,255', t: 0, life: 380, R: 34 });
        this.text(t, `SHIELDED BY ${g.name.toUpperCase()}`, '#cfe0ff', -70);
        const x0 = g.x; g.x = t.x + 34; setTimeout(() => { g.x = x0; }, 420);
        sfx('parry');
        return _rh(a, g, m * .6, grade, Object.assign({}, opts, { redirected: 1 }));
      }
    }
    return _rh(a, t, m, grade, opts);
  };
  const _dmg = BT.damage.bind(BT);
  BT.damage = function (t, dmg, big) {
    if (t.barrier > 0 && dmg > 0) {
      const soak = Math.min(t.barrier, dmg); t.barrier -= soak; dmg -= soak;
      this.text(t, t.barrier > 0 ? `BARRIER −${soak}` : 'BARRIER SHATTERED', '#fff3b0', -46, !t.barrier); if (!t.barrier) sfx('break');
      if (dmg <= 0) { t.hurtT = 120; this.hud(); return; }
    }
    return _dmg(t, dmg, big);
  };
  const _et = BT.enemyTurn.bind(BT);
  BT.enemyTurn = async function (e) {
    if (e.E.guard && !e.broken) e.guardCharge = 1;
    if (e.E.priest && !e.panic && !e.broken && Math.random() < .45) {
      const hurt = this.alive('e').filter(x => !x.barrier && x.hp < x.maxHp * .75).sort((p, q) => p.hp / p.maxHp - q.hp / q.maxHp)[0];
      if (hurt) {
        await this.msg(`${e.name}: Sanctuary`, 750); sfx('chant');
        e.anim = 'spellcast'; this.play(e, 'spellcast', 7, 70);
        hurt.barrier = Math.round(Math.max(e.maxHp * .35, hurt.maxHp * .22));
        this.text(hurt, `BARRIER ${hurt.barrier}`, '#fff3b0', -46, true); this.spark(hurt.x, hurt.y - 30, '#fff3b0', 16);
        await wait(500); this.hud(); return;
      }
    }
    return _et(e);
  };
  const _r = BT.render.bind(BT);
  BT.render = function (c, t) {
    _r(c, t);
    const B = this.B; if (!B || B.clashOn) return;
    for (const a of B.actors) {
      if (a.ko) continue;
      if (a.barrier > 0) { c.save(); c.globalCompositeOperation = 'lighter'; c.strokeStyle = `rgba(255,240,170,${.45 + Math.sin(t / 160) * .15})`; c.lineWidth = 2; const s = BT_SCALE * (a.size || 1); c.beginPath(); c.ellipse(a.x + (a.kbx || 0), a.y - 30 * s, 22 * s, 38 * s, 0, 0, 7); c.stroke(); c.restore(); }
      if (a.side === 'e' && a.E.guard && a.guardCharge > 0 && !a.broken) { c.save(); c.font = '900 13px "Nunito"'; c.textAlign = 'center'; c.fillStyle = '#cfe0ff'; c.strokeStyle = '#000'; c.lineWidth = 3; c.strokeText('⛨', a.x - 30, a.y - 66); c.fillText('⛨', a.x - 30, a.y - 66); c.restore(); }
    }
  };

  /* ---------- MASTERY ---------- */
  const _ua = BT.useArt.bind(BT);
  BT.useArt = async function (a, k) {
    const r = await _ua(a, k);
    try {
      if (a.isMe && (k === 'sight' || k === 'azure')) {
        const f = G.S.f, key = k === 'sight' ? 'ascUses' : 'azureUses'; f[key] = (f[key] || 0) + 1;
        const bonus = Mastery.bonus(k);
        if (k === 'sight' && a.sight) { a.sight += bonus; }
        if (k === 'azure' && a.azure) { a.azure += bonus; }
        if (bonus) this.text(a, `MASTERY +${bonus} TURN${bonus > 1 ? 'S' : ''}`, '#c9ffd8', -86);
        const lv = Mastery.level(f[key]); if (lv > (f[key + 'Lv'] || 0)) { f[key + 'Lv'] = lv; toast(`<b style="color:#7dffb0">${ARTS[k].name}</b> mastery ${['', 'I', 'II', 'III'][lv]} — your body holds it longer.`, 3200); }
      }
    } catch (x) { }
    return r;
  };
  const _as = BT.artStrain.bind(BT);
  BT.artStrain = function (a, k) { const s = _as(a, k); return a && a.isMe ? Math.max(5, s - Power.now().i * 3) : s; };
  // Kairo: the higher his rank, the steadier the bloom
  const _mo = BT.morph.bind(BT);
  BT.morph = async function (e) {
    const r = await _mo(e);
    if (e.key === 'kairo_duel') {
      const ki = Math.max(0, Math.floor(Rivals.kairo() / 3));
      const extra = Math.floor(ki / 2); if (extra) { e.morph += extra; this.text(e, `CONTROLLED BLOOM +${extra}`, '#ff9a6a', -88); }
      e.bloomControl = ki;
    }
    return r;
  };
  const _um = BT.unmorph.bind(BT);
  BT.unmorph = async function (e) {
    const r = await _um(e);
    if (e.key === 'kairo_duel' && e.bloomControl) {
      e.broken = Math.max(0, 2 - Math.floor(e.bloomControl / 2)); if (!e.broken) { e.brk = Math.round(e.brkMax * .5); this.text(e, 'HE KEEPS HIS FEET', '#ffb070', -50); }
      if (e.bloomControl >= 4) { e.atk = Math.round(e.E.atk * 1.1); e.exhausted = 0; }
    }
    return r;
  };
})();
const Mastery = {
  level(n) { return n >= 25 ? 3 : n >= 12 ? 2 : n >= 5 ? 1 : 0; },
  bonus(k) { const f = G.S.f, n = f[k === 'sight' ? 'ascUses' : 'azureUses'] || 0; return Math.floor(Power.now().i / 2) + this.level(n); }
};
// mastery shows on the Passives page
(function () {
  if (typeof passivesMenuHTML !== 'function') return;
  const _p = passivesMenuHTML;
  passivesMenuHTML = function () {
    const f = G.S.f, row = (k, nm, key) => { const n = f[key] || 0, lv = Mastery.level(n), nx = [5, 12, 25][lv]; return `<p><b>${nm}</b> — mastery ${['0', 'I', 'II', 'III'][lv]} · used ${n}×${nx ? ` (next at ${nx})` : ''} · <b style="color:#7dffb0">+${Mastery.bonus(k)} turn${Mastery.bonus(k) === 1 ? '' : 's'}</b></p>`; };
    return _p() + `<div class="stat" style="margin-top:6px"><h3 style="color:#7dffb0">◉ Aura mastery</h3><p class="muted">Your grade and how often you've used them both make your auras last longer. Every grade also cools your Arts' Strain.</p>${G.S.arts.includes('sight') ? row('sight', 'Emerald Ascension', 'ascUses') : ''}${G.S.arts.includes('azure') ? row('azure', 'Azure Tide', 'azureUses') : ''}<p class="muted">Strain on every Art: −${Power.now().i * 3}</p></div>`;
  };
})();

/* =====================================================================
   THE HALVARD ARC
   ===================================================================== */
const H = () => G.S.f;
// 1 — THE PYRE IN THE SQUARE (fires when you come back to Ashford knowing about the mill)
async function pyreInSquare() {
  const f = H(); if (f.h1) return; f.h1 = 'seen';
  await fadeOut(500); await World.load('ashford', 29, 23, 'up'); await wait(200); await fadeIn(500);
  await narr('Every bell in Ashford Hollow is ringing at once. The square is packed. A cage-wagon stands by the fountain, and a stake has been driven into the cobbles beside it.');
  await narr('An old woman sits in the cage, hands folded. Green eyes, faded almost grey. Edda the tinker — she has mended half the pots in the vale.');
  await say('halvard', 'neutral', 'Children of the Hollow. I did not come to frighten you. I came because I love you.');
  await say('halvard', 'neutral', 'Every Drag is a spark, and every spark remembers the fire. This woman has hidden among you for sixty years. Sixty years of sparks.');
  await say('halvard', 'happy', 'At dawn, we will be warm together. Pray with me.');
  await narr('He stops. Turns. Looks straight through the crowd — at you.');
  await say('halvard', 'neutral', 'You. The hooded one. You are not praying.');
  const c = await ask('me', 'anger', '(Every eye in the square follows his.)', ['"I don\'t pray to fire."', '(Bow your head and pray.)', '(Say nothing. Hold his stare.)']);
  if (c === 0) { f.halvardMarked = 1; await say('halvard', 'happy', '"Not yet." Remember that I said that. Everyone does, in the end.'); Story.addSus(.5); }
  else if (c === 1) { await narr('You bow your head. Your jaw aches with it. Halvard smiles, satisfied, and moves on.'); f.bowed = 1; }
  else { f.halvardMarked = 1; await say('halvard', 'neutral', '…Interesting. Brother, note that one.'); }
  await narr('The procession moves off toward the chapel. The cage goes with it. Dawn is eight hours away.');
  await me('anger', '…Not her. Not while I can stand.');
  Story.quest('Free Old Edda from the chapel cells before dawn. The chapel is in Ashford\'s north-west corner.');
  f.h1 = 'night';
  await fadeOut(700); G.S.clock = 23 * 60; await wait(250); await fadeIn(700);
  await narr('Night. The square is empty. A light burns in the chapel windows, and two Ember Wardens stand at the door.');
  const veil = typeof Veil !== 'undefined' && Veil.on();
  await narr(veil ? 'The red scarf goes up. Nobody needs to know whose hands open that cage.' : 'You pull your hood low. If anyone sees your eyes tonight, they will remember them.');
  const r = await Battle.start({ enemies: ['ember_warden', 'pale_priest', 'ember_warden'], noFlee: true, bd: 'town', intro: 'The Ember Wardens close ranks at the chapel door!', veilLine: 'She mended every pot in this town. Let her go.' });
  if (r === 'lose') { await Story.defeat(); f.h1 = 'night'; return; }
  await narr('The cell key is on the priest\'s belt. Edda doesn\'t run when the door opens. She looks at you for a long time.');
  await say('edda', null, '"…Green, under there. I thought so. I mended your grandmother\'s kettle, you know. Twice."');
  await say('edda', null, '"Listen, child. Halvard doesn\'t keep the vessels at the mill to burn them. He keeps them to SING. There\'s a choir under that mill — children singing to a green stone, night and day, for some prince in Aurel."');
  await say('edda', null, '"And there\'s a boy in his robes who can\'t stand it anymore. Brother Tam. He brought me water when no one was looking. He wants out. Find him."');
  await narr('By morning Edda is gone — over the hills with a tinker\'s cart and a new name. The Inquisition finds an empty cell and a stake nobody used.');
  if (veil) Veil.addFame(2, 'the Red Veil emptied the chapel cell the night before a burning.');
  Opinion.add('hope', 1); Story.gainXp(60); G.S.gold += 30;
  f.h1 = 'done';
  Intel.add('you', 'Old Edda: Halvard keeps the children at the mill to SING to a green stone — "for a prince in Aurel". A young acolyte, Brother Tam, wants out.');
  Story.quest('Find Brother Tam. Maren might know how to reach a frightened acolyte.');
}
// 2 — BROTHER TAM
async function tamThroughMaren() {
  const f = H();
  await say('maren', 'sad', 'Tam. Of course it\'s Tam. He comes for burn-salve every week — for his own hands. He holds the censer too close on purpose. Punishing himself, I think.');
  await say('maren', 'neutral', 'He prays alone at the old shrine in the East Woods every evening. If you go, go gently. He\'s more afraid of you than you are of him.');
  f.h2 = 'shrine'; Story.quest('Meet Brother Tam at the old shrine in the East Woods.');
}
async function talkTam() {
  const f = H(); if (f.h2 !== 'shrine') return;
  await say('tam', null, '"Don\'t— please. I\'m not armed. I\'m not anything."');
  await narr('He is maybe seventeen. His hands are bandaged to the wrists.');
  await say('tam', null, '"Edda said a green-eyed stranger would come. I didn\'t believe her. I didn\'t believe anything anymore."');
  await say('tam', null, '"There are nineteen of them under the mill. The youngest is five. They sing to a stone the size of a fist, and the stone… hums back. Halvard says it\'s for the Prince-Regent. That the Prince wants it awake before the old Emperor dies."');
  await say('tam', null, '"The inner door has a lock only the Inquisitor\'s Seal can open. Sister Verity carries it. She rides the supply road every third day with the lamp-oil and the grain."');
  await narr('Twigs snap. Torchlight between the trees. Tam goes white.');
  await say('tam', null, '"They followed me. Oh, gods, they followed me—"');
  const r = await Battle.start({ enemies: ['stone_hunter', 'ember_warden', 'stone_hunter'], noFlee: true, bd: 'forest', intro: 'Registry hunters — they tracked Tam to the shrine!' });
  if (r === 'lose') { await Story.defeat(); return; }
  await say('tam', null, '"…You could have left me. That would have been smarter."');
  await me('neutral', 'Smart was never my strong suit.');
  await say('tam', null, '"The convoy. North-east road through these woods, near the dead oak. Tomorrow. Verity will have the Seal on a chain around her neck. She… she won\'t go quietly. She never does anything quietly."');
  await narr('Tam takes the south road out of the vale with a letter for Sister Aud in Millbrook. He doesn\'t look back. He doesn\'t need to.');
  f.h2 = 'done'; Story.gainXp(55); Opinion.add('hope', .5);
  Intel.add('you', 'Brother Tam: nineteen children under the mill sing to a D-stone "for the Prince-Regent". The inner door needs the Inquisitor\'s Seal — Sister Verity carries it on the supply road through the East Woods.');
  World.remove('tam');
  if (G.S.map === 'woods' && !World.ent('convoy')) { const [x, y] = freeNear('woods', 38, 9); await World.addNpc({ id: 'convoy', sprite: 'acolyte', x, y, dir: 'down', name: 'Sister Verity', talk: convoyAmbush, qm: () => '!' }); }
  Story.quest('Ambush Sister Verity\'s supply convoy on the road through the East Woods and take the Inquisitor\'s Seal.');
}
// 3 — THE SUPPLY ROAD
async function convoyAmbush() {
  const f = H(); if (f.h2 !== 'done' || f.h3) return;
  await narr('The convoy comes around the dead oak exactly when Tam said it would: two lamp-oil wagons, a grain cart, and a woman on a white horse with a lantern that burns in daylight.');
  const party = G.S.party.includes('kess');
  if (party) await say('kessE', 'neutral', 'That\'s Verity. She burned a whole street in Cinderfall because one door wouldn\'t open. Don\'t let her talk. She talks people into standing still.');
  await say('verity', null, '"Ah. The hooded one. Brother Halvard described you. He was so pleased that you didn\'t pray."');
  await say('verity', null, '"Step aside, child. The light needs its oil."');
  const c = await ask('me', 'anger', '…', ['"The children need their mothers."', '"Your light can go hungry."', '(Draw your sword.)']);
  if (c === 0) await say('verity', null, '"They HAVE a mother. The Lantern. She sings to them every night."');
  const r = await Battle.start({ enemies: ['ember_warden', 'verity', 'pale_priest'], noFlee: true, boss: true, bd: 'forest', music: 'boss', intro: 'Sister Verity — the Lantern\'s Hand', veilLine: 'Your lantern stays dark tonight.' });
  if (r === 'lose') { await Story.defeat(); return; }
  await narr('Verity is on her knees in the road, lantern guttering. She is laughing, softly, like someone at a prayer that finally made sense.');
  await say('verity', null, '"Take it. Take the Seal. It doesn\'t matter. He has already heard them singing. Do you know who hears a choir, child? Kings."');
  await narr('You cut the chain from her neck: a heavy gold disc, a sun with a closed eye at its centre. The lamp-oil wagons go into the ravine. They burn for an hour.');
  f.h3 = 'done'; f.sealGot = 1; f.oilBurned = 1;
  G.S.qitems = G.S.qitems || {}; G.S.qitems.seal = 1;
  Story.gainXp(90); G.S.gold += 60; Opinion.add('hope', .5);
  if (typeof Veil !== 'undefined' && Veil.on()) Veil.addFame(1, 'the Inquisition\'s lamp-oil burned in a ravine, and a red scarf was seen above it.');
  toast('Got <b style="color:#ffd36a">the Inquisitor\'s Seal</b>. And without the lamp-oil, Halvard\'s Purging Light will burn weaker.', 4200);
  Intel.add('you', 'Sister Verity is beaten. You hold the Inquisitor\'s Seal — the Old Mill\'s inner door is yours to open. The lamp-oil burned: Halvard\'s light will be weaker.');
  Story.quest(F().vossGone ? 'You have the Seal. Take the north road to the Old Mill.' : 'You have the Seal. Get past Captain Voss on the north road — Kess said she\'d help.');
}

/* ---------- wiring ---------- */
(function () {
  // Ashford: the pyre fires once you know where the cages are; the chapel door offers the night raid if it was interrupted
  const _l = World.load.bind(World);
  World.load = async function (name, x, y, dir) {
    const r = await _l(name, x, y, dir);
    try {
      const f = G.S && G.S.f;
      if (f && name === 'ashford' && f.learnedMill && !f.h1 && !G.S.kid && !f.millDone && G.mode === 'world')
        setTimeout(() => { if (!World.busy && G.mode === 'world' && !F().h1) Story.run(pyreInSquare); }, 1300);
    } catch (e) { }
    return r;
  };
  // Maren hands you Tam
  if (typeof talkMaren === 'function') {
    const _m = talkMaren;
    talkMaren = async function () { const f = H(); if (f.h1 === 'done' && !f.h2) return tamThroughMaren(); return _m(); };
  }
  // the chapel night raid can be retried at the chapel door if you lost it
  const ash = SCENES.ashford, _np = ash.npcs;
  ash.npcs = function () {
    const L = _np.call(this), f = H();
    if (f.h1 === 'night') L.push({ id: 'chapelDoor', sprite: 'acolyte', x: 9, y: 4, dir: 'down', name: 'Ember Warden', talk: async () => { const c = await ask(null, null, 'The chapel. Two Ember Wardens at the door. Edda is inside.', ['Break her out', 'Not yet']); if (c === 0) { f.h1 = 'seen'; f.h1Retry = 1; await pyreRetry(); } }, qm: () => '!' });
    return L;
  };
  // the woods: Tam at the shrine, the convoy by the dead oak
  const wd = SCENES.woods, _wn = wd.npcs;
  wd.npcs = function () {
    const L = _wn.call(this), f = H();
    if (f.h2 === 'shrine') { const [x, y] = freeNear('woods', 11, 9); L.push({ id: 'tam', sprite: 'acolyte', x, y, dir: 'left', name: 'Brother Tam', talk: talkTam, qm: () => '!' }); }
    if (f.h2 === 'done' && !f.h3) { const [x, y] = freeNear('woods', 38, 9); L.push({ id: 'convoy', sprite: 'acolyte', x, y, dir: 'down', name: 'Sister Verity', talk: convoyAmbush, qm: () => '!' }); }
    return L;
  };
  // no Seal, no inner door
  const ex = ash.exits.find(e => e.to === 'mill' && e.when && String(e.when).includes('learnedMill'));
  if (ex) { const w = ex.when; ex.when = () => w() && !!H().sealGot; }
  ash.exits.splice(ash.exits.indexOf(ex) + 1, 0, { x: 28, x2: 31, y: 0, msg: "The mill's inner door opens only for the Inquisitor's Seal. Without it you'd be throwing yourself at a wall of Wardens. (Free Edda, find Brother Tam, take the Seal from Sister Verity.)", when: () => F().vossGone && F().learnedMill && !H().sealGot });
  // a weaker Purging Light if the oil burned
  const _bs = Battle.start.bind(Battle);
  Battle.start = async function (cfg) { if (cfg && cfg.enemies && cfg.enemies.includes('halvard') && H().oilBurned) { cfg.intro = (cfg.intro || '') + ' (His lantern burns low — the lamp-oil is gone.)'; } return _bs(cfg); };
  const _r = Battle.run.bind(Battle);
  Battle.run = async function () { const B = this.B; try { if (H().oilBurned) for (const e of B.actors) if (e.key === 'halvard') { e.atk = Math.round(e.atk * .85); e.maxHp = Math.round(e.maxHp * .9); e.hp = e.maxHp; } } catch (x) { } return _r(); };
  // quest-hint arrows on the Quests page
  const _q = questsMenuHTML;
  questsMenuHTML = function () {
    let h = _q(); const f = H(); if (!f.learnedMill || f.millDone) return h;
    const st = (ok, t) => `<p>${ok ? '<b style="color:#46ff95">✓</b>' : '<b style="color:#ffd36a">○</b>'} ${t}</p>`;
    return h + `<div class="stat" style="margin-top:6px"><h3 style="color:#ffd36a">The Inquisitor's Shadow</h3>${st(f.h1 === 'done', 'The Pyre in the Square — free Old Edda')}${st(f.h2 === 'done', 'Brother Tam — meet the acolyte at the East Woods shrine')}${st(!!f.sealGot, 'The Supply Road — take the Seal from Sister Verity')}</div>`;
  };
})();
async function pyreRetry() {
  const f = H(); f.h1 = 'night';
  const r = await Battle.start({ enemies: ['ember_warden', 'pale_priest', 'ember_warden'], noFlee: true, bd: 'town', intro: 'The Ember Wardens close ranks at the chapel door!' });
  if (r === 'lose') { await Story.defeat(); return; }
  // replay the rescue's ending
  await narr('The cell key is on the priest\'s belt. Edda squints up at you and grins.');
  await say('edda', null, '"Took you long enough. Listen — Halvard keeps the children at the mill to SING to a green stone, for some prince in Aurel. And there\'s a boy in his robes who wants out. Brother Tam. Find him."');
  Opinion.add('hope', 1); Story.gainXp(60); G.S.gold += 30; f.h1 = 'done';
  Intel.add('you', 'Old Edda: Halvard keeps the children at the mill to SING to a green stone — "for a prince in Aurel". A young acolyte, Brother Tam, wants out.');
  Story.quest('Find Brother Tam. Maren might know how to reach a frightened acolyte.');
}
