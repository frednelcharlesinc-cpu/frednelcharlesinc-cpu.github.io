'use strict';
/* ================= THE FOUR — combo arts by weapon =================
   Every fighter's art has four moves with the same four roles:
     LIFT (launch, extra guard damage) · BREAK (smash guard, crack shields, end stances) · SWEEP (hits every foe) · PIERCE (ignores parries and shields)
   The sword art is the FOUR CUTS (Rise · Fall · Wind · Needle) — Ren and every sword user.
   Spears, fists and knives have their own four (Four Lines, Four Strikes, Four Shadows).
   SHEATHE PHASE: time slows (a random amount, 15–40% speed) and a timer bar appears (random length, never below a fair minimum).
     Enter moves in order; a short gap timer runs between presses. Press DRAW (or run out of time / reach your max length) to strike.
   DRAW PHASE: each move is a timed strike. The first (the draw) hits hardest. Two misses in a row break the chain.
     Every hit PERFECT = FLAWLESS DRAW finisher.
   Rules: 1 move = a single cut. 2–3 moves may repeat freely (plain cuts if not a known technique).
     4–6 moves must be a real technique (no move twice in a row, 3+ different moves, not a pure cycle) — anything else fizzles.
   Techniques are discovered by entering them. Max length grows with Last Light's bond (Ren) or the fighter's skill. */
