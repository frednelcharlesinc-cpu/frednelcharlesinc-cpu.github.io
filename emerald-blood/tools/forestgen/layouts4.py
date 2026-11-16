"""THE VALE OF ECHOES (B) — a hidden fifth deep zone, reached through the Crossroads waystone after all four World's End views."""
import json, hashlib
import numpy as np
from gen import *
def around(x, y, w=1, h=1): return [(x + dx, y + dy) for dx in range(-1, w + 1) for dy in range(-1, h + 1)]
def W(names, weights):
    def f(x, y, rng): return rng.choices(names, weights)[0]
    return f
m = M('fc_vale', 96, 72, 'west', 2026)
m.river([(70, 0), (66, 14), (72, 30), (64, 46), (70, 71)], 1.6)
m.pond(30, 18, 7, 4); m.pond(80, 58, 5, 3)
m.cliff(40, 4, 40, stairs=(22,))
m.tall(14, 56, 6, 3); m.tall(46, 30, 6, 3); m.tall(84, 20, 6, 3); m.tall(40, 62, 5, 3); m.tall(14, 24, 5, 3)
m.path([(48, 71), (48, 52), (36, 46), (22, 46)], 1.3)
m.path([(22, 43), (22, 36), (30, 28), (48, 24), (60, 20)], 1.2)
m.path([(48, 52), (62, 50), (78, 50), (88, 40)], 1.1)
m.path([(48, 24), (48, 10), (40, 6)], 1.0); m.path([(60, 20), (82, 14), (88, 8)], 1.0)
m.path([(22, 46), (10, 50), (6, 62)], .9); m.path([(22, 36), (8, 30), (6, 18)], .9)
m.path([(78, 50), (84, 62)], .9)
# the Hall of First Light — the ruined Drag hall at the top of the vale
m.clear(40, 6, 5); m.put('fc_w_mural', 40, 4, block=((-2, 0), (-1, 0), (0, 0), (1, 0), (2, 0)))
m.look([(x, 4) for x in range(38, 43)], 'The Hall of First Light. A Drag mural taller than any in the woods: a green-eyed people standing between a great dragon and a crowd of humans — shielding them.')
m.put('fc_w_statue', 34, 7); m.put('fc_w_statue', 46, 7)
m.look(around(34, 7) + around(46, 7), 'Two Drag wardens guard the hall, swords down. On their plinths: WE WERE THE SHIELD. WE WILL BE AGAIN.')
m.data['arena'] = [40, 10]   # the Echo Warden waits here
# landmarks
m.clear(88, 8, 3); m.put('fc_n_statue', 88, 7); m.look(around(88, 7), 'A Drag child in stone, reaching up for a hand that is no longer there.')
m.clear(6, 18, 3); m.put('fc_ancient', 6, 18, block=((-1, 0), (0, 0), (1, 0), (-1, -1), (0, -1), (1, -1)), reserve=2)
m.look(around(5, 17, 3, 2), 'The oldest tree you have ever seen. Names are carved all the way up the trunk — hundreds of them, in Drag script. You can read every one.')
m.clear(84, 62, 3); m.put('fc_w_tent', 83, 61, block=((-1, 0), (0, 0), (1, 0)))
m.look(around(82, 60, 3, 1), 'A camp, neatly kept — and recent. A bedroll, a pot, a whetstone. Whoever lives here has green thread in their sewing kit.')
m.data['fires'].append([86, 63]); m.col[63, 86] = 1; m.res.add((86, 63))
m.put('fc_w_sign', 50, 66); m.look(around(50, 66), 'No sign of the Guild here. No Accord markers, no road-wardens. Just a wooden post carved with a single Drag rune: HOME.')
for (x, y) in [(30, 30), (60, 36), (12, 60)]:
    m.put('fc_w_rock3', x, y); m.look(around(x, y), 'A singing stone. Put your ear to it and you hear voices — far off, many of them, all talking at once, all happy.')
m.data['hunt'] = [6, 62]    # the four World's End clues lead here
for c in [(88, 42), (8, 30), (60, 8), (92, 64), (24, 66), (70, 40)]: m.chest(*c)
m.data['gather'] = [[14, 56], [46, 30], [84, 20], [40, 62]]
m.data.setdefault('meadow', []).append([60, 60, 8, 4])
for yy in range(56, 65):
    for xx in range(52, 69):
        if ((xx - 60) / 8) ** 2 + ((yy - 60) / 4) ** 2 <= 1: m.res.add((xx, yy))
m.exit(x=47, x2=49, y=71, to='woods', tx=24, ty=20, dir='down', label='the Crossroads')
m.finish(density=.5, trees=W(['fc_wtree1', 'fc_wtree2', 'fc_wtree3', 'fc_ntree1'], [4, 5, 1, 1]), bushes=['fc_w_bush1', 'fc_w_bush2', 'fc_w_bush3'], rocks=['fc_w_rock1', 'fc_w_rock2'])
maps = json.load(open(REPO + '/assets/maps.json'))
src = open(REPO + '/js/fc_data.js').read(); hdr, body = src.split('const FCL = ', 1); FCL = json.loads(body.strip().rstrip(';'))
ch = json.load(open(REPO + '/assets/chests.json'))
key = 'fc_vale'; img = paint(m); img.convert('RGB').save(f'{REPO}/assets/map_{key}.webp', 'WEBP', quality=82, method=6)
ver = hashlib.md5(open(f'{REPO}/assets/map_{key}.webp', 'rb').read()).hexdigest()[:8]
maps[key] = {'w': m.w, 'h': m.h, 'col': [''.join(str(int(v)) for v in row) for row in m.col], 'props': m.props, 'grass': m.data.get('grass', []), 'ext': 'webp', 'v': ver, 'fc': 1, 'mm': minimap_rows(m)}
for lk in m.data['look']: lk['t'] = [t for t in lk['t'] if m.inb(t[0], t[1]) and m.col[t[1], t[0]] == 1]
FCL[key] = {k: v for k, v in m.data.items() if k != 'grass'}; ch[key] = m.data['chests']; ch['ent_' + key] = []
json.dump(maps, open(REPO + '/assets/maps.json', 'w'), separators=(',', ':'))
open(REPO + '/js/fc_data.js', 'w').write(hdr + 'const FCL = ' + json.dumps(FCL, separators=(',', ':')) + ';\n')
json.dump(ch, open(REPO + '/assets/chests.json', 'w'), separators=(',', ':'))
print('vale', len(m.props))
