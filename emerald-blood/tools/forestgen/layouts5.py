"""THE DEEP (B): the Underdeep (a lower realm that joins every Gate), four themed Gate pockets, the Sunhigh Arena,
and the four forest dungeons rebuilt bigger (98x68) with set-piece rooms. Merges into the live maps.json / fc_data.js."""
import json, hashlib, random, math
from collections import deque
import numpy as np
from PIL import Image, ImageDraw, ImageFilter
from gen import *
import layouts_theme as LT   # THEME (dungeon extras) copied out of layouts.py

def around(x, y, w=1, h=1): return [(x + dx, y + dy) for dx in range(-1, w + 1) for dy in range(-1, h + 1)]

# ====================================================================== void realms
VOID = {
  'deep': dict(sky=('#07040f', '#120a26'), neb=[(90, 40, 160), (30, 90, 150)], floor='#3a3148', floor2='#2a2236', edge='#9a7aff', bridge=(120, 230, 255), rune=['#c58aff', '#7af0ff', '#ff7ad8'], under='#1a1426'),
  'n': dict(sky=('#040a14', '#0c1a30'), neb=[(60, 120, 200), (140, 200, 255)], floor='#4a5a70', floor2='#38465a', edge='#bfe6ff', bridge=(170, 230, 255), rune=['#bfe6ff', '#ffffff', '#7ab8ff'], under='#1a2434'),
  'e': dict(sky=('#120404', '#2a0a06'), neb=[(200, 70, 30), (255, 150, 60)], floor='#4a2e26', floor2='#3a221c', edge='#ffb070', bridge=(255, 170, 90), rune=['#ff9a4a', '#ffd070', '#ff5a3a'], under='#24120e'),
  's': dict(sky=('#020e0e', '#06221e'), neb=[(30, 150, 130), (90, 200, 160)], floor='#2e4a44', floor2='#223a34', edge='#7affd8', bridge=(110, 255, 210), rune=['#7affd8', '#c8ffef', '#5ad0c0'], under='#0e201c'),
  'w': dict(sky=('#040f06', '#0c2410'), neb=[(70, 180, 90), (220, 200, 90)], floor='#3e4a2e', floor2='#2e3a22', edge='#c8ff8a', bridge=(200, 255, 140), rune=['#46ff95', '#e8e070', '#a8ff7a'], under='#141e0e'),
}
def void_map(key, W, H, seed, islands, links, theme):
    m = M(key, W, H, 'dun_gate', seed); m.k[:] = 8; rng = random.Random(seed); m.theme = theme
    noise = vnoise(H, W, 6, seed)
    I = {}
    for (name, cx, cy, rx, ry) in islands:
        I[name] = (cx, cy)
        for y in range(max(1, int(cy - ry - 2)), min(H - 1, int(cy + ry + 3))):
            for x in range(max(1, int(cx - rx - 2)), min(W - 1, int(cx + rx + 3))):
                d = ((x - cx) / rx) ** 2 + ((y - cy) / ry) ** 2
                if d < .82 + noise[y, x] * .4: m.k[y, x] = 7
    isl = m.k.copy()
    for a, b in links:
        (x0, y0), (x1, y1) = I[a], I[b]
        if rng.random() < .5: pts = [(x0, y0), (x1, y0), (x1, y1)]
        else: pts = [(x0, y0), (x0, y1), (x1, y1)]
        m.line(pts, .62, 7)
    m.data['bridges'] = [[int(x), int(y)] for y in range(H) for x in range(W) if m.k[y, x] == 7 and isl[y, x] == 8]
    m.k[0, :] = 8; m.k[-1, :] = 8; m.k[:, 0] = 8; m.k[:, -1] = 8
    m.col[:] = 0; m.col[m.k == 8] = 1
    m.data['islands'] = {k: list(v) for k, v in I.items()}
    m.rng_ = rng
    return m
def void_props(m, keep, n_cry=.07, n_pil=.012):
    rng = m.rng_; W, H = m.w, m.h; br = {tuple(t) for t in m.data['bridges']}
    for y in range(2, H - 2):
        for x in range(2, W - 2):
            if m.k[y, x] != 7 or (x, y) in br or (x, y) in keep or m.col[y, x]: continue
            n8 = sum(m.k[y + dy, x + dx] == 7 for dx in (-1, 0, 1) for dy in (-1, 0, 1)) - 1
            if any((x + dx, y + dy) in br for dx in (-1, 0, 1) for dy in (-1, 0, 1)): continue
            r = rng.random()
            if n8 <= 6 and r < n_cry: m.props.append({'k': rng.choice(['fc_dfang_crystal1', 'fc_dfang_crystal2', 'fc_dfang_crystal3']), 'x': x, 'y': y}); m.col[y, x] = 1
            elif n8 == 8 and r < n_pil: m.props.append({'k': rng.choice(['fc_dfang_pillar', 'fc_dfang_pillar2', 'fc_dfang_stalag1']), 'x': x, 'y': y}); m.col[y, x] = 1
