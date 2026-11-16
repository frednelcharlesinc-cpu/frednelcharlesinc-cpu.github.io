"""The DEEP WOODS, doubled (B): the four deep zones rebuilt at 1.5x per side (96x72 — 2.25x the area) with extra content.
Same layout as layouts2.py, scaled through SM, plus new landmarks/chests in the added space. Merges into the live data."""
import json, re, hashlib, os
import numpy as np
from gen import *
K = 1.5
z = lambda v: int(v * K + .5)
Z = lambda pts: [(z(x), z(y)) for x, y in pts]
class SM(M):
    def path(s, pts, r=1.1): super().path(Z(pts), r * 1.2)
    def river(s, pts, r=1.4): super().river(Z(pts), r * 1.25)
    def pond(s, cx, cy, rx, ry): super().pond(cx * K, cy * K, rx * K, ry * K)
    def cliff(s, y, x0, x1, stairs=(), rows=3): super().cliff(z(y), z(x0), z(x1), stairs=tuple(z(v) for v in stairs), rows=rows)
    def tall(s, cx, cy, rx, ry): super().tall(cx * K, cy * K, rx * K, ry * K)
    def clear(s, cx, cy, r): super().clear(z(cx), z(cy), r + 1)
    def put(s, key, x, y, block=((0, 0),), reserve=1): super().put(key, z(x), z(y), block=block, reserve=reserve)
    def look(s, tiles, text):
        xs = [t[0] for t in tiles]; ys = [t[1] for t in tiles]; cx = (min(xs) + max(xs)) // 2; cy = (min(ys) + max(ys)) // 2
        super().look([(z(cx) + x - cx, z(cy) + y - cy) for x, y in tiles], text)
    def chest(s, x, y): super().chest(z(x), z(y))
    def exit(s, **e):
        for k in ('x', 'x2', 'y', 'y2'):
            if k in e: e[k] = z(e[k])
        super().exit(**e)
    # raw (already-big) coordinates for the new content
    def rpath(s, pts, r=1.1): M.path(s, pts, r)
    def rclear(s, cx, cy, r): M.clear(s, cx, cy, r)
    def rput(s, key, x, y, block=((0, 0),)): M.put(s, key, x, y, block=block)
    def rlook(s, tiles, text): M.look(s, tiles, text)
    def rchest(s, x, y): M.chest(s, x, y)
    def rtall(s, cx, cy, rx, ry): M.tall(s, cx, cy, rx, ry)
    def rpond(s, cx, cy, rx, ry): M.pond(s, cx, cy, rx, ry)

MAPS = {}
def W(names, weights):
    def f(x, y, rng): return rng.choices(names, weights)[0]
    return f
def falls(m, fx, cy, b):
    fx, cy = z(fx), z(cy)
    for x in range(fx - 3, fx + 4): m.res.add((x, cy + 3))
    M.pond(m, fx + 1, cy + 5.6, 3.2, 1.9)
    m.props.append({'k': f'fc_{b}fall', 'x': fx, 'y': cy + 4, 'ox': 16})
    m.data['secret'].append([fx, cy + 3]); M.chest(m, fx, cy + 3)
    for x in (fx, fx + 1): m.k[cy + 3, x] = 0
def campfire(m, x, y): x, y = z(x), z(y); m.data['fires'].append([x, y]); m.col[y, x] = 1; m.res.add((x, y))
def rcampfire(m, x, y): m.data['fires'].append([x, y]); m.col[y, x] = 1; m.res.add((x, y))
def spring(m, cx, cy, rx, ry):
    cx, cy, rx, ry = cx * K, cy * K, rx * K, ry * K
    M.pond(m, cx, cy, rx, ry); ys, xs = np.where(m.k == 2)
    m.data['springs'].append([[int(a), int(b)] for a, b in zip(xs, ys) if (a + .5 - cx) ** 2 / rx ** 2 + (b + .5 - cy) ** 2 / ry ** 2 <= 1.2])
def log(m, lid, x, y, w, key):
    x, y = z(x), z(y); m.data['logs'].append({'id': lid, 'x': x, 'y': y, 'w': w, 'k': key})
    for i in range(w): m.res.add((x + i, y))
