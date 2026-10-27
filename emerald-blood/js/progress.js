'use strict';
/* ================= POWER GRADES & SKILL TREES =================
   No levels. Experience raises your Power Grade: E → D → C → B → A → S → SS → SSS.
   Within a grade your aura climbs six colours: GREEN → BLUE → YELLOW → ORANGE → PURPLE → RED.
   Every colour is a step up in power. Only once the aura burns RED can you break through to the next grade. */
const GRADES = ['E', 'D', 'C', 'B', 'A', 'S', 'SS', 'SSS'];
const GRADE_XP = [0, 150, 400, 800, 1400, 2300, 3600, 5500, 8000];
const BAND_COL = ['#46e070', '#4aa8ff', '#ffd34a', '#ff9a3a', '#b48aff', '#ff5050'], BAND_NAME = ['green', 'blue', 'yellow', 'orange', 'purple', 'red'];
const BAND3 = [0, 2, 5]; // older three-step values (rival ranks, lore) map onto the six colours
const AURA_LINE = ['New to this grade. The power is raw and unsteady.', 'Your mana runs cool and steady now.', 'Halfway. The aura has started to show.', 'It burns hotter. People notice when you walk in.', 'Dense and heavy. The air bends around you.', 'On the edge. One more push and you break through.'];
const Power = {
  xp() { const S = G.S; if (S.xpTotal === undefined) S.xpTotal = Math.max(0, (S.lvl - 1) * 90 + (S.xp || 0)); return S.xpTotal; },
  of(xp) {
    let i = 0; while (i < GRADES.length - 1 && xp >= GRADE_XP[i + 1]) i++;
    const lo = GRADE_XP[i], hi = GRADE_XP[i + 1], frac = hi ? Math.min(.999, (xp - lo) / (hi - lo)) : .999, band = Math.min(5, Math.floor(frac * 6));
    return { i, grade: GRADES[i], band, frac, lo, hi, step: i * 3 + (band >> 1), cstep: i * 6 + band };
  },
  now() { return this.of(this.xp()); },
  badge(p) { p = p || this.now(); return `<span class="grade" style="--gc:${BAND_COL[p.band]}">${p.grade}</span>`; }
};
// replaces level-ups: every colour is a real step, and a grade only breaks after red
const COLOUR_GIFT = [null, { hp: 4, atk: 1 }, { hp: 4, mp: 1 }, { hp: 4, atk: 1 }, { hp: 4, mp: 1 }, { hp: 4, atk: 1 }];
Story.gainXp = function (n) {
  const S = G.S, before = Power.now(); S.xpTotal = Power.xp() + n; const after = Power.now();
  S.lvl = after.step + 1;
  if (after.cstep <= before.cstep) return false;
  const st = S.stats; S.sp = S.sp || {}; const allies = Object.keys(ALLY), shows = [];
  for (let c = before.cstep + 1; c <= after.cstep; c++) {
    const band = c % 6; let sp = 0;
    if (band === 0) { st.maxHp += 6; st.maxMp += 2; st.def += 1; sp = 1; }
    else { const g = COLOUR_GIFT[band]; st.maxHp += g.hp; st.atk += g.atk || 0; st.maxMp += g.mp || 0; if (band === 2 || band === 4) sp = 1; }
    if (sp) { S.sp.me = (S.sp.me || 0) + 1; for (const w of allies) S.sp[w] = (S.sp[w] || 0) + 1; }
    shows.push([{ grade: GRADES[Math.floor(c / 6)], band }, band === 0, sp]);
  }
  st.hp = st.maxHp; st.mp = st.maxMp;
  for (const k in S.allies) S.allies[k] = {};
  for (const x of shows.slice(-4)) Aura.ceremony(...x);
  if (Story.rankCheck) Story.rankCheck();
  return true;
};
const Aura = {
  q: [], busy: false,
  ceremony(p, breakthrough, sp) {
    this.q.push([p, breakthrough, sp]); if (!this.busy) this.next();
  },
  async next() {
    const it = this.q.shift(); if (!it) { this.busy = false; return; } this.busy = true;
    const [p, br, sp] = it, col = BAND_COL[p.band];
    let el = document.getElementById('auraUp');
    if (!el) {
      el = document.createElement('div'); el.id = 'auraUp'; document.body.appendChild(el);
      const css = document.createElement('style'); css.textContent = `#auraUp{position:fixed;inset:0;z-index:95;pointer-events:none;display:none;align-items:center;justify-content:center;flex-direction:column;font-family:inherit}
#auraUp.on{display:flex}
#auraUp .au-bg{position:absolute;inset:0;background:radial-gradient(circle at 50% 50%,var(--ac) 0%,transparent 60%);opacity:0;animation:auBg 2.6s ease-out forwards}
#auraUp .au-ring{position:absolute;left:50%;top:50%;width:40px;height:40px;margin:-20px;border-radius:50%;border:4px solid var(--ac);box-shadow:0 0 30px var(--ac),inset 0 0 20px var(--ac);animation:auRing 1.4s ease-out forwards}
#auraUp .au-ring.r2{animation-delay:.25s;border-width:2px;opacity:0}
#auraUp .au-pre{position:relative;font-size:13px;letter-spacing:6px;color:#fff;opacity:.85;text-shadow:0 0 8px #000;animation:auTx 2.6s ease-out forwards}
#auraUp .au-big{position:relative;font-size:46px;font-weight:900;letter-spacing:8px;color:var(--ac);text-shadow:0 0 18px var(--ac),0 0 4px #000,0 3px 0 #000;animation:auTx 2.6s ease-out forwards}
#auraUp .au-sub{position:relative;max-width:80%;text-align:center;font-size:14px;color:#f2f2f2;text-shadow:0 0 6px #000,0 1px 0 #000;margin-top:6px;animation:auTx 2.6s ease-out forwards}
#auraUp .au-bar{position:relative;display:flex;gap:6px;margin-top:12px;animation:auTx 2.6s ease-out forwards}
#auraUp .au-bar i{width:26px;height:8px;border-radius:4px;background:#333;box-shadow:0 0 0 1px #0008}
#auraUp .au-bar i.on{background:var(--c);box-shadow:0 0 8px var(--c)}
#auraUp .au-bar i.now{transform:scaleY(1.6);animation:auPulse .5s ease-in-out 3}
#auraUp.br .au-big{font-size:54px}
@keyframes auBg{0%{opacity:0}15%{opacity:.75}100%{opacity:0}}
@keyframes auRing{0%{transform:scale(.2);opacity:1}100%{transform:scale(24);opacity:0}}
@keyframes auTx{0%{opacity:0;transform:scale(1.6)}12%{opacity:1;transform:scale(1)}80%{opacity:1}100%{opacity:0}}
@keyframes auPulse{50%{filter:brightness(2)}}`;
      document.head.appendChild(css);
    }
    const dots = BAND_COL.map((c, i) => `<i class="${i <= p.band ? 'on' : ''} ${i === p.band ? 'now' : ''}" style="--c:${c}"></i>`).join('');
    el.style.setProperty('--ac', col); el.className = 'on' + (br ? ' br' : '');
    el.innerHTML = br
      ? `<div class="au-bg"></div><div class="au-ring"></div><div class="au-ring r2"></div><div class="au-pre">THE RED BURNS WHITE — AND BREAKS</div><div class="au-big">BREAKTHROUGH · ${p.grade}</div><div class="au-sub">You are ${p.grade}-grade now. Your aura falls back to green and starts the climb again.${sp ? ` +${sp} Skill Point for everyone.` : ''}</div><div class="au-bar">${dots}</div>`
      : `<div class="au-bg"></div><div class="au-ring"></div><div class="au-ring r2"></div><div class="au-pre">${p.grade}-GRADE · YOUR AURA DEEPENS</div><div class="au-big">${BAND_NAME[p.band].toUpperCase()}</div><div class="au-sub">${AURA_LINE[p.band]}${sp ? ` +${sp} Skill Point for everyone.` : ''}</div><div class="au-bar">${dots}</div>`;
    sfx(br ? 'art' : 'level'); if (br) setTimeout(() => sfx('level'), 500);
    if (br) banner('POWER GRADE ' + p.grade, 'You broke through.', 2600);
    await wait(this.q.length ? 2000 : 2700); el.className = ''; el.innerHTML = '';
    this.next();
  }
};
// the Guild card shows your registered power grade
Story.rankCheck = function () {
  const S = G.S; if (!S || !S.rank) return; const p = Power.now();
  if (GRADES.indexOf(p.grade) > GRADES.indexOf(S.rank)) { S.rank = p.grade; toast(`The Guild re-stamps your card: <b style="color:${TIER_COL[p.grade]}">${p.grade}-RANK</b>.`, 3600); }
};
if (typeof Guild !== 'undefined') {
  Guild.award = function (xp, gold, why) { G.S.gold += gold || 0; sfx('coin'); toast(`<b>${why}</b> — +${xp} EXP${gold ? ` · +${gold}g` : ''}`, 3200); Story.gainXp(xp); };
  Guild.rp = () => Power.xp();
}

