/* =====================================================================
   COMBAT II — round 2
   · THE BATTLEFIELD: every fight has a couple of things lying around — barrels,
     lamps, stacked crates, hay, snowy pines, loose boulders. Use them (Environment).
   · RED VEIL TRICKS: in the mask, Ren fights dirty and non-lethally — smoke bomb,
     scarf lash (disarm), and the knockout blow. Knockouts build the Veil's fame.
   · WOUNDS: a brutal hit can leave a wound that follows you between fights —
     cut arm (ATK −15%), twisted ankle (timing −15%), cracked ribs (DEF −25%).
     They mend after a few fights, or at once with a night at an inn/tavern or Maren.
   ===================================================================== */
const OBJ = {
  barrel: { prop: 'barrel', name: 'Kick the barrel', desc: 'Roll it into their line — hits every enemy and cracks their guard (Break +20).' },
  lamp: { prop: 'lamp', name: 'Topple the lamp', desc: 'Burning oil across the ground. Enemies are dazzled for 2 turns: your dodge/parry windows +30%.' },
  crates: { prop: 'crate2', name: 'Topple the crates', desc: 'Bury one enemy under a stack of crates — heavy damage and they lose their next turn.' },
  hay: { prop: 'hay', name: 'Dive into the hay', desc: 'Vanish for a moment — the next attack aimed at you misses completely.' },
  pine: { prop: 'wpine1', name: 'Shake the pine', desc: 'A load of snow comes down on them: hits every enemy and dazzles them for a turn.' },
  boulder: { prop: 'boulder', name: 'Topple the boulder', desc: 'Send it rolling over one enemy — very heavy damage, unblockable.' }
};
const BD_OBJ = { town: ['barrel', 'lamp', 'crates'], festival: ['barrel', 'lamp'], tourney: ['barrel', 'crates'], colosseum: ['barrel', 'crates'], field: ['hay', 'barrel'], forest: ['boulder', 'barrel'], camp: ['barrel', 'lamp'], mill: ['barrel', 'crates', 'lamp'], dusk: ['hay', 'lamp'], snow: ['pine', 'pine', 'boulder'], crypt: ['boulder', 'lamp'], crystal: ['boulder'], mire: ['boulder'], warren: ['crates', 'boulder'] };
const WOUND = { arm: ['Cut arm', 'ATK −15%'], ankle: ['Twisted ankle', 'dodge/parry timing −15%'], ribs: ['Cracked ribs', 'DEF −25%'] };
const Wounds = {
  list() { G.S.wounds = G.S.wounds || []; return G.S.wounds; },
  has(k) { return this.list().some(w => w.k === k); },
  add(k) { if (this.has(k) || this.list().length >= 2) return false; this.list().push({ k, fights: 3 }); return true; },
  clear(quiet) { if (!this.list().length) return; G.S.wounds = []; if (!quiet) toast('Your wounds are dressed and mending. 🩹', 2400); },
  tick() { const L = this.list(); for (const w of L) w.fights--; const healed = L.filter(w => w.fights <= 0); G.S.wounds = L.filter(w => w.fights > 0); for (const w of healed) toast(`Your ${WOUND[w.k][0].toLowerCase()} has healed.`, 2200); }
};
const CombatX2 = {
  menu(a, L, done, resolve, reopen, add) {
    const B = Battle.B;
    const objs = (B.objs || []).filter(o => !o.used);
    if (objs.length && !B.cfg.leafTrain) add('Environment', 'Use what\'s lying around the battlefield. Takes your turn.', () => this.envMenu(a, objs, done, reopen));
    if (a.isMe && typeof Veil !== 'undefined' && Veil.on()) add('Veil Tricks', "The Red Veil fights dirty — and never kills. Smoke, the scarf, and the knockout blow.", () => this.veilMenu(a, done, reopen));
  },
  envMenu(a, objs, done, reopen) {
    const L = objs.map(o => [OBJ[o.k].name, OBJ[o.k].desc, () => this.useObj(a, o, done)]);
    L.push(['◀ Back', 'Return.', reopen]); Battle.openMenu(L, false);
  },
  async useObj(a, o, done) {
    const BT = Battle, B = BT.B; BT.closeMenu(); o.used = 1;
    const foes = BT.alive('e'), atk = a.atk;
    const hitAll = async (m, brk) => { for (const e of foes) { if (e.ko) continue; BT.resolveHit(a, e, m, 'good', { unblockable: 1, src: 'env', brk }); await wait(90); } };
    if (o.k === 'barrel') { await BT.dash(a, o.x + 30, o.y + 40, 200); sfx('swing'); o.roll = 1; o.rx = o.x; await this.rollTo(o, Math.min(...foes.map(e => e.x)) - 40, 520); await hitAll(1, 25); BT.text({ x: o.x, y: o.y + 40 }, 'CRASH!', '#ffd36a', -10, true); B.shake = 10; }
    else if (o.k === 'lamp') { await BT.dash(a, o.x + 30, o.y + 40, 200); o.fall = 1; sfx('break'); B.blindFoes = 2; B.fireFloor = performance.now(); for (const e of foes) BT.text(e, 'DAZZLED', '#ffcf7a', -40); B.flash = .3; B.flashCol = '255,180,80'; }
    else if (o.k === 'crates' || o.k === 'boulder') {
      const t = await new Promise(r => BT.pickTarget(a, r));
      if (!t) { o.used = 0; return; }
      await BT.dash(a, o.x + 30, o.y + 40, 200); sfx('swing'); o.roll = 1; await this.rollTo(o, t.x + 10, 420);
      BT.resolveHit(a, t, o.k === 'boulder' ? 2.2 : 1.5, 'good', { unblockable: 1, src: 'env', brk: 30 });
      if (o.k === 'crates' && !t.ko) { t.wait += 100 / t.spd; BT.text(t, 'BURIED — loses a turn', '#ffd36a', -44); }
      B.shake = 12; BT.spark(t.x, t.y - 20, '#c8a878', 24);
    }
    else if (o.k === 'hay') { await BT.dash(a, o.x + 10, o.y + 40, 200); a.veil = 1; a.alpha = .45; BT.text(a, 'HIDDEN', '#e8d8a0', -40); sfx('dodge'); await wait(300); }
    else if (o.k === 'pine') { await BT.dash(a, o.x + 30, o.y + 40, 200); sfx('break'); o.shake = performance.now(); B.blindFoes = Math.max(B.blindFoes || 0, 1); for (let i = 0; i < 40; i++) B.fx.push({ x: rnd(Math.min(...foes.map(e => e.x)) - 40, Math.max(...foes.map(e => e.x)) + 40), y: rnd(0, 60), vx: rnd(-.3, .3), vy: rnd(2, 4), life: rnd(500, 900), t: 0, col: '#ffffff', s: rnd(1.5, 3) }); await wait(250); await hitAll(.8, 15); }
    await wait(250); await BT.home(a); done();
  },
  rollTo(o, x, ms) { return new Promise(r => { const x0 = o.x, t0 = performance.now(); const st = () => { const k = Math.min(1, (performance.now() - t0) / ms); o.x = lerp(x0, x, k); o.spin = k * 12; if (k < 1) requestAnimationFrame(st); else { o.gone = 1; r(); } }; st(); }); },
  veilMenu(a, done, reopen) {
    const BT = Battle, B = BT.B;
    const L = [
      ['Smoke Bomb', 'Choking grey smoke. Enemies are dazzled for 2 turns (your dodge/parry windows +30%) and you fade into it.', () => { if (a.mp < 3) return toast('Not enough MP.'); a.mp -= 3; BT.closeMenu(); B.blindFoes = 2; a.veil = 1; a.alpha = .5; sfx('dodge'); for (let i = 0; i < 60; i++) B.fx.push({ x: rnd(0, G.view.w * .6), y: rnd(G.view.h * .35, G.view.h * .8), vx: rnd(-.4, .4), vy: rnd(-.6, -.1), life: rnd(900, 1600), t: 0, col: '#9a9aa0', s: rnd(3, 6) }); BT.text(a, 'SMOKE', '#c8c8d0', -40, true); BT.hud(); setTimeout(done, 600); }, a.mp < 3, 3],
      ['Scarf Lash', 'The red scarf snaps out and tears the weapon from their hand. Their attacks do half damage for 2 turns.', () => { if (a.mp < 2) return toast('Not enough MP.'); BT.pickTarget(a, async t => { a.mp -= 2; BT.closeMenu(); await BT.dash(a, t.x + 70, t.y + 2, 200); sfx('swing'); BT.spark(t.x, t.y - 30, '#ff5a5a', 14); if (t.E.boss || t.E.fixed) BT.text(t, 'HOLDS ON', '#ffcf9a', -40); else { if (!t.disarmed) t.atkBase = t.atk; t.disarmed = 2; t.atk = Math.round((t.atkBase || t.atk) * .5); BT.text(t, 'DISARMED', '#ff8a8a', -40, true); CombatX.shake(t, 25); } BT.hud(); await wait(250); await BT.home(a); done(); }); }, a.mp < 2, 2],
      ['Knockout Blow', 'Only on a foe that is BROKEN or below 35% HP. Land it and they go down OUT COLD — alive. The vale talks about masked mercy.', () => { BT.pickTarget(a, async t => { BT.closeMenu(); await this.knockout(a, t); done(); }); }]
    ];
    L.push(['◀ Back', 'Return.', reopen]); BT.openMenu(L, true);
  },
  async knockout(a, t) {
    const BT = Battle, f = G.S.f;
    await BT.dash(a, t.x + 52, t.y + 2, 220);
    const able = (t.broken || t.hp <= t.maxHp * .35) && !t.E.boss && !t.E.fixed;
    const g = await BT.qte(t, 0, '#ff5a5a', a);
    a.anim = 'slash'; BT.play(a, 'slash', 6, 45);
    if (able && g !== 'miss') {
      sfx('crit'); BT.B.punch = .06; BT.B.punchX = t.x; BT.B.punchY = t.y - 30; BT.B.hitstop = 160;
      t.hp = 0; t.ko = true; t.koOut = 1; t.anim = 'hurt'; t.once = true; t.frame = 0; t.fn = 6; t.fms = 110; t.at = 0; t.loopAnim = 'hurt';
      BT.text(t, 'OUT COLD', '#ff8a8a', -40, true); BT.text(t, '💤', '#fff', -64);
      f.veilKO = (f.veilKO || 0) + 1; if (f.veilKO % 3 === 0 && typeof Veil !== 'undefined') Veil.addFame(1, 'another night, more Registry men waking up tied to lampposts.');
      for (const o of BT.alive('e')) CombatX.shake(o, 30);
      BT.hud();
    } else { BT.text(t, able ? 'MISSED THE CHIN' : 'NOT WEAK ENOUGH', '#bbb', -40); BT.resolveHit(a, t, .5, g, { src: 'attack' }); }
    await wait(300); await BT.home(a);
  }
};

