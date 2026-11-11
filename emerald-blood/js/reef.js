/* ================= THE DROWNED HOLLOW =================
   Under the North Woods' wolf den, a cave drops into a sunken reef-temple that should not exist this far from the sea.
   Its monsters are B-rank, and at the temple door sleeps an A-rank: Thalassar, the Drowned Wyrm.
   The entrance warns you first — this place is far above where Ren should be. */
(function () {
  const MHx = typeof MH === 'function' ? MH : (anim, m, w, unp) => ({ anim, m, w, unp });
  Object.assign(ENEMY, {
    reef_stalker: { name: 'Reefscale Stalker', img: 'm_lizard', hp: 190, atk: 21, def: 7, spd: 14, dodge: .22, parry: .2, brk: 90, xp: 95, gold: 48, trait: 'water — strikes from the coral in triple thrusts',
      skills: [{ name: 'Coral Spear', hits: [MHx('thrust', 1, 520), MHx('thrust', .8, 300), MHx('thrust', 1, 300)] }, { name: 'Undertow Lunge', w: .3, hits: [MHx('thrust', 1.7, 760, 1)] }] },
    reef_drake: { name: 'Abyssal Drake', img: 'm_drake', size: 1.2, hp: 230, atk: 23, def: 8, spd: 12, dodge: .12, parry: .08, brk: 110, xp: 120, gold: 60, trait: 'water — its breath is a crushing wave that hits the whole party',
      skills: [{ name: 'Tide Bite', hits: [MHx('slash', 1.3, 600)] }, { name: 'Crushing Wave', w: .3, hits: [MHx('spellcast', 1.4, 900)] }] },
    reef_wraith: { name: 'Drowned Pale', img: 'm_vampire', spectral: '#7fe8ff', hp: 200, atk: 22, def: 6, spd: 16, dodge: .3, parry: .15, brk: 85, xp: 110, gold: 55, hunger: 1, trait: 'A drowned Inquisitor. Drinks mana — Drag Arts HEAL it',
      skills: [{ name: 'Brine Claw', hits: [MHx('slash', 1, 480), MHx('slash', 1, 300)] }, { name: 'Last Breath', w: .25, hits: [MHx('spellcast', 1.9, 1000, 1)] }] },
    reef_wyrm: { name: 'Thalassar, the Drowned Wyrm', img: 'm_cavewyrm', boss: 1, size: 2, spectral: '#5ff0ff', hp: 900, atk: 30, def: 11, spd: 13, dodge: .1, parry: .2, brk: 240, xp: 600, gold: 500, regen: .03, hunger: 1,
      howl: 1, howlName: 'THE DEEP ANSWERS', howlKey: 'reef_stalker', howlText: 'CLIMBS OUT OF THE CORAL',
      trait: 'A-RANK. Regenerates, drinks Drag mana, and calls the reef to its side. Every one of its scales is a chain-link.',
      skills: [{ name: 'Abyss Rend', hits: [MHx('slash', 1.3, 560), MHx('halfslash', 1.1, 340)] }, { name: 'Pressure Wave', w: .3, hits: [MHx('spellcast', 1.9, 920)] },
        { name: 'Drowning Coil', w: .2, hits: [MHx('thrust', .8, 420), MHx('thrust', .8, 260), MHx('thrust', .8, 260), MHx('jump', 2.2, 1100, 1)] }] }
  });
  Object.assign(TIER, { reef_stalker: 'B', reef_drake: 'B', reef_wraith: 'B', reef_wyrm: 'A' });
  if (typeof SKILL_EL !== 'undefined') Object.assign(SKILL_EL, { 'Coral Spear': 'water', 'Undertow Lunge': 'water', 'Crushing Wave': 'water', 'Pressure Wave': 'water', 'Drowning Coil': 'water' });

  SCENES.reef = {
    map: 'reef', title: 'The Drowned Hollow', subtitle: 'DANGER — B-rank monsters · an A-rank sleeps here', music: 'woods', bd: 'crystal', encRate: .1, tint: 'rgba(0,40,70,.12)',
    encounters() { const L = [['reef_stalker'], ['reef_stalker', 'reef_stalker'], ['reef_drake'], ['reef_wraith'], ['reef_stalker', 'reef_wraith']]; return { enemies: L[Math.floor(Math.random() * L.length)], bd: 'crystal', noElite: 1 }; },
    exits: [
      { x: 22, x2: 25, y: 58, to: 'woods_n', tx: 7, ty: 23, dir: 'down', label: 'North Woods' },
      { x: 5, x2: 6, y: 2, msg: 'An iron gate, rusted shut. On the far side, the sound of the sea — real waves, miles from any coast.' }
    ],
    tiles: {},
    npcs() {
      const f = G.S.f; if (f.reefWyrm) return [];
      return [{ id: 'reef_wyrm', sprite: 'm_cavewyrm', x: 23, y: 30, dir: 'down', size: 1.6, name: 'Thalassar', qm: () => '!', talk: fightWyrm }];
    },
    async onEnter() { if (!G.S.f.reefSeen) { G.S.f.reefSeen = 1; await narr('You climb down through the den — and the air turns to water you can breathe. Coral. Old stone. Green lights pulsing like slow hearts.'); await narr('Somewhere ahead, something enormous is breathing in its sleep.'); } }
  };
  const T = SCENES.reef.tiles;
  for (const [x, y] of [[6, 10], [23, 10], [32, 10], [12, 17], [22, 43], [18, 48]]) for (const dy of [0, 1]) T[x + ',' + (y + dy)] = async () => { Story.heal(true); await narr('A glowing tide-stone. Its light washes over you, cold and clean. Your wounds close.'); };
  T['23,26'] = T['24,26'] = () => narr('The temple door. Carvings of seven figures with green-glass eyes — and a dragon behind them, wings spread. The same as the stone in the South Woods.');

  async function fightWyrm() {
    const f = G.S.f, p = Power.now();
    await narr('Thalassar uncoils. Each scale is a link of old chain, and its eyes are the same green as yours.');
    if (p.i < 4) {
      const c = await ask(null, null, `This is an A-RANK monster. You are ${p.grade}-grade. You will very likely lose.`, ['Fight it anyway.', 'Back away slowly.']);
      if (c === 1) { await narr('You back away. One huge eye follows you, then closes.'); return; }
    }
    await say(null, null, 'A voice like the deep sea, inside your skull: "Little Drag. They chained me here to guard what you are looking for. Show me you are worth the key."');
    const r = await Battle.start({ enemies: ['reef_wyrm'], noFlee: true, boss: true, bd: 'crystal', music: 'boss', intro: 'A-RANK — THALASSAR, THE DROWNED WYRM' });
    if (r !== 'win') { Story.heal(true); await narr('You wake at the bottom of the den, coughing up seawater. Somehow, you are alive. It let you go.'); { const b = typeof FCL !== 'undefined' ? FCL.fc_north.npc.reefback : [7, 23]; await World.go('woods_n', b[0], b[1], 'down'); } return; }
    f.reefWyrm = 1; World.remove('reef_wyrm');
    await narr('The wyrm sinks into the coral. Its chains go slack — and one link, larger than the rest, rolls to your feet. It is warm, and it hums.');
    await say(null, null, '"…Free. After so long. Take the link, little Drag. When the Seven come home, you will need it."');
    G.S.f.reefLink = 1; toast('<b style="color:#5ff0ff">The Drowned Link</b> — a key-link from an old chain. It hums near Drag stones.', 4200); sfx('level');
  }

  /* the den is the way in — with a warning first */
  const N = SCENES.woods_n && SCENES.woods_n.tiles;
  const enter = async () => {
    const p = Power.now();
    await narr('Under the rocks, the den goes down further than any wolf could dig. Cold, wet air rises from below. It smells of salt.');
    const c = await ask(null, null, `⚠ WARNING — The Drowned Hollow. Monsters below are B-rank, and an A-RANK beast sleeps at its heart. You are ${p.grade}-grade. Go down?`, ['Go down.', 'Not yet.']);
    if (c !== 0) { await narr('You step back from the edge. Something below shifts in its sleep.'); return; }
    await fadeOut(600); await World.load('reef', 23, 56, 'up'); await fadeIn(700);
  };
  if (N) for (const k of Object.keys(N)) if (/den under the rocks/i.test(String(N[k]))) N[k] = enter;
  if (N && typeof FCL === 'undefined') { const ks = []; for (let y = 16; y <= 23; y++) for (let x = 1; x <= 9; x++) { const cx = 5.2, cy = 19.8; if (((x + .5 - cx) / 4.2) ** 2 + ((y + .5 - cy) / 3.4) ** 2 <= 1) ks.push(x + ',' + y); } for (const k of ks) N[k] = enter; }
  if (typeof GATHER_SPOTS !== 'undefined') GATHER_SPOTS.reef = [[14, 39], [32, 27], [36, 25]];
})();
