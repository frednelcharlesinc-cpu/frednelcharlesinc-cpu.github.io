import sys,json
from PIL import Image, ImageDraw
import numpy as np
from scipy import ndimage
name=sys.argv[1]
im=Image.open(name+'.jpg').convert('RGB'); a=np.array(im).astype(int)
r,g,b=a[...,0],a[...,1],a[...,2]
# magenta: r high, g low, b mid; distance from sampled bg
bg=np.median(a[:6,:].reshape(-1,3),axis=0)
d=np.sqrt(((a-bg)**2).sum(-1))
mag=(d<60)|((r-g>80)&(b-g>30)&(abs(r-b)<110)&(g<90))
fg=~mag
fg=ndimage.binary_opening(fg,iterations=1)
lab,n=ndimage.label(ndimage.binary_closing(fg,iterations=2))
objs=ndimage.find_objects(lab)
out=[]
for i,s in enumerate(objs):
  h=s[0].stop-s[0].start; w=s[1].stop-s[1].start
  if h*w<300: continue
  out.append([s[1].start,s[0].start,w,h])
print(name,len(out))
json.dump(out,open(name+'_boxes.json','w'))
c=im.copy(); dr=ImageDraw.Draw(c)
for k,(x,y,w,h) in enumerate(out):
  dr.rectangle([x,y,x+w,y+h],outline=(255,255,0)); dr.text((x+2,y+2),str(k),fill=(255,255,255))
c.save(name+'_lab.png')
np.save(name+'_mask.npy',fg)
