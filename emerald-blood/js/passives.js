'use strict';
/* ================= PASSIVE ABILITIES =================
   Ren equips passives into slots that open with his power grade (B = 3 slots, 6 at the very top).
   Kairo, Green Eclipse, companions, bosses and ordinary monsters carry their own passives, shown under their name in battle. */
const PASSIVES = {
  timesight: { name: 'Emerald Time', icon: '◉', desc: 'The eye that wakes your Ascension sometimes wakes on its own. When an enemy attacks you there is a chance the world slows to a crawl — the defense rings close slowly, and every window opens wide.', need: () => G.S.arts.includes('sight'), lock: 'Learn Emerald Ascension' },
  sheath: { name: 'Sheathed Calm', icon: '⚔', desc: 'Vane\'s first lesson. Your first attack of every battle is drawn from stillness — an automatic PERFECT.', need: () => G.S.arts.includes('horizon') || !!F().vaneDone, lock: 'Finish your training with Vane' },
  footwork: { name: 'Snowfall Footwork', icon: '❄', desc: 'Five winters of dodging an old man\'s cane in a blizzard. Dodge and parry windows +15%.', need: () => !!F().vaneDone, lock: 'Finish your training with Vane' },
  hood: { name: "Grandfather's Hood", icon: '☗', desc: 'Start a fight with your hood up and the enemy hesitates — they can\'t read your eyes. Enemies act noticeably later.', need: () => !!F().hoodGiven, lock: 'Receive the hood' },
  unbound: { name: 'Unbound Current', icon: '✦', desc: 'You move mana itself, not an element. Perfect dodges and perfect parries restore +2 extra MP.', need: () => !!F().shrineRead, lock: 'Read the binding stone in the East Woods' },
  knot: { name: 'Dragon Knot', icon: '∞', desc: 'Ilya\'s ribbon, knotted on your wrist. Once per battle, a blow that would drop you leaves you standing at 1 HP.', need: () => !!F().millDone, lock: 'Find the other half of the ribbon' },
  rival: { name: 'Forty-Two to One', icon: '⚑', desc: 'You and Kairo have been keeping score since you were six. +20% damage against rivals — Kairo, Green Eclipse, and anyone who has sworn to beat you.', need: () => !!F().duel || !!F().ge1 || !!F().ge2, lock: 'Cross blades with a rival' },
  pressure: { name: 'Bloodline Pressure', icon: '▲', desc: 'Your blood remembers the dragon. Enemies two or more grades beneath you lose 20% ATK and hesitate.', need: () => Power.now().i >= 3, lock: 'Reach power grade B' },
  stillwater: { name: 'Still Water', icon: '≈', desc: 'Every third PERFECT parry or dodge in a row restores 8% of your HP. Vane called it "breathing while the storm hits."', need: () => Power.now().i >= 4, lock: 'Reach power grade A' }
};
// passives everyone else carries
const EPASS = {
  scarMemory: { name: 'Scar Memory', desc: 'In Scar Bloom, every attack works on him once — then his scales remember it.' },
  pyre: { name: 'Pyre Heart', desc: 'The more he bleeds, the harder he hits (up to +40% ATK).' },
  pride: { name: "Rival's Pride", desc: 'Land a PERFECT on him and his next blow comes back 25% harder.' },
  eleven: { name: 'Eleven Saved', desc: 'Once per fight, when he falls low, he remembers the eleven he carried out of the fire — and stands up stronger (heals 15%).' },
  forHim: { name: 'For Him', desc: 'Below half HP: +30% ATK. Kairo is watching. (He isn\'t.)' },
  skull: { name: 'Thick Skull', desc: 'Shrugs off his first BREAK completely.' },
  cagePat: { name: 'Cage Patience', desc: '+15% dodge while wounded. Four years in a cage taught her to wait.' },
  anvil: { name: 'Anvil', desc: 'PERFECT hits deal 25% less to him.' },
  pack: { name: 'Pack Hunter', desc: '+10% ATK for every other beast of its pack still standing.' },
  coward: { name: 'Cowardly', desc: 'Runs for it below 20% HP.' },
  rooted: { name: 'Rooted', desc: 'Regrows 5% HP every turn.' },
  gnaw: { name: 'Gnaw', desc: 'Every bite lowers your DEF by 1 (up to 3).' },
  cutpurse: { name: 'Cutpurse', desc: 'Steals a few coins whenever a hit lands.' },
  drill: { name: 'Registry Drill', desc: 'Soldiers beside him take 15% less damage.' },
  litany: { name: 'Litany', desc: '+10% ATK for every other acolyte singing.' },
  faith: { name: 'Faith Ward', desc: 'Takes half damage and heals while an Acolyte lives.' },
  phalanx: { name: 'Phalanx', desc: 'Shields soak big hits; many small hits break them.' },
  sleeve: { name: 'The Empty Sleeve', desc: 'In stance, plain attacks are countered.' },
  blackSun: { name: 'The Black Sun', desc: 'Nothing you have is enough. Yet.' },
  hunger: { name: 'Mana Hunger', desc: 'Drag Arts heal it.' },
  frost: { name: 'Frost Armor', desc: '+8 DEF until shattered by a Cast or a BREAK.' },
  howl: { name: 'Alpha Howl', desc: 'Howls for the pack when wounded.' },
  elevenSteps: { name: 'Eleven Steps', desc: 'She counts to eleven before every fight. Her strikes deal +20%.' },
  coals: { name: 'Smothered Coals', desc: 'Twelve years of hiding: she starts every battle unseen.' },
  forged: { name: 'Forge-Hardened', desc: 'Takes 15% less damage.' },
  ironDiscipline: { name: 'Obedience', desc: "Voss doesn't hate you. He just doesn't stop. +1 shield every few turns." }
};
const HOLDS = {
  kairo_duel: ['scarMemory', 'pyre', 'pride', 'eleven'], kairo_spar: ['pride'], ge_tamsin_r: ['forHim', 'pyre'], ge_dace_r: ['skull', 'pride'], ge_wren_r: ['cagePat'], ge_corran_r: ['anvil', 'skull'],
  lupine: ['pack'], rime_lupine: ['pack'], lupine_alpha: ['pack', 'howl'], rime_alpha: ['pack', 'frost'], m_goblin: ['coward'], m_goblin_shaman: ['coward'], m_gourd: ['rooted'], m_ratfolk: ['gnaw', 'coward'],
  bandit: ['cutpurse'], rook: ['cutpurse', 'coward'], bq_highwayman: ['cutpurse'], reg_captain: ['drill', 'phalanx'], acolyte: ['litany'], inq_clerk: ['litany'], halvard: ['faith'], voss: ['phalanx', 'ironDiscipline'],
  vane: ['sleeve'], vane_spar: ['sleeve'], dread: ['blackSun'], mana_wyrm: ['hunger'], bq_count: ['hunger'], bq_redeye: ['pack'],
  liora: ['elevenSteps'], kess: ['coals'], oren: ['forged'], tamsin: ['forHim'], dace: ['skull']
};
const has = (a, p) => !!a && (a.isMe ? Passives.on(p) : (HOLDS[a.key || a.id] || []).includes(p));

