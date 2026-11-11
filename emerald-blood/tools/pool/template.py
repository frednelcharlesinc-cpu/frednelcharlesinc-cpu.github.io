from PIL import Image, ImageDraw, ImageFont
from spec import LIFE, BATTLE, SUB
def font(n):
    for p in ['/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf','/usr/share/fonts/dejavu/DejaVuSans-Bold.ttf']:
        try: return ImageFont.truetype(p,n)
        except: pass
    return ImageFont.load_default()
F1,F2,F3=font(22),font(15),font(30)
def make(spec,title,out):
    W,H=1408,800; G=210; top=56; rh=(H-top-10)//len(spec)
    im=Image.new('RGB',(W,H),'white'); d=ImageDraw.Draw(im)
    d.text((14,12),title,fill=(20,20,20),font=F3)
    for r,(label,groups) in enumerate(spec):
        y0=top+r*rh; n=sum(c for _,c in groups); cw=(W-G-20)/max(n,4) if n<=6 else (W-G-20)/n
        cw=min(cw,(W-G-20)/n)
        lines=label.replace(' (', '\n(').split('\n')
        for i,l in enumerate(lines): d.text((14,y0+rh/2-14*len(lines)+i*26),l,fill=(20,20,20),font=F1 if i==0 else F2)
        x=G; k=0
        for gi,(name,c) in enumerate(groups):
            if gi: d.line([(x-3,y0+8),(x-3,y0+rh-8)],fill=(170,170,170),width=2)
            for j in range(c):
                bx0,by0,bx1,by1=x+6,y0+6,x+cw-6,y0+rh-6
                d.rectangle([bx0,by0,bx1,by1],outline=(205,205,205),width=2)
                d.line([(bx0+8,by1-14),(bx1-8,by1-14)],fill=(225,225,225),width=2)   # ground line
                tag=SUB.get(name,'%s %d'%(name.replace('_',' '),j+1))
                d.text((bx0+6,by0+4),tag,fill=(150,150,150),font=F2)
                x+=cw; k+=1
    im.save(out)
make(LIFE,'LIFE SHEET  —  world & dialogue','life_template.png')
make(BATTLE,'BATTLE SHEET  —  side view, facing right','battle_template.png')
