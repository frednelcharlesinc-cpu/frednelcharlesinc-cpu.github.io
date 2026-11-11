import json,sys
from PIL import Image, ImageDraw
k,t=sys.argv[1],sys.argv[2]; L=json.load(open(f'src/{k}/{t}/frames.json'))
rows={}
for n,f in L: rows.setdefault(n,[]).append(Image.open(f'src/{k}/{t}/{f}'))
W=1400; o=Image.new('RGB',(W,150*len(rows)),(40,60,50)); d=ImageDraw.Draw(o)
for r,(n,ims) in enumerate(rows.items()):
    x=110; d.text((4,r*150+60),n,fill=(255,255,0))
    for im in ims:
        im=im.copy(); im.thumbnail((180,140)); o.paste(im,(x,r*150+5),im); x+=im.width+8
o.save(f'/tmp/claude-0/-home-claude/7a5a8c55-a33b-57be-9427-8927ce3db7fc/scratchpad/peek_{k}.png')
