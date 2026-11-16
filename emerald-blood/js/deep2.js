'use strict';
/* ================= WORLD+ 13 (Chat B — World & Maps) =================
   ARENA BETTING — Odds-Marta's book: three monster bouts a day. Pick a side, set a stake, watch it play out.
   SPONSORS — three Ashford houses will pay you to wear their colours in the arena. Each pays out differently.
   SPREADING CRACKS — every Gate you close sends a new fracture up into the Underdeep: fresh stone, a guardian, a cache.
   MURAL RUBBINGS — take a charcoal rubbing of each fresco; the archivist in Ashford pays for them and reads them aloud.
   VOID FISHING — the starlight pool in the Underdeep has its own catches.
   ECHO DUELS — the Mirror Pool in the Underdeep: fight a reflection of yourself and your party, once a week.
   (Lines are B drafts — Chat A may rewrite.) */
(function () {
  const S_ = () => G.S, F = () => G.S.f;
  const gold$ = n => `<b style="color:#ffd36a">${n}</b>`;
  const day = () => (typeof Cal !== 'undefined' ? Cal.day() : 1);
  const week = () => Math.floor((day() - 1) / 7);
  const rare = () => { try { return WorldPlus4.giveRare(); } catch (e) { return null; } };
  const rng = seed => () => { seed = (seed * 1664525 + 1013904223) % 4294967296; return seed / 4294967296; };
  const sleep = ms => new Promise(r => setTimeout(r, ms));
  const sheet = draw => { const one = document.createElement('canvas'); one.width = one.height = 64; const x = one.getContext('2d'); draw(x); const S = document.createElement('canvas'); S.width = 64 * 9; S.height = 64 * 12; const s = S.getContext('2d'); for (let r = 0; r < 12; r++) for (let f = 0; f < 9; f++) s.drawImage(one, f * 64, r * 64); return S; };
  const R = (x, c, a, b, w, h) => { x.fillStyle = c; x.fillRect(a, b, w, h); };
  const lazy = fn => { let S; return () => S || (S = sheet(fn)); };
  const blank = lazy(() => { });
  const tentImg = lazy(x => { R(x, 'rgba(0,0,0,.3)', 6, 58, 52, 5); R(x, '#8a2a2a', 8, 24, 48, 36); R(x, '#e8d8a8', 18, 24, 8, 36); R(x, '#e8d8a8', 38, 24, 8, 36); R(x, '#6a1a1a', 4, 18, 56, 8); R(x, '#ffd36a', 30, 4, 4, 16); R(x, '#ffd36a', 34, 6, 10, 6); R(x, '#3a2a1a', 26, 44, 12, 16); });
  const booth = lazy(x => { R(x, 'rgba(0,0,0,.3)', 8, 58, 48, 5); R(x, '#5a3a20', 10, 36, 44, 22); R(x, '#8a5a30', 8, 32, 48, 6); R(x, '#2a6a3a', 10, 10, 44, 10); R(x, '#e8d8a8', 12, 12, 40, 6); R(x, '#ffd36a', 16, 42, 6, 6); R(x, '#ffd36a', 26, 44, 6, 4); R(x, '#d8d8d8', 40, 42, 8, 8); });
  const mirrorImg = lazy(x => { R(x, 'rgba(0,0,0,.35)', 10, 56, 44, 6); R(x, '#2a2236', 14, 8, 36, 50); R(x, '#4a3e66', 16, 10, 32, 46); R(x, '#9ad8ff', 20, 14, 24, 38); R(x, '#d8f0ff', 24, 18, 6, 20); R(x, '#c58aff', 36, 34, 4, 10); });
  const crackImg = lazy(x => { R(x, 'rgba(0,0,0,.35)', 8, 54, 48, 8); R(x, '#2a1a3a', 12, 36, 40, 20); R(x, '#4a3a5a', 16, 30, 32, 10); R(x, '#c58aff', 30, 22, 4, 30); R(x, '#c58aff', 24, 30, 8, 3); R(x, '#c58aff', 34, 40, 10, 3); R(x, '#f0d8ff', 31, 26, 2, 20); R(x, '#e8c870', 20, 44, 6, 6); });
  const btAnim = () => (BT_ROW.combat !== undefined ? 'combat' : BT_ROW.idle !== undefined ? 'idle' : Object.keys(BT_ROW)[0]);

  /* ================= ARENA BETTING ================= */
  const POOL = ['m_goblin', 'bandit', 'm_orc', 'm_lizard', 'm_tusker', 'm_troll', 'm_minotaur', 'm_drake', 'm_ghoul', 'm_skeleton', 'm_vampire', 'm_ratfolk', 'm_goblin_shaman', 'm_wartotaur', 'm_gourd'];
  const pow = k => { const E = ENEMY[k]; return Math.pow(E.hp * E.atk * (1 + (E.def || 0) / 20), .6); };
  function card(d) {
    d = d || day(); const r = rng(d * 7919 + 13), L = POOL.filter(k => ENEMY[k]), out = [];
    for (let i = 0; i < 3 && L.length > 1; i++) { const a = L[Math.floor(r() * L.length)]; let b = a; while (b === a) b = L[Math.floor(r() * L.length)];
      const pa = pow(a), pb = pow(b), p = Math.min(.85, Math.max(.15, pa / (pa + pb))); out.push({ a, b, p, oa: Math.max(1.1, Math.round(.92 / p * 10) / 10), ob: Math.max(1.1, Math.round(.92 / (1 - p) * 10) / 10) }); }
    return out;
  }
  const bk = () => { const S = S_(); if (!S.bets || S.bets.day !== day()) S.bets = { day: day(), done: {}, net: (S.bets && S.bets.net) || 0 }; return S.bets; };
  const hash = n => { const x = Math.sin(n * 12.9898 + 78.233) * 43758.5453; return x - Math.floor(x); };
  const betWinner = (d, i) => { const m = card(d)[i]; return m ? hash(d * 31 + i * 7 + 3) < m.p : true; };   // seeded, so a seer can know it
  async function bookie() {
    const C = card(), B = bk();
    const opts = C.map((m, i) => `${ENEMY[m.a].name} vs ${ENEMY[m.b].name}${B.done[i] ? ' — settled' : ` (×${m.oa} / ×${m.ob})`}`);
    const ch = await ask(null, null, `Odds-Marta licks her pencil. "Three bouts on the card today, love. Pick one, pick a side, show me the colour of your gold." (Your book: ${B.net >= 0 ? '+' : ''}${B.net}g)`, [...opts, 'Leave']);
    const m = C[ch]; if (!m) return; if (B.done[ch]) { await narr('"That one\'s settled. Sand\'s already been raked."'); return; }
    const side = await ask(null, null, `${ENEMY[m.a].name} pays ×${m.oa}. ${ENEMY[m.b].name} pays ×${m.ob}. Who's your money on?`, [ENEMY[m.a].name, ENEMY[m.b].name, 'Back out']); if (side > 1 || side < 0) return;
    const stakes = [10, 50, 100, 250].filter(s => G.S.gold >= s); if (!stakes.length) { await narr('"Come back with coin, sweetheart."'); return; }
    const si = await ask(null, null, 'Your stake?', [...stakes.map(s => s + 'g'), 'Back out']); const stake = stakes[si]; if (!stake) return;
    G.S.gold -= stake; UI.hud(); B.done[ch] = 1; save();
    const aWins = betWinner(day(), ch), won = (side === 0) === aWins, odds = side === 0 ? m.oa : m.ob;
    await simFight(m.a, m.b, aWins);
    if (won) { const pay = Math.round(stake * odds); G.S.gold += pay; B.net += pay - stake; UI.hud(); sfx('level'); if (window.Deep) Deep.cheer(); await narr(`${ENEMY[aWins ? m.a : m.b].name} wins! Odds-Marta counts out ${gold$(pay + ' gold')} with a sigh you can hear from the stands.`); }
    else { B.net -= stake; if (window.Deep) Deep.roar(.4); await narr(`${ENEMY[aWins ? m.a : m.b].name} wins. Your ${stake} gold disappears into Odds-Marta's apron. "Better luck, love."`); }
    save();
  }
  function simFight(ka, kb, aWins) {
    return new Promise(async res => {
      let ia = null, ib = null; try { ia = await npcImg(ENEMY[ka].img || ka); ib = await npcImg(ENEMY[kb].img || kb); } catch (e) { }
      const ov = Food.overlay(`<h3>⚔️ ${ENEMY[ka].name} <span class="muted">vs</span> ${ENEMY[kb].name}</h3><canvas id="betc" width="320" height="180" style="background:#c8a46a;border-radius:8px"></canvas><div id="betm" class="muted" style="text-align:center;height:16px"></div>`);
      const cv = ov.querySelector('#betc'), c = cv.getContext('2d'); c.imageSmoothingEnabled = false;
      let ha = 1, hb = 1, t0 = performance.now(), hitA = 0, hitB = 0, turn = 0; const an = btAnim();
      // a scripted fight: the loser's bar drains to zero, the winner's stops somewhere above it
      const endA = aWins ? .15 + Math.random() * .5 : 0, endB = aWins ? 0 : .15 + Math.random() * .5, N = 6;
      const tick = () => {
        const t = performance.now() - t0; c.fillStyle = '#c8a46a'; c.fillRect(0, 0, 320, 180); c.fillStyle = '#b08a50'; for (let i = 0; i < 9; i++) c.fillRect((i * 41) % 320, 150 + (i % 3) * 8, 20, 3);
        c.fillStyle = 'rgba(0,0,0,.25)'; c.beginPath(); c.ellipse(90, 150, 30, 7, 0, 0, 7); c.ellipse(230, 150, 30, 7, 0, 0, 7); c.fill();
        const fr = Math.floor(t / 160) % 4;
        try { if (ia) { c.save(); c.translate(90 + (hitA > 0 ? -6 : 0), 0); c.scale(-1, 1); drawBT(c, ia, an, fr, 0, 158, .9); c.restore(); }
          if (ib) drawBT(c, ib, an, fr, 230 + (hitB > 0 ? 6 : 0), 158, .9); } catch (e) { }
        const bar = (x, h, col) => { c.fillStyle = '#2a1a10'; c.fillRect(x, 12, 110, 9); c.fillStyle = col; c.fillRect(x + 1, 13, 108 * Math.max(0, h), 7); };
        bar(30, ha, '#46d07a'); bar(180, hb, '#e05a4a');
        if (hitA > 0) { hitA -= 16; c.fillStyle = 'rgba(255,255,255,.7)'; c.fillRect(70, 80, 40, 6); } if (hitB > 0) { hitB -= 16; c.fillStyle = 'rgba(255,255,255,.7)'; c.fillRect(210, 80, 40, 6); }
        const step = Math.floor(t / 520);
        if (step > turn && turn < N) { turn = step; const k = turn / N; if (turn % 2) { hb = 1 - (1 - endB) * k; hitB = 200; } else { ha = 1 - (1 - endA) * k; hitA = 200; } if (window.Deep && turn % 2) Deep.roar(.15); }
        if (turn >= N) { ha = endA; hb = endB; const m = ov.querySelector('#betm'); if (m) m.textContent = (aWins ? ENEMY[ka].name : ENEMY[kb].name) + ' wins!'; }
        if (t < 520 * N + 1200) requestAnimationFrame(tick); else { Food.closeOv(); res(); }
      };
      requestAnimationFrame(tick);
    });
  }

  /* ================= SPONSORS ================= */
  const SPONSORS = {
    millers: ['The Ashford Millers', '+25% on every cup purse', 'Flour-white banners. They pay well and they pay on time.'],
    anglers: ['The Saltreed Anglers', '3 bait and a fish meal for every cup won', 'Blue and silver. Fishermen love a brawler.'],
    smiths: ['The Guild Smiths', 'a rare part for every Silver or Gold Cup', 'Iron-grey. They want their name on a winner.']
  };
  async function sponsorTent() {
    const A = S_().arena = S_().arena || { cups: {}, wins: 0, champWeek: -1 }, cur = A.sponsor;
    const keys = Object.keys(SPONSORS);
    const ch = await ask(null, null, `The sponsors' tent. Three houses want their colours on the sand.${cur ? ` You wear the colours of ${SPONSORS[cur][0]}.` : ''}`, [...keys.map(k => `${SPONSORS[k][0]} — ${SPONSORS[k][1]}${k === cur ? ' ✓' : ''}`), 'Leave']);
    const k = keys[ch]; if (!k || k === cur) return;
    if (cur) { const c2 = await ask(null, null, `${SPONSORS[cur][0]} won't be pleased. Switching costs 100 gold in broken-contract fees.`, ['Pay 100g', 'Stay loyal']); if (c2 !== 0) return; if (G.S.gold < 100) { await narr('You can\'t cover the fee.'); return; } G.S.gold -= 100; UI.hud(); }
    A.sponsor = k; sfx('blip'); save(); await narr(`${SPONSORS[k][2]} You're fighting in their colours now — ${SPONSORS[k][1]}.`);
  }
  async function onCup(cup, first) {
    const A = S_().arena || {}, sp = A.sponsor; if (!sp) return;
    if (sp === 'millers') { const g = Math.round((first ? cup.prize : cup.prize / 3) * .25); G.S.gold += g; UI.hud(); toast(`🌾 The Millers add ${g} gold.`, 2600); }
    if (sp === 'anglers') { G.S.bait = (G.S.bait || 0) + 3; try { Food.addMeal('grilled:2'); } catch (e) { } toast('🎣 The Anglers send 3 bait and a hot meal.', 2600); }
    if (sp === 'smiths' && cup.id !== 'bronze') { const x = rare(); if (x) toast(`⚒️ The Smiths send a ${x}.`, 2600); }
    A.sponsorWins = (A.sponsorWins || 0) + 1; save();
  }

  /* ================= SPREADING CRACKS ================= */
  const CRACK_AT = [1, 2, 4, 6, 9, 12];
  function udSpots() {
    const D = FCL.ud_deep.deep, M = G.maps.ud_deep, seen = new Set([D.start.join()]), q = [D.start], out = [];
    const keep = [...Object.values(D.pocket), ...Object.values(D.arrive), ...Object.values(D.dun), ...D.murals, D.sovereign, D.lore, D.well, D.gar, D.start, ...(FCL.ud_deep.chests || [])];
    while (q.length) { const [x, y] = q.shift(); for (const [dx, dy] of [[1, 0], [-1, 0], [0, 1], [0, -1]]) { const nx = x + dx, ny = y + dy, k = nx + ',' + ny; if (seen.has(k) || !M.col[ny] || M.col[ny][nx] != 0) continue; seen.add(k); q.push([nx, ny]); out.push([nx, ny]); } }
    const open = ([x, y]) => [[1, 0], [-1, 0], [0, 1], [0, -1], [1, 1], [-1, -1], [1, -1], [-1, 1]].every(([dx, dy]) => M.col[y + dy] && M.col[y + dy][x + dx] == 0);
    const r = rng(4242), pick = []; const cand = out.filter(p => open(p) && keep.every(k => k && Math.abs(k[0] - p[0]) + Math.abs(k[1] - p[1]) > 4));
    while (pick.length < CRACK_AT.length && cand.length) { const p = cand.splice(Math.floor(r() * cand.length), 1)[0]; if (pick.every(q2 => Math.abs(q2[0] - p[0]) + Math.abs(q2[1] - p[1]) > 10)) pick.push(p); }
    return pick;
  }
  let SPOTS = null; const spots = () => SPOTS || (SPOTS = udSpots());
  const closed = () => S_().gatesClosed || 0;
  function countGate() {
    const g = S_().gateEv; if (!g || !g.looted || g.counted) return; g.counted = 1; S_().gatesClosed = closed() + 1;
    const n = CRACK_AT.filter(k => k <= closed()).length, prev = CRACK_AT.filter(k => k <= closed() - 1).length;
    if (n > prev) toast('<b style="color:#c58aff">Far below, the Underdeep groans.</b> A new fracture has opened.', 3600); save();
  }
  async function fracture(i) {
    const F2 = S_().fractures = S_().fractures || {}; if (F2[i]) { await narr('A healed scar in the stone. The light down here is a little brighter for it.'); return; }
    await narr('A fresh crack in the void. New stone has drifted up from somewhere deeper — and something came up with it.');
    const keys = (window.Deep && Deep.voidParty) ? Deep.voidParty() : ['m_skeleton']; if (keys.length < 2 && i >= 2 && Deep.voidParty) keys.push(...Deep.voidParty());
    const r = await Battle.start({ enemies: keys, noFlee: true, bd: 'underdeep', music: 'boss', intro: 'FRACTURE GUARDIAN' });
    if (r === 'lose') { await Story.defeat(); return; } if (r !== 'win') return;
    F2[i] = 1; const g = 150 + i * 60; G.S.gold += g; const x = rare(); UI.hud(); sfx('level');
    const e = World.ents.find(n => n.id === 'udcrack' + i); if (e) e.name = '';
    await narr(`Wedged in the new stone: an old Drag cache. ${gold$(g + ' gold')}${x ? ` and a ${gold$(x)}` : ''}.`); save();
  }

  /* ================= MURAL RUBBINGS ================= */
  async function onMural(n) {
    const rub = S_().rubbings = S_().rubbings || {}; if (rub[n]) return;
    const c = await ask(null, null, 'You have a sheet of paper and a stick of charcoal. Take a rubbing of the fresco?', ['Take a rubbing', 'Leave it']);
    if (c !== 0) return; rub[n] = 'held'; sfx('blip'); toast('📜 Rubbing taken — the archivist in Ashford will want this.', 2600); save();
  }
  const ARCH = ['"First Dawn. We had this one as a myth. You\'ve just made it history."', '"The Shield. The humans BEHIND them. Do you know how many books I\'d have to burn to make this untrue?"',
    '"Fratenaptor. They carved its name so no one would forget. And we forgot anyway."', '"A hundred faces. I\'ll count them tonight. I\'ll learn every one."',
    '"The Accord. The chains under the table. My hands are shaking — get me a chair."', '"The Scattering. The paint is angrier. Yes. Yes, it would be."',
    '"The Gates are wounds. Then everything the Guild teaches about them is… oh, gods."', '"The Green-Eyed Child. And the rest of the wall is blank." She looks at your eyes for a long time.'];
  async function archivist() {
    const rub = S_().rubbings = S_().rubbings || {}, held = Object.keys(rub).filter(k => rub[k] === 'held').map(Number).sort();
    const done = Object.keys(rub).filter(k => rub[k] === 'given').length;
    if (!held.length) { await narr(`Archivist Pell peers over her spectacles. "Rubbings. Of the old frescoes. Paper, charcoal, patience — bring me what's on the walls down there." (${done} / 8 delivered)`); return; }
    for (const n of held) { rub[n] = 'given'; G.S.gold += 60; const M = window.Deep && Deep.MURALS[n]; await narr(`${ARCH[n - 1] || (M ? M[0] : 'A rubbing')} (+60 gold)`); }
    UI.hud(); sfx('blip');
    const all = Object.keys(rub).filter(k => rub[k] === 'given').length;
    if (all >= 8 && !F().archive) { F().archive = 1; G.S.gold += 400; const a = rare(); UI.hud(); sfx('level'); await narr(`"The whole Chronicle. On paper. Where the Guild can't chisel it." Pell presses a key into your hand — the archive's back room. ${gold$('400 gold')}${a ? ` and a ${gold$(a)}` : ''}.`); }
    save();
  }

  /* ================= VOID FISHING ================= */
  if (window.Fishing && Fishing.FISH) {
    const FI = Fishing.FISH;
    for (const f of Object.values(FI)) if (f[3] && f[3].source === '.') f[3] = /^(?!underdeep$)/;
    Object.assign(FI, {
      starling: ['Starling Eel', 3, [.6, 2], /underdeep/, '', 24, ['#2a1a4a', '#c58aff', '#8a5aff', '#ffffff'], 'eel', 40],
      riftkoi: ['Rift Koi', 3, [1, 3], /underdeep/, '', 20, ['#3a2a5a', '#e8d8ff', '#c58aff', '#46ff95'], 'koi', 45],
      lantern: ['Hollow Lantern', 4, [.5, 1.5], /underdeep/, '', 12, ['#1a1030', '#40306a', '#ffd36a', '#fff0a0'], 'glow', 70],
      voidray: ['Void Ray', 4, [4, 10], /underdeep/, '', 9, ['#120a20', '#5a3a8a', '#2a1a4a', '#c58aff'], 'ray', 85],
      voidgar: ['Void Gar', 5, [20, 45], /underdeep/, '', 2, ['#1a1028', '#6a5a8a', '#2a1a3a', '#c58aff'], 'scales', 220]
    });
    if (window.Food) for (const k of ['starling', 'riftkoi', 'lantern', 'voidray', 'voidgar']) { const f = FI[k]; Food.ING[k] = [f[0], k === 'voidgar' ? 'legend' : 'fish', f[8], [f[6][0], f[6][1], f[6][2]], 'fish']; }
  }

  /* ================= ECHO DUELS ================= */
  const ECHO_AT = [60, 41];
  function echoTint(img) { const c = document.createElement('canvas'); c.width = img.width; c.height = img.height; const x = c.getContext('2d'); x.drawImage(img, 0, 0); x.globalCompositeOperation = 'source-atop'; x.fillStyle = 'rgba(120,60,220,.45)'; x.fillRect(0, 0, c.width, c.height); return c; }
  async function mirror() {
    const S = S_(); if (S.echoWeek === week()) { await narr('The Mirror Pool is still. Your reflection looks tired. It\'s not coming out again this week.'); return; }
    const c = await ask(null, null, 'A pool of standing light. Your reflection doesn\'t copy you — it waits. Then it draws its blade.', ['Fight your echo', 'Step back']); if (c !== 0) return;
    const st = G.S.stats, me = playerImg(); G.img.__echo_me = echoTint(me);
    ENEMY.echo_me = { name: 'Echo of ' + G.S.name, img: '__echo_me', hp: Math.round(st.maxHp * 1.1), atk: st.atk + 2, def: st.def, spd: st.spd, xp: 60 + st.maxHp, gold: 0, boss: 1, fixed: 1, trait: 'Your reflection · it knows every move you know' };
    const en = ['echo_me'];
    for (const id of (G.S.party || []).slice(0, 2)) { const A = ALLY[id]; if (!A) continue; try { const im = await npcImg(A.sprite); G.img['__echo_' + id] = echoTint(im); } catch (e) { continue; }
      ENEMY['echo_' + id] = { name: 'Echo of ' + A.name, img: '__echo_' + id, hp: A.hp + 10, atk: A.atk + 1, def: A.def, spd: A.spd, xp: 30, gold: 0, fixed: 1, trait: 'A reflection of your friend · it doesn\'t like you' }; en.push('echo_' + id); }
    const r = await Battle.start({ enemies: en, boss: true, noFlee: true, bd: 'underdeep', music: 'boss', intro: 'YOUR ECHO' });
    S.echoWeek = week(); save();
    if (r !== 'win') { Story.heal(true); await narr('Your echo lowers its blade and steps back into the pool. It looked — almost — disappointed.'); return; }
    S.echoWins = (S.echoWins || 0) + 1; const g = 200 + S.echoWins * 50; G.S.gold += g; const x = rare(); UI.hud(); sfx('level');
    const L = ['"Not bad," says your echo, dissolving. "Same time next week."', '"You\'re getting faster," your echo says. "So am I."', '"I remember being you before the eyes," it whispers. Then it\'s gone.'];
    await narr(`${L[(S.echoWins - 1) % L.length]} ${gold$(g + ' gold')}${x ? ` and a ${gold$(x)}` : ''}.`);
    if (S.echoWins === 5) { S.title = 'Unbroken Reflection'; toast('🪞 TITLE EARNED — <b>UNBROKEN REFLECTION</b>', 3400); } save();
  }

  /* ================= hooks ================= */
  const _load = World.load.bind(World);
  World.load = async function (name, ...a) {
    try { countGate(); } catch (e) { }
    const r = await _load(name, ...a);
    try {
      const W = World;
      if (name === 'arena') {
        W.ents.push(new Ent({ id: 'bookie', x: 20, y: 27, dir: 'down', img: booth(), name: "Odds-Marta's book", talk: bookie }));
        W.ents.push(new Ent({ id: 'sponsors', x: 36, y: 27, dir: 'down', img: tentImg(), size: 1.4, name: "Sponsors' tent", talk: sponsorTent }));
      }
      if (name === 'underdeep') {
        W.ents.push(new Ent({ id: 'echopool', x: ECHO_AT[0], y: ECHO_AT[1], dir: 'down', img: mirrorImg(), name: 'The Mirror Pool', talk: mirror }));
        W.lights.push({ x: ECHO_AT[0] * TILE + 16, y: ECHO_AT[1] * TILE, r: 110, c: '150,210,255' });
        const n = CRACK_AT.filter(k => k <= closed()).length, P = spots(), F2 = S_().fractures || {};
        for (let i = 0; i < n && i < P.length; i++) { W.ents.push(new Ent({ id: 'udcrack' + i, x: P[i][0], y: P[i][1], dir: 'down', img: crackImg(), name: F2[i] ? '' : 'A fresh fracture', talk: () => fracture(i) })); W.col[P[i][1]][P[i][0]] = 1;
          W.lights.push({ x: P[i][0] * TILE + 16, y: P[i][1] * TILE, r: 90, c: '200,120,255' }); }
      }
    } catch (e) { console.warn('deep2', e); }
    return r;
  };
  if (window.TownLife && TownLife.services) TownLife.services.push({ label: 'Archivist Pell (mural rubbings)', run: archivist });
  if (window.Deep) Object.assign(Deep, { onMural, onCup, bookie, card, betWinner, sponsorTent, fracture, archivist, mirror, spots, countGate });
})();
