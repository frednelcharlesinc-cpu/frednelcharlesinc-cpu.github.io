'use strict';
/* ================= MONSTER MOBS: your art's extra moves =================
   - Desperate stand: below 30% HP a monster drops into its wounded, enraged pose and hits 15% harder.
   - Projectiles: monsters whose sheet has a drawn projectile (ash glob, howl rings, flaming skull, war-bellow,
     knife, hex skull, filth, seeds, hatchet, spear) throw THAT image instead of a plain dot.
   - Every monster with a ranged pose gets a ranged attack that uses it. */
(function () {
  if (typeof Battle === 'undefined' || typeof HD === 'undefined') return;
  const RANGED = {   // key: [move name, projectile kind (an image from the sheet when it has one), damage]
    lupine: ['Ash Spit', 'img', .85], lupine_alpha: ['Shock Howl', 'img', .9], rime_lupine: ['Frost Breath', 'ice', .9], rime_alpha: ['Ice Spike', 'ice', 1],
    m_tusker: ['Boulder Kick', 'stone', 1], mana_wyrm: ['Mana Bolt', 'mana', .9], m_skeleton: ['Skull Toss', 'img', .9], m_wartotaur: ['War Bellow', 'img', 1.1],
    m_vampire: ['Blood Bats', 'shadow', 1], m_goblin: ['Knife Toss', 'img', .8], m_goblin_shaman: ['Hex Skull', 'img', 1], m_ratfolk: ['Filth Fling', 'img', .7],
    m_gourd: ['Seed Spit', 'img', .8], m_orc: ['Hatchet Throw', 'img', 1], m_lizard: ['Spear Throw', 'img', 1]
  };
  const projOf = key => { const M = HD.meta && HD.meta['c_' + key]; return M && M.proj ? 'img:c_' + key : null; };
  // projectile images become their own PROJ kinds
  const _pp = paintProj;
  paintProj = function (c, kind, x, y, ang, now, sc) {
    if (typeof kind === 'string' && kind.startsWith('img:')) {
      const set = kind.slice(4), M = HD.meta && HD.meta[set], im = HD.img[set];
      if (M && M.proj && im) {
        const [px, py, pw, ph] = M.proj, ref = M.frames[0][6], k = HD.BT_H * (typeof BT_SCALE !== 'undefined' ? BT_SCALE : 1) / ref * (sc || 1);
        c.save(); c.translate(x, y); if (Math.cos(ang) < 0) { c.scale(-1, 1); c.rotate(Math.PI - ang); } else c.rotate(ang);
        c.drawImage(im, px, py, pw, ph, -pw * k / 2, -ph * k / 2, pw * k, ph * k); c.restore(); return;
      }
      kind = 'stone';
    }
    return _pp(c, kind, x, y, ang, now, sc);
  };
  // add the ranged move to each monster (once), and point existing spell hits at the drawn projectile
  let wired = 0;
  const wire = () => {
    if (wired || !HD.meta) return; wired = 1;
    for (const [key, [name, kind, m]] of Object.entries(RANGED)) {
      const E = ENEMY[key]; if (!E || !E.skills) continue;
      const pk = kind === 'img' ? projOf(key) : kind; if (!pk) continue;
      if (pk.startsWith('img:')) PROJ[pk] = { ms: 520, arc: kind === 'img' && /stone|skull|filth|seed/.test(name.toLowerCase()) ? 20 : 8, sfx: 'throw' };
      const has = E.skills.find(s => s.hits && s.hits.some(h => h.anim === 'spellcast' || h.proj));
      if (has) { for (const h of has.hits) if (h.anim === 'spellcast' || h.proj) h.proj = pk; continue; }
      E.skills.push({ name, w: .22, hits: [{ anim: 'spellcast', proj: pk, m, w: 560 }] });
    }
  };
  const _start = Battle.start.bind(Battle);
  Battle.start = function (cfg) { try { wire(); } catch (e) { } return _start(cfg); };
  // desperate stand
  const _r = Battle.render.bind(Battle);
  Battle.render = function (c, t) {
    const B = this.B, swapped = [];
    if (B) for (const a of B.actors) {
      if (a.side !== 'e' || a.ko || !a.img || !a.img.__hd || !a.img.__hd.anims.desperate) continue;
      if (a.hp < a.maxHp * .3) {
        if (!a.desp) { a.desp = 1; a.atk = Math.round(a.atk * 1.15); this.text(a, 'DESPERATE STAND', '#ff7a5a', -60, true); }
        if (a.anim === 'combat') { a.anim = 'desperate'; swapped.push(a); }
      }
    }
    _r(c, t);
    for (const a of swapped) if (a.anim === 'desperate') a.anim = 'combat';
  };
})();