def around(x, y, w=1, h=1): return [(x + dx, y + dy) for dx in range(-1, w + 1) for dy in range(-1, h + 1)]
def gather(m, pts): m.data['gather'] = Z(pts)

# ============================== NORTH 2 — FROSTPINE HEIGHTS (beyond Mistveil's buried road)
m = SM('fc_north2', 96, 72, 'north', 1202)
m.cliff(30, 1, 62, stairs=(18, 44))
m.cliff(12, 1, 40, stairs=(30,))
falls(m, 50, 13, 'n')
m.cliff(13, 46, 62)
m.river([(51, 0), (51, 6), (51, 12)], 1.0)
m.pond(20, 22, 8, 4.2)   # the frozen tarn
m.river([(52, 20), (56, 26), (62, 29)], 1.0)
m.tall(10, 40, 5, 3); m.tall(48, 40, 6, 3); m.tall(8, 22, 4, 3); m.tall(40, 24, 5, 3); m.tall(22, 5, 5, 2.5)
m.path([(32, 47), (32, 40), (19, 36), (19, 34)]); m.path([(19, 30), (19, 28), (30, 26), (31, 17), (31, 15)])
m.path([(31, 12), (31, 8), (32, 0)]); m.path([(31, 8), (22, 6), (10, 8)]); m.path([(31, 8), (42, 5), (48, 4), (55, 8)], .9)
m.path([(32, 40), (45, 38), (45, 34)]); m.path([(45, 30), (45, 24), (52, 20)], .9)
m.path([(30, 26), (36, 22), (44, 20)], .9); m.path([(19, 36), (8, 38), (6, 44)], .9)
m.clear(12, 31, 3); m.put('fc_n_camp', 11, 31, block=((-1, 0), (0, 0), (1, 0), (-1, -1), (0, -1), (1, -1))); campfire(m, 13, 33)
m.look(around(10, 30, 3, 1), 'An abandoned hunters\' lodge. The furs are frozen stiff, and the last entry in the logbook just says: IT CAME DOWN FROM THE PASS.')
m.clear(55, 6, 3); m.put('fc_n_ruins', 55, 6, block=((-1, 0), (0, 0), (1, 0)))
m.look(around(54, 6, 3, 1), 'A cairn of black stones, each one carved with a name. The newest name is still sharp. The oldest have worn smooth.')
m.clear(24, 9, 2); m.put('fc_n_statue', 24, 9)
m.look(around(24, 9), 'A climber frozen into the ice, axe still raised, face turned up toward the pass. Someone has left a lit candle at their feet. It has not melted the ice.')
m.put('fc_n_sign', 33, 43); m.look(around(33, 43), 'FROSTPINE HEIGHTS.  The tarn ice is thick. The Mountain Pass beyond is NOT.')
for (x, y) in [(40, 8), (8, 18)]:
    m.put('fc_n_rock1', x, y); m.look(around(x, y), 'A standing stone, rimed white. When you breathe on it, letters show through the frost for a moment — then fade.')
m.chest(6, 44); m.chest(58, 40); m.chest(10, 8); m.chest(44, 20); m.chest(36, 4)
log(m, 'n2_ice', 20, 34, 1, 'fc_n_log')
gather(m, [[14, 40], [48, 36], [40, 26], [26, 6]])
m.exit(x=31, x2=33, y=47, to='woods_n', tx=34, ty=1, dir='down', label='Mistveil Pines')
m.exit(x=31, x2=33, y=0, msg='Past here the Mountain Pass climbs into a wall of white. The snow is over your head — you would need the thaw, or wings.')
# --- new ground (big coords): the Icefall Steps, a frozen shrine and a wolf den
m.rpath([(48, 60), (70, 62), (86, 56), (88, 48)], 1.1); m.rpath([(20, 54), (8, 60), (6, 66)], 1.0)
m.rtall(76, 58, 6, 3); m.rtall(14, 62, 5, 3); m.rpond(80, 40, 5, 3)
m.rclear(88, 46, 3); m.rput('fc_n_statue', 88, 45); m.rlook(around(88, 45), 'A frost-giant\'s fallen helm, big as a cart. Inside it, someone has built a tiny shrine of pine cones and blue beads.')
m.rclear(8, 64, 2); m.rput('fc_n_rock2', 8, 64); m.rlook(around(8, 64), 'Bones everywhere, gnawed clean. A wolf den — the wolves are long gone. Something bigger moved in, and then it left too.')
m.rchest(90, 50); m.rchest(4, 68); m.rchest(70, 66)
m.finish(density=.58, trees=W(['fc_ntree1', 'fc_ntree2', 'fc_ntree3'], [5, 4, 2]), bushes=['fc_n_bush1', 'fc_n_bush2', 'fc_n_bush3'], rocks=['fc_n_rock2', 'fc_n_rock1'])
MAPS['fc_north2'] = m

