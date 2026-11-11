"""Builds the tile-made forests for Emerald Blood:
ground images (baked), a props atlas (y-sorted trees & set pieces), collision grids,
tall-grass lists and a layout data file the game reads (js/fc_data.js)."""
import json, math, random, os
import numpy as np
from PIL import Image, ImageDraw, ImageFilter
from scipy import ndimage

T = 32
REPO = '/home/claude/frednelcharlesinc-cpu.github.io/emerald-blood'
SPR = '/home/claude/eb/big/'
SMALL = '/home/claude/eb/spr_'

def hexc(h): h = h.lstrip('#'); return np.array([int(h[i:i+2], 16) for i in (0, 2, 4)], float)

BIOME = {
 'cross': dict(g=['#5f9a3a', '#6aa842', '#4f8a30'], acc=['#7fbf4a', '#e8d86a', '#f2f2f2', '#d77aa8'], path='#b39264', pathacc=['#8c6c46', '#cdb284'],
               tall=['#2f6a24', '#3f8a2e', '#5aa83c'], water='#3f7fc4', wall='n_wall', stone='#9a958a', ptype='dirt'),
 'north': dict(g=['#dbe7f1', '#e9f1f8', '#c9d9e7'], acc=['#ffffff', '#b8cadb', '#a7bccd'], path='#aebfce', pathacc=['#93a7b8', '#c4d2de'],
               tall=['#6f8796', '#8aa1ae', '#b8c9d3'], water='#86b8dc', wall='n_wall', stone='#8d9eb0', ptype='snow'),
 'east': dict(g=['#8a6a2c', '#9a7432', '#7a5c26'], acc=['#c4441e', '#e07a22', '#f0a830', '#6a3a1a'], path='#a4784a', pathacc=['#7e5634', '#c09468'],
              tall=['#8a2e14', '#b0421c', '#d0662a'], water='#2f4a66', wall='e_wall', stone='#8a6a4e', ptype='dirt'),
 'south': dict(g=['#33503a', '#3c5c40', '#2b4632'], acc=['#4f7a4a', '#2a3e30', '#5ad0c0', '#a070d0'], path='#5a5236', pathacc=['#463f28', '#6e6544'],
               tall=['#1f4a34', '#2e6a48', '#3f8a5a'], water='#245f5c', wall='s_wall', stone='#5d6a5a', ptype='mud'),
 'west': dict(g=['#6f9a2e', '#7cab34', '#5f8a28'], acc=['#a8d050', '#d8e070', '#3f6a20'], path='#9a9468', pathacc=['#7a7650', '#b8b488'],
              tall=['#2f6a1a', '#45852a', '#64a83a'], water='#3a8e9a', wall='w_wall', stone='#8f8c6a', ptype='flag'),
 'dun_n': dict(floor='#55657a', wallc='#1c232c', wall='n_wall', tiles='dfang', nfloor=5, nwall=3), 'dun_e': dict(floor='#6e4e36', wallc='#1a1010', wall='e_wall', tiles='dcinder', nfloor=4, nwall=3, lava=4),
 'dun_s': dict(floor='#355a4a', wallc='#0f1d17', wall='s_wall'), 'dun_w': dict(floor='#66664a', wallc='#202010', wall='w_wall'),
}

# ---------------------------------------------------------------- props atlas
def load(n, src=SPR):
    return Image.open(src + n + '.png').convert('RGBA')

PROPS = {}   # key -> Image
def addp(key, img): PROPS[key] = img; return key
for b in 'nesw':
    for i in (1, 2, 3): addp(f'fc_{b}tree{i}', load(f'{b}_tree{i}'))
