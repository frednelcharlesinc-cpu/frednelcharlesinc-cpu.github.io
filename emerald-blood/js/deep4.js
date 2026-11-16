'use strict';
/* ================= WORLD+ 15 (Chat B — World & Maps) =================
   VARRO'S ARC — beat Varro five times and he offers to train you: a three-day arc that ends with his finisher, Sandbreaker.
   TWIN GATES — some tears have a twin. Close the first and the second rips open in another forest: race to close it too.
   THE SOVEREIGN'S HEIR — once the Sovereign falls, something smaller starts gathering the void. A weekly boss that grows.
   THE DEEP CAMP — build a camp in the Underdeep: rest, cook, and a stair at the Crossroads that leads straight down.
   MURAL RESTORATION — pay Ashford's masons to restore the carvings in each forest. Pilgrims come to see them.
   TAG-TEAM CUP — three arena bouts, two against two, you and one partner.
   SEER'S FORTUNES — Oyelle reads more cards: tomorrow's void storm, a winner on Odds-Marta's book, a fisher's blessing.
   VOID-TOUCHED GEAR — the smith works Void Salt into your gear: permanent stats and a purple glow.
   (Lines are B drafts — Chat A may rewrite. The Sandbreaker art is a B draft for A to rebalance.) */
(function () {
  const S_ = () => G.S, F = () => G.S.f;
  const gold$ = n => `<b style="color:#ffd36a">${n}</b>`;
  const day = () => (typeof Cal !== 'undefined' ? Cal.day() : 1);
  const week = () => Math.floor((day() - 1) / 7);
  const rare = () => { try { return WorldPlus4.giveRare(); } catch (e) { return null; } };
  const rng = seed => () => { seed = (seed * 1664525 + 1013904223) % 4294967296; return seed / 4294967296; };
  const sheet = draw => { const one = document.createElement('canvas'); one.width = one.height = 64; const x = one.getContext('2d'); draw(x); const S = document.createElement('canvas'); S.width = 64 * 9; S.height = 64 * 12; const s = S.getContext('2d'); for (let r = 0; r < 12; r++) for (let f = 0; f < 9; f++) s.drawImage(one, f * 64, r * 64); return S; };
  const R = (x, c, a, b, w, h) => { x.fillStyle = c; x.fillRect(a, b, w, h); };
  const lazy = fn => { let S; return () => S || (S = sheet(fn)); };
  const campImg = lazy(x => { R(x, 'rgba(0,0,0,.35)', 4, 56, 56, 6); R(x, '#3a2a4a', 6, 30, 30, 28); R(x, '#5a4a6a', 8, 26, 26, 6); R(x, '#2a1a3a', 16, 40, 10, 18); R(x, '#5a3a20', 40, 50, 18, 4); R(x, '#ff9a3a', 44, 42, 10, 9); R(x, '#ffd36a', 47, 44, 4, 6); R(x, '#c58aff', 2, 20, 3, 36); R(x, '#e8d8ff', 1, 16, 5, 5); });
  const stairImg = lazy(x => { R(x, 'rgba(0,0,0,.4)', 8, 50, 48, 10); R(x, '#2a1a3a', 12, 34, 40, 22); R(x, '#5a4a6a', 10, 30, 44, 6); R(x, '#120a1e', 18, 38, 28, 18); R(x, '#8a46ff', 22, 44, 20, 3); R(x, '#c58aff', 26, 50, 12, 2); R(x, '#6a6a7a', 14, 18, 4, 14); R(x, '#6a6a7a', 46, 18, 4, 14); });
  const pilgrimSprites = ['folk19', 'dfolk1', 'dfolk4'];

  /* ================= VARRO'S ARC ================= */
  if (typeof ARTS !== 'undefined' && !ARTS.sandbreaker) ARTS.sandbreaker = { name: 'Sandbreaker', strain: 40, mp: 6, desc: 'Varro\'s arena finisher: a shoulder-check that knocks them off balance, then a two-handed blow from above. ×2.6 total, breaks guards.', type: 'hit', hits: [{ anim: 'slash', m: .8 }, { anim: 'backslash', m: 1.8 }], brk: 22 };
  const varro = () => (S_().varro = S_().varro || { step: 0, day: 0 });
  async function varroTalk() {
    const V = varro();
    if (V.step >= 3) { await narr('"Show me the Sandbreaker again sometime," Varro says, grinning. "On someone else."'); return; }
    if (V.day === day()) { await narr('"Rest, kid. Same time tomorrow. A body learns in its sleep."'); return; }
    const L = ['Varro walks you to the far wall. "Five times you put me on the sand. Nobody\'s done that. So — you\'re going to learn how I put THEM there." He makes you push a sandbag across the arena until the sun goes down.',
      'Day two. Varro has you stand still while he swings at you. "Don\'t block. Don\'t dodge. Lean in. The shoulder goes first — the blade only follows." You get hit a lot.',
      'Day three. "Now." Shoulder — then the blade, from above, with everything behind it. The sandbag explodes. The crowd in the empty stands — the sweepers, the cooks — start clapping.'];
    const c = await ask(null, null, V.step ? '"Back for more?"' : '"You fight like a Drag and a gutter-rat at once," says Varro. "I like it. Want to learn something?"', ['Train with Varro', 'Not today']); if (c !== 0) return;
    await narr(L[V.step]); V.step++; V.day = day(); sfx('blip');
    if (V.step === 3) { G.S.arts = G.S.arts || []; if (!G.S.arts.includes('sandbreaker')) G.S.arts.push('sandbreaker'); sfx('level'); toast('⚔️ NEW ART — <b>SANDBREAKER</b>', 3400); await narr('"That\'s mine. Now it\'s yours too. Don\'t waste it on goblins."'); }
    save();
  }

  /* ================= TWIN GATES ================= */
  const FORESTS = ['woods_n', 'woods_e', 'woods_s', 'woods_w', 'woods_n2', 'woods_e2', 'woods_s2', 'woods_w2'];
  function twinCheck() {
    const S = S_(), g = S.gateEv; if (!g) return;
    if (!g.twinRoll) { g.twinRoll = 1; if (!g.twin && Math.random() < .3) { g.twin = 1; toast('<b style="color:#c58aff">This tear hums twice.</b> Somewhere, it has a twin.', 3000); } save(); }
    if (g.twin === 1 && g.looted && !g.twinGone) {
      g.twinGone = 1; const others = FORESTS.filter(z => z !== g.scene && SCENES[z]), z = others[Math.floor(Math.random() * others.length)];
      const at = WorldPlus4.spot(z, 3000 + (S.gatesClosed || 0)); if (!at) return;
      S.gateEv = { scene: z, x: at[0], y: at[1], until: (S.steps || 0) + 260, done: 0, twin: 2, twinRoll: 1 };
      toast(`<b style="color:#c58aff">⚡ TWIN GATE!</b> Its twin has torn open in ${SCENES[z].subtitle || SCENES[z].title}. 260 steps to close it!`, 4200); save();
    }
    if (g.twin === 2 && g.looted && !g.twinPaid) { g.twinPaid = 1; const x = rare(); G.S.gold += 350; UI.hud(); sfx('level'); toast(`⚡ <b>TWIN GATES CLOSED</b> — ${gold$('+350 gold')}${x ? ' and a ' + x : ''}`, 3800); save(); }
  }

  /* ================= THE SOVEREIGN'S HEIR ================= */
  let heirImg = null;
  async function heirSprite() {
    if (heirImg) return heirImg; const im = await npcImg((ENEMY.m_vampire && ENEMY.m_vampire.img) || 'm_vampire');
    const c = document.createElement('canvas'); c.width = im.width; c.height = im.height; const x = c.getContext('2d'); x.drawImage(im, 0, 0); x.globalCompositeOperation = 'source-atop'; x.fillStyle = 'rgba(110,40,200,.5)'; x.fillRect(0, 0, c.width, c.height);
    G.img.__heir = c; return heirImg = c;
  }
  async function heir() {
    const S = S_(); if (S.heirWeek === week()) { await narr('The throne is empty again. The void is still gathering, slowly. Whatever comes next will come next week.'); return; }
    const n = S.heirKills || 0, B = ENEMY.m_vampire || ENEMY.m_wartotaur;
    ENEMY.void_heir = Object.assign({}, B, { name: `The Sovereign's Heir${n ? ' ' + ['II', 'III', 'IV', 'V', 'VI', 'VII'][Math.min(5, n - 1)] : ''}`, img: '__heir', boss: 1, hp: Math.round(B.hp * (2.6 + n * .4)), atk: Math.round(B.atk * (1.3 + n * .08)), xp: Math.round((B.xp || 40) * (4 + n)), gold: 0, trait: 'Heir to the empty throne · grows each time it returns' });
    await narr(n ? 'It\'s back — taller than last time. It sits on the black throne as if it was always meant to.' : 'Something sits on the empty throne: thin, purple-lit, wearing a crown of void glass much too big for it. "MINE NOW," it says, in a child\'s voice.');
    const r = await Battle.start({ enemies: ['void_heir', ...(Deep.voidParty ? Deep.voidParty().slice(0, 1) : [])], boss: true, noFlee: true, bd: 'underdeep', music: 'boss', intro: 'THE SOVEREIGN\'S HEIR' });
    if (r === 'lose') { await Story.defeat(); return; } if (r !== 'win') return;
    S.heirWeek = week(); S.heirKills = n + 1; const g = 300 + n * 80, x = rare(); G.S.gold += g; UI.hud(); sfx('level');
    if (window.Food) { Food.addIng('voidsalt', 2); }
    await narr(`The heir breaks into a hundred motes and drifts back into the dark. ${gold$(g + ' gold')}${x ? `, a ${gold$(x)}` : ''} and 2 Void Salt. It will be back.`);
    if (S.heirKills === 5) { S.title = 'Throne-Breaker'; toast('👑 TITLE EARNED — <b>THRONE-BREAKER</b>', 3400); } save();
  }

  /* ================= THE DEEP CAMP ================= */
  const CAMP = [51, 42];
  async function camp() {
    if (!F().deepCamp) {
      const c = await ask(null, null, 'A flat shelf of old stone, out of the void wind. A good place for a camp — and a stair cut back up to the Crossroads, so you never need a Gate to come down again. (300 gold for timber, rope and a mason)', ['Build it (300g)', 'Not now']);
      if (c !== 0) return; if (G.S.gold < 300) { await narr('You can\'t afford it yet.'); return; } G.S.gold -= 300; F().deepCamp = 1; UI.hud(); sfx('level');
      const e = World.ents.find(n => n.id === 'deepcamp'); if (e) { e.img = campImg(); e.name = 'Deep camp'; }
      await narr('The camp goes up: a tent, a fire that burns purple at the edges, and a stair to the Crossroads. You can come and go whenever you like now.'); save(); return;
    }
    const ch = await ask(null, null, 'Your camp in the deep. The fire crackles in colours fire shouldn\'t have.', ['Rest', 'Cook', 'Climb to the Crossroads', 'Leave']);
    if (ch === 0) { Story.heal(); await narr('You sleep under a sky with no stars of its own. You wake rested.'); }
    if (ch === 1 && window.Food && Food.cook) await Food.cook();
    if (ch === 2) { await World.go('woods', ...crossStair(), 'down'); }
  }
  const crossStair = () => { const p = WorldPlus4.spot('woods', 2601); return p ? [p[0], p[1] + 1] : [24, 21]; };
  async function stairDown() {
    const c = await ask(null, null, 'Your stair, cut down through the Crossroads stone into the deep.', ['Go down', 'Stay']); if (c !== 0) return;
    await World.go('underdeep', CAMP[0] + 1, CAMP[1] + 1, 'down');
  }

  /* ================= MURAL RESTORATION ================= */
  const RESTORE = { woods_n: 'the kneeling knight of the North Pass', woods_e: 'the burned robed figure', woods_s: 'Averin Holle\'s statue', woods_w: 'the great Drag mural in the Old Grove' };
  const PILGRIM = {
    woods_n: '"They chiselled out his name. The masons found it underneath — he was a Drag. HERO OF THE NORTH PASS. My grandmother told me that story and I thought she was making it up."',
    woods_e: '"It says IT WAS NOT THE DRAGS WHO BURNED THE EAST. It\'s carved bigger now. You can read it from the road."',
    woods_s: '"They put the second line back. AND BUILT THE ACCORD ON THEIR CHAINS. My father was a Guild clerk. I\'m going to show him."',
    woods_w: '"The colours! I didn\'t know they used to be green. I didn\'t know anything, did I?"' };
  const rest = () => (S_().restored = S_().restored || {});
  async function masons() {
    const left = Object.keys(RESTORE).filter(k => !rest()[k]);
    if (!left.length) { await narr('"Every carving in the four woods, done," says the master mason, wiping her hands. "People walk out from town just to look at them now."'); return; }
    const ch = await ask(null, null, '"Old carvings out in the woods? Chipped, scrubbed, painted over? We can bring them back. 250 a job — stone isn\'t cheap and neither are we."', [...left.map(k => `Restore ${RESTORE[k]}`), 'Not now']);
    const k = left[ch]; if (!k) return; if (G.S.gold < 250) { await narr('"Two hundred and fifty, love. Come back."'); return; }
    G.S.gold -= 250; rest()[k] = day(); UI.hud(); sfx('level'); await narr(`"We'll ride out tomorrow." By the end of the week ${RESTORE[k]} looks the way it was meant to look.`);
    if (Object.keys(rest()).length === 4) { G.S.title = 'Restorer of the Old Stone'; toast('🪨 TITLE EARNED — <b>RESTORER OF THE OLD STONE</b>', 3400); }
    save();
  }

  /* ================= TAG-TEAM CUP ================= */
  const TAG = [['m_goblin', 'm_goblin_shaman'], ['bandit', 'm_orc'], ['m_lizard', 'm_troll']];
  async function marshal() {
    const S = S_(), party = (S.party || []).filter(id => ALLY[id]);
    const opts = party.map(id => 'Partner: ' + ALLY[id].name); if (!party.length) opts.push('Hire an arena partner (40g)');
    const ch = await ask(null, null, `The tag-team marshal. "Two of you, two of them, three bouts. One partner only — the rest of your crew watches from the stands."${S.tagWins ? ` (Won ×${S.tagWins})` : ''}`, [...opts, 'Leave']);
    let ally = party[ch]; if (!ally && !party.length && ch === 0) { if (G.S.gold < 40) { await narr('"Forty for a partner."'); return; } G.S.gold -= 40; UI.hud(); ally = Object.keys(ALLY).find(k => k === 'oren') || Object.keys(ALLY)[0]; }
    if (!ally) return;
    for (let i = 0; i < TAG.length; i++) {
      const en = TAG[i].filter(k => ENEMY[k]); banner(`TAG-TEAM — BOUT ${i + 1} OF 3`, `you and ${ALLY[ally].name}`, 1800); if (Deep.roar) Deep.roar(.5);
      const r = await Battle.start({ enemies: en, allies: [ally], noFlee: true, bd: 'arena', music: i === 2 ? 'boss' : 'battle', intro: 'TAG-TEAM' });
      if (r !== 'win') { Story.heal(true); await narr(`Out in bout ${i + 1}. ${ALLY[ally].name} helps you limp off the sand. "Next time," they say.`); return; }
      if (Deep.cheer) Deep.cheer();
    }
    S.tagWins = (S.tagWins || 0) + 1; const g = S.tagWins === 1 ? 300 : 100; G.S.gold += g; const x = S.tagWins === 1 ? rare() : null; UI.hud(); sfx('level'); if (Deep.cheer) Deep.cheer(1);
    if (Deep.addPts) Deep.addPts(6, 'tag-team cup');
    await narr(`<b>TAG-TEAM CUP — CHAMPIONS!</b> You and ${ALLY[ally].name} raise the cup together. ${gold$(g + ' gold')}${x ? ` and a ${gold$(x)}` : ''}.`); save();
  }

  /* ================= SEER'S FORTUNES ================= */
  async function fortunes() {
    const S = S_(); if (S.fortuneDay === day()) { await narr('"One reading a day, dear. The cards get tired."'); return; }
    const c = await ask(null, null, 'Madame Oyelle fans out a second deck. "Ten gold for a smaller fortune. Pick a card."', ['The Storm (the deep, tomorrow)', 'The Crown (the arena book)', 'The Fisher (luck on the line)', 'Not today']);
    if (c < 0 || c > 2) return; if (G.S.gold < 10) { await narr('"Ten, dear."'); return; } G.S.gold -= 10; UI.hud(); S.fortuneDay = day(); save();
    if (c === 0) { const r = rng((day() + 1) * 31337 + 7); await narr(r() < .4 ? '"Tomorrow the deep storms. Bridges will go dark. Take the long way, or wait a day."' : '"Tomorrow the deep is calm. Every bridge will hold."'); }
    if (c === 1) { const C = Deep.card ? Deep.card() : [], i = Math.floor(Math.random() * C.length), m = C[i];
      if (!m) { await narr('"The arena is quiet in my cards today."'); return; }
      const w = Deep.betWinner(day(), i) ? m.a : m.b; await narr(`"Today, on Odds-Marta's book: ${ENEMY[m.a].name} against ${ENEMY[m.b].name}. The card shows… <b>${ENEMY[w].name}</b>. Don't tell her I told you."`); }
    if (c === 2) { G.S.bait = (G.S.bait || 0) + 3; await narr('"The Fisher smiles on you." She presses three wriggling baits into your hand, which is either magic or she keeps them in her pocket. (+3 bait)'); }
  }

  /* ================= VOID-TOUCHED GEAR ================= */
  const VMAX = 5;
  async function infuse() {
    const S = S_(), n = S.voidInf || 0;
    if (n >= VMAX) { await narr('"Any more void in that gear and it\'ll start whispering to you," says the smith. "Five is the limit."'); return; }
    const salt = window.Food ? (Food.st().ing.voidsalt || 0) : 0, cost = 150 + n * 75;
    const c = await ask(null, null, `The smith turns a pinch of Void Salt in her tongs; it sparks purple. "I can work this into your gear. 3 Void Salt and ${cost} gold. (Infusion ${n} / ${VMAX}) You have ${salt} salt."`, ['Into the blade (+2 attack)', 'Into the armour (+2 defence)', 'Not now']);
    if (c < 0 || c > 1) return; if (salt < 3) { await narr('"Three Void Salt. Hunt the hollow things in the deep."'); return; } if (G.S.gold < cost) { await narr('"Can\'t work for free."'); return; }
    Food.st().ing.voidsalt -= 3; G.S.gold -= cost; S.voidInf = n + 1; const st = G.S.stats; if (c === 0) st.atk += 2; else st.def += 2; UI.hud(); sfx('level');
    await narr(`Hammer, quench, and a hiss like a breath let out. Your ${c === 0 ? 'blade' : 'armour'} glows faintly purple now. (${c === 0 ? 'Attack' : 'Defence'} +2 · Infusion ${n + 1} / ${VMAX})`); save();
  }
  function drawGlow(c, t) {
    const n = S_().voidInf || 0; if (!n || !World.player) return; const p = World.player, X = p.px - Math.round(World.cam.x), Y = p.py - Math.round(World.cam.y);
    for (let i = 0; i < 2 + n; i++) { const a = t / 600 + i * 2.1, r = 12 + Math.sin(t / 300 + i) * 3; c.fillStyle = `rgba(190,120,255,${(.35 + .2 * Math.sin(t / 200 + i)).toFixed(2)})`; c.fillRect(X + Math.cos(a) * r, Y - 20 + Math.sin(a) * r * .6, 2, 2); }
  }

  /* ================= hooks ================= */
  const _render = World.render.bind(World);
  World.render = function (c, t) { _render(c, t); try { if (G.mode === 'world' && !World.loading) drawGlow(c, t); } catch (e) { } };
  const _load = World.load.bind(World);
  World.load = async function (name, ...a) {
    const r = await _load(name, ...a);
    try {
      const W = World; twinCheck();
      if (name === 'arena') {
        if ((S_().arena || {}).champWins >= 5) { let im; try { im = await npcImg(ENEMY.m_minotaur ? (ENEMY.m_minotaur.img || 'm_minotaur') : 'm_orc'); } catch (e) { } if (im && !W.ents.find(e => e.id === 'arenachamp')) W.ents.push(new Ent({ id: 'varro', x: 28, y: 12, dir: 'down', img: im, size: 1.3, name: 'Varro', talk: varroTalk })); }
        let mi; try { mi = await npcImg('folk19'); } catch (e) { } if (mi) W.ents.push(new Ent({ id: 'tagmarshal', x: 38, y: 25, dir: 'left', img: mi, name: 'Tag-team marshal', talk: marshal }));
      }
      if (name === 'underdeep') {
        W.ents.push(new Ent({ id: 'deepcamp', x: CAMP[0], y: CAMP[1], dir: 'down', img: F().deepCamp ? campImg() : stairImg(), size: F().deepCamp ? 1.3 : 1, name: F().deepCamp ? 'Deep camp' : 'A sheltered shelf', talk: camp }));
        if (F().deepCamp) W.addFire && W.lights.push({ x: CAMP[0] * TILE + 40, y: CAMP[1] * TILE, r: 120, c: '255,150,90' });
        if (F().sovereign) { const e = W.ents.find(n => n.id === 'sovereign'); if (e && S_().heirWeek !== week()) { try { e.img = await heirSprite(); e.size = 1.3; e.name = 'The Sovereign\'s Heir'; } catch (x) { } e.talk = heir; } else if (e) e.talk = heir; }
      }
      if (name === 'woods' && F().deepCamp) { const p = WorldPlus4.spot('woods', 2601); if (p) { W.col[p[1]][p[0]] = 1; W.ents.push(new Ent({ id: 'deepstairX', x: p[0], y: p[1], dir: 'down', img: stairImg(), name: 'Stair to the deep', talk: stairDown })); } }
      if (RESTORE[name] && rest()[name]) { const p = WorldPlus4.spot(name, 2701); if (p) { let im; try { im = await npcImg(pilgrimSprites[Object.keys(RESTORE).indexOf(name) % 3]); } catch (e) { }
        if (im) W.ents.push(new Ent({ id: 'pilgrim', x: p[0], y: p[1], dir: 'down', img: im, name: 'Pilgrim', ai: 'turn', turns: ['down', 'left', 'right'], talk: () => narr(PILGRIM[name]) })); } }
    } catch (e) { console.warn('deep4', e); }
    return r;
  };
  if (window.TownLife && TownLife.services) TownLife.services.push(
    { label: 'Madame Oyelle\'s smaller fortunes (10g)', run: fortunes },
    { label: 'The masons (restore the old carvings)', run: masons },
    { label: 'The smith — void infusion', run: infuse });
  if (window.Deep) Object.assign(Deep, { varroTalk, twinCheck, heir, camp, stairDown, masons, marshal, fortunes, infuse });
})();
