'use strict';
/* ================= CORE: globals, assets, sprites, input, audio, save ================= */
const $ = s => document.querySelector(s);
const $$ = s => [...document.querySelectorAll(s)];
const wait = ms => new Promise(r => setTimeout(r, ms));
const clamp = (v, a, b) => Math.max(a, Math.min(b, v));
const lerp = (a, b, t) => a + (b - a) * t;
const rnd = (a, b) => a + Math.random() * (b - a);
const pick = a => a[Math.floor(Math.random() * a.length)];
const VIEW_H = 340;
const SAVE_KEY = 'emeraldblood_v2';
const DIRS = { up: [0, -1], down: [0, 1], left: [-1, 0], right: [1, 0] };
const DROW = { up: 0, left: 1, down: 2, right: 3 };
const OPP = { up: 'down', down: 'up', left: 'right', right: 'left' };
const EXPRS = ['neutral', 'happy', 'anger', 'sad', 'shock', 'shame', 'closed', 'blush'];

var SCENES = {};
const G = {
  view: { w: 640, h: VIEW_H, scale: 1 }, mode: 'boot', S: null, M: null, A: {}, img: {}, maps: null, props: null, man: null,
  t: 0, input: { dir: null, mag: 0, run: false }, muted: false, settings: { ring: true, sfx: true, music: true, text: 1 }
};
function store(k, v) { try { if (v === undefined) return localStorage.getItem(k); if (v === null) localStorage.removeItem(k); else localStorage.setItem(k, v); } catch (e) { return null; } }
try { Object.assign(G.settings, JSON.parse(store('eb_settings') || '{}')); } catch (e) {}
function saveSettings() { store('eb_settings', JSON.stringify(G.settings)); }

const cv = $('#game'), ctx = cv.getContext('2d');
function resize() {
  const dpr = Math.min(window.devicePixelRatio || 1, 3);
  cv.width = Math.round(innerWidth * dpr); cv.height = Math.round(innerHeight * dpr);
  G.view.scale = cv.height / VIEW_H; G.view.h = VIEW_H; G.view.w = cv.width / G.view.scale;
  ctx.imageSmoothingEnabled = false;
}
addEventListener('resize', resize); resize();

/* ---------- assets ---------- */
function loadImg(src) {
  return new Promise((res, rej) => { const i = new Image(); i.onload = () => res(i); i.onerror = () => rej(new Error('img ' + src)); i.src = src; });
}
async function loadJSON(src) { const r = await fetch(src); return r.json(); }
async function npcImg(name) {
  if (!G.img[name]) G.img[name] = await loadImg('assets/npc/' + name + '.png');
  return G.img[name];
}
async function boot() {
  const bar = $('#loadBar'), txt = $('#loadTxt');
  const step = (p, t) => { bar.style.width = (p * 100) + '%'; if (t) txt.textContent = t; };
  step(0.05, 'Reading the old maps…');
  [G.man, G.props, G.maps] = await Promise.all([loadJSON('assets/manifest.json'), loadJSON('assets/props.json'), loadJSON('assets/maps.json')]);
  initBT();
  step(0.25, 'Gathering the townsfolk…');
  G.img.props = await loadImg('assets/props.png');
  const partNames = Object.keys(G.man.parts);
  let n = 0;
  await Promise.all(partNames.map(async p => { G.img['part_' + p] = await loadImg('assets/parts/' + p + '.png'); step(0.25 + 0.5 * (++n / partNames.length)); }));
  step(0.8, 'Lighting the lanterns…');
  await Promise.all([...new Set(Object.values(CHAR).map(c => c.sprite))].map(n => npcImg(n).catch(() => null)));
  step(1, '');
  $('#loading').classList.add('hide');
  UI.title();
  requestAnimationFrame(loop);
}

