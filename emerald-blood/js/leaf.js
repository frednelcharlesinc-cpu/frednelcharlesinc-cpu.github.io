/* =====================================================================
   LEAF CUT — Vane's lesson on cutting what flies.
   "Cut the leaf. Don't touch it." Ren never quite mastered it in the mountains.
   Before he remembers it, arrows, bolts, knives and spells can only be DODGED.
   After the flashback, PARRY cuts them in flight — a tighter window than a blade,
   which slowly widens as he cuts more. A perfect cut sends half of it back.
   ===================================================================== */
const LeafCut = {
  has() { return !!(G.S && G.S.f && G.S.f.leafCut); },
  can(t) { return !!(t && t.isMe && (this.has() || (Battle.B && Battle.B.leafTrain))); },
  // 0–100: how much of the lesson his hands have finally learned (each cut counts a little)
  mastery() { return Math.min(100, Math.round(((G.S && G.S.f.leafCuts) || 0) * 2)); },
  window(t) { const B = Battle.B; if (B && B.leafTrain) return 1.25; return 1 + this.mastery() / 400; },
  split(Bt, pk, P, t, e, perfect) {
    const B = Bt.B, now = performance.now(), x = P.x1, y = P.y1, dir = t.x > e.x ? 1 : -1;
    sfx(perfect ? 'pparry' : 'leafcut');
    for (const top of [true, false]) B.fx.push({ half: 1, kind: pk, x, y, vx: -dir * (perfect ? .5 : 1.1), vy: top ? -1.3 : .9, r0: Math.atan2(P.y1 - P.y0, P.x1 - P.x0), vr: top ? -.07 : .07, top, t: 0, life: 560 });
    t.anim = 'halfslash'; Bt.play(t, 'halfslash', 6, 40);
    if (!B.leafTrain) G.S.f.leafCuts = (G.S.f.leafCuts || 0) + 1;
    if (!perfect) { Bt.text(t, 'LEAF CUT', '#c9ffd8'); t.mp = Math.min(t.maxMp, t.mp + 1); if (!B.leafTrain) { e.brk += 6; Bt.checkBreak(e); } return; }
    Bt.text(t, 'PERFECT LEAF CUT', '#e8fff0', -10, true); B.flash = .3; B.flashCol = '220,255,235'; t.mp = Math.min(t.maxMp, t.mp + 2);
    if (B.leafTrain) return;
    e.brk += 14; Bt.checkBreak(e);
    if (!e.ko) {
      B.fx.push({ proj: pk, x0: x, y0: y, x1: e.x, y1: e.y - 34 * BT_SCALE * (e.size || 1), ts: now + 60, te: now + 300, t: 0, life: 420, arc: 0, sc: .8 });
      setTimeout(() => { if (Battle.B !== B || e.ko) return; const d = Math.max(1, Math.round(t.atk * .55 - e.def * .3)); Bt.damage(e, d, false); Bt.text(e, 'HALF OF IT CAME BACK', '#c9ffd8', -44); Bt.hud(); }, 300);
    }
  }
};

