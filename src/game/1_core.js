// ================= core: canvas, layout, safe area, input, utils, persistence =================
const cv=document.getElementById('c');let X=cv.getContext('2d',{alpha:false});const X0=X;
const Q=location.search,DEBUG=/[?&]debug=1/.test(Q),OGMODE=/[?&]og=1/.test(Q);
const SAFE_DBG=DEBUG&&Q.match(/[?&]safe=(\d+),(\d+)/);
const FONT='"Baloo2Z","Baloo 2","Arial Rounded MT Bold","Trebuchet MS",system-ui,sans-serif';
let SW=0,SH=0,DPR=1,SC=1,RS=1,W=400,H=760,TOP=0,BOT=0,INL=0,INR=0,QUAL=1,genCache=0;
const QUALS=[1,0.8,0.66];let qualI=0;
// in standalone (Home Screen) mode the canvas runs under the status bar / notch / home indicator: measure env(safe-area-inset-*)
const insEl=document.createElement('div');insEl.style.cssText='position:fixed;left:0;top:0;width:0;height:0;padding:env(safe-area-inset-top) env(safe-area-inset-right) env(safe-area-inset-bottom) env(safe-area-inset-left);visibility:hidden;pointer-events:none';document.body.appendChild(insEl);
function resize(){SW=innerWidth;SH=innerHeight;
  // older iPhones: cap the backing store at 2x and let the adaptive quality step drop it further if frames get slow
  DPR=Math.min(devicePixelRatio||1,2)*QUAL;
  SC=Math.min(SW/400,SH/560);W=SW/SC;H=SH/SC;RS=SC*DPR;
  const cs=getComputedStyle(insEl);let t=parseFloat(cs.paddingTop)||0,b=parseFloat(cs.paddingBottom)||0;
  if(SAFE_DBG){t=+SAFE_DBG[1];b=+SAFE_DBG[2]}
  TOP=t/SC;BOT=b/SC;INL=(parseFloat(cs.paddingLeft)||0)/SC;INR=(parseFloat(cs.paddingRight)||0)/SC;
  cv.width=Math.round(SW*DPR);cv.height=Math.round(SH*DPR);cv.style.width=SW+'px';cv.style.height=SH+'px';genCache++}
addEventListener('resize',resize);addEventListener('orientationchange',()=>setTimeout(resize,250));resize();setTimeout(resize,300);
const R=Math.random,rr=(a,b)=>a+R()*(b-a),pick=a=>a[(R()*a.length)|0],clamp=(v,a,b)=>v<a?a:v>b?b:v,lerp=(a,b,t)=>a+(b-a)*t,TAU=Math.PI*2;
const ease=t=>t<0?0:t>1?1:1-Math.pow(1-t,3),back=t=>{t=clamp(t,0,1);const c=1.7;return 1+(c+1)*Math.pow(t-1,3)+c*Math.pow(t-1,2)};
let seed=1;const srand=()=>{seed=(seed*16807)%2147483647;return (seed-1)/2147483646},srr=(a,b)=>a+srand()*(b-a);
// ---------- playfield ----------
const GY=()=>H-Math.max(BOT,8)-92;            // feet line on the sand
const YMIN=()=>TOP+86;                          // below the HUD (which sits below the status bar / notch)
const YMAX=()=>GY()-34;
const XMIN=()=>INL+36,XMAX=()=>boss?W-INR-40:W*0.78;
// ---------- persistence ----------
const LS={get:(k,d)=>{try{const v=localStorage.getItem('fts_'+k);return v==null?d:v}catch(e){return d}},set:(k,v)=>{try{localStorage.setItem('fts_'+k,v)}catch(e){}}};
let diff=+LS.get('diff',0)||0,best=+LS.get('best'+diff,0)||0,bestWave=+LS.get('bestwave',0)||0;
// ---------- drawing helpers ----------
function txt(s,x,y,size,fill,o){o=o||{};X.font=(o.wt||'800 ')+size+'px '+FONT;X.textAlign=o.a||'center';X.textBaseline='middle';
  if(o.st){X.lineJoin='round';X.lineWidth=o.sw||size*0.22;X.strokeStyle=o.st;X.strokeText(s,x,y)}X.fillStyle=fill;X.fillText(s,x,y)}
