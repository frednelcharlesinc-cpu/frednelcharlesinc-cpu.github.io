/* DIFFICULTY SCALE (owner, 2026-11-17; built by Chat C on the owner's go-ahead, 2026-11-18):
   the higher an opponent's rank, the more of their attacks can't be parried - you have to DODGE them.
   B ~25%, A ~45%, S ~65%, SS and up ~80% of their attacks become red (unparryable) blows.
   Uses the game's own red-blow rules (h.unp): a red ring, no parry, a dodge still works, eating one hurts more.
   Never in the tutorial, never on counters. Off switch: G.settings.unguardOff */
(function () {
  if (typeof Battle === 'undefined') return;
  const SHARE = [0, 0, 0, .25, .45, .65, .8, .8, .8];
  const _es = Battle.enemyStrike.bind(Battle);
  Battle.enemyStrike = async function (e, t, sk, isCounter) {
    try {
      const B = this.B;
      if (!isCounter && e && e.side === 'e' && sk && sk.hits && !sk.hits.some(h => h.unp) && !B.tutorial && !(G.settings && G.settings.unguardOff)) {
        const r = this.rankOf(e), p = SHARE[r] || 0;
        if (p && Math.random() < p) {
          sk = Object.assign({}, sk, { hits: sk.hits.map(h => Object.assign({}, h, { unp: 1 })) });
          // the tell: the attacker's whole body flashes red for a beat before the blow
          e.__redT = performance.now(); B.shake = Math.max(B.shake || 0, 3);
          for (let i = 0; i < 14; i++) { const an = i / 14 * 6.28; B.fx.push({ x: e.x, y: e.y - 40, vx: Math.cos(an) * 3, vy: Math.sin(an) * 3, life: 380, t: 0, col: '#ff4a4a', s: 3 }); }
        }
      }
    } catch (er) { }
    return _es(e, t, sk, isCounter);
  };
  // red flash over the attacker (uses the silhouette masks from spritepolish)
  if (typeof HD !== 'undefined') {
    const _blit = HD.blit.bind(HD); let RED = 0, RX = 0;
    const _bt = HD.bt.bind(HD);
    HD.bt = function (c, img, anim, f, x, y, s) {
      try { const B = Battle.B; if (B) for (const a of B.actors) if (a.__redT && Math.abs(a.x - x) < 1.5 && Math.abs(a.y - y) < 1.5) { const dt = performance.now() - a.__redT; if (dt < 700) RX = x, RED = .9 * (1 - dt / 700) * (.6 + .4 * Math.sin(dt / 40)); else a.__redT = 0; break; } } catch (er) { }
      try { return _bt(c, img, anim, f, x, y, s); } finally { RED = 0; }
    };
    HD.blit = function (c, img, fr, x, y, h, extra) {
      const r = _blit(c, img, fr, x, y, h, extra);
      if (RED > 0 && fr && window.SPolish && Math.abs(x - RX) < 1.5) { const al = RED; RED = 0; try {
        const k = h / fr[6]; for (const kind of ['fill:', 'glow:']) { const cv = window.SPolish.mask(img, fr[0], fr[1], fr[2], fr[3], kind + '#ff3030'), p = cv.__pad || 0;
          c.save(); c.globalCompositeOperation = 'lighter'; c.globalAlpha *= kind === 'fill:' ? al * .55 : al; c.imageSmoothingEnabled = true; c.translate(x, y);
          if (extra && extra.rot) c.rotate(extra.rot); if (extra && extra.sy) c.scale(1, extra.sy);
          c.drawImage(cv, -fr[4] * k - p * k, -fr[5] * k - p * k, cv.width * k, cv.height * k); c.restore(); }
      } catch (er) { } }
      return r;
    };
  }
})();
