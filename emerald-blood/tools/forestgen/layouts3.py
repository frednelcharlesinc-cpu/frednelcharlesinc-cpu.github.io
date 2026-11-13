"""Secret glades (B): small hidden clearings you reach by pushing through a 'fake' tree. One per biome; reused by base + deep zones."""
import json, hashlib, os
from gen import *
G4 = {}
for key, b, seed, trees, bushes, rocks, extra in [
  ('fc_glade_n', 'north', 61, ['fc_ntree1', 'fc_ntree2'], ['fc_n_bush1', 'fc_n_bush2'], ['fc_n_rock2'], []),
  ('fc_glade_e', 'east', 62, ['fc_etree1', 'fc_etree2'], ['fc_e_bush1', 'fc_e_bush2'], ['fc_e_rock1'], []),
  ('fc_glade_s', 'south', 63, ['fc_stree1', 'fc_stree2', 'fc_s_dead'], ['fc_s_bush1', 'fc_s_bush2'], ['fc_s_rock1'], ['fc_s_mush1', 'fc_s_mush2', 'fc_s_mush3']),
  ('fc_glade_w', 'west', 64, ['fc_wtree1', 'fc_wtree2'], ['fc_w_bush1', 'fc_w_bush2'], ['fc_w_rock1'], [])]:
    m = M(key, 24, 17, b, seed)
    m.pond(17, 6, 3, 1.8); m.tall(7, 7, 4, 2.5)
    m.path([(12, 16), (12, 10)], .9)
    for x in range(8, 17):
        for y in range(4, 15): m.res.add((x, y))
    m.data['glade'] = {'start': [12, 14], 'exit': [12, 16], 'stash': [12, 6]}
    m.exit(x=12, y=16, to='?', tx=0, ty=0, dir='down')
    m.finish(density=.95, trees=trees, bushes=bushes, rocks=rocks, extra=extra, border=4, keepout=0)
    G4[key] = m
maps = json.load(open(REPO + '/assets/maps.json'))
src = open(REPO + '/js/fc_data.js').read(); hdr, body = src.split('const FCL = ', 1); FCL = json.loads(body.strip().rstrip(';'))
for key, m in G4.items():
    img = paint(m); img.convert('RGB').save(f'{REPO}/assets/map_{key}.webp', 'WEBP', quality=88, method=6)
    ver = hashlib.md5(open(f'{REPO}/assets/map_{key}.webp', 'rb').read()).hexdigest()[:8]
    maps[key] = {'w': m.w, 'h': m.h, 'col': [''.join(str(int(v)) for v in row) for row in m.col], 'props': m.props, 'grass': m.data.get('grass', []), 'ext': 'webp', 'v': ver, 'fc': 1, 'mm': minimap_rows(m)}
    m.data['exits'] = []; FCL[key] = {k: v for k, v in m.data.items() if k != 'grass'}
    print(key, len(m.props), m.col[14][12], m.col[16][12], m.col[6][12])
json.dump(maps, open(REPO + '/assets/maps.json', 'w'), separators=(',', ':'))
open(REPO + '/js/fc_data.js', 'w').write(hdr + 'const FCL = ' + json.dumps(FCL, separators=(',', ':')) + ';\n')
