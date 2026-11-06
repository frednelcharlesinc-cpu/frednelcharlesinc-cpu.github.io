'use strict';
/* ATTACK BY TOUCH
   - TAP an enemy  → attack it (your standard strikes)          - the ⚔ button (bottom right) does the same
   - THE MOVE BAR, floating just above the fighter whose turn it is, with two tabs and a picture on every move:
       ⚔ SWORD     physical techniques — Vane's sword style (Horizon Draw, Mirage Step, Snow Sever…), or a partner's weapon arts
       ✦ SPECIAL   Drag Arts and the rest — Crimson Tide, Azure Tide, Emerald Fang, Stone Skills, Link Art, transformations
     One tap fires the move at once, at the enemy you last hit (or the only one standing). No second tap, no target step.
     Which five sit in each tab is chosen while meditating (Menu → Stones → Meditation). */
const MoveBar = {
  // which arts are physical weapon techniques (everything else is a special)
  PHYS: ['horizon', 'mirage', 'sever', 'cleave', 'needle', 'wyrm'],
  norm(lb) { return String(lb).replace(/\s*[×(].*$/, '').trim(); },
  keyOf(name) { if (typeof ARTS === 'undefined') return null; const n = this.norm(name); for (const [k, A] of Object.entries(ARTS)) if (A.name === n) return k; return null; },
  isPhys(name) { const k = this.keyOf(name); return !!k && (this.PHYS.includes(k) || !!(ARTS[k] && ARTS[k].sword)); },
  lo() { const f = G.S.f; f.loadout2 = f.loadout2 || { phys: null, spec: null }; return f.loadout2; },
  // what meditation can offer outside battle
  medPools() {
    const phys = [], spec = new Set();
    try { for (const k of G.S.arts || []) { const A = ARTS[k]; if (!A || k === 'sight') continue; if (this.isPhys(A.name)) phys.push(A.name); else spec.add(A.name); } } catch (e) { }
    try { if (typeof Stones !== 'undefined' && typeof MECH !== 'undefined') for (const id of Stones.equipped()) if (MECH.SKILL[id]) spec.add(MECH.SKILL[id][0]); } catch (e) { }
    for (const k of Object.keys(G.S.f.specSeen || {})) if (!this.isPhys(k)) spec.add(k);
    return { phys, spec: [...spec] };
  },
  slots(kind, pool) { const lo = this.lo(); const s = (lo[kind] || pool.slice(0, 5)).slice(0, 5); while (s.length < 5) s.push(''); return s; },
  tile(name, sub, extra) {
    return `<div class="mbt" ${extra || ''}><i>${name ? MoveIcon(name) : ''}</i><span>${name ? this.short(name) : 'empty'}</span>${sub ? `<em>${sub}</em>` : ''}</div>`;
  },
  short(n) { n = this.norm(n).replace(/^(Emerald|Stance:)\s+/, ''); return n.length > 12 ? n.slice(0, 11) + '…' : n; },
  /* ---------- meditation: slot the moves (tap a slot, then tap the move to put there) ---------- */
  pick: null,
  medHTML() {
    if (!G.S || G.S.kid) return '';
    const P = this.medPools(), ps = this.slots('phys', P.phys), ss = this.slots('spec', P.spec), pk = this.pick;
    const row = (kind, arr) => `<div class="mbrow">${arr.map((n, i) => this.tile(n, '', `data-slot="${kind}" data-i="${i}" style="${pk && pk.kind === kind && pk.i === i ? 'outline:2px solid #ffd36a;outline-offset:2px' : ''}${n ? '' : ';opacity:.4'}"`)).join('')}</div>`;
    let chooser = '';
    if (pk) { const pool = P[pk.kind];
      chooser = `<div class="stat" style="margin-top:6px;background:#0b1510"><p class="muted" style="margin:0 0 4px">Choose a ${pk.kind === 'phys' ? 'sword technique' : 'special'} for slot ${pk.i + 1}:</p>
        <div class="mbrow">${pool.map(n => this.tile(n, '', `data-put="${n.replace(/"/g, '&quot;')}"`)).join('')}${this.tile('', '', 'data-put=""')}</div>
        ${pool.length ? '' : `<p class="muted">${pk.kind === 'phys' ? 'No sword techniques yet — Vane will teach you.' : 'No specials yet.'}</p>`}</div>`; }
    return `<div class="stat" style="margin-bottom:6px"><style>.mbrow{display:flex;flex-wrap:wrap;gap:6px}.mbt{width:62px;display:flex;flex-direction:column;align-items:center;gap:2px;cursor:pointer}
        .mbt i{display:block;width:48px;height:48px}.mbt span{font:800 10px/1.1 Nunito,system-ui;text-align:center;color:#eafff1}.mbt em{font:800 9px Nunito;font-style:normal;color:#9fd8ff}</style>
      <h3 style="color:#7dffb0">Meditation — your move bar</h3>
      <p class="muted">Choose the five moves in each tab above you in battle. Tap a slot, then tap the move to put there.</p>
      <p style="margin:4px 0 2px"><b>⚔ Sword</b> <span class="muted">— Vane's style</span></p>${row('phys', ps)}
      <p style="margin:8px 0 2px"><b>✦ Special</b> <span class="muted">— Drag Arts and more</span></p>${row('spec', ss)}${chooser}
      <p class="muted" style="margin-top:4px">New techniques and arts appear here once you have them (Link Art and transformations after you've used them in a fight).</p></div>`;
  },
  medBind() {
    $$('#menuCard [data-slot]').forEach(el => bindTap(el, () => { const k = el.dataset.slot, i = +el.dataset.i; this.pick = this.pick && this.pick.kind === k && this.pick.i === i ? null : { kind: k, i }; sfx('blip'); UI.renderMenu(); }));
    $$('#menuCard [data-put]').forEach(el => bindTap(el, () => {
      const pk = this.pick; if (!pk) return; const lo = this.lo(), P = this.medPools();
      if (!lo[pk.kind]) lo[pk.kind] = this.slots(pk.kind, P[pk.kind]);
      const v = el.dataset.put, j = v ? lo[pk.kind].indexOf(v) : -1;
      if (j >= 0 && j !== pk.i) lo[pk.kind][j] = lo[pk.kind][pk.i];   // already slotted elsewhere: swap
      lo[pk.kind][pk.i] = v; this.pick = null; sfx('level'); if (typeof save === 'function') save(); UI.renderMenu();
    }));
  }
};

(function () {
  if (typeof Battle === 'undefined') return;
  const css = document.createElement('style');
  css.textContent = `#atkHint{position:fixed;z-index:56;left:50%;bottom:max(8px,env(safe-area-inset-bottom));transform:translateX(-50%);padding:4px 12px;border-radius:12px;background:rgba(8,16,12,.6);color:#d8ece0;font:700 11px Nunito,system-ui;pointer-events:none;white-space:nowrap;transition:opacity .4s}
  #atkHint.hide{opacity:0}
  #gpad{position:fixed;z-index:57;right:calc(max(8px,env(safe-area-inset-right)) + 50px);bottom:max(10px,env(safe-area-inset-bottom));width:80px;height:80px;touch-action:none}
  #gpad.hide,#mbar.hide{display:none}
  #gpad .go{position:absolute;inset:0;border-radius:50%;display:flex;align-items:center;justify-content:center;touch-action:none;-webkit-tap-highlight-color:transparent}
  #gpad .go i{display:flex;flex-direction:column;align-items:center;justify-content:center;width:66px;height:66px;border-radius:50%;background:rgba(255,110,80,.18);border:2px solid rgba(255,150,120,.6);color:#fff;font-style:normal;font-size:20px;text-shadow:0 1px 3px #000;transition:transform .07s,background .07s,box-shadow .07s}
  #gpad .go i small{font:800 8.5px Nunito,system-ui;margin-top:1px}
  #gpad .go.on i{transform:scale(.86);background:rgba(255,255,255,.32);box-shadow:0 0 16px #ff9a7a}
  #mbar{position:fixed;z-index:57;display:flex;flex-direction:column;align-items:center;gap:4px;touch-action:none;font-family:Nunito,system-ui;-webkit-user-select:none;user-select:none}
  #mbar .tabs{display:flex;gap:4px}
  #mbar .tab{padding:3px 10px;border-radius:10px;background:rgba(8,16,12,.62);border:1px solid rgba(255,255,255,.18);color:#cfe3d6;font:800 11px Nunito,system-ui;-webkit-tap-highlight-color:transparent}
  #mbar .tab.sel{background:rgba(70,255,149,.28);border-color:#7dffb0;color:#fff}
  #mbar .row{display:flex;gap:5px}
  #mbar .mv{position:relative;width:56px;display:flex;flex-direction:column;align-items:center;gap:1px;transition:transform .07s,filter .07s;-webkit-tap-highlight-color:transparent;touch-action:none}
  #mbar .mv i{display:block;width:46px;height:46px;border-radius:50%;box-shadow:0 3px 8px rgba(0,0,0,.55)}
  #mbar .mv span{font:800 9px/1.05 Nunito,system-ui;color:#fff;text-shadow:0 1px 2px #000,0 0 4px #000;max-width:58px;text-align:center}
  #mbar .mv em{position:absolute;top:-4px;right:0;font:800 8.5px Nunito,system-ui;font-style:normal;padding:0 4px;border-radius:7px;background:#0b2a4a;border:1px solid #5fb8ff;color:#cfe8ff}
  #mbar .mv.on{transform:scale(.86);filter:brightness(1.5)}
  #mbar .mv.atk{margin-right:6px}
  #mbar .mv.off{opacity:.4;filter:grayscale(.75)}`;
  document.head.append(css);

  const gp = document.createElement('div'); gp.id = 'gpad'; gp.className = 'hide'; gp.innerHTML = '<div class="go"><i>⚔<small>Attack</small></i></div>'; document.body.append(gp);
  const bar = document.createElement('div'); bar.id = 'mbar'; bar.className = 'hide'; document.body.append(bar);
  const chip = document.createElement('div'); chip.id = 'atkHint'; chip.className = 'hide'; document.body.append(chip);
  const feel = el => { el.classList.remove('on'); void el.offsetWidth; el.classList.add('on'); sfx('blip'); try { navigator.vibrate && navigator.vibrate(12); } catch (e) { } setTimeout(() => el.classList.remove('on'), 140); };
  let cur = null, turns = 0, tab = (() => { try { return localStorage.getItem('eb_mbtab2') || 'phys'; } catch (e) { return 'phys'; } })();
  const target = a => (a.lastTarget && !a.lastTarget.ko && a.lastTarget) || Battle.alive('e')[0] || null;
  const hide = () => { chip.classList.add('hide'); gp.classList.add('hide'); bar.classList.add('hide'); cur = null; };
  const go = fn => { const c = cur; hide(); if (typeof AT !== 'undefined') { AT.fold(); AT.btn.classList.add('hide'); } Battle.closeMenu(); fn(c); };
  const onDown = (el, fn) => el.addEventListener('pointerdown', e => { e.preventDefault(); e.stopPropagation(); if (!cur) return; try { audioUnlock(); } catch (x) { } fn(el); });

  // ⚔ attack
  onDown(gp.querySelector('.go'), el => { feel(el); const t = target(cur.a); if (!t) return; go(c => Battle.doAttack(c.a, t).then(c.done)); });

  /* ---------- reading this turn's moves out of the battle menu (without opening it) ---------- */
  const grab = fn => { let got = null; const o = Battle.openMenu; Battle.openMenu = L => { got = L; }; try { fn(); } catch (e) { } finally { Battle.openMenu = o; } return got || []; };
  function moves(a, L) {
    const out = [];
    for (const it of L) {
      const lb = String(it[0]);
      if (lb === 'More') { for (const x of moves(a, grab(it[2]).filter(y => y[0] !== '◀ Back'))) out.push(x); continue; }
      if (/^(Drag Arts|Skills|Stone Skills)$/.test(lb)) { for (const x of grab(it[2])) if (x[0] !== '◀ Back') out.push(x); }
      else if (/^(Link Art|Transform|Ascen|Emerald Ascension|Eleventh|Phantom|Wyrmshade)/.test(lb)) out.push(it);
    }
    if (a.isMe) { const s = G.S.f.specSeen = G.S.f.specSeen || {}; for (const x of out) if (!MoveBar.isPhys(x[0])) s[MoveBar.norm(x[0])] = 1; }
    return out;
  }
  function split(list) { return { phys: list.filter(x => MoveBar.isPhys(x[0])), spec: list.filter(x => !MoveBar.isPhys(x[0])) }; }

  function render() {
    const c = cur; if (!c) return;
    const a = c.a, S = split(c.list);
    
    if (tab === 'phys' && !S.phys.length) tab = 'spec'; if (tab === 'spec' && !S.spec.length) tab = 'phys';
    const have = S[tab], names = have.map(x => MoveBar.norm(x[0]));
    let want = a.isMe && MoveBar.lo()[tab] && MoveBar.lo()[tab].some(Boolean) ? MoveBar.lo()[tab].slice(0, 5) : names.slice(0, 5);
    if (!a.isMe) want = names.slice(0, 5);
    const slots = want.map(n => { if (!n) return null; const x = have.find(s => MoveBar.norm(s[0]) === n); return x ? { x, name: n, cost: x[4] } : { gone: 1, name: n }; }).filter(Boolean);
    bar.innerHTML = `<div class="row"><div class="mv atk"><i>${MoveIcon('Attack')}</i><span>Attack</span></div>${slots.map((s, i) => {
      const off = s.gone || (s.cost && a.mp < s.cost) || s.x[3];
      return `<div class="mv${off ? ' off' : ''}" data-i="${i}"><i>${MoveIcon(s.name)}</i><span>${MoveBar.short(s.name)}</span>${s.cost ? `<em>${s.cost}</em>` : ''}</div>`;
    }).join('')}</div>
      <div class="tabs">${S.phys.length ? `<div class="tab ${tab === 'phys' ? 'sel' : ''}" data-t="phys">⚔ Sword</div>` : ''}${S.spec.length ? `<div class="tab ${tab === 'spec' ? 'sel' : ''}" data-t="spec">✦ Special</div>` : ''}</div>`;
    onDown(bar.querySelector('.mv.atk'), el => { feel(el); const t = target(a); if (!t) return; go(c2 => Battle.doAttack(c2.a, t).then(c2.done)); });
    bar.querySelectorAll('.tab').forEach(el => onDown(el, () => { tab = el.dataset.t; try { localStorage.setItem('eb_mbtab2', tab); } catch (e) { } sfx('blip'); render(); }));
    bar.querySelectorAll('.mv[data-i]').forEach(el => onDown(el, () => {
      const s = slots[+el.dataset.i]; if (!s) return;
      if (s.gone) { toast(`${s.name} isn't available in this fight.`, 1600); return; }
      if (s.cost && a.mp < s.cost) { toast(`Not enough MP for ${s.name} (${s.cost} MP).`, 1600); sfx('miss'); return; }
      if (s.x[3]) { toast(String(s.x[1] || 'Not available right now.').slice(0, 160), 2400); sfx('miss'); return; }
      feel(el);
      // run the battle's own command, with its target step answered for you
      const op = Battle.pickTarget; let used = false;
      Battle.pickTarget = function (a2, cb) { used = true; Battle.pickTarget = op; const tt = target(a2 || a); Battle.closeMenu(); cb(tt); };
      go(() => { try { s.x[2](); } catch (e) { console.warn(e); } finally { if (!used) setTimeout(() => { if (!used) Battle.pickTarget = op; }, 4000); } });
    }));
    place();
  }
  // float the bar just above the fighter's head, clear of the party boxes and the turn-order strip
  function place() {
    const c = cur; if (!c || bar.classList.contains('hide')) return;
    const a = c.a, fh = G.view.fullH || G.view.h, W = bar.offsetWidth || 300, H = bar.offsetHeight || 90;
    const sx = a.x / G.view.w * innerWidth, sy = (a.y - 66 * BT_SCALE * (a.size || 1)) / fh * innerHeight;
    let top = 8; for (const el of document.querySelectorAll('#bparty')) { const r = el.getBoundingClientRect(); if (r.height) top = Math.max(top, r.bottom + 4); }
    bar.style.left = Math.max(8, Math.min(innerWidth - W - 58, sx - W / 2)) + 'px';
    bar.style.top = Math.max(top, Math.min(innerHeight - H - 96, sy - H)) + 'px';
  }
  addEventListener('resize', place);

  function show(a, done, reopen, L) {
    cur = { a, done, reopen, list: moves(a, L || []) }; turns++;
    chip.innerHTML = `<b>${a.name}</b> · tap an enemy or ⚔ Attack · moves are above ${a.isMe ? 'you' : a.name} · ◉ menu`;
    chip.classList.toggle('hide', turns > 6 && !(G.settings && G.settings.hints));
    bar.classList.remove('hide'); render();
  }

  // tap an enemy to attack it
  const enemyAt = (cx, cy) => { const B = Battle.B; if (!B) return null; const x = cx / innerWidth * G.view.w, y = cy / innerHeight * (G.view.fullH || G.view.h);
    let best = null, bd = 90; for (const e of Battle.alive('e')) { const d = Math.hypot(e.x - x, e.y - 30 * (e.size || 1) - y); if (d < bd) { bd = d; best = e; } } return best; };
  let g = null;
  cv.addEventListener('pointerdown', e => { if (!cur || G.mode !== 'battle' || (Battle.B && Battle.B.targeting)) return; g = { x: e.clientX, y: e.clientY }; }, true);
  cv.addEventListener('pointerup', e => {
    if (!cur || !g) return; const d = Math.hypot(e.clientX - g.x, e.clientY - g.y), x0 = g.x, y0 = g.y; g = null;
    if (d < 26) { const t = enemyAt(x0, y0); if (!t) return; sfx('blip'); go(c => Battle.doAttack(c.a, t).then(c.done)); }
  });

  if (typeof CombatX !== 'undefined') {
    const _m = CombatX.menu.bind(CombatX);
    CombatX.menu = function (a, L, done, resolve, reopen) {
      _m(a, L, done, resolve, reopen);
      // the Four Cuts combo system is retired: Attack lives on the ⚔ button, techniques on the move bar
      for (let i = L.length - 1; i >= 0; i--) if (/^(Attack|Four (Cuts|Lines|Strikes|Shadows))$/.test(L[i][0])) L.splice(i, 1);
      // read the menu once every other part of the game has added its commands
      setTimeout(() => { try { if (Battle.B && Battle.menuL && !Battle.B.targeting) show(a, () => { hide(); done(); }, reopen, Battle.menuL); } catch (e) { console.warn(e); } }, 0);
    };
  }
  // remember who you last hit, so moves go at the same enemy
  const _da = Battle.doAttack.bind(Battle);
  Battle.doAttack = function (a, t) { if (a) a.lastTarget = t; return _da(a, t); };
  // Last Light's bond grows when you use Vane's techniques
  if (Battle.useArt && typeof FOUR !== 'undefined') { const _ua = Battle.useArt.bind(Battle);
    Battle.useArt = function (a, k) { const r = _ua(a, k); try { if (a && a.isMe && ARTS[k] && MoveBar.isPhys(ARTS[k].name)) Promise.resolve(r).then(() => FOUR.bondXp(3)); } catch (e) { } return r; }; }
  const _cm = Battle.closeMenu.bind(Battle);
  Battle.closeMenu = function () { const r = _cm(); hide(); return r; };
  // test hooks
  window.__padAttack = () => { if (!cur) return false; const t = Battle.alive('e')[0]; if (!t) return false; go(c => Battle.doAttack(c.a, t).then(c.done)); return true; };
  window.__mbar = () => cur ? { tab, list: cur.list.map(x => x[0]), html: bar.innerHTML.length } : null;
  setInterval(() => { if (!Battle.B && cur) hide(); else if (cur) place(); }, 400);
})();
