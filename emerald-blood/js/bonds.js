'use strict';
/* ================= BONDS: grow closer to your companions, spend Bond Points on their own skill trees =================
   Every companion (your familiar, your party's familiars, every mount you own) has a Bond level.
   Bond XP comes from fighting together and spending time together. Each Bond level gives 1 Bond Point.
   A companion's RANK is always yours: it ranks with you, its power scales with your grade, and its max Bond level
   is capped by your grade — grow stronger and it can grow closer. */
const BOND_MAX = 10;
const BOND_XP = lv => Math.round(30 * Math.pow(lv, 1.35));          // xp needed to go from lv to lv+1
const BOND_CAP = () => Math.min(BOND_MAX, 3 + Power.now().i);       // E:3 D:4 C:5 B:6 A:7 S:8 SS:9 SSS:10
const RANK_MUL = () => 1 + Power.now().i * .12;                     // companion power ranks with you
const DRAGON_STAGE = () => { const i = Power.now().i; return i >= 5 ? ['Young Dragon', 1.6] : i >= 3 ? ['Whelp', 1.3] : ['Hatchling', 1]; };

// one tree shape for every companion; names and capstones are each companion's own
const BTREE = [
  { b: 'Fang', col: '#ff8a6a', nodes: [
    { id: 'f1', name: 'Sharpened', desc: 'Its action is 25% stronger.', cost: 1 },
    { id: 'f2', name: 'Ferocity', desc: 'Another +25% — and it can CRIT for ×1.5.', cost: 2, req: 'f1' },
    { id: 'f3', name: 'SIGNATURE', desc: '', cost: 3, req: 'f2', cap: 1 }] },
  { b: 'Instinct', col: '#7fe8ff', nodes: [
    { id: 'i1', name: 'Eager', desc: 'Acts more often (+12% chance).', cost: 1 },
    { id: 'i2', name: 'Always Ready', desc: 'Recovers one turn faster after acting.', cost: 2, req: 'i1' },
    { id: 'i3', name: 'Last Stand', desc: 'Once per battle, when its partner would fall, it throws itself in the way — partner survives at 1 HP.', cost: 3, req: 'i2', minBond: 6 }] },
  { b: 'Kinship', col: '#7dffb0', nodes: [
    { id: 'k1', name: 'Side by Side', desc: 'Partner gains +6% ATK in battle.', cost: 1 },
    { id: 'k2', name: 'Shelter', desc: 'Partner gains +8% DEF and +8% max HP in battle.', cost: 2, req: 'k1' },
    { id: 'k3', name: 'Perfect Pair', desc: 'Whenever its partner lands a PERFECT hit, it follows up with a free strike.', cost: 3, req: 'k2', minBond: 5 }] }
];
const SIG = { // capstone per companion
  me: ['Dragon\'s First Roar', 'A roar of blue dragonfire across the WHOLE enemy line (×2.2). Grows bigger every time the dragon grows.'],
  ilya: ['Ribbon Bloom', 'Heals the whole party instead of one.'], kairo: ['Ashfall', 'Pecks every enemy and weakens them all.'], liora: ['Moonveil', 'Shields the whole party.'],
  kess: ['Thousand Shadows', 'Strikes every enemy.'], oren: ['Forge Heart', 'Restores MP to the whole party.'], vane: ['Old Grey\'s Dive', 'A hit that cannot miss for ×2.'],
  seraphine: ['Thunder Peal', 'Static hits twice.'], nana: ['Ancient Patience', 'Heals the whole party.'], tamsin: ['Firebrand Fox', 'Strikes every enemy.'], bo: ['Stone Shell', 'Shields the whole party.'],
  lark: ['Zip Zap Zip', 'Strikes three times.'], dace: ['Berserk Badger', 'Strikes every enemy.'], sefa: ['Spring Chorus', 'Heals the whole party.'], nix: ['Choir of Wings', 'Heals the whole party.'],
  mare: ['Thunder Hooves', 'Hits every enemy.'], lupine: ['Pack Howl', 'Hits every enemy and lowers their ATK.'], boar: ['Unstoppable', 'Charge ×1.6.'], stag: ['Crystal Grove', 'Heals twice as much.'],
  drake: ['Inferno', 'Breath ×1.6.'], wyvern: ['Sky Breaker', 'A dive that cannot be dodged — ×1.8, every enemy.']
};

