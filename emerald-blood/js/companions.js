'use strict';
/* ================= COMPANIONS: mounts (tamed, ridden, flown) and familiars ================= */

/* ---------- mount painter: side / front / back views, 64×64 cells, ground at y≈58 ---------- */
const MPAL = {
  horse: { b: '#8a5a34', d: '#5e3a1e', m: '#2e1c10', l: '#c89a6a' },
  wolf: { b: '#6e7480', d: '#4a4e58', m: '#2c2f36', l: '#b8bec8' },
  boar: { b: '#7a5a3e', d: '#55402c', m: '#3a2a1c', l: '#e8e0c8' },
  stag: { b: '#e8eef6', d: '#b8c4d4', m: '#8fb8e0', l: '#9fe4ff' },
  drake: { b: '#c4452c', d: '#8a2a1a', m: '#ffb04a', l: '#ffd36a' },
  wyvern: { b: '#3a6a4e', d: '#24442f', m: '#9fe4a8', l: '#d8f0c0' }
};
function paintMount(kind, dir, f, part) {
  const c = document.createElement('canvas'); c.width = 64; c.height = 64; const x = c.getContext('2d'); x.imageSmoothingEnabled = false;
  const P = MPAL[kind], fly = kind === 'wyvern';
  const R = (col, a, b, w, h) => { x.fillStyle = col; x.fillRect(Math.round(a), Math.round(b), w, h); };
  const E = (col, cx, cy, rx, ry) => { x.fillStyle = col; x.beginPath(); x.ellipse(cx, cy, rx, ry, 0, 0, 7); x.fill(); };
  const sw = Math.sin(f / 8 * Math.PI * 2) * 3, lift = fly ? -10 + Math.sin(f / 8 * Math.PI * 2) * 2 : 0;
  if (dir === 'left') { x.translate(64, 0); x.scale(-1, 1); dir = 'right'; }
  if (dir === 'right') {
    const BK = part !== 'front', FR = part !== 'back';
    const big = kind === 'wyvern' ? 1.25 : kind === 'boar' ? 1.05 : 1, cy = 44 + lift;
    if (BK && fly) { const wf = Math.sin(f / 8 * Math.PI * 2); x.fillStyle = P.d; x.beginPath(); x.moveTo(28, cy - 4); x.lineTo(10 - wf * 4, cy - 26 + wf * 14); x.lineTo(40, cy - 6); x.fill(); }
    if (BK) { // tail
    x.strokeStyle = kind === 'horse' ? P.m : P.d; x.lineWidth = kind === 'wolf' ? 5 : 3; x.beginPath(); x.moveTo(18, cy - 2);
    x.quadraticCurveTo(kind === 'wolf' ? 8 : 6, cy - (kind === 'wolf' ? 10 : -4), kind === 'drake' || fly ? 2 : 10, cy + (kind === 'drake' || fly ? 2 : 8)); x.stroke();
    // legs
    const legs = fly ? [] : kind === 'boar' ? [22, 27, 37, 42] : [21, 26, 38, 43], lh = kind === 'boar' ? 8 : kind === 'drake' ? 9 : 12;
    legs.forEach((lx, i) => R(i % 2 ? P.d : P.b, lx + (i < 2 ? sw : -sw) * (i % 2 ? -1 : 1), cy + 4, 3, lh));
    legs.forEach((lx, i) => R(P.m, lx + (i < 2 ? sw : -sw) * (i % 2 ? -1 : 1), cy + 3 + lh, 3, 2));
    if (fly) { R(P.d, 26, cy + 6, 3, 5); R(P.d, 36, cy + 6, 3, 5); }
    }
    if (!FR) return c;
    // body
    E(P.d, 32, cy + 1, 16 * big, 8 * big); E(P.b, 32, cy, 15 * big, 7 * big); R('rgba(255,255,255,.12)', 22, cy - 6, 20, 2);
    // neck + head
    if (kind === 'horse' || kind === 'stag') { x.fillStyle = P.b; x.beginPath(); x.moveTo(40, cy - 3); x.lineTo(46, cy - 18); x.lineTo(51, cy - 16); x.lineTo(46, cy + 2); x.fill(); E(P.b, 51, cy - 17, 7, 4); R(P.d, 55, cy - 17, 3, 2); R('#111', 50, cy - 19, 2, 2); R(P.b, 46, cy - 23, 2, 4);
      if (kind === 'horse') { x.fillStyle = P.m; x.fillRect(42, cy - 20, 4, 14); }
      else { x.strokeStyle = P.l; x.lineWidth = 2; x.beginPath(); x.moveTo(48, cy - 21); x.lineTo(44, cy - 32); x.moveTo(46, cy - 27); x.lineTo(40, cy - 30); x.moveTo(50, cy - 21); x.lineTo(54, cy - 32); x.moveTo(52, cy - 27); x.lineTo(58, cy - 30); x.stroke(); } }
    if (kind === 'wolf') { E(P.b, 48, cy - 7, 7, 6); R(P.b, 52, cy - 7, 7, 4); R('#111', 58, cy - 7, 2, 2); x.fillStyle = P.d; x.beginPath(); x.moveTo(44, cy - 11); x.lineTo(46, cy - 19); x.lineTo(49, cy - 11); x.fill(); R('#ffd34a', 49, cy - 9, 2, 2); }
    if (kind === 'boar') { E(P.b, 49, cy + 1, 8, 7); R(P.d, 54, cy, 6, 5); R(P.l, 56, cy + 4, 2, 5); R('#111', 50, cy - 3, 2, 2); R(P.m, 30, cy - 8, 14, 3); }
    if (kind === 'drake' || fly) { x.fillStyle = P.b; x.beginPath(); x.moveTo(42, cy - 2); x.lineTo(50, cy - 14); x.lineTo(54, cy - 12); x.lineTo(46, cy + 2); x.fill(); E(P.b, 54, cy - 14, 7, 4); R(P.m, 58, cy - 13, 3, 2); R('#ffe36a', 54, cy - 16, 2, 2);
      R(P.d, 49, cy - 20, 2, 5); R(P.d, 53, cy - 21, 2, 5); if (!fly) { x.fillStyle = P.d; x.beginPath(); x.moveTo(26, cy - 4); x.lineTo(32, cy - 14); x.lineTo(38, cy - 4); x.fill(); } }
    if (fly && part !== 'front') { const wf = Math.sin(f / 8 * Math.PI * 2); x.fillStyle = P.b; x.beginPath(); x.moveTo(30, cy - 4); x.lineTo(16 - wf * 4, cy - 30 + wf * 16); x.lineTo(26 - wf * 2, cy - 18 + wf * 8); x.lineTo(44, cy - 6); x.fill(); x.strokeStyle = P.m; x.lineWidth = 1; x.stroke(); }
    // saddle
    R('#5a2a1a', 28, cy - 8, 10, 4); R('#c9a24a', 28, cy - 5, 10, 1);
    return c;
  }
  // front (down) / back (up)
  const cy = 46 + lift, wide = kind === 'boar' ? 11 : kind === 'wyvern' ? 12 : 9;
  if (part !== 'front') {
    if (fly) { const wf = Math.sin(f / 8 * Math.PI * 2); x.fillStyle = P.d; for (const s of [-1, 1]) { x.beginPath(); x.moveTo(32 + s * 6, cy - 6); x.lineTo(32 + s * 30, cy - 18 + wf * 12); x.lineTo(32 + s * 26, cy - 2 + wf * 6); x.fill(); } }
    if (!fly) [[-6, sw], [3, -sw]].forEach(([lx, o]) => { R(P.d, 32 + lx, cy + 4 + Math.max(0, o), 4, 10 - Math.max(0, o)); R(P.m, 32 + lx, cy + 13, 4, 2); });
    E(P.d, 32, cy + 1, wide + 1, 9); E(P.b, 32, cy, wide, 8);
    if (dir === 'up') { x.strokeStyle = P.m; x.lineWidth = 3; x.beginPath(); x.moveTo(32, cy + 6); x.lineTo(32 + sw, cy + 14); x.stroke(); }
    R('#5a2a1a', 27, cy - 7, 10, 5);
  }
  if (dir === 'down' && part !== 'back') {
    // head in front of the rider
    if (kind === 'horse' || kind === 'stag') { R(P.b, 29, cy - 2, 6, 10); E(P.b, 32, cy + 8, 4, 4); R('#111', 29, cy + 1, 1, 2); R('#111', 34, cy + 1, 1, 2); if (kind === 'horse') R(P.m, 30, cy - 4, 4, 5);
      else { x.strokeStyle = P.l; x.lineWidth = 2; x.beginPath(); x.moveTo(29, cy - 2); x.lineTo(23, cy - 12); x.moveTo(35, cy - 2); x.lineTo(41, cy - 12); x.stroke(); } }
    if (kind === 'wolf') { E(P.b, 32, cy + 4, 6, 5); R(P.d, 30, cy + 6, 4, 4); R('#ffd34a', 29, cy + 2, 2, 1); R('#ffd34a', 34, cy + 2, 2, 1); x.fillStyle = P.d; x.beginPath(); x.moveTo(26, cy + 1); x.lineTo(27, cy - 6); x.lineTo(30, cy); x.moveTo(38, cy + 1); x.lineTo(37, cy - 6); x.lineTo(34, cy); x.fill(); }
    if (kind === 'boar') { E(P.b, 32, cy + 5, 8, 6); E(P.d, 32, cy + 8, 4, 3); R(P.l, 27, cy + 7, 2, 4); R(P.l, 36, cy + 7, 2, 4); }
    if (kind === 'drake' || fly) { E(P.b, 32, cy + 4, 6, 6); R(P.m, 30, cy + 7, 4, 3); R('#ffe36a', 29, cy + 2, 2, 2); R('#ffe36a', 34, cy + 2, 2, 2); R(P.d, 27, cy - 6, 2, 5); R(P.d, 36, cy - 6, 2, 5); }
  }
  return c;
}
const MCache = {};
function mountFrame(kind, dir, f, part) { const k = kind + dir + (f % 8) + (part || ''); return MCache[k] || (MCache[k] = paintMount(kind, dir, f % 8, part)); }
function mountSheet(kind) { // an OW-format sheet for wild mounts standing in the world
  const k = 'sheet_' + kind; if (MCache[k]) return MCache[k];
  const S = document.createElement('canvas'); S.width = 64 * 9; S.height = 64 * 12; const x = S.getContext('2d');
  const dirs = ['up', 'left', 'down', 'right'];
  for (let r = 0; r < 12; r++) for (let f = 0; f < 9; f++) { const d = dirs[r % 4]; x.drawImage(mountFrame(kind, d, r < 4 ? 0 : f, 'back'), f * 64, r * 64); x.drawImage(mountFrame(kind, d, r < 4 ? 0 : f, 'front'), f * 64, r * 64); }
  // no saddle on a wild beast: cheap trick — leave it; it reads as "harness of a previous rider"
  return (MCache[k] = S);
}

