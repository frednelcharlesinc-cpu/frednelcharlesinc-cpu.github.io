'use strict';
/* ================= BATTLE: CTB timeline + Expedition-33 style reactions ================= */
const ARTS = {
  fang: { name: 'Emerald Fang', strain: 30, mp: 4, desc: 'A blade edge of raw mana — no element, so nothing can resist it. Timed hit ×2.2. Makes your eyes blaze.', type: 'hit', hits: [{ anim: 'slash', m: 2.2, glow: 1 }], blaze: 1, brk: 14 },
  ward: { name: 'Emerald Field', strain: 20, mp: 3, desc: 'An energy field of raw mana. Cuts damage by 60% for 2 turns — 90% against ELEMENTAL attacks, because Drags unmake elements. Makes your eyes blaze.', type: 'buff', blaze: 1 },
  ruin: { name: 'Verdant Ruin', strain: 60, mp: 9, desc: 'The Seven Wardens\' barrage: a storm of raw mana blasts. Hits ALL enemies, 3 timed hits.', type: 'all', hits: [{ anim: 'spellcast', m: .9 }, { anim: 'spellcast', m: .9 }, { anim: 'spellcast', m: 1.3 }], blaze: 1, brk: 10 },
  cleave: { name: 'Forge Cleave', strain: 30, mp: 4, desc: 'Oren\'s two-handed overhead cut. ×2.', type: 'hit', hits: [{ anim: 'backslash', m: 2 }], brk: 12 },
  needle: { name: 'Viper Needle', strain: 30, mp: 4, desc: 'Three fast stabs. Hard to parry.', type: 'hit', hits: [{ anim: 'slash', m: .8 }, { anim: 'slash', m: .8 }, { anim: 'slash', m: 1 }], brk: 8, pierce: 1 },
  wyrm: { name: 'Wyrmpiercer', strain: 40, mp: 5, desc: 'A spear thrust forged to punch through dragon scale. ×2.6, pierces parries.', type: 'hit', hits: [{ anim: 'thrust', m: 2.6 }], brk: 18, pierce: 1 },
  moonstep: { name: 'Moonstep', strain: 25, mp: 3, desc: 'Liora moves like moonlight on water: enemies lose track of her for 2 turns.', type: 'veil' },
  sight: { name: 'Emerald Ascension', strain: 20, mp: 8, desc: 'TRANSFORMATION. Your eyes open all the way and your body stops thinking — it just moves. For 3 turns: dodging and perfect parries become effortless, +40% speed, +30% attack power, every other Art costs 40% less MP, and you see every enemy\'s next move. To awaken it you must either be IN THE FLOW — 5 perfect dodges or parries in a row without being touched (then it costs nothing) — or burn HALF your max MP.', type: 'sight', blaze: 1 },
  azure: { name: 'Azure Tide', strain: 35, mp: 6, desc: 'The blue aura. For 3 turns you move faster, and an Azure orb holds the field: it strikes alongside your Attacks and SWALLOWS enemy magic and aura attacks (up to 3).', type: 'azure', blaze: 1, brk: 6 },
  crimson: { name: 'Crimson Tide', strain: 55, mp: 9, desc: 'The red aura, gathered into a blazing sphere over your palm and hurled across the field — you never leave your spot. One enemy: ×3.2, pierces every defense, hurls them back and delays their turn.', type: 'cast', hits: [{ m: 3.2 }], blaze: 1, brk: 26 },
  horizon: { name: 'Horizon Draw', sword: 1, strain: 35, mp: 7, desc: 'Vane\'s sheathed style. Stillness — then one horizontal draw-cut that flashes past the WHOLE enemy line. The blade is back in its sheath before the cuts land. ×1.6 to all.', type: 'iai', hits: [{ m: 1.6 }], brk: 14 },
  mirage: { name: 'Mirage Step', sword: 1, strain: 50, mp: 9, desc: 'Vanish. Reappear behind them. Cut. Vanish again. Three strikes from three directions, faster than they can turn — each one draws and sheathes the blade.', type: 'blink', hits: [{ m: 1 }, { m: 1 }, { m: 1.4 }], brk: 22 },
  veil: { name: 'Smoke Veil', strain: 25, mp: 3, desc: 'Kess melts into shadow: enemies lose track of her for 2 turns.', type: 'veil' }
};
const LINKS = {
  oren: { name: 'TWIN FANG', mp: [5, 4], desc: 'Link Art with Oren. 4 alternating timed hits.', lines: [['oren', 'Now, {name}! Like I taught you!'], ['me', "Right behind you, Oren!"]], hits: 4, m: 1.15 },
  kess: { name: 'EMERALD ECLIPSE', mp: [6, 4], desc: 'Link Art with Kess. 5 timed hits from light and shadow.', lines: [['kess', "Twelve years I've hidden this fire…"], ['me', '…so let it burn. Together!']], hits: 5, m: 1.2 }
};
// command grid: an icon and an accent colour for every kind of choice
function cmdIcon(label) {
  const L = String(label), k = L.replace(/^[^A-Za-z?◀]+/, '');
  const T = [[/^(Transform|Ascended|Phantom)/, '◉', '#1f9a52'], [/^Attack/, '⚔', '#c8452e'], [/Duel/, '⚔', '#c9962a'], [/^(Drag Arts|Skills)/, '✦', '#2f9a5a'], [/^Link Art/, '❖', '#7a4ab0'], [/^Cultivate/, '☯', '#2f8a7a'],
    [/^Guard/, '⛨', '#2f6a9a'], [/^Items/, '✚', '#2f8a8a'], [/^Flee/, '➜', '#5a6268'], [/^Spare/, '🕊', '#7a8a90'], [/^Veil Tricks/, '🧣', '#a8323a'], [/^Environment/, '✋', '#8a6a3a'],
    [/^Stance/, '⇄', '#4a5a7a'], [/^◀ Back/, '◀', '#3a4a40'], [/^(Tonic|Ether)/, '⚗', '#2f8a8a'], [/^(Strike)/, '⚔', '#c8452e'], [/^(Feint)/, '↯', '#c9962a'], [/^RAGE/, '🔥', '#c8452e'], [/^CALM/, '≈', '#2f6a9a'],
    [/^(Smoke Bomb)/, '☁', '#5a6268'], [/^(Scarf Lash)/, '〰', '#a8323a'], [/^(Knockout)/, '✊', '#a8323a'], [/^(Kick|Topple|Dive|Shake)/, '✋', '#8a6a3a'], [/^\?\?\?/, '?', '#3a3a50']];
  const SHORT = { 'Sheathed': 'Sheath', 'Drag Arts': 'Arts', 'Veil Tricks': 'Veil', 'Environment': 'Terrain', 'Duel Exchange': 'Duel', 'Spare them': 'Spare', 'Link Art': 'Link' };
  let disp = (k || L).replace(/^⚔\s*/, '').replace(/^◀\s*/, '').replace(/^Stance:\s*/, '').replace(/\s*[◐◑]?\s*⇄\s*$/, ''); disp = SHORT[disp] || disp;
  for (const [re, ic, cc] of T) if (re.test(k) || re.test(L)) return [ic, cc, disp];
  return ['✧', '#2f7a52', disp];
}
const BT_SCALE = 1.5; // fighters stand close to the camera so you can see them clearly
const ENEMY = {
  lupine: { name: 'Ashen Lupine', hp: 38, atk: 10, def: 2, spd: 12, dodge: .2, parry: 0, brk: 40, xp: 14, gold: 6,
    skills: [{ name: 'Claw', hits: [{ anim: 'slash', m: 1, w: 560 }] }, { name: 'Frenzy', w: .5, hits: [{ anim: 'slash', m: .55, w: 480 }, { anim: 'halfslash', m: .55, w: 300 }, { anim: 'slash', m: .7, w: 380 }] }] },
  lupine_alpha: { name: 'Lupine Alpha', howl: 1, trait: 'Pack leader — howls for help when wounded', hp: 82, atk: 13, def: 3, spd: 13, dodge: .25, parry: .05, brk: 60, xp: 34, gold: 14,
    skills: [{ name: 'Rending Claw', hits: [{ anim: 'slash', m: 1.1, w: 520 }, { anim: 'halfslash', m: .9, w: 340 }] }, { name: 'Howl Pounce', w: .4, hits: [{ anim: 'jump', m: 1.8, w: 760, unp: 1 }] }] },
  bandit: { name: 'Bandit', hp: 40, atk: 10, def: 2, spd: 11, dodge: .2, parry: .05, brk: 36, xp: 12, gold: 10,
    skills: [{ name: 'Stab', hits: [{ anim: 'thrust', m: 1, w: 520 }] }, { name: 'Twin Cut', w: .45, hits: [{ anim: 'slash', m: .7, w: 460 }, { anim: 'slash', m: .7, w: 280 }] }] },
  rook: { name: 'Rook', blind: 1, trait: 'Dirty fighter — blinding sand shrinks your timing', hp: 70, atk: 11, def: 3, spd: 14, dodge: .3, parry: .1, brk: 50, xp: 28, gold: 22,
    skills: [{ name: 'Twin Stab', hits: [{ anim: 'thrust', m: .75, w: 480 }, { anim: 'thrust', m: .75, w: 260 }] }, { name: 'Feint', w: .45, hits: [{ anim: 'slash', m: 1.3, w: 980 }] }, { name: 'Dirt in the Eyes', w: .3, hits: [{ anim: 'slash', m: 1.5, w: 560, unp: 1 }] }] },
  acolyte: { name: 'Acolyte', trait: 'Channels faith into the Inquisitor', hp: 50, atk: 11, def: 4, spd: 10, dodge: .05, parry: .25, brk: 44, xp: 16, gold: 9,
    skills: [{ name: 'Ember Verdict', hits: [{ anim: 'slash', m: 1, w: 560 }] }, { name: 'Litany of Blades', w: .5, hits: [{ anim: 'slash', m: .6, w: 520 }, { anim: 'halfslash', m: .6, w: 320 }, { anim: 'backslash', m: .8, w: 420 }] }] },
  voss: { name: 'Captain Voss', shield: 3, trait: 'Phalanx — shields soak big hits; many small hits break them', hp: 125, atk: 12, def: 5, spd: 10, dodge: .05, parry: .35, brk: 70, xp: 40, gold: 0,
    skills: [{ name: 'Spear Thrust', hits: [{ anim: 'thrust', m: 1.1, w: 560 }] }, { name: 'Phalanx', w: .45, hits: [{ anim: 'thrust', m: .7, w: 500 }, { anim: 'thrust', m: .7, w: 300 }, { anim: 'thrust', m: .9, w: 520 }] }, { name: 'Shield Rush', w: .3, hits: [{ anim: 'run', m: 1.6, w: 700, unp: 1 }] }] },
  halvard: { name: 'Inquisitor Halvard', faith: 1, trait: 'Shielded by faith while an Acolyte lives', hp: 280, atk: 14, def: 5, spd: 11, dodge: .08, parry: .25, brk: 90, xp: 90, gold: 60, boss: 1,
    skills: [{ name: 'Judgment', hits: [{ anim: 'thrust', m: .8, w: 520 }, { anim: 'thrust', m: .8, w: 300 }, { anim: 'thrust', m: 1.1, w: 460 }] },
      { name: 'Radiant Lance', hits: [{ anim: 'spellcast', m: 1.4, w: 640 }] }, { name: 'Binding Psalm', psalm: 1 }, { name: 'Purging Light', w: 0, hits: [{ anim: 'spellcast', m: 2.4, w: 1100, unp: 1 }] }] },
  kairo_spar: { name: 'Kairo', drag: 1, hp: 80, atk: 7, def: 3, spd: 13, dodge: .15, parry: .15, brk: 50, xp: 20, gold: 0, img: 'kairo_kid',
    skills: [{ name: 'Quick Draw', hits: [{ anim: 'slash', m: 1, w: 560 }] }, { name: 'Twin Cut', w: .45, hits: [{ anim: 'slash', m: .6, w: 520 }, { anim: 'slash', m: .6, w: 320 }] }, { name: 'Show-off Leap', w: .25, hits: [{ anim: 'jump', m: 1.1, w: 760, unp: 1 }] }] },
  kairo_duel: { name: 'Kairo', trait: 'Scar Bloom — adapts to whatever hurts him', drag: 1, hp: 260,
    morph: { at: .55, turns: 4, name: 'SCAR BLOOM', lines: ['Kairo: "…You want to see what the fire left me?"', 'His scars split open. Something underneath them is MOVING.', 'Black scale. Claws. A crown of burning spines. It is still Kairo — and it isn\'t.'],
      hint: 'He adapts to anything that hurts him. Each attack works ONCE — change it up!', end: ['The scales crack and fall away like ash.', 'Kairo: "…Hah… it never… lasts…"'] }, atk: 14, def: 5, spd: 15, dodge: .25, parry: .25, brk: 85, xp: 70, gold: 0, img: 'kairo_b', boss: 1,
    skills: [{ name: 'Eclipse Edge', hits: [{ anim: 'slash', m: .7, w: 520 }, { anim: 'slash', m: .7, w: 300 }, { anim: 'slash', m: .9, w: 420 }] }, { name: 'Lightning Draw', w: .35, hits: [{ anim: 'slash', m: 1.4, w: 340 }] },
      { name: 'Shard Flare', w: .25, hits: [{ anim: 'spellcast', m: 2, w: 1000, unp: 1 }] }] },
  dread: { name: 'Dread', fixed: 1, trait: 'Something you cannot beat. Yet.', drag: 1, hp: 99999, atk: 20, def: 99, spd: 8, dodge: 0, parry: .7, brk: 99999, xp: 0, gold: 0, size: 1.5,
    skills: [{ name: 'Gravecleaver', hits: [{ anim: 'slash', m: 1.3, w: 900 }] }, { name: 'Grave Thrust', w: .4, hits: [{ anim: 'thrust', m: 1.1, w: 700 }, { anim: 'slash', m: .9, w: 380 }] }, { name: 'Black Sun Arc', w: .25, hits: [{ anim: 'slash', m: 1.6, w: 1000, unp: 1 }] }] },
  rime_lupine: { name: 'Rime Lupine', hp: 46, atk: 12, def: 3, spd: 13, dodge: .22, parry: 0, brk: 44, xp: 18, gold: 4,
    skills: [{ name: 'Frost Claw', hits: [{ anim: 'slash', m: 1, w: 520 }] }, { name: 'Whiteout Frenzy', w: .45, hits: [{ anim: 'slash', m: .55, w: 440 }, { anim: 'halfslash', m: .55, w: 280 }, { anim: 'slash', m: .7, w: 360 }] }] },
  rime_alpha: { name: 'Rime Alpha', frost: 1, trait: 'Frost armor (+8 DEF) — Cast or a BREAK shatters it', hp: 120, atk: 15, def: 4, spd: 13, dodge: .25, parry: .05, brk: 70, xp: 50, gold: 12, size: 1.3,
    skills: [{ name: 'Glacier Rend', hits: [{ anim: 'slash', m: 1.1, w: 500 }, { anim: 'halfslash', m: .9, w: 320 }] }, { name: 'Avalanche Pounce', w: .35, hits: [{ anim: 'jump', m: 1.9, w: 800, unp: 1 }] }] },
  mana_wyrm: { name: 'Mana Wyrm', hunger: 1, trait: 'Drinks raw mana — Drag Arts HEAL it', hp: 58, atk: 13, def: 3, spd: 11, dodge: .12, parry: .1, brk: 50, xp: 24, gold: 8,
    skills: [{ name: 'Tail Lash', hits: [{ anim: 'slash', m: 1, w: 560 }] }, { name: 'Mana Breath', w: .4, hits: [{ anim: 'spellcast', m: 1.5, w: 900, unp: 1 }] }] },
  vane_spar: { name: 'The Old Man', fixed: 1, hp: 9999, atk: 5, def: 40, spd: 15, dodge: .45, parry: .55, brk: 9999, xp: 0, gold: 0, img: 'vane',
    skills: [{ name: 'Tap', hits: [{ anim: 'slash', m: .6, w: 480 }] }, { name: 'Three Snowflakes', w: .5, hits: [{ anim: 'slash', m: .4, w: 420 }, { anim: 'slash', m: .4, w: 260 }, { anim: 'slash', m: .4, w: 260 }] }] },
  vane: { name: 'Vane, the Sword Saint', stance: 1, trait: 'Empty Sleeve — in stance, plain attacks get countered', hp: 320, atk: 15, def: 6, spd: 16, dodge: .25, parry: .4, brk: 100, xp: 120, gold: 0, boss: 1,
    skills: [{ name: 'Snow Sever', hits: [{ anim: 'slash', m: 1.3, w: 320 }] }, { name: 'Thousand Flakes', w: .4, hits: [{ anim: 'slash', m: .45, w: 460 }, { anim: 'slash', m: .45, w: 230 }, { anim: 'slash', m: .45, w: 230 }, { anim: 'slash', m: .45, w: 300 }, { anim: 'slash', m: .7, w: 260 }] },
      { name: 'The Empty Sleeve', w: .3, hits: [{ anim: 'slash', m: 1.2, w: 1150 }] }, { name: 'Last Light', w: .15, hits: [{ anim: 'slash', m: 2.2, w: 900, unp: 1 }] }] },
  halvard_pro: { name: 'Inquisitor Halvard', fixed: 1, hp: 9999, atk: 16, def: 40, spd: 11, dodge: .5, parry: .5, brk: 9999, xp: 0, gold: 0, img: 'halvard',
    skills: [{ name: 'Judgment', hits: [{ anim: 'thrust', m: .8, w: 520 }, { anim: 'thrust', m: .8, w: 320 }] }, { name: 'Radiant Lance', hits: [{ anim: 'spellcast', m: 1.3, w: 620 }] }] },
};
const TIER = { lupine: 'E', bandit: 'E', kairo_spar: 'E', acolyte: 'D', rook: 'D', lupine_alpha: 'D', rime_lupine: 'D', voss: 'C', mana_wyrm: 'C', rime_alpha: 'C',
  halvard: 'B', halvard_pro: 'B', kairo_duel: 'A', vane: 'S', vane_spar: 'S', dread: 'S' };
