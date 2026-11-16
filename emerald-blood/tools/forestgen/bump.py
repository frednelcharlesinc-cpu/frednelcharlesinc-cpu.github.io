import hashlib,re,os
os.chdir('/home/claude/frednelcharlesinc-cpu.github.io/emerald-blood')
h=lambda f: hashlib.md5(open(f,'rb').read()).hexdigest()[:8]
s=open('index.html').read()
for f in ['core','reef','forest4','fc_data','lieutenants','dungeonx','dungeons','worldplus','worldplus2','worldplus3','worldplus4','worldplus5','worldplus6','worldplus7','townlife','worldplus8','townlife2','worldplus9','worldplus10','food','fishing','food2','worldplus11','deep','deep2','world']:
    s=re.sub(r'<script src="js/%s.js\?v=\w+"></script>'%f, '<script src="js/%s.js?v=%s"></script>'%(f,h('js/%s.js'%f)), s)
open('index.html','w').write(s)

# the props atlas: version = hash of the image + its layout, so a phone never mixes an old picture with a new layout
v = hashlib.md5(open('assets/props5.png','rb').read() + open('assets/props5.json','rb').read()).hexdigest()[:8]
c = open('js/core.js').read()
c = re.sub(r"\['props5', '?[\w]+'?\]", f"['props5', '{v}']", c)
open('js/core.js','w').write(c)
s = open('index.html').read()
s = re.sub(r'<script src="js/core.js\?v=\w+"></script>', '<script src="js/core.js?v=%s"></script>' % h('js/core.js'), s)
open('index.html','w').write(s)
