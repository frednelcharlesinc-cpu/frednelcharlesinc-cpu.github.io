'use strict';
/* ================= THE ADVENTURERS' GUILD HALL =================
   Ground floor: Odette the clerk at the counter, the quest board, six adventurers sitting at the tables.
   Upstairs: Guildmaster Brom's office, the records room (the Intel Ledger), the bunks, the training corner.
   GIntel: talk to the seated adventurers. Some talk for free, some want a drink or coin. Each has one new piece
   of intel a day — boss weaknesses, combat tricks, hidden strongboxes (marked with ! once you know), rumours. */
const GX = {
  hrolf:  { name: 'Hrolf', tag: 'C-rank · axe', fee: 8, feeTxt: 'Buy him an ale (8g)', topics: ['boss', 'beast', 'mech'],
    hi: ['"Sit down or move along, you\'re blocking my light."', '"Hrolf. Axe. Ale. In that order."', '"Back from the woods three days and my boots still smell of wolf."'],
    done: ['"I\'ve told you what I know. Now I\'m drinking what I bought."', '"Tomorrow. Come back tomorrow, my throat\'s dry."'] },
  wisp:   { name: 'Wisp', tag: 'D-rank · knives', fee: 25, feeTxt: 'Slide over some coin (25g)', topics: ['chest', 'chest', 'rumor'],
    hi: ['"…You\'re standing very close for someone I don\'t know."', '"Information isn\'t free. Neither are knives. Pick one."', '"Wisp. Don\'t bother remembering it, nobody does."'],
    done: ['"One secret a day. Any more and they stop being secret."', '"Spend what I sold you before you buy more."'] },
  pell:   { name: 'Pell', tag: 'E-rank · apprentice mage', fee: 0, topics: ['mech', 'mech', 'lore'],
    hi: ['"Oh! Hi! Sorry, I was — chapter nine. Mana resonance. It\'s VERY exciting."', '"Did you know most people parry too early? I wrote it down. Page forty."', '"Pell! E-rank! For now!"'],
    done: ['"I\'m still on the same page. Come back tomorrow, I\'ll have learned something new!"', '"That\'s everything I\'ve written down today. Mostly."'] },
  aldous: { name: 'Sir Aldous', tag: 'B-rank · retired knight', fee: 0, topics: ['boss', 'mech', 'boss'],
    hi: ['"Sit, sit. An old man likes company more than he admits."', '"This arm? A troll in the Grimtooth pass. You should see the troll. Well — you can\'t. Nobody can. He\'s gone."', '"Forty years of fighting, and the lesson is always the same: watch the shoulders, not the blade."'],
    done: ['"One war story a day. Doctor\'s orders."', '"Come back tomorrow. I\'ll remember another one by then."'] },
  faelin: { name: 'Faelin', tag: 'C-rank · elf archer', fee: 8, feeTxt: 'Buy her a cup of wine (8g)', topics: ['beast', 'chest', 'road'],
    hi: ['"Humans always sit too loudly."', '"Faelin. I scout. I see things on the roads nobody else bothers to look at."', '"You walk like someone who has been hunted. Interesting."'],
    done: ['"I told you what the roads told me. They\'ll say more tomorrow."', '"Patience. Even arrows wait for the wind."'] },
  durn:   { name: 'Durn Ironmug', tag: 'D-rank · dwarf brawler', fee: 6, feeTxt: 'Buy him a pint (6g)', topics: ['rumor', 'raid', 'rumor'],
    hi: ['"HA! A new face! Sit, sit — first round\'s on you!"', '"Durn Ironmug. The mug is iron. The rest of me is mostly ale."', '"Brom\'s my cousin. Twice removed. Mostly removed for the drinking."'],
    done: ['"Already told you everything! And some things twice!"', '"Tomorrow, friend. I\'ve got a reputation for gossip, not miracles."'] }
};
const GX_SEATS = { hrolf: [2, 6], wisp: [5, 6], pell: [7, 6], aldous: [10, 6], faelin: [10, 8], durn: [13, 8] };
const GX_TALK = { hrolf: 'happy', wisp: 'smirk', pell: 'happy', aldous: 'neutral', faelin: 'neutral', durn: 'happy' };

