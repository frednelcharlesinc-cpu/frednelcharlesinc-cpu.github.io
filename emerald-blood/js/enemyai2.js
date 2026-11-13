'use strict';
/* =====================================================================================
   ENEMY AI II — the battlefield fights back  (Chat A)   · loads after enemyai.js
   1 BOSS PHASES     at 66% and 33% HP: a line, a power-up, new moves (Frenzy, a telegraphed LAST STAND), arena hazards
   2 READING YOU     bosses, elites and duelists learn your habit: 3 parries in a row → it throws an unparryable;
                     3 dodges in a row → it delays its swings to bait your early dodge
   3 BACK ROW        casters/archers stand behind the front line: single attacks can't reach them until every
                     front-liner is down or BROKEN. Area attacks still hit them.
   4 WAR HORNS       a horn-blower raises a horn (telegraphed) and calls REINFORCEMENTS on its next turn — hit it hard
                     or stun it first
   5 COMMANDERS      the leader of a big group gives orders: FOCUS a hero, SHIELDS UP, PRESS THEM, HOLD THE LINE.
                     A heavy hit on the commander breaks the order.
   6 THE FIELD       fire spreads from fire attacks (burns everyone), rockfalls in caves / boss arenas (mark → land,
                     can hit enemies too), CAPTIVES in bandit fights (save them for gold and the vale's hope)
   7 GRUDGES         enemies that run away come back later, scarred and angry
   ===================================================================================== */
