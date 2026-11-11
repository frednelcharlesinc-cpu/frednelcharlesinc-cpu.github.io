'use strict';
/* =====================================================================================
   ARC IV — SMOKE AND GLASS (Kess)
   The Glass Road: twelve years, thirty-one Drag children smuggled out of the vale.
   A trail to read in the West Woods, a solo fight against a Drag in a Registry collar,
   the Catcher who sold Kess's mother — and a knife, and a choice that isn't Ren's.
   ===================================================================================== */
Object.assign(CHAR, { bertrand: { name: 'Bertrand the Catcher', sprite: 'hunter' }, corvin: { name: 'Corvin', sprite: 'rebel2' } });
Object.assign(ENEMY, {
  catcher: { name: 'Catcher', img: 'bandit', trait: 'Paid by the head', hp: 82, atk: 12, def: 4, spd: 12, dodge: .12, parry: .15, brk: 55, xp: 24, gold: 12,
    skills: [{ name: 'Cudgel', hits: [{ anim: 'slash', m: 1.05, w: 540 }] }, { name: 'Net and Strike', w: .35, hits: [{ anim: 'thrust', m: .6, w: 420 }, { anim: 'slash', m: .9, w: 360 }] }] },
  corvin_e: { name: 'Corvin the Collared', drag: 1, img: 'rebel2', trait: 'A licensed Drag — the Crown lets him keep his eyes if he brings them other people\'s', hp: 195, atk: 14, def: 5, spd: 16, dodge: .25, parry: .25, brk: 75, xp: 70, gold: 30,
    skills: [{ name: 'Glaive Sweep', hits: [{ anim: 'slash', m: .9, w: 520 }, { anim: 'slash', m: .7, w: 320 }] }, { name: 'Collar Hook', w: .3, hits: [{ anim: 'thrust', m: .55, w: 300 }, { anim: 'thrust', m: .55, w: 260 }, { anim: 'thrust', m: 1.1, w: 520 }] },
      { name: 'Drag Rush', w: .2, hits: [{ anim: 'thrust', m: .4, w: 220 }, { anim: 'thrust', m: .4, w: 200 }, { anim: 'thrust', m: .4, w: 190 }, { anim: 'slash', m: .9, w: 420 }] }] },
  bertrand: { name: 'Old Bertrand, the Catcher', img: 'hunter', boss: 1, trait: "CATCHER'S ROPE — every third turn he lassos one of your fighters and they lose a turn. Forty years of knots.", hp: 270, atk: 15, def: 6, spd: 11, dodge: .1, parry: .35, brk: 90, xp: 120, gold: 70,
    skills: [{ name: 'Hook and Haul', hits: [{ anim: 'slash', m: .8, w: 520 }, { anim: 'thrust', m: .9, w: 380 }] }, { name: 'Old Man\'s Patience', w: .3, hits: [{ anim: 'slash', m: .5, w: 260 }, { anim: 'slash', m: .5, w: 230 }, { anim: 'slash', m: .5, w: 210 }, { anim: 'thrust', m: 1.2, w: 600 }] },
      { name: 'Sack and Cudgel', w: .2, hits: [{ anim: 'slash', m: 1.8, w: 900, unp: 1 }] }] }
});
const KA_SIGNS = [[30, 19], [20, 21], [7, 26]];
const KA = {
  async signal() {
    const f = AF(); if (f.ka) return; f.ka = 'signal';
    await Arcs.card(3);
    await narr('On the clinic wall, low down where a child could reach, someone has drawn a pair of spectacles in chalk. One lens has a crack through it.');
    await say('kessE', 'shock', '"…No. No, no, no."');
    await me('neutral', '"Kess?"');
    await say('kessE', 'sad', '"That\'s mine. My mark. Every kid on the road knows it. In trouble — draw the glasses, break one lens."');
    await say('kessE', 'neutral', '"You want the truth? I don\'t just hide in this town. I run a road out of it. Twelve years. Thirty-one Drag kids, vale to the coast, one cellar and one boat at a time. The Glass Road."');
    await say('kessE', 'sad', F().h1 === 'done' ? '"Edda took the last run. Two children in the bottom of her pot-cart. She left the night you got her out of the chapel."' : '"Edda took the last run. Two children in the bottom of her pot-cart."');
    await say('maren', 'sad', '"Fen found the cart this morning, on its side in the West Woods. Pots everywhere. No Edda. No children."');
    await say('maren', 'sad', '"There\'s a catcher working those woods. Bertrand. Old, patient, paid by the head. He\'s been doing it longer than you\'ve been alive, Kess."');
    await say('kessE', 'anger', '"I know exactly how long he\'s been doing it."');
    f.ka = 'woods'; f.kaSign = [];
    Story.quest('The Glass Road: go to the West Woods (Crossroads, then west) and follow Edda\'s trail. Look for the ? marks.');
  },
  async sign(i) {
    const f = AF(); if (f.ka !== 'woods') return; f.kaSign = f.kaSign || []; if (f.kaSign.includes(i)) return;
    f.kaSign.push(i);
    if (i === 0) { await narr('Edda\'s cart, on its side in the ditch. Pots and kettles everywhere, and one very small shoe.'); await say('kessE', 'sad', '"They went off the road here. Dragged, not driven. Wheels don\'t lie."'); }
    if (i === 1) { await narr('Scratched into the bark of a birch, at a child\'s height: a pair of spectacles. One lens cracked.'); await say('kessE', 'sad', '"Good girl. Good girl. You remembered."'); }
    if (i === 2) { await narr('Rope fibres on a thorn bush. Tarred hemp, the kind boatmen use, knotted twice back on itself.'); await say('kessE', 'anger', '"His rope. Same tar. Same knot. Twelve years and he still ties it the same."'); await me('neutral', '"You know him."'); await say('kessE', 'neutral', '"…Later."'); }
    if (f.kaSign.length >= 3) {
      f.ka = 'camp'; sfx('level');
      await say('kessE', 'neutral', '"South. The old ford — there\'s a hollow there where you can\'t see a fire from the road. That\'s where I\'d go if I were a coward with a cage."');
      Story.quest('The trail leads south to a hidden camp by the old ford (south-west of the West Woods). Edda and the children are there.');
      if (G.S.map === 'woods_w' && !World.ent('corvin')) { const [x, y] = freeNear('woods_w', 16, 31); await World.addNpc({ id: 'corvin', sprite: 'rebel2', x, y, dir: 'up', name: 'Corvin', talk: () => KA.camp(), qm: () => '!' }); }
    } else toast(`<b style="color:#c99bff">Trail</b> ${f.kaSign.length}/3`, 1600);
  },
  async camp() {
    const f = AF(); if (f.ka !== 'camp') return;
    await narr('A camp in the hollow by the old ford. A cage-cart, a low fire, three men. Edda sits tied to the wheel with her chin up. Two small shapes huddle in the cage, eyes glowing in the dark.');
    await say('kessE', 'neutral', '"Plan. You walk in the front and make noise. I go round the back and open the cage. Whatever happens, keep them looking at you."');
    const c0 = await ask('me', 'neutral', '…', ['"Noise. I can do noise."', '"And Bertrand?"']);
    if (c0 === 1) await say('kessE', 'anger', '"Bertrand is mine."');
    await narr('Kess is gone before you can answer. You step into the firelight.');
    await narr('A man in a red coat gets up from the fire. Goggles pushed up on his forehead. An iron collar stamped with the Registry eye around his throat. His eyes are green.');
    await say('corvin', 'knowing', '"Well. Another one. Walking in on your own feet — that saves me rope."');
    await me('shock', '"…You\'re a Drag."');
    await say('corvin', 'calm', '"I\'m a LICENSED Drag. See the collar? The Crown lets me keep my eyes as long as I bring them other people\'s. Good arrangement. I eat every day."');
    const c1 = await ask('me', 'anger', '…', ['"You sell your own."', '"Take the collar off."']);
    if (c1 === 0) await say('corvin', 'glare', '"I sell what the Crown buys. Same as the miller. Same as you will, one day, when you get hungry enough."');
    else await say('corvin', 'sad', '"…Take it off and I\'m just another pair of eyes for the pyre. Don\'t be stupid."');
    let r = await Battle.start({ enemies: ['corvin_e', 'catcher', 'catcher'], allies: [], noFlee: true, bd: 'forest', intro: 'Corvin the Collared — and you\'re alone. Keep them looking at you.' });
    if (r === 'lose') { await Story.defeat(); return; }
    await narr('Corvin goes down on one knee, laughing through a split lip.');
    await say('corvin', 'hurt', '"Fine. FINE. You win. Bertrand pays me by the head, not by the bruise."');
    await narr('Behind the cart, the cage door swings open without a sound. Two children and an old tinker slip into the reeds.');
    const c2 = await ask('me', 'neutral', '(Corvin is getting up. He won\'t fight again tonight.)', ['(Let him run.)', '"Tell the Registry a Drag beat you."']);
    if (c2 === 1) await say('corvin', 'happy', '"Ha. You\'re going to be famous, hooded one. Famous Drags don\'t get old."');
    else await say('corvin', 'knowing', '"…Soft. That\'ll get you killed. Thanks anyway."');
    f.corvinMet = 1; World.remove('corvin');
    await narr('Corvin is gone into the dark. Then a rope hisses out of the reeds, loops around Kess\'s ankle, and she hits the ground hard.');
    await say('bertrand', 'greed', '"Glasses. Little Cinderfall glasses. Oh, I know those."');
    await say('bertrand', 'happy', '"Twelve years. I sold the woman who wore those. Good price, too."');
    await say('kessE', 'anger', '"You don\'t get to talk about her."');
    let ropeN = 0;
    r = await Battle.start({ enemies: ['bertrand', 'catcher'], noFlee: true, boss: true, bd: 'forest', music: 'boss', intro: 'Old Bertrand, the Catcher — forty years of rope',
      onTurn: async (B, Bt) => { const b = B.actors.find(a => a.key === 'bertrand'); if (!b || b.ko || B.cur !== b) return;
        if (++ropeN % 3) return;
        const P = B.actors.filter(a => a.side === 'p' && !a.ko); const t = P.find(a => a.id === 'kess') || pick(P); if (!t) return;
        t.broken = 1; Bt.text(t, 'ROPED!', '#d8b47a', -60, true); sfx('break');
        await Bt.msg(`Bertrand's rope snaps around ${t.isMe ? 'you' : t.name}! (they lose their next turn)`, 1600); } });
    if (r === 'lose') { await Story.defeat(); f.ka = 'camp'; return; }
    await narr('Kess has her knife at his throat before he stops sliding.');
    await say('kessE', 'anger', '"Say her name."');
    await say('bertrand', 'neutral', '"…Whose?"');
    await say('bertrand', 'sad', '"Girl, I\'ve sold four hundred of you. I don\'t remember names. I don\'t remember faces. Only the glasses. I remember the glasses because I couldn\'t sell them."');
    await narr('Kess\'s knife hand is shaking. She looks at you.');
    const c3 = await ask('me', 'sad', '…', ['"Kess. Look at me. Don\'t."', '"It\'s your call. Not mine."', '"He\'s earned it."']);
    if (c3 === 2) {
      f.kessKilled = 1; Opinion.add('fear', 1);
      await narr('Kess looks at you for a long moment. Then back at him.');
      await narr('It\'s quick. She doesn\'t look away.');
      await say('kessE', 'sad', '"…That didn\'t feel like anything. I thought it would feel like something."');
    } else {
      f.kessSpared = 1; if (c3 === 1) f.kessChose = 1; Opinion.add('hope', .5);
      if (c3 === 0) await say('kessE', 'anger', '"Don\'t tell me what to—" She stops. Breathes.');
      else await say('kessE', 'shock', '"…Nobody\'s ever let me decide anything about her before."');
      await narr('She cuts the rope from his belt instead — forty years of it — and throws it on the fire.');
      await say('kessE', 'neutral', '"Live a long time, Bertrand. Live long enough to see us stop hiding."');
    }
    // dawn by the river
    await fadeOut(800); G.S.clock = 6 * 60; await fadeIn(800);
    await narr('Dawn on the river. Edda is already loading the children into a reed-boat with a ferryman Kess trusts.');
    await say('edda', null, '"Glass girl. You came yourself this time." She pats Kess\'s cheek. "And you brought the loud one."');
    if (F().sqBelfry) await narr('One of the children is the girl from the Millbrook bell tower. She waves at you with her whole arm until the boat is around the bend.');
    await say('kessE', 'neutral', '"You asked if I knew him. Sit down."');
    await say('kessE', 'sad', '"I\'m from Cinderfall. When I was seven, the Inquisition came down our street with lanterns. Mama put me in the cellar, behind the coal door — painted black, one little glass window. She said: don\'t open it. Not for anyone. Not even for me."');
    await say('kessE', 'sad', '"Verity\'s people knocked on every door on our street. Ours didn\'t open. So they burned the street. To be sure."');
    await say('kessE', 'sad', '"I heard Bertrand drag her out before the fire reached the cellar. I heard him say \'good price\'. Then I climbed out the coal chute and walked to Ashford in her spectacles. Maren found me asleep on the clinic steps."');
    await say('kessE', 'shame', '"Twelve years I\'ve told myself I was a good girl. I did what she said. But a whole street burned because one door stayed shut. Mine."');
    const c4 = await ask('me', 'sad', '…', ['"You were seven. She was saving you."', '"Then stop keeping it shut."', '(Say nothing. Sit with her.)']);
    if (c4 === 0) await say('kessE', 'sad', '"…I know. Knowing doesn\'t help as much as people think it does."');
    else if (c4 === 1) { await say('kessE', 'shock', '"…"'); await say('kessE', 'happy', '"You really are an idiot. …Maybe."'); }
    else await narr('You sit with her until the sun is all the way up. Neither of you says anything. It\'s the best conversation you\'ve had in weeks.');
    await say('kessE', 'neutral', '"The Glass Road\'s finished — too many people know about it now. But…" She touches the rim of her spectacles. "Maybe there\'s a road where nobody needs glasses. You keep talking like there is."');
    f.ka = 'done'; Story.gainXp(140); G.S.gold += 40; Story.heal(true);
    try { if (typeof Bonds !== 'undefined' && Bonds.gain) Bonds.gain('kess', f.kessChose ? 60 : 40); } catch (e) { }
    toast(`<b style="color:#c99bff">Kess</b> trusts you more. ${f.kessChose ? '(She chose for herself — and she knows you let her.)' : ''}`, 3800);
    Intel.add('you', 'Kess ran the Glass Road — 31 Drag children smuggled out of the vale in twelve years. She is from Cinderfall; Bertrand the Catcher sold her mother. A licensed Drag called Corvin works for the Registry.');
    Story.quest('Back to Ashford. The Seal is in your pocket, and the mill is waiting.');
  }
};
(function () {
  const W = SCENES.woods_w; if (!W) return;
  KA_SIGNS.forEach(([x, y], i) => { const prev = W.tiles[x + ',' + y]; W.tiles[x + ',' + y] = async () => { if (AF().ka === 'woods' && !(AF().kaSign || []).includes(i)) return KA.sign(i); if (prev) return prev(); }; });
  const _n = W.npcs; W.npcs = function () { const L = _n.call(this) || []; if (AF().ka === 'camp') { const [x, y] = freeNear('woods_w', 16, 31); L.push({ id: 'corvin', sprite: 'rebel2', x, y, dir: 'up', name: 'Corvin', talk: () => KA.camp(), qm: () => '!' }); } return L; };
  // the trail marks
  const _r = World.render.bind(World);
  World.render = function (c, t) { const out = _r(c, t);
    try { const f = G.S && G.S.f; if (f && f.ka === 'woods' && G.S.map === 'woods_w' && G.mode === 'world') { const cx = Math.round(World.cam.x), cy = Math.round(World.cam.y);
      KA_SIGNS.forEach(([x, y], i) => { if ((f.kaSign || []).includes(i)) return; const px = x * TILE + 16 - cx, py = y * TILE - 10 - cy + Math.sin(t / 240 + i) * 3;
        c.save(); c.font = '800 18px Nunito'; c.textAlign = 'center'; c.lineWidth = 3.5; c.strokeStyle = '#140a1c'; c.strokeText('?', px, py); c.fillStyle = '#c99bff'; c.fillText('?', px, py); c.restore(); }); } } catch (e) { }
    return out; };
})();
