/* KAIGEN - "the opening of the eyes" - THE ZONE (owner concept, built by Chat C 2026-11-17 - Chat A owns balance; tune the numbers in ZONE below)
   Not a skill. Never a button. It just HAPPENS - to a fighter who is fighting at their best, absorbed in the fight.
   · Every battle secretly rolls 3 CONDITIONS from a pool (never the same twice in a row). A fighter who meets enough of them
     while still landing PERFECT strikes may slip into the Zone (a chance, not a certainty).
   · IN THE ZONE: every hit lands as a PERFECT critical (+25% on top), +2 speed, and the lightning burns from their eyes.
     It lasts 3 of their turns, or until a heavy blow (20%+ of their health) breaks their focus.
   · MASTERY grows each time they enter: after 3 entries they start to FEEL the conditions (a faint hint as each one is met);
     after 8 they need one condition fewer; after 15 they can step in at will, once a battle - like the strongest fighters alive.
   · The strongest enemies (bosses, rivals, masters) can enter it too.
   Names: ZONE.name is shown in game - rename it in one place. Off: G.settings.zoneOff = true. */
const ZONE = {
  name: 'KAIGEN',
  turns: 3, crit: 1.25, spd: 2, breakAt: .2,
  hintAt: 3, easierAt: 8, willAt: 15,
  POOL: {
    streak: ['Three perfect strikes in a row', 'EVERY STRIKE LANDS TRUE'],
    read: ['Two perfect dodges or parries', 'YOU SEE IT BEFORE IT COMES'],
    untouched: ['Three of your turns without being hit', 'NOTHING CAN TOUCH YOU'],
    edge: ['A perfect strike while below a third of your health', 'YOUR BACK IS TO THE WALL'],
    shatter: ["Break an enemy's guard", 'THEIR GUARD SHATTERS'],
    first: ['Defeat an enemy', 'ONE FALLS'],
    answer: ['A perfect strike right after a perfect parry or dodge', 'ANSWER THE BLOW'],
    sweep: ['Strike every enemy on the field', "YOU'VE MEASURED THEM ALL"],
    flowing: ['Three different moves in a row, none missed', 'YOUR BODY KNOWS EVERY ANSWER']
  }
};
(function () {
  if (typeof Battle === 'undefined') return;
  const off = () => G.settings && G.settings.zoneOff;
  const mastery = (a) => { const S = G.S; S.zone = S.zone || {}; const k = a.isMe ? 'me' : a.id; return S.zone[k] = S.zone[k] || { n: 0 }; };
  const able = (a) => a && a.side === 'p' && !a.ko && !(a.isMe && G.S.kid);
  const st = (a) => a.__z || (a.__z = { streak: 0, reads: 0, clean: 0, met: new Set(), lastRead: 0, srcs: [], hit: new Set() });
  let last = '';

  // each battle rolls its own conditions
  const _start = Battle.start.bind(Battle);
  Battle.start = function (cfg) {
    const p = _start(cfg);
    (async () => { for (let i = 0; i < 40; i++) { await new Promise(r => setTimeout(r, 50)); const B = Battle.B; if (B && B.actors.length) {
      if (!B.zc) { const keys = Object.keys(ZONE.POOL).sort(() => Math.random() - .5); let pick = keys.slice(0, 3); if (pick.join() === last) pick = keys.slice(3, 6); last = pick.join(); B.zc = pick; }
      return; } } })();
    return p;
  };

  function meet(a, c) {
    const B = Battle.B; if (!B || !B.zc || !B.zc.includes(c) || a.zone > 0) return;
    const s = st(a); if (s.met.has(c)) return; s.met.add(c);
    const M = mastery(a); if (M.n >= ZONE.hintAt) Battle.text(a, '… ' + ZONE.POOL[c][1], '#bfe8ff', -96);
  }
  function need(a) { const M = mastery(a); return M.n >= ZONE.easierAt ? 1 : 2; }
  async function enter(a, will) {
    const B = Battle.B; if (!B || a.zone > 0) return;
    a.zone = ZONE.turns; a.__zSpd = ZONE.spd; a.spd += ZONE.spd; st(a).met.clear();
    const M = mastery(a); M.n++; if (a.side === 'p') G.S.f.kaigenNew = 1;
    B.hitstop = Math.max(B.hitstop || 0, 260); B.flash = 1.1; B.flashCol = '190,235,255'; B.punch = .09; B.punchX = a.x; B.punchY = a.y - 40; B.shake = 6;
    try { sfx('level'); } catch (e) { }
    Battle.text(a, ZONE.name, '#e8f8ff', -110, true);
    if (will) Battle.text(a, 'STEPS IN AT WILL', '#9fd8ff', -70);
    else if (M.n === 1) setTimeout(() => { try { toast(`<b style="color:#bfe8ff">${esc(a.name)} entered ${ZONE.name}.</b> It can't be called — it comes when you fight at your best. Every hit lands as a critical.`, 5200); } catch (e) { } }, 900);
    else if (M.n === ZONE.hintAt) setTimeout(() => { try { toast(`<b style="color:#bfe8ff">${esc(a.name)} is starting to feel it coming.</b> From now on you'll sense each condition as it's met.`, 4800); } catch (e) { } }, 900);
    else if (M.n === ZONE.willAt) setTimeout(() => { try { toast(`<b style="color:#bfe8ff">${esc(a.name)} can step into ${ZONE.name} at will</b> — once a battle, from the menu.`, 4800); } catch (e) { } }, 900);
  }
  function leave(a, why) {
    if (!(a.zone > 0) && !a.__zSpd) return; a.zone = 0; if (a.__zSpd) { a.spd -= a.__zSpd; a.__zSpd = 0; }
    Battle.text(a, why || 'THE ZONE FADES', '#9fb8c8', -80);
  }
  function tryEnter(a) {
    if (off() || !able(a) || a.zone > 0) return;
    const s = st(a); if (s.met.size < need(a)) return;
    const M = mastery(a), chance = Math.min(.9, .55 + M.n * .03);
    if (Math.random() < chance) enter(a); else s.met.delete([...s.met][0]);   // it slipped away - one feeling fades
  }
  window.Zone = { enter, leave, mastery, conds: () => (Battle.B && Battle.B.zc || []).map(k => ZONE.POOL[k][0]) };

  /* LINKED KAIGEN - two fighters in it at once fall into each other's rhythm: every strike one lands, the other
     answers with a free follow-up (60% of their attack), and nothing the pair does can be read. */
  const linked = () => { const B = Battle.B; return B ? B.actors.filter(x => x.side === 'p' && !x.ko && x.zone > 0) : []; };
  let following = false;
  function linkFollow(a, t) {
    if (following || !t || t.ko || t.side !== 'e') return; const L = linked(); if (L.length < 2 || !L.includes(a)) return;
    const B = Battle.B; if (!B.__linkSaid) { B.__linkSaid = 1; Battle.text(a, 'LINKED ' + ZONE.name, '#d8f4ff', -130, true); B.flash = .8; B.flashCol = '200,240,255'; try { sfx('level'); } catch (e) { } }
    const p = L.find(x => x !== a); if (!p) return;
    following = true;
    setTimeout(() => { try { if (!t.ko && p.zone > 0) { const d = Math.max(1, Math.round(p.atk * .6)); Battle.text(p, 'LINK', '#d8f4ff', -60); Battle.spark(t.x, t.y - 30, '#d8f4ff', 14); Battle.damage(t, d, true); } } catch (e) { } following = false; }, 260);
  }
  /* THE SECOND DOOR - Kaigen has a deeper door, and Transcension waits behind it. Transcending from inside Kaigen
     goes through that door: the trance does not break, it deepens (+2 turns, and the Kaigen state carries into the form). */
  if (typeof Burst !== 'undefined' && Burst.fire) {
    const _bf = Burst.fire.bind(Burst);
    Burst.fire = async function (a) {
      let st = 1; try { st = this.stage(a); } catch (e) { }
      const deep = a && a.zone > 0 && st === 2;
      const r = await _bf(a);
      try { if (deep) { a.zone += 2; const B = Battle.B; Battle.text(a, 'THE SECOND DOOR', '#ffffff', -140, true); B.flash = 1.4; B.flashCol = '255,255,255'; B.shake = 12; G.S.f.secondDoor = (G.S.f.secondDoor || 0) + 1; } } catch (e) { }
      return r;
    };
  }
  /* SOMEONE EXPLAINS IT - the first time anyone in the party enters Kaigen, after the fight Ren remembers what Vane told him
     in the Realm. And the taverns talk about it. */
  async function explain() {
    try {
      await narr('Your hands are still humming. For a few seconds back there, everything went quiet - the noise, the fear, even your own breathing. You knew where every blade would be before it moved.');
      await say('vane', 'closed', '(Vane, years ago, in the snow:) "There is a place past focus, pup. The old schools call it KAIGEN - the opening of the eyes."');
      await say('vane', 'neutral', '"You cannot call it. You cannot train it. You fight well enough, honestly enough, and one day it simply opens - and every cut you make is the right one."');
      await say('vane', 'focused', '"The door is never in the same place twice. But the more times you walk through it, the more you learn what the doorway feels like."');
      await say('vane', 'smirk', '"The best I ever fought could step through it like a man walks into his own kitchen. And there is a second door behind the first. I never found it." He looked at his empty sleeve. "Maybe you will."');
      await narr('KAIGEN - it comes on its own when you fight at your best. Every strike lands as a critical. The more often you reach it, the better you learn to read it.');
    } catch (e) { }
  }
  const _st2 = Battle.start.bind(Battle);
  Battle.start = async function (cfg) {
    const r = await _st2(cfg);
    try { if (G.S.f.kaigenNew && !G.S.f.kaigenTold && !G.S.kid) { G.S.f.kaigenTold = 1; await new Promise(q => setTimeout(q, 400)); await explain(); } } catch (e) { }
    return r;
  };
  if (typeof GOSSIP !== 'undefined') GOSSIP.kaigen = { label: 'Kaigen - the opening of the eyes', talks: [
    [['A', "Ever seen someone go KAIGEN? I have. Arena, Highmark, fourteen years ago. A girl went quiet in the middle of a fight and her eyes started throwing lightning."], ['B', 'And?'], ['A', "Every cut landed. Every single one. Like the fight had already happened and she was just remembering it."]],
    [['C', "You can't buy it, can't learn it from a book. Old Guild sergeant told me it comes when you stop thinking about winning."], ['B', "That's the stupidest advice I ever heard."], ['C', "Yeah. He was the best fighter I ever met."]],
    [['B', "They say the Sword Saint could step into Kaigen whenever he liked. Just - click. Like a door."], ['A', "Masters can. Took 'em thirty years of almost dying to learn where the door is."], ['me', "(…A door. Vane used that word too.)"]],
    [['A', "Two fighters in Kaigen at the same time? Happened at the Siege of Cinderfall. Brothers. They stopped needing to talk - one cut, the other was already there."], ['C', "Linked. My granddad called it linked. Said it was the most frightening thing he ever saw on a battlefield."]]
  ] };

  // every strike: track the conditions, and in the Zone every hit is a perfect critical
  const _rh = Battle.resolveHit.bind(Battle);
  Battle.resolveHit = function (a, t, m, grade, opts) {
    opts = opts || {};
    const inZ = a && a.zone > 0 && !off();
    if (inZ) { grade = 'perfect'; m *= ZONE.crit; }
    const r = _rh(a, t, m, grade, opts);
    try {
      if (inZ && t) { linkFollow(a, t); const B = this.B; B.hitstop = Math.max(B.hitstop || 0, 70); B.flash = Math.max(B.flash || 0, .35); B.flashCol = '210,240,255'; this.spark(t.x, t.y - 34, '#e8f8ff', 22); }
      if (able(a) && !inZ) {
        const s = st(a);
        if (grade === 'perfect') { s.streak++; if (s.streak >= 3) meet(a, 'streak'); if (a.hp < a.maxHp / 3) meet(a, 'edge'); if (performance.now() - s.lastRead < 9000) meet(a, 'answer'); }
        else s.streak = 0;
        if (t && t.side === 'e') { s.hit.add(t); const B = this.B; if (B.actors.filter(e => e.side === 'e' && !e.ko).every(e => s.hit.has(e))) meet(a, 'sweep'); }
        const src = opts.src || 'attack'; if (grade !== 'miss') { s.srcs.push(src); if (s.srcs.length > 3) s.srcs.shift(); if (s.srcs.length === 3 && new Set(s.srcs).size === 3) meet(a, 'flowing'); } else s.srcs = [];
        if (t && t.ko) meet(a, 'first');
        if (grade === 'perfect') tryEnter(a);
      }
    } catch (e) { }
    return r;
  };
  // perfect reads, broken guards
  const _tx = Battle.text.bind(Battle);
  Battle.text = function (a, s, col, dy, big) {
    const r = _tx(a, s, col, dy, big);
    try {
      if (able(a) && (s === 'PERFECT DODGE' || s === 'PERFECT PARRY')) { const z = st(a); z.reads++; z.lastRead = performance.now(); if (z.reads >= 2) meet(a, 'read'); tryEnter(a); }
      if (s === 'BREAK!' && a && a.side === 'e') { const cur = this.B && this.B.cur; if (able(cur)) { meet(cur, 'shatter'); } }
    } catch (e) { }
    return r;
  };
  // a heavy blow breaks focus; any hit resets "untouched"
  const _dm = Battle.damage.bind(Battle);
  Battle.damage = function (t, dmg, big) {
    const r = _dm(t, dmg, big);
    try { if (t && t.side === 'p' && dmg > 0) { st(t).clean = 0; if (t.zone > 0 && dmg >= t.maxHp * ZONE.breakAt) leave(t, 'FOCUS BROKEN'); } } catch (e) { }
    return r;
  };
  // turns: count clean turns, tick the Zone down
  const _pt = Battle.playerTurn.bind(Battle);
  Battle.playerTurn = async function (a) {
    try {
      if (a.zone > 0) { a.zone--; if (!a.zone) leave(a); }
      else if (able(a)) { const s = st(a); s.clean++; if (s.clean >= 3) meet(a, 'untouched'); }
    } catch (e) { }
    return _pt(a);
  };
  // the strongest enemies can enter it too: bosses, rivals and masters, once, when pressed
  const _et = Battle.enemyTurn.bind(Battle);
  Battle.enemyTurn = async function (e) {
    try {
      if (!off() && e && !e.ko) {
        if (e.zone > 0) { e.zone--; if (!e.zone) { e.atk -= e.__zAtk || 0; e.__zAtk = 0; Battle.text(e, 'THE ZONE FADES', '#9fb8c8', -80); } }
        else if (!e.__zUsed && e.hp < e.maxHp * .55 && ((e.E && (e.E.boss || e.E.raid)) || (typeof EBURST !== 'undefined' && EBURST[e.key])) && Math.random() < .35) {
          e.__zUsed = 1; e.zone = 2; e.__zAtk = Math.round(e.atk * .25); e.atk += e.__zAtk; const B = this.B;
          B.hitstop = Math.max(B.hitstop || 0, 220); B.flash = .9; B.flashCol = '255,220,220'; B.punch = .08; B.punchX = e.x; B.punchY = e.y - 40;
          Battle.text(e, ZONE.name, '#ffe0e0', -110, true); try { sfx('level'); } catch (x) { }
        }
      }
    } catch (x) { }
    return _et(e);
  };
  // the masters' privilege: step in at will (mastery 15+), once a battle
  if (typeof CombatX !== 'undefined' && CombatX.menu) {
    const _m = CombatX.menu.bind(CombatX);
    CombatX.menu = function (a, L, done, resolve, reopen) {
      _m(a, L, done, resolve, reopen);
      try { if (!off() && able(a) && !(a.zone > 0) && !a.__zWill && mastery(a).n >= ZONE.willAt) {
        const it = ['◉ ' + ZONE.name, 'Step into the Zone at will — only the strongest can. Free action.', async () => { a.__zWill = 1; await enter(a, true); reopen && reopen(); }]; L.unshift(it); } } catch (e) { }
    };
  }
})();
