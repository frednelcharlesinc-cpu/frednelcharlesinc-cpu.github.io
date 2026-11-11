'use strict';
/* =====================================================================================
   CHAPTER I — THE SIX ARCS (+ finale)
     I    The Hooded Stranger      Ashford, the leads, Millbrook & Kettlebrook   (existing)
     II   The Stone Tax            Registrar Hesk, Pip & Gerald, a night of lanterns   NEW
     III  The Inquisitor's Shadow  Edda, Brother Tam, Sister Verity              (existing)
     IV   The Boy Who Prays        Nix, a conviction duel at the mill-race           NEW
     V    The Old Mill             Halvard, the ribbon, Kairo, the roof          (existing)
     VI   The Ferryman's Ledgers   Oswin's books, the Weaver, the cleaners           NEW
     FINALE  The Guild Trial       Highmark                                      (existing)
   New gameplay: STEALTH (lantern cones), a STONE-FED boss, a CONVICTION duel (words change
   the fight), a LEDGER deduction, and a two-wave DEFENCE. Every arc reaches back into the others.
   ===================================================================================== */
const AF = () => G.S.f;
const ROMAN = ['I', 'II', 'III', 'IV', 'V', 'VI', 'FINALE'];
const ARCS = [
  ['The Hooded Stranger', f => !!f.learnedMill],
  ['The Stone Tax', f => f.a2 === 'done' || (!!f.h1 && !f.a2)],
  ["The Inquisitor's Shadow", f => !!f.sealGot],
  ['The Boy Who Prays', f => !!(f.nixSaved || f.nixLost) || (!!f.halvardBeaten && !f.a4)],
  ['The Old Mill', f => !!f.halvardBeaten],
  ["The Ferryman's Ledgers", f => f.a6 === 'done' || (!!f.trial && f.trial !== 'open' && !f.a6)],
  ['The Guild Trial', f => f.trial === 'done' || !!f.chapter1Done]
];
const Arcs = {
  async card(i) { const f = AF(); f.arcCard = f.arcCard || {}; if (f.arcCard[i]) return; f.arcCard[i] = 1;
    try { await UI.chapterCard(i === 6 ? 'CHAPTER I — FINALE' : 'ARC ' + ROMAN[i], ARCS[i][0]); } catch (e) { } },
  html() { const f = AF(); let cur = ARCS.findIndex(a => !a[1](f));
    return `<div class="stat" style="margin-top:6px"><h3 style="color:#46ff95">Chapter I — the Arcs</h3>` + ARCS.map((a, i) => { const ok = a[1](f), now = i === cur;
      return `<p style="margin:2px 0;${now ? 'color:#ffd36a' : ok ? '' : 'opacity:.5'}">${ok ? '<b style="color:#46ff95">✓</b>' : now ? '<b>▸</b>' : '○'} <b>${ROMAN[i]}</b> · ${a[0]}</p>`; }).join('') + '</div>'; },
  // lines elsewhere in the chapter that remember what you did in these arcs
  fix(t) {
    if (typeof t !== 'string' || !G.S) return t; const f = AF();
    if (t === "And the quiet boy — Nix. He prays now. Very sincerely. You'd hardly know him.") {
      if (f.nixSaved) return "And the quiet boy — Nix. You took him from me at the mill-race. He'll come back. They always come back to the light.";
      if (f.nixLost) return "And Nix. He told me you hesitated at the mill-race. That you talked. He's on his way to Greyspire now, praying for you.";
    }
    if (t === "And Drag — your valley wasn't found. It was sold. One of your own drew us the map to the bridge. Think on that." && f.weaverClue)
      return "And Drag — your valley wasn't found. It was sold. Oh, you've read Hesk's ledger. Then you know the name. The Weaver. Three hundred crowns, and one of your own drew us the bridge.";
    if (t === "She isn't here. Dread's riders took the children at dawn. To Greyspire Citadel." && f.a4)
      return "She isn't here. Dread's riders took the oldest singers three nights ago. Your sister first. To Greyspire Citadel.";
    if (t.startsWith('Inside the mill: empty cages.') && f.nixSaved)
      return 'Inside the mill, the cages hang open. Down in the cellar, by lantern light, Nix is leading the little ones out through the sluice — eleven children holding hands in a line. Nobody is singing. And tied to the bars of the last cage, a scrap of faded green silk.';
    if (t.startsWith('…Nix is in Greyspire too.') && f.nixSaved)
      return "…You got Nix out. Of course you did. Then the rest are in Greyspire. We swore it, {name}. All of us, or nobody.";
    return t;
  },
  whenIdle(fn, tries) { let n = 0; const tk = setInterval(() => { if (++n > (tries || 60)) return clearInterval(tk);
    if (!World.busy && !World.loading && !Dlg.open && G.mode === 'world' && n > 3) { clearInterval(tk); Story.run(fn); } }, 400); }
};

/* ---------------- new people ---------------- */
Object.assign(CHAR, {
  hesk: { name: 'Registrar Hesk', sprite: 'hesk' }, regman: { name: 'Registry Man', sprite: 'guard' },
  nix: { name: 'Nix', sprite: 'nix' }, tad: { name: 'Tad', sprite: 'kid8', kid: 1 }, tad2: { name: "Oswin's grandson", sprite: 'kid8', kid: 1 }
});
if (typeof ART_ID !== 'undefined') Object.assign(ART_ID, { hesk: 'reg', regman: 'soldier', tad: 'mbkid' });

