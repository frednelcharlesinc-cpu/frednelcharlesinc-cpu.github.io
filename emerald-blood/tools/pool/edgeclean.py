"""Edge clean-up for cut sprite atlases (Chat C).
White (or chroma) halo removal: pixels on a sprite's outer edge that are pale and colourless (or tinted toward the
sheet's background colour) were mixed with the background by the image generator / JPEG. Each one takes the colour of
the nearest solid interior pixel instead, and the faintest ones are dropped. Coloured highlights are left alone.
Usage: python3 edgeclean.py <atlas.png> [...]   (also writes the .webp twin)"""
import sys, numpy as np
from PIL import Image
from scipy import ndimage as nd

def clean(a, bg=(255, 255, 255), band=3):
    a = a.copy(); A = a[..., 3]; op = A > 24
    inner = nd.binary_erosion(op, iterations=band)
    edge = op & ~inner
    if not inner.any(): return a
    _, (iy, ix) = nd.distance_transform_edt(~inner, return_indices=True)
    rgb = a[..., :3].astype(float); src = rgb[iy, ix]
    lum = rgb @ [.3, .59, .11]; slum = src @ [.3, .59, .11]
    sat = rgb.max(-1) - rgb.min(-1)
    bgd = np.sqrt(((rgb - np.array(bg, float)) ** 2).sum(-1)); srcd = np.sqrt(((rgb - src) ** 2).sum(-1))
    pale = (lum > slum + 35) & (sat < 70)          # whiter than the body it sits on, and colourless
    toward_bg = bgd < srcd                           # closer to the background than to the body
    r, g, b = rgb[..., 0], rgb[..., 1], rgb[..., 2]
    toward_bg |= (r - g > 45) & (b - g > 45) & (srcd > 40) & ~((src[..., 0] - src[..., 1] > 45) & (src[..., 2] - src[..., 1] > 45))   # magenta-sheet halo
    bad = edge & (pale | toward_bg)
    a[..., :3][bad] = src[bad].astype(np.uint8)
    # very faint edge pixels that were mostly background: drop them
    a[..., 3][edge & (A < 110) & (pale | toward_bg)] = 0
    # isolated specks left floating outside the body
    lab, n = nd.label(a[..., 3] > 24)
    if n:
        sizes = nd.sum(np.ones_like(lab), lab, range(1, n + 1))
        tiny = np.isin(lab, np.where(sizes < 6)[0] + 1); a[..., 3][tiny] = 0
    return a

if __name__ == '__main__':
    for p in sys.argv[1:]:
        a = np.array(Image.open(p).convert('RGBA')); b = clean(a)
        Image.fromarray(b).save(p, optimize=True)
        try: Image.fromarray(b).save(p.rsplit('.', 1)[0] + '.webp', lossless=True)
        except Exception: pass
        print(p, int((a != b).any(-1).sum()), 'px fixed')
