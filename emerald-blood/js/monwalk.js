'use strict';
/* MONSTER WALKS (Chat C, 2026-11-16) — monsters and bosses in the world move like what they are:
   · BIPEDS (goblins, orcs, trolls, skeletons…) play their own walk cycle; if the art has none, the step trick.
   · QUADRUPEDS (wolves, boars, drakes, spiders…) play their 4-leg gait cycle with a low, level body roll — never the
     two-leg step trick, which squashed their back half.
   · FLIERS (wyrms, bats, imps, wyverns…) hover above their shadow, bob on each wingbeat and tilt into the flight.
   · Front / back: most monster art is side-on only. Walking up or down keeps the side pose but turns the body toward the
     camera (grows a touch) or away (shrinks a touch, darker) so it reads as forward / backward. A set cut from a
     4-direction MOVEMENT sheet (meta.cycle) uses its real front and back frames instead.
   · Roaming monsters (worldplus2.js) carry no sprite name, so they used to fall back to their old low-res art:
     HD.npcName now names them by their lead enemy's sprite. */
(function () {
  if (typeof Ent === 'undefined' || typeof HD === 'undefined') return;
  const QUAD = /^(lupine|lupine_alpha|rime_lupine|rime_alpha|m_tusker|m_drake|reef_drake|sw_gator|sw_spider|m_spider|m_wolf|m_bear|sw_rat|m_hound|b_.*(wolf|fang|tusk|alpha|hound|boar|drake|mother))/;
  const FLY = /^(mana_wyrm|m_bat|sw_bat|m_imp|m_wyvern|b_.*(wyvern|wyrm|wing|bat|smoulder)|m_wraith|m_ghost|m_harpy|reef_ray|m_wisp)/;
  const kind = set => { const b = String(set || '').replace(/^c_/, ''); const M = HD.meta && HD.meta[set];
    if (M && M.body) return M.body; return FLY.test(b) ? 'fly' : QUAD.test(b) ? 'quad' : 'biped'; };
  const roamSet = e => { try { const k = e.roam && e.roam.enc && e.roam.enc.enemies && e.roam.enc.enemies[0], E = k && ENEMY[k]; return E ? (E.img || k) : ''; } catch (x) { return ''; } };
  const _nn = HD.npcName.bind(HD);
  HD.npcName = function (e) { const n = _nn(e); if (e && e.roam && (!n || /^roam/.test(n))) return roamSet(e) || n; return n; };

  const MONSTER = set => { const b = String(set).replace(/^c_/, ''); return /^(m_|b_|sw_|reef_|lupine|rime_|mana_)/.test(b) || (typeof ENEMY !== 'undefined' && ENEMY[b] && !ENEMY[b].human); };
  const _draw = Ent.prototype.draw;
  Ent.prototype.draw = function (c, cx, cy, t) {
    if (this.isPlayer || !HD.on() || !HD.OW || (G.S && G.S.kid)) return _draw.call(this, c, cx, cy, t);
    const set = HD.setOf(HD.npcName(this)); if (!set || !HD.img[set] || !MONSTER(set)) return _draw.call(this, c, cx, cy, t);
    const img = HD.sheet(set, false); if (!img) return _draw.call(this, c, cx, cy, t);
    const M = img.__hd, A = M.anims, body = kind(set), now = performance.now();
    if (this.dir === 'left' || this.dir === 'right') this.face = this.dir;
    const side = this.dir === 'left' || this.dir === 'right', up = this.dir === 'up', moving = !!this.move;
    const run = moving && this.move.ms < 260;
    // which frames
    let L;
    if (M.cycle && moving) L = A['ow_' + (side ? 'side' : up ? 'up' : 'down') + (run ? '_run' : '_walk')] || A['ow_' + (side ? 'side' : up ? 'up' : 'down') + '_walk'];
    if (!L && moving) L = (A.ow_side_walk && A.ow_side_walk.length > 1 ? A.ow_side_walk : A.walk || A.run);
    if (!L) L = (M.cycle && !side ? (up ? A.ow_up : A.ow_down) : null) || A.ow_side || A.ow_down || A.idle || A.combat;
    if (!L || !L.length) return _draw.call(this, c, cx, cy, t);
    const T = moving ? (this.walkT || 0) : now, per = moving ? (run ? 90 : 140) * (body === 'quad' ? .85 : 1) : 420;
    const fr = M.frames[L[Math.floor(T / per) % L.length]]; if (!fr) return _draw.call(this, c, cx, cy, t);
    const x = this.px - cx, y = this.py - cy + 3, h = HD.OW_H * (this.size || 1) * (body === 'quad' ? 1.05 : 1), k = h / fr[6];
    if (x < -90 || y < -20 || x > G.view.w + 90 || y > G.view.h + 140) return;
    // facing: side art faces right; up/down keep the last horizontal facing
    const want = this.face || 'left', flip = want !== 'right';
    // forward / backward cue for side-only art
    const depth = M.cycle || side || !moving ? 1 : up ? .96 : 1.03;
    /* turned toward / away from the camera: a side-only sprite is foreshortened (narrower, a slight
       three-quarter turn that sways with each step), so walking up/down reads as front / back */
    const turn = !M.cycle && moving && !side, sway = turn ? Math.sin((this.walkT || 0) / 140 * Math.PI) * .06 : 0;
    // motion per body type
    const ph = T / per * Math.PI;
    let lift = 0, rot = 0, sx = 1, sy = 1;
    if (body === 'fly') { lift = 14 + Math.sin(now / 260) * 3 + (moving ? Math.sin(ph * 2) * 2.5 : 0); sy = 1 + Math.sin(ph * 2) * .035; rot = moving && side ? .1 : 0; }
    else if (body === 'quad') { lift = moving ? Math.abs(Math.sin(ph)) * 1.2 : 0; rot = moving ? Math.sin(ph) * .025 : 0; }
    else { lift = moving ? Math.abs(Math.sin(ph)) * 1.6 : Math.sin(now / 500) * .3; }
    // shadow stays on the ground (smaller and fainter for fliers)
    const sw = (body === 'quad' ? 17 : body === 'fly' ? 11 : 12) * (this.size || 1) * depth, sa = body === 'fly' ? .16 : .26;
    c.fillStyle = `rgba(0,0,0,${sa})`; c.beginPath(); c.ellipse(x, y - 1, sw * (body === 'fly' ? 1 - Math.sin(now / 260) * .08 : 1), sw * .32, 0, 0, 7); c.fill();
    c.save(); if (this.alpha != null) c.globalAlpha = this.alpha;
    c.translate(x, y - lift); if (flip) c.scale(-1, 1); if (rot) c.rotate(rot);
    c.scale(depth * sx * (turn ? (body === 'quad' ? .55 : .7) + sway : 1), depth * sy);
    if (up && moving && !M.cycle) c.filter = 'brightness(.88)';
    HD.dI(c, img, fr[0], fr[1], fr[2], fr[3], -fr[4] * k, -fr[5] * k, fr[2] * k, fr[3] * k);
    c.restore();
  };
})();
