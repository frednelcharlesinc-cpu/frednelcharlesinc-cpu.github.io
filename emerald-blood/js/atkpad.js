'use strict';
/* ATTACK PAD — the attack lives on the battle screen, not in the menu.
   On your turn a pad sits in the bottom-right: ATTACK in the middle (one press = your standard strikes),
   with the four moves of your art around it (Rise / Fall / Wind / Needle for swords, the spear/knife/fist versions for allies).
   Tapping a move starts a combo with that move already in: time slows and the combo panel opens.
   Everything else (Arts, Guard, Items…) stays in the floating menu button. Attack and Four Cuts are gone from that menu. */
(function () {
  if (typeof Battle === 'undefined' || typeof FOUR === 'undefined') return;
  const css = document.createElement('style');
  css.textContent = `
  #atkPad{position:fixed;z-index:57;width:176px;height:176px;right:calc(max(10px,env(safe-area-inset-right)) + 52px);bottom:max(8px,env(safe-area-inset-bottom));touch-action:none;font-family:Nunito,system-ui}
  #atkPad.hide{display:none}
  #atkPad button{position:absolute;border-radius:50%;border:3px solid #000;color:#fff;display:flex;flex-direction:column;align-items:center;justify-content:center;text-shadow:0 1px 2px #000;box-shadow:0 4px 0 #000,0 0 10px rgba(0,0,0,.5);padding:0}
  #atkPad button span{font:800 9.5px Nunito,system-ui;margin-top:1px}
  #atkPad button.press{transform:scale(.9)}
  #atkPad .mv{width:54px;height:54px;font-size:17px}
  #atkPad .go{width:70px;height:70px;left:53px;top:53px;font-size:22px;background:radial-gradient(circle at 40% 32%,#ff7a5a,#6a1a10 85%)}
  #atkPad button:disabled{opacity:.35;filter:grayscale(.8)}`;
  document.head.append(css);
  const pad = document.createElement('div'); pad.id = 'atkPad'; pad.className = 'hide'; document.body.append(pad);
  const POS = { L: [61, 0], W: [0, 61], P: [122, 61], S: [61, 122] };
  let cur = null;
  const hasArt = a => a && ((a.isMe && !G.S.kid && G.S.f.vaneDone) || (!a.isMe && ['liora', 'kess', 'oren'].includes(a.id)));
  function show(a, done, reopen) {
    cur = { a, done, reopen };
    const art = hasArt(a), S = FOUR.STYLE[FOUR.styleOf(a)];
    pad.innerHTML = (art ? FOUR.ROLES.map(r => `<button class="mv" data-r="${r}" style="left:${POS[r][0]}px;top:${POS[r][1]}px;background:radial-gradient(circle at 40% 32%,${FOUR.COL[r]},#0d2418 85%)">${FOUR.ICON[r]}<span>${S.b[r]}</span></button>`).join('') : '')
      + `<button class="go">⚔<span>Attack</span></button>`;
    pad.classList.remove('hide');
    const hit = fn => { const B = Battle.B; if (!B || !cur) return; const c = cur; hide(); sfx('blip');
      if (typeof AT !== 'undefined') AT.fold(), AT.btn.classList.add('hide');
      Battle.closeMenu(); Battle.pickTarget(c.a, t => fn(c, t)); };
    bindTap(pad.querySelector('.go'), () => hit((c, t) => Battle.doAttack(c.a, t).then(c.done)));
    pad.querySelectorAll('[data-r]').forEach(b => bindTap(b, () => hit((c, t) => FOUR.run(c.a, t, [b.dataset.r]).then(r => r === 'cancel' ? c.reopen() : c.done()))));
  }
  function hide() { pad.classList.add('hide'); cur = null; }
  if (typeof CombatX !== 'undefined') {
    const _m = CombatX.menu.bind(CombatX);
    CombatX.menu = function (a, L, done, resolve, reopen) {
      _m(a, L, done, resolve, reopen);
      for (let i = L.length - 1; i >= 0; i--) if (/^(Attack|Four (Cuts|Lines|Strikes|Shadows))$/.test(L[i][0])) L.splice(i, 1);
      try { show(a, () => { hide(); done(); }, reopen); } catch (e) { console.warn(e); }
    };
  }
  const _cm = Battle.closeMenu.bind(Battle);
  Battle.closeMenu = function () { const r = _cm(); if (!(Battle.B && Battle.B.targeting)) hide(); return r; };
  // the pad goes away once you pick from the menu, a target is chosen, or the battle ends
  const _ct = Battle.confirmTarget.bind(Battle);
  Battle.confirmTarget = function () { hide(); return _ct(); };
  setInterval(() => { if (!Battle.B && !pad.classList.contains('hide')) hide(); }, 500);
})();