# ============================== EAST 2 — THE SCORCHED ROAD (past Emberroot, toward the Gate site)
m = SM('fc_east2', 96, 72, 'east', 1303)
m.cliff(10, 1, 36, stairs=(14,))
m.cliff(34, 26, 62, stairs=(44,))
falls(m, 22, 10, 'e')
m.river([(24, 0), (23, 6), (22, 10)], 1.0)
m.river([(23, 18), (18, 26), (8, 34), (0, 40)], 1.2)
m.tall(40, 18, 6, 3); m.tall(10, 22, 5, 3); m.tall(50, 42, 5, 2.5); m.tall(30, 42, 5, 3); m.tall(52, 6, 5, 2.5)
m.path([(0, 27), (16, 28), (30, 26), (48, 26), (63, 28)], 1.4)
m.path([(16, 28), (14, 20), (14, 14)]); m.path([(14, 10), (14, 6), (6, 5)])
m.path([(30, 26), (36, 16), (50, 10), (58, 5)])
m.path([(48, 26), (44, 32)]); m.path([(44, 37), (44, 42), (56, 44)], .9)
m.path([(30, 26), (28, 36), (20, 42)], .9)
spring(m, 58, 18, 2.4, 1.6)
m.clear(34, 30, 3); m.put('fc_crates', 33, 29); m.put('fc_barrel', 35, 29)
m.look(around(33, 29, 3, 1), 'A burned-out wagon, axles snapped. The cargo was Guild seals — hundreds of them, melted into one green-black lump.')
m.clear(50, 10, 3); m.put('fc_e_ruins', 50, 9, block=((-1, 0), (0, 0), (1, 0)))
m.look(around(49, 9, 3, 1), 'A waystation, gutted by fire. Painted on the one standing wall: THE GATE IS NOT A DOOR. IT IS A MOUTH.')
m.clear(8, 40, 3); m.put('fc_e_statue', 8, 40)
m.look(around(8, 40), 'A road-warden in Accord armour, sword lowered. Somebody has chalked a pair of green eyes over the helmet\'s visor.')
m.clear(46, 44, 3); m.put('fc_e_camp', 46, 43, block=((-1, 0), (0, 0), (1, 0), (-1, -1), (0, -1), (1, -1))); campfire(m, 48, 45)
m.put('fc_e_sign', 20, 30); m.look(around(20, 30), 'THE SCORCHED ROAD.  Highmark — 6 days east.  The Gate site — closed by order of the Guild.')
m.chest(6, 5); m.chest(60, 40); m.chest(58, 5); m.chest(20, 44)
log(m, 'e2_wreck', 36, 16, 1, 'fc_e_log')
gather(m, [[10, 24], [40, 20], [52, 42], [30, 40]])
m.exit(x=0, y=26, y2=28, to='woods_e', tx=62, ty=28, dir='left', label='Emberroot Wilds')
m.exit(x=63, y=27, y2=29, msg='The road runs on east for days, past the sealed Gate site and on to Highmark. Better to take the carriage from Ashford.')
# --- new ground: the Ash Fields and the old toll-house
m.rpath([(46, 60), (60, 66), (80, 62)], 1.1); m.rpath([(72, 39), (82, 30), (90, 22)], 1.0)
m.rtall(66, 64, 6, 3); m.rtall(86, 26, 5, 3)
m.rclear(80, 60, 3); m.rput('fc_e_ruins', 80, 59, block=((-1, 0), (0, 0), (1, 0))); m.rlook(around(79, 59, 3, 1), 'The old toll-house. The ledger on the counter lists every traveller for a year. The last forty pages are all one name, written over and over: FRATENAPTOR.')
m.rclear(90, 20, 2); m.rput('fc_e_rock1', 90, 20); m.rlook(around(90, 20), 'A boulder fused to glass on one side, as if something breathed on it once.')
m.rchest(92, 18); m.rchest(84, 66); m.rchest(4, 66)
m.rpath([(42, 64), (20, 66), (6, 66)], 1.0)
m.finish(density=.5, trees=W(['fc_etree1', 'fc_etree2', 'fc_etree3'], [4, 5, 2]), bushes=['fc_e_bush1', 'fc_e_bush2', 'fc_e_bush3'], rocks=['fc_e_rock1', 'fc_e_rock2'])
MAPS['fc_east2'] = m

