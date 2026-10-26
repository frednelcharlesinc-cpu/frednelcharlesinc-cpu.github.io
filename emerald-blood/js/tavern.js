/* =====================================================================
   TAVERNS — real rooms.
   A long bar with the barkeep behind it, tables full of regulars, and the
   room talking: conversations play out as speech bubbles over people's heads.
   Walk close to a table to listen. Some of what you overhear is just gossip —
   some is real intel, and it goes in your log.
   Buy drinks from the barkeep: house ale, the local special (a buff for your
   next fight), a rumor for coin, or a round for the whole house.
   ===================================================================== */

/* ---------- speech bubbles wrap onto several lines (and can carry a name) ---------- */
(function () {
  const wrap = (c, text, max) => { const out = []; let line = ''; for (const w of String(text).split(' ')) { const t = line ? line + ' ' + w : w; if (c.measureText(t).width > max && line) { out.push(line); line = w; } else line = t; } if (line) out.push(line); return out; };
  Ent.prototype.drawBubble = function (c, cx, cy) {
    const b = this.bubble, x = Math.round(this.px - cx), big = !!b.big, fs = big ? 14 : 12, lh = fs + 3;
    c.font = `800 ${fs}px "Nunito"`; c.textAlign = 'center';
    const lines = wrap(c, b.text, big ? 200 : 160).slice(0, 5);
    const tw = Math.min(big ? 214 : 174, Math.max(...lines.map(l => c.measureText(l).width)) + 14), th = lines.length * lh + 6 + (b.who ? 12 : 0);
    const y = Math.round(this.py - cy - 66 * (this.size || 1)), top = y - th + 6, a = Math.min(1, b.t / 300);
    c.save(); c.globalAlpha = a;
    c.fillStyle = b.icon === '!' ? 'rgba(80,10,10,.9)' : b.thought ? 'rgba(220,255,232,.95)' : 'rgba(250,248,236,.96)';
    c.strokeStyle = 'rgba(0,0,0,.35)'; c.lineWidth = 1;
    c.beginPath(); c.roundRect ? c.roundRect(x - tw / 2, top - 10, tw, th, 6) : c.rect(x - tw / 2, top - 10, tw, th); c.fill(); c.stroke();
    c.beginPath(); c.moveTo(x - 5, top - 10 + th - .5); c.lineTo(x + 5, top - 10 + th - .5); c.lineTo(x, top - 10 + th + 6); c.fill();
    let ty = top + (fs - 12) + 1;
    if (b.who) { c.font = '900 10px "Nunito"'; c.fillStyle = b.whoCol || '#7a4a1a'; c.fillText(b.who, x, ty); ty += 12; c.font = `800 ${fs}px "Nunito"`; }
    c.fillStyle = b.icon === '!' ? '#ffd2d2' : '#1d1810';
    for (const l of lines) { c.fillText(l, x, ty); ty += lh; }
    c.restore();
  };
})();

/* ---------- the rooms ---------- */
const TAV = {
  ashford: { scene: 'a_inn', keep: 'bram_in', keepName: 'Bram', keepSprite: 'innkeep',
    special: { name: 'Lantern Red', price: 6, desc: '+2 ATK in your next fight', buff: { atk: 2 }, line: "Lantern Red. Brewed with beetroot and spite. Puts fire in your arm for a fight or two." },
    greet: "Welcome to the Crooked Lantern. Ale's watered, beds are lumpy, and the gossip's free." },
  millbrook: { scene: 'mb_tavern', keep: 'marta', keepName: 'Marta Reed', keepSprite: 'folk19',
    special: { name: 'River Smoke', price: 6, desc: '+2 DEF in your next fight', buff: { def: 2 }, line: "River Smoke. We smoke the barley over the mill fire. Sits in your belly like a shield." },
    greet: "Welcome to the Duck. Stew, river ale, and no questions. Two out of three, anyway." },
  kettlebrook: { scene: 'kb_tavern', keep: 'gunna', keepName: 'Gunna Stoutbarrel', keepSprite: 'dwarf_f1',
    special: { name: 'Stoutbarrel Dark', price: 7, desc: '+3 ATK, −1 SPD in your next fight', buff: { atk: 3, spd: -1 }, line: "Stoutbarrel Dark. Dwarf stout. You'll hit like a forge-hammer and run like one too." },
    greet: "Sheaf & Sickle. Ale's dwarf-brewed, stools are dwarf-height. Mind your knees." }
};
// where everyone stands in the room (in_tavern)
const TAV_SPOTS = {
  bar: [[3, 5, 'right'], [4, 5, 'left']],
  t1: [[3, 8, 'right'], [7, 8, 'left'], [5, 7, 'down']],
  t2: [[12, 8, 'right'], [16, 8, 'left'], [14, 7, 'down']],
  t3: [[14, 11, 'right'], [17, 11, 'left']]
};
const TAV_EXTRA = { // more regulars per town, beyond the three with painted faces
  ashford: [['Drover', 3], ['Washerwoman', 6], ['Stablehand', 9], ['Off-duty Guard', 'guard'], ['Pilgrim', 12], ['Card Player', 14], ['Card Player', 16]],
  millbrook: [['Boatman', 4], ['Net-mender', 8], ['Eel Seller', 11], ['Miller\'s Boy', 13], ['Old Widow', 17], ['Ferry Hand', 2], ['Traveller', 18]],
  kettlebrook: [['Thresher', 1], ['Reaper', 5], ['Dwarf Brewer', 'dwarf_m1'], ['Goose Girl', 10], ['Harrow-man', 12], ['Hayward', 15], ['Seed Merchant', 19]]
};
const TAV_GROUPS = ['bar', 't1', 't2', 't3'];