function rrect(x,y,w,h,r){r=Math.min(r,w/2,h/2);X.beginPath();X.moveTo(x+r,y);X.arcTo(x+w,y,x+w,y+h,r);X.arcTo(x+w,y+h,x,y+h,r);X.arcTo(x,y+h,x,y,r);X.arcTo(x,y,x+w,y,r);X.closePath()}
function circ(x,y,r,c){X.beginPath();X.arc(x,y,r,0,TAU);X.fillStyle=c;X.fill()}
function ell(x,y,rx,ry,c,rot){X.beginPath();X.ellipse(x,y,rx,ry,rot||0,0,TAU);X.fillStyle=c;X.fill()}
function poly(pts,c){X.beginPath();X.moveTo(pts[0],pts[1]);for(let i=2;i<pts.length;i+=2)X.lineTo(pts[i],pts[i+1]);X.closePath();X.fillStyle=c;X.fill()}
function strokeC(c,w){X.strokeStyle=c;X.lineWidth=w;X.lineCap='round';X.lineJoin='round';X.stroke()}
function star5(x,y,r,fill,rot){X.beginPath();for(let i=0;i<10;i++){const a=(rot||0)-Math.PI/2+i*Math.PI/5,rad=i%2?r*0.48:r;X.lineTo(x+Math.cos(a)*rad,y+Math.sin(a)*rad)}X.closePath();X.fillStyle=fill;X.fill()}
function heartP(x,y,s,c){X.beginPath();X.moveTo(x,y+s*0.35);X.bezierCurveTo(x-s*1.1,y-s*0.35,x-s*0.45,y-s*1.05,x,y-s*0.45);X.bezierCurveTo(x+s*0.45,y-s*1.05,x+s*1.1,y-s*0.35,x,y+s*0.35);X.fillStyle=c;X.fill()}
// ---------- sprite cache: vector art rendered once per resolution, then blitted (fast on older iPhones) ----------
const SPR={};
function spr(key,w,h,fn){let s=SPR[key];if(s&&s.g===genCache)return s;const c=document.createElement('canvas');c.width=Math.max(1,Math.ceil(w*RS));c.height=Math.max(1,Math.ceil(h*RS));
  const x=c.getContext('2d');x.scale(RS,RS);x.translate(w/2,h/2);const keep=X;X=x;try{fn()}finally{X=keep}s=SPR[key]={c,w,h,g:genCache};return s}
function blit(s,x,y,sc){sc=sc||1;X.drawImage(s.c,x-s.w*sc/2,y-s.h*sc/2,s.w*sc,s.h*sc)}
// ---------- input: floating left-thumb joystick + right-side POOP (hold = rapid fire), SWOOP and MEGA buttons. Full multi-touch. ----------
const ptrs=new Map(),keys={};let poopHeld=0,poopTap=0,megaQ=0,swoopQ=0;
const joy={id:null,ox:0,oy:0,kx:0,ky:0,dx:0,dy:0},JR=58;
const toG=e=>({x:e.clientX/SC,y:e.clientY/SC});
function poopBtn(){const r=Math.min(54,W*0.13);return{x:W-INR-r-16,y:H-Math.max(BOT,8)-r-16,r}}
function swoopBtn(){const p=poopBtn();return{x:p.x+p.r*0.15,y:p.y-p.r-44,r:34}}
function megaBtn(){const p=poopBtn();return{x:p.x-p.r-46,y:p.y+p.r*0.25,r:34}}
function inR(p,b){return p.x>=b.x&&p.x<=b.x+b.w&&p.y>=b.y&&p.y<=b.y+b.h}
const nearB=(p,b,s)=>Math.hypot(p.x-b.x,p.y-b.y)<b.r+(s||10);
function recountPoop(){poopHeld=0;for(const q of ptrs.values())if(q.role==='poop')poopHeld++}
cv.addEventListener('pointerdown',e=>{e.preventDefault();const p=toG(e);
  if(state!=='play'||paused){uiTap(p);return}
  for(const b of HUDB)if(inR(p,b)){b.fn();return}
  let role='none';
  if(megaReady()&&nearB(p,megaBtn(),8)){megaQ=1;role='btn'}
  else if(nearB(p,swoopBtn(),8)){swoopQ=1;role='btn'}
  else if(nearB(p,poopBtn(),22)||(p.x>W*0.5&&joy.id!==e.pointerId)){role='poop';poopTap=1}
  else if(joy.id==null){role='joy';joy.id=e.pointerId;joy.ox=joy.kx=p.x;joy.oy=joy.ky=p.y;joy.dx=joy.dy=0}else{role='poop';poopTap=1}
  ptrs.set(e.pointerId,{role});recountPoop()},{passive:false});
cv.addEventListener('pointermove',e=>{if(e.pointerId!==joy.id)return;const p=toG(e);let dx=p.x-joy.ox,dy=p.y-joy.oy,d=Math.hypot(dx,dy);
  // if the thumb slides past the rim, drag the base along so reversing direction is instant
  if(d>JR*1.25){const k=(d-JR*1.25)/d;joy.ox+=dx*k;joy.oy+=dy*k;dx=p.x-joy.ox;dy=p.y-joy.oy;d=Math.hypot(dx,dy)}
  joy.kx=p.x;joy.ky=p.y;const m=Math.min(1,d/JR);joy.dx=d?dx/d*m:0;joy.dy=d?dy/d*m:0},{passive:false});
const endP=e=>{if(e.pointerId===joy.id){joy.id=null;joy.dx=joy.dy=0}ptrs.delete(e.pointerId);recountPoop()};
['pointerup','pointercancel','lostpointercapture'].forEach(n=>cv.addEventListener(n,endP));
function resetInput(){ptrs.clear();joy.id=null;joy.dx=joy.dy=0;poopHeld=0}
addEventListener('keydown',e=>{if(state==='play'){if(e.code==='Space'){if(!keys.Space)poopTap=1}if(e.code==='KeyX')swoopQ=1;if(e.code==='KeyZ'&&megaReady())megaQ=1}keys[e.code]=1;if(e.code==='Space'||e.code.startsWith('Arrow'))e.preventDefault();
  if(state!=='play'&&(e.code==='Enter'||e.code==='Space'))uiKey()});
addEventListener('keyup',e=>{keys[e.code]=0});
