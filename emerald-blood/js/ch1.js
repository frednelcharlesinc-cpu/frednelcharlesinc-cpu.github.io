'use strict';
/* ================= CHAPTER I, WIDENED: the Ashen Vale =================
   Millbrook & Kettlebrook, the lead-by-lead hunt for Halvard (shared with Green Eclipse), Green Eclipse missions
   you help / ignore / stop, taverns full of gossip, town errands with quest marks, fair rival fights, chapter restart. */

/* ---------- intel: you and Green Eclipse, both hunting the same priest ---------- */
const Intel = {
  list() { G.S.intel = G.S.intel || []; return G.S.intel; },
  add(by, t) { const L = this.list(); if (L.some(e => e.t === t)) return; L.push({ by, t }); if (by === 'ge') toast('<b style="color:#a9c4ff">Green Eclipse</b> is a step ahead…', 2200); else toast('<b style="color:#46ff95">New lead</b> added to your intel.', 2000); }
};
/* ---------- Green Eclipse notoriety: their uniforms grow a cape when the Crown starts to fear them ---------- */
const GE_SPR = ['tamsin', 'bo', 'lark', 'ge_dace', 'ge_sefa', 'ge_wren', 'ge_corran'];
const Notoriety = {
  val() { const f = G.S ? G.S.f : {}; return (f.fear || 0) + ['ge1', 'ge2', 'ge3'].filter(k => f[k]).length + (f.millDone ? 2 : 0) + ((G.S && G.S.chapter) >= 2 ? 3 : 0) + (f.coupHint ? 1 : 0); },
  level() { const v = this.val(); return v >= 10 ? 3 : v >= 6 ? 2 : v >= 3 ? 1 : 0; },
  name() { return ['Whispered', 'Known', 'Wanted', 'Feared'][this.level()]; },
  desc() { return ['A rumour in tavern corners.', 'The vale knows their colours — black coats, green tabards.', 'Their faces are on Crown posters. They wear the green cape openly now.', "The Crown pays a fortune for Kairo's head. Whole towns lock their doors at the sight of a green cape."][this.level()]; }
};
(function () { const _n = npcImg; npcImg = async function (name) { if (GE_SPR.includes(name) && G.S && Notoriety.level() >= 2) name = name + '_c'; return _n(name); }; })();

/* ---------- what the vale thinks of Drags: your hope vs Kairo's fear ---------- */
const Opinion = {
  get hope() { return G.S.f.hope || 0; }, get fear() { return (G.S.f.fear || 0) + 1; },
  add(k, n) { const f = G.S.f; f[k] = Math.max(0, (f[k] || 0) + n); if (n > 0) toast(k === 'hope' ? '<b style="color:#46ff95">Hope</b> for Drags grows in the vale.' : '<b style="color:#ff7a6a">Fear</b> of Drags grows in the vale.', 2200); },
  mood() { const h = this.hope, f = this.fear;
    if (h >= 3 && f >= 3) return ['split', 'The vale is split down the middle — a hooded Drag who saves people, a burned one who makes them kneel.'];
    if (h - f >= 2) return ['hope', 'Hope is winning. People whisper about the hooded Drag who saves children and spares guards.'];
    if (f - h >= 2) return ['fear', "Fear is winning. Kairo's Green Eclipse has the vale bolting its doors at dusk."];
    return ['even', 'The vale hasn\'t decided what Drags are yet. Every story about you — and about Kairo — tips the scale.']; }
};

/* ---------- fair fights: rivals always meet you at full strength ---------- */
const RIVAL_KEYS = ['kairo_spar', 'kairo_duel', 'vane_spar', 'vane', 'ge_dace_r', 'ge_wren_r', 'ge_tamsin_r', 'ge_corran_r', 'cael'];
(function () {
  const _start = Battle.start.bind(Battle);
  Battle.start = async function (cfg) {
    const c = typeof cfg === 'string' ? { enemies: [cfg] } : cfg;
    if (c && c.enemies && c.enemies.some(k => RIVAL_KEYS.includes(k))) { Story.heal(true); setTimeout(() => toast('A fair fight — <b style="color:#46ff95">HP & MP fully restored</b>.', 2400), 200); }
    return _start(cfg);
  };
})();

/* ---------- new foes and temporary allies ---------- */
const GE_RIVAL = { ge_dace_r: 'dace', ge_wren_r: 'wren', ge_tamsin_r: 'tamsin', ge_corran_r: 'corran' };
Object.assign(ENEMY, {
  reg_captain: { name: 'Registry Captain', img: 'guard', shield: 2, trait: 'Shielded — many small hits break his guard', hp: 95, atk: 13, def: 5, spd: 11, dodge: .08, parry: .3, brk: 60, xp: 36, gold: 30,
    skills: [{ name: 'Spear Thrust', hits: [{ anim: 'thrust', m: 1.1, w: 540 }] }, { name: 'Registry Drill', w: .45, hits: [{ anim: 'thrust', m: .7, w: 480 }, { anim: 'thrust', m: .7, w: 300 }, { anim: 'thrust', m: .9, w: 500 }] }] },
  inq_clerk: { name: 'Clerk Ivo', img: 'acolyte', trait: 'Rings the alarm bell when hurt', hp: 60, atk: 10, def: 4, spd: 9, dodge: .05, parry: .2, brk: 44, xp: 18, gold: 20,
    skills: [{ name: 'Ledger Strike', hits: [{ anim: 'slash', m: 1, w: 560 }] }, { name: 'Ember Verdict', w: .4, hits: [{ anim: 'spellcast', m: 1.3, w: 700 }] }] },
  ge_dace_r: { name: 'Dace', drag: 1, img: 'ge_dace', trait: 'Green Eclipse — reckless, fast, hits like a door', hp: 150, atk: 13, def: 4, spd: 15, dodge: .22, parry: .15, brk: 70, xp: 45, gold: 0,
    skills: [{ name: 'Brawler Rush', hits: [{ anim: 'slash', m: .7, w: 480 }, { anim: 'slash', m: .7, w: 280 }, { anim: 'thrust', m: .9, w: 420 }] }, { name: 'Headbutt', w: .3, hits: [{ anim: 'run', m: 1.5, w: 700, unp: 1 }] }] },
  ge_wren_r: { name: 'Wren', drag: 1, img: 'ge_wren', trait: 'Green Eclipse — four years in a cage taught her patience', hp: 120, atk: 12, def: 3, spd: 17, dodge: .3, parry: .1, brk: 60, xp: 40, gold: 0,
    skills: [{ name: 'Needle Dance', hits: [{ anim: 'thrust', m: .55, w: 420 }, { anim: 'thrust', m: .55, w: 240 }, { anim: 'thrust', m: .55, w: 240 }, { anim: 'thrust', m: .7, w: 300 }] }, { name: 'Cage-Breaker', w: .35, hits: [{ anim: 'slash', m: 1.4, w: 900 }] }] },
  ge_tamsin_r: { name: 'Tamsin', drag: 1, img: 'tamsin', trait: "Green Eclipse — Kairo's right hand. Fights like she has something to prove to him", hp: 165, atk: 14, def: 4, spd: 16, dodge: .25, parry: .2, brk: 80, xp: 55, gold: 0,
    skills: [{ name: 'Ember Twinblades', hits: [{ anim: 'slash', m: .65, w: 460 }, { anim: 'halfslash', m: .65, w: 260 }, { anim: 'slash', m: .9, w: 380 }] }, { name: 'For Kairo', w: .3, hits: [{ anim: 'jump', m: 1.7, w: 780, unp: 1 }] }] },
  ge_corran_r: { name: 'Corran', drag: 1, img: 'ge_corran', trait: 'Green Eclipse — the old smith. Slow, and very hard to move', hp: 190, atk: 13, def: 7, spd: 9, dodge: .05, parry: .35, brk: 95, xp: 50, gold: 0,
    skills: [{ name: 'Forge Hammer', hits: [{ anim: 'slash', m: 1.3, w: 760 }] }, { name: 'Anvil Rhythm', w: .4, hits: [{ anim: 'slash', m: .7, w: 600 }, { anim: 'slash', m: .7, w: 600 }, { anim: 'slash', m: .9, w: 600 }] }] }
});
Object.assign(TIER, { reg_captain: 'C', inq_clerk: 'D' });
for (const [k, id] of Object.entries(GE_RIVAL)) Object.defineProperty(TIER, k, { configurable: true, enumerable: true, get() { return stepGrade(Rivals.ge(id)).grade; } });
(function () { // GE rivals scale with you, a colour or two behind Kairo
  const _run = Battle.run.bind(Battle);
  Battle.run = function () {
    const B = this.B;
    if (B) for (const a of B.actors) if (GE_RIVAL[a.key] && !a.scaled) {
      a.scaled = 1; const k = 1 + Math.max(0, Power.now().i - 2) * .18;
      a.maxHp = Math.round(a.maxHp * k); a.hp = a.maxHp; a.atk = Math.round(a.atk * k); a.def = Math.round(a.def * (1 + (k - 1) * .5));
    }
    return _run();
  };
})();
Object.assign(ALLY, {
  dace: { name: 'Dace', drag: 1, sprite: 'ge_dace', color: '#3f9a5a', hp: 74, mp: 14, atk: 14, def: 4, spd: 15, arts: ['cleave'] },
  tamsin: { name: 'Tamsin', drag: 1, sprite: 'tamsin', color: '#d8742a', hp: 76, mp: 18, atk: 15, def: 4, spd: 16, arts: ['cleave', 'needle'] }
});

/* ---------- the people of the vale ---------- */
const VFOLK = {
  oswin: ['Oswin the Ferryman', 'folk3', { age: 'elder', beard: 'full' }], dunstan: ['Miller Dunstan', 'folk12', { plump: 1, stache: 'walrus' }],
  fen: ['Fen the Herbalist', 'elf_f1', { elf: 1 }], aud: ['Sister Aud', 'folk5', { cloth: 'robe' }], mina: ['Mina', 'dkid3', { eye: 'green' }],
  marta: ['Marta Reed', 'folk19', {}], hollis: ['Reeve Hollis', 'folk9', { gaunt: 1 }], orla: ['Widow Orla', 'folk14', { age: 'elder' }],
  pell: ['Pell the Baker', 'dwarf_m1', { beard: 'full', plump: 1 }], gunna: ['Gunna Stoutbarrel', 'dwarf_f1', {}], ivo: ['Clerk Ivo', 'acolyte', {}],
  mbkid: ['Fisher-girl', 'kid8', {}], kbkid: ['Farm boy', 'kid17', {}]
};
for (const [id, [name, sprite, extra]] of Object.entries(VFOLK)) {
  CHAR[id] = { name, sprite, kid: sprite.startsWith('kid') || sprite.startsWith('dkid') };
  Object.defineProperty(ART, id, { configurable: true, get() { return Object.assign(autoSpec(sprite, CHAR[id].kid), extra); } });
}
CHAR.larkMB = { name: 'Lark', sprite: 'lark' };
const freeNear = (map, x, y) => { const M = G.maps[map]; if (!M) return [x, y]; const ok = (a, b) => M.col[b] && M.col[b][a] === '0';
  for (let r = 0; r < 6; r++) for (let dy = -r; dy <= r; dy++) for (let dx = -r; dx <= r; dx++) if (ok(x + dx, y + dy)) return [x + dx, y + dy]; return [x, y]; };
const vnpc = (map, id, x, y, talk, o) => { const [a, b] = freeNear(map, x, y); return Object.assign({ id, sprite: (VFOLK[id] || [])[1] || id, x: a, y: b, dir: 'down', talk, witness: 1, ai: 'turn', turns: ['down', 'left', 'right'] }, o || {}); };
const hoodGasp = async (id, line) => { if (G.S.hood || !G.S.f.hoodGiven) return false; await say(id, 'shock', line); return true; };