const MOUNTS = {
  mare: { name: 'Vale Mare', kind: 'horse', grade: 'E', ms: 120, diff: .8, where: ['woods', 20, 21], desc: 'A wild brown mare that grazes in the East Woods. Gentle, quick, and suspicious of anything with green eyes.', act: { name: 'Hoof Kick', m: .45 } },
  lupine: { name: 'Dire Lupine', kind: 'wolf', grade: 'D', ms: 110, diff: 1.1, where: ['woods', 35, 11], fight: ['lupine_alpha'], desc: 'A lupine bigger than a pony. It only respects someone who beat it first.', act: { name: 'Lupine Rend', m: .6 } },
  boar: { name: 'Bog Boar', kind: 'boar', grade: 'C', ms: 125, diff: 1.3, where: ['mill', 24, 18], fight: ['m_tusker', 'm_tusker'], desc: 'Slow to start, impossible to stop. Charges through anything in battle.', act: { name: 'Tusk Charge', m: .8, all: 1 } },
  stag: { name: 'Crystal Stag', kind: 'stag', grade: 'B', ms: 95, diff: 1.55, where: ['woods', 24, 8], fight: ['m_minotaur'], desc: 'A white stag with antlers of living crystal. It only appears to those strong enough to protect it.', act: { name: 'Prism Antlers', m: .7, heal: .12 } },
  drake: { name: 'Ember Drake', kind: 'drake', grade: 'A', ms: 88, diff: 1.8, where: ['d_crystal', 'start'], fight: ['m_drake', 'm_drake'], desc: 'A young drake from the Crystal Hollow. Breathes fire in battle; refuses to be ridden by anyone weaker than itself.', act: { name: 'Drake Breath', m: .9, all: 1 } },
  wyvern: { name: 'Storm Wyvern', kind: 'wyvern', grade: 'S', ms: 72, fly: 1, diff: 2.2, where: ['d_crystal', 'boss'], fight: ['bq_wyvern'], desc: 'The king of mounts. Flies over rooftops, rivers and walls — and dives into battle beside you.', act: { name: 'Wyvern Dive', m: 1.2, all: 1 } }
};
Object.assign(ENEMY, { bq_wyvern: Object.assign({}, ENEMY.m_drake, { name: 'Storm Wyvern', img: 'm_drake', boss: 1, size: 1.7, hp: 620, atk: 27, def: 9, spd: 16, xp: 320, gold: 0, trait: 'Wild wyvern — beat it, then win its trust' }) });
TIER.bq_wyvern = 'S';

