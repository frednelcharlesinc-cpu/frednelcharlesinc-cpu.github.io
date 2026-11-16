'use strict';
/* ================= PROVISIONS — food, cooking, drops & the satchel (Chat B; touches items — see COORDINATION) =================
   INGREDIENTS drop from beasts and monsters you beat (Zelda-style): raw meat, prime cuts, drake steak, glowcaps,
   gourd flesh, trail bread, wild honey… plus every fish you catch, plus moonpetals.
   COOKING — at any campfire (and your homestead): drop up to 3 ingredients in the pot, then nail the heat three times.
   Burnt / Good / Perfect decides how strong the dish is.
   MEALS heal and buff — eat them from the 🎒 satchel, or in battle from Items.
   LIMITS — the satchel only holds so much (tonics, ethers, meals), and in a fight you can only reach for it 3 times.
   Upgrade the satchel in Ashford for more of both. */
(function () {
  const S_ = () => G.S;
  const pick = L => L[Math.floor(Math.random() * L.length)];

  /* ---------- the data ---------- */
  // id: [name, tag, sellPrice, palette, shape]
  const ING = {
    meat: ['Raw Meat', 'meat', 8, ['#c84a4a', '#e88a7a', '#f0e0d0'], 'meat'],
    prime: ['Prime Cut', 'meat', 25, ['#a8283a', '#e86a6a', '#fff0e0'], 'meat'],
    drake: ['Drake Steak', 'drake', 60, ['#d86a2a', '#ffb050', '#3a1a10'], 'meat'],
    glowcap: ['Glowcap', 'plant', 10, ['#4ad8c8', '#c8fff0', '#e8e0c8'], 'shroom'],
    gourd: ['Gourd Flesh', 'plant', 8, ['#e88a2a', '#ffc860', '#4a8a2a'], 'gourd'],
    bread: ['Trail Bread', 'plant', 6, ['#c8904a', '#e8c080', '#8a5a2a'], 'bread'],
    honey: ['Wild Honey', 'sweet', 30, ['#e8a828', '#ffe080', '#8a5a2a'], 'jar'],
    moonpetal: ['Moonpetal', 'plant', 15, ['#cfe6ff', '#9fd8ff', '#3f8a2e'], 'flower']
  };
  // fish live in fishing.js (FISH) — they register themselves into ING with tag 'fish' (legendary ones: 'legend')
  const DISH = {
    skewer: ['Meat Skewer', { hp: .3 }, 'skewer', ['#a8482a', '#e88a5a']],
    steak: ['Hearty Steak', { hp: .55, atk: .15 }, 'plate', ['#8a2a2a', '#e86a4a']],
    grilled: ['Grilled Fish', { hp: .3, mp: 6 }, 'fishplate', ['#c8c8d8', '#e8a050']],
    fstew: ['Fish & Herb Stew', { hp: .45, mp: 10 }, 'bowl', ['#d8e8c8', '#6aa04a']],
    hstew: ['Hunter\'s Stew', { hp: .5, def: .15 }, 'bowl', ['#a86a3a', '#e8c080']],
    surf: ['Surf & Turf', { hp: .6, atk: .1 }, 'plate', ['#c8484a', '#c8c8d8']],
    glazed: ['Honey-Glazed Meat', { hp: .5, spd: .15 }, 'plate', ['#e8a828', '#a8482a']],
    mushskew: ['Glowcap Skewer', { mp: 10 }, 'skewer', ['#4ad8c8', '#c8fff0']],
    pie: ['Gourd Pie', { hp: .35, def: .1 }, 'pie', ['#e88a2a', '#e8c080']],
    roast: ['Drake Roast', { hp: .7, atk: .25 }, 'plate', ['#d86a2a', '#ffb050']],
    sweetbun: ['Honey Bun', { hp: .25, mp: 8, spd: .1 }, 'bun', ['#e8c080', '#e8a828']],
    feast: ['Feast of the Vale', { hp: 1, mp: 20, atk: .2, def: .2, spd: .1 }, 'feast', ['#46ff95', '#e8c080']],
    dubious: ['Dubious Food', { hp: .1 }, 'bowl', ['#6a6a5a', '#8a7a5a']]
  };
  const RECIPES = [   // [dish, needs (tags or ids), priority]
    ['feast', ['legend'], 100], ['feast', ['drake', 'fish', 'sweet'], 95], ['roast', ['drake'], 80],
    ['surf', ['meat', 'fish'], 60], ['glazed', ['meat', 'sweet'], 60], ['hstew', ['meat', 'plant'], 55], ['fstew', ['fish', 'plant'], 55],
    ['steak', ['prime'], 50], ['sweetbun', ['bread', 'sweet'], 50], ['pie', ['gourd'], 40], ['mushskew', ['glowcap'], 35],
    ['skewer', ['meat'], 30], ['grilled', ['fish'], 30], ['dubious', [], 0]];
  const QN = ['Burnt', 'Good', 'Perfect'], QM = [.6, 1, 1.4];

  /* ---------- the satchel (limits) ---------- */
  const st = () => { const S = S_(); S.food = S.food || { ing: {}, meals: {} }; S.food.ing = S.food.ing || {}; S.food.meals = S.food.meals || {}; return S.food; };
  const tier = () => S_().satchel || 0;
  const CAP = () => ({ tonic: 8 + tier() * 2, ether: 5 + tier(), meals: 8 + tier() * 3, ing: 20 + tier() * 5, perFight: 3 + tier() });
  const mealCount = () => Object.values(st().meals).reduce((a, b) => a + b, 0);
  let capWarn = 0;
  function clampCaps() {
    const S = S_(); if (!S || !S.items) return; const C = CAP(); let over = [];
    if ((S.items.tonic || 0) > C.tonic) { over.push(`${S.items.tonic - C.tonic} tonic${S.items.tonic - C.tonic > 1 ? 's' : ''}`); S.items.tonic = C.tonic; }
    if ((S.items.ether || 0) > C.ether) { over.push(`${S.items.ether - C.ether} ether${S.items.ether - C.ether > 1 ? 's' : ''}`); S.items.ether = C.ether; }
    for (const k of Object.keys(st().ing)) if (st().ing[k] > C.ing) { over.push(`${st().ing[k] - C.ing} ${(ING[k] || [k])[0]}`); st().ing[k] = C.ing; }
    if (over.length && performance.now() > capWarn) { capWarn = performance.now() + 4000; toast(`🎒 Satchel full — left behind: ${over.join(', ')}. (Upgrade the satchel in Ashford.)`, 3200); }
  }
  function addIng(id, n = 1) { const F = st(); F.ing[id] = (F.ing[id] || 0) + n; clampCaps(); }
  function addMeal(key, n = 1) { if (mealCount() + n > CAP().meals) { toast('🎒 No room for more meals — eat something first!', 2600); return false; } st().meals[key] = (st().meals[key] || 0) + n; const F = st(); F.book = F.book || {}; F.book[key.split(':')[0]] = 1; return true; }

  /* ---------- art: little pixel icons, drawn once ---------- */
  const ART = {};
  function icon(kind, id) {
    const k = kind + ':' + id; if (ART[k]) return ART[k];
    const c = document.createElement('canvas'); c.width = c.height = 16; const x = c.getContext('2d'), P = (col, a, b, w = 1, h = 1) => { x.fillStyle = col; x.fillRect(a, b, w, h); };
    if (kind === 'fish' && window.Fishing) Fishing.drawFish(x, id);
    else if (kind === 'ing') { const [, , , pal, sh] = ING[id] || ['', '', 0, ['#888', '#aaa', '#ccc'], 'meat'];
      if (sh === 'meat') { P(pal[0], 3, 5, 9, 7); P(pal[1], 4, 6, 6, 2); P(pal[2], 11, 4, 3, 3); P(pal[2], 12, 11, 2, 2); P('#00000040', 3, 11, 9, 1); }
      if (sh === 'shroom') { P(pal[0], 3, 3, 10, 5); P(pal[1], 5, 4, 2, 2); P(pal[1], 9, 5, 2, 1); P(pal[2], 7, 8, 3, 6); }
      if (sh === 'gourd') { P(pal[0], 3, 5, 10, 8); P(pal[1], 5, 6, 2, 5); P(pal[2], 7, 2, 2, 3); }
      if (sh === 'bread') { P(pal[0], 2, 6, 12, 6); P(pal[1], 3, 5, 10, 2); P(pal[2], 5, 7, 1, 3); P(pal[2], 8, 7, 1, 3); P(pal[2], 11, 7, 1, 3); }
      if (sh === 'jar') { P('#8a6a4a', 5, 2, 6, 2); P(pal[0], 4, 4, 8, 9); P(pal[1], 5, 5, 2, 6); P('#fff4', 9, 6, 1, 4); }
      if (sh === 'flower') { P(pal[2], 7, 8, 2, 6); P(pal[0], 5, 3, 6, 5); P(pal[1], 7, 4, 2, 3); } }
    else if (kind === 'meal') { const [, , sh, pal] = DISH[id] || DISH.dubious;
      if (sh === 'skewer') { P('#c8a070', 1, 13, 14, 1); for (let i = 0; i < 3; i++) { P(pal[i % 2], 3 + i * 4, 9, 3, 4); } }
      if (sh === 'plate' || sh === 'fishplate') { P('#e8e8f0', 1, 10, 14, 4); P('#b8b8c8', 2, 13, 12, 1); if (sh === 'fishplate') { P(pal[0], 4, 7, 7, 4); P(pal[0], 11, 6, 2, 5); P('#222', 5, 8, 1, 1); P(pal[1], 3, 10, 2, 1); } else { P(pal[0], 4, 6, 8, 5); P(pal[1], 5, 7, 4, 2); P('#4a8a2a', 11, 8, 2, 2); } }
      if (sh === 'bowl') { P('#8a5a3a', 2, 8, 12, 6); P('#6a3a2a', 3, 13, 10, 1); P(pal[0], 3, 7, 10, 2); P(pal[1], 5, 7, 2, 1); P(pal[1], 9, 7, 2, 1); P('#ffffff55', 6, 3, 1, 3); P('#ffffff55', 9, 2, 1, 3); }
      if (sh === 'pie') { P(pal[1], 2, 8, 12, 5); P(pal[0], 3, 7, 10, 2); P('#8a5a2a', 4, 9, 1, 3); P('#8a5a2a', 8, 9, 1, 3); P('#8a5a2a', 11, 9, 1, 3); }
      if (sh === 'bun') { P(pal[0], 3, 6, 10, 7); P(pal[1], 5, 5, 6, 2); P('#fff8', 6, 7, 2, 1); }
      if (sh === 'feast') { P('#e8e8f0', 0, 11, 16, 4); P('#d86a2a', 2, 6, 6, 6); P('#c8c8d8', 8, 7, 6, 4); P(pal[0], 6, 3, 4, 3); P('#ffe080', 12, 5, 2, 2); } }
    return (ART[k] = c.toDataURL());
  }
  const ingIcon = id => icon(window.Fishing && Fishing.FISH[id] ? 'fish' : 'ing', id);
  const img = (src, sz = 28) => `<img src="${src}" style="width:${sz}px;height:${sz}px;image-rendering:pixelated;vertical-align:middle">`;
  const mealName = key => { const [id, q] = key.split(':'); return `${QN[+q]} ${DISH[id][0]}`; };
  const fx = (key) => { const [id, q] = key.split(':'), E = DISH[id][1], m = QM[+q], o = {}; for (const k of Object.keys(E)) o[k] = k === 'mp' ? Math.round(E[k] * m) : Math.min(k === 'hp' ? 1 : .5, E[k] * m); return o; };
  const fxText = o => [o.hp ? `+${Math.round(o.hp * 100)}% HP` : '', o.mp ? `+${o.mp} MP` : '', o.atk ? `ATK +${Math.round(o.atk * 100)}%` : '', o.def ? `DEF +${Math.round(o.def * 100)}%` : '', o.spd ? `SPD +${Math.round(o.spd * 100)}%` : ''].filter(Boolean).join(' · ');

  /* ---------- drops (Zelda-style) ---------- */
  const DROPS = [
    [/lupine|rime|wolf/, [['meat', .6], ['prime', .12]]], [/alpha/, [['prime', .45], ['meat', .5]]], [/tusker|boar/, [['meat', .8], ['prime', .25]]],
    [/goblin|ratfolk|orc/, [['glowcap', .4], ['bread', .15]]], [/gourd/, [['gourd', .75]]], [/lizard|troll/, [['meat', .45]]],
    [/drake|wyrm/, [['drake', .6]]], [/bandit|rebel/, [['bread', .45], ['honey', .12]]], [/minotaur|wartotaur/, [['prime', .5], ['meat', .5]]]];
  function rollDrops(enemies) {
    const got = {};
    for (const k of enemies || []) { const E = ENEMY[k] || {}, base = String(E.img || k) + ' ' + k;
      for (const [re, L] of DROPS) if (re.test(base)) for (const [id, p] of L) if (Math.random() < p) got[id] = (got[id] || 0) + 1; }
    const ids = Object.keys(got); if (!ids.length) return;
    for (const id of ids) addIng(id, got[id]);
    toast('🍖 ' + ids.map(id => `${img(ingIcon(id), 18)} ${ING[id][0]}${got[id] > 1 ? ' ×' + got[id] : ''}`).join('  '), 2600);
  }

  /* ---------- battle: Items with limits + meals ---------- */
  let usedThisFight = 0;
  const _bs = Battle.start.bind(Battle);
  Battle.start = async function (cfg) {
    usedThisFight = 0; clampCaps();
    const r = await _bs(cfg);
    try { if (r === 'win') rollDrops(cfg && cfg.enemies); } catch (e) { }
    return r;
  };
  function battleItems(a, done, menu) {
    const B = Battle, left = CAP().perFight - usedThisFight, L = [], lock = left <= 0;
    const use = (fn) => t => { usedThisFight++; fn(t); B.hud(); done(); };
    const head = lock ? ' — you can\'t reach your satchel again this fight' : ` — ${left} grab${left > 1 ? 's' : ''} left this fight`;
    L.push([`Tonic ×${G.S.items.tonic}`, 'Restore 45% HP to one ally.' + head, () => B.pickAlly(use(t => { G.S.items.tonic--; const h = Math.round(t.maxHp * .45); t.hp = Math.min(t.maxHp, t.hp + h); sfx('heal'); B.text(t, '+' + h, '#7dffb0'); })), lock || G.S.items.tonic <= 0]);
    L.push([`Ether ×${G.S.items.ether}`, 'Restore 12 MP to one ally.' + head, () => B.pickAlly(use(t => { G.S.items.ether--; t.mp = Math.min(t.maxMp, t.mp + 12); sfx('heal'); B.text(t, '+12 MP', '#9ad1ff'); })), lock || G.S.items.ether <= 0]);
    for (const key of Object.keys(st().meals).filter(k => st().meals[k] > 0).slice(0, 6)) {
      const o = fx(key);
      L.push([`${mealName(key)} ×${st().meals[key]}`, fxText(o) + head, () => B.pickAlly(use(t => { st().meals[key]--; eatOn(t, o, true); })), lock]);
    }
    L.push(['◀ Back', 'Return.', menu]); B.openMenu(L, false);
  }
  function eatOn(t, o, inBattle) {
    if (o.hp) { const h = Math.round(t.maxHp * o.hp); t.hp = Math.min(t.maxHp, t.hp + h); if (inBattle) Battle.text(t, '+' + h, '#7dffb0'); }
    if (o.mp) { t.mp = Math.min(t.maxMp, t.mp + o.mp); }
    if (inBattle) { for (const s of ['atk', 'def', 'spd']) if (o[s] && t[s]) t[s] = Math.round(t[s] * (1 + o[s])); if (o.atk || o.def || o.spd) Battle.text(t, 'WELL FED', '#ffd36a'); }
    sfx('heal');
  }
  function hookBattleMenu() {
    if (typeof CombatX === 'undefined' || CombatX.__food) return; CombatX.__food = 1; const _m = CombatX.menu ? CombatX.menu.bind(CombatX) : null;
    CombatX.menu = function (a, L, done, resolve, menu) {
      try { if (_m) _m(a, L, done, resolve, menu); } catch (e) { console.warn(e); }
      try { const i = L.findIndex(e => e && e[0] === 'Items'); if (i >= 0) { const meals = mealCount(), left = CAP().perFight - usedThisFight; L[i] = ['Items', `Tonic ×${G.S.items.tonic} · Ether ×${G.S.items.ether}${meals ? ` · Meals ×${meals}` : ''} · ${Math.max(0, left)}/${CAP().perFight} grabs left`, () => battleItems(a, done, menu)]; } } catch (e) { }
    };
  }

  /* ---------- overlay UI (satchel / cook / minigames) ---------- */
  let ov = null;
  function overlay(html) {
    if (!ov) { const st = document.createElement('style'); st.textContent = `#foodOv{position:fixed;inset:0;z-index:80;background:rgba(5,10,8,.78);display:flex;align-items:center;justify-content:center;font:14px system-ui;color:#f0e8d0}
      #foodOv .pn{background:#16201a;border:2px solid #4a6a4a;border-radius:12px;padding:12px 14px;max-width:min(560px,94vw);max-height:90vh;overflow:auto;box-shadow:0 8px 30px #000a}
      #foodOv h3{margin:0 0 6px;font-size:16px;color:#ffe7a8}#foodOv .row{display:flex;align-items:center;gap:8px;padding:4px 0;border-bottom:1px solid #2a3a2a}
      #foodOv button{background:#2a4a32;color:#f0e8d0;border:1px solid #5a8a5a;border-radius:8px;padding:6px 10px;font:600 13px system-ui}#foodOv button:disabled{opacity:.4}
      #foodOv .grid{display:flex;flex-wrap:wrap;gap:6px}#foodOv .cell{background:#202c22;border:1px solid #3a5a3a;border-radius:8px;padding:4px 6px;text-align:center;min-width:64px;font-size:11px}
      #foodOv .cell.on{border-color:#ffd36a;background:#3a3a1a}#foodOv .muted{color:#a8b0a0;font-size:12px}#foodOv canvas{display:block;margin:6px auto;touch-action:none}`; document.head.appendChild(st);
      ov = document.createElement('div'); ov.id = 'foodOv'; document.body.appendChild(ov); }
    ov.style.display = 'flex'; ov.innerHTML = `<div class="pn">${html}</div>`; return ov;
  }
  const closeOv = () => { if (ov) { ov.style.display = 'none'; ov.innerHTML = ''; } };
  const tap = (el, fn) => el && el.addEventListener('click', ev => { ev.stopPropagation(); fn(ev); });

  function satchel(atAshford) {
    return new Promise(res => {
      const draw = () => {
        const C = CAP(), F = st(), ings = Object.keys(F.ing).filter(k => F.ing[k] > 0), meals = Object.keys(F.meals).filter(k => F.meals[k] > 0);
        const sell = atAshford ? ' · tap an ingredient to sell it' : '';
        overlay(`<h3>🎒 Satchel <span class="muted">(level ${tier() + 1})</span></h3>
          <div class="muted">Tonics ${G.S.items.tonic}/${C.tonic} · Ethers ${G.S.items.ether}/${C.ether} · Meals ${mealCount()}/${C.meals} · In a fight you can grab ${C.perFight} times</div>
          <h3 style="margin-top:8px">Meals</h3>${meals.length ? meals.map(k => `<div class="row">${img(icon('meal', k.split(':')[0]), 30)}<div style="flex:1"><b>${mealName(k)}</b> ×${F.meals[k]}<div class="muted">${fxText(fx(k))}</div></div><button data-eat="${k}">Eat</button>${window.FoodX && FoodX.canShare() ? ` <button data-share="${k}">Share</button>` : ''}</div>`).join('') : '<div class="muted">No meals. Cook at any campfire.</div>'}
          <h3 style="margin-top:8px">Ingredients</h3><div class="grid">${ings.length ? ings.map(k => `<div class="cell" data-ing="${k}">${img(ingIcon(k), 30)}<br>${ING[k][0]}<br>×${F.ing[k]}${atAshford ? `<br><span class="muted">${ING[k][2]}g</span>` : ''}</div>`).join('') : '<div class="muted">Nothing yet — beasts, monsters and fish drop food.</div>'}</div>
          <div class="muted" style="margin-top:4px">Ingredient stacks hold ${C.ing}${sell}.</div>
          ${atAshford ? `<div style="margin-top:8px"><button id="upSat" ${tier() >= 4 ? 'disabled' : ''}>Bigger satchel — ${[150, 300, 500, 800][tier()] || '—'}g</button></div>` : ''}
          <div style="margin-top:10px;text-align:right"><button id="fBook">📖 Recipes</button> <button id="fLog">🐟 Fish log</button> <button id="fClose">Close</button></div>`);
        ov.querySelectorAll('[data-eat]').forEach(b => tap(b, () => { const k = b.dataset.eat, o = fx(k); st().meals[k]--; try { eatOutside(o); } catch (e) { } toast(`You eat the ${mealName(k)}. ${fxText(o)}`, 2200); save(); draw(); }));
        if (atAshford) ov.querySelectorAll('[data-ing]').forEach(c => tap(c, () => { const k = c.dataset.ing; if (!st().ing[k]) return; st().ing[k]--; G.S.gold += ING[k][2]; UI.hud(); sfx('coin'); draw(); }));
        tap(ov.querySelector('#upSat'), () => { const cost = [150, 300, 500, 800][tier()]; if (!cost || G.S.gold < cost) { toast('Not enough gold.', 1600); return; } G.S.gold -= cost; S_().satchel = tier() + 1; UI.hud(); sfx('level'); toast('🎒 A bigger satchel! More room — and one more grab per fight.', 2600); save(); draw(); });
        ov.querySelectorAll('[data-share]').forEach(b => tap(b, async () => { if (window.FoodX) { await FoodX.share(b.dataset.share); draw(); } }));
        tap(ov.querySelector('#fBook'), async () => { if (window.FoodX) { await FoodX.book(); draw(); } });
        tap(ov.querySelector('#fLog'), async () => { if (window.FoodX) { await FoodX.fishTank(false); draw(); } });
        tap(ov.querySelector('#fClose'), () => { closeOv(); res(); });
      };
      draw();
    });
  }
  function eatOutside(o) {
    const t = G.S.stats; if (!t) return;
    if (o.hp) t.hp = Math.min(t.maxHp, t.hp + Math.round(t.maxHp * o.hp)); if (o.mp) t.mp = Math.min(t.maxMp, t.mp + o.mp);
    if (o.hp >= .5) for (const k in G.S.allies) G.S.allies[k] = {};   // a good meal patches up the whole party
    sfx('heal'); UI.hud();
  }
  /* ---------- cooking ---------- */
  function recipeFor(ids) {
    const tags = new Set(ids.flatMap(id => [id, ING[id] ? ING[id][1] : ''])); let best = 'dubious', bp = -1;
    if (ids.length >= 3 && new Set(ids.map(id => ING[id][1])).size >= 3 && bp < 90) { best = 'feast'; bp = 90; }
    for (const [d, needs, p] of RECIPES) if (p > bp && needs.every(n => tags.has(n)) && (needs.length || !ids.length)) { best = d; bp = p; }
    return ids.length ? best : null;
  }
  function cook() {
    return new Promise(res => {
      let pot = [];
      const draw = () => {
        const F = st(), ings = Object.keys(F.ing).filter(k => F.ing[k] > 0), d = recipeFor(pot);
        overlay(`<h3>🔥 Cooking</h3><div class="muted">Tap up to 3 ingredients to drop them in the pot.</div>
          <div class="grid" style="margin:6px 0">${ings.length ? ings.map(k => { const n = pot.filter(x => x === k).length; return `<div class="cell ${n ? 'on' : ''}" data-ing="${k}">${img(ingIcon(k), 30)}<br>${ING[k][0]}<br>×${F.ing[k] - n}</div>`; }).join('') : '<div class="muted">Your satchel has nothing to cook.</div>'}</div>
          <div class="row"><b>Pot:</b> ${pot.map(k => img(ingIcon(k), 24)).join(' ') || '<span class="muted">empty</span>'} ${pot.length ? '<button id="clr">Empty</button>' : ''}</div>
          <div style="margin:6px 0">${d ? `→ ${img(icon('meal', d), 30)} <b>${DISH[d][0]}</b> <span class="muted">${fxText(DISH[d][1])}</span>` : ''}</div>
          <div style="text-align:right"><button id="go" ${pot.length ? '' : 'disabled'}>Cook!</button> <button id="fClose">Done</button></div>`);
        ov.querySelectorAll('[data-ing]').forEach(c => tap(c, () => { const k = c.dataset.ing; if (pot.length < 3 && pot.filter(x => x === k).length < st().ing[k]) { pot.push(k); sfx('blip'); draw(); } }));
        tap(ov.querySelector('#clr'), () => { pot = []; draw(); });
        tap(ov.querySelector('#go'), async () => { if (mealCount() >= CAP().meals) { toast('🎒 No room for another meal.', 2200); return; } const dish = recipeFor(pot); for (const k of pot) st().ing[k]--; pot = []; const q = await heatGame(dish); const key = dish + ':' + q; addMeal(key); S_().cooked = (S_().cooked || 0) + 1; save(); draw(); });
        tap(ov.querySelector('#fClose'), () => { closeOv(); res(); });
      };
      draw();
    });
  }
  // the timing game: a needle sweeps a heat dial three times; tap when it's in the gold zone
  function heatGame(dish) {
    return new Promise(res => {
      overlay(`<h3>${img(icon('meal', dish), 28)} ${DISH[dish][0]}</h3><div class="muted" id="hgTip">Tap (or press A / Space) when the needle hits the gold!</div><canvas id="hg" width="300" height="190"></canvas><div id="hgMsg" style="text-align:center;font-weight:700;height:18px"></div>`);
      const cv = ov.querySelector('#hg'), c = cv.getContext('2d'), msg = ov.querySelector('#hgMsg'), STEPS = ['Sear', 'Flip', 'Plate'];
      let round = 0, t0 = performance.now(), score = 0, zone = .5 + (Math.random() - .5) * .5, speed = 1.6, raf = 0, wait = false;
      const needle = () => (Math.sin((performance.now() - t0) / 1000 * speed * Math.PI) + 1) / 2;
      const draw = () => {
        c.clearRect(0, 0, 300, 190); const cx = 150, cy = 160, R = 120;
        c.lineWidth = 18; c.strokeStyle = '#3a2a1a'; c.beginPath(); c.arc(cx, cy, R, Math.PI, 0); c.stroke();
        const zw = .14 - round * .02; c.strokeStyle = '#d84a2a'; c.beginPath(); c.arc(cx, cy, R, Math.PI, Math.PI * 1.08); c.stroke(); c.beginPath(); c.arc(cx, cy, R, Math.PI * 1.92, 0); c.stroke();
        c.strokeStyle = '#4a8a3a'; c.beginPath(); c.arc(cx, cy, R, Math.PI + Math.PI * (zone - zw * 1.8), Math.PI + Math.PI * (zone + zw * 1.8)); c.stroke();
        c.strokeStyle = '#ffd36a'; c.beginPath(); c.arc(cx, cy, R, Math.PI + Math.PI * (zone - zw / 2), Math.PI + Math.PI * (zone + zw / 2)); c.stroke();
        const a = Math.PI + Math.PI * needle(); c.strokeStyle = '#f0e8d0'; c.lineWidth = 4; c.beginPath(); c.moveTo(cx, cy); c.lineTo(cx + Math.cos(a) * (R + 6), cy + Math.sin(a) * (R + 6)); c.stroke();
        c.fillStyle = '#5a5a5a'; c.beginPath(); c.ellipse(cx, cy + 8, 46, 12, 0, 0, 7); c.fill(); c.fillStyle = '#2a2a2a'; c.fillRect(cx + 40, cy + 4, 40, 6);
        for (let i = 0; i < 6; i++) { const fl = (performance.now() / 90 + i * 7) % 20; c.fillStyle = `rgba(255,${120 + i * 20},40,${(1 - fl / 20).toFixed(2)})`; c.fillRect(cx - 30 + i * 11, cy + 22 - fl, 5, 6); }
        c.fillStyle = '#f0e8d0'; c.font = 'bold 14px system-ui'; c.textAlign = 'center'; c.fillText(`${STEPS[round] || ''}  (${round + 1}/3)`, cx, 24);
        raf = requestAnimationFrame(draw);
      };
      const hit = () => {
        if (wait || round >= 3) return; const d = Math.abs(needle() - zone), zw = .14 - round * .02, s = d < zw / 2 ? 2 : d < zw * 1.8 ? 1 : 0;
        score += s; msg.textContent = ['Too hot!', 'Nice.', 'PERFECT!'][s]; msg.style.color = ['#ff7a5a', '#cfe6b0', '#ffd36a'][s]; sfx(s === 2 ? 'level' : 'blip');
        round++; wait = true; setTimeout(() => { wait = false; zone = .2 + Math.random() * .6; speed += .45; msg.textContent = ''; if (round >= 3) finish(); }, 550);
      };
      const finish = () => { cancelAnimationFrame(raf); cleanup(); const q = score >= 5 ? 2 : score >= 2 ? 1 : 0; toast(`${img(icon('meal', dish), 22)} <b>${QN[q]} ${DISH[dish][0]}</b>! ${fxText(fx(dish + ':' + q))}`, 2800); res(q); };
      const onDown = ev => { ev.preventDefault(); hit(); }, onKey = ev => { if ([' ', 'Enter', 'z', 'x', 'a'].includes(ev.key)) { ev.preventDefault(); hit(); } };
      const cleanup = () => { ov.removeEventListener('pointerdown', onDown); window.removeEventListener('keydown', onKey, true); };
      ov.addEventListener('pointerdown', onDown); window.addEventListener('keydown', onKey, true); draw();
    });
  }

  /* ---------- the 🎒 button ---------- */
  function button() {
    if (document.getElementById('bagBtn')) return;
    const s = document.createElement('style'); s.textContent = `#bagBtn{position:fixed;right:12px;bottom:228px;z-index:60;width:30px;height:30px;border-radius:15px;border:1px solid rgba(255,220,140,.5);background:rgba(10,18,14,.6);opacity:.75;font:14px system-ui;padding:0}body:not(.inworld) #bagBtn,body.photo #bagBtn{display:none}`; document.head.appendChild(s);
    const b = document.createElement('button'); b.id = 'bagBtn'; b.textContent = '🎒'; document.body.appendChild(b);
    b.addEventListener('click', ev => { ev.stopPropagation(); if (G.mode !== 'world' || World.busy) return; Story.run(() => satchel(G.S.map === 'ashford')); });
  }

  setInterval(() => { try { if (G.S && G.mode === 'world') clampCaps(); } catch (e) { } }, 3000);
  setInterval(() => { try { document.body.classList.toggle('inworld', G.mode === 'world' && !World.loading); } catch (e) { } }, 250);
  hookBattleMenu(); button();
  window.Food = { meals: () => st().meals, ING, DISH, RECIPES, addIng, addMeal, satchel, cook, recipeFor, CAP, st, icon, ingIcon, rollDrops, clampCaps, heatGame, overlay, closeOv, img, mealName, fx, fxText, get used() { return usedThisFight; } };
})();
