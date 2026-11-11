"""Battlefields for the Crossroads, the four woods and their dungeons — composed from the same art as the world.
Writes assets/bd_<key>.jpg (1376x768). The fighters stand on the lower part; ground line at GND = .52."""
import random, math
import numpy as np
from PIL import Image, ImageDraw, ImageFilter, ImageEnhance
import gen
from gen import M, paint, BIOME, load, SPR, SMALL, REPO, hexc

W, H, GND = 1376, 768, .52
GY = int(H * GND)

def shade(im, f, haze=None, a=0):
    im = ImageEnhance.Brightness(im).enhance(f)
    if haze is not None and a > 0:
        arr = np.array(im).astype(float); col = np.array(haze, float)
        arr[..., :3] = arr[..., :3] * (1 - a) + col * a
        im = Image.fromarray(arr.astype(np.uint8))
    return im

def ground(biome, seed, path=True):
    m = M('bf', 43, 12, biome, seed)
    if path: m.path([(0, 6), (14, 5), (28, 7), (42, 6)], 2.2)
    m.tall(4, 9, 6, 3); m.tall(38, 3, 6, 3)
    m.finish(density=0, trees=['x'], border=0)
    return paint(m).crop((0, 0, W, H - GY))

def rows(canvas, rng, trees, back, haze, y_rows=((.27, .72, .4), (.39, 1.0, .64), (.53, 1.4, .93)), gap=1.0):
    """layers of trees from far (small, dark, hazy) to near"""
    for yb, sc, br in y_rows:
        x = -60 + rng.randint(0, 60)
        while x < W + 60:
            t = load(rng.choice(trees))
            t = t.resize((int(t.width * sc * 1.25), int(t.height * sc * 1.25)), Image.LANCZOS)
            t = shade(t, br, haze, (1 - br) * .55)
            canvas.alpha_composite(t, (int(x - t.width / 2), int(H * yb - t.height)))
            x += t.width * (.45 + rng.random() * .35) * gap

def put(canvas, name, cx, by, sc=1.0, br=1.0, haze=None, a=0, src=SPR):
    t = load(name, src); t = t.resize((max(1, int(t.width * sc)), max(1, int(t.height * sc))), Image.LANCZOS)
    t = shade(t, br, haze, a); canvas.alpha_composite(t, (int(cx - t.width / 2), int(by - t.height)))

def vignette(canvas, col=(0, 0, 0), strength=.55):
    y, x = np.mgrid[0:H, 0:W]; d = np.sqrt(((x - W / 2) / (W / 2)) ** 2 + ((y - H * .6) / (H * .75)) ** 2)
    a = np.clip((d - .55) * strength * 1.6, 0, strength)
    arr = np.array(canvas).astype(float); arr[..., :3] = arr[..., :3] * (1 - a[..., None]) + np.array(col) * a[..., None]
    return Image.fromarray(arr.astype(np.uint8))

def glow(canvas, pts, col, r=90, a=.45):
    ov = Image.new('RGBA', (W, H), (0, 0, 0, 0)); d = ImageDraw.Draw(ov)
    for (x, y) in pts:
        for i in range(12, 0, -1):
            rr = r * i / 12; d.ellipse([x - rr, y - rr * .7, x + rr, y + rr * .7], fill=col + (int(255 * a * (1 - i / 12) ** 1.5 / 3),))
    canvas.alpha_composite(ov.filter(ImageFilter.GaussianBlur(8)))