for n in ['n_bush1', 'n_bush2', 'n_bush3', 'e_bush1', 'e_bush2', 'e_bush3', 's_bush1', 's_bush2', 'w_bush1', 'w_bush2', 'w_bush3',
          'n_rock1', 'n_rock2', 'e_rock1', 'e_rock2', 's_rock1', 's_rock2', 's_rock3', 'w_rock1', 'w_rock2', 'w_rock3',
          'n_log', 'e_log', 's_log1', 's_log2', 'w_log1', 'w_log2', 'n_statue', 'e_statue', 's_statue', 'w_statue', 'n_ruins', 'e_ruins',
          's_arch', 's_tablet', 'w_mural', 'n_camp', 'e_camp', 's_tent', 's_roll', 'w_tent', 'w_roll', 'n_sign', 'e_sign', 's_sign', 'w_sign',
          's_dead', 's_stump', 's_mush1', 's_mush2', 's_mush3', 's_mush4', 's_moss', 'ttree1', 'ttree2', 'ttree3', 'tbush1', 'tbush2', 'tbush3',
          'pot1', 'barrel', 'crates', 'lantern', 'well', 'n_bridge', 'e_bridge']:
    addp('fc_' + n, load(n))
# set pieces resized to the world
def rs(img, f): return img.resize((max(1, round(img.width * f)), max(1, round(img.height * f))), Image.LANCZOS)
for b in 'nesw':
    c = load(f'{b}_cave'); addp(f'fc_{b}cave', rs(c, 150 / c.width))
    f = load(f'{b}_fall', SMALL)
    addp(f'fc_{b}fall', f.resize((64, 176) if b in 'ne' else (96, 190), Image.LANCZOS))
import glob as _g
for _f in sorted(_g.glob(SPR + 'd*_*.png')):
    _n = os.path.basename(_f)[:-4]; addp('fc_' + _n, load(_n))
addp('fc_ancient', rs(load('n_tree3'), 2.0))
addp('fc_grandtree', rs(load('w_tree3'), 1.5))
addp('fc_swampking', rs(load('s_tree3'), 1.25))
addp('fc_emberking', rs(load('e_tree3'), 1.6))

