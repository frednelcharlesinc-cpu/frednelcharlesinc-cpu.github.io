'use strict';
/* ================= THE RED VEIL: Ren's secret identity =================
   Hood up, red scarf over the face. The public sees a masked stranger and can't pin anything on Ren.
   Drags see straight through it — they always know their own. */
const Veil = {
  got() { return !!(G.S && G.S.f.veilGot); },
  on() { return !!(G.S && G.S.veil); },
  fame() { return (G.S && G.S.f.veilFame) || 0; },
  addFame(n, why) { const f = G.S.f; f.veilFame = (f.veilFame || 0) + n; if (n > 0) toast(`<b style="color:#ff5a5a">The Red Veil</b> — ${why || 'the vale is talking about you.'}`, 2800); },
  rank() { const v = this.fame(); return v >= 6 ? ['Wanted by the Crown', "Crown posters show a hooded figure in a red scarf. 300 silver. Nobody has connected it to you."] : v >= 3 ? ['Folk hero', 'Children play "Red Veil and the Inquisitor" in the street. The Inquisitor always loses.'] : v >= 1 ? ['A rumour', 'Tavern talk about a masked stranger in a red scarf.'] : ['Unknown', 'Nobody has heard of the Red Veil yet.']; },
  async set(on) {
    G.S.veil = !!on; if (on) G.S.hood = true;
    await rebuildPlayer(); UI.hud(); save();
  },
  async give(from) {
    const f = G.S.f; if (f.veilGot) return; f.veilGot = true; f.veilFrom = from;
    sfx('level');
    toast('You received <b style="color:#ff5a5a">the Red Veil</b> — a red scarf to wear over your face. Tap <b>Hood</b> to cycle: Hood ▲ → Veil → Hood ▼.', 5200);
  }
};
async function rebuildPlayer() {
  if (!G.S || G.S.kid) return;
  // the Red Veil's outfit: black gi, red sash, charcoal hood, red scarf
  // the costume: hood down, dreads out, red scarf over the face
  const was = G.S.veil; G.S.veil = true;
  try { G.A.pVeil = composeLook(Object.assign({}, G.S.look, { top: 'black', obi: 'red', pants: 'black' }), false); } finally { G.S.veil = was; }
}
// painted cutscene shot: the art fills the frame, the camera drifts in
const paintShot = (id, dur, lines, o) => Object.assign({ sceneId: id, bg: 'eyes', dur, tapEnds: true, fadeIn: 120, lines, artCam: [[0, 320, (o && o.y) || 330, 1.02], [dur + 2500, 320, ((o && o.y) || 330) - 10, 1.12]] }, o || {});
// the scarf sits over the face, under the hood
(function () {
  const _pl = partList;
  partList = function (look, hooded) {
    const L = _pl(look, hooded);
    if (G.S && G.S.veil && !G.S.kid && G.man.parts.veil_scarf) { const i = L.findIndex(p => p[0] === 'hood' || p[0].startsWith('hair_')); L.splice(i < 0 ? L.length : i, 0, ['veil_scarf', null]); }
    return L;
  };
  const _pi = playerImg;
  playerImg = function () { return G.S && G.S.veil && G.A.pVeil ? G.A.pVeil : _pi(); };
  const _bps = buildPlayerSprites;
  setInterval(() => { try { if (G.S && G.S.veil && !(G.S.f && G.S.f.veilGot)) { G.S.veil = false; UI.hud(); } } catch (e) { } }, 1000);
  buildPlayerSprites = async function () { await _bps(); try { await rebuildPlayer(); } catch (e) { } };
  // Hood button: Hood ▲ → Veil → Hood ▼
  World.toggleHood = function () {
    if (G.mode !== 'world' || this.busy) return;
    if (!G.S.f.hoodGiven) { toast("You don't have a hood yet."); return; }
    sfx('hood');
    if (Veil.got() && G.S.hood && !G.S.veil) { Veil.set(true); toast('<b style="color:#ff5a5a">The Red Veil.</b> The costume goes on — red scarf over your face. Strangers see a masked stranger — Drags will still know you.', 3600); return; }
    if (G.S.veil) { G.S.veil = false; G.S.hood = false; toast('Hood down. Your eyes burn green for anyone to see.'); UI.hud(); save(); return; }
    G.S.hood = !G.S.hood; toast(G.S.hood ? 'Hood up. Your eyes are hidden.' : 'Hood down. Your eyes burn green for anyone to see.'); UI.hud(); save();
  };
  const _hud = UI.hud.bind(UI);
  UI.hud = function () { _hud(); const hb = $('#bHood'); if (hb && G.S && G.S.veil) { hb.textContent = 'Veil ◆'; hb.classList.add('on'); hb.style.color = '#ff8a8a'; } else if (hb) hb.style.color = ''; };
  // dialogue: the name tag and the portrait carry the mask
  const _sp = Dlg.setPortraits.bind(Dlg);
  Dlg.setPortraits = function (who, expr) { _sp(who, expr); if (Veil.on()) { const t = $('#portL .tag'); if (t) t.textContent = 'Red Veil'; } };
  const _dp = drawPortrait;
  drawPortrait = function (canvas, who, expr, facing) {
    _dp(canvas, who, expr, facing);
    if (who === 'me' && Veil.on() && !Art.port.ren_veil) paintVeil(canvas);
  };
})();
// a red scarf drawn over the lower half of Ren's face, the hood's shadow over the top
function paintVeil(cv) {
  const x = cv.getContext('2d'), W = cv.width, H = cv.height;
  x.save();
  let g = x.createLinearGradient(0, 0, 0, H * .42); g.addColorStop(0, 'rgba(8,8,12,.78)'); g.addColorStop(1, 'rgba(8,8,12,0)');
  x.fillStyle = g; x.fillRect(0, 0, W, H * .42);
  const top = H * .63;
  x.beginPath(); x.moveTo(-5, top + H * .05);
  x.bezierCurveTo(W * .25, top - H * .04, W * .75, top - H * .04, W + 5, top + H * .05);
  x.lineTo(W + 5, H + 5); x.lineTo(-5, H + 5); x.closePath();
  g = x.createLinearGradient(0, top, 0, H); g.addColorStop(0, '#b3242b'); g.addColorStop(.5, '#8c1a21'); g.addColorStop(1, '#5a0f15');
  x.fillStyle = g; x.fill();
  x.strokeStyle = 'rgba(0,0,0,.55)'; x.lineWidth = Math.max(2, W * .012); x.stroke();
  x.strokeStyle = 'rgba(255,140,140,.35)'; x.lineWidth = Math.max(1, W * .006);
  for (let i = 1; i <= 4; i++) { const yy = top + H * (.06 + i * .07); x.beginPath(); x.moveTo(W * .12, yy + H * .02); x.quadraticCurveTo(W * .5, yy - H * .03, W * .88, yy + H * .02); x.stroke(); }
  x.restore();
}