const FOUR = {
  ROLES: ['L', 'S', 'W', 'P'],
  STYLE: {
    sword: { art: 'The Four Cuts', cmd: 'Four Cuts', b: { L: 'Rise', S: 'Fall', W: 'Wind', P: 'Needle' } },
    spear: { art: 'The Four Lines', cmd: 'Four Lines', b: { L: 'Vault', S: 'Brace', W: 'Sweep', P: 'Lunge' } },
    fist: { art: 'The Four Strikes', cmd: 'Four Strikes', b: { L: 'Uppercut', S: 'Hammer', W: 'Hook', P: 'Jab' } },
    knife: { art: 'The Four Shadows', cmd: 'Four Shadows', b: { L: 'Flick', S: 'Pin', W: 'Fan', P: 'Sting' } }
  },
  COL: { L: '#7fe8a8', S: '#ffb04a', W: '#7fd8ff', P: '#e8a0ff' },
  ICON: { L: '▲', S: '▼', W: '◆', P: '●' },
  // role recipes: [sword name, spear name, fist name, knife name, effect note]
  REC: {
    LS: ['Heron Drop', 'Moonfall', 'Rising Hammer', 'Kite and Nail', 'Lift, then slam. Big single-target damage.'],
    WW: ['Crescent', 'Tidal Arc', 'Double Hook', 'Twin Fan', 'A wide double sweep.'],
    PL: ['Reaching Thorn', 'Wolf Rise', 'Jab-Up', 'Sting and Flick', 'Pierce, then lift.'],
    SP: ['Anvil Needle', 'Brace and Bite', 'Hammer-Jab', 'Pin and Sting', 'Break the guard, then pierce the armor.'],
    LP: ['Rising Needle', 'Vault Lunge', 'Lift-Jab', 'Flick Sting', 'Lift, then pierce.'],
    LSP: ['Falling Star', 'Moon Vault', 'Meteor', 'Nail Through', 'Lift, slam, pierce — a guard-breaker.'],
    WPW: ['Tide Lattice', 'Wheel of Spears', 'Storm Hands', 'Shadow Lattice', 'Sweep, pierce, sweep — for crowds.'],
    PLS: ['Thorn Hammer', 'Lunge-Vault-Brace', 'Thunder Fist', 'Pinned Kite', 'Pierce, lift, slam.'],
    LSWP: ['Four Seasons', 'Four Moons', 'Four Winds', 'Four Night Birds', 'All four moves. Every effect once.'],
    PWLS: ['Heron\'s Reach', 'Long Night', 'Iron Rain', 'Wasp Dance', 'Pierce, sweep, lift, slam.'],
    SLPW: ['Broken Gate', 'Gate Breaker', 'Gatecrasher', 'Lock-Pick', 'Shatter the guard, then carve the room.'],
    LSPWL: ['Moon Over Water', 'Silver Tide', 'Five Thunders', 'Moonless Five', 'A five-cut flow.'],
    PWSLP: ['Thousand Needles', 'Hundred Spears', 'Hundred Fists', 'Thousand Stings', 'Pierce-heavy five-cut flow.'],
    LSWLSL: ['Last Light', 'Seren\'s Song', 'Last Bell', 'Last Shadow', 'The six-cut answer. ABCABA.'],
    PWLSWP: ['Sword Saint\'s Reply', 'Wolf\'s Vow', 'Mountain Breaker', 'Night Without Moon', 'Six moves, every role twice.']
  },
  STYLE_I: { sword: 0, spear: 1, fist: 2, knife: 3 },
  styleOf(a) { if (a.isMe) return 'sword'; return { liora: 'spear', kess: 'knife', oren: 'fist' }[a.id] || 'sword'; },
  st() { const f = G.S.f; f.four = f.four || { known: { LS: 1, WW: 1, SP: 1 }, path: 'sheathe' }; return f.four; },
  known(code) { return !!this.st().known[code]; },
  name(code, style) { const r = this.REC[code]; return r ? r[this.STYLE_I[style]] : null; },
  bond() { return G.S.f.bladeBond || 0; },
  maxLen(a) {
    if (a.isMe) { if (!G.S.f.vaneDone) return 1; const b = this.bond(); return b >= 3 ? 6 : b >= 2 ? 5 : b >= 1 ? 4 : 3; }
    return a.id === 'liora' ? 5 : 3;
  },
  valid(seq) {   // the pattern rules for 4+ moves
    if (seq.length < 4) return true;
    for (let i = 1; i < seq.length; i++) if (seq[i] === seq[i - 1]) return false;
    if (new Set(seq).size < 3) return false;
    for (let p = 1; p < seq.length; p++) if (seq.length % p === 0 && seq.length / p >= 2 && seq.every((c, i) => c === seq[i % p])) return false;
    return true;
  },
  cost(len) { return Math.max(0, len - 2) * 2; },

  /* ---------- the sheathe phase: time slows, enter the moves ---------- */
  input(a) {
    return new Promise(resolve => {
      const B = Battle.B, style = this.styleOf(a), S = this.STYLE[style], max = this.maxLen(a), path = this.st().path;
      const slow = rnd(.15, .4), minT = 1.6 + max * .55, T = (path === 'flow' ? 1.3 : 1) * rnd(minT, minT * 1.7), GAP = 1.25 * (path === 'flow' ? 1.3 : 1);
      B.timeScale = slow; B.dim = .25; B.dimCol = '10,30,20';
      const seq = [], t0 = performance.now(); let last = t0, done = false;
      const ov = document.createElement('div'); ov.id = 'fourOv';
      ov.style.cssText = 'position:fixed;left:0;right:0;bottom:0;z-index:72;padding:8px 10px calc(10px + env(safe-area-inset-bottom));background:linear-gradient(transparent,rgba(4,12,8,.92) 30%);touch-action:none;font-family:Nunito,system-ui';
      const known = Object.keys(this.REC).filter(k => this.known(k) && k.length <= max);
      ov.innerHTML = `<div style="display:flex;align-items:center;gap:8px;margin-bottom:6px">
          <b style="color:#cfe8ff;font-size:13px;white-space:nowrap">${S.art}</b>
          <div style="flex:1;height:8px;background:#0b1a12;border:1px solid #2f9a5a;border-radius:5px;overflow:hidden"><i id="fourT" style="display:block;height:100%;width:100%;background:#7dffb0"></i></div>
          <span id="fourS" style="color:#fff;font-size:13px;min-width:120px;text-align:right">—</span></div>
        <div id="fourHint" style="color:#9fc8b0;font-size:11px;margin-bottom:6px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis"></div>
        <div style="display:flex;gap:8px">${this.ROLES.map((r, i) => `<button data-r="${r}" style="flex:1;padding:12px 4px;border-radius:12px;border:2px solid ${this.COL[r]};background:#0b1a12;color:${this.COL[r]};font:800 15px Nunito,system-ui">${this.ICON[r]} ${S.b[r]}<small style="display:block;font-size:10px;opacity:.7">${i + 1}</small></button>`).join('')}
          <button data-draw="1" style="flex:1.1;padding:12px 4px;border-radius:12px;border:2px solid #fff;background:#1f6a3a;color:#fff;font:900 15px Nunito,system-ui">DRAW</button></div>`;
      document.body.append(ov);
      const sEl = ov.querySelector('#fourS'), tEl = ov.querySelector('#fourT'), hEl = ov.querySelector('#fourHint');
      const hint = () => {
        const code = seq.join(''), nm = this.REC[code] && this.known(code) ? this.name(code, style) : '';
        sEl.textContent = seq.length ? seq.map(r => S.b[r]).join(' · ') : '—';
        const next = known.filter(k => k.startsWith(code) && k !== code).slice(0, 3).map(k => `${this.name(k, style)}: ${k.split('').map(r => S.b[r]).join('-')}`);
        hEl.innerHTML = (nm ? `<b style="color:#ffd36a">${nm}</b>  ` : '') + (next.length ? 'Known: ' + next.join(' · ') : seq.length ? '' : `Max ${max} moves · ${known.length} known technique${known.length === 1 ? '' : 's'}`);
      };
      hint();
      const finish = () => { if (done) return; done = true; ov.remove(); removeEventListener('keydown', key); B.timeScale = 1; B.dim = 0; resolve(seq.slice()); };
      const press = r => { if (done) return; seq.push(r); last = performance.now(); sfx('blip'); hint(); if (seq.length >= max) setTimeout(finish, 120); };
      ov.querySelectorAll('[data-r]').forEach(b => b.addEventListener('pointerdown', e => { e.preventDefault(); press(b.dataset.r); }));
      ov.querySelector('[data-draw]').addEventListener('pointerdown', e => { e.preventDefault(); finish(); });
      const key = e => { const i = ['1', '2', '3', '4'].indexOf(e.key); if (i >= 0) { e.preventDefault(); press(this.ROLES[i]); } else if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); finish(); } };
      addEventListener('keydown', key);
      const tick = () => { if (done) return; const now = performance.now(), left = 1 - (now - t0) / (T * 1000);
        tEl.style.width = Math.max(0, left * 100) + '%'; tEl.style.background = left < .3 ? '#ff8a5a' : '#7dffb0';
        if (left <= 0 || (seq.length && now - last > GAP * 1000)) return finish(); requestAnimationFrame(tick); };
      requestAnimationFrame(tick);
      FOUR.__press = press; FOUR.__finish = finish;   // for tests
    });
  },

  /* ---------- the draw phase ---------- */
  async run(a, t) {
    const B = Battle.B, style = this.styleOf(a), S = this.STYLE[style], st = this.st();
    const seq = await this.input(a);
    if (!seq.length) return 'cancel';
    const code = seq.join(''), rec = this.REC[code];
    if (seq.length >= 4 && (!rec || !this.valid(seq))) {
      a.mp = Math.max(0, a.mp - 3); Battle.hud(); sfx('miss');
      Battle.text(a, 'FIZZLE', '#999', -40); await Battle.msg(`The pattern breaks apart. ${a.isMe ? 'Last Light' : a.name + '\'s weapon'} stays sheathed.`, 1100); return 'fizzle';
    }
    const cost = this.cost(seq.length);
    if (a.mp < cost) { await Battle.msg(`Not enough MP for ${seq.length} moves (${cost} MP).`, 1000); return 'cancel'; }
    a.mp -= cost; Battle.hud();
    if (rec && !st.known[code]) { st.known[code] = 1; sfx('level'); toast(`New technique: <b style="color:#ffd36a">${this.name(code, style)}</b> — ${rec[4]}`, 3800); }
    const nm = rec ? this.name(code, style) : seq.map(r => S.b[r]).join('-');
    await Battle.msg(rec ? nm.toUpperCase() + '!' : nm, 700);
    await Battle.dash(a, t.x + (a.side === 'p' ? 52 : -52), t.y + 2, 220);
    const path = st.path, VAR = { L: 'cmb3', S: 'cmb4', W: 'cmb2', P: 'thr' }, ANIM = { L: 'halfslash', S: 'jump', W: 'slash', P: 'thrust' };
    let perf = 0, miss = 0, landed = 0;
    for (let i = 0; i < seq.length; i++) {
      if (t.ko) { const nx = Battle.alive('e')[0]; if (!nx) break; t = nx; }
      const r = seq[i], first = i === 0;
      let m = .62 * (first ? (path === 'sheathe' ? 1.5 : 1.3) : 1) * (rec ? 1.15 : 1);
      const opts = { src: 'attack', brk: 0 };
      if (r === 'L') opts.brk = 10 * (path === 'break' ? 1.5 : 1);
      if (r === 'S') { opts.brk = 18 * (path === 'break' ? 1.5 : 1); if (t.shield > 0) { t.shield--; Battle.text(t, t.shield ? 'SHIELD CRACKED' : 'PHALANX BROKEN!', '#ffd34a', -40); } if (t.stance) { t.stance = 0; Battle.text(t, 'STANCE BROKEN', '#ffd34a', -24); } }
      if (r === 'P') opts.pierce = 1;
      const p0 = B.st.perf;
      if (a.isMe && typeof HD !== 'undefined') HD.forceVar = VAR[r];
      let res;
      try { res = await Battle.strike(a, t, { anim: a.isMe ? 'slash' : ANIM[r], m }, 1, opts); } finally { if (typeof HD !== 'undefined') HD.forceVar = null; }
      const wasPerf = B.st.perf > p0;
      if (wasPerf) perf++;
      if (res === 'hit') { landed++; miss = 0; } else miss++;
      if (r === 'W') for (const o of Battle.alive('e')) if (o !== t) { Battle.chip(a, o, .4); Battle.spark(o.x, o.y - 30, '#7fd8ff', 8); }
      if (miss >= 2) { Battle.text(a, 'CHAIN BROKEN', '#ff8a8a', -50, true); a.open = 1; break; }
      await wait(110);
    }
    if (perf === seq.length && seq.length >= 2 && !t.ko) {
      B.flash = .6; B.flashCol = '210,255,230'; sfx('art');
      Battle.text(a, 'FLAWLESS DRAW', '#ffd36a', -70, true);
      Battle.resolveHit(a, t, .9 + seq.length * .15, 'perfect', { src: 'flawless', pierce: 1, brk: 20 });
      await wait(350);
    }
    if (a.isMe) this.bondXp(perf + (perf === seq.length && seq.length >= 2 ? 3 : 0));
    await Battle.home(a);
    return 'done';
  },
  bondXp(n) {
    const f = G.S.f; if (!f.vaneDone || !n) return;
    f.bladeXp = (f.bladeXp || 0) + n; const T = [0, 25, 70, 140, 260], before = f.bladeBond || 0;
    let b = 0; for (let i = 0; i < T.length; i++) if (f.bladeXp >= T[i]) b = i;
    if (b > before) { f.bladeBond = b; const L = ['Silent', 'Stirring', 'Speaking', 'Awakened', 'Sworn'][b];
      setTimeout(() => { sfx('level'); toast(`Last Light's bond deepens: <b style="color:#7dffb0">${L}</b>. ${b === 1 ? 'You can now chain 4 cuts.' : b === 2 ? 'You can now chain 5 cuts.' : b === 3 ? 'You can now chain 6 cuts.' : 'The blade is sworn to you.'}`, 4200); }, 600); }
  },

  /* ---------- meditation: choose a Path, review techniques ---------- */
  PATHS: { sheathe: ['Sheathe Path', 'Counters and openings — the first cut (the draw) hits ×1.5 instead of ×1.3.'], flow: ['Flow Path', 'Long chains — 30% more time to enter moves, and a longer gap between presses.'],
    break: ['Break Path', 'Guards and armor — Lift and Break moves do 50% more guard damage.'] },
  menuHTML() {
    if (!G.S.f.vaneDone || G.S.kid) return '';
    const st = this.st(), max = this.maxLen({ isMe: true }), S = this.STYLE.sword;
    const rows = Object.keys(this.REC).map(k => { const kn = st.known[k];
      return `<p style="margin:2px 0">${kn ? `<b style="color:#ffd36a">${this.name(k, 'sword')}</b>` : '<span class="muted">???</span>'} <span class="muted">· ${k.length} cuts${kn ? ' · ' + k.split('').map(r => `<b style="color:${this.COL[r]}">${S.b[r]}</b>`).join('-') + ' · ' + this.REC[k][4] : k.length > max ? ' · needs a deeper bond' : ' · not yet discovered'}</span></p>`; }).join('');
    return `<div class="stat" style="margin-bottom:6px"><h3 style="color:#cfe8ff">The Four Cuts <span class="muted">· max ${max} cuts · ${this.PATHS[st.path][0]}</span></h3>
      <p class="muted">In battle choose <b>Four Cuts</b>: time slows and you enter cuts — <b style="color:${this.COL.L}">▲ Rise</b> (lift), <b style="color:${this.COL.S}">▼ Fall</b> (break guard), <b style="color:${this.COL.W}">◆ Wind</b> (hits everyone), <b style="color:${this.COL.P}">● Needle</b> (pierces). Then time each cut. 4+ cuts must be a real technique: no cut twice in a row, at least three different cuts. Enter an unknown pattern to discover it.</p>
      ${rows}<div class="btnrow" style="margin-top:6px">${Object.entries(this.PATHS).map(([k, [n]]) => `<button class="btn" data-path="${k}" ${st.path === k ? 'disabled' : ''}>Meditate: ${n}</button>`).join('')}</div>
      <p class="muted">${this.PATHS[st.path][1]}</p></div>`;
  }
};

