/* =====================================================================
   DAMAGE TYPES, RESISTANCES & ELEMENTAL EDGES
   Every blow has a type: Physical, Fire, Ice, Electric, Water, Earth, Wind,
   Light, Dark — or Raw Mana, which nothing alive can resist.
   Enemies are weak or resistant to types; you learn which by hitting them.
   Drags never need elements — their mana is older than fire. But a D-stone set
   in a blade can CONJURE one: Ren's Attack and sword techniques take the
   element of the stone in his sword. His Drag Arts stay Raw Mana.
   ===================================================================== */
Object.assign(ELEM, { physical: ['Physical', '#d8d8d8'] });
ELEM.lightning[0] = 'Electric'; ELEM.shadow[0] = 'Dark';
const EL_ICON = { physical: '⚔', fire: '🔥', ice: '❄', lightning: '⚡', water: '💧', earth: '⛰', wind: '🌀', light: '☀', shadow: '☾', mana: '✦' };

/* ---------- who resists what (1 = normal, >1 weak, <1 resists) ---------- */
const UNDEAD = { light: 1.6, fire: 1.4, shadow: .3, ice: .7 };
const ARMOR = { physical: .7, lightning: 1.5, water: 1.2 };
const FAITHFUL = { light: .25, fire: .6, shadow: 1.5 };
const DRAGBLOOD = { fire: .5, ice: .5, lightning: .5, water: .5, earth: .5, wind: .5, light: .5, shadow: .5 }; // Drags unmake elements
const RESIST = {
  lupine: { fire: 1.5, ice: .7 }, lupine_alpha: { fire: 1.5, ice: .6 }, rime_lupine: { fire: 1.7, ice: .2, water: .6 }, rime_alpha: { fire: 1.8, ice: .1, water: .5, physical: .8 },
  mana_wyrm: { earth: 1.6, lightning: .5 }, bandit: { lightning: 1.3 }, rook: { light: 1.3, shadow: .7 }, tollman: { lightning: 1.3 },
  acolyte: FAITHFUL, pale_priest: FAITHFUL, inq_clerk: FAITHFUL, halvard: FAITHFUL, halvard_pro: FAITHFUL, verity: FAITHFUL, will_verdict: { light: 0, shadow: 1.6, fire: .5 },
  voss: ARMOR, reg_captain: ARMOR, ember_warden: { physical: .7, lightning: 1.5, fire: .4 }, guard_r: ARMOR, stone_hunter: { earth: .5, water: 1.4 },
  will_river: { water: 0, lightning: 1.6, fire: .6 },
  m_skeleton: Object.assign({ physical: .8 }, UNDEAD), m_ghoul: UNDEAD, m_vampire: Object.assign({ fire: 1.5 }, UNDEAD), b_lich: Object.assign({ ice: .3 }, UNDEAD),
  m_goblin: { fire: 1.4 }, m_goblin_shaman: { fire: 1.3, lightning: .5 }, b_goblin_king: { fire: 1.4, physical: .9 }, m_ratfolk: { fire: 1.5, water: 1.2 }, m_gourd: { fire: 1.8, water: .3, earth: .6 },
  m_troll: { fire: 1.6, physical: .7 }, b_troll_mother: { fire: 1.6, physical: .7, ice: .7 }, m_lizard: { ice: 1.6, water: .5 }, m_orc: { lightning: 1.3 }, m_tusker: { ice: 1.3 },
  m_drake: { ice: 1.7, fire: .2 }, m_minotaur: { lightning: 1.5, physical: .8 }, m_wartotaur: { lightning: 1.5, physical: .8 }, b_crystal_wyrm: { earth: 1.7, ice: .3, light: .4 },
  dread: Object.assign({}, DRAGBLOOD, { physical: .7 }), vane: { physical: .9 }
};
function resistOf(e, type) {
  if (!e || !type || type === 'mana') return 1;
  let R = RESIST[e.key];
  if (!R && e.E && e.E.drag) R = DRAGBLOOD;
  if (!R && e.key && /^m_|^b_/.test(e.key)) R = null;
  return R && R[type] !== undefined ? R[type] : 1;
}
const Res = {
  known(key) { const f = G.S.f; f.resKnown = f.resKnown || {}; return (f.resKnown[key] = f.resKnown[key] || {}); },
  learn(e, type) { if (!e.key) return; const k = this.known(e.key); if (!k[type]) { k[type] = 1; return true; } return false; }
};

