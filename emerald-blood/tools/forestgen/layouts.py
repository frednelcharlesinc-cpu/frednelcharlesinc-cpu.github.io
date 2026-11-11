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

# ============================== DUNGEONS (grand: ~12 rooms, loops, a lever vault, secret passages, secret bosses)
THEME = {
 'd_fang':   dict(gear='alphatalisman', gear2='hidecoat', part='alphaheart', sb=[('rime_alpha', 'The White Hound', 'Older than the den. Its fur is frost; its eyes are two cold coins.'), ('m_skeleton', 'The Frozen Huntsman', 'A hunter, frozen mid-step, bow still drawn. The ice cracks as it turns.')],
              cluetext='Scratched into the ice: FIRST THE MOON ROSE. THEN A STAR FELL. LAST, THE SUN.'),
 'd_cinder': dict(gear='embercharm', gear2='drakemail', part='drakegem', sb=[('m_drake', 'Ashmother', 'The wyrmling\'s mother was never gone. She was only sleeping under the coals.'), ('m_tusker', 'The Molten Boar', 'Its hide has cooled into black glass. Its blood has not.')],
              cluetext='Burned into the wall: FIRST THE MOON ROSE. THEN A STAR FELL. LAST, THE SUN.'),
 'd_shrine': dict(gear='trollmail', gear2='scalevest', part='trollblood', sb=[('m_troll', 'The Tidelord', 'The shrine\'s old god was a troll in a crown of shells. It is still here.'), ('m_lizard', 'The First Signatory', 'A lizardman wearing a guild founder\'s chain. "I signed first," it hisses.')],
              cluetext='Carved under the waterline: FIRST THE MOON ROSE. THEN A STAR FELL. LAST, THE SUN.'),
 'd_vault':  dict(gear='bonemail', gear2='dustcharm', part='soulember', sb=[('m_minotaur', 'The Green Guard Captain', 'A Drag war-captain\'s armour, filled with something that remembers how to fight.'), ('m_skeleton', 'The Nameless Drag', 'Its name was chiseled off its tomb. It wants it back.')],
              cluetext='In old Drag letters, under your fingers: FIRST THE MOON ROSE. THEN A STAR FELL. LAST, THE SUN.'),
}
def dungeon2(key, biome, seed):
    W_, H_ = 76, 52
    m = M(key, W_, H_, biome, seed); m.k[:] = 8; rng = m.rng
    def room(x0, y0, x1, y1): m.k[y0:y1 + 1, x0:x1 + 1] = 7
    def hall(a, b, r=.9):
        (x0, y0), (x1, y1) = a, b
        if rng.random() < .5: m.line([(x0, y0), (x1, y0), (x1, y1)], r, 7)
        else: m.line([(x0, y0), (x0, y1), (x1, y1)], r, 7)
    lair = (28, 2, 47, 11); room(*lair)
    ent = (32, 42, 43, 47); room(*ent); m.k[48, 37:39] = 7
    rooms = []
    for r in range(3):
        for c in range(4):
            if r == 2 and c in (1, 2): continue   # the entrance hall sits here
            cx0, cy0 = 8 + c * 15, 14 + r * 9
            w, h = rng.randint(8, 12), rng.randint(5, 7)
            x0 = cx0 + rng.randint(0, 13 - w); y0 = cy0 + rng.randint(0, 8 - h)
            rooms.append([x0, y0, x0 + w - 1, y0 + h - 1])
    for R in rooms: room(*R)
    ctr = lambda R: ((R[0] + R[2]) // 2, (R[1] + R[3]) // 2)
    inner = list(range(len(rooms)))
    nodes = inner + ['lair', 'ent']
    P = lambda n: ctr(rooms[n]) if isinstance(n, int) else (ctr(lair) if n == 'lair' else ctr(ent))
    conn = {nodes[-1]}; left = set(nodes[:-1]); edges = []
    while left:
        a, b = min(((a, b) for a in conn for b in left), key=lambda e: abs(P(e[0])[0] - P(e[1])[0]) + abs(P(e[0])[1] - P(e[1])[1]))
        edges.append((a, b)); conn.add(b); left.remove(b)
    for _ in range(3):
        a, b = rng.sample(inner, 2)
        if (a, b) not in edges: edges.append((a, b))
    for a, b in edges: hall(P(a), P(b), .9 if rng.random() < .6 else 1.3)
    # hidden rooms out on the edges of the map: two secret rooms and the lever vault
    ys = rng.sample([16, 24, 33], 3)
    specials = [[1, ys[0], 6, ys[0] + 5], [69, ys[1], 74, ys[1] + 5], [69 if abs(ys[2] - ys[1]) > 7 else 1, ys[2], 74 if abs(ys[2] - ys[1]) > 7 else 6, ys[2] + 5]]
    if specials[2][0] == 1 and abs(ys[2] - ys[0]) <= 7: specials[2] = [69, 42 - 5, 74, 42]
    for R in specials: room(*R)
    def link(R):
        c = ctr(R); n = min(inner, key=lambda j: abs(P(j)[0] - c[0]) + abs(P(j)[1] - c[1]))
        door = (R[2] + 1, c[1]) if R[0] < 10 else (R[0] - 1, c[1])
        m.line([c, (P(n)[0], c[1]), P(n)], .6, 7)
        return door
    lever = min(inner, key=lambda i: abs(ctr(rooms[i])[0] - 38) + abs(ctr(rooms[i])[1] - 24))
    clue = max(inner, key=lambda i: abs(ctr(rooms[i])[0] - ctr(rooms[lever])[0]) + abs(ctr(rooms[i])[1] - ctr(rooms[lever])[1]))
    secretR, VR = specials[:2], specials[2]
    data = {'cracks': [], 'secret': [], 'gate': None, 'levers': [], 'clue': None, 'relic': None, 'theme': key}
    for R in secretR: data['cracks'].append(link(R))
    data['gate'] = link(VR)
    m.k[49:, :] = 8; m.k[:, 0] = 8; m.k[:, W_ - 1] = 8; m.k[0, :] = 8
    m.col[:] = 0; m.col[m.k == 8] = 1
    for (x, y) in data['cracks'] + [data['gate']]: m.col[y, x] = 1   # sealed until opened in the game
    # levers along the lever-hall's back wall, the clue on the far room's back wall
    LR = rooms[lever]; xs = [LR[0] + 1 + j * max(2, (LR[2] - LR[0] - 2) // 2) for j in range(3)]
    for sym, x in zip(['sun', 'moon', 'star'], xs): data['levers'].append({'x': x, 'y': LR[1], 'sym': sym})
    CR = rooms[clue]; data['clue'] = [(CR[0] + CR[2]) // 2, CR[1] - 1]
    data['relic'] = [ctr(VR)[0], VR[1] + 1]
    for j, SR in enumerate(secretR): data['secret'].append({'x': ctr(SR)[0], 'y': ctr(SR)[1], 'i': j})
    taken = {tuple(data['relic']), (ctr(lair)[0], 5), (ctr(lair)[0], 6), (37, 47), (37, 48)} | {(L['x'], L['y']) for L in data['levers']} | {(data['clue'][0], data['clue'][1] + 1)} | {(s['x'], s['y']) for s in data['secret']}
    chests = []
    def free_in(R, n):
        out = []
        for _ in range(60):
            x, y = rng.randint(R[0], R[2]), rng.randint(R[1], R[3])
            if (x, y) in taken or m.col[y, x] or any(abs(x - a) + abs(y - b) < 3 for a, b in out): continue
            out.append((x, y)); taken.add((x, y)); taken.add((x, y + 1)); taken.add((x, y - 1))
            if len(out) == n: break
        return out
    for i in inner: chests += free_in(rooms[i], 1 + (rng.random() < .5))
    for SR in secretR: chests += free_in(SR, 2)
    chests += free_in(VR, 3)
    lairc = [ctr(lair)[0] + 4, lair[1] + 1]; chests.append(tuple(lairc)); taken.add(tuple(lairc))   # the great chest, last
    torches = []
    for R in [lair, ent] + rooms + specials:
        for x in (R[0] + 1, R[2] - 1):
            if (x, R[1]) not in taken and m.k[R[1] - 1, x] == 8: torches.append([x, R[1]]); taken.add((x, R[1]))
    gather = [list(t) for i in inner[:3] for t in free_in(rooms[i], 1)]
    m.data['dungeon'] = {'start': [37, 47], 'exit': [37, 48], 'boss': [ctr(lair)[0], 6], 'bossRoom': list(lair), 'chests': [list(c) for c in chests], 'gather': gather, 'torches': torches}
    m.data['dx'] = data
    # decoration from the user's sheets (or simple rubble)
    t = {'dun_e': 'dcinder', 'dun_n': 'dfang'}.get(biome)
    keep = set(taken) | {(x, y) for (x, y) in data['cracks'] + [data['gate']]}
    for (x, y) in list(keep): keep |= {(x + dx, y + dy) for dx in (-1, 0, 1) for dy in (-1, 0, 1)}
    m.data['lava'] = []
    if t:
        boss = 'fc_dcinder_throne' if t == 'dcinder' else 'fc_dfang_altar'
        bx = ctr(lair)[0]; m.props.append({'k': boss, 'x': bx, 'y': 3})
        for x in range(bx - 3, bx + 4): m.col[3, x] = 1; keep.add((x, 3))
        pil = ['fc_dcinder_pillar'] if t == 'dcinder' else ['fc_dfang_pillar', 'fc_dfang_pillar2']
        for (x, y) in [(lair[0] + 2, 5), (lair[2] - 2, 5), (lair[0] + 2, 9), (lair[2] - 2, 9)]: m.props.append({'k': rng.choice(pil), 'x': x, 'y': y}); m.col[y, x] = 1; keep.add((x, y))
        soft = ['fc_dcinder_bones'] if t == 'dcinder' else ['fc_dfang_bones', 'fc_dfang_antlers', 'fc_dfang_nest']
        hard = ['fc_dcinder_coal', 'fc_dcinder_rubble'] if t == 'dcinder' else ['fc_dfang_crystal1', 'fc_dfang_crystal2', 'fc_dfang_crystal3', 'fc_dfang_stalag1', 'fc_dfang_stalag2', 'fc_dfang_stalag3', 'fc_dfang_rock1']
        for y in range(1, H_ - 1):
            for x in range(1, W_ - 1):
                if m.k[y, x] != 7 or (x, y) in keep or m.col[y, x]: continue
                n8 = sum(m.k[y + dy, x + dx] == 7 for dx in (-1, 0, 1) for dy in (-1, 0, 1)) - 1
                wallnear = m.k[y - 1, x] == 8 or m.k[y + 1, x] == 8 or m.k[y, x - 1] == 8 or m.k[y, x + 1] == 8
                r = rng.random()
                if wallnear and n8 >= 5 and r < .12: m.props.append({'k': rng.choice(hard), 'x': x, 'y': y}); m.col[y, x] = 1
                elif n8 == 8 and r < .04: m.props.append({'k': rng.choice(soft), 'x': x, 'y': y})
                elif t == 'dcinder' and n8 == 8 and r < .05: m.data['lava'].append((x, y)); m.col[y, x] = 1
    return m
for key, b, s in [('d_fang', 'dun_n', 11), ('d_cinder', 'dun_e', 12), ('d_shrine', 'dun_s', 13), ('d_vault', 'dun_w', 14)]:
    MAPS[key] = dungeon2(key, b, s); MAPS[key].data['dx'].update({k: v for k, v in THEME[key].items()})

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
