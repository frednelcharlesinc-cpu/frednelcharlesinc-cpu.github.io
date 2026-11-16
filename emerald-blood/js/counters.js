'use strict';
/* =====================================================================================
   COUNTERS — a branch of the skill tree for each fighter  (Chat A)
   Parry a whole combo and you counter from where you stand. Each fighter's counter is their own:
     REN    SKY CLEAVE   — a crescent of sword-light flies from the sheath draw
     KESS   GLASS FAN    — a fan of smoked-glass knives
     LIORA  MOON LANCE   — a lance of moonlight that pierces down the line
     OREN   ANVIL ECHO   — the hammer hits the ground and the shockwave rolls through them
   UPGRADES: every aura COLOUR makes it bigger, brighter, with more trail (and +1% damage).
             every GRADE BREAKTHROUGH changes its shape: more crescents, more knives, twin lances, more rings (+3%).
   CUSTOMISE: SEALS — each fighter has four; slot 1, 2 or 3 of them (Menu → Skills, under the stars).
   ===================================================================================== */
const CTR = {
  me: { pre: 'rc', n: 'SKY CLEAVE', fx: 'crescent', anim: 'backslash',
    tree: [['Sky Cleave', 'Your counter becomes SKY CLEAVE — a crescent of sword-light flies from your sheath draw. Opens 1 seal slot.', 1],
      ['Keen Return', 'Counters hit 15% harder.', 1], ['Second Seal', 'Two seal slots.', 2],
      ['Heaven\'s Reply', 'A PERFECT parry on the last hit of a combo is enough to counter — even if you missed earlier hits.', 3, 'C'],
      ['Third Seal', 'Three seal slots.', 3, 'B'], ['SKYFALL', 'Counters hit 30% harder, and the crescent cuts EVERY enemy.', 5, 'A']],
    seals: { bleed: ['Bleeding Edge', 'The cut keeps bleeding: 4% of their HP for 3 turns.'], mana: ['Mana Return', '+3 MP every counter.'],
      stagger: ['Stagger', '+25 break, and they lose time.'], echo: ['Echo', '30% chance the crescent comes back for a second cut.'] } },
  kess: { pre: 'kc', n: 'GLASS FAN', fx: 'knives', anim: 'slash',
    tree: [['Glass Fan', 'Kess\'s counter becomes GLASS FAN — a fan of smoked-glass knives. Opens 1 seal slot.', 1],
      ['Sharper Glass', 'Counters hit 15% harder.', 1], ['Second Seal', 'Two seal slots.', 2],
      ['Ricochet', 'The fan also hits a second enemy for half.', 3, 'C'], ['Third Seal', 'Three seal slots.', 3, 'B'],
      ['GLASS STORM', 'Counters hit 30% harder, and the storm hits every enemy.', 5, 'A']],
    seals: { poison: ['Poisoned Glass', 'Poison: 4% of their HP for 3 turns.'], smoke: ['Smokescreen', 'They\'re blinded: their next attack has a 50% chance to miss.'],
      purse: ['Pickpocket', 'She lifts 6–16 gold off them every counter.'], bleed: ['Serrated', 'The cuts bleed: 4% for 3 turns.'] } },
  liora: { pre: 'lc', n: 'MOON LANCE', fx: 'lance', anim: 'thrust',
    tree: [['Moon Lance', 'Liora\'s counter becomes MOON LANCE — a lance of moonlight that also pierces the enemy behind for half. Opens 1 seal slot.', 1],
      ['Full Moon', 'Counters hit 15% harder.', 1], ['Second Seal', 'Two seal slots.', 2],
      ['Mother\'s Rhythm', 'Each counter adds +2 to her Eleventh Step count.', 3, 'C'], ['Third Seal', 'Three seal slots.', 3, 'B'],
      ['CRESCENT DESCENT', 'Counters hit 30% harder, and the lance pierces through EVERY enemy.', 5, 'A']],
    seals: { pierce: ['Pierce', 'Ignores half their defence.'], guard: ['Guarding Light', 'The whole party takes half damage from the next hit.'],
      heal: ['Lunar Mend', 'Heals the whole party 6% HP.'], mark: ['Moonmark', '+1 to her Eleventh Step count.'] } },
  oren: { pre: 'oc', n: 'ANVIL ECHO', fx: 'quake', anim: 'slash',
    tree: [['Anvil Echo', 'Oren\'s counter becomes ANVIL ECHO — the hammer hits the ground and the shockwave rolls through every enemy (60% to the others). Opens 1 seal slot.', 1],
      ['Heavier Hammer', 'Counters hit 15% harder.', 1], ['Second Seal', 'Two seal slots.', 2],
      ['Ringing Steel', 'Counters deal +30 break.', 3, 'C'], ['Third Seal', 'Three seal slots.', 3, 'B'],
      ['MOUNTAIN SPLITTER', 'Counters hit 30% harder, full damage to everyone.', 5, 'A']],
    seals: { burn: ['Forge Ember', 'Burns: 4% of their HP for 3 turns.'], steady: ['Steady Hands', 'The whole party gains +1 ATK for the rest of the fight.'],
      shatter: ['Shatter', '+40 break.'], warm: ['Warm Coals', '+3 MP to everyone.'] } }
};
const Counters = {
  st() { const S = G.S; S.cmods = S.cmods || {}; return S; },
  who(a) { return a.isMe ? 'me' : a.id; },
  has(who, k) { const D = CTR[who]; return !!(D && typeof Skills !== 'undefined' && Skills.has(who, D.pre + k)); },
  slots(who) { return this.has(who, 5) ? 3 : this.has(who, 3) ? 2 : this.has(who, 1) ? 1 : 0; },
  mods(who) { const L = (this.st().cmods[who] || []).filter(k => CTR[who] && CTR[who].seals[k]); return L.slice(0, this.slots(who)); },
  toggle(who, k) { const S = this.st(), L = S.cmods[who] = (S.cmods[who] || []).slice(0, this.slots(who)); const i = L.indexOf(k);
    if (i >= 0) L.splice(i, 1); else if (L.length < this.slots(who)) L.push(k); else { L.shift(); L.push(k); } },
  power(a) { try { if (a.id === 'kess' && typeof kessGrade === 'function') { const k = kessGrade(); return { i: GRADES.indexOf(k.grade), band: k.band }; } const p = Power.now(); return { i: p.i, band: p.band }; } catch (e) { return { i: 0, band: 0 }; } },
  // ---------------- drawing ----------------
  draw(c, BT) {
    const B = BT.B; if (!B || !B.cfx || !B.cfx.length) return; const now = performance.now(), S = typeof BT_SCALE !== 'undefined' ? BT_SCALE : 1;
    B.cfx = B.cfx.filter(f => now - f.t0 < f.dur + 260);
    c.save(); c.globalCompositeOperation = 'lighter';
    for (const f of B.cfx) {
      const k = Math.min(1, (now - f.t0) / f.dur), fade = now - f.t0 > f.dur ? 1 - (now - f.t0 - f.dur) / 260 : 1, sz = (1 + f.band * .07) * S, col = f.col;
      const P = u => [f.x1 + (f.x2 - f.x1) * u, f.y1 + (f.y2 - f.y1) * u];
      c.shadowColor = col; c.shadowBlur = 8 + f.band * 2 + f.i * 3;
      if (f.kind === 'crescent') {
        const n = 1 + (f.i >= 2) + (f.i >= 4), big = f.i >= 5;
        for (let j = 0; j < n; j++) { const off = (j - (n - 1) / 2) * 26 * sz, trail = 2 + Math.floor(f.band / 2) + f.i;
          for (let q = trail; q >= 0; q--) { const u = Math.max(0, k - q * .05), [x, y] = P(u), R = (big ? 46 : 26) * sz * (1 + (j === 0 && f.i >= 3 ? .25 : 0));
            c.globalAlpha = fade * (q ? .18 * (1 - q / (trail + 1)) : .95); c.strokeStyle = q ? col : '#ffffff'; c.lineWidth = (q ? 6 : 4) * sz;
            c.beginPath(); c.arc(x - (f.x2 > f.x1 ? -1 : 1) * R * .3, y + off, R, f.x2 > f.x1 ? -1.1 : Math.PI - 1.1, f.x2 > f.x1 ? 1.1 : Math.PI + 1.1); c.stroke(); } }
        if (big && k > .85) { c.globalAlpha = fade * .5; c.strokeStyle = '#fff'; c.lineWidth = 2; c.beginPath(); c.moveTo(0, f.y2 - 20); c.lineTo(G.view.w, f.y2 - 40); c.stroke(); }
      } else if (f.kind === 'knives') {
        const n = 3 + f.i + Math.floor(f.band / 3);
        for (let j = 0; j < n; j++) { const sp = (j - (n - 1) / 2) * (.11 - f.i * .006), [x0, y0] = P(k), a0 = Math.atan2(f.y2 - f.y1, f.x2 - f.x1) + sp, d = Math.hypot(f.x2 - f.x1, f.y2 - f.y1) * k;
          const x = f.x1 + Math.cos(a0) * d, y = f.y1 + Math.sin(a0) * d; c.save(); c.translate(x, y); c.rotate(a0 + k * 20);
          c.globalAlpha = fade * .9; c.fillStyle = j % 2 ? col : '#e8f4ff'; c.fillRect(-7 * sz, -1.5 * sz, 14 * sz, 3 * sz); c.restore();
          if (f.band >= 3) { c.globalAlpha = fade * .25; c.fillStyle = col; c.beginPath(); c.arc(x - Math.cos(a0) * 10, y - Math.sin(a0) * 10, 3 * sz, 0, 7); c.fill(); } }
        if (f.i >= 3) { c.globalAlpha = fade * .25 * (1 - k); c.fillStyle = '#9a8aa8'; c.beginPath(); c.arc(f.x1, f.y1, 30 + k * 40, 0, 7); c.fill(); }
      } else if (f.kind === 'lance') {
        const lanes = f.i >= 3 ? [-10, 10] : [0], w = (3 + f.i * 1.5) * sz * (1 + f.band * .05), end = f.x1 + (f.x3 - f.x1) * k;
        for (const o of lanes) { const g = c.createLinearGradient(f.x1, 0, end, 0); g.addColorStop(0, 'rgba(255,255,255,0)'); g.addColorStop(1, col);
          c.globalAlpha = fade; c.strokeStyle = g; c.lineWidth = w; c.beginPath(); c.moveTo(f.x1, f.y1 + o); c.lineTo(end, f.y1 + o); c.stroke();
          c.fillStyle = '#ffffff'; c.beginPath(); c.arc(end, f.y1 + o, w * .9, 0, 7); c.fill(); }
        if (f.i >= 5) { c.globalAlpha = fade * .3; c.fillStyle = col; c.beginPath(); c.arc(f.x2, f.y2 - 60, 40 * sz * k, 0, 7); c.fill(); }
      } else if (f.kind === 'quake') {
        const rings = 1 + Math.floor(f.i / 2) + (f.band >= 6 ? 1 : 0);
        for (let j = 0; j < rings; j++) { const u = Math.max(0, k - j * .12), x = f.x1 + (f.x3 - f.x1) * u;
          c.globalAlpha = fade * (1 - j * .2); c.strokeStyle = col; c.lineWidth = (4 + f.i) * sz; c.beginPath(); c.ellipse(x, f.y1 + 4, (18 + f.band * 2) * sz, 6 * sz, 0, 0, 7); c.stroke();
          for (let q = 0; q < 3 + f.i; q++) { c.fillStyle = '#c8a27a'; c.fillRect(x - 20 + q * 9, f.y1 - 6 - Math.abs(Math.sin(now / 60 + q)) * (10 + f.i * 3), 4, 4); } }
      }
    }
    c.restore();
  }
};
// ---------------- the tree ----------------
(function () {
  if (typeof TREES === 'undefined') return;
  for (const [who, D] of Object.entries(CTR)) {
    const T = TREES[who]; if (!T) continue;
    T.branches.Counter = D.tree.map(([name, desc, cost, g], i) => ({ id: D.pre + (i + 1), name, desc, cost, req: i ? D.pre + i : undefined, minGrade: g }));
  }
})();
// ---------------- the counter ----------------
(function () {
  const BT = Battle;
  const _dc = BT.doCounter.bind(BT);
  BT.doCounter = async function (t, e) {
    const who = Counters.who(t), D = CTR[who];
    if (!D || !Counters.has(who, 1)) return _dc(t, e);
    const B = this.B, P = Counters.power(t), mods = Counters.mods(who), col = (typeof BAND_COL !== 'undefined' && BAND_COL[P.band]) || '#ffe08a';
    let mult = 1.8 * (Counters.has(who, 2) ? 1.15 : 1) * (Counters.has(who, 6) ? 1.3 : 1) * (1 + P.band * .01 + P.i * .03);
    const foes = this.alive('e').filter(x => x !== e).sort((a, b) => Math.abs(a.x - e.x) - Math.abs(b.x - e.x));
    const all = Counters.has(who, 6);
    let extra = [], xm = .5;
    if (who === 'me' && all) extra = foes;
    if (who === 'kess') { if (all) extra = foes; else if (Counters.has('kess', 4)) extra = foes.slice(0, 1); }
    if (who === 'liora') { extra = all ? foes : foes.slice(0, 1); }
    if (who === 'oren') { extra = foes; xm = all ? 1 : .6; }
    if (all && who !== 'oren') xm = .8;
    this.text(t, D.n, col, -86, true); sfx('counter');
    t.anim = D.anim; this.play(t, D.anim, t.isMe ? 13 : 6, 40); await wait(140);
    const far = [e, ...extra].reduce((m, x) => x.x < m.x ? x : m, e);
    const f = { kind: D.fx, x1: t.x - 20, y1: t.y - 40, x2: e.x, y2: e.y - 40, x3: far.x - 30, t0: performance.now(), dur: 260 + (D.fx === 'lance' || D.fx === 'quake' ? 80 : 0), band: P.band, i: P.i, col };
    if (D.fx === 'quake') { f.y1 = t.y; f.y2 = e.y; }
    (B.cfx = B.cfx || []).push(f); sfx(P.i >= 4 ? 'art' : 'swing');
    if (P.i >= 5) { B.flash = Math.max(B.flash || 0, .45); B.flashCol = '255,255,255'; }
    await wait(f.dur);
    B.shake = Math.max(B.shake || 0, 8 + P.i * 2); sfx('crit');
    const hit = (x, m) => { if (x.ko) return; let opts = { unblockable: 1, brk: 16 + (Counters.has(who, 4) && who === 'oren' ? 30 : 0) + (mods.includes('stagger') ? 25 : 0) + (mods.includes('shatter') ? 40 : 0), src: 'counter' };
      if (mods.includes('pierce')) { const d0 = x.def; x.def = Math.floor(x.def / 2); this.resolveHit(t, x, m, 'perfect', opts); x.def = d0; } else this.resolveHit(t, x, m, 'perfect', opts);
      this.spark(x.x, x.y - 40, col, 14 + P.i * 2); };
    hit(e, mult); for (const x of extra) hit(x, mult * xm);
    // seals
    const targets = [e, ...extra].filter(x => !x.ko);
    for (const x of targets) {
      if (mods.includes('bleed')) { x.cBleed = 3; this.text(x, 'BLEEDING', '#ff4a4a', -30); }
      if (mods.includes('poison')) { x.cPoison = 3; this.text(x, 'POISONED', '#8ee05a', -30); }
      if (mods.includes('burn')) { x.cBurn = 3; this.text(x, 'BURNING', '#ff9a3a', -30); }
    }
    if (!e.ko && mods.includes('stagger')) { e.wait += 40 / Math.max(1, e.spd); this.text(e, 'STAGGERED', '#ffd36a', -46); }
    if (!e.ko && mods.includes('smoke')) { e.cBlind = 1; this.text(e, 'BLINDED', '#b9a6ff', -46); }
    if (mods.includes('purse')) { const g = 6 + Math.floor(Math.random() * 11); G.S.gold += g; this.text(t, `+${g}g`, '#ffd36a', -50); }
    if (mods.includes('mana')) { t.mp = Math.min(t.maxMp, t.mp + 3); this.text(t, '+3 MP', '#7ad8ff', -50); }
    if (mods.includes('warm')) for (const p of this.alive('p')) p.mp = Math.min(p.maxMp, p.mp + 3);
    if (mods.includes('heal')) for (const p of this.alive('p')) { const h = Math.round(p.maxHp * .06); p.hp = Math.min(p.maxHp, p.hp + h); this.text(p, '+' + h, '#9be37a', -30); }
    if (mods.includes('guard')) for (const p of this.alive('p')) { p.cGuard = 1; this.text(p, 'GUARDED', '#e8e8ff', -40); }
    if (mods.includes('steady') && !B.steady) { B.steady = 1; for (const p of this.alive('p')) p.atk += 1; this.text(t, 'PARTY +1 ATK', '#ffb07a', -50); }
    if (who === 'liora' && typeof t.count === 'number') { t.count = Math.min(11, t.count + (Counters.has('liora', 4) ? 2 : 0) + (mods.includes('mark') ? 1 : 0)); }
    this.hud();
    await wait(260);
    if (mods.includes('echo') && !t.ko && !e.ko && !B.echoing && Math.random() < .3) { B.echoing = 1; this.text(t, 'ECHO!', col, -70, true); await wait(150); try { await this.doCounter(t, e); } finally { B.echoing = 0; } }
  };
  // Heaven's Reply: a perfect parry on the last hit is enough
  BT.counterOk = function (t, e, last) { return !!(t && last === 'pparry' && Counters.has(Counters.who(t), 4) && Counters.who(t) === 'me'); };
  // seal effects that last: bleed / poison / burn tick on the enemy's turn, blind, guard
  const _et = BT.enemyTurn.bind(BT);
  BT.enemyTurn = async function (e) {
    if (e && !e.ko && this.B) for (const [k, nm, cl] of [['cBleed', 'BLEED', '#ff4a4a'], ['cPoison', 'POISON', '#8ee05a'], ['cBurn', 'BURN', '#ff9a3a']]) if (e[k] > 0) { e[k]--; const d = Math.max(1, Math.round(e.maxHp * .04)); this.damage(e, d, false); this.text(e, `${nm} -${d}`, cl, -20); if (e.ko) return; }
    return _et(e);
  };
  const _es = BT.enemyStrike.bind(BT);
  BT.enemyStrike = async function (e, t, sk, isCounter) {
    if (e && e.cBlind && !isCounter && this.B) { e.cBlind = 0; if (Math.random() < .5) { await this.msg(`${e.name} swings blind through the smoke — and misses!`, 1000); return; } }
    return _es(e, t, sk, isCounter);
  };
  const _dm = BT.damage.bind(BT);
  BT.damage = function (t, dmg, big) { if (t && t.side === 'p' && t.cGuard && dmg > 0) { t.cGuard = 0; dmg = Math.max(1, Math.ceil(dmg / 2)); } return _dm(t, dmg, big); };
  const _r = BT.render.bind(BT);
  BT.render = function (c, t) { const out = _r(c, t); try { Counters.draw(c, this); } catch (x) { } return out; };
  // ---------------- the seal loadout, under the stars ----------------
  if (typeof skillsMenuHTML === 'function') {
    const _h = skillsMenuHTML;
    skillsMenuHTML = function () {
      const h = _h(); try {
        const S = G.S, people = ['me', ...S.party.filter(id => TREES[id])], who = people.includes(skillWho) ? skillWho : 'me', D = CTR[who]; if (!D) return h;
        const n = Counters.slots(who), on = Counters.mods(who), P = Counters.power(who === 'me' ? { isMe: 1 } : { id: who });
        const shape = { crescent: ['one crescent', 'one crescent', 'two crescents', 'two crescents, the first bigger', 'three crescents', 'a moon-sized crescent that splits the field'],
          knives: ['3 knives', '4 knives', '5 knives', '6 knives and a smoke burst', '7 knives and a smoke burst', '8+ knives and a smoke burst'], lance: ['a thin lance', 'a brighter lance', 'a wide lance', 'twin lances', 'twin lances', 'twin lances and a falling moon'],
          quake: ['one shockwave', 'one shockwave', 'two shockwaves', 'two shockwaves', 'three shockwaves', 'three shockwaves'] }[D.fx];
        let s = `<div class="stat" style="margin-top:8px"><h3 style="color:#ffd36a">⟲ ${D.n} — counter seals</h3>`;
        if (!n) s += `<p class="muted">Light the first star of the <b>Counter</b> branch to unlock ${D.n}. Counters fire when you parry every hit of a combo.</p>`;
        else { s += `<p class="muted" style="font-size:12px">Slots: <b>${on.length}/${n}</b>. Tap a seal to slot or unslot it. Now: <b>${shape[Math.min(5, P.i)]}</b> in <b style="color:${BAND_COL[P.band]}">${BAND_NAME[P.band]}</b> — every colour makes it bigger and brighter; every breakthrough changes its shape.</p><div class="btnrow" style="flex-wrap:wrap">`;
          for (const [k, [nm, d]] of Object.entries(D.seals)) s += `<button class="btn ${on.includes(k) ? 'pri' : ''}" data-cmod="${who}:${k}" title="${d}">${on.includes(k) ? '◆ ' : '◇ '}${nm}</button>`;
          s += `</div>` + Object.entries(D.seals).map(([k, [nm, d]]) => `<p style="font-size:11px;margin:1px 0;color:${on.includes(k) ? '#ffe9a8' : '#9fb3c8'}"><b>${nm}</b> — ${d}</p>`).join(''); }
        return h + s + '</div>';
      } catch (e) { return h; }
    };
  }
  if (typeof bindSkillsMenu === 'function') {
    const _b = bindSkillsMenu;
    bindSkillsMenu = function () { _b(); $$('#menuCard [data-cmod]').forEach(b => bindTap(b, () => { const [w, k] = b.dataset.cmod.split(':'); Counters.toggle(w, k); sfx('blip'); UI.renderMenu(); })); };
  }
})();
