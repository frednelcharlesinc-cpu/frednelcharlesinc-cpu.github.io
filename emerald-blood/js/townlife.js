'use strict';
/* ================= TOWN LIFE — Ashford Hollow (Chat B — World & Maps) =================
   - RENOWN: everything you do out there (bounties, shrines, bosses, odd jobs…) adds up. Ashford notices.
     Folk greet you by name, gossip about your deeds, and the town crier shouts them across the square.
   - THE TOWN BOARD: the wanted board has a twin by the fountain — plus ODD JOBS for the townsfolk
     (lost pets in the woods, herb orders, letters to the forest camps).
   - GOSSIP at the fountain: sit and listen, and someone lets slip a secret you haven't found yet.
   - A TRAVELLING STALL in the square by day — a different trader every week.
   - TAG: the kids will play tag with you. They're fast. Run.
   - DAY & NIGHT: by night most folk go home, windows glow, and the square goes quiet.
   - SEASONS: bunting over the square changes with the season.
   (Ambient lines are B's drafts — Chat A may rewrite any of them.) */
(function () {
  const W4 = () => window.WorldPlus4;
  const FOREST = ['woods_n', 'woods_e', 'woods_s', 'woods_w'];
  const S_ = () => G.S, F = () => G.S.f;
  const week = () => Math.floor(((typeof Cal !== 'undefined' ? Cal.day() : 1) - 1) / 7);
  const night = () => (typeof Ambient !== 'undefined' && Ambient.night) || 0;
  const sheet = draw => { const one = document.createElement('canvas'); one.width = one.height = 64; const x = one.getContext('2d'); draw(x); const S = document.createElement('canvas'); S.width = 64 * 9; S.height = 64 * 12; const s = S.getContext('2d'); for (let r = 0; r < 12; r++) for (let f = 0; f < 9; f++) s.drawImage(one, f * 64, r * 64); return S; };
  const R = (x, c, a, b, w, h) => { x.fillStyle = c; x.fillRect(a, b, w, h); };
  const pick = L => L[Math.floor(Math.random() * L.length)];
  const gold$ = n => `<b style="color:#ffd36a">${n}</b>`;
  const TOWN = 'ashford';
  const inTown = () => G.S && G.S.map === TOWN;

  /* ---------- renown ---------- */
  function renown() {
    const S = S_(), f = F(), c = (re) => Object.keys(f).filter(k => re.test(k) && f[k]).length;
    return (S.bountiesPaid || 0) * 2 + (f.sanctum ? 6 : 0) + (S.seasonKills || 0) * 3 + (S.jobsDone || 0) + (S.escortsDone || 0) * 2 + (S.rivalWins || 0) * 2
      + c(/^shrine_woods/) + c(/^ruin_/) * 2 + c(/^clear_d_/) * 3 + c(/^echo_woods/) + (S.rareCaught || 0) + ((S.home || {}).tier || 0);
  }
  const TIERS = [[0, 'a stranger'], [5, 'a familiar face'], [15, 'a local hero'], [30, 'the Legend of Ashford']];
  const tier = () => { const r = renown(); let i = 0; TIERS.forEach((t, k) => { if (r >= t[0]) i = k; }); return i; };
  function deeds() {
    const S = S_(), f = F(), L = [];
    if (S.bountiesPaid) L.push(`${S.bountiesPaid} bount${S.bountiesPaid > 1 ? 'ies' : 'y'} collected by the green-eyed hunter`);
    if (f.sanctum) L.push('the Wardstone Keeper beneath the Crossroads — defeated');
    if (S.seasonKills) L.push(`a beast of the season slain in the woods`);
    if (Object.keys(f).some(k => /^clear_d_/.test(k) && f[k])) L.push('a dungeon lord brought down');
    if ((S.home || {}).tier) L.push('a new homestead raised in the Old Grove');
    if (f.ruin_woods) L.push('the Crossroads shrine rebuilt');
    if (S.rivalWins) L.push(`Vessa Crane bested — ${S.rivalWins} time${S.rivalWins > 1 ? 's' : ''}`);
    if (S.escortsDone) L.push('merchant carts brought safely through the woods');
    return L;
  }
  const GREET = [[], ['"Morning, Ren."', '"That\'s the hunter, isn\'t it?"', '"Mind the puddles, Ren!"'],
    ['"Ren! Good hunting out there?"', '"My lad wants to be you when he\'s grown. Heaven help me."', '"Drinks are on me if you ever slow down long enough."'],
    ['"It\'s REN! It\'s really Ren!"', '"Make way for the Legend!"', '"Ren! Sign my boot!"']];
  const GOSSIP_DEED = () => { const d = deeds(); return d.length ? [`"Heard about it? ${d[Math.floor(Math.random() * d.length)].replace(/^./, c => c.toUpperCase())}."`, `"They say the green-eyed one did it — ${pick(d)}."`] : []; };

  /* ---------- the town board & odd jobs ---------- */
  const PETS = [['Widow Merrin', 'Biscuit', 'cat'], ['the baker\'s girl', 'Pudding', 'cat'], ['old Tam', 'Hobnail', 'dog'], ['the twins', 'Sir Fluff', 'cat']];
  const HERBS = [['the apothecary', 'moonpetal', 3], ['the healer at the chapel', 'moonpetal', 4], ['the alchemist', 'mireroot', 2], ['the jeweller', 'skyshard', 1], ['the gravedigger', 'gravedust', 2]];
  function jobs() {
    const S = S_(), w = week();
    if (!S.jobs || S.jobs.week !== w) {
      const p = PETS[w % PETS.length], h = HERBS[w % HERBS.length], camps = (window.WorldPlus ? WorldPlus.CAMPS : []).filter(c => !c.id && FOREST.includes(c.scene)), cp = camps[(w + 2) % Math.max(1, camps.length)];
      S.jobs = { week: w, list: [
        { t: 'pet', who: p[0], name: p[1], kind: p[2], scene: FOREST[(w + 3) % 4], state: 'open' },
        typeof QITEM !== 'undefined' && QITEM[h[1]] ? { t: 'herb', who: h[0], item: h[1], n: h[2], state: 'open' } : null,
        cp ? { t: 'letter', who: 'the postmistress', scene: cp.scene, at: cp.at, camp: cp.name, state: 'open' } : null].filter(Boolean) };
    }
    return S.jobs.list;
  }
  const jobLabel = j => (j.t === 'pet' ? `Lost ${j.kind}: ${j.name} (for ${j.who}) — in ${SCENES[j.scene].subtitle}` : j.t === 'herb' ? `${j.n}× ${QITEM[j.item] && QITEM[j.item].name} for ${j.who}` : `A letter for ${j.camp}`) + ({ open: '', on: ' — taken', ready: ' — done! collect', paid: ' — paid' })[j.state];
  async function jobsMenu() {
    const L = jobs(), lost = window.TownLife.lostItem && TownLife.lostItem();
    const lostLabel = lost ? `Lost & found: ${lost.what} (for ${lost.who})` + ({ open: '', on: ' — taken', ready: ' — found! return it', paid: ' — returned' })[lost.state] : null;
    const ch = await ask(null, null, 'ODD JOBS — pinned on by the townsfolk:', [...L.map(jobLabel), ...(lostLabel ? [lostLabel] : []), 'Back']);
    if (lost && ch === L.length) return TownLife.extraJob(); const j = L[ch]; if (!j) return;
    if (j.state === 'open') {
      j.state = 'on';
      await narr(j.t === 'pet' ? `"${j.name} slipped out after a squirrel and ran all the way to ${SCENES[j.scene].subtitle}. Please bring ${j.kind === 'cat' ? 'her' : 'him'} home!" — ${j.who}`
        : j.t === 'herb' ? `"Need ${j.n} ${QITEM[j.item].name}, fresh as you can. Will pay well." — ${j.who}`
        : `A sealed letter, addressed in careful handwriting to someone at ${j.camp}. "Just leave it by the fire," says ${j.who}.`); save(); return;
    }
    if (j.t === 'herb' && j.state === 'on') { if (Quests.has(j.item) >= j.n) { G.S.qitems[j.item] -= j.n; j.state = 'ready'; } else { await narr(`You have ${Quests.has(j.item)} of ${j.n}.`); return; } }
    if (j.state === 'ready') { j.state = 'paid'; S_().jobsDone = (S_().jobsDone || 0) + 1; const g = 80 + Math.floor(Math.random() * 70); G.S.gold += g; UI.hud(); sfx('coin');
      await narr({ pet: `${j.who} scoops up ${j.name} and bursts into tears. "${g} gold — and you'll have a pie every Sunday for life."`, herb: `${j.who} sniffs them approvingly. "Perfect. ${g} gold."`, letter: `The postmistress stamps your card. "Delivered! ${g} gold."` }[j.t]);
      save(); return; }
    if (j.state === 'on') await narr(j.t === 'pet' ? `${j.name} is still out there in ${SCENES[j.scene].subtitle}.` : j.t === 'letter' ? `The letter is still in your bag — ${j.camp}.` : 'Not done yet.');
  }
  // pets in the woods / letters delivered at camps
  const petImg = k => sheet(x => { const c = k === 'cat' ? '#e8a050' : '#8a6a4a', d = k === 'cat' ? '#c87830' : '#5a4030';
    R(x, 'rgba(0,0,0,.25)', 20, 56, 24, 3); R(x, c, 22, 46, 18, 9); R(x, c, 36, 40, 9, 9); R(x, d, 37, 37, 3, 4); R(x, d, 42, 37, 3, 4); R(x, '#1a1a1a', 40, 43, 2, 2); R(x, c, 22, 54, 3, 3); R(x, c, 35, 54, 3, 3); R(x, d, 16, 42, 6, 3); R(x, d, 24, 47, 12, 2); });
  async function petFound(j, e) {
    World.ents = World.ents.filter(n => n !== e); j.state = 'ready'; sfx('blip');
    await narr(`${j.name}! Muddy, offended, and very glad to see you. You tuck ${j.kind === 'cat' ? 'her' : 'him'} under your arm. (Back to the board in Ashford.)`); save();
  }

  /* ---------- gossip at the fountain ---------- */
  function hints() {
    const f = F(), S = S_(), H = [];
    for (const sc of FOREST) {
      const nm = SCENES[sc].subtitle;
      if (!f['grotto_' + sc] && G.__grottoDoor && G.__grottoDoor[sc]) H.push(`"My cousin swears there's a cave behind the waterfall in ${nm}. Says you just walk into the water."`);
      if (!f['moon_' + sc]) H.push(`"Strange stone in ${nm}. Plain as porridge by day. Shines like a coin at night."`);
      if (!f['shrine_' + sc]) H.push(`"There's an old wayside shrine in ${nm}, all fallen down. My gran says they were never meant to be broken."`);
      if (!f['star_' + sc]) H.push(`"Saw a shooting star come down over ${nm}. Bet it's still out there, glowing."`);
      if (!f['echo_' + sc]) H.push(`"Don't touch the old statue in ${nm} after dark. Old Pell did. Wouldn't speak for a week."`);
    }
    if (!f.sanctum && FOREST.every(s => f['shrine_' + s])) H.push('"Four lamps lit in the woods… there\'s a song about that. Something about a stair under the Crossroads."');
    if (!S.horn) H.push('"The board-keeper at the Crossroads sells hunting horns. Blow one at a campfire if you want trouble."');
    if (!S.home) H.push('"Land going cheap in the Old Grove, they say. Some fool could build a homestead out there."');
    if (!S.dmap) H.push('"Treasure maps at the Crossroads board — X marks the spot, somewhere in the dungeons."');
    return H;
  }
  async function gossip() {
    const H = hints(), D = GOSSIP_DEED(), L = H.length ? H : D.length ? D : ['"Nothing happens in Ashford. Nothing ever happens in Ashford."'];
    await narr('You sit on the fountain\'s rim and listen. Two washerwomen are talking over the noise of the water.');
    await narr(pick(L)); if (D.length && Math.random() < .5) await narr(pick(D));
  }

  /* ---------- the travelling stall ---------- */
  const TRADERS = [
    { n: 'a herbalist from the south', col: '#4a8a3a', items: [['Two tonics', 70, () => { G.S.items.tonic = (G.S.items.tonic || 0) + 2; }], ['An ether', 60, () => { G.S.items.ether = (G.S.items.ether || 0) + 1; }]] },
    { n: 'a tinker with a squeaky cart', col: '#8a6a3a', items: [['A whetstone', 25, () => Gear.give('whetstone', 1)], ['Horn-wax', 80, () => { S_().hornAt = -9999; }]] },
    { n: 'a cartographer', col: '#3a5a8a', items: FOREST.map(sc => [`A survey of ${SCENES[sc] ? SCENES[sc].subtitle : sc}`, 120, () => W4().mapAll(sc)]) },
    { n: 'a fishmonger', col: '#3a7a8a', items: [['A smoked eel (heals you)', 30, () => Story.heal()], ['Bait (fish bite better)', 40, () => { S_().bait = (S_().bait || 0) + 5; }]] }
  ];
  const trader = () => TRADERS[week() % TRADERS.length];
  const stallImg = col => sheet(x => {
    R(x, 'rgba(0,0,0,.3)', 6, 58, 52, 4); R(x, '#4a3020', 8, 26, 3, 32); R(x, '#4a3020', 53, 26, 3, 32); R(x, '#6b4a2a', 6, 44, 52, 12); R(x, '#8a6038', 6, 44, 52, 2);
    for (let i = 0; i < 7; i++) R(x, i % 2 ? '#efe4c8' : col, 4 + i * 8, 18, 8, 10); R(x, '#2a1a10', 4, 27, 56, 2);
    R(x, '#c8a040', 14, 38, 6, 6); R(x, '#a03020', 24, 39, 6, 5); R(x, '#6aa040', 34, 38, 5, 6); R(x, '#d8d0b8', 44, 39, 7, 5); });
  async function stallTalk() {
    const T = trader(), S = S_(); S.stallBuy = S.stallBuy && S.stallBuy.week === week() ? S.stallBuy : { week: week(), got: {} };
    await narr(`A travelling stall — ${T.n}. "Only here this week, friend!"`);
    const its = T.items.filter(i => !S.stallBuy.got[i[0]]); if (!its.length) { await narr('"Sold you all I had! Next week, someone else will be here."'); return; }
    const ch = await ask(null, null, 'Buy something?', [...its.map(i => `${i[0]} — ${i[1]}g`), 'Just looking']); const it = its[ch]; if (!it) return;
    if (G.S.gold < it[1]) { await narr('"Bit short there, friend."'); return; }
    G.S.gold -= it[1]; S.stallBuy.got[it[0]] = 1; it[2](); UI.hud(); sfx('coin'); await narr(`You buy ${it[0].toLowerCase()}.`); save();
  }

  /* ---------- tag ---------- */
  let tag = null;
  async function kidTalk(e, prev) {
    if (tag && tag.e === e) { tag = null; e.ai = 'wander'; e.fleeFrom = null; sfx('level'); S_().tagWins = (S_().tagWins || 0) + 1;
      await narr(pick(['"NO FAIR! You\'ve got long legs!"', '"Okay okay you got me. Again tomorrow?"', '"How are you so FAST?"']));
      if (S_().tagWins === 1) { G.S.gold += 5; UI.hud(); await narr('The kid presses a shiny green pebble into your hand. "That\'s for winners." (5 gold — well, it\'s a nice pebble.)'); }
      save(); return; }
    if (night() > .5 || Math.random() < .35) return prev ? prev(e) : narr('"Mum says I can\'t talk to adventurers."');
    await narr(pick(['"Tag! You\'re IT!" The kid slaps your arm and bolts.', '"Bet you can\'t catch me!" They\'re already running.']));
    e.ai = 'flee'; e.fleeFrom = [World.player.x, World.player.y]; e.alarmT = 0; tag = { e, until: performance.now() + 25000 };
  }

  /* ---------- placing things in the square ---------- */
  function freeNear(cx, cy, test, R0 = 8) {
    const C = World.col; let best = null, bd = 1e9;
    for (let y = cy - R0; y <= cy + R0; y++) for (let x = cx - R0; x <= cx + R0; x++) {
      if (!C[y] || C[y][x] !== 0 || World.ents.some(e => e.x === x && e.y === y)) continue; if (test && !test(x, y)) continue;
      const d = Math.abs(x - cx) + Math.abs(y - cy); if (d < bd) { bd = d; best = [x, y]; } }
    return best;
  }
  const firstFree = L => L.find(([x, y]) => World.col[y] && World.col[y][x] === 0 && !World.ents.some(e => e.x === x && e.y === y)) || null;
  const againstWall = (x, y) => World.col[y - 1] && World.col[y - 1][x] === 1 && World.col[y][x - 1] === 0 && World.col[y][x + 1] === 0 && World.col[y + 1] && World.col[y + 1][x] === 0 && World.col[y + 1][x - 1] === 0 && World.col[y + 1][x + 1] === 0;
  const boardImg = (() => { let S; return () => S || (S = sheet(x => {
    R(x, 'rgba(0,0,0,.3)', 14, 58, 36, 4); R(x, '#4a3020', 18, 40, 4, 20); R(x, '#4a3020', 42, 40, 4, 20); R(x, '#6b4a2a', 12, 14, 40, 30); R(x, '#8a6038', 12, 14, 40, 3); R(x, '#4a3020', 10, 10, 44, 5);
    for (const [a, b, c] of [[15, 19, '#e8dcc0'], [27, 18, '#efe4c8'], [39, 20, '#e2d4b4'], [20, 31, '#f0e8d0'], [34, 30, '#e8dcc0']]) { R(x, c, a, b, 10, 11); R(x, '#5a4a3a', a + 2, b + 4, 6, 1); R(x, '#5a4a3a', a + 2, b + 7, 5, 1); }
    R(x, '#a03020', 18, 20, 3, 3); R(x, '#2a6aa0', 30, 19, 3, 3); })); })();

  /* ---------- wiring ---------- */
  let doorsLit = [];
  const _load = World.load.bind(World);
  World.load = async function (name, ...a) {
    tag = null;
    const r = await _load(name, ...a);
    try {
      if (name === TOWN) {
        const b = firstFree([[24, 21], [23, 21], [24, 20], [25, 20]]) || freeNear(30, 25, againstWall, 7); if (b) { World.col[b[1]][b[0]] = 1; World.ents.push(new Ent({ id: 'townboard', x: b[0], y: b[1], dir: 'down', img: boardImg(), size: 1.25, pickup: 1, name: 'Town board', talk: townBoard, qm: () => jobs().some(j => j.state === 'ready') || (window.TownLife.lostItem && TownLife.lostItem().state === 'ready') ? '?' : null })); }
        if (night() < .55) { const s = firstFree([[37, 21], [23, 21], [37, 22], [22, 22]]); if (s) { World.col[s[1]][s[0]] = 1; World.ents.push(new Ent({ id: 'tstall', x: s[0], y: s[1], dir: 'down', img: stallImg(trader().col), size: 1.4, pickup: 1, name: 'Stall', talk: stallTalk })); } }
        const n = night();
        for (const e of World.ents) {
          if (!e.folk) continue;
          if (n > .55 && Math.random() < .7) { e.__gone = 1; continue; }   // most folk go home at night
          const tl = e.talkLines; if (tl) e.talkLines = () => { const t = tier(); return t && Math.random() < .5 ? GREET[t].concat(GOSSIP_DEED()) : tl(); };
          if (/^kid/.test(e.sprite || '')) { const prev = e.talk; e.talk = () => kidTalk(e, prev); }
        }
        World.ents = World.ents.filter(e => !e.__gone);
        if (n > .4) { doorsLit = Object.keys(SCENES[TOWN].tiles).map(k => k.split(',').map(Number)).filter(([x, y]) => World.col[y] && World.col[y][x] === 1);
          for (const [x, y] of doorsLit) World.lights.push({ x: x * TILE + 16, y: y * TILE + 4, r: 54, c: '255,190,110' }); }
        const T = SCENES[TOWN].tiles, k = '30,23'; if (T[k] && !T[k].__gossip) { const prev = T[k]; T[k] = async () => { await prev(); const c = await ask(null, null, 'Sit a while?', ['Listen to the gossip', 'Move on']); if (c === 0) await gossip(); }; T[k].__gossip = 1; }
      }
      // lost pets
      for (const j of jobs()) if (j.t === 'pet' && j.state === 'on' && j.scene === name) { const s = W4().spot(name, 777); if (s) { const e = new Ent({ id: 'lostpet', x: s[0], y: s[1], dir: 'down', img: petImg(j.kind), name: j.name, ai: 'wander', area: [s[0] - 2, s[1] - 2, s[0] + 2, s[1] + 2], talk: () => petFound(j, e) }); World.ents.push(e); } }
    } catch (e) { console.warn('townlife', e); }
    return r;
  };
  async function townBoard() {
    const t = tier(), ch = await ask(null, null, `The Ashford town board. (Ashford sees you as ${TIERS[t][1]}.)`, ['Odd jobs', 'Bounties & more', 'Leave']);
    if (ch === 0) return jobsMenu(); if (ch === 1) return W4().boardTalk();
  }
  const _step = World.onStep.bind(World);
  World.onStep = function (e) {
    const r = _step(e);
    try { if (!e || !e.isPlayer) return r;
      for (const j of jobs()) if (j.t === 'letter' && j.state === 'on' && G.S.map === j.scene && Math.abs(e.x - j.at[0]) + Math.abs(e.y - j.at[1]) <= 2) { j.state = 'ready'; toast(`Letter left by the fire at ${j.camp}. (Collect your pay at the Ashford board.)`, 2800); save(); }
      if (inTown() && tier() >= 1 && G.t > World.bubbleGate) { const f = World.ents.find(n => n.folk && !n.move && Math.abs(n.x - e.x) + Math.abs(n.y - e.y) <= 2 && n.say); if (f && Math.random() < .25) { f.dir = World.dirTo(f, e); f.say(pick(GREET[tier()]).replace(/"/g, ''), 2200); World.bubbleGate = G.t + 4000; } }
    } catch (x) { }
    return r;
  };
  let crierT = 0;
  const _render = World.render.bind(World);
  World.render = function (c, t) {
    _render(c, t);
    try { if (!inTown() || World.loading || G.mode !== 'world') return; const now = performance.now();
      if (tag && now > tag.until) { tag.e.ai = 'wander'; tag.e.fleeFrom = null; tag = null; }
      if (tag) tag.e.fleeFrom = [World.player.x, World.player.y];
      if (now > crierT) { crierT = now + 16000 + Math.random() * 10000; const cr = World.ents.find(e => e.id === 'crier'); const d = deeds(); if (cr && cr.say && d.length && night() < .6) cr.say('HEAR YE! ' + pick(d).toUpperCase() + '!', 3200); }
      // seasonal bunting over the square
      const ss = (window.WorldPlus3 && WorldPlus3.season && WorldPlus3.season()) || 'spring', cols = { spring: ['#f4b0c8', '#b8e0a0', '#fff0a0', '#a8d0f0'], summer: ['#ffd040', '#ff7a40', '#40c0ff', '#ffffff'], autumn: ['#d85020', '#f0a030', '#8a3010', '#e8c050'], winter: ['#e0f0ff', '#a0c8f0', '#ffffff', '#c0d8ff'] }[ss];
      const cx = Math.round(World.cam.x), cy = Math.round(World.cam.y);
      for (const [x0, x1, yy] of [[22.5, 29, 21.2], [31, 37.5, 21.2]]) { const ax = x0 * TILE - cx, bx = x1 * TILE - cx, y = yy * TILE - cy; if (bx < -20 || ax > c.canvas.width) continue;
        c.strokeStyle = 'rgba(60,40,20,.8)'; c.lineWidth = 1; c.beginPath(); for (let i = 0; i <= 20; i++) { const u = i / 20, px = ax + (bx - ax) * u, py = y + Math.sin(u * Math.PI) * 14; i ? c.lineTo(px, py) : c.moveTo(px, py); } c.stroke();
        for (let i = 1; i < 12; i++) { const u = i / 12, px = ax + (bx - ax) * u, py = y + Math.sin(u * Math.PI) * 14, sw = Math.sin(t / 400 + i) * 1.5;
          c.fillStyle = cols[i % 4]; if (ss === 'winter' || ss === 'autumn' && i % 3 === 0) { c.beginPath(); c.arc(px, py + 5, 3, 0, 7); c.fill(); if (night() > .4) { c.fillStyle = 'rgba(255,220,140,.35)'; c.beginPath(); c.arc(px, py + 5, 7, 0, 7); c.fill(); } }
          else { c.beginPath(); c.moveTo(px - 3, py); c.lineTo(px + 3, py); c.lineTo(px + sw, py + 8); c.closePath(); c.fill(); } } }
    } catch (e) { }
  };
  window.TownLife = { renown, tier, jobs, hints, deeds, trader, freeNear };
})();
