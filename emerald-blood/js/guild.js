'use strict';
/* ================= THE GUILD: ranks, the quest board, minigames, the Proving Bouts ================= */
const RANK_RP = [['E', 0], ['D', 100], ['C', 250], ['B', 500], ['A', 900], ['S', 1500], ['SS', 2500], ['SSS', 4000]];
const QUESTS = {
  lupine: { name: 'Cull the Ashen Lupines', rank: 'E', rp: 60, gold: 30, desc: 'Lupine packs are dragging sheep out of the East Woods. Put down three packs.', goal: 3 },
  gerald: { name: 'Gerald Is Missing', rank: 'E', rp: 30, gold: 5, desc: 'Pip has lost Gerald — his rock. Pip is inconsolable. Gerald was last seen near the fountain.' },
  range: { name: "Marksman's Trial", rank: 'E', rp: 40, gold: 15, desc: 'Hit 7 of 10 targets on the Guild range. Timing is everything.' },
  arm: { name: 'Tilda\'s Challenge', rank: 'E', rp: 20, gold: 15, desc: 'Tilda says nobody in Ashford can beat her at arm-wrestling. Prove her wrong.' },
  toll: { name: "The Hound's Collectors", rank: 'D', rp: 80, gold: 40, desc: 'Toll-men working for Varro Kade, the Gilded Hound, are squeezing farmers on the east road into the woods. Run them off.' },
  bouts: { name: 'The Proving Bouts', rank: 'D', rp: 200, gold: 60, desc: 'Three bouts in the Guild ring against Ashford\'s best. House rules: weapons and elements only. NO Drag Arts — not that anyone here expects a Drag.' }
};
Object.assign(ENEMY, {
  tilda_t: { name: 'Tilda', hp: 70, atk: 11, def: 4, spd: 10, dodge: .1, parry: .2, brk: 50, xp: 20, gold: 0, img: 'tilda_bt', trait: 'D-rank · fire — hits like a hammer, slow to recover',
    skills: [{ name: 'Forge Swing', hits: [{ anim: 'slash', m: 1.1, w: 620 }] }, { name: 'Ember Verdict', w: .35, hits: [{ anim: 'slash', m: 1.4, w: 760 }] }] },
  garrick_t: { name: 'Garrick', hp: 105, atk: 12, def: 7, spd: 10, dodge: .05, parry: .35, brk: 70, xp: 30, gold: 0, img: 'garrick_bt', shield: 2, trait: 'C-rank · earth — shield wall soaks big hits',
    skills: [{ name: 'Shield Bash', hits: [{ anim: 'slash', m: .9, w: 520 }, { anim: 'halfslash', m: .7, w: 320 }] }, { name: 'Shield Rush', w: .3, hits: [{ anim: 'slash', m: 1.5, w: 700, unp: 1 }] }] },
  sylwen_t: { name: 'Sylwen', hp: 120, atk: 14, def: 5, spd: 16, dodge: .35, parry: .2, brk: 80, xp: 45, gold: 0, img: 'sylwen_bt', trait: 'B-rank · wind & water — fast, evasive, multi-hit',
    skills: [{ name: 'Gale Lance', hits: [{ anim: 'thrust', m: .6, w: 420 }, { anim: 'thrust', m: .6, w: 240 }, { anim: 'thrust', m: .8, w: 300 }] }, { name: 'Mana Breath', w: .3, hits: [{ anim: 'thrust', m: 1.4, w: 820 }] }, { name: 'Howl Pounce', w: .2, hits: [{ anim: 'thrust', m: 1.7, w: 640, unp: 1 }] }] },
  tollman: { name: 'Toll-man', hp: 52, atk: 12, def: 3, spd: 11, dodge: .2, parry: .1, brk: 40, xp: 18, gold: 12, img: 'bandit', trait: 'Gilded Hound\'s collector',
    skills: [{ name: 'Stab', hits: [{ anim: 'thrust', m: 1, w: 520 }] }, { name: 'Twin Cut', w: .45, hits: [{ anim: 'slash', m: .7, w: 460 }, { anim: 'slash', m: .7, w: 280 }] }] }
});
Object.assign(TIER, { tilda_t: 'D', garrick_t: 'C', sylwen_t: 'B', tollman: 'D', vane: 'SSS', vane_spar: 'SSS', dread: 'SSSS', stone_hunter: 'C', will_verdict: 'B', will_river: 'B' });
Object.assign(TIER_COL, { SS: '#ff4ad2', SSS: '#ffffff', SSSS: '#46ff95' });
Object.assign(CHAR, { seraphine: { name: 'Headmaster Seraphine', sprite: 'seraphine' }, tollboss: { name: 'Toll-man', sprite: 'bandit' } });
Object.assign(ART, { seraphine: { sex: 'f', skin: 'light', hair: 'ponytail', hairCol: 'platinum', eye: 'blue', elf: 1, beauty: 1, cloth: 'robe', col: 'white', necklace: 1 } });