const GIntel = {
  st() { const S = G.S; S.gx = S.gx || { day: {}, heard: {}, log: [], marks: {} }; S.gx.marks = S.gx.marks || {}; return S.gx; },
  today() { return typeof Cal !== 'undefined' ? Cal.day() : 1; },
  fresh(who) { return this.st().day[who] !== this.today(); },
  /* ---- the pool: every entry is [id, available?, text] ---- */
  pool(topic) {
    const f = G.S.f || {};
    if (topic === 'boss') return [
      ['b_rook', !f.rookBeaten, 'Rook. One of the Gilded Hound\'s dogs. Throws sand in your eyes — and while you\'re blinded, the timing rings shrink. Don\'t get greedy. Parry the ones you\'re sure of and dodge the rest.'],
      ['b_voss', !f.vossBeaten && !f.vossGone, 'Captain Voss fights behind a shield wall. One big swing just bounces off it. Lots of small hits — combos, multi-hit skills — crack the shields. THEN hit him hard.'],
      ['b_alpha', !f.alphaBeaten, 'The Lupine Alpha howls for its pack when it\'s hurt. Hold your big hits until it\'s low, then finish it in one turn — before the howl brings the rest.'],
      ['b_halvard', !f.halvardBeaten, 'Inquisitor Halvard. His faith shield holds as long as one of his Acolytes is standing. Waste nothing on him until the Acolytes are down.'],
      ['b_rime', true, 'Up north the Rime Alphas wear frost armor — eight points of it. A Cast or a guard BREAK shatters it. Hit it with a bare blade first and you\'re just polishing ice.'],
      ['b_wyrm', true, 'Mana Wyrms drink spells. Don\'t open with your best Art. Wear it down with steel, then spend the mana when it\'s staggered.'],
      ['b_kairo', !!f.halvardBeaten && f.duel !== 'won', 'There\'s a scarred one out there whose body ADAPTS. Hit him the same way twice and the second hit lands softer. Keep changing what you throw at him.']];
    if (topic === 'mech') return [
      ['m_feint', true, 'Feint rings. PURPLE feints twice — it pauses, then closes. CYAN stutters backwards before it shuts. YELLOW crawls and then snaps closed at the very end. GREEN fakes you out — it almost closes, opens again, then closes for real.'],
      ['m_red', true, 'A RED ring can\'t be parried or guarded. Dodge it — don\'t be a hero. Eat one and you lose your flow, your footing and a big chunk of health.'],
      ['m_charge', true, 'When a big one starts glowing orange with a ⚡ countdown over its head, it\'s charging. Break its guard before the count hits zero and the whole thing fizzles. If you can\'t — get ready to parry seven to ten hits in a row.'],
      ['m_clash', true, 'In a clash the fire ring shrinks toward the dashed one. Tap the instant they meet. Lose the clash and it costs you mana, your flow, and leaves you wide open.'],
      ['m_perfect', true, 'Dodge at the very last moment — a PERFECT dodge — and you leave an afterimage behind you. The window is tiny, but it\'s the safest way through a barrage.'],
      ['m_quality', true, 'The Guild pays for style, and so does the fight itself. Win clean — perfect parries, no hits taken, quick — and you learn up to four times as much from it.'],
      ['m_guard', true, 'Guard isn\'t cowardice. A guarded turn builds your flow back. Guard, parry the next string, THEN swing.']];
    if (topic === 'beast') return [
      ['x_lupine', true, 'Ashen Lupines hunt the East Woods in packs. Kill the one that circles — that\'s the one that calls the others.'],
      ['x_bandit', true, 'Bandits on the toll-roads wear the Hound\'s gold thread on their sleeves. Leave them breathing and Varro Kade hears your name by sundown.'],
      ['x_troll', true, 'Down in the Drowned Mine there are trolls that heal if you let them stand around. Hit them every single turn.'],
      ['x_acolyte', true, 'Inquisition Acolytes chant before the big blow. If you hear chanting, that\'s your cue to guard or break.']];
    if (topic === 'road') return [
      ['r_mill', true, 'The north road to the Old Mill: there\'s a gap in the fence past the second bend. Patrols never check it.'],
      ['r_millbrook', true, 'Millbrook\'s ferryman, Oswin, will take you across for a song if you\'re polite. Literally. He likes songs.'],
      ['r_woods', true, 'In the East Woods, follow the birch trees if you get lost. They all lean toward the old road.']];
    if (topic === 'raid') return [
      ['d_raid', typeof Raid !== 'undefined', () => `Raid call's on ${Cal.label(Raid.nextCall())}. Monster lords, four lieutenants apiece. The Raid Marshal by the counter signs you up. Bring friends. Bring potions. Bring more potions.`],
      ['d_tourney', true, 'The tournament steward\'s been hanging around all week. Win your rank\'s cup and they stamp a promotion on your card on the spot.'],
      ['d_warcry', !!(G.S.f && G.S.f.rookBeaten), 'Varro Kade\'s running his Warcry festival out in the woods. Fights for coin. Dirty ones. A herald on the east road will point you there.']];
    if (topic === 'lore') return [
      ['l_mana', true, 'Every element is just a shape mana agrees to take. Fire, ice, lightning… The book says some people never bothered with shapes at all. The page after that one has been torn out.'],
      ['l_crystal', true, 'The registration crystal can only show ONE colour. Uncle — I mean, the Guildmaster — says no one\'s ever made it show something else. He says it very fast, though.'],
      ['l_ranks', true, 'E to S, then SS, SSS. They say there\'s a rank past SSS that isn\'t written anywhere. The Dread General, maybe.']];
    if (topic === 'rumor') return [
      ['u_hound', true, 'The Gilded Hound owns half the toll-roads round here. Don\'t borrow from him. People who borrow from him end up in the river, still owing.'],
      ['u_eclipse', true, 'Green Eclipse hit an Inquisition wagon on the south road last week. Freed every cage. Nobody saw a face. Nobody WANTS to.'],
      ['u_auremund', true, 'Auremund! The City That Swallowed the Sun! Somewhere under the Dustveil. Forty expeditions, thirty-nine came back empty. The fortieth… well. Didn\'t come back.'],
      ['u_eight', true, 'Outside the Crown\'s walls, the land belongs to the Eight. Bandit kings, every one SSS. If one of them ever sends you an invitation — go. Saying no is worse.'],
      ['u_dread', true, 'They say the Dread General is heading east. They say a lot of things. I say pray he keeps going.']];
    return [];
  },
  /* a strongbox the player hasn't opened yet — a real one, from the map data */
  async chest() {
    let P = typeof CHESTPOS !== 'undefined' && CHESTPOS;
    if (!P) { try { P = await (await fetch('assets/chests.json')).json(); } catch (e) { return null; } }
    const S = G.S, g = this.st(), out = [];
    for (const mk of ['ashford', 'woods', 'mill', 'millbrook', 'kettlebrook']) {
      const M = G.maps[mk], sc = SCENES[mk]; if (!M || !sc || !P[mk]) continue;
      for (const [x, y] of P[mk]) { const key = `${mk}:${x},${y}`; if (!(S.chests || {})[key] && !g.marks[key]) out.push([mk, x, y, key, +M.w, +M.h, sc.title || mk]); }
    }
    if (!out.length) return null;
    const [mk, x, y, key, w, h, title] = out[Math.floor(Math.random() * out.length)];
    const ns = y < h / 3 ? 'north' : y > h * 2 / 3 ? 'south' : '', ew = x < w / 3 ? 'west' : x > w * 2 / 3 ? 'east' : '';
    const where = ns || ew ? `the ${ns}${ns && ew ? '-' : ''}${ew} side` : 'the middle';
    g.marks[key] = 1;
    return pick([`There's a strongbox nobody's claimed in ${title} — ${where} of it. I'd have taken it myself, but I'm sitting down.`,
      `${title}. ${where[0].toUpperCase() + where.slice(1)}. A smuggler's box, still locked. I\'ve marked it for you — you'll know it when you see it.`,
      `Word is someone stashed a box in ${title}, over on ${where}. Go before somebody less charming does.`]);
  },
  async next(who) {
    const g = this.st(), D = GX[who];
    for (const topic of D.topics.slice().sort(() => Math.random() - .5)) {
      if (topic === 'chest') { const t = await this.chest(); if (t) return { id: 'c' + Date.now(), text: t, chest: 1 }; continue; }
      const opts = this.pool(topic).filter(([id, ok]) => ok && !g.heard[id]);
      if (opts.length) { const [id, , t] = opts[Math.floor(Math.random() * opts.length)]; return { id, text: typeof t === 'function' ? t() : t }; }
    }
    const any = ['rumor', 'mech', 'beast', 'lore', 'boss'].flatMap(t => this.pool(t)).filter(([id, ok]) => ok);
    const [id, , t] = pick(any); return { id, text: typeof t === 'function' ? t() : t, old: 1 };
  },
  async talk(who) {
    const D = GX[who], id = 'gx_' + who, S = G.S, g = this.st();
    await say(id, GX_TALK[who], pick(D.hi));
    if (!this.fresh(who)) { await say(id, 'neutral', pick(D.done)); return; }
    if (D.fee) {
      const c = await ask(null, null, `${D.name} looks like they know things.`, [D.feeTxt, 'Not now']);
      if (c !== 0) return;
      if (S.gold < D.fee) { await say(id, 'smirk', '"With what? Your good looks? Come back with coin."'); return; }
      S.gold -= D.fee; sfx('coin'); UI.hud();
    }
    const it = await this.next(who);
    g.day[who] = this.today(); if (!it.old) g.heard[it.id] = 1;
    await say(id, 'neutral', it.old ? 'Nothing new, but it bears repeating: ' + it.text : it.text);
    g.log.unshift({ who, text: it.text, day: this.today() }); g.log = g.log.slice(0, 40);
    toast(it.chest ? `<b>Intel:</b> a hidden strongbox — marked with <b>!</b> on the map.` : `<b>Intel</b> from ${D.name} — kept in the Guild's Intel Ledger (upstairs).`, 3200);
    save();
  },
  async ledger() {
    const g = this.st();
    if (!g.log.length) { await narr('The Intel Ledger: a fat book of everything adventurers have heard on the road. Your page is empty. Talk to the people at the tables downstairs.'); return; }
    await narr(`The Intel Ledger. Your page has ${g.log.length} entr${g.log.length > 1 ? 'ies' : 'y'}, in Odette\'s neat hand.`);
    for (const e of g.log.slice(0, 6)) await narr(`${GX[e.who] ? GX[e.who].name : '?'}: ${e.text}`);
  }
};

