'use strict';
/* ================= STORY: characters, scenes, quests ================= */
Object.assign(CHAR, {
  ilya: { name: 'Ilya', sprite: 'ilya' }, nana: { name: 'Nana', sprite: 'nana' }, oren: { name: 'Oren', sprite: 'oren' },
  mei: { name: 'Mei', sprite: 'mei' }, jun: { name: 'Jun', sprite: 'jun' }, asha: { name: 'Asha', sprite: 'asha' },
  halvard: { name: 'Halvard', sprite: 'halvard' }, acolyte: { name: 'Acolyte', sprite: 'acolyte' },
  maren: { name: 'Maren', sprite: 'maren' }, tobb: { name: 'Tobb', sprite: 'tobb' }, pip: { name: 'Pip', sprite: 'pip' }, pipmom: { name: "Pip's Mother", sprite: 'pipmom' },
  kess: { name: 'Kess', sprite: 'kess' }, kessE: { name: 'Kess', sprite: 'kess_eyes' }, voss: { name: 'Captain Voss', sprite: 'voss' }, guard: { name: 'Guard', sprite: 'guard' },
  rook: { name: 'Rook', sprite: 'rook' }, bandit: { name: 'Bandit', sprite: 'bandit' }, sable: { name: 'Sable', sprite: 'hunter' }, cassel: { name: 'Brother Cassel', sprite: 'cassel' },
  hoshi: { name: 'Old Hoshi', sprite: 'hoshi' }, brom: { name: 'Guildmaster Brom', sprite: 'brom' }, sylwen: { name: 'Sylwen', sprite: 'sylwen' },
  garrick: { name: 'Garrick', sprite: 'garrick' }, tilda: { name: 'Tilda', sprite: 'tilda' }, bram: { name: 'Bram', sprite: 'innkeep' },
  kairo: { name: 'Kairo', sprite: 'kairo_kid', kid: 1 }, kairoKB: { name: 'Kairo', sprite: 'kairo_kidb', kid: 1 },
  tamsinK: { name: 'Tamsin', sprite: 'tamsin_kid', kid: 1 }, boK: { name: 'Bo', sprite: 'bo_kid', kid: 1 }, larkK: { name: 'Lark', sprite: 'lark_kid', kid: 1 }, nixK: { name: 'Nix', sprite: 'nix_kid', kid: 1 },
  tamsin: { name: 'Tamsin', sprite: 'tamsin' }, liora: { name: 'Liora', sprite: 'liora_e' }, vane: { get name() { return G.S && G.S.f.vaneName ? 'Vane' : 'The Old Man'; }, sprite: 'vane' }, dace: { name: 'Dace', sprite: 'ge_dace' }, sefa: { name: 'Sefa', sprite: 'ge_sefa' }, wren: { name: 'Wren', sprite: 'ge_wren' }, corran: { name: 'Corran', sprite: 'ge_corran' }, bo: { name: 'Bo', sprite: 'bo' }, lark: { name: 'Lark', sprite: 'lark' }, kairoB: { name: 'Kairo', sprite: 'kairo_b' }, dread: { name: 'Dread', sprite: 'dread' }, rebel: { name: 'Green Eclipse', sprite: 'rebel' }
});
const F = () => G.S.f;
const Story = {
  async run(fn) {
    if (World.busy) return; World.busy = true; UI.controls(false);
    try { await fn(); } catch (e) { console.error(e); }
    finally { Dlg.close(); World.busy = false; if (G.mode === 'world') UI.controls(true); UI.hud(); save(); }
  },
  addSus(n, quiet) {
    const before = Math.floor(G.S.sus); G.S.sus = Math.min(5, G.S.sus + n);
    if (Math.floor(G.S.sus) > before && !quiet) toast('Suspicion rises.');
    if (Math.floor(G.S.sus) > before && quiet) toast('Whispers spread through the Hollow… <b style="color:#46ff95">Suspicion ' + Math.floor(G.S.sus) + '/5</b>');
    UI.hud();
  },
  gainXp(n) {
    const S = G.S; S.xp += n; let up = false;
    while (S.xp >= S.lvl * 30) { S.xp -= S.lvl * 30; S.lvl++; up = true; const s = S.stats; s.maxHp += 9; s.maxMp += 3; s.atk += 2; s.def += 1; s.spd += .5; s.hp = s.maxHp; s.mp = s.maxMp; }
    if (up) { sfx('level'); for (const k in S.allies) S.allies[k] = {}; }
    return up;
  },
  heal(quiet) { const s = G.S.stats; s.hp = s.maxHp; s.mp = s.maxMp; for (const k in G.S.allies) G.S.allies[k] = {}; sfx('heal'); if (!quiet) toast('HP & MP restored.'); UI.hud(); },
  quest(q) { G.S.quest = q; UI.hud(); },
  async defeat() {
    await fadeOut(600);
    G.S.stats.hp = G.S.stats.maxHp; G.S.stats.mp = G.S.stats.maxMp; const lost = Math.floor(G.S.gold / 2); G.S.gold -= lost;
    for (const k in G.S.allies) G.S.allies[k] = {};
    await World.load('ashford', 9, 16, 'up'); await fadeIn(600);
    await narr('Darkness. Then the bitter smell of herbs.');
    await say('maren', F().marenKnows ? 'sad' : 'neutral', F().marenKnows ? "Dragged you onto my porch myself. My back will never forgive you." : "Found you face-down on the road. Lucky the crows didn't find you first.");
    if (lost) toast('You lost ' + lost + ' gold.');
  },
  async join(id) {
    if (!G.S.party.includes(id)) G.S.party.push(id);
    G.S.allies[id] = {};
    await World.load(G.S.map, G.S.x, G.S.y, G.S.dir);
    toast(`<b style="color:#46ff95">${ALLY[id].name}</b> joined your party!`, 3000);
  }
};
const ALLY_TALK = {
  kess: async () => {
    const f = F(); const lines = [
      ['neutral', "Keep walking. Standing still is how they notice you."], ['sad', "My mother had a ribbon like yours. Different color. Same reason."],
      ['anger', "If you blaze in the middle of the market again I'm leaving you there."], ['happy', "…It's strange. Walking next to someone who doesn't flinch."]];
    const l = lines[(G.S.steps >> 3) % lines.length]; await say('kessE', l[0], l[1]);
  }
};

