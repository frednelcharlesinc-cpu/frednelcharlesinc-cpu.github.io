'use strict';
/* ================= D-STONES (Drag stones) =================
   Fragments of Fratenaptor's tomb: hyper-dense mana that never runs dry.
   Small stones upgrade weapons, armor and Arts. Medium stones have a WILL — you must face it before it serves you.
   Large stones are beyond anyone living. The Crown registers every stone; an unregistered one is a hanging offense. */
const STONES = {
  fang: { name: 'Fang Shard', size: 'small', slot: 'weapon', desc: 'Sharpens the edge with living mana. +4 ATK.', atk: 4 },
  scale: { name: 'Scale Shard', size: 'small', slot: 'armor', desc: 'Hardens cloth like dragonhide. +3 DEF.', def: 3 },
  breath: { name: 'Breath Shard', size: 'small', slot: 'armor', desc: 'Breathes mana into you. +1 MP every turn; your blood cools 5 faster.', mp: 1, cool: 5 },
  still: { name: 'Still Shard', size: 'small', slot: 'weapon', desc: 'A calm stone. Drag Arts cause 10 less Strain.', calm: 10 },
  echo: { name: 'Echo Shard', size: 'small', slot: 'art', desc: 'Socket into one Art: that Art hits ×1.3 harder and costs 1 less MP.' },
  verdict: { name: 'The Pale Verdict', size: 'medium', slot: 'weapon', will: 'will_verdict', desc: 'Halvard\'s staff-stone, cut to burn Drags. Drag Arts hit ×1.4 harder — but it judges you: every Art costs 4% of your HP.', atk: 2, verdict: 1 },
  riverheart: { name: 'Riverheart', size: 'medium', slot: 'armor', will: 'will_river', desc: 'A stone that sang in the shrine stream for three hundred years. Strain limit +40; your blood cools 8 faster. It wants to be carried somewhere. It won\'t say where.', cap: 40, cool: 8 },
  heart: { name: 'Heartstone Fragment', size: 'large', slot: null, desc: 'A splinter of the great stone Nana shattered. It beats like a heart. When you hold it the ground tilts and your eyes burn. It will not answer you. Not yet. Maybe not ever.' }
};
const SIZE_COL = { small: '#7fe8a8', medium: '#ffd88a', large: '#ff8a9a' };
const Stones = {
  st() { const S = G.S; if (!S.st) S.st = { inv: [], equip: { weapon: [null, null], armor: [null, null], art: {} }, bonded: {}, sealed: false }; return S.st; },
  has(id) { return this.st().inv.includes(id); },
  give(id, quiet) {
    const st = this.st(); if (st.inv.includes(id)) return; st.inv.push(id);
    const S = STONES[id]; sfx('level');
    if (!quiet) toast(`Received a ${S.size.toUpperCase()} D-stone: <b style="color:${SIZE_COL[S.size]}">${S.name}</b>. (Menu → Stones)`, 4600);
  },
  equipped() { const e = this.st().equip; return [...e.weapon, ...e.armor, ...Object.values(e.art)].filter(Boolean); },
  slotOf(id) { const e = this.st().equip; if (e.weapon.includes(id)) return 'weapon'; if (e.armor.includes(id)) return 'armor'; for (const k in e.art) if (e.art[k] === id) return 'art:' + k; return null; },
  empty() { return { atk: 0, def: 0, mp: 0, cool: 0, calm: 0, cap: 0, verdict: 0 }; },
  bonus() {
    const b = this.empty(); if (!G.S) return b;
    for (const id of this.equipped()) { const S = STONES[id]; if (!S) continue; for (const k of ['atk', 'def', 'mp', 'cool', 'calm', 'cap', 'verdict']) b[k] += S[k] || 0; }
    return b;
  },
  artBoost(k) { const e = this.st().equip; let m = 1; if (e.art[k] === 'echo') m += .3; if (this.bonus().verdict && (typeof ARTS !== 'undefined' && ARTS[k] && ARTS[k].blaze)) m += .4; return m; },
  artMp(k) { return this.st().equip.art[k] === 'echo' ? 1 : 0; },
  unregistered() { return this.equipped().length > 0 && !this.st().sealed; },
  unequip(id) { const e = this.st().equip; e.weapon = e.weapon.map(x => x === id ? null : x); e.armor = e.armor.map(x => x === id ? null : x); for (const k in e.art) if (e.art[k] === id) delete e.art[k]; },
  equip(id, where) { // where: 'weapon' | 'armor' | 'art:<key>'
    const e = this.st().equip; this.unequip(id);
    if (where.startsWith('art:')) { e.art[where.slice(4)] = id; return true; }
    const arr = e[where]; const i = arr.indexOf(null); if (i < 0) return false; arr[i] = id; return true;
  },
  // the world: Registry patrols stop anyone carrying an unsealed stone
  patrol() {
    const S = G.S; if (!S || !World.scene || World.busy || G.mode !== 'world') return;
    if (!['ashford', 'woods'].includes(S.map) || !this.unregistered()) return;
    if (S.steps % 37 !== 0) return;
    if (Math.random() < .3 + S.sus * .08) Story.run(registryStop);
  }
};
async function registryStop() {
  const S = G.S, f = S.f; f.regStops = (f.regStops || 0) + 1;
  CHAR.warden = { name: 'Registry Warden', sprite: 'hunter' };
  await narr('A woman in Crown grey steps into your path. A brass seal-press hangs at her belt, and something green glints in her spear-head.');
  await say('warden', 'neutral', 'Stone check. By order of the Crown Registry, every D-stone carries a seal. Yours are humming, traveller. Let me see the seals.');
  const opts = [S.gold >= 25 ? 'Bribe her (25g)' : 'Bribe her (not enough gold)', 'Fight', 'Run for it'];
  const c = await ask('warden', 'neutral', '…Well?', opts);
  if (c === 0 && S.gold >= 25) { S.gold -= 25; await say('warden', 'happy', '…These look sealed to me. Move along before I change my eyes.'); return; }
  if (c === 2 || (c === 0 && S.gold < 25)) { Story.addSus(1); await narr('You bolt. Behind you, a whistle — and the whole street turns to look.'); return; }
  const r = await Battle.start({ enemies: ['stone_hunter', 'stone_hunter'], intro: 'Registry Hunters — they carry sealed stones of their own!', witness: 1 });
  if (r === 'lose') { await Story.defeat(); return; }
  if (r === 'win') { await narr('One of their sealed stones cracks in the fall. The other you leave in the mud. A registered stone tracks its owner — and you don\'t want to be found.'); }
}
// the stones tab in the pause menu
function stonesMenuHTML() {
  const st = Stones.st(), e = st.equip;
  const slot = (label, arr) => `<div class="sockrow"><b>${label}</b>${arr.map(id => `<span class="sock ${id ? 'on ' + STONES[id].size : ''}">${id ? STONES[id].name : '◇ empty'}</span>`).join('')}</div>`;
  const arts = G.S.arts.map(k => `<span class="sock ${e.art[k] ? 'on small' : ''}">${ARTS[k].name}: ${e.art[k] ? STONES[e.art[k]].name : '◇'}</span>`).join('');
  let h = `<div class="stat" style="margin-bottom:6px"><h3>D-stones</h3><p class="muted">Pieces of Fratenaptor's tomb. <b style="color:${SIZE_COL.small}">Small</b> stones socket into weapon, armor or an Art. <b style="color:${SIZE_COL.medium}">Medium</b> stones have a will of their own — not everyone can use one. Face its will before it serves you. <b style="color:${SIZE_COL.large}">Large</b> stones have a stronger will still: they choose their bearer, and only a few dozen people alive carry one — nearly every SSS fighter, and nobody below.</p>
    <p class="muted">${st.sealed ? '✔ Your stones carry forged Crown seals.' : (Stones.unregistered() ? '<b style="color:#ff8a8a">Unregistered stones equipped.</b> Registry patrols in town and on the roads will stop you.' : 'Stones you only carry in your pack don\'t hum loudly enough to be caught.')}</p></div>`;
  h += `<div class="stat" style="margin-bottom:6px">${slot('Weapon', e.weapon)}${slot('Armor', e.armor)}<div class="sockrow"><b>Arts</b>${arts}</div></div>`;
  if (!st.inv.length) h += '<div class="stat"><p class="muted">You carry no stones.</p></div>';
  for (const id of st.inv) {
    const S = STONES[id], where = Stones.slotOf(id); let btns = '';
    if (S.size === 'large') btns = '<span class="muted">It will not answer you.</span>';
    else if (S.size === 'medium' && !st.bonded[id]) btns = Power.now().i >= 1 ? `<button class="btn" data-bond="${id}">Face its will</button>` : '<span class="muted">Too strong for you. (Power grade D)</span>';
    else if (where) btns = `<button class="btn" data-uneq="${id}">Remove</button>`;
    else if (S.slot === 'art') btns = G.S.arts.map(k => `<button class="btn" data-eq="${id}" data-w="art:${k}">${ARTS[k].name}</button>`).join('');
    else btns = `<button class="btn" data-eq="${id}" data-w="${S.slot}">Socket into ${S.slot}</button>`;
    h += `<div class="stat" style="margin-bottom:6px"><h3 style="color:${SIZE_COL[S.size]}">${S.name} <span class="muted">· ${S.size}${where ? ' · equipped' : ''}</span></h3><p>${S.desc}</p><div class="btnrow">${btns}</div></div>`;
  }
  return h;
}
function bindStonesMenu() {
  $$('#menuCard [data-eq]').forEach(b => bindTap(b, () => { if (!Stones.equip(b.dataset.eq, b.dataset.w)) toast('No free socket there. Remove a stone first.'); sfx('blip'); UI.renderMenu(); }));
  $$('#menuCard [data-uneq]').forEach(b => bindTap(b, () => { Stones.unequip(b.dataset.uneq); sfx('blip'); UI.renderMenu(); }));
  $$('#menuCard [data-bond]').forEach(b => bindTap(b, () => { const id = b.dataset.bond; UI.closeMenu(); Story.run(() => stoneTrial(id)); }));
}
async function stoneTrial(id) {
  const S = STONES[id];
  await narr(`You close your hand around ${S.name}. The world drops away. Something inside the stone looks back at you.`);
  if (id === 'verdict') await narr('A pale figure in white robes rises out of the light. It has no face. It was made for one purpose: to burn things like you.');
  else await narr('A figure made of moving water rises from the stone. It does not attack. It waits. It wants to see if you can wait too.');
  const r = await Battle.start({ enemies: [S.will], noFlee: true, boss: true, bd: id === 'verdict' ? 'town' : 'forest', intro: `THE WILL OF ${S.name.toUpperCase()}` });
  Story.heal(true);
  if (r === 'win') { Stones.st().bonded[id] = true; sfx('level'); await narr(id === 'verdict' ? 'The pale figure kneels. It does not like you. But it will serve.' : 'The water-figure laughs like a stream over stones, and folds itself back into the gem. It will go where you go.'); toast(`<b style="color:${SIZE_COL.medium}">${S.name}</b> is bonded. You can socket it now.`, 4000); }
  else await narr('The stone goes cold in your palm. It has decided you are not enough. Not yet.');
}