/* ---------- the roads out of Ashford's south gate ---------- */
async function valeRoads() {
  const f = F(); UI.controls(false);
  const opts = ['West — the river road to Millbrook', f.lead >= 2 || f.kbVisited ? 'South — the grain road to Kettlebrook' : 'South — the grain road (no reason to go… yet)', 'Stay in Ashford'];
  const c = await ask(null, null, "Ashford's south gate. Two roads fork beyond the last farm: one follows the Ashen River west, one cuts south through the wheat.", opts);
  Dlg.close();
  if (c === 0) { await World.go('millbrook', 45, 17, 'left'); setTimeout(() => Story.run(SCENES.millbrook.onEnter), 60); }
  else if (c === 1) {
    if (!(f.lead >= 2 || f.kbVisited)) { await narr("Farms, wheat and more farms. Nobody there has seen a cage-wagon — and you don't know what you'd even ask yet."); Dlg.close(); }
    else { await World.go('kettlebrook', 23, 2, 'down'); setTimeout(() => Story.run(SCENES.kettlebrook.onEnter), 60); }
  }
  UI.controls(true); return false;
}

/* ================= MILLBROOK ================= */
const MB_LINES = () => { const f = F(), L = ['Fresh perch! Caught this morning!', 'Mind the mud by the ferry.', 'The bridge toll went up again.', "Gilded Hound paid for this bridge. Charges us to cross it, mind.", 'Ring the chapel bell for the drowned, Sister says.', "My nets came up full of green pebbles. Sold 'em to the Crown man."];
  if (f.ge1 === 'ignore' || (f.ge1 === 'stop' && f.ge1lost)) L.push('They left him hanging off the bridge…', "Don't go near the bridge after dark."); if (f.ge1 === 'help' || f.ge1 === 'stop') L.push('A Drag saved those children. A DRAG.', 'Nobody died on the bridge. Nobody!'); return L; };
SCENES.millbrook = {
  title: 'Millbrook', subtitle: 'Ferry village on the Ashen River', music: 'town', bd: 'town',
  crowd: { count: 16, areas: [[12, 14, 26, 21], [33, 15, 45, 20], [6, 15, 11, 20], [10, 27, 26, 30]], talk: e => townTalk(e, MB_TALK), lines: MB_LINES },
  npcs() {
    const f = F(), L = [];
    L.push(vnpc('millbrook', 'oswin', 34, 24, talkOswin, { qm: () => f.lead === 1 ? '!' : null }));
    L.push(vnpc('millbrook', 'dunstan', 7, 14, talkDunstan, { qm: () => !f.sqWheel ? '!' : f.sqWheel === 'won' ? '?' : null }));
    L.push(vnpc('millbrook', 'fen', 10, 26, talkFen, { qm: () => !f.sqHerb ? '!' : f.sqHerb === 'on' && Quests.has('moonpetal') >= 2 ? '?' : null }));
    if (f.sqBelfry !== 'done') L.push(vnpc('millbrook', 'aud', 14, 28, talkAud, { qm: () => !f.sqBelfry ? '!' : null }));
    L.push(vnpc('millbrook', 'mbkid', 21, 22, async () => say('mbkid', null, pick(["Sister Aud says the bell rings by itself sometimes. I think it's a ghost. A NICE ghost.", "Wanna see me skip a stone? …That was four. Four's a record.", F().ge1 === 'help' || F().ge1 === 'stop' ? "The hooded hero saved Teo! Teo's my friend! He has green eyes and he's SO good at hide and seek." : "Mama says don't go near the wagons."])), { ai: 'wander', area: [14, 19, 26, 22], witness: 1 }));
    if (!f.ge1 && f.lead >= 1) { L.push(vnpc('millbrook', 'dace', 42, 14, () => geBridge(), { sprite: 'ge_dace', ai: 'turn', turns: ['left', 'down'], qm: () => '!', witness: 0 })); L.push(vnpc('millbrook', 'wren', 43, 15, () => geBridge(), { sprite: 'ge_wren', witness: 0 })); }
    if (!f.larkMB || f.sqBelfry === 'lark') L.push(vnpc('millbrook', 'larkMB', 38, 15, talkLarkMB, { sprite: 'lark', qm: () => !f.larkMB ? '!' : f.sqBelfry === 'lark' ? '?' : null, witness: 0 }));
    return L;
  },
  exits: [{ x: 47, y: 15, y2: 19, to: 'ashford', tx: 29, ty: 39, dir: 'up' }],
  tiles: {
    '29,10': () => millWheel(), '29,9': () => millWheel(), '29,11': () => millWheel(),
    '19,18': async () => narr('A little fountain carved like a leaping fish. Coins in the basin — and one green pebble, polished smooth, that nobody has dared to take.'),
    '31,17': async () => narr("The Hound's bridge. A brass plate on the rail: PAID FOR BY VARRO KADE. TOLL: ONE COPPER. COMPLAINTS: THE RIVER."),
    '36,23': async () => narr('The ferry landing. A tally-board is nailed to the post — chalk marks for every wagon, every cart, every horse. Oswin counts everything.')
  },
  async onEnter() {
    const f = F();
    if (!f.mbIn) {
      f.mbIn = true;
      await narr('Millbrook. Fishing boats, a mill-race, and a stone bridge the Gilded Hound paid for — and charges you to cross.');
      await narr('Somewhere near the ferry, someone in a green scarf ducks behind a stack of crates. Too slow.');
      if (!G.S.side) G.S.side = 'Millbrook: the ferryman Oswin (by the landing, south-east) counts every wagon.';
      if (f.lead === 1) Story.quest('Find Oswin the ferryman at the Millbrook landing and ask where the cage-wagons went.');
    }
  }
};
const MB_TALK = () => G.S.hood ? ['"Morning. Mind the mud."', '"You came the river road? Any wolves?"', '"The Drowned Duck does a fish stew that\'ll fix anything. Except the fish."', '"Oswin? On his landing. Always on his landing."', '"The Crown men buy green pebbles by the sack now. Strange times."', F().ge1 === 'ignore' ? '"The captain\'s still… on the bridge. Nobody\'ll cut him down. Too scared."' : '"Lovely day for the river."']
  : ['"Gods — green— don\'t hurt us!"', '"Stay back! We paid the toll!"', '"Are you with the rebels? Please, we don\'t want trouble."', F().ge1 === 'help' || F().ge1 === 'stop' ? '"…Wait. Are you the one from the bridge? The one who didn\'t kill anybody?"' : '"Fetch the Sister!"'];
async function townTalk(e, lines) { CHAR[e.id] = { name: e.kid ? 'Child' : 'Villager', sprite: e.sprite, kid: e.kid }; await say(e.id, null, pick(lines())); }

