'use strict';
/* ================= DRAWN DIALOGUE PORTRAITS =================
   Every speaking character gets a hand-composed anime-style bust (hair, face, eyes, mouth, clothing),
   built from a description that matches their sprite, in 8 expressions, then cleaned into crisp pixel art. */
const PW = 100, PH = 108;
const PCache = {};

/* ---------- colour helpers ---------- */
function h2rgb(h) { h = h.replace('#', ''); if (h.length === 3) h = h.split('').map(c => c + c).join(''); return [parseInt(h.slice(0, 2), 16), parseInt(h.slice(2, 4), 16), parseInt(h.slice(4, 6), 16)]; }
function rgb2h(r, g, b) { return '#' + [r, g, b].map(v => Math.max(0, Math.min(255, Math.round(v))).toString(16).padStart(2, '0')).join(''); }
function mix(a, b, t) { const A = h2rgb(a), B = h2rgb(b); return rgb2h(A[0] + (B[0] - A[0]) * t, A[1] + (B[1] - A[1]) * t, A[2] + (B[2] - A[2]) * t); }
function rampFromHex(h) { return [mix(h, '#000000', .82), mix(h, '#000000', .6), mix(h, '#000000', .32), h, mix(h, '#ffffff', .22), mix(h, '#ffffff', .45)]; }
// ramp = [outline, dark, shade, base, light, highlight]
function ramp(mat, v) {
  if (!v) v = mat === 'body' ? 'light' : '#777777';
  if (v[0] === '#') return rampFromHex(v);
  const p = G.man.pal[mat] && G.man.pal[mat][v];
  if (!p) return rampFromHex('#777777');
  if (mat === 'body') return [p[0], p[1], p[2], p[3], p[4], p[5]].map((c, i) => i === 3 ? p[4] : i === 2 ? p[3] : i === 4 ? mix(p[4], p[5], .6) : i === 1 ? p[2] : c);
  return [p[0], p[1], p[2], p[3], p[4], p[5]];
}
const EYE_HEX = { green: '#3ccf6e', brown: '#7a4a24', blue: '#3a78d8', gray: '#7c8a96', red: '#d83a3a', gold: '#e0b030', violet: '#9a5ad8' };
const KID_CLOTH = { black: 'black', blue: 'blue', brown: 'brown', gray: 'gray', green: 'green', lavender: 'lavender', lightblue: 'sky', pink: 'pink', red: 'red', white: 'white', darkblue: 'navy', maroon: 'maroon' };

/* ---------- hairstyle mapping from sprite hair names ---------- */
const HAIR_STYLE = { dreadlocks_long: 'locs', dreadlocks_short: 'locsShort', twists_straight: 'twists', twists_fade: 'twistsShort', cornrows: 'cornrows', afro: 'afro', high_ponytail: 'ponytail',
  long_tied: 'tied', braid: 'braid', buzzcut: 'buzz', curly_short: 'curly', bob: 'bob', pixie: 'pixie', natural: 'puff', long: 'long', long_straight: 'long', long_center_part: 'longPart', wavy: 'wavy',
  pigtails: 'pigtails', bunches: 'buns', spiked2: 'spiky', spiked: 'spiky', messy2: 'messy', messy1: 'messy', swoop_side: 'swoop', unkempt: 'messyLong', long_messy: 'messyLong', none: 'bald',
  balding: 'balding', plain: 'short', jewfro: 'puff', relm_short: 'short' };

/* ---------- the cast, described to match their sprites ---------- */
const ART = {
  nana: { sex: 'f', age: 'elder', skin: 'brown', hair: 'tied', hairCol: 'white', eye: 'green', cloth: 'blouse', col: 'forest' },
  oren: { sex: 'm', skin: 'black', hair: 'twistsShort', hairCol: 'black', eye: 'green', beard: 'trim', cloth: 'vest', col: 'leather', col2: 'white', broad: 1 },
  jun: { sex: 'm', skin: 'brown', hair: 'cornrows', hairCol: 'black', eye: 'green', cloth: 'shirt', col: 'forest' },
  mei: { sex: 'f', skin: 'olive', hair: 'long', hairCol: 'raven', eye: 'green', cloth: 'blouse', col: 'maroon' },
  asha: { sex: 'f', skin: 'taupe', hair: 'braid', hairCol: 'dark_brown', eye: 'green', cloth: 'tunic', col: 'teal' },
  halvard: { sex: 'm', age: 'elder', gaunt: 1, skin: 'light', hair: 'balding', hairCol: 'gray', eye: 'blue', beard: 'trim', cloth: 'robe', col: 'white' },
  acolyte: { sex: 'm', skin: 'light', hair: 'short', hairCol: 'chestnut', eye: 'gray', helm: 1, cloth: 'tabard', col: 'white' },
  maren: { sex: 'f', age: 'elder', skin: 'amber', hair: 'buns', hairCol: 'white', eye: 'brown', cloth: 'apron', col: 'forest', col2: 'white' },
  tobb: { sex: 'm', plump: 1, skin: 'light', hair: 'balding', hairCol: 'chestnut', eye: 'blue', stache: 'walrus', cloth: 'apron', col: 'maroon', col2: 'tan' },
  pip: { sex: 'm', age: 'kid', skin: 'amber', hair: 'puff', hairCol: 'dark_brown', eye: 'brown', cloth: 'kidshirt', col: 'blue' },
  pipmom: { sex: 'f', skin: 'amber', hair: 'long', hairCol: 'dark_brown', eye: 'brown', cloth: 'blouse', col: 'blue' },
  kess: { sex: 'f', skin: 'bronze', hair: 'pixie', hairCol: 'redhead', eye: 'green', shades: 1, cloth: 'tunic', col: 'purple' },
  kessE: { sex: 'f', skin: 'bronze', hair: 'pixie', hairCol: 'redhead', eye: 'green', cloth: 'tunic', col: 'purple' },
  voss: { sex: 'm', skin: 'olive', hair: 'short', hairCol: 'dark_brown', eye: 'gray', helm: 1, stubble: 1, cloth: 'plate', col: 'gray', broad: 1 },
  guard: { sex: 'm', skin: 'light', hair: 'buzz', hairCol: 'chestnut', eye: 'brown', cloth: 'plate', col: 'gray' },
  rook: { sex: 'm', gaunt: 1, skin: 'taupe', hair: 'messy', hairCol: 'black', eye: 'brown', band: 'red', cloth: 'leather', col: 'leather' },
  bandit: { sex: 'm', skin: 'olive', hair: 'short', hairCol: 'dark_brown', eye: 'brown', band: 'maroon', cloth: 'leather', col: 'brown' },
  sable: { sex: 'f', skin: 'light', hair: 'ponytail', hairCol: 'ash', eye: 'gray', cloth: 'leather', col: 'black' },
  cassel: { sex: 'm', skin: 'light', hair: 'short', hairCol: 'blonde', eye: 'blue', cloth: 'robe', col: 'white' },
  hoshi: { sex: 'm', age: 'elder', skin: 'olive', hair: 'balding', hairCol: 'white', eye: 'brown', beard: 'long', cloth: 'gi', col: 'navy' },
  brom: { sex: 'm', skin: 'light', hair: 'balding', hairCol: 'ginger', eye: 'brown', beard: 'full', cloth: 'apron', col: 'brown', col2: 'brown', broad: 1 },
  sylwen: { sex: 'f', skin: 'light', hair: 'long', hairCol: 'platinum', eye: 'blue', elf: 1, cloth: 'leather', col: 'forest' },
  garrick: { sex: 'm', skin: 'olive', hair: 'buzz', hairCol: 'black', eye: 'brown', cloth: 'plate', col: 'gray', broad: 1 },
  tilda: { sex: 'f', skin: 'light', hair: 'braid', hairCol: 'ginger', eye: 'gray', cloth: 'tunic', col: 'maroon' },
  bram: { sex: 'm', plump: 1, skin: 'bronze', hair: 'curly', hairCol: 'black', eye: 'brown', cloth: 'apron', col: 'white', col2: 'brown' },
  bram_in: { ref: 'bram' },
  tamsinK: { sex: 'f', age: 'kid', skin: 'light', hair: 'wavy', hairCol: 'ginger', eye: 'green', cloth: 'kidshirt', col: 'green' },
  boK: { sex: 'm', age: 'kid', skin: 'black', hair: 'puff', hairCol: 'black', eye: 'green', cloth: 'kidshirt', col: 'brown' },
  larkK: { sex: 'f', age: 'kid', skin: 'amber', hair: 'short', hairCol: 'blonde', eye: 'green', cloth: 'kidshirt', col: 'white' },
  nixK: { sex: 'm', age: 'kid', skin: 'taupe', hair: 'swoop', hairCol: 'dark_brown', eye: 'green', cloth: 'kidshirt', col: 'gray' },
  tamsin: { sex: 'f', skin: 'light', hair: 'messyLong', hairCol: 'ginger', eye: 'green', band: 'forest', cloth: 'leather', col: 'black' },
  liora: { sex: 'f', beauty: 1, skin: 'light', hair: 'longPart', hairCol: 'white', eye: 'green', cloth: 'scoop', col: 'black', cape: 'maroon', necklace: 1 },
  vane: { sex: 'm', age: 'elder', skin: 'light', hair: 'tied', hairCol: 'gray', eye: 'gray', beard: 'full', cloth: 'gi', col: 'charcoal', cape: 'slate', scar: 1 },
  dace: { sex: 'm', skin: 'taupe', hair: 'spiky', hairCol: 'ginger', eye: 'green', band: 'green', cloth: 'leather', col: 'black' },
  sefa: { sex: 'f', skin: 'brown', hair: 'braid', hairCol: 'black', eye: 'green', cloth: 'tunic', col: 'white' },
  wren: { sex: 'f', skin: 'olive', hair: 'bob', hairCol: 'white', eye: 'green', band: 'forest', cloth: 'leather', col: 'brown' },
  corran: { sex: 'm', age: 'elder', skin: 'bronze', hair: 'buzz', hairCol: 'gray', eye: 'green', beard: 'full', cloth: 'leather', col: 'black', broad: 1 },
  bo: { sex: 'm', plump: 1, skin: 'black', hair: 'afro', hairCol: 'black', eye: 'green', cloth: 'leather', col: 'brown' },
  lark: { sex: 'f', skin: 'amber', hair: 'pixie', hairCol: 'blonde', eye: 'green', band: 'green', cloth: 'tunic', col: 'forest' },
  scout: { ref: 'lark' },
  rebel: { sex: 'm', skin: 'brown', hair: 'messy', hairCol: 'black', eye: 'green', band: 'forest', cloth: 'leather', col: 'black' },
  dread: { special: 'dread' }
};
function lookHair(h, kid) { return kid ? (HAIR_STYLE[KID_HAIR_MAP[h] || h] || 'short') : (HAIR_STYLE[h] || 'short'); }
function specFor(who) {
  if (who === 'me') {
    const L = G.S.look, kid = !!G.S.kid;
    return { sex: L.sex === 'female' ? 'f' : 'm', age: kid ? 'kid' : null, skin: L.skin, hair: lookHair(L.hair, kid), hairCol: L.hairCol, eye: 'green',
      beard: !kid && L.beard === 'beard' ? 'trim' : null, stache: !kid && L.beard === 'mustache' ? 'thin' : null,
      cloth: kid ? 'kidshirt' : 'gi', col: kid ? (KID_CLOTH[KID_SHIRT_MAP[L.top]] || 'gray') : L.top, col2: L.obi, hood: !!G.S.hood && !kid ? L.hood : null };
  }
  const C = CHAR[who] || {};
  const cast = G.S && G.S.cast;
  if (cast && (who === 'ilya')) { const I = cast.ilya; return { sex: 'f', age: 'kid', skin: I.skin, hair: lookHair(I.hair, true), hairCol: I.hairCol, eye: 'green', cloth: 'kidshirt', col: KID_CLOTH[I.top] || 'white', ribbon: 1 }; }
  if (who === 'ilya') return { sex: 'f', age: 'kid', skin: 'light', hair: 'wavy', hairCol: 'pink', eye: 'green', cloth: 'kidshirt', col: 'white', ribbon: 1 };
  if (who === 'kairo' || who === 'kairoKB' || who === 'kairoB') {
    const K = cast ? cast.kairo : { skin: 'light', hair: 'unkempt', hairCol: 'dark_gray', top: 'black', pants: 'charcoal', obi: 'forest', cape: 'forest' };
    if (who === 'kairoB') return { sex: 'm', skin: K.skin, hair: lookHair(K.hair), hairCol: K.hairCol, eye: 'green', cloth: 'gi', col: K.top, col2: K.obi, cape: K.cape, burn: 1, sharp: 1 };
    return { sex: 'm', age: 'kid', skin: K.skin, hair: lookHair(K.hair), hairCol: K.hairCol, eye: 'green', cloth: 'kidshirt', col: KID_CLOTH[KID_SHIRT_MAP[K.top]] || 'black', burn: who === 'kairoKB', bandage: who === 'kairoKB' };
  }
  let a = ART[who]; if (a && a.ref) a = ART[a.ref];
  if (!a && C.sprite) { const k = Object.keys(CHAR).find(k => CHAR[k].sprite === C.sprite && ART[k]); if (k) a = ART[k]; }
  if (a) return a;
  return autoSpec(C.sprite || who, C.kid || (C.sprite || '').startsWith('kid') || (C.sprite || '').startsWith('dkid'));
}
// unnamed townsfolk: read their colours straight off their sprite's close-up
function autoSpec(sprite, kid) {
  const img = G.img[sprite]; const sp = { sex: 'm', skin: '#e4a47c', hair: 'short', hairCol: '#4a3020', eye: 'brown', cloth: kid ? 'kidshirt' : 'shirt', col: '#6a6a7a', age: kid ? 'kid' : null };
  if (!img) return sp;
  const c = document.createElement('canvas'); c.width = 64; c.height = 64; const x = c.getContext('2d'); x.drawImage(img, 0, img.height - 64, 64, 64, 0, 0, 64, 64);
  const d = x.getImageData(0, 0, 64, 64).data, at = (px, py) => { const i = (py * 64 + px) * 4; return d[i + 3] ? rgb2h(d[i], d[i + 1], d[i + 2]) : null; };
  const oy = kid ? 5 : 0;
  let top = 0; for (let y = 6; y < 40; y++) if (at(32, y)) { top = y; break; }
  const hc = at(32, top + 2) || at(30, top + 3); if (hc) sp.hairCol = hc;
  const sk = at(31, 33 + oy) || at(33, 34 + oy); if (sk) sp.skin = sk;
  const cl = at(32, 52 + oy) || at(28, 50 + oy); if (cl) sp.col = cl;
  const ey = at(27, 29 + oy); if (ey) { const [r, g, b] = h2rgb(ey); sp.eye = g > 140 && g > r + 40 ? 'green' : b > r + 20 ? 'blue' : r > 120 && g < 90 ? 'brown' : 'gray'; }
  const longL = at(21, 42 + oy), longR = at(43, 42 + oy); const near = (a, b) => a && b && h2rgb(a).every((v, i) => Math.abs(v - h2rgb(b)[i]) < 40);
  if (near(longL, sp.hairCol) || near(longR, sp.hairCol)) { sp.hair = kid ? 'wavy' : 'long'; sp.sex = 'f'; sp.cloth = kid ? 'kidshirt' : 'blouse'; }
  else if (!hc || near(hc, sp.skin)) sp.hair = 'balding';
  if (sprite.startsWith('d')) sp.eye = 'green';
  const h = [...sprite].reduce((a, c) => a + c.charCodeAt(0), 0); if (!sp.hair.match(/long|wavy|balding/)) sp.hair = ['short', 'messy', 'curly', 'swoop', 'spiky'][h % 5];
  return sp;
}

