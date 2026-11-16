'use strict';
/* =====================================================================================
   CHAPTER I, SHONEN PASS  (Chat A)
   · COLD OPEN — a flash-forward before the legend: rain, fire, Ren with a price on his head, Kairo across the roof.
   · NEXT TIME — every arc opens with an episode teaser line.
   · THE STINGER — after Emerald Dawn: Greyspire, Dread on a balcony, a girl with half a green ribbon.
   · THE REALM, FIVE PLAYABLE YEARS (hooks called from vaneYears in story.js):
       Year 1 SURVIVE      the month alone at the stones — Tomb Breath nights, hunting, the first meeting with TORN-EAR
       Year 2 THE STICK    leaf drill (parry) and snowball drill (dodge) — and Torn-Ear again (the wolf-mother's cub)
       Year 3 THE RIVAL    the third fight with Torn-Ear — beat him, and choose
       Year 4 VISITORS     Isolde Varenne climbs the mountain (spar her for her spear-ribbon), the Silent Knives follow her
              THE BLACK STONES  the egg pulls you north past the one line Vane forbade — and Vane draws his sword. All of it.
       Between the years: MEANWHILE — Kairo, growing up the other way.
   ===================================================================================== */
Object.assign(CHAR, { isolde: CHAR.isolde || { name: 'Isolde', sprite: 'folk7' }, dread_v: CHAR.dread_v || { name: 'Dread', sprite: 'guard' } });
Object.assign(ENEMY, {
  rx_tornear: Object.assign({}, ENEMY.rime_lupine, { name: 'Torn-Ear', trait: 'A young lupine with a torn ear. It keeps coming back — and it keeps getting stronger.', hp: 60, atk: 11, spd: 14, brk: 50, xp: 30, gold: 0, pers: 'hunter' }),
  rx_knife: Object.assign({}, ENEMY.cleaner, { name: 'Silent Knife', trait: 'Crown assassins. They followed someone up the mountain.', hp: 60, atk: 11, def: 3, spd: 13, xp: 30, gold: 12, pers: 'hunter' })
});