const Bonds = {
  all() { return G.S.bonds = G.S.bonds || {}; },
  get(k) { const A = this.all(); return A[k] = A[k] || { lv: 1, xp: 0, pts: 0, nodes: [] }; },
  has(k, n) { const b = this.all()[k]; return !!(b && b.nodes.includes(n)); },
  // every companion you can bond with right now
  list() {
    const L = [];
    if (Familiars.has('me')) L.push({ k: 'me', type: 'fam' });
    for (const id of G.S.party) if (FAMS[id]) L.push({ k: id, type: 'fam' });
    for (const id of Object.keys(Mounts.owned())) L.push({ k: id, type: 'mount' });
    return L;
  },
  name(k) { return FAMS[k] ? FAMS[k].name : MOUNTS[k] ? MOUNTS[k].name : k; },
  gain(k, n, quiet) {
    const b = this.get(k), cap = BOND_CAP(); if (b.lv >= cap) { b.xp = Math.min(b.xp + n, BOND_XP(b.lv)); return; }
    b.xp += n; let up = 0;
    while (b.lv < cap && b.xp >= BOND_XP(b.lv)) { b.xp -= BOND_XP(b.lv); b.lv++; b.pts++; up++; }
    if (up && !quiet) { sfx('level'); toast(`💚 Bond with <b>${this.name(k)}</b> deepened — Bond ${b.lv}! +${up} Bond Point${up > 1 ? 's' : ''} (Menu → Companions)`, 3400); }
  },
  reqOk(k, n) { const b = this.get(k); if (n.req && !b.nodes.includes(n.req)) return false; if (n.minBond && b.lv < n.minBond) return false; return true; },
  learn(k, id) {
    const b = this.get(k), n = BTREE.flatMap(x => x.nodes).find(x => x.id === id);
    if (!n || b.nodes.includes(id) || b.pts < n.cost || !this.reqOk(k, n)) return false;
    b.pts -= n.cost; b.nodes.push(id); sfx('level'); return true;
  },
  power(k) { return RANK_MUL() * (1 + (this.has(k, 'f1') ? .25 : 0) + (this.has(k, 'f2') ? .25 : 0)) * (1 + (this.get(k).lv - 1) * .04) * (k === 'me' ? DRAGON_STAGE()[1] : 1); },
  chance(k) { return .32 + (this.has(k, 'i1') ? .12 : 0) + this.get(k).lv * .01; },
  cd(k, base) { return Math.max(1, base - (this.has(k, 'i2') ? 1 : 0)); },
  // time together: once every 120 steps per companion
  async play(k) {
    const b = this.get(k), S = G.S; b.lastPlay = b.lastPlay ?? -999;
    if ((S.steps || 0) - b.lastPlay < 120) { toast(`${this.name(k)} is happy — but needs a little time before playing again.`); return; }
    b.lastPlay = S.steps || 0;
    const lines = k === 'me' ? [`${this.name(k)} curls up on your head and falls asleep instantly.`, `${this.name(k)} sneezes a spark into your hair. It thinks this is hilarious.`, `You share your dinner with ${this.name(k)}. It eats all of it. And then yours.`]
      : MOUNTS[k] ? [`You brush ${this.name(k)} down and check its hooves and claws.`, `${this.name(k)} nudges you for a treat. You give it two.`] : [`You spend a quiet moment with ${this.name(k)}.`, `${this.name(k)} brings you a "gift". You pretend to love it.`];
    toast(lines[Math.floor(Math.random() * lines.length)], 2600); sfx('heal'); this.gain(k, 18);
  }
};