/* ---------------- THORNVALE (prologue) ---------------- */
const HIDE = [[30, 22, 'tallgrass'], [30, 11, 'barrels'], [10, 26, 'pond']];
const HIDE_HINT = ['Find Ilya! You hear giggling from the tall grass east of the square, by the stream.', "Find Ilya! Something just knocked over a bucket near Oren's barrels, north-east.", 'Last one! A splash and a "shhh!" from the pond reeds in the south-west.'];
const VILLAGER_LINES = () => F().dusk ? ['Happy birthday, Ilya!', 'Best festival in years.', 'Jun, more sparks!', 'Pass the honey cakes.', 'Look at Kairo dance, ha!'] : ['Ember Festival tonight!', 'Happy birthday to Ilya!', 'The mountains look close today.', 'Has anyone seen my good knife?', "Asha's been jumpy all week.", 'Lovely morning.', 'Mind the stream, little ones!'];
async function talkVillager(e) {
  CHAR[e.id] = { name: e.kid ? 'Village kid' : 'Villager', sprite: e.sprite, kid: e.kid };
  const L = e.kid ? ["Ilya's hiding SO good this year.", "When I grow up my eyes are gonna be the greenest.", "Kairo says he can beat a grown-up. I believe him."]
    : F().dusk ? ['"Sit, child, sit. Have a honey cake before Jun eats them all."', '"Your father would have loved tonight."', '"Mind the sparks. Jun gets carried away."']
    : ['"Morning, little one. Big day for your sister."', '"The Elder says no one climbs the ridge today. Or any day."', '"Oren\'s been hammering since dawn. Something special for someone, I think."', '"Stay close to the village, hear? Strangers on the far road."'];
  await say(e.id, null, pick(L));
}
SCENES = {};
SCENES.thornvale = {
  title: 'Thornvale', subtitle: 'A hidden Drag village', safe: true,
  get crowd() { const f = F(); if (f.raid) return null; return f.dusk ? { count: 12, pool: () => G.man.dfolk, areas: [[13, 16, 21, 20], [12, 15, 24, 16]], talk: talkVillager, lines: VILLAGER_LINES, witness: false }
    : { count: 13, pool: () => G.man.dfolk, areas: [[5, 15, 31, 16], [13, 16, 21, 20], [24, 16, 27, 23], [2, 17, 9, 21], [16, 11, 22, 14]], talk: talkVillager, lines: VILLAGER_LINES, witness: false }; },
  music: () => F().raid ? (F().after ? 'sad' : 'night') : 'village',
  get bd() { return F().raid ? 'dusk' : 'field'; },
  async setup(W) {
    const f = F();
    if (f.dusk && !f.after) { W.tint = 'rgba(70,25,10,.38)'; W.lights.push({ x: 17 * 32 + 16, y: 18 * 32 + 10, r: 110, c: '255,150,60' }); }
    if (f.raid) {
      W.tint = f.after ? 'rgba(40,40,50,.42)' : 'rgba(90,20,5,.42)';
      for (const [x, y] of [[8, 10], [16, 7], [24, 9], [8, 20], [22, 21], [18, 8], [25, 22]]) W.addFire(x, y, true);
      if (f.after) W.lights.length = 3;
    }
  },
  npcs() {
    const f = F(); const L = [];
    if (!f.raid) {
      const hiding = f.hs !== undefined && f.hs < 3 && f.hs >= 0 && !f.found3;
      L.push({ id: 'ilya', x: f.hs === undefined ? 10 : HIDE[Math.min(f.hs || 0, 2)][0], y: f.hs === undefined ? 14 : HIDE[Math.min(f.hs || 0, 2)][1], dir: 'left', talk: talkIlya, hidden: hiding, peek: true, ai: hiding ? 'giggle' : null,
        show: () => true });
      if (!f.dusk) {
        L.push({ id: 'tamsinK', sprite: 'tamsin_kid', x: 21, y: 15, dir: 'down', talk: talkKids, ai: 'wander', area: [18, 14, 26, 16] });
        L.push({ id: 'boK', sprite: 'bo_kid', x: 12, y: 18, dir: 'down', talk: talkKids, ai: 'wander', area: [11, 17, 13, 21] });
        L.push({ id: 'larkK', sprite: 'lark_kid', x: 6, y: 16, dir: 'down', talk: talkKids, ai: 'wander', area: [3, 15, 8, 17] });
        L.push({ id: 'nixK', sprite: 'nix_kid', x: 31, y: 13, dir: 'down', talk: talkKids, ai: 'turn' });
      } else {
        L.push({ id: 'tamsinK', sprite: 'tamsin_kid', x: 14, y: 18, dir: 'right', talk: talkKids }); L.push({ id: 'boK', sprite: 'bo_kid', x: 20, y: 18, dir: 'left', talk: talkKids });
        L.push({ id: 'larkK', sprite: 'lark_kid', x: 14, y: 17, dir: 'right', talk: talkKids }); L.push({ id: 'nixK', sprite: 'nix_kid', x: 20, y: 17, dir: 'left', talk: talkKids });
      }
      L.push({ id: 'nana', x: 17, y: 12, dir: 'down', talk: talkNana, ai: 'turn', turns: ['down', 'left', 'right'] });
      L.push({ id: 'oren', x: 26, y: 14, dir: 'left', talk: talkOren, ai: 'bark', barks: () => ['*clang* *clang*', 'Hah! Good steel.', 'Ember Festival tonight!'] });
      L.push({ id: 'mei', x: 13, y: 22, dir: 'down', talk: talkMei, ai: 'turn' });
      L.push({ id: 'jun', x: 29, y: 18, dir: 'down', talk: talkJun, ai: 'wander', area: [27, 17, 32, 19] });
      L.push({ id: 'asha', x: 37, y: 15, dir: 'right', talk: talkAsha, ai: 'turn', turns: ['right', 'up', 'down'] });
      if (f.dusk) {
        L.push({ id: 'kairo', sprite: 'kairo_kid', x: 18, y: 17, dir: 'down', talk: async () => { await say('kairo', 'happy', "If Ilya asks, I'm a GREAT dancer. Back me up."); } });
        L.forEach(n => { if (n.id === 'ilya') { n.x = 16; n.y = 17; n.hidden = false; } if (n.id === 'nana') { n.x = 15; n.y = 17; } if (n.id === 'oren') { n.x = 19; n.y = 17; n.ai = null; } if (n.id === 'mei') { n.x = 15; n.y = 19; } if (n.id === 'jun') { n.x = 19; n.y = 19; n.ai = null; } });
      }
    } else if (f.after) {
      if (!F().nanaDead) L.push({ id: 'nana', x: 17, y: 12, dir: 'down', talk: talkNanaAfter });
      if (!F().hoodGiven || !F().greenEclipse) {
        L.push({ id: 'mei', x: 14, y: 13, dir: 'right', talk: async () => { await say('mei', 'sad', F().nanaDead ? "We'll bury her by the old wall, where she could see the mountains. Then we go with Kairo. Go get your sister, {name}." : "Nana's asking for you. Go to her."); } });
        L.push({ id: 'jun', x: 20, y: 14, dir: 'left', talk: async () => { await say('jun', 'anger', "Seven of us gone in chains. Ilya. Little Nix. And Oren… I saw him fall."); } });
        L.push({ id: 'tamsinK', sprite: 'tamsin_kid', x: 15, y: 14, dir: 'up', talk: async () => say('tamsinK', null, "Kairo went back in for us. Three times. I'm never leaving his side. Never.") });
        L.push({ id: 'boK', sprite: 'bo_kid', x: 19, y: 15, dir: 'left', talk: async () => say('boK', null, "…I couldn't find my mama. Lark's holding my hand so I don't have to look.") });
        L.push({ id: 'larkK', sprite: 'lark_kid', x: 18, y: 15, dir: 'left', talk: async () => say('larkK', null, "I'm not crying. Bo's crying. I'm just… holding his hand. That's all.") });
      }
    }
    return L;
  },
  exits: [
    { x: 43, y: 14, y2: 16, to: 'ashford', tx: 29, ty: 39, dir: 'up', msg: "Ilya's still waiting for you to find her.", when: () => !F().after },
    { x: 43, y: 14, y2: 16, to: 'realm', tx: 23, ty: 29, dir: 'up', check: async () => { UI.controls(false); await narr("Mei takes your hand. You cross the bridge, out of the only home you've ever known."); await narr('That night, camped on the mountain pass, you can\'t sleep. Below you, the wagon ruts turn north — up into the peaks nobody climbs.'); await narr("Ilya's ribbon is on your wrist. You promised. Dragon law."); await narr('While Mei sleeps, you slip out of the camp and follow the ruts into the dark.'); Dlg.close(); return true; }, when: () => F().after }
  ],
  tiles: {
    '9,12': async () => narr(F().raid ? 'Your home. The roof is gone. The door still stands, somehow.' : 'Home. Ilya has scratched a little dragon into the doorframe.'),
    '17,10': async () => narr("Nana's house smells like ginger and old books."),
    '24,12': async () => narr("Oren's forge. The coals glow the same green as your eyes."),
    '17,18': async () => { if (F().dusk && !F().raid) return festival(); await narr('The festival fire pit.'); }
  },
  async onEnter() {
    const f = F();
    if (!f.started) { f.started = true; await prologueWake(); }
  }
};
async function prologueWake() {
  const W = World; const il = W.ent('ilya');
  await narr('Thornvale. A village with no name on any map. The morning of the Ember Festival.');
  await say('ilya', null, "{Sib}! {SIB}! You're finally awake!");
  await me('happy', "Morning, Ilya. Why are you shouting?");
  await say('ilya', null, "Because it's my BIRTHDAY. And the Ember Festival. And you PROMISED to play hide-and-seek. You pinky-promised.");
  const c = await ask('ilya', null, "You can't break a pinky promise. That's the law of dragons.", ["I'd never break a dragon law.", "Five minutes. Then chores."]);
  if (c === 0) await say('ilya', null, "Good! Because I'm very good at hiding. I'm the best hider in Thornvale. Probably the world.");
  else await say('ilya', null, "Five minutes is a hundred years in dragon time. Okay! Count to ten!");
  await narr('You cover your eyes. Their green glow leaks between your fingers anyway.');
  await me('closed', "One… two… three…");
  il.hidden = true; il.peek = true; il.ai = 'giggle'; F().hs = 0; Story.quest(HIDE_HINT[0]);
  toast('Tip: when you get close, Ilya peeks out and giggles. Face her and tap <b>A</b>.', 4500);
  toast('Drag the left side of the screen to walk. Tap <b>A</b> to talk and search.', 4500);
  await World.walk(il, [[12, 14], [12, 15]], 120); il.x = HIDE[0][0]; il.y = HIDE[0][1]; il.px = il.x * 32 + 16; il.py = il.y * 32 + 26;
}
async function talkIlya(e) {
  const f = F();
  if (f.hs !== undefined && f.hs < 3 && e.hidden) {
    e.hidden = false; sfx('coin');
    const lines = [
      ["Aww! How did you find me?! The grass was so tall!", "Your eyes. They glowed right through it. That's cheating!"],
      ["Nooo! The barrels were PERFECT!", "Oren says dragons can smell gold. Can Drags smell little sisters?"],
      ["Hmph. Okay. You're a little bit good at this.", "Last one! Wait — I'm thirsty. Let's go see Nana. She said she has a surprise for my birthday!"]];
    await say('ilya', null, lines[f.hs][0]); await say('ilya', null, lines[f.hs][1]);
    f.hs++;
    if (f.hs < 3) {
      await say('ilya', null, "Again! Count to ten! No peeking!"); e.hidden = true; e.ai = 'giggle';
      const [x, y] = HIDE[f.hs]; e.x = x; e.y = y; e.px = x * 32 + 16; e.py = y * 32 + 26;
      Story.quest(HIDE_HINT[f.hs]);
    } else { f.found3 = true; Story.quest("Visit Nana's house with Ilya (north of the road)."); e.ai = null; }
    return;
  }
  if (f.dusk) { await say('ilya', null, "Come sit by the fire! Jun says he'll make the sparks dance!"); return; }
  if (!f.ribbon) { await say('ilya', null, "Nana's house! Come ON, {sib}!"); return; }
  const l = ["Do you think dragons have birthdays?", "When I grow up I'm going to see the ocean. Nana says it's bigger than the sky.", "Oren says you're good with a sword. I'm good with a stick.", "My ribbon matches your eyes. That was on purpose."];
  await say('ilya', null, l[G.S.steps % l.length]);
}
async function talkNana() {
  const f = F();
  if (!f.found3) { await say('nana', 'happy', "Go on, play with your sister. An old woman's chores can wait for one day."); return; }
  if (f.ribbon) {
    if (!f.oren) { await say('nana', 'neutral', "Oren was asking for you at the forge. He has something for you before tonight."); return; }
    await say('nana', 'happy', "Dusk is coming. Go to the fire, child."); return;
  }
  f.ribbon = true;
  await say('nana', 'happy', "There's my birthday girl. Six years old. Six! When did that happen?");
  await say('ilya', null, "Nana! {Sib} found me THREE times. I let {them}.");
  await say('nana', 'happy', "Of course you did. Here — I dyed this myself. Green silk, from the market in Ashford Hollow.");
  await narr('Nana ties a ribbon of green silk around Ilya\'s wrist. It catches the light like your eyes do.');
  await say('ilya', null, "It's so pretty… wait.");
  await narr('Ilya tugs the ribbon free, bites it, and tears it clean in two. Nana sighs.');
  await say('ilya', null, "Hold out your hand, {sib}.");
  await narr('She ties half around your wrist. Badly. With her tongue sticking out.');
  await say('ilya', null, "There. Now you can always find me. Even when I hide really, really good.");
  const c = await ask('me', 'blush', "…", ["I'll always find you. Promise.", "This is the worst knot I've ever seen."]);
  if (c === 0) { await me('happy', "I'll always find you, Ilya. Pinky promise."); await say('ilya', null, "Dragon law!"); }
  else { await me('happy', "This is the worst knot I've ever seen."); await say('ilya', null, "It's a DRAGON knot. It's supposed to look like that."); }
  await say('nana', 'sad', "…The two of you. Your mother would have laughed until she cried.");
  await say('nana', 'neutral', "{name}. Oren wants you at the forge before the festival. Something about a blade.");
  Story.quest("See Oren at the forge (the brick house east of Nana's).");
}
async function talkOren() {
  const f = F();
  if (!f.ribbon) { await say('oren', 'happy', "Ha! Running from a little girl, are you? Go on, she'll find YOU at this rate."); return; }
  if (f.oren) { await say('oren', 'neutral', "Keep it oiled. And remember — read the swing, not the sword."); return; }
  f.oren = true;
  await say('oren', 'neutral', "There you are. Close your mouth, you'll catch flies.");
  await narr('Oren lifts a cloth from the anvil. Beneath it: a wooden practice sword, worn smooth, with an iron spine down its back.');
  await say('oren', 'happy', "Your father carved this when he was your age. Oak, with an iron spine. His real blade waits for you until you're grown.");
  await say('oren', 'neutral', "Listen to me. The Inquisition's been seen on the far roads. If they ever come here, you don't stand and trade blows like a fool.");
  await say('oren', 'neutral', "You watch the swing. You DODGE, or you PARRY — and if you parry every blow they throw, you'll have them wide open for a counter.");
  await say('oren', 'anger', "And the fire in your blood… only when you have to. Every time your eyes blaze, someone remembers them.");
  await me('neutral', "You sound like Nana.");
  await say('oren', 'happy', "Nana's the smartest person in Thornvale. Now get. Dusk is coming.");
  sfx('coin'); toast('You received <b style="color:#46ff95">Father\'s Practice Sword</b>.');
  await kairoIntro();
}
async function kairoIntro() {
  const f = F(); const W = World;
  const k = await W.addNpc({ id: 'kairo', sprite: 'kairo_kid', x: 27, y: 15, dir: 'left' });
  await say('kairo', 'happy', "Your father's blade, huh? Took you long enough to show up for it, {name}.");
  await me('happy', "Kairo. Shouldn't you be helping Jun with the hay?");
  await say('kairo', 'happy', "I did. Twice as fast as Jun. Now I'm bored. And you've got a new sword.");
  await say('oren', 'happy', "Oh no. Here we go.");
  await say('kairo', 'anger', "One match. First to yield. Unless the great {name} is scared of losing to me. Again.");
  const c = await ask('me', 'anger', "…", ["You're on.", "I've never lost to you."]);
  if (c === 1) await say('kairo', 'happy', "You've lost to me forty-one times. I keep a list. It's on my wall.");
  await say('oren', 'neutral', "Fine. But you'll fight like I taught you. Watch the swing — DODGE or PARRY. And tap when your own blade lands, not before.");
  const r = await Battle.start({ enemies: ['kairo_spar'], noFlee: true, tutorial: true, bd: 'field', music: 'battle', intro: 'Sparring match: Kairo!',
    onTurn: async (B, Bt) => { const e = B.actors.find(a => a.key === 'kairo_spar'); const me = Bt.me(); if (e && e.hp < e.maxHp * .3) { await Bt.msg('Kairo: "Okay, okay — I yield!"', 1400); return 'win'; } if (me.hp < me.maxHp * .3) { await Bt.msg('Kairo: "Yield, {name}! …Hah! Forty-two!"'.replace('{name}', G.S.name), 1600); return 'lose'; } } });
  Story.heal(true);
  if (r === 'win') { f.sparWon = true; await say('kairo', 'shock', "…Huh. You got better. When did you get better?"); await me('happy', "While you were busy keeping a list."); }
  else { await say('kairo', 'happy', "Forty-two. I'll need a bigger wall."); await me('anger', "Next time."); await say('kairo', 'happy', "There's always a next time with us. That's the best part."); }
  await Cine.play(CINE.ridgeDream(), { music: 'sad' });
  Music.play('village');
  const c2 = await ask('kairo', 'neutral', "Don't you?", ["Every single day.", "Safe is how we're still alive.", "I want both."]);
  if (c2 === 0) await say('kairo', 'happy', "Ha! I knew it. Then one day we climb them. You, me, and Ilya. And we don't stop walking until nobody looks at our eyes.");
  else if (c2 === 1) await say('kairo', 'sad', "…You sound like the Elder. Alive isn't the same as living. You'll see.");
  else await say('kairo', 'happy', "Both. Greedy. That's why you're my brother.");
  await narr('Kairo opens his fist. In his palm sits a pebble of green stone, glowing faintly — like it\'s breathing.');
  await say('kairo', 'neutral', "Found it up on the slope. Feel that? It's warm. It hums. The Elder nearly took my head off when she saw one last year.");
  await say('kairo', 'neutral', "'Never take a stone from the mountain. Never speak of them outside the valley.' …Why would rocks be a secret?");
  await me('neutral', "Maybe because someone out there would want them.");
  await Cine.play(CINE.oath());
  f.oath = true;
  await say('kairo', 'happy', "Sworn. Come on. If Ilya catches me missing her dance, I'm dead.");
  f.kairo = true; W.remove('kairo');
  await fadeOut(800);
  f.dusk = true; await World.load('thornvale', 17, 19, 'up'); await fadeIn(800);
  banner('Dusk', 'The Ember Festival');
  Story.quest('Join everyone at the festival fire.');
}
async function festival() {
  const f = F(); if (f.festDone) return; f.festDone = true;
  await narr('The festival fire crackles green and gold. Jun throws a pinch of powder and the sparks dance like tiny dragons.');
  await say('kairo', 'happy', "Ilya! Show them the dragon dance! The one with the stomping!");
  await say('ilya', null, "Kairo, you have to do it WITH me. You promised. Pinky promise.");
  await say('kairo', 'happy', "…I did not— okay. Fine. One dance. Everyone look away.");
  await narr('Nobody looks away. The village kids pile onto Kairo halfway through and he goes down laughing under six of them.');
  await say('ilya', null, "{Sib}… can I ask you something?");
  await say('ilya', null, "Why do we have to hide? Our eyes are pretty. Nana says people out there think we're monsters.");
  const c = await ask('ilya', null, "Are we monsters?", ["No. People are just afraid of what they don't understand.", "Some people need a monster to blame.", "I don't know, Ilya."]);
  if (c === 0) await say('ilya', null, "Then we just have to make them understand! I'll do it. I'm very convincing.");
  else if (c === 1) await say('ilya', null, "…That's sad. I'd rather be blamed than be the one doing the blaming.");
  else await say('ilya', null, "That's okay. You can not-know with me. We'll figure it out together.");
  await say('nana', 'sad', "Fratenaptor nearly ended the world four hundred years ago. And people decided our eyes meant we'd finish the job.");
  await say('nana', 'neutral', "One day I'll tell you all what these mountains really are. When you're older.");
  await Cine.play(CINE.horns(), { music: 'night' });
  await say('asha', 'shock', "INQUISITION! White cloaks on the ridge — and soldiers. Imperial soldiers! They came straight to the bridge!");
  World.shake = 400; sfx('alarm');
  await say('nana', 'shock', "Straight to the bridge… someone gave them the way in.");
  await say('oren', 'anger', "Mei, Jun — get the children to the caves! {name}, with me!");
  await say('kairo', 'anger', "The west houses — the little ones are still inside! I'll get them out. GO, {name}!");
  await say('ilya', null, "{Sib}?!");
  f.raid = true; await fadeOut(500); await World.load('thornvale', 30, 15, 'right'); await fadeIn(500);
  banner('The Raid', 'Thornvale burns');
  await World.addNpc({ id: 'oren', x: 31, y: 14, dir: 'right' });
  await World.addNpc({ id: 'acolyte', x: 35, y: 15, dir: 'left' }); await World.addNpc({ id: 'acolyte2', sprite: 'acolyte', x: 36, y: 14, dir: 'left' });
  await say('acolyte', 'anger', "By order of the Ember Inquisition and the Crown: every green-eyed soul in this valley is forfeit.");
  await say('oren', 'anger', "Then come and take them, priest.");
  const r = await Battle.start({ enemies: ['acolyte', 'acolyte'], allies: ['oren'], noFlee: true, bd: 'dusk', intro: 'The Inquisition attacks!' });
  if (r === 'lose') Story.heal(true);
  World.remove('acolyte'); World.remove('acolyte2');
  await say('oren', 'happy', "Ha! You were listening after all.");
  // ---- DREAD ----
  World.shake = 600; sfx('break');
  const d = await World.addNpc({ id: 'dread', x: 37, y: 15, dir: 'left', size: 1.45 });
  await Cine.play(CINE.dread(), { music: 'boss' });
  await say('oren', 'shock', "…No. No, it can't be. The Dread General. The Crown sent DREAD for us?");
  await say('oren', 'anger', "{name}! Don't let it touch you — fight, and look for a way out!");
  await Battle.start({ enemies: ['dread'], allies: ['oren'], noFlee: true, bd: 'dusk', boss: true, intro: 'DREAD, the Crown\'s General',
    onTurn: async (B, Bt) => { if (B.turn >= 6) { await Bt.msg('Dread raises his blade.', 900); B.flash = 1.5; sfx('break'); await wait(500); B.actors.filter(a => a.side === 'p').forEach(a => { a.hp = 0; a.ko = true; a.anim = 'hurt'; a.frame = 5; }); Bt.hud(); await Bt.msg('BLACK SUN', 1400); return 'scripted'; } } });
  await narr('You\'re on the ground. Oren is on the ground. He isn\'t moving.');
  const il = await World.addNpc({ id: 'ilya', x: 29, y: 15, dir: 'right' });
  await say('ilya', null, "{SIB}!! Get up — please get up—");
  await narr('Ilya throws herself over you. Dread looks down at the two of you for a long moment. Then he reaches out one black, gauntleted hand.');
  // ---- KAIRO ----
  const k = await World.addNpc({ id: 'kairo', sprite: 'kairo_kid', x: 31, y: 17, dir: 'up' });
  await Cine.play(CINE.kairoSaves());
  await narr('For one heartbeat Kairo\'s burning arm is wrong — swollen, black-scaled, hooked claws where his fingers should be. The flames on his sleeve stop hurting him. Then it\'s just a boy\'s arm again.');
  await say('dread', null, "…");
  await narr('Behind the visor, something green flickers. Dread is looking at Kairo\'s arm. Not at the stone.');
  World.shake = 500; sfx('art');
  await say('dread', null, "…A DRAG STONE.");
  await say('kairo', 'anger', "RUN! Both of you, the bridge, NOW!");
  await narr('You run. Kairo drags you by the collar. Ilya\'s hand is locked in yours.');
  World.remove('dread'); World.remove('oren');
  // ---- HALVARD at the bridge ----
  await World.addNpc({ id: 'halvard', x: 36, y: 15, dir: 'left' }); await World.addNpc({ id: 'acolyte3', sprite: 'acolyte', x: 36, y: 14, dir: 'left' });
  await say('halvard', 'happy', "And there they are. Three little embers, running from the fire.");
  await narr('Acolytes pour off the bridge. A gloved hand closes around Ilya\'s wrist and rips her away from you.');
  World.remove('ilya');
  await say('ilya', null, "{SIB}! LET GO OF ME! KAIRO!");
  await narr('Behind Halvard, an acolyte drags another child by the collar. Nix. He isn\'t screaming. He\'s staring right at you.');
  await say('nixK', null, "…Tell Kairo it wasn't goats.");
  await say('halvard', 'neutral', "Calm, child. You are going somewhere you can be… corrected.");
  await me('anger', "Let. Her. GO.");
  await say('halvard', 'happy', "Fratenaptor's blood doesn't sleep. One day it wakes — in her, in you — and the world burns. I am the firebreak.");
  await Battle.start({ enemies: ['halvard_pro'], allies: [], noFlee: true, bd: 'dusk', boss: true, intro: 'Inquisitor Halvard',
    onTurn: async (B, Bt) => {
      const me = Bt.me(), h = B.actors.find(a => a.side === 'e');
      if (B.awoke) {
        if (B.cur === me && !B.myTurn) { B.myTurn = 1; return; }
        if (B.tideUsed) { await Bt.msg('Halvard is on his back in the mud. His visor is cracked straight down the middle.', 1900); await Bt.msg('Halvard: "…It woke. In a CHILD."', 1700); }
        return 'scripted';
      }
      if (B.turn >= 4) {
        await Bt.msg('Halvard: "Enough."', 1000); B.flash = 1.5; sfx('light'); await wait(500);
        me.hp = 1; me.anim = 'hurt'; me.frame = 5; Bt.hud(); await Bt.msg('PURGING LIGHT', 1400);
        await Bt.msg('Through the white, Ilya is screaming your name. Getting further away.', 1900);
        B.dim = .85; B.dimCol = '0,0,0'; Music.stop(); sfx('break');
        await Cine.play(CINE.awaken());
        await Bt.msg('Every thread is a current. And every current can be pulled… or thrown.', 2100);
        B.flash = 1.3; sfx('art'); G.S.f.eye = true;
        await Bt.msg('EMERALD SIGHT — AWAKENED', 1800);
        me.hp = Math.round(me.maxHp * .35); me.mp = me.maxMp; me.arts = ['crimson']; me.sight = 3; me.anim = 'combat'; me.frame = 0; B.dim = 0; Bt.hud(); Music.play('boss');
        await Bt.msg('You don\'t know how. You just know. (Drag Arts → Crimson Tide)', 2400, true);
        B.awoke = B.turn;
        if (B.cur === me) { B.myTurn = 1; return; }
        me.wait = -1; return 'skip';
      }
    } });
  await narr('Halvard\'s acolytes are scattered across the bridge like dropped laundry. Halvard himself is crawling backwards, staring at you.');
  await say('halvard', 'shock', "Its eyes— look at its EYES. Chain it— no. NO. Get the girl in the wagon. NOW. We leave NOW!");
  await narr('You take one step after them. Warm wet runs down your cheeks. When you touch it, your fingers come away red. The green threads go dark.');
  await fadeOut(200); await fadeIn(200);
  await narr('Your legs fold. Nothing but the ringing in your ears.');
  await say('ilya', null, "{SIB}!! {SIB}, GET UP!");
  await say('kairo', 'anger', "I've got you — I've got you, stop fighting me, we can't— they're too many—");
  await narr('The last thing you see is a scrap of green ribbon, reaching for you through the smoke. Then Kairo drags you into the dark.');
  Music.play('sad'); await fadeOut(1400);
  World.remove('kairo'); World.remove('halvard'); World.remove('acolyte3');
  f.after = true; await World.load('thornvale', 17, 13, 'up'); await wait(400); await fadeIn(1400);
  banner('Morning', 'What is left');
  Story.quest('Talk to Nana.');
}
async function talkNanaAfter() {
  const f = F();
  if (f.hoodGiven) return;
  await say('nana', 'sad', "There you are. I thought… I thought they'd taken you too.");
  await me('sad', "They took Ilya. And Oren — Oren is—");
  await say('nana', 'sad', "I know. Hush. You were brave. Brave is not the same as able. That comes later.");
  await say('nana', 'shock', "…Your eyes. There's blood under them. It woke, didn't it? I saw the light from here.");
  await say('nana', 'neutral', "Every Drag carries a gift in the blood, child. Fratenaptor's last secret. It sleeps until grief turns the key — and no two gifts are ever the same.");
  await say('nana', 'sad', "Mine woke the day my husband died. Yours woke tonight. I'm so sorry it had to be tonight.");
  await narr('Nana is sitting against the wall of her house. Her robe is dark at the side. Around her, the ground glitters with green dust.');
  await say('nana', 'neutral', "Listen to me now, because I won't get to say it twice. These mountains are not mountains. They are Fratenaptor's tomb.");
  await say('nana', 'neutral', "His body became the stone. And the stone remembers him — it drinks mana from the air itself and never runs dry. Drag stones.");
  await say('nana', 'sad', "One shard can turn a farmer into a soldier. A spear into a siege. That is why we hid. Not from fear of our eyes. From what men would do for these hills.");
  await say('nana', 'anger', "Someone sold that secret. One of ours. They came straight to the bridge, straight to the Heartstone under the ridge — the great stone, big as a cart.");
  await me('shock', "Where is it?");
  await narr('Nana opens her hand. Green dust, fine as flour, lifts off her palm and drifts away on the wind.');
  await say('nana', 'happy', "I smashed it. With Oren's hammer, while the giant was busy with you. Let the Crown chase the wind.");
  await say('nana', 'sad', "But the pieces will land somewhere. And wherever they land, people will kill for them. Remember that.");
  await narr('She presses a bundle of grey cloth into your hands. An old traveling hood, mended a hundred times.');
  await say('nana', 'neutral', "Your grandfather's. Too big for you now. One day it won't be. No one ever saw his eyes beneath it.");
  await say('nana', 'neutral', "Grow up first, child. Grow strong. Then find her. The wagons always pass through Ashford Hollow.");
  await say('nana', 'sad', "Out there, people will decide who you are before you open your mouth. Don't let them be right.");
  await narr('Her hand goes still in yours. The wind keeps carrying the green dust east, the same way the wagons went.');
  f.hoodGiven = true; f.nanaDead = true; G.S.hood = true; sfx('hood'); Story.heal(true);
  World.remove('nana');
  toast('You received <b style="color:#46ff95">Grandfather\'s Hood</b>. Tap <b>Hood</b> to raise or lower it.', 4200);
  // Kairo — the separation
  Music.play('sad');
  await World.addNpc({ id: 'kairo', sprite: 'kairo_kidb', x: 19, y: 13, dir: 'left' });
  await narr('Kairo stands behind you. Half his face is wrapped in strips of a burned shirt, and what shows beneath them is raw and red. Tamsin, Bo and Lark hold onto his sleeves.');
  await say('kairoKB', null, "I got eleven out of the west houses. Eleven. I couldn't get back in for the rest.");
  await say('kairoKB', null, "They burned children, {name}. While we sang. They didn't even look at our faces. Just our eyes.");
  await me('sad', "Kairo, your face—");
  await say('kairoKB', null, "Let it scar. I want to remember. Every time I look in water, I want to remember exactly what they are.");
  await say('kairoKB', null, "…Something happened to me in there. In the fire. My arm changed, and then it stopped burning. Like my body learned the fire and decided it wasn't allowed to hurt me anymore.");
  await say('kairoKB', null, "Your eyes did something on the bridge too. I saw. We're not what they say we are, {name}. We're MORE.");
  await say('kairoKB', null, "We're going up. Into the mountain, into the caves. We swore it — all of us, over the top. No grown-up is coming to save us. So we save ourselves.");
  const c = await ask('kairoKB', null, "Come with us. Please. You're my brother.", ["I'm going after Ilya.", "We should stay with Mei and Jun.", "Revenge won't bring them back."]);
  if (c === 0) await say('kairoKB', null, "…Of course you are. You always pick her.");
  else if (c === 1) await say('kairoKB', null, "Grown-ups are what got us here. I'm done listening to them.");
  else await say('kairoKB', null, "I didn't say revenge. …Not yet.");
  await say('mei', 'sad', "{name} is coming with me. South, to the coast, where no one knows our faces. Kairo — you're eleven. Come with us. All of you.");
  await say('kairoKB', null, "No.");
  await say('kairoKB', null, "…Forty-two to whatever, {name}. Don't you dare die before I win the next one.");
  await Cine.play(CINE.leaving(), { music: 'sad' });
  World.remove('kairo'); f.greenEclipse = true; f.split = true;
  Story.quest('Go with Mei — east across the bridge, then south.');
  UI.hud();
}
Story.prologueEnd = async function () {
  await fadeOut(800);
  G.S.chapter = 1; G.S.hood = true;
  await UI.chapterCard('CHAPTER I', 'Ashford Hollow');
  F().ashIntro = true;
  Story.quest('Ask around Ashford Hollow for where the Inquisition took Ilya.');
};

