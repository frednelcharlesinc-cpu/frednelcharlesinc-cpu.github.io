'use strict';
/* ATTACK BY TOUCH — nothing in the way: on your turn
   - TAP an enemy  → attack it (your standard strikes)
   - SWIPE anywhere on the battlefield → start a combo with that move (↑ / ↓ / ← / →); time slows, keep swiping, tap to draw
   A small hint chip at the bottom says so; it fades after a few turns. Everything else is in the floating menu button. */
(function () {
  if (typeof Battle === 'undefined' || typeof FOUR === 'undefined') return;
  const css = document.createElement('style');
  css.textContent = `#atkHint{position:fixed;z-index:56;left:50%;bottom:max(8px,env(safe-area-inset-bottom));transform:translateX(-50%);padding:4px 12px;border-radius:12px;background:rgba(8,16,12,.6);color:#d8ece0;font:700 11px Nunito,system-ui;pointer-events:none;white-space:nowrap;transition:opacity .4s}
  #atkHint.hide{opacity:0}`;
  document.head.append(css);
  /* see-through attack buttons, bottom-right: ATTACK in the middle, the four moves around it.
     Each button's touch area is bigger than what you see, reacts on the instant your finger lands (not on release),
     and answers with a flash, a squeeze, a click sound and a buzz where the phone supports it. */
  const pc = document.createElement('style');
  pc.textContent = `#gpad{position:fixed;z-index:57;right:calc(max(8px,env(safe-area-inset-right)) + 50px);bottom:max(6px,env(safe-area-inset-bottom));width:168px;height:168px;touch-action:none;pointer-events:none}
  #gpad.hide{display:none}
  #gpad .b{position:absolute;pointer-events:auto;border-radius:50%;display:flex;align-items:center;justify-content:center;touch-action:none;-webkit-tap-highlight-color:transparent}
  #gpad .b i{display:flex;flex-direction:column;align-items:center;justify-content:center;border-radius:50%;background:rgba(255,255,255,.10);border:2px solid rgba(255,255,255,.38);color:rgba(255,255,255,.92);font-style:normal;text-shadow:0 1px 3px #000;transition:transform .07s,background .07s,box-shadow .07s;box-shadow:0 0 0 0 transparent}
  #gpad .b i small{font:800 8.5px Nunito,system-ui;opacity:.9;margin-top:1px}
  #gpad .mv{width:60px;height:60px}#gpad .mv i{width:42px;height:42px;font-size:15px}
  #gpad .go{width:76px;height:76px;left:46px;top:46px}#gpad .go i{width:62px;height:62px;font-size:20px;background:rgba(255,110,80,.16);border-color:rgba(255,150,120,.55)}
  #gpad .b.on i{transform:scale(.86);background:rgba(255,255,255,.32);box-shadow:0 0 16px var(--c,#fff)}`;
  document.head.append(pc);
  const gp = document.createElement('div'); gp.id = 'gpad'; gp.className = 'hide'; document.body.append(gp);
  const GPOS = { L: [54, -6], W: [-6, 54], P: [114, 54], S: [54, 114] };
  const feel = (el, col) => { el.style.setProperty('--c', col); el.classList.add('on'); sfx('blip'); try { navigator.vibrate && navigator.vibrate(12); } catch (e) { } setTimeout(() => el.classList.remove('on'), 140); };
  function pad(a) {
    const art = hasArt(a), S = FOUR.STYLE[FOUR.styleOf(a)];
    gp.innerHTML = (art ? FOUR.ROLES.map(r => `<div class="b mv" data-r="${r}" style="left:${GPOS[r][0]}px;top:${GPOS[r][1]}px"><i style="border-color:${FOUR.COL[r]}aa">${FOUR.ICON[r]}<small>${S.b[r]}</small></i></div>`).join('') : '')
      + `<div class="b go"><i>⚔<small>Attack</small></i></div>`;
    gp.classList.remove('hide');
    const on = (el, fn) => el.addEventListener('pointerdown', e => { e.preventDefault(); e.stopPropagation(); if (!cur) return; audioUnlock && audioUnlock(); fn(el); });
    on(gp.querySelector('.go'), el => { feel(el, '#ff9a7a'); const t = (cur.a.lastTarget && !cur.a.lastTarget.ko && cur.a.lastTarget) || null;
      if (Battle.alive('e').length === 1 || t) { const tt = t || Battle.alive('e')[0]; go(c => Battle.doAttack(c.a, tt).then(c.done)); }
      else { const c = cur; hide(); if (typeof AT !== 'undefined') { AT.fold(); AT.btn.classList.add('hide'); } Battle.closeMenu(); Battle.pickTarget(c.a, tt => Battle.doAttack(c.a, tt).then(c.done)); } });
    gp.querySelectorAll('[data-r]').forEach(b => on(b, el => { feel(el, FOUR.COL[el.dataset.r]); const t = (cur.a.lastTarget && !cur.a.lastTarget.ko && cur.a.lastTarget) || Battle.alive('e')[0]; if (!t) return;
      go(c => FOUR.run(c.a, t, [el.dataset.r]).then(res => res === 'cancel' ? c.reopen() : c.done())); }));
  }
  const chip = document.createElement('div'); chip.id = 'atkHint'; chip.className = 'hide'; document.body.append(chip);
  let cur = null, g = null, turns = 0;
  const hasArt = a => a && ((a.isMe && !G.S.kid && G.S.f.vaneDone) || (!a.isMe && ['liora', 'kess', 'oren'].includes(a.id)));
  function show(a, done, reopen) {
    cur = { a, done, reopen }; turns++;
    chip.innerHTML = `<b>${a.name}</b> · tap ⚔ or an enemy to attack${hasArt(a) ? ' · swipe or tap a move to combo' : ''} · ◉ menu`;
    chip.classList.toggle('hide', turns > 6 && !(G.settings && G.settings.hints));
    pad(a);
  }
  function hide() { chip.classList.add('hide'); gp.classList.add('hide'); cur = null; }
  const enemyAt = (cx, cy) => { const B = Battle.B; if (!B) return null; const x = cx / innerWidth * G.view.w, y = cy / innerHeight * (G.view.fullH || G.view.h);
    let best = null, bd = 90; for (const e of Battle.alive('e')) { const d = Math.hypot(e.x - x, e.y - 30 * (e.size || 1) - y); if (d < bd) { bd = d; best = e; } } return best; };
  const go = fn => { const c = cur; hide(); if (typeof AT !== 'undefined') { AT.fold(); AT.btn.classList.add('hide'); } Battle.closeMenu(); fn(c); };
  cv.addEventListener('pointerdown', e => { if (!cur || G.mode !== 'battle' || (Battle.B && Battle.B.targeting)) return; g = { x: e.clientX, y: e.clientY }; }, true);
  cv.addEventListener('pointerup', e => {
    if (!cur || !g) return; const dx = e.clientX - g.x, dy = e.clientY - g.y, d = Math.hypot(dx, dy), x0 = g.x, y0 = g.y; g = null;
    if (d < 26) { const t = enemyAt(x0, y0); if (!t) return; sfx('blip'); go(c => Battle.doAttack(c.a, t).then(c.done)); return; }
    if (!hasArt(cur.a)) return;
    const r = Math.abs(dy) > Math.abs(dx) ? (dy < 0 ? 'L' : 'S') : (dx < 0 ? 'P' : 'W');
    const t = (cur.a.lastTarget && !cur.a.lastTarget.ko && cur.a.lastTarget) || Battle.alive('e')[0]; if (!t) return;
    go(c => FOUR.run(c.a, t, [r]).then(res => res === 'cancel' ? c.reopen() : c.done()));
  });
  if (typeof CombatX !== 'undefined') {
    const _m = CombatX.menu.bind(CombatX);
    CombatX.menu = function (a, L, done, resolve, reopen) {
      _m(a, L, done, resolve, reopen);
      for (let i = L.length - 1; i >= 0; i--) if (/^(Attack|Four (Cuts|Lines|Strikes|Shadows))$/.test(L[i][0])) L.splice(i, 1);
      try { show(a, () => { hide(); done(); }, reopen); } catch (e) { console.warn(e); }
    };
  }
  // remember who you last hit, so a swipe combo goes at the same enemy
  const _da = Battle.doAttack.bind(Battle);
  Battle.doAttack = function (a, t) { if (a) a.lastTarget = t; return _da(a, t); };
  const _cm = Battle.closeMenu.bind(Battle);
  Battle.closeMenu = function () { const r = _cm(); hide(); return r; };
  // test hook: the automated tester attacks the first enemy
  window.__padAttack = () => { if (!cur) return false; const t = Battle.alive('e')[0]; if (!t) return false; go(c => Battle.doAttack(c.a, t).then(c.done)); return true; };
  setInterval(() => { if (!Battle.B && cur) hide(); }, 500);
})();