const AI2 = {
  NOPHASE: /^(halvard|halvard_pro|kairo_duel|vane_leaf)$/,
  BACK: /shaman|hexer|archer|acolyte|priest|mage|caster|crossbow|bowman|witch|seer|cultist/,
  HUMAN: /bandit|rook|reg_|guard|bq_|hound|knife|catcher|tollman|cleaner|acolyte|crew_|stone_hunter|glad_|wc_|inq_|m_goblin|m_orc|m_ratfolk/,
  SCARS: ['Scarred', 'One-Eyed', 'Burned', 'Limping', 'Grudge-Bearer', 'Twice-Beaten'],
  CAPTIVE: ['folk0', 'folk7', 'folk10', 'dfolk2', 'folk6'],
  PH: {
    2: { coward: ['S-stop! …Fine! FINE! No more Mister Nice!'], brute: ['ENOUGH! Now I stop holding back!', 'You made me BLEED. Now you die.'],
      duelist: ['…Fine. No more courtesy.', 'Now I fight you for real.'], trickster: ['Okay, playtime\'s over.', 'You want my real tricks? Here.'],
      zealot: ['The light burns brighter in me!', 'I am the Verdict!'], hunter: ['Now you smell like prey.'], protector: ['I will NOT fall here!'],
      glory: ['YES! THIS is the fight they\'ll sing about!'], beast: ['*the ground shakes as it roars*', '*its eyes burn red*'] },
    3: { coward: ['I\'ll take you ALL with me!'], brute: ['I\'M NOT DONE! I\'M NOT DONE!'], duelist: ['Everything I have. Now.'], trickster: ['No more games!'],
      zealot: ['Take my life, light — and give me THEIRS!'], hunter: ['One of us dies here.'], protector: ['Last stand. Nobody passes.'],
      glory: ['My NAME! They will remember my NAME!'], beast: ['*a deafening, desperate howl*'] }
  },
  ORDERS: { focus: ['Focus the', '#ff6a5a'], shields: ['Shields up!', '#7ad8ff'], press: ['Press them! NOW!', '#ffb04a'], rally: ['Hold the line!', '#9be37a'] },
  free(BT) { const B = BT.B, c = B.cfg || {}; return !c.noFlee && !c.onTurn && !c.boss && !c.raid && !c.bout && !c.spar && !c.mind && !c.tutorial && !c.leafTrain && !c.story && !c.noWaves && !G.S.kid
    && !BT.alive('e').some(e => AI.isBoss(e) || (e.E && (e.E.fixed || e.E.boss))); },
  human(e) { return !AI.beast(e) && this.HUMAN.test(AI.img(e) + ' ' + e.key); },
  isBack(e) { if (AI.isBoss(e) || (e.E && e.E.fixed)) return false; if (this.BACK.test(AI.img(e) + ' ' + e.key)) return true;
    const s = ((e.E && e.E.skills) || []).filter(s => s.hits)[0]; return !!(s && s.hits.length && s.hits.every(h => h.anim === 'spellcast' || h.proj)); },
  shielded(e) { const BT = Battle, B = BT.B; if (!B || AI.off(B) || !e || !e.back || e.ko) return false; return BT.alive('e').some(x => !x.back && !x.broken && !x.panic); },
  bossy(BT, e) { if (AI.isBoss(e)) return true; const B = BT.B; if (!B || !B.cfg || !B.cfg.boss) return false; const E = B.actors.filter(a => a.side === 'e'); return E.slice().sort((a, b) => b.maxHp - a.maxHp)[0] === e; },
  reader(e) { return AI2.bossy(Battle, e) || AI.tierI(e) >= 3 || AI.persOf(e) === 'duelist'; },
  base(e) { return (e.name || '').replace(/ [A-D]$/, ''); },
  say(BT, e, s) { const B = BT.B; if (!B || !e) return; B.lastBark = performance.now(); (B.barks = B.barks || []).push({ a: e, s, t0: performance.now(), life: 2600 }); },
  phaseLine(e, n) { const E = e.E || {}; if (E['phase' + n]) return E['phase' + n]; const set = this.PH[n], p = AI.beast(e) ? 'beast' : (AI.persOf(e) || 'brute'); return pick(set[p] || set.brute); },
  skills(e) {
    const L = ((e.E && e.E.skills) || []).filter(s => s.hits && s.hits.length); if (!L.length) return null;
    const pow = s => s.hits.reduce((a, h) => a + (h.m || 1), 0), big = L.slice().sort((a, b) => pow(b) - pow(a))[0], basic = L[0];
    const frenzy = { name: 'Frenzy', hits: basic.hits.concat(big.hits).slice(0, 4).map(h => Object.assign({}, h, { m: (h.m || 1) * .85, unp: 0 })) };
    const last = { name: 'LAST STAND', hits: [Object.assign({}, big.hits[0], { m: (big.hits[0].m || 1) * 1.6, unp: 1, proj: undefined })] };
    return { frenzy, last };
  },
  // draw labels / markers / fire / captive
  draw(c, BT) {
    const B = BT.B; if (!B || AI.off(B)) return; const now = performance.now(), W = G.view.w, FH = G.view.fullH || G.view.h, S = typeof BT_SCALE !== 'undefined' ? BT_SCALE : 1;
    c.save();
    if (B.fireT > 0) { const g = c.createLinearGradient(0, FH * .5, 0, FH * .9); const f = .18 + Math.sin(now / 90) * .05; g.addColorStop(0, 'rgba(255,90,20,0)'); g.addColorStop(.5, `rgba(255,110,30,${f})`); g.addColorStop(1, `rgba(255,60,10,${f * .7})`);
      c.globalCompositeOperation = 'lighter'; c.fillStyle = g; c.fillRect(0, FH * .5, W, FH * .4);
      for (let i = 0; i < 14; i++) { const x = (i * 97 + now / 7) % W, y = FH * (.62 + ((i * 37) % 25) / 100), h = 10 + Math.sin(now / 80 + i) * 6; c.fillStyle = 'rgba(255,160,60,.35)'; c.beginPath(); c.ellipse(x, y - h / 2, 4, h, 0, 0, 7); c.fill(); }
      c.globalCompositeOperation = 'source-over'; }
    if (B.rock && B.rock.t && !B.rock.t.ko) { const t = B.rock.t, k = .5 + Math.sin(now / 110) * .5, r = (24 + (2 - B.rock.n) * 10) * S * (t.size || 1);
      c.save(); c.translate(t.x, t.y); c.scale(1, .32); c.fillStyle = `rgba(0,0,0,${.35 + k * .2})`; c.beginPath(); c.arc(0, 0, r, 0, 7); c.fill(); c.strokeStyle = `rgba(255,80,60,${.5 + k * .4})`; c.lineWidth = 4; c.stroke(); c.restore();
      c.font = '900 22px Nunito, sans-serif'; c.textAlign = 'center'; c.fillStyle = `rgba(255,${120 + k * 100},80,1)`; c.fillText('⚠', t.x, t.y - 130 * S * (t.size || 1)); }
    c.font = '800 11px Nunito, sans-serif'; c.textAlign = 'center';
    for (const e of BT.alive('e')) {
      const s = S * (e.size || 1);
      if (e.back && this.shielded(e)) { c.fillStyle = 'rgba(10,20,30,.7)'; c.fillRect(e.x - 38, e.y + 6, 76, 15); c.fillStyle = '#9fd0ff'; c.fillText('⛨ BACK ROW', e.x, e.y + 17); }
      if (e.hornUp && !e.hornDone) { const k = .5 + Math.sin(now / 100) * .5; c.font = '900 20px Nunito, sans-serif'; c.fillStyle = `rgba(255,${150 + k * 80},60,1)`; c.fillText('📯', e.x + 26 * s, e.y - 96 * s); c.font = '800 11px Nunito, sans-serif';
        c.strokeStyle = `rgba(255,120,60,${.4 + k * .5})`; c.lineWidth = 3; c.beginPath(); c.arc(e.x, e.y - 40 * s, 44 * s, 0, 7); c.stroke(); }
      if (e.cmd) { c.fillStyle = '#ffd36a'; c.fillText('⚑ COMMANDER', e.x, e.y + (e.back ? 32 : 17)); }
    }
    if (B.order) { const o = B.order, col = this.ORDERS[o.k][1], txt = o.k === 'focus' ? `⚑ ORDER: FOCUS ${o.tgt.name.toUpperCase()}` : o.k === 'shields' ? '⚑ ORDER: SHIELDS UP — enemies take less damage' : '';
      if (txt) { c.font = '900 13px Nunito, sans-serif'; const w = c.measureText(txt).width + 22; c.fillStyle = 'rgba(15,10,6,.78)'; c.fillRect(W / 2 - w / 2, 54, w, 22); c.fillStyle = col; c.fillText(txt, W / 2, 70); }
      if (o.k === 'focus' && o.tgt && !o.tgt.ko) { c.strokeStyle = 'rgba(255,90,70,.8)'; c.lineWidth = 2; c.setLineDash([5, 4]); c.beginPath(); c.arc(o.tgt.x, o.tgt.y - 34 * S, 36 * S, 0, 7); c.stroke(); c.setLineDash([]); } }
    const cp = B.cap;
    if (cp) { const img = cp.img; c.globalAlpha = cp.hp > 0 ? 1 : .45;
      if (img) try { c.save(); c.translate(cp.x, cp.y); c.scale(1, cp.hp > 0 ? .86 : 1); drawBT(c, img, cp.hp > 0 ? (cp.anim || 'combat') : 'ko', 0, 0, 0, S * .9); c.restore();
        if (cp.hp > 0) { c.strokeStyle = '#8a6a3a'; c.lineWidth = 3; const h = 60 * S * .9; for (const f of [.42, .55]) { c.beginPath(); c.moveTo(cp.x - 13 * S, cp.y - h * f); c.lineTo(cp.x + 13 * S, cp.y - h * f + 3); c.stroke(); } } } catch (x) { }
      c.globalAlpha = 1; c.font = '800 11px Nunito, sans-serif'; c.fillStyle = cp.hp > 0 ? (cp.threat ? '#ff8a6a' : '#ffe9b0') : '#999';
      c.fillText(cp.hp > 0 ? `CAPTIVE ${'♥'.repeat(cp.hp)}${cp.threat ? ' — THREATENED' : ''}` : 'CAPTIVE — LOST', cp.x, cp.y + 17);
      if (cp.threat && !cp.threat.ko) { c.strokeStyle = 'rgba(255,90,70,.7)'; c.lineWidth = 2; c.setLineDash([4, 4]); c.beginPath(); c.moveTo(cp.threat.x, cp.threat.y - 30 * S); c.lineTo(cp.x, cp.y - 30 * S); c.stroke(); c.setLineDash([]); } }
    c.restore();
  }
};