/* ---------------- ASHFORD HOLLOW ---------------- */
const FOLK_LINES = () => {
  const s = G.S.sus, f = F();
  const base = ['Fresh apples! Two coppers!', 'Did you hear? Cages on the north road.', 'Fine weather for a hanging, my uncle says.', 'Mind the guards, they\'re jumpy today.', 'The Inquisition pays silver for green eyes.', 'Pass the salt, Martha!', 'Bread\'s gone up again.', 'My cart wheel\'s cracked. Again.', 'Lovely day, isn\'t it?', 'Have you seen my goat?'];
  if (s >= 2) base.push('Someone saw green eyes by the fountain.', 'Lock your doors tonight.', 'Drags. In OUR town.');
  if (f.vossGone) base.push('Did you see Voss limping?');
  base.push('The dwarf at the guild hall says anyone can register. ANYONE. Even elves.', 'My boy lit the barn with his first spark. Fire-born, like his grandad.', 'Elves live four hundred years and still can\'t haggle.', 'D-rank at sixteen! My daughter! Lightning!');
  base.push('Green Eclipse? Never heard of them. …Don\'t tell anyone I said that.', 'The Crown pays gold for green rocks now. Green ROCKS.');
  return base;
};
SCENES.ashford = {
  title: 'Ashford Hollow', subtitle: 'Market town of the eastern vale', music: 'town', bd: 'town',
  crowd: { count: 30, areas: [[22, 19, 37, 25], [5, 20, 20, 23], [28, 27, 31, 37], [39, 20, 54, 23], [33, 33, 48, 34], [22, 19, 37, 25]], talk: talkFolk, lines: FOLK_LINES },
  async setup(W) { },
  npcs() {
    const f = F(); const L = [];
    L.push({ id: 'maren', x: 10, y: 16, dir: 'down', talk: talkMaren, witness: 1 });
    L.push({ id: 'tobb', x: 26, y: 19, dir: 'down', talk: talkTobb, witness: 1, ai: 'bark', barks: () => ['Tonics! Finest this side of the Ashen River!', 'Ten gold! A bargain!', 'Step right up, friend!'] });
    if (!f.pipGone) L.push({ id: 'pip', x: 14, y: 19, dir: 'down', talk: talkPip, ai: 'wander', area: [12, 18, 18, 20], witness: 1 });
    L.push({ id: 'pipmom', x: 17, y: 16, dir: 'down', talk: async () => say('pipmom', G.S.sus >= 2 ? 'anger' : 'neutral', G.S.sus >= 2 ? "Keep walking, stranger. My boy's had enough strangers." : "Have you seen a little boy with a rock named Gerald? Never mind. I hear him."), witness: 1 });
    if (!f.kessJoined && !f.kessLeft) L.push({ id: 'kess', x: 54, y: 18, dir: 'left', talk: talkKess, ai: 'turn', turns: ['left', 'down'] });
    if (!f.vossGone) { L.push({ id: 'voss', x: 29, y: 5, dir: 'down', talk: talkVoss, witness: 1 }); L.push({ id: 'guard', sprite: 'guard', x: 30, y: 5, dir: 'down', talk: async () => say('guard', 'neutral', "Captain does the talking. I just stand here and look tall."), witness: 1 }); }
    L.push({ id: 'cassel', x: 31, y: 24, dir: 'down', talk: talkCassel, ai: 'bark', barks: () => ['Report the green-eyed!', 'The Drag-blood sleeps — but it WAKES!', 'Silver for every Drag delivered!'], witness: 1 });
    L.push({ id: 'hoshi', x: 23, y: 20, dir: 'down', talk: talkHoshi });
    L.push({ id: 'bram', sprite: 'innkeep', x: 43, y: 16, dir: 'down', talk: talkBram, witness: 1 });
    if (G.S.sus >= 3 && !f.sableBeaten) L.push({ id: 'sable', sprite: 'hunter', x: 47, y: 22, dir: 'left', talk: talkSable, witness: 1 });
    L.push({ id: 'patrol', sprite: 'guard', x: 22, y: 26, dir: 'right', ai: 'patrol', route: [[22, 26], [37, 26], [37, 19], [21, 19]], talk: async () => say('guard', 'neutral', G.S.sus >= 3 ? "Hood. Off. …No? Then move along before I make it an order." : "Move along, citizen."), witness: 1 });
    return L;
  },
  exits: [
    { x: 28, x2: 31, y: 0, to: 'mill', tx: 17, ty: 25, dir: 'up', msg: 'Captain Voss blocks the north road.', when: () => !F().vossGone },
    { x: 28, x2: 31, y: 0, to: 'mill', tx: 17, ty: 25, dir: 'up', when: () => F().vossGone },
    { x: 59, y: 20, y2: 23, to: 'woods', tx: 2, ty: 17, dir: 'right' },
    { x: 28, x2: 31, y: 41, msg: "Turning back isn't an option. Ilya is somewhere ahead." }
  ],
  tiles: {
    '9,14': async () => narr(F().marenKnows ? "Maren's clinic. The door is shut. You don't knock." : "Maren's clinic. You hear coughing inside."),
    '16,14': async () => narr(F().pipGone ? 'A small face watches you from behind the curtain. It waves.' : 'A small house. Someone inside is humming.'),
    '35,14': async () => narr("Tobb's Goods. The real stock is out at his stall in the market."),
    '24,9': async () => narr('The guardhouse. A notice is nailed to the door: WANTED — ANY PERSON OF GREEN EYE. REWARD IN SILVER.'),
    '42,14': () => innDoor(),
    '55,16': async () => narr(F().kessJoined ? "Kess's house. Shuttered, dark, and now empty." : 'A dark little house at the edge of town. Every shutter is nailed closed.'),
    '29,21': () => fountain(), '30,21': () => fountain(), '29,20': () => fountain(), '30,20': () => fountain(),
    '23,18': async () => narr('Apples, pears, and a hand-painted sign: NO CREDIT. NO DRAGS.'), '33,18': async () => narr('Bolts of cloth. The merchant watches your hood, not your coin.'), '36,18': async () => narr('Root vegetables. A cat sleeps on the turnips.')
  },
  async onEnter() {
    const f = F();
    if (f.ashIntro && !f.ashIntroDone) {
      f.ashIntroDone = true;
      await narr('Ashford Hollow. Market day. More people than you have ever seen in one place.');
      await narr('Every one of them would turn and stare if they saw your eyes.');
      if (!G.S.hood) { G.S.hood = true; UI.hud(); }
      toast('Keep your hood up to blend in. Lower it, and people will react — some badly, some… not.', 5000);
      if (!G.S.side) G.S.side = 'The Adventurers\' Guild (north-east house) registers anyone who can do the job. Registered adventurers travel without papers.';
    }
  }
};
async function fountain() {
  await narr('A three-tiered fountain. Someone scratched a dragon\'s eye into the stone basin. Someone else tried very hard to scrub it out.');
  if (F().marenKnows) await narr('This is where they hanged him. The little girl\'s father.');
  if (G.S.q && G.S.q.gerald === 'active') await geraldFound();
}
async function talkFolk(e) {
  const s = G.S.sus; CHAR[e.id] = { name: e.kid ? 'Child' : 'Townsperson', sprite: e.sprite };
  const sp = t => say(e.id, null, t);
  if (!G.S.hood) {
    e.alarmed = true; e.ai = 'flee'; e.fleeFrom = [G.S.x, G.S.y]; e.alarmT = 6000;
    await sp(e.kid ? '"Mister! Are your eyes magic? Can you shoot fire out of them?!"' : pick(['"Stay back! Don\'t you look at me with those eyes!"', '"Guards! GUARDS!"', '"I— I don\'t want any trouble. Please."', '"…They told us you\'d have horns. You don\'t have horns."']));
    return;
  }
  const lines = s >= 3 ? ['"Did you hear? There\'s a Drag loose in the Hollow."', '"Why\'s your hood up indoors? …Outdoors. Whatever."', '"I\'m keeping my children inside till the Inquisition sweeps the town."']
    : ['"Morning, traveler. Market\'s busy today."', '"The Inquisition\'s wagons came through two nights back. Cages. Children in some."', '"Don\'t mind Brother Cassel, he shouts at everyone."', '"Old Hoshi on the bench remembers the days before the purges. Ask him, if you\'ve got an hour."', '"Tobb\'s tonics are overpriced but they work."', '"Captain Voss closed the north road. Inquisition business."', '"My grandmother says Drags were heroes once. My grandmother also talks to her chickens."', '"Rebels burned an Inquisition wagon on the south road. Green Eclipse, they call themselves."', '"They say the rebel leader has a burned face. And green eyes."', '"The Dread General rode through last month. My horse still won\'t eat."'];
  await sp(pick(lines));
}
async function talkMaren() {
  const f = F();
  if (!G.S.hood && !f.marenKnows) {
    f.marenKnows = true; f.metMaren = true;
    await say('maren', 'neutral', "Let me see that cut, traveler—");
    await say('maren', 'shock', "…Green.");
    await say('maren', 'sad', "I saw eyes like yours once. A little girl, years back. They hanged her father in the square. Right by that fountain.");
    Story.heal(true);
    await say('maren', 'neutral', "Sit. I'll treat you. Here, on the porch.");
    const c = await ask('maren', 'neutral', "The door stays closed.", ['Why?', '…Thank you.']);
    if (c === 0) await say('maren', 'shame', "Because I have six patients inside who'd rather bleed out than share a roof with you. I hate that. But I choose who I can save, every single day.");
    else await say('maren', 'sad', "Don't thank me. Kindness with a closed door isn't much kindness.");
    await say('maren', 'neutral', "I won't tell anyone what you are. That much I can do.");
    if (!f.learnedMill) await marenMill();
    return;
  }
  if (!f.metMaren) {
    f.metMaren = true; Story.heal(true);
    await say('maren', 'happy', "Another traveler with road-dust up to the knees. Sit, sit. Let me look at you.");
    await say('maren', 'neutral', "There. Patched. You're hunting something — I can tell by the way you stand.");
    const c = await ask('maren', 'neutral', 'Well?', ['My sister. The Inquisition took her.', 'Just passing through.']);
    if (c === 0) await marenMill(); else await say('maren', 'neutral', "Mm. Everyone's passing through. Mind the east woods — the beasts are bold this year.");
    return;
  }
  Story.heal(true);
  if (f.marenKnows) await say('maren', G.S.sus >= 3 ? 'sad' : 'neutral', G.S.sus >= 3 ? "The whole town's whispering about green eyes. It wasn't me. I need you to know that." : 'Porch again. Sit. …There. Good as I can make you.');
  else await say('maren', 'happy', ['Patched up again. Try not to bleed so much.', 'Beasts again? Hold still.', "There. And eat something — you're all bones."][G.S.steps % 3]);
  toast('HP & MP restored.');
  if (!f.learnedMill) { const c = await ask('maren', 'neutral', 'Anything else?', ['Seen any Inquisition wagons?', 'No. Thank you.']); if (c === 0) await marenMill(); }
}
async function marenMill() {
  F().learnedMill = true;
  await say('maren', 'sad', "…The Inquisition's wagons came through two nights back. Cages on the back. Children in some of them.");
  await say('maren', 'neutral', "They took the north road to the old mill. Captain Voss closed the gate behind them.");
  await say('maren', 'sad', "Whatever you're planning, child — this town already has enough ghosts.");
  Story.quest('The wagons went north to the Old Mill. Get past Captain Voss at the north road.');
}
async function talkTobb() {
  const f = F();
  if ((f.tobbKnows || !G.S.hood) && !f.tobbReveal) {
    if (!f.tobbKnows) { f.tobbKnows = true; Story.addSus(1); }
    f.tobbReveal = true; f.metTobb = true;
    if (f.rookSaw) await say('tobb', 'shock', "Rook came screaming into town about green eyes in the woods. So that was… you.");
    else await say('tobb', 'shock', "Welcome to— oh. Oh. Your eyes.");
    await say('tobb', 'happy', "No, no, it's fine! I'm not one of THOSE people. Some of my best customers are… well, not Drags. But I'm sure some of you are lovely.");
    await say('tobb', 'shame', "Prices are a little different for, ah, higher-risk customers. Nothing personal. Insurance.");
  } else if (!f.metTobb) {
    f.metTobb = true;
    await say('tobb', 'happy', "Welcome, welcome! Tobb's Goods — finest tonics this side of the Ashen River!");
    await say('tobb', 'neutral', "Careful on the roads, friend. Heard there's Drags about. Nasty business. No offense to anyone, of course.");
  }
  while (true) {
    const tp = f.tobbKnows ? (f.crateDone ? 20 : 30) : (G.S.sus >= 3 ? 15 : 10), ep = tp + 6;
    const opts = [`Buy Tonic (${tp}g)`, `Buy Ether (${ep}g)`];
    if (f.hasCrate && !f.crateDone) opts.push('Return the crate'); else if (!f.crateQuest) opts.push('Any work?');
    if (Stones.st().inv.length && !Stones.st().sealed && f.crateDone) opts.push('Forged Registry seals (60g)');
    opts.push('Leave');
    const c = await ask('tobb', f.tobbKnows ? 'shame' : 'happy', f.tobbKnows ? 'Well? Gold first. Customer… policy.' : `What can I get you? (You have ${G.S.gold}g)`, opts);
    const o = opts[c];
    if (o.startsWith('Forged')) { if (G.S.gold >= 60) { G.S.gold -= 60; Stones.st().sealed = true; await say('tobb', 'shame', "Shh! Crown wax, Crown press, Crown ribbon. Perfect copies. My cousin works at the Registry. My OTHER cousin. Registry patrols will wave you through now."); } else await say('tobb', 'neutral', 'Sixty gold. Forgery is an art, friend.'); continue; }
    if (o.startsWith('Buy')) {
      const isT = o.includes('Tonic'), price = isT ? tp : ep;
      if (G.S.gold >= price) { G.S.gold -= price; G.S.items[isT ? 'tonic' : 'ether']++; sfx('coin'); UI.hud(); await say('tobb', 'happy', `Pleasure doing business! That's ${G.S.items[isT ? 'tonic' : 'ether']} in your bag.`); }
      else await say('tobb', 'neutral', "Short on coin, I see. I can't run a charity.");
    } else if (o === 'Any work?') {
      f.crateQuest = true;
      await say('tobb', 'anger', 'Bandits hit my cart on the east road. Took a whole crate of tonics! Bring it back and I\'ll pay 40 gold and three tonics.');
      if (f.tobbKnows) await say('tobb', 'shame', "I'd ask the guard, but they won't go in those woods. You people are, ah, hardier. Supposedly.");
      G.S.side = "Recover Tobb's crate from the bandits in the East Woods (east road)."; toast("Side quest: Tobb's stolen crate");
    } else if (o === 'Return the crate') {
      f.crateDone = true; f.hasCrate = false; G.S.gold += 40; G.S.items.tonic += 3; G.S.side = ''; sfx('coin');
      if (f.tobbKnows) {
        await say('tobb', 'shock', 'You… brought it back. Every bottle.');
        await say('tobb', 'shame', "I didn't think your kind would— I mean… Here. Forty gold, three tonics. And tonics are twenty for you now. Best I can do. People watch my stall, you understand.");
      } else {
        await say('tobb', 'happy', 'My crate! Every bottle! You\'re a saint, friend. An absolute saint!');
        await say('tobb', 'happy', 'Forty gold and three tonics, as promised. If only everyone were as decent as you — instead of, you know. Drags and bandits.');
      }
      if (Story.gainXp(25)) toast('LEVEL UP! Lv ' + G.S.lvl);
    } else break;
  }
}
async function talkPip(e) {
  const f = F();
  if (!G.S.hood) {
    await say('pip', null, 'WHOA! Your eyes are GLOWING! Like fireflies!');
    await say('pip', null, "Mama says Drags eat babies. Do you eat babies? You don't LOOK like you eat babies.");
    await narr('A door bangs open. Pip\'s mother storms out and yanks him behind her.');
    await say('pipmom', 'anger', 'PIP. Inside. NOW.');
    await say('pipmom', 'anger', 'Stay away from my son. I mean it.');
    await say('pip', null, 'But Mama, {they}\'s nice—');
    await narr('The door slams. A moment later, a small face appears at the window. It waves.');
    f.pipGone = true; World.remove('pip'); Story.addSus(.5); return;
  }
  if (!f.metPip) {
    f.metPip = true;
    const c = await ask('pip', null, "Why do you wear a hood when it's not even raining?", ['To keep the sun off.', "I'm hiding my eyes."]);
    if (c === 0) await say('pip', null, "Oh. Okay! Wanna see my rock? It's a normal rock. I named it Gerald.");
    else await say('pip', null, "Mama says Drags wear hoods so you can't see their eyes. Are you a Drag? …You'd be the first one I ever met!");
    return;
  }
  await say('pip', null, ['Gerald says hi. Gerald is my rock.', "When I grow up I'm gonna be a knight. Or a frog.", "Mama says don't talk to strangers. You're not strange though."][G.S.steps % 3]);
}
async function talkKess() {
  const f = F();
  if (f.kessRefused) { await say('kess', 'anger', "Get away from me. You've done enough."); return; }
  if (G.S.hood) {
    if (!f.metKess) {
      f.metKess = true;
      const c = await ask('kess', 'neutral', 'Lost? The inn\'s that way. Go bother it.', ['Tinted glasses at dusk?', 'Sorry. Leaving.']);
      if (c === 0) { await say('kess', 'shame', 'And a hood with no rain. We\'ve all got our reasons. Walk on.'); await narr('She never looks up. Her lenses never leave her face.'); }
    } else await say('kess', 'neutral', 'Still here? People who linger get noticed. Trust me.');
    return;
  }
  f.kessKnows = true;
  await say('kess', 'shock', 'Are you INSANE? Cover your—');
  await narr('She grabs your sleeve and drags you behind the house. Then she lowers her glasses.');
  await narr('Her eyes are green. Dim, like coals she\'s spent years smothering.');
  await say('kessE', 'anger', 'Twelve years. Twelve years I\'ve kept my head down in this town. And you stroll in burning like a lighthouse.');
  if (G.S.sus >= 3) {
    f.kessRefused = true;
    await say('kessE', 'anger', "Everyone's talking about green eyes. Now they'll check every face in the Hollow — mine too. I can't help you. Get away from me.");
    Story.quest('Get past Captain Voss at the north road — any way you can.'); return;
  }
  const c = await ask('kessE', 'neutral', 'What do you want?', ['My sister. The Inquisition took her.', 'I want to stop hiding.']);
  if (c === 1) await say('kessE', 'anger', "Hiding is how I'm still breathing. Don't you dare make it sound cowardly.");
  await say('kessE', 'sad', '…The cages went to the old mill, north. Halvard runs it. He\'s not like the others. He believes.');
  await say('kessE', 'neutral', "Voss guards the north road. He's not cruel — just obedient. I can pull him away. Once.");
  const c2 = await ask('kessE', 'neutral', "And then you're on your own.", ['Come with me.', 'Thank you. That\'s enough.']);
  if (c2 === 0) {
    await say('kessE', 'shock', '…What?');
    await me('neutral', "You know this town. You know how to hide. And you're tired of it — I can see it.");
    await say('kessE', 'sad', "…");
    await say('kessE', 'happy', "Fine. Not for you. For the kid with the ribbon. And because if I stay here, I'll still be hiding when I'm Maren's age.");
    f.kessJoined = true; f.learnedMill = true; f.kessHelp = true;
    await Story.join('kess');
    Story.quest('Kess will distract Captain Voss. Go to the north road and talk to him.');
  } else {
    f.kessHelp = true; f.learnedMill = true;
    await say('kessE', 'neutral', "Don't make me regret this. Go to the north road. When you talk to Voss, I'll do the rest.");
    Story.quest('Kess will distract Captain Voss. Go to the north road and talk to him.');
  }
}
async function talkCassel() {
  const f = F();
  if (!G.S.hood) {
    await say('cassel', 'shock', "Green… GREEN! Brothers! Sisters! The Drag-blood walks among you!");
    Story.addSus(1.5); World.shake = 300; sfx('alarm');
    if (G.S.sus >= 4 && !f.casselFight) { f.casselFight = true; await say('guard', 'anger', 'You heard the Brother. Take the Drag!'); const r = await Battle.start({ enemies: ['acolyte', 'bandit'], witness: .5, bd: 'town' }); if (r === 'lose') await Story.defeat(); }
    return;
  }
  if (!f.metCassel) {
    f.metCassel = true;
    await say('cassel', 'happy', "Brother! Sister! Have you made your report? Every green eye delivered is a soul saved from the dragon!");
    const c = await ask('cassel', 'neutral', 'Silver for every Drag. Think of it — silver, and a clean conscience.', ['Saved how?', 'What happens to them?', 'Not interested.']);
    if (c === 0) await say('cassel', 'happy', "Corrected! Purified! At Greyspire, the blood is… quieted. Inquisitor Halvard himself oversees it. And the Dread General guards the gate — the Crown's own monster against the dragon's.");
    else if (c === 1) await say('cassel', 'shame', "They are… made safe. That is all you need to know, friend. That is all any of us need to know.");
    else await say('cassel', 'anger', 'Then you are part of the problem. The fire spreads through indifference!');
    return;
  }
  await say('cassel', 'neutral', G.S.sus >= 3 ? 'There is a Drag in this town. I can SMELL the smoke on them.' : 'Report the green-eyed! The flame spreads through silence!');
}
async function talkHoshi() {
  const f = F();
  if (f.hoshiDone) { await say('hoshi', 'neutral', G.S.hood ? "Hm? Oh, the stone. Look for the stone, east woods. Past the bend." : "…Your eyes are just like hers were. My wife's. Go on. Find your sister."); return; }
  f.hoshiDone = true;
  await say('hoshi', 'happy', "Sit, sit. Nobody sits with old Hoshi anymore. They think I'm cracked.");
  await say('hoshi', 'neutral', 'When I was a boy, before the purges, there were green-eyed folk in this town. Smiths. A baker. My wife, gods rest her.');
  if (!G.S.hood) await say('hoshi', 'sad', '…You have her eyes, you know. Exactly that green. Don\'t worry. I\'ve told no one anything in forty years.');
  await say('hoshi', 'neutral', "The priests say the Drags worshipped Fratenaptor. But there's a stone in the east woods — old, older than the Inquisition — and it tells a different story.");
  await say('hoshi', 'neutral', 'Go read it, if you have a mind to. Past the first bend, north. The priests tried to break it once. It broke their hammers.');
  await say('hoshi', 'sad', "And mind the Crown's surveyors. They've been buying up every green pebble in the vale. Paying gold. Nobody pays gold for pebbles unless the pebbles are worth blood.");
  Story.quest(G.S.quest); toast('Old Hoshi mentioned a stone in the East Woods.');
}
async function talkBram() {
  const f = F();
  if (G.S.sus >= 3) { await say('bram', 'anger', "We're full. We're full for you, specifically. Every night. Forever."); return; }
  if (!G.S.hood) { await say('bram', 'shock', "Out. OUT. I've a family. Take your eyes somewhere else."); Story.addSus(.5); return; }
  await say('bram', 'happy', 'Welcome to the Crooked Lantern! Warm beds, cold ale, and no questions asked. Mostly.');
}
async function innDoor() {
  const f = F();
  await narr('The Crooked Lantern Inn. Someone carved NO DRAGS into the doorframe — deep, old cuts, worn smooth by hands.');
  if (G.S.sus >= 3) { await narr('The innkeeper sees you through the window and slams the shutters.'); return; }
  if (!G.S.hood) { await narr('The innkeeper takes one look at your eyes and taps the carving.'); return; }
  const c = await ask(null, null, 'Rest here for 15 gold? (Restores HP & MP and saves.)', ['Rest (15g)', 'Leave']);
  if (c === 0) { if (G.S.gold >= 15) { G.S.gold -= 15; await fadeOut(600); Story.heal(true); save(); await fadeIn(600); await narr('You keep your hood on all night. You sleep badly, but you sleep. (Game saved.)'); } else await narr('Not enough gold.'); }
}
async function talkSable() {
  const f = F();
  await say('sable', 'neutral', 'Hood. Hands. Slowly. I hunt Drags for a living, and you, friend, smell like a payday.');
  const c = await ask('sable', 'neutral', 'Come quietly and I\'ll make sure they feed you on the way to Greyspire.', ['Fight.', 'Walk away.']);
  if (c === 1) { await say('sable', 'happy', "Walk then. I'll be watching. I'm always watching."); return; }
  const r = await Battle.start({ enemies: ['bandit', 'bandit'], bd: 'town', witness: .5, intro: 'Sable and her hired blades attack!' });
  if (r === 'lose') { await Story.defeat(); return; }
  if (r === 'win') { f.sableBeaten = true; World.remove('sable'); await say('sable', 'shame', '…Hah. They never said the Drags could fight. Keep the money. I\'ll find easier prey.'); }
}
async function talkVoss() {
  const f = F();
  if (f.kessHelp) {
    await narr('Before Voss can speak, Kess comes sprinting up the road.');
    await say('kessE', 'shock', 'Captain! The inn stables — fire! The horses are trapped!');
    await say('voss', 'shock', 'What? Blast it — nobody touches this gate!');
    await narr('Voss runs. The guard runs after him. Kess passes you without slowing down.');
    if (f.kessJoined) await say('kessE', 'happy', "No one was in the stable. I'm not a monster. Let's go, before he comes back.");
    else { await say('kessE', 'neutral', 'Go. And keep your eyes down.'); f.kessLeft = true; }
    f.vossGone = true; World.remove('voss'); World.remove('guard'); Story.quest('Take the north road to the Old Mill.'); return;
  }
  if (!G.S.hood && !f.vossKnows) { f.vossKnows = true; Story.addSus(1); }
  if (f.vossKnows || G.S.sus >= 3) {
    await say('voss', 'neutral', G.S.hood ? "Hood won't help you now. Half the Hollow's talking about green eyes." : 'Green eyes. So the rumors are true.');
    await say('voss', 'sad', "I don't hate you, Drag. I don't have to. The law does that for me. Hands where I can see them.");
    const c = await ask('me', 'neutral', 'What do you do?', ['Raise your hands.', 'Fight.']);
    if (c === 0) { await say('voss', 'neutral', "…You're not resisting. Huh. Get out of my sight. But you're not going north."); return; }
    return fightVoss();
  }
  const c = await ask('voss', 'neutral', 'Road\'s closed. Inquisition business. Turn around, traveler.', ["What's up north?", 'Let me through.', '[Force your way past]']);
  if (c === 0) await say('voss', 'neutral', 'The old mill. Not my concern. Not yours either.');
  else if (c === 1) await say('voss', 'sad', "I've got orders. Orders don't care what I think — and I've stopped thinking.");
  else return fightVoss();
}
async function fightVoss() {
  const f = F(); Story.addSus(1);
  const r = await Battle.start({ enemies: ['voss', 'acolyte'], noFlee: true, witness: 1, bd: 'town', intro: 'Captain Voss raises his spear. "Your choice, then."' });
  if (r === 'lose') { await Story.defeat(); return; }
  await say('voss', 'sad', '…Enough. Enough.');
  if (!G.S.hood) await say('voss', 'shame', "I've seen Drags hanged for less than what you just did. And you're letting me breathe.");
  await say('voss', 'neutral', "Go north, then. I didn't see you. I'm too tired to have seen anything.");
  await narr('Voss limps off toward the barracks.');
  f.vossGone = true; f.vossBeaten = true; World.remove('voss'); World.remove('guard'); Story.quest('Take the north road to the Old Mill.');
}