async function talkOswin() {
  const f = F();
  if (await hoodGasp('oswin', "Your eyes— …the girl in the green scarf had the same. Fine. I don't care what colour your eyes are. I care that you leave my landing quick.")) { if (f.lead !== 1) return; }
  if (f.lead >= 2) { await say('oswin', 'neutral', pick(["Grain went south. Kettlebrook. I told you once and once is all I'm paid for.", "Six wagons, four cages, two grain carts. I count everything, traveler. It's the only thing that lets me sleep.", "The ferry's eleven coppers. The bridge is one. People still take the ferry. People like a man who listens."])); return; }
  if (f.lead !== 1) { await say('oswin', 'neutral', "Ferry's eleven coppers. Bridge is one. You want neither? Then you want something else, and that's more than eleven coppers."); return; }
  await say('oswin', 'neutral', "Wagons? Hah. You're the second one this week.");
  await say('oswin', 'happy', "A girl in a green scarf asked me the very same thing yesterday. Paid me in honey cakes. Very good honey cakes. Said a friend of hers would come asking and to tell him he was slow.");
  Intel.add('ge', 'Lark of Green Eclipse questioned Oswin a full day before you did.');
  const c = await ask('oswin', 'neutral', 'So. What are you paying in?', ['(10 gold)', 'My sister was in one of those cages.', '[Lean on him]']);
  if (c === 0) { if (G.S.gold >= 10) { G.S.gold -= 10; sfx('coin'); UI.hud(); } else await say('oswin', 'neutral', "…That's not ten gold. That's a sad face and four coppers. Fine. Fine."); }
  else if (c === 1) await say('oswin', 'sad', "…Ah. Then keep your coin. I had a sister once. River took her. Not the Inquisition. Just the river.");
  else { await say('oswin', 'anger', "I've been leaned on by Imperial captains and the Gilded Hound's toll-men, child. You're not even the scariest thing on this landing today."); await say('oswin', 'neutral', "…But you look like you'd keep coming back. Fine."); }
  await say('oswin', 'neutral', "Six wagons came down the river road from the tomb-mountains five nights back. Four with cages. Two with empty grain carts.");
  await say('oswin', 'sad', "The cages crossed my bridge and turned EAST in the dark, toward Ashford. I counted small hands on the bars. I always count.");
  await say('oswin', 'neutral', "The grain carts went SOUTH, down the grain road, to Kettlebrook — to the granary the Inquisition seized there this spring.");
  await say('oswin', 'neutral', "The priest with them — tall, pale staff, voice like a hymn — paid me in Crown silver to forget. Bought a whole winter of grain.");
  await say('oswin', 'sad', "You don't buy a winter of grain for a wagon trip, child. You buy it for somewhere you mean to STAY. Wherever that grain is going, that's where your cages are.");
  f.lead = 2; sfx('level');
  Intel.add('you', 'Oswin: the cage-wagons turned east toward Ashford in the dark. The grain carts went south to the Inquisition granary at Kettlebrook. Follow the grain — find the cages.');
  Story.quest("Follow the grain: back through Ashford's south gate, then the grain road south to Kettlebrook. Find where the Inquisition's grain is being sent.");
}
async function talkLarkMB() {
  const f = F(); CHAR.larkMB = { name: 'Lark', sprite: 'lark' };
  if (f.sqBelfry === 'lark') {
    await say('larkMB', 'happy', "Oh! Hi! Hi, Mina! I'm Lark. I fit in cracks. You'll fit in cracks too, you're tiny, it's great.");
    await say('larkMB', 'neutral', "We'll get her up the mountain to Sefa. Nobody puts a cage on her ever again. That's a Green Eclipse promise — and Kairo's never broken one.");
    f.sqBelfry = 'done'; f.geTrust = (f.geTrust || 0) + 1; Story.gainXp(30); G.S.gold += 25; sfx('level'); toast('Errand done: <b>The Girl in the Belfry</b> — Mina went with Green Eclipse. (+25g)', 3000); return;
  }
  if (f.larkMB) { await say('larkMB', 'neutral', pick(["Still here? Kettlebrook's SOUTH. You're very slow. Kairo said you'd be slow.", "Tamsin's running the Kettlebrook job. If you're going, don't get between her and anything Kairo asked for."])); return; }
  f.larkMB = true;
  await say('larkMB', 'happy', "Ha! Caught you! …Okay, YOU caught ME, but only because I let you. Kairo owes me three coppers — he said you'd take two more days.");
  await say('larkMB', 'neutral', "We're hunting the same priest, you know. Halvard. Kairo's been on his trail since spring. You've been on it since breakfast.");
  if (f.lead >= 2) await say('larkMB', 'happy', "So you know about the grain too. RACE you to Kettlebrook. Loser tells Kairo he was right about something. Ugh. Worst prize ever.");
  else await say('larkMB', 'neutral', "Oswin knows things. Oswin likes honey cakes. That's a free tip. Kairo would kill me.");
  const c = await ask('larkMB', 'neutral', '…', ["How is Kairo?", "Who's running your Kettlebrook job?", "What is Kairo really planning?", "Go home, Lark."]);
  if (c === 2) {
    await say('larkMB', 'neutral', "…Greyspire's just the door. There's a bigger plan behind it. Something about Aurel. Something about one day when the whole Empire is looking the wrong way.");
    await say('larkMB', 'sad', "He won't tell anyone all of it. Not me. Not Sefa. Not even Tamsin, and Tamsin would walk off a cliff if he pointed at it.");
    await say('larkMB', 'neutral', "He's got rules, though. Three. Cages first. Never a child. Never someone who's already kneeling. Whatever it is — he'll keep those. He always keeps those.");
    f.coupHint = (f.coupHint || 0) + 1; Intel.add('ge', 'Lark: Greyspire is only the door. Kairo is planning something against the Empire itself — "a day when the whole Empire looks the wrong way."'); return;
  }
  if (c === 0) { await say('larkMB', 'neutral', "Busy. Always busy. He sleeps four hours, eats standing up, and knows every Inquisition patrol route east of Aurel by heart."); await say('larkMB', 'sad', "Liora came through last month and he spent the whole visit talking about wagon schedules. To LIORA. Sefa threw a boot at him."); }
  else if (c === 1) { await say('larkMB', 'happy', "Tamsin. Kairo's right hand. She'd walk into a fire for him."); await say('larkMB', 'neutral', "She HAS walked into a fire for him. Twice. Everybody in Green Eclipse knows she's in love with him. Corran knows. Bo knows. The GOATS know."); await me('neutral', "…And Kairo?"); await say('larkMB', 'happy', "Kairo knows the guard rotation of eleven forts. Kairo does NOT know. It's the best show in the whole rebellion."); f.tamsinGossip = true; }
  else if (c === 3) await say('larkMB', 'happy', "I AM home. Home's wherever there's a crack to fit in.");
}
async function geBridge() {
  const f = F(); if (f.ge1) return;
  CHAR.dace = CHAR.dace || { name: 'Dace', sprite: 'ge_dace' };
  await say('dace', 'happy', "Well, look who crawled out of the snow. The famous brother. Kairo's going to be SO annoyed you're here before him.");
  await say('wren', 'neutral', "Registry wagon crosses the bridge at dusk. Three Drag kids in a strongbox cage. A chest of seized stones. Four guards and a captain.");
  await say('dace', 'anger', "We take it. Kids go free. And the captain swings from the Hound's pretty bridge with a green ribbon round his neck — so every Registry clerk in the vale learns to be afraid of us.");
  await say('wren', 'sad', "He's the one who signs the cage orders in this valley. Forty-one signatures I know of. I learned to read on them.");
  const c = await ask('dace', 'neutral', "So, brother. In, out, or in the way?", ["I'll help free them — but nobody hangs.", "This isn't my fight. (Ignore it.)", "No hanging. I'll stop you if I have to."]);
  if (c === 0) {
    await say('dace', 'anger', "…Kairo said you'd say exactly that. Fine. We do it your way. But if he draws on a kid, he's mine.");
    await fadeOut(800); await narr('Dusk. The wagon rolls onto the bridge. Wren drops from the rail onto the driver. Dace walks out of the reeds like he owns the river.'); await fadeIn(800);
    const r = await Battle.start({ enemies: ['reg_captain', 'guard_r', 'acolyte'].map(k => k === 'guard_r' ? 'bandit' : k), allies: ['dace'], noFlee: true, bd: 'town', intro: 'The Registry escort turns on you!' });
    if (r === 'lose') { await Story.defeat(); return; }
    await narr('The captain is on his knees on the bridge. Dace has the green ribbon wrapped around his fist.');
    await say('dace', 'anger', "Forty-one signatures, {name}.");
    const k = await ask('me', 'anger', '…', ["And he'll live to remember who let him.", "Then let the kids decide."]);
    if (k === 1) { await narr('The smallest of the three children — a boy called Teo — looks at the captain for a long time. Then he spits on his boots and walks away.'); await say('dace', 'sad', "…Kid's got better aim than me. Fine."); }
    else await say('dace', 'neutral', "Tch. Kairo's going to say I went soft. …I'm going to tell him you made me.");
    await say('wren', 'happy', "Three out, nobody dead, and the whole village watching from their windows. Kairo's going to HATE how good this looks.");
    f.ge1 = 'help'; f.geTrust = (f.geTrust || 0) + 1; Opinion.add('hope', 1); G.S.gold += 40; Story.gainXp(40); sfx('coin');
    Intel.add('ge', 'Green Eclipse and you freed three Drag children from a Registry wagon on the Millbrook bridge. Nobody died.');
  } else if (c === 1) {
    await say('dace', 'neutral', "Suit yourself. Watch from the inn, then. Bring snacks.");
    await fadeOut(800); await narr('At dusk you hear it from the Drowned Duck: hooves, a scream, the crack of a cage lock.'); await narr('In the morning the children are gone, free — and the Registry captain hangs from the Hound\'s bridge with a green ribbon tied around his neck.'); await fadeIn(800);
    await narr('Mothers walk their children the long way round, past the ferry. Nobody will cut him down.');
    f.ge1 = 'ignore'; Opinion.add('fear', 2);
    Intel.add('ge', 'Green Eclipse freed three Drag children at Millbrook — and hanged the Registry captain from the bridge.');
  } else {
    await say('dace', 'anger', "…Stop us? You'd stand between Drag kids and a cage to save the man who LOCKED it?");
    await me('anger', "I'll free them myself. Nobody hangs. Not tonight.");
    await say('wren', 'neutral', "Dace. Let him try. Kairo will want to hear how it went either way.");
    const r = await Battle.start({ enemies: ['ge_dace_r', 'ge_wren_r'], noFlee: true, boss: true, bd: 'town', intro: 'RIVALS — Dace & Wren of Green Eclipse' });
    Story.heal(true);
    if (r === 'win') {
      await say('dace', 'shock', "…Ow. OW. Kairo was right, you fight like the old man in the stories.");
      await narr('That night you open the cage yourself while the escort sleeps off their wine. Three children, one Registry seal broken. Nobody hangs.');
      await narr('In the morning, half of Millbrook saw a hooded stranger carry two sleeping children across the bridge. Nobody calls the guard.');
      await say('wren', 'happy', "(from somewhere in the reeds) …Show-off.");
      f.ge1 = 'stop'; f.geTrust = (f.geTrust || 0) - 1; Opinion.add('hope', 2); Story.gainXp(50);
      Intel.add('you', 'You stopped Green Eclipse\'s hanging at Millbrook and freed the children yourself.');
    } else {
      await say('dace', 'neutral', "Stay down, brother. We'll do it our way.");
      await narr('In the morning the children are gone — and the captain hangs from the bridge.');
      f.ge1 = 'ignore'; f.ge1lost = true; Opinion.add('fear', 2);
    }
  }
  World.remove('dace'); World.remove('wren');
}
async function talkDunstan() {
  const f = F();
  if (await hoodGasp('dunstan', "Green eyes. Huh. My grandmother's mill was built by a Drag, you know. Best wheel in the vale. Shame what they did to him.") && !f.sqWheel) { }
  if (!f.sqWheel) {
    await say('dunstan', 'anger', "Mudlurkers! River-rats the size of dogs, chewing the paddles off my wheel. The mill-race is up the river path, by the bank.");
    const c = await ask('dunstan', 'neutral', 'Clear them out and there\'s thirty-five gold in it.', ['I\'ll do it.', 'Not now.']);
    if (c === 0) { f.sqWheel = 'on'; toast('Errand: <b>The Miller\'s Wheel</b> — clear the river-rats at the mill-race (north bank).', 3000); }
    return;
  }
  if (f.sqWheel === 'on') { await say('dunstan', 'neutral', 'The mill-race. North along the bank, just this side of the river. You\'ll hear the chewing.'); return; }
  if (f.sqWheel === 'won') {
    f.sqWheel = 'done'; G.S.gold += 35; Story.gainXp(30); sfx('coin'); UI.hud();
    await say('dunstan', 'happy', "The wheel's turning! Listen to that! Thirty-five gold, as promised.");
    await say('dunstan', 'neutral', "Funny thing. The old Drag who built it carved a little dragon under the axle, where nobody'd see. My grandmother said it was for luck. I never scraped it off.");
    return;
  }
  await say('dunstan', 'happy', pick(['Flour, flour, flour. Lovely flour.', 'That Drag-built wheel will outlast the Empire, you mark me.']));
}
async function millWheel() {
  const f = F();
  if (f.sqWheel !== 'on') { await narr('The mill-race. Water shoves at an old wooden wheel, and the wheel shoves back.'); return; }
  await narr('Chewing. Hissing. Three river-rats the size of dogs are gnawing on the paddles.');
  const r = await Battle.start({ enemies: ['m_ratfolk', 'm_ratfolk', 'm_ratfolk'], bd: 'forest', intro: 'Mudlurkers!' });
  if (r === 'lose') { await Story.defeat(); return; }
  if (r === 'win') { f.sqWheel = 'won'; await narr('The wheel groans, shudders… and turns. Under the axle, someone long ago carved a tiny dragon.'); }
}
async function talkFen() {
  const f = F();
  if (!f.sqHerb) {
    await say('fen', 'neutral', "Fen. Herbalist. Elf, yes — two hundred and six, before you ask. Humans always ask.");
    await say('fen', 'sad', "Moonpetal used to grow along this river. Drag healers planted it. When the Drags went, the moonpetal went with them. Now it only grows in the East Woods, near that old stone.");
    const c = await ask('fen', 'neutral', 'Bring me two blossoms and I\'ll trade you two ethers.', ['I\'ll find some.', 'Maybe later.']);
    if (c === 0) { f.sqHerb = 'on'; toast('Errand: <b>Moonpetal for Fen</b> — 2 Moonpetal (glows blue in the East Woods grass).', 3000); }
    return;
  }
  if (f.sqHerb === 'on') {
    if (Quests.has('moonpetal') >= 2) {
      G.S.qitems.moonpetal -= 2; G.S.items.ether += 2; f.sqHerb = 'done'; Story.gainXp(30); sfx('heal');
      await say('fen', 'happy', "Oh — they're perfect. Still glowing. Two ethers, as promised.");
      await say('fen', 'neutral', "Do you know why moonpetal glows? The Drag healers used to say it drinks the same light that's in their eyes. …Old superstition. Probably.");
      await narr('She looks at your hood a little longer than she needs to.');
    } else await say('fen', 'neutral', `Two moonpetal. You have ${Quests.has('moonpetal')}. East Woods, near the old stone, glowing blue in the grass.`);
    return;
  }
  await say('fen', 'neutral', pick(["Tea? It's chamomile. Probably.", "Elves remember when the vale was full of Drag healers. Humans remember it as 'the bad old days.' Funny how that works."]));
}
async function talkAud() {
  const f = F();
  if (f.sqBelfry === 'maren' || f.sqBelfry === 'lark') { await say('aud', 'neutral', 'Go on. She trusts you. The chapel bell will ring for you both.'); return; }
  if (!G.S.hood) {
    await say('aud', 'shock', "…Green. Oh, thank the Seven. Thank the real Seven.");
    await say('aud', 'sad', "There's a little girl hiding in my belfry. Mina. Green eyes, like yours. Her parents went into the river when the Registry came. She's been ringing my bell at night so I'd know she's alive.");
    await say('aud', 'neutral', "I can't keep her. Not with the Registry crossing the bridge every week. Will you take her somewhere safe?");
    const c = await ask('aud', 'neutral', 'Where will you take her?', ["To Maren, the healer in Ashford.", "To Green Eclipse — the girl in the green scarf by the landing.", "I can't. Not yet."]);
    if (c === 0) { f.sqBelfry = 'maren'; toast('Errand: <b>The Girl in the Belfry</b> — bring Mina to Maren in Ashford.', 3000); }
    else if (c === 1) { f.sqBelfry = 'lark'; toast('Errand: <b>The Girl in the Belfry</b> — bring Mina to Lark at the Millbrook landing.', 3000); }
    if (c < 2) { await narr('A small face peeks out of the bell-tower. Green eyes, red from crying. She takes your hand and doesn\'t let go.'); await say('mina', null, '"…Are you a Drag too? You don\'t LOOK scary."'); }
    return;
  }
  await say('aud', 'neutral', pick(["Bless you, traveler. The bell rings for the drowned on the hour. Sometimes… it rings on its own.", "The Seven chained the dragon, the priests say. I've read older books than the priests have. Hush now.", "If you ever have nothing to hide, child, come and show me your face."]));
}