const Passives = {
  slots() { return Math.min(6, Math.max(1, Power.now().i)); },
  list() { G.S.passives = G.S.passives || []; return G.S.passives; },
  learned() { G.S.plearned = G.S.plearned || []; return G.S.plearned; },
  on(id) { return G.S && this.list().includes(id) && PASSIVES[id] && PASSIVES[id].need(); },
  check() { // newly unlocked passives are learned, and slotted if there's room
    if (!G.S || G.S.kid) return; const L = this.learned(), E = this.list();
    for (const [id, P] of Object.entries(PASSIVES)) if (!L.includes(id) && P.need()) {
      L.push(id); if (E.length < this.slots()) E.push(id);
      setTimeout(() => toast(`New passive: <b style="color:#7dffb0">${P.icon} ${P.name}</b>${E.includes(id) ? ' — equipped.' : ' — equip it from Menu ▸ Passives.'}`, 3600), 400);
    }
    while (E.length > this.slots()) E.pop();
  },
  toggle(id) { const E = this.list(); const i = E.indexOf(id); if (i >= 0) E.splice(i, 1); else if (E.length < this.slots()) E.push(id); else toast(`All ${this.slots()} passive slots are full. Unequip one first.`); save(); }
};
setInterval(() => { try { if (G.S && G.mode === 'world') Passives.check(); } catch (e) { } }, 2500);

