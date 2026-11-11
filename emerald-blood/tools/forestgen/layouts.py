import json, sys
import numpy as np
from gen import *

meta = pack()
MAPS = {}; DATA = {}

def W(names, weights):
    def f(x, y, rng): return rng.choices(names, weights)[0]
    return f

def falls(m, fx, cy, b):
    """waterfall over a cliff band starting at row cy (3 rows): ledge behind it, pond below, a secret chest on the ledge"""
    for x in range(fx - 3, fx + 4): m.res.add((x, cy + 3))
    m.pond(fx + 1, cy + 5.6, 3.2, 1.9)
    m.props.append({'k': f'fc_{b}fall', 'x': fx, 'y': cy + 4, 'ox': 16})
    m.data['secret'].append([fx, cy + 3]); m.chest(fx, cy + 3)
    for x in (fx, fx + 1): m.k[cy + 3, x] = 0

def cave(m, did, x, cy, b, title):
    m.props.append({'k': f'fc_{b}cave', 'x': x, 'y': cy + 2})
    m.data['caves'][did] = {'at': [x, cy + 2], 'back': [x, cy + 3]}
    m.res.update({(x, cy + 2), (x, cy + 3), (x, cy + 4), (x - 1, cy + 3), (x + 1, cy + 3)})
    m.k[cy + 2, x] = 0   # the mouth is open ground (the cave sprite covers it), so the entrance stays where it is

def campfire(m, x, y): m.data['fires'].append([x, y]); m.col[y, x] = 1; m.res.add((x, y))

def spring(m, cx, cy, rx, ry):
    m.pond(cx, cy, rx, ry); ys, xs = np.where(m.k == 2)
    m.data['springs'].append([[int(a), int(b)] for a, b in zip(xs, ys) if (a + .5 - cx) ** 2 / rx ** 2 + (b + .5 - cy) ** 2 / ry ** 2 <= 1.2])

def log(m, lid, x, y, w, key):
    m.data['logs'].append({'id': lid, 'x': x, 'y': y, 'w': w, 'k': key})
    for i in range(w): m.res.add((x + i, y))

def around(x, y, w=1, h=1):
    return [(x + dx, y + dy) for dx in range(-1, w + 1) for dy in range(-1, h + 1)]

# ============================== THE CROSSROADS
m = M('fc_cross', 48, 40, 'cross', 101)
m.tall(12, 27, 5, 3); m.tall(37, 29, 6, 3.5); m.tall(37, 8, 5, 3); m.tall(9, 6, 4, 3); m.tall(30, 34, 3, 2)
spring(m, 10, 13, 3.6, 2.6)
for pts in ([(24, 20), (24, 0)], [(24, 20), (47, 20)], [(24, 20), (24, 39)], [(24, 20), (0, 20)]): m.path(pts, 1.3)
m.path([(22, 22), (14, 30), (8, 39)], 1.1)
m.brush(24, 20, 3.4, 1, only=(0, 6))
m.clear(29, 15, 3); m.put('fc_n_ruins', 29, 15, block=((-1, 0), (0, 0), (1, 0)))
m.look(around(28, 15, 3, 1), 'shrine')
m.clear(37, 13, 3); m.put('fc_s_arch', 37, 13, block=((-1, 0), (0, 0), (1, 0)))
m.look(around(36, 13, 3, 1), 'A ruined shrine, older than Ashford. Someone has swept the steps and left fresh flowers on the altar.')
m.put('fc_w_sign', 20, 17, reserve=1); m.look(around(20, 17), 'sign_cross')
m.spot('tam', 27, 18, 'down'); m.spot('fenwick', 15, 31, 'down'); m.spot('mare', 33, 31, 'left')
m.chest(6, 25); m.chest(41, 10); m.chest(40, 34)
m.data['gather'] = [[11, 27], [36, 29], [37, 8], [9, 6]]
m.exit(x=23, x2=25, y=0, to='woods_n', tx=32, ty=46, dir='up', label='Mistveil Pines')
m.exit(x=47, y=19, y2=21, to='woods_e', tx=1, ty=27, dir='right', label='Emberroot Wilds')
m.exit(x=23, x2=25, y=39, to='woods_s', tx=32, ty=1, dir='down', label='Glimmerfen')
m.exit(x=0, y=19, y2=21, to='woods_w', tx=62, ty=24, dir='left', label='The Old Grove')
m.exit(x=7, x2=9, y=39, to='ashford', tx=58, ty=20, dir='left', label='Ashford Hollow')
def crosstrees(x, y, rng):
    if y < 9 and 12 < x < 36: return rng.choice(['fc_ntree1', 'fc_ntree2', 'fc_ntree2'])
    if x > 39 and 9 < y < 31: return rng.choice(['fc_etree1', 'fc_etree2', 'fc_etree2'])
    if y > 31 and 12 < x < 36: return rng.choice(['fc_stree1', 'fc_stree1', 'fc_s_dead'])
    if x < 8 and 9 < y < 31: return rng.choice(['fc_wtree1', 'fc_wtree1', 'fc_wtree2'])
    return rng.choice(['fc_ttree1', 'fc_ttree2', 'fc_ttree3', 'fc_ttree1'])