/* ---------- ARMAMENTS: a blade with a core. The core needs an ELEMENTAL ORB (taken from a great beast)
   and a D-STONE (to power it). Only then does the blade carry the element. ---------- */
const ORB_RANKS = ['E', 'D', 'C', 'B', 'A', 'S'];
const ORB_NAME = { fire: 'Flame', ice: 'Frost', lightning: 'Storm', water: 'Tide', earth: 'Stone', wind: 'Gale', light: 'Dawn', shadow: 'Dusk' };
STONES.raw = { name: 'Raw Shard', size: 'small', slot: 'core', desc: 'An uncut D-stone, no stronger than a pebble — and no weaker. Its only use: powering an armament\'s core.' };
const Arm = {
  st() { const S = G.S; S.arm = S.arm || { has: false, stone: null, orb: null }; S.orbs = S.orbs || []; return S.arm; },
  orbs() { this.st(); return G.S.orbs; },
  orb() { const a = this.st(); return a.orb != null ? this.orbs()[a.orb] : null; },
  ready() { const a = this.st(); return !!(a.has && a.stone && Stones.has(a.stone) && this.orb()); },
  giveOrb(el, rank, from) { this.orbs().push({ el, rank }); sfx('level'); toast(`Took an elemental orb from ${from}: <b style="color:${ELEM[el][1]}">${ORB_NAME[el]} Orb · ${rank}-rank</b>. (Menu → Stones → Armament)`, 4600); }
};
const Edge = {
  el() { return G.S && Arm.ready() ? Arm.orb().el : null; },
  rank() { return G.S && Arm.ready() ? ORB_RANKS.indexOf(Arm.orb().rank) : -1; }
};
// a core stone is busy powering the blade: it can't sit in another socket at the same time
(function () { const _eq = Stones.equip.bind(Stones); Stones.equip = function (id, w) { const a = Arm.st(); if (a.stone === id) a.stone = null; return _eq(id, w); }; })();
// what each element does on top of the hit — stronger and more often with a higher-rank orb
const ORB_FX = {
  fire: ['BURNING', (a, t, BT, r) => { t.burn = 2; t.burnDmg = Math.max(2, Math.round(t.maxHp * (.03 + r * .01))); }],
  ice: ['CHILLED — turn delayed', (a, t, BT, r) => { t.wait += (30 + r * 8) / Math.max(1, t.spd); }],
  lightning: ['SHOCKED', (a, t, BT, r) => { t.brk += 14 + r * 4; BT.checkBreak(t); }],
  water: ['TIDE — +MP', (a, t, BT, r) => { a.mp = Math.min(a.maxMp, a.mp + 2 + Math.floor(r / 2)); }],
  earth: ['ARMOR CRACKED', (a, t, BT, r) => { t.def = Math.max(0, t.def - (1 + Math.ceil(r / 2))); }],
  wind: ['TAILWIND — you act sooner', (a, t, BT, r) => { a.wait *= .75 - r * .03; }],
  light: ['RADIANCE — heal', (a, t, BT, r) => { const h = Math.round(a.maxHp * (.03 + r * .01)); a.hp = Math.min(a.maxHp, a.hp + h); }],
  shadow: ['DRAIN', (a, t, BT, r) => { const h = Math.round(a.maxHp * (.03 + r * .01)); a.hp = Math.min(a.maxHp, a.hp + h); t.hp = Math.max(1, t.hp - h); }]
};
// what type a hit is
function hitType(a, opts) {
  const src = opts && opts.src;
  if (a.side === 'p') {
    if (src && ARTS[src] && !ARTS[src].sword) return a.isMe || (ALLY[a.id] && ALLY[a.id].drag) ? 'mana' : 'physical';
    if (a.isMe) return Edge.el() || 'physical';
    return 'physical';
  }
  return 'physical';
}