function passivesMenuHTML() {
  const L = Passives.learned(), E = Passives.list(), n = Passives.slots();
  const nextAt = ['D', 'C', 'B', 'A', 'S', 'SS'][Math.min(5, n)] || null;
  let h = `<div class="stat"><h3>Passive abilities <span class="muted">· ${E.length}/${n} slots</span></h3><p class="muted">Passives are always on. Slots open as your power grade rises: 3 at grade B, 6 at the very top.${n < 6 && nextAt ? ` Next slot at grade <b>${['C', 'B', 'A', 'S', 'SS'][n - 1] || 'SS'}</b>.` : ''}</p>
    <p>${Array.from({ length: 6 }, (_, i) => `<span class="grade" style="--gc:${i < n ? (E[i] ? '#46ff95' : '#6a8a76') : '#333'}">${i < n ? (E[i] ? PASSIVES[E[i]].icon : '○') : '🔒'}</span>`).join(' ')}</p></div>`;
  h += '<div class="grid2">';
  for (const [id, P] of Object.entries(PASSIVES)) {
    const got = L.includes(id), on = E.includes(id);
    h += `<div class="stat lore${got ? '' : ' locked'}" style="margin-top:6px"><h3>${P.icon} ${got ? P.name : '???'} ${on ? '<span style="color:#46ff95">· EQUIPPED</span>' : ''}</h3><p class="muted">${got ? P.desc : 'Locked — ' + P.lock + '.'}</p>${got ? `<button class="btn" data-pv="${id}">${on ? 'Unequip' : 'Equip'}</button>` : ''}</div>`;
  }
  h += '</div><div class="stat" style="margin-top:6px"><h3>Rivals\' passives</h3>' + ['kairo_duel', 'ge_tamsin_r', 'ge_dace_r', 'ge_wren_r', 'ge_corran_r'].map(k => `<p><b>${ENEMY[k].name}</b> — ${(HOLDS[k] || []).map(p => `<span style="color:#ffd88a">${EPASS[p].name}</span>: <span class="muted">${EPASS[p].desc}</span>`).join(' · ')}</p>`).join('') + '</div>';
  return h;
}
function bindPassivesMenu() { $$('#menuCard [data-pv]').forEach(b => bindTap(b, () => { Passives.toggle(b.dataset.pv); sfx('blip'); UI.renderMenu(); })); }

