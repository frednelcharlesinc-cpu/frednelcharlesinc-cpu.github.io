'use strict';
/* =====================================================================================
   THE UNDERWORLD  (Chat A) — how Green Eclipse pays for its war
   Kairo's people don't rob farmers. They take their coin and their ears from people worse than them,
   through three "tables" that don't know who they really work for:
     · THE TALLOW HAND  — smugglers & fences in Ashford's candle-cellars.      Fixer: Nessa Crane  (The Crooked Kettle)
     · THE INKWELL RING  — the Silent Ledger's back room: clerks who sell copies. Fixer: Jory Inkwell (The Drowned Duck, Millbrook)
     · THE GILT TABLE   — corrupt nobles & magistrates who dine on the vale.   Fixer: Steward Haskell (The Sheaf & Sickle, Kettlebrook)
   Jobs: HEISTS (a turn-based blueprint: patrols, vision cones, takedowns, smoke, a thrown coin, a lock to pick)
         and MARKS (a fight with BODYGUARDS — enemyai4.js). Every job pays you, and sends a cut to Green Eclipse:
   GE FUNDS unlock the safehouse (100), Eclipse fighters joining your fights (300), Kairo's blueprints (600).
   INTEL buys guard routes and uncovers what the Crown hides.
   The RED VEIL is the smart way to do this work: seen as the Veil, it's the Veil's legend — seen as Ren, it's Ren's neck.
   ===================================================================================== */
const UG_ORGS = {
  tallow: { n: 'The Tallow Hand', col: '#ffcf7a', fixer: 'nessa', fx: 'Nessa Crane', spr: 'rebel2', scene: 'a_inn', at: [13, 3],
    d: 'Smugglers and fences working out of Ashford\'s candle-cellars. They move anything — including the guns Green Eclipse fights with.' },
  ledger: { n: 'The Inkwell Ring', col: '#9fd0ff', fixer: 'jory', fx: 'Jory Inkwell', spr: 'folk1', scene: 'mb_tavern', at: [17, 9],
    d: 'The Silent Ledger\'s back room: clerks, couriers and ferrymen who sell the copies the Silent Ledger won\'t. Kairo\'s eyes in every office in the vale.' },
  gilt: { n: 'The Gilt Table', col: '#e6b3ff', fixer: 'haskell', fx: 'Steward Haskell', spr: 'folk16', scene: 'kb_tavern', at: [17, 9],
    d: 'A supper club of nobles and magistrates who split the Registry\'s bounties. They pay the best. Kairo takes their money and leaks their secrets.' }
};
// heist boards (14×8). # wall · c crate (blocks sight) · S start/exit · L the lock · I papers (intel)
const UG_MAPS = {
  tithe: ['##############', '#S...#.......#', '#....#..c..L.#', '#..c.D.......#', '#....#..c....#', '##.###.####D##', '#.......I....#', '##############'],
  study: ['##############', '#I...#...c...#', '#.c..#.......#', '#....D...##..#', '##D###...#L..#', '#S...#...D...#', '#..c.....#...#', '##############'],
  count: ['##############', '#....c...#..L#', '#.##.....#...#', '#.#I..c..D...#', '#.##.....###.#', '#S.....c.....#', '#....#####...#', '##############']
};
const UG_GUARDS = {
  tithe: [{ loop: [[7, 1], [12, 1], [12, 4], [9, 4], [9, 3], [7, 3]] }, { pp: [[12, 6], [1, 6]] }],
  tithe2: [{ loop: [[7, 1], [12, 1], [12, 4], [9, 4], [9, 3], [7, 3]] }, { pp: [[12, 6], [1, 6]] }, { at: [10, 3], turns: ['left', 'up', 'right', 'down'] }],
  study: [{ pp: [[7, 6], [7, 1]] }, { at: [12, 6], turns: ['up', 'left'] }, { pp: [[1, 3], [4, 3]] }],
  study2: [{ pp: [[7, 6], [7, 1]] }, { at: [12, 6], turns: ['up', 'left'] }, { pp: [[1, 3], [4, 3]] }, { pp: [[6, 2], [8, 2]] }],
  count: [{ pp: [[4, 1], [4, 5]] }, { loop: [[10, 2], [12, 2], [12, 3], [10, 3]] }, { pp: [[8, 5], [12, 5]] }],
  count2: [{ pp: [[4, 1], [4, 5]] }, { loop: [[10, 2], [12, 2], [12, 3], [10, 3]] }, { pp: [[8, 5], [12, 5]] }, { at: [11, 6], turns: ['up', 'left', 'right'] }]
};
const UG_JOBS = [
  { id: 't1', org: 'tallow', need: 0, kind: 'heist', map: 'tithe', g: 'tithe', foes: ['reg_man', 'reg_man'], t: 'The Tithe-House Cellar', town: 'ashford',
    d: 'The Registry seized half of Tanners\' Row "for back taxes." It\'s all sitting in the tithe-house cellar. Nessa wants it moved. Tonight.', gold: 60, funds: 60, intel: 0,
    end: { q: 'Crates of seized goods — pots, tools, a child\'s coat with a name stitched in. Nessa expects them at the cellar door.', a: ['Deliver them to Nessa (+40g)', 'Leave them at the families\' doors before dawn'] } },
  { id: 't2', org: 'tallow', need: 1, kind: 'mark', foes: ['ug_fence', 'ug_guard', 'ug_guard'], t: 'The Fence Who Sold Drags', town: 'ashford',
    d: 'A fence called Marlo has been selling runaway Drags to the Registry. Nessa wants him out of business. Kairo wants him out of the vale.', gold: 55, funds: 50, intel: 1,
    intro: 'You find Marlo behind the tanneries, counting silver with two hired blades at his back.' },
  { id: 't3', org: 'tallow', need: 2, kind: 'heist', map: 'tithe', g: 'tithe2', foes: ['reg_man', 'reg_man', 'reg_man'], t: 'The Bonded Warehouse', town: 'ashford',
    d: 'Crown crates in a bonded warehouse: steel, powder, crossbows. Tallow can sell them. Green Eclipse can use them.', gold: 40, funds: 0, intel: 0,
    end: { q: 'Forty crates of Crown steel. Nessa has a buyer. Tamsin has a war.', a: ['Send it all to Green Eclipse (+150 funds)', 'Let Nessa sell it (+150g)'] } },
  { id: 'l1', org: 'ledger', need: 0, kind: 'heist', map: 'study', g: 'study', foes: ['ug_guard', 'ug_guard'], t: 'The Magistrate\'s Letters', town: 'millbrook',
    d: 'Magistrate Fenwick of Millbrook keeps his letters in a locked box in his study. Jory wants copies. The originals can go back — or not.', gold: 40, funds: 20, intel: 2,
    end: { q: 'One letter is from the Registry: "Forty silver per registered Drag. The Table\'s tenth, as agreed." It\'s signed. The Gilt Table splits the bounty.', a: ['Copy it for Jory and put it back', 'Keep the original — for Kairo'] } },
  { id: 'l2', org: 'ledger', need: 1, kind: 'mark', foes: ['ug_mark', 'reg_man', 'reg_man'], markName: 'Registry Courier', t: 'The Courier', town: 'millbrook',
    d: 'A Registry courier rides the Millbrook road tonight with new lists. His escort is two Registry men. Jory wants the satchel.', gold: 35, funds: 20, intel: 2,
    intro: 'Lantern light on the Millbrook road. A courier in grey, and two Registry men who look bored — until they see you.' },
  { id: 'l3', org: 'ledger', need: 2, kind: 'heist', map: 'study', g: 'study2', foes: ['reg_man', 'reg_man', 'reg_man'], t: 'The Registry Rolls', town: 'millbrook',
    d: 'The roll of every registered Drag family in the vale, kept in the Registry office at Millbrook. With it, Kairo can warn every name on it.', gold: 30, funds: 50, intel: 3,
    end: { q: 'Two hundred names. Some you know. Pip\'s mother. The Tollers. A family in Kettlebrook with five children.', a: ['Give the roll to Kairo', 'Burn it — no list, no raids'] } },
  { id: 'g1', org: 'gilt', need: 0, kind: 'mark', foes: ['ug_guard', 'ug_mark', 'ug_duelist'], t: 'Tax-Farmer Brisk', town: 'kettlebrook',
    d: 'Brisk bought the right to tax Kettlebrook and squeezes it dry. The Table wants a competitor humbled. The town wants him gone. Everyone agrees, for once.', gold: 90, funds: 40, intel: 0,
    intro: 'Brisk\'s carriage, stopped at the Kettlebrook ford. A hired blade, and a duelist in a blue coat who smiles at you like you\'re dinner.' },
  { id: 'g2', org: 'gilt', need: 1, kind: 'heist', map: 'count', g: 'count', foes: ['ug_guard', 'ug_guard'], t: 'Lady Brannick\'s Counting-House', town: 'kettlebrook',
    d: 'Lord Vellacourt wants Lady Brannick\'s debt ledger — every loan she holds over Kettlebrook. Leverage, he calls it.', gold: 120, funds: 40, intel: 1,
    end: { q: 'The ledger: three hundred households, every debt they owe Lady Brannick. Vellacourt wants it. The fire in the hearth is right there.', a: ['Bring it to Vellacourt (+60g, the Table is pleased)', 'Burn it. Every debt.'] } },
  { id: 'g3', org: 'gilt', need: 2, kind: 'heist', map: 'count', g: 'count2', foes: ['ug_duelist', 'ug_guard', 'ug_guard'], t: 'The Vellacourt Vault', town: 'kettlebrook', kairo: 1,
    d: 'Kairo\'s own job: rob the man who hosts the Gilt Table. The Table will know it was you. Kairo says that\'s the point.', gold: 60, funds: 300, intel: 2,
    end: { q: 'Vellacourt\'s vault: gold, deeds, and a second ledger with every name at the Table and every bribe they paid.', a: ['Everything to Kairo', 'The gold to Kairo, the ledger to the town crier'] } }
];
const UG_NOTES = [[3, 'The Registry pays forty silver for every Drag it "registers". The Gilt Table takes a tenth of every payment. Lord Vellacourt chairs the Table.'],
  [6, 'The Tallow Hand sells D-stones to the Registry — and to buyers in the north that nobody will name. Nessa hates it. Nessa does it anyway.'],
  [10, 'Kairo has had a man inside the Inkwell Ring for two years. Every copy you\'ve read, he read first.']];