/* ---------- battle: replace the familiar half of Familiars.assist with the bonded version ---------- */
Familiars.assist = async function (a) {
  const B = Battle.B; if (!B) return; const key = a.isMe ? 'me' : a.id, F = FAMS[key];
  if (F && this.has(key)) {
    a.famCd = (a.famCd || 0) - 1;
    if (a.famCd <= 0 && Math.random() < Bonds.chance(key)) {
      a.famCd = Bonds.cd(key, 3); a.famActed = (a.famActed || 0) + 1;
      await famAct(a, key, F, F.act, Bonds.has(key, 'f3'));
    }
  }
  const M = a.isMe && Mounts.cur();
  if (M && M.act) {
    B.mountCd = (B.mountCd ?? 1) - 1;
    if (B.mountCd <= 0) {
      B.mountCd = Bonds.cd(M.id, M.fly ? 2 : 3); B.mountActed = (B.mountActed || 0) + 1;
      const sig = Bonds.has(M.id, 'f3'), A = M.act, es = Battle.alive('e'), mul = Bonds.power(M.id);
      await Battle.msg(`${M.name}: ${sig ? SIG[M.id][0] : A.name}!`, 800); B.mountSwoop = performance.now(); sfx('swing');
      const all = A.all || (sig && ['mare', 'lupine', 'wyvern'].includes(M.id)), xm = sig ? ({ boar: 1.6, drake: 1.6, wyvern: 1.8 }[M.id] || 1) : 1;
      const tg = all ? es : [es[Math.floor(Math.random() * es.length)]];
      for (const t of tg) if (t) { Battle.spark(t.x, t.y - 30, '#ffd34a', 14); Battle.damage(t, Math.max(1, Math.round(a.atk * A.m * mul * xm * rnd(.9, 1.1) - t.def * .4)), M.fly);
        if (sig && M.id === 'lupine') { t.atk = Math.max(1, Math.round(t.atk * .92)); Battle.text(t, 'ATK DOWN', '#ffb070', -20); } }
      if (A.heal) for (const p of Battle.alive('p')) { const h = Math.round(p.maxHp * A.heal * (sig ? 2 : 1)); p.hp = Math.min(p.maxHp, p.hp + h); Battle.text(p, '+' + h, '#9fe4ff', -20); }
      Battle.hud();
    }
  }
};
async function famAct(a, key, F, A, sig) {
  const es = Battle.alive('e'), ps = Battle.alive('p'), mul = Bonds.power(key), crit = Bonds.has(key, 'f2') && Math.random() < .2;
  const nm = sig && SIG[key] ? SIG[key][0] : A.name;
  await Battle.msg(`${F.name}: ${nm}!${crit ? ' — CRITICAL!' : ''}`, 750);
  if (key === 'me') { const st = DRAGON_STAGE(); Battle.B.dragonBreath = { t: performance.now(), big: sig }; }
  const hit = (t, m) => { Battle.spark(t.x, t.y - 30, F.glow, 12); Battle.damage(t, Math.max(1, Math.round(a.atk * m * mul * (crit ? 1.5 : 1) * rnd(.9, 1.1) - t.def * .4)), crit); };
  if (A.t === 'strike' || A.t === 'weaken') {
    const all = sig && ['me', 'kess', 'tamsin', 'dace', 'kairo'].includes(key), times = sig && key === 'lark' ? 3 : 1, xm = sig ? (key === 'me' ? 2.2 : key === 'vane' ? 2 : 1) : 1;
    const tg = all ? es : [es[Math.floor(Math.random() * es.length)]];
    for (let n = 0; n < times; n++) for (const t of tg) if (t && !t.ko) { hit(t, A.m * xm); if (A.t === 'weaken') { t.atk = Math.max(1, Math.round(t.atk * .92)); Battle.text(t, 'ATK DOWN', '#ffb070', -20); } }
  }
  if (A.t === 'shock') for (let n = 0; n < (sig ? 2 : 1); n++) for (const t of es) if (!t.ko) hit(t, A.m);
  if (A.t === 'heal') { const tg = sig ? ps : [ps.slice().sort((p, q) => p.hp / p.maxHp - q.hp / q.maxHp)[0]]; for (const t of tg) { const h = Math.round(t.maxHp * A.m * Math.min(2, mul)); t.hp = Math.min(t.maxHp, t.hp + h); Battle.text(t, '+' + h, '#7dffb0', -20); } sfx('heal'); }
  if (A.t === 'guard') for (const t of (sig ? ps : [a])) { t.guard = true; t.ward = Math.max(t.ward || 0, 1); Battle.text(t, 'SHIELDED', F.glow, -20); }
  if (A.t === 'mana') for (const t of (sig ? ps : [a])) { const m = Math.round(A.m * Math.min(2, mul)); t.mp = Math.min(t.maxMp, t.mp + m); Battle.text(t, '+' + m + ' MP', '#5fd8ff', -20); }
  Battle.hud();
}
(function () {
  // kinship stat bonuses at the start of every battle
  const _run = Battle.run.bind(Battle);
  Battle.run = function () {
    const B = this.B;
    if (B) for (const a of B.actors) if (a.side === 'p') {
      const keys = [a.isMe ? 'me' : a.id]; if (a.isMe && Mounts.cur()) keys.push(Mounts.cur().id);
      for (const k of keys) {
        if (!Bonds.all()[k]) continue;
        if (Bonds.has(k, 'k1')) a.atk = Math.round(a.atk * 1.06);
        if (Bonds.has(k, 'k2')) { a.def = Math.round(a.def * 1.08); const h = Math.round(a.maxHp * .08); a.maxHp += h; a.hp += h; }
      }
    }
    return _run();
  };
  // Last Stand
  const _dmg = Battle.damage.bind(Battle);
  Battle.damage = function (t, dmg, big) {
    if (t && t.side === 'p' && !t.ko && t.hp - dmg <= 0 && !t.lastStand) {
      const k = t.isMe ? 'me' : t.id;
      if (Bonds.has(k, 'i3') && (k !== 'me' || Familiars.has('me'))) { t.lastStand = 1; dmg = t.hp - 1; setTimeout(() => this.text(t, `${FAMS[k].name} TOOK THE HIT!`, FAMS[k].glow, -50, true), 50); }
    }
    return _dmg(t, dmg, big);
  };
  // Perfect Pair follow-ups
  const _rh = Battle.resolveHit.bind(Battle);
  Battle.resolveHit = function (a, t, m, grade, opts) {
    const r = _rh(a, t, m, grade, opts);
    if (a && a.side === 'p' && grade === 'perfect' && t && !t.ko) {
      const k = a.isMe ? 'me' : a.id;
      if (FAMS[k] && Familiars.has(k) && Bonds.has(k, 'k3') && !a.pairBusy) { a.pairBusy = 1; setTimeout(() => { a.pairBusy = 0; if (!t.ko && this.B) { this.text(a, `${FAMS[k].name}!`, FAMS[k].glow, -40); this.spark(t.x, t.y - 30, FAMS[k].glow, 10); this.damage(t, Math.max(1, Math.round(a.atk * .45 * Bonds.power(k)))); this.hud(); } }, 260); }
    }
    return r;
  };
  // bond XP after every victory
  const _v = Battle.victory.bind(Battle);
  Battle.victory = async function () {
    const B = this.B;
    if (B && !B.cfg.noBond) {
      for (const a of B.actors) if (a.side === 'p') { const k = a.isMe ? 'me' : a.id; if (FAMS[k] && Familiars.has(k)) setTimeout(() => Bonds.gain(k, 8 + (a.famActed || 0) * 4), 1200); }
      const M = Mounts.cur(); if (M) setTimeout(() => Bonds.gain(M.id, 8 + (B.mountActed || 0) * 4), 1400);
    }
    return _v();
  };
  // the dragon grows with you in battle, and its breath is visible
  const _r = Battle.render.bind(Battle);
  Battle.render = function (c, t) {
    _r(c, t); const B = this.B; if (!B || !B.dragonBreath) return;
    const me = this.me && this.me(), k = (t - B.dragonBreath.t) / 700; if (!me || k > 1) return;
    c.save(); c.globalCompositeOperation = 'lighter'; const sx = me.x - 40, sy = me.y - 22, L = (B.dragonBreath.big ? 520 : 220) * Math.min(1, k * 2.5);
    const g = c.createLinearGradient(sx, sy, sx - L, sy); g.addColorStop(0, `rgba(160,220,255,${1 - k})`); g.addColorStop(1, 'rgba(60,140,255,0)');
    c.fillStyle = g; c.beginPath(); c.moveTo(sx, sy); c.lineTo(sx - L, sy - (B.dragonBreath.big ? 60 : 16)); c.lineTo(sx - L, sy + (B.dragonBreath.big ? 60 : 16)); c.fill(); c.restore();
  };
})();