/* ---------- battle hooks ---------- */
(function () {
  const BT = Battle;
  const _run = BT.run.bind(BT);
  BT.run = function () {
    const B = this.B;
    if (B && !B.pinit) {
      B.pinit = 1; const me = this.me();
      if (me && Passives.on('sheath')) { me.focus = 1; }
      if (me && Passives.on('knot')) me.knot = 1;
      if (me && Passives.on('hood') && G.S.hood) { for (const e of this.alive('e')) e.wait *= 1.4; setTimeout(() => this.text(me, "☗ They can't read your eyes", '#cfe8ff', -64), 300); }
      if (me && Passives.on('pressure')) for (const e of this.alive('e')) if (this.rankOf(me) - this.rankOf(e) >= 2) { e.atk = Math.round(e.atk * .8); e.wait *= 1.15; }
      for (const a of B.actors) if (a.side === 'p' && has(a, 'coals')) a.veil = 1;
      for (const a of B.actors) { const L = HOLDS[a.key || (a.isMe ? '' : a.id)]; if (L && L.length) a.passTxt = '✦ ' + L.map(p => EPASS[p].name).join(' · '); }
    }
    return _run();
  };
  // who is hitting whom, so damage can be shaped by both sides' passives
  const _rh = BT.resolveHit.bind(BT);
  BT.resolveHit = function (a, t, m, grade, opts) {
    const keep = t && t.dodge; if (t && has(t, 'cagePat') && t.hp < t.maxHp) t.dodge = keep + .15;
    this._src = { a, grade };
    try { return _rh(a, t, m, grade, opts); } finally { this._src = null; if (t && has(t, 'cagePat')) t.dodge = keep; if (t && a && a.side === 'p' && grade === 'perfect' && has(t, 'pride')) t.prideUp = 1; }
  };
  const _chip = BT.chip.bind(BT);
  BT.chip = function (e, t, m, full, el) { this._src = { a: e, grade: 'chip', el }; try { return _chip(e, t, m, full, el); } finally { this._src = null; } };
  const _dmg = BT.damage.bind(BT);
  BT.damage = function (t, dmg, big) {
    const s = this._src, a = s && s.a; let k = 1;
    if (a && dmg > 0) {
      if (a.isMe && Passives.on('rival') && (RIVAL_KEYS.includes(t.key) || GE_RIVAL[t.key])) k *= 1.2;
      if (has(a, 'pyre')) k *= 1 + Math.min(.4, (1 - a.hp / a.maxHp) * .8);
      if (a.prideUp && a.side === 'e') { k *= 1.25; a.prideUp = 0; this.text(a, "RIVAL'S PRIDE", '#ff9a6a', -48); }
      if (has(a, 'forHim') && a.hp < a.maxHp * .5) k *= 1.3;
      if (has(a, 'pack')) k *= 1 + .1 * this.alive(a.side).filter(x => x !== a && HOLDS[x.key] && HOLDS[x.key].includes('pack')).length;
      if (has(a, 'litany')) k *= 1 + .1 * this.alive(a.side).filter(x => x !== a && (x.key === 'acolyte' || x.key === 'inq_clerk')).length;
      if (has(a, 'elevenSteps')) k *= 1.2;
      if (has(t, 'anvil') && s.grade === 'perfect') k *= .75;
      if (has(t, 'forged')) k *= .85;
      if (t.side === 'e' && this.alive('e').some(x => x !== t && x.key === 'reg_captain')) k *= .85;
      if (t.side === 'p' && has(a, 'gnaw') && (t.gnaw || 0) < 3) { t.gnaw = (t.gnaw || 0) + 1; t.def = Math.max(0, t.def - 1); this.text(t, 'GNAWED — DEF -1', '#c9a46a', -46); }
      if (t.isMe && has(a, 'cutpurse') && G.S.gold > 0) { const g = Math.min(G.S.gold, 3 + Math.floor(Math.random() * 4)); G.S.gold -= g; this.text(t, `-${g} GOLD (stolen!)`, '#ffd34a', -58); }
    }
    dmg = Math.max(dmg > 0 ? 1 : 0, Math.round(dmg * k));
    if (t.isMe && t.knot && dmg >= t.hp && t.hp > 1) { dmg = t.hp - 1; t.knot = 0; setTimeout(() => { this.text(t, '∞ DRAGON KNOT — STILL STANDING', '#7dffb0', -70, true); sfx('heal'); }, 50); }
    if (has(t, 'eleven') && !t.elevenUsed && !t.morph && t.hp - dmg < t.maxHp * .25 && t.hp - dmg > 0 && !t.exhausted) {
      t.elevenUsed = 1; const r = _dmg(t, dmg, big); const h = Math.round(t.maxHp * .15); t.hp = Math.min(t.maxHp, t.hp + h); t.atk = Math.round(t.atk * 1.1);
      setTimeout(() => { this.text(t, `ELEVEN SAVED +${h}`, '#ffb070', -60, true); this.msg(`${t.name}: "I got eleven out of the west houses. I'm not dropping here."`, 1500); }, 60); this.hud(); return r;
    }
    return _dmg(t, dmg, big);
  };
  const _brk = BT.checkBreak.bind(BT);
  BT.checkBreak = function (t) { if (has(t, 'skull') && !t.skullUsed && t.brk >= t.brkMax && !t.broken) { t.skullUsed = 1; t.brk = Math.round(t.brkMax * .3); this.text(t, 'THICK SKULL — shrugged it off', '#ffd34a', -40, true); sfx('parry'); return; } return _brk(t); };
  const _rf = BT.reflex.bind(BT);
  BT.reflex = function (a) { let k = _rf(a); if (a && a.isMe && Passives.on('footwork')) k *= 1.15; return k; };
  const _def = BT.defend.bind(BT);
  BT.defend = function (e, t, h) {
    return _def(e, t, h).then(res => {
      if (t.isMe && (res === 'pdodge' || res === 'pparry')) {
        if (Passives.on('unbound')) { t.mp = Math.min(t.maxMp, t.mp + 2); this.text(t, '+2 MP', '#46ff95', -76); }
        t.still = (t.still || 0) + 1; if (Passives.on('stillwater') && t.still % 3 === 0) { const hh = Math.round(t.maxHp * .08); t.hp = Math.min(t.maxHp, t.hp + hh); this.text(t, `≈ STILL WATER +${hh}`, '#9fe4ff', -86); }
      } else if (t.isMe) t.still = 0;
      this.hud(); return res;
    });
  };
  const _et = BT.enemyTurn.bind(BT);
  BT.enemyTurn = async function (e) {
    if (has(e, 'rooted') && e.hp < e.maxHp) { const hh = Math.round(e.maxHp * .05); e.hp = Math.min(e.maxHp, e.hp + hh); this.text(e, `+${hh} ROOTED`, '#9be37a', -20); }
    if (has(e, 'coward') && e.hp < e.maxHp * .2 && !e.E.boss) {
      await this.msg(`${e.name} panics and RUNS!`, 900); sfx('dodge'); e.ko = true; e.fled = 1; e.alpha = 0; this.text(e, 'FLED', '#bbb', -20); this.hud(); return;
    }
    if (has(e, 'ironDiscipline') && (e.turns || 0) % 3 === 2 && e.shield < 3) { e.shield++; this.text(e, 'OBEDIENCE — +1 SHIELD', '#cfd8e8', -40); }
    return _et(e);
  };
  // Ren's eye: the world slows down
  const _es = BT.enemyStrike.bind(BT);
  BT.enemyStrike = async function (e, t, sk, isCounter) {
    const B = this.B;
    if (!isCounter && t && t.isMe && !t.sight && Passives.on('timesight') && !B.tutorial && Math.random() < .2 + (Power.now().i >= 4 ? .08 : 0)) {
      B.dilate = true; B.dim = .5; B.dimCol = '0,40,20'; sfx('slowmo'); this.facePop(t, ['sight', 'focused']);
      B.fx.push({ burst: 1, x: t.x, y: t.y - 40, t: 0, life: 700 }); this.text(t, '◉ EMERALD TIME', '#9dffc8', -72, true);
      await this.msg('Your eyes flare — the world slows to a crawl…', 900);
      try { return await _es(e, t, sk, isCounter); } finally { B.dilate = false; B.dim = 0; }
    }
    return _es(e, t, sk, isCounter);
  };
  // transformed faces: Scar Bloom Kairo and Ascended Ren pop in with their transformation art
  const _fo = BT.faceOf.bind(BT);
  BT.faceOf = function (a) { if (a && GE_RIVAL[a.key]) return GE_RIVAL[a.key]; return _fo(a); };
  const _fp = BT.facePop.bind(BT);
  BT.facePop = function (a, exprs) {
    if (a && a.key === 'kairo_duel' && a.morph > 0) exprs = ['bloom'].concat(exprs);
    if (a && a.isMe && a.sight) exprs = ['asc_focus', 'sight'].concat(exprs);
    return _fp(a, exprs);
  };
  // further camera: everyone a little smaller on screen
  // (render & dash read BT_SCALE; see battle.js)
  // multi-shot cut-ins when Kairo turns monster, and when your eyes open all the way
  const _morph = BT.morph.bind(BT);
  BT.morph = async function (e) {
    if (e.key === 'kairo_duel' && !this.B.cutKairo) { this.B.cutKairo = 1; await Cuts.scarBloom(e); }
    return _morph(e);
  };
  const _ua = BT.useArt.bind(BT);
  BT.useArt = async function (a, k) {
    if (k === 'sight' && a.isMe && !a.sight && !this.B.cutSight) { this.B.cutSight = 1; await Cuts.ascension(this.alive('e')[0]); this.B.skipSightCine = 1; }
    try { return await _ua(a, k); } finally { if (this.B) this.B.skipSightCine = 0; }
  };
  // passive names under every enemy, above their trait
  const _rd = BT.render.bind(BT);
  BT.render = function (c, t) {
    _rd(c, t); const B = this.B; if (!B) return;
    for (const a of B.actors) if (a.side === 'e' && !a.ko && a.passTxt) {
      c.font = '800 10px "Nunito"'; c.textAlign = 'center'; const tw = c.measureText(a.passTxt).width, lx = Math.max(tw / 2 + 5, Math.min(G.view.w - tw / 2 - 5, a.x)), y = a.y + (a.E.trait ? 22 : 8);
      c.fillStyle = 'rgba(30,18,0,.8)'; c.fillRect(lx - tw / 2 - 3, y, tw + 6, 12); c.fillStyle = '#ffd88a'; c.fillText(a.passTxt, lx, y + 9);
    }
  };
})();

