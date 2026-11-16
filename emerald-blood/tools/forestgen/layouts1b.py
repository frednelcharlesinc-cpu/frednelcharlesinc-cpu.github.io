"""The FOUR FORESTS, enlarged (B) — Mistveil/Emberroot/Glimmerfen/Old Grove rebuilt at 96x72 from the layouts.py plans, scaled 1.5x, plus new content.
Previous docstring: The DEEP WOODS, doubled (B): the four deep zones rebuilt at 1.5x per side (96x72 — 2.25x the area) with extra content.
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
    def spot(s, name, x, y, d='down'): super().spot(name, z(x), z(y), d)
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

def cave(m, did, x, cy, b, title):
    x, cy = z(x), z(cy)
    m.props.append({'k': f'fc_{b}cave', 'x': x, 'y': cy + 2})
    m.data['caves'][did] = {'at': [x, cy + 2], 'back': [x, cy + 3]}
    m.res.update({(x, cy + 2), (x, cy + 3), (x, cy + 4), (x - 1, cy + 3), (x + 1, cy + 3)})
    m.k[cy + 2, x] = 0
def meadow(m, x, y, rx, ry):
    """a wide open field for riding: cleared of trees, grass-free, with a race from one end to the other"""
    for yy in range(int(y - ry), int(y + ry) + 1):
        for xx in range(int(x - rx), int(x + rx) + 1):
            if ((xx - x) / rx) ** 2 + ((yy - y) / ry) ** 2 <= 1: m.res.add((xx, yy))
    m.data.setdefault('meadow', []).append([x, y, rx, ry])
# ============================== NORTH — MISTVEIL PINES
m = SM('fc_north', 96, 72, 'north', 202)
m.cliff(4, 2, 24, rows=3)
m.cliff(22, 1, 62, stairs=(22, 58))
falls(m, 44, 22, 'n')
m.pond(51, 3.2, 3.2, 1.7); m.river([(50, 4), (48, 10), (46, 15), (45, 21)], 1.1)   # snowmelt pool → stream → the falls
m.river([(45, 30), (48, 36), (52, 42), (63, 45)], 1.3)
m.tall(28, 42, 5, 3); m.tall(13, 29, 5, 3); m.tall(30, 10, 5, 3); m.tall(51, 8, 5, 2.5); m.tall(40, 41, 3, 2)
m.path([(32, 47), (32, 38), (22, 32), (22, 25)])
m.path([(22, 21), (17, 15), (11, 9), (10, 8)])
m.path([(22, 21), (32, 16), (40, 13)]); m.path([(40, 13), (52, 16), (58, 19), (58, 21)])
m.path([(32, 16), (34, 8), (34, 0)])
m.path([(58, 25), (56, 30), (52, 37)], .9)
m.path([(32, 38), (44, 36), (54, 36)])
m.path([(22, 32), (12, 36), (6, 40)], .9)
cave(m, 'd_fang', 10, 4, 'n', 'Hollow Fang Den')
m.clear(18, 13, 3); m.put('fc_n_camp', 18, 11, block=((-1, 0), (0, 0), (1, 0), (-1, -1), (0, -1), (1, -1)))
campfire(m, 18, 13)
for n, x, y, d in [('dace', 15, 12, 'right'), ('sefa', 16, 15, 'up'), ('wren', 20, 15, 'up'), ('corran', 21, 12, 'left'), ('scout', 18, 16, 'down'),
                   ('alpha', 12, 8, 'down'), ('liora', 13, 9, 'left'), ('lupine', 30, 6, 'down'), ('redeye', 14, 30, 'down')]: m.spot(n, x, y, d)
m.clear(42, 9, 4); m.put('fc_ancient', 42, 10, block=((-1, 0), (0, 0), (1, 0), (-1, -1), (0, -1), (1, -1)), reserve=2)
m.look(around(41, 9, 3, 2), 'The ancient tree. Its roots are thicker than houses. When you press your palm to the bark, it is warm — and, very faintly, it hums.')
m.clear(53, 14, 3); m.put('fc_n_ruins', 53, 14, block=((-1, 0), (0, 0), (1, 0)))
m.look(around(52, 14, 3, 1), 'A watchtower, broken off at the knees. Claw marks run up the stone — deeper, and much higher, than any wolf could reach.')
m.chest(55, 16)
m.clear(56, 36, 3); m.put('fc_n_statue', 56, 35)
m.look(around(56, 35), 'A knight in old armour, kneeling in the snow. Someone took a chisel to its eyes long ago. The plaque reads HERO OF THE NORTH PASS — the name beneath has been scraped away, letter by letter.')
for (x, y) in [(27, 30), (36, 34), (17, 27), (38, 18)]:
    m.put('fc_n_rock1', x, y); m.look(around(x, y), 'A standing stone with a blue light pulsing at its heart, slow as breathing. The light leans toward your eyes when you come close.')
m.put('fc_n_sign', 30, 40); m.look(around(30, 40), 'sign_north')
log(m, 'n_stairs', 58, 21, 2, 'fc_n_log')
m.put('fc_n_rock1', 4, 9); m.put('fc_n_rock2', 5, 9); m.look([(4, 9), (5, 9)], 'A den under the rocks. It reeks of wet fur and old bones. Claw marks score the stone at the height of your head.')
m.spot('reefback', 4, 10, 'down')
m.chest(6, 40); m.chest(28, 6)
gather(m, [[27, 42], [12, 29], [31, 10], [50, 8]])
m.exit(x=31, x2=33, y=47, to='woods', tx=24, ty=1, dir='down', label='the Crossroads')
m.exit(x=33, x2=35, y=0, msg='The old north road climbs toward the Mountain Pass. Snow has buried it chest-deep — not until the thaw.')
# --- new ground (big coords)
meadow(m, 76, 8, 8, 4); m.rpath([(66, 8), (60, 14)], 1.0)
m.rpath([(10, 60), (20, 66), (34, 66)], 1.0); m.rtall(24, 64, 5, 2.5)
m.rclear(34, 66, 2); m.rput('fc_n_rock2', 34, 66); m.rlook(around(34, 66), 'A frozen shrine to some forgotten trail-god: a stone bowl of offerings — buttons, a bent spoon, one green glass bead.')
m.rchest(88, 6); m.rchest(36, 68); m.rchest(4, 30)
m.rpath([(18, 48), (8, 40), (4, 32)], .9)
m.finish(density=.6, trees=W(['fc_ntree1', 'fc_ntree2', 'fc_ntree3'], [4, 5, 1]), bushes=['fc_n_bush1', 'fc_n_bush2', 'fc_n_bush3'], rocks=['fc_n_rock2'])
MAPS['fc_north'] = m

# ============================== EAST — EMBERROOT WILDS
m = SM('fc_east', 96, 72, 'east', 303)
m.cliff(9, 30, 62, stairs=(40,))
falls(m, 33, 9, 'e')
m.river([(38, 0), (37, 4), (34, 8)], 1.1)   # a stream off the high ground feeds the falls
m.river([(34, 17), (28, 22), (26, 30), (22, 47)], 1.3)
m.tall(10, 31, 6, 3); m.tall(27, 37, 5, 3); m.tall(51, 20, 6, 3); m.tall(9, 15, 5, 3); m.tall(52, 42, 4, 2)
m.path([(0, 27), (18, 27), (30, 28), (46, 28), (63, 28)], 1.4)
m.path([(18, 27), (20, 21)])
m.path([(46, 28), (47, 18), (52, 13)])
m.path([(40, 15), (40, 13)]); m.path([(40, 8), (48, 5), (55, 5)])
m.path([(14, 27), (12, 35)]); m.path([(12, 35), (6, 42)], .9)
m.path([(40, 28), (46, 37)])
m.path([(46, 37), (58, 37), (58, 30)], .6)
spring(m, 49, 41, 2.6, 1.8)
cave(m, 'd_cinder', 52, 9, 'e', 'Cinder Hollow')
m.clear(20, 17, 4); m.put('fc_e_camp', 20, 16, block=((-1, 0), (0, 0), (1, 0), (-1, -1), (0, -1), (1, -1)))
campfire(m, 22, 18)
m.put('fc_crates', 16, 18); m.look(around(16, 18), 'crate')
for n, x, y, d in [('rook', 19, 20, 'left'), ('bandit', 21, 21, 'up'), ('convoy', 36, 25, 'left'), ('wherald', 33, 25, 'down'), ('merchant', 6, 24, 'right')]: m.spot(n, x, y, d)
m.clear(56, 5, 3); m.put('fc_e_ruins', 56, 5, block=((-1, 0), (0, 0), (1, 0)))
m.look(around(55, 5, 3, 1), 'Scorched pillars around a hollow in the earth big enough to swallow a house. Something enormous once slept curled here. The ground is still warm.')
m.chest(58, 6)
m.clear(12, 37, 3); m.put('fc_e_statue', 12, 37)
m.look(around(12, 37), 'A robed figure, burned black down one side. Scratched into the base, in a child\'s careful letters: IT WAS NOT THE DRAGS WHO BURNED THE EAST.')
m.put('fc_emberking', 30, 40, block=((-1, 0), (0, 0), (1, 0)), reserve=2)
m.look(around(29, 40, 3, 1), 'A great ember-oak. Its roots split the rock like fingers, and its leaves never fall — they only smoulder.')
m.put('fc_e_sign', 24, 25); m.look(around(24, 25), 'sign_east')
log(m, 'e_loop', 58, 32, 1, 'fc_e_log')
m.chest(6, 42)
gather(m, [[10, 31], [27, 37], [51, 20], [9, 15]])
m.exit(x=0, y=26, y2=28, to='woods', tx=46, ty=20, dir='left', label='the Crossroads')
m.exit(x=63, y=27, y2=29, msg='The wagon road runs on east for days, past the sealed Gate site and on to Highmark. Better to take the carriage from Ashford.')
# --- new ground
meadow(m, 86, 62, 7, 3); m.rpath([(69, 55), (80, 62)], 1.0)
m.rpath([(30, 42), (24, 52)], .9); m.rtall(80, 52, 5, 2.5)
m.rclear(88, 64, 2); m.rput('fc_e_rock2', 88, 64); m.rlook(around(88, 64), 'A milestone, half melted. The distances have all been scratched out and replaced with one word: TURN BACK.')
m.rchest(90, 66); m.rchest(4, 8); m.rchest(60, 50)
m.rpath([(27, 40), (14, 26), (4, 10)], .9)
m.finish(density=.55, trees=W(['fc_etree1', 'fc_etree2', 'fc_etree3'], [4, 5, 1]), bushes=['fc_e_bush1', 'fc_e_bush2', 'fc_e_bush3'], rocks=['fc_e_rock1', 'fc_e_rock2'])
MAPS['fc_east'] = m

# ============================== SOUTH — GLIMMERFEN
m = SM('fc_south', 96, 72, 'south', 404)
m.cliff(14, 1, 62, stairs=(32,))
falls(m, 12, 14, 's')
m.river([(16, 0), (14, 6), (12, 13)], 1.1)   # the fen's stream tips over the cliff
m.river([(13, 23), (16, 29), (19, 32)], 1.2)
m.pond(20, 33, 6, 3.6); m.pond(45, 34, 5, 3.6); m.pond(31, 42, 5, 2.6)
m.tall(20, 7, 6, 3); m.tall(40, 9, 5, 2.5); m.tall(36, 28, 4, 2.5); m.tall(55, 30, 4, 3); m.tall(8, 34, 3, 3)
m.path([(32, 0), (32, 13)]); m.path([(32, 6), (10, 8)], .9)
m.path([(32, 17), (33, 20), (40, 22), (50, 18)])
m.path([(33, 20), (26, 28), (20, 36), (14, 41)])
m.path([(40, 22), (44, 27)]); m.path([(44, 27), (48, 34), (54, 41)])
m.path([(50, 18), (59, 26)], .9)
m.path([(26, 28), (32, 38), (32, 47)])
cave(m, 'd_shrine', 50, 14, 's', 'The Sunken Shrine')
m.clear(11, 42, 3); m.put('fc_s_tent', 10, 41, block=((-1, 0), (0, 0), (1, 0))); m.put('fc_s_roll', 12, 43, block=())
campfire(m, 12, 41)
spring(m, 6, 44, 2.2, 1.4)
m.spot('hermit', 13, 40, 'left')
m.clear(45, 26, 2); m.put('fc_s_statue', 45, 26); m.put('fc_s_tablet', 47, 27, block=())
m.look(around(45, 26) + around(47, 27), 'A cloaked founder with a lantern of green glass: AVERIN HOLLE, WHO BOUND THE GUILDS AS ONE. Beneath it someone carved a second line, then tried to scrub it away: …AND BUILT THE ACCORD ON THEIR CHAINS.')
m.clear(54, 39, 2); m.put('fc_s_arch', 54, 40, block=((-1, 0), (1, 0)))
m.look([(53, 40), (55, 40)], 'A drowned archway. Old letters run around it in a script you can almost read — the same curling shapes as the marks on your mother\'s pendant.')
m.chest(54, 42); m.chest(59, 27); m.chest(8, 8)
m.put('fc_s_sign', 34, 19); m.look(around(34, 19), 'sign_south')
m.put('fc_swampking', 28, 8, block=((-1, 0), (0, 0), (1, 0)), reserve=2)
m.look(around(27, 8, 3, 1), 'A drowned giant of a tree, glowing from the inside. Moths the size of your hand sleep on it in rows.')
gather(m, [[20, 7], [40, 9], [36, 28], [55, 30]])
m.exit(x=31, x2=33, y=0, to='woods', tx=24, ty=38, dir='up', label='the Crossroads')
m.exit(x=31, x2=33, y=47, msg='Past the reeds the fen opens onto the Coast Road and the smell of salt. The tide has the causeway under water — another day.')
# --- new ground
meadow(m, 76, 8, 9, 4); m.rpath([(75, 27), (76, 12)], 1.0)
m.rtall(12, 62, 5, 3)
m.rclear(88, 60, 2); m.rput('fc_s_rock3', 88, 60); m.rlook(around(88, 60), 'A heron of carved driftwood, set on a post. Its beak points south-west, toward the sea. Someone has tied a green ribbon round its neck.')
m.rchest(90, 62); m.rchest(4, 66); m.rchest(88, 4)
m.rpath([(81, 61), (88, 60)], .9); m.rpath([(21, 62), (8, 66)], .9)
m.finish(density=.55, trees=W(['fc_stree1', 'fc_stree2', 'fc_stree3', 'fc_s_dead', 'fc_s_stump'], [5, 4, 1, 1, 1]), bushes=['fc_s_bush1', 'fc_s_bush2'],
         rocks=['fc_s_rock1', 'fc_s_rock2', 'fc_s_rock3'], extra=['fc_s_mush1', 'fc_s_mush2', 'fc_s_mush3', 'fc_s_mush4', 'fc_s_moss'])
MAPS['fc_south'] = m

# ============================== WEST — THE OLD GROVE
m = SM('fc_west', 96, 72, 'west', 505)
m.cliff(12, 1, 30, stairs=(16,))
m.cliff(36, 14, 30, rows=3)
falls(m, 26, 12, 'w')
m.river([(36, 0), (35, 14), (37, 26), (35, 47)], 1.5)
m.river([(35, 4), (30, 6), (27, 11)], 1.0)   # a branch of the river runs to the cliff edge and falls
m.river([(28, 20), (34, 21)], 1.0)
m.tall(48, 17, 6, 3); m.tall(24, 30, 6, 3); m.tall(56, 31, 4, 3); m.tall(27, 43, 5, 2.5); m.tall(8, 30, 4, 3)
m.path([(63, 24), (20, 24), (0, 24)], 1.2)
m.path([(20, 24), (14, 18), (8, 16)])
m.path([(16, 16), (16, 15)]); m.path([(16, 11), (16, 9), (22, 9)])
m.path([(20, 24), (11, 30), (11, 41), (22, 40)])
m.path([(11, 41), (5, 42)], .6)
m.path([(44, 24), (50, 15)]); m.path([(46, 24), (50, 34)])
cave(m, 'd_vault', 7, 12, 'w', 'The Drag Vault')
cave(m, 'd_warren', 22, 36, 'w', 'The Goblin Warren')
m.clear(22, 7, 3); m.put('fc_w_mural', 22, 8, block=((-2, 0), (-1, 0), (0, 0), (1, 0), (2, 0)))
m.look([(x, 8) for x in range(20, 25)], 'mural')
m.chest(26, 9)
m.clear(50, 12, 5); m.put('fc_w_statue', 50, 10)
m.look(around(50, 10), 'A giant in a Drag cloak, leaning on a stone sword. Moss has grown over everything but the eyes — two chips of green glass that catch the light wherever you stand.')
m.spot('stag', 53, 14, 'left')
m.put('fc_grandtree', 58, 10, block=((-1, 0), (0, 0), (1, 0)), reserve=2)
m.clear(50, 36, 3); m.put('fc_w_tent', 49, 35, block=((-1, 0), (0, 0), (1, 0))); campfire(m, 51, 36)
spring(m, 55, 38, 2.0, 1.4)
m.spot('ranger', 48, 37, 'right')
for (x, y) in [(42, 30), (8, 6), (28, 28), (58, 18), (14, 44), (44, 42)]:
    m.put('fc_w_rock3', x, y); m.look(around(x, y), 'A glowing blue stone, half sunk in the grass. The deer graze right up to it and never seem afraid.')
m.put('fc_w_sign', 41, 22); m.look(around(41, 22), 'sign_west')
log(m, 'w_dead', 8, 41, 1, 'fc_w_log2')
m.chest(5, 42); m.chest(56, 8)
gather(m, [[48, 17], [24, 30], [56, 31], [27, 43]])
m.exit(x=63, y=23, y2=25, to='woods', tx=1, ty=20, dir='left', label='the Crossroads')
m.exit(x=0, y=23, y2=25, msg='The river path winds west toward the ruins of the old Drag homeland — and Millbrook — but the ford is too deep to cross. Take the south gate road from Ashford.')
# --- new ground
meadow(m, 76, 62, 9, 4); m.rpath([(75, 51), (76, 58)], 1.0)
m.rtall(86, 30, 5, 3)
m.rclear(88, 52, 2); m.rput('fc_w_rock3', 88, 52); m.rlook(around(88, 52), 'A ring of seven blue stones in the grass. Children\'s handprints are pressed into the moss on each one — old, old handprints.')
m.rchest(90, 50); m.rchest(4, 66); m.rchest(90, 4)
m.rpath([(75, 36), (86, 46), (88, 51)], .9); m.rpath([(84, 15), (90, 6)], .9)
m.finish(density=.55, trees=W(['fc_wtree1', 'fc_wtree2', 'fc_wtree3'], [4, 5, 1]), bushes=['fc_w_bush1', 'fc_w_bush2', 'fc_w_bush3'], rocks=['fc_w_rock1', 'fc_w_rock2'])
MAPS['fc_west'] = m

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

# ---- re-aim every exit that lands in a regenerated map at that map's matching doorway
SC = {'woods': 'fc_cross', 'woods_n': 'fc_north', 'woods_e': 'fc_east', 'woods_s': 'fc_south', 'woods_w': 'fc_west',
      'woods_n2': 'fc_north2', 'woods_e2': 'fc_east2', 'woods_s2': 'fc_south2', 'woods_w2': 'fc_west2'}
MS = {v: k for k, v in SC.items()}
DEEP = {'fc_north': 'woods_n2', 'fc_east': 'woods_e2', 'fc_south': 'woods_s2', 'fc_west': 'woods_w2'}
for pk, to in DEEP.items():   # the old dead ends lead on into the deep woods
    for e in FCL[pk]['exits']:
        if 'msg' in e: e.pop('msg'); e.update({'to': to, 'dir': {'fc_north': 'up', 'fc_east': 'right', 'fc_south': 'down', 'fc_west': 'left'}[pk], 'label': {'woods_n2': 'Frostpine Heights', 'woods_e2': 'The Scorched Road', 'woods_s2': 'Saltreed Marsh', 'woods_w2': 'The Drowned Ford'}[to]})
def inward(mk, e):
    w, h = maps[mk]['w'], maps[mk]['h']; xs = (e['x'] + e.get('x2', e['x'])) // 2; ys = (e['y'] + e.get('y2', e['y'])) // 2
    if e['x'] == 0: return [1, ys]
    if e['x'] == w - 1: return [w - 2, ys]
    if e['y'] == 0: return [xs, 1]
    return [xs, h - 2]
for mk in SC.values():
    if mk not in FCL: continue
    for e in FCL[mk]['exits']:
        dst = SC.get(e.get('to'))
        if not dst or dst not in FCL: continue
        back = [b for b in FCL[dst]['exits'] if b.get('to') == MS[mk]]
        if back: e['tx'], e['ty'] = inward(dst, back[0])
json.dump(maps, open(REPO + '/assets/maps.json', 'w'), separators=(',', ':'))
open(REPO + '/js/fc_data.js', 'w').write(hdr + 'const FCL = ' + json.dumps(FCL, separators=(',', ':')) + ';\n')
json.dump(ch, open(REPO + '/assets/chests.json', 'w'), separators=(',', ':'))
for mk in SC.values(): print(mk, [(e.get('to'), e.get('tx'), e.get('ty')) for e in FCL[mk]['exits'] if e.get('to')])