(function () {
  const BT = Battle;
  /* ---------- your hits: weakness & resistance ---------- */
  const _rh = BT.resolveHit.bind(BT);
  BT.resolveHit = function (a, t, m, grade, opts) {
    opts = opts || {};
    if (a.side === 'p' && t.side === 'e' && !t.ko) {
      const ty = hitType(a, opts), k = resistOf(t, ty);
      if (k !== 1) m *= k;
      const armed = a.isMe && ty === Edge.el() && ty !== 'physical', rk = armed ? Edge.rank() : -1;
      if (armed) m *= 1 + rk * .06;
      const r = _rh(a, t, m, grade, opts);
      if (armed && r === 'hit' && !t.ko && Math.random() < .14 + rk * .07) { const [nm, fn] = ORB_FX[ty]; fn(a, t, this, rk); this.text(t, nm, ELEM[ty][1], -104); this.hud(); }
      if (r === 'hit') {
        const fresh = Res.learn(t, ty);
        if (k > 1) { G.S.f.hitWeak = 1; this.text(t, `WEAK — ${ELEM[ty][0]}!`, ELEM[ty][1], -86, true); if (fresh) sfx('perfect'); if (t.brk !== undefined && !t.broken) { t.brk += 10; this.checkBreak(t); } }
        else if (k === 0) this.text(t, `IMMUNE — ${ELEM[ty][0]}`, '#9a9a9a', -86, true);
        else if (k < 1) this.text(t, `RESISTS ${ELEM[ty][0]}`, '#9a9a9a', -86);
        if (ty !== 'physical' && ty !== 'mana' && a.isMe) for (let i = 0; i < 10; i++) this.spark(t.x + rnd(-8, 8), t.y - 30 + rnd(-10, 10), ELEM[ty][1], 1);
      }
      return r;
    }
    return _rh(a, t, m, grade, opts);
  };
  /* ---------- the Transform rule: earn it with 5 perfect reactions in a row, then it costs half your MP ---------- */
  const _ac = BT.artCost.bind(BT);
  BT.artCost = function (a, k) { if (k === 'sight' && a && a.isMe) return Math.max(1, Math.ceil(a.maxMp / 2) - (Skills.has('me', 'e2') ? 3 : 0)); return _ac(a, k); };
  if (typeof CombatX !== 'undefined') {
    const _m = CombatX.menu.bind(CombatX);
    CombatX.menu = function (a, L, done, resolve, reopen) {
      _m(a, L, done, resolve, reopen);
      const i = L.findIndex(x => x[0] === 'Transform');
      if (i >= 0 && a.isMe) {
        const flow = Math.min(5, a.flow || 0), cost = Battle.artCost(a, 'sight'), ok = flow >= 5 && a.mp >= cost && !a.fever;
        L[i] = ['Transform', flow < 5
          ? `TRANSFORMATION — LOCKED. Land 5 perfect dodges or perfect parries in a row to unlock it. Getting hit resets the count. (${flow}/5)`
          : `TRANSFORMATION — Emerald Ascension is UNLOCKED. Costs half your MP (${cost}). Effortless dodges and perfect parries, +40% speed, +30% attack.${a.mp < cost ? ' — not enough MP!' : ''}`,
          () => { if (!ok) return; Battle.closeMenu(); a.flow = 0; Battle.useArt(a, 'sight').then(done); }, !ok, cost];
        L[i].flowTxt = flow;
      }
      // show the blade's element on the Attack button's description
      const at = L.findIndex(x => x[0] === 'Attack');
      if (at >= 0 && a.isMe) { const el = Edge.el(); if (el) L[at][1] += `  ${EL_ICON[el]} Your blade carries ${ELEM[el][0].toUpperCase()}.`; }
    };
  }
  // the flow counter shows above Ren while it builds
  const _r = BT.render.bind(BT);
  BT.render = function (c, t) {
    _r(c, t);
    const B = this.B; if (!B || B.clashOn) return;
    const me = B.actors.find(a => a.isMe);
    if (me && !me.ko && me.arts && me.arts.includes('sight') && !me.sight && !G.S.kid) {
      const f = Math.min(5, me.flow || 0); c.save(); c.textAlign = 'center'; c.font = '900 9px "Nunito"';
      for (let i = 0; i < 5; i++) { c.fillStyle = i < f ? (f >= 5 ? '#e8fff4' : '#46ff95') : 'rgba(255,255,255,.18)'; c.beginPath(); c.arc(me.x - 20 + i * 10, me.y + 28, 3.2, 0, 7); c.fill(); }
      if (f >= 5) { c.fillStyle = '#e8fff4'; c.fillText('TRANSFORM READY', me.x, me.y + 42); } c.restore();
    }
    // known weaknesses / resistances under each enemy
    for (const e of B.actors) {
      if (e.side !== 'e' || e.ko || !e.key) continue;
      const K = Res.known(e.key), weak = [], res = [];
      for (const ty of Object.keys(K)) { const k = resistOf(e, ty); if (k > 1) weak.push(EL_ICON[ty]); else if (k < 1) res.push(EL_ICON[ty]); }
      if (!weak.length && !res.length) continue;
      const s = (weak.length ? 'WEAK ' + weak.join('') : '') + (weak.length && res.length ? '  ' : '') + (res.length ? 'RES ' + res.join('') : '');
      c.save(); c.font = '800 10px "Nunito"'; c.textAlign = 'center'; const w = c.measureText(s).width + 10, y = e.y - 96 - (e.size ? (e.size - 1) * 40 : 0);
      c.fillStyle = 'rgba(0,0,0,.72)'; c.fillRect(e.x - 7 - w / 2, y - 10, w, 13); c.fillStyle = '#fff'; c.fillText(s, e.x - 7, y); c.restore();
    }
  };
})();