const Mounts = {
  owned() { return G.S.mounts = G.S.mounts || {}; },
  allowedHere() { const m = G.S.map, sc = SCENES[m]; return !(sc && sc.map && String(sc.map).startsWith('in_')) && !(sc && sc.dungeon) && m !== 'thornvale' && !G.S.kid; },
  cur() { const id = G.S && G.S.riding; return id && MOUNTS[id] && this.allowedHere() ? Object.assign({ id }, MOUNTS[id]) : null; },
  flying() { const m = this.cur(); return !!(m && m.fly); },
  speed(run) { const m = this.cur(); return m ? Math.round(m.ms * (run ? .8 : 1)) : (run ? 125 : 205); },
  ride(id) { if (id && !this.owned()[id]) return; if (!id && this.flying()) { const p = World.player; if (World.col[p.y][p.x]) { toast('You can\'t land here — find open ground.'); return; } } G.S.riding = id || null; sfx('blip'); toast(id ? `Riding: <b>${MOUNTS[id].name}</b>${MOUNTS[id].fly ? ' — you can fly over anything!' : ''}` : 'You dismount.', 2200); },
  gradeOk(id) { return GRADES.indexOf(Power.now().grade) >= GRADES.indexOf(MOUNTS[id].grade); },
  async spawn(W, name) {
    const D = W.map.dungeon;
    for (const [id, M] of Object.entries(MOUNTS)) {
      if (this.owned()[id] || M.where[0] !== name) continue;
      if (id === 'wyvern' && !G.S.f.clear_d_crystal) continue;
      let x, y; if (D) [x, y] = M.where[1] === 'boss' ? [D.boss[0] - 3, D.boss[1]] : [D.start[0] + 3, D.start[1] - 2]; else [x, y] = M.where.slice(1);
      let n = 0; while (n++ < 12 && (W.ents.some(e => e.x === x && e.y === y) || (W.col[y] && W.col[y][x]))) x++;
      W.ents.push(new Ent({ id: 'mount_' + id, x, y, dir: 'down', img: mountSheet(M.kind), name: M.name, ai: 'turn', turns: ['down', 'left', 'right'], talk: () => this.tame(id) }));
    }
  },
  async tame(id) {
    const M = MOUNTS[id];
    await narr(`${M.name}. ${M.desc}`);
    if (!this.gradeOk(id)) { await narr(`It looks straight through you. Whatever you are, it isn't impressed. (Needs power grade ${M.grade}.)`); return; }
    const c = await ask(null, null, M.fight ? 'It won\'t let anyone near until it has tested them.' : 'It watches you, ears flicking.', [M.fight ? 'Fight it' : 'Try to tame it', 'Leave it']);
    if (c !== 0) return;
    if (M.fight) {
      const r = await Battle.start({ enemies: M.fight, noFlee: true, intro: `TEST OF STRENGTH — ${M.name.toUpperCase()}` });
      if (r === 'lose') { await Story.defeat(); return; }
      if (r !== 'win') return;
      await narr('It stops fighting. It\'s breathing hard, watching you. Now — gently.');
    }
    const ok = await tameGame(M.name, M.diff);
    if (!ok) { await narr('It snorts, wheels away and is gone. It\'ll be back. They always come back to the same place.'); World.ents = World.ents.filter(e => e.id !== 'mount_' + id); return; }
    this.owned()[id] = 1; World.ents = World.ents.filter(e => e.id !== 'mount_' + id); sfx('level');
    await narr(`The ${M.name} lowers its head and lets you climb on. It's yours now — or you're its. (Menu → Companions to ride.)`);
    this.ride(id); save();
  }
};
/* ---------- the taming minigame: hold to rise, release to fall; keep the marker inside the moving calm zone ---------- */
function tameGame(name, diff) {
  Dlg.close();
  return new Promise(res => {
    const ov = document.createElement('div'); ov.className = 'ov'; ov.style.cssText = 'z-index:45;background:rgba(8,12,10,.9);flex-direction:column;gap:8px;user-select:none;-webkit-user-select:none;touch-action:none';
    ov.innerHTML = `<div style="font-family:'Press Start 2P';color:#ffd34a;font-size:13px">TAMING: ${name.toUpperCase()}</div><canvas width="600" height="150" style="width:min(92vw,600px)"></canvas><div style="font-size:14px">HOLD (or hold A) to lean in · let go to ease off · keep the marker inside the <b style="color:#7dffb0">green calm zone</b></div>`;
    document.body.appendChild(ov);
    const cv = ov.querySelector('canvas'), x = cv.getContext('2d'); let hold = false, pos = .5, vel = 0, zone = .5, zv = 0, trust = .35, t0 = performance.now(), last = t0, done = false;
    const zw = Math.max(.1, .24 / diff);
    const dn = e => { e.preventDefault(); hold = true; }, up = e => { e.preventDefault(); hold = false; };
    ov.addEventListener('pointerdown', dn); ov.addEventListener('pointerup', up); ov.addEventListener('pointercancel', up);
    const kd = e => { if ([' ', 'z', 'Z', 'Enter', 'a', 'A'].includes(e.key)) hold = true; }, ku = e => { if ([' ', 'z', 'Z', 'Enter', 'a', 'A'].includes(e.key)) hold = false; };
    window.addEventListener('keydown', kd); window.addEventListener('keyup', ku);
    const fin = ok => { if (done) return; done = true; sfx(ok ? 'perfect' : 'miss'); window.removeEventListener('keydown', kd); window.removeEventListener('keyup', ku); setTimeout(() => { ov.remove(); res(ok); }, 700); };
    const frame = () => {
      const now = performance.now(); if (done) return; const dt = Math.min(50, now - last) / 1000; last = now;
      zv += (Math.random() - .5) * 3.2 * diff * dt; zv *= .985; zone += zv * dt * 2.2; if (zone < zw / 2 || zone > 1 - zw / 2) { zv = -zv; zone = Math.max(zw / 2, Math.min(1 - zw / 2, zone)); }
      vel += (hold ? 1.1 : -1.0) * dt; vel *= .9; pos += vel * dt * 1.6; if (pos < 0) { pos = 0; vel = 0; } if (pos > 1) { pos = 1; vel = 0; }
      const inside = Math.abs(pos - zone) < zw / 2; trust += (inside ? .22 : -.075 * diff) * dt; trust = Math.max(0, Math.min(1, trust));
      if (trust >= 1) fin(true); if ((trust <= 0 && now - t0 > 5000) || now - t0 > 30000) fin(false);
      x.clearRect(0, 0, 600, 150);
      x.fillStyle = '#20262a'; x.fillRect(20, 40, 560, 34); x.fillStyle = 'rgba(70,224,112,.85)'; x.fillRect(20 + (zone - zw / 2) * 560, 40, zw * 560, 34);
      x.fillStyle = inside ? '#ffd34a' : '#ffffff'; x.fillRect(20 + pos * 560 - 3, 30, 6, 54);
      x.fillStyle = '#5a2a2a'; x.fillRect(20, 104, 560, 16); x.fillStyle = '#46e070'; x.fillRect(20, 104, 560 * trust, 16);
      x.fillStyle = '#fff'; x.font = '700 11px "Press Start 2P"'; x.fillText('TRUST', 20, 140); x.fillText(Math.ceil(30 - (now - t0) / 1000) + 's', 540, 24);
      requestAnimationFrame(frame);
    };
    requestAnimationFrame(frame);
  });
}