const TIER_COL = { E: '#9aa3a0', D: '#7fc97f', C: '#6ab4ff', B: '#c58cff', A: '#ffb347', S: '#ff5a5a' };
const ELEM = { fire: ['Fire', '#ff7a3a'], water: ['Water', '#4aa8ff'], ice: ['Ice', '#9fe4ff'], lightning: ['Lightning', '#ffe14a'], earth: ['Earth', '#c79a5a'], wind: ['Wind', '#bfe8d0'], light: ['Light', '#fff3b0'], mana: ['Raw Mana', '#46ff95'], shadow: ['Shadow', '#b08aff'] };
// which enemy techniques carry an element (everyone uses elements — except Drags, who move raw mana)
const SKILL_EL = { 'Ember Verdict': 'fire', 'Radiant Lance': 'light', 'Purging Light': 'light', 'Shield Rush': 'earth', 'Dirt in the Eyes': 'earth', 'Frost Claw': 'ice', 'Whiteout Frenzy': 'ice',
  'Avalanche Pounce': 'ice', 'Glacier Rend': 'ice', 'Mana Breath': 'lightning', 'Snow Sever': 'wind', 'Thousand Flakes': 'wind', 'Shard Flare': 'mana', 'Black Sun Arc': 'mana', 'Howl Pounce': 'wind' };
const elOf = sk => SKILL_EL[sk.name];
Object.assign(ENEMY, {
  will_verdict: { name: 'Will of the Pale Verdict', hp: 150, atk: 14, def: 4, spd: 12, dodge: .1, parry: .3, brk: 70, xp: 40, gold: 0, img: 'halvard', spectral: '#fff3b0', boss: 1, trait: 'Made to burn Drags — its light seals your Arts',
    skills: [{ name: 'Judgment', hits: [{ anim: 'thrust', m: .8, w: 500 }, { anim: 'thrust', m: .8, w: 300 }] }, { name: 'Radiant Lance', hits: [{ anim: 'spellcast', m: 1.4, w: 620 }] }, { name: 'Binding Psalm', w: .25, psalm: 1 }] },
  will_river: { name: 'Will of Riverheart', hp: 170, atk: 12, def: 5, spd: 11, dodge: .3, parry: .2, brk: 80, xp: 40, gold: 0, img: 'mei', spectral: '#7fd8ff', boss: 1, patience: 1, trait: 'It respects patience — Guard or Cultivate first, then strike',
    skills: [{ name: 'Undertow', hits: [{ anim: 'slash', m: 1, w: 560 }] }, { name: 'Flood', w: .35, hits: [{ anim: 'spellcast', m: 1.3, w: 800 }] }] },
  stone_hunter: { name: 'Registry Hunter', hp: 62, atk: 12, def: 4, spd: 12, dodge: .2, parry: .2, brk: 50, xp: 30, gold: 22, img: 'hunter', trait: 'Crown Registry — Seal Lock silences your stones',
    skills: [{ name: 'Spear Thrust', hits: [{ anim: 'thrust', m: 1, w: 520 }] }, { name: 'Seal Lock', w: .25, seal: 1 }, { name: 'Pinning Strike', w: .3, hits: [{ anim: 'thrust', m: .7, w: 460 }, { anim: 'thrust', m: .8, w: 300 }] }] }
});
/* ---------- things that fly: arrows, bolts, knives, hatchets, stones, spells — and Vane's leaves ---------- */
const PROJ = {
  arrow: { ms: 430, arc: 14, sfx: 'bowshot' }, bolt: { ms: 330, arc: 4, sfx: 'bowshot' }, knife: { ms: 420, arc: 10, spin: 1, sfx: 'throw' }, axe: { ms: 540, arc: 22, spin: 1, sfx: 'throw' },
  stone: { ms: 480, arc: 26, sfx: 'throw' }, seed: { ms: 420, arc: 18, sfx: 'throw' }, spear: { ms: 470, arc: 16, sfx: 'throw' },
  fire: { ms: 560, col: '255,120,40', orb: 1, sfx: 'chant' }, light: { ms: 440, col: '255,240,170', orb: 1, sfx: 'light' }, water: { ms: 560, col: '90,170,255', orb: 1, sfx: 'chant' },
  ice: { ms: 500, col: '170,235,255', orb: 1, sfx: 'chant' }, lightning: { ms: 300, col: '255,230,80', orb: 1, sfx: 'chant' }, mana: { ms: 520, col: '90,255,150', orb: 1, sfx: 'chant' },
  shadow: { ms: 520, col: '176,138,255', orb: 1, sfx: 'chant' }, wind: { ms: 380, col: '200,255,225', orb: 1, sfx: 'throw' }, earth: { ms: 500, arc: 20, sfx: 'throw' },
  leaf: { ms: 1150, arc: -18, leaf: 1, sfx: 'throw' }
};
const projKind = h => h.proj || (h.anim === 'spellcast' ? (h.el && PROJ[h.el] ? h.el : 'mana') : null);
function projPos(p, u) { const k = PROJ[p.proj] || {}, arc = p.arc ?? (k.arc || 0); let x = lerp(p.x0, p.x1, u), y = lerp(p.y0, p.y1, u) - arc * 4 * u * (1 - u); if (k.leaf) { x += Math.sin(u * 9) * 7; y += Math.sin(u * 13) * 3; } return [x, y, Math.atan2((p.y1 - p.y0) - arc * 4 * (1 - 2 * u), p.x1 - p.x0)]; }
function paintProj(c, kind, x, y, ang, now, sc) {
  const k = PROJ[kind] || {}; sc = (sc || 1) * (k.leaf ? 1.7 : 1.15);
  c.save(); c.translate(x, y);
  if (k.orb) { c.globalCompositeOperation = 'lighter'; const r = 9 * sc, g = c.createRadialGradient(0, 0, 0, 0, 0, r * 1.9); g.addColorStop(0, 'rgba(255,255,255,.95)'); g.addColorStop(.35, `rgba(${k.col},.85)`); g.addColorStop(1, `rgba(${k.col},0)`); c.fillStyle = g; c.beginPath(); c.arc(0, 0, r * 1.9, 0, 7); c.fill();
    if (kind === 'ice') { c.rotate(ang); c.fillStyle = 'rgba(220,250,255,.95)'; c.beginPath(); c.moveTo(12 * sc, 0); c.lineTo(-4 * sc, -4 * sc); c.lineTo(-10 * sc, 0); c.lineTo(-4 * sc, 4 * sc); c.fill(); }
    if (kind === 'lightning') { c.strokeStyle = 'rgba(255,250,200,.9)'; c.lineWidth = 1.5; c.beginPath(); for (let i = 0; i < 4; i++) { const a = now / 30 + i * 1.7; c.moveTo(0, 0); c.lineTo(Math.cos(a) * 14 * sc, Math.sin(a) * 14 * sc); } c.stroke(); }
    c.restore(); return; }
  c.rotate(k.spin ? now / 45 : k.leaf ? Math.sin(now / 110) * 1.1 : ang); c.scale(sc, sc); c.lineCap = 'round';
  if (kind === 'arrow') { c.strokeStyle = '#6b4a2a'; c.lineWidth = 2; c.beginPath(); c.moveTo(-15, 0); c.lineTo(9, 0); c.stroke(); c.fillStyle = '#c8ccd4'; c.beginPath(); c.moveTo(14, 0); c.lineTo(8, -3); c.lineTo(8, 3); c.fill(); c.fillStyle = '#e8f0e8'; c.beginPath(); c.moveTo(-15, 0); c.lineTo(-19, -3.5); c.lineTo(-12, 0); c.lineTo(-19, 3.5); c.fill(); }
  else if (kind === 'bolt') { c.strokeStyle = '#3a2a1c'; c.lineWidth = 3; c.beginPath(); c.moveTo(-9, 0); c.lineTo(6, 0); c.stroke(); c.fillStyle = '#9aa0a8'; c.beginPath(); c.moveTo(11, 0); c.lineTo(5, -3.5); c.lineTo(5, 3.5); c.fill(); }
  else if (kind === 'knife') { c.fillStyle = '#dfe4ea'; c.beginPath(); c.moveTo(10, 0); c.lineTo(0, -2.2); c.lineTo(0, 2.2); c.fill(); c.fillStyle = '#2a1e18'; c.fillRect(-6, -1.5, 6, 3); }
  else if (kind === 'axe') { c.strokeStyle = '#5a3c22'; c.lineWidth = 2.4; c.beginPath(); c.moveTo(-9, 0); c.lineTo(8, 0); c.stroke(); c.fillStyle = '#b8bcc4'; c.beginPath(); c.moveTo(5, -1); c.quadraticCurveTo(13, -9, 10, 0); c.quadraticCurveTo(13, 9, 5, 1); c.fill(); }
  else if (kind === 'spear') { c.strokeStyle = '#6b4a2a'; c.lineWidth = 2; c.beginPath(); c.moveTo(-22, 0); c.lineTo(10, 0); c.stroke(); c.fillStyle = '#cfd4dc'; c.beginPath(); c.moveTo(17, 0); c.lineTo(9, -3); c.lineTo(9, 3); c.fill(); }
  else if (kind === 'leaf') { c.fillStyle = '#c9a24a'; c.beginPath(); c.moveTo(-9, 0); c.quadraticCurveTo(0, -7, 9, 0); c.quadraticCurveTo(0, 7, -9, 0); c.fill(); c.strokeStyle = '#7a5a22'; c.lineWidth = .8; c.beginPath(); c.moveTo(-9, 0); c.lineTo(9, 0); c.stroke(); }
  else { c.fillStyle = kind === 'seed' ? '#6a8a3a' : '#8a8478'; c.beginPath(); c.arc(0, 0, 3.6, 0, 7); c.fill(); c.fillStyle = 'rgba(255,255,255,.35)'; c.beginPath(); c.arc(-1, -1, 1.3, 0, 7); c.fill(); }
  c.restore();
}
const ALLY = {
  oren: { name: 'Oren', drag: 1, sprite: 'oren', color: '#a8592a', hp: 70, mp: 14, atk: 12, def: 5, spd: 9, arts: ['cleave'] },
  liora: { name: 'Liora', drag: 1, sprite: 'liora', color: '#b23a5a', hp: 72, mp: 20, atk: 17, def: 5, spd: 17, arts: ['wyrm', 'moonstep'], atkAnim: 'thrust' },
  kess: { name: 'Kess', drag: 1, sprite: 'kess_bt', color: '#7a4aa6', hp: 46, mp: 18, atk: 10, def: 3, spd: 14, arts: ['needle', 'veil'] }
};
const ALLY_SPRITE = { oren: 'oren', kess: 'kess_eyes', liora: 'liora_e' };