/* ---------- recolor + player composition ---------- */
const hexInt = h => { h = h.replace('#', ''); return [parseInt(h.slice(0, 2), 16), parseInt(h.slice(2, 4), 16), parseInt(h.slice(4, 6), 16)]; };
function recolor(img, mat, base, target) {
  const c = document.createElement('canvas'); c.width = img.width; c.height = img.height;
  const x = c.getContext('2d'); x.drawImage(img, 0, 0);
  if (!mat || !target || target === base) return c;
  const src = G.man.pal[mat][base], dst = G.man.pal[mat][target];
  if (!src || !dst) return c;
  const map = new Map();
  for (let i = 0; i < Math.min(src.length, dst.length); i++) {
    const a = hexInt(src[i]), b = hexInt(dst[i]);
    map.set((a[0] << 16) | (a[1] << 8) | a[2], [b[0], b[1], b[2]]);
  }
  const d = x.getImageData(0, 0, c.width, c.height), p = d.data;
  for (let i = 0; i < p.length; i += 4) {
    if (!p[i + 3]) continue;
    const k = (p[i] << 16) | (p[i + 1] << 8) | p[i + 2], v = map.get(k);
    if (v) { p[i] = v[0]; p[i + 1] = v[1]; p[i + 2] = v[2]; }
  }
  x.putImageData(d, 0, 0); return c;
}
const LOOK_OPTS = {
  sex: ['male', 'female'],
  skin: ['light', 'amber', 'olive', 'taupe', 'bronze', 'brown', 'black'],
  hair: ['dreadlocks_long', 'dreadlocks_short', 'twists_straight', 'twists_fade', 'cornrows', 'afro', 'high_ponytail', 'long_tied', 'braid', 'buzzcut', 'curly_short', 'bob', 'pixie', 'natural', 'long', 'none'],
  hairCol: ['black', 'raven', 'dark_brown', 'chestnut', 'light_brown', 'ginger', 'blonde', 'platinum', 'white', 'gray', 'red', 'navy', 'green'],
  beard: ['none', 'beard', 'mustache'],
  cloth: ['charcoal', 'black', 'slate', 'navy', 'bluegray', 'teal', 'forest', 'green', 'maroon', 'red', 'purple', 'walnut', 'brown', 'tan', 'white'],
};
const HAIR_NAMES = { dreadlocks_long: 'Long locs', dreadlocks_short: 'Short locs', twists_straight: 'Twists', twists_fade: 'Twist fade', cornrows: 'Cornrows', afro: 'Afro', high_ponytail: 'High ponytail', long_tied: 'Tied back', braid: 'Braid', buzzcut: 'Buzz cut', curly_short: 'Short curls', bob: 'Bob', pixie: 'Pixie', natural: 'Natural', long: 'Long', none: 'Shaved' };
function defaultLook() { return { sex: 'male', skin: 'bronze', hair: 'dreadlocks_long', hairCol: 'black', beard: 'none', top: 'charcoal', pants: 'charcoal', obi: 'black', hood: 'charcoal' }; }
const KID_HAIR_MAP = { dreadlocks_long: 'jewfro', dreadlocks_short: 'jewfro', twists_straight: 'jewfro', twists_fade: 'jewfro', cornrows: 'jewfro', afro: 'jewfro', natural: 'jewfro', curly_short: 'jewfro',
  high_ponytail: 'wavy', long_tied: 'wavy', braid: 'wavy', long: 'wavy', bob: 'wavy', buzzcut: 'relm_short', pixie: 'relm_short', none: 'relm_short' };