/* ---------- things worth overhearing (real leads) ---------- */
const TAV_INTEL = {
  ashford: [
    { id: 'aWagons', need: f => !f.millDone, log: 'Night wagons with squeaking iron (cages?) leave the Hollow by the north road, past the Old Mill.',
      lines: [['A', "Night wagons out of the Hollow don't take the main road. They go north. Past the old mill."], ['B', 'Grain?'], ['A', "Grain doesn't squeak like iron, friend."], ['C', '…Keep your voice down.']] },
    { id: 'aVoss', log: "Captain Voss's gate watch changes at dusk — for a while nobody checks hoods.",
      lines: [['B', "Voss changes the gate watch at dusk. Quarter of an hour where nobody's looking at anybody."], ['A', "That's how my brother gets his 'untaxed' apples in."], ['B', "Your brother's going to hang."]] },
    { id: 'aMaren', log: 'Maren the healer treats green-eyed children for free, in her back room. She can be trusted.',
      lines: [['C', "Maren keeps honey-fever tea under her counter. For the green-eyed kids. Never charges."], ['A', 'The Inquisition know?'], ['C', "If they did, she'd be on the fountain. So nobody knows. Understood?"]] },
    { id: 'aBounty', need: f => f.ge1, log: 'The Registry pays 40 silver for any Drag delivered — 200 for "the hooded one".',
      lines: [['A', "Registry's posted new prices. Forty silver a Drag, delivered."], ['B', 'And the hooded one? The one who keeps saving people?'], ['A', 'Two hundred.'], ['C', '…That one I\'d never sell. Not for two thousand.']] },
    { id: 'aCael', log: 'The Guild is sending Cael Ardent — SSS rank, seventeen, a Drag-hunter with a halberd — south.',
      lines: [['B', "The Guild's sending the boy south. Cael Ardent. Halberd that drinks Drag-fire."], ['A', 'A boy?'], ['B', "Seventeen. SSS. They say he's never smiled except once — the day he killed his first Drag."]] },
    { id: 'aPell', need: f => !f.sqFlour, log: 'Pell the baker in Kettlebrook needs someone to collect a debt — he pays.',
      lines: [['C', "Pell from Kettlebrook was in here crying into his ale. Somebody owes him for a whole cart of flour."], ['A', 'Who?'], ['C', '…He kept looking at Bram.'], ['K', 'I CAN HEAR YOU.']] }
  ],
  millbrook: [
    { id: 'mBelfry', need: f => !f.sqBelfry, log: "Sister Aud is hiding someone in the Millbrook chapel belfry. Talk to her.",
      lines: [['A', "That bell rings by itself every night. Sister Aud says it's the drowned."], ['B', "Drowned don't eat bread. She takes a loaf up the belfry every evening."], ['A', '…Oh.'], ['B', "Yes. 'Oh.' Now forget I said it."]] },
    { id: 'mOswin', log: "Oswin the ferryman keeps 40 years of ledgers — every wagon that ever crossed. One shelf is labelled CAGES.",
      lines: [['C', 'Oswin counts every wagon over the river. Forty years of ledgers.'], ['A', "What's he do with them?"], ['C', "Nothing. That's what scares the Registry. One day somebody will READ them."]] },
    { id: 'mWheel', need: f => !f.sqWheel, log: "Dunstan the miller's wheel is jammed by river-rats at the mill-race. He'll pay to have it cleared.",
      lines: [['B', "Dunstan's wheel's stopped again. Rats in the mill-race. Big ones."], ['A', "How big?"], ['B', 'Big enough that Dunstan stopped calling them rats and started calling them "sir."']] },
    { id: 'mFen', need: f => !f.sqHerb, log: "Fen the herbalist in Millbrook wants Moonpetal and pays for it.",
      lines: [['A', "Fen's paying good coin for moonpetal. Fevers are coming early this year."], ['C', 'Moonpetal only opens at night.'], ['A', "Then go at night. It's not complicated."]] },
    { id: 'mGE', need: f => !f.ge1, log: 'Green Eclipse are watching the Millbrook bridge. A Registry wagon of children is due across it.',
      lines: [['B', "Strangers in black and green camping above the bridge."], ['A', "Registry wagon's due this week. Children in the strongbox, they say."], ['B', "Then those strangers aren't there for the view."]] },
    { id: 'mVeil', need: () => typeof Veil !== 'undefined' && Veil.got() && Veil.fame() < 1, log: 'Nobody knows the Red Veil yet. Yet.',
      lines: [['C', "Have you heard the one about the man in the red scarf?"], ['A', "No."], ['C', "…Me neither. I'm waiting for somebody to start it."]] }
  ],
  kettlebrook: [
    { id: 'kManifest', need: f => !f.millDone, log: "Kettlebrook's seized grain is being sent north to the Old Mill — the Inquisition is feeding a lot of somebodies there.",
      lines: [['A', 'Forty measures of barley, carted north. All of it to the Old Mill.'], ['B', "What does a mill need with grain it didn't grind?"], ['A', "Feeding somebody. A lot of somebodies. Behind locked doors."]] },
    { id: 'kGourd', need: f => !f.sqGourd, log: "Widow Orla's field gourds have grown teeth. She needs them cleared.",
      lines: [['C', "Orla's gourds have TEETH this year."], ['B', "Gourds don't have teeth."], ['C', "Go and tell them that. Go on. I'll wait here and drink your ale."]] },
    { id: 'kStones', log: 'The Crown taxes one green pebble per house per season. Nobody knows where the stones go.',
      lines: [['B', "Stone tax again. One green pebble per house. Every season."], ['A', 'Where do they all GO?'], ['B', "Reeve Hollis asked that once, in writing. He doesn't ask in writing anymore."]] },
    { id: 'kIvo', log: 'Clerk Ivo keeps the Inquisition granary books in Kettlebrook — and he rings the alarm bell at the first sign of trouble.',
      lines: [['A', "Ivo's the one with the keys to the granary. Inquisition clerk."], ['C', "Little man. Big bell. First sign of trouble he rings it and hides under the ledger."]] },
    { id: 'kGE', need: f => !f.ge2, log: 'Green Eclipse plan to burn the Kettlebrook granary — the village\'s winter grain with it.',
      lines: [['B', "Rebels were asking how thick the granary walls are."], ['A', "Thick enough to burn slow. Our winter's in there too."], ['C', "Then somebody had better talk them out of it."]] }
  ]
};
// chest whispers: point at a real, unopened chest
const CHEST_AREAS = { ashford: ['ashford', 'woods'], millbrook: ['woods', 'ashford'], kettlebrook: ['woods', 'ashford'] };
let TAV_CHESTS = null;
async function chestRumor(tk) {
  if (!TAV_CHESTS) { try { TAV_CHESTS = await (await fetch('assets/chests.json')).json(); } catch (e) { TAV_CHESTS = {}; } }
  const S = G.S; S.chests = S.chests || {}; const f = S.f; f.chestTip = f.chestTip || {};
  for (const m of CHEST_AREAS[tk]) {
    const M = G.maps[m]; if (!M) continue;
    for (const [x, y] of (TAV_CHESTS[m] || [])) {
      const key = `${m}:${x},${y}`; if (S.chests[key] || f.chestTip[key]) continue;
      const ns = y < M.h / 3 ? 'north' : y > M.h * 2 / 3 ? 'south' : '', ew = x < M.w / 3 ? 'west' : x > M.w * 2 / 3 ? 'east' : '';
      const where = (ns + (ns && ew ? '-' : '') + ew) || 'middle';
      const title = (SCENES[m] && SCENES[m].title) || m;
      return { key, log: `A strongbox is hidden in the ${where} part of ${title}.`, title, where };
    }
  }
  return null;
}