def forest_bd(key, biome, seed, trees, back_top, back_bot, haze, landmark=None, fore=(), extra=None):
    rng = random.Random(seed)
    cv = Image.new('RGBA', (W, H))
    # the deep woods behind: a dark canopy gradient
    g = np.linspace(0, 1, GY + 40)[:, None, None]
    sky = (np.array(back_top) * (1 - g) + np.array(back_bot) * g)
    cv.paste(Image.fromarray(np.repeat(sky, W, 1).astype(np.uint8)).convert('RGBA'), (0, 0))
    gr = ground(biome, seed)
    cv.alpha_composite(gr.convert('RGBA'), (0, GY))
    # soft shadow where the trees meet the clearing
    sh = Image.new('RGBA', (W, 60), (0, 0, 0, 0)); sd = ImageDraw.Draw(sh)
    for i in range(60): sd.line([(0, i), (W, i)], fill=(0, 0, 0, int(120 * (1 - i / 60))))
    cv.alpha_composite(sh, (0, GY))
    rows(cv, rng, trees, back_bot, haze)
    if landmark: landmark(cv, rng)
    if extra: extra(cv, rng)
    for (name, cx, sc, br) in fore:   # framing at the bottom corners, close to the camera
        put(cv, name, cx, H + 40, sc, br)
    cv = vignette(cv)
    cv.convert('RGB').save(f'{REPO}/assets/bd_{key}.jpg', quality=90)
    print('bd', key)

# ---------------------------------------------------------------- the woods
def lm_cross(cv, rng):
    put(cv, 'n_ruins', 300, GY + 30, 1.9); put(cv, 'w_sign', 1090, GY + 40, 1.6); put(cv, 's_arch', 980, GY - 6, 1.5, .8)
forest_bd('fc_cross', 'cross', 1, ['ttree1', 'ttree2', 'ttree3', 'n_tree2', 'e_tree2', 'w_tree1'], (120, 170, 120), (40, 70, 40), (60, 90, 60), lm_cross,
          fore=[('tbush1', 90, 2.6, .7), ('tbush3', 1290, 2.4, .7)])

def lm_north(cv, rng):
    put(cv, 'n_tree3', 1060, GY + 20, 3.2, .95)               # the ancient tree
    put(cv, 'n_statue', 330, GY + 36, 2.2, .9)                # the kneeling knight
    put(cv, 'n_rock1', 520, GY + 20, 1.8, .85)
def snowfall(cv, rng):
    d = ImageDraw.Draw(cv)
    for _ in range(700):
        x, y = rng.randint(0, W), rng.randint(0, H); r = rng.choice([1, 1, 2, 2, 3]); d.ellipse([x, y, x + r, y + r], fill=(255, 255, 255, 200))
    fog = Image.new('RGBA', (W, H), (0, 0, 0, 0)); fd = ImageDraw.Draw(fog)
    for i in range(80): fd.line([(0, GY - 80 + i), (W, GY - 80 + i)], fill=(230, 240, 250, int(110 * math.sin(math.pi * i / 80))))
    cv.alpha_composite(fog)
forest_bd('fc_north', 'north', 2, ['n_tree1', 'n_tree2', 'n_tree2', 'n_tree1'], (200, 215, 230), (90, 110, 130), (200, 215, 230), lm_north, fore=[('n_bush3', 100, 2.6, .8), ('n_rock2', 1280, 2.4, .8)], extra=snowfall)

def lm_east(cv, rng):
    put(cv, 'e_tree3', 980, GY + 26, 3.0, 1.0)                # the ember-oak
    put(cv, 'e_statue', 300, GY + 34, 2.1, .9)
    put(cv, 'e_rock1', 500, GY + 18, 1.8, .9)
def embers(cv, rng):
    glow(cv, [(980, GY - 140), (260, GY - 40)], (255, 140, 40), 220, .5)
    d = ImageDraw.Draw(cv)
    for _ in range(140):
        x, y = rng.randint(0, W), rng.randint(0, GY + 200); d.rectangle([x, y, x + 2, y + 2], fill=(255, rng.randint(120, 200), 40, 230))
forest_bd('fc_east', 'east', 3, ['e_tree1', 'e_tree2', 'e_tree2', 'e_tree1'], (240, 170, 90), (90, 40, 20), (200, 120, 60), lm_east, fore=[('e_bush1', 90, 2.6, .75), ('e_bush3', 1290, 2.4, .75)], extra=embers)

