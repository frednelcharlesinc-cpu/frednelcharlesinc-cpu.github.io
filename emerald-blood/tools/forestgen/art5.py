"""THE CHRONICLE IN STONE (B): eight old frescoes that teach the past, plus battlefields for the Underdeep, the Gate
pockets and the Sunhigh Arena. Writes assets/mural_1..8.jpg (720x405) and assets/bd_underdeep / bd_rift / bd_arena.jpg (1376x768)."""
import math, random
import numpy as np
from PIL import Image, ImageDraw, ImageFilter
from gen import REPO, vnoise

MW, MH = 720, 405
PIG = dict(ochre=(196, 140, 70), red=(160, 60, 44), blue=(60, 96, 140), green=(70, 130, 80), emer=(60, 200, 120), black=(46, 38, 34), cream=(226, 208, 170), gold=(214, 170, 70), skin=(186, 130, 90), purple=(110, 70, 140), grey=(120, 112, 100))

def plaster(seed):
    n = vnoise(MH, MW, 60, seed); n2 = np.random.RandomState(seed).rand(MH, MW)
    base = np.array([214, 196, 158], float) * (.88 + .18 * n[..., None]) + (n2[..., None] - .5) * 10
    return Image.fromarray(np.clip(base, 0, 255).astype(np.uint8)).convert('RGBA')
def person(d, x, y, s=1.0, col=PIG['red'], eyes=None, arms='down', shield=False, spear=False, kneel=False):
    h = 68 * s; hw = 9 * s
    if kneel: y += 10 * s; h *= .75
    d.polygon([(x - hw, y - h * .62), (x + hw, y - h * .62), (x + hw * 1.5, y), (x - hw * 1.5, y)], fill=col)
    d.ellipse([x - 8 * s, y - h * .62 - 17 * s, x + 8 * s, y - h * .62 - 1 * s], fill=PIG['skin'])
    if eyes: d.rectangle([x + 1 * s, y - h * .62 - 12 * s, x + 6 * s, y - h * .62 - 9 * s], fill=eyes)
    ay = y - h * .55
    if arms == 'up': d.line([(x - hw, ay), (x - hw * 2, ay - 18 * s)], fill=PIG['skin'], width=max(2, int(3 * s))); d.line([(x + hw, ay), (x + hw * 2, ay - 18 * s)], fill=PIG['skin'], width=max(2, int(3 * s)))
    elif arms == 'fwd': d.line([(x + hw, ay), (x + hw * 2.6, ay + 2)], fill=PIG['skin'], width=max(2, int(3 * s)))
    else: d.line([(x - hw, ay), (x - hw * 1.3, ay + 16 * s)], fill=PIG['skin'], width=max(2, int(3 * s))); d.line([(x + hw, ay), (x + hw * 1.3, ay + 16 * s)], fill=PIG['skin'], width=max(2, int(3 * s)))
    if shield: d.ellipse([x + hw * .4, ay - 6 * s, x + hw * .4 + 16 * s, ay + 18 * s], fill=PIG['gold'], outline=PIG['black'])
    if spear: d.line([(x - hw * 1.6, y + 2), (x - hw * 1.6, y - h * 1.25)], fill=PIG['black'], width=max(1, int(2 * s)))
def dragon(d, x, y, s=1.0, col=PIG['black'], eye=PIG['emer'], flip=False):
    f = -1 if flip else 1
    body = [(x - 60 * s * f, y + 10 * s), (x - 20 * s * f, y - 8 * s), (x + 30 * s * f, y - 4 * s), (x + 60 * s * f, y - 22 * s), (x + 76 * s * f, y - 18 * s), (x + 62 * s * f, y - 8 * s), (x + 34 * s * f, y + 10 * s), (x - 10 * s * f, y + 14 * s)]
    d.polygon(body, fill=col)
    d.polygon([(x - 10 * s * f, y - 4 * s), (x + 10 * s * f, y - 70 * s), (x + 30 * s * f, y - 40 * s), (x + 50 * s * f, y - 66 * s), (x + 34 * s * f, y - 2 * s)], fill=col)
    d.polygon([(x - 60 * s * f, y + 10 * s), (x - 96 * s * f, y + 26 * s), (x - 70 * s * f, y + 4 * s)], fill=col)
    d.ellipse([x + 64 * s * f - 3 * s, y - 20 * s, x + 64 * s * f + 3 * s, y - 15 * s], fill=eye)
