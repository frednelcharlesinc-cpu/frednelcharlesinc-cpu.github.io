'use strict';
/* ARRIVAL SCENES — walking into a town from the road shows the whole town for a moment (day or night picture), with its name.
   Tap to skip. Plays once per visit from outside, not when leaving a house. */
const ARRIVE = { ashford: ['Ashford Hollow', 'Market town of the eastern vale', 'assets/cutscenes/ashford_day.webp', 'assets/cutscenes/ashford_night.webp'] };
(function () {
  const _l = World.load.bind(World);
  World.load = async function (name, x, y, dir) {
    const prev = G.S && G.S.map, A = ARRIVE[name];
    const show = A && prev && prev !== name && !(SCENES[prev] && SCENES[prev].map && G.maps[SCENES[prev].map] && G.maps[SCENES[prev].map].interior) && !G.S.kid && G.mode === 'world';
    const r = await _l(name, x, y, dir);
    if (show) {
      const night = typeof Ambient !== 'undefined' && Ambient.night > .5;
      const img = await loadImg(A[night ? 3 : 2]).catch(() => null);
      if (img) await new Promise(res => {
        const ov = document.createElement('div');
        ov.style.cssText = 'position:fixed;inset:0;z-index:79;background:#000 center/cover no-repeat;opacity:0;transition:opacity .5s;display:flex;align-items:flex-end;justify-content:center;font-family:Nunito,system-ui';
        ov.style.backgroundImage = `url(${img.src})`;
        ov.innerHTML = `<div style="margin-bottom:max(18px,env(safe-area-inset-bottom));text-align:center;padding:8px 22px;border-radius:16px;background:rgba(6,10,8,.55);color:#fff;text-shadow:0 2px 4px #000"><div style="font:900 26px Nunito,system-ui;letter-spacing:1px">${A[0]}</div><div style="font:700 13px Nunito,system-ui;color:#d8e8d0">${A[1]}</div></div>`;
        document.body.append(ov); requestAnimationFrame(() => { ov.style.opacity = 1; });
        let done = false; const end = () => { if (done) return; done = true; ov.style.opacity = 0; setTimeout(() => { ov.remove(); res(); }, 500); };
        ov.addEventListener('pointerdown', end); setTimeout(end, 2800);
      });
    }
    return r;
  };
})();
