'use strict';
/* =====================================================================================
   ENEMY AI III — living fights  (Chat A)   · loads after enemyai2.js
   1 ENEMY ITEMS      bandits carry a potion, a smoke bomb or caltrops — kill them first and you loot what's left
   2 RIVAL HUNTER     Idris Kell, Registry tracker: turns up in random fights, retreats, comes back stronger (4 meetings)
   3 REVENGE          when a hero falls, the nearest ally strikes the killer at once and acts next
   4 WEATHER          rain: fire weak, lightning strong, nothing burns · fog: enemy HP hidden · night: stalkers vanish
   5 ECOLOGY          lupines bolt from drakes · a dying goblin gets knifed by its "friend"
   6 WOUNDED          enemies under 20% limp (slower); if one BLEEDS OUT you get extra loot
   7 AMBUSH TELLS     something glints in the trees — tap it to catch the lurker stunned, or it ambushes you
   8 BOUNTY HEAT      showy Art use gets noticed; Registry Sealers start appearing with seal stones that drain MP
   9 TAUNT DUELS      a glory-hound calls Ren out: accept a fair 1-on-1 for double pay, refuse and the gang gets angry
   10 PACK TACTICS    3+ lupines circle you: more attacks come FROM BEHIND (dodge only)
   ===================================================================================== */