/* ---------- the room ---------- */
function tavNpcs(tk) {
  const T = TAV[tk], f = F(); const L = [];
  CHAR[T.keep] = CHAR[T.keep] || { name: T.keepName, sprite: T.keepSprite };
  L.push(Object.assign(resident(T.keep + '_k', T.keepSprite, 6, 3, [], { nm: T.keepName, ai: null, dir: 'down' }), { talk: () => barkeep(tk), qm: () => tk === 'ashford' && f.sqFlour === 'on' ? '?' : null }));
  const pats = TAVERNS[tk].pat.map(([n, s, art]) => ({ n, s, art })).concat(TAV_EXTRA[tk].map(([n, s]) => ({ n, s: typeof s === 'number' ? FK(s) : s })));
  let k = 0;
  for (const g of TAV_GROUPS) for (const [x, y, dir] of TAV_SPOTS[g]) {
    const p = pats[k % pats.length], id = `tv_${tk}_${k}`; k++;
    if (p.art) ART_ID[id] = p.art;
    CHAR[id] = { name: p.n, sprite: p.s };
    L.push(Object.assign(resident(id, p.s, x, y, [], { nm: p.n, ai: null, dir }), { tavGroup: g, talk: e => patronTalk(tk, e) }));
  }
  return L;
}
function tavScene(key, tk, title) {
  room(key, 'in_tavern', title, { npcs: () => tavNpcs(tk), tiles: Object.fromEntries([2, 3, 4, 5, 6, 7, 8, 9, 10].map(x => [x + ',4', () => barkeep(tk)])) });
  SCENES[key].tavern = tk;
}
tavScene('a_inn', 'ashford', 'The Crooked Lantern');
tavScene('mb_tavern', 'millbrook', 'The Drowned Duck');
tavScene('kb_tavern', 'kettlebrook', 'The Sheaf & Sickle');

