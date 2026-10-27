'use strict';
/* ============================================================================
   RAIDS — monster lords in their lairs. Built for parties, not heroes.
   · The Guild posts a RAID CALL on the 3rd, 10th, 17th and 24th of every month.
   · You recruit a party (tank, striker, ranger, healer, mage…). Not everyone will
     stand next to a Drag — what they know about you, what you've done for them,
     and which face you wear all decide who says yes.
   · Another party raids the same lair at the same time. It's a race.
   · Four LIEUTENANTS guard each lair. Their four seals forge the key to the Lord.
   · The Lord fight is everyone at once — but it's a competition: every blow,
     every hit soaked and every wound healed is CONTRIBUTION. Top contributor is MVP.
   · The unspoken code: highest contribution picks loot first. Even the ones who
     hate Drags honour it. Break it and they'll remember. Honour it and they'll
     remember that too.
   ========================================================================== */
const ROLE = {
  tank: { n: 'Tank', ic: '🛡', hp: 1.35, atk: .72, def: 1.5, spd: .85 },
  striker: { n: 'Striker', ic: '⚔', hp: .95, atk: 1.0, def: .9, spd: 1.05 },
  ranger: { n: 'Ranger', ic: '🏹', hp: .8, atk: .92, def: .7, spd: 1.1 },
  healer: { n: 'Healer', ic: '✚', hp: .85, atk: .55, def: .8, spd: .95 },
  mage: { n: 'Mage', ic: '✦', hp: .75, atk: .95, def: .6, spd: .95 }
};
// open: how they feel about Drags (−3 hate … +3 friend). loyal: Crown-loyal (hates the Red Veil)
const ADV = {
  hilde: { name: 'Hilde Brassjaw', sprite: 'dwarf_f1', role: 'tank', open: 1, color: '#c08a4a', line: 'A dwarf with a door for a shield. Laughs like a rockslide.' },
  torvald: { name: 'Torvald Ironside', sprite: 'guard', role: 'tank', open: -2, loyal: 1, color: '#8a9ab0', line: 'Ex-Crown guard. Polishes his badge every night.' },
  garrick: { name: 'Garrick', sprite: 'garrick_bt', role: 'tank', open: 0, color: '#9a6a3a', line: 'Guild regular. Big, quiet, reliable.' },
  tilda: { name: 'Tilda', sprite: 'tilda_bt', role: 'striker', open: 1, color: '#c05a5a', line: 'Two short swords and no patience.' },
  rurik: { name: 'Rurik Stonefist', sprite: 'dwarf_m1', role: 'striker', open: -1, color: '#7a6a5a', line: 'Hits things. Asks questions later. Doesn\'t ask many.' },
  nix: { name: 'Nix', sprite: 'nix', role: 'striker', open: 2, color: '#6a5aa6', line: 'A grinning knife-artist who idolises the Red Veil.' },
  sylwen: { name: 'Sylwen', sprite: 'sylwen_bt', role: 'ranger', open: 2, color: '#5aa66a', line: 'Elf archer. Has seen enough of the Crown to stop trusting it.' },
  corbin: { name: 'Corbin the Hunter', sprite: 'hunter', role: 'ranger', open: -1, color: '#7a8a4a', line: 'Tracker. Lost a brother to "a green-eyed thing" years ago.' },
  aldous: { name: 'Brother Aldous', sprite: 'acolyte', role: 'healer', open: -3, loyal: 1, color: '#e8e0b0', line: 'Church healer. Prays loudly. Hates Drags louder.' },
  mira: { name: 'Mira Fenn', sprite: 'folk5', role: 'healer', open: 1, color: '#7ac0a0', line: 'Herb-witch from Millbrook. Patches anyone who bleeds.' },
  elara: { name: 'Elara Quill', sprite: 'elf_f1', role: 'mage', open: 0, color: '#8a7ae0', line: 'Scholar-mage. Finds Drag mana "fascinating". Takes notes.' },
  hoshi: { name: 'Hoshi', sprite: 'hoshi', role: 'mage', open: 1, color: '#e07ab0', line: 'Wandering storm-caller. Cheerful. Slightly singed.' },
  aldric: { name: 'Ser Aldric', sprite: 'guard', role: 'tank', open: -2, loyal: 1, color: '#e0c060', line: 'Captain of the Gilded Lances. Always first into a lair. Always.', rival: 1 }
};
Object.assign(CHAR, Object.fromEntries(Object.entries(ADV).map(([k, a]) => ['adv_' + k, { name: a.name, sprite: a.sprite }])));