def paint_void(m):
    th = VOID[m.theme]; W, H = m.w * T, m.h * T; rs = np.random.RandomState(m.seed)
    g = np.linspace(0, 1, H)[:, None, None]; a, b = hexc(th['sky'][0]), hexc(th['sky'][1])
    img = a * (1 - g) + b * g + np.zeros((H, W, 3))
    for i, col in enumerate(th['neb']):
        n = vnoise(H, W, 220 + i * 90, m.seed + i * 7); n = np.clip((n - .45) * 2.2, 0, 1) ** 2
        img += n[..., None] * np.array(col) * .55
    st = rs.rand(H, W); img[st > .9985] = [235, 235, 255]; img[(st > .9975) & (st <= .9985)] = [160, 170, 220]
    cv = Image.fromarray(np.clip(img, 0, 255).astype(np.uint8)).convert('RGBA'); d = ImageDraw.Draw(cv)
    # far debris: little dead islands drifting in the void
    for _ in range(int(m.w * m.h / 60)):
        x, y = rs.randint(0, W), rs.randint(0, H); tx, ty = x // T, y // T
        if 0 <= ty < m.h and 0 <= tx < m.w and m.k[ty, tx] == 8 and not (ty + 1 < m.h and m.k[ty + 1, tx] == 7) and not (ty - 1 >= 0 and m.k[ty - 1, tx] == 7):
            r = rs.randint(3, 11); c = tuple(int(v) for v in hexc(th['under']) * .9); d.ellipse([x - r, y - r * .5, x + r, y + r * .5], fill=c + (255,)); d.polygon([(x - r, y), (x + r, y), (x + rs.randint(-3, 3), y + r * 1.6)], fill=c + (255,))
    k = m.k; br = {tuple(t) for t in m.data['bridges']}
    fl, fl2, und, edge = hexc(th['floor']), hexc(th['floor2']), hexc(th['under']), tuple(int(v) for v in hexc(th['edge']))
    # undersides of the islands: jagged rock hanging into the void
    ov = Image.new('RGBA', cv.size, (0, 0, 0, 0)); od = ImageDraw.Draw(ov)
    for y in range(m.h - 1):
        for x in range(m.w):
            if k[y, x] == 7 and (x, y) not in br and k[y + 1, x] == 8:
                X, Y = x * T, (y + 1) * T; dep = rs.randint(26, 64)
                pts = [(X, Y), (X + 32, Y), (X + 32 - rs.randint(0, 8), Y + dep * .6), (X + 16 + rs.randint(-6, 6), Y + dep), (X + rs.randint(0, 8), Y + dep * .55)]
                od.polygon(pts, fill=tuple(int(v) for v in und) + (255,))
                od.line([(X + 6, Y + 4), (X + 10, Y + dep * .5)], fill=tuple(int(v * 1.4) for v in und) + (255,), width=2)
                if rs.rand() < .25: od.line([(X + 20, Y + 2), (X + 22, Y + dep * .7)], fill=edge + (160,), width=1)
    cv.alpha_composite(ov)
    # island tops: stone, cracks, runes, a glowing rim where it meets the void
    n1 = vnoise(H, W, 14, m.seed + 3); arr = np.array(cv).astype(float)
    mask = np.zeros((H, W), bool)
    for y in range(m.h):
        for x in range(m.w):
            if k[y, x] == 7 and (x, y) not in br: mask[y * T:(y + 1) * T, x * T:(x + 1) * T] = True
    top = fl * (.75 + .5 * n1[..., None]) + (rs.rand(H, W, 1) - .5) * 16
    arr[mask, :3] = top[mask]; cv = Image.fromarray(np.clip(arr, 0, 255).astype(np.uint8)); d = ImageDraw.Draw(cv)
    for y in range(m.h):
        for x in range(m.w):
            if k[y, x] != 7 or (x, y) in br: continue
            X, Y = x * T, y * T
            if rs.rand() < .18: d.line([(X + rs.randint(2, 30), Y + rs.randint(2, 30)), (X + rs.randint(2, 30), Y + rs.randint(2, 30))], fill=tuple(int(v) for v in fl2) + (255,), width=1)
            if rs.rand() < .05: d.rectangle([X + 14, Y + 14, X + 16, Y + 16], fill=th['rune'][rs.randint(3)])
            for (dx, dy, seg) in ((0, -1, [(X, Y), (X + 31, Y)]), (0, 1, [(X, Y + 31), (X + 31, Y + 31)]), (-1, 0, [(X, Y), (X, Y + 31)]), (1, 0, [(X + 31, Y), (X + 31, Y + 31)])):
                if k[y + dy, x + dx] == 8: d.line(seg, fill=edge + (230,), width=2)
    # old paving on some islands, glowing moss on others
    nn = vnoise(m.h, m.w, 5, m.seed + 11)
    for y in range(m.h):
        for x in range(m.w):
            if k[y, x] != 7 or (x, y) in br: continue
            X, Y = x * T, y * T
            if nn[y, x] > .62: d.rectangle([X + 1, Y + 1, X + 30, Y + 30], outline=tuple(int(v * 1.25) for v in fl) + (255,), width=1); d.line([(X + 1, Y + 16), (X + 30, Y + 16)], fill=tuple(int(v * .8) for v in fl) + (255,))
            elif nn[y, x] < .3 and rs.rand() < .5:
                c = hexc(th['rune'][0]); d.ellipse([X + rs.randint(0, 16), Y + rs.randint(0, 16), X + rs.randint(16, 32), Y + rs.randint(16, 32)], fill=tuple(int(v * .45) for v in c) + (255,))
    # bridges of light
    bc = th['bridge']
    gl = Image.new('RGBA', cv.size, (0, 0, 0, 0)); gd = ImageDraw.Draw(gl)
    for (x, y) in br:
        X, Y = x * T, y * T; gd.rectangle([X - 2, Y - 2, X + 33, Y + 33], fill=bc + (70,))
    cv.alpha_composite(gl.filter(ImageFilter.GaussianBlur(6))); d = ImageDraw.Draw(cv)
    for (x, y) in br:
        X, Y = x * T, y * T
        horiz = (k[y, x - 1] == 7 or k[y, x + 1] == 7) and not (k[y - 1, x] == 7 and k[y + 1, x] == 7)
        d.rectangle([X, Y, X + 31, Y + 31], fill=(20, 24, 40, 255))
        if horiz:
            d.rectangle([X, Y + 6, X + 31, Y + 25], fill=bc + (150,)); d.line([(X, Y + 6), (X + 31, Y + 6)], fill=(255, 255, 255, 255)); d.line([(X, Y + 25), (X + 31, Y + 25)], fill=(255, 255, 255, 255))
            for i in range(0, 32, 8): d.line([(X + i, Y + 8), (X + i, Y + 23)], fill=bc + (255,))
        else:
            d.rectangle([X + 6, Y, X + 25, Y + 31], fill=bc + (150,)); d.line([(X + 6, Y), (X + 6, Y + 31)], fill=(255, 255, 255, 255)); d.line([(X + 25, Y), (X + 25, Y + 31)], fill=(255, 255, 255, 255))
            for i in range(0, 32, 8): d.line([(X + 8, Y + i), (X + 23, Y + i)], fill=bc + (255,))
    return cv