// transformed faces: Ren's ascended eyes, Kairo's Scar Bloom
(function () { const _fp = Battle.facePop.bind(Battle); Battle.facePop = function (a, ex) { if (a && a.isMe && a.sight) ex = ['asc_focus', 'sight'].concat(ex); if (a && a.key === 'kairo_duel' && a.morph > 0) ex = ['bloom'].concat(ex); return _fp(a, ex); }; })();
/* ---------- cut-ins: several shots, with words ---------- */
const bloodBg = (c, t) => { c.fillStyle = '#0a0000'; c.fillRect(-300, -300, 1240, 960); const r = rng(9), k = Math.min(1, t / 1600); c.save(); c.globalCompositeOperation = 'lighter';
  for (let i = 0; i < 36; i++) { const a = r() * Math.PI * 2, len = (120 + r() * 380) * k, x0 = 320 + Math.cos(a) * 40, y0 = 170 + Math.sin(a) * 20; c.strokeStyle = `rgba(255,${60 + (i % 3) * 30},40,${.16 + .2 * Math.sin(t / 240 + i)})`; c.lineWidth = 1.5; c.beginPath(); c.moveTo(x0, y0); c.lineTo(x0 + Math.cos(a) * len, y0 + Math.sin(a) * len); c.stroke(); }
  c.restore(); };
