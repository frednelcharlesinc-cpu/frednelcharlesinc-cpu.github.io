'use strict';
/* ============================================================================
   RENOWN: two names, one Drag.
   - HOOD  = Ren as Ren. Eyes hidden. Everything he does builds REN's name and his
             standing with each town.
   - VEIL  = the Red Veil, a secret identity. What he does in the mask builds the
             VEIL's name instead — and never touches Ren's. Use it for the jobs that
             would ruin Ren if anyone knew.
   - EYES OUT = still Ren, but now everyone sees a Drag.
   Help a town enough and it stops judging the eyes.
   ========================================================================== */
const TOWNS = { ashford: 'Ashford', millbrook: 'Millbrook', kettlebrook: 'Kettlebrook' };
const TOWN_TIERS = [[-10, 'Hated'], [-3, 'Distrusted'], [0, 'Stranger'], [6, 'Known'], [14, 'Trusted'], [26, 'Beloved']];
const townOf = sc => { if (!sc) return null; if (TOWNS[sc]) return sc; if (/^a_/.test(sc) || sc === 'as_tavern') return 'ashford'; if (/^mb_/.test(sc)) return 'millbrook'; if (/^kb_/.test(sc)) return 'kettlebrook'; return null; };
const Rep = {
  who() { return typeof Veil !== 'undefined' && Veil.on() ? 'veil' : G.S.hood ? 'ren' : 'eyes'; },
  town(t) { const S = G.S; S.town = S.town || {}; return S.town[t] || 0; },
  tier(v) { return TOWN_TIERS.filter(x => v >= x[0]).pop() || TOWN_TIERS[0]; },
  // credit a good (or bad) deed to whoever is wearing the face right now
  deed(n, why, town, fame) {
    const S = G.S, w = this.who(); fame = fame ?? n;
    if (w === 'veil') {
      S.f.veilRep = (S.f.veilRep || 0) + fame;
      if (n) toast(`<b style="color:#ff5a5a">The Red Veil</b> ${n > 0 ? '+' : ''}${fame} renown — ${why}`, 3000);
      return 'veil';
    }
    S.fame = Math.max(0, (S.fame || 0) + fame);
    if (town) { S.town = S.town || {}; const before = this.tier(this.town(town))[1]; S.town[town] = this.town(town) + n; const after = this.tier(this.town(town))[1];
      if (after !== before) setTimeout(() => toast(`<b>${TOWNS[town]}</b> now sees you as <b style="color:${n > 0 ? '#46ff95' : '#ff7a6a'}">${after}</b>.${n > 0 && this.town(town) >= 14 ? ' They stop flinching at green eyes.' : ''}`, 4200), 1600); }
    if (n) toast(`<b>${G.S.name}</b> ${fame > 0 ? '+' : ''}${fame} fame — ${why}`, 2800);
    return 'ren';
  },
  html() {
    const S = G.S, f = S.f;
    let h = `<div class="stat" style="margin-bottom:6px"><h3>You are wearing: ${{ ren: '☗ the Hood — you are <b>Ren</b>', veil: '◆ the <b style="color:#ff6a6a">Red Veil</b> — a secret identity', eyes: '👁 nothing — Ren, with Drag eyes out' }[this.who()]}</h3>
      <p class="muted">The Hood button cycles Hood → ${Veil.got() ? 'Veil → ' : ''}Eyes out. Deeds done in the hood build Ren's name. Deeds done in the Veil build the Veil's — and can't be traced back to Ren.</p></div>`;
    h += `<div class="grid2"><div class="stat"><h3>${esc(S.name)}</h3><p>Fame <b>${S.fame || 0}</b> · ${typeof titleOf === 'function' ? titleOf(FAME_T, S.fame || 0) : ''}</p>${Object.keys(TOWNS).map(t => { const v = this.town(t), T = this.tier(v); return `<p>${TOWNS[t]}: <b style="color:${v >= 14 ? '#46ff95' : v < 0 ? '#ff7a6a' : '#d8e8dc'}">${T[1]}</b> <span class="muted">(${v})</span></p>`; }).join('')}
      <p class="muted">Known: help a town and it starts to look past things. Trusted (14): your eyes barely raise suspicion there. Beloved (26): nobody there judges your eyes at all.</p></div>
      <div class="stat"><h3 style="color:#ff6a6a">The Red Veil</h3>${Veil.got() ? `<p>Renown <b>${f.veilRep || 0}</b></p><p>${Veil.rank()[0]} — <span class="muted">${Veil.rank()[1]}</span></p><p class="muted">The Crown hunts the Veil, the people cheer it. Its reputation is its own — good or bad.</p>` : '<p class="muted">You have no second face. Yet.</p>'}</div></div>`;
    if (typeof Raid !== 'undefined') h += Raid.bondsHTML();
    return h;
  }
};
// help a town enough and it stops judging the eyes
(function () {
  const _s = Story.addSus.bind(Story);
  Story.addSus = function (n, quiet) {
    const t = townOf(G.S && G.S.map), v = t ? Rep.town(t) : 0;
    if (t && n > 0 && v >= 26) { if (!G.S.f['belovedTip' + t]) { G.S.f['belovedTip' + t] = 1; toast(`${TOWNS[t]} knows you. A few people see your eyes — and just nod.`, 3200); } return; }
    if (t && n > 0 && v >= 14) n = n / 2;
    return _s(n, quiet);
  };
})();
// the Hood button: Hood (Ren) → Veil (secret identity) → eyes out
(function () {
  Veil.on = function () { return !!(G.S && !G.S.kid && G.S.f && G.S.f.veilGot && G.S.veilOn) || !!(G.S && G.S.veilTmp); };
  World.toggleHood = function () {
    if (G.mode !== 'world' || this.busy) return;
    if (!G.S.f.hoodGiven) { toast("You don't have a hood yet."); return; }
    sfx('hood');
    if (Veil.got()) {
      if (G.S.hood && !G.S.veilOn) { G.S.veilOn = true; G.S.hood = true; toast('<b style="color:#ff5a5a">The Red Veil.</b> Red scarf, black hood. Whatever you do now is the Veil\'s doing — not Ren\'s.', 3600); }
      else if (G.S.veilOn) { G.S.veilOn = false; G.S.hood = false; toast('Hood down. You are Ren — and your green eyes are out for anyone to see.', 3200); }
      else { G.S.hood = true; toast('Hood up. You are <b>Ren</b>, eyes hidden. What you do builds your own name.', 3000); }
    } else { G.S.hood = !G.S.hood; toast(G.S.hood ? 'Hood up. Your eyes are hidden.' : 'Hood down. Your eyes burn green for anyone to see.'); }
    UI.hud(); save();
  };
  const _hud = UI.hud.bind(UI);
  UI.hud = function () { _hud(); const hb = $('#bHood'); if (!hb || !G.S || G.S.kid || !G.S.f.hoodGiven) return; hb.textContent = Veil.on() ? 'Veil ◆' : G.S.hood ? 'Hood ▲' : 'Hood ▼'; hb.style.color = Veil.on() ? '#ff8a8a' : ''; };
})();
// Green Eclipse in public: green hoods over their eyes (the fights still show them as they are)
(function () {
  const _n = npcImg;
  npcImg = async function (name) {
    if (typeof GE_SPR !== 'undefined' && (GE_SPR.includes(name) || name === 'kairo') && G.S && !G.S.kid && townOf(G.S.map)) {
      const caped = name !== 'kairo' && typeof Notoriety !== 'undefined' && Notoriety.level() >= 2;
      const r = await _n(name + (caped ? '_ch' : '_h')); if (r) return r;
    }
    return _n(name);
  };
})();
