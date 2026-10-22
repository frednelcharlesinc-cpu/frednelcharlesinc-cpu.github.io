/* Emberkeep: Cinder, an original dragon. Animated SVG creature with simple behaviour.
   Stages 0-1 are a resting egg. From stage 2 (hatch) Cinder moves, plays and reacts. */
(function(){
"use strict";

const EYE = {eye1:"#ffd479", eye2:"#e2741c"};
const STAGES = [
  {name:"Ember Egg",   egg:true},
  {name:"Cracking Egg",egg:true, crack:true},
  {name:"Hatchling",  size:96,  head:1.22, wing:.4,  tail:.62, horn:.55, fly:false, fire:false, speed:46,  hop:.09, voice:"Mrrp!",  c1:"#3c3743", c2:"#141217", belly:"#6a5560", vein:"#ff9a4a", horn:"#e6d9c8", hornD:"#a8998c", spines:0, ...EYE,
    ability:"Cinder walks, hops, naps and chases embers. Tap to play, hold to pet."},
  {name:"Whelp",      size:116, head:1.12, wing:.72, tail:.84, horn:.75, fly:false, fire:false, speed:62,  hop:.07, voice:"Rrr!",   c1:"#37323e", c2:"#121015", belly:"#5c4a55", vein:"#ff8a3a", horn:"#ddcdb8", hornD:"#9c8c7e", spines:3, ...EYE,
    ability:"Bigger wings. Cinder can flutter-jump high now."},
  {name:"Drake",      size:134, head:1,    wing:1,   tail:1,   horn:.95, fly:true,  fire:false, speed:82,  hop:0,   voice:"Rawr!",  c1:"#322d38", c2:"#100e13", belly:"#524250", vein:"#ff7a2b", horn:"#d4c0a4", hornD:"#8e7c6a", spines:4, ...EYE,
    ability:"Cinder can fly. Tap Let it fly to set it free across your screen."},
  {name:"Wyvern",     size:152, head:.95,  wing:1.2, tail:1.1, horn:1.1, fly:true,  fire:true,  speed:96,  hop:0,   voice:"RAWR!",  c1:"#2c2832", c2:"#0d0b10", belly:"#4a3a46", vein:"#ff6a1f", horn:"#cdb48c", hornD:"#86704e", spines:5, ...EYE,
    ability:"Cinder breathes fire."},
  {name:"Elder Wyrm", size:170, head:.9,   wing:1.35,tail:1.2, horn:1.25,fly:true,  fire:true,  speed:108, hop:0,   voice:"ROAAAR!",c1:"#27222c", c2:"#09080b", belly:"#4c3a3a", vein:"#ffbe55", horn:"#e0b860", hornD:"#9c7a36", spines:6, crown:true, eye1:"#fff0a0", eye2:"#ff9a2a",
    ability:"Fully grown. Crown of flame and an ember trail when it flies."}
];
const VB = {x:-20, y:-10, w:230, h:170};
const AX = (100-VB.x)/VB.w;   // feet anchor, as fraction of the box
const AY = (138-VB.y)/VB.h;
const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;
const rand = (a,b) => a + Math.random()*(b-a);
const pick = a => a[Math.floor(Math.random()*a.length)];
let uid = 0;

// ---------- art ----------
function eggSVG(crack, p){
  return `<svg class="dsvg" viewBox="${VB.x} ${VB.y} ${VB.w} ${VB.h}" aria-hidden="true">
  <defs><radialGradient id="${p}e" cx="40%" cy="34%" r="70%"><stop offset="0" stop-color="#4a4256"/><stop offset=".65" stop-color="#17141c"/><stop offset="1" stop-color="#08070a"/></radialGradient>
  <filter id="${p}g" x="-20%" y="-20%" width="140%" height="140%"><feGaussianBlur stdDeviation="1.8"/></filter></defs>
  <ellipse cx="100" cy="94" rx="34" ry="44" fill="url(#${p}e)" stroke="#2c2634" stroke-width="1.5"/>
  <g fill="none" stroke="#ff7a2b" stroke-linecap="round" class="pulse">
    <g filter="url(#${p}g)" stroke-width="3" opacity=".8"><path d="M84 60 q6 10 -2 18 q-6 8 2 16"/><path d="M114 70 q-6 8 0 16 q5 7 -1 14"/><path d="M92 112 q8 6 18 2"/></g>
    <g stroke-width="1.3"><path d="M84 60 q6 10 -2 18 q-6 8 2 16"/><path d="M114 70 q-6 8 0 16 q5 7 -1 14"/><path d="M92 112 q8 6 18 2"/></g></g>
  ${crack?`<g class="pulse" fill="none" stroke-linecap="round"><path d="M78 74 l9 10 -7 9 11 9 -6 11" stroke="#ffd27a" stroke-width="2.8"/><path d="M122 92 l-8 9 7 8 -8 9" stroke="#ffb347" stroke-width="2.2"/></g>`:""}
  <ellipse cx="86" cy="70" rx="7" ry="13" fill="#fff" opacity=".1"/></svg>`;
}
const sc = (s,x,y) => `translate(${x} ${y}) scale(${s}) translate(${-x} ${-y})`;
function creatureSVG(c, p){
  // Front-facing chibi. Symmetric parts are drawn once and mirrored across x=100.
  const M = inner => `<g transform="translate(200 0) scale(-1 1)">${inner}</g>`;
  const V = (paths,w) => `<g fill="none" stroke="${c.vein}" stroke-linecap="round" class="pulse"><g filter="url(#${p}g)" stroke-width="${w*2.6}" opacity=".75">${paths}</g><g stroke-width="${w}">${paths}</g></g>`;
  const WING = "M120 96 C130 72 148 56 172 50 C166 60 166 68 172 76 C162 74 154 80 152 88 C144 84 136 90 132 102 Z";
  const wing = cls => `<g class="${cls}"><g transform="${sc(c.wing,120,96)}">
      <path d="${WING}" fill="url(#${p}w)" stroke="${c.c2}" stroke-width="1"/>
      <path d="M120 96 C132 74 150 60 172 50 M128 98 C138 86 150 80 172 76 M132 102 C138 96 146 92 152 88" stroke="${c.hornD}" stroke-width="1.1" fill="none" opacity=".65"/>
      <path d="M172 50 C166 60 166 68 172 76 C162 74 154 80 152 88 C144 84 136 90 132 102" stroke="${c.vein}" stroke-width="1.1" fill="none" opacity=".6"/></g></g>`;
  const horn = `<g transform="${sc(c.horn,120,44)}"><path d="M114 44 C116 28 128 18 142 20 C152 22 156 32 150 38 C150 32 146 28 140 28 C130 28 124 36 124 48 Z" fill="${c.horn}"/><path d="M150 38 C152 34 152 28 148 25 C150 30 149 34 146 37Z" fill="${c.vein}" opacity=".8"/></g>`;
  const foot = cls => `<g class="${cls}"><ellipse cx="83" cy="134" rx="13" ry="7.5" fill="url(#${p}b)"/><path d="M75 139.5 l1.8 3 1.8 -3z M81.5 140.5 l1.8 3 1.8 -3z M88 139.5 l1.8 3 1.8 -3z" fill="${c.horn}"/></g>`;
  const arm = cls => `<g class="${cls}"><path d="M76 100 C70 108 72 118 80 122 C86 124 90 120 88 114 C86 110 82 108 80 102 Z" fill="url(#${p}b)"/><path d="M80 122.5 l1.4 2.6 1.4 -2.6z M85 121.6 l1.4 2.6 1.4 -2.6z" fill="${c.horn}"/></g>`;
  const eye = (x,s) => `<ellipse cx="${x}" cy="64" rx="${10*s}" ry="${12*s}" fill="#0c080b"/>
      <ellipse cx="${x}" cy="64.6" rx="${8.8*s}" ry="${10.8*s}" fill="url(#${p}i)"/>
      <ellipse cx="${x}" cy="70" rx="${6*s}" ry="${3.4*s}" fill="#fff" opacity=".12"/>`;
  const pupils = `<g class="pupils"><circle cx="84" cy="65.5" r="4.6" fill="#0c080b"/><circle cx="116" cy="65.5" r="4.6" fill="#0c080b"/>
      <circle cx="80.6" cy="59.4" r="3" fill="#fff"/><circle cx="112.6" cy="59.4" r="3" fill="#fff"/>
      <circle cx="87.4" cy="70.2" r="1.3" fill="#fff" opacity=".85"/><circle cx="119.4" cy="70.2" r="1.3" fill="#fff" opacity=".85"/></g>`;
  return `<svg class="dsvg" viewBox="${VB.x} ${VB.y} ${VB.w} ${VB.h}" aria-hidden="true">
  <defs>
    <radialGradient id="${p}b" cx="40%" cy="26%" r="90%"><stop offset="0" stop-color="${c.c1}"/><stop offset="1" stop-color="${c.c2}"/></radialGradient>
    <linearGradient id="${p}w" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="${c.c1}"/><stop offset="1" stop-color="${c.c2}"/></linearGradient>
    <linearGradient id="${p}i" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="${c.eye1}"/><stop offset="1" stop-color="${c.eye2}"/></linearGradient>
    <linearGradient id="${p}f" x1="0" y1="1" x2="0" y2="0"><stop offset="0" stop-color="#ff4a1a"/><stop offset=".55" stop-color="#ffb347"/><stop offset="1" stop-color="#fff2b0"/></linearGradient>
    <filter id="${p}g" x="-30%" y="-30%" width="160%" height="160%"><feGaussianBlur stdDeviation="1.6"/></filter>
  </defs>
  <g class="all">
    <g class="tail"><g transform="${sc(c.tail,110,128)}">
      <path d="M106 128 C130 134 148 128 156 114 C159 108 162 104 166 102 C164 110 161 118 156 124 C146 138 126 142 104 138 Z" fill="url(#${p}b)"/>
      ${V(`<path d="M112 134 C130 136 144 130 152 120"/>`,1)}
      <path class="flame" d="M166 104 C162 98 162 90 168 82 C168 88 172 90 174 88 C176 94 174 100 166 104 Z" fill="url(#${p}f)"/></g></g>
    ${wing("wingR")}${M(wing("wingL"))}
    <ellipse cx="100" cy="112" rx="31" ry="28" fill="url(#${p}b)"/>
    <ellipse cx="100" cy="119" rx="18.5" ry="17" fill="${c.belly}"/>
    <path d="M88 110 q12 4 24 0 M87 117 q13 4 26 0 M89 124 q11 3.6 22 0 M92 130 q8 2.6 16 0" stroke="${c.c2}" stroke-width="1" fill="none" opacity=".55"/>
    ${V(`<path d="M76 104 q5 6 1 12 q-3 5 2 9"/><path d="M124 104 q-5 6 -1 12 q3 5 -2 9"/>`,1.1)}
    ${foot("footL")}${M(foot("footR"))}
    ${arm("armL")}${M(arm("armR"))}
    <g class="head"><g transform="${sc(c.head,100,94)}">
      ${horn}${M(horn)}
      <ellipse cx="100" cy="62" rx="37" ry="32" fill="url(#${p}b)"/>
      <path d="M66 66 l-8 4 8 3z" fill="${c.hornD}"/><path d="M134 66 l8 4 -8 3z" fill="${c.hornD}"/>
      ${c.crown?`<path class="pulse" d="M86 34 C88 24 94 26 94 18 C100 24 100 22 100 12 C100 22 100 24 106 18 C106 26 112 24 114 34 Z" fill="url(#${p}f)"/>`:""}
      ${V(`<path d="M100 32 l-3 7 4 6 -2 6"/>`,1.1)}
      <ellipse cx="100" cy="80" rx="15" ry="10" fill="${c.c1}" opacity=".55"/>
      ${eye(84,1)}${eye(116,1)}${pupils}
      <g class="lid" transform="translate(0 52) scale(1 0) translate(0 -52)">
        <ellipse cx="84" cy="64" rx="11" ry="13" fill="${c.c1}"/><ellipse cx="116" cy="64" rx="11" ry="13" fill="${c.c1}"/>
        <path d="M75 72 q9 5 18 0 M107 72 q9 5 18 0" stroke="#0b080d" stroke-width="1.5" fill="none" stroke-linecap="round"/></g>
      <ellipse cx="72" cy="79" rx="5.5" ry="2.8" fill="#ff6a4a" opacity=".35"/><ellipse cx="128" cy="79" rx="5.5" ry="2.8" fill="#ff6a4a" opacity=".35"/>
      <circle cx="95.5" cy="77" r="1.4" fill="${c.vein}"/><circle cx="104.5" cy="77" r="1.4" fill="${c.vein}"/>
      <path d="M93 85 q7 4.5 14 0" stroke="#0b080d" stroke-width="1.5" fill="none" stroke-linecap="round"/>
      <path d="M101.5 86.4 l1.4 2.4 1.4 -2.6z" fill="#f4ece4"/>
      <g class="jaw" transform="translate(0 85) scale(1 0) translate(0 -85)">
        <path d="M92 85 C94 96 106 96 108 85 Z" fill="#2a0810"/><ellipse cx="100" cy="92" rx="4.8" ry="2.4" fill="#e0605a"/>
        <path d="M94 85 l1.6 2.8 1.6 -2.8z M102.8 85 l1.6 2.8 1.6 -2.8z" fill="#f4ece4"/></g>
    </g></g>
  </g></svg>`;
}
function artFor(stage){
  const c = STAGES[stage], p = "d"+(uid++);
  return c.egg ? eggSVG(!!c.crack, p) : creatureSVG(c, p);
}

// ---------- creature ----------
class Creature {
  constructor(){
    this.stage=-1; this.t=0; this.x=0; this.y=0; this.face=1; this.state="idle"; this.timer=2;
    this.walkPh=0; this.blinkT=3; this.blinkLeft=0; this.happyT=0; this.vy=0; this.embers=[];
    this.ctx={}; this.free=false; this.lastFree=-999; this.evolving=false; this.pressing=false; this.lastHeart=0;
  }
  mount(scene){
    this.scene = scene;
    this.shadow = document.createElement("div"); this.shadow.className="dshadow"; scene.append(this.shadow);
    this.el = document.createElement("div"); this.el.className="dragon"; scene.append(this.el);
    this.overlay = document.createElement("div"); this.overlay.className="free-layer"; document.body.append(this.overlay);
    scene.addEventListener("pointerdown", e=>{
      if(e.target.closest(".dragon")) return;
      if(!this.hatched) return;
      const r=scene.getBoundingClientRect(); this.dropEmber(e.clientX-r.left, e.clientY-r.top);
    });
    this.el.addEventListener("pointerdown", e=>{
      if(!this.hatched) return;
      e.stopPropagation(); this.pressing=true; this.pressAt=this.t; this.petting=false;
    });
    const up = ()=>{ if(!this.pressing) return; this.pressing=false; if(this.petting) this.say(pick(["*purrs*","Again!","Hehe","♥"])); else this.tap(); };
    window.addEventListener("pointerup", up); window.addEventListener("pointercancel", ()=>{ this.pressing=false; });
    scene.addEventListener("pointermove", e=>{ const r=scene.getBoundingClientRect(); this.look={x:e.clientX-r.left, y:e.clientY-r.top, t:this.t}; });
    let last=performance.now();
    const loop = now => { const dt=Math.min(.05,(now-last)/1000); last=now; this.frame(dt); requestAnimationFrame(loop); };
    requestAnimationFrame(loop);
  }
  get hatched(){ return this.stage>=2; }
  get W(){ return this.scene.clientWidth; }
  get ground(){ return this.scene.clientHeight - 20; }
  layer(){ return this.free ? this.overlay : this.scene; }

  setStage(st, force){
    if(st===this.stage || (this.evolving && !force)) return;
    const first = this.stage<0;
    this.stage = st; this.cfg = STAGES[st];
    this.w = this.cfg.egg ? 124 : this.cfg.size; this.h = this.w*VB.h/VB.w;
    this.el.style.width=this.w+"px"; this.el.style.height=this.h+"px";
    this.el.innerHTML = artFor(st);
    this.bubble = document.createElement("div"); this.bubble.className="bubble"; this.el.append(this.bubble);
    this.el.classList.toggle("is-egg", !!this.cfg.egg);
    const q = s => this.el.querySelector(s);
    this.parts = {all:q(".all"), wingL:q(".wingL"), wingR:q(".wingR"), footL:q(".footL"), footR:q(".footR"), armL:q(".armL"), armR:q(".armR"), tail:q(".tail"), head:q(".head"), jaw:q(".jaw"), lid:q(".lid"), pupils:q(".pupils")};
    if(first || this.cfg.egg){ this.x=this.W/2; }
    this.y=this.ground; this.vy=0; this.state="idle"; this.timer=1.2;
    this.embers.forEach(e=>e.el.remove()); this.embers=[];
    this.place(0);
  }

  // ---- behaviour ----
  decide(){
    const c=this.cfg;
    if(this.embers.length){ this.state="chase"; return; }
    if(this.y < this.ground-2 && !c.fly){ this.state="fall"; return; }
    const opts=[["wander",40],["idle",22],["nap",this.ctx.fasting?3:7]];
    if(!c.fly) opts.push(["hop",12]);
    if(c.fly) opts.push(["fly",26]);
    if(c.fire) opts.push(["fire",this.ctx.goalHit?16:8]);
    if(this.ctx.fasting) opts.push(["talk",9]);
    if(c.fly && !reduce && this.t-this.lastFree>180 && document.visibilityState==="visible") opts.push(["free",3]);
    let tot=opts.reduce((a,o)=>a+o[1],0), r=Math.random()*tot, choice="idle";
    for(const [k,w] of opts){ if((r-=w)<=0){ choice=k; break; } }
    const air = this.y < this.ground-2;
    switch(choice){
      case "wander":
        if(air){ this.state="land"; break; }
        this.tx = rand(this.w*.5, this.W-this.w*.5); this.state="walk"; break;
      case "idle": this.state="idle"; this.timer=rand(2,5); break;
      case "nap":
        if(air){ this.state="land"; break; }
        this.state="sleep"; this.timer=rand(8,16); break;
      case "hop": this.jump(c.size*2.4); break;
      case "fly": this.tx=rand(this.w*.5,this.W-this.w*.5); this.ty=rand(this.h*.9, this.ground-30); this.state="fly"; break;
      case "fire": this.breathe(); break;
      case "talk": this.say(this.fastLine()); this.state="idle"; this.timer=3; break;
      case "free": this.flyFree(); break;
    }
  }
  fastLine(){
    const v=this.cfg.voice, h=this.ctx.hour||0;
    if(this.ctx.goalHit) return pick([`${v} We hit the goal!`,"Look at us burn!","Proud of you."]);
    return pick([`${v} Hour ${h}!`,"Water break?","Stay strong. I'm growing!","Hunger is just a wave.","Feed me hours, not snacks.","Keep the fire going!"]);
  }
  jump(power){ this.state="jump"; this.vy=-power; }
  breathe(){ if(!this.cfg.fire) return; this.state="fire"; this.timer=1.4; this.fireT=0; if(Math.random()<.5) this.say(this.cfg.voice); }
  tap(){
    if(!this.hatched) return;
    if(this.state==="sleep"){ this.state="idle"; this.timer=2; this.say("…huh? I'm up!"); return; }
    this.happyT=1.2; this.hearts(4);
    const c=this.cfg, r=Math.random();
    if(c.fire && r<.3) this.breathe();
    else if(c.fly){ this.spin(); this.say(pick([c.voice,"Hehe!","Again!"])); }
    else { this.jump(c.size*2.6); this.say(pick([c.voice,"*wiggles*","Hehe!"])); }
  }
  pet(){ if(!this.hatched) return; this.happyT=2; this.hearts(6); this.say(pick(["*purrs*","♥","Mmm…"])); if(this.state==="sleep"){ this.state="idle"; this.timer=2; } }
  spin(){ const s=this.el.querySelector(".dsvg"); if(!s||reduce) return; s.animate([{rotate:"0deg"},{rotate:`${360*this.face}deg`}],{duration:650,easing:"ease-in-out"}); }
  say(text){
    if(!this.bubble) return;
    this.bubble.textContent=text; this.bubble.classList.add("on");
    clearTimeout(this.bt); this.bt=setTimeout(()=>this.bubble.classList.remove("on"),2400);
  }
  tossEmber(){ if(!this.hatched) return; this.dropEmber(rand(30,this.W-30), rand(30,90)); }
  dropEmber(x,y){
    if(!this.hatched || this.free) return;
    if(this.embers.length>=3){ const o=this.embers.shift(); o.el.remove(); }
    const el=document.createElement("span"); el.className="ember"; this.scene.append(el);
    const e={x,y,vy:0,el,life:14}; this.embers.push(e); this.moveEl(el,x,y);
    if(this.state!=="sleep" && this.state!=="fire" && this.state!=="free") this.state="chase";
    else if(this.state==="sleep" && Math.random()<.5){ this.state="chase"; this.say("Ember?!"); }
  }
  flyFree(){
    if(!this.cfg || !this.cfg.fly || this.free) return false;
    const r=this.scene.getBoundingClientRect();
    this.free=true; this.lastFree=this.t; this.overlay.append(this.el); this.shadow.hidden=true;
    this.x+=r.left; this.y+=r.top;
    const vw=innerWidth, vh=innerHeight, n=reduce?2:5;
    this.path=Array.from({length:n},()=>({x:rand(60,vw-60), y:rand(110,vh-150)}));
    this.state="free"; this.say(pick(["Freedom!","Wheee!","Watch this!"]));
    return true;
  }
  endFree(){
    const r=this.scene.getBoundingClientRect();
    this.free=false; this.scene.append(this.el); this.shadow.hidden=false;
    this.x-=r.left; this.y-=r.top; this.x=Math.max(this.w*.5,Math.min(this.W-this.w*.5,this.x));
    this.state="land";
  }

  // ---- particles ----
  moveEl(el,x,y){ el.style.transform=`translate3d(${x}px,${y}px,0)`; }
  particle(cls, x, y, dx, dy, dur, text, scale){
    const el=document.createElement("span"); el.className="pt "+cls; if(text) el.textContent=text;
    this.layer().append(el);
    const a=el.animate([{transform:`translate3d(${x}px,${y}px,0) scale(${scale?scale[0]:1})`,opacity:1},{transform:`translate3d(${x+dx}px,${y+dy}px,0) scale(${scale?scale[1]:1})`,opacity:0}],{duration:dur,easing:"ease-out"});
    a.onfinish=()=>el.remove();
  }
  hearts(n){ for(let i=0;i<n;i++) setTimeout(()=>this.particle("heart", this.x+rand(-this.w*.3,this.w*.3), this.y-this.h*.7, rand(-14,14), -rand(40,70), 1100, "♥"), i*90); }
  sparkBurst(x,y,n){ for(let i=0;i<n;i++){ const a=rand(0,Math.PI*2), d=rand(14,34); this.particle("spark",x,y,Math.cos(a)*d,Math.sin(a)*d,rand(400,700)); } }
  mouth(){ return {x:this.x, y:this.y-this.h*(.3+(this.cfg.head-1)*.05)}; }

  // ---- per frame ----
  frame(dt){
    this.t+=dt;
    if(!this.cfg) return;
    if(this.cfg.egg){ this.x=this.W/2; this.y=this.ground; this.place(0); return; }
    const c=this.cfg, t=this.t;
    let walking=false, flap=0;
    this.happyT=Math.max(0,this.happyT-dt);

    // embers
    for(const e of this.embers){
      e.life-=dt;
      const floor=this.ground-6;
      if(e.y<floor){ e.vy += (c.fly?60:500)*dt; e.vy=Math.min(e.vy, c.fly?50:600); e.y=Math.min(floor,e.y+e.vy*dt); }
      this.moveEl(e.el,e.x,e.y);
      if(e.life<0){ e.el.remove(); }
    }
    this.embers=this.embers.filter(e=>e.life>=0);

    // pet hold
    if(this.pressing && this.t-this.pressAt>.4){ this.petting=true; this.happyT=.5; if(this.t-this.lastHeart>.18){ this.lastHeart=this.t; this.particle("heart",this.x+rand(-this.w*.25,this.w*.25),this.y-this.h*.7,rand(-10,10),-rand(40,60),1000,"♥"); } if(this.state==="sleep"){ this.state="idle"; this.timer=2; } }

    switch(this.state){
      case "idle":
        if(c.fly && this.y<this.ground-2){ flap=.7; this.y+=Math.sin(t*3)*.3; }
        if((this.timer-=dt)<=0) this.decide();
        if(this.look && t-this.look.t<2 && Math.abs(this.look.x-this.x)>10) this.face=this.look.x>this.x?1:-1;
        break;
      case "walk": {
        const dx=this.tx-this.x; this.face=dx>0?1:-1; walking=true;
        this.x+=this.face*Math.min(Math.abs(dx),c.speed*dt);
        if(Math.abs(dx)<3){ this.state="idle"; this.timer=rand(1.5,4); }
        break; }
      case "fly": case "hover": {
        flap=1;
        if(this.state==="hover"){ this.y+=Math.sin(t*3)*.3; if((this.timer-=dt)<=0){ if(Math.random()<.5){ this.tx=rand(this.w*.5,this.W-this.w*.5); this.ty=rand(this.h*.9,this.ground-30); this.state="fly"; } else this.state="land"; } break; }
        const dx=this.tx-this.x, dy=this.ty-this.y, d=Math.hypot(dx,dy), sp=c.speed*1.6*dt;
        if(Math.abs(dx)>2) this.face=dx>0?1:-1;
        if(d<4){ this.state="hover"; this.timer=rand(1,2.5); }
        else { this.x+=dx/d*Math.min(sp,d); this.y+=dy/d*Math.min(sp,d); }
        break; }
      case "land":
        flap=.6; this.y=Math.min(this.ground,this.y+90*dt);
        if(this.y>=this.ground){ this.state="idle"; this.timer=rand(1,3); }
        break;
      case "fall": case "jump":
        if(!c.fly) flap=c.wing>.5?1:.5;
        this.vy+=620*dt; this.y+=this.vy*dt;
        if(this.y>=this.ground){ this.y=this.ground; this.vy=0; this.state="idle"; this.timer=rand(.8,2.5); if(this.embers.length) this.state="chase"; }
        break;
      case "sleep":
        if(Math.random()<dt*.7) this.particle("zz", this.x+this.face*this.w*.25, this.y-this.h*.6, rand(10,24), -rand(30,46), 1600, "z");
        if((this.timer-=dt)<=0){ this.state="idle"; this.timer=2; this.say("*yawn*"); }
        break;
      case "fire": {
        this.fireT-=dt;
        if(this.fireT<=0){ this.fireT=.045; const m=this.mouth(); this.particle("fire",m.x,m.y,this.face*rand(10,55)+rand(-15,15),rand(-6,24),rand(420,620),"",[.5,2.6]); }
        if((this.timer-=dt)<=0){ this.state="idle"; this.timer=rand(1.5,3); }
        break; }
      case "chase": {
        const e=this.embers[0];
        if(!e){ this.state = this.y<this.ground-2 && c.fly ? "land" : "idle"; this.timer=rand(1,2); break; }
        const side = e.x>=this.x?1:-1, reach=0;
        if(c.fly && e.y<this.ground-24){
          flap=1; const tx=e.x-side*reach, ty=e.y+this.h*.42; const dx=tx-this.x, dy=ty-this.y, d=Math.hypot(dx,dy), sp=c.speed*2*dt;
          this.face=side; if(d>3){ this.x+=dx/d*Math.min(sp,d); this.y+=dy/d*Math.min(sp,d); }
        } else {
          if(this.y<this.ground-2){ if(c.fly){ flap=.7; this.y=Math.min(this.ground,this.y+120*dt); } else { this.state="fall"; break; } }
          const tx=e.x-side*reach; const dx=tx-this.x; this.face=side;
          if(Math.abs(dx)>3){ walking=this.y>=this.ground-2; this.x+=Math.sign(dx)*Math.min(Math.abs(dx),c.speed*1.5*dt); }
        }
        const m=this.mouth();
        if(Math.hypot(m.x-e.x,m.y-e.y) < Math.max(16,this.w*.2) || (e.y>=this.ground-7 && Math.abs((e.x-side*reach)-this.x)<5 && this.y>=this.ground-3)){
          e.el.remove(); this.embers.shift(); this.sparkBurst(e.x,e.y,10); this.happyT=1.2; this.jawT=.3;
          this.say(pick(["Nom!","Yum!","*crunch*","Warm!"]));
          if(!this.embers.length){ this.state= this.y<this.ground-2 ? (c.fly?"hover":"fall") : "idle"; this.timer=rand(1,2.5); }
        }
        break; }
      case "free": {
        flap=1;
        const r=this.scene.getBoundingClientRect();
        const tgt = this.path.length ? this.path[0] : {x:r.left+Math.max(this.w*.5,Math.min(r.width-this.w*.5,this.x-r.left)), y:r.top+this.ground};
        const dx=tgt.x-this.x, dy=tgt.y-this.y, d=Math.hypot(dx,dy), sp=c.speed*2.8*dt;
        if(Math.abs(dx)>2) this.face=dx>0?1:-1;
        if(d<8){ if(this.path.length) this.path.shift(); else { this.endFree(); break; } }
        else { this.x+=dx/d*Math.min(sp,d); this.y+=dy/d*Math.min(sp,d); }
        if(c.fire && Math.random()<dt*.8){ this.state="free"; const m=this.mouth(); for(let i=0;i<8;i++) setTimeout(()=>{ const mm=this.mouth(); this.particle("fire",mm.x,mm.y,this.face*rand(10,55),rand(-6,24),500,"",[.5,2.6]); },i*45); }
        if(c.crown && Math.random()<dt*14) this.particle("spark",this.x-this.face*this.w*.3,this.y-this.h*.45,rand(-8,8),rand(10,30),700);
        break; }
    }
    if(walking) this.walkPh+=dt*(c.speed/5.5);
    if(this.jawT>0) this.jawT-=dt;
    this.pose(t, walking, flap);
    this.place(walking && c.hop ? -Math.abs(Math.sin(this.walkPh))*c.size*c.hop : 0);
  }

  pose(t, walking, flap){
    const P=this.parts, c=this.cfg, sleeping=this.state==="sleep", happy=this.happyT>0;
    const set=(el,v)=>{ if(el) el.setAttribute("transform",v); };
    const breath=1+Math.sin(t*(sleeping?1.4:2.4))*.02;
    const sway = walking ? Math.sin(this.walkPh)*5 : 0;
    set(P.all, `translate(0 ${sleeping?3:0}) rotate(${sway} 100 138) translate(100 138) scale(${1/breath} ${breath}) translate(-100 -138)`);
    // wings: tucked at rest, flap when flying (mirrored wing follows automatically)
    let wa;
    if(flap>0) wa=8+Math.sin(t*(c.fly?13:17))*30*flap;
    else if(happy) wa=18+Math.sin(t*18)*14;
    else wa=sleeping?46:38+Math.sin(t*1.3)*3;
    set(P.wingR,`rotate(${wa} 120 96)`); set(P.wingL,`rotate(${wa} 120 96)`);
    // feet: waddle; tuck when flying
    let fl=0, fr=0;
    if(walking){ fl=-Math.max(0,Math.sin(this.walkPh))*5; fr=-Math.max(0,-Math.sin(this.walkPh))*5; }
    else if(flap>0 && this.y<this.ground-4){ fl=fr=-6; }
    set(P.footL,`translate(0 ${fl})`); set(P.footR,`translate(0 ${fr})`);
    // arms: wave when happy
    const aw = happy ? Math.sin(t*14)*22 : Math.sin(t*2.4)*2;
    set(P.armL,`rotate(${-Math.abs(aw)*.4} 80 102)`); set(P.armR,`rotate(${-aw} 80 102)`);
    // tail
    const ta=Math.sin(t*2)*7+(happy?Math.sin(t*14)*14:0);
    set(P.tail,`rotate(${ta} 106 132)`);
    // head tilt + look
    let lx=0, ly=0, tilt=Math.sin(t*1.7)*2.5;
    if(this.look && t-this.look.t<2.5 && !sleeping){
      lx=Math.max(-1,Math.min(1,(this.look.x-this.x)/60))*this.face;
      ly=Math.max(-1,Math.min(1,(this.look.y-(this.y-this.h*.6))/60));
      tilt+=lx*5;
    }
    if(sleeping) tilt=8;
    set(P.head,`translate(0 ${sleeping?4:0}) rotate(${tilt} 100 94)`);
    set(P.pupils,`translate(${lx*2.6} ${ly*1.8})`);
    set(P.jaw,`translate(0 85) scale(1 ${(this.state==="fire"||this.jawT>0)?1:(happy?.6:0)}) translate(0 -85)`);
    // eyes
    this.blinkT-=1/60; if(this.blinkT<=0){ this.blinkLeft=.12; this.blinkT=rand(2.5,6); }
    if(this.blinkLeft>0) this.blinkLeft-=1/60;
    const k = sleeping||this.blinkLeft>0 ? 1 : happy ? .42 : 0;
    set(P.lid,`translate(0 52) scale(1 ${k}) translate(0 -52)`);
  }

  place(hop){
    const x=this.x, y=this.y+hop;
    this.el.style.transform=`translate3d(${x-this.w*AX}px,${y-this.h*AY}px,0)`;
    const s=this.el.querySelector(".dsvg"); if(s) s.style.transform=`scaleX(${this.face})`;
    if(!this.free){
      const alt=Math.max(0,this.ground-y), k=Math.max(.35,1-alt/220), sw=this.w*.62*k;
      this.shadow.style.width=sw+"px";
      this.shadow.style.transform=`translate3d(${x-sw/2}px,${this.ground-4}px,0)`;
      this.shadow.style.opacity=k;
    }
  }

  // ---- evolution / hatching ----
  evolve(from, to, onDone){
    this.evolving=true;
    const hatch = to===2;
    const ov=document.createElement("div"); ov.className="evo"; ov.setAttribute("role","dialog"); ov.setAttribute("aria-label","Cinder is evolving");
    ov.innerHTML=`<div class="flash"></div><div class="evo-box"><p class="label">${hatch?"The egg is moving…":"Something's happening…"}</p><div class="art shake"></div><h3 hidden></h3><p class="ab" hidden></p><button class="primary" type="button" hidden>Continue</button></div>`;
    document.body.append(ov);
    const art=ov.querySelector(".art"), h3=ov.querySelector("h3"), ab=ov.querySelector(".ab"), btn=ov.querySelector("button"), lab=ov.querySelector(".label"), fl=ov.querySelector(".flash");
    art.innerHTML=artFor(from);
    setTimeout(()=>{
      fl.animate([{opacity:0},{opacity:1},{opacity:0}],{duration:900,easing:"ease-out"});
      setTimeout(()=>{
        art.classList.remove("shake"); art.classList.add("float");
        art.innerHTML=artFor(to);
        lab.textContent = hatch ? "Cinder hatched!" : `Cinder evolved`;
        h3.textContent = hatch ? "Hello, Hatchling" : `Now a ${STAGES[to].name}`; h3.hidden=false;
        ab.textContent = STAGES[to].ability||""; ab.hidden=!ab.textContent;
        btn.hidden=false; btn.focus();
        for(let i=0;i<24;i++){ const sp=document.createElement("span"); sp.className="pt spark"; ov.append(sp);
          const cx=innerWidth/2, cy=innerHeight/2-40, a=rand(0,Math.PI*2), d=rand(60,180);
          sp.animate([{transform:`translate3d(${cx}px,${cy}px,0)`,opacity:1},{transform:`translate3d(${cx+Math.cos(a)*d}px,${cy+Math.sin(a)*d}px,0)`,opacity:0}],{duration:rand(700,1300),easing:"ease-out"}).onfinish=()=>sp.remove(); }
      },300);
    }, reduce?600:2200);
    btn.onclick=()=>{
      ov.remove(); this.evolving=false; this.setStage(to,true);
      this.sparkBurst(this.x,this.y-this.h*.4,16); this.happyT=1.5;
      setTimeout(()=>this.say(hatch?"Peep! Hi!":`${this.cfg.voice} Look at me!`),300);
      onDone&&onDone();
    };
  }
  setContext(ctx){ this.ctx=ctx; }
}

window.Dragon = { Creature, STAGES, artFor };
})();