const RX = {
  card(t, sub) { banner(t, sub, 2600); return wait(2200); },
  // ---------- a timing drill: leaves (tap when the leaf is in the ring) or snowballs (tap the side AWAY from the throw) ----------
  drill(mode, rounds, need) {
    Dlg.close();
    return new Promise(res => {
      const ov = document.createElement('div'); ov.className = 'ov'; ov.style.cssText += ';background:rgba(4,10,16,.86);z-index:45;flex-direction:column;gap:8px;touch-action:none';
      const title = mode === 'leaf' ? 'LEAF DRILL — PARRY' : mode === 'spear' ? 'ISOLDE\'S SPEAR' : 'SNOWBALL DRILL — DODGE';
      const help = mode === 'snow' ? 'Snowballs come from the LEFT or RIGHT. Tap the OTHER side of the screen just before it hits.' : mode === 'spear' ? 'Her spear comes straight at you. Tap the moment the tip reaches the ring.' : 'Tap the moment a leaf falls inside the ring.';
      ov.innerHTML = `<div style="font-family:'Press Start 2P';color:#cfe8ff;font-size:12px">${title}</div><canvas width="420" height="260" style="width:min(92vw,560px);height:auto;max-height:58vh"></canvas>
        <div style="font-size:14px;text-align:center;max-width:460px">${help}</div><div id="drSc" style="color:#46ff95;font-weight:800">0 / ${rounds}</div>`;
      document.body.appendChild(ov);
      const cv = ov.querySelector('canvas'), c = cv.getContext('2d'), W = 420, H = 260, cx = W / 2, cy = H * .55;
      let n = 0, hit = 0, cur = null, done = false, msg = '', msgT = 0;
      const spawn = () => { const sp = .9 + n * .09; cur = mode === 'snow' ? { side: Math.random() < .5 ? -1 : 1, t0: performance.now(), dur: 1100 / sp } : { x: cx + (Math.random() - .5) * 40, t0: performance.now(), dur: 1300 / sp }; };
      const finish = () => { done = true; setTimeout(() => { ov.remove(); res(hit >= need ? hit : -hit - 1); }, 700); };
      const judge = ok => { if (ok) { hit++; sfx('parry'); msg = mode === 'snow' ? 'DODGED' : 'CAUGHT'; } else { sfx('hurt'); msg = mode === 'snow' ? 'HIT!' : 'MISSED'; } msgT = performance.now(); n++; ov.querySelector('#drSc').textContent = `${hit} / ${rounds}`; cur = null; if (n >= rounds) finish(); else setTimeout(spawn, 380); };
      ov.addEventListener('pointerdown', e => { if (done || !cur) return; const k = (performance.now() - cur.t0) / cur.dur;
        if (mode === 'snow') { const r = cv.getBoundingClientRect(), tapSide = e.clientX < r.left + r.width / 2 ? -1 : 1; judge(k > .62 && k < .94 && tapSide === -cur.side); }
        else judge(k > .74 && k < .9); });
      const draw = () => { if (!ov.isConnected) return; const now = performance.now(); c.clearRect(0, 0, W, H);
        c.fillStyle = '#0d1a24'; c.fillRect(0, 0, W, H); c.fillStyle = 'rgba(220,235,255,.08)'; for (let i = 0; i < 40; i++) c.fillRect((i * 97 + now * .02) % W, (i * 53 + now * .05) % H, 2, 2);
        // the kid
        c.fillStyle = '#46ff95'; c.beginPath(); c.arc(cx, cy + 26, 12, 0, 7); c.fill(); c.fillStyle = '#081018'; c.font = '900 11px Nunito'; c.textAlign = 'center'; c.fillText('R', cx, cy + 30);
        if (mode !== 'snow') { c.strokeStyle = '#ffd36a'; c.lineWidth = 3; c.beginPath(); c.arc(cx, cy - 26, 20, 0, 7); c.stroke(); }
        if (cur) { const k = (now - cur.t0) / cur.dur;
          if (k > 1.05) judge(false);
          else if (mode === 'leaf') { const y = -10 + k * (cy - 26 + 10) / .82, x = cur.x + Math.sin(k * 9) * 14 * (1 - k); c.fillStyle = '#d9822b'; c.beginPath(); c.ellipse(x, y, 9, 5, k * 6, 0, 7); c.fill(); }
          else if (mode === 'spear') { const y = -40 + k * (cy - 26 + 40) / .82; c.strokeStyle = '#c9b48a'; c.lineWidth = 4; c.beginPath(); c.moveTo(cx, y - 80); c.lineTo(cx, y); c.stroke(); c.fillStyle = '#e8eef5'; c.beginPath(); c.moveTo(cx - 7, y - 6); c.lineTo(cx + 7, y - 6); c.lineTo(cx, y + 10); c.fill(); }
          else { const x = cx + cur.side * (W / 2 + 10) * (1 - k), y = cy + 20 - Math.sin(k * 3.14) * 40; c.fillStyle = '#f2f7ff'; c.beginPath(); c.arc(x, y, 9, 0, 7); c.fill();
            c.fillStyle = 'rgba(255,90,70,.6)'; c.font = '900 22px Nunito'; c.fillText(cur.side < 0 ? '◀' : '▶', cur.side < 0 ? 30 : W - 30, H - 18); } }
        if (msg && now - msgT < 600) { c.fillStyle = /HIT|MISS/.test(msg) ? '#ff8a6a' : '#46ff95'; c.font = '900 18px Nunito'; c.textAlign = 'center'; c.fillText(msg, cx, 34); }
        requestAnimationFrame(draw); };
      setTimeout(spawn, 700); requestAnimationFrame(draw);
    });
  },
  // ---------- the rival: Torn-Ear ----------
  async rival(n) {
    const f = F(), E = ENEMY.rx_tornear, base = { hp: 60, atk: 11, spd: 14 };
    E.hp = base.hp + n * 22; E.atk = base.atk + n * 2; E.spd = base.spd + n;
    const intro = ['Something has been following your tracks all week. It finally steps out: a young lupine, barely grown, one ear torn half away.', 'Torn-Ear again. Bigger. It circles you with its head low, and this time it doesn\'t hesitate.', 'Torn-Ear. Full-grown now, nearly your height at the shoulder. It has waited all winter for this.'][n];
    await narr(intro);
    if (n === 1 && f.wolfSpared) await me('shock', '(…That ear. That grey coat. It\'s one of HER cubs — the mother I let go.)');
    const r = await Battle.start({ enemies: ['rx_tornear'], noFlee: true, bd: 'snow', music: 'battle', intro: ['A lupine with a torn ear', 'Torn-Ear — the second hunt', 'TORN-EAR — the third hunt'][n],
      onTurn: async (B, Bt) => { const e = B.actors.find(a => a.key === 'rx_tornear'), me = Bt.me(); if (!e || !me) return;
        if (n === 0 && (B.turn >= 6 || me.hp < me.maxHp * .3)) { await Bt.msg('Torn-Ear knocks you flat, sniffs your face — and trots away. Like it was only checking.', 1800); return 'scripted'; }
        if (n === 1 && (e.hp < e.maxHp * .35 || me.hp < me.maxHp * .3)) { await Bt.msg(e.hp < e.maxHp * .35 ? 'Torn-Ear backs off, bleeding — and grinning, if wolves grin.' : 'Torn-Ear pins you, then lets go. Not yet, it seems to say.', 1800); return 'scripted'; }
        if (n === 2 && e.hp < e.maxHp * .2) { await Bt.msg('Torn-Ear goes down in the snow and doesn\'t get up.', 1500); return 'win'; }
        if (n === 2 && me.hp < me.maxHp * .18) { await Bt.msg('A blade of wind cuts the snow between you. Vane. Torn-Ear bolts.', 1600); return 'lose'; } } });
    Story.heal(true);
    if (n === 2) {
      if (r === 'win') { const c = await ask('me', 'neutral', '(Torn-Ear lies in the snow, chest heaving, watching you.)', ['(Finish it.)', '(Sheathe your stick and walk away.)', '(Sit down next to it.)']);
        if (c === 0) { await narr('You raise the stick. Torn-Ear doesn\'t look away. …You can\'t. You lower it. It limps off into the white and you never see it again.'); f.tornEar = 'gone'; }
        else if (c === 1) { await narr('You walk away. Behind you, after a long time, a single howl. It doesn\'t sound angry.'); f.tornEar = 'respect'; f.resolve++; }
        else { await narr('You sit in the snow beside it until your legs go numb. When you finally stand, it stands too — and follows you home at a distance. It will do that for years.'); f.tornEar = 'friend'; f.resolve += 2; }
        await say('vane', 'neutral', 'Three winters that wolf hunted you. It taught you more than I did this year. Hm. Don\'t tell it I said so.'); }
      else { f.tornEar = 'rival'; await say('vane', 'neutral', 'It\'ll be back. They always come back. So will you.'); }
    }
  },
  // ---------- MEANWHILE: Kairo ----------
  async kairo(n) {
    await fadeOut(500); await this.card('MEANWHILE', ['The mountains — Kairo, age eleven', 'A cave above the south road — Kairo, age twelve', 'An Inquisition waystation — Kairo, age thirteen', 'A ridge in the dark', 'A burning toll-house — Kairo, age fifteen'][n]);
    const K = 'kairo';
    if (n === 0) { await narr('Night. A cage wagon on its side in the mud. A boy with half his face wrapped in a burned shirt drags the door open with one arm.');
      await narr('Inside: a girl of five, shaking. Tamsin.'); await say(K, 'neutral', 'Hey. Hey. It\'s okay. I\'m a Drag too. See?');
      await narr('His arm flares black and green as he pulls her out — scales, then skin — and he bites down on a scream so she won\'t hear it.');
      await say('tamsin', 'shock', 'Your arm…'); await say(K, 'happy', 'It\'s fine. It\'s always fine.');
      await narr('He tears a strip off his sleeve and ties a terrible knot around her wrist.'); await say(K, 'neutral', 'There. So you can always find us.'); }
    if (n === 1) { await narr('A cave. Six children asleep in a pile. Kairo, awake, scratching a mark into the rock wall with a nail.');
      await narr('REN: 0. KAIRO: 1.'); await say(K, 'neutral', '…He\'s not dead. He\'d never let me win by dying.');
      await say('tamsin', 'neutral', 'Kairo. The others want a name. For us.'); await say(K, 'neutral', 'Name?');
      await narr('A small boy, Lark, half-asleep: "Eclipse. Like when the sun goes dark and everybody\'s scared."');
      await say(K, 'happy', 'Green Eclipse.'); await say(K, 'neutral', '…Good. Let them be scared for once.'); }
    if (n === 2) { await narr('Rain on a burning waystation. An Inquisitor on his knees in the mud, begging. Kairo stands over him, thirteen years old, arm smoking to the shoulder.');
      await narr('A big grey man steps out of the dark, hands open. A smith\'s hands. Corran.');
      await say('corran', 'neutral', 'My grandmother had a word for an arm like that.'); await say(K, 'anger', 'What word?');
      await say('corran', 'sad', '…"Gatekeeper." I always thought it was a nice word. It isn\'t.');
      await narr('Kairo looks at the Inquisitor for a long time. Then he walks away. He leaves the man alive. It is the last time he ever does.'); }
    if (n === 3) { await narr('The Green Eclipse camp below, fires low. On the ridge above it, a shape in black armor that the snow doesn\'t seem to touch.');
      await narr('Something green flickers behind the visor. He is watching one tent. Kairo\'s.'); await say('dread_v', null, '…Not yet.');
      await narr('By morning there are no tracks. Only a ring of snow, melted in a perfect circle.'); }
    if (n === 4) { await narr('A toll-house that sold Drag children, burning. Forty children freed. And upstairs, a family nobody knew was sleeping there.');
      await narr('Kairo carries them out himself. Two of them don\'t wake up.');
      await narr('Later, alone on the hill above the smoke, fifteen years old, ash up to his collarbone.');
      await say(K, 'sad', 'Ren… if you were here, you\'d tell me to stop.'); await say(K, 'sad', '…Good thing you\'re not.'); }
    await fadeOut(400); await fadeIn(600);
  },
  // ---------- YEAR 1: SURVIVE ----------
  async y1() {
    const f = F();
    await say('vane', 'neutral', 'You want the sword? Earn the right to stay alive first. One month. Alone. At the stones. If you\'re breathing when I come back, we\'ll talk.');
    await narr('Night one. The blizzard comes down like a wall. The mana sickness bites — every breath is glass.');
    await breathe(4);
    await narr('Night nine. Your food is gone. Something moves at the edge of the stones. Food — or the thing that eats you.');
    await Battle.start({ enemies: ['rime_lupine'], noFlee: true, bd: 'snow', music: 'battle', intro: 'Night nine — hunt or be hunted' }); Story.heal(true);
    await narr('Night twenty. You stop counting the days. You start counting breaths.');
    await breathe(5);
    await this.rival(0);
    await narr('Night thirty. Footsteps in the snow. The old man, with a sack of boiled roots, looking like he lost a bet.');
    await say('vane', 'neutral', 'Still breathing. Hm. Most of them run back to the hut by night three.'); await say('vane', 'happy', 'Tomorrow you get a stick.');
    f.rxY1 = 1; await this.kairo(0);
  },
  // ---------- YEAR 2: THE STICK ----------
  async y2() {
    const f = F();
    await say('vane', 'neutral', 'A parry is catching something that wants to hit you. Start small. Leaves. The wind throws them. You catch them on the stick. Not with your hand. The STICK.');
    let a = await this.drill('leaf', 10, 7);
    if (a < 0) { await say('vane', 'neutral', 'Again.'); a = await this.drill('leaf', 10, 6); }
    await say('vane', 'happy', 'Now — a dodge is getting out of the way of something you can\'t catch.');
    await narr('He packs a snowball the size of your head. Then another. He has a lot of snow.');
    let b = await this.drill('snow', 10, 7);
    if (b < 0) { await say('vane', 'neutral', 'Again. I have all winter. You have all winter too, it turns out.'); b = await this.drill('snow', 10, 6); }
    const st = G.S.stats; st.def += 1; st.spd += 1; sfx('level'); toast('Year Two training: <b>+1 DEF, +1 SPD</b>. Your parries and dodges were born here.', 3600);
    await this.rival(1);
    f.rxY2 = 1; await this.kairo(1);
  },
  // ---------- YEAR 3: THE RIVAL ----------
  async y3() { const f = F(); await this.rival(2); f.rxY3 = 1; await this.kairo(2); },
  // ---------- YEAR 4: VISITORS ----------
  async y4() {
    const f = F();
    await narr('Nobody visits the Realm of No Return. So when a woman climbs out of the storm with a spear across her shoulders and frost in her braid — laughing, like the mountain told her a joke — you nearly drop your stick.');
    await say('isolde', 'happy', 'Vane! You look terrible. I brought wine. Don\'t tell the Concord.');
    await say('vane', 'neutral', 'Isolde. Go home.');
    await say('isolde', 'neutral', 'Something\'s moving under the Gates, old man. Three jumped rank this year. The Crown won\'t listen to me. They\'d listen to the Sword Saint.');
    await say('vane', 'sad', 'The Sword Saint is dead. Dread killed him. Go home.');
    await say('isolde', 'shock', '…And who is THIS? You took a student. YOU. The man who threw a duke off a balcony for asking.');
    const c = await ask('isolde', 'happy', 'Well, little Drag? Want to see what a spear does to that stick?', ['"Yes."', '"…He said you should go home."']);
    if (c === 1) await say('isolde', 'happy', 'He says that to everyone. Come on.');
    await narr('She tied a strip of gold ribbon to her spear just below the blade. "Take it off my spear and I\'ll owe you a favor." She is still laughing when she attacks.');
    const s = await this.drill('spear', 8, 5);
    if (s >= 0) { f.isoldeRibbon = 1; await narr('On the last thrust you slip inside her guard and your hand closes on the gold ribbon. Isolde stops. Looks at her spear. Looks at you.');
      await say('isolde', 'shock', '…Vane. Where did you FIND this one?'); await say('isolde', 'happy', 'Keep it. When you come down this mountain, come to Greyspire. Show me that ribbon, and I\'ll owe you one favor. Anything the Concord can give.');
      sfx('level'); toast('You took <b style="color:#ffd36a">Isolde\'s gold ribbon</b>. A favor, from someone important.', 4000); }
    else { await narr('She taps you on the head with the butt of her spear three times in a row, gently, like knocking on a door.'); await say('isolde', 'happy', 'Not bad for a pup. Come find me in Greyspire when you can take this ribbon. I\'ll still be waiting.'); }
    await say('isolde', 'sad', 'Think about it, old man. It\'s coming whether you\'re ready or not.'); await narr('She goes back down into the storm. Vane watches the place she disappeared for a long time.');
    // the Silent Knives
    await narr('That night, you wake to the fire guttering. Three shapes in grey at the door of the hut — and Vane is out at the stones.');
    await say(null, null, 'A flat voice: "The woman led us right to it. Find the old man. Kill whatever else is here."');
    await Battle.start({ enemies: ['rx_knife', 'rx_knife'], noFlee: true, bd: 'snow', music: 'boss', intro: 'SILENT KNIVES — your first fight against men',
      onTurn: async (B, Bt) => { const me = Bt.me(); if (me && me.hp < me.maxHp * .2) { await Bt.msg('A cold wind. Both assassins fall — and Vane is standing between them, blade already home.', 1800); return 'win'; } } });
    Story.heal(true);
    await narr('The last one is on his knees in the snow. Young. Not much older than you. Shaking.');
    const k = await ask('me', 'anger', '(Your stick is at his throat.)', ['(End it.)', '"Who sent you?"', '(Let him go.)']);
    if (k === 0) { await narr('Vane\'s hand closes around your wrist. Gently. Completely.'); await say('vane', 'sad', 'Not like that. Never like that. Not while I\'m alive to stop you.'); }
    if (k !== 0) { await say(null, null, 'The assassin, through his teeth: "The Fourth Pillar wants the Saint\'s grave confirmed. That\'s all I know. I swear it."'); await say('vane', 'sad', '…Caspian. Of course.'); }
    if (k === 2) { f.resolve += 2; await narr('You step back. He runs. He doesn\'t look back once.'); await say('vane', 'neutral', 'He\'ll tell them a boy spared him. Some of them will laugh. One of them won\'t. Hm.'); }
    f.rxY4 = 1; await this.kairo(3);
  },
  // ---------- YEAR 4: the black stones ----------
  async stones() {
    const f = F(); if (f.blackStones) return; f.blackStones = 1;
    await narr('The egg gets warmer every night. Then one night it is burning — and it is PULLING. North. Toward the black stones.');
    await narr('You don\'t decide to follow it. Your feet do. Past the stones. Past the line. Past the one rule.');
    await Cine.play([{ bg: 'blizzard', fx: ['blizzard', 'mana'], dur: 3200, cam: [[0, 320, 200, 1.1], [4000, 320, 240, 1.3]], vignette: 'rgba(0,0,0,.75)',
      lines: ['A crack in the snow. Not ice. Not rock. A seam in the world, glowing green-black, breathing.', 'Far below it, something opens an eye the size of a house. It looks at the egg. Then it looks at you.', 'A voice in your bones, older than the mountain: "…little ember. You came home."'] }], { music: 'boss' });
    B_shake();
    await narr('Something reaches up through the seam. Too many fingers. Your legs won\'t move.');
    await narr('Then the snow parts — and the old man is there. For the first time in four years, he draws Last Light ALL THE WAY OUT of its sheath.');
    await Cine.play([{ bg: 'eyes', fx: ['mana'], dur: 1800, vignette: 'rgba(255,255,255,.2)', lines: ['One cut.'] }]);
    sfx('crit'); await narr('The seam closes like a wound sewn shut. The eye is gone. The silence afterwards is so loud it hurts.');
    await narr('Vane is on one knee. His hand is shaking. You have never, ever seen his hand shake.');
    await say('vane', 'anger', 'WHAT did I tell you about the black stones?!');
    await say('vane', 'sad', '…There are things under the world, pup. Now you know why an old man lives in a place nobody can leave.');
    const c = await ask('me', 'shock', '…', ['"What WAS that?"', '"It called me an ember."', '"Teach me that cut."']);
    if (c === 0) await say('vane', 'neutral', 'A doorman. Not even the master of the house. Pray you never meet the master of the house.');
    if (c === 1) await say('vane', 'sad', '…They all call us that. Down there. Don\'t ask me why. I never wanted to know.');
    if (c === 2) await say('vane', 'neutral', 'Ask me again when you\'re strong enough that it won\'t kill you to learn it.');
    await say('vane', 'neutral', 'That egg wanted to go home. Keep it away from the stones. And keep yourself away from them too. Swear it.');
    toast('<b style="color:#9dffc8">Something under the world</b> knows your name now.', 3600);
    await this.kairo(4);
  },
  async y5() { await this.card('YEAR FIVE', 'The Last Lesson'); }
};
function B_shake() { try { const el = document.body; el.animate([{ transform: 'translate(0,0)' }, { transform: 'translate(-8px,4px)' }, { transform: 'translate(7px,-5px)' }, { transform: 'translate(0,0)' }], { duration: 380 }); } catch (e) { } }