const speedBg = col => (c, t) => { c.fillStyle = '#05080a'; c.fillRect(-300, -300, 1240, 960); c.save(); c.globalCompositeOperation = 'lighter'; const r = rng(3);
  for (let i = 0; i < 50; i++) { const y = r() * 360, x = ((r() * 900 + t * (1.2 + r() * 2)) % 1100) - 300; c.strokeStyle = `rgba(${col},${.12 + r() * .25})`; c.lineWidth = 1 + r() * 2; c.beginPath(); c.moveTo(x, y); c.lineTo(x + 120 + r() * 160, y); c.stroke(); } c.restore(); };
const Cuts = {
  async scarBloom(e) {
    const nm = G.S.name;
    await Cine.play([
      { bg: bloodBg, fx: ['embers'], dur: 2200, fadeIn: 100, tapEnds: true, cam: [[0, 320, 190, 1], [2200, 320, 150, 1.5]], vignette: 'rgba(40,0,0,.75)',
        actors: [{ port: 'kairoB', expr: artHas('kairoB', 'bloom') ? 'bloom' : 'glare', x: 320, y: 470, scale: 4.4, facing: -1 }], lines: [['Kairo', '…You want to see what the fire left me?', '#ff9a6a']] },
      { bg: bloodBg, fx: ['embers'], dur: 1900, tapEnds: true, cam: [[0, 320, 200, 1.05], [1900, 320, 170, 1.35]], vignette: 'rgba(60,0,0,.6)', ev: [[200, s => { s.flash = .9; s.flashCol = '120,255,140'; s.shake = 12; sfx('break'); }]],
        actors: [{ port: 'kairoB', expr: 'bloom', x: 320, y: 470, scale: 4.4, facing: -1 }], lines: [['Kairo', 'RAAAGH—!', '#7dff9a']] },
      { bg: speedBg('120,255,170'), dur: 1600, tapEnds: true, cam: [[0, 320, 180, 1.1], [1600, 320, 180, 1.2]], vignette: 'rgba(0,20,10,.6)',
        actors: [{ port: 'me', expr: artHas('me', 'shock') ? 'shock' : 'anger', x: 320, y: 430, scale: 3.6, facing: 1 }], lines: [[nm, 'Kairo — stop! Your arms are—', '#7dffb0']] },
      { bg: bloodBg, fx: ['embers', 'smoke'], dur: 2600, tapEnds: true, cam: [[0, 320, 200, .9], [2600, 320, 175, 1.15]], vignette: 'rgba(60,0,0,.6)', bigText: ['SCAR BLOOM', 900],
        ev: [[700, s => { s.flash = 1; s.flashCol = '255,90,40'; s.shake = 14; sfx('break'); }]],
        actors: [{ spr: e.spr || 'kairo_b', bt: 'spellcast', loop: false, fms: 120, sil: '#3a0606', x: 340, y: 300, scale: 3.2 }, { spr: e.spr || 'kairo_b', bt: 'spellcast', loop: false, fms: 120, x: 320, y: 300, scale: 2.7, glowEyes: [-4, -48], glowR: 7 }],
        lines: [['Kairo', 'Hit me with everything you have, brother. My scales will remember all of it.', '#ff9a6a']] },
      { bg: speedBg('120,255,170'), dur: 1500, tapEnds: true, cam: [[0, 320, 180, 1.2], [1500, 320, 170, 1.35]], vignette: 'rgba(0,20,10,.7)',
        actors: [{ port: 'me', expr: artHas('me', 'focused') ? 'focused' : 'neutral', x: 320, y: 440, scale: 4, facing: 1 }], lines: [[nm, '(…Then I never hit you the same way twice.)', '#7dffb0']] }
    ]);
  },
  async ascension(foe) {
    const nm = G.S.name, fk = foe ? Battle.faceOf(foe) : null, kai = foe && foe.key === 'kairo_duel';
    const shots = [
      { bg: 'eyes', fx: ['mana'], dur: 2000, fadeIn: 100, tapEnds: true, cam: [[0, 320, 200, 1], [2000, 320, 150, 1.6]], vignette: 'rgba(0,30,10,.75)',
        actors: [{ port: 'me', expr: artHas('me', 'asc') ? 'asc' : 'sight', x: 320, y: 470, scale: 4.4, facing: 1 }], lines: [[nm, '(Five breaths. In. Hold. …Then the whole world goes quiet.)', '#7dffb0']], ev: [[1200, s => { s.flash = .8; s.flashCol = '90,255,150'; sfx('art'); }]] },
      { bg: 'eyes', fx: ['mana'], dur: 1700, tapEnds: true, cam: [[0, 320, 190, 1.1], [1700, 320, 160, 1.5]], vignette: 'rgba(0,40,30,.6)', ev: [[150, s => { s.flash = 1; s.flashCol = '200,240,255'; s.shake = 10; sfx('light'); }]],
        actors: [{ port: 'me', expr: 'sight', x: 320, y: 470, scale: 4.4, facing: 1 }], lines: [[nm, '…Now.', '#7dffb0']] }
    ];
    if (fk) shots.push({ bg: speedBg('255,220,160'), dur: 1500, tapEnds: true, cam: [[0, 320, 180, 1.1], [1500, 320, 180, 1.25]], vignette: 'rgba(20,10,0,.6)',
      actors: [{ port: fk === 'kairo' ? 'kairoB' : fk, expr: artHas(fk === 'kairo' ? 'kairoB' : fk, 'shock') ? 'shock' : 'anger', x: 320, y: 430, scale: 3.6, facing: -1 }],
      lines: [[foe.name, kai ? '…There it is. The bridge eyes. You were holding back on me, you idiot.' : 'What — what are your EYES doing?!', '#ffd88a']] });
    shots.push({ bg: 'eyes', fx: ['mana'], dur: 2200, tapEnds: true, cam: [[0, 320, 200, .9], [2200, 320, 180, 1.1]], vignette: 'rgba(0,40,20,.5)', bigText: ['EMERALD ASCENSION', 700],
      ev: [[500, s => { s.flash = 1; s.flashCol = '220,255,235'; s.shake = 10; sfx('art'); }]],
      actors: [{ port: 'me', expr: artHas('me', 'sight') ? 'sight' : 'anger', x: 320, y: 470, scale: 4.2, facing: 1, fade: [[0, 0], [400, 1]] }],
      lines: [[nm, 'I can see all of it now.', '#7dffb0']] });
    await Cine.play(shots);
  }
};