/* ---------- skill trees ---------- */
const TREES = {
  me: { name: () => G.S.name, branches: {
    Blade: [
      { id: 'b1', name: 'Honed Edge', desc: '+3 ATK.', cost: 1, eff: { atk: 3 } },
      { id: 'b2', name: "Vane's Footwork", desc: 'Your attack timing window is 25% wider.', cost: 1, req: 'b1' },
      { id: 'b3', name: 'Snow Sever', desc: 'Learn Vane\'s first technique: a single cut too fast to parry. (New Art)', cost: 2, req: 'b2', art: 'sever' },
      { id: 'b4', name: 'Last Light', desc: 'PERFECT hits deal ×1.8 instead of ×1.5.', cost: 2, req: 'b3' },
      { id: 'b5', name: 'Mirage Step', desc: 'The teleport slash. Vanish and strike from three directions. Needs power grade B. (New Art)', cost: 3, req: 'b3', minGrade: 'B', art: 'mirage' }],
    Eye: [
      { id: 'e1', name: 'Steady Gaze', desc: 'Emerald Ascension lasts 4 turns instead of 3.', cost: 1, req: 'art:sight' },
      { id: 'e2', name: 'Clear Sight', desc: 'Emerald Ascension costs 3 less MP to force awake.', cost: 1, req: 'e1' },
      { id: 'e3', name: 'Read the Blade', desc: 'Dodge and parry windows are 20% wider — always, not just with Sight.', cost: 2, req: 'e2' }],
    Tide: [
      { id: 't1', name: 'Deep Azure', desc: 'The Azure orb can swallow 4 attacks instead of 3.', cost: 1, req: 'art:azure' },
      { id: 't2', name: 'Crimson Edge', desc: 'Crimson Tide hits ×1.25 harder.', cost: 1, req: 'art:crimson' },
      { id: 't3', name: 'Cool Blood', desc: 'Every Art causes 8 less Strain; your blood cools 4 faster.', cost: 2, req: 't1' },
      { id: 't4', name: 'Eclipse Convergence', desc: 'Blue and red, meeting at one point. Not yet. (End game)', cost: 99, req: 'never' }],
    Body: [
      { id: 'h1', name: 'Tomb Body', desc: '+15 max HP.', cost: 1, eff: { maxHp: 15 } },
      { id: 'h2', name: 'Scale Skin', desc: '+3 DEF.', cost: 1, req: 'h1', eff: { def: 3 } },
      { id: 'h3', name: 'Deep Breath', desc: '+5 max MP.', cost: 1, req: 'h1', eff: { maxMp: 5 } }] } },
  oren: { name: () => 'Oren', branches: { Forge: [
      { id: 'o1', name: 'Hammer Arm', desc: '+3 ATK.', cost: 1, ally: { atk: 3 } }, { id: 'o2', name: 'Anvil Chest', desc: '+4 DEF, +12 HP.', cost: 1, req: 'o1', ally: { def: 4, hp: 12 } },
      { id: 'o3', name: 'Splitting Cleave', desc: 'Forge Cleave hits ×1.3 harder.', cost: 2, req: 'o2', artMul: { cleave: 1.3 } }] } },
  kess: { name: () => 'Kess', branches: { Shadow: [
      { id: 'k1', name: 'Quick Hands', desc: '+2 ATK, +2 SPD.', cost: 1, ally: { atk: 2, spd: 2 } }, { id: 'k2', name: 'Thousand Needles', desc: 'Viper Needle hits ×1.35 harder.', cost: 1, req: 'k1', artMul: { needle: 1.35 } },
      { id: 'k3', name: 'Ghost Step', desc: 'Kess\'s dodge and parry windows are 25% wider.', cost: 2, req: 'k2', reflex: 1.25 }] } },
  liora: { name: () => 'Liora', branches: { Spear: [
      { id: 'l1', name: 'Mother\'s Form', desc: '+3 ATK.', cost: 1, ally: { atk: 3 } }, { id: 'l2', name: 'Dragon-Piercer', desc: 'Wyrmpiercer hits ×1.3 harder.', cost: 1, req: 'l1', artMul: { wyrm: 1.3 } },
      { id: 'l3', name: 'Moonlit Reflexes', desc: 'Liora\'s dodge and parry windows are 25% wider.', cost: 2, req: 'l2', reflex: 1.25 }] } }
};
const Skills = {
  st() { const S = G.S; S.sk = S.sk || {}; S.sp = S.sp || {}; return S; },
  has(who, id) { const S = this.st(); return !!(S.sk[who] && S.sk[who].includes(id)); },
  node(who, id) { for (const b of Object.values(TREES[who].branches)) for (const n of b) if (n.id === id) return n; },
  reqMet(who, n) { if (n.minGrade && GRADES.indexOf(Power.now().grade) < GRADES.indexOf(n.minGrade)) return false; if (!n.req) return true; if (n.req === 'never') return false; if (n.req.startsWith('art:')) return G.S.arts.includes(n.req.slice(4)); return this.has(who, n.req); },
  learn(who, id) {
    const S = this.st(), n = this.node(who, id); if (!n || this.has(who, id) || !this.reqMet(who, n) || (S.sp[who] || 0) < n.cost) return false;
    S.sp[who] -= n.cost; (S.sk[who] = S.sk[who] || []).push(id); sfx('level');
    if (n.eff) for (const k in n.eff) { G.S.stats[k] += n.eff[k]; if (k === 'maxHp') G.S.stats.hp += n.eff[k]; if (k === 'maxMp') G.S.stats.mp += n.eff[k]; }
    if (n.art && !G.S.arts.includes(n.art)) G.S.arts.push(n.art);
    return true;
  },
  allyBonus(who) { const b = { atk: 0, def: 0, hp: 0, spd: 0 }; const T = TREES[who]; if (!T) return b; for (const br of Object.values(T.branches)) for (const n of br) if (n.ally && this.has(who, n.id)) for (const k in n.ally) b[k] += n.ally[k]; return b; },
  artMul(who, k) { let m = 1; const T = TREES[who]; if (T) for (const br of Object.values(T.branches)) for (const n of br) if (n.artMul && n.artMul[k] && this.has(who, n.id)) m *= n.artMul[k]; if (who === 'me' && k === 'crimson' && this.has('me', 't2')) m *= 1.25; return m; },
  reflex(who) { let m = 1; if (who === 'me' && this.has('me', 'e3')) m *= 1.2; const T = TREES[who]; if (T && who !== 'me') for (const br of Object.values(T.branches)) for (const n of br) if (n.reflex && this.has(who, n.id)) m *= n.reflex; return m; }
};
ARTS.sever = { name: 'Snow Sever', strain: 20, mp: 4, desc: 'Vane\'s first technique. One cut, faster than the eye — it cannot be parried. ×1.9.', type: 'hit', hits: [{ anim: 'slash', m: 1.9 }], brk: 16, pierce: 1 };
let skillWho = 'me';
function skillsMenuHTML() {
  const S = Skills.st(), who = ['me', ...S.party.filter(id => TREES[id])].includes(skillWho) ? skillWho : 'me';
  const people = ['me', ...S.party.filter(id => TREES[id])];
  const p = Power.now();
  let h = `<div class="stat" style="margin-bottom:6px"><h3>Power grade ${Power.badge(p)} <span class="muted">· ${BAND_NAME[p.band]} · ${Power.xp()} / ${p.hi} EXP</span></h3>
    <div class="gbar"><i style="width:${p.frac * 100}%;background:${BAND_COL[p.band]}"></i></div>
    <p class="muted">Your aura climbs six colours each grade: ${BAND_COL.map((c, i) => `<b style="color:${c}">${BAND_NAME[i]}</b>`).join(' → ')}. Every colour makes you stronger; yellow, purple and the breakthrough also give everyone a Skill Point. You can only break through to the next grade once your aura burns red.</p>
    <div class="btnrow">${people.map(w => `<button class="btn ${w === who ? 'pri' : ''}" data-who="${w}">${TREES[w].name()} · ${S.sp[w] || 0} SP</button>`).join('')}</div></div>`;
  h += '<div class="tree">';
  for (const [bn, nodes] of Object.entries(TREES[who].branches)) {
    h += `<div class="branch"><h4>${bn}</h4>`;
    for (const n of nodes) {
      const got = Skills.has(who, n.id), ok = Skills.reqMet(who, n), afford = (S.sp[who] || 0) >= n.cost;
      h += `<div class="node ${got ? 'got' : ok ? 'open' : 'locked'}"><b>${n.name}</b><span>${n.desc}</span>${got ? '<em>✔ learned</em>' : n.req === 'never' ? '<em>🔒 end game</em>' : ok ? `<button class="btn" data-learn="${n.id}" ${afford ? '' : 'disabled'}>Learn · ${n.cost} SP</button>` : (n.minGrade && GRADES.indexOf(Power.now().grade) < GRADES.indexOf(n.minGrade) ? `<em>🔒 needs power grade ${n.minGrade}</em>` : '<em>🔒 learn the one above first</em>')}</div>`;
    }
    h += '</div>';
  }
  return h + '</div>';
}
function bindSkillsMenu() {
  $$('#menuCard [data-who]').forEach(b => bindTap(b, () => { skillWho = b.dataset.who; sfx('blip'); UI.renderMenu(); }));
  $$('#menuCard [data-learn]').forEach(b => bindTap(b, () => { if (Skills.learn(skillWho === 'me' || G.S.party.includes(skillWho) ? skillWho : 'me', b.dataset.learn)) toast('Skill learned.'); UI.renderMenu(); }));
}