const KID_SHIRT_MAP = { charcoal: 'gray', black: 'black', slate: 'gray', navy: 'blue', bluegray: 'blue', teal: 'lightblue', forest: 'green', green: 'green', maroon: 'red', red: 'red', purple: 'lavender', walnut: 'brown', brown: 'brown', tan: 'brown', white: 'white' };
const KID_PANTS_MAP = { charcoal: 'black', black: 'black', slate: 'black', navy: 'darkblue', bluegray: 'blue', teal: 'blue', forest: 'green', green: 'green', maroon: 'maroon', red: 'red', purple: 'darkblue', walnut: 'brown', brown: 'brown', tan: 'brown', white: 'white' };
function kidPartList(look) {
  return [['kbody', look.skin], ['kpants_' + (KID_PANTS_MAP[look.pants] || 'brown'), null], ['kshirt_' + (KID_SHIRT_MAP[look.top] || 'white'), null], ['khead', look.skin], ['keyes', null], ['khair_' + (KID_HAIR_MAP[look.hair] || 'swoop_side'), look.hairCol]];
}
function partList(look, hooded) {
  if (G.S && G.S.kid) return kidPartList(look);
  const s = look.sex, L = [];
  const bgk = 'hairbg_' + look.hair;
  if (!hooded && look.hair !== 'none' && G.man.parts[bgk]) L.push([bgk, look.hairCol]);
  L.push(['body_' + s, look.skin], ['tabi_' + s, 'black'], ['sandals_' + s, 'walnut'], ['pants_' + s, look.pants], ['top_' + s, look.top], ['obi_' + s, look.obi],
         ['head_' + s, look.skin], ['face_' + s, look.skin]);
  if (s === 'male' && look.beard !== 'none') L.push([look.beard, look.hairCol]);
  if (hooded) L.push(['hood', look.hood]);
  else if (look.hair !== 'none') L.push(['hair_' + look.hair, look.hairCol]);
  return L;
}
function composeLook(look, hooded, region) {
  // region: null = full atlas, else [sx,sy,w,h]
  const list = partList(look, hooded);
  const first = G.img['part_' + list[0][0]];
  const [sx, sy, w, h] = region || [0, 0, first.width, first.height];
  const out = document.createElement('canvas'); out.width = w; out.height = h;
  const o = out.getContext('2d');
  for (const [pn, col] of list) {
    const meta = G.man.parts[pn], img = G.img['part_' + pn];
    if (!img) continue;
    let src = img;
    if (region) { const c = document.createElement('canvas'); c.width = w; c.height = h; c.getContext('2d').drawImage(img, sx, sy, w, h, 0, 0, w, h); src = c; }
    o.drawImage(recolor(src, meta.mat, meta.base, col), 0, 0);
  }
  return out;
}
async function buildPlayerSprites() {
  const L = G.S.look;
  G.A.pHair = composeLook(L, false); await wait(10);
  G.A.pHood = composeLook(L, true); await wait(10);
  G.A.sword = G.img.part_sword; G.A.swordBg = G.img.part_sword_bg; G.A.glow = G.img.part_glow; G.A.glowBg = G.img.part_glow_bg;
}
function playerImg() { return G.S.hood ? G.A.pHood : G.A.pHair; }

/* sprite drawing: OW frames are 64px; BT frames are 128px */
const BT_ROW = {}; let BT_Y = 512;
function initBT() { G.man.bt.anims.forEach((a, i) => BT_ROW[a[0]] = i); BT_Y = G.man.bt.y; }
function drawOW(c, img, anim, dir, f, x, y, alpha, sz) {
  const row = (anim === 'walk' ? 4 : anim === 'run' ? 8 : 0) + DROW[dir]; sz = sz || 1;
  if (alpha !== undefined) c.globalAlpha = alpha;
  c.drawImage(img, f * 64, row * 64, 64, 64, Math.round(x - 32 * sz), Math.round(y - 58 * sz), 64 * sz, 64 * sz);
  if (alpha !== undefined) c.globalAlpha = 1;
}
function drawBT(c, img, anim, f, x, y, s) {
  s = s || 1; const row = BT_ROW[anim];
  c.drawImage(img, f * 128, BT_Y + row * 128, 128, 128, Math.round(x - 64 * s), Math.round(y - 92 * s), 128 * s, 128 * s);
}
function portraitTo(canvas, img, expr, kid) {
  const oy = kid ? 15 : 4;
  const x = canvas.getContext('2d'); x.imageSmoothingEnabled = false; x.clearRect(0, 0, canvas.width, canvas.height);
  const ei = Math.max(0, EXPRS.indexOf(expr || 'neutral'));
  const sy = img.height - 64; let sx = ei * 64;
  if (sx + 64 > img.width) sx = 0;
  x.drawImage(img, sx + 16, sy + oy, 32, 36, 0, 0, 32, 36);
  // if the expression slot is empty fall back to neutral
  const d = x.getImageData(0, 0, 32, 36).data; let any = 0; for (let i = 3; i < d.length; i += 40) if (d[i]) { any = 1; break; }
  if (!any && sx) x.drawImage(img, 16, sy + oy, 32, 36, 0, 0, 32, 36);
}
function playerPortrait(canvas, expr) {
  // player portrait: compose parts' portrait strips (face part holds expressions)
  const L = G.S.look, x = canvas.getContext('2d'); x.imageSmoothingEnabled = false; x.clearRect(0, 0, canvas.width, canvas.height);
  const ei = Math.max(0, EXPRS.indexOf(expr || 'neutral'));
  const key = JSON.stringify(L) + G.S.hood + ei + (G.S.kid ? 'k' : '');
  const oy = G.S.kid ? 15 : 4;
  G.A.portCache = G.A.portCache || {};
  if (!G.A.portCache[key]) {
    const c = document.createElement('canvas'); c.width = 32; c.height = 36; const cx = c.getContext('2d');
    for (const [pn, col] of partList(L, G.S.hood)) {
      const img = G.img['part_' + pn], meta = G.man.parts[pn]; if (!img) continue;
      const sy = img.height - 64, sx = pn.startsWith('face_') ? ei * 64 : 0;
      const t = document.createElement('canvas'); t.width = 32; t.height = 36;
      t.getContext('2d').drawImage(img, sx + 16, sy + oy, 32, 36, 0, 0, 32, 36);
      cx.drawImage(recolor(t, meta.mat, meta.base, col), 0, 0);
    }
    G.A.portCache[key] = c;
  }
  x.drawImage(G.A.portCache[key], 0, 0);
  if (!G.S.hood) glowEyes(x, 32, 36);
}
function glowEyes(x, w, h) {
  const d = x.getImageData(0, 0, w, h).data; x.save(); x.globalCompositeOperation = 'lighter';
  for (let i = 0; i < d.length; i += 4) {
    const r = d[i], g = d[i + 1], b = d[i + 2];
    if (d[i + 3] && g > 150 && r < 150 && b < 120 && g - r > 60) { const p = i / 4; x.fillStyle = 'rgba(70,255,140,.35)'; x.fillRect(p % w - 1, Math.floor(p / w) - 1, 3, 3); }
  }
  x.restore();
}

