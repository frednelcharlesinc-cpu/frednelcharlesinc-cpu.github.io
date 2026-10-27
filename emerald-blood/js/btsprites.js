'use strict';
/* Detailed battle sprites (Craftpix "Shinobi" pack — free licence, craftpix.net/file-licenses):
   Ren fights as the Samurai, Kairo as the Shinobi, Dace as the Fighter. Sheets are laid out like the LPC battle rows,
   so every effect (afterimages, tints, Scar Bloom) works on them; an extra row holds a full 6-frame idle loop. */
const BTS = {
  img: {},
  load(k) { if (!this.img[k]) this.img[k] = loadImg('assets/bt/' + k + '.png', true).then(i => { i.__idle6 = 1; this.img[k] = i; return i; }).catch(() => (this.img[k] = null)); return this.img[k]; },
  ready(k) { const v = this.img[k]; return v && !(v instanceof Promise) ? v : null; },
  kind(a) {
    if (a.isMe) return G.S && !G.S.kid && !(G.settings && G.settings.classicBattle) ? 'samurai' : null;
    if (G.settings && G.settings.classicBattle) return null;
    const k = String(a.key || a.id || '');
    if (/^kairo(?!_spar|_kid)/.test(k)) return 'shinobi';
    if (/dace/.test(k)) return 'fighter';
    return null;
  }
};
['samurai_L', 'samurai_R', 'shinobi_L', 'shinobi_R', 'fighter_L', 'fighter_R'].forEach(k => setTimeout(() => BTS.load(k), 1500));
(function () {
  const assign = function (B) {
    try {
      if (B && !B.btsAll) {
        let all = 1;
        for (const a of B.actors) {
          if (a.btsDone) continue;
          const k = BTS.kind(a); if (!k) { a.btsDone = 1; continue; }
          const img = BTS.ready(k + (a.side === 'e' ? '_R' : '_L')); if (!img) { all = 0; BTS.load(k + (a.side === 'e' ? '_R' : '_L')); continue; }
          if (a.isMe) B.renBts = img; else a.img = img; a.btsDone = 1;
        }
        if (all && B.actors.every(a => a.btsDone)) B.btsAll = 1;
      }
    } catch (e) { }
  };
  const _ui = Battle.ui.bind(Battle);
  Battle.ui = function (on) { if (on) assign(this.B); return _ui(on); };
  const _hud = Battle.hud.bind(Battle);
  Battle.hud = function () { assign(this.B); return _hud(); };
  const _pi = playerImg;
  playerImg = function () { const B = Battle.B; if (G.mode === 'battle' && B && B.renBts && !G.S.kid) return B.renBts; return _pi(); };
  const _d = drawBT;
  drawBT = function (c, img, anim, f, x, y, s) {
    if (img && img.__idle6 && anim === 'combat') { s = s || 1; const fr = Math.floor(performance.now() / 125) % 6; c.drawImage(img, fr * 128, 2048, 128, 128, Math.round(x - 64 * s), Math.round(y - 92 * s), 128 * s, 128 * s); return; }
    return _d(c, img, anim, f, x, y, s);
  };
})();
