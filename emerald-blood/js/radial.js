'use strict';
/* BATTLE TOUCH BUTTON — like the phone's floating assistive button.
   No command bar: the battlefield has the whole screen. On your turn a small floating button glows at the edge
   (drag it anywhere; it snaps to the nearest side and remembers the spot). Tap it and a rounded panel opens with the
   battle options as icons. Options with more inside open a new page in the same panel; BACK sits in the middle.
   Tap outside the panel to fold it away again. The Four Cuts use the same panel: the four moves around DRAW. */
const AT = {
  open: false,
  css: `
  body.at #bcmd{position:fixed!important;left:50%!important;top:50%!important;right:auto!important;bottom:auto!important;transform:translate(-50%,-50%)!important;width:min(300px,92vw)!important;height:auto!important;
    z-index:60;pointer-events:auto!important;display:block!important;padding:10px 10px 12px;border-radius:26px;background:rgba(14,22,18,.86)!important;-webkit-backdrop-filter:blur(10px);backdrop-filter:blur(10px);
    border:1px solid rgba(255,255,255,.14)!important;box-shadow:0 12px 40px rgba(0,0,0,.6)!important}
  body.at #bcmd.hide,body.at #bcmd.fold{display:none!important}
  body.at #cmdBox{position:static!important;height:auto!important;background:none!important;border:0!important;box-shadow:none!important;padding:0!important;display:block!important}
  body.at #cmdBox::after,body.at #cmdBox::before{display:none!important}
  body.at #cmdTip{display:block!important;position:static!important;height:auto!important;margin:0 0 8px!important;padding:0 4px!important;font-size:11.5px!important;line-height:1.3!important;color:#cfe3d6!important;text-align:center;white-space:normal!important;border:0!important;background:none!important;min-height:30px}
  body.at #cmdTipT{white-space:normal!important}
  body.at #cmdCost{display:none!important}
  body.at #cmdList{display:grid!important;grid-template-columns:repeat(3,1fr)!important;grid-auto-flow:row!important;grid-template-rows:none!important;gap:8px 6px!important;overflow:visible!important;padding:0!important;min-width:0!important}
  body.at #cmdList button{position:relative!important;height:auto!important;min-width:0!important;padding:0!important;display:flex!important;flex-direction:column;align-items:center;gap:4px;background:none!important;border:0!important;box-shadow:none!important;color:#fff!important}
  body.at #cmdList button .ic{width:52px!important;height:52px!important;border-radius:50%!important;font-size:21px!important;background:radial-gradient(circle at 40% 32%,var(--cc,#2c6a47),#0c1c13 85%)!important;border:2px solid rgba(255,255,255,.18);box-shadow:0 3px 8px rgba(0,0,0,.5)!important}
  body.at #cmdList button .lb{font:700 11px/1.15 Nunito,system-ui!important;color:#fff;text-align:center;max-width:88px;white-space:normal!important;flex:none!important}
  body.at #cmdList button small{position:absolute;top:-4px;left:calc(50% + 12px);padding:1px 4px;border-radius:8px;background:#0b2a4a;border:1px solid #5fb8ff;font-size:9px!important;color:#cfe8ff!important;margin:0!important}
  body.at #cmdList button.sel .ic{box-shadow:0 0 0 2px #fff,0 0 14px var(--cc,#46ff95)!important}
  body.at #cmdList button.sel:before{content:none!important}
  body.at #cmdList button:disabled{opacity:.35;filter:grayscale(.7)}
  body.at #cmdList button.press .ic{transform:scale(.9)}
  body.at #bstrip{display:none!important}
  body.at #timeline{bottom:8px!important}
  #atBtn{position:fixed;z-index:59;width:58px;height:58px;border-radius:16px;background:rgba(20,26,23,.62);-webkit-backdrop-filter:blur(6px);backdrop-filter:blur(6px);box-shadow:0 4px 14px rgba(0,0,0,.5);touch-action:none;display:flex;align-items:center;justify-content:center}
  #atBtn i{display:block;width:40px;height:40px;border-radius:50%;background:rgba(255,255,255,.22);box-shadow:inset 0 0 0 6px rgba(255,255,255,.14)}
  #atBtn i:after{content:'';display:block;width:22px;height:22px;margin:9px;border-radius:50%;background:rgba(255,255,255,.9)}
  #atBtn.turn{animation:atPulse 1.3s infinite}
  #atBtn.turn i:after{background:#7dffb0}
  @keyframes atPulse{0%,100%{box-shadow:0 4px 14px rgba(0,0,0,.5),0 0 0 0 rgba(125,255,176,.55)}50%{box-shadow:0 4px 14px rgba(0,0,0,.5),0 0 0 8px rgba(125,255,176,0)}}
  #atBtn.hide,#atShade.hide{display:none}
  #atShade{position:fixed;inset:0;z-index:58;background:rgba(0,0,0,.18)}
  .atPanel{position:fixed;left:50%;top:50%;transform:translate(-50%,-50%);width:min(300px,92vw);z-index:73;padding:10px 10px 12px;border-radius:26px;background:rgba(14,22,18,.88);-webkit-backdrop-filter:blur(10px);backdrop-filter:blur(10px);border:1px solid rgba(255,255,255,.14);box-shadow:0 12px 40px rgba(0,0,0,.6);font-family:Nunito,system-ui;touch-action:none}
  .atPanel .g{display:grid;grid-template-columns:repeat(3,1fr);gap:8px 6px}
  .atPanel .t{display:flex;flex-direction:column;align-items:center;gap:4px;background:none;border:0;color:#fff;font:700 11px Nunito,system-ui;padding:0}
  .atPanel .t b{width:52px;height:52px;border-radius:50%;display:flex;align-items:center;justify-content:center;font-size:20px;border:2px solid rgba(255,255,255,.18);box-shadow:0 3px 8px rgba(0,0,0,.5)}
  .atPanel .t.press b{transform:scale(.9)}`,
  pos() { try { return JSON.parse(localStorage.getItem('eb_atpos')) || null; } catch (e) { return null; } },
  savePos(p) { try { localStorage.setItem('eb_atpos', JSON.stringify(p)); } catch (e) { } },
  place(p) { const b = this.btn, H = innerHeight; p = p || this.pos() || { side: 'l', y: .8 };
    b.style.top = Math.max(8, Math.min(H - 66, p.y * H - 29)) + 'px';
    if (p.side === 'r') { b.style.left = ''; b.style.right = 'calc(max(10px,env(safe-area-inset-right)) + 48px)'; } else { b.style.right = ''; b.style.left = 'max(10px,env(safe-area-inset-left))'; } },
  fold() { this.open = false; $('#bcmd').classList.add('fold'); this.shade.classList.add('hide'); if (Battle.menuL) this.btn.classList.remove('hide'); },
  unfold() { this.open = true; $('#bcmd').classList.remove('fold'); this.shade.classList.remove('hide'); this.btn.classList.add('hide'); }
};
(function () {
  if (typeof Battle === 'undefined') return;
  const st = document.createElement('style'); st.textContent = AT.css; document.head.append(st);
  document.body.classList.add('at');
  const _sv = setView;
  setView = function (mode) { _sv(mode); if (mode === 'battle') G.view.h = G.view.fullH; };
  if (G.mode === 'battle') setView('battle');

  const btn = AT.btn = document.createElement('div'); btn.id = 'atBtn'; btn.className = 'hide'; btn.innerHTML = '<i></i>';
  const shade = AT.shade = document.createElement('div'); shade.id = 'atShade'; shade.className = 'hide';
  document.body.append(shade, btn); AT.place();
  // drag to move, tap to open
  let d = null;
  btn.addEventListener('pointerdown', e => { e.preventDefault(); try { btn.setPointerCapture(e.pointerId); } catch (x) { } d = { x: e.clientX, y: e.clientY, moved: false }; });
  btn.addEventListener('pointermove', e => { if (!d) return; if (Math.abs(e.clientX - d.x) + Math.abs(e.clientY - d.y) > 8) d.moved = true;
    if (d.moved) { btn.style.right = ''; btn.style.left = (e.clientX - 29) + 'px'; btn.style.top = (e.clientY - 29) + 'px'; } });
  btn.addEventListener('pointerup', e => { if (!d) return; const moved = d.moved; d = null;
    if (moved) { const p = { side: e.clientX > innerWidth / 2 ? 'r' : 'l', y: e.clientY / innerHeight }; AT.savePos(p); AT.place(p); return; }
    sfx('blip'); AT.unfold(); });
  shade.addEventListener('pointerdown', e => { e.preventDefault(); AT.fold(); });
  addEventListener('resize', () => AT.place());

  // more than nine options: the everyday ones stay, the rest go behind MORE
  const MAIN = /^(Attack|Four |Drag Arts|Skills|Link Art|Transform|Ascended|Phantom|Guard|Items|Eleventh Step|Stone Skills)/;
  const _om = Battle.openMenu.bind(Battle);
  Battle.openMenu = function (L, showCost) {
    const fresh = !Battle.menuL;
    try {
      if (!L.some(x => x[0] === '◀ Back') && L.length > 9) {
        const keep = [], rest = [];
        for (const it of L) (MAIN.test(it[0]) && keep.length < 8 ? keep : rest).push(it);
        if (rest.length) { const main = keep.concat([['More', rest.map(x => x[0]).join(' · '), () => Battle.openMenu(rest.concat([['◀ Back', 'Return.', () => Battle.openMenu(main, showCost)]]), false)]]); L = main; }
      }
    } catch (e) { console.warn(e); }
    const r = _om(L, showCost);
    try {
      // BACK goes in the middle of the grid, like the phone's
      const list = $('#cmdList'), bs = [...list.children], bi = L.findIndex(x => x[0] === '◀ Back');
      if (bi >= 0 && bs.length > 4) { const others = bs.filter((_, i) => i !== bi); list.insertBefore(bs[bi], others[4] || null); }
      btn.classList.add('turn');
      if (fresh) AT.fold(); else AT.unfold();
    } catch (e) { console.warn(e); }
    return r;
  };
  const _cm = Battle.closeMenu.bind(Battle);
  Battle.closeMenu = function () { const r = _cm(); AT.open = false; shade.classList.add('hide'); btn.classList.add('hide'); btn.classList.remove('turn'); $('#bcmd').classList.remove('fold'); return r; };
  // short labels on the icons; the full description shows at the top of the panel
  const _ci = typeof cmdIcon === 'function' ? cmdIcon : null;
  if (_ci) cmdIcon = function (label) { if (label === 'More') return ['⋯', '#4a5a6a', 'More']; const r = _ci(label); const s = String(r[2] || label).replace(/\s*[×x]\d+.*$/, '').replace(/^Stance: /, ''); return [r[0], r[1], s.length > 18 ? s.slice(0, 17) + '…' : s]; };
})();