const AI3 = {
  WOLF: /lupine|wolf/, DRAKE: /drake|wyrm/, GOB: /goblin/, STALK: /catcher|knife|rook|hunter|thief|cutpurse|shade|stalker/,
  ITEMS: { potion: ['🧪', 'Potion'], smoke: ['💨', 'Smoke bomb'], caltrops: ['⚙', 'Caltrops'] },
  k(e) { return (e.key || '') + ' ' + AI.img(e); },
  outdoors(B) { return !/cave|crypt|warren|crystal|mine|^d_|vault|shrine|cinder|sewer|in_|registry/.test(B.bdKey || ''); },
  weather() { try { return WorldFeel.weather(); } catch (e) { return 'clear'; } },
  night() { try { return Ambient.phase() === 'Night'; } catch (e) { return false; } },
  // the rival
  KELL: ['Idris Kell, Crown Registry. You\'re on my list, Drag. Let\'s see what you\'re worth.',
    'Kell again. I studied you. Your left side is slow.', 'Third time. I brought better steel — and I stopped sleeping.',
    'No more retreats. One of us walks away from this, Drag.'],
  KELL_OUT: ['"Hm. Worth the bounty. I\'ll be back."', '"Not bad. Next time I won\'t hold back."', '"…You\'re getting stronger. So am I."'],
  rival(lv) { const b = ENEMY.stone_hunter || ENEMY.catcher;
    ENEMY.rival_kell = Object.assign({}, b, { name: 'Idris Kell', trait: 'Registry tracker — learns you, comes back stronger', hp: 95 + lv * 45, atk: 13 + lv * 2, def: 4 + lv, spd: 12 + lv,
      dodge: .2 + lv * .03, parry: .2 + lv * .03, brk: 50 + lv * 10, xp: 40 + lv * 25, gold: 30 + lv * 15, pers: 'hunter' }); return 'rival_kell'; },
  draw(c, BT) {
    const B = BT.B; if (!B || AI.off(B)) return; const now = performance.now(), W = G.view.w, FH = G.view.fullH || G.view.h;
    c.save();
    if (B.wx === 'rain') { c.strokeStyle = 'rgba(170,200,255,.35)'; c.lineWidth = 1.2; c.beginPath(); for (let i = 0; i < 70; i++) { const x = (i * 53 + now * .55) % (W + 60) - 30, y = (i * 91 + now * 1.3) % FH; c.moveTo(x, y); c.lineTo(x - 6, y + 16); } c.stroke(); }
    if (B.wx === 'fog') { const g = c.createLinearGradient(0, FH * .25, 0, FH * .85); g.addColorStop(0, 'rgba(220,225,230,0)'); g.addColorStop(.5, `rgba(220,225,230,${.22 + Math.sin(now / 900) * .04})`); g.addColorStop(1, 'rgba(220,225,230,.08)'); c.fillStyle = g; c.fillRect(0, 0, W, FH); }
    if (B.smoke > 0) { c.fillStyle = `rgba(150,150,150,${.18 + Math.sin(now / 300) * .04})`; c.fillRect(0, 0, W, FH); }
    if (B.calt > 0) { c.fillStyle = '#9aa3ad'; for (const p of BT.alive('p')) for (let i = 0; i < 5; i++) { const x = p.x - 30 + i * 15, y = p.y + 4 + (i % 2) * 5; c.beginPath(); c.moveTo(x, y - 4); c.lineTo(x + 4, y + 2); c.lineTo(x - 4, y + 2); c.fill(); } }
    if (B.lurk && !B.lurk.done) { const L = B.lurk, k = .5 + Math.sin(now / 160) * .5; c.globalCompositeOperation = 'lighter'; c.fillStyle = `rgba(255,250,210,${.25 + k * .55})`;
      c.beginPath(); for (const [dx, dy, r] of [[0, 0, 3], [5, -2, 1.5]]) { c.moveTo(L.x + dx + r, L.y + dy); c.arc(L.x + dx, L.y + dy, r + k * 1.5, 0, 7); } c.fill();
      c.strokeStyle = `rgba(255,250,210,${.3 * k})`; c.lineWidth = 1; c.beginPath(); c.moveTo(L.x - 8, L.y); c.lineTo(L.x + 8, L.y); c.moveTo(L.x, L.y - 8); c.lineTo(L.x, L.y + 8); c.stroke(); c.globalCompositeOperation = 'source-over'; }
    c.font = '800 11px Nunito, sans-serif'; c.textAlign = 'center';
    for (const e of BT.alive('e')) {
      if (B.wx === 'fog' && !e.cmd && !B.clashOn) { const x = e.x - 22, y = e.y - 76; c.fillStyle = 'rgba(120,125,130,.95)'; c.fillRect(x - 1, y - 1, 46, 9); c.fillStyle = '#e8eef3'; c.font = '800 8px Nunito, sans-serif'; c.fillText('? ? ?', e.x, y + 6); c.font = '800 11px Nunito, sans-serif'; }
      if (e.item) { c.font = '15px sans-serif'; c.fillText(this.ITEMS[e.item][0], e.x + 34, e.y - 40); c.font = '800 11px Nunito, sans-serif'; }
      if (e.limp) { c.fillStyle = '#ffb0a0'; c.fillText('LIMPING', e.x, e.y + (e.back ? 32 : e.cmd ? 32 : 17) + (e.back && e.cmd ? 15 : 0)); }
      if (e.hid) { c.fillStyle = '#b9a6ff'; c.fillText('◌ HIDDEN', e.x, e.y + 17); }
    }
    if (B.duel) { c.font = '900 13px Nunito, sans-serif'; const t = `⚔ DUEL — ${B.duel.e.name} vs Ren · nobody interferes`; const w = c.measureText(t).width + 22; c.fillStyle = 'rgba(20,10,6,.8)'; c.fillRect(W / 2 - w / 2, 80, w, 22); c.fillStyle = '#ffd36a'; c.fillText(t, W / 2, 96); }
    c.restore();
  }
};