/* ---------- battle: blazing eyes behind the scarf burn the Red Veil's name, not Ren's ---------- */
(function () {
  const _st = Battle.start.bind(Battle);
  Battle.start = async function (cfg) {
    if (!Veil.on()) return _st(cfg);
    const c = typeof cfg === 'string' ? { enemies: [cfg] } : Object.assign({}, cfg); c.witness = 0;
    if (c.noFlee && Art.cut.veil_rain && !(Battle.B)) await Cine.play([paintShot('veil_rain', 2400, [['Red Veil', c.veilLine || 'Nobody needs to know my name tonight.', '#ff7a7a']], { y: 340 })]);
    const p = _st(c);
    setTimeout(() => { const me = Battle.B && Battle.me(); if (me) me.name = 'Red Veil'; }, 50);
    return p;
  };
})();

/* ---------- people: the public is fooled, Drags are not ---------- */
const VEIL_FOLK = () => { const v = Veil.fame(); return v >= 3 ? ['"The Red Veil! It\'s really you!"', '"My kids play Red Veil every day. Can I— can I shake your hand?"', '"Guards are looking for you, friend. Keep walking."', '"Is it true you made the Inquisitor cry?"']
  : v >= 1 ? ['"Wait… red scarf. Are you that masked one from the stories?"', '"Nice scarf. Very… mysterious."', '"You\'re not robbing me, are you? I\'ve got four coppers."']
  : ['"Who are YOU supposed to be?"', '"A scarf over your face in this heat? Suit yourself."', '"Mind your business, masked one, and I\'ll mind mine."']; };
(function () {
  const _tf = talkFolk;
  talkFolk = async function (e) {
    if (!Veil.on()) return _tf(e);
    CHAR[e.id] = { name: e.kid ? 'Child' : 'Townsperson', sprite: e.sprite };
    if (e.sprite && /^d(folk|kid)/.test(e.sprite)) { await say(e.id, null, pick(['"…Nice scarf, {name}. We can still see you."', '"Hah. A red veil. The humans will never guess. WE can smell you a mile off."', '"Your secret\'s safe with us. Green eyes keep green secrets."'])); return; }
    await say(e.id, null, pick(VEIL_FOLK()));
  };
  // Drags recognise you instantly
  const _ally = ALLY_TALK.kess;
  if (_ally) ALLY_TALK.kess = async function () { if (Veil.on() && !F().kessVeilJoke) { F().kessVeilJoke = true; await say('kessE', 'happy', "…It works, you know. On them. Every human we pass sees a stranger."); await say('kessE', 'neutral', "Every Drag sees you from across the market. We always know our own."); return; } return _ally(); };
})();