(function () {
  // ---------------- COLD OPEN ----------------
  const _leg = CINE.legend;
  CINE.legend = function () {
    const shots = _leg.apply(this, arguments);
    if (G.S && !G.S.f.coldOpen) { G.S.f.coldOpen = 1;
      shots.unshift(
        { bg: 'villageFire', fx: ['embers', 'smoke'], dur: 2600, cam: [[0, 320, 170, 1.25], [5000, 320, 210, 1.05]], vignette: 'rgba(0,0,0,.78)',
          lines: ['Rain that doesn\'t put the fires out.', 'A city burning under a green sky. Bells. Somewhere, people chanting a name like a curse.', 'On a wall, still wet with paste: a wanted poster. WANTED — THE DRAG. ALIVE IS NOT REQUIRED.'] },
        { bg: 'moonRoof', fx: ['smoke'], dur: 2400, cam: [[0, 320, 200, 1.1], [4000, 320, 180, 1.3]], vignette: 'rgba(0,0,0,.7)',
          lines: ['Two young men on a rooftop, facing each other through the rain. One of them has green eyes. So does the other.', '"You could have been their hero, Ren."', '"I still am. They just don\'t know it."', 'They move at the same time.'] }
      );
      shots.push({ bg: 'eyes', fx: ['mana'], dur: 1600, vignette: 'rgba(255,255,255,.25)', title: 'SEVEN YEARS EARLIER', sub: 'Thornvale', titleOut: 1400, lines: [] });
    }
    return shots;
  };

  // ---------------- NEXT TIME (arc teasers) ----------------
  const TEASE = ['', 'Next: a tax paid in stones — and a night in the Registry\'s cellar.', 'Next: the Inquisitor has a name. Halvard.', 'Next: Kess\'s past comes back with a knife.',
    'Next: a boy who prays to the people who hate him.', 'Next: the Old Mill. Halvard. And Kairo.', 'Next: a ferryman\'s ledgers, and the men who clean up after the Registry.', 'Next: the Guild Trial. Not everyone walks out of the Gate.'];
  if (typeof Arcs !== 'undefined') { const _card = Arcs.card.bind(Arcs);
    Arcs.card = async function (i) { const f = G.S.f; f.arcCard = f.arcCard || {};
      if (!f.arcCard[i] && TEASE[i]) { try { banner('NEXT TIME', TEASE[i].replace(/^Next: /, ''), 2400); await wait(2300); } catch (e) { } }
      return _card(i); }; }

  // ---------------- THE STINGER ----------------
  if (typeof Dawn !== 'undefined') { const _run = Dawn.run.bind(Dawn);
    Dawn.run = async function () { await _run(); const f = G.S.f; if (!f.dawnDone || f.stinger) return; f.stinger = 1;
      try { await Cine.play([
        { bg: 'citadel', fx: ['embers'], dur: 2800, cam: [[0, 320, 200, 1.05], [5000, 320, 170, 1.2]], vignette: 'rgba(0,0,0,.75)',
          lines: ['Greyspire. Far above the coach road, a balcony nobody is allowed to stand on.', 'A giant in black armor looks south, toward the Ashen Vale. Behind his visor, something green.'] },
        { bg: 'moonRoof', dur: 2600, vignette: 'rgba(0,0,0,.7)',
          lines: ['Beside him, a girl. Older than you remember. On her wrist: half a green silk ribbon, frayed where it was torn.', '"He\'s coming," says Dread.', '"Good," says the girl.'] },
        { bg: 'eyes', dur: 1600, title: 'END OF CHAPTER I', sub: 'Chapter II — Emerald Dawn', titleOut: 1600, lines: [] }], { music: 'night' }); } catch (e) { }
      save(); };
  }
})();

