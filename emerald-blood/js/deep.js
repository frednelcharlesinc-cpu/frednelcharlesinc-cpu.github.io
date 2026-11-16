'use strict';
/* ================= WORLD+ 12 (Chat B — World & Maps) =================
   THE UNDERDEEP — every Gate tears into its own pocket of the void (one per forest). Each pocket has a stair down to
                   the Underdeep: floating islands under a dead sky where every rift drains. Portals link the four
                   pockets, the four cleared dungeons and a well back to the Crossroads. The Deep Sovereign sleeps there.
   CHRONICLE IN STONE — eight old frescoes hidden in the dungeons, the pockets and the deep tell the true history.
   THE SUNHIGH ARENA — ride out from Ashford (town services). Bronze, Silver and Gold Cups, a live crowd, a champion.
   (Lore lines, mural captions and the arena roster are B drafts — Chat A may rewrite.) */
(function () {
  const S_ = () => G.S, F = () => G.S.f;
  const DD = () => FCL.ud_deep && FCL.ud_deep.deep;
  const AR = () => FCL.arena && FCL.arena.arena;
  const gold$ = n => `<b style="color:#ffd36a">${n}</b>`;
  const pick = L => L[Math.floor(Math.random() * L.length)];
  const rare = () => { try { return WorldPlus4.giveRare(); } catch (e) { return null; } };
  const week = () => Math.floor(((typeof Cal !== 'undefined' ? Cal.day() : 1) - 1) / 7);
  const sheet = draw => { const one = document.createElement('canvas'); one.width = one.height = 64; const x = one.getContext('2d'); draw(x); const S = document.createElement('canvas'); S.width = 64 * 9; S.height = 64 * 12; const s = S.getContext('2d'); for (let r = 0; r < 12; r++) for (let f = 0; f < 9; f++) s.drawImage(one, f * 64, r * 64); return S; };
  const R = (x, c, a, b, w, h) => { x.fillStyle = c; x.fillRect(a, b, w, h); };
  const lazy = fn => { let S; return () => S || (S = sheet(fn)); };
  const blank = lazy(() => { });
  const tabletImg = lazy(x => { R(x, 'rgba(0,0,0,.35)', 14, 56, 36, 5); R(x, '#5a5266', 16, 14, 32, 44); R(x, '#6e6680', 18, 16, 28, 40); R(x, '#8a7a5a', 21, 20, 22, 30); R(x, '#c9a56a', 23, 24, 6, 8); R(x, '#4f8a6a', 31, 28, 9, 12); R(x, '#a05a4a', 25, 36, 12, 8); R(x, '#d8c8a8', 19, 10, 26, 5); });
  const boardImg = lazy(x => { R(x, 'rgba(0,0,0,.3)', 12, 58, 40, 4); R(x, '#5a3a20', 16, 34, 4, 26); R(x, '#5a3a20', 44, 34, 4, 26); R(x, '#8a5a30', 10, 14, 44, 26); R(x, '#e8d8a8', 14, 18, 16, 18); R(x, '#e8d8a8', 33, 18, 17, 10); R(x, '#c03030', 33, 30, 17, 6); R(x, '#ffd36a', 20, 22, 4, 4); });
  const statueImg = lazy(x => { R(x, 'rgba(0,0,0,.4)', 8, 56, 48, 6); R(x, '#2a2236', 14, 44, 36, 14); R(x, '#3a3050', 18, 10, 28, 36); R(x, '#4a3e66', 22, 4, 20, 14); R(x, '#8a46ff', 26, 10, 4, 3); R(x, '#8a46ff', 34, 10, 4, 3); R(x, '#2a2236', 8, 18, 10, 20); R(x, '#2a2236', 46, 18, 10, 20); });
  const sovImg = lazy(x => { R(x, 'rgba(0,0,0,.4)', 6, 56, 52, 6); R(x, '#120a1e', 12, 12, 40, 46); R(x, '#24123a', 16, 4, 32, 16); R(x, '#c58aff', 24, 10, 5, 4); R(x, '#c58aff', 35, 10, 5, 4); R(x, '#24123a', 2, 16, 12, 30); R(x, '#24123a', 50, 16, 12, 30); R(x, '#5a2a8a', 18, 26, 28, 4); });
  const cam = () => [Math.round(World.cam.x), Math.round(World.cam.y)];
  const DUN = ['d_fang', 'd_cinder', 'd_shrine', 'd_vault'];
  const NAME = { n: 'Mistveil', e: 'Emberroot', s: 'Glimmerfen', w: 'the Old Grove' };

  /* ---------- CHRONICLE IN STONE ---------- */
  const MURALS = [null,
    ['First Dawn', 'Before the Guild, before the Accord, the first Drags woke under a green sun. Their eyes kept its light.'],
    ['The Shield of Green', 'When the wild things came down from the mountains, the Drags stood in front. The humans stood behind them. Always behind.'],
    ['Fratenaptor Rises', 'A dragon crawled out of a broken sky and ate the light over three kingdoms. The painter carved its name deep, so no one could forget it.'],
    ['The Binding', 'A hundred Drags gave up their light to chain it. The painter gave every one of them a face. Count them.'],
    ['The Accord', 'The humans wrote a treaty to thank the Drags. Look at the signatures — then look at the chains under the table.'],
    ['The Scattering', 'The ones who held the shield were called monsters by the ones behind it. They fled to the four woods. This paint is newer, and angrier.'],
    ['The First Gate', 'The Gates are not doors. They are the wounds the Binding left in the world, and every one of them drains down to the deep.'],
    ['The Green-Eyed Child', 'One day a child with the old light will walk the deep road. The wall does not say what happens next. The rest of it is blank.']];
  const MURAL_AT = { d_fang: 1, d_vault: 2, d_cinder: 3, d_shrine: 4, fc_rift_e: 5, fc_rift_s: 6, fc_rift_n: 7, fc_rift_w: 1 };
  const UD_MURALS = [5, 6, 8];
  const seen = () => (S_().murals = S_().murals || {});
  const seenN = () => Object.keys(seen()).length;
  function showMural(n) {
    return new Promise(res => {
      const M = MURALS[n], first = !seen()[n];
      const ov = Food.overlay(`<h3>🏛️ ${M[0]} <span class="muted">(${n} of 8)</span></h3>
        <img src="assets/mural_${n}.jpg" style="max-width:100%;max-height:58vh;border-radius:6px;border:2px solid #6a5a3a;display:block;margin:4px auto">
        <div style="font-style:italic;margin:8px 2px;line-height:1.45">${M[1]}</div>
        <div class="muted">Chronicle in Stone: ${seenN() + (first ? 1 : 0)} / 8 found</div><div style="text-align:right;margin-top:6px"><button id="muOk">Step back</button></div>`);
      ov.querySelector('#muOk').addEventListener('click', ev => { ev.stopPropagation(); Food.closeOv(); res(); });
    });
  }
  async function mural(n) {
    const first = !seen()[n]; sfx('blip');
    await showMural(n);
    if (!first) return;
    seen()[n] = 1; save();
    const k = seenN(); toast(`🏛️ <b>CHRONICLE IN STONE</b> — ${k} / 8`, 2800);
    if (k === 6 && !F().sovereign) toast('<b style="color:#c58aff">Far below, something in the Underdeep opens its eyes.</b>', 3600);
    if (k === 8 && !F().chronicle) {
      F().chronicle = 1; G.S.gold += 600; const a = rare(), b = rare(); S_().title = 'Keeper of the Chronicle'; UI.hud(); sfx('level');
      await narr(`The last fresco. You know the whole story now — the one the Guild scraped off every wall above ground. ${gold$('600 gold')}${a ? `, a ${gold$(a)}` : ''}${b ? ` and a ${gold$(b)}` : ''}. Title earned: <b style="color:#ffd36a">KEEPER OF THE CHRONICLE</b>.`);
      save();
    }
  }
  const muralEnt = (id, x, y, n, img) => new Ent({ id, x, y, dir: 'down', img: img || tabletImg(), name: img === blank() ? '' : 'An old fresco', talk: () => mural(n) });

  /* ---------- the void's enemies ---------- */
  const VOID_BASE = ['m_wartotaur', 'm_vampire', 'm_ghoul', 'm_skeleton', 'm_drake', 'm_troll', 'm_minotaur', 'm_goblin_shaman'];
  function voidKey(k) {
    const B = ENEMY[k]; if (!B) return null; const key = 'void_' + k;
    if (!ENEMY[key]) ENEMY[key] = Object.assign({}, B, { name: 'Voidborn ' + B.name, img: B.img || k, hp: Math.round(B.hp * 1.5), atk: Math.round(B.atk * 1.2), xp: Math.round((B.xp || 10) * 2.2), gold: Math.round((B.gold || 5) * 2), trait: 'Voidborn · ' + ((B.trait || 'it remembers being alive').split(/ — |\(/)[0].trim()) });
    return key;
  }
  function voidParty() {
    const L = VOID_BASE.filter(k => ENEMY[k]); if (!L.length) return ['m_skeleton'];
    const n = Math.random() < .35 ? 2 : 1, out = []; for (let i = 0; i < n; i++) out.push(voidKey(pick(L))); return out.filter(Boolean);
  }

  /* ---------- THE UNDERDEEP ---------- */
  SCENES.underdeep = { title: 'The Underdeep', subtitle: 'Below the Gates, where every rift drains', map: 'ud_deep', music: 'night', bd: 'underdeep', interior: 1, noAmbient: 1, encRate: .08,
    encounters() { return { enemies: voidParty(), bd: 'underdeep' }; },
    setup(W) { W.tint = 'rgba(24,6,48,.30)'; const D = DD(); if (!D) return;
      for (const b in D.pocket) W.lights.push({ x: D.pocket[b][0] * TILE + 16, y: D.pocket[b][1] * TILE, r: 150, c: '200,120,255' });
      for (const id in D.dun) W.lights.push({ x: D.dun[id][0] * TILE + 16, y: D.dun[id][1] * TILE, r: 120, c: F()['clear_' + id] ? '255,210,120' : '120,110,140' });
      W.lights.push({ x: D.well[0] * TILE + 16, y: D.well[1] * TILE, r: 170, c: '120,200,255' }); W.lights.push({ x: D.sovereign[0] * TILE + 16, y: D.sovereign[1] * TILE, r: 160, c: '170,80,255' }); },
    npcs() { return []; }, get exits() { return []; } };

  async function toPocket(b) {
    const c = await ask(null, null, `A torn doorway, ringing like a struck glass. Through it: the pocket under ${NAME[b]}.`, ['Step through', 'Stay']);
    if (c !== 0) return; S_().pocketB = b; const R = FCL['fc_rift_' + b].rift; sfx('blip'); await World.go('gate_rift', R.start[0], R.start[1], 'up');
  }
  async function toDungeon(id) {
    const d = (typeof DUNGEONS !== 'undefined' && DUNGEONS[id]) || { title: id };
    if (!F()['clear_' + id]) { await narr(`A doorway of cold grey light. On the other side you can hear ${d.title} — but whatever rules it up there is holding this way shut. Clear it from the surface first.`); return; }
    const c = await ask(null, null, `A doorway of warm gold light. ${d.title} lies through it — the deep way in.`, ['Go through', 'Stay']); if (c !== 0) return;
    const D = DD(), at = D.dun[id]; S_().dret = { map: 'underdeep', x: at[0], y: at[1] + 1 }; const st = G.maps[id].dungeon.start;
    await World.go(id, st[0], st[1], 'up'); banner(d.title.toUpperCase(), 'by the deep road', 2200);
  }
  async function well() {
    const c = await ask(null, null, 'A well of blue light rising straight up into the dark. Far above, very small: the Crossroads stones.', ['Rise', 'Stay']);
    if (c !== 0) return; delete S_().pocketB; sfx('blip'); await World.go('woods', 24, 21, 'down'); toast('You surface at the Crossroads, dripping starlight.', 2600);
  }
  async function lore() {
    const L = ['Carved in old Drag letters, very small: WE DID NOT OPEN THE GATES. WE ARE WHAT KEPT THEM SHUT.',
      'A second hand, newer, scratched under it: THE GUILD KNOWS. THE GUILD HAS ALWAYS KNOWN.',
      'At the bottom, a child\'s hand pressed into the stone. It is exactly the size of yours.'];
    const i = (F().udLore || 0) % L.length; F().udLore = (F().udLore || 0) + 1; await narr(L[i]); save();
  }
  async function voidPool() {
    if (window.Fishing && Fishing.cast) { await narr('A pool of liquid starlight. Something long and pale circles under the surface.'); return Fishing.cast(); }
    await narr('A pool of liquid starlight. Something long and pale circles under the surface.');
  }
  async function sovereign() {
    if (F().sovereign) { await narr('The throne of the Deep Sovereign is empty now. The void around it is quieter — almost peaceful.'); return; }
    if (seenN() < 6) { await narr(`A shape on a throne of black glass, bigger than a house, eyes shut. It is not asleep — it is waiting. The walls of the deep are still telling its story. (Chronicle in Stone: ${seenN()} / 6 to wake it.)`); return; }
    const B = ENEMY.m_wartotaur || ENEMY.m_minotaur || ENEMY.m_troll;
    if (!ENEMY.deep_sovereign) ENEMY.deep_sovereign = Object.assign({}, B, { name: 'The Deep Sovereign', img: B.img || (ENEMY.m_wartotaur ? 'm_wartotaur' : 'm_minotaur'), boss: 1, hp: Math.round(B.hp * 4.5), atk: Math.round(B.atk * 1.6), xp: Math.round((B.xp || 40) * 9), gold: 0, trait: 'Sovereign of the Underdeep · drinks the light of every Gate' });
    await narr('The eyes open — purple, and very old. "YOU HAVE READ THE WALLS, LITTLE LIGHT. THEN YOU KNOW WHAT I AM. I AM WHAT THE BINDING LEFT BEHIND."');
    const r = await Battle.start({ enemies: ['deep_sovereign', voidKey('m_ghoul') || 'm_skeleton'], boss: true, noFlee: true, bd: 'underdeep', music: 'boss', intro: 'THE DEEP SOVEREIGN' });
    if (r === 'lose') { await Story.defeat(); return; } if (r !== 'win') return;
    F().sovereign = 1; const e = World.ents.find(n => n.id === 'sovereign'); if (e) e.img = statueImg();
    G.S.gold += 1500; const a = rare(), b = rare(), c = rare(); S_().title = 'Deepwalker'; UI.hud(); sfx('level');
    await narr(`The Sovereign comes apart like smoke in wind. For a moment every Gate in the world flickers. ${gold$('1500 gold')}${[a, b, c].filter(Boolean).map(x => `, a ${gold$(x)}`).join('')}. Title earned: <b style="color:#c58aff">DEEPWALKER</b>.`);
    save();
  }

  /* ---------- the pocket's stair down ---------- */
  async function deepStair(b) {
    const c = await ask(null, null, F().udSeen ? 'The stair of broken light, spiralling down into the deep.' : 'At the edge of the island, the light folds down into a stair — down, and down, into a dark full of stars.', ['Go down', 'Stay']);
    if (c !== 0) return; const D = DD(), a = D.arrive[b] || D.start;
    await World.go('underdeep', a[0], a[1], 'down');
    if (!F().udSeen) { F().udSeen = 1; save(); banner('THE UNDERDEEP', 'where every Gate drains', 2800); setTimeout(() => Story.run(() => narr('Islands of old stone float under a sky with no sun. Bridges of light hang between them. Somewhere below, something enormous breathes.')), 2900); }
  }

  /* ---------- THE SUNHIGH ARENA ---------- */
  const CUPS = [
    { id: 'bronze', name: 'Bronze Cup', prize: 150, rares: 1, bouts: [['m_goblin', 'm_goblin'], ['bandit', 'bandit'], ['m_orc']] },
    { id: 'silver', name: 'Silver Cup', prize: 350, rares: 2, bouts: [['m_lizard', 'm_lizard'], ['m_tusker', 'm_goblin_shaman'], ['m_troll'], ['m_minotaur']] },
    { id: 'gold', name: 'Gold Cup', prize: 700, rares: 2, bouts: [['m_orc', 'm_orc', 'm_goblin_shaman'], ['m_drake'], ['m_vampire'], ['m_wartotaur'], ['sun_champion']] }];
  const ast = () => (S_().arena = S_().arena || { cups: {}, wins: 0, champWeek: -1 });
  function champKey() {
    if (!ENEMY.sun_champion) { const B = ENEMY.m_minotaur || ENEMY.m_orc; ENEMY.sun_champion = Object.assign({}, B, { name: 'Varro the Unbroken', img: B.img || (ENEMY.m_minotaur ? 'm_minotaur' : 'm_orc'), boss: 1, hp: Math.round(B.hp * 3), atk: Math.round(B.atk * 1.4), xp: Math.round((B.xp || 30) * 4), gold: 0, trait: 'Reigning champion of the Sunhigh Arena · ninety bouts, no losses' }); }
    return 'sun_champion';
  }
  SCENES.arena = { title: 'The Sunhigh Arena', subtitle: 'Blood on the sand, gold in the stands', map: 'arena', music: 'town', bd: 'arena', noAmbient: 1, safe: 1,
    setup(W) { W.tint = 'rgba(255,190,90,.06)'; },
    npcs() { return []; },
    get exits() { const A = AR(), r = S_().arenaRet || { map: 'ashford', x: 30, y: 20 }; return A ? [{ x: A.exit[0], y: A.exit[1], to: r.map, tx: r.x, ty: r.y, dir: 'down', label: 'the road home' }] : []; } };

  async function rideToArena() {
    if (G.S.gold < 40) { await narr('"Forty gold to the Sunhigh, friend. The horses don\'t eat promises."'); return; }
    const c = await ask(null, null, 'The arena wagon leaves on the hour — forty gold, half a day east, and the crowd\'s already shouting. Ride out?', ['Ride (40g)', 'Not today']); if (c !== 0) return;
    G.S.gold -= 40; UI.hud(); const p = World.player; S_().arenaRet = { map: G.S.map, x: p.x, y: p.y };
    const A = AR(); await World.go('arena', A.start[0], A.start[1], 'up'); banner('THE SUNHIGH ARENA', 'blood on the sand, gold in the stands', 2600); roar(.6);
  }
  async function master() {
    const a = ast(), L = CUPS.filter((c, i) => i === 0 || a.cups[CUPS[i - 1].id]);
    const opts = L.map(c => `${c.name} — ${c.bouts.length} bouts${a.cups[c.id] ? ' ✓' : ''}`);
    const champ = a.cups.gold && a.champWeek !== week();
    if (champ) opts.push('Challenge the reigning champion');
    opts.push('Leave');
    const ch = await ask(null, null, '"Sign the sheet, pick your cup. No fleeing, no magic from the stands — and if you fall, my medics will scrape you up. The crowd pays for blood, not funerals."', opts);
    if (L[ch]) return runCup(L[ch]);
    if (champ && ch === L.length) return champFight();
  }
  async function runCup(cup) {
    const n = cup.bouts.length;
    for (let i = 0; i < n; i++) {
      const en = cup.bouts[i].map(k => k === 'sun_champion' ? champKey() : k).filter(k => ENEMY[k]); if (!en.length) en.push('bandit');
      banner(`${cup.name.toUpperCase()} — BOUT ${i + 1} OF ${n}`, i === n - 1 ? 'the final' : 'the crowd is on its feet', 1800); roar(.5);
      const r = await Battle.start({ enemies: en, noFlee: true, bd: 'arena', music: i === n - 1 ? 'boss' : 'battle', intro: `BOUT ${i + 1}` });
      if (r !== 'win') { Story.heal(true); roar(.25); await narr(`The crowd groans. Medics haul you off the sand by your ankles. ${cup.name}: out in bout ${i + 1}. "Come back when you've healed," says the arena master. "They loved you anyway."`); save(); return; }
      ast().wins++; cheer(); if (i < n - 1) toast(`<b>BOUT ${i + 1} WON!</b> The sand is raked. Next one's coming.`, 2000);
    }
    const a = ast(), first = !a.cups[cup.id]; a.cups[cup.id] = (a.cups[cup.id] || 0) + 1;
    const g = first ? cup.prize : Math.round(cup.prize / 3); G.S.gold += g; const rs = []; if (first) for (let k = 0; k < cup.rares; k++) { const x = rare(); if (x) rs.push(x); }
    UI.hud(); sfx('level'); cheer(1);
    await narr(`<b>${cup.name.toUpperCase()} — CHAMPION!</b> The stands go wild; flowers and coins rain onto the sand. ${gold$(g + ' gold')}${rs.map(x => `, a ${gold$(x)}`).join('')}.${first ? '' : ' (Repeat win — a smaller purse.)'}`);
    if (cup.id === 'gold' && !F().sandChamp) { F().sandChamp = 1; S_().title = 'Champion of the Sand'; toast('🏆 TITLE EARNED — <b>CHAMPION OF THE SAND</b>', 3400); }
    save();
  }
  async function champFight() {
    await narr('Varro the Unbroken steps out of the shade, rolling his shoulders. Ninety bouts. No losses. The crowd chants his name — and then, slowly, yours.');
    const r = await Battle.start({ enemies: [champKey()], boss: true, noFlee: true, bd: 'arena', music: 'boss', intro: 'VARRO THE UNBROKEN' });
    ast().champWeek = week();
    if (r !== 'win') { Story.heal(true); await narr('"Not this week," Varro says, offering you a hand up. "But you made them scream. Come back."'); save(); return; }
    ast().champWins = (ast().champWins || 0) + 1; G.S.gold += 400; const x = rare(); UI.hud(); sfx('level'); cheer(1);
    await narr(`Varro hits the sand — and laughs. "NINETY-ONE," he shouts to the crowd, pointing at you. ${gold$('400 gold')}${x ? ` and a ${gold$(x)}` : ''}. He'll be back next week, and so can you.`); save();
  }
  async function arenaBoard() {
    const a = ast(), c = CUPS.map(x => `${x.name}: ${a.cups[x.id] ? `won ×${a.cups[x.id]}` : '—'}`).join(' · ');
    await narr(`<b>SUNHIGH ARENA — RECORDS</b><br>${c}<br>Bouts won: ${a.wins}. Champion beaten: ${a.champWins || 0}×.<br><span style="opacity:.8">Chalked underneath: VARRO 90 – 0. Someone has added a tiny "+1?" in a different hand.</span>`);
  }

  /* ---------- the crowd ---------- */
  let crowd = null, confetti = [], cheerUntil = 0;
  function buildCrowd() {
    const A = AR(); crowd = []; const C = ['#c03a3a', '#3a6ac0', '#e0b040', '#3a9a5a', '#a05ac0', '#e07a30', '#d8d0c0', '#5a4a3a'];
    for (let ring = 0; ring < 3; ring++) { const rr = 2.2 + ring * 1.25, n = 70 + ring * 12;
      for (let i = 0; i < n; i++) { const a = i / n * Math.PI * 2; if (a > Math.PI * .36 && a < Math.PI * .64) continue;   // the gate at the bottom
        crowd.push({ x: A.cx + .5 + Math.cos(a) * (A.rx + rr), y: A.cy + .5 + Math.sin(a) * (A.ry + rr * .8), c: C[(i * 7 + ring * 3) % C.length], s: ['#e8c8a0', '#c89a70', '#8a5a3a', '#f0d8b8'][(i + ring) % 4], ph: i * .7 + ring, a }); } }
  }
  function cheer(big) { cheerUntil = performance.now() + (big ? 4200 : 2400); roar(big ? 1 : .7); const A = AR(); for (let i = 0; i < (big ? 90 : 40); i++) confetti.push({ x: (A.cx + (Math.random() - .5) * A.rx * 2) * TILE, y: (A.cy - A.ry - 2) * TILE + Math.random() * 40, vx: (Math.random() - .5) * .6, vy: .6 + Math.random() * .8, c: pick(['#ffd36a', '#ff6a6a', '#6ad0ff', '#8aff8a', '#ffffff']), life: 400 + Math.random() * 200 }); }
  function drawCrowd(c, t) {
    if (!crowd) buildCrowd(); const [cx, cy] = cam(), hot = performance.now() < cheerUntil, wave = (t / 900) % (Math.PI * 2);
    for (const p of crowd) {
      const X = p.x * TILE - cx, Y = p.y * TILE - cy; if (X < -20 || Y < -30 || X > G.view.w + 20 || Y > (G.view.fullH || G.view.h) + 30) continue;
      const near = Math.abs(((p.a - wave + Math.PI * 3) % (Math.PI * 2)) - Math.PI) < .35;
      const jump = hot ? Math.abs(Math.sin(t / 110 + p.ph)) * 7 : (near ? 6 : Math.abs(Math.sin(t / 700 + p.ph)) * 1.5);
      c.fillStyle = p.c; c.fillRect(X - 5, Y - 6 - jump, 10, 10);
      c.fillStyle = p.s; c.beginPath(); c.arc(X, Y - 10 - jump, 4.5, 0, 7); c.fill();
      if (hot || near) { c.fillStyle = p.s; c.fillRect(X - 8, Y - 18 - jump, 3, 8); c.fillRect(X + 5, Y - 18 - jump, 3, 8); }
    }
    for (const f of confetti) { f.x += f.vx * 2; f.y += f.vy * 2; f.life -= 2; c.fillStyle = f.c; c.fillRect(f.x - cx, f.y - cy, 3, 4); }
    confetti = confetti.filter(f => f.life > 0);
  }
  let AC = null;
  function roar(vol) {
    try {
      AC = AC || new (window.AudioContext || window.webkitAudioContext)(); const len = AC.sampleRate * 1.8, buf = AC.createBuffer(1, len, AC.sampleRate), d = buf.getChannelData(0);
      for (let i = 0; i < len; i++) { const e = i / len; d[i] = (Math.random() * 2 - 1) * Math.min(1, e * 6) * (1 - e) * (1 - e); }
      const s = AC.createBufferSource(), f = AC.createBiquadFilter(), g = AC.createGain(); f.type = 'bandpass'; f.frequency.value = 700; f.Q.value = .6; g.gain.value = .22 * vol * ((G.S.opts && G.S.opts.sfx === 0) ? 0 : 1);
      s.buffer = buf; s.connect(f); f.connect(g); g.connect(AC.destination); s.start();
    } catch (e) { }
  }

  /* ---------- the dimension: motes, shimmer and portals ---------- */
  const GATEFLOOR = /^gate[1-4]$/;
  function drawMotes(c, t, col) {
    const w = G.view.w, h = G.view.fullH || G.view.h;
    for (let i = 0; i < 46; i++) { const sp = 12 + (i * 7) % 23, x = ((i * 97.3 + Math.sin(t / 2000 + i) * 40) % w + w) % w, y = h - (((t / 1000) * sp + i * 53) % (h + 40)) + 20, a = .25 + .35 * Math.abs(Math.sin(t / 600 + i));
      c.fillStyle = `rgba(${col},${a.toFixed(2)})`; c.fillRect(x, y, i % 3 ? 2 : 3, i % 3 ? 2 : 3); }
    const p = .08 + .05 * Math.sin(t / 900), g = c.createRadialGradient(w / 2, h / 2, Math.min(w, h) * .3, w / 2, h / 2, Math.max(w, h) * .75);
    g.addColorStop(0, 'rgba(0,0,0,0)'); g.addColorStop(1, `rgba(${col},${p.toFixed(3)})`); c.fillStyle = g; c.fillRect(0, 0, w, h);
  }
  function swirl(c, t, tx, ty, rgb, k) {
    const [cx, cy] = cam(), X = tx * TILE + 16 - cx, Y = ty * TILE + 4 - cy; k = k || 1;
    for (let i = 5; i > 0; i--) { c.fillStyle = `rgba(${rgb},${((.1 + .05 * Math.sin(t / 220 + i)) * k).toFixed(2)})`; c.beginPath(); c.ellipse(X, Y, 9 + i * 3.5, 16 + i * 4, 0, 0, 7); c.fill(); }
    c.strokeStyle = `rgba(${rgb},${(.85 * k).toFixed(2)})`; c.lineWidth = 2; c.beginPath(); c.ellipse(X, Y, 11, 20, Math.sin(t / 500) * .25, 0, 7); c.stroke();
    for (let j = 0; j < 6; j++) { const a = t / 380 + j * 1.05; c.fillStyle = `rgba(255,255,255,${(.8 * k).toFixed(2)})`; c.fillRect(X + Math.cos(a) * 17, Y + Math.sin(a) * 24, 2, 2); }
  }
  const _render = World.render.bind(World);
  World.render = function (c, t) {
    _render(c, t);
    try {
      if (G.mode !== 'world' || !World.player || World.loading) return; const m = G.S.map;
      if (m === 'underdeep') { const D = DD(); for (const b in D.pocket) swirl(c, t, D.pocket[b][0], D.pocket[b][1], '200,130,255');
        for (const id in D.dun) swirl(c, t, D.dun[id][0], D.dun[id][1], F()['clear_' + id] ? '255,210,120' : '140,130,160', F()['clear_' + id] ? 1 : .45);
        swirl(c, t, D.well[0], D.well[1], '120,200,255'); drawMotes(c, t, '190,140,255'); }
      else if (m === 'gate_rift') { const b = S_().pocketB || ((/^woods_([nesw])/.exec((S_().gateEv || {}).scene || '') || [])[1]) || 'w', Rr = FCL['fc_rift_' + b] && FCL['fc_rift_' + b].rift;
        if (Rr && Rr.deep) swirl(c, t, Rr.deep[0], Rr.deep[1], '170,90,255'); drawMotes(c, t, '200,140,255'); }
      else if (GATEFLOOR.test(m)) drawMotes(c, t, '120,255,190');
      else if (m === 'arena') drawCrowd(c, t);
    } catch (e) { }
  };

  /* ---------- scene hooks ---------- */
  const _load = World.load.bind(World);
  World.load = async function (name, ...a) {
    // the four dungeons were rebuilt bigger — an old save standing inside one starts again at the entrance
    if (DUN.includes(name) && !F().dun3 && G.maps[name] && G.maps[name].dungeon) { F().dun3 = 1; if (G.S.map === name && typeof a[0] === 'number') { const st = G.maps[name].dungeon.start; a[0] = st[0]; a[1] = st[1]; } }
    const r = await _load(name, ...a);
    try {
      const W = World;
      if (name === 'underdeep') { const D = DD();
        for (const b in D.pocket) W.ents.push(new Ent({ id: 'udp_' + b, x: D.pocket[b][0], y: D.pocket[b][1], dir: 'down', img: blank(), name: '', talk: () => toPocket(b) }));
        for (const id in D.dun) W.ents.push(new Ent({ id: 'udd_' + id, x: D.dun[id][0], y: D.dun[id][1], dir: 'down', img: blank(), name: '', talk: () => toDungeon(id) }));
        W.ents.push(new Ent({ id: 'udwell', x: D.well[0], y: D.well[1], dir: 'down', img: blank(), name: '', talk: well }));
        D.murals.forEach((m, i) => W.ents.push(muralEnt('udm' + i, m[0], m[1], UD_MURALS[i])));
        W.ents.push(new Ent({ id: 'udlore', x: D.lore[0], y: D.lore[1], dir: 'down', img: statueImg(), name: 'A Drag keeper', talk: lore }));
        W.ents.push(new Ent({ id: 'sovereign', x: D.sovereign[0], y: D.sovereign[1], dir: 'down', img: F().sovereign ? statueImg() : sovImg(), size: 1.6, name: F().sovereign ? '' : 'The Deep Sovereign', talk: sovereign }));
        if (D.gar) W.ents.push(new Ent({ id: 'udpool', x: D.gar[0], y: D.gar[1], dir: 'down', img: blank(), name: '', talk: voidPool }));
      }
      if (name === 'gate_rift') { const m = SCENES.gate_rift.map, Rr = FCL[m] && FCL[m].rift, b = m.slice(-1);
        if (Rr && Rr.deep && DD()) W.ents.push(new Ent({ id: 'deepstair', x: Rr.deep[0], y: Rr.deep[1], dir: 'down', img: blank(), name: '', talk: () => deepStair(b) }));
        if (Rr && Rr.mural && MURAL_AT[m]) W.ents.push(muralEnt('riftmural', Rr.mural[0], Rr.mural[1], MURAL_AT[m]));
        W.lights.push({ x: Rr.deep[0] * TILE + 16, y: Rr.deep[1] * TILE, r: 130, c: '170,90,255' });
      }
      if (DUN.includes(name) && FCL[name] && FCL[name].dx && FCL[name].dx.mural) { const [x, y] = FCL[name].dx.mural;
        W.ents.push(muralEnt('dmural', x, y - 1, MURAL_AT[name], blank()));
        W.lights.push({ x: x * TILE + 16, y: (y - 1) * TILE, r: 90, c: '255,220,160' }); }
      if (name === 'arena') { const A = AR(); crowd = null;
        let im; try { im = await npcImg('folk19'); } catch (e) { im = statueImg(); }
        W.ents.push(new Ent({ id: 'arenamaster', x: A.master[0], y: A.master[1], dir: 'down', img: im, name: 'Arena master', talk: master }));
        W.ents.push(new Ent({ id: 'arenaboard', x: A.board[0], y: A.board[1], dir: 'down', img: boardImg(), name: 'Records', talk: arenaBoard }));
        if (ast().cups.gold && ast().champWeek !== week()) { let ci; try { ci = await npcImg(ENEMY[champKey()].img); } catch (e) { ci = null; } if (ci) W.ents.push(new Ent({ id: 'arenachamp', x: A.champ[0], y: A.champ[1], dir: 'down', img: ci, size: 1.3, name: 'Varro the Unbroken', talk: champFight })); }
      }
    } catch (e) { console.warn('deep', e); }
    return r;
  };

  /* ---------- the way in: town services ---------- */
  if (window.TownLife && TownLife.services) TownLife.services.push({ label: 'The arena wagon (Sunhigh Arena — 40g)', run: rideToArena });

  window.Deep = { mural, showMural, MURALS, seenN, toPocket, deepStair, toDungeon, sovereign, runCup, master, champFight, rideToArena, cheer, roar, CUPS, voidParty };
})();