/* ---------- where the scarf comes from ---------- */
async function veilScene(from) {
  if (from === 'kess') {
    await say('kessE', 'neutral', "Wait. Before you go helping Kairo's people — and don't pretend you won't.");
    await narr('She pulls a long red scarf out of her coat. Faded, soft, mended at one end in green thread.');
    await say('kessE', 'sad', "My mother's. She wore it over her face the year she smuggled Drag children out of the Hollow. Nobody ever saw her eyes. They only ever saw the red.");
    await say('kessE', 'neutral', "Hood up, scarf up, and the humans see a stranger. Whatever the stranger does, it isn't YOU. Your face stays clean for when you need it.");
    await say('kessE', 'happy', "It won't fool a single Drag, mind. We always know our own. …It never fooled Mother's kids either. That was the point.");
  } else {
    await say('aud', 'neutral', "Wait — before you go. Take this.");
    await narr('A long red scarf, the kind the chapel uses to wrap the bell-rope. It smells like candle smoke.');
    await say('aud', 'sad', "A woman came through here years ago with Drag children hidden under her cloak and a red scarf over her face. Nobody ever saw her eyes. They only remembered the red.");
    await say('aud', 'neutral', "Whatever you do in the dark, child, do it as someone else. Keep your own face for the daylight.");
  }
  await me('neutral', '…The Red Veil.');
  await Veil.give(from);
}
(function () {
  const _k = talkKess;
  talkKess = async function () { const f = F(); await _k(); if (!f.veilGot && f.kessKnows && !f.kessRefused && !G.S.hood && (f.lead >= 1 || f.kessHelp)) await veilScene('kess'); };
  const _a = talkAud;
  talkAud = async function () { const f = F(); await _a(); if (!f.veilGot && (f.sqBelfry || !G.S.hood)) await veilScene('aud'); };
  const _c = talkCassel;
  talkCassel = async function () {
    const f = F();
    if (!Veil.on() || f.casselShamed) return _c();
    await say('cassel', 'shock', "A— a masked heretic! At MY pulpit! Brothers! Sisters!");
    const c = await ask('me', 'anger', '(The Red Veil can do what Ren never could here.)', ['Tear down the Drag bounty board.', 'Walk away.']);
    if (c !== 0) return;
    await narr('You rip the board off its posts — SILVER FOR EVERY DRAG DELIVERED — and snap it over your knee. The market goes silent.');
    await say('cassel', 'anger', 'GUARDS! Seize the red devil!');
    const r = await Battle.start({ enemies: ['acolyte', 'bandit'], bd: 'town', intro: "Cassel's faithful rush the Red Veil!" });
    if (r === 'lose') { await Story.defeat(); return; }
    if (r !== 'win') return;
    f.casselShamed = true;
    await narr('Brother Cassel is sitting in the fountain. Somebody in the crowd laughs. Then somebody else does.');
    await say('cassel', 'shame', '…You will burn for this. Whoever you are.');
    Veil.addFame(1, 'the bounty board in Ashford is kindling.'); Opinion.add('hope', .5);
  };
})();

/* ---------- veiled answers to Green Eclipse missions ---------- */
async function veilBridge() {
  const f = F();
  await say('dace', 'happy', "…Is that a SCARF? Oh, that's adorable. You know that fools exactly zero Drags, right, brother?");
  await say('wren', 'neutral', "It'll fool the Registry, though. …Fine. Your way. Fast and quiet.");
  await fadeOut(700); await wait(250); await fadeIn(700);
  await narr('Dusk. A figure in a red scarf drops from the bridge rail onto the wagon. The escort turns to see only red — and green, burning, above it.');
  const r = await Battle.start({ enemies: ['reg_captain', 'bandit', 'acolyte'], noFlee: true, bd: 'town', intro: 'The Red Veil hits the Registry wagon!' });
  if (r === 'lose') { await Story.defeat(); return; }
  await narr('Three children out of the strongbox. The captain tied to his own wagon wheel with his own Registry ribbon. Nobody hangs.');
  await say('dace', 'neutral', "…Okay. That was good. I'm telling Kairo it was me.");
  f.ge1 = 'veil'; f.geTrust = (f.geTrust || 0) + 1; Opinion.add('hope', 1); Veil.addFame(2, 'Millbrook saw a masked stranger free three children and spare every guard.'); Story.gainXp(45);
  Intel.add('ge', 'The Red Veil freed three Drag children from a Registry wagon at Millbrook. Green Eclipse knows exactly who it was.');
  World.remove('dace'); World.remove('wren');
}
async function veilGranary() {
  const f = F();
  await say('tamsin', 'shock', "…{name}? In a SCARF? What is that, a disguise? It's a disguise. Corran, he's wearing a disguise.");
  await say('corran', 'happy', "Hah. Won't fool any of us. Might fool every human in Kettlebrook, though.");
  await say('tamsin', 'anger', "Fine. Show me how the Red-Whatever saves a village without fire.");
  await fadeOut(700); await wait(250); await fadeIn(700);
  await narr('Midnight. The Red Veil goes in through the granary roof. The village sacks go out the back to the reeve\'s barn. The Inquisition\'s sacks go off the mill bridge into the river.');
  const r = await Battle.start({ enemies: ['inq_clerk', 'acolyte', 'acolyte'], noFlee: true, bd: 'field', intro: 'Clerk Ivo catches the Red Veil in the act!' });
  if (r === 'lose') { await Story.defeat(); return; }
  await narr('No fire. Halvard\'s winter is at the bottom of the river. Kettlebrook\'s is safe in the reeve\'s barn. Ivo\'s ledger is in your hand.');
  await say('tamsin', 'blush', "…Not bad. (Kairo would've liked that. He'd never SAY he liked it.)");
  f.ge2 = 'veil'; Opinion.add('hope', 1); Veil.addFame(2, 'Kettlebrook\'s winter was saved by a stranger in a red scarf.'); Story.gainXp(50);
}