/* ---------- the room talks ---------- */
const Tav = {
  groups: {}, sceneKey: null, drinks: 0, lastBark: 0,
  near(ids, r) { const p = World.player; return ids.some(id => { const e = World.ents.find(n => n.id === id); return e && Math.abs(e.x - p.x) + Math.abs(e.y - p.y) <= r; }); },
  members(g) { return World.ents.filter(e => e.tavGroup === g).map(e => e.id); },
  pool(tk) {
    const f = F(), ff = Object.assign({}, f, { fear: Opinion.fear }); f.tavHeard = f.tavHeard || {};
    const P = [];
    for (const it of TAV_INTEL[tk]) if (!it.need || it.need(f)) P.push({ id: 'i_' + it.id, lines: it.lines, intel: it.log });
    for (const [k, G2] of Object.entries(GOSSIP)) G2.talks.forEach((e, i) => { if (!e.need || e.need(ff)) P.push({ id: `g_${k}${i}`, lines: e.lines || e }); });
    LOCAL[tk].forEach((l, i) => P.push({ id: `l_${tk}${i}`, lines: l }));
    return P;
  },
  pick(tk) {
    const f = F(), P = this.pool(tk), busy = new Set(Object.values(this.groups).filter(g => g.conv).map(g => g.conv.id));
    const fresh = P.filter(c => !f.tavHeard[c.id] && !busy.has(c.id));
    const intel = fresh.filter(c => c.intel);
    if (intel.length && Math.random() < .55) return pick(intel);
    if (fresh.length) return pick(fresh);
    const rest = P.filter(c => !busy.has(c.id)); return pick(rest.length ? rest : P);
  },
  tick() {
    const sc = World.scene; if (!sc || !sc.tavern || G.mode !== 'world') { this.sceneKey = null; return; }
    if (this.sceneKey !== G.S.map) { this.sceneKey = G.S.map; this.groups = {}; this.drinks = 0; for (const g of TAV_GROUPS) this.groups[g] = { conv: null, i: 0, next: performance.now() + 900 + Math.random() * 2500, heardAll: true }; }
    if (World.busy || Dlg.open) return;
    const tk = sc.tavern, now = performance.now(), p = World.player;
    // the group you're closest to talks properly; the rest of the room murmurs
    let best = null, bd = 1e9;
    for (const g of TAV_GROUPS) { const ids = this.members(g); const d = Math.min(...ids.map(id => { const e = World.ents.find(n => n.id === id); return e ? Math.abs(e.x - p.x) + Math.abs(e.y - p.y) : 99; })); if (d < bd) { bd = d; best = g; } }
    for (const g of TAV_GROUPS) {
      const st = this.groups[g], ids = this.members(g); if (!ids.length) continue;
      const close = g === best && bd <= 6;
      if (!st.conv) {
        if (now < st.next) continue;
        if (!close) { if (now - this.lastBark > 2600 && Math.random() < .5) { const e = World.ents.find(n => n.id === pick(ids)); if (e && !e.bubble) { e.say(pick(['*laughs*', 'Another round!', 'Hah! No!', '…and THEN he says—', '*clink*', 'Your turn to pay.', 'Shh, shh.', 'To the vale!', 'You did NOT.', '*snores*']), 1600); this.lastBark = now; } } st.next = now + 2500 + Math.random() * 3000; continue; }
        st.conv = this.pick(tk); st.i = 0; st.heardAll = true; st.next = now;
      }
      if (now < st.next) continue;
      if (!close) st.heardAll = false;
      const ln = st.conv.lines[st.i];
      if (!ln) { // conversation over
        const f = F(); if (st.heardAll) { f.tavHeard[st.conv.id] = 1; if (st.conv.intel) Tav.learn(tk, st.conv.intel); }
        st.conv = null; st.next = now + 3500 + Math.random() * 3500; continue;
      }
      const [s, text] = ln, dur = Math.min(6500, 1700 + text.length * 48);
      let who = null;
      if (s === 'me') { if (close) { World.player.say(text.replace(/^\(|\)$/g, ''), dur); World.player.bubble.thought = 1; World.player.bubble.big = 1; } }
      else if (s === 'K') who = World.ents.find(n => n.id === TAV[tk].keep + '_k');
      else { const idx = { A: 0, B: 1, C: 2 }[s] ?? 0; who = World.ents.find(n => n.id === ids[idx % ids.length]); }
      if (who) { who.say(text, dur); who.bubble.big = 1; who.bubble.who = CHAR[who.id] ? CHAR[who.id].name : ''; }
      st.i++; st.next = now + dur + 350;
    }
  },
  learn(tk, log) {
    const f = F(); f.tavLog = f.tavLog || [];
    if (f.tavLog.some(e => e.t === log)) return;
    f.tavLog.push({ tk, t: log }); sfx('blip');
    toast(`<b style="color:#ffd27a">Overheard</b> — ${esc(log)}`, 4200);
  }
};
setInterval(() => { try { Tav.tick(); } catch (e) { } }, 200);
// leaving the room resets it
(function () { const _l = World.load.bind(World); World.load = async function (...a) { Tav.sceneKey = null; return _l(...a); }; })();

