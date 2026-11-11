import json
from PIL import Image
from spec import LIFE, BATTLE
H='/home/claude/eb-build/out/assets/hd/'
M=json.load(open(H+'hd.json'))['c_nix']; atl=Image.open(H+'c_nix.png')
fr=lambda i: atl.crop((M['frames'][i][0],M['frames'][i][1],M['frames'][i][0]+M['frames'][i][2],M['frames'][i][1]+M['frames'][i][3]))
A=M['anims']
src={'idle':A['idle'],'walk_down':A['walk'],'walk_up':A['walk'],'walk_side':A['walk'],'work':A['spellcast'],'combat':A['idle'],'light':A['slash'],'heavy':A['thrust'],'special':A['spellcast'],'guard':A['idle'],'parry':A['idle'],'dodge':A['walk'],'hurt':A['hurt'],'ko':A['ko'],'victory':A['idle']}
def make(spec,tpl,out):
    im=Image.open(tpl).convert('RGBA'); W,Hh=im.size; G=210; top=56; rh=(Hh-top-10)//len(spec)
    for r,(label,groups) in enumerate(spec):
        y0=top+r*rh; n=sum(c for _,c in groups); cw=(W-G-20)/n; x=G
        for nm,c in groups:
            L=src.get(nm, A['idle'])
            for j in range(c):
                f=fr(L[j%len(L)]); s=(rh-30)/f.height; f=f.resize((max(1,int(f.width*s)),int(f.height*s)))
                if f.width>cw-8: s2=(cw-8)/f.width; f=f.resize((int(f.width*s2),max(1,int(f.height*s2))))
                im.alpha_composite(f,(int(x+cw/2-f.width/2),int(y0+rh-12-f.height))); x+=cw
    im.convert('RGB').save(out,quality=92)
make(LIFE,'life_template.png','/tmp/claude-0/-home-claude/7a5a8c55-a33b-57be-9427-8927ce3db7fc/scratchpad/t_life.jpg')
make(BATTLE,'battle_template.png','/tmp/claude-0/-home-claude/7a5a8c55-a33b-57be-9427-8927ce3db7fc/scratchpad/t_battle.jpg')