/* ================= KETTLEBROOK ================= */
const KB_LINES = () => { const f = F(), L = ['Harvest\'s in. What\'s left of it.', 'Inquisition seal on OUR granary.', 'Stone tax went up again.', 'Mind the gourds, they bite now.', 'Pell\'s rolls are the best in the vale.'];
  if (f.ge2 === 'ignore' || f.ge2lost) L.push('Burned. All of it. Ours too.', "We'll be eating bark by midwinter."); if (f.ge2 === 'stop') L.push('A Drag stood in front of our granary!', 'The hooded one saved our winter!'); if (f.ge2 === 'help') L.push('They carried our sacks out first. Rebels. Carrying sacks.'); return L; };
SCENES.kettlebrook = {
  title: 'Kettlebrook', subtitle: 'Wheat village on the grain road', music: 'town', bd: 'field',
  crowd: { count: 15, areas: [[17, 13, 30, 19], [4, 16, 16, 17], [31, 16, 44, 17], [20, 23, 34, 28]], talk: e => townTalk(e, KB_TALK), lines: KB_LINES },
  npcs() {
    const f = F(), L = [];
    L.push(vnpc('kettlebrook', 'hollis', 20, 12, talkHollis, { qm: () => !f.hollisTalk ? '!' : null }));
    L.push(vnpc('kettlebrook', 'orla', 14, 23, talkOrla, { qm: () => !f.sqGourd ? '!' : f.sqGourd === 'won' ? '?' : null }));
    L.push(vnpc('kettlebrook', 'pell', 29, 23, talkPell, { qm: () => !f.sqFlour ? '!' : null }));
    if (!f.ge2) L.push(vnpc('kettlebrook', 'ivo', 35, 22, talkIvo, { sprite: 'acolyte' }));
    L.push(vnpc('kettlebrook', 'kbkid', 24, 26, async () => say('kbkid', null, pick(["I'm gonna be a Guild adventurer! E-rank! Then D-rank! Then— what comes after D?", "The gourds in Widow Orla's field have FACES now.", F().ge2 === 'stop' ? "My da says a Drag saved our winter. I want green eyes. Can I get green eyes?" : "Don't go near the granary. The priest-man shouts."])), { sprite: 'kid17', ai: 'wander', area: [20, 23, 30, 28] }));
    if (!f.ge2 && f.lead >= 2) {
      L.push(vnpc('kettlebrook', 'tamsin', 41, 26, () => geGranary(), { sprite: 'tamsin', ai: 'turn', turns: ['left', 'down'], qm: () => '!', witness: 0 }));
      L.push(vnpc('kettlebrook', 'corran', 42, 27, () => geGranary(), { sprite: 'ge_corran', witness: 0 }));
      L.push(vnpc('kettlebrook', 'bo', 40, 27, () => geGranary(), { sprite: 'bo', witness: 0 }));
    }
    return L;
  },
  exits: [{ x: 22, x2: 25, y: 0, to: 'ashford', tx: 29, ty: 39, dir: 'up' }],
  tiles: {
    '36,20': async () => narr(F().ge2 === 'ignore' || F().ge2lost ? 'Black beams and the smell of burned bread. There was a winter in here.' : F().ge2 === 'help' ? 'The granary. Half of it scorched — the Inquisition half. The village half is stacked safe in the reeve\'s barn.' : 'The granary doors are nailed shut. A white wax seal: PROPERTY OF THE EMBER INQUISITION.'),
    '8,26': () => orlaField(), '9,26': () => orlaField(), '7,26': () => orlaField()
  },
  async onEnter() {
    const f = F(); f.kbVisited = true;
    if (!f.kbIn) {
      f.kbIn = true;
      await narr('Kettlebrook. Wheat to the horizon, and a white Inquisition seal nailed across the granary doors.');
      await narr('A farmer gallops past toward the square, shouting.');
      await say('kbkid', null, '"Green Eclipse burned the toll-house on the Ashen road last night! The rebel with the burned face — they say he made the toll-men KNEEL in the river!"');
      await narr("Doors bang shut all along the street. Kairo hasn't even reached Kettlebrook, and Kettlebrook is already afraid of him.");
      Opinion.add('fear', 1); Intel.add('ge', 'Kairo burned a Hound toll-house on the Ashen road and made the toll-men kneel. The vale is talking.');
      if (f.lead === 2) Story.quest("Kettlebrook: find out where the Inquisition's grain is being sent. The granary (east) is sealed; the reeve may know who keeps its books.");
    }
  }
};
const KB_TALK = () => G.S.hood ? ['"Mind the cart, stranger."', '"The Sheaf & Sickle has a dwarf for a barkeep. Best ale south of the river."', '"Inquisition took our granary. Took it! For \'the holy work.\'"', '"Reeve Hollis won\'t stand up to them. Can\'t blame him. Can blame him a bit."', F().ge2 === 'ignore' ? '"Rebels burned it all. Ours too. Drags."' : '"Harvest was good. For all the good it does us."']
  : ['"Green— green eyes! Ma! MA!"', '"Get out of our village!"', F().ge2 === 'stop' ? '"…You\'re the one who stood in front of the granary. I— thank you."' : '"Are you with the rebels? Leave our grain alone!"', '"Gods. Please don\'t hurt anyone."'];