/* ---------- input ---------- */
const K = {};
const KEYDIR = { ArrowUp: 'up', ArrowDown: 'down', ArrowLeft: 'left', ArrowRight: 'right', w: 'up', s: 'down', a: 'left', d: 'right', W: 'up', S: 'down', A: 'left', D: 'right' };
const keyStack = [];
addEventListener('keydown', e => {
  if (e.target.tagName === 'INPUT') return;
  if (KEYDIR[e.key]) { e.preventDefault(); if (!keyStack.includes(KEYDIR[e.key])) keyStack.push(KEYDIR[e.key]); }
  if (e.repeat) return;
  if (e.key === 'Shift') G.input.run = true;
  const k = e.key.toLowerCase();
  if (k === ' ' || k === 'enter' || k === 'z') { e.preventDefault(); Input.press('a'); }
  if (k === 'h') Input.press('hood');
  if (k === 'escape' || k === 'm') Input.press('menu');
  if (k === 'q' || k === 'x') Input.press('dodge');
  if (k === 'e' || k === 'c') Input.press('parry');
  if (/^[1-4]$/.test(k)) Input.press('choice' + k);
});
addEventListener('keyup', e => {
  if (KEYDIR[e.key]) { const i = keyStack.indexOf(KEYDIR[e.key]); if (i >= 0) keyStack.splice(i, 1); }
  if (e.key === 'Shift') G.input.run = false;
});
const Input = {
  handlers: {},
  on(name, fn) { this.handlers[name] = fn; },
  press(name) { audioUnlock(); const h = this.handlers[name]; if (h) h(); },
  dir() { if (keyStack.length) return keyStack[keyStack.length - 1]; return G.input.dir; }
};
(function stick() {
  const zone = $('#stickZone'), st = $('#stick'), knob = st.querySelector('b'); let id = null, ox = 0, oy = 0;
  zone.addEventListener('pointerdown', e => {
    audioUnlock(); id = e.pointerId; ox = e.clientX; oy = e.clientY; st.style.left = ox + 'px'; st.style.top = oy + 'px'; st.classList.remove('hide');
    knob.style.transform = ''; zone.setPointerCapture(id); $('#stickHint').classList.add('hide');
  });
  zone.addEventListener('pointermove', e => {
    if (e.pointerId !== id) return;
    let dx = e.clientX - ox, dy = e.clientY - oy; const d = Math.hypot(dx, dy), max = 44;
    if (d > max) { dx *= max / d; dy *= max / d; }
    knob.style.transform = `translate(${dx}px,${dy}px)`;
    if (d < 12) { G.input.dir = null; G.input.mag = 0; return; }
    G.input.dir = Math.abs(dx) > Math.abs(dy) ? (dx > 0 ? 'right' : 'left') : (dy > 0 ? 'down' : 'up');
    G.input.mag = Math.min(1, d / max);
  });
  const end = e => { if (e.pointerId !== id) return; id = null; G.input.dir = null; G.input.mag = 0; st.classList.add('hide'); };
  zone.addEventListener('pointerup', end); zone.addEventListener('pointercancel', end);
})();
function bindTap(el, fn) { el.addEventListener('pointerdown', e => { e.preventDefault(); e.stopPropagation(); audioUnlock(); fn(e); }); }
bindTap($('#bA'), () => Input.press('a'));
bindTap($('#bHood'), () => Input.press('hood'));
bindTap($('#bRun'), () => { G.input.runToggle = !G.input.runToggle; $('#bRun').classList.toggle('on', G.input.runToggle); });
bindTap($('#btnMenu'), () => Input.press('menu'));
bindTap($('#rxDodge'), () => Input.press('dodge'));
bindTap($('#rxParry'), () => Input.press('parry'));
document.addEventListener('gesturestart', e => e.preventDefault());
document.addEventListener('contextmenu', e => e.preventDefault());