(function () {
  const BT = Battle;
  /* ---------- set the stage ---------- */
  const _run = BT.run.bind(BT);
  BT.run = async function () {
    const B = this.B;
    try {
      if (B && !B.cfg.leafTrain && !B.cfg.tutorial) {
        const key = B.bdKey || window.__bdKey || 'field', kinds = (BD_OBJ[key] || BD_OBJ.field).slice().sort(() => Math.random() - .5).slice(0, 2);
        const W = G.view.w, ys = B.actors.map(a => a.y), my = ys.length ? (Math.min(...ys) + Math.max(...ys)) / 2 : G.view.h * .6;
        const top = ys.length ? Math.min(...ys) : my; B.objs = kinds.map((k, i) => ({ k, x: W * (i ? .56 : .42), y: top - 12 + (i ? 10 : 0) }));
      }
      // wounds you're carrying
      const me = B && B.actors.find(a => a.isMe);
      if (me && !B.cfg.leafTrain && !G.S.kid) {
        for (const w of Wounds.list()) { if (w.k === 'arm') me.atk = Math.round(me.atk * .85); if (w.k === 'ribs') me.def = Math.round(me.def * .75); }
        if (Wounds.list().length) setTimeout(() => { try { BT.text(me, '🩹 ' + Wounds.list().map(w => WOUND[w.k][0]).join(' · '), '#ffb0a0', -80); } catch (e) { } }, 1200);
      }
    } catch (e) { console.warn(e); }
    const r = await _run();
    try { if (r === 'win' && B && !B.cfg.leafTrain) Wounds.tick(); } catch (e) { }
    return r;
  };
  /* ---------- dazzle wears off, disarm wears off ---------- */
  const _et = BT.enemyTurn.bind(BT);
  BT.enemyTurn = async function (e) {
    const B = this.B;
    const r = await _et(e);
    if (e.disarmed) { e.disarmed--; if (!e.disarmed && e.atkBase) { e.atk = e.atkBase; this.text(e, 'RE-ARMED', '#ffcf9a', -40); } }
    if (B.blindFoes > 0 && B.actors.filter(a => a.side === 'e' && !a.ko).pop() === e) { B.blindFoes--; if (!B.blindFoes) this.text(e, 'Their eyes clear', '#ccc', -30); }
    return r;
  };
  /* ---------- wounds from brutal hits ---------- */
  const _dmg = BT.damage.bind(BT);
  BT.damage = function (t, dmg, big) {
    const r = _dmg(t, dmg, big);
    try {
      const B = this.B;
      if (B && t.isMe && !t.ko && !G.S.kid && !B.cfg.leafTrain && !B.cfg.tutorial && dmg >= t.maxHp * .22 && Math.random() < .35 && !B.actors.some(x => x.side === 'e' && x.E && x.E.fixed)) {
        const k = pick(Object.keys(WOUND).filter(x => !Wounds.has(x)));
        if (k && Wounds.add(k)) { this.text(t, `WOUNDED — ${WOUND[k][0]}`, '#ff8a7a', -90, true); if (k === 'arm') t.atk = Math.round(t.atk * .85); if (k === 'ribs') t.def = Math.round(t.def * .75); }
      }
    } catch (e) { }
    return r;
  };
  const _rf = BT.reflex.bind(BT);
  BT.reflex = function (a) { let k = _rf(a); if (a && a.isMe && G.S && Wounds.has('ankle')) k *= .85; return k; };
  /* ---------- draw the battlefield objects ---------- */
  const _r = BT.render.bind(BT);
  BT.render = function (c, t) {
    const B = this.B; if (!B || !B.objs) return _r(c, t);
    // draw the props first (behind the fighters) by painting before the original frame's actors… the backdrop is drawn inside _r,
    // so we draw objects after, but only those not overlapping fighters will read clearly — they sit in the empty middle ground.
    _r(c, t);
    const PI = G.img.props, P = G.props, s = 1.15;
    for (const o of B.objs) {
      if (o.gone && o.k !== 'lamp') continue;
      const md = P[OBJ[o.k].prop]; if (!md) continue; const [sx, sy, sw, sh] = md.r;
      c.save(); c.translate(o.x, o.y);
      if (o.fall) c.rotate(-1.35);
      if (o.roll) c.rotate(o.spin || 0);
      if (o.shake) c.translate(Math.sin((performance.now() - o.shake) / 30) * Math.max(0, 4 - (performance.now() - o.shake) / 150), 0);
      c.globalAlpha = (o.used && !o.fall && !o.roll && o.k !== 'pine' ? .25 : 1) * (B.duelZoom ? .15 : 1);
      c.drawImage(PI, sx, sy, sw, sh, -md.ax * s, -md.ay * s, sw * s, sh * s);
      c.restore();
      if (!o.used && Battle.menuL && Battle.menuL.some(x => x[0] === 'Environment')) { c.save(); c.globalAlpha = .6 + .3 * Math.sin(t / 200); c.fillStyle = '#ffd36a'; c.font = '900 10px "Nunito"'; c.textAlign = 'center'; c.fillText('✋', o.x, o.y - md.ay * s - 6); c.restore(); }
    }
    if (B.fireFloor && performance.now() - B.fireFloor < 2500 * 3) { const k = (performance.now() - B.fireFloor) / 7500; c.save(); c.globalCompositeOperation = 'lighter'; for (let i = 0; i < 10; i++) { const x = G.view.w * (.15 + i * .04), y = (B.objs[0] ? B.objs[0].y : 0) + 60 + Math.sin(i * 2.3) * 14, fl = .5 + .5 * Math.sin(t / 80 + i); const g = c.createRadialGradient(x, y, 0, x, y, 16); g.addColorStop(0, `rgba(255,160,60,${.5 * (1 - k) * fl})`); g.addColorStop(1, 'rgba(255,160,60,0)'); c.fillStyle = g; c.fillRect(x - 16, y - 16, 32, 32); } c.restore(); }
  };
})();
// nights at inns and Maren's care mend wounds
(function () {
  if (typeof talkMaren === 'function') { const _m = talkMaren; talkMaren = async function () { const r = await _m(); try { if (Wounds.list().length) { await narr('Maren cleans and binds your wounds without asking how you got them.'); Wounds.clear(); } } catch (e) { } return r; }; }
  setInterval(() => { try { const el = document.getElementById('clk'); if (el && el.style.display !== 'none' && G.S && (G.S.wounds || []).length && !el.textContent.includes('🩹')) el.textContent += ` · 🩹 ${G.S.wounds.map(w => WOUND[w.k][0]).join(', ')}`; } catch (e) { } }, 500);
})();