m.finish(density=.42, trees=crosstrees, bushes=['fc_tbush1', 'fc_tbush2', 'fc_tbush3'], rocks=['fc_w_rock3', 'fc_n_rock2'], extra=['fc_pot1'] * 0 or ['fc_tbush3'])
MAPS['fc_cross'] = m

# ============================== NORTH — MISTVEIL PINES
m = M('fc_north', 64, 48, 'north', 202)
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
m.data['gather'] = [[27, 42], [12, 29], [31, 10], [50, 8]]
m.exit(x=31, x2=33, y=47, to='woods', tx=24, ty=1, dir='down', label='the Crossroads')
m.exit(x=33, x2=35, y=0, msg='The old north road climbs toward the Mountain Pass. Snow has buried it chest-deep — not until the thaw.')
m.finish(density=.6, trees=W(['fc_ntree1', 'fc_ntree2', 'fc_ntree3'], [4, 5, 1]), bushes=['fc_n_bush1', 'fc_n_bush2', 'fc_n_bush3'], rocks=['fc_n_rock2'])
MAPS['fc_north'] = m

# ============================== EAST — EMBERROOT WILDS
m = M('fc_east', 64, 48, 'east', 303)
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
m.data['gather'] = [[10, 31], [27, 37], [51, 20], [9, 15]]
m.exit(x=0, y=26, y2=28, to='woods', tx=46, ty=20, dir='left', label='the Crossroads')
m.exit(x=63, y=27, y2=29, msg='The wagon road runs on east for days, past the sealed Gate site and on to Highmark. Better to take the carriage from Ashford.')
m.finish(density=.55, trees=W(['fc_etree1', 'fc_etree2', 'fc_etree3'], [4, 5, 1]), bushes=['fc_e_bush1', 'fc_e_bush2', 'fc_e_bush3'], rocks=['fc_e_rock1', 'fc_e_rock2'])
MAPS['fc_east'] = m

# ============================== SOUTH — GLIMMERFEN
m = M('fc_south', 64, 48, 'south', 404)
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
m.data['gather'] = [[20, 7], [40, 9], [36, 28], [55, 30]]
m.exit(x=31, x2=33, y=0, to='woods', tx=24, ty=38, dir='up', label='the Crossroads')
m.exit(x=31, x2=33, y=47, msg='Past the reeds the fen opens onto the Coast Road and the smell of salt. The tide has the causeway under water — another day.')
m.finish(density=.55, trees=W(['fc_stree1', 'fc_stree2', 'fc_stree3', 'fc_s_dead', 'fc_s_stump'], [5, 4, 1, 1, 1]), bushes=['fc_s_bush1', 'fc_s_bush2'],
         rocks=['fc_s_rock1', 'fc_s_rock2', 'fc_s_rock3'], extra=['fc_s_mush1', 'fc_s_mush2', 'fc_s_mush3', 'fc_s_mush4', 'fc_s_moss'])
MAPS['fc_south'] = m

# ============================== WEST — THE OLD GROVE
m = M('fc_west', 64, 48, 'west', 505)
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
m.data['gather'] = [[48, 17], [24, 30], [56, 31], [27, 43]]
m.exit(x=63, y=23, y2=25, to='woods', tx=1, ty=20, dir='left', label='the Crossroads')
m.exit(x=0, y=23, y2=25, msg='The river path winds west toward the ruins of the old Drag homeland — and Millbrook — but the ford is too deep to cross. Take the south gate road from Ashford.')
m.finish(density=.55, trees=W(['fc_wtree1', 'fc_wtree2', 'fc_wtree3'], [4, 5, 1]), bushes=['fc_w_bush1', 'fc_w_bush2', 'fc_w_bush3'], rocks=['fc_w_rock1', 'fc_w_rock2'])
MAPS['fc_west'] = m