def age(im, seed):
    rs = np.random.RandomState(seed); arr = np.array(im).astype(float)
    n = vnoise(MH, MW, 25, seed + 1); arr[..., :3] = arr[..., :3] * (.82 + .25 * n[..., None]) + (1 - .82 - .25 * n[..., None]) * np.array([214, 196, 158])
    im = Image.fromarray(np.clip(arr, 0, 255).astype(np.uint8)); d = ImageDraw.Draw(im)
    for _ in range(7):   # flaked-off plaster
        x, y = rs.randint(0, MW), rs.randint(0, MH); r = rs.randint(5, 16)
        d.polygon([(x + rs.randint(-r, r), y + rs.randint(-r, r)) for _ in range(6)], fill=(222, 210, 180, 255))
    for _ in range(7):    # cracks
        x, y = rs.randint(0, MW), rs.randint(0, MH); pts = [(x, y)]
        for _ in range(rs.randint(4, 9)): x += rs.randint(-30, 30); y += rs.randint(-6, 26); pts.append((x, y))
        d.line(pts, fill=(90, 74, 56, 255), width=1)
    y_, x_ = np.mgrid[0:MH, 0:MW]; dd = np.sqrt(((x_ - MW / 2) / (MW / 2)) ** 2 + ((y_ - MH / 2) / (MH / 2)) ** 2)
    a = np.clip((dd - .7) * .9, 0, .5); arr = np.array(im).astype(float); arr[..., :3] *= (1 - a[..., None]); return Image.fromarray(arr.astype(np.uint8))
def frame(d):
    d.rectangle([0, 0, MW - 1, MH - 1], outline=PIG['red'], width=14); d.rectangle([14, 14, MW - 15, MH - 15], outline=PIG['ochre'], width=4)
    for x in range(20, MW - 20, 24):   # a meander band along the top and bottom
        for y0 in (2, MH - 12): d.line([(x, y0 + 2), (x + 10, y0 + 2), (x + 10, y0 + 8), (x + 4, y0 + 8)], fill=PIG['cream'], width=2)