const UG = {
  st() { const S = G.S; S.ug = S.ug || {}; const u = S.ug; u.org = u.org || { tallow: 0, ledger: 0, gilt: 0 }; u.done = u.done || {}; u.funds = u.funds || 0; u.intel = u.intel || 0; return u; },
  open() { const f = G.S && G.S.f; return !!(f && !G.S.kid && (f.geTrust >= 1 || f.sealGot || f.ka === 'done')); },
  veil() { try { return typeof Veil !== 'undefined' && Veil.on(); } catch (e) { return false; } },
  // ---------------- Tamsin explains ----------------
  async intro() {
    const u = this.st(); if (u.met) return; u.met = 1; World.busy = true;
    try {
      await say('tamsin', 'neutral', 'Ren. Sit. Kairo wanted me to be the one to tell you how we eat.');
      await say('tamsin', 'neutral', 'Green Eclipse doesn\'t rob farmers. We take our coin — and our ears — from people worse than us.');
      await say('tamsin', 'neutral', 'Three tables in this vale trade in what the Crown won\'t touch. The Tallow Hand: smugglers, right under this floor. The Inkwell Ring: the Silent Ledger\'s back room, clerks who copy letters they shouldn\'t. And the Gilt Table — nobles who dine on the vale and call it charity.');
      await say('tamsin', 'happy', 'They don\'t know they work for us. Kairo likes it that way.');
      const c = await ask('tamsin', 'neutral', 'Do their jobs. Take their gold. Send us our cut, and bring us what you hear.', ['"Where do I find them?"', '"And if I get seen?"']);
      if (c === 1) await say('tamsin', 'anger', 'Then don\'t be YOU. You have a red scarf, don\'t you? Whatever the Veil does, nobody pins on Ren. Wear it for this work. Always.');
      await say('tamsin', 'neutral', 'Nessa Crane, back corner of the Crooked Kettle. Jory Inkwell at the Drowned Duck in Millbrook. Steward Haskell at the Sheaf & Sickle in Kettlebrook — he serves the Gilt Table, and he\'s the worst of the three.');
      Dlg.close(); toast('<b style="color:#a9c4ff">The Underworld</b> is open. Talk to the fixers in the three taverns for jobs. Every job sends a cut to Green Eclipse.', 5200); save();
    } finally { World.busy = false; }
  },
  // ---------------- the job board ----------------
  async fixer(org) {
    const O = UG_ORGS[org], u = this.st();
    if (!u.met) { await say(O.fixer, 'neutral', pick(['"Don\'t know you. Don\'t want to."', '"Drink your drink, stranger."'])); Dlg.close(); return; }
    if (!u['hi_' + org]) { u['hi_' + org] = 1;
      await say(O.fixer, 'neutral', { tallow: '"Tamsin\'s Drag. Good. I need hands that don\'t shake and a mouth that doesn\'t open."', ledger: '"Ah. The one Tamsin vouched for. Sit, sit. I deal in paper — and paper burns, so we\'re careful."',
        gilt: '"The Table has… tasks. Discreet ones. You will be paid like a gentleman, and forgotten like a servant."' }[org]); Dlg.close(); }
    this.board(org);
  },
  board(org, msg) {
    const O = UG_ORGS[org], u = this.st(); UI.closeMenu(); World.busy = true; UI.controls(false); $('#menu').classList.remove('hide');
    const jobs = UG_JOBS.filter(j => j.org === org);
    const card = j => { const done = u.done[j.id], lock = (u.org[org] || 0) < j.need ? `needs ${O.n} standing ${j.need}` : j.kairo && !u.kairo ? 'Kairo hasn\'t asked yet' : '';
      return `<div class="stat" style="${done || lock ? 'opacity:.6' : ''}"><h3>${esc(j.t)} <span class="muted">· ${j.kind === 'heist' ? 'HEIST' : 'MARK (bodyguards)'}${done ? ' · DONE' : ''}</span></h3>
        <p class="muted" style="margin:2px 0">${esc(j.d)}</p><p style="margin:2px 0;font-size:12px">Pays ${j.gold}g · Green Eclipse +${j.funds} funds${j.intel ? ` · +${j.intel} intel` : ''}</p>
        ${done ? '' : lock ? `<p style="color:#ff9a8a;font-size:12px">${lock}</p>` : `<button class="btn" data-job="${j.id}">Take the job</button>`}</div>`; };
    const perks = [[100, 'Safehouse — rest for free'], [300, 'Eclipse fighters may join your fights'], [600, 'Kairo\'s blueprints — guard routes always shown']];
    const notes = UG_NOTES.filter(n => u.intelTot >= n[0]).map(n => `<p class="muted" style="font-size:12px">✉ ${n[1]}</p>`).join('');
    $('#menuCard').innerHTML = `<div class="mside"><div class="mhead"><h2 style="color:${O.col}">${O.n}</h2><button id="mClose">Close ✕</button></div>
      <p class="muted" style="font-size:12px">${O.d}</p><p>Fixer: <b>${O.fx}</b> · Standing <b>${u.org[org] || 0}</b></p><p><b style="color:#ffd36a">${G.S.gold}g</b></p>
      <h3 style="color:#a9c4ff;margin-top:8px">Green Eclipse ledger</h3><p>Funds <b>${u.funds}</b> · Intel <b>${u.intel}</b></p>
      ${perks.map(([n, t]) => `<p style="font-size:12px;margin:1px 0;color:${u.funds >= n ? '#9be37a' : '#888'}">${u.funds >= n ? '✓' : '·'} ${n}: ${t}</p>`).join('')}
      ${u.funds >= 100 ? '<button class="btn" id="ugRest">Rest at the safehouse</button>' : ''}${notes}
      <p class="muted" style="font-size:12px;margin-top:6px">${this.veil() ? '<b style="color:#ff5a5a">You are wearing the Red Veil.</b> What you do tonight is the Veil\'s.' : 'Tip: wear the <b style="color:#ff5a5a">Red Veil</b> for this work — being seen as Ren costs Ren.'}</p>
      ${msg ? `<p style="color:#9dffc8">${msg}</p>` : ''}</div><div class="mbody"><h3 style="color:${O.col}">Jobs</h3>${jobs.map(card).join('')}</div>`;
    bindTap($('#mClose'), () => UI.closeMenu());
    if ($('#ugRest')) bindTap($('#ugRest'), () => { try { Story.heal(true); } catch (e) { } sfx('heal'); this.board(org, 'You sleep in a Green Eclipse safehouse. Everyone is rested.'); });
    $$('#menuCard [data-job]').forEach(b => bindTap(b, () => { const j = UG_JOBS.find(x => x.id === b.dataset.job); UI.closeMenu(); setTimeout(() => this.take(j), 50); }));
  },
  async take(j) {
    if (G.mode !== 'world') return;
    World.busy = true;
    try {
      if (!this.veil() && typeof Veil !== 'undefined' && Veil.got()) {
        const c = await ask('me', 'neutral', '(The red scarf is in my pocket. Nobody should see Ren\'s face doing this.)', ['(Put on the Red Veil.)', '(Go as Ren.)']); Dlg.close();
        if (c === 0) { await Veil.set(true); toast('<b style="color:#ff5a5a">The Red Veil.</b> Tonight is the Veil\'s.', 2200); }
      }
      if (j.kind === 'mark') await this.mark(j); else await Heist.plan(j);
    } finally { World.busy = false; UI.controls(true); }
  },
  // ---------------- a mark: a bodyguard fight ----------------
  async mark(j) {
    if (j.intro) { await say(null, null, j.intro); Dlg.close(); }
    const E = ENEMY.ug_mark, n0 = E.name; if (j.markName) E.name = j.markName;
    let r; try { r = await Battle.start({ enemies: j.foes.slice(), bd: 'forest', noFlee: true, ugJob: j.id }); } finally { E.name = n0; }
    if (r === 'lose') { await this.fail(j); return; }
    await this.pay(j, 0);
  },
  async fail(j) {
    try { Story.heal(true); } catch (e) { } const lost = Math.round(G.S.gold * .15); G.S.gold -= lost; UI.hud();
    await say(null, null, `You wake in an alley with a split lip and a lighter purse (-${lost}g). The job is blown — the fixer will offer it again when things cool down.`); Dlg.close();
    try { Rep.deed(-1, 'botched a job — people are talking', j.town, -1); } catch (e) { }
  },
  async pay(j, choice, mess) {
    const u = this.st(), O = UG_ORGS[j.org]; let gold = j.gold, funds = j.funds, intel = j.intel, stand = 1;
    // the endings
    const pub = (n, why) => { try { Rep.deed(n, why, j.town); } catch (e) { } try { Opinion.add('hope', n * .15); } catch (e) { } };
    if (j.id === 't1') { if (choice === 0) gold += 40; else { pub(2, 'returned seized goods to Tanners\' Row'); stand = 0; } }
    if (j.id === 't3') { if (choice === 0) funds += 150; else gold += 150; }
    if (j.id === 'l1' && choice === 1) { intel += 1; u.kairoLetter = 1; }
    if (j.id === 'l3') { if (choice === 0) { funds += 0; intel += 1; G.S.f.ugRoll = 'kairo'; } else { G.S.f.ugRoll = 'burned'; pub(1, 'burned the Registry roll'); } }
    if (j.id === 'g2') { if (choice === 0) { gold += 60; stand = 2; } else { pub(3, 'burned every debt in Lady Brannick\'s ledger'); stand = -1; } }
    if (j.id === 'g3') { stand = -99; G.S.heat = Math.min(6, (G.S.heat || 0) + 2); if (choice === 1) pub(3, 'exposed the Gilt Table\'s bribes'); }
    if (mess) { gold = Math.round(gold * .7); }
    G.S.gold += gold; u.funds += funds; u.intel += intel; u.intelTot = (u.intelTot || 0) + intel; u.org[j.org] = Math.max(stand <= -99 ? -9 : -3, (u.org[j.org] || 0) + stand); u.done[j.id] = 1;
    if (this.veil() && !mess) try { Veil.addFame(1, `${j.t} — clean. The vale has a new story about the Red Veil.`); } catch (e) { }
    try { Story.gainXp(40 + j.gold / 2); } catch (e) { } sfx('coin'); UI.hud(); save();
    toast(`<b style="color:${O.col}">${esc(j.t)}</b> — done${mess ? ' (messy)' : ''}. +${gold}g · Green Eclipse +${funds} funds${intel ? ` · +${intel} intel` : ''}`, 4600);
    // Kairo notices
    const n = Object.keys(u.done).length;
    if (n >= 3 && !u.kairo) { u.kairo = 1; setTimeout(async () => { if (G.mode !== 'world' || Dlg.open) return; await say('tamsin', 'happy', 'A note from Kairo, in his terrible handwriting: "Good work. I have a job for you myself. Ask Haskell about the vault — once the Table trusts you."'); Dlg.close(); }, 1500); }
    for (const [k, t] of UG_NOTES) if (u.intelTot >= k && !(u.noteSeen || {})[k]) { u.noteSeen = u.noteSeen || {}; u.noteSeen[k] = 1; setTimeout(() => toast(`<b style="color:#a9c4ff">✉ Intel</b> — ${t}`, 6500), 2600); }
  }
};