# ---- the Underdeep: 110x80 — arrivals from the four gate pockets at the edges, dungeon portals around the middle,
#      murals on three islands, and the Sovereign's island at the very bottom of everything
UD = [('hub', 55, 38, 9, 6), ('n', 55, 9, 7, 4.5), ('e', 99, 38, 6.5, 5), ('s', 55, 70, 7, 4.5), ('w', 10, 38, 6.5, 5),
      ('fang', 34, 22, 5.5, 3.8), ('cinder', 76, 22, 5.5, 3.8), ('shrine', 76, 55, 5.5, 3.8), ('vault', 34, 55, 5.5, 3.8),
      ('m1', 22, 10, 5, 3.5), ('m2', 90, 10, 5, 3.5), ('m3', 90, 66, 5, 3.5), ('gar', 20, 67, 6, 4), ('sov', 55, 54, 6, 3.5), ('lore', 68, 9, 3.5, 2.6), ('c1', 42, 9, 3.5, 2.6)]
ULINK = [('hub', 'fang'), ('hub', 'cinder'), ('hub', 'shrine'), ('hub', 'vault'), ('fang', 'n'), ('cinder', 'e'), ('shrine', 's'), ('vault', 'w'), ('n', 'c1'), ('c1', 'm1'), ('n', 'lore'), ('lore', 'm2'),
         ('e', 'm2'), ('s', 'm3'), ('e', 'm3'), ('w', 'gar'), ('s', 'gar'), ('hub', 'sov'), ('w', 'm1')]
def underdeep():
    m = void_map('ud_deep', 110, 80, 4242, UD, ULINK, 'deep'); I = m.data['islands']
    keep = set()
    P = lambda n, dx=0, dy=0: [I[n][0] + dx, I[n][1] + dy]
    d = {'start': P('hub', 0, 2), 'arrive': {'n': P('n', 0, 1), 'e': P('e', -1, 0), 's': P('s', 0, -1), 'w': P('w', 1, 0)},
         'pocket': {'n': P('n', 0, -2), 'e': P('e', 2, 0), 's': P('s', 0, 2), 'w': P('w', -2, 0)},
         'dun': {'d_fang': P('fang', 0, -1), 'd_cinder': P('cinder', 0, -1), 'd_shrine': P('shrine', 0, -1), 'd_vault': P('vault', 0, -1)},
         'murals': [P('m1', 0, -1), P('m2', 0, -1), P('m3', 0, -1)], 'sovereign': P('sov', 0, -1), 'gar': P('gar'), 'lore': P('lore'), 'well': P('hub', 0, -2)}
    for v in [d['start'], *d['arrive'].values(), *d['pocket'].values(), *d['dun'].values(), *d['murals'], d['sovereign'], d['gar'], d['lore'], d['well']]:
        for t in around(v[0], v[1], 1, 1): keep.add(t)
    ch = [P('m1', 3, 1), P('m2', -3, 1), P('m3', 3, 1), P('gar', -2, 1), P('gar', 3, 0), P('c1', 0, 0), P('hub', 6, 2), P('sov', 4, 1)]
    for c in ch: m.chest(c[0], c[1]); keep |= set(around(c[0], c[1]))
    void_props(m, keep)
    for (x, y) in [P('hub', -6, -2), P('hub', 6, -2), P('hub', -6, 3), P('hub', 6, 3)]: m.props.append({'k': 'fc_dfang_pillar', 'x': x, 'y': y}); m.col[y, x] = 1
    for mx in d['murals']: m.props.append({'k': 'fc_w_mural', 'x': mx[0], 'y': mx[1] - 1}); m.col[mx[1] - 1, mx[0] - 2:mx[0] + 3] = 1
    m.props.append({'k': 'fc_n_statue', 'x': d['sovereign'][0], 'y': d['sovereign'][1] - 1}); m.col[d['sovereign'][1] - 1, d['sovereign'][0]] = 1
    m.data['deep'] = d
    return m