# ============================== SOUTH 2 — SALTREED MARSH (below Glimmerfen, where the fen meets the sea)
m = SM('fc_south2', 96, 72, 'south', 1404)
m.pond(14, 14, 8, 4.5); m.pond(46, 12, 7, 4); m.pond(30, 30, 9, 4.5); m.pond(10, 38, 5, 3); m.pond(54, 36, 6, 4)
m.river([(0, 22), (8, 22), (20, 24), (30, 30)], 1.2); m.river([(30, 30), (44, 34), (54, 36), (63, 44)], 1.3)
m.tall(30, 8, 6, 3); m.tall(52, 24, 5, 3); m.tall(18, 42, 5, 2.5); m.tall(40, 44, 5, 2.5); m.tall(6, 30, 4, 3)
m.path([(32, 0), (32, 8), (24, 20), (22, 34), (32, 40), (32, 47)])   # the causeway, boardwalks over the water
m.path([(32, 8), (46, 20), (58, 22)]); m.path([(24, 20), (8, 28), (4, 30)], .9)
m.path([(32, 40), (46, 42), (58, 44)], .9); m.path([(22, 34), (10, 44)], .9)
m.path([(46, 20), (50, 6), (58, 4)], .9)
m.clear(58, 22, 3); m.put('fc_s_tent', 57, 21, block=((-1, 0), (0, 0), (1, 0))); m.put('fc_s_roll', 59, 23, block=()); campfire(m, 56, 23)
m.look(around(56, 20, 3, 1), 'A salt-gatherer\'s tent, empty. A pot of something grey is still warm on the coals.')
m.clear(50, 5, 2); m.put('fc_s_arch', 50, 5, block=((-1, 0), (1, 0)))
m.look([(49, 5), (51, 5)], 'A sea-gate, half sunk in the marsh. Barnacles grow on the inside of the arch — the side that faces the land.')
m.clear(8, 28, 2); m.put('fc_s_statue', 8, 27)
m.look(around(8, 27), 'A drowned fisherwoman in stone, net over one shoulder. Her eyes have been painted green, recently, with great care.')
m.put('fc_s_sign', 34, 3); m.look(around(34, 3), 'SALTREED MARSH.  The causeway floods at high tide. The Coast Road lies beyond — when the sea allows.')
m.chest(4, 30); m.chest(60, 4); m.chest(58, 44); m.chest(10, 44); m.chest(42, 46)
gather(m, [[30, 10], [52, 26], [18, 40], [40, 42]])
m.exit(x=31, x2=33, y=0, to='woods_s', tx=32, ty=46, dir='up', label='Glimmerfen')
m.exit(x=31, x2=33, y=47, msg='The causeway runs on into grey water. The tide is in — the Coast Road is under it. Another day.')
# --- new ground: the Shell Midden and the smuggler's hut
m.rpath([(48, 60), (70, 62), (88, 58)], 1.1); m.rpath([(33, 51), (14, 58), (6, 62)], 1.0)
m.rtall(78, 64, 6, 3); m.rtall(10, 56, 5, 3); m.rpond(60, 50, 6, 3)
m.rclear(88, 56, 3); m.rput('fc_s_tent', 87, 55, block=((-1, 0), (0, 0), (1, 0))); m.rlook(around(86, 54, 3, 1), 'A smuggler\'s hut on stilts. The crates are empty, but every one is stamped with the Guild seal — upside down.')
m.rclear(6, 62, 2); m.rput('fc_s_rock2', 6, 62); m.rlook(around(6, 62), 'A midden of shells, centuries deep. Pressed into it like a fossil: a child\'s bracelet with a green glass bead.')
m.rchest(90, 60); m.rchest(4, 66); m.rchest(70, 68)
m.finish(density=.48, trees=W(['fc_stree1', 'fc_stree2', 'fc_stree3', 'fc_s_dead', 'fc_s_stump'], [4, 4, 1, 3, 2]), bushes=['fc_s_bush1', 'fc_s_bush2'],
         rocks=['fc_s_rock1', 'fc_s_rock2', 'fc_s_rock3'], extra=['fc_s_mush1', 'fc_s_mush2', 'fc_s_moss', 'fc_s_moss'])
