'use strict';
/* FIGHTING STYLES (Chat C) — every fighter's martial art shows in battle: the colour and shape of their hit marks,
   what their parry throws off, and how they dodge. Names are working titles (lore belongs to Chat A — see COORDINATION).
   mark:  crescent (sword arc) · x (twin blades) · thrust (spear/rapier line) · impact (hammer/fist/shield burst)
          claw (3 rakes) · bite (jaws) · arrow (streak) · chain (whirl)
   dodge: after (afterimage) · shadow (sinks into shadow) · vault · feather · smoke · brace (doesn't move: dust) · blink (light) · water
   The 12×12 sheets (SPRITES.md) draw the same style frame by frame; this file makes it read even before the new art lands. */
const FightStyle = {
  T: {
    // heroes
    me: { n: "Vane's Sheathed Sword", col: '120,255,170', mark: 'crescent', dodge: 'after', parry: '200,255,220' },
    veil: { n: 'Red Veil', col: '255,90,90', mark: 'x', dodge: 'smoke', parry: '255,160,160' },
    kess: { n: 'Shadowstep Knife-Dance', col: '190,140,255', mark: 'x', dodge: 'shadow', parry: '220,190,255' },
    liora: { n: 'Moonwater Spear', col: '225,238,255', mark: 'thrust', dodge: 'vault', parry: '210,230,255' },
    oren: { n: 'Forgeheart Breaker', col: '255,140,60', mark: 'impact', dodge: 'brace', parry: '255,190,90' },
    dace: { n: 'Iron Vow Axe', col: '150,220,150', mark: 'crescent', dodge: 'brace', parry: '200,210,200' },
    tamsin: { n: 'Wildfire Archery', col: '255,160,70', mark: 'arrow', dodge: 'vault', parry: '255,200,120' },
    // rivals & named fighters (by sprite / enemy key)
    kairo: { n: 'Scar-Spark Blade', col: '130,255,140', mark: 'crescent', dodge: 'smoke', parry: '200,255,180' },
    vane: { n: 'The Sheathed Sword', col: '235,245,255', mark: 'crescent', dodge: 'after', parry: '255,255,255' },
    halvard: { n: 'Pale Liturgy', col: '255,245,190', mark: 'impact', dodge: 'blink', parry: '255,250,220' },
    voss: { n: 'Wall Doctrine', col: '210,215,225', mark: 'thrust', dodge: 'brace', parry: '230,235,245' },
    corran: { n: 'The Rules', col: '170,200,255', mark: 'crescent', dodge: 'after', parry: '200,220,255' },
    wren: { n: 'Featherfall', col: '160,240,180', mark: 'thrust', dodge: 'feather', parry: '200,255,210' },
    sefa: { n: 'Quiet Staff', col: '170,255,200', mark: 'impact', dodge: 'after', parry: '200,255,220' },
    tobias: { n: 'Sunward Knighthood', col: '255,225,130', mark: 'crescent', dodge: 'brace', parry: '255,235,160' },
    dax: { n: 'Pit Boxing', col: '255,230,200', mark: 'impact', dodge: 'after', parry: '255,240,220' },
    nix: { n: 'Censer Chain', col: '220,200,170', mark: 'chain', dodge: 'smoke', parry: '230,215,190' },
    corvin: { n: 'Collar Reaper', col: '255,120,100', mark: 'crescent', dodge: 'after', parry: '255,170,150' },
    bertrand: { n: "Catcher's Way", col: '200,190,170', mark: 'impact', dodge: 'after', parry: '220,210,190' },
    hesk: { n: 'Ledger Fencing', col: '200,200,215', mark: 'thrust', dodge: 'after', parry: '220,220,235' },
    rook: { n: 'Gutter Gambit', col: '255,210,110', mark: 'crescent', dodge: 'vault', parry: '255,225,150' },
    garrick: { n: 'Bulwark', col: '230,205,150', mark: 'impact', dodge: 'brace', parry: '240,220,170' },
    tilda: { n: 'Anvil Fist', col: '255,150,70', mark: 'impact', dodge: 'after', parry: '255,190,110' },
    sylwen: { n: 'Tempest Dance', col: '130,230,255', mark: 'thrust', dodge: 'water', parry: '170,240,255' },
    caspian: { n: 'Imperial Twin Blades', col: '255,80,90', mark: 'x', dodge: 'after', parry: '255,150,150' },
    cael: { n: 'Ardent Light', col: '255,250,210', mark: 'crescent', dodge: 'blink', parry: '255,255,230' },
    iska: { n: 'Tidecall', col: '120,200,255', mark: 'thrust', dodge: 'water', parry: '170,220,255' },
    acolyte: { n: 'Lantern Rite', col: '255,200,120', mark: 'impact', dodge: 'after', parry: '255,220,160' },
    bandit: { n: 'Cutthroat', col: '255,215,190', mark: 'crescent', dodge: 'vault', parry: '255,230,210' },
    guard: { n: 'Registry Drill', col: '220,225,235', mark: 'thrust', dodge: 'brace', parry: '235,240,250' },
    hunter: { n: 'Hunter', col: '220,240,190', mark: 'arrow', dodge: 'vault', parry: '230,245,210' },
    // monster families (by sprite)
    m_drake: { n: 'Drake', col: '255,130,50', mark: 'claw', dodge: 'brace', parry: '255,170,90' },
    m_cavewyrm: { n: 'Wyrm', col: '120,220,255', mark: 'bite', dodge: 'brace', parry: '170,230,255' },
    mana_wyrm: { n: 'Mana Wyrm', col: '170,150,255', mark: 'bite', dodge: 'blink', parry: '200,190,255' },
    m_skeleton: { n: 'Bone', col: '200,255,210', mark: 'crescent', dodge: 'after', parry: '230,255,235' },
    m_ghoul: { n: 'Ghoul', col: '190,230,140', mark: 'claw', dodge: 'shadow', parry: '210,240,170' },
    m_lizard: { n: 'Scale', col: '170,240,150', mark: 'thrust', dodge: 'after', parry: '200,250,180' },
    m_troll: { n: 'Troll', col: '200,220,150', mark: 'impact', dodge: 'brace', parry: '220,230,180' },
    m_vampire: { n: 'Vampire', col: '255,70,90', mark: 'claw', dodge: 'shadow', parry: '255,130,140' },
    m_ratfolk: { n: 'Ratfolk', col: '230,210,170', mark: 'crescent', dodge: 'vault', parry: '240,225,190' },
    m_goblin: { n: 'Goblin', col: '200,240,140', mark: 'x', dodge: 'vault', parry: '220,250,170' },
    m_goblin_shaman: { n: 'Hex', col: '170,255,120', mark: 'impact', dodge: 'smoke', parry: '200,255,160' },
    lupine: { n: 'Lupine', col: '255,190,120', mark: 'bite', dodge: 'vault', parry: '255,210,160' },
    lupine_alpha: { n: 'Alpha', col: '255,150,100', mark: 'bite', dodge: 'vault', parry: '255,190,140' },
    rime_lupine: { n: 'Rime', col: '190,235,255', mark: 'bite', dodge: 'vault', parry: '220,245,255' },
    m_tusker: { n: 'Tusker', col: '230,200,160', mark: 'impact', dodge: 'brace', parry: '240,215,180' },
    m_minotaur: { n: 'Minotaur', col: '255,170,110', mark: 'crescent', dodge: 'brace', parry: '255,200,150' },
    m_wartotaur: { n: 'Minotaur', col: '255,170,110', mark: 'crescent', dodge: 'brace', parry: '255,200,150' },
    m_orc: { n: 'Orc', col: '200,230,150', mark: 'crescent', dodge: 'brace', parry: '220,240,180' },
    m_gourd: { n: 'Gourd', col: '255,190,90', mark: 'claw', dodge: 'vault', parry: '255,210,140' }
  },
  DEF: { n: '', col: '255,225,210', mark: 'crescent', dodge: 'after', parry: '255,240,220' },
  key(a) {
    if (!a) return null; if (a.isMe) return typeof Veil !== 'undefined' && Veil.on && Veil.on() && G.S && G.S.hood ? 'veil' : 'me';
    const k = String(a.key || a.id || ''), base = k.replace(/^(ge_|gt_)/, '').replace(/_(bt|w|e|r|t|spar|duel|pro|kid|b)$/, '');
    if (this.T[base]) return base;
    const img = typeof ENEMY !== 'undefined' && ENEMY[k] && ENEMY[k].img; if (img) { const ib = img.replace(/_(bt|kid|b|w|e)$/, ''); if (this.T[img]) return img; if (this.T[ib]) return ib; }
    const sp = String(a.sprite || a.spr || '').replace(/^ge_/, '').replace(/_(bt|w|e|eyes)$/, ''); return this.T[sp] ? sp : null;
  },
  of(a) { const k = this.key(a); return (k && this.T[k]) || this.DEF; },
  /* hit marks: sharp, tapered shapes drawn crisp (a dark edge under a bright core), not soft strokes */
  draw(c, p, k) {
    const a = 1 - k, grow = Math.min(1, k * 5), S = p.big ? 1.35 : 1, col = p.col;
    c.save(); c.translate(p.x, p.y); c.rotate(p.ang || 0); c.lineJoin = 'miter';
    const blade = (L, W, bend) => {   // a crescent that is thick in the middle and needle-thin at both ends
      c.beginPath(); c.moveTo(-L, 0); c.quadraticCurveTo(0, -bend - W, L, 0); c.quadraticCurveTo(0, -bend + W * .2, -L, 0); c.closePath();
    };
    const pass = (fn) => {
      c.globalCompositeOperation = 'source-over'; c.fillStyle = `rgba(20,10,10,${a * .35})`; c.save(); c.translate(1, 1.5); fn(); c.fill(); c.restore();
      c.globalCompositeOperation = 'lighter'; c.fillStyle = `rgba(${col},${a})`; fn(); c.fill();
      c.fillStyle = `rgba(255,255,255,${a})`; c.save(); c.scale(.82, .45); fn(); c.fill(); c.restore();
    };
    const L = 46 * S * grow, W = 7 * S * (1 - k * .5);
    switch (p.mark) {
      case 'x': pass(() => blade(L * .85, W * .8, 6)); c.rotate(Math.PI / 2.3); pass(() => blade(L * .85, W * .8, 6)); break;
      case 'thrust': c.rotate(-(p.ang || 0)); pass(() => { c.beginPath(); c.moveTo(-L * 1.3, 0); c.lineTo(L * .9, -W * .45); c.lineTo(L * 1.2, 0); c.lineTo(L * .9, W * .45); c.closePath(); });
        c.globalCompositeOperation = 'lighter'; c.strokeStyle = `rgba(255,255,255,${a})`; c.lineWidth = 1.5; c.beginPath(); c.arc(L * 1.1, 0, 4 + 12 * k, 0, 7); c.stroke(); break;
      case 'impact': { c.rotate(-(p.ang || 0)); const n = 10, R = (14 + 30 * grow) * S;
        pass(() => { c.beginPath(); for (let i = 0; i < n * 2; i++) { const r = i % 2 ? R * .35 : R * (i % 4 ? .8 : 1), an = i / (n * 2) * Math.PI * 2; c.lineTo(Math.cos(an) * r, Math.sin(an) * r); } c.closePath(); }); break; }
      case 'claw': for (const o of [-9, 0, 9]) { c.save(); c.translate(0, o * S); pass(() => blade(L * .8, W * .55, 5)); c.restore(); } break;
      case 'bite': c.rotate(-(p.ang || 0)); { const g = (1 - grow) * 12 * S + 3; c.save(); c.translate(0, -g); pass(() => blade(L * .6, W * .9, -8)); c.restore(); c.save(); c.translate(0, g); c.scale(1, -1); pass(() => blade(L * .6, W * .9, -8)); c.restore(); } break;
      case 'arrow': c.rotate(-(p.ang || 0) + (Math.random() < 0 ? 0 : 0)); pass(() => { c.beginPath(); c.moveTo(-L * 1.6, -1); c.lineTo(L * .6, -W * .35); c.lineTo(L * .9, 0); c.lineTo(L * .6, W * .35); c.lineTo(-L * 1.6, 1); c.closePath(); }); break;
      case 'chain': c.rotate(k * 5); pass(() => { c.beginPath(); c.arc(0, 0, L * .7, 0, Math.PI * 1.4); c.arc(0, 0, L * .7 - W, Math.PI * 1.4, 0, true); c.closePath(); }); break;
      default: pass(() => blade(L, W, 8));
    }
    c.restore();
  },
  /* what a dodge or parry throws off, in the defender's style */
  react(BT, t, r) {
    const B = BT.B; if (!B || !t) return; const S = this.of(t), y = t.y - 30 * (typeof BT_SCALE !== 'undefined' ? BT_SCALE : 1) * (t.size || 1);
    const motes = (n, col, sp, up, sz) => { for (let i = 0; i < n; i++) B.fx.push({ mote: 1, x: t.x + (Math.random() - .5) * 22, y: y + (Math.random() - .5) * 30, vx: (Math.random() - .5) * sp, vy: -Math.random() * up, r: sz || 2.5, col, t: 0, life: 420 + Math.random() * 300 }); };
    if (r === 'parry' || r === 'pparry') {
      BT.spark(t.x + (t.side === 'p' ? 14 : -14), y, `rgb(${S.parry})`, r === 'pparry' ? 26 : 14);
      B.fx.push({ ringfx: 1, x: t.x + (t.side === 'p' ? 14 : -14), y, col: S.parry, t: 0, life: r === 'pparry' ? 360 : 240, R: r === 'pparry' ? 40 : 24 });
      return;
    }
    if (r !== 'dodge' && r !== 'pdodge') return; const big = r === 'pdodge';
    switch (S.dodge) {
      case 'shadow': B.fx.push({ ringfx: 1, flat: 1, x: t.x, y: t.y - 2, col: S.col, t: 0, life: 420, R: 44 }); motes(big ? 14 : 8, `rgba(${S.col},.9)`, 1.2, .6, 3); break;
      case 'smoke': motes(big ? 18 : 10, 'rgba(200,200,205,.75)', 1.6, .9, 4); break;
      case 'feather': motes(big ? 16 : 9, `rgba(${S.col},.95)`, 2.2, 1.6, 3); break;
      case 'water': motes(big ? 16 : 9, 'rgba(150,220,255,.9)', 2, 2, 2.5); B.fx.push({ ringfx: 1, flat: 1, x: t.x, y: t.y - 2, col: '150,220,255', t: 0, life: 420, R: 40 }); break;
      case 'blink': B.fx.push({ ringfx: 1, x: t.x, y, col: S.col, t: 0, life: 300, R: 34 }); motes(big ? 12 : 6, `rgba(${S.col},1)`, 1, 1, 2); break;
      case 'vault': motes(big ? 10 : 5, 'rgba(210,190,150,.8)', 1.4, .5, 3); break;
      case 'brace': B.fx.push({ ringfx: 1, flat: 1, x: t.x, y: t.y - 2, col: '210,190,150', t: 0, life: 360, R: 34 }); motes(8, 'rgba(200,180,140,.8)', 2.4, .4, 3); break;
      default: if (big) motes(8, `rgba(${S.col},.9)`, 1, .8, 2);
    }
  }
};