async function talkHollis() {
  const f = F();
  if (await hoodGasp('hollis', "Green— Seven help me. Please. Whatever you want, this village can't afford to give it.")) return;
  if (!f.hollisTalk) {
    f.hollisTalk = true;
    await say('hollis', 'sad', "Reeve Hollis. I keep the village ledger. What's left of it.");
    await say('hollis', 'anger', "The Ember Inquisition seized our granary in spring — 'for the holy work.' Half the grain in there is OURS. Our winter.");
    await say('hollis', 'neutral', "Their clerk, Ivo, keeps the books. Every sack in, every sack out, signed and sealed. He'd sooner eat the ledger than show it to you.");
    await say('hollis', 'shame', "And the rebels have been sniffing round it too. A big redheaded girl, an old soldier, and a lad who ate three of Pell's pies without paying.");
    await say('hollis', 'neutral', "Oh — and the Crown pays a 'stone tax' now. One green pebble per household per season, or silver in place of it. Who taxes PEBBLES? …Don't answer that. I don't want to know.");
    f.valeLore = true;
    if (f.lead >= 2) Story.quest('The granary manifest will say where the grain goes. Clerk Ivo guards it — and Green Eclipse is camped east of the granary.');
    return;
  }
  await say('hollis', 'neutral', pick(["Ledger says we're short. Ledger always says we're short.", "If the Inquisition and the rebels want to fight over my granary, I wish they'd do it somewhere else.", F().ge2 === 'stop' ? "You saved our winter. I wrote it in the ledger. In ink. I never write anything in ink." : "Pell's flour, Orla's gourds, the Crown's pebbles. That's Kettlebrook."]));
}
async function talkIvo() {
  const f = F();
  if (!G.S.hood) { await say('ivo', 'shock', "A Drag! At the holy stores! Brothers— brothers?! …Oh, I'm alone. I'm going to stand very still and you're going to walk away."); return; }
  const c = await ask('ivo', 'neutral', "Inquisition stores. By order of Inquisitor Halvard. Move along.", ["Where's the grain going?", "[Lie] Halvard sent me for the manifest.", "Leave."]);
  if (c === 0) await say('ivo', 'anger', "Where it is NEEDED. To the holy work. Begone.");
  else if (c === 1) await say('ivo', 'happy', "Did he? How odd. The Inquisitor writes his own orders, sealed in white wax, and he has never once in thirty years 'sent someone.' …Begone.");
}
async function geGranary() {
  const f = F(); if (f.ge2) return;
  if (!f.geKBmet) {
    f.geKBmet = true;
    await say('tamsin', 'neutral', "…{name}. Lark said you'd show up. She said you'd be slow. You were slow.");
    await say('bo', 'happy', "{name}! Hi! Pie? I have pie. Pell's pie. I paid for this one. Mostly.");
    await say('corran', 'neutral', "Five years. You've got the old man's way of standing. Heels light. Hand never far from the hilt.");
  }
  await say('tamsin', 'neutral', "Tonight we burn Halvard's granary. Every sack. Kairo wants his supply line cut before Greyspire.");
  await say('tamsin', 'neutral', "Lark goes in first for the ledger. Kairo wants to know where that grain's going as much as you do. Don't flatter yourself — it's a race.");
  await me('anger', "Half that grain is Kettlebrook's winter, Tamsin.");
  await say('tamsin', 'anger', "Then Kettlebrook shouldn't have let the Inquisition nail a seal on its door.");
  await say('corran', 'sad', "Tam.");
  await say('bo', 'neutral', "She's only like this because Kairo said 'good work, Tam' last spring and she's been trying to make him say it again ever since.");
  await say('tamsin', 'blush', "BO.");
  await say('bo', 'happy', "He didn't even look up from his map when he said it. She still talks about it.");
  await say('tamsin', 'anger', "Bo, I swear on every star in the sky—");
  await say('corran', 'neutral', "…Everyone sees it but him, kid. Don't bring it up.");
  if (!f.corranRules) { f.corranRules = true; f.coupHint = (f.coupHint || 0) + 1; await say('corran', 'sad', "And before you ask what this is all FOR — I don't know the whole of it either. Kairo's building toward something bigger than cages. Something aimed at the Crown itself."); await say('corran', 'neutral', "But he has rules. Cages first. Never a child. Never someone who's already on their knees. I've seen him break his own arm before he'd break one of those."); }
  await say('corran', 'neutral', "Now — are you in?");
  const c = await ask('tamsin', 'neutral', "In, out, or in my way?", ["In — but the village grain comes out first.", "It's your fight. (Ignore it.)", "You're not burning their winter. I'll stop you."]);
  if (c === 0) {
    await say('tamsin', 'anger', "…Fine. FINE. Bo, you're carrying sacks. Don't eat them.");
    await fadeOut(800); await narr('Midnight. You and Bo haul the village\'s sacks out the back, one by one, to the reeve\'s barn. Bo only drops one. He only eats a little of it.'); await fadeIn(800);
    await narr('A bell clangs. Clerk Ivo and two acolytes come running with torches.');
    const r = await Battle.start({ enemies: ['inq_clerk', 'acolyte', 'acolyte'], allies: ['tamsin'], noFlee: true, bd: 'field', intro: 'Clerk Ivo raises the alarm!' });
    if (r === 'lose') { await Story.defeat(); return; }
    await narr("Only the Inquisition's half burns. The flames are green at the edges where Tamsin touches them.");
    await narr('Lark drops out of the rafters with the ledger in her teeth. She reads it. You read it over her shoulder. Neither of you says anything for a moment.');
    f.ge2 = 'help'; f.geTrust = (f.geTrust || 0) + 1; Opinion.add('hope', 1); Opinion.add('fear', 1); Story.gainXp(45);
    await say('tamsin', 'neutral', "…Not bad. I'll tell Kairo you carried sacks. He'll think that's hilarious.");
    await say('tamsin', 'sad', "(…He'll laugh at that. He never laughs at anything I tell him.)");
  } else if (c === 1) {
    await say('tamsin', 'neutral', "Your loss. Watch the sky tonight.");
    await fadeOut(800); await narr('At midnight the whole east end of Kettlebrook lights up green and orange. By dawn the granary is a black skeleton. Inquisition grain — and the village\'s winter with it.'); await fadeIn(800);
    await narr('At the north road, Lark is waiting, swinging her legs on a fence.');
    await say('larkMB', 'happy', "Kairo said to let you have a copy. Says it's no fun racing someone who can't find the track.");
    f.ge2 = 'ignore'; Opinion.add('fear', 2); f.kbHungry = true;
  } else {
    await say('tamsin', 'anger', "…You'd fight us. For a granary with a white seal on it.");
    await me('anger', "For the families who'd starve when you burn it.");
    await say('tamsin', 'anger', "You don't get to walk back in after five years and decide what Kairo needs!");
    const r = await Battle.start({ enemies: ['ge_tamsin_r', 'ge_corran_r'], noFlee: true, boss: true, bd: 'field', intro: 'RIVALS — Tamsin & Corran of Green Eclipse' });
    Story.heal(true);
    if (r === 'win') {
      await say('tamsin', 'shock', "…Tch. You hit like Kairo. You even MOVE like— never mind.");
      await say('corran', 'neutral', "Enough, Tam. The kid's not wrong, and you know it. Let's go.");
      await narr('As they leave, Corran flicks a folded page at your feet without looking back.');
      await say('corran', 'neutral', "Lark copies everything twice. Kairo'd want it a fair race. He'd never say so.");
      f.ge2 = 'stop'; f.geTrust = (f.geTrust || 0) - 1; Opinion.add('hope', 2); f.granaryStands = true; Story.gainXp(55);
      await narr("Kettlebrook keeps its winter. And somewhere north, an Inquisition storehouse stays full — Halvard's people will be fed and rested when you come.");
    } else {
      await say('tamsin', 'neutral', "Stay down. I'm doing this for him, not to you.");
      await narr('The granary burns. In the morning, Lark leaves a copy of the ledger pinned to the north road signpost with one of Bo\'s pie forks.');
      f.ge2 = 'ignore'; f.ge2lost = true; Opinion.add('fear', 2); f.kbHungry = true;
    }
  }
  await narr('The granary manifest, in a cramped holy hand:');
  await narr('"FORTY MEASURES — by order of Inquisitor Halvard — to the OLD MILL, north road above Ashford Hollow. For the keeping of the vessels until the Citadel sends for them."');
  await me('anger', '…"Vessels." The children. They\'re at the Old Mill. North of Ashford — right behind Voss\'s gate.');
  f.learnedMill = true; f.lead = 3; sfx('level');
  Intel.add('you', 'The granary manifest: forty measures of grain to the OLD MILL, north of Ashford, "for the keeping of the vessels." The children are there.');
  Intel.add('ge', 'Green Eclipse read the same manifest. Kairo knows about the Old Mill too. It\'s a race now.');
  Story.quest(f.kessWait ? 'The cages are at the Old Mill, north of Ashford. Go back to Kess — she promised to get you past Captain Voss.' : 'The cages are at the Old Mill, north of Ashford. Get past Captain Voss on the north road.');
  ['tamsin', 'corran', 'bo', 'ivo'].forEach(id => World.remove(id));
}
async function talkOrla() {
  const f = F();
  if (!f.sqGourd) {
    await say('orla', 'sad', "Forty years I've grown gourds in that field. Forty years. And this autumn they got up and started BITING.");
    const c = await ask('orla', 'neutral', 'Chase them out of my field, dear? I\'ll bake you something.', ['Of course.', 'Later.']);
    if (c === 0) { f.sqGourd = 'on'; toast('Errand: <b>Widow Orla\'s Gourds</b> — clear her field (south-west).', 3000); }
    return;
  }
  if (f.sqGourd === 'won') {
    f.sqGourd = 'done'; G.S.items.tonic += 2; Story.gainXp(30); sfx('heal');
    await say('orla', 'happy', "Oh, bless you. Here — two tonics, and a whole gourd pie. The good kind. The kind that doesn't bite back.");
    await say('orla', 'neutral', "My late husband said the gourds woke up the year the Crown started digging up the tomb-mountains. Said everything's restless when the mountains are. Silly old man.");
    await say('orla', 'sad', "…He was usually right, though.");
    return;
  }
  await say('orla', 'neutral', f.sqGourd === 'on' ? "South-west field. You'll know them by the teeth." : pick(["Pie's cooling, dear.", "Mind you eat. You look like a scarecrow with ambitions."]));
}
async function orlaField() {
  const f = F();
  if (f.sqGourd !== 'on') { await narr(f.sqGourd === 'won' || f.sqGourd === 'done' ? 'A peaceful gourd field. Nothing here has teeth anymore.' : "Widow Orla's gourd field. One of the gourds is… watching you."); return; }
  const r = await Battle.start({ enemies: ['m_gourd', 'm_gourd', 'm_gourd'], bd: 'field', intro: 'The gourds wake up!' });
  if (r === 'lose') { await Story.defeat(); return; }
  if (r === 'win') f.sqGourd = 'won';
}
async function talkPell() {
  const f = F();
  if (!f.sqFlour) {
    await say('pell', 'happy', "Pell! Baker! Dwarf! In that order. My flour's the best south of the river, and Bram at the Crooked Lantern in Ashford owes me for a sack.");
    const c = await ask('pell', 'neutral', 'Carry this sack to Bram and collect, will you? Thirty gold in it for you.', ['Sure.', 'No thanks.']);
    if (c === 0) { f.sqFlour = 'on'; toast('Errand: <b>Pell\'s Flour</b> — deliver the sack to Bram (Crooked Lantern, Ashford).', 3000); }
    return;
  }
  if (f.sqFlour === 'done' && !f.sqFlourPaid) { f.sqFlourPaid = true; G.S.gold += 30; sfx('coin'); UI.hud(); await say('pell', 'happy', "He PAID? Bram paid? Here — thirty gold. I'm going to tell everyone. This is a historic day."); return; }
  await say('pell', 'neutral', pick(["Dwarves don't bake much magic into bread. Just butter. Butter IS magic.", "My cousin's a rune-smith in the Guild. Borrik. Famous now. Still can't bake.", "The Crown's buying green pebbles. Next they'll be buying crumbs."]));
}

