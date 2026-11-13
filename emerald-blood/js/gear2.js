/* ================= THE HUNT, DEEPER =================
   1 body parts you can aim at and break (each break drops that part and weakens the monster)
   2 carving after a big kill (timing taps for extra parts)
   3 weapon upgrade trees: Fang (crit-strikes), Drake (fire), Bone (mana), Crystal (clean, steady damage)
   4 Moss, the Drag smith's apprentice — a sewer rescue, and Emerald Dawn's own forge (tempered +6, Emerald etching)
   5 armour sets   6 the Field Guide   7 tempered monsters   8 blade skills (SP)   9 Guild hunt contracts
   10 Nyx sniffs out parts   11 rarity colours   +  gear now counts toward enemy scaling (never too easy) */
Object.assign(PARTS, { tempered: { n: 'Tempered Shard', v: 220, rare: 2, use: 'TEMPERED — torn from a glowing-eyed monster. Moss forges +6 blades from it.' } });
const RARCOL = r => r === 2 ? '#ff6a4a' : r ? '#ffd36a' : '#e8f5ec';
const BODY = {   // family common part → breakable parts: [id, name, drop, weakness when broken]
  pelt: [['fangs', 'Fangs', 'fang', 'atk'], ['hide', 'Hide', 'pelt', 'def']], scale: [['tail', 'Tail', 'scale', 'spd'], ['horns', 'Horns', 'claw', 'atk']],
  bone: [['skull', 'Skull', 'bone', 'atk'], ['ribs', 'Ribcage', 'dust', 'def']], hide: [['arm', 'Club Arm', 'horn', 'atk'], ['back', 'Back Hide', 'hide', 'def']],
  gel: [['core', 'Core', 'spore', 'atk'], ['membrane', 'Membrane', 'gel', 'def']], silk: [['fangs', 'Fangs', 'venom', 'atk'], ['spinner', 'Spinneret', 'silk', 'spd']],
  crystal: [['crest', 'Crystal Crest', 'crystal', 'atk'], ['tail', 'Tail', 'crystal', 'spd']]
};
const PATHS = {
  fang: { n: 'Fang line', d: 'Perfect strikes cut deeper: +8% perfect-hit damage per level.', col: '#ffffff', p: ['fang', 'claw'] },
  drake: { n: 'Drake line', d: 'A fire edge: 10% per level that a hit sets the target BURNING.', col: '#ff7a3a', p: ['scale', 'claw'] },
  bone: { n: 'Bone line', d: 'A mana edge: +5 MP per level, and each hit restores 1 MP.', col: '#b48aff', p: ['bone', 'dust'] },
  crystal: { n: 'Crystal line', d: 'Flawless steel: +4% damage per level on every hit.', col: '#7fe3ff', p: ['crystal', 'gel'] }
};
const SETS = {
  pack: { n: 'Pack Hunter', a: 'hidecoat', c: 'fangcharm', d: '+10% damage for each ally still standing.' },
  grave: { n: 'Grave Pact', a: 'bonemail', c: 'dustcharm', d: 'Killing a foe heals you 6% of your HP.' },
  viper: { n: 'Viper Scale', a: 'scalevest', c: 'venomcharm', d: '+20% damage against BROKEN foes.' },
  unbowed: { n: 'Unbowed', a: 'bruteplate', c: 'sporecharm', d: '+4 DEF and +10% HP.' },
  drakefire: { n: 'Drakefire', a: 'drakemail', c: 'embercharm', d: 'Every perfect hit sets the target BURNING.' },
  moon: { n: 'Moonweave', a: 'silkcloak', c: 'crystalcharm', d: '+2 MP back at the start of each of your turns.' }
};
const BSKILL = {
  keen: { n: 'Keen Edge', c: 2, d: '+5% damage on every hit.' },
  whet: { n: 'Finisher', c: 2, d: '+15% damage against foes under 30% HP.' },
  razor: { n: 'Razor\'s Focus', c: 3, d: '+10% damage while you are above half HP.' },
  carver: { n: 'Master Carver', c: 2, d: 'Harvest one extra part from every big hunt.' }
};
Object.assign(Gear, {
  path(w) { return this.blade(w).path; },
  setOf(w) { const eq = (this.st().gear.eq[w]) || {}; for (const k in SETS) if (eq.armor === SETS[k].a && eq.charm === SETS[k].c) return k; return null; },
  sk(w, k) { const S = this.st(); return !!((S.bsk || {})[w] || {})[k]; }
});
// path-aware edge length and wear; set/Unbowed and Bone MP in the bonus
(function () {
  const _max = Gear.max.bind(Gear), _wear = Gear.wear.bind(Gear), _bonus = Gear.bonus.bind(Gear);
  Gear.max = function (w) { const b = this.blade(w); return 100 + Math.min(b.lv, 5) * 25 + (b.lv >= 6 ? 50 : 0) + (b.path === 'crystal' ? b.lv * 40 : 0) + (b.etched ? 20 : 0); };
  Gear.wear = function (w) { const b = this.blade(w); let r = 1.5 * (1 - Math.min(b.lv, 5) * .12); if (b.path === 'crystal') r *= Math.max(.3, 1 - b.lv * .06); if (b.etched) r *= .75; if (this.sk(w, 'keen')) r *= .8; return r; };
  Gear.bonus = function (w) { const b = _bonus(w), bl = this.blade(w); if (bl.lv >= 6) b.atk += 3; if (bl.path === 'bone') b.mp += bl.lv * 5; if (this.setOf(w) === 'unbowed') b.def += 4; return b; };
})();
// ---------------- upgrade trees replace +1..+5 ----------------
const PATH_COST = l => ({ g: [0, 50, 120, 260, 520, 900][l] });
function pathParts(path, l) { const [a, b] = PATHS[path].p; const p = {}; p[a] = 2 + l; p[b] = 1 + Math.ceil(l / 2); if (l === 4) p.any = ['alphaheart', 'drakegem', 'trollblood']; if (l === 5) { p.soulember = 1; p.livingcore = 1; } return p; }
(function () {
  const _rs = Gear.renderSmith.bind(Gear);
  Gear.renderSmith = function (msg) {
    _rs(msg);
    // replace each blade's single upgrade button with the tree
    for (const w of this.who()) {
      const btn = $(`#menuCard [data-up="${w}"]`), card = (btn && btn.closest('.stat')) || $$('#menuCard [data-sh]').find(b => b.dataset.sh === w)?.closest('.stat'); if (!card) continue;
      card.querySelectorAll('[data-up], p.muted:last-child').forEach(x => { if (x.dataset.up || /Needs|Fully forged/.test(x.textContent)) x.remove(); });
      const bl = this.blade(w), S = this.st(), box = document.createElement('div');
      if (bl.lv >= 5) box.innerHTML = `<p class="muted" style="margin:2px 0">${bl.path ? `<b style="color:${PATHS[bl.path].col}">${PATHS[bl.path].n}</b> — ` : ''}fully forged.${bl.lv < 6 ? ' Only a Drag smith works steel past this.' : ''}</p>`;
      else if (!bl.path) box.innerHTML = `<p class="muted" style="margin:4px 0 2px">Choose this blade's path (it can't be changed):</p>` + Object.entries(PATHS).map(([k, P]) => { const p = pathParts(k, 1), ok = this.have(p) && S.gold >= 50;
        return `<button class="btn" data-path="${w}|${k}" ${ok ? '' : 'disabled'} style="border-color:${P.col}">${P.n} +1 (50g)</button><span class="muted" style="font-size:11px"> ${P.d} Needs ${this.cost(p)}.</span><br>`; }).join('');
      else { const l = bl.lv + 1, p = pathParts(bl.path, l), g = PATH_COST(l).g, ok = this.have(p) && S.gold >= g;
        box.innerHTML = `<button class="btn" data-path="${w}|${bl.path}" ${ok ? '' : 'disabled'}>${PATHS[bl.path].n} → +${l} (${g}g)</button><p class="muted" style="margin:2px 0;font-size:11px">${PATHS[bl.path].d} Needs ${this.cost(p)}.</p>`; }
      card.appendChild(box);
    }
    $$('#menuCard [data-path]').forEach(b => bindTap(b, () => { const [w, k] = b.dataset.path.split('|'), bl = this.blade(w), l = bl.lv + 1, p = pathParts(k, l), g = PATH_COST(l).g;
      if (!this.have(p) || S().gold < g) return; this.pay(p, g); bl.path = k; bl.lv = l; bl.sharp = this.max(w); sfx('level'); save(); this.renderSmith(`${this.nm(w)}'s ${WEAPON[w] || 'blade'}: ${PATHS[k].n} +${l}.`); }));
    function S() { return G.S; }
  };
})();
// ---------------- 4: Moss, the Drag smith's apprentice ----------------
Object.assign(CHAR, { moss: { name: 'Moss', sprite: 'folk5' } });
const Moss = {
  async hint() { const f = G.S.f; if (f.mossHint || G.S.kid) return; f.mossHint = 1;
    await narr('The smith wipes her hands, glances at the door, and lowers her voice.');
    await say(null, null, '"Before the purges there was a Drag smith in this town. Best steel in the vale. They hanged him. His apprentice got away — a girl. Folk say she still works metal somewhere under the Lower Ashford grate. If you go looking… go quiet."');
    Story.quest && toast('<b>New lead:</b> the Drag smith\'s apprentice — somewhere in the Ashford Sewers (Lower Ashford grate).', 5000); save(); },
  async meet() {
    const f = G.S.f;
    if (f.mossFound) return say('moss', null, '"I\'m packing the good tongs. Meet me at the old forge in town — back room."');
    await narr('Behind a rusted pipe, a hidden alcove glows orange. A small anvil. A girl of about seventeen in a scorched apron, soot to the elbows — and green eyes, bright as yours.');
    await say('moss', null, '"…Don\'t. Don\'t say it. I can see yours too." She doesn\'t lower the hammer. "Who sent you?"');
    await me('determined', 'Nobody sent me. I heard there was a Drag smith down here. I\'m building something — a guild where we don\'t hide.');
    await say('moss', null, '"A guild." She laughs, short and sharp. Then the rats start screaming in the pipes. "—Talk later. They found the forge again. Help me or get out of the way."');
    const r = await Battle.start({ enemies: ['sw_rat', 'sw_brute', 'sw_rat'], bd: 'crypt', noFlee: 1 });
    if (r !== 'win') return;
    f.mossFound = 1; save();
    await say('moss', null, '"…You fight like someone who\'s never had a decent blade. That\'s a crime. My master would\'ve wept."');
    await say('moss', null, '"His name was Corvane. Best smith in the vale. He used to say steel doesn\'t care what colour your eyes are — it only cares if you listen to it."');
    await me('happy', 'Then come and listen to it with us. Emerald Dawn needs a smith.');
    await say('moss', null, '"…Emerald Dawn. Stupid name. I love it." She slings the anvil-horn over her shoulder. "I\'ll set up in the back of the old forge in town. Bring me parts. Tempered ones, if you\'re brave."');
    f.dawnSmith = 1; toast('<b style="color:#46ff95">Moss joined Emerald Dawn</b> — your guild\'s own smith. Find her in the back of Oren\'s Old Forge, Ashford.', 6000); sfx('level'); save();
  },
  open() {
    const S = Gear.st(); UI.closeMenu(); World.busy = true; UI.controls(false); $('#menu').classList.remove('hide');
    const W = Gear.who(), row = w => { const bl = Gear.blade(w);
      const t6 = bl.lv === 5, okT = t6 && (S.parts.tempered || 0) >= 2 && S.gold >= 1200, okE = !bl.etched && (S.parts.alphaheart || 0) >= 1 && (S.parts.crystal || 0) >= 2 && S.gold >= 300;
      return `<div class="stat"><h3>${esc(Gear.nm(w))} <span class="muted">· ${WEAPON[w] || 'weapon'} +${bl.lv}${bl.path ? ' · ' + PATHS[bl.path].n : ''}${bl.etched ? ' · Emerald-etched' : ''}</span></h3>
        ${bl.lv >= 6 ? '<p class="muted">TEMPERED. Nothing left to teach this steel.</p>' : `<button class="btn" data-t6="${w}" ${okT ? '' : 'disabled'}>Temper to +6 (2 Tempered Shards, 1200g)</button>`}
        ${bl.etched ? '' : `<button class="btn" data-et="${w}" ${okE ? '' : 'disabled'}>Emerald etching (1 Alpha Heart, 2 Mana Crystal, 300g)</button>`}
        <p class="muted" style="font-size:11px;margin:2px 0">Tempering needs a +5 blade: +3 ATK. Etching: a green line down the steel — +4% damage.</p></div>`; };
    $('#menuCard').innerHTML = `<div class="mside"><div class="mhead"><h2>Moss's Forge</h2><button id="mClose">Close ✕</button></div><p class="muted">"Human smiths won't touch tempered steel. Too proud, or too scared. I'm neither."</p><p><b style="color:#ffd36a">${S.gold}g</b> · Tempered Shards: ${S.parts.tempered || 0}</p></div><div class="mbody">${W.map(row).join('')}</div>`;
    bindTap($('#mClose'), () => UI.closeMenu());
    $$('#menuCard [data-t6]').forEach(b => bindTap(b, () => { const w = b.dataset.t6, bl = Gear.blade(w); S.parts.tempered -= 2; S.gold -= 1200; bl.lv = 6; bl.sharp = Gear.max(w); sfx('level'); save(); this.open(); }));
    $$('#menuCard [data-et]').forEach(b => bindTap(b, () => { const w = b.dataset.et, bl = Gear.blade(w); S.parts.alphaheart--; S.parts.crystal -= 2; S.gold -= 300; bl.etched = 1; bl.sharp = Gear.max(w); sfx('level'); save(); this.open(); }));
  }
};
(function () {
  // smith hint + Moss in the forge's back room; Moss in the sewer
  const _load = World.load.bind(World);
  World.load = async function (name) {
    try {
      const sm = SCENES.a_smithy; if (sm && !sm.mossPatched) { sm.mossPatched = 1; const _n = sm.npcs;
        sm.npcs = function () { const L = _n.apply(this, arguments); for (const n of L) if (n.id === 'a_smith') { const t1 = n.talk; n.talk = async () => { if (!G.S.kid && !G.S.f.mossHint) { await Moss.hint(); return; } return t1(); }; }
          if (G.S.f.dawnSmith) L.push({ id: 'moss', sprite: 'folk5', x: 4, y: 6, dir: 'down', talk: async () => { await say('moss', null, pick(['"Tempered steel or nothing. Well. Something. But tempered is better."', '"Corvane would have liked you. He liked idiots."', '"Hold still, there\'s soot on your— no, that\'s just your face."'])); Moss.open(); } });
          return L; }; }
      const sw = SCENES.s_ashford; if (sw && !sw.mossPatched) { sw.mossPatched = 1; const _n2 = sw.npcs;
        sw.npcs = function () { const L = _n2.apply(this, arguments) || []; if (G.S.f.mossHint && !G.S.f.mossFound) L.push({ id: 'moss', sprite: 'folk5', x: 6, y: 22, dir: 'right', talk: () => Moss.meet(), qm: () => '!' }); return L; }; }
    } catch (e) { console.warn(e); }
    return _load.apply(this, arguments);
  };
})();
// ---------------- battle: body parts, tempered, sets, paths, skills ----------------
(function () {
  const famOf = e => FAMILY.find(f => f[0].test(e.key + ' ' + ((e.E && e.E.name) || '')));
  const R8 = ['E', 'D', 'C', 'B', 'A', 'S', 'SS', 'SSS', 'SSSS'];
  const _mk = Battle.mk;
  Battle.mk = function (o) {
    try {
      if (o && o.side === 'e' && !o.huntOn && G.S && !G.S.kid) { o.huntOn = 1; const E = o.E || ENEMY[o.key] || {}, F = FAMILY.find(f => f[0].test(o.key + ' ' + (E.name || '')));
        const cfg = (Battle.B && Battle.B.cfg) || {};
        if (F && !E.fixed && !cfg.tutorial && !cfg.mind) {
          const tier = Math.max(0, R8.indexOf(TIER[o.key] || 'E'));
          if (!E.boss && Math.random() < .06 && tier >= 1) { o.tempered = 1; o.name = 'Tempered ' + o.name; o.hp = Math.round(o.hp * 1.8); o.maxHp = Math.round(o.maxHp * 1.8); o.atk = Math.round(o.atk * 1.35); }
          if (E.boss || tier >= 2 || (E.hp || 0) >= 70 || o.tempered) { const bp = BODY[F[1][0]]; if (bp) o.bparts = bp.map(([id, n, drop, weak]) => ({ id, n, drop, weak, hp: Math.round((o.maxHp || o.hp) * .2), max: Math.round((o.maxHp || o.hp) * .2), broken: 0 })); }
        }
      }
      if (o && o.side === 'p' && Gear.setOf(o.isMe ? 'me' : o.id) === 'unbowed') { o.maxHp = Math.round((o.maxHp || 0) * 1.1); o.hp = Math.round((o.hp || 0) * 1.1); }
    } catch (e) { }
    return _mk.call(this, o);
  };
  const _rh = Battle.resolveHit.bind(Battle);
  Battle.resolveHit = function (a, t, m, grade, opts) {
    const B = this.B; let w = null, aimP = null, hp0 = t ? t.hp : 0;
    try {
      if (a && a.side === 'p' && t && t.side === 'e' && !G.S.kid) {
        w = a.isMe ? 'me' : a.id; const bl = Gear.blade(w), set = Gear.setOf(w);
        if (bl.path === 'fang' && grade === 'perfect') m *= 1 + bl.lv * .08;
        if (set === 'pack') m *= 1 + .1 * Math.max(0, this.alive('p').length - 1);
        if (set === 'viper' && t.broken) m *= 1.2;
        if (Gear.sk(w, 'razor') && a.hp > a.maxHp * .5) m *= 1.1;
        if (Gear.sk(w, 'keen')) m *= 1.05;
        if (Gear.sk(w, 'whet') && t.hp < t.maxHp * .3) m *= 1.15;
        if (bl.path === 'crystal') m *= 1 + bl.lv * .04;
        if (bl.etched) m *= 1.04;
        if (t.bparts && B.aim) { aimP = t.bparts.find(p => p.id === B.aim && !p.broken); if (aimP) m *= .9; }
      }
    } catch (e) { }
    const r = _rh(a, t, m, grade, opts);
    try {
      if (w && t) {
        const dealt = Math.max(0, hp0 - t.hp), bl = Gear.blade(w), set = Gear.setOf(w);
        if (aimP && dealt) { aimP.hp -= dealt * 1.4; if (aimP.hp <= 0) { aimP.broken = 1; B.breaks = B.breaks || []; B.breaks.push([t, aimP]);
          sfx('break'); setTimeout(() => sfx('crit'), 90); this.B.flash = .75; this.B.flashCol = '255,214,90'; this.B.shake = 18;
          this.B.pb = { t0: performance.now(), n: aimP.n, weak: aimP.weak, x: t.x, y: t.y - 42 * (t.size || 1) };
          this.spark(t.x, t.y - 42, '#ffd34a', 30); this.spark(t.x, t.y - 42, '#ffffff', 16); this.spark(t.x, t.y - 42, '#ff9a3a', 12);
          setTimeout(() => { try { Gear.aimBar(); } catch (e) { } }, 30);
          if (aimP.weak === 'atk') t.atk = Math.round(t.atk * .85); else if (aimP.weak === 'def') t.def = Math.max(0, (t.def || 0) - 3); else t.spd = Math.max(1, (t.spd || 1) - 2);
          const S = Gear.st(); S.breaks = S.breaks || {}; S.breaks[aimP.id] = (S.breaks[aimP.id] || 0) + 1; } }
        if (dealt && ((bl.path === 'drake' && Math.random() < bl.lv * .1) || (set === 'drakefire' && grade === 'perfect'))) { t.burn = 3; t.burnDmg = Math.max(2, Math.round(a.atk * .3)); this.text(t, 'BURNING', '#ff7a3a', -60); }
        if (dealt && bl.path === 'bone') a.mp = Math.min(a.maxMp, a.mp + 1);
        if (t.ko && hp0 > 0 && set === 'grave') { const h = Math.round(a.maxHp * .06); a.hp = Math.min(a.maxHp, a.hp + h); this.text(a, '+' + h, '#5dff9a', -20); }
        if (t.ko && hp0 > 0) { const S = Gear.st(); S.hunted = S.hunted || {}; S.hunted[t.key] = (S.hunted[t.key] || 0) + 1; }
      }
    } catch (e) { }
    return r;
  };
  const _pt = Battle.playerTurn.bind(Battle);
  Battle.playerTurn = async function (a) { try { if (Gear.setOf(a.isMe ? 'me' : a.id) === 'moon') { a.mp = Math.min(a.maxMp, a.mp + 2); } Gear.aimBar(); } catch (e) { } return _pt(a); };
  // tempered glow
  const _r = Battle.render.bind(Battle);
  Battle.render = function (c, t) { const out = _r(c, t); try { const B = this.B; if (B) for (const e of B.actors) if (e.side === 'e' && e.tempered && !e.ko) { c.save(); c.globalCompositeOperation = 'lighter'; const g = c.createRadialGradient(e.x, e.y - 30, 4, e.x, e.y - 30, 56); g.addColorStop(0, `rgba(255,90,40,${.22 + Math.sin(t / 160) * .08})`); g.addColorStop(1, 'rgba(255,90,40,0)'); c.fillStyle = g; c.beginPath(); c.arc(e.x, e.y - 30, 58, 0, 7); c.fill(); c.restore(); }
      const P = B && B.pb; if (P) { const k = (performance.now() - P.t0) / 1700; if (k >= 1) B.pb = null; else Gear.drawBreak(c, P, k); } } catch (e) { } return out; };
  Gear.drawBreak = function (c, P, k) {
    const w = G.view.w, h = G.view.h, gold = '#ffd34a';
    // 1 — the crack at the part: a bursting ring and jagged gold fractures
    if (k < .45) { const q = k / .45; c.save(); c.globalCompositeOperation = 'lighter'; c.globalAlpha = 1 - q;
      c.strokeStyle = gold; c.lineWidth = 6 * (1 - q) + 1; c.beginPath(); c.arc(P.x, P.y, 14 + q * 90, 0, 7); c.stroke();
      c.strokeStyle = '#fff'; c.lineWidth = 2; c.beginPath(); c.arc(P.x, P.y, 8 + q * 60, 0, 7); c.stroke();
      c.strokeStyle = gold; c.lineWidth = 3;
      for (let i = 0; i < 8; i++) { const a = i * .785 + .3; let x = P.x, y = P.y; c.beginPath(); c.moveTo(x, y);
        for (let j = 1; j <= 3; j++) { const r = (12 + q * 40) * j / 3 + 6; x = P.x + Math.cos(a + (j % 2 ? .25 : -.2)) * r; y = P.y + Math.sin(a + (j % 2 ? .25 : -.2)) * r; c.lineTo(x, y); } c.stroke(); }
      c.restore(); }
    // 2 — the banner: pops in, holds, slides out
    const inK = Math.min(1, k / .12), outK = k > .82 ? (k - .82) / .18 : 0, sc = inK < 1 ? .6 + inK * .55 : 1.15 - Math.min(.15, (k - .12) * .6);
    const by = h * .44, bh = Math.max(50, h * .15);
    c.save(); c.globalAlpha = 1 - outK; c.translate(w / 2 + outK * w * .3, by);
    c.fillStyle = 'rgba(10,8,2,.82)'; c.beginPath(); c.moveTo(-w * .36, -bh / 2); c.lineTo(w * .38, -bh / 2); c.lineTo(w * .36, bh / 2); c.lineTo(-w * .38, bh / 2); c.closePath(); c.fill();
    c.fillStyle = gold; c.fillRect(-w * .36, -bh / 2 - 3, w * .74, 3); c.fillRect(-w * .38, bh / 2, w * .74, 3);
    c.scale(sc, sc); c.textAlign = 'center'; c.textBaseline = 'middle';
    c.font = `900 ${Math.round(bh * .2)}px Nunito, sans-serif`; c.fillStyle = '#fff3c4'; c.fillText('✦  PART BROKEN  ✦', 0, -bh * .27);
    const gr = c.createLinearGradient(0, -bh * .1, 0, bh * .25); gr.addColorStop(0, '#fff6c8'); gr.addColorStop(.5, gold); gr.addColorStop(1, '#ff9a2a');
    c.font = `900 ${Math.round(bh * .4)}px Nunito, sans-serif`; c.shadowColor = '#ff9a2a'; c.shadowBlur = 18; c.fillStyle = gr; c.fillText(P.n.toUpperCase(), 0, bh * .1); c.shadowBlur = 0;
    c.font = `800 ${Math.round(bh * .17)}px Nunito, sans-serif`; c.fillStyle = '#ffb36a';
    c.fillText((P.weak === 'atk' ? 'ATTACK DOWN' : P.weak === 'def' ? 'DEFENCE DOWN' : 'SPEED DOWN') + '  ·  part will drop', 0, bh * .38);
    c.restore();
  };
  // the aim bar: pick a body part to break
  Gear.aimBar = function () {
    const B = Battle.B; let bar = $('#aimBar'); if (!B) { if (bar) bar.remove(); return; }
    const opts = []; for (const e of Battle.alive('e')) for (const p of (e.bparts || [])) if (!p.broken && !opts.some(o => o[0] === p.id)) opts.push([p.id, p.n, Math.max(0, p.hp / p.max)]);
    if (!opts.length) { if (bar) bar.remove(); B.aim = null; return; }
    if (!bar) { bar = document.createElement('div'); bar.id = 'aimBar'; document.body.appendChild(bar); }
    bar.innerHTML = '<span>Aim</span>' + [['', 'Body']].concat(opts).map(([k, n, f]) => `<button data-aim="${k}" class="${(B.aim || '') === k ? 'on' : ''}">${f !== undefined && f < .5 ? '⚡ ' : ''}${n}${f !== undefined ? `<i style="display:block;height:3px;margin-top:2px;border-radius:2px;background:linear-gradient(90deg,${f < .35 ? '#ff7a3a' : '#ffd36a'} ${Math.round(f * 100)}%,rgba(255,255,255,.12) 0)"></i>` : ''}</button>`).join('');
    bar.querySelectorAll('[data-aim]').forEach(b => bindTap(b, () => { B.aim = b.dataset.aim || null; sfx('blip'); Gear.aimBar(); }));
  };
  const _ui = Battle.ui.bind(Battle);
  Battle.ui = function (on) { const r = _ui(on); if (!on) { const b = $('#aimBar'); if (b) b.remove(); } return r; };
  // victory: broken parts drop, tempered shards, Nyx, carving
  const _v = Battle.victory.bind(Battle);
  Battle.victory = async function () {
    const B = this.B, es = B.actors.filter(a => a.side === 'e'), extra = {};
    try {
      for (const [e, p] of (B.breaks || [])) { extra[p.drop] = (extra[p.drop] || 0) + 1 + (e.tempered ? 1 : 0); const F = famOf(e); if (F && Math.random() < .25) extra[F[2]] = (extra[F[2]] || 0) + 1; }
      for (const e of es) if (e.tempered) extra.tempered = (extra.tempered || 0) + 1;
      if (Familiars.has('me') && Math.random() < .2) { const e = es.find(famOf); if (e) { const F = famOf(e), k = F[1][0]; extra[k] = (extra[k] || 0) + 1; setTimeout(() => toast(`<b>${esc(G.S.dragonName || 'Nyx')}</b> sniffs something out of the wreckage: +1 ${PARTS[k].n}.`, 3200), 4200); } }
    } catch (e) { }
    { const b = $('#aimBar'); if (b) b.remove(); }
    const r = await _v();
    try {
      for (const k in extra) Gear.give(k, extra[k]);
      if (Object.keys(extra).length) setTimeout(() => toast('<b style="color:#ffd36a">Broken parts:</b> ' + Object.entries(extra).map(([k, n]) => `<span style="color:${RARCOL(PARTS[k].rare)}">${PARTS[k].n} ×${n}</span>`).join(', '), 4200), 3000);
      const big = es.filter(e => e.bparts && famOf(e)); if (big.length && r === 'win') { const F = famOf(big[0]), got = {}, add = k => got[k] = (got[k] || 0) + 1;
        add(F[1][Math.random() * 2 | 0]); if (Gear.sk('me', 'carver')) add(F[1][0]); if (Math.random() < .08 + (big.some(e => e.tempered) ? .2 : 0)) add(F[2]);
        for (const k in got) Gear.give(k, got[k]); setTimeout(() => toast('<b style="color:#ffd36a">Harvested:</b> ' + Object.entries(got).map(([k, n]) => `<span style="color:${RARCOL(PARTS[k].rare)}">${PARTS[k].n} ×${n}</span>`).join(', '), 3400), 1800); }
      Contracts.check();
    } catch (e) { console.warn(e); }
    return r;
  };
})();
// ---------------- 2: carving ----------------
Gear.carve = function (F, tempered) {
  return new Promise(res => {
    const wide = Gear.sk('me', 'carver'), el = document.createElement('div'); el.id = 'carve';
    el.innerHTML = `<div class="cv-box"><h3>CARVE</h3><p class="muted">Tap when the knife crosses the gold line. 3 cuts.</p><div class="cv-track"><i class="cv-zone" style="width:${wide ? 22 : 11}%;left:${wide ? 39 : 44.5}%"></i><b class="cv-knife"></b></div><div class="cv-got"></div><button class="btn pri" id="cvCut">Cut</button></div>`;
    document.body.appendChild(el);
    let n = 0, t0 = performance.now(); const got = {}, knife = el.querySelector('.cv-knife'), log = el.querySelector('.cv-got');
    const pos = () => { const k = ((performance.now() - t0) / 900) % 2; return k < 1 ? k : 2 - k; };
    let raf; const tick = () => { knife.style.left = (pos() * 100) + '%'; raf = requestAnimationFrame(tick); }; tick();
    const end = () => { cancelAnimationFrame(raf); setTimeout(() => { el.remove(); for (const k in got) Gear.give(k, got[k]); if (Object.keys(got).length) toast('<b style="color:#ffd36a">Carved:</b> ' + Object.entries(got).map(([k, c]) => `<span style="color:${RARCOL(PARTS[k].rare)}">${PARTS[k].n} ×${c}</span>`).join(', '), 3600); save(); res(); }, 700); };
    bindTap(el.querySelector('#cvCut'), () => {
      if (n >= 3) return; n++; const p = pos(), half = (wide ? .11 : .055), d = Math.abs(p - .5);
      let k = null, tag;
      if (d <= half) { k = Math.random() < .12 + (tempered ? .2 : 0) ? F[2] : F[1][Math.random() * 2 | 0]; tag = 'PERFECT'; sfx('crit'); }
      else if (d <= half * 2.4) { k = Math.random() < .5 ? F[1][0] : null; tag = k ? 'good' : 'scrap'; sfx('press'); } else { tag = 'miss'; sfx('blip'); }
      if (k) got[k] = (got[k] || 0) + 1;
      log.innerHTML += `<span style="color:${tag === 'PERFECT' ? '#ffd36a' : tag === 'miss' ? '#ff7a7a' : '#9dffc8'}">${tag}${k ? ' — ' + PARTS[k].n : ''}</span> `;
      t0 = performance.now() - Math.random() * 900; if (n >= 3) end();
    });
  });
};
// ---------------- 9: Guild hunt contracts ----------------
const Contracts = {
  POOL: [['deliver', 'pelt', 4], ['deliver', 'scale', 3], ['deliver', 'bone', 4], ['deliver', 'hide', 3], ['deliver', 'silk', 2], ['deliver', 'gel', 5], ['deliver', 'crystal', 2], ['deliver', 'alphaheart', 1], ['deliver', 'drakegem', 1],
    ['break', 'tail', 2], ['break', 'fangs', 3], ['break', 'horns', 2], ['break', 'arm', 2], ['tempered', null, 1]],
  today() { const d = G.S.day || 1, out = []; for (let i = 0; i < 3; i++) out.push(this.POOL[(d * 7 + i * 5) % this.POOL.length]); return out; },
  key(c) { return `${G.S.day || 1}:${c.join(':')}`; },
  progress(c) { const S = Gear.st(); if (c[0] === 'deliver') return Math.min(c[2], S.parts[c[1]] || 0); if (c[0] === 'break') return Math.min(c[2], ((S.breaks || {})[c[1]] || 0) - ((S.cbase || {})[this.key(c)] || 0)); return Math.min(c[2], (S.parts.tempered || 0)); },
  pay(c) { const base = c[0] === 'deliver' ? PARTS[c[1]].v * c[2] : c[0] === 'break' ? 60 * c[2] : 400; return Math.round(base * 1.7); },
  label(c) { return c[0] === 'deliver' ? `Deliver ${c[2]}× ${PARTS[c[1]].n}` : c[0] === 'break' ? `Break ${c[2]} monster ${c[1]} (from today)` : 'Bring a Tempered Shard'; },
  check() { },
  html() {
    const S = Gear.st(); S.cdone = S.cdone || {}; S.cbase = S.cbase || {};
    return `<h3 style="color:#ffd36a;margin-top:10px">Hunt contracts <span class="muted">· new ones every day</span></h3>` + this.today().map((c, i) => { const k = this.key(c); if (c[0] === 'break' && S.cbase[k] == null) S.cbase[k] = (S.breaks || {})[c[1]] || 0;
      const p = this.progress(c), done = S.cdone[k], ok = p >= c[2] && !done;
      return `<div class="stat"><h3>${this.label(c)}</h3><p class="muted" style="margin:2px 0">${done ? 'Turned in.' : `${p}/${c[2]} · pays ${this.pay(c)}g + ${10 * c[2] + 20} Guild points`}</p>${done ? '' : `<button class="btn" data-ct="${i}" ${ok ? '' : 'disabled'}>Turn in</button>`}</div>`; }).join('');
  },
  bind() { const S = Gear.st(); $$('#menuCard [data-ct]').forEach(b => bindTap(b, () => { const c = this.today()[+b.dataset.ct], k = this.key(c); if (this.progress(c) < c[2] || S.cdone[k]) return;
    if (c[0] === 'deliver') S.parts[c[1]] -= c[2]; if (c[0] === 'tempered') S.parts.tempered -= 1;
    S.cdone[k] = 1; S.gold += this.pay(c); G.S.rpExtra = (G.S.rpExtra || 0) + 10 * c[2] + 20; sfx('level'); toast(`Contract done: +${this.pay(c)}g, +${10 * c[2] + 20} Guild points.`, 3000); save(); UI.renderMenu(); })); }
};
// ---------------- Gear tab additions: sets, skills, field guide, contracts ----------------
(function () {
  const _h = Gear.html.bind(Gear), _b = Gear.bind.bind(Gear);
  Gear.html = function () {
    const S = this.st(); S.bsk = S.bsk || {};
    let h = _h();
    const sets = Object.values(SETS).map(s => `<li><b>${s.n}</b> — ${RECIPES[s.a].n} + ${RECIPES[s.c].n}: <span class="muted">${s.d}</span></li>`).join('');
    const worn = this.who().map(w => { const k = this.setOf(w); return k ? `<b style="color:#9dffc8">${esc(this.nm(w))}: ${SETS[k].n}</b>` : null; }).filter(Boolean).join(' · ');
    const sk = this.who().map(w => `<div class="stat"><h3>${esc(this.nm(w))} <span class="muted">· ${(S.sp && S.sp[w]) || 0} SP</span></h3>${Object.entries(BSKILL).map(([k, b]) => this.sk(w, k) ? `<span style="color:#9dffc8">✓ ${b.n}</span> ` : `<button class="btn" data-bs="${w}|${k}" ${((S.sp && S.sp[w]) || 0) >= b.c ? '' : 'disabled'} title="${b.d}">${b.n} (${b.c} SP)</button>`).join('')}<p class="muted" style="font-size:11px;margin:2px 0">${Object.values(BSKILL).map(b => `${b.n}: ${b.d}`).join(' · ')}</p></div>`).join('');
    const hunted = Object.entries(S.hunted || {}).filter(([k]) => ENEMY[k]);
    const guide = hunted.length ? hunted.map(([k, n]) => { const E = ENEMY[k], F = FAMILY.find(f => f[0].test(k + ' ' + E.name)), bp = F && BODY[F[1][0]], tier = TIER[k] || 'E';
      const rc = F ? Math.round((E.boss ? .5 : .015 + Math.max(0, ['E', 'D', 'C', 'B', 'A', 'S'].indexOf(tier)) * .02) * 100) : 0;
      return `<div class="stat"><h3>${esc(E.name)} <span class="muted">· ${tier}-rank · hunted ${n}</span></h3><p class="muted" style="margin:2px 0">${F ? `Parts: ${F[1].map(p => PARTS[p].n).filter((v, i, a) => a.indexOf(v) === i).join(', ')} · rare: <span style="color:#ffd36a">${PARTS[F[2]].n}</span> ${n >= 10 ? `(${rc}% — 4× if broken)` : '(hunt 10 to learn the odds)'}` : 'No useful parts.'}${bp ? ` · breakable: ${bp.map(p => p[1]).join(', ')}` : ''}${E.trait ? ` · ${esc(E.trait)}` : ''}</p></div>`; }).join('') : '<p class="muted">Defeat monsters to fill the guide.</p>';
    h += `<h3 style="color:#ffd36a;margin-top:10px">Armour sets</h3><p class="muted">Wear the matching armour and charm for a set bonus.${worn ? ' Active: ' + worn : ''}</p><ul style="margin:4px 0 0 16px;font-size:12.5px">${sets}</ul>
      <h3 style="color:#ffd36a;margin-top:10px">Blade skills</h3>${sk}`;
    if (this.inGuild()) h += Contracts.html();
    h += `<h3 style="color:#ffd36a;margin-top:10px">Field Guide</h3><div class="grid2">${guide}</div>`;
    return h;
  };
  Gear.bind = function () { _b(); const S = this.st();
    $$('#menuCard [data-bs]').forEach(b => bindTap(b, () => { const [w, k] = b.dataset.bs.split('|'), c = BSKILL[k].c; if (((S.sp && S.sp[w]) || 0) < c) return; S.sp[w] -= c; S.bsk[w] = S.bsk[w] || {}; S.bsk[w][k] = 1; sfx('level'); save(); UI.renderMenu(); }));
    if (this.inGuild()) Contracts.bind();
  };
  // parts toast colours
  const _d = Gear.drops.bind(Gear); Gear.drops = function (es) { return _d(es); };
})();
// ---------------- never too easy: gear counts toward enemy scaling ----------------
(function () {
  const _p = DIFF.party.bind(DIFF);
  DIFF.party = function () { const P = _p(); try { let g = 0; for (const w of Gear.who()) { const b = Gear.bonus(w); g += b.atk * 2 + b.def * 2 + b.hp * .25 + b.mp * .25 + b.spd * 2 + Gear.blade(w).lv * 2; } P.stars += Math.round(g / 2); } catch (e) { } return P; };
})();