def mural(i):
    im = plaster(100 + i); d = ImageDraw.Draw(im); rs = random.Random(i)
    G = 300   # ground line
    d.rectangle([20, G, MW - 20, MH - 20], fill=PIG['ochre'] + (90,))
    if i == 1:   # THE FIRST DAWN: people and dragons under one sun
        d.ellipse([310, 40, 410, 140], fill=PIG['gold']); [d.line([(360, 90), (360 + math.cos(a) * 90, 90 + math.sin(a) * 90)], fill=PIG['gold'], width=3) for a in np.linspace(0, 6.28, 18)]
        d.polygon([(20, G), (160, 150), (300, G)], fill=PIG['blue']); d.polygon([(420, G), (580, 170), (700, G)], fill=PIG['blue'])
        for x in range(90, 640, 70): person(d, x, G + 50, .9, rs.choice([PIG['red'], PIG['green'], PIG['blue']]), arms='up')
        dragon(d, 200, 170, .55, PIG['green']); dragon(d, 520, 150, .5, PIG['red'], flip=True)
    elif i == 2:   # THE SHIELD OF GREEN: the Drags stand between the people and the dragon
        dragon(d, 360, 150, 1.5, PIG['black'], (220, 40, 40))
        for x in range(60, 300, 46): person(d, x, G + 60, .8, PIG['grey'], arms='up', kneel=True)
        for x in range(330, 680, 52): person(d, x, G + 56, 1.1, PIG['green'], eyes=PIG['emer'], shield=True, spear=True)
    elif i == 3:   # FRATENAPTOR RISES: the dragon over burning towns
        for x in range(40, 700, 90):
            d.rectangle([x, G - 40, x + 50, G + 20], fill=PIG['cream']); d.polygon([(x - 6, G - 40), (x + 56, G - 40), (x + 25, G - 70)], fill=PIG['red'])
            for j in range(5): d.polygon([(x + 5 + j * 9, G - 40), (x + 9 + j * 9, G - 75 - rs.randint(0, 30)), (x + 13 + j * 9, G - 40)], fill=(220, 110, 40))
        dragon(d, 360, 140, 2.0, PIG['black'], PIG['emer'])
        d.ellipse([330, 50, 400, 120], outline=(220, 40, 40), width=3)
    elif i == 4:   # THE BINDING: seven wardens chain the dragon into the earth
        dragon(d, 360, 230, 1.3, PIG['black'], PIG['emer'])
        for j, x in enumerate(range(70, 680, 92)):
            person(d, x, G + 70, .95, PIG['green'], eyes=PIG['emer'], arms='fwd')
            d.line([(x + 18, G + 40), (360 + (j - 3) * 30, 220)], fill=PIG['grey'], width=3)
        d.line([(40, G + 4), (680, G + 4)], fill=PIG['black'], width=3)
    elif i == 5:   # THE ACCORD: lords sign at a long table; Drags in chains below
        d.rectangle([140, 150, 580, 180], fill=PIG['black']); d.rectangle([150, 180, 160, 230], fill=PIG['black']); d.rectangle([560, 180, 570, 230], fill=PIG['black'])
        for x in range(170, 560, 60): person(d, x, 150, .9, rs.choice([PIG['purple'], PIG['red'], PIG['gold']]), arms='fwd')
        d.rectangle([330, 140, 390, 152], fill=PIG['cream'])
        for x in range(60, 680, 58): person(d, x, G + 70, .75, PIG['grey'], eyes=PIG['emer'], kneel=True); d.line([(x - 20, G + 50), (x + 38, G + 50)], fill=PIG['black'], width=2)
    elif i == 6:   # THE SCATTERING: families walk away into the trees, faces covered
        for x in range(450, 700, 40): d.polygon([(x, G + 10), (x + 22, G - 130 - rs.randint(0, 50)), (x + 44, G + 10)], fill=PIG['green'])
        for j, x in enumerate(range(60, 460, 48)): person(d, x, G + 50 - j * 4, .85 - j * .03, PIG['grey'], arms='down'); d.rectangle([x - 6, G + 50 - j * 4 - 44, x + 6, G + 50 - j * 4 - 38], fill=PIG['black'])
        d.ellipse([60, 40, 110, 90], fill=PIG['cream'])
    elif i == 7:   # THE FIRST GATE: a wound of purple light; things pour out
        for r_ in range(70, 6, -8): d.ellipse([360 - r_ * .7, 150 - r_ * 1.3, 360 + r_ * .7, 150 + r_ * 1.3], fill=tuple(int(v) for v in np.array(PIG['purple']) * (1 + (70 - r_) / 90)))
        for j in range(9): x = 260 + j * 25; yy = 210 + rs.randint(0, 50); d.ellipse([x, yy, x + 18, yy + 18], fill=PIG['black'])
        for x in (60, 120, 600, 650): person(d, x, G + 60, .9, PIG['red'], arms='up')
    elif i == 8:   # THE GREEN-EYED CHILD: a small figure holds a light; the old eye watches
        d.rectangle([20, 20, MW - 20, G], fill=PIG['blue'] + (110,))
        for x in range(60, 680, 90): d.ellipse([x, 60 + rs.randint(0, 40), x + 140, 120 + rs.randint(0, 40)], fill=PIG['cream'])
        d.ellipse([480, 70, 600, 130], fill=PIG['black']); d.ellipse([528, 88, 552, 112], fill=PIG['emer'])
        person(d, 300, G + 70, 1.15, PIG['red'], eyes=PIG['emer'], arms='up')
        for r_ in range(30, 2, -4): d.ellipse([300 - r_, 190 - r_, 300 + r_, 190 + r_], fill=(255, 240, 170, 60 + (30 - r_) * 6))
    frame(d)
    im = age(im.convert('RGB'), 200 + i)
    im.save(f'{REPO}/assets/mural_{i}.jpg', quality=86)

# ----------------------------------------------------------------- battlefields
W, H = 1376, 768; GY = int(H * .52)
def bd_void(name, sky, neb, floor, edge, bridge):
    g = np.linspace(0, 1, H)[:, None, None]; img = np.array(sky[0], float) * (1 - g) + np.array(sky[1], float) * g + np.zeros((H, W, 3))
    for i, c in enumerate(neb): n = vnoise(H, W, 240 + i * 80, 30 + i); img += np.clip((n - .45) * 2.2, 0, 1)[..., None] ** 2 * np.array(c) * .6
    st = np.random.RandomState(5).rand(H, W); img[st > .998] = [240, 240, 255]
    cv = Image.fromarray(np.clip(img, 0, 255).astype(np.uint8)).convert('RGBA'); d = ImageDraw.Draw(cv); rs = random.Random(name)
    for _ in range(9):   # distant floating islands
        x, y, w = rs.randint(0, W), rs.randint(60, GY - 80), rs.randint(60, 200); c = tuple(int(v * .6) for v in floor)
        d.ellipse([x - w, y - w * .18, x + w, y + w * .18], fill=c); d.polygon([(x - w * .9, y), (x + w * .9, y), (x + rs.randint(-20, 20), y + w * .7)], fill=tuple(int(v * .45) for v in floor))
    d.line([(0, GY - 120), (W, GY - 150)], fill=bridge + (180,), width=6)
    # the island you're fighting on
    d.polygon([(-40, GY), (W + 40, GY), (W + 40, H), (-40, H)], fill=floor)
    n = vnoise(H - GY, W, 20, 9); arr = np.array(cv).astype(float); arr[GY:, :, :3] *= (.8 + .35 * n[..., None]); cv = Image.fromarray(np.clip(arr, 0, 255).astype(np.uint8)); d = ImageDraw.Draw(cv)
    d.line([(0, GY), (W, GY)], fill=edge, width=4)
    for x in range(0, W, 140): yy = GY + 60 + rs.randint(0, 120); d.rectangle([x + rs.randint(0, 40), yy, x + 80 + rs.randint(0, 40), yy + 4], fill=tuple(int(v * .8) for v in floor))
    for _ in range(18): x, y = rs.randint(0, W), rs.randint(GY + 20, H - 10); d.rectangle([x, y, x + 3, y + 3], fill=edge)
    for x in (120, 1250):   # crystal spires at the edge of the island
        for j in range(4): d.polygon([(x + j * 22 - 10, GY + 10), (x + j * 22, GY - 90 - j * 25), (x + j * 22 + 10, GY + 10)], fill=tuple(min(255, int(v * 1.1)) for v in edge))
    cv.convert('RGB').save(f'{REPO}/assets/bd_{name}.jpg', quality=88)