/* ---------- enemies that throw, shoot and cast ---------- */
(function () {
  const add = (k, sk) => { const E = ENEMY[k]; if (E && !E.skills.some(s => s.name === sk.name)) E.skills.push(sk); };
  const setProj = (k, name, proj) => { const E = ENEMY[k]; if (!E) return; const s = E.skills.find(s => s.name === name); if (s) s.hits.forEach(h => h.proj = proj); };
  add('bandit', { name: 'Thrown Knife', w: .35, hits: [{ anim: 'thrust', m: 1, w: 640, proj: 'knife' }] });
  add('rook', { name: 'Knife Fan', w: .35, hits: [{ anim: 'thrust', m: .6, w: 620, proj: 'knife' }, { anim: 'thrust', m: .6, w: 300, proj: 'knife' }, { anim: 'thrust', m: .6, w: 300, proj: 'knife' }] });
  add('acolyte', { name: 'Ember Bolt', w: .3, hits: [{ anim: 'spellcast', m: 1.1, w: 720 }] });
  add('voss', { name: 'Javelin', w: .3, hits: [{ anim: 'thrust', m: 1.3, w: 760, proj: 'spear' }] });
  add('reg_captain', { name: 'Registry Crossbow', w: .35, hits: [{ anim: 'thrust', m: 1.2, w: 600, proj: 'bolt' }] });
  add('stone_hunter', { name: 'Crossbow Bolt', w: .35, hits: [{ anim: 'thrust', m: 1.1, w: 560, proj: 'bolt' }] });
  add('rime_alpha', { name: 'Ice Shard', w: .3, hits: [{ anim: 'spellcast', m: .8, w: 640 }, { anim: 'spellcast', m: .8, w: 340 }] });
  add('lupine_alpha', { name: 'Hurled Stone', w: .2, hits: [{ anim: 'thrust', m: .9, w: 640, proj: 'stone' }] });
  if (ENEMY.m_ratfolk) add('m_ratfolk', { name: 'Sling Stone', w: .35, hits: [{ anim: 'thrust', m: .9, w: 600, proj: 'stone' }] });
  if (ENEMY.m_gourd) add('m_gourd', { name: 'Seed Spit', w: .4, hits: [{ anim: 'spellcast', m: .5, w: 520, proj: 'seed' }, { anim: 'spellcast', m: .5, w: 260, proj: 'seed' }, { anim: 'spellcast', m: .5, w: 260, proj: 'seed' }] });
  if (ENEMY.tollman) add('tollman', { name: 'Thrown Toll-Iron', w: .3, hits: [{ anim: 'thrust', m: 1, w: 620, proj: 'axe' }] });
  if (ENEMY.guard_r) add('guard_r', { name: 'Crossbow', w: .3, hits: [{ anim: 'thrust', m: 1.1, w: 600, proj: 'bolt' }] });
  // every Halvard/acolyte "lance" and every breath is now something you can see coming
  Object.assign(SKILL_EL, { 'Ember Bolt': 'fire', 'Ice Shard': 'ice', 'Flame Lance': 'fire' });

  /* ---------- Green Eclipse: each of them fights with their own weapon ---------- */
  const R = (k, skills) => { if (ENEMY[k]) ENEMY[k].skills = skills; };
  R('ge_dace_r', [ // war axe
    { name: 'Axe Rush', hits: [{ anim: 'slash', m: .75, w: 480 }, { anim: 'halfslash', m: .75, w: 300 }, { anim: 'slash', m: .9, w: 420 }] },
    { name: 'Thrown Hatchet', w: .35, hits: [{ anim: 'thrust', m: 1.2, w: 700, proj: 'axe' }] },
    { name: 'Headbutt', w: .25, hits: [{ anim: 'run', m: 1.5, w: 700, unp: 1 }] }]);
  R('ge_wren_r', [ // bow
    { name: 'Volley', hits: [{ anim: 'backslash', m: .6, w: 760, proj: 'arrow' }, { anim: 'backslash', m: .6, w: 420, proj: 'arrow' }, { anim: 'backslash', m: .7, w: 420, proj: 'arrow' }] },
    { name: 'Pinning Shot', w: .35, hits: [{ anim: 'backslash', m: 1.5, w: 980, proj: 'arrow' }] },
    { name: 'Point-Blank', w: .25, hits: [{ anim: 'backslash', m: 1.1, w: 420, proj: 'arrow' }] }]);
  R('ge_tamsin_r', [ // longsword + a thrown ember
    { name: 'Ember Edge', hits: [{ anim: 'slash', m: .65, w: 460 }, { anim: 'slash', m: .65, w: 260 }, { anim: 'thrust', m: .9, w: 380 }] },
    { name: 'Flame Lance', w: .3, hits: [{ anim: 'spellcast', m: 1.3, w: 700, proj: 'fire' }] },
    { name: 'For Kairo', w: .25, hits: [{ anim: 'jump', m: 1.7, w: 780, unp: 1 }] }]);
  R('ge_corran_r', [ // halberd
    { name: 'Halberd Sweep', hits: [{ anim: 'slash', m: 1.3, w: 760 }] },
    { name: 'Anvil Rhythm', w: .4, hits: [{ anim: 'thrust', m: .7, w: 600 }, { anim: 'thrust', m: .7, w: 600 }, { anim: 'thrust', m: .9, w: 600 }] },
    { name: 'Thrown Hammer', w: .2, hits: [{ anim: 'thrust', m: 1.1, w: 720, proj: 'stone' }] }]);
  // the vale knows them by their weapons now
  GE_WEAPON = { tamsin: 'a longsword', dace: 'a war axe', wren: 'a hunting bow', corran: 'a halberd', bo: 'a mace', lark: 'a pair of knives', sefa: 'a gnarled staff' };
  // allies stand on YOUR side, facing the enemy
  if (ALLY.dace) ALLY.dace.sprite = 'ge_dace_w';
  if (ALLY.tamsin) ALLY.tamsin.sprite = 'tamsin_w';
  const _n = npcImg;
  npcImg = async function (name) { const m = /^(.*)_w$/.exec(name || ''); if (m && GE_SPR.includes(m[1]) && G.S && Notoriety.level() >= 2) name = m[1] + '_cw'; return _n(name); };
})();
var GE_WEAPON;