/* ---------- the lairs ---------- */
const RE = (o) => Object.assign({ hp: 200, atk: 18, def: 7, spd: 11, dodge: .1, parry: .25, brk: 120, xp: 90, gold: 40, boss: 1 }, o);
Object.assign(ENEMY, {
  // Gravemaw Den — the orc warlord
  lt_snaga: RE({ name: 'Snaga Bone-Rider', img: 'm_goblin', size: 1.35, spd: 16, dodge: .3, trait: 'Lieutenant — rides a wolf skull like a crown. Fast.', skills: [{ name: 'Rider\'s Jab', hits: [{ anim: 'thrust', m: 1, w: 480 }] }, { name: 'Bone Javelins', w: .4, hits: [{ anim: 'thrust', m: .7, w: 420, proj: 'spear' }, { anim: 'thrust', m: .7, w: 300, proj: 'spear' }] }, { name: 'Trample', w: .25, hits: [{ anim: 'run', m: 1.7, w: 760, unp: 1 }] }] }),
  lt_hexgrin: RE({ name: 'Mother Hexgrin', img: 'm_goblin_shaman', size: 1.3, atk: 17, trait: 'Lieutenant — goblin witch. Her hexes burn.', skills: [{ name: 'Hex Bolt', hits: [{ anim: 'spellcast', m: 1.1, w: 560 }] }, { name: 'Ember Verdict', w: .4, hits: [{ anim: 'spellcast', m: .8, w: 460 }, { anim: 'spellcast', m: .8, w: 300 }] }, { name: 'Witchfire', w: .25, hits: [{ anim: 'spellcast', m: 2, w: 1000, unp: 1 }] }] }),
  lt_brakk: RE({ name: 'Ironhide Brakk', img: 'm_orc', size: 1.35, def: 11, shield: 3, trait: 'Lieutenant — plate on plate. Break his shields.', skills: [{ name: 'Shield Rush', hits: [{ anim: 'slash', m: 1.2, w: 560 }] }, { name: 'Iron Hammer', w: .4, hits: [{ anim: 'slash', m: .9, w: 480 }, { anim: 'backslash', m: 1.1, w: 380 }] }, { name: 'Quake Stomp', w: .25, hits: [{ anim: 'slash', m: 1.9, w: 900, unp: 1 }] }] }),
  lt_oldtusk: RE({ name: 'Old Tusk', img: 'm_tusker', size: 1.45, hp: 260, atk: 19, spd: 9, trait: 'Lieutenant — the warlord\'s war-boar. Charges through anything.', skills: [{ name: 'Gore', hits: [{ anim: 'slash', m: 1.2, w: 560 }] }, { name: 'Tusk Rake', w: .4, hits: [{ anim: 'slash', m: .8, w: 440 }, { anim: 'halfslash', m: .8, w: 300 }, { anim: 'slash', m: 1, w: 380 }] }, { name: 'Stampede', w: .25, hits: [{ anim: 'run', m: 2, w: 820, unp: 1 }] }] }),
  rb_grukk: RE({ name: 'Grukk Gravemaw, the Orc Warlord', img: 'm_orc', size: 1.8, hp: 900, atk: 22, def: 9, spd: 11, brk: 260, xp: 420, gold: 300, lord: { summon: ['m_goblin', 'm_orc', 'm_goblin_shaman'] }, trait: 'MONSTER LORD — calls his horde every few turns. Enrages when wounded.',
    skills: [{ name: 'Warlord Cleave', hits: [{ anim: 'slash', m: 1.3, w: 600 }] }, { name: 'Skull Volley', w: .35, hits: [{ anim: 'slash', m: .8, w: 460, proj: 'axe' }, { anim: 'slash', m: .8, w: 300, proj: 'axe' }] }, { name: 'Gravemaw', w: .25, hits: [{ anim: 'slash', m: 1, w: 500 }, { anim: 'backslash', m: 1, w: 400 }, { anim: 'slash', m: 2.2, w: 900, unp: 1 }] }] }),
  // The Hollow Throne — the lich-king
  lt_hollowmark: RE({ name: 'Sir Hollowmark, Bone Knight', img: 'm_skeleton', size: 1.4, def: 11, shield: 2, trait: 'Lieutenant — a knight who forgot how to die.', skills: [{ name: 'Grave Thrust', hits: [{ anim: 'thrust', m: 1.1, w: 520 }] }, { name: 'Oathbreaker', w: .4, hits: [{ anim: 'thrust', m: .8, w: 440 }, { anim: 'slash', m: .9, w: 320 }, { anim: 'thrust', m: 1, w: 400 }] }, { name: 'Black Sun Arc', w: .25, hits: [{ anim: 'slash', m: 2, w: 950, unp: 1 }] }] }),
  lt_bride: RE({ name: 'The Weeping Bride', img: 'm_ghoul', size: 1.3, spectral: '#cfe8ff', spd: 15, dodge: .3, trait: 'Lieutenant — her wail freezes the blood.', skills: [{ name: 'Cold Embrace', hits: [{ anim: 'slash', m: 1, w: 480 }] }, { name: 'Frost Claw', w: .4, hits: [{ anim: 'slash', m: .7, w: 400 }, { anim: 'slash', m: .7, w: 260 }, { anim: 'slash', m: .9, w: 340 }] }, { name: 'Widow\'s Wail', w: .25, hits: [{ anim: 'spellcast', m: 1.9, w: 1000, unp: 1 }] }] }),
  lt_ossk: RE({ name: 'Gravewarden Ossk', img: 'm_skeleton', size: 1.55, hp: 260, atk: 20, spd: 8, trait: 'Lieutenant — the crypt\'s jailer. Heavy and patient.', skills: [{ name: 'Gravecleaver', hits: [{ anim: 'slash', m: 1.3, w: 700 }] }, { name: 'Chains of the Deep', w: .4, hits: [{ anim: 'slash', m: .9, w: 500, proj: 'stone' }, { anim: 'slash', m: 1.1, w: 420 }] }, { name: 'Last Rites', w: .25, hits: [{ anim: 'slash', m: 2.2, w: 1000, unp: 1 }] }] }),
  lt_malvric: RE({ name: 'Count Malvric', img: 'm_vampire', size: 1.25, spd: 15, hunger: 1, trait: 'Lieutenant — drinks mana. Drag Arts HEAL him.', skills: [{ name: 'Velvet Fang', hits: [{ anim: 'slash', m: 1.1, w: 480 }] }, { name: 'Blood Rain', w: .4, hits: [{ anim: 'spellcast', m: .8, w: 460 }, { anim: 'spellcast', m: .8, w: 300 }] }, { name: 'Crimson Waltz', w: .25, hits: [{ anim: 'slash', m: .8, w: 400 }, { anim: 'slash', m: .8, w: 260 }, { anim: 'slash', m: 1.6, w: 700, unp: 1 }] }] }),
  rb_vesh: RE({ name: 'Vesh, the Pale King', img: 'm_skeleton', size: 1.8, spectral: '#9fe4ff', hp: 1100, atk: 24, def: 10, spd: 11, brk: 300, xp: 620, gold: 450, lord: { summon: ['m_skeleton', 'm_ghoul', 'm_skeleton'] }, trait: 'MONSTER LORD — raises the dead every few turns. Enrages when wounded.',
    skills: [{ name: 'Pale Decree', hits: [{ anim: 'thrust', m: 1.3, w: 560 }] }, { name: 'Grave Lances', w: .35, hits: [{ anim: 'spellcast', m: .8, w: 460 }, { anim: 'spellcast', m: .8, w: 300 }, { anim: 'spellcast', m: .9, w: 340 }] }, { name: 'The Long Night', w: .25, hits: [{ anim: 'spellcast', m: 2.4, w: 1100, unp: 1 }] }] }),
  // Wyrmcradle — the brood mother
  lt_hrazz: RE({ name: 'Scaleguard Hrazz', img: 'm_lizard', size: 1.4, def: 11, shield: 2, trait: 'Lieutenant — the brood\'s shield-wall.', skills: [{ name: 'Spear of the Marsh', hits: [{ anim: 'thrust', m: 1.1, w: 520 }] }, { name: 'Tide Lunge', w: .4, hits: [{ anim: 'thrust', m: .9, w: 440, proj: 'spear' }, { anim: 'thrust', m: 1, w: 360 }] }, { name: 'Shield Rush', w: .25, hits: [{ anim: 'run', m: 1.9, w: 800, unp: 1 }] }] }),
  lt_emberwing: RE({ name: 'Emberwing', img: 'm_drake', size: 1.35, spd: 15, trait: 'Lieutenant — the brood mother\'s eldest. Breathes fire.', skills: [{ name: 'Tail Lash', hits: [{ anim: 'slash', m: 1.1, w: 520 }] }, { name: 'Ember Verdict', w: .4, hits: [{ anim: 'spellcast', m: .9, w: 480 }, { anim: 'spellcast', m: .9, w: 320 }] }, { name: 'Wildfire Dive', w: .25, hits: [{ anim: 'jump', m: 2.1, w: 900, unp: 1 }] }] }),
  lt_horror: RE({ name: 'The Mire Horror', img: 'm_troll', size: 1.55, hp: 300, atk: 21, spd: 7, regen: .05, trait: 'Lieutenant — regenerates. Burn it or bury it.', skills: [{ name: 'Mire Slam', hits: [{ anim: 'slash', m: 1.3, w: 680 }] }, { name: 'Bog Hurl', w: .4, hits: [{ anim: 'slash', m: 1, w: 560, proj: 'stone' }, { anim: 'slash', m: 1, w: 420, proj: 'stone' }] }, { name: 'Drown', w: .25, hits: [{ anim: 'slash', m: 2.3, w: 1000, unp: 1 }] }] }),
  lt_kadrak: RE({ name: 'Hornlord Kadrak', img: 'm_minotaur', size: 1.45, stance: 1, trait: 'Lieutenant — charging stance counters plain attacks.', skills: [{ name: 'Horn Charge', hits: [{ anim: 'thrust', m: 1.3, w: 600 }] }, { name: 'Labyrinth Rage', w: .4, hits: [{ anim: 'slash', m: .9, w: 440 }, { anim: 'slash', m: .9, w: 300 }, { anim: 'thrust', m: 1.1, w: 400 }] }, { name: 'Earthsplitter', w: .25, hits: [{ anim: 'slash', m: 2.2, w: 950, unp: 1 }] }] }),
  rb_vharyx: RE({ name: 'Vharyx, Brood Mother', img: 'm_drake', size: 2, spectral: '#ff9a3a', hp: 1400, atk: 27, def: 11, spd: 12, brk: 340, xp: 900, gold: 700, lord: { summon: ['m_drake', 'm_lizard', 'm_lizard'] }, trait: 'MONSTER LORD — her brood answers every few turns. Enrages when wounded.',
    skills: [{ name: 'Brood Claw', hits: [{ anim: 'slash', m: 1.3, w: 560 }] }, { name: 'Firestorm', w: .35, hits: [{ anim: 'spellcast', m: .8, w: 460 }, { anim: 'spellcast', m: .8, w: 300 }, { anim: 'spellcast', m: 1, w: 360 }] }, { name: 'Cradle\'s End', w: .25, hits: [{ anim: 'jump', m: 2.6, w: 1100, unp: 1 }] }] })
});
Object.assign(TIER, { lt_snaga: 'C', lt_hexgrin: 'C', lt_brakk: 'C', lt_oldtusk: 'C', rb_grukk: 'B', lt_hollowmark: 'B', lt_bride: 'B', lt_ossk: 'B', lt_malvric: 'B', rb_vesh: 'A', lt_hrazz: 'A', lt_emberwing: 'A', lt_horror: 'A', lt_kadrak: 'A', rb_vharyx: 'S' });
Object.assign(SKILL_EL, { 'Hex Bolt': 'fire', 'Witchfire': 'fire', 'Quake Stomp': 'earth', 'Stampede': 'earth', 'Skull Volley': 'earth', 'Gravemaw': 'earth', 'Cold Embrace': 'ice', "Widow's Wail": 'ice', 'Blood Rain': 'shadow', 'Pale Decree': 'shadow', 'Grave Lances': 'shadow', 'The Long Night': 'shadow', 'Last Rites': 'shadow', 'Tide Lunge': 'water', 'Wildfire Dive': 'fire', 'Bog Hurl': 'earth', 'Drown': 'water', 'Earthsplitter': 'earth', 'Brood Claw': 'fire', 'Firestorm': 'fire', "Cradle's End": 'fire' });

