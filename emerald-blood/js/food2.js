'use strict';
/* ================= PROVISIONS 2 (Chat B) =================
   RECIPE BOOK — every dish you cook is written down with its picture; the rest are hinted.
   THE INN'S ORDER — the Ashford innkeeper wants one dish a day. Bring it for a big tip (town services).
   SPOILAGE — raw meat and raw fish go off after a day or so. Cook them, or smoke them.
   HOMESTEAD — a trap line (free meat while you're away), a smoke rack (smoked meat & fish never spoil), and an aquarium.
   COMPANION FAVOURITES — share a meal with a companion; their favourite kind of food deepens your bond.
   BAIT — choose bait when you fish: glowcaps lure night fish, meat lures the big ones, bread brings bites fast.
   HARVEST COOK-OFF — in autumn, Ashford's cooking contest by the fountain. Judges score dish and quality.
   (Lines are B drafts.) */
(function () {
  const S_ = () => G.S, F = () => G.S.f;
  const day = () => (typeof Cal !== 'undefined' ? Cal.day() : 1), week = () => Math.floor((day() - 1) / 7);
  const pick = L => L[Math.floor(Math.random() * L.length)];
  const hash = (s, n) => { let h = 2166136261; for (const c of String(s)) h = Math.imul(h ^ c.charCodeAt(0), 16777619); return (h >>> 0) % Math.max(1, n); };
  const FD = () => window.Food, st = () => FD().st();
  const season = () => (window.WorldPlus3 && WorldPlus3.season && WorldPlus3.season()) || 'spring';

  /* ---------- smoked goods ---------- */
  FD().ING.smokedmeat = ['Smoked Meat', 'meat', 16, ['#7a3a2a', '#a8684a', '#3a1a10'], 'meat'];
  FD().ING.smokedfish = ['Smoked Fish', 'fish', 18, ['#9a7a4a', '#c8a870', '#5a3a1a'], 'meat'];
  const RAW = () => ['meat', 'prime', 'drake', ...Object.keys((window.Fishing && Fishing.FISH) || {}).filter(k => k !== 'gar' && k !== 'goldfin')];

  /* ---------- spoilage ---------- */
  function spoil() {
    const F2 = st(), d = day(); if (!F2.lastDay) { F2.lastDay = d; return; } if (d <= F2.lastDay) return;
    const days = Math.min(5, d - F2.lastDay); F2.lastDay = d; const lost = [];
    for (const k of RAW()) { const n = F2.ing[k] || 0; if (!n) continue; const gone = Math.min(n, Math.ceil(n * (1 - Math.pow(.7, days)))); if (gone) { F2.ing[k] -= gone; lost.push(`${gone} ${FD().ING[k][0]}`); } }
    if (lost.length) toast(`🪰 Gone off in your satchel: ${lost.join(', ')}. (Cook or smoke raw food to keep it.)`, 3600);
  }

  /* ---------- recipe book ---------- */
  const DISH_TAG = { skewer: 'meat', steak: 'meat', roast: 'meat', hstew: 'meat', surf: 'meat', glazed: 'meat', grilled: 'fish', fstew: 'fish', mushskew: 'plant', pie: 'plant', sweetbun: 'sweet', feast: 'all', dubious: '' };
  const HINT = { feast: 'Something legendary — or one of everything.', roast: 'Needs drake.', surf: 'Land meets water.', glazed: 'Meat and something sweet.', hstew: 'Meat and greens.', fstew: 'Fish and greens.',
    steak: 'A prime cut.', sweetbun: 'Bread and honey.', pie: 'A big orange gourd.', mushskew: 'Glowing mushrooms.', skewer: 'Any meat.', grilled: 'Any fish.', dubious: 'Anything that doesn\'t go together.' };
  async function book() {
    const B = st().book || {}, D = FD().DISH, ks = Object.keys(D);
    await new Promise(res => {
      FD().overlay(`<h3>📖 Recipe book — ${ks.filter(k => B[k]).length}/${ks.length}</h3><div class="grid">${ks.map(k => `<div class="cell" style="min-width:120px;text-align:left">${B[k] ? FD().img(FD().icon('meal', k), 28) : '<span style="display:inline-block;width:28px;height:28px;background:#0a0f0b;border-radius:6px;vertical-align:middle"></span>'} <b>${B[k] ? D[k][0] : '???'}</b><br><span class="muted">${B[k] ? FD().fxText(D[k][1]) : HINT[k]}</span></div>`).join('')}</div><div style="text-align:right;margin-top:8px"><button id="bk">Back</button></div>`);
      document.querySelector('#foodOv #bk').addEventListener('click', e => { e.stopPropagation(); res(); });
    });
  }

  /* ---------- companions' favourites ---------- */
  const FAV = ['meat', 'fish', 'plant', 'sweet'];
  const comps = () => (typeof Bonds !== 'undefined' && Bonds.list) ? Bonds.list() : [];
  const favOf = k => FAV[hash(k, 4)];
  async function share(key) {
    const L = comps(); if (!L.length || !(st().meals[key] > 0)) return;
    const who = await new Promise(res => {
      FD().overlay(`<h3>Share ${FD().mealName(key)} with…</h3>${L.map((c, i) => `<div class="row"><b style="flex:1">${Bonds.name(c.k)}</b><span class="muted">loves ${favOf(c.k)} dishes</span><button data-w="${i}">Share</button></div>`).join('')}<div style="text-align:right;margin-top:8px"><button id="nv">Never mind</button></div>`);
      document.querySelectorAll('#foodOv [data-w]').forEach(b => b.addEventListener('click', e => { e.stopPropagation(); res(L[+b.dataset.w]); }));
      document.querySelector('#foodOv #nv').addEventListener('click', e => { e.stopPropagation(); res(null); });
    });
    if (!who) return; st().meals[key]--; const dish = key.split(':')[0], q = +key.split(':')[1], tag = DISH_TAG[dish], love = tag === 'all' || tag === favOf(who.k);
    Bonds.gain(who.k, (love ? 30 : 10) + q * 5); sfx(love ? 'level' : 'heal');
    toast(love ? `💚 <b>${Bonds.name(who.k)}</b> LOVES it — their favourite!` : `${Bonds.name(who.k)} eats happily.`, 2600); save();
  }

  /* ---------- the inn's order of the day ---------- */
  const ORDERABLE = ['skewer', 'grilled', 'hstew', 'fstew', 'steak', 'glazed', 'pie', 'mushskew', 'sweetbun', 'surf', 'roast'];
  const order = () => ORDERABLE[hash('order' + day(), ORDERABLE.length)];
  async function innOrder() {
    const d = order(), D = FD().DISH[d], S = S_();
    if (S.innDay === day()) { await narr('"You\'ve already filled today\'s order, love. Come back tomorrow!"'); return; }
    const have = Object.keys(st().meals).filter(k => k.startsWith(d + ':') && st().meals[k] > 0).sort((a, b) => b.split(':')[1] - a.split(':')[1]);
    await narr(`The innkeeper leans over the board: "Today's order — ${FD().img(FD().icon('meal', d), 26)} <b>${D[0]}</b>. A traveller's paying good money for one."`);
    if (!have.length) { await narr(`(Hint: ${HINT[d]})`); return; }
    const c = await ask(null, null, `Hand over your ${FD().mealName(have[0])}?`, ['Deliver it', 'Keep it']); if (c !== 0) return;
    st().meals[have[0]]--; S.innDay = day(); S.innOrders = (S.innOrders || 0) + 1; const q = +have[0].split(':')[1], tip = 60 + q * 45 + Math.min(60, S.innOrders * 3);
    G.S.gold += tip; UI.hud(); sfx('coin'); await narr(`${['"…It\'s a bit burnt. Still — fair\'s fair."', '"Lovely! Just what they wanted."', '"PERFECT. They\'ll be talking about this all week."'][q]} (${tip} gold)`); save();
  }

  /* ---------- harvest cook-off (autumn) ---------- */
  const TIER = { dubious: 0, skewer: 1, grilled: 1, mushskew: 1, pie: 2, sweetbun: 2, hstew: 3, fstew: 3, steak: 3, glazed: 3, surf: 4, roast: 5, feast: 6 };
  async function cookOff() {
    const S = S_(); S.cookoff = S.cookoff || {};
    if (season() !== 'autumn') { await narr('A painted sign: THE ASHFORD HARVEST COOK-OFF — every autumn, by the fountain. Prizes for the finest dish!'); return; }
    if (S.cookoff[week()]) { await narr(`"You've entered this year! You placed ${['', 'first', 'second', 'third', 'honourably'][S.cookoff[week()]]}."`); return; }
    const M = Object.keys(st().meals).filter(k => st().meals[k] > 0); if (!M.length) { await narr('"No dish, no entry! Cook something and come back."'); return; }
    const c = await ask(null, null, 'The Harvest Cook-off! Which dish will you enter?', [...M.map(k => FD().mealName(k)), 'Not yet']); const k = M[c]; if (!k) return;
    st().meals[k]--; const [dsh, q] = k.split(':'), score = TIER[dsh] * 12 + (+q) * 18 + Math.random() * 14, place = score >= 80 ? 1 : score >= 55 ? 2 : score >= 35 ? 3 : 4;
    S.cookoff[week()] = place; const prize = [0, 500, 250, 120, 40][place]; G.S.gold += prize; UI.hud(); sfx(place === 1 ? 'level' : 'coin');
    await narr(`The three judges taste, chew, confer… ${['', 'FIRST PLACE! The blue ribbon is yours', 'Second place — a red ribbon', 'Third place — a yellow ribbon', 'An honourable mention'][place]}. (${prize} gold)`);
    if (place === 1) { S.cookRibbons = (S.cookRibbons || 0) + 1; const n = window.WorldPlus4 && WorldPlus4.giveRare(); if (n) await narr(`The head judge adds a little something from her own pantry: a <b style="color:#ffd36a">${n}</b>.`); }
    save();
  }

  /* ---------- homestead: trap line, smoke rack, aquarium ---------- */
  const H = () => S_().home || {};
  const HU = () => (S_().homeUp = S_().homeUp || {});
  async function buy(id, cost, what, done) { if (G.S.gold < cost) { await narr(`${what} would cost ${cost} gold.`); return false; } const c = await ask(null, null, `${what} — ${cost} gold?`, ['Build it', 'Not now']); if (c !== 0) return false; G.S.gold -= cost; HU()[id] = day(); UI.hud(); sfx('level'); await narr(done); save(); return true; }
  async function traps() {
    if (!HU().traps) return buy('traps', 200, 'A trap line round the clearing', 'You set snares along the game trails. Check back after a day or two.');
    const days = Math.min(3, day() - HU().traps); if (days <= 0) { await narr('The snares are empty. Give it a day.'); return; }
    HU().traps = day(); let meat = 0, prime = 0; for (let i = 0; i < days; i++) { meat += 1 + (Math.random() < .5 ? 1 : 0); if (Math.random() < .25) prime++; }
    FD().addIng('meat', meat); if (prime) FD().addIng('prime', prime); sfx('blip'); await narr(`The snares caught ${meat} raw meat${prime ? ` and ${prime} prime cut${prime > 1 ? 's' : ''}` : ''}.`); save();
  }
  async function smoke() {
    if (!HU().smoke) return buy('smoke', 250, 'A smoke rack by the fire', 'A rack of green wood over a slow fire. Smoked meat and fish keep forever.');
    const I = st().ing; let m = 0, f = 0;
    for (const k of RAW()) { const n = I[k] || 0; if (!n) continue; I[k] = 0; if (['meat', 'prime', 'drake'].includes(k)) m += n; else f += n; }
    if (!m && !f) { await narr('Nothing raw to smoke right now.'); return; }
    if (m) FD().addIng('smokedmeat', m); if (f) FD().addIng('smokedfish', f); sfx('blip'); await narr(`You hang everything raw over the smoke: ${m ? m + ' smoked meat' : ''}${m && f ? ' and ' : ''}${f ? f + ' smoked fish' : ''}. It\'ll keep now.`); save();
  }
  async function fishTank(build) {
    if (build && !HU().aquarium) return buy('aquarium', 300, 'A glass tank for your best catches', 'A long glass tank, filled from the stream. Your best catches will swim here.');
    const T = window.Fishing ? Fishing.st() : { log: {}, best: {} }, ks = Object.keys(T.log).filter(k => T.log[k]);
    await new Promise(res => {
      FD().overlay(`<h3>${build ? '🐟 Your aquarium' : '🐟 Fish log'} — ${ks.length}/${Object.keys((window.Fishing || { FISH: {} }).FISH).length} species</h3><canvas id="aq" width="460" height="170" style="background:#0b2a3a;border-radius:8px;max-width:100%"></canvas>
        <div class="muted">${ks.map(k => `${Fishing.FISH[k][0]} ×${T.log[k]} (best ${T.best[k].toFixed(1)} kg)`).join(' · ') || 'Nothing caught yet.'}</div><div style="text-align:right;margin-top:6px"><button id="aqx">Back</button></div>`);
      const cv = document.querySelector('#foodOv #aq'), c = cv.getContext('2d'), fish = ks.map((k, i) => ({ k, x: Math.random() * 400, y: 20 + Math.random() * 120, v: (.4 + Math.random() * .6) * (Math.random() < .5 ? 1 : -1), ph: Math.random() * 6 }));
      const can = {}; const fc = k => { if (can[k]) return can[k]; const cc = document.createElement('canvas'); cc.width = cc.height = 16; Fishing.drawFish(cc.getContext('2d'), k); return (can[k] = cc); };
      let raf; const loop = t => { c.fillStyle = '#0b2a3a'; c.fillRect(0, 0, 460, 170); c.fillStyle = '#c8b080'; c.fillRect(0, 158, 460, 12); for (let i = 0; i < 9; i++) { c.fillStyle = '#2a6a3a'; c.fillRect(20 + i * 52, 120 + Math.sin(t / 700 + i) * 4, 4, 40); }
        for (const f of fish) { f.x += f.v; if (f.x < -10 || f.x > 450) f.v *= -1; const y = f.y + Math.sin(t / 500 + f.ph) * 6; c.save(); c.imageSmoothingEnabled = false; if (f.v < 0) { c.translate(f.x + 32, y); c.scale(-1, 1); c.drawImage(fc(f.k), 0, 0, 32, 32); } else c.drawImage(fc(f.k), f.x, y, 32, 32); c.restore(); }
        for (let i = 0; i < 5; i++) { c.fillStyle = 'rgba(200,240,255,.4)'; c.fillRect(60 + i * 90, 150 - ((t / 15 + i * 37) % 150), 2, 2); } raf = requestAnimationFrame(loop); };
      raf = requestAnimationFrame(loop);
      document.querySelector('#foodOv #aqx').addEventListener('click', e => { e.stopPropagation(); cancelAnimationFrame(raf); res(); });
    });
  }
  window.HomeX = window.HomeX || [];
  HomeX.push({ label: () => HU().traps ? 'Check the snares' : 'Build a trap line — 200g', run: traps },
    { label: () => HU().smoke ? 'Use the smoke rack' : 'Build a smoke rack — 250g', run: smoke },
    { label: () => HU().aquarium ? 'Look at the aquarium' : 'Build an aquarium — 300g', run: () => fishTank(true) });

  /* ---------- bait (fishing) ---------- */
  const BAIT = { glowcap: ['Glowcap bait', 'night fish bite more'], meat: ['Meat bait', 'big fish bite more'], bread: ['Bread bait', 'bites come quickly'] };
  let bait = null;
  if (window.Fishing) {
    const _cast = Fishing.cast, _bite = Fishing.biteTable;
    Fishing.cast = async function () {
      bait = null; const have = Object.keys(BAIT).filter(k => (st().ing[k] || 0) > 0);
      if (have.length) { const c = await ask(null, null, 'Bait the hook with…', [...have.map(k => `${BAIT[k][0]} (${BAIT[k][1]}) ×${st().ing[k]}`), 'Just a grub']); if (have[c]) { bait = have[c]; st().ing[bait]--; if (bait === 'bread') G.S.bait = (G.S.bait || 0) + 1; } }
      return _cast();
    };
    Fishing.biteTable = function () {
      const L = _bite(); if (!bait) return L;
      return L.map(([k, w]) => { const f = Fishing.FISH[k]; if (bait === 'glowcap' && (f[4] === 'night' || f[7] === 'glow')) w *= 3; if (bait === 'meat' && f[1] >= 3) w *= 1.8; if (bait === 'bread' && f[1] <= 2) w *= 1.6; return [k, w]; });
    };
  }

  /* ---------- wiring ---------- */
  const CB = (() => { let S; return () => { if (S) return S; const one = document.createElement('canvas'); one.width = one.height = 64; const x = one.getContext('2d'); const R = (c, a, b, w, h) => { x.fillStyle = c; x.fillRect(a, b, w, h); };
    R('rgba(0,0,0,.3)', 8, 58, 48, 4); R('#6b4a2a', 8, 36, 48, 20); R('#8a6038', 8, 36, 48, 2); R('#e8e0d0', 10, 14, 44, 22); R('#d84a2a', 10, 14, 44, 5); R('#2a6aa0', 10, 31, 44, 5); R('#8a5a3a', 22, 40, 6, 6); R('#e8a828', 34, 40, 6, 6); R('#4a8a3a', 44, 41, 5, 5);
    S = document.createElement('canvas'); S.width = 64 * 9; S.height = 64 * 12; const s = S.getContext('2d'); for (let r = 0; r < 12; r++) for (let f = 0; f < 9; f++) s.drawImage(one, f * 64, r * 64); return S; }; })();
  const _load = World.load.bind(World);
  World.load = async function (name, ...a) {
    const r = await _load(name, ...a);
    try { if (G.S) spoil();
      if (name === 'ashford' && window.TownLife && TownLife.freeNear) { const p = TownLife.freeNear(28, 27, null, 4); if (p) { World.col[p[1]][p[0]] = 1; World.ents.push(new Ent({ id: 'cookoff', x: p[0], y: p[1], dir: 'down', img: CB(), size: 1.3, pickup: 1, name: season() === 'autumn' ? 'Cook-off!' : '', talk: cookOff, qm: () => season() === 'autumn' && !((S_().cookoff || {})[week()]) ? '!' : null })); } }
    } catch (e) { console.warn('food2', e); }
    return r;
  };
  if (window.TownLife && TownLife.services) TownLife.services.push({ label: () => `The inn's order of the day: ${FD().DISH[order()][0]}`, run: innOrder });
  window.FoodX = { canShare: () => comps().length > 0, share, book, fishTank, spoil, order, cookOff, innOrder, traps, smoke, get bait() { return bait; } };
})();
