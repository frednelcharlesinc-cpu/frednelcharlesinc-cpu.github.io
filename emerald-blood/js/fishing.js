'use strict';
/* ================= FISHING (Chat B — World & Maps) =================
   Face any water in the woods and press A. When something bites, the reel game starts: hold to lift the green
   catch-bar, keep the fish inside it until the line fills. Every species has its own art, its own place and time,
   and its own difficulty (★ to ★★★★★).
   PASSIVE UPGRADES — your Angler level rises as you catch fish (bigger catch-bar, fish bite faster).
   TACKLE — buy a better rod, reel, line and lures at the Ashford town board.
   Every fish is also an ingredient for cooking. The fish log lives in the 🎒 satchel.
   THE SALTREED TOURNAMENT — one week every season, at the marsh camp: three casts, biggest catch wins. */
(function () {
  const S_ = () => G.S;
  const week = () => Math.floor(((typeof Cal !== 'undefined' ? Cal.day() : 1) - 1) / 7);
  const night = () => (typeof Ambient !== 'undefined' && Ambient.night) || 0;
  const weather = () => (typeof Ambient !== 'undefined' && Ambient.weather) || 'clear';
  const zone = () => G.S.map || '';
  const sleep = ms => new Promise(r => setTimeout(r, ms));
  // id: [name, difficulty 1-5, weight kg range, where (regexp on scene), when ('night'|'rain'|''), rarity weight, colours [body, belly, fin, pattern], pattern, price]
  const FISH = {
    minnow: ['Pond Minnow', 1, [.1, .3], /./, '', 30, ['#9aa8b0', '#d8e0e0', '#7a8890', ''], '', 6],
    perch: ['Silver Perch', 2, [.4, 1.2], /./, '', 22, ['#b8c0c8', '#e8eef0', '#d86a3a', '#6a7a88'], 'bars', 12],
    trout: ['Frost Trout', 3, [.8, 2.5], /woods_n|vale/, '', 16, ['#7ab0d8', '#e0f0ff', '#5a8ab0', '#ffffff'], 'spots', 22],
    eel: ['Ember Eel', 4, [1, 3], /woods_e/, '', 12, ['#3a2a2a', '#d86a2a', '#ff8a3a', '#ffb050'], 'eel', 30],
    koi: ['Glimmer Koi', 3, [1, 3.5], /woods_s/, '', 14, ['#f0e0c8', '#ffffff', '#e8a050', '#e85a2a'], 'koi', 28],
    pike: ['Grove Pike', 3, [2, 5], /woods_w/, '', 14, ['#5a7a3a', '#c8d8a0', '#3a5a2a', '#a8c870'], 'bars', 26],
    snapper: ['Salt Snapper', 3, [1.5, 4], /woods_s2/, '', 18, ['#d84a4a', '#f0b0a0', '#a83a3a', ''], '', 32],
    moonfish: ['Moonfish', 4, [.5, 2], /./, 'night', 10, ['#d8e0ff', '#ffffff', '#9fb8ff', '#ffffff'], 'glow', 45],
    stormray: ['Storm Ray', 4, [3, 8], /./, 'rain', 8, ['#4a5a7a', '#c8d0e0', '#2a3a5a', '#ffe060'], 'ray', 50],
    goldfin: ['Vale Goldfin', 5, [1, 3], /vale/, '', 10, ['#ffd040', '#fff0a0', '#e8a020', '#46ff95'], 'glow', 80],
    gar: ['Ancient Gar', 5, [12, 30], /./, '', 1.2, ['#5a6a5a', '#a8b0a0', '#3a4a3a', '#2a3a2a'], 'scales', 150]
  };
  // register as cooking ingredients
  if (window.Food) for (const [k, f] of Object.entries(FISH)) Food.ING[k] = [f[0], k === 'gar' || k === 'goldfin' ? 'legend' : 'fish', f[8], [f[6][0], f[6][1], f[6][2]], 'fish'];

  /* ---------- art: 16×16 pixel fish ---------- */
  function drawFish(x, id) {
    const f = FISH[id]; if (!f) return; const [b, be, fi, pt] = f[6], P = (col, a, c, w = 1, h = 1) => { x.fillStyle = col; x.fillRect(a, c, w, h); }, pat = f[7];
    if (pat === 'eel') { for (let i = 0; i < 13; i++) P(b, 1 + i, 7 + Math.round(Math.sin(i / 2) * 1.5), 1, 3); P(be, 2, 9, 11, 1); P('#fff', 13, 7); P('#000', 13, 7); P(fi, 1, 6, 2, 1); return; }
    if (pat === 'ray') { P(b, 3, 4, 10, 8); P(b, 1, 6, 14, 4); P(be, 5, 8, 6, 2); P(fi, 7, 12, 1, 4); P(pt, 6, 5, 1, 1); P(pt, 9, 6, 1, 1); P('#fff', 5, 5); P('#fff', 10, 5); return; }
    // body
    P(b, 4, 5, 8, 6); P(b, 3, 6, 10, 4); P(b, 12, 6, 1, 4); P(be, 5, 9, 7, 2);
    P(fi, 0, 4, 2, 2); P(fi, 1, 6, 2, 4); P(fi, 0, 10, 2, 2); P(fi, 6, 3, 4, 2); P(fi, 7, 11, 2, 2);   // tail, dorsal, belly fin
    P('#ffffff', 11, 6, 2, 2); P('#101010', 12, 6);   // eye
    if (pat === 'bars') { P(pt, 5, 5, 1, 4); P(pt, 7, 5, 1, 4); P(pt, 9, 5, 1, 4); }
    if (pat === 'spots') { P(pt, 5, 6); P(pt, 8, 5); P(pt, 7, 8); P(pt, 10, 8); }
    if (pat === 'koi') { P(pt, 5, 5, 3, 2); P(pt, 9, 7, 2, 2); }
    if (pat === 'glow') { P(pt + '88', 4, 4, 8, 1); P(pt, 6, 7, 1, 1); P(pt, 9, 6, 1, 1); }
    if (pat === 'scales') { for (let i = 4; i < 12; i += 2) for (let j = 5; j < 10; j += 2) P(pt, i, j); }
  }
  const icon = id => window.Food ? Food.icon('fish', id) : '';
  const img = (id, sz) => window.Food ? Food.img(icon(id), sz) : '';

  /* ---------- angler level & tackle ---------- */
  const st = () => { const S = S_(); S.fishing = S.fishing || { xp: 0, rod: 0, reel: 0, line: 0, lure: 0, log: {}, best: {} }; return S.fishing; };
  const level = () => { const xp = st().xp; return xp >= 120 ? 5 : xp >= 70 ? 4 : xp >= 35 ? 3 : xp >= 12 ? 2 : 1; };
  const TACKLE = { rod: ['Rod', ['Willow Rod', 'Ash Rod', 'Drakebone Rod'], [120, 300, 600], 'bigger catch-bar'], reel: ['Reel', ['Brass Reel', 'Silver Reel', 'Goldwind Reel'], [100, 260, 520], 'the line fills faster'],
    line: ['Line', ['Waxed Line', 'Spidersilk Line', 'Wyrmgut Line'], [80, 220, 450], 'the line drains slower'], lure: ['Lures', ['Feather Lure', 'Glass Lure', 'Moon Lure'], [150, 350, 700], 'rarer fish bite'] };
  async function tackleShop() {
    const T = st(), keys = Object.keys(TACKLE).filter(k => T[k] < 3);
    const opts = keys.map(k => `${TACKLE[k][1][T[k]]} — ${TACKLE[k][2][T[k]]}g (${TACKLE[k][3]})`);
    const c = await ask(null, null, `The fishmonger's tackle box. Angler level ${level()} · Rod ${T.rod} · Reel ${T.reel} · Line ${T.line} · Lures ${T.lure}`, [...opts, 'Fish log', 'Leave']);
    if (c === opts.length) return fishLog(); const k = keys[c]; if (!k) return;
    const cost = TACKLE[k][2][T[k]]; if (G.S.gold < cost) { await narr('"Come back with more coin, friend."'); return; }
    G.S.gold -= cost; T[k]++; UI.hud(); sfx('level'); await narr(`You buy the ${TACKLE[k][1][T[k] - 1]}. (${TACKLE[k][3]})`); save();
  }
  async function fishLog() {
    const T = st(), all = Object.keys(FISH), got = all.filter(k => T.log[k]);
    await narr(`Fish log — ${got.length}/${all.length} species. ` + all.map(k => T.log[k] ? `${img(k, 18)} ${FISH[k][0]} ×${T.log[k]} (best ${T.best[k].toFixed(1)}kg)` : '??? ').join(' · '));
  }

  /* ---------- what bites here ---------- */
  function biteTable() {
    const z = zone(), lure = st().lure, L = [];
    for (const [k, f] of Object.entries(FISH)) {
      if (!f[3].test(z)) continue; if (f[4] === 'night' && night() < .5) continue; if (f[4] === 'rain' && weather() !== 'rain') continue;
      let w = f[5]; if (f[1] >= 3) w *= 1 + lure * .5; if (f[1] >= 5) w *= 1 + lure * .6; L.push([k, w]);
    }
    return L;
  }
  function rollFish() { const L = biteTable(), tot = L.reduce((a, b) => a + b[1], 0); let r = Math.random() * tot; for (const [k, w] of L) if ((r -= w) < 0) return k; return 'minnow'; }

  /* ---------- the reel game ---------- */
  function reel(id) {
    return new Promise(res => {
      const f = FISH[id], d = f[1], T = st();
      Food.overlay(`<h3>🎣 Something big is on the line!</h3><div class="muted">Hold (tap & hold, or Space / A) to lift the green bar. Keep the fish inside it.</div><canvas id="fg" width="230" height="226"></canvas><div class="muted" style="text-align:center">Difficulty ${'★'.repeat(d)}${'☆'.repeat(5 - d)} · Angler level ${level()}</div>`);
      const ov = document.getElementById('foodOv'), cv = ov.querySelector('#fg'), c = cv.getContext('2d');
      const H = 196, top = 14, barH = 40 + (level() - 1) * 6 + T.rod * 10;
      let barY = H - barH, barV = 0, fishY = H * .6, fishT = fishY, prog = .3, hold = false, last = performance.now(), t0 = last, nextMove = 0, raf = 0, over = false;
      const step = now => {
        const dt = Math.min(.05, (now - last) / 1000); last = now;
        if (window.__fishBot) hold = fishY < barY + barH * .55;   // test harness only
        barV += (hold ? -900 : 700) * dt; barV = Math.max(-320, Math.min(380, barV)); barY += barV * dt; if (barY < 0) { barY = 0; barV = 0; } if (barY > H - barH) { barY = H - barH; barV = 0; }
        if (now > nextMove) { const jump = 40 + d * 22; fishT = Math.max(8, Math.min(H - 8, fishY + (Math.random() - .5) * 2 * jump)); nextMove = now + (1100 - d * 160) * (.5 + Math.random()); }
        const sp = (1 + d * .6) * (f[7] === 'eel' ? 1.3 : 1); fishY += (fishT - fishY) * Math.min(1, sp * dt);
        const inside = fishY > barY && fishY < barY + barH;
        prog += inside ? (.28 + T.reel * .06 - d * .02) * dt : (now - t0 < 1200 ? 0 : -(.12 - T.line * .025 + d * .012) * dt); prog = Math.max(0, Math.min(1, prog));
        // draw
        c.clearRect(0, 0, 230, 226); c.fillStyle = '#0e2a3a'; c.fillRect(70, top, 50, H); c.strokeStyle = '#4a6a7a'; c.lineWidth = 2; c.strokeRect(70, top, 50, H);
        for (let i = 0; i < 6; i++) { c.fillStyle = 'rgba(160,210,255,.12)'; c.fillRect(72, top + ((now / 20 + i * 47) % H), 46, 2); }
        c.fillStyle = inside ? 'rgba(90,220,110,.75)' : 'rgba(90,200,110,.45)'; c.fillRect(72, top + barY, 46, barH); c.strokeStyle = '#b8ffb0'; c.strokeRect(72, top + barY, 46, barH);
        c.imageSmoothingEnabled = false; c.drawImage(fcan(id), 79, top + fishY - 16, 32, 32);
        c.fillStyle = '#2a1a10'; c.fillRect(140, top, 16, H); c.fillStyle = prog > .66 ? '#7adf6a' : prog > .33 ? '#e8c050' : '#e8603a'; c.fillRect(142, top + H * (1 - prog), 12, H * prog);
        c.fillStyle = '#f0e8d0'; c.font = 'bold 12px system-ui'; c.textAlign = 'center'; c.fillText(((now - t0) / 1000).toFixed(0) + 's', 30, top + 14);
        if (prog >= 1) return end(true); if (prog <= 0 || now - t0 > 30000) return end(false);
        raf = requestAnimationFrame(step);
      };
      const end = ok => { if (over) return; over = true; cancelAnimationFrame(raf); ov.removeEventListener('pointerdown', dn); ov.removeEventListener('pointerup', up); ov.removeEventListener('pointercancel', up); window.removeEventListener('keydown', kd, true); window.removeEventListener('keyup', ku, true); Food.closeOv(); res(ok); };
      const dn = e => { e.preventDefault(); hold = true; }, up = () => { hold = false; }, keys = [' ', 'Enter', 'z', 'x', 'a'];
      const kd = e => { if (keys.includes(e.key)) { e.preventDefault(); hold = true; } }, ku = e => { if (keys.includes(e.key)) hold = false; };
      ov.addEventListener('pointerdown', dn); ov.addEventListener('pointerup', up); ov.addEventListener('pointercancel', up); window.addEventListener('keydown', kd, true); window.addEventListener('keyup', ku, true);
      raf = requestAnimationFrame(step);
    });
  }
  const FC = {}; const fcan = id => { if (FC[id]) return FC[id]; const c = document.createElement('canvas'); c.width = c.height = 16; drawFish(c.getContext('2d'), id); return (FC[id] = c); }; function preload() { }

  let busy = false, tourney = null;
  async function cast() {
    if (busy || !window.Food) return; busy = true; preload();
    try {
      await narr('You bait the hook and cast into the water…');
      const wait = Math.max(500, (2600 - level() * 250) * (.5 + Math.random()) * (weather() === 'rain' || (G.S.bait || 0) > 0 ? .6 : 1));
      if ((G.S.bait || 0) > 0) G.S.bait--;
      await sleep(wait);
      const id = rollFish(), f = FISH[id];
      const ok = await reel(id);
      if (!ok) { await narr(pick(['The line snaps back empty. It got away.', 'A flash of scales — and it\'s gone.', 'Whatever it was, it was smarter than you. This time.'])); return; }
      const T = st(), w = f[2][0] + Math.random() * (f[2][1] - f[2][0]), first = !T.log[id];
      T.log[id] = (T.log[id] || 0) + 1; T.best[id] = Math.max(T.best[id] || 0, w); const lv0 = level(); T.xp += f[1]; S_().fishCaught = (S_().fishCaught || 0) + 1;
      Food.addIng(id, 1); sfx(f[1] >= 4 ? 'level' : 'blip');
      await narr(`${img(id, 40)} You land ${/^[AEIOU]/.test(f[0]) ? 'an' : 'a'} <b>${f[0]}</b> — ${w.toFixed(1)} kg!${first ? ' <b style="color:#ffd36a">New species!</b>' : ''}`);
      if (level() > lv0) { toast(`🎣 <b>ANGLER LEVEL ${level()}</b> — your catch-bar grows, and fish bite faster.`, 3200); }
      if (id === 'gar') { const n = window.WorldPlus4 && WorldPlus4.giveRare(); if (n) await narr(`In the old gar's belly, something glints: a <b style="color:#ffd36a">${n}</b>.`); }
      if (tourney && tourney.z === zone()) { tourney.catches.push([id, w]); }
      save();
    } finally { busy = false; }
  }
  const pick = L => L[Math.floor(Math.random() * L.length)];

  /* ---------- the Saltreed tournament ---------- */
  const tourneyWeek = () => week() % 4 === 1;
  async function tourneyTalk() {
    const S = S_(); S.tourney = S.tourney || {};
    if (!tourneyWeek()) { await narr('A banner on two poles: SALTREED FISHING TOURNAMENT — first week of every season. Bring a strong arm.'); return; }
    if (S.tourney[week()]) { await narr(`"You've had your go this season! Your best was ${S.tourney[week()].toFixed(1)} kg."`); return; }
    if (!tourney) {
      const c = await ask(null, null, '"Tournament\'s on! Three casts, biggest single fish wins. Entry\'s 30 gold."', ['Enter (30g)', 'Not now']); if (c !== 0) return;
      if (G.S.gold < 30) { await narr('"No coin, no rod, friend."'); return; } G.S.gold -= 30; UI.hud(); tourney = { z: zone(), catches: [], casts: 0 };
      await narr('"Three casts. Fish anywhere in the marsh — then come back and weigh in."'); return;
    }
    if (tourney.catches.length < 3 && tourney.casts < 3) { await narr(`"You've landed ${tourney.catches.length}. Keep fishing — three catches, then weigh in."`); const c = await ask(null, null, 'Weigh in now?', ['Weigh in', 'Keep fishing']); if (c !== 0) return; }
    const best = tourney.catches.reduce((a, b) => b[1] > a[1] ? b : a, ['', 0]), target = 2.5 + (week() % 3);
    S.tourney[week()] = best[1]; tourney = null;
    if (best[1] >= target * 1.6) { G.S.gold += 400; S.fishTrophies = (S.fishTrophies || 0) + 1; const n = window.WorldPlus4 && WorldPlus4.giveRare(); sfx('level'); await narr(`"${best[1].toFixed(1)} kg?! A new record!" FIRST PLACE — 400 gold${n ? ` and a <b style="color:#ffd36a">${n}</b>` : ''}, and the golden hook trophy!`); }
    else if (best[1] >= target) { G.S.gold += 150; sfx('level'); await narr(`"${best[1].toFixed(1)} kg — second place!" 150 gold.`); }
    else await narr(`"${best[1] ? best[1].toFixed(1) + ' kg' : 'Nothing'}… better luck next season."`);
    UI.hud(); save();
  }
  const banner2 = (() => { let S; return () => { if (S) return S; const one = document.createElement('canvas'); one.width = one.height = 64; const x = one.getContext('2d'); x.fillStyle = 'rgba(0,0,0,.3)'; x.fillRect(8, 58, 48, 4); x.fillStyle = '#5a3a20'; x.fillRect(10, 10, 3, 50); x.fillRect(51, 10, 3, 50); x.fillStyle = '#2a6aa0'; x.fillRect(13, 12, 38, 18); x.fillStyle = '#f0e0c0'; x.fillRect(16, 15, 32, 2); x.fillRect(16, 19, 26, 2); x.fillRect(16, 23, 30, 2); x.fillStyle = '#e8c050'; x.fillRect(30, 30, 4, 6); S = document.createElement('canvas'); S.width = 64 * 9; S.height = 64 * 12; const s = S.getContext('2d'); for (let r = 0; r < 12; r++) for (let f = 0; f < 9; f++) s.drawImage(one, f * 64, r * 64); return S; }; })();
  const _load = World.load.bind(World);
  World.load = async function (name, ...a) {
    const r = await _load(name, ...a);
    try { if (name === 'woods_s2') { const fire = (FCL.fc_south2.fires || [])[0]; if (fire) { for (const [dx, dy] of [[2, -2], [-2, -2], [3, 0], [-3, 0]]) { const x = fire[0] + dx, y = fire[1] + dy; if (World.col[y] && World.col[y][x] === 0) { World.col[y][x] = 1; World.ents.push(new Ent({ id: 'tourney', x, y, dir: 'down', img: banner2(), size: 1.3, pickup: 1, name: tourneyWeek() ? 'Tournament!' : '', talk: tourneyTalk, qm: () => tourneyWeek() && !(S_().tourney || {})[week()] ? '!' : null })); break; } } } } } catch (e) { }
    return r;
  };
  window.Fishing = { FISH, drawFish, cast, reel, rollFish, biteTable, level, tackleShop, fishLog, st, get tourney() { return tourney; } };
})();