# ---- four Gate pockets, one per forest: 60x44, each its own sky
POCKET = {
  'n': [('base', 30, 37, 7, 4), ('g1', 12, 26, 5.5, 3.6), ('g2', 48, 26, 5.5, 3.6), ('mid', 30, 22, 6, 4), ('top', 30, 7, 6.5, 3.8), ('deep', 52, 8, 4.5, 3), ('side', 9, 10, 4.5, 3)],
  'e': [('base', 30, 37, 7, 4), ('g1', 10, 30, 5.5, 3.6), ('g2', 50, 30, 5.5, 3.6), ('mid', 30, 21, 7, 4), ('top', 30, 7, 6.5, 3.8), ('deep', 8, 10, 4.5, 3), ('side', 52, 11, 4.5, 3)],
  's': [('base', 30, 37, 7, 4), ('g1', 14, 24, 5.5, 3.6), ('g2', 46, 24, 5.5, 3.6), ('mid', 30, 19, 5, 3.5), ('top', 30, 6, 6.5, 3.6), ('deep', 51, 36, 4.5, 3), ('side', 9, 36, 4.5, 3)],
  'w': [('base', 30, 37, 7, 4), ('g1', 11, 22, 5.5, 3.6), ('g2', 49, 22, 5.5, 3.6), ('mid', 30, 24, 5, 3.5), ('top', 30, 7, 6.5, 3.8), ('deep', 51, 7, 4.5, 3), ('side', 9, 7, 4.5, 3)]}
PLINK = [('base', 'g1'), ('base', 'g2'), ('base', 'mid'), ('mid', 'top'), ('g1', 'side'), ('g2', 'deep'), ('top', 'side'), ('top', 'deep')]
def pocket(b):
    m = void_map('fc_rift_' + b, 60, 44, 900 + ord(b), POCKET[b], PLINK, b); I = m.data['islands']
    P = lambda n, dx=0, dy=0: [I[n][0] + dx, I[n][1] + dy]
    R = {'start': P('base', 0, 1), 'exit': P('base', 0, 3), 'guards': [P('g1'), P('g2'), P('mid'), P('top', 0, 2)], 'chest': P('top', 0, -1), 'deep': P('deep'), 'mural': P('side', 0, -1)}
    while m.k[R['exit'][1], R['exit'][0]] != 7: R['exit'][1] -= 1
    R['start'] = [R['exit'][0], R['exit'][1] - 1]
    keep = set()
    for v in [R['start'], R['exit'], R['chest'], R['deep'], R['mural'], *R['guards']]: keep |= set(around(v[0], v[1], 1, 1))
    void_props(m, keep, .09, .02)
    mx = R['mural']; m.props.append({'k': 'fc_w_mural', 'x': mx[0], 'y': mx[1] - 1}); m.col[mx[1] - 1, mx[0] - 2:mx[0] + 3] = 1
    m.data['rift'] = R; m.data['exits'] = []
    return m

# ====================================================================== the Sunhigh Arena (Highmark)
def arena():
    W, H = 56, 44; m = M('arena', W, H, 'dun_gate', 77); m.k[:] = 8
    cx, cy, rx, ry = 28, 19, 15.5, 10.5
    for y in range(H):
        for x in range(W):
            if ((x - cx) / rx) ** 2 + ((y - cy) / ry) ** 2 <= 1: m.k[y, x] = 7
    for y in range(29, 42):
        for x in range(26, 31): m.k[y, x] = 7     # the gate tunnel
    m.col[:] = 0; m.col[m.k == 8] = 1
    m.data['arena'] = {'start': [28, 40], 'exit': [28, 41], 'master': [24, 27], 'board': [32, 27], 'center': [28, 19], 'champ': [28, 10], 'rx': rx, 'ry': ry, 'cx': cx, 'cy': cy}
    m.data['exits'] = []
    return m
