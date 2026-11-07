/* ================= THE CONSTELLATION — skill tree, attributes, mastery =================
   The skill tree is redrawn as a star chart: each branch is a constellation you light star by star.
   New branches for everyone: STRENGTH, SPEED, VITALITY, SPIRIT.
   ATTRIBUTES: every number that matters, for Ren and the whole party.
   MASTERY: the core abilities, each a ring of ten stars that only lights by using the ability. */
(function () {
  /* ---------- the new branches ---------- */
  const chain = (pre, arr) => arr.map((n, i) => Object.assign({ id: pre + (i + 1), req: i ? pre + i : undefined }, n));
  /* long stat branches: twelve stars for Ren, ten for each ally, climbing through every grade */
  const GATE = ['E', 'E', 'D', 'D', 'C', 'C', 'B', 'B', 'A', 'A', 'S', 'SS'], COST = [1, 1, 2, 2, 2, 3, 3, 3, 4, 4, 5, 6];
  const NAMES = {
    Strength: ['Iron Grip', 'Drag Sinew', 'Heavy Blade', 'Breaker\'s Shoulders', 'Wyrm Strength', 'Stone Fist', 'Mountain Back', 'Warden\'s Might', 'Dragon Arm', 'Sky Breaker', 'World Splitter', 'TITAN\'S ARM'],
    Speed: ['Light Feet', 'Quick Draw', 'Wind Step', 'Afterimage', 'Storm Runner', 'Swallow Dive', 'Ghost Feet', 'Lightning Reflex', 'Thunderstep', 'Blink', 'Faster Than Sight', 'FLASH STEP'],
    Vitality: ['Hardy', 'Thick Blood', 'Dragonhide', 'Unbroken', 'Heart of Stone', 'Iron Lungs', 'Scaled Heart', 'Second Wind', 'Wyrm Blood', 'Unkillable', 'Old Dragon\'s Heart', 'UNDYING'],
    Spirit: ['Calm Mind', 'Deep Well', 'Green Current', 'Open Channel', 'Wellspring', 'Still Water', 'River of Mana', 'Living Spring', 'Sea of Green', 'Endless Breath', 'Heart of the Gate', 'BOUNDLESS MANA'] };
  const VAL = { Strength: [2, 2, 3, 3, 4, 4, 5, 5, 6, 7, 8, 10], Speed: [1, 1, 1.5, 1.5, 2, 2, 2, 2.5, 2.5, 3, 3, 4], Vitality: [12, 15, 18, 22, 26, 30, 34, 38, 44, 50, 58, 70], Spirit: [4, 5, 6, 7, 8, 9, 10, 11, 12, 14, 16, 20] };
  const KEY = { Strength: 'atk', Speed: 'spd', Vitality: 'maxHp', Spirit: 'maxMp' }, PRE = { Strength: 'st', Speed: 'sp', Vitality: 'vi', Spirit: 'mi' };
  const UNIT = { atk: 'ATK', spd: 'SPD', maxHp: 'max HP', maxMp: 'max MP', hp: 'HP', mp: 'MP', def: 'DEF' };
  const descOf = e => Object.entries(e).map(([k, v]) => `+${v} ${UNIT[k]}`).join(', ') + '.';
  for (const br of Object.keys(KEY)) {
    TREES.me.branches[br] = chain(PRE[br], NAMES[br].map((nm, i) => { const e = { [KEY[br]]: VAL[br][i] }; if (br === 'Vitality' && i % 3 === 2) e.def = 1 + Math.floor(i / 4);
      return { name: nm, desc: descOf(e), cost: COST[i], eff: e, minGrade: GATE[i] === 'E' ? undefined : GATE[i] }; }));
  }
  const AK = { Strength: 'atk', Speed: 'spd', Vitality: 'hp', Spirit: 'mp' }, AV = { Strength: [2, 2, 3, 3, 4, 4, 5, 6, 7, 8], Speed: [1, 1, 1, 1, 2, 2, 2, 2, 3, 3], Vitality: [10, 12, 14, 16, 18, 22, 26, 30, 36, 44], Spirit: [3, 3, 4, 4, 5, 5, 6, 7, 8, 10] };
  for (const who of ['kess', 'liora', 'oren']) {
    if (!TREES[who]) continue; const p = who[0] + 'x';
    for (const br of Object.keys(AK)) TREES[who].branches[br] = chain(p + ({ Strength: 's', Speed: 'p', Vitality: 'v', Spirit: 'm' })[br], NAMES[br].slice(0, 9).concat([NAMES[br][11]]).map((nm, i) => { const e = { [AK[br]]: AV[br][i] }; if (br === 'Vitality' && i % 3 === 2) e.def = 1;
      return { name: nm, desc: descOf(e), cost: COST[i], ally: e, minGrade: GATE[i] === 'E' ? undefined : GATE[i] }; }));
  }
  const BR_COL = { Blade: '#cfe8ff', Eye: '#e8fff4', Tide: '#5fd8ff', Body: '#ffb07a', Strength: '#ff6a5a', Speed: '#7fe8ff', Vitality: '#7dffb0', Spirit: '#b48aff', Forge: '#ff9a3a', Shadow: '#c9a6ff', Spear: '#ffd36a' };
  const BR_ICON = { Blade: '⚔', Eye: '◉', Tide: '≈', Body: '♥', Strength: '✊', Speed: '➶', Vitality: '✚', Spirit: '✦', Forge: '⚒', Shadow: '☾', Spear: '➹' };
  let sel = null;

  /* ---------- the star chart ---------- */
  const CSS = `<style>.sky{position:relative;border-radius:14px;padding:10px 6px 4px;background:radial-gradient(ellipse at 50% 0%,#14263a 0%,#070b12 70%);border:1px solid #23384a;overflow-x:auto}
  .sky .cols{display:flex;gap:4px;min-width:max-content}.sky .col{width:92px;display:flex;flex-direction:column;align-items:center;position:relative}
  .sky .col h4{margin:0 0 6px;font:900 11px Nunito,system-ui;letter-spacing:1px;text-transform:uppercase}
  .sky .line{position:absolute;top:34px;bottom:20px;width:2px;left:50%;margin-left:-1px;background:linear-gradient(var(--c),transparent);opacity:.35}
  .sky .star{position:relative;z-index:1;width:40px;height:40px;margin:0 0 12px;border-radius:50%;display:flex;align-items:center;justify-content:center;font:900 15px system-ui;cursor:pointer;
    background:#0d141c;border:2px solid #2a3a4a;color:#4a5a6a;transition:transform .1s}
  .sky .star.open{border-color:var(--c);color:var(--c);box-shadow:0 0 8px color-mix(in srgb,var(--c) 45%,transparent);animation:twk 2s ease-in-out infinite}
  .sky .star.got{background:radial-gradient(circle,#fff 0%,var(--c) 45%,color-mix(in srgb,var(--c) 30%,#000) 100%);border-color:#fff;color:#08100c;box-shadow:0 0 16px var(--c),0 0 4px #fff}
  .sky .star.big{width:48px;height:48px;font-size:18px}.sky .star.sel{transform:scale(1.18);outline:2px solid #ffd36a;outline-offset:3px}
  .sky .star.never{opacity:.35}
  @keyframes twk{50%{box-shadow:0 0 16px var(--c)}}
  .sky .info{margin:8px 4px 4px;padding:8px 10px;border-radius:10px;background:rgba(10,18,26,.9);border:1px solid #2a3a4a;min-height:44px}
  .sky .lit{font:800 10px Nunito;color:#9fb3c8;text-align:center;margin-top:-4px}</style>`;
  skillsMenuHTML = function () {
    const S = Skills.st(), people = ['me', ...S.party.filter(id => TREES[id])], who = people.includes(skillWho) ? skillWho : 'me', p = Power.now();
    let h = CSS + `<div class="stat" style="margin-bottom:6px"><h3>Power grade ${Power.badge(p)} <span class="muted">· ${BAND_NAME[p.band]}</span></h3>
      <div class="gbar"><i style="width:${(p.cfrac != null ? p.cfrac : p.frac) * 100}%;background:${BAND_COL[p.band]}"></i></div>
      <p class="muted">Light the stars with Skill Points. Every aura colour gives 2 Skill Points, every breakthrough 3, and Mastery levels 3, 6 and 9 give 1 more. The deep stars need a higher power grade.</p>
      <div class="btnrow">${people.map(w => `<button class="btn ${w === who ? 'pri' : ''}" data-who="${w}">${TREES[w].name()} · <b style="color:#ffd36a">${S.sp[w] || 0}</b> SP</button>`).join('')}</div></div>`;
    const br = TREES[who].branches;
    h += `<div class="sky"><div class="cols">`;
    for (const [bn, nodes] of Object.entries(br)) {
      const c = BR_COL[bn] || '#9fd8ff', got = nodes.filter(n => Skills.has(who, n.id)).length;
      h += `<div class="col" style="--c:${c}"><h4 style="color:${c}">${BR_ICON[bn] || '✧'} ${bn}</h4><div class="line"></div>`;
      nodes.forEach((n, i) => {
        const g = Skills.has(who, n.id), ok = Skills.reqMet(who, n), big = i === nodes.length - 1;
        h += `<div class="star ${g ? 'got' : ok ? 'open' : ''}${n.req === 'never' ? ' never' : ''}${big ? ' big' : ''}${sel && sel.who === who && sel.id === n.id ? ' sel' : ''}" data-star="${n.id}">${g ? '★' : n.cost}</div>`;
      });
      h += `<div class="lit">${got}/${nodes.length}</div></div>`;
    }
    h += `</div>`;
    const n = sel && sel.who === who ? Skills.node(who, sel.id) : null;
    if (n) {
      const g = Skills.has(who, n.id), ok = Skills.reqMet(who, n), afford = (S.sp[who] || 0) >= n.cost;
      const why = n.req === 'never' ? 'End game.' : n.minGrade && GRADES.indexOf(p.grade) < GRADES.indexOf(n.minGrade) ? `Needs power grade ${n.minGrade}.` : !ok ? 'Light the star before it first.' : '';
      h += `<div class="info"><b style="font-size:15px">${n.name}</b> <span class="muted">· ${n.cost} SP</span><p style="margin:4px 0">${n.desc}</p>${g ? '<b style="color:#7dffb0">★ Lit</b>' : why ? `<span class="muted">🔒 ${why}</span>` : `<button class="btn pri" data-learn="${n.id}" ${afford ? '' : 'disabled'}>${afford ? 'Light this star' : 'Not enough SP'}</button>`}</div>`;
    } else h += `<div class="info"><span class="muted">Tap a star to see what it does.</span></div>`;
    return h + '</div>';
  };
  bindSkillsMenu = function () {
    $$('#menuCard [data-who]').forEach(b => bindTap(b, () => { skillWho = b.dataset.who; sel = null; sfx('blip'); UI.renderMenu(); }));
    $$('#menuCard [data-star]').forEach(b => bindTap(b, () => { sel = { who: skillWho, id: b.dataset.star }; sfx('blip'); UI.renderMenu(); }));
    $$('#menuCard [data-learn]').forEach(b => bindTap(b, () => { const w = skillWho === 'me' || G.S.party.includes(skillWho) ? skillWho : 'me'; if (Skills.learn(w, b.dataset.learn)) { toast('★ Star lit.'); } UI.renderMenu(); }));
  };

  /* ---------- ATTRIBUTES ---------- */
  window.attrHTML = function () {
    const S = G.S, s = S.stats, SB = typeof Stones !== 'undefined' ? Stones.bonus() : { atk: 0, def: 0 }, p = Power.now();
    const row = (k, v, note) => `<div style="display:flex;justify-content:space-between;gap:8px;padding:3px 0;border-bottom:1px solid #16241c"><span>${k}</span><b>${v}${note ? ` <span class="muted" style="font-weight:600">${note}</span>` : ''}</b></div>`;
    const reflex = Math.round(Skills.reflex('me') * 125);
    let h = `<div class="stat" style="margin-bottom:6px"><h3>${esc(S.name)} ${Power.badge(p)} <span class="muted">· ${BAND_NAME[p.band]}</span></h3>
      ${row('Health', `${s.hp} / ${s.maxHp}`)}${row('Mana', `${s.mp} / ${s.maxMp}`)}
      ${row('Strength (ATK)', s.atk + (SB.atk || 0), SB.atk ? `(${s.atk} + ${SB.atk} stones)` : '')}${row('Defence (DEF)', s.def + (SB.def || 0), SB.def ? `(${s.def} + ${SB.def} stones)` : '')}
      ${row('Speed (SPD)', Math.floor(s.spd))}${row('Dodge & parry window', reflex + '%', '(Drag reflexes)')}
      ${row('Total EXP', Power.xp())}${row('Guild card', S.rank ? S.rank + '-RANK' : 'unregistered')}
      ${row('Arts known', (S.arts || []).length)}${row('Skill stars lit', (Skills.st().sk.me || []).length)}${row('Skill Points', (S.sp && S.sp.me) || 0)}
      ${S.titles && S.titles.length ? row('Titles', S.titles.join(', ')) : ''}</div>`;
    for (const id of S.party || []) {
      const A = ALLY[id]; if (!A) continue; const lv = S.lvl - 1 + (A.lvUp || 0), b = Skills.allyBonus(id);
      h += `<div class="stat" style="margin-bottom:6px"><h3>${A.name}${A.badge ? ' ' + A.badge() : ''}</h3>
        ${row('Health', A.hp + lv * 7 + b.hp)}${row('Mana', A.mp + lv * 2 + (b.mp || 0))}${row('Strength (ATK)', A.atk + lv * 2 + b.atk)}${row('Defence (DEF)', A.def + lv + b.def)}${row('Speed (SPD)', A.spd + b.spd)}
        ${row('Arts', A.arts.map(k => ARTS[k] ? ARTS[k].name : k).join(', '))}</div>`;
    }
    return h;
  };

  /* ---------- MASTERY page ---------- */
  let mWho = 'me';
  window.masteryHTML = function () {
    const S = G.S, people = ['me', ...(S.party || []).filter(id => MASTERY.CORE[id])];
    if (!people.includes(mWho)) mWho = 'me';
    let h = CSS + `<div class="stat" style="margin-bottom:6px"><h3 style="color:#ffd36a">Mastery</h3><p class="muted">Abilities grow only by being used: 1 point per use, 2 if you land a PERFECT during it. Every level is +6% power. Stars marked ✦ unlock something new. Levels 3, 6 and 9 give a Skill Point; level 10 gives a title.</p>
      <div class="btnrow">${people.map(w => `<button class="btn ${w === mWho ? 'pri' : ''}" data-mwho="${w}">${w === 'me' ? S.name : ALLY[w].name}</button>`).join('')}</div></div>`;
    for (const [k, name, col, ms] of MASTERY.CORE[mWho]) {
      const known = mWho === 'me' ? (k === 'ghost' ? Ghost && Ghost.learned() : (S.arts || []).includes(k === 'recoil' ? 'azure' : k)) : true;
      const l = MASTERY.lv(mWho, k), pts = MASTERY.pts(mWho, k), nx = MASTERY_XP[Math.min(10, l + 1)], lo = MASTERY_XP[l];
      const fr = l >= 10 ? 1 : (pts - lo) / (nx - lo);
      h += `<div class="stat" style="margin-bottom:6px;--c:${col};${known ? '' : 'opacity:.45'}"><h3 style="color:${col}">${name} <span class="muted">· Mastery ${l}/10${known ? '' : ' · not learned yet'}</span></h3>
        <div style="display:flex;gap:6px;align-items:center;margin:6px 0">${Array.from({ length: 10 }, (_, i) => `<div style="flex:1;height:${ms[i + 1] ? 14 : 9}px;border-radius:7px;background:${i < l ? col : '#1a2430'};box-shadow:${i < l ? '0 0 8px ' + col : 'none'};position:relative">${ms[i + 1] ? `<span style="position:absolute;top:-15px;left:50%;transform:translateX(-50%);font-size:11px;color:${i < l ? col : '#56667a'}">✦</span>` : ''}</div>`).join('')}</div>
        <div class="gbar"><i style="width:${(fr * 100).toFixed(1)}%;background:${col}"></i></div>
        <p class="muted" style="margin:2px 0 4px">${l >= 10 ? 'MASTERED.' : `${pts - lo} / ${nx - lo} to level ${l + 1}`}</p>
        ${Object.entries(ms).map(([lv, t]) => `<p style="margin:1px 0;${+lv <= l ? '' : 'opacity:.5'}"><b style="color:${+lv <= l ? col : '#8a9aac'}">${+lv <= l ? '✦' : '·'} Lv ${lv}</b> ${t}</p>`).join('')}</div>`;
    }
    return h;
  };
  window.masteryBind = function () { $$('#menuCard [data-mwho]').forEach(b => bindTap(b, () => { mWho = b.dataset.mwho; sfx('blip'); UI.renderMenu(); })); };
})();