/* ---------------- new foes ---------------- */
Object.assign(ENEMY, {
  reg_man: { name: 'Registry Man', img: 'guard', trait: 'Crown Registry — trained to take, not to fight fair', hp: 82, atk: 12, def: 5, spd: 11, dodge: .08, parry: .25, brk: 55, xp: 24, gold: 12,
    skills: [{ name: 'Baton Strike', hits: [{ anim: 'slash', m: 1, w: 560 }] }, { name: 'Seize', w: .35, hits: [{ anim: 'thrust', m: .7, w: 420 }, { anim: 'slash', m: .9, w: 360 }] }] },
  hesk: { name: 'Registrar Hesk', img: 'hesk', boss: 1, shield: 2, trait: 'STONE-FED — swallows stolen stones to heal and harden. Break his guard while he reaches and the stone drops.', hp: 270, atk: 15, def: 6, spd: 12, dodge: .1, parry: .3, brk: 85, xp: 110, gold: 80,
    skills: [{ name: 'Ledger Strike', hits: [{ anim: 'slash', m: .9, w: 520 }, { anim: 'slash', m: .7, w: 340 }] }, { name: 'Writ of Seizure', w: .3, hits: [{ anim: 'thrust', m: .6, w: 300 }, { anim: 'thrust', m: .6, w: 260 }, { anim: 'slash', m: 1.1, w: 480 }] },
      { name: 'Green Lantern', w: .2, hits: [{ anim: 'spellcast', m: 1.7, w: 900, unp: 1 }] }] },
  hesk2: { name: 'Hesk, the Ash Ledger', img: 'hesk', boss: 1, shield: 3, trait: 'STONE-FED — and now he burns what he can\'t own', hp: 330, atk: 17, def: 6, spd: 13, dodge: .1, parry: .3, brk: 95, xp: 150, gold: 100,
    skills: [{ name: 'Ledger Strike', hits: [{ anim: 'slash', m: .9, w: 520 }, { anim: 'slash', m: .8, w: 320 }] }, { name: 'Unwrite', w: .3, hits: [{ anim: 'thrust', m: .5, w: 280 }, { anim: 'thrust', m: .5, w: 240 }, { anim: 'thrust', m: .5, w: 220 }, { anim: 'slash', m: 1.2, w: 520 }] },
      { name: 'Burn the Record', w: .22, hits: [{ anim: 'spellcast', m: 1.9, w: 950, unp: 1 }] }] },
  cleaner: { name: 'Registry Cleaner', img: 'bandit', trait: 'They don\'t arrest. They burn.', hp: 88, atk: 13, def: 4, spd: 13, dodge: .15, parry: .15, brk: 55, xp: 26, gold: 14,
    skills: [{ name: 'Hatchet', hits: [{ anim: 'slash', m: 1.05, w: 540 }] }, { name: 'Torch Sweep', w: .35, hits: [{ anim: 'slash', m: .6, w: 380 }, { anim: 'slash', m: .8, w: 300 }] }] },
  nix_b: { name: 'Brother Nix', drag: 1, img: 'nix', trait: 'ASH-BLIND — fights by sound. A Drag who believes his blood is a curse. Words reach him where blades can\'t.', hp: 230, atk: 14, def: 4, spd: 17, dodge: .3, parry: .3, brk: 80, xp: 90, gold: 0,
    skills: [{ name: 'Censer Arc', hits: [{ anim: 'slash', m: .8, w: 480 }, { anim: 'slash', m: .8, w: 300 }] }, { name: 'Psalm of Ash', w: .3, hits: [{ anim: 'spellcast', m: 1.3, w: 700 }] },
      { name: 'Blind Flurry', w: .25, hits: [{ anim: 'thrust', m: .45, w: 260 }, { anim: 'thrust', m: .45, w: 230 }, { anim: 'thrust', m: .45, w: 210 }, { anim: 'slash', m: .7, w: 420 }] }] }
});
Object.assign(TIER, { reg_man: 'D', hesk: 'C', hesk2: 'C', cleaner: 'D', nix_b: 'C' });

/* STONE-FED: every third turn Hesk swallows a stone (heals, hits harder). A turn's warning first —
   break his guard in that window and the stone rolls away. */
function stoneFed(key, stones) {
  return async (B, Bt) => {
    const h = B.actors.find(a => a.key === key); if (!h || h.ko) return;
    if (h.stones === undefined) h.stones = stones;
    if (h.reach && h.broken && h.stones > 0) { h.reach = 0; h.stones--; h.st = 0; Bt.text(h, 'STONE DROPPED!', '#ffd34a', -60, true); sfx('break'); await Bt.msg('The green stone rolls out of his hand and across the floor!', 1500); }
    if (B.cur !== h || h.stones <= 0) return;
    h.st = (h.st || 0) + 1;
    if (h.st === 2) { h.reach = 1; await Bt.msg(`${h.name} reaches into the lead box for a stone… (break his guard NOW)`, 1700); return; }
    if (h.st >= 3) { h.st = 0; h.reach = 0; h.stones--; const n = Math.round(h.maxHp * .16); h.hp = Math.min(h.maxHp, h.hp + n); h.atk += 2; h.def += 1;
      Bt.text(h, 'STONE-FED +' + n, '#46ff95', -60, true); sfx('heal'); B.flash = .35; B.flashCol = '70,255,150';
      await Bt.msg(`He swallows the light. His veins glow green. (${h.stones} stone${h.stones === 1 ? '' : 's'} left)`, 1600); }
  };
}

/* =====================================================================================
   STEALTH — Registry patrols carry lanterns. Their light is drawn on the ground.
   Step into it (or bump into a patrol) and you fight; the next patrols see further.
   ===================================================================================== */