// ======================= THE HEIST BOARD =======================
const Heist = {
  DIRS: { up: [0, -1], down: [0, 1], left: [-1, 0], right: [1, 0] },
  async plan(j) {
    const u = UG.st(), kess = (G.S.party || []).includes('kess');
    const free = u.funds >= 600;
    let routes = free, smoke = 1 + (UG.veil() ? 1 : 0);
    const opts = [];
    const c = await ask(null, null, `${j.t}. ${j.d}${kess ? ' Kess cracks her knuckles: "Locks are mine."' : ''}`, [free ? 'Kairo\'s blueprint shows every guard route. Go.' : u.intel > 0 ? 'Spend 1 intel on the guard routes, then go' : 'Buy the guard routes from the fixer (25g), then go', 'Go in blind', 'Not tonight']); Dlg.close();
    if (c === 2) return;
    if (c === 0 && !free) { if (u.intel > 0) { u.intel--; routes = true; } else if (G.S.gold >= 25) { G.S.gold -= 25; routes = true; } else toast('Not enough gold — going in blind.', 2000); }
    return this.run(j, { routes, smoke, coins: 3, kess });
  },
  run(j, o) {
    return new Promise(res => {
      const rows = UG_MAPS[j.map].map(r => r.split(''));
      const H = this.H = { j, rows, w: rows[0].length, h: rows.length, px: 0, py: 0, loot: false, noise: 0, alarm: 0, turn: 0, seen: false, smoke: o.smoke, coins: o.coins, routes: o.routes, kess: o.kess, mode: null, msg: 'Reach the ◆ lock, then get back to the exit. Tap a tile next to you to move.', res, busy: false, fx: [] };
      rows.forEach((r, y) => r.forEach((ch, x) => { if (ch === 'S') { H.px = x; H.py = y; H.sx = x; H.sy = y; } }));
      H.guards = UG_GUARDS[j.g].map(g => this.mkGuard(g));
      this.mount(); this.draw();
    });
  },
  mkGuard(g) {
    const path = [];
    const seg = (a, b) => { let [x, y] = a; const out = []; while (x !== b[0] || y !== b[1]) { x += Math.sign(b[0] - x); if (x === b[0]) y += Math.sign(b[1] - y); out.push([x, y]); } return out; };
    if (g.at) return { x: g.at[0], y: g.at[1], path: [g.at], pi: 0, turns: g.turns, ti: 0, dir: g.turns[0], ko: 0, blind: 0 };
    const pts = g.loop || g.pp; path.push(pts[0]);
    for (let i = 1; i < pts.length; i++) path.push(...seg(pts[i - 1], pts[i]));
    if (g.loop) path.push(...seg(pts[pts.length - 1], pts[0]).slice(0, -1));
    else { const back = path.slice(0, -1).reverse().slice(0, -1); path.push(...back); }
    const n = path[1] || path[0]; return { x: path[0][0], y: path[0][1], path, pi: 0, dir: this.dirTo(path[0], n), ko: 0, blind: 0 };
  },
  dirTo(a, b) { const dx = b[0] - a[0], dy = b[1] - a[1]; return Math.abs(dx) > Math.abs(dy) ? (dx > 0 ? 'right' : 'left') : (dy > 0 ? 'down' : dy < 0 ? 'up' : 'down'); },
  wall(x, y) { const H = this.H; const ch = (H.rows[y] || [])[x]; return ch === undefined || ch === '#' || ch === 'c'; },
  cone(g) {
    const H = this.H, out = []; if (g.ko || g.blind > 0) return out; const [dx, dy] = this.DIRS[g.dir], R = 3 + (H.alarm >= 2 ? 1 : 0);
    for (let d = 1; d <= R; d++) { const x = g.x + dx * d, y = g.y + dy * d; if (this.wall(x, y)) break; out.push([x, y]);
      if (d >= 2) for (const s of [-1, 1]) { const sx = x + (dy ? s : 0), sy = y + (dx ? s : 0); if (!this.wall(sx, sy) && !this.wall(g.x + dx * (d - 1) + (dy ? s : 0), g.y + dy * (d - 1) + (dx ? s : 0))) out.push([sx, sy]); } }
    return out;
  },
  seenBy() { const H = this.H; return H.guards.find(g => this.cone(g).some(([x, y]) => x === H.px && y === H.py)); },
  bfs(from, to) {
    const H = this.H, key = (x, y) => x + ',' + y, prev = { [key(...from)]: null }, q = [from];
    while (q.length) { const [x, y] = q.shift(); if (x === to[0] && y === to[1]) break;
      for (const [dx, dy] of Object.values(this.DIRS)) { const nx = x + dx, ny = y + dy, k = key(nx, ny); if (k in prev || this.wall(nx, ny)) continue; prev[k] = [x, y]; q.push([nx, ny]); } }
    let cur = to, step = null; if (!(key(...to) in prev)) return null; while (prev[key(...cur)] && key(...prev[key(...cur)]) !== key(...from)) cur = prev[key(...cur)]; step = cur; return step;
  },
  // ---------------- one turn ----------------
  async act(kind, tx, ty) {
    const H = this.H; if (!H || H.busy) return; H.busy = true;
    try {
      if (kind === 'move') {
        const g = H.guards.find(g => !g.ko && g.x === tx && g.y === ty);
        if (g) { if (this.cone(g).some(([x, y]) => x === H.px && y === H.py) || (g.x + this.DIRS[g.dir][0] === H.px && g.y + this.DIRS[g.dir][1] === H.py)) { H.msg = 'He\'s facing you — you can\'t take him from the front.'; return; }
          g.ko = 1; sfx('hit'); H.fx.push({ x: tx, y: ty, t: performance.now(), s: UG.veil() ? 'SILENT TAKEDOWN' : 'TAKEDOWN' }); if (!UG.veil()) { H.noise++; H.msg = 'Takedown — but it was loud. (The Veil does it silently.)'; } else H.msg = 'The Veil puts him to sleep without a sound.'; }
        else { H.px = tx; H.py = ty; sfx('step'); }
        const ch = H.rows[H.py][H.px];
        if (ch === 'L' && !H.loot) { this.draw(); const ok = await this.lock(); H.rows[H.py][H.px] = '.'; if (ok) { H.loot = true; H.msg = 'Got it. Now get back to the EXIT.'; sfx('coin'); } else { H.loot = true; H.noise += 2; H.msg = 'You forced it — loud. Got it anyway. Get OUT.'; } }
        if (ch === 'I') { H.rows[H.py][H.px] = '.'; UG.st().intel++; UG.st().intelTot = (UG.st().intelTot || 0) + 1; H.msg = 'Papers on the desk — you pocket them. (+1 intel)'; sfx('coin'); }
        if (H.loot && H.px === H.sx && H.py === H.sy) return this.end(true);
      } else if (kind === 'smoke') { if (H.smoke <= 0) return; H.smoke--; for (const g of H.guards) if (Math.abs(g.x - H.px) + Math.abs(g.y - H.py) <= 3) g.blind = 3; H.fx.push({ x: H.px, y: H.py, t: performance.now(), s: 'SMOKE', smoke: 1 }); sfx('dodge'); H.msg = 'Smoke! Nearby guards can\'t see for a few turns.'; }
      else if (kind === 'coin') { if (H.coins <= 0 || this.wall(tx, ty)) return; H.coins--; H.mode = null; const g = H.guards.filter(g => !g.ko && !g.turns).sort((a, b) => (Math.abs(a.x - tx) + Math.abs(a.y - ty)) - (Math.abs(b.x - tx) + Math.abs(b.y - ty)))[0];
        if (g) { g.distract = [tx, ty]; g.dt = 0; } H.fx.push({ x: tx, y: ty, t: performance.now(), s: '*clink*' }); sfx('coin'); H.msg = g ? 'A guard turns toward the sound…' : 'Nobody heard it.'; }
      // the player may have walked into a cone
      let s = this.seenBy(); if (s) { if (await this.spotted(s)) return; }
      // guards move
      H.turn++;
      for (const g of H.guards) { if (g.ko) continue; if (g.blind > 0) { g.blind--; continue; }
        if (g.distract) { const st = this.bfs([g.x, g.y], g.distract); if (st && !(st[0] === H.px && st[1] === H.py)) { g.dir = this.dirTo([g.x, g.y], st); g.x = st[0]; g.y = st[1]; }
          if ((g.x === g.distract[0] && g.y === g.distract[1]) || ++g.dt > 5) { g.distract = null; g.back = 1; } continue; }
        if (g.back) { const tgt = g.path[g.pi]; if (g.x === tgt[0] && g.y === tgt[1]) g.back = 0; else { const st = this.bfs([g.x, g.y], tgt); if (st && !(st[0] === H.px && st[1] === H.py)) { g.dir = this.dirTo([g.x, g.y], st); g.x = st[0]; g.y = st[1]; } continue; } }
        if (g.turns) { if (H.turn % 2 === 0) { g.ti = (g.ti + 1) % g.turns.length; g.dir = g.turns[g.ti]; } continue; }
        const ni = (g.pi + 1) % g.path.length, n = g.path[ni]; if (n[0] === H.px && n[1] === H.py) { g.dir = this.dirTo([g.x, g.y], n); continue; }
        g.dir = this.dirTo([g.x, g.y], n); g.x = n[0]; g.y = n[1]; g.pi = ni;
        const nn = g.path[(ni + 1) % g.path.length]; if (nn) g.dir = this.dirTo(n, nn); }
      if (H.noise >= 3) { H.noise = 0; const g = H.guards.filter(g => !g.ko)[0]; H.msg = 'Too much noise — someone is coming!'; if (g) { if (await this.spotted(g, 1)) return; } }
      s = this.seenBy(); if (s) { if (await this.spotted(s)) return; }
    } finally { if (this.H) { this.H.busy = false; this.draw(); } }
  },
  async spotted(g, heard) {
    const H = this.H; H.alarm++; sfx('alarm'); this.draw();
    if (!H.seen) { H.seen = true; if (!UG.veil()) { try { Story.addSus(1); } catch (e) { } try { Rep.deed(-1, `seen breaking into ${H.j.t.replace(/^The /, 'the ')}`, H.j.town, -1); } catch (e) { } }
      else try { Veil.addFame(1, 'a guard swears he saw the Red Veil.'); } catch (e) { } }
    await this.hide(heard ? 'Heard you! A guard comes running —' : 'SPOTTED!');
    const foes = H.j.foes.slice(0, Math.min(H.j.foes.length, 1 + H.alarm));
    const r = await Battle.start({ enemies: foes, bd: 'crypt', noFlee: true, ugHeist: 1 });
    if (r === 'lose') { this.unmount(); H.res(); await UG.fail(H.j); return true; }
    g.ko = 1;
    if (H.alarm >= 3) { this.unmount(); await say(null, null, 'Bells. Shouting. The whole house is awake — you go out through a window.'); Dlg.close();
      if (H.loot) await UG.pay(H.j, await this.choice(), true); else { toast('You got out — with nothing.', 3000); }
      H.res(); return true; }
    this.show(); H.msg = `Alarm ${H.alarm}/3 — guards see further now. ${H.loot ? 'Get to the EXIT!' : ''}`; return false;
  },
  async end(clean) {
    const H = this.H; this.unmount(); sfx('level');
    await say(null, null, H.alarm ? 'You slip out. Not clean — but out.' : 'In and out. Nobody saw a thing.'); Dlg.close();
    const c = await this.choice(); await UG.pay(H.j, c, false); H.res();
  },
  async choice() { const j = this.H.j; if (!j.end) return 0; const c = await ask(null, null, j.end.q, j.end.a); Dlg.close(); return c; },
  // ---------------- the lock ----------------
  lock() {
    const H = this.H, pins = H.kess ? 2 : 3;
    return new Promise(res => {
      const L = H.lockS = { pin: 0, pins, a0: Math.random() * 6.28, w: H.kess ? .9 : .65, t0: performance.now(), miss: 0, res };
      L.spd = 2.2;
    });
  },
  tapLock() {
    const H = this.H, L = H.lockS; if (!L) return;
    const ang = ((performance.now() - L.t0) / 1000 * L.spd) % 6.283, d = Math.abs(((ang - L.a0 + 9.42) % 6.283) - 3.14);
    if (d <= L.w / 2) { L.pin++; sfx('parry'); L.a0 = Math.random() * 6.28; L.spd += .9; L.w *= .85; if (L.pin >= L.pins) { H.lockS = null; L.res(L.miss < 3); } }
    else { L.miss++; H.noise++; sfx('hurt'); if (L.miss >= 3) { H.lockS = null; L.res(false); } }
  },
  // ---------------- screen ----------------
  mount() {
    let el = document.getElementById('heist');
    if (!el) { el = document.createElement('div'); el.id = 'heist'; document.body.appendChild(el); }
    el.style.cssText = 'position:fixed;inset:0;z-index:40;background:#081525;display:flex;flex-direction:column;touch-action:none;font-family:Nunito,sans-serif';
    el.innerHTML = `<canvas id="hcan" style="flex:1;width:100%;min-height:0"></canvas>
      <div style="display:flex;gap:8px;justify-content:center;padding:6px 10px 10px;flex-wrap:wrap">
      <button class="btn" id="hWait">Wait</button><button class="btn" id="hSmoke">Smoke</button><button class="btn" id="hCoin">Throw coin</button><button class="btn" id="hQuit" style="opacity:.8">Abort</button></div>`;
    UI.controls(false); World.busy = true;
    const cv = $('#hcan'); cv.addEventListener('pointerdown', e => this.tap(e));
    bindTap($('#hWait'), () => this.act('wait'));
    bindTap($('#hSmoke'), () => this.act('smoke'));
    bindTap($('#hCoin'), () => { const H = this.H; if (H.coins > 0) { H.mode = H.mode === 'coin' ? null : 'coin'; H.msg = H.mode ? 'Tap a floor tile to throw the coin.' : ''; this.draw(); } });
    bindTap($('#hQuit'), async () => { const H = this.H; this.unmount(); await say(null, null, 'You back out into the night. The job will keep.'); Dlg.close(); H.res(); });
    const loop = () => { if (!document.getElementById('heist') || document.getElementById('heist').style.display === 'none') { this.raf = 0; return; } this.draw(); this.raf = requestAnimationFrame(loop); };
    this.raf = requestAnimationFrame(loop);
  },
  hide(s) { const el = document.getElementById('heist'); return new Promise(r => { this.H.msg = s; this.draw(); setTimeout(() => { if (el) el.style.display = 'none'; r(); }, 700); }); },
  show() { const el = document.getElementById('heist'); if (el) { el.style.display = 'flex'; UI.controls(false); World.busy = true; const loop = () => { if (el.style.display === 'none' || !el.isConnected) return; this.draw(); requestAnimationFrame(loop); }; requestAnimationFrame(loop); } },
  unmount() { const el = document.getElementById('heist'); if (el) el.remove(); UI.controls(true); World.busy = false; },
  geom() { const cv = $('#hcan'), H = this.H, W = cv.clientWidth, Hh = cv.clientHeight, top = 44, T = Math.floor(Math.min((W - 24) / H.w, (Hh - top - 30) / H.h)); return { cv, W, Hh, T, ox: Math.round((W - T * H.w) / 2), oy: top }; },
  tap(e) {
    const H = this.H; if (!H || H.busy) return;
    if (H.lockS) { this.tapLock(); return; }
    const { cv, T, ox, oy } = this.geom(), r = cv.getBoundingClientRect(), x = Math.floor((e.clientX - r.left - ox) / T), y = Math.floor((e.clientY - r.top - oy) / T);
    if (x < 0 || y < 0 || x >= H.w || y >= H.h) return;
    if (H.mode === 'coin') { if (Math.abs(x - H.px) + Math.abs(y - H.py) <= 5) this.act('coin', x, y); return; }
    if (Math.abs(x - H.px) + Math.abs(y - H.py) === 1 && !this.wall(x, y)) this.act('move', x, y);
  },
  draw() {
    const H = this.H, cv = $('#hcan'); if (!H || !cv) return;
    const dpr = Math.min(2, window.devicePixelRatio || 1), { W, Hh, T, ox, oy } = this.geom();
    if (cv.width !== W * dpr || cv.height !== Hh * dpr) { cv.width = W * dpr; cv.height = Hh * dpr; }
    const c = cv.getContext('2d'); c.setTransform(dpr, 0, 0, dpr, 0, 0); c.clearRect(0, 0, W, Hh);
    const now = performance.now(), veil = UG.veil();
    // header
    c.font = '900 15px Nunito, sans-serif'; c.textAlign = 'left'; c.fillStyle = '#cfe6ff'; c.fillText(H.j.t.toUpperCase(), 14, 22);
    c.font = '800 12px Nunito, sans-serif'; c.fillStyle = '#ff8a7a'; c.fillText('ALARM ' + '●'.repeat(H.alarm) + '○'.repeat(Math.max(0, 3 - H.alarm)), 14, 38);
    c.fillStyle = '#ffd36a'; c.fillText('NOISE ' + '▮'.repeat(H.noise) + '▯'.repeat(Math.max(0, 3 - H.noise)), 120, 38);
    c.fillStyle = H.loot ? '#9be37a' : '#8aa'; c.fillText(H.loot ? '◆ LOOT: YES' : '◆ LOOT: NOT YET', 230, 38);
    c.fillStyle = '#9fb8d0'; c.fillText(`smoke ×${H.smoke} · coins ×${H.coins}${H.kess ? ' · Kess on locks' : ''}${veil ? ' · RED VEIL' : ' · as REN'}`, 350, 38);
    c.textAlign = 'right'; c.fillStyle = '#e8f2ff'; c.fillText(H.msg || '', W - 14, 22); c.textAlign = 'left';
    // tiles
    for (let y = 0; y < H.h; y++) for (let x = 0; x < H.w; x++) { const ch = H.rows[y][x], X = ox + x * T, Y = oy + y * T;
      c.fillStyle = ch === '#' ? '#4f7fb3' : '#10283f'; c.fillRect(X, Y, T, T); c.strokeStyle = 'rgba(140,190,255,.12)'; c.strokeRect(X + .5, Y + .5, T - 1, T - 1);
      if (ch === 'c') { c.fillStyle = '#7a5a32'; c.fillRect(X + 4, Y + 4, T - 8, T - 8); c.strokeStyle = '#a9824a'; c.strokeRect(X + 4.5, Y + 4.5, T - 9, T - 9); c.beginPath(); c.moveTo(X + 4, Y + 4); c.lineTo(X + T - 4, Y + T - 4); c.stroke(); }
      if (ch === 'L') { const k = .6 + Math.sin(now / 200) * .4; c.fillStyle = `rgba(255,211,106,${k})`; c.font = `900 ${T * .6}px sans-serif`; c.textAlign = 'center'; c.fillText('◆', X + T / 2, Y + T * .72); c.textAlign = 'left'; }
      if (ch === 'I') { c.fillStyle = '#e8e0c8'; c.fillRect(X + T * .25, Y + T * .3, T * .5, T * .38); c.fillStyle = '#7a6a50'; c.fillRect(X + T * .3, Y + T * .38, T * .4, 2); c.fillRect(X + T * .3, Y + T * .48, T * .3, 2); }
      if (ch === 'S') { c.strokeStyle = '#46ff95'; c.lineWidth = 2; c.strokeRect(X + 3, Y + 3, T - 6, T - 6); c.lineWidth = 1; c.fillStyle = '#46ff95'; c.font = `800 ${Math.max(8, T * .26)}px Nunito`; c.textAlign = 'center'; c.fillText('EXIT', X + T / 2, Y + T * .62); c.textAlign = 'left'; } }
    // vision cones + routes
    for (const g of H.guards) { if (g.ko) continue;
      c.fillStyle = H.alarm ? 'rgba(255,60,40,.34)' : 'rgba(255,90,60,.24)'; for (const [x, y] of this.cone(g)) c.fillRect(ox + x * T + 1, oy + y * T + 1, T - 2, T - 2);
      if (H.routes && !g.turns) { c.fillStyle = 'rgba(255,140,120,.7)'; for (let i = 1; i <= 4; i++) { const p = g.path[(g.pi + i) % g.path.length]; c.beginPath(); c.arc(ox + p[0] * T + T / 2, oy + p[1] * T + T / 2, 2.5, 0, 7); c.fill(); } } }
    // reachable tiles
    if (!H.busy && !H.lockS) for (const [dx, dy] of Object.values(this.DIRS)) { const x = H.px + dx, y = H.py + dy; if (!this.wall(x, y)) { c.strokeStyle = 'rgba(70,255,149,.45)'; c.lineWidth = 2; c.strokeRect(ox + x * T + 4, oy + y * T + 4, T - 8, T - 8); c.lineWidth = 1; } }
    // guards
    for (const g of H.guards) { const X = ox + g.x * T + T / 2, Y = oy + g.y * T + T / 2;
      if (g.ko) { c.strokeStyle = '#778'; c.lineWidth = 3; c.beginPath(); c.moveTo(X - T * .2, Y - T * .2); c.lineTo(X + T * .2, Y + T * .2); c.moveTo(X + T * .2, Y - T * .2); c.lineTo(X - T * .2, Y + T * .2); c.stroke(); c.lineWidth = 1; continue; }
      c.fillStyle = g.blind > 0 ? '#888' : '#e0503c'; c.beginPath(); c.arc(X, Y, T * .3, 0, 7); c.fill(); const [dx, dy] = this.DIRS[g.dir];
      c.fillStyle = '#fff'; c.beginPath(); c.moveTo(X + dx * T * .42, Y + dy * T * .42); c.lineTo(X + dy * T * .14 + dx * T * .18, Y + dx * T * .14 + dy * T * .18); c.lineTo(X - dy * T * .14 + dx * T * .18, Y - dx * T * .14 + dy * T * .18); c.fill();
      if (g.blind > 0) { c.fillStyle = 'rgba(200,200,200,.5)'; c.beginPath(); c.arc(X, Y, T * .45, 0, 7); c.fill(); }
      if (g.distract) { c.fillStyle = '#ffd36a'; c.font = `900 ${T * .4}px sans-serif`; c.textAlign = 'center'; c.fillText('?', X, Y - T * .35); c.textAlign = 'left'; } }
    // player
    { const X = ox + H.px * T + T / 2, Y = oy + H.py * T + T / 2; c.fillStyle = veil ? '#ff5a5a' : '#46ff95'; c.beginPath(); c.arc(X, Y, T * .32, 0, 7); c.fill(); c.fillStyle = '#081525'; c.font = `900 ${T * .34}px Nunito`; c.textAlign = 'center'; c.fillText(veil ? 'V' : 'R', X, Y + T * .12); c.textAlign = 'left'; }
    // fx
    H.fx = H.fx.filter(f => now - f.t < 1400); for (const f of H.fx) { const k = (now - f.t) / 1400, X = ox + f.x * T + T / 2, Y = oy + f.y * T; if (f.smoke) { c.fillStyle = `rgba(200,200,210,${.4 * (1 - k)})`; c.beginPath(); c.arc(X, Y + T / 2, T * (1 + k * 2), 0, 7); c.fill(); }
      c.globalAlpha = 1 - k; c.fillStyle = '#fff'; c.font = '900 12px Nunito'; c.textAlign = 'center'; c.fillText(f.s, X, Y - k * 20); c.textAlign = 'left'; c.globalAlpha = 1; }
    // lock
    const L = H.lockS; if (L) { c.fillStyle = 'rgba(4,10,20,.78)'; c.fillRect(0, 0, W, Hh); const cx = W / 2, cy = Hh / 2, R = Math.min(W, Hh) * .26, ang = ((now - L.t0) / 1000 * L.spd) % 6.283;
      c.lineWidth = 14; c.strokeStyle = '#26405e'; c.beginPath(); c.arc(cx, cy, R, 0, 7); c.stroke(); c.strokeStyle = '#ffd36a'; c.beginPath(); c.arc(cx, cy, R, L.a0 - L.w / 2, L.a0 + L.w / 2); c.stroke();
      c.lineWidth = 4; c.strokeStyle = '#fff'; c.beginPath(); c.moveTo(cx, cy); c.lineTo(cx + Math.cos(ang) * (R + 10), cy + Math.sin(ang) * (R + 10)); c.stroke(); c.lineWidth = 1;
      c.fillStyle = '#e8f2ff'; c.font = '900 16px Nunito'; c.textAlign = 'center'; c.fillText(`PICK THE LOCK — tap when the needle is in the gold (${L.pin}/${L.pins})`, cx, cy - R - 26); c.font = '800 12px Nunito'; c.fillStyle = '#ffd36a'; c.fillText(`misses: ${L.miss}/3 — every miss makes noise`, cx, cy + R + 34); c.textAlign = 'left'; }
    // buttons state
    const sb = $('#hSmoke'), cb = $('#hCoin'); if (sb) { sb.textContent = `Smoke ×${H.smoke}`; sb.disabled = H.smoke <= 0; } if (cb) { cb.textContent = H.mode === 'coin' ? 'Cancel throw' : `Throw coin ×${H.coins}`; cb.disabled = H.coins <= 0 && H.mode !== 'coin'; }
  }
};