/* ---------- your art: AI-made portraits & cutscene paintings drop straight in ----------
   assets/art.json = { "portraits": { "kairo": ["neutral","anger",...], ... }, "cuts": ["dread", ...] }
   files: assets/portraits/<id>_<expr>.png and assets/cutscenes/cut_<scene>.png */
const artImg = (base, v) => loadImg(`${base}.webp?v=${v || 1}`, true).catch(() => loadImg(`${base}.png?v=${v || 1}`, true));
const Art = { port: {}, cut: {}, left: new Set(), ready: false,
  async load() {
    try { const r = await fetch('assets/art.json', { cache: 'no-cache' }); if (!r.ok) return; const j = await r.json();
      const jobs = [];
      for (const [id, exprs] of Object.entries(j.portraits || {})) for (const e of exprs) jobs.push(artImg(`assets/portraits/${id}_${e}`, j.v).then(im => { (this.port[id] = this.port[id] || {})[e] = im; }).catch(() => {}));
      (j.facesLeft || []).forEach(id => this.left.add(id));
      for (const id of j.cuts || []) jobs.push(artImg(`assets/cutscenes/cut_${id}`, j.v).then(im => { this.cut[id] = im; }).catch(() => {}));
      await Promise.all(jobs); this.ready = true;
    } catch (e) { }
  }
};
const PFIT = { ren: .9, ren_hood: .9, ren_v2: .96, kairo_v2: .96, ren_veil: .96 };
const ART_ID = { larkMB: 'lark', larkA: 'lark', inq: 'ivo',  kairo: 'kairo_kid', kairoKB: 'kairo_kid_burned', kairoB: 'kairo', kessE: 'kess_eyes', scout: 'lark', bram_in: 'bram', tamsinK: 'tamsin_kid', boK: 'bo_kid', larkK: 'lark_kid', nixK: 'nix_kid' };
// townsfolk and residents borrow the painted face of the sprite they walk around as
function artId(who) { let id = ART_ID[who] || who; if (!Art.port[id] && CHAR[who] && CHAR[who].sprite && Art.port[CHAR[who].sprite]) id = CHAR[who].sprite; return styled(id); }
// Settings → Portrait style: 'new' uses the redrawn sets (<id>_v2) where they exist, 'classic' keeps the original art
function styled(id) { return G.settings && G.settings.artStyle === 'classic' ? id : (Art.port[id + '_v2'] ? id + '_v2' : id); }
const VEIL_EXPR = e => /anger|shout|power|glare|grief/.test(e || '') ? 'anger' : /focus|sight|determin|asc/.test(e || '') ? 'focused' : 'neutral';
function veiledArt() { return typeof Veil !== 'undefined' && Veil.on() && Art.port.ren_veil; }
function artHas(who, expr) { if (who === 'me' && veiledArt()) return true; const id = who === 'me' ? (G.S && G.S.kid ? 'ren_kid' : styled('ren')) : artId(who); return !!(Art.port[id] && Art.port[id][expr]); }
function artFor(who, expr) {
  if (who === 'me' && veiledArt()) { const set = Art.port.ren_veil, e = VEIL_EXPR(expr); return { img: set[e] || set.neutral, left: false, id: 'ren_veil' }; }
  let id = who === 'me' ? (G.S && G.S.kid ? 'ren_kid' : styled(G.S && G.S.hood && Art.port.ren_hood ? 'ren_hood' : 'ren')) : artId(who);
  const set = Art.port[id]; if (!set) return null;
  const alt = { sad: ['closed', 'shock'], shame: ['sad', 'closed'], blush: ['happy'], closed: ['sad'], shock: [], anger: [], happy: [] }[expr] || [];
  for (const e of [expr || 'neutral', ...alt, 'neutral']) if (set[e]) return { img: set[e], left: Art.left.has(id), id };
  const k = Object.keys(set)[0]; return k ? { img: set[k], left: Art.left.has(id) } : null;
}
/* ---------- the painter ---------- */
function drawPortrait(canvas, who, expr, facing) {
  const af = artFor(who, expr || 'neutral'), art = af && af.img;
  if (art) { if (af.left) facing = -facing; // a painted portrait: cover-fit, smooth scaling, mirrored for the right-hand box
    canvas.width = 296; canvas.height = 320; canvas.style.imageRendering = 'auto'; const x = canvas.getContext('2d'); x.clearRect(0, 0, 296, 320);
    const z = PFIT[af.id];
    if (z) { // tight head-shots: pull the camera back so the whole face sits in frame, feathered over a soft backdrop of itself
      x.save(); if (facing < 0) { x.translate(296, 0); x.scale(-1, 1); }
      const bgG = x.createRadialGradient(148, 140, 20, 148, 160, 230); bgG.addColorStop(0, '#5f8f78'); bgG.addColorStop(.55, '#2f5244'); bgG.addColorStop(1, '#16271f'); x.fillStyle = bgG; x.fillRect(0, 0, 296, 320);
      const rim = x.createRadialGradient(148, 130, 10, 148, 130, 150); rim.addColorStop(0, 'rgba(220,255,235,.35)'); rim.addColorStop(1, 'rgba(220,255,235,0)'); x.fillStyle = rim; x.fillRect(0, 0, 296, 320);
      x.filter = 'brightness(1.12) contrast(1.05) saturate(1.08)';
      const sc = Math.min(296 / art.width, 320 / art.height) * z, w = art.width * sc, h = art.height * sc;
      const k = document.createElement('canvas'); k.width = Math.ceil(w); k.height = Math.ceil(h); const kx = k.getContext('2d'); kx.drawImage(art, 0, 0, w, h);
      kx.globalCompositeOperation = 'destination-in';
      const fx = kx.createLinearGradient(0, 0, w, 0); fx.addColorStop(0, 'rgba(0,0,0,0)'); fx.addColorStop(.1, '#000'); fx.addColorStop(.9, '#000'); fx.addColorStop(1, 'rgba(0,0,0,0)'); kx.fillStyle = fx; kx.fillRect(0, 0, w, h);
      const fy = kx.createLinearGradient(0, 0, 0, h); fy.addColorStop(0, 'rgba(0,0,0,0)'); fy.addColorStop(.08, '#000'); fy.addColorStop(1, '#000'); kx.fillStyle = fy; kx.fillRect(0, 0, w, h);
      x.drawImage(k, (296 - w) / 2, 320 - h); x.filter = 'none'; x.restore(); return;
    }
    const sc = Math.max(296 / art.width, 320 / art.height), w = art.width * sc, h = art.height * sc; x.save(); x.filter = 'brightness(1.08) saturate(1.05)'; if (facing < 0) { x.translate(296, 0); x.scale(-1, 1); } x.drawImage(art, (296 - w) / 2, (320 - h) / 2, w, h); x.filter = 'none'; x.restore(); return;
  }
  // drawn portraits are painted at 3x, smooth-shaded, with a soft ink outline (cleaner faces for everyone without painted art)
  canvas.style.imageRendering = 'auto';
  const sp = specFor(who); expr = expr || 'neutral';
  const key = JSON.stringify(sp) + '|' + expr + '|' + facing + '|hi';
  if (!PCache[key]) PCache[key] = paintBustHi(sp, expr, facing);
  canvas.width = PW * RS; canvas.height = PH * RS;
  const x = canvas.getContext('2d'); x.clearRect(0, 0, canvas.width, canvas.height); x.drawImage(PCache[key], 0, 0);
}
const RS = 3;
function paintBustHi(sp, expr, facing) {
  const W = PW * RS, H = PH * RS;
  const c = document.createElement('canvas'); c.width = W; c.height = H; const x = c.getContext('2d');
  x.HI = true; x.scale(RS, RS); x.lineJoin = 'round'; x.lineCap = 'round';
  const fill = col => { x.fillStyle = col; }, stroke = col => { x.strokeStyle = col; };
  if (sp.special === 'dread') paintDread(x, fill, stroke, expr); else paintPerson(x, sp, expr, fill, stroke);
  x.setTransform(1, 0, 0, 1, 0, 0);
  // light from the upper right, shadow pooling lower left — painted only onto the figure
  x.globalCompositeOperation = 'source-atop';
  let g = x.createLinearGradient(W * .85, H * .05, W * .1, H * .95);
  g.addColorStop(0, 'rgba(255,244,222,.16)'); g.addColorStop(.45, 'rgba(255,244,222,0)'); g.addColorStop(1, 'rgba(24,14,48,.30)');
  x.fillStyle = g; x.fillRect(0, 0, W, H);
  g = x.createRadialGradient(W * .5, H * .42, W * .05, W * .5, H * .42, W * .62); g.addColorStop(0, 'rgba(0,0,0,0)'); g.addColorStop(1, 'rgba(10,8,20,.18)');
  x.fillStyle = g; x.fillRect(0, 0, W, H);
  x.globalCompositeOperation = 'source-over';
  // ink outline: the silhouette, darkened, stamped around the figure
  const o = document.createElement('canvas'); o.width = W; o.height = H; const ox = o.getContext('2d');
  ox.drawImage(c, 0, 0); ox.globalCompositeOperation = 'source-in'; ox.fillStyle = '#0d0a12'; ox.fillRect(0, 0, W, H);
  const out = document.createElement('canvas'); out.width = W; out.height = H; const q = out.getContext('2d');
  for (const [dx, dy] of [[2, 0], [-2, 0], [0, 2], [0, -2], [1.5, 1.5], [-1.5, 1.5], [1.5, -1.5], [-1.5, -1.5]]) q.drawImage(o, dx, dy);
  q.drawImage(c, 0, 0);
  if (facing < 0) { const m = document.createElement('canvas'); m.width = W; m.height = H; const mx = m.getContext('2d'); mx.translate(W, 0); mx.scale(-1, 1); mx.drawImage(out, 0, 0); return m; }
  return out;
}
function paintBust(sp, expr, facing) {
  const c = document.createElement('canvas'); c.width = PW; c.height = PH; const x = c.getContext('2d');
  const used = new Set(); const fill = col => { used.add(col); x.fillStyle = col; }, stroke = col => { used.add(col); x.strokeStyle = col; };
  if (sp.special === 'dread') paintDread(x, fill, stroke, expr);
  else paintPerson(x, sp, expr, fill, stroke);
  pixelate(c, used);
  if (facing < 0) { const m = document.createElement('canvas'); m.width = PW; m.height = PH; const mx = m.getContext('2d'); mx.translate(PW, 0); mx.scale(-1, 1); mx.drawImage(c, 0, 0); return m; }
  return c;
}
function P(x, pts, close = true) { x.beginPath(); pts.forEach((p, i) => { if (p.length === 2) i ? x.lineTo(p[0], p[1]) : x.moveTo(p[0], p[1]); else if (p.length === 4) x.quadraticCurveTo(p[0], p[1], p[2], p[3]); else x.bezierCurveTo(p[0], p[1], p[2], p[3], p[4], p[5]); }); if (close) x.closePath(); }
function E(x, cx, cy, rx, ry, rot) { x.beginPath(); x.ellipse(cx, cy, Math.max(.1, rx), Math.max(.1, ry), rot || 0, 0, Math.PI * 2); }

