/* Emberkeep: Cinder, an original dragon. Animated SVG creature with simple behaviour.
   Stages 0-1 are a resting egg. From stage 2 (hatch) Cinder moves, plays and reacts. */
(function(){
"use strict";

const STAGES = [
  {name:"Ember Egg",   egg:true},
  {name:"Cracking Egg",egg:true, crack:true},
  {name:"Hatchling",  size:78,  head:1.38, wing:.38, tail:.6,  horn:.45, eye:1.45, fly:false, fire:false, speed:46,  hop:.09, voice:"Peep!",  c1:"#e2463a", c2:"#7e1a1e", belly:"#f0a070", spines:0,
    ability:"Cinder walks, hops, naps and chases embers. Tap to play, hold to pet."},
  {name:"Whelp",      size:100, head:1.2,  wing:.72, tail:.82, horn:.75, eye:1.2,  fly:false, fire:false, speed:62,  hop:.07, voice:"Rrr!",   c1:"#c8322e", c2:"#5e1418", belly:"#e39462", spines:3,
    ability:"Bigger wings. Cinder can flutter-jump high now."},
  {name:"Drake",      size:122, head:1.05, wing:1,   tail:1,   horn:1,   eye:1,    fly:true,  fire:false, speed:82,  hop:0,   voice:"Rawr!",  c1:"#b3221f", c2:"#4a0f12", belly:"#d8894f", spines:4,
    ability:"Cinder can fly. Tap Let it fly to set it free across your screen."},
  {name:"Wyvern",     size:142, head:1,    wing:1.2, tail:1.1, horn:1.15,eye:.95,  fly:true,  fire:true,  speed:96,  hop:0,   voice:"RAWR!",  c1:"#9c1a1c", c2:"#3a0b0e", belly:"#d9a04f", spines:5,
    ability:"Cinder breathes fire."},
  {name:"Elder Wyrm", size:164, head:.95,  wing:1.35,tail:1.2, horn:1.35,eye:.9,   fly:true,  fire:true,  speed:108, hop:0,   voice:"ROAAAR!",c1:"#86141a", c2:"#2a070a", belly:"#e8b65a", spines:6, crown:true,
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
  <defs><radialGradient id="${p}e" cx="42%" cy="38%" r="65%"><stop offset="0" stop-color="#5a2226"/><stop offset=".7" stop-color="#1f0d10"/><stop offset="1" stop-color="#0c0607"/></radialGradient></defs>
  <ellipse cx="100" cy="94" rx="34" ry="44" fill="url(#${p}e)" stroke="#6a2a2e" stroke-width="1.5"/>
  <g fill="none" stroke="#ff4a2b" stroke-width="1.4" class="pulse">
    <path d="M76 76 q12 7 24 0 q12 -7 24 0"/><path d="M68 98 q16 8 32 0 q16 -8 32 0"/><path d="M72 120 q14 7 28 0 q14 -7 28 0"/></g>
  ${crack?`<path d="M82 64 l8 12 -7 9 10 10 -5 11" stroke="#ffb347" stroke-width="2.6" fill="none" class="pulse"/><path d="M118 84 l-8 9 6 8 -7 10" stroke="#ff4a2b" stroke-width="2.2" fill="none" class="pulse"/>`:""}
  <ellipse cx="86" cy="72" rx="7" ry="12" fill="#fff" opacity=".08"/></svg>`;
}
const sc = (s,x,y) => `translate(${x} ${y}) scale(${s}) translate(${-x} ${-y})`;
function creatureSVG(c, p){
  const WING = "M100 88 C96 60 84 34 58 20 C62 36 60 48 52 56 C64 54 72 60 74 70 C82 66 90 74 92 88 Z";
  const LB = "M74 112 C72 122 74 130 75 138 L90 138 C88 130 90 120 93 112 Z";
  const LF = "M108 114 C108 124 110 131 110 138 L124 138 C122 130 122 121 123 112 Z";
  const sp = Array.from({length:c.spines},(_,i)=>{ const x=82+i*(36/Math.max(1,c.spines)); return `<path d="M${x} 85 l4 -9 4 9z" fill="#e8c49a"/>`; }).join("");
  return `<svg class="dsvg" viewBox="${VB.x} ${VB.y} ${VB.w} ${VB.h}" aria-hidden="true">
  <defs>
    <linearGradient id="${p}b" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="${c.c1}"/><stop offset="1" stop-color="${c.c2}"/></linearGradient>
    <linearGradient id="${p}w" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="${c.c1}"/><stop offset="1" stop-color="${c.c2}"/></linearGradient>
  </defs>
  <g class="all">
    <g class="wingF"><g transform="${sc(c.wing,100,88)} translate(7 -3)"><path d="${WING}" fill="${c.c2}"/></g></g>
    <g class="legB2"><path d="${LB}" fill="${c.c2}" transform="translate(9 -2)"/></g>
    <g class="legF2"><path d="${LF}" fill="${c.c2}" transform="translate(9 -2)"/></g>
    <g class="tail"><g transform="${sc(c.tail,70,104)}">
      <path d="M72 97 C52 92 36 102 22 118 L10 128 L26 124 C40 112 54 108 72 114 Z" fill="url(#${p}b)"/>
      <path d="M10 128 L-1 121 L3 135 L16 133 Z" fill="#ffb347"/></g></g>
    <ellipse cx="100" cy="106" rx="36" ry="24" fill="url(#${p}b)"/>
    <ellipse cx="106" cy="115" rx="24" ry="11" fill="${c.belly}" opacity=".75"/>
    <path d="M92 112 h26 M94 118 h22" stroke="${c.c2}" stroke-width="1" opacity=".5"/>
    ${sp}
    <g class="legB"><path d="${LB}" fill="url(#${p}b)"/><path d="M75 138 l-3 3 M82 138 v3.5 M89 138 l3 3" stroke="#e8c49a" stroke-width="1.6" stroke-linecap="round"/></g>
    <g class="legF"><path d="${LF}" fill="url(#${p}b)"/><path d="M110 138 l-3 3 M117 138 v3.5 M124 138 l3 3" stroke="#e8c49a" stroke-width="1.6" stroke-linecap="round"/></g>
    <g class="head"><g transform="${sc(c.head,122,96)}">
      <path d="M116 102 C118 86 126 74 138 66 L152 74 C142 80 136 92 134 108 Z" fill="url(#${p}b)"/>
      <g transform="${sc(c.horn,146,58)}"><path d="M142 56 C138 44 132 38 122 35 C130 44 134 52 136 62 Z" fill="#e8c49a"/><path d="M150 52 C150 40 146 32 139 27 C144 38 146 46 145 55 Z" fill="#d9b48a"/></g>
      <ellipse cx="150" cy="64" rx="18" ry="14" fill="url(#${p}b)"/>
      <g class="jaw"><path d="M148 72 C158 75 170 76 178 73 C176 79 166 82 154 80 Z" fill="${c.c2}"/><path d="M160 76 l2 3 2 -3 M168 76 l2 3 2 -3" fill="#fff" opacity=".85"/></g>
      <path d="M154 57 C166 57 177 61 181 67 C178 72 166 73 156 73 Z" fill="url(#${p}b)"/>
      <circle cx="176" cy="63" r="1.3" fill="#2a0709"/>
      <path d="M135 66 l-9 4 9 3z" fill="#e8c49a"/>
      <g transform="${sc(c.eye,154,62)}">
        <ellipse cx="154" cy="62" rx="5.6" ry="6" fill="#ffd27a"/>
        <ellipse class="pupil" cx="155" cy="62" rx="1.5" ry="4.2" fill="#1a0507"/>
        <circle cx="152.6" cy="59.6" r="1.3" fill="#fff" opacity=".9"/>
        <g class="lid" transform="translate(154 54.8) scale(1 0) translate(-154 -54.8)"><ellipse cx="154" cy="62" rx="6.8" ry="7.2" fill="${c.c1}"/></g>
      </g>
      ${c.crown?`<path class="pulse" d="M138 48 l3 -12 4 8 4 -14 4 14 4 -8 3 12z" fill="#ffb347"/>`:""}
    </g></g>
    <g class="wingN"><g transform="${sc(c.wing,100,88)}">
      <path d="${WING}" fill="url(#${p}w)" stroke="${c.c2}" stroke-width="1"/>
      <path d="M100 88 C94 62 82 40 58 20 M90 80 C80 66 70 60 52 56 M95 84 C88 76 82 72 74 70" stroke="#e8c49a" stroke-width="1.3" fill="none" opacity=".7"/></g></g>
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
    this.parts = {all:q(".all"), wingF:q(".wingF"), wingN:q(".wingN"), legB:q(".legB"), legF:q(".legF"), legB2:q(".legB2"), legF2:q(".legF2"), tail:q(".tail"), head:q(".head"), jaw:q(".jaw"), lid:q(".lid"), pupil:q(".pupil")};
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
  mouth(){ const sx=this.cfg.head>1.2?.42:.36; return {x:this.x+this.face*this.w*sx, y:this.y-this.h*.42}; }

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
        if(this.fireT<=0){ this.fireT=.045; const m=this.mouth(); this.particle("fire",m.x,m.y,this.face*rand(60,100),rand(-12,10),rand(420,600),"",[.5,1.8]); }
        if((this.timer-=dt)<=0){ this.state="idle"; this.timer=rand(1.5,3); }
        break; }
      case "chase": {
        const e=this.embers[0];
        if(!e){ this.state = this.y<this.ground-2 && c.fly ? "land" : "idle"; this.timer=rand(1,2); break; }
        const side = e.x>=this.x?1:-1, reach=this.w*.34;
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
        if(c.fire && Math.random()<dt*.8){ this.state="free"; const m=this.mouth(); for(let i=0;i<8;i++) setTimeout(()=>{ const mm=this.mouth(); this.particle("fire",mm.x,mm.y,this.face*rand(60,100),rand(-10,10),500,"",[.5,1.8]); },i*45); }
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
    const breath=1+Math.sin(t*(sleeping?1.4:2.4))*.018;
    set(P.all, `translate(0 ${sleeping?4:0}) ${sc(1,100,138)} translate(100 138) scale(${1/breath} ${breath}) translate(-100 -138)`);
    // wings: rest folded along the back, flap when flying
    let wa;
    if(flap>0) wa=-14+Math.sin(t*(c.fly?13:17))*32*flap;
    else if(happy) wa=-18+Math.sin(t*18)*16;
    else wa=sleeping?-34:-28+Math.sin(t*1.3)*3;
    set(P.wingN,`rotate(${wa} 100 88)`); set(P.wingF,`rotate(${wa+6} 100 88)`);
    // legs
    let la=0; if(walking) la=Math.sin(this.walkPh)*24; else if(flap>0 && this.y<this.ground-4) la=26;
    const tuck = !walking && la!==0;
    set(P.legB,`rotate(${la} 84 114)`); set(P.legF,`rotate(${tuck?la:-la} 116 114)`);
    set(P.legB2,`rotate(${tuck?la:-la} 92 112)`); set(P.legF2,`rotate(${la} 124 112)`);
    // tail
    const ta=Math.sin(t*2)*6+(happy?Math.sin(t*14)*14:0)+(flap>0?-8:0);
    set(P.tail,`rotate(${ta} 70 104)`);
    // head
    let ha=Math.sin(t*2.4+1)*2;
    if(sleeping) ha=14; if(this.state==="fire") ha=-6;
    if(this.look && t-this.look.t<2 && !sleeping){ ha += Math.max(-10,Math.min(10,((this.look.y-(this.y-this.h*.6))/40)))*this.face*1; }
    set(P.head,`rotate(${ha} 122 96)`);
    set(P.jaw,`rotate(${(this.state==="fire"||this.jawT>0)?22:0} 150 73)`);
    // eyes
    this.blinkT-=1/60; if(this.blinkT<=0){ this.blinkLeft=.12; this.blinkT=rand(2.5,6); }
    if(this.blinkLeft>0) this.blinkLeft-=1/60;
    const k = sleeping||this.blinkLeft>0 ? 1 : happy ? .55 : 0;
    set(P.lid,`translate(154 54.8) scale(1 ${k}) translate(-154 -54.8)`);
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