def paint_arena(m):
    W, H = m.w * T, m.h * T; rs = np.random.RandomState(9); A = m.data['arena']; cx, cy = A['cx'] * T + 16, A['cy'] * T + 16; RX, RY = A['rx'] * T, A['ry'] * T
    cv = Image.new('RGBA', (W, H), (40, 32, 26, 255)); d = ImageDraw.Draw(cv)
    # the bowl: tiers of stone seating rising outward, full of people
    tiers = 9
    for i in range(tiers, -1, -1):
        f = 1 + (i + 1) * .13
        col = (150 - i * 6, 132 - i * 6, 108 - i * 6) if i % 2 == 0 else (128 - i * 6, 112 - i * 6, 92 - i * 6)
        d.ellipse([cx - RX * f - 20, cy - RY * f - 16, cx + RX * f + 20, cy + RY * f + 16], fill=col + (255,), outline=(70, 56, 44, 255), width=3)
    # the crowd: heads and shoulders on every tier (they animate in the game, this is the painted base)
    pal = [(196, 64, 52), (52, 96, 176), (220, 180, 60), (70, 140, 80), (230, 220, 200), (150, 80, 160), (200, 120, 60), (90, 60, 40), (240, 200, 160), (180, 160, 140)]
    skin = [(236, 196, 160), (196, 150, 110), (150, 100, 70), (110, 70, 50)]
    for i in range(tiers):
        f = 1 + (i + .6) * .13; rxx, ryy = RX * f + 14, RY * f + 10
        n = int(2 * math.pi * rxx / 11)
        for j in range(n):
            a = 2 * math.pi * j / n + rs.rand() * .05
            if abs(math.sin(a) - 1) < .08 and abs(math.cos(a)) < .12: continue   # the gate gap at the bottom
            x, y = cx + math.cos(a) * rxx, cy + math.sin(a) * ryy
            if y > cy + RY * .9 and abs(x - cx) < 90: continue
            if rs.rand() < .1: continue
            c = pal[rs.randint(len(pal))]; s = skin[rs.randint(len(skin))]
            d.rectangle([x - 4, y - 2, x + 4, y + 6], fill=c + (255,)); d.ellipse([x - 3, y - 8, x + 3, y - 2], fill=s + (255,))
            if rs.rand() < .3: d.rectangle([x - 3, y - 9, x + 3, y - 7], fill=pal[rs.randint(len(pal))] + (255,))
    # the royal box at the top, and banners all round the rim
    bx, by = cx, cy - RY * 1.62
    d.rectangle([bx - 70, by - 30, bx + 70, by + 18], fill=(110, 30, 30, 255), outline=(220, 180, 70, 255), width=3)
    d.polygon([(bx - 80, by - 30), (bx + 80, by - 30), (bx, by - 64)], fill=(150, 40, 40, 255), outline=(220, 180, 70, 255))
    d.ellipse([bx - 12, by - 52, bx + 12, by - 28], fill=(240, 200, 80, 255))
    for j in range(16):
        a = 2 * math.pi * j / 16; x, y = cx + math.cos(a) * (RX * 1.62), cy + math.sin(a) * (RY * 1.62)
        if y > cy + RY * 1.4 and abs(x - cx) < 140: continue
        d.line([(x, y - 46), (x, y + 4)], fill=(80, 60, 40, 255), width=3); d.rectangle([x + 2, y - 46, x + 26, y - 18], fill=[(200, 40, 40), (40, 80, 180), (230, 190, 60)][j % 3] + (255,)); d.ellipse([x + 9, y - 39, x + 19, y - 29], fill=(250, 240, 220, 255))
    # the sand: raked, scuffed, a few dark patches
    sand = Image.new('RGBA', (W, H), (0, 0, 0, 0)); sd = ImageDraw.Draw(sand)
    sd.ellipse([cx - RX - 8, cy - RY - 6, cx + RX + 8, cy + RY + 6], fill=(214, 180, 120, 255))
    sd.rectangle([26 * T - 6, 28 * T, 31 * T + 6, H], fill=(196, 164, 110, 255))
    cv.alpha_composite(sand); d = ImageDraw.Draw(cv)
    n = vnoise(H, W, 18, 5); arr = np.array(cv).astype(float); sm = (arr[..., 0] > 190) & (arr[..., 1] > 150) & (arr[..., 2] > 90) & (arr[..., 2] < 140)
    arr[sm, :3] *= (.9 + .2 * n[sm])[:, None]; cv = Image.fromarray(np.clip(arr, 0, 255).astype(np.uint8)); d = ImageDraw.Draw(cv)
    for i in range(1, 7): d.ellipse([cx - RX * i / 7, cy - RY * i / 7, cx + RX * i / 7, cy + RY * i / 7], outline=(196, 160, 104, 255), width=1)
    for _ in range(14): x, y = cx + rs.randint(-int(RX * .7), int(RX * .7)), cy + rs.randint(-int(RY * .6), int(RY * .6)); d.ellipse([x - rs.randint(8, 20), y - 6, x + rs.randint(8, 20), y + 6], fill=(150, 110, 80, 120))
    d.ellipse([cx - 40, cy - 24, cx + 40, cy + 24], outline=(170, 40, 40, 255), width=3)
    # the gate arch
    gx = 28 * T + 16; d.rectangle([gx - 92, 29 * T - 10, gx - 78, 33 * T], fill=(120, 100, 80, 255)); d.rectangle([gx + 78, 29 * T - 10, gx + 92, 33 * T], fill=(120, 100, 80, 255)); d.rectangle([gx - 92, 29 * T - 26, gx + 92, 29 * T - 8], fill=(140, 118, 92, 255), outline=(70, 56, 44, 255), width=2)
    return cv

