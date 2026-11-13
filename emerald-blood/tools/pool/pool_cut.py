"""Animation pool cutter.
usage: python3 pool_cut.py <sheet.jpg> <key> <life|battle|battle12|monster12|battle7|monster7|move7> [--left] [--h=260]
  battle12 / monster12 : the 12 rows x 12 frames sheets (spec.py BATTLE12 / MONSTER12)
Cuts a standard Life or Battle sheet (see spec.py / *_template.png), stores the frames under src/<key>/<kind>/,
then rebuilds out/assets/hd/c_<key>.png|webp and its entry in hd.json from every sheet that character has.
  --left : the sheet's side views face LEFT (they get mirrored to face right)
"""
import sys, os, json, numpy as np
from PIL import Image
from scipy import ndimage as nd
from spec import LIFE, BATTLE, BATTLE12, MONSTER12, BATTLE7, MONSTER7, MOVE7
SPECS = {'life': LIFE, 'battle': BATTLE, 'battle12': BATTLE12, 'monster12': MONSTER12, 'battle7': BATTLE7, 'monster7': MONSTER7, 'move7': MOVE7}
HERE = os.path.dirname(os.path.abspath(__file__))
# works in eb-build/pool (writes to eb-build/out) and in the repo copy tools/pool (writes to the game's own assets)
GAME = os.path.join(HERE, '..', 'out') if os.path.isdir(os.path.join(HERE, '..', 'out', 'assets')) else os.path.join(HERE, '..', '..')
OUT = os.path.join(GAME, 'assets', 'hd')
SP = os.environ.get('POOL_SCRATCH', '/tmp/')

def runs(v, minlen=1):
    out, s = [], None
    for i, x in enumerate(list(v) + [False]):
        if x and s is None: s = i
        if not x and s is not None:
            if i - s >= minlen: out.append([s, i])
            s = None
    return out