/* ---------- the flashback ---------- */
ENEMY.vane_leaf = { name: 'Vane', fixed: 1, hp: 9999, atk: 2, def: 40, spd: 22, dodge: .9, parry: .9, brk: 9999, xp: 0, gold: 0, img: 'vane',
  skills: [{ name: 'One Leaf', hits: [{ anim: 'thrust', m: .2, w: 1150, proj: 'leaf' }] }, { name: 'Two Leaves', w: .45, hits: [{ anim: 'thrust', m: .2, w: 1150, proj: 'leaf' }, { anim: 'thrust', m: .2, w: 700, proj: 'leaf' }] }] };
TIER.vane_leaf = 'S';
async function leafFlashback() {
  const f = F(); if (f.leafCut || G.S.kid) return; f.leafCut = 1;
  const keep = { kid: G.S.kid, hood: G.S.hood, party: G.S.party.slice(), hp: G.S.hp, mp: G.S.mp };
  await narr(f.leafMiss ? "You tried to cut it out of the air. Your blade passed straight through where it had been." : "It came at you through the air, and your blade wanted no part of it.");
  await me('closed', '…Cut the leaf. Don\'t touch it.');
  await fadeOut(800);
  Dlg.close(); G.S.kid = true; G.S.hood = false; G.S.party = []; try { await buildPlayerSprites(); } catch (e) { }
  await wait(200); await fadeIn(300);
  await Cine.play([{ bg: 'autumnShrine', fx: ['petals'], dur: 2600, cam: [[0, 400, 240, 1.25], [6000, 430, 245, 1.4]],
    actors: [{ spr: 'vane', x: 380, y: 300, dir: 'right', scale: 2.1 }, { spr: 'me', x: 450, y: 302, dir: 'left', scale: 2.2 }],
    lines: ['The fourth autumn. The one week of the year the mountain has leaves.', 'The old man holds a dry leaf between two fingers. Then he lets it go.'] }], { music: 'sad' });
  await say('vane', 'neutral', "Cut it.");
  await narr('You swing. The leaf folds around your blade, rides it, and settles on the snow. Whole.');
  await say('vane', 'happy', "You hit it. I didn't say hit it. I said CUT it.");
  await me('anger', "It's a LEAF. It doesn't stay still!");
  await say('vane', 'neutral', "Nothing that's thrown at you stays still, pup. Arrows. Knives. Fire. A man's spell. They all ride the air — and the air moves out of the way of your sword, and takes them with it.");
  await say('vane', 'neutral', "So don't chase the leaf. Put the edge where the leaf is GOING to be, and hold it there. Let the leaf fall onto the blade. The blade doesn't touch it. It just… is there first.");
  await say('vane', 'neutral', "Again.");
  const r = await Battle.start({ enemies: ['vane_leaf'], noFlee: true, bd: 'snow', intro: 'Flashback — the leaf lesson', music: 'battle', leafTrain: 1,
    onTurn: async (B, Bt) => {
      if (!B.leafIntro) { B.leafIntro = 1; B.leafTrain = 1; await Bt.msg('PARRY as each leaf reaches you — the window is tight.', 1700, true); }
      if ((B.leafCuts || 0) >= 3) { await Bt.msg('Three leaves. Three clean halves.', 1500, true); return 'scripted'; }
      if (B.turn >= 18) { await Bt.msg('The light is going. Your arms are shaking.', 1500); return 'scripted'; }
      if (B.cur.side === 'p') return 'skip';
    } });
  const cuts = (Battle.lastLeafCuts ?? 0);
  if (cuts >= 3) {
    await say('vane', 'shock', "…");
    await say('vane', 'neutral', "Three. Took me eleven years to cut three in a row. Don't you dare tell anyone you did it in one autumn.");
    await me('happy', "I didn't. It took me all week.");
    await say('vane', 'happy', "Then you'll do it four thousand more times, and on the four thousandth, you won't have to think.");
  } else {
    await say('vane', 'neutral', "Hm. One. Maybe two, if I'm generous, and I'm not.");
    await me('sad', "I can't do it.");
    await say('vane', 'neutral', "Not yet. That's a different word. You'll carry this one for years, pup. One day something will be flying at your face, and your hands will remember before you do.");
  }
  await narr('He was right. It took years. You never quite got it on the mountain.');
  await fadeOut(800);
  Dlg.close(); G.S.kid = keep.kid; G.S.hood = keep.hood; G.S.party = keep.party; G.S.hp = keep.hp; G.S.mp = keep.mp; try { await buildPlayerSprites(); } catch (e) { }
  await wait(200); await fadeIn(700);
  await narr('Today, your hands finally remember.');
  sfx('level');
  toast('Learned <b style="color:#c9ffd8">Leaf Cut</b>. Arrows, bolts, knives and spells can now be <b>PARRIED</b> in flight as well as dodged. The window is tighter than a blade\'s, and it widens slowly the more you cut. A <b>perfect</b> cut sends half of it back.', 7000);
  UI.hud();
}
(function () {
  // remember how many leaves were cut, the moment the training fight ends
  const _end = Battle.victory ? Battle.victory.bind(Battle) : null;
  const _bs = Battle.start.bind(Battle);
  Battle.start = async function (cfg) {
    const r = await _bs(cfg);
    try {
      const f = G.S && G.S.f;
      if (f && !cfg.leafTrain && r === 'win' && f.projSeen && !f.leafCut && !G.S.kid && f.vaneDone) await leafFlashback();
    } catch (e) { console.warn(e); }
    return r;
  };
  // battle state for the training fight
  const _run = Battle.run.bind(Battle);
  Battle.run = async function () { const B = this.B; if (B && B.cfg && B.cfg.leafTrain) { B.leafTrain = 1; B.leafCuts = 0; } const r = await _run(); if (B && B.cfg && B.cfg.leafTrain) Battle.lastLeafCuts = B.leafCuts || 0; return r; };
})();

/* ---------- it shows up in the Passives menu as a technique (always on, takes no slot) ---------- */
(function () {
  if (typeof passivesMenuHTML !== 'function') return;
  const _p = passivesMenuHTML;
  passivesMenuHTML = function () {
    const h = _p();
    const body = LeafCut.has()
      ? `Parry arrows, bolts, knives and spells in flight. Tighter timing than a blade. A perfect cut sends half of it back at the thrower. <b>Mastery ${LeafCut.mastery()}%</b> — the window widens as you cut more.`
      : (G.S && G.S.f.vaneDone ? 'Vane tried to teach you to cut a falling leaf without touching it. You never managed it. Until then, things that fly at you can only be <b>dodged</b>.' : '???');
    return h + `<div class="stat" style="margin-top:6px"><h3 style="color:#c9ffd8">🍃 Technique — Leaf Cut ${LeafCut.has() ? '' : '<span class="muted">(not learned)</span>'}</h3><p class="muted">${body}</p></div>`;
  };
})();
