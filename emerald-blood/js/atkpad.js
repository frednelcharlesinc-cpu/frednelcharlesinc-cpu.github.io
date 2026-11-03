'use strict';
/* ATTACK BY TOUCH
   - TAP an enemy  → attack it (your standard strikes)          - the ⚔ button (bottom right) does the same
   - SWIPE anywhere on the battlefield → start a Four Cuts combo (↑ / ↓ / ← / →); time slows, keep swiping, tap to draw
   - THE MOVE BAR, floating just above the fighter whose turn it is: two tabs —
       ⚔ MOVES    five physical moves (single cuts and the techniques you've learned)
       ✦ SPECIALS five special moves (Drag Arts, Stone Skills, Link Art, transformations…)
     One tap fires the move at once, at the enemy you last hit (or the only one standing). No second tap, no target step.
     Which five sit in each tab is chosen while meditating (Menu → Stones → Meditation). */
const MoveBar = {
  SINGLE: ['L', 'S', 'W', 'P'],
  DEF_PHYS: ['L', 'S', 'W', 'P', 'LS'],
  norm(lb) { return String(lb).replace(/\s*[×(].*$/, '').trim(); },
  lo() { const f = G.S.f; f.loadout = f.loadout || { phys: null, spec: null }; return f.loadout; },
  // every physical move this fighter can use: the four single cuts, the techniques learned, the ones invented
  physPool(a) {
    const st = FOUR.st(), max = FOUR.maxLen(a), style = FOUR.styleOf(a), S = FOUR.STYLE[style];
    const out = this.SINGLE.map(r => ({ code: r, name: S.b[r] }));
    for (const k of Object.keys(FOUR.REC)) if (st.known[k] && k.length <= max) out.push({ code: k, name: FOUR.name(k, style) });
    for (const [k, n] of Object.entries(FOUR.custom())) if (k.length <= max) out.push({ code: k, name: n });
    return out;
  },
  // specials the meditation list can offer outside battle: Drag Arts you have, your stone skills, and anything seen in battle
  specPoolMed() {
    const s = new Set();
    try { for (const k of G.S.arts || []) if (k !== 'sight' && typeof ARTS !== 'undefined' && ARTS[k]) s.add(ARTS[k].name); } catch (e) { }
    try { if (typeof Stones !== 'undefined' && typeof MECH !== 'undefined') for (const id of Stones.equipped()) if (MECH.SKILL[id]) s.add(MECH.SKILL[id][0]); } catch (e) { }
    for (const k of Object.keys(G.S.f.specSeen || {})) s.add(k);
    return [...s];
  },
  /* ---------- meditation: slot the moves ---------- */
  medHTML() {
    if (!G.S || G.S.kid) return '';
    const lo = this.lo(), me = { isMe: true, id: 'me' };
    const phys = G.S.f.vaneDone ? this.physPool(me) : [], spec = this.specPoolMed();
    const P = (lo.phys || this.DEF_PHYS).slice(0, 5), Q = (lo.spec || spec.slice(0, 5)).slice(0, 5);
    while (P.length < 5) P.push(''); while (Q.length < 5) Q.push('');
    const sel = (kind, i, cur, opts) => `<select data-mb="${kind}" data-i="${i}" style="flex:1;min-width:0;padding:6px;border-radius:8px;background:#0e1a14;color:#eafff1;border:1px solid #2c5a40;font:700 12px Nunito,system-ui">
      <option value="">— empty —</option>${opts.map(o => `<option value="${o[0]}" ${o[0] === cur ? 'selected' : ''}>${o[1]}</option>`).join('')}</select>`;
    const po = phys.map(m => [m.code, m.name + (m.code.length > 1 ? ' (' + m.code.length + ' cuts · ' + FOUR.cost(m.code.length) + ' MP)' : '')]);
    const so = spec.map(n => [n, n]);
    return `<div class="stat" style="margin-bottom:6px"><h3 style="color:#7dffb0">Meditation — your move bar</h3>
      <p class="muted">Sit with the blade and choose what rides above you in battle: five <b>⚔ Moves</b> and five <b>✦ Specials</b>. One tap in battle fires them.</p>
      ${G.S.f.vaneDone ? `<p style="margin:4px 0 2px"><b>⚔ Moves</b></p><div style="display:flex;flex-wrap:wrap;gap:4px">${P.map((c, i) => sel('phys', i, c, po)).join('')}</div>` : '<p class="muted">⚔ Moves open once you can hold Last Light.</p>'}
      <p style="margin:6px 0 2px"><b>✦ Specials</b></p><div style="display:flex;flex-wrap:wrap;gap:4px">${Q.map((c, i) => sel('spec', i, c, so)).join('')}</div>
      <p class="muted" style="margin-top:4px">New arts and skills show up here once you have them (or after you've used them in a fight).</p></div>`;
  },
  medBind() {
    $$('#menuCard select[data-mb]').forEach(el => el.addEventListener('change', () => {
      const lo = this.lo(), k = el.dataset.mb, i = +el.dataset.i;
      if (!lo[k]) lo[k] = k === 'phys' ? this.DEF_PHYS.slice() : this.specPoolMed().slice(0, 5);
      while (lo[k].length < 5) lo[k].push('');
      const j = el.value ? lo[k].indexOf(el.value) : -1; if (j >= 0 && j !== i) lo[k][j] = lo[k][i];   // already slotted elsewhere: swap
      lo[k][i] = el.value; sfx('blip'); if (typeof save === 'function') save(); if (j >= 0 && j !== i) UI.renderMenu();
    }));
  }
};

(function () {
  if (typeof Battle === 'undefined' || typeof FOUR === 'undefined') return;
  const css = document.createElement('style');
  css.textContent = `#atkHint{position:fixed;z-index:56;left:50%;bottom:max(8px,env(safe-area-inset-bottom));transform:translateX(-50%);padding:4px 12px;border-radius:12px;background:rgba(8,16,12,.6);color:#d8ece0;font:700 11px Nunito,system-ui;pointer-events:none;white-space:nowrap;transition:opacity .4s}
  #atkHint.hide{opacity:0}
  #gpad{position:fixed;z-index:57;right:calc(max(8px,env(safe-area-inset-right)) + 50px);bottom:max(10px,env(safe-area-inset-bottom));width:80px;height:80px;touch-action:none}
  #gpad.hide,#mbar.hide{display:none}
  #gpad .go{position:absolute;inset:0;border-radius:50%;display:flex;align-items:center;justify-content:center;touch-action:none;-webkit-tap-highlight-color:transparent}
  #gpad .go i{display:flex;flex-direction:column;align-items:center;justify-content:center;width:66px;height:66px;border-radius:50%;background:rgba(255,110,80,.18);border:2px solid rgba(255,150,120,.6);color:#fff;font-style:normal;font-size:20px;text-shadow:0 1px 3px #000;transition:transform .07s,background .07s,box-shadow .07s}
  #gpad .go i small{font:800 8.5px Nunito,system-ui;margin-top:1px}
  #gpad .go.on i,#mbar .mv.on{transform:scale(.86);background:rgba(255,255,255,.32);box-shadow:0 0 16px var(--c,#fff)}
  #mbar{position:fixed;z-index:57;display:flex;flex-direction:column;align-items:center;gap:4px;touch-action:none;font-family:Nunito,system-ui;-webkit-user-select:none;user-select:none}
  #mbar .tabs{display:flex;gap:4px}
  #mbar .tab{padding:3px 10px;border-radius:10px;background:rgba(8,16,12,.62);border:1px solid rgba(255,255,255,.18);color:#cfe3d6;font:800 11px Nunito,system-ui;-webkit-tap-highlight-color:transparent}
  #mbar .tab.sel{background:rgba(70,255,149,.28);border-color:#7dffb0;color:#fff}
  #mbar .row{display:flex;gap:5px}
  #mbar .mv{position:relative;width:54px;height:54px;border-radius:50%;display:flex;flex-direction:column;align-items:center;justify-content:center;background:rgba(10,20,15,.62);border:2px solid var(--c,rgba(255,255,255,.4));color:#fff;text-shadow:0 1px 2px #000;transition:transform .07s,background .07s,box-shadow .07s;-webkit-tap-highlight-color:transparent;touch-action:none}
  #mbar .mv b{font-size:15px;line-height:1}
  #mbar .mv span{font:800 8.5px/1.05 Nunito,system-ui;max-width:52px;text-align:center;overflow:hidden;max-height:18px}
  #mbar .mv em{position:absolute;top:-5px;right:-4px;font:800 8.5px Nunito,system-ui;font-style:normal;padding:0 4px;border-radius:7px;background:#0b2a4a;border:1px solid #5fb8ff;color:#cfe8ff}
  #mbar .mv.off{opacity:.38;filter:grayscale(.7)}
  #mbar .mv.empty{opacity:.18;border-style:dashed}`;
  document.head.append(css);

  const gp = document.createElement('div'); gp.id = 'gpad'; gp.className = 'hide'; gp.innerHTML = '<div class="go"><i>⚔<small>Attack</small></i></div>'; document.body.append(gp);
  const bar = document.createElement('div'); bar.id = 'mbar'; bar.className = 'hide'; document.body.append(bar);
  const chip = document.createElement('div'); chip.id = 'atkHint'; chip.className = 'hide'; document.body.append(chip);
  const feel = (el, col) => { el.style.setProperty('--c', col); el.classList.remove('on'); void el.offsetWidth; el.classList.add('on'); sfx('blip'); try { navigator.vibrate && navigator.vibrate(12); } catch (e) { } setTimeout(() => el.classList.remove('on'), 140); };
  let cur = null, g = null, turns = 0, tab = (() => { try { return localStorage.getItem('eb_mbtab') || 'phys'; } catch (e) { return 'phys'; } })();
  const hasArt = a => a && ((a.isMe && !G.S.kid && G.S.f.vaneDone) || (!a.isMe && ['liora', 'kess', 'oren'].includes(a.id)));
  const target = a => (a.lastTarget && !a.lastTarget.ko && a.lastTarget) || Battle.alive('e')[0] || null;
  const hide = () => { chip.classList.add('hide'); gp.classList.add('hide'); bar.classList.add('hide'); cur = null; };
  const go = fn => { const c = cur; hide(); if (typeof AT !== 'undefined') { AT.fold(); AT.btn.classList.add('hide'); } Battle.closeMenu(); fn(c); };
  const onDown = (el, fn) => el.addEventListener('pointerdown', e => { e.preventDefault(); e.stopPropagation(); if (!cur) return; try { audioUnlock(); } catch (x) { } fn(el); });

  // ⚔ attack
  onDown(gp.querySelector('.go'), el => { feel(el, '#ff9a7a'); const t = target(cur.a); if (!t) return; go(c => Battle.doAttack(c.a, t).then(c.done)); });

  /* ---------- reading this turn's specials out of the battle menu (without opening it) ---------- */
  const grab = fn => { let got = null; const o = Battle.openMenu; Battle.openMenu = L => { got = L; }; try { fn(); } catch (e) { } finally { Battle.openMenu = o; } return got || []; };
  function specials(a, L) {
    const out = [];
    for (const it of L) {
      const lb = String(it[0]);
      if (lb === 'More') { for (const x of specials(a, grab(it[2]).filter(y => y[0] !== '◀ Back'))) out.push(x); continue; }
      if (/^(Drag Arts|Skills|Stone Skills)$/.test(lb)) { for (const x of grab(it[2])) if (x[0] !== '◀ Back') out.push(x); }
      else if (/^(Link Art|Transform|Ascen|Emerald Ascension|Eleventh|Phantom|Wyrmshade)/.test(lb)) out.push(it);
    }
    if (a.isMe) { const s = G.S.f.specSeen = G.S.f.specSeen || {}; for (const x of out) s[MoveBar.norm(x[0])] = 1; }
    return out;
  }
  const ICON = n => /fang/i.test(n) ? '🜂' : /crimson|blood/i.test(n) ? '🔥' : /azure|tide/i.test(n) ? '💧' : /ruin|verdant/i.test(n) ? '🌿' : /ascen|transform|wyrm/i.test(n) ? '✷' : /link/i.test(n) ? '⛓' : /eleven/i.test(n) ? '⑪' : /stone|shard|scale|verdict/i.test(n) ? '◆' : '✦';
  const short = n => { n = MoveBar.norm(n).replace(/^(Emerald|Stance:)\s+/, ''); return n.length > 11 ? n.slice(0, 10) + '…' : n; };

  function render() {
    const c = cur; if (!c) return;
    const a = c.a, phys = hasArt(a) ? MoveBar.physPool(a) : [], spec = c.spec;
    if (!phys.length && !spec.length) { bar.classList.add('hide'); return; }
    if (tab === 'phys' && !phys.length) tab = 'spec'; if (tab === 'spec' && !spec.length) tab = 'phys';
    const lo = a.isMe ? MoveBar.lo() : {};
    let slots;
    if (tab === 'phys') {
      const want = (a.isMe && lo.phys) || MoveBar.DEF_PHYS;
      slots = want.slice(0, 5).map(code => { if (!code) return null; const m = phys.find(p => p.code === code); return m ? { kind: 'phys', code, name: m.name, cost: FOUR.cost(code.length) } : { kind: 'gone', name: code }; });
    } else {
      const want = (a.isMe && lo.spec && lo.spec.some(Boolean)) ? lo.spec : spec.map(x => MoveBar.norm(x[0]));
      slots = want.slice(0, 5).map(n => { if (!n) return null; const x = spec.find(s => MoveBar.norm(s[0]) === n); return x ? { kind: 'spec', x, name: n, cost: x[4] } : { kind: 'gone', name: n }; });
    }
    while (slots.length < 5) slots.push(null);
    if (!a.isMe) while (slots.length && !slots[slots.length - 1]) slots.pop();
    const AR = { L: '↑', S: '↓', P: '←', W: '→' };
    bar.innerHTML = `<div class="row">${slots.map((s, i) => {
      if (!s) return `<div class="mv empty"></div>`;
      if (s.kind === 'gone') return `<div class="mv off" data-i="${i}"><b>·</b><span>${short(s.name)}</span></div>`;
      const off = (s.cost && a.mp < s.cost) || (s.kind === 'spec' && s.x[3]);
      const col = s.kind === 'phys' ? FOUR.COL[s.code[0]] : '#7dffb0';
      const ic = s.kind === 'phys' ? (s.code.length === 1 ? FOUR.ICON[s.code] : s.code.split('').map(r => AR[r]).join('')) : ICON(s.name);
      return `<div class="mv${off ? ' off' : ''}" data-i="${i}" style="--c:${col}"><b style="${ic.length > 2 ? 'font-size:9px;letter-spacing:-1px' : ''}">${ic}</b><span>${short(s.name)}</span>${s.cost ? `<em>${s.cost}</em>` : ''}</div>`;
    }).join('')}</div>
      <div class="tabs">${phys.length ? `<div class="tab ${tab === 'phys' ? 'sel' : ''}" data-t="phys">⚔ Moves</div>` : ''}${spec.length ? `<div class="tab ${tab === 'spec' ? 'sel' : ''}" data-t="spec">✦ Specials</div>` : ''}</div>`;
    bar.querySelectorAll('.tab').forEach(el => onDown(el, () => { tab = el.dataset.t; try { localStorage.setItem('eb_mbtab', tab); } catch (e) { } sfx('blip'); render(); }));
    bar.querySelectorAll('.mv[data-i]').forEach(el => onDown(el, () => {
      const s = slots[+el.dataset.i]; if (!s) return;
      if (s.kind === 'gone') { toast(`${s.name} isn't available in this fight.`, 1600); return; }
      if (s.cost && a.mp < s.cost) { toast(`Not enough MP for ${s.name} (${s.cost} MP).`, 1600); sfx('miss'); return; }
      if (s.kind === 'spec' && s.x[3]) { toast(String(s.x[1] || 'Not available right now.').slice(0, 160), 2400); sfx('miss'); return; }
      feel(el, el.style.getPropertyValue('--c') || '#fff');
      const t = target(a);
      if (s.kind === 'phys') { if (!t) return; go(c2 => FOUR.run(c2.a, t, s.code.split(''), true).then(r => r === 'cancel' ? c2.reopen() : c2.done())); return; }
      // a special: run the battle's own command, with its target step answered for you
      const op = Battle.pickTarget; let used = false;
      Battle.pickTarget = function (a2, cb) { used = true; Battle.pickTarget = op; const tt = target(a2 || a); Battle.closeMenu(); cb(tt); };
      go(() => { try { s.x[2](); } catch (e) { console.warn(e); } finally { if (!used) setTimeout(() => { if (!used) Battle.pickTarget = op; }, 4000); } });
    }));
    place();
  }
  // float the bar just above the fighter's head
  function place() {
    const c = cur; if (!c || bar.classList.contains('hide')) return;
    const a = c.a, fh = G.view.fullH || G.view.h, W = bar.offsetWidth || 290, H = bar.offsetHeight || 80;
    const sx = a.x / G.view.w * innerWidth, sy = (a.y - 66 * BT_SCALE * (a.size || 1)) / fh * innerHeight;
    // stay clear of the party boxes at the top and the turn-order strip on the right
    let top = 8; for (const el of document.querySelectorAll('#bparty')) { const r = el.getBoundingClientRect(); if (r.height) top = Math.max(top, r.bottom + 4); }
    bar.style.left = Math.max(8, Math.min(innerWidth - W - 58, sx - W / 2)) + 'px';
    bar.style.top = Math.max(top, Math.min(innerHeight - H - 96, sy - H)) + 'px';
  }
  addEventListener('resize', place);

  function show(a, done, reopen, L) {
    cur = { a, done, reopen, spec: specials(a, L || []) }; turns++;
    chip.innerHTML = `<b>${a.name}</b> · tap ⚔ or an enemy to attack · tap a move above ${a.isMe ? 'you' : a.name}${hasArt(a) ? ' · swipe to combo' : ''} · ◉ menu`;
    chip.classList.toggle('hide', turns > 6 && !(G.settings && G.settings.hints));
    gp.classList.remove('hide'); bar.classList.remove('hide'); render();
  }

  // tap an enemy to attack it; swipe to start a Four Cuts combo
  const enemyAt = (cx, cy) => { const B = Battle.B; if (!B) return null; const x = cx / innerWidth * G.view.w, y = cy / innerHeight * (G.view.fullH || G.view.h);
    let best = null, bd = 90; for (const e of Battle.alive('e')) { const d = Math.hypot(e.x - x, e.y - 30 * (e.size || 1) - y); if (d < bd) { bd = d; best = e; } } return best; };
  cv.addEventListener('pointerdown', e => { if (!cur || G.mode !== 'battle' || (Battle.B && Battle.B.targeting)) return; g = { x: e.clientX, y: e.clientY }; }, true);
  cv.addEventListener('pointerup', e => {
    if (!cur || !g) return; const dx = e.clientX - g.x, dy = e.clientY - g.y, d = Math.hypot(dx, dy), x0 = g.x, y0 = g.y; g = null;
    if (d < 26) { const t = enemyAt(x0, y0); if (!t) return; sfx('blip'); go(c => Battle.doAttack(c.a, t).then(c.done)); return; }
    if (!hasArt(cur.a)) return;
    const r = Math.abs(dy) > Math.abs(dx) ? (dy < 0 ? 'L' : 'S') : (dx < 0 ? 'P' : 'W');
    const t = target(cur.a); if (!t) return;
    go(c => FOUR.run(c.a, t, [r]).then(res => res === 'cancel' ? c.reopen() : c.done()));
  });

  if (typeof CombatX !== 'undefined') {
    const _m = CombatX.menu.bind(CombatX);
    CombatX.menu = function (a, L, done, resolve, reopen) {
      _m(a, L, done, resolve, reopen);
      for (let i = L.length - 1; i >= 0; i--) if (/^(Attack|Four (Cuts|Lines|Strikes|Shadows))$/.test(L[i][0])) L.splice(i, 1);
      // read the menu once every other part of the game has added its commands
      setTimeout(() => { try { if (Battle.B && Battle.menuL && !Battle.B.targeting) show(a, () => { hide(); done(); }, reopen, Battle.menuL); } catch (e) { console.warn(e); } }, 0);
    };
  }
  // remember who you last hit, so moves and combos go at the same enemy
  const _da = Battle.doAttack.bind(Battle);
  Battle.doAttack = function (a, t) { if (a) a.lastTarget = t; return _da(a, t); };
  const _cm = Battle.closeMenu.bind(Battle);
  Battle.closeMenu = function () { const r = _cm(); hide(); return r; };
  // test hooks
  window.__padAttack = () => { if (!cur) return false; const t = Battle.alive('e')[0]; if (!t) return false; go(c => Battle.doAttack(c.a, t).then(c.done)); return true; };
  window.__mbar = () => cur ? { tab, spec: cur.spec.map(x => x[0]), html: bar.innerHTML.length } : null;
  setInterval(() => { if (!Battle.B && cur) hide(); else if (cur) place(); }, 400);
})();