def lm_south(cv, rng):
    put(cv, 's_tree3', 1040, GY + 30, 2.7, 1.0)
    put(cv, 's_statue', 330, GY + 40, 1.9, .9); put(cv, 's_tablet', 450, GY + 40, 1.6, .9)
    d = ImageDraw.Draw(cv)   # a dark pool at the edge of the clearing
    d.ellipse([560, GY + 6, 860, GY + 70], fill=(30, 80, 80, 255)); d.ellipse([575, GY + 12, 845, GY + 62], fill=(36, 98, 95, 255))
    for m_, x in [('s_mush1', 150), ('s_mush3', 230), ('s_mush2', 1200), ('s_mush4', 1270), ('s_mush1', 880)]: put(cv, m_, x, GY + 60 + rng.randint(0, 60), 2.2)
def fireflies(cv, rng):
    glow(cv, [(1040, GY - 120), (200, GY + 60), (1240, GY + 80)], (80, 240, 210), 200, .45)
    d = ImageDraw.Draw(cv)
    for _ in range(120):
        x, y = rng.randint(0, W), rng.randint(40, H - 40); c = rng.choice([(120, 255, 220), (190, 140, 255)]); d.ellipse([x, y, x + 3, y + 3], fill=c + (230,))
forest_bd('fc_south', 'south', 4, ['s_tree1', 's_tree2', 's_tree1', 's_dead'], (70, 110, 110), (16, 34, 32), (40, 80, 80), lm_south, fore=[('s_bush1', 100, 2.6, .7), ('s_bush2', 1280, 2.6, .7)], extra=fireflies)

def lm_west(cv, rng):
    put(cv, 'w_mural', 700, GY - 4, 1.45, .92)                # the three-stage carving behind the clearing
    put(cv, 'w_tree3', 180, GY + 30, 2.4, 1.0); put(cv, 'w_statue', 1150, GY + 36, 2.0, .95)
def beams(cv, rng):
    ov = Image.new('RGBA', (W, H), (0, 0, 0, 0)); d = ImageDraw.Draw(ov)
    for x in (360, 620, 900, 1120):
        d.polygon([(x, 0), (x + 70, 0), (x + 190, GY + 120), (x + 90, GY + 120)], fill=(255, 240, 170, 38))
    cv.alpha_composite(ov.filter(ImageFilter.GaussianBlur(10)))
forest_bd('fc_west', 'west', 5, ['w_tree1', 'w_tree2', 'w_tree1', 'w_tree2'], (210, 225, 140), (50, 80, 30), (150, 180, 90), lm_west, fore=[('w_bush1', 90, 2.6, .75), ('w_bush3', 1290, 2.4, .75)], extra=beams)