(function () {
  if (typeof CombatX === 'undefined') return;
  const _m = CombatX.menu.bind(CombatX);
  CombatX.menu = function (a, L, done, resolve, reopen) {
    _m(a, L, done, resolve, reopen);
    const B = Battle.B; if (!B || (a.isMe && (G.S.kid || !G.S.f.vaneDone))) return;
    if (!a.isMe && !['liora', 'kess', 'oren'].includes(a.id)) return;
    const S = FOUR.STYLE[FOUR.styleOf(a)], max = FOUR.maxLen(a);
    L.splice(1, 0, [S.cmd, `${S.art}: time slows — enter up to ${max} moves (${FOUR.ROLES.map(r => S.b[r]).join(', ')}), then time each strike. 3+ moves cost MP.`,
      () => Battle.pickTarget(a, t => FOUR.run(a, t).then(r => r === 'cancel' ? reopen() : done()))]);
  };
  // the icon on the command button
  if (typeof cmdIcon === 'function') {
    const _ci = cmdIcon;
    cmdIcon = function (label) { if (/^Four (Cuts|Lines|Strikes|Shadows)/.test(String(label))) return ['✣', '#3a8a6a', String(label)]; return _ci(label); };
  }
  // a broken chain leaves you open: the next blow on you lands 25% harder
  const _dm = Battle.damage.bind(Battle);
  Battle.damage = function (t, dmg, big) { if (t && t.open && t.side === 'p' && dmg > 0) { t.open = 0; dmg = Math.round(dmg * 1.25); } return _dm(t, dmg, big); };
  // the technique list + meditation live on the Stones page, under Last Light
  if (typeof stonesMenuHTML === 'function') {
    const _s = stonesMenuHTML;
    stonesMenuHTML = function () { const h = _s(), i = h.indexOf('<div class="stat" style="margin-bottom:6px"><h3>Heartshards'); const x = FOUR.menuHTML(); return i >= 0 ? h.slice(0, i) + x + h.slice(i) : x + h; };
    const _b = bindStonesMenu;
    bindStonesMenu = function () { _b(); $$('#menuCard [data-path]').forEach(b => bindTap(b, () => { FOUR.st().path = b.dataset.path; sfx('level'); toast(`You sit, breathe, and let the old forms settle. <b>${FOUR.PATHS[b.dataset.path][0]}</b>.`, 3000); UI.renderMenu(); })); };
  }
})();