const Sneak = {
  on: false, R: 4, start: [16, 15], g: [],
  ROUTES: [
    { id: 'rp1', at: [8, 16], route: [[8, 16], [24, 16]] },
    { id: 'rp2', at: [22, 18], route: [[21, 18], [38, 18]] },
    { id: 'rp3', at: [26, 25], route: [[26, 25], [33, 25]] },
    { id: 'rp4', at: [44, 25], sentry: 1, turns: ['down', 'left', 'right'] },
    { id: 'rp5', at: [10, 32], route: [[10, 32], [48, 32]] },
    { id: 'rp6', at: [33, 37], route: [[33, 37], [47, 37]] }
  ],
  async begin() {
    if (G.S.map !== 'ashford') return; G.S.clock = 23 * 60; const f = AF();
    this.R = 4 + Math.min(2, f.a2alarm || 0); this.g = [];
    World.ents = World.ents.filter(e => !(e.folk || /^folk_/.test(e.id || '')));   // curfew: the streets are empty
    for (const r of this.ROUTES) { if ((f.a2down || []).includes(r.id)) continue; if (World.ent(r.id)) { this.g.push(r.id); continue; }
      const [x, y] = freeNear('ashford', r.at[0], r.at[1]);
      await World.addNpc({ id: r.id, sprite: 'guard', x, y, dir: 'down', name: 'Registry Man', ai: r.sentry ? 'turn' : 'patrol', route: r.route, turns: r.turns, talk: async e => Sneak.caught(e) });
      this.g.push(r.id); }
    this.on = true;
  },
  stop() { this.on = false; for (const id of this.g) World.remove(id); this.g = []; },
  cone(e) {   // tiles lit by one lantern, walls block the light
    const out = [], f = DIRS[e.dir] || [0, 1], C = World.col;
    for (let d = 1; d <= this.R; d++) { const w = Math.floor((d + 1) / 2);
      for (let s = -w; s <= w; s++) { const x = e.x + f[0] * d + (f[1] ? s : 0), y = e.y + f[1] * d + (f[0] ? s : 0);
        if (!C[y] || C[y][x] === undefined || C[y][x]) continue;
        let ok = true; const n = Math.max(Math.abs(x - e.x), Math.abs(y - e.y));
        for (let k = 1; k < n; k++) { const xx = Math.round(e.x + (x - e.x) * k / n), yy = Math.round(e.y + (y - e.y) * k / n); if (C[yy] && C[yy][xx]) { ok = false; break; } }
        if (ok) out.push([x, y]); } }
    return out;
  },
  tick() {
    if (!this.on || G.S.map !== 'ashford' || World.busy || World.loading || Dlg.open || G.mode !== 'world') return;
    const p = World.player; if (!p) return;
    for (const id of this.g) { const e = World.ent(id); if (!e) continue;
      const near = Math.abs(e.x - p.x) + Math.abs(e.y - p.y) <= 1;
      if (near || this.cone(e).some(([x, y]) => x === p.x && y === p.y)) { this.caught(e); return; } }
  },
  caught(e) {
    if (!this.on) return; this.on = false;
    Story.run(async () => {
      const f = AF(); e.say && e.say('!', 1600, '!'); sfx('alarm'); e.dir = World.dirTo(e, World.player);
      await say('regman', 'anger', pick(['"You there! Hood down, hands where I can see them!"', '"Curfew, friend. Registry business. HOLD!"', '"Lantern on him — THERE!"']));
      const foes = ['reg_man', 'reg_man']; if ((f.a2alarm || 0) >= 1) foes.push('reg_man');
      const r = await Battle.start({ enemies: foes, noFlee: true, bd: 'town', intro: 'A Registry patrol — and a whistle on his belt.' });
      if (r === 'lose') { await Story.defeat(); return; }
      f.a2alarm = (f.a2alarm || 0) + 1; f.a2down = (f.a2down || []).concat(e.id); World.remove(e.id); this.g = this.g.filter(x => x !== e.id);
      this.R = 4 + Math.min(2, f.a2alarm);
      toast(`<b style="color:#ffd36a">Alarm ${f.a2alarm}</b> — that patrol's down, but the others raise their lanterns higher.${f.a2alarm >= 3 ? ' <b style="color:#ff7a6a">Hesk knows you\'re coming.</b>' : ''}`, 3800);
      const p = World.player, [sx, sy] = this.start; p.move = null; p.x = sx; p.y = sy; p.px = sx * TILE + 16; p.py = sy * TILE + 26; G.S.x = sx; G.S.y = sy; World.followers.forEach(fl => { fl.x = sx; fl.y = sy; fl.px = p.px; fl.py = p.py; });
      await narr('You slip back into the alley behind Pip\'s house to catch your breath.');
      this.on = true;
    });
  },
  draw(c, t) {
    if (!this.on || G.S.map !== 'ashford' || G.mode !== 'world') return;
    const cx = Math.round(World.cam.x), cy = Math.round(World.cam.y), p = World.player;
    c.save(); c.globalCompositeOperation = 'lighter';
    for (const id of this.g) { const e = World.ent(id); if (!e) continue; const L = this.cone(e);
      for (const [x, y] of L) { const d = Math.abs(x - e.x) + Math.abs(y - e.y), hot = p && x === p.x && y === p.y;
        c.fillStyle = hot ? 'rgba(255,80,60,.5)' : `rgba(255,200,100,${.42 - d * .05 + Math.sin(t / 300 + d) * .03})`; c.fillRect(x * TILE - cx, y * TILE - cy, TILE, TILE); }
      c.strokeStyle = 'rgba(255,214,120,.35)'; c.lineWidth = 1; for (const [x, y] of L) c.strokeRect(x * TILE - cx + .5, y * TILE - cy + .5, TILE - 1, TILE - 1);
      const g = c.createRadialGradient(e.px - cx, e.py - cy - 24, 2, e.px - cx, e.py - cy - 24, 26); g.addColorStop(0, 'rgba(255,220,140,.75)'); g.addColorStop(1, 'rgba(255,220,140,0)');
      c.fillStyle = g; c.beginPath(); c.arc(e.px - cx, e.py - cy - 24, 26, 0, 7); c.fill(); }
    c.restore();
    // the storehouse door
    const dx = 39 * TILE + 16 - cx, dy = 36 * TILE - 6 - cy + Math.sin(t / 220) * 3;
    c.save(); c.font = '800 18px Nunito'; c.textAlign = 'center'; c.lineWidth = 3.5; c.strokeStyle = '#06140c'; c.strokeText('▼', dx, dy); c.fillStyle = '#46ff95'; c.fillText('▼', dx, dy); c.restore();
  }
};

/* =====================================================================================
   ARC II — THE STONE TAX
   ===================================================================================== */