(function () {
  const BT = Battle;
  const tip = (B, k, s) => { B.tips = B.tips || {}; if (B.tips[k] || (G.S.f.ai2tip || {})[k]) return; B.tips[k] = 1; G.S.f.ai2tip = G.S.f.ai2tip || {}; G.S.f.ai2tip[k] = 1; setTimeout(() => toast(s, 4200), 300); };
  const plain = BT => !BT.alive('e').some(e => AI.isBoss(e) || (e.E && (e.E.fixed || e.E.boss))) && !(BT.B.cfg || {}).boss;

  // AI2.shielded also covers night stalkers that vanished
  const _sh = AI2.shielded.bind(AI2);
  AI2.shielded = function (e) { if (_sh(e)) return true; const B = Battle.B; if (!B || AI.off(B) || !e || !e.hid || e.ko) return false; return Battle.alive('e').some(x => x !== e && !x.hid); };

  // ---------------- fight setup ----------------
  const _run = BT.run.bind(BT);
  BT.run = async function () {
    const B = this.B;
    if (B && !B.ai3Init && !AI.off(B)) {
      B.ai3Init = 1; G.S.f.ai3n = (G.S.f.ai3n || 0) + 1;
      const E = this.alive('e'), free = AI2.free(this), W = G.view.w, FH = G.view.fullH || G.view.h, out = AI3.outdoors(B);
      // WEATHER
      const w = out ? AI3.weather() : 'clear'; B.wx = w === 'rain' || w === 'storm' ? 'rain' : w === 'fog' ? 'fog' : null; B.night = out && AI3.night();
      if (B.wx === 'rain') { B.fireT = -1; tip(B, 'rain', '<b style="color:#9fc4ff">RAIN</b> — fire attacks are weak, lightning is strong, and nothing catches fire.'); }
      if (B.wx === 'fog') tip(B, 'fog', '<b style="color:#dfe6ea">FOG</b> — you can\'t see how hurt the enemies are.');
      if (B.night) for (const e of E) if (AI3.STALK.test(AI3.k(e)) || ['trickster', 'hunter'].includes(AI.persOf(e))) e.stalk = 1;
      // ECOLOGY: lupines bolt from a drake
      if (E.some(e => AI3.DRAKE.test(AI3.k(e)))) { const wolves = E.filter(e => AI3.WOLF.test(AI3.k(e)) && !AI.isBoss(e)).filter(() => Math.random() < .5);
        if (wolves.length) { for (const e of wolves) { e.ko = true; e.fled = 1; e.spared = 1; e.alpha = 0; } await this.msg(`The lupines catch the drake's scent — ${wolves.length > 1 ? 'they bolt' : 'one bolts'} into the trees!`, 1400); } }
      // ENEMY ITEMS
      if (plain(this)) for (const e of E) if (!e.ko && AI2.human(e) && Math.random() < .35) e.item = pick(['potion', 'potion', 'smoke', 'caltrops']);
      if (E.some(e => e.item)) tip(B, 'items', '<b>🧪 ENEMY ITEMS</b> — some enemies carry a potion, smoke bomb or caltrops. Kill them before they use it and you loot it.');
      if (free) {
        const humans = E.filter(e => !e.ko && AI2.human(e)), me = this.me && this.me();
        // TAUNT DUEL
        const champ = humans.find(e => ['glory', 'duelist'].includes(AI.persOf(e)));
        if (champ && me && !me.ko && E.length >= 2 && Math.random() < .3) {
          const c = await ask(null, null, `${champ.name} steps forward: "You, Drag! One on one — or are you a coward?"`, ['Accept the duel (double pay)', 'Refuse — fight them all']); Dlg.close();
          if (c === 0) { const outE = E.filter(e => e !== champ && !e.ko), outP = this.alive('p').filter(a => a !== me);
            B.duel = { e: champ, outE, outP, pay: outE.reduce((s, e) => s + ((e.E && e.E.gold) || 8), 0) + ((champ.E && champ.E.gold) || 8) };
            B.actors = B.actors.filter(a => !outE.includes(a) && !outP.includes(a)); this.hud();
            await this.msg('The others step back. A fair fight.', 1100); }
          else { for (const e of E) { e.atk = Math.round(e.atk * 1.1); e.wait *= .5; this.text(e, 'SCORNED', '#ff6a5a', -30); } await this.msg(`"Coward!" The whole gang comes at you.`, 1100); }
        }
        // RIVAL: Idris Kell
        const R = G.S.rival = G.S.rival || { lv: 0, last: -99 };
        if (!B.duel && !R.done && G.S.f.ai3n >= 8 && G.S.f.ai3n - R.last >= 6 && E.length < 4 && Math.random() < .12) {
          R.last = G.S.f.ai3n; await this.summon(AI3.rival(R.lv), 'RIVAL'); const k = B.actors[B.actors.length - 1]; k.rival = 1; k.pers = 'hunter';
          AI2.say(this, k, AI3.KELL[Math.min(3, R.lv)]); await this.msg(`Idris Kell, Registry tracker, joins the fight!${R.lv ? ' (meeting ' + (R.lv + 1) + ')' : ''}`, 1600); this.hud();
        }
        // BOUNTY HEAT: a Registry Sealer
        if (!B.duel && (G.S.heat || 0) >= 3 && humans.length && E.length < 4 && Math.random() < .35 && ENEMY.reg_man) {
          await this.summon('reg_man', 'BOUNTY'); const s = B.actors[B.actors.length - 1]; s.name = 'Registry Sealer'; s.sealer = 1;
          await this.msg('A Registry Sealer — they\'ve heard about your Arts.', 1300);
          tip(B, 'heat', '<b style="color:#ff8a6a">BOUNTY HEAT</b> — flashy Arts get talked about. Sealers drain your MP with seal stones; kill them to get it back.');
        }
        // AMBUSH TELL: a lurker in the trees
        const lk = E.filter(e => !e.ko && !AI.isBoss(e))[0];
        if (!B.duel && out && lk && E.length < 4 && Math.random() < .22) { B.lurk = { key: lk.key, x: W * (.08 + Math.random() * .22), y: FH * (.36 + Math.random() * .08), turns: 0 }; await this.msg('…something glints between the trees.', 900); }
      }
    }
    const r = await _run();
    try {
      if (B && B.ai3Init) {
        if ((B.ai3arts || 0) >= 2 && AI2.free(this)) G.S.heat = Math.min(6, (G.S.heat || 0) + 1);
        if (B.duel && r === 'win') { const g = B.duel.pay * 2; G.S.gold += g; setTimeout(() => toast(`<b style="color:#ffd36a">Duel won.</b> The gang pays up — honour among thieves. (+${g}g)`, 3800), 1000); }
      }
    } catch (x) { console.warn(x); }
    return r;
  };

  // ---------------- tap the glint ----------------
  const _tap = BT.tapAt.bind(BT);
  BT.tapAt = function (x, y) { const B = this.B; if (B && B.lurk && !B.lurk.done && !B.targeting && Math.hypot(x - B.lurk.x, y - B.lurk.y) < 60) { reveal(this, true); return; } return _tap(x, y); };
  async function reveal(BT, spotted) {
    const B = BT.B, L = B.lurk; if (!L || L.done) return; L.done = 1;
    if (BT.alive('e').length >= 4) { await BT.msg(spotted ? 'You spot the lurker — it slinks away.' : 'The lurker thinks better of it.', 900); return; }
    await BT.summon(L.key, spotted ? 'SPOTTED!' : 'AMBUSH!'); const a = B.actors[B.actors.length - 1];
    if (spotted) { a.broken = 1; a.brk = a.brkMax; sfx('break'); BT.text(a, 'CAUGHT OFF GUARD — STUNNED', '#9be37a', -60, true); }
    else { a.wait = -1; a.ambush = 1; sfx('alarm'); BT.text(a, 'AMBUSH!', '#ff5050', -60, true); tip(B, 'lurk', '<b>AMBUSH</b> — when something glints in the background at the start of a fight, tap it to catch the lurker.'); }
    BT.hud();
  }

  // ---------------- party turn: caltrops, MP-spend tracking, lurker timer ----------------
  const _pt = BT.playerTurn.bind(BT);
  BT.playerTurn = async function (a) {
    const B = this.B; if (!B || AI.off(B)) return _pt(a);
    if (B.calt > 0 && a && !a.ko) { B.calt--; const d = Math.max(1, Math.round(a.maxHp * .03)); a.hp = Math.max(1, a.hp - d); this.text(a, 'CALTROPS -' + d, '#c8d0d8', -20); this.hud(); }
    if (B.lurk && !B.lurk.done && ++B.lurk.turns >= 3) await reveal(this, false);
    const mp0 = a && a.mp; const r = await _pt(a); if (a && a.mp < mp0) B.ai3arts = (B.ai3arts || 0) + 1; return r;
  };

  // ---------------- enemy turn ----------------
  const _et = BT.enemyTurn.bind(BT);
  BT.enemyTurn = async function (e) {
    const B = this.B; if (!B || AI.off(B) || !e || e.side !== 'e' || (e.E && e.E.fixed)) return _et(e);
    e.hid = 0; e.alpha = 1;
    // WOUNDED: a limping enemy can bleed out
    if (e.limp) { const tick = (e.bleed > 0 ? e.bleedDmg || 3 : 0) + (e.poison > 0 ? e.poisonDmg || 3 : 0) + (B.fireT > 0 ? Math.round(e.maxHp * .04) : 0);
      if (tick && e.hp <= tick) { this.text(e, 'BLED OUT', '#ff4a4a', -40, true); e.bledOut = 1; this.damage(e, e.hp + 1, false);
        const g = Math.round(((e.E && e.E.gold) || 8) * 1.5); G.S.gold += g; let s = `+${g}g`; if (Math.random() < .35) { G.S.items.tonic = (G.S.items.tonic || 0) + 1; s += ', a Tonic'; }
        setTimeout(() => toast(`<b style="color:#ff8a8a">${esc(e.name)} bled out.</b> Clean kill, extra loot (${s}).`, 3000), 300); this.hud(); return; } }
    // ECOLOGY: goblins knife their own
    if (AI3.GOB.test(AI3.k(e)) && e.hp < e.maxHp * .3 && !B.betrayed) { const g = this.alive('e').find(x => x !== e && AI3.GOB.test(AI3.k(x)) && !x.broken);
      if (g && Math.random() < .3) { B.betrayed = 1; AI2.say(this, g, pick(['More for me!', 'Your share is MINE now.', 'Sorry, cousin. Business.'])); await this.msg(`${g.name} stabs ${e.name} in the back and grabs its loot!`, 1400);
        this.damage(e, e.hp + 1, true); g.atk = Math.round(g.atk * 1.15); g.hp = Math.min(g.maxHp, g.hp + Math.round(g.maxHp * .15)); this.text(g, 'GREEDY — ATK UP', '#9be37a', -40); this.hud(); return; } }
    // ENEMY ITEMS
    if (e.item === 'potion' && e.hp < e.maxHp * .4) { e.item = null; const h = Math.round(e.maxHp * .35); e.hp = Math.min(e.maxHp, e.hp + h); sfx('heal'); this.text(e, '+' + h, '#9be37a', -30); await this.msg(`${e.name} gulps a potion!`, 1000); this.hud(); return; }
    e.iT = (e.iT || 0) + 1;
    if (e.item === 'smoke' && e.iT >= 2 && !(B.smoke > 0) && Math.random() < .45) { e.item = null; B.smoke = 3; sfx('dodge'); await this.msg(`${e.name} throws a smoke bomb — their attacks are harder to read!`, 1300); return; }
    if (e.item === 'caltrops' && e.iT >= 1 && !(B.calt > 0) && Math.random() < .45) { e.item = null; B.calt = 5; await this.msg(`${e.name} scatters caltrops — your fighters get cut each turn!`, 1300); return; }
    // BOUNTY: the seal stone
    if (e.sealer && !e.sealed) { e.sealed = 1; B.sealDrain = []; for (const p of this.alive('p')) { const d = Math.floor((p.mp || 0) * .5); if (d > 0) { p.mp -= d; B.sealDrain.push([p, d]); this.text(p, 'SEALED -' + d + ' MP', '#b9a6ff', -30); } }
      sfx('alarm'); AI2.say(this, e, 'By order of the Registry — be still, Drag.'); await this.msg('The Sealer raises a seal stone — half your MP is locked away! Kill it to get it back.', 1500); this.hud(); return; }
    await _et(e);
    if (B.smoke > 0) B.smoke--;
    // NIGHT: stalkers melt back into the dark
    if (B.night && e.stalk && !e.ko && Math.random() < .6 && this.alive('e').some(x => x !== e && !x.hid)) { e.hid = 1; e.alpha = .3; this.text(e, 'vanishes into the dark', '#b9a6ff', -30);
      tip(B, 'night', '<b style="color:#b9a6ff">NIGHT</b> — stalkers vanish between turns and can\'t be targeted. Area attacks still find them.'); }
  };

  // ---------------- smoke: harder to read attacks ----------------
  const _rx = BT.reflex.bind(BT);
  BT.reflex = function (a) { const k = _rx(a), B = this.B; return B && B.smoke > 0 && a && a.side === 'p' ? k * .8 : k; };

  // ---------------- strikes: weather element, pack tactics, ambush hit ----------------
  const _es = BT.enemyStrike.bind(BT);
  BT.enemyStrike = async function (e, t, sk, isCounter) {
    const B = this.B; if (!B || AI.off(B) || !e || e.side !== 'e' || !sk || !sk.hits) return _es(e, t, sk, isCounter);
    let el = null; try { el = typeof elOf === 'function' ? elOf(sk) : null; } catch (x) { }
    B.ai3el = el;
    if (!isCounter) {
      const wolves = this.alive('e').filter(x => AI3.WOLF.test(AI3.k(x)));
      const behind = e.ambush || (AI3.WOLF.test(AI3.k(e)) && wolves.length >= 3 && Math.random() < .12 * wolves.length);
      if (behind) { e.ambush = 0; sk = Object.assign({}, sk, { hits: sk.hits.map(h => Object.assign({}, h, { unp: 1, proj: undefined })) }); this.text(e, 'FROM BEHIND! — DODGE', '#ff5050', -70, true);
        if (wolves.length >= 3) tip(B, 'pack', '<b>PACK TACTICS</b> — the more lupines alive, the more they circle behind you. Those attacks can only be dodged. Thin the pack.'); }
    }
    try { return await _es(e, t, sk, isCounter); } finally { B.ai3el = null; }
  };

  // ---------------- damage: weather, revenge, wounded, loot, rival, duel, sealer ----------------
  const _dm = BT.damage.bind(BT);
  BT.damage = function (t, dmg, big) {
    const B = this.B; if (!B || AI.off(B) || !t || !(dmg > 0)) return _dm(t, dmg, big);
    if (B.wx === 'rain' && t.side === 'p' && B.ai3el) dmg = Math.max(1, Math.round(dmg * (B.ai3el === 'fire' ? .7 : B.ai3el === 'lightning' ? 1.25 : 1)));
    const killer = B.curAtk, was = !t.ko;
    // the rival never dies early: he retreats
    if (t.rival && !t.ko && t.hp - dmg < t.maxHp * .25 && (G.S.rival.lv || 0) < 3) { dmg = Math.max(0, t.hp - Math.ceil(t.maxHp * .25)); }
    const r = _dm(t, dmg, big);
    if (t.side === 'p' && was && t.ko && killer && !killer.ko) revenge(this, t, killer);
    if (t.side === 'e') {
      if (!t.ko && !t.limp && !AI.isBoss(t) && !t.rival && t.hp < t.maxHp * .2) { t.limp = 1; t.spd = Math.round(t.spd * .75 * 10) / 10; this.text(t, 'LIMPING', '#ffb0a0', -45); }
      if (t.rival && !t.ko && t.hp <= t.maxHp * .25 + 1 && !t.out) rivalOut(this, t);
      if (was && t.ko) {
        if (t.item) { const it = t.item; t.item = null; if (it === 'potion') { G.S.items.tonic = (G.S.items.tonic || 0) + 1; this.text(t, 'LOOTED: TONIC', '#9be37a', -60); } else { G.S.gold += 8; this.text(t, `LOOTED: ${AI3.ITEMS[it][1].toUpperCase()} (+8g)`, '#ffd36a', -60); } }
        if (t.sealer) { for (const [p, d] of (B.sealDrain || [])) if (!p.ko) { p.mp = Math.min(p.maxMp, p.mp + d); this.text(p, '+' + d + ' MP', '#7ad8ff', -30); } B.sealDrain = null; G.S.heat = Math.max(0, (G.S.heat || 0) - 2); this.text(t, 'SEAL BROKEN', '#7ad8ff', -70, true); }
        if (t.rival && !t.fled && G.S.rival && !G.S.rival.done) { G.S.rival.done = 'killed'; setTimeout(() => toast('<b>Idris Kell</b> is dead. The Registry will send someone worse.', 3800), 800); }
        if (B.duel && t === B.duel.e) duelEnd(this, true);
      }
      this.hud();
    }
    if (t.side === 'p' && was && t.ko && t.isMe && B.duel) duelEnd(this, false);
    return r;
  };
  function revenge(BT, fallen, killer) {
    const B = BT.B, P = BT.alive('p').filter(a => a !== fallen); if (!P.length) return;
    const av = P.sort((a, b) => Math.hypot(a.x - fallen.x, a.y - fallen.y) - Math.hypot(b.x - fallen.x, b.y - fallen.y))[0];
    const d = Math.max(1, Math.round(av.atk * 1.6 - (killer.def || 0)));
    setTimeout(() => { if (!BT.B || killer.ko) return; BT.text(av, 'REVENGE!', '#ff6a5a', -70, true); BT.spark(killer.x, killer.y - 40, '#ff6a5a', 20); B.shake = 10; sfx('hit'); BT.damage(killer, d, true); BT.text(killer, '-' + d, '#ff6a5a', -30); }, 500);
    av.wait = -1; tip(B, 'rev', '<b style="color:#ff6a5a">REVENGE</b> — when a hero falls, the nearest ally strikes the killer at once and acts next.');
  }
  async function rivalOut(BT, k) {
    const B = BT.B, R = G.S.rival; k.out = 1;
    if (R.lv >= 3) return;
    k.ko = true; k.fled = 1; k.spared = 1; k.alpha = 0; AI2.say(BT, k, AI3.KELL_OUT[Math.min(2, R.lv)]); R.lv++;
    const g = 30 + R.lv * 15; G.S.gold += g; BT.text(k, 'RETREATS', '#ffd36a', -60, true);
    setTimeout(() => toast(`<b>Idris Kell</b> retreats. He'll be back — stronger. (+${g}g from his dropped purse)`, 3800), 600); BT.hud();
  }
  // final meeting: he yields instead of dying
  const _dm2 = BT.damage;
  BT.damage = function (t, dmg, big) {
    const B = this.B;
    if (B && t && t.rival && !t.ko && G.S.rival && G.S.rival.lv >= 3 && !t.yielded && t.hp - dmg <= 0) { t.yielded = 1; t.hp = 1; yieldKell(this, t); return; }
    return _dm2.call(this, t, dmg, big);
  };
  async function yieldKell(BT, k) {
    await wait(300); const c = await ask(null, null, 'Idris Kell drops to one knee. "Go on, Drag. Finish it. That\'s what they say you are."', ['Spare him', 'Finish it']); Dlg.close();
    if (c === 0) { k.ko = true; k.fled = 1; k.spared = 1; k.alpha = 0; G.S.rival.done = 'spared'; try { Opinion.add('hope', .3); } catch (x) { } G.S.gold += 90;
      setTimeout(() => toast('<b>Kell walks away.</b> "…The list was wrong about you." He leaves you his purse (+90g).', 4200), 400); }
    else { k.yielded = 2; _dm2.call(BT, k, 99, true); G.S.gold += 90; }
    BT.hud();
  }
  function duelEnd(BT, won) {
    const B = BT.B, D = B.duel; if (!D || D.over) return; D.over = 1;
    for (const a of D.outP) if (!B.actors.includes(a)) B.actors.push(a);
    if (won) { BT.text(BT.me(), 'DUEL WON', '#ffd36a', -80, true); for (const e of D.outE) { e.ko = true; e.fled = 1; e.spared = 1; } setTimeout(() => BT.msg('The others honour the duel and leave.', 1200), 300); }
    else { B.duel = null; for (const e of D.outE) if (!B.actors.includes(e)) { B.actors.push(e); e.wait = 0; } setTimeout(() => BT.msg('Ren falls — the gang closes in!', 1200), 300); }
    BT.hud();
  }

  // ---------------- draw ----------------
  const _r = BT.render.bind(BT);
  BT.render = function (c, t) { const out = _r(c, t); try { AI3.draw(c, this); } catch (x) { } return out; };
})();