def pack():
    items = sorted(PROPS.items(), key=lambda kv: -kv[1].height)
    W = 2048; x = y = 0; rowh = 0; pos = {}
    for k, im in items:
        if x + im.width > W: x = 0; y += rowh + 2; rowh = 0
        pos[k] = (x, y); x += im.width + 2; rowh = max(rowh, im.height)
    H = y + rowh
    atlas = Image.new('RGBA', (W, H))
    meta = {}
    for k, im in items:
        px, py = pos[k]; atlas.alpha_composite(im, (px, py))
        meta[k] = {'r': [px, py, im.width, im.height], 'ax': im.width // 2, 'ay': im.height - 2, 'img': 'props5', 'block': [], 'sh': int(im.width * .55)}
    for k in meta:   # flat-ish things cast smaller shadows
        if any(t in k for t in ('fall', 'cave', 'mural', 'bridge', 'roll', 'mush', 'moss', 'tablet')): meta[k]['sh'] = 0
    atlas.save(REPO + '/assets/props5.png', optimize=True)
    json.dump(meta, open(REPO + '/assets/props5.json', 'w'), separators=(',', ':'))
    return meta

# ---------------------------------------------------------------- map model
class M:
    # kinds: 0 ground, 1 path, 2 water, 3 cliff, 4 stairs, 5 bridge, 6 tall grass, 7 dungeon floor, 8 dungeon wall
    def __init__(s, key, w, h, biome, seed):
        s.key, s.w, s.h, s.b = key, w, h, biome
        s.k = np.zeros((h, w), np.int8); s.col = np.zeros((h, w), np.int8)
        s.props = []; s.res = set(); s.rng = random.Random(seed); s.seed = seed
        s.data = {'exits': [], 'look': [], 'chests': [], 'gather': [], 'npc': {}, 'caves': {}, 'logs': [], 'fires': [], 'secret': [], 'springs': [], 'signs': [], 'pois': []}
        s.cliffbands = []
    def inb(s, x, y): return 0 <= x < s.w and 0 <= y < s.h
    def brush(s, x, y, r, kind, only=None):
        for yy in range(int(y - r), int(y + r) + 1):
            for xx in range(int(x - r), int(x + r) + 1):
                if s.inb(xx, yy) and (xx + .5 - x) ** 2 + (yy + .5 - y) ** 2 <= r * r + .3:
                    if only is None or s.k[yy, xx] in only: s.k[yy, xx] = kind
    def line(s, pts, r, kind, only=None):
        for (x0, y0), (x1, y1) in zip(pts, pts[1:]):
            n = int(max(abs(x1 - x0), abs(y1 - y0)) * 3) + 1
            for i in range(n + 1):
                t = i / n; s.brush(x0 + .5 + (x1 - x0) * t, y0 + .5 + (y1 - y0) * t, r, kind, only)
    def path(s, pts, r=1.1):
        # paths over water become bridges, over cliffs stay cliffs (use stairs)
        for (x0, y0), (x1, y1) in zip(pts, pts[1:]):
            n = int(max(abs(x1 - x0), abs(y1 - y0)) * 3) + 1
            for i in range(n + 1):
                t = i / n; cx = x0 + .5 + (x1 - x0) * t; cy = y0 + .5 + (y1 - y0) * t
                for yy in range(int(cy - r), int(cy + r) + 1):
                    for xx in range(int(cx - r), int(cx + r) + 1):
                        if s.inb(xx, yy) and (xx + .5 - cx) ** 2 + (yy + .5 - cy) ** 2 <= r * r + .3:
                            k = s.k[yy, xx]
                            if k == 2: s.k[yy, xx] = 5
                            elif k in (0, 6): s.k[yy, xx] = 1
    def river(s, pts, r=1.4): s.line(pts, r, 2, only=(0, 6, 1))
    def pond(s, cx, cy, rx, ry):
        for y in range(s.h):
            for x in range(s.w):
                if ((x + .5 - cx) / rx) ** 2 + ((y + .5 - cy) / ry) ** 2 <= 1 and s.k[y, x] in (0, 6, 1): s.k[y, x] = 2
    def cliff(s, y, x0, x1, stairs=(), rows=3):
        for x in range(x0, x1 + 1):
            for r in range(rows):
                s.k[y + r, x] = 3
        for sx in stairs:
            for r in range(rows):
                for dx in (0, 1): s.k[y + r, sx + dx] = 4
        s.cliffbands.append((y, x0, x1, rows))
    def tall(s, cx, cy, rx, ry):
        for y in range(s.h):
            for x in range(s.w):
                d = ((x + .5 - cx) / rx) ** 2 + ((y + .5 - cy) / ry) ** 2
                if d <= 1 - .25 * s.rng.random() and s.k[y, x] == 0: s.k[y, x] = 6
    def clear(s, cx, cy, r):
        for y in range(s.h):
            for x in range(s.w):
                if (x - cx) ** 2 + (y - cy) ** 2 <= r * r: s.res.add((x, y))
    def put(s, key, x, y, block=((0, 0),), reserve=1):
        s.props.append({'k': key, 'x': x, 'y': y})
        for dx, dy in block:
            if s.inb(x + dx, y + dy): s.col[y + dy, x + dx] = 1
        for dx in range(-reserve, reserve + 1):
            for dy in range(-reserve, reserve + 1): s.res.add((x + dx, y + dy))
    def spot(s, name, x, y, d='down'):
        s.data['npc'][name] = [x, y, d]; s.res.add((x, y))
    def look(s, tiles, text): s.data['look'].append({'t': [list(t) for t in tiles], 'text': text})
    def exit(s, **e): s.data['exits'].append(e)
    def chest(s, x, y): s.data['chests'].append([x, y]); s.res.add((x, y)); s.res.add((x, y - 1))

    # ---- finishing: collision + scatter + art
    def finish(s, density=.55, trees=None, bushes=(), rocks=(), extra=(), border=3, keepout=1):
        k = s.k
        s.col[(k == 2) | (k == 3) | (k == 8)] = 1
        rng = s.rng
        nearpath = ndimage.binary_dilation(np.isin(k, (1, 4, 5)), iterations=keepout)
        # big-scale noise for clumps & clearings
        nz = np.array(Image.fromarray((np.random.RandomState(s.seed).rand(s.h // 4 + 2, s.w // 4 + 2) * 255).astype(np.uint8)).resize((s.w, s.h), Image.BICUBIC)) / 255
        taken = np.zeros_like(s.col)
        cells = [(x, y) for y in range(s.h) for x in range(s.w)]; rng.shuffle(cells)
        ex_tiles = set()
        for e in s.data['exits']:
            for x in range(e['x'], e.get('x2', e['x']) + 1):
                for y in range(e['y'], e.get('y2', e['y']) + 1):
                    for dx in (-1, 0, 1):
                        for dy in (-1, 0, 1): ex_tiles.add((x + dx, y + dy))
        for (x, y) in cells:
            if k[y, x] != 0 or s.col[y, x] or (x, y) in s.res or (x, y) in ex_tiles: continue
            edge = min(x, y, s.w - 1 - x, s.h - 1 - y) < border
            if nearpath[y, x] and not edge: continue
            p = (density + (nz[y, x] - .5) * .9) if not edge else .95
            sp = 1 if edge else 2
            if rng.random() > p: continue
            if taken[max(0, y - sp):y + sp + 1, max(0, x - sp):x + sp + 1].any(): continue
            # cliff faces: don't plant trees in the row right below a cliff (they'd hide it) unless border
            if not edge and y + 1 < s.h and y > 0 and k[y - 1, x] == 3: continue
            t = trees(x, y, rng) if callable(trees) else rng.choice(trees)
            s.props.append({'k': t, 'x': x, 'y': y}); s.col[y, x] = 1; taken[y, x] = 1
        # bushes & rocks
        for (x, y) in cells:
            if k[y, x] != 0 or s.col[y, x] or (x, y) in s.res or (x, y) in ex_tiles or nearpath[y, x]: continue
            r = rng.random()
            if bushes and r < .05: s.props.append({'k': rng.choice(bushes), 'x': x, 'y': y}); s.col[y, x] = 1
            elif rocks and r < .065: s.props.append({'k': rng.choice(rocks), 'x': x, 'y': y}); s.col[y, x] = 1
            elif extra and r < .085: s.props.append({'k': rng.choice(extra), 'x': x, 'y': y})
        s.data['grass'] = [[int(x), int(y)] for y, x in zip(*np.where(k == 6))]

# ---------------------------------------------------------------- painting
def vnoise(h, w, cell, seed):
    r = np.random.RandomState(seed).rand(h // cell + 3, w // cell + 3)
    im = Image.fromarray((r * 255).astype(np.uint8)).resize(((w // cell + 3) * cell, (h // cell + 3) * cell), Image.BICUBIC)
    return np.array(im)[:h, :w] / 255.

def organic(mask_tiles, seed, blur=7, jitter=.35):
    m = Image.fromarray((mask_tiles * 255).astype(np.uint8)).resize((mask_tiles.shape[1] * T, mask_tiles.shape[0] * T), Image.NEAREST)
    m = np.array(m.filter(ImageFilter.GaussianBlur(blur))) / 255.
    n = vnoise(m.shape[0], m.shape[1], 9, seed) - .5
    return (m + n * jitter) > .5

def paint(m):
    B = BIOME[m.b]; H, W = m.h * T, m.w * T; rs_ = np.random.RandomState(m.seed)
    k = m.k
    # ground
    g = [hexc(c) for c in B['g']]
    n1 = vnoise(H, W, 48, m.seed + 1); n2 = vnoise(H, W, 12, m.seed + 2); n3 = rs_.rand(H, W)
    img = g[0] * (1 - n1[..., None]) + g[1] * n1[..., None]
    img = img * (1 - .35 * (n2[..., None] > .62)) + g[2] * .35 * (n2[..., None] > .62)
    img += (n3[..., None] - .5) * 10
    canvas = Image.fromarray(np.clip(img, 0, 255).astype(np.uint8)).convert('RGBA')
    d = ImageDraw.Draw(canvas)
    # ground speckles (leaves, flowers, snow glints, moss)
    acc = B['acc']
    for _ in range(int(W * H / 140)):
        x, y = rs_.randint(0, W), rs_.randint(0, H)
        if k[y // T, x // T] not in (0, 6): continue
        c = acc[rs_.randint(len(acc))]; sz = rs_.choice([1, 1, 2, 2, 3])
        d.rectangle([x, y, x + sz - 1, y + max(1, sz - 1)], fill=c)
    # grass tufts on ground
    for _ in range(int(W * H / 700)):
        x, y = rs_.randint(0, W), rs_.randint(0, H)
        if k[y // T, x // T] != 0: continue
        c = B['tall'][rs_.randint(3)]
        for j in range(3): d.line([x + j * 2, y, x + j * 2 + rs_.randint(-1, 2), y - 3 - rs_.randint(3)], fill=c)
    base = np.array(canvas).astype(float)

    def layer(mask, texfn):
        nonlocal base
        tex = texfn()
        base[mask] = tex[mask]
    # path
    pm = organic(np.isin(k, (1, 5, 4)).astype(float), m.seed + 5, blur=8, jitter=.45)
    def pathtex():
        pc = hexc(B['path']); nn = vnoise(H, W, 6, m.seed + 6)
        t = pc * (.88 + .24 * nn[..., None]) + (rs_.rand(H, W)[..., None] - .5) * 12
        im = Image.fromarray(np.clip(t, 0, 255).astype(np.uint8)); dd = ImageDraw.Draw(im)
        if B['ptype'] == 'flag':
            for yy in range(0, H, 14):
                off = (yy // 14 % 2) * 9
                for xx in range(-off, W, 18):
                    dd.rectangle([xx + 1, yy + 1, xx + 16, yy + 12], outline=B['pathacc'][0])
                    dd.line([xx + 2, yy + 2, xx + 14, yy + 2], fill=B['pathacc'][1])
        else:
            for _ in range(int(W * H / 90)):
                x, y = rs_.randint(0, W), rs_.randint(0, H); c = B['pathacc'][rs_.randint(2)]
                r = rs_.choice([1, 1, 2, 3]) if B['ptype'] != 'snow' else 1
                dd.ellipse([x, y, x + r, y + r * .8], fill=c)
            if B['ptype'] == 'snow':   # footprints
                for _ in range(int(W * H / 1800)):
                    x, y = rs_.randint(0, W), rs_.randint(0, H)
                    for j in range(4): dd.ellipse([x + (j % 2) * 5, y + j * 7, x + (j % 2) * 5 + 3, y + j * 7 + 4], fill='#9aacbd')
        return np.array(im.convert('RGBA')).astype(float)
    # outline under path edge
    edge = ndimage.binary_dilation(pm, iterations=2) & ~pm
    base[edge, :3] = base[edge, :3] * .82
    layer(pm, pathtex)
    # tall grass
    tm = organic((k == 6).astype(float), m.seed + 7, blur=8, jitter=.7)
    tall_ov = Image.new('RGBA', (W, H), (0, 0, 0, 0)); td = ImageDraw.Draw(tall_ov)
    ys, xs = np.where(tm[::2, ::2])
    tc = B['tall']
    order = np.argsort(ys)
    for yy, xx in zip(ys[order] * 2, xs[order] * 2):
        if rs_.rand() < .55:
            hgt = 6 + rs_.randint(7); c = tc[rs_.randint(2)]
            lean = rs_.randint(-3, 4)
            td.line([xx, yy + 4, xx + lean, yy + 4 - hgt], fill=c, width=2 if rs_.rand() < .3 else 1)
            td.point((xx + lean, yy + 4 - hgt), fill=tc[2])
    sh = ndimage.binary_dilation(tm, iterations=1)
    base[sh, :3] = base[sh, :3] * .86 + np.array(hexc(tc[0])) * .14
    tall_np = np.array(tall_ov).astype(float); a = tall_np[..., 3:4] / 255
    base[..., :3] = base[..., :3] * (1 - a) + tall_np[..., :3] * a
    # water
    wm = organic((k == 2).astype(float) + (k == 5) * 1., m.seed + 8, blur=9, jitter=.3) & ~np.isin(np.repeat(np.repeat(k, T, 0), T, 1), (3, 4))
    dist = ndimage.distance_transform_edt(wm)
    wc = hexc(B['water']); nn = vnoise(H, W, 20, m.seed + 9)
    wt = wc * (.85 + .3 * nn[..., None])
    shallow = (dist < 7)[..., None]; wt = np.where(shallow, wt * .8 + np.array([255, 255, 255]) * .2 * (1 - np.clip(dist[..., None] / 7, 0, 1)) + wt * 0, wt)
    for _ in range(int(W * H / 700)):
        x, y = rs_.randint(0, W - 8), rs_.randint(0, H)
        L = rs_.randint(3, 9); wt[y, x:x + L] = np.minimum(255, wt[y, x:x + L] + 45)
    base[wm, :3] = wt[wm]
    rim = (dist > 0) & (dist < 2)
    base[rim, :3] = base[rim, :3] * .55
    if m.b == 'south':   # glowing specks in the swamp water
        for _ in range(int(W * H / 2500)):
            x, y = rs_.randint(0, W), rs_.randint(0, H)
            if wm[y, x]: base[y:y + 2, x:x + 2, :3] = hexc(['#6af0d8', '#b98af0'][rs_.randint(2)])
    canvas = Image.fromarray(np.clip(base, 0, 255).astype(np.uint8)).convert('RGBA'); d = ImageDraw.Draw(canvas)
    # bridges (planks)
    for y in range(m.h):
        for x in range(m.w):
            if k[y, x] == 5:
                horiz = (x > 0 and k[y, x - 1] in (1, 5)) or (x < m.w - 1 and k[y, x + 1] in (1, 5))
                vert = (y > 0 and k[y - 1, x] in (1, 5)) or (y < m.h - 1 and k[y + 1, x] in (1, 5))
                X, Y = x * T, y * T
                d.rectangle([X, Y, X + 31, Y + 31], fill='#6b4a2a')
                if vert and not horiz:
                    for i in range(0, 32, 6): d.rectangle([X, Y + i, X + 31, Y + i + 4], fill=['#9a6e40', '#8a6036'][(i // 6) % 2]); d.line([X, Y + i + 5, X + 31, Y + i + 5], fill='#4a301a')
                    d.rectangle([X, Y, X + 2, Y + 31], fill='#4a301a'); d.rectangle([X + 29, Y, X + 31, Y + 31], fill='#4a301a')
                else:
                    for i in range(0, 32, 6): d.rectangle([X + i, Y, X + i + 4, Y + 31], fill=['#9a6e40', '#8a6036'][(i // 6) % 2]); d.line([X + i + 5, Y, X + i + 5, Y + 31], fill='#4a301a')
                    d.rectangle([X, Y, X + 31, Y + 2], fill='#4a301a'); d.rectangle([X, Y + 29, X + 31, Y + 31], fill='#4a301a')
    # cliffs
    wall = load(B['wall'], SMALL).resize((32, 32), Image.LANCZOS)
    body = wall.crop((0, 12, 32, 32)).resize((32, 32), Image.LANCZOS)
    stone = hexc(B['stone'])
    for (cy, x0, x1, rows) in m.cliffbands:
        # soft shadow cast on the ground below
        sh = Image.new('RGBA', (W, H), (0, 0, 0, 0)); sd = ImageDraw.Draw(sh)
        for i in range(14):
            sd.rectangle([x0 * T, (cy + rows) * T + i, (x1 + 1) * T, (cy + rows) * T + i], fill=(0, 0, 0, int(90 * (1 - i / 14))))
        canvas = Image.alpha_composite(canvas, sh); d = ImageDraw.Draw(canvas)
        for x in range(x0, x1 + 1):
            for r in range(rows):
                y = cy + r
                if k[y, x] == 3:
                    tile = wall if r == 0 else body
                    if r == rows - 1:
                        tile = Image.fromarray((np.array(tile).astype(float) * [.8, .8, .8, 1]).astype(np.uint8))
                    canvas.alpha_composite(tile, (x * T, y * T))
                elif k[y, x] == 4:
                    X, Y = x * T, y * T
                    for i in range(0, 32, 8):
                        lv = .75 + .25 * (i / 32)
                        d.rectangle([X, Y + i, X + 31, Y + i + 7], fill=tuple(int(c * lv) for c in stone))
                        d.line([X, Y + i, X + 31, Y + i], fill=tuple(int(min(255, c * 1.25)) for c in stone))
                        d.line([X, Y + i + 7, X + 31, Y + i + 7], fill=tuple(int(c * .5) for c in stone))
            # stair side walls
        for x in range(x0, x1 + 1):
            for r in range(rows):
                if k[cy + r, x] == 4 and x > 0 and k[cy + r, x - 1] == 3: d.rectangle([x * T, (cy + r) * T, x * T + 2, (cy + r) * T + 31], fill=tuple(int(c * .45) for c in stone))
                if k[cy + r, x] == 4 and x < m.w - 1 and k[cy + r, x + 1] == 3: d.rectangle([x * T + 29, (cy + r) * T, x * T + 31, (cy + r) * T + 31], fill=tuple(int(c * .45) for c in stone))
    return canvas

def paint_dungeon(m):
    B = BIOME[m.b]; H, W = m.h * T, m.w * T; rs_ = np.random.RandomState(m.seed)
    fl = hexc(B['floor']); n1 = vnoise(H, W, 10, m.seed); n2 = rs_.rand(H, W)
    img = fl * (.8 + .4 * n1[..., None]) + (n2[..., None] - .5) * 14
    canvas = Image.fromarray(np.clip(img, 0, 255).astype(np.uint8)).convert('RGBA'); d = ImageDraw.Draw(canvas)
    for _ in range(int(W * H / 400)):
        x, y = rs_.randint(0, W), rs_.randint(0, H); r = rs_.randint(1, 4)
        d.ellipse([x, y, x + r, y + r * .7], fill=tuple(int(c * .7) for c in fl))
    wall = load(B['wall'], SMALL).resize((32, 32), Image.LANCZOS)
    dark = hexc(B['wallc'])
    k = m.k
    if 'tiles' in B:   # the user's dungeon sheet: real floor & wall tiles
        fl_t = [load(f"{B['tiles']}_floor{i}", SMALL) for i in range(B['nfloor'])]
        wl_t = [load(f"{B['tiles']}_wall{i}", SMALL) for i in range(B['nwall'])]
        wts = [6] + [2] * (len(fl_t) - 1)
        for y in range(m.h):
            for x in range(m.w):
                if k[y, x] == 7: canvas.alpha_composite(rs_.choice(len(fl_t), p=np.array(wts) / sum(wts)) and fl_t[rs_.choice(range(1, len(fl_t)))] or fl_t[0], (x * T, y * T))
        for (x, y) in m.data.get('lava', []): canvas.alpha_composite(load(f"{B['tiles']}_floor{B['lava']}", SMALL), (x * T, y * T))
    for y in range(m.h):
        for x in range(m.w):
            if k[y, x] == 8:
                below_floor = y + 1 < m.h and k[y + 1, x] == 7
                if below_floor: canvas.alpha_composite(wl_t[rs_.randint(len(wl_t))] if 'tiles' in B else wall, (x * T, y * T))
                else: d.rectangle([x * T, y * T, x * T + 31, y * T + 31], fill=tuple(int(c) for c in dark))
    # shadow under walls
    arr = np.array(canvas).astype(float)
    for y in range(m.h):
        for x in range(m.w):
            if k[y, x] == 7 and y > 0 and k[y - 1, x] == 8:
                for i in range(10): arr[y * T + i, x * T:x * T + 32, :3] *= (.55 + .045 * i)
    return Image.fromarray(np.clip(arr, 0, 255).astype(np.uint8))

def minimap_rows(m):
    ch = {0: 'g', 1: 'p', 2: 'w', 3: 'c', 4: 's', 5: 'b', 6: 't', 7: 'f', 8: 'x'}
    rows = []
    for y in range(m.h):
        r = ''
        for x in range(m.w):
            c = ch[int(m.k[y, x])]
            if c in 'gt' and m.col[y, x]: c = 'T'
            r += c
        rows.append(r)
    return rows