/* ---------------- EAST WOODS ---------------- */
SCENES.woods = {
  title: 'The East Woods', subtitle: 'Where the old stone sleeps', music: 'woods', bd: 'forest',
  encounters() { const r = Math.random();
    if (G.S.rank && r < .55) { const L = [['m_goblin'], ['m_goblin', 'm_goblin'], ['m_ratfolk', 'm_ratfolk'], ['m_gourd'], ['m_gourd', 'm_goblin'], ['lupine', 'm_goblin'], ['m_goblin', 'm_goblin_shaman']]; if (Power.now().i >= 2) L.push(['m_tusker'], ['m_tusker', 'lupine']); return { enemies: L[Math.floor(Math.random() * L.length)], bd: 'forest' }; }
    return { enemies: r < .5 ? ['lupine'] : r < .85 ? ['lupine', 'lupine'] : ['lupine', 'lupine', 'lupine'], bd: 'forest' }; },
  npcs() {
    const f = F(); const L = [];
    if (!f.rookBeaten) { L.push({ id: 'rook', x: 42, y: 17, dir: 'left', talk: talkRook }); L.push({ id: 'bandit', x: 40, y: 18, dir: 'left', talk: async () => say('bandit', 'anger', "Talk to the boss, hood. I just stab people.") }); }
    if (!f.millDone) {
      L.push({ id: 'dace', sprite: 'ge_dace', x: 13, y: 8, dir: 'left', talk: () => geTalk('dace'), ai: 'turn', turns: ['left', 'down'] });
      L.push({ id: 'sefa', sprite: 'ge_sefa', x: 11, y: 10, dir: 'down', talk: () => geTalk('sefa') });
      L.push({ id: 'wren', sprite: 'ge_wren', x: 14, y: 10, dir: 'left', talk: () => geTalk('wren'), ai: 'turn', turns: ['left', 'up'] });
      L.push({ id: 'corran', sprite: 'ge_corran', x: 8, y: 10, dir: 'right', talk: () => geTalk('corran') });
    }
    if (!f.scoutMet || !f.millDone) L.push({ id: 'scout', sprite: 'lark', x: 12, y: 9, dir: 'down', talk: talkScout, ai: 'turn', turns: ['down', 'left', 'right'] });
    if (!f.alphaBeaten) L.push({ id: 'alpha', sprite: 'lupine_alpha', x: 28, y: 26, dir: 'down', ai: 'turn', turns: ['down', 'left', 'right'], talk: talkAlpha });
    if (!f.alphaBeaten) L.push({ id: 'liora', sprite: 'liora_e', x: 27, y: 25, dir: 'right', talk: talkAlpha });
    return L;
  },
  exits: [{ x: 0, y: 16, y2: 18, to: 'ashford', tx: 58, ty: 21, dir: 'left' }],
  tiles: {
    '9,6': () => shrine(), '8,6': () => shrine(), '10,6': () => shrine(), '9,7': () => shrine(),
    '43,16': () => crate(),
    '8,24': () => spring(), '9,24': () => spring(), '10,24': () => spring(), '11,24': () => spring(), '12,25': () => spring(), '7,25': () => spring()
  },
  async onEnter() { if (!F().woodsTip) { F().woodsTip = true; toast('Beasts hide in the tall grass. The dirt paths are safe.', 3500); } if (G.S.q && G.S.q.toll === 'active') await tollMen(); }
};
async function spring() { Story.heal(true); await narr('Cold spring water. You feel your strength return.'); }
async function shrine() {
  const f = F();
  if (f.shrineRead) { await narr('Seven figures. One chained beast. Your eyes still tingle when you look at it.'); return; }
  f.shrineRead = true;
  await narr('An ancient stone disc, choked with moss. You scrape some away.');
  await narr('Carvings: seven figures with eyes of inlaid green glass stand in a ring around a vast, coiled dragon.');
  await narr('The dragon is wrapped in chains. The seven are holding the chains.');
  await me('shock', "They weren't worshipping Fratenaptor…");
  await me('anger', '…They were BINDING him.');
  await narr('From somewhere — not the woods, not the stone — a small voice you know better than your own.');
  await say('ilya', null, '"Did you know dragons can\'t hide their eyes either? Nana told me. That\'s why they\'re brave. They have to be."');
  await me('sad', '…I know, Ilya. I know.');
  sfx('art'); await narr('Your eyes flare on their own. Something old wakes in your blood.');
  if (!G.S.arts.includes('ruin')) G.S.arts.push('ruin');
  await narr('In the stream beneath the stone, something sings. You reach into the cold water and come up holding a blue-green stone the size of a heart. A MEDIUM stone.');
  Stones.give('riverheart');
  toast('New Drag Art learned: <b style="color:#46ff95">VERDANT RUIN</b> — hits every enemy.', 4000);
}
async function talkRook() {
  const f = F();
  const c = await ask('rook', 'neutral', 'Well, well. A hood in the woods. You lost, or looking to lose something?', ["That crate is Tobb's.", 'Just passing.']);
  if (c === 1) { await say('rook', 'neutral', 'Then pass. Quietly.'); return; }
  await say('rook', 'anger', "Tobb? That fat liar owes me three months' wages. Want his crate? Come and take it.");
  const r = await Battle.start({ enemies: ['rook', 'bandit'], bd: 'camp', intro: 'Rook draws a rusty blade!' });
  if (r === 'lose') { await Story.defeat(); return; }
  if (r === 'flee') return;
  f.rookBeaten = true; f.houndKnown = true; World.remove('rook'); World.remove('bandit');
  await say('rook', 'anger', 'You know who I run for? Varro Kade. The Gilded Hound. He\'ll hear about this, hood. He hears about EVERYTHING.');
  if (G.S.hood === false) {
    await say('rook', 'shock', "Your eyes— you're a DRAG! …Oh, the whole Hollow's gonna hear about this!");
    await narr('Rook crashes off through the trees — toward town.');
    f.rookSaw = true; f.tobbKnows = true; Story.addSus(1.5);
  } else {
    await say('rook', 'shame', 'Alright, alright! Take the stupid crate! Tell Tobb he still owes me.');
    await narr('Rook limps off into the woods.');
  }
  if (!f.crateDone) G.S.side = "Grab Tobb's crate at the bandit camp.";
}
async function crate() {
  const f = F();
  if (!f.rookBeaten) { await say('rook', 'anger', 'Hands off. Talk to me first, hood.'); return; }
  if (f.crateTaken) { await narr('An empty patch of trampled grass where the crate was.'); return; }
  f.crateTaken = true; f.hasCrate = true; sfx('coin');
  await narr("You hoist Tobb's crate onto your shoulder. Bottles clink inside — and under the bottles, wrapped in straw, two small stones that glow green.");
  await me('shock', "…D-stones. Unregistered. That's a hanging offense. Tobb, you liar.");
  Stones.give('fang'); Stones.give('echo');
  G.S.side = 'Bring the crate back to Tobb in Ashford Hollow (market stall).';
}
async function talkAlpha() {
  const f = F();
  await Cine.play(CINE.liora());
  await say('liora', 'anger', "Move. That one's mine.");
  const c0 = await ask('me', 'blush', '…', ["I'm not moving.", 'Let me help.']);
  await say('liora', 'neutral', c0 === 0 ? "Then don't die where I have to step over you." : "Fine. Keep up."); if (c0 === 1) Story.heart(1);
  const r = await Battle.start({ enemies: ['lupine_alpha', 'lupine', 'lupine'], allies: ['liora'].concat(G.S.party), bd: 'forest', intro: 'The Lupine Alpha howls! Liora fights at your side.' });
  if (r === 'lose') { await Story.defeat(); return; }
  if (r !== 'win') return;
  f.alphaBeaten = true; f.lioraMet = true; World.remove('alpha'); G.S.items.ether += 2; toast("Found <b>2 Ethers</b> in the beast's den.");
  await narr('She cleans her spear in the snowmelt before she says a word to you.');
  await say('liora', 'neutral', "You keep your blade sheathed until the cut. My mother told me only one swordsman alive fought like that — and he was supposed to be dead. Who trained you?");
  const c = await ask('me', 'blush', '…', ['Who are you?', 'An old man with one arm.', "You're… incredible with that spear."]);
  if (c === 0) await say('liora', 'neutral', 'Liora. That\'s all you get. Now — who trained you?');
  if (c === 2) { await say('liora', 'blush', "…Don't. Every Drag between here and the mountains has tried that line."); await say('liora', 'shame', "…Answer the question."); Story.heart(1); }
  if (c === 1) Story.heart(1);
  await me('neutral', 'An old man in the Realm of No Return. One arm. He lost the other to Dread.');
  await say('liora', 'shock', "…The Sword Saint is ALIVE? Vane? The man who lasted four strokes against Dread?");
  await say('liora', 'anger', "Dread killed my mother. In our doorway, while I watched from under the stairs. I was eight.");
  await say('liora', 'anger', "I've spent every day since getting good enough to put this spear through his heart. I'm almost there.");
  const c2 = await ask('liora', 'neutral', "So don't get in my way, Sword Saint's student.", ["Revenge isn't the way. Someone taught me that.", "Then we want the same man.", "Let me help you."]);
  if (c2 === 0) await say('liora', 'anger', "Easy to say when your monster only took your sister. Mine took everything. Come back when you've buried someone.");
  else if (c2 === 1) { await say('liora', 'neutral', "No. You want your sister. I want his heart. Only one of those ends at Dread."); Story.heart(1); }
  else { await say('liora', 'happy', "…Ha. You're sweet. I don't need help. I work alone. Kairo's been asking for three years and the answer's still no."); Story.heart(1); }
  if (c2 === 0) F().lioraRevenge = true;
  await say('liora', 'neutral', "Don't follow me.");
  await narr('She\'s gone between the trees before you can answer. You realize you\'re still staring at the place where she was.');
  World.remove('liora');
}