/* ---------- talking to a patron ---------- */
async function patronTalk(tk, e) {
  const f = F();
  if (!G.S.hood && G.S.f.hoodGiven && !(typeof Veil !== 'undefined' && Veil.on())) { await say(e.id, null, pick(['"…Those eyes. I\'m not drunk enough for this."', '"Sit somewhere else, friend. Anywhere else."', '"Don\'t look at me like that. I didn\'t do anything."'])); return; }
  const c = await ask(e.id, null, pick(['"Pull up a stool, stranger."', '"You want something, or just the warmth?"', '"Buy me a drink and I\'ll tell you a secret. Maybe even a true one."']), ['Buy them a drink (3g)', 'Ask what they\'ve heard', 'Leave them be']);
  if (c === 0) {
    if (G.S.gold < 3) { await say(e.id, null, '"With what, your good looks?"'); return; }
    G.S.gold -= 3; sfx('coin'); UI.hud();
    const P = Tav.pool(tk).filter(x => x.intel && !(f.tavLog || []).some(l => l.t === x.intel));
    if (P.length) { const it = P[0]; await say(e.id, null, '"…Alright. Lean in."'); await say(e.id, null, it.lines[0][1]); Tav.learn(tk, it.intel); f.tavHeard = f.tavHeard || {}; f.tavHeard[it.id] = 1; }
    else { const cr = await chestRumor(tk); if (cr) { await say(e.id, null, `"Heard a fellow buried a strongbox somewhere in the ${cr.where} part of ${cr.title}. Never went back for it. Got himself hanged first."`); f.chestTip[cr.key] = 1; Tav.learn(tk, cr.log); } else await say(e.id, null, '"Thanks, friend. …I\'ve got nothing you don\'t already know. But I\'ll drink to you."'); }
  } else if (c === 1) await barSeat(tk);
}