# ====================================================================== the four forest dungeons, rebuilt (98x68)
def dungeon3(key, biome, seed):
    W_, H_ = 98, 68; CX = W_ // 2 - 1
    m = M(key, W_, H_, biome, seed); m.k[:] = 8; rng = m.rng
    def room(x0, y0, x1, y1): m.k[y0:y1 + 1, x0:x1 + 1] = 7
    def hall(a, b, r=.9):
        (x0, y0), (x1, y1) = a, b
        if rng.random() < .5: m.line([(x0, y0), (x1, y0), (x1, y1)], r, 7)
        else: m.line([(x0, y0), (x0, y1), (x1, y1)], r, 7)
    lair = (CX - 12, 2, CX + 12, 14); room(*lair)
    ent = (CX - 6, H_ - 11, CX + 6, H_ - 5); room(*ent); m.k[H_ - 4, CX:CX + 2] = 7
    rooms = []
    for r in range(4):
        for c in range(5):
            if r == 3 and c == 2: continue
            cx0, cy0 = 9 + c * 16, 17 + r * 10
            w, h = rng.randint(9, 13), rng.randint(5, 8)
            x0 = cx0 + rng.randint(0, 14 - w); y0 = cy0 + rng.randint(0, 9 - h)
            rooms.append([x0, y0, x0 + w - 1, y0 + h - 1])
    # set pieces: the GREAT HALL (a long pillared room across the middle) and the GALLERY (murals of the old days)
    great = [CX - 13, 33, CX + 13, 40]
    rooms = [R for R in rooms if not (R[0] <= great[2] and R[2] >= great[0] and R[1] <= great[3] and R[3] >= great[1])]
    rooms.append(great); gi = len(rooms) - 1
    for R in rooms: room(*R)
    ctr = lambda R: ((R[0] + R[2]) // 2, (R[1] + R[3]) // 2)
    inner = list(range(len(rooms)))
    gal = min([i for i in inner if i != gi], key=lambda i: abs(ctr(rooms[i])[0] - 20) + abs(ctr(rooms[i])[1] - 22))
    nodes = inner + ['lair', 'ent']
    P = lambda n: ctr(rooms[n]) if isinstance(n, int) else (ctr(lair) if n == 'lair' else ctr(ent))
    conn = {nodes[-1]}; left = set(nodes[:-1]); edges = []
    while left:
        a, b = min(((a, b) for a in conn for b in left), key=lambda e: abs(P(e[0])[0] - P(e[1])[0]) + abs(P(e[0])[1] - P(e[1])[1]))
        edges.append((a, b)); conn.add(b); left.remove(b)
    for _ in range(4):
        a, b = rng.sample(inner, 2)
        if (a, b) not in edges: edges.append((a, b))
    for a, b in edges: hall(P(a), P(b), .9 if rng.random() < .55 else 1.4)
    ys = rng.sample([18, 30, 44], 3)
    specials = [[1, ys[0], 6, ys[0] + 5], [W_ - 7, ys[1], W_ - 2, ys[1] + 5], [W_ - 7 if abs(ys[2] - ys[1]) > 7 else 1, ys[2], W_ - 2 if abs(ys[2] - ys[1]) > 7 else 6, ys[2] + 5]]
    if specials[2][0] == 1 and abs(ys[2] - ys[0]) <= 7: specials[2] = [W_ - 7, H_ - 16, W_ - 2, H_ - 11]
    for R in specials: room(*R)
    def link(R):
        c = ctr(R); n = min(inner, key=lambda j: abs(P(j)[0] - c[0]) + abs(P(j)[1] - c[1]))
        before = m.k.copy(); m.line([c, (P(n)[0], c[1]), P(n)], .6, 7)
        inR = lambda x, y: R[0] <= x <= R[2] and R[1] <= y <= R[3]
        new = lambda x, y: m.k[y, x] == 7 and before[y, x] == 8
        oldfloor = lambda x, y: before[y, x] == 7 and not inR(x, y)
        seen = {c: 0}; q = deque([c]); door = None
        while q:
            x, y = q.popleft()
            if not inR(x, y) and any(oldfloor(x + dx, y + dy) for dx, dy in ((1, 0), (-1, 0), (0, 1), (0, -1))):
                if door is None or seen[(x, y)] < seen[door]: door = (x, y)
                continue
            for dx, dy in ((1, 0), (-1, 0), (0, 1), (0, -1)):
                t = (x + dx, y + dy)
                if t not in seen and 0 < t[0] < W_ - 1 and 0 < t[1] < H_ - 1 and (inR(*t) or new(*t)): seen[t] = seen[(x, y)] + 1; q.append(t)
        return door, list(seen)
    lever = min([i for i in inner if i not in (gi, gal)], key=lambda i: abs(ctr(rooms[i])[0] - CX) + abs(ctr(rooms[i])[1] - 26))
    clue = max([i for i in inner if i != gi], key=lambda i: abs(ctr(rooms[i])[0] - ctr(rooms[lever])[0]) + abs(ctr(rooms[i])[1] - ctr(rooms[lever])[1]))
    secretR, VR = specials[:2], specials[2]
    data = {'cracks': [], 'secret': [], 'gate': None, 'levers': [], 'clue': None, 'relic': None, 'theme': key, 'regions': []}
    for R in secretR: d_, reg = link(R); data['cracks'].append(d_); data['regions'].append(reg)
    d_, reg = link(VR); data['gate'] = d_; data['regions'].append(reg)
    m.k[H_ - 3:, :] = 8; m.k[:, 0] = 8; m.k[:, W_ - 1] = 8; m.k[0, :] = 8
    m.col[:] = 0; m.col[m.k == 8] = 1
    for reg in data['regions']:
        for (x, y) in reg: m.col[y, x] = 1
    LR = rooms[lever]; xs = [LR[0] + 1 + j * max(2, (LR[2] - LR[0] - 2) // 2) for j in range(3)]
    for sym, x in zip(['sun', 'moon', 'star'], xs): data['levers'].append({'x': x, 'y': LR[1], 'sym': sym})
    CR = rooms[clue]; data['clue'] = [(CR[0] + CR[2]) // 2, CR[1] - 1]
    data['relic'] = [ctr(VR)[0], VR[1] + 1]
    for j, SR in enumerate(secretR): data['secret'].append({'x': ctr(SR)[0], 'y': ctr(SR)[1], 'i': j})
    GR = rooms[gal]; gx = (GR[0] + GR[2]) // 2; data['mural'] = [gx, GR[1]]   # stand here, face the wall
    start = (CX, H_ - 5)
    taken = {tuple(data['relic']), (ctr(lair)[0], 5), (ctr(lair)[0], 6), start, (CX, H_ - 4)} | {(L['x'], L['y']) for L in data['levers']} | {(data['clue'][0], data['clue'][1] + 1)} | {(s['x'], s['y']) for s in data['secret']} | {(gx + dx, GR[1] + dy) for dx in (-3, -2, -1, 0, 1, 2, 3) for dy in (0, 1)}
    chests = []
    def free_in(R, n):
        out = []
        for _ in range(80):
            x, y = rng.randint(R[0], R[2]), rng.randint(R[1], R[3])
            if (x, y) in taken or m.k[y, x] != 7 or m.col[y, x] or any(abs(x - a) + abs(y - b) < 3 for a, b in out): continue
            out.append((x, y)); taken.add((x, y)); taken.add((x, y + 1)); taken.add((x, y - 1))
            if len(out) == n: break
        return out
    # the great hall's pillars come first so nothing lands on them
    G_ = rooms[gi]
    for x in range(G_[0] + 2, G_[2] - 1, 4):
        for y in (G_[1] + 1, G_[3] - 1): taken.add((x, y)); m.col[y, x] = 1
    for i in inner: chests += free_in(rooms[i], 1 + (rng.random() < .5))
    for SR in secretR: chests += free_in(SR, 2)
    chests += free_in(VR, 3)
    lairc = [ctr(lair)[0] + 5, lair[1] + 1]; chests.append(tuple(lairc)); taken.add(tuple(lairc))
    torches = []
    for R in [lair, ent] + rooms + specials:
        for x in (R[0] + 1, R[2] - 1):
            if (x, R[1]) not in taken and m.k[R[1] - 1, x] == 8: torches.append([x, R[1]]); taken.add((x, R[1]))
    gather = [list(t) for i in inner[:4] for t in free_in(rooms[i], 1)]
    m.data['dungeon'] = {'start': list(start), 'exit': [CX, H_ - 4], 'boss': [ctr(lair)[0], 6], 'bossRoom': list(lair), 'chests': [list(c) for c in chests], 'gather': gather, 'torches': torches}
    m.data['dx'] = data
    t = {'dun_e': 'dcinder', 'dun_n': 'dfang'}.get(biome)
    keep = set(taken) | {(x, y) for (x, y) in data['cracks'] + [data['gate']]} | {t_ for reg in data['regions'] for t_ in reg}
    for (x, y) in list(keep): keep |= {(x + dx, y + dy) for dx in (-1, 0, 1) for dy in (-1, 0, 1)}
    m.data['lava'] = []
    SETS = {'dcinder': (['fc_dcinder_pillar'], ['fc_dcinder_bones'], ['fc_dcinder_coal', 'fc_dcinder_rubble'], 'fc_dcinder_throne'),
            'dfang': (['fc_dfang_pillar', 'fc_dfang_pillar2'], ['fc_dfang_bones', 'fc_dfang_antlers', 'fc_dfang_nest'], ['fc_dfang_crystal1', 'fc_dfang_crystal2', 'fc_dfang_crystal3', 'fc_dfang_stalag1', 'fc_dfang_stalag2', 'fc_dfang_stalag3', 'fc_dfang_rock1'], 'fc_dfang_altar'),
            'dun_s': (['fc_dfang_pillar2'], ['fc_s_mush1', 'fc_s_mush2', 'fc_s_moss'], ['fc_s_rock1', 'fc_s_rock2', 'fc_s_rock3', 'fc_s_mush3'], 'fc_s_statue'),
            'dun_w': (['fc_dfang_pillar'], ['fc_dfang_bones'], ['fc_w_rock1', 'fc_w_rock2', 'fc_dfang_rock1'], 'fc_w_statue')}
    pil, soft, hard, boss = SETS[t or biome]
    bx = ctr(lair)[0]; m.props.append({'k': boss, 'x': bx, 'y': 3})
    for x in range(bx - 3, bx + 4): m.col[3, x] = 1; keep.add((x, 3))
    for (x, y) in [(lair[0] + 2, 6), (lair[2] - 2, 6), (lair[0] + 2, 11), (lair[2] - 2, 11)]: m.props.append({'k': rng.choice(pil), 'x': x, 'y': y}); m.col[y, x] = 1; keep.add((x, y))
    for x in range(G_[0] + 2, G_[2] - 1, 4):
        for y in (G_[1] + 1, G_[3] - 1): m.props.append({'k': rng.choice(pil), 'x': x, 'y': y})
    for dx in (-2, 2): m.props.append({'k': 'fc_w_mural', 'x': gx + dx * 2, 'y': GR[1] - 1})   # the gallery wall
    for y in range(1, H_ - 1):
        for x in range(1, W_ - 1):
            if m.k[y, x] != 7 or (x, y) in keep or m.col[y, x]: continue
            n8 = sum(m.k[y + dy, x + dx] == 7 for dx in (-1, 0, 1) for dy in (-1, 0, 1)) - 1
            wallnear = m.k[y - 1, x] == 8 or m.k[y + 1, x] == 8 or m.k[y, x - 1] == 8 or m.k[y, x + 1] == 8
            r = rng.random()
            if wallnear and n8 >= 5 and r < .11: m.props.append({'k': rng.choice(hard), 'x': x, 'y': y}); m.col[y, x] = 1
            elif n8 == 8 and r < .035: m.props.append({'k': rng.choice(soft), 'x': x, 'y': y})
            elif t == 'dcinder' and n8 == 8 and r < .045: m.data['lava'].append((x, y)); m.col[y, x] = 1
    return m

# ====================================================================== build & merge
maps = json.load(open(REPO + '/assets/maps.json'))
src = open(REPO + '/js/fc_data.js').read(); hdr, body = src.split('const FCL = ', 1); FCL = json.loads(body.strip().rstrip(';'))
ch = json.load(open(REPO + '/assets/chests.json'))
def save_map(key, m, img, mm=None, extra=None):
    img.convert('RGB').save(f'{REPO}/assets/map_{key}.webp', 'WEBP', quality=84, method=6)
    ver = hashlib.md5(open(f'{REPO}/assets/map_{key}.webp', 'rb').read()).hexdigest()[:8]
    e = {'w': m.w, 'h': m.h, 'col': [''.join(str(int(v)) for v in row) for row in m.col], 'props': m.props, 'grass': [], 'ext': 'webp', 'v': ver, 'fc': 1, 'mm': mm or minimap_rows(m)}
    if extra: e.update(extra)
    maps[key] = e
import sys
WHICH = sys.argv[1:] or ['deep', 'pockets', 'arena', 'dungeons']
if 'deep' in WHICH:
    m = underdeep(); save_map('ud_deep', m, paint_void(m)); FCL['ud_deep'] = {k: v for k, v in m.data.items() if k not in ('grass',)}; FCL['ud_deep'].setdefault('exits', []); ch['ud_deep'] = m.data['chests']; ch['ent_ud_deep'] = []; print('underdeep ok', len(m.props))
if 'pockets' in WHICH:
    for b in 'nesw':
        m = pocket(b); save_map('fc_rift_' + b, m, paint_void(m)); FCL['fc_rift_' + b] = {k: v for k, v in m.data.items() if k != 'grass'}; ch['fc_rift_' + b] = []; print('pocket', b, len(m.props))
if 'arena' in WHICH:
    m = arena(); save_map('arena', m, paint_arena(m)); FCL['arena'] = {k: v for k, v in m.data.items() if k != 'grass'}; ch['arena'] = []; print('arena ok')
if 'dungeons' in WHICH:
    for key, b, s in [('d_fang', 'dun_n', 21), ('d_cinder', 'dun_e', 22), ('d_shrine', 'dun_s', 23), ('d_vault', 'dun_w', 24)]:
        m = dungeon3(key, b, s); dx = m.data['dx']; dx.update({k: v for k, v in LT.THEME[key].items()})
        kfull = m.k.copy(); full = paint_dungeon(m)
        for reg in dx['regions']:
            for (x, y) in reg: m.k[y, x] = 8
        img = paint_dungeon(m); mm_rows = minimap_rows(m); m.k[:] = kfull
        dr = ImageDraw.Draw(img)
        for (x, y) in dx['cracks']:
            X, Y = x * 32, y * 32
            dr.line([X + 15, Y + 4, X + 12, Y + 13, X + 17, Y + 19, X + 14, Y + 28], fill=(14, 12, 10), width=1); dr.line([X + 12, Y + 13, X + 7, Y + 16], fill=(14, 12, 10), width=1)
        dx['art'] = []
        for i, reg in enumerate(dx['regions']):
            tiles = set(reg)
            for (x, y) in reg:
                for up in (1, 2):
                    if y - up >= 0 and kfull[y - up, x] == 8: tiles.add((x, y - up))
            xs = [t[0] for t in tiles]; ys = [t[1] for t in tiles]; x0, y0, x1, y1 = min(xs), min(ys), max(xs) + 1, max(ys) + 1
            crop = full.crop((x0 * 32, y0 * 32, x1 * 32, y1 * 32)).convert('RGBA'); a = Image.new('L', crop.size, 0); ad = ImageDraw.Draw(a)
            for (x, y) in tiles: ad.rectangle([(x - x0) * 32, (y - y0) * 32, (x - x0) * 32 + 31, (y - y0) * 32 + 31], fill=255)
            crop.putalpha(a); fn = f'{REPO}/assets/dsec_{key}_{i}.webp'; crop.save(fn, 'WEBP', quality=88, method=6)
            dx['art'].append([x0 * 32, y0 * 32, hashlib.md5(open(fn, 'rb').read()).hexdigest()[:8]])
        dun = m.data.pop('dungeon'); dun['exact'] = 1; dun['style'] = {'d_fang': 'crypt', 'd_cinder': 'warren', 'd_shrine': 'mire', 'd_vault': 'crypt'}[key]
        save_map(key, m, img, mm_rows, {'dungeon': dun})
        old = FCL.get(key, {}); FCL[key] = dict(old, dx=dx, lava=[list(t) for t in m.data['lava']])
        print(key, len(dun['chests']), 'chests', len(m.props), 'props', 'mural', dx['mural'])
json.dump(maps, open(REPO + '/assets/maps.json', 'w'), separators=(',', ':'))
open(REPO + '/js/fc_data.js', 'w').write(hdr + 'const FCL = ' + json.dumps(FCL, separators=(',', ':')) + ';\n')
json.dump(ch, open(REPO + '/assets/chests.json', 'w'), separators=(',', ':'))