/* ---------------- OLD MILL ---------------- */
SCENES.mill = {
  title: 'The Old Mill', subtitle: 'Smoke and incense', music: 'night', bd: 'mill',
  async setup(W) {
    W.tint = 'rgba(25,10,50,.45)';
    W.lights.push({ x: 15 * 32 + 16, y: 15 * 32 - 30, r: 70, c: '255,210,120' }, { x: 19 * 32 + 16, y: 15 * 32 - 30, r: 70, c: '255,210,120' });
  },
  npcs() {
    const f = F(); const L = [];
    if (!f.millGuards) { L.push({ id: 'acolyte', x: 17, y: 18, dir: 'down', talk: millGuards }); L.push({ id: 'acolyte2', sprite: 'acolyte', x: 16, y: 18, dir: 'down', talk: millGuards }); }
    if (!f.halvardBeaten) L.push({ id: 'halvard', x: 17, y: 11, dir: 'down', talk: () => halvardEvent() });
    return L;
  },
  exits: [{ x: 17, y: 27, to: 'ashford', tx: 29, ty: 2, dir: 'down' }],
  step(x, y) {
    const f = F();
    if (!f.millGuards && y <= 20 && y >= 19) { Story.run(millGuards); return true; }
    if (f.millGuards && !f.halvardBeaten && y <= 13) { Story.run(halvardEvent); return true; }
  },
  tiles: { '11,11': () => cage(), '23,11': () => cage(), '11,14': () => cage(), '17,8': async () => narr(F().halvardBeaten ? 'The mill is empty now. Straw, chains, and the smell of old fear.' : 'The door is barred from the inside.') },
  async onEnter() { if (!F().millIn) { F().millIn = true; await narr('The air smells of smoke and incense. Somewhere ahead, someone is singing a hymn.'); } }
};
async function cage() { await narr('An empty cage. Tiny scratch marks on the bars, low down — the height of a child.'); if (!F().ribbonSeen) await narr('In one corner, scratched very carefully: a little dragon.'); }
async function millGuards() {
  const f = F(); if (f.millGuards) return;
  await say('acolyte', 'anger', 'Halt! This is consecrated ground. No one passes without the Inquisitor\'s leave.');
  const r = await Battle.start({ enemies: ['acolyte', 'acolyte', 'bandit'], noFlee: true, bd: 'mill' });
  if (r === 'lose') { await Story.defeat(); return; }
  f.millGuards = true; World.remove('acolyte'); World.remove('acolyte2');
}
async function halvardEvent() {
  const f = F(); if (f.halvardBeaten) return;
  World.player.dir = 'up';
  await say('halvard', 'happy', 'Green eyes in the dark. I wondered when you\'d come.');
  await say('halvard', 'neutral', "The girl with the ribbon. Your sister. Five years, and she never once took it off. Not when we asked. Not when we didn't ask.");
  await say('halvard', 'happy', "And the quiet boy — Nix. He prays now. Very sincerely. You'd hardly know him.");
  const c = await ask('halvard', 'neutral', "You think this is hatred. It isn't. Fratenaptor's blood doesn't sleep. One day it wakes — in her, in you — and the world burns. I am the firebreak.", ['Where is she?', "You're wrong about us."]);
  if (c === 0) await say('halvard', 'happy', "Somewhere you can't follow. Not with those eyes.");
  else await say('halvard', f.shrineRead ? 'anger' : 'neutral', f.shrineRead ? 'The stone in the east woods? Old carvings. Half-truths. I\'ve read the real texts.' : 'Then prove it. Without the fire.');
  if (G.S.party.includes('kess')) await say('kessE', 'anger', "I've heard you sing over the cages at night, Halvard. Let's hear you sing now.");
  const r = await Battle.start({ enemies: ['halvard', 'acolyte'], noFlee: true, boss: true, bd: 'mill', intro: 'Inquisitor Halvard draws a staff of pale light!',
    onTurn: async (B, Bt) => { const h = B.actors.find(a => a.key === 'halvard'); if (h && !h.taunt && h.hp < h.maxHp * .3) { h.taunt = true; await Bt.msg('Halvard: "She bit me, you know. Your sister. Same fire."', 1800); } } });
  if (r === 'lose') { await Story.defeat(); return; }
  f.halvardBeaten = true; World.remove('halvard');
  if (!Stones.has('heart')) { await narr('On Halvard\'s field desk, in a lead box stamped with the Crown Registry seal: a splinter of green stone the length of your hand. It is beating.'); await me('shock', '…A piece of the Heartstone. Nana\'s Heartstone.'); Stones.give('heart'); await narr('A LARGE stone. The moment you touch it your knees buckle. It will not answer you. Not yet.'); }
  await ending(r);
}
async function ending() {
  const f = F(); const blazed = !G.S.hood;
  await narr('Halvard falls to one knee. The light around him gutters out.');
  await say('halvard', 'shock', blazed ? 'That fire… and you aimed it at me, not at the town. Maybe I read the texts wrong.' : 'You never used it. The fire. Why?');
  await say('halvard', 'sad', "She isn't here. They moved the children at dawn. To Greyspire Citadel.");
  await say('halvard', 'neutral', "And when the Lantern hears what happened here — Ysolde Marr, the Second Pillar — she won't send another Halvard. She'll come herself."); f.ysoldeKnown = true;
  await say('halvard', 'happy', "And Drag — your valley wasn't found. It was sold. One of your own drew us the map to the bridge. Think on that.");
  await say('halvard', 'neutral', "You want to know why we do it? I'll tell you what the Crown tells its inquisitors on the night they take the white. Not your eyes. Not your quick hands. The Dragonoid.");
  await say('halvard', 'sad', "Somewhere in every one of you is the shape of the thing that nearly ended the world. One day, one of you will remember how to wear it. I have spent thirty years making sure it isn't today.");
  const c = await ask('halvard', 'neutral', 'Go on, Drag. Be what the stories say you are.', ['Spare him.', 'End him.']);
  if (c === 0) { f.halvardSpared = true; await me('anger', "No. I'm not your story."); await narr("You leave him kneeling in the dirt. He doesn't look up."); }
  else { f.halvardKilled = true; await narr("It's quick."); await narr('Somewhere in the trees, a bird stops singing. The stories, you realize, just got one chapter truer.'); }
  await narr('Inside the mill: empty cages. Straw. Chains. And tied to the bars of the last cage, a scrap of faded green silk.');
  await narr("The other half of Ilya's ribbon — tied in the worst knot you have ever seen. A dragon knot. She left it here on purpose. She knew you'd come.");
  await narr("You tie it to your wrist, next to yours. Now they make one whole knot.");
  await me('sad', "I'll find you. Dragon law.");
  await kairoDuel();
  await millRoof();
  if (f.kessJoined) {
    await say('kessE', 'neutral', 'Greyspire. Nobody comes back from Greyspire.');
    const k = await ask('kessE', 'neutral', '…So what now?', ["Then I'll be the first.", "We'll be the first."]);
    await say('kessE', 'happy', k === 0 ? '"I"? Idiot. "We." Somebody has to stop you glowing in public.' : "…We. Fine. I'm tired of hiding anyway.");
  } else if (f.kessHelp) {
    await narr('At the edge of the clearing, a figure in tinted glasses watches you. When you look up, she nods once — and is gone.');
  }
  f.chapter1Done = true; Story.quest('Chapter I complete. Greyspire Citadel awaits.'); G.S.side = ''; save();
  await Cine.play(CINE.greyspire(), { music: 'night' });
  Dlg.close(); await UI.endCard();
}

/* ---- Thornvale villagers ---- */
async function talkMei() {
  const f = F();
  if (f.dusk) { await say('mei', 'happy', "I wove new lanterns for tonight. Green paper. Don't tell the Inquisition we're festive."); return; }
  if (!f.meiTalk) {
    f.meiTalk = true;
    await say('mei', 'happy', "Morning, {name}. Ilya ran past me so fast she knocked over my dye pots. Green everywhere. Very on theme.");
    await say('mei', 'neutral', "She asked me if the mountains go on forever. I told her no. Then she asked what's past them.");
    const c = await ask('mei', 'neutral', "What would you have told her?", ["Freedom.", "Nothing good.", "I don't know. I want to find out."]);
    if (c === 0) await say('mei', 'sad', "…That's what I wanted to say. The elders would skin me for it.");
    else if (c === 1) await say('mei', 'neutral', "That's what Nana says. She's probably right. I still look, every morning.");
    else await say('mei', 'happy', "Ha. You and every child in this valley. Be careful who hears you say that.");
    return;
  }
  await say('mei', 'neutral', ["Green dye won't wash out of anything. Ask my hands.", "The mountains keep us safe. They also keep us in. Funny how that works.", "Nana's been quiet lately. She keeps looking at the ridge."][G.S.steps % 3]);
}
async function talkJun() {
  const f = F();
  if (f.dusk) { await say('jun', 'happy', "Watch this. *throws powder* …See? Tiny dragons. Ilya's favorite trick."); return; }
  await say('jun', 'neutral', ["Hay won't stack itself. Neither will I.", "Saw white cloaks on the far road last week. Asha says I'm seeing things.", "Ilya hid in my hay once. I found her by her snoring."][G.S.steps % 3]);
}
async function talkAsha() {
  const f = F();
  if (f.dusk) { await say('asha', 'neutral', "I'm keeping watch on the bridge tonight. Someone has to."); return; }
  if (!f.ashaTalk) {
    f.ashaTalk = true;
    await say('asha', 'neutral', "Don't wander past the bridge, {name}. The ridge road's been… busy.");
    await say('asha', 'anger', "Fresh wagon tracks. Heavy ones. Nobody comes this far into the hills for trade.");
    await me('neutral', "You think someone found us?");
    await say('asha', 'sad', "I think someone told them where to look. …Forget I said that. Go play with your sister.");
    return;
  }
  await say('asha', 'neutral', "Ridge is quiet. Too quiet. I hate when it's quiet.");
}

async function talkScout() {
  const f = F(); CHAR.scout = { name: 'Lark', sprite: 'lark' };
  if (f.scoutMet) { await say('scout', 'neutral', G.S.hood ? "Still wearing the hood? Kairo says hoods are for people who've already lost." : "Better. Let them look."); return; }
  f.scoutMet = true;
  await say('scout', 'happy', "{NAME}?! It IS you! Five years! You got so TALL — wait, do you remember me? Lark! Small! Fit in cracks! I still fit in cracks!".replace('{NAME}', G.S.name.toUpperCase()));
  await say('scout', 'neutral', "Kairo said you'd come this way. He said you'd be slow. He was right, you're very slow, I've been in this tree for TWO DAYS.");
  await say('scout', 'happy', "He also said if you got yourself killed in these woods, he'd dig you up just to beat you at something.");
  await say('scout', 'neutral', "Oh! And he said give you this. 'So the idiot doesn't die before I find him.' It's a Scale Shard. Don't let the Registry see it.");
  Stones.give('scale');
  const c = await ask('scout', 'neutral', "Green Eclipse is twenty strong now. Thirty by winter. You could be one of us.", ["Where is he?", "What is Green Eclipse doing?", "I have my own road."]);
  if (c === 0) await say('scout', 'neutral', "Everywhere the Inquisition is. You'll see him when he wants to be seen.");
  else if (c === 1) await say('scout', 'anger', "Burning wagons. Freeing cages. Teaching the Crown that green eyes look back.");
  else await say('scout', 'sad', "That's what he said you'd say. Word for word.");
}
async function kairoDuel() {
  const f = F(); const W = World;
  await Cine.play(CINE.millEyes(), { music: 'boss' });
  await W.addNpc({ id: 'kairo', sprite: 'kairo_b', x: 17, y: 16, dir: 'up' });
  await W.addNpc({ id: 'reb1', sprite: 'tamsin', x: 16, y: 17, dir: 'up' }); await W.addNpc({ id: 'reb2', sprite: 'bo', x: 18, y: 17, dir: 'up' });
  await W.addNpc({ id: 'reb3', sprite: 'ge_dace', x: 15, y: 17, dir: 'up' }); await W.addNpc({ id: 'reb4', sprite: 'ge_wren', x: 19, y: 17, dir: 'up' }); await W.addNpc({ id: 'reb5', sprite: 'ge_sefa', x: 17, y: 18, dir: 'up' });
  W.player.dir = 'down';

  await me('shock', "…Kairo.");
  await say('kairoB', 'neutral', "Five years, {name}. You got tall.");
  await say('kairoB', 'neutral', "Lark said you came out of the Realm of No Return. Nobody comes out of there. …I should've known you'd be the first.");
  await say('tamsin', 'anger', "Kairo. That's the one who walked into the snow. Five years without a word — we buried an empty box for you.");
  await say('bo', 'happy', "…Hi, {name}. We missed you. Some of us did. I did.");
  await say('kairoB', 'happy', "So you got here first. Of course you did. You always beat me to the places that matter.");
  if (f.halvardSpared) await say('kairoB', 'anger', "And you let HIM live. The man who tore her out of your hands. You let him keep breathing.");
  else await say('kairoB', 'neutral', "…Halvard's done, then. Good. That's one.");
  await say('kairoB', 'neutral', "Green Eclipse takes this mill tonight. Every cage opened. Every priest who locked one answers for it.");
  await say('kairoB', 'anger', "Then Ashford Hollow. Not to burn it — to make it kneel. They hanged a Drag at that fountain while the whole town watched. Every town that ever did that will learn who the strong ones are.");
  await say('kairoB', 'anger', "And you — five years gone, and the first thing you do is stand between a Drag and the man who caged Drag children. Whose side are you on, {name}?");
  const c = await ask('kairoB', 'anger', "So step aside, {name}.", ["Ashford has children in it, Kairo.", "Then you're no different from Halvard.", "I want a world where we live together. Both of us."]);
  if (c === 0) await say('kairoB', 'anger', "I'm not going to TOUCH their children. I'm going to make sure no Drag child there ever has to hide again. I'm not a monster, {name}. I'm the end of the monsters.");
  else if (c === 1) await say('kairoB', 'anger', "DON'T. Halvard wants us gone. I want us on TOP. I'll let them live — under us, the way we lived under them. That's more mercy than they ever gave.");
  else { await say('kairoB', 'sad', "…Together. You sound like Nana. Hide nicely, be good, and maybe one day they'll stop flinching."); await say('kairoB', 'anger', "They'll never stop flinching, {name}. So we give them something real to flinch at. Fratenaptor's blood isn't a curse. It's a crown."); }
  await me('anger', "I'm not on their side, Kairo. I'm not on yours either. I'm on the side where nobody gets caged — not us, not them.");
  await say('kairoB', 'sad', "Then you're on nobody's side. And nobody's side is the one that loses.");
  if (G.S.party.includes('kess')) await say('kessE', 'sad', "This one's yours. I'm not getting between brothers.");
  await say('dace', 'anger', "Boss — that's a Drag standing with the priests. Let me talk some sense into them.");
  await say('sefa', 'sad', "Dace. Look at their wrist. That's Ilya's knot. That's family. Let Kairo handle this.");
  await say('tamsin', 'anger', "Let me do it, Kairo.");
  await say('kairoB', 'neutral', "No. This one's mine. It always was.");
  await say('kairoB', 'anger', "Fine. Like old times. First to yield.");
  const r = await Battle.start({ enemies: ['kairo_duel'], allies: [], noFlee: true, boss: true, bd: 'mill', music: 'boss', intro: 'RIVAL — Kairo of Green Eclipse',
    onTurn: async (B, Bt) => {
      const e = B.actors.find(a => a.key === 'kairo_duel'), me = Bt.me();
      if (e && !e.t1 && e.hp < e.maxHp * .6) { e.t1 = 1; await Bt.msg('Kairo: "Sheath, draw, cut, sheath — like one breath. Who the hell taught you THAT?!"', 1900); }
      if (e && e.exhausted && e.hp < e.maxHp * .3) { await Bt.msg('Kairo drops to one knee.', 1300); return 'win'; }
      if (me.hp < me.maxHp * .22) { await Bt.msg('Your blade hits the dirt.', 1300); return 'lose'; }
    } });
  Story.heal(true);
  if (r === 'win') {
    f.duel = 'won';
    await say('kairoB', 'shock', "…Hah. Forty-two to one.");
    await say('kairoB', 'neutral', "You fight different. Like you're not trying to kill me. Who taught you that?");
    await me('neutral', "An old man with one arm.");
    await say('kairoB', 'neutral', "And your eyes. You saw every move before I made it. That's your gift, isn't it. It woke on the bridge.");
    await say('kairoB', 'sad', "Fine. Ashford stands on its own feet. For now. Not because you're right — because you beat me. Remember the difference.");
    if (f.halvardSpared) await say('kairoB', 'anger', "Keep your priest, then. When he cages another child, I hope you're there to tell the child about 'together.'");
  } else {
    f.duel = 'lost';
    await say('kairoB', 'sad', "Stay down, {name}. Please. Just this once, stay down.");
    if (f.halvardSpared) { await narr('Kairo walks past you, into the mill. When he comes back out, his blade is wet. Halvard does not follow him.'); await say('kairoB', 'sad', "He caged children for thirty years. That was justice, not revenge. …Tell yourself whatever you need to."); f.halvardKilledByKairo = true; }
    await say('kairoB', 'neutral', "Ashford can wait. Freeing the cages comes first. It always comes first.");
  }
  await me('shock', "Kairo — what WAS that? Your body—");
  await say('kairoB', 'neutral', "Scar Bloom. That's what Sefa calls it. It's not the Dragonoid, before you ask. Nobody's seen that in three hundred years. This is just mine.");
  await say('kairoB', 'neutral', "The fire taught my body one thing: never lose to the same thing twice. Hit me with something once, and the scales remember it.");
  await say('kairoB', 'sad', "It only comes when I'm close to the end. It doesn't last. And afterwards I can't lift my own sword. …Don't tell Dace.");
  await say('sefa', 'sad', "He tells everyone not to tell Dace. Dace knows.");
  await narr('Footsteps on the mill roof. Someone drops into the clearing, light as falling snow — white hair, a spear across her back.');
  await World.addNpc({ id: 'liora', sprite: 'liora_e', x: 20, y: 14, dir: 'left' });
  await say('kairoB', 'blush', "…Liora.");
  await say('tamsin', 'neutral', "Oh, here we go.");
  await say('liora', 'neutral', "Your cages were empty before you got here, Kairo. Dread moved the children to Greyspire. And he'll be there himself in nine days.");
  await say('kairoB', 'neutral', "Then come with us. Greyspire's walls won't fall to one spear.");
  await say('liora', 'neutral', "I don't join, Kairo. I help, when it suits me. Tonight it suited me.");
  await say('liora', 'neutral', "Greyspire's undercity belongs to the Velvet Knife — Lysandra Voe. One of the Eight. If anyone knows which cell your sister's in, it's her. Her price will be ugly."); f.knifeKnown = true;
  if (f.duel === 'won') { await narr('She looks at the ash still flaking off Kairo\'s arms. For a heartbeat her face does something soft and unguarded.'); await say('liora', 'sad', "You used it again. The Bloom. You promised me you'd stop doing that to yourself."); await say('kairoB', 'blush', "…You were counting?"); await say('liora', 'anger', "Somebody has to."); }
  if (F().lioraMet) await say('liora', 'happy', "And you, Sword Saint's student. Still alive. Good. At Greyspire, stay out of my way — or keep up.");
  else await say('liora', 'neutral', "Who's this? …Another Drag with a hood and a grudge. Wonderful. Stay out of my way at Greyspire.");
  await narr("She's gone over the mill roof as quietly as she came.");
  World.remove('liora');
  await say('kairoB', 'anger', "…Don't.");
  await me('shock', "Don't what?");
  await say('kairoB', 'anger', "You know what.");
  await narr('Kairo tosses something into the dirt at your feet. A shard of green stone, humming softly.');
  await say('kairoB', 'neutral', "Halvard's staff. That's how his light burned so bright — a Drag stone. OUR stone. Take it. Greyspire's walls are thick.");
  f.shard = true; Stones.give('verdict');
  await narr('A MEDIUM stone. It is cold, and it does not like you. You can feel it deciding whether you are worth serving.');
  await say('kairoB', 'anger', "One more thing. Whoever sold Thornvale — I'll find them before you do. Pray I'm gentle about it.");
  await say('kairoB', 'sad', "…Nix is in Greyspire too. Whatever they've made him. We swore it, {name}. All of us, or nobody.");
  await say('kairoB', 'happy', "…See you at Greyspire, brother. Try to keep up.");
  await narr('Green Eclipse melts back into the trees. In a heartbeat, the clearing is empty again.');
  W.remove('kairo'); ['reb1', 'reb2', 'reb3', 'reb4', 'reb5'].forEach(r => W.remove(r)); f.millDone = true;
}