// in battle, Ren's aura shows its colour — faint at green, roaring at red
(function () {
  if (typeof Battle === 'undefined') return;
  const _r = Battle.render.bind(Battle);
  Battle.render = function (c, t) {
    const out = _r(c, t), B = this.B;
    try {
      const me = B && B.actors.find(a => a.isMe && !a.ko); if (!me || B.tutorial || G.S.kid) return out;
      const p = Power.now(), col = BAND_COL[p.band], s = BT_SCALE * (me.size || 1), k = .1 + p.band * .045 + Math.sin(t / 200) * .03;
      const h = col.slice(1), rgb = [0, 2, 4].map(i => parseInt(h.substr(i, 2), 16)).join(',');
      c.save(); c.globalCompositeOperation = 'lighter';
      const g = c.createRadialGradient(me.x, me.y - 28 * s, 4, me.x, me.y - 28 * s, (34 + p.band * 4) * s);
      g.addColorStop(0, `rgba(${rgb},${k})`); g.addColorStop(1, `rgba(${rgb},0)`); c.fillStyle = g;
      c.fillRect(me.x - 60 * s, me.y - 90 * s, 120 * s, 110 * s); c.restore();
      if (p.band >= 3 && Math.random() < .08 + p.band * .04) B.fx.push({ x: me.x + rnd(-14, 14) * s, y: me.y - rnd(0, 50) * s, vx: rnd(-.2, .2), vy: rnd(-1.4, -.5), life: rnd(350, 700), t: 0, col, s: rnd(1.2, 2.2) });
    } catch (e) { }
    return out;
  };
})();