/* ---------- the barkeep ---------- */
const DRINKS = [
  { name: 'House Ale', price: 3, desc: 'Restores 25% HP', fx: () => { const s = G.S.stats; s.hp = Math.min(s.maxHp, s.hp + Math.ceil(s.maxHp * .25)); } },
  { name: 'Spiced Cider', price: 4, desc: 'Restores 6 MP', fx: () => { const s = G.S.stats; s.mp = Math.min(s.maxMp, s.mp + 6); } },
  { name: 'Elderberry Wine', price: 9, desc: 'Restores all HP & MP', fx: () => { const s = G.S.stats; s.hp = s.maxHp; s.mp = s.maxMp; } },
  { name: 'Water', price: 0, desc: 'Free. The barkeep judges you.', fx: () => { } }
];
async function barkeep(tk) {
  const T = TAV[tk], f = F(), K = T.keep;
  CHAR[K] = CHAR[K] || { name: T.keepName, sprite: T.keepSprite };
  if (tk !== 'ashford' && !G.S.hood && G.S.sus >= 3 && !(typeof Veil !== 'undefined' && Veil.on())) { await say(K, 'anger', "Not tonight, friend. Not with those eyes, not with the whole vale talking."); return; }
  if (tk === 'ashford' && f.sqFlour === 'on') { f.sqFlour = 'done'; await say('bram_in', 'shock', "Pell's flour? …He sent you to COLLECT? Gods. Fine. Fine! Here — tell him I paid. Tell him I paid with a smile."); toast("Bram paid up. Collect from Pell in Kettlebrook.", 2600); }
  let first = true;
  while (true) {
    const round = 3 * 10;
    const c = await ask(K, 'happy', first ? T.greet : pick(['Anything else?', 'Another?', "What'll it be?"]),
      ['Buy a drink', `Buy a round for the whole house (${round}g)`, 'Pay for a rumor (10g)', 'Sit at the bar and listen', 'Rest for the night (15g — restores HP & MP, saves)', 'Leave']);
    first = false;
    if (c < 0 || c === 5) return;
    if (c === 0) { await buyDrink(tk); continue; }
    if (c === 1) {
      if (G.S.gold < round) { await say(K, 'neutral', "A round for the house? With THAT purse? Bless you, but no."); continue; }
      G.S.gold -= round; sfx('coin'); UI.hud();
      await narr(`You slap ${round} gold on the bar. "${T.keepName === 'Bram' ? 'Bram' : T.keepName.split(' ')[0]} — a round for everyone."`);
      for (const e of World.ents.filter(n => n.tavGroup)) { e.say(pick(['To the stranger!', 'Bless you!', 'HAH! A saint!', 'To the hood!', 'Now THAT is manners.']), 2600); e.bubble.big = 1; }
      sfx('level'); await wait(1400);
      if (!f['tavRound' + tk]) { f['tavRound' + tk] = 1; Opinion.add('hope', .5); }
      const P = Tav.pool(tk).filter(x => x.intel && !(f.tavLog || []).some(l => l.t === x.intel));
      if (P.length) { await narr('A grateful drinker leans over and tells you something the room has been whispering about all night.'); const pe = World.ents.filter(n => n.tavGroup).sort((a, b) => (Math.abs(a.x - World.player.x) + Math.abs(a.y - World.player.y)) - (Math.abs(b.x - World.player.x) + Math.abs(b.y - World.player.y)))[0]; for (const [s, t] of P[0].lines) if (s !== 'me' && s !== 'K' && pe) await say(pe.id, null, t); Tav.learn(tk, P[0].intel); }
      continue;
    }
    if (c === 2) {
      if (G.S.gold < 10) { await say(K, 'neutral', 'Rumors cost coin, friend. Ten.'); continue; }
      G.S.gold -= 10; sfx('coin'); UI.hud();
      const P = Tav.pool(tk).filter(x => x.intel && !(f.tavLog || []).some(l => l.t === x.intel));
      if (P.length) { await say(K, 'neutral', 'Mm. Here\'s one going round:'); await say(K, 'neutral', P[0].lines.filter(l => l[0] !== 'me' && l[0] !== 'K').map(l => l[1]).slice(0, 2).join(' ')); Tav.learn(tk, P[0].intel); }
      else { const cr = await chestRumor(tk); if (cr) { await say(K, 'neutral', `Smuggler drank here last spring. Bragged about a strongbox he'd hidden in the ${cr.where} of ${cr.title}. The Registry caught him before he went back.`); f.chestTip[cr.key] = 1; Tav.learn(tk, cr.log); } else { await say(K, 'happy', "You've heard everything I have, friend. Keep the coin."); G.S.gold += 10; UI.hud(); } }
      continue;
    }
    if (c === 3) { await barSeat(tk); continue; }
    if (c === 4) { if (G.S.gold >= 15) { G.S.gold -= 15; await fadeOut(600); Story.heal(true); if (typeof Wounds !== 'undefined') Wounds.clear(true); save(); Tav.drinks = 0; tipsy(0); await fadeIn(600); await narr('You keep your hood on all night. You sleep badly, but you sleep. (Game saved.)'); } else await say(K, 'neutral', 'Coin first, friend.'); return; }
  }
}
async function buyDrink(tk) {
  const T = TAV[tk], K = T.keep, sp = T.special;
  const list = [DRINKS[0], DRINKS[1], { name: sp.name + ' (house special)', price: sp.price, desc: sp.desc, special: 1 }, DRINKS[2], DRINKS[3]];
  const c = await ask(K, 'neutral', `What'll it be? (You have ${G.S.gold}g)`, list.map(d => `${d.name} — ${d.price ? d.price + 'g' : 'free'} · ${d.desc}`).concat(['Never mind']));
  if (c < 0 || c >= list.length) return;
  const d = list[c];
  if (Tav.drinks >= 5 && d.price) { await say(K, 'neutral', "That's enough for you, friend. Even a Drag's blood can only burn off so much."); return; }
  if (G.S.gold < d.price) { await say(K, 'neutral', 'Coin first, friend.'); return; }
  G.S.gold -= d.price; if (d.price) sfx('coin');
  if (d.special) { await say(K, 'happy', sp.line); G.S.f.drinkBuff = Object.assign({ name: sp.name }, sp.buff); toast(`<b>${sp.name}</b> — ${sp.desc}.`, 2600); }
  else if (d.price === 0) { await say(K, 'neutral', pick(['Water. In a tavern. …Here.', 'One water. I\'ll charge you for the cup next time.', 'Water. Very brave.'])); }
  else { d.fx(); sfx('heal'); await narr(pick([`The ${d.name.toLowerCase()} is warm and a little too strong.`, `You drink the ${d.name.toLowerCase()}. Somebody behind you starts a song nobody knows the end of.`, `${d.name}. Exactly as good as it costs.`])); }
  UI.hud();
  if (d.price) {
    Tav.drinks++;
    if (Tav.drinks === 3) { await narr('The room tilts. Pleasantly. (Your Drag blood will burn it off soon.)'); tipsy(40000); }
    // a loose tongue across the bar
    const f = F(), P = Tav.pool(tk).filter(x => x.intel && !(f.tavLog || []).some(l => l.t === x.intel));
    if (P.length && Math.random() < .45) { await say(K, 'neutral', 'Since you\'re buying — ' + P[0].lines[0][1].replace(/^./, m => m.toLowerCase())); Tav.learn(tk, P[0].intel); }
  }
}
let tipsyT = 0;
function tipsy(ms) {
  const cv = $('#game'); clearTimeout(tipsyT);
  if (!ms) { cv.style.animation = ''; return; }
  if (!document.getElementById('tipsyKF')) { const st = document.createElement('style'); st.id = 'tipsyKF'; st.textContent = '@keyframes tipsy{0%{transform:rotate(0) scale(1.01)}25%{transform:rotate(.6deg) scale(1.02)}50%{transform:rotate(0) scale(1.01)}75%{transform:rotate(-.6deg) scale(1.02)}100%{transform:rotate(0) scale(1.01)}}'; document.head.appendChild(st); }
  cv.style.animation = 'tipsy 3.2s ease-in-out infinite';
  tipsyT = setTimeout(() => { cv.style.animation = ''; }, ms);
}
// the house special lasts one fight
(function () {
  const _run = Battle.run.bind(Battle);
  Battle.run = async function () {
    const B = this.B, f = G.S && G.S.f, b = f && f.drinkBuff;
    if (B && b && !B.cfg.leafTrain) { const me = B.actors.find(a => a.isMe); if (me) { me.atk += b.atk || 0; me.def += b.def || 0; me.spd = Math.max(1, me.spd + (b.spd || 0)); setTimeout(() => { try { this.text(me, `${b.name}!`, '#ffcf7a', -60); } catch (e) { } }, 600); } f.drinkBuff = null; }
    return _run();
  };
})();
// innRest (old Ashford hook) goes to Bram now
innRest = async function () { await barkeep('ashford'); };