/* ---- Liora: a heart pulled two ways ---- */
Story.heart = function (n) {
  const f = F(); f.lioraAff = (f.lioraAff || 0) + n;
  const r = $('#portR').getBoundingClientRect(), h = document.createElement('div'); h.className = 'heart'; h.textContent = '♥';
  h.style.left = (r.left + r.width * .7) + 'px'; h.style.top = (r.top + 12) + 'px'; document.body.appendChild(h); setTimeout(() => h.remove(), 1500);
};
async function millRoof() {
  const f = F(); if (f.roofDone) return; f.roofDone = true;
  Music.play('night'); await fadeOut(900); await wait(300); await fadeIn(900);
  await Cine.play(CINE.roof(), { music: 'night' });
  await narr('There\'s a ladder. You climb it before you can talk yourself out of it.');
  await say('liora', 'neutral', "You followed me. Kairo would have too. He'd have brought a speech.");
  const a = await ask('me', 'neutral', '…', ["I couldn't sleep.", "You look… really beautiful up here.", "Are you okay?"]);
  if (a === 0) { await say('liora', 'neutral', "Neither could I. I never can, the night before something."); Story.heart(1); }
  else if (a === 1) {
    if ((f.lioraAff || 0) >= 2) { await say('liora', 'blush', "…You say that like you mean it. Most people say it like a password."); await say('liora', 'shame', "Sit down before I push you off the roof."); Story.heart(1); }
    else await say('liora', 'anger', "Careful. I've put spears through people for less.");
  } else { await say('liora', 'sad', "…Nobody asks me that. They ask how many I've killed, or what Dread looks like up close. Not that."); Story.heart(2); }
  await narr('She hums something under her breath. Old. Slow. A lullaby with the words worn off.');
  await say('liora', 'sad', "My mother's song. Seren — that was her name. She braided my hair on nights like this and sang it wrong on purpose so I'd correct her.");
  await say('liora', 'sad', "Dread came on a night like this too. Clear sky. I counted his footsteps from under the stairs. Eleven. I still count to eleven before I fall asleep.");
  const b = await ask('me', 'neutral', '…', ["What will you do after Dread?", "Kairo cares about you. A lot.", "(Sit a little closer.)"]);
  if (b === 0) {
    if ((f.lioraAff || 0) >= 4) { await say('liora', 'blush', "After? …I never let myself imagine an after. Tonight I almost can."); await say('liora', 'shame', "Don't make me say more than that."); Story.heart(1); }
    else await say('liora', 'neutral', "There is no after. There's Dread, and then there's whatever's left of me. I don't plan for it.");
  } else if (b === 1) {
    await say('liora', 'sad', "I know. Kairo carried me out of a burning fort when I was fifteen. He was bleeding worse than me and he wouldn't put me down.");
    await say('liora', 'neutral', "He's loud, and angry, and he'd burn the whole world for anyone with green eyes. …Some days that's exactly what I love about him. Some days it's what scares me.");
    await say('liora', 'blush', "…And then someone like you climbs a ladder. Ugh. Forget I said any of this.");
    Story.heart(1); f.lioraKairoTalk = true;
  } else { await narr('She doesn\'t move away. After a while, her shoulder rests against yours. Neither of you mentions it.'); await say('liora', 'blush', "…Just tonight. Don't make it a thing."); Story.heart(2); }
  if ((f.lioraAff || 0) >= 5) {
    await narr('She pulls a silver pin from her hair — a tiny spear, its tip set with a chip of green stone — and presses it into your palm.');
    await say('liora', 'blush', "My mother's. Give it back to me when this is over. That way I have to live long enough to collect it.");
    f.lioraPin = true; sfx('level'); toast("You received <b style=\"color:#ff9ccc\">Liora's hairpin</b>. A promise to come back.", 4200);
  } else await say('liora', 'neutral', "Go sleep, Sword Saint's student. Greyspire won't care how tired you are.");
  await narr('Below the roof, at the edge of the trees, a pair of green eyes is watching. Then they turn away into the dark.');
  if (f.lioraAff >= 5) await say('kairoB', 'sad', "(…Of everyone in the world, brother. It had to be you.)");
  Music.play('sad');
}

async function talkKids(e) {
  const f = F(), id = e.id;
  const M = {
    tamsinK: f.dusk ? "Kairo dances like a drunk goat. Don't tell him I said that. …Okay, tell him." : f.kairo ? "You lost to Kairo AGAIN? …Okay, you didn't? Huh. He's gonna be grumpy all night." : "I'm not playing hide-and-seek. It's for babies. I'm practicing being a warrior. Like Kairo.",
    boK: f.dusk ? "I ate four honey cakes. Five. Don't count." : "Hi, {name}! I found a frog. His name is Frog. I'm gonna keep him forever. Or till lunch.",
    larkK: f.dusk ? "Did you know if you jump over the fire you get luck for a year? I made that up. But it's probably true!" : "Ilya's hiding SO good, I checked under every bucket — did you know there's forty-one buckets in Thornvale? I counted. Forty-two if you count Bo's head. Ha!",
    nixK: f.dusk ? "…The fire is the same green as our eyes. Do you think that's on purpose?" : "…I'm watching the ridge. Somebody keeps walking along the top of it. Asha says it's goats. Goats don't carry lanterns."
  };
  await say(id, null, M[id]);
}

/* ---------------- HOUSE INTERIORS ---------------- */
function room(key, map, title, o) {
  o = o || {};
  SCENES[key] = Object.assign({ map, title, subtitle: o.sub || '', safe: o.safe ?? false, bd: o.bd || 'town',
    get exits() { const d = G.maps[map].door; return [{ x: d[0], y: d[1], to: '__ret' }]; },
    music: o.music || (() => G.S.ret && SCENES[G.S.ret.map] ? (typeof SCENES[G.S.ret.map].music === 'function' ? SCENES[G.S.ret.map].music() : SCENES[G.S.ret.map].music) : null),
    npcs: o.npcs || (() => []), tiles: o.tiles || {} }, o.extra || {});
}
async function enter(key, rx, ry) {
  G.S.ret = { map: G.S.map, x: rx, y: ry };
  const d = G.maps[SCENES[key].map].door;
  await World.go(key, d[0], d[1] - 1, 'up');
}
function door(sceneKey, x, y, key, cond) {
  SCENES[sceneKey].tiles[x + ',' + y] = async () => { if (cond) { const msg = await cond(); if (msg) { if (msg !== true) await narr(msg); return; } } await enter(key, x, y + 1); };
}
const resident = (id, sprite, x, y, lines, extra) => Object.assign({ id, sprite, x, y, dir: 'down', ai: 'turn', turns: ['down', 'left', 'right'], folk: true,
  talk: async e => { CHAR[e.id] = { name: e.nm || 'Resident', sprite: e.sprite, kid: e.sprite.startsWith('kid') || e.sprite.startsWith('dkid') };
    if (!G.S.hood && G.S.f.hoodGiven && !e.drag) { await say(e.id, null, pick(['"Get OUT of my house!"', '"Those eyes— please, we have children here."', '"I won\'t scream. Just… go. Please go."'])); return; }
    await say(e.id, null, pick(typeof lines === 'function' ? lines() : lines)); } }, extra || {});
const DF = i => (G.man.dfolk || [])[i % 12] || 'folk0', FK = i => G.man.folk[i % G.man.folk.length];
// ---- Thornvale ----
const burned = async () => F().raid ? 'Only ash and black beams inside. You can\'t make yourself go in.' : null;
room('t_home', 'in_home', 'Home', { safe: true, tiles: {
  '8,6': async () => narr("Ilya's drawing, pinned under a cup: you, her, and a big green dragon. The dragon is smiling. So are you."),
  '9,6': async () => narr("Ilya's drawing, pinned under a cup: you, her, and a big green dragon. The dragon is smiling. So are you."),
  '6,2': async () => narr('The hearth is still warm. Ilya hid her birthday wish in a crack in the stones. You promised not to read it. You don\'t.'),
  '9,3': async () => narr('Your clothes. Ilya\'s clothes. A wooden dragon Oren carved, missing one wing.') } });
room('t_nana', 'in_nana', "Nana's House", { safe: true, tiles: Object.fromEntries(['1,2', '2,2', '3,2', '4,2'].map(k => [k, async () => {
  await narr('Old books, older than the village. One falls open to a drawing: seven figures with green eyes, holding chains.');
  await narr('Beneath it, in Nana\'s handwriting: "Not worshippers. Wardens. Tell the children when they are ready."'); }])) });
room('t_forge', 'in_forge', "Oren's Forge", { safe: true, tiles: { '4,4': async () => narr("Oren's anvil. A half-finished blade lies on it, too small for a grown-up. Your size."), '7,4': async () => narr('A second anvil, for Kairo. Oren says he hits too hard and too early. Kairo says that\'s the point.') } });
room('t_mei', 'in_cottage', "Mei's House", { safe: true, npcs: () => [resident('mei_kid', 'dkid3', 6, 3, ['"Mama says I can stay up for the fire tonight!"', '"Is Ilya still hiding? She\'s the BEST at it."'], { drag: 1 }), resident('mei_gran', DF(1), 2, 5, ['"Mei\'s at her loom. She\'ll weave half the village lanterns before dusk."', '"Sit, sit. You look hungry. You always look hungry."'], { drag: 1 })] });
room('t_jun', 'in_cottage2', "Jun's House", { safe: true, npcs: () => [resident('jun_wife', DF(2), 5, 3, ['"Jun\'s been at the hay since sunrise. He says he\'s practicing his spark trick."', '"Happy birthday to your sister, love."'], { drag: 1 })] });
door('thornvale', 9, 12, 't_home', burned); door('thornvale', 17, 10, 't_nana', burned); door('thornvale', 24, 12, 't_forge', burned);
door('thornvale', 9, 22, 't_mei', burned); door('thornvale', 23, 24, 't_jun', burned);
// ---- Ashford Hollow ----
const ASH_HOME = [['"Wipe your boots. …Fine, don\'t."', '"The Inquisition searched our cellar last week. Took the good cheese."', '"We don\'t get many visitors. On purpose."'],
  ['"My husband says the Drags will come back one day. I say good, the old ones fixed our roof for free."', '"Don\'t mind the mess. Children."', '"Tea? No? More for me."'],
  ['"Shh. Baby\'s sleeping."', '"If you\'re selling something, we\'re poor. If you\'re buying something, we\'re rich."', '"Voss used to be a good man. Still is, maybe. Just tired."']];
room('a_clinic', 'in_clinic', "Maren's Clinic", { npcs: () => [resident('pat1', FK(1), 2, 5, ['"Cough… the healer\'s a saint. A saint with very cold hands."', '"Stay back, I\'m catching."'], { nm: 'Patient', ai: null }), resident('pat2', FK(4), 10, 5, ['"Fell off a roof. Don\'t ask what I was doing on the roof."'], { nm: 'Patient', ai: null }), resident('pat3', FK(6), 12, 5, ['"I hear Maren treats anybody. ANYBODY. Even… you know."'], { nm: 'Patient', ai: null })] });
room('a_pip', 'in_cottage2', "Pip's House", { npcs: () => [resident('pipdad', FK(2), 5, 3, ['"Pip\'s out with his rock again. Gerald. Don\'t ask."', '"His mother worries. Me, I figure the world\'s not as bad as she thinks. Mostly."'], { nm: "Pip's Father" })].concat(F().pipGone ? [resident('pipin', 'pip', 7, 5, ['"Psst! Hi! Mama says I can\'t talk to you. So I\'m whispering. Gerald says hi too."'], { nm: 'Pip', drag: 1 })] : []) });
room('a_shop', 'in_shop', "Tobb's Goods", { npcs: () => [resident('clerk', FK(3), 5, 3, ['"Tobb runs the stall in the market. I just guard the jars. And dust them. Mostly dust them."', '"Don\'t touch the blue ones. Tobb says they explode. I think he\'s joking."'], { nm: 'Shop Clerk', ai: null })] });
room('a_inn', 'in_inn', 'The Crooked Lantern', { npcs: () => [
  Object.assign(resident('bram_in', 'innkeep', 3, 4, [], { nm: 'Bram', ai: null }), { talk: innRest }),
  resident('pat_a', FK(5), 2, 7, ['"Ale\'s watered. Always has been. Still the best in the vale."', '"Heard the Dread General\'s heading east. Pray he keeps going."'], { nm: 'Patron', ai: null }),
  resident('pat_b', FK(7), 9, 7, ['"Green Eclipse hit a wagon on the south road. Freed every cage. I didn\'t say that."'], { nm: 'Patron', ai: null }),
  resident('pat_c', FK(9), 12, 9, ['"Shh, I\'m sleeping. On purpose. At the table. It\'s a skill."'], { nm: 'Patron', ai: null })] });