const A2 = {
  needed() { const f = AF(); return !G.S.kid && f.learnedMill && !f.h1 && f.a2 !== 'done' && !f.millDone; },
  async start() {
    const f = AF(); if (f.a2) return; f.a2 = 'tax';
    await fadeOut(500); G.S.clock = 10 * 60; await World.load('ashford', 30, 26, 'up'); await wait(150);
    const put = async (id, sprite, x, y, dir) => { const [a, b] = freeNear('ashford', x, y); await World.addNpc({ id, sprite, x: a, y: b, dir, name: CHAR[id] ? CHAR[id].name : '' }); };
    await put('hesk', 'hesk', 30, 17, 'down'); await put('rg1', 'guard', 27, 18, 'down'); await put('rg2', 'guard', 33, 18, 'down'); await put('pipx', 'pip', 26, 23, 'right'); await put('bessx', 'pipmom', 24, 23, 'right');
    await fadeIn(500);
    await Arcs.card(1);
    await narr('A black wagon with iron-banded wheels stands by the fountain. On its side, painted in gold, the Crown Registry\'s open eye.');
    await say('hesk', 'neutral', '"By order of the Crown Registry: every green stone in the Ashen Vale is Crown property. Pebble, hearth-stone, fountain-stone. One per household, surrendered today. A hidden stone is a stolen stone."');
    await narr('Doors open one by one. Grandmothers carry out stones wrapped in cloth like sick animals. A man pries one out of his own hearth with a kitchen knife and hands it over, still warm.');
    await say('hesk', 'happy', '"Thank you. Thank you. Thank you. It\'s all written down."');
    await narr('Then a Registry man hauls a small boy out of a doorway by the collar. Pip. His fist is clenched around something that glows.');
    await say('pip', null, '"That\'s GERALD! Gerald is MINE! Gerald\'s a normal rock!"');
    await narr('Gerald is not a normal rock. Between Pip\'s fingers it pulses green — the same green as Nana\'s dust on the wind.');
    await me('shock', '(…A piece of the Heartstone. Even here. "Wherever they land, people will kill for them.")');
    await narr('The Registry man pries the small fingers open. Pip bites him. Hard.');
    await say('hesk', 'neutral', '"A child who finds one stone usually knows where to find more. Put him in the wagon. We\'ll ask him gently, in Aurel."');
    await say('pipmom', 'anger', '"NO— he\'s SIX! He found it in the river! PLEASE!"');
    const c = await ask('me', 'anger', '(Every Registry man in the square has a baton. Every window has a face in it.)', ['(Step in. Now.)', '(Hold back. Not here — not in daylight.)']);
    if (c === 0) {
      await me('anger', '"Let the boy go."');
      await say('hesk', 'neutral', '"And you are…? Hood up, in the sun. Name, district, and the colour of your eyes, please. For the form."');
      const r = await Battle.start({ enemies: ['reg_man', 'reg_man', 'reg_man'], noFlee: true, bd: 'town', intro: 'The Registry men drop the boy and draw their batons!' });
      if (r === 'lose') { f.pipTaken = 1; await Story.defeat(); await narr('Maren tells you while she wraps your ribs: they took the boy anyway. And every stone in the Hollow.'); }
      else {
        f.a2step = 1; Story.addSus(.5); Opinion.add('hope', .5);
        await narr('Pip runs straight into his mother\'s arms. When you turn around, the wagon is already rolling — Hesk on the box, calm as a clerk, the lead box of stones at his feet. Gerald in it.');
        await say('hesk', 'neutral', '"Assault on officers of the Crown. Hood, grey. Height, middling. Eyes, unknown — for now. It\'s all written down."');
      }
    } else {
      f.pipTaken = 1;
      await narr('You stay where you are. It is the hardest thing you have ever done standing still.');
      await narr('They lift Pip into the wagon beside the lead boxes. His mother runs after it all the way to the river lane, until her legs give out.');
    }
    for (const id of ['hesk', 'rg1', 'rg2', 'pipx', 'bessx']) World.remove(id);
    f.a2 = 'seen';
    const [bx, by] = freeNear('ashford', 27, 23); await World.addNpc({ id: 'bess', sprite: 'pipmom', x: bx, y: by, dir: 'down', name: "Pip's Mother", talk: () => A2.bess(), qm: () => '!' });
    Story.quest("Pip's mother is sitting by the fountain. Talk to her.");
  },
  async bess() {
    const f = AF();
    if (f.a2 === 'night') { await say('pipmom', 'sad', '"The low shed by the river, south-east. Tonight. Please."'); const c = await ask(null, null, 'Go now, under cover of night?', ['Go tonight', 'Not yet']); Dlg.close(); if (c === 0) await A2.night(); return; }
    if (f.a2 !== 'seen') return;
    if (f.pipTaken) {
      await say('pipmom', 'sad', '"You were there. You saw them do it."');
      await say('pipmom', 'anger', '"I know what you are. Pip told me — the hooded one with the eyes like fireflies. I told him Drags eat children. I told him that every night."');
      await say('pipmom', 'sad', '"The Registry keeps them in the low shed by the river — south-east, past the guild houses — one night, before the wagon leaves for Aurel. Tonight is the only night."');
      await say('pipmom', 'sad', '"Bring my son home. I don\'t care what you are. Tonight I can\'t afford to care."');
    } else {
      await say('pipmom', 'neutral', '"You fought Crown men. In the square. For my boy."');
      await say('pipmom', 'sad', '"…I told him Drags eat children. Every night, I told him."');
      await say('pipmom', 'sad', '"That stone was his father\'s — he found it in the river the spring his father drowned. He talks to it. The Registry will grind it into lamp-light for some prince."');
      await say('pipmom', 'neutral', '"They keep the stones in the low shed by the river, south-east. The wagon leaves for Aurel at dawn."');
    }
    await me('neutral', f.pipTaken ? '"I\'ll bring him home. Gerald too."' : '"Gerald\'s coming home."');
    if (G.S.party.includes('kess')) await say('kessE', 'neutral', '"Registry storehouse. They hire extra lanterns when the stone wagons are in town. Stay out of the light and they\'ll never know we were there. Step into it and the whole street wakes up."');
    f.a2 = 'night';
    await A2.night();
  },
  async night() {
    await fadeOut(700); G.S.clock = 23 * 60; World.remove('bess');
    await World.load('ashford', Sneak.start[0], Sneak.start[1], 'right'); await wait(150); await Sneak.begin(); await fadeIn(700);
    await narr('Night. Lanterns move along the streets of the Hollow — Registry patrols, more than you\'ve ever seen.');
    toast('<b style="color:#ffd36a">Stay out of the lantern light.</b> Reach the storehouse door by the river (the green ▼). Get seen and you fight — and the other patrols look further.', 6500);
    Story.quest('Night: reach the Registry storehouse — the low shed by the river, south-east (green ▼). Stay out of the lantern light.');
  },
  async door() {
    const f = AF();
    if (f.a2 !== 'night') { await narr(f.a2 === 'done' ? 'The Registry shed. The lock is broken and nobody has come to fix it.' : 'A low shed by the river with a Crown Registry seal on the door. Locked.'); return; }
    Sneak.stop(); G.S.ret = { map: 'ashford', x: 39, y: 37 };
    await fadeOut(500); await World.load('a_registry', 15, 12, 'up'); await fadeIn(500);
    await A2.inside();
  },
  async inside() {
    const f = AF(), alarm = f.a2alarm || 0;
    await narr('Shelves to the ceiling. Every shelf full of lead boxes, every box labelled in a neat, small hand. In the middle of it all, Registrar Hesk is weighing a green pebble on a brass scale.');
    if (alarm >= 3) await say('hesk', 'happy', '"Three patrols down. You could have knocked. I\'ve been waiting with the lamps lit."');
    else await say('hesk', 'neutral', '"I wondered if you\'d come. The hooded ones always come back for the stones. Sentiment."');
    await say('hesk', 'neutral', '"Don\'t mistake me for Halvard. Halvard hates your kind. Hatred is expensive. I simply count. Every stone. Every child. Every Drag. Everything in this vale belongs somewhere, and I write down where."');
    if (f.pipTaken) await narr('In a cage at the back, Pip is asleep on a grain sack, Gerald\'s empty cloth still clutched in his fist.');
    const c = await ask('me', 'anger', '…', ['"Pip goes home. So do the stones."', '"Write this down."', '"You swallow them, don\'t you?"']);
    if (c === 1) await say('hesk', 'happy', '"Ha. I will."');
    if (c === 2) await say('hesk', 'shock', '"…Clever. One a season, since I was nineteen. Do you know what it feels like to never be tired again?"');
    else await say('hesk', 'neutral', '"A single stone keeps a Registry lantern lit for a year. Or keeps a Registrar awake for one. Do you know what it is to never be tired again?"');
    const foes = ['hesk', 'reg_man']; if (alarm >= 2) foes.push('reg_man');
    const r = await Battle.start({ enemies: foes, noFlee: true, boss: true, bd: 'town', music: 'boss', intro: 'Registrar Hesk — the Crown Registry', onTurn: stoneFed('hesk', 3 + (alarm >= 3 ? 1 : 0)) });
    if (r === 'lose') { await Story.defeat(); f.a2 = 'night'; return; }
    World.remove('hesk'); World.remove('pipc');
    await narr('Hesk staggers into the shelves. Lead boxes rain down around him and burst open, and the room fills with soft green light.');
    await say('hesk', 'anger', '"You can\'t steal from the Crown, you— it\'s ALL WRITTEN DOWN!"');
    await narr('He goes out through the back window like a man who has practised it. A whistle somewhere by the river — then nothing.');
    // the boy, and Gerald
    if (f.pipTaken) {
      await narr('The cage key hangs on a nail, exactly where a tidy man would hang it.');
      await say('pip', null, '"…Is Gerald okay? Did they hurt Gerald?"');
      await me('happy', '"Gerald\'s fine. Gerald\'s tough."');
      await say('pip', null, '"Your eyes are glowing again. I won\'t tell. Gerald won\'t either. Gerald never tells."');
    } else await narr('Gerald is in the third box from the left, labelled ITEM 2210 — PEBBLE, RIVER, CHILD\'S. You put him in your pocket.');
    // the ledger
    await narr('Hesk\'s ledger lies open on the desk. You turn the pages back five years, to the autumn your village burned.');
    await narr('"ITEM 1147 — THORNVALE SURVEY. One map, hand-drawn, bridge and Heartstone marked. Purchased of an informant styled THE WEAVER. Three hundred crowns, paid at the Millbrook crossing, 4th of Frostmoon. Ref.: Inquisitor Halvard."');
    await me('anger', '"…The Weaver."');
    await narr('You tear the page out. Halvard\'s men burned Thornvale. But somebody sold them the road.');
    f.weaverClue = 1; Intel.add('you', 'Hesk\'s ledger: Thornvale was SOLD — a map bought from an informant called "the Weaver", 300 crowns, paid at the Millbrook crossing on the 4th of Frostmoon, five years ago.');
    // the stones
    const s = await ask(null, null, 'Forty-one green stones in broken lead boxes. Every one was taken from a family in the Hollow.', ['Return them — one to every house, before dawn.', 'Give them to Green Eclipse. They need weapons more than lamps.', 'Smash them. Like Nana did.']);
    if (s === 0) {
      f.a2stones = 'return'; Opinion.add('hope', 1.5);
      await narr('It takes you until the sky goes grey. Window ledges, doorsteps, one on a sleeping baker\'s pillow. You don\'t know which stone belongs to which house. You decide that doesn\'t matter.');
    } else if (s === 1) {
      f.a2stones = 'ge'; Opinion.add('fear', 1); f.geTrust = (f.geTrust || 0) + 1;
      await narr('A soft whistle at the back window. Tamsin is crouched on the sill, as if she\'s been there all night.');
      await say('tamsin', null, '"Forty-one. Kairo said you\'d never." She lifts the boxes out one by one. "He\'ll remember this. So will the Crown, when the walls come down."');
    } else {
      f.a2stones = 'smash'; Story.gainXp(40);
      await narr('You take the hammer from the Registry\'s own workbench. Forty-one stones. Forty-one small green suns going out.');
      await narr('The dust lifts through the broken window and drifts east on the wind, the way Nana\'s did.');
      await me('sad', '"Let the Crown chase the wind."');
    }
    Story.gainXp(150); G.S.gold += 60; f.a2 = 'done'; f.a2fresh = 1; f.a2wait = 0;
    Intel.add('you', 'The Stone Tax is broken for now. Registrar Hesk escaped through the back window.');
    // morning
    await fadeOut(700); G.S.clock = 7 * 60; G.S.ret = null; await World.load('ashford', 18, 15, 'left'); await wait(150);
    const [bx, by] = freeNear('ashford', 16, 15); await World.addNpc({ id: 'bessm', sprite: 'pipmom', x: bx, y: by, dir: 'right', name: "Pip's Mother" });
    const [px, py] = freeNear('ashford', 15, 16); await World.addNpc({ id: 'pipm', sprite: 'pip', x: px, y: py, dir: 'right', name: 'Pip' });
    await fadeIn(700);
    await narr(f.pipTaken ? 'Dawn. Pip\'s mother is on her doorstep in her nightclothes. She sees the small shape walking beside you and makes a sound you will remember for a long time.' : 'Dawn. Pip is on the doorstep before you reach it, as if he\'s been waiting all night. He probably has.');
    await say('pip', null, '"GERALD!"');
    await say('pipmom', 'sad', '"…I still don\'t know what you are."');
    await say('pipmom', 'neutral', '"But you\'re not what I told him. I\'ll stop telling him that."');
    f.bessKind = 1;
    World.remove('bessm'); World.remove('pipm');
    Story.quest('Rest. Breathe. The Old Mill lead still stands — and the bells of the Hollow have been quiet for too long.');
  }
};
SCENES.a_registry = { map: 'in_registry', title: 'Crown Registry Storehouse', subtitle: 'Everything written down', music: 'night', bd: 'town', safe: true,
  exits: [{ x: 15, x2: 16, y: 13, to: 'ashford', tx: 39, ty: 37, dir: 'down' }],
  npcs() { const f = AF(), L = []; if (f.a2 === 'night') L.push({ id: 'hesk', sprite: 'hesk', x: 11, y: 12, dir: 'right', name: 'Registrar Hesk', talk: () => A2.inside() }); if (f.a2 === 'night' && f.pipTaken) L.push({ id: 'pipc', sprite: 'pip', x: 2, y: 11, dir: 'right', name: 'Pip' }); return L; },
  tiles: { '8,13': async () => narr('Ledgers. Thousands of names, every one in the same small, careful hand.') },
  async setup(W) { W.tint = 'rgba(10,20,15,.12)'; W.lights.push({ x: 4 * 32, y: 13 * 32, r: 90, c: '255,200,120' }, { x: 18 * 32, y: 14 * 32, r: 80, c: '255,200,120' }, { x: 15 * 32, y: 9 * 32, r: 110, c: '90,255,150' }); } };