/* ---------- where elemental shards come from ---------- */
(function () {
  // Tobb's back room
  if (typeof talkTobb === 'function') {
    const _t = talkTobb;
    talkTobb = async function () {
      const f = F();
      if (!G.S.kid && f.vaneDone && f.metTobb) {
        const c = await ask('tobb', 'neutral', 'Back again! The usual — or…?', ['Tonics & Ethers', 'The back room (D-stones)', 'Leave']);
        if (c === 2 || c < 0) return; if (c === 1) return tobbBackRoom();
      }
      return _t();
    };
  }
  async function tobbBackRoom() {
    const f = F();
    if (!f.backRoom) { f.backRoom = 1; await say('tobb', 'shame', "…Keep your voice down. Raw shards. Not on any Registry ledger. Useless on their own — but a blade with a CORE drinks them like ale. Not cheap. Not legal. Not my fault."); }
    const price = 120;
    const c = await ask('tobb', 'neutral', `Raw Shard — ${price}g. (You have ${G.S.gold}g.) Powers an armament's core.`, ['Buy a Raw Shard', 'Never mind']);
    if (c !== 0) return;
    if (Stones.has('raw')) { await say('tobb', 'neutral', "You've already got one. One core, one shard. I'm a crook, not a monster."); return; }
    if (G.S.gold < price) { await say('tobb', 'shame', 'Gold first, friend.'); return; }
    G.S.gold -= price; sfx('coin'); UI.hud(); Stones.give('raw');
  }
  // bosses and chests drop them too
  const _vic = Battle.victory.bind(Battle);
  Battle.victory = async function () {
    const B = this.B, keys = B ? B.actors.filter(a => a.side === 'e').map(a => a.key) : [];
    const r = await _vic();
    try {
      const ORB_DROP = { lupine_alpha: 'wind', rime_lupine: 'ice', rime_alpha: 'ice', mana_wyrm: 'lightning', m_drake: 'fire', m_troll: 'earth', b_troll_mother: 'earth', b_crystal_wyrm: 'light', b_lich: 'shadow',
        m_lizard: 'water', will_river: 'water', m_tusker: 'earth', m_minotaur: 'earth', m_wartotaur: 'fire', m_vampire: 'shadow', b_goblin_king: 'fire', m_gourd: 'earth' };
      let n = 0;
      for (const e of (B ? B.actors.filter(a => a.side === 'e' && !a.fled) : [])) {
        const el = ORB_DROP[e.key]; if (!el) continue;
        const chance = e.E.boss ? 1 : /^(lupine_alpha|rime_alpha|mana_wyrm|m_drake|m_troll)$/.test(e.key) ? .5 : .15;
        if (Math.random() > chance) continue;
        const rank = ORB_RANKS[Math.min(5, Math.max(0, ['E', 'D', 'C', 'B', 'A', 'S', 'SS', 'SSS', 'SSSS'].indexOf(TIER[e.key] || 'E')))];
        setTimeout(() => Arm.giveOrb(el, rank, e.name), 2600 + n++ * 1800);
      }
    } catch (e) { }
    return r;
  };
})();
if (typeof FEATS !== 'undefined') FEATS.push(['weak', '✦', 'Read Their Weakness', 'Hit an enemy\'s weakness.', S => !!S.f.hitWeak]);