/* ---------- familiars ---------- */
const FAMS = {
  me: { get name() { return (G.S && G.S.dragonName) || 'Onyx'; }, species: 'Baby dragon', shape: 'dragon', c: ['#2c2e38', '#16171e', '#5fb4ff'], glow: '#8fd0ff', act: { t: 'strike', name: 'Tiny Breath', m: .6 },
    desc: 'A baby dragon, black as a starless night, with enormous blue eyes. It hatched from an egg you found in a ruined Drag shrine in the Realm of No Return. It eats like a whole village, sleeps on your head, and sneezes sparks. In a world that hangs people for being "dragon-blooded", nobody can ever see it.' },
  ilya: { name: 'Bun', species: 'Ribbon-hare', shape: 'hare', c: ['#ffd0e6', '#e07aa8', '#ffffff'], glow: '#ff9ad5', act: { t: 'heal', name: 'Nuzzle', m: .14 }, desc: 'A pink-eared hare with a green ribbon on one ear — the other half of your ribbon. Nobody knows how it got there.' },
  kairo: { name: 'Cinder', species: 'Ember crow', shape: 'crow', c: ['#26222a', '#0e0c10', '#ff7a3a'], glow: '#ff7a3a', act: { t: 'weaken', name: 'Ash Peck', m: .45 }, desc: 'A crow with coals for eyes that followed Kairo out of burning Thornvale. It pecks out weak points.' },
  liora: { name: 'Selene', species: 'Moon-owl', shape: 'owl', c: ['#f2f2ff', '#b8b8d8', '#ffd34a'], glow: '#e8e8ff', act: { t: 'guard', name: 'Silver Wing', m: 0 }, desc: 'A white owl that only flies at night — except for Liora. It shields her with its wings.' },
  kess: { name: 'Smudge', species: 'Shadow cat', shape: 'cat', c: ['#2a2234', '#120e18', '#c99bff'], glow: '#c99bff', act: { t: 'strike', name: 'Shadow Swipe', m: .55 }, desc: 'A cat that is mostly shadow and partly opinion. It steals things for Kess. Sometimes eyes.' },
  oren: { name: 'Clink', species: 'Forge salamander', shape: 'lizard', c: ['#ff9a3a', '#c4452c', '#ffe36a'], glow: '#ffb070', act: { t: 'mana', name: 'Warm Coals', m: 4 }, desc: 'Lived in Oren\'s forge for eleven years. Sleeps in the embers. Keeps everyone\'s blood warm.' },
  vane: { name: 'Old Grey', species: 'One-eyed hawk', shape: 'hawk', c: ['#9a9088', '#5e564e', '#ffd34a'], glow: '#d9e2ec', act: { t: 'strike', name: 'Talon', m: .5 }, desc: 'A hawk as old and as rude as Vane. Lost its eye the same week Vane lost his arm.' },
  seraphine: { name: 'Peal', species: 'Storm sparrow', shape: 'sparrow', c: ['#d6a8ff', '#7a4aa6', '#ffe14a'], glow: '#ffe14a', act: { t: 'shock', name: 'Static', m: .3 }, desc: 'A sparrow that crackles. It rides inside the great bell and rings it when Seraphine is angry.' },
  nana: { name: 'Moss', species: 'Elder tortoise', shape: 'tortoise', c: ['#6a8a4a', '#3e5a2a', '#c8b88a'], glow: '#9be37a', act: { t: 'heal', name: 'Slow Blessing', m: .1 }, desc: 'Older than Nana. Older than Thornvale. Nobody has ever seen it hurry.' },
  tamsin: { name: 'Ember', species: 'Red fox kit', shape: 'fox', c: ['#ff8a3a', '#b8501a', '#ffffff'], glow: '#ff9a52', act: { t: 'strike', name: 'Nip', m: .4 }, desc: 'A fox kit as fierce and loyal as she is.' },
  bo: { name: 'Pebble', species: 'Rock beetle', shape: 'beetle', c: ['#8a8a92', '#4a4a52', '#c8a27a'], glow: '#c8a27a', act: { t: 'guard', name: 'Shell Up', m: 0 }, desc: 'A beetle the size of a fist with a stone shell. Bo carries it everywhere. Very gently.' },
  lark: { name: 'Zip', species: 'Hummingbird', shape: 'sparrow', c: ['#5fd06a', '#2a7a3a', '#ffe066'], glow: '#ffe066', act: { t: 'strike', name: 'Zip!', m: .35 }, desc: 'Fast, nosy, and tiny. The perfect scout\'s familiar.' },
  dace: { name: 'Brute', species: 'Badger', shape: 'badger', c: ['#4a4a4a', '#1a1a1a', '#f2f2f2'], glow: '#ff7a3a', act: { t: 'strike', name: 'Maul', m: .5 }, desc: 'Picks fights with things ten times its size. Dace says that\'s why they get along.' },
  sefa: { name: 'Dew', species: 'Glow frog', shape: 'frog', c: ['#7fe8c0', '#2a8a6a', '#ffffff'], glow: '#7fe8c0', act: { t: 'heal', name: 'Dewdrop', m: .12 }, desc: 'A frog that glows softly and croaks lullabies. Sefa\'s patients sleep better with it near.' },
  nix: { name: 'Psalm', species: 'White dove', shape: 'sparrow', c: ['#ffffff', '#c8c8d8', '#ffd34a'], glow: '#ffffff', act: { t: 'heal', name: 'Hymn', m: .1 }, desc: 'The Inquisition gave Nix a dove. He named it after the prayers. He still talks to it in the old Drag tongue when no one is listening.' },
  dread: { name: 'Ruin', species: 'Black wyrmling', shape: 'lizard', c: ['#1e1e24', '#0a0a0e', '#46ff95'], glow: '#46ff95', act: { t: 'strike', name: 'Black Bite', m: .6 }, desc: 'A small black wyrm that rides on Dread\'s shoulder. Its eyes are green. So, Vane swears, are his.' },
  caspian: { name: 'Gale', species: 'Silver wind-hawk', shape: 'hawk', c: ['#e0e8f0', '#8a98a8', '#9fe4ff'], glow: '#cfe0ff', act: { t: 'strike', name: 'Gale Dive', m: .5 }, desc: 'Vane\'s Old Grey had one chick. Caspian took it when he left.' },
  cael: { name: 'Mercy', species: 'White wolf pup', shape: 'wolf', c: ['#f2f6ff', '#aab4c8', '#9fe4ff'], glow: '#e8f4ff', act: { t: 'weaken', name: 'Pale Howl', m: .3 }, desc: 'A white wolf pup Cael pulled from the ruins of his village. The only thing he is gentle with.' },
  varro: { name: 'Sovereign', species: 'Gilded hound', shape: 'wolf', c: ['#c8a050', '#8a6a2a', '#ffd34a'], glow: '#ffcf4a', act: { t: 'strike', name: 'Gilded Bite', m: .5 }, desc: 'A hound with a gold collar that has never once lost a scent. Varro calls it his only honest employee.' },
  iska: { name: 'Old Salt', species: 'Sea turtle', shape: 'tortoise', c: ['#4aa8a0', '#2a6a64', '#e8e0c8'], glow: '#4aa8ff', act: { t: 'heal', name: 'Tidewater', m: .1 }, desc: 'A sea turtle older than the pirate coast. It decides where Mother Brine\'s ships sail.' }
};
function paintFam(F, f) {
  const c = document.createElement('canvas'); c.width = 24; c.height = 24; const x = c.getContext('2d'); x.imageSmoothingEnabled = false;
  const [b, d, a] = F.c, R = (col, X, Y, w, h) => { x.fillStyle = col; x.fillRect(X, Y, w, h); }, E = (col, cx, cy, rx, ry) => { x.fillStyle = col; x.beginPath(); x.ellipse(cx, cy, rx, ry, 0, 0, 7); x.fill(); };
  const bob = f % 2, s = F.shape;
  if (['fox', 'cat', 'wolf', 'hare', 'badger'].includes(s)) {
    if (s === 'fox' || s === 'wolf') { x.strokeStyle = b; x.lineWidth = s === 'fox' ? 4 : 3; x.beginPath(); x.moveTo(6, 15); x.quadraticCurveTo(1, 10, 3, 5 + bob); x.stroke(); R(a, 2, 4 + bob, 2, 2); }
    if (s === 'cat') { x.strokeStyle = b; x.lineWidth = 2; x.beginPath(); x.moveTo(6, 15); x.quadraticCurveTo(2, 8, 5, 4 + bob); x.stroke(); }
    E(d, 12, 17, 7, 4); E(b, 12, 16, 6, 4); R(d, 7, 19, 2, 3); R(d, 15, 19, 2, 3);
    E(b, 17, 11 - bob * .5, 5, 4);
    if (s === 'hare') { R(b, 14, -1 - bob, 3, 10); R(b, 18, 0 - bob, 3, 9); R(d, 15, 1 - bob, 1, 6); R(d, 19, 2 - bob, 1, 5); R('#5fd06a', 13, 3 - bob, 5, 2); }
    else if (s === 'badger') { R(a, 15, 8, 6, 2); R(d, 13, 7, 2, 2); }
    else { x.fillStyle = b; x.beginPath(); x.moveTo(13, 9); x.lineTo(14, 4 - bob); x.lineTo(16, 8); x.moveTo(17, 8); x.lineTo(19, 4 - bob); x.lineTo(20, 9); x.fill(); }
    R(s === 'hare' ? '#111' : a, 18, 10, 2, 2); R(d, 21, 12, 2, 1);
  } else if (['crow', 'owl', 'hawk', 'sparrow'].includes(s)) {
    const wf = f % 2 ? -3 : 2;
    E(d, 12, 13, 6, 6); E(b, 12, 12, 5, 6);
    x.fillStyle = d; x.beginPath(); x.moveTo(8, 11); x.lineTo(1, 8 + wf); x.lineTo(8, 15); x.moveTo(16, 11); x.lineTo(23, 8 + wf); x.lineTo(16, 15); x.fill();
    if (s === 'owl') { E(b, 12, 7, 5, 4); R(a, 9, 6, 2, 2); R(a, 13, 6, 2, 2); R('#111', 9, 6, 1, 1); R('#111', 13, 6, 1, 1); R('#c8a050', 11, 9, 2, 2); }
    else { E(b, 12, 7, 3.5, 3); R(s === 'crow' ? a : '#111', 12, 6, 2, 2); R(s === 'hawk' ? '#ffd34a' : s === 'crow' ? '#222' : '#ffb04a', 15, 7, 3, 2); }
    R(d, 11, 18, 2, 3);
  } else if (['tortoise', 'beetle'].includes(s)) {
    E(d, 12, 16, 8, 5); E(b, 12, 15, 7, 5); R(a, 9, 13, 2, 2); R(a, 13, 12, 2, 2); R(a, 15, 15, 2, 2);
    if (s === 'beetle') { R(d, 18, 13, 3, 3); R(d, 20, 10, 1, 3); R(d, 21, 11, 1, 3); } else { E(a, 20, 15 - bob, 3, 2.5); R('#111', 21, 14 - bob, 1, 1); }
    R(d, 7, 19, 2, 2); R(d, 15, 19, 2, 2);
  } else if (s === 'frog') {
    E(d, 12, 17, 7, 4); E(b, 12, 15 - bob, 6, 5); E(b, 9, 10 - bob, 2.5, 2.5); E(b, 15, 10 - bob, 2.5, 2.5); R('#111', 9, 10 - bob, 1, 1); R('#111', 15, 10 - bob, 1, 1); R(a, 10, 17, 4, 1);
  } else if (s === 'dragon') {
    // chibi baby dragon: round body, big head, bat wings, stubby horns, huge blue eyes
    const wf = f % 2 ? -2 : 1;
    x.fillStyle = d; x.beginPath(); x.moveTo(8, 12); x.lineTo(0, 5 + wf); x.lineTo(2, 12); x.lineTo(5, 15); x.fill(); x.beginPath(); x.moveTo(16, 12); x.lineTo(24, 5 + wf); x.lineTo(22, 12); x.lineTo(19, 15); x.fill();
    x.strokeStyle = d; x.lineWidth = 2; x.beginPath(); x.moveTo(15, 20); x.quadraticCurveTo(22, 22, 22, 17 - bob); x.stroke();
    E(d, 12, 19, 6.5, 4.5); E(b, 12, 18, 6, 4);
    R(d, 7, 21, 3, 2); R(d, 14, 21, 3, 2);
    E(d, 12, 10 - bob * .5, 7.5, 6.5); E(b, 12, 9.5 - bob * .5, 7, 6);
    R(d, 6, 3 - bob, 2, 4); R(d, 16, 3 - bob, 2, 4); R(b, 7, 2 - bob, 1, 2); R(b, 16, 2 - bob, 1, 2);
    R(d, 10, 4 - bob, 1, 2); R(d, 13, 4 - bob, 1, 2);
    const ey = 9 - Math.round(bob * .5);
    R('#f2ead0', 7, ey, 4, 3); R('#f2ead0', 13, ey, 4, 3); R(a, 8, ey, 3, 3); R(a, 13, ey, 3, 3); R('#0a1830', 9, ey + 1, 1, 2); R('#0a1830', 14, ey + 1, 1, 2); R('#ffffff', 8, ey, 1, 1); R('#ffffff', 13, ey, 1, 1);
    R('#e07a8a', 11, ey + 4, 2, 1);
  } else if (s === 'lizard') {
    x.strokeStyle = d; x.lineWidth = 2; x.beginPath(); x.moveTo(6, 16); x.quadraticCurveTo(1, 18, 2, 12 + bob); x.stroke();
    E(d, 12, 16, 7, 3.5); E(b, 12, 15, 6, 3); E(b, 18, 12, 4, 3); R(a, 19, 11, 2, 1); R(d, 8, 18, 2, 3); R(d, 15, 18, 2, 3);
    if (F.name === 'Ruin') { x.fillStyle = d; x.beginPath(); x.moveTo(9, 13); x.lineTo(5, 6 + bob); x.lineTo(13, 12); x.fill(); }
  }
  return c;
}
const FCache = {};
function famImg(id, f) { const k = id + (f % 2); return FCache[k] || (FCache[k] = paintFam(FAMS[id], f)); }
const Familiars = {
  has(id) { if (id === 'me') return !G.S.kid && !!G.S.f.dragonHatched; return !!FAMS[id]; },
  async assist(a) {
    const B = Battle.B; if (!B) return; const key = a.isMe ? 'me' : a.id, F = FAMS[key];
    if (F && this.has(key)) {
      a.famCd = (a.famCd || 0) - 1;
      if (a.famCd <= 0 && Math.random() < .32) {
        a.famCd = 3; const A = F.act, es = Battle.alive('e'), ps = Battle.alive('p');
        await Battle.msg(`${F.name}: ${A.name}!`, 700);
        if (A.t === 'strike' || A.t === 'weaken') { const t = es[Math.floor(Math.random() * es.length)]; if (t) { Battle.spark(t.x, t.y - 30, F.glow, 12); Battle.damage(t, Math.max(1, Math.round(a.atk * A.m * rnd(.9, 1.1) - t.def * .4))); if (A.t === 'weaken') { t.atk = Math.max(1, Math.round(t.atk * .92)); Battle.text(t, 'ATK DOWN', '#ffb070', -20); } } }
        if (A.t === 'shock') for (const t of es) { Battle.spark(t.x, t.y - 30, F.glow, 8); Battle.damage(t, Math.max(1, Math.round(a.atk * A.m))); }
        if (A.t === 'heal') { const t = ps.slice().sort((p, q) => p.hp / p.maxHp - q.hp / q.maxHp)[0]; const h = Math.round(t.maxHp * A.m); t.hp = Math.min(t.maxHp, t.hp + h); Battle.text(t, '+' + h, '#7dffb0', -20); sfx('heal'); }
        if (A.t === 'guard') { a.guard = true; a.ward = Math.max(a.ward || 0, 1); Battle.text(a, 'SHIELDED', F.glow, -20); }
        if (A.t === 'mana') { a.mp = Math.min(a.maxMp, a.mp + A.m); Battle.text(a, '+' + A.m + ' MP', '#5fd8ff', -20); }
        Battle.hud();
      }
    }
    // the mount fights too
    const M = a.isMe && Mounts.cur();
    if (M && M.act) {
      B.mountCd = (B.mountCd ?? 1) - 1;
      if (B.mountCd <= 0) {
        B.mountCd = M.fly ? 2 : 3; const A = M.act, es = Battle.alive('e');
        await Battle.msg(`${M.name}: ${A.name}!`, 800); B.mountSwoop = performance.now(); sfx('swing');
        const tg = A.all ? es : [es[Math.floor(Math.random() * es.length)]];
        for (const t of tg) if (t) { Battle.spark(t.x, t.y - 30, '#ffd34a', 14); Battle.damage(t, Math.max(1, Math.round(a.atk * A.m * rnd(.9, 1.1) - t.def * .4)), M.fly); }
        if (A.heal) for (const p of Battle.alive('p')) { const h = Math.round(p.maxHp * A.heal); p.hp = Math.min(p.maxHp, p.hp + h); Battle.text(p, '+' + h, '#9fe4ff', -20); }
        Battle.hud(); if (!Battle.alive('e').length) return;
      }
    }
  }
};
// hook battle: assists before each party member's turn; draw familiars & the mount
(function () {
  const _pt = Battle.playerTurn.bind(Battle);
  Battle.playerTurn = async function (a) { try { await Familiars.assist(a); } catch (e) { console.warn(e); } if (!this.alive('e').length) return null; return _pt(a); };
  const _r = Battle.render.bind(Battle);
  Battle.render = function (c, t) {
    _r(c, t); const B = this.B; if (!B) return;
    for (const a of B.actors) if (a.side === 'p' && !a.ko) { const key = a.isMe ? 'me' : a.id; if (!FAMS[key] || !Familiars.has(key)) continue;
      const img = famImg(key, Math.floor(t / 300)); c.save(); c.imageSmoothingEnabled = false; c.globalAlpha = .95;
      const fs = 28 * (key === 'me' && typeof DRAGON_STAGE === 'function' ? DRAGON_STAGE()[1] : 1); c.drawImage(img, a.x - 30 - fs / 2, a.y - 2 - fs + Math.sin(t / 400 + a.x) * 3, fs, fs); c.restore(); }
    const me = this.me && this.me(), M = Mounts.cur();
    if (me && M) { const sw = B.mountSwoop && t - B.mountSwoop < 600 ? Math.sin((t - B.mountSwoop) / 600 * Math.PI) : 0;
      const img = mountFrame(M.kind, 'left', Math.floor(t / 110), 'back'); c.save(); c.imageSmoothingEnabled = false;
      const S = M.fly ? 120 : 96, sx = me.x + 62 - sw * (me.x - 180), sy = me.y + (M.fly ? -14 : 6) - sw * 20; c.drawImage(img, sx - S / 2, sy - S * .9, S, S); c.drawImage(mountFrame(M.kind, 'left', Math.floor(t / 110), 'front'), sx - S / 2, sy - S * .9, S, S); c.restore(); }
  };
})();
// hook the overworld: ride / fly, draw the mount under the player and the familiar beside them
(function () {
  const _draw = Ent.prototype.draw;
  Ent.prototype.draw = function (c, cx, cy, t) {
    if (!this.isPlayer) return _draw.call(this, c, cx, cy, t);
    const M = Mounts.cur();
    if (M) {
      const x = this.px - cx, y = this.py - cy, f = this.move ? Math.floor(this.walkT / 70) : 0, k = M.fly ? 1.9 : M.kind === 'boar' || M.kind === 'drake' ? 1.6 : 1.5, lift = M.fly ? 18 + Math.sin(t / 300) * 3 : 0;
      const side = this.dir === 'left' || this.dir === 'right', seat = side ? (M.fly ? 43 : M.kind === 'boar' ? 19 : M.kind === 'wolf' ? 20 : 23) * k / 1.5 : (M.fly ? 38 : 17) * k / 1.5;
      const S = 64 * k, ox = Math.round(x - S / 2), oy = Math.round(y - 58 * k - lift);
      c.fillStyle = 'rgba(0,0,0,.25)'; c.beginPath(); c.ellipse(x, y, (M.fly ? 26 : 18), M.fly ? 7 : 5, 0, 0, 7); c.fill();
      c.save(); c.imageSmoothingEnabled = false;
      c.drawImage(mountFrame(M.kind, this.dir, f, 'back'), ox, oy, S, S);
      drawOW(c, this.img_(), 'idle', this.dir, 0, x, y - seat - lift, this.alpha, this.size);
      c.drawImage(mountFrame(M.kind, this.dir, f, 'front'), ox, oy, S, S); c.restore();
    } else _draw.call(this, c, cx, cy, t);
    if (Familiars.has('me') && G.mode === 'world') { const img = famImg('me', Math.floor(t / 300)), x = this.px - cx, y = this.py - cy;
      const ox = this.dir === 'left' ? 18 : -18; c.save(); c.imageSmoothingEnabled = false; c.drawImage(img, Math.round(x + ox - 12), Math.round(y - 56 + Math.sin(t / 350) * 3), 24, 24); c.restore(); }
  };
  // movement: mount speed and flight
  const _free = World.free.bind(World);
  World.free = function (x, y, except) { if (except === this.player && Mounts.flying()) return this.inMap(x, y) && !this.entAt(x, y, except); return _free(x, y, except); };
})();
// wild mounts appear in the world
(function () { const _s = spawnExtras; spawnExtras = async function (W, name) { await _s(W, name); await Mounts.spawn(W, name); }; })();