/* =====================================================================================
   ARC IV — THE BOY WHO PRAYS
   ===================================================================================== */
const NIX_CP = [
  { th: .7, ex: 'preach', q: '"The blood is a CURSE, {name}. I\'ve felt it — it wants to burn things. He showed me the old texts. The Dragonoid. The end of the world. It\'s IN us."',
    o: ['"Then why do you still talk to the dove in the old tongue?"', '"Halvard is a liar."', '"Maybe it is a curse. So what?"'], ok: 0,
    yes: ['shock', '"…That\'s— that\'s only a habit. It doesn\'t mean anything." His censer swings wide.'], no: [['anger', '"He\'s the only one who ever told me the truth!"'], ['cold', '"So it has to be cut out. That\'s what he\'s doing. Cutting."']] },
  { th: .4, ex: 'cry', q: '"Nobody came for us. Five years. We sang and we sang and NOBODY CAME."',
    o: ['"Kairo came. He burned half the vale looking."', '"I came. I\'m late. I\'m sorry. I\'m here."', '"We were children. What could we have done?"'], ok: 1,
    yes: ['cracked', '"…You\'re late." It comes out almost like a laugh.'], no: [['anger', '"Kairo came for REVENGE. Not for us."'], ['cold', '"Exactly. Children. And now we\'re his."']] },
  { th: .15, ex: 'scared', q: '"If I stop praying… if I\'m not his anymore… then what am I?"',
    o: ['"Free."', '"A Drag. Same as me."', '"You\'re Nix. You said it on the wall: all of us, or nobody."'], ok: 2,
    yes: ['cry', '"…All of us. Or nobody." The censer slips out of his hand and rings on the stones.'], no: [['tired', '"Free is a word for people with somewhere to go."'], ['shock', '"Don\'t. Don\'t make me one of you again."']] }
];
const A4 = {
  async dove() {
    const f = AF(); if (f.a4) return; f.a4 = 'note';
    await Arcs.card(3);
    await narr('Something lands on your shoulder. A white dove, soft as dust, with a strip of linen tied to its leg.');
    await narr('Written on the linen in charcoal, in letters that wobble like a child learned them and then stopped practising:');
    await narr('"ALL OF US OR NOBODY. MILL-RACE. MOONRISE."');
    await me('shock', '"…Nix."');
    await narr('Only six people alive know those words. You were one of them. The dove lifts off and flies north, over the gate, toward the Old Mill.');
    if (G.S.party.includes('kess')) await say('kessE', 'neutral', '"A dove that knows your name. Either a friend, or the best trap I\'ve ever seen. …We\'re going either way, aren\'t we."');
    Story.quest(f.vossGone ? 'Moonrise at the mill-race: take the north road to the Old Mill (North Gate, top of town). Someone who knows the oath is waiting.' : 'Moonrise at the mill-race — but Captain Voss still holds the North Gate (top of town). Get past him; Kess said she\'d help.');
  },
  async meet() {
    const f = AF(); if (f.a4 !== 'note') return; f.a4 = 'met';
    const [nx, ny] = freeNear('mill', 17, 21); await World.addNpc({ id: 'nixm', sprite: 'nix', x: nx, y: ny, dir: 'down', name: 'Brother Nix' });
    await narr('Moonrise. The mill-race is a black ribbon of water below the road. On the stone lip of the sluice sits a boy in white robes, a white dove on his knee. A bandage is wound tight across his eyes.');
    await narr('He is murmuring to the dove. Not prayer-speech — the old Drag tongue. The words Nana used to sing you to sleep with.');
    await say('nix', 'calm', '"You came. I asked Psalm to find the one who still smells of Thornvale smoke. She\'s never wrong."');
    await me('shock', '"Nix…? Your eyes—"');
    await say('nix', 'steady', '"Ash drops. Every morning for five years. It stops stinging after the first one. The green is almost gone now. Brother Halvard says by winter I\'ll be clean."');
    await say('nix', 'preach', '"I didn\'t call you to fight. I called you to STOP. Every time someone like you comes for us, he makes us sing longer. The little ones\' voices crack. There are eleven left down there."');
    await me('anger', '"Where\'s Ilya?"');
    await say('nix', 'tired', '"Gone. Three nights ago. Riders in black took the oldest singers to Greyspire. She bit the one who chained her. Of course she did."');
    await say('nix', 'preach', '"Kneel with me, {name}. Confess the blood. He\'s kind to the ones who confess. Kinder."');
    const c = await ask('me', 'sad', '…', ['"I won\'t kneel to the man who burned our home."', '"Come with me instead. Tonight."']);
    if (c === 0) await say('nix', 'cold', '"Then I have to carry you in. It\'s for your own good. It\'s always for our own good."');
    else { await say('nix', 'cracked', '"…Don\'t. Don\'t say it like it\'s easy."'); await say('nix', 'cold', '"If I leave, he picks another singer. One of the little ones. So I have to bring you in instead."'); }
    await narr('Psalm takes off. Nix stands and lets a censer on a long chain unwind from his wrist. He can\'t see you. He tilts his head, listening — and smiles.');
    World.remove('nixm');
    let right = 0; const asked = [];
    const cp = async (k, inBattle) => {
      const P = NIX_CP[k]; asked[k] = 1;
      const a = await ask('nix', P.ex, P.q, P.o); Dlg.close();
      if (a === P.ok) { right++; await say('nix', P.yes[0], P.yes[1]); } else { const n = P.no[a < P.ok ? a : a - 1] || P.no[0]; await say('nix', n[0], n[1]); }
      Dlg.close(); return a === P.ok;
    };
    const r = await Battle.start({ enemies: ['nix_b'], noFlee: true, boss: true, bd: 'mill', music: 'boss', intro: 'Brother Nix — he fights by sound. Talk to him as you fight.',
      onTurn: async (B, Bt) => {
        const n = B.actors.find(a => a.key === 'nix_b'); if (!n || n.ko) return;
        for (let k = 0; k < 3; k++) if (!asked[k] && n.hp < n.maxHp * NIX_CP[k].th) {
          const ok = await cp(k, true);
          if (ok) { n.atk = Math.round(n.atk * .85); n.spd = Math.max(8, n.spd - 2); Bt.text(n, 'HIS HANDS SHAKE', '#9fd8ff', -60, true); sfx('heal'); }
          else { n.atk = Math.round(n.atk * 1.1); Bt.text(n, 'THE PRAYER GROWS LOUDER', '#ff9a6a', -60, true); sfx('alarm'); }
          if (k === 2) { await Bt.msg('Nix drops to one knee.', 1200); return 'win'; }
          return;
        }
      } });
    if (r === 'lose') { f.a4 = 'note'; await Story.defeat(); return; }
    for (let k = 0; k < 3; k++) if (!asked[k]) await cp(k, false);
    Story.gainXp(110);
    await World.addNpc({ id: 'nixm', sprite: 'nix', x: nx, y: ny, dir: 'down', name: 'Brother Nix' });
    if (right >= 2) {
      f.nixSaved = 1; f.millGuards = true; Opinion.add('hope', 1); World.remove('acolyte'); World.remove('acolyte2');
      await narr('Nix sits down in the wet grass as if someone cut his strings. Psalm lands on his shoulder and stays there.');
      await say('nix', 'tired', '"Halvard keeps the eleven in the cellar. The choir. The stone hums when we sing. It hummed loudest for Ilya. He wants it awake for the Prince-Regent before winter."');
      await say('nix', 'steady', '"There\'s a sluice gate under the wheel. The Wardens never watch it — they think the water is holy. I\'ll open it. You\'ll come up right behind his chair."');
      await say('nix', 'nervous', '"And after… I don\'t know where I go after. I\'ve never had an after."');
      await me('neutral', '"Ashford. Maren the healer. She doesn\'t ask questions. Tell her I sent you — and ask her to look at your eyes."');
      await say('nix', 'worried', '"…Will they be green again?"');
      await me('sad', '"I don\'t know. I hope so."');
      Intel.add('you', 'Nix is free. He opened the sluice under the mill wheel — the Wardens at the door are behind you, and Halvard won\'t see you coming. Eleven children are still in the cellar.');
      Story.quest('Nix opened the sluice. Go up through the mill — Halvard is waiting at the top of the yard, and he won\'t see you coming.');
    } else {
      f.nixLost = 1;
      await narr('Nix goes down on one knee. For a moment you think he\'ll take the hand you hold out.');
      await say('nix', 'cold', '"…No. You\'d only get them killed."');
      await narr('Psalm screams. Torches along the yard — Wardens, running. Nix is gone between them before you can reach him.');
      await say('nix', 'sad', '"Don\'t come up to the mill, {name}. Please. Please don\'t."');
      Intel.add('you', 'Nix ran back to Halvard. The mill knows you\'re here — more Wardens at the door.');
      Story.quest('Nix ran back to Halvard. The Old Mill knows you\'re coming now. Go anyway.');
    }
    World.remove('nixm');
    await Arcs.card(4);
  }
};

