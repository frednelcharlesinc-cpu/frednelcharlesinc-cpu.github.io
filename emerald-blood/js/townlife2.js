'use strict';
/* ================= TOWN LIFE 2 — Ashford's people (Chat B — World & Maps) =================
   FRIENDSHIP — give Ashford's regulars gifts (once a day each). Everyone has favourites. Hearts unlock thank-yous,
                secrets, and a best-friend reward.
   THE BARD   — evenings by the fountain, singing about the things YOU actually did.
   THE IRONJAW THREE — a rival hunting crew in the square. Out-hunt them on the board each week, or duel their leader.
   LOST & FOUND — (an odd job on the town board) someone's lost something in the woods.
   INQUISITION CHECKPOINT — some days, two Inquisitors check faces at the East gate. Hood up, pay, bluff — or turn back.
   (Every line here is a B draft — Chat A owns who these people are and may rewrite freely.) */
(function () {
  const S_ = () => G.S, F = () => G.S.f;
  const day = () => (typeof Cal !== 'undefined' ? Cal.day() : 1), week = () => Math.floor((day() - 1) / 7);
  const night = () => (typeof Ambient !== 'undefined' && Ambient.night) || 0;
  const pick = L => L[Math.floor(Math.random() * L.length)];
  const gold$ = n => `<b style="color:#ffd36a">${n}</b>`;
  const TL = () => window.TownLife, W4 = () => window.WorldPlus4;
  const TOWN = 'ashford';
  const rareP = () => W4() ? W4().giveRare() : '';

  /* ---------- friendship & gifts ---------- */
  // gift kinds the player can carry: [id, label, have(), take()]
  const GIFTS = [
    ['moonpetal', 'a moonpetal', () => (typeof Quests !== 'undefined' && Quests.has('moonpetal')) || 0, () => { G.S.qitems.moonpetal--; }],
    ['crystal', 'a lightning crystal', () => S_().lcrystals || 0, () => { S_().lcrystals--; }],
    ['tonic', 'a tonic', () => G.S.items.tonic || 0, () => { G.S.items.tonic--; }],
    ['rare', 'a rare monster part', () => Object.keys(Gear.st().parts || {}).filter(k => PARTS[k] && PARTS[k].rare && Gear.st().parts[k] > 0).length, () => { const P = Gear.st().parts, k = Object.keys(P).find(k => PARTS[k] && PARTS[k].rare && P[k] > 0); if (k) P[k]--; }],
    ['gold', '20 gold', () => (G.S.gold >= 20 ? 1 : 0), () => { G.S.gold -= 20; UI.hud(); }]
  ];
  const FRIENDS = {
    maren: { n: 'Maren', love: 'moonpetal', like: 'tonic', hate: 'gold' },
    tobb: { n: 'Tobb', love: 'gold', like: 'crystal', hate: 'moonpetal' },
    pip: { n: 'Pip', love: 'crystal', like: 'moonpetal', hate: 'tonic' },
    kess: { n: 'Kess', love: 'rare', like: 'crystal', hate: 'moonpetal' },
    cassel: { n: 'Cassel', love: 'tonic', like: 'gold', hate: 'crystal' },
    hoshi: { n: 'Hoshi', love: 'moonpetal', like: 'rare', hate: 'gold' },
    bram: { n: 'Bram', love: 'gold', like: 'tonic', hate: 'rare' },
    pipmom: { n: 'Pip\'s mum', love: 'tonic', like: 'moonpetal', hate: 'crystal' }
  };
  const hearts = () => (S_().hearts = S_().hearts || {});
  const gifted = () => { const S = S_(); if (!S.gifted || S.gifted.day !== day()) S.gifted = { day: day() }; return S.gifted; };
  async function offerGift(id) {
    const fr = FRIENDS[id], have = GIFTS.filter(g => g[2]() > 0); if (!fr || !have.length || gifted()[id]) return;
    const c = await ask(null, null, `Give ${fr.n} a gift? (♥ ${hearts()[id] || 0}/10)`, [...have.map(g => 'Give ' + g[1]), 'Not today']); const g = have[c]; if (!g) return;
    g[3](); gifted()[id] = 1; const H = hearts(), before = H[id] || 0;
    const d = g[0] === fr.love ? 3 : g[0] === fr.like ? 1 : g[0] === fr.hate ? -1 : 0; H[id] = Math.max(0, Math.min(10, before + d));
    await narr(d === 3 ? `${fr.n}'s whole face lights up. "How did you KNOW?" (♥ +3)` : d === 1 ? `${fr.n} smiles. "That's kind of you." (♥ +1)` : d < 0 ? `${fr.n} takes it… politely. Very politely. (♥ −1)` : `"Oh. Thank you." ${fr.n} puts it in a pocket.`);
    for (const [at, fn] of [[3, async () => { const g2 = 60; G.S.gold += g2; UI.hud(); await narr(`"Here — I've been meaning to give you something." ${fr.n} presses ${g2} gold into your hand. "For all the help."`); }],
      [6, async () => { const H2 = TL() ? TL().hints() : []; await narr(`${fr.n} lowers their voice. "Can I tell you something? I don't tell people this."`); if (H2.length) await narr(pick(H2)); }],
      [10, async () => { const r = rareP(); G.S.gold += 200; UI.hud(); sfx('level'); await narr(`"You're the best friend I've got in this town, you know that?" ${fr.n} hugs you, hard. (200 gold${r ? `, a ${gold$(r)}` : ''})`); toast(`<b style="color:#ff9ab8">♥ BEST FRIENDS</b> with ${fr.n}`, 2800); }]])
      if (before < at && H[id] >= at) await fn();
    save();
  }

  /* ---------- the bard ---------- */
  function verses() {
    const d = TL() ? TL().deeds() : [], v = d.map(x => `♪ Oh, ${x}… ♪`);
    return v.length ? v : ['♪ Ashford by the river, Ashford in the rain… ♪', '♪ Nothing ever happens here, and so we sing again… ♪'];
  }
  async function bardTalk() {
    await narr('A bard with a battered lute and a feather in his cap. "A request? No — wait. I\'ve been working on something new. About YOU."');
    for (const l of verses().slice(0, 3)) await narr('<i>' + l + '</i>');
    const c = await ask(null, null, 'Tip the bard?', ['Toss him 5 gold', 'Clap and move on']);
    if (c === 0 && G.S.gold >= 5) { G.S.gold -= 5; UI.hud(); sfx('coin'); await narr('"A patron of the arts! I\'ll add a verse about your generosity. A short one."'); }
  }

  /* ---------- the Ironjaw Three ---------- */
  const crewCount = () => 2 + (week() % 3);
  const myCount = () => ((S_().bounty || {}).list || []).filter(b => b.state === 'paid').length;
  async function crewTalk() {
    const S = S_(), mine = myCount(), theirs = crewCount(); S.crew = S.crew && S.crew.week === week() ? S.crew : { week: week() };
    await narr(`Three hunters in matching iron-studded jackets lean on the fountain. Their leader, Brannoc, grins. "Well, if it isn't the Crossroads' favourite. We've cleared ${theirs} marks this week. You?"`);
    if (mine > theirs && !S.crew.respect) { S.crew.respect = 1; const g = 150; G.S.gold += g; UI.hud(); sfx('level'); await narr(`"${mine}? …Fine. FINE. A bet's a bet." Brannoc slaps ${g} gold into your hand. The other two won't meet your eyes.`); save(); return; }
    if (mine > theirs) { await narr('"Yeah, yeah, we know. Enjoy it while it lasts."'); return; }
    const c = await ask(null, null, `"${mine}? Ha! Want to settle it the old way? 100 gold says you can't put me down."`, ['Duel Brannoc', 'Walk away']);
    if (c !== 0 || S.crew.dueled) { if (S.crew.dueled) await narr('"Once a week, hero. My ribs need a rest."'); return; }
    if (!ENEMY.crew_brannoc && ENEMY.bandit) ENEMY.crew_brannoc = Object.assign({}, ENEMY.bandit, { name: 'Brannoc Ironjaw', img: ENEMY.bandit.img || 'bandit', hp: Math.round(ENEMY.bandit.hp * 2.6), atk: Math.round(ENEMY.bandit.atk * 1.3), def: (ENEMY.bandit.def || 0) + 2, xp: 50, gold: 0, trait: 'Rival hunter — hits hard, talks harder' });
    S.crew.dueled = 1; const r = await Battle.start({ enemies: ['crew_brannoc'], noFlee: true, bd: 'forest', intro: 'DUEL — BRANNOC IRONJAW' });
    if (r === 'win') { G.S.gold += 100; UI.hud(); sfx('level'); await narr('Brannoc sits down hard on the cobbles, laughing. "Alright! Alright. 100 gold. You\'re the real thing."'); }
    else { Story.heal(); await narr('You wake up on the fountain\'s rim with your purse a little lighter and Brannoc buying you a drink. "No hard feelings, hero."'); G.S.gold = Math.max(0, G.S.gold - 50); UI.hud(); }
    save();
  }

  /* ---------- the Inquisition checkpoint ---------- */
  const checkpoint = () => day() % 4 === 2 && !G.S.kid && !!G.S.f.vaneDone;
  function hookGate() {
    const ex = SCENES[TOWN] && (SCENES[TOWN].exits || []).find(e => e.to === 'woods'); if (!ex || ex.__cp) return; ex.__cp = 1; const prev = ex.check;
    ex.check = async () => {
      if (!checkpoint() || S_().cpPass === day()) return prev ? prev() : true;
      await narr('Two Inquisitors in white stand at the East gate, checking every face against a sheaf of drawings. "You. Hood down. Let\'s see your eyes."');
      const opts = [], S = S_(), tier = TL() ? TL().tier() : 0;
      if (S.f.hoodGiven) opts.push('Keep the hood low and mumble about rain');
      opts.push('Slip them 30 gold', tier >= 2 ? '"Do you know who I am?" (bluff)' : 'Bluff', 'Turn back');
      const c = opts[await ask(null, null, 'The Inquisitor waits.', opts)];
      if (c && c.startsWith('Keep the hood')) { if (Math.random() < .75) { S.cpPass = day(); await narr('He squints, sighs, and waves you through. "Next."'); return prev ? prev() : true; } await narr('"I said hood DOWN." You turn away before he can look closer.'); return false; }
      if (c === 'Slip them 30 gold') { if (G.S.gold < 30) { await narr('You don\'t have it.'); return false; } G.S.gold -= 30; UI.hud(); S.cpPass = day(); await narr('The coins vanish into a white glove. "Move along."'); return prev ? prev() : true; }
      if (c && c.startsWith('"Do you know')) { S.cpPass = day(); await narr('"The… the hunter? The one from the songs?" The younger Inquisitor actually steps aside. "Go on, then."'); return prev ? prev() : true; }
      if (c === 'Bluff') { if (Math.random() < .35) { S.cpPass = day(); await narr('"Guild business. Urgent." It works. Barely.'); return prev ? prev() : true; } await narr('"Nice try." He doesn\'t move. You back away.'); return false; }
      return false;
    };
  }

  /* ---------- lost & found (adds a job to the town board) ---------- */
  const ITEMS = [['Old Tam', 'a silver locket'], ['the miller', 'a brass compass'], ['a young Guild clerk', 'a ledger in oilcloth'], ['Hoshi', 'a carved wooden fox']];
  const glintImg = (() => { let S; return () => { if (S) return S; const one = document.createElement('canvas'); one.width = one.height = 64; const x = one.getContext('2d'); x.fillStyle = '#e8e0c8'; x.fillRect(29, 50, 6, 4); x.fillStyle = '#ffffff'; x.fillRect(31, 46, 2, 10); x.fillRect(27, 50, 10, 2); S = document.createElement('canvas'); S.width = 64 * 9; S.height = 64 * 12; const s = S.getContext('2d'); for (let r = 0; r < 12; r++) for (let f = 0; f < 9; f++) s.drawImage(one, f * 64, r * 64); return S; }; })();
  function lostItem() {
    const S = S_(); if (!S.lost || S.lost.week !== week()) { const it = ITEMS[week() % ITEMS.length], sc = ['woods_n', 'woods_e', 'woods_s', 'woods_w'][(week() + 1) % 4]; S.lost = { week: week(), who: it[0], what: it[1], scene: sc, state: 'open' }; }
    return S.lost;
  }

  /* ---------- wiring ---------- */
  const _load = World.load.bind(World);
  World.load = async function (name, ...a) {
    const r = await _load(name, ...a);
    try {
      if (name === TOWN) {
        hookGate();
        for (const e of World.ents) if (FRIENDS[e.id] && e.talk && !e.__gift) { const prev = e.talk; e.talk = async (...x) => { await prev(...x); if (G.S.map === TOWN && G.mode === 'world') await offerGift(e.id); }; e.__gift = 1; }
        const free = TL() && TL().freeNear;
        if (free && night() > .25 && night() < .85) { const p = free(33, 20); if (p) { const img = await npcImg('folk19').catch(() => null); if (img) { const e = new Ent({ id: 'bard', x: p[0], y: p[1], dir: 'down', img, name: 'The Bard', ai: 'turn', talk: bardTalk }); e.talkLines = () => verses(); e.barks = verses(); World.ents.push(e); } } }
        if (free && night() < .55) { const base = free(37, 26); if (base) for (const [i, sp] of ['hunter', 'rebel', 'rebel2'].entries()) { const p = free(base[0] + i - 1, base[1]); if (!p) continue; const img = await npcImg(sp).catch(() => null); if (img) World.ents.push(new Ent({ id: 'crew' + i, x: p[0], y: p[1], dir: 'left', img, name: i ? 'Ironjaw' : 'Brannoc', ai: 'turn', talk: crewTalk })); } }
        if (checkpoint()) { const ex = SCENES[TOWN].exits.find(e => e.to === 'woods'); if (ex && free) for (const dy of [-2, 2]) { const p = free(ex.x - 2, ex.y + dy, null, 2); if (p) { const img = await npcImg('acolyte').catch(() => null); if (img) World.ents.push(new Ent({ id: 'inq', x: p[0], y: p[1], dir: 'left', img, name: 'Inquisitor', talk: () => narr('"Faces. Every face, today. Orders from the Chapel."') })); } } }
      }
      const L = lostItem(); if (L.state === 'on' && L.scene === name) { const s = W4().spot(name, 888); if (s) World.ents.push(new Ent({ id: 'lostitem', x: s[0], y: s[1], dir: 'down', img: glintImg(), pickup: 1, name: '', talk: async () => { L.state = 'ready'; World.ents = World.ents.filter(e => e.id !== 'lostitem'); sfx('blip'); await narr(`Something glints in the grass — ${L.what}! That's the one from the board.`); save(); } })); }
    } catch (e) { console.warn('townlife2', e); }
    return r;
  };
  let bardT = 0;
  const _render = World.render.bind(World);
  World.render = function (c, t) {
    _render(c, t);
    try { if (G.S && G.S.map === TOWN && G.mode === 'world' && performance.now() > bardT) { bardT = performance.now() + 9000; const b = World.ents.find(e => e.id === 'bard'); if (b && b.say) b.say(pick(verses()).replace(/[♪]/g, '♪'), 3000); } } catch (e) { }
  };
  // the lost-and-found job, on the town board's Odd jobs list
  if (TL() && TL().jobs) {
    const _jobs = TL().jobs;
    TownLife.lostItem = lostItem;
    TownLife.extraJob = async () => {
      const L = lostItem();
      if (L.state === 'open') { L.state = 'on'; await narr(`LOST: ${L.what}. Last seen somewhere in ${SCENES[L.scene].subtitle}. Reward. — ${L.who}`); save(); return; }
      if (L.state === 'ready') { L.state = 'paid'; S_().jobsDone = (S_().jobsDone || 0) + 1; const g = 90 + Math.floor(Math.random() * 60); G.S.gold += g; UI.hud(); sfx('coin'); await narr(`${L.who} nearly drops it, they're so happy. "${L.what.replace(/^a /, 'My ')}! ${g} gold — take it, please."`); save(); return; }
      await narr(L.state === 'paid' ? 'Already returned. New notices next week.' : `${L.what} is still out there in ${SCENES[L.scene].subtitle}.`);
    };
  }
  window.TownLife2 = { hearts, FRIENDS, offerGift, checkpoint, lostItem };
})();
