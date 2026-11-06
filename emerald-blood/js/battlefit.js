'use strict';
/* BATTLE STAGE FIT — makes the fighters belong to the picture behind them.
   - every backdrop knows where its ground begins; the picture is scaled and placed so that line sits just behind the far row
     of fighters, so nobody stands on a rooftop or floats over a wall
   - the distance (everything above the ground line) is softly out of focus, like a camera lens, so the crisp fighters pop
     and the painted scenery reads as "far away" — the trick HD-2D games use
   - a low haze where the ground meets the distance hides the seam
   - one shared light over the whole frame: the backdrop's own colour is laid softly over fighters and scenery alike,
     plus a gentle vignette, so painted sprites and painted backgrounds look lit by the same sun */
const BTBD = {
  // where the walkable ground starts in each picture (fraction of its height)
  GND: { ashford: .62, field: .64, forest: .62, mill: .70, town: .70, camp: .50, colosseum: .50, crypt: .48, crystal: .50, dusk: .50,
    festival: .52, mire: .47, snow: .50, tourney: .47, warren: .47 },
  HORIZON: .50,   // where on screen the ground line goes (the far row stands at .56)
  cache: new Map(),
  prep(bd, g) {
    let k = this.cache.get(bd); if (k && k.g === g) return k;
    const w = bd.width, h = bd.height;
    // a blurred copy of the distance: shrink then grow back smoothly
    const sm = document.createElement('canvas'); sm.width = Math.max(2, w / 5 | 0); sm.height = Math.max(2, h / 5 | 0);
    const s = sm.getContext('2d'); s.imageSmoothingEnabled = true; s.imageSmoothingQuality = 'high'; s.drawImage(bd, 0, 0, sm.width, sm.height);
    const far = document.createElement('canvas'); far.width = w; far.height = h;
    const f = far.getContext('2d'); f.imageSmoothingEnabled = true; f.imageSmoothingQuality = 'high'; f.drawImage(sm, 0, 0, w, h);
    // keep the blur only above the ground line, fading out just before the fighters' feet
    f.globalCompositeOperation = 'destination-in';
    const gr = f.createLinearGradient(0, 0, 0, h); gr.addColorStop(0, 'rgba(0,0,0,.9)'); gr.addColorStop(Math.max(0, g - .14), 'rgba(0,0,0,.75)'); gr.addColorStop(Math.min(1, g + .03), 'rgba(0,0,0,0)'); gr.addColorStop(1, 'rgba(0,0,0,0)');
    f.fillStyle = gr; f.fillRect(0, 0, w, h);
    // the picture's own light: average colour of the whole image, and of the sky/distance
    const px = document.createElement('canvas'); px.width = px.height = 1; const p = px.getContext('2d'); p.imageSmoothingEnabled = true;
    p.drawImage(sm, 0, 0, 1, 1); let d; try { d = p.getImageData(0, 0, 1, 1).data; } catch (e) { d = [128, 128, 128]; }
    k = { g, far, col: `${d[0]},${d[1]},${d[2]}` }; this.cache.set(bd, k); return k;
  },
  draw(c, B, W, FH) {
    const bd = B.bd; if (!bd) return;
    const g = this.GND[B.bdKey] ?? .6, yg = FH * this.HORIZON, bw = bd.width, bh = bd.height;
    // big enough to cover the screen AND to put the ground line at yg with picture left above and below it
    let sc = Math.max(W / bw, FH / bh, (FH - yg) / ((1 - g) * bh));
    let by = yg - g * bh * sc; by = Math.min(0, Math.max(FH - bh * sc, by));
    const dw = bw * sc, dh = bh * sc, bx = (W - dw) / 2;
    c.drawImage(bd, bx, by, dw, dh);
    if (G.settings && G.settings.noLens) return;
    const k = this.prep(bd, g);
    c.save(); c.imageSmoothingEnabled = true; c.drawImage(k.far, bx, by, dw, dh); c.restore();
    // haze where the ground meets the distance
    const gy = by + g * dh, hz = c.createLinearGradient(0, gy - FH * .12, 0, gy + FH * .07);
    hz.addColorStop(0, `rgba(${k.col},0)`); hz.addColorStop(.6, `rgba(${k.col},.22)`); hz.addColorStop(1, `rgba(${k.col},0)`);
    c.fillStyle = hz; c.fillRect(0, gy - FH * .12, W, FH * .19);
  },
  grade(c, B, W, FH) {
    if (!B.bd || (G.settings && G.settings.noLens)) return;
    const k = this.prep(B.bd, this.GND[B.bdKey] ?? .6);
    c.save();
    c.globalCompositeOperation = 'soft-light'; c.fillStyle = `rgba(${k.col},.32)`; c.fillRect(-20, -20, W + 40, FH + 40);
    c.globalCompositeOperation = 'source-over';
    const v = c.createRadialGradient(W / 2, FH * .62, Math.min(W, FH) * .45, W / 2, FH * .62, Math.max(W, FH) * .72);
    v.addColorStop(0, 'rgba(0,0,0,0)'); v.addColorStop(1, 'rgba(0,0,0,.32)'); c.fillStyle = v; c.fillRect(-20, -20, W + 40, FH + 40);
    c.restore();
  }
};
