/* =====================================================================
   TROPHIES & BATTLE FEEL
   · Achievements that pop as you play (Menu ▸ Trophies).
   · Battle polish: a hit-stop on heavy blows, a camera punch on big hits and
     KOs, chunkier damage numbers, a slow-motion beat on the final blow.
   ===================================================================== */
const FEATS = [
  ['first_win', '⚔', 'First Blood', 'Win your first fight.', S => (S.f.wins || 0) >= 1],
  ['wins25', '⚔', 'Seasoned', 'Win 25 fights.', S => (S.f.wins || 0) >= 25],
  ['wins100', '⚔', 'Veteran of the Vale', 'Win 100 fights.', S => (S.f.wins || 0) >= 100],
  ['pp1', '✦', 'Read the Blade', 'Land a perfect parry.', S => (S.f.ppTotal || 0) >= 1],
  ['pp50', '✦', 'Wall of Steel', 'Land 50 perfect parries.', S => (S.f.ppTotal || 0) >= 50],
  ['pd50', '≈', 'Like Water', 'Land 50 perfect dodges.', S => (S.f.pdTotal || 0) >= 50],
  ['clean', '◇', 'Untouched', 'Win a fight without taking a single hit.', S => !!S.f.cleanWin],
  ['leaf', '🍃', 'The Leaf Never Felt It', 'Learn Leaf Cut.', S => !!S.f.leafCut],
  ['leaf25', '🍃', 'Four Thousand More', 'Cut 25 things out of the air.', S => (S.f.leafCuts || 0) >= 25],
  ['veil', '🧣', 'A Second Face', 'Receive the Red Veil.', S => !!S.f.veilGot],
  ['veil3', '🧣', 'Children Play the Red Veil', 'Raise the Red Veil\'s fame to 3.', S => typeof Veil !== 'undefined' && Veil.fame() >= 3],
  ['tavern1', '🍺', 'Regular', 'Buy a drink in a tavern.', S => (S.f.drinksBought || 0) >= 1],
  ['round', '🍻', 'Drinks Are on Me', 'Buy a round for the whole house.', S => !!(S.f.tavRoundashford || S.f.tavRoundmillbrook || S.f.tavRoundkettlebrook)],
  ['ears', '👂', 'All Ears', 'Overhear 8 pieces of tavern intel.', S => ((S.f.tavLog || []).length) >= 8],
  ['allbars', '🍺', 'Pub Crawl', 'Drink in all three taverns of the vale.', S => ['ashford', 'millbrook', 'kettlebrook'].every(k => (S.f.barsDrank || {})[k])],
  ['chests10', '▣', 'Treasure Hunter', 'Open 10 chests.', S => Object.keys(S.chests || {}).length >= 10],
  ['gold500', '◉', 'Coin in the Pocket', 'Carry 500 gold.', S => S.gold >= 500],
  ['night', '☾', 'Night Owl', 'Be out under the stars at midnight.', S => !!S.f.midnight],
  ['rain', '☂', 'Singing in the Rain', 'Walk 150 steps in the rain.', S => (S.f.rainSteps || 0) >= 150],
  ['hope', '♥', 'Hope Grows', 'Raise the vale\'s hope for Drags to 4.', S => (S.f.hope || 0) >= 4],
  ['rankB', 'B', 'B-Rank', 'Reach grade B.', S => typeof Power !== 'undefined' && Power.now().i >= 3],
  ['halvard', '⚖', 'The Cages Open', 'Stop Halvard at the Old Mill.', S => !!S.f.millDone],
  ['ch1', '★', 'Chapter I', 'Finish Chapter I.', S => !!S.f.chapter1Done || (S.chapter || 1) >= 2],
  ['hens', '🐔', 'Chicken Chaser', 'Scatter 20 chickens by running through them.', S => (S.f.hensScattered || 0) >= 20]
];
const Feats = {
  got(id) { return !!(G.S && G.S.ach && G.S.ach[id]); },
  check() {
    const S = G.S; if (!S || !S.f) return; S.ach = S.ach || {};
    for (const [id, ic, nm, d, test] of FEATS) {
      if (S.ach[id]) continue;
      let ok = false; try { ok = test(S); } catch (e) { }
      if (ok) { S.ach[id] = Date.now(); this.pop(ic, nm, d); }
    }
  },
  pop(ic, nm, d) {
    const el = document.createElement('div');
    el.style.cssText = 'position:fixed;z-index:60;right:max(12px,env(safe-area-inset-right));top:calc(max(6px,env(safe-area-inset-top)) + 56px);display:flex;gap:10px;align-items:center;padding:8px 14px 8px 10px;border-radius:12px;background:linear-gradient(135deg,#1c2a1f,#0d140f);border:2px solid #d9a640;box-shadow:0 6px 24px #000c;font-family:Nunito,sans-serif;transform:translateX(130%);transition:transform .45s cubic-bezier(.2,1.3,.4,1);pointer-events:none;max-width:60vw';
    el.innerHTML = `<div style="width:36px;height:36px;border-radius:50%;background:#2a2412;border:2px solid #d9a640;display:flex;align-items:center;justify-content:center;font-size:18px;color:#ffd36a;font-weight:900">${ic}</div><div><div style="font-size:11px;font-weight:900;letter-spacing:1px;color:#d9a640">TROPHY UNLOCKED</div><div style="font-size:15px;font-weight:900;color:#fff">${esc(nm)}</div><div style="font-size:12px;color:#b8c8bc">${esc(d)}</div></div>`;
    document.body.appendChild(el); sfx('level');
    requestAnimationFrame(() => requestAnimationFrame(() => el.style.transform = 'translateX(0)'));
    setTimeout(() => { el.style.transform = 'translateX(130%)'; setTimeout(() => el.remove(), 600); }, 3600);
  }
};
setInterval(() => { try { if (G.mode !== 'title') Feats.check(); } catch (e) { } }, 1500);
function featsMenuHTML() {
  const S = G.S; S.ach = S.ach || {};
  const n = FEATS.filter(f => S.ach[f[0]]).length;
  return `<div class="stat"><h3>Trophies — ${n} / ${FEATS.length}</h3><div style="height:6px;background:#222;border-radius:3px;margin-top:4px"><div style="height:6px;border-radius:3px;background:#d9a640;width:${Math.round(n / FEATS.length * 100)}%"></div></div></div>
  <div class="grid2" style="margin-top:6px">${FEATS.map(([id, ic, nm, d]) => { const g = S.ach[id]; return `<div class="stat" style="${g ? 'border-color:#d9a640' : 'opacity:.55'}"><h3 style="color:${g ? '#ffd36a' : '#8a948c'}">${g ? ic : '🔒'} ${esc(nm)}</h3><p class="muted">${esc(d)}</p></div>`; }).join('')}</div>`;
}