const Guild = {
  q() { const S = G.S; S.q = S.q || {}; return S.q; },
  rpFlags() { const f = G.S.f; let r = 0; if (f.rookBeaten) r += 60; if (f.vossBeaten) r += 80; if (f.alphaBeaten) r += 60; if (f.halvardBeaten) r += 150; if (f.duel === 'won') r += 200; return r; },
  rp() { return (G.S.rpExtra || 0) + this.rpFlags(); },
  award(rp, gold, why) { G.S.rpExtra = (G.S.rpExtra || 0) + rp; G.S.gold += gold || 0; sfx('coin'); toast(`<b>${why}</b> — +${rp} RP${gold ? ` · +${gold}g` : ''}`, 3200); Story.rankCheck(); },
  complete(id) { const Q = QUESTS[id], q = this.q(); if (q[id] === 'done') return; q[id] = 'done'; this.award(Q.rp, Q.gold, 'Quest complete: ' + Q.name); },
  rankIdx(r) { return RANK_RP.findIndex(x => x[0] === r); }
};
// replaces the milestone-only version: rank points from quests, tournaments and bosses
Story.rankCheck = function () {
  const S = G.S; if (!S || !S.rank) return; S.rp = Guild.rp();
  let r = 'E'; for (const [k, need] of RANK_RP) if (S.rp >= need) r = k;
  if (Guild.rankIdx(r) > Guild.rankIdx(S.rank)) { S.rank = r; sfx('level'); toast(`Guild rank up! You are now <b style="color:${TIER_COL[r]}">${r}-RANK</b> (${S.rp} RP).`, 4200); UI.hud(); }
};

/* ---------- the board ---------- */
async function questBoard() {
  const S = G.S, q = Guild.q();
  if (!S.rank) { await narr('A board of bounties, nailed thick with notices. "Guild members only," says the brass plate. You\'ll need to register with Brom first.'); return; }
  await narr(`The Guild board. Your card says ${S.rank}-RANK. Your power: ${Power.now().grade}, ${BAND_NAME[Power.now().band]} (${Power.xp()}/${Power.now().hi} EXP).`);
  while (true) {
    const ids = Object.keys(QUESTS); const labels = ids.map(id => { const Q = QUESTS[id], st = q[id]; const lock = Guild.rankIdx(S.rank) < Guild.rankIdx(Q.rank);
      return `${st === 'done' ? '✔ ' : st ? '▶ ' : lock ? '🔒 ' : ''}${Q.name} [${Q.rank}]`; });
    labels.push('Read the tier chart', 'Step away');
    const c = await ask(null, null, 'Which notice?', labels);
    if (c === ids.length) { for (const [t, d] of TIERS) await narr(`${t} — ${d}`); continue; }
    if (c > ids.length) return;
    const id = ids[c], Q = QUESTS[id];
    if (q[id] === 'done') { await narr(`"${Q.name}" — stamped COMPLETE. Brom has drawn a small, grudging smiley face next to your name.`); continue; }
    if (Guild.rankIdx(S.rank) < Guild.rankIdx(Q.rank)) { await narr(`"${Q.name}" — ${Q.rank}-rank or higher. Not yet.`); continue; }
    await narr(`${Q.name}: ${Q.desc}  (Reward: ${Q.rp} EXP, ${Q.gold}g)`);
    if (id === 'range') { const sc = await targetRange(); await narr(`You hit ${sc} of 10.`); if (sc >= 7) Guild.complete('range'); else await say('tilda', 'happy', 'Ha! Close. Come back when your hands stop shaking.'); continue; }
    if (id === 'arm') { const w = await armWrestle('Tilda', 1.05); if (w) { await say('tilda', 'shock', '…You cheated. You must have. Nobody beats me. …Again tomorrow?'); Guild.complete('arm'); } else await say('tilda', 'happy', 'HA! Dwarf arms, human! Dwarf arms!'); continue; }
    if (id === 'bouts') { await provingBouts(); return; }
    if (!q[id]) { q[id] = id === 'lupine' ? 0 : 'active'; sfx('blip'); toast(`Quest accepted: <b>${Q.name}</b>`, 2600); }
    else await narr(id === 'lupine' ? `Packs culled: ${q.lupine}/3.` : 'Already accepted.');
  }
}
// battle hooks: count lupine packs in the woods
const _victory = Battle.victory.bind(Battle);
Battle.victory = async function () {
  const B = this.B, q = Guild.q();
  if (typeof q.lupine === 'number' && G.S.map === 'woods' && B.actors.some(a => a.side === 'e' && /lupine/.test(a.key))) { q.lupine++; setTimeout(() => { if (q.lupine >= 3) Guild.complete('lupine'); else toast(`Lupine packs culled: ${q.lupine}/3`, 2200); }, 2500); }
  if (B.cfg.bout) B.cfg.boutWon = true;
  return _victory();
};