// ======================= the fixers & Tamsin in the world =======================
(function () {
  CHAR.nessa = CHAR.nessa || { name: 'Nessa Crane', sprite: 'rebel2' };
  CHAR.jory = CHAR.jory || { name: 'Jory Inkwell', sprite: 'folk1' };
  CHAR.haskell = CHAR.haskell || { name: 'Steward Haskell', sprite: 'folk16' };
  for (const [org, O] of Object.entries(UG_ORGS)) {
    const S = SCENES[O.scene]; if (!S || typeof S.npcs !== 'function') continue; const _n = S.npcs;
    S.npcs = function () { const L = _n.apply(this, arguments);
      try { if (UG.open() && UG.st().met) { const [x, y] = freeNear(S.map || (O.scene === 'a_inn' ? 'in_inn' : 'in_tavern'), O.at[0], O.at[1]);
        L.push({ id: 'ug_' + org, sprite: O.spr, x, y, dir: 'left', name: O.fx, talk: () => UG.fixer(org), qm: () => UG_JOBS.some(j => j.org === org && !UG.st().done[j.id] && (UG.st().org[org] || 0) >= j.need && (!j.kairo || UG.st().kairo)) ? '$' : null }); } } catch (e) { }
      return L; };
  }
  // Tamsin introduces the underworld the first time you walk into the Crooked Kettle (once Green Eclipse trusts you)
  const _l = World.load.bind(World);
  World.load = async function (name, x, y, dir) {
    const r = await _l(name, x, y, dir);
    try { if (G.S.map === 'a_inn' && UG.open() && !UG.st().met && typeof Arcs !== 'undefined') Arcs.whenIdle(async () => { if (G.S.map !== 'a_inn' || UG.st().met) return;
      const [tx, ty] = freeNear('in_inn', World.player.x + 1, World.player.y); await World.addNpc({ id: 'ug_tamsin', sprite: 'tamsin', x: tx, y: ty, dir: 'left', name: 'Tamsin' });
      await UG.intro(); try { World.removeNpc ? World.removeNpc('ug_tamsin') : 0; } catch (e) { } try { await World.load('a_inn', World.player.x, World.player.y, World.player.dir); } catch (e) { } }); } catch (e) { }
    return r;
  };
})();