(function () {
  if (typeof SCENES === 'undefined' || !SCENES.a_guild) return;
  const sc = SCENES.a_guild;
  Object.assign(CHAR, { odette: { name: 'Odette', sprite: 'odette' } });
  for (const k in GX) CHAR['gx_' + k] = { name: GX[k].name, sprite: k };

  /* ---- the hall: new map with stairs, clerk at the counter, adventurers at the tables ---- */
  sc.map = 'in_guild';
  Object.defineProperty(sc, 'exits', { configurable: true, get() {
    const d = G.maps.in_guild.door; return [{ x: d[0], y: d[1], to: '__ret' }, { x: 13, x2: 14, y: 2, to: 'a_guild2', tx: 2, ty: 13, dir: 'down' }]; } });
  const UPSTAIRS = ['brom', 'sylwen', 'garrick', 'tilda'];
  const prev = sc.npcs.bind(sc);
  sc.npcs = function () {
    const L = prev().filter(n => !UPSTAIRS.includes(n.id));
    L.push({ id: 'odette', sprite: 'odette', x: 3, y: 2, dir: 'down', ai: 'turn', turns: ['down', 'down', 'left', 'right'], talk: talkOdette });
    for (const k in GX_SEATS) { const [x, y] = GX_SEATS[k];
      L.push({ id: 'gx_' + k, sprite: k, x, y, dir: 'down', ai: null, size: .72, talk: () => GIntel.talk(k), qm: () => G.S.rank && GIntel.fresh(k) ? '?' : null }); }
    return L;
  };
  for (const t of ['2,3', '3,3', '4,3']) sc.tiles[t] = talkOdette;
  sc.subtitle = sc.subtitle || 'Ashford chapter';

  /* ---- upstairs ---- */
  SCENES.a_guild2 = {
    map: 'in_guild2', title: "Adventurers' Guild", subtitle: 'Upper floor', safe: true, bd: sc.bd, music: sc.music,
    exits: [{ x: 1, x2: 2, y: 15, to: 'a_guild', tx: 14, ty: 3, dir: 'down' }],
    npcs: () => [
      { id: 'brom', x: 8, y: 5, dir: 'left', talk: talkBrom, qm: () => G.S.rank ? null : '!' },
      { id: 'sylwen', x: 17, y: 5, dir: 'left', talk: talkSylwen, ai: 'turn', turns: ['left', 'down'] },
      { id: 'garrick', x: 20, y: 8, dir: 'right', talk: talkGarrick },
      { id: 'tilda', x: 22, y: 12, dir: 'down', talk: talkTilda, ai: 'turn', turns: ['down', 'left', 'right'] }],
    tiles: {}
  };
  const T = SCENES.a_guild2.tiles;
  const desk = async () => { await narr('Brom\'s desk. A map of the vale, pinned flat with a dagger. Red pins for bandit camps. Black pins for Inquisition posts. A single green pin, pushed in so hard it\'s bent.'); };
  for (const p of ['4,5', '4,6', '5,6', '6,6', '7,6', '7,5']) T[p] = desk;
  for (const p of ['14,5', '15,5', '16,5', '14,4', '16,4']) T[p] = () => GIntel.ledger();
  for (const p of ['13,3', '17,3', '12,5', '12,6']) T[p] = async () => narr('Drawers of guild records, labelled by year. One drawer marked DRAGS — CONFISCATED is locked, and the lock is new.');
  const bunk = async () => {
    if (!G.S.rank) { await narr('Bunks for guild members. Somebody snores behind a curtain. You\'re not a member — yet.'); return; }
    const g = GIntel.st();
    if (g.nap === GIntel.today()) { await narr('You\'ve already had your nap today. The bunk creaks at you disapprovingly.'); return; }
    const c = await ask(null, null, 'A free bunk for members. Take a nap? (Restores HP & MP, once a day.)', ['Nap', 'Not now']);
    if (c !== 0) return;
    g.nap = GIntel.today(); await fadeOut(500); Story.heal(true); save(); await fadeIn(500);
    await narr('You sleep in your hood with your back to the wall. Old habits. You wake up feeling almost human. (Game saved.)');
  };
  for (const p of ['20,4', '19,4', '19,3', '20,3', '24,4', '23,3']) T[p] = bunk;
  for (const p of ['21,9', '21,10']) T[p] = async () => narr('A straw training dummy. Somebody has drawn a face on it. It looks a lot like Captain Voss.');
  for (const p of ['22,10', '23,10', '24,10', '22,9', '23,9', '24,9']) T[p] = async () => narr('The guild armory rack: practice blades, a dented shield, an axe with a name scratched into it. The name is "Gerald". Pip has been here.');
  for (const p of ['24,15', '24,16']) T[p] = async () => narr('LOST & FOUND, says the chest. Inside: one boot, a love letter, and a very small, very angry crab.');

  /* chests that intel told you about show a ! */
  if (typeof spawnExtras === 'function') {
    const _se = spawnExtras;
    spawnExtras = async function (W, name) {
      await _se(W, name);
      const m = (G.S.gx && G.S.gx.marks) || {};
      for (const e of W.ents) if (e.id && e.id.startsWith('chest_')) { const key = e.id.slice(6); if (m[key]) e.qm = () => (G.S.chests || {})[key] ? null : '!'; }
    };
  }
})();