/* ================= TAVERNS & GOSSIP ================= */
const TAVERNS = {
  ashford: { name: 'The Crooked Lantern', keep: 'bram_in', pat: [['Old Soldier', 'folk11', 'soldier'], ['Bargewoman', 'folk5', 'bargewoman'], ['Farmhand', 'folk13', 'farmhand']] },
  millbrook: { name: 'The Drowned Duck', keep: 'marta', pat: [['Fisherman', 'folk2', 'fisherman'], ['Ferry Clerk', 'folk7', 'fclerk'], ['Retired Adventurer', 'dwarf_m1', 'oldadv']] },
  kettlebrook: { name: 'The Sheaf & Sickle', keep: 'gunna', pat: [['Plowman', 'folk10', 'plowman'], ['Grain Wife', 'folk15', 'grainwife'], ['Tinker', 'elf_m1', 'tinker']] }
};
const GOSSIP = {
  strong: { label: 'Who is the strongest?', talks: [
    [['A', 'Dread. End of argument.'], ['B', "Dread's a general, not a god. The Headmaster rang her bell once and a whole Imperial legion lay down in the mud."], ['A', "Lay down. Didn't die. Dread doesn't do 'lay down.'"], ['C', "My cousin's a bell-warden. Says the Headmaster and Dread have never once been in the same city. On purpose. Both sides."]],
    [['B', 'Strongest of the Eight? Grimtusk. Tore a drawbridge off its chains with his hands.'], ['A', 'Strongest, maybe. Scariest is Old Gallows. Grimtusk keeps his word. Gallows keeps your ears.'], ['C', 'Mother Brine sank three Imperial warships in one night. Then she sent the admiral a thank-you note for the timber.']],
    [['C', 'Sword Saint, if you ask anyone over sixty. Forty years, never lost a duel. Then Dread.'], ['A', 'Four strokes. He lasted FOUR strokes against Dread. Nobody else ever lasted one.'], ['B', "Dead now, they say. Walked into the frozen forest and never came out."], ['me', "(…He came out. He just doesn't like visitors.)"]],
    [['A', "The Guild's new one — Cael Ardent. SSS at seventeen. They say his halberd drinks Drag-fire like water."], ['B', 'Good. Somebody ought to.'], ['C', "…Bit young to hate that much, isn't he?"], ['me', '(Cael Ardent. Remember that name.)']],
    [['B', "Elves live four hundred years, and the strongest one's a clerk?"], ['C', "Sereth Vael isn't a clerk. She runs the Registry. Every stone in the Empire goes through her hands — and every hand goes through her ledger."], ['A', "Strongest isn't always the one who hits hardest. Sometimes it's the one who knows where you sleep."]]
  ] },
  eight: { label: 'The Eight Bandit Kings', talks: [
    [['A', "Gilded Hound doubled the toll on the Ashen bridges. Says it's for road upkeep. The roads are MUD."], ['B', "He did pay for the bridge at Millbrook, though. With his own coin. Charges us to cross it, but he paid for it."], ['C', "Varro Kade's the only bandit king who sends flowers to the widows of men he robs. Can't decide if that's sweet or terrifying."]],
    [['B', 'King Ash freed a whole quarry-camp in Cinderfall last month. Dwarves, humans, Drags — never asked which.'], ['A', 'Burned the overseers in their beds, too.'], ['B', "…Didn't say he was nice. Said he freed them."]],
    [['C', "The Hollow Saint's choir came through the Dustveil caravans singing about waking the dragon. My brother quit the caravans that week."], ['A', "THAT'S why folk hate Drags. Lunatics like him."], ['B', "Funny. Every Drag I ever met hated him worse than you do."]],
    [['A', 'The Velvet Knife bought a whole street in the Greyspire undercity. Paid for it with one secret.'], ['C', 'Whose secret?'], ['A', 'Nobody knows. Everyone who asked got a very polite letter. Then they stopped asking.']],
    [['B', 'The Thornwall twins tried to kill each other again. Sorrel shot Sable, Sable shot back.'], ['C', 'And?'], ['B', 'Then they both shot the tax collector and called it a truce.']],
    [['C', "Grimtusk's daughter Kesra rode into a Guild hall up north and challenged Ursa Halfmoon — the Third of the Seven."], ['A', 'And Kesra won?'], ['C', "Ursa wouldn't fight her. Took one look at the girl, went white, and said she doesn't raise her hand to family. Nobody knows what she meant."]]
  ] },
  seven: { label: 'The Seven of the Guild', talks: [
    [['A', 'Gideon Varga held the Saltgate for nine days with forty men. The Iron Vow never breaks a promise.'], ['C', 'Heard he shares a bottle with King Ash once a year, on the Cinderfall border.'], ['A', "Slander. …Which tavern'd you hear that in?"]],
    [['B', 'Odo Pennywhistle won his SSS card in a card game.'], ['C', "You can't WIN an SSS card."], ['B', 'Tell Odo.']],
    [['C', "Ilvaine the Silent Bow shot a hawk out of the sky at a mile. Hawk was carrying a letter. The letter was to her sister."], ['A', "Her sister?"], ['C', "The Velvet Knife. Keep your voice DOWN."]],
    [['A', "Cael Ardent's the Sixth now. Twenty. Never lost a duel."], ['B', "They say he keeps a list of every Drag he's fought. They say it's a short list — because there aren't many left to fight."], ['me', "(…Then he hasn't met Kairo yet.)"]],
    [['B', 'Borrik Flintmantle carved a rune into a mountain and the mountain apologized.'], ['A', "Mountains don't apologize."], ['B', 'This one did. Little avalanche. Very polite.']],
    [['C', 'Mara Quickwater took a whole pirate ship single-handed. Then she gave it back.'], ['A', 'Why?'], ['C', 'Said it belonged to her mother. Mother Brine calls every pirate "child," so who knows which mother she meant.']],
    [['A', "Not one of the Seven's ever been a Drag. Not in the whole history of the Guild."], ['B', 'Course not.'], ['C', '…Why "of course"? The Guild takes anyone.'], ['B', '…Huh. I don\'t actually know.']]
  ] },
  generals: { label: 'The Generals & the Four Pillars', talks: [
    [['A', "Caspian Thorne, the First Pillar — they say he was the Sword Saint's own student before he sold the old man to the Crown."], ['B', 'Sold? He was PROMOTED.'], ['A', 'Same thing, in Aurel.']],
    [['B', "Ysolde Marr, the Lantern. Kindest voice you ever heard. Blessed a whole village once — right before the Inquisition burned it."], ['C', "Halvard answers to her, doesn't he? The priest with the cages."], ['A', "Everyone with a cage answers to her, eventually."]],
    [['C', "Gorran Ironvein's quarry-camps eat a valley a month up in the tomb-mountains."], ['A', "My nephew works the camps. Says the stones hum louder the deeper they dig."], ['A', '…Says at night they hum in TUNE. Like something underneath is counting.']],
    [['A', "Sereth Vael, the Quiet Tide. Elf spymaster. Nobody's ever seen her angry."], ['B', "My sister-in-law scrubbed floors at the Registry in Aurel. Said there's a door on the bottom floor with no handle."], ['B', '…Said she heard children singing behind it.'], ['C', "Why do you always tell these right before I walk home in the dark?"]]
  ] },
  dread: { label: 'Rumors about Dread', talks: [
    [['A', "Dread rode through Ashford last month. Didn't stop, didn't look. Every dog in town hid under a bed for three days."], ['B', "My horse still won't eat."]],
    [['B', "They say he doesn't sleep. They say the armor IS him. Nothing inside but a green light."], ['C', "Don't."], ['B', '…A green light that hums.'], ['C', "I said DON'T."]],
    [['C', 'Old soldier told me: at the siege of Varrow he walked through two hundred arrows. Not ducking. Walking.'], ['A', 'Armor that good?'], ['C', 'No. The arrows just… stopped wanting to hit him.']],
    [['A', "His sword's called Gravecleaver. Longer than a man. Every life it takes, the blade gets heavier — and he's never once let the tip touch the ground."]],
    [['B', "Know what's scarier than Dread? Somebody named him. Somebody's mother sang to him once."], ['C', '…Why would you SAY that. Why would you say that before bed.']],
    [['C', 'They say his eyes are green.'], ['A', 'Who says?'], ['C', 'People who got close enough to see. …So, nobody living.']]
  ] },
  royals: { label: 'The Emperor & the royal family', talks: [
    [['A', "Emperor Lucan's thirty and still no empress. My wife says he's married to the map."], ['B', "He's got a map of the whole continent painted on his ceiling. Every bandit king's land painted gold. Like he's already bought it."]],
    [['B', "The Dowager Empress Helene hasn't left the palace in eleven years. They say she talks to the old emperor's portrait."], ['C', 'And?'], ['B', 'They say it answers. In a voice nobody recognizes.']],
    [['C', "Prince Corin — the emperor's little brother — ran off to join the Guild under a false name. Made it to D-rank before they caught him."], ['A', 'Good for him!'], ['C', 'They burned his Guild card in front of him in the throne room. He was fourteen. Hasn\'t smiled in public since.']],
    [['A', "The Aurels claim they're descended from the First Sun — the hero-king who 'founded the Empire on the Cataclysm's ashes.'"], ['B', 'No portrait of him. No tomb. No bones.'], ['C', "Funny, losing a whole hero-king."], ['A', "Funnier, making it a hanging crime to look for a lost city of gold. Why's a Crown afraid of treasure?"]],
    [['B', "The Crown's buying up every green pebble in the vale. Surveyors with carts and scales."], ['A', "What's a king want with pebbles?"], ['C', "What's any king want? More. Always more. The old songs say the gold king wanted the whole sky."]]
  ] },
  eclipse: { label: 'Green Eclipse', talks: [
    [['A', "Green Eclipse. Twenty of 'em, they say. Thirty by winter. All green eyes, all in black and green, like a proper army."], ['B', "Proper army doesn't paint smiles on wanted posters."], ['C', "…This one does."]],
    [['B', "They say the burned-face one — Kairo — isn't after cages at all. Not really. They say he's after AUREL."], ['A', "The capital? With thirty Drags? He's mad."], ['C', "Or he knows something we don't."]],
    [['C', "My cousin was on a wagon they hit. Says the rebels wouldn't touch the children, wouldn't touch the ones who knelt. Only the ones with keys."], ['A', "Rebels with RULES. That's the scary kind."]],
    [['A', "Notices went up in Aurel: one thousand gold for the burned-face Drag. ONE THOUSAND."], ['B', "Last year it was fifty."], ['C', "Means the Crown's afraid of something he's planning. Crowns don't pay a thousand for a wagon-burner."]],
    [['B', "Ever notice the girl with the orange hair — the one who's always one step behind him? Looks at him like he hung the moon."], ['C', 'And him?'], ['B', 'He looks at maps.']]
  ] },
  drags: { label: 'Drags', talks: [
    [['A', "Drags are Fratenaptor's spawn. Their blood remembers the dragon. Ask any priest."], ['B', "Ask any priest and he'll tell you to pay the priest."]],
    [['B', 'Before the purges there was a Drag smith in Ashford. Best hinges in the vale.'], ['C', 'And then?'], ['B', "And then there weren't any hinges."]],
    { need: f => f.ge1 === 'help' || f.ge1 === 'stop', lines: [['C', "Heard a hooded Drag pulled children off a Registry wagon at Millbrook — and didn't kill a single guard."], ['A', "Didn't KILL? Then what's the point of being a Drag?"], ['B', "…Maybe that IS the point."]] },
    { need: f => f.ge2 === 'stop', lines: [['A', 'A Drag stood in front of the Kettlebrook granary so the rebels couldn\'t burn the village\'s winter. A DRAG did that.'], ['C', 'For us?'], ['A', "For us. Same eyes as the ones on the wanted posters."]] },
    { need: f => f.crateDone, lines: [['B', "Tobb's been telling everyone a hooded stranger brought his stolen crate back. Every bottle. Wouldn't take extra."], ['A', "Tobb tells everyone everything."], ['B', "He also says the stranger had green eyes. And he says it like he's not angry about it."]] },
    { need: f => f.ge1 === 'ignore', lines: [['A', 'Green Eclipse hanged a Registry captain off the Millbrook bridge. Left him for the crows, with a green ribbon.'], ['C', '…He signed the cage orders, they say.'], ['A', "Doesn't matter. Next time it's a baker. Then it's you."]] },
    { need: f => f.ge2 === 'ignore' || f.ge2lost, lines: [['C', "They burned Kettlebrook's whole granary. Inquisition grain AND the village's."], ['B', "We'll be eating bark by midwinter."], ['A', 'That\'s Drags for you.']] },
    { need: f => f.fear >= 1, lines: [['A', "The rebel leader — burned face, green eyes. Kairo, they call him. Wants every human in the vale on their knees."], ['C', 'My cousin saw him at the toll-house. Said he didn\'t shout. Didn\'t even raise his voice. Just said "kneel," and they knelt.'], ['B', "…And the hooded one? The one who keeps HELPING people?"], ['A', 'Same eyes. Same blood. Maybe same plan.']] },
    { need: () => Opinion.hope >= 3 && Opinion.fear >= 3, lines: [['B', 'Two kinds of Drag out there now. One in a hood who saves your children. One with a burned face who makes you kneel.'], ['C', "Problem is you can't tell which one's knocking till you open the door."]] },
    { need: () => Opinion.hope - Opinion.fear >= 2, lines: [['C', "My girl wants to grow up to be 'the hooded one.' Plays it in the yard. Saves the chickens from the Inquisition."], ['A', "…And you let her?"], ['C', 'Hood up, mind. She\'s not stupid.']] }
  ] }
};
const LOCAL = {
  ashford: [[['K', "Bram's ale is watered. I'm Bram. I'm allowed to say it."]], [['A', "Voss used to be a good captain. Now he just stands at that gate like a man waiting for permission to stop."]], [['B', "Maren treats anybody. ANYBODY. Even the ones I won't name in here."], ['C', 'Shh.']], [['C', "They hanged a Drag at that fountain eleven years back. Little girl watched. Nobody in the Hollow talks about it — which is how you know everybody remembers."]]],
  millbrook: [[['K', "I'm Marta. The Duck does fish stew, river ale, and no questions. Two out of three, anyway."]], [['A', "The chapel bell rang by itself again last night. Sister Aud says it's the drowned. My wife says it's a CHILD."]], [['B', "Oswin counts every wagon that crosses the river. Every one. Rumor is he's got ledgers going back forty years. Rumor is someone in Aurel would pay a fortune for them."]], [['C', "Old Dunstan's mill was built by a Drag. Best wheel in the vale. Still turns. Nobody says so out loud."]]],
  kettlebrook: [[['K', "Gunna Stoutbarrel. My ale's dwarf-brewed, my stools are dwarf-height, and if you don't like it, the floor is human-height."]], [['A', "Inquisition took our granary 'for the holy work.' What holy work needs forty measures of barley?"], ['B', "Feeding somebody. A lot of somebodies."]], [['C', "The Crown taxes pebbles now. Green ones. One per house per season. My grandfather says the last time a king hoarded green stones, the sky went gold for a hundred days."], ['A', "Your grandfather says a lot of things."]], [['B', "Orla's gourds have teeth this year. Teeth! Everything's restless since they started digging up the tomb-mountains."]]]
};
async function barSeat(tk) {
  const T = TAVERNS[tk], f = F(); f.gossip = f.gossip || {};
  const ids = ['gpA', 'gpB', 'gpC'];
  T.pat.forEach(([n, s, art], i) => { CHAR[ids[i]] = { name: n, sprite: s }; ART_ID[ids[i]] = art; });
  await narr(`You take a stool at the bar of ${T.name}. ${G.S.hood ? 'Nobody looks twice at a hood in a tavern.' : 'A few people look twice at your eyes. One gets up and leaves. The rest are too deep in their cups to care.'}`);
  const run = async lines => { for (const [s, t] of lines) { if (s === 'me') await me('neutral', t); else if (s === 'K') await say(T.keep, 'neutral', t); else await say('gp' + s, null, t); } };
  while (true) {
    const keys = Object.keys(GOSSIP).concat(['local']);
    const labels = keys.map(k => { const L = k === 'local' ? LOCAL[tk] : GOSSIP[k].talks.filter(e => !e.need || e.need(Object.assign({}, f, { fear: Opinion.fear }))); const seen = (f.gossip[tk + k] || 0); return (seen >= L.length ? '✓ ' : '') + (k === 'local' ? 'Local news' : GOSSIP[k].label); });
    labels.push('Ask what the room thinks of Drags', 'Get up');
    const c = await ask(null, null, 'The bar is loud tonight. You lean in to listen to…', labels);
    if (c < 0 || c === labels.length - 1) return;
    if (c === labels.length - 2) { await roomOnDrags(tk); continue; }
    const k = keys[c];
    const pool = k === 'local' ? LOCAL[tk] : GOSSIP[k].talks.filter(e => !e.need || e.need(Object.assign({}, f, { fear: Opinion.fear }))).map(e => e.lines || e);
    const i = (f.gossip[tk + k] || 0); f.gossip[tk + k] = i + 1;
    await run(pool[i % pool.length]);
    if (k === 'strong' && !f['strongAsk' + tk]) {
      f['strongAsk' + tk] = 1;
      const a = await ask('gpA', null, "And you, stranger? Who's the strongest on this continent?", ['Dread.', 'The Headmaster.', 'The Sword Saint.', "Me. Eventually."]);
      await say('gpB', null, ["Hah! Another one for Dread. Drink up, before he hears you said his name.", "The Bell! Finally someone with taste. To the Headmaster!", "The Sword Saint? You sound like my grandfather. …My grandfather was usually right.", "HA! Listen to this one! …Actually, buy this one a drink. I want to say I knew 'em when."][a]);
      if (a === 3) Opinion.add('hope', 0);
    }
    if (k === 'royals') f.royalsHeard = true;
    if (k === 'seven' || k === 'strong') f.caelHeard = true;
    f.valeLore = true;
  }
}
async function roomOnDrags(tk) {
  const m = Opinion.mood(), f = F();
  await narr(m[1]);
  if (f['dragAsk' + tk]) return;
  f['dragAsk' + tk] = 1;
  const c = await ask('gpC', null, 'What about you, stranger? What do you make of Drags?', ["They're people. Same as you.", "Some are dangerous. So are some humans.", "(Say nothing.)"]);
  if (c === 0) { await say('gpA', null, "…People. Hah. Well. The ones I've met were mostly people. Mostly."); Opinion.add('hope', .5); }
  else if (c === 1) await say('gpB', null, "Fair. I've met a few humans I'd sooner not share a table with. One of them's my brother-in-law.");
  else await say('gpC', null, "Smart. Say nothing, live long. That's the vale's motto.");
}
// barkeepers
async function keepTalk(tk) {
  const T = TAVERNS[tk];
  if (tk !== 'ashford' && !G.S.hood && G.S.sus >= 3) { await say(T.keep, 'anger', "Not tonight, friend. Not with those eyes, not with the whole vale talking."); return; }
  if (tk === 'ashford' && F().sqFlour === 'on') { F().sqFlour = 'done'; await say('bram_in', 'shock', "Pell's flour? …He sent you to COLLECT? Gods. Fine. Fine! Here — tell him I paid. Tell him I paid with a smile."); toast("Bram paid up. Collect from Pell in Kettlebrook.", 2600); }
  const c = await ask(T.keep, 'happy', tk === 'ashford' ? 'Room for the night, or a stool and an ear?' : tk === 'millbrook' ? "Welcome to the Duck. Stew, a bed, or gossip? Gossip's free. Stew isn't." : "Sheaf & Sickle. Ale, bed, or the bar? Mind the stools — dwarf height.", ['Sit at the bar and listen', 'Rest (15g — restores HP & MP, saves)', 'Leave']);
  if (c === 0) await barSeat(tk);
  else if (c === 1) { if (G.S.gold >= 15) { G.S.gold -= 15; await fadeOut(600); Story.heal(true); save(); await fadeIn(600); await narr('You keep your hood on all night. You sleep badly, but you sleep. (Game saved.)'); } else await say(T.keep, 'neutral', 'Coin first, friend.'); }
}
innRest = async function () { CHAR.bram_in = { name: 'Bram', sprite: 'innkeep' }; await keepTalk('ashford'); };
CHAR.marta = { name: 'Marta Reed', sprite: 'folk19' }; CHAR.gunna = { name: 'Gunna Stoutbarrel', sprite: 'dwarf_f1' };
const tavRoom = (key, tk, title) => room(key, 'in_inn', title, { npcs: () => [
  Object.assign(resident(TAVERNS[tk].keep + '_k', CHAR[TAVERNS[tk].keep].sprite, 3, 4, [], { nm: CHAR[TAVERNS[tk].keep].name, ai: null }), { talk: () => keepTalk(tk), qm: () => tk === 'ashford' && F().sqFlour === 'on' ? '?' : null }),
  ...TAVERNS[tk].pat.map(([n, s, art], i) => (ART_ID[key + 'p' + i] = art, resident(key + 'p' + i, s, [2, 9, 12][i], [7, 7, 7][i], () => [GOSSIP[Object.keys(GOSSIP)[(i + G.S.steps) % 7]].talks.map(e => (e.lines || e))[0][0][1].replace(/^/, '"') + '"'], { nm: n, ai: null })))],
  tiles: { '4,4': () => barSeat(tk), '5,4': () => barSeat(tk), '2,4': () => barSeat(tk) } });