/* ---------- Borrik's forge (behind Gunna's tavern): refit the blade into an ARMAMENT ---------- */
CHAR.borrik = CHAR.borrik || { name: 'Borrik Stoutbarrel', sprite: 'dwarf_m1' };
(function () {
  const PRICE = 150;
  async function forge() {
    const f = F(), a = Arm.st();
    if (!f.metBorrik) {
      f.metBorrik = 1;
      await narr('Gunna jerks a thumb at a door behind the kegs. Heat rolls out of it. A dwarf with a beard singed to stubble is hammering something that hums.');
      await say('borrik', 'neutral', "Cousin says you've got a Drag blade and no sense. Let's see it. …Hm. Good steel. Dead steel. It can't DO anything but cut.");
      await say('borrik', 'neutral', "Your kind don't need fire or frost — you've got mana in the blood. But mana's one colour. Want the blade to carry an element? It needs a CORE.");
      await say('borrik', 'happy', "A core takes two things. An ELEMENTAL ORB — the crystal that grows in the heart of a great beast. Wolves the size of carts, wyrms, trolls, drakes. Cut it out of the corpse, still warm.");
      await say('borrik', 'happy', "And a D-STONE to wake it. Any shard you can hold. No stone, the orb sleeps. No orb, the stone just hums at you. Both — and your sword breathes fire.");
      await say('borrik', 'neutral', "Orbs grow with the beast. A pup's orb is E-rank — a spark. An old king of the woods? The bigger the beast, the better the orb, the harder it hits — and the more it does.");
    }
    if (!a.has) {
      const c = await ask('borrik', 'neutral', `Refit your katana with a core socket — ${PRICE}g. (You have ${G.S.gold}g.)`, ['Do it', 'Not yet']);
      if (c !== 0) return;
      if (G.S.gold < PRICE) { await say('borrik', 'neutral', "Dwarven work, dwarven price. Come back with the coin."); return; }
      G.S.gold -= PRICE; sfx('coin'); UI.hud();
      await fadeOut(500); sfx('hit'); await wait(300); sfx('hit'); await fadeIn(500);
      a.has = true; sfx('level');
      await narr('Borrik hands it back. Where the guard meets the blade there is a new hollow — two cups of black iron, one for a stone, one for an orb. Your katana is an ARMAMENT now.');
      toast('Your katana is now an <b>Armament</b>. Set a D-stone and an elemental orb in its core: Menu → Stones.', 5000);
      if (!Stones.has('raw') && !Stones.st().inv.some(id => STONES[id].size === 'small')) { await say('borrik', 'happy', "No stones on you? Here — a raw shard. First one's free. The orb you'll have to go and kill for."); Stones.give('raw'); }
      return;
    }
    const o = Arm.orb();
    await say('borrik', 'happy', Arm.ready() ? `Look at her breathe. ${ORB_NAME[o.el]} Orb, ${o.rank}-rank. Bring me a bigger beast's orb and she'll hit harder still.` : !a.stone ? "Core's empty on the stone side. Any shard'll wake it." : "No orb in the core. Go find a great beast. Wolves in the high woods, the wyrm in the lake caves, the troll mother…");
  }
  if (typeof barkeep === 'function') {
    const _bk = barkeep;
    barkeep = async function (tk) {
      if (tk === 'kettlebrook' && G.S && !G.S.kid && F().vaneDone) {
        const c = await ask(TAV[tk].keep, 'happy', 'Drink? Or are you here for my cousin\'s forge out back?', ['The bar', "Borrik's forge (Armaments)", 'Leave']);
        if (c === 1) return Story.run ? forge() : forge();
        if (c !== 0) return;
      }
      return _bk(tk);
    };
  }
  window.ArmForge = forge;
  // Gunna mentions it once if you have an orb but no armament
  // Stones menu: the Armament section
  const _html = stonesMenuHTML;
  stonesMenuHTML = function () {
    let h = _html();
    const a = Arm.st(), orbs = Arm.orbs();
    h = h.replace(/<button class="btn" data-eq="(\w+)" data-w="core">[^<]*<\/button>/g, '<span class="muted">Goes in an Armament core ↑</span>');
    let x = `<div class="stat" style="margin-bottom:6px;border:1px solid #3a6;"><h3>⚔ Armament</h3>`;
    if (!a.has) x += `<p class="muted">Your katana is plain steel. A smith can refit it with a <b>core</b> that holds a D-stone and an <b>elemental orb</b> from a great beast — then the blade carries that element. (Gunna's tavern in Kettlebrook — ask about her cousin's forge.)</p>${orbs.length ? `<p>Orbs carried: ${orbs.map(o => `${EL_ICON[o.el]} ${ORB_NAME[o.el]} ${o.rank}`).join(', ')}</p>` : ''}`;
    else {
      const o = Arm.orb(), ready = Arm.ready();
      x += `<p>${ready ? `<b style="color:${ELEM[o.el][1]}">${EL_ICON[o.el]} Your blade carries ${ELEM[o.el][0].toUpperCase()}</b> — ${o.rank}-rank: +${ORB_RANKS.indexOf(o.rank) * 6}% elemental damage, ${14 + ORB_RANKS.indexOf(o.rank) * 7}% chance of <b>${ORB_FX[o.el][0]}</b>.` : '<span class="muted">The core is asleep. It needs BOTH a D-stone and an orb.</span>'}</p>`;
      x += `<div class="sockrow"><b>Core stone</b><span class="sock ${a.stone ? 'on small' : ''}">${a.stone ? STONES[a.stone].name : '◇ empty'}</span>${a.stone ? '<button class="btn" data-cs="">Remove</button>' : ''}</div>`;
      const ok = Stones.st().inv.filter(id => id !== a.stone && STONES[id].size !== 'large' && (STONES[id].size !== 'medium' || Stones.st().bonded[id]));
      if (!a.stone) x += `<div class="btnrow">${ok.length ? ok.map(id => `<button class="btn" data-cs="${id}">${STONES[id].name}</button>`).join('') : '<span class="muted">No usable stone. (Tobb in Kettlebrook sells raw shards on the quiet.)</span>'}</div>`;
      x += `<div class="sockrow"><b>Core orb</b><span class="sock ${o ? 'on medium' : ''}">${o ? `${EL_ICON[o.el]} ${ORB_NAME[o.el]} Orb · ${o.rank}` : '◇ empty'}</span>${o ? '<button class="btn" data-co="-1">Remove</button>' : ''}</div>`;
      const rest = orbs.map((q, i) => [q, i]).filter(([, i]) => i !== a.orb);
      x += `<div class="btnrow">${rest.length ? rest.map(([q, i]) => `<button class="btn" data-co="${i}" style="color:${ELEM[q.el][1]}">${EL_ICON[q.el]} ${ORB_NAME[q.el]} ${q.rank}</button>`).join('') : `<span class="muted">${o ? '' : 'No orbs. Hunt great beasts — alphas, wyrms, trolls, drakes — and cut the orb from the corpse.'}</span>`}</div>`;
      x += `<p class="muted">Higher-rank orbs (E → S) hit harder and trigger their effect more often and more strongly. A core stone can't sit in another socket.</p>`;
    }
    x += '</div>';
    const i = h.indexOf('<div class="stat" style="margin-bottom:6px"><div class="sockrow">');
    const at = h.indexOf('<div class="stat" style="margin-bottom:6px">', 10);
    return h.slice(0, at) + x + h.slice(at);
  };
  const _bind = bindStonesMenu;
  bindStonesMenu = function () {
    _bind();
    $$('#menuCard [data-cs]').forEach(b => bindTap(b, () => { const id = b.dataset.cs, a = Arm.st(); if (id) { Stones.unequip(id); a.stone = id; sfx('level'); } else { a.stone = null; sfx('blip'); } UI.renderMenu(); }));
    $$('#menuCard [data-co]').forEach(b => bindTap(b, () => { const i = +b.dataset.co, a = Arm.st(); a.orb = i < 0 ? null : i; sfx(i < 0 ? 'blip' : 'level'); UI.renderMenu(); }));
  };
})();