# ---------------------------------------------------------------- the dungeons
def dungeon_bd(key, tiles, plain_floor, plain_wall, props, light, boss=None, back=()):
    rng = random.Random(hash(key) & 0xffff)
    cv = Image.new('RGBA', (W, H), (10, 10, 12, 255))
    # floor: big flagstones (the user's sheet at 2x, or the dungeon's own colour)
    if tiles:
        fl = [load(f'{tiles}_floor{i}_64', SMALL).resize((128, 128), Image.LANCZOS) for i in range(4)]
        for y in range(GY, H, 128):
            for x in range(0, W, 128): cv.alpha_composite(fl[0 if rng.random() < .55 else rng.randint(1, 3)], (x, y))
        wl = [load(f'{tiles}_wall{i}_64', SMALL).resize((192, 192), Image.LANCZOS) for i in range(3)]
        for x in range(0, W, 192): cv.alpha_composite(wl[rng.randint(0, 2)], (x, GY - 192))
        for x in range(0, W, 192): cv.alpha_composite(shade(wl[rng.randint(0, 2)], .55), (x, GY - 384))
    else:
        d = ImageDraw.Draw(cv); fc = hexc(plain_floor); wc = hexc(plain_wall)
        for y in range(GY, H, 64):
            for x in range(-(y // 64 % 2) * 32, W, 64):
                v = .85 + rng.random() * .3; d.rectangle([x + 1, y + 1, x + 62, y + 62], fill=tuple(int(c * v) for c in fc)); d.rectangle([x, y, x + 63, y + 63], outline=tuple(int(c * .6) for c in fc))
        for y in range(0, GY, 48):
            for x in range(-(y // 48 % 2) * 48, W, 96):
                v = .8 + rng.random() * .35; d.rectangle([x + 2, y + 2, x + 93, y + 45], fill=tuple(int(c * v) for c in wc)); d.rectangle([x, y, x + 95, y + 47], outline=tuple(int(c * .55) for c in wc))
    sh = Image.new('RGBA', (W, 70), (0, 0, 0, 0)); sd = ImageDraw.Draw(sh)
    for i in range(70): sd.line([(0, i), (W, i)], fill=(0, 0, 0, int(150 * (1 - i / 70))))
    cv.alpha_composite(sh, (0, GY))
    for (name, cx, sc, yoff) in back: put(cv, name, cx, GY + yoff, sc)
    if boss: put(cv, boss, W // 2, GY + 70, 1.5)
    for (name, cx, sc, yoff) in props: put(cv, name, cx, GY + yoff, sc)
    glow(cv, [(x, GY - 150) for x in (170, 520, 860, 1210)] + ([(W // 2, GY - 60)] if boss else []), light, 200, .55)
    cv = vignette(cv, strength=.7)
    cv.convert('RGB').save(f'{REPO}/assets/bd_{key}.jpg', quality=90); print('bd', key)

TOR_C = [('dcinder_torch', x, 1.6, -40) for x in (170, 520, 860, 1210)]
TOR_F = [('dfang_torch', x, 1.6, -40) for x in (170, 520, 860, 1210)]
cinder_props = [('dcinder_pillar', 70, 1.7, 40), ('dcinder_pillar', 1306, 1.7, 40), ('dcinder_coal', 300, 1.6, 30), ('dcinder_rubble', 1080, 1.6, 30), ('dcinder_bones', 1200, 1.7, 250), ('dcinder_bones', 160, 1.5, 280)]
fang_props = [('dfang_pillar', 70, 1.7, 40), ('dfang_pillar2', 1306, 1.7, 40), ('dfang_crystal1', 300, 1.7, 34), ('dfang_stalag2', 1090, 1.6, 34), ('dfang_nest', 1180, 1.6, 260), ('dfang_bones', 170, 1.6, 290), ('dfang_antlers', 640, 1.4, 20)]
dungeon_bd('d_cinder', 'dcinder', None, None, TOR_C + cinder_props, (255, 130, 50))
dungeon_bd('d_cinder_boss', 'dcinder', None, None, TOR_C + cinder_props, (255, 110, 40), boss='dcinder_throne')
dungeon_bd('d_fang', 'dfang', None, None, TOR_F + fang_props, (150, 200, 255))
dungeon_bd('d_fang_boss', 'dfang', None, None, TOR_F + fang_props, (150, 200, 255), boss='dfang_altar')
dungeon_bd('d_shrine', None, '#355a4a', '#24443a', [('s_mush1', 200, 2.2, 60), ('s_mush3', 1180, 2.2, 70), ('s_statue', 300, 2.0, 30), ('s_arch', 1060, 1.9, 24), ('s_moss', 700, 2.0, -260)], (90, 240, 210))
dungeon_bd('d_vault', None, '#66664a', '#3c3c26', [('w_statue', 240, 2.1, 30), ('w_statue', 1140, 2.1, 30), ('w_rock3', 620, 1.8, 60), ('w_rock2', 860, 1.7, 40)], (90, 255, 140), back=[('w_mural', 690, 1.35, -10)])
