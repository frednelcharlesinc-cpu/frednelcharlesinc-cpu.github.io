'use strict';
/* ================= POWER GRADES & SKILL TREES =================
   No levels. Experience raises your Power Grade: E → D → C → B → A → S → SS → SSS.
   Within a grade, colour shows how close you are to the next: GREEN (new) → YELLOW (halfway) → RED (about to break through).
   Every colour step earns a Skill Point for you and each ally. */
const GRADES = ['E', 'D', 'C', 'B', 'A', 'S', 'SS', 'SSS'];
const GRADE_XP = [0, 150, 400, 800, 1400, 2300, 3600, 5500, 8000];
const BAND_COL = ['#46e070', '#ffd34a', '#ff5050'], BAND_NAME = ['green', 'yellow', 'red'];
const Power = {
  xp() { const S = G.S; if (S.xpTotal === undefined) S.xpTotal = Math.max(0, (S.lvl - 1) * 90 + (S.xp || 0)); return S.xpTotal; },
  of(xp) {
    let i = 0; while (i < GRADES.length - 1 && xp >= GRADE_XP[i + 1]) i++;
    const lo = GRADE_XP[i], hi = GRADE_XP[i + 1], frac = Math.min(.999, (xp - lo) / (hi - lo)), band = frac < 1 / 3 ? 0 : frac < 2 / 3 ? 1 : 2;
    return { i, grade: GRADES[i], band, frac, lo, hi, step: i * 3 + band };
  },
  now() { return this.of(this.xp()); },
  badge(p) { p = p || this.now(); return `<span class="grade" style="--gc:${BAND_COL[p.band]}">${p.grade}</span>`; }
};
// replaces level-ups
Story.gainXp = function (n) {
  const S = G.S, before = Power.now(); S.xpTotal = Power.xp() + n; const after = Power.now();
  const steps = after.step - before.step; if (steps <= 0) { S.lvl = after.step + 1; return false; }
  const st = S.stats; S.sp = S.sp || {}; const who = ['me', ...Object.keys(ALLY)];
  for (let k = 0; k < steps; k++) { st.maxHp += 5; st.atk += 1; for (const w of who) S.sp[w] = (S.sp[w] || 0) + 1; }
  if (after.i > before.i) { st.maxHp += 10; st.maxMp += 3; st.def += 1; banner('POWER GRADE ' + after.grade, 'You broke through.', 2600); }
  st.hp = st.maxHp; st.mp = st.maxMp; S.lvl = after.step + 1; sfx('level');
  for (const k in S.allies) S.allies[k] = {};
  toast(`Power rising — <b style="color:${BAND_COL[after.band]}">${after.grade} · ${BAND_NAME[after.band]}</b>. +${steps} Skill Point${steps > 1 ? 's' : ''} for everyone. (Menu → Skills)`, 3800);
  if (Story.rankCheck) Story.rankCheck();
  return true;
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
      { id: 'e1', name: 'Steady Gaze', desc: 'Emerald Sight lasts 4 turns instead of 3.', cost: 1, req: 'art:sight' },
      { id: 'e2', name: 'Clear Sight', desc: 'Emerald Sight costs 3 less MP.', cost: 1, req: 'e1' },
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
    <p class="muted">Green = new to this grade. Yellow = halfway. Red = about to break through. Every colour step earns everyone a Skill Point.</p>
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
