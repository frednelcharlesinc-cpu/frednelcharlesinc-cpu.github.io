'use strict';
/* ================= STORY: characters, scenes, quests ================= */
Object.assign(CHAR, {
  ilya: { name: 'Ilya', sprite: 'ilya' }, nana: { name: 'Nana', sprite: 'nana' }, oren: { name: 'Oren', sprite: 'oren' },
  mei: { name: 'Mei', sprite: 'mei' }, jun: { name: 'Jun', sprite: 'jun' }, asha: { name: 'Asha', sprite: 'asha' },
  halvard: { name: 'Halvard', sprite: 'halvard' }, acolyte: { name: 'Acolyte', sprite: 'acolyte' },
  maren: { name: 'Maren', sprite: 'maren' }, tobb: { name: 'Tobb', sprite: 'tobb' }, pip: { name: 'Pip', sprite: 'pip' }, pipmom: { name: "Pip's Mother", sprite: 'pipmom' },
  kess: { name: 'Kess', sprite: 'kess' }, kessE: { name: 'Kess', sprite: 'kess_eyes' }, voss: { name: 'Captain Voss', sprite: 'voss' }, guard: { name: 'Guard', sprite: 'guard' },
  rook: { name: 'Rook', sprite: 'rook' }, bandit: { name: 'Bandit', sprite: 'bandit' }, sable: { name: 'Sable', sprite: 'hunter' }, cassel: { name: 'Brother Cassel', sprite: 'cassel' },
  hoshi: { name: 'Old Hoshi', sprite: 'hoshi' }, bram: { name: 'Bram', sprite: 'innkeep' }
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
SCENES = {};
SCENES.thornvale = {
  title: 'Thornvale', subtitle: 'A hidden Drag village', safe: true,
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
      L.push({ id: 'ilya', x: f.hs === undefined ? 10 : HIDE[Math.min(f.hs || 0, 2)][0], y: f.hs === undefined ? 14 : HIDE[Math.min(f.hs || 0, 2)][1], dir: 'left', talk: talkIlya, hidden: f.hs !== undefined && f.hs < 3 && f.hs >= 0 && !f.found3, ghostTalk: true,
        show: () => true });
      L.push({ id: 'nana', x: 17, y: 12, dir: 'down', talk: talkNana, ai: 'turn', turns: ['down', 'left', 'right'] });
      L.push({ id: 'oren', x: 26, y: 14, dir: 'left', talk: talkOren, ai: 'bark', barks: () => ['*clang* *clang*', 'Hah! Good steel.', 'Ember Festival tonight!'] });
      L.push({ id: 'mei', x: 13, y: 22, dir: 'down', talk: talkMei, ai: 'turn' });
      L.push({ id: 'jun', x: 29, y: 18, dir: 'down', talk: talkJun, ai: 'wander', area: [27, 17, 32, 19] });
      L.push({ id: 'asha', x: 37, y: 15, dir: 'right', talk: talkAsha, ai: 'turn', turns: ['right', 'up', 'down'] });
      if (f.dusk) {
        L.forEach(n => { if (n.id === 'ilya') { n.x = 16; n.y = 17; n.hidden = false; } if (n.id === 'nana') { n.x = 15; n.y = 17; } if (n.id === 'oren') { n.x = 19; n.y = 17; n.ai = null; } if (n.id === 'mei') { n.x = 15; n.y = 19; } if (n.id === 'jun') { n.x = 19; n.y = 19; n.ai = null; } });
      }
    } else if (f.after) {
      L.push({ id: 'nana', x: 17, y: 12, dir: 'down', talk: talkNanaAfter });
      L.push({ id: 'mei', x: 14, y: 13, dir: 'right', talk: async () => { await say('mei', 'sad', "Jun and I will carry Nana to the caves. Don't look back, {name}. Go get her."); } });
      L.push({ id: 'jun', x: 20, y: 13, dir: 'left', talk: async () => { await say('jun', 'anger', "They took Oren in chains. Seven of us. And Ilya."); } });
    }
    return L;
  },
  exits: [
    { x: 43, y: 14, y2: 16, to: 'ashford', tx: 29, ty: 39, dir: 'up', msg: "Ilya's still waiting for you to find her.", when: () => !F().after },
    { x: 43, y: 14, y2: 16, to: 'ashford', tx: 29, ty: 39, dir: 'up', check: async () => { UI.controls(false); await narr("You follow the wagon ruts east, out of the only home you've ever known."); Dlg.close(); await Story.prologueEnd(); return true; }, when: () => F().after }
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
  il.hidden = true; F().hs = 0; Story.quest('Find Ilya — she is hiding somewhere in Thornvale (3 times).');
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
      await say('ilya', null, "Again! Count to ten! No peeking!"); e.hidden = true;
      const [x, y] = HIDE[f.hs]; e.x = x; e.y = y; e.px = x * 32 + 16; e.py = y * 32 + 26;
      Story.quest(`Find Ilya — ${3 - f.hs} more time${3 - f.hs > 1 ? 's' : ''}.`);
    } else { f.found3 = true; Story.quest("Visit Nana's house with Ilya (north of the road)."); e.ai = 'follow'; }
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
  await say('nana', 'happy', "There's my birthday girl. Eight years old. Eight! When did that happen?");
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
  await narr('Oren lifts a cloth from the anvil. Beneath it: a slim, single-edged blade, dark as river stone.');
  await say('oren', 'happy', "Your father's. I reforged it. It's yours now.");
  await say('oren', 'neutral', "Listen to me. The Inquisition's been seen on the far roads. If they ever come here, you don't stand and trade blows like a fool.");
  await say('oren', 'neutral', "You watch the swing. You DODGE, or you PARRY — and if you parry every blow they throw, you'll have them wide open for a counter.");
  await say('oren', 'anger', "And the fire in your blood… only when you have to. Every time your eyes blaze, someone remembers them.");
  await me('neutral', "You sound like Nana.");
  await say('oren', 'happy', "Nana's the smartest person in Thornvale. Now get. Dusk is coming.");
  sfx('coin'); toast('You received <b style="color:#46ff95">Father\'s Blade</b>.');
  await fadeOut(800);
  f.dusk = true; await World.load('thornvale', 17, 19, 'up'); await fadeIn(800);
  banner('Dusk', 'The Ember Festival');
  Story.quest('Join everyone at the festival fire.');
}
async function festival() {
  const f = F(); if (f.festDone) return; f.festDone = true;
  await narr('The festival fire crackles green and gold. Jun throws a pinch of powder and the sparks dance like tiny dragons.');
  await say('ilya', null, "{Sib}… can I ask you something?");
  await say('ilya', null, "Why do we have to hide? Our eyes are pretty. Nana says people out there think we're monsters.");
  const c = await ask('ilya', null, "Are we monsters?", ["No. People are just afraid of what they don't understand.", "Some people need a monster to blame.", "I don't know, Ilya."]);
  if (c === 0) await say('ilya', null, "Then we just have to make them understand! I'll do it. I'm very convincing.");
  else if (c === 1) await say('ilya', null, "…That's sad. I'd rather be blamed than be the one doing the blaming.");
  else await say('ilya', null, "That's okay. You can not-know with me. We'll figure it out together.");
  await say('nana', 'sad', "Fratenaptor nearly ended the world four hundred years ago. And people decided our eyes meant we'd finish the job.");
  await say('nana', 'neutral', "One day I'll tell you both what really happened. When you're older.");
  await narr('Far off, from the ridge road, a horn sounds. Then another. Then bells.');
  await say('asha', 'shock', "INQUISITION! White cloaks on the ridge — they found the bridge!");
  World.shake = 400; sfx('alarm');
  await say('oren', 'anger', "Mei, Jun — get the children to the caves! {name}, with me!");
  await say('ilya', null, "{Sib}?!");
  const il = World.ent('ilya'); il.hidden = true;
  f.raid = true; await fadeOut(500); await World.load('thornvale', 30, 15, 'right'); await fadeIn(500);
  banner('The Raid', 'Thornvale burns');
  const o = await World.addNpc({ id: 'oren', x: 31, y: 14, dir: 'right' });
  const a1 = await World.addNpc({ id: 'acolyte', x: 35, y: 15, dir: 'left' }), a2 = await World.addNpc({ id: 'acolyte2', sprite: 'acolyte', x: 36, y: 14, dir: 'left' });
  await say('acolyte', 'anger', "By order of the Ember Inquisition: every green-eyed soul in this valley is forfeit.");
  await say('oren', 'anger', "Then come and take them, priest.");
  const r = await Battle.start({ enemies: ['acolyte', 'acolyte'], allies: ['oren'], tutorial: true, noFlee: true, bd: 'dusk', intro: 'The Inquisition attacks!' });
  if (r === 'lose') { Story.heal(true); }
  World.remove('acolyte'); World.remove('acolyte2');
  await say('oren', 'happy', "Ha! You were listening after all.");
  const h = await World.addNpc({ id: 'halvard', x: 37, y: 15, dir: 'left' });
  const il2 = await World.addNpc({ id: 'ilya', x: 38, y: 15, dir: 'left' });
  await narr('A man in white walks onto the bridge. He is holding a small girl by the wrist. The ribbon on her arm is green.');
  await say('ilya', null, "{SIB}! Let go of me! LET GO!");
  await say('halvard', 'neutral', "Calm, child. No one will hurt you. You are going somewhere you can be… corrected.");
  await say('halvard', 'neutral', "And you must be the brother. The sister. It hardly matters. The eyes are the same.");
  await me('anger', "Let. Her. Go.");
  await say('halvard', 'happy', "Fratenaptor's blood doesn't sleep. One day it wakes — in her, in you — and the world burns. I am the firebreak.");
  await Battle.start({ enemies: ['halvard_pro'], allies: ['oren'], noFlee: true, bd: 'dusk', boss: true, intro: 'Inquisitor Halvard',
    onTurn: async (B, Bt) => { if (B.turn >= 6) { await Bt.msg('Halvard: "Enough."', 1000); B.flash = 1.5; sfx('light'); await wait(500); B.actors.filter(a => a.side === 'p').forEach(a => { a.hp = 0; a.ko = true; a.anim = 'hurt'; a.frame = 5; }); Bt.hud(); await Bt.msg('PURGING LIGHT', 1400); return 'scripted'; } } });
  await fadeOut(200); await fadeIn(200);
  await narr('White light. Then nothing but the ringing in your ears.');
  await say('oren', 'sad', "{name}… run… don't let them see your…");
  await say('ilya', null, "{SIB}!! {SIB}, GET UP!");
  await narr('The last thing you see is a scrap of green ribbon, reaching for you through the smoke.');
  Music.play('sad'); await fadeOut(1400);
  f.after = true; await World.load('thornvale', 17, 13, 'up'); World.remove('ilya'); await wait(400); await fadeIn(1400);
  banner('Morning', 'What is left');
  Story.quest('Talk to Nana.');
}
async function talkNanaAfter() {
  const f = F();
  if (f.hoodGiven) { await say('nana', 'sad', "Go. East, along the wagon ruts. Ashford Hollow. Don't look back, child."); return; }
  await say('nana', 'sad', "There you are. I thought… I thought they'd taken you too.");
  await me('sad', "They took Ilya. And Oren. I couldn't — I wasn't —");
  await say('nana', 'sad', "Hush. You were brave. Brave is not the same as able. That comes later.");
  await narr('Nana presses a bundle of grey cloth into your hands. An old traveling hood, mended a hundred times.');
  await say('nana', 'neutral', "Your grandfather wore this through every town between here and the sea. No one ever saw his eyes. No one ever sent the Inquisition after him.");
  await say('nana', 'neutral', "The wagons always stop at Ashford Hollow first. Find out where they took her. And keep your eyes hidden, {name}.");
  await say('nana', 'sad', "Out there, people will decide who you are before you open your mouth. Don't let them be right.");
  f.hoodGiven = true; G.S.hood = true; sfx('hood'); Story.heal(true);
  toast('You received <b style="color:#46ff95">Grandfather\'s Hood</b>. Tap <b>Hood</b> to raise or lower it.', 4200);
  Story.quest('Follow the wagon ruts east across the bridge to Ashford Hollow.');
  UI.hud();
}
Story.prologueEnd = async function () {
  G.S.chapter = 1; G.S.stats.hp = G.S.stats.maxHp; G.S.stats.mp = G.S.stats.maxMp;
  await fadeOut(800);
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
  return base;
};
SCENES.ashford = {
  title: 'Ashford Hollow', subtitle: 'Market town of the eastern vale', music: 'town', bd: 'town',
  crowd: { count: 20, areas: [[22, 19, 37, 25], [5, 20, 20, 23], [28, 27, 31, 37], [39, 20, 54, 23], [33, 33, 48, 34], [22, 19, 37, 25]], talk: talkFolk, lines: FOLK_LINES },
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
    }
  }
};
async function fountain() {
  await narr('A three-tiered fountain. Someone scratched a dragon\'s eye into the stone basin. Someone else tried very hard to scrub it out.');
  if (F().marenKnows) await narr('This is where they hanged him. The little girl\'s father.');
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
    : ['"Morning, traveler. Market\'s busy today."', '"The Inquisition\'s wagons came through two nights back. Cages. Children in some."', '"Don\'t mind Brother Cassel, he shouts at everyone."', '"Old Hoshi on the bench remembers the days before the purges. Ask him, if you\'ve got an hour."', '"Tobb\'s tonics are overpriced but they work."', '"Captain Voss closed the north road. Inquisition business."', '"My grandmother says Drags were heroes once. My grandmother also talks to her chickens."'];
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
    opts.push('Leave');
    const c = await ask('tobb', f.tobbKnows ? 'shame' : 'happy', f.tobbKnows ? 'Well? Gold first. Customer… policy.' : `What can I get you? (You have ${G.S.gold}g)`, opts);
    const o = opts[c];
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
    if (c === 0) await say('cassel', 'happy', "Corrected! Purified! At Greyspire, the blood is… quieted. Inquisitor Halvard himself oversees it.");
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
  encounters() { const r = Math.random(); return { enemies: r < .5 ? ['lupine'] : r < .85 ? ['lupine', 'lupine'] : ['lupine', 'lupine', 'lupine'], bd: 'forest' }; },
  npcs() {
    const f = F(); const L = [];
    if (!f.rookBeaten) { L.push({ id: 'rook', x: 42, y: 17, dir: 'left', talk: talkRook }); L.push({ id: 'bandit', x: 40, y: 18, dir: 'left', talk: async () => say('bandit', 'anger', "Talk to the boss, hood. I just stab people.") }); }
    if (!f.alphaBeaten) L.push({ id: 'alpha', sprite: 'lupine_alpha', x: 28, y: 26, dir: 'down', ai: 'turn', turns: ['down', 'left', 'right'], talk: talkAlpha });
    return L;
  },
  exits: [{ x: 0, y: 16, y2: 18, to: 'ashford', tx: 58, ty: 21, dir: 'left' }],
  tiles: {
    '9,6': () => shrine(), '8,6': () => shrine(), '10,6': () => shrine(), '9,7': () => shrine(),
    '43,16': () => crate(),
    '8,24': () => spring(), '9,24': () => spring(), '10,24': () => spring(), '11,24': () => spring(), '12,25': () => spring(), '7,25': () => spring()
  },
  async onEnter() { if (!F().woodsTip) { F().woodsTip = true; toast('Beasts hide in the tall grass. The dirt paths are safe.', 3500); } }
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
  f.rookBeaten = true; World.remove('rook'); World.remove('bandit');
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
  await narr("You hoist Tobb's crate onto your shoulder. Bottles clink inside.");
  G.S.side = 'Bring the crate back to Tobb in Ashford Hollow (market stall).';
}
async function talkAlpha() {
  const c = await ask(null, null, 'A huge black beast-man crouches over a carcass. Its yellow eyes find you.', ['Fight it.', 'Back away slowly.']);
  if (c === 1) return;
  const r = await Battle.start({ enemies: ['lupine_alpha', 'lupine'], bd: 'forest', intro: 'The Lupine Alpha howls!' });
  if (r === 'lose') { await Story.defeat(); return; }
  if (r === 'win') { F().alphaBeaten = true; World.remove('alpha'); G.S.items.ether += 2; toast('Found <b>2 Ethers</b> in the beast\'s den.'); }
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
  await say('halvard', 'neutral', "The girl with the ribbon. Your sister. She cried less than the others. Brave little thing.");
  const c = await ask('halvard', 'neutral', "You think this is hatred. It isn't. Fratenaptor's blood doesn't sleep. One day it wakes — in her, in you — and the world burns. I am the firebreak.", ['Where is she?', "You're wrong about us."]);
  if (c === 0) await say('halvard', 'happy', "Somewhere you can't follow. Not with those eyes.");
  else await say('halvard', f.shrineRead ? 'anger' : 'neutral', f.shrineRead ? 'The stone in the east woods? Old carvings. Half-truths. I\'ve read the real texts.' : 'Then prove it. Without the fire.');
  if (G.S.party.includes('kess')) await say('kessE', 'anger', "I've heard you sing over the cages at night, Halvard. Let's hear you sing now.");
  const r = await Battle.start({ enemies: ['halvard', 'acolyte'], noFlee: true, boss: true, bd: 'mill', intro: 'Inquisitor Halvard draws a staff of pale light!',
    onTurn: async (B, Bt) => { const h = B.actors.find(a => a.key === 'halvard'); if (h && !h.taunt && h.hp < h.maxHp * .3) { h.taunt = true; await Bt.msg('Halvard: "She bit me, you know. Your sister. Same fire."', 1800); } } });
  if (r === 'lose') { await Story.defeat(); return; }
  f.halvardBeaten = true; World.remove('halvard');
  await ending(r);
}
async function ending() {
  const f = F(); const blazed = !G.S.hood;
  await narr('Halvard falls to one knee. The light around him gutters out.');
  await say('halvard', 'shock', blazed ? 'That fire… and you aimed it at me, not at the town. Maybe I read the texts wrong.' : 'You never used it. The fire. Why?');
  await say('halvard', 'sad', "She isn't here. They moved the children at dawn. To Greyspire Citadel.");
  const c = await ask('halvard', 'neutral', 'Go on, Drag. Be what the stories say you are.', ['Spare him.', 'End him.']);
  if (c === 0) { f.halvardSpared = true; await me('anger', "No. I'm not your story."); await narr("You leave him kneeling in the dirt. He doesn't look up."); }
  else { f.halvardKilled = true; await narr("It's quick."); await narr('Somewhere in the trees, a bird stops singing. The stories, you realize, just got one chapter truer.'); }
  await narr('Inside the mill: empty cages. Straw. Chains. And on the floor, a scrap of faded green silk.');
  await narr("The other half of Ilya's ribbon. You tie it to your wrist, next to yours. Now they make one whole knot.");
  await me('sad', "I'll find you. Dragon law.");
  if (f.kessJoined) {
    await say('kessE', 'neutral', 'Greyspire. Nobody comes back from Greyspire.');
    const k = await ask('kessE', 'neutral', '…So what now?', ["Then I'll be the first.", "We'll be the first."]);
    await say('kessE', 'happy', k === 0 ? '"I"? Idiot. "We." Somebody has to stop you glowing in public.' : "…We. Fine. I'm tired of hiding anyway.");
  } else if (f.kessHelp) {
    await narr('At the edge of the clearing, a figure in tinted glasses watches you. When you look up, she nods once — and is gone.');
  }
  f.chapter1Done = true; Story.quest('Chapter I complete. Greyspire Citadel awaits.'); G.S.side = ''; save();
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