/* ---------- the Companions tab ---------- */
function companionsMenuHTML() {
  const S = G.S, own = Mounts.owned();
  let h = `<div class="stat"><h3>Mounts</h3><p class="muted">Tame wild mounts in the world. Stronger mounts need a higher power grade — and most of them want a fight first. Riding is faster; a flying mount ignores walls and water. Mounts fight beside you in battle.</p>
    <p>Riding: <b>${S.riding ? MOUNTS[S.riding].name : 'on foot'}</b>${S.riding && !Mounts.allowedHere() ? ' <span class="muted">(stabled while you\'re indoors / underground)</span>' : ''} ${S.riding ? '<button class="btn" data-ride="">Dismount</button>' : ''}</p></div>`;
  for (const [id, M] of Object.entries(MOUNTS)) {
    const where = M.where[0] === 'd_crystal' ? 'the Crystal Hollow' : { woods: 'the East Woods', mill: 'near the Old Mill' }[M.where[0]];
    h += `<div class="stat comp" style="margin-top:6px"><canvas data-mcv="${M.kind}" width="64" height="64"></canvas><div><h3>${M.name} <span class="muted">· grade ${M.grade}${M.fly ? ' · flies' : ''}</span></h3><p class="muted">${M.desc}</p><p>${own[id] ? (S.riding === id ? '<b style="color:#7dffb0">Riding</b>' : `<button class="btn" data-ride="${id}">Ride</button>`) : `<span class="muted">Wild — found in ${where}.${M.fight ? ' Must be beaten first.' : ''}</span>`} · In battle: <b>${M.act.name}</b></p></div></div>`;
  }
  h += `<div class="stat" style="margin-top:6px"><h3>Familiars</h3><p class="muted">Every great fighter has one. They act on their own in battle — striking, healing or shielding — about one turn in three.</p></div>`;
  const party = ['me', ...S.party];
  const order = [...party, ...Object.keys(FAMS).filter(k => !party.includes(k))];
  for (const k of order) {
    const F = FAMS[k]; if (k === 'me' && !Familiars.has('me')) continue;
    const owner = k === 'me' ? S.name : k === 'vane' ? 'Vane' : (CHAR[k] && CHAR[k].name) || (ALLY[k] && ALLY[k].name) || k[0].toUpperCase() + k.slice(1);
    h += `<div class="stat comp" style="margin-top:6px"><canvas data-fcv="${k}" width="24" height="24"></canvas><div><h3 style="color:${F.glow}">${F.name} <span class="muted">· ${F.species} · ${owner}'s familiar${party.includes(k) ? ' · in your party' : ''}</span></h3><p class="muted">${F.desc}</p><p>In battle: <b>${F.act.name}</b></p></div></div>`;
  }
  return h;
}
function bindCompanionsMenu() {
  $$('#menuCard [data-ride]').forEach(b => bindTap(b, () => { Mounts.ride(b.dataset.ride || null); UI.renderMenu(); }));
  $$('#menuCard canvas[data-mcv]').forEach(cv => { const x = cv.getContext('2d'); x.imageSmoothingEnabled = false; x.drawImage(mountFrame(cv.dataset.mcv, 'right', 0, 'back'), 0, 0); x.drawImage(mountFrame(cv.dataset.mcv, 'right', 0, 'front'), 0, 0); });
  $$('#menuCard canvas[data-fcv]').forEach(cv => { const k = cv.dataset.fcv, art = k === 'me' && Art.port.dragon && (Art.port.dragon.happy || Art.port.dragon.neutral); const x = cv.getContext('2d');
    if (art) { cv.width = 128; cv.height = 128; cv.style.imageRendering = 'auto'; const sc = Math.max(128 / art.width, 128 / art.height); x.drawImage(art, (128 - art.width * sc) / 2, 0, art.width * sc, art.height * sc); }
    else { x.imageSmoothingEnabled = false; x.drawImage(famImg(k, 0), 0, 0); } });
}