async function talkOdette() {
  const S = G.S, f = S.f;
  if (!f.odetteMet) {
    f.odetteMet = 1;
    await say('odette', 'happy', 'Welcome to the Adventurers\' Guild, Ashford chapter! I\'m Odette. I keep the books, the board, and the Guildmaster\'s temper — roughly in that order.');
    if (!S.hood && f.hoodGiven) await say('odette', 'worried', '…Oh. Your eyes. Um. Guild rule: anyone who does the job. I just… might keep my voice down when I say your name, all right?');
  }
  if (!S.rank) {
    await say('odette', 'neutral', 'New faces register with Guildmaster Brom himself. Upstairs, the office with the big map on the wall. Stairs are in the back corner.');
    await say('odette', 'smirk', 'Knock first. He\'ll pretend he didn\'t hear you. Knock again.');
    return;
  }
  while (true) {
    const c = await ask('odette', 'happy', `${S.rank}-rank ${S.name}! What can the Guild do for you?`, ['The quest board', 'Any news?', 'Who are the regulars?', 'That\'s all']);
    if (c === 0) { await questBoard(); continue; }
    if (c === 1) {
      if (typeof Raid !== 'undefined') await say('odette', 'neutral', Raid.isCall() ? 'It\'s a RAID CALL today! The Marshal is signing up parties by the counter.' : `Next raid call is ${Cal.label(Raid.nextCall())}. The Marshal will take your name.`);
      const fresh = Object.keys(GX).filter(k => GIntel.fresh(k));
      if (fresh.length) await say('odette', 'smirk', `If you want to know what\'s really going on out there — ${fresh.slice(0, 2).map(k => GX[k].name).join(' and ')} ${fresh.length > 1 ? 'have' : 'has'} been talking all morning. Some of them talk better with a drink in hand.`);
      else await say('odette', 'neutral', 'The regulars have told you everything they know today. Come back tomorrow — they always pick up something new on the road.');
      await say('odette', 'neutral', 'Everything you hear goes into the Intel Ledger upstairs, in the records room. I copy it out myself. My handwriting is very good.');
      continue;
    }
    if (c === 2) {
      for (const k of Object.keys(GX)) { const D = GX[k]; await say('odette', 'neutral', `${D.name} — ${D.tag}. ${D.fee ? `Talks after ${D.feeTxt.toLowerCase().replace(/^buy |^slide over /, '')}.` : 'Talks for free. Talks a LOT, actually.'}`); }
      continue;
    }
    return;
  }
}