async function innRest() {
  CHAR.bram_in = { name: 'Bram', sprite: 'innkeep' };
  const c = await ask('bram_in', 'happy', 'Room for the night? 15 gold. Warm bed, no questions. (Restores HP & MP and saves.)', ['Rest (15g)', 'Not now']);
  if (c === 0) { if (G.S.gold >= 15) { G.S.gold -= 15; await fadeOut(600); Story.heal(true); save(); await fadeIn(600); await narr('You keep your hood on all night. You sleep badly, but you sleep. (Game saved.)'); } else await say('bram_in', 'neutral', "Coin first, friend."); }
}
['a_h1', 'a_h2', 'a_h3', 'a_h4', 'a_h5'].forEach((k, i) => room(k, i % 2 ? 'in_cottage2' : 'in_cottage', 'A Home', { npcs: () => [resident(k + 'a', FK(10 + i), 5, 3, ASH_HOME[i % 3], { nm: 'Resident' }), resident(k + 'b', FK(16 + i), i % 2 ? 6 : 3, 6, ASH_HOME[(i + 1) % 3], { nm: 'Resident' })] }));
const innCheck = async () => { if (G.S.sus >= 3) return 'The innkeeper sees you through the window and slams the shutters.'; if (!G.S.hood) return 'The innkeeper takes one look at your eyes and taps the NO DRAGS carving on the doorframe.'; return null; };
door('ashford', 9, 14, 'a_clinic', async () => F().marenKnows ? "Maren's clinic. The door stays closed to you. You don't knock." : null);
door('ashford', 16, 14, 'a_pip'); door('ashford', 35, 14, 'a_shop'); door('ashford', 42, 14, 'a_inn', innCheck);
door('ashford', 8, 30, 'a_h1'); door('ashford', 15, 31, 'a_h2'); door('ashford', 22, 36, 'a_h3'); door('ashford', 41, 31, 'a_h4'); door('ashford', 49, 31, 'a_h5'); door('ashford', 53, 10, 'a_guild');

/* ---- The Adventurers' Guild: tiers of mana mastery ---- */
const RANKS = ['E', 'D', 'C', 'B', 'A', 'S'];
const RANK_DESC = {
  E: 'Feels mana, barely shapes it. Every adventurer starts here. Village errands, rats, lost goats.',
  D: 'An element answers when called. A trained fighter. Beast culls, caravan guard.',
  C: 'One element mastered, or two in hand. Worth a whole town militia.',
  B: 'Towns pay a year\'s taxes for you. Elites, inquisitors, monster lairs.',
  A: 'One in ten thousand. Armies notice when you arrive. Prodigies and warlords.',
  S: 'Living legends. Maybe a dozen breathe today. The Sword Saint was one. Dread is one.' };
Story.rankCheck = function () {
  const S = G.S, f = S.f; if (!S.rank) return;
  let r = 0; if (f.rookBeaten || f.vossBeaten || f.alphaBeaten) r = 1; if (f.halvardBeaten) r = 2; if (f.duel === 'won') r = 3;
  if (r > RANKS.indexOf(S.rank)) { S.rank = RANKS[r]; sfx('level'); toast(`Guild rank up! You are now <b style="color:${TIER_COL[S.rank]}">${S.rank}-RANK</b>. Word travels fast in the Hollow.`, 4200); UI.hud(); }
};
setInterval(() => { try { if (G.S && G.mode === 'world' && !World.busy && !Dlg.open && Story.rankCheck) Story.rankCheck(); } catch (e) { } }, 1500);
room('a_guild', 'in_inn', "Adventurers' Guild", { npcs: () => [
  { id: 'brom', x: 3, y: 4, dir: 'down', talk: talkBrom },
  { id: 'sylwen', x: 12, y: 7, dir: 'left', talk: talkSylwen, ai: 'turn', turns: ['left', 'down'] },
  { id: 'garrick', x: 9, y: 7, dir: 'down', talk: talkGarrick },
  { id: 'tilda', x: 2, y: 7, dir: 'right', talk: talkTilda }],
  tiles: { '9,2': () => questBoard(), '10,2': () => questBoard() } });
async function rankBoard() {
  await narr('A slate board, chalked in a dwarf\'s square hand: TIERS OF MASTERY.');
  for (const r of RANKS) await narr(`${r}-RANK — ${RANK_DESC[r]}`);
  await narr('Scratched underneath, smaller: "Drag — ???"  Someone has tried to rub it out.');
}
async function talkBrom() {
  const f = F(), S = G.S;
  if (S.rank) { await say('brom', 'happy', `${S.rank}-rank, ${S.name}. ${RANK_DESC[S.rank]}`); if (S.rank !== 'S') await say('brom', 'neutral', 'Want the next letter? Do something worth writing down. The guild hears everything — usually before you\'ve finished bleeding.'); return; }
  await say('brom', 'neutral', 'Adventurers\' Guild, Ashford chapter. I\'m Brom. Yes, I\'m a dwarf. Yes, I\'m short. No, it\'s not funny the fortieth time.');
  await say('brom', 'neutral', 'Here\'s how it works. Every living thing feels mana. Humans, elves, dwarves, the beast-folk out east, the wolf in the hedge. Most feel it like weather. A few can grab hold.');
  await say('brom', 'neutral', 'Grab hold, and an element answers. Fire, water, ice, lightning, earth, wind, light. Everyone\'s got one that comes easiest. Elves get two, the show-offs.');
  await say('brom', 'neutral', 'How MUCH you can grab, and what you do with it — that\'s your tier. E at the bottom, S at the top. The board on the wall has the details. Read it, I\'m tired of saying it.');
  await say('brom', 'happy', 'Registered adventurers travel the roads without papers. The Crown hates it. Which is the best reason I know to sign up.');
  await narr('He thumps a cloudy crystal the size of a skull onto the counter.');
  await say('brom', 'neutral', 'Hand on the stone. It lights up with your element — red for fire, blue for water, and so on. Then I write you down.');
  const c = await ask('me', 'neutral', '(If it reads what you really are…)', ['Put your hand on it.', 'Tomb Breath first — hold everything down.']);
  if (c === 0) {
    await narr('The crystal doesn\'t turn red. Or blue. Or any colour on the board.');
    await narr('It turns GREEN. Not a glow — a flood. Light pours up out of it, hums in the floorboards, makes every lantern in the hall lean toward you.');
    await say('garrick', 'shock', 'What in the— that\'s not an element. That\'s not ANY element!');
    await say('sylwen', 'neutral', '…No. It isn\'t. It\'s what the elements are made of.');
    await say('brom', 'neutral', '…Huh. Crystal\'s cracked. Old thing. Happens.');
    await narr('Brom drops a cloth over it. Under the cloth, it\'s still glowing.');
    await say('brom', 'neutral', 'Listen, ' + (S.hood ? 'hood' : 'friend') + '. Dwarves never had a war with your people. We were too busy having one with the elves. The guild takes anyone who does the job.');
    await say('brom', 'sad', 'But the Crown\'s eyes drink in this hall too. You never put your hand on that stone. Understood?');
    Story.addSus(.5); f.crystalGreen = true;
  } else {
    await narr('You breathe the way Vane taught you. In. Hold it. Fold the current down, small and smaller, until it\'s a coal in your chest.');
    await narr('The crystal flickers… and stays a dull, empty grey.');
    await say('brom', 'neutral', 'Grey. No element at all? Hah. Well, the bottom of the barrel needs filling too.');
    await say('sylwen', 'neutral', 'No colour at all… or every colour, held so tight none of it gets out. Interesting.');
  }
  S.rank = 'E'; sfx('level');
  await say('brom', 'happy', 'There. E-RANK. Everyone starts at E — even the ones who obviously aren\'t. Earn the rest.');
  await say('brom', 'neutral', 'Board\'s on the back wall. Bounties, trials, the Proving Bouts when you\'re D-rank. Every job pays in coin and in rank points. Enough points and the letter on your card changes.');
  await say('brom', 'sad', 'And mind the roads. Outside the Crown\'s walls the land belongs to the Eight — the bandit kings. Every one of them SSS. The Gilded Hound owns the toll-roads round here. Don\'t owe him money. Don\'t owe him anything.');
  F().kingsKnown = true;
  toast('Registered at the <b>Adventurers\' Guild</b>: <b style="color:#9aa3a0">E-RANK</b>. Win the hard fights and your rank will climb.', 4800);
  UI.hud();
}
async function talkSylwen() {
  const f = F(); f.sylwenN = (f.sylwenN || 0) + 1;
  const L = [['neutral', 'Sylwen. B-rank, wind and water. Elf, before you ask about the ears. Everyone asks about the ears.'],
    ['neutral', 'Humans think an element is something you OWN. Elves know better. Fire, ice, lightning — they\'re just shapes mana is willing to take.'],
    ['sad', 'Long ago there were people who didn\'t bother with shapes. They moved the mana itself. Fields of force. Raw light that cut through any element like it wasn\'t there. Elves called them the Unbound.'],
    ['neutral', 'Humans call them something else now. With green in it. …I\'m four hundred and twelve, you know. I remember when they were heroes.'],
    ['happy', 'If you ever want to spar, ' + (G.S.rank || 'E') + '-rank, find me. I\'d like to see what an empty grey crystal can do.']];
  const [e, t] = L[Math.min(f.sylwenN - 1, L.length - 1)]; await say('sylwen', e, t);
}
async function talkGarrick() {
  await say('garrick', F().crystalGreen ? 'anger' : 'neutral', F().crystalGreen ? 'I saw what I saw. …But Brom says I didn\'t. And I owe Brom money. So I didn\'t.' : 'Garrick. C-rank, earth. I hold the line so the B-ranks can show off behind it.');
}
async function talkTilda() {
  await say('tilda', 'happy', pick(['Tilda! D-rank, fire! Brom\'s niece. I\'m going to be S-rank by thirty. Uncle says sixty. Uncle\'s a pessimist.',
    'Dwarves don\'t use much magic. We use HAMMERS. And a little fire, for the hammers.', 'Did you know the Sword Saint was S-rank and NEVER registered? Uncle says he walked in once, looked at the board, laughed, and walked out.']));
}

/* ---- Green Eclipse: the people Kairo built after you left ---- */
async function geTalk(id) {
  const f = F(); f['ge_' + id] = (f['ge_' + id] || 0) + 1; const n = f['ge_' + id];
  const L = {
    dace: [["happy", "So YOU'RE the one. The one who walked out of the Realm of No Return. Kairo doesn't talk about you. Which means he thinks about you constantly."],
           ["anger", "Kairo pulled me out of a cage when I was nine. Nine. The men who put me there called me an animal. Kairo called me a Drag — like it was a title."],
           ["neutral", "Fratenaptor's blood makes us faster, stronger, harder to kill. They've known it for four hundred years. That's why they cage us. Kairo's just the first one who stopped pretending we should be grateful."]],
    sefa: [["neutral", "I'm the healer. Before Kairo found me I was patching Drag children in a cellar, with stolen thread, waiting for the Inquisition to knock."],
           ["sad", "Last spring we freed forty children from a wagon and set fire to the toll-house that sold them. We didn't know there was a family asleep upstairs. Kairo carried them out himself. Two didn't make it."],
           ["sad", "He hasn't forgiven himself. He's also never stopped. I don't know if that's strength or the start of something worse. …I still follow him. Who else is fighting for us?"]],
    wren: [["anger", "Don't talk to me about 'good humans.' I was in a cage for four years. Good humans walked past it every single day."],
           ["neutral", "Kairo says the ones who look away are the same as the ones who hold the key. Four years taught me he's right."],
           ["happy", "…You've got his old knot on your wrist. The terrible one. Ilya's, isn't it? Kairo used to tie it on every rescued kid's wrist. 'So you can always find us.'"]],
    corran: [["neutral", "I'm the oldest thing in Green Eclipse, kid. Forty-one. Kairo calls me 'grandfather.' I let him think it annoys me."],
             ["sad", "I was a smith in a Drag village two valleys over. It burned the same year as yours. For twenty years I kept my head down. Kairo's the first person who ever told me to lift it."],
             ["neutral", "He wants a world where Drags sit on the thrones and humans ask permission. Maybe that's wrong. But I've lived the other way round my whole life, and that was wrong too."]]
  }[id];
  const [e, t] = L[Math.min(n - 1, L.length - 1)];
  await say(id, e, t);
}