/* ---------- tracking what the trophies need ---------- */
(function () {
  const BT = Battle;
  const _vic = BT.victory.bind(BT);
  BT.victory = async function () { const B = this.B; try { const f = G.S.f; if (!B.cfg.leafTrain) { f.wins = (f.wins || 0) + 1; if (B.st && B.st.hurt === 0) f.cleanWin = 1; } } catch (e) { } return _vic(); };
  const _def = BT.defend.bind(BT);
  BT.defend = function (e, t, h) { return _def(e, t, h).then(r => { try { if (t.isMe && !this.B.leafTrain) { const f = G.S.f; if (r === 'pparry') f.ppTotal = (f.ppTotal || 0) + 1; if (r === 'pdodge') f.pdTotal = (f.pdTotal || 0) + 1; } } catch (x) { } return r; }); };
  // tavern drinks
  if (typeof buyDrink === 'function') {
    const _bd = buyDrink;
    buyDrink = async function (tk) { const g0 = G.S.gold; const r = await _bd(tk); if (G.S.gold < g0) { const f = G.S.f; f.drinksBought = (f.drinksBought || 0) + 1; f.barsDrank = f.barsDrank || {}; f.barsDrank[tk] = 1; } return r; };
  }
  // night and rain, hens
  let lastSteps = 0;
  setInterval(() => {
    try {
      const S = G.S; if (!S || G.mode !== 'world' || typeof Ambient === 'undefined') return;
      if (Ambient.outdoors() && Ambient.on()) {
        const h = Ambient.hour(); if (h >= 0 && h < 1) S.f.midnight = 1;
        if (Ambient.weather === 'rain' && S.steps > lastSteps) S.f.rainSteps = (S.f.rainSteps || 0) + (S.steps - lastSteps);
        for (const k of Ambient.critters) if (k.flee > 500 && !k.counted) { k.counted = 1; S.f.hensScattered = (S.f.hensScattered || 0) + 1; } else if (!k.flee) k.counted = 0;
      }
      lastSteps = S.steps;
    } catch (e) { }
  }, 200);
})();

/* ---------- battle feel ---------- */
(function () {
  const BT = Battle;
  const _dmg = BT.damage.bind(BT);
  BT.damage = function (t, dmg, big) {
    const B = this.B, wasAlive = t.hp > 0;
    const r = _dmg(t, dmg, big);
    try {
      if (B && t.side === 'e') {
        const heavy = big || dmg >= t.maxHp * .2;
        if (heavy) { B.hitstop = Math.max(B.hitstop || 0, big ? 95 : 60); B.punch = Math.max(B.punch || 0, big ? .045 : .025); B.punchX = t.x; B.punchY = t.y - 30; }
        if (wasAlive && t.hp <= 0 && t.side === 'e') {
          const lastFoe = B.actors.filter(a => a.side === 'e' && a.hp > 0).length === 0;
          B.hitstop = Math.max(B.hitstop || 0, lastFoe ? 260 : 120); B.punch = Math.max(B.punch || 0, lastFoe ? .08 : .05); B.punchX = t.x; B.punchY = t.y - 30;
          if (lastFoe) { B.flash = Math.max(B.flash || 0, .45); B.flashCol = '255,255,255'; }
        }
      }
    } catch (e) { }
    return r;
  };
  const _up = BT.update.bind(BT);
  BT.update = function (dt) {
    const B = this.B;
    if (B && B.hitstop > 0) { B.hitstop -= dt; if (B.punch) B.punch *= .9; return; }
    if (B && B.punch) { B.punch *= Math.pow(.86, dt / 16); if (B.punch < .002) B.punch = 0; }
    return _up(dt);
  };
  const _r = BT.render.bind(BT);
  BT.render = function (c, t) {
    const B = this.B;
    if (!B || !B.punch) return _r(c, t);
    const z = 1 + B.punch, px = B.punchX ?? G.view.w / 2, py = B.punchY ?? G.view.h / 2;
    c.save(); c.translate(px, py); c.scale(z, z); c.translate(-px, -py); _r(c, t); c.restore();
  };
  // chunkier numbers: big hits get an outline-bounce (the text system already scales crits)
  const _tx = BT.text.bind(BT);
  BT.text = function (a, s, col, dy, big) { return _tx(a, s, col, dy, big || (/^\d+$/.test(String(s)) && +s >= 40)); };
})();