/* ---------- audio ---------- */
let AC = null;
function audioUnlock() { try { AC = AC || new (window.AudioContext || window.webkitAudioContext)(); if (AC.state === 'suspended') AC.resume(); } catch (e) {} }
function tone(f, d, type, v, f2, dl, dest) {
  if (!AC) return; const now = AC.currentTime + (dl || 0);
  const o = AC.createOscillator(), g = AC.createGain(); o.type = type; o.frequency.setValueAtTime(f, now);
  if (f2) o.frequency.exponentialRampToValueAtTime(f2, now + d);
  g.gain.setValueAtTime(v, now); g.gain.exponentialRampToValueAtTime(0.0001, now + d);
  o.connect(g); g.connect(dest || AC.destination); o.start(now); o.stop(now + d + 0.05);
}
function noise(d, v, hp, dl) {
  if (!AC) return; const now = AC.currentTime + (dl || 0);
  const b = AC.createBuffer(1, Math.floor(AC.sampleRate * d), AC.sampleRate), ch = b.getChannelData(0);
  for (let i = 0; i < ch.length; i++) ch[i] = (Math.random() * 2 - 1) * (1 - i / ch.length);
  const s = AC.createBufferSource(), g = AC.createGain(), f = AC.createBiquadFilter(); f.type = 'highpass'; f.frequency.value = hp || 800;
  s.buffer = b; g.gain.value = v; s.connect(f); f.connect(g); g.connect(AC.destination); s.start(now);
}
function sfx(t) {
  if (!G.settings.sfx || !AC) return;
  try {
    switch (t) {
      case 'blip': tone(620, .03, 'square', .015); break;
      case 'press': tone(180, .05, 'square', .03, 90); noise(.03, .04, 3000); break;
      case 'step': noise(.04, .02, 2500); break;
      case 'swing': noise(.12, .07, 1800); tone(300, .08, 'sawtooth', .02, 120); break;
      case 'hit': noise(.08, .12, 400); tone(160, .12, 'square', .06, 60); break;
      case 'crit': noise(.12, .16, 300); tone(90, .25, 'sawtooth', .08, 40); tone(880, .12, 'square', .03, 1760); break;
      case 'hurt': tone(140, .18, 'square', .07, 50); break;
      case 'dodge': noise(.14, .05, 3000); tone(500, .1, 'sine', .04, 900); break;
      case 'pdodge': tone(700, .18, 'sine', .07, 1400); tone(1050, .2, 'triangle', .04, 2100, .04); break;
      case 'parry': tone(1200, .12, 'square', .05, 900); noise(.05, .08, 4000); break;
      case 'pparry': tone(1600, .3, 'square', .06, 1500); tone(2400, .25, 'triangle', .05, 2390, .02); noise(.06, .1, 5000); break;
      case 'counter': tone(400, .3, 'sawtooth', .06, 1200); noise(.2, .1, 800, .05); break;
      case 'perfect': tone(1320, .1, 'square', .04); tone(1760, .16, 'square', .04, null, .06); break;
      case 'good': tone(990, .08, 'square', .03); break;
      case 'miss': tone(220, .12, 'triangle', .04, 160); break;
      case 'art': tone(300, .35, 'triangle', .08, 1200); tone(600, .3, 'square', .02, 1800, .05); break;
      case 'heal': [523, 659, 784].forEach((f, i) => tone(f, .14, 'triangle', .05, null, i * .08)); break;
      case 'level': [523, 659, 784, 1046].forEach((f, i) => tone(f, .16, 'square', .04, null, i * .09)); break;
      case 'coin': tone(988, .06, 'square', .04); tone(1319, .12, 'square', .04, null, .06); break;
      case 'start': tone(200, .25, 'sawtooth', .05, 500); noise(.3, .05, 1500); break;
      case 'win': [392, 523, 659, 784].forEach((f, i) => tone(f, .2, 'triangle', .06, null, i * .11)); break;
      case 'chant': tone(220, .6, 'sine', .07, 330); tone(330, .6, 'sine', .04, 495, .1); break;
      case 'hood': tone(300, .08, 'triangle', .04, 200); break;
      case 'alarm': tone(880, .08, 'square', .03); tone(660, .1, 'square', .03, null, .1); break;
      case 'break': noise(.3, .15, 200); tone(120, .4, 'sawtooth', .07, 40); break;
      case 'cutin': tone(150, .5, 'sawtooth', .05, 900); noise(.5, .05, 2000); break;
      case 'light': tone(1500, .6, 'sine', .05, 400); noise(.5, .06, 3000); break;
    }
  } catch (e) {}
}
/* simple procedural music */
const Music = {
  cur: null, timer: null, step: 0, gain: null,
  play(name) {
    if (this.cur === name) return; this.stop(); this.cur = name; if (!G.settings.music || !AC || !name) return;
    this.gain = AC.createGain(); this.gain.gain.value = 0.05; this.gain.connect(AC.destination);
    const S = {
      village: { bpm: 92, scale: [0, 2, 4, 7, 9, 12, 14], root: 293.66, pat: [0, 2, 4, 2, 5, 4, 2, 1, 0, 2, 4, 6, 5, 4, 2, -1], bass: [0, 0, 5, 3] },
      town: { bpm: 100, scale: [0, 2, 3, 5, 7, 8, 10, 12], root: 261.63, pat: [0, 2, 4, 3, 2, 0, 1, 2, 4, 5, 4, 2, 3, 1, 0, -1], bass: [0, 5, 3, 4] },
      woods: { bpm: 76, scale: [0, 3, 5, 7, 10, 12], root: 220, pat: [0, -1, 2, -1, 3, 2, -1, 1, 0, -1, 4, -1, 3, -1, 1, -1], bass: [0, 0, 3, 2] },
      battle: { bpm: 148, scale: [0, 2, 3, 5, 7, 8, 11, 12], root: 196, pat: [0, 0, 4, 0, 3, 0, 5, 4, 0, 0, 4, 0, 6, 5, 4, 3], bass: [0, 0, 5, 6] },
      boss: { bpm: 156, scale: [0, 1, 3, 5, 6, 8, 10, 12], root: 174.61, pat: [0, 1, 0, 5, 4, 0, 3, 1, 0, 1, 0, 6, 5, 4, 3, 1], bass: [0, 1, 5, 4] },
      sad: { bpm: 62, scale: [0, 2, 3, 5, 7, 8, 10, 12], root: 246.94, pat: [4, -1, 3, 2, -1, 0, -1, -1, 2, -1, 3, 4, -1, 2, -1, -1], bass: [0, 5, 3, 4] },
      night: { bpm: 84, scale: [0, 1, 3, 5, 7, 8, 10], root: 233.08, pat: [0, -1, 1, -1, 3, -1, 1, 0, -1, -1, 4, -1, 3, 1, -1, -1], bass: [0, 5, 1, 0] }
    }[name];
    if (!S) return;
    const beat = 60 / S.bpm / 2; this.step = 0;
    const tick = () => {
      if (!AC || this.cur !== name) return;
      const i = this.step++, n = S.pat[i % S.pat.length];
      const f = s => S.root * Math.pow(2, s / 12);
      if (n >= 0) tone(f(S.scale[n % S.scale.length]), beat * 1.6, 'triangle', 0.6, null, 0, this.gain);
      if (i % 8 === 0) tone(f(S.scale[S.bass[(i / 8 | 0) % S.bass.length] % S.scale.length]) / 2, beat * 7, 'sine', 0.9, null, 0, this.gain);
      if ((name === 'battle' || name === 'boss') && i % 2 === 0) noise(.05, i % 4 === 0 ? 0.05 : 0.02, i % 4 === 0 ? 200 : 4000);
    };
    tick(); this.timer = setInterval(tick, beat * 1000);
  },
  stop() { clearInterval(this.timer); this.timer = null; if (this.gain) { try { this.gain.disconnect(); } catch (e) {} } this.gain = null; this.cur = null; }
};