tavRoom('mb_tavern', 'millbrook', 'The Drowned Duck'); tavRoom('kb_tavern', 'kettlebrook', 'The Sheaf & Sickle');
SCENES.a_inn.tiles = Object.assign(SCENES.a_inn.tiles || {}, { '4,4': () => barSeat('ashford'), '5,4': () => barSeat('ashford'), '2,4': () => barSeat('ashford') });
// interiors
const VHOME = (k, i) => resident(k, FK(30 + i), 5, 3, [['"Wipe your feet. River mud gets everywhere."', '"My husband\'s on the boats. I\'m on everything else."'], ['"We don\'t get visitors. On purpose."', '"Did the Sister send you? She sends everyone."'], ['"Harvest\'s in. Taxes are in. Nothing left over is in."', '"Pull up a stool. Mind the cat."']][i % 3], { nm: 'Villager' });
room('mb_ferry', 'in_cottage', "Oswin's House", { npcs: () => [], tiles: { '4,2': async () => narr('Shelves of ledgers. Forty years of chalk-marks copied into ink — every wagon, every cart, every horse that ever crossed the Ashen River. One shelf is labelled, in shaky letters: CAGES.') } });
room('mb_miller', 'in_cottage2', "The Miller's House", { npcs: () => [VHOME('mbm1', 0)] });
room('mb_herb', 'in_shop', "Fen's Herbs", { npcs: () => [], tiles: { '5,2': async () => narr('Jars of dried herbs. One label in old Drag script — you recognize Nana\'s alphabet. It says: FOR FEVER IN THE GREEN-EYED. GIVE WITH HONEY.') } });
room('mb_chapel', 'in_nana', 'The Chapel of the Drowned', { npcs: () => [], tiles: Object.fromEntries(['1,2', '2,2', '3,2', '4,2'].map(k => [k, async () => { await narr('A prayer-book for the drowned. Older pages beneath the new ones — the binding has been re-sewn over something.'); await narr('On one old page, seven figures hold chains around a sleeping shape. Someone has written in the margin: "the gold king is the one who should have been chained."'); F().valeLore = true; }])) });
room('mb_home', 'in_cottage', 'A Home', { npcs: () => [VHOME('mbh1', 1)] });
room('kb_reeve', 'in_shop', "The Reeve's House", { npcs: () => [], tiles: { '5,2': async () => narr("Hollis's ledger lies open: STONE TAX — 1 green pebble per household per season. Beside it, in tiny writing: 'Where do they all GO?'") } });
room('kb_granary', 'in_shop', 'The Granary', { npcs: () => [] });
room('kb_orla', 'in_cottage2', "Widow Orla's House", { npcs: () => [], tiles: { '4,2': async () => narr("A portrait of a smiling old man, hung crooked. Underneath it, a gourd with a face carved in it. It is also smiling. Somehow that's worse.") } });
room('kb_pell', 'in_home', "Pell's Bakery", { npcs: () => [VHOME('kbp1', 2)] });
door('millbrook', 15, 11, 'mb_tavern', async () => !G.S.hood && G.S.sus >= 3 ? 'Marta sees your eyes through the window and turns the sign to CLOSED.' : null);
door('millbrook', 24, 11, 'mb_ferry'); door('millbrook', 5, 12, 'mb_miller'); door('millbrook', 7, 24, 'mb_herb'); door('millbrook', 18, 26, 'mb_chapel'); door('millbrook', 25, 26, 'mb_home');
door('kettlebrook', 28, 9, 'kb_tavern'); door('kettlebrook', 19, 9, 'kb_reeve'); door('kettlebrook', 18, 22, 'kb_orla'); door('kettlebrook', 28, 22, 'kb_pell');
door('kettlebrook', 36, 20, 'kb_granary', async () => F().ge2 ? null : 'The granary doors are nailed shut. A white wax seal: PROPERTY OF THE EMBER INQUISITION.');

/* ================= ASHFORD: posters, Maren & Mina, quest marks ================= */
(function () {
  const S = SCENES.ashford, _npcs = S.npcs.bind(S);
  const QM = {
    maren: () => { const f = F(); return f.ashIntroDone && !f.lead ? '!' : f.sqBelfry === 'maren' ? '?' : null; },
    kess: () => { const f = F(); return f.learnedMill && f.kessWait && !f.kessHelp ? '!' : null; },
    voss: () => { const f = F(); return f.kessHelp && !f.vossGone ? '?' : null; },
    tobb: () => { const f = F(); return f.hasCrate && !f.crateDone ? '?' : !f.crateQuest ? '!' : null; },
    hoshi: () => !F().hoshiDone ? '!' : null,
    bram: () => F().sqFlour === 'on' ? '?' : null
  };
  S.npcs = function () {
    const L = _npcs(), f = F();
    for (const n of L) if (QM[n.id]) n.qm = QM[n.id];
    if (f.lead >= 3 && !f.ge3) L.push({ id: 'larkA', sprite: 'lark', x: 25, y: 10, dir: 'down', talk: gePosters, qm: () => '!', ai: 'turn', turns: ['down', 'left'] });
    return L;
  };
  const _maren = talkMaren;
  talkMaren = async function () {
    if (F().sqBelfry === 'maren') {
      await say('maren', 'shock', "…Who's this little one? Green eyes— oh, sweetheart. Come here. Come here.");
      await say('maren', 'sad', "Sister Aud sent her? Of course she did. That woman's been smuggling children past the Registry for twenty years in a bell-tower.");
      await say('maren', 'neutral', "She stays with me. Behind the closed door, with the patients who'd rather bleed than share a roof with her. …They'll learn. Children are very good at teaching.");
      F().sqBelfry = 'done'; Opinion.add('hope', 1); Story.gainXp(30); toast('Errand done: <b>The Girl in the Belfry</b> — Mina is safe with Maren.', 3000); return;
    }
    return _maren();
  };
  const _bram = talkBram;
  talkBram = async function () { if (F().sqFlour === 'on' && G.S.hood) return keepTalk('ashford'); return _bram(); };
})();
CHAR.larkA = { name: 'Lark', sprite: 'lark' };
async function gePosters() {
  const f = F();
  await say('larkA', 'happy', "Psst! {name}! Look what I've got. Green paint. A LOT of green paint.");
  await say('larkA', 'neutral', "Tonight Green Eclipse paints green eyes on every WANTED poster in the Hollow. Smiling ones. Every single one. Kairo says fear only works if it goes both ways.");
  const c = await ask('larkA', 'happy', "Wanna help? You can do the one on the guardhouse door. It's the biggest.", ["Hand me a brush.", "I'll stay out of it.", "Don't — they'll search every house for Drags. Kess. Maren's patients."]);
  if (c === 0) {
    await fadeOut(700); await narr('Midnight. You paint a very large, very cheerful pair of green eyes onto the guardhouse WANTED notice. Lark adds eyelashes. And a moustache.'); await fadeIn(700);
    await narr('By morning, half of Ashford is laughing behind their hands. The other half is checking their locks.');
    f.ge3 = 'help'; Story.addSus(.5); Opinion.add('hope', .5); Opinion.add('fear', .5); f.geTrust = (f.geTrust || 0) + 1;
    await say('larkA', 'happy', "That's the best moustache I've ever done. I'm telling Kairo you did the eyelashes.");
  } else if (c === 1) {
    await say('larkA', 'neutral', "Boring. Okay. Watch the town square tomorrow, then.");
    await narr('In the morning, every poster in Ashford has green eyes — and the guardhouse door says, in letters a foot tall: WE SEE YOU TOO.');
    f.ge3 = 'ignore'; Opinion.add('fear', 1);
  } else {
    await say('larkA', 'sad', "…Huh. I didn't think about Kess. Or the clinic.");
    await say('larkA', 'neutral', "Fine. Just ONE poster. A small one. On the outhouse. That one doesn't count.");
    f.ge3 = 'stop'; Opinion.add('hope', .5);
  }
  World.remove('larkA');
}
// the mill: if you saved Kettlebrook's granary, Halvard's people are well fed
(function () { const _s = Battle.start; Battle.start = async function (cfg) { if (cfg && cfg.enemies && G.S.map === 'mill' && F().granaryStands && !F().millGuards && cfg.enemies.join() === 'acolyte,acolyte,bandit') { cfg = Object.assign({}, cfg, { enemies: ['acolyte', 'acolyte', 'acolyte', 'bandit'], intro: 'Well fed and well rested — the mill guards are ready for you.' }); } return _s.call(this, cfg); }; })();

