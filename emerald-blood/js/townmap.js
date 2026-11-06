'use strict';
/* TOWN MAP — a little "you are here" map in the corner whenever you're in Ashford or Highmark.
   Every area is a box in the direction you walk to reach it, the one you're in glows. Tap it to see what's in each area. */
const TOWNS_MAP = {
  ashford: { name: 'Ashford Hollow', cells: {
    a_chapel: [1, 0, 'Chapel Hill', 'North Gate → Old Mill · Maren\'s clinic · chapel · crypt'],
    a_river: [0, 1, 'Riverside', 'Crooked Kettle inn · bridge → Millbrook / Kettlebrook'],
    ashford: [1, 1, 'Market', 'Tobb\'s store · blacksmith · fountain · Guild coach'],
    a_terrace: [2, 1, 'Guild Terrace', 'Adventurers\' Guild · training yard · road → East Woods'],
    a_lower: [1, 2, 'Lower Ashford', 'Midnight Exchange · slums · sewer grate'] } },
  highmark: { name: 'Highmark', cells: {
    hm_guild: [0, 1, 'Guild Quarter', 'Guild Headquarters · quest board · ↓ Gloamwood'],
    hm_plaza: [1, 1, 'Gate Plaza', 'The Gate · the Platform'],
    hm_ward: [2, 1, 'Whisper Ward', 'Midnight Exchange Grand House'],
    hm_gate: [1, 2, 'Crown Road Gate', 'Carriage to Ashford · market · stables'],
    hm_lantern: [2, 2, 'Lantern Row', 'Wayfarer\'s Hearth inn · smithy'],
    gloam: [0, 2, 'Gloamwood', 'Monster forest · contracts'] } }
};
const TownMap = {
  town(m) { for (const k in TOWNS_MAP) if (TOWNS_MAP[k].cells[m]) return k; return null; },
  el: null, big: false,
  render() {
    const m = G.S && G.S.map, t = G.mode === 'world' && !G.S.kid ? this.town(m) : null;
    if (!this.el) {
      const st = document.createElement('style');
      st.textContent = `#tmap{position:fixed;z-index:30;left:max(10px,env(safe-area-inset-left));top:calc(max(8px,env(safe-area-inset-top)) + 96px);padding:5px;border-radius:12px;background:rgba(8,16,12,.62);border:1px solid rgba(255,255,255,.16);font-family:Nunito,system-ui;-webkit-user-select:none;user-select:none}
      #tmap.hide{display:none}#tmap .g{display:grid;grid-template-columns:repeat(3,20px);grid-template-rows:repeat(3,14px);gap:3px}
      #tmap .c{border-radius:4px;background:rgba(255,255,255,.14)}#tmap .c.on{background:#46ff95;box-shadow:0 0 8px #46ff95}
      #tmap b{display:block;font:800 9px Nunito;color:#cfe3d6;text-align:center;margin-top:3px}
      #tmap.big{padding:10px}#tmap.big .g{grid-template-columns:repeat(3,112px);grid-template-rows:repeat(3,58px);gap:6px}
      #tmap.big .c{padding:4px 6px;font:800 11px/1.15 Nunito;color:#fff}#tmap.big .c small{display:block;font:600 9.5px/1.2 Nunito;color:#cfe3d6;margin-top:2px}#tmap.big .c.on small{color:#062}#tmap.big .c.on{color:#031}
      #tmap.big b{font-size:12px}`;
      document.head.append(st);
      this.el = document.createElement('div'); this.el.id = 'tmap'; document.body.append(this.el);
      this.el.addEventListener('pointerdown', e => { e.preventDefault(); e.stopPropagation(); this.big = !this.big; try { sfx('blip'); } catch (x) { } this.key = ''; this.render(); });
    }
    const key = t + '|' + m + '|' + this.big;
    if (!t) { this.el.classList.add('hide'); this.key = ''; return; }
    this.el.classList.remove('hide');
    if (key === this.key) return; this.key = key;
    const T = TOWNS_MAP[t], grid = Array(9).fill('<i></i>');
    for (const [id, [x, y, nm, info]] of Object.entries(T.cells))
      grid[y * 3 + x] = `<div class="c ${id === m ? 'on' : ''}">${this.big ? `${nm}<small>${info}</small>` : ''}</div>`;
    this.el.className = this.big ? 'big' : '';
    this.el.innerHTML = `<div class="g">${grid.join('')}</div><b>${this.big ? T.name + ' — walk off an edge toward an area to go there · tap to close' : T.cells[m][2]}</b>`;
  }
};
setInterval(() => { try { TownMap.render(); } catch (e) { } }, 300);