const RAIDS = {
  r_gravemaw: { title: 'Gravemaw Den', sub: 'Grukk Gravemaw and his horde have dug in under the hills', lord: 'rb_grukk', lts: ['lt_snaga', 'lt_hexgrin', 'lt_brakk', 'lt_oldtusk'], min: 'D', bd: 'warren', light: '255,170,90', tint: 'rgba(10,6,2,.6)', orb: ['earth', 'C'], gold: 320,
    pool: [['m_goblin', 'm_goblin'], ['m_orc'], ['m_goblin', 'm_goblin_shaman'], ['m_ratfolk', 'm_goblin', 'm_ratfolk'], ['m_orc', 'm_goblin']], minions: ['m_goblin', 'm_goblin_shaman', 'm_orc'],
    intro: ['The tunnel opens into a cavern lit by a hundred stolen lanterns. On a throne of cart-wheels and shields sits an orc twice the size of a man.', 'GRUKK EATS GUILD-MEAT. GRUKK EATS IT SLOW.'] },
  r_hollow: { title: 'The Hollow Throne', sub: 'A lich-king holds court in a drowned cathedral', lord: 'rb_vesh', lts: ['lt_hollowmark', 'lt_bride', 'lt_ossk', 'lt_malvric'], min: 'C', bd: 'crypt', light: '160,210,255', tint: 'rgba(4,6,14,.64)', orb: ['shadow', 'B'], gold: 480,
    pool: [['m_skeleton', 'm_skeleton'], ['m_ghoul'], ['m_skeleton', 'm_ghoul'], ['m_vampire'], ['m_ghoul', 'm_ghoul']], minions: ['m_skeleton', 'm_ghoul'],
    intro: ['Pale fire burns in a hundred empty eye sockets. At the end of the nave, on a throne of fused bones, a crowned skeleton raises its head.', 'Kneel. All things kneel, in the end. I am only the end, come early.'] },
  r_cradle: { title: 'Wyrmcradle', sub: 'A brood mother has nested where the river boils', lord: 'rb_vharyx', lts: ['lt_hrazz', 'lt_emberwing', 'lt_horror', 'lt_kadrak'], min: 'B', bd: 'mire', light: '255,160,90', tint: 'rgba(14,6,2,.6)', orb: ['fire', 'A'], gold: 760,
    pool: [['m_lizard', 'm_lizard'], ['m_drake'], ['m_troll'], ['m_lizard', 'm_drake'], ['m_tusker', 'm_lizard']], minions: ['m_drake', 'm_lizard'],
    intro: ['The heat hits first. Then the light — a nest of black stone and molten gold, and coiled around it, a drake as long as a river barge.', '…Little warm-bloods. Come closer. My children are hungry.'] }
};

/* ---------- a tiny painter for the gate and seals ---------- */
const RaidArt = {
  c: {},
  sheet(kind) {
    if (this.c[kind]) return this.c[kind];
    const one = document.createElement('canvas'); one.width = 64; one.height = 64; const x = one.getContext('2d');
    if (kind === 'gate') {
      x.fillStyle = '#1a1210'; x.fillRect(4, 8, 56, 56); x.fillStyle = '#5a4a3a'; for (let i = 0; i < 6; i++) x.fillRect(8 + i * 9, 10, 4, 54); x.fillRect(4, 22, 56, 4); x.fillRect(4, 46, 56, 4);
      x.fillStyle = '#ff4a3a'; x.beginPath(); x.arc(32, 36, 8, 0, 7); x.fill(); x.fillStyle = '#ffd34a'; x.fillRect(31, 30, 2, 12); x.fillRect(26, 35, 12, 2);
    } else if (kind === 'seal') {
      x.fillStyle = 'rgba(0,0,0,.3)'; x.fillRect(16, 54, 32, 5); x.fillStyle = '#3a2a1a'; x.fillRect(29, 20, 6, 36); x.fillStyle = '#b02a2a'; x.fillRect(18, 18, 28, 20); x.fillStyle = '#ffd34a'; x.beginPath(); x.arc(32, 28, 6, 0, 7); x.fill();
    } else if (kind === 'fallen') {
      x.fillStyle = 'rgba(0,0,0,.25)'; x.fillRect(14, 52, 36, 6); x.fillStyle = '#4a3a2a'; x.fillRect(16, 46, 32, 8); x.fillStyle = '#8a8a8a'; x.fillRect(22, 40, 20, 6); x.fillStyle = '#e0c060'; x.fillRect(30, 20, 3, 26); x.fillStyle = '#e0c060'; x.fillRect(24, 18, 16, 10);
    }
    const S = document.createElement('canvas'); S.width = 64 * 9; S.height = 64 * 12; const sx = S.getContext('2d');
    for (let r = 0; r < 12; r++) for (let f = 0; f < 9; f++) sx.drawImage(one, f * 64, r * 64);
    return (this.c[kind] = S);
  }
};

