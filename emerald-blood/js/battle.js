'use strict';
/* ================= BATTLE: CTB timeline + Expedition-33 style reactions ================= */
const ARTS = {
  fang: { name: 'Emerald Fang', mp: 4, desc: 'A single strike wreathed in Drag fire. Timed hit ×2.2. Makes your eyes blaze.', type: 'hit', hits: [{ anim: 'slash', m: 2.2, glow: 1 }], blaze: 1, brk: 14 },
  ward: { name: 'Scale Ward', mp: 3, desc: 'Emerald scales cut damage taken by 60% for 2 turns. Makes your eyes blaze.', type: 'buff', blaze: 1 },
  ruin: { name: 'Verdant Ruin', mp: 9, desc: 'The binding-fire of the Seven. Hits ALL enemies, 3 timed hits.', type: 'all', hits: [{ anim: 'spellcast', m: .9 }, { anim: 'spellcast', m: .9 }, { anim: 'spellcast', m: 1.3 }], blaze: 1, brk: 10 },
  cleave: { name: 'Forge Cleave', mp: 4, desc: 'Oren\'s two-handed overhead cut. ×2.', type: 'hit', hits: [{ anim: 'backslash', m: 2 }], brk: 12 },
  needle: { name: 'Viper Needle', mp: 4, desc: 'Three fast stabs. Hard to parry.', type: 'hit', hits: [{ anim: 'slash', m: .8 }, { anim: 'slash', m: .8 }, { anim: 'slash', m: 1 }], brk: 8, pierce: 1 },
  veil: { name: 'Smoke Veil', mp: 3, desc: 'Kess melts into shadow: enemies lose track of her for 2 turns.', type: 'veil' }
};
const LINKS = {
  oren: { name: 'TWIN FANG', mp: [5, 4], desc: 'Link Art with Oren. 4 alternating timed hits.', lines: [['oren', 'Now, {name}! Like I taught you!'], ['me', "Right behind you, Oren!"]], hits: 4, m: 1.15 },
  kess: { name: 'EMERALD ECLIPSE', mp: [6, 4], desc: 'Link Art with Kess. 5 timed hits from light and shadow.', lines: [['kess', "Twelve years I've hidden this fire…"], ['me', '…so let it burn. Together!']], hits: 5, m: 1.2 }
};
const ENEMY = {
  lupine: { name: 'Ashen Lupine', hp: 38, atk: 10, def: 2, spd: 12, dodge: .2, parry: 0, brk: 40, xp: 14, gold: 6,
    skills: [{ name: 'Claw', hits: [{ anim: 'slash', m: 1, w: 560 }] }, { name: 'Frenzy', w: .5, hits: [{ anim: 'slash', m: .55, w: 480 }, { anim: 'halfslash', m: .55, w: 300 }, { anim: 'slash', m: .7, w: 380 }] }] },
  lupine_alpha: { name: 'Lupine Alpha', hp: 82, atk: 13, def: 3, spd: 13, dodge: .25, parry: .05, brk: 60, xp: 34, gold: 14,
    skills: [{ name: 'Rending Claw', hits: [{ anim: 'slash', m: 1.1, w: 520 }, { anim: 'halfslash', m: .9, w: 340 }] }, { name: 'Howl Pounce', w: .4, hits: [{ anim: 'jump', m: 1.8, w: 760, unp: 1 }] }] },
  bandit: { name: 'Bandit', hp: 40, atk: 10, def: 2, spd: 11, dodge: .2, parry: .05, brk: 36, xp: 12, gold: 10,
    skills: [{ name: 'Stab', hits: [{ anim: 'thrust', m: 1, w: 520 }] }, { name: 'Twin Cut', w: .45, hits: [{ anim: 'slash', m: .7, w: 460 }, { anim: 'slash', m: .7, w: 280 }] }] },
  rook: { name: 'Rook', hp: 70, atk: 11, def: 3, spd: 14, dodge: .3, parry: .1, brk: 50, xp: 28, gold: 22,
    skills: [{ name: 'Twin Stab', hits: [{ anim: 'thrust', m: .75, w: 480 }, { anim: 'thrust', m: .75, w: 260 }] }, { name: 'Feint', w: .45, hits: [{ anim: 'slash', m: 1.3, w: 980 }] }, { name: 'Dirt in the Eyes', w: .3, hits: [{ anim: 'slash', m: 1.5, w: 560, unp: 1 }] }] },
  acolyte: { name: 'Acolyte', hp: 50, atk: 11, def: 4, spd: 10, dodge: .05, parry: .25, brk: 44, xp: 16, gold: 9,
    skills: [{ name: 'Verdict', hits: [{ anim: 'slash', m: 1, w: 560 }] }, { name: 'Litany of Blades', w: .5, hits: [{ anim: 'slash', m: .6, w: 520 }, { anim: 'halfslash', m: .6, w: 320 }, { anim: 'backslash', m: .8, w: 420 }] }] },
  voss: { name: 'Captain Voss', hp: 125, atk: 12, def: 5, spd: 10, dodge: .05, parry: .35, brk: 70, xp: 40, gold: 0,
    skills: [{ name: 'Spear Thrust', hits: [{ anim: 'thrust', m: 1.1, w: 560 }] }, { name: 'Phalanx', w: .45, hits: [{ anim: 'thrust', m: .7, w: 500 }, { anim: 'thrust', m: .7, w: 300 }, { anim: 'thrust', m: .9, w: 520 }] }, { name: 'Shield Rush', w: .3, hits: [{ anim: 'run', m: 1.6, w: 700, unp: 1 }] }] },
  halvard: { name: 'Inquisitor Halvard', hp: 280, atk: 14, def: 5, spd: 11, dodge: .08, parry: .25, brk: 90, xp: 90, gold: 60, boss: 1,
    skills: [{ name: 'Judgment', hits: [{ anim: 'thrust', m: .8, w: 520 }, { anim: 'thrust', m: .8, w: 300 }, { anim: 'thrust', m: 1.1, w: 460 }] },
      { name: 'Radiant Lance', hits: [{ anim: 'spellcast', m: 1.4, w: 640 }] }, { name: 'Binding Psalm', psalm: 1 }, { name: 'Purging Light', w: 0, hits: [{ anim: 'spellcast', m: 2.4, w: 1100, unp: 1 }] }] },
  kairo_spar: { name: 'Kairo', hp: 80, atk: 7, def: 3, spd: 13, dodge: .15, parry: .15, brk: 50, xp: 20, gold: 0, img: 'kairo_kid',
    skills: [{ name: 'Quick Draw', hits: [{ anim: 'slash', m: 1, w: 560 }] }, { name: 'Twin Cut', w: .45, hits: [{ anim: 'slash', m: .6, w: 520 }, { anim: 'slash', m: .6, w: 320 }] }, { name: 'Show-off Leap', w: .25, hits: [{ anim: 'jump', m: 1.1, w: 760, unp: 1 }] }] },
  kairo_duel: { name: 'Kairo', hp: 260, atk: 14, def: 5, spd: 15, dodge: .25, parry: .25, brk: 85, xp: 70, gold: 0, img: 'kairo_b', boss: 1,
    skills: [{ name: 'Eclipse Edge', hits: [{ anim: 'slash', m: .7, w: 520 }, { anim: 'slash', m: .7, w: 300 }, { anim: 'slash', m: .9, w: 420 }] }, { name: 'Lightning Draw', w: .35, hits: [{ anim: 'slash', m: 1.4, w: 340 }] },
      { name: 'Shard Flare', w: .25, hits: [{ anim: 'spellcast', m: 2, w: 1000, unp: 1 }] }] },
  dread: { name: 'Dread', hp: 99999, atk: 20, def: 99, spd: 8, dodge: 0, parry: .7, brk: 99999, xp: 0, gold: 0, size: 1.5,
    skills: [{ name: 'Cleave', hits: [{ anim: 'slash', m: 1.3, w: 900 }] }, { name: 'Grave Thrust', w: .4, hits: [{ anim: 'thrust', m: 1.1, w: 700 }, { anim: 'slash', m: .9, w: 380 }] }, { name: 'Wingbeat', w: .25, hits: [{ anim: 'spellcast', m: 1.6, w: 1000, unp: 1 }] }] },
  halvard_pro: { name: 'Inquisitor Halvard', hp: 9999, atk: 16, def: 40, spd: 11, dodge: .5, parry: .5, brk: 9999, xp: 0, gold: 0, img: 'halvard',
    skills: [{ name: 'Judgment', hits: [{ anim: 'thrust', m: .8, w: 520 }, { anim: 'thrust', m: .8, w: 320 }] }, { name: 'Radiant Lance', hits: [{ anim: 'spellcast', m: 1.3, w: 620 }] }] },
};
const ALLY = {
  oren: { name: 'Oren', sprite: 'oren', color: '#a8592a', hp: 70, mp: 14, atk: 12, def: 5, spd: 9, arts: ['cleave'] },
  kess: { name: 'Kess', sprite: 'kess_bt', color: '#7a4aa6', hp: 46, mp: 18, atk: 10, def: 3, spd: 14, arts: ['needle', 'veil'] }
};
const ALLY_SPRITE = { oren: 'oren', kess: 'kess_eyes' };