/* ================= quest marks over heads ================= */
(function () {
  const _render = World.render.bind(World);
  World.render = function (c, t) {
    _render(c, t);
    if (!this.map || !this.player || this.loading || G.mode === 'battle') return;
    const cx = Math.round(this.cam.x), cy = Math.round(this.cam.y);
    for (const e of this.ents) {
      let q = e.qm; if (!q && e.id && e.id.startsWith('qn_')) q = '?'; if (!q && e.id && e.id.startsWith('bounty_')) q = '!';
      if (typeof q === 'function') { try { q = q(); } catch (x) { q = null; } }
      if (!q || e.bubble) continue;
      const x = Math.round(e.px - cx), y = Math.round(e.py - cy - 70 * (e.size || 1) + Math.sin(t / 220 + e.x) * 2.5);
      if (x < -20 || x > G.view.w + 20 || y < -20 || y > G.view.h + 20) continue;
      c.save();
      c.fillStyle = 'rgba(0,0,0,.55)'; c.beginPath(); c.ellipse(x, y + 1, 8, 9, 0, 0, 7); c.fill();
      c.font = '700 17px "Pixelify Sans"'; c.textAlign = 'center'; c.textBaseline = 'middle';
      c.lineWidth = 3.5; c.strokeStyle = '#1a1206'; c.strokeText(q, x, y + 1);
      c.fillStyle = q === '!' ? '#ffd34a' : '#9fd8ff'; c.fillText(q, x, y + 1);
      c.restore();
    }
  };
})();

/* ================= the continent map & travel ================= */
(function () {
  const mb = MAPLOC.find(l => l.id === 'millbrook'), kb = MAPLOC.find(l => l.id === 'kettle');
  if (mb) Object.assign(mb, { x: .655, y: .695, text: 'Ferry village on the Ashen River, west of Ashford. Oswin the ferryman counts every wagon that crosses. Taverns: the Drowned Duck.', scene: ['millbrook', 45, 17, 'left'] });
  if (kb) Object.assign(kb, { x: .70, y: .76, text: 'Wheat village south of Ashford on the grain road. The Inquisition seized its granary. Taverns: the Sheaf & Sickle.', scene: ['kettlebrook', 23, 2, 'down'] });
  const _can = Travel.canFrom.bind(Travel), VALE = ['ashford', 'woods', 'mill', 'millbrook', 'kettlebrook'];
  Travel.canFrom = function () { const m = G.S.map; return _can() || VALE.includes(m) || (SCENES[m] && SCENES[m].map && G.S.ret && VALE.includes(G.S.ret.map)); };
})();

/* ================= lore ================= */
LEGENDS.push(
  { name: 'The Ashen Vale', need: 'valeLore', text: "The green valley of the Ashen River, between the tomb-mountains and the Imperial heartland. Ashford Hollow is its market town; Millbrook ferries its river; Kettlebrook feeds it. A hundred years ago a third of the vale had green eyes. The mills, the bridges and the best hinges were Drag work. Nobody in the vale says so out loud — but the little dragons carved under axles and doorframes are still there, if you know where to look." },
  { name: 'The House of Aurel', need: 'royalsHeard', text: "Emperor Lucan Aurel, third of his name, thirty and unmarried, with the whole continent painted on his ceiling. The Dowager Empress Helene, who has not left the palace in eleven years and speaks to her husband's portrait. Prince Corin, the emperor's younger brother, who once ran away to be an adventurer and had his Guild card burned in the throne room. The family claims descent from the First Sun, the hero-king who founded the Empire — a king with no portrait, no tomb and no bones." }
);

/* ================= the hunt board, the vale's mood, town errands ================= */
(function () {
  const _q = questsMenuHTML;
  questsMenuHTML = function () {
    let h = _q(); const f = G.S.f;
    if (G.S.chapter === 1 && (G.S.intel || []).length) {
      h += `<div class="stat" style="margin-top:6px"><h3>The Hunt for Halvard <span class="muted">· you vs. Green Eclipse</span></h3>${G.S.intel.map(e => `<p><b style="color:${e.by === 'ge' ? '#a9c4ff' : '#46ff95'}">${e.by === 'ge' ? '◆ Green Eclipse' : '◆ You'}</b> <span class="muted">—</span> ${esc(e.t)}</p>`).join('')}</div>`;
    }
    if (G.S.f.geTrust !== undefined || G.S.f.ge1 || G.S.f.millDone) h += `<div class="stat" style="margin-top:6px"><h3>Green Eclipse notoriety: <span style="color:#a9c4ff">${Notoriety.name()}</span></h3><p><span style="display:inline-block;width:60%;height:6px;background:#222;border-radius:3px;vertical-align:middle"><span style="display:block;height:6px;border-radius:3px;background:#3fbf6a;width:${Math.min(100, Notoriety.val() * 10)}%"></span></span></p><p class="muted">${Notoriety.desc()}${(G.S.f.coupHint || 0) ? ' Kairo is planning something against the Empire itself. Nobody knows what — or why.' : ''}</p></div>`;
    const m = Opinion.mood();
    h += `<div class="stat" style="margin-top:6px"><h3>What the vale thinks of Drags</h3><p><b style="color:#46ff95">Hope ${Math.round(Opinion.hope * 2) / 2}</b> · <b style="color:#ff7a6a">Fear ${Math.round(Opinion.fear * 2) / 2}</b></p><p class="muted">${m[1]}</p></div>`;
    const E = [['sqWheel', "The Miller's Wheel", 'Clear the river-rats at the Millbrook mill-race, then see Dunstan.'], ['sqHerb', 'Moonpetal for Fen', 'Bring 2 Moonpetal to Fen in Millbrook.'], ['sqBelfry', 'The Girl in the Belfry', f.sqBelfry === 'maren' ? 'Bring Mina to Maren in Ashford.' : 'Bring Mina to Lark at the Millbrook landing.'], ['sqGourd', "Widow Orla's Gourds", "Clear the gourds in Orla's field, Kettlebrook."], ['sqFlour', "Pell's Flour", f.sqFlour === 'done' ? 'Collect your pay from Pell in Kettlebrook.' : 'Deliver the sack to Bram at the Crooked Lantern, Ashford.']];
    const on = E.filter(([k]) => f[k] && f[k] !== 'done' && !(k === 'sqFlour' && f.sqFlourPaid));
    if (on.length) h += `<div class="stat" style="margin-top:6px"><h3>Vale errands</h3>${on.map(([k, n, d]) => `<p><b>${n}</b> <span class="muted">— ${d}${f[k] === 'won' ? ' (done — go back for your reward)' : ''}</span></p>`).join('')}</div>`;
    return h;
  };
})();

/* ================= restart Chapter I ================= */
const CH1_KEY = 'eb_ch1_start';
const Chapter = {
  snap() { if (!G.S) return; const s = JSON.parse(JSON.stringify(G.S)); s.map = 'ashford'; s.x = 29; s.y = 39; s.dir = 'up'; store(CH1_KEY, JSON.stringify(s)); },
  has() { return !!store(CH1_KEY); },
  async restart(keep) {
    const raw = store(CH1_KEY); if (!raw) return;
    const old = G.S, s = JSON.parse(raw); s.name = old.name;
    if (keep) for (const k of ['lvl', 'xp', 'stats', 'gold', 'items', 'arts', 'skills', 'sp', 'bonds', 'fams', 'fam', 'mounts', 'mount', 'pages', 'qitems', 'chests', 'kills']) if (old[k] !== undefined) s[k] = JSON.parse(JSON.stringify(old[k]));
    G.S = s; save(); $('#menu').classList.add('hide'); World.busy = false; G.mode = 'world';
    await fadeOut(500); await World.load(s.map, s.x, s.y, s.dir); UI.hud(); UI.controls(true); await fadeIn(500);
    banner('CHAPTER I', 'Ashford Hollow — again', 2200);
  },
  async ask() {
    const c = await ask(null, null, 'Restart Chapter I from your arrival in Ashford Hollow? Every choice in this chapter will be undone.', ['Restart — keep my strength (level, Arts, gold, items)', 'Restart from scratch (as I first arrived)', 'Cancel']);
    Dlg.close(); if (c === 0 || c === 1) await this.restart(c === 0);
  }
};
(function () {
  const _pe = Story.prologueEnd; Story.prologueEnd = async function () { await _pe.apply(this, arguments); Chapter.snap(); };
  // saves that were already inside Chapter I get a restart point the first time they're loaded in the vale
  const _l = World.load.bind(World);
  World.load = async function (name, x, y, dir) { const r = await _l(name, x, y, dir); try { if (G.S && G.S.chapter === 1 && !G.S.f.chapter1Done && !Chapter.has() && ['ashford', 'woods', 'millbrook', 'kettlebrook'].includes(name)) Chapter.snap(); } catch (e) { } return r; };
  const _rm = UI.renderMenu.bind(UI);
  UI.renderMenu = function () {
    _rm();
    if (this.menuTab === 'settings' && G.S && G.S.chapter >= 1 && Chapter.has()) {
      const row = $('#menuCard .btnrow'); if (!row) return;
      const b = document.createElement('button'); b.className = 'btn'; b.id = 'mRestart'; b.textContent = 'Restart Chapter I'; row.appendChild(b);
      bindTap(b, async () => { $('#menu').classList.add('hide'); World.busy = false; this.controls(true); Story.run(() => Chapter.ask()); });
    }
  };
})();
function ch1Summary() {
  const f = G.S.f, W = { help: 'helped them', ignore: 'looked away', stop: 'stopped them' };
  return `<p>Green Eclipse — Millbrook bridge: <b>${W[f.ge1] || '—'}</b> · Kettlebrook granary: <b>${W[f.ge2] || '—'}</b> · Ashford posters: <b>${W[f.ge3] || '—'}</b></p><p>The vale: <b style="color:#46ff95">Hope ${Math.round(Opinion.hope * 2) / 2}</b> · <b style="color:#ff7a6a">Fear ${Math.round(Opinion.fear * 2) / 2}</b> — ${Opinion.mood()[1]}</p>`;
}