/* ---------------- the little dragon's disguise: a black cat with very blue eyes ----------------
   Out in the world (towns, roads) the dragon wears a kitten's shape and trots after Ren.
   In a fight — or in the Realm — the disguise drops. Kess's shadow cat Smudge is the only one who isn't fooled. */
RX.catOn = () => !!(G.S && G.S.f.dragonCat && G.mode !== 'battle' && !(SCENES[G.S.map] && SCENES[G.S.map].realm));
RX.catTrick = async function () {
  const f = F(); if (f.dragonCat) return; const n = G.S.dragonName || 'Onyx';
  await say('vane', 'neutral', `One more thing. Out there, a dragon on your shoulder is a death sentence — for you, and for ${n}.`);
  await say('vane', 'neutral', 'Old Drag beasts could wear other shapes. Something small. Something nobody looks at twice. Ask it.');
  await me('neutral', `…${n}? Can you be… smaller? Less dragon?`);
  await say('dragon', 'happy', 'Kyuu?');
  await narr(`${n} squints at you. Then at Old Grey, Vane's hawk. Then at a picture you scratch in the snow. Then it sneezes — and where a dragon was, a small black cat sits in the snow, licking a paw like it had always been one.`);
  await narr('The eyes stay enormous, and very, very blue.');
  await say('vane', 'happy', '…Hm. It picked a cat. Of course it picked a cat. They\'re the only animal ruder than it is.');
  f.dragonCat = 1; sfx('level'); toast(`<b style="color:#8fd0ff">${n}</b> learned to look like a cat. In a fight, the disguise drops.`, 4200);
};
(function () {
  if (typeof FAMS === 'undefined' || !FAMS.me) return;
  const F0 = FAMS.me, c0 = F0.c, sp0 = Object.getOwnPropertyDescriptor(F0, 'species');
  Object.defineProperty(F0, 'shape', { get: () => RX.catOn() ? 'cat' : 'dragon', configurable: true });
  Object.defineProperty(F0, 'c', { get: () => RX.catOn() ? ['#1d1e26', '#0b0c11', '#5fb4ff'] : c0, configurable: true });
  Object.defineProperty(F0, 'species', { get: () => G.S && G.S.f.dragonCat ? 'Baby dragon (passes for a black cat)' : (sp0 && sp0.value) || 'Baby dragon', configurable: true });
  // cache the cat and the dragon separately
  if (typeof famImg === 'function' && typeof FCache !== 'undefined') famImg = function (id, f) { const F = FAMS[id], k = id + (F && F.shape) + (f % 2); return FCache[k] || (FCache[k] = paintFam(F, f)); };
  // the cat follows Ren around the world
  const fol = { x: 0, y: 0, map: null };
  const _r = World.render.bind(World);
  World.render = function (c, t) {
    const out = _r(c, t);
    try { const p = this.player; if (!p || G.mode !== 'world' || !RX.catOn() || G.S.kid || !(typeof Familiars !== 'undefined' && Familiars.has('me')) || G.S.riding) return out;
      const D = { up: [0, 1], down: [0, -1], left: [1, 0], right: [-1, 0] }[p.dir || 'down'] || [0, -1], tx = p.px + D[0] * 26, ty = p.py + D[1] * 18;
      if (fol.map !== G.S.map || Math.hypot(fol.x - tx, fol.y - ty) > 200) { fol.x = tx; fol.y = ty; fol.map = G.S.map; }
      fol.x += (tx - fol.x) * .12; fol.y += (ty - fol.y) * .12;
      const moving = Math.hypot(tx - fol.x, ty - fol.y) > 2, img = famImg('me', moving ? Math.floor(t / 160) : 0), cx = Math.round(this.cam.x), cy = Math.round(this.cam.y), s = 1.5;
      c.save(); c.imageSmoothingEnabled = false; c.fillStyle = 'rgba(0,0,0,.25)'; c.beginPath(); c.ellipse(fol.x - cx, fol.y - cy, 9, 3.5, 0, 0, 7); c.fill();
      if (tx < fol.x - 1) { c.translate(fol.x - cx, 0); c.scale(-1, 1); c.translate(-(fol.x - cx), 0); }
      c.drawImage(img, Math.round(fol.x - cx - 12 * s), Math.round(fol.y - cy - 22 * s), 24 * s, 24 * s); c.restore(); } catch (e) { }
    return out;
  };
})();