/* ---------- state & save ---------- */
function newState(look, name) {
  return {
    v: 2, kid: true, name: name || 'Ren', look, lvl: 1, xp: 0, gold: 20, hood: false, sus: 0, seen: {},
    stats: { hp: 52, maxHp: 52, mp: 16, maxMp: 16, atk: 11, def: 4, spd: 10 },
    items: { tonic: 3, ether: 1 }, arts: ['fang', 'ward'],
    party: [], allies: {},
    map: 'thornvale', x: 9, y: 14, dir: 'down',
    quest: '', side: '', f: {}, steps: 0, chapter: 0, playtime: 0
  };
}
function save() { if (G.S) { G.S.savedAt = Date.now(); store(SAVE_KEY, JSON.stringify(G.S)); } }
function loadSave() { const r = store(SAVE_KEY); if (!r) return null; try { const s = JSON.parse(r); return s && s.v === 2 ? s : null; } catch (e) { return null; } }

/* ---------- tiny UI helpers ---------- */
let toastT = 0;
function toast(msg, ms) { const t = $('#toast'); t.innerHTML = msg; t.classList.add('on'); clearTimeout(toastT); toastT = setTimeout(() => t.classList.remove('on'), ms || 2600); }
let banT = 0;
function banner(txt, sub, ms) { const b = $('#banner'); b.innerHTML = txt + (sub ? '<small>' + sub + '</small>' : ''); b.classList.add('on'); clearTimeout(banT); banT = setTimeout(() => b.classList.remove('on'), ms || 1800); }
async function fadeOut(ms) { $('#fade').style.transitionDuration = (ms || 500) + 'ms'; $('#fade').classList.add('on'); await wait(ms || 500); }
async function fadeIn(ms) { $('#fade').style.transitionDuration = (ms || 500) + 'ms'; $('#fade').classList.remove('on'); await wait(ms || 500); }
function esc(s) { return String(s).replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c])); }