/* ---------- the log ---------- */
(function () {
  const _q = questsMenuHTML;
  questsMenuHTML = function () {
    let h = _q(); const L = (G.S && G.S.f.tavLog) || []; if (!L.length) return h;
    const nm = { ashford: 'Crooked Lantern', millbrook: 'Drowned Duck', kettlebrook: 'Sheaf & Sickle' };
    return h + `<div class="stat" style="margin-top:6px"><h3 style="color:#ffd27a">Overheard in taverns</h3>${L.map(e => `<p><b style="color:#ffd27a">◆ ${nm[e.tk] || ''}</b> <span class="muted">—</span> ${esc(e.t)}</p>`).join('')}</div>`;
  };
})();

/* ---------- never leave the player on a black screen ---------- */
(function () {
  const _ue = World.useExit.bind(World);
  World.useExit = async function (ex) {
    try { return await _ue(ex); }
    catch (e) { console.warn('exit failed', e); G.S.f.lastErr = String(e && e.message || e).slice(0, 200); try { await fadeIn(300); } catch (x) { } this.busy = false; this.loading = false; }
  };
  const _go = World.go.bind(World);
  World.go = async function (...a) {
    try { return await _go(...a); }
    catch (e) { console.warn('go failed', e); G.S.f.lastErr = String(e && e.message || e).slice(0, 200); try { await fadeIn(300); } catch (x) { } this.busy = false; this.loading = false; }
  };
  // watchdog: a black screen with a dialogue hidden under it, or a black screen nobody is using
  let since = 0;
  setInterval(() => {
    const fd = $('#fade'); if (!fd || !fd.classList.contains('on')) { since = 0; return; }
    const now = performance.now(); if (!since) since = now;
    const cineOn = typeof Cine !== 'undefined' && Cine.on;
    if (Dlg.open && now - since > 900) { fd.style.transitionDuration = '300ms'; fd.classList.remove('on'); since = 0; return; }
    if (!cineOn && !Dlg.open && G.mode === 'world' && now - since > 6000) { fd.style.transitionDuration = '400ms'; fd.classList.remove('on'); since = 0; if (World.busy && !World.loading) setTimeout(() => { if (!Dlg.open && G.mode === 'world') World.busy = false; }, 1500); }
  }, 300);
})();

