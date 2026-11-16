'use strict';
/* ================= WORLD+ 14 (Chat B — World & Maps) =================
   ARENA SEASONS — a 28-day ladder against nine named rivals. Cups and champion wins earn points; season's end pays out.
   CROWD FAVOURITE — win an arena bout without a scratch, or with a string of perfect hits, and the stands chant your name.
   UNDERDEEP STORMS — some days a void storm darkens whole bridges of light. Find another way round.
   DRAG GHOSTS — a pale Drag spirit drifts through the deep. Follow it three times and it shows you a hidden mural sketch.
   RIFT RECIPES — void monsters drop Void Salt; cook it into three new dishes.
   THE ARCHIVE — Pell's back room (after all 8 rubbings): lore books and a living map of every Gate that has opened.
   GATE FORECASTS — Madame Oyelle, the seer, tells you which forest will tear open next (and she's right).
   (Lines are B drafts — Chat A may rewrite.) */
(function () {
  const S_ = () => G.S, F = () => G.S.f;
  const gold$ = n => `<b style="color:#ffd36a">${n}</b>`;
  const day = () => (typeof Cal !== 'undefined' ? Cal.day() : 1);
  const rare = () => { try { return WorldPlus4.giveRare(); } catch (e) { return null; } };
  const rng = seed => () => { seed = (seed * 1664525 + 1013904223) % 4294967296; return seed / 4294967296; };
  const cam = () => [Math.round(World.cam.x), Math.round(World.cam.y)];
  const FOREST = { n: 'Mistveil Pines (north)', e: 'Emberroot Wilds (east)', s: 'Glimmerfen (south)', w: 'the Old Grove (west)' };

  /* ================= ARENA SEASONS ================= */
  const SEASON = 28;
  const RIVALS = [['Varro the Unbroken', 30, 1.5], ['Sable Vey', 12, 1.3], ['Grell Ironhand', 20, 1.0], ['The Marrow Twins', 8, 1.25], ['Kestra Flint', 15, .95],
    ['Duskmane', 4, 1.15], ['Brother Ash', 10, .8], ['Lady Coin', 6, .9], ['Old Hob', 18, .5]];
  const sid = () => Math.floor((day() - 1) / SEASON), sday = () => ((day() - 1) % SEASON) + 1;
  const rivalPts = (r, d) => Math.round(r[1] + r[2] * d * (1 + .15 * Math.sin(d / 3 + r[1])));
  function season() {
    const S = S_(); let A = S.arenaSeason;
    if (!A) A = S.arenaSeason = { sid: sid(), pts: 0, best: null };
    if (A.sid !== sid()) { A.pending = { sid: A.sid, pts: A.pts }; A.sid = sid(); A.pts = 0; }
    return A;
  }
  function table(pts, d) { return [...RIVALS.map(r => [r[0], rivalPts(r, d)]), [G.S.name || 'You', pts, 1]].sort((a, b) => b[1] - a[1]); }
  async function settle() {
    const A = season(); if (!A.pending) return; const P = A.pending; delete A.pending; if (!P.pts) { save(); return; }
    const T = table(P.pts, SEASON), rank = T.findIndex(r => r[2]) + 1;
    const g = rank === 1 ? 1000 : rank <= 3 ? 400 : 100; G.S.gold += g; const x = rank <= 3 ? rare() : null; UI.hud(); sfx('level');
    A.best = A.best ? Math.min(A.best, rank) : rank;
    if (rank === 1 && !F().seasonChamp) { F().seasonChamp = 1; G.S.title = 'Sunhigh Season Champion'; toast('🏆 TITLE EARNED — <b>SUNHIGH SEASON CHAMPION</b>', 3400); }
    await narr(`<b>THE SEASON IS OVER.</b> You finished <b>${rank}${['st', 'nd', 'rd'][rank - 1] || 'th'}</b> of ten with ${P.pts} points. The arena pays ${gold$(g + ' gold')}${x ? ` and a ${gold$(x)}` : ''}.`); save();
  }
  function addPts(n, why) { const A = season(); A.pts += n; toast(`🏅 +${n} season points${why ? ' — ' + why : ''} (${A.pts})`, 2200); save(); }
  async function ladder() {
    await settle(); const A = season(), T = table(A.pts, sday());
    const rows = T.map((r, i) => `<div class="row" style="${r[2] ? 'color:#ffd36a;font-weight:700' : ''}"><span style="width:22px">${i + 1}.</span><span style="flex:1">${r[0]}</span><b>${r[1]}</b></div>`).join('');
    const a = S_().arena || { cups: {} };
    await new Promise(res => { const ov = Food.overlay(`<h3>🏟️ Sunhigh Season ${A.sid + 1} <span class="muted">— day ${sday()} of ${SEASON}</span></h3>${rows}
      <div class="muted" style="margin-top:6px">Points: Bronze Cup 3 · Silver 6 · Gold 10 · beating Varro 8 · crowd favourite 2. Season's end: 1st 1000g + title, top three 400g.<br>
      Cups won — Bronze ${a.cups.bronze || 0} · Silver ${a.cups.silver || 0} · Gold ${a.cups.gold || 0}. Bouts won: ${a.wins || 0}.${A.best ? ` Best finish: ${A.best}.` : ''}</div>
      <div style="text-align:right;margin-top:6px"><button id="lzOk">Close</button></div>`); ov.querySelector('#lzOk').addEventListener('click', e => { e.stopPropagation(); Food.closeOv(); res(); }); });
  }

  /* ================= CROWD FAVOURITE ================= */
  let fight = null;
  const _bs = Battle.start.bind(Battle);
  Battle.start = async function (cfg, ...more) {
    const arena = G.S && G.S.map === 'arena' && cfg && cfg.bd === 'arena';
    const voidy = cfg && (cfg.enemies || []).some(k => /^(void_|deep_)/.test(k));
    let poll = null; if (arena) { fight = { t0: performance.now(), st: null }; poll = setInterval(() => { if (Battle.B && Battle.B.st) fight.st = Object.assign({}, Battle.B.st); }, 150); }
    const r = await _bs(cfg, ...more);
    if (poll) clearInterval(poll);
    try {
      if (r === 'win' && arena && fight && fight.st) {
        const st = fight.st, secs = (performance.now() - fight.t0) / 1000;
        const why = !st.hurt ? 'not a scratch on you' : st.perf >= 4 ? `${st.perf} perfect hits` : secs < 25 ? 'over in a heartbeat' : null;
        if (why) { const g = 25 + (st.perf || 0) * 5; G.S.gold += g; UI.hud(); if (window.Deep) Deep.cheer(1); toast(`📣 <b>THE CROWD CHANTS "${(G.S.name || 'REN').toUpperCase()}!"</b> — ${why}. +${g} gold`, 3000);
          S_().crowdFav = (S_().crowdFav || 0) + 1; addPts(2, 'crowd favourite');
          if (S_().crowdFav === 10) { G.S.title = 'Darling of the Sand'; toast('🌹 TITLE EARNED — <b>DARLING OF THE SAND</b>', 3400); } }
      }
      if (r === 'win' && voidy && window.Food && Math.random() < .6) { Food.addIng('voidsalt', 1); toast('🧂 Void Salt — it glitters like a crushed night sky.', 2400); }
    } catch (e) { }
    fight = null; return r;
  };
  if (window.Deep) {
    const _oc = Deep.onCup; Deep.onCup = async (cup, first) => { if (_oc) await _oc(cup, first); addPts({ bronze: 3, silver: 6, gold: 10 }[cup.id] || 3, cup.name); };
    Deep.onChamp = async () => addPts(8, 'beat Varro');
  }

  /* ================= RIFT RECIPES ================= */
  if (window.Food) {
    Food.ING.voidsalt = ['Void Salt', 'void', 40, ['#3a1a5a', '#c58aff', '#f0d8ff'], 'jar'];
    Object.assign(Food.DISH, {
      abyssal: ['Abyssal Chowder', { hp: .6, mp: 15, def: .2 }, 'bowl', ['#3a2a5a', '#c58aff']],
      starglaze: ['Starglazed Roast', { hp: .6, atk: .2, spd: .1 }, 'plate', ['#5a2a8a', '#ffd36a']],
      riftbroth: ['Rift Broth', { mp: 16, def: .1 }, 'bowl', ['#2a1a4a', '#9a6aff']]
    });
    Food.RECIPES.push(['abyssal', ['void', 'fish'], 88], ['starglaze', ['void', 'meat'], 88], ['riftbroth', ['void'], 45]);
  }

  /* ================= UNDERDEEP STORMS ================= */
  let dark = new Set();
  function bridgeGroups() {
    const B = FCL.ud_deep.bridges || [], set = new Set(B.map(p => p.join())), seen = new Set(), out = [];
    for (const p of B) { const k = p.join(); if (seen.has(k)) continue; const g = [], q = [p]; seen.add(k);
      while (q.length) { const [x, y] = q.shift(); g.push([x, y]); for (const [dx, dy] of [[1, 0], [-1, 0], [0, 1], [0, -1]]) { const n = (x + dx) + ',' + (y + dy); if (set.has(n) && !seen.has(n)) { seen.add(n); q.push([x + dx, y + dy]); } } }
      if (g.length >= 5) out.push(g); }
    return out;
  }
  function reachAll(col, from, need) {
    const seen = new Set([from.join()]), q = [from];
    while (q.length) { const [x, y] = q.shift(); for (const [dx, dy] of [[1, 0], [-1, 0], [0, 1], [0, -1]]) { const nx = x + dx, ny = y + dy, k = nx + ',' + ny; if (seen.has(k) || !col[ny] || col[ny][nx] !== 0) continue; seen.add(k); q.push([nx, ny]); } }
    return need.every(p => seen.has(p.join()));
  }
  function storm(W) {
    dark = new Set(); const r = rng(day() * 31337 + 7); if (r() > .4) return false;
    const D = FCL.ud_deep.deep, groups = bridgeGroups(), p = [W.player.x, W.player.y];
    const need = [[D.well[0], D.well[1] + 1], D.start];   // you can always get back to the well — the rest of the deep may be cut off for the day
    let cut = 0;
    for (let tries = 0; tries < 12 && cut < 2 && groups.length; tries++) {
      const g = groups.splice(Math.floor(r() * groups.length), 1)[0]; if (g.some(q => q[0] === p[0] && q[1] === p[1])) continue;
      for (const [x, y] of g) W.col[y][x] = 1;
      if (reachAll(W.col, p, need)) { cut++; for (const q of g) dark.add(q.join()); } else for (const [x, y] of g) W.col[y][x] = 0;
    }
    return cut > 0;
  }
  function drawStorm(c, t) {
    if (!dark.size) return; const [cx, cy] = cam();
    for (const k of dark) { const [x, y] = k.split(',').map(Number), X = x * TILE - cx, Y = y * TILE - cy; if (X < -TILE || Y < -TILE || X > G.view.w || Y > (G.view.fullH || G.view.h)) continue;
      c.fillStyle = 'rgba(8,2,18,.86)'; c.fillRect(X, Y, TILE, TILE);
      if (Math.sin(t / 90 + x * 3.1 + y * 1.7) > .93) { c.strokeStyle = 'rgba(200,140,255,.8)'; c.lineWidth = 1.5; c.beginPath(); c.moveTo(X + 4, Y + 6); c.lineTo(X + 16, Y + 18); c.lineTo(X + 10, Y + 22); c.lineTo(X + 26, Y + 28); c.stroke(); } }
  }

  /* ================= DRAG GHOSTS ================= */
  const SKETCH = [
    [2, 'An early draft of the Shield. In this one, the humans are not behind the Drags — they are holding hands with them. Someone painted over it.'],
    [4, 'The Binding, first version: only one Drag face is finished. A child. The painter wrote beside it: "MINE."'],
    [6, 'The Scattering, sketched in a hurry. A Guild seal in the corner — not painted. Pressed in, like a stamp of approval.'],
    [8, 'The Green-Eyed Child, but older. Grown. Standing in front of a crowd of humans, arms wide — the Shield again.']];
  let floor = null;
  function floorTiles() {
    if (floor) return floor; const D = FCL.ud_deep.deep, M = G.maps.ud_deep, seen = new Set([D.start.join()]), q = [D.start]; floor = [];
    while (q.length) { const [x, y] = q.shift(); for (const [dx, dy] of [[1, 0], [-1, 0], [0, 1], [0, -1]]) { const nx = x + dx, ny = y + dy, k = nx + ',' + ny; if (seen.has(k) || !M.col[ny] || M.col[ny][nx] != 0) continue; seen.add(k); q.push([nx, ny]); floor.push([nx, ny]); } }
    const B = new Set((FCL.ud_deep.bridges || []).map(p => p.join())); floor = floor.filter(p => !B.has(p.join())); return floor;
  }
  const ghostState = () => { const S = S_(); if (!S.ghost || S.ghost.day !== day()) S.ghost = { day: day(), hop: 0, done: !!(S.ghost && S.ghost.day === day() && S.ghost.done) }; return S.ghost; };
  function ghostSpot(h) { const L = floorTiles(), r = rng(day() * 977 + h * 131), W = World;
    for (let i = 0; i < 40; i++) { const p = L[Math.floor(r() * L.length)]; if (W.col[p[1]][p[0]] === 0 && !W.ents.some(e => e.x === p[0] && e.y === p[1]) && Math.abs(p[0] - W.player.x) + Math.abs(p[1] - W.player.y) > 6) return p; } return null; }
  async function ghostTalk(e) {
    const g = ghostState(), S = S_(); S.sketches = S.sketches || [];
    const next = SKETCH.findIndex((s, i) => !S.sketches.includes(i));
    if (g.hop < 2) {
      const L = ['The ghost of a Drag woman looks at you — at your eyes — and smiles. Then she turns, and drifts away. She wants you to follow.', 'She is waiting for you, further on. She touches the stone as if she remembers it warm.'];
      await narr(L[g.hop]); g.hop++; const p = ghostSpot(g.hop); if (p) { e.x = p[0]; e.y = p[1]; e.px = p[0] * TILE + 16; e.py = p[1] * TILE + 26; } save(); return;
    }
    g.done = 1; World.ents = World.ents.filter(n => n !== e);
    if (next < 0) { await narr('The ghost presses your hand to the stone — there is nothing more to show. She fades, content.'); save(); return; }
    S.sketches.push(next); const [m, txt] = SKETCH[next]; sfx('blip');
    await new Promise(res => { const ov = Food.overlay(`<h3>✏️ A hidden sketch <span class="muted">(${S.sketches.length} of 4)</span></h3>
      <img src="assets/mural_${m}.jpg" style="max-width:100%;max-height:52vh;display:block;margin:4px auto;border-radius:6px;filter:grayscale(1) sepia(.35) contrast(1.5) brightness(1.15)">
      <div style="font-style:italic;margin:8px 2px;line-height:1.45">${txt}</div><div style="text-align:right"><button id="skOk">Step back</button></div>`);
      ov.querySelector('#skOk').addEventListener('click', ev => { ev.stopPropagation(); Food.closeOv(); res(); }); });
    G.S.gold += 120; UI.hud();
    if (S.sketches.length === 4 && !F().sketches) { F().sketches = 1; const a = rare(), b = rare(); G.S.gold += 500; UI.hud(); sfx('level');
      await narr(`The ghost appears one last time, solid enough to touch. She puts something in your hand and is gone. ${gold$('500 gold')}${a ? `, a ${gold$(a)}` : ''}${b ? ` and a ${gold$(b)}` : ''}.`); }
    else await narr(`She lets go of your hand and fades. Under her fingers, the paint was still wet. (+120 gold)`);
    save();
  }
  let ghostImg = null;
  async function spawnGhost(W) {
    const g = ghostState(); if (g.done) return; const p = ghostSpot(g.hop); if (!p) return;
    if (!ghostImg) { try { const im = await npcImg('dfolk2'); const c = document.createElement('canvas'); c.width = im.width; c.height = im.height; const x = c.getContext('2d'); x.drawImage(im, 0, 0); x.globalCompositeOperation = 'source-atop'; x.fillStyle = 'rgba(150,230,255,.55)'; x.fillRect(0, 0, c.width, c.height); ghostImg = c; } catch (e) { return; } }
    W.ents.push(new Ent({ id: 'udghost', x: p[0], y: p[1], dir: 'down', img: ghostImg, alpha: .55, name: '', talk: ghostTalk }));
  }

  /* ================= THE ARCHIVE ================= */
  const BOOKS = [
    ['On the Founding of the Accord', 'An official Guild history. Every mention of the Drags has been cut out with a knife — neatly, page after page, leaving windows in the paper.'],
    ['Field Notes, Gate 1 (sealed)', '"The Gates do not open. They TEAR. And when they tear, something on the other side is already pressing against them." The last page is burned.'],
    ['A Child\'s Primer of the Old Script', 'Drag letters, with pictures. S for Shield. G for Green. H for Home. Someone has practised the letters in the margins, over and over.'],
    ['The Sovereign Below', 'A miner\'s account: "There is a throne down there. Black glass. Something sits on it and counts the Gates as they open, like coins."'],
    ['Pell\'s Own Journal', '"The rubbings match the old songs. All of them. I was taught the songs were children\'s nonsense. I am fifty-three years old and I have been lied to all my life."'],
    ['Ledger of Seals, Year 112', 'A list of Drag families "relocated" by the Guild. Next to each name, the same Guild seal. Next to the last name, in a different hand: SORRY.']];
  async function archive() {
    if (!F().archive) { await narr('Pell\'s back room is locked. "Not yet," she says. "Bring me the whole Chronicle first — all eight rubbings."'); return; }
    const S = S_(); const log = S.gateLog || [], counts = { n: 0, e: 0, s: 0, w: 0 }; for (const g of log) counts[g.b] = (counts[g.b] || 0) + 1;
    await new Promise(res => {
      const draw = tab => {
        const books = BOOKS.map((b, i) => `<div class="row" style="cursor:pointer" data-b="${i}">📖 ${b[0]}</div>`).join('');
        const ov = Food.overlay(`<h3>🕯️ The Archive</h3><div class="grid" style="margin-bottom:6px"><button id="tb0">Books</button><button id="tb1">Gate map</button><button id="tbx">Leave</button></div>
          ${tab === 0 ? `<div id="bk">${books}</div><div id="bt" style="font-style:italic;margin-top:6px;line-height:1.45"></div>` : `<canvas id="gm" width="300" height="230"></canvas><div class="muted">Every Gate you've seen open, by forest. ${S.gatesClosed || 0} closed in all.${S.gateFc ? ` Oyelle's forecast: <b>${FOREST[S.gateFc.b]}</b>.` : ''}</div>`}`);
        ov.querySelector('#tb0').addEventListener('click', e => { e.stopPropagation(); draw(0); });
        ov.querySelector('#tb1').addEventListener('click', e => { e.stopPropagation(); draw(1); });
        ov.querySelector('#tbx').addEventListener('click', e => { e.stopPropagation(); Food.closeOv(); res(); });
        ov.querySelectorAll('[data-b]').forEach(el => el.addEventListener('click', e => { e.stopPropagation(); ov.querySelector('#bt').textContent = BOOKS[+el.dataset.b][1]; }));
        const cv = ov.querySelector('#gm'); if (cv) { const c = cv.getContext('2d'); c.fillStyle = '#e8dcc0'; c.fillRect(0, 0, 300, 230); c.strokeStyle = '#8a7a5a'; c.lineWidth = 3;
          c.beginPath(); c.moveTo(150, 30); c.lineTo(150, 200); c.moveTo(40, 115); c.lineTo(260, 115); c.stroke();
          const P = { n: [150, 38], e: [258, 115], s: [150, 192], w: [42, 115] };
          for (const b in P) { const [x, y] = P[b], fc = S.gateFc && S.gateFc.b === b; c.fillStyle = { n: '#cfe0ff', e: '#ffb070', s: '#a8e0c8', w: '#a8d08a' }[b]; c.beginPath(); c.arc(x, y, 26, 0, 7); c.fill();
            if (fc) { c.strokeStyle = '#8a2aff'; c.lineWidth = 3; c.beginPath(); c.arc(x, y, 30, 0, 7); c.stroke(); }
            c.fillStyle = '#3a2a1a'; c.font = 'bold 11px system-ui'; c.textAlign = 'center'; c.fillText(FOREST[b].split(' ')[0].replace('the', 'Old'), x, y - 4); c.fillStyle = '#6a2aaa'; c.font = 'bold 14px system-ui'; c.fillText(counts[b] + ' ✦', x, y + 13); }
          c.fillStyle = '#3a2a1a'; c.font = 'bold 11px system-ui'; c.textAlign = 'center'; c.fillText('Crossroads', 150, 112);
          const recent = log.slice(-5).reverse(); c.textAlign = 'left'; c.font = '10px system-ui'; recent.forEach((g, i) => c.fillText(`day ${g.day}: ${g.b.toUpperCase()}`, 8, 160 + i * 13)); }
      };
      draw(0);
    });
  }

  /* ================= GATE FORECASTS ================= */
  async function seer() {
    const S = S_();
    if (S.gateFc) { await narr(`Madame Oyelle doesn't even look up from her cards. "I told you already, dear. ${FOREST[S.gateFc.b]}. The cards don't change their minds."`); return; }
    if (S.gateEv && !S.gateEv.done && (S.steps || 0) < S.gateEv.until) { await narr('"There\'s a tear open right now, dear — I can feel it in my teeth. Go and close it, then come back."'); return; }
    const c = await ask(null, null, 'Madame Oyelle, seer of the Lower Lanes, shuffles a deck of cards painted with trees. "Twenty gold, and I\'ll tell you where the next Gate tears."', ['Pay 20g', 'Not today']);
    if (c !== 0) return; if (G.S.gold < 20) { await narr('"Twenty, dear. The cards can count."'); return; }
    G.S.gold -= 20; UI.hud(); const b = 'nesw'[Math.floor(Math.random() * 4)]; S.gateFc = { b, day: day() }; save();
    const card = { n: 'the Frost Stag', e: 'the Burning Oak', s: 'the Drowned Lantern', w: 'the Old Root' }[b];
    await narr(`She turns a card: <b>${card}</b>. "${FOREST[b]}. Soon. Walk there and the sky will open for you."`);
  }

  /* ================= hooks ================= */
  const _render = World.render.bind(World);
  World.render = function (c, t) { _render(c, t); try { if (G.mode === 'world' && G.S.map === 'underdeep' && !World.loading) drawStorm(c, t); } catch (e) { } };
  const _load = World.load.bind(World);
  World.load = async function (name, ...a) {
    const r = await _load(name, ...a);
    try {
      const W = World;
      if (name === 'underdeep') { if (storm(W)) setTimeout(() => toast('<b style="color:#c58aff">⚡ A VOID STORM.</b> Some bridges of light have gone dark today.', 3400), 1200); else dark = new Set(); await spawnGhost(W); }
      else dark = new Set();
      if (name === 'arena') { await settle(); const b = W.ents.find(e => e.id === 'arenaboard'); if (b) { b.name = 'Season ladder'; b.talk = ladder; } }
    } catch (e) { console.warn('deep3', e); }
    return r;
  };
  if (window.TownLife && TownLife.services) TownLife.services.push({ label: 'Madame Oyelle, the seer (gate forecast — 20g)', run: seer }, { label: 'The Archive (Pell\'s back room)', run: archive });
  if (window.Deep) { Object.assign(Deep, { ladder, season, addPts, settle, storm, bridgeGroups, ghostTalk, archive, seer }); Object.defineProperty(Deep, 'dark', { configurable: true, get: () => dark }); }
})();