function paintPerson(x, sp, expr, fill, stroke) {
  const kid = sp.age === 'kid', elder = sp.age === 'elder', fem = sp.sex === 'f';
  const S = ramp('body', sp.skin), H = ramp('hair', sp.hairCol), C = ramp('cloth', sp.col), C2 = ramp('cloth', sp.col2 || sp.col);
  const eyeC = EYE_HEX[sp.eye] || sp.eye || EYE_HEX.brown;
  // layout: face centre (eye line) and scale
  const s = kid ? 1.32 : 1.22, cx = 49, cy = kid ? 50 : 47, t = 2.2 * s; // t = turn toward the right
  const X = v => cx + v * s, Y = v => cy + v * s;
  const sh = (sp.broad ? 1.1 : 1) * (kid ? .8 : fem ? .92 : 1) * (sp.plump ? 1.08 : 1);
  const hood = sp.hood ? ramp('cloth', sp.hood) : null;

  /* back hair / hood / cape behind everything */
  if (sp.cape) { const K = ramp('cloth', sp.cape); fill(K[2]); P(x, [[50 - 54 * sh, PH], [50 - 50 * sh, 95, 50 - 32 * sh, 90], [50 + 32 * sh, 90], [50 + 50 * sh, 95, 50 + 54 * sh, PH]]); x.fill(); }
  if (hood) { fill(hood[2]); P(x, [[X(-27), Y(42)], [X(-30), Y(-10), X(-10), Y(-34)], [X(10), Y(-40), X(31), Y(-14), X(28), Y(42)]]); x.fill(); }
  else paintHairBack(x, sp, H, X, Y, s, fill, kid);
  /* shoulders & clothes */
  paintClothes(x, sp, C, C2, S, sh, kid, fill, stroke);
  /* neck */
  fill(S[2]); x.fillRect(X(-7), Y(14), 15 * s, 22 * s);
  if (x.HI) x.globalAlpha = .45; fill(S[3]); x.fillRect(X(-1), Y(18), 8 * s, 18 * s); x.globalAlpha = 1;
  if (!sp.hood) { fill(S[1]); E(x, X(1), Y(21), 8 * s, 3 * s); x.fill(); }
  if (sp.cloth !== 'robe' && sp.cloth !== 'plate' && sp.cloth !== 'tabard') paintCollar(x, sp, C, C2, S, sh, kid, fill, stroke);
  if (sp.necklace) { stroke('#e8c560'); x.lineWidth = 1; x.beginPath(); x.moveTo(X(-7), Y(30)); x.quadraticCurveTo(X(1), Y(40), X(9), Y(30)); x.stroke(); fill('#3ccf6e'); E(x, X(1), Y(39), 1.6, 2.2); x.fill(); }
  /* ears */
  if (!hood) {
    fill(S[3]); if (sp.elf) { P(x, [[X(-15), Y(-2)], [X(-30), Y(-14)], [X(-17), Y(8)]]); x.fill(); fill(S[2]); P(x, [[X(-16), Y(0)], [X(-25), Y(-9)], [X(-17), Y(5)]]); x.fill(); }
    else { E(x, X(-17.5), Y(2), 3 * s, 5 * s); x.fill(); fill(S[2]); E(x, X(-17.5), Y(2.5), 1.4 * s, 3 * s); x.fill(); }
  }
  /* face */
  const jaw = kid ? 1.06 : fem ? .96 : sp.gaunt ? .9 : sp.plump ? 1.1 : 1;
  const chinY = kid ? 21 : fem ? 23 : 25;
  fill(S[3]);
  P(x, [[X(-17), Y(-14)], [X(-17.5), Y(5)], [X(-16 * jaw), Y(15), X(-8), Y(chinY - 3)], [X(-1), Y(chinY + 1), X(t + 2), Y(chinY)], [X(11 * jaw), Y(chinY - 3), X(15.5 * jaw), Y(13)], [X(18), Y(6), X(17), Y(-4)], [X(17), Y(-14)], [X(0), Y(-30), X(-17), Y(-14)]]);
  x.fill();
  // shading on the far (left) side and under the hairline
  x.save(); x.clip();
  if (x.HI) x.globalAlpha = .6; fill(S[2]); P(x, [[X(-18), Y(-16)], [X(-11), Y(-16)], [X(-13), Y(2), X(-10), Y(chinY)], [X(-18), Y(chinY + 2)]]); x.fill(); x.globalAlpha = 1;
  fill(S[4]); E(x, X(9), Y(6), 5 * s, 4 * s); x.fill();
  if (sp.plump) { fill(S[2]); E(x, X(-1), Y(chinY - 1), 11 * s, 2.4 * s); x.fill(); }
  if (sp.gaunt) { fill(S[2]); P(x, [[X(10), Y(6)], [X(14), Y(5)], [X(12), Y(15)]]); x.fill(); }
  x.restore();
  if (hood) { // the hood's shadow swallows the top half of the face
    x.save(); P(x, [[X(-18), Y(-30)], [X(19), Y(-30)], [X(19), Y(-1)], [X(-18), Y(-1)]]); x.clip(); fill(S[1]); x.globalAlpha = .55; x.fillRect(0, 0, PW, PH); x.globalAlpha = 1; x.restore();
  }
  /* cheeks, nose, features */
  if (elder) { stroke(S[1]); x.lineWidth = .8; x.beginPath(); x.moveTo(X(-12), Y(-11)); x.lineTo(X(-4), Y(-12)); x.moveTo(X(2), Y(-12)); x.lineTo(X(10), Y(-11)); x.moveTo(X(-2), Y(9)); x.quadraticCurveTo(X(-5), Y(14), X(-3), Y(17)); x.moveTo(X(10), Y(9)); x.quadraticCurveTo(X(12), Y(14), X(10), Y(17)); x.stroke(); }
  if (sp.burn) paintBurn(x, X, Y, s, fill);
  const blush = expr === 'blush' || (expr === 'shame' && fem) || (sp.beauty && expr === 'happy');
  if (blush) { fill('#ff7a8a'); x.globalAlpha = .55; E(x, X(-10), Y(8), 4.5 * s, 2 * s); x.fill(); E(x, X(12), Y(8), 4 * s, 2 * s); x.fill(); x.globalAlpha = 1;
    stroke('#e0485e'); x.lineWidth = .8; for (const ox of [-12, -9, -6, 10, 13]) { x.beginPath(); x.moveTo(X(ox), Y(9.5)); x.lineTo(X(ox + 1.5), Y(6.5)); x.stroke(); } }
  if (x.HI) { // soft cheeks, a shadowed nose, a little light on the bridge
    x.globalAlpha = kid ? .22 : fem ? .18 : .1; fill('#ff8a8a'); E(x, X(-10), Y(8), 5 * s, 2.6 * s); x.fill(); E(x, X(12), Y(8), 4.4 * s, 2.4 * s); x.fill();
    x.globalAlpha = .45; fill(S[2]); P(x, [[X(t + 1.5), Y(kid ? 5 : 2)], [X(t + 4.6), Y(kid ? 8.4 : 9.4)], [X(t + 1.6), Y(kid ? 8.8 : 9.8)]]); x.fill();
    x.globalAlpha = .55; fill(S[5]); E(x, X(t + 4), Y(kid ? 5.5 : 5), .7 * s, 1.6 * s); x.fill(); x.globalAlpha = 1;
  }
  // nose
  stroke(S[1]); x.lineWidth = 1; x.beginPath(); x.moveTo(X(t + 3), Y(kid ? 5 : 3)); x.lineTo(X(t + 4.5), Y(kid ? 8 : 9)); x.lineTo(X(t + 2.5), Y(kid ? 8.5 : 9.5)); x.stroke();
  paintEyes(x, sp, expr, X, Y, s, t, eyeC, H, S, fill, stroke, kid, fem, !!hood);
  paintMouth(x, sp, expr, X, Y, s, t, S, fill, stroke, kid, fem);
  if (sp.beard) paintBeard(x, sp, H, X, Y, s, t, chinY, fill, stroke);
  if (sp.stache) { fill(H[2]); if (sp.stache === 'walrus') P(x, [[X(-6 + t), Y(12)], [X(-8 + t), Y(19), X(-3 + t), Y(16)], [X(2 + t), Y(14)], [X(7 + t), Y(16), X(12 + t), Y(19)], [X(10 + t), Y(11), X(2 + t), Y(10)]]); else P(x, [[X(-3 + t), Y(13)], [X(2 + t), Y(11.5)], [X(8 + t), Y(13)], [X(2 + t), Y(13.6)]]); x.fill(); }
  if (sp.stubble) { fill(S[2]); x.globalAlpha = .6; P(x, [[X(-15), Y(8)], [X(-8), Y(chinY - 1), X(2), Y(chinY + 1)], [X(12), Y(chinY - 2), X(15), Y(8)], [X(8), Y(13), X(-8), Y(13)]]); x.fill(); x.globalAlpha = 1; }
  if (sp.scar) { stroke('#b0585a'); x.lineWidth = 1; x.beginPath(); x.moveTo(X(11), Y(-9)); x.lineTo(X(6), Y(9)); x.stroke(); }
  if (sp.bandage) { fill('#efe8dc'); x.save(); x.translate(X(-6), Y(-2)); x.rotate(-.5); x.fillRect(-14 * s, -3 * s, 26 * s, 5 * s); fill('#cfc6b6'); x.fillRect(-14 * s, 1 * s, 26 * s, 1); x.restore(); }
  if (sp.shades) { fill('#16121c'); E(x, X(-7), Y(0), 6 * s, 4.4 * s); x.fill(); E(x, X(9), Y(0), 5.5 * s, 4.4 * s); x.fill(); stroke('#16121c'); x.lineWidth = 1.2; x.beginPath(); x.moveTo(X(-1), Y(-1)); x.lineTo(X(4), Y(-1)); x.stroke(); fill('#6a6a8a'); x.fillRect(X(-10), Y(-2), 2, 1); x.fillRect(X(6), Y(-2), 2, 1); }
  /* hair in front / headgear */
  if (hood) paintHood(x, hood, X, Y, s, fill);
  else if (sp.helm) paintHelm(x, X, Y, s, fill, stroke);
  else paintHairFront(x, sp, H, X, Y, s, t, fill, stroke, kid);
  if (sp.band && !hood) { const B = ramp('cloth', sp.band); fill(B[3]); P(x, [[X(-19), Y(-14)], [X(0), Y(-19), X(19), Y(-14)], [X(19), Y(-9)], [X(0), Y(-14), X(-19), Y(-9)]]); x.fill(); fill(B[2]); P(x, [[X(-19), Y(-10)], [X(-27), Y(-4)], [X(-24), Y(2)], [X(-18), Y(-7)]]); x.fill(); }
  if (sp.ribbon) { fill('#3ccf6e'); P(x, [[X(13), Y(-18)], [X(20), Y(-23)], [X(19), Y(-14)]]); x.fill(); P(x, [[X(13), Y(-18)], [X(7), Y(-24)], [X(9), Y(-15)]]); x.fill(); fill('#1f8a4c'); E(x, X(13), Y(-18), 1.6, 1.6); x.fill(); }
  // Drag eyes glow softly in shadow
  if (sp.eye === 'green' && (hood || expr === 'anger')) { x.save(); x.globalCompositeOperation = 'lighter'; const g = x.createRadialGradient(X(1), Y(0), 1, X(1), Y(0), 16 * s); g.addColorStop(0, 'rgba(70,255,140,.0)'); g.addColorStop(.3, 'rgba(70,255,140,.12)'); g.addColorStop(1, 'rgba(70,255,140,0)'); x.fillStyle = g; x.fillRect(0, 0, PW, PH); x.restore(); }
}
function paintClothes(x, sp, C, C2, S, sh, kid, fill, stroke) {
  const L = 50 - 52 * sh, R = 50 + 52 * sh, top = kid ? 95 : 90;
  const base = sp.cloth === 'robe' || sp.cloth === 'tabard' ? ramp('cloth', 'white') : sp.cloth === 'plate' ? rampFromHex('#8a929c') : C;
  fill(base[3]); P(x, [[L, PH], [L + 2, top + 6, 50 - 26 * sh, top], [50 + 26 * sh, top], [R - 2, top + 6, R, PH]]); x.fill();
  fill(base[2]); P(x, [[L, PH], [L + 2, top + 6, 50 - 26 * sh, top], [50 - 20 * sh, top + 2], [L + 10, top + 10, L + 8, PH]]); x.fill();
  fill(base[4]); P(x, [[R - 14, PH], [R - 12, top + 9], [50 + 22 * sh, top + 1], [R - 3, top + 6, R - 2, PH]]); x.fill();
  if (sp.cloth === 'plate') { fill(base[4]); E(x, L + 12, top + 9, 14, 8, -.3); x.fill(); E(x, R - 12, top + 9, 14, 8, .3); x.fill(); fill(base[2]); E(x, L + 12, top + 11, 10, 4, -.3); x.fill(); fill(base[1]); x.fillRect(48, top + 6, 3, PH); }
  if (sp.cloth === 'robe' || sp.cloth === 'tabard') { fill('#d9b44a'); x.fillRect(46, top + 4, 7, PH); fill('#fff6d8'); x.fillRect(48, top + 4, 3, PH); if (sp.cloth === 'tabard') { fill('#8a929c'); E(x, L + 12, top + 7, 12, 6, -.3); x.fill(); E(x, R - 12, top + 7, 12, 6, .3); x.fill(); } }
  if (sp.cloth === 'vest') { const I = ramp('cloth', sp.col2 || 'white'); fill(I[3]); P(x, [[42, top + 2], [58, top + 2], [54, PH], [46, PH]]); x.fill(); fill(C[1]); x.fillRect(41, top + 4, 2, PH); x.fillRect(57, top + 4, 2, PH); }
  if (sp.cloth === 'apron') { const A = ramp('cloth', sp.col2 || 'white'); fill(A[4]); P(x, [[34, PH], [36, top + 14], [64, top + 14], [66, PH]]); x.fill(); fill(A[3]); x.fillRect(36, top + 2, 3, 14); x.fillRect(61, top + 2, 3, 14); }
  if (sp.cloth === 'leather') { fill(C[1]); x.fillRect(L + 16, top + 4, 3, PH); x.fillRect(R - 19, top + 4, 3, PH); }
  if (sp.cape) { const K = ramp('cloth', sp.cape); fill(K[3]); P(x, [[L - 2, PH], [L, top + 4, 50 - 30 * sh, top - 1], [50 - 18 * sh, top + 3], [L + 8, top + 14, L + 6, PH]]); x.fill(); P(x, [[R + 2, PH], [R, top + 4, 50 + 30 * sh, top - 1], [50 + 18 * sh, top + 3], [R - 8, top + 14, R - 6, PH]]); x.fill();
    fill(K[4]); x.fillRect(50 - 27 * sh, top, 6, 2); x.fillRect(50 + 21 * sh, top, 6, 2); fill('#d9b44a'); E(x, 50 - 18 * sh, top + 4, 2, 2); x.fill(); E(x, 50 + 18 * sh, top + 4, 2, 2); x.fill(); }
}
function paintCollar(x, sp, C, C2, S, sh, kid, fill, stroke) {
  const top = kid ? 95 : 90;
  if (sp.cloth === 'gi') { // crossed lapels
    fill(C[1]); P(x, [[42, top - 2], [50, top + 14], [58, top - 2]]); x.fill();
    fill(C[4]); P(x, [[38, top - 3], [44, top - 3], [56, top + 22], [50, top + 26]]); x.fill();
    fill(C[3]); P(x, [[62, top - 3], [56, top - 3], [50, top + 12], [53, top + 18]]); x.fill();
    const O = ramp('cloth', sp.col2 || 'black'); fill(O[3]); x.fillRect(30, PH - 4, 40, 4);
  } else if (sp.cloth === 'scoop') { fill(S[3]); P(x, [[39, top - 2], [50, top + 14, 61, top - 2]]); x.fill(); fill(S[4]); E(x, 52, top + 4, 5, 3); x.fill(); }
  else if (sp.cloth === 'blouse' || sp.cloth === 'kidshirt' || sp.cloth === 'shirt') { fill(sp.cloth === 'blouse' ? C[4] : C[2]); P(x, [[40, top - 1], [50, top + 7, 60, top - 1], [50, top + 3, 40, top - 1]]); x.fill(); }
  else if (sp.cloth === 'tunic' || sp.cloth === 'leather' || sp.cloth === 'vest' || sp.cloth === 'apron') { fill(S[2]); P(x, [[43, top - 2], [50, top + 10], [57, top - 2]]); x.fill(); fill(C[2]); x.fillRect(43, top - 2, 2, 3); x.fillRect(55, top - 2, 2, 3); }
}
function paintBurn(x, X, Y, s, fill) {
  // a raw red burn over the near eye — up into the brow, a spill down the cheek
  fill('#d8505a'); x.globalAlpha = .78;
  P(x, [[X(-16), Y(-10)], [X(-9), Y(-13), X(-2), Y(-9)], [X(1), Y(-2), X(-1), Y(5)], [X(-4), Y(10), X(-8), Y(14)], [X(-12), Y(13), X(-14), Y(7)], [X(-17), Y(0)]]); x.fill();
  fill('#a8343e'); x.globalAlpha = .6; P(x, [[X(-15), Y(-8)], [X(-10), Y(-10), X(-8), Y(-7)], [X(-12), Y(1), X(-14), Y(4)]]); x.fill();
  fill('#f2949a'); x.globalAlpha = .55; E(x, X(-6), Y(8), 2 * s, 2.4 * s); x.fill(); x.globalAlpha = 1;
}
function paintEyes(x, sp, expr, X, Y, s, t, eyeC, H, S, fill, stroke, kid, fem, hood) {
  const big = kid ? 1.25 : sp.beauty ? 1.12 : fem ? 1.06 : sp.sharp ? .95 : 1;
  const ew = 8 * big, eh = (kid ? 8 : 6.4) * big * (sp.sharp ? .85 : 1);
  const eyes = [[-7 + t * .4, 1], [9.5 + t * .6, .88]]; // [x, width factor]  (far eye narrower)
  const I = rampFromHex(eyeC);
  const lineC = sp.hood ? '#0b0b10' : H[0];
  const brow = { neutral: [0, 0], happy: [-1, -1], anger: [3, -2], sad: [-3, 2], shock: [-3, -3], shame: [-2, 1.5], closed: [0, 0], blush: [-1, 0] }[expr] || [0, 0];
  for (const [ex, wf] of eyes) {
    const cx = X(ex), cy = Y(0), w = ew * wf * s, h = eh * s, inner = ex < 0 ? 1 : -1; // inner side direction (toward nose)
    // brows
    if (!sp.helm || true) { stroke(sp.hood ? '#0b0b10' : H[1]); x.lineWidth = (kid ? 1.6 : sp.age === 'elder' ? 2 : 1.8) * s; x.beginPath();
      const by = cy - h * .9 - 3 * s; x.moveTo(cx - w * .65 * inner, by + brow[1] * .5 * s); x.quadraticCurveTo(cx, by - 1.5 * s + (brow[0] + brow[1]) * .25 * s, cx + w * .6 * inner, by + brow[0] * s); x.stroke(); }
    if (expr === 'happy' || expr === 'closed') { // closed arcs
      stroke(lineC); x.lineWidth = 1.8 * s; x.beginPath();
      if (expr === 'happy') { x.moveTo(cx - w * .55, cy + 1.5 * s); x.quadraticCurveTo(cx, cy - h * .9, cx + w * .55, cy + 1.5 * s); }
      else { x.moveTo(cx - w * .55, cy); x.quadraticCurveTo(cx, cy + h * .45, cx + w * .55, cy); }
      x.stroke(); if (fem || sp.beauty) { x.lineWidth = 1; x.beginPath(); x.moveTo(cx - w * .5 * inner, cy + (expr === 'happy' ? 1 : 0) * s); x.lineTo(cx - (w * .5 + 2.5 * s) * inner, cy - 1.5 * s); x.stroke(); }
      continue;
    }
    const open = expr === 'shock' ? 1.25 : expr === 'anger' ? .72 : expr === 'sad' ? .8 : expr === 'shame' ? .7 : expr === 'blush' ? .85 : 1;
    const hh = h * open;
    // sclera
    fill(hood ? '#9fb3a8' : '#fbfbf6'); E(x, cx, cy, w / 2, hh / 2); x.fill();
    // iris + pupil
    const look = expr === 'shame' ? -2.2 * s : expr === 'sad' ? .5 * s : 1 * s, lookY = expr === 'sad' ? 1 * s : 0;
    const ir = expr === 'shock' ? .55 : 1;
    x.save(); E(x, cx, cy, w / 2, hh / 2); x.clip();
    fill(I[2]); E(x, cx + look, cy + lookY, w * .34 * ir, h * .5 * ir); x.fill();
    fill(I[3]); E(x, cx + look, cy + lookY + h * .12, w * .27 * ir, h * .34 * ir); x.fill();
    if (x.HI) { const gi = x.createLinearGradient(0, cy - h * .5, 0, cy + h * .5); gi.addColorStop(0, I[1]); gi.addColorStop(.55, I[3]); gi.addColorStop(1, I[5]); x.fillStyle = gi; E(x, cx + look, cy + lookY, w * .32 * ir, h * .47 * ir); x.fill(); x.globalAlpha = .35; fill(I[0]); E(x, cx + look, cy + lookY - h * .3, w * .34 * ir, h * .18 * ir); x.fill(); x.globalAlpha = 1; }
    fill(I[0]); E(x, cx + look, cy + lookY, w * .13 * ir, h * .22 * ir); x.fill();
    if (x.HI && expr !== 'shock') { fill('#ffffff'); E(x, cx + look - w * .12, cy - hh * .18, .9 * s, .9 * s); x.fill(); x.globalAlpha = .7; E(x, cx + look + w * .1, cy + hh * .14, .45 * s, .45 * s); x.fill(); x.globalAlpha = 1; }
    if (sp.eye === 'green' || sp.beauty) { fill(I[5]); E(x, cx + look, cy + lookY + h * .28, w * .2 * ir, h * .1 * ir); x.fill(); }
    if (expr !== 'shock' && !x.HI) { fill('#ffffff'); x.fillRect(Math.round(cx + look - w * .2), Math.round(cy - hh * .3), Math.max(1, Math.round(1.6 * s)), Math.max(1, Math.round(1.6 * s))); if (kid || sp.beauty) x.fillRect(Math.round(cx + look + w * .12), Math.round(cy + hh * .12), 1, 1); }
    x.restore();
    // upper lid (thick), slanted by expression
    stroke(lineC); x.lineWidth = (kid ? 1.7 : 1.9) * s; x.beginPath();
    const slant = expr === 'anger' ? 1.6 * s : expr === 'sad' ? -1.4 * s : 0;
    x.moveTo(cx - w * .58 * inner, cy - hh * .25 + slant); x.quadraticCurveTo(cx, cy - hh * .75 + (expr === 'anger' ? slant * .4 : 0), cx + w * .6 * inner, cy - hh * .2 - slant * .3); x.stroke();
    // outer flick / lashes
    x.lineWidth = 1.2 * s; x.beginPath(); x.moveTo(cx - w * .52 * inner, cy - hh * .2); x.lineTo(cx - (w * .52 + (fem ? 3 : 1.8) * s) * inner, cy - hh * .2 - (fem ? 1.6 : .4) * s); x.stroke();
    if (sp.beauty) { x.beginPath(); x.moveTo(cx - w * .3 * inner, cy - hh * .5); x.lineTo(cx - (w * .38 + 1.5 * s) * inner, cy - hh * .5 - 2 * s); x.stroke(); }
    // lower lid hint
    stroke(sp.hood ? '#0b0b10' : S[1]); x.lineWidth = .9; x.beginPath(); x.moveTo(cx - w * .45 * inner, cy + hh * .45); x.lineTo(cx + w * .1 * inner, cy + hh * .5); x.stroke();
    if (sp.age === 'elder') { x.beginPath(); x.moveTo(cx - w * .4, cy + hh * .5 + 2 * s); x.quadraticCurveTo(cx, cy + hh * .5 + 3 * s, cx + w * .4, cy + hh * .5 + 2 * s); x.stroke(); }
  }
  // extras
  if (expr === 'sad' && kid) { fill('#9ad8ff'); E(x, X(-9), Y(7), 1.2 * s, 2.4 * s); x.fill(); }
  if (expr === 'shame' || expr === 'shock') { fill('#bfe6ff'); P(x, [[X(17), Y(-12)], [X(15), Y(-7), X(17), Y(-6)], [X(19), Y(-7), X(17), Y(-12)]]); x.fill(); }
  if (expr === 'anger') { stroke('#e04040'); x.lineWidth = 1.2; x.beginPath(); const ax = X(13), ay = Y(-21); x.moveTo(ax - 3, ay - 1); x.lineTo(ax - 1, ay - 1); x.lineTo(ax - 1, ay - 3); x.moveTo(ax + 1, ay - 3); x.lineTo(ax + 1, ay - 1); x.lineTo(ax + 3, ay - 1); x.moveTo(ax - 3, ay + 1); x.lineTo(ax - 1, ay + 1); x.lineTo(ax - 1, ay + 3); x.moveTo(ax + 1, ay + 3); x.lineTo(ax + 1, ay + 1); x.lineTo(ax + 3, ay + 1); x.stroke(); }
}
function paintMouth(x, sp, expr, X, Y, s, t, S, fill, stroke, kid, fem) {
  const mx = X(t + 1.5), my = Y(kid ? 13 : 15.5), lip = mix(S[1], '#c0405a', sp.beauty ? .45 : fem ? .25 : 0);
  stroke(lip); fill(lip); x.lineWidth = 1.2 * s;
  if (expr === 'happy' || expr === 'blush') {
    if (kid || expr === 'happy') { fill('#5a1a22'); P(x, [[mx - 5 * s, my - 1 * s], [mx, my + 5 * s, mx + 5 * s, my - 1 * s], [mx, my, mx - 5 * s, my - 1 * s]]); x.fill(); fill('#e86a7a'); E(x, mx, my + 2.4 * s, 2.4 * s, 1.2 * s); x.fill(); }
    else { x.beginPath(); x.moveTo(mx - 4 * s, my - .5 * s); x.quadraticCurveTo(mx, my + 2.2 * s, mx + 4 * s, my - .8 * s); x.stroke(); }
  } else if (expr === 'anger') { fill('#3a0d12'); P(x, [[mx - 5 * s, my - 1.5 * s], [mx + 5 * s, my - 2 * s], [mx + 4 * s, my + 2.5 * s], [mx - 4 * s, my + 2.5 * s]]); x.fill(); fill('#f4f4ee'); x.fillRect(mx - 4 * s, my - 1.2 * s, 8 * s, 1.4 * s); x.fillRect(mx - 3.5 * s, my + 1 * s, 7 * s, 1); }
  else if (expr === 'sad') { x.beginPath(); x.moveTo(mx - 3.5 * s, my + 1 * s); x.quadraticCurveTo(mx, my - 1.5 * s, mx + 3.5 * s, my + 1 * s); x.stroke(); }
  else if (expr === 'shock') { fill('#3a0d12'); E(x, mx, my + .5 * s, 2.4 * s, 3 * s); x.fill(); }
  else if (expr === 'shame') { x.beginPath(); x.moveTo(mx - 4 * s, my); x.quadraticCurveTo(mx - 2 * s, my - 1.5 * s, mx, my); x.quadraticCurveTo(mx + 2 * s, my + 1.5 * s, mx + 4 * s, my); x.stroke(); }
  else { x.beginPath(); x.moveTo(mx - 3.5 * s, my); x.lineTo(mx + 3.5 * s, my - .3 * s); x.stroke(); if (sp.beauty || fem) { fill(mix(lip, '#ffffff', .2)); x.fillRect(mx - 1, my + 1, 3, 1); } }
}
function paintBeard(x, sp, H, X, Y, s, t, chinY, fill, stroke) {
  if (sp.beard === 'trim') { fill(H[3]); P(x, [[X(-17.5), Y(2)], [X(-16), Y(14), X(-8), Y(chinY - 1)], [X(t + 1), Y(chinY + 3), X(11), Y(chinY - 2)], [X(16), Y(12), X(17), Y(2)], [X(15), Y(4)], [X(13), Y(14), X(t + 1), Y(chinY - 2)], [X(-6), Y(chinY - 4), X(-15), Y(4)]]); x.fill(); fill(H[3]); P(x, [[X(-3 + t), Y(13)], [X(2 + t), Y(11.8)], [X(7 + t), Y(13)], [X(2 + t), Y(13.4)]]); x.fill(); return; }
  const len = sp.beard === 'long' ? 18 : sp.beard === 'full' ? 9 : 3;
  fill(H[3]); P(x, [[X(-17), Y(-2)], [X(-16), Y(14), X(-9), Y(chinY + len * .6)], [X(t + 1), Y(chinY + len + 2), X(11), Y(chinY + len * .5)], [X(17), Y(12), X(17), Y(-2)], [X(14), Y(9)], [X(8 + t), Y(11), X(-4 + t), Y(11)], [X(-14), Y(9)]]); x.fill();
  fill(H[2]); P(x, [[X(-17), Y(-2)], [X(-15), Y(14), X(-8), Y(chinY + len * .5)], [X(-5), Y(chinY), X(-12), Y(8)]]); x.fill();
  fill(H[4]); x.fillRect(X(5), Y(chinY), 2, 2 + len * .3);
  // mouth gap
  fill('#3a0d12'); x.fillRect(X(t - 2), Y(15), 6 * s, 1.2 * s);
}
function paintHood(x, K, X, Y, s, fill) {
  fill(K[3]); P(x, [[X(-27), Y(40)], [X(-31), Y(-6), X(-14), Y(-33)], [X(4), Y(-42), X(22), Y(-30)], [X(33), Y(-12), X(26), Y(40)], [X(18), Y(40)], [X(20), Y(4), X(17), Y(-14)], [X(4), Y(-24), X(-17), Y(-14)], [X(-21), Y(6), X(-19), Y(40)]]); x.fill();
  fill(K[2]); P(x, [[X(-27), Y(40)], [X(-31), Y(-6), X(-14), Y(-33)], [X(-10), Y(-30)], [X(-24), Y(-8), X(-19), Y(40)]]); x.fill();
  fill(K[4]); P(x, [[X(14), Y(-33)], [X(28), Y(-24), X(29), Y(0)], [X(25), Y(-2)], [X(24), Y(-20), X(12), Y(-30)]]); x.fill();
  fill(K[1]); P(x, [[X(-17), Y(-14)], [X(4), Y(-24), X(17), Y(-14)], [X(18), Y(-10)], [X(4), Y(-19), X(-17), Y(-10)]]); x.fill();
}
function paintHelm(x, X, Y, s, fill) {
  const M = rampFromHex('#8a929c');
  fill(M[3]); P(x, [[X(-21), Y(-6)], [X(-22), Y(-32), X(0), Y(-34)], [X(22), Y(-32), X(21), Y(-6)], [X(26), Y(-5)], [X(26), Y(-2)], [X(-25), Y(-2)], [X(-25), Y(-5)]]); x.fill();
  fill(M[4]); P(x, [[X(4), Y(-31)], [X(16), Y(-29), X(18), Y(-10)], [X(14), Y(-10)], [X(13), Y(-25), X(4), Y(-28)]]); x.fill();
  fill(M[2]); x.fillRect(X(-25), Y(-4), 50 * s, 2 * s); fill(M[1]); x.fillRect(X(-1), Y(-33), 2 * s, 28 * s);
}
/* ---------- hair ---------- */
function paintHairBack(x, sp, H, X, Y, s, fill, kid) {
  const st = sp.hair; fill(H[2]);
  const back = len => { P(x, [[X(-21), Y(-12)], [X(-25), Y(len * .5), X(-23), Y(len)], [X(0), Y(len + 4), X(23), Y(len)], [X(25), Y(len * .5), X(21), Y(-12)], [X(0), Y(-34), X(-21), Y(-12)]]); x.fill(); };
  if (st === 'long' || st === 'longPart') back(kid ? 26 : 40);
  else if (st === 'wavy') { back(kid ? 30 : 36); fill(H[1]); for (let i = -2; i <= 2; i++) { E(x, X(i * 9), Y(kid ? 30 : 36), 5 * s, 4 * s); x.fill(); } }
  else if (st === 'messyLong') { P(x, [[X(-22), Y(-12)], [X(-28), Y(14)], [X(-23), Y(10)], [X(-27), Y(30)], [X(-19), Y(22)], [X(-17), Y(34)], [X(0), Y(26)], [X(17), Y(34)], [X(19), Y(22)], [X(27), Y(30)], [X(23), Y(10)], [X(28), Y(14)], [X(22), Y(-12)], [X(0), Y(-36), X(-22), Y(-12)]]); x.fill(); }
  else if (st === 'bob') back(kid ? 10 : 12);
  else if (st === 'locs') { fill(H[2]); for (let i = -5; i <= 5; i++) { x.fillRect(X(i * 4.4 - 2), Y(-10), 3.6 * s, (34 + (i % 2) * 4) * s); } }
  else if (st === 'afro') { E(x, X(0), Y(-16), 31 * s, 26 * s); x.fill(); }
  else if (st === 'puff') { E(x, X(0), Y(-16), 26 * s, 22 * s); x.fill(); }
  else if (st === 'ponytail') { P(x, [[X(10), Y(-28)], [X(30), Y(-30), X(30), Y(-6)], [X(29), Y(14), X(22), Y(26)], [X(25), Y(6), X(20), Y(-14)]]); x.fill(); }
  else if (st === 'tied') { P(x, [[X(-16), Y(-6)], [X(-22), Y(10), X(-18), Y(30)], [X(-12), Y(16), X(-12), Y(-6)]]); x.fill(); }
  else if (st === 'braid') { for (let i = 0; i < 6; i++) { fill(i % 2 ? H[2] : H[3]); E(x, X(17 + i * .6), Y(8 + i * 5), 3.8 * s, 3 * s); x.fill(); } }
  else if (st === 'pigtails') { E(x, X(-24), Y(4), 6 * s, 11 * s); x.fill(); E(x, X(24), Y(4), 6 * s, 11 * s); x.fill(); }
}
function strand(x, x0, y0, x1, y1, tx, ty, curl) { x.beginPath(); x.moveTo(x0, y0); x.quadraticCurveTo((x0 + tx) / 2 + curl, (y0 + ty) / 2, tx, ty); x.quadraticCurveTo((x1 + tx) / 2 + curl, (y1 + ty) / 2, x1, y1); x.closePath(); x.fill(); }
function paintHairFront(x, sp, H, X, Y, s, t, fill, stroke, kid) {
  const st = sp.hair;
  if (st === 'bald') return;
  const cap = (top = -33, edge = -14) => { fill(H[3]); P(x, [[X(-19), Y(edge)], [X(-20), Y(top + 6), X(0), Y(top)], [X(20), Y(top + 6), X(19), Y(edge)], [X(10), Y(edge - 6), X(-10), Y(edge - 4)]]); x.fill(); };
  const shine = (y0 = -28) => { fill(H[5]); P(x, [[X(-6), Y(y0)], [X(2), Y(y0 - 2), X(10), Y(y0 + 1)], [X(10), Y(y0 + 3)], [X(2), Y(y0), X(-6), Y(y0 + 2)]]); x.fill();
    if (x.HI) { x.globalAlpha = .5; stroke(H[4]); x.lineWidth = .7; for (const a of [-14, -8, 4, 12]) { x.beginPath(); x.moveTo(X(a), Y(y0 + 2)); x.quadraticCurveTo(X(a * 1.1), Y(y0 + 8), X(a * 1.15), Y(y0 + 13)); x.stroke(); } x.globalAlpha = 1; } };
  const bangs = (list, col = H[3]) => { fill(col); for (const [a, b, tx, ty, cu] of list) strand(x, X(a), Y(-20), X(b), Y(-20), X(tx), Y(ty), (cu || 0) * s); };
  if (st === 'balding') { fill(H[3]); P(x, [[X(-18), Y(-12)], [X(-21), Y(-6), X(-20), Y(3)], [X(-17), Y(-1)], [X(-17), Y(-8)]]); x.fill(); fill(H[4]); x.fillRect(X(-20), Y(-8), 1, 4); if (!x.HI) { fill('#ffffff'); x.globalAlpha = .35; E(x, X(5), Y(-27), 6 * s, 2 * s); x.fill(); x.globalAlpha = 1; } else { fill('#ffffff'); x.globalAlpha = .18; E(x, X(6), Y(-19), 5 * s, 1.6 * s, -.2); x.fill(); x.globalAlpha = 1; } return; }
  if (st === 'buzz' || st === 'cornrows') { fill(H[3]); x.globalAlpha = st === 'buzz' ? .85 : 1; P(x, [[X(-19), Y(-13)], [X(-20), Y(-31), X(0), Y(-33)], [X(20), Y(-31), X(19), Y(-13)], [X(0), Y(-19), X(-19), Y(-13)]]); x.fill(); x.globalAlpha = 1;
    if (st === 'cornrows') { stroke(H[1]); x.lineWidth = 1; for (let i = -3; i <= 3; i++) { x.beginPath(); x.moveTo(X(i * 5), Y(-17)); x.quadraticCurveTo(X(i * 5.6), Y(-28), X(i * 3), Y(-33)); x.stroke(); } }
    else { fill(H[4]); x.fillRect(X(-4), Y(-30), 10 * s, 2); } return; }
  if (st === 'afro' || st === 'puff') { fill(H[3]); const R = st === 'afro' ? 29 : 24; for (let i = 0; i < 12; i++) { const a = Math.PI + i / 11 * Math.PI; E(x, X(Math.cos(a) * R * .85), Y(-16 + Math.sin(a) * R * .75), 7 * s, 7 * s); x.fill(); } E(x, X(0), Y(-18), R * .8 * s, R * .55 * s); x.fill(); fill(H[2]); P(x, [[X(-19), Y(-12)], [X(0), Y(-18), X(19), Y(-12)], [X(19), Y(-9)], [X(0), Y(-15), X(-19), Y(-9)]]); x.fill(); fill(H[4]); E(x, X(6), Y(-32), 5 * s, 3 * s); x.fill(); return; }
  if (st === 'locs' || st === 'locsShort' || st === 'twists' || st === 'twistsShort') {
    cap(-32, -15); const L = st === 'locs' ? 26 : st === 'twists' ? 12 : 4;
    stroke(H[3]); x.lineWidth = 3.4 * s; x.lineCap = 'round';
    for (const [a, len] of [[-19, L + 6], [-15, L + 2], [-10, L * .4], [-5, -8], [1, -7], [7, -9], [12, L * .3], [16, L], [20, L + 5]]) { x.beginPath(); x.moveTo(X(a), Y(-24)); x.quadraticCurveTo(X(a * 1.15), Y(-12), X(a * 1.1 + (a > 0 ? 1 : -1)), Y(Math.max(-8, len))); x.stroke(); }
    stroke(H[4]); x.lineWidth = 1; for (const a of [-15, -5, 7, 16]) { x.beginPath(); x.moveTo(X(a), Y(-24)); x.lineTo(X(a), Y(-14)); x.stroke(); }
    if (st.startsWith('twists')) { fill(H[3]); for (let i = -3; i <= 3; i++) { E(x, X(i * 5.5), Y(-31 - Math.abs(i) * -1.2), 3 * s, 4.5 * s); x.fill(); } }
    x.lineCap = 'butt'; shine(-30); return;
  }
  cap();
  if (st === 'spiky') { fill(H[3]); for (const [a, h] of [[-20, -26], [-14, -40], [-6, -44], [3, -45], [11, -42], [18, -36], [22, -24]]) { P(x, [[X(a - 6), Y(-24)], [X(a), Y(h)], [X(a + 6), Y(-24)]]); x.fill(); }
    bangs([[-18, -9, -16, -6], [-11, -1, -6, -3], [-3, 7, 2, -4, 1], [5, 14, 11, -6], [12, 20, 18, -9]]); }
  else if (st === 'messy' || st === 'short' || st === 'curly') {
    if (st === 'curly') { fill(H[3]); for (let i = -4; i <= 4; i++) { E(x, X(i * 4.6), Y(-29 + Math.abs(i) * 1.6), 4 * s, 4 * s); x.fill(); } }
    if (st === 'messy') { fill(H[3]); for (const [a, h] of [[-17, -36], [-6, -40], [6, -39], [16, -34]]) { P(x, [[X(a - 6), Y(-26)], [X(a + 2), Y(h)], [X(a + 6), Y(-26)]]); x.fill(); } }
    bangs(st === 'short' ? [[-19, -10, -17, -10], [-11, -1, -6, -11], [-2, 8, 4, -12], [6, 19, 14, -12]] : [[-19, -10, -18, -6], [-12, -2, -7, -4, -1], [-3, 7, 3, -6, 1], [5, 15, 12, -5], [13, 20, 19, -8]]);
  }
  else if (st === 'swoop') { fill(H[3]); P(x, [[X(-20), Y(-18)], [X(-8), Y(-28), X(20), Y(-22)], [X(21), Y(-8)], [X(14), Y(-10), X(8), Y(-4)], [X(0), Y(-14), X(-20), Y(-12)]]); x.fill(); bangs([[-19, -11, -18, -6]]); }
  else if (st === 'pixie') { bangs([[-19, -9, -18, -7], [-12, 0, -4, -9, 2], [-2, 10, 8, -6, 2], [8, 20, 16, -10]]); }
  else if (st === 'bob') { bangs([[-20, -10, -19, -8], [-12, -2, -8, -8], [-4, 6, 1, -8], [4, 14, 9, -8], [12, 21, 19, -8]]); fill(H[3]); P(x, [[X(-21), Y(-16)], [X(-24), Y(4), X(-17), Y(10)], [X(-16), Y(-10)]]); x.fill(); P(x, [[X(21), Y(-16)], [X(24), Y(4), X(17), Y(10)], [X(16), Y(-10)]]); x.fill(); }
  else if (st === 'long' || st === 'wavy') { bangs([[-20, -10, -19, -2], [-12, -2, -8, -7], [-4, 6, 0, -9], [4, 14, 10, -8], [12, 21, 19, -3]]);
    fill(H[3]); P(x, [[X(-21), Y(-16)], [X(-24), Y(12), X(-20), Y(kid ? 24 : 32)], [X(-16), Y(10), X(-16), Y(-10)]]); x.fill(); P(x, [[X(21), Y(-16)], [X(24), Y(12), X(20), Y(kid ? 20 : 26)], [X(16), Y(8), X(16), Y(-10)]]); x.fill(); }
  else if (st === 'longPart') { // centre part, sleek, framing the face
    fill(H[3]); P(x, [[X(-1), Y(-31)], [X(-14), Y(-28), X(-19), Y(-12)], [X(-23), Y(14), X(-21), Y(38)], [X(-15), Y(18), X(-14), Y(-4)], [X(-8), Y(-18), X(-1), Y(-26)]]); x.fill();
    P(x, [[X(1), Y(-31)], [X(14), Y(-28), X(19), Y(-12)], [X(23), Y(14), X(21), Y(34)], [X(16), Y(16), X(15), Y(-4)], [X(9), Y(-18), X(1), Y(-26)]]); x.fill();
    fill(H[4]); P(x, [[X(-3), Y(-28)], [X(-13), Y(-22), X(-17), Y(2)], [X(-16), Y(2)], [X(-12), Y(-20), X(-3), Y(-26)]]); x.fill();
    stroke(H[1]); x.lineWidth = 1; x.beginPath(); x.moveTo(X(0), Y(-32)); x.lineTo(X(0), Y(-26)); x.stroke(); }
  else if (st === 'messyLong') { // ragged strands that fall right across the face
    bangs([[-20, -12, -21, 4, -2], [-14, -5, -10, 10, -1], [-7, 1, -2, 14, 1], [0, 7, 5, 6, 1], [5, 13, 11, 12, 2], [11, 20, 19, 2, 1]]);
    fill(H[3]); P(x, [[X(-21), Y(-16)], [X(-25), Y(10)], [X(-21), Y(24)], [X(-17), Y(8)], [X(-16), Y(-10)]]); x.fill(); P(x, [[X(21), Y(-16)], [X(25), Y(8)], [X(22), Y(22)], [X(17), Y(6)], [X(16), Y(-10)]]); x.fill();
    stroke(H[1]); x.lineWidth = .9; for (const [a, b] of [[-3, 12]]) { x.beginPath(); x.moveTo(X(a), Y(-18)); x.lineTo(X(a + 1.5), Y(b)); x.stroke(); } }
  else if (st === 'ponytail' || st === 'tied') { fill(H[3]); P(x, [[X(-19), Y(-12)], [X(-14), Y(-26), X(0), Y(-30)], [X(14), Y(-26), X(19), Y(-12)], [X(10), Y(-20), X(-10), Y(-19)]]); x.fill(); bangs([[-19, -12, -18, -5]]); if (st === 'ponytail') { fill('#c03a4a'); x.fillRect(X(18), Y(-24), 3 * s, 3 * s); } }
  else if (st === 'braid') { bangs([[-19, -9, -17, -9], [-9, 2, -3, -11], [2, 19, 12, -11]]); }
  else if (st === 'pigtails' || st === 'buns') { bangs([[-19, -9, -17, -8], [-9, 2, -3, -9], [2, 19, 12, -9]]); if (st === 'buns') { fill(H[3]); E(x, X(-16), Y(-30), 7 * s, 6 * s); x.fill(); E(x, X(16), Y(-30), 7 * s, 6 * s); x.fill(); } }
  else bangs([[-19, -9, -17, -8], [-9, 2, -3, -10], [2, 19, 12, -10]]);
  shine();
}
/* ---------- Dread: black-scaled helm, horns, a slit of green ---------- */
function paintDread(x, fill, stroke, expr) {
  const M = rampFromHex('#3a3f48'), K = rampFromHex('#1c1a20');
  fill(K[3]); P(x, [[0, PH], [4, 84, 30, 78], [70, 78], [96, 84, 100, PH]]); x.fill();
  fill(M[3]); E(x, 18, 88, 22, 12, -.2); x.fill(); E(x, 82, 88, 22, 12, .2); x.fill(); fill(M[4]); E(x, 22, 85, 12, 5, -.2); x.fill();
  fill(K[2]); x.fillRect(38, 66, 24, 16);
  // Gravecleaver's hilt and blade rising behind the shoulder
  x.save(); x.translate(78, 70); x.rotate(-1.25);
  fill('#121218'); P(x, [[8, -7], [70, -6], [76, -1], [70, 6], [64, 4], [58, 6], [52, 4], [46, 6], [40, 4], [34, 6], [28, 4], [22, 6], [8, 7]]); x.fill();
  fill('#2a1e18'); x.fillRect(-12, -3, 18, 6); fill('#24242c'); P(x, [[4, -14], [9, -6], [9, 6], [4, 14], [1, 8], [2, 0], [1, -8]]); x.fill();
  fill('#3cff8a'); x.fillRect(12, -1, 50, 2); x.restore();
  // horns
  fill('#2a2622'); P(x, [[34, 34], [20, 18, 14, -2], [26, 14, 40, 28]]); x.fill(); P(x, [[66, 34], [80, 18, 86, -2], [74, 14, 60, 28]]); x.fill();
  fill('#4a443c'); P(x, [[30, 26], [22, 14, 18, 4], [24, 14, 33, 24]]); x.fill();
  // helm
  fill(K[3]); P(x, [[30, 70], [24, 40, 34, 26], [50, 14, 66, 26], [76, 40, 70, 70], [50, 78, 30, 70]]); x.fill();
  fill(K[4]); P(x, [[50, 16], [62, 22, 66, 40], [60, 40], [58, 26, 50, 20]]); x.fill();
  fill(M[2]); x.fillRect(48, 18, 4, 48);
  // the visor slit and the eyes behind it
  fill('#050506'); P(x, [[33, 44], [50, 49], [67, 44], [66, 49], [50, 54], [34, 49]]); x.fill();
  x.save(); x.globalCompositeOperation = 'lighter'; const g = x.createRadialGradient(50, 48, 1, 50, 48, 20); g.addColorStop(0, 'rgba(70,255,140,.55)'); g.addColorStop(1, 'rgba(70,255,140,0)'); x.fillStyle = g; x.fillRect(20, 30, 60, 36); x.restore();
  fill('#7dffb0'); x.fillRect(40, 47, expr === 'anger' ? 7 : 6, 2); x.fillRect(54, 47, expr === 'anger' ? 7 : 6, 2);
  // scale texture
  stroke(K[1]); x.lineWidth = 1; for (let i = 0; i < 6; i++) { x.beginPath(); x.arc(36 + (i % 3) * 14, 60 + Math.floor(i / 3) * 6, 4, 0, Math.PI); x.stroke(); }
}
/* ---------- pixel-art cleanup: hard alpha, snap colours, dark outline ---------- */
function pixelate(c, used) {
  const x = c.getContext('2d'), d = x.getImageData(0, 0, PW, PH), p = d.data;
  const pal = [...used].filter(h => /^#[0-9a-f]{6}$/i.test(h)).map(h2rgb).concat([[255, 255, 255], [251, 251, 246], [10, 10, 14]]);
  for (let i = 0; i < p.length; i += 4) {
    if (p[i + 3] < 110) { p[i + 3] = 0; continue; }
    p[i + 3] = 255;
    let best = null, bd = 1e9; for (const q of pal) { const dd = (q[0] - p[i]) ** 2 + (q[1] - p[i + 1]) ** 2 + (q[2] - p[i + 2]) ** 2; if (dd < bd) { bd = dd; best = q; } }
    if (bd < 2200) { p[i] = best[0]; p[i + 1] = best[1]; p[i + 2] = best[2]; }
  }
  const o = new Uint8ClampedArray(p);
  for (let y = 0; y < PH; y++) for (let X = 0; X < PW; X++) {
    const i = (y * PW + X) * 4; if (p[i + 3]) continue;
    let n = null; for (const [dx, dy] of [[1, 0], [-1, 0], [0, 1], [0, -1]]) { const xx = X + dx, yy = y + dy; if (xx < 0 || yy < 0 || xx >= PW || yy >= PH) continue; const j = (yy * PW + xx) * 4; if (p[j + 3]) { n = j; break; } }
    if (n !== null) { o[i] = p[n] * .28; o[i + 1] = p[n + 1] * .24; o[i + 2] = p[n + 2] * .3; o[i + 3] = 255; }
  }
  d.data.set(o); x.putImageData(d, 0, 0);
}
