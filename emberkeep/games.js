/* Emberkeep Ember Arcade: three skill games starring Cinder. Canvas, touch-first. */
(function(){
"use strict";
const rand=(a,b)=>a+Math.random()*(b-a);
const pick=a=>a[Math.floor(Math.random()*a.length)];
const clamp=(v,a,b)=>Math.max(a,Math.min(b,v));

const GAMES = [
  {id:"flight", name:"Ember Flight", cost:10, skill:"Timing", unit:"gates",
   desc:"Tap to flap. Guide Cinder through the cave without touching the rocks. Grab embers for bonus points.",
   how:"Tap anywhere to flap"},
  {id:"storm", name:"Craving Storm", cost:25, skill:"Reflexes", unit:"points",
   desc:"Junk food rains down. Drag Cinder left and right to dodge it. Catch water, eggs and greens to score.",
   how:"Drag to move · 3 hearts"},
  {id:"pulse", name:"Ember Pulse", cost:50, skill:"Precision", unit:"points",
   desc:"A ring of fire shrinks toward the target. Tap the moment they line up. Perfect hits build a combo multiplier.",
   how:"Tap when the rings match · 3 lives"}
];

// ---------- shared drawing ----------
function caveBG(g, t){
  const {ctx,W,H}=g;
  const night=document.documentElement.dataset.time==="night";
  const gr=ctx.createLinearGradient(0,0,0,H);
  gr.addColorStop(0, night?"#03030a":"#0d0b12"); gr.addColorStop(.6, night?"#0a0a16":"#17131d"); gr.addColorStop(1, night?"#151020":"#241619");
  ctx.fillStyle=gr; ctx.fillRect(0,0,W,H);
  const glow=ctx.createRadialGradient(W/2,H*1.05,10,W/2,H*1.05,H*.7);
  glow.addColorStop(0,"rgba(255,90,36,.22)"); glow.addColorStop(1,"rgba(255,90,36,0)");
  ctx.fillStyle=glow; ctx.fillRect(0,0,W,H);
  // drifting motes
  for(const m of g.motes){ m.y-=m.v*g.dt; m.x+=Math.sin(t*m.f+m.p)*.3; if(m.y<-5){ m.y=H+5; m.x=rand(0,W); }
    ctx.globalAlpha=m.a; ctx.fillStyle="#ffb347"; ctx.beginPath(); ctx.arc(m.x,m.y,m.r,0,6.283); ctx.fill(); }
  ctx.globalAlpha=1;
}
function drawParticles(g){
  const {ctx}=g;
  g.parts=g.parts.filter(p=>(p.life-=g.dt)>0);
  for(const p of g.parts){
    p.x+=p.vx*g.dt; p.y+=p.vy*g.dt; p.vy+=(p.g||0)*g.dt;
    const k=p.life/p.max;
    if(p.text){ ctx.globalAlpha=Math.min(1,k*1.5); ctx.fillStyle=p.c; ctx.font=`700 ${p.s}px "Barlow Condensed",system-ui,sans-serif`; ctx.textAlign="center"; ctx.fillText(p.text,p.x,p.y); }
    else { ctx.globalAlpha=k; ctx.fillStyle=p.c; ctx.beginPath(); ctx.arc(p.x,p.y,p.s*(.4+k*.6),0,6.283); ctx.fill(); }
  }
  ctx.globalAlpha=1;
}
function burst(g,x,y,n,c,spd){
  for(let i=0;i<n;i++){ const a=rand(0,6.283), v=rand(40,spd||220); g.parts.push({x,y,vx:Math.cos(a)*v,vy:Math.sin(a)*v,life:rand(.4,.9),max:.9,s:rand(2,4.5),c:c||pick(["#ffb347","#ff7a2b","#ffd27a"]),g:120}); }
}
function floatText(g,x,y,text,c,s){ g.parts.push({x,y,vx:0,vy:-60,life:.9,max:.9,text,c:c||"#ffd27a",s:s||26}); }
function drawSprite(g,x,y,w,rot,squash){
  if(!g.sprite.complete) return;
  const h=w*170/230, {ctx}=g;
  ctx.save(); ctx.translate(x,y); if(rot) ctx.rotate(rot); if(squash) ctx.scale(1+squash,1-squash);
  ctx.shadowColor="rgba(255,130,60,.45)"; ctx.shadowBlur=14;
  ctx.drawImage(g.sprite,-w*.522,-h*.6,w,h);
  ctx.restore();
}
function hearts(g,n,max){
  const {ctx}=g; ctx.font=`22px system-ui,"Apple Color Emoji",sans-serif`; ctx.textAlign="left";
  ctx.textAlign="right";
  for(let i=0;i<max;i++){ ctx.globalAlpha=i<n?1:.22; ctx.fillStyle="#ff5a6a"; ctx.fillText("♥", g.W-16-(max-1-i)*26, g.top+38); }
  ctx.globalAlpha=1;
}

// ---------- game 1: Ember Flight ----------
function Flight(g){
  let y,vy,cols,dist,score,flapT,dead;
  const R=22, X=()=>g.W*.28;
  return {
    init(){ y=g.H*.45; vy=0; cols=[]; dist=200; score=0; flapT=0; dead=false; },
    tap(){ if(dead) return; vy=-430; flapT=.18; burst(g,X()-18,y+10,5,"#ff9a4a",90); },
    update(dt,t){
      vy=Math.min(vy+1350*dt,720); y+=vy*dt; flapT=Math.max(0,flapT-dt);
      const speed=Math.min(330,175+score*4.5), gap=Math.max(138, Math.min(200,g.H*.27)-score*1.6), w=64;
      dist+=speed*dt;
      if(dist>=250){ dist=0; const top=rand(g.top+70, g.H-110-gap); cols.push({x:g.W+30,top,gap,w,passed:false,ember:Math.random()<.75,jag:Array.from({length:4},()=>rand(8,22))}); }
      for(const c of cols){ c.x-=speed*dt;
        if(!c.passed && c.x+c.w<X()-R){ c.passed=true; score++; g.setScore(score); }
        if(c.ember){ const ex=c.x+c.w/2, ey=c.top+c.gap/2; if(Math.hypot(ex-X(),ey-y)<R+12){ c.ember=false; score++; g.setScore(score); burst(g,ex,ey,14); floatText(g,ex,ey-10,"+1"); } }
        const hit = X()+R*.72>c.x && X()-R*.72<c.x+c.w && (y-R*.7<c.top || y+R*.7>c.top+c.gap);
        if(hit && !dead){ dead=true; burst(g,X(),y,30,"#ff5a24",260); g.over(score); }
      }
      cols=cols.filter(c=>c.x>-90);
      if((y+R>g.H-14 || y-R<g.top+4) && !dead){ dead=true; burst(g,X(),y,30,"#ff5a24",260); g.over(score); }
    },
    draw(t){
      const {ctx}=g; caveBG(g,t);
      for(const c of cols){
        for(const [y0,y1,dir] of [[0,c.top,1],[c.top+c.gap,g.H,-1]]){
          const gr=ctx.createLinearGradient(c.x,0,c.x+c.w,0); gr.addColorStop(0,"#1a1620"); gr.addColorStop(.5,"#2a2430"); gr.addColorStop(1,"#141118");
          ctx.fillStyle=gr; ctx.beginPath();
          const tip = dir===1 ? c.top : c.top+c.gap;
          if(dir===1){ ctx.moveTo(c.x,0); ctx.lineTo(c.x,tip-c.jag[0]); ctx.lineTo(c.x+c.w*.25,tip-c.jag[1]*.3); ctx.lineTo(c.x+c.w*.5,tip); ctx.lineTo(c.x+c.w*.75,tip-c.jag[2]*.4); ctx.lineTo(c.x+c.w,tip-c.jag[3]); ctx.lineTo(c.x+c.w,0); }
          else { ctx.moveTo(c.x,g.H); ctx.lineTo(c.x,tip+c.jag[3]); ctx.lineTo(c.x+c.w*.3,tip+c.jag[2]*.3); ctx.lineTo(c.x+c.w*.55,tip); ctx.lineTo(c.x+c.w*.8,tip+c.jag[1]*.4); ctx.lineTo(c.x+c.w,tip+c.jag[0]); ctx.lineTo(c.x+c.w,g.H); }
          ctx.closePath(); ctx.fill();
          ctx.strokeStyle="rgba(255,122,43,.55)"; ctx.lineWidth=1.5; ctx.stroke();
        }
        if(c.ember){ const ex=c.x+c.w/2, ey=c.top+c.gap/2, r=7+Math.sin(t*6)*1.5;
          const eg=ctx.createRadialGradient(ex,ey,0,ex,ey,r*3); eg.addColorStop(0,"#fff3c4"); eg.addColorStop(.35,"#ffb347"); eg.addColorStop(1,"rgba(255,74,43,0)");
          ctx.fillStyle=eg; ctx.beginPath(); ctx.arc(ex,ey,r*3,0,6.283); ctx.fill(); }
      }
      drawParticles(g);
      if(!dead) drawSprite(g,X(),y,82,clamp(vy/1100,-.45,.8),flapT>0?-.08:0);
    }
  };
}

// ---------- game 2: Craving Storm ----------
function Storm(g){
  const BAD=["🍔","🍩","🍟","🍕","🥤","🍫","🍰","🌭","🧁","🍪"];
  const GOOD=[{e:"💧",p:3},{e:"🥚",p:5},{e:"🥦",p:5},{e:"🍗",p:4}];
  let x,tx,items,spawnT,score,acc,lives,inv,t0,dead;
  return {
    init(){ x=tx=g.W/2; items=[]; spawnT=.6; score=0; acc=0; lives=3; inv=0; t0=0; dead=false; },
    move(px){ tx=px; }, tap(px){ tx=px; },
    update(dt){
      t0+=dt; inv=Math.max(0,inv-dt);
      x+= (tx-x)*Math.min(1,dt*12); x=clamp(x,30,g.W-30);
      acc+=dt; if(acc>=1){ acc-=1; score++; g.setScore(score); }
      spawnT-=dt;
      if(spawnT<=0){ spawnT=Math.max(.26,.85-t0*.012);
        const good=Math.random()<.22, it=good?pick(GOOD):{e:pick(BAD)};
        items.push({x:rand(26,g.W-26), y:g.top+20, vy:rand(170,250)+t0*5.5, e:it.e, p:it.p||0, good, rot:rand(-1,1), vr:rand(-2,2), s:good?34:40});
      }
      const py=g.H-110;
      for(const it of items){ it.y+=it.vy*dt; it.rot+=it.vr*dt;
        if(Math.abs(it.x-x)<34 && Math.abs(it.y-py)<34){
          it.dead=true;
          if(it.good){ score+=it.p; g.setScore(score); burst(g,it.x,it.y,12,"#7fe3ff",160); floatText(g,it.x,it.y-20,`+${it.p}`,"#9fe8ff"); }
          else if(inv<=0){ lives--; inv=1.1; burst(g,x,py,22,"#ff4a5a",220); floatText(g,x,py-50,pick(["Not today!","Resist!","Stay strong!"]),"#ff8a8a",22);
            if(lives<=0 && !dead){ dead=true; g.over(score); } }
        }
        if(it.y>g.H+40) it.dead=true;
      }
      items=items.filter(i=>!i.dead);
    },
    draw(t){
      const {ctx}=g; caveBG(g,t);
      ctx.textAlign="center"; ctx.textBaseline="middle";
      for(const it of items){ ctx.save(); ctx.translate(it.x,it.y); ctx.rotate(it.rot); ctx.font=`${it.s}px system-ui,"Apple Color Emoji",sans-serif`;
        if(it.good){ ctx.shadowColor="#7fe3ff"; ctx.shadowBlur=14; } ctx.fillText(it.e,0,0); ctx.restore(); }
      ctx.textBaseline="alphabetic";
      // ground
      ctx.fillStyle="rgba(0,0,0,.35)"; ctx.beginPath(); ctx.ellipse(x,g.H-74,34,7,0,0,6.283); ctx.fill();
      drawParticles(g);
      if(!dead && !(inv>0 && Math.floor(t*14)%2)) drawSprite(g,x,g.H-110,96,Math.sin(t*10)*.04*(Math.abs(tx-x)>4?1:0));
      hearts(g,lives,3);
    }
  };
}

// ---------- game 3: Ember Pulse ----------
function Pulse(g){
  let r,tr,R0,v,score,combo,lives,flash,dead,msgT;
  const cx=()=>g.W/2, cy=()=>g.H*.5;
  function next(delay){ R0=Math.min(g.W,g.H)*.44; tr=rand(56, R0*.72); r=R0+(delay?v*.6:0); }
  function miss(){ lives--; combo=0; flash=.25; floatText(g,cx(),cy()-R0-6,"Miss","#ff8a8a",28); if(lives<=0 && !dead){ dead=true; g.over(score); } else next(true); }
  return {
    init(){ v=115; score=0; combo=0; lives=3; flash=0; dead=false; next(); },
    tap(){
      if(dead) return;
      const d=Math.abs(r-tr), mult=1+Math.floor(combo/5);
      if(d<=6){ combo++; score+=3*mult; burst(g,cx(),cy(),30); floatText(g,cx(),cy()-tr-12,mult>1?`PERFECT x${mult}`:"PERFECT","#ffd27a",30); v=Math.min(420,v+9); }
      else if(d<=16){ combo++; score+=1*mult; burst(g,cx(),cy(),12,"#ff9a4a",150); floatText(g,cx(),cy()-tr-12,"Good","#ffb347",26); v=Math.min(420,v+6); }
      else return miss();
      g.setScore(score); next();
    },
    update(dt){ flash=Math.max(0,flash-dt); r-=v*dt; if(r<tr-18 && !dead) miss(); },
    draw(t){
      const {ctx}=g; caveBG(g,t);
      if(flash>0){ ctx.fillStyle=`rgba(255,74,90,${flash})`; ctx.fillRect(0,0,g.W,g.H); }
      // target
      ctx.save(); ctx.setLineDash([6,8]); ctx.lineDashOffset=-t*20; ctx.strokeStyle="rgba(255,210,122,.9)"; ctx.lineWidth=3;
      ctx.beginPath(); ctx.arc(cx(),cy(),tr,0,6.283); ctx.stroke(); ctx.restore();
      ctx.strokeStyle="rgba(255,210,122,.15)"; ctx.lineWidth=32; ctx.beginPath(); ctx.arc(cx(),cy(),tr,0,6.283); ctx.stroke();
      // shrinking ring
      const close=Math.abs(r-tr)<=16;
      ctx.shadowColor=close?"#ffd27a":"#ff5a24"; ctx.shadowBlur=close?26:16;
      ctx.strokeStyle=close?"#ffd27a":"#ff5a24"; ctx.lineWidth=6; ctx.beginPath(); ctx.arc(cx(),cy(),Math.max(1,r),0,6.283); ctx.stroke();
      ctx.shadowBlur=0;
      drawSprite(g,cx(),cy()+14,Math.min(110,tr*1.25),0,Math.sin(t*3)*.02);
      drawParticles(g);
      hearts(g,lives,3);
      if(combo>=2){ ctx.fillStyle="#ffb347"; ctx.font=`700 20px "Barlow Condensed",system-ui,sans-serif`; ctx.textAlign="right"; ctx.fillText(`Combo ${combo}  ·  x${1+Math.floor(combo/5)}`, g.W-16, g.top+68); }
    }
  };
}
const FACTORY={flight:Flight, storm:Storm, pulse:Pulse};
const QUIPS=["Discipline is a skill. So is this.","Again! I'm just warming up.","Every master was once a hatchling.","Breathe. Focus. One more try.","You held a fast. You can hold this."];

// ---------- runner ----------
function open(id, opts){
  const def=GAMES.find(x=>x.id===id); if(!def) return;
  const ov=document.createElement("div"); ov.className="gwrap"; ov.setAttribute("role","dialog"); ov.setAttribute("aria-label",def.name);
  ov.innerHTML=`<canvas></canvas>
    <div class="ghud"><button class="gx" type="button" aria-label="Exit game">✕</button><div class="gsc"><b class="gscore">0</b><span class="gbest"></span></div><span class="gsp"></span></div>
    <div class="gmsg"><p class="label gkicker"></p><h3></h3><p class="gtext"></p><p class="ghow"></p><div class="gbtns"><button class="primary gplay" type="button">Play</button><button class="gexit" type="button">Exit</button></div></div>`;
  document.body.append(ov); document.body.classList.add("gaming");
  const cv=ov.querySelector("canvas"), ctx=cv.getContext("2d");
  const g={ctx, W:0, H:0, top:0, dt:0, parts:[], motes:[], sprite:new Image()};
  g.sprite.src=opts.sprite;
  let best=opts.best||0, state="ready", raf=0, last=0, t=0, game=FACTORY[id](g), score=0;
  const sc=ov.querySelector(".gscore"), bestEl=ov.querySelector(".gbest"), msg=ov.querySelector(".gmsg");
  bestEl.textContent=`Best ${best}`;
  function size(){
    const dpr=Math.min(2,devicePixelRatio||1); g.W=innerWidth; g.H=innerHeight;
    cv.width=g.W*dpr; cv.height=g.H*dpr; cv.style.width=g.W+"px"; cv.style.height=g.H+"px"; ctx.setTransform(dpr,0,0,dpr,0,0);
    g.top=Math.max(0,(parseFloat(getComputedStyle(ov.querySelector(".ghud")).paddingTop)||10)-10);
    if(!g.motes.length) g.motes=Array.from({length:26},()=>({x:rand(0,g.W),y:rand(0,g.H),v:rand(8,26),r:rand(.6,1.8),a:rand(.15,.5),f:rand(.5,1.5),p:rand(0,6)}));
  }
  size(); addEventListener("resize",size);
  function showMsg(kicker,title,text,how,playLabel){
    ov.querySelector(".gkicker").textContent=kicker; ov.querySelector("h3").textContent=title;
    ov.querySelector(".gtext").textContent=text; ov.querySelector(".ghow").textContent=how||"";
    ov.querySelector(".gplay").textContent=playLabel; msg.hidden=false;
  }
  g.setScore=n=>{ score=n; sc.textContent=n; };
  g.over=final=>{
    state="over";
    setTimeout(()=>{
      const nb=final>best; if(nb) best=final; bestEl.textContent=`Best ${best}`;
      opts.onEnd&&opts.onEnd(final);
      showMsg(nb?"New best!":"Game over", `${final} ${def.unit}`, nb?"Cinder roars with pride.":pick(QUIPS), `Best ${best}`, "Play again");
    },650);
  };
  function start(){ msg.hidden=true; g.parts=[]; game=FACTORY[id](g); game.init(); g.setScore(0); state="play"; }
  ov.querySelector(".gplay").onclick=e=>{ e.stopPropagation(); start(); };
  const close=()=>{ cancelAnimationFrame(raf); removeEventListener("resize",size); document.removeEventListener("visibilitychange",vis); ov.remove(); document.body.classList.remove("gaming"); opts.onClose&&opts.onClose(); };
  ov.querySelector(".gexit").onclick=close; ov.querySelector(".gx").onclick=close;
  cv.addEventListener("pointerdown",e=>{ e.preventDefault(); if(state==="play") game.tap && game.tap(e.clientX,e.clientY); });
  cv.addEventListener("pointermove",e=>{ if(state==="play" && game.move && (e.pointerType!=="mouse"||e.buttons)) game.move(e.clientX,e.clientY); });
  const vis=()=>{ if(document.hidden && state==="play"){ state="paused"; showMsg("Paused",def.name,"Take a breath.","", "Resume"); ov.querySelector(".gplay").onclick=e=>{ e.stopPropagation(); msg.hidden=true; state="play"; last=performance.now(); ov.querySelector(".gplay").onclick=ev=>{ ev.stopPropagation(); start(); }; }; } };
  document.addEventListener("visibilitychange",vis);
  showMsg(`${def.skill} game`, def.name, def.desc, def.how, "Play");
  game.init();
  const loop=now=>{ const dt=Math.min(.033,(now-last)/1000||0); last=now; t+=dt; g.dt=dt; if(state==="play") game.update(dt,t); game.draw(t); raf=requestAnimationFrame(loop); };
  raf=requestAnimationFrame(n=>{ last=n; loop(n); });
}

window.Arcade={GAMES, open};
})();