(function () {
  const BT = Battle;
  const tip = (B, k, s) => { B.tips = B.tips || {}; if (B.tips[k] || (G.S.f.ai2tip || {})[k]) return; B.tips[k] = 1; G.S.f.ai2tip = G.S.f.ai2tip || {}; G.S.f.ai2tip[k] = 1; setTimeout(() => toast(s, 4200), 300); };

  // ---------- setup when the fight begins ----------
  const _run = BT.run.bind(BT);
  BT.run = async function () {
    const B = this.B;
    if (B && !B.ai2Init && !AI.off(B)) {
      B.ai2Init = 1;
      const E = this.alive('e'), free = AI2.free(this);
      // BACK ROW: casters and archers behind the front line
      const back = E.filter(e => AI2.isBack(e)), front = E.filter(e => !AI2.isBack(e));
      if (back.length && front.length) {
        back.forEach(e => e.back = 1);
        const pos = E.map(e => [e.hx, e.hy]).sort((a, b) => b[0] - a[0]), ord = front.concat(back);
        ord.forEach((e, i) => { e.hx = e.x = pos[i][0]; e.hy = e.y = pos[i][1]; e.slot = pos[i]; });
        tip(B, 'back', '<b style="color:#9fd0ff">⛨ BACK ROW</b> — casters and archers hide behind the front line. Knock down or BREAK the front-liners, or use an area attack.');
      }
      if (free) {
        // WAR HORN
        const hc = E.filter(e => AI2.human(e) && !e.back);
        if (E.length >= 2 && hc.length && Math.random() < .4) { const h = pick(hc); h.horn = 1; B.hornKey = E.slice().sort((a, b) => a.maxHp - b.maxHp)[0].key; }
        // CAPTIVE
        if (E.length >= 2 && E.every(e => AI2.human(e)) && Math.random() < .2) {
          const FH = G.view.fullH || G.view.h, W = G.view.w, nm = pick(AI2.CAPTIVE); let img = null; try { img = HD.npcSheet(nm, false); } catch (x) { } if (!img) img = await npcImg(nm).catch(() => null);
          B.cap = { hp: 2, x: Math.max(34, W * .045), y: FH * .5, img };
          await this.msg('They have a captive! Keep the captive alive.', 1300);
        }
        // GRUDGE: someone who ran from you before
        const gs = G.S.grudges || [];
        if (gs.length && E.length < 4 && Math.random() < .22) {
          const g = gs[0]; if (!ENEMY[g.key]) gs.shift();
          else { await this.summon(g.key); const a = B.actors[B.actors.length - 1];
            a.name = `${g.name} the ${g.scar}`; a.maxHp = a.hp = Math.round(a.maxHp * (1.35 + g.n * .1)); a.atk = Math.round(a.atk * (1.2 + g.n * .05)); a.def += 2; a.grudge = g; a.pers = 'glory'; a.wait = 100 / a.spd * .5;
            this.text(a, 'GRUDGE', '#ff6a5a', -60, true); AI2.say(this, a, pick(['Remember ME, Drag?!', 'You let me run. Big mistake.', 'I\'ve been looking for you…', 'Look what you did to my face!']));
            await this.msg(`${a.name} — the one who ran — is back for revenge!`, 1500); this.hud(); }
        }
      }
    }
    const r = await _run();
    // after the fight: grudges, captive reward
    try {
      if (B && B.ai2Init) {
        const gs = G.S.grudges = G.S.grudges || [];
        for (const e of B.actors) if (e.side === 'e' && e.fled && !e.spared && e.panic !== 2 && !AI.isBoss(e) && ENEMY[e.key]) {
          if (e.grudge) e.grudge.n = Math.min(4, e.grudge.n + 1);
          else if (gs.length < 4 && !gs.some(g => g.key === e.key)) gs.push({ key: e.key, name: AI2.base(e), scar: pick(AI2.SCARS), n: 0 });
        }
        if (B.cap && r === 'win') {
          if (B.cap.hp > 0) { const g = 15 + Math.round(Math.random() * 15); G.S.gold += g; try { Opinion.add('hope', .25); } catch (x) { } setTimeout(() => toast(`<b style="color:#9be37a">The captive is safe.</b> "Gods bless you, both of you." (+${g}g, the vale hears of it)`, 4200), 1200); }
          else { try { Opinion.add('hope', -.15); } catch (x) { } setTimeout(() => toast('<b style="color:#ff8a6a">The captive didn\'t make it.</b> The vale hears about that too.', 4000), 1200); }
        }
      }
    } catch (x) { console.warn(x); }
    return r;
  };

  // ---------- every turn start: fire burns everyone ----------
  function burn(BT, a) { const B = BT.B; if (!B || !(B.fireT > 0) || !a || a.ko) return; B.fireT--; const d = Math.max(1, Math.round(a.maxHp * .04)); a.hp = Math.max(1, a.hp - d); BT.text(a, 'BURN -' + d, '#ff8a3a', -20); if (!B.fireT) BT.text(a, 'the fire dies down', '#ffb070', -50); BT.hud(); }
  const _pt = BT.playerTurn.bind(BT);
  BT.playerTurn = async function (a) { if (!AI.off(this.B)) burn(this, a); return _pt(a); };

  // ---------- enemy turn: phases, commander, horn, captive, Last Stand, rocks ----------
  const _et = BT.enemyTurn.bind(BT);
  BT.enemyTurn = async function (e) {
    const B = this.B; if (AI.off(B) || !e || e.side !== 'e' || (e.E && e.E.fixed)) return _et(e);
    burn(this, e); if (e.ko) return;
    // BOSS PHASES
    while (e.phQ && e.phQ.length) await phase(this, e, e.phQ.shift());
    // COMMANDER (decided on the first enemy turn, once the leader is known)
    if (!B.cmdInit) { B.cmdInit = 1; const L = B.leader; if (L && !L.ko && !AI.beast(L) && this.alive('e').length >= 3) { L.cmd = 1; this.text(L, 'COMMANDER', '#ffd36a', -70, true);
      tip(B, 'cmd', '<b style="color:#ffd36a">⚑ COMMANDER</b> — this enemy gives orders to the others. Hit it hard to break an order; kill it and the rest may break.'); } }
    if (e.cmd) await order(this, e);
    // CAPTIVE: the captor hurts them; someone else may grab them
    const cp = B.cap;
    if (cp && cp.hp > 0) {
      if (cp.threat === e) { cp.hp--; B.shake = 6; sfx('hurt'); await this.msg(cp.hp > 0 ? `${e.name} cuts the captive! (${cp.hp} ♥ left)` : `${e.name}… the captive goes still.`, 1200); if (!cp.hp) cp.threat = null; }
      else if (!cp.threat && AI2.human(e) && ['trickster', 'coward', 'brute'].includes(AI.persOf(e)) && Math.random() < .3) {
        cp.threat = e; AI2.say(this, e, pick(['Back off or they bleed!', 'One more step…', 'Drop it, Drag, or the peasant gets it!']));
        await this.msg(`${e.name} grabs the captive! Hit it hard before its next turn.`, 1400); this.hud(); return;
      }
    }
    // WAR HORN
    if (e.horn && !e.hornDone) {
      e.hornT = (e.hornT || 0) + 1;
      if (e.hornUp) { e.hornDone = 1; e.hornUp = 0; sfx('alarm'); B.shake = 10; B.flash = .4;
        const room = Math.min(2, 4 - this.alive('e').length);
        await this.msg(room > 0 ? `${e.name} blows the war horn — REINFORCEMENTS!` : `${e.name} blows the war horn — the others take heart!`, 1300);
        if (room > 0) { for (let i = 0; i < room; i++) { await this.summon(B.hornKey || e.key, 'REINFORCEMENT'); const n = B.actors[B.actors.length - 1]; if (AI2.isBack(n) && this.alive('e').some(x => !x.back && x !== n)) n.back = 1; } }
        else for (const x of this.alive('e')) { x.atk = Math.round(x.atk * 1.12); this.text(x, 'ATK UP', '#ff8a6a', -30); }
        this.hud(); return; }
      if (e.hornT === 2) { e.hornUp = 1; sfx('alarm'); AI2.say(this, e, pick(['To me! TO ME!', 'Let\'s see you handle twenty of us.', 'Time to call the boys.']));
        await this.msg(`${e.name} raises a war horn! Hit it hard before its next turn!`, 1400);
        tip(B, 'horn', '<b style="color:#ffb04a">📯 WAR HORN</b> — one big hit (or a stun) knocks the horn away. Otherwise reinforcements arrive.'); return; }
    }
    await _et(e);
    if (e.ko) return;
    // LAST STAND: telegraphed one turn ahead in phase III (right away, then every 3rd turn)
    if (e.ph3 && e.phS && (!e.lastDone || (e.turns || 0) % 3 === 0)) { e.lastDone = 1; e.next = e.phS.last; this.text(e, 'GATHERING EVERYTHING — DODGE ITS NEXT ATTACK', '#ff5050', -80, true); sfx('alarm'); }
    // ROCKFALL
    if (!B.rock && (B.hz || /cave|crypt|warren|crystal|mine|^d_|vault|shrine|cinder/.test(B.bdKey || '')) && Math.random() < (B.hz ? .22 : .08)) {
      const P = this.alive('p'), Es = this.alive('e'), t = Math.random() < .6 || !Es.length ? pick(P) : pick(Es);
      if (t) { B.rock = { t, n: 2 }; sfx('alarm'); B.shake = 6; await this.msg(`Rocks shake loose above ${t.name}!`, 1000); }
    }
  };
  async function phase(BT, e, n) {
    const B = BT.B; e.phS = e.phS || AI2.skills(e);
    B.flash = 1; B.flashCol = '255,80,60'; B.shake = 16; sfx('alarm'); e.broken = 0; e.brk = 0;
    AI2.say(BT, e, AI2.phaseLine(e, n));
    await BT.msg(`${e.name} — ${n === 2 ? 'PHASE II' : 'PHASE III: DESPERATION'}`, 1500);
    if (n === 2) { e.atk = Math.round(e.atk * 1.12); e.spd = Math.round(e.spd * 1.1 * 10) / 10; B.hz = 1; BT.text(e, 'ATK · SPD UP — NEW MOVES', '#ff8a6a', -70, true); }
    else { e.atk = Math.round(e.atk * 1.12); e.def += 2; BT.text(e, 'DESPERATE — WATCH FOR ITS LAST STAND', '#ff5050', -70, true); }
    tip(B, 'phase', '<b style="color:#ff8a6a">BOSS PHASES</b> — bosses change at 66% and 33% HP: stronger, new moves, and the arena turns on you.');
    BT.hud();
  }
  async function order(BT, e) {
    const B = BT.B; e.cmdN = (e.cmdN || 0) + 1; B.order = null;
    if (e.cmdN % 2 !== 1) return;
    const others = BT.alive('e').filter(x => x !== e); if (!others.length) return;
    const ks = ['focus', 'shields', 'press', 'rally'].filter(k => k !== e.lastOrder && (k !== 'rally' || others.some(x => x.hp < x.maxHp * .8)));
    const k = pick(ks); e.lastOrder = k;
    if (k === 'focus') { const P = BT.alive('p'); const t = AI.persOf(e) === 'glory' && BT.me() && !BT.me().ko ? BT.me() : P.slice().sort((a, b) => a.hp / a.maxHp - b.hp / b.maxHp)[0];
      B.order = { k, tgt: t, by: e }; AI2.say(BT, e, `Focus ${t.isMe ? 'the Drag' : t.name}!`); await BT.msg(`${e.name}: "Everyone — focus ${t.isMe ? 'the Drag' : t.name}!"`, 1200); }
    else if (k === 'shields') { B.order = { k, by: e }; AI2.say(BT, e, 'Shields up!'); await BT.msg(`${e.name}: "Shields up! Hold!"`, 1100); }
    else if (k === 'press') { AI2.say(BT, e, 'Press them! NOW!'); for (const x of others) { x.wait *= .5; BT.text(x, 'HASTE', '#ffb04a', -30); } await BT.msg(`${e.name}: "Press them — now!"`, 1000); }
    else { AI2.say(BT, e, 'Hold the line!'); for (const x of others) { const h = Math.round(x.maxHp * .1); x.hp = Math.min(x.maxHp, x.hp + h); BT.text(x, '+' + h, '#9be37a', -30); } await BT.msg(`${e.name}: "Hold the line!"`, 1000); }
    BT.hud();
  }

  // ---------- after every turn: the rock lands ----------
  const _at = BT.adaptTick.bind(BT);
  BT.adaptTick = async function () {
    const r = await _at(); const B = this.B; if (!B || AI.off(B) || !B.rock) return r;
    const R = B.rock; if (R.t.ko) { B.rock = null; return r; }
    if (--R.n > 0) return r;
    B.rock = null; const t = R.t; B.shake = 14; sfx('hit');
    if (t.side === 'p') {
      const Es = this.alive('e'), atk = Es.length ? Es.reduce((s, x) => s + x.atk, 0) / Es.length : 10;
      const rock = { side: 'e', name: 'Rockfall', key: 'rockfall', atk, def: 0, x: t.x - 40, y: t.y, hx: t.x - 40, hy: t.y, E: { skills: [] }, anim: 'combat', frame: 0, size: 1, tempo: 1, img: null };
      await this.msg(`ROCKFALL on ${t.name}! DODGE or PARRY!`, 600); $('#react').classList.remove('hide');
      try { await this.defend(rock, t, { m: .9, anim: 'jump', w: 600 }); } finally { $('#react').classList.add('hide'); }
    } else { const d = Math.round(t.maxHp * .12); this.damage(t, d, true); this.text(t, 'ROCKFALL -' + d, '#ffb070', -30, true); t.brk += 20; this.checkBreak(t); this.spark(t.x, t.y - 40, '#c9a46a', 18); }
    this.hud(); return r;
  };

  // ---------- skills: phase moves ----------
  const _cs = BT.chooseSkill.bind(BT);
  BT.chooseSkill = function (e) { const sk = _cs(e); if (!AI.off(this.B) && e && e.ph2 && e.phS && Math.random() < .3) return e.phS.frenzy; return sk; };

  // ---------- reading your habits ----------
  const _df = BT.defend.bind(BT);
  BT.defend = async function (e, t, h) {
    const res = await _df(e, t, h); const B = this.B;
    try { if (B && !AI.off(B) && e && e.side === 'e' && e.E && !e.E.fixed && t && t.side === 'p' && AI2.reader(e)) {
      const k = /parry/.test(res) ? 'parry' : /dodge/.test(res) ? 'dodge' : 'x'; e.dh = (e.dh || []).concat(k).slice(-3);
      if (e.dh.length === 3 && k !== 'x' && e.dh.every(x => x === k) && !(e.readCd > 0)) { e.read = k; e.dh = []; }
    } } catch (x) { }
    return res;
  };
  const _es = BT.enemyStrike.bind(BT);
  BT.enemyStrike = async function (e, t, sk, isCounter) {
    const B = this.B; if (AI.off(B) || !e || e.side !== 'e' || isCounter || !sk || !sk.hits) return _es(e, t, sk, isCounter);
    if (e.readCd > 0) e.readCd--;
    if (e.read) { const k = e.read; e.read = null; e.readCd = 2;
      if (k === 'parry') { const i = sk.hits.length - 1; sk = Object.assign({}, sk, { hits: sk.hits.map((h, j) => j === i ? Object.assign({}, h, { unp: 1, proj: undefined }) : h) }); this.text(e, 'READS YOUR PARRY', '#ff8a6a', -80, true); }
      else { sk = Object.assign({}, sk, { hits: sk.hits.map(h => Object.assign({}, h, { style: 'feint' })) }); this.text(e, 'READS YOUR DODGE — IT WAITS YOU OUT', '#ff8a6a', -80, true); }
      AI2.say(this, e, pick(['I see your pattern.', 'Again? I don\'t think so.', 'Predictable.', 'You always do that.']));
      tip(B, 'read', '<b style="color:#ff8a6a">READING YOU</b> — strong enemies learn your habits. Mix parries and dodges or they\'ll punish you.');
      await wait(450);
    }
    const r = await _es(e, t, sk, isCounter);
    // fire attacks set the field alight
    try { if (!B.fireT && typeof elOf === 'function' && elOf(sk) === 'fire' && Math.random() < .3) { B.fireT = 6; sfx('alarm'); await this.msg('The ground catches fire! Everyone burns at the start of their turn.', 1300); } } catch (x) { }
    return r;
  };

  // ---------- back row: single attacks can't reach ----------
  const _da = BT.doAttack.bind(BT);
  BT.doAttack = function (a, t) {
    if (a && a.side === 'p' && AI2.shielded(t)) { const f = this.alive('e').filter(x => !x.back && !x.broken && !x.panic).sort((x, y) => Math.abs(x.y - t.y) - Math.abs(y.y - t.y))[0];
      if (f) { this.text(t, 'BACK ROW — can\'t reach', '#9fd0ff', -40); t = f; } }
    return _da(a, t);
  };
  const _pk = BT.pickTarget.bind(BT);
  BT.pickTarget = function (a, cb) {
    const B = this.B; if (!B || AI.off(B)) return _pk(a, cb);
    const es = this.alive('e'), ok = es.filter(e => !AI2.shielded(e)); if (ok.length === es.length || !ok.length) return _pk(a, cb);
    this.closeMenu(); if (ok.length === 1) { cb(ok[0]); return; }
    B.targeting = { list: ok, i: 0, cb, side: 'e' }; $('#tgtHint').classList.remove('hide');
  };

  // ---------- damage: phases, orders, horns, captives, grudges ----------
  const _dm = BT.damage.bind(BT);
  BT.damage = function (t, dmg, big) {
    const B = this.B; if (!B || AI.off(B) || !t || !(dmg > 0)) return _dm(t, dmg, big);
    const o = B.order;
    if (o && t.side === 'e' && o.k === 'shields' && t !== o.by && !o.by.ko) dmg = Math.max(1, Math.ceil(dmg * .6));
    if (o && t.side === 'p' && o.k === 'focus' && t === o.tgt && B.curAtk) dmg = Math.round(dmg * 1.1);
    const hp0 = t.hp, r = _dm(t, dmg, big), hit = hp0 - t.hp, heavy = big || hit >= t.maxHp * .12;
    if (t.side === 'e') {
      if (o && t === o.by && (heavy || t.ko || t.broken) && (o.k === 'focus' || o.k === 'shields')) { B.order = null; this.text(t, 'ORDER BROKEN!', '#ffd36a', -70, true); sfx('break'); }
      if (t.ko && o && o.by === t) B.order = null;
      if (t.hornUp && !t.hornDone && (heavy || t.ko)) { t.hornUp = 0; t.hornT = -2; this.text(t, 'HORN KNOCKED AWAY!', '#ffb04a', -70, true); sfx('parry'); }
      if (B.cap && B.cap.threat === t && (heavy || t.ko)) { B.cap.threat = null; this.text(t, 'CAPTIVE FREED', '#9be37a', -70, true); }
      if (t.ko && t.grudge) { const gs = G.S.grudges || []; const i = gs.indexOf(t.grudge); if (i >= 0) gs.splice(i, 1); G.S.gold += 25 + t.grudge.n * 10;
        setTimeout(() => toast(`<b style="color:#ffd36a">Grudge settled.</b> ${esc(t.name)} won't be coming back. (+${25 + t.grudge.n * 10}g)`, 3600), 600); }
      // boss phases at 66% / 33%
      if (!t.ko && !t.fled && AI2.bossy(this, t) && t.E && !t.E.fixed && !t.E.morph && !t.E.noPhase && !AI2.NOPHASE.test(t.key)) {
        const k = t.hp / t.maxHp; t.phQ = t.phQ || [];
        if (!t.ph2 && k < .66) { t.ph2 = 1; t.phQ.push(2); }
        if (!t.ph3 && k < .33) { t.ph3 = 1; t.phQ.push(3); }
      }
    }
    return r;
  };
  // grudges remember the ones who ran: show the enemy-fled hook (enemyai's flee sets e.fled)
  // ---------- drawing ----------
  const _r = BT.render.bind(BT);
  BT.render = function (c, t) { const out = _r(c, t); try { AI2.draw(c, this); } catch (x) { } return out; };
})();