/* =====================================================================================
   ARC VI — THE FERRYMAN'S LEDGERS
   ===================================================================================== */
const LEDGER = [
  '"3rd Frostmoon — Crown Registry wagon, two clerks, sealed crates. Southbound. Paid in Registry scrip."',
  '"4th Frostmoon — one traveller, northbound, on foot. Hood up, gloves in the heat. Paid in new Crown silver — far too much. Asked which road climbs to the tomb-mountains. Tied the mooring rope in a knot I\'d never seen."',
  '"4th Frostmoon — Edda the tinker, cart and mule. Northbound. Pots."'
];
const A6 = {
  async call() {
    const f = AF(); if (f.a6 !== 'call') return; f.a6 = 'sent';
    await Arcs.card(5);
    const [x, y] = freeNear(G.S.map, World.player.x - 1, World.player.y); await World.addNpc({ id: 'tad', sprite: 'kid8', x, y, dir: 'right', name: 'Tad' });
    await narr('A small boy in a fisherman\'s jumper three sizes too big skids to a stop in front of you, out of breath. He has run all the way from the river.');
    await say('tad', null, '"You\'re the hooded one? Grandpa Oswin says come quick. Registry men came to the landing asking about his books. ALL his books. He told them the river ate them."');
    await say('tad', null, '"He says to tell you — the river didn\'t eat them. And, um… the ferry remembers what you\'re looking for. He made me say it twice."');
    if (f.weaverClue) await me('neutral', '"…Paid at the Millbrook crossing. Fourth of Frostmoon."');
    else await me('neutral', '"One of your own drew us the map," Halvard said. Oswin counts everyone who crosses.');
    World.remove('tad');
    Story.quest('Go to Oswin at the Millbrook landing (south gate, then the west river road). His ledgers may name the one who sold Thornvale. Highmark can wait one day.');
  },
  async oswin() {
    const f = AF();
    if (!f.a6sol) {
      await say('oswin', null, '"Forty-one years I\'ve counted. Every wagon, every barge, every soul that crossed my river. Nobody ever once asked me to read it back."');
      await say('oswin', null, '"And now the Registry wants the books burned. That tells me there\'s something in \'em worth reading. Five years back, first frost, you said? I remember the frost. I don\'t remember the faces."');
      await narr('He sets three ledgers on the landing rail and opens each one to the same week.');
      f.a6wrong = f.a6wrong || 0;
      for (let tries = 0; tries < 3; tries++) {
        const c = await ask(null, null, 'Three crossings that week, in Oswin\'s cramped hand. Which one sold Thornvale?', ['The Registry wagon (3rd Frostmoon)', 'The lone traveller (4th Frostmoon)', 'Edda the tinker (4th Frostmoon)']);
        Dlg.close(); await narr(LEDGER[c]);
        if (c === 1) break;
        f.a6wrong++;
        if (c === 0) await say('oswin', null, '"That\'s the buyers, not the seller. A seller doesn\'t ride in the buyer\'s wagon where the whole river can see."');
        else await say('oswin', null, '"Edda? Edda mended half the pots in your valley. She\'d sooner sell her own mule. And she likes that mule."');
      }
      await say('oswin', null, '"…Aye. That one. I drew the knot in the margin. I always draw what I don\'t understand."');
      await narr('In the margin, in pencil: a knot that doubles back on itself twice and ends in a loop like a tail. A dragon knot. Ilya ties hers that way. Only Thornvale ties it that way.');
      await say('oswin', null, '"Gave a name, too. I make everyone give a name. \'Weaver.\' Said it like a joke."');
      await me('anger', '"It wasn\'t a joke."');
      if (G.S.party.includes('kess')) await say('kessE', 'sad', '"Someone from your own village, walking north with Crown silver in their pocket. …I\'m sorry, Ren. Truly."');
      f.a6sol = 1;
    }
    await narr('Down the river road: torchlight. Far too many torches for a fishing village at night.');
    await say('oswin', null, '"There they are. Registry cleaners. They don\'t arrest, son. They burn."');
    if (f.a2 === 'done') await say('hesk', 'happy', '"Good evening, ferryman. Good evening, hooded one. I did tell you it was all written down. I\'ve come to unwrite it."');
    const w1 = ['cleaner', 'cleaner']; if (f.a6wrong >= 1) w1.push('cleaner'); if (f.a6wrong >= 2) w1.push('reg_man');
    let r = await Battle.start({ enemies: w1, noFlee: true, bd: 'field', intro: 'Registry Cleaners — torches lit!' + (f.a6wrong ? ' (You took too long with the books — more of them reached the landing.)' : '') });
    if (r === 'lose') { await Story.defeat(); return; }
    await narr('The ledger shed is burning. Oswin is throwing river water at forty-one years with a bucket. Tad is helping with a smaller bucket.');
    r = await Battle.start({ enemies: ['hesk2', 'cleaner'], noFlee: true, boss: true, bd: 'field', music: 'boss', intro: 'Hesk, the Ash Ledger — the Registrar wants every page', onTurn: stoneFed('hesk2', 2) });
    if (r === 'lose') { await Story.defeat(); return; }
    await narr('Hesk goes backwards off the landing. The current takes him south, still shouting something about receipts.');
    await say('oswin', null, '"Lost the shed. Kept the page. Kept my grandson. By ferry reckoning, that\'s a good night."');
    await narr('He tears the page out of the ledger — the traveller, the silver, the knot — and folds it into your hand.');
    await me('sad', '"Someone who ate at our table. Someone who sat at the festival fire."');
    await narr('You fold the page into your shirt, next to the ribbon. Greyspire first. Ilya first. Then the Weaver.');
    f.a6 = 'done'; f.weaverPage = 1; Story.gainXp(160); G.S.gold += 80; Opinion.add('hope', .5); Story.heal(true);
    Intel.add('you', 'THE WEAVER: a lone, hooded traveller crossed north at Millbrook on the 4th of Frostmoon, five years ago, paid in new Crown silver — and tied a Thornvale dragon knot. One of your own sold your valley.');
    Story.quest('The Guild Trial: take the carriage from the south side of Ashford\'s Market Square to Highmark.');
  }
};

