/* ============================================================================
   BOSS PATTERNS & LAST STANDS
   - Bosses never fight like mobs. Every boss attack is a fixed, learnable combo:
     regular attacks are 3–4 hits, heavier ones 5 hits with projectiles, and each
     boss has a SIGNATURE of 8–12 hits with feints, snaps and unguardable blows.
     Bosses cycle their attacks in a set rotation, so the fight can be studied.
   - Strong mobs and great beasts (not bosses) get one DESPERATE FLURRY when
     they are close to death: 7 hits, projectiles mixed in, then they're winded.
   ========================================================================== */
(function () {
  const BT = Battle;
  const TIERS = ['E', 'D', 'C', 'B', 'A', 'S', 'SS', 'SSS', 'SSSS'];
  const tierOf = e => Math.max(0, TIERS.indexOf(TIER[e.key] || 'E'));
  const BEAST = /lupine|alpha|troll|wyrm|drake|lizard|tusker|minotaur|wartotaur|gourd|bear|boar|spider|will_|lich|vampire/;
  // a tiny seeded random: the same boss + attack always builds the same pattern
  const seeded = str => { let h = 2166136261; for (const ch of str) { h ^= ch.charCodeAt(0); h = Math.imul(h, 16777619); } return () => { h += 0x6D2B79F5; let t = h; t = Math.imul(t ^ t >>> 15, t | 1); t ^= t + Math.imul(t ^ t >>> 7, t | 61); return ((t ^ t >>> 14) >>> 0) / 4294967296; }; };
  const pickR = (r, a) => a[Math.floor(r() * a.length)];

  function isBoss(e) {
    const B = BT.B; if (!B || !e || e.side !== 'e' || !e.E || e.E.fixed || B.tutorial || B.leafTrain) return false;
    if (e.E.boss) return true;
    if (B.cfg && B.cfg.boss) { const es = B.actors.filter(a => a.side === 'e'); const top = es.slice().sort((x, y) => y.maxHp - x.maxHp)[0]; return top === e && !e.summoned; }
    return false;
  }
  function mobFlurry(e) {
    const B = BT.B; if (!B || !e || e.side !== 'e' || !e.E || e.E.fixed || B.tutorial || B.leafTrain || isBoss(e)) return false;
    if (/^(kairo|vane|dread)/.test(e.key)) return false;
    return tierOf(e) >= 2 || /alpha|troll|drake|wyrm|minotaur|wartotaur|tusker/.test(e.key);
  }
  function animsOf(e) {
    const all = [].concat(...e.E.skills.filter(s => s.hits).map(s => s.hits.map(h => h.anim)));
    const melee = [...new Set(all.filter(a => a && a !== 'spellcast'))];
    return { melee: melee.length ? melee : ['slash'], cast: all.includes('spellcast'), jump: all.includes('jump') ? 'jump' : all.includes('run') ? 'run' : null };
  }
  function projOf(e, sk) {
    const el = (typeof elOf === 'function' && sk && elOf(sk)) || (sk && SKILL_EL[sk.name]);
    if (el && PROJ[el]) return el;
    for (const s of e.E.skills) { const x = SKILL_EL[s.name]; if (x && PROJ[x]) return x; }
    if (e.E.drag) return 'mana';
    if (BEAST.test(e.key)) return 'wind';
    return pickR(seeded(e.key), ['knife', 'knife', 'axe', 'spear']);
  }
  // letters → hits.  m = melee  s = snap  f = feint  p = projectile  u = unguardable blow  q = unguardable blast
  function build(e, sk, letters, total, P) {
    const A = animsOf(e), pk = projOf(e, sk), n = letters.length;
    const per = total / (n + .6);
    let mi = 0;
    return letters.map((L, i) => {
      const last = i === n - 1, m = +(per * (last ? 1.6 : 1)).toFixed(2);
      const melee = () => A.melee[mi++ % A.melee.length];
      let h;
      if (L === 'p') h = { anim: A.cast ? 'spellcast' : melee(), proj: pk, m, w: 520 };
      else if (L === 'q') h = { anim: A.cast ? 'spellcast' : melee(), proj: PROJ[pk] && PROJ[pk].orb ? pk : 'mana', m: m * 1.2, w: 720, unp: 1 };
      else if (L === 'u') h = { anim: A.jump || melee(), m: m * 1.2, w: 640, unp: 1 };
      else h = { anim: melee(), m, w: L === 'f' ? 470 : 400, style: L === 's' ? 'snap' : L === 'f' ? 'feint' : 'normal' };
      if (!h.style) h.style = 'normal';
      if (P) h.w = Math.round(h.w * P.tempo + P.jit[i % 12]);
      if (i === 0) h.w += 160; // a beat to read the opener
      return h;
    });
  }
  /* ---------- every pattern is generated from the same rules, and no two are alike ----------
     basic  3–4 hits: opens with a blade or a throw, at least one trick (snap, feint or projectile), never unguardable
     heavy  5 hits:   at least one projectile, at least one snap or feint, often ends on an unguardable blow
     sig    8–12:     2+ projectiles, a feint, a snap, an unguardable in the middle, ends unguardable
     last   7 hits:   a mob's last stand — projectiles, a feint, ends unguardable
     and nothing repeats the same move 4 times in a row. */
  const RULES = {
    basic: { len: [3, 4], w: { m: 5, s: 2, f: 2, p: 2 }, ok: L => 'mp'.includes(L[0]) && /[sfp]/.test(L.join('')) },
    heavy: { len: [5, 5], w: { m: 4, s: 2, f: 2, p: 3 }, end: .5, ok: L => L.includes('p') && /[sf]/.test(L.join('')) },
    sig: { len: [8, 12], w: { m: 4, s: 3, f: 3, p: 3, u: 1, q: 1 }, end: 1, ok: L => L.filter(x => x === 'p').length >= 2 && L.includes('f') && L.includes('s') && /[uq]/.test(L.slice(1, -1).join('')) },
    last: { len: [7, 7], w: { m: 4, s: 2, f: 2, p: 3 }, end: 1, ok: L => L.filter(x => x === 'p').length >= 2 && L.includes('f') }
  };
  const USED = new Set();
  function genPattern(kind, seed) {
    const R = RULES[kind];
    for (let salt = 0; salt < 400; salt++) {
      const r = seeded(seed + '#' + salt), n = R.len[0] + Math.floor(r() * (R.len[1] - R.len[0] + 1));
      const bag = Object.entries(R.w).flatMap(([k, v]) => Array(v).fill(k));
      const L = []; while (L.length < n) L.push(pickR(r, bag));
      if (R.end && r() < R.end) L[n - 1] = r() < .65 ? 'u' : 'q';
      if (/(.)\1\1\1/.test(L.join('')) || !R.ok(L)) continue;
      const key = kind + ':' + L.join('');
      if (USED.has(key)) continue;
      USED.add(key); return L;
    }
    return ['m', 'f', 'p', 'm', 'u'];
  }
  // build every enemy's moves once, in a fixed order, so the patterns are the same in every playthrough
  const PLAN = {};
  function planOf(key) {
    if (PLAN[key]) return PLAN[key];
    const E = ENEMY[key], sk = (E && E.skills || []).filter(s => s.hits && s.hits.length);
    if (!sk.length) return (PLAN[key] = null);
    let sigIx = -1, sc = -1;
    sk.forEach((s, i) => { if (i === 0 && sk.length > 1) return; const v = (s.hits.some(h => h.unp) ? 2 : 0) + (1 - (s.w ?? .3)) + rawM(s) * .2; if (v > sc) { sc = v; sigIx = i; } });
    if (sk.length === 1) sigIx = -1;
    const P = { sigIx, pat: {}, last: genPattern('last', key + '|last') };
    sk.forEach((s, i) => { P.pat[s.name] = genPattern(i === sigIx ? 'sig' : i === 0 ? 'basic' : 'heavy', key + '|' + s.name); });
    if (sigIx < 0) P.extraSig = genPattern('sig', key + '|sig');
    // each boss has its own rhythm too: some fast and clipped, some slow and heavy
    const r = seeded(key + '|tempo'); P.tempo = .85 + r() * .3; P.jit = Array.from({ length: 12 }, () => Math.round((r() - .5) * 120));
    return (PLAN[key] = P);
  }
  const rawM = sk => (sk.hits || []).reduce((s, h) => s + (h.m || 1), 0) || 1;
  // every boss gets a fixed moveset: which of its attacks is basic, heavy or signature
  function moveset(e) {
    if (e._moves) return e._moves;
    const sk = e.E.skills.filter(s => s.hits && s.hits.length);
    if (!sk.length) return (e._moves = null);
    const P = planOf(e.key);
    const tot = { basic: s => rawM(s) * 1.25, heavy: s => Math.max(rawM(s), 1.2) * 1.5, sig: s => Math.max(rawM(s), 1.6) * 2.1 };
    const moves = sk.map((s, i) => {
      const kind = i === P.sigIx ? 'sig' : i === 0 ? 'basic' : 'heavy';
      return { base: s, kind, name: s.name, hits: build(e, s, P.pat[s.name], tot[kind](s), P) };
    });
    if (P.extraSig) moves.push({ base: sk[0], kind: 'sig', name: sk[0].name + ' — Unleashed', hits: build(e, sk[0], P.extraSig, tot.sig(sk[0]), P) });
    const B = moves.find(m => m.kind === 'basic'), H = moves.filter(m => m.kind === 'heavy'), S = moves.find(m => m.kind === 'sig');
    // the rotation the player can learn: basic, heavy, basic, heavy, SIGNATURE …
    const rot = [B, H[0] || B, B, H[1] || H[0] || B, S].filter(Boolean);
    return (e._moves = { moves, rot });
  }

  /* ---------- bosses pick from their rotation ---------- */
  const _cs = BT.chooseSkill.bind(BT);
  BT.chooseSkill = function (e) {
    if (!isBoss(e) || (e.faith && Math.random() < .45)) return _cs(e);
    const M = moveset(e); if (!M) return _cs(e);
    e._rot = ((e._rot ?? -1) + 1) % M.rot.length;
    const mv = M.rot[e._rot];
    return Object.assign({}, mv.base, { name: mv.name, hits: mv.hits, __mv: mv.kind });
  };

  /* ---------- a boss attack that came from somewhere else (scripted turns) still becomes its combo ---------- */
  const _es = BT.enemyStrike.bind(BT);
  BT.enemyStrike = async function (e, t, sk, isCounter) {
    const B = this.B;
    if (!isCounter && sk && sk.hits && !sk.__mv && !sk.__flurry && !sk.faith && isBoss(e)) {
      const M = moveset(e), mv = M && M.moves.find(m => m.base.name === sk.name);
      if (mv) sk = Object.assign({}, sk, { name: mv.name, hits: mv.hits, __mv: mv.kind });
    }
    if (sk && (sk.__mv || sk.__flurry) && !isCounter) {
      const n = sk.hits.length, sig = sk.__mv === 'sig' || sk.__flurry;
      if (sig) {
        B.dim = .45; B.dimCol = sk.__flurry ? '90,0,0' : '40,0,30'; B.shake = 10; sfx('alarm');
        this.text(e, sk.__flurry ? '☠ LAST STAND' : '★ SIGNATURE', '#ff5050', -78, true);
        this.facePop && this.facePop(e, ['shout', 'power', 'anger']);
        await wait(650); B.dim = 0;
      }
      sk = Object.assign({}, sk, { name: `${sk.name}  ·  ${n}-HIT` });
      B.combo = { e, n, i: 0, near: false, clashes: 0, ok: 0, got: 0 };
      const r = await _es(e, t, sk, isCounter);
      const C = B.combo; B.combo = null;
      if (!e.ko && Math.abs(e.x - e.hx) > 8) await this.home(e);
      if (sk.__mv && !G.S.f.patTip) { G.S.f.patTip = 1; toast('<b>Bosses fight in set patterns.</b> The same attack is always the same combo, and they cycle in order. Learn it — then defend every hit for a FLAWLESS read.', 6000); }
      if (C && C.i === n && C.ok === n && !e.ko && !t.ko) {
        this.text(e, sig ? 'FLAWLESS! — THEY\'RE OPEN' : 'READ PERFECTLY', '#ffe36a', -60, true); sfx('level');
        e.brk += sig ? 40 : 14; this.checkBreak(e); if (t.isMe) { t.mp = Math.min(t.maxMp, t.mp + (sig ? 5 : 2)); }
        G.S.f.flawless = (G.S.f.flawless || 0) + 1;
      }
      if (sk.__flurry && !e.ko) { e.wait += 90 / Math.max(1, e.spd); this.text(e, 'WINDED', '#c9c9c9', -40); }
      this.hud(); return r;
    }
    return _es(e, t, sk, isCounter);
  };

  /* ---------- inside a combo: step in for blades, step back to throw ---------- */
  const _def = BT.defend.bind(BT);
  BT.defend = async function (e, t, h) {
    const B = this.B, C = B && B.combo;
    if (C && C.e === e) {
      C.i++;
      const far = Math.abs(e.x - e.hx) < 8;
      if (h.proj && !far) await this.dash(e, e.hx, e.hy, 170);
      else if (!h.proj && far) await this.dash(e, t.x - 54, t.y + 2, 190);
      this.text(e, `${C.i} / ${C.n}`, C.i === C.n ? '#ff7a7a' : '#ffffff', -92);
      const r = await _def(e, t, h);
      if (['parry', 'pparry', 'dodge', 'pdodge'].includes(r)) C.ok++;
      return r;
    }
    return _def(e, t, h);
  };
  // one clash per combo at most — keep the rhythm going
  const _cl = BT.clash.bind(BT);
  BT.clash = async function (e, t, n) { const C = this.B && this.B.combo; if (C) { if (C.clashes++ || C.i < C.n - 1) return; } return _cl(e, t, n); };

  /* ---------- strong mobs and great beasts: one desperate flurry near death ---------- */
  const _et = BT.enemyTurn.bind(BT);
  BT.enemyTurn = async function (e) {
    const B = this.B;
    if (!e.ko && !e.flurried && mobFlurry(e) && e.hp <= e.maxHp * .3 && !e.bind) {
      e.flurried = 1;
      const base = e.E.skills.filter(s => s.hits)[0];
      const P = planOf(e.key);
      const hits = build(e, base, P.last, rawM(base) * 1.9, P);
      await this.msg(`${e.name} won't go down quietly…`, 900);
      const ps = this.alive('p'), me = ps.find(p => p.isMe), t = me && !me.veil ? me : pick(ps);
      if (t) { await this.enemyStrike(e, t, { name: 'Desperate Flurry', hits, __flurry: 1 }, false); return; }
    }
    return _et(e);
  };

  try { Object.keys(ENEMY).sort().forEach(planOf); } catch (e) { console.warn('plan', e); }
  window.BossPlan = PLAN;
  /* ---------- trophy ---------- */
  if (typeof FEATS !== 'undefined') FEATS.push(['flawless', '★', 'Studied', 'Defend every hit of a boss combo or last stand.', S => !!S.f.flawless]);
})();