/* ---------- main loop ---------- */
let lastT = 0;
function loop(t) {
  const dt = Math.min(50, t - (lastT || t)); lastT = t; G.t = t;
  ctx.setTransform(G.view.scale, 0, 0, G.view.scale, 0, 0); ctx.imageSmoothingEnabled = false;
  try {
    if (G.mode === 'world' || G.mode === 'dialog') { World.update(dt); World.render(ctx, t); }
    else if (G.mode === 'battle') { Battle.update(dt); Battle.render(ctx, t); }
    else if (G.mode === 'title') UI.renderTitle(ctx, t);
    else { ctx.fillStyle = '#000'; ctx.fillRect(0, 0, G.view.w, G.view.h); }
  } catch (e) { console.error(e.stack || e); }
  if (G.S) G.S.playtime += dt;
  requestAnimationFrame(loop);
}
window.addEventListener('load', () => { boot().catch(e => { $('#loadTxt').textContent = 'Could not load: ' + e.message; console.error(e); }); });

/* ---------- buttons that feel like buttons ---------- */
(function pressFeel() {
  const SEL = '.rb,.sb,.rx,.btn,.tbtn,.choice,.arr,#cmdList button,#btnMenu,.sw button,.tabs button';
  let held = [];
  const down = e => {
    const b = e.target.closest && e.target.closest(SEL); if (!b || b.disabled) return;
    b.classList.add('press'); held.push(b);
    if (b.matches('.rb,.rx')) { try { navigator.vibrate && navigator.vibrate(12); } catch (x) {} sfx('press'); }
  };
  const up = () => { const h = held; held = []; setTimeout(() => h.forEach(b => b.classList.remove('press')), 90); };
  document.addEventListener('pointerdown', down, true);
  document.addEventListener('pointerup', up, true); document.addEventListener('pointercancel', up, true);
})();