/* seated sprites play their two-frame idle (sipping, turning a page …) */
(function () {
  if (typeof Ent === 'undefined' || typeof HD === 'undefined') return;
  const _d = Ent.prototype.draw;
  Ent.prototype.draw = function (c, cx, cy, t) {
    const set = HD.on && HD.on() && HD.setOf && HD.setOf(HD.npcName(this));
    const M = set && HD.meta[set];
    if (!M || !M.seated || !HD.img[set]) return _d.call(this, c, cx, cy, t);
    const img = HD.img[set], A = M.anims.ow_idle, fr = M.frames[A[Math.floor((t + this.x * 397) / 520) % A.length]];
    const x = this.px - cx, y = this.py - cy + 3, k = HD.OW_H / fr[6];
    if (x < -60 || y < -10 || x > G.view.w + 60 || y > G.view.h + 100) return;
    c.fillStyle = 'rgba(0,0,0,.22)'; c.beginPath(); c.ellipse(x, y - 1, 14, 4, 0, 0, 7); c.fill();
    c.save(); c.translate(x, y); if (this.dir === 'left') c.scale(-1, 1);
    c.drawImage(img, fr[0], fr[1], fr[2], fr[3], -fr[4] * k, -fr[5] * k, fr[2] * k, fr[3] * k); c.restore();
  };
})();