function tinted(img, col) {
  img._t = img._t || {}; if (img._t[col]) return img._t[col];
  const c2 = document.createElement('canvas'); c2.width = img.width; c2.height = img.height; const x = c2.getContext('2d');
  x.drawImage(img, 0, 0); x.globalCompositeOperation = 'source-atop'; x.fillStyle = col; x.fillRect(0, 0, c2.width, c2.height);
  return (img._t[col] = c2);
}
// Gravecleaver: Dread's greatsword — longer than a man is tall, a jagged dragon-tooth edge, a vein of Drag stone down the middle
function paintGreatsword(c, px, py, ang, s, t) {
  c.save(); c.translate(px, py); c.rotate(ang); c.scale(s, s);
  const L = 74;
  c.fillStyle = '#2a1e18'; c.fillRect(-15, -1.6, 15, 3.2); c.fillStyle = '#5a4434'; for (let i = -14; i < 0; i += 3) c.fillRect(i, -1.6, 1, 3.2);
  c.strokeStyle = '#3a3a44'; c.lineWidth = 1.4; c.beginPath(); c.arc(-17, 0, 2.4, 0, 7); c.stroke();
  c.fillStyle = '#24242c'; c.beginPath(); c.moveTo(0, -10); c.lineTo(3, -4); c.lineTo(3, 4); c.lineTo(0, 10); c.lineTo(-2, 7); c.lineTo(-1, 0); c.lineTo(-2, -7); c.closePath(); c.fill();
  c.fillStyle = '#121218'; c.beginPath(); c.moveTo(3, -6); c.lineTo(L - 8, -5.2); c.lineTo(L, -1.5);
  for (let x = L - 6; x > 4; x -= 6) { c.lineTo(x, 5.6); c.lineTo(x - 3, 3.8); }
  c.lineTo(3, 6); c.closePath(); c.fill();
  c.strokeStyle = '#8a92a8'; c.lineWidth = .8; c.beginPath(); c.moveTo(3, -6); c.lineTo(L - 8, -5.2); c.lineTo(L, -1.5); c.stroke();
  c.save(); c.globalCompositeOperation = 'lighter'; const pulse = .55 + Math.sin((t || 0) / 260) * .25;
  c.strokeStyle = `rgba(80,255,150,${pulse})`; c.lineWidth = 1.4; c.beginPath(); c.moveTo(6, 0); c.lineTo(L - 14, -.6); c.stroke();
  c.strokeStyle = `rgba(80,255,150,${pulse * .3})`; c.lineWidth = 4; c.stroke();
  c.fillStyle = '#3cff8a'; c.beginPath(); c.arc(1, 0, 1.6, 0, 7); c.fill(); c.restore();
  c.restore();
}
function dreadSwordAngle(anim, fr) {
  if (anim === 'slash' || anim === 'halfslash' || anim === 'backslash') return -2.5 + fr / 5 * 3.3;
  if (anim === 'thrust') return .05; if (anim === 'spellcast') return -1.57 - Math.sin(fr) * .1; if (anim === 'hurt') return 1.3; if (anim === 'run' || anim === 'walk') return .35;
  return -2.15;
}
const SRC_NAME = s => s === 'attack' ? 'Attack' : s === 'link' ? 'Link Arts' : s === 'counter' ? 'Counters' : (ARTS[s] ? ARTS[s].name : s);
/* extra feint rings — each closes in its own rhythm. p(k) maps time (0..1) to how far the ring has closed (1 = impact). */
const RING_STYLE = {
  double: { label: 'DOUBLE FEINT', col: '#b07aff', len: 1, pause: 520, p: (k, el, dur) => { const b = dur - 520, x = el < b * .35 ? el : el < b * .35 + 260 ? b * .35 : el < b * .65 + 260 ? el - 260 : el < b * .65 + 520 ? b * .65 : el - 520; return x / b; } },
  stutter: { label: 'STUTTER', col: '#4ae0ff', len: 1.15, p: k => k < .45 ? k * 1.4 : k < .6 ? .63 - (k - .45) / .15 * .23 : .4 + (k - .6) / .4 * .6 },
  delay: { label: 'DELAYED', col: '#ffd84a', len: 1.3, p: k => k * k * k },
  fakeout: { label: 'FAKE-OUT', col: '#7dff7a', len: 1.35, p: k => k < .45 ? k / .45 * .9 : k < .6 ? .9 - (k - .45) / .15 * .45 : .45 + (k - .6) / .4 * .55 }
};
const FEINTS = ['double', 'stutter', 'delay', 'fakeout'];
const Battle = {
  B: null,
  // Drag reflex: Drag bodies move more efficiently — wider timing windows. The Verdant Eye widens them further.
  reflex(a) { if (!a || a.side !== 'p') return 1; let k = (a.blind ? .6 : 1) * Skills.reflex(a.isMe ? 'me' : a.id); if (a.isMe || (ALLY[a.id] && ALLY[a.id].drag)) k *= 1.25; if (a.sight) k *= 2.4; return k; },
  chooseSkill(e) { const pool = e.E.skills.filter(s => s.hits); let r = Math.random(), sk = pool[0]; for (const s of pool.slice(1)) { if (r < (s.w || .3)) { sk = s; break; } r -= (s.w || .3); } return sk; },
  async start(cfg) {
    if (typeof cfg === 'string') cfg = { enemies: [cfg] };
    const prevMode = G.mode; G.mode = 'battle'; G.view.mode = 'battle'; setView('battle'); Dlg.close(); UI.controls(false); $('#hud').classList.add('hide'); $('#hudR').classList.add('hide');
    const bdKey = cfg.bd || (SCENES[G.S.map] && SCENES[G.S.map].bd) || 'field';
    G.img['bd_' + bdKey] = G.img['bd_' + bdKey] || await loadImg('assets/bd_' + bdKey + '.jpg?v=2');
    const B = this.B = { cfg, bd: G.img['bd_' + bdKey], actors: [], fx: [], texts: [], rings: [], st: { perf: 0, pp: 0, pd: 0, hurt: 0 }, flash: 0, shake: 0, dim: 0, dimCol: '0,0,0', timeScale: 1,
      blazed: false, over: null, turn: 0, tutorial: cfg.tutorial ? { dodge: 1, parry: 1, hit: 1 } : null, log: [], press: [] };
    // party
    const W = G.view.w;
    const pSlots = cfg.slots || [[W - 210, 205], [W - 172, 262], [W - 248, 150]];
    const eSlots = [[210, 210], [156, 262], [256, 152], [130, 160]];
    const S = G.S.stats;
    const SB = Stones.bonus(); B.sb = SB;
    B.actors.push(this.mk({ side: 'p', id: 'me', name: G.S.name, color: '#1f8a4c', isMe: true, hp: S.hp, maxHp: S.maxHp, mp: S.mp, maxMp: S.maxMp, atk: S.atk + SB.atk, def: S.def + SB.def, spd: S.spd, arts: G.S.arts, slot: pSlots[0], strainMax: 100 + SB.cap }));
    const allies = cfg.allies || G.S.party;
    for (let i = 0; i < allies.length; i++) {
      const id = allies[i], A = ALLY[id], st = G.S.allies[id] || {};
      const lv = G.S.lvl - 1;
      const maxHp = A.hp + lv * 7 + Skills.allyBonus(id).hp, maxMp = A.mp + lv * 2;
      B.actors.push(this.mk({ side: 'p', id, name: A.name, color: A.color, atkAnim: A.atkAnim, img: await npcImg(A.sprite), hp: st.hp ?? maxHp, maxHp, mp: st.mp ?? maxMp, maxMp,
        atk: A.atk + lv * 2 + Skills.allyBonus(id).atk, def: A.def + lv + Skills.allyBonus(id).def, spd: A.spd + Skills.allyBonus(id).spd, arts: A.arts, slot: pSlots[i + 1] }));
    }
    cfg.enemies.forEach((k, i) => {
      const E = ENEMY[k]; const sc = cfg.scale || 1;
      B.actors.push(this.mk({ side: 'e', id: k + i, key: k, name: E.name + (cfg.enemies.filter(x => x === k).length > 1 ? ' ' + 'ABCD'[i] : ''), hp: Math.round(E.hp * sc * (E.fixed ? 1 : E.boss ? 1.4 : 1.3)), maxHp: Math.round(E.hp * sc * (E.fixed ? 1 : E.boss ? 1.4 : 1.3)),
        mp: 0, maxMp: 0, atk: Math.round(E.atk * (E.fixed ? 1 : 1.18)), def: E.def + (E.frost ? 8 : 0), shield: E.shield || 0, frostOn: !!E.frost, spd: E.spd, dodge: E.dodge, parry: E.parry, brkMax: E.brk, E, slot: eSlots[i], spr: E.img || k, size: E.size || 1 }));
    });
    for (const a of B.actors) if (a.side === 'e') { a.img = await npcImg(a.spr); if (a.key !== 'halvard') a.next = this.chooseSkill(a); }
    B.actors.forEach(a => { a.wait = 100 / a.spd * rnd(0.6, 1.0); });
    B.actors.filter(a => a.side === 'p').forEach(a => a.wait *= 0.7);
    Music.play(cfg.music || (cfg.boss ? 'boss' : 'battle'));
    this.ui(true); this.hud();
    sfx('start'); B.flash = 1;
    await this.msg(cfg.intro || (B.actors.filter(a => a.side === 'e').length > 1 ? 'Enemies appear!' : B.actors.find(a => a.side === 'e').name + ' attacks!'), 1300);
    const result = await this.run();
    // write back
    const me = this.me();
    S.hp = Math.max(1, me.hp); S.mp = me.mp;
    for (const a of B.actors) if (a.side === 'p' && !a.isMe && G.S.party.includes(a.id)) G.S.allies[a.id] = { hp: Math.max(1, a.hp), mp: a.mp };
    if (B.blazed && !Veil.on()) { G.S.hood = false; if (cfg.witness) Story.addSus(cfg.witness); }
    if (result === 'win' && Story.rankCheck) setTimeout(() => Story.rankCheck(), 50);
    this.ui(false);
    G.mode = prevMode === 'battle' ? 'world' : 'world'; UI.controls(true); UI.hud();
    if (World.scene && World.scene.music) Music.play(typeof World.scene.music === 'function' ? World.scene.music() : World.scene.music);
    this.B = null;
    return result;
  },
  mk(o) { return Object.assign({ strain: 0, strainMax: 100, fever: 0, ko: false, anim: 'combat', frame: 0, at: 0, loopAnim: 'combat', x: o.slot[0], y: o.slot[1], hx: o.slot[0], hy: o.slot[1], ward: 0, guard: false, brk: 0, broken: 0, veil: 0, bind: 0, alpha: 1 }, o); },
  me() { return this.B ? this.B.actors.find(a => a.isMe) : null; },
  alive(side) { if (!this.B) return []; return this.B.actors.filter(a => a.side === side && !a.ko); },
  ui(on) {
    $('#bui').classList.toggle('hide', !on);
    ['#bcmd', '#react', '#cmdDesc', '#hitTap', '#tgtHint'].forEach(s => $(s).classList.add('hide'));
  },
  hud() {
    const B = this.B; if (!B) return;
    $('#bparty').innerHTML = B.actors.filter(a => a.side === 'p').map(a => `<div class="pcard ${a === B.cur ? 'act' : ''} ${a.ko ? 'ko' : ''}" style="--c:${a.color}">
      <div class="nm"><span>${esc(a.name)}</span>${a.ward ? '<span>🛡</span>' : ''}</div>
      <div class="row"><span class="ic h"></span><i><b style="width:${a.hp / a.maxHp * 100}%"></b></i><span>${a.hp}/${a.maxHp}</span></div>
      <div class="row mp"><span class="ic m"></span><i><b style="width:${a.maxMp ? a.mp / a.maxMp * 100 : 0}%"></b></i><span>${a.mp}/${a.maxMp}</span></div>
      <div class="row st ${a.fever ? 'fev' : ''}"><span class="ic s">⚡</span><i><b style="width:${Math.min(100, a.strain / a.strainMax * 100)}%"></b></i><span>${a.fever ? 'FEVER' : Math.round(a.strain) + '%'}</span></div></div>`).join('');
    // timeline
    const order = this.preview(7), tl = $('#timeline'); tl.innerHTML = '';
    for (const a of order) {
      const d = document.createElement('div'); d.className = 'tl ' + (a.side === 'e' ? 'en' : 'pl');
      const c = document.createElement('canvas'); c.width = 32; c.height = 36;
      if (a.isMe) playerPortrait(c, 'neutral'); else portraitTo(c, a.img, 'neutral', false);
      d.appendChild(c); tl.appendChild(d);
    }
  },
  preview(n) {
    const sim = this.B.actors.filter(a => !a.ko).map(a => ({ a, w: a.wait })); const out = [];
    for (let i = 0; i < n && sim.length; i++) { sim.sort((x, y) => x.w - y.w); const s = sim[0]; out.push(s.a); s.w += 100 / s.a.spd; }
    return out;
  },
  async run() {
    const B = this.B;
    while (true) {
      const live = B.actors.filter(a => !a.ko); live.sort((a, b) => a.wait - b.wait);
      const cur = live[0]; const base = cur.wait; live.forEach(a => a.wait -= base);
      B.cur = cur; B.turn++; this.hud();
      if (B.cfg.onTurn) { const r = await B.cfg.onTurn(B, this); if (r === 'skip') { cur.wait += 100 / cur.spd; continue; } if (r) return r; }
      if (cur.broken) { cur.broken--; await this.text(cur, 'STUNNED', '#ffd34a'); cur.wait += 100 / cur.spd; if (!cur.broken) { cur.brk = 0; } continue; }
      if (cur.ward) cur.ward--; if (cur.veil) cur.veil--; if (cur.drawn) cur.drawn--; if (cur.blind) cur.blind--; cur.guard = false;
      if (cur.side === 'p') { cur.calm = cur.calmNext || 0; cur.calmNext = 0; const r = await this.playerTurn(cur); if (r) return r; }
      else await this.enemyTurn(cur);
      cur.wait += 100 / cur.spd * (cur.delay || 1); cur.delay = 1;
      await this.adaptTick();
      for (const e of B.actors) if (e.pendMorph && !e.morphed && !e.ko) { e.pendMorph = 0; await this.morph(e); }
      this.hud();
      if (!this.alive('e').length) return await this.victory();
      if (!this.alive('p').filter(a => a.isMe).length || !this.alive('p').length) { await this.msg('Your vision fades to black…', 1600); return 'lose'; }
    }
  },
  // ---------------- player turn ----------------
  playerTurn(a) {
    return new Promise(resolve => {
      const B = this.B; a.mp = Math.min(a.maxMp, a.mp + 1 + (a.isMe ? B.sb.mp : 0));
      a.strain = Math.max(0, a.strain - (12 + (a.isMe ? B.sb.cool + (Skills.has('me', 't3') ? 4 : 0) : 0)));
      if (a.sight) { a.sight--; if (!a.sight) { a.spd -= a.sightSpd || 0; a.atk -= a.sightAtk || 0; a.sightSpd = a.sightAtk = 0; this.text(a, 'Ascension fades — your body feels heavy again', '#7fbf9a', -30); } }
      if (a.azure) { a.azure--; if (!a.azure) { a.spd = a.baseSpd || a.spd; if (B.orb && B.orb.owner === a) { B.orb = null; this.text(a, 'The Azure orb dissolves', '#5fd8ff', -30); } } }
      if (a.fever) { a.fever--; const d = Math.max(1, Math.round(a.maxHp * .06)); a.hp = Math.max(1, a.hp - d); this.text(a, 'BLOOD FEVER -' + d, '#ff5a3a', -20); if (!a.fever) a.strain = Math.min(a.strain, 50); }
      this.hud();
      const partner = B.actors.find(x => x.side === 'p' && !x.isMe && !x.ko && LINKS[x.id]);
      const menu = () => {
        const L = [['Attack', 'Two timed strikes. Tap as the ring closes for a PERFECT.', () => this.pickTarget(a, t => this.doAttack(a, t).then(done))]];
        L.push([a.isMe ? 'Drag Arts' : 'Skills', a.isMe ? 'Drag Arts and sword techniques. Drag Arts make your eyes blaze; Vane\'s sword techniques don\'t.' : 'Special techniques.', () => sub()]);
        if (a.isMe && partner && !B.cfg.noArts) {
          const Lk = LINKS[partner.id], ok = a.mp >= Lk.mp[0] && partner.mp >= Lk.mp[1] && !a.fever && !partner.fever && a.strain + 40 <= a.strainMax && partner.strain + 40 <= partner.strainMax;
          L.push(['Link Art', `${Lk.name}: ${Lk.desc} (${G.S.name} ${Lk.mp[0]} MP + ${partner.name} ${Lk.mp[1]} MP · Strain +40 each)`, () => ok ? this.pickTarget(a, t => this.doLink(a, partner, t).then(done)) : toast('Not enough MP — or your blood is running too hot.'), !ok]);
        }
        if (a.isMe && G.S.f.cultivation) L.push(['Cultivate', 'Tomb Breath: drink the mana in the air. +5 MP, cool your blood (Strain -40), and your next strike is a guaranteed PERFECT.', () => { const g = 5 + (World.scene && World.scene.realm ? 3 : 0); a.mp = Math.min(a.maxMp, a.mp + g); a.focus = 1; a.calmNext = 1; a.strain = Math.max(0, a.strain - 40); sfx('heal'); this.spark(a.x, a.y - 30, '#46ff95', 22); this.text(a, '+' + g + ' MP · FOCUS', '#46ff95'); this.hud(); done(); }]);
        L.push(['Guard', 'Halve damage until your next turn, recover 3 MP and steady your blood (Strain -30).', () => { a.guard = true; a.calmNext = 1; a.mp = Math.min(a.maxMp, a.mp + 3); a.strain = Math.max(0, a.strain - 30); this.text(a, 'GUARD', '#9ad1ff'); this.hud(); done(); }]);
        L.push([`Items`, `Tonic ×${G.S.items.tonic}  ·  Ether ×${G.S.items.ether}`, () => items()]);
        if (a.isMe && !B.cfg.noFlee) L.push(['Flee', 'Try to escape (70%).', async () => { this.closeMenu(); if (Math.random() < 0.7) { await this.msg('You slip away!', 900); resolve('flee'); } else { await this.msg("Can't escape!", 900); done(); } }]);
        if (typeof CombatX !== 'undefined') try { CombatX.menu(a, L, done, resolve, menu); } catch (e) { console.warn(e); }
        this.openMenu(L, null);
      };
      const sub = () => {
        const L = a.arts.filter(k => !(a.isMe && k === 'sight')).map(k => { const A = ARTS[k], cost = this.artCost(a, k), st = this.artStrain(a, k), hot = a.fever || a.strain + st > a.strainMax;
          if (B.cfg.noArts && a.isMe && !A.sword) return [A.name, 'Proving Bouts rules: no Drag Arts. One blaze of your eyes and the whole Guild sees what you are.', () => {}, true, cost];
          return [A.name, A.desc + `  ⚡ Strain +${st}` + (hot ? (a.fever ? '  — BLOOD FEVER: your arts are locked.' : '  — too hot! Guard or Cultivate to cool down.') : '') + (a.isMe && Stones.artBoost(k) > 1 ? `  ◆ Stone-boosted ×${Stones.artBoost(k).toFixed(2)}` : '') + (k === 'sight' && a.isMe ? `  ◉ Flow ${Math.min(5, a.flow || 0)}/5${(a.flow || 0) >= 5 ? ' — FREE' : ''}` : ''), () => this.useArt(a, k).then(done), a.mp < cost || hot || (k === 'sight' && a.sight), cost]; });
        if (a.isMe && a.arts.includes('azure') && a.arts.includes('crimson')) L.push(['??? Eclipse Convergence', B.orb ? 'Blue holds the field. Red strains to answer it through the orb — the two currents pull toward each other until your bones ache. Your body cannot bear it. Not yet. (End-game technique)' : 'An ultimate that needs setup: Azure Tide\'s orb must hold the field before Crimson can be called THROUGH it. You can feel its shape. You cannot touch it yet. (End-game technique)', () => {}, true]);
        L.push(['◀ Back', 'Return.', menu]); this.openMenu(L, true);
      };
      const items = () => {
        const L = [];
        L.push([`Tonic ×${G.S.items.tonic}`, 'Restore 45% HP to one ally.', () => this.pickAlly(t => { G.S.items.tonic--; const h = Math.round(t.maxHp * .45); t.hp = Math.min(t.maxHp, t.hp + h); sfx('heal'); this.text(t, '+' + h, '#7dffb0'); this.hud(); done(); }), G.S.items.tonic <= 0]);
        L.push([`Ether ×${G.S.items.ether}`, 'Restore 12 MP to one ally.', () => this.pickAlly(t => { G.S.items.ether--; t.mp = Math.min(t.maxMp, t.mp + 12); sfx('heal'); this.text(t, '+12 MP', '#9ad1ff'); this.hud(); done(); }), G.S.items.ether <= 0]);
        L.push(['◀ Back', 'Return.', menu]); this.openMenu(L, false);
      };
      const done = () => { this.closeMenu(); resolve(null); };
      menu();
    });
  },
  openMenu(L, showCost) {
    const box = $('#cmdList'); box.innerHTML = ''; this.menuL = L; this.menuSel = 0;
    $('#bcmd').classList.remove('hide'); $('#cmdDesc').classList.remove('hide');
    L.forEach((it, i) => {
      const b = document.createElement('button'); const [ic, cc, lb] = cmdIcon(it[0]); b.style.setProperty('--cc', cc);
      b.innerHTML = `<span class="ic">${ic}</span><span class="lb">${esc(lb)}</span>` + (it[4] !== undefined ? `<small>${it[4]} MP</small>` : '');
      b.disabled = !!it[3];
      b.addEventListener('pointerenter', () => this.sel(i));
      bindTap(b, () => { if (it[3]) return; sfx('blip'); this.sel(i); it[2](); });
      box.appendChild(b);
    });
    this.sel(0);
  },
  sel(i) {
    this.menuSel = i; const L = this.menuL; if (!L) return;
    $$('#cmdList button').forEach((b, k) => b.classList.toggle('sel', k === i));
    $('#cmdDesc .scroll').textContent = L[i][1]; const tip = $('#cmdTipT'); if (tip) tip.textContent = L[i][1];
    const c = $('#cmdCost'); c.classList.toggle('on', L[i][4] !== undefined); if (L[i][4] !== undefined) c.textContent = L[i][4] + ' MP';
  },
  closeMenu() { $('#bcmd').classList.add('hide'); $('#cmdDesc').classList.add('hide'); this.menuL = null; },
  menuKey(dir) { if (!this.menuL) return false; const n = this.menuL.length; this.sel((this.menuSel + (dir === 'up' ? -1 : 1) + n) % n); sfx('blip'); return true; },
  menuA() { if (!this.menuL) return false; const it = this.menuL[this.menuSel]; if (!it[3]) { sfx('blip'); it[2](); } return true; },
  pickTarget(a, cb) {
    const B = this.B; const es = this.alive('e'); if (es.length === 1) { this.closeMenu(); cb(es[0]); return; }
    this.closeMenu(); B.targeting = { list: es, i: 0, cb, side: 'e' }; $('#tgtHint').classList.remove('hide');
  },
  pickAlly(cb) {
    const B = this.B; const ps = B.actors.filter(x => x.side === 'p' && !x.ko);
    if (ps.length === 1) { this.closeMenu(); cb(ps[0]); return; }
    this.closeMenu(); B.targeting = { list: ps, i: 0, cb, side: 'p' }; $('#tgtHint').classList.remove('hide');
  },
  confirmTarget() { const T = this.B.targeting; if (!T) return false; this.B.targeting = null; $('#tgtHint').classList.add('hide'); sfx('blip'); T.cb(T.list[T.i]); return true; },
  tapAt(x, y) {
    const B = this.B; if (!B) return;
    if (B.targeting) {
      const T = B.targeting; let best = -1, bd = 1e9;
      T.list.forEach((a, i) => { const d = Math.hypot(a.x - x, a.y - 30 - y); if (d < bd) { bd = d; best = i; } });
      if (best >= 0 && bd < 70) { if (T.i === best) this.confirmTarget(); else { T.i = best; sfx('blip'); } }
    }
  },
  // ---------------- timed hits (player attacking) ----------------
  // the timing bar: a line sweeps up and down; land it in the green window (gold core = PERFECT).
  // Stronger opponents make it sweep faster and shrink the window.
  async qte(target, dur, color, who) {
    const B = this.B; who = who || B.cur;
    const rk = this.reflex(who) * (who && who.isMe && Skills.has('me', 'b2') ? 1.25 : 1);
    const ti = Math.max(0, ['E', 'D', 'C', 'B', 'A', 'S', 'SS', 'SSS', 'SSSS'].indexOf(TIER[target.key] || 'E'));
    const tut = B.tutorial && B.tutorial.hit;
    if (tut) { B.tutorial.hit = 0; await this.msg('Tap when the moving line is inside the GREEN window. The gold core is a PERFECT!', 2000, true); }
    const speed = (.75 + ti * .2) * (tut ? .55 : 1);
    const half = Math.min(.3, Math.max(.045, (.15 - ti * .012) * rk)), phalf = half * .34;
    const center = .25 + Math.random() * .5;
    const bar = { x: G.view.w * .5, y: G.view.h * .31, h: Math.min(170, G.view.w * .3), center, half, phalf, t0: performance.now(), speed, color: color || '#ffd34a', done: false };
    bar.pos = () => { const ph = ((performance.now() - bar.t0) / 1000 * speed) % 2; return ph < 1 ? ph : 2 - ph; };
    bar.inPerfect = () => Math.abs(bar.pos() - center) < phalf * .7;
    B.bar = bar; $('#hitTap').classList.remove('hide');
    const res = await new Promise(r => {
      let done = false; const prevA = Input.handlers.a, hit = $('#hitTap');
      const fin = v => { if (done) return; done = true; bar.done = true; bar.res = v; bar.at = bar.pos(); Input.on('a', prevA); hit.removeEventListener('pointerdown', h); r(v); };
      const judge = () => { const d = Math.abs(bar.pos() - center); fin(d <= phalf ? 'perfect' : d <= half ? 'good' : 'miss'); };
      const h = e => { e.preventDefault(); judge(); };
      hit.addEventListener('pointerdown', h); Input.on('a', judge);
      const maxT = 2.25 / speed * 1000; const ck = () => { if (done) return; if (performance.now() - bar.t0 > maxT) fin('miss'); else requestAnimationFrame(ck); }; ck();
    });
    await wait(170); B.bar = null; $('#hitTap').classList.add('hide'); B.timeScale = 1;
    return res;
  },
  // power rank of any fighter: 0 = E … 8 = SSSS
  rankOf(a) { const G8 = ['E', 'D', 'C', 'B', 'A', 'S', 'SS', 'SSS', 'SSSS']; if (a.side === 'p') return (a.isMe || G.S.party.includes(a.id)) ? Power.now().i : 2; return Math.max(0, G8.indexOf(TIER[a.key] || 'E')); },
  // the DASH: crouch, kick off the ground, fly at them, land. Higher rank = faster, higher, flashier.
  async dash(a, x, y, ms) {
    const B = this.B, fx = a.x, fy = a.y, d = Math.hypot(x - fx, y - fy); if (d < 2) return;
    const r = this.rankOf(a), drag = a.isMe || (ALLY[a.id] && ALLY[a.id].drag) || a.key === 'dread';
    const col = drag && r >= 3 ? '#7dffb0' : r >= 7 ? '#ff6a8a' : r >= 5 ? '#ffd36a' : r >= 3 ? '#9fd8ff' : '#ffffff';
    const dur = Math.max(r >= 7 ? 110 : 150, Math.min(520, d / (.6 + r * .35))), s = BT_SCALE * (a.size || 1), dir = Math.sign(x - fx) || 1;
    const H = 12 + r * 3, LEAN = dir * (.12 + r * .025), img = a.isMe ? playerImg() : a.img;
    // crouch
    a.loopAnim = 'jump'; a.anim = 'jump'; a.frame = 0; a.fn = 99; a.fms = 1e9; a.once = true; await wait(Math.max(40, 110 - r * 10));
    // kick off: dust, a shock ring on the ground, a crack of sound
    a.frame = 2; this.spark(fx, fy - 2, '#c8bca8', 6 + r * 2); B.fx.push({ kick: 1, x: fx, y: fy, t: 0, life: 260 + r * 30, col: r >= 4 ? col : '#d8ccb8', R: 14 + r * 4 }); sfx(r >= 4 ? 'dodge' : 'blip');
    if (r >= 4) a.aura = col; if (r >= 6) B.flash = Math.max(B.flash || 0, .1);
    if (r >= 3) B.fx.push({ dline: 1, x1: fx, y1: y - 30 - H * .8, x2: x, y2: y - 30 - H * .8, col, w: 1 + r * .35, t: 0, life: 200 + r * 40 });
    const ghosts = r < 2 ? 2 : r < 5 ? 4 : r < 7 ? 6 : 8; let g = 0; const t0 = performance.now();
    while (true) {
      const k = Math.min(1, (performance.now() - t0) / dur), e = k < .5 ? 2 * k * k : 1 - Math.pow(-2 * k + 2, 2) / 2;
      a.x = lerp(fx, x, e); a.y = lerp(fy, y, e);
      a.lift = H * Math.sin(Math.PI * Math.min(1, k * 1.15)); a.lean = LEAN * Math.sin(Math.PI * k); a.frame = k < .8 ? 2 : 4;
      if (img && g < ghosts && k >= g / ghosts) { B.fx.push({ ghost: 1, x: a.x, y: a.y - a.lift, t: 0, life: 150 + r * 35, img, anim: 'jump', fr: 2, s, flip: a.flip, col, a0: r >= 3 ? .5 : .28 }); g++; }
      if (k >= 1) break; await wait(16);
    }
    // land
    a.lift = 0; a.lean = 0; a.aura = null; this.spark(x, y - 2, '#c8bca8', 3 + r);
    if (r >= 5) B.fx.push({ blinkIn: 1, x, y: y - 28, t: 0, life: 220, col });
    a.once = false; a.loopAnim = 'combat'; a.anim = 'combat'; a.frame = 0; a.fn = 2; a.fms = 400; },
  async home(a) { await this.dash(a, a.hx, a.hy, 260); },
  play(a, anim, n, ms) { if (a.isMe && !G.S.kid && /slash|thrust/.test(anim)) { anim = 'slash'; n = 6; } a.anim = anim; a.frame = 0; a.at = 0; a.fn = n; a.fms = ms; a.once = true; return wait(n * ms); },
  async strike(a, t, hit, mult, opts) {
    // windup then QTE then impact
    a.anim = a.isMe && !G.S.kid && /slash|thrust/.test(hit.anim) ? 'slash' : hit.anim; a.frame = 0; a.once = true; a.fn = 99; a.fms = 1e9; a.glow = !!hit.glow;
    let g; if (opts.auto) g = 'good'; else if (a.focus) { a.focus = 0; g = await this.qte(t, 0, 0, a); g = 'perfect'; } else g = await this.qte(t, 0, 0, a);
    this.play(a, hit.anim, { slash: 6, halfslash: 6, backslash: 13, spellcast: 7, thrust: 8, jump: 5, run: 8 }[hit.anim] || 6, hit.anim === 'backslash' ? 45 : 70);
    a.frame = hit.anim === 'backslash' ? 4 : 2;
    sfx('swing');
    return this.resolveHit(a, t, hit.m * mult, g, opts);
  },
  resolveHit(a, t, m, grade, opts) {
    const B = this.B; if (t.ko) return 'ko';
    if (a.side === 'p' && grade === 'perfect' && !(opts && opts.src === 'counter')) B.st.perf++;
    this.text(a, grade === 'perfect' ? 'PERFECT!' : grade === 'good' ? 'GOOD' : 'MISS', grade === 'perfect' ? '#ffd34a' : grade === 'good' ? '#c9f7d6' : '#999', -40);
    sfx(grade === 'perfect' ? 'perfect' : grade === 'good' ? 'good' : 'miss');
    // enemy defense (they can dodge/parry you unless PERFECT)
    if (t.side === 'e' && grade !== 'perfect' && !t.broken && !t.drawn && !opts.unblockable) {
      const r = Math.random(), dk = (grade === 'miss' ? 1.6 : 1) * (t.E.drag ? 1.3 : 1);
      if (r < t.dodge * dk) { this.text(t, t.E.drag ? 'DRAG REFLEX' : 'DODGED', '#9ad1ff'); sfx('dodge'); this.hop(t); return 'dodged'; }
      if (r < (t.dodge + t.parry) * dk && !opts.pierce) { this.text(t, 'PARRIED', '#ffe36a'); sfx('parry'); this.spark(t.x + 10, t.y - 34, '#fff3a0', 10);
        if (t.E.drag && a.side === 'p' && Math.random() < .4) { this.text(t, 'RIPOSTE!', '#ff9a5a', -16, true); this.chip(t, a, .45, true); }
        return 'parried'; }
    }
    if (t.veil && t.side === 'p') { this.text(t, 'MISSED', '#9ad1ff'); return 'dodged'; }
    if (t.side === 'e' && t.E.hunger && opts.src && (ARTS[opts.src] || opts.src === 'link')) { // raw mana feeds it
      const h = Math.max(4, Math.round(a.atk * m * .8)); t.hp = Math.min(t.maxHp, t.hp + h); this.text(t, 'ABSORBED +' + h, '#46ff95', 0, true); this.spark(t.x, t.y - 30, '#46ff95', 18); sfx('heal'); this.hud(); return 'absorbed'; }
    if (t.side === 'e' && t.stance && opts.src === 'attack') { this.text(t, 'EMPTY SLEEVE', '#cfe8ff', -10, true); sfx('parry'); t.stanceHit = 1; return 'parried'; }
    if (t.side === 'e' && t.stance && opts.src && opts.src !== 'attack') { t.stance = 0; this.text(t, 'STANCE BROKEN', '#ffd34a', -24, true); }
    if (t.side === 'e' && t.frostOn && (opts.src === 'crimson' || t.broken)) { t.frostOn = false; t.def -= 8; this.text(t, 'FROST ARMOR SHATTERED', '#9fe4ff', -34, true); sfx('break'); this.spark(t.x, t.y - 30, '#cfefff', 30); }
    let dmg = Math.max(1, Math.round((a.atk * m) * (grade === 'perfect' ? (a.isMe && Skills.has('me', 'b4') ? 1.8 : 1.5) : grade === 'good' ? 1 : 0.6) * rnd(.9, 1.1) - t.def * (t.broken ? 0 : 1)));
    if (t.broken) dmg = Math.round(dmg * 1.5);
    if (t.guard) dmg = Math.ceil(dmg / 2);
    if (t.ward) dmg = Math.ceil(dmg * .4);
    if (t.side === 'e' && t.E.patience && a.side === 'p') { if (a.calm) { dmg = Math.round(dmg * 1.3); this.text(t, 'PATIENT STRIKE', '#7fd8ff', -30); } else { dmg = Math.ceil(dmg * .3); this.text(t, 'IMPATIENT', '#7fd8ff', -30); } }
    if (t.side === 'e' && t.E.faith && this.alive('e').some(x => x.key === 'acolyte')) { dmg = Math.ceil(dmg * .5); this.text(t, 'FAITH WARD', '#fff3b0', -30); }
    if (t.side === 'e' && t.shield > 0 && !opts.pierce) { dmg = Math.ceil(dmg * .2); t.shield--; this.text(t, t.shield ? 'SHIELD ' + '▮'.repeat(t.shield) : 'PHALANX BROKEN!', t.shield ? '#cfd8e8' : '#ffd34a', -30, !t.shield); sfx(t.shield ? 'parry' : 'break'); if (!t.shield) { t.brk += 25; } }
    if (t.morph > 0 && opts.src) { const n = t.adapt[opts.src] || 0; if (n) { dmg = Math.max(1, Math.round(dmg * [1, .35, .1][Math.min(n, 2)])); this.text(t, 'ADAPTED', '#ff8a6a', -30); } t.pendAdapt = t.pendAdapt || new Set(); t.pendAdapt.add(opts.src); }
    this.damage(t, dmg, grade === 'perfect');
    if (t.side === 'e' && !t.ko) { t.brk += (grade === 'perfect' ? 12 : grade === 'good' ? 6 : 2) + (opts.brk || 0); this.checkBreak(t); }
    return 'hit';
  },
  // the painted face pops in at the edge of the screen: hurt, power, shout
  faceOf(a) { if (a.isMe) return 'me'; if (a.side === 'p') return a.id; if (a.key === 'kairo_duel') return 'kairoB'; const gr = typeof GE_RIVAL !== 'undefined' && GE_RIVAL[a.key]; if (gr) return Art.port[gr] ? gr : null; const b = (a.key || '').split('_')[0]; return Art.port[ART_ID[b] || b] ? b : null; },
  facePop(a, exprs) {
    const who = this.faceOf(a); if (!who) return; const e = exprs.find(x => artHas(who, x)); if (!e) return;
    const now = performance.now(); if (now - (this.lastPop || 0) < 1300) return; this.lastPop = now;
    let el = $('#facePop'); if (!el) { el = document.createElement('div'); el.id = 'facePop'; el.innerHTML = '<canvas></canvas>'; document.body.appendChild(el); }
    const left = a.side === 'p'; drawPortrait(el.firstChild, who, e, left ? 1 : -1);
    el.className = left ? 'l' : 'r'; void el.offsetWidth; el.classList.add('on');
    clearTimeout(this.popT); this.popT = setTimeout(() => el.classList.remove('on'), 1050);
  },
  damage(t, dmg, big) {
    if (t.side === 'p' && dmg > 0 && this.B && this.B.st) this.B.st.hurt += dmg;
    if (t.isMe && dmg > 0) t.flow = 0;
    const M = t.E && t.E.morph;
    t.hp = Math.max(M && !t.exhausted ? 1 : 0, t.hp - dmg); if (M && !t.morphed && t.hp < t.maxHp * M.at) t.pendMorph = 1;
    this.text(t, String(dmg), t.side === 'e' ? '#fff' : '#ff8080', 0, big); if (t.side === 'p' && t.hp > 0 && dmg >= t.maxHp * .18) this.facePop(t, ['hurt']);
    sfx(big ? 'crit' : 'hit'); this.B.shake = big ? 9 : 5; t.hurtT = 220; this.spark(t.x, t.y - 30, big ? '#ffe36a' : '#fff', big ? 16 : 9);
    if (t.hp <= 0 && !t.ko) { t.ko = true; t.anim = 'hurt'; t.once = true; t.frame = 0; t.fn = 6; t.fms = 90; t.at = 0; t.loopAnim = 'hurt'; this.text(t, t.side === 'e' ? 'DEFEATED' : 'DOWN', '#ff6b6b', -20); }
    this.hud();
  },
  checkBreak(t) { if (t.brk >= t.brkMax && !t.broken) { t.broken = 1; t.brk = t.brkMax; sfx('break'); this.text(t, 'BREAK!', '#ffd34a', -24, true); this.B.flash = .6; t.wait += 100 / t.spd; } },
  hop(t) { const x0 = t.x, d = t.side === 'e' ? -26 : 26; let k = 0; const it = setInterval(() => { k++; t.x = x0 + Math.sin(k / 8 * Math.PI) * d; if (k >= 8) { clearInterval(it); t.x = x0; } }, 22); },
  async doAttack(a, t) {
    const B = this.B; await this.dash(a, t.x + (a.side === 'p' ? 52 : -52), t.y + 2, 260);
    const seq = a.atkAnim ? [{ anim: a.atkAnim, m: .8 }, { anim: a.atkAnim, m: .9 }] : [{ anim: 'slash', m: .75 }, { anim: a.isMe ? 'slash' : 'halfslash', m: .85 }];
    let parried = 0;
    for (const h of seq) { if (t.ko) break; const r = await this.strike(a, t, h, 1, { src: 'attack' }); if (r === 'parried') parried++; await wait(160); }
    a.glow = false;
    if (B.orb && B.orb.owner === a && !t.ko) { B.fx.push({ beam: 1, blue: 1, x1: B.orb.x, y1: B.orb.y, x2: t.x, y2: t.y - 30, t: 0, life: 380 }); sfx('art'); this.spark(t.x, t.y - 30, '#5fd8ff', 18); this.text(t, 'AZURE ORB', '#5fd8ff', -50); this.resolveHit(a, t, .7, 'good', { unblockable: 1, src: 'azure' }); await wait(200); }
    if (t.stanceHit) { t.stanceHit = 0; t.stance = 0; await this.msg(`${t.name}: "Too eager, pup."`, 1000); await this.enemyStrike(t, a, { name: 'Empty Sleeve', hits: [{ anim: 'slash', m: 1.6, w: 420 }] }, true); await this.home(a); return; }
    if (parried === seq.length && !t.ko) { await this.msg(`${t.name} reads every blow — COUNTER!`, 900); await this.enemyStrike(t, a, { name: 'Counter', hits: [{ anim: t.E.skills[0].hits[0].anim, m: 1.2, w: 520 }] }, true); }
    await this.home(a);
  },
  async useArt(a, k) {
    const B = this.B, A = ARTS[k], cost = this.artCost(a, k), boost = (a.isMe ? Stones.artBoost(k) : 1) * Skills.artMul(a.isMe ? 'me' : a.id, k);
    this.closeMenu(); a.mp -= cost; a.strain += this.artStrain(a, k);
    if (!['sight', 'cast'].includes(A.type)) this.facePop(a, A.sword ? ['focused', 'power', 'shout'] : ['power', 'shout']);
    if (a.strain >= a.strainMax * .9 && !a.fever) { a.fever = 2; B.flash = .4; this.text(a, 'BLOOD FEVER!', '#ff5a3a', -60, true); sfx('alarm'); }
    if (a.isMe && B.sb.verdict) { const d = Math.max(1, Math.round(a.maxHp * .04)); a.hp = Math.max(1, a.hp - d); this.text(a, 'VERDICT -' + d, '#fff3b0', -70); }
    this.hud();
    if (A.blaze && a.isMe && !A.sword) { if (!B.blazed) { B.blazed = true; if (Veil.on()) { if (!G.S.f.veilDrag) G.S.f.veilDrag = 1; this.text(a, 'Green fire behind the red scarf!', '#ff8a8a', -50); } else if (G.S.hood) { G.S.hood = false; this.text(a, 'Hood burns back!', '#46ff95', -50); } } }
    B.dim = .55; B.dimCol = a.isMe ? '10,40,20' : '30,10,40'; sfx('art');
    await this.msg(A.name, 700);
    if (A.type === 'buff') { await this.play(a, 'spellcast', 7, 80); a.ward = 3; this.spark(a.x, a.y - 30, '#46ff95', 26); this.text(a, 'EMERALD FIELD', '#46ff95'); B.fx.push({ field: 1, x: a.x, y: a.y - 30, t: 0, life: 900 }); }
    else if (A.type === 'veil') { await this.play(a, 'spellcast', 7, 70); a.veil = 3; a.alpha = .45; this.text(a, 'VEILED', '#c9a6ff'); }
    else if (A.type === 'hit') {
      await new Promise(r => this.pickTarget(a, r)).then(async t => {
        await this.dash(a, t.x + 52, t.y + 2, 240);
        for (const h of A.hits) { if (t.ko) break; await this.strike(a, t, h, boost, { brk: A.brk || 0, pierce: A.pierce, unblockable: a.isMe, src: k }); if (h.glow) this.spark(t.x, t.y - 30, '#46ff95', 30); await wait(140); }
        a.glow = false; await this.home(a);
      });
    } else if (A.type === 'iai') {
      // HORIZON DRAW: stillness, one flash across the whole line, sheathe — then the cuts land
      const es = await this.aoePick(a), y0 = a.y, x0 = a.x; B.dim = .7; B.dimCol = '0,0,0'; if (!es.length) return;
      a.anim = 'combat'; this.text(a, '…', '#ffffff', -46); await wait(550);
      const g = await this.qte(es[0], 0, '#ffffff', a);
      const far = Math.min(...es.map(t => t.x)) - 70, ly = es.reduce((m, t) => m + t.y, 0) / es.length - 34;
      sfx('swing'); this.play(a, 'slash', 6, 28); B.fx.push({ hline: 1, x1: x0 - 10, x2: far, y: ly, t: 0, life: 650 });
      for (let i = 1; i <= 4; i++) B.fx.push({ ghost: 1, x: lerp(x0, far, i / 5), y: y0, t: 0, life: 380 + i * 40, img: playerImg(), anim: 'slash', fr: 3, s: BT_SCALE });
      await this.slide(a, far, y0, 120); a.flip = true; a.anim = 'combat';
      await wait(380); sfx('parry'); this.text(a, '— click —', '#cfe8ff', -50);
      await wait(260);
      for (const t of es) { B.flash = .35; this.spark(t.x, ly, '#ffffff', 22); this.resolveHit(a, t, A.hits[0].m * boost, g, { brk: A.brk, unblockable: g === 'perfect' ? 1 : 0, src: k }); await wait(110); }
      await wait(300); await this.dash(a, a.hx, a.hy, 300); a.flip = false;
    } else if (A.type === 'blink') {
      // MIRAGE STEP: vanish, strike from behind, vanish, strike from the front, vanish, strike from above
      const t = await new Promise(r => this.pickTarget(a, r)); B.dim = .55; B.dimCol = '0,20,10';
      const g = await this.qte(t, 0, '#7dffb0', a);
      const spots = [[t.x - 52, t.y + 2, true], [t.x + 52, t.y + 4, false], [t.x - 8, t.y - 8, false]];
      for (let i = 0; i < 3 && !t.ko; i++) {
        B.fx.push({ ghost: 1, x: a.x, y: a.y, t: 0, life: 420, img: playerImg(), anim: a.anim, fr: 0, s: BT_SCALE, flip: a.flip });
        this.spark(a.x, a.y - 30, '#7dffb0', 10); a.alpha = 0; sfx('dodge'); await wait(110);
        a.x = spots[i][0]; a.y = spots[i][1]; a.flip = spots[i][2]; a.alpha = 1; B.fx.push({ blinkIn: 1, x: a.x, y: a.y - 30, t: 0, life: 260 });
        this.play(a, 'slash', 6, 32); sfx('swing'); await wait(90);
        this.resolveHit(a, t, A.hits[i].m * boost, i === 0 ? g : (g === 'miss' ? 'miss' : 'good'), { brk: A.brk / 3, unblockable: g === 'perfect' ? 1 : 0, src: k });
        this.spark(t.x, t.y - 34, '#ffffff', 14); await wait(230);
      }
      B.fx.push({ ghost: 1, x: a.x, y: a.y, t: 0, life: 400, img: playerImg(), anim: 'combat', fr: 0, s: BT_SCALE, flip: a.flip }); a.alpha = 0; await wait(150);
      a.x = a.hx; a.y = a.hy; a.flip = false; a.alpha = 1; sfx('parry'); this.text(a, '— click —', '#cfe8ff', -50);
    } else if (A.type === 'sight') {
      if (a.isMe && !B.skipSightCine) await Cine.play([{ bg: 'eyes', fx: ['mana'], dur: 1300, fadeIn: 120, tapEnds: true, cam: [[0, 320, 190, 1], [1300, 320, 178, 1.25]], vignette: 'rgba(0,30,10,.7)',
        actors: [{ port: 'me', expr: artHas('me', 'sight') ? 'sight' : 'anger', x: 320, y: 400, scale: 3.4 }], ev: [[650, s => { s.flash = .9; s.flashCol = '90,255,150'; sfx('art'); }]] }]);
      await this.play(a, 'spellcast', 7, 70); const was = a.sight; a.flow = 0; a.sight = 3 + (Skills.has('me', 'e1') ? 1 : 0); B.flash = .8; B.flashCol = '220,255,235'; sfx('art'); B.shake = 8;
      if (!was) { a.sightSpd = a.spd * .4; a.spd += a.sightSpd; a.sightAtk = Math.round(a.atk * .3); a.atk += a.sightAtk; a.wait *= .5; }
      B.fx.push({ burst: 1, x: a.x, y: a.y - 30, t: 0, life: 900 });
      this.spark(a.x - 4, a.y - 50, '#e8fff4', 40); this.text(a, 'EMERALD ASCENSION', '#e8fff4', -50, true); await wait(400);
    } else if (A.type === 'azure') {
      await this.play(a, 'spellcast', 7, 80); sfx('chant');
      a.azure = 3; if (!a.baseSpd) a.baseSpd = a.spd; a.spd = a.baseSpd * 1.45; a.wait *= .6;
      B.orb = { owner: a, x: a.x - 30, y: a.y - 80, charges: 3 + (Skills.has('me', 't1') ? 1 : 0), born: performance.now() };
      this.text(a, 'AZURE TIDE', '#5fd8ff', -40, true); B.fx.push({ orb: 1, kind: 'draw', x: a.x - 30, y: a.y - 70, t: 0, life: 900 });
    } else if (A.type === 'draw') {
      B.dimCol = '0,20,40'; await this.play(a, 'spellcast', 7, 80);
      let es = this.alive('e'); const cx = es.reduce((s, t) => s + t.x, 0) / es.length, cy = es.reduce((s, t) => s + t.y, 0) / es.length;
      B.fx.push({ orb: 1, kind: 'draw', x: cx, y: cy - 30, t: 0, life: 1500 }); sfx('chant');
      await Promise.all(es.map(t => this.slide(t, lerp(t.x, cx, .5), lerp(t.y, cy, .5), 420)));
      for (const h of A.hits) {
        es = this.alive('e'); if (!es.length) break;
        const g = await this.qte(es[0], rnd(480, 620), '#5fd8ff', a); sfx('art'); B.flash = .3;
        for (const t of es) { this.spark(t.x, t.y - 30, '#5fd8ff', 14); this.resolveHit(a, t, h.m * boost, g, { brk: A.brk, unblockable: 1, src: k }); }
        await wait(160);
      }
      for (const t of this.alive('e')) { t.drawn = 2; t.wait += 20; this.text(t, 'DRAWN IN', '#5fd8ff', -24); }
      await wait(350); await Promise.all(this.alive('e').map(t => this.slide(t, t.hx, t.hy, 320)));
    } else if (A.type === 'cast') {
      B.dimCol = '40,0,0';
      const t = await new Promise(r => this.pickTarget(a, r));
      if (a.isMe && k === 'crimson') await Cine.play([{ bg: (c2) => { c2.fillStyle = '#1a0202'; c2.fillRect(-300, -300, 1240, 960); }, fx: ['embers'], dur: 1100, fadeIn: 100, tapEnds: true, cam: [[0, 320, 190, 1.1], [1100, 320, 180, 1.3]], vignette: 'rgba(120,0,0,.8)',
        actors: [{ port: 'me', expr: artHas('me', 'shout') ? 'shout' : 'anger', x: 320, y: 400, scale: 3.4 }], ev: [[500, s => { s.flash = .9; s.flashCol = '255,60,40'; s.shake = 16; sfx('crit'); }]] }]);
      // Ren never moves: he gathers the red aura into a sphere over his palm and hurls it across the field
      a.anim = 'spellcast'; a.frame = 3; a.once = false; a.loopAnim = 'spellcast';
      const sp = { sphere: 1, x: a.x - 34, y: a.y - 46, r: 4, t: 0, life: 99999 }; B.fx.push(sp); sfx('chant');
      for (let i = 0; i < 40; i++) { sp.r = 4 + i * .55; if (i % 6 === 0) this.spark(sp.x + rnd(-30, 30), sp.y + rnd(-30, 30), '#ff5a4a', 2); await wait(16); }
      const g = await this.qte(t, rnd(420, 560), '#ff4a4a', a);
      sfx('crit'); const x0 = sp.x, y0 = sp.y, t1 = performance.now();
      while (true) { const k2 = Math.min(1, (performance.now() - t1) / 340); sp.x = lerp(x0, t.x, k2); sp.y = lerp(y0, t.y - 30, k2) - Math.sin(k2 * Math.PI) * 26; if (k2 >= 1) break; await wait(16); }
      sp.life = 0; a.loopAnim = 'combat'; a.anim = 'combat';
      B.fx.push({ burst: 1, red: 1, x: t.x, y: t.y - 30, t: 0, life: 700 }); B.flash = .6; B.flashCol = '255,60,40'; B.shake = 14;
      this.spark(t.x, t.y - 30, '#ff5a4a', 34);
      this.resolveHit(a, t, A.hits[0].m * boost, g, { brk: A.brk, unblockable: 1, pierce: 1, src: k }); B.tideUsed = 1;
      if (!t.ko) { t.wait += 40; this.text(t, 'HURLED BACK', '#ff6a5a', -24); await this.slide(t, t.hx - 70, t.hy, 160); await wait(220); await this.slide(t, t.hx, t.hy, 320); }
    } else if (A.type === 'all') {
      const pick = this.aoeOk(a) ? null : await new Promise(r => this.pickTarget(a, r));
      await this.play(a, 'spellcast', 7, 90);
      for (const h of A.hits) {
        const es = pick ? (pick.ko ? [] : [pick]) : this.alive('e'); if (!es.length) break;
        const g = await this.qte(es[0], rnd(500, 650), '#46ff95', a);
        sfx('art'); B.flash = .5;
        for (const t of es) { this.pillar(t.x, t.y); this.resolveHit(a, t, h.m * boost, g, { brk: A.brk, unblockable: 1, src: k }); }
        await wait(200);
      }
    }
    B.dim = 0; a.alpha = a.veil ? .45 : 1; this.hud();
  },
  aoeOk(a) { if (a && a.side === 'e') return true; const p = Power.now(); return p.i > 4 || (p.i === 4 && p.band >= 2); },
  async aoePick(a) { if (this.aoeOk(a)) return this.alive('e'); const t = await new Promise(r => this.pickTarget(a, r)); return t ? [t] : []; },
  artCost(a, k) {
    // Emerald Sight: awaken it by flowing — 5 perfect dodges/parries in a row without being touched — or by burning half your MP
    if (k === 'sight' && a.isMe) return (a.flow || 0) >= 5 ? 0 : Math.max(1, Math.ceil(a.maxMp / 2) - (Skills.has('me', 'e2') ? 3 : 0));
    return Math.max(1, Math.round((ARTS[k].mp + (a.bind ? 2 : 0) - (a.isMe ? Stones.artMp(k) + (k === 'sight' && Skills.has('me', 'e2') ? 3 : 0) : 0)) * (a.sight && k !== 'sight' ? .6 : 1))); },
  artStrain(a, k) { return Math.max(5, (ARTS[k].strain || 30) - (a.isMe ? this.B.sb.calm + (Skills.has('me', 't3') ? 8 : 0) : 0)); },
  async summon(key, intro) {
    const B = this.B, E = ENEMY[key], used = B.actors.filter(a => a.side === 'e' && !a.ko).map(a => a.hx);
    const slots = [[210, 210], [156, 262], [256, 152], [130, 160]], sl = slots.find(s2 => !used.includes(s2[0])) || slots[3];
    const a = this.mk({ side: 'e', id: key + B.actors.length, key, name: E.name, hp: Math.round(E.hp * 1.3), maxHp: Math.round(E.hp * 1.3), mp: 0, maxMp: 0, atk: Math.round(E.atk * 1.18), def: E.def, spd: E.spd, dodge: E.dodge, parry: E.parry, brkMax: E.brk, E, slot: sl, spr: E.img || key, size: E.size || 1 });
    a.img = await npcImg(a.spr); a.next = this.chooseSkill(a); a.wait = 30; a.alpha = 0; B.actors.push(a);
    for (let i = 0; i <= 10; i++) { a.alpha = i / 10; await wait(30); } if (intro) this.text(a, intro, '#ffb070', -40, true); this.hud();
  },
  async slide(a, x, y, ms) { const fx = a.x, fy = a.y, t0 = performance.now();
    while (true) { const k = Math.min(1, (performance.now() - t0) / ms), e = 1 - (1 - k) * (1 - k); a.x = lerp(fx, x, e); a.y = lerp(fy, y, e); if (k >= 1) break; await wait(16); } },
  async adaptTick() {
    if (!this.B) return;
    for (const e of this.B.actors) {
      if (!e.pendAdapt || !e.pendAdapt.size) continue;
      if (e.morph > 0 && !e.ko) for (const s of e.pendAdapt) {
        const n = (e.adapt[s] = (e.adapt[s] || 0) + 1); e.wheel = (e.wheel || 0) + 1; sfx('chant'); this.B.shake = 6;
        await this.msg(`The spines turn. ${e.name} ${n >= 2 ? 'has fully adapted to' : 'is adapting to'}: ${SRC_NAME(s)}`, 1250);
      }
      e.pendAdapt.clear();
    }
  },
  async morph(e) {
    const B = this.B, M = e.E.morph; e.morphed = 1; if (e.key === 'kairo_duel') { e.atk = Math.round(e.atk * 1.25); e.spd *= 1.15; this.text(e, 'RANK UP — ' + TIER.kairo_duel, '#ff6a5a', -70, true); } e.adapt = {}; e.tempo = 1; e.wheel = 0; e.wheelAng = 0;
    B.dim = .65; B.dimCol = '45,0,0'; sfx('break'); B.shake = 14;
    for (const l of M.lines) await this.msg(l, 1600);
    B.flash = 1.3; sfx('crit'); e.morph = M.turns; e.size = 1.32; e.atk = Math.round(e.E.atk * 1.3); e.spd = e.E.spd + 3; e.def = e.E.def + 4; e.brk = 0; e.broken = 0;
    this.text(e, M.name, '#ff5a3a', -50, true); await this.msg(M.name, 1200); await this.msg(M.hint, 2000); B.dim = 0;
  },
  async unmorph(e) {
    const B = this.B, M = e.E.morph; B.dim = .5; B.dimCol = '30,10,0';
    for (const l of M.end) await this.msg(l, 1500);
    e.morph = 0; e.size = 1; e.atk = e.E.atk; e.spd = e.E.spd; e.def = 0; e.broken = 2; e.brk = e.brkMax; e.exhausted = 1;
    this.text(e, 'BURNED OUT', '#ffb070', -30, true); sfx('break'); B.dim = 0;
  },
  async doLink(a, p, t) {
    const B = this.B, Lk = LINKS[p.id];
    this.closeMenu(); a.mp -= Lk.mp[0]; p.mp -= Lk.mp[1]; a.strain += 40; p.strain += 40; this.hud();
    B.dim = .7; B.dimCol = '60,10,10';
    await cutIn(Lk.name, 'me', p.id, Lk.lines);
    if (!B.blazed && a.isMe) { B.blazed = true; G.S.hood = false; }
    await Promise.all([this.dash(a, t.x + 50, t.y + 18, 220), this.dash(p, t.x + 50, t.y - 22, 220)]);
    for (let i = 0; i < Lk.hits; i++) {
      if (t.ko) break;
      const who = i % 2 ? p : a, h = { anim: i === Lk.hits - 1 ? (who.isMe ? 'backslash' : 'slash') : 'slash', m: Lk.m + (i === Lk.hits - 1 ? .6 : 0), glow: who.isMe };
      await this.strike(who, t, h, 1, { brk: 8, unblockable: 1, src: 'link' });
      this.spark(t.x, t.y - 30, i % 2 ? '#c9a6ff' : '#46ff95', 18);
      await wait(90);
    }
    a.glow = false; p.delay = 1.6;
    await Promise.all([this.home(a), this.home(p)]); B.dim = 0;
  },
  // ---------------- enemy turn ----------------
  async enemyTurn(e) {
    const B = this.B, E = e.E;
    let sk;
    if (e.key === 'halvard') {
      const ph = B.turn % 5;
      if (e.hp < e.maxHp * .5 && !e.phase2) { e.phase2 = 1; await this.msg('Halvard: "Then I will burn the fire out of you!"', 1500); }
      sk = e.phase2 && ph === 2 ? E.skills[3] : ph === 1 ? E.skills[2] : pick([E.skills[0], E.skills[1]]);
      if (e.phase2 && Math.random() < .25) sk = E.skills[3];
    } else {
      if (E.morph && !e.morphed && e.hp < e.maxHp * E.morph.at) await this.morph(e);
      sk = e.next || this.chooseSkill(e); e.next = this.chooseSkill(e);
    }
    e.turns = (e.turns || 0) + 1;
    if (E.regen && e.hp < e.maxHp) { const h = Math.round(e.maxHp * E.regen); e.hp = Math.min(e.maxHp, e.hp + h); this.text(e, '+' + h + ' REGEN', '#9be37a', -20); }
    if (E.howl && !e.howled && e.hp < e.maxHp * .5) { e.howled = 1; await this.msg(`${e.name}: ${E.howlName || 'HOWL'}`, 900); sfx('alarm'); B.shake = 10; for (const x of this.alive('e')) { x.atk = Math.round(x.atk * 1.2); this.text(x, 'ATK UP', '#ff8a6a', -20); } await this.summon(E.howlKey || 'lupine', E.howlText || 'ANSWERS THE HOWL'); }
    if (E.shield && e.turns % 4 === 0 && e.shield < 3) { e.shield = 3; await this.msg(`${e.name} locks shields — PHALANX ×3`, 1000); sfx('parry'); return; }
    if (E.faith && this.alive('e').some(x => x.key === 'acolyte')) { const h = Math.round(e.maxHp * .05); e.hp = Math.min(e.maxHp, e.hp + h); this.text(e, '+' + h + ' (FAITH)', '#fff3b0', -20); this.hud(); }
    if (E.stance) { if (e.stance) e.stance = 0; else if (e.turns % 3 === 0) { e.stance = 1; await this.msg(`${e.name} sheathes his blade. The empty sleeve stirs. (Plain attacks will be countered)`, 1500); e.next = this.chooseSkill(e); return; } }
    const targets = this.alive('p').filter(p => !p.veil); const pool = targets.length ? targets : this.alive('p');
    const t = Math.random() < .4 ? pool.slice().sort((x, y) => x.hp / x.maxHp - y.hp / y.maxHp)[0] : pick(pool);
    if (sk.seal) {
      await this.msg(`${e.name}: Seal Lock`, 900); sfx('chant'); const me = this.me(), sb = B.sb;
      if (sb.atk || sb.def || sb.mp || sb.cool || sb.calm || sb.cap || sb.verdict) { me.atk -= sb.atk; me.def -= sb.def; me.strainMax -= sb.cap; B.sb = Stones.empty(); B.sealedStones = 1; this.text(me, 'YOUR STONES GO DARK', '#c9a46a', -40, true); }
      else this.text(me, 'Nothing to seal', '#999', -40);
      this.hud(); return;
    }
    if (sk.psalm) {
      await this.msg(`${e.name}: Binding Psalm`, 900); sfx('chant'); B.dim = .4; B.dimCol = '60,50,10';
      for (const p of this.alive('p')) { p.bind = 2; const d = Math.min(p.mp, 3); p.mp -= d; this.text(p, `-${d} MP · Arts cost +2`, '#ffd34a'); }
      await wait(900); B.dim = 0; this.hud(); return;
    }
    await this.enemyStrike(e, t, sk, false);
    if (E.blind && sk.name === 'Dirt in the Eyes' && !t.ko) { t.blind = 2; this.text(t, 'BLINDED — timing shrinks', '#c9a46a', -30); }
    if (e.morph > 0 && !e.ko) { e.morph--; if (!e.morph) await this.unmorph(e); }
  },
  async enemyStrike(e, t, sk, isCounter) {
    const B = this.B;
    const el = elOf(sk); if (!isCounter) this.facePop(e, ['shout', 'power', 'anger']); if (!isCounter) await this.msg(`${e.name}: ${sk.name}${el ? '  [' + ELEM[el][0] + ']' : ''}`, 750);
    if (sk.hits.some(h => h.unp)) { this.text(e, '!! UNPARRYABLE', '#ff5050', -50, true); sfx('alarm'); await wait(450); }
    const ranged = sk.hits[0].anim === 'spellcast' || sk.hits.every(h => h.proj);
    if (B.orb && t.side === 'p' && (ranged || el) && !isCounter) {
      await this.msg(`The Azure orb swallows ${sk.name}!`, 900); sfx('heal'); B.flash = .3; const o = B.orb.owner; o.mp = Math.min(o.maxMp, o.mp + 2);
      B.fx.push({ orb: 1, kind: 'draw', x: B.orb.x, y: B.orb.y, t: 0, life: 700 }); this.text(o, 'ABSORBED +2 MP', '#5fd8ff', -40);
      if (--B.orb.charges <= 0) { B.orb = null; this.text(o, 'The orb is full — it bursts', '#5fd8ff', -60); } this.hud(); return;
    }
    if (!ranged) await this.dash(e, t.x - 54, t.y + 2, 280);
    $('#react').classList.remove('hide');
    let parries = 0, n = 0, streak = 0;
    // every DODGE / PARRY press during the whole combo is logged the instant it happens, so nothing is lost between hits
    B.presses = []; B.cut = 0;
    const logP = k => () => { B.presses.push([k, performance.now()]); const b = $(k === 'dodge' ? '#rxDodge' : '#rxParry'); b.classList.add('on'); setTimeout(() => b.classList.remove('on'), 110); };
    Input.on('dodge', logP('dodge')); Input.on('parry', logP('parry'));
    // stronger enemies vary their rhythm: feints that hesitate, and snap strikes that come early
    const ti = Math.max(0, ['E', 'D', 'C', 'B', 'A', 'S', 'SS', 'SSS', 'SSSS'].indexOf(TIER[e.key] || 'E'));
    for (const h of sk.hits) {
      if (t.ko) break; n++;
      let style = 'normal';
      if (e.side === 'e' && ti >= 2 && !B.tutorial) { const r = Math.random(), fe = .12 + ti * .04, sn = .08 + ti * .03; style = r < fe ? (ti >= 3 ? FEINTS[Math.floor(Math.random() * FEINTS.length)] : Math.random() < .5 ? 'feint' : FEINTS[Math.floor(Math.random() * 2)]) : r < fe + sn ? 'snap' : 'normal'; }
      const r = await this.defend(e, t, Object.assign({ el, style }, h));
      if (r === 'parry' || r === 'pparry') { parries++; streak++; if (streak >= 2) await this.clash(e, t, streak); } else streak = 0;
      await wait(120);
    }
    $('#react').classList.add('hide'); Input.on('dodge', null); Input.on('parry', null); B.presses = null;
    const allParried = parries === n && n > 0 && !sk.hits.some(h => h.unp);
    if (!ranged) await this.home(e);
    if (allParried && !t.ko && !e.ko && !B.leafTrain) {
      await this.msg('COUNTERATTACK!', 600); sfx('counter'); B.dim = .5; B.dimCol = '60,50,10';
      await this.dash(t, e.x + 52, e.y + 2, 180);
      t.anim = t.isMe ? 'backslash' : 'slash'; this.play(t, t.anim, t.isMe ? 13 : 6, 40);
      await wait(220);
      this.resolveHit(t, e, 1.8, 'perfect', { unblockable: 1, brk: 16, src: 'counter' });
      await wait(300); await this.home(t); B.dim = 0;
    }
  },
  defend(e, t, h) {
    const B = this.B;
    return new Promise(async resolve => {
      let w = (h.w || 520) * (e.tempo || 1); const rk = this.reflex(t);
      let slow = !!B.dilate;
      if (B.tutorial) {
        if (B.tutorial.dodge) { B.tutorial.dodge = 0; slow = true; await this.msg('Press DODGE as the ring closes!', 1300, true); }
        else if (B.tutorial.parry && !h.unp) { B.tutorial.parry = 0; slow = true; await this.msg('Now PARRY: tighter timing. Parry EVERY hit to counter!', 1600, true); }
      }
      B.timeScale = slow ? 0.38 : 1;
      const st = h.style || 'normal', base = (st === 'snap' ? w * .7 : w) / B.timeScale, pause = st === 'feint' ? 300 / B.timeScale : 0;
      const RS = RING_STYLE[st], dur = RS ? base * RS.len + (RS.pause || 0) / B.timeScale : base + pause, t0 = performance.now(), T = t0 + dur;
      const ring = { x: t.x, y: t.y - 30, t0, dur, kind: h.unp ? 'unp' : st, color: h.unp ? '#ff5050' : RS ? RS.col : st === 'feint' ? '#ffb04a' : st === 'snap' ? '#ff6ad5' : '#ffffff',
        prog: now => { const el = now - t0; if (RS) return RS.p(el / dur, el, dur); if (!pause) return el / base; if (el < base * .5) return el / base; if (el < base * .5 + pause) return .5; return (el - pause) / base; } };
      if (G.settings.ring || slow) B.rings.push(ring);
      e.anim = h.anim; e.frame = 0; e.once = true; e.fn = 99; e.fms = 1e9;
      let pressed = null; const own = !B.presses; // a lone defend (counters, tests) logs its own presses
      if (own) { B.presses = []; B.cut = 0; const lp = k => () => { B.presses.push([k, performance.now()]); const b = $(k === 'dodge' ? '#rxDodge' : '#rxParry'); b.classList.add('on'); setTimeout(() => b.classList.remove('on'), 110); }; Input.on('dodge', lp('dodge')); Input.on('parry', lp('parry')); }
      // animate swing so the impact frame lands on T
      const nF = { slash: 6, halfslash: 6, backslash: 13, spellcast: 7, thrust: 8, jump: 5, run: 8 }[h.anim] || 6, imp = Math.floor(nF / 2);
      const pk = projKind(h); let P = null;
      if (pk && t.isMe && !B.leafTrain) G.S.f.projSeen = 1;
      if (pk) { const es = BT_SCALE * (e.size || 1), dir = t.x > e.x ? 1 : -1, travel = Math.min(dur * .85, (PROJ[pk].ms || 500) / B.timeScale);
        P = { proj: pk, x0: e.x + dir * 16 * es, y0: e.y - 36 * es, x1: t.x - dir * 4, y1: t.y - 30 * BT_SCALE, ts: T - travel, te: T, t: 0, life: 1e9 }; B.fx.push(P); }
      const swingAt = (P ? P.ts : T) - imp * 60; let launched = false;
      const lateEnd = T + 75 * rk / B.timeScale;
      while (performance.now() < lateEnd) {
        const now = performance.now();
        if (now >= swingAt && e.fms > 1e8) { e.fms = 60; e.at = 0; e.frame = 0; e.fn = nF; if (!P) sfx('swing'); }
        if (P && !launched && now >= P.ts) { launched = true; sfx(PROJ[pk].sfx || 'throw'); }
        await wait(10);
      }
      // the first press after the previous hit's window closed belongs to this hit
      pressed = B.presses.find(p => p[1] > B.cut) || null; B.cut = Math.max(lateEnd, pressed ? pressed[1] : 0);
      if (own) { Input.on('dodge', null); Input.on('parry', null); B.presses = null; }
      B.rings = B.rings.filter(x => x !== ring); B.timeScale = 1;
      // judge
      let res = 'hit';
      if (pressed) {
        const d = (pressed[1] - T) * B.timeScale || (pressed[1] - T);
        const dd = (pressed[1] - T) * (slow ? 0.38 : 1);
        if (pressed[0] === 'dodge') { if (dd >= -110 * rk && dd <= 45 * rk) res = 'pdodge'; else if (dd >= -290 * rk && dd <= 75 * rk) res = 'dodge'; else res = 'early'; }
        else if (P && !h.unp) { // cutting something in flight: only Ren, and only once Vane's Leaf Cut is his — a tighter window than a blade
          if (!LeafCut.can(t)) res = 'noleaf'; else { const lk = LeafCut.window(t); if (dd >= -48 * rk * lk && dd <= 24 * rk * lk) res = 'pparry'; else if (dd >= -125 * rk * lk && dd <= 42 * rk * lk) res = 'parry'; else res = 'early'; } }
        else { if (h.unp) res = 'unp'; else if (dd >= -70 * rk && dd <= 35 * rk) res = 'pparry'; else if (dd >= -175 * rk && dd <= 60 * rk) res = 'parry'; else res = 'early'; }
      }
      const m = h.m;
      if (e.morph > 0 && (res === 'pdodge' || res === 'pparry')) { e.tempo = Math.max(.68, (e.tempo || 1) * .9); this.text(e, 'ADAPTING TO YOUR TIMING', '#ff8a6a', -40); }
      if (t.side === 'p') { if (res === 'pdodge') B.st.pd++; if (res === 'pparry') B.st.pp++; }
      if (t.isMe && (res === 'pdodge' || res === 'pparry')) { t.flow = (t.flow || 0) + 1; if (t.flow === 5 && t.arts && t.arts.includes('sight') && !t.sight) { this.text(t, 'IN THE FLOW — ASCENSION READY', '#e8fff4', -70, true); sfx('art'); } }
      if (P) { B.fx = B.fx.filter(x => x !== P); const now = performance.now();
        if (res === 'dodge' || res === 'pdodge') B.fx.push({ proj: pk, x0: P.x1, y0: P.y1, x1: P.x1 + (P.x1 - P.x0) * .7, y1: P.y1 + 18, ts: now, te: now + 260, t: 0, life: 300, arc: 0 });
        else if (res === 'parry' || res === 'pparry') { if (B.leafTrain) B.leafCuts = (B.leafCuts || 0) + 1; LeafCut.split(this, pk, P, t, e, res === 'pparry'); }
        else this.spark(P.x1, P.y1, PROJ[pk].col ? `rgb(${PROJ[pk].col})` : '#ffffff', 10); }
      if (P && (res === 'parry' || res === 'pparry')) { /* Leaf Cut handled above */ }
      else if (res === 'pdodge') { sfx('pdodge'); this.text(t, 'PERFECT DODGE', '#6ad7ff', -10, true); this.hop(t); t.mp = Math.min(t.maxMp, t.mp + 1); t.afterimg = 400; }
      else if (res === 'dodge') { sfx('dodge'); this.text(t, 'DODGE', '#9ad1ff'); this.hop(t); }
      else if (res === 'pparry') { sfx('pparry'); this.text(t, 'PERFECT PARRY', '#ffe36a', -10, true); t.mp = Math.min(t.maxMp, t.mp + 2);
        if (h.el && h.el !== 'mana' && this.reflex(t) > 1) { t.mp = Math.min(t.maxMp, t.mp + 3); this.text(t, 'UNRAVELED! +3 MP', '#46ff95', -34); this.spark(t.x, t.y - 34, ELEM[h.el][1], 16); } this.spark((t.x + e.x) / 2, t.y - 34, '#fff3a0', 22); B.flash = .35; e.brk += 18; this.checkBreak(e); t.anim = 'halfslash'; this.play(t, 'halfslash', 6, 40); }
      else if (res === 'parry') { sfx('parry'); this.text(t, 'PARRY', '#ffe36a'); t.anim = 'halfslash'; this.play(t, 'halfslash', 6, 45); t.mp = Math.min(t.maxMp, t.mp + 1); this.spark((t.x + e.x) / 2, t.y - 34, '#fff3a0', 10); e.brk += 8; this.checkBreak(e); this.chip(e, t, m * .25); }
      else {
        if (res === 'unp') this.text(t, "CAN'T PARRY THAT!", '#ff6b6b', -20);
        if (res === 'noleaf') { this.text(t, t.isMe ? "CAN'T CUT IT IN FLIGHT — DODGE!" : 'ONLY A DODGE STOPS THAT', '#ff9a6b', -20); if (t.isMe) { G.S.f.leafMiss = (G.S.f.leafMiss || 0) + 1; B.leafMiss = 1; } }
        if (res === 'early') this.text(t, 'TOO EARLY', '#bbb', -20);
        if (h.unp && res !== 'dodge' && t.side === 'p') {   // eating a red blow hurts: heavier damage, rhythm broken, slower to recover
          this.chip(e, t, m * 1.4, true, h.el); t.flow = 0; t.delay = Math.max(t.delay || 1, 1.5);
          if (t.sight) t.sight = Math.max(0, t.sight - 1);
          this.text(t, 'CRUSHED — STAGGERED', '#ff5050', -44, true); B.shake = Math.max(B.shake || 0, 10); B.flash = .4; B.flashCol = '255,60,60';
        } else this.chip(e, t, m, true, h.el);
      }
      this.hud();
      resolve(res);
    });
  },
  async clash(e, t, n) {
    const B = this.B, mx = (e.x + t.x) / 2, my = (e.y + t.y) / 2 - 34;
    sfx('pparry'); B.shake = 8 + n * 2; B.flash = .25;
    this.text({ x: mx, y: my + 60 }, 'CLASH ×' + n, '#ffe36a', -30, true);
    for (let i = 0; i < 3; i++) this.spark(mx + rnd(-6, 6), my + rnd(-6, 6), i ? '#fff3a0' : '#ffffff', 16);
    B.fx.push({ clash: 1, x: mx, y: my, t: 0, life: 380 });
    const ex = e.x, tx = t.x, d = Math.sign(tx - ex) || 1;
    t.anim = 'halfslash'; this.play(t, 'halfslash', 6, 40); e.anim = 'slash'; e.frame = 3;
    for (let k = 0; k <= 6; k++) { const u = Math.sin(k / 6 * Math.PI); e.x = ex - d * 14 * u; t.x = tx + d * 14 * u; await wait(22); }
    e.x = ex; t.x = tx;
  },
  chip(e, t, m, full, el) {
    let dmg = Math.max(1, Math.round(e.atk * m * rnd(.9, 1.1) - t.def * .6));
    if (t.guard) dmg = Math.ceil(dmg / 2); if (t.ward) dmg = Math.ceil(dmg * (el && el !== 'mana' ? .1 : .4));
    if (e.broken) dmg = Math.ceil(dmg * .6);
    this.damage(t, dmg, false); if (full) sfx('hurt');
  },
  async victory() {
    const B = this.B; sfx('win'); Music.stop();
    const es = B.actors.filter(a => a.side === 'e'); const base = es.reduce((s, a) => s + a.E.xp, 0), gold = es.reduce((s, a) => s + a.E.gold, 0);
    const R8 = ['E', 'D', 'C', 'B', 'A', 'S', 'SS', 'SSS', 'SSSS'], me8 = Power.now().i;
    const foe = Math.max(0, ...es.map(a => R8.indexOf(TIER[a.key] || 'E'))), gap = foe - me8;
    // 1) rank gap: farming weaklings two ranks below you is nearly worthless; punching up pays
    const gapM = gap <= -2 ? .1 : gap === -1 ? .55 : gap === 0 ? 1 : gap === 1 ? 1.35 : 1.7;
    // 2) the grind: from rank B on, raw EXP thins out
    const grind = [.7, .6, .5, .4, .32, .26, .2, .16, .13][me8] || .13;
    // 3) battle quality: perfect hits, perfect parries & dodges, and above all — not being touched
    const st = B.st, qk = me8 >= 3 ? 1.5 : 1, clean = st.hurt === 0 && gap >= -1;
    let q = Math.min(.5, st.perf * .04) + Math.min(.6, st.pp * .07) + Math.min(.4, st.pd * .05);
    if (clean) q += gap >= 0 ? .8 : .3;
    q *= qk; if (gap <= -2) q *= .25; q = Math.min(1, q);
    const xp = Math.max(1, Math.round(base * gapM * grind * (1 + q)));
    G.S.gold += gold; const ups = Story.gainXp(xp);
    const parts = [];
    if (gap <= -2) parts.push('far below your rank ×0.1'); else if (gap === -1) parts.push('below your rank'); else if (gap >= 1) parts.push(gap >= 2 ? 'far above your rank!' : 'above your rank');
    if (st.perf) parts.push(`${st.perf} perfect hit${st.perf > 1 ? 's' : ''}`); if (st.pp) parts.push(`${st.pp} perfect parr${st.pp > 1 ? 'ies' : 'y'}`); if (st.pd) parts.push(`${st.pd} perfect dodge${st.pd > 1 ? 's' : ''}`);
    if (clean) parts.push(gap >= 0 ? 'FLAWLESS ×1.8' : 'flawless');
    if (parts.length) setTimeout(() => toast(`EXP ${xp}: ` + parts.join(' · ') + (q > 0 ? ` (style +${Math.round(q * 100)}%)` : ''), 3600), 300);
    if (es.some(a => a.key === 'mana_wyrm') && !G.S.f.wyrmDrop) { G.S.f.wyrmDrop = 1; setTimeout(() => Stones.give('breath'), 2200); }
    this.me().hp = Math.max(this.me().hp, 1);
    if (ups) { const me = this.me(); me.maxHp = G.S.stats.maxHp; me.maxMp = G.S.stats.maxMp; me.hp = me.maxHp; me.mp = me.maxMp; }
    await this.msg(`${st.hurt === 0 && gap >= 0 ? 'FLAWLESS VICTORY!' : 'Victory!'}  +${xp} EXP  +${gold} gold${ups ? '  ·  POWER UP — ' + Power.now().grade + ' (' + BAND_NAME[Power.now().band] + ')' : ''}`, ups ? 2200 : 1600);
    return 'win';
  },
  // ---------------- fx ----------------
  text(a, s, col, dy, big) { if (!this.B || !a) return; this.B.texts.push({ s, x: a.x + rnd(-6, 6), y: a.y - 60 + (dy || 0), t: 0, col, big }); },
  spark(x, y, col, n) { if (!this.B) return; for (let i = 0; i < n; i++) this.B.fx.push({ x, y, vx: rnd(-2.6, 2.6), vy: rnd(-3, 1), life: rnd(300, 650), t: 0, col, s: rnd(1.5, 3.2) }); },
  pillar(x, y) { this.B.fx.push({ pillar: 1, x, y, t: 0, life: 500 }); },
  async msg(s, ms, hold) { const m = $('#bmsg'); const i = s.indexOf(':'), who = i > 0 && i < 28 ? s.slice(0, i) : null;
    const act = who && this.B && this.B.actors.find(a => a.name === who || who.startsWith(a.name));
    const col = act ? (act.side === 'p' ? (act.isMe ? '#5dff9a' : speakerCol(act.id)) : '#ff8a7a') : who ? speakerCol(Object.keys(SPEAKER_COL).find(k => CHAR[k] && CHAR[k].name === who) || who) : null;
    m.innerHTML = ''; if (who && col) { const b = document.createElement('b'); b.style.color = col; b.textContent = who + ':'; m.append(b, document.createTextNode(s.slice(i + 1))); } else m.textContent = s; m.classList.add('on'); await wait(ms || 900); if (!hold) m.classList.remove('on'); else setTimeout(() => m.classList.remove('on'), 600); },
  update(dt) {
    const B = this.B; if (!B) return;
    if (World.scene && World.scene.realm) Weather.update(dt);
    for (const a of B.actors) {
      a.at += dt;
      if (a.once) { if (a.at >= a.fms) { a.at = 0; a.frame++; if (a.frame >= a.fn) { a.frame = a.fn - 1; if (!a.ko) { a.once = false; a.anim = a.loopAnim; a.frame = 0; } } } }
      else { const ms = a.anim === 'run' ? 90 : 520; if (a.at >= ms) { a.at = 0; a.frame = (a.frame + 1) % ({ combat: 2, run: 8 }[a.anim] || 2); } }
      if (a.hurtT) a.hurtT -= dt;
    }
    B.fx = B.fx.filter(p => (p.t += dt) < p.life);
    B.texts = B.texts.filter(x => (x.t += dt) < 1100);
    if (B.flash > 0) B.flash -= dt / 400; if (B.shake > 0) B.shake -= dt / 30;
  },
  render(c, t) {
    const B = this.B; if (!B) return; const W = G.view.w, H = G.view.h;
    const bd = B.bd, sc = Math.max(W / bd.width, H / bd.height);
    let ox = 0, oy = 0; if (B.shake > 0) { ox = rnd(-B.shake, B.shake); oy = rnd(-B.shake, B.shake) * .5; }
    c.save(); c.translate(ox, oy);
    c.drawImage(bd, (W - bd.width * sc) / 2, (H - bd.height * sc) / 2, bd.width * sc, bd.height * sc);
    if (B.dim > 0) { c.fillStyle = `rgba(${B.dimCol},${B.dim})`; c.fillRect(-10, -10, W + 20, H + 20); }
    // targeting cursor
    const T = B.targeting;
    const list = B.actors.slice().sort((a, b) => a.y - b.y);
    for (const a of list) {
      if (!a.isMe && !a.img) continue;
      c.save(); // knockback offset + idle breathing (battlefx.js)
      if (a.kbx) c.translate(a.kbx, 0);
      if (a.anim === 'combat' && !a.ko && !a.lift) { const br = 1 + Math.sin(t / 430 + a.x * .07) * .014; c.translate(a.x, a.y); c.scale(1 / Math.sqrt(br), br); c.translate(-a.x, -a.y); }
      const lift = a.lift || 0, lean = a.lean || 0, sh = Math.max(.35, 1 - lift / 60);
      c.fillStyle = `rgba(0,0,0,${.28 * sh})`; c.beginPath(); c.ellipse(a.x, a.y, 15 * sh, 5 * sh, 0, 0, 7); c.fill();
      const s = BT_SCALE * (a.size || 1);
      if (lift || lean) { c.save(); c.translate(a.x, a.y - lift); c.rotate(lean); c.translate(-a.x, -a.y); }
      if (a.aura) { c.save(); c.globalCompositeOperation = 'lighter'; const ag = c.createRadialGradient(a.x, a.y - 30 * s, 2, a.x, a.y - 30 * s, 34 * s); ag.addColorStop(0, a.aura + 'aa'); ag.addColorStop(1, a.aura + '00'); c.fillStyle = ag; c.beginPath(); c.ellipse(a.x, a.y - 30 * s, 26 * s, 38 * s, 0, 0, 7); c.fill(); c.restore(); }
      const fr = Math.min(a.frame, (G.man.bt.anims.find(x => x[0] === a.anim) || [0, 2])[1] - 1);
      c.globalAlpha = a.ko && a.side === 'e' ? Math.max(0, 1 - (a.at / 900)) : (a.alpha ?? 1);
      if (a.hurtT > 0 && Math.floor(a.hurtT / 50) % 2) c.globalAlpha *= .4;
      if (a.afterimg > 0) { a.afterimg -= 16; c.save(); c.globalAlpha = .3; drawBT(c, a.isMe ? playerImg() : a.img, a.anim, fr, a.x + 18, a.y, s); c.restore(); }
      if (a.isMe && a.sight) {
        const now = performance.now(), img = playerImg(); c.save(); c.globalCompositeOperation = 'lighter';
        for (let i = 0; i < 3; i++) { const fl = Math.sin(now / (90 + i * 37) + i) * .5 + .5;
          c.globalAlpha = (.32 + .2 * fl) * (i === 0 ? 1 : .85); drawBT(c, tinted(img, i === 1 ? '#7dffb0' : '#f2fffa'), a.anim, fr, a.x + Math.sin(now / 70 + i) * 1.5, a.y - 2 - i * 3 - fl * 4, s * (1.12 + i * .09 + fl * .04)); }
        for (let i = 0; i < 6; i++) { const ph = (now / 420 + i / 6) % 1, fx = a.x + Math.sin(i * 2.1 + now / 300) * 18 * s, fy = a.y - 10 - ph * 70 * s; c.globalAlpha = .55 * (1 - ph); c.fillStyle = i % 2 ? '#7dffb0' : '#ffffff'; c.beginPath(); c.moveTo(fx - 3, fy + 8); c.quadraticCurveTo(fx, fy - 10, fx + 3, fy + 8); c.fill(); }
        const g = c.createRadialGradient(a.x, a.y - 34 * s, 4, a.x, a.y - 34 * s, 58 * s); g.addColorStop(0, 'rgba(230,255,245,.28)'); g.addColorStop(.5, 'rgba(120,255,180,.12)'); g.addColorStop(1, 'rgba(120,255,180,0)');
        c.globalAlpha = 1; c.fillStyle = g; c.beginPath(); c.ellipse(a.x, a.y - 34 * s, 40 * s, 62 * s, 0, 0, 7); c.fill();
        if (Math.random() < .5) B.fx.push({ x: a.x + rnd(-16, 16), y: a.y - rnd(0, 60), vx: rnd(-.3, .3), vy: rnd(-2.2, -1), life: rnd(400, 800), t: 0, col: Math.random() < .5 ? '#e8fff4' : '#7dffb0', s: rnd(1.2, 2.4) });
        c.restore();
      }
      if (a.isMe) {
        const anim = a.anim, glow = a.glow && anim === 'slash';
        if (a.flip) { c.save(); c.translate(a.x, 0); c.scale(-1, 1); c.translate(-a.x, 0); }
        const drawn = anim === 'slash' || G.S.kid, bts = !!(B && B.renBts);
        if (!drawn && !bts) { // the katana rests in its scabbard at the hip — Vane's way
          const dyP = anim === 'hurt' ? Math.min(fr, 4) * 2.4 : anim === 'jump' ? -2 : 0;
          const hx = a.x + 2 * s, hy = a.y - (21 - dyP) * s; c.save(); c.lineCap = 'round';
          c.strokeStyle = '#1a120c'; c.lineWidth = 3.4 * s; c.beginPath(); c.moveTo(hx, hy); c.lineTo(hx + 19 * s, hy + 7 * s); c.stroke();
          c.strokeStyle = '#3a2a1c'; c.lineWidth = 1.4 * s; c.beginPath(); c.moveTo(hx + 1, hy - 1); c.lineTo(hx + 18 * s, hy + 6 * s); c.stroke();
          c.fillStyle = '#b8b0a0'; c.fillRect(hx + 17 * s, hy + 5.4 * s, 2.6 * s, 2.6 * s); c.restore();
        }
        const hilt = () => { if (drawn || bts) return; const dyP = anim === 'hurt' ? Math.min(fr, 4) * 2.4 : anim === 'jump' ? -2 : 0; const hx = a.x + 2 * s, hy = a.y - (21 - dyP) * s; c.save(); c.lineCap = 'round';
          c.strokeStyle = '#2a2a34'; c.lineWidth = 2.6 * s; c.beginPath(); c.moveTo(hx, hy); c.lineTo(hx - 8 * s, hy - 2.2 * s); c.stroke();
          c.fillStyle = '#e8e4d8'; for (let q = 1; q < 4; q++) c.fillRect(hx - q * 2.1 * s, hy - q * .6 * s - .5, 1.3, 1.3);
          c.fillStyle = '#c9a24a'; c.beginPath(); c.ellipse(hx + .5, hy, 1.4 * s, 2.6 * s, .4, 0, 7); c.fill(); c.restore(); };
        // the katana's slash frame 2 flips the blade through his body — skip it so the draw reads as one clean arc
        const frS = anim === 'slash' && !G.S.kid && !bts ? [0, 1, 3, 3, 4, 5][fr] ?? fr : fr;
        if (!G.S.kid && drawn && !bts) drawBT(c, glow ? G.A.glowBg : G.A.swordBg, anim, frS, a.x, a.y, s);
        drawBT(c, playerImg(), anim, frS, a.x, a.y, s);
        hilt();
        if (bts) { if (glow) { c.save(); c.globalCompositeOperation = 'lighter'; c.globalAlpha *= (B.renBts && B.renBts.__hd ? .18 : .6); drawBT(c, tinted(playerImg(), '#7dffb0'), anim, frS, a.x, a.y, s); c.restore(); } } else if (G.S.kid || !drawn) {} else if (!glow) drawBT(c, G.A.sword, anim, frS, a.x, a.y, s);
        else { c.save(); c.globalCompositeOperation = 'lighter'; drawBT(c, G.A.glow, anim, frS, a.x, a.y, s); c.restore(); drawBT(c, G.A.glow, anim, frS, a.x, a.y, s); }
        if (!G.S.hood) { const g = c.createRadialGradient(a.x - 4, a.y - 50, 0, a.x - 4, a.y - 50, 8); g.addColorStop(0, 'rgba(70,255,140,.4)'); g.addColorStop(1, 'rgba(70,255,140,0)'); c.save(); c.globalCompositeOperation = 'lighter'; c.fillStyle = g; c.fillRect(a.x - 20, a.y - 66, 32, 32); c.restore(); }
        if (a.flip) c.restore();
        if (a.ward) { c.save(); c.globalCompositeOperation = 'lighter'; c.strokeStyle = `rgba(70,255,140,${.25 + Math.sin(t / 200) * .1})`; c.lineWidth = 1.5; c.beginPath(); c.ellipse(a.x, a.y - 30, 26, 36, 0, 0, 7); c.stroke(); c.restore(); }
      } else if (a.morph > 0 && !a.__preImg) {
        // SCAR BLOOM: a burning outline, a larger shadow-body, darkened scaled skin, horns and a crown of spines
        const ga = c.globalAlpha, pul = Math.sin(t / 110);
        c.save();
        c.globalAlpha = ga * (.55 + pul * .15); drawBT(c, tinted(a.img, '#ff3a14'), a.anim, fr, a.x, a.y + 3, s * 1.14);
        c.globalAlpha = ga * .95; drawBT(c, tinted(a.img, '#1a0505'), a.anim, fr, a.x, a.y + 2, s * 1.09);
        c.globalAlpha = ga; drawBT(c, a.img, a.anim, fr, a.x, a.y, s);
        c.globalAlpha = ga * .42; drawBT(c, tinted(a.img, '#2a0606'), a.anim, fr, a.x, a.y, s);
        // horns
        const hx = a.x, hy = a.y - 52 * s;
        for (const d of [-1, 1]) { c.beginPath(); c.moveTo(hx + d * 5 * s, hy + 6 * s); c.quadraticCurveTo(hx + d * 15 * s, hy - 2 * s, hx + d * 11 * s, hy - 14 * s); c.quadraticCurveTo(hx + d * 9 * s, hy - 3 * s, hx + d * 2 * s, hy + 5 * s);
          c.fillStyle = '#140404'; c.fill(); c.strokeStyle = `rgba(255,90,40,${.7 + pul * .2})`; c.lineWidth = 1.2; c.stroke(); }
        // glowing green eyes through the dark
        c.globalCompositeOperation = 'lighter'; const eg = c.createRadialGradient(hx + 3 * s, hy + 12 * s, 0, hx + 3 * s, hy + 12 * s, 7 * s);
        eg.addColorStop(0, 'rgba(90,255,150,.9)'); eg.addColorStop(1, 'rgba(90,255,150,0)'); c.fillStyle = eg; c.fillRect(hx - 6 * s, hy + 4 * s, 18 * s, 16 * s);
        c.restore();
        if (Math.random() < .5) B.fx.push({ x: a.x + rnd(-24, 24), y: a.y - rnd(10, 95), vx: rnd(-.4, .4), vy: rnd(-1.6, -.6), life: rnd(400, 800), t: 0, col: pick(['#ff6a2a', '#ffb050', '#ff3a1a']), s: rnd(1.5, 3) });
        // crown of spines — turns one notch each time he adapts
        a.wheelAng = lerp(a.wheelAng || 0, (a.wheel || 0) * Math.PI / 4, .08);
        const cx = hx, cy = hy - 16 * s; c.save(); c.globalAlpha = ga;
        c.strokeStyle = '#ff6a2a'; c.lineWidth = 2; c.beginPath(); c.ellipse(cx, cy, 15, 4.5, 0, 0, 7); c.stroke();
        for (let i = 0; i < 8; i++) { const an = a.wheelAng + i * Math.PI / 4, px = cx + Math.cos(an) * 15, py = cy + Math.sin(an) * 4.5, h = 7 + (Math.sin(an) > 0 ? 3 : 0);
          c.fillStyle = Math.sin(an) > 0 ? '#ffb050' : '#7a1a0a'; c.beginPath(); c.moveTo(px - 3, py); c.lineTo(px + 3, py); c.lineTo(px, py - h); c.fill(); }
        c.restore();
      } else if (a.key === 'dread') {
        const ang = dreadSwordAngle(a.anim, fr), px = a.x + 9 * s, py = a.y - 36 * s, behind = a.anim === 'combat' || a.anim === 'hurt';
        if (behind) paintGreatsword(c, px, py, ang, s * .95, t);
        drawBT(c, a.img, a.anim, fr, a.x, a.y, s);
        if (!behind) paintGreatsword(c, px, py, ang, s * .95, t);
        c.save(); c.globalCompositeOperation = 'lighter'; const gx = a.x + 3 * s, gy = a.y - 43 * s, g = c.createRadialGradient(gx, gy, 0, gx, gy, 5 * s); g.addColorStop(0, 'rgba(90,255,150,.9)'); g.addColorStop(1, 'rgba(90,255,150,0)'); c.fillStyle = g; c.fillRect(gx - 7 * s, gy - 7 * s, 14 * s, 14 * s); c.restore();
      } else if (a.E && a.E.spectral) {
        const ga = c.globalAlpha; c.globalAlpha = ga * (.7 + Math.sin(t / 200) * .1); drawBT(c, tinted(a.img, a.E.spectral), a.anim, fr, a.x, a.y, s);
        c.save(); c.globalCompositeOperation = 'lighter'; c.globalAlpha = .35; drawBT(c, tinted(a.img, a.E.spectral), a.anim, fr, a.x, a.y - 2, s * 1.04); c.restore(); c.globalAlpha = ga;
      } else drawBT(c, a.img, a.anim, fr, a.x, a.y, s);
      if (a.flashT > 0) { const im = a.isMe ? playerImg() : a.img; if (im) { c.save(); c.globalAlpha = Math.min(1, a.flashT / 90) * .8; drawBT(c, tinted(im, '#ffffff'), a.anim, a.isMe && a.anim === 'slash' && !G.S.kid ? ([0, 1, 3, 3, 4, 5][fr] ?? fr) : fr, a.x, a.y, s); c.restore(); } }
      c.globalAlpha = 1;
      // weapon trails: a crescent swoosh on the live frames of every swing
      if (a.once && /slash|thrust/.test(a.anim) && !a.ko) {
        const nF = { slash: 6, halfslash: 6, backslash: 13, thrust: 8 }[a.anim], u = a.frame / (nF - 1);
        if (u > .2 && u < .85) { const dir = a.side === 'p' ? -1 : 1, sc2 = s, cx2 = a.x + dir * 26 * sc2, cy2 = a.y - 34 * sc2;
          c.save(); c.globalCompositeOperation = 'lighter'; const col = a.isMe ? (a.glow ? '90,255,150' : '220,255,235') : a.key === 'dread' ? '90,255,150' : '255,220,200';
          c.strokeStyle = `rgba(${col},${.75 * (1 - Math.abs(u - .5) * 1.6)})`; c.lineCap = 'round';
          if (a.anim === 'thrust') { c.lineWidth = 3; c.beginPath(); c.moveTo(a.x + dir * 10 * sc2, cy2); c.lineTo(a.x + dir * 52 * sc2, cy2); c.stroke(); }
          else { for (const [w, r] of [[6, 30], [2.5, 36]]) { c.lineWidth = w * sc2 * .5; c.beginPath(); const a0 = dir > 0 ? -1.3 + u * .8 : Math.PI + 1.3 - u * .8; c.arc(cx2 - dir * 10, cy2, r * sc2 * (a.size || 1), dir > 0 ? a0 : a0 - 1.6, dir > 0 ? a0 + 1.6 : a0); c.stroke(); } }
          c.restore(); }
      }
      if (a.side === 'e' && !a.ko && !B.clashOn) {
        const bw = 44, x = a.x - bw / 2, y = a.y - 76;
        c.fillStyle = 'rgba(0,0,0,.7)'; c.fillRect(x - 1, y - 1, bw + 2, 9);
        c.fillStyle = '#e04848'; c.fillRect(x, y, bw * a.hp / a.maxHp, 4);
        c.fillStyle = a.broken ? '#fff' : '#ffd34a'; c.fillRect(x, y + 5, bw * Math.min(1, a.brk / a.brkMax), 2);
        c.font = '800 12px "Nunito"'; c.textAlign = 'center'; c.lineJoin = 'round'; c.strokeStyle = '#000'; c.lineWidth = 3; c.strokeText(a.name, a.x - 7, y - 3); c.fillStyle = '#ffb4a8'; c.fillText(a.name, a.x - 7, y - 3);
        const tr = TIER[a.key]; if (tr) { const tx = a.x - 7 + c.measureText(a.name).width / 2 + 9; c.fillStyle = 'rgba(0,0,0,.75)'; c.fillRect(tx - 6, y - 12, 12, 11); c.fillStyle = TIER_COL[tr]; c.font = '700 8px "Press Start 2P"'; c.fillText(tr, tx, y - 3); }
        if (a.E.trait) { c.font = '800 12px "Nunito"'; c.fillStyle = 'rgba(0,0,0,.78)'; const tw = c.measureText(a.E.trait).width, lx = Math.max(tw / 2 + 5, Math.min(W - tw / 2 - 5, a.x)); c.fillRect(lx - tw / 2 - 3, a.y + 6, tw + 6, 13); c.fillStyle = '#f2e6c4'; c.fillText(a.E.trait, lx, a.y + 16); }
        if (a.shield) { c.fillStyle = '#cfd8e8'; for (let i = 0; i < a.shield; i++) c.fillRect(a.x - 12 + i * 9, y - 22, 7, 5); }
        if (a.stance) { c.fillStyle = '#cfe8ff'; c.font = '700 8px "Press Start 2P"'; c.fillText('STANCE', a.x, y - 24); }
        if (a.frostOn) { c.strokeStyle = 'rgba(160,230,255,.7)'; c.lineWidth = 1.5; c.beginPath(); c.ellipse(a.x, a.y - 30 * (a.size || 1), 20 * (a.size || 1), 34 * (a.size || 1), 0, 0, 7); c.stroke(); }
        if (this.me() && this.me().sight && a.next) { const u = a.next.hits.some(h => h.unp), el = elOf(a.next); c.font = '800 10px "Nunito"'; c.fillStyle = '#000'; const nt = '◉ ' + a.next.name + (el ? ' · ' + ELEM[el][0] : ''); c.fillText(nt, a.x + 1, y + 18); c.fillStyle = u ? '#ff6a6a' : el ? ELEM[el][1] : '#7fe8ff'; c.fillText(nt, a.x, y + 17); }
        if (a.drawn) { c.strokeStyle = 'rgba(95,216,255,.7)'; c.lineWidth = 1.5; c.beginPath(); c.ellipse(a.x, a.y, 20, 7, 0, 0, 7); c.stroke(); }
      }
      if (lift || lean) c.restore();
      c.restore();
    }
    if (B.bar) { const b = B.bar, L = b.x - b.h / 2, Y = b.y, hh = 8; // a slim horizontal bar; the marker sweeps left↔right
      c.fillStyle = 'rgba(0,0,0,.75)'; c.fillRect(L - 3, Y - hh / 2 - 3, b.h + 6, hh + 6);
      c.fillStyle = '#2a2f36'; c.fillRect(L, Y - hh / 2, b.h, hh);
      const xOf = p => L + p * b.h;
      c.fillStyle = 'rgba(70,224,112,.9)'; c.fillRect(xOf(b.center - b.half), Y - hh / 2, b.half * 2 * b.h, hh);
      c.fillStyle = '#ffd34a'; c.fillRect(xOf(b.center - b.phalf), Y - hh / 2, b.phalf * 2 * b.h, hh);
      const px = xOf(b.done ? b.at : b.pos());
      c.fillStyle = b.done ? (b.res === 'perfect' ? '#ffd34a' : b.res === 'good' ? '#c9f7d6' : '#ff6a6a') : '#ffffff';
      c.save(); c.shadowColor = c.fillStyle; c.shadowBlur = 8; c.fillRect(px - 1.5, Y - hh / 2 - 5, 3, hh + 10); c.restore(); }
    if (B.orb) { const o = B.orb, ow = o.owner; o.x = lerp(o.x, ow.x - 34, .08); o.y = lerp(o.y, ow.y - 82 + Math.sin(t / 300) * 5, .08);
      c.save(); c.globalCompositeOperation = 'lighter'; const g = c.createRadialGradient(o.x, o.y, 1, o.x, o.y, 22); g.addColorStop(0, 'rgba(230,250,255,.95)'); g.addColorStop(.35, 'rgba(80,200,255,.75)'); g.addColorStop(1, 'rgba(80,200,255,0)'); c.fillStyle = g; c.beginPath(); c.arc(o.x, o.y, 22, 0, 7); c.fill();
      c.strokeStyle = 'rgba(120,220,255,.7)'; c.lineWidth = 1.5; for (let i = 0; i < 3; i++) { c.beginPath(); c.arc(o.x, o.y, 12 + i * 4, t / (200 + i * 80) + i, t / (200 + i * 80) + i + 2); c.stroke(); } c.restore();
      c.fillStyle = '#bfefff'; c.font = '700 7px "Press Start 2P"'; c.textAlign = 'center'; c.fillText('◆'.repeat(o.charges), o.x, o.y + 30); }
    for (const a of B.actors) if (!a.ko && (a.sight || a.azure)) { c.save(); c.globalCompositeOperation = 'lighter'; const col = a.azure ? '80,200,255' : '70,255,140'; const g = c.createRadialGradient(a.x, a.y - 30, 6, a.x, a.y - 30, 46); g.addColorStop(0, `rgba(${col},.0)`); g.addColorStop(.7, `rgba(${col},${.16 + Math.sin(t / 180) * .06})`); g.addColorStop(1, `rgba(${col},0)`); c.fillStyle = g; c.fillRect(a.x - 50, a.y - 80, 100, 100); c.restore(); }
    if (T) { const a = T.list[T.i]; const y = a.y - 92 + Math.sin(t / 150) * 3; c.fillStyle = T.side === 'e' ? '#ffd34a' : '#46ff95'; c.beginPath(); c.moveTo(a.x - 7, y); c.lineTo(a.x + 7, y); c.lineTo(a.x, y + 9); c.fill(); }
    // rings
    for (const r of B.rings) {
      const k = clamp(r.prog ? r.prog(performance.now()) : (performance.now() - r.t0) / r.dur, 0, 1.2), rad = lerp(86, 20, Math.min(1, k));
      c.lineWidth = 4; c.strokeStyle = '#000'; c.globalAlpha = .5; c.beginPath(); c.arc(r.x, r.y, rad, 0, 7); c.stroke();
      c.lineWidth = 3; c.strokeStyle = r.color; c.globalAlpha = .95; c.beginPath(); c.arc(r.x, r.y, rad, 0, 7); c.stroke();
      c.fillStyle = r.color; c.globalAlpha = .12 + .25 * Math.min(1, k); c.beginPath(); c.arc(r.x, r.y, 20, 0, 7); c.fill();
      c.lineWidth = 2.5; c.globalAlpha = .8; c.beginPath(); c.arc(r.x, r.y, 20, 0, 7); c.stroke();
      if (r.kind === 'feint' || r.kind === 'snap' || RING_STYLE[r.kind]) { c.globalAlpha = 1; c.font = '700 9px "Press Start 2P"'; c.textAlign = 'center'; c.lineWidth = 3; c.strokeStyle = '#000'; const tx = RING_STYLE[r.kind] ? RING_STYLE[r.kind].label : r.kind === 'feint' ? 'FEINT' : 'QUICK'; c.strokeText(tx, r.x, r.y - 96); c.fillStyle = r.color; c.fillText(tx, r.x, r.y - 96); }
      if (r.kind === 'unp') { c.globalAlpha = 1; c.fillStyle = '#ff5050'; c.font = '700 12px "Press Start 2P"'; c.textAlign = 'center'; c.fillText('!!', r.x, r.y - 22); }
      c.globalAlpha = 1;
    }
    // particles
    for (const p of B.fx) {
      if (p.proj) { const now = performance.now(); if (now < p.ts) continue; const u = clamp((now - p.ts) / (p.te - p.ts), 0, 1), [px, py, pa] = projPos(p, u), K = PROJ[p.proj] || {};
        if (!K.orb && !K.leaf) { c.save(); c.globalAlpha = .25; c.strokeStyle = '#ffffff'; c.lineWidth = 1; c.beginPath(); const [qx, qy] = projPos(p, Math.max(0, u - .12)); c.moveTo(qx, qy); c.lineTo(px, py); c.stroke(); c.restore(); }
        if (K.orb) for (let i = 4; i >= 1; i--) { const [qx, qy] = projPos(p, Math.max(0, u - i * .045)); c.save(); c.globalAlpha = .18 * (5 - i) / 4; paintProj(c, p.proj, qx, qy, pa, now, .7); c.restore(); }
        c.save(); if (p.life < 1e8) c.globalAlpha = Math.max(0, 1 - p.t / p.life); paintProj(c, p.proj, px, py, pa, now, p.sc || 1); c.restore(); continue; }
      if (p.half) { const k2 = p.t / p.life; c.save(); c.globalAlpha = 1 - k2; c.translate(p.x + p.vx * p.t / 16, p.y + p.vy * p.t / 16 + k2 * k2 * 20); c.rotate(p.r0 + p.vr * p.t / 16);
        c.beginPath(); c.rect(-30, p.top ? -30 : 0, 60, 30); c.clip(); paintProj(c, p.kind, 0, 0, 0, 0, 1); c.restore();
        if (p.t < 90) { c.save(); c.globalCompositeOperation = 'lighter'; c.strokeStyle = `rgba(230,255,240,${1 - p.t / 90})`; c.lineWidth = 2; c.beginPath(); c.moveTo(p.x - 16, p.y + 6); c.lineTo(p.x + 16, p.y - 6); c.stroke(); c.restore(); }
        continue; }
      const k = p.t / p.life;
      if (p.orb) {
        const R = p.kind === 'draw' ? 38 * (1 - k * .55) : 8 + 26 * k, col = p.kind === 'draw' ? '80,200,255' : '255,60,50';
        c.save(); c.globalCompositeOperation = 'lighter';
        const g = c.createRadialGradient(p.x, p.y, 0, p.x, p.y, R); g.addColorStop(0, `rgba(255,255,255,${.9 * (1 - k)})`); g.addColorStop(.35, `rgba(${col},${.75 * (1 - k)})`); g.addColorStop(1, `rgba(${col},0)`);
        c.fillStyle = g; c.beginPath(); c.arc(p.x, p.y, R, 0, 7); c.fill();
        c.strokeStyle = `rgba(${col},${.85 * (1 - k)})`; c.lineWidth = 2;
        for (let i = 0; i < 5; i++) { const q = p.kind === 'draw' ? 1 - ((k * 4 + i / 5) % 1) : ((k * 3 + i / 5) % 1); const r2 = R * (.4 + 1.6 * q), a0 = p.t / (p.kind === 'draw' ? 90 : -140) + i * 1.3;
          c.beginPath(); c.arc(p.x, p.y, r2, a0, a0 + 1.8); c.stroke(); }
        c.restore(); continue;
      }
      if (p.hline) { const u = Math.min(1, k * 3); c.save(); c.globalCompositeOperation = 'lighter'; c.lineCap = 'round';
        c.strokeStyle = `rgba(255,255,255,${1 - k})`; c.lineWidth = 3; c.beginPath(); c.moveTo(p.x1, p.y); c.lineTo(lerp(p.x1, p.x2, u), p.y); c.stroke();
        c.strokeStyle = `rgba(160,230,255,${.5 * (1 - k)})`; c.lineWidth = 12 * (1 - k); c.stroke(); c.restore(); continue; }
      if (p.kick) { c.save(); c.strokeStyle = p.col; c.globalAlpha = (1 - k) * .9; c.lineWidth = 2.5 * (1 - k) + .5; c.beginPath(); c.ellipse(p.x, p.y, p.R * (.3 + k), p.R * .3 * (.3 + k), 0, 0, 7); c.stroke(); c.restore(); continue; }
      if (p.dline) { c.save(); c.globalCompositeOperation = 'lighter'; c.lineCap = 'round'; const gr = c.createLinearGradient(p.x1, p.y1, p.x2, p.y2); gr.addColorStop(0, 'rgba(255,255,255,0)'); gr.addColorStop(1, p.col); c.strokeStyle = gr; c.globalAlpha = 1 - k; c.lineWidth = p.w * (1 - k * .6); c.beginPath(); c.moveTo(p.x1, p.y1); c.lineTo(p.x2, p.y2); c.stroke(); c.restore(); continue; }
      if (p.ghost) { c.save(); c.globalAlpha = (p.a0 || .55) * (1 - k); if (p.flip) { c.translate(p.x, 0); c.scale(-1, 1); c.translate(-p.x, 0); } drawBT(c, tinted(p.img, p.col || '#7dffb0'), p.anim, p.fr, p.x, p.y, p.s); c.restore(); continue; }
      if (p.blinkIn) { c.save(); c.globalCompositeOperation = 'lighter'; c.strokeStyle = p.col || '#7dffb0'; c.globalAlpha = 1 - k; c.lineWidth = 2; c.beginPath(); c.ellipse(p.x, p.y, 8 + 30 * k, 3 + 40 * k, 0, 0, 7); c.stroke(); c.restore(); continue; }
      if (p.clash) { c.save(); c.globalCompositeOperation = 'lighter'; c.strokeStyle = `rgba(255,240,180,${1 - k})`; c.lineWidth = 3 * (1 - k); for (let i = 0; i < 8; i++) { const an = i * Math.PI / 4 + .3; c.beginPath(); c.moveTo(p.x + Math.cos(an) * 6, p.y + Math.sin(an) * 6); c.lineTo(p.x + Math.cos(an) * (10 + 30 * k), p.y + Math.sin(an) * (10 + 30 * k)); c.stroke(); } c.restore(); continue; }
      if (p.field) { c.save(); c.globalCompositeOperation = 'lighter'; c.strokeStyle = `rgba(70,255,140,${.8 * (1 - k)})`; c.lineWidth = 2;
        for (let i = 0; i < 6; i++) { const an = i * Math.PI / 3 + p.t / 400; c.beginPath(); c.moveTo(p.x + Math.cos(an) * 34, p.y + Math.sin(an) * 40); c.lineTo(p.x + Math.cos(an + Math.PI / 3) * 34, p.y + Math.sin(an + Math.PI / 3) * 40); c.stroke(); }
        c.fillStyle = `rgba(70,255,140,${.12 * (1 - k)})`; c.beginPath(); c.ellipse(p.x, p.y, 34, 40, 0, 0, 7); c.fill(); c.restore(); continue; }
      if (p.sphere) { if (p.life === 0) continue; c.save(); c.globalCompositeOperation = 'lighter'; const R = p.r;
        const g = c.createRadialGradient(p.x, p.y, 0, p.x, p.y, R * 1.9); g.addColorStop(0, 'rgba(255,240,230,1)'); g.addColorStop(.3, 'rgba(255,70,50,.95)'); g.addColorStop(.7, 'rgba(170,10,20,.5)'); g.addColorStop(1, 'rgba(120,0,0,0)');
        c.fillStyle = g; c.beginPath(); c.arc(p.x, p.y, R * 1.9, 0, 7); c.fill(); c.strokeStyle = 'rgba(255,140,110,.8)'; c.lineWidth = 2;
        for (let i = 0; i < 3; i++) { const a0 = performance.now() / (120 + i * 40) + i * 2; c.beginPath(); c.arc(p.x, p.y, R * (1.1 + i * .25), a0, a0 + 2.2); c.stroke(); } c.restore(); continue; }
      if (p.burst) { c.save(); c.globalCompositeOperation = 'lighter'; const R = 20 + k * (p.red ? 120 : 90), col = p.red ? '255,70,50' : '220,255,240';
        c.strokeStyle = `rgba(${col},${1 - k})`; c.lineWidth = 6 * (1 - k) + 1; c.beginPath(); c.arc(p.x, p.y, R, 0, 7); c.stroke();
        const g = c.createRadialGradient(p.x, p.y, 0, p.x, p.y, R); g.addColorStop(0, `rgba(${col},${.6 * (1 - k)})`); g.addColorStop(1, `rgba(${col},0)`); c.fillStyle = g; c.beginPath(); c.arc(p.x, p.y, R, 0, 7); c.fill(); c.restore(); continue; }
      if (p.beam) {
        c.save(); c.globalCompositeOperation = 'lighter'; c.lineCap = 'round';
        c.strokeStyle = p.blue ? `rgba(80,200,255,${.8 * (1 - k)})` : `rgba(255,60,50,${.8 * (1 - k)})`; c.lineWidth = (p.blue ? 8 : 16) * (1 - k * .6); c.beginPath(); c.moveTo(p.x1, p.y1); c.lineTo(p.x2, p.y2); c.stroke();
        c.strokeStyle = `rgba(255,240,230,${1 - k})`; c.lineWidth = 4 * (1 - k * .6); c.stroke(); c.restore(); continue;
      }
      if (p.pillar) { const g = c.createLinearGradient(p.x, 0, p.x, p.y); g.addColorStop(0, 'rgba(70,255,140,0)'); g.addColorStop(1, `rgba(70,255,140,${.7 * (1 - k)})`); c.fillStyle = g; c.fillRect(p.x - 14 * (1 - k * .5), 0, 28 * (1 - k * .5), p.y); continue; }
      c.globalAlpha = 1 - k; c.fillStyle = p.col; c.fillRect(p.x + p.vx * p.t / 16, p.y + p.vy * p.t / 16 + k * k * 30, p.s, p.s);
    }
    c.globalAlpha = 1;
    for (const x of B.texts) {
      const k = x.t / 1100; c.globalAlpha = k > .75 ? (1 - k) * 4 : 1;
      c.font = (x.big ? '700 15px' : '700 12px') + ' "Press Start 2P"'; c.textAlign = 'center'; c.lineJoin = 'round';
      const y = x.y - Math.min(1, k * 3) * 18;
      c.strokeStyle = '#000'; c.lineWidth = 4; c.strokeText(x.s, x.x, y); c.fillStyle = x.col; c.fillText(x.s, x.x, y);
    }
    c.globalAlpha = 1; c.restore();
    if (World.scene && World.scene.realm) Weather.render(c, t);
    if (B.flash > 0) { c.fillStyle = `rgba(255,255,255,${Math.min(.8, B.flash)})`; c.fillRect(0, 0, W, H); }
  }
};
// canvas taps for targeting
cv.addEventListener('pointerdown', e => {
  if (G.mode !== 'battle' || !Battle.B) return;
  Battle.tapAt(e.clientX / innerWidth * G.view.w, e.clientY / innerHeight * (G.view.fullH || G.view.h));
});
$('#tgtHint').addEventListener('pointerdown', e => { e.preventDefault(); Battle.confirmTarget(); });
addEventListener('keydown', e => {
  if (G.mode !== 'battle' || !Battle.B) return;
  const T = Battle.B.targeting;
  if (T && (e.key === 'ArrowLeft' || e.key === 'ArrowRight' || e.key === 'ArrowUp' || e.key === 'ArrowDown')) { T.i = (T.i + (e.key === 'ArrowRight' || e.key === 'ArrowDown' ? 1 : -1) + T.list.length) % T.list.length; sfx('blip'); e.preventDefault(); return; }
  if (e.key === 'ArrowUp' || e.key === 'ArrowDown') { if (Battle.menuKey(e.key === 'ArrowUp' ? 'up' : 'down')) e.preventDefault(); }
});
