'use strict';
/* BREAKTHROUGH = A BATTLE INSIDE YOUR OWN HEAD
   When a breakthrough's feat is done and the aura is full, Ren sits, closes his eyes — and fights himself.
   The Shadow has your moves, your face, your sword. And the mind is never fair: every time, two TRIALS are drawn at random
   (something taken from you, or something given to it). Beat your Shadow and the wall breaks. Lose and you wake up gasping;
   the wall holds, and you can try again after your next victory (or rest at an inn and meditate). */
const MIND = {
  TRIALS: [
    { id: 'noArts', name: 'Bound Hands', desc: 'No Drag Arts. Only the sword.', cfg: { noArts: 1 } },
    { id: 'noItems', name: 'Empty Pockets', desc: 'No items.' },
    { id: 'halfHp', name: 'Half a Heart', desc: 'You start at half HP.' },
    { id: 'dry', name: 'Dry Well', desc: 'You start with no MP.' },
    { id: 'feed', name: 'It Feeds', desc: 'Your Shadow heals itself every turn.', E: { regen: .07 } },
    { id: 'blind', name: 'Blindfold', desc: 'Your timing windows shrink.' },
    { id: 'mirror', name: 'Mirror', desc: 'Your Shadow parries and dodges like you do.', E: { parry: .4, dodge: .3 } },
    { id: 'heavy', name: 'Heavy Steel', desc: 'Your Shadow hits 25% harder.', mul: { atk: 1.25 } },
    { id: 'swift', name: 'Quicksilver', desc: 'Your Shadow acts faster than you.', mul: { spd: 1.3 } },
    { id: 'red', name: 'Red Strike', desc: 'Some of its blows can\'t be parried — dodge them.', unp: 1 }
  ],
  draw() { const T = this.TRIALS.slice().sort(() => Math.random() - .5); const a = T[0]; let b = T.find(t => t.id !== a.id && !(a.id === 'halfHp' && t.id === 'heavy')); return [a, b]; },
  shadow(trials) {
    const S = G.S.stats, mul = { atk: 1, spd: 1 }, E = {};
    for (const t of trials) { Object.assign(E, t.E || {}); for (const k in t.mul || {}) mul[k] *= t.mul[k]; }
    const unp = trials.some(t => t.unp);
    ENEMY.mind_ren = Object.assign({ name: 'Your Shadow', img: 'bandit', trait: 'Everything you are. Everything you\'re afraid you are.', boss: 1, fixed: 1,
      hp: Math.round(S.maxHp * 1.5), atk: Math.round(S.atk * 1.0 * mul.atk), def: Math.max(1, Math.round(S.def * .8)), spd: Math.round((S.spd || 12) * mul.spd),
      dodge: .15, parry: .2, brk: Math.round(S.maxHp * .8), xp: 0, gold: 0,
      skills: [{ name: 'Your Draw', hits: [{ anim: 'slash', m: .9, w: 520 }] },
        { name: 'Your Combo', w: .4, hits: [{ anim: 'slash', m: .5, w: 480 }, { anim: 'halfslash', m: .55, w: 320 }, { anim: 'thrust', m: .7, w: 440 }] },
        { name: 'Your Fear', w: .25, hits: [{ anim: 'thrust', m: 1.3, w: 700, unp: unp ? 1 : 0 }] }] }, E);
    TIER.mind_ren = 'C';
  },
  dark() {
    if (typeof HD === 'undefined' || !HD.on()) return null;
    const set = HD.battleSet(), M = HD.meta[set]; if (!HD.img[set]) return null;
    const src = HD.sheet(set, M.faces === 'left');            // enemies face right
    const c = document.createElement('canvas'); c.width = src.width; c.height = src.height; const x = c.getContext('2d');
    x.filter = 'brightness(.48) saturate(.55) contrast(1.25)'; x.drawImage(src, 0, 0); x.filter = 'none';
    x.globalCompositeOperation = 'source-atop'; x.fillStyle = 'rgba(40,255,140,.08)'; x.fillRect(0, 0, c.width, c.height);
    c.__hd = Object.assign({}, src.__hd); delete c.__hd.me; return c;
  },
  active: null,
  async fight(g) {
    const B = BREAK[g], tr = this.draw(); this.active = tr; this.shadow(tr);
    await narr('You sit down where you are and close your eyes. The world goes quiet — then dark — then green.');
    await narr('Someone is standing in front of you. Your hood. Your sword. Your face — with nothing behind the eyes.');
    await narr(`THE MIND IS NEVER FAIR. Trial: ${tr.map(t => `${t.name.toUpperCase()} — ${t.desc}`).join('  ·  ')}`);
    const cfg = Object.assign({ enemies: ['mind_ren'], allies: [], noFlee: true, boss: true, bd: 'snow', music: 'boss', mind: 1, intro: `${B.name} — defeat your Shadow` }, ...tr.map(t => t.cfg || {}));
    const r = await Battle.start(cfg); Story.heal(true); this.active = null;
    return r === 'win';
  }
};
(function () {
  if (typeof Break === 'undefined' || typeof Battle === 'undefined') return;
  // the trial conditions take hold when the fight begins
  const _run = Battle.run.bind(Battle);
  Battle.run = async function () {
    const B = this.B;
    try { if (B && B.cfg.mind && MIND.active) {
      const me = B.actors.find(a => a.isMe), sh = B.actors.find(a => a.key === 'mind_ren'), ids = MIND.active.map(t => t.id);
      if (sh) { const im = MIND.dark(); if (im) { sh.img = im; sh.hdDone = 1; sh.btsDone = 1; } }
      if (me) { if (ids.includes('halfHp')) me.hp = Math.ceil(me.maxHp / 2); if (ids.includes('dry')) me.mp = 0; if (ids.includes('blind')) me.blind = 999; }
      this.hud();
    } } catch (e) { console.warn(e); }
    return _run();
  };
  if (typeof CombatX !== 'undefined') { const _m = CombatX.menu.bind(CombatX);
    CombatX.menu = function (a, L, done, resolve, reopen) { _m(a, L, done, resolve, reopen);
      if (Battle.B && Battle.B.cfg.mind && MIND.active && MIND.active.some(t => t.id === 'noItems')) { const it = L.find(x => /^Items/.test(x[0])); if (it) { it[1] = 'Empty Pockets — there are no items in your head.'; it[3] = true; } } }; }
  // the breakthrough scene: the fight comes first
  Break.scene = async function (g) {
    const B = BREAK[g];
    let won = false;
    try { won = await MIND.fight(g); } catch (e) { console.warn(e); won = true; }
    if (!won) {
      await narr('You wake up on your back, gasping. Your own face was the last thing you saw. The wall holds.');
      await narr('(You can try again: win another battle, or rest at an inn — your Shadow will be waiting, with a different trial.)');
      this.pending = false; MIND.coolUntil = Date.now() + 90000; return;
    }
    try { sfx('art'); await fadeOut(400);
      await narr(`— BREAKTHROUGH · ${B.name.toUpperCase()} —`);
      await narr('Your Shadow lowers its sword, nods once — and steps into you. It was always you.');
      for (const l of B.lines) await narr(l);
      await fadeIn(500); } catch (e) { }
    this.pending = false;
    const bank = G.S.xpBank || 0; G.S.xpBank = 0;
    Story.gainXp(Math.max(1, bank));
    G.S.f.breaks = (G.S.f.breaks || 0) + 1;
  };
  const _try = Break.try.bind(Break);
  Break.try = function () { if ((MIND.coolUntil || 0) > Date.now() || MIND.active) return; return _try(); };
  // resting at an inn re-checks the wall
  const _h = Story.heal.bind(Story);
  Story.heal = function (full) { const r = _h(full); try { if (full && G.mode === 'world' && !Battle.B && !MIND.active) setTimeout(() => { MIND.coolUntil = 0; Break.try(); }, 1500); } catch (e) { } return r; };
})();
/* MEDITATE — a button wherever the breakthrough is shown (Menu → Skills, Menu → Stones, Menu → Quests) */
const Meditate = {
  state() { const g = Break.next(); if (!g || !BREAK[g]) return null;
    return { g, B: BREAK[g], done: Break.has(g), full: Break.atCap() }; },
  html() {
    const s = this.state(); if (!s || G.S.kid) return '';
    const ready = s.done && s.full;
    const why = !s.done ? `First: ${s.B.hint}` : !s.full ? 'Feat done ✔ — now fill your aura (keep fighting until it burns red and full).' : 'Ready. Sit, close your eyes, and face your Shadow.';
    return `<div class="stat" style="margin:6px 0;border:1px solid ${ready ? '#46ff95' : '#5a4a2a'}"><h3 style="color:#7dffb0">🧘 Meditate — Breakthrough to ${s.g}</h3><p class="muted">${why}</p>
      <div class="btnrow"><button class="btn" data-meditate="1" ${ready ? '' : 'disabled'}>${ready ? 'Meditate now' : 'Not ready yet'}</button></div></div>`;
  },
  go() {
    const s = this.state(); if (!s || !s.done || !s.full) return;
    if (!$('#menu').classList.contains('hide')) UI.closeMenu();   // the open menu itself holds the game still — close it first
    if (G.mode !== 'world' || World.busy || (typeof Battle !== 'undefined' && Battle.B)) { toast('Find somewhere quiet first (you can\'t meditate in a fight or a scene).', 2400); return; }
    MIND.coolUntil = 0; Break.pending = true; setTimeout(() => Story.run(() => Break.scene(s.g)), 250);
  }
};
(function () {
  const add = (fn, at) => { if (typeof window[fn] !== 'function') return; const _o = window[fn]; window[fn] = function () { const h = _o.apply(this, arguments); return at === 'top' ? Meditate.html() + h : h + Meditate.html(); }; };
  add('skillsMenuHTML', 'top'); add('questsMenuHTML'); add('stonesMenuHTML', 'top');
  document.addEventListener('pointerdown', e => { const b = e.target.closest && e.target.closest('[data-meditate]'); if (!b || b.disabled) return; e.preventDefault(); try { sfx('art'); } catch (x) { } Meditate.go(); }, true);
  // the wall toast now says where the button is
  const _c = Break.capped.bind(Break);
  Break.capped = function () { _c(); setTimeout(() => { if (Break.has(Break.next())) toast('<b style="color:#7dffb0">🧘 Ready to break through.</b> Menu → Skills → <b>Meditate now</b>.', 5000); }, 11000); };
})();
/* the D-grade feat is the story's five winters with Vane: anyone past that has done it */
(function () {
  if (typeof BREAK !== 'undefined' && BREAK.D) BREAK.D.hint = 'Your five winters of training with Vane (the old man) in the Realm of No Return — this happens in the story, after the village burns.';
  const _h = Break.has.bind(Break);
  Break.has = function (g) { if (g === 'D' && G.S && G.S.f && (G.S.f.vaneDone || G.S.f.cultivation) && !G.S.kid) { const s = this.st(); if (!s.D) s.D = 1; return true; } return _h(g); };
})();
