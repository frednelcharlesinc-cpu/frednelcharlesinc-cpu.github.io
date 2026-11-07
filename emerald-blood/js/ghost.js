/* ================= GHOST STANCE & THE MARTIAL ARTS PAGE =================
   GHOST STANCE (Liora's art): while it holds, a pale ghost of her follows every hit she lands and strikes again.
     · Activated by hand: 2 turns, the ghost hits for 55%.
     · Triggered by the ELEVENTH STEP: her transformation — 3 turns, the ghost hits for 100%. No more "drained".
   Ren can learn it from her later (Menu → Martial Arts), once he has seen the Eleventh Step and earned her trust.
   MARTIAL ARTS page: build and name your own sword techniques, choose a Path, and slot moves onto the battle bar.
   Every technique you know can be fired straight from the move bar. */
const Ghost = {
  MP: { liora: 8, me: 9 },
  on(a) { return a && a.ghostT > 0; },
  start(a, turns, mult, big) {
    a.ghostT = turns; a.ghostMult = mult; const B = Battle.B;
    Battle.text(a, big ? 'GHOST STANCE — AWAKENED' : 'GHOST STANCE', '#dfeeff', -78, true); sfx(big ? 'art' : 'chant');
    if (B) { B.flash = Math.max(B.flash || 0, big ? .8 : .35); B.flashCol = '220,235,255'; for (let i = 0; i < (big ? 6 : 3); i++) this.echoFx(a, (i - 1) * 16, 520 + i * 80, .5); }
    Battle.spark(a.x, a.y - 30, '#e8f2ff', big ? 30 : 14); Battle.hud();
  },
  echoFx(a, dx, life, a0) {
    const B = Battle.B; if (!B) return;
    const img = a.isMe ? playerImg() : a.img; if (!img) return;
    B.fx.push({ ghost: 1, x: a.x + (dx || 0), y: a.y - 2, t: 0, life: life || 380, img, anim: a.anim, fr: a.frame || 0, s: BT_SCALE * (a.size || 1), flip: a.flip, col: '#d8e8ff', a0: a0 || .62 });
  },
  learned() { return !!(G.S && G.S.f && G.S.f.ghostLearned); },
  canLearn() { const f = G.S.f; let bond = 1; try { bond = Bonds.get('liora').lv; } catch (e) { } return !!f.elevenSeen && (bond >= 2 || f.trial === 'done'); }
};
const MARTIAL = { phys: new Set(['Four Cuts', 'Ghost Stance']) };

