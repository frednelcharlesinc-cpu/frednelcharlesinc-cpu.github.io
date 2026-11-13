'use strict';
/* ================= WORLD+ 6 (Chat B — World & Maps) =================
   1. CONSTELLATIONS — on clear nights a star-arrow hangs over each forest. It turns as you walk: it points at a
      spot where a fallen star lies. Stand on it after dark.
   2. THE RIVAL — Vessa Crane, another hunter. Sometimes she gets to your bounty first. Duel her for it, or let it go.
   3. SEASONAL BOSSES — one per season, somewhere in the woods, gone when the season turns.
   4. BRIDGES & LADDERS — a broken crossing in every forest. Pay to repair it and you have a shortcut for good.
   5. FOREST ECHOES — touch a history statue after dark and see what it remembers.
   6. THE NIGHT MARKET — after dark at the Crossroads, a lantern stall with stock that changes every week.
   7. DUNGEON PLAQUES — your best run time for each forest dungeon, carved by the entrance. */
(function () {
  const W4 = () => window.WorldPlus4;
  const MK = { woods: 'fc_cross', woods_n: 'fc_north', woods_e: 'fc_east', woods_s: 'fc_south', woods_w: 'fc_west' };
  const FOREST = ['woods_n', 'woods_e', 'woods_s', 'woods_w'];
  const S_ = () => G.S, F = () => G.S.f;
  const week = () => Math.floor(((typeof Cal !== 'undefined' ? Cal.day() : 1) - 1) / 7);
  const night = () => (typeof Ambient !== 'undefined' && Ambient.night) || 0;
  const sheet = draw => { const one = document.createElement('canvas'); one.width = one.height = 64; const x = one.getContext('2d'); draw(x); const S = document.createElement('canvas'); S.width = 64 * 9; S.height = 64 * 12; const s = S.getContext('2d'); for (let r = 0; r < 12; r++) for (let f = 0; f < 9; f++) s.drawImage(one, f * 64, r * 64); return S; };
  const R = (x, c, a, b, w, h) => { x.fillStyle = c; x.fillRect(a, b, w, h); };
  const rare = () => W4().giveRare();
  const gold$ = n => `<b style="color:#ffd36a">${n}</b>`;
  const cam = () => [Math.round(World.cam.x), Math.round(World.cam.y)];
  const fmt = ms => { const s = Math.round(ms / 1000); return Math.floor(s / 60) + ':' + String(s % 60).padStart(2, '0'); };

  /* ---------- 1. constellations ---------- */
  const STARS = { woods_n: "The Huntsman's Arrow", woods_e: 'The Ember Spear', woods_s: 'The Lantern Moth', woods_w: 'The Old Stag' };
  const ARROW = [[0, 0], [1, 0], [2, 0], [3, 0], [2.3, -.7], [2.3, .7], [-.6, -.5], [-.6, .5]];
  const starSpot = sc => W4().spot(sc, 313);
  const skyClear = () => typeof Ambient === 'undefined' || !['rain', 'fog'].includes(Ambient.weather);
  let starToast = '';
  function drawSky(c, t) {
    const sc = G.S.map; if (!FOREST.includes(sc) || night() < .55 || !skyClear() || F()['star_' + sc]) return;
    const s = starSpot(sc), p = World.player; if (!s) return;
    if (starToast !== sc + week()) { starToast = sc + week(); toast(`<b style="color:#cfe0ff">${STARS[sc]}</b> is out tonight. It points somewhere.`, 2800); }
    const a = Math.atan2(s[1] - p.y, s[0] - p.x), W = (G.view && G.view.w) || c.canvas.width, cx = W * .5, cy = 84, k = 16, alpha = Math.min(1, (night() - .55) * 4);
    const pts = ARROW.map(([x, y]) => [cx + (x - 1.2) * k * Math.cos(a) - y * k * Math.sin(a), cy + (x - 1.2) * k * Math.sin(a) + y * k * Math.cos(a)]);
    c.save(); c.globalAlpha = alpha * .45; c.strokeStyle = '#bcd0ff'; c.lineWidth = 1; c.beginPath();
    for (const [i, j] of [[6, 0], [7, 0], [0, 1], [1, 2], [2, 3], [3, 4], [3, 5]]) { c.moveTo(pts[i][0], pts[i][1]); c.lineTo(pts[j][0], pts[j][1]); } c.stroke();
    pts.forEach(([x, y], i) => { const tw = .6 + .4 * Math.sin(t / 300 + i * 1.7); c.globalAlpha = alpha * tw; c.fillStyle = i === 3 ? '#fff6c8' : '#e8f0ff'; c.fillRect(x - (i === 3 ? 2 : 1), y - (i === 3 ? 2 : 1), i === 3 ? 4 : 2, i === 3 ? 4 : 2); });
    c.restore();
    // the fallen star itself glints on the ground
    const [ox, oy] = cam(), g = .5 + .5 * Math.sin(t / 220); c.fillStyle = `rgba(255,250,210,${(.3 + .4 * g).toFixed(2)})`; c.fillRect(s[0] * TILE + 15 - ox, s[1] * TILE + 18 - oy, 2, 2);
  }
  async function starfall(sc) {
    F()['star_' + sc] = 1; const g = 150 + Math.floor(Math.random() * 100); G.S.gold += g; const n = rare(); UI.hud(); sfx('level');
    await narr(`Half-buried in the grass: a stone still warm from falling, glittering like frost. You pry it loose — a star-shard. (${g} gold${n ? ` and a ${gold$(n)}` : ''})`); save();
  }

  /* ---------- 2. the rival ---------- */
  const RIVAL = 'Vessa Crane';
  function rivalEnemy() {
    const B = ENEMY.bandit; if (!B) return null; const lv = 1 + (S_().rivalWins || 0) * .25 + W4().rankIx() * .2, key = 'rival_vessa_' + Math.round(lv * 4);
    if (!ENEMY[key]) ENEMY[key] = Object.assign({}, B, { name: RIVAL, img: B.img || 'bandit', boss: 1, hp: Math.round(B.hp * 3.4 * lv), atk: Math.round(B.atk * 1.5 * Math.sqrt(lv)), def: (B.def || 0) + 3, spd: (B.spd || 11) + 3, dodge: .3, parry: .2, brk: Math.round((B.brk || 40) * 2 * lv), xp: Math.round(60 * lv), gold: Math.round(40 * lv), size: 1.1, trait: 'Rival hunter — fast, and she parries' });
    return key;
  }
  async function rivalSpawn(scene) {
    const h = W4().hunted; if (!h || !World.ents.includes(h)) return; const b = h.__b; if (b.rivalSeen || Math.random() > .3) return;
    b.rivalSeen = 1; let img; try { img = await npcImg(ENEMY.bandit && ENEMY.bandit.img || 'bandit'); } catch (e) { return; }
    World.ents = World.ents.filter(e => e !== h); b.rival = 1;
    World.ents.push(new Ent({ id: 'rival', x: h.x, y: h.y, dir: 'down', img, name: RIVAL, ai: 'turn', talk: () => rivalTalk(b) }));
    toast(`<b style="color:#ff9a6a">${RIVAL}</b> got to ${b.name} before you…`, 2800);
  }
  async function rivalTalk(b) {
    const S = S_(), met = S.rivalMet; S.rivalMet = 1;
    await narr(met ? `${RIVAL} wipes her blade on ${b.name}'s hide. "You again. Same deal as always, Ren — want it? Take it off me."`
      : `A woman in a patched hunter's coat stands over ${b.name}'s body, wiping a curved blade. "Vessa Crane. Hunter, same board as you. ${b.name}'s head is mine, little Drag-eyes — unless you'd like to take it off me."`);
    const ch = await ask(null, null, `Duel ${RIVAL} for the bounty?`, ['Duel her', 'Let her have it']);
    if (ch !== 0) { b.state = 'lost'; World.ents = World.ents.filter(e => e.id !== 'rival'); await narr('"Smart." She hoists the trophy over her shoulder and disappears into the trees.'); save(); return; }
    const r = await Battle.start({ enemies: [rivalEnemy()], noFlee: true, bd: SCENES[G.S.map].bd, music: 'boss', intro: 'RIVAL — ' + RIVAL.toUpperCase() });
    if (r === 'lose') { b.state = 'lost'; World.ents = World.ents.filter(e => e.id !== 'rival'); await narr('You wake to an empty clearing and a note pinned to your sleeve: "Better luck next week. — V.C."'); Story.heal(); save(); return; }
    if (r !== 'win') return;
    S.rivalWins = (S.rivalWins || 0) + 1; b.state = 'done'; World.ents = World.ents.filter(e => e.id !== 'rival');
    await narr(['She yields, laughing through a split lip. "Fine. Take it. I\'ll be faster next time."', '"Twice now." She spits. "Don\'t get used to it."', '"…You\'re getting good, Drag-eyes. I hate that."'][Math.min(2, S.rivalWins - 1)]);
    toast(`<b style="color:#ff6a4a">${b.name.toUpperCase()}</b> — bounty yours. Collect at the Crossroads board.`, 3000); save();
  }

  /* ---------- 3. seasonal bosses ---------- */
  const SB = {
    spring: ['The Bloom Wyrm', 'm_drake', 'woods_s', 'Its scales are petals. It smells like a whole meadow, and it is enormous.'],
    summer: ['The Sun-Scorched Tusker', 'm_tusker', 'woods_e', 'A boar the size of a cart, its back cracked like dry riverbed. The heat comes off it in waves.'],
    autumn: ['The Harvest King', 'm_gourd', 'woods_w', 'A pumpkin as big as a cottage, wearing a crown of corn husks. It hates you more than any gourd ever has.'],
    winter: ['The Snow Troll', 'm_troll', 'woods_n', 'A troll white with frost, older than the pines. Icicles hang from its beard.']
  };
  const season = () => (window.WorldPlus3 && WorldPlus3.season && WorldPlus3.season()) || 'spring';
  const sbKey = () => 'sboss_' + week();
  function sbEnemy(s) {
    const [name, base] = SB[s], B = ENEMY[base]; if (!B) return null; const key = 'season_' + s;
    if (!ENEMY[key]) ENEMY[key] = Object.assign({}, B, { name, img: B.img || base, boss: 1, hp: Math.round(B.hp * 4), atk: Math.round(B.atk * 1.4), def: (B.def || 0) + 3, brk: Math.round((B.brk || 50) * 2), xp: Math.round((B.xp || 20) * 6), gold: Math.round((B.gold || 10) * 5), size: 2, trait: 'Seasonal — only this season' });
    return key;
  }
  async function sbSpawn(scene) {
    const s = season(), d = SB[s]; if (!d || d[2] !== scene || F()[sbKey()]) return; const key = sbEnemy(s); if (!key) return;
    const at = W4().spot(scene, 641); if (!at) return; let img; try { img = await npcImg(ENEMY[key].img); } catch (e) { return; }
    World.ents.push(new Ent({ id: 'sboss', x: at[0], y: at[1], dir: 'down', img, size: 2, name: d[0], ai: 'turn', talk: () => sbFight(s, key) }));
  }
  async function sbFight(s, key) {
    await narr(SB[s][3]);
    const r = await Battle.start({ enemies: [key], boss: true, noFlee: true, bd: SCENES[G.S.map].bd, music: 'boss', intro: SB[s][0].toUpperCase() });
    if (r === 'lose') { await Story.defeat(); return; }
    if (r !== 'win') return;
    F()[sbKey()] = 1; S_().seasonKills = (S_().seasonKills || 0) + 1; World.ents = World.ents.filter(e => e.id !== 'sboss');
    const a = rare(), b = rare(); G.S.gold += 400; UI.hud(); sfx('level');
    await narr(`${SB[s][0]} falls. 400 gold${a ? `, a ${gold$(a)}` : ''}${b ? ` and a ${gold$(b)}` : ''}. Next season, something else will come.`); save();
  }

  /* ---------- 4. bridges & ladders ---------- */
  // find the crossing that saves the most walking: a short run of water (bridge) or cliff (ladder) between two open tiles
  function crossings(mk) {
    const M = G.maps[mk]; if (M.__cross) return M.__cross;
    const re = W4().reach(mk), open = (x, y) => re.has(x + ',' + y);
    const dist = (a, b) => { const seen = new Map([[a[0] + ',' + a[1], 0]]), q = [a]; while (q.length) { const [x0, y0] = q.shift(), d = seen.get(x0 + ',' + y0); if (x0 === b[0] && y0 === b[1]) return d; if (d > 400) break;
      for (const [dx, dy] of [[1, 0], [-1, 0], [0, 1], [0, -1]]) { const x = x0 + dx, y = y0 + dy, k = x + ',' + y; if (!seen.has(k) && M.col[y] && M.col[y][x] === '0') { seen.set(k, d + 1); q.push([x, y]); } } } return 1e9; };
    const best = { b: null, l: null };
    for (const [kind, ch] of [['b', 'w'], ['l', 'c']]) {
      let top = null, score = 30;
      for (let y = 3; y < M.h - 3; y++) for (let x = 3; x < M.w - 3; x++) for (const [dx, dy] of (kind === 'b' ? [[1, 0], [0, 1]] : [[0, 1]])) {
        if (!open(x, y)) continue; const run = [];
        let cx = x + dx, cy = y + dy; while (run.length < 3 && M.mm[cy] && M.mm[cy][cx] === ch && M.col[cy][cx] === '1') { run.push([cx, cy]); cx += dx; cy += dy; }
        if (!run.length || !open(cx, cy)) continue;
        const d = dist([x, y], [cx, cy]), sv = d - run.length - 1; if (sv > score) { score = sv; top = { run, a: [x, y], b: [cx, cy], dx, dy, save: sv }; }
      }
      best[kind] = top;
    }
    return (M.__cross = best);
  }
  const fixKey = (sc, k) => 'fix_' + sc + '_' + k;
  async function crossingTalk(sc, k, X) {
    if (F()[fixKey(sc, k)]) return;
    await narr(k === 'b' ? 'The stumps of an old footbridge stick out of the water. Someone could rebuild it.' : 'Rusted iron rungs are still bolted into the cliff — but the ladder that hung from them is long gone.');
    if (!(await W4().pay(150, k === 'b' ? 'Rebuild the footbridge' : 'Hang a new rope ladder'))) return;
    F()[fixKey(sc, k)] = 1; for (const [x, y] of X.run) World.col[y][x] = 0; sfx('blip');
    await narr(`Done. A shortcut — it saves about ${X.save} steps.`); save();
  }
  function hookCrossings(scene) {
    const mk = MK[scene], C = crossings(mk), T = SCENES[scene].tiles;
    for (const k of ['b', 'l']) { const X = C[k]; if (!X) continue;
      if (F()[fixKey(scene, k)]) { for (const [x, y] of X.run) World.col[y][x] = 0; continue; }
      for (const [x, y] of [X.run[0], X.run[X.run.length - 1]]) { const key = x + ',' + y; if (!T[key] || !T[key].__cross) { T[key] = () => crossingTalk(scene, k, X); T[key].__cross = 1; } }
    }
  }
  if (typeof Ambient !== 'undefined' && Ambient.ground) {
    const _g = Ambient.ground.bind(Ambient);
    Ambient.ground = function (c, cx, cy, t, w, h) {
      const r = _g(c, cx, cy, t, w, h);
      try {
        const sc = G.S.map; if (!FOREST.includes(sc)) return r; const C = crossings(MK[sc]);
        for (const k of ['b', 'l']) { const X = C[k]; if (!X) continue; const fixed = F()[fixKey(sc, k)];
          for (const [i, [x, y]] of X.run.entries()) { const sx = x * TILE - cx, sy = y * TILE - cy; if (sx < -40 || sy < -40 || sx > w + 40 || sy > h + 40) continue;
            if (k === 'b') { if (!fixed) { if (i === 0 || i === X.run.length - 1) { c.fillStyle = '#4a3020'; c.fillRect(sx + 4, sy + 6, 4, 20); c.fillRect(sx + 24, sy + 6, 4, 20); } continue; }
              c.fillStyle = '#6b4a2a'; if (X.dx) { for (let j = 0; j < 32; j += 6) { c.fillRect(sx + j, sy + 6, 5, 22); } c.fillStyle = '#3a2414'; c.fillRect(sx, sy + 5, 32, 2); c.fillRect(sx, sy + 27, 32, 2); }
              else { for (let j = 0; j < 32; j += 6) c.fillRect(sx + 4, sy + j, 24, 5); c.fillStyle = '#3a2414'; c.fillRect(sx + 3, sy, 2, 32); c.fillRect(sx + 27, sy, 2, 32); } }
            else { c.fillStyle = fixed ? '#8a6038' : '#5a5a5a'; c.fillRect(sx + 7, sy, 2, 32); c.fillRect(sx + 23, sy, 2, 32); for (let j = 3; j < 32; j += 7) if (fixed || j < 12) c.fillRect(sx + 7, sy + j, 18, 2); }
          } }
      } catch (e) { }
      return r;
    };
  }

  /* ---------- 5. forest echoes ---------- */
  const ECHO = {
    woods_n: [/HERO OF THE NORTH PASS/, ['The snow turns to rain, then to firelight. The knight is alive, kneeling — not in prayer. In surrender.', 'Men in Accord grey stand over him with chisels. "Scrape the name," one says. "Every copy. Every song."', 'The knight looks straight at you. His eyes are green.']],
    woods_e: [/IT WAS NOT THE DRAGS/, ['Smoke. A child runs past you through burning trees, clutching a slate.', 'Behind her, riders carry torches. Their cloaks bear the Accord\'s seal. Not one of them has green eyes.', 'The child stops at the statue and starts to scratch letters into it with a nail.']],
    woods_s: [/AVERIN HOLLE/, ['A great hall, lanterns of green glass. Averin Holle signs a long parchment while the guildmasters cheer.', 'Under the table, out of sight, a line of people in chains wait. One of them is singing very quietly.', 'Holle hears it. For a moment his pen stops. Then it moves again.']],
    woods_w: [/giant in a Drag cloak/, ['The moss pulls back. The giant is a man again — tall, tired, sword planted in the earth in front of a hundred fleeing families.', '"Go," he says. "Go west. Tell no one what you are."', 'Something vast passes overhead and blots out the sun. He lifts the sword.']]
  };
  function hookEchoes() {
    for (const [sc, [re, lines]] of Object.entries(ECHO)) {
      const T = SCENES[sc] && SCENES[sc].tiles; if (!T) continue;
      for (const k of Object.keys(T)) if (re.test(String(T[k]))) {
        const prev = T[k];
        T[k] = async () => {
          await prev();
          if (night() < .5) { if (!F()['echohint_' + sc]) { F()['echohint_' + sc] = 1; await narr('For a moment you think you hear voices from the stone. Maybe it\'s louder at night.'); } return; }
          if (F()['echo_' + sc]) return;
          const t0 = World.tint; World.tint = 'rgba(80,140,220,.35)'; banner('ECHO', 'what the stone remembers', 1800); sfx('blip');
          for (const l of lines) await narr('<i style="color:#bfe0ff">' + l + '</i>');
          World.tint = t0; F()['echo_' + sc] = 1; const n = Object.keys(ECHO).filter(s => F()['echo_' + s]).length;
          toast(`<b style="color:#bfe0ff">ECHO ${n}/4</b>`, 2200);
          if (n === 4) { const r1 = rare(); sfx('level'); await narr(`All four stones have shown you what they saw. Something in your chest — the pendant — is warm.${r1 ? ` In your pocket, a ${gold$(r1)} you don't remember picking up.` : ''}`); }
          save();
        };
        T[k].toString = () => String(prev);
      }
    }
  }

  /* ---------- 6. the night market ---------- */
  const stallImg = (() => { let S; return () => S || (S = sheet(x => {
    R(x, 'rgba(0,0,0,.3)', 6, 58, 52, 4); R(x, '#4a3020', 8, 30, 3, 28); R(x, '#4a3020', 53, 30, 3, 28); R(x, '#6b4a2a', 6, 44, 52, 12); R(x, '#8a6038', 6, 44, 52, 2);
    for (let i = 0; i < 7; i++) R(x, i % 2 ? '#3a2a6a' : '#6a3a8a', 4 + i * 8, 22, 8, 10); R(x, '#2a1a4a', 4, 31, 56, 2);
    R(x, '#ffd890', 12, 34, 4, 5); R(x, '#fff4c8', 13, 35, 2, 2); R(x, '#ffd890', 48, 34, 4, 5);
    R(x, '#4a8ad8', 20, 40, 5, 4); R(x, '#d8a838', 28, 39, 4, 5); R(x, '#a03020', 36, 40, 5, 4); R(x, '#9fd8ff', 43, 41, 3, 3);
  })); })();
  const market = () => { const S = S_(); if (!S.market || S.market.week !== week()) S.market = { week: week(), bought: {} }; return S.market; };
  async function marketTalk() {
    const M = market(), w = week(), rk = Object.keys(PARTS).filter(p => PARTS[p].rare), part = rk[w % rk.length];
    const forests = FOREST.filter(s => !(S_().tmaps || {})[s]);
    const stock = [
      { id: 'rare', label: `${PARTS[part].n} — 260g`, cost: 260, ok: !!part, buy: () => { Gear.give(part, 1); return `a ${gold$(PARTS[part].n)}`; } },
      { id: 'ether', label: 'Two moon-draughts (ethers) — 110g', cost: 110, ok: true, buy: () => { G.S.items.ether = (G.S.items.ether || 0) + 2; return 'two ethers'; } },
      { id: 'tmap', label: 'A stained treasure map — 180g', cost: 180, ok: forests.length > 0, buy: () => { const s = forests[w % forests.length]; S_().tmaps = S_().tmaps || {}; S_().tmaps[s] = 'have'; return `a map of ${SCENES[s].subtitle} with a red X`; } },
      { id: 'horn', label: 'Horn-wax (blow your horn again now) — 90g', cost: 90, ok: !!S_().horn, buy: () => { S_().hornAt = -9999; return 'a pot of horn-wax'; } }
    ].filter(s => s.ok && !M.bought[s.id]);
    await narr(S_().marketMet ? '"Back again, night-walker?" The lantern-seller smiles under her hood.' : 'A cart hung with purple cloth and little lanterns. The seller wears a hood full of stars. "I only trade after dark. Things come to me at night that don\'t come by day."');
    S_().marketMet = 1;
    if (!stock.length) { await narr('"Sold out, love. New stock when the week turns."'); return; }
    const ch = await ask(null, null, 'This week at the night market:', [...stock.map(s => s.label), 'Just looking']); const it = stock[ch]; if (!it) return;
    if (G.S.gold < it.cost) { await narr('"Bit short, aren\'t we?"'); return; }
    G.S.gold -= it.cost; M.bought[it.id] = 1; UI.hud(); sfx('coin'); await narr(`You buy ${it.buy()}.`); save();
  }

  /* ---------- 7. dungeon plaques ---------- */
  const CAVES = () => { const L = []; for (const [sc, mk] of Object.entries(MK)) for (const [id, c] of Object.entries((FCL[mk] && FCL[mk].caves) || {})) L.push({ sc, mk, id, c }); return L; };
  let run = null;
  function runTick() {
    if (!run || G.S.map !== run.id) return; const D = G.maps[run.id].dungeon, p = World.player;
    const done = (!run.wasClear && F()['clear_' + run.id]) || (run.wasClear && D.boss && Math.abs(p.x - D.boss[0]) + Math.abs(p.y - D.boss[1]) <= 2);
    if (!done) return;
    const ms = performance.now() - run.t0, S = S_(); S.dbest = S.dbest || {}; const old = S.dbest[run.id], rec = !old || ms < old; if (rec) S.dbest[run.id] = ms;
    toast(`<b style="color:#ffd36a">RUN: ${fmt(ms)}</b>${rec ? ' — new record!' : ` (best ${fmt(old)})`}`, 3200); run = null; save();
  }
  function plaqueSpot(cv) {
    const M = G.maps[cv.mk], [bx, by] = cv.c.back;
    for (const [dx, dy] of [[2, 0], [-2, 0], [2, 1], [-2, 1], [3, 0], [-3, 0]]) { const x = bx + dx, y = by + dy;
      if (M.col[y] && M.col[y][x] === '0' && [[1, 0], [-1, 0], [0, 1], [0, -1]].filter(([a, b]) => M.col[y + b] && M.col[y + b][x + a] === '0').length >= 3) return [x, y]; }
    return null;
  }
  const plaqueImg = (() => { let S; return () => S || (S = sheet(x => { R(x, 'rgba(0,0,0,.3)', 18, 58, 28, 4); R(x, '#5a5a52', 30, 44, 4, 16); R(x, '#7a7a70', 18, 26, 28, 20); R(x, '#9a9a8e', 18, 26, 28, 2); R(x, '#c8a040', 22, 30, 20, 12); R(x, '#e8c868', 22, 30, 20, 2); for (let i = 0; i < 3; i++) R(x, '#7a5a20', 25, 34 + i * 3, 14, 1); })); })();
  async function plaqueTalk(id) {
    const b = (S_().dbest || {})[id], d = (typeof DUNGEONS !== 'undefined' && DUNGEONS[id]) || {};
    await narr(b ? `A brass plaque by the entrance: ${d.title || id} — FASTEST RUN: REN, ${fmt(b)}.` : `A blank brass plaque by the entrance: ${d.title || id} — FASTEST RUN: ——. (Your run starts when you go in and ends when the lord falls — or, once it's beaten, when you reach its chamber.)`);
  }

  /* ---------- wiring ---------- */
  const _load = World.load.bind(World);
  World.load = async function (name, ...a) {
    const prev = G.S && G.S.map;
    const r = await _load(name, ...a);
    try {
      if (FOREST.includes(name)) { hookCrossings(name); await rivalSpawn(name); await sbSpawn(name); }
      if (name === 'woods' && night() > .5) { const s = W4().spot('woods', 12); if (s) { World.col[s[1]][s[0]] = 1; World.ents.push(new Ent({ id: 'nmarket', x: s[0], y: s[1], dir: 'down', img: stallImg(), size: 1.4, pickup: 1, name: 'Night market', talk: marketTalk })); World.lights.push({ x: s[0] * TILE + 16, y: s[1] * TILE, r: 90, c: '255,200,140' }); } }
      for (const cv of CAVES()) if (cv.sc === name) { const p = plaqueSpot(cv); if (p) { World.col[p[1]][p[0]] = 1; World.ents.push(new Ent({ id: 'plaque_' + cv.id, x: p[0], y: p[1], dir: 'down', img: plaqueImg(), pickup: 1, name: '', talk: () => plaqueTalk(cv.id) })); } }
      if (typeof DUNGEONS !== 'undefined' && DUNGEONS[name] && prev !== name) run = { id: name, t0: performance.now(), wasClear: !!F()['clear_' + name] };
      else if (!(typeof DUNGEONS !== 'undefined' && DUNGEONS[name])) run = null;
    } catch (e) { console.warn('worldplus6', e); }
    return r;
  };
  const _step = World.onStep.bind(World);
  World.onStep = function (e) {
    const r = _step(e);
    try { if (e && e.isPlayer && !World.busy) { const sc = G.S.map;
      if (FOREST.includes(sc) && night() >= .55 && !F()['star_' + sc]) { const s = starSpot(sc); if (s && s[0] === e.x && s[1] === e.y) Story.run(() => starfall(sc)); }
      runTick(); } } catch (x) { }
    return r;
  };
  const _render = World.render.bind(World);
  World.render = function (c, t) {
    _render(c, t);
    try { if (World.player && !World.loading && G.mode === 'world') drawSky(c, t); } catch (e) { }
  };
  hookEchoes();
  window.WorldPlus6 = { crossings, starSpot, season, market, plaqueSpot, CAVES, get run() { return run; } };
})();
