'use strict';
/* WARDROBE (Chat C) — outfits and dyes for Ren, the Red Veil and the party heroes.
   · Outfit: any extra HD set named  <base>_o_<id>  or  c_<hero>_o_<id>  in hd.json shows up here by itself
     (cut a new outfit sheet with pool_cut.py using the key  <hero>_o_<id>,  e.g. ren_o_ronin → c_ren_o_ronin).
     Optional set fields: label:'Ronin Coat', unlock:'<G.S.f flag>' (hidden until that story flag is set).
   · Main dye: recolours the dark cloth of the outfit.  Accent dye: shifts the coloured trim (scarf, sash, ribbons).
   · Saved in G.S.wear = { heroId: { o: setName|'', d: mainDye|'', a: accentDye|'' } }.
   Works by wrapping HD.playerSet / HD.battleSet / HD.setOf; the dyed atlases are built once, on first use. */
const Wardrobe = {
  HEROES: {
    me: { name: 'Ren', base: 'ren' },
    veil: { name: 'The Red Veil', base: 'veil', accentOnly: 0 },
    kess: { name: 'Kess', base: 'c_kess' }, liora: { name: 'Liora', base: 'c_liora' }, oren: { name: 'Oren', base: 'c_oren' },
    dace: { name: 'Dace', base: 'c_dace' }, tamsin: { name: 'Tamsin', base: 'c_tamsin' }
  },
  MAIN: { '': ['Original', null], crimson: ['Crimson', [150, 30, 30]], navy: ['Navy', [40, 70, 150]], forest: ['Forest', [40, 100, 60]],
    ivory: ['Ivory', [230, 225, 215]], plum: ['Plum', [100, 50, 120]], ash: ['Ash', [125, 125, 130]], gold: ['Gold', [170, 130, 50]], teal: ['Teal', [30, 110, 115]] },
  ACCENT: { '': ['Original', null], crimson: ['Crimson', 355], violet: ['Violet', 275], azure: ['Azure', 210], gold: ['Gold', 45], jade: ['Jade', 160], white: ['White', -1] },
  st() { const S = G.S; if (!S) return {}; if (!S.wear) S.wear = {}; return S.wear; },
  of(id) { return this.st()[id] || {}; },
  heroOfSet(set) { for (const id in this.HEROES) if (this.HEROES[id].base === set) return id; return null; },
  outfits(id) {
    const H = this.HEROES[id], M = HD.meta || {}, f = (G.S && G.S.f) || {}, bare = H.base.replace(/^c_/, ''), key = id === 'me' ? 'ren' : bare;
    return Object.keys(M).filter(k => M[k] && M[k].img && (k.startsWith(H.base + '_o_') || k.startsWith('c_' + key + '_o_')) && (!M[k].unlock || f[M[k].unlock]))
      .map(k => [k, M[k].label || k.split('_o_')[1].replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase())]);
  },
  /* the set this hero should draw with right now ('' / missing pieces fall back to the original) */
  resolve(id, set) {
    const w = this.of(id); if (!HD.meta) return set;
    if (w.o && HD.meta[w.o] && HD.img[w.o]) set = w.o;
    if (!w.d && !w.a) return set;
    const key = `${set}~${w.d || ''}~${w.a || ''}`;
    if (HD.img[key]) return key;
    const src = HD.img[set]; if (!src || !src.width) return set;
    try { HD.img[key] = this.dye(src, this.MAIN[w.d] && this.MAIN[w.d][1], this.ACCENT[w.a] ? this.ACCENT[w.a][1] : null); HD.meta[key] = HD.meta[set]; return key; }
    catch (e) { return set; }
  },
  dye(img, rgb, hue) {
    const c = document.createElement('canvas'); c.width = img.width; c.height = img.height; const x = c.getContext('2d');
    x.drawImage(img, 0, 0); const D = x.getImageData(0, 0, c.width, c.height), p = D.data;
    for (let i = 0; i < p.length; i += 4) {
      if (p[i + 3] < 128) continue;
      const r = p[i] / 255, g = p[i + 1] / 255, b = p[i + 2] / 255, mx = Math.max(r, g, b), mn = Math.min(r, g, b), s = mx ? (mx - mn) / mx : 0;
      if (rgb && s < .25 && mx > .09 && mx < .5) {   // dark, grey-ish cloth
        const t = Math.min(1, Math.max(0, (.3 * r + .59 * g + .11 * b - .05) / .45));
        for (let k = 0; k < 3; k++) { const cc = rgb[k] / 255, n = t < .5 ? cc * t * 2 : cc + (1 - cc) * (t - .5) * 2; p[i + k] = 255 * (n * .85 + [r, g, b][k] * .15); }
        continue;
      }
      if (hue !== null && hue !== undefined && s > .3 && mx > .15) {   // coloured trim in the red–violet range (scarves, sashes, ribbons); skin & green eyes untouched
        const d = mx - mn; let h = mx === r ? ((g - b) / d) % 6 : mx === g ? (b - r) / d + 2 : (r - g) / d + 4; h = (h * 60 + 360) % 360;
        if (h < 250 && !(h < 12 && s > .5)) continue;
        let nh = hue, ns = s, nv = mx; if (hue < 0) { ns = s * .08; nv = Math.min(1, mx * 1.35 + .1); nh = 0; }
        const C = nv * ns, X = C * (1 - Math.abs((nh / 60) % 2 - 1)), m = nv - C, seg = Math.floor(nh / 60) % 6;
        const [R, G2, B2] = [[C, X, 0], [X, C, 0], [0, C, X], [0, X, C], [X, 0, C], [C, 0, X]][seg];
        p[i] = (R + m) * 255; p[i + 1] = (G2 + m) * 255; p[i + 2] = (B2 + m) * 255;
      }
    }
    x.putImageData(D, 0, 0); return c;
  },
  set(id, k, v) { const W = this.st(); W[id] = Object.assign({}, W[id], { [k]: v }); if (typeof save === 'function') save(); },
  /* one idle frame as a preview */
  thumb(id) {
    const H = this.HEROES[id], set = this.resolve(id, H.base), im = HD.img[set], M = HD.meta && HD.meta[set]; if (!im || !M) return '';
    const a = M.anims.ow_down || M.anims.combat || M.anims.walk || M.anims.idle || [0], fr = M.frames[a[0]]; if (!fr) return '';
    const c = document.createElement('canvas'), sc = 96 / fr[3]; c.width = Math.round(fr[2] * sc); c.height = 96; const x = c.getContext('2d');
    x.imageSmoothingEnabled = false; x.drawImage(im, fr[0], fr[1], fr[2], fr[3], 0, 0, c.width, c.height);
    try { return c.toDataURL(); } catch (e) { return ''; }
  },
  who() {
    const S = G.S; if (!S) return []; const L = ['me'];
    if (typeof Veil !== 'undefined' && Veil.got && Veil.got()) L.push('veil');
    for (const id of S.party || []) if (this.HEROES[id] && !L.includes(id)) L.push(id);
    return L.filter(id => HD.meta && HD.meta[this.HEROES[id].base]);
  },
  html() {
    if (!HD.on()) return '<div class="stat"><h3>👘 Wardrobe</h3><p class="muted">Turn off Classic sprites in Settings to dress your party.</p></div>';
    const sw = (id, k, list, cur) => Object.entries(list).map(([key, [nm, col]]) => {
      const bg = key === '' ? 'transparent' : k === 'd' ? `rgb(${col.join(',')})` : col < 0 ? '#f4f4f0' : `hsl(${col},70%,45%)`;
      return `<button class="wd-sw${(cur || '') === key ? ' on' : ''}" data-wid="${id}" data-wk="${k}" data-wv="${key}" title="${nm}" style="background:${bg}">${key === '' ? '✕' : ''}</button>`;
    }).join('');
    return `<div class="stat wd"><h3>👘 Wardrobe</h3><p class="muted">Outfits and colours. New outfits appear here as they're made.</p>${this.who().map(id => {
      const H = this.HEROES[id], w = this.of(id), outs = this.outfits(id), t = this.thumb(id);
      return `<div class="wd-row"><div class="wd-pic">${t ? `<img src="${t}" alt="">` : ''}</div><div class="wd-opts"><b>${H.name}</b>
        ${outs.length ? `<div class="wd-l">Outfit</div><div>${[['', 'Original'], ...outs].map(([k, nm]) => `<button class="wd-o${(w.o || '') === k ? ' on' : ''}" data-wid="${id}" data-wk="o" data-wv="${k}">${nm}</button>`).join('')}</div>` : ''}
        ${H.accentOnly ? '' : `<div class="wd-l">Main colour</div><div>${sw(id, 'd', this.MAIN, w.d)}</div>`}
        <div class="wd-l">Accent colour</div><div>${sw(id, 'a', this.ACCENT, w.a)}</div></div></div>`;
    }).join('')}</div>`;
  },
  css() {
    if (document.getElementById('wdCss')) return; const s = document.createElement('style'); s.id = 'wdCss';
    s.textContent = `.wd-row{display:flex;gap:10px;align-items:flex-start;padding:8px 0;border-top:1px solid rgba(255,255,255,.08)}
.wd-pic{width:64px;min-width:64px;height:96px;display:flex;align-items:flex-end;justify-content:center;background:rgba(0,0,0,.25);border-radius:8px}
.wd-pic img{image-rendering:pixelated;max-width:64px;max-height:96px}.wd-opts{flex:1}.wd-l{font-size:11px;opacity:.65;margin:6px 0 3px}
.wd-sw{width:26px;height:26px;border-radius:50%;border:2px solid rgba(255,255,255,.25);margin:0 5px 5px 0;padding:0;color:#ddd;font-size:11px;min-width:0}
.wd-sw.on{border-color:#9dffc8;box-shadow:0 0 0 2px #9dffc8}.wd-o{margin:0 5px 5px 0;padding:4px 9px;font-size:12px}.wd-o.on{outline:2px solid #9dffc8}`;
    document.head.appendChild(s);
  },
  hook() {
    if (this.hooked || typeof HD === 'undefined' || typeof UI === 'undefined') return; this.hooked = 1; this.css();
    const W = this, pS = HD.playerSet.bind(HD), bS = HD.battleSet.bind(HD), sO = HD.setOf.bind(HD);
    HD.playerSet = function () { const s = pS(); return s === 'ren' ? W.resolve('me', s) : s === 'veil' ? W.resolve('veil', s) : s; };
    HD.battleSet = function () { const s = bS(); return s === 'ren' ? W.resolve('me', s) : s === 'veil' ? W.resolve('veil', s) : s; };
    HD.setOf = function (name, key) { const s = sO(name, key), id = s && W.heroOfSet(s); return id && id !== 'me' ? W.resolve(id, s) : s; };
    /* the Wardrobe lives at the bottom of the Party tab */
    const rM = UI.renderMenu.bind(UI);
    UI.renderMenu = function () {
      rM(); if (UI.menuTab !== 'party') return; const b = document.querySelector('#menuCard .mbody'); if (!b) return;
      b.insertAdjacentHTML('beforeend', W.html());
      b.querySelectorAll('[data-wid]').forEach(el => el.onclick = () => { W.set(el.dataset.wid, el.dataset.wk, el.dataset.wv); UI.renderMenu(); });
    };
  }
};
if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', () => Wardrobe.hook()); else Wardrobe.hook();