/* ---------- minigame: target range ---------- */
function targetRange() {
  Dlg.close();
  return new Promise(res => {
    const ov = document.createElement('div'); ov.className = 'ov'; ov.style.cssText = 'z-index:45;background:rgba(10,14,12,.9);flex-direction:column;gap:8px';
    ov.innerHTML = `<div style="font-family:'Press Start 2P';color:#ffd34a;font-size:13px">MARKSMAN'S TRIAL</div><canvas width="640" height="300" style="width:min(92vw,640px);background:#2a3a2a;border-radius:10px;border:3px solid #3a5a46"></canvas><div id="trTxt">Tap (or press A) when the shrinking ring meets the target.</div>`;
    document.body.appendChild(ov);
    const cv2 = ov.querySelector('canvas'), x = cv2.getContext('2d'); let n = 0, score = 0, T = null, done = false;
    const next = () => { if (n >= 10) { done = true; setTimeout(() => { ov.remove(); Input.on('a', UI.routeA); res(score); }, 700); return; } n++; T = { x: 60 + Math.random() * 520, y: 50 + Math.random() * 200, t0: performance.now(), dur: 1100 - n * 40, judged: false }; };
    const tap = e => { if (e) e.preventDefault(); if (!T || T.judged) return; const k = (performance.now() - T.t0) / T.dur, r = 70 * (1 - k); T.judged = true;
      if (Math.abs(r - 16) < 7) { score++; sfx('perfect'); T.res = 'hit'; } else { sfx('miss'); T.res = 'miss'; } setTimeout(next, 350); };
    ov.addEventListener('pointerdown', tap); Input.on('a', () => tap());
    const draw = () => {
      if (!ov.isConnected) return; x.clearRect(0, 0, 640, 300);
      x.fillStyle = '#ffd34a'; x.font = '700 14px "Press Start 2P"'; x.fillText(`${score}/${n}`, 14, 26);
      if (T) { const k = (performance.now() - T.t0) / T.dur, r = Math.max(0, 70 * (1 - k));
        for (const [rr, col] of [[16, '#fff'], [11, '#e04848'], [6, '#fff'], [2, '#e04848']]) { x.fillStyle = col; x.beginPath(); x.arc(T.x, T.y, rr, 0, 7); x.fill(); }
        if (!T.judged) { x.strokeStyle = '#46ff95'; x.lineWidth = 3; x.beginPath(); x.arc(T.x, T.y, r, 0, 7); x.stroke(); if (k > 1.15) { T.judged = true; T.res = 'miss'; sfx('miss'); setTimeout(next, 300); } }
        else { x.fillStyle = T.res === 'hit' ? '#46ff95' : '#ff6a6a'; x.fillText(T.res === 'hit' ? 'HIT!' : 'MISS', T.x - 24, T.y - 24); } }
      requestAnimationFrame(draw);
    };
    next(); draw();
  });
}
/* ---------- minigame: arm-wrestling (mash A / tap) ---------- */
function armWrestle(who, strength) {
  Dlg.close();
  return new Promise(res => {
    const ov = document.createElement('div'); ov.className = 'ov'; ov.style.cssText = 'z-index:45;background:rgba(10,14,12,.9);flex-direction:column;gap:10px';
    ov.innerHTML = `<div style="font-family:'Press Start 2P';color:#ffd34a;font-size:13px">ARM-WRESTLE: ${who.toUpperCase()}</div><canvas width="560" height="90" style="width:min(90vw,560px)"></canvas><div>TAP AS FAST AS YOU CAN (or mash A)</div>`;
    document.body.appendChild(ov);
    const cv2 = ov.querySelector('canvas'), x = cv2.getContext('2d'); let pos = .5, done = false, t0 = performance.now();
    const push = e => { if (e) e.preventDefault(); if (!done) { pos += .028; sfx('blip'); } };
    ov.addEventListener('pointerdown', push); Input.on('a', () => push());
    const draw = () => {
      if (done) return; const dt = 16; pos -= .0042 * strength * (1 + (performance.now() - t0) / 9000);
      if (pos >= 1 || pos <= 0) { done = true; const win = pos >= 1; sfx(win ? 'perfect' : 'miss'); setTimeout(() => { ov.remove(); Input.on('a', UI.routeA); res(win); }, 600); }
      x.clearRect(0, 0, 560, 90); x.fillStyle = '#5a2a2a'; x.fillRect(20, 30, 520, 30); x.fillStyle = '#1f8a4c'; x.fillRect(20, 30, 520 * Math.max(0, Math.min(1, pos)), 30);
      x.fillStyle = '#fff'; x.fillRect(20 + 520 * Math.max(0, Math.min(1, pos)) - 3, 22, 6, 46); x.font = '700 11px "Press Start 2P"'; x.fillText('YOU', 470, 18); x.fillText(who.toUpperCase(), 20, 18);
      requestAnimationFrame(draw);
    };
    draw();
  });
}
/* ---------- the Proving Bouts (no Drag Arts) ---------- */
async function provingBouts() {
  const f = F();
  await say('brom', 'happy', 'The Proving Bouts! Three rounds in the ring, one night, the whole Hollow watching. House rules: blades and elements. Nothing else.');
  await say('brom', 'neutral', 'Win all three and the Guild will know your name. Lose, and they\'ll know it anyway, but with a nickname.');
  const c = await ask('me', 'neutral', '(Three fights. No Drag Arts — one blaze of your eyes and the whole Guild sees what you are.)', ['Enter the Bouts.', 'Not tonight.']);
  if (c) return;
  await fadeOut(600); await fadeIn(600);
  await narr('Tables pushed back. Lanterns hung on the beams. Half of Ashford Hollow is packed into the Guild hall, and the other half is listening at the windows.');
  const rounds = [['tilda_t', 'ROUND ONE — Tilda (D-rank)', 'Tilda: "I\'ve been waiting ALL WEEK for this!"'], ['garrick_t', 'ROUND TWO — Garrick (C-rank)', 'Garrick: "Nothing personal. I just don\'t like losing."'], ['sylwen_t', 'FINAL — Sylwen (B-rank)', 'Sylwen: "Let\'s see what an empty grey crystal can do."']];
  for (const [k, intro, line] of rounds) {
    Story.heal(true);
    const r = await Battle.start({ enemies: [k], allies: [], noFlee: true, noArts: 1, bout: 1, bd: 'town', music: 'battle', intro,
      onTurn: async (B, Bt) => { const e = B.actors.find(a => a.side === 'e'); if (B.turn === 1) await Bt.msg(line, 1500); if (e && e.hp < e.maxHp * .2) { await Bt.msg(`${e.name} yields!`, 1200); return 'win'; } } });
    if (r !== 'win') { Story.heal(true); await narr('You hit the boards. The crowd groans, then cheers anyway. Brom helps you up.'); await say('brom', 'neutral', 'Not bad, for E-rank. Come back when you\'ve got more in you.'); return; }
    sfx('coin'); await narr(['The crowd roars. Tilda shakes your hand so hard your shoulder pops.', 'Garrick lowers his shield and laughs. "Fine. FINE. Again sometime."', ''][rounds.findIndex(x => x[0] === k)] || '');
  }
  Story.heal(true);
  await narr('Sylwen lowers her spear. For a moment the whole hall is silent. Then it explodes.');
  await say('sylwen', 'happy', '…No colour at all on the crystal, and you move like THAT. Interesting. Very, very interesting.');
  await say('brom', 'shock', 'That draw. Blade home, then gone, then home again. I saw that once, forty years back, in a duel at the Citadel. The man who did it was called the Sword Saint.');
  Guild.q().bouts = 'done'; Guild.award(QUESTS.bouts.rp, QUESTS.bouts.gold, 'Proving Bouts — CHAMPION'); f.boutsWon = true;
  await seraphineArrives();
}
async function seraphineArrives() {
  const f = F(); if (f.seraphineMet) return;
  await narr('The lanterns flicker. Every single one, at once. The air tastes like a storm.');
  await narr('Lightning crawls along the beams without a sound. When it fades, a woman is standing in the middle of the ring who was not there a heartbeat ago.');
  await World.addNpc({ id: 'seraphine', x: 7, y: 5, dir: 'down' });
  await narr('Pale robes. Platinum hair tied high. The pointed ears of an elf and the lined eyes of someone much older than she looks. Every adventurer in the room has gone down on one knee — Brom fastest of all.');
  await say('brom', 'shock', 'H-Headmaster. We didn\'t — nobody sent word you were—');
  await say('seraphine', 'neutral', 'Nobody ever does, Brom. That\'s rather the point of me.');
  await say('seraphine', 'neutral', 'Seraphine Hale. I run the Guild. All of it. The board you\'ve been pulling notices off is one of four hundred.');
  await say('seraphine', 'happy', 'I was passing through and heard the crowd. That footwork in your final round — the empty-sleeve feint. I haven\'t seen that in forty years. I thought the man who used it was dead.');
  const c = await ask('me', 'shock', '…', ['I don\'t know what you mean.', 'He\'s alive.', '(Say nothing.)']);
  if (c === 0) await say('seraphine', 'happy', 'Of course you don\'t. Good. Keep not knowing, out loud. Rooms have ears.');
  else if (c === 1) { await say('seraphine', 'sad', '…Is he. Well. Then the old fool owes me a very long letter.'); f.toldSeraphine = true; }
  else await say('seraphine', 'happy', 'Silence. Even better. Brom, you\'ve got a smart one.');
  await say('seraphine', 'neutral', 'A warning, since you\'ve earned one. The Crown has four Pillars. Caspian, Ysolde, Gorran, Sereth. One of them — the Quiet Tide, Sereth — runs the Registry. She has been asking about grey crystals.');
  await say('seraphine', 'neutral', 'The Guild doesn\'t care what you are. That is the only law I have ever enforced with lightning. But the Guild is not everywhere — yet.');
  await narr('She presses a small brass bell into your palm. It doesn\'t ring. It hums.');
  await say('seraphine', 'happy', 'My token. When you\'re ready to climb past these little letters — come to the Guild Citadel in Aurel and ring it. I\'ll be waiting. I\'ve been waiting a long time.');
  await narr('The lightning crawls back up the beams. When the lanterns steady, she\'s gone.');
  World.remove('seraphine');
  f.seraphineMet = f.gorranKnown = f.serethKnown = f.caspianKnown = f.ysoldeKnown = true; f.bellToken = true;
  toast('Received <b style="color:#ffe36a">the Headmaster\'s Bell</b>. New entries in Menu → World.', 4200);
}
/* ---------- side-quest hooks ---------- */
async function geraldFound() {
  await narr('Wedged between two stones of the fountain\'s rim: a smooth grey pebble with a face drawn on it in charcoal. It is, unmistakably, Gerald.');
  Guild.q().gerald = 'done-pending';
  CHAR.pipq = { name: 'Pip', sprite: 'pip', kid: 1 };
  await say('pipq', null, 'GERALD!! You found him! He says thank you. He says you\'re his second-best friend. I\'m first. Obviously.');
  Guild.q().gerald = 'active'; Guild.complete('gerald');
}
async function tollMen() {
  const q = Guild.q(); if (q.toll !== 'active') return;
  await narr('Two men in gilded sashes are shaking down a farmer\'s cart at the edge of the trees. One of them has a toll-book. The other has a knife.');
  await say('tollboss', null, 'Road belongs to the Gilded Hound, friend. Varro Kade sends his regards — and his prices. You\'re next.');
  const r = await Battle.start({ enemies: ['tollman', 'tollman'], bd: 'forest', intro: 'The Gilded Hound\'s collectors!' });
  if (r === 'lose') { await Story.defeat(); return; }
  if (r === 'win') { await narr('The farmer gives you a sack of apples and a look you will remember for a long time. One of the toll-men drops a gold coin stamped with a hound\'s head.'); F().houndKnown = true; Guild.complete('toll'); }
}
