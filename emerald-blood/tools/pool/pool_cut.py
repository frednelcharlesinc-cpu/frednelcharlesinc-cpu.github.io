"""Animation pool cutter.
usage: python3 pool_cut.py <sheet.jpg> <key> <life|battle> [--left] [--h=260]
Cuts a standard Life or Battle sheet (see spec.py / *_template.png), stores the frames under src/<key>/<kind>/,
then rebuilds out/assets/hd/c_<key>.png|webp and its entry in hd.json from every sheet that character has.
  --left : the sheet's side views face LEFT (they get mirrored to face right)
"""
import sys, os, json, numpy as np
from PIL import Image
from scipy import ndimage as nd
from spec import LIFE, BATTLE
HERE = os.path.dirname(os.path.abspath(__file__)); OUT = os.path.join(HERE, '..', 'out', 'assets', 'hd')
SP = '/tmp/claude-0/-home-claude/7a5a8c55-a33b-57be-9427-8927ce3db7fc/scratchpad/'

def runs(v, minlen=1):
    out, s = [], None
    for i, x in enumerate(list(v) + [False]):
        if x and s is None: s = i
        if not x and s is not None:
            if i - s >= minlen: out.append([s, i])
            s = None
    return out

def cut_sheet(path, kind, left=False):
    spec = LIFE if kind == 'life' else BATTLE
    rgb = np.array(Image.open(path).convert('RGB')).astype(float); H, W = rgb.shape[:2]
    border = np.concatenate([rgb[:4].reshape(-1, 3), rgb[-4:].reshape(-1, 3), rgb[:, :4].reshape(-1, 3), rgb[:, -4:].reshape(-1, 3)])
    bg = np.median(border, 0); dist = np.sqrt(((rgb - bg) ** 2).sum(-1)); mask = dist > 48
    # template guide lines are pale grey: ignore anything faint and colourless
    # the template's pale guide boxes / ground lines, and its small grey tags
    sat = rgb.max(-1) - rgb.min(-1); mean = rgb.mean(-1)
    mask &= ~((sat < 14) & (mean > 178))
    lab0, k0 = nd.label(mask)
    for i, sl in enumerate(nd.find_objects(lab0)):
        h, w = sl[0].stop - sl[0].start, sl[1].stop - sl[1].start
        if h < 24 and w < 160:
            reg = lab0[sl] == i + 1
            if (sat[sl][reg] < 14).mean() > .85 and 115 < mean[sl][reg].mean() < 185: mask[sl] &= ~reg
    # 1. rows
    body = mask[:, int(W * .14):]; prof = nd.uniform_filter1d(body.sum(1).astype(float), 5)
    ys = np.where(prof > 1)[0]; top, bot = (int(ys.min()), int(ys.max()) + 1) if len(ys) else (0, H)
    n = len(spec); step = (bot - top) / n; cuts = [top]
    for k in range(1, n):   # cut between rows at the emptiest line near where the layout says the gap is
        c0 = top + k * step; lo, hi = int(c0 - step * .38), int(c0 + step * .38)
        cuts.append(lo + int(np.argmin(prof[lo:hi])))
    cuts.append(bot); rows = []
    for k in range(n):
        a, b = cuts[k], cuts[k + 1]; yy = np.where(prof[a:b] > 1)[0]
        rows.append((a + int(yy.min()), a + int(yy.max()) + 1) if len(yy) else (a, b))
    frames = []
    for (y0, y1), (label, groups) in zip(rows, spec):
        n = sum(c for _, c in groups); band = mask[y0:y1]
        lab, k = nd.label(nd.binary_dilation(band, iterations=3))
        objs = nd.find_objects(lab); bh = y1 - y0
        keep = np.zeros_like(band)
        for i, sl in enumerate(objs):
            h = sl[0].stop - sl[0].start
            w = sl[1].stop - sl[1].start
            if h < bh * .42 and not (w > bh * .55 and h > bh * .18 and (sl[1].start + sl[1].stop) / 2 > W * .14): continue   # labels, sparks, dust (but keep a body lying flat)
            reg = lab[sl] == i + 1; fill = (band[sl] & reg).sum() / max(1, reg.sum())
            cxm = (sl[1].start + sl[1].stop) / 2
            if cxm < W * .12 or (sl[1].stop < W * .17 and (h < bh * .7 or fill < .3)): continue   # the label gutter
            keep |= (lab == i + 1) & band
        cols = runs(nd.binary_dilation(keep, iterations=3).any(0), 6)
        ws = sorted(c[1] - c[0] for c in cols) or [1]; med = ws[len(ws) // 2]
        single = len(groups) == 1
        if single:   # one animation in the row: keep every frame the artist drew (split any two that touch)
            for _ in range(4):
                ws = sorted(c[1] - c[0] for c in cols) or [1]; med = ws[len(ws) // 4]; done = True
                for i, (a, b) in enumerate(cols):
                    if b - a > med * 1.8 and len(cols) > 1:
                        dens = keep[:, a:b].sum(0); lo, hi = int((b - a) * .3), int((b - a) * .7); m = a + lo + int(np.argmin(dens[lo:hi]))
                        cols[i:i + 1] = [[a, m], [m, b]]; done = False; break
                if done: break
            n = max(1, len(cols))
        while len(cols) > n:   # too many: merge the closest pair, or drop the thinnest
            gaps = [(cols[i + 1][0] - cols[i][1], i) for i in range(len(cols) - 1)]
            g, i = min(gaps)
            if cols[i + 1][1] - cols[i][0] <= med * 1.7: cols[i:i + 2] = [[cols[i][0], cols[i + 1][1]]]
            else: cols.pop(min(range(len(cols)), key=lambda j: cols[j][1] - cols[j][0]))
        while len(cols) < n:   # too few: split the widest at its emptiest column
            i = max(range(len(cols)), key=lambda j: cols[j][1] - cols[j][0]); a, b = cols[i]
            dens = keep[:, a:b].sum(0); lo, hi = int((b - a) * .3), int((b - a) * .7)
            m = a + lo + int(np.argmin(dens[lo:hi])) if hi > lo else (a + b) // 2
            cols[i:i + 1] = [[a, m], [m, b]]
        if len(cols) == sum(c for _, c in groups) or single: names = [nm for nm, c in groups for _ in range(c)] if not single else [groups[0][0]] * len(cols)
        else:   # a different number of frames than the layout: share them out in proportion
            tot = sum(c for _, c in groups); names = []
            for gi, (nm, c) in enumerate(groups):
                k = round(len(cols) * c / tot) if gi < len(groups) - 1 else len(cols) - len(names)
                names += [nm] * max(1, k)
            names = names[:len(cols)]
        for (x0, x1), nm in zip(cols, names):
            sub = keep[:, x0:x1]; ys = np.where(sub.any(1))[0]
            ya, yb = y0 + max(0, ys.min() - 2), y0 + min(bh, ys.max() + 3)
            c = rgb[ya:yb, x0:x1]; d = dist[ya:yb, x0:x1]; al = np.clip((d - 30) / 40, 0, 1)
            m = al > .3
            m = al > .3; l2, k2 = nd.label(nd.binary_dilation(m, iterations=2))
            if k2: sz = nd.sum(m, l2, range(1, k2 + 1)); big = sz.max(); al *= np.isin(l2, [j + 1 for j, s in enumerate(sz) if s >= big * (.04 if kind == 'battle' else .12)])
            out = np.clip((c - bg * (1 - al[..., None])) / np.maximum(al[..., None], .3), 0, 255)
            im = Image.fromarray(np.dstack([out, al * 255]).astype(np.uint8)); bb = im.getbbox()
            if not bb: continue
            im = im.crop(bb)
            if left and (kind == 'battle' or nm == 'walk_side'): im = im.transpose(Image.FLIP_LEFT_RIGHT)
            frames.append((nm, im))
    return frames

def anchor(im, torso=False):
    a = np.array(im)[..., 3] > 100; H, W = a.shape; rows = np.where(a.sum(1) >= 3)[0]; feet = rows.max() + 1 if len(rows) else H
    band = a[int(H * .15):int(H * .5)] if torso else a[max(0, int(feet - H * .55)):max(1, int(feet - H * .08))]
    xs = np.where(band)[1]; return (float(np.median(xs)) if len(xs) else W / 2), float(feet)

PEXPR = {'em_talk': 'neutral', 'em_nod': 'closed', 'em_laugh': 'happy', 'em_angry': 'anger', 'em_sad': 'sad', 'em_shock': 'shock'}
def portraits(key, bust):
    # waist-up emotes become the character's dialogue portraits — only if they don't have painted ones yet
    PD = os.path.join(HERE, '..', 'out', 'assets', 'portraits'); AJ = os.path.join(HERE, '..', 'out', 'assets', 'art.json')
    em = {PEXPR[n]: im for n, im in bust.items() if n in PEXPR}
    if not em: return
    art = json.load(open(AJ)); P = art.setdefault('portraits', {})
    mine = art.setdefault('poolPortraits', [])
    if key in P and key not in mine and '--portraits' not in sys.argv: print('  (has painted portraits — emotes not used as portraits)'); return
    for e, im in em.items():
        w, h = im.size; sc = min(420 / w, 470 / h); im2 = im.resize((round(w * sc), round(h * sc)), Image.LANCZOS)
        can = Image.new('RGBA', (444, 480)); can.alpha_composite(im2, ((444 - im2.size[0]) // 2, 480 - im2.size[1]))
        can.save(os.path.join(PD, f'{key}_{e}.png'), optimize=True); can.save(os.path.join(PD, f'{key}_{e}.webp'), quality=88)
    P[key] = sorted(em); mine.append(key) if key not in mine else None; art['v'] = art.get('v', 1) + 1; json.dump(art, open(AJ, 'w'))
    print('  portraits from emotes:', ', '.join(sorted(em)))
def build(key):
    root = os.path.join(HERE, 'src', key); kinds = [k for k in ('life', 'battle') if os.path.isdir(os.path.join(root, k))]
    allf = []; idx = {}
    for kind in kinds:
        man = json.load(open(os.path.join(root, kind, 'frames.json')))
        for nm, fn in man:
            allf.append((kind, nm, Image.open(os.path.join(root, kind, fn))))
    # one resolution for the whole set: the reference frame of each kind is scaled to H
    HT = 260
    refimg = {k: next((im for kk, nm, im in allf if kk == k and nm == ('idle' if k == 'life' else 'combat')), None) for k in kinds}
    x = y = rh = 0; AW = 2048; items = []; frames = []
    for kind, nm, im in allf:
        r = refimg[kind] or im; s = HT / r.height; im = im.resize((max(1, round(im.width * s)), max(1, round(im.height * s))), Image.LANCZOS)
        if x + im.width > AW: x = 0; y += rh + 2; rh = 0
        ax, ay = anchor(im, torso=(kind == 'battle' and nm in ('light', 'heavy', 'special', 'parry', 'guard')))
        items.append((im, x, y)); frames.append([x, y, im.width, im.height, round(ax, 1), round(ay, 1), float(HT - 2)])
        idx.setdefault(kind + ':' + nm, []).append(len(frames) - 1); x += im.width + 2; rh = max(rh, im.height)
    sheet = Image.new('RGBA', (AW, y + rh + 2))
    for im, xx, yy in items: sheet.alpha_composite(im, (xx, yy))
    sheet.save(os.path.join(OUT, 'c_%s.png' % key), optimize=True); sheet.save(os.path.join(OUT, 'c_%s.webp' % key), quality=90, alpha_quality=100, method=6)
    g = lambda n, k=None: idx.get((k or ('life' if n in ('idle', 'walk_down', 'walk_up', 'walk_side', 'work') or n.startswith(('em_', 'g_')) else 'battle')) + ':' + n, [])
    L = lambda n: g(n, 'life'); Bt = lambda n: g(n, 'battle')
    C = Bt('combat') or L('walk_side')[:1] or L('idle')[:1]
    light, heavy, spec = Bt('light') or C, Bt('heavy') or Bt('light') or C, Bt('special') or Bt('heavy') or C
    A = dict(
        # battle
        combat=C[:1], idle=C, walk=C, run=C, draw=C[:1], fist=light[:2], guard=Bt('guard') or C[:1], victory=Bt('victory') or C[:1],
        slash=light, halfslash=light[2:] or light, backslash=light, cmb1=light[:2], cmb2=light[2:] or light, cmb3=heavy, cmb4=heavy[2:] or heavy, cmb5=spec, cmb6=spec,
        thrust=heavy, thr=heavy, spellcast=spec, special=spec, parry=Bt('parry') or Bt('guard') or C[:1], dodge=Bt('dodge') or C[:1],
        hurt=Bt('hurt') or C[:1], ko=Bt('ko') or Bt('hurt') or C[:1], jump=Bt('dodge') or C[:1], land=C[:1])
    for k in ('pp1', 'pp2', 'pp3', 'ppfin'): A[k] = A['parry']
    for k in ('pdodge', 'pd1', 'pd2', 'pd3', 'pd4'): A[k] = A['dodge']
    # world
    idl = L('idle') or C[:1]; side = L('walk_side') or C
    A.update(ow_down=idl[:1], ow_idle=idl, ow_down_walk=L('walk_down') or side, ow_up=(L('walk_up') or idl)[:1], ow_up_walk=L('walk_up') or L('walk_down') or side,
             ow_side=side[:1], ow_side_walk=side, work=L('work'))
    for n in ('em_talk', 'em_nod', 'em_laugh', 'em_angry', 'em_sad', 'em_shock', 'g_point', 'g_wave', 'g_bow', 'g_cross', 'g_kneel', 'g_sit'):
        if L(n): A[n] = L(n)
    life_h = next((im.height for kk, nm, im in allf if kk == 'life' and nm == 'idle'), None)
    bust = {}
    if life_h:
        for kk, nm, im in allf:
            if kk == 'life' and (nm.startswith('em_') or nm in ('g_point', 'g_wave', 'g_cross', 'g_bow', 'work')) and im.height < life_h * .74: bust.setdefault(nm, im)
        for nm in bust: A.pop(nm, None)
        if 'work' in bust: print('  work loop is waist-up — kept out of the world')
    portraits(key, bust)
    A = {k: v for k, v in A.items() if v}
    meta = json.load(open(os.path.join(OUT, 'hd.json')))
    meta['c_' + key] = dict(img='c_%s.png' % key, faces='right', frames=frames, anims=A, pool=kinds)
    meta['v'] = meta.get('v', 20) + 1; open(os.path.join(OUT, 'hd.json'), 'w').write(json.dumps(meta, separators=(',', ':')))
    pv = Image.new('RGBA', sheet.size, (40, 60, 50, 255)); pv.alpha_composite(sheet)
    pv.convert('RGB').resize((sheet.width // 2, max(1, sheet.height // 2))).save(SP + 'pool_%s.png' % key)
    print('built c_%s: %d frames from %s' % (key, len(frames), '+'.join(kinds)))

if __name__ == '__main__':
    path, key, kind = sys.argv[1], sys.argv[2], sys.argv[3]
    left = '--left' in sys.argv
    fr = cut_sheet(path, kind, left)
    d = os.path.join(HERE, 'src', key, kind); os.makedirs(d, exist_ok=True)
    for f in os.listdir(d): os.remove(os.path.join(d, f))
    man = []
    for i, (nm, im) in enumerate(fr): fn = '%02d_%s.png' % (i, nm); im.save(os.path.join(d, fn)); man.append([nm, fn])
    json.dump(man, open(os.path.join(d, 'frames.json'), 'w'))
    want = sum(c for _, g in (LIFE if kind == 'life' else BATTLE) for _, c in g)
    print('%s %s: cut %d/%d frames' % (key, kind, len(fr), want))
    build(key)