const Raid = {
  st() { return G.S.raid || null; },
  adv(id) { const S = G.S; S.adv = S.adv || {}; return (S.adv[id] = S.adv[id] || { bond: 0, knows: false, raids: 0, met: false }); },
  bond(id, n, why) { const a = this.adv(id); a.bond += n; if (why) toast(`<b>${ADV[id].name}</b> ${n > 0 ? '▲' : '▼'} ${why}`, 2600); },
  // will they stand next to you?
  willing(id) {
    const A = ADV[id], a = this.adv(id), w = Rep.who(), S = G.S;
    let s = A.open + a.bond * 1.5 + Math.floor((S.fame || 0) / 15);
    if (w === 'eyes') { s -= 4; if (A.open >= 2) s += 2; }
    else if (w === 'ren') { if (a.knows) s += A.open < 0 ? -3 : 0; else if (S.sus >= 3) s -= 2; else s += 1; }
    else if (w === 'veil') { s += 1 + Math.min(3, Math.floor((S.f.veilRep || 0) / 10)); if (A.loyal && Veil.fame() >= 6) s -= 5; if (id === 'nix') s += 3; }
    const why = s >= 0 ? null : w === 'eyes' ? `"A Drag? In MY party? Walk away."` : w === 'veil' ? (A.loyal ? `"The Crown wants that mask in irons. I'm not raiding beside a wanted man."` : `"Never heard of you, mask. Prove yourself first."`) : a.knows ? `"I know what's under that hood. No."` : `"You keep that hood down even indoors. I don't raid with people who hide their eyes."`;
    return { ok: s >= 0, why };
  },
  callDays: [3, 10, 17, 24],
  isCall(d) { return typeof Cal !== 'undefined' && this.callDays.includes(Cal.dom(d || Cal.day())); },
  nextCall() { let d = Cal.day(); for (let i = 0; i < 30; i++, d++) if (this.isCall(d)) return d; return Cal.day(); },
  async board() {
    if (!this.isCall()) {
      const n = this.nextCall(), dd = n - Cal.day();
      await narr(`The raid board is bare except for one notice: "NEXT RAID CALL — ${Cal.label(n)}." Raids muster on the 3rd, 10th, 17th and 24th. (${dd} day${dd > 1 ? 's' : ''} away.)`);
      const c = await ask(null, null, `Wait for the raid call on ${Cal.label(n)}?`, ['Wait for it', 'Not now']); if (c !== 0) return;
      await Cal.waitUntil(n); await narr('Dawn. The raid horn sounds over the Guild hall, and adventurers pour in from every road.');
    }
    const ids = Object.keys(RAIDS), gi = Power.now().i;
    const c = await ask(null, null, 'RAID CALL. Which lair?', [...ids.map(id => { const R = RAIDS[id], lock = gi < GRADES.indexOf(R.min); return `${lock ? '🔒 ' : G.S.f['raidwin_' + id] ? '✔ ' : '🐉 '}${R.title} — needs ${R.min}-grade · ${R.sub}`; }), 'Step away']);
    if (c < 0 || c >= ids.length) return;
    const id = ids[c], R = RAIDS[id];
    if (gi < GRADES.indexOf(R.min)) { await narr(`The Raid Marshal looks you up and down. "${R.title} is ${R.min}-grade work. Come back when you've broken through."`); return; }
    await this.recruit(id);
  },
  async recruit(id) {
    const R = RAIDS[id], pool = Object.keys(ADV).filter(k => !ADV[k].rival), party = [];
    await narr(`The Raid Marshal: "${R.title}. The Gilded Lances are going in too — they always are. Form a party of up to three. It's not meant to be done alone… but nobody will stop you trying."`);
    if (Rep.who() === 'eyes') await narr('Half the hall goes quiet when they see your eyes. Chairs scrape. A few people find somewhere else to stand.');
    while (party.length < 3) {
      const opts = pool.filter(k => !party.includes(k));
      const labels = opts.map(k => { const A = ADV[k], w = this.willing(k), a = this.adv(k); return `${ROLE[A.role].ic} ${A.name} · ${ROLE[A.role].n}${a.bond >= 3 ? ' · ♥ friend' : a.bond <= -3 ? ' · ✖ grudge' : ''}${w.ok ? '' : ' · (won\'t join)'}`; });
      const c = await ask(null, null, `Your party: ${party.length ? party.map(k => ADV[k].name).join(', ') : 'just you'}. Who do you ask?`, [...labels, party.length ? 'That\'s my party — go!' : 'Go in alone', 'Cancel']);
      if (c < 0 || c === labels.length + 1) return;
      if (c === labels.length) break;
      const k = opts[c], A = ADV[k], w = this.willing(k);
      if (!w.ok) { await say('adv_' + k, 'anger', w.why); continue; }
      party.push(k); this.adv(k).met = true;
      await say('adv_' + k, 'happy', pick([`"${R.title}? I'm in. Try to keep up."`, '"Count me in. Split by the code, yes?"', '"Finally, a party that isn\'t all spears."']));
    }
    if (!party.length) await narr('The Marshal shrugs. "Your funeral. I\'ll put your name on the list anyway."');
    const rivals = ['aldric', ...pool.filter(k => !party.includes(k)).sort(() => Math.random() - .5).slice(0, 2)];
    await this.depart(id, party, rivals);
  },
  makeAllies(ids, team) {
    const S = G.S.stats, lv = G.S.lvl - 1, gi = Power.now().i;
    for (const k of ids) {
      const A = ADV[k], Rr = ROLE[A.role], b = Skills.allyBonus('adv_' + k);
      ALLY['adv_' + k] = { name: A.name, sprite: A.sprite, color: A.color, raid: 1, team, role: A.role, hp: Math.round(S.maxHp * Rr.hp * (1 + gi * .04)) - lv * 7 - b.hp, mp: 30 - lv * 2, atk: Math.round(S.atk * Rr.atk) - lv * 2 - b.atk, def: Math.round(S.def * Rr.def) - lv - b.def, spd: Math.round(S.spd * Rr.spd) - b.spd, arts: [], atkAnim: A.role === 'tank' || A.role === 'striker' ? null : 'thrust' };
      G.S.allies['adv_' + k] = {};
    }
  },
  async depart(id, party, rivals) {
    const R = RAIDS[id], S = G.S;
    S.raid = { id, party, rivals, as: Rep.who(), lts: {}, contrib: { me: 0 }, steps: 0, gate: false, blazed: false };
    for (const k of [...party, ...rivals]) { S.raid.contrib[k] = 0; this.adv(k).met = true; }
    this.makeAllies(party, 'you'); this.makeAllies(rivals, 'rival');
    S.chests = S.chests || {}; for (const k of Object.keys(S.chests)) if (k.startsWith(id + ':')) delete S.chests[k];
    delete S.f['clear_' + id];
    const D = G.maps[id].dungeon; S.dret = { map: 'a_guild', x: 6, y: 6 };
    await fadeOut(500); await World.go(id, D.start[0], D.start[1], 'up');
    banner(R.title.toUpperCase(), 'RAID — four lieutenants hold the seals. The Lord waits beyond.', 3000);
    setTimeout(() => toast('<b>The Gilded Lances</b> went in by the other tunnel. Every lieutenant they take is one you don\'t.', 4200), 2600);
  },
  // ---------- inside the lair ----------
  lairNpcs(id) {
    const R = RAIDS[id], r = this.st(), D = G.maps[id].dungeon, L = [];
    if (!r || r.id !== id) return L;
    R.lts.forEach((k, i) => {
      const [x, y] = D.lts[i], E = ENEMY[k], who = r.lts[i];
      if (!who) L.push({ id: 'lt' + i, sprite: E.img, x, y, dir: 'down', size: Math.min(1.5, E.size || 1), name: E.name, talk: () => Raid.fightLt(i) });
      else L.push({ id: 'sl' + i, img: RaidArt.sheet(who === 'you' ? 'seal' : 'fallen'), x, y, dir: 'down', pickup: 1, talk: async () => narr(who === 'you' ? `${E.name} lies where you dropped them. Their seal burns in your pack.` : `The Gilded Lances got here first. ${E.name} is dead, the seal already taken. A gold lance is planted in the ground like a flag.`) });
    });
    return L;
  },
  async fightLt(i) {
    const r = this.st(), R = RAIDS[r.id], k = R.lts[i], E = ENEMY[k];
    await narr(`${E.name}. ${E.trait.replace('Lieutenant — ', '')}`);
    const res = await this.battle([k, pick(R.minions), pick(R.minions)], { intro: `LIEUTENANT — ${E.name.toUpperCase()}`, lt: 1 });
    if (res !== 'win') return;
    r.lts[i] = 'you'; r.contrib.me += 120; for (const k2 of r.party) r.contrib[k2] += 70;
    sfx('level'); toast(`Seal ${Object.values(r.lts).filter(Boolean).length}/4 — ${E.name}'s seal is yours.`, 3000);
    World.ents = World.ents.filter(e => e.id !== 'lt' + i); this.refresh();
    this.checkGate();
  },
  checkGate() {
    const r = this.st(); if (!r || r.gate) return;
    if (Object.values(r.lts).filter(Boolean).length >= 4) {
      r.gate = true; this.openGate(); sfx('break');
      banner('THE GATE OPENS', 'Four seals burn together into a single key', 2600);
      setTimeout(() => toast('The Lord\'s chamber is open — north. The Gilded Lances will be heading there too.', 4200), 2400);
    }
  },
  openGate() { const D = G.maps[this.st().id].dungeon; for (const [x, y] of D.gate) if (World.col[y]) World.col[y][x] = 0; World.ents = World.ents.filter(e => !/^gate/.test(e.id)); },
  async refresh() {
    try { const id = G.S.map, R = RAIDS[id]; if (!R) return; for (const n of this.lairNpcs(id)) if (!World.ents.some(e => e.id === n.id)) { const img = n.img || await npcImg(n.sprite); World.ents.push(new Ent(Object.assign({}, n, { img }))); } } catch (e) { }
  },
  // the rival party clears lieutenants as you explore
  rivalStep() {
    const r = this.st(); if (!r || r.done) return; r.steps++;
    if (r.steps % 60 === 0) {
      const R = RAIDS[r.id], open = R.lts.map((k, i) => i).filter(i => !r.lts[i]);
      if (open.length && Object.values(r.lts).filter(v => v === 'rival').length < 2 + (r.steps > 300 ? 2 : 0)) {
        const D = G.maps[r.id].dungeon, px = World.player.x, py = World.player.y;
        const i = open.sort((a, b) => (Math.abs(D.lts[b][0] - px) + Math.abs(D.lts[b][1] - py)) - (Math.abs(D.lts[a][0] - px) + Math.abs(D.lts[a][1] - py)))[0];
        r.lts[i] = 'rival'; r.contrib.aldric += 140; for (const k of r.rivals.slice(1)) r.contrib[k] += 80;
        World.ents = World.ents.filter(e => e.id !== 'lt' + i); this.refresh();
        sfx('alarm'); toast(`⚔ Somewhere in the dark, a war-horn: <b>the Gilded Lances</b> took down ${ENEMY[R.lts[i]].name}.`, 4200);
        this.checkGate();
      }
    }
    // if the gate's open and you dawdle, the Lances start without you
    if (r.gate && !r.engaged && (r.gateAt = r.gateAt || r.steps) && r.steps - r.gateAt > 45) { r.engaged = 1; r.contrib.aldric += 160; toast('<b>The Gilded Lances have engaged the Lord!</b> Get in there before they take all the glory.', 4600); }
  },
  async lord() {
    const r = this.st(), R = RAIDS[r.id], E = ENEMY[R.lord];
    if (!r.gate) { await narr('A gate of black iron and red sigils. Four empty sockets. It wants four seals.'); return; }
    await narr(R.intro[0]); CHAR._lord = { name: E.name, sprite: E.img }; await say('_lord', null, R.intro[1]);
    await say('adv_aldric', 'neutral', r.engaged ? '"Took your time! Fine — the code still counts what you do from here. Lances, FORM UP!"' : '"So you made it. Good. The code applies — every blow counts. Lances, FORM UP!"');
    const res = await this.battle([R.lord, pick(R.minions), pick(R.minions)], { intro: `MONSTER LORD — ${E.name.toUpperCase()}`, lord: 1, music: 'boss' });
    if (res !== 'win') return;
    r.done = true; G.S.f['clear_' + r.id] = 1; G.S.f['raidwin_' + r.id] = (G.S.f['raidwin_' + r.id] || 0) + 1;
    World.ents = World.ents.filter(e => e.id !== 'lord');
    await this.spoils();
  },
  // every raid battle: your party + (for the lord) the rivals, AI-driven, with contribution tracking
  async battle(enemies, o) {
    const r = this.st(), W = G.view.w;
    const allies = [...r.party.map(k => 'adv_' + k), ...(o.lord ? r.rivals.map(k => 'adv_' + k) : [])];
    const slots = [[W - 128, 212], [W - 92, 268], [W - 160, 156], [W - 70, 168], [W - 236, 196], [W - 206, 262], [W - 262, 138]];
    const keep = G.S.party; G.S.party = [];
    const res = await Battle.start({ enemies, allies, slots, raid: 1, lord: o.lord, noFlee: !!o.lord, boss: !!(o.lord || o.lt), bd: RAIDS[r.id].bd, intro: o.intro, music: o.music, noElite: 1,
      onTurn: (B, BT) => { if (!B.raidInit) { B.raidInit = 1; Raid.initBattle(B, BT, o); } } });
    G.S.party = keep;
    if (res === 'lose') { await this.fail(); return 'lose'; }
    return res;
  },
  initBattle(B, BT, o) {
    const me = B.actors.find(a => a.isMe);
    for (const a of B.actors) if (a.side === 'p' && ALLY[a.id] && ALLY[a.id].raid) { a.auto = 1; a.role = ALLY[a.id].role; a.team = ALLY[a.id].team; a.adv = a.id.slice(4); }
    B.contrib = {};
    const raiders = B.actors.filter(a => a.side === 'p').length;
    for (const e of B.actors.filter(a => a.side === 'e')) {
      if (e.E.lord) { // built for a full raid of seven: alone, it's a very long fight
        const per = Math.max(5, me.atk * 1.15 - e.def);
        e.maxHp = e.hp = Math.round(per * 7 * (12 + Power.now().i));
        e.atk = Math.round(me.def * .6 + me.maxHp * .24); e.brkMax = Math.round(e.maxHp * .22);
        if (Raid.st().engaged) e.hp = Math.round(e.maxHp * .85);
      } else if (e.E.boss) { e.maxHp = e.hp = Math.round(me.maxHp * (2.6 + raiders * .55)); e.atk = Math.round(me.def * .6 + me.maxHp * .17); }
    }
    if (o.lord) BT.msg('Two parties, one Lord. Every blow, block and heal counts toward contribution.', 1800);
  },
  async fail() {
    const r = this.st(); if (!r) return;
    await narr('The raid breaks. Someone drags you out by the collar — you never see who. When you wake, you\'re on a cot in the Guild hall.');
    G.S.raid = null; Story.heal(true);
    await World.go('a_guild', 6, 6, 'down');
  },
  async leave() {
    const r = this.st();
    if (r && !r.done) { const c = await ask(null, null, 'Abandon the raid? Your party will not be pleased.', ['Abandon', 'Stay']); if (c !== 0) return; for (const k of r.party) this.bond(k, -1, 'you walked out on the raid'); }
    G.S.raid = null; await World.go('a_guild', 6, 6, 'down');
  },
  // ---------- spoils & the code ----------
  async spoils() {
    const r = this.st(), R = RAIDS[r.id], S = G.S;
    const people = ['me', ...r.party, ...r.rivals];
    const rank = people.slice().sort((a, b) => (r.contrib[b] || 0) - (r.contrib[a] || 0));
    const nm = k => k === 'me' ? (r.as === 'veil' ? 'the Red Veil' : S.name) : ADV[k].name;
    banner('VICTORY — ' + RAIDS[r.id].lord.toUpperCase().replace(/^RB_/, ''), 'The Lord is dead', 2400); await wait(1400);
    await narr('Contribution, as the Marshal\'s tally-stones count it:\n' + rank.map((k, i) => `${i === 0 ? '★ MVP' : '#' + (i + 1)} — ${nm(k)} · ${Math.round(r.contrib[k] || 0)}`).join('\n'));
    const mvp = rank[0];
    if (mvp === 'me') {
      S.f.raidMvp = (S.f.raidMvp || 0) + 1;
      const hater = [...r.party, ...r.rivals].find(k => ADV[k].open <= -2);
      if (hater && (r.blazed || Rep.who() === 'eyes')) await say('adv_' + hater, 'anger', '"…I don\'t like what you are. I never will. But the code is older than my grudges. MVP picks first."');
      else await say('adv_aldric', 'neutral', '"MVP picks first. That\'s the code. Go on."');
    } else await say('adv_' + mvp, 'happy', `"MVP's mine. The code says I pick first."`);
    // the loot
    const lesser = pick(['wind', 'ice', 'water', 'lightning', 'earth']);
    let loot = [
      { k: 'orb', n: `${ORB_NAME[R.orb[0]]} Orb · ${R.orb[1]}-rank (the Lord's heart)`, v: 10 }, { k: 'gold', n: `The Lord's hoard — ${Ct.pay(R.gold)}g`, v: 8 },
      { k: 'stone', n: 'A D-stone from the throne', v: 7 }, { k: 'trophy', n: 'The Lord\'s trophy (+fame)', v: 6 },
      { k: 'crystal', n: 'Mana crystals (+EXP)', v: 5 }, { k: 'lorb', n: `${ORB_NAME[lesser]} Orb · D-rank`, v: 4, el: lesser }, { k: 'cache', n: 'Healer\'s cache (3 Tonics, 2 Ethers)', v: 3 }
    ];
    let order = rank.slice(), broke = false;
    if (mvp !== 'me') {
      const c = await ask(null, null, `You placed #${rank.indexOf('me') + 1}. The code says you wait your turn.`, ['Wait your turn — the code', 'Grab the Lord\'s orb first anyway']);
      if (c === 1) { broke = true; order = ['me', ...rank.filter(k => k !== 'me')]; }
    }
    const got = [];
    for (const k of order) {
      if (!loot.length) break;
      if (k === 'me') {
        let choice;
        if (broke && !got.length) { choice = loot[0]; await narr('You push past and take the orb before anyone moves. The cavern goes silent. Every raider in the room watches you do it.'); }
        else {
          const nxt = order[order.indexOf('me') + 1];
          const c = await ask(null, null, 'Your pick.', [...loot.map(l => l.n), ...(nxt ? [`Yield your pick to ${nm(nxt)}`] : [])]);
          if (c === loot.length && nxt) { this.bond(nxt, 2, 'you gave up your pick for them'); await say('adv_' + nxt, 'happy', '"…Huh. I won\'t forget that."'); continue; }
          choice = loot[Math.max(0, c)];
        }
        loot = loot.filter(l => l !== choice); got.push(choice);
      } else {
        const best = loot.slice().sort((a, b) => (b.v + Math.random() * 2) - (a.v + Math.random() * 2))[0];
        loot = loot.filter(l => l !== best);
      }
    }
    for (const l of got) await this.grant(l, R);
    // the code, remembered
    const all = [...r.party, ...r.rivals];
    for (const k of r.party) { this.adv(k).raids++; this.bond(k, 1); }
    if (broke) { for (const k of all) this.bond(k, -3); Rep.deed(-4, 'broke the raid code', 'ashford', -8); toast('Word spreads through every Guild hall: <b>you broke the code.</b>', 4200); }
    else if (mvp === 'me') { for (const k of all) this.bond(k, 1); }
    if (r.blazed && r.as !== 'veil') {
      for (const k of all) { const a = this.adv(k); if (!a.knows) { a.knows = true; if (ADV[k].open < 0 && a.bond < 3 && mvp !== 'me') this.bond(k, -2); } }
      await narr(mvp === 'me' ? 'They all saw the green fire in your eyes. Nobody says the word. They saw who carried the raid, too.' : 'They all saw your eyes. Some of them will never look at you the same way. Some of them already didn\'t care.');
    }
    if (r.as === 'veil') Veil.addFame(1, 'the Red Veil was seen walking out of a monster lord\'s lair.');
    Rep.deed(mvp === 'me' ? 8 : 4, `${R.title} cleared${mvp === 'me' ? ' — raid MVP' : ''}`, 'ashford', mvp === 'me' ? 14 : 6);
    G.S.raid = null; save();
    await narr('The raiders haul the spoils to the surface. By nightfall the whole Guild hall knows how it went.');
    await World.go('a_guild', 6, 6, 'down');
  },
  async grant(l, R) {
    const S = G.S;
    if (l.k === 'orb') Arm.giveOrb(R.orb[0], R.orb[1], 'the Lord');
    else if (l.k === 'lorb') Arm.giveOrb(l.el, 'D', 'the hoard');
    else if (l.k === 'gold') { const g = Ct.pay(R.gold); S.gold += g; sfx('coin'); toast(`+${g} gold`, 2200); }
    else if (l.k === 'stone') { const id = SPARE_STONES.find(k => !Stones.has(k)) || 'raw'; if (!Stones.has(id)) Stones.give(id); else { S.gold += 150; toast('You already carry that stone — sold it for 150g', 2400); } }
    else if (l.k === 'trophy') Rep.deed(2, 'the Lord\'s trophy hangs in the Guild hall', 'ashford', 10);
    else if (l.k === 'crystal') Story.gainXp(Math.round(120 + Power.now().cstep * 18));
    else if (l.k === 'cache') { S.items.tonic += 3; S.items.ether += 2; toast('+3 Tonics · +2 Ethers', 2200); }
    UI.hud();
  },
  bondsHTML() {
    const S = G.S; if (!S.adv) return '';
    const L = Object.keys(S.adv).filter(k => S.adv[k].met || S.adv[k].raids || S.adv[k].bond);
    if (!L.length) return '';
    return `<div class="stat" style="margin-top:6px"><h3>Raiders who remember you</h3>${L.map(k => { const a = S.adv[k], A = ADV[k]; return `<p>${ROLE[A.role].ic} <b>${A.name}</b> — ${a.bond >= 3 ? '<b style="color:#46ff95">Friend</b> — will stand up for you' : a.bond >= 1 ? 'Respects you' : a.bond <= -3 ? '<b style="color:#ff7a6a">Grudge</b> — badmouths you' : a.bond < 0 ? 'Wary' : 'Neutral'}${a.knows ? ' · knows you\'re a Drag' : ''}${a.raids ? ` · ${a.raids} raid${a.raids > 1 ? 's' : ''} together` : ''}</p>`; }).join('')}</div>`;
  }
};