def cut_sheet(path, kind, left=False):
    spec = SPECS[kind]
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
    # ground lines the artist drew under each row: long, thin, horizontal — erase them (feet stay)
    for y in range(3, H - 3):
        rr = runs(mask[y], int(W * .3))
        for x0, x1 in rr:
            thin = ~mask[y - 3, x0:x1] & ~mask[y + 3, x0:x1]
            for dy in (-2, -1, 0, 1, 2): mask[y + dy, x0:x1] &= ~thin
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
            if h < bh * .42 and not (any(g[0] == 'ko' for g in groups) and w > bh * .55 and h > bh * .18 and (sl[1].start + sl[1].stop) / 2 > W * .14): continue   # labels, sparks, dust (but keep a body lying flat)
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
            hs = [np.where(keep[:, a:b].any(1))[0] for a, b in cols]; hh = [(h.max() - h.min()) if len(h) else 0 for h in hs]
            if hh and len(cols) > 2: cols = [c for c, h in zip(cols, hh) if h >= max(hh) * .5]   # a lone spark or dust cloud isn't a frame
            n = max(1, len(cols))
        if kind in ('battle12', 'monster12', 'battle7', 'monster7', 'move7') and not single: n = max(len(cols), len(groups))   # 12x12: keep every frame the artist drew
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
        gapsplit = None
        if not single and len(cols) > len(groups):   # the artist left a wider gap between moves: split there, whatever the frame counts
            gl = sorted(((cols[i + 1][0] - cols[i][1], i) for i in range(len(cols) - 1)), reverse=True)
            mg = sorted(g for g, _ in gl)[len(gl) // 2]
            big = sorted(i for g, i in gl[:len(groups) - 1])
            if len(big) == len(groups) - 1 and all(g > max(mg * 2.2, mg + 8) for g, _ in gl[:len(groups) - 1]):
                gapsplit = []; edges = [-1] + big + [len(cols) - 1]
                for gi, (nm, c) in enumerate(groups): gapsplit += [nm] * (edges[gi + 1] - edges[gi])
        if gapsplit: names = gapsplit
        elif len(cols) == sum(c for _, c in groups) or single: names = [nm for nm, c in groups for _ in range(c)] if not single else [groups[0][0]] * len(cols)
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
            al *= nd.binary_dilation(mask[ya:yb, x0:x1], iterations=2)   # stay inside what survived the clean-up
            m = al > .3
            m = al > .3; l2, k2 = nd.label(nd.binary_dilation(m, iterations=2))
            if k2: sz = nd.sum(m, l2, range(1, k2 + 1)); big = sz.max(); al *= np.isin(l2, [j + 1 for j, s in enumerate(sz) if s >= big * (.04 if kind != 'life' else .12)])
            out = np.clip((c - bg * (1 - al[..., None])) / np.maximum(al[..., None], .3), 0, 255)
            im = Image.fromarray(np.dstack([out, al * 255]).astype(np.uint8)); bb = im.getbbox()
            if not bb: continue
            im = im.crop(bb)
            if left and (kind not in ('life', 'move7') or nm in ('walk_side', 'run_side', 'idle_side')): im = im.transpose(Image.FLIP_LEFT_RIGHT)
            frames.append((nm, im))
    return frames

TORSO = ('light', 'heavy', 'special', 'parry', 'guard', 'cmbA', 'cmbB', 'thrust', 'pparry', 'combo', 'lunge', 'roar', 'taunt', 'opener')
def anchor(im, torso=False):
    a = np.array(im)[..., 3] > 100; H, W = a.shape; rows = np.where(a.sum(1) >= 3)[0]; feet = rows.max() + 1 if len(rows) else H
    band = a[int(H * .15):int(H * .5)] if torso else a[max(0, int(feet - H * .55)):max(1, int(feet - H * .08))]
    xs = np.where(band)[1]; return (float(np.median(xs)) if len(xs) else W / 2), float(feet)

PEXPR = {'em_talk': 'neutral', 'em_nod': 'closed', 'em_laugh': 'happy', 'em_angry': 'anger', 'em_sad': 'sad', 'em_shock': 'shock'}
def portraits(key, bust):
    # waist-up emotes become the character's dialogue portraits — only if they don't have painted ones yet
    PD = os.path.join(GAME, 'assets', 'portraits'); AJ = os.path.join(GAME, 'assets', 'art.json')
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
def twelve(Bt, C):
    # the 12x12 sheets: every game animation gets its own frames
    q = lambda L, i, n: L[i * len(L) // n:(i + 1) * len(L) // n] or L
    o = dict(combat=C, idle=C, walk=Bt('walk') or C, run=Bt('run') or Bt('walk') or C, special=Bt('special'), spellcast=Bt('special'),
             guard=Bt('guard'), dodge=Bt('dodge'), hurt=Bt('hurt'), ko=Bt('ko'), victory=Bt('victory'))
    if Bt('cmbA'):   # people
        a, b, h, t, pp, pd = Bt('cmbA'), Bt('cmbB'), Bt('heavy'), Bt('thrust'), Bt('pparry'), Bt('pdodge')
        o.update(draw=Bt('draw'), victory2=Bt('taunt'), fist=q(a, 0, 3), cmb1=q(a, 0, 3), cmb2=q(a, 1, 3), cmb3=q(a, 2, 3), cmb4=q(b, 0, 3), cmb5=q(b, 1, 3), cmb6=q(b, 2, 3),
                 slash=h, halfslash=q(h, 1, 2), backslash=b, thrust=t, thr=t, parry=Bt('parry') or Bt('guard'), pdodge=pd or Bt('dodge'),
                 pp1=q(pp, 0, 3), pp2=q(pp, 1, 3), pp3=q(pp, 2, 3), ppfin=pp, rise=Bt('rise'), jump=Bt('jump'), land=Bt('land'))
        for i in range(4): o['pd%d' % (i + 1)] = q(pd, i, 4)
    else:   # monsters
        l, c, h, u, r = Bt('light'), Bt('combo'), Bt('heavy'), Bt('lunge'), Bt('roar')
        o.update(draw=r, fist=q(l, 0, 2), cmb1=q(l, 0, 3), cmb2=q(l, 1, 3), cmb3=q(l, 2, 3), cmb4=q(c, 0, 3), cmb5=q(c, 1, 3), cmb6=q(c, 2, 3),
                 slash=h, halfslash=q(h, 1, 2), backslash=c, thrust=u, thr=u, spellcast=r or Bt('special'), parry=Bt('guard'), pdodge=Bt('dodge'),
                 jump=q(Bt('dodge'), 0, 2), land=q(Bt('dodge'), 1, 2), enraged=Bt('enraged'))
        for k in ('pp1', 'pp2', 'pp3', 'ppfin'): o[k] = Bt('guard')
        for i in range(4): o['pd%d' % (i + 1)] = Bt('dodge')
    return {k: v for k, v in o.items() if v}

def seven(Bt, C):
    # the 7x7 sheets: fewer, better frames, each game animation reuses the right row
    q = lambda L, i, n: L[i * len(L) // n:(i + 1) * len(L) // n] or L
    run, sp, g, d = Bt('run') or C, Bt('special'), Bt('guard'), Bt('dodge')
    o = dict(combat=C, idle=C, walk=run, run=run, special=sp, spellcast=sp, guard=g, parry=g, dodge=d, pdodge=d,
             hurt=Bt('hurt'), ko=Bt('ko'), victory=Bt('victory') or Bt('enraged'))
    if Bt('opener'):   # people
        op, cb = Bt('opener'), Bt('combo')
        o.update(draw=op, fist=q(cb, 0, 3), cmb1=q(cb, 0, 3), cmb2=q(cb, 1, 3), cmb3=q(cb, 2, 3), cmb4=q(op, 0, 2), cmb5=q(op, 1, 2), cmb6=sp,
                 slash=op, halfslash=q(cb, 1, 3), backslash=cb, thrust=q(cb, 2, 3), thr=q(cb, 2, 3), pp1=g, pp2=q(op, 0, 2), pp3=q(op, 1, 2), ppfin=op,
                 jump=q(d, 0, 2), land=q(d, 1, 2))
    else:   # monsters
        l, h = Bt('light'), Bt('heavy')
        o.update(draw=sp, fist=l, cmb1=q(l, 0, 3), cmb2=q(l, 1, 3), cmb3=q(l, 2, 3), cmb4=q(h, 0, 3), cmb5=q(h, 1, 3), cmb6=q(h, 2, 3),
                 slash=h, halfslash=q(h, 1, 2), backslash=l, thrust=h, thr=h, enraged=Bt('enraged'), jump=q(d, 0, 2), land=q(d, 1, 2))
        for k in ('pp1', 'pp2', 'pp3', 'ppfin'): o[k] = g
    for i in range(4): o['pd%d' % (i + 1)] = d
    return {k: v for k, v in o.items() if v}

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
        ax, ay = anchor(im, torso=(kind == 'battle' and nm in TORSO))
        items.append((im, x, y)); frames.append([x, y, im.width, im.height, round(ax, 1), round(ay, 1), float(HT - 2)])
        idx.setdefault(kind + ':' + nm, []).append(len(frames) - 1); x += im.width + 2; rh = max(rh, im.height)
    sheet = Image.new('RGBA', (AW, y + rh + 2))
    for im, xx, yy in items: sheet.alpha_composite(im, (xx, yy))
    sheet.save(os.path.join(OUT, 'c_%s.png' % key), optimize=True); sheet.save(os.path.join(OUT, 'c_%s.webp' % key), quality=90, alpha_quality=100, method=6)
    g = lambda n, k=None: idx.get((k or ('life' if n in ('idle', 'walk_down', 'walk_up', 'walk_side', 'work', 'run_down', 'run_up', 'run_side', 'idle_up', 'idle_side') or n.startswith(('em_', 'g_')) else 'battle')) + ':' + n, [])
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
    if Bt('cmbA') or Bt('lunge'): A.update(twelve(Bt, C))
    elif Bt('opener') or (Bt('light') and not Bt('cmbA')): A.update(seven(Bt, C))
    if A.get('hurt') and A.get('combat'):   # a hit flinches; lying-down frames belong to the KO
        ch = sorted(frames[i][3] for i in A['combat'])[len(A['combat']) // 2]
        down = [i for i in A['hurt'] if frames[i][3] < ch * .7]
        if down and len(down) < len(A['hurt']): A['hurt'] = [i for i in A['hurt'] if i not in down]; A['ko'] = down + [i for i in A.get('ko', []) if i not in down]
    # world
    idl = L('idle') or C[:1]; side = L('walk_side') or C
    A.update(ow_down=idl[:1], ow_idle=idl, ow_down_walk=L('walk_down') or side, ow_up=(L('walk_up') or idl)[:1], ow_up_walk=L('walk_up') or L('walk_down') or side,
             ow_side=side[:1], ow_side_walk=side, work=L('work'))
    if L('run_side'):   # a movement sheet: real walk + run cycles in every direction (simplewalk.js plays them when meta.cycle)
        A.update(ow_up=(L('idle_up') or L('walk_up') or idl)[:1], ow_side=(L('idle_side') or side)[:1],
                 ow_down_run=L('run_down') or L('walk_down'), ow_up_run=L('run_up') or L('walk_up'), ow_side_run=L('run_side'))
    for n in ('em_talk', 'em_nod', 'em_laugh', 'em_angry', 'em_sad', 'em_shock', 'g_point', 'g_wave', 'g_bow', 'g_cross', 'g_kneel', 'g_sit'):
        if L(n): A[n] = L(n)
    life_h = next((im.height for kk, nm, im in allf if kk == 'life' and nm == 'idle'), None)
    bust = {}
    if life_h:
        for kk, nm, im in allf:
            if kk == 'life' and (nm.startswith('em_') or nm in ('g_point', 'g_wave', 'g_cross', 'g_bow', 'work')) and im.height < life_h * .86: bust.setdefault(nm, im)
        for nm in bust: A.pop(nm, None)
        if 'work' in bust: print('  work loop is waist-up — kept out of the world')
    portraits(key, bust)
    meta = json.load(open(os.path.join(OUT, 'hd.json')))
    old = meta.get('c_' + key)
    if key.startswith(('m_', 'b_')) or '--monster' in sys.argv or Bt('lunge') or (Bt('light') and not Bt('cmbA')):   # monsters: row 6's last frames are ENRAGED, used when they berserk
        en = Bt('enraged') or Bt('victory')
        if en: A['enraged'] = en
        if old and 'desperate' in old.get('anims', {}) and en: A['desperate'] = Bt('desperate') or en
    # keep the size the game already draws this character at (a drake is long and low, not human-tall)
    if old and old.get('frames') and '--rescale' not in sys.argv:
        try:
            oa = old['anims']; of = old['frames'][(oa.get('combat') or oa.get('ow_down'))[0]]; ratio = of[3] / of[6]
            for kind, ref_name in (('battle', 'combat'), ('life', 'idle')):
                ids = idx.get(kind + ':' + ref_name)
                if not ids: continue
                if kind == 'life' and not oa.get('ow_down'): continue
                if kind == 'life': of2 = old['frames'][oa['ow_down'][0]]; ratio2 = of2[3] / of2[6]
                else: ratio2 = ratio
                nh = frames[ids[0]][3]; nref = round(nh / ratio2, 1)
                for k2, L2 in idx.items():
                    if k2.startswith(kind + ':'):
                        for j in L2: frames[j][6] = nref
            print('  kept the old on-screen size')
        except Exception as e: print('  (size match skipped:', e, ')')
    A = {k: v for k, v in A.items() if v}
    old_meta = meta.get('c_' + key) or {}
    meta['c_' + key] = dict(img='c_%s.png' % key, faces='right', frames=frames, anims=A, pool=kinds)
    for keep in ('label', 'unlock'):
        if old_meta.get(keep): meta['c_' + key][keep] = old_meta[keep]
    if A.get('ow_side_run'): meta['c_' + key]['cycle'] = 1
    meta['v'] = meta.get('v', 20) + 1; open(os.path.join(OUT, 'hd.json'), 'w').write(json.dumps(meta, separators=(',', ':')))
    pv = Image.new('RGBA', sheet.size, (40, 60, 50, 255)); pv.alpha_composite(sheet)
    pv.convert('RGB').resize((sheet.width // 2, max(1, sheet.height // 2))).save(SP + 'pool_%s.png' % key)
    print('built c_%s: %d frames from %s' % (key, len(frames), '+'.join(kinds)))

if __name__ == '__main__':
    path, key, kind = sys.argv[1], sys.argv[2], sys.argv[3]
    left = '--left' in sys.argv
    fr = cut_sheet(path, kind, left); spec_kind = kind; kind = 'life' if kind in ('life', 'move7') else 'battle'
    d = os.path.join(HERE, 'src', key, kind); os.makedirs(d, exist_ok=True)
    for f in os.listdir(d): os.remove(os.path.join(d, f))
    man = []
    for i, (nm, im) in enumerate(fr): fn = '%02d_%s.png' % (i, nm); im.save(os.path.join(d, fn)); man.append([nm, fn])
    json.dump(man, open(os.path.join(d, 'frames.json'), 'w'))
    want = sum(c for _, g in SPECS[spec_kind] for _, c in g)
    print('%s %s: cut %d/%d frames' % (key, kind, len(fr), want))
    build(key)
