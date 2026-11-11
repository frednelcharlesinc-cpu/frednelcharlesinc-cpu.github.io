import json, base64, io
from PIL import Image
import numpy as np
SPEC={
'bld':{'inn':[120,33,390,383],'tavern':[628,88,325,272],'smith':[516,385,438,355],'house':[15,428,485,303],'guild':'1'},
'town':{'lantern':'31','hsign':'96','stall1':'92','stall2':'93','stall3':'94','market':'29','barrel':'45','crates':'58','pot1':'59','pot2':'44','pot3':'119','flowerbox':'121','ttree1':'97','ttree2':'95','ttree3':'112','tbush1':'105','tbush2':'124','tbush3':'125','well':'120','tstairs':'30','twall':'84','twallstairs':'73','tbridge':'74','tcobble':'53','tgrass':'80','barrels2':'98','crate1':'106'},
'north':{'n_tree1':[825,100,82,142],'n_tree2':[910,40,122,202],'n_tree3':[1030,5,197,242],'n_bush1':[1238,58,80,70],'n_bush2':[1233,133,88,58],'n_bush3':[1288,175,97,70],'n_wall':'2','n_cave':'21','n_fall':[430,10,72,735],'n_camp':'36','n_statue':'35','n_ruins':'34','n_chest':'59','n_chesto':'54','n_sign':'58','n_rock1':'22','n_rock2':'27','n_log':'28','n_bridge':'26'},
'east':{'e_tree1':'14','e_tree2':'9','e_tree3':'7','e_bush1':'8','e_bush2':'18','e_bush3':'20','e_wall':'2','e_cave':[118,238,280,232],'e_fall':[432,8,62,742],'e_camp':'39','e_statue':'38','e_ruins':'37','e_chest':'62','e_chesto':'57','e_sign':'59','e_rock1':'25','e_rock2':'30','e_log':'31','e_bridge':'29'},
'south':{'s_tree1':'8','s_tree2':'7','s_tree3':'6','s_dead':[670,162,84,120],'s_stump':'13','s_bush1':'15','s_bush2':'16','s_wall':'1','s_cave':'10','s_fall':'5','s_tent':'39','s_fire':'46','s_roll':'45','s_statue':'37','s_arch':'34','s_tablet':'54','s_chest':'53','s_chesto':'51','s_sign':'49','s_rock1':'14','s_rock2':'17','s_rock3':'19','s_log1':'21','s_log2':'20','s_bridge':'43','s_mush1':'38','s_mush2':'40','s_mush3':'41','s_mush4':'42','s_moss':'35'},
}
SPEC['west']={'w_tree1':'8','w_tree2':'7','w_tree3':'4','w_bush1':'22','w_bush2':'26','w_bush3':'34','w_wall':'5','w_cave':'43','w_fall':'3','w_tent':'47','w_fire':'53','w_roll':'52','w_statue':'48','w_mural':'45','w_chest':'57','w_chesto':'56','w_sign':'54','w_rock1':'25','w_rock2':'23','w_rock3':'20','w_log1':'35','w_log2':'38','w_bridge':'46','w_stairs':'2'}
SCALE={'bld':0.40}
import os
MUL=float(os.environ.get('MUL','1'))
OUT=os.environ.get('OUT','spr_')
out={}; meta={}
for sheet,items in SPEC.items():
  im=Image.open(sheet+'.jpg').convert('RGB'); a=np.array(im).astype(float)
  boxes=json.load(open(sheet+'_boxes.json'))
  bg=np.median(a[:6,:].reshape(-1,3),axis=0)
  for name,bx in items.items():
    x,y,w,h = boxes[int(bx)] if isinstance(bx,str) else bx
    c=a[y:y+h,x:x+w]
    d=np.sqrt(((c-bg)**2).sum(-1))
    r,g,b=c[...,0],c[...,1],c[...,2]
    magish=(r-g>70)&(b-g>25)&(g<110)
    alpha=np.clip((d-35)/40,0,1)
    alpha[magish & (d<110)]=0
    if sheet=='north': alpha[(r-g>8)&(b-g>12)&(r>100)]=0
    if sheet=='town': alpha[(r-g>40)&(b-g>8)&(b>60)]=0
    if name=='e_camp': alpha[(r>170)&(g<160)&(b>60)&(abs(g-b)<45)]=0
    if sheet=='east': alpha[(r-g>50)&(b-g>5)&(b>80)&(r<235)]=0
    # despill: pull magenta tint off edges
    rgba=np.dstack([c,alpha*255]).astype(np.uint8)
    img=Image.fromarray(rgba,'RGBA')
    bb=img.getchannel('A').point(lambda v:255 if v>40 else 0).getbbox()
    if bb: img=img.crop(bb)
    s=SCALE.get(sheet,0.36)
    if sheet=='town': s=0.54
    if name in('ttree1','ttree2','ttree3','tbush1'): s=0.75
    if 'chest' in name: s=0.26
    
    if name.endswith('_cave'): s=0.5
    if name=='w_mural': s=0.4
    if name=='w_stairs': s=0.5
    if name in('n_camp','e_camp'): s=0.42
    if name.endswith('_wall'): img.resize((64,64),Image.LANCZOS).save(OUT+name+'64.png')
    if name.endswith('_wall') or name=='twall' or name=='tcobble' or name=='tgrass': img=img.resize((32,32),Image.LANCZOS)
    elif name.endswith('_fall'): img=img.resize((44 if name[0] in 'ne' else 80,170 if name[0] in 'ne' else 150),Image.LANCZOS)
    elif 'chest' in name: img=img.resize((22,max(1,round(22*img.height/img.width))),Image.LANCZOS)
    elif name in('tstairs',): img=img.resize((32,int(32*img.height/img.width)),Image.LANCZOS)
    elif name=='twallstairs': img=img.resize((40,40),Image.LANCZOS)
    else: s*=MUL; img=img.resize((max(1,round(img.width*s)),max(1,round(img.height*s))),Image.LANCZOS)
    # harden alpha
    al=np.array(img.getchannel('A')); al=np.where(al>110,255,0).astype(np.uint8); img.putalpha(Image.fromarray(al))
    buf=io.BytesIO(); img.save(buf,'WEBP',quality=92,method=6)
    out[name]='data:image/webp;base64,'+base64.b64encode(buf.getvalue()).decode()
    meta[name]=img.size
    img.save(OUT+name+'.png')
json.dump(meta,open(OUT+'meta.json','w'))
print(len(out), sum(len(v) for v in out.values())//1024,'KB')
print(meta)