/* ---------- art ---------- */
const CompArt = { cache: {},
  get(name) { if (this.cache[name] !== undefined) return this.cache[name]; this.cache[name] = null; loadImg(`assets/companions/${name}.png`).then(im => { this.cache[name] = im; if (G.mode !== 'battle' && UI.menuTab === 'companions' && !$('#menu').classList.contains('hide')) UI.renderMenu(); }).catch(() => {}); return null; } };

/* ---------- the Companions tab (replaces the earlier version) ---------- */
let compSel = null;
companionsMenuHTML = function () {
  const S = G.S, list = Bonds.list(), p = Power.now(), cap = BOND_CAP();
  if (!compSel || !list.some(x => x.k === compSel)) compSel = list.length ? list[0].k : null;
  let h = `<div class="stat"><h3>Bonds</h3><p class="muted">Fight together and spend time together to deepen a bond. Every Bond level gives a <b style="color:#7dffb0">Bond Point</b> for that companion's own skill tree. Your companions <b>rank with you</b>: they share your power grade ${Power.badge()}, grow stronger as you do, and can reach Bond <b>${cap}</b> at your grade (up to ${BOND_MAX} at SSS).</p></div>`;
  if (list.length) {
    h += `<div class="btnrow" style="margin-top:6px;flex-wrap:wrap">${list.map(x => `<button class="btn ${x.k === compSel ? 'on' : ''}" data-csel="${x.k}" style="${x.k === compSel ? 'border-color:#7dffb0;color:#7dffb0' : ''}">${Bonds.name(x.k)} · ${Bonds.get(x.k).lv}</button>`).join('')}</div>`;
    const k = compSel, x = list.find(q => q.k === k), b = Bonds.get(k), isM = x.type === 'mount', F = FAMS[k], M = MOUNTS[k];
    const need = BOND_XP(b.lv), sig = SIG[k] || ['Signature', ''];
    const owner = k === 'me' ? S.name : isM ? S.name : (ALLY[k] && ALLY[k].name) || k;
    const stage = k === 'me' ? ` · ${DRAGON_STAGE()[0]}` : '';
    h += `<div class="stat comp" style="margin-top:6px"><canvas data-cart="${isM ? 'mount_' + k : 'fam_' + k}" data-pix="${isM ? 'm:' + M.kind : 'f:' + k}" width="96" height="96" style="width:96px;height:96px"></canvas><div style="flex:1">
      <h3 style="color:${F ? F.glow : '#ffd34a'}">${Bonds.name(k)} <span class="muted">· ${F ? F.species : 'Mount'}${stage} · ${owner}'s</span></h3>
      <p>Rank ${Power.badge(p)} · <b>Bond ${b.lv}</b>/${cap} ${b.lv >= cap ? `<span class="muted">(raise your power grade to grow closer)</span>` : ''} · Power ×${Bonds.power(k).toFixed(2)}</p>
      <div class="gbar" style="height:8px;background:#22302a;border-radius:4px;overflow:hidden"><div style="height:100%;width:${b.lv >= cap ? 100 : Math.round(b.xp / need * 100)}%;background:#7dffb0"></div></div>
      <p class="muted">${b.lv >= cap ? 'Bond maxed for your grade.' : `${b.xp}/${need} Bond XP`} · <b style="color:#7dffb0">${b.pts} Bond Point${b.pts === 1 ? '' : 's'}</b></p>
      <div class="btnrow"><button class="btn" data-play="${k}">${k === 'me' ? 'Play with it' : isM ? 'Groom & feed' : 'Spend time'}</button>${isM ? (S.riding === k ? '<button class="btn" data-ride="">Dismount</button>' : `<button class="btn" data-ride="${k}">Ride</button>`) : ''}</div></div></div>`;
    h += `<div class="tree" style="margin-top:6px">` + BTREE.map(br => `<div class="branch"><h4 style="color:${br.col}">${br.b}</h4>` + br.nodes.map(n => {
      const nm = n.cap ? sig[0] : n.name, ds = n.cap ? sig[1] : n.desc, got = b.nodes.includes(n.id), ok = Bonds.reqOk(k, n), afford = b.pts >= n.cost;
      return `<div class="node ${got ? 'got' : ''}" style="${n.cap ? 'border-color:#ffd34a' : ''}"><b>${n.cap ? '★ ' : ''}${nm}</b><p class="muted">${ds}${n.minBond ? ` (Bond ${n.minBond}+)` : ''}</p>${got ? '<em style="color:#7dffb0">✔ learned</em>' : ok ? `<button class="btn" data-blearn="${n.id}" ${afford ? '' : 'disabled'}>Learn · ${n.cost} BP</button>` : '<em class="muted">🔒 locked</em>'}</div>`;
    }).join('') + '</div>').join('') + '</div>';
  } else h += '<div class="stat" style="margin-top:6px"><p class="muted">No companions yet.</p></div>';
  // the rest of the world's companions
  const own = Mounts.owned();
  h += `<div class="stat" style="margin-top:6px"><h3>Wild mounts</h3><p class="muted">Tame them in the world. Stronger mounts need a higher power grade — most want a fight first. Riding is faster; a flying mount ignores walls and water.</p></div>`;
  for (const [id, M] of Object.entries(MOUNTS)) if (!own[id]) {
    const where = M.where[0] === 'd_crystal' ? 'the Crystal Hollow' : { woods: 'the East Woods', mill: 'near the Old Mill' }[M.where[0]];
    h += `<div class="stat comp" style="margin-top:6px"><canvas data-cart="mount_${id}" data-pix="m:${M.kind}" width="64" height="64"></canvas><div><h3>${M.name} <span class="muted">· grade ${M.grade}${M.fly ? ' · flies' : ''}</span></h3><p class="muted">${M.desc}</p><p class="muted">Wild — ${where}.${M.fight ? ' Must be beaten first.' : ''}</p></div></div>`;
  }
  h += `<div class="stat" style="margin-top:6px"><h3>Other familiars</h3><p class="muted">Everyone of note has one. Bring their partner into your party to bond with them.</p></div>`;
  for (const k of Object.keys(FAMS)) {
    if (list.some(x => x.k === k) || k === 'me') continue; const F = FAMS[k];
    const owner = k === 'vane' ? 'Vane' : (CHAR[k] && CHAR[k].name) || (ALLY[k] && ALLY[k].name) || k[0].toUpperCase() + k.slice(1);
    h += `<div class="stat comp" style="margin-top:6px"><canvas data-cart="fam_${k}" data-pix="f:${k}" width="64" height="64"></canvas><div><h3 style="color:${F.glow}">${F.name} <span class="muted">· ${F.species} · ${owner}'s</span></h3><p class="muted">${F.desc}</p><p>In battle: <b>${F.act.name}</b></p></div></div>`;
  }
  return h;
};
bindCompanionsMenu = function () {
  $$('#menuCard [data-csel]').forEach(b => bindTap(b, () => { compSel = b.dataset.csel; sfx('blip'); UI.renderMenu(); }));
  $$('#menuCard [data-blearn]').forEach(b => bindTap(b, () => { if (Bonds.learn(compSel, b.dataset.blearn)) toast('Bond skill learned.'); UI.renderMenu(); }));
  $$('#menuCard [data-play]').forEach(b => bindTap(b, () => { Bonds.play(b.dataset.play); UI.renderMenu(); }));
  $$('#menuCard [data-ride]').forEach(b => bindTap(b, () => { Mounts.ride(b.dataset.ride || null); UI.renderMenu(); }));
  $$('#menuCard canvas[data-cart]').forEach(cv => {
    const x = cv.getContext('2d'), W = cv.width, art = cv.dataset.cart === 'fam_me' && Art.port.dragon ? (Art.port.dragon.happy || null) : CompArt.get(cv.dataset.cart);
    if (art) { cv.style.imageRendering = 'auto'; const sc = Math.min(W / art.width, W / art.height); x.drawImage(art, (W - art.width * sc) / 2, (W - art.height * sc) / 2, art.width * sc, art.height * sc); return; }
    const [t, v] = cv.dataset.pix.split(':'); x.imageSmoothingEnabled = false;
    if (t === 'm') { x.drawImage(mountFrame(v, 'right', 0, 'back'), 0, 0, W, W); x.drawImage(mountFrame(v, 'right', 0, 'front'), 0, 0, W, W); } else x.drawImage(famImg(v, 0), 0, 0, W, W);
  });
};
// the dragon can speak (squeak) in scenes
CHAR.dragon = { get name() { return (G.S && G.S.dragonName) || 'Onyx'; }, sprite: null };