(function () {
  /* ---------- the echo: every landed hit is answered by the ghost ---------- */
  const _rh = Battle.resolveHit.bind(Battle);
  Battle.resolveHit = function (a, t, m, grade, opts) {
    const r = _rh(a, t, m, grade, opts);
    if (r === 'hit' && Ghost.on(a) && t && t.side === 'e' && !(opts && opts.echo)) {
      const B = Battle.B;
      setTimeout(() => {
        if (Battle.B !== B || !t || t.ko) return;
        Ghost.echoFx(a, a.side === 'p' ? -18 : 18, 420, .7); sfx('swing');
        _rh(a, t, m * (a.ghostMult || .55), 'good', Object.assign({}, opts || {}, { echo: 1, unblockable: 1 }));
        Battle.text(t, 'GHOST', '#dfeeff', -54); Battle.spark(t.x, t.y - 34, '#e8f2ff', 10);
      }, 170);
    }
    return r;
  };
  /* the stance wears off turn by turn */
  const _pt = Battle.playerTurn.bind(Battle);
  Battle.playerTurn = function (a) {
    if (a && a.ghostT > 0) { a.ghostT--; if (!a.ghostT) { Battle.text(a, 'THE GHOST FADES', '#9aa8bc', -60); a.ghostMult = 0; } else Ghost.echoFx(a, 14, 600, .45); }
    return _pt(a);
  };

  /* ---------- the Eleventh Step: flashier, and it wakes her ghost ---------- */
  if (typeof Eleven !== 'undefined') {
    const _step = Eleven.step.bind(Eleven);
    Eleven.step = async function (a, t) {
      const B = Battle.B;
      // the overture: eleven ghosts of her ring the target, one beat at a time
      const _rhythm = this.rhythm.bind(this);
      this.rhythm = async () => {
        const r = await _rhythm(); this.rhythm = _rhythm;
        B.dim = .75; B.dimCol = '6,10,20';
        for (let i = 0; i < 11; i++) {
          const ang = -Math.PI / 2 + i * Math.PI * 2 / 11, gx = t.x + Math.cos(ang) * 92, gy = t.y + Math.sin(ang) * 34;
          const img = a.img; if (img) B.fx.push({ ghost: 1, x: gx, y: gy, t: 0, life: 1500 - i * 40, img, anim: 'thrust', fr: 2, s: BT_SCALE * (a.size || 1), flip: gx > t.x, col: i === 10 ? '#fff6c8' : '#cfe0ff', a0: .7 });
          Battle.text({ x: gx, y: gy, side: 'p' }, String(i + 1), i === 10 ? '#fff6c8' : '#dfeeff', -40, i === 10);
          Battle.spark(gx, gy - 30, i === 10 ? '#fff6c8' : '#bfe0ff', 8); sfx(i === 10 ? 'charge' : 'blip'); B.shake = Math.max(B.shake || 0, 2 + i * .6);
          await wait(85);
        }
        for (let i = 0; i < 6; i++) B.fx.push({ hline: 1, x1: t.x - 260, x2: t.x + 260, y: t.y - 60 + i * 12, t: 0, life: 420 + i * 60 });
        B.flash = 1; B.flashCol = '255,250,230'; await wait(160);
        return r;
      };
      await _step(a, t);
      // aftershock rings, then the transformation
      if (B === Battle.B) {
        for (let i = 0; i < 4; i++) { B.fx.push({ kick: 1, x: t.x, y: t.y, t: 0, life: 520 + i * 120, col: i % 2 ? '#fff6c8' : '#bfe8ff', R: 60 + i * 40 }); }
        B.shake = 20; B.dim = 0;
        a.drained = 0;
        Ghost.start(a, 3, 1, true);
        await Battle.msg('Liora opens her eyes. Behind her, something pale opens its eyes too. GHOST STANCE.', 1500);
      }
    };
  }

  /* ---------- battle commands ---------- */
  if (typeof CombatX !== 'undefined') {
    const _m = CombatX.menu.bind(CombatX);
    CombatX.menu = function (a, L, done, resolve, reopen) {
      _m(a, L, done, resolve, reopen);
      const who = a.isMe ? (Ghost.learned() ? 'me' : null) : (a.id === 'liora' ? 'liora' : null);
      if (who && !G.S.kid) {
        const cost = Ghost.MP[who], on = Ghost.on(a);
        const it = ['Ghost Stance', on ? `Already in Ghost Stance (${a.ghostT} turn${a.ghostT > 1 ? 's' : ''} left).` : `${who === 'me' ? 'Liora\'s art, as she taught you' : 'Seren\'s old art'}: for 2 turns a ghost follows every hit and strikes again for 55%. (The Eleventh Step awakens it at full strength.)`,
          () => { Battle.closeMenu && Battle.closeMenu(); a.mp -= cost; Ghost.start(a, 2, .55, false); Battle.hud(); setTimeout(done, 700); }, on || a.mp < cost, cost];
        it.mart = 1; L.splice(1, 0, it);
      }
      // every sword technique Ren knows — vanilla and his own — can be fired straight from the bar
      if (a.isMe && !G.S.kid && G.S.f.vaneDone && typeof FOUR !== 'undefined') {
        const st = FOUR.st();
        const list = Object.keys(FOUR.REC).filter(k => st.known[k]).map(k => [FOUR.name(k, 'sword'), k]).concat(Object.entries(FOUR.custom()).map(([k, n]) => [n, k]));
        for (const [nm, code] of list) {
          if (code.length > FOUR.maxLen(a)) continue;
          const cost = FOUR.cost(code.length); MARTIAL.phys.add(nm);
          const it = [nm, `${code.split('').map(r => ({ L: '↑', S: '↓', P: '←', W: '→' })[r]).join(' ')} — ${FOUR.REC[code] ? FOUR.REC[code][4] : 'your own technique'}`,
            () => Battle.pickTarget(a, t => FOUR.run(a, t, code.split(''), true).then(r => r === 'cancel' ? reopen() : done())), a.mp < cost, cost || undefined];
          it.mart = 1; L.push(it);
        }
      }
    };
  }
  /* the move bar picks these up as sword moves */
  if (typeof MoveBar !== 'undefined') {
    const _ip = MoveBar.isPhys.bind(MoveBar);
    MoveBar.isPhys = function (name) { return MARTIAL.phys.has(this.norm(name)) || /^Four (Cuts|Lines|Strikes|Shadows)/.test(String(name)) || _ip(name); };
    const _mp = MoveBar.medPools.bind(MoveBar);
    MoveBar.medPools = function () {
      const P = _mp();
      if (G.S && G.S.f.vaneDone && typeof FOUR !== 'undefined') {
        const st = FOUR.st();
        for (const k of Object.keys(FOUR.REC)) if (st.known[k]) { const n = FOUR.name(k, 'sword'); MARTIAL.phys.add(n); if (!P.phys.includes(n)) P.phys.push(n); }
        for (const n of Object.values(FOUR.custom())) { MARTIAL.phys.add(n); if (!P.phys.includes(n)) P.phys.push(n); }
        if (!P.phys.includes('Four Cuts')) P.phys.unshift('Four Cuts');
      }
      if (Ghost.learned() && !P.phys.includes('Ghost Stance')) P.phys.push('Ghost Stance');
      return P;
    };
  }

  /* ---------- Ren learns Ghost Stance ---------- */
  Ghost.teach = async function () {
    const f = G.S.f;
    await narr('You find Liora on her own, spear across her knees, counting under her breath.');
    await me('neutral', 'That thing you do. After the eleventh step. The… ghost.');
    await say('liora', 'smirk', 'Seren\'s Ghost Stance. My mother\'s. You want it? It\'s not a trick, Sword Saint\'s student. It\'s a way of standing.');
    await say('liora', 'neutral', 'Every time you strike, you leave a little of yourself behind — and it strikes too. You have to be calm enough to let go of it.');
    await narr('She makes you stand in the cold for an hour, sword out, breathing on her count. Then another hour. On the last breath, something pale steps out of your shadow — and steps back in.');
    await say('liora', 'blush', '…Okay. That was annoyingly fast. Don\'t tell anyone I taught you.');
    f.ghostLearned = 1; sfx('level'); toast('<b style="color:#dfeeff">Ghost Stance learned</b> — use it in battle from the ⚔ Sword tab.', 4200);
    try { Bonds.gain('liora', 30); } catch (e) { }
    save();
  };

  /* ---------- the Martial Arts page ---------- */
  const AR = { L: '↑', S: '↓', P: '←', W: '→' };
  MARTIAL.build = [];
  MARTIAL.html = function () {
    const S = G.S, f = S.f;
    if (S.kid) return '<div class="stat"><p class="muted">Martial arts come later.</p></div>';
    let h = `<div class="stat" style="margin-bottom:6px"><h3 style="color:#cfe8ff">Martial Arts</h3><p class="muted">Build and name your own techniques, choose your Path, and pick which moves sit on your battle bar.</p></div>`;
    // Ghost Stance
    h += `<div class="stat lore" style="margin-bottom:6px"><h3 style="color:#dfeeff">👻 Ghost Stance <span class="muted">· Liora's art</span></h3>
      <p>For 2 turns, a ghost follows every hit and strikes again for 55% damage. The Eleventh Step awakens it in Liora at full strength for 3 turns.</p>
      ${Ghost.learned() ? '<p style="color:#7dffb0"><b>Learned.</b> It sits in your ⚔ Sword tab in battle (9 MP).</p>'
        : Ghost.canLearn() ? '<div class="btnrow"><button class="btn pri" id="mGhost">Ask Liora to teach you</button></div>'
        : '<p class="muted">Locked. See Liora use the Eleventh Step, then earn her trust (Bond 2 with Liora, or finish the Guild Trial).</p>'}</div>`;
    if (typeof FOUR === 'undefined' || !f.vaneDone) return h + '<div class="stat"><p class="muted">Sword techniques open once Vane teaches you the Four Cuts.</p></div>';
    const st = FOUR.st(), max = FOUR.maxLen({ isMe: true });
    const seqH = k => k.split('').map(r => `<b style="color:${FOUR.COL[r]}">${AR[r]}</b>`).join(' ');
    // Path
    h += `<div class="stat" style="margin-bottom:6px"><h3>Path</h3><div class="btnrow">${Object.entries(FOUR.PATHS).map(([k, [n]]) => `<button class="btn ${st.path === k ? 'pri' : ''}" data-mpath="${k}">${n}</button>`).join('')}</div><p class="muted">${FOUR.PATHS[st.path][1]}</p></div>`;
    // the builder
    const b = MARTIAL.build, code = b.join(''), cost = FOUR.cost(b.length);
    let verdict = '';
    if (b.length) {
      if (FOUR.REC[code]) verdict = `<span style="color:#ffd36a">That's ${FOUR.name(code, 'sword')} — a known technique.</span>`;
      else if (FOUR.custom()[code]) verdict = `<span style="color:#7dffb0">You already named this: ${FOUR.custom()[code]}.</span>`;
      else if (b.length < 2) verdict = '<span class="muted">Add at least 2 moves.</span>';
      else if (!FOUR.valid(b)) verdict = '<span style="color:#ff8a8a">This pattern would fizzle — 4+ moves need 3 different moves, no repeats in a row, and no simple loop.</span>';
      else verdict = `<span style="color:#7dffb0">A new technique! ${cost} MP. Give it a name and save it.</span>`;
    }
    h += `<div class="stat" style="margin-bottom:6px"><h3 style="color:#7dffb0">Create a technique <span class="muted">· up to ${max} moves</span></h3>
      <div class="btnrow">${FOUR.ROLES.map(r => `<button class="btn" data-mrole="${r}" style="border-color:${FOUR.COL[r]};color:${FOUR.COL[r]}">${AR[r]} ${FOUR.STYLE.sword.b[r]}</button>`).join('')}</div>
      <p style="font-size:22px;margin:6px 0;min-height:28px">${b.length ? seqH(code) : '<span class="muted" style="font-size:13px">Tap the moves in order…</span>'}</p>
      <p style="margin:2px 0">${verdict}</p>
      <div class="btnrow"><input id="mtName" maxlength="24" placeholder="Name your technique" style="flex:1;min-width:120px;padding:6px 8px;border-radius:8px;border:1px solid #2f5a44;background:#0b1510;color:#eafff1;font:700 13px Nunito"><button class="btn pri" id="mtSave">Save</button><button class="btn" id="mUndo">⌫</button><button class="btn" id="mClear">Clear</button></div>
      <p class="muted">↑ Rise lifts · ↓ Fall breaks guards · → Wind hits every foe · ← Needle pierces. Saved techniques appear on your move bar.</p></div>`;
    // the list
    const known = Object.keys(FOUR.REC).filter(k => st.known[k]);
    h += `<div class="stat" style="margin-bottom:6px"><h3>Your techniques</h3>
      ${known.map(k => `<p style="margin:2px 0"><b style="color:#ffd36a">${FOUR.name(k, 'sword')}</b> ${seqH(k)} <span class="muted">· ${FOUR.REC[k][4]}</span></p>`).join('')}
      ${Object.entries(FOUR.custom()).map(([k, n]) => `<p style="margin:2px 0"><b style="color:#7dffb0">${n}</b> ${seqH(k)} <span class="muted">· yours · ${FOUR.cost(k.length)} MP</span> <button class="btn" data-mdel="${k}" style="padding:1px 8px;font-size:11px">✕</button></p>`).join('') || '<p class="muted">None of your own yet — build one above.</p>'}</div>`;
    return h + (typeof MoveBar !== 'undefined' ? MoveBar.medHTML() : '');
  };
  MARTIAL.bind = function () {
    const re = () => UI.renderMenu();
    const g = $('#mGhost'); if (g) bindTap(g, () => { UI.closeMenu(); Story.run(async () => { await Ghost.teach(); }); });
    $$('#menuCard [data-mpath]').forEach(el => bindTap(el, () => { FOUR.st().path = el.dataset.mpath; sfx('level'); save(); re(); }));
    $$('#menuCard [data-mrole]').forEach(el => bindTap(el, () => { if (MARTIAL.build.length >= FOUR.maxLen({ isMe: true })) { toast('That\'s as many moves as you can chain for now.', 1800); return; } MARTIAL.build.push(el.dataset.mrole); sfx('blip'); re(); }));
    const u = $('#mUndo'); if (u) bindTap(u, () => { MARTIAL.build.pop(); sfx('blip'); re(); });
    const c = $('#mClear'); if (c) bindTap(c, () => { MARTIAL.build = []; sfx('blip'); re(); });
    const s = $('#mtSave'); if (s) bindTap(s, () => {
      const b = MARTIAL.build, code = b.join(''), nm = (($('#mtName') || {}).value || '').trim();
      if (b.length < 2) { toast('Add at least 2 moves first.', 1800); return; }
      if (FOUR.REC[code]) { toast(`That pattern is already ${FOUR.name(code, 'sword')}.`, 2200); return; }
      if (!FOUR.valid(b)) { toast('That pattern would fizzle. Try a different order.', 2200); return; }
      FOUR.custom()[code] = nm || FOUR.invent(code, 'sword'); MARTIAL.phys.add(FOUR.custom()[code]);
      sfx('level'); toast(`Technique saved: <b style="color:#7dffb0">${FOUR.custom()[code]}</b>`, 2600); MARTIAL.build = []; save(); re();
    });
    $$('#menuCard [data-mdel]').forEach(el => bindTap(el, () => { delete FOUR.custom()[el.dataset.mdel]; sfx('blip'); save(); re(); }));
    if (typeof MoveBar !== 'undefined') MoveBar.medBind();
  };
})();
