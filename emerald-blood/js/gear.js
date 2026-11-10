/* ================= HUNT, FORGE & EDGE =================
   · Monster parts: beasts drop pelts and fangs, drakes drop scales, the dead drop bone and ember… BREAK a monster
     in battle and its rarest part is far more likely to fall. Sell parts at any Guild hall, or forge them.
   · Sharpness: every blade dulls as it hits (white → blue → green → yellow → orange → red). A dull blade bites less.
     Smiths re-sharpen it; whetstones top it up on the road. Upgrading a blade at the forge makes it hit harder,
     hold a longer edge and dull more slowly. Every fighter has one.
   · Gear: armour and charms forged from parts, one of each per fighter.
   · Aura Blade: the epiphany. A fighter who has truly learned their weapon — a forged blade, a keen edge, and
     perfect strike after perfect strike — becomes one with it. From then on, three perfect hits in a row wake the
     Aura Blade: three turns of +30% damage that cut through guard, and the edge does not dull. */
const PARTS = {
  pelt: { n: 'Beast Pelt', v: 8, use: 'Armour — warm, tough hide coats (+HP).' }, fang: { n: 'Sharp Fang', v: 9, use: 'Blades & charms — forge into edges (+ATK).' },
  alphaheart: { n: 'Alpha Heart', v: 90, rare: 1, use: 'RARE — the heart of a pack leader. Top-tier blades and talismans.' },
  scale: { n: 'Hard Scale', v: 12, use: 'Armour — overlapping plates (+DEF).' }, claw: { n: 'Hooked Claw', v: 12, use: 'Blades — hooks and serrations (+ATK).' },
  drakegem: { n: 'Drake Gem', v: 140, rare: 1, use: 'RARE — a fire-stone grown in a drake\'s chest. Top-tier mail and blades.' },
  bone: { n: 'Bone Shard', v: 7, use: 'Charms & mail — light, strong, a little cursed (+MP).' }, dust: { n: 'Grave Dust', v: 10, use: 'Charms — holds mana well (+MP).' },
  soulember: { n: 'Soul Ember', v: 160, rare: 1, use: 'RARE — a spark that refused to die. The finest blades and charms.' },
  hide: { n: 'Thick Hide', v: 11, use: 'Heavy armour (+HP, +DEF).' }, horn: { n: 'Horn & Tusk', v: 14, use: 'Blades & heavy armour — hard as iron.' },
  trollblood: { n: 'Troll Blood', v: 110, rare: 1, use: 'RARE — it still tries to heal. Armour that mends.' },
  gel: { n: 'Slime Gel', v: 5, use: 'Whetstones — polishing paste for a keen edge.' }, spore: { n: 'Spore Sac', v: 9, use: 'Charms — stubborn life (+HP).' },
  livingcore: { n: 'Living Core', v: 130, rare: 1, use: 'RARE — a beating seed. The last blade upgrade needs one.' },
  silk: { n: 'Spider Silk', v: 12, use: 'Light armour — quick and quiet (+SPD).' }, venom: { n: 'Venom Sac', v: 15, use: 'Charms — a poisoned edge (+ATK).' },
  crystal: { n: 'Mana Crystal', v: 20, use: 'Blades & charms — holds an edge, holds mana (+sharpness, +MP).' },
  whetstone: { n: 'Whetstone', v: 4, tool: 1, use: 'Restores half a blade\'s edge. Use from Menu → Gear.' }
};
const FAMILY = [   // [regex on key + name, common parts, rare part]
  [/drake|wyrm|lizard|gator|serpent|stalker|reef_drake/i, ['scale', 'claw'], 'drakegem'],
  [/crystal|mana_wyrm|ember_warden/i, ['crystal', 'crystal'], 'soulember'],
  [/lupine|alpha|rime|wolf|hound|tusker|boar|rat|gnawer|rat_?king/i, ['pelt', 'fang'], 'alphaheart'],
  [/ghoul|skeleton|bones|lich|wraith|pale|vampire|count|drowned/i, ['bone', 'dust'], 'soulember'],
  [/goblin|orc|troll|minotaur|wartotaur|brute|bogg|bruiser/i, ['hide', 'horn'], 'trollblood'],
  [/ooze|slime|gourd|grainrot|mother|bile/i, ['gel', 'spore'], 'livingcore'],
  [/spider|weaver/i, ['silk', 'venom'], 'livingcore']
];
const RECIPES = {   // slot, parts, gold, stats
  hidecoat: { n: 'Lupine Hide Coat', slot: 'armor', p: { pelt: 3, fang: 1 }, g: 30, s: { hp: 14, def: 1 } },
  silkcloak: { n: 'Silkweave Cloak', slot: 'armor', p: { silk: 3, gel: 2 }, g: 50, s: { spd: 2, hp: 6 } },
  scalevest: { n: 'Scaled Vest', slot: 'armor', p: { scale: 4, claw: 1 }, g: 70, s: { def: 3, hp: 10 } },
  bonemail: { n: 'Bone Mail', slot: 'armor', p: { bone: 4, dust: 2 }, g: 70, s: { def: 3, mp: 8 } },
  bruteplate: { n: 'Brute-Hide Plate', slot: 'armor', p: { hide: 3, horn: 2 }, g: 90, s: { hp: 26, def: 3 } },
  trollmail: { n: 'Troll-Blood Mail', slot: 'armor', p: { hide: 4, trollblood: 1 }, g: 220, s: { hp: 40, def: 5 } },
  drakemail: { n: 'Drakescale Mail', slot: 'armor', p: { scale: 5, drakegem: 1 }, g: 260, s: { hp: 30, def: 7 } },
  fangcharm: { n: 'Fang Charm', slot: 'charm', p: { fang: 3 }, g: 20, s: { atk: 2 } },
  sporecharm: { n: 'Spore Locket', slot: 'charm', p: { spore: 3, gel: 1 }, g: 25, s: { hp: 12 } },
  dustcharm: { n: 'Grave-Dust Phial', slot: 'charm', p: { dust: 3, bone: 1 }, g: 35, s: { mp: 12 } },
  venomcharm: { n: 'Venom Charm', slot: 'charm', p: { venom: 2, silk: 1 }, g: 45, s: { atk: 3 } },
  crystalcharm: { n: 'Crystal Pendant', slot: 'charm', p: { crystal: 3 }, g: 60, s: { mp: 16, atk: 1 } },
  alphatalisman: { n: 'Alpha Heart Talisman', slot: 'charm', p: { alphaheart: 1, pelt: 2 }, g: 150, s: { atk: 4, hp: 16 } },
  embercharm: { n: 'Soul Ember Charm', slot: 'charm', p: { soulember: 1, bone: 2 }, g: 180, s: { atk: 5, mp: 12 } }
};
const BLADE_UP = [null,
  { p: { fang: 3 }, g: 50 }, { p: { claw: 3, scale: 2 }, g: 120 }, { p: { crystal: 3, horn: 2 }, g: 260 },
  { p: { fang: 4, any: ['alphaheart', 'drakegem', 'trollblood'] }, g: 520 }, { p: { soulember: 1, livingcore: 1 }, g: 900 }];