/* ---------- the tavern buildings: bigger, a hanging beer sign, lanterns, a barrel out front, and a 🍺 you can spot from across town ---------- */
const TAV_HOUSE = { ashford: [40, 14, 'The Crooked Lantern'], millbrook: [13, 11, 'The Drowned Duck'], kettlebrook: [26, 9, 'The Sheaf & Sickle'] };
const TAV_SCALE = 1.2;
function paintMug(x, cx, cy, s) {
  x.save(); x.translate(cx, cy); x.scale(s, s);
  x.fillStyle = '#e8a52a'; x.strokeStyle = '#3a220c'; x.lineWidth = 1.6;
  x.beginPath(); x.roundRect ? x.roundRect(-9, -8, 16, 20, 2) : x.rect(-9, -8, 16, 20); x.fill(); x.stroke();          // glass
  x.fillStyle = '#ffd36a'; x.fillRect(-7, -5, 4, 15);                                                                    // shine
  x.beginPath(); x.arc(9, 2, 5.5, -1.3, 1.3); x.lineWidth = 3; x.strokeStyle = '#3a220c'; x.stroke(); x.lineWidth = 1.6;  // handle
  x.fillStyle = '#fffaf0'; x.beginPath(); x.arc(-6, -9, 4.2, 0, 7); x.arc(-1, -11, 4.8, 0, 7); x.arc(4, -9, 4.2, 0, 7); x.fill(); // foam
  x.strokeStyle = '#c8b8a0'; x.lineWidth = .8; x.beginPath(); x.arc(-1, -11, 4.8, 3.6, 6); x.stroke();
  x.restore();
}
function buildTavernArt() {
  const P = G.props, atlas = G.img.props; if (!atlas || P.tav_houseA) return;
  const kinds = ['houseA', 'houseA_red'].filter(k => P[k]);
  const s = TAV_SCALE, W = Math.round(256 * s), H = Math.round(224 * s);
  const out = document.createElement('canvas'); out.width = Math.max(atlas.width, W * kinds.length); out.height = atlas.height + H + 4;
  const x = out.getContext('2d'); x.imageSmoothingEnabled = false; x.drawImage(atlas, 0, 0);
  kinds.forEach((k, i) => {
    const md = P[k], ox = i * W, oy = atlas.height + 2, [sx, sy, sw, sh] = md.r;
    x.drawImage(atlas, sx, sy, sw, sh, ox, oy, W, H);
    const door = (md.door + .5) * 32 * s, base = oy + H;
    // lanterns either side of the door
    for (const lx of [door - 34, door + 34]) {
      const ly = base - 92;
      const g = x.createRadialGradient(ox + lx, ly + 6, 1, ox + lx, ly + 6, 22); g.addColorStop(0, 'rgba(255,200,90,.55)'); g.addColorStop(1, 'rgba(255,200,90,0)'); x.fillStyle = g; x.fillRect(ox + lx - 22, ly - 16, 44, 44);
      x.fillStyle = '#2a1e14'; x.fillRect(ox + lx - 1, ly - 10, 2, 6); x.fillRect(ox + lx - 6, ly - 4, 12, 3);
      x.fillStyle = '#ffd36a'; x.fillRect(ox + lx - 4, ly - 1, 8, 11); x.fillStyle = '#fff2c0'; x.fillRect(ox + lx - 2, ly + 1, 4, 6);
      x.strokeStyle = '#2a1e14'; x.lineWidth = 1.5; x.strokeRect(ox + lx - 4.5, ly - 1.5, 9, 12); x.fillStyle = '#2a1e14'; x.fillRect(ox + lx - 5, ly + 10, 10, 2);
    }
    // the hanging sign: iron arm out of the wall, two chains, a painted board
    const ax = ox + door + 52, ay = base - 128;
    x.fillStyle = '#26201c'; x.fillRect(ax - 4, ay - 3, 54, 4); x.beginPath(); x.moveTo(ax - 4, ay + 1); x.lineTo(ax + 14, ay + 1); x.lineTo(ax - 4, ay + 16); x.fill();
    x.strokeStyle = '#3a3430'; x.lineWidth = 1.4; x.beginPath(); x.moveTo(ax + 8, ay + 1); x.lineTo(ax + 8, ay + 12); x.moveTo(ax + 44, ay + 1); x.lineTo(ax + 44, ay + 12); x.stroke();
    const bx = ax - 2, by = ay + 11, bw = 58, bh = 44;
    x.fillStyle = 'rgba(0,0,0,.35)'; x.fillRect(bx + 3, by + 3, bw, bh);
    x.fillStyle = '#5a3a1e'; x.fillRect(bx, by, bw, bh); x.fillStyle = '#6e4826'; for (let r = 0; r < bh; r += 8) x.fillRect(bx + 2, by + r + 1, bw - 4, 3);
    x.strokeStyle = '#d9a640'; x.lineWidth = 2.5; x.strokeRect(bx + 1.5, by + 1.5, bw - 3, bh - 3);
    paintMug(x, bx + bw / 2 - 2, by + bh / 2 + 3, 1.15);
    // a barrel and a bench out front
    const rx = ox + door - 70, ry = base - 30;
    x.fillStyle = '#5a3a1e'; x.fillRect(rx, ry, 18, 24); x.fillStyle = '#7a5230'; x.fillRect(rx + 3, ry, 4, 24); x.fillStyle = '#2a1e14'; x.fillRect(rx, ry + 4, 18, 2); x.fillRect(rx, ry + 17, 18, 2);
    x.fillStyle = '#c99a3a'; x.beginPath(); x.ellipse(rx + 9, ry, 9, 3, 0, 0, 7); x.fill();
    paintMug(x, rx + 9, ry - 6, .45);
  });
  G.img.props = out;
  kinds.forEach((k, i) => { const md = P[k]; P['tav_' + k] = Object.assign({}, md, { r: [i * W, atlas.height + 2, W, H], ax: Math.round((md.door + .5) * 32 * s - (md.door + .5) * 32), ay: H - 1 }); });
}
(function () {
  const _b = World.buildPropList.bind(World);
  World.buildPropList = function () {
    try { buildTavernArt(); const T = TAV_HOUSE[G.S && G.S.map]; if (T && this.map) for (const p of this.map.props) if (p.x === T[0] && p.y === T[1] && /^houseA/.test(p.k) && G.props['tav_' + p.k]) p.k = 'tav_' + p.k; } catch (e) { console.warn(e); }
    return _b();
  };
  // a bobbing 🍺 over the roof, with the tavern's name when you're close
  const _r = World.render.bind(World);
  World.render = function (c, t) {
    _r(c, t);
    try {
      const T = TAV_HOUSE[G.S && G.S.map]; if (!T || !this.map || !this.player || this.loading || G.mode === 'battle') return;
      const cx = Math.round(this.cam.x), cy = Math.round(this.cam.y);
      const doorX = (T[0] + 2) * 32 + 16, top = T[1] * 32 + 31 - Math.round(224 * TAV_SCALE);
      const x = doorX - cx, base = T[1] * 32 + 31 - cy, y = Math.min(base - 150, Math.max(46, top - cy + 18)) + Math.sin(t / 380) * 4;
      if (base < -10 || x < -40 || x > G.view.w + 40) return;
      c.save(); c.globalAlpha = .9; c.fillStyle = 'rgba(20,14,8,.78)'; c.beginPath(); c.arc(x, y, 15, 0, 7); c.fill();
      c.strokeStyle = '#ffcf5a'; c.lineWidth = 2; c.stroke(); c.globalAlpha = 1;
      c.font = '18px "Apple Color Emoji","Segoe UI Emoji","Noto Color Emoji",sans-serif'; c.textAlign = 'center'; c.textBaseline = 'middle'; c.fillText('🍺', x, y + 1);
      const d = Math.abs(this.player.x - (T[0] + 2)) + Math.abs(this.player.y - T[1]);
      if (d <= 9) { c.font = '900 12px "Nunito"'; c.textBaseline = 'alphabetic'; c.lineWidth = 3; c.strokeStyle = 'rgba(0,0,0,.85)'; c.strokeText(T[2], x, y - 21); c.fillStyle = '#ffd88a'; c.fillText(T[2], x, y - 21); }
      c.restore();
    } catch (e) { }
  };
})();