/* ---------- scenes for the lairs ---------- */
for (const [id, R] of Object.entries(RAIDS)) {
  DUNGEONS[id] = { id, title: R.title, sub: R.sub, rank: R.min, boss: R.lord, bd: R.bd, light: R.light, glow: '#ff5a3a', from: { map: '__raid', at: [0, 0], back: [0, 0] }, tint: R.tint, raid: 1, enc: () => pick(R.pool) };
  SCENES[id] = {
    title: R.title, subtitle: R.sub, bd: R.bd, music: 'woods', dungeon: 1, encRate: .075,
    setup(W) { W.tint = R.tint; },
    encounters() { return Raid.st() && !Raid.st().done ? Elite.apply({ enemies: pick(R.pool), bd: R.bd, raid: 1 }) : null; },
    npcs() { return Raid.lairNpcs(id).filter(n => !n.img); },
    get exits() { return []; }
  };
}
(function () {
  const BT = Battle;
  // more than three party members need more places to stand
  // (battle.js reads cfg.slots when given)
  // lair setup: the gate, the Lord, the stairs
  const _ld = World.load.bind(World);
  World.load = async function (name, x, y, dir) {
    const r = await _ld(name, x, y, dir);
    try {
      if (RAIDS[name]) {
        const D = this.map.dungeon, R = RAIDS[name], st = Raid.st();
        for (const e of this.ents) if (e.id === 'stairs') e.talk = () => Raid.leave();
        for (const n of Raid.lairNpcs(name)) if (n.img) this.ents.push(new Ent(n));
        this.ents = this.ents.filter(e => e.id !== 'boss');
        if (st && st.id === name && !st.done) {
          const E = ENEMY[R.lord];
          this.ents.push(new Ent({ id: 'lord', x: D.boss[0], y: D.boss[1], dir: 'down', img: await npcImg(E.img), size: Math.min(1.7, E.size || 1), name: E.name, talk: () => Raid.lord() }));
          if (!st.gate) { for (const [gx, gy] of D.gate) { this.col[gy][gx] = 1; this.ents.push(new Ent({ id: 'gate' + gx, x: gx, y: gy, dir: 'down', img: RaidArt.sheet('gate'), pickup: 1, talk: () => Raid.lord() })); } }
        }
      }
    } catch (e) { console.warn('raid load', e); }
    return r;
  };
  const _st = World.onStep.bind(World);
  World.onStep = function (e) { const r = _st(e); try { if (e.isPlayer && RAIDS[G.S.map] && Raid.st()) Raid.rivalStep(); } catch (err) { } return r; };

  /* ---------- AI raiders ---------- */
  const _pt = BT.playerTurn.bind(BT);
  BT.playerTurn = function (a) { if (a.auto) return Raid.act(this, a).then(() => null).catch(() => null); return _pt(a); };
  Raid.act = async function (BT, a) {
    const B = BT.B, foes = BT.alive('e'); if (!foes.length) return;
    a.mp = Math.min(a.maxMp, a.mp + 2); a.tcd = Math.max(0, (a.tcd || 0) - 1);
    const lordE = foes.slice().sort((x, y) => y.maxHp - x.maxHp)[0];
    const t = a.team === 'rival' ? lordE : (Math.random() < .5 ? lordE : foes.slice().sort((x, y) => x.hp - y.hp)[0]);
    const credit = (n) => { B.contrib = B.contrib || {}; B.contrib[a.id] = (B.contrib[a.id] || 0) + n; };
    if (a.role === 'healer') {
      const hurt = BT.alive('p').filter(p => p.hp < p.maxHp * .62).sort((x, y) => x.hp / x.maxHp - y.hp / y.maxHp)[0];
      if (hurt && a.mp >= 4) {
        a.mp -= 4; const h = Math.round(hurt.maxHp * .26); const real = Math.min(h, hurt.maxHp - hurt.hp); hurt.hp += real; credit(real * 1.1);
        a.anim = 'spellcast'; BT.play(a, 'spellcast', 7, 60); sfx('heal'); BT.spark(hurt.x, hurt.y - 30, '#9bffb0', 18); BT.text(hurt, `+${real} (${a.name.split(' ')[0]})`, '#9be37a', -30); BT.hud(); await wait(600); return;
      }
    }
    if (a.role === 'tank' && !a.tcd) {
      a.tcd = 3; a.guard = true; B.taunt = { a, n: 3 }; sfx('alarm'); BT.text(a, '🛡 TAUNT — come at me!', '#ffd34a', -40, true); a.anim = 'thrust'; BT.play(a, 'thrust', 8, 50); await wait(650); return;
    }
    const ranged = a.role === 'ranger' || a.role === 'mage' || a.role === 'healer';
    const roll = () => { const r = Math.random(); return r < .27 ? 'perfect' : r < .87 ? 'good' : 'miss'; };
    if (ranged) {
      const aoe = a.role === 'mage' && a.mp >= 6 && Math.random() < .45;
      const kind = a.role === 'ranger' ? 'arrow' : a.role === 'healer' ? 'light' : pick(['fire', 'ice', 'lightning']);
      a.anim = a.role === 'ranger' ? 'thrust' : 'spellcast'; BT.play(a, a.anim, a.role === 'ranger' ? 8 : 7, 50); await wait(250);
      const targets = aoe ? foes : [t]; if (aoe) a.mp -= 6;
      const now = performance.now(), ms = PROJ[kind].ms;
      for (const x of targets) B.fx.push({ proj: kind, x0: a.x - 14, y0: a.y - 36 * BT_SCALE, x1: x.x + 6, y1: x.y - 30 * BT_SCALE, ts: now, te: now + ms, t: 0, life: ms + 40 });
      sfx(PROJ[kind].sfx || 'throw'); await wait(ms);
      for (const x of targets) if (!x.ko) BT.resolveHit(a, x, aoe ? .62 : a.role === 'healer' ? .7 : 1.08, roll(), { src: 'attack', unblockable: kind !== 'arrow' });
      BT.hud(); await wait(260); return;
    }
    await BT.dash(a, t.x + 52, t.y + 2, 240);
    const n = a.role === 'striker' ? 3 : 2;
    for (let i = 0; i < n && !t.ko; i++) { a.anim = i % 2 ? 'halfslash' : 'slash'; BT.play(a, a.anim, 6, 40); await wait(170); BT.resolveHit(a, t, a.role === 'striker' ? .62 : .7, roll(), { src: 'attack' }); await wait(140); }
    await BT.home(a); BT.hud();
  };
  // AI raiders defend themselves
  const _def = BT.defend.bind(BT);
  BT.defend = async function (e, t, h) {
    if (!t.auto) return _def(e, t, h);
    const B = this.B; e.anim = h.anim; e.frame = 0; e.once = true;
    await wait(Math.min(700, (h.w || 500) * .7));
    const r = Math.random(), tank = t.role === 'tank';
    let res = h.unp ? (r < (tank ? .35 : .45) ? 'dodge' : 'hit') : r < (tank ? .5 : .2) ? 'parry' : r < (tank ? .62 : .5) ? 'dodge' : 'hit';
    if (res === 'parry') { sfx('parry'); this.text(t, 'BLOCK', '#ffe36a'); this.spark((t.x + e.x) / 2, t.y - 34, '#fff3a0', 8); this.chip(e, t, (h.m || 1) * .2); }
    else if (res === 'dodge') { sfx('dodge'); this.text(t, 'DODGE', '#9ad1ff'); this.hop(t); }
    else this.chip(e, t, h.m || 1, true, h.el);
    if (B.contrib && res !== 'hit') B.contrib[t.id] = (B.contrib[t.id] || 0) + Math.round(e.atk * (h.m || 1) * .6);
    this.hud(); return res;
  };
  // taunts pull the enemy's attention
  const _et = BT.enemyTurn.bind(BT);
  BT.enemyTurn = async function (e) {
    const B = this.B;
    // the Lord calls his horde
    if (e.E && e.E.lord && !e.ko) {
      e.lordT = (e.lordT || 0) + 1;
      if (!e.enraged && e.hp < e.maxHp * .35) { e.enraged = 1; e.atk = Math.round(e.atk * 1.3); e.spd += 3; B.shake = 12; sfx('alarm'); await this.msg(`${e.name} ENRAGES!`, 1300); }
      if (e.lordT % 4 === 2) { // a blow that hits the whole raid
        B.shake = 14; B.flash = .4; sfx('alarm'); await this.msg(`${e.name}: CATACLYSM — the whole raid is hit!`, 1100);
        for (const p of this.alive('p')) if (!p.isMe) { if (p.role === 'tank' && p.guard) this.chip(e, p, .45); else this.chip(e, p, .85, true); }
        this.hud(); await wait(400);
      }
      if (e.lordT % 3 === 0 && this.alive('e').length < 4) { const R = RAIDS[Raid.st() && Raid.st().id]; await this.msg(`${e.name} roars — the lair answers!`, 1000); await this.summon(pick(R ? R.minions : ['m_goblin']), 'ANSWERS THE LORD'); }
    }
    const T = B.taunt;
    if (T && T.n > 0 && !T.a.ko && Math.random() < .7) {
      T.n--; const orig = this.alive, _al = orig.bind(this);
      this.alive = side => side === 'p' ? [T.a] : _al(side);
      try { return await _et(e); } finally { this.alive = orig; }
    }
    return _et(e);
  };
  // contribution: every hit point taken off an enemy, and every hit soaked
  const _dmg = BT.damage.bind(BT);
  BT.damage = function (t, dmg, big) {
    const B = this.B, before = t.hp, r = _dmg(t, dmg, big);
    try {
      if (B && B.cfg.raid) {
        const lost = Math.max(0, before - Math.max(0, t.hp)); B.contrib = B.contrib || {};
        if (t.side === 'e' && B.cur) { const who = B.cur.side === 'p' ? B.cur.id : 'me'; B.contrib[who] = (B.contrib[who] || 0) + lost; }
        else if (t.side === 'p') B.contrib[t.id] = (B.contrib[t.id] || 0) + lost * .5;
      }
    } catch (e) { }
    return r;
  };
  const _v = BT.victory.bind(BT);
  BT.victory = async function () {
    const B = this.B;
    try {
      const r = Raid.st();
      if (B && B.cfg.raid && r) { for (const [id, v] of Object.entries(B.contrib || {})) { const k = id === 'me' ? 'me' : id.replace(/^adv_/, ''); r.contrib[k] = (r.contrib[k] || 0) + v; } if (B.blazed) r.blazed = true; }
    } catch (e) { }
    return _v();
  };
  // bonded raiders stand up for you in the Guild hall
  const _s = Story.addSus.bind(Story);
  Story.addSus = function (n, quiet) {
    if (n > 0 && G.S && G.S.map === 'a_guild' && G.S.adv) {
      const fr = Object.keys(G.S.adv).find(k => G.S.adv[k].bond >= 3);
      if (fr) { toast(`<b>${ADV[fr].name}</b> stands up: "Leave it. They're with me." Nobody says another word.`, 3600); return; }
    }
    return _s(n, quiet);
  };
  // the Guild hall: a Raid Marshal, and raiders who remember you
  const sc = SCENES.a_guild;
  if (sc) {
    CHAR.marshal = { name: 'Raid Marshal Dagny', sprite: 'folk12' };
    const o = sc.npcs ? sc.npcs.bind(sc) : () => [];
    sc.npcs = function () {
      const L = o();
      if (G.S.rank) {
        const [mx, my] = freeNear('in_inn', 10, 3);
        L.push({ id: 'marshal', sprite: 'folk12', x: mx, y: my, dir: 'down', talk: async () => { await say('marshal', null, Raid.isCall() ? '"RAID CALL today! Monster lords, four lieutenants apiece. Bring a party — or bring a coffin."' : `"Next raid call is ${Cal.label(Raid.nextCall())}. 3rd, 10th, 17th and 24th, every month."`); await Raid.board(); } });
        const known = G.S.adv ? Object.keys(G.S.adv).filter(k => G.S.adv[k].met && !ADV[k].rival).slice(0, 3) : [];
        known.forEach((k, i) => {
          const [x, y] = freeNear('in_inn', 4 + i * 3, 9); const a = G.S.adv[k];
          L.push({ id: 'advn_' + k, sprite: ADV[k].sprite, x, y, dir: 'down', talk: async () => {
            const eyes = Rep.who() === 'eyes';
            await say('adv_' + k, a.bond >= 3 ? 'happy' : a.bond < 0 ? 'anger' : 'neutral',
              a.bond >= 3 ? (eyes ? '"Eyes and all, you\'re still the one who had my back down there. Sit. I\'m buying."' : '"There\'s my raid partner! Next call, you and me, yes?"')
              : a.bond <= -3 ? '"You. I remember what you did at the spoils. Get away from my table."'
              : a.bond < 0 ? (eyes ? '"…Keep walking, Drag."' : '"Hm. You."') : (eyes ? '"…Those eyes. Huh. Well — you fought fair."' : '"Good raid. Let\'s do it again some time."'));
          } });
        });
      }
      return L;
    };
  }
  if (typeof SCHEDULE !== 'undefined') SCHEDULE.raid = { name: 'Raid Call', days: [3, 10, 17, 24], icon: '🐉', where: 'the Guild hall (Raid Marshal)' };
})();
