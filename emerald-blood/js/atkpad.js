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
  const chip = document.createElement('div'); chip.id = 'atkHint'; chip.className = 'hide'; document.body.append(chip);
  let cur = null, g = null, turns = 0;
  const hasArt = a => a && ((a.isMe && !G.S.kid && G.S.f.vaneDone) || (!a.isMe && ['liora', 'kess', 'oren'].includes(a.id)));
  function show(a, done, reopen) {
    cur = { a, done, reopen }; turns++;
    chip.innerHTML = `<b>${a.name}</b> · tap an enemy to attack${hasArt(a) ? ' · swipe to combo' : ''} · ◉ menu`;
    chip.classList.toggle('hide', turns > 6 && !(G.settings && G.settings.hints));
  }
  function hide() { chip.classList.add('hide'); cur = null; }
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