MAPS['fc_south2'] = m

# ============================== WEST 2 — THE DROWNED FORD (toward the old Drag homeland)
m = SM('fc_west2', 96, 72, 'west', 1505)
m.river([(28, 0), (30, 12), (26, 24), (30, 36), (28, 47)], 2.2)   # the wide river — crossed only at the ford bridges
m.cliff(14, 36, 62, stairs=(50,))
falls(m, 44, 14, 'w')
m.river([(44, 0), (44, 8), (44, 14)], 1.0); m.river([(45, 22), (38, 24), (30, 24)], 1.0)
m.tall(12, 12, 5, 3); m.tall(14, 36, 6, 3); m.tall(52, 30, 6, 3); m.tall(50, 42, 5, 2.5); m.tall(54, 6, 4, 2.5)
m.path([(63, 24), (48, 26), (36, 28), (20, 28), (0, 24)], 1.2)   # the ford road — a long bridge over the river
m.path([(48, 26), (50, 18)]); m.path([(50, 14), (50, 6), (58, 4)], .9); m.path([(50, 18), (50, 17), (46, 17)], .7)
m.path([(20, 28), (14, 18), (8, 8)]); m.path([(20, 28), (12, 38), (6, 42)], .9)
m.path([(36, 28), (40, 38), (52, 42)], .9)
m.clear(10, 8, 3); m.put('fc_w_mural', 10, 7, block=((-2, 0), (-1, 0), (0, 0), (1, 0), (2, 0)))
m.look([(x, 7) for x in range(8, 13)], 'Another Drag carving — a whole village this time: houses, children, a great tree. Across it, in Accord script, someone has cut one word deep into the stone: FORFEIT.')
m.clear(58, 4, 3); m.put('fc_w_statue', 58, 4)
m.look(around(58, 4), 'A Drag mother holding a baby to the sky. The baby\'s face is the only part of the statue no one has ever damaged.')
m.clear(52, 42, 3); m.put('fc_w_tent', 51, 41, block=((-1, 0), (0, 0), (1, 0))); m.put('fc_w_roll', 53, 43, block=()); campfire(m, 50, 43)
m.rlook(around(76, 61, 3, 1), 'A ferryman\'s camp. The ferry is gone. Carved on the post: CROSSINGS SUSPENDED — BY ORDER.')
m.put('fc_w_sign', 40, 26); m.look(around(40, 26), 'THE DROWNED FORD.  Millbrook — west, when the river is low.  The old Drag lands — further than that.')
for (x, y) in [(16, 22), (54, 36)]:
    m.put('fc_w_rock3', x, y); m.look(around(x, y), 'A blue-glowing stone, half sunk in the bank. Fish gather in the water near it as if it were warm.')