const EDGE = [[.85, 'White', '#f4f7ff', 1.18], [.70, 'Blue', '#5fa8ff', 1.10], [.50, 'Green', '#5dff9a', 1.04], [.30, 'Yellow', '#ffe36a', 1], [.12, 'Orange', '#ff9a3a', .88], [0, 'Red', '#ff4a4a', .72]];
const WEAPON = { me: 'Last Light', kess: 'twin daggers', liora: 'spear', oren: 'forge hammer', dace: 'axe', tamsin: 'torch-blade' };
const Gear = {
  st() { const S = G.S; S.parts = S.parts || {}; S.blades = S.blades || {}; S.gear = S.gear || { own: {}, eq: {} }; S.aura = S.aura || {}; S.perfCareer = S.perfCareer || {}; return S; },
  who() { return ['me', ...((G.S.party) || [])]; },
  nm(w) { return w === 'me' ? G.S.name : (ALLY[w] && ALLY[w].name) || w; },
  blade(w) { const S = this.st(); return S.blades[w] || (S.blades[w] = { lv: 0, sharp: 100 }); },
  max(w) { return 100 + this.blade(w).lv * 25; },
  edge(w) { const b = this.blade(w), f = b.sharp / this.max(w); return EDGE.find(e => f >= e[0]) || EDGE[5]; },
  wear(w) { return 1.5 * (1 - this.blade(w).lv * .12); },
  bonus(w) { const S = this.st(), eq = S.gear.eq[w] || {}, b = { hp: 0, mp: 0, atk: this.blade(w).lv * 2, def: 0, spd: 0 };
    for (const sl of ['armor', 'charm']) { const r = RECIPES[eq[sl]]; if (r) for (const k in r.s) b[k] += r.s[k]; } return b; },
  have(p) { const S = this.st(); for (const k in p) { if (k === 'any') { if (!p.any.some(x => (S.parts[x] || 0) >= 1)) return false; } else if ((S.parts[k] || 0) < p[k]) return false; } return true; },
  pay(p, g) { const S = this.st(); for (const k in p) { if (k === 'any') { const x = p.any.find(x => (S.parts[x] || 0) >= 1); S.parts[x]--; } else S.parts[k] -= p[k]; } S.gold -= g; },
  cost(p) { return Object.entries(p).map(([k, n]) => k === 'any' ? 'any 1 rare (Alpha Heart / Drake Gem / Troll Blood)' : `${n}× ${PARTS[k].n}`).join(', '); },
  give(k, n) { const S = this.st(); S.parts[k] = (S.parts[k] || 0) + n; },
  // ---- drops ----
  drops(es) {
    const got = {}, R8 = ['E', 'D', 'C', 'B', 'A', 'S', 'SS', 'SSS', 'SSSS'];
    for (const a of es) {
      const F = FAMILY.find(f => f[0].test(a.key + ' ' + (a.E && a.E.name || ''))); if (!F) continue;
      const tier = Math.max(0, R8.indexOf(TIER[a.key] || 'E')), boss = !!(a.E && a.E.boss);
      const n = 1 + (Math.random() < .35 + tier * .08 ? 1 : 0) + (boss ? 2 : 0);
      for (let i = 0; i < n; i++) { const k = F[1][Math.random() * F[1].length | 0]; got[k] = (got[k] || 0) + 1; }
      const rc = (boss ? .5 : .015 + tier * .02) * (a.broken ? 4 : 1);   // BREAK it and the rare part is 4× likelier
      if (Math.random() < rc) got[F[2]] = (got[F[2]] || 0) + 1;
    }
    for (const k in got) this.give(k, got[k]);
    return got;
  },
  // ---- the blacksmith ----
  smith(name) {
    const S = this.st(); UI.closeMenu(); World.busy = true; UI.controls(false); $('#menu').classList.remove('hide'); this.smithName = name || 'The Forge'; this.renderSmith();
  },
  renderSmith(msg) {
    const S = this.st(), W = this.who();
    const blades = W.map(w => { const b = this.blade(w), e = this.edge(w), up = BLADE_UP[b.lv + 1], cost = 10 + b.lv * 5;
      return `<div class="stat"><h3>${esc(this.nm(w))} <span class="muted">· ${WEAPON[w] || 'weapon'} +${b.lv}</span></h3>
        <div class="gbar"><i style="width:${(b.sharp / this.max(w) * 100).toFixed(0)}%;background:${e[2]}"></i></div>
        <p class="muted" style="margin:2px 0">Edge: <b style="color:${e[2]}">${e[1]}</b> (${Math.round(b.sharp)}/${this.max(w)}) · damage ×${e[3]}${S.aura[w] ? ' · <b style="color:#9dffc8">Aura Blade awakened</b>' : ''}</p>
        <button class="btn" data-sh="${w}" ${b.sharp >= this.max(w) || S.gold < cost ? 'disabled' : ''}>Sharpen (${cost}g)</button>
        ${up ? `<button class="btn" data-up="${w}" ${!this.have(up.p) || S.gold < up.g ? 'disabled' : ''}>Upgrade to +${b.lv + 1} (${up.g}g)</button><p class="muted" style="margin:2px 0;font-size:11px">Needs ${this.cost(up.p)}. +2 ATK, +25 edge, dulls 12% slower.</p>` : '<p class="muted">Fully forged.</p>'}</div>`; }).join('');
    const rec = Object.entries(RECIPES).map(([k, r]) => { const own = S.gear.own[k] || 0, ok = this.have(r.p) && S.gold >= r.g;
      return `<div class="stat" style="${ok ? '' : 'opacity:.75'}"><h3>${r.n} <span class="muted">· ${r.slot}${own ? ' · owned ' + own : ''}</span></h3>
        <p class="muted" style="margin:2px 0">${Object.entries(r.s).map(([s, v]) => `+${v} ${s.toUpperCase()}`).join(' · ')} — needs ${this.cost(r.p)}, ${r.g}g</p>
        <button class="btn" data-cr="${k}" ${ok ? '' : 'disabled'}>Forge</button></div>`; }).join('');
    $('#menuCard').innerHTML = `<div class="mside"><div class="mhead"><h2>${esc(this.smithName)}</h2><button id="mClose">Close ✕</button></div>
      <p class="muted" style="font-size:12px">"Steel doesn't care who holds it."</p><p><b style="color:#ffd36a">${S.gold}g</b></p>
      <button class="btn" id="smWhet" ${S.gold < 20 ? 'disabled' : ''}>Buy whetstone (20g)</button>
      <button class="btn" id="smWhet2" ${!(S.parts.gel >= 1) || S.gold < 5 ? 'disabled' : ''}>Make whetstone (1 gel + 5g)</button>
      <button class="btn" id="smAll">Sharpen everyone</button>${msg ? `<p style="color:#9dffc8">${msg}</p>` : ''}</div>
      <div class="mbody"><h3 style="color:#ffd36a">Blades</h3>${blades}<h3 style="color:#ffd36a;margin-top:10px">Forge gear from monster parts</h3><div class="grid2">${rec}</div></div>`;
    bindTap($('#mClose'), () => UI.closeMenu());
    const re = m => { save(); sfx('press'); this.renderSmith(m); };
    $$('#menuCard [data-sh]').forEach(b => bindTap(b, () => { const w = b.dataset.sh, c = 10 + this.blade(w).lv * 5; if (S.gold < c) return; S.gold -= c; this.blade(w).sharp = this.max(w); re(`${this.nm(w)}'s edge is white-sharp again.`); }));
    $$('#menuCard [data-up]').forEach(b => bindTap(b, () => { const w = b.dataset.up, bl = this.blade(w), up = BLADE_UP[bl.lv + 1]; if (!up || !this.have(up.p) || S.gold < up.g) return; this.pay(up.p, up.g); bl.lv++; bl.sharp = this.max(w); sfx('level'); re(`${this.nm(w)}'s ${WEAPON[w] || 'weapon'} is now +${bl.lv}.`); }));
    $$('#menuCard [data-cr]').forEach(b => bindTap(b, () => { const k = b.dataset.cr, r = RECIPES[k]; if (!this.have(r.p) || S.gold < r.g) return; this.pay(r.p, r.g); S.gear.own[k] = (S.gear.own[k] || 0) + 1; sfx('level'); re(`Forged: ${r.n}. Equip it from Menu → Gear.`); }));
    bindTap($('#smWhet'), () => { if (S.gold < 20) return; S.gold -= 20; this.give('whetstone', 1); re('A whetstone. Menu → Gear to use it.'); });
    bindTap($('#smWhet2'), () => { if (!(S.parts.gel >= 1) || S.gold < 5) return; S.parts.gel--; S.gold -= 5; this.give('whetstone', 1); re('Gel and grit: a whetstone.'); });
    bindTap($('#smAll'), () => { let c = 0; for (const w of this.who()) if (this.blade(w).sharp < this.max(w)) c += 10 + this.blade(w).lv * 5; if (!c || S.gold < c) return re(c ? `That's ${c}g. You have ${S.gold}g.` : 'Every edge is already keen.'); S.gold -= c; for (const w of this.who()) this.blade(w).sharp = this.max(w); re(`Every blade sharpened (${c}g).`); });
  },
  inGuild() { return /^(a_guild|hm_hall|hm_office)$/.test(G.S.map) || /guild/i.test((World.scene && World.scene.title) || ''); },
  // ---- the Gear tab ----
  html() {
    const S = this.st(), W = this.who(), owned = Object.entries(S.parts).filter(([k, n]) => n > 0);
    const eqOpts = (w, sl) => { const cur = (S.gear.eq[w] || {})[sl];
      const used = k => this.who().filter(x => (S.gear.eq[x] || {})[sl] === k).length;
      return `<select data-eq="${w}|${sl}"><option value="">— none —</option>${Object.entries(RECIPES).filter(([k, r]) => r.slot === sl && ((S.gear.own[k] || 0) > used(k) || cur === k)).map(([k, r]) => `<option value="${k}" ${cur === k ? 'selected' : ''}>${r.n}</option>`).join('')}</select>`; };
    const ppl = W.map(w => { const b = this.blade(w), e = this.edge(w), B = this.bonus(w);
      return `<div class="stat"><h3>${esc(this.nm(w))} <span class="muted">· ${WEAPON[w] || 'weapon'} +${b.lv}</span></h3>
        <div class="gbar"><i style="width:${(b.sharp / this.max(w) * 100).toFixed(0)}%;background:${e[2]}"></i></div>
        <p class="muted" style="margin:2px 0">Edge <b style="color:${e[2]}">${e[1]}</b> ×${e[3]}${S.aura[w] ? ' · <b style="color:#9dffc8">Aura Blade</b>' : ''} · gear ${Object.entries(B).filter(([, v]) => v).map(([s, v]) => `+${v} ${s.toUpperCase()}`).join(' ') || 'none'}</p>
        <p style="margin:3px 0">Armour ${eqOpts(w, 'armor')} Charm ${eqOpts(w, 'charm')}</p>
        <button class="btn" data-wh="${w}" ${!(S.parts.whetstone > 0) || b.sharp >= this.max(w) ? 'disabled' : ''}>Use whetstone (${S.parts.whetstone || 0})</button></div>`; }).join('');
    const inv = owned.length ? owned.map(([k, n]) => `<div class="stat"><h3 style="color:${PARTS[k].rare ? '#ffd36a' : '#e8f5ec'}">${PARTS[k].n} ×${n}</h3><p class="muted" style="margin:2px 0">${PARTS[k].use} · sells for ${PARTS[k].v}g</p>
      ${this.inGuild() && !PARTS[k].tool ? `<button class="btn" data-sell="${k}">Sell 1</button><button class="btn" data-sellall="${k}">Sell all (${n * PARTS[k].v}g)</button>` : ''}</div>`).join('')
      : '<p class="muted">No monster parts yet. Defeat monsters — and BREAK them — to harvest parts.</p>';
    return `<h3 style="color:#ffd36a">Blades & gear</h3><p class="muted">Every hit dulls a blade. A blacksmith sharpens and upgrades it and forges gear from monster parts.</p>${ppl}
      <h3 style="color:#ffd36a;margin-top:10px">Monster parts</h3><p class="muted">${this.inGuild() ? 'The Guild buys parts here.' : 'Sell parts at any Guild hall.'}</p><div class="grid2">${inv}</div>`;
  },
  bind() {
    const S = this.st(), re = () => { save(); UI.renderMenu(); };
    $$('#menuCard [data-eq]').forEach(s => s.addEventListener('change', () => { const [w, sl] = s.dataset.eq.split('|'); S.gear.eq[w] = S.gear.eq[w] || {}; S.gear.eq[w][sl] = s.value || null; sfx('blip'); re(); }));
    $$('#menuCard [data-wh]').forEach(b => bindTap(b, () => { const w = b.dataset.wh; if (!(S.parts.whetstone > 0)) return; S.parts.whetstone--; const bl = this.blade(w); bl.sharp = Math.min(this.max(w), bl.sharp + this.max(w) * .5); sfx('press'); re(); }));
    $$('#menuCard [data-sell]').forEach(b => bindTap(b, () => { const k = b.dataset.sell; if (!(S.parts[k] > 0)) return; S.parts[k]--; S.gold += PARTS[k].v; sfx('blip'); re(); }));
    $$('#menuCard [data-sellall]').forEach(b => bindTap(b, () => { const k = b.dataset.sellall, n = S.parts[k] || 0; S.gold += n * PARTS[k].v; S.parts[k] = 0; sfx('level'); toast(`Sold for ${n * PARTS[k].v}g.`); re(); }));
  }
};
(function () {
  // ---- gear stats on everyone in battle ----
  const _mk = Battle.mk;
  Battle.mk = function (o) {
    if (o && o.side === 'p' && !o.gearOn) { o.gearOn = 1; try { const w = o.isMe ? 'me' : o.id, b = Gear.bonus(w);
      o.maxHp = (o.maxHp || 0) + b.hp; o.hp = (o.hp || 0) + b.hp; o.maxMp = (o.maxMp || 0) + b.mp; o.mp = (o.mp || 0) + b.mp; o.atk = (o.atk || 0) + b.atk; o.def = (o.def || 0) + b.def; o.spd = (o.spd || 0) + b.spd; } catch (e) { } }
    return _mk.call(this, o);
  };
  const _st = Battle.start.bind(Battle);
  Battle.start = async function (cfg) {
    const r = await _st(cfg);
    try { const S = G.S.stats; if (S.hp > S.maxHp) S.hp = S.maxHp; if (S.mp > S.maxMp) S.mp = S.maxMp; } catch (e) { }
    return r;
  };
  // ---- edge: damage by sharpness, dulling, the Aura Blade ----
  const _rh = Battle.resolveHit.bind(Battle);
  Battle.resolveHit = function (a, t, m, grade, opts) {
    let au = 0;
    try {
      if (a && a.side === 'p' && t && t.side === 'e' && !(opts && opts.echo) && G.S && !G.S.kid) {
        const w = a.isMe ? 'me' : a.id, S = Gear.st(), bl = Gear.blade(w), B = this.B;
        B.aura = B.aura || {}; B.streak = B.streak || {};
        au = (B.aura[w] || 0) > 0;
        m *= Gear.edge(w)[3] * (au ? 1.3 : 1);
        if (au) opts = Object.assign({}, opts, { unblockable: 1 });
        if (!au) bl.sharp = Math.max(0, bl.sharp - Gear.wear(w) * (grade === 'perfect' ? .6 : grade === 'miss' ? .3 : 1));
        const before = Gear.edge(w)[1];
        if (grade === 'perfect') { B.streak[w] = (B.streak[w] || 0) + 1; S.perfCareer[w] = (S.perfCareer[w] || 0) + 1; } else B.streak[w] = 0;
        if (B.streak[w] >= 3 && !au) {
          if (S.aura[w]) { B.aura[w] = 3; B.streak[w] = 0; this.text(a, 'AURA BLADE', '#9dffc8', -40, true); this.spark(a.x, a.y - 40, '#9dffc8', 22); sfx('crit'); }
          else if (bl.lv >= 2 && Gear.edge(w)[3] >= 1.1 && S.perfCareer[w] >= 40) {
            S.aura[w] = 1; B.aura[w] = 3; B.streak[w] = 0; this.B.flash = 1.2; sfx('level');
            this.text(a, 'EPIPHANY — AURA BLADE', '#9dffc8', -50, true); this.spark(a.x, a.y - 40, '#ffffff', 40);
            setTimeout(() => toast(`<b style="color:#9dffc8">${esc(Gear.nm(w))} — EPIPHANY.</b> The ${WEAPON[w] || 'blade'} stops feeling like steel in the hand and starts feeling like an arm. <b>Aura Blade</b> learned: three perfect hits in a row wake it.`, 6500), 600);
          }
        }
        const after = Gear.edge(w)[1]; if (after !== before && FXS) this.text(a, `${after.toUpperCase()} EDGE`, Gear.edge(w)[2], -30);
      }
    } catch (e) { }
    return _rh(a, t, m, grade, opts);
  };
  // the aura burns down each of that fighter's turns
  const _pt = Battle.playerTurn ? Battle.playerTurn.bind(Battle) : null;
  if (_pt) Battle.playerTurn = async function (a) { try { const B = this.B, w = a.isMe ? 'me' : a.id; if (B && B.aura && B.aura[w] > 0) { B.aura[w]--; if (!B.aura[w]) this.text(a, 'the aura fades', '#9dffc8', -30); } } catch (e) { } return _pt(a); };
  // a soft green aura around a fighter whose Aura Blade is awake
  const _r = Battle.render.bind(Battle);
  Battle.render = function (c, t) { const out = _r(c, t); try { const B = this.B; if (B && B.aura) for (const a of B.actors) { const w = a.isMe ? 'me' : a.id; if (a.side === 'p' && B.aura[w] > 0 && !a.ko) { c.save(); c.globalCompositeOperation = 'lighter'; const g = c.createRadialGradient(a.x, a.y - 30, 4, a.x, a.y - 30, 46 + Math.sin(t / 120) * 4); g.addColorStop(0, 'rgba(120,255,190,.35)'); g.addColorStop(1, 'rgba(120,255,190,0)'); c.fillStyle = g; c.beginPath(); c.arc(a.x, a.y - 30, 50, 0, 7); c.fill(); c.restore(); } } } catch (e) { } return out; };
  // the edge on each party card
  const _hud = Battle.hud.bind(Battle);
  Battle.hud = function () { const r = _hud(); try { if (G.S.kid) return r; const cards = $$('#bparty .pcard'), P = this.B.actors.filter(a => a.side === 'p');
    cards.forEach((el, i) => { const a = P[i]; if (!a) return; const w = a.isMe ? 'me' : a.id, e = Gear.edge(w), b = Gear.blade(w); let s = el.querySelector('.edge'); if (!s) { s = document.createElement('div'); s.className = 'edge'; el.appendChild(s); }
      s.style.cssText = `height:3px;margin-top:2px;border-radius:2px;background:linear-gradient(90deg,${e[2]} ${b.sharp / Gear.max(w) * 100}%,rgba(255,255,255,.12) 0)`; s.title = e[1] + ' edge'; }); } catch (e) { } return r; };
  // ---- parts on victory ----
  const _v = Battle.victory.bind(Battle);
  Battle.victory = async function () {
    let got = {}; try { if (!G.S.kid && !(this.B.cfg && (this.B.cfg.tutorial || this.B.cfg.mind || this.B.cfg.spar))) got = Gear.drops(this.B.actors.filter(a => a.side === 'e')); } catch (e) { }
    const r = await _v();
    const ks = Object.keys(got); if (ks.length) setTimeout(() => toast('<b style="color:#ffd36a">Harvested:</b> ' + ks.map(k => `${PARTS[k].rare ? '<b style="color:#ffd36a">★ ' : ''}${PARTS[k].n} ×${got[k]}${PARTS[k].rare ? '</b>' : ''}`).join(', '), 4200), 1500);
    try { for (const w of Gear.who()) { const e = Gear.edge(w); if (e[3] < 1) { setTimeout(() => toast(`${esc(Gear.nm(w))}'s ${WEAPON[w] || 'blade'} is <b style="color:${e[2]}">${e[1].toLowerCase()}</b> — find a smith or use a whetstone.`, 3600), 2600); break; } } } catch (e) { }
    return r;
  };
  // ---- the Gear tab ----
  const _rm = UI.renderMenu.bind(UI);
  UI.renderMenu = function () {
    const r = _rm.apply(this, arguments);
    try {
      const tabs = $('#menuCard .tabs'); if (tabs && !tabs.querySelector('[data-t="gear"]') && !G.S.kid) { const b = document.createElement('button'); b.dataset.t = 'gear'; b.textContent = 'Gear & Parts'; if (this.menuTab === 'gear') b.className = 'on';
        const it = tabs.querySelector('[data-t="items"]'); tabs.insertBefore(b, it ? it.nextSibling : null); bindTap(b, () => { this.menuTab = 'gear'; sfx('blip'); this.renderMenu(); }); }
      if (this.menuTab === 'gear') { const body = $('#menuCard .mbody'); if (body) { body.innerHTML = Gear.html(); Gear.bind(); } $$('#menuCard .tabs button').forEach(x => x.classList.toggle('on', x.dataset.t === 'gear')); }
    } catch (e) { console.warn(e); }
    return r;
  };
  // ---- the smiths open the forge ----
  const smiths = { a_smithy: ['a_smith', "Oren's Old Forge"], hm_smithy: ['hm_smithd', 'Highmark Smithy'] };
  for (const [sc, [id, nm]] of Object.entries(smiths)) { const S = SCENES[sc]; if (!S || !S.npcs) continue; const _n = S.npcs;
    S.npcs = function () { const L = _n.apply(this, arguments); for (const n of L) if (n.id === id) { const t0 = n.talk; n.talk = async () => { if (G.S.kid) return t0 && t0(); await t0(); Gear.smith(nm); }; n.qm = () => { try { return Gear.who().some(w => Gear.edge(w)[3] < 1) ? '!' : null; } catch (e) { return null; } }; } return L; }; }
})();
