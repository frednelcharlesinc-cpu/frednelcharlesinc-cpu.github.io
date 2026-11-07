/* ================= NEVER TOO EASY =================
   Enemies grow with the party. Every enemy is measured against Ren's grade and colour, the stars lit in every
   skill tree, everyone's mastery, and how many heroes are fighting. The stronger the party gets, the harder the world
   pushes back — a weaker tier never becomes free, and bosses and alphas always demand the party's full strength.
   Also: core abilities and mastery for EVERYONE who fights — Dace, Tamsin, Oren's new Forge Fire,
   and every companion and battle mount. */
const DIFF = {
  T: ['E', 'D', 'C', 'B', 'A', 'S', 'SS', 'SSS', 'SSSS'],
  party() {
    const S = G.S, p = Power.now(); let stars = 0, mast = 0;
    try { for (const w of ['me', ...(S.party || [])]) stars += ((Skills.st().sk[w]) || []).length; } catch (e) { }
    try { for (const k in (S.mastery || {})) { const [w, a] = k.split(':'); if (w === 'me' || (S.party || []).includes(w)) mast += MASTERY.lv(w, a); } } catch (e) { }
    return { i: p.i, band: p.band, stars, mast, allies: (S.party || []).length };
  },
  isApex(e) { return !!(e.E && (e.E.boss || /alpha|king|mother|queen|lord|warden/.test(e.key || ''))); },
  scale(o) {
    const B = Battle.B; if (!B || !G.S || G.S.kid) return;
    const cfg = B.cfg || {}; if (cfg.tutorial || cfg.leafTrain || cfg.mind || (o.E && o.E.fixed)) return;
    const P = this.party(), tier = Math.max(0, this.T.indexOf(TIER[o.key] || 'E'));
    const gap = Math.max(0, P.i + P.band / NB - tier);                 // how far the party has outgrown this enemy's tier
    const grow = P.stars * .006 + P.mast * .005;                         // skill stars and mastery the party has earned
    const allies = (cfg.allies || G.S.party || []).length;
    let kh = (1 + gap * .45 + grow) * (1 + allies * .2), ka = 1 + gap * .3 + grow * .6 + allies * .06;
    if (this.isApex(o)) { kh *= 1.15; ka *= 1.1; }
    o.hp = Math.round(o.hp * kh); o.maxHp = Math.round(o.maxHp * kh); o.atk = Math.round(o.atk * ka);
    if (o.brkMax) o.brkMax = Math.round(o.brkMax * (1 + gap * .25));
    // an apex never hits like a kitten: its blows always threaten a real share of Ren's health
    if (this.isApex(o)) { const floor = Math.round(G.S.stats.maxHp * .07 + (G.S.stats.def || 0)); if (o.atk < floor) o.atk = floor; }
    o.def = (o.def || 0) + Math.floor(gap);
  }
};
(function () {
  const _mk = Battle.mk;
  Battle.mk = function (o) { if (o && o.side === 'e' && !o.scaled2) { o.scaled2 = 1; try { DIFF.scale(o); } catch (e) { } } return _mk.call(this, o); };

  /* ---------- Oren's second core: Forge Fire ---------- */
  ARTS.forgefire = { name: 'Forge Fire', strain: 45, mp: 7, desc: 'Oren slams his hammer into the ground and the forge answers: a wave of fire across EVERY enemy, 2 timed hits.', type: 'all',
    hits: [{ anim: 'spellcast', m: .7 }, { anim: 'spellcast', m: .9 }], brk: 12 };
  if (ALLY.oren && !Object.getOwnPropertyDescriptor(ALLY.oren, 'arts').get) { const base = ALLY.oren.arts; Object.defineProperty(ALLY.oren, 'arts', { configurable: true, get: () => base.includes('forgefire') ? base : base.concat(['forgefire']) }); }
  const _aoe = Battle.aoeOk.bind(Battle);
  Battle.aoeOk = function (a) { if (a && (a.id === 'oren' && Battle.B && Battle.B.lastArtKey === 'forgefire')) return true; return _aoe(a); };

  /* ---------- cores for everyone ---------- */
  Object.assign(MASTERY.CORE, {
    dace: [['cleave', 'Iron Cleave', '#3f9a5a', { 3: '−20% MP cost', 6: 'The cleave splits the guard in one blow', 10: 'GREEN ECLIPSE — the cleave also hits every other enemy for 50%' }]],
    tamsin: [['needle', 'Ember Needle', '#d8742a', { 3: '−20% MP cost', 6: '+15% damage', 10: 'WILDFIRE — +40% damage' }],
      ['cleave', 'Torch Cleave', '#ff9a3a', { 3: '−20% MP cost', 6: 'The cleave splits the guard in one blow', 10: 'The cleave also hits every other enemy for 50%' }]],
    kess: (MASTERY.CORE.kess || []).concat([['needle', 'Viper Needle', '#b48aff', { 3: '−20% MP cost', 6: '+15% damage', 10: 'COBRA — +40% damage' }]])
  });
  MASTERY.CORE.oren = (MASTERY.CORE.oren || []).concat([['forgefire', 'Forge Fire', '#ff7a3a', { 3: '−20% MP cost', 4: 'Everything it touches burns', 7: '+20% damage', 10: 'THE FORGE AWAKENS — a third wave of fire' }]]);
  const _cost = Battle.artCost;
  Battle.artCost = function (a, k) { let c = _cost.call(this, a, k); if (a && a.side === 'p' && ['needle', 'forgefire'].includes(k) && MASTERY.lv(MASTERY.whoOf(a), k) >= 3) c = Math.max(1, Math.round(c * .8)); return c; };
  const _am = Skills.artMul;
  Skills.artMul = function (who, k) { let m = _am.call(this, who, k); const l = MASTERY.lv(who, k);
    if (k === 'needle') m *= l >= 10 ? 1.4 : l >= 6 ? 1.15 : 1; if (k === 'forgefire' && l >= 7) m *= 1.2; return m; };
  const _use = Battle.useArt;
  Battle.useArt = async function (a, k) {
    const r = await _use.call(this, a, k);
    try {
      const who = MASTERY.whoOf(a), l = MASTERY.lv(who, k), B = this.B;
      if (k === 'forgefire' && l >= 4) for (const e of this.alive('e')) { e.burn = 3; e.burnDmg = Math.max(2, Math.round(a.atk * .35)); this.text(e, 'BURNING', '#ff7a3a', -60); }
      if (k === 'forgefire' && l >= 10) { await this.msg('THE FORGE AWAKENS', 600); for (const e of this.alive('e')) { this.spark(e.x, e.y - 30, '#ff7a3a', 14); this.resolveHit(a, e, .9, 'good', { unblockable: 1 }); await wait(90); } }
      if (k === 'cleave' && (who === 'dace' || who === 'tamsin') && B.artHit) { const h = B.artHit; if (l >= 6 && !h.t.ko) { h.t.brk = h.t.brkMax; this.checkBreak(h.t); } if (l >= 10) for (const e of this.alive('e').filter(e => e !== h.t)) this.resolveHit(a, e, h.m * .5, 'good', { unblockable: 1 }); }
    } catch (e) { console.warn(e); }
    return r;
  };

  /* ---------- companions & mounts: their signature move is their core ---------- */
  const famName = k => k === 'me' ? ((G.S && G.S.dragonName) || 'Onyx') : (FAMS[k] && FAMS[k].name) || k;
  MASTERY.famDef = k => { const F = FAMS[k]; if (!F) return null; return [k, `${famName(k)} · ${F.act.name}`, F.glow, { 3: 'Acts more often', 6: '+20% power', 10: 'PERFECT PARTNER — +30% more power' }]; };
  MASTERY.mountDef = k => { const M = MOUNTS[k]; if (!M || !M.act) return null; return [k, `${M.name} · ${M.act.name}`, '#ffd34a', { 3: 'Joins in more often', 6: '+20% power', 10: 'ONE WITH THE RIDER — +30% more power' }]; };
  const _def = MASTERY.def.bind(MASTERY);
  MASTERY.def = function (who, k) { if (who === 'fam') return this.famDef(k); if (who === 'mount') return this.mountDef(k); return _def(who, k); };
  const _pw = Bonds.power.bind(Bonds);
  Bonds.power = function (k) { const w = FAMS[k] ? 'fam' : MOUNTS[k] ? 'mount' : null; let m = _pw(k); if (w) { const l = MASTERY.lv(w, k); m *= (1 + l * .06) * (l >= 6 ? 1.2 : 1) * (l >= 10 ? 1.3 : 1); } return m; };
  const _cd = Bonds.cd.bind(Bonds);
  Bonds.cd = function (k, base) { const w = FAMS[k] ? 'fam' : MOUNTS[k] ? 'mount' : null; let c = _cd(k, base); if (w && MASTERY.lv(w, k) >= 3) c = Math.max(1, c - 1); return c; };
  const _fa = famAct;
  famAct = async function (a, key, F, A, sig) { const r = await _fa(a, key, F, A, sig); MASTERY.gain('fam', key, sig ? 2 : 1); return r; };
  const _as = Familiars.assist.bind(Familiars);
  Familiars.assist = async function (a) { const B = Battle.B, n0 = B ? (B.mountActed || 0) : 0; const r = await _as(a); try { if (B && (B.mountActed || 0) > n0 && G.S.riding) MASTERY.gain('mount', G.S.riding, 1); } catch (e) { } return r; };
  const _lu = MASTERY.levelUp.bind(MASTERY);
  MASTERY.levelUp = function (who, k, L) {
    if (who !== 'fam' && who !== 'mount') return _lu(who, k, L);
    const D = this.def(who, k); toast(`<b style="color:${D[2]}">${D[1]} — MASTERY ${L}</b>${D[3][L] ? '<br>' + D[3][L] : ''}`, 4600); sfx('level');
  };

  /* ---------- the Mastery page shows companions and mounts too ---------- */
  const _mh = masteryHTML;
  masteryHTML = function () {
    let h = _mh();
    const fams = Object.keys(FAMS).filter(k => { try { return Familiars.has(k); } catch (e) { return false; } }).map(k => MASTERY.famDef(k));
    const mounts = Object.keys((typeof Mounts !== 'undefined' && Mounts.owned()) || {}).map(k => MASTERY.mountDef(k)).filter(Boolean);
    const card = (who, [k, name, col, ms]) => { const l = MASTERY.lv(who, k), pts = MASTERY.pts(who, k), nx = MASTERY_XP[Math.min(10, l + 1)], lo = MASTERY_XP[l];
      return `<div class="stat" style="margin-bottom:6px"><h3 style="color:${col}">${name} <span class="muted">· Mastery ${l}/10</span></h3><div class="gbar"><i style="width:${l >= 10 ? 100 : ((pts - lo) / (nx - lo) * 100).toFixed(1)}%;background:${col}"></i></div>
        <p class="muted" style="margin:2px 0">${l >= 10 ? 'MASTERED.' : `${pts - lo} / ${nx - lo} to level ${l + 1}`} · ${Object.entries(ms).map(([lv, t]) => `<span style="${+lv <= l ? 'color:' + col : 'opacity:.6'}">Lv ${lv}: ${t}</span>`).join(' · ')}</p></div>`; };
    if (fams.length || mounts.length) h += `<div class="stat" style="margin:8px 0 6px"><h3 style="color:#ffd36a">Companions & mounts</h3><p class="muted">Their signature moves grow every time they use them in battle.</p></div>` + fams.map(d => card('fam', d)).join('') + mounts.map(d => card('mount', d)).join('');
    return h;
  };
})();