/* ================= INTERLUDE: THE REALM OF NO RETURN ================= */
SCENES.realm = {
  title: 'The Realm of No Return', subtitle: 'Where the mana never thins', realm: true, safe: true, bd: 'snow', music: 'night',
  get weather() { return F().vaneMet ? 'snow' : 'blizzard'; },
  encounters() { if (!F().cultivation) return null; const r = Math.random(); return { enemies: r < .4 ? ['rime_lupine'] : r < .7 ? ['mana_wyrm'] : r < .92 ? ['rime_lupine', 'mana_wyrm'] : ['rime_alpha'], bd: 'snow' }; },
  npcs() {
    const f = F(); const L = [];
    if (f.vaneMet && !f.vaneDone) L.push({ id: 'vane', x: 29, y: 15, dir: 'left', talk: talkVaneStone, ai: 'turn', turns: ['left', 'down', 'right'] });
    return L;
  },
  exits: [{ x: 22, x2: 24, y: 31, msg: 'The storm turns you around. Every path out of the Realm leads back to the hut.', when: () => !F().vaneDone },
          { x: 22, x2: 24, y: 31, to: 'ashford', tx: 29, ty: 39, dir: 'up', when: () => F().vaneDone, check: async () => { UI.controls(false); await narr('You walk south into the white. Behind you, a thin line of chimney smoke. You don\'t look back. He told you not to.'); Dlg.close(); await Story.prologueEnd(); return true; } }],
  tiles: { '31,14': () => stoneTile(), '30,14': () => stoneTile(), '32,14': () => stoneTile() },
  step(x, y) { const f = F(); if (!f.vaneMet && y <= 22) { Story.run(realmAmbush); return true; } },
  async onEnter() {
    const f = F(); if (f.realmIn) return; f.realmIn = true;
    Weather.forced = 'blizzard';
    await Cine.play(CINE.realmWalk(), { music: 'night' });
    Story.quest('Find shelter. Anywhere. Keep walking north.');
  }
};
async function stoneTile() { if (!F().cultivation) await narr('A ring of old standing stones. The snow never settles on them.'); else await narr('The meditation stones. Even the storm goes quiet here.'); }
async function realmAmbush() {
  const f = F();
  await narr('Something moves in the white. Then another. Pale shapes, walking on two legs, with the heads of wolves.');
  await me('shock', '…No. No, no, no—');
  await Battle.start({ enemies: ['rime_lupine', 'rime_lupine'], noFlee: true, bd: 'snow', intro: 'Rime Lupines close in!',
    onTurn: async (B, Bt) => { const me = Bt.me(); if (B.turn >= 6 || me.hp < me.maxHp * .35) {
      await Cine.play(CINE.vaneArrives()); B.flash = 1.4; sfx('crit'); await wait(250);
      B.actors.filter(a => a.side === 'e').forEach(a => { a.hp = 0; a.ko = true; a.anim = 'hurt'; a.frame = 5; Bt.text(a, 'SEVERED', '#cfe8ff', -10, true); });
      await Bt.msg('SNOW SEVER', 1400); return 'scripted'; } } });
  Weather.forced = null;
  await World.addNpc({ id: 'vane', x: 23, y: 19, dir: 'down' });
  await narr('A man stands over the bodies. Old. Grey hair tied back. A long coat, one sleeve pinned and empty. The other hand holds a blade so clean the snow slides off it.');
  await say('vane', 'neutral', 'Hm. A Drag pup. In here.');
  await say('vane', 'neutral', '…Of course. The idiots always find their way in.');
  await narr('Your knees fold. The last thing you feel is a single arm lifting you out of the snow like you weigh nothing.');
  await fadeOut(900);
  f.vaneMet = true; World.remove('vane');
  G.S.ret = { map: 'realm', x: 23, y: 12 }; Story.heal(true);
  await World.load('r_hut', 7, 4, 'left'); await fadeIn(900);
  banner('The Old Man\'s Hut', '');
  await hutWake();
}
room('r_hut', 'in_cottage2', "The Old Man's Hut", { safe: true, music: 'sad', npcs: () => !F().hutWake ? [{ id: 'vane', x: 5, y: 4, dir: 'right', talk: async () => {} }] : [], tiles: { '4,2': async () => narr('A fire that never quite goes out. Above it, a bare hook where a sword used to hang.'), '7,3': async () => narr('A narrow bed. He gave it to you the first night and slept in the chair. He still won\'t admit it.') } });
door('realm', 23, 11, 'r_hut');
async function hutWake() {
  const f = F(); f.hutWake = true;
  await narr('A fire. A smell of pine smoke and boiled roots. A ceiling made of old dark beams.');
  await say('vane', 'neutral', 'You\'re awake. Good. Corpses are heavy and the ground is frozen.');
  await me('shock', 'Who… who are you?');
  await say('vane', 'neutral', 'Nobody. An old man with one arm and no visitors. Call me "old man." Everyone who\'s left alive does.');
  await me('anger', 'I have to go. They took my sister — the Inquisition — I have to—');
  await say('vane', 'neutral', 'Go where? You walked into the Realm of No Return, pup. Nobody walks in. And nobody walks out.');
  await say('vane', 'neutral', 'The weather changes every hour. The beasts here eat bears for practice. And the air—');
  await say('vane', 'sad', 'The air is so thick with mana it eats you from the inside. That ache in your chest? That\'s the mountain chewing. A week, and you\'ll be dead.');
  await me('sad', '…Then why did you save me?');
  await say('vane', 'neutral', '…Hm. Good question. Ask me again in a few years.');
  await say('vane', 'neutral', 'Dawn. The standing stones, east of the hut. I\'ll teach you how to breathe. Don\'t be late. The poison won\'t be.');
  Story.quest('Meet the old man at the standing stones east of the hut.');
}
async function talkVaneStone() {
  const f = F();
  if (!f.cultivation) return vaneLesson();
  if (f.vaneDone) { await say('vane', 'neutral', 'Go on. South. Don\'t make me carry you out too.'); return; }
  if (f.adultVane) return vaneFinal();
  await say('vane', 'neutral', 'Again.'); return vaneYears();
}
async function vaneLesson() {
  const f = F();
  Weather.set('clear', true);
  await narr('Green light ripples across the sky. The old man sits cross-legged in the snow between the stones, his one hand resting on his knee.');
  await say('vane', 'neutral', 'Sit. The mana here is a river. You\'ve been trying to swim against it. Stop. Breathe it in. Let it pass through you, and keep what you need.');
  await say('vane', 'neutral', 'The old Drags had a name for it. Tomb Breath. Your people\'s blood was made for this air. You just never had to learn.');
  await breathe(3);
  f.cultivation = true; sfx('level');
  toast('You learned <b style="color:#46ff95">Tomb Breath</b>. In the Realm, mana now restores you. New battle command: <b>Cultivate</b>.', 5000);
  Story.heal(true);
  await say('vane', 'happy', 'Hm. Faster than I was. Don\'t let it go to your head.');
  await say('vane', 'neutral', '…No. That\'s not luck. That\'s the blood. I\'ve crossed swords with a few Drags in my life, pup. You people cheat.');
  await say('vane', 'neutral', 'Your bodies waste nothing. Every muscle fires when it should and not a moment before. You see a strike once, and your body remembers it forever. A human needs ten years to learn what a Drag learns in one.');
  await say('vane', 'neutral', 'That\'s why you dodge like water and parry like you read the blade\'s mind. That\'s why the Crown hates you. People always hate what learns faster than they do.');
  await say('vane', 'neutral', 'And your eyes. When you breathe, they don\'t just glow. They LOOK. At the mana. You can see it moving, can\'t you?');
  await me('shock', 'On the bridge… I saw threads. I threw one. It hurt him.');
  await say('vane', 'neutral', 'So it woke. Grief does that. Every Drag has a gift sleeping in the blood, and none are the same twice. Yours sees the current — and moves it.');
  await say('vane', 'sad', 'Throwing it nearly blinded you. Throwing is easy, pup. Any fool can throw. Learn to PULL first. Pulling teaches you where the current wants to go.');
  ['azure', 'sight'].forEach(k => { if (!G.S.arts.includes(k)) G.S.arts.unshift(k); });
  sfx('level'); toast('Learned <b style="color:#7dffb0">Emerald Sight</b> (open your eyes: 3 turns of easy dodges and parries) and <b style="color:#5fd8ff">Azure Tide</b> (the blue aura and its orb).', 5200);
  await say('vane', 'neutral', 'Now. Show me how you swing that stick.');
  await Battle.start({ enemies: ['vane_spar'], noFlee: true, bd: 'snow', intro: 'Sparring: the old man', music: 'battle',
    onTurn: async (B, Bt) => { if (B.turn >= 7) { await Bt.msg('The old man taps your forehead with two fingers. You fall over.', 1600); return 'scripted'; } } });
  Story.heal(true);
  await say('vane', 'neutral', 'Why do you swing like that? Like you\'re trying to kill the air.');
  const c = await ask('me', 'anger', '…', ['Because I\'m going to kill them. All of them.', 'Because I\'m angry.', 'I don\'t know.']);
  if (c === 0) await say('vane', 'neutral', 'All of them. Hm. That\'s a lot of graves to dig with one stick.');
  else if (c === 1) await say('vane', 'neutral', 'Good. Anger is honest. It\'s also stupid. It swings early and it swings wide.');
  else await say('vane', 'neutral', 'That\'s the first true thing you\'ve said. Keep it. We\'ll find out together.');
  await say('vane', 'neutral', 'Tomorrow, the same. And the day after. Until your arms stop shaking or fall off.');
  await narr('Tomorrow becomes a year. A year becomes five.');
  await vaneYears();
}
async function vaneYears() {
  const f = F(); f.resolve = f.resolve || 0;
  const step = async (ms) => { await fadeOut(ms || 600); await fadeIn(ms || 600); };
  // ---- YEAR 1: the hut, the breath, the first question ----
  await Cine.play(CINE.years1(), { music: 'sad' });
  const c1 = await ask('vane', 'neutral', 'Make who pay? Name them.', ['The Inquisition. All of them.', 'Halvard. And Dread.', 'Whoever sold us out.']);
  if (c1 === 0) await say('vane', 'neutral', 'All of them. Thousands of men. Cooks, stable boys, the ones who joined because their village was starving. All of them?');
  else if (c1 === 1) { await say('vane', 'neutral', 'Two names. Better. Smaller graves. Still graves.'); f.resolve++; }
  else { await say('vane', 'sad', 'The traitor. Mm. Someone from your own valley, with your own eyes. When you find them, ask them why first. You may not like how much the answer sounds like you.'); f.resolve++; }
  // ---- YEAR 2: the wolf-mother ----
  await step(); await Cine.play(CINE.years2(), { music: 'sad' });
  const c2 = await ask('me', 'anger', '(Your blade is already raised.)', ['Finish it. It\'s a monster.', 'Lower the sword.']);
  if (c2 === 0) { await narr('You hesitate one heartbeat too long. The mother drags her cubs into the white and is gone.'); await say('vane', 'neutral', 'Your arm stopped on its own. Interesting. Your head said "monster." Your hand knew better.'); }
  else { f.resolve += 2; await narr('You lower the sword. The mother stares at you for a long time. Then she licks her cubs and limps away into the snow.'); await say('vane', 'happy', 'Hm.'); }
  await say('vane', 'neutral', 'She would have killed you to protect hers. So would you. Remember that the next time someone calls you a monster — and the next time you want to call someone one.');
  // ---- YEAR 3: the stones, the sons ----
  await step(); await Cine.play(CINE.years3(), { music: 'battle' });
  await Battle.start({ enemies: ['vane_spar'], noFlee: true, bd: 'snow', intro: 'Year Three — sparring between the stones', music: 'battle',
    onTurn: async (B, Bt) => { if (B.turn >= 7) { await Bt.msg('The old man takes a step back. Just one.', 1500); return 'scripted'; } } });
  Story.heal(true);
  await say('vane', 'neutral', 'Enough flailing. Watch.');
  await narr('He sheathes his blade. Stands perfectly still. Then — you never see it move. A branch three paces away falls in two pieces, and the sword is already back in its sheath.');
  await say('vane', 'neutral', 'A sword is loudest in its sheath, pup. The draw IS the cut. Keep the blade home until the moment it has to leave — and bring it home before they know it left.');
  await say('vane', 'happy', 'It took me twenty years. You have five. Start now.');
  if (!G.S.arts.includes('horizon')) G.S.arts.push('horizon');
  sfx('level'); toast('Learned Vane\'s sheathed style and <b style="color:#cfe8ff">Horizon Draw</b> — one draw-cut across the whole enemy line. Sword techniques never make your eyes blaze.', 5200);
  await say('vane', 'neutral', 'You want to kill the men who burned your village. They have sons. When the sons grow up, they\'ll come for you. Will you kill them too?');
  const c3 = await ask('me', 'anger', '…', ['I would.', '…I don\'t know.', 'No. Somebody has to stop.']);
  if (c3 === 0) { await say('vane', 'neutral', 'And their sons?'); await me('anger', '…I would.'); await say('vane', 'sad', 'Then you\'re not ending anything, pup. You\'re just taking your turn.'); }
  else if (c3 === 1) { f.resolve++; await say('vane', 'neutral', 'Good. "I don\'t know" is where every honest answer starts.'); }
  else { f.resolve += 2; await say('vane', 'sad', 'Somebody. Easy word. It means the one who gets hit last and doesn\'t hit back. It\'s the hardest job there is.'); }
  // ---- YEAR 4: the stones that have a will ----
  await step(); await Cine.play(CINE.years4(), { music: 'night' });
  await say('vane', 'neutral', 'D-stones. Pieces of the tomb you were born under. Every king alive would kill to own one, and most of them have.');
  await say('vane', 'neutral', 'The small ones are tools. Set one in a blade, it bites deeper. In armor, it holds. In your Arts — it remembers them for you.');
  await say('vane', 'neutral', 'The middle ones are not tools. They have a will. They choose who carries them. Most men who force one end up carried BY it.');
  await say('vane', 'sad', 'And the great ones… I saw one once, in the Crown\'s vault. It was humming. Three soldiers were guarding it. All three were weeping and couldn\'t say why.');
  await say('vane', 'neutral', 'That\'s why the Crown registers every stone. An unregistered stone is a hanging. They don\'t fear thieves, pup. They fear anyone strong enough to say no.');
  await say('vane', 'neutral', 'Here. A small one. A Still Shard. It quiets the blood. You\'ll need it — yours runs hot.');
  Stones.give('still');
  await me('neutral', '…Revenge is like the middle ones, isn\'t it. You think you\'re carrying it.');
  await say('vane', 'happy', '…Hm. You\'re getting annoying. That\'s how I know you\'re learning.'); f.resolve++;
  // ---- the egg in the shrine ----
  await narr('That night you go back to the ruined shrine alone. Something under the broken altar is warm — warmer than the stones, warmer than you.');
  await narr('An egg. Black as a starless night, the size of your two fists, wrapped in the rotted silk of an old Drag offering. When you touch it, it knocks back.');
  await say('vane', 'shock', '…Put that down. Slowly. — No. Don\'t. It\'s already decided it\'s yours.');
  await say('vane', 'sad', 'Three hundred years since anyone saw a dragon egg that wasn\'t stone. The Crown would burn the whole Realm to get it. The Hollow Saint would make it a god.');
  const ce = await ask('me', 'neutral', '…', ['Then nobody will know.', 'I\'ll protect it.', 'What if it grows up like Fratenaptor?']);
  if (ce === 2) await say('vane', 'neutral', 'Then raise it so it doesn\'t. Same as you, pup. Nobody is born a monster. They\'re taught.');
  else await say('vane', 'happy', 'Hm. Keep it warm. Keep it secret. And for the love of every Elder, don\'t let it hatch in my bed.');
  f.dragonEgg = 1; sfx('level'); toast('Found a <b style="color:#8fd0ff">mysterious black egg</b>. Keep it warm.', 3600);
  // ---- YEAR 5: the lesson that isn't about the sword ----
  await step(); await Cine.play(CINE.years5(), { music: 'sad' });
  await say('vane', 'neutral', 'Out there, there\'s a whole generation of children with green eyes. Your age. Younger. Every one of them taught the same thing you were: hide, or hate.');
  await say('vane', 'neutral', 'Your friend in the mountains — the burned boy. The winds say he\'s gathering them. He\'ll lead them to a war. They\'ll follow, because nobody else ever offered them anything.');
  await say('vane', 'sad', 'I was the best killer of my generation, pup. Forty years. And when it was over, nothing I cut down had made one single thing better. I left nothing behind but a reputation and an empty sleeve.');
  await say('vane', 'neutral', 'Don\'t be the best killer of yours. Be the one who leads them somewhere else. Somewhere that isn\'t a graveyard. A new beginning — for Drags, and for the ones who are afraid of them.');
  const c5 = await ask('me', 'neutral', '…', ['I don\'t know how to lead anyone.', 'I\'ll still find Ilya first.', 'Then teach me how.']);
  if (c5 === 0) await say('vane', 'happy', 'Nobody does. You start by refusing to hate the people in front of you. Then you see who follows.');
  else if (c5 === 1) await say('vane', 'neutral', 'Of course you will. Find her. Just don\'t burn the world down on the way. She has to live in it afterwards.');
  else { f.resolve++; await say('vane', 'happy', '…I can\'t. Nobody taught me. We\'ll have to find out together, you and I. Same as everything else.'); }
  // ---- the egg hatches ----
  await narr('The night of the deep frost, the egg cracks. A tiny black dragon tumbles out onto your blanket — all head and wings and enormous blue eyes — sneezes a spark, and falls asleep on your hand.');
  await say('vane', 'happy', '…It hatched in my bed. Of course it did.');
  const dn = await ask('me', 'happy', 'It needs a name.', ['Onyx', 'Midnight', 'Soot', 'Nyx']);
  G.S.dragonName = ['Onyx', 'Midnight', 'Soot', 'Nyx'][Math.max(0, dn)]; f.dragonHatched = 1; delete f.dragonEgg;
  sfx('level'); toast(`<b style="color:#8fd0ff">${G.S.dragonName}</b> the baby dragon joined you! It will help in battle. (Menu → Companions)`, 4200);
  await say('vane', 'neutral', `${G.S.dragonName}. Fine. It eats like you, too.`);
  f.newDawn = f.resolve >= 4;
  await fadeOut(900);
  await Story.timeSkip();
  f.adultVane = true;
  await World.load('realm', 28, 15, 'right'); await fadeIn(900);
  banner('Five Years Later', 'The Realm of No Return');
  await vaneFinal();
}
async function vaneFinal() {
  const f = F();
  Weather.set('clear', true);
  await say('vane', 'neutral', 'You\'re taller than me now. I hate it.');
  await say('vane', 'neutral', 'Before you go anywhere, one more question. The last one. Answer it honestly or don\'t answer at all.');
  const c = await ask('vane', 'neutral', 'If you find the man who took your sister — and he\'s on his knees — what do you do?', ['I kill him.', 'I take her home. That\'s all.', 'I don\'t know yet.']);
  f.vaneAnswer = c;
  if (c === 0) { await say('vane', 'sad', 'Then you\'ve learned the sword and nothing else. Hatred is a debt, pup. Somebody always inherits it. Usually a child.'); await say('vane', 'neutral', 'Your friend in the mountains. The burned one. He wants to build a better world on top of the old one\'s bones. Bones grow the same weeds, pup.'); }
  else if (c === 1) { await say('vane', 'happy', '…Hm. Five years, and that\'s the first time you\'ve made me proud.'); await say('vane', 'neutral', 'Remember it when someone hands you a reason to forget.'); }
  else { await say('vane', 'neutral', 'Good. A man who\'s sure is a man who\'s stopped looking.'); await say('vane', 'neutral', 'When you find out, make sure it\'s your answer. Not your anger\'s. Not your friend\'s.'); }
  await me('neutral', 'You never told me who you were. Who you really were.');
  await say('vane', 'sad', '…No. I didn\'t.');
  f.vaneName = true;
  await say('vane', 'neutral', 'Vane. Once they called me the Sword Saint of the West. Forty years, I never lost a duel. Kings paid me to stand behind their thrones and look frightening.');
  await say('vane', 'sad', 'Then the Crown sent me against a giant in black armor, with a sword as long as a door. Dread. They wanted to know which of their weapons was sharper.');
  await say('vane', 'sad', 'One stroke. He took the arm, and the title, and he let me live. The Crown called it shame and threw what was left of me in here.');
  await say('vane', 'neutral', 'But I\'ll tell you something I never told the Crown. He fought like a man who wanted to lose. And behind the visor — I would swear on what\'s left of my sword arm — his eyes were green.');
  await me('shock', '…Green? Dread is… a Drag?');
  await say('vane', 'neutral', 'I don\'t know what he is. Neither do you. Remember that before you decide what to do with him.');
  await say('vane', 'sad', 'And one more name, since you\'re going out there. Caspian Thorne. My first student. The best I ever had — before you.');
  await say('vane', 'sad', 'He left me for a chair beside the throne. The night before I faced Dread, Caspian told the Crown every habit I had. Now he\'s one of the Four Pillars. SSS, the Guild would call him.');
  await say('vane', 'neutral', 'If you ever meet a swordsman who fights the way I taught you — and smiles while he does it — walk away. He\'s been looking for my grave for twenty years. He\'ll settle for my student.'); F().caspianKnown = true;
  await me('neutral', 'You told me once about the Dragonoid. You never told me what it is.');
  await say('vane', 'sad', 'Because nobody knows, pup. That\'s the point of it. Every Drag can become one — that\'s what the old texts say. Not a gift. Past the gift. Fratenaptor\'s own shape, worn by a mortal.');
  await say('vane', 'sad', 'Nobody has done it in three hundred years. The art is lost. Forbidden. The Crown burned every book that so much as named it, and then burned the people who\'d read them.');
  await say('vane', 'neutral', 'You think the Crown cages you for your eyes? For your quick hands? No. They cage you because any one of you might be the one who remembers how. That\'s the fear under all the other fears.');
  await say('vane', 'neutral', 'Now — throw it. The way I taught you. Not angry.');
  if (!G.S.arts.includes('crimson')) G.S.arts.push('crimson');
  sfx('level'); toast('Mastered <b style="color:#ff6a5a">Crimson Tide</b> — the red aura. Blue holds; red destroys.', 4600);
  await say('vane', 'happy', 'Now. Draw. If you can make me use the sleeve, you\'re ready.');
  const r = await Battle.start({ enemies: ['vane'], noFlee: true, boss: true, bd: 'snow', music: 'boss', intro: 'FINAL LESSON — Vane, the Sword Saint',
    onTurn: async (B, Bt) => { const e = B.actors.find(a => a.key === 'vane'), me = Bt.me();
      if (e && !e.t1 && e.hp < e.maxHp * .6) { e.t1 = 1; await Bt.msg('Vane: "Better. Stop trying to kill me and you might actually hit me."', 1800); }
      if (e && e.hp < e.maxHp * .3) { await Bt.msg('Vane lowers his blade. He is smiling.', 1400); return 'win'; }
      if (me.hp < me.maxHp * .22) { await Bt.msg('Vane\'s blade stops a hair from your throat.', 1400); return 'lose'; } } });
  Story.heal(true);
  if (r === 'win') await say('vane', 'happy', 'There it is. You made me use the sleeve. …Don\'t tell anyone. I have a reputation.');
  else await say('vane', 'happy', 'Not today. But you stopped fighting angry halfway through. That\'s the lesson. The rest is just practice.');
  await say('vane', 'neutral', 'The draw is mine, pup. Anyone who ever saw me fight will know it the moment you cut. Some of them will be glad. Some of them will want you dead for it. Use it anyway.');
  await say('vane', 'neutral', 'Three weeks ago a courier\'s boat broke apart on the river at the edge of the Realm. I took this off his body.');
  await narr('A waterlogged Inquisition ledger. One line, in neat ink: "Girl, green-eyed, ribbon on wrist. Transfer via Ashford Hollow."');
  await me('shock', '…She\'s alive.');
  await say('vane', 'neutral', 'And this.');
  await narr('He holds out his sword, hilt-first. The one that never left his side in five years.');
  await say('vane', 'neutral', 'Last Light. It was never sharp because of the steel. Don\'t fight to kill, pup. Fight so that it ends.');
  sfx('level'); toast('You received <b style="color:#46ff95">Last Light</b>, Vane\'s blade.', 4000);
  G.S.stats.atk += 3; G.S.f.vaneDone = true;
  await say('vane', 'sad', '…Go on. South, through the storm. You know how to breathe it now. Don\'t come back. Old men hate goodbyes.');
  Story.quest('Leave the Realm of No Return — south, through the storm.');
  World.ent('vane') && (World.ent('vane').talk = talkVaneStone);
}
Story.timeSkip = async function () {
  G.S.kid = false; G.S.hood = true;
  G.S.xpTotal = Math.max(Power.xp(), 420); G.S.lvl = Power.now().step + 1; G.S.sp = G.S.sp || {}; G.S.sp.me = (G.S.sp.me || 0) + 3;
  const st = G.S.stats; st.maxHp = 80; st.maxMp = 24; st.atk = 16; st.def = 7; st.spd = 12; st.hp = st.maxHp; st.mp = st.maxMp;
  $('#loading').classList.remove('hide'); $('#loadTxt').textContent = 'Five years pass…'; await wait(30);
  G.A.portCache = {}; await buildPlayerSprites(); $('#loading').classList.add('hide');
};