const Battle = {
  B: null,
  async start(cfg) {
    if (typeof cfg === 'string') cfg = { enemies: [cfg] };
    const prevMode = G.mode; G.mode = 'battle'; Dlg.close(); UI.controls(false); $('#hud').classList.add('hide'); $('#hudR').classList.add('hide');
    const bdKey = cfg.bd || (SCENES[G.S.map] && SCENES[G.S.map].bd) || 'field';
    G.img['bd_' + bdKey] = G.img['bd_' + bdKey] || await loadImg('assets/bd_' + bdKey + '.jpg');
    const B = this.B = { cfg, bd: G.img['bd_' + bdKey], actors: [], fx: [], texts: [], rings: [], flash: 0, shake: 0, dim: 0, dimCol: '0,0,0', timeScale: 1,
      blazed: false, over: null, turn: 0, tutorial: cfg.tutorial ? { dodge: 1, parry: 1, hit: 1 } : null, log: [], press: [] };
    // party
    const W = G.view.w;
    const pSlots = [[W - 150, 205], [W - 112, 262], [W - 188, 150]];
    const eSlots = [[150, 210], [96, 262], [196, 152], [70, 160]];
    const S = G.S.stats;
    B.actors.push(this.mk({ side: 'p', id: 'me', name: G.S.name, color: '#1f8a4c', isMe: true, hp: S.hp, maxHp: S.maxHp, mp: S.mp, maxMp: S.maxMp, atk: S.atk, def: S.def, spd: S.spd, arts: G.S.arts, slot: pSlots[0] }));
    const allies = cfg.allies || G.S.party;
    for (let i = 0; i < allies.length; i++) {
      const id = allies[i], A = ALLY[id], st = G.S.allies[id] || {};
      const lv = G.S.lvl - 1;
      const maxHp = A.hp + lv * 7, maxMp = A.mp + lv * 2;
      B.actors.push(this.mk({ side: 'p', id, name: A.name, color: A.color, img: await npcImg(A.sprite), hp: st.hp ?? maxHp, maxHp, mp: st.mp ?? maxMp, maxMp,
        atk: A.atk + lv * 2, def: A.def + lv, spd: A.spd, arts: A.arts, slot: pSlots[i + 1] }));
    }
    cfg.enemies.forEach((k, i) => {
      const E = ENEMY[k]; const sc = cfg.scale || 1;
      B.actors.push(this.mk({ side: 'e', id: k + i, key: k, name: E.name + (cfg.enemies.filter(x => x === k).length > 1 ? ' ' + 'ABCD'[i] : ''), hp: Math.round(E.hp * sc), maxHp: Math.round(E.hp * sc),
        mp: 0, maxMp: 0, atk: E.atk, def: E.def, spd: E.spd, dodge: E.dodge, parry: E.parry, brkMax: E.brk, E, slot: eSlots[i], spr: E.img || k, size: E.size || 1 }));
    });
    for (const a of B.actors) if (a.side === 'e') a.img = await npcImg(a.spr);
    B.actors.forEach(a => { a.wait = 100 / a.spd * rnd(0.6, 1.0); });
    B.actors.filter(a => a.side === 'p').forEach(a => a.wait *= 0.7);
    Music.play(cfg.music || (cfg.boss ? 'boss' : 'battle'));
    this.ui(true); this.hud();
    sfx('start'); B.flash = 1;
    await this.msg(cfg.intro || (B.actors.filter(a => a.side === 'e').length > 1 ? 'Enemies appear!' : B.actors.find(a => a.side === 'e').name + ' attacks!'), 1300);
    const result = await this.run();
    // write back
    const me = this.me();
    S.hp = Math.max(1, me.hp); S.mp = me.mp;
    for (const a of B.actors) if (a.side === 'p' && !a.isMe && G.S.party.includes(a.id)) G.S.allies[a.id] = { hp: Math.max(1, a.hp), mp: a.mp };
    if (B.blazed) { G.S.hood = false; if (cfg.witness) Story.addSus(cfg.witness); }
    this.ui(false);
    G.mode = prevMode === 'battle' ? 'world' : 'world'; UI.controls(true); UI.hud();
    if (World.scene && World.scene.music) Music.play(typeof World.scene.music === 'function' ? World.scene.music() : World.scene.music);
    this.B = null;
    return result;
  },
  mk(o) { return Object.assign({ ko: false, anim: 'combat', frame: 0, at: 0, loopAnim: 'combat', x: o.slot[0], y: o.slot[1], hx: o.slot[0], hy: o.slot[1], ward: 0, guard: false, brk: 0, broken: 0, veil: 0, bind: 0, alpha: 1 }, o); },
  me() { return this.B.actors.find(a => a.isMe); },
  alive(side) { return this.B.actors.filter(a => a.side === side && !a.ko); },
  ui(on) {
    $('#bui').classList.toggle('hide', !on);
    ['#bcmd', '#react', '#cmdDesc', '#hitTap', '#tgtHint'].forEach(s => $(s).classList.add('hide'));
  },
  hud() {
    const B = this.B; if (!B) return;
    $('#bparty').innerHTML = B.actors.filter(a => a.side === 'p').map(a => `<div class="pcard ${a === B.cur ? 'act' : ''} ${a.ko ? 'ko' : ''}" style="--c:${a.color}">
      <div class="nm"><span>${esc(a.name)}</span>${a.ward ? '<span>🛡</span>' : ''}</div>
      <div class="row"><span class="ic h"></span><i><b style="width:${a.hp / a.maxHp * 100}%"></b></i><span>${a.hp}/${a.maxHp}</span></div>
      <div class="row mp"><span class="ic m"></span><i><b style="width:${a.maxMp ? a.mp / a.maxMp * 100 : 0}%"></b></i><span>${a.mp}/${a.maxMp}</span></div></div>`).join('');
    // timeline
    const order = this.preview(7), tl = $('#timeline'); tl.innerHTML = '';
    for (const a of order) {
      const d = document.createElement('div'); d.className = 'tl ' + (a.side === 'e' ? 'en' : 'pl');
      const c = document.createElement('canvas'); c.width = 32; c.height = 36;
      if (a.isMe) playerPortrait(c, 'neutral'); else portraitTo(c, a.img, 'neutral', false);
      d.appendChild(c); tl.appendChild(d);
    }
  },
  preview(n) {
    const sim = this.B.actors.filter(a => !a.ko).map(a => ({ a, w: a.wait })); const out = [];
    for (let i = 0; i < n && sim.length; i++) { sim.sort((x, y) => x.w - y.w); const s = sim[0]; out.push(s.a); s.w += 100 / s.a.spd; }
    return out;
  },
  async run() {
    const B = this.B;
    while (true) {
      const live = B.actors.filter(a => !a.ko); live.sort((a, b) => a.wait - b.wait);
      const cur = live[0]; const base = cur.wait; live.forEach(a => a.wait -= base);
      B.cur = cur; B.turn++; this.hud();
      if (B.cfg.onTurn) { const r = await B.cfg.onTurn(B, this); if (r) return r; }
      if (cur.broken) { cur.broken--; await this.text(cur, 'STUNNED', '#ffd34a'); cur.wait += 100 / cur.spd; if (!cur.broken) { cur.brk = 0; } continue; }
      if (cur.ward) cur.ward--; if (cur.veil) cur.veil--; cur.guard = false;
      if (cur.side === 'p') { const r = await this.playerTurn(cur); if (r) return r; }
      else await this.enemyTurn(cur);
      cur.wait += 100 / cur.spd * (cur.delay || 1); cur.delay = 1;
      this.hud();
      if (!this.alive('e').length) return await this.victory();
      if (!this.alive('p').filter(a => a.isMe).length || !this.alive('p').length) { await this.msg('Your vision fades to black…', 1600); return 'lose'; }
    }
  },
  // ---------------- player turn ----------------
  playerTurn(a) {
    return new Promise(resolve => {
      const B = this.B; a.mp = Math.min(a.maxMp, a.mp + 1 + (a.isMe && G.S.f.shard ? 1 : 0)); this.hud();
      const partner = B.actors.find(x => x.side === 'p' && !x.isMe && !x.ko && LINKS[x.id]);
      const menu = () => {
        const L = [['Attack', 'Two timed strikes. Tap as the ring closes for a PERFECT.', () => this.pickTarget(a, t => this.doAttack(a, t).then(done))]];
        L.push([a.isMe ? 'Drag Arts' : 'Skills', a.isMe ? 'Draw on the dragon\'s blood. Powerful, but your eyes will blaze.' : 'Special techniques.', () => sub()]);
        if (a.isMe && partner) {
          const Lk = LINKS[partner.id], ok = a.mp >= Lk.mp[0] && partner.mp >= Lk.mp[1];
          L.push(['Link Art', `${Lk.name}: ${Lk.desc} (${G.S.name} ${Lk.mp[0]} MP + ${partner.name} ${Lk.mp[1]} MP)`, () => ok ? this.pickTarget(a, t => this.doLink(a, partner, t).then(done)) : toast('Not enough MP for a Link Art.'), !ok]);
        }
        L.push(['Guard', 'Halve damage until your next turn and recover 3 MP.', () => { a.guard = true; a.mp = Math.min(a.maxMp, a.mp + 3); this.text(a, 'GUARD', '#9ad1ff'); this.hud(); done(); }]);
        L.push([`Items`, `Tonic ×${G.S.items.tonic}  ·  Ether ×${G.S.items.ether}`, () => items()]);
        if (a.isMe && !B.cfg.noFlee) L.push(['Flee', 'Try to escape (70%).', async () => { this.closeMenu(); if (Math.random() < 0.7) { await this.msg('You slip away!', 900); resolve('flee'); } else { await this.msg("Can't escape!", 900); done(); } }]);
        this.openMenu(L, null);
      };
      const sub = () => {
        const L = a.arts.map(k => { const A = ARTS[k], cost = A.mp + (a.bind ? 2 : 0); return [A.name, A.desc, () => this.useArt(a, k).then(done), a.mp < cost, cost]; });
        L.push(['◀ Back', 'Return.', menu]); this.openMenu(L, true);
      };
      const items = () => {
        const L = [];
        L.push([`Tonic ×${G.S.items.tonic}`, 'Restore 45% HP to one ally.', () => this.pickAlly(t => { G.S.items.tonic--; const h = Math.round(t.maxHp * .45); t.hp = Math.min(t.maxHp, t.hp + h); sfx('heal'); this.text(t, '+' + h, '#7dffb0'); this.hud(); done(); }), G.S.items.tonic <= 0]);
        L.push([`Ether ×${G.S.items.ether}`, 'Restore 12 MP to one ally.', () => this.pickAlly(t => { G.S.items.ether--; t.mp = Math.min(t.maxMp, t.mp + 12); sfx('heal'); this.text(t, '+12 MP', '#9ad1ff'); this.hud(); done(); }), G.S.items.ether <= 0]);
        L.push(['◀ Back', 'Return.', menu]); this.openMenu(L, false);
      };
      const done = () => { this.closeMenu(); resolve(null); };
      menu();
    });
  },
  openMenu(L, showCost) {
    const box = $('#cmdList'); box.innerHTML = ''; this.menuL = L; this.menuSel = 0;
    $('#bcmd').classList.remove('hide'); $('#cmdDesc').classList.remove('hide');
    L.forEach((it, i) => {
      const b = document.createElement('button'); b.innerHTML = esc(it[0]) + (it[4] !== undefined ? `<small>${it[4]} MP</small>` : '');
      b.disabled = !!it[3];
      b.addEventListener('pointerenter', () => this.sel(i));
      bindTap(b, () => { if (it[3]) return; sfx('blip'); this.sel(i); it[2](); });
      box.appendChild(b);
    });
    this.sel(0);
  },
  sel(i) {
    this.menuSel = i; const L = this.menuL; if (!L) return;
    $$('#cmdList button').forEach((b, k) => b.classList.toggle('sel', k === i));
    $('#cmdDesc .scroll').textContent = L[i][1];
    const c = $('#cmdCost'); c.classList.toggle('on', L[i][4] !== undefined); if (L[i][4] !== undefined) c.textContent = 'Cost  ' + L[i][4];
  },
  closeMenu() { $('#bcmd').classList.add('hide'); $('#cmdDesc').classList.add('hide'); this.menuL = null; },
  menuKey(dir) { if (!this.menuL) return false; const n = this.menuL.length; this.sel((this.menuSel + (dir === 'up' ? -1 : 1) + n) % n); sfx('blip'); return true; },
  menuA() { if (!this.menuL) return false; const it = this.menuL[this.menuSel]; if (!it[3]) { sfx('blip'); it[2](); } return true; },
  pickTarget(a, cb) {
    const B = this.B; const es = this.alive('e'); if (es.length === 1) { this.closeMenu(); cb(es[0]); return; }
    this.closeMenu(); B.targeting = { list: es, i: 0, cb, side: 'e' }; $('#tgtHint').classList.remove('hide');
  },
  pickAlly(cb) {
    const B = this.B; const ps = B.actors.filter(x => x.side === 'p' && !x.ko);
    if (ps.length === 1) { this.closeMenu(); cb(ps[0]); return; }
    this.closeMenu(); B.targeting = { list: ps, i: 0, cb, side: 'p' }; $('#tgtHint').classList.remove('hide');
  },
  confirmTarget() { const T = this.B.targeting; if (!T) return false; this.B.targeting = null; $('#tgtHint').classList.add('hide'); sfx('blip'); T.cb(T.list[T.i]); return true; },
  tapAt(x, y) {
    const B = this.B; if (!B) return;
    if (B.targeting) {
      const T = B.targeting; let best = -1, bd = 1e9;
      T.list.forEach((a, i) => { const d = Math.hypot(a.x - x, a.y - 30 - y); if (d < bd) { bd = d; best = i; } });
      if (best >= 0 && bd < 70) { if (T.i === best) this.confirmTarget(); else { T.i = best; sfx('blip'); } }
    }
  },
  // ---------------- timed hits (player attacking) ----------------
  async qte(target, dur, color) {
    const B = this.B; dur = dur || rnd(470, 640);
    if (B.tutorial && B.tutorial.hit) { B.tutorial.hit = 0; B.timeScale = 0.4; await this.msg('Tap when the ring closes on the center!', 1200, true); }
    const ring = { x: target.x, y: target.y - 30, t0: performance.now(), dur: dur / B.timeScale, kind: 'hit', color: color || '#ffd34a' }; B.rings.push(ring);
    $('#hitTap').classList.remove('hide');
    const T = ring.t0 + ring.dur;
    const res = await new Promise(r => {
      let done = false;
      const prevA = Input.handlers.a;
      const fin = v => { if (done) return; done = true; Input.on('a', prevA); hit.removeEventListener('pointerdown', h); r(v); };
      const judge = () => { const d = Math.abs(performance.now() - T) * B.timeScale; fin(d <= 75 ? 'perfect' : d <= 170 ? 'good' : 'miss'); };
      const hit = $('#hitTap'); const h = e => { e.preventDefault(); judge(); };
      hit.addEventListener('pointerdown', h); Input.on('a', judge);
      const ck = () => { if (done) return; if (performance.now() > T + 175 / B.timeScale) fin('miss'); else requestAnimationFrame(ck); }; ck();
    });
    // wait until impact moment for sync
    const left = T - performance.now(); if (left > 0) await wait(left);
    B.rings = B.rings.filter(x => x !== ring); $('#hitTap').classList.add('hide'); B.timeScale = 1;
    return res;
  },
  async dash(a, x, y, ms) { const fx = a.x, fy = a.y, t0 = performance.now(); a.anim = 'run'; a.loopAnim = 'run';
    while (true) { const k = Math.min(1, (performance.now() - t0) / ms); a.x = lerp(fx, x, k); a.y = lerp(fy, y, k); if (k >= 1) break; await wait(16); }
    a.loopAnim = 'combat'; a.anim = 'combat'; },
  async home(a) { await this.dash(a, a.hx, a.hy, 260); },
  play(a, anim, n, ms) { a.anim = anim; a.frame = 0; a.at = 0; a.fn = n; a.fms = ms; a.once = true; return wait(n * ms); },
  async strike(a, t, hit, mult, opts) {
    // windup then QTE then impact
    a.anim = hit.anim; a.frame = 0; a.once = true; a.fn = 99; a.fms = 1e9; a.glow = !!hit.glow;
    const g = opts.auto ? 'good' : await this.qte(t);
    this.play(a, hit.anim, { slash: 6, halfslash: 6, backslash: 13, spellcast: 7, thrust: 8, jump: 5, run: 8 }[hit.anim] || 6, hit.anim === 'backslash' ? 45 : 70);
    a.frame = hit.anim === 'backslash' ? 4 : 2;
    sfx('swing');
    return this.resolveHit(a, t, hit.m * mult, g, opts);
  },
  resolveHit(a, t, m, grade, opts) {
    const B = this.B; if (t.ko) return 'ko';
    this.text(a, grade === 'perfect' ? 'PERFECT!' : grade === 'good' ? 'GOOD' : 'MISS', grade === 'perfect' ? '#ffd34a' : grade === 'good' ? '#c9f7d6' : '#999', -40);
    sfx(grade === 'perfect' ? 'perfect' : grade === 'good' ? 'good' : 'miss');
    // enemy defense (they can dodge/parry you unless PERFECT)
    if (t.side === 'e' && grade !== 'perfect' && !t.broken && !opts.unblockable) {
      const r = Math.random();
      if (r < t.dodge * (grade === 'miss' ? 1.6 : 1)) { this.text(t, 'DODGED', '#9ad1ff'); sfx('dodge'); this.hop(t); return 'dodged'; }
      if (r < (t.dodge + t.parry) * (grade === 'miss' ? 1.6 : 1) && !opts.pierce) { this.text(t, 'PARRIED', '#ffe36a'); sfx('parry'); this.spark(t.x + 10, t.y - 34, '#fff3a0', 10); return 'parried'; }
    }
    if (t.veil && t.side === 'p') { this.text(t, 'MISSED', '#9ad1ff'); return 'dodged'; }
    let dmg = Math.max(1, Math.round((a.atk * m) * (grade === 'perfect' ? 1.5 : grade === 'good' ? 1 : 0.6) * rnd(.9, 1.1) - t.def * (t.broken ? 0 : 1)));
    if (t.broken) dmg = Math.round(dmg * 1.5);
    if (t.guard) dmg = Math.ceil(dmg / 2);
    if (t.ward) dmg = Math.ceil(dmg * .4);
    this.damage(t, dmg, grade === 'perfect');
    if (t.side === 'e' && !t.ko) { t.brk += (grade === 'perfect' ? 12 : grade === 'good' ? 6 : 2) + (opts.brk || 0); this.checkBreak(t); }
    return 'hit';
  },
  damage(t, dmg, big) {
    t.hp = Math.max(0, t.hp - dmg); this.text(t, String(dmg), t.side === 'e' ? '#fff' : '#ff8080', 0, big);
    sfx(big ? 'crit' : 'hit'); this.B.shake = big ? 9 : 5; t.hurtT = 220; this.spark(t.x, t.y - 30, big ? '#ffe36a' : '#fff', big ? 16 : 9);
    if (t.hp <= 0 && !t.ko) { t.ko = true; t.anim = 'hurt'; t.once = true; t.frame = 0; t.fn = 6; t.fms = 90; t.at = 0; t.loopAnim = 'hurt'; this.text(t, t.side === 'e' ? 'DEFEATED' : 'DOWN', '#ff6b6b', -20); }
    this.hud();
  },
  checkBreak(t) { if (t.brk >= t.brkMax && !t.broken) { t.broken = 1; t.brk = t.brkMax; sfx('break'); this.text(t, 'BREAK!', '#ffd34a', -24, true); this.B.flash = .6; t.wait += 100 / t.spd; } },
  hop(t) { const x0 = t.x, d = t.side === 'e' ? -26 : 26; let k = 0; const it = setInterval(() => { k++; t.x = x0 + Math.sin(k / 8 * Math.PI) * d; if (k >= 8) { clearInterval(it); t.x = x0; } }, 22); },
  async doAttack(a, t) {
    const B = this.B; await this.dash(a, t.x + (a.side === 'p' ? 52 : -52), t.y + 2, 260);
    const seq = [{ anim: 'slash', m: .75 }, { anim: a.isMe ? 'backslash' : 'halfslash', m: .85 }];
    let parried = 0;
    for (const h of seq) { if (t.ko) break; const r = await this.strike(a, t, h, 1, {}); if (r === 'parried') parried++; await wait(160); }
    a.glow = false;
    if (parried === seq.length && !t.ko) { await this.msg(`${t.name} reads every blow — COUNTER!`, 900); await this.enemyStrike(t, a, { name: 'Counter', hits: [{ anim: t.E.skills[0].hits[0].anim, m: 1.2, w: 520 }] }, true); }
    await this.home(a);
  },
  async useArt(a, k) {
    const B = this.B, A = ARTS[k], cost = A.mp + (a.bind ? 2 : 0);
    this.closeMenu(); a.mp -= cost; this.hud();
    if (A.blaze && a.isMe) { if (!B.blazed) { B.blazed = true; if (G.S.hood) { G.S.hood = false; this.text(a, 'Hood burns back!', '#46ff95', -50); } } }
    B.dim = .55; B.dimCol = a.isMe ? '10,40,20' : '30,10,40'; sfx('art');
    await this.msg(A.name, 700);
    if (A.type === 'buff') { await this.play(a, 'spellcast', 7, 80); a.ward = 3; this.spark(a.x, a.y - 30, '#46ff95', 26); this.text(a, 'SCALE WARD', '#46ff95'); }
    else if (A.type === 'veil') { await this.play(a, 'spellcast', 7, 70); a.veil = 3; a.alpha = .45; this.text(a, 'VEILED', '#c9a6ff'); }
    else if (A.type === 'hit') {
      await new Promise(r => this.pickTarget(a, r)).then(async t => {
        await this.dash(a, t.x + 52, t.y + 2, 240);
        for (const h of A.hits) { if (t.ko) break; await this.strike(a, t, h, 1, { brk: A.brk || 0, pierce: A.pierce, unblockable: a.isMe }); if (h.glow) this.spark(t.x, t.y - 30, '#46ff95', 30); await wait(140); }
        a.glow = false; await this.home(a);
      });
    } else if (A.type === 'all') {
      await this.play(a, 'spellcast', 7, 90);
      for (const h of A.hits) {
        const es = this.alive('e'); if (!es.length) break;
        const g = await this.qte(es[0], rnd(500, 650), '#46ff95');
        sfx('art'); B.flash = .5;
        for (const t of es) { this.pillar(t.x, t.y); this.resolveHit(a, t, h.m, g, { brk: A.brk, unblockable: 1 }); }
        await wait(200);
      }
    }
    B.dim = 0; a.alpha = a.veil ? .45 : 1; this.hud();
  },
  async doLink(a, p, t) {
    const B = this.B, Lk = LINKS[p.id];
    this.closeMenu(); a.mp -= Lk.mp[0]; p.mp -= Lk.mp[1]; this.hud();
    B.dim = .7; B.dimCol = '60,10,10';
    await cutIn(Lk.name, 'me', p.id, Lk.lines);
    if (!B.blazed && a.isMe) { B.blazed = true; G.S.hood = false; }
    await Promise.all([this.dash(a, t.x + 50, t.y + 18, 220), this.dash(p, t.x + 50, t.y - 22, 220)]);
    for (let i = 0; i < Lk.hits; i++) {
      if (t.ko) break;
      const who = i % 2 ? p : a, h = { anim: i === Lk.hits - 1 ? (who.isMe ? 'backslash' : 'slash') : 'slash', m: Lk.m + (i === Lk.hits - 1 ? .6 : 0), glow: who.isMe };
      await this.strike(who, t, h, 1, { brk: 8, unblockable: 1 });
      this.spark(t.x, t.y - 30, i % 2 ? '#c9a6ff' : '#46ff95', 18);
      await wait(90);
    }
    a.glow = false; p.delay = 1.6;
    await Promise.all([this.home(a), this.home(p)]); B.dim = 0;
  },
  // ---------------- enemy turn ----------------
  async enemyTurn(e) {
    const B = this.B, E = e.E;
    let sk;
    if (e.key === 'halvard') {
      const ph = B.turn % 5;
      if (e.hp < e.maxHp * .5 && !e.phase2) { e.phase2 = 1; await this.msg('Halvard: "Then I will burn the fire out of you!"', 1500); }
      sk = e.phase2 && ph === 2 ? E.skills[3] : ph === 1 ? E.skills[2] : pick([E.skills[0], E.skills[1]]);
      if (e.phase2 && Math.random() < .25) sk = E.skills[3];
    } else {
      const pool = E.skills; let r = Math.random(); sk = pool[0];
      for (const s of pool.slice(1)) { if (r < (s.w || .3)) { sk = s; break; } r -= (s.w || .3); }
    }
    const targets = this.alive('p').filter(p => !p.veil); const t = targets.length ? pick(targets) : pick(this.alive('p'));
    if (sk.psalm) {
      await this.msg(`${e.name}: Binding Psalm`, 900); sfx('chant'); B.dim = .4; B.dimCol = '60,50,10';
      for (const p of this.alive('p')) { p.bind = 2; const d = Math.min(p.mp, 3); p.mp -= d; this.text(p, `-${d} MP · Arts cost +2`, '#ffd34a'); }
      await wait(900); B.dim = 0; this.hud(); return;
    }
    await this.enemyStrike(e, t, sk, false);
  },
  async enemyStrike(e, t, sk, isCounter) {
    const B = this.B;
    if (!isCounter) await this.msg(`${e.name}: ${sk.name}`, 700);
    if (sk.hits.some(h => h.unp)) { this.text(e, '!! UNPARRYABLE', '#ff5050', -50, true); sfx('alarm'); await wait(450); }
    const ranged = sk.hits[0].anim === 'spellcast';
    if (!ranged) await this.dash(e, t.x - 54, t.y + 2, 280);
    $('#react').classList.remove('hide');
    let parries = 0, n = 0;
    for (const h of sk.hits) {
      if (t.ko) break; n++;
      const r = await this.defend(e, t, h);
      if (r === 'parry' || r === 'pparry') parries++;
      await wait(120);
    }
    $('#react').classList.add('hide');
    const allParried = parries === n && n > 0 && !sk.hits.some(h => h.unp);
    if (!ranged) await this.home(e);
    if (allParried && !t.ko && !e.ko) {
      await this.msg('COUNTERATTACK!', 600); sfx('counter'); B.dim = .5; B.dimCol = '60,50,10';
      await this.dash(t, e.x + 52, e.y + 2, 180);
      t.anim = t.isMe ? 'backslash' : 'slash'; this.play(t, t.anim, t.isMe ? 13 : 6, 40);
      await wait(220);
      this.resolveHit(t, e, 1.8, 'perfect', { unblockable: 1, brk: 16 });
      await wait(300); await this.home(t); B.dim = 0;
    }
  },
  defend(e, t, h) {
    const B = this.B;
    return new Promise(async resolve => {
      let w = h.w || 520;
      let slow = false;
      if (B.tutorial) {
        if (B.tutorial.dodge) { B.tutorial.dodge = 0; slow = true; await this.msg('Press DODGE as the ring closes!', 1300, true); }
        else if (B.tutorial.parry && !h.unp) { B.tutorial.parry = 0; slow = true; await this.msg('Now PARRY: tighter timing. Parry EVERY hit to counter!', 1600, true); }
      }
      B.timeScale = slow ? 0.38 : 1;
      const dur = w / B.timeScale, t0 = performance.now(), T = t0 + dur;
      const ring = { x: t.x, y: t.y - 30, t0, dur, kind: h.unp ? 'unp' : 'def', color: h.unp ? '#ff5050' : '#ffffff' };
      if (G.settings.ring || slow) B.rings.push(ring);
      e.anim = h.anim; e.frame = 0; e.once = true; e.fn = 99; e.fms = 1e9;
      let pressed = null;
      const onD = () => { if (!pressed) pressed = ['dodge', performance.now()]; $('#rxDodge').classList.add('on'); setTimeout(() => $('#rxDodge').classList.remove('on'), 120); };
      const onP = () => { if (!pressed) pressed = ['parry', performance.now()]; $('#rxParry').classList.add('on'); setTimeout(() => $('#rxParry').classList.remove('on'), 120); };
      Input.on('dodge', onD); Input.on('parry', onP);
      // animate swing so the impact frame lands on T
      const nF = { slash: 6, halfslash: 6, backslash: 13, spellcast: 7, thrust: 8, jump: 5, run: 8 }[h.anim] || 6, imp = Math.floor(nF / 2);
      const swingAt = T - imp * 60;
      while (performance.now() < T + 75 / B.timeScale) {
        const now = performance.now();
        if (now >= swingAt && e.fms > 1e8) { e.fms = 60; e.at = 0; e.frame = 0; e.fn = nF; sfx('swing'); }
        await wait(10);
      }
      Input.on('dodge', null); Input.on('parry', null);
      B.rings = B.rings.filter(x => x !== ring); B.timeScale = 1;
      // judge
      let res = 'hit';
      if (pressed) {
        const d = (pressed[1] - T) * B.timeScale || (pressed[1] - T);
        const dd = (pressed[1] - T) * (slow ? 0.38 : 1);
        if (pressed[0] === 'dodge') { if (dd >= -110 && dd <= 45) res = 'pdodge'; else if (dd >= -290 && dd <= 75) res = 'dodge'; else res = 'early'; }
        else { if (h.unp) res = 'unp'; else if (dd >= -70 && dd <= 35) res = 'pparry'; else if (dd >= -175 && dd <= 60) res = 'parry'; else res = 'early'; }
      }
      const m = h.m;
      if (res === 'pdodge') { sfx('pdodge'); this.text(t, 'PERFECT DODGE', '#6ad7ff', -10, true); this.hop(t); t.mp = Math.min(t.maxMp, t.mp + 1); t.afterimg = 400; }
      else if (res === 'dodge') { sfx('dodge'); this.text(t, 'DODGE', '#9ad1ff'); this.hop(t); }
      else if (res === 'pparry') { sfx('pparry'); this.text(t, 'PERFECT PARRY', '#ffe36a', -10, true); t.mp = Math.min(t.maxMp, t.mp + 2); this.spark((t.x + e.x) / 2, t.y - 34, '#fff3a0', 22); B.flash = .35; e.brk += 18; this.checkBreak(e); t.anim = 'halfslash'; this.play(t, 'halfslash', 6, 40); }
      else if (res === 'parry') { sfx('parry'); this.text(t, 'PARRY', '#ffe36a'); t.mp = Math.min(t.maxMp, t.mp + 1); this.spark((t.x + e.x) / 2, t.y - 34, '#fff3a0', 10); e.brk += 8; this.checkBreak(e); this.chip(e, t, m * .25); }
      else {
        if (res === 'unp') this.text(t, "CAN'T PARRY THAT!", '#ff6b6b', -20);
        if (res === 'early') this.text(t, 'TOO EARLY', '#bbb', -20);
        this.chip(e, t, m, true);
      }
      this.hud();
      resolve(res);
    });
  },
  chip(e, t, m, full) {
    let dmg = Math.max(1, Math.round(e.atk * m * rnd(.9, 1.1) - t.def * .6));
    if (t.guard) dmg = Math.ceil(dmg / 2); if (t.ward) dmg = Math.ceil(dmg * .4);
    if (e.broken) dmg = Math.ceil(dmg * .6);
    this.damage(t, dmg, false); if (full) sfx('hurt');
  },
  async victory() {
    const B = this.B; sfx('win'); Music.stop();
    const es = B.actors.filter(a => a.side === 'e'); const xp = es.reduce((s, a) => s + a.E.xp, 0), gold = es.reduce((s, a) => s + a.E.gold, 0);
    G.S.gold += gold; const ups = Story.gainXp(xp);
    this.me().hp = Math.max(this.me().hp, 1);
    if (ups) { const me = this.me(); me.maxHp = G.S.stats.maxHp; me.maxMp = G.S.stats.maxMp; me.hp = me.maxHp; me.mp = me.maxMp; }
    await this.msg(`Victory!  +${xp} XP  +${gold} gold${ups ? '  ·  LEVEL UP! Lv ' + G.S.lvl : ''}`, ups ? 2200 : 1600);
    return 'win';
  },
  // ---------------- fx ----------------
  text(a, s, col, dy, big) { this.B.texts.push({ s, x: a.x + rnd(-6, 6), y: a.y - 60 + (dy || 0), t: 0, col, big }); },
  spark(x, y, col, n) { for (let i = 0; i < n; i++) this.B.fx.push({ x, y, vx: rnd(-2.6, 2.6), vy: rnd(-3, 1), life: rnd(300, 650), t: 0, col, s: rnd(1.5, 3.2) }); },
  pillar(x, y) { this.B.fx.push({ pillar: 1, x, y, t: 0, life: 500 }); },
  async msg(s, ms, hold) { const m = $('#bmsg'); m.textContent = s; m.classList.add('on'); await wait(ms || 900); if (!hold) m.classList.remove('on'); else setTimeout(() => m.classList.remove('on'), 600); },
  update(dt) {
    const B = this.B; if (!B) return;
    for (const a of B.actors) {
      a.at += dt;
      if (a.once) { if (a.at >= a.fms) { a.at = 0; a.frame++; if (a.frame >= a.fn) { a.frame = a.fn - 1; if (!a.ko) { a.once = false; a.anim = a.loopAnim; a.frame = 0; } } } }
      else { const ms = a.anim === 'run' ? 90 : 520; if (a.at >= ms) { a.at = 0; a.frame = (a.frame + 1) % ({ combat: 2, run: 8 }[a.anim] || 2); } }
      if (a.hurtT) a.hurtT -= dt;
    }
    B.fx = B.fx.filter(p => (p.t += dt) < p.life);
    B.texts = B.texts.filter(x => (x.t += dt) < 1100);
    if (B.flash > 0) B.flash -= dt / 400; if (B.shake > 0) B.shake -= dt / 30;
  },
  render(c, t) {
    const B = this.B; if (!B) return; const W = G.view.w, H = G.view.h;
    const bd = B.bd, sc = Math.max(W / bd.width, H / bd.height);
    let ox = 0, oy = 0; if (B.shake > 0) { ox = rnd(-B.shake, B.shake); oy = rnd(-B.shake, B.shake) * .5; }
    c.save(); c.translate(ox, oy);
    c.drawImage(bd, (W - bd.width * sc) / 2, (H - bd.height * sc) / 2, bd.width * sc, bd.height * sc);
    if (B.dim > 0) { c.fillStyle = `rgba(${B.dimCol},${B.dim})`; c.fillRect(-10, -10, W + 20, H + 20); }
    // targeting cursor
    const T = B.targeting;
    const list = B.actors.slice().sort((a, b) => a.y - b.y);
    for (const a of list) {
      if (!a.isMe && !a.img) continue;
      c.fillStyle = 'rgba(0,0,0,.28)'; c.beginPath(); c.ellipse(a.x, a.y, 15, 5, 0, 0, 7); c.fill();
      const s = 1.15 * (a.size || 1);
      const fr = Math.min(a.frame, (G.man.bt.anims.find(x => x[0] === a.anim) || [0, 2])[1] - 1);
      c.globalAlpha = a.ko && a.side === 'e' ? Math.max(0, 1 - (a.at / 900)) : (a.alpha ?? 1);
      if (a.hurtT > 0 && Math.floor(a.hurtT / 50) % 2) c.globalAlpha *= .4;
      if (a.afterimg > 0) { a.afterimg -= 16; c.save(); c.globalAlpha = .3; drawBT(c, a.isMe ? playerImg() : a.img, a.anim, fr, a.x + 18, a.y, s); c.restore(); }
      if (a.isMe) {
        const anim = a.anim, glow = a.glow && anim === 'slash';
        if (!G.S.kid) drawBT(c, glow ? G.A.glowBg : G.A.swordBg, anim, fr, a.x, a.y, s);
        drawBT(c, playerImg(), anim, fr, a.x, a.y, s);
        if (G.S.kid) {} else if (!glow) drawBT(c, G.A.sword, anim, fr, a.x, a.y, s);
        else { c.save(); c.globalCompositeOperation = 'lighter'; drawBT(c, G.A.glow, anim, fr, a.x, a.y, s); c.restore(); drawBT(c, G.A.glow, anim, fr, a.x, a.y, s); }
        if (!G.S.hood) { const g = c.createRadialGradient(a.x - 4, a.y - 50, 0, a.x - 4, a.y - 50, 8); g.addColorStop(0, 'rgba(70,255,140,.4)'); g.addColorStop(1, 'rgba(70,255,140,0)'); c.save(); c.globalCompositeOperation = 'lighter'; c.fillStyle = g; c.fillRect(a.x - 20, a.y - 66, 32, 32); c.restore(); }
      } else drawBT(c, a.img, a.anim, fr, a.x, a.y, s);
      c.globalAlpha = 1;
      if (a.side === 'e' && !a.ko) {
        const bw = 44, x = a.x - bw / 2, y = a.y - 76;
        c.fillStyle = 'rgba(0,0,0,.7)'; c.fillRect(x - 1, y - 1, bw + 2, 9);
        c.fillStyle = '#e04848'; c.fillRect(x, y, bw * a.hp / a.maxHp, 4);
        c.fillStyle = a.broken ? '#fff' : '#ffd34a'; c.fillRect(x, y + 5, bw * Math.min(1, a.brk / a.brkMax), 2);
        c.font = '600 9px "Pixelify Sans"'; c.textAlign = 'center'; c.fillStyle = '#fff'; c.fillText(a.name, a.x, y - 3);
      }
    }
    if (T) { const a = T.list[T.i]; const y = a.y - 92 + Math.sin(t / 150) * 3; c.fillStyle = T.side === 'e' ? '#ffd34a' : '#46ff95'; c.beginPath(); c.moveTo(a.x - 7, y); c.lineTo(a.x + 7, y); c.lineTo(a.x, y + 9); c.fill(); }
    // rings
    for (const r of B.rings) {
      const k = clamp((performance.now() - r.t0) / r.dur, 0, 1.2), rad = lerp(58, 13, Math.min(1, k));
      c.lineWidth = 2.5; c.strokeStyle = r.color; c.globalAlpha = .9;
      c.beginPath(); c.arc(r.x, r.y, rad, 0, 7); c.stroke();
      c.lineWidth = 1.5; c.globalAlpha = .55; c.beginPath(); c.arc(r.x, r.y, 13, 0, 7); c.stroke();
      if (r.kind === 'unp') { c.globalAlpha = 1; c.fillStyle = '#ff5050'; c.font = '700 12px "Press Start 2P"'; c.textAlign = 'center'; c.fillText('!!', r.x, r.y - 22); }
      c.globalAlpha = 1;
    }
    // particles
    for (const p of B.fx) {
      const k = p.t / p.life;
      if (p.pillar) { const g = c.createLinearGradient(p.x, 0, p.x, p.y); g.addColorStop(0, 'rgba(70,255,140,0)'); g.addColorStop(1, `rgba(70,255,140,${.7 * (1 - k)})`); c.fillStyle = g; c.fillRect(p.x - 14 * (1 - k * .5), 0, 28 * (1 - k * .5), p.y); continue; }
      c.globalAlpha = 1 - k; c.fillStyle = p.col; c.fillRect(p.x + p.vx * p.t / 16, p.y + p.vy * p.t / 16 + k * k * 30, p.s, p.s);
    }
    c.globalAlpha = 1;
    for (const x of B.texts) {
      const k = x.t / 1100; c.globalAlpha = k > .75 ? (1 - k) * 4 : 1;
      c.font = (x.big ? '700 13px' : '700 11px') + ' "Press Start 2P"'; c.textAlign = 'center';
      const y = x.y - Math.min(1, k * 3) * 18;
      c.fillStyle = '#000'; c.fillText(x.s, x.x + 1, y + 1); c.fillStyle = x.col; c.fillText(x.s, x.x, y);
    }
    c.globalAlpha = 1; c.restore();
    if (B.flash > 0) { c.fillStyle = `rgba(255,255,255,${Math.min(.8, B.flash)})`; c.fillRect(0, 0, W, H); }
  }
};
// canvas taps for targeting
cv.addEventListener('pointerdown', e => {
  if (G.mode !== 'battle' || !Battle.B) return;
  Battle.tapAt(e.clientX / innerWidth * G.view.w, e.clientY / innerHeight * G.view.h);
});
$('#tgtHint').addEventListener('pointerdown', e => { e.preventDefault(); Battle.confirmTarget(); });
addEventListener('keydown', e => {
  if (G.mode !== 'battle' || !Battle.B) return;
  const T = Battle.B.targeting;
  if (T && (e.key === 'ArrowLeft' || e.key === 'ArrowRight' || e.key === 'ArrowUp' || e.key === 'ArrowDown')) { T.i = (T.i + (e.key === 'ArrowRight' || e.key === 'ArrowDown' ? 1 : -1) + T.list.length) % T.list.length; sfx('blip'); e.preventDefault(); return; }
  if (e.key === 'ArrowUp' || e.key === 'ArrowDown') { if (Battle.menuKey(e.key === 'ArrowUp' ? 'up' : 'down')) e.preventDefault(); }
});