m.chest(6, 42); m.chest(58, 12); m.chest(8, 14); m.chest(36, 44)
log(m, 'w2_bank', 14, 32, 1, 'fc_w_log2')
gather(m, [[12, 12], [16, 36], [54, 30], [48, 44]])
m.exit(x=63, y=23, y2=25, to='woods_w', tx=1, ty=24, dir='right', label='The Old Grove')
m.exit(x=0, y=23, y2=25, msg='The ford is too deep to cross — the river is high, and the old stepping stones are under a fathom of water. Millbrook will have to wait.')
# --- new ground: the drowned chapel and the Drag orchard
m.rpath([(60, 46), (70, 58), (86, 62)], 1.1); m.rpath([(18, 57), (10, 64), (6, 68)], 1.0)
m.rtall(78, 60, 6, 3); m.rtall(12, 62, 5, 3)
m.rclear(86, 62, 3); m.rput('fc_w_mural', 86, 61, block=((-2, 0), (-1, 0), (0, 0), (1, 0), (2, 0))); m.rlook([(x, 61) for x in range(84, 89)], 'A drowned chapel\'s back wall. The Accord saints painted on it have all been given green eyes — scratched in, very small, by many different hands.')
m.rclear(8, 66, 2); m.rput('fc_w_statue', 8, 66); m.rlook(around(8, 66), 'Old fruit trees in rows — an orchard nobody tends. A Drag gardener in stone still kneels among them, pruning knife in hand.')
m.rchest(90, 66); m.rchest(4, 70); m.rchest(60, 70)
m.rpath([(45, 54), (58, 70)], 1.0)
m.finish(density=.55, trees=W(['fc_wtree1', 'fc_wtree2', 'fc_wtree3'], [4, 5, 1]), bushes=['fc_w_bush1', 'fc_w_bush2', 'fc_w_bush3'], rocks=['fc_w_rock1', 'fc_w_rock2'])
MAPS['fc_west2'] = m

# ============================== merge into the live data
maps = json.load(open(REPO + '/assets/maps.json'))
src = open(REPO + '/js/fc_data.js').read(); hdr, body = src.split('const FCL = ', 1); FCL = json.loads(body.strip().rstrip(';'))
ch = json.load(open(REPO + '/assets/chests.json'))
for key, m in MAPS.items():
    img = paint(m); img.convert('RGB').save(f'{REPO}/assets/map_{key}.webp', 'WEBP', quality=82, method=6)
    ver = hashlib.md5(open(f'{REPO}/assets/map_{key}.webp', 'rb').read()).hexdigest()[:8]
    maps[key] = {'w': m.w, 'h': m.h, 'col': [''.join(str(int(v)) for v in row) for row in m.col], 'props': m.props,
                 'grass': m.data.get('grass', []), 'ext': 'webp', 'v': ver, 'fc': 1, 'mm': minimap_rows(m)}
    for lk in m.data['look']: lk['t'] = [t for t in lk['t'] if m.inb(t[0], t[1]) and m.col[t[1], t[0]] == 1]
    FCL[key] = {k: v for k, v in m.data.items() if k != 'grass'}
    ch[key] = m.data['chests']; ch['ent_' + key] = []
    print(key, len(m.props), 'props', os.path.getsize(f'{REPO}/assets/map_{key}.webp') // 1024, 'KB')
# open the old dead ends into the new zones
OPEN = {'fc_north': ('woods_n2', 'Frostpine Heights', 48, 70, 'up'), 'fc_east': ('woods_e2', 'The Scorched Road', 1, 40, 'right'),
        'fc_south': ('woods_s2', 'Saltreed Marsh', 48, 1, 'down'), 'fc_west': ('woods_w2', 'The Drowned Ford', 94, 36, 'left')}
for pk, (to, label, tx, ty, d) in OPEN.items():
    for e in FCL[pk]['exits']:
        if 'msg' in e or e.get('to') == to: e.pop('msg', None); e.update({'to': to, 'tx': tx, 'ty': ty, 'dir': d, 'label': label})
json.dump(maps, open(REPO + '/assets/maps.json', 'w'), separators=(',', ':'))
open(REPO + '/js/fc_data.js', 'w').write(hdr + 'const FCL = ' + json.dumps(FCL, separators=(',', ':')) + ';\n')
json.dump(ch, open(REPO + '/assets/chests.json', 'w'), separators=(',', ':'))
