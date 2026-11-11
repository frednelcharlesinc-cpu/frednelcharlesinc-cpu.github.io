'use strict';
/* =====================================================================================
   THE ANIMATION POOL — every character can carry the same two standard sheets
   (pool/life_template.png + pool/battle_template.png, cut by pool/pool_cut.py into c_<id>).
   LIFE:   idle (front), walk front/back/side, 6 emotes, 6 gestures, a work loop
   BATTLE: combat idle, light combo, heavy/thrust, special, guard/parry/dodge, hurt/KO/victory
   This file makes the world USE them:
     · NPCs breathe through their idle loop, walk away from you with a real back view
     · whoever is speaking acts out the line (talk / nod / laugh / angry / sad / shock)
     · scripted poses:  World.pose(id, 'g_kneel', ms)  — sit, kneel, bow, point, wave, arms crossed
     · townsfolk with a work loop do their job when nobody's watching (sweep, hammer, fish…)
   Characters without a pool sheet simply keep their old animations.
   ===================================================================================== */
const Pool = {
  EMOTE(expr) { const e = String(expr || '');
    if (/anger|angry|furious|rage|glare|shout|fierce/.test(e)) return 'em_angry';
    if (/happy|laugh|smile|grin|smirk|proud/.test(e)) return 'em_laugh';
    if (/sad|cry|tired|worried|shame|grief|hurt/.test(e)) return 'em_sad';
    if (/shock|surprised|scared|nervous|fear/.test(e)) return 'em_shock';
    if (/nod|calm|steady|knowing|focused|determined/.test(e)) return 'em_nod';
    return 'em_talk'; },
  anims(e) { if (typeof HD === 'undefined' || !HD.on() || e.isPlayer) return null; const s = HD.setOf(HD.npcName(e)); return s && HD.img[s] && HD.meta[s] ? HD.meta[s].anims : null; },
  find(who) { if (!World.ents) return null; const c = CHAR[who];
    return World.ents.find(e => !e.isPlayer && e.id === who) || (c && c.sprite ? World.ents.find(e => !e.isPlayer && !e.follower && HD.npcName(e) === c.sprite && Math.abs(e.x - World.player.x) + Math.abs(e.y - World.player.y) < 9) : null); },
  // which pool frame (if any) this NPC should show right now
  frame(e, A, t) {
    const now = performance.now(), P = e.pose;
    if (P && (P.until > now) && A[P.name]) { const L = A[P.name]; return L[P.loop ? Math.floor((now - P.t0) / (P.ms || 170)) % L.length : Math.min(L.length - 1, Math.floor((now - P.t0) / (P.ms || 170)))]; }
    if (P && P.until <= now) e.pose = null;
    if (e.move) { if (e.dir === 'up' && A.ow_up_walk && A.pool) { const L = A.ow_up_walk; return L[Math.floor(e.walkT / (e.move.ms / 2)) % L.length]; } return null; }
    if (e.dir === 'up' && A.ow_up && A.pool) return A.ow_up[0];
    const h = (e.x * 73 + e.y * 151) % 997;
    if (A.work && A.work.length && !e.folk && /turn|bark|stand/.test(e.ai || 'stand') && ((t / 1000 + h) % 16) < 5 && !Dlg.open) return A.work[Math.floor(t / 190) % A.work.length];
    if (A.ow_idle && A.ow_idle.length > 1 && e.dir !== 'left' && e.dir !== 'right') return A.ow_idle[Math.floor((t + h * 37) / 260) % A.ow_idle.length];
    return null;
  }
};
(function () {
  // a character that only exists as a pool sheet needs no old-style sprite file
  if (typeof npcImg === 'function') { const _ni = npcImg; npcImg = async function (name) { try { return await _ni(name); } catch (e) { if (typeof HD !== 'undefined' && HD.meta && HD.setOf(String(name)) && HD.stub) return HD.stub(); throw e; } }; }
  // mark pool sets so the walker knows it has a real back view
  const mark = () => { try { for (const k in HD.meta) { const m = HD.meta[k]; if (m && m.pool && m.anims) m.anims.pool = 1; } } catch (e) { } };
  const tk = setInterval(() => { if (typeof HD !== 'undefined' && HD.meta) { mark(); clearInterval(tk); } }, 500);
  const _draw = Ent.prototype.draw;
  Ent.prototype.draw = function (c, cx, cy, t) {
    let A = null, f = null;
    try { A = Pool.anims(this); if (A) f = Pool.frame(this, A, t); } catch (e) { f = null; }
    if (f == null) return _draw.call(this, c, cx, cy, t);
    // show exactly that frame: swap the lists the walker reads for one call
    const keys = ['ow_down', 'ow_side', 'ow_down_walk', 'ow_side_walk', 'ow_hood'], keep = keys.map(k => A[k]), mv = this.move;
    for (const k of keys) if (A[k]) A[k] = [f];
    if (!A.ow_down) A.ow_down = [f];
    try { this.move = null; return _draw.call(this, c, cx, cy, t); }
    finally { keys.forEach((k, i) => { if (keep[i] === undefined) delete A[k]; else A[k] = keep[i]; }); this.move = mv; }
  };
  // the speaker acts out the line
  const _line = Dlg.line.bind(Dlg);
  Dlg.line = function (who, expr, text, choices) {
    try { if (who && who !== 'me' && G.mode === 'world') { const e = Pool.find(who), A = e && Pool.anims(e);
      if (A) { const n = Pool.EMOTE(expr); const name = A[n] ? n : A.em_talk ? 'em_talk' : null;
        if (name && !(e.pose && e.pose.hold)) e.pose = { name, t0: performance.now(), until: performance.now() + 2400 + String(text || '').length * 18 }; } } } catch (e) { }
    return _line(who, expr, text, choices);
  };
  // scripted poses: World.pose('bess', 'g_sit')  (ms omitted = until told otherwise; null name clears)
  World.pose = function (id, name, ms, loop) { const e = typeof id === 'string' ? this.ent(id) : id; if (!e) return;
    if (!name) { e.pose = null; return; } e.pose = { name, t0: performance.now(), until: ms ? performance.now() + ms : Infinity, hold: !ms, loop: !!loop || name === 'work' }; };
})();