def bd_arena():
    cv = Image.new('RGB', (W, H), (120, 170, 220)); d = ImageDraw.Draw(cv); rs = random.Random(3)
    for y in range(0, 190): d.line([(0, y), (W, y)], fill=(110 + y // 4, 160 + y // 6, 220))
    pal = [(196, 64, 52), (52, 96, 176), (220, 180, 60), (70, 140, 80), (230, 220, 200), (150, 80, 160), (200, 120, 60), (90, 60, 40)]; skin = [(236, 196, 160), (196, 150, 110), (150, 100, 70), (110, 70, 50)]
    for t in range(7):   # tiers rising behind the sand
        y0 = 120 + t * 40; d.rectangle([0, y0, W, y0 + 40], fill=(150 - t * 4, 130 - t * 4, 104 - t * 4)); d.line([(0, y0 + 40), (W, y0 + 40)], fill=(90, 72, 56), width=3)
        for x in range(4, W, 13):
            if rs.random() < .08: continue
            c = rs.choice(pal); s = rs.choice(skin); yy = y0 + 22 + rs.randint(-2, 2)
            d.rectangle([x - 5, yy - 2, x + 5, yy + 16], fill=c); d.ellipse([x - 4, yy - 12, x + 4, yy - 2], fill=s)
            if rs.random() < .12: d.line([(x + 4, yy - 2), (x + 8, yy - 14)], fill=s, width=2)   # a raised arm
    for x in range(60, W, 230):   # pillars + banners
        d.rectangle([x, 100, x + 26, 400], fill=(226, 214, 190)); d.rectangle([x - 6, 92, x + 32, 104], fill=(200, 188, 164))
        d.rectangle([x + 30, 110, x + 74, 190], fill=rs.choice([(200, 40, 40), (40, 80, 180), (220, 170, 50)])); d.ellipse([x + 42, 128, x + 62, 148], fill=(250, 240, 220))
    d.rectangle([520, 80, 860, 150], fill=(120, 32, 32), outline=(220, 180, 70), width=4); d.polygon([(500, 80), (880, 80), (690, 30)], fill=(150, 40, 40), outline=(220, 180, 70))
    d.rectangle([0, 396, W, 412], fill=(110, 86, 62))
    sand = np.array(cv).astype(float); n = vnoise(H - 412, W, 30, 4); sand[412:, :, :] = np.array([214, 180, 122]) * (.85 + .25 * n[..., None]); cv = Image.fromarray(np.clip(sand, 0, 255).astype(np.uint8)); d = ImageDraw.Draw(cv)
    for i in range(1, 6): d.arc([W / 2 - 600 * i / 5, 560 - 120 * i / 5, W / 2 + 600 * i / 5, 560 + 120 * i / 5], 0, 360, fill=(196, 160, 104), width=2)
    for _ in range(10): x, y = rs.randint(100, W - 100), rs.randint(460, H - 40); d.ellipse([x - 30, y - 8, x + 30, y + 8], fill=(170, 130, 90))
    cv.save(f'{REPO}/assets/bd_arena.jpg', quality=88)

if __name__ == '__main__':
    for i in range(1, 9): mural(i)
    bd_void('underdeep', ((8, 4, 16), (24, 12, 44)), [(90, 40, 160), (30, 90, 150)], (58, 50, 74), (180, 150, 255), (120, 230, 255))
    bd_void('rift', ((10, 4, 18), (40, 10, 50)), [(140, 50, 170), (200, 70, 120)], (64, 44, 70), (220, 140, 255), (255, 140, 230))
    bd_arena()
    print('art ok')
