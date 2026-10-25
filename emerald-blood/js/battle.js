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
  sight: { name: 'Emerald Sight', strain: 20, mp: 8, desc: 'Open your eyes all the way. For 3 turns dodging and parrying become FAR easier, and you see every enemy\'s next move. Drinks a lot of mana.', type: 'sight', blaze: 1 },
  azure: { name: 'Azure Tide', strain: 35, mp: 6, desc: 'The blue aura. For 3 turns you move faster, and an Azure orb holds the field: it strikes alongside your Attacks and SWALLOWS enemy magic and aura attacks (up to 3).', type: 'azure', blaze: 1, brk: 6 },
  crimson: { name: 'Crimson Tide', strain: 55, mp: 9, desc: 'The red aura, unleashed. A devastating crimson burst at one enemy: ×3.2, pierces every defense, hurls them back and delays their turn.', type: 'cast', hits: [{ m: 3.2 }], blaze: 1, brk: 26 },
  veil: { name: 'Smoke Veil', strain: 25, mp: 3, desc: 'Kess melts into shadow: enemies lose track of her for 2 turns.', type: 'veil' }
};
const LINKS = {
  oren: { name: 'TWIN FANG', mp: [5, 4], desc: 'Link Art with Oren. 4 alternating timed hits.', lines: [['oren', 'Now, {name}! Like I taught you!'], ['me', "Right behind you, Oren!"]], hits: 4, m: 1.15 },
  kess: { name: 'EMERALD ECLIPSE', mp: [6, 4], desc: 'Link Art with Kess. 5 timed hits from light and shadow.', lines: [['kess', "Twelve years I've hidden this fire…"], ['me', '…so let it burn. Together!']], hits: 5, m: 1.2 }
};
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
const ELEM = { fire: ['Fire', '#ff7a3a'], water: ['Water', '#4aa8ff'], ice: ['Ice', '#9fe4ff'], lightning: ['Lightning', '#ffe14a'], earth: ['Earth', '#c79a5a'], wind: ['Wind', '#bfe8d0'], light: ['Light', '#fff3b0'], mana: ['Raw Mana', '#46ff95'] };
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
const Battle = {
  B: null,
  // Drag reflex: Drag bodies move more efficiently — wider timing windows. The Verdant Eye widens them further.
  reflex(a) { if (!a || a.side !== 'p') return 1; let k = a.blind ? .6 : 1; if (a.isMe || (ALLY[a.id] && ALLY[a.id].drag)) k *= 1.25; if (a.sight) k *= 1.85; return k; },
  chooseSkill(e) { const pool = e.E.skills.filter(s => s.hits); let r = Math.random(), sk = pool[0]; for (const s of pool.slice(1)) { if (r < (s.w || .3)) { sk = s; break; } r -= (s.w || .3); } return sk; },
  async start(cfg) {
    if (typeof cfg === 'string') cfg = { enemies: [cfg] };
    const prevMode = G.mode; G.mode = 'battle'; Dlg.close(); UI.controls(false); $('#hud').classList.add('hide'); $('#hudR').classList.add('hide');
    const bdKey = cfg.bd || (SCENES[G.S.map] && SCENES[G.S.map].bd) || 'field';
    G.img['bd_' + bdKey] = G.img['bd_' + bdKey] || await loadImg('assets/bd_' + bdKey + '.jpg');
    const B = this.B = { cfg, bd: G.img['bd_' + bdKey], actors: [], fx: [], texts: [], rings: [], flash: 0, shake: 0, dim: 0, dimCol: '0,0,0', timeScale: 1,
      blazed: false, over: null, turn: 0, tutorial: cfg.tutorial ? { dodge: 1, parry: 1, hit: 1 } : null, log: [], press: [] };
    // party
    const W = G.view.w;
    const pSlots = [[W - 150, 205], [W - 112, 262], [W - 188, 150]];
    const eSlots = [[150, 210], [96, 262], [196, 152], [70, 160]];
    const S = G.S.stats;
    const SB = Stones.bonus(); B.sb = SB;
    B.actors.push(this.mk({ side: 'p', id: 'me', name: G.S.name, color: '#1f8a4c', isMe: true, hp: S.hp, maxHp: S.maxHp, mp: S.mp, maxMp: S.maxMp, atk: S.atk + SB.atk, def: S.def + SB.def, spd: S.spd, arts: G.S.arts, slot: pSlots[0], strainMax: 100 + SB.cap }));
    const allies = cfg.allies || G.S.party;
    for (let i = 0; i < allies.length; i++) {
      const id = allies[i], A = ALLY[id], st = G.S.allies[id] || {};
      const lv = G.S.lvl - 1;
      const maxHp = A.hp + lv * 7, maxMp = A.mp + lv * 2;
      B.actors.push(this.mk({ side: 'p', id, name: A.name, color: A.color, atkAnim: A.atkAnim, img: await npcImg(A.sprite), hp: st.hp ?? maxHp, maxHp, mp: st.mp ?? maxMp, maxMp,
        atk: A.atk + lv * 2, def: A.def + lv, spd: A.spd, arts: A.arts, slot: pSlots[i + 1] }));
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
    if (B.blazed) { G.S.hood = false; if (cfg.witness) Story.addSus(cfg.witness); }
    if (result === 'win' && Story.rankCheck) setTimeout(() => Story.rankCheck(), 50);
    this.ui(false);
    G.mode = prevMode === 'battle' ? 'world' : 'world'; UI.controls(true); UI.hud();
    if (World.scene && World.scene.music) Music.play(typeof World.scene.music === 'function' ? World.scene.music() : World.scene.music);
    this.B = null;
    return result;
  },
  mk(o) { return Object.assign({ strain: 0, strainMax: 100, fever: 0, ko: false, anim: 'combat', frame: 0, at: 0, loopAnim: 'combat', x: o.slot[0], y: o.slot[1], hx: o.slot[0], hy: o.slot[1], ward: 0, guard: false, brk: 0, broken: 0, veil: 0, bind: 0, alpha: 1 }, o); },
  me() { return this.B.actors.find(a => a.isMe); },
  alive(side) { return this.B.actors.filter(a => a.side === side && !a.ko); },
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
      a.strain = Math.max(0, a.strain - (12 + (a.isMe ? B.sb.cool : 0)));
      if (a.sight) { a.sight--; if (!a.sight) this.text(a, 'Sight fades', '#7fbf9a', -30); }
      if (a.azure) { a.azure--; if (!a.azure) { a.spd = a.baseSpd || a.spd; if (B.orb && B.orb.owner === a) { B.orb = null; this.text(a, 'The Azure orb dissolves', '#5fd8ff', -30); } } }
      if (a.fever) { a.fever--; const d = Math.max(1, Math.round(a.maxHp * .06)); a.hp = Math.max(1, a.hp - d); this.text(a, 'BLOOD FEVER -' + d, '#ff5a3a', -20); if (!a.fever) a.strain = Math.min(a.strain, 50); }
      this.hud();
      const partner = B.actors.find(x => x.side === 'p' && !x.isMe && !x.ko && LINKS[x.id]);
      const menu = () => {
        const L = [['Attack', 'Two timed strikes. Tap as the ring closes for a PERFECT.', () => this.pickTarget(a, t => this.doAttack(a, t).then(done))]];
        L.push([a.isMe ? 'Drag Arts' : 'Skills', a.isMe ? 'Draw on the dragon\'s blood. Powerful, but your eyes will blaze.' : 'Special techniques.', () => sub()]);
        if (a.isMe && partner) {
          const Lk = LINKS[partner.id], ok = a.mp >= Lk.mp[0] && partner.mp >= Lk.mp[1] && !a.fever && !partner.fever && a.strain + 40 <= a.strainMax && partner.strain + 40 <= partner.strainMax;
          L.push(['Link Art', `${Lk.name}: ${Lk.desc} (${G.S.name} ${Lk.mp[0]} MP + ${partner.name} ${Lk.mp[1]} MP · Strain +40 each)`, () => ok ? this.pickTarget(a, t => this.doLink(a, partner, t).then(done)) : toast('Not enough MP — or your blood is running too hot.'), !ok]);
        }
        if (a.isMe && G.S.f.cultivation) L.push(['Cultivate', 'Tomb Breath: drink the mana in the air. +5 MP, cool your blood (Strain -40), and your next strike is a guaranteed PERFECT.', () => { const g = 5 + (World.scene && World.scene.realm ? 3 : 0); a.mp = Math.min(a.maxMp, a.mp + g); a.focus = 1; a.calmNext = 1; a.strain = Math.max(0, a.strain - 40); sfx('heal'); this.spark(a.x, a.y - 30, '#46ff95', 22); this.text(a, '+' + g + ' MP · FOCUS', '#46ff95'); this.hud(); done(); }]);
        L.push(['Guard', 'Halve damage until your next turn, recover 3 MP and steady your blood (Strain -30).', () => { a.guard = true; a.calmNext = 1; a.mp = Math.min(a.maxMp, a.mp + 3); a.strain = Math.max(0, a.strain - 30); this.text(a, 'GUARD', '#9ad1ff'); this.hud(); done(); }]);
        L.push([`Items`, `Tonic ×${G.S.items.tonic}  ·  Ether ×${G.S.items.ether}`, () => items()]);
        if (a.isMe && !B.cfg.noFlee) L.push(['Flee', 'Try to escape (70%).', async () => { this.closeMenu(); if (Math.random() < 0.7) { await this.msg('You slip away!', 900); resolve('flee'); } else { await this.msg("Can't escape!", 900); done(); } }]);
        this.openMenu(L, null);
      };
      const sub = () => {
        const L = a.arts.map(k => { const A = ARTS[k], cost = this.artCost(a, k), st = this.artStrain(a, k), hot = a.fever || a.strain + st > a.strainMax;
          return [A.name, A.desc + `  ⚡ Strain +${st}` + (hot ? (a.fever ? '  — BLOOD FEVER: your arts are locked.' : '  — too hot! Guard or Cultivate to cool down.') : '') + (a.isMe && Stones.artBoost(k) > 1 ? `  ◆ Stone-boosted ×${Stones.artBoost(k).toFixed(2)}` : ''), () => this.useArt(a, k).then(done), a.mp < cost || hot, cost]; });
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
      const b = document.createElement('button'); b.innerHTML = esc(it[0]) + (it[4] !== undefined ? `<small>${it[4]} MP</small>` : '');
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
    $('#cmdDesc .scroll').textContent = L[i][1];
    const c = $('#cmdCost'); c.classList.toggle('on', L[i][4] !== undefined); if (L[i][4] !== undefined) c.textContent = 'Cost  ' + L[i][4];
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
  async qte(target, dur, color, who) {
    const B = this.B; dur = dur || rnd(470, 640); const rk = this.reflex(who || B.cur);
    if (B.tutorial && B.tutorial.hit) { B.tutorial.hit = 0; B.timeScale = 0.4; await this.msg('Tap when the ring closes on the center!', 1200, true); }
    const ring = { x: target.x, y: target.y - 30, t0: performance.now(), dur: dur / B.timeScale, kind: 'hit', color: color || '#ffd34a' }; B.rings.push(ring);
    $('#hitTap').classList.remove('hide');
    const T = ring.t0 + ring.dur;
    const res = await new Promise(r => {
      let done = false;
      const prevA = Input.handlers.a;
      const fin = v => { if (done) return; done = true; Input.on('a', prevA); hit.removeEventListener('pointerdown', h); r(v); };
      const judge = () => { const d = Math.abs(performance.now() - T) * B.timeScale; fin(d <= 75 * rk ? 'perfect' : d <= 170 * rk ? 'good' : 'miss'); };
      const hit = $('#hitTap'); const h = e => { e.preventDefault(); judge(); };
      hit.addEventListener('pointerdown', h); Input.on('a', judge);
      const ck = () => { if (done) return; if (performance.now() > T + 175 * rk / B.timeScale) fin('miss'); else requestAnimationFrame(ck); }; ck();
    });
    // wait until impact moment for sync
    const left = T - performance.now(); if (left > 0) await wait(left);
    B.rings = B.rings.filter(x => x !== ring); $('#hitTap').classList.add('hide'); B.timeScale = 1;
    return res;
  },
  async dash(a, x, y, ms) { const fx = a.x, fy = a.y, t0 = performance.now(); a.anim = 'run'; a.loopAnim = 'run';
    ms = Math.max(ms, Math.hypot(x - fx, y - fy) / .55);
    while (true) { const k = Math.min(1, (performance.now() - t0) / ms); a.x = lerp(fx, x, k); a.y = lerp(fy, y, k); if (k >= 1) break; await wait(16); }
    a.loopAnim = 'combat'; a.anim = 'combat'; },
  async home(a) { await this.dash(a, a.hx, a.hy, 260); },
  play(a, anim, n, ms) { a.anim = anim; a.frame = 0; a.at = 0; a.fn = n; a.fms = ms; a.once = true; return wait(n * ms); },
  async strike(a, t, hit, mult, opts) {
    // windup then QTE then impact
    a.anim = hit.anim; a.frame = 0; a.once = true; a.fn = 99; a.fms = 1e9; a.glow = !!hit.glow;
    let g; if (opts.auto) g = 'good'; else if (a.focus) { a.focus = 0; g = await this.qte(t, 0, 0, a); g = 'perfect'; } else g = await this.qte(t, 0, 0, a);
    this.play(a, hit.anim, { slash: 6, halfslash: 6, backslash: 13, spellcast: 7, thrust: 8, jump: 5, run: 8 }[hit.anim] || 6, hit.anim === 'backslash' ? 45 : 70);
    a.frame = hit.anim === 'backslash' ? 4 : 2;
    sfx('swing');
    return this.resolveHit(a, t, hit.m * mult, g, opts);
  },
  resolveHit(a, t, m, grade, opts) {
    const B = this.B; if (t.ko) return 'ko';
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
    let dmg = Math.max(1, Math.round((a.atk * m) * (grade === 'perfect' ? 1.5 : grade === 'good' ? 1 : 0.6) * rnd(.9, 1.1) - t.def * (t.broken ? 0 : 1)));
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
  damage(t, dmg, big) {
    const M = t.E && t.E.morph;
    t.hp = Math.max(M && !t.exhausted ? 1 : 0, t.hp - dmg); if (M && !t.morphed && t.hp < t.maxHp * M.at) t.pendMorph = 1;
    this.text(t, String(dmg), t.side === 'e' ? '#fff' : '#ff8080', 0, big);
    sfx(big ? 'crit' : 'hit'); this.B.shake = big ? 9 : 5; t.hurtT = 220; this.spark(t.x, t.y - 30, big ? '#ffe36a' : '#fff', big ? 16 : 9);
    if (t.hp <= 0 && !t.ko) { t.ko = true; t.anim = 'hurt'; t.once = true; t.frame = 0; t.fn = 6; t.fms = 90; t.at = 0; t.loopAnim = 'hurt'; this.text(t, t.side === 'e' ? 'DEFEATED' : 'DOWN', '#ff6b6b', -20); }
    this.hud();
  },
  checkBreak(t) { if (t.brk >= t.brkMax && !t.broken) { t.broken = 1; t.brk = t.brkMax; sfx('break'); this.text(t, 'BREAK!', '#ffd34a', -24, true); this.B.flash = .6; t.wait += 100 / t.spd; } },
  hop(t) { const x0 = t.x, d = t.side === 'e' ? -26 : 26; let k = 0; const it = setInterval(() => { k++; t.x = x0 + Math.sin(k / 8 * Math.PI) * d; if (k >= 8) { clearInterval(it); t.x = x0; } }, 22); },
  async doAttack(a, t) {
    const B = this.B; await this.dash(a, t.x + (a.side === 'p' ? 52 : -52), t.y + 2, 260);
    const seq = a.atkAnim ? [{ anim: a.atkAnim, m: .8 }, { anim: a.atkAnim, m: .9 }] : [{ anim: 'slash', m: .75 }, { anim: a.isMe ? 'backslash' : 'halfslash', m: .85 }];
    let parried = 0;
    for (const h of seq) { if (t.ko) break; const r = await this.strike(a, t, h, 1, { src: 'attack' }); if (r === 'parried') parried++; await wait(160); }
    a.glow = false;
    if (B.orb && B.orb.owner === a && !t.ko) { B.fx.push({ beam: 1, blue: 1, x1: B.orb.x, y1: B.orb.y, x2: t.x, y2: t.y - 30, t: 0, life: 380 }); sfx('art'); this.spark(t.x, t.y - 30, '#5fd8ff', 18); this.text(t, 'AZURE ORB', '#5fd8ff', -50); this.resolveHit(a, t, .7, 'good', { unblockable: 1, src: 'azure' }); await wait(200); }
    if (t.stanceHit) { t.stanceHit = 0; t.stance = 0; await this.msg(`${t.name}: "Too eager, pup."`, 1000); await this.enemyStrike(t, a, { name: 'Empty Sleeve', hits: [{ anim: 'slash', m: 1.6, w: 420 }] }, true); await this.home(a); return; }
    if (parried === seq.length && !t.ko) { await this.msg(`${t.name} reads every blow — COUNTER!`, 900); await this.enemyStrike(t, a, { name: 'Counter', hits: [{ anim: t.E.skills[0].hits[0].anim, m: 1.2, w: 520 }] }, true); }
    await this.home(a);
  },
  async useArt(a, k) {
    const B = this.B, A = ARTS[k], cost = this.artCost(a, k), boost = a.isMe ? Stones.artBoost(k) : 1;
    this.closeMenu(); a.mp -= cost; a.strain += this.artStrain(a, k);
    if (a.strain >= a.strainMax * .9 && !a.fever) { a.fever = 2; B.flash = .4; this.text(a, 'BLOOD FEVER!', '#ff5a3a', -60, true); sfx('alarm'); }
    if (a.isMe && B.sb.verdict) { const d = Math.max(1, Math.round(a.maxHp * .04)); a.hp = Math.max(1, a.hp - d); this.text(a, 'VERDICT -' + d, '#fff3b0', -70); }
    this.hud();
    if (A.blaze && a.isMe) { if (!B.blazed) { B.blazed = true; if (G.S.hood) { G.S.hood = false; this.text(a, 'Hood burns back!', '#46ff95', -50); } } }
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
    } else if (A.type === 'sight') {
      if (a.isMe) await Cine.play([{ bg: 'eyes', fx: ['mana'], dur: 1300, fadeIn: 120, tapEnds: true, cam: [[0, 320, 190, 1], [1300, 320, 178, 1.25]], vignette: 'rgba(0,30,10,.7)',
        actors: [{ port: 'me', expr: artHas('me', 'sight') ? 'sight' : 'anger', x: 320, y: 400, scale: 3.4 }], ev: [[650, s => { s.flash = .9; s.flashCol = '90,255,150'; sfx('art'); }]] }]);
      await this.play(a, 'spellcast', 7, 70); a.sight = 3; B.flash = .5; sfx('art');
      this.spark(a.x - 4, a.y - 50, '#46ff95', 30); this.text(a, 'EMERALD SIGHT', '#7dffb0', -40, true); await wait(300);
    } else if (A.type === 'azure') {
      await this.play(a, 'spellcast', 7, 80); sfx('chant');
      a.azure = 3; if (!a.baseSpd) a.baseSpd = a.spd; a.spd = a.baseSpd * 1.45; a.wait *= .6;
      B.orb = { owner: a, x: a.x - 30, y: a.y - 80, charges: 3, born: performance.now() };
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
      await this.play(a, 'spellcast', 7, 70);
      B.fx.push({ orb: 1, kind: 'cast', x: a.x - 22, y: a.y - 36, t: 0, life: 700 }); sfx('chant');
      const g = await this.qte(t, rnd(420, 560), '#ff4a4a', a);
      B.fx.push({ beam: 1, x1: a.x - 22, y1: a.y - 36, x2: t.x, y2: t.y - 30, t: 0, life: 420 }); sfx('crit'); B.flash = .5; B.shake = 12;
      this.spark(t.x, t.y - 30, '#ff5a4a', 30);
      this.resolveHit(a, t, A.hits[0].m * boost, g, { brk: A.brk, unblockable: 1, pierce: 1, src: k }); B.tideUsed = 1;
      if (!t.ko) { t.wait += 40; this.text(t, 'HURLED BACK', '#ff6a5a', -24); await this.slide(t, t.hx - 70, t.hy, 160); await wait(220); await this.slide(t, t.hx, t.hy, 320); }
    } else if (A.type === 'all') {
      await this.play(a, 'spellcast', 7, 90);
      for (const h of A.hits) {
        const es = this.alive('e'); if (!es.length) break;
        const g = await this.qte(es[0], rnd(500, 650), '#46ff95', a);
        sfx('art'); B.flash = .5;
        for (const t of es) { this.pillar(t.x, t.y); this.resolveHit(a, t, h.m * boost, g, { brk: A.brk, unblockable: 1, src: k }); }
        await wait(200);
      }
    }
    B.dim = 0; a.alpha = a.veil ? .45 : 1; this.hud();
  },
  artCost(a, k) { return Math.max(1, ARTS[k].mp + (a.bind ? 2 : 0) - (a.isMe ? Stones.artMp(k) : 0)); },
  artStrain(a, k) { return Math.max(5, (ARTS[k].strain || 30) - (a.isMe ? this.B.sb.calm : 0)); },
  async summon(key, intro) {
    const B = this.B, E = ENEMY[key], used = B.actors.filter(a => a.side === 'e' && !a.ko).map(a => a.hx);
    const slots = [[150, 210], [96, 262], [196, 152], [70, 160]], sl = slots.find(s2 => !used.includes(s2[0])) || slots[3];
    const a = this.mk({ side: 'e', id: key + B.actors.length, key, name: E.name, hp: Math.round(E.hp * 1.3), maxHp: Math.round(E.hp * 1.3), mp: 0, maxMp: 0, atk: Math.round(E.atk * 1.18), def: E.def, spd: E.spd, dodge: E.dodge, parry: E.parry, brkMax: E.brk, E, slot: sl, spr: E.img || key, size: E.size || 1 });
    a.img = await npcImg(a.spr); a.next = this.chooseSkill(a); a.wait = 30; a.alpha = 0; B.actors.push(a);
    for (let i = 0; i <= 10; i++) { a.alpha = i / 10; await wait(30); } if (intro) this.text(a, intro, '#ffb070', -40, true); this.hud();
  },
  async slide(a, x, y, ms) { const fx = a.x, fy = a.y, t0 = performance.now();
    while (true) { const k = Math.min(1, (performance.now() - t0) / ms), e = 1 - (1 - k) * (1 - k); a.x = lerp(fx, x, e); a.y = lerp(fy, y, e); if (k >= 1) break; await wait(16); } },
  async adaptTick() {
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
    const B = this.B, M = e.E.morph; e.morphed = 1; e.adapt = {}; e.tempo = 1; e.wheel = 0; e.wheelAng = 0;
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
    if (E.howl && !e.howled && e.hp < e.maxHp * .5) { e.howled = 1; await this.msg(`${e.name}: HOWL`, 900); sfx('alarm'); B.shake = 10; for (const x of this.alive('e')) { x.atk = Math.round(x.atk * 1.2); this.text(x, 'ATK UP', '#ff8a6a', -20); } await this.summon('lupine', 'ANSWERS THE HOWL'); }
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
    const el = elOf(sk); if (!isCounter) await this.msg(`${e.name}: ${sk.name}${el ? '  [' + ELEM[el][0] + ']' : ''}`, 750);
    if (sk.hits.some(h => h.unp)) { this.text(e, '!! UNPARRYABLE', '#ff5050', -50, true); sfx('alarm'); await wait(450); }
    const ranged = sk.hits[0].anim === 'spellcast';
    if (B.orb && t.side === 'p' && (ranged || el) && !isCounter) {
      await this.msg(`The Azure orb swallows ${sk.name}!`, 900); sfx('heal'); B.flash = .3; const o = B.orb.owner; o.mp = Math.min(o.maxMp, o.mp + 2);
      B.fx.push({ orb: 1, kind: 'draw', x: B.orb.x, y: B.orb.y, t: 0, life: 700 }); this.text(o, 'ABSORBED +2 MP', '#5fd8ff', -40);
      if (--B.orb.charges <= 0) { B.orb = null; this.text(o, 'The orb is full — it bursts', '#5fd8ff', -60); } this.hud(); return;
    }
    if (!ranged) await this.dash(e, t.x - 54, t.y + 2, 280);
    $('#react').classList.remove('hide');
    let parries = 0, n = 0, streak = 0;
    for (const h of sk.hits) {
      if (t.ko) break; n++;
      const r = await this.defend(e, t, Object.assign({ el }, h));
      if (r === 'parry' || r === 'pparry') { parries++; streak++; if (streak >= 2) await this.clash(e, t, streak); } else streak = 0;
      await wait(120);
    }
    $('#react').classList.add('hide');
    const allParried = parries === n && n > 0 && !sk.hits.some(h => h.unp);
    if (!ranged) await this.home(e);
    if (allParried && !t.ko && !e.ko) {
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
      let slow = false;
      if (B.tutorial) {
        if (B.tutorial.dodge) { B.tutorial.dodge = 0; slow = true; await this.msg('Press DODGE as the ring closes!', 1300, true); }
        else if (B.tutorial.parry && !h.unp) { B.tutorial.parry = 0; slow = true; await this.msg('Now PARRY: tighter timing. Parry EVERY hit to counter!', 1600, true); }
      }
      B.timeScale = slow ? 0.38 : 1;
      const dur = w / B.timeScale, t0 = performance.now(), T = t0 + dur;
      const ring = { x: t.x, y: t.y - 30, t0, dur, kind: h.unp ? 'unp' : 'def', color: h.unp ? '#ff5050' : '#ffffff' };
      if (G.settings.ring || slow) B.rings.push(ring);
      e.anim = h.anim; e.frame = 0; e.once = true; e.fn = 99; e.fms = 1e9;
      let pressed = null;
      const onD = () => { if (!pressed) pressed = ['dodge', performance.now()]; $('#rxDodge').classList.add('on'); setTimeout(() => $('#rxDodge').classList.remove('on'), 120); };
      const onP = () => { if (!pressed) pressed = ['parry', performance.now()]; $('#rxParry').classList.add('on'); setTimeout(() => $('#rxParry').classList.remove('on'), 120); };
      Input.on('dodge', onD); Input.on('parry', onP);
      // animate swing so the impact frame lands on T
      const nF = { slash: 6, halfslash: 6, backslash: 13, spellcast: 7, thrust: 8, jump: 5, run: 8 }[h.anim] || 6, imp = Math.floor(nF / 2);
      const swingAt = T - imp * 60;
      while (performance.now() < T + 75 * rk / B.timeScale) {
        const now = performance.now();
        if (now >= swingAt && e.fms > 1e8) { e.fms = 60; e.at = 0; e.frame = 0; e.fn = nF; sfx('swing'); }
        await wait(10);
      }
      Input.on('dodge', null); Input.on('parry', null);
      B.rings = B.rings.filter(x => x !== ring); B.timeScale = 1;
      // judge
      let res = 'hit';
      if (pressed) {
        const d = (pressed[1] - T) * B.timeScale || (pressed[1] - T);
        const dd = (pressed[1] - T) * (slow ? 0.38 : 1);
        if (pressed[0] === 'dodge') { if (dd >= -110 * rk && dd <= 45 * rk) res = 'pdodge'; else if (dd >= -290 * rk && dd <= 75 * rk) res = 'dodge'; else res = 'early'; }
        else { if (h.unp) res = 'unp'; else if (dd >= -70 * rk && dd <= 35 * rk) res = 'pparry'; else if (dd >= -175 * rk && dd <= 60 * rk) res = 'parry'; else res = 'early'; }
      }
      const m = h.m;
      if (e.morph > 0 && (res === 'pdodge' || res === 'pparry')) { e.tempo = Math.max(.68, (e.tempo || 1) * .9); this.text(e, 'ADAPTING TO YOUR TIMING', '#ff8a6a', -40); }
      if (res === 'pdodge') { sfx('pdodge'); this.text(t, 'PERFECT DODGE', '#6ad7ff', -10, true); this.hop(t); t.mp = Math.min(t.maxMp, t.mp + 1); t.afterimg = 400; }
      else if (res === 'dodge') { sfx('dodge'); this.text(t, 'DODGE', '#9ad1ff'); this.hop(t); }
      else if (res === 'pparry') { sfx('pparry'); this.text(t, 'PERFECT PARRY', '#ffe36a', -10, true); t.mp = Math.min(t.maxMp, t.mp + 2);
        if (h.el && h.el !== 'mana' && this.reflex(t) > 1) { t.mp = Math.min(t.maxMp, t.mp + 3); this.text(t, 'UNRAVELED! +3 MP', '#46ff95', -34); this.spark(t.x, t.y - 34, ELEM[h.el][1], 16); } this.spark((t.x + e.x) / 2, t.y - 34, '#fff3a0', 22); B.flash = .35; e.brk += 18; this.checkBreak(e); t.anim = 'halfslash'; this.play(t, 'halfslash', 6, 40); }
      else if (res === 'parry') { sfx('parry'); this.text(t, 'PARRY', '#ffe36a'); t.anim = 'halfslash'; this.play(t, 'halfslash', 6, 45); t.mp = Math.min(t.maxMp, t.mp + 1); this.spark((t.x + e.x) / 2, t.y - 34, '#fff3a0', 10); e.brk += 8; this.checkBreak(e); this.chip(e, t, m * .25); }
      else {
        if (res === 'unp') this.text(t, "CAN'T PARRY THAT!", '#ff6b6b', -20);
        if (res === 'early') this.text(t, 'TOO EARLY', '#bbb', -20);
        this.chip(e, t, m, true, h.el);
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
    const es = B.actors.filter(a => a.side === 'e'); const xp = es.reduce((s, a) => s + a.E.xp, 0), gold = es.reduce((s, a) => s + a.E.gold, 0);
    G.S.gold += gold; const ups = Story.gainXp(xp);
    if (es.some(a => a.key === 'mana_wyrm') && !G.S.f.wyrmDrop) { G.S.f.wyrmDrop = 1; setTimeout(() => Stones.give('breath'), 2200); }
    this.me().hp = Math.max(this.me().hp, 1);
    if (ups) { const me = this.me(); me.maxHp = G.S.stats.maxHp; me.maxMp = G.S.stats.maxMp; me.hp = me.maxHp; me.mp = me.maxMp; }
    await this.msg(`Victory!  +${xp} XP  +${gold} gold${ups ? '  ·  LEVEL UP! Lv ' + G.S.lvl : ''}`, ups ? 2200 : 1600);
    return 'win';
  },
  // ---------------- fx ----------------
  text(a, s, col, dy, big) { this.B.texts.push({ s, x: a.x + rnd(-6, 6), y: a.y - 60 + (dy || 0), t: 0, col, big }); },
  spark(x, y, col, n) { for (let i = 0; i < n; i++) this.B.fx.push({ x, y, vx: rnd(-2.6, 2.6), vy: rnd(-3, 1), life: rnd(300, 650), t: 0, col, s: rnd(1.5, 3.2) }); },
  pillar(x, y) { this.B.fx.push({ pillar: 1, x, y, t: 0, life: 500 }); },
  async msg(s, ms, hold) { const m = $('#bmsg'); m.textContent = s; m.classList.add('on'); await wait(ms || 900); if (!hold) m.classList.remove('on'); else setTimeout(() => m.classList.remove('on'), 600); },
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
      c.fillStyle = 'rgba(0,0,0,.28)'; c.beginPath(); c.ellipse(a.x, a.y, 15, 5, 0, 0, 7); c.fill();
      const s = 1.15 * (a.size || 1);
      const fr = Math.min(a.frame, (G.man.bt.anims.find(x => x[0] === a.anim) || [0, 2])[1] - 1);
      c.globalAlpha = a.ko && a.side === 'e' ? Math.max(0, 1 - (a.at / 900)) : (a.alpha ?? 1);
      if (a.hurtT > 0 && Math.floor(a.hurtT / 50) % 2) c.globalAlpha *= .4;
      if (a.afterimg > 0) { a.afterimg -= 16; c.save(); c.globalAlpha = .3; drawBT(c, a.isMe ? playerImg() : a.img, a.anim, fr, a.x + 18, a.y, s); c.restore(); }
      if (a.isMe) {
        const anim = a.anim, glow = a.glow && anim === 'slash';
        if (!G.S.kid) drawBT(c, glow ? G.A.glowBg : G.A.swordBg, anim, fr, a.x, a.y, s);
        drawBT(c, playerImg(), anim, fr, a.x, a.y, s);
        if (G.S.kid) {} else if (!glow) drawBT(c, G.A.sword, anim, fr, a.x, a.y, s);
        else { c.save(); c.globalCompositeOperation = 'lighter'; drawBT(c, G.A.glow, anim, fr, a.x, a.y, s); c.restore(); drawBT(c, G.A.glow, anim, fr, a.x, a.y, s); }
        if (!G.S.hood) { const g = c.createRadialGradient(a.x - 4, a.y - 50, 0, a.x - 4, a.y - 50, 8); g.addColorStop(0, 'rgba(70,255,140,.4)'); g.addColorStop(1, 'rgba(70,255,140,0)'); c.save(); c.globalCompositeOperation = 'lighter'; c.fillStyle = g; c.fillRect(a.x - 20, a.y - 66, 32, 32); c.restore(); }
        if (a.ward) { c.save(); c.globalCompositeOperation = 'lighter'; c.strokeStyle = `rgba(70,255,140,${.25 + Math.sin(t / 200) * .1})`; c.lineWidth = 1.5; c.beginPath(); c.ellipse(a.x, a.y - 30, 26, 36, 0, 0, 7); c.stroke(); c.restore(); }
      } else if (a.morph > 0) {
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
      if (a.side === 'e' && !a.ko) {
        const bw = 44, x = a.x - bw / 2, y = a.y - 76;
        c.fillStyle = 'rgba(0,0,0,.7)'; c.fillRect(x - 1, y - 1, bw + 2, 9);
        c.fillStyle = '#e04848'; c.fillRect(x, y, bw * a.hp / a.maxHp, 4);
        c.fillStyle = a.broken ? '#fff' : '#ffd34a'; c.fillRect(x, y + 5, bw * Math.min(1, a.brk / a.brkMax), 2);
        c.font = '600 9px "Pixelify Sans"'; c.textAlign = 'center'; c.fillStyle = '#fff'; c.fillText(a.name, a.x - 7, y - 3);
        const tr = TIER[a.key]; if (tr) { const tx = a.x - 7 + c.measureText(a.name).width / 2 + 9; c.fillStyle = 'rgba(0,0,0,.75)'; c.fillRect(tx - 6, y - 12, 12, 11); c.fillStyle = TIER_COL[tr]; c.font = '700 8px "Press Start 2P"'; c.fillText(tr, tx, y - 3); }
        if (a.E.trait) { c.font = '600 7px "Pixelify Sans"'; c.fillStyle = 'rgba(0,0,0,.7)'; const tw = c.measureText(a.E.trait).width; c.fillRect(a.x - tw / 2 - 2, a.y + 6, tw + 4, 9); c.fillStyle = '#e8d8b0'; c.fillText(a.E.trait, a.x, a.y + 13); }
        if (a.shield) { c.fillStyle = '#cfd8e8'; for (let i = 0; i < a.shield; i++) c.fillRect(a.x - 12 + i * 9, y - 22, 7, 5); }
        if (a.stance) { c.fillStyle = '#cfe8ff'; c.font = '700 8px "Press Start 2P"'; c.fillText('STANCE', a.x, y - 24); }
        if (a.frostOn) { c.strokeStyle = 'rgba(160,230,255,.7)'; c.lineWidth = 1.5; c.beginPath(); c.ellipse(a.x, a.y - 30 * (a.size || 1), 20 * (a.size || 1), 34 * (a.size || 1), 0, 0, 7); c.stroke(); }
        if (this.me() && this.me().sight && a.next) { const u = a.next.hits.some(h => h.unp), el = elOf(a.next); c.font = '600 8px "Pixelify Sans"'; c.fillStyle = '#000'; const nt = '◉ ' + a.next.name + (el ? ' · ' + ELEM[el][0] : ''); c.fillText(nt, a.x + 1, y + 18); c.fillStyle = u ? '#ff6a6a' : el ? ELEM[el][1] : '#7fe8ff'; c.fillText(nt, a.x, y + 17); }
        if (a.drawn) { c.strokeStyle = 'rgba(95,216,255,.7)'; c.lineWidth = 1.5; c.beginPath(); c.ellipse(a.x, a.y, 20, 7, 0, 0, 7); c.stroke(); }
      }
    }
    if (B.orb) { const o = B.orb, ow = o.owner; o.x = lerp(o.x, ow.x - 34, .08); o.y = lerp(o.y, ow.y - 82 + Math.sin(t / 300) * 5, .08);
      c.save(); c.globalCompositeOperation = 'lighter'; const g = c.createRadialGradient(o.x, o.y, 1, o.x, o.y, 22); g.addColorStop(0, 'rgba(230,250,255,.95)'); g.addColorStop(.35, 'rgba(80,200,255,.75)'); g.addColorStop(1, 'rgba(80,200,255,0)'); c.fillStyle = g; c.beginPath(); c.arc(o.x, o.y, 22, 0, 7); c.fill();
      c.strokeStyle = 'rgba(120,220,255,.7)'; c.lineWidth = 1.5; for (let i = 0; i < 3; i++) { c.beginPath(); c.arc(o.x, o.y, 12 + i * 4, t / (200 + i * 80) + i, t / (200 + i * 80) + i + 2); c.stroke(); } c.restore();
      c.fillStyle = '#bfefff'; c.font = '700 7px "Press Start 2P"'; c.textAlign = 'center'; c.fillText('◆'.repeat(o.charges), o.x, o.y + 30); }
    for (const a of B.actors) if (!a.ko && (a.sight || a.azure)) { c.save(); c.globalCompositeOperation = 'lighter'; const col = a.azure ? '80,200,255' : '70,255,140'; const g = c.createRadialGradient(a.x, a.y - 30, 6, a.x, a.y - 30, 46); g.addColorStop(0, `rgba(${col},.0)`); g.addColorStop(.7, `rgba(${col},${.16 + Math.sin(t / 180) * .06})`); g.addColorStop(1, `rgba(${col},0)`); c.fillStyle = g; c.fillRect(a.x - 50, a.y - 80, 100, 100); c.restore(); }
    if (T) { const a = T.list[T.i]; const y = a.y - 92 + Math.sin(t / 150) * 3; c.fillStyle = T.side === 'e' ? '#ffd34a' : '#46ff95'; c.beginPath(); c.moveTo(a.x - 7, y); c.lineTo(a.x + 7, y); c.lineTo(a.x, y + 9); c.fill(); }
    // rings
    for (const r of B.rings) {
      const k = clamp((performance.now() - r.t0) / r.dur, 0, 1.2), rad = lerp(58, 13, Math.min(1, k));
      c.lineWidth = 2.5; c.strokeStyle = r.color; c.globalAlpha = .9;
      c.beginPath(); c.arc(r.x, r.y, rad, 0, 7); c.stroke();
      c.lineWidth = 1.5; c.globalAlpha = .55; c.beginPath(); c.arc(r.x, r.y, 13, 0, 7); c.stroke();
      if (r.kind === 'unp') { c.globalAlpha = 1; c.fillStyle = '#ff5050'; c.font = '700 12px "Press Start 2P"'; c.textAlign = 'center'; c.fillText('!!', r.x, r.y - 22); }
      c.globalAlpha = 1;
    }
    // particles
    for (const p of B.fx) {
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
      if (p.clash) { c.save(); c.globalCompositeOperation = 'lighter'; c.strokeStyle = `rgba(255,240,180,${1 - k})`; c.lineWidth = 3 * (1 - k); for (let i = 0; i < 8; i++) { const an = i * Math.PI / 4 + .3; c.beginPath(); c.moveTo(p.x + Math.cos(an) * 6, p.y + Math.sin(an) * 6); c.lineTo(p.x + Math.cos(an) * (10 + 30 * k), p.y + Math.sin(an) * (10 + 30 * k)); c.stroke(); } c.restore(); continue; }
      if (p.field) { c.save(); c.globalCompositeOperation = 'lighter'; c.strokeStyle = `rgba(70,255,140,${.8 * (1 - k)})`; c.lineWidth = 2;
        for (let i = 0; i < 6; i++) { const an = i * Math.PI / 3 + p.t / 400; c.beginPath(); c.moveTo(p.x + Math.cos(an) * 34, p.y + Math.sin(an) * 40); c.lineTo(p.x + Math.cos(an + Math.PI / 3) * 34, p.y + Math.sin(an + Math.PI / 3) * 40); c.stroke(); }
        c.fillStyle = `rgba(70,255,140,${.12 * (1 - k)})`; c.beginPath(); c.ellipse(p.x, p.y, 34, 40, 0, 0, 7); c.fill(); c.restore(); continue; }
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
      c.font = (x.big ? '700 13px' : '700 11px') + ' "Press Start 2P"'; c.textAlign = 'center';
      const y = x.y - Math.min(1, k * 3) * 18;
      c.fillStyle = '#000'; c.fillText(x.s, x.x + 1, y + 1); c.fillStyle = x.col; c.fillText(x.s, x.x, y);
    }
    c.globalAlpha = 1; c.restore();
    if (World.scene && World.scene.realm) Weather.render(c, t);
    if (B.flash > 0) { c.fillStyle = `rgba(255,255,255,${Math.min(.8, B.flash)})`; c.fillRect(0, 0, W, H); }
  }
};
// canvas taps for targeting
cv.addEventListener('pointerdown', e => {
  if (G.mode !== 'battle' || !Battle.B) return;
  Battle.tapAt(e.clientX / innerWidth * G.view.w, e.clientY / innerHeight * G.view.h);
});
$('#tgtHint').addEventListener('pointerdown', e => { e.preventDefault(); Battle.confirmTarget(); });
addEventListener('keydown', e => {
  if (G.mode !== 'battle' || !Battle.B) return;
  const T = Battle.B.targeting;
  if (T && (e.key === 'ArrowLeft' || e.key === 'ArrowRight' || e.key === 'ArrowUp' || e.key === 'ArrowDown')) { T.i = (T.i + (e.key === 'ArrowRight' || e.key === 'ArrowDown' ? 1 : -1) + T.list.length) % T.list.length; sfx('blip'); e.preventDefault(); return; }
  if (e.key === 'ArrowUp' || e.key === 'ArrowDown') { if (Battle.menuKey(e.key === 'ArrowUp' ? 'up' : 'down')) e.preventDefault(); }
});
