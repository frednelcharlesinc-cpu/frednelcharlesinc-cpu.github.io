import json
from PIL import Image
import numpy as np
SPEC = {
 'cinder': {'wall': ['0', '1', '2'], 'floor': ['4', '5', '6', '13'], 'lava': ['14'],
            'props': {'torch': ('7', 52), 'bones': ([1248, 56, 132, 98], 46), 'coal': ('17', 48), 'rubble': ([1245, 203, 145, 120], 52), 'throne': ('23', 190),
                      'pillar': ('25', 78), 'gate': ('20', 64), 'stairsup': ('21', 70)}},
 'fang': {'wall': ['10', '11', '12'], 'floor': ['31', '32', '33', '34', '35'], 'lava': [],
          'props': {'torch': ('18', 50), 'bones': ([1015, 185, 105, 82], 42), 'nest': ('23', 60), 'antlers': ([1276, 176, 100, 90], 40), 'crystal1': ('17', 56),
                    'crystal2': ('21', 46), 'crystal3': ('54', 44), 'altar': ('63', 180), 'pillar': ([298, 575, 66, 175], 80), 'pillar2': ([388, 575, 66, 175], 80),
                    'stalag1': ('70', 70), 'stalag2': ('69', 80), 'stalag3': ('72', 52), 'rock1': ('67', 60), 'gate': ('45', 64)}},
}
for sheet, S in SPEC.items():
    a = np.array(Image.open(sheet + '.jpg').convert('RGB')).astype(float); boxes = json.load(open(sheet + '_boxes.json'))
    bg = np.median(a[:4, 600:700].reshape(-1, 3), axis=0)
    def cut(bx, key=True):
        x, y, w, h = boxes[int(bx)] if isinstance(bx, str) else bx
        c = a[y:y + h, x:x + w]; d = np.sqrt(((c - bg) ** 2).sum(-1)); r, g, b = c[..., 0], c[..., 1], c[..., 2]
        al = np.clip((d - 40) / 40, 0, 1); al[(r - g > 70) & (b - g > 40) & (d < 140)] = 0
        if not key: al[:] = 1
        im = Image.fromarray(np.dstack([c, al * 255]).astype(np.uint8), 'RGBA')
        bb = im.getchannel('A').point(lambda v: 255 if v > 60 else 0).getbbox()
        return im.crop(bb) if bb else im
    for i, bx in enumerate(S['wall']): cut(bx, False).resize((32, 32), Image.LANCZOS).save(f'spr_d{sheet}_wall{i}.png')
    for i, bx in enumerate(S['floor'] + S['lava']): cut(bx, False).resize((32, 32), Image.LANCZOS).save(f'spr_d{sheet}_floor{i}.png')
    for k, (bx, hgt) in S['props'].items():
        im = cut(bx); im = im.resize((max(1, round(im.width * hgt / im.height)), hgt), Image.LANCZOS)
        al = np.array(im.getchannel('A')); im.putalpha(Image.fromarray(np.where(al > 110, 255, 0).astype(np.uint8)))
        im.save(f'big/d{sheet}_{k}.png')
    print(sheet, 'ok')