# ============================== DUNGEONS
def dungeon(key, biome, seed, variant):
    m = M(key, 40, 30, biome, seed); m.k[:] = 8
    rng = m.rng
    def room(x0, y0, x1, y1): m.k[y0:y1 + 1, x0:x1 + 1] = 7
    def hall(pts, r=.9): m.line(pts, r, 7)
    room(16, 23, 24, 27)                         # entrance hall
    room(3, 14, 11, 20); room(28, 14, 36, 20)    # side caves
    room(13, 2, 27, 9)                           # the lair
    room(5, 3, 9, 7); room(31, 24, 36, 27)       # hidden nooks
    if variant % 2: hall([(20, 23), (20, 16), (10, 16)], 1.2); hall([(20, 16), (20, 9)], 1.2); hall([(20, 16), (28, 17)])
    else: hall([(20, 23), (17, 18), (20, 9)], 1.3); hall([(17, 18), (11, 17)]); hall([(20, 13), (28, 16)])
    hall([(7, 14), (7, 7)], .7); hall([(32, 20), (33, 24)], .7)
    # rough the walls up
    for y in range(1, 29):
        for x in range(1, 39):
            if m.k[y, x] == 8 and rng.random() < .12 and (m.k[y - 1, x] == 7 or m.k[y + 1, x] == 7 or m.k[y, x - 1] == 7 or m.k[y, x + 1] == 7) and m.k[y + 1, x] != 8:
                pass
    m.k[28, 20] = 7
    m.col[m.k == 8] = 1
    m.data['dungeon'] = {'start': [20, 27], 'exit': [20, 28], 'boss': [20, 5], 'bossRoom': [13, 2, 27, 9],
                         'chests': [[5, 15], [35, 19], [33, 26], [7, 4], [24, 3]], 'gather': [[9, 19], [30, 15]],
                         'torches': [[17, 23], [23, 23], [4, 14], [10, 14], [29, 14], [35, 14], [14, 2], [26, 2], [18, 9], [22, 9]]}
    return m
for key, b, s, v in [('d_fang', 'dun_n', 11, 0), ('d_cinder', 'dun_e', 12, 1), ('d_shrine', 'dun_s', 13, 0), ('d_vault', 'dun_w', 14, 1)]:
    MAPS[key] = dungeon(key, b, s, v)

# ============================== write
maps = json.load(open('/home/claude/eb/maps_orig.json'))
FCL = {}
for key, m in MAPS.items():
    img = paint_dungeon(m) if key.startswith('d_') else paint(m)
    img.convert('RGB').save(f'{REPO}/assets/map_{key}.webp', 'WEBP', quality=88, method=6)
    entry = {'w': m.w, 'h': m.h, 'col': [''.join(str(int(v)) for v in row) for row in m.col], 'props': m.props,
             'grass': m.data.get('grass', []), 'ext': 'webp', 'v': 1, 'fc': 1, 'mm': minimap_rows(m)}
    if 'dungeon' in m.data:
        entry['dungeon'] = m.data.pop('dungeon'); entry['dungeon']['style'] = {'d_fang': 'crypt', 'd_cinder': 'warren', 'd_shrine': 'mire', 'd_vault': 'crypt'}[key]
    maps[key] = entry
    for lk in m.data['look']: lk['t'] = [t for t in lk['t'] if m.inb(t[0], t[1]) and m.col[t[1], t[0]] == 1]
    FCL[key] = {k: v for k, v in m.data.items() if k != 'grass'}
    print(key, len(m.props), 'props', os.path.getsize(f'{REPO}/assets/map_{key}.webp') // 1024, 'KB')
json.dump(maps, open(REPO + '/assets/maps.json', 'w'), separators=(',', ':'))
open(REPO + '/js/fc_data.js', 'w').write('/* generated by the forest builder: layout of the Crossroads, the four forests and their dungeons */\nconst FCL = ' + json.dumps(FCL, separators=(',', ':')) + ';\n')

ch = json.load(open('/home/claude/eb/chests_orig.json'))
for key, m in MAPS.items():
    if not key.startswith('d_'): ch[key] = m.data['chests']; ch['ent_' + key] = []
json.dump(ch, open(REPO + '/assets/chests.json', 'w'), separators=(',', ':'))