/* =====================================================================================
   WIRING
   ===================================================================================== */
(function () {
  // every dialogue line passes through the arcs' memory
  const _line = Dlg.line.bind(Dlg);
  Dlg.line = function (who, expr, text, choices) { try { text = Arcs.fix(text); } catch (e) { } return _line(who, expr, text, choices); };
  // Arc I card when Chapter I begins
  const _pe = Story.prologueEnd; Story.prologueEnd = async function () { const r = await _pe.apply(this, arguments); await Arcs.card(0); return r; };
  // Arc II comes before the pyre; Arc III's card on the pyre
  if (typeof pyreInSquare === 'function') {
    const _py = pyreInSquare;
    pyreInSquare = async function () { const f = AF();
      if (A2.needed()) { if (!f.a2) return A2.start(); return; }
      if (f.a2 === 'done' && f.a2fresh) return;
      await Arcs.card(2); return _py(); };
  }
  // the storehouse door
  SCENES.ashford.tiles['39,36'] = () => A2.door();
  // Pip's mother waits by the fountain while the arc is open
  const ash = SCENES.ashford, _np = ash.npcs;
  ash.npcs = function () { const L = _np.call(this), f = AF();
    if (f.a2 === 'seen' || f.a2 === 'night') { const [x, y] = freeNear('ashford', 27, 23); L.push({ id: 'bess', sprite: 'pipmom', x, y, dir: 'down', name: "Pip's Mother", talk: () => A2.bess(), qm: () => '!' }); }
    return L; };
  // loads: start/stop the night, the dove, Oswin's grandson
  const _l = World.load.bind(World);
  World.load = async function (name, x, y, dir) {
    if (name !== 'ashford' && Sneak.on) Sneak.stop();
    const r = await _l(name, x, y, dir);
    try {
      const f = G.S && G.S.f; if (!f || G.S.kid) return r;
      if (name !== 'ashford' && name !== 'a_registry' && f.a2fresh) f.a2fresh = 0;
      if (name === 'ashford' && f.a2 === 'night' && !Sneak.on) setTimeout(() => { if (G.S.map === 'ashford' && AF().a2 === 'night') Sneak.begin(); }, 300);
      if (name === 'ashford' && f.sealGot && !f.a4 && !f.halvardBeaten) Arcs.whenIdle(() => A4.dove());
      if ((name === 'ashford' || name === 'a_inn') && f.a6 === 'call') Arcs.whenIdle(() => A6.call());
      if (name === 'mill' && f.a4 === 'note') Arcs.whenIdle(() => A4.meet());
      else if (name === 'mill' && !f.halvardBeaten && !(f.arcCard || {})[4]) Arcs.whenIdle(() => Arcs.card(4));
    } catch (e) { console.warn(e); }
    return r;
  };
  // per-frame: stealth, and a short breath between Arc II and the pyre
  const _u = World.update.bind(World);
  World.update = function (dt) { const out = _u(dt);
    try { Sneak.tick();
      const f = G.S && G.S.f;
      if (f && f.a2 === 'done' && f.a2fresh && !f.h1 && G.S.map === 'ashford' && !World.busy && !Dlg.open && G.mode === 'world') { f.a2wait = (f.a2wait || 0) + dt; if (f.a2wait > 25000) { f.a2fresh = 0; Story.run(pyreInSquare); } }
    } catch (e) { }
    return out; };
  const _r = World.render.bind(World);
  World.render = function (c, t) { const out = _r(c, t); try { Sneak.draw(c, t); } catch (e) { } return out; };
  // Arc IV echoes in the mill
  const _bs = Battle.start.bind(Battle);
  Battle.start = async function (cfg) {
    try { const f = AF();
      if (cfg && cfg.enemies && cfg.bd === 'mill' && cfg.enemies.join() === 'acolyte,acolyte,bandit' && f.nixLost) { cfg.enemies = cfg.enemies.concat('ember_warden'); cfg.intro = 'Nix warned them. There are more of them now.'; }
      if (cfg && cfg.enemies && cfg.enemies.includes('halvard') && f.nixSaved) cfg.intro = (cfg.intro || '') + ' (You came up through the sluice — he never saw you coming.)';
    } catch (e) { }
    return _bs(cfg); };
  const _run = Battle.run.bind(Battle);
  Battle.run = async function () { try { const B = this.B; if (AF().nixSaved && !B.nixCut) { B.nixCut = 1; for (const e of B.actors) if (e.key === 'halvard') { e.maxHp = Math.round(e.maxHp * .82); e.hp = Math.min(e.hp, e.maxHp); e.wait += 60; } } } catch (x) { } return _run(); };
  // after the roof, before the Trial: the ferryman's ledgers
  if (typeof Trial !== 'undefined') {
    const _to = Trial.open.bind(Trial);
    Trial.open = async function () { const f = AF(), was = f.trial; const r = await _to(); if (!was && f.trial === 'open' && !f.a6) f.a6 = 'call'; return r; };
  }
  if (SCENES.millbrook) { const mb = SCENES.millbrook, _mn = mb.npcs; mb.npcs = function () { const L = _mn.call(this); if (AF().a6 === 'sent') { const o = L.find(n => n.id === 'oswin'); if (o) o.qm = () => '!'; } return L; }; }
  if (typeof talkOswin === 'function') { const _o = talkOswin; talkOswin = async function () { const f = AF(); if (f.a6 === 'sent') return A6.oswin(); return _o.apply(this, arguments); }; }
  if (typeof Coach !== 'undefined') {
    const _cr = Coach.ride.bind(Coach);
    Coach.ride = async function (to) { const f = AF();
      if (to === 'hm' && f.trial === 'open' && (f.a6 === 'call' || f.a6 === 'sent')) { await narr("Tad's words are still in your ears. Millbrook first — Oswin's ledgers. The Trial can wait one day."); return false; }
      if (to === 'hm' && f.trial === 'open') await Arcs.card(6);
      return _cr(to); };
  }
  // the Quests page shows where you are in the chapter
  if (typeof questsMenuHTML === 'function') { const _q = questsMenuHTML; questsMenuHTML = function () { let h = _q(); try { if (G.S.chapter === 1 && !G.S.kid && !AF().chapter1Done) h = Arcs.html() + h; } catch (e) { } return h; }; }
  // restarting the chapter forgets the arcs
  if (typeof CH1_FLAGS !== 'undefined') CH1_FLAGS.push('a2', 'a2alarm', 'a2down', 'a2step', 'a2stones', 'a2fresh', 'a2wait', 'pipTaken', 'bessKind', 'weaverClue', 'a4', 'nixSaved', 'nixLost', 'a6', 'a6sol', 'a6wrong', 'weaverPage', 'arcCard');
})();
