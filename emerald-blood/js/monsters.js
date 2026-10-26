'use strict';
/* ================= MONSTERS: the wild things of the vale, the warrens and the deep places ================= */
const MH = (anim, m, w, unp) => ({ anim, m, w, unp });
Object.assign(ENEMY, {
  // ---- E
  m_goblin: { name: 'Goblin Scrapper', hp: 30, atk: 9, def: 1, spd: 14, dodge: .3, parry: 0, brk: 30, xp: 10, gold: 7, trait: 'Quick and cowardly — hard to pin down',
    skills: [{ name: 'Shank', hits: [MH('thrust', 1, 420)] }, { name: 'Flurry of Shivs', w: .4, hits: [MH('thrust', .5, 380), MH('thrust', .5, 220), MH('thrust', .5, 220)] }] },
  m_ratfolk: { name: 'Warren Rat', hp: 26, atk: 8, def: 1, spd: 15, dodge: .35, parry: 0, brk: 26, xp: 9, gold: 5,
    skills: [{ name: 'Gnaw', hits: [MH('thrust', 1, 400)] }, { name: 'Plague Bite', w: .35, hits: [MH('thrust', 1.3, 600)] }] },
  m_gourd: { name: 'Gourdling', hp: 34, atk: 9, def: 3, spd: 9, dodge: .1, parry: 0, brk: 34, xp: 10, gold: 6, trait: 'A pumpkin that hates you. Nobody knows why.',
    skills: [{ name: 'Seed Spit', hits: [MH('spellcast', 1, 640)] }, { name: 'Rolling Bash', w: .4, hits: [MH('slash', 1.4, 760)] }] },
  // ---- D
  m_goblin_shaman: { name: 'Goblin Hexer', hp: 40, atk: 11, def: 2, spd: 12, dodge: .2, parry: 0, brk: 34, xp: 18, gold: 12, trait: 'fire — throws hexed flame from the back row',
    skills: [{ name: 'Ember Hex', hits: [MH('spellcast', 1.2, 700)] }, { name: 'Firestorm Chant', w: .35, hits: [MH('spellcast', .6, 500), MH('spellcast', .6, 300), MH('spellcast', .8, 420)] }] },
  m_skeleton: { name: 'Restless Bones', hp: 52, atk: 12, def: 5, spd: 9, dodge: .05, parry: .25, brk: 46, xp: 20, gold: 10, trait: 'Parries well — break its guard first',
    skills: [{ name: 'Rusted Cut', hits: [MH('slash', 1, 560)] }, { name: 'Bone Rattle', w: .35, hits: [MH('slash', .7, 420), MH('halfslash', .9, 340)] }] },
  m_ghoul: { name: 'Crypt Ghoul', hp: 60, atk: 12, def: 3, spd: 10, dodge: .1, parry: 0, brk: 44, xp: 22, gold: 9, regen: .06, trait: 'Regenerates every turn — finish it fast',
    skills: [{ name: 'Rake', hits: [MH('slash', 1, 520)] }, { name: 'Gorge', w: .35, hits: [MH('thrust', 1.5, 820, 1)] }] },
  m_tusker: { name: 'Tusker Brute', hp: 78, atk: 14, def: 4, spd: 8, dodge: .02, parry: .05, brk: 60, xp: 24, gold: 10, trait: 'earth — slow, but every hit lands like a cart',
    skills: [{ name: 'Gore', hits: [MH('thrust', 1.2, 700)] }, { name: 'Stampede', w: .35, hits: [MH('slash', 1.8, 980, 1)] }] },
  // ---- C
  m_lizard: { name: 'Marsh Lizardman', hp: 84, atk: 15, def: 5, spd: 13, dodge: .2, parry: .2, brk: 60, xp: 32, gold: 16, trait: 'water — spear reach, triple thrusts',
    skills: [{ name: 'Spear Jab', hits: [MH('thrust', 1, 480)] }, { name: 'Tidal Lunge', w: .4, hits: [MH('thrust', .7, 420), MH('thrust', .7, 240), MH('thrust', .9, 300)] }] },
  m_orc: { name: 'Orc Raider', hp: 100, atk: 16, def: 7, spd: 10, dodge: .05, parry: .2, brk: 70, xp: 36, gold: 22, shield: 1, trait: 'Iron plate soaks the first big hit',
    skills: [{ name: 'Cleaver', hits: [MH('slash', 1.1, 600)] }, { name: 'War Stomp', w: .35, hits: [MH('slash', 1.6, 900, 1)] }] },
  m_troll: { name: 'Bog Troll', hp: 140, atk: 16, def: 5, spd: 7, dodge: 0, parry: .05, brk: 90, xp: 40, gold: 18, regen: .07, size: 1.2, trait: 'Regenerates 7% each turn',
    skills: [{ name: 'Club Fist', hits: [MH('slash', 1.2, 760)] }, { name: 'Belly Flop', w: .3, hits: [MH('jump', 2, 1100, 1)] }] },
  // ---- B
  m_minotaur: { name: 'Labyrinth Minotaur', hp: 170, atk: 19, def: 7, spd: 11, dodge: .1, parry: .3, brk: 100, xp: 60, gold: 30, stance: 1, size: 1.25, trait: 'Charging stance — plain attacks get countered',
    skills: [{ name: 'Horn Rush', hits: [MH('thrust', 1.3, 680)] }, { name: 'Labrys Whirl', w: .35, hits: [MH('slash', .8, 500), MH('halfslash', .8, 300), MH('backslash', 1, 400)] }] },
  m_wartotaur: { name: 'Wartotaur', hp: 160, atk: 20, def: 6, spd: 12, dodge: .15, parry: .1, brk: 90, xp: 58, gold: 26, howl: 1, howlName: 'BELLOW', howlKey: 'm_tusker', howlText: 'CHARGES IN', size: 1.2, trait: 'Bellows for its herd when wounded',
    skills: [{ name: 'Tusk Rip', hits: [MH('slash', 1.1, 540), MH('halfslash', .9, 320)] }, { name: 'Earthquake Stomp', w: .3, hits: [MH('jump', 1.9, 1000, 1)] }] },
  m_vampire: { name: 'Pale Count', hp: 150, atk: 18, def: 5, spd: 15, dodge: .3, parry: .15, brk: 80, xp: 62, gold: 40, hunger: 1, trait: 'Drinks mana — Drag Arts HEAL it',
    skills: [{ name: 'Bloodsip', hits: [MH('thrust', 1.1, 520)] }, { name: 'Night Waltz', w: .4, hits: [MH('slash', .6, 420), MH('thrust', .6, 220), MH('slash', .6, 220), MH('thrust', .8, 300)] }] },
  m_drake: { name: 'Ember Drake', hp: 150, atk: 19, def: 6, spd: 13, dodge: .15, parry: .05, brk: 90, xp: 64, gold: 34, size: 1.15, trait: 'fire — breath scorches the whole party',
    skills: [{ name: 'Tail Lash', hits: [MH('slash', 1.1, 560)] }, { name: 'Drake Breath', w: .35, hits: [MH('spellcast', 1.5, 900)] }] },
  // ---- dungeon bosses
  b_goblin_king: { name: 'Gutrot, Goblin King', img: 'm_goblin', boss: 1, size: 1.6, hp: 260, atk: 16, def: 6, spd: 13, dodge: .2, parry: .2, brk: 110, xp: 120, gold: 120,
    howl: 1, howlName: 'TO ME, LADS!', howlKey: 'm_goblin', howlText: 'SCRAMBLES IN', trait: 'Calls his warren when wounded',
    skills: [{ name: 'Crown Smash', hits: [MH('slash', 1.3, 620)] }, { name: 'Dirty Trick', w: .3, hits: [MH('thrust', 1.8, 640, 1)] }, { name: 'Royal Flurry', w: .3, hits: [MH('thrust', .6, 360), MH('thrust', .6, 200), MH('thrust', .6, 200), MH('slash', .9, 360)] }] },
  b_lich: { name: 'Morvane the Bone-Priest', img: 'm_skeleton', boss: 1, size: 1.4, spectral: '#9fe4ff', hp: 330, atk: 18, def: 6, spd: 11, dodge: .1, parry: .3, brk: 120, xp: 170, gold: 160, shield: 3,
    howl: 1, howlName: 'RISE', howlKey: 'm_skeleton', howlText: 'CLAWS OUT OF THE FLOOR', trait: 'Bone wards (3) — raises the dead when wounded',
    skills: [{ name: 'Grave Bolt', hits: [MH('spellcast', 1.3, 720)] }, { name: 'Frost Claw', w: .35, hits: [MH('slash', 1, 480), MH('slash', 1, 300)] }, { name: 'Purging Light', w: .2, hits: [MH('spellcast', 2, 1000, 1)] }] },
  b_troll_mother: { name: 'Old Mother Bogg', img: 'm_troll', boss: 1, size: 1.7, hp: 420, atk: 20, def: 7, spd: 8, dodge: 0, parry: .1, brk: 150, xp: 210, gold: 180, regen: .06,
    howl: 1, howlName: 'CHILDREN!', howlKey: 'm_lizard', howlText: 'SLITHERS OUT OF THE MIRE', trait: 'Regenerates — and her lizard brood answers her',
    skills: [{ name: 'Mire Slam', hits: [MH('slash', 1.3, 780)] }, { name: 'Swallow', w: .25, hits: [MH('thrust', 2.1, 1100, 1)] }, { name: 'Tidal Lunge', w: .25, hits: [MH('thrust', .8, 420), MH('thrust', .8, 300)] }] },
  b_crystal_wyrm: { name: 'The Crystal Wyrm', img: 'm_cavewyrm', boss: 1, size: 1.8, hp: 520, atk: 22, def: 8, spd: 12, dodge: .1, parry: .15, brk: 170, xp: 280, gold: 250, frost: 1, hunger: 1,
    trait: 'Crystal armor (+8 DEF) and drinks Drag mana — break it, then strike with steel',
    skills: [{ name: 'Glacier Rend', hits: [MH('slash', 1.2, 560), MH('halfslash', 1, 340)] }, { name: 'Shard Flare', w: .3, hits: [MH('spellcast', 1.7, 900)] }, { name: 'Avalanche Pounce', w: .2, hits: [MH('jump', 2.2, 1100, 1)] }] }
});
Object.assign(TIER, { m_goblin: 'E', m_ratfolk: 'E', m_gourd: 'E', m_goblin_shaman: 'D', m_skeleton: 'D', m_ghoul: 'D', m_tusker: 'D', m_lizard: 'C', m_orc: 'C', m_troll: 'C',
  m_minotaur: 'B', m_wartotaur: 'B', m_vampire: 'B', m_drake: 'B', b_goblin_king: 'C', b_lich: 'B', b_troll_mother: 'B', b_crystal_wyrm: 'A' });
Object.assign(SKILL_EL, { 'Ember Hex': 'fire', 'Firestorm Chant': 'fire', 'Stampede': 'earth', 'Tidal Lunge': 'water', 'War Stomp': 'earth', 'Earthquake Stomp': 'earth', 'Drake Breath': 'fire', 'Grave Bolt': 'ice', 'Mire Slam': 'water' });
