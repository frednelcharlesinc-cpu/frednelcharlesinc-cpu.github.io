/* ZONE SPRITES (Chat C, 2026-11-18): while Ren is in the Zone (Kaigen), he fights with his Zone sheet - relaxed stance,
   light anime power aura, lightning in the eyes. Every battle anim is mapped onto the matching Zone move (assets/hd ren: z_*).
   Visual only. Off switch: G.settings.zoneSpritesOff */
(function () {
  if (typeof HD === 'undefined' || typeof Battle === 'undefined') return;
  const MAP = { combat: 'z_stance', idle: 'z_stance', guard: 'z_stance', victory: 'z_stance', draw: 'z_stance', fist: 'z_stance', land: 'z_stance', jump: 'z_dash',
    walk: 'z_dash', run: 'z_dash', slash: 'z_draw', cmb1: 'z_combo', cmb2: 'z_through', cmb3: 'z_combo', cmb4: 'z_draw', cmb5: 'z_combo',
    halfslash: 'z_draw', thrust: 'z_draw', thr: 'z_draw', backslash: 'z_through', spellcast: 'z_wave',
    pd1: 'z_through', pd2: 'z_combo', pd3: 'z_wave', pd4: 'z_through', pp1: 'z_combo', pp2: 'z_draw', pp3: 'z_through', ppfin: 'z_fin',
    parry: 'z_parry', dodge: 'z_dodge', pdodge: 'z_dodge' };
  const LOOP = { z_stance: 120, z_dash: 70 };
  const _bt = HD.bt.bind(HD);
  HD.bt = function (c, img, anim, f, x, y, s) {
    const H = img && img.__hd, B = Battle.B;
    let me = null;
    try { if (H && H.me && B && !(G.settings && G.settings.zoneSpritesOff) && H.anims.z_stance) me = B.actors.find(a => a.isMe); } catch (e) { }
    if (!me) return _bt(c, img, anim, f, x, y, s);
    const inZone = me.zone > 0 && !me.ko;
    me.__zsprite = inZone;
    if (!inZone) return _bt(c, img, anim, f, x, y, s);
    const now = performance.now(), act = HD.act; let swapped = null;
    if (act && now < act.end && MAP[act.name] && H.anims[MAP[act.name]]) { swapped = act.name; act.name = MAP[act.name]; }
    const z = MAP[anim];
    try {
      if (!z || !H.anims[z]) return _bt(c, img, anim, f, x, y, s);
      const zl = H.anims[z].length;
      let zf;
      if (LOOP[z]) zf = z === 'z_dash' ? 1 + Math.floor(now / LOOP[z]) % Math.max(1, zl - 2) : Math.floor(now / LOOP[z]) % zl;
      else { const ol = (H.anims[anim] || [0]).length, n = HD.NBT[anim] || ol; zf = Math.min(zl - 1, Math.floor((f + .5) * zl / Math.max(1, n))); }
      return _bt(c, img, z, zf, x, y, s);
    } finally { if (swapped) act.name = swapped; }
  };
})();