/* ---------- the vale talks about the Red Veil ---------- */
GOSSIP.veil = { label: 'The Red Veil', talks: [
  { need: () => Veil.fame() >= 1, lines: [['A', 'Heard about the masked one? Red scarf over the face, hood pulled down. Nobody knows who.'], ['B', 'Tobb swears it\'s a woman. Pip swears it\'s a dragon. Pip is six.']] },
  { need: f => f.ge1 === 'veil', lines: [['C', 'The Red Veil hit a Registry wagon on the Millbrook bridge. Three children free, and the captain tied to his own wheel with his own ribbon.'], ['A', 'Nobody dead?'], ['C', 'Nobody dead. Rebels don\'t do it that way. So who IS it?']] },
  { need: f => f.ge2 === 'veil', lines: [['B', 'Kettlebrook\'s grain was saved by the Red Veil. The Inquisition\'s share went into the river. The fish are VERY holy now.']] },
  { need: f => f.casselShamed, lines: [['A', 'Somebody in a red scarf put Brother Cassel in the fountain and broke the bounty board over a knee.'], ['C', 'Best day of my life. Don\'t tell anyone I said that.']] },
  { need: f => f.veilDrag, lines: [['B', 'They say the Red Veil\'s eyes burn green when it fights.'], ['A', 'A DRAG? Saving our grain?'], ['B', '…Maybe they don\'t all want us on our knees. Maybe it\'s just the one with the burned face.']] },
  { need: () => Veil.fame() >= 3, lines: [['C', 'My boy wants a red scarf for his birthday. Says he\'s going to be the Red Veil when he grows up.'], ['A', 'Don\'t let the Inquisition hear him.']] }
] };

/* ---------- the menu shows how famous the mask is ---------- */
(function () {
  const _q = questsMenuHTML;
  questsMenuHTML = function () {
    let h = _q(); if (!Veil.got()) return h;
    const [nm, d] = Veil.rank();
    return h + `<div class="stat" style="margin-top:6px"><h3 style="color:#ff6a6a">The Red Veil — ${nm}</h3><p class="muted">${d} Wear it with the <b>Hood</b> button (Hood ▲ → Veil → Hood ▼). The public can't pin the Red Veil's deeds on you, and your eyes stay hidden. Drags always know who's under it.</p></div>`;
  };
})();

/* ---------- making sure the scarf reaches you ----------
   If Kess is already travelling with you (or Chapter I is behind you), she hands it over the moment you're back in the world.
   Otherwise: talk to Kess in Ashford with your hood DOWN, or Sister Aud in Millbrook. */
(function () {
  const _l = World.load.bind(World);
  World.load = async function (name, x, y, dir) {
    const r = await _l(name, x, y, dir);
    try {
      const f = G.S && G.S.f;
      if (f && !f.veilGot && !G.S.kid && f.hoodGiven && f.vaneDone && (f.kessJoined || f.kessHelp || f.millDone || f.chapter1Done) && !World.busy)
        setTimeout(() => Story.run(async () => { if (F().veilGot) return; if (G.S.party.includes('kess') || !f.kessRefused) await veilScene('kess'); else await veilScene('aud'); }), 900);
    } catch (e) { }
    return r;
  };
  const _q = questsMenuHTML;
  questsMenuHTML = function () { let h = _q(); if (G.S && !G.S.kid && !Veil.got() && G.S.f.vaneDone) h += `<div class="stat" style="margin-top:6px"><h3 style="color:#ff6a6a">A second face</h3><p class="muted">Talk to Kess in Ashford Hollow with your hood DOWN (or Sister Aud in Millbrook). They have a red scarf for you — the Red Veil.</p></div>`; return h; };
})();
